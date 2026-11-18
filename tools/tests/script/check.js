// Pass-or-fail checks of what scripts 0.4.0 and 0.5.0 change (P75, P88), run against the real Code.gs.
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
const stateOnly = (states) => Object.fromEntries(Object.entries(states || {}).map(([g, x]) => [g, x && x.state]));
const iso = (ms) => new Date(ms).toISOString();

// ---- The test bed itself ------------------------------------------------------------

check('the stand-ins cover every Google service and method Code.gs uses', () => {
  const text = fs.readFileSync(script || require('./bed.js').SCRIPT, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/'(?:\\.|[^'\\])*'/g, "''");
  const globals = Object.keys(services().globals);
  const usedGlobals = [...new Set(text.match(/\b([A-Z]\w*(?:App|Service)|Utilities|Logger|Session|Browser)\b/g) || [])];
  const missingGlobals = usedGlobals.filter((g) => !globals.includes(g));

  const builtins = new Set();
  [Array.prototype, String.prototype, Date.prototype, Date, Object, Object.prototype, Math, JSON, RegExp.prototype,
    Number, Number.prototype, Function.prototype, Set.prototype, Map.prototype, Array, Promise.prototype]
    .forEach((o) => Object.getOwnPropertyNames(o).forEach((n) => builtins.add(n)));
  const ownFunctions = new Set([...text.matchAll(/function\s+(\w+)/g)].map((m) => m[1]));
  const known = knownMethods();
  const usedMethods = [...new Set([...text.matchAll(/\.(\w+)\s*\(/g)].map((m) => m[1]))];
  const missingMethods = usedMethods.filter((m) => !builtins.has(m) && !ownFunctions.has(m) && !known.has(m));
  eq([...missingGlobals, ...missingMethods], [], 'used by Code.gs but not stood in for');
});

// ---- Version ----------------------------------------------------------------------------

check('ping answers version 0.5.0', () => {
  eq(bed().post('ping').version, '0.5.0', 'version');
});

// ---- setup only adds (P75) ------------------------------------------------------------------

check('setup on a 0.3.0 Sheet makes a backup first, then adds only the Settings, Plays and summary tabs', () => {
  const b = bed();
  const before = b.ss.dump();
  b.run('setup');
  eq(b.ss.copies.length, 1, 'backups made');
  eq(b.ss.copies[0].dump(), before, 'the backup holds the Sheet as it was');
  const after = b.ss.dump();
  eq(Object.keys(after), [...Object.keys(before), 'Settings', 'Plays', 'Plays summary'], 'tabs after setup');
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
  eq(Object.keys(after).sort(), ['Achievements', 'GameLists', 'Plays', 'Plays summary', 'Profiles', 'Scores', 'Settings', 'Skins'], 'tabs');
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
  const at = iso(Date.now() - 60000);
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'kriss-kross', state, at }), 'saveState');
  eq(b.post('profile', { profile_id: 'p_sam' }).states, { 'kriss-kross': { state, at } }, 'states, with when each was made');
});

check('plain states come back as they went: a number, true, text of digits, null', () => {
  const b = bed();
  b.run('setup');
  const plain = { 'g-num': 42, 'g-true': true, 'g-digits': '007', 'g-null': null };
  Object.entries(plain).forEach(([game, state]) => okReply(b.post('saveState', { profile_id: 'p_sam', game_id: game, state }), game));
  eq(stateOnly(b.post('profile', { profile_id: 'p_sam' }).states), plain, 'states');
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
  eq(stateOnly(b.post('profile', { profile_id: 'p_sam' }).states), { 'number-town': { v: 2 } }, 'states');
});

check('the newest save wins: an older one arriving later is ignored', () => {
  const b = bed();
  b.run('setup');
  const t = Date.now() - 3600000;
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: { v: 'newer' }, at: iso(t + 60000) }), 'newer save');
  const late = b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: { v: 'older' }, at: iso(t) });
  eq([late.ok, late.saved, late.at], [true, false, iso(t + 60000)], 'reply to the older save');
  eq(b.post('profile', { profile_id: 'p_sam' }).states['number-town'], { state: { v: 'newer' }, at: iso(t + 60000) }, 'state kept');
});

check('a save stamped in the future counts as now', () => {
  const b = bed();
  b.run('setup');
  const before = Date.now();
  const r = b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: 1, at: iso(before + 86400000) });
  okReply(r, 'saveState');
  ok(Date.parse(r.at) >= before && Date.parse(r.at) <= Date.now(), `stored time ${r.at} is not now`);
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'number-town', state: 2, at: iso(Date.now() + 1) }), 'next save');
  eq(stateOnly(b.post('profile', { profile_id: 'p_sam' }).states), { 'number-town': 2 }, 'a later save still wins');
});

check('a save with no time counts as now', () => {
  const b = bed();
  b.run('setup');
  const before = Date.now();
  const r = b.post('saveState', { profile_id: 'p_sam', game_id: 'g', state: 'x' });
  ok(r.saved === true && Date.parse(r.at) >= before, `reply ${JSON.stringify(r)}`);
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

// ---- Plays (0.5.0, P88) -------------------------------------------------------------------

const PLAYS = ['played_at', 'day', 'name', 'game', 'minutes', 'device', 'play_id', 'profile_id', 'game_id', 'received_at'];
// The live Sheet's shape since 0.4.0: 0.3.0's tabs with Settings, the test rows cleared (Q13).
function sheet040() {
  const tabs = sheet030();
  tabs.Scores = tabs.Scores.slice(0, 1);
  tabs.Achievements = tabs.Achievements.slice(0, 1);
  tabs.Settings = [SETTINGS, ['p_sam', 'number-town', 'state', '{"v":1}', new Date('2026-11-13T10:00:00Z')]];
  return tabs;
}
const ready = () => { const b = bed({ tabs: sheet040() }); b.run('setup'); return b; };
const play = (o = {}) => ({ play_id: 'pl1', profile_id: 'p_sam', game_id: 'number-town', game: 'Number Town',
  device: 'Phone', played_at: '2026-11-17T18:05:00.000Z', seconds: 0, ...o });
const sync = (b, plays) => b.post('sync', { results: [], achievements: [], plays });

check('setup on the live shape (0.4.0) backs up, adds Plays and its summary, hides Scores and Achievements, changes no data', () => {
  const b = bed({ tabs: sheet040() });
  const before = b.ss.dump();
  const log = b.run('setup');
  eq(b.ss.copies.length, 1, 'backups made');
  const after = b.ss.dump();
  eq(Object.keys(after), [...Object.keys(before), 'Plays', 'Plays summary'], 'tabs after setup');
  Object.keys(before).forEach((tab) => eq(after[tab], before[tab], `tab ${tab}`));
  eq(after.Plays, [PLAYS], 'Plays tab');
  eq(b.ss.getSheetByName('Plays').frozenRows, 1, 'Plays header frozen');
  eq(['Scores', 'Achievements'].map((t) => b.ss.getSheetByName(t).isSheetHidden()), [true, true], 'hidden');
  eq(b.ss.sheets.filter((s) => s.isSheetHidden()).map((s) => s.name), ['Scores', 'Achievements'], 'only those hidden');
  ok(log.some((l) => /Hid tab Scores/.test(l)) && log.some((l) => /Hid tab Achievements/.test(l)), 'the log says what was hidden');
  const f = b.ss.getSheetByName('Plays').formats;
  eq([f[1][0], f[2][0], f[5][0]], ['dd/mm/yyyy hh:mm', 'ddd dd/mm/yyyy', '0.0'], 'formats of played_at, day, minutes');
  eq(f[1][2], b.ss.getSheetByName('Plays').getMaxRows(), 'formats reach the last row');
});

check('the summary: games by child first (games down, children across), then by game, day, child and device, and a Name filter', () => {
  const b = ready();
  const s = b.ss.getSheetByName('Plays summary');
  const plays = b.ss.getSheetByName('Plays');
  const col = (h) => PLAYS.indexOf(h) + 1;
  // Bed: 2 players, so room for 6: 1 + 7 * 2 = 15 columns, a gap, then the others from column 17.
  eq(s.pivots.map((t) => [t.anchor.row, t.anchor.col]), [[5, 1], [5, 17], [5, 21], [5, 25], [5, 29]], 'table anchors');
  eq(s.pivots.map((t) => t.rows.map((g) => g.column)), [[col('game')], [col('game')], [col('day')], [col('name')], [col('device')]], 'down the side');
  eq(s.pivots.map((t) => t.columns.map((g) => g.column)), [[col('name')], [], [], [], []], 'across the top');
  eq(s.pivots[0].columns[0].totals, true, 'a total per game across the children');
  eq(s.pivots[2].rows[0].order, 'desc', 'days newest first');
  eq(s.getRange(4, 1).getValues()[0][0], 'Games by child', 'first table title');
  eq(s.formats[21] && s.formats[21][0], 'ddd dd/mm/yyyy', 'day column shown as dates');
  s.pivots.forEach((t, i) => {
    eq(t.values.map((v) => [v.column, v.fn, v.name]), [[col('play_id'), 'COUNTA', 'Plays'], [col('minutes'), 'SUM', 'Minutes']], `table ${i} values`);
    eq([t.source.sheet.name, t.source.row, t.source.col, t.source.getLastRow(), t.source.nCols], ['Plays', 1, 1, plays.getMaxRows(), PLAYS.length], `table ${i} source`);
  });
  eq(s.slicers.length, 1, 'one filter');
  const x = s.slicers[0];
  eq([x.title, x.criteria.column, x.criteria.criteria && x.criteria.criteria.type, x.toPivots, x.range.getLastRow(), x.row, x.col],
    ['Name', col('name'), 'not-empty', true, plays.getMaxRows(), 1, 1], 'the Name filter: on the name column, empty rows hidden, no names picked yet');
});

check('the first table leaves room for three more players than there are', () => {
  const tabs = sheet040();
  for (let i = 0; i < 6; i++) tabs.Profiles.push(['p_extra' + i, 'Extra' + i, 'fox', '#000000', new Date('2026-11-01T00:00:00Z'), true, 'sticker']);
  const b = bed({ tabs });
  b.run('setup');
  // 8 players + 3 spare = 11: 1 + 12 * 2 = 25 columns, a gap, the next table at column 27.
  eq(b.ss.getSheetByName('Plays summary').pivots[1].anchor.col, 27, 'second table');
});

check('the summary follows the header row, not a fixed order of columns', () => {
  const tabs = sheet040();
  tabs.Plays = [[...PLAYS].reverse()];
  const b = bed({ tabs });
  b.run('setup');
  const s = b.ss.getSheetByName('Plays summary');
  eq(s.pivots[3].rows[0].column, PLAYS.length - PLAYS.indexOf('name'), 'by child uses the name column');
  eq(s.pivots[0].columns[0].column, PLAYS.length - PLAYS.indexOf('name'), 'games by child uses the name column');
});

check('a play adds one row: the name from Profiles, the game, minutes, device, date and time, and the day', () => {
  const b = ready();
  const r = sync(b, [play({ seconds: 95 })]);
  okReply(r, 'sync');
  eq(r.plays_done, [{ play_id: 'pl1', seconds: 95 }], 'plays_done');
  const [row] = rowsOf(b, 'Plays');
  eq([row.name, row.game, row.minutes, row.device, row.play_id, row.profile_id, row.game_id],
    ['Sam', 'Number Town', 1.6, 'Phone', 'pl1', 'p_sam', 'number-town'], 'row');
  eq(row.played_at.toISOString(), '2026-11-17T18:05:00.000Z', 'played_at');
  eq(row.day.toISOString(), '2026-11-17T12:00:00.000Z', 'day');
  ok(row.received_at instanceof Date, 'received_at');
});

check('the same play again with more time updates its minutes; with less, or twice, changes nothing', () => {
  const b = ready();
  sync(b, [play({ seconds: 60 })]);
  eq(sync(b, [play({ seconds: 600 })]).plays_done, [{ play_id: 'pl1', seconds: 600 }], 'plays_done');
  eq(rowsOf(b, 'Plays').map((r) => r.minutes), [10], 'minutes after more time');
  sync(b, [play({ seconds: 30 })]);
  sync(b, [play({ seconds: 600 })]);
  eq(rowsOf(b, 'Plays').map((r) => r.minutes), [10], 'minutes unchanged');
  sync(b, [play({ play_id: 'pl2', seconds: 6 }), play({ play_id: 'pl2', seconds: 120 })]);
  eq(rowsOf(b, 'Plays').map((r) => [r.play_id, r.minutes]), [['pl1', 10], ['pl2', 2]], 'twice in one batch: one row, the most time');
});

check('day is the London date: late on a summer evening and just after midnight', () => {
  const b = ready();
  sync(b, [play({ play_id: 'a', played_at: '2026-07-01T22:30:00Z' }), play({ play_id: 'b', played_at: '2026-07-01T23:30:00Z' }),
    play({ play_id: 'c', played_at: '2026-12-01T23:30:00Z' })]);
  eq(rowsOf(b, 'Plays').map((r) => r.day.toISOString().slice(0, 10)), ['2026-07-01', '2026-07-02', '2026-12-01'], 'days');
});

check('an unknown child or game id adds nothing but is done (the device stops sending it); a bad play id is not', () => {
  const b = ready();
  const r = sync(b, [play({ play_id: 'x1', profile_id: 'p_nobody' }), play({ play_id: 'x2', game_id: 'bad id!' }),
    play({ play_id: 'x3', profile_id: 'toString' }), play({ play_id: 'bad id!' })]);
  eq(r.plays_done.map((p) => p.play_id), ['x1', 'x2', 'x3'], 'plays_done');
  eq(rowsOf(b, 'Plays'), [], 'Plays rows');
});

check('text is cleaned: a game title starting = is not a formula; seconds are capped at six hours', () => {
  const b = ready();
  sync(b, [play({ game: '=HYPERLINK("x")', seconds: 99999999, device: 'Phone' })]);
  const [row] = rowsOf(b, 'Plays');
  eq([row.game, row.minutes], ['HYPERLINK("x")', 360], 'game and minutes');
});

check('plays before setup wait on the device: none done, nothing written; an outbox without plays still works', () => {
  const b = bed({ tabs: sheet040() });
  const before = b.ss.dump();
  const r = sync(b, [play()]);
  okReply(r, 'sync');
  eq(r.plays_done, [], 'plays_done');
  eq(b.ss.dump(), before, 'Sheet');
  const old = b.post('sync', { results: [], achievements: [] });
  okReply(old, 'an older launcher\'s sync');
  eq(old.plays_done, [], 'plays_done for an older launcher');
});

check('when the Plays tab fills up it grows, keeps its formats, and the summary still covers it all', () => {
  const b = ready();
  const plays = b.ss.getSheetByName('Plays');
  const start = plays.getMaxRows();
  let n = 0;
  while (plays.getLastRow() < start - 1) {
    sync(b, Array.from({ length: 200 }, () => play({ play_id: 'p' + (n++) })));
  }
  ok(plays.getMaxRows() > plays.getLastRow() + 500, `room kept below the plays (rows ${plays.getLastRow()} of ${plays.getMaxRows()})`);
  eq(rowsOf(b, 'Plays').length, n, 'every play has its row');
  eq(new Set(rowsOf(b, 'Plays').map((r) => r.play_id)).size, n, 'no play lost or doubled');
  const s = b.ss.getSheetByName('Plays summary');
  eq([s.pivots.length, s.slicers.length], [5, 1], 'tables and filter after the rebuild');
  ok(s.pivots.every((t) => t.source.getLastRow() === plays.getMaxRows()) && s.slicers[0].range.getLastRow() === plays.getMaxRows(), 'they reach the new last row');
  eq(plays.formats[5][2], plays.getMaxRows(), 'minutes format reaches the new last row');
});

check('previewPlays refuses the live spreadsheet and fills a copy with made-up plays for each player', () => {
  const b = ready();
  let refused = '';
  try { b.run('previewPlays'); } catch (err) { refused = err.message; }
  ok(/copy only/.test(refused), 'refused on a spreadsheet not named as a copy');
  eq(rowsOf(b, 'Plays'), [], 'nothing written to it');
  b.ss.name = 'Copy of Family games';
  b.run('previewPlays');
  const plays = rowsOf(b, 'Plays');
  eq([plays.length, [...new Set(plays.map((r) => r.name))].sort()], [6, ['Alex', 'Sam']], 'three plays each');
  eq(b.lock.held, false, 'lock let go');
});

check('running summary by hand rebuilds it: still five tables and one filter', () => {
  const b = ready();
  b.run('summary');
  b.run('summary');
  const s = b.ss.getSheetByName('Plays summary');
  eq([s.pivots.length, s.slicers.length], [5, 1], 'tables and filter');
});

// ---- Locks --------------------------------------------------------------------------------

check('the new and changed write calls take the lock and let it go', () => {
  const b = bed();
  b.run('setup');
  okReply(b.post('saveState', { profile_id: 'p_sam', game_id: 'g', state: 1 }), 'saveState');
  okReply(b.post('saveLists', { profile_id: 'p_sam', lists: [{ title: 'T', words: ['ab'] }] }), 'saveLists');
  okReply(b.post('updateProfile', { profile_id: 'p_sam', skin: 'fairy' }), 'updateProfile');
  okReply(b.post('sync', { results: [], achievements: [], plays: [play()] }), 'sync with plays');
  eq([b.lock.waits, b.lock.held], [4, false], 'lock taken four times, now free');
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
