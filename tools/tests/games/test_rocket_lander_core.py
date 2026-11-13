"""Rocket Lander's pure core and its boundaries. Version 1.10.

Changes at v1.10 (stage 3, D-120): the engine's link.js may import P-020's shared/bridge.js, exactly that
and only there, as contract 0.4 GC4 allows; a check that it does. Everything else is as before.

Changes at v1.9 (step 2c-3c): Year 1 on the lower track and Year 3 on the higher, so all six systems of
both tracks hold 7 levels and a challenge, their ids the level plan's and their rows' numbers the notes'
params, with no system coming soon (no new edition: only systems that were coming soon filled). Year 1's
and Year 3's questions (asks.js 1.2): find a number, a count in ones or in steps (on a stretch in a fifth
of the step for 10s, 50s and 100s), one more or less and 10 or 100 more or less, groups of 2, 5 and 10 on
their own lines, sharing between 2, 5 or 10, doubles and halves by turns, hundreds, tens and ones,
fractions of amounts (the denominator picked first), counting in tenths, and which of two unit fractions
is bigger (both marked on their own line); numbers to 100 in halves (D-094). Their sums (sums.js 1.4):
adding and taking away to 20 crossing 10 or not, bonds to 10 and 20, missing numbers with the answer
hidden too and written both ways round, HTO + and − ones, tens and hundreds in halves (D-094), pairs to
100 in fives, big 2-digit sums, estimates to the nearest 10 or 100, the 3, 4 and 8 tables, mixed tables
in 6 s, TO × O, TO ÷ O and fraction sums; each counted against a Python enumeration of the notes' words,
with the lines each lands on. Their faces (faces.js 1.2), and lines counted in parts written as counted
(numbers.js 1.2: tenths stay tenths). Rob's two answers in the step: Year 3's 3-digit numbers and tenths
on stretches of 7 marks (D-103), and numbers to 100 in halves of 51 to 100, then 0 to 100 (D-104).

Changes at v1.8 (step 2c-3b, D-100): Year 2 on the higher track. The higher track's map is Year 2's
three systems, a new edition (so a map kept on the stand-in levels starts afresh there; a format 3
entry, with no stand-in track left, keeps only its rocks, landings and ships), each 7 levels and a
challenge, its ids the level plan's and its rows' numbers the notes' params. The progress and tracks
checks keep the stand-in map they were written on as a fixture here (STAND_IN_IDS), so they stay as
strict as before. Year 2's questions (asks.js 1.1): tens and ones, number words, <, > and = on a
number, counting in steps, odd or even to 100, fractions of shapes and of numbers: what each can ask,
by an enumeration in Python of the notes' words, and the stretch of the line each landing is shown
(10 marks with the answer in it, inside the level's numbers). Their faces (faces.js 1.1). Year 2's
sums (sums.js 1.3): the forms (TO + O, TO + T, TO − O, TO − T, O + O + O, TO + TO with and without
carrying, TO − TO with and without exchanging, missing numbers, tens bonds, tables to × 12 and
dividing), each counted against a Python enumeration; their lines (tables in their own steps, tens
bonds in tens). Fractions written and said (numbers.js), and a level's own fall time (settings.js 1.2).

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
from math import gcd

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
  if (r.forms) { // Year 2's forms (sums.js 1.3): the sample is one of the level's facts, its text and answer both
    if (sm.rule !== 'sum') return 'not a sum';
    return M.partsOf(r).some((p) => r.ops.some((op) => M.facts(op, p).some((f) => M.sumText(f) === sm.sum && f.answer === sm.value))) ? 'ok' : 'a sum the level never asks';
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
// The progress on the map (progress.js, D-058, D-064), on the stand-in map with the game's level ids.
// Since step 2c-3b the game's higher track is Year 2's, so the stand-in map these checks were written
// on (map.js 1.0: the Moon's 8 and Red Dust's 8, the rest coming soon) is kept here as a fixture.
const STAND_IN_IDS = ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'].map((id, s) => ({ id, soon: s > 1,
  levels: s > 1 ? [] : Array.from({ length: 8 }, (_, n) => ({ id: `${id}-${n + 1}` })) }));
const PG = await import(c + '/progress.js');
const MAPX = STAND_IN_IDS;
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
// Tracks (tracks.js, D-089): the two maps' ids, as the game builds them. The checks below were written
// when the higher track was the stand-in map, so TR keeps it so (the fixture above); TRR is the game's own.
const TK = await import(c + '/tracks.js');
const idsOf = (t) => MP.TRACKS[t].systems.map((sys) => ({ id: sys.id, soon: !!sys.soon, levels: sys.levels.map((l, n) => ({ id: `${sys.id}-${n + 1}` })) }));
const TR = { reception: { map: idsOf('reception'), edition: MP.TRACKS.reception.edition }, year2: { map: STAND_IN_IDS, edition: TK.STAND_IN } };
const TRR = Object.fromEntries(Object.keys(MP.TRACKS).map((t) => [t, { map: idsOf(t), edition: MP.TRACKS[t].edition }]));
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
// ---------- Step 2c-3b: Year 2 on the higher track (v1.8) ----------
// The game's own tracks: a kept entry from before Year 2 replaced the stand-ins
const F4S = { track: 'year2', edition: 'stand-in', at: 'dust-2', open: 'dust-3', levels: { 'moon-1': { stars: 3, rocks: 8 } }, rocks: 40, landings: 50, ship: 'teapot', ships: ['classic', 'teapot'], maps: {} };
const F4R = { track: 'reception', edition: MP.TRACKS.reception.edition, at: 'moon-3', open: 'moon-4', levels: {}, rocks: 7,
  maps: { year2: { edition: 'stand-in', at: 'dust-2', open: 'dust-3', levels: { 'moon-1': { stars: 3, rocks: 8 } } } } };
out.realTracks = { f3: TK.unpack(TRR, F3, null, 'reception'), standIn4: TK.unpack(TRR, F4S, null, 'reception'), putBy: TK.unpack(TRR, F4R, 'year2', 'reception') };
// Year 2's rows (map.js 2.1)
const Y2 = MP.TRACKS.year2.systems;
const yRow = (s, n) => Y2[s].levels[n - 1].row;
const valuesOf = (list) => list.filter((T) => T.value !== undefined).map((T) => T.value);
const span = (list) => (list.length ? [Math.min(...list), Math.max(...list)] : null);
// 300 landings (seeded) of a windowed level: each landing's question and the stretch of line it is shown
const windowed = (row, seed) => { const rand = seeded(seed), plan = AK.planAsks(row, 300, rand); let prev = null; const out2 = [];
  for (const k of plan) { const T = AK.askTarget(row, k, prev, rand); const w = AK.windowFor(row, T, rand); out2.push({ T, w }); prev = T; } return out2; };
const winSum = (row, seed) => { const ws = windowed(row, seed); return {
  n: ws.length, spans: [...new Set(ws.map(({ w }) => w.to - w.from))], steps: [...new Set(ws.map(({ w }) => w.step))],
  lo: Math.min(...ws.map(({ w }) => w.from)), hi: Math.max(...ws.map(({ w }) => w.to)), starts: new Set(ws.map(({ w }) => w.from)).size,
  holds: ws.every(({ T, w }) => (T.value !== undefined ? T.value >= w.from && T.value <= w.to : true)),
  // a <, > or = question: its number on the line with at least 3 marks each side, so either side can be wrong
  sides: ws.filter(({ T }) => T.ask === 'sign' && T.rule === 'range').every(({ T, w }) => T.n - w.from >= 3 && w.to - T.n >= 3),
  fits: ws.filter(({ T }) => T.rule === 'range').every(({ T, w }) => { for (let v = w.from; v <= w.to; v++) if (AK.relHolds(T.rel, v, T.n)) return true; return false; }),
  twice: ws.some(({ T }, i) => i > 0 && AK.keyOf(T) === AK.keyOf(ws[i - 1].T) && T.ask !== 'parity'),
  kinds: ws.reduce((a, { T }) => ({ ...a, [T.rel ?? T.dir ?? (T.step !== undefined ? 's' + T.step : '-')]: (a[T.rel ?? T.dir ?? (T.step !== undefined ? 's' + T.step : '-')] || 0) + 1 }), {}) }; };
const seqOk = (T) => { const s = T.dir === 'forward' ? T.step : -T.step, t = [...T.terms, T.value]; return t.every((v, i) => i === 0 || v - t[i - 1] === s); };
out.y2 = {
  fracText: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [1, 3], [2, 3], [3, 3], [6, 4], [5, 10], [13, 10], [0, 3], [8, 4]].map(([v, d]) => N.fracText(v, d)),
  fracSay: [[1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [3, 4], [1, 10], [3, 10], [2, 7], [5, 12]].map(([a, b]) => N.fracSay(a, b)),
  fall: [S.fallSecondsFor(3, true, 6), S.fallSecondsFor(1, false, 6), S.fallSecondsFor(3, true, null), S.fallSecondsFor(3, true, 0), S.fallSecondsFor(5, false, undefined)],
  ASKS: AK.ASKS,
  choices: {
    place: AK.choices(yRow(0, 1)).map((T) => [T.n, T.value, T.rule]),
    words: AK.choices(yRow(0, 2)).map((T) => [T.n, T.value]),
    sign: ['more', 'fewer', 'same'].map((k) => AK.choices(yRow(0, 3), k).map((T) => [T.rule, T.rel, T.n, T.value ?? null])),
    seq3: ['forward', 'backward'].map((k) => AK.choices(yRow(0, 4), k).map((T) => [T.step, T.dir, T.terms, T.value])),
    seq10: ['forward', 'backward'].map((k) => AK.choices(yRow(0, 5), k).map((T) => [T.step, T.dir, T.terms, T.value])),
    parity: AK.choices(yRow(2, 5)).map((T) => [T.rule, T.rel]),
    shape: AK.choices(yRow(2, 6)).map((T) => [T.num, T.den, T.look, T.parts, T.value]),
    fracOf: AK.choices(yRow(2, 7)).map((T) => [T.num, T.den, T.total, T.value]),
  },
  seqAllOk: [yRow(0, 4), yRow(0, 5)].every((r) => AK.choices(r).every(seqOk)),
  windows: { place: winSum(yRow(0, 1), 21), words: winSum(yRow(0, 2), 22), sign: winSum(yRow(0, 3), 23), seq3: winSum(yRow(0, 4), 24),
    seq10: winSum(yRow(0, 5), 25), parity: winSum(yRow(2, 5), 26), fracOf: winSum(yRow(2, 7), 27) },
  shapeLines: [2, 4, 3].map((den) => { const T = AK.choices(yRow(2, 6)).find((x) => x.den === den); return AK.shapeLine(T); }),
  planSign: AK.planAsks(yRow(0, 3), 8, seeded(5)),
  planSeq: AK.planAsks(yRow(0, 4), 8, seeded(6)),
  planParity: [AK.planAsks(yRow(2, 5), 8, seeded(7)), AK.planAsks(yRow(2, 5), 8, seeded(8))],
  // 600 landings of counting in steps and of fractions: how often each step or fraction comes up
  stepShares: (() => { const r = yRow(0, 4), rand = seeded(31), plan = AK.planAsks(r, 600, rand); let prev = null; const n = {};
    for (const k of plan) { const T = AK.askTarget(r, k, prev, rand); n[T.step] = (n[T.step] || 0) + 1; prev = T; } return n; })(),
  fracShares: (() => { const r = yRow(2, 6), rand = seeded(32); let prev = null; const n = {};
    for (let i = 0; i < 600; i++) { const T = AK.askTarget(r, null, prev, rand); n[`${T.num}/${T.den}`] = (n[`${T.num}/${T.den}`] || 0) + 1; prev = T; } return n; })(),
  right: [
    [{ rule: 'range', ask: 'sign', rel: 'more', n: 47 }, [48, 47, 46, 57, 47.5]], [{ rule: 'range', ask: 'sign', rel: 'fewer', n: 47 }, [46, 47, 48, 37]],
    [{ rule: 'ask', ask: 'sign', rel: 'same', n: 47, value: 47 }, [47, 48]], [{ rule: 'range', ask: 'parity', rel: 'even' }, [48, 47, 0, 100, 48.5]],
    [{ rule: 'range', ask: 'parity', rel: 'odd' }, [47, 48, 1, 99]],
  ].map(([T, spots]) => spots.map((v) => AK.isRight(T, v))),
  goal: (() => { const ln = N.makeLine({ from: 40, to: 50, step: 1 }); return [
    AK.goalOf({ rule: 'range', ask: 'sign', rel: 'more', n: 44 }, 41.2, ln), AK.goalOf({ rule: 'range', ask: 'sign', rel: 'fewer', n: 44 }, 49, ln),
    AK.goalOf({ rule: 'range', ask: 'parity', rel: 'even' }, 46.6, ln), AK.goalOf({ rule: 'range', ask: 'parity', rel: 'odd' }, 46.2, ln)]; })(),
};
// Year 2's faces (faces.js 1.1)
const has = (html, cls) => (html.match(new RegExp(`class="${cls}"`, 'g')) || []).length;
const txt = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
out.y2faces = {
  place: [34, 70, 19, 99].map((k) => { const c2 = FC.faceChip({ ask: 'place', n: k, value: k }); return [has(c2.html, 'pv-ten'), has(c2.html, 'pv-one'), c2.cls]; }),
  words: [47, 100, 13, 60, 1].map((k) => { const c2 = FC.faceChip({ ask: 'words', n: k, value: k }); return [txt(c2.html), c2.cls]; }),
  sign: [['more', '&lt;'], ['fewer', '&gt;'], ['same', '=']].map(([rel, sym]) => { const h = FC.faceChip({ ask: 'sign', rel, n: 47 }).html; return [h.includes(sym), txt(h)]; }),
  seq: [{ step: 2, dir: 'forward', terms: [6, 8, 10] }, { step: 10, dir: 'backward', terms: [83, 73, 63] }].map((T) => txt(FC.faceChip({ ask: 'seq', ...T }).html)),
  shape: [[1, 4, 0], [3, 4, 1], [1, 3, 0], [2, 4, 0], [1, 2, 1]].map(([num, den, look]) => { const h = FC.faceChip({ ask: 'frac-shape', num, den, look }).html; return [has(h, 'fs-on'), has(h, 'fs-on') + has(h, 'fs-off')]; }),
  fracOf: [[3, 4, 12], [1, 2, 24], [1, 3, 9]].map(([num, den, total]) => { const h = FC.faceChip({ ask: 'frac-of', num, den, total }).html; return [has(h, 'd-on'), has(h, 'fo-group'), txt(h)]; }),
  fracHtml: txt(FC.fracHtml(3, 4)),
};
// Year 2's sums (sums.js 1.3): every fact of each form, as [a, op, b, op2, c, missing, result, answer]
const flat = (f) => [f.a, f.op, f.b, f.op2 ?? null, f.c ?? null, f.missing ?? null, f.result ?? null, f.answer];
const factsOf = (r) => r.ops.flatMap((op) => M.partsOf(r).flatMap((p) => M.facts(op, p).map(flat)));
const partFacts = (r) => M.partsOf(r).map((p) => r.ops.flatMap((op) => M.facts(op, p).map(flat)));
out.y2sums = {
  FORMS: M.FORMS,
  facts20: factsOf(yRow(0, 6)), bond: factsOf(yRow(0, 7)),
  toO: factsOf(yRow(1, 1)), toT: factsOf(yRow(1, 2)), takeOT: factsOf(yRow(1, 3)), three: factsOf(yRow(1, 4)),
  toTO: partFacts(yRow(1, 5)), takeTO: partFacts(yRow(1, 6)), missing: factsOf(yRow(1, 7)),
  t10: factsOf(yRow(2, 1)), t2: factsOf(yRow(2, 2)), t5: factsOf(yRow(2, 3)), div: factsOf(yRow(2, 4)),
  texts: [{ a: 34, op: '+', b: 5 }, { a: 4, op: '+', b: 7, op2: '+', c: 6 }, { a: 35, op: '+', b: 25, result: 60, missing: 'a' }, { a: 30, op: '+', b: 70, result: 100, missing: 'b' }].map((f) => M.sumText(f)),
  lines: [
    M.lineForSum({ answer: 70 }, ['×'], yRow(2, 1), seeded(1)), M.lineForSum({ answer: 14 }, ['×'], yRow(2, 2), seeded(1)),
    M.lineForSum({ answer: 35 }, ['×'], yRow(2, 3), seeded(1)), M.lineForSum({ answer: 7 }, ['÷'], yRow(2, 4), seeded(1)),
    M.lineForSum({ answer: 70 }, ['+'], yRow(0, 7), seeded(1)),
  ],
  roundLines: [yRow(2, 1), yRow(2, 4), yRow(0, 7)].map((r) => M.roundLine(r)),
  stretch: [[yRow(0, 6), 41], [yRow(1, 1), 42], [yRow(1, 4), 43], [yRow(1, 7), 44]].map(([r, seed]) => { const rand = seeded(seed); let prev = null, ok = true; const starts = new Set();
    for (let i = 0; i < 200; i++) { const p = M.partsOf(r)[0], s = M.makeSum(r.ops, p, prev, rand); const w = M.lineForSum(s, r.ops, p, rand);
      if (!(w.to - w.from === 10 && w.step === 1 && s.answer >= w.from && s.answer <= w.to && w.from >= 0)) ok = false; starts.add(w.from); prev = s; } return [ok, starts.size]; }),
  // the missing numbers' 600 draws, by the form the sum came from: each of the six about as often
  missingShares: (() => { const r = yRow(1, 7), rand = seeded(51); let prev = null; const n = {};
    for (let i = 0; i < 600; i++) { const s = M.makeSum(r.ops, r, prev, rand); n[s.group] = (n[s.group] || 0) + 1; prev = s; } return n; })(),
  twice: [[yRow(1, 4), 52], [yRow(1, 7), 53], [yRow(2, 1), 54]].map(([r, seed]) => { const rand = seeded(seed); let prev = null, same = 0;
    for (let i = 0; i < 300; i++) { const s = M.makeSum(r.ops, r, prev, rand); if (prev && M.sumText(s) === M.sumText(prev)) same++; prev = s; } return same; }),
  fall: yRow(0, 6).fall_s ?? null,
  halves: [M.planParts(yRow(1, 5), 8), M.planParts(yRow(1, 6), 8)],
};
// ---------- Step 2c-3c: Year 1 on the lower track, Year 3 on the higher (v1.9) ----------
const LO = MP.TRACKS.reception.systems, HI = MP.TRACKS.year2.systems;
const lRow = (s, n) => LO[s].levels[n - 1].row, hRow = (s, n) => HI[s].levels[n - 1].row;
// 300 (or n) landings of a level that plays its own line each landing: the question, its line, and its part
const landings = (row, seed, n = 300) => { const rand = seeded(seed), plan = AK.planAsks(row, n, rand); let prev = null; const o = [];
  for (const k of plan) { const T = AK.askTarget(row, k, prev, rand); o.push({ T, L: AK.askLine(row, T, rand), k }); prev = T; } return o; };
const lineSum = (row, seed, n = 300) => { const ls = landings(row, seed, n); return {
  n: ls.length, spans: [...new Set(ls.map(({ L }) => (L.to - L.from) / L.step))], steps: [...new Set(ls.map(({ L }) => L.step))].sort((a, b) => a - b),
  lo: Math.min(...ls.map(({ L }) => L.from)), hi: Math.max(...ls.map(({ L }) => L.to)), starts: new Set(ls.map(({ L }) => L.from)).size,
  holds: ls.every(({ T, L }) => (T.value === undefined || (T.value >= L.from && T.value <= L.to && (T.value - L.from) % L.step === 0)) && L.from % L.step === 0),
  sides: ls.filter(({ T }) => T.ask === 'sign' && T.rule === 'range').every(({ T, L }) => T.n - L.from >= 3 && L.to - T.n >= 3),
  twice: ls.some(({ T }, i) => i > 0 && AK.keyOf(T) === AK.keyOf(ls[i - 1].T)),
  // per step (a count) or per part: the stretch's step and length, and how often
  bystep: ls.reduce((a, { T, L }) => { const k = T.step ?? T.by ?? T.size ?? T.part ?? '-'; const e = a[k] || { n: 0, st: [], len: [], hi: -Infinity, lo: Infinity };
    e.n++; if (!e.st.includes(L.step)) e.st.push(L.step); if (!e.len.includes((L.to - L.from) / L.step)) e.len.push((L.to - L.from) / L.step);
    e.hi = Math.max(e.hi, L.to); e.lo = Math.min(e.lo, L.from); a[k] = e; return a; }, {}),
  labels: [...new Set(ls.map(({ L }) => L.labels || 'plain'))],
  kinds: ls.reduce((a, { T }) => { const k = T.ask === 'half' || T.ask === 'double' ? T.ask : (T.rel ?? T.dir ?? '-'); a[k] = (a[k] || 0) + 1; return a; }, {}),
  parts: ls.map(({ T }) => T.part ?? null).slice(0, 8), partVals: [0, 1].map((p) => span(ls.filter(({ T }) => T.part === p).map(({ T }) => T.value))) }; };
const pickShares = (row, seed, by, n = 600) => { const rand = seeded(seed), plan = AK.planAsks(row, n, rand); let prev = null; const o = {};
  for (const k of plan) { const T = AK.askTarget(row, k, prev, rand); const g = by(T); o[g] = (o[g] || 0) + 1; prev = T; } return o; };
const flat13 = (f) => [f.a, f.op, f.b, f.op2 ?? null, f.c ?? null, f.missing ?? null, f.result ?? null, f.answer, f.flip ?? null, f.den ?? null, f.round ?? null, f.exact ?? null];
const facts13 = (r) => r.ops.flatMap((op) => M.partsOf(r).flatMap((p) => M.facts(op, p).map(flat13)));
const parts13 = (r) => M.partsOf(r).map((p) => r.ops.flatMap((op) => M.facts(op, p).map(flat13)));
// 600 sums of a level (seeded): each sum, the line it lands on, and the group it was picked from
const sumDraws = (r, seed, n = 600) => { const rand = seeded(seed); let prev = null; const o = [];
  for (let i = 0; i < n; i++) { const p = M.partsOf(r)[M.planParts(r, n)[i]]; const s = M.makeSum(r.ops, p, prev, rand);
    o.push({ f: flat13(s), text: s.text, g: String(s.group ?? s.form), L: M.lineForSum(s, r.ops, p, rand) }); prev = s; } return o; };
const sumLines = (r, seed) => { const ds = sumDraws(r, seed, 300); return {
  holds: ds.every(({ f, L }) => f[7] >= L.from && f[7] <= L.to && (f[7] - L.from) % L.step === 0 && L.from >= 0),
  shapes: [...new Set(ds.map(({ L }) => `${(L.to - L.from) / L.step}x${L.step}`))].sort(), lo: Math.min(...ds.map(({ L }) => L.from)), hi: Math.max(...ds.map(({ L }) => L.to)),
  starts: new Set(ds.map(({ L }) => L.from)).size, labels: [...new Set(ds.map(({ L }) => L.labels || 'plain'))].sort(),
  twice: ds.some((d, i) => i > 0 && d.text === ds[i - 1].text) }; };
const groupShares = (r, seed) => sumDraws(r, seed).reduce((a, { g }) => ({ ...a, [g]: (a[g] || 0) + 1 }), {});
const ask = (r, kind) => AK.choices(r, kind);
out.y13 = {
  ASKS: AK.ASKS, FORMS: M.FORMS,
  fracText: [[3, 10, false], [10, 10, false], [13, 10, false], [0, 10, false], [20, 10, false], [4, 8, false], [4, 8, true], [6, 7, false]].map(([v, d, s]) => N.fracText(v, d, s)),
  partsSay: [[3, 10], [10, 10], [13, 10], [0, 10], [1, 10], [20, 10], [6, 7], [11, 10]].map(([v, d]) => N.partsSay(v, d)),
  // Year 1's questions (lower track: Ice 1 to 6, Ringed 1, 2, 4, 5, 6)
  find50: ask(lRow(3, 1)).map((T) => [T.n, T.value]), find1000: ask(hRow(3, 1)).map((T) => [T.n, T.value]),
  findParts: [AK.planAsks(lRow(3, 2), 8, seeded(61)), lineSum(lRow(3, 2), 62)],
  next1: ['forward', 'backward'].map((k) => ask(lRow(3, 3), k).map((T) => [T.step, T.dir, T.terms, T.value])),
  count1: ask(lRow(3, 4)).map((T) => [T.step, T.dir, T.terms, T.value]),
  words20: ask(lRow(3, 5)).map((T) => [T.n, T.value]),
  oneMore: ['more', 'less'].map((k) => ask(lRow(3, 6), k).map((T) => [T.dir, T.by ?? 1, T.n, T.value])),
  groups: ask(lRow(5, 1)).map((T) => [T.groups, T.size, T.value]),
  groupLines: ask(lRow(5, 1)).filter((T) => T.groups === 1).map((T) => AK.askLine(lRow(5, 1), T, seeded(1))),
  share: ask(lRow(5, 2)).map((T) => [T.total, T.groups, T.value]),
  halves1: ask(lRow(5, 4)).map((T) => [T.num, T.den, T.look, T.parts, T.value]),
  half20: ask(lRow(5, 5)).map((T) => [T.num, T.den, T.total, T.value]),
  doubles: ask(lRow(5, 6)).map((T) => [T.ask, T.n, T.value]),
  planDoubles: [AK.planAsks(lRow(5, 6), 8, seeded(63)), AK.planAsks(lRow(5, 6), 8, seeded(64))],
  // Year 3's questions (higher track: Ice 1 to 5, Ringed 4 to 6)
  place3: ask(hRow(3, 2)).map((T) => [T.n, T.value]),
  sign1000: ['more', 'fewer', 'same'].map((k) => ask(hRow(3, 3), k).map((T) => [T.rule, T.rel, T.n, T.value ?? null])),
  more1000: ['more', 'less'].map((k) => ask(hRow(3, 4), k).map((T) => [T.dir, T.by ?? 1, T.n, T.value])),
  count3: ask(hRow(3, 5)).map((T) => [T.step, T.dir, T.terms, T.value]),
  amounts: ask(hRow(5, 4)).map((T) => [T.num, T.den, T.total, T.value]),
  tenths: ['forward', 'backward'].map((k) => ask(hRow(5, 5), k).map((T) => [T.step, T.dir, T.terms, T.value, T.den])),
  compare: ask(hRow(5, 6)).map((T) => [T.first, T.second, T.parts, T.value, T.other]),
  compareLines: ask(hRow(5, 6)).map((T) => AK.askLine(hRow(5, 6), T, seeded(1))),
  compareRight: [[{ rule: 'ask', ask: 'frac-compare', first: 3, second: 5, parts: 15, value: 5, other: 3 }, [5, 4, 6, 3, 2], 1.5],
    [{ rule: 'ask', ask: 'frac-compare', first: 2, second: 3, parts: 6, value: 3, other: 2 }, [3, 2, 4], 1], [{ rule: 'ask', ask: 'frac-compare', first: 10, second: 3, parts: 30, value: 10, other: 3 }, [10, 7, 13, 6, 3], 3.5]]
    .map(([T, spots, allowed]) => spots.map((v) => AK.isRight(T, v, allowed))),
  // the lines each landing is shown, 300 landings each (seeded)
  lines: { find50: lineSum(lRow(3, 1), 71), next1: lineSum(lRow(3, 3), 72), count1: lineSum(lRow(3, 4), 73), words20: lineSum(lRow(3, 5), 74),
    oneMore: lineSum(lRow(3, 6), 75), doubles: lineSum(lRow(5, 6), 76), find1000: lineSum(hRow(3, 1), 77), place3: lineSum(hRow(3, 2), 78),
    sign1000: lineSum(hRow(3, 3), 79), more1000: lineSum(hRow(3, 4), 80), count3: lineSum(hRow(3, 5), 81), amounts: lineSum(hRow(5, 4), 82),
    tenths: lineSum(hRow(5, 5), 83), groups: lineSum(lRow(5, 1), 84), compare: lineSum(hRow(5, 6), 85) },
  shares: { count1: pickShares(lRow(3, 4), 91, (T) => T.step), count3: pickShares(hRow(3, 5), 92, (T) => T.step), more1000: pickShares(hRow(3, 4), 93, (T) => T.by),
    groups: pickShares(lRow(5, 1), 94, (T) => T.size), share: pickShares(lRow(5, 2), 95, (T) => T.groups), amounts: pickShares(hRow(5, 4), 96, (T) => T.den) },
};
// Year 1's and Year 3's sums (sums.js 1.4): every fact of each level, as flat13, and their lines
out.y13sums = {
  bond10: facts13(lRow(4, 1)), add20: facts13(lRow(4, 2)), add20x: facts13(lRow(4, 3)), sub20: facts13(lRow(4, 4)), sub20x: facts13(lRow(4, 5)),
  bond20: facts13(lRow(4, 6)), miss20: facts13(lRow(4, 7)),
  htoAdd: parts13(hRow(3, 6)), htoSub: parts13(hRow(3, 7)), halves: [M.planParts(hRow(3, 6), 8), M.planParts(hRow(3, 7), 8)],
  pairs100: facts13(hRow(4, 1)), big2: facts13(hRow(4, 2)), est: facts13(hRow(4, 3)),
  t4: facts13(hRow(4, 4)), t8: facts13(hRow(4, 5)), t3: facts13(hRow(4, 6)), div348: facts13(hRow(4, 7)),
  mixed: facts13(hRow(5, 1)), toxo: facts13(hRow(5, 2)), todo: facts13(hRow(5, 3)), frac: facts13(hRow(5, 7)),
  texts: [{ a: 16, op: '−', b: 9, result: 7, missing: 'a', flip: true }, { a: 7, op: '+', b: 5, result: 12, missing: 'answer' },
    { a: 7, op: '+', b: 5, result: 12, missing: 'answer', flip: true }, { a: 6, op: '+', b: 4, result: 10, missing: 'b', flip: true },
    { a: 5, op: '+', b: 1, den: 7 }, { a: 3, op: '−', b: 3, den: 8 }].map((f) => M.sumText(f)),
  lines: { add20: sumLines(lRow(4, 2), 101), bond20: sumLines(lRow(4, 6), 102), miss20: sumLines(lRow(4, 7), 103), htoAdd: sumLines(hRow(3, 6), 104),
    htoSub: sumLines(hRow(3, 7), 105), big2: sumLines(hRow(4, 2), 106), est: sumLines(hRow(4, 3), 107), mixed: sumLines(hRow(5, 1), 108),
    toxo: sumLines(hRow(5, 2), 109), todo: sumLines(hRow(5, 3), 110), frac: sumLines(hRow(5, 7), 111) },
  fixed: [[lRow(4, 1), 4], [hRow(4, 1), 35], [hRow(4, 4), 28], [hRow(4, 5), 48], [hRow(4, 6), 27], [hRow(4, 7), 8]]
    .map(([r, ans]) => M.lineForSum({ answer: ans }, r.ops, r, seeded(1))),
  estLines: [[{ answer: 600, round: 100 }, 1], [{ answer: 90, round: 10 }, 2], [{ answer: 200, round: 10 }, 3], [{ answer: 10, round: 10 }, 4]].map(([s, seed]) => M.lineForSum(s, ['+'], hRow(4, 3), seeded(seed))),
  fracLines: [2, 7, 10].map((d) => M.lineForSum({ answer: 1, den: d }, ['+'], hRow(5, 7), seeded(1))),
  shares: { est: groupShares(hRow(4, 3), 121), todo: groupShares(hRow(5, 3), 122), frac: groupShares(hRow(5, 7), 123), hto: groupShares({ ...hRow(3, 6), parts: undefined, cross: false }, 124),
    miss20: sumDraws(lRow(4, 7), 125).reduce((a, { f }) => { const k = `${f[5]}${f[8] ? '/flip' : ''}`; return { ...a, [k]: (a[k] || 0) + 1 }; }, {}) },
  twice: [[lRow(4, 7), 131], [hRow(4, 3), 132], [hRow(5, 7), 133], [hRow(5, 1), 134]].map(([r, seed]) => { const ds = sumDraws(r, seed, 300); return ds.filter((d, i) => i > 0 && d.text === ds[i - 1].text).length; }),
  fall: [hRow(5, 1).fall_s ?? null, lRow(4, 2).fall_s ?? null],
};
// Their faces (faces.js 1.2)
const chip13 = (T) => FC.faceChip(T);
out.y13faces = {
  find: [37, 347].map((k) => { const c2 = chip13({ ask: 'find', n: k, value: k }); return [c2.cls, txt(c2.html)]; }),
  groups: [[3, 2], [5, 10], [1, 5]].map(([g, sz]) => { const c2 = chip13({ ask: 'groups', groups: g, size: sz, value: g * sz }); return [c2.cls, has(c2.html, 'd-on'), has(c2.html, 'gr-row'), txt(c2.html)]; }),
  half: [14, 2].map((k) => { const c2 = chip13({ ask: 'half', n: k, value: k / 2 }); return [c2.cls, has(c2.html, 'd-on'), has(c2.html, 'fo-group'), txt(c2.html)]; }),
  double10: dotsOn(chip13({ ask: 'double', n: 10, value: 20 }).html),
  place: [347, 905, 100].map((k) => { const c2 = chip13({ ask: 'place', n: k, value: k }); return [c2.cls, has(c2.html, 'pc-h'), has(c2.html, 'pc-t'), has(c2.html, 'pc-o'), txt(c2.html)]; }),
  place34: (() => { const c2 = chip13({ ask: 'place', n: 34, value: 34 }); return [has(c2.html, 'pv-ten'), has(c2.html, 'pv-one'), has(c2.html, 'pc-h')]; })(),
  moreLess: [[{ ask: 'more-less', dir: 'more', by: 100, n: 347, value: 447 }], [{ ask: 'more-less', dir: 'less', by: 10, n: 347, value: 337 }], [{ ask: 'more-less', dir: 'more', n: 6, value: 7 }]]
    .map(([T]) => txt(chip13(T).html)),
  tenths: [{ ask: 'seq', step: 1, dir: 'forward', terms: [7, 8, 9], value: 10, den: 10 }, { ask: 'seq', step: 1, dir: 'backward', terms: [13, 12, 11], value: 10, den: 10 }]
    .map((T) => { const h = chip13(T).html; return [has(h, 'fr'), txt(h)]; }),
  compare: (() => { const h = chip13({ ask: 'frac-compare', first: 3, second: 5, parts: 15, value: 5, other: 3 }).html; return [has(h, 'fr'), txt(h)]; })(),
  share10: (() => { const h = chip13({ ask: 'share', total: 20, groups: 10, value: 2 }).html; return [has(h, 'sw'), has(h, 'plate')]; })(),
  partsHtml: [[3, 10], [13, 10], [10, 10], [0, 10]].map(([v, d]) => txt(FC.partsHtml(v, d))),
  fracSum: (() => { const c2 = FC.fracSumHtml({ a: 5, op: '+', b: 1, den: 7 }); return [has(c2, 'fr'), txt(c2)]; })(),
};
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
# The higher track (step 2c-3b, D-100): Year 2's three systems replace the stand-in levels (D-068), a new
# edition, so a map kept on the stand-ins starts afresh there; Year 3's Ice, Jungle and Ringed come in 2c-3c
hi = TRK['year2']
lo = TRK['reception']
check(hi['edition'] not in ('', 'stand-in', lo['edition']) and hi['name'] == 'Year 2, then Year 3',
      f"the higher track is Year 2's, with an edition of its own (not the stand-ins'): {hi['edition']!r}, {hi['name']!r}")
check(all(len(x['levels']) == 8 and not x['soon'] for x in hi['systems']),
      'higher track: all six systems hold 8 levels each, Year 2 then Year 3 (step 2c-3c); none is coming soon')
check(all(x['levels'][7] == ['challenge', None] and x['plan'][7] == 'challenge' for x in hi['systems']) and
      all(k != 'challenge' for x in hi['systems'] for k, _ in x['levels'][:7]),
      'each of them ends in a challenge round, and only there (D-091)')
check(all(lvl is None and r is not None for x in hi['systems'] for (k, lvl), r in zip(x['levels'][:7], x['rows'][:7])),
      "every Year 2 and Year 3 level has its own row: none is a stand-in level's (D-068) or a table's row")
# The lower track: Reception's three systems, as the level plan says (D-091)
check(lo['edition'] not in ('', 'stand-in'), f"the lower track has an edition of its own: {lo['edition']!r}")
check(all(len(x['levels']) == 8 and not x['soon'] for x in lo['systems']),
      'lower track: all six systems hold 8 levels each, Reception then Year 1 (step 2c-3c); none is coming soon')
check(all(x['levels'][7] == ['challenge', None] and x['plan'][7] == 'challenge' for x in lo['systems']) and
      all(k != 'challenge' for x in lo['systems'] for k, _ in x['levels'][:7]),
      'each of them ends in a challenge round, and only there (D-091)')
sys.path.insert(0, HERE)
import plan_rocket_levels as PLANS  # noqa: E402
want_plan = PLANS.PLAN['reception']['systems']
got_plan = [x['plan'][:7] for x in lo['systems']]
check(got_plan == want_plan, f'lower track levels 1 to 7 of all six systems are the level plan\'s, in its order (plan_rocket_levels.py): {got_plan}')
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
# Year 2: levels 1 to 7 of Moon, Red Dust and Candy are the plan's, and their rows' numbers the notes' params
want_hi = PLANS.PLAN['year2']['systems']
got_hi = [x['plan'][:7] for x in hi['systems']]
check(got_hi == want_hi, f"higher track levels 1 to 7 of all six systems are the level plan's Year 2 and Year 3, in its order (plan_rocket_levels.py): {got_hi}")
y2 = {pl: r for x in hi['systems'][:3] for pl, r in zip(x['plan'], x['rows'])}
Y2S = json.load(open(NOTES, encoding='utf-8'))['stages']['year2']
yr = lambda i: y2[i]  # noqa: E731
want_y2 = [
    ('Y2-01', yr('Y2-01')['ask'] == 'place' and yr('Y2-01')['digits'] == P('Y2-01')['digits'] and [yr('Y2-01')['min'], yr('Y2-01')['max']] == [10, 99]),
    ('X-words100', yr('X-words100')['ask'] == 'words' and [yr('X-words100')['min'], yr('X-words100')['max']] == Y2S['number_words']),
    ('Y2-02', yr('Y2-02')['ask'] == 'sign' and [yr('Y2-02')['min'], yr('Y2-02')['max']] == [P('Y2-02')['min'], P('Y2-02')['max']]
     and P('Y2-02')['symbols'] == ['<', '>', '='] and all(yr('Y2-02')['rels'][k] > 0 for k in ('more', 'fewer', 'same'))),
    ('Y2-03', yr('Y2-03')['ask'] == 'seq' and yr('Y2-03')['steps'] == P('Y2-03')['steps'] and yr('Y2-03')['start'] == P('Y2-03')['start']
     and yr('Y2-03')['max'] == P('Y2-03')['max'] and yr('Y2-03')['dirs'] == P('Y2-03')['directions']),
    ('Y2-04', yr('Y2-04')['ask'] == 'seq' and yr('Y2-04')['steps'] == P('Y2-04')['steps'] and P('Y2-04')['start_any'] and yr('Y2-04')['start'] == 'any'
     and yr('Y2-04')['max'] == P('Y2-04')['max'] and Y2S['count_in_tens_from_any_number']),
    ('Y2-05', yr('Y2-05')['forms'] == ['facts'] and yr('Y2-05')['max'] == P('Y2-05')['max'] and yr('Y2-05')['fall_s'] == P('Y2-05')['timed_seconds']
     and yr('Y2-05')['ops'] == ['+', '−']),
    ('Y2-06', yr('Y2-06')['forms'] == ['bond'] and yr('Y2-06')['whole'] == P('Y2-06')['target'] and yr('Y2-06')['every'] == P('Y2-06')['multiples_of']),
    ('Y2-07', yr('Y2-07')['forms'] == ['TO+O'] and yr('Y2-07')['max'] == P('Y2-07')['answer_max'] and P('Y2-07')['form'] == 'TO+O'),
    ('Y2-08', yr('Y2-08')['forms'] == ['TO+T'] and yr('Y2-08')['max'] == P('Y2-08')['answer_max'] and P('Y2-08')['form'] == 'TO+T'),
    ('Y2-09', yr('Y2-09')['forms'] == ['TO-O', 'TO-T'] and P('Y2-09')['forms'] == ['TO-O', 'TO-T'] and yr('Y2-09')['ops'] == ['−']),
    ('Y2-10', yr('Y2-10')['forms'] == ['O+O+O'] and P('Y2-10')['form'] == 'O+O+O'),
    ('Y2-11', yr('Y2-11')['forms'] == ['TO+TO'] and yr('Y2-11')['max'] == P('Y2-11')['answer_max'] and [p['carry'] for p in yr('Y2-11')['parts']] == [False, True]),
    ('Y2-12', yr('Y2-12')['forms'] == ['TO-TO'] and P('Y2-12')['form'] == 'TO-TO' and [p['exchange'] for p in yr('Y2-12')['parts']] == [False, True]),
    ('Y2-13', yr('Y2-13')['forms'] == ['missing'] and yr('Y2-13')['max'] == P('Y2-13')['max'] and yr('Y2-13')['ops'] == ['+', '−'] and P('Y2-13')['ops'] == ['+', '-']),
    ('Y2-14', yr('Y2-14')['forms'] == ['table'] and yr('Y2-14')['tables'] == P('Y2-14')['tables'] and yr('Y2-14')['times_max'] == P('Y2-14')['max_multiplier']),
    ('Y2-15', yr('Y2-15')['forms'] == ['table'] and yr('Y2-15')['tables'] == P('Y2-15')['tables'] and yr('Y2-15')['times_max'] == P('Y2-15')['max_multiplier']),
    ('Y2-16', yr('Y2-16')['forms'] == ['table'] and yr('Y2-16')['tables'] == P('Y2-16')['tables'] and yr('Y2-16')['times_max'] == P('Y2-16')['max_multiplier']),
    ('Y2-17', yr('Y2-17')['forms'] == ['divide'] and yr('Y2-17')['tables'] == P('Y2-17')['tables'] and yr('Y2-17')['times_max'] == P('Y2-17')['max_multiplier']),
    ('Y2-18', yr('Y2-18')['ask'] == 'parity' and [yr('Y2-18')['min'], yr('Y2-18')['max']] == [P('Y2-18')['min'], P('Y2-18')['max']]),
    ('Y2-19', yr('Y2-19')['ask'] == 'frac-shape' and yr('Y2-19')['fractions'] == P('Y2-19')['fractions']),
    ('Y2-20', yr('Y2-20')['ask'] == 'frac-of' and yr('Y2-20')['fractions'] == P('Y2-20')['fractions'] and yr('Y2-20')['total_max'] == P('Y2-20')['total_max']),
]
check(all(ok for _, ok in want_y2), f"Year 2's rows' numbers are the notes' params (tables to × 12, D-099; the timed level's 6 s): {[i for i, ok in want_y2 if not ok]}")
# Year 1 (lower track) and Year 3 (higher track), Ice, Jungle and Ringed: their rows' numbers are the notes' params (step 2c-3c)
y13r = {pl: r for tr in (lo, hi) for x in tr['systems'][3:] for pl, r in zip(x['plan'], x['rows'])}
STG = json.load(open(NOTES, encoding='utf-8'))['stages']
Y1S, Y3S = STG['year1'], STG['year3']
q = lambda i: y13r[i]  # noqa: E731
sums_row = lambda i, forms, ops: q(i)['forms'] == forms and q(i)['ops'] == ops  # noqa: E731
want_y13 = [
    ('Y1-01', q('Y1-01')['ask'] == 'find' and [q('Y1-01')['min'], q('Y1-01')['max']] == [P('Y1-01')['min'], P('Y1-01')['max']]),
    # D-094: numbers to 100 in halves; D-104: 51 to 100 (the numbers past Y1-01's), then 0 to 100
    ('Y1-02', q('Y1-02')['ask'] == 'find' and [[p['min'], p['max']] for p in q('Y1-02')['parts']] == [[P('Y1-01')['max'] + 1, P('Y1-02')['max']], [P('Y1-02')['min'], P('Y1-02')['max']]]),
    ('Y1-03', q('Y1-03')['ask'] == 'seq' and q('Y1-03')['steps'] == [P('Y1-03')['step']] and [q('Y1-03')['min'], q('Y1-03')['max']] == [P('Y1-03')['min'], P('Y1-03')['max']]
     and q('Y1-03')['dirs'] == P('Y1-03')['directions'] and q('Y1-03')['start'] == 'any' and Y1S['count_forwards_and_backwards_from_any_number']),
    ('Y1-04', q('Y1-04')['ask'] == 'seq' and q('Y1-04')['steps'] == P('Y1-04')['steps'] == Y1S['skip_counting'] and q('Y1-04')['start'] == P('Y1-04')['start']
     and q('Y1-04')['max'] == P('Y1-04')['max'] and q('Y1-04')['dirs'] == ['forward'] and 'directions' not in P('Y1-04')),
    ('Y1-05', q('Y1-05')['ask'] == 'words' and [q('Y1-05')['min'], q('Y1-05')['max']] == [P('Y1-05')['min'], P('Y1-05')['max']] == Y1S['number_words']),
    ('Y1-06', q('Y1-06')['ask'] == 'more-less' and [q('Y1-06')['min'], q('Y1-06')['max']] == [P('Y1-06')['min'], P('Y1-06')['max']] and 'by' not in q('Y1-06')),
    ('Y1-07', sums_row('Y1-07', ['bond'], ['+']) and q('Y1-07')['whole'] == P('Y1-07')['target'] and q('Y1-07')['every'] == 1 and P('Y1-07')['show_objects'] is False),
    ('Y1-08', sums_row('Y1-08', ['facts'], ['+']) and q('Y1-08')['max'] == P('Y1-08')['answer_max'] == P('Y1-08')['a'][1] and q('Y1-08')['b_max'] == P('Y1-08')['b'][1]
     and q('Y1-08')['cross'] is False),
    ('X-add20-cross', sums_row('X-add20-cross', ['facts'], ['+']) and q('X-add20-cross')['max'] == P('Y1-08')['answer_max'] and q('X-add20-cross')['b_max'] == P('Y1-08')['b'][1]
     and q('X-add20-cross')['cross'] is True),
    ('Y1-09', sums_row('Y1-09', ['facts'], ['−']) and q('Y1-09')['max'] == P('Y1-09')['start'][1] == Y1S['subtraction']['start_max'] and q('Y1-09')['b_max'] == P('Y1-09')['b'][1]
     and q('Y1-09')['cross'] is False),
    ('X-sub20-cross', sums_row('X-sub20-cross', ['facts'], ['−']) and q('X-sub20-cross')['max'] == P('Y1-09')['start'][1] and q('X-sub20-cross')['b_max'] == P('Y1-09')['b'][1]
     and q('X-sub20-cross')['cross'] is True),
    ('Y1-10', sums_row('Y1-10', ['bond'], ['+']) and q('Y1-10')['whole'] == P('Y1-10')['target'] and q('Y1-10')['every'] == 1),
    ('Y1-11', sums_row('Y1-11', ['missing'], ['+', '−']) and q('Y1-11')['of'] == ['facts'] and q('Y1-11')['max'] == P('Y1-11')['max'] and P('Y1-11')['ops'] == ['+', '-']
     and q('Y1-11')['blanks'] == P('Y1-11')['blank_positions'] and q('Y1-11')['flip'] is True and Y1S['missing_number']['example'] == '7 = ? - 9'),
    ('Y1-12', q('Y1-12')['ask'] == 'groups' and q('Y1-12')['sizes'] == P('Y1-12')['group_sizes'] == Y1S['multiplication']['group_sizes'] and q('Y1-12')['max_groups'] == P('Y1-12')['max_groups']
     and P('Y1-12')['show_array']),
    ('Y1-13', q('Y1-13')['ask'] == 'share' and q('Y1-13')['total_max'] == P('Y1-13')['total_max'] and q('Y1-13')['groups'] == P('Y1-13')['groups']),
    ('Y1-14', q('Y1-14')['ask'] == 'frac-shape' and q('Y1-14')['fractions'] == P('Y1-14')['fractions'] == Y1S['fractions']),
    ('Y1-15', q('Y1-15')['ask'] == 'frac-of' and q('Y1-15')['fractions'] == P('Y1-15')['fractions'] and q('Y1-15')['total_max'] == P('Y1-15')['total_max']),
    ('X-doubles20', q('X-doubles20')['ask'] == 'double' and q('X-doubles20')['halves'] is True and 2 * q('X-doubles20')['max'] == 20 and 'doubles and halves to 20' in Y1S['other']),
    ('Y3-01', q('Y3-01')['ask'] == 'find' and [q('Y3-01')['min'], q('Y3-01')['max']] == [P('Y3-01')['min'], P('Y3-01')['max']]),
    ('Y3-02', q('Y3-02')['ask'] == 'place' and q('Y3-02')['digits'] == P('Y3-02')['digits'] and [q('Y3-02')['min'], q('Y3-02')['max']] == [100, 999]),
    ('Y3-03', q('Y3-03')['ask'] == 'sign' and [q('Y3-03')['min'], q('Y3-03')['max']] == [P('Y3-03')['min'], P('Y3-03')['max']] == Y3S['compare']['range']
     and P('Y3-03')['symbols'] == ['<', '>', '='] and all(q('Y3-03')['rels'][k] > 0 for k in ('more', 'fewer', 'same'))),
    ('Y3-04', q('Y3-04')['ask'] == 'more-less' and q('Y3-04')['by'] == [10, 100] and [q('Y3-04')['min'], q('Y3-04')['max']] == [P('Y3-04')['min'], P('Y3-04')['max']]
     and Y3S['ten_or_hundred_more_or_less']),
    ('Y3-05', q('Y3-05')['ask'] == 'seq' and q('Y3-05')['steps'] == P('Y3-05')['steps'] and q('Y3-05')['start'] == P('Y3-05')['start'] and q('Y3-05')['max'] == P('Y3-05')['max']
     and q('Y3-05')['dirs'] == ['forward'] and 'directions' not in P('Y3-05')),
    ('Y3-06', sums_row('Y3-06', ['HTO+O', 'HTO+T', 'HTO+H'], ['+']) and P('Y3-06')['forms'] == ['HTO+O', 'HTO+T', 'HTO+H'] and q('Y3-06')['max'] == P('Y3-06')['answer_max']
     and [p['cross'] for p in q('Y3-06')['parts']] == [False, True]),
    ('Y3-07', sums_row('Y3-07', ['HTO-O', 'HTO-T', 'HTO-H'], ['−']) and P('Y3-07')['forms'] == ['HTO-O', 'HTO-T', 'HTO-H'] and [p['cross'] for p in q('Y3-07')['parts']] == [False, True]),
    ('Y3-08', sums_row('Y3-08', ['bond'], ['+']) and q('Y3-08')['whole'] == P('Y3-08')['target'] and q('Y3-08')['every'] == P('Y3-08')['multiples_of']),
    ('Y3-09', sums_row('Y3-09', ['TO+TO', 'TO-TO'], ['+', '−']) and P('Y3-09')['form'] == 'TO+TO / TO-TO' and q('Y3-09')['max'] == P('Y3-09')['answer_max']),
    ('Y3-10', sums_row('Y3-10', ['estimate'], ['+', '−']) and q('Y3-10')['rounds'] == P('Y3-10')['round_to'] and P('Y3-10')['ops'] == ['+', '-'] and P('Y3-10')['max'] == 1000
     and Y3S['addition']['estimate_first']),
    ('Y3-11', sums_row('Y3-11', ['table'], ['×']) and q('Y3-11')['tables'] == P('Y3-11')['tables'] and q('Y3-11')['times_max'] == P('Y3-11')['max_multiplier']),
    ('Y3-12', sums_row('Y3-12', ['table'], ['×']) and q('Y3-12')['tables'] == P('Y3-12')['tables'] and q('Y3-12')['times_max'] == P('Y3-12')['max_multiplier']),
    ('Y3-13', sums_row('Y3-13', ['table'], ['×']) and q('Y3-13')['tables'] == P('Y3-13')['tables'] and q('Y3-13')['times_max'] == P('Y3-13')['max_multiplier']),
    ('X-div348', sums_row('X-div348', ['divide'], ['÷']) and q('X-div348')['tables'] == [3, 4, 8] == sorted(Y3S['multiplication']['new_this_year'])
     and set(q('X-div348')['tables']) <= set(Y3S['division']['times_tables'])),
    ('Y3-14', sums_row('Y3-14', ['table', 'divide'], ['×', '÷']) and q('Y3-14')['tables'] == P('Y3-14')['tables'] and q('Y3-14')['times_max'] == P('Y3-14')['max_multiplier']
     and q('Y3-14')['fall_s'] == P('Y3-14')['timed_seconds']),
    ('Y3-15', sums_row('Y3-15', ['TO*O'], ['×']) and P('Y3-15')['form'] == 'TO*O' and q('Y3-15')['a'] == P('Y3-15')['a'] and q('Y3-15')['b'] == P('Y3-15')['b']),
    ('X-TOdivO', sums_row('X-TOdivO', ['TO/O'], ['÷']) and q('X-TOdivO')['divisors'] == [d for d in Y3S['division']['times_tables'] if d < 10] and Y3S['division']['exact_only']),
    ('Y3-16', q('Y3-16')['ask'] == 'frac-of' and q('Y3-16')['fractions'] == [f'{n}/{d}' for d in P('Y3-16')['denominators'] for n in range(1, d) if gcd(n, d) == 1]
     and q('Y3-16')['total_max'] == P('Y3-16')['total_max'] and P('Y3-16')['non_unit'] and q('Y3-16')['pick'] == 'den'),
    ('Y3-17', q('Y3-17')['ask'] == 'seq' and q('Y3-17')['den'] == 10 and P('Y3-17')['fraction_step'] == '1/10' and q('Y3-17')['max'] == P('Y3-17')['max'] * 10
     and q('Y3-17')['steps'] == [1] and q('Y3-17')['dirs'] == ['forward', 'backward']),
    ('Y3-18', q('Y3-18')['ask'] == 'frac-compare' and q('Y3-18')['dens'] == P('Y3-18')['denominators'] and P('Y3-18')['unit_only'] and q('Y3-18')['min_gap'] == [1, 12]),
    ('Y3-19', sums_row('Y3-19', ['frac'], ['+', '−']) and q('Y3-19')['dens'] == list(range(2, 11)) and P('Y3-19')['same_denominator'] and P('Y3-19')['max_total'] == 1),
]
check(len(want_y13) == 39 and all(ok for _, ok in want_y13),
      f"Year 1's and Year 3's rows' numbers are the notes' params (D-094's halves; times tables to × 12, D-099; the timed level's 6 s): {[i for i, ok in want_y13 if not ok]}")
reused = {pl: lvl for x in lo['systems'][:3] for pl, (k, lvl) in zip(x['plan'], x['levels']) if lvl is not None}
check(reused == {'R01': 1, 'R02': 2, 'X-odd-faint': 5, 'R13': 1, 'R14': 2, 'X-mix10': 3, 'R15': 3, 'X-parity-faint': 4},
      f"levels that play today reuse today's rows: Number mode 1, 2, 5, 3, 4 and sums 1, 2, 3 (level plan section 2): {reused}")
reused13 = {pl: (k, lvl) for tr in (lo, hi) for x in tr['systems'][3:] for pl, (k, lvl) in zip(x['plan'], x['levels']) if lvl is not None}
check(reused13 == {'X-every-other': ('number', 6), 'X-0-5-10': ('number', 7), 'X-0-10': ('number', 8)},
      f"Year 1's three added levels reuse Number mode's levels 6, 7 and 8 (D-038's G2, G3 and T2); every other Year 1 and Year 3 level has its own row: {reused13}")
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
# The game's own tracks since step 2c-3b: no track is the stand-in any more (D-100)
rt = o['realTracks']
KEEP = {'rocks': 40, 'landings': 50, 'ship': 'teapot', 'ships': ['classic', 'teapot']}
check(rt['f3'] == {'track': 'reception', 'p': KEEP, 'others': {}},
      f"a format 3 entry (made on the stand-ins, now gone): the lower track, its rocks, landings and ships kept, its map not: {rt['f3']}")
check(rt['standIn4'] == {'track': 'year2', 'p': KEEP, 'others': {}},
      f"a format 4 entry on the higher track's stand-in edition: Year 2 from the start, the rocks, landings and ships kept: {rt['standIn4']}")
check(rt['putBy'] == {'track': 'year2', 'p': {'rocks': 7}, 'others': {'reception': {'edition': lo['edition'], 'at': 'moon-3', 'open': 'moon-4', 'levels': {}}}},
      f"switching to Year 2 with a stand-in map put by: Year 2 afresh, the rocks kept, the lower map put by as left: {rt['putBy']}")

# ---------- Reception's questions (asks.js, level plan section 5) ----------
ak = o['asks']
check(ak['ASKS'][:7] == ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share'], f"Reception's seven kinds of question, first (Year 2's seven follow, checked whole below): {ak['ASKS']}")
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

# ---------- Step 2c-3b: Year 2's questions, faces and sums (asks.js 1.1, faces.js 1.1, sums.js 1.3) ----------
# Expected values are enumerated here in Python from the notes' words, not taken from the game's code.
yv = o['y2']
check(yv['fracText'] == ['0', '1/4', '1/2', '3/4', '1', '1/3', '2/3', '1', '1 1/2', '1/2', '1 3/10', '0', '2'],
      f"a fraction line's numbers, simplest form: 2/4 is 1/2, 4/4 is 1, 6/4 is 1 1/2, 13/10 is 1 3/10: {yv['fracText']}")
check(yv['fracSay'] == ['one half', 'one third', 'two thirds', 'one quarter', 'two quarters', 'three quarters', 'one tenth', 'three tenths', 'two sevenths', 'five twelfths'],
      f"fractions said as they're written: {yv['fracSay']}")
# A level's own fall (the timed level, 6 s in the notes) takes the place of the speed, the 25% included; none: as before
check(yv['fall'] == [6, 6, 15, 15, 7], f"a level's own fall time: 6 s at any speed; without one, 12 x 1.25 = 15 and speed 5's 7 s: {yv['fall']}")
check(yv['ASKS'][:14] == ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share', 'place', 'words', 'sign', 'seq', 'parity', 'frac-shape', 'frac-of'],
      f"Reception's seven questions and Year 2's seven (Year 1's and Year 3's follow, checked whole below): {yv['ASKS']}")
ch2 = yv['choices']
check(ch2['place'] == [[n, n, 'ask'] for n in range(10, 100)], f"tens and ones: every 2-digit number, 10 to 99 ({len(ch2['place'])})")
check(ch2['words'] == [[n, n] for n in range(1, 101)], f"number words: 1 to 100 ({len(ch2['words'])})")
check(ch2['sign'] == [[['range', 'more', n, None] for n in range(3, 98)], [['range', 'fewer', n, None] for n in range(3, 98)], [['ask', 'same', n, n] for n in range(3, 98)]],
      f"<, > and = on 3 to 97, so the line can hold 3 numbers each side inside 0 to 100: {[len(x) for x in ch2['sign']]}")


def seqs(steps, start, lo, hi, d):
    out = []
    for s in steps:
        t0s = range(lo, hi + 1) if start == 'any' else range(start, hi + 1, s)
        for t0 in t0s:
            ts = [t0 + k * s * (1 if d == 'forward' else -1) for k in range(4)]
            if all(lo <= t <= hi for t in ts):
                out.append([s, d, ts[:3], ts[3]])
    return out


check(ch2['seq3'] == [seqs([2, 3, 5], 0, 0, 60, 'forward'), seqs([2, 3, 5], 0, 0, 60, 'backward')],
      f"counting in 2s, 3s and 5s from 0, to 60, both ways: 3 numbers then the next: {[len(x) for x in ch2['seq3']]} (by hand: 28 + 18 + 10 = 56 each way)")
check(len(ch2['seq3'][0]) == 56 and len(ch2['seq3'][1]) == 56, 'and 56 each way, as worked out by hand')
check(ch2['seq10'] == [seqs([10], 'any', 0, 100, 'forward'), seqs([10], 'any', 0, 100, 'backward')] and [len(x) for x in ch2['seq10']] == [71, 71],
      f"tens from any number, to 100, both ways: 0 to 70 up, 30 to 100 down: {[len(x) for x in ch2['seq10']]}")
check(yv['seqAllOk'], 'every sequence goes up (or down) by its step, the answer included')
check(ch2['parity'] == [['range', 'even'], ['range', 'odd']], f"odd or even: any number that is: {ch2['parity']}")
SH = {'1/2': 4, '1/3': 3, '1/4': 4, '2/4': 4, '3/4': 4}  # halves on a line of quarters (Claude's reading: three numbers inside, not one)
want_shape = [[int(f[0]), int(f[2]), look, SH[f], int(f[0]) * SH[f] // int(f[2])] for f in ['1/2', '1/3', '1/4', '2/4', '3/4'] for look in (0, 1)]
check(ch2['shape'] == want_shape, f"fractions of shapes: the notes' five, each as a circle and a bar, landing on a line of quarters (thirds for 1/3): {ch2['shape']}")
want_of = [[int(f[0]), int(f[2]), t, t * int(f[0]) // int(f[2])] for f in ['1/2', '1/3', '1/4', '3/4'] for t in range(int(f[2]), 25, int(f[2]))]
check(ch2['fracOf'] == want_of and len(want_of) == 32, f"fractions of numbers: whole answers only, totals to 24: 12 + 8 + 6 + 6 = 32: {len(ch2['fracOf'])}")
WIN = {'place': (10, 99), 'words': (1, 100), 'sign': (0, 100), 'seq3': (0, 60), 'seq10': (0, 100), 'parity': (1, 100), 'fracOf': (0, 18)}
for k, (wlo, whi) in WIN.items():
    w2 = yv['windows'][k]
    check(w2['n'] == 300 and w2['spans'] == [10] and w2['steps'] == [1] and w2['lo'] >= wlo and w2['hi'] <= whi and w2['holds'] and w2['starts'] > 5 and not w2['twice'],
          f"{k}: 300 landings, each on a stretch of 10 marks inside {wlo} to {whi} with its answer in it, starting in {w2['starts']} places; never the same question twice running: {w2}")
check(yv['windows']['sign']['sides'] and yv['windows']['sign']['fits'] and yv['windows']['parity']['fits'],
      '<, > and =: the number with 3 marks each side; odd or even: every stretch has numbers that fit')
check(yv['windows']['sign']['kinds'] == {'more': 120, 'fewer': 120, 'same': 60} and yv['windows']['seq3']['kinds'] == {'forward': 150, 'backward': 150}
      and yv['windows']['parity']['kinds'] == {'even': 150, 'odd': 150},
      f"shares of 300: <, > and = 2:2:1; up and down by turns; even and odd half each: {yv['windows']['sign']['kinds']}, {yv['windows']['seq3']['kinds']}, {yv['windows']['parity']['kinds']}")
check(yv['shapeLines'] == [{'from': 0, 'to': 4, 'step': 1, 'label_every': 1, 'labels': 'frac4'}] * 2 + [{'from': 0, 'to': 3, 'step': 1, 'label_every': 1, 'labels': 'frac3'}],
      f"a shape's line: quarters (0 to 4 quarters) for halves and quarters, thirds for a third, every mark written as a fraction: {yv['shapeLines']}")
ps = yv['planSign']
check(len(ps) == 8 and ps.count('more') == 3 and ps.count('fewer') == 3 and ps.count('same') == 2, f"a round of <, > and =: 3, 3 and 2, shuffled: {ps}")
pq = yv['planSeq']
check(len(pq) == 8 and set(pq) == {'forward', 'backward'} and all(pq[i] != pq[i + 1] for i in range(7)), f"counting up and down by turns: {pq}")
pp = yv['planParity']
check(all(len(x) == 8 and x.count('even') == 4 and x.count('odd') == 4 for x in pp) and pp[0] != pp[1], f"odd or even: 4 and 4, shuffled: {pp}")
check(set(yv['stepShares']) == {'2', '3', '5'} and all(150 <= v <= 250 for v in yv['stepShares'].values()),
      f"600 sequences: 2s, 3s and 5s about a third each (a step picked first, so 3s and 5s aren't swamped by 2s): {yv['stepShares']}")
check(set(yv['fracShares']) == {'1/2', '1/3', '1/4', '2/4', '3/4'} and all(80 <= v <= 160 for v in yv['fracShares'].values()),
      f"600 shapes: each of the five fractions about a fifth: {yv['fracShares']}")
check(yv['right'] == [[True, False, False, True, False], [True, False, False, True], [True, False], [True, False, True, True, False], [True, False, True, True]],
      f"right or wrong: 47 < ?: 48 and 57 yes, 47, 46 and 47.5 no; 47 > ?: 46 and 37; 47 = ?: 47; even: 48, 0, 100; odd: 47, 1, 99: {yv['right']}")
check(yv['goal'] == [45, 43, 46, 47], f"after a miss, on 40 to 50: more than 44 from 41.2: 45; fewer than 44 from 49: 43; even from 46.6: 46; odd from 46.2: 47: {yv['goal']}")
yf = o['y2faces']
check(yf['place'] == [[3, 4, 'face face-place'], [7, 0, 'face face-place'], [1, 9, 'face face-place'], [9, 9, 'face face-place']],
      f"tens and ones: 34 as 3 tens rods and 4 ones, 70, 19 and 99: {yf['place']}")
check(yf['words'] == [['forty-seven', 'face face-words'], ['one hundred', 'face face-words'], ['thirteen', 'face face-words'], ['sixty', 'face face-words'], ['one', 'face face-words']],
      f"number words: {yf['words']}")
check(yf['sign'] == [[True, '47 &lt; ?'], [True, '47 &gt; ?'], [True, '47 = ?']], f"<, > and = with 47: {yf['sign']}")
check(yf['seq'] == ['6 8 10 ?', '83 73 63 ?'], f"three numbers of a count, then the box to find: {yf['seq']}")
check(yf['shape'] == [[1, 4], [3, 4], [1, 3], [2, 4], [1, 2]], f"shapes cut in equal parts, so many shaded: 1/4, 3/4, 1/3, 2/4, 1/2: {yf['shape']}")
check(yf['fracOf'] == [[12, 4, '3 4 of 12'], [24, 2, '1 2 of 24'], [9, 3, '1 3 of 9']], f"3/4 of 12: 12 dots in 4 groups; 1/2 of 24; 1/3 of 9: {yf['fracOf']}")
check(yf['fracHtml'] == '3 4', 'a fraction as its two numbers, one over the other')
ys = o['y2sums']
check(ys['FORMS'][:12] == ['facts', 'TO+O', 'TO+T', 'TO-O', 'TO-T', 'O+O+O', 'TO+TO', 'TO-TO', 'missing', 'bond', 'table', 'divide'], f"Year 2's sum forms first (Year 3's checked below): {ys['FORMS']}")
F = lambda a, op, b, ans, op2=None, c=None, miss=None, res=None: [a, op, b, op2, c, miss, res, ans]  # noqa: E731
srt = lambda xs: sorted(xs, key=json.dumps)  # noqa: E731
R = range
want_facts20 = [F(a, '+', b, a + b) for a in R(21) for b in R(21 - a)] + [F(a, '−', b, a - b) for a in R(21) for b in R(a + 1)]
check(srt(ys['facts20']) == srt(want_facts20) and len(want_facts20) == 462, f"fast facts to 20: + and − within 20, 231 of each: {len(ys['facts20'])}")
check(srt(ys['bond']) == srt([F(a, '+', 100 - a, 100 - a, miss='b', res=100) for a in R(10, 100, 10)]), f"tens bonds to 100: 10 + ? to 90 + ?: {len(ys['bond'])}")
want_toO = [F(a, '+', b, a + b) for a in R(10, 100) for b in R(1, 10) if a + b <= 100]
want_toT = [F(a, '+', b, a + b) for a in R(10, 100) for b in R(10, 100, 10) if a + b <= 100]
check(srt(ys['toO']) == srt(want_toO) and len(want_toO) == 774, f"TO + O to 100: 774 (by hand: 82 x 9 + 36): {len(ys['toO'])}")
check(srt(ys['toT']) == srt(want_toT) and len(want_toT) == 369, f"TO + T to 100: 369 (by hand: 81 + 71 + ... + 1): {len(ys['toT'])}")
want_take = [F(a, '−', b, a - b) for a in R(10, 100) for b in R(1, 10)] + [F(a, '−', b, a - b) for a in R(10, 100) for b in R(10, 100, 10) if b <= a]
check(srt(ys['takeOT']) == srt(want_take) and len(want_take) == 810 + 450, f"TO − O and TO − T: 810 + 450 (by hand: 90 + 80 + ... + 10): {len(ys['takeOT'])}")
check(srt(ys['three']) == srt([F(a, '+', b, a + b + c, op2='+', c=c) for a in R(1, 10) for b in R(1, 10) for c in R(1, 10)]), f"three numbers 1 to 9 added: 729: {len(ys['three'])}")
nc = [F(a, '+', b, a + b) for a in R(10, 100) for b in R(10, 100) if a + b <= 100 and a % 10 + b % 10 <= 9]
cy = [F(a, '+', b, a + b) for a in R(10, 100) for b in R(10, 100) if a + b <= 100 and a % 10 + b % 10 >= 10]
check([srt(x) for x in ys['toTO']] == [srt(nc), srt(cy)], f"TO + TO to 100 in halves: no new ten from the ones ({len(nc)}), then a new ten ({len(cy)}), e.g. 34 + 25 then 34 + 28 (D-094)")
ne = [F(a, '−', b, a - b) for a in R(10, 100) for b in R(10, 100) if b <= a and a % 10 >= b % 10]
ex = [F(a, '−', b, a - b) for a in R(10, 100) for b in R(10, 100) if b <= a and a % 10 < b % 10]
check([srt(x) for x in ys['takeTO']] == [srt(ne), srt(ex)], f"TO − TO in halves: no exchanging ({len(ne)}), then exchanging ({len(ex)}) (D-094)")
base = {'+': [x for x in want_toO + want_toT] + [F(a, '+', b, a + b) for a in R(10, 100) for b in R(10, 100) if a + b <= 100],
        '−': want_take + [F(a, '−', b, a - b) for a in R(10, 100) for b in R(10, 100) if b <= a]}
want_miss = [F(f[0], f[1], f[2], f[0], miss='a', res=f[7]) for op in ('+', '−') for f in base[op]] + [F(f[0], f[1], f[2], f[2], miss='b', res=f[7]) for op in ('+', '−') for f in base[op]]
check(srt(ys['missing']) == srt(want_miss), f"missing numbers to 100: each of Year 2's + and − sums with its first or second number hidden: {len(ys['missing'])} (want {len(want_miss)})")
check(all((m[7] == m[0] if m[5] == 'a' else m[7] == m[2]) and (m[0] + m[2] if m[1] == '+' else m[0] - m[2]) == m[6] and m[6] <= 100 for m in ys['missing']),
      'every missing number is the hidden one, and the sum holds')


def table(t):
    return [F(t, '×', n, t * n) for n in R(1, 13)] + [F(n, '×', t, t * n) for n in R(1, 13) if n != t]


check([srt(ys[k]) for k in ('t10', 't2', 't5')] == [srt(table(10)), srt(table(2)), srt(table(5))] and [len(ys[k]) for k in ('t10', 't2', 't5')] == [23, 23, 23],
      'the 10, 2 and 5 times tables to × 12, both ways round (10 × 3 and 3 × 10), 23 sums each; no 0 × n (D-033, D-099)')
check(srt(ys['div']) == srt([F(t * q, '÷', t, q) for t in (2, 5, 10) for q in R(1, 13)]), f"dividing by 2, 5 and 10, whole answers 1 to 12: {len(ys['div'])}")
check(ys['texts'] == ['34 + 5', '4 + 7 + 6', '? + 25 = 60', '30 + ? = 100'], f"sums written: {ys['texts']}")
check(ys['lines'] == [{'from': 0, 'to': 120, 'step': 10, 'label_every': 10}, {'from': 0, 'to': 24, 'step': 2, 'label_every': 2},
                      {'from': 0, 'to': 60, 'step': 5, 'label_every': 5}, {'from': 0, 'to': 12, 'step': 1, 'label_every': 1},
                      {'from': 0, 'to': 100, 'step': 10, 'label_every': 10}],
      f"each table's own line, 0 to 12 lots, every mark written (13 marks); dividing on 0 to 12; tens bonds on 0 to 100 in tens: {ys['lines']}")
check(ys['roundLines'] == [{'from': 0, 'to': 120, 'step': 10, 'label_every': 10}, {'from': 0, 'to': 12, 'step': 1, 'label_every': 1}, {'from': 0, 'to': 100, 'step': 10, 'label_every': 10}],
      f"and the same line before a round's first sum: {ys['roundLines']}")
check(all(ok and starts > 5 for ok, starts in ys['stretch']), f"fast facts, TO + O, three numbers and missing numbers: 200 sums each on a stretch of 10 marks with the answer in it, the stretch moving: {ys['stretch']}")
check(set(ys['missingShares']) == {'TO+O', 'TO+T', 'TO+TO', 'TO-O', 'TO-T', 'TO-TO'} and all(60 <= v <= 140 for v in ys['missingShares'].values()),
      f"600 missing-number sums: each of the six forms about a sixth (a form picked first, so TO + TO's thousands don't swamp the rest): {ys['missingShares']}")
check(ys['twice'] == [0, 0, 0], f"never the same sum twice running (three numbers, missing numbers, a table): {ys['twice']}")
check(ys['fall'] == 6, 'the timed level falls in 6 s (the notes)')
check(ys['halves'] == [[0, 0, 0, 0, 1, 1, 1, 1]] * 2, 'TO + TO and TO − TO: 4 landings without carrying or exchanging, then 4 with (D-094)')

# ---------- Step 2c-3c: Year 1's and Year 3's questions, faces and sums (asks.js 1.2, faces.js 1.2, sums.js 1.4) ----------
# Expected values are enumerated here in Python from the notes' words and the level plan's, not taken from the game's code.
y3 = o['y13']
check(y3['ASKS'] == ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share', 'place', 'words', 'sign', 'seq', 'parity', 'frac-shape', 'frac-of',
                     'find', 'groups', 'half', 'frac-compare'], f"Reception's seven questions, Year 2's seven, then find a number, groups of, half of and which fraction is bigger: {y3['ASKS']}")
check(y3['FORMS'] == ['facts', 'TO+O', 'TO+T', 'TO-O', 'TO-T', 'O+O+O', 'TO+TO', 'TO-TO', 'missing', 'bond', 'table', 'divide',
                      'HTO+O', 'HTO+T', 'HTO+H', 'HTO-O', 'HTO-T', 'HTO-H', 'estimate', 'TO*O', 'TO/O', 'frac'], f"sum forms, Year 3's after Year 2's: {y3['FORMS']}")
check(y3['fracText'] == ['3/10', '1', '1 3/10', '0', '2', '4/8', '1/2', '6/7'],
      f"a line of parts written as it is counted (tenths stay tenths: 4/8, not 1/2), or in simplest form as before: {y3['fracText']}")
check(y3['partsSay'] == ['three tenths', 'one', 'one and three tenths', 'zero', 'one tenth', 'two', 'six sevenths', 'one and one tenth'],
      f"parts said as they're written: {y3['partsSay']}")
# Year 1's questions
check(y3['find50'] == [[n, n] for n in range(0, 51)] and y3['find1000'] == [[n, n] for n in range(100, 1001)],
      f"find the number: 0 to 50 (Y1-01) and 100 to 1000 (Y3-01): {len(y3['find50'])}, {len(y3['find1000'])}")
fpl, fps = y3['findParts']
check(fpl == [0, 0, 0, 0, 1, 1, 1, 1] and fps['partVals'][0][0] >= 51 and fps['partVals'][0][1] <= 100 and fps['partVals'][1][0] <= 50 and fps['partVals'][1][1] <= 100
      and fps['bystep']['0']['lo'] >= 51 and fps['bystep']['0']['hi'] <= 100 and fps['bystep']['1']['lo'] >= 0 and fps['bystep']['1']['hi'] <= 100 and fps['holds'] and fps['spans'] == [10],
      f"numbers to 100 in halves (D-094, D-104): 4 landings on 51 to 100, then 4 on 0 to 100, each on a stretch of 10 inside its half: {fpl}, {fps['partVals']}")
check(y3['next1'] == [seqs([1], 'any', 0, 100, 'forward'), seqs([1], 'any', 0, 100, 'backward')] and [len(x) for x in y3['next1']] == [98, 98],
      f"what comes next: count on or back in ones from any number, 0 to 100: {[len(x) for x in y3['next1']]}")
c1 = seqs([2, 5, 10], 0, 0, 100, 'forward')
check(y3['count1'] == c1 and len(c1) == 48 + 18 + 8, f"count in 2s, 5s and 10s from 0 to 100, forward (Year 1 counts in multiples): {len(y3['count1'])} (by hand: 48 + 18 + 8)")
check(y3['words20'] == [[n, n] for n in range(1, 21)], f"number words 1 to 20: {len(y3['words20'])}")
check(y3['oneMore'] == [[['more', 1, n, n + 1] for n in range(0, 100)], [['less', 1, n, n - 1] for n in range(1, 101)]],
      f"one more or one less, 0 to 100: {[len(x) for x in y3['oneMore']]}")
check(y3['groups'] == [[g, sz, g * sz] for sz in (2, 5, 10) for g in range(1, 6)], f"groups of 2, 5 and 10, 1 to 5 groups: {len(y3['groups'])}")
check(y3['groupLines'] == [{'from': 0, 'to': 5 * sz, 'step': sz, 'label_every': sz} for sz in (2, 5, 10)],
      f"each group size lands on its own line, 0 to 5 lots in its steps: {y3['groupLines']}")
want_share = [[t, g, t // g] for g in (2, 5, 10) for t in range(g, 21, g)]
check(y3['share'] == want_share and len(want_share) == 16, f"share 20 or fewer between 2, 5 or 10 plates, whole shares: {len(y3['share'])} (10 + 4 + 2)")
check(y3['halves1'] == [[1, 2, lk, 4, 2] for lk in (0, 1)] + [[1, 4, lk, 4, 1] for lk in (0, 1)], f"halves and quarters of shapes, on a line of quarters: {y3['halves1']}")
check(y3['half20'] == [[1, 2, t, t // 2] for t in range(2, 21, 2)], f"half of 2 to 20: {len(y3['half20'])}")
check(y3['doubles'] == [['double', n, 2 * n] for n in range(1, 11)] + [['half', 2 * n, n] for n in range(1, 11)],
      f"doubles of 1 to 10 and halves of 2 to 20: {len(y3['doubles'])}")
check(all(len(x) == 8 and set(x) == {'double', 'half'} and all(x[i] != x[i + 1] for i in range(7)) for x in y3['planDoubles']),
      f"doubles and halves take turns: {y3['planDoubles']}")
# Year 3's questions
check(y3['place3'] == [[n, n] for n in range(100, 1000)], f"hundreds, tens and ones: every 3-digit number: {len(y3['place3'])}")
check(y3['sign1000'] == [[['range', 'more', n, None] for n in range(3, 998)], [['range', 'fewer', n, None] for n in range(3, 998)], [['ask', 'same', n, n] for n in range(3, 998)]],
      f"<, > and = on 3 to 997 inside 0 to 1000: {[len(x) for x in y3['sign1000']]}")
m3 = [[['more', by, n, n + by] for by in (10, 100) for n in range(0, 1001 - by)], [['less', by, n, n - by] for by in (10, 100) for n in range(by, 1001)]]
check(y3['more1000'] == m3 and [len(x) for x in m3] == [991 + 901] * 2, f"10 or 100 more or less, inside 0 to 1000: {[len(x) for x in y3['more1000']]}")
c3 = seqs([4, 8, 50, 100], 0, 0, 1000, 'forward')
check(y3['count3'] == c3 and len(c3) == 248 + 123 + 18 + 8, f"count in 4s, 8s, 50s and 100s from 0 to 1000, forward: {len(y3['count3'])}")
FR16 = [f'{n}/{d}' for d in (2, 3, 4, 5, 8, 10) for n in range(1, d) if gcd(n, d) == 1]
want_am = [[int(f.split('/')[0]), int(f.split('/')[1]), t, t * int(f.split('/')[0]) // int(f.split('/')[1])] for f in FR16 for t in range(int(f.split('/')[1]), 41, int(f.split('/')[1]))]
check(y3['amounts'] == want_am and len(FR16) == 17, f"fractions of amounts: the 17 fractions in simplest form with denominators 2, 3, 4, 5, 8 and 10, of totals to 40, whole answers: {len(y3['amounts'])}")
check(y3['tenths'] == [[s + [10] for s in seqs([1], 'any', 0, 20, d)] for d in ('forward', 'backward')] and [len(x) for x in y3['tenths']] == [18, 18],
      f"counting in tenths between 0 and 2 (0 to 20 tenths), up and down: {[len(x) for x in y3['tenths']]}")
D18 = [2, 3, 4, 5, 6, 8, 10]
want_cmp, gone = [], []
for x in D18:
    for y in D18:
        if x == y:
            continue
        big, small = min(x, y), max(x, y)
        if 12 * (small - big) < big * small:  # 1/big − 1/small under 1/12: the two marks too close to write on an upright phone
            gone.append((big, small))
            continue
        L = big * small // gcd(big, small)
        want_cmp.append([x, y, L, L // big, L // small])
check(y3['compare'] == want_cmp and len(want_cmp) == 30 and sorted(set(gone)) == [(4, 5), (5, 6), (5, 8), (6, 8), (6, 10), (8, 10)],
      f"which is bigger: 15 pairs of unit fractions, both orders, marked on 0 to 1 in their common parts; the 6 pairs closer than 1/12 left out: {len(y3['compare'])}")
check(all(L == {'from': 0, 'to': c[2], 'step': 1, 'label_every': 0, 'labels': f'frac{c[2]}', 'label_at': [c[4], c[3]]} for L, c in zip(y3['compareLines'], want_cmp)),
      f"each pair's line: 0 to 1 in their common parts, only the two fractions written (and 0 and 1): {y3['compareLines'][:2]}")
check(y3['compareRight'] == [[True, False, False, False, False], [True, False, False], [True, True, True, False, False]],
      f"right or wrong: the bigger fraction's mark; a long line's leeway never reaches halfway to the smaller one: {y3['compareRight']}")
ln3 = y3['lines']
# Year 1's on stretches of 10 marks; Year 3's 3-digit numbers and tenths on 7, so an upright phone writes them all (D-103)
INSIDE = {'find50': (0, 50, 10), 'next1': (0, 100, 10), 'count1': (0, 100, 10), 'words20': (1, 20, 10), 'oneMore': (0, 100, 10), 'doubles': (0, 20, 10),
          'find1000': (100, 1000, 6), 'place3': (100, 999, 6), 'sign1000': (0, 1000, 6), 'more1000': (0, 1000, 6), 'count3': (0, 1000, 6),
          'amounts': (0, max(a[3] for a in want_am), 10), 'tenths': (0, 20, 6)}
for k, (wlo, whi, wspan) in INSIDE.items():
    w3 = ln3[k]
    check(w3['n'] == 300 and w3['spans'] == [wspan] and w3['lo'] >= wlo and w3['hi'] <= whi and w3['holds'] and w3['starts'] > 5 and not w3['twice'],
          f"{k}: 300 landings, each on a stretch of {wspan} marks' gaps inside {wlo} to {whi} with its answer on a mark, starting in {w3['starts']} places; never the same question twice running: "
          f"{ {x: w3[x] for x in ('spans', 'steps', 'lo', 'hi', 'holds', 'twice')} }")
check({k: (v['st'], v['len']) for k, v in ln3['count1']['bystep'].items()} == {'2': ([1], [10]), '5': ([1], [10]), '10': ([2], [10])},
      f"counting in 2s and 5s on a stretch in ones, in 10s on a stretch in 2s, so 30 isn't the only ten in view: {ln3['count1']['bystep']}")
check({k: (v['st'], v['len']) for k, v in ln3['count3']['bystep'].items()} == {'4': ([1], [6]), '8': ([1], [6]), '50': ([25], [6]), '100': ([50], [6])},
      f"counting in 4s and 8s on 7 marks in ones (D-103), in 50s on 7 marks in 25s and in 100s on 7 in 50s, so the answer isn't the only fifty or hundred in view: {ln3['count3']['bystep']}")
check(ln3['sign1000']['sides'] and ln3['tenths']['labels'] == ['parts10'] and ln3['tenths']['steps'] == [1] and ln3['find1000']['labels'] == ['plain'],
      f"<, > and = with 3 marks each side; tenths on a line written in tenths: {ln3['tenths']['labels']}")
check(ln3['doubles']['kinds'] == {'double': 150, 'half': 150} and ln3['oneMore']['kinds'] == {'more': 150, 'less': 150},
      f"doubles and halves, and one more and one less, half each: {ln3['doubles']['kinds']}, {ln3['oneMore']['kinds']}")
check({k: (v['st'], v['len']) for k, v in ln3['groups']['bystep'].items()} == {'2': ([2], [5]), '5': ([5], [5]), '10': ([10], [5])} and ln3['groups']['holds'],
      f"groups of 2, 5 and 10 on their own lines (0 to 5 lots): {ln3['groups']['bystep']}")
check(ln3['compare']['holds'] and ln3['compare']['labels'] and all(lb.startswith('frac') for lb in ln3['compare']['labels']),
      f"which is bigger: every landing on its pair's fraction line: {ln3['compare']['labels'][:4]}")
sh3 = y3['shares']
check(set(sh3['count1']) == {'2', '5', '10'} and all(150 <= v <= 250 for v in sh3['count1'].values()), f"600 counts: 2s, 5s and 10s about a third each: {sh3['count1']}")
check(set(sh3['count3']) == {'4', '8', '50', '100'} and all(110 <= v <= 190 for v in sh3['count3'].values()), f"600 counts: 4s, 8s, 50s and 100s about a quarter each: {sh3['count3']}")
check(set(sh3['more1000']) == {'10', '100'} and all(240 <= v <= 360 for v in sh3['more1000'].values()), f"600 questions: 10 or 100 more or less, about half each: {sh3['more1000']}")
check(set(sh3['groups']) == {'2', '5', '10'} and all(150 <= v <= 250 for v in sh3['groups'].values()), f"600 groups: of 2, 5 and 10 about a third each: {sh3['groups']}")
check(set(sh3['share']) == {'2', '5', '10'} and all(150 <= v <= 250 for v in sh3['share'].values()), f"600 shares: 2, 5 and 10 plates about a third each: {sh3['share']}")
check(set(sh3['amounts']) == {'2', '3', '4', '5', '8', '10'} and all(60 <= v <= 140 for v in sh3['amounts'].values()),
      f"600 fractions of amounts: each denominator about a sixth (picked first, so fifths, eighths and tenths don't swamp halves): {sh3['amounts']}")
# Year 1's and Year 3's sums
F13 = lambda a, op, b, ans, op2=None, c=None, miss=None, res=None, flip=None, den=None, rnd=None, exact=None: [a, op, b, op2, c, miss, res, ans, flip, den, rnd, exact]  # noqa: E731
y3s = o['y13sums']
check(srt(y3s['bond10']) == srt([F13(a, '+', 10 - a, 10 - a, miss='b', res=10) for a in R(1, 10)]), f"bonds to 10: 1 + ? to 9 + ?: {len(y3s['bond10'])}")
up10 = lambda a, b: a < 10 < a + b  # noqa: E731
down10 = lambda a, b: a > 10 > a - b  # noqa: E731
add20 = [F13(a, '+', b, a + b) for a in R(21) for b in R(min(9, 20 - a) + 1)]
sub20 = [F13(a, '−', b, a - b) for a in R(21) for b in R(min(9, a) + 1)]
check(srt(y3s['add20']) == srt([f for f in add20 if not up10(f[0], f[2])]) and srt(y3s['add20x']) == srt([f for f in add20 if up10(f[0], f[2])])
      and [len(y3s['add20']), len(y3s['add20x'])] == [129, 36],
      f"adding to 20 (a number and 0 to 9): not crossing 10 (129), then crossing (36, e.g. 7 + 5): {len(y3s['add20'])}, {len(y3s['add20x'])}")
check(srt(y3s['sub20']) == srt([f for f in sub20 if not down10(f[0], f[2])]) and srt(y3s['sub20x']) == srt([f for f in sub20 if down10(f[0], f[2])])
      and [len(y3s['sub20']), len(y3s['sub20x'])] == [129, 36],
      f"taking 0 to 9 from 20 or less: not crossing 10 (129), then crossing (36, e.g. 13 − 5): {len(y3s['sub20'])}, {len(y3s['sub20x'])}")
check(srt(y3s['bond20']) == srt([F13(a, '+', 20 - a, 20 - a, miss='b', res=20) for a in R(1, 20)]), f"bonds to 20: {len(y3s['bond20'])}")
base20 = [F13(a, '+', b, a + b) for a in R(21) for b in R(21 - a)] + [F13(a, '−', b, a - b) for a in R(21) for b in R(a + 1)]
want_m20 = [F13(f[0], f[1], f[2], f[7] if h == 'answer' else (f[0] if h == 'a' else f[2]), miss=h, res=f[7], flip=True if fl else None)
            for f in base20 for h in ('a', 'b', 'answer') for fl in (False, True)]
check(srt(y3s['miss20']) == srt(want_m20) and len(want_m20) == 462 * 6,
      f"missing numbers to 20: the first, the second or the answer hidden, each written both ways round ('7 = ? − 9'): {len(y3s['miss20'])} (462 sums x 3 x 2)")
check(y3s['texts'] == ['7 = ? − 9', '7 + 5 = ?', '? = 7 + 5', '10 = 6 + ?', '5/7 + 1/7', '3/8 − 3/8'], f"sums written: {y3s['texts']}")
HH = R(100, 1000)
ho = [F13(a, '+', b, a + b) for a in HH for b in R(1, 10) if a + b <= 1000]
ht = [F13(a, '+', b, a + b) for a in HH for b in R(10, 100, 10) if a + b <= 1000]
hh = [F13(a, '+', b, a + b) for a in HH for b in R(100, 1000, 100) if a + b <= 1000]
check([srt(x) for x in y3s['htoAdd']] == [srt([f for f in ho if f[0] % 10 + f[2] < 10] + [f for f in ht if f[0] % 100 + f[2] < 100] + hh),
                                          srt([f for f in ho if f[0] % 10 + f[2] >= 10] + [f for f in ht if f[0] % 100 + f[2] >= 100])],
      f"mental adding to 1000 in halves (D-094): HTO + ones, tens and hundreds not crossing a ten or hundred, then HTO + ones crossing a ten and + tens crossing a hundred: {[len(x) for x in y3s['htoAdd']]}")
mo = [F13(a, '−', b, a - b) for a in HH for b in R(1, 10)]
mt = [F13(a, '−', b, a - b) for a in HH for b in R(10, 100, 10)]
mh = [F13(a, '−', b, a - b) for a in HH for b in R(100, 1000, 100) if b <= a]
check([srt(x) for x in y3s['htoSub']] == [srt([f for f in mo if f[0] % 10 >= f[2]] + [f for f in mt if f[0] % 100 >= f[2]] + mh),
                                          srt([f for f in mo if f[0] % 10 < f[2]] + [f for f in mt if f[0] % 100 < f[2]])],
      f"mental taking away in halves: not crossing a ten or hundred back, then crossing: {[len(x) for x in y3s['htoSub']]}")
check(y3s['halves'] == [[0, 0, 0, 0, 1, 1, 1, 1]] * 2, 'HTO + and − sums: 4 landings not crossing, then 4 crossing (D-094)')
check(srt(y3s['pairs100']) == srt([F13(a, '+', 100 - a, 100 - a, miss='b', res=100) for a in R(5, 100, 5)]), f"pairs to 100 in 5s: 5 + ? to 95 + ?: {len(y3s['pairs100'])}")
want_big2 = [F13(a, '+', b, a + b) for a in R(10, 100) for b in R(10, 100)] + [F13(a, '−', b, a - b) for a in R(10, 100) for b in R(10, 100) if b <= a]
check(srt(y3s['big2']) == srt(want_big2) and len(want_big2) == 8100 + 4095, f"big 2-digit sums: TO + TO (answers to 198) and TO − TO: {len(y3s['big2'])}")


def near_r(v, r):
    return (v // r) * r + (r if v % r > r // 2 else 0)


want_est = []
for r, nums, top in ((10, [v for v in R(10, 100) if v % 10 != 5], 200), (100, [v for v in R(100, 1000) if abs(v - near_r(v, 100)) <= 10], 1000)):
    for a in nums:
        for b in nums:
            if a % r == 0 and b % r == 0:
                continue
            for op in ('+', '−'):
                if op == '−' and b > a:
                    continue
                ex = a + b if op == '+' else a - b
                if ex > top or ex % r == r // 2:
                    continue
                est = near_r(ex, r)
                if est == 0 or est != (near_r(a, r) + near_r(b, r) if op == '+' else near_r(a, r) - near_r(b, r)):
                    continue
                want_est.append(F13(a, op, b, est, rnd=r, exact=ex))
check(srt(y3s['est']) == srt(want_est) and len(want_est) == 4860 + 2170 + 14320 + 15950,
      f"estimates: two 2-digit numbers (no 5s) to the nearest 10, two 3-digit numbers within 10 of a hundred to the nearest 100; only where rounding first and rounding the answer agree, never 0: {len(y3s['est'])}")


def table13(t):
    return [F13(t, '×', n, t * n) for n in R(1, 13)] + [F13(n, '×', t, t * n) for n in R(1, 13) if n != t]


check([srt(y3s[k]) for k in ('t4', 't8', 't3')] == [srt(table13(4)), srt(table13(8)), srt(table13(3))], 'the 4, 8 and 3 times tables to × 12, both ways round, 23 sums each (D-099)')
check(srt(y3s['div348']) == srt([F13(t * q, '÷', t, q) for t in (3, 4, 8) for q in R(1, 13)]), f"dividing by 3, 4 and 8, answers 1 to 12: {len(y3s['div348'])}")
seen13, mx = set(), []
for t in (2, 3, 4, 5, 8, 10):
    for n in R(1, 13):
        for a, b in ((t, n), (n, t)) if n != t else ((t, n),):
            if (a, b) not in seen13:
                seen13.add((a, b))
                mx.append(F13(a, '×', b, a * b))
mx += [F13(t * q, '÷', t, q) for t in (2, 3, 4, 5, 8, 10) for q in R(1, 13)]
check(srt(y3s['mixed']) == srt(mx), f"mixed tables: × of the 2, 3, 4, 5, 8 and 10 tables to × 12 (each sum once: 3 × 8 isn't counted twice) and ÷ by them: {len(y3s['mixed'])} (want {len(mx)})")
check(srt(y3s['toxo']) == srt([F13(a, '×', b, a * b) for a in R(11, 31) for b in R(2, 6)]), f"TO × O: 11 to 30 times 2 to 5: {len(y3s['toxo'])}")
want_todo = [F13(n, '÷', d, n // d) for d in (2, 3, 4, 5, 8) for n in R(10, 100) if n % d == 0]
check(srt(y3s['todo']) == srt(want_todo), f"TO ÷ O: 2-digit numbers divided exactly by 2, 3, 4, 5 or 8: {len(y3s['todo'])}")
want_fr = [F13(a, '+', b, a + b, den=d) for d in R(2, 11) for a in R(1, d) for b in R(1, d) if a + b <= d] + \
    [F13(a, '−', b, a - b, den=d) for d in R(2, 11) for a in R(1, d) for b in R(1, a + 1)]
check(srt(y3s['frac']) == srt(want_fr) and len(want_fr) == 330, f"adding and taking away fractions with the same denominator (2 to 10), within one whole: {len(y3s['frac'])}")
l3 = y3s['lines']
# Year 1's sums on stretches of 10 marks; Year 3's that reach 100 or more on 7 (D-103), TO ÷ O's 2-digit answers on 10
for k, (shapes, whi) in {'add20': (['10x1'], 20), 'bond20': (['10x1'], 19), 'miss20': (['10x1'], 20), 'htoAdd': (['6x1'], 1000), 'htoSub': (['6x1'], 999),
                         'big2': (['6x1'], 198), 'mixed': (['6x1'], 120), 'toxo': (['6x1'], 150), 'todo': (['10x1'], 49)}.items():
    check(l3[k]['holds'] and l3[k]['shapes'] == shapes and l3[k]['hi'] <= whi and l3[k]['starts'] > 5 and not l3[k]['twice'],
          f"{k}: 300 sums, each on a stretch of {shapes[0].split('x')[0]} gaps inside 0 to {whi} with the answer on it, never the same sum twice running: {l3[k]}")
check(l3['est']['holds'] and l3['est']['shapes'] == ['10x100', '6x10'] and l3['est']['hi'] <= 1000 and l3['est']['labels'] == ['plain'],
      f"estimates land on 7 marks in tens (D-103), or on 0 to 1000 in hundreds: {l3['est']}")
check(l3['frac']['holds'] and l3['frac']['shapes'] == sorted(f'{d}x1' for d in R(2, 11)) and l3['frac']['labels'] == sorted(f'parts{d}' for d in R(2, 11)),
      f"fraction sums land on 0 to 1 in their parts, written as they're counted: {l3['frac']['shapes']}")
check(y3s['fixed'] == [{'from': 0, 'to': 10, 'step': 1, 'label_every': 1}, {'from': 0, 'to': 100, 'step': 5, 'label_every': 10}, {'from': 0, 'to': 48, 'step': 4, 'label_every': 4},
                       {'from': 0, 'to': 96, 'step': 8, 'label_every': 8}, {'from': 0, 'to': 36, 'step': 3, 'label_every': 3}, {'from': 0, 'to': 12, 'step': 1, 'label_every': 1}],
      f"lines of their own: bonds to 10 on 0 to 10; pairs to 100 on 0 to 100 in fives, every ten written; the 4, 8 and 3 tables in their steps; ÷ 3, 4, 8 on 0 to 12: {y3s['fixed']}")
el = y3s['estLines']
check(el[0] == {'from': 0, 'to': 1000, 'step': 100, 'label_every': 100} and all(x['step'] == 10 and x['to'] - x['from'] == 60 and x['from'] % 10 == 0 and x['from'] <= a <= x['to'] and x['to'] <= 200
                                                                                 for x, a in zip(el[1:], (90, 200, 10))),
      f"an estimate's line: 0 to 1000 in hundreds; or 7 marks in tens holding the ten, inside 0 to 200 (D-103): {el}")
check(y3s['fracLines'] == [{'from': 0, 'to': d, 'step': 1, 'label_every': 1, 'labels': f'parts{d}'} for d in (2, 7, 10)], f"a fraction sum's line: 0 to 1 in its parts: {y3s['fracLines']}")
s3 = y3s['shares']
check(set(s3['est']) == {'r10', 'r100'} and all(240 <= v <= 360 for v in s3['est'].values()), f"600 estimates: to the nearest 10 and 100 about half each: {s3['est']}")
check(set(s3['todo']) == {'2', '3', '4', '5', '8'} and all(80 <= v <= 160 for v in s3['todo'].values()), f"600 TO ÷ O: each divisor about a fifth: {s3['todo']}")
check(set(s3['frac']) == {str(d) for d in R(2, 11)} and all(35 <= v <= 100 for v in s3['frac'].values()), f"600 fraction sums: each denominator about a ninth: {s3['frac']}")
check(set(s3['hto']) == {'HTO+O', 'HTO+T', 'HTO+H'} and all(150 <= v <= 250 for v in s3['hto'].values()), f"600 HTO sums not crossing: + ones, tens and hundreds about a third each: {s3['hto']}")
check(set(s3['miss20']) == {'a', 'b', 'answer', 'a/flip', 'b/flip', 'answer/flip'} and all(60 <= v <= 140 for v in s3['miss20'].values()),
      f"600 missing numbers: the first, second or answer hidden, half written answer first: {s3['miss20']}")
check(y3s['twice'] == [0, 0, 0, 0], f"never the same sum twice running (missing numbers, estimates, fractions, mixed tables): {y3s['twice']}")
check(y3s['fall'] == [6, None], f"mixed tables fall in 6 s (the notes); the rest as the speed says: {y3s['fall']}")
yf3 = o['y13faces']
check(yf3['find'] == [['', '37'], ['', '347']], f"find the number: the number itself, as Number mode's chip: {yf3['find']}")
check(yf3['groups'] == [['face face-groups', 6, 3, '3 groups of 2'], ['face face-groups', 50, 5, '5 groups of 10'], ['face face-groups', 5, 1, '1 group of 5']],
      f"groups of: each group a row of dots (an array, the notes' show_array): {yf3['groups']}")
check(yf3['half'] == [['face face-half', 14, 2, 'half of 14'], ['face face-half', 2, 2, 'half of 2']], f"half of: the dots in two groups: {yf3['half']}")
check(yf3['double10'] == 20, f"double 10: 10 dots twice: {yf3['double10']}")
check(yf3['place'] == [['face face-place', 3, 4, 7, 'H T O'], ['face face-place', 9, 0, 5, 'H T O'], ['face face-place', 1, 0, 0, 'H T O']] and yf3['place34'] == [3, 4, 0],
      f"hundreds, tens and ones: counters in a place-value chart (H, T, O); 2-digit numbers keep their rods and ones: {yf3['place']}, {yf3['place34']}")
check(yf3['moreLess'] == ['100 more than 347', '10 less than 347', '1 more than 6'], f"10 or 100 more or less, and one more as before: {yf3['moreLess']}")
check(yf3['tenths'] == [[3, '7 10 8 10 9 10 ?'], [3, '1 3 10 1 2 10 1 1 10 ?']], f"counting in tenths: three tenths written one over the other, then the box: {yf3['tenths']}")
check(yf3['compare'] == [2, 'Which is bigger? 1 3 or 1 5'], f"which is bigger: the two fractions: {yf3['compare']}")
check(yf3['share10'] == [20, 10], f"20 sweets shared by 10 plates: {yf3['share10']}")
check(yf3['partsHtml'] == ['3 10', '1 3 10', '1', '0'] and yf3['fracSum'] == [2, '5 7 + 1 7'], f"tenths and fraction sums written: {yf3['partsHtml']}, {yf3['fracSum']}")

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
# GC4, D-120: link.js alone may import from outside games/_common/, and only P-020's shared/bridge.js.
LINK = os.path.join(COMMON, 'link.js')
BRIDGE = "import { connect } from '../../../shared/bridge.js';"
for folder, rx in OUTSIDE.items():
    where = os.path.relpath(folder, REPO)
    for f in sorted(os.listdir(folder)):
        if not f.endswith('.js'):
            continue
        raw = open(os.path.join(folder, f), encoding='utf-8').read()
        body = re.sub(r'(?m)^\s*//.*$', '', raw)
        if os.path.join(folder, f) == LINK:  # GC4, D-120: the one import from outside, P-020's bridge
            check(body.count(BRIDGE) == 1, f'{where}/{f} imports shared/bridge.js once (GC4): {body.count(BRIDGE)}')
            body = body.replace(BRIDGE, '')
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
