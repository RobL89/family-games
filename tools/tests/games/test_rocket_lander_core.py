"""Rocket Lander's pure core and its boundaries. Version 1.5.

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
STRICT = [(GAME, 'sums-levels.js'), (GAME, 'sums.js'), (GAME, 'map.js')]
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
const sampleOk = (lv) => {
  const r = (ROWS[lv.kind] || [])[lv.level - 1], sm = lv.sample || {};
  if (!r) return 'no row';
  if (lv.kind === 'number') {
    const ln = N.makeLine({ from: r.from, to: r.to, step: 1 }), on = (v) => Number.isInteger(v) && v >= ln.from && v <= ln.to;
    if (sm.rule === 'any') return r.mix.any > 0 && on(sm.value) ? 'ok' : 'any not asked or off the line';
    if (sm.rule === 'dice') return r.mix.dice > 0 && on(sm.value) && sm.value >= 1 && sm.value <= 6 ? 'ok' : 'dice not asked or not 1 to 6';
    if (sm.rule === 'parity') return r.mix.parity > 0 && ['even', 'odd'].includes(sm.parity) ? 'ok' : 'even or odd not asked';
    return 'unknown rule';
  }
  const m = /^(\d+) (.) (\d+)$/.exec(sm.sum || '');
  if (sm.rule !== 'sum' || !m || !r.ops.includes(m[2])) return 'not a sum of the level\'s operations';
  const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
  return M.partsOf(r).some((p) => M.facts(op, p).some((f) => f.a === a && f.b === b)) ? 'ok' : 'a sum the level never asks';
};
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
    standIn: MP.STAND_IN,
    systems: MP.SYSTEMS.map((sys) => ({ id: sys.id, soon: !!sys.soon, levels: sys.levels.map((lv) => [lv.kind, lv.level]),
      about: sys.levels.map((lv) => lv.about), samples: sys.levels.map(sampleOk) })),
  },
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
        'close_enough': 0, 'landings_per_round': 8, 'speed': 2}
check(o['defaults'] == want and o['defaultNotes'] == [], f'built-in defaults as in the games pack\'s table ({o["defaults"]})')
g = o['given']['values']
check(g['from'] == -20 and g['to'] == 1000 and g['step'] == 1 and g['show_as'] == 'decimal' and g['speak'] is False and g['speed'] == 1
      and 'extra' not in g, f'given settings: kept in range, odd ones fall back, unknown ones ignored ({g})')
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

# ---------- The map of solar systems (map.js, D-058, D-068): stand-in levels ----------
mp = o['map']
check(bool(mp['standIn']) and 'stand-in' in mp['standIn'].lower(), f"map.js is marked stand-in until the level plan: {mp['standIn']!r}")
check([x['id'] for x in mp['systems']] == ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'],
      f"six systems, in the planets' order: {[x['id'] for x in mp['systems']]}")
moon, dust = mp['systems'][0], mp['systems'][1]
check(moon['levels'] == [['number', n] for n in range(1, 9)] and not moon['soon'], f"Moon holds Number mode's eight levels, 1 to 8 (D-068): {moon['levels']}")
check(dust['levels'] == [['sums', n] for n in range(1, 9)] and not dust['soon'], f"Red Dust holds the eight sums levels, 1 to 8 (D-068): {dust['levels']}")
check(all(x['soon'] and x['levels'] == [] for x in mp['systems'][2:]), 'Candy, Ice, Jungle and Ringed are coming soon, with no levels yet')
check(all(isinstance(t, str) and 0 < len(t) <= 32 for x in mp['systems'] for t in x['about']),
      f"every level says what it asks, in a few words (32 letters at most): {[t for x in mp['systems'] for t in x['about'] if not (isinstance(t, str) and 0 < len(t) <= 32)]}")
bad = [(x['id'], i + 1, r) for x in mp['systems'] for i, r in enumerate(x['samples']) if r != 'ok']
check(not bad, f'every level\'s sample chip is a target the level can ask: {bad}')
check(not os.path.exists(os.path.join(REPO, 'games', 'rocket-sums')), 'games/rocket-sums/ is retired: the sums tile is part of Rocket Lander now (D-058)')

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
