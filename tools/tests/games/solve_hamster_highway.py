"""Hamster Highway's level solver: tries every way to put a level's tray down and says what each gives.
Version 1.8 (22 Nov, step 17b (ii)). Not part of the close: a design tool, kept so each level's claims can be re-run.

Changes at v1.8 (step 17b (ii), D-212, D-214, D-215): levels 25 to 30 (those with a floor in the core test's FLOOR)
are checked from their answers, read from the core test (SOL, ROADS, FLOOR: one home each), as their trays of 5 to 13
are far beyond every placement. A first level (25, 27) as level 20 is (near its answer and seed), plus: no way home near
it with fewer gadgets than the floor, and for Pudding's level more ways home near it with Pudding made a Nibble. A twin
(26, 28): its listed roads each checked with run() (all five home, each gadget needed, the seed on one, each its own
gadget kinds as the first hamster uses them), and near each no way home under the floor. Both: a search along the
hamsters' paths from the empty board (every gadget left, on squares near where a hamster goes, up to the floor less
one: mock_hamster_step17b_levels.py 0.1's search) finds no way home under the floor; it catches the sketch page's
fault 3 (level 26 without the hamper's handle: a 3-gadget road), which the near search misses. A level's trap
(`trap: 'stick'`, D-214) is skipped by the "worn sticks all needed" rule and checked instead: near each road, every
way of putting one or both sticks gets nobody home over a stick, but with Pudding a Nibble some way does. Worn sticks
in a tray with no trap named fail a listed level. Levels 1 to 24's results unchanged (their lines compared with 1.7's).

Changes at v1.7 (step 17, D-194): a level with Pudding is judged by run() for every placement (the first hamster's
walk() alone can't see Pudding, who may be further back); for Pudding's own level, "not solved without its new thing"
becomes "with Pudding made a Nibble, more ways get home" (asNibble). Levels 1 to 26's results are unchanged.

Changes at v1.6 (step 14, D-184, D-194): the spoon catapult is tried like the other gadgets. Every search counts the
roads home: placements that get home grouped by the gadget kinds the first hamster uses (D-184: a twin of levels
21 to 30 is "pick your road"). A level with `roads` (a twin of 21 to 30, which needs no `more`) must show at least that
many. Levels 1 to 20's results are unchanged (the road count is only added to what is printed).

Changes at v1.5 (step 13, the spike: D-185, D-190, D-196): the left ramp and the signpost are tried like the other
gadgets, and a zip-line as a pair (every high end, then every low end it reaches); squares are ordered by the board's
own height (9-row boards); hamsters walking both ways need nothing of the solver's own, as it judges every placement
with core.js's walk() and run(). --board FILE.json solves a board that isn't one of the levels (a def with rows and
tray, and an `answer`: [kind, c, r] or ['zip', hc, hr, lc, lr] each, checked near its answer as level 10 is, a
zip-line kept where the answer puts it); it prints how long the search took. Levels 1 to 20's results are unchanged
(the whole run compared with 1.4's, 17 Nov).

Changes at v1.4 (step 9, D-166): a level's twin (`twin` in levels.js) brings in nothing new and names in `more` the
gadget it needs one more of than its first level: it is checked to need it, with that gadget's count cut to the first
level's need (one fewer than the twin needs: the tray's count less one, less one more if it is also the spare), no
placement gets home. "Without the new" is skipped for a level that brings in nothing; a twin with parts (a see-saw or
a lift) is checked without each of them instead (no placement gets home). A twin too big
to try every placement with its whole tray (L5b: a bridge and 5 tubes, over 16 million, more than node's Set holds) is
checked from its answer as level 10 is, and also by trying every placement with one spare fewer (none takes the seed)
and with its first level's count of `more` (none gets home), which are small enough (`full` in ANSWERS). Level 10's
twin, too big even for that, is checked for its `more` near its answer: each of its bridges taken away in turn, and
every way of moving one or two of the rest (none gets home).

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
const [coreUrl, levelsUrl, want, explore, , boardJson] = process.argv.slice(1);
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
const ORDER = ['bridge', 'stick', 'ramp', 'rampL', 'bouncer', 'floater', 'catapult', 'signpost', 'tube', 'zip'];
const ANSWERS = JSON.parse(process.argv[5] || '{}');
// all five home: one hamster's walk() first (quick); run() only where something wears out or moves
function home(lv, placed) {
  const saw = lv.parts.length > 0;   // a see-saw or a lift: every placement by run() (a hamster may drop into a lift's shaft)
  const w = saw ? null : core.walk(lv, placed);
  if (w && w.outcome !== 'home') return { home: false, seed: false };
  if (!lv.parts.length && lv.pudding === null && !Object.values(placed).includes('stick')) return { home: true, seed: w.seed };   // Pudding: run() (D-194)
  const r = core.run(lv, placed);
  return { home: r.hamsters.every((h) => h.outcome === 'home'), seed: r.hamsters.some((h) => h.seed) };
}
// A road home: the gadget kinds the first hamster uses, sorted (a bridge or worn stick it walks over, a ramp it climbs, a
// bouncer, catapult, floater, tube, signpost or zip-line it steps into); gadgets put down but never used don't count.
function used(lv, placed) {
  const kinds = new Set();
  for (const st of core.walk(lv, placed).steps) {
    const r = Math.round(st.r);
    const here = (placed[core.key(st.c, r)] || '').split(':')[0];
    const under = placed[core.key(st.c, r + 1)];
    if (here && here !== 'peg') kinds.add(here);
    if (under === 'bridge' || under === 'stick' || (st.act === 'climb' && (under === 'ramp' || under === 'rampL'))) kinds.add(under);
  }
  return [...kinds].sort().join('+');
}
function count(lv, tray) {
  const kinds = [];
  for (const k of ORDER) for (let i = 0; i < (tray[k] || 0); i++) kinds.push(k);
  let homes = 0, seed = 0, tried = 0;
  const firstSeed = [];
  const roads = new Map();   // each road home (the gadget kinds the first hamster uses): how many placements
  // every set of gadgets up to the tray: tubes fit anywhere, so they go in square order (each set once);
  // the others go in every order (a bridge may need another beside it first), each set counted once
  const seen = new Set();
  const idx = (key) => { const [c, r] = key.split(',').map(Number); return c * (lv.height || core.ROWS) + r; };
  const go = (i, placed, last) => {
    if (i === kinds.length) {
      const sig = Object.keys(placed).sort().map((k) => k + placed[k]).join(' ');
      if (seen.has(sig)) return;
      seen.add(sig);
      tried++;
      const r = home(lv, placed);
      if (r.home) {
        homes++;
        const road = used(lv, placed);
        roads.set(road, (roads.get(road) || 0) + 1);
        if (r.seed) { seed++; if (firstSeed.length < 3) firstSeed.push({ ...placed }); }
      }
      return;
    }
    const k = kinds[i];
    let j = i; while (j < kinds.length && kinds[j] === k) j++;
    go(j, placed, -1);   // the rest of this kind stay in the tray
    if (k === 'zip') {   // a zip-line: every high end, then every low end it reaches
      for (const [c, r] of core.fitCells(lv, placed, k)) {
        for (const [lc, lr] of core.zipLows(lv, placed, c, r)) {
          const pair = core.zipPair(c, r, lc, lr);
          Object.assign(placed, pair);
          go(i + 1, placed, -1);
          for (const key of Object.keys(pair)) delete placed[key];
        }
      }
      return;
    }
    for (const [c, r] of core.fitCells(lv, placed, k)) {
      const key = core.key(c, r);
      if (k === 'tube' && i > 0 && kinds[i - 1] === 'tube' && idx(key) <= last) continue;
      placed[key] = k;
      go(i + 1, placed, idx(key));
      delete placed[key];
    }
  };
  go(0, {}, -1);
  return { tried, home: homes, seed, firstSeed, roads: roads.size, roadList: [...roads.entries()].sort((x, y) => y[1] - x[1]) };
}
// Near the answer: every way of moving one or two of its gadgets (anywhere each fits, or back to the tray).
function near(lv, answer, extra) {
  // a zip-line's two ends stay where the answer puts them (moving one is a pair of squares: not tried)
  const fixed = Object.fromEntries(Object.entries({ ...answer, ...extra }).filter(([, v]) => /^(zip|peg):/.test(v)));
  answer = Object.fromEntries(Object.entries(answer).filter(([k]) => !(k in fixed)));
  extra = Object.fromEntries(Object.entries(extra).filter(([k]) => !(k in fixed)));
  const base = Object.entries(answer).map(([k, kind]) => [k, kind]);
  const put = (placed, kind) => core.fitCells(lv, { ...placed, ...fixed }, kind).map(([c, r]) => core.key(c, r));
  const seen = new Set();
  const res = { tried: 0, home: 0, seed: 0, seedWays: [], fewest: null };
  const judge = (placed0) => {
    const placed = { ...placed0, ...fixed };
    const sig = Object.keys(placed).sort().map((k) => k + placed[k]).join(' ');
    if (seen.has(sig)) return;
    seen.add(sig);
    res.tried++;
    const r = home(lv, placed);
    if (r.home) {
      res.home++;
      const n = Object.values(placed).filter((v) => !v.startsWith('peg:')).length;
      if (res.fewest === null || n < res.fewest) res.fewest = n;
      if (r.seed) { res.seed++; if (res.seedWays.length < 3) res.seedWays.push({ ...placed }); }
    }
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
// A level's trap (D-214: `trap: 'stick'`, the worn sticks in its tray): near each listed road (none or one of its gadgets
// taken away), every way of putting one or both sticks where they fit: no way gets all five home over a stick; with
// Pudding made a Nibble, some way does (the trap tempts: the sticks would carry five Nibbles)
function trapCheck(lv, lvNib, roads) {
  const res = { tried: 0, home: 0, nibHome: 0, nibWay: null, way: null };
  const seen = new Set();
  const judge = (placed) => {
    const sig = Object.keys(placed).sort().map((k) => k + placed[k]).join(' ');
    if (seen.has(sig)) return;
    seen.add(sig);
    res.tried++;
    const overStick = used(lv, placed).split('+').includes('stick');
    if (!overStick) return;
    if (home(lv, placed).home) { res.home++; res.way = res.way || { ...placed }; }
    if (home(lvNib, placed).home) { res.nibHome++; res.nibWay = res.nibWay || { ...placed }; }
  };
  for (const ans of roads) {
    for (const k1 of [null, ...Object.keys(ans)]) {
      const base = { ...ans };
      if (k1) delete base[k1];
      for (const [c1, r1] of core.fitCells(lv, base, 'stick')) {
        const one = { ...base, [core.key(c1, r1)]: 'stick' };
        judge(one);
        if ((lv.tray.stick || 0) < 2) continue;
        for (const [c2, r2] of core.fitCells(lv, one, 'stick')) judge({ ...one, [core.key(c2, r2)]: 'stick' });
      }
    }
  }
  return res;
}
// Under the floor (D-212): from the empty board, every gadget left in the tray put on every square near where a hamster
// goes (one square either side, one above to two below each step), run, and again, up to depth gadgets: any way home is
// a shortcut under the floor. Squares near the paths only, not every placement (mock_hamster_step17b_levels.py 0.1's search)
function pathSearch(lv, depth) {
  const kinds = Object.keys(lv.tray);
  const seen = new Set();
  const found = [];
  const canon = (p) => Object.entries(p).map(([k, v]) => `${v}@${k}`).sort().join(' ');
  const dfs = (placed, n) => {
    const c = canon(placed);
    if (seen.has(c)) return;
    seen.add(c);
    const res = core.run(lv, placed);
    if (res.hamsters.every((h) => h.outcome === 'home')) { found.push({ n, c }); return; }
    if (n >= depth) return;
    const nearSq = new Set();
    for (const h of res.hamsters) for (const st of h.steps) {
      const r0 = Math.round(st.r);
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 2; dr++) nearSq.add(core.key(st.c + dc, r0 + dr));
    }
    const left = core.left(lv, placed);
    for (const sq of nearSq) {
      const [cc, rr] = sq.split(',').map(Number);
      for (const k of kinds) if (k !== 'zip' && (left[k] || 0) > 0 && core.fits(lv, placed, k, cc, rr)) dfs({ ...placed, [sq]: k }, n + 1);
    }
  };
  dfs({}, 0);
  return { tried: seen.size, ways: found.length, fewest: found.length ? Math.min(...found.map((f) => f.n)) : null, sample: found.slice(0, 2).map((f) => f.c) };
}
const out = [];
if (boardJson) {
  // a board that isn't a level (--board): near its answer, with how long it took
  const d = JSON.parse(boardJson);
  const lv = core.parseLevel(d);
  const answer = {};
  for (const [k, c, r, lc, lr] of d.answer) {
    const fine = k === 'zip' ? core.fitsZip(lv, answer, c, r, lc, lr) : core.fits(lv, answer, k, c, r);
    if (!fine) { console.log(JSON.stringify([{ id: d.id, board: true, error: `${k} does not fit at ${c},${r}` }])); process.exit(0); }
    Object.assign(answer, k === 'zip' ? core.zipPair(c, r, lc, lr) : { [core.key(c, r)]: k });
  }
  const t0 = process.hrtime.bigint();
  const ans = home(lv, answer);
  const each = Object.entries(answer).filter(([, v]) => !v.startsWith('peg:')).map(([k, v]) => {
    const p = { ...answer };
    delete p[k];
    if (v.startsWith('zip:')) delete p[v.slice(4)];
    return [k, v.split(':')[0], home(lv, p).home];
  });
  const n = near(lv, answer, {});
  out.push({ id: d.id, board: true, ans, each, near: n, ms: Number(process.hrtime.bigint() - t0) / 1e6 });
  console.log(JSON.stringify(out));
  process.exit(0);
}
for (const d of LEVELS) {
  if (want && !want.split(',').includes(d.id)) continue;
  const lv = core.parseLevel(d);
  const A = ANSWERS[d.id];
  if (A && A.roads && !explore) {
    // a twin of levels 25 to 30 (D-212): its roads listed, each checked with run(), and near each (moving one or two of
    // its gadgets) no way home with fewer gadgets than the floor
    const roads = A.roads.map((ans) => {
      const r = home(lv, ans);
      const each = Object.keys(ans).map((k) => { const p = { ...ans }; delete p[k]; return home(lv, p).home; });
      const n = near(lv, ans, {});
      return { home: r.home, seed: r.seed, kinds: used(lv, ans), each, gadgets: Object.keys(ans).length, near: { tried: n.tried, home: n.home, fewest: n.fewest } };
    });
    const trap = d.trap === 'stick' ? trapCheck(lv, core.parseLevel({ ...d, pudding: null }), A.roads) : null;
    out.push({ id: d.id, listed: true, roads, want: d.roads || null, floor: A.floor, trap, stick: lv.tray.stick || 0, trapName: d.trap || null, under: pathSearch(lv, A.floor - 1) });
    continue;
  }
  if (A && !explore) {
    const ans = home(lv, A.answer);
    const each = Object.keys(A.answer).map((k) => { const p = { ...A.answer }; delete p[k]; return [k, A.answer[k], home(lv, p).home]; });
    const spareAt = core.fitCells(lv, A.answer, d.spare).filter(([c, r]) => { const x = home(lv, { ...A.answer, [core.key(c, r)]: d.spare }); return x.home && x.seed; });
    const nearAll = near(lv, A.answer, A.seed);
    const nearLess = near(lv, A.answer, {});
    const noPart = (lv.parts || []).map((p) => { const lv2 = core.parseLevel({ ...d, parts: (d.parts || []).filter((q) => q.kind !== p.kind) }); const n = near(lv2, A.answer, A.seed); return [p.kind, n.tried, n.home]; });
    const base = d.more ? lv.tray[d.more] - 1 - (d.spare === d.more ? 1 : 0) : null;
    // with its first level's count of `more`: every placement if small enough (full), else near the answer with each of
    // its `more` gadgets taken away in turn (moving one or two of the rest)
    const noMore = !d.more ? null : A.full ? count(lv, { ...lv.tray, [d.more]: base })
      : Object.keys(A.answer).filter((k) => A.answer[k] === d.more).map((k) => { const a = { ...A.answer }; delete a[k]; return near(lv, a, {}); })
          .reduce((x, y) => ({ tried: x.tried + y.tried, home: x.home + y.home }), { tried: 0, home: 0 });
    const lessAll = A.full && d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
    // Pudding's level: near its answer and seed, more ways home with Pudding made a Nibble (D-194)
    const asNibble = d.new === 'pudding' ? near(core.parseLevel({ ...d, pudding: null }), A.answer, A.seed) : null;
    out.push({ id: d.id, near: true, ans, each, spareAt, nearAll, nearLess, noPart, spare: d.spare, more: d.more || null, base, noMore, lessAll,
               floor: A.floor || null, asNibble: asNibble && { tried: asNibble.tried, home: asNibble.home }, under: A.floor ? pathSearch(lv, A.floor - 1) : null });
    continue;
  }
  const all = count(lv, lv.tray);
  const noNew = core.GADGETS.includes(d.new) ? count(lv, { ...lv.tray, [d.new]: 0 })
    : d.new === 'pudding' ? null : d.new ? count(core.parseLevel({ ...d, parts: (d.parts || []).filter((p) => p.kind !== d.new) }), lv.tray) : null;
  // Pudding's level: with Pudding made a Nibble, more ways get home (the build that serves the Nibbles leaves Pudding behind)
  const asNibble = d.new === 'pudding' ? count(core.parseLevel({ ...d, pudding: null }), lv.tray) : null;
  // a level that brings in nothing new but has parts (a twin of 8 or 9): without each part, nothing gets home
  const partsOff = !d.new ? (d.parts || []).map((p) => [p.kind, count(core.parseLevel({ ...d, parts: (d.parts || []).filter((q) => q.kind !== p.kind) }), lv.tray).home]) : [];
  // a twin: with its `more` gadget cut to its first level's need, nothing gets home
  const base = d.more ? lv.tray[d.more] - 1 - (d.spare === d.more ? 1 : 0) : null;
  const noMore = d.more ? count(lv, { ...lv.tray, [d.more]: base }) : null;
  const less = d.spare ? count(lv, { ...lv.tray, [d.spare]: lv.tray[d.spare] - 1 }) : null;
  // worn sticks must all be needed (D-143), unless the level names them as a trap (D-214)
  const fewer = lv.tray.stick && d.trap !== 'stick' ? count(lv, { ...lv.tray, stick: lv.tray.stick - 1 }) : null;
  out.push({ id: d.id, new: d.new, spare: d.spare || null, all, noNew, less, fewer, more: d.more || null, base, noMore, partsOff, roads: d.roads || null, asNibble });
}
console.log(JSON.stringify(out));
'''

args = sys.argv[1:]
explore = ''
board = ''
if '--board' in args:
    i = args.index('--board')
    board = open(args[i + 1], encoding='utf-8').read()
    args = args[:i] + args[i + 2:]
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
    # L10b, the second finale (16 Nov, step 10; test_hamster_highway_core.py 1.10's SOL)
    'L10b': {'answer': {'2,6': 'bridge', '4,5': 'bouncer', '6,2': 'floater', '9,5': 'tube', '9,4': 'tube', '9,3': 'tube', '11,3': 'ramp', '20,1': 'ramp'},
             'seed': {'15,4': 'ramp'}},
    'L5b': {'answer': {'1,6': 'bridge', '7,5': 'tube', '7,4': 'tube', '7,3': 'tube', '7,2': 'tube'}, 'seed': {'7,1': 'tube'}, 'full': True},
}
# Levels 25 to 30 (D-212): their answers, listed roads and floors read from the core test (SOL, ROADS, FLOOR; one home
# for each), not copied here: a first level's answer and its seed gadgets; a twin's roads
CORE = open(os.path.join(HERE, 'test_hamster_highway_core.py'), encoding='utf-8').read()
def js_const(name):
    i = CORE.index(f'const {name} = {{')
    line = CORE[i:CORE.index('\n', i)]
    return line if line.endswith('};') else CORE[i:CORE.index('\n};\n', i) + 3]
READ = 'const key = (c, r) => `${c},${r}`;\n' + js_const('SOL') + '\n' + js_const('FLOOR') + '\n' + js_const('ROADS') + r'''
const P = (list) => Object.fromEntries(list.map(([k, c, r]) => [key(c, r), k]));
const out = {};
for (const [id, f] of Object.entries(FLOOR)) {
  out[id] = ROADS[id] ? { roads: ROADS[id].map(P), floor: f.g } : { answer: P(SOL[id].solve), seed: P(SOL[id].seed), floor: f.g };
}
console.log(JSON.stringify(out));
'''
rr = subprocess.run(['node', '--input-type=module', '-e', READ], capture_output=True, text=True)
if rr.returncode != 0:
    print(rr.stderr)
    sys.exit(1)
ANSWERS.update(json.loads(rr.stdout))
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), want, explore, json.dumps(ANSWERS), board], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    sys.exit(1)
bad = 0
for L in json.loads(r.stdout):
    if L.get('board'):
        if L.get('error'):
            print('FAIL', L['id'], L['error'])
            sys.exit(1)
        ok = L['ans']['home'] and not any(h for _, _, h in L['each'])
        bad += not ok
        n = L['near']
        print(f"{'ok  ' if ok else 'FAIL'} {L['id']} (a board, near its answer): the answer gets all five home: {L['ans']['home']}; without any one of its "
              f"gadgets: {sum(1 for _, _, h in L['each'] if h)} of {len(L['each'])} still home; moving one or two gadgets (the zip-line kept): "
              f"{n['tried']} ways, {n['home']} home; {L['ms'] / 1000:.1f} s")
        continue
    if L.get('listed'):
        R, fl, t = L['roads'], L['floor'], L['trap']
        kinds = {x['kinds'] for x in R}
        under = [x['near']['fewest'] for x in R if x['near']['fewest'] is not None and x['near']['fewest'] < fl]
        trap_ok = t is None or (t['home'] == 0 and t['nibHome'] > 0)
        stick_ok = not L['stick'] or L['trapName'] == 'stick'
        ok = (all(x['home'] and not any(x['each']) and x['gadgets'] >= fl for x in R) and len(kinds) == len(R) >= (L['want'] or 2)
              and any(x['seed'] for x in R) and not under and trap_ok and stick_ok and L['under']['fewest'] is None)
        bad += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {L['id']} (its listed roads, each by run(); near each, not every placement): "
              + '; '.join(f"road {i + 1} ({x['kinds']}, {x['gadgets']} gadgets{', the seed' if x['seed'] else ''}): home {x['home']}, without any one of its gadgets "
                          f"{sum(1 for e in x['each'] if e)} still home, moving one or two: {x['near']['tried']} ways, {x['near']['home']} home, fewest {x['near']['fewest']} gadgets (floor {fl})"
                          for i, x in enumerate(R))
              + f"; {len(kinds)} roads of their own (at least {L['want']} wanted)"
              + (f"; the trap: {t['tried']} ways with worn sticks near the roads, {t['home']} home over a stick, {t['nibHome']} with Pudding a Nibble (e.g. {t['nibWay']})"
                 + (f" FOUND {t['way']}" if t['way'] else '') if t else '')
              + ('' if stick_ok else '; worn sticks in the tray but not named a trap')
              + f"; along the paths with up to {fl - 1} gadgets: {L['under']['tried']} placements, {L['under']['ways']} home {L['under']['sample']}")
        continue
    if L.get('near'):
        each_ok = all(not h for _, _, h in L['each'])
        less_seed = L['nearLess']['seed'] if L['spare'] else 0
        fl, nib = L.get('floor'), L.get('asNibble')
        floor_ok = fl is None or (all(x['fewest'] is None or x['fewest'] >= fl for x in (L['nearAll'], L['nearLess'])) and L['under']['fewest'] is None)
        ok = (L['ans']['home'] and each_ok and L['spareAt'] and less_seed == 0 and all(h == 0 for _, _, h in L['noPart'])
              and (L['noMore'] is None or L['noMore']['home'] == 0) and (L['lessAll'] is None or L['lessAll']['seed'] == 0)
              and floor_ok and (nib is None or nib['home'] > L['nearAll']['home']))
        bad += not ok
        na, nl = L['nearAll'], L['nearLess']
        print(f"{'ok  ' if ok else 'FAIL'} {L['id']} (near its answer, not every placement): the answer gets all five home: {L['ans']['home']}; "
              f"without any one of its gadgets: {sum(1 for _, _, h in L['each'] if h)} of {len(L['each'])} still home; the spare {L['spare']} takes the seed at {L['spareAt']}; "
              f"moving one or two gadgets: {na['tried']} ways, {na['home']} home, {na['seed']} with the seed; with one {L['spare']} fewer: {nl['tried']} ways, {nl['home']} home, {nl['seed']} with the seed"
              + ''.join(f'; without the {k}: {t} ways, {h} home' for k, t, h in L['noPart'])
              + (f"; {'every placement' if L['lessAll'] else 'near the answer'} with {L['base']} {L['more']} (its first level's need): {L['noMore']['tried']} ways, {L['noMore']['home']} home" if L['noMore'] else '')
              + (f"; every placement with one {L['spare']} fewer: {L['lessAll']['tried']} ways, {L['lessAll']['home']} home, {L['lessAll']['seed']} with the seed" if L['lessAll'] else '')
              + (f"; fewest gadgets home near it: {na['fewest']}, without the spare {nl['fewest']} (floor {fl}); along the paths with up to {fl - 1} gadgets: "
                 f"{L['under']['tried']} placements, {L['under']['ways']} home {L['under']['sample']}" if fl else '')
              + (f"; with Pudding a Nibble: {nib['tried']} ways, {nib['home']} home" if nib else ''))
        continue
    a, n, s, f, m = L['all'], L['noNew'], L['less'], L['fewer'], L['noMore']
    p = L.get('asNibble')
    ok = (a['home'] > 0 and (n is None or n['home'] == 0) and (p is None or p['home'] > a['home']) and a['seed'] > 0 and (s is None or s['seed'] == 0) and (f is None or f['home'] == 0)
          and (m is None or m['home'] == 0) and (n is not None or m is not None or p is not None or L['roads']) and all(h == 0 for _, h in L['partsOff'])
          and (not L['roads'] or a['roads'] >= L['roads']))
    bad += not ok
    print(f"{'ok  ' if ok else 'FAIL'} {L['id']}: {a['tried']} ways to put the tray down; {a['home']} get home, {a['seed']} with the seed; "
          + (f"with Pudding a Nibble: {p['home']} home" if p else f"without the {L['new']}: {n['home']} home" if n else f"with {L['base']} {L['more']} (its first level's need): {m['home']} home" if m else 'pick your road')
          + ''.join(f"; without the {k}: {h} home" for k, h in L['partsOff'])
          + (f"; with one {L['spare']} fewer: {s['seed']} with the seed" if s else '; no spare named')
          + (f"; with one stick fewer: {f['home']} home" if f else '')
          + f"; {a['roads']} roads home" + (f" (at least {L['roads']} wanted)" if L['roads'] else '') + f" {a['roadList'][:6]}"
          + f"; first seed solutions {a['firstSeed']}")
sys.exit(1 if bad else 0)
