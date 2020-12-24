'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('G-Max Volcalith', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should not damage Rock-types`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Coalossal', moves: ['rockthrow'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk']},
		], [
			{species: 'Blastoise', moves: ['sleeptalk']},
			{species: 'Boldore', moves: ['sleeptalk']},
		]]);

		battle.makeChoices('move rockthrow 1 dynamax, move sleeptalk', 'move sleeptalk, move sleeptalk');
		assert.fullHP(battle.p2.active[1]);
	});

	it(`should deal damage for four turns, including the fourth turn`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Coalossal', moves: ['sleeptalk', 'rockthrow'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk']},
		], [
			{species: 'Blastoise', moves: ['sleeptalk']},
			{species: 'Boldore', moves: ['sleeptalk']},
		]]);

		battle.makeChoices('move rockthrow 2 dynamax, move sleeptalk', 'move sleeptalk, move sleeptalk');
		for (let i = 0; i < 3; i++) { battle.makeChoices(); }

		const blastoise = battle.p2.active[0];
		assert.equal(blastoise.hp, blastoise.maxhp - (Math.floor(blastoise.maxhp / 6) * 4));
	});

	it.skip(`should deal damage alongside Sea of Fire or G-Max Wildfire in the order those field effects were set`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Coalossal', item: 'Eject Button', moves: ['rockthrow', 'sleeptalk'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk', 'grasspledge']},
			{species: 'Wynaut', moves: ['sleeptalk', 'firepledge']},
		], [
			{species: 'Blissey', ability: "noguard", moves: ['superfang', 'softboiled']},
			{species: 'Blissey', ability: "noguard", moves: ['superfang', 'softboiled']},
			{species: 'Golisopod', ability: "emergencyexit", moves: ['sleeptalk']},
		]]);

		// Set up Volcalith first, then Sea of Fire
		battle.makeChoices('move rockthrow 1 dynamax, move grasspledge -1', 'move softboiled, move softboiled');
		battle.makeChoices('switch 3');
		battle.makeChoices('move firepledge 1, move grasspledge 1', 'move softboiled, move softboiled');

		// Switch into Golisopod; Emergency Exit should trigger and only take Volcalith damage then switch, avoiding Sea of Fire
		// Note that Emergency Exit is also bugged here; it's actually not switching out at all lol, so it takes both Volcalith and Sea of Fire
		battle.makeChoices('move sleeptalk, move sleeptalk', 'switch 3, move superfang -1');
		const maxHP = battle.p2.active[0].maxhp;
		const expectedHP = maxHP - Math.floor(maxHP / 2) - Math.floor(maxHP / 6);
		assert.equal(battle.p2.active[0].hp, expectedHP);
	});
});
