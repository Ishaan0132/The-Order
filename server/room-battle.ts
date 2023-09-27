/**
 * Room Battle
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This file wraps the simulator in an implementation of the RoomGame
 * interface. It also abstracts away the multi-process nature of the
 * simulator.
 *
 * For the actual battle simulation, see sim/
 *
 * @license MIT
 */

import {FS, Repl, ProcessManager, Utils} from '../lib';
import {execSync} from "child_process";
import {BattleStream} from "../sim/battle-stream";
import * as RoomGames from "./room-game";
import type {Tournament} from './tournaments/index';
import {RoomSettings} from './rooms';

type ChannelIndex = 0 | 1 | 2 | 3 | 4;
export type PlayerIndex = 1 | 2 | 3 | 4;
export type ChallengeType = 'rated' | 'unrated' | 'challenge' | 'tour';

interface BattleRequestTracker {
	rqid: number;
	request: string;
	/**
	 * - true = user has decided,
	 * - false = user has yet to decide,
	 * - 'cantUndo' = waiting on other user (U-turn, faint-switch) or uncancellable (trapping ability)
	 */
	isWait: 'cantUndo' | true | false;
	choice: string;
}

/** 5 seconds */
const TICK_TIME = 5;
const SECONDS = 1000;

// Timer constants: In seconds, should be multiple of TICK_TIME
const STARTING_TIME = 150;
const MAX_TURN_TIME = 150;
const STARTING_TIME_CHALLENGE = 300;
const STARTING_GRACE_TIME = 60;
const MAX_TURN_TIME_CHALLENGE = 300;

const DISCONNECTION_TIME = 60;
const DISCONNECTION_BANK_TIME = 300;

// time after a player disabling the timer before they can re-enable it
const TIMER_COOLDOWN = 20 * SECONDS;
const LOCKDOWN_PERIOD = 30 * 60 * 1000; // 30 minutes

export class RoomBattlePlayer extends RoomGames.RoomGamePlayer<RoomBattle> {
	readonly slot: SideID;
	readonly channelIndex: ChannelIndex;
	request: BattleRequestTracker;
	hitDisconnectLimit = false;
	wantsTie: boolean;
	wantsOpenTeamSheets: boolean | null;
	active: boolean;
	eliminated: boolean;
	/**
	 * Total timer.
	 *
	 * Starts at 210 per player in a ladder battle. Goes down by 5
	 * every tick. Goes up by 10 every turn (with some complications -
	 * see `nextRequest`), capped at starting time. The player loses if
	 * this reaches 0.
	 *
	 * The equivalent of "Your Time" in VGC.
	 *
	 */
	secondsLeft: number;
	/**
	 * Turn timer.
	 *
	 * Set equal to the player's overall timer, but capped at 150
	 * seconds in a ladder battle. Goes down by 5 every tick.
	 * Tracked separately from the overall timer, and the player also
	 * loses if this reaches 0.
	 */
	turnSecondsLeft: number;
	/**
	 * Disconnect timer.
	 * Starts at 60 seconds. While the player is disconnected, this
	 * will go down by 5 every tick. Tracked separately from the
	 * overall timer, and the player also loses if this reaches 0.
	 *
	 * Mostly exists so impatient players don't have to wait the full
	 * 150 seconds against a disconnected opponent.
 	*/
	dcSecondsLeft: number;
	/**
	 * Used to track a user's last known connection status, and display
	 * the proper message when it changes.
	 */
	connected: boolean;
	invite: ID;
	/**
	 * Has the simulator received this player's team yet?
	 * Basically always yes except when creating a 4-player battle,
	 * in which case players will need to bring their own team.
	 */
	hasTeam: boolean;
	constructor(user: User | string | null, game: RoomBattle, num: PlayerIndex) {
		super(user, game, num);
		if (typeof user === 'string') user = null;

		this.slot = `p${num}` as SideID;
		this.channelIndex = (game.gameType === 'multi' && num > 2 ? num - 2 : num) as ChannelIndex;

		this.request = {rqid: 0, request: '', isWait: 'cantUndo', choice: ''};
		this.wantsTie = false;
		this.wantsOpenTeamSheets = null;
		this.active = true;
		this.eliminated = false;

		this.secondsLeft = 1;
		this.turnSecondsLeft = 1;
		this.dcSecondsLeft = 1;

		this.connected = true;
		this.invite = '';
		this.hasTeam = false;

		if (user) {
			user.games.add(this.game.roomid);
			user.updateSearch();
			for (const connection of user.connections) {
				if (connection.inRooms.has(game.roomid)) {
					Sockets.channelMove(connection.worker, this.game.roomid, this.channelIndex, connection.socketid);
				}
			}
		}
	}
	getUser() {
		return (this.id && Users.get(this.id)) || null;
	}
	unlinkUser() {
		const user = this.getUser();
		if (user) {
			for (const connection of user.connections) {
				Sockets.channelMove(connection.worker, this.game.roomid, 0, connection.socketid);
			}
			user.games.delete(this.game.roomid);
			user.updateSearch();
		}
		this.id = '';
		this.connected = false;
		this.active = false;
	}
	updateChannel(user: User | Connection) {
		if (user instanceof Users.Connection) {
			// "user" is actually a connection
			Sockets.channelMove(user.worker, this.game.roomid, this.channelIndex, user.socketid);
			return;
		}
		for (const connection of user.connections) {
			Sockets.channelMove(connection.worker, this.game.roomid, this.channelIndex, connection.socketid);
		}
	}

	toString() {
		return this.id;
	}
	send(data: string) {
		const user = this.getUser();
		if (user) user.send(data);
	}
	sendRoom(data: string) {
		const user = this.getUser();
		if (user) user.sendTo(this.game.roomid, data);
	}
}

export class RoomBattleTimer {
	readonly battle: RoomBattle;
	readonly timerRequesters: Set<ID>;
	timer: NodeJS.Timer | null;
	isFirstTurn: boolean;
	/**
	 * Last tick, as milliseconds since UNIX epoch.
	 * Represents the last time a tick happened.
	 */
	lastTick: number;
	/** Debug mode; true to output detailed timer info every tick */
	debug: boolean;
	lastDisabledTime: number;
	lastDisabledByUser: null | ID;
	settings: GameTimerSettings;
	constructor(battle: RoomBattle) {
		this.battle = battle;

		this.timer = null;
		this.timerRequesters = new Set();
		this.isFirstTurn = true;

		this.lastTick = 0;

		this.debug = false;

		this.lastDisabledTime = 0;
		this.lastDisabledByUser = null;

		const hasLongTurns = Dex.formats.get(battle.format, true).gameType !== 'singles';
		const isChallenge = (battle.challengeType === 'challenge');
		const timerEntry = Dex.formats.getRuleTable(Dex.formats.get(battle.format, true)).timer;
		const timerSettings = timerEntry?.[0];

		// so that Object.assign doesn't overwrite anything with `undefined`
		for (const k in timerSettings) {
			// @ts-ignore
			if (timerSettings[k] === undefined) delete timerSettings[k];
		}

		this.settings = {
			dcTimer: !isChallenge,
			dcTimerBank: isChallenge,
			starting: isChallenge ? STARTING_TIME_CHALLENGE : STARTING_TIME,
			grace: STARTING_GRACE_TIME,
			addPerTurn: hasLongTurns ? 25 : 10,
			maxPerTurn: isChallenge ? MAX_TURN_TIME_CHALLENGE : MAX_TURN_TIME,
			maxFirstTurn: isChallenge ? MAX_TURN_TIME_CHALLENGE : MAX_TURN_TIME,
			timeoutAutoChoose: false,
			accelerate: !timerSettings && !isChallenge,
			...timerSettings,
		};
		if (this.settings.maxPerTurn <= 0) this.settings.maxPerTurn = Infinity;

		for (const player of this.battle.players) {
			player.secondsLeft = this.settings.starting + this.settings.grace;
			player.turnSecondsLeft = -1;
			player.dcSecondsLeft = this.settings.dcTimerBank ? DISCONNECTION_BANK_TIME : DISCONNECTION_TIME;
		}
	}
	start(requester?: User) {
		const userid = requester ? requester.id : 'staff' as ID;
		if (this.timerRequesters.has(userid)) return false;
		if (this.battle.ended) {
			requester?.sendTo(this.battle.roomid, `|inactiveoff|The timer can't be enabled after a battle has ended.`);
			return false;
		}
		if (this.timer) {
			this.battle.room.add(`|inactive|${requester ? requester.name : userid} also wants the timer to be on.`).update();
			this.timerRequesters.add(userid);
			return false;
		}
		if (requester && this.battle.playerTable[requester.id] && this.lastDisabledByUser === requester.id) {
			const remainingCooldownMs = (this.lastDisabledTime || 0) + TIMER_COOLDOWN - Date.now();
			if (remainingCooldownMs > 0) {
				this.battle.playerTable[requester.id].sendRoom(
					`|inactiveoff|The timer can't be re-enabled so soon after disabling it (${Math.ceil(remainingCooldownMs / SECONDS)} seconds remaining).`
				);
				return false;
			}
		}
		this.timerRequesters.add(userid);
		const requestedBy = requester ? ` (requested by ${requester.name})` : ``;
		this.battle.room.add(`|inactive|Battle timer is ON: inactive players will automatically lose when time's up.${requestedBy}`).update();

		this.nextRequest();
		return true;
	}
	stop(requester?: User) {
		if (requester) {
			if (!this.timerRequesters.has(requester.id)) return false;
			this.timerRequesters.delete(requester.id);
			this.lastDisabledByUser = requester.id;
			this.lastDisabledTime = Date.now();
		} else {
			this.timerRequesters.clear();
		}
		if (this.timerRequesters.size) {
			this.battle.room.add(`|inactive|${requester!.name} no longer wants the timer on, but the timer is staying on because ${[...this.timerRequesters].join(', ')} still does.`).update();
			return false;
		}
		if (this.end()) {
			this.battle.room.add(`|inactiveoff|Battle timer is now OFF.`).update();
			return true;
		}
		return false;
	}
	end() {
		this.timerRequesters.clear();
		if (!this.timer) return false;
		clearTimeout(this.timer);
		this.timer = null;
		return true;
	}
	nextRequest() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (!this.timerRequesters.size) return;
		const players = this.battle.players;
		if (players.some(player => player.secondsLeft <= 0)) return;

		/** false = U-turn or single faint, true = "new turn" */
		let isFull = true;
		let isEmpty = true;
		for (const player of players) {
			if (player.request.isWait) isFull = false;
			if (player.request.isWait !== 'cantUndo') isEmpty = false;
		}
		if (isEmpty) {
			// there are no active requests
			return;
		}
		const isFirst = this.isFirstTurn;
		this.isFirstTurn = false;

		const maxTurnTime = (isFirst ? this.settings.maxFirstTurn : 0) || this.settings.maxPerTurn;

		let addPerTurn = isFirst ? 0 : this.settings.addPerTurn;
		if (this.settings.accelerate && addPerTurn) {
			// after turn 100ish: 15s/turn -> 10s/turn
			if (this.battle.requestCount > 200 && addPerTurn > TICK_TIME) {
				addPerTurn -= TICK_TIME;
			}
			// after turn 200ish: 10s/turn -> 7s/turn
			if (this.battle.requestCount > 400 && Math.floor(this.battle.requestCount / 2) % 2) {
				addPerTurn = 0;
			}
		}

		if (!isFull && addPerTurn > TICK_TIME) {
			addPerTurn = TICK_TIME;
		}

		const room = this.battle.room;
		for (const player of players) {
			if (!isFirst) {
				player.secondsLeft = Math.min(player.secondsLeft + addPerTurn, this.settings.starting);
			}
			player.turnSecondsLeft = Math.min(player.secondsLeft, maxTurnTime);

			const secondsLeft = player.turnSecondsLeft;
			let grace = player.secondsLeft - this.settings.starting;
			if (grace < 0) grace = 0;
			if (player) {
				player.sendRoom(`|inactive|Time left: ${secondsLeft} sec this turn | ${player.secondsLeft - grace} sec total` + (grace ? ` | ${grace} sec grace` : ``));
			}
			if (secondsLeft <= 30 && secondsLeft < this.settings.starting) {
				room.add(`|inactive|${player.name} has ${secondsLeft} seconds left this turn.`);
			}
			if (this.debug) {
				room.add(`||${player.name} | Time left: ${secondsLeft} sec this turn | ${player.secondsLeft} sec total | +${addPerTurn} seconds`);
			}
		}
		room.update();
		this.lastTick = Date.now();
		this.timer = setTimeout(() => this.nextTick(), TICK_TIME * SECONDS);
	}
	nextTick() {
		if (this.timer) clearTimeout(this.timer);
		if (this.battle.ended) return;
		const room = this.battle.room;
		for (const player of this.battle.players) {
			if (player.request.isWait) continue;
			if (player.connected) {
				player.secondsLeft -= TICK_TIME;
				player.turnSecondsLeft -= TICK_TIME;
			} else {
				player.dcSecondsLeft -= TICK_TIME;
				if (!this.settings.dcTimerBank) {
					player.secondsLeft -= TICK_TIME;
					player.turnSecondsLeft -= TICK_TIME;
				}
			}

			const dcSecondsLeft = player.dcSecondsLeft;
			if (dcSecondsLeft <= 0) {
				player.hitDisconnectLimit = true;
				player.turnSecondsLeft = 0;
			}
			const secondsLeft = player.turnSecondsLeft;
			if (!secondsLeft) continue;

			if (!player.connected && (dcSecondsLeft <= secondsLeft || this.settings.dcTimerBank)) {
				// dc timer is shown only if it's lower than turn timer or you're in timer bank mode
				if (dcSecondsLeft % 30 === 0 || dcSecondsLeft <= 20) {
					room.add(`|inactive|${player.name} has ${dcSecondsLeft} seconds to reconnect!`);
				}
			} else {
				// regular turn timer shown
				if (secondsLeft % 30 === 0 || secondsLeft <= 20) {
					room.add(`|inactive|${player.name} has ${secondsLeft} seconds left.`);
				}
			}
			if (this.debug) {
				room.add(`||[${player.name} has ${player.turnSecondsLeft}s this turn / ${player.secondsLeft}s total]`);
			}
		}
		room.update();
		if (!this.checkTimeout()) {
			this.timer = setTimeout(() => this.nextTick(), TICK_TIME * 1000);
		}
	}
	checkActivity() {
		if (this.battle.ended) return;
		for (const player of this.battle.players) {
			const isConnected = !!player?.active;

			if (isConnected === player.connected) continue;

			if (!isConnected) {
				// player has disconnected
				player.connected = false;
				if (!this.settings.dcTimerBank) {
					// don't wait longer than 6 ticks (1 minute)
					if (this.settings.dcTimer) {
						player.dcSecondsLeft = DISCONNECTION_TIME;
					} else {
						// arbitrary large number
						player.dcSecondsLeft = DISCONNECTION_TIME * 10;
					}
				}

				if (this.timerRequesters.size) {
					let msg = `!`;

					if (this.settings.dcTimer) {
						msg = ` and has a minute to reconnect!`;
					}
					if (this.settings.dcTimerBank) {
						if (player.dcSecondsLeft > 0) {
							msg = ` and has ${player.dcSecondsLeft} seconds to reconnect!`;
						} else {
							msg = ` and has no disconnection time left!`;
						}
					}
					this.battle.room.add(`|inactive|${player.name} disconnected${msg}`).update();
				}
			} else {
				// player has reconnected
				player.connected = true;
				if (this.timerRequesters.size) {
					let timeLeft = ``;
					if (!player.request.isWait) {
						timeLeft = ` and has ${player.turnSecondsLeft} seconds left`;
					}
					this.battle.room.add(`|inactive|${player.name} reconnected${timeLeft}.`).update();
				}
			}
		}
	}
	checkTimeout() {
		const players = this.battle.players;
		if (players.every(player => player.turnSecondsLeft <= 0)) {
			if (!this.settings.timeoutAutoChoose || players.every(player => player.secondsLeft <= 0)) {
				this.battle.room.add(`|-message|All players are inactive.`).update();
				this.battle.tie();
				return true;
			}
		}
		let didSomething = false;
		for (const player of players) {
			if (player.turnSecondsLeft > 0) continue;
			if (this.settings.timeoutAutoChoose && player.secondsLeft > 0 && player.connected) {
				void this.battle.stream.write(`>${player.slot} default`);
				didSomething = true;
			} else {
				// in bo3, if player dcs then they lose the set.
				// assume if not connected then they got hit by dc timer
				if (!player.connected) {
					player.hitDisconnectLimit = true;
				}
				this.battle.forfeitPlayer(player, ' lost due to inactivity.');
				return true;
			}
		}
		return didSomething;
	}
}

interface RoomBattlePlayerOptions {
	user: User;
	/** should be '' for random teams */
	team?: string;
	rating?: number;
	inviteOnly?: boolean;
	hidden?: boolean;
}

export interface RoomBattleOptions {
	format: string;
	p1?: RoomBattlePlayerOptions;
	p2?: RoomBattlePlayerOptions;
	p3?: RoomBattlePlayerOptions;
	p4?: RoomBattlePlayerOptions;

	delayedStart?: boolean | 'multi';
	challengeType?: ChallengeType;
	allowRenames?: boolean;
	rated?: number | boolean | null;
	tour?: Tournament | null;
	inputLog?: string;
	ratedMessage?: string;
	seed?: PRNGSeed;
	roomid?: RoomID;
	players?: ID[];
	/** For battles restored after a restart */
	delayedTimer?: boolean;
	restored?: boolean;
	/** Best-of stuff */
	isSubBattle?: boolean;
}

export class RoomBattle extends RoomGames.RoomGame<RoomBattlePlayer> {
	readonly gameid: ID;
	readonly room: GameRoom;
	readonly title: string;
	readonly allowRenames: boolean;
	readonly format: string;
	/** Will exist even if the game is unrated, in case it's later forced to be rated */
	readonly ladder: string;
	readonly gameType: string | undefined;
	readonly challengeType: ChallengeType;
	/**
	 * The lower player's rating, for searching purposes.
	 * 0 for unrated battles. 1 for unknown ratings.
	 */
	readonly rated: number;
	/**
	 * userid that requested extraction -> playerids that accepted the extraction
	 */
	readonly allowExtraction: {[k: string]: Set<ID>};
	readonly stream: Streams.ObjectReadWriteStream<string>;
	readonly timer: RoomBattleTimer;
	missingBattleStartMessage: boolean | 'multi';
	started: boolean;
	ended: boolean;
	active: boolean;
	needsRejoin: Set<ID> | null;
	replaySaved: boolean;
	forcedSettings: {modchat?: string | null, privacy?: string | null} = {};
	p1: RoomBattlePlayer;
	p2: RoomBattlePlayer;
	p3: RoomBattlePlayer;
	p4: RoomBattlePlayer;
	inviteOnlySetter: ID | null;
	logData: AnyObject | null;
	endType: string;
	/**
	 * If the battle is ended: an array of the number of Pokemon left for each side.
	 */
	score: number[] | null;
	inputLog: string[] | null;
	turn: number;
	rqid: number;
	requestCount: number;
	options: RoomBattleOptions;
	frozen?: boolean;
	dataResolvers?: [((args: string[]) => void), ((error: Error) => void)][];
	constructor(room: GameRoom, options: RoomBattleOptions) {
		super(room);
		const format = Dex.formats.get(options.format, true);
		this.gameid = 'battle' as ID;
		this.room = room;
		this.title = format.name;
		this.options = options;
		if (!this.title.endsWith(" Battle")) this.title += " Battle";
		this.allowRenames = options.allowRenames !== undefined ? !!options.allowRenames : (!options.rated && !options.tour);

		this.format = options.format;
		this.gameType = format.gameType;
		this.challengeType = options.challengeType || 'challenge';
		this.rated = options.rated === true ? 1 : options.rated || 0;
		this.ladder = typeof format.rated === 'string' ? toID(format.rated) : options.format;
		// true when onCreateBattleRoom has been called
		this.missingBattleStartMessage = !!options.inputLog || options.delayedStart || false;
		this.started = false;
		this.ended = false;
		this.active = false;
		this.replaySaved = false;

		this.playerCap = this.gameType === 'multi' || this.gameType === 'freeforall' ? 4 : 2;
		this.p1 = null!;
		this.p2 = null!;
		this.p3 = null!;
		this.p4 = null!;
		this.inviteOnlySetter = null;

		this.needsRejoin = options.restored ? new Set(options.players) : null;

		// data to be logged
		this.allowExtraction = {};

		this.logData = null;
		this.endType = 'normal';
		this.score = null;
		this.inputLog = null;
		this.turn = 0;

		this.rqid = 1;
		this.requestCount = 0;

		this.stream = PM.createStream();

		let ratedMessage = '';
		if (options.ratedMessage) {
			ratedMessage = options.ratedMessage;
		}
		if (this.rated) {
			ratedMessage = 'Rated battle';
		} else if (this.room.tour) {
			ratedMessage = 'Tournament battle';
		}

		this.room.battle = this;

		const battleOptions = {
			formatid: this.format,
			roomid: this.roomid,
			rated: ratedMessage,
			seed: options.seed,
		};
		if (options.inputLog) {
			void this.stream.write(options.inputLog);
		} else {
			void this.stream.write(`>start ` + JSON.stringify(battleOptions));
		}

		void this.listen();

		this.addPlayer(options.p1?.user || null, options.p1);
		this.addPlayer(options.p2?.user || null, options.p2);
		if (this.playerCap > 2) {
			this.addPlayer(options.p3?.user || null, options.p3);
			this.addPlayer(options.p4?.user || null, options.p4);
		}
		this.timer = new RoomBattleTimer(this);
		if (Config.forcetimer || this.format.includes('blitz')) this.timer.start();
		this.start();
	}

	checkActive() {
		let active = true;
		if (this.ended || !this.started) {
			active = false;
		} else if (!this.p1?.active) {
			active = false;
		} else if (!this.p2?.active) {
			active = false;
		} else if (this.playerCap > 2) {
			if (!this.p3?.active) {
				active = false;
			} else if (!this.p4?.active) {
				active = false;
			}
		}
		Rooms.global.battleCount += (active ? 1 : 0) - (this.active ? 1 : 0);
		this.room.active = active;
		this.active = active;
		if (Rooms.global.battleCount === 0) Rooms.global.automaticKillRequest();
	}
	choose(user: User, data: string) {
		if (this.frozen) {
			user.popup(`Your battle is currently paused, so you cannot move right now.`);
			return;
		}
		const player = this.playerTable[user.id];
		const [choice, rqid] = data.split('|', 2);
		if (!player) return;
		const request = player.request;
		if (request.isWait !== false && request.isWait !== true) {
			player.sendRoom(`|error|[Invalid choice] There's nothing to choose`);
			return;
		}
		const allPlayersWait = this.players.every(p => !!p.request.isWait);
		if (allPlayersWait || // too late
			(rqid && rqid !== '' + request.rqid)) { // WAY too late
			player.sendRoom(`|error|[Invalid choice] Sorry, too late to make a different move; the next turn has already started`);
			return;
		}
		request.isWait = true;
		request.choice = choice;

		void this.stream.write(`>${player.slot} ${choice}`);
	}
	undo(user: User, data: string) {
		const player = this.playerTable[user.id];
		const [, rqid] = data.split('|', 2);
		if (!player) return;
		const request = player.request;
		if (request.isWait !== true) {
			player.sendRoom(`|error|[Invalid choice] There's nothing to cancel`);
			return;
		}
		const allPlayersWait = this.players.every(p => !!p.request.isWait);
		if (allPlayersWait || // too late
			(rqid && rqid !== '' + request.rqid)) { // WAY too late
			player.sendRoom(`|error|[Invalid choice] Sorry, too late to cancel; the next turn has already started`);
			return;
		}
		request.isWait = false;

		void this.stream.write(`>${player.slot} undo`);
	}
	joinGame(user: User, slot?: SideID, playerOpts?: {team?: string}) {
		if (this.needsRejoin?.size && !this.needsRejoin.has(user.id)) {
			user.popup(`All the original players in this battle must join first.`);
			return false;
		}
		if (user.id in this.playerTable) {
			user.popup(`You have already joined this battle.`);
			return false;
		}

		const validSlots: SideID[] = [];
		for (const player of this.players) {
			if (!player.id) validSlots.push(player.slot);
		}

		if (slot && !validSlots.includes(slot)) {
			user.popup(`This battle already has a user in slot ${slot}.`);
			return false;
		}

		if (!validSlots.length) {
			user.popup(`This battle already has two players.`);
			return false;
		}

		if (!slot && validSlots.length > 1) {
			user.popup(`Which slot would you like to join into? Use something like \`/joingame ${validSlots[0]}\``);
			return false;
		}

		if (!slot) slot = validSlots[0];

		if (this[slot].invite === user.id) {
			this.room.auth.set(user.id, Users.PLAYER_SYMBOL);
		} else if (!user.can('joinbattle', null, this.room)) {
			user.popup(`You must be set as a player to join a battle you didn't start. Ask a player to use /addplayer on you to join this battle.`);
			return false;
		}

		this.updatePlayer(this[slot], user, playerOpts);
		this.needsRejoin?.delete(user.id);
		if (validSlots.length - 1 < 1 && this.missingBattleStartMessage) {
			const users = this.players.map(player => {
				const u = player.getUser();
				if (!u) throw new Error(`User ${player.name} not found on ${this.roomid} battle creation`);
				return u;
			});
			Rooms.global.onCreateBattleRoom(users, this.room, {rated: this.rated});
			this.missingBattleStartMessage = false;
			this.started = true;
			this.room.add(`|uhtmlchange|invites|`);
		} else if (!this.started && this.invitesFull()) {
			this.sendInviteForm(true);
		}
		if (user.inRooms.has(this.roomid)) this.onConnect(user);
		this.room.update();
		return true;
	}
	leaveGame(user: User) {
		if (!user) return false; // ...
		if (this.room.rated || this.room.tour) {
			user.popup(`Players can't be swapped out in a ${this.room.tour ? "tournament" : "rated"} battle.`);
			return false;
		}
		const player = this.playerTable[user.id];
		if (!player) {
			user.popup(`Failed to leave battle - you're not a player.`);
			return false;
		}
		Chat.runHandlers('onBattleLeave', user, this.room);

		this.updatePlayer(player, null);
		this.room.auth.set(user.id, '+');
		this.room.update();
		return true;
	}

	startTimer() {
		this.timer.start();
	}

	async listen() {
		let disconnected = false;
		try {
			for await (const next of this.stream) {
				if (!this.room) return; // room deleted in the middle of simulation
				this.receive(next.split('\n'));
			}
		} catch (err: any) {
			// Disconnected processes are already crashlogged when they happen;
			// also logging every battle room would overwhelm the crashlogger
			if (err.message.includes('Process disconnected')) {
				disconnected = true;
			} else {
				Monitor.crashlog(err, 'A sim stream');
			}
		}
		if (!this.ended) {
			this.room.add(`|bigerror|The simulator process crashed. We've been notified and will fix this ASAP.`);
			if (!disconnected) Monitor.crashlog(new Error(`Sim stream interrupted`), `A sim stream`);
			this.started = true;
			this.ended = true;
			this.checkActive();
		}
	}
	receive(lines: string[]) {
		for (const player of this.players) player.wantsTie = false;

		switch (lines[0]) {
		case 'requesteddata':
			lines = lines.slice(1);
			const [resolver] = this.dataResolvers!.shift()!;
			resolver(lines);
			break;

		case 'update':
			for (const line of lines.slice(1)) {
				if (line.startsWith('|turn|')) {
					this.turn = parseInt(line.slice(6));
				}
				this.room.add(line);
				if (line.startsWith(`|bigerror|You will auto-tie if `) && Config.allowrequestingties && !this.room.tour) {
					this.room.add(`|-hint|If you want to tie earlier, consider using \`/offertie\`.`);
				}
			}
			this.room.update();
			if (!this.ended) this.timer.nextRequest();
			this.checkActive();
			break;

		case 'sideupdate': {
			const slot = lines[1] as SideID;
			const player = this[slot];
			if (lines[2].startsWith(`|error|[Invalid choice] Can't do anything`)) {
				// ... should not happen
			} else if (lines[2].startsWith(`|error|[Invalid choice]`)) {
				const undoFailed = lines[2].includes(`Can't undo`);
				const request = this[slot].request;
				request.isWait = undoFailed ? 'cantUndo' : false;
				request.choice = '';
			} else if (lines[2].startsWith(`|request|`)) {
				this.rqid++;
				const request = JSON.parse(lines[2].slice(9));
				request.rqid = this.rqid;
				const requestJSON = JSON.stringify(request);
				this[slot].request = {
					rqid: this.rqid,
					request: requestJSON,
					isWait: request.wait ? 'cantUndo' : false,
					choice: '',
				};
				this.requestCount++;
				if (player) player.sendRoom(`|request|${requestJSON}`);
				break;
			}
			if (player) player.sendRoom(lines[2]);
			break;
		}

		case 'error': {
			if (process.uptime() * 1000 < LOCKDOWN_PERIOD) {
				const error = new Error();
				error.stack = lines.slice(1).join('\n');
				// lock down the server
				Rooms.global.startLockdown(error);
			}
			break;
		}

		case 'end':
			this.logData = JSON.parse(lines[1]);
			this.score = this.logData!.score;
			this.inputLog = this.logData!.inputLog;
			this.started = true;
			if (!this.ended) {
				this.ended = true;
				void this.onEnd(this.logData!.winner);
				this.clearPlayers();
			}
			this.checkActive();
			break;
		}
	}
	async onEnd(winner: any) {
		this.timer.end();
		// Declare variables here in case we need them for non-rated battles logging.
		let p1score = 0.5;
		const winnerid = toID(winner);

		// Check if the battle was rated to update the ladder, return its response, and log the battle.
		const p1name = this.p1.name;
		const p2name = this.p2.name;
		const p1id = toID(p1name);
		const p2id = toID(p2name);
		Chat.runHandlers('onBattleEnd', this, winnerid, [p1id, p2id, this.p3?.id, this.p4?.id].filter(Boolean));
		if (this.room.rated) {
			this.room.rated = 0;

			if (winnerid === p1id) {
				p1score = 1;
			} else if (winnerid === p2id) {
				p1score = 0;
			}

			winner = Users.get(winnerid);
			if (winner && !winner.registered) {
				this.room.sendUser(winner, '|askreg|' + winner.id);
			}
			const [score, p1rating, p2rating] = await Ladders(this.ladder).updateRating(p1name, p2name, p1score, this.room);
			void this.logBattle(score, p1rating, p2rating);
			Chat.runHandlers('onBattleRanked', this, winnerid, [p1rating, p2rating], [p1id, p2id]);
		} else if (Config.logchallenges) {
			if (winnerid === p1id) {
				p1score = 1;
			} else if (winnerid === p2id) {
				p1score = 0;
			}
			void this.logBattle(p1score);
		} else {
			this.logData = null;
		}
		// If a replay was saved at any point or we were configured to autosavereplays,
		// reupload when the battle is over to overwrite the partial data (and potentially
		// reflect any changes that may have been made to the replay's hidden status).
		if (this.replaySaved || Config.autosavereplays) {
			const uploader = Users.get(winnerid || p1id);
			if (uploader?.connections[0]) {
				Chat.parse('/savereplay silent', this.room, uploader, uploader.connections[0]);
			}
		}
		const parentGame = this.room.parent && this.room.parent.game;
		// @ts-ignore - Tournaments aren't TS'd yet
		if (parentGame?.onBattleWin) {
			// @ts-ignore
			parentGame.onBattleWin(this.room, winnerid);
		}
		// If the room's replay was hidden, disable users from joining after the game is over
		if (this.room.hideReplay) {
			this.room.settings.modjoin = '%';
			this.room.setPrivate('hidden');
		}
		this.room.update();
	}
	async logBattle(
		p1score: number, p1rating: AnyObject | null = null, p2rating: AnyObject | null = null,
		p3rating: AnyObject | null = null, p4rating: AnyObject | null = null
	) {
		if (Dex.formats.get(this.format, true).noLog) return;
		const logData = this.logData;
		if (!logData) return;
		this.logData = null; // deallocate to save space
		logData.log = this.room.getLog(-1).split('\n'); // replay log (exact damage)

		// delete some redundant data
		for (const rating of [p1rating, p2rating, p3rating, p4rating]) {
			if (rating) {
				delete rating.formatid;
				delete rating.username;
				delete rating.rpsigma;
				delete rating.sigma;
			}
		}

		logData.p1rating = p1rating;
		logData.p2rating = p2rating;
		if (this.playerCap > 2) {
			logData.p3rating = p3rating;
			logData.p4rating = p4rating;
		}
		logData.endType = this.endType;
		if (!p1rating) logData.ladderError = true;
		const date = new Date();
		logData.timestamp = '' + date;
		logData.roomid = this.room.roomid;
		logData.format = this.room.format;

		const logsubfolder = Chat.toTimestamp(date).split(' ')[0];
		const logfolder = logsubfolder.split('-', 2).join('-');
		const tier = Dex.formats.get(this.room.format).id;
		const logpath = `logs/${logfolder}/${tier}/${logsubfolder}/`;

		await FS(logpath).mkdirp();
		await FS(`${logpath}${this.room.getReplayData().id}.log.json`).write(JSON.stringify(logData));
		// console.log(JSON.stringify(logData));
	}
	onConnect(user: User, connection: Connection | null = null) {
		// this handles joining a battle in which a user is a participant,
		// where the user has already identified before attempting to join
		// the battle
		const player = this.playerTable[user.id];
		if (!player) return;
		player.updateChannel(connection || user);
		const request = player.request;
		if (request) {
			let data = `|request|${request.request}`;
			if (request.choice) data += `\n|sentchoice|${request.choice}`;
			(connection || user).sendTo(this.roomid, data);
		}
		if (!this.started) {
			this.sendInviteForm(connection || user);
		}
		if (!player.active) this.onJoin(user);
	}
	onUpdateConnection(user: User, connection: Connection | null = null) {
		this.onConnect(user, connection);
	}
	onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		if (user.id === oldUserid) return;
		if (!this.playerTable) {
			// !! should never happen but somehow still does
			user.games.delete(this.roomid);
			return;
		}
		if (!(oldUserid in this.playerTable)) {
			if (user.id in this.playerTable) {
				// this handles a user renaming themselves into a user in the
				// battle (e.g. by using /nick)
				this.onConnect(user);
			}
			return;
		}
		if (!this.allowRenames) {
			const player = this.playerTable[oldUserid];
			if (player) {
				const message = isForceRenamed ? " lost by having an inappropriate name." : " forfeited by changing their name.";
				this.forfeitPlayer(player, message);
			}
			if (!(user.id in this.playerTable)) {
				user.games.delete(this.roomid);
			}
			return;
		}
		if (!user.named) {
			this.onLeave(user, oldUserid);
			return;
		}
		if (user.id in this.playerTable) return;
		const player = this.playerTable[oldUserid];
		if (player) {
			this.updatePlayer(player, user);
		}
		const options = {
			name: user.name,
			avatar: user.avatar,
		};
		void this.stream.write(`>player ${player.slot} ` + JSON.stringify(options));
	}
	onJoin(user: User) {
		const player = this.playerTable[user.id];
		if (player && !player.active) {
			player.active = true;
			this.timer.checkActivity();
			this.room.add(`|player|${player.slot}|${user.name}|${user.avatar}`);
		}
	}
	onLeave(user: User, oldUserid?: ID) {
		const player = this.playerTable[oldUserid || user.id];
		if (player?.active) {
			player.sendRoom(`|request|null`);
			player.active = false;
			this.timer.checkActivity();
			this.room.add(`|player|${player.slot}|`);
		}
	}

	win(user: User) {
		if (!user) {
			this.tie();
			return true;
		}
		const player = this.playerTable[user.id];
		if (!player) return false;
		void this.stream.write(`>forcewin ${player.slot}`);
	}
	tie() {
		void this.stream.write(`>forcetie`);
	}
	tiebreak() {
		void this.stream.write(`>tiebreak`);
	}
	forfeit(user: User | string, message = '') {
		if (typeof user !== 'string') user = user.id;
		else user = toID(user);

		if (!(user in this.playerTable)) return false;
		return this.forfeitPlayer(this.playerTable[user], message);
	}

	forfeitPlayer(player: RoomBattlePlayer, message = '') {
		if (this.ended || !this.started) return false;

		if (!message) message = ' forfeited.';
		this.room.add(`|-message|${player.name}${message}`);
		this.endType = 'forfeit';
		// multi battles, they need to be removed, else they can do things like spam forfeit
		if (this.playerCap > 2) {
			player.sendRoom(`|request|null`);
			this.removePlayer(player);
		}
		void this.stream.write(`>forcelose ${player.slot}`);
		return true;
	}

	/**
	 * playerOpts should be empty only if importing an inputlog
	 * (so the player isn't recreated)
	 */
	addPlayer(user: User | null, playerOpts?: RoomBattlePlayerOptions) {
		const player = super.addPlayer(user);
		if (!player) return null;
		const slot = player.slot;
		this[slot] = player;

		if (playerOpts) {
			const options = {
				name: player.name,
				avatar: user ? '' + user.avatar : '',
				team: playerOpts.team || undefined,
				rating: Math.round(playerOpts.rating || 0),
			};
			void this.stream.write(`>player ${slot} ${JSON.stringify(options)}`);
			player.hasTeam = true;
		}

		if (user) {
			this.room.auth.set(player.id, Users.PLAYER_SYMBOL);
		}
		if (user?.inRooms.has(this.roomid)) this.onConnect(user);
		return player;
	}

	checkPrivacySettings(options: RoomBattleOptions & Partial<RoomSettings>) {
		let inviteOnly = false;
		const privacySetter = new Set<ID>([]);
		for (const p of ['p1', 'p2', 'p3', 'p4'] as const) {
			const playerOptions = options[p];
			if (playerOptions) {
				if (playerOptions.inviteOnly) {
					inviteOnly = true;
					privacySetter.add(playerOptions.user.id);
				} else if (playerOptions.hidden) {
					privacySetter.add(playerOptions.user.id);
				}
				if (playerOptions.user) this.checkForcedUserSettings(playerOptions.user);
			}
		}

		if (privacySetter.size) {
			const room = this.room;
			if (this.forcedSettings.privacy) {
				room.setPrivate(false);
				room.settings.modjoin = null;
				room.add(`|raw|<div class="broadcast-blue"><strong>This battle is required to be public due to a player having a name starting with '${this.forcedSettings.privacy}'.</div>`);
			} else if (!options.tour || (room.tour?.allowModjoin)) {
				room.setPrivate('hidden');
				if (inviteOnly) room.settings.modjoin = '%';
				room.privacySetter = privacySetter;
				if (inviteOnly) {
					room.settings.modjoin = '%';
					room.add(`|raw|<div class="broadcast-red"><strong>This battle is invite-only!</strong><br />Users must be invited with <code>/invite</code> (or be staff) to join</div>`);
				}
			}
		}
	}

	checkForcedUserSettings(user: User) {
		this.forcedSettings = {
			modchat: this.forcedSettings.modchat || RoomBattle.battleForcedSetting(user, 'modchat'),
			privacy: this.forcedSettings.privacy || RoomBattle.battleForcedSetting(user, 'privacy'),
		};
		if (
			this.players.some(p => p.getUser()?.battleSettings.special) ||
			(this.rated && this.forcedSettings.modchat)
		) {
			this.room.settings.modchat = '\u2606';
		}
	}

	static battleForcedSetting(user: User, key: 'modchat' | 'privacy') {
		if (Config.forcedpublicprefixes) {
			for (const prefix of Config.forcedpublicprefixes) {
				Chat.plugins['username-prefixes']?.prefixManager.addPrefix(prefix, 'privacy');
			}
			delete Config.forcedpublicprefixes;
		}
		if (!Config.forcedprefixes) return null;
		for (const {type, prefix} of Config.forcedprefixes) {
			if (user.id.startsWith(toID(prefix)) && type === key) return prefix;
		}
		return null;
	}

	makePlayer(user: User) {
		const num = (this.players.length + 1) as PlayerIndex;
		return new RoomBattlePlayer(user, this, num);
	}

	updatePlayer(player: RoomBattlePlayer, user: User | null, playerOpts?: {team?: string}) {
		super.updatePlayer(player, user);

		player.invite = '';
		const slot = player.slot;
		if (user) {
			const options = {
				name: player.name,
				avatar: user.avatar,
				team: playerOpts?.team,
			};
			void this.stream.write(`>player ${slot} ` + JSON.stringify(options));
			if (playerOpts) player.hasTeam = true;

			this.room.add(`|player|${slot}|${player.name}|${user.avatar}`);
		} else {
			const options = {
				name: '',
			};
			void this.stream.write(`>player ${slot} ` + JSON.stringify(options));

			this.room.add(`|player|${slot}|`);
		}
	}

	start() {
		// on start
		const users = this.players.map(player => {
			const user = player.getUser();
			if (!user && !this.missingBattleStartMessage) {
				throw new Error(`User ${player.name} not found on ${this.roomid} battle creation`);
			}
			return user;
		});
		if (!this.missingBattleStartMessage) {
			// @ts-ignore The above error should throw if null is found, or this should be skipped
			Rooms.global.onCreateBattleRoom(users, this.room, {rated: this.rated});
			this.started = true;
		}

		if (this.gameType === 'multi') {
			this.room.title = `Team ${this.p1.name} vs. Team ${this.p2.name}`;
		} else if (this.gameType === 'freeforall') {
			// p1 vs. p2 vs. p3 vs. p4 is too long of a title
			this.room.title = `${this.p1.name} and friends`;
		} else {
			this.room.title = `${this.p1.name} vs. ${this.p2.name}`;
		}
		this.room.send(`|title|${this.room.title}`);
		const suspectTest = Chat.plugins['suspect-tests']?.suspectTests[this.format];
		if (suspectTest) {
			const format = Dex.formats.get(this.format);
			this.room.add(
				`|html|<div class="broadcast-blue"><strong>${format.name} is currently suspecting ${suspectTest.suspect}! ` +
				`For information on how to participate check out the <a href="${suspectTest.url}">suspect thread</a>.</strong></div>`
			).update();
		}
		if (this.missingBattleStartMessage === 'multi') {
			this.room.add(`|uhtml|invites|<div class="broadcast broadcast-blue"><strong>This is a 4-player challenge battle</strong><br />The players will need to add more players before the battle can start.</div>`);
		}
	}

	invitesFull() {
		return this.players.every(player => player.id || player.invite);
	}
	/** true = send to every player; falsy = send to no one */
	sendInviteForm(connection: Connection | User | null | boolean) {
		if (connection === true) {
			for (const player of this.players) this.sendInviteForm(player.getUser());
			return;
		}
		if (!connection) return;
		const playerForms = this.players.map(player => (
			player.id ? (
				`<form><label>Player ${player.num}: <strong>${player.name}</strong></label></form>`
			) : player.invite ? (
				`<form data-submitsend="/msgroom ${this.roomid},/uninvitebattle ${player.invite}"><label>Player ${player.num}: <strong>${player.invite}</strong> (invited) <button>Uninvite</button></label></form>`
			) : (
				`<form data-submitsend="/msgroom ${this.roomid},/invitebattle {username}, p${player.num}"><label>Player ${player.num}: <input name="username" class="textbox" placeholder="Username" /></label> <button class="button">Add Player</button></form>`
			)
		));
		if (this.gameType === 'multi') {
			[playerForms[1], playerForms[2]] = [playerForms[2], playerForms[1]];
			playerForms.splice(2, 0, '&mdash; vs &mdash;');
		}
		connection.sendTo(
			this.room,
			`|uhtmlchange|invites|<div class="broadcast broadcast-blue"><strong>This battle needs more players to start</strong><br /><br />${playerForms.join(``)}</div>`
		);
	}

	clearPlayers() {
		for (const player of this.players) {
			player.unlinkUser();
		}
	}

	destroy() {
		for (const player of this.players) {
			player.destroy();
		}
		this.playerTable = {};
		this.players = [];
		this.p1 = null!;
		this.p2 = null!;
		this.p3 = null!;
		this.p4 = null!;

		this.ended = true;
		void this.stream.destroy();
		if (this.active) {
			Rooms.global.battleCount += -1;
			this.active = false;
		}

		(this as any).room = null;
		if (this.dataResolvers) {
			for (const [, reject] of this.dataResolvers) {
				// reject the promise, make whatever function called it return undefined
				reject(new Error('Battle was destroyed.'));
			}
		}
	}
	async getTeam(user: User | string) {
		// toID extracts user.id
		const id = toID(user);
		const player = this.playerTable[id];
		if (!player) return;
		void this.stream.write(`>requestteam ${player.slot}`);
		const teamDataPromise = new Promise<string[]>((resolve, reject) => {
			if (!this.dataResolvers) this.dataResolvers = [];
			this.dataResolvers.push([resolve, reject]);
		});
		const resultStrings = await teamDataPromise;
		if (!resultStrings) return;
		const result = Teams.unpack(resultStrings[0]);
		return result;
	}
	onChatMessage(message: string, user: User) {
		const parts = message.split('\n');
		for (const line of parts) {
			void this.stream.write(`>chat-inputlogonly ${user.getIdentity(this.room)}|${line}`);
		}
	}
	async getLog(): Promise<string[] | void> {
		if (!this.logData) this.logData = {};
		void this.stream.write('>requestlog');
		const logPromise = new Promise<string[]>((resolve, reject) => {
			if (!this.dataResolvers) this.dataResolvers = [];
			this.dataResolvers.push([resolve, reject]);
		});
		const result = await logPromise;
		return result;
	}
}

export class BestOfGame extends RoomGames.RoomGame {
	bestOf: number;
	format: Format;
	score: number[] | null = null;
	winThreshold: number;
	options: RoomBattleOptions;
	p1!: ID;
	p2!: ID;
	wins = {p1: 0, p2: 0};
	ready: {p1: boolean, p2: boolean} | null = null;
	ties = 0;
	games: {battle: Room, winner: string | null, rated: number}[] = [];
	allowRenames = false;
	playerNum = 0;
	winner: ID | null = null;
	waitingBattle: RoomBattle | null = null;
	nextBattleTimerStart: number | null = null;
	nextBattleTimer: NodeJS.Timer | null = null;
	ended = false;
	needsTimer = false;
	teams: Record<string, PokemonSet[] | null | undefined> = {};
	constructor(room: Room, options: RoomBattleOptions) {
		super(room, false);
		this.format = Dex.formats.get(options.format);
		this.bestOf = Number(Dex.formats.getRuleTable(this.format).valueRules.get('bestof'))!;
		this.winThreshold = Math.floor(this.bestOf / 2) + 1;
		this.title = this.format.name;
		if (!toID(this.title).includes('bestof')) {
			this.title += ` (Best-of-${this.bestOf})`;
		}
		this.options = options;
		options.isSubBattle = true;
		if (!options.players && (options.p1 || options.p2)) {
			options.players = [options.p1?.user, options.p2?.user].map(toID);
		}
		for (const userid of options.players || []) {
			const player = this.makePlayer(userid);
			this.playerTable[userid] = player;
			this.room.auth.set(userid, Users.PLAYER_SYMBOL);
			this[`p${player.num}` as 'p1' | 'p2'] = userid;
		}
		process.nextTick(() => this.nextGame());
	}
	onConnect(user: User) {
		const player = this.playerTable[user.id];
		if (player) {
			player.sendRoom('|cantleave|');
		}
	}
	makePlayer(userid: string | User): RoomGames.RoomGamePlayer {
		return new RoomGames.RoomGamePlayer(Users.get(userid) || userid, this, ++this.playerNum);
	}
	cleanup() {
		this.waitingBattle = null;
		if (this.ready) this.ready = null;
		if (this.nextBattleTimer) {
			clearInterval(this.nextBattleTimer);
			this.nextBattleTimerStart = null;
		}
		this.nextBattleTimerStart = null;
		this.nextBattleTimer = null;
	}
	nextGame() {
		if (this.waitingBattle) {
			this.waitingBattle.room.add(`Both players are ready! Starting next match!`).update();
		}
		this.cleanup();

		const battle = Rooms.createBattle(this.options);
		if (!battle) throw new Error("Failed to create battle for " + this.title);
		battle.setParent(this.room);
		this.games.push({
			battle,
			winner: null,
			rated: battle.rated,
		});
		// the absolute result is what counts for rating
		battle.rated = 0;
		if (this.needsTimer) {
			battle.battle?.timer.start();
		}
		battle.add(
			`|html|View the match progress at <a href="/${this.roomid}">${this.roomid}</a>`
		).update();
		this.updateDisplay();
		this.room.add(`|html|<h2>Game ${this.games.length}</h2>`);
		this.room.add(`|html|<a href="/${battle.roomid}">${battle.title}</a>`);
		this.room.update();
	}
	updateDisplay() {
		const p1name = this.name(this.p1);
		const p2name = this.name(this.p2);
		let buf = Utils.html`<br /><strong>${p1name} and ${p2name}'s Best-of-${this.bestOf} progress:</strong><br />`;
		buf += '<table>';
		for (const k of ['p1', 'p2'] as const) {
			const userid = this[k];
			buf += `<tr><td>${this.name(userid)}: </td><td>`;
			for (let i = 0; i < this.bestOf; i++) {
				if (this.games[i]?.winner === userid) {
					buf += `<i class="fa fa-circle"></i>`;
				} else {
					buf += `<i class="fa fa-circle-o"></i>`;
				}
				if (i != this.bestOf - 1) {
					buf += ` `;
				}
			}
			buf += `</td></tr>`;
		}
		buf += `</table><br /><br />`;
		buf += `<table><tr>`;

		for (const userid of [this.p1, null, this.p2]) {
			if (userid === null) {
				buf += `<td></td>`;
				continue;
			}
			buf += `<td><center><strong>${this.name(userid)}</strong></center></td>`;
		}

		buf += `</tr><tr>`;

		for (const [i, userid] of [this.p1, null, this.p2].entries()) {
			if (userid === null) {
				buf += `<td></td>`;
				continue;
			}
			let name = Users.get(userid)?.avatar;
			if (!name || typeof name === 'number') name = 'unknownf';
			const url = Chat.plugins.avatars?.Avatars.src(name) || `https://${Config.routes.client}/sprites/trainers/${name}.png`;
			buf += `<td><center>`;
			buf += `<img class="trainersprite"${!i ? ' style="transform: scaleX(-1)"' : ""} src="${url}" />`;
			buf += `</center></td>`;
		}

		buf += `</tr><tr>`;

		for (const [i, slot] of ['p1', null, 'p2'].entries()) {
			if (slot === null) {
				buf += `<td> vs </td>`;
				continue;
			}
			const team = Teams.unpack(this.options[slot as 'p1' | 'p2']?.team || "");
			if (!team || !this.format.ruleTable?.has('teampreview')) {
				buf += `<td>`;
				buf += `<psicon pokemon="unknown" /> `.repeat(3);
				buf += `<br />`;
				buf += `<psicon pokemon="unknown" /> `.repeat(3);
				buf += `</td>`;
				continue;
			}
			const style = !i ? ' style="transform: scaleX(-1)"' : "";
			buf += `<td>`;
			for (const [j, set] of team.entries()) {
				if (j % 3 === 0 && j > 1) buf += `<br />`;
				buf += `<psicon pokemon="${set.species}"${style}/>`;
			}
			buf += `</td>`;
		}
		buf += `</tr></table>`;

		this.room.add(`|fieldhtml|<center>${buf}</center>`);
		buf = this.games.map(({battle, winner}, index) => {
			let progress = `in progress`;
			if (winner) progress = `winner: ${this.name(winner)}`;
			if (winner === '') progress = `tied`;
			return Utils.html`<p>Game ${index + 1}: <a href="/${battle.roomid}">${battle.title} - ${progress}</a></p>`;
		}).join('');
		if (this.winner) {
			buf += Utils.html`<p>${this.name(this.winner)} won!</p>`;
		} else if (this.winner === '') {
			buf += `<p>The battle was tied.</p>`;
		}
		this.room.add(`|controlshtml|<center>${buf}</center>`);
		this.room.update();
	}

	startTimer() {
		this.needsTimer = true;
		for (const {battle} of this.games) {
			battle.battle?.timer.start();
		}
	}

	onBattleWin(room: Room, winnerid: string) {
		const loser = this.p1 === winnerid ? this.p2 : this.p1;
		const loserPlayer = room.battle!.playerTable[loser];
		if (loserPlayer.hitDisconnectLimit) { // disconnection means opp wins the set
			this.room.add(`${this.name(loser)} lost the series due to inactivity.`);
			return this.onEnd(winnerid as ID);
		}
		if (this.ended) return;

		let isTie = false;
		if (this.p1 === winnerid) {
			this.wins.p1++;
		} else if (this.p2 === winnerid) {
			this.wins.p2++;
		} else {
			this.ties++;
			isTie = true;
			this.winThreshold = Math.floor((this.bestOf - this.ties) / 2) + 1;
		}
		this.games[this.games.length - 1].winner = isTie ? '' : winnerid;

		this.room.add(
			`|html|${winnerid ? `${this.name(winnerid)} won game ${this.games.length}!` : `Game ${this.games.length} was a tie`}`
		).update();
		for (const k in this.wins) {
			if (this.wins[k as 'p1' | 'p2'] >= this.winThreshold) {
				return this.onEnd(this[k as 'p1' | 'p2']);
			}
		}
		if (this.games.length >= this.bestOf) return this.onEnd(''); // tie
		// no one has won, skip onwards
		setImmediate(() => this.promptNextGame(room));
	}
	promptNextGame(room: Room) {
		if (!room.battle || this.winner) return; // ???
		const cmd = `/msgroom ${this.room.roomid},/confirmready`;
		for (const userid in room.battle.playerTable) {
			const player = room.battle.playerTable[userid];
			player.id = userid as ID; // re-link users so that we can use timer properly
			const name = Utils.escapeHTML(this.name(userid));
			const button = `|c|&|/uhtml prompt-${userid},<button class="button notifying" name="send" value="${cmd}">I'm ready!</button>`;
			const prompt = `|c|&|/log Are you ready for game ${this.games.length + 1}, ${name}?`;
			player.sendRoom(prompt);
			player.sendRoom(button);
			// send it to the main room as well, in case they x out of the old one
			this.playerTable[userid].sendRoom(prompt);
			this.playerTable[userid].sendRoom(button);
		}
		this.waitingBattle = room.battle;
		this.ready = {p1: false, p2: false};
		this.nextBattleTimerStart = Date.now();
		this.nextBattleTimer = setInterval(() => this.pokeNextBattleTimer(), 10_000);
	}
	pokeNextBattleTimer() {
		if (!this.nextBattleTimerStart || !this.nextBattleTimer) return; // ??
		if ((Date.now() - this.nextBattleTimerStart) >= (60_000)) {
			return this.nextGame();
		}
		for (const k of ['p1', 'p2'] as const) {
			if (!this.ready![k]) {
				const diff = (this.nextBattleTimerStart + 60000) - Date.now();
				this.waitingBattle?.room.add(
					`|inactive|${this.name(this[k])} has ${Chat.toDurationString(diff + 100)}` +
					` to confirm battle start!`
				);
			}
		}
		this.waitingBattle?.room.update();
		this.room.update();
	}
	confirmReady(user: ID) {
		if (![this.p1, this.p2].includes(user)) {
			throw new Chat.ErrorMessage("You aren't a player in this best-of set.");
		}
		const battle = this.waitingBattle;
		if (!this.ready || !battle) {
			throw new Chat.ErrorMessage("The battle is not currently waiting for ready confirmation.");
		}

		this.ready[user === this.p1 ? 'p1' : 'p2'] = true;
		const readyMsg = Utils.html`|c|&|/uhtml prompt-${user},${this.name(user)} is ready for game ${this.games.length + 1}!`;
		battle.room.add(readyMsg).update();
		if (Object.values(this.ready).filter(Boolean).length === 2) {
			this.nextGame();
		}
	}
	getLatestBattle() {
		// Strictly, this should never be null unless battle creation lags big time. but let's be typesafe anyway.
		return this.games[this.games.length - 1].battle.battle;
	}
	private name(str: string) {
		return Users.get(str)?.name || str;
	}
	async onEnd(winner: ID) {
		this.cleanup();
		this.room.add(`|allowleave|`).update();
		if (winner) {
			this.winner = winner;
			this.room.add(`|win|${this.name(winner)}`);
		} else {
			this.winner = '';
			this.room.add(`|tie`);
		}
		this.updateDisplay();
		this.room.update();
		this.score = [this.wins.p1, this.wins.p2];
		const parentGame = this.room.parent && this.room.parent.game;
		// @ts-ignore - Tournaments aren't TS'd yet
		if (parentGame?.onBattleWin) {
			// @ts-ignore
			parentGame.onBattleWin(this.room, winner);
		}
		// run elo stuff here
		let p1score = 0.5;
		if (winner === this.p1) {
			p1score = 1;
		} else if (winner === this.p2) {
			p1score = 0;
		}
		for (const k in this.playerTable) {
			this.playerTable[k].unlinkUser();
			Users.get(k)?.updateSearch();
		}

		const {rated, battle: room} = this.games[this.games.length - 1];
		const battle = room.battle!;
		if (winner === this.p1) {
			p1score = 1;
		} else if (winner === this.p2) {
			p1score = 0;
		}
		if (rated) {
			(room as GameRoom).rated = rated; // just in case
			const winnerUser = Users.get(winner);
			if (winnerUser && !winnerUser.registered) {
				this.room.sendUser(winnerUser, '|askreg|' + winner);
			}
			const [score, p1rating, p2rating] = await Ladders(battle.ladder).updateRating(
				this.name(this.p1), this.name(this.p2), p1score, battle.room
			);
			void battle.logBattle(score, p1rating, p2rating);
			Chat.runHandlers('onBattleRanked', battle, winner, [p1rating, p2rating], [this.p1, this.p2]);
		} else if (Config.logchallenges) {
			void battle.logBattle(p1score);
		} else {
			battle.logData = null;
		}
	}
	forfeit(user: User | string, message = '') {
		if (typeof user !== 'string') user = user.id;
		else user = toID(user);

		if (!(user in this.playerTable)) return false;
		this.winner = user === this.p1 ? this.p2 : this.p1;
		this.room.add(Utils.html`${this.name(user)} forfeited.`);
		this.ended = true;
		void this.onEnd(this.winner);
		for (const {battle} of this.games) {
			if (!battle.battle || battle.battle.ended) continue;
			battle.battle.forfeit(user, message);
		}
		return true;
	}
	destroy() {
		this.cleanup();
		for (const k in this.playerTable) {
			this.playerTable[k].unlinkUser();
			delete this.playerTable[k];
		}
		for (const [i, entry] of this.games.entries()) {
			entry.battle.setParent(null);
			entry.battle.destroy();
			this.games.splice(i, 1);
		}
	}
}

export class RoomBattleStream extends BattleStream {
	readonly battle: Battle;
	constructor() {
		super({keepAlive: true});
		this.battle = null!;
	}

	_write(chunk: string) {
		const startTime = Date.now();
		if (this.battle && Config.debugsimprocesses && process.send) {
			process.send('DEBUG\n' + this.battle.inputLog.join('\n') + '\n' + chunk);
		}
		try {
			this._writeLines(chunk);
		} catch (err: any) {
			const battle = this.battle;
			Monitor.crashlog(err, 'A battle', {
				chunk,
				inputLog: battle ? '\n' + battle.inputLog.join('\n') : '',
				log: battle ? '\n' + battle.getDebugLog() : '',
			});

			this.push(`update\n|html|<div class="broadcast-red"><b>The battle crashed</b><br />Don't worry, we're working on fixing it.</div>`);
			if (battle) {
				for (const side of battle.sides) {
					if (side?.requestState) {
						this.push(`sideupdate\n${side.id}\n|error|[Invalid choice] The battle crashed`);
					}
				}
			}
			// public crashlogs only have the stack anyways
			this.push(`error\n${err.stack}`);
		}
		if (this.battle) this.battle.sendUpdates();
		const deltaTime = Date.now() - startTime;
		if (deltaTime > 1000) {
			Monitor.slow(`[slow battle] ${deltaTime}ms - ${chunk.replace(/\n/ig, ' | ')}`);
		}
	}
}

/*********************************************************
 * Process manager
 *********************************************************/

export const PM = new ProcessManager.StreamProcessManager(module, () => new RoomBattleStream(), message => {
	if (message.startsWith(`SLOW\n`)) {
		Monitor.slow(message.slice(5));
	}
});

if (!PM.isParentProcess) {
	// This is a child process!
	global.Config = require('./config-loader').Config;
	global.Dex = require('../sim/dex').Dex;
	global.Monitor = {
		crashlog(error: Error, source = 'A simulator process', details: AnyObject | null = null) {
			const repr = JSON.stringify([error.name, error.message, source, details]);
			process.send!(`THROW\n@!!@${repr}\n${error.stack}`);
		},
		slow(text: string) {
			process.send!(`CALLBACK\nSLOW\n${text}`);
		},
	};
	global.__version = {head: ''};
	try {
		const head = execSync('git rev-parse HEAD', {
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		const merge = execSync('git merge-base origin/master HEAD', {
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		global.__version.head = ('' + head).trim();
		const origin = ('' + merge).trim();
		if (origin !== global.__version.head) global.__version.origin = origin;
	} catch {}

	if (Config.crashguard) {
		// graceful crash - allow current battles to finish before restarting
		process.on('uncaughtException', err => {
			Monitor.crashlog(err, 'A simulator process');
		});
		process.on('unhandledRejection', err => {
			Monitor.crashlog(err as any || {}, 'A simulator process Promise');
		});
	}

	// eslint-disable-next-line no-eval
	Repl.start(`sim-${process.pid}`, cmd => eval(cmd));
} else {
	PM.spawn(global.Config ? Config.simulatorprocesses : 1);
}
