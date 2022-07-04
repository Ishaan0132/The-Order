'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe(`Instruct`, function () {
	afterEach(() => battle.destroy());

	it(`should make the targt reuse its last move`, function () {
		battle = common.createBattle([
			[{species: "Swalot", moves: ['stockpile']}],
			[{species: "Oranguru", moves: ['instruct']}],
		]);
		battle.makeChoices();
		assert.strictEqual(battle.p1.active[0].boosts.def, 2);
	});

	it.only(`should not trigger AfterMove effects of the instructed move for the Instruct user`, function () {
		battle = common.createBattle([
			[{species: "Swalot", moves: ['stockpile', 'spitup']}],
			[{species: "Duskull", moves: ['stockpile', 'instruct']}],
		]);
		battle.makeChoices();
		battle.makeChoices('move spitup', 'move instruct');
		assert.equal(battle.p2.active[0].boosts.def, 1);
	});
});
