"""Rocket Lander's pure core and its boundaries. Version 1.7.

Changes at v1.7 (step 2c-3a, D-089 to D-094): two tracks. The tracks' progress (games/_common/rocket/
tracks.js, format 4): a new device, a track given, a format 3 entry going to the stand-in track,
switching and switching back, a map of an older edition started afresh, and junk. The maps (map.js
2.0): the higher track is version 1.0's stand-in map, checked as before; the lower track holds
Reception's three systems as the level plan says (its ids against plan_rocket_levels.py, which must
pass on Rob's notes, now in the repo as syllabus-notes.json by Q-033), each 7 levels and a challenge,
the new rows' numbers against the notes' params, and every sample a target its level can ask.
Reception's questions (asks.js): what each can ask, the round's shares of more, fewer and the same,
right and wrong for "more than" and "fewer than" and the number shown after a miss, and the
challenge round's plan. Their faces (faces.js): the dots each picture draws. Sums may start taking
away from 1 (sums.js 1.2, `minus_from`); Number mode may keep its targets to part of the line
(rules.js 1.1, `pick`). The new files are held to the purity rule, strings included.

Changes at v1.6 (step 2c-build, D-058, D-064): the progress on the map (games/_common/rocket/
progress.js, format 3): the route, a new player, tidying odd progress, what a round changes (best
stars, rocks found once each across replays up to 8 a level, 2 stars opening the next level, the
rocket's place, hyperspace at a system's end, the systems coming soon), a system's stars, where the
rocket waits in a system it flies to, a picked level, and levels given by number or id. It is held to
the purity rule, strings included.

Changes at v1.5 (step 2c-build, D-058, D-068): Rocket Sums joined Rocket Lander, so every check of
test_rocket_sums_core.py 1.2 moved here, unchanged but for the paths: its sums (sums.js) and
levels (sums-levels.js, once rocket-sums/levels.js) are in games/rocket-lander/, and they are held
to the same purity rule, read as strictly as before (strings included). New: the map of solar
systems (map.js, stand-in levels until the level plan) and that games/rocket-sums/ is retired.

Changes at v1.4 (step 2a-3): device storage is allowed in games/_common/rocket/kit.js alone, for
a tile's progress (D-042), and must be there; index.html may load nothing from outside the site,
the web font included, and the shipped font files are checked (D-043).

Changes at v1.3: levelOf and followLevel moved, word for word, to games/_common/rocket/ladder.js
(step 2a-2), shared with Rocket Sums; their checks now read them there, and ladder.js is
held to the same purity rule as the other core files.

Changes at v1.2: Number mode's level table (levels.js, D-038) and target rules (rules.js,
D-035): the table row by row against D-038, round shares worked out by hand, targets drawn
with a seeded random source, right or wrong landings, and the spot shown after a miss.

Changes at v1.1: the shared engine moved to games/_common/rocket/ (D-027), so a game may
import from games/_common/ and from nothing else outside its folder, and the shared files
may import nothing from outside their own folder (D-036).

Fast checks, no browser. Node runs the core modules (numbers.js, settings.js, planets.js,
in games/_common/rocket/) and compares them with expected values worked out by hand from the games
pack's DESIGN.md (RL-1's star rule, the number line rules) and the settings' ranges.
Then two boundary checks:
  - the core files are pure: no imports, page, network, clock, randomness or eval;
  - the game is on its own: nothing in games/rocket-lander/ imports from outside its
    folder except games/_common/ (D-036), nothing in games/_common/rocket/ imports from
    outside its own folder, and neither fetches or uses the device's storage (D-004,
    D-014, data map v1.1).

Stand-in: Node 22 runs the ES modules in place of the browser.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_core.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'rocket-lander')
COMMON = os.path.join(REPO, 'games', '_common', 'rocket')
CORE = [(COMMON, 'numbers.js'), (COMMON, 'settings.js'), (COMMON, 'planets.js'), (COMMON, 'ladder.js'), (GAME, 'levels.js'), (GAME, 'rules.js')]
# Held to the purity rule with strings included, as test_rocket_sums_core.py 1.2 held the sums files.
STRICT = [(GAME, 'sums-levels.js'), (GAME, 'sums.js'), (GAME, 'map.js'), (COMMON, 'progress.js'),
          (COMMON, 'tracks.js'), (GAME, 'asks.js'), (GAME, 'faces.js')]
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


# ---------- Values from the core, by Node ----------
JS = r"""
const c = process.argv[1];
const N = await import(c + '/numbers.js');
const S = await import(c + '/settings.js');
const P = await import(c + '/planets.js');
const L = await import(process.argv[2] + '/levels.js');
const RU = await import(process.argv[2] + '/rules.js');
const LA = await import(c + '/ladder.js');
// Sums levels (moved from test_rocket_sums_core.py 1.2, D-058)
const SL = await import(process.argv[2] + '/sums-levels.js');
const M = await import(process.argv[2] + '/sums.js');
const MP = await import(process.argv[2] + '/map.js');
const row = (n) => SL.LEVELS[n - 1];
const facts = (op, r) => M.facts(op, r);
const summary = (list) => ({ n: list.length, minA: Math.min(...list.map((f) => f.a)), maxA: Math.max(...list.map((f) => f.a)),
  minB: Math.min(...list.map((f) => f.b)), maxB: Math.max(...list.map((f) => f.b)),
  minAns: Math.min(...list.map((f) => f.answer)), maxAns: Math.max(...list.map((f) => f.answer)),
  rightSums: list.every((f) => ({ '+': f.a + f.b, '−': f.a - f.b, '×': f.a * f.b, '÷': f.a / f.b })[f.op] === f.answer),
  zeroTimes: list.filter((f) => f.op === '×' && (f.a === 0 || f.b === 0)).length,
  divisors: [...new Set(list.filter((f) => f.op === '÷').map((f) => f.b))].sort((x, y) => x - y) });
const draw = (ops, r, n, seed) => { const rand = seeded(seed); let prev = null; const out = [];
  for (let i = 0; i < n; i++) { const s = M.makeSum(ops, r, prev, rand); out.push(s); prev = s; } return out; };
const windows = (ans, ops, r, n, seed) => { const rand = seeded(seed); const out = [];
  for (let i = 0; i < n; i++) out.push(M.lineForSum({ answer: ans }, ops, r, rand)); return out; };
// The map (map.js, D-058): each level's row, and whether its sample is a target the level can ask
const ROWS = { number: L.LEVELS, sums: SL.LEVELS };
const AK = await import(process.argv[2] + '/asks.js');
const rowOf = (lv) => lv.row || (ROWS[lv.kind] || [])[lv.level - 1];
const sampleOk = (lv) => {
  const r = rowOf(lv), sm = lv.sample || {};
  if (lv.kind === 'challenge') return sm.rule === 'challenge' && !lv.row && !lv.level ? 'ok' : 'a challenge has no row of its own';
  if (!r) return 'no row';
  if (lv.kind === 'ask') return AK.choices(r).some((T) => AK.keyOf(T) === AK.keyOf(sm) && JSON.stringify(T) === JSON.stringify(sm)) ? 'ok' : 'a question the level never asks';
  if (lv.kind === 'number') {
    const ln = N.makeLine({ from: r.from, to: r.to, step: 1 }), on = (v) => Number.isInteger(v) && v >= ln.from && v <= ln.to;
    if (sm.rule === 'any') return r.mix.any > 0 && on(sm.value) && (!r.pick || (sm.value >= r.pick[0] && sm.value <= r.pick[1])) ? 'ok' : 'any not asked or off the line';
    if (sm.rule === 'dice') return r.mix.dice > 0 && on(sm.value) && sm.value >= 1 && sm.value <= 6 ? 'ok' : 'dice not asked or not 1 to 6';
    if (sm.rule === 'parity') return r.mix.parity > 0 && ['even', 'odd'].includes(sm.parity) ? 'ok' : 'even or odd not asked';
    return 'unknown rule';
  }
  const m = /^(\d+) (.) (\d+)$/.exec(sm.sum || '');
  if (sm.rule !== 'sum' || !m || !r.ops.includes(m[2])) return 'not a sum of the level\'s operations';
  const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
  if (r.pictures && !(sm.a === a && sm.op === op && sm.b === b && sm.value === ({ '+': a + b, '−': a - b })[op])) return 'a pictured sum needs its numbers and answer';
  return M.partsOf(r).some((p) => M.facts(op, p).some((f) => f.a === a && f.b === b)) ? 'ok' : 'a sum the level never asks';
};
const sysOut = (systems) => systems.map((sys) => ({ id: sys.id, soon: !!sys.soon, levels: sys.levels.map((lv) => [lv.kind, lv.level ?? null]),
  plan: sys.levels.map((lv) => lv.plan ?? null), rows: sys.levels.map((lv) => lv.row ?? null),
  about: sys.levels.map((lv) => lv.about), samples: sys.levels.map(sampleOk) }));
// a seeded random source (mulberry32), so every run draws the same targets
const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const draws = (rule, lineOpts, n, seed) => { const r = seeded(seed), l = N.makeLine(lineOpts); let prev = null; const out = [];
  for (let i = 0; i < n; i++) { const T = RU.pickTarget(rule, l, prev, r); out.push(T); prev = T; } return out; };
const tally = (plan) => plan.reduce((a, k) => ({ ...a, [k]: (a[k] || 0) + 1 }), {});
const l010 = N.makeLine({ from: 0, to: 10, step: 1 });
const line = (o) => { const l = N.makeLine(o); return { from: l.from, to: l.to, step: l.step, count: l.count, notes: l.notes }; };
const out = {
  line010: line({ from: 0, to: 10, step: 1 }),
  swapped: line({ from: 10, to: 0, step: 1 }),
  big: line({ from: 0, to: 1000, step: 0.5 }),
  halves: line({ from: 0, to: 5, step: 0.5 }),
  ragged: line({ from: 0, to: 10, step: 3 }),
  spots5: N.labelSpots(N.makeLine({ from: 0, to: 10, step: 1 }), 5),
  spots0: N.labelSpots(N.makeLine({ from: 0, to: 10, step: 1 }), 0),
  nice: [N.niceAtLeast(2.506), N.niceAtLeast(0.3), N.niceAtLeast(1), N.niceAtLeast(0)],
  fmt: [N.fmt(7), N.fmt(2.5), N.fmt(2.5, 'decimal'), N.fmt(-3), N.fmt(0.25), N.fmt(0.75), N.fmt(0), N.fmt(0.1 + 0.2, 'decimal')],
  say: [N.say(7), N.say(-3), N.say(2.5), N.say(2.5, 'decimal'), N.say(23), N.say(0.5), N.say(100)],
  stars: [[7, 8], [6, 8], [5, 8], [4, 8], [17, 20], [16, 20], [12, 20], [11, 20], [8, 8], [0, 8]].map(([r, t]) => N.starsFor(r, t)),
  nearLoose: N.nearness(N.makeLine({ from: 0, to: 10, step: 1 }), { closeEnough: 0, pxPerStep: 30, gapOfLabels: 1 }),
  nearTight: N.nearness(N.makeLine({ from: 0, to: 100, step: 1 }), { closeEnough: 0, pxPerStep: 3, gapOfLabels: 10 }),
  nearClose: N.nearness(N.makeLine({ from: 0, to: 10, step: 1 }), { closeEnough: 2, pxPerStep: 30, gapOfLabels: 1 }),
  defaults: S.resolveSettings(S.SETTINGS).values,
  defaultNotes: S.resolveSettings(S.SETTINGS).notes,
  given: S.resolveSettings(S.SETTINGS, { from: -20, to: 5000, step: 'x', show_as: 'decimal', speak: false, speed: 0, extra: 1 }),
  badOpt: S.resolveSettings(S.SETTINGS, { show_as: 'roman', speak: 'yes' }),
  fall: { table: S.FALL_SECONDS, more: S.MORE_TIME, at: [1, 2, 3, 4, 5, 2.5, 0, 9, 'x'].map((v) => S.fallSecondsFor(v)), more3: S.fallSecondsFor(3, true), more5: S.fallSecondsFor(5, true) },
  planets: P.PLANETS.map((p) => p.id),
  planetIndex: [P.planetIndex('ice'), P.planetIndex('nope')],
  levels: L.LEVELS,
  levelOf: [3, '3', 8, null, undefined, 0, 9, 2.5, 'x'].map((g) => { const r = LA.levelOf(L.LEVELS, g); return [r.level, r.note]; }),
  counts: [[{ any: 1 }, 8], [{ any: 2, dice: 1 }, 8], [{ parity: 2, dice: 1 }, 8], [{ any: 1, parity: 1, dice: 1 }, 8],
    [{ any: 2, dice: 1 }, 3], [{ any: 2, dice: 1 }, 20]].map(([m, t]) => RU.roundCounts(m, t)),
  plans: [1, 2, 3].map((seed) => RU.planRound({ any: 1, parity: 1, dice: 1 }, 8, seeded(seed))),
  planSame: JSON.stringify(RU.planRound({ any: 2, dice: 1 }, 8, seeded(7))) === JSON.stringify(RU.planRound({ any: 2, dice: 1 }, 8, seeded(7))),
  planTallies: [1, 2, 3].map((seed) => tally(RU.planRound({ any: 1, parity: 1, dice: 1 }, 8, seeded(seed)))),
  any05: draws('any', { from: 0, to: 5, step: 1 }, 300, 11),
  dice010: draws('dice', { from: 0, to: 10, step: 1 }, 300, 12),
  dice05: draws('dice', { from: 0, to: 5, step: 1 }, 300, 13),
  dice2030: draws('dice', { from: 20, to: 30, step: 1 }, 5, 14),
  parity010: draws('parity', { from: 0, to: 10, step: 1 }, 300, 15),
  parity0: draws('parity', { from: 0, to: 0.5, step: 0.5 }, 3, 16),
  right: [
    [{ rule: 'parity', parity: 'even' }, 4, 0], [{ rule: 'parity', parity: 'even' }, 5, 0], [{ rule: 'parity', parity: 'even' }, 4.5, 0],
    [{ rule: 'parity', parity: 'even' }, 0, 0], [{ rule: 'parity', parity: 'even' }, -2, 0], [{ rule: 'parity', parity: 'odd' }, -3, 0],
    [{ rule: 'parity', parity: 'odd' }, 7, 0], [{ rule: 'parity', parity: 'odd' }, 8, 2],
    [{ rule: 'any', value: 7 }, 7, 0], [{ rule: 'any', value: 7 }, 6, 0], [{ rule: 'any', value: 7 }, 5, 2], [{ rule: 'any', value: 7 }, 4, 2],
    [{ rule: 'dice', value: 3 }, 3, 0], [{ rule: 'dice', value: 3 }, 4, 0],
    [{ rule: 'parity', parity: 'odd' }, 4.5, 0], [{ rule: 'parity', parity: 'even' }, 3.5, 0],
  ].map(([T, spot, allowed]) => RU.isRight(T, spot, allowed)),
  goals: [
    [{ rule: 'parity', parity: 'even' }, 5], [{ rule: 'parity', parity: 'even' }, 5.2], [{ rule: 'parity', parity: 'even' }, 0.3],
    [{ rule: 'parity', parity: 'odd' }, 0.2], [{ rule: 'parity', parity: 'odd' }, 9.9], [{ rule: 'parity', parity: 'even' }, 9.6],
    [{ rule: 'any', value: 7 }, 2], [{ rule: 'dice', value: 3 }, 9],
  ].map(([T, raw]) => RU.goalOf(T, raw, l010)),
  lineFor: [
    RU.lineFor(L.LEVELS[0], { from: null, to: null, step: 1, label_every: null }),
    RU.lineFor(L.LEVELS[6], { from: null, to: 20, step: 1, label_every: null }),
    RU.lineFor(L.LEVELS[7], { from: 2, to: null, step: 0.5, label_every: 1 }),
  ],
  follow: (() => { const sc = LA.followLevel(S.SETTINGS, ['from', 'to', 'label_every']); return {
    defaults: S.resolveSettings(sc).values, notes: S.resolveSettings(sc).notes, given: S.resolveSettings(sc, { from: 3, to: 'x', label_every: 2 }),
    sharedUntouched: S.SETTINGS.from.default === 0 }; })(),
  sums: {
    levels: SL.LEVELS.map(({ source, ...r }) => r),
    sources: SL.LEVELS.map((r) => r.source),
    facts: {
      plus5: summary(facts('+', { plus_max: 5 })), plus10: summary(facts('+', { plus_max: 10 })), plus20: summary(facts('+', { plus_max: 20 })),
      minus: summary(facts('−', {})), minus5: summary(facts('−', { minus_max: 5 })), times: summary(facts('×', {})), divide: summary(facts('÷', {})),
    },
    parse: ['+', '+ −', '+ − ×', '+ − × ÷', '× ÷', '', null, 'x'].map((t) => M.parseOps(t)),
    opsFor: [M.opsFor(row(1), { operations: null }), M.opsFor(row(1), { operations: '+ − ×' }), M.opsFor(row(8), {})],
    options: M.OPS_OPTIONS,
    draws: {
      l1: draw(row(1).ops, M.partsOf(row(1))[0], 40, 1), l3: draw(row(3).ops, row(3), 60, 2), l8: draw(row(8).ops, row(8), 200, 3),
      same: JSON.stringify(draw(row(5).ops, row(5), 20, 9)) === JSON.stringify(draw(row(5).ops, row(5), 20, 9)),
    },
    lines: {
      l1: M.lineForSum({ answer: 4 }, row(1).ops, M.partsOf(row(1))[0], seeded(1)),
      l2: M.lineForSum({ answer: 7 }, row(2).ops, M.partsOf(row(2))[1], seeded(1)),
      l3: M.lineForSum({ answer: 9 }, row(3).ops, row(3), seeded(1)),
      l1ops: M.lineForSum({ answer: 8 }, ['+', '−'], M.partsOf(row(1))[0], seeded(1)),
      l4: windows(15, row(4).ops, row(4), 30, 4), l6: windows(3, row(6).ops, row(6), 30, 5),
      l7: windows(81, row(7).ops, row(7), 30, 6), l7low: windows(2, row(7).ops, row(7), 30, 7), l7top: windows(100, row(7).ops, row(7), 30, 8),
    },
    right: [[{ value: 7 }, 7, 0], [{ value: 7 }, 8, 0], [{ value: 7 }, 8, 1], [{ value: 0 }, 0, 0]].map(([T, s, a]) => M.isRight(T, s, a)),
    goal: M.goalOf({ value: 12 }, 3.4),
    parts: [M.partsOf(row(1)), M.partsOf(row(2)), M.partsOf(row(4)).length],
    split: [M.planParts(row(1), 8), M.planParts(row(1), 7), M.planParts(row(2), 3), M.planParts(row(5), 8)],
    noZero: (() => { const rand = seeded(11); let prev = null, zeros = 0;
      for (let i = 0; i < 300; i++) { const s = M.makeSum(['−'], { minus_max: 5 }, prev, rand, { zeroOk: false }); prev = s; if (s.answer === 0) zeros++; } return zeros; })(),
    zeroOnly: M.makeSum(['+'], { plus_max: 0 }, null, seeded(1), { zeroOk: false }).answer,
    partLines: M.partsOf(row(1)).map((p) => M.lineForSum({ answer: 3 }, p.ops, p, seeded(1))).concat(M.partsOf(row(2)).map((p) => M.lineForSum({ answer: 2 }, p.ops, p, seeded(1)))),
    text: [M.sumText({ a: 3, op: '+', b: 4 }), M.sumText({ a: 20, op: '÷', b: 2 })],
  },
  map: {
    first: MP.FIRST_TRACK,
    tracks: Object.fromEntries(Object.entries(MP.TRACKS).map(([id, t]) => [id, { name: t.name, edition: t.edition, systems: sysOut(t.systems) }])),
  },
};
// The progress on the map (progress.js, D-058, D-064), on the stand-in map with the game's level ids
const PG = await import(c + '/progress.js');
const MAPX = MP.TRACKS.year2.systems.map((sys) => ({ id: sys.id, soon: !!sys.soon, levels: sys.levels.map((lv, n) => ({ id: `${sys.id}-${n + 1}` })) }));
const lv = (pairs) => Object.fromEntries(pairs.map(([id, stars, rocks]) => [id, { stars, rocks }]));
const allMoon = (stars, rocks) => lv([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`moon-${n}`, stars, rocks]));
const fin = (p, id, r) => { const before = JSON.stringify(p); const x = PG.finish(MAPX, p, id, r); return x && { ...x, untouched: JSON.stringify(p) === before }; };
const P0 = PG.fresh(MAPX);
const P1 = { ...P0, at: 'moon-2', open: 'moon-2', levels: lv([['moon-1', 3, 5]]), rocks: 5, landings: 7 };
const P7 = { ...P0, at: 'moon-8', open: 'moon-8', levels: lv([1, 2, 3, 4, 5, 6, 7].map((n) => [`moon-${n}`, 3, 8])), rocks: 56, landings: 56 };
const PD = { ...P0, at: 'dust-8', open: 'dust-8', levels: { ...allMoon(3, 8), ...lv([1, 2, 3, 4, 5, 6, 7].map((n) => [`dust-${n}`, 2, 4])) }, rocks: 90, landings: 100 };
out.progress = {
  ROCKS: PG.ROCKS_PER_LEVEL, PASS: PG.PASS_STARS,
  route: PG.route(MAPX),
  fresh: P0,
  tidyJunk: [null, [], 'x', 7].map((j) => PG.tidy(MAPX, j)),
  tidyLevels: PG.tidy(MAPX, { at: 'moon-1', open: 'moon-1', levels: { 'moon-1': { stars: 5, rocks: 12 }, 'moon-2': { stars: 2.6, rocks: -3 }, 'moon-3': { stars: 0, rocks: 4 },
    'nope-1': { stars: 3, rocks: 1 }, 'moon-4': 'x' }, rocks: '12.4', landings: -5 }),
  tidyPlaces: [{ at: 'zz', open: 'zz' }, { at: 'dust-3', open: 'moon-2' }, { levels: { 'moon-8': { stars: 3, rocks: 0 } } }, { at: 'dust-8', open: 'dust-8', levels: { 'dust-8': { stars: 3, rocks: 0 } } },
    { levels: { 'moon-2': { stars: 1, rocks: 0 } } }].map((x) => { const t = PG.tidy(MAPX, x); return [t.at, t.open]; }),
  open: ['moon-1', 'moon-2', 'moon-3', 'dust-1', 'zz'].map((id) => PG.isOpen(MAPX, P1, id)),
  best: [PG.bestOf(P1, 'moon-1'), PG.bestOf(P1, 'moon-2'), PG.foundOf(P1, 'moon-1'), PG.foundOf(P1, 'moon-2')],
  left: [PG.rockLeft(P1, 'moon-1'), PG.rockLeft(P1, 'moon-1', 2), PG.rockLeft(P1, 'moon-1', 3), PG.rockLeft(P1, 'moon-2', 7), PG.rockLeft(P1, 'moon-2', 8),
    PG.rockLeft({ levels: lv([['moon-1', 3, 8]]) }, 'moon-1')],
  firstPass: fin(P0, 'moon-1', { stars: 3, found: 5, right: 7 }),
  firstFail: fin(P0, 'moon-1', { stars: 1, found: 1, right: 4 }),
  replayCap: fin(P1, 'moon-1', { stars: 2, found: 4, right: 5 }),
  replayBest: fin({ ...P1, levels: lv([['moon-1', 2, 3]]) }, 'moon-1', { stars: 3, found: 2, right: 8 }),
  replayWorse: fin(P1, 'moon-1', { stars: 1, found: 0, right: 2 }),
  allFound: fin({ ...P1, levels: lv([['moon-1', 3, 8]]) }, 'moon-1', { stars: 3, found: 3, right: 8 }),
  moon8: fin(P7, 'moon-8', { stars: 2, found: 2, right: 5 }),
  moon8fail: fin(P7, 'moon-8', { stars: 1, found: 0, right: 3 }),
  moon8again: fin({ ...P7, open: 'dust-4', levels: { ...P7.levels, 'moon-8': { stars: 2, rocks: 3 } } }, 'moon-8', { stars: 3, found: 1, right: 8 }),
  dust8: fin(PD, 'dust-8', { stars: 3, found: 8, right: 8 }),
  unknown: PG.finish(MAPX, P1, 'candy-1', { stars: 3 }),
  oddStars: [fin(P0, 'moon-1', { stars: 5 }).now.stars, fin(P0, 'moon-1', { stars: 0 }).now.stars, fin(P0, 'moon-1', { stars: 0 }).passed],
  stars: [PG.systemStars(MAPX, { levels: lv([['moon-1', 3, 0], ['moon-2', 2, 0], ['moon-3', 3, 0]]) }, 0), PG.systemStars(MAPX, P0, 1), PG.systemStars(MAPX, P0, 2)],
  reached: [[P0, 0], [P0, 1], [{ ...P0, open: 'dust-1' }, 1], [{ ...P0, open: 'dust-8' }, 2]].map(([p, s]) => PG.reached(MAPX, p, s)),
  placeIn: [
    PG.placeIn(MAPX, P0, 0), PG.placeIn(MAPX, P0, 1),
    PG.placeIn(MAPX, { ...PD, open: 'dust-3' }, 1),
    PG.placeIn(MAPX, { ...PD, open: 'dust-3', levels: { ...PD.levels, 'moon-4': { stars: 3, rocks: 5 } } }, 0),
    PG.placeIn(MAPX, { ...PD, open: 'dust-3', levels: { ...PD.levels, 'moon-6': { stars: 2, rocks: 8 } } }, 0),
    PG.placeIn(MAPX, { ...PD, open: 'dust-3' }, 0),
    PG.placeIn(MAPX, PD, 2),
  ],
  goTo: (() => { const a = PG.goTo(MAPX, P0, 'dust-3'), b = PG.goTo(MAPX, a, 'moon-2'), c2 = PG.goTo(MAPX, b, 'zz');
    return [[a.at, a.open], [b.at, b.open], c2 === b, JSON.stringify(P0) === JSON.stringify(PG.fresh(MAPX))]; })(),
  given: [1, '9', 16, 17, 'dust-2', 0, 2.5, 'x', null, undefined, ''].map((g) => PG.levelGiven(MAPX, g)),
};
// Tracks (tracks.js, D-089): the two maps' ids, as the game builds them
const TK = await import(c + '/tracks.js');
const idsOf = (t) => MP.TRACKS[t].systems.map((sys) => ({ id: sys.id, soon: !!sys.soon, levels: sys.levels.map((l, n) => ({ id: `${sys.id}-${n + 1}` })) }));
const TR = Object.fromEntries(Object.keys(MP.TRACKS).map((t) => [t, { map: idsOf(t), edition: MP.TRACKS[t].edition }]));
const F3 = { at: 'dust-2', open: 'dust-3', levels: { 'moon-1': { stars: 3, rocks: 8 } }, rocks: 40, landings: 50, ship: 'teapot', ships: ['classic', 'teapot'] };
const u3 = TK.unpack(TR, F3, null, 'reception');
const packed = TK.pack(TR, u3.track, u3.p, u3.others);
const sw = TK.switchTrack(TR, packed, 'reception');
const sw2 = { ...sw, at: 'moon-3', open: 'moon-4', levels: { 'moon-1': { stars: 2, rocks: 1 } }, rocks: 44 };
out.tracks = {
  STAND_IN: TK.STAND_IN,
  fresh: TK.unpack(TR, null, null, 'reception'), freshGiven: TK.unpack(TR, null, 'year2', 'reception'), badGiven: TK.unpack(TR, {}, 'year9', 'reception'),
  f3: u3, f3Reception: TK.unpack(TR, F3, 'reception', 'reception'), packed, switched: sw,
  back: TK.switchTrack(TR, sw2, 'year2'), again: TK.switchTrack(TR, TK.switchTrack(TR, sw2, 'year2'), 'reception'),
  stale: TK.unpack(TR, { track: 'reception', edition: 'lower-0', at: 'moon-3', open: 'moon-3', levels: { 'moon-1': { stars: 3, rocks: 2 } }, rocks: 9, maps: {} }, null, 'reception'),
  junk: [null, 7, 'x', [], { track: 'nope', maps: 'x' }].map((j) => TK.unpack(TR, j, null, 'reception')),
  noStandIn: TK.unpack({ reception: TR.reception }, F3, null, 'reception'),
  given: ['reception', 'year2', 'year9', '', null, 'constructor'].map((g) => TK.trackGiven(TR, g)),
};
// Reception's questions (asks.js)
const lowerRow = (s, n) => MP.TRACKS.reception.systems[s].levels[n - 1].row;
const dotsOn = (html) => (html.match(/class="d-on"/g) || []).length;
const count = (row, kind) => AK.choices(row, kind).length;
const answers = (row) => AK.choices(row).filter((T) => T.value !== undefined).map((T) => T.value);
out.asks = {
  ASKS: AK.ASKS,
  counts: { dots: count(lowerRow(0, 3)), flash: count(lowerRow(0, 5)), more: count(lowerRow(0, 6), 'more'), fewer: count(lowerRow(0, 6), 'fewer'),
    same: count(lowerRow(0, 6), 'same'), oneMore: count(lowerRow(0, 7), 'more'), oneLess: count(lowerRow(0, 7), 'less'), bond5: count(lowerRow(1, 2)),
    bond10: count(lowerRow(1, 7)), double: count(lowerRow(1, 5)), share: count(lowerRow(2, 6)) },
  ranges: [[0, 3], [0, 5], [0, 6], [0, 7], [1, 2], [1, 5], [1, 7], [2, 6]].map(([s2, n]) => { const r = lowerRow(s2, n), a = answers(r);
    return [r.ask, Math.min(...a), Math.max(...a), r.from, r.to]; }),
  rangeFits: AK.choices(lowerRow(0, 6)).filter((T) => T.rule === 'range').every((T) => { for (let v = 0; v <= 10; v++) if (AK.relHolds(T.rel, v, T.n)) return true; return false; }),
  shares: [AK.shares({ more: 2, fewer: 2, same: 1 }, 8), AK.shares({ more: 2, fewer: 2, same: 1 }, 5), AK.shares({ more: 2, fewer: 2, same: 1 }, 3), AK.shares({}, 8)],
  planCompare: AK.planAsks(lowerRow(0, 6), 8, seeded(3)),
  planMoreLess: [AK.planAsks(lowerRow(0, 7), 8, seeded(1)), AK.planAsks(lowerRow(0, 7), 5, seeded(2))],
  planDots: AK.planAsks(lowerRow(0, 3), 4, seeded(1)),
  repeats: [[0, 3], [0, 5], [0, 6], [0, 7], [1, 2], [1, 5], [1, 7], [2, 6]].map(([s2, n]) => { const r = lowerRow(s2, n), plan = AK.planAsks(r, 300, seeded(5));
    const rand = seeded(9); let prev = null, same = 0, bad = 0; const seen = new Set();
    for (const k of plan) { const T = AK.askTarget(r, k, prev, rand); if (prev && AK.keyOf(T) === AK.keyOf(prev)) same++; if ((k && T.rel !== k && T.dir !== k)) bad++; seen.add(AK.keyOf(T)); prev = T; }
    return [r.ask, same, bad, seen.size, new Set(AK.choices(r).map(AK.keyOf)).size]; }),
  right: [
    [{ rule: 'range', rel: 'more', n: 3 }, [4, 3, 3.5, 10, 0]], [{ rule: 'range', rel: 'fewer', n: 3 }, [2, 0, 3, 2.5, 9]],
    [{ rule: 'ask', ask: 'compare', rel: 'same', n: 3, value: 3 }, [3, 4]], [{ rule: 'ask', value: 7 }, [7, 8]],
  ].map(([T, spots]) => spots.map((v) => AK.isRight(T, v))),
  near: AK.isRight({ rule: 'ask', value: 7 }, 8, 1),
  goal: (() => { const ln = N.makeLine({ from: 0, to: 10, step: 1 }); return [
    AK.goalOf({ rule: 'range', rel: 'more', n: 3 }, 1.2, ln), AK.goalOf({ rule: 'range', rel: 'more', n: 3 }, 8.6, ln),
    AK.goalOf({ rule: 'range', rel: 'fewer', n: 4 }, 7.2, ln), AK.goalOf({ rule: 'range', rel: 'more', n: 2 }, 4.5, ln),
    AK.goalOf({ rule: 'range', rel: 'fewer', n: 1 }, 6, ln), AK.goalOf({ rule: 'ask', value: 6 }, 2, ln)]; })(),
  challenge: [AK.planChallenge(7, 8, seeded(1)), AK.planChallenge(7, 8, seeded(2)), AK.planChallenge(7, 3, seeded(3)), AK.planChallenge(7, 20, seeded(4))],
};
// Their faces (faces.js): the dots drawn
const FC = await import(process.argv[2] + '/faces.js');
const chip = (T) => FC.faceChip(T).html;
const n = (html, cls) => (html.match(new RegExp(`class="${cls}"`, 'g')) || []).length;
out.faces = {
  dots: [1, 5, 6, 10].map((k) => [dotsOn(chip({ ask: 'dots', n: k })), n(chip({ ask: 'dots', n: k }), 'fd r' + (k > 5 ? 2 : 1))]),
  flash: [0, 1, 2].map((look) => [1, 3, 5].map((k) => dotsOn(chip({ ask: 'flash', n: k, look, ms: 1500 })))),
  flashMs: chip({ ask: 'flash', n: 3, look: 0, ms: 1500 }).includes('--show:1500ms'),
  compare: ['more', 'fewer', 'same'].map((rel) => { const h = chip({ ask: 'compare', rel, n: 4 }); return [dotsOn(h), /more than|fewer than|the same as/.exec(h)[0]]; }),
  moreLess: [chip({ ask: 'more-less', dir: 'more', n: 6 }), chip({ ask: 'more-less', dir: 'less', n: 6 })].map((h) => [/1 (more|less) than/.exec(h)[0], />6</.test(h), dotsOn(h)]),
  bond: [[5, 3], [10, 6], [10, 1]].map(([w, p]) => { const h = chip({ ask: 'bond', whole: w, part: p }); return [dotsOn(h), n(h, 'd-empty'), n(h, 'f-cell')]; }),
  double: [1, 3, 5].map((k) => dotsOn(chip({ ask: 'double', n: k }))),
  share: [[6, 2], [10, 2]].map(([t, g]) => { const h = chip({ ask: 'share', total: t, groups: g }); return [n(h, 'sw'), n(h, 'plate')]; }),
  sums: [FC.picturedSum({ a: 2, op: '+', b: 3 }), FC.picturedSum({ a: 5, op: '−', b: 2 }), FC.picturedSum({ a: 0, op: '+', b: 4 })].map((c2) => [dotsOn(c2.html), n(c2.html, 'd-gone'), c2.cls]),
};
// Sums taking away from 1 (sums.js 1.2) and Number mode's kept targets (rules.js 1.1)
out.minusFrom = summary(M.facts('−', { minus_max: 5, minus_from: 1 }));
out.minusPlain = summary(M.facts('−', { minus_max: 5 }));
out.pick = (() => { const ln = N.makeLine({ from: 10, to: 20, step: 1 }), rand = seeded(6); let prev = null; const vs = [];
  for (let i = 0; i < 300; i++) { const T = RU.pickTarget('any', ln, prev, rand, [11, 20]); vs.push(T.value); prev = T; }
  const none = RU.pickTarget('any', ln, null, seeded(1), [30, 40]).value;
  return { min: Math.min(...vs), max: Math.max(...vs), kinds: new Set(vs).size, none }; })();
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + COMMON, 'file://' + GAME], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    check(False, 'node ran the core modules')
    sys.exit(1)
o = json.loads(r.stdout)

check(o['line010'] == {'from': 0, 'to': 10, 'step': 1, 'count': 11, 'notes': []}, f'0 to 10 in ones: 11 spots, nothing fixed ({o["line010"]})')
check(o['swapped']['from'] == 0 and o['swapped']['to'] == 10 and any('swapped' in n for n in o['swapped']['notes']), 'ends the wrong way round are swapped, with a note')
# 0 to 1000 in halves is 2001 spots, over 400: (1000 - 0) / 399 = 2.506..., and the next nice gap is 5, so 201 spots
check(o['big']['step'] == 5 and o['big']['count'] == 201 and any('more than 400' in n for n in o['big']['notes']), f'over 400 spots: step 5, 201 spots ({o["big"]})')
check(o['halves']['count'] == 11, '0 to 5 in halves: 11 spots')
# 0 to 10 in threes: 10 / 3 isn't whole, so the line ends at 9 (3 gaps, 4 spots)
check(o['ragged']['to'] == 9 and o['ragged']['count'] == 4, f'a line that isn\'t whole steps ends at the last whole step ({o["ragged"]})')
check(o['spots5'] == [0, 5, 10], 'labels every 5 on 0 to 10: 0, 5, 10')
check(o['spots0'] == [0, 10], 'label_every 0: the two ends only')
check(o['nice'] == [5, 0.5, 1, 1], f'nice gaps: 2.506 -> 5, 0.3 -> 0.5, 1 -> 1, 0 -> 1 ({o["nice"]})')
check(o['fmt'] == ['7', '2½', '2.5', '−3', '¼', '¾', '0', '0.3'], f'numbers written tidily, with a proper minus ({o["fmt"]})')
check(o['say'] == ['seven', 'minus three', 'two and a half', 'two point five', 'twenty-three', 'a half', 'one hundred'],
      f'numbers said as a child says them ({o["say"]})')
# RL-1: right on 85% or more = 3 stars, 60% or more = 2, otherwise 1.
# 7/8 = 87.5% -> 3; 6/8 = 75% -> 2; 5/8 = 62.5% -> 2; 4/8 = 50% -> 1; 17/20 = 85% -> 3; 16/20 = 80% -> 2;
# 12/20 = 60% -> 2; 11/20 = 55% -> 1; 8/8 -> 3; 0/8 -> 1
check(o['stars'] == [3, 2, 2, 1, 3, 2, 2, 1, 3, 1], f'stars by RL-1, edges included ({o["stars"]})')
check(o['nearLoose']['allowed'] == 0 and not o['nearLoose']['tight'], 'marks 30px apart: only the mark itself counts')
check(o['nearTight']['allowed'] == 5 and o['nearTight']['tight'], 'marks 3px apart, labels every 10: within 5 counts')
check(o['nearClose']['allowed'] == 2, 'close_enough 2: within 2 counts')

want = {'speak': True, 'from': 0, 'to': 10, 'step': 1, 'label_every': 1, 'show_as': 'fraction',
        'close_enough': 0, 'landings_per_round': 8, 'speed': 3}
check(o['defaults'] == want and o['defaultNotes'] == [], f'built-in defaults as in the games pack\'s table ({o["defaults"]})')
g = o['given']['values']
check(g['from'] == -20 and g['to'] == 1000 and g['step'] == 1 and g['show_as'] == 'decimal' and g['speak'] is False and g['speed'] == 1
      and 'extra' not in g, f'given settings: kept in range, odd ones fall back, unknown ones ignored ({g})')
# Speeds (Rob, step 2c-3a, D-096): 1 to 5 fall in 18, 15, 12, 9 and 7 seconds; 3 (12 s, the old speed 1) is the default.
# Between two speeds, in a straight line: 2.5 is halfway from 15 to 12, 13.5. Outside 1 to 5, the nearest end; not a number: the default.
# Pictures, dice and sums get 25% more (D-097): 12 x 1.25 = 15; 7 x 1.25 = 8.75.
fl = o['fall']
check(fl['table'] == [18, 15, 12, 9, 7] and fl['at'] == [18, 15, 12, 9, 7, 13.5, 18, 7, 12] and fl['more'] == 1.25
      and fl['more3'] == 15 and fl['more5'] == 8.75, f"fall times: 18, 15, 12, 9, 7 s for speeds 1 to 5 (D-096), 25% more for pictures, dice and sums (D-097): {fl}")
check(len(o['given']['notes']) == 3, f'one note for each value changed: to, step, speed ({o["given"]["notes"]})')
check(o['badOpt']['values']['show_as'] == 'fraction' and o['badOpt']['values']['speak'] is True and len(o['badOpt']['notes']) == 2,
      'an option not in the list, or a word for true or false, falls back to the default')
check(o['planets'] == ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'], 'six planets, in order')
check(o['planetIndex'] == [3, 0], 'planetIndex: ice is 3; an unknown planet is the Moon')

# ---------- Number mode: the level table (D-038) and the target rules (D-035) ----------
# D-038, row by row: line, numbers written, how they look, and the target rules' weights.
# "Some dice faces" is about one landing in three: weight 1 against 2 for the rest.
want_levels = [
    {'level': 1, 'from': 0, 'to': 5, 'label_every': 1, 'labels': 'plain', 'mix': {'any': 1}},
    {'level': 2, 'from': 0, 'to': 10, 'label_every': 1, 'labels': 'plain', 'mix': {'any': 2, 'dice': 1}},
    {'level': 3, 'from': 0, 'to': 10, 'label_every': 1, 'labels': 'parity', 'mix': {'parity': 2, 'dice': 1}},
    {'level': 4, 'from': 0, 'to': 10, 'label_every': 1, 'labels': 'parity-faint', 'mix': {'any': 1, 'parity': 1, 'dice': 1}},
    {'level': 5, 'from': 0, 'to': 10, 'label_every': 1, 'labels': 'odd-faint', 'mix': {'any': 2, 'dice': 1}},
    {'level': 6, 'from': 0, 'to': 10, 'label_every': 2, 'labels': 'plain', 'mix': {'any': 2, 'dice': 1}},
    {'level': 7, 'from': 0, 'to': 10, 'label_every': 5, 'labels': 'plain', 'mix': {'any': 2, 'dice': 1}},
    {'level': 8, 'from': 0, 'to': 10, 'label_every': 0, 'labels': 'plain', 'mix': {'any': 1}},
]
got_levels = [{k: row[k] for k in ('level', 'from', 'to', 'label_every', 'labels', 'mix')} for row in o['levels']]
for w, g in zip(want_levels, got_levels):
    check(w == g, f'level {w["level"]} as D-038 says' + ('' if w == g else f': {g}'))
check(len(got_levels) == 8, f'eight levels ({len(got_levels)})')
check(all(row.get('source', '').startswith('D-038') for row in o['levels']), 'every level row names its source, D-038')
lv = o['levelOf']
check(lv[0] == [3, ''] and lv[1] == [3, ''] and lv[2] == [8, ''], f'levels 3, "3" (from an address) and 8 are taken as given ({lv[:3]})')
check(lv[3] == [1, ''] and lv[4] == [1, ''], 'no level given: level 1, as the contract says for a game on its own (GC5)')
check(all(l[0] == 1 and l[1] for l in lv[5:]), f'0, 9, 2.5 and "x": level 1, with a note saying why ({lv[5:]})')
# Shares by largest remainder, ties to the rule listed first (any, parity, dice):
# 2:1 of 8 is 5.33 and 2.67: floors 5 + 2 = 7, the one left goes to the bigger remainder (.67, dice): 5 and 3.
# 1:1:1 of 8 is 2.67 each: floors 6, two left, remainders tie: any, then parity: 3, 3, 2.
# 2:1 of 3 is 2 and 1 exactly. 2:1 of 20 is 13.33 and 6.67: 13 + 6 = 19, one left to dice: 13 and 7.
c = o['counts']
check(c[0] == {'any': 8}, f'level 1 or 8: all 8 landings any number ({c[0]})')
check(c[1] == {'any': 5, 'dice': 3}, f'2 to 1 of 8: 5 any, 3 dice ({c[1]})')
check(c[2] == {'parity': 5, 'dice': 3}, f'level 3, 2 to 1 of 8: 5 even-or-odd, 3 dice ({c[2]})')
check(c[3] == {'any': 3, 'parity': 3, 'dice': 2}, f'level 4, 1:1:1 of 8: 3, 3 and 2 ({c[3]})')
check(c[4] == {'any': 2, 'dice': 1} and c[5] == {'any': 13, 'dice': 7}, f'2 to 1 of 3 and of 20: 2+1, 13+7 ({c[4]}, {c[5]})')
check(all(t == {'any': 3, 'parity': 3, 'dice': 2} for t in o['planTallies']) and all(len(p) == 8 for p in o['plans']),
      'a round\'s plan holds exactly those shares, in some order')
check(o['planSame'] and len({json.dumps(p) for p in o['plans']}) > 1, 'the same random source gives the same plan; others differ')
a = [t['value'] for t in o['any05']]
check(all(t['rule'] == 'any' for t in o['any05']) and set(a) == {0, 1, 2, 3, 4, 5}, f'any number on 0 to 5: all six spots come up ({sorted(set(a))})')
check(all(x != y for x, y in zip(a, a[1:])), 'never the same number twice running')
d = [t['value'] for t in o['dice010']]
check(all(t['rule'] == 'dice' for t in o['dice010']) and set(d) == {1, 2, 3, 4, 5, 6}, f'dice faces on 0 to 10: 1 to 6 only, never 0 ({sorted(set(d))})')
check(all(x != y for x, y in zip(d, d[1:])), 'never the same dice face twice running')
check(set(t['value'] for t in o['dice05']) == {1, 2, 3, 4, 5}, 'dice faces on 0 to 5: 1 to 5 (6 is off the line)')
check(all(t['rule'] == 'any' and 20 <= t['value'] <= 30 for t in o['dice2030']), 'a line with no 1 to 6 on it: any number instead of a dice face')
pp = [t['parity'] for t in o['parity010']]
check(all(t['rule'] == 'parity' for t in o['parity010']) and set(pp) == {'even', 'odd'}, 'even or odd: both come up')
check(all(t['rule'] == 'any' for t in o['parity0']), 'a line without both an even and an odd whole number: any number instead')
# 4.5 and 3.5 round to 5 and 4, so each is checked against the kind it would round to (mutation bench, v1.2)
check(o['right'] == [True, False, False, True, True, True, True, False, True, False, True, False, True, False, False, False],
      f'right or wrong: 4, 0 and −2 are even, 4.5 and 3.5 are neither, −3 and 7 odd; 7 is right for 7, 5 only within 2; leeway never stretches even or odd ({o["right"]})')
# After a miss: the target itself, or for even or odd the nearest whole number of that kind to
# where the rocket came down, the lower on a tie: 5 -> 4 (4 and 6 tie), 5.2 -> 6, 0.3 -> 0,
# odd from 0.2 -> 1, odd from 9.9 -> 9 (11 is off the line), even from 9.6 -> 10.
check(o['goals'] == [4, 6, 0, 1, 9, 10, 7, 3], f'the spot shown after a miss ({o["goals"]})')
lf = o['lineFor']
check(lf[0] == {'from': 0, 'to': 5, 'step': 1, 'label_every': 1}, f'settings left to the level: level 1\'s line ({lf[0]})')
check(lf[1] == {'from': 0, 'to': 20, 'step': 1, 'label_every': 5}, f'a grown-up\'s "to" overrides that one thing (GC3) ({lf[1]})')
check(lf[2] == {'from': 2, 'to': 10, 'step': 0.5, 'label_every': 1}, f'and so do "from", "step" and "label_every" ({lf[2]})')
fo = o['follow']
check(fo['defaults']['from'] is None and fo['defaults']['to'] is None and fo['defaults']['label_every'] is None and fo['notes'] == [],
      'Number mode\'s line settings default to "follow the level"')
check(fo['given']['values']['from'] == 3 and fo['given']['values']['to'] is None and fo['given']['values']['label_every'] == 2
      and len(fo['given']['notes']) == 1, f'a given value is used; a bad one falls back to the level, with a note ({fo["given"]})')
check(fo['sharedUntouched'], 'the shared settings are not changed by it')

# ---------- Sums levels (moved from test_rocket_sums_core.py 1.2: D-058) ----------
so = o['sums']

# ---------- Sums: The level table, against D-039 ----------
W = {'layout': 'stretch', 'span': 10}
want = [
    {'level': 1, 'ops': ['+'], 'layout': 'line', 'from': 0, 'label_every': 1, 'parts': [{'plus_max': 5, 'to': 5}, {'plus_max': 10, 'to': 10}]},
    {'level': 2, 'ops': ['−'], 'layout': 'line', 'from': 0, 'label_every': 1, 'parts': [{'minus_max': 5, 'to': 5}, {'minus_max': 10, 'to': 10}]},
    {'level': 3, 'ops': ['+', '−'], 'plus_max': 10, 'layout': 'line', 'from': 0, 'to': 10, 'label_every': 1},
    {'level': 4, 'ops': ['+'], 'plus_max': 20, **W, 'label_every': 1},
    {'level': 5, 'ops': ['+', '−'], 'plus_max': 20, **W, 'label_every': 1},
    {'level': 6, 'ops': ['+', '−'], 'plus_max': 20, **W, 'label_every': 2},
    {'level': 7, 'ops': ['×'], **W, 'label_every': 1},
    {'level': 8, 'ops': ['+', '−', '×', '÷'], 'plus_max': 20, **W, 'label_every': 1},
]
check(len(so['levels']) == 8, f"8 levels (D-039): {len(so['levels'])}")
for w, g in zip(want, so['levels']):
    check(g == w, f"level {w['level']} as D-039{' and D-040' if w['level'] < 3 else ''}: {g}")
check(all('D-039' in s for s in so['sources']), 'every level names its source, D-039')
check(all('D-040' in s for s in so['sources'][:2]), 'levels 1 and 2 name D-040')

# ---------- Sums: The sums each operation can ask ----------
f = so['facts']
exp = {
    'plus5': dict(n=21, minA=0, maxA=5, minB=0, maxB=5, minAns=0, maxAns=5),
    'plus10': dict(n=66, minA=0, maxA=10, minB=0, maxB=10, minAns=0, maxAns=10),
    'plus20': dict(n=121, minA=0, maxA=10, minB=0, maxB=10, minAns=0, maxAns=20),
    'minus': dict(n=66, minA=0, maxA=10, minB=0, maxB=10, minAns=0, maxAns=10),
    'minus5': dict(n=21, minA=0, maxA=5, minB=0, maxB=5, minAns=0, maxAns=5),
    'times': dict(n=100, minA=1, maxA=10, minB=1, maxB=10, minAns=1, maxAns=100),
    'divide': dict(n=33, minA=0, maxA=100, minB=2, maxB=10, minAns=0, maxAns=10),
}
for k, e in exp.items():
    got = {x: f[k][x] for x in e}
    check(got == e, f'{k}: {e["n"]} sums, numbers and answers in range: {got}')
    check(f[k]['rightSums'], f'{k}: every answer is right')
check(f['times']['zeroTimes'] == 0, 'no times sums with a 0 (D-033)')
check(f['divide']['divisors'] == [2, 5, 10], f"divide only by 2, 5 or 10 (D-023): {f['divide']['divisors']}")
check(f['minus']['minAns'] == 0, 'nothing below zero (D-024)')

# ---------- Sums: The operations setting ----------
check(so['parse'] == [['+'], ['+', '−'], ['+', '−', '×'], ['+', '−', '×', '÷'], ['×', '÷'], [], [], []],
      f"operations read from a setting's text: {so['parse']}")
check(so['opsFor'] == [['+'], ['+', '−', '×'], ['+', '−', '×', '÷']], f"no setting: the level's; a setting overrides it: {so['opsFor']}")
check(so['options'] == ['+', '+ −', '+ − ×', '+ − × ÷'], f"the setting's choices: {so['options']}")

# ---------- Sums: Sums drawn with a seeded random source ----------
d = so['draws']
check({s['op'] for s in d['l1']} == {'+'} and all(s['answer'] <= 5 for s in d['l1']), "level 1's first half: + with answers up to 5 only")
check({s['op'] for s in d['l3']} == {'+', '−'} and all(0 <= s['answer'] <= 10 for s in d['l3']), 'level 3: + and −, answers 0 to 10')
check({s['op'] for s in d['l8']} == {'+', '−', '×', '÷'}, f"level 8: all four operations come up in 200 sums: {sorted({s['op'] for s in d['l8']})}")
check(all(s['text'] == f"{s['a']} {s['op']} {s['b']}" for s in d['l8']), 'each sum carries its text')
check(d['same'], 'the same seed draws the same sums (no randomness of its own)')


def twice(v):
    return any(i and (s['a'], s['op'], s['b']) == (v[i - 1]['a'], v[i - 1]['op'], v[i - 1]['b']) for i, s in enumerate(v))


check(not any(twice(v) for v in (d['l1'], d['l3'], d['l8'])), 'never the same sum twice running')

# ---------- Sums: The line for each sum ----------
ln = so['lines']
check(ln['l1'] == {'from': 0, 'to': 5, 'step': 1, 'label_every': 1}, f"level 1's first half: the whole line 0 to 5 (D-039, D-040): {ln['l1']}")
check(ln['l2'] == {'from': 0, 'to': 10, 'step': 1, 'label_every': 1}, f"level 2's second half: 0 to 10: {ln['l2']}")
check(ln['l3'] == {'from': 0, 'to': 10, 'step': 1, 'label_every': 1}, f"level 3: 0 to 10: {ln['l3']}")
check(ln['l1ops'] == {'from': 0, 'to': 10, 'step': 1, 'label_every': 1},
      f"level 1's first half with + − set: answers past 5, so the 10-mark stretch 0 to 10: {ln['l1ops']}")


def windows_ok(ws, ans, top, name, every=1):
    good = all(w['to'] - w['from'] == 10 and w['from'] <= ans <= w['to'] and 0 <= w['from'] and w['to'] <= top
               and w['step'] == 1 and w['label_every'] == every for w in ws)
    check(good, f'{name}: every window is 10 marks inside 0 to {top}, with {ans} in it')
    return {w['from'] for w in ws}


starts = windows_ok(ln['l4'], 15, 20, 'level 4, answer 15')
check(len(starts) > 1, f'level 4: the answer is not always at the same place in the window: starts {sorted(starts)}')
windows_ok(ln['l6'], 3, 20, 'level 6, answer 3', every=2)
s7 = windows_ok(ln['l7'], 81, 100, 'level 7, answer 81')
check(len(s7) > 1, f'level 7: windows vary: starts {sorted(s7)}')
windows_ok(ln['l7low'], 2, 100, 'level 7, answer 2 (near the start)')
windows_ok(ln['l7top'], 100, 100, 'level 7, answer 100 (the end)')

# ---------- Sums: Right or wrong ----------
check(so['right'] == [True, False, True, True], f"right on the answer, wrong beside it, leeway honoured: {so['right']}")
check(so['goal'] == 12, 'after a miss the answer is shown')
check(so['text'] == ['3 + 4', '20 ÷ 2'], f"sum text: {so['text']}")

# ---------- Sums: Levels 1 and 2 in two halves (D-040) ----------
p1, p2, n4 = so['parts']
check([(p['plus_max'], p['to'], p['ops']) for p in p1] == [(5, 5, ['+']), (10, 10, ['+'])], f"level 1's halves: + to 5 on 0 to 5, then + to 10 on 0 to 10: {p1}")
check([(p['minus_max'], p['to'], p['ops']) for p in p2] == [(5, 5, ['−']), (10, 10, ['−'])], f"level 2's halves: − to 5 on 0 to 5, then − to 10 on 0 to 10: {p2}")
check(n4 == 1, 'a level without parts is one part')
check(so['split'] == [[0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 0, 0, 1, 1, 1], [0, 0, 1], [0] * 8],
      f"a round's landings split into halves, the first half the bigger when odd: {so['split']}")
check(so['partLines'] == [{'from': 0, 'to': 5, 'step': 1, 'label_every': 1}, {'from': 0, 'to': 10, 'step': 1, 'label_every': 1}] * 2,
      f"each half on its own line: {so['partLines']}")

# ---------- Sums: At most one 0 a round (proposed, Q-022) ----------
check(so['noZero'] == 0, f"asked to, makeSum leaves out sums answering 0 (− to 5, 300 draws): {so['noZero']} zeros")
check(so['zeroOnly'] == 0, 'if every sum answers 0, one is still asked rather than none')

# ---------- The maps of solar systems (map.js 2.0, D-058, D-089): a map for each track ----------
mp = o['map']
TRK = mp['tracks']
check(list(TRK) == ['reception', 'year2'] and mp['first'] == 'reception',
      f"two tracks, lower (reception) and higher (year2); a new device starts on the lower (D-089): {list(TRK)}, first {mp['first']}")
check(all([x['id'] for x in t['systems']] == ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'] for t in TRK.values()),
      "each track has the same six systems, in the planets' order")
# The higher track: version 1.0's stand-in levels until step 2c-3b, checked as map.js 1.0 was
hi = TRK['year2']
check(hi['edition'] == 'stand-in' and 'stand-in' in hi['name'], f"the higher track is the stand-in map until step 2c-3b: {hi['edition']!r}, {hi['name']!r}")
moon, dust = hi['systems'][0], hi['systems'][1]
check(moon['levels'] == [['number', n] for n in range(1, 9)] and not moon['soon'], f"its Moon holds Number mode's eight levels, 1 to 8 (D-068): {moon['levels']}")
check(dust['levels'] == [['sums', n] for n in range(1, 9)] and not dust['soon'], f"its Red Dust holds the eight sums levels, 1 to 8 (D-068): {dust['levels']}")
check(all(x['soon'] and x['levels'] == [] for x in hi['systems'][2:]), 'its Candy, Ice, Jungle and Ringed are coming soon, with no levels yet')
# The lower track: Reception's three systems, as the level plan says (D-091)
lo = TRK['reception']
check(lo['edition'] not in ('', 'stand-in'), f"the lower track has an edition of its own: {lo['edition']!r}")
check(all(len(x['levels']) == 8 and not x['soon'] for x in lo['systems'][:3]) and all(x['soon'] and x['levels'] == [] for x in lo['systems'][3:]),
      'lower track: Moon, Red Dust and Candy hold 8 levels each; Ice, Jungle and Ringed (Year 1, step 2c-3c) are coming soon')
check(all(x['levels'][7] == ['challenge', None] and x['plan'][7] == 'challenge' for x in lo['systems'][:3]) and
      all(k != 'challenge' for x in lo['systems'][:3] for k, _ in x['levels'][:7]),
      'each of them ends in a challenge round, and only there (D-091)')
sys.path.insert(0, HERE)
import plan_rocket_levels as PLANS  # noqa: E402
want_plan = PLANS.PLAN['reception']['systems'][:3]
got_plan = [x['plan'][:7] for x in lo['systems'][:3]]
check(got_plan == want_plan, f'lower track levels 1 to 7 are the level plan\'s, in its order (plan_rocket_levels.py): {got_plan}')
NOTES = os.path.join(HERE, 'syllabus-notes.json')
pr_run = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'plan_rocket_levels.py'), NOTES], capture_output=True, text=True)
check(pr_run.returncode == 0 and 'plan checks pass' in pr_run.stdout, "the level plan passes its checks against Rob's notes in the repo (Q-033)")
notes = {lv['id']: lv['params'] for lv in json.load(open(NOTES, encoding='utf-8'))['levels']}
check('players' not in json.load(open(NOTES, encoding='utf-8'))['meta'], "the notes in the repo hold no ages (meta.players removed, D-011)")
byplan = {pl: (k, r) for x in lo['systems'][:3] for pl, (k, _), r in zip(x['plan'], x['levels'], x['rows'])}
P = lambda i: notes[i]  # noqa: E731
row = lambda i: byplan[i][1]  # noqa: E731
want_rows = [
    ('R03', row('R03')['ask'] == 'dots' and [row('R03')['min'], row('R03')['max']] == [P('R03')['min'], P('R03')['max']]),
    ('R04', row('R04')['ask'] == 'flash' and [row('R04')['min'], row('R04')['max'], row('R04')['show_ms']] == [P('R04')['min'], P('R04')['max'], P('R04')['show_ms']]),
    ('R05', row('R05')['ask'] == 'compare' and [row('R05')['min'], row('R05')['max']] == [P('R05')['min'], P('R05')['max']] and row('R05')['rels']['same'] > 0 and P('R05')['include_same']),
    ('R06', row('R06')['ask'] == 'more-less' and [row('R06')['min'], row('R06')['max']] == [P('R06')['min'], P('R06')['max']]),
    ('R07', row('R07')['pick'] == [P('R07')['min'], P('R07')['max']] and row('R07')['from'] <= P('R07')['min'] and row('R07')['to'] == P('R07')['max']),
    ('R08', row('R08')['ask'] == 'bond' and row('R08')['whole'] == P('R08')['target'] and P('R08')['show_objects']),
    ('R09', row('R09')['plus_max'] == P('R09')['answer_max'] and row('R09')['pictures'] == P('R09')['show_objects'] and row('R09')['ops'] == ['+']),
    ('R10', [row('R10')['minus_from'], row('R10')['minus_max']] == P('R10')['start'] and row('R10')['pictures'] == P('R10')['show_objects'] and row('R10')['ops'] == ['−']),
    ('R11', row('R11')['ask'] == 'double' and row('R11')['max'] == P('R11')['max_base']),
    ('R12', row('R12')['ask'] == 'bond' and row('R12')['whole'] == P('R12')['target'] and P('R12')['show_objects']),
    ('R16', row('R16')['ask'] == 'share' and row('R16')['total_max'] == P('R16')['total_max'] and [row('R16')['groups']] == P('R16')['groups']),
    ('X-dice6', row('X-dice6')['labels'] == 'dice' and [row('X-dice6')['from'], row('X-dice6')['to']] == [0, 6] and row('X-dice6')['mix'] == {'any': 1}),
    ('X-dice12', row('X-dice12')['labels'] == 'dice' and [row('X-dice12')['from'], row('X-dice12')['to']] == [0, 12] and row('X-dice12')['mix'] == {'any': 1}),
]
check(all(ok for _, ok in want_rows), f"the new rows' numbers are the notes' params (dice lines: D-060, D-067, 0 to 6 and 0 to 12, written-number targets): {[i for i, ok in want_rows if not ok]}")
reused = {pl: lvl for x in lo['systems'][:3] for pl, (k, lvl) in zip(x['plan'], x['levels']) if lvl is not None}
check(reused == {'R01': 1, 'R02': 2, 'X-odd-faint': 5, 'R13': 1, 'R14': 2, 'X-mix10': 3, 'R15': 3, 'X-parity-faint': 4},
      f"levels that play today reuse today's rows: Number mode 1, 2, 5, 3, 4 and sums 1, 2, 3 (level plan section 2): {reused}")
check(all(isinstance(t, str) and 0 < len(t) <= 32 for tr in TRK.values() for x in tr['systems'] for t in x['about']),
      f"every level says what it asks, in a few words (32 letters at most): {[t for tr in TRK.values() for x in tr['systems'] for t in x['about'] if not (isinstance(t, str) and 0 < len(t) <= 32)]}")
bad = [(k, x['id'], i + 1, r) for k, tr in TRK.items() for x in tr['systems'] for i, r in enumerate(x['samples']) if r != 'ok']
check(not bad, f'every level\'s sample chip is a target the level can ask: {bad}')
check(not os.path.exists(os.path.join(REPO, 'games', 'rocket-sums')), 'games/rocket-sums/ is retired: the sums tile is part of Rocket Lander now (D-058)')

# ---------- The tracks' progress (tracks.js, D-089): format 4 ----------
tk = o['tracks']
check(tk['STAND_IN'] == 'stand-in', f"the stand-in edition's name: {tk['STAND_IN']!r}")
check(tk['fresh'] == {'track': 'reception', 'p': {}, 'others': {}} and tk['freshGiven']['track'] == 'year2' and tk['badGiven']['track'] == 'reception',
      f"a new device: the first track, nothing kept; a track given is played; an unknown one isn't: {tk['fresh']}, {tk['freshGiven']['track']}, {tk['badGiven']['track']}")
f3 = tk['f3']
check(f3['track'] == 'year2' and f3['p'] == {'at': 'dust-2', 'open': 'dust-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}, 'rocks': 40, 'landings': 50, 'ship': 'teapot', 'ships': ['classic', 'teapot']}
      and f3['others'] == {}, f"a format 3 entry (made on the stand-in levels) plays on the stand-in track, all of it kept: {f3}")
f3r = tk['f3Reception']
check(f3r['track'] == 'reception' and f3r['p'] == {'rocks': 40, 'landings': 50, 'ship': 'teapot', 'ships': ['classic', 'teapot']}
      and f3r['others'] == {'year2': {'edition': 'stand-in', 'at': 'dust-2', 'open': 'dust-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}}},
      f"the same entry with the lower track asked for: a new map there, the rocks and ships kept, the stand-in map put by: {f3r}")
pk = tk['packed']
check(pk == {'track': 'year2', 'edition': 'stand-in', 'at': 'dust-2', 'open': 'dust-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}, 'rocks': 40, 'landings': 50,
             'ship': 'teapot', 'ships': ['classic', 'teapot'], 'maps': {}}, f"format 4 kept: the track, its edition and map at the top, as format 3 had it; no other maps yet: {pk}")
sw = tk['switched']
check(sw == {'track': 'reception', 'edition': lo['edition'], 'rocks': 40, 'landings': 50, 'ship': 'teapot', 'ships': ['classic', 'teapot'],
             'maps': {'year2': {'edition': 'stand-in', 'at': 'dust-2', 'open': 'dust-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}}}},
      f"switching to the lower track: its map starts afresh, rocks and ships stay, the higher's map is put by: {sw}")
bk = tk['back']
check(bk['track'] == 'year2' and bk['at'] == 'dust-2' and bk['open'] == 'dust-3' and bk['rocks'] == 44
      and bk['maps'] == {'reception': {'edition': lo['edition'], 'at': 'moon-3', 'open': 'moon-4', 'levels': {'moon-1': {'stars': 2, 'rocks': 1}}}},
      f"and back: the higher map as it was left, the rocks earned meanwhile kept (44), the lower map put by: {bk}")
check(tk['again'] == {**sw, 'at': 'moon-3', 'open': 'moon-4', 'levels': {'moon-1': {'stars': 2, 'rocks': 1}}, 'rocks': 44},
      'switching there and back again gives the same progress: nothing lost or doubled')
st = tk['stale']
check(st['track'] == 'reception' and st['p'] == {'rocks': 9} and st['others'] == {},
      f"a map kept from an older edition of the track's map starts afresh; the rocks stay: {st}")
check(all(j == {'track': 'reception', 'p': {}, 'others': {}} for j in tk['junk']), f"junk kept (null, a number, a word, a list, odd fields): a new device: {tk['junk']}")
check(tk['noStandIn'] == {'track': 'reception', 'p': {'rocks': 40, 'landings': 50, 'ship': 'teapot', 'ships': ['classic', 'teapot']}, 'others': {}},
      f"a format 3 entry when no track is the stand-in any more: only its rocks, landings and ships are kept: {tk['noStandIn']}")
check(tk['given'] == ['reception', 'year2', None, None, None, None], f"only the game's own tracks are taken as given ('constructor' isn't one): {tk['given']}")

# ---------- Reception's questions (asks.js, level plan section 5) ----------
ak = o['asks']
check(ak['ASKS'] == ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share'], f"seven kinds of question: {ak['ASKS']}")
# dots 1 to 10: 10; a quick look 1 to 5, three ways each: 15; more than 1 to 9: 9; fewer than 1 to 10: 10; the same as 1 to 10: 10;
# one more than 0 to 9: 10; one less than 1 to 10: 10; make 5 from 1 to 4: 4; make 10 from 1 to 9: 9; double 1 to 5: 5; 2 to 10 shared by 2: 5
check(ak['counts'] == {'dots': 10, 'flash': 15, 'more': 9, 'fewer': 10, 'same': 10, 'oneMore': 10, 'oneLess': 10, 'bond5': 4, 'bond10': 9, 'double': 5, 'share': 5},
      f"what each can ask (worked out by hand): {ak['counts']}")
want_rng = [['dots', 1, 10, 0, 10], ['flash', 1, 5, 0, 5], ['compare', 1, 10, 0, 10], ['more-less', 0, 10, 0, 10],
            ['bond', 1, 4, 0, 5], ['double', 2, 10, 0, 10], ['bond', 1, 9, 0, 10], ['share', 1, 5, 0, 5]]
check(ak['ranges'] == want_rng, f"every answer is on its level's line: dots 1 to 10; a quick look 1 to 5; one more or less 0 to 10; make 5: 1 to 4; doubles 2 to 10; shares 1 to 5: {ak['ranges']}")
check(ak['rangeFits'], 'every "more than" and "fewer than" has a number on the line that fits')
# 2:2:1 of 8 is 3.2, 3.2, 1.6: floors 3 + 3 + 1 = 7, the one left to the biggest remainder (.6, same): 3, 3, 2.
# Of 5: 2, 2, 1 exactly. Of 3: 1.2, 1.2, .6: floors 1 + 1 + 0, one left to .6: 1, 1, 1.
check(ak['shares'] == [{'more': 3, 'fewer': 3, 'same': 2}, {'more': 2, 'fewer': 2, 'same': 1}, {'more': 1, 'fewer': 1, 'same': 1}, {}],
      f"a round's shares of more, fewer and the same (2, 2, 1), by largest remainder: {ak['shares']}")
pc = ak['planCompare']
check(len(pc) == 8 and pc.count('more') == 3 and pc.count('fewer') == 3 and pc.count('same') == 2, f"a compare round of 8: 3 more, 3 fewer, 2 the same, shuffled: {pc}")
pm = ak['planMoreLess']
check(all(len(x) == k and all(x[i] != x[i + 1] for i in range(k - 1)) and set(x) == {'more', 'less'} for x, k in zip(pm, [8, 5])),
      f"one more and one less take turns: {pm}")
check(ak['planDots'] == [None] * 4, 'other questions have one kind of landing')
check(all(same == 0 and bad == 0 and seen == total for _, same, bad, seen, total in ak['repeats']),
      f"300 questions each (seeded): never the same twice running, always the landing's kind, every question asked at some point (a quick look's three layouts count as one question): {ak['repeats']}")
check(ak['right'] == [[True, False, False, True, False], [True, True, False, False, False], [True, False], [True, False]],
      f"right or wrong: more than 3: 4 and 10 yes, 3, 3.5 and 0 no; fewer than 3: 2 and 0 yes, 3, 2.5 and 9 no; the same as 3: 3; an answer of 7: 7: {ak['right']}")
check(ak['near'], 'a long line\'s leeway counts for an answer, as Number mode does')
check(ak['goal'] == [4, 9, 3, 4, 0, 6],
      f"after a miss: more than 3 from 1.2: 4; from 8.6: 9; fewer than 4 from 7.2: 3; more than 2 from 4.5: 4 (4 and 5 tie, the lower); fewer than 1: 0; an answer: itself: {ak['goal']}")
ch = ak['challenge']
check(all(len(x) == 8 and sorted(set(x)) == list(range(7)) and len(x) - len(set(x)) == 1 for x in ch[:2]) and ch[0] != ch[1],
      f"a challenge round of 8 from 7 levels: each level once and one more, shuffled: {ch[:2]}")
check(len(ch[2]) == 3 and len(set(ch[2])) == 3 and len(ch[3]) == 20 and min(ch[3].count(i) for i in range(7)) == 2,
      f"with 3 landings, three different levels; with 20, every level at least twice: {ch[2]}, {ch[3]}")

# ---------- Their faces (faces.js): the dots drawn ----------
fc = o['faces']
check(fc['dots'] == [[1, 1], [5, 1], [6, 1], [10, 1]], f"dots to count: 1, 5, 6 and 10 dots, 6 and 10 in two rows of 5 (a ten frame's order): {fc['dots']}")
check(fc['flash'] == [[1, 3, 5]] * 3 and fc['flashMs'], f"a quick look shows its dots every way (dice, row, scatter) and hides them after 1500 ms: {fc['flash']}")
check(fc['compare'] == [[4, 'more than'], [4, 'fewer than'], [4, 'the same as']], f"more, fewer or the same as 4 dots: {fc['compare']}")
check(fc['moreLess'] == [['1 more than', True, 0], ['1 less than', True, 0]], f"one more or less than 6, in words and the number: {fc['moreLess']}")
check(fc['bond'] == [[3, 2, 5], [6, 4, 10], [1, 9, 10]], f"make 5 from 3: 3 dots and 2 empty places in a frame of 5; make 10 from 6 and from 1: {fc['bond']}")
check(fc['double'] == [2, 6, 10], f"double 1, 3 and 5: the dots twice over: {fc['double']}")
check(fc['share'] == [[6, 2], [10, 2]], f"6 and 10 sweets shared by 2 plates: {fc['share']}")
check(fc['sums'] == [[5, 0, 'face face-sum'], [3, 2, 'face face-sum'], [4, 0, 'face face-sum']],
      f"pictured sums (Q-033): 2 + 3 shows 2 and 3 dots; 5 − 2 shows five, the last two crossed out; 0 + 4 shows none and 4: {fc['sums']}")

# ---------- Taking away from 1 (sums.js 1.2) and kept targets (rules.js 1.1) ----------
mf, mpl = o['minusFrom'], o['minusPlain']
# from 1 to 5, each b from 0 to a: 2 + 3 + 4 + 5 + 6 = 20 sums; from 0, one more (0 − 0): 21
check(mf['n'] == 20 and mf['minA'] == 1 and mf['maxA'] == 5 and mf['minAns'] == 0 and mpl['n'] == 21 and mpl['minA'] == 0,
      f"taking away within 5, from 1 to 5 (R10): 20 sums, the smallest from 1; without it, 21 from 0: {mf}, {mpl['n']}")
pk2 = o['pick']
check(pk2['min'] == 11 and pk2['max'] == 20 and pk2['kinds'] == 10 and 10 <= pk2['none'] <= 20,
      f"on a line of 10 to 20, targets kept to 11 to 20 (R07): 300 draws give 11 to 20, all 10 of them; a range off the line keeps the whole line: {pk2}")

# ---------- The progress on the map (progress.js, D-058, D-064): format 3's rules ----------
pr = o['progress']
check(pr['ROCKS'] == 8 and pr['PASS'] == 2, f"8 moon rocks to find on each level; 2 stars open the next (D-064): {pr['ROCKS']}, {pr['PASS']}")
ids = [r['id'] for r in pr['route']]
check(ids == [f'moon-{n}' for n in range(1, 9)] + [f'dust-{n}' for n in range(1, 9)], f'the route: Moon 1 to 8, then Red Dust 1 to 8; the coming-soon systems have none: {ids}')
check([r['s'] for r in pr['route']] == [0] * 8 + [1] * 8 and [r['id'] for r in pr['route'] if r['last']] == ['moon-8', 'dust-8'],
      'each level knows its system, and level 8 ends each system')
check(pr['fresh'] == {'at': 'moon-1', 'open': 'moon-1', 'levels': {}, 'rocks': 0, 'landings': 0}, f"a new player: the rocket on Moon 1, nothing else open: {pr['fresh']}")
check(all(t == pr['fresh'] for t in pr['tidyJunk']), f"junk instead of progress (null, a list, a word, a number) starts afresh: {pr['tidyJunk']}")
tl = pr['tidyLevels']
check(tl['levels'] == {'moon-1': {'stars': 3, 'rocks': 8}, 'moon-2': {'stars': 3, 'rocks': 0}},
      f"tidied levels: 5 stars kept to 3 and 12 rocks to 8, 2.6 stars rounded to 3 and −3 rocks to 0; 0 stars, an unknown level and a word dropped: {tl['levels']}")
check(tl['rocks'] == 12 and tl['landings'] == 0 and tl['open'] == 'moon-3', f"rocks '12.4' read as 12, −5 landings as 0; the passed levels open the next: {tl}")
check(pr['tidyPlaces'] == [['moon-1', 'moon-1'], ['dust-3', 'dust-3'], ['moon-1', 'dust-1'], ['dust-8', 'dust-8'], ['moon-1', 'moon-1']],
      f"tidied places: unknown ids go to Moon 1; the open end never before the rocket; Moon 8 passed opens Red Dust 1; Red Dust 8 has nothing after; 1 star opens nothing: {pr['tidyPlaces']}")
check(pr['open'] == [True, True, False, False, False], f"open up to the open end only: {pr['open']}")
check(pr['best'] == [3, 0, 5, 0], f"best stars and rocks found: a level played and one not: {pr['best']}")
check(pr['left'] == [True, True, False, True, False, False], f"a rock is left while the level's found plus the round's are under 8: 5+0, 5+2 yes; 5+3 no; 0+7 yes, 0+8 no; all 8 found no: {pr['left']}")
f1 = pr['firstPass']
check(f1['now'] == {'stars': 3, 'rocks': 5} and f1['first'] and f1['passed'] and not f1['newBest'] and f1['rocks'] == 5,
      f"a first round of 3 stars with 5 perfect landings: best 3, 5 rocks found and paid, not called a new best: {f1}")
check(f1['opened'] == 'moon-2' and f1['next'] == 'moon-2' and not f1['hyper'] and not f1['done'] and f1['untouched'],
      'it opens Moon 2 and the rocket goes there (D-064); the progress handed in is left as it was')
check(f1['progress']['rocks'] == 5 and f1['progress']['landings'] == 7 and f1['progress']['open'] == 'moon-2' and f1['progress']['at'] == 'moon-2',
      f"the new progress: 0 + 5 rocks, 0 + 7 landings, open to Moon 2, the rocket at Moon 2: {f1['progress']}")
f2 = pr['firstFail']
check(not f2['passed'] and f2['opened'] is None and f2['next'] == 'moon-1' and f2['progress']['open'] == 'moon-1' and f2['now'] == {'stars': 1, 'rocks': 1},
      f"1 star opens nothing, and the rocket waits on the same level to try again: {f2['progress']['at']}, open {f2['progress']['open']}")
f3 = pr['replayCap']
check(f3['now'] == {'stars': 3, 'rocks': 8} and f3['rocks'] == 3 and f3['progress']['rocks'] == 8 and not f3['newBest'] and f3['opened'] is None,
      f"a replay pays only what's missing: 2 stars keep the best 3; 4 perfect landings with 5 found already pay 3, up to 8 (5 + 3 = 8): {f3['now']}, paid {f3['rocks']}")
check(f3['next'] == 'moon-2' and f3['progress']['open'] == 'moon-2', f"a replay passed: the rocket goes on to the next level, already open: {f3['next']}")
f4 = pr['replayBest']
check(f4['newBest'] and f4['now'] == {'stars': 3, 'rocks': 5} and f4['rocks'] == 2, f"a replay that beats the best is a new best: 2 to 3 stars; 3 + 2 = 5 rocks: {f4['now']}")
f5 = pr['replayWorse']
check(f5['now'] == {'stars': 3, 'rocks': 5} and f5['rocks'] == 0 and f5['next'] == 'moon-1' and f5['progress']['open'] == 'moon-2',
      f"a worse replay takes nothing away, and nothing closes: {f5['now']}, open {f5['progress']['open']}")
f6 = pr['allFound']
check(f6['rocks'] == 0 and f6['now']['rocks'] == 8 and f6['progress']['rocks'] == 5,
      f"all 8 found already: no more rocks, whatever the round says: paid {f6['rocks']}")
f7 = pr['moon8']
check(f7['passed'] and f7['done'] and f7['hyper'] and f7['opened'] == 'dust-1' and f7['next'] == 'dust-1' and not f7['soon'],
      f"Moon 8 passed: Moon is done, Red Dust 1 opens and the rocket goes there through hyperspace: {f7}")
f8 = pr['moon8fail']
check(not f8['done'] and not f8['hyper'] and f8['next'] == 'moon-8' and f8['progress']['open'] == 'moon-8', 'Moon 8 with 1 star: no hyperspace; try again')
f9 = pr['moon8again']
check(f9['done'] and f9['hyper'] and f9['opened'] is None and f9['next'] == 'dust-1' and f9['newBest'] and f9['progress']['open'] == 'dust-4',
      f"Moon 8 passed again later: hyperspace again to Red Dust 1, nothing new opened, the open end kept: {f9['next']}, open {f9['progress']['open']}")
f10 = pr['dust8']
check(f10['done'] and f10['soon'] and not f10['hyper'] and f10['next'] == 'dust-8' and f10['opened'] is None,
      f"Red Dust 8 passed: Red Dust is done, but the next systems are coming soon, so the rocket stays: {f10}")
check(pr['unknown'] is None, 'a level the map does not have changes nothing (null)')
check(pr['oddStars'] == [3, 1, False], f"stars outside 1 to 3 are kept to them: {pr['oddStars']}")
check(pr['stars'] == [{'got': 8, 'of': 24}, {'got': 0, 'of': 24}, {'got': 0, 'of': 0}],
      f"a system's stars: 3 + 2 + 3 = 8 of 24 on Moon; none yet on Red Dust; Candy has no levels yet: {pr['stars']}")
check(pr['reached'] == [True, False, True, False], f"reached: Moon at once; Red Dust once its level 1 opens; Candy, coming soon, never: {pr['reached']}")
check(pr['placeIn'] == ['moon-1', None, 'dust-3', 'moon-4', 'moon-6', 'moon-1', None],
      f"flying to a system: the open end if it's there; otherwise its first level with stars or rocks to win, else level 1; nowhere if not reached: {pr['placeIn']}")
gt = pr['goTo']
check(gt[0] == ['dust-3', 'dust-3'] and gt[1] == ['moon-2', 'dust-3'] and gt[2] and gt[3],
      f"goTo: the rocket goes to a picked level and the map opens up to it; going back keeps the open end; an unknown level changes nothing: {gt}")
gv = pr['given']
check([g['id'] for g in gv] == ['moon-1', 'dust-1', 'dust-8', None, 'dust-2', None, None, None, None, None, None]
      and all(g['note'] for g in gv[3:4] + gv[5:8]) and not any(g['note'] for g in gv[:3] + gv[4:5] + gv[8:]),
      f"a level given as a number along the map (1 to 16) or an id; anything else is noted and the map's place is played: {gv}")

# ---------- Boundaries ----------
def code_only(text):
    """The file without its comments and string contents, so words in them don't count."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    text = re.sub(r'(?m)//.*$', '', text)
    return re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`", "''", text)


IMPURE = re.compile(r'\b(import|document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|'
                    r'performance|Date|eval|Function|setTimeout|setInterval|requestAnimationFrame|navigator|location)\b|Math\.random')
for folder, f in CORE:
    hits = sorted({m.group(0) for m in IMPURE.finditer(code_only(open(os.path.join(folder, f), encoding='utf-8').read()))})
    check(not hits, f'{f} is pure' + (f': {hits}' if hits else ''))


def code_strict(text):
    """The code without its comments, strings kept, as test_rocket_sums_core.py 1.2 read the sums files."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return re.sub(r'(?m)(^|[^:])//.*$', r'\1', text)


for folder, f in STRICT:
    hits = sorted({m.group(0) for m in IMPURE.finditer(code_strict(open(os.path.join(folder, f), encoding='utf-8').read()))})
    check(not hits, f'{f} is pure, strings included' + (f': {hits}' if hits else ''))

KEEPS = r'''|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|EventSource'''
# D-036: a game may import from games/_common/ and nothing else outside its folder;
# a shared folder in games/_common/ may import nothing from outside itself.
OUTSIDE = {
    GAME: re.compile(r'''from\s+['"]\.\./(?!_common/[\w-]+/[\w-]+\.js['"])|from\s+['"]\.\./_common/[^'"]*\.\./|import\(\s*['"]\.\./''' + KEEPS),
    COMMON: re.compile(r'''from\s+['"]\.\./|import\(\s*['"]\.\./''' + KEEPS),
}
# D-042: kit.js alone may keep a tile's progress on the device, in localStorage and nothing else.
SAVER = os.path.join(COMMON, 'kit.js')
for folder, rx in OUTSIDE.items():
    where = os.path.relpath(folder, REPO)
    for f in sorted(os.listdir(folder)):
        if not f.endswith('.js'):
            continue
        raw = open(os.path.join(folder, f), encoding='utf-8').read()
        body = re.sub(r'(?m)^\s*//.*$', '', raw)
        hits = sorted({m.group(0) for m in rx.finditer(body)})
        if os.path.join(folder, f) == SAVER:
            check(hits == ['localStorage'], f'{where}/{f} stays in bounds and keeps only localStorage (D-042): {hits}')
        else:
            check(not hits, f'{where}/{f} stays in bounds and keeps nothing on the device' + (f': {hits}' if hits else ''))
saver = open(SAVER, encoding='utf-8').read()
check(len(re.findall(r'localStorage\.(?:getItem|setItem)\(', saver)) == 2 and 'try' in saver,
      'kit.js reads and writes one entry, inside try (D-042)')
html = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
urls = sorted(set(re.findall(r'(?:src|href)="([^"]+)"', html)))
far = [u for u in urls if re.match(r'(https?:)?//', u)]
up = [u for u in urls if u.startswith('../') and not re.match(r'\.\./_common/[\w-]+/[\w.-]+$', u)]
check(not far and not up, f'index.html loads only its own files and games/_common/, nothing from outside (D-043): {urls}')
check('../_common/fonts/fredoka.css' in urls, 'index.html links the shipped font (D-043)')

# D-043: the font files as shipped: Fredoka latin 500, 600, 700 from @fontsource/fredoka 5.3.0, with the OFL.
FONTS = os.path.join(REPO, 'games', '_common', 'fonts')
SIZES = {'fredoka-latin-500-normal.woff2': 16248, 'fredoka-latin-600-normal.woff2': 16468, 'fredoka-latin-700-normal.woff2': 15900}
for name, size in SIZES.items():
    path = os.path.join(FONTS, name)
    ok = os.path.exists(path) and os.path.getsize(path) == size and open(path, 'rb').read(4) == b'wOF2'
    check(ok, f'games/_common/fonts/{name}: a woff2 file of {size} bytes')
lic = os.path.join(FONTS, 'OFL.txt')
check(os.path.exists(lic) and 'SIL Open Font License, Version 1.1' in open(lic, encoding='utf-8').read(), 'the OFL 1.1 licence is beside the fonts')
css = open(os.path.join(FONTS, 'fredoka.css'), encoding='utf-8').read() if os.path.exists(os.path.join(FONTS, 'fredoka.css')) else ''
css_urls = re.findall(r"url\(([^)]*)\)", css)
check(sorted(css_urls) == sorted(SIZES) and 'http' not in css,
      f'fredoka.css points at the three files beside it and nothing else: {css_urls}')

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
