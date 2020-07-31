/**
 * Tests for the Help room auto-answerer.
 * Written by mia-pi.
 */

'use strict';

const assert = require('assert').strict;

const defaultData = {
	stats: {},
	pairs: {},
	disabled: false,
	queue: [],
};

describe('Help', function () {
	it('should only return true on added regexes', function () {
		const Answerer = require('../../../.server-dist/chat-plugins/help').HelpAnswerer;
		const Help = new Answerer(defaultData);
		Help.data.pairs.catra = [];
		Help.data.pairs.catra.push(Help.stringRegex(`Hey & adora`));
		assert.ok(Help.match('Hey, adora', 'catra'));
		assert.ok(!Help.match('Hello, adora', 'catra'));
	});

	it('should produce valid regexes', function () {
		const Answerer = require('../../../.server-dist/chat-plugins/help').HelpAnswerer;
		const Help = new Answerer(defaultData);
		const regexString = Help.stringRegex(`uwu & awa`);
		assert.strictEqual(regexString, "(?=.*?(uwu))(?=.*?(awa))");
		const regex = new RegExp(regexString);
		assert.ok(regex.test('uwu awa'));
	});
	it('should handle |, &, and ! correctly', function () {
		const Answerer = require('../../../.server-dist/chat-plugins/help').HelpAnswerer;
		const Help = new Answerer(defaultData);

		const and = new RegExp(Help.stringRegex(`horde & prime`));
		assert.ok(and.test('horde prime'));
		assert.ok(!and.test('horde'));

		const or = new RegExp(Help.stringRegex(`she-ra|sea-ra`));
		assert.ok(or.test('sea-ra'));
		assert.ok(or.test(`she-ra`));
		assert.ok(!or.test('ADVENTURE'));

		const ignore = new RegExp(Help.stringRegex(`!Hordak`));
		assert.ok(ignore.test(`FOR THE HONOR OF GREYSKULL`));
		assert.ok(!ignore.test('Hordak'));
	});
});
