import {ssbSets} from "./random-teams";
import {changeSet, getName, enemyStaff} from "./scripts";

const STRONG_WEATHERS = ['desolateland', 'primordialsea', 'deltastream', 'deserteddunes'];

export const Abilities: {[k: string]: ModdedAbilityData} = {
	/*
	// Example
	abilityid: {
		desc: "", // long description
		shortDesc: "", // short description, shows up in /dt
		name: "Ability Name",
		// The bulk of an ability is not easily shown in an example since it varies
		// For more examples, see https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
	},
	*/
	// Please keep abilites organized alphabetically based on staff member name!
	// Aelita
	fortifiedmetal: {
		shortDesc: "This Pokemon's weight is doubled and Attack is 1.5x when statused.",
		name: "Fortified Metal",
		onModifyWeightPriority: 1,
		onModifyWeight(weighthg) {
			return weighthg * 2;
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: {breakable: 1},
		gen: 9,
	},

	// Akir
	takeitslow: {
		shortDesc: "Regenerator + Psychic Surge.",
		name: "Take it Slow",
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		onStart(source) {
			this.field.setTerrain('psychicterrain');
		},
		flags: {},
		gen: 9,
	},

	// Alex
	pawprints: {
		shortDesc: "Oblivious. Status moves +1 priority and ignore abilities.",
		name: "Pawprints",
		onUpdate(pokemon) {
			if (pokemon.volatiles['attract']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
			}
			if (pokemon.volatiles['taunt']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'attract') return false;
		},
		onTryHit(pokemon, target, move) {
			if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
				this.add('-immune', pokemon, '[from] ability: Oblivious');
				return null;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Oblivious', '[of] ' + target);
			}
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		onModifyMove(move) {
			if (move.category === 'Status') {
				move.ignoreAbility = true;
			}
		},
		flags: {breakable: 1},
	},

	// Alexander489
	confirmedtown: {
		shortDesc: "Technician + Protean.",
		name: "Confirmed Town",
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			const basePowerAfterMultiplier = this.modify(basePower, this.event.modifier);
			this.debug('Base Power: ' + basePowerAfterMultiplier);
			if (basePowerAfterMultiplier <= 60) {
				this.debug('Confirmed Town boost');
				return this.chainModify(1.5);
			}
		},
		onPrepareHit(source, target, move) {
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch') return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Confirmed Town');
			}
		},
		flags: {},
	},

	// Appletun a la Mode
	servedcold: {
		shortDesc: "This Pokemon's Defense is raised 2 stages if hit by an Ice move; Ice immunity.",
		name: "Served Cold",
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ice') {
				if (!this.boost({def: 2})) {
					this.add('-immune', target, '[from] ability: Served Cold');
				}
				return null;
			}
		},
		flags: {breakable: 1},
	},

	// aQrator
	neverendingfhunt: {
		shortDesc: "This Pokemon's Status moves have priority raised by 1. Dark types are not immune.",
		name: "Neverending fHunt",
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				return priority + 1;
			}
		},
		flags: {},
	},

	// A Quag To The Past
	quagofruin: {
		shortDesc: "Active Pokemon without this Ability have their Def multiplied by 0.85. Ignores abilities.",
		name: "Quag of Ruin",
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Quag of Ruin');
		},
		onAnyModifyDef(def, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Quag of Ruin')) return;
			if (!move.ruinedDef?.hasAbility('Quag of Ruin')) move.ruinedDef = abilityHolder;
			if (move.ruinedDef !== abilityHolder) return;
			this.debug('Quag of Ruin Def drop');
			return this.chainModify(0.85);
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		gen: 9,
	},
	clodofruin: {
		shortDesc: "Active Pokemon without this Ability have their Atk multiplied by 0.85. Ignores stat changes.",
		name: "Clod of Ruin",
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Clod of Ruin');
		},
		onAnyModifyAtk(atk, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Clod of Ruin')) return;
			if (!move.ruinedAtk?.hasAbility('Clod of Ruin')) move.ruinedAtk = abilityHolder;
			if (move.ruinedAtk !== abilityHolder) return;
			this.debug('Clod of Ruin Atk drop');
			return this.chainModify(0.85);
		},
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		flags: {breakable: 1},
		gen: 9,
	},

	// Archas
	saintlybullet: {
		shortDesc: "Snipe Shot always has STAB and heals the user by 1/8 (or 1/6 on a crit) of its max HP.",
		name: "Saintly Bullet",
		onModifyMove(move) {
			if (move.id === 'snipeshot') {
				move.forceSTAB = true;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.id === 'snipeshot') {
				const ratio = source.getMoveHitData(move).crit ? 6 : 8;
				this.heal(source.maxhp / ratio, source);
			}
		},
		flags: {},
		gen: 9,
	},

	// Arsenal
	onemore: {
		shortDesc: "Super Effective and Critical hits cause this Pokemon to flinch.",
		name: "One More",
		onHit(target, source, move) {
			const hitData = target.getMoveHitData(move);
			if (move.category === "Status" || hitData.typeMod <= 0 || !hitData.crit) return;
			if (!move.secondaries) move.secondaries = [];
			move.secondaries.push({
				chance: 100,
				volatileStatus: 'flinch',
			});
		},
		flags: {},
		gen: 9,
	},

	// Artemis
	supervisedlearning: {
		shortDesc: "Mold Breaker + Unaware + Clear Body.",
		name: "Supervised Learning",
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Supervised Learning", "[of] " + target);
			}
		},
		flags: {},
		gen: 9,
	},

	// ausma
	lattebreak: {
		shortDesc: "Regenerator + one-time priority boost per switch-in.",
		name: "Latte Break",
		onModifyPriority(relayVar, source, target, move) {
			if (this.effectState.latte) {
				return relayVar + 0.5;
			}
		},
		onAfterMove() {
			this.effectState.latte = false;
		},
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
			this.effectState.latte = true;
		},
		flags: {},
	},

	// Blitz
	blitzofruin: {
		shortDesc: "Active Pokemon without this Ability have their Speed multiplied by 0.75. Also Dazzling.",
		name: "Blitz of Ruin",
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Blitz of Ruin');
			this.add('-message', `${pokemon.name}'s Blitz of Ruin lowered the Speed of all surrounding Pokémon!`);
		},
		onAnyModifySpe(spe, pokemon) {
			if (!pokemon.hasAbility('Blitz of Ruin')) {
				return this.chainModify(0.75);
			}
		},
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Blitz of Ruin', move, '[of] ' + target);
				return false;
			}
		},
		flags: {breakable: 1},
	},

	// Cake
	notenoughremoval: {
		shortDesc: "Sets hazards at the end of every turn.",
		name: "Not Enough Removal",
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			const hazard = this.sample(['stealthrock', 'spikes', 'toxicspikes', 'stickyweb', 'gmaxsteelsurge']);
			let willDoSomething = false;
			let hasActivated = false;
			for (const side of this.sides) {
				if (!side.sideConditions[hazard]) {
					willDoSomething = true;
				} else {
					if (hazard === 'spikes') {
						willDoSomething = side.sideConditions[hazard].layers < 3;
					} else if (hazard === 'toxicspikes') {
						willDoSomething = side.sideConditions[hazard].layers < 2;
					}
				}
				if (willDoSomething && !hasActivated) {
					this.add('-activate', pokemon, 'ability: Not Enough Removal');
					hasActivated = true;
				}
				side.addSideCondition(hazard);
			}
		},
		flags: {},
	},

	// Chloe
	acetosa: {
		shortDesc: "This Pokemon's moves are changed to be Grass type and have 1.2x power.",
		name: "Acetosa",
		onModifyTypePriority: 1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (!(move.isZ && move.category !== 'Status') && !noModifyType.includes(move.id) &&
				!(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Grass';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
	},

	// Clefable
	thatshacked: {
		shortDesc: "Tries to inflict the foe with Torment at the end of each turn.",
		name: "That's Hacked",
		onResidual(target, source, effect) {
			if (!target.foes()) return;
			const abilMessages = [
				"All hacks and hacking methods are banned!",
				"Can't be having that.",
				"Naaah, miss me with that shit.",
				"Bit bullshit that, mate.",
				"Wait, thats illegal!",
				"Nope.",
				"I can't believe you've done this.",
				"No thank you.",
				"Seems a bit suss.",
				"Thats probably hacked, shouldnt use it here.",
				"Hacks will get you banned.",
				"You silly sausage",
				"Can you not?",
				"Yeah, thats a no from me.",
				"Lets not",
				"No fun allowed",
			];
			this.add(`c:|${getName((target.illusion || target).name)}|${this.sample(abilMessages)}`);
			this.add(`c:|${getName((target.illusion || target).name)}|snt are ${(source.illusion || source).name} n ${(target.illusion || target).name} plus ${target.foes()[0].name}`);

			for (const foe of target.foes()) {
				if (!foe.volatiles['torment']) {
					foe.addVolatile('torment');
				}
			}
		},
		flags: {},
	},

	// clerica
	masquerade: {
		shortDesc: "(Mimikyu only) The first hit is blocked: instead, takes 1/8 damage and gets +1 Atk/Spe.",
		name: "Masquerade",
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (
				effect && effect.effectType === 'Move' &&
				['mimikyu', 'mimikyutotem'].includes(target.species.id) && !target.transformed
			) {
				this.add('-activate', target, 'ability: Masquerade');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target) return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id) || target.transformed) {
				return;
			}
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move.type)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id) || target.transformed) {
				return;
			}

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move.type)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (['mimikyu', 'mimikyutotem'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = pokemon.species.id === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';
				pokemon.formeChange(speciesid, this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get(speciesid));
				this.boost({atk: 1, spe: 1});
				const img = "https://media.discordapp.net/attachments/764667730468536320/1079168557553831947/alcremie.png";
				this.add(`c:|${getName('clerica')}|/html <img src=${img} style="width:32px" />`);
			}
		},
		flags: {breakable: 1, failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1},
	},

	// Clouds
	jetstream: {
		shortDesc: "Delta Stream + Stealth Rock Immunity.",
		name: "Jet Stream",
		onStart(source) {
			this.field.setWeather('deltastream');
			this.add('message',	`Strong air currents keep Flying-types ahead of the chase!`);
		},
		onAnySetWeather(target, source, weather) {
			if (this.field.isWeather('deltastream') && !STRONG_WEATHERS.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility(['deltastream', 'jetstream'])) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		onDamage(damage, target, source, effect) {
			if (effect && effect.name === 'Stealth Rock') {
				return false;
			}
		},
		flags: {breakable: 1},
	},

	// Coolcodename
	firewall: {
		shortDesc: "Burns opponents that attempt to use status moves on this Pokemon; Status move immunity.",
		name: "Firewall",
		onTryHit(target, source, move) {
			if (move.category === 'Status' && target !== source) {
				if (!source.trySetStatus('brn', target)) {
					this.add('-immune', target, '[from] ability: Firewall');
				}
				return null;
			}
		},
		flags: {breakable: 1},
	},

	// Cor'Jon
	painfulexit: {
		shortDesc: "When this Pokemon switches out, foes lose 25% HP.",
		name: "Painful Exit",
		onBeforeSwitchOutPriority: -1,
		onBeforeSwitchOut(pokemon) {
			if (enemyStaff(pokemon) === "Mad Monty") {
				this.add(`c:|${getName('BreadLoeuf')}|Welp`);
			} else {
				this.add(`c:|${getName('BreadLoeuf')}|Just kidding!! Take this KNUCKLE SANDWICH`);
			}
			for (const foe of pokemon.foes()) {
				if (!foe || foe.fainted || !foe.hp) continue;
				this.add(`-anim`, pokemon, "Tackle", foe);
				this.damage(foe.hp / 4, foe, pokemon);
			}
		},
		flags: {},
	},

	// Corthius
	grassyemperor: {
		shortDesc: "On switch-in, summons Grassy Terrain. During Grassy Terrain, Attack is 1.33x.",
		name: "Grassy Emperor",
		onStart(pokemon) {
			if (this.field.setTerrain('grassyterrain')) {
				this.add('-activate', pokemon, 'Grassy Emperor', '[source]');
			} else if (this.field.isTerrain('grassyterrain')) {
				this.add('-activate', pokemon, 'ability: Grassy Emperor');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (this.field.isTerrain('grassyterrain')) {
				this.debug('Grassy Emperor boost');
				return this.chainModify([5461, 4096]);
			}
		},
		flags: {},
	},

	// Dawn of Artemis
	formchange: {
		shortDesc: ">50% HP Necrozma, else Necrozma-Ultra. SpA boosts become Atk boosts and vice versa.",
		name: "Form Change",
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Necrozma' || pokemon.transformed || !pokemon.hp) return;
			let newSet = 'Dawn of Artemis';
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.id === 'necrozma') return;
				this.add(`c:|${getName('Dawn of Artemis')}|Good, I'm healthy again, time to swap back.`);
			} else {
				if (pokemon.species.id === 'necrozmaultra') return;
				this.add(`c:|${getName('Dawn of Artemis')}|Time for me to transform and you to witness the power of Ares now!`);
				newSet += '-Ultra';
			}
			this.add('-activate', pokemon, 'ability: Form Change');
			changeSet(this, pokemon, ssbSets[newSet]);
			[pokemon.boosts['atk'], pokemon.boosts['spa']] = [pokemon.boosts['spa'], pokemon.boosts['atk']];
			this.add('-setboost', pokemon, 'spa', pokemon.boosts['spa'], '[silent]');
			this.add('-setboost', pokemon, 'atk', pokemon.boosts['atk'], '[silent]');
			this.add('-message', `${pokemon.name} swapped its Attack and Special Attack boosts!`);
		},
		flags: {},
	},

	// DaWoblefet
	shadowartifice: {
		shortDesc: "Traps adjacent foes. If KOed with a move, that move's user loses an equal amount of HP.",
		name: "Shadow Artifice",
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.hasAbility(['shadowtag', 'shadowartifice']) && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.hasAbility(['shadowtag', 'shadowartifice'])) {
				pokemon.maybeTrapped = true;
			}
		},
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				this.damage(target.getUndynamaxedHP(damage), source, target);
			}
		},
		flags: {},
	},

	// Elly
	stormsurge: {
		shortDesc: "On switch-in, this Pokemon summons Storm Surge.",
		name: "Storm Surge",
		onStart(source) {
			this.field.setWeather('stormsurge');
		},
	},

	// Emboar02
	hogwash: {
		shortDesc: "Reckless; on STAB moves, also add Rock Head. On non-STAB moves, recoil is recovery.",
		name: "Hogwash",
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.recoil || move.hasCrashDamage) {
				this.debug('Hogwash boost');
				return this.chainModify([4915, 4096]);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') {
					if (!source.hasType(this.activeMove.type)) this.heal(damage);
					return null;
				}
			}
		},
	},

	// Frostyicelad
	almostfrosty: {
		shortDesc: "This Pokemon's damaging moves hit twice. The second hit has its damage halved.",
		name: "Almost Frosty",
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'parentalbond' && move.id === 'secretpower' && move.hit < 2) {
				// hack to prevent accidentally suppressing King's Rock/Razor Fang
				return secondaries.filter(effect => effect.volatileStatus === 'flinch');
			}
		},
	},

	// Frozoid
	snowballer: {
		shortDesc: "This Pokemon's Attack is raised 1 stage if hit by an Ice move; Ice immunity.",
		name: "Snowballer",
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ice') {
				if (!this.boost({atk: 1})) {
					this.add('-immune', target, '[from] ability: Snowballer');
				}
				return null;
			}
		},
		flags: {breakable: 1},
	},

	// Fame
	socialjumpluffwarrior: {
		shortDesc: "Serene Grace + Mold Breaker.",
		name: "Social Jumpluff Warrior",
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Social Jumpluff Warrior');
		},
		onModifyMovePriority: -2,
		onModifyMove(move) {
			move.ignoreAbility = true;
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		flags: {},
	},

	// Ganjafin
	gamblingaddiction: {
		shortDesc: "When under 1/4 max HP: +1 Spe, heal to full HP, and all moves become Final Gambit.",
		name: "Gambling Addiction",
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (!this.effectState.gamblingAddiction && pokemon.hp && pokemon.hp < pokemon.maxhp / 4) {
				this.boost({spe: 1});
				this.heal(pokemon.maxhp);
				const move = this.dex.moves.get('finalgambit');
				const finalGambit = {
					move: move.name,
					id: move.id,
					pp: (move.noPPBoosts || move.isZ) ? move.pp : move.pp * 8 / 5,
					maxpp: (move.noPPBoosts || move.isZ) ? move.pp : move.pp * 8 / 5,
					target: move.target,
					disabled: false,
					used: false,
				};
				pokemon.moveSlots.fill(finalGambit);
				pokemon.baseMoveSlots.fill(finalGambit);
				this.effectState.gamblingAddiction = true;
			}
		},
		flags: {},
	},

	// havi
	mensiscage: {
		shortDesc: "Immune to status and is considered to be asleep. 30% chance to disable when hit.",
		name: "Mensis Cage",
		onDamagingHit(damage, target, source, move) {
			if (source.volatiles['disable']) return;
			if (!move.isMax && !move.flags['futuremove'] && move.id !== 'struggle') {
				if (this.randomChance(3, 10)) {
					source.addVolatile('disable', this.effectState.target);
				}
			}
		},
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Mensis Cage');
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Mensis Cage');
			}
			return false;
		},
		// Permanent sleep "status" implemented in the relevant sleep-checking effects
		flags: {},
	},

	// HiZo
	martyrcomplex: {
		desc: "If this Pokemon is knocked out, next Pokemon gets +1 Speed and +1 Attack/Special Attack, whichever is higher.",
		shortDesc: "If this Pokemon is KOed, next Pokemon gets +1 Spe and +1 Atk or SpA.",
		name: "Martyr Complex",
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				this.add('-activate', target, 'ability: Martyr Complex');
				this.add('-message', `${target.name} will be avenged!`);
				target.side.addSlotCondition(target, 'martyrcomplex');
			}
		},
		condition: {
			onSwap(target) {
				const boosts: SparseBoostsTable = {};
				boosts['spe'] = 1;
				if (target.getStat('atk', false, true) > target.getStat('spa', false, true)) {
					boosts['atk'] = 1;
				} else {
					boosts['spa'] = 1;
				}
				this.boost(boosts, target, target, this.effect);
				target.side.removeSlotCondition(target, 'martyrcomplex');
			},
		},
		// Permanent sleep "status" implemented in the relevant sleep-checking effects
		flags: {},
	},

	// HoeenHero
	misspelled: {
		shortDesc: "SpA 1.5x, Accuracy 0.8x, Never misses, only misspells moves.",
		name: "Misspelled",
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.modify(spa, 1.5);
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Special' && typeof accuracy === 'number') {
				return this.chainModify([3277, 4096]);
			}
		},
		// Misspelling implemented in scripts.ts#hitStepAccuracy
		flags: {},
	},

	// Hydrostatics
	hydrostaticpositivity: {
		shortDesc: "Sturdy + Storm Drain + Motor Drive + x1.3 accuracy of water & electric moves",
		name: "Hydrostatic Positivity",
		onTryHit(target, source, move) {
			// Storm Drain
			if (target !== source && move.type === 'Water') {
				if (!this.boost({spa: 1})) {
					this.add('-immune', target, '[from] ability: Hydrostatic Positivity');
				}
				return null;
			}

			// Motor Drive
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({spe: 1})) {
					this.add('-immune', target, '[from] ability: Hydrostatic Positivity');
				}
				return null;
			}

			// Sturdy
			if (move.ohko) {
				this.add('-immune', target, '[from] ability: Hydrostatic Positivity');
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			// Storm Drain
			if (move.type !== 'Water' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Hydrostatic Positivity');
				}
				return this.effectState.target;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			// Sturdy
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-ability', target, 'Hydrostatic Positivity');
				return target.hp - 1;
			}
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (typeof accuracy !== 'number') return;
			if (['Electric', 'Water'].includes(move.type)) {
				this.debug('Hydrostatic Positivity - enhancing accuracy');
				return this.chainModify([5325, 4096]);
			}
		},
	},

	// in the hills
	illiterit: {
		shortDesc: "Immune to moves with 12 or more alphanumeric characters.",
		name: "Illiterit",
		onTryHit(target, source, move) {
			if (target !== source && move.id.length >= 12) {
				this.add('-immune', target, '[from] ability: Illiterit');
				this.add(`c:|${getName('in the hills')}|Gee ${source.name}, maybe I should get a dictionary so I can understand what move you just used.`);
				return null;
			}
		},
		flags: {breakable: 1},
	},

	// Irpachuza
	mimeknowsbest: {
		desc: "Uses a random screen/protect move on switch in.",
		name: "Mime knows best",
		onStart(target) {
			const randomMove = [
				"Light Screen", "Reflect", "Protect", "Detect", "Barrier", "Spiky Shield", "Baneful Bunker",
				"Safeguard", "Mist", "King's Shield", "Magic Coat", "Aurora Veil",
			];
			const move = this.dex.getActiveMove(this.sample(randomMove));
			// allows use of Aurora Veil without hail
			if (move.name === "Aurora Veil") delete move.onTry;
			this.actions.useMove(move, target);
		},
		flags: {},
	},

	// J0rdy004
	fortifyingfrost: {
		name: "Fortifying Frost",
		shortDesc: "If Snow is active, this Pokemon's Sp. Atk and Sp. Def are 1.5x.",
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onModifySpD(spd, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
	},

	// kenn
	deserteddunes: {
		onStart(source) {
			this.field.setWeather('deserteddunes');
		},
		onAnySetWeather(target, source, weather) {
			if (this.field.getWeather().id === 'deserteddunes' && !STRONG_WEATHERS.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('deserteddunes')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Deserted Dunes",
		gen: 9,
	},

	// Kennedy
	anfield: {
		shortDesc: "Clears terrain/hazards/pseudo weathers. Summons Anfield Atmosphere.",
		name: "Anfield",
		onStart(target) {
			let success = false;
			if (this.field.terrain) {
				success = this.field.clearTerrain();
			}
			for (const side of this.sides) {
				const remove = [
					'reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge',
				];
				for (const sideCondition of remove) {
					if (side.removeSideCondition(sideCondition)) {
						success = true;
					}
				}
			}
			if (Object.keys(this.field.pseudoWeather).length) {
				for (const pseudoWeather in this.field.pseudoWeather) {
					if (this.field.removePseudoWeather(pseudoWeather)) success = true;
				}
			}
			if (success) {
				this.add('-activate', target, 'ability: Anfield');
			}
			this.field.addPseudoWeather('anfieldatmosphere', target, target.getAbility());
		},
		flags: {},
	},
	youllneverwalkalone: {
		shortDesc: "Boosts Atk, Def, SpD, and Spe by 25% under Anfield Atmosphere.",
		name: "You'll Never Walk Alone",
		onStart(pokemon) {
			if (this.field.getPseudoWeather('anfieldatmosphere')) {
				this.add('-ability', pokemon, 'You\'ll Never Walk Alone');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, source, target, move) {
			if (this.field.getPseudoWeather('anfieldatmosphere')) {
				this.debug('You\'ll Never Walk Alone atk boost');
				return this.chainModify([5120, 4096]);
			}
		},
		onModifyDefPriority: 6,
		onModifyDef(def, target, source, move) {
			if (this.field.getPseudoWeather('anfieldatmosphere')) {
				this.debug('You\'ll Never Walk Alone def boost');
				return this.chainModify([5120, 4096]);
			}
		},
		onModifySpDPriority: 6,
		onModifySpD(spd, target, source, move) {
			if (this.field.getPseudoWeather('anfieldatmosphere')) {
				this.debug('You\'ll Never Walk Alone spd boost');
				return this.chainModify([5120, 4096]);
			}
		},
		onModifySpe(spe, pokemon) {
			if (this.field.getPseudoWeather('anfieldatmosphere')) {
				this.debug('You\'ll Never Walk Alone spe boost');
				return this.chainModify([5120, 4096]);
			}
		},
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1},
	},

	// kingbaruk
	peerpressure: {
		shortDesc: "All moves used while this Pokemon is on the field consume 4 PP.",
		name: "Peer Pressure",
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Peer Pressure');
		},
		onAnyDeductPP(target, source) {
			return 3;
		},
		flags: {},
	},

	// Kiwi
	surehitsorcery: {
		name: "Sure Hit Sorcery",
		shortDesc: "No Guard + Prankster + Grassy Surge.",
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) {
				return true;
			}
			return accuracy;
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		onStart(source) {
			this.field.setTerrain('grassyterrain');
		},
		flags: {},
	},

	// Klmondo
	superskilled: {
		name: "Super Skilled",
		shortDesc: "Skill Link + Multiscale.",
		onModifyMove(move) {
			if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Multiscale weaken');
				return this.chainModify(0.5);
			}
		},
		flags: {breakable: 1},
	},

	// Kris
	cacophony: {
		name: "Cacophony",
		shortDesc: "Sound moves: 1.5x BP, ignore type-based immunities. Opposing sound fails.",
		onBasePowerPriority: 7,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) {
				this.debug('Cacophony boost');
				return this.chainModify([6144, 4096]);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Cacophony');
				return null;
			}
		},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			move.ignoreImmunity = true;
		},
		flags: {},
	},

	// Krytocon
	curseofdexit: {
		name: "Curse of Dexit",
		shortDesc: "User sets Curse against foe on entry; 25% of max HP lost.",
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Curse of Dexit');
					this.directDamage(pokemon.maxhp / 4, pokemon, pokemon);
					activated = true;
				}
				target.addVolatile('curse', pokemon);
			}
		},
		flags: {},
	},

	// Lasen
	idealizedworld: {
		shortDesc: "Removes everything on Switchin.",
		name: "Idealized World",
		onStart(pokemon) {
			const target = pokemon.side.foe;
			this.add('-ability', pokemon, 'Idealized World');
			const displayText = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
			for (const targetCondition of Object.keys(target.sideConditions)) {
				if (target.removeSideCondition(targetCondition) && displayText.includes(targetCondition)) {
					this.add('-sideend', target, this.dex.conditions.get(targetCondition).name, '[from] ability: Idealized World', '[of] ' + pokemon);
				}
			}
			for (const sideCondition of Object.keys(pokemon.side.sideConditions)) {
				if (pokemon.side.removeSideCondition(sideCondition) && displayText.includes(sideCondition)) {
					this.add('-sideend', pokemon.side, this.dex.conditions.get(sideCondition).name, '[from] ability: Idealized World', '[of] ' + pokemon);
				}
			}
			this.field.clearTerrain();
			this.field.clearWeather();
			for (const pseudoWeather of Object.keys(this.field.pseudoWeather)) {
				this.field.removePseudoWeather(pseudoWeather);
			}
			this.add('-clearallboost');
			for (const poke of this.getAllActive()) {
				poke.clearBoosts();
			}
		},
		flags: {},
	},

	// Lionyx
	enormoos: {
		name: "EnorMOOs",
		shortDesc: "This Pokemon's Defense is used in damage calculation instead of Attack or Sp. Atk.",
		onModifyMove(move, pokemon, target) {
			if (move.category !== "Status") {
				move.overrideOffensiveStat = 'def';
			}
		},
		flags: {},
	},

	// Lumari
	pyrotechnic: {
		shortDesc: "Critical hits are guaranteed when foe is burned.",
		name: "Pyrotechnic",
		onModifyCritRatio(critRatio, source, target) {
			if (target?.status === 'brn') return 5;
		},
		flags: {},
	},

	// Lunell
	lowtidehightide: {
		shortDesc: "Switch-in sets Gravity, water immune, traps water type foes.",
		name: "Low Tide, High Tide",
		onStart(source) {
			this.field.addPseudoWeather('gravity', source);
		},
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				this.add('-immune', target, '[from] ability: Low Tide, High Tide');
				return null;
			}
		},
		onFoeTrapPokemon(pokemon) {
			if (pokemon.hasType('Water') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.knownType || pokemon.hasType('Water')) {
				pokemon.maybeTrapped = true;
			}
		},
		flags: {breakable: 1},
	},

	// Mad Monty
	climatechange: {
		shortDesc: "1.5x SpA in sun, 1.5x Def/SpD in snow, heals 50% in rain. Changes forme/weather.",
		name: "Climate Change",
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
				this.field.setWeather('raindance');
				break;
			case 'raindance':
				this.field.setWeather('snow');
				break;
			default:
				this.field.setWeather('sunnyday');
				break;
			}
		},
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Castform' || pokemon.transformed) return;
			let forme = null;
			let relevantMove = null;
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'castformsunny') {
					forme = 'Castform-Sunny';
					relevantMove = 'Solar Beam';
				}
				break;
			case 'raindance':
			case 'primordialsea':
			case 'stormsurge':
				if (pokemon.species.id !== 'castformrainy') {
					forme = 'Castform-Rainy';
					relevantMove = 'Thunder';
					this.heal(pokemon.baseMaxhp / 2);
				}
				break;
			case 'hail':
			case 'snow':
				if (pokemon.species.id !== 'castformsnowy') {
					forme = 'Castform-Snowy';
					relevantMove = 'Aurora Veil';
				}
				break;
			default:
				if (pokemon.species.id !== 'castform') forme = 'Castform';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '[msg]');

				if (!relevantMove) return;
				const move = this.dex.moves.get(relevantMove);

				const sketchIndex = Math.max(
					pokemon.moves.indexOf("solarbeam"), pokemon.moves.indexOf("thunder"), pokemon.moves.indexOf("auroraveil")
				);
				if (sketchIndex < 0) return;
				const carryOver = pokemon.moveSlots[sketchIndex].pp / pokemon.moveSlots[sketchIndex].maxpp;
				const sketchedMove = {
					move: move.name,
					id: move.id,
					pp: Math.floor((move.pp * 8 / 5) * carryOver),
					maxpp: (move.pp * 8 / 5),
					target: move.target,
					disabled: false,
					used: false,
				};
				pokemon.moveSlots[sketchIndex] = sketchedMove;
				pokemon.baseMoveSlots[sketchIndex] = sketchedMove;
			}
		},
		onModifySpA(spa, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onModifyDef(def, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onModifySpD(spd, pokemon) {
			if (['hail', 'snow'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
	},

	// maroon
	builtdifferent: {
		shortDesc: "Stamina + Normal type moves get +1 priority.",
		name: "Built Different",
		onDamagingHit(damage, target, source, effect) {
			this.boost({def: 1});
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === 'Normal') return priority + 1;
		},
		flags: {},
	},

	// Mathy
	dynamictyping: {
		shortDesc: "Moves used by all Pokemon are ??? type.",
		name: "Dynamic Typing",
		onStart(pokemon) {
			this.add('-ability', pokemon, "Dynamic Typing");
		},
		onModifyTypePriority: 2,
		onAnyModifyType(move, pokemon, target) {
			move.type = "???";
		},
		flags: {},
	},

	// Mex
	timedilation: {
		shortDesc: "+10% BP for every 10 turns passed in battle, max 200%.",
		name: "Time Dilation",
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			const turnMultiplier = Math.floor(this.turn / 10);
			let bpMod = 1 + (0.1 * turnMultiplier);
			if (bpMod > 2) bpMod = 2;
			return this.chainModify(bpMod);
		},
		flags: {},
	},

	// Mia
	hacking: {
		name: "Hacking",
		shortDesc: "Hacks into PS and finds out if the enemy has any super effective moves.",
		onStart(pokemon) {
			this.add(`c:|${getName('Mia')}|One moment, please. One does not simply go into battle blind.`);
			const side = pokemon.side.id === 'p1' ? 'p2' : 'p1';
			this.add(
				`message`,
				(
					`ssh sim@pokemonshowdown.com && nc -U logs/repl/sim <<< ` +
					`"Users.get('mia').popup(battle.sides.get('${side}').pokemon.map(m => Teams.exportSet(m)))"`
				)
			);
			let warnMoves: (Move | Pokemon)[][] = [];
			let warnBp = 1;
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					let bp = move.basePower;
					if (move.ohko) bp = 150;
					if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') bp = 120;
					if (bp === 1) bp = 80;
					if (!bp && move.category !== 'Status') bp = 80;
					if (bp > warnBp) {
						warnMoves = [[move, target]];
						warnBp = bp;
					} else if (bp === warnBp) {
						warnMoves.push([move, target]);
					}
				}
			}
			if (!warnMoves.length) {
				this.add(`c:|${getName('Mia')}|Fascinating. None of your sets have any moves of interest.`);
				return;
			}
			const [warnMoveName, warnTarget] = this.sample(warnMoves);
			this.add(
				'message',
				`Mia hacked into PS and looked at her opponent's sets. ` +
					`${warnTarget.name}'s move ${warnMoveName} drew her eye.`
			);
			this.add(`c:|${getName('Mia')}|Interesting. With that in mind, bring it!`);
		},
		flags: {},
	},

	// Monkey
	harambehit: {
		shortDesc: "Unseen Fist + Iron Fist.",
		name: "Harambe Hit",
		onModifyMove(move) {
			if (move.flags['contact']) delete move.flags['protect'];
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['punch']) {
				this.debug('Harambe Hit boost');
				return this.chainModify([4915, 4096]);
			}
		},
		flags: {},
	},

	// Ney
	pranksterplus: {
		shortDesc: "This Pokemon's Status moves have priority raised by 1. Dark types are not immune.",
		name: "Prankster Plus",
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				return priority + 1;
			}
		},
		flags: {},
	},

	// Notater517
	ventcrosser: {
		shortDesc: "Uses Baton Pass after every move.",
		name: "Vent Crosser",
		onAfterMove(source, target, move) {
			this.actions.useMove('Baton Pass', source);
		},
		flags: {},
	},

	// Nyx
	lasthymn: {
		name: "Last Hymn",
		shortDesc: "Weakens incoming attacks for each Pokemon fainted.",
		onStart(pokemon) {
			if (pokemon.side.totalFainted) {
				this.add('-activate', pokemon, 'ability: Last Hymn');
				const fallen = Math.min(pokemon.side.totalFainted, 5);
				this.add('-start', pokemon, `fallen${fallen}`, '[silent]');
				this.effectState.fallen = fallen;
			}
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
		},
		onBasePowerPriority: 21,
		onFoeBasePower(basePower, attacker, defender, move) {
			if (this.effectState.fallen) {
				return this.chainModify([10, (10 + this.effectState.fallen)]);
			}
		},
	},

	// PartMan
	ctiershitposter: {
		shortDesc: "-1 Atk/SpA, +1 Def/SpD. +1 Atk/SpA/Spe, -1 Def/SpD, Mold Breaker if 420+ dmg taken.",
		name: "C- Tier Shitposter",
		onDamage(damage, target, source, effect) {
			target.m.damageTaken ??= 0;
			target.m.damageTaken += damage;
			if (target.set && !target.set.shiny) {
				if (target.m.damageTaken >= 420) {
					target.set.shiny = true;
					if (!target.hp) {
						return this.add(`c:|${getName('PartMan')}|MWAHAHA NOW YOU - oh I'm dead`);
					}
					this.add(`c:|${getName('PartMan')}|That's it. Get ready to be rapid-fire hugged.`);
					target.clearBoosts();
					this.add('-clearboost', target);
					this.boost({atk: 1, def: -1, spa: 1, spd: -1, spe: 1});
					const details = target.species.name + (target.level === 100 ? '' : ', L' + target.level) +
						(target.gender === '' ? '' : ', ' + target.gender) + (target.set.shiny ? ', shiny' : '');
					target.details = details;
					this.add('detailschange', target, details);
				}
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.set.shiny) move.ignoreAbility = true;
		},
		onStart(pokemon) {
			if (!pokemon.set.shiny) {
				this.boost({atk: -1, def: 1, spa: -1, spd: 1});
			} else {
				this.boost({atk: 1, def: -1, spa: 1, spd: -1, spe: 1});
			}
		},
	},

	// phoopes
	ididitagain: {
		shortDesc: "Bypasses Sleep Clause Mod once per battle.",
		name: "I Did It Again",
		flags: {},
		// implemented in rulesets.ts
	},

	// PYRO
	hardcorehustle: {
		shortDesc: "Moves have 15% more power and -5% Acc for each fainted ally, up to 5 allies.",
		name: "Hardcore Hustle",
		onStart(pokemon) {
			if (pokemon.side.totalFainted) {
				this.add('-activate', pokemon, 'ability: Hardcore Hustle');
				const fallen = Math.min(pokemon.side.totalFainted, 5);
				this.add('-start', pokemon, `fallen${fallen}`, '[silent]');
				this.effectState.fallen = fallen;
			}
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.effectState.fallen) {
				const powMod = [1, 1.15, 1.3, 1.45, 1.6, 1.75];
				this.debug(`Hardcore Hustle boost: ${powMod[this.effectState.fallen]}`);
				return this.chainModify(powMod[this.effectState.fallen]);
			}
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (this.effectState.fallen) {
				const accMod = [1, 0.95, 0.90, 0.85, 0.80, 0.75];
				this.debug(`Hardcore Hustle debuff: ${accMod[this.effectState.fallen]}`);
				return this.chainModify(accMod[this.effectState.fallen]);
			}
		},
		flags: {},
	},

	// Quite Quiet
	fancyscarf: {
		shortDesc: "Shield Dust + Magic Guard",
		name: "Fancy Scarf",
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onModifySecondaries(secondaries) {
			this.debug('Fancy Scarf prevent secondary');
			return secondaries.filter(effect => !!(effect.self || effect.dustproof));
		},
	},

	// Ransei
	ultramystik: {
		shortDesc: "Stats 1.5x until hit super effectively + Magic Guard + Leftovers.",
		name: "Ultra Mystik",
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.effectState.superHit = true;
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (this.effectState.superHit || pokemon.ignoringAbility()) return;
			return this.chainModify(1.5);
		},
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (this.effectState.superHit || pokemon.ignoringAbility()) return;
			return this.chainModify(1.5);
		},
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (this.effectState.superHit || pokemon.ignoringAbility()) return;
			return this.chainModify(1.5);
		},
		onModifySpDPriority: 6,
		onModifySpD(spd, pokemon) {
			if (this.effectState.superHit || pokemon.ignoringAbility()) return;
			return this.chainModify(1.5);
		},
		onModifySpe(spe, pokemon) {
			if (this.effectState.superHit || pokemon.ignoringAbility()) return;
			return this.chainModify(1.5);
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon, pokemon.getAbility());
		},
	},

	// ReturnToMonkey
	monkeseemonkedo: {
		shortDesc: "Boosts Atk or SpA by 1 based on foe's defenses, then copies foe's Ability.",
		name: "Monke See Monke Do",
		onStart(pokemon) {
			let totaldef = 0;
			let totalspd = 0;
			for (const target of pokemon.foes()) {
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({spa: 1});
			} else if (totalspd) {
				this.boost({atk: 1});
			}

			// n.b. only affects Hackmons
			// interaction with No Ability is complicated: https://www.smogon.com/forums/threads/pokemon-sun-moon-battle-mechanics-research.3586701/page-76#post-7790209
			if (pokemon.adjacentFoes().some(foeActive => foeActive.ability === 'noability')) {
				this.effectState.gaveUp = true;
			}
			// interaction with Ability Shield is similar to No Ability
			if (pokemon.hasItem('Ability Shield')) {
				this.add('-block', pokemon, 'item: Ability Shield');
				this.effectState.gaveUp = true;
			}
		},
		onUpdate(pokemon) {
			if (!pokemon.isStarted || this.effectState.gaveUp) return;

			const possibleTargets = pokemon.adjacentFoes().filter(
				target => !target.getAbility().flags['notrace'] && target.ability !== 'noability'
			);
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			const ability = target.getAbility();
			if (pokemon.setAbility(ability)) {
				this.add('-ability', pokemon, ability, '[from] ability: Monke See Monke Do', '[of] ' + target);
			}
		},
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1},
	},

	// Rumia
	youkaiofthedusk: {
		shortDesc: "Defense: x2. Status moves: +1 Priority.",
		name: "Youkai of the Dusk",
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(2);
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		flags: {},
	},

	// Siegfried
	magicalmysterycharge: {
		shortDesc: "Summons Electric Terrain upon switch-in, +1 boost to Sp. Def during Electric Terrain.",
		name: "Magical Mystery Charge",
		onStart(source) {
			this.field.setTerrain('electricterrain');
		},
		onModifySpDPriority: 5,
		onModifySpD(spd, pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
	},

	// skies
	spikesofwrath: {
		shortDesc: "Stamina + Cheek Pouch + sets Spikes and Toxic Spikes upon KO.",
		name: "Spikes of Wrath",
		onDamagingHit(damage, target, source, effect) {
			if (target.hp) {
				this.boost({def: 1});
			} else {
				const side = source.isAlly(target) ? source.side.foe : source.side;
				const spikes = side.sideConditions['spikes'];
				const toxicSpikes = side.sideConditions['toxicspikes'];
				if ((!spikes || spikes.layers < 3)) {
					this.add('-activate', target, 'ability: Spikes of Wrath');
					side.addSideCondition('spikes', target);
				}
				if ((!toxicSpikes || toxicSpikes.layers < 2)) {
					this.add('-activate', target, 'ability: Spikes of Wrath');
					side.addSideCondition('toxicspikes', target);
				}
			}
		},
		onEatItem(item, pokemon) {
			this.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
	},

	// Soft Flex
	adaptiveengineering: {
		shortDesc: "Every turn, raises a random stat by 1 stage if the foe has more raised stats.",
		name: "Adaptive Engineering",
		onResidual(source) {
			if (source === undefined || source.foes() === undefined || source.foes()[0] === undefined) return;
			if (source.positiveBoosts() < source.foes()[0].positiveBoosts()) {
				const stats: BoostID[] = [];
				let stat: BoostID;
				for (stat in source.boosts) {
					if (stat === 'accuracy' || stat === 'evasion') continue;
					if (source.boosts[stat] < 6) {
						stats.push(stat);
					}
				}
				if (stats.length) {
					const randomStat = this.sample(stats);
					this.boost({[randomStat]: 1}, source, source);
				}
			}
		},
		flags: {},
	},

	// Solaros & Lunaris
	ridethesun: {
		shortDesc: "Drought + Chlorophyll",
		name: "Ride the Sun!",
		onStart(source) {
			for (const action of this.queue) {
				if (action.choice === 'runPrimal' && action.pokemon === source && source.species.id === 'groudon') return;
				if (action.choice !== 'runSwitch' && action.choice !== 'runPrimal') break;
			}
			this.field.setWeather('sunnyday');
		},
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		flags: {},
	},

	// Struchni
	overaskedclause: {
		shortDesc: "Moves used on the previous turn will always fail.",
		name: "Overasked Clause",
		onFoeBeforeMove(target, source, move) {
			if (target.lastMove && target.lastMove.id !== 'struggle') {
				if (move.id === target.lastMove.id) {
					this.attrLastMove('[still]');
					this.add('cant', this.effectState.target, 'ability: Overasked Clause', move, '[of] ' + target);
					return false;
				}
			}
		},
	},

	// Sulo
	protectionofthegelatin: {
		shortDesc: "Magic Guard + Stamina",
		name: "Protection of the Gelatin",
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onDamagingHit(damage, target, source, effect) {
			this.boost({def: 1});
		},
	},

	// Swiffix
	stinky: {
		desc: "10% chance to either poison or paralyze the Pokemon on hit.",
		name: "Stinky",
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (move.category !== "Status") {
				this.debug('Adding Stinky psn/par');
				if (!move.secondaries) move.secondaries = [];
				move.secondaries.push({
					chance: 10,
					onHit(target, source) {
						const result = this.random(2);
						if (result === 0) {
							target.trySetStatus('par', source);
						} else {
							target.trySetStatus('psn', source);
						}
					},
				});
			}
		},
		flags: {},
	},

	// Theia
	powerabuse: {
		shortDesc: "Summons Sun; attacks do 66% less damage to this Pokemon; may burn physical attackers.",
		name: "Power Abuse",
		onStart() {
			this.field.setWeather('sunnyday');
		},
		onSourceModifyDamage() {
			return this.chainModify(0.34);
		},
		onDamagingHit(damage, target, source, move) {
			if (move.category === "Physical" && this.randomChance(1, 5)) {
				source.trySetStatus('brn', target);
			}
		},
		flags: {breakable: 1},
	},

	// Tico
	eternalgenerator: {
		shortDesc: "Regenerator + Hazard immune.",
		name: "Eternal Generator",
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		flags: {breakable: 1},
	},

	// TheJesucristoOsAma
	thegraceofjesuschrist: {
		shortDesc: "Changes plates at the end of every turn.",
		name: "The Grace Of Jesus Christ",
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			const plates = this.dex.items.all().filter(item => item.onPlate && !item.zMove);
			const item = this.sample(plates.filter(plate => this.toID(plate) !== this.toID(pokemon.item)));
			pokemon.item = '';
			this.add('-item', pokemon, item, '[from] ability: The Grace Of Jesus Christ');
			pokemon.setItem(item);
		},
		flags: {},
	},

	// trace
	eyesofeternity: {
		shortDesc: "Moves used by/against this Pokemon always hit; only damaged by attacks.",
		name: "Eyes of Eternity",
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) {
				return true;
			}
			return accuracy;
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		flags: {},
	},

	// Two of Roses
	aswesee: {
		name: "As We See",
		desc: "Once per turn, when any active Pokemon has a stat boosted, this Pokemon has a 50% chance of copying it and a 15% chance to raise another random stat.",
		shortDesc: "1x per turn: Stat gets boosted -> 50% chance to copy, 15% to raise another.",
		onFoeAfterBoost(boost, target, source, effect) { // Opportunist
			if (this.randomChance(1, 2)) {
				if (effect && ['As We See', 'Mirror Herb', 'Opportunist'].includes(effect.name)) return;
				const pokemon = this.effectState.target;
				const positiveBoosts: Partial<BoostsTable> = {};
				let i: BoostID;
				for (i in boost) {
					if (boost[i]! > 0) {
						positiveBoosts[i] = boost[i];
					}
				}
				if (Object.keys(positiveBoosts).length < 1) return;
				this.boost(positiveBoosts, pokemon);
				this.effectState.triggered = true;
			}
		},
		onResidual(target, source, effect) {
			if (this.randomChance(15, 100) && this.effectState.triggered) {
				const stats: BoostID[] = [];
				const boost: SparseBoostsTable = {};
				let statPlus: BoostID;
				for (statPlus in target.boosts) {
					if (statPlus === 'accuracy' || statPlus === 'evasion') continue;
					if (target.boosts[statPlus] < 6) {
						stats.push(statPlus);
					}
				}
				const randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
				if (randomStat) boost[randomStat] = 1;
				this.boost(boost, target, target);
			}
			this.effectState.triggered = false;
		},
		flags: {},
	},

	// UT
	galeguard: {
		shortDesc: "Only damaged by direct attacks; Flying moves +1 priority.",
		name: "Gale Guard",
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === 'Flying') return priority + 1;
		},
		flags: {},
	},

	// umuwo
	soulsurfer: {
		name: "Soul Surfer",
		shortDesc: "Rain on entry; Speed: x2 in Electric Terrain.",
		onStart(source) {
			this.field.setWeather('raindance');
		},
		onModifySpe(spe) {
			if (this.field.isTerrain('electricterrain')) {
				return this.chainModify(2);
			}
		},
		flags: {},
	},

	// Valerian
	fullbloom: {
		shortDesc: "This Pokémon's priority moves have double power.",
		name: "Full Bloom",
		onBasePowerPriority: 30,
		onBasePower(basePower, pokemon, target, move) {
			if (move.priority > 0) {
				return this.chainModify(2);
			}
		},
	},

	// Venous
	concreteoverwater: {
		shortDesc: "+1 Def/Spd before getting hit by a Super Effective move",
		name: "Concrete Over Water",
		onTryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			if (target.runEffectiveness(move) > 0) {
				this.boost({def: 1, spd: 1}, target);
			}
		},
		flags: {},
	},

	// Violet
	seenoevilhearnoevilspeaknoevil: {
		shortDesc: "Dark Immunity; Cornerstone: Sound immunity. Wellspring: Moves never miss. Hearthflame: 1.3x bp vs male Pokemon.",
		name: "See No Evil, Hear No Evil, Speak No Evil",
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound'] && target.species.id === 'ogerponcornerstone') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: See No Evil, Hear No Evil, Speak No Evil');
				}
				return null;
			}

			if (target !== source && move.type === 'Dark') {
				this.add('-immune', target, '[from] ability: See No Evil, Hear No Evil, Speak No Evil');
				return null;
			}
		},
		onSourceAccuracy(accuracy, target, source, move) {
			if (source.species.id !== 'ogerponwellspring') return;
			if (typeof accuracy !== 'number') return;
			return true;
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (source.species.id !== 'ogerponwellspring') return;
			if (typeof move.accuracy === 'number' && move.accuracy < 100) {
				this.debug('neutralize');
				return this.chainModify(0.75);
			}
		},
		onBasePowerPriority: 24,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.species.id !== 'ogerponhearthflame') return;
			if (defender.gender === 'M') {
				this.debug('attack boost');
				return this.chainModify(1.3);
			}
		},
		flags: {breakable: 1},
	},

	// WarriorGallade
	primevalharvest: {
		shortDesc: "Sun: Heal 1/8 max HP, random berry if no item. Else 50% random berry if no item.",
		name: "Primeval Harvest",
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			const isSunny = this.field.isWeather(['sunnyday', 'desolateland']);
			if (isSunny) {
				this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon, pokemon.getAbility());
			}
			if (isSunny || this.randomChance(1, 2)) {
				if (pokemon.hp && !pokemon.item) {
					const berry = this.sample([
						'cheri', 'chesto', 'pecha', 'lum', 'aguav', 'liechi', 'ganlon', 'petaya',
						'apicot', 'salac', 'micle', 'lansat', 'enigma', 'custap', 'kee', 'maranga',
					]) + 'berry';
					pokemon.setItem(berry);
					pokemon.lastItem = '';
					this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Primeval Harvest');
				}
			}
		},
		flags: {},
	},

	// WigglyTree
	treestance: {
		shortDesc: "No recoil; 3/4 damage from supereffective attacks.",
		name: "Tree Stance",
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') return null;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Tree Stance neutralize');
				return this.chainModify(0.75);
			}
		},
		flags: {breakable: 1},
	},

	// xy01
	panic: {
		shortDesc: "Lowers the opponent's Atk and Sp. Atk by 1 upon switch-in.",
		name: "Panic",
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Panic', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({atk: -1, spa: -1}, target, pokemon, null, true);
				}
			}
		},
		flags: {},
	},

	// Yellow Paint
	yellowmagic: {
		shortDesc: "+25% HP, +1 SpA, +1 Spe, Charge, or Paralyzes attacker when hit by an Electric move; Electric immunity.",
		name: "Yellow Magic",
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				let didSomething = false;
				switch (this.random(5)) {
				case 0:
					didSomething = !!this.heal(target.baseMaxhp / 4);
					break;
				case 1:
					didSomething = !!this.boost({spa: 1}, target, target);
					break;
				case 2:
					didSomething = !!this.boost({spe: 1}, target, target);
					break;
				case 3:
					if (!target.volatiles['charge']) {
						this.add('-ability', target, 'Yellow Magic');
						target.addVolatile('charge', target);
						didSomething = true;
					}
					break;
				case 4:
					didSomething = source.trySetStatus('par', target);
					break;
				}
				if (!didSomething) {
					this.add('-immune', target, '[from] ability: Yellow Magic');
				}
				return null;
			}
		},
		flags: {breakable: 1},
	},

	// YveltalNL
	heightadvantage: {
		shortDesc: "If this Pokemon's height is more than that of the opponent, lowers the opponent’s Atk and Sp. Atk by 1..",
		name: "Height Advantage",
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Height Advantage', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					if (this.dex.species.get(pokemon.species).heightm > this.dex.species.get(target.species).heightm) {
						this.boost({atk: -1, spa: -1}, target, pokemon, null, true);
					}
				}
			}
		},
		flags: {},
	},

	// za
	troll: {
		shortDesc: "Using moves that can flinch makes user move first in their priority bracket.",
		name: "Troll",
		onModifyPriority(relayVar, source, target, move) {
			if (!move) return;
			if (move.secondary?.volatileStatus === 'flinch') {
				return relayVar + 0.5;
			}
		},
	},

	// Zarel
	tempochange: {
		shortDesc: "Switches Meloetta's forme between Aria and Pirouette at the end of each turn.",
		name: "Tempo Change",
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.species.baseSpecies !== 'Meloetta') return;
			if (pokemon.species.name === 'Meloetta') {
				changeSet(this, pokemon, ssbSets['Zarel-Pirouette'], true);
			} else {
				changeSet(this, pokemon, ssbSets['Zarel'], true);
			}
		},
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1},
	},

	// zoro
	ninelives: {
		shortDesc: "Twice per battle, Umbreon will survive a lethal hit with 1 HP remaining, regardless of the HP it was at.",
		name: "Nine Lives",
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Nine Lives');
				return null;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			if (damage >= target.hp && effect?.effectType === 'Move' && !this.effectState.busted) {
				this.add('-ability', target, 'Nine Lives');
				if (this.effectState.busted === 0) {
					this.effectState.busted = 1;
				} else {
					this.effectState.busted = 0;
				}
				return target.hp - 1;
			}
		},
		// Yes, this looks very patchwork-y. declaring new persistent global variables seems to be a no-go here
		// so i repurposed one which should likely not affect anything else - have tested with clerica/zoro on both sides
		// and their disguise/sturdy state is unaffected by modifying anything here. but let wg know if this breaks stuff.
		flags: {breakable: 1},
	},

	// Modified abilities
	baddreams: {
		inherit: true,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (target.status === 'slp' || target.hasAbility(['comatose', 'mensiscage'])) {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
	},
	deltastream: {
		inherit: true,
		onAnySetWeather(target, source, weather) {
			if (this.field.getWeather().id === 'deltastream' && !STRONG_WEATHERS.includes(weather.id)) return false;
		},
	},
	desolateland: {
		inherit: true,
		onAnySetWeather(target, source, weather) {
			if (this.field.getWeather().id === 'desolateland' && !STRONG_WEATHERS.includes(weather.id)) return false;
		},
	},
	dryskin: {
		inherit: true,
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea' || effect.id === 'stormsurge') {
				this.heal(target.baseMaxhp / 8);
			} else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
	},
	forecast: {
		inherit: true,
		onWeatherChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Castform' || pokemon.transformed) return;
			let forme = null;
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'castformsunny') forme = 'Castform-Sunny';
				break;
			case 'raindance':
			case 'primordialsea':
			case 'stormsurge':
				if (pokemon.species.id !== 'castformrainy') forme = 'Castform-Rainy';
				break;
			case 'hail':
			case 'snow':
				if (pokemon.species.id !== 'castformsnowy') forme = 'Castform-Snowy';
				break;
			default:
				if (pokemon.species.id !== 'castform') forme = 'Castform';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '[msg]');
			}
		},
	},
	hydration: {
		inherit: true,
		onResidual(pokemon) {
			if (pokemon.status && ['raindance', 'primordialsea', 'stormsurge'].includes(pokemon.effectiveWeather())) {
				this.debug('hydration');
				this.add('-activate', pokemon, 'ability: Hydration');
				pokemon.cureStatus();
			}
		},
	},
	neutralizinggas: {
		inherit: true,
		onPreStart(pokemon) {
			this.add('-ability', pokemon, 'Neutralizing Gas');
			pokemon.abilityState.ending = false;
			for (const target of this.getAllActive()) {
				if (target.hasItem('Ability Shield')) {
					this.add('-block', target, 'item: Ability Shield');
					continue;
				}
				// Can't suppress a Tatsugiri inside of Dondozo already
				if (target.volatiles['commanding']) {
					continue;
				}
				if (target.illusion) {
					this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, pokemon, 'neutralizinggas');
				}
				if (target.volatiles['slowstart']) {
					delete target.volatiles['slowstart'];
					this.add('-end', target, 'Slow Start', '[silent]');
				}
				if (STRONG_WEATHERS.includes(target.getAbility().id)) {
					this.singleEvent('End', this.dex.abilities.get(target.getAbility().id), target.abilityState, target, pokemon, 'neutralizinggas');
				}
			}
		},
	},
	overcoat: {
		inherit: true,
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'deserteddunes' || type === 'hail' || type === 'powder') return false;
		},
	},
	primordialsea: {
		inherit: true,
		onAnySetWeather(target, source, weather) {
			if (this.field.getWeather().id === 'primordialsea' && !STRONG_WEATHERS.includes(weather.id)) return false;
		},
	},
	raindish: {
		inherit: true,
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea' || effect.id === 'stormsurge') {
				this.heal(target.baseMaxhp / 16);
			}
		},
	},
	sandforce: {
		inherit: true,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isWeather(['sandstorm', 'deserteddunes'])) {
				if (move.type === 'Rock' || move.type === 'Ground' || move.type === 'Steel') {
					this.debug('Sand Force boost');
					return this.chainModify([5325, 4096]);
				}
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'deserteddunes') return false;
		},
	},
	sandrush: {
		inherit: true,
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather(['sandstorm', 'deserteddunes'])) {
				return this.chainModify(2);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'deserteddunes') return false;
		},
	},
	sandveil: {
		inherit: true,
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'deserteddunes') return false;
		},
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather(['sandstorm', 'deserteddunes'])) {
				this.debug('Sand Veil - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
	},
	swiftswim: {
		inherit: true,
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea', 'stormsurge'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
	},
};
