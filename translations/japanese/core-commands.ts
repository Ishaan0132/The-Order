import type {Translations} from '../../server/chat';

export const translations: Translations = {
	strings: {
		"Server version: <b>${version}</b>": "サーバーのバージョン: <b>${version}</b>",
		"/mee - must not start with a letter or number": "文字や数字を最初においてはいけません。",
		"What?! How are you not more excited to battle?! Try /battle! to show me you're ready.": "バトルが盛り上がってないって!?覚悟を決めて、/battle だ",
		"Access denied for custom avatar - make sure you're on the right account?": "このカスタムアバターを使用する権限がありません。許可されているアカウントでログインしてください。",
		"Invalid avatar.": "アバター名が正しくありません。",
		"Avatar changed to:": "アバターを次のものに変更しました。",
		"Artist: ": "作者",
		"No one has PMed you yet.": "誰もあなたにPMを送っていません。",
		"You forgot the comma.": "コンマを忘れていませんか?",
		"User ${targetUsername} not found. Did you misspell their name?": "ユーザー名:${targetUsername}は見つかりませんでした。名前を間違えていませんか?",
		"User ${targetUsername} is offline.": "ユーザー名:${targetUsername}は見つかりませんでした。",
		"The user \"${targetUsername}\" was not found.": "ユーザー名:\"${targetUsername}\"は見つかりませんでした。",
		"The room \"${target}\" was not found.": "チャットルーム:\"${target}\"は見つかりませんでした。",
		"You do not have permission to invite people into this room.": "あなたはこの部屋でユーザーを招待する権限を持っていません。",
		"This user is already in \"${targetRoom.title}\".": "このユーザーはすでに\"${targetRoom.title}\"にいます。",
		"Setting status messages in /busy is no longer supported. Set a status using /status.": "/busyでのステータスメッセージの設定はサポートされなくなりました。ステータスメッセージの設定は、/statusを使って行ってください。",
		"Setting status messages in /away is no longer supported. Set a status using /status.": "/awayでのステータスメッセージの設定はサポートされなくなりました。ステータスメッセージの設定は、/statusを使って行ってはたください。",
		"User '${target}' not found.": "ユーザー名'${target}'は見つかりませんでした。",
		"${targetUser.name} does not have a status set.": "${targetUser.name}はステータスメッセージを設定していません。",
		"${targetUser.name}'s status \"${targetUser.userMessage}\" was cleared by ${user.name}${displayReason}": "${targetUser.name}のステータスメッセージは${user.name}によって消去されました。${displayReason}",
		"You don't have a status message set.": "ステータスメッセージを設定していません。",
		"You have cleared your status message.": "ステータスメッセージを消去しました。",
		"This user has not played any ladder games yet.": "このユーザーはladderが有効なバトルをしていません。",
		"W[TN: initial for Wins]": "'Wins'の頭文字",
		"L[TN: initial for Losses]": "'Losses'の頭文字",
		"You already have the temporary symbol '${group}'.": "",
		"You must specify a valid group symbol.": "",
		"You may only set a temporary symbol below your current rank.": "",
		"Your temporary group symbol is now": "",
		"Currently, you're viewing Pokémon Showdown in ${language}.": "",
		"Valid languages are: ${languages}": "",
		"Pokémon Showdown will now be displayed in ${language} (except in language rooms).": "",
		"Note that rooms can set their own language, which will override this setting.": "",
		"/updatesettings expects JSON encoded object.": "",
		"Unable to parse settings in /updatesettings!": "",
		"Must be in a battle.": "",
		"User ${target} not found.": "",
		"Must be a player in this battle.": "",
		"${targetUser.name} has not requested extraction.": "",
		"You have already consented to extraction with ${targetUser.name}.": "",
		"${user.name} consents to sharing battle team and choices with ${targetUser.name}.": "",
		"No input log found.": "",
		"${targetUser.name} has extracted the battle input log.": "",
		"This command only works in battle rooms.": "",
		"This command only works when the battle has ended - if the battle has stalled, use /offertie.": "",
		"Alternatively, you can end the battle with /forcetie.": "",
		"${user.name} has extracted the battle input log.": "",
		"You already extracted the battle input log.": "",
		"Battle input log re-requested.": "",
		"Invalid input log.": "",
		"Your input log contains untrusted code - you must have console access to use it.": "",
		"This command can only be used in a battle.": "",
		"Only players can extract their team.": "",
		"Use a number between 1-6 to view a specific set.": "",
		"The Pokemon \"${target}\" is not in your team.": "",
		"That Pokemon is not in your team.": "",
		"View team": "",
		"Must be in a battle room.": "",
		"This server does not allow offering ties.": "",
		"You can't offer ties in tournaments.": "",
		"It's too early to tie, please play until turn 100.": "",
		"No other player is requesting a tie right now. It was probably canceled.": "",
		"${user.name} is offering a tie.": "",
		"Accept tie": "",
		"Reject": "",
		"Must be a player to accept ties.": "",
		"You have already agreed to a tie.": "",
		"${user.name} accepted the tie.": "",
		"All players have accepted the tie.": "",
		"Must be a player to reject ties.": "",
		"${user.name} rejected the tie.": "",
		"This room doesn't have an active game.": "",
		"This kind of game can't be forfeited.": "",
		"This game doesn't support /choose": "",
		"This game doesn't support /undo": "",
		"You can only save replays for battles.": "",
		"This battle can't have hidden replays, because the tournament is set to be forced public.": "",
		"The replay for this battle is already set to hidden.": "",
		"${user.name} hid the replay of this battle.": "",
		"You can only do this in battle rooms.": "",
		"You can only add a Player to unrated battles.": "",
		"Player must be set to \"p1\" or \"p2\", not \"${target}\".": "",
		"User ${name} not found.": "",
		"User ${name} must be in the battle room already.": "",
		"This room already has a player in slot ${target}.": "",
		"${targetUser.name} is already a player in this battle.": "",
		"${name} was added to the battle as Player ${playerNum} by ${user.name}.": "",
		"Player 2": "",
		"Players could not be restored (maybe this battle already has two players?).": "",
		"This game doesn't support /joingame": "",
		"This game doesn't support /leavegame": "",
		"You can only do this in unrated non-tour battles.": "",
		"User ${targetUsername} not found.": "",
		"${targetUser.name} was kicked from a battle by ${user.name} ${displayTarget}": "",
		"You can only set the timer from inside a battle room.": "",
		"This game's timer is managed by a different command.": "",
		"The game timer is OFF.": "",
		"The game timer is ON (requested by ${requester})": "",
		"Access denied.": "",
		"Timer was turned off by staff. Please do not turn it back on until our staff say it's okay.": "",
		"The timer is already off.": "",
		"\"${target}\" is not a recognized timer state.": "",
		"Forcetimer is now OFF: The timer is now opt-in. (set by ${user.name})": "",
		"Forcetimer is now ON: All battles will be timed. (set by ${user.name})": "",
		"'${target}' is not a recognized forcetimer setting.": "",
		"This server requires you to be rank ${groupName} or higher to search for a battle.": "",
		"Since you have reached ${Config.forceregisterelo} ELO in ${target}, you must register your account to continue playing that format on ladder.": "",
		"Register": "",
		"The user '${targetUsername}' was not found.": "",
		"You are locked and cannot challenge unlocked users. If this user is your friend, ask them to challenge you instead.": "",
		"You are banned from battling and cannot challenge users.": "",
		"You must choose a username before you challenge someone.": "",
		"This server requires you to be rank ${groupName} or higher to challenge users.": "",
		"This command does not support specifying multiple users": "",
		"User \"${targetUsername}\" not found.": "",
		"Provide a valid format.": "",
		"Please provide a valid format.": "",
		"The format '${originalFormat.name}' was not found.": "",
		"Your team is valid for ${format.name}.": "",
		"Your team was rejected for the following reasons:": "",
		"Battles are now hidden (except to staff) in your trainer card.": "",
		"Battles are now visible in your trainer card.": "",
		"'${command}' is a help command.": "",
		"The command '/${target}' does not exist.": "",
		"Could not find help for '/${target}'. Try /help for general help.": "",
		"Could not find help for '/${target}' - displaying help for '/${closestHelp}' instead": "",
	},
};
