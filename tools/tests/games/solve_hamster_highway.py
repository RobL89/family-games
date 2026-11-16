"""Hamster Highway's level solver: tries every way to put a level's tray down and says what each gives.
Version 1.4 (16 Nov, step 9). Not part of the close: a design tool, kept so each level's claims can be re-run.

Changes at v1.4 (step 9, D-166): a level's twin (`twin` in levels.js) brings in nothing new and names in `more` the
gadget it needs one more of than its first level: it is checked to need it, with that gadget's count cut to the first
level's need (one fewer than the twin needs: the tray's count less one, less one more if it is also the spare), no
placement gets home. "Without the new" is skipped for a level that brings in nothing and has no parts. A twin too big
to try every placement with its whole tray (L5b: a bridge and 5 tubes, over 16 million, more than node's Set holds) is
checked from its answer as level 10 is, and also by trying every placement with one spare fewer (none takes the seed)
and with its first level's count of `more` (none gets home), which are small enough (`full` in ANSWERS).

Changes at v1.3 (step 4, D-157): a level with any part (a see-saw or a lift) is judged by run() for every placement
(a hamster may drop into a lift's shaft, which walk() with time standing still would show wrongly). And a level too
big to try every placement (level 10: 8 gadgets on 24 x 7, far beyond the millions level 5 takes) is checked from
its answer (ANSWERS below) instead: the answer gets all five home; taking away any one of its gadgets doesn't; the
squares where the spare takes the seed; and every way of moving one or two of its gadgets (to any square each fits,
or back to the tray) is run, counting those that get home, with the seed, and, with one fewer of the spare, with
the seed (should be 0), and without each part (should be 0). That is a search near the answer, not of every
placement: a way home that moves three or more gadgets is not tried.

Changes at v1.2 (step 4, D-156): on a level with a see-saw, every placement is judged by run() (walk() can't show
one: with time standing still, a hamster on its high end waits and naps); and a level whose new thing is a part, not
a gadget, is tried without that part for "without the new".

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
const ANSWERS = JSON.parse(process.argv[5] || '{}');
// all five home: one hamster's walk() first (quick); run() only where something wears out or moves
function home(lv, placed) {
  const saw = lv.parts.length > 0;   // a see-saw or a lift: every placement by run() (a hamster may drop into a lift's shaft)
  const w = saw ? null : core.walk(lv, placed);
  if (w && w.outcome !== 'home') return { home: false, seed: false };
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
// Near the answer: every way of moving one or two of its gadgets (anywhere each fits, or back to the tray).
function near(lv, answer, extra) {
  const base = Object.entries(answer).map(([k, kind]) => [k, kind]);
  const put = (placed, kind) => core.fitCells(lv, placed, kind).map(([c, r]) => core.key(c, r));
  const seen = new Set();
  const res = { tried: 0, home: 0, seed: 0, seedWays: [] };
  const judge = (placed) => {
    const sig = Object.keys(placed).sort().map((k) => k + placed[k]).join(' ');
    if (seen.has(sig)) return;
    seen.add(sig);
    res.tried++;
    const r = home(lv, placed);
    if (r.home) { res.home++; if (r.seed) { res.seed++; if (res.seedWays.length < 3) res.seedWays.push({ ...placed }); } }
  };
  const all = { ...answer, ...extra };
  judge(all);
  const keys = Object.keys(all);
  for (let i = 0; i < keys.length; i++) {
    const one = { ...all };
    const k1 = keys[i];
    delete one[k1];
    judge(one);
    for (const sq of put(one, all[k1])) {
      if (sq === k1) continue;
      judge({ ...one, [sq]: all[k1] });
    }
    for (let j = i + 1; j < keys.length; j++) {
      const two = { ...one };
      const k2 = keys[j];
      delete two[k2];
      judge(two);
      const firsts = [null, ...put(two, all[k1])];
      for (const s1 of firsts) {
        const a = s1 ? { ...two, [s1]: all[k1] } : { ...two };
        if (s1) judge(a);
        for (const s2 of put(a, all[k2])) judge({ ...a, [s2]: all[k2] });
      }
    }
  }
  return res;
}
const out = [];
for (const d of LEVELS) {
  if (want && !want.split(',').includes(d.id)) continue;
  const lv = core.parseLevel(d);
  const A = ANSWERS[d.id];
  if (A && !explore) {
    const ans = home(lv, A.answer);
    const each = Object.keys(A.answer).map((k) => { const p = { ...A.answer }; delete p[k]; return [k, A.answer[k], home(lv, p).home]; });
    const spareAt = core.fitCells(lv, A.answer, d.spare).filter(([c, r]) => { const x = home(lv, { ...A.answer, [core.key(c, r)]: d.spare }); return x.home && x.seed; });
    const nearAll = near(lv, A.answer, A.seed);
    const nearLess = near(lv, A.answer, {});
    const noPart = (lv.parts || []).map((p) => { const lv2 = core.parseLevel({ ...d, parts: (d.parts || []).filter((q) => q.kind !== p.kind) }); const n = near(lv2, A.answer, A.seed); return [p.kind, n.tried, n.home]; });
    const base = d.more ? lv.tray[d.more] - 1 - (d.spare === d.more ? 1 : 0) : null;
    const noMore = d.more ? count(lv, { ...lv.tray, [d.more]: base }) : null;
    const lessAll = A.full && d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
    out.push({ id: d.id, near: true, ans, each, spareAt, nearAll, nearLess, noPart, spare: d.spare, more: d.more || null, base, noMore, lessAll });
    continue;
  }
  const all = count(lv, lv.tray);
  const noNew = core.GADGETS.includes(d.new) ? count(lv, { ...lv.tray, [d.new]: 0 })
    : d.new || (d.parts || []).length ? count(core.parseLevel({ ...d, parts: (d.parts || []).filter((p) => p.kind !== d.new) }), lv.tray) : null;
  // a twin: with its `more` gadget cut to its first level's need, nothing gets home
  const base = d.more ? lv.tray[d.more] - 1 - (d.spare === d.more ? 1 : 0) : null;
  const noMore = d.more ? count(lv, { ...lv.tray, [d.more]: base }) : null;
  const less = d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
  const fewer = lv.tray.stick ? count(lv, { ...lv.tray, stick: lv.tray.stick - 1 }) : null;
  out.push({ id: d.id, new: d.new, spare: d.spare || null, all, noNew, less, fewer, more: d.more || null, base, noMore });
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
# Answers for levels too big to search whole: the gadgets that solve it, and the spare's seed square (Claude's design,
# 15 Nov; the same as test_hamster_highway_core.py's SOL for the level).
ANSWERS = {
    'L10': {'answer': {'2,6': 'bridge', '4,5': 'bouncer', '6,2': 'floater', '9,5': 'tube', '9,4': 'tube', '9,3': 'tube', '11,3': 'ramp'},
            'seed': {'20,1': 'ramp'}},
    # L5b, the tube twin (16 Nov, step 9; test_hamster_highway_core.py 1.9's SOL)
    'L5b': {'answer': {'1,6': 'bridge', '7,5': 'tube', '7,4': 'tube', '7,3': 'tube', '7,2': 'tube'}, 'seed': {'7,1': 'tube'}, 'full': True},
}
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), want, explore, json.dumps(ANSWERS)], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    sys.exit(1)
bad = 0
for L in json.loads(r.stdout):
    if L.get('near'):
        each_ok = all(not h for _, _, h in L['each'])
        less_seed = L['nearLess']['seed'] if L['spare'] else 0
        ok = (L['ans']['home'] and each_ok and L['spareAt'] and less_seed == 0 and all(h == 0 for _, _, h in L['noPart'])
              and (L['noMore'] is None or L['noMore']['home'] == 0) and (L['lessAll'] is None or L['lessAll']['seed'] == 0))
        bad += not ok
        na, nl = L['nearAll'], L['nearLess']
        print(f"{'ok  ' if ok else 'FAIL'} {L['id']} (near its answer, not every placement): the answer gets all five home: {L['ans']['home']}; "
              f"without any one of its gadgets: {sum(1 for _, _, h in L['each'] if h)} of {len(L['each'])} still home; the spare {L['spare']} takes the seed at {L['spareAt']}; "
              f"moving one or two gadgets: {na['tried']} ways, {na['home']} home, {na['seed']} with the seed; with one {L['spare']} fewer: {nl['tried']} ways, {nl['home']} home, {nl['seed']} with the seed"
              + ''.join(f'; without the {k}: {t} ways, {h} home' for k, t, h in L['noPart'])
              + (f"; every placement with {L['base']} {L['more']} (its first level's need): {L['noMore']['tried']} ways, {L['noMore']['home']} home" if L['noMore'] else '')
              + (f"; every placement with one {L['spare']} fewer: {L['lessAll']['tried']} ways, {L['lessAll']['home']} home, {L['lessAll']['seed']} with the seed" if L['lessAll'] else ''))
        continue
    a, n, s, f, m = L['all'], L['noNew'], L['less'], L['fewer'], L['noMore']
    ok = (a['home'] > 0 and (n is None or n['home'] == 0) and a['seed'] > 0 and (s is None or s['seed'] == 0) and (f is None or f['home'] == 0)
          and (m is None or m['home'] == 0) and (n is not None or m is not None))
    bad += not ok
    print(f"{'ok  ' if ok else 'FAIL'} {L['id']}: {a['tried']} ways to put the tray down; {a['home']} get home, {a['seed']} with the seed; "
          + (f"without the {L['new']}: {n['home']} home" if n else f"with {L['base']} {L['more']} (its first level's need): {m['home']} home")
          + (f"; with one {L['spare']} fewer: {s['seed']} with the seed" if s else '; no spare named')
          + (f"; with one stick fewer: {f['home']} home" if f else '')
          + f"; first seed solutions {a['firstSeed']}")
sys.exit(1 if bad else 0)
