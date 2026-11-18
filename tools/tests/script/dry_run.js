// Dry run of apps-script/Code.gs on a local copy of the live Sheet (stage 5, P75; script 0.5.0, P88):
// what `setup` and the first calls would change, before Rob pastes the script.
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

// 1. setup, as Rob will run it after pasting (script 0.5.0, P88).
const log = b.run('setup');
const after = b.ss.dump();
say('setup log: ' + log.join(' | '));
expect(b.ss.copies.length === 1 && same(b.ss.copies[0].dump(), before), 'setup made a backup copy first, identical to the Sheet before');
const added = Object.keys(after).filter((t) => !(t in before));
expect(same(added, ['Plays', 'Plays summary']), `tabs added: ${added.join(', ') || 'none'}`);
const changed = Object.keys(before).filter((t) => !same(before[t], after[t]));
expect(changed.length === 0, `existing tabs changed: ${changed.join(', ') || 'none'} (every cell compared)`);
const hidden = b.ss.sheets.filter((t) => t.isSheetHidden()).map((t) => t.name);
expect(same(hidden, ['Scores', 'Achievements']), `tabs hidden: ${hidden.join(', ') || 'none'}`);
expect(same(after.Plays, [['played_at', 'day', 'name', 'game', 'minutes', 'device', 'play_id', 'profile_id', 'game_id', 'received_at']]), 'Plays tab holds only its header row');
const summaryTab = b.ss.getSheetByName('Plays summary');
expect(summaryTab.pivots.length === 5 && summaryTab.slicers.length === 1, `Plays summary: 5 tables (the others from column ${summaryTab.pivots[1].anchor.col}) and the Name filter`);
const again = b.ss.dump();
b.run('setup');
expect(same(b.ss.dump(), again) && b.ss.copies.length === 1, 'setup run again changes nothing and makes no second backup');

// 2. The calls the launcher makes first.
expect(b.post('ping').version === '0.5.0', 'ping answers 0.5.0');
const profiles = b.post('profiles');
expect(profiles.ok && profiles.profiles.length > 0, `profiles: ${profiles.profiles.length} players, ${profiles.skins.length} skins`);
for (const p of profiles.profiles) {
  const r = b.post('profile', { profile_id: p.profile_id });
  expect(r.ok && Array.isArray(r.word_lists), `profile ${p.profile_id}: ${r.word_lists.length} word list(s), ${Object.keys(r.states || {}).length} saved game(s)`);
}

// 3. A first play (on this copy only): one row, the child's name from Profiles; more time updates it.
const someone = profiles.profiles[0].profile_id;
const play = { play_id: 'dryrun1', profile_id: someone, game_id: 'number-town', game: 'Number Town', device: 'PC', played_at: new Date().toISOString(), seconds: 0 };
const r1 = b.post('sync', { results: [], achievements: [], plays: [play] });
const r2 = b.post('sync', { results: [], achievements: [], plays: [{ ...play, seconds: 300 }] });
const rows = b.ss.getSheetByName('Plays').dump();
const nickname = (before.Profiles.find((l) => l[0] === someone) || [])[1];
expect(r1.ok && r2.ok && rows.length === 2 && rows[1][2] === nickname && rows[1][4] === 5,
  `a play for ${someone} adds one Plays row with their name; 5 more minutes update it (${rows.length - 1} row, ${rows[1] && rows[1][4]} minutes)`);
const others = Object.keys(before).filter((t) => !same(before[t], b.ss.dump()[t]));
expect(same(others, []), `other tabs still unchanged after the calls: ${others.join(', ') || 'none'}`);

say(problems ? `DRY RUN: ${problems} problem(s)` : 'DRY RUN: as expected');
console.log(lines.join('\n'));
process.exitCode = problems ? 1 : 0;
