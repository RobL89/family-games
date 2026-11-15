"""Hamster Highway's level solver: tries every way to put a level's tray down and says what each gives.
Version 1.1 (15 Nov, step 3). Not part of the close: a design tool, kept so each level's claims can be re-run.

Changes at v1.1 (step 3, D-143, D-153): a placement counts as home only when all five hamsters get home, checked
with core.js 1.1's run() wherever one hamster's walk() gets home and something wears out or moves (a worn stick, a
lift); and a level with worn sticks must need every one: with one stick fewer, no placement gets all five home.
--explore C,R KIND (with one level id) tries the level with its golden seed moved to C,R and the spare KIND,
for picking where a seed goes.

For each level in games/hamster-highway/levels.js (or a board given with --rows and --tray), it puts down
every set of gadgets the tray allows, each where it fits (core.js's fits(), D-139, bridges first so a
bridge can sit beside a bridge and a gadget on a bridge), walks a hamster with core.js's walk(), and counts:
  - solutions: placements that get the hamsters home;
  - solutions without the level's new gadget (should be 0);
  - seed solutions: home with the golden seed taken (should be at least 1, D-138);
  - seed solutions with one fewer of the spare gadget (`spare` in levels.js; should be 0, so the seed needs it);
  - with worn sticks: solutions with one stick fewer (should be 0, so all five hamsters matter, D-143).
Usage, from the repo root:
    python3 -B tools/tests/games/solve_hamster_highway.py [level id ...]
Prints one line a level; exits 1 if a level breaks a rule above.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')

JS = r'''
const [coreUrl, levelsUrl, want, explore] = process.argv.slice(1);
const core = await import(coreUrl);
let { LEVELS } = await import(levelsUrl);
if (explore) {
  const [at, kind] = explore.split(' ');
  const [sc, sr] = at.split(',').map(Number);
  LEVELS = LEVELS.filter((d) => d.id === want).map((d) => {
    const tray = { ...d.tray };
    if (d.spare) tray[d.spare] -= 1;
    if (!tray[d.spare]) delete tray[d.spare];
    tray[kind] = (tray[kind] || 0) + 1;
    const rows = d.rows.map((row) => row.replace('*', '.')).map((row, r) => (r === sr ? row.slice(0, sc) + '*' + row.slice(sc + 1) : row));
    return { ...d, rows, tray, spare: kind };
  });
}
const ORDER = ['bridge', 'stick', 'ramp', 'bouncer', 'floater', 'tube'];
// all five home: one hamster's walk() first (quick); run() only where something wears out or moves
function home(lv, placed) {
  const w = core.walk(lv, placed);
  if (w.outcome !== 'home') return { home: false, seed: false };
  if (!lv.parts.length && !Object.values(placed).includes('stick')) return { home: true, seed: w.seed };
  const r = core.run(lv, placed);
  return { home: r.hamsters.every((h) => h.outcome === 'home'), seed: r.hamsters.some((h) => h.seed) };
}
function count(lv, tray) {
  const kinds = [];
  for (const k of ORDER) for (let i = 0; i < (tray[k] || 0); i++) kinds.push(k);
  let homes = 0, seed = 0, tried = 0;
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
      const r = home(lv, placed);
      if (r.home) { homes++; if (r.seed) { seed++; if (firstSeed.length < 3) firstSeed.push({ ...placed }); } }
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
  return { tried, home: homes, seed, firstSeed };
}
const out = [];
for (const d of LEVELS) {
  if (want && !want.split(',').includes(d.id)) continue;
  const lv = core.parseLevel(d);
  const all = count(lv, lv.tray);
  const noNew = count(lv, { ...lv.tray, [d.new]: 0 });
  const less = d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
  const fewer = lv.tray.stick ? count(lv, { ...lv.tray, stick: lv.tray.stick - 1 }) : null;
  out.push({ id: d.id, new: d.new, spare: d.spare || null, all, noNew, less, fewer });
}
console.log(JSON.stringify(out));
'''

args = sys.argv[1:]
explore = ''
if '--explore' in args:
    i = args.index('--explore')
    explore = ' '.join(args[i + 1:i + 3])
    args = args[:i] + args[i + 3:]
want = ','.join(args)
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), want, explore], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    sys.exit(1)
bad = 0
for L in json.loads(r.stdout):
    a, n, s, f = L['all'], L['noNew'], L['less'], L['fewer']
    ok = a['home'] > 0 and n['home'] == 0 and a['seed'] > 0 and (s is None or s['seed'] == 0) and (f is None or f['home'] == 0)
    bad += not ok
    print(f"{'ok  ' if ok else 'FAIL'} {L['id']}: {a['tried']} ways to put the tray down; {a['home']} get home, {a['seed']} with the seed; "
          f"without the {L['new']}: {n['home']} home"
          + (f"; with one {L['spare']} fewer: {s['seed']} with the seed" if s else '; no spare named')
          + (f"; with one stick fewer: {f['home']} home" if f else '')
          + f"; first seed solutions {a['firstSeed']}")
sys.exit(1 if bad else 0)
