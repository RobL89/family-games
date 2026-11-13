// Pass-or-fail checks of what script 0.4.0 changes (P75), run against the real Code.gs.
//
//   node tools/tests/script/check.js                    the repo's apps-script/Code.gs
//   node tools/tests/script/check.js --script <file>    another copy (for example an older version)
//
// Prints a line per failing check, then "PASS n of n" or "FAIL k of n". Exit code 0 only on PASS.
// Unchanged calls (ping's code check, addProfile, sync) are deliberately not checked (P75).

'use strict';

const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual, inspect } = require('util');
const { open, sheet030 } = require('./bed.js');
const { knownMethods, services } = require('./google.js');

const args = process.argv.slice(2);
const script = args[0] === '--script' && args[1] ? path.resolve(args[1]) : undefined;
const bed = (opts = {}) => open({ ...opts, script });

const SETTINGS = ['profile_id', 'game_id', 'key', 'value', 'updated_at'];
const checks = [];
const check = (name, fn) => checks.push({ name, fn });

function eq(actual, expected, what) {
  if (!isDeepStrictEqual(actual, expected)) {
    throw new Error(`${what}: expected ${inspect(expected, { depth: 4 })}, got ${inspect(actual, { depth: 4 })}`);
  }
}
function ok(value, what) { if (!value) throw new Error(what); }
const okReply = (r, what) => ok(r && r.ok === true, `${what} was refused: ${r && r.error}`);
const rowsOf = (b, tab) => {
  const [head, ...body] = b.ss.getSheetByName(tab).dump();
  return body.map((line) => Object.fromEntries(head.map((h, i) => [h, line[i]])));
};
const titles = (lists) => (lists || []).map((l) => [l.title, l.words.join(' ')]);

// ---- The test bed itself ------------------------------------------------------------

check('the stand-ins cover every Google service and method Code.gs uses', () => {
  const text = fs.readFileSync(script || require('./bed.js').SCRIPT, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/'(?:\\.|[^'\\])*'/g, "''");
  const globals = Object.keys(services().globals);
  const usedGlobals = [...new Set(text.match(/\b([A-Z]\w*(?:App|Service)|Utilities|Logger|Session|Browser)\b/g) || [])];
  const missingGlobals = usedGlobals.filter((g) => !globals.includes(g));

  const builtins = new Set();
  [Array.prototype, String.prototype, Date.prototype, Object, Object.prototype, Math, JSON, RegExp.prototype,
    Number, Number.prototype, Function.prototype, Set.prototype, Map.prototype, Array, Promise.prototype]
    .forEach((o) => Object.getOwnPropertyNames(o).forEach((n) => builtins.add(n)));
  const ownFunctions = new Set([...text.matchAll(/function\s+(\w+)/g)].map((m) => m[1]));
  const known = knownMethods();
  const usedMethods = [...new Set([...text.matchAll(/\.(\w+)\s*\(/g)].map((m) => m[1]))];
  const missingMethods = usedMethods.filter((m) => !builtins.has(m) && !ownFunctions.has(m) && !known.has(m));
  eq([...missingGlobals, ...missingMethods], [], 'used by Code.gs but not stood in for');
});

// ---- Version ----------------------------------------------------------------------------

check('ping answers version 0.4.0', () => {
  eq(bed().post('ping').version, '0.4.0', 'version');
});

// ---- setup only adds (P75) ------------------------------------------------------------------

check('setup on a 0.3.0 Sheet makes a backup first, then adds only the Settings tab and its header', () => {
  const b = bed();
  const before = b.ss.dump();
  b.run('setup');
  eq(b.ss.copies.length, 1, 'backups made');
  eq(b.ss.copies[0].dump(), before, 'the backup holds the Sheet as it was');
  const after = b.ss.dump();
  eq(Object.keys(after), [...Object.keys(before), 'Settings'], 'tabs after setup');
  Object.keys(before).forEach((tab) => eq(after[tab], before[tab], `tab ${tab}`));
  eq(after.Settings, [SETTINGS], 'Settings tab');
  eq(b.ss.getSheetByName('Settings').frozenRows, 1, 'Settings header row frozen');
});

check('setup run a second time changes nothing and makes no backup', () => {
  const b = bed();
  b.run('setup');
  const once = b.ss.dump();
  b.run('setup');
  eq(b.ss.dump(), once, 'Sheet after the second run');
  eq(b.ss.copies.length, 1, 'backups (only the first run made one)');
});

check('setup adds a missing column at the end and leaves the data alone', () => {
  const tabs = sheet030();
  tabs.Profiles = tabs.Profiles.map((line) => line.slice(0, 6)); // as before 0.2.0: no skin column
  const b = bed({ tabs });
  b.run('setup');
  const profiles = b.ss.getSheetByName('Profiles').dump();
  eq(profiles[0], [...tabs.Profiles[0], 'skin'], 'Profiles header');
  eq(profiles.slice(1).map((l) => l.slice(0, 6)), tabs.Profiles.slice(1), 'Profiles rows');
});

check('setup on an empty spreadsheet adds every tab and the four skins, with no backup', () => {
  const b = bed({ tabs: {} });
  b.run('setup');
  const after = b.ss.dump();
  eq(Object.keys(after).sort(), ['Achievements', 'GameLists', 'Profiles', 'Scores', 'Settings', 'Skins'], 'tabs');
  eq(after.Skins.length, 5, 'Skins rows with header');
  eq(after.Settings, [SETTINGS], 'Settings tab');
  eq(b.ss.copies.length, 0, 'backups');
});

// ---- A game's state, per child, in the Settings tab (P51) --------------------------------

check('profile still works before setup has added Settings, with no saved states', () => {
  const r = bed().post('profile', { profile_id: 'p_sam' });
  okReply(r, 'profile');
  eq(r.states, {}, 'states');
});

check('saveState before setup asks for setup and writes nothing', () => {
  const b = bed();
  const before = b.ss.dump();
  const r = b.post('saveState', { profile_id: 'p_sam', game_id: 'kriss-kross', state: { a: 1 } });
  ok(r.ok === false && /run setup/.test(r.error || ''), `expected a "run setup" refusal, got ${JSON.stringify(r)}`);
  eq(b.ss.dump(), before, 'Sheet');
});

check("a game's state saved for a child comes back in profile, unchanged", () => {
  const b = bed();
  b.run('setup');
  const state = { lists: [{ title: 'Mine', words: ['cat', 'dog'] }], explorer: 'e_7', count: 3, done: true, code: '007' };
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'kriss-kross', state }), 'saveState');
  eq(b.post('profile', { profile_id: 'p_sam' }).states, { 'kriss-kross': state }, 'states');
});

check('plain states come back as they went: a number, true, text of digits, null', () => {
  const b = bed();
  b.run('setup');
  const plain = { 'g-num': 42, 'g-true': true, 'g-digits': '007', 'g-null': null };
  Object.entries(plain).forEach(([game, state]) => okReply(b.post('saveState', { profile_id: 'p_sam', game_id: game, state }), game));
  eq(b.post('profile', { profile_id: 'p_sam' }).states, plain, 'states');
});

check('saving again replaces it: one Settings row per child, game and key', () => {
  const b = bed();
  b.run('setup');
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: { v: 1 } }), 'first save');
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: { v: 2 } }), 'second save');
  const rows = rowsOf(b, 'Settings');
  eq(rows.length, 1, 'Settings rows');
  eq([rows[0].profile_id, rows[0].game_id, rows[0].key], ['p_sam', 'number-town', 'state'], 'row');
  ok(rows[0].updated_at instanceof Date, 'updated_at is a date');
  eq(b.post('profile', { profile_id: 'p_sam' }).states, { 'number-town': { v: 2 } }, 'states');
});

check("one child's state is not shown to another child", () => {
  const b = bed();
  b.run('setup');
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: { explorer: 'sam' } }), 'saveState');
  eq(b.post('profile', { profile_id: 'p_alex' }).states, {}, "Alex's states");
});

check('a state over 20,000 characters is refused and nothing is written', () => {
  const b = bed();
  b.run('setup');
  const before = b.ss.dump();
  const r = b.post('saveState', { profile_id: 'p_sam', game_id: 'kriss-kross', state: { big: 'x'.repeat(20000) } });
  eq([r.ok, r.error], [false, 'state_too_big'], 'reply');
  eq(b.ss.dump(), before, 'Sheet');
});

check('saveState refuses an unknown child or a bad game id', () => {
  const b = bed();
  b.run('setup');
  eq(b.post('saveState', { profile_id: 'p_nobody', game_id: 'kriss-kross', state: 1 }).error, 'no_such_profile', 'unknown child');
  eq(b.post('saveState', { profile_id: 'p_sam', game_id: '../x', state: 1 }).error, 'bad_game_id', 'bad game id');
  eq(rowsOf(b, 'Settings').length, 0, 'Settings rows');
});

// ---- Word lists: one set per child (P56) ---------------------------------------------------

check("before any save, a child's old per-game lists come back as their one set, in order", () => {
  const b = bed();
  eq(titles(b.post('profile', { profile_id: 'p_sam' }).word_lists),
    [['Week 1', 'sun moon star'], ['Animals', 'cat dog hen']], "Sam's lists (first game's, by position)");
  eq(titles(b.post('profile', { profile_id: 'p_alex' }).word_lists), [['Colours', 'red green blue']], "Alex's lists");
});

check("saving a child's lists keeps one set for that child, for every game", () => {
  const b = bed();
  const lists = [{ title: 'Space', words: ['moon', 'star'] }, { title: 'Farm', words: ['cow', 'pig'] }];
  const r = b.post('saveLists', { profile_id: 'p_sam', lists });
  okReply(r, 'saveLists');
  eq(titles(r.lists), [['Space', 'moon star'], ['Farm', 'cow pig']], 'lists in the reply');
  eq(titles(b.post('profile', { profile_id: 'p_sam' }).word_lists), titles(r.lists), 'lists in profile');
  eq(rowsOf(b, 'GameLists').filter((x) => x.profile_id === 'p_sam').map((x) => [x.game_id, x.position, x.title]),
    [['', 1, 'Space'], ['', 2, 'Farm']], "Sam's rows (no game: they're for every game)");
});

check("saving moves the old lists: that child's per-game rows go, other children's rows are untouched", () => {
  const b = bed();
  const alexBefore = b.ss.getSheetByName('GameLists').dump().filter((l) => l[1] === 'p_alex');
  okReply(b.post('saveLists', { profile_id: 'p_sam', lists: [{ title: 'Only', words: ['a1', 'b2'] }] }), 'saveLists');
  const all = b.ss.getSheetByName('GameLists').dump().slice(1);
  eq(all.filter((l) => l[1] === 'p_sam').map((l) => l[4]), ['Only'], "Sam's rows");
  eq(all.filter((l) => l[1] === 'p_alex'), alexBefore, "Alex's rows");
});

check("the old launcher's saveLists (with a game_id) still saves the child's one set", () => {
  const b = bed();
  const r = b.post('saveLists', { profile_id: 'p_alex', game_id: 'kriss-kross', lists: [{ title: 'Pets', words: ['cat', 'rat'] }] });
  okReply(r, 'saveLists');
  eq(titles(b.post('profile', { profile_id: 'p_alex' }).word_lists), [['Pets', 'cat rat']], "Alex's lists");
  eq(rowsOf(b, 'GameLists').filter((x) => x.profile_id === 'p_alex').map((x) => x.game_id), [''], "Alex's rows");
});

check('list rules are unchanged: an empty list or 31 words is refused, and nothing is written', () => {
  const b = bed();
  const before = b.ss.dump();
  eq(b.post('saveLists', { profile_id: 'p_sam', lists: [{ title: 'Empty', words: [] }] }).error, 'empty_list', 'empty list');
  const many = Array.from({ length: 31 }, (_, i) => 'w' + i);
  eq(b.post('saveLists', { profile_id: 'p_sam', lists: [{ title: 'Many', words: many }] }).error, 'too_many_words', '31 words');
  eq(b.ss.dump(), before, 'Sheet');
});

// ---- Skins without the star check (P49, P63) ------------------------------------------------

check('a child with no stars can save any skin', () => {
  const b = bed();
  const r = b.post('updateProfile', { profile_id: 'p_alex', skin: 'unicorn' });
  okReply(r, 'updateProfile');
  eq(r.profile.skin, 'unicorn', 'skin in the reply');
  eq(rowsOf(b, 'Profiles').find((p) => p.profile_id === 'p_alex').skin, 'unicorn', 'skin in the Sheet');
});

check('an unknown skin is still refused', () => {
  eq(bed().post('updateProfile', { profile_id: 'p_alex', skin: 'dragon' }).error, 'no_such_skin', 'reply');
});

// ---- Locks --------------------------------------------------------------------------------

check('the new and changed write calls take the lock and let it go', () => {
  const b = bed();
  b.run('setup');
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'g', state: 1 }), 'saveState');
  okReply(b.post('saveLists', { profile_id: 'p_sam', lists: [{ title: 'T', words: ['ab'] }] }), 'saveLists');
  okReply(b.post('updateProfile', { profile_id: 'p_sam', skin: 'fairy' }), 'updateProfile');
  eq([b.lock.waits, b.lock.held], [3, false], 'lock taken three times, now free');
});

// ---- Run ----------------------------------------------------------------------------------

let failed = 0;
for (const { name, fn } of checks) {
  try {
    fn();
  } catch (err) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${String(err.message).split('\n').join('\n        ')}`);
  }
}
console.log(failed ? `FAIL ${failed} of ${checks.length}` : `PASS ${checks.length} of ${checks.length}`);
process.exitCode = failed ? 1 : 0;
