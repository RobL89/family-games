"""Hamster Highway's level solver: tries every way to put a level's tray down and says what each gives.
Version 1.0 (15 Nov, step 2). Not part of the close: a design tool, kept so each level's claims can be re-run.

For each level in games/hamster-highway/levels.js (or a board given with --rows and --tray), it puts down
every set of gadgets the tray allows, each where it fits (core.js's fits(), D-139, bridges first so a
bridge can sit beside a bridge and a gadget on a bridge), walks a hamster with core.js's walk(), and counts:
  - solutions: placements that get the hamsters home;
  - solutions without the level's new gadget (should be 0);
  - seed solutions: home with the golden seed taken (should be at least 1, D-138);
  - seed solutions with one fewer of the spare gadget (`spare` in levels.js; should be 0, so the seed needs it).
Usage, from the repo root:
    python3 -B tools/tests/games/solve_hamster_highway.py [level id ...]
Prints one line a level; exits 1 if a level breaks a rule above.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')

JS = r'''
const [coreUrl, levelsUrl, want] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const ORDER = ['bridge', 'ramp', 'bouncer', 'floater', 'tube'];
function count(lv, tray) {
  const kinds = [];
  for (const k of ORDER) for (let i = 0; i < (tray[k] || 0); i++) kinds.push(k);
  let home = 0, seed = 0, tried = 0;
  const firstSeed = [];
  // every set of gadgets up to the tray: tubes fit anywhere, so they go in square order (each set once);
  // the others go in every order (a bridge may need another beside it first), each set counted once
  const seen = new Set();
  const idx = (key) => { const [c, r] = key.split(',').map(Number); return c * core.ROWS + r; };
  const go = (i, placed, last) => {
    if (i === kinds.length) {
      const sig = Object.keys(placed).sort().map((k) => k + placed[k]).join(' ');
      if (seen.has(sig)) return;
      seen.add(sig);
      tried++;
      const r = core.walk(lv, placed);
      if (r.outcome === 'home') { home++; if (r.seed) { seed++; if (firstSeed.length < 3) firstSeed.push({ ...placed }); } }
      return;
    }
    const k = kinds[i];
    let j = i; while (j < kinds.length && kinds[j] === k) j++;
    go(j, placed, -1);   // the rest of this kind stay in the tray
    for (const [c, r] of core.fitCells(lv, placed, k)) {
      const key = core.key(c, r);
      if (k === 'tube' && i > 0 && kinds[i - 1] === 'tube' && idx(key) <= last) continue;
      placed[key] = k;
      go(i + 1, placed, idx(key));
      delete placed[key];
    }
  };
  go(0, {}, -1);
  return { tried, home, seed, firstSeed };
}
const out = [];
for (const d of LEVELS) {
  if (want && !want.split(',').includes(d.id)) continue;
  const lv = core.parseLevel(d);
  const all = count(lv, lv.tray);
  const noNew = count(lv, { ...lv.tray, [d.new]: 0 });
  const less = d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
  out.push({ id: d.id, new: d.new, spare: d.spare || null, all, noNew, less });
}
console.log(JSON.stringify(out));
'''

want = ','.join(sys.argv[1:])
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), want], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    sys.exit(1)
bad = 0
for L in json.loads(r.stdout):
    a, n, s = L['all'], L['noNew'], L['less']
    ok = a['home'] > 0 and n['home'] == 0 and a['seed'] > 0 and (s is None or s['seed'] == 0)
    bad += not ok
    print(f"{'ok  ' if ok else 'FAIL'} {L['id']}: {a['tried']} ways to put the tray down; {a['home']} get home, {a['seed']} with the seed; "
          f"without the {L['new']}: {n['home']} home"
          + (f"; with one {L['spare']} fewer: {s['seed']} with the seed" if s else '; no spare named')
          + f"; first seed solutions {a['firstSeed']}")
sys.exit(1 if bad else 0)
