// Dry run of apps-script/Code.gs on a local copy of the live Sheet (stage 5, P75): what `setup`
// and the first calls would change, before Rob pastes the script.
//
//   node tools/tests/script/dry_run.js <copy.json>
//
// <copy.json> is { "<tab>": [[header...], [row...], ...], ... } in the Sheet's tab order, read from
// the live Sheet through the Google Drive connector. It holds the children's names, so it is kept
// outside the repo and never committed. Cells written as dd/mm/yyyy become dates. Nothing here
// reaches Google: it runs the real script against the stand-ins in google.js.
// Prints only ids and counts, never names.

'use strict';

const fs = require('fs');
const { open } = require('./bed.js');

const file = process.argv[2];
if (!file) { console.error('Usage: node tools/tests/script/dry_run.js <copy.json>'); process.exit(2); }
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const tabs = {};
for (const [name, cells] of Object.entries(raw)) {
  tabs[name] = cells.map((line) => line.map((v) => {
    const m = typeof v === 'string' && v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`) : v;
  }));
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const lines = [];
const say = (s) => lines.push(s);
let problems = 0;
const expect = (ok, what) => { say(`${ok ? 'ok  ' : 'NOT '} ${what}`); if (!ok) problems++; };

const b = open({ tabs });
const before = b.ss.dump();
say(`Before: tabs ${Object.keys(before).map((t) => `${t} (${Math.max(0, before[t].length - 1)} rows)`).join(', ')}`);

// 1. setup, as Rob will run it after pasting.
const log = b.run('setup');
const after = b.ss.dump();
say('setup log: ' + log.join(' | '));
expect(b.ss.copies.length === 1 && same(b.ss.copies[0].dump(), before), 'setup made a backup copy first, identical to the Sheet before');
const added = Object.keys(after).filter((t) => !(t in before));
expect(same(added, ['Settings']), `tabs added: ${added.join(', ') || 'none'}`);
const changed = Object.keys(before).filter((t) => !same(before[t], after[t]));
expect(changed.length === 0, `existing tabs changed: ${changed.join(', ') || 'none'} (every cell compared)`);
expect(same(after.Settings, [['profile_id', 'game_id', 'key', 'value', 'updated_at']]), 'Settings tab holds only its header row');
const again = b.ss.dump();
b.run('setup');
expect(same(b.ss.dump(), again) && b.ss.copies.length === 1, 'setup run again changes nothing and makes no second backup');

// 2. The calls the launcher makes first.
expect(b.post('ping').version === '0.4.0', 'ping answers 0.4.0');
const profiles = b.post('profiles');
expect(profiles.ok && profiles.profiles.length > 0, `profiles: ${profiles.profiles.length} players, ${profiles.skins.length} skins`);
for (const p of profiles.profiles) {
  const r = b.post('profile', { profile_id: p.profile_id });
  expect(r.ok && Array.isArray(r.word_lists) && same(r.states, {}),
    `profile ${p.profile_id}: ${r.word_lists.length} word list(s) (${r.word_lists.map((l) => l.words.length + ' words').join(', ') || 'none'}), no saved states yet`);
}

// 3. What a child's first saves would do (on this copy only).
const someone = profiles.profiles[0].profile_id;
const s = b.post('saveState', { profile_id: someone, game_id: 'number-town', state: { progress: { explorer: 'x', save: { v: 1 } }, at: new Date().toISOString() } });
expect(s.ok && s.saved, `saveState for ${someone} adds one Settings row (${b.ss.getSheetByName('Settings').dump().length - 1} now)`);
const withLists = profiles.profiles.find((p) => b.post('profile', { profile_id: p.profile_id }).word_lists.length);
if (withLists) {
  const pid = withLists.profile_id;
  const old = b.post('profile', { profile_id: pid }).word_lists;
  const keep = b.ss.getSheetByName('GameLists').dump().filter((l) => l[1] !== pid);
  const r = b.post('saveLists', { profile_id: pid, lists: old.map((l) => ({ list_id: l.list_id, title: l.title, words: l.words })) });
  const rows = b.ss.getSheetByName('GameLists').dump();
  expect(r.ok && same(r.lists.map((l) => l.words), old.map((l) => l.words)) && rows.filter((l) => l[1] === pid).every((l) => l[2] === ''),
    `saving ${pid}'s lists unchanged moves them to one set (no game), words the same`);
  expect(same(rows.filter((l) => l[1] !== pid), keep), "other players' list rows untouched");
}

say(problems ? `DRY RUN: ${problems} problem(s)` : 'DRY RUN: as expected');
console.log(lines.join('\n'));
process.exitCode = problems ? 1 : 0;
