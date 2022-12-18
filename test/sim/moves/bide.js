'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Bide [Gen 1]', function () {
	afterEach(function () {
		battle.destroy();
	});

	it("Two turn Bide", function () {
		battle = common.gen(1).createBattle();
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [{species: "Gyarados", moves: ['dragonrage']}]});
		const aerodactyl = battle.p1.active[0];
		const gyarados = battle.p2.active[0];
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 2);
		battle.makeChoices();
		battle.makeChoices();
		assert(!aerodactyl.volatiles['bide']);
		assert.equal(gyarados.maxhp - gyarados.hp, 160);
	});

	it("Three turn Bide", function () {
		battle = common.gen(1).createBattle({seed: [1, 1, 1, 1]});
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [{species: "Gyarados", moves: ['dragonrage']}]});
		const aerodactyl = battle.p1.active[0];
		const gyarados = battle.p2.active[0];
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 3);
		battle.makeChoices();
		battle.makeChoices();
		battle.makeChoices();
		assert(!aerodactyl.volatiles['bide']);
		assert.equal(gyarados.maxhp - gyarados.hp, 240);
	});

	it("Bide damage can hit a Substitute", function () {
		battle = common.gen(1).createBattle();
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide', 'whirlwind']}]});
		battle.setPlayer('p2', {team: [{species: "Gyarados", moves: ['dragonrage', 'substitute']}]});
		const aerodactyl = battle.p1.active[0];
		const gyarados = battle.p2.active[0];
		battle.makeChoices('move whirlwind', 'move substitute');
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 2);
		battle.makeChoices();
		battle.makeChoices();
		assert(!aerodactyl.volatiles['bide']);
		assert(!gyarados.volatiles['substitute']);
	});

	it("Bide can accumulate damage as the opponent switches or uses moves that don't reset lastDamage", function () {
		battle = common.gen(1).createBattle({seed: [1, 1, 1, 1]});
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [
			{species: "Gyarados", moves: ['dragonrage', 'splash']},
			{species: 'Exeggutor', moves: ['barrage']},
		]});
		const aerodactyl = battle.p1.active[0];
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 3);
		battle.makeChoices('auto', 'move splash');
		battle.makeChoices('auto', 'switch 2');
		battle.makeChoices();
		const exeggutor = battle.p2.active[0];
		assert(!aerodactyl.volatiles['bide']);
		assert.equal(exeggutor.maxhp - exeggutor.hp, 240);
	});

	it("Bide's accumulated damage is zeroed when an enemy faints (Desync Clause Mod)", function () {
		battle = common.gen(1).createBattle();
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [
			{species: "Gyarados", moves: ['dragonrage', 'leer']},
			{species: 'Exeggutor', moves: ['barrage']},
		]});
		const aerodactyl = battle.p1.active[0];
		const exeggutor = battle.p2.pokemon[1];
		// Exeggutor will faint when switched in
		exeggutor.hp = 1;
		exeggutor.setStatus('psn');
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 2);
		// Leer resets battle.lastDamage to 0
		battle.makeChoices('auto', 'move leer');
		battle.makeChoices('auto', 'switch 2');
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 1);
		battle.makeChoices();
		assert(!aerodactyl.volatiles['bide']);
		assert.fullHP(battle.p2.active[0]);
		assert(battle.log.some(line => line.includes('Desync Clause Mod activated')));
	});

	it("Bide's duration is paused when asleep or frozen", function () {
		battle = common.gen(1).createBattle();
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [{species: "Parasect", moves: ['spore']}]});
		const aerodactyl = battle.p1.active[0];
		for (let i = 0; i < 10; i++) {
			battle.makeChoices();
			assert.equal(aerodactyl.volatiles['bide'].time, 2);
		}
	});

	it("Bide's duration is paused when disabled", function () {
		battle = common.gen(1).createBattle({seed: [1, 1, 1, 0]});
		battle.setPlayer('p1', {team: [{species: "Aerodactyl", moves: ['bide']}]});
		battle.setPlayer('p2', {team: [{species: "Voltorb", moves: ['disable']}]});
		const aerodactyl = battle.p1.active[0];
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 3);
		assert(aerodactyl.volatiles['disable'].move === 'bide');
		assert(aerodactyl.volatiles['disable'].time > 1);
		battle.makeChoices();
		assert.equal(aerodactyl.volatiles['bide'].time, 3);
	});
});
