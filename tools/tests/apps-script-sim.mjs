// Runs apps-script/Code.gs against a small imitation of Google Sheets, so setup() and
// the web app calls can be checked before the script is pasted into the real Sheet.
// Only the parts of SpreadsheetApp that Code.gs uses are imitated.
//
//   node tools/tests/apps-script-sim.mjs

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// ---------- Imitation Sheets ----------

class Sheet {
  constructor(name) { this.name = name; this.cells = []; this.formats = {}; this.frozen = { rows: 0, cols: 0 }; }
  getName() { return this.name; }
  getLastRow() { for (let r = this.cells.length; r > 0; r--) if ((this.cells[r - 1] || []).some((v) => v !== '' && v != null)) return r; return 0; }
  getLastColumn() { let c = 0; this.cells.forEach((row) => { for (let i = row.length; i > c; i--) if (row[i - 1] !== '' && row[i - 1] != null) { c = i; break; } }); return c; }
  getMaxRows() { return 1000; }
  get(r, c) { return ((this.cells[r - 1] || [])[c - 1]) ?? ''; }
  set(r, c, v) {
    while (this.cells.length < r) this.cells.push([]);
    const row = this.cells[r - 1];
    while (row.length < c) row.push('');
    // Like Sheets: text that looks like a number becomes a number, unless the column is plain text.
    const plain = this.formats[c] === '@';
    if (!plain && typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) v = Number(v);
    if (!plain && typeof v === 'string' && /^(true|false)$/i.test(v.trim())) v = /true/i.test(v);
    row[c - 1] = v;
  }
  getRange(a, b, nr = 1, nc = 1) {
    if (typeof a === 'string') {
      const m = a.match(/^([A-Z]):([A-Z])$/);
      const c0 = m[1].charCodeAt(0) - 64, c1 = m[2].charCodeAt(0) - 64;
      return new Range(this, 1, c0, 1000, c1 - c0 + 1);
    }
    return new Range(this, a, b, nr, nc);
  }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  setFrozenRows(n) { this.frozen.rows = n; }
  setFrozenColumns(n) { this.frozen.cols = n; }
  setColumnWidth() {}
}

class Range {
  constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) row.push(this.sheet.get(this.r + i, this.c + j)); out.push(row); } return out; }
  setValues(v) {
    assert.equal(v.length, this.nr, 'setValues rows');
    v.forEach((row, i) => { assert.equal(row.length, this.nc, 'setValues cols'); row.forEach((x, j) => this.sheet.set(this.r + i, this.c + j, x)); });
    return this;
  }
  setValue(x) { this.sheet.set(this.r, this.c, x); return this; }
  setFontWeight() { return this; }
  setWrap() { return this; }
  setNumberFormat(f) { for (let j = 0; j < this.nc; j++) this.sheet.formats[this.c + j] = f; return this; }
}

class Spreadsheet {
  constructor() { this.sheets = []; this.copies = []; }
  getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; }
  insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; }
  getName() { return 'family-games'; }
  getSpreadsheetTimeZone() { return 'Europe/London'; }
  copy(name) { const snap = JSON.stringify(this.sheets.map((s) => [s.name, s.cells])); this.copies.push({ name, snap }); return { getUrl: () => 'https://docs.google.com/copy/' + this.copies.length }; }
}

export function makeSandbox() {
  const ss = new Spreadsheet();
  const props = { FAMILY_CODE: 'test-code' };
  const logs = [];
  const sandbox = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null }) },
    Logger: { log: (m) => logs.push(String(m)) },
    Utilities: {
      formatDate: (d) => new Date(d).toISOString().slice(0, 16).replace('T', ' '),
      getUuid: () => crypto.randomUUID(),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this; } }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('../../apps-script/Code.gs', import.meta.url), 'utf8'), sandbox);
  const post = (body) => JSON.parse(sandbox.doPost({ postData: { contents: JSON.stringify({ code: 'test-code', ...body }) } }).text);
  const g = (expr) => vm.runInContext(expr, sandbox); // reads the script's own constants
  return { ss, sandbox, logs, post, g };
}

// ---------- Checks ----------

const { ss, sandbox, post, g } = makeSandbox();
const tabs = () => ss.sheets.map((s) => s.name).join(', ');

// The Sheet as it is now (checked through the Drive connector, 2026-10-29): three tabs, headers only.
['Profiles', 'Scores', 'Achievements'].forEach((name) => {
  const s = ss.insertSheet(name);
  const headers = { Profiles: ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active'],
    Scores: ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
    Achievements: ['profile_id', 'achievement_id', 'earned_at'] }[name];
  s.getRange(1, 1, 1, headers.length).setValues([headers]);
});
ss.insertSheet('Sheet1');

const log1 = sandbox.setup();
console.log('setup on today\'s Sheet:\n  ' + log1.join('\n  '));
assert.match(log1[0], /^Backup made first/);
assert.equal(ss.copies.length, 1, 'one backup');
assert.equal(tabs(), 'Profiles, Scores, Achievements, Sheet1, Skins, Settings, Lists, Progress');
assert.deepEqual(ss.getSheetByName('Profiles').getRange(1, 1, 1, 7).getValues()[0],
  ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active', 'skin']);
assert.equal(ss.getSheetByName('Settings').getLastRow(), 1 + g('DEFAULT_SETTINGS.length'));
assert.equal(ss.getSheetByName('Lists').getLastRow(), 2);

// Second run: nothing to do, no second backup.
const log2 = sandbox.setup();
assert.match(log2[0], /nothing changed/);
assert.equal(ss.copies.length, 1);

// Add players through the web app: each gets a Settings column.
const a = post({ action: 'addProfile', nickname: 'Sam', avatar: 'fox', colour: '#2E8FD0' }).profile;
const b = post({ action: 'addProfile', nickname: 'Alex', avatar: 'owl', colour: '#E0457B' }).profile;
const settingsTab = ss.getSheetByName('Settings');
assert.deepEqual(settingsTab.getRange(1, 1, 1, 6).getValues()[0], ['game_id', 'setting', 'about', 'everyone', 'Sam', 'Alex']);

// A grown-up types a list and per-child values into the Sheet.
const lists = ss.getSheetByName('Lists');
lists.getRange(3, 1, 1, 3).setValues([['week_5', 'Week 5', 'ship, shop\nshell']]);
lists.getRange(4, 1, 1, 3).setValues([['bad id', 'Oops', 'x']]);
const rowOf = (game, setting) => settingsTab.getDataRange().getValues().findIndex((r) => r[0] === game && r[1] === setting) + 1;
settingsTab.getRange(rowOf('all', 'word_list'), 5).setValue('week_5');
settingsTab.getRange(rowOf('word-worm', 'speed'), 6).setValue('1');
settingsTab.getRange(rowOf('monster-cafe', 'tables'), 4).setValue('2, 5');
settingsTab.getRange(1, 7).setValue('Nobody');

const st = post({ action: 'settings' });
assert.equal(st.ok, true);
assert.equal(st.version, '0.3.0');
const ww = st.settings.find((r) => r.game_id === 'word-worm' && r.setting === 'speed');
assert.deepEqual(ww.players, { [b.profile_id]: '1' }, 'plain text keeps "1" as text');
assert.equal(st.settings.find((r) => r.game_id === 'all' && r.setting === 'word_list').players[a.profile_id], 'week_5');
assert.equal(st.settings.find((r) => r.setting === 'tables').everyone, '2, 5');
assert.equal(st.lists.find((l) => l.list_id === 'week_5').items, 'ship, shop\nshell');
assert.ok(st.warnings.some((w) => /Nobody/.test(w)), 'unmatched column warned');
assert.ok(st.warnings.some((w) => /bad id/.test(w)), 'bad list id warned');
console.log('settings call: ' + st.settings.length + ' rows, ' + st.lists.length + ' lists; warnings:\n  ' + st.warnings.join('\n  '));

// Rename a player: their column follows.
post({ action: 'updateProfile', profile_id: a.profile_id, nickname: 'Sammy' });
assert.equal(settingsTab.getRange(1, 5).getValues()[0][0], 'Sammy');
assert.equal(post({ action: 'settings' }).settings.find((r) => r.setting === 'word_list').players[a.profile_id], 'week_5');

// Progress: saved, newer replaces older, older never replaces newer.
const sync = (progress) => post({ action: 'sync', results: [], achievements: [], progress });
const t1 = '2026-10-29T08:00:00.000Z', t2 = '2026-10-29T09:00:00.000Z';
let r = sync([{ profile_id: a.profile_id, game_id: 'monster-cafe', data: { coins: 5 }, updated_at: t1 }]);
assert.deepEqual(r.progress_saved, [`${a.profile_id}|monster-cafe|${t1}`]);
sync([{ profile_id: a.profile_id, game_id: 'monster-cafe', data: { coins: 9 }, updated_at: t2 }]);
sync([{ profile_id: a.profile_id, game_id: 'monster-cafe', data: { coins: 1 }, updated_at: t1 }]);
r = sync([{ profile_id: 'p_nobody', game_id: 'monster-cafe', data: { coins: 1 }, updated_at: t2 }]);
assert.equal(r.progress_saved.length, 1, 'unknown player dropped but reported done');
const prof = post({ action: 'profile', profile_id: a.profile_id });
assert.deepEqual(prof.progress, { 'monster-cafe': { data: { coins: 9 }, updated_at: t2 } });
assert.equal(ss.getSheetByName('Progress').getLastRow(), 2, 'one row per player per game');

// Results and skins still work as in 0.2.0.
r = post({ action: 'sync', results: [{ event_id: 'e1', profile_id: a.profile_id, game_id: 'word-worm', score: 12, level: 1, stars: 3, seconds: 40, played_at: t2 }], achievements: [] });
assert.deepEqual(r.accepted, ['e1']);
assert.equal(post({ action: 'profile', profile_id: a.profile_id }).stats.stars_total, 3);
assert.equal(post({ action: 'profiles' }).skins.length, 4);

// Later, a new game adds a setting: setup adds just that row, after a backup.
g("DEFAULT_SETTINGS.push(['new-game', 'level', 'test', '1'])");
const log3 = sandbox.setup();
assert.match(log3[0], /^Backup made first/);
assert.ok(log3.some((l) => /Added 1 game setting to Settings: new-game level/.test(l)), log3.join(' | '));
assert.equal(ss.copies.length, 2);

console.log('\nAll Apps Script checks passed.');
