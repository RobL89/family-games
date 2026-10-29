// Makes the Settings tab's starting rows from the settings.js of every game marked
// "settings": true in games.json, and puts them
// into apps-script/Code.gs (between the SETTINGS-SEED markers), so the Sheet and the
// games always agree on names, defaults and help text.
//
//   node tools/settings-seed.mjs          writes Code.gs
//   node tools/settings-seed.mjs --check  only checks (exit code 1 if Code.gs is out of date)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { seedRows } from '../shared/settings.js';

const root = new URL('../', import.meta.url);
const games = JSON.parse(readFileSync(new URL('games.json', root), 'utf8')).games
  .filter((g) => g.status === 'ready' && g.settings);
const missing = games.filter((g) => !existsSync(new URL(`games/${g.id}/settings.js`, root)));
if (missing.length) {
  console.error(`games.json says these have settings, but there's no settings.js: ${missing.map((g) => g.id).join(', ')}`);
  process.exit(1);
}

const list = [];
for (const g of games) {
  const { SETTINGS } = await import(pathToFileURL(new URL(`games/${g.id}/settings.js`, root).pathname).href);
  list.push({ id: g.id, settings: SETTINGS });
}

// Shared settings must be described the same way by every game that uses them.
const shared = {};
for (const { id, settings } of list) {
  for (const [name, spec] of Object.entries(settings)) {
    if (!spec.shared) continue;
    const text = JSON.stringify(spec);
    if (shared[name] && shared[name].text !== text) {
      console.error(`Shared setting ${name} differs between ${shared[name].id} and ${id}`);
      process.exit(1);
    }
    shared[name] = { id, text };
  }
}

// Shared ("all") rows first, then each game's rows in launcher order.
const rows = seedRows(list);
rows.sort((a, b) => (a[0] === 'all' ? 0 : 1) - (b[0] === 'all' ? 0 : 1));
const block = '// <SETTINGS-SEED>\nconst DEFAULT_SETTINGS = [\n' +
  rows.map((r) => '  ' + JSON.stringify(r) + ',').join('\n') + '\n];\n// </SETTINGS-SEED>';

const codePath = new URL('apps-script/Code.gs', root);
const code = readFileSync(codePath, 'utf8');
const updated = code.replace(/\/\/ <SETTINGS-SEED>[\s\S]*?\/\/ <\/SETTINGS-SEED>/, block);
if (process.argv.includes('--check')) {
  if (updated !== code) {
    console.error('apps-script/Code.gs is out of date: run node tools/settings-seed.mjs');
    process.exit(1);
  }
  console.log(`Code.gs matches the games' settings (${rows.length} rows).`);
} else {
  writeFileSync(codePath, updated);
  console.log(`Wrote ${rows.length} setting rows from ${list.map((g) => g.id).join(', ')} into apps-script/Code.gs`);
}
