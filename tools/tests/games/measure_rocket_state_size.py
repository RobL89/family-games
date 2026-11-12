"""How big Rocket Lander's saved progress can get, against game contract 0.4's cap on `fg:state`
(under 20,000 characters as JSON, section 5). Version 1.0. Not a check: works out the figure quoted in
P-034's assessment of contract 0.4 (12 Nov 2026), so it isn't typed by hand.

The largest progress is format 4 (tracks.js) with every level of both tracks played: each level's
best stars 3 and all 8 rocks found, every ship owned, and big counters. It is built with the game's own
pack() from map.js's tracks (level ids as game.js's buildMap gives them) and fleet.js's ships, then measured as JSON, with and without kit.js's v: 4.

Usage, from the repo root:
    python3 -B tools/tests/games/measure_rocket_state_size.py
"""
import subprocess

JS = r"""
import { TRACKS } from './games/rocket-lander/map.js';
import { route } from './games/_common/rocket/progress.js';
import { pack } from './games/_common/rocket/tracks.js';
import { FLEET } from './games/_common/rocket/fleet.js';
const ids = Object.keys(TRACKS);
// Level ids as game.js's buildMap gives them: the system's id and the level's place, 'moon-1'.
const withIds = (systems) => systems.map((sys) => ({ ...sys, levels: sys.levels.map((lv, n) => ({ ...lv, id: `${sys.id}-${n + 1}` })) }));
const full = (t) => {
  const R = route(withIds(TRACKS[t].systems)), levels = {};
  for (const r of R) levels[r.id] = { stars: 3, rocks: 8 };
  return { edition: TRACKS[t].edition, at: R[R.length - 1].id, open: R[R.length - 1].id, levels, n: R.length };
};
const a = full(ids[0]), b = full(ids[1]);
const p = { at: a.at, open: a.open, levels: a.levels, rocks: 99999, landings: 999999,
  ship: FLEET[FLEET.length - 1].id, ships: FLEET.map((s) => s.id) };
const state = pack(TRACKS, ids[0], p, { [ids[1]]: { edition: b.edition, at: b.at, open: b.open, levels: b.levels } });
const s = JSON.stringify(state), k = JSON.stringify({ v: 4, ...state });
console.log(`levels: ${a.n} + ${b.n}; ships: ${FLEET.length}`);
console.log(`largest state: ${s.length} characters as JSON (${k.length} with v: 4), ` +
  `${(100 * k.length / 20000).toFixed(1)}% of the 20,000 cap`);
"""
print(subprocess.run(['node', '--input-type=module', '-e', JS], capture_output=True, text=True, check=True).stdout, end='')
