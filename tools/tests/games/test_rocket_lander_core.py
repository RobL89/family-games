"""Rocket Lander's pure core and its boundaries. Version 1.2.

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
CORE = [(COMMON, 'numbers.js'), (COMMON, 'settings.js'), (COMMON, 'planets.js'), (GAME, 'levels.js'), (GAME, 'rules.js')]
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
  levelOf: [3, '3', 8, null, undefined, 0, 9, 2.5, 'x'].map((g) => { const r = RU.levelOf(L.LEVELS, g); return [r.level, r.note]; }),
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
  follow: (() => { const sc = RU.followLevel(S.SETTINGS, ['from', 'to', 'label_every']); return {
    defaults: S.resolveSettings(sc).values, notes: S.resolveSettings(sc).notes, given: S.resolveSettings(sc, { from: 3, to: 'x', label_every: 2 }),
    sharedUntouched: S.SETTINGS.from.default === 0 }; })(),
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

KEEPS = r'''|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|EventSource'''
# D-036: a game may import from games/_common/ and nothing else outside its folder;
# a shared folder in games/_common/ may import nothing from outside itself.
OUTSIDE = {
    GAME: re.compile(r'''from\s+['"]\.\./(?!_common/[\w-]+/[\w-]+\.js['"])|from\s+['"]\.\./_common/[^'"]*\.\./|import\(\s*['"]\.\./''' + KEEPS),
    COMMON: re.compile(r'''from\s+['"]\.\./|import\(\s*['"]\.\./''' + KEEPS),
}
for folder, rx in OUTSIDE.items():
    where = os.path.relpath(folder, REPO)
    for f in sorted(os.listdir(folder)):
        if not f.endswith('.js'):
            continue
        raw = open(os.path.join(folder, f), encoding='utf-8').read()
        body = re.sub(r'(?m)^\s*//.*$', '', raw)
        hits = sorted({m.group(0) for m in rx.finditer(body)})
        check(not hits, f'{where}/{f} stays in bounds and keeps nothing on the device' + (f': {hits}' if hits else ''))
html = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
urls = sorted(set(re.findall(r'(?:src|href)="([^"]+)"', html)))
far = [u for u in urls if re.match(r'(https?:)?//', u) and not re.match(r'https://fonts\.(googleapis|gstatic)\.com', u)]
up = [u for u in urls if u.startswith('../') and not re.match(r'\.\./_common/[\w-]+/[\w.-]+$', u)]
check(not far and not up, f'index.html loads only its own files, games/_common/ and the web font: {urls}')

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
