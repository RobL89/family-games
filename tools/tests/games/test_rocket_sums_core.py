"""Rocket Sums' pure core and its boundaries. Version 1.2.

Changes at v1.2 (step 2a-3): index.html may load nothing from outside the site, the web font
included, and links the shipped font (D-043).

Changes at v1.1: levels 1 and 2 play in two halves (D-040, Rob, 2026-11-09: "make level 1
split so that the first half is plus to 5 and the second half is plus to 10. then make level
2 split with minus to 5 then minus to 10"): the parts, how a round is split between them,
− to 5 (21 sums), and the line for each half. At most one sum answering 0 a round
(proposed, Q-022): makeSum leaves them out when asked to.

Fast checks, no browser. Node runs games/rocket-sums/levels.js and sums.js and compares them
with values worked out by hand from the decisions:
  - the level table, row by row, against D-039 (Rob, 2026-11-09: "ladder, all 8 levels",
    "first level, start 0-5");
  - the sums each operation can ask: each number up to 10 (D-021), nothing below zero
    (D-024), divide only by 2, 5 or 10 with the answer up to 10 (D-023, D-028), no times
    sums with a 0 (D-033). Counts: + to 5: 21, + to 10: 66, + to 20: 121, -: 66, x: 100,
    / : 33 (claude/rocket-lander-ideas.md's counting code; this chat's counts);
  - sums drawn with a seeded random source: from the level's operations, never the same
    sum twice running;
  - the operations setting overriding the level, and the line laid out for each sum: the
    level's whole line while every answer fits it, otherwise a window of 10 marks with the
    answer inside it, not always at the same place (D-032, D-033);
  - right or wrong landings, and the spot shown after a miss.
Then the boundary checks: the core files are pure, and nothing in games/rocket-sums/
imports from outside its folder except games/_common/ (D-036), fetches or keeps anything
on the device.

Stand-in: Node 22 runs the ES modules in place of the browser.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_sums_core.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'rocket-sums')
CORE = ['levels.js', 'sums.js']
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def code_only(text):
    """The code without its comments, so words in comments don't count."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return re.sub(r'(?m)(^|[^:])//.*$', r'\1', text)


JS = r"""
const L = await import(process.argv[1] + '/levels.js');
const M = await import(process.argv[1] + '/sums.js');
const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const row = (n) => L.LEVELS[n - 1];
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
const out = {
  levels: L.LEVELS.map(({ source, ...r }) => r),
  sources: L.LEVELS.map((r) => r.source),
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
};
console.log(JSON.stringify(out));
"""

r = subprocess.run(['node', '--input-type=module', '-e', JS, GAME], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr.strip()[-2000:])
    check(False, 'Node ran games/rocket-sums/levels.js and sums.js')
    print(f'\n{len(fails)} problem(s)')
    sys.exit(1)
o = json.loads(r.stdout)

# ---------- The level table, against D-039 ----------
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
check(len(o['levels']) == 8, f"8 levels (D-039): {len(o['levels'])}")
for w, g in zip(want, o['levels']):
    check(g == w, f"level {w['level']} as D-039{' and D-040' if w['level'] < 3 else ''}: {g}")
check(all('D-039' in s for s in o['sources']), 'every level names its source, D-039')
check(all('D-040' in s for s in o['sources'][:2]), 'levels 1 and 2 name D-040')

# ---------- The sums each operation can ask ----------
f = o['facts']
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

# ---------- The operations setting ----------
check(o['parse'] == [['+'], ['+', '−'], ['+', '−', '×'], ['+', '−', '×', '÷'], ['×', '÷'], [], [], []],
      f"operations read from a setting's text: {o['parse']}")
check(o['opsFor'] == [['+'], ['+', '−', '×'], ['+', '−', '×', '÷']], f"no setting: the level's; a setting overrides it: {o['opsFor']}")
check(o['options'] == ['+', '+ −', '+ − ×', '+ − × ÷'], f"the setting's choices: {o['options']}")

# ---------- Sums drawn with a seeded random source ----------
d = o['draws']
check({s['op'] for s in d['l1']} == {'+'} and all(s['answer'] <= 5 for s in d['l1']), "level 1's first half: + with answers up to 5 only")
check({s['op'] for s in d['l3']} == {'+', '−'} and all(0 <= s['answer'] <= 10 for s in d['l3']), 'level 3: + and −, answers 0 to 10')
check({s['op'] for s in d['l8']} == {'+', '−', '×', '÷'}, f"level 8: all four operations come up in 200 sums: {sorted({s['op'] for s in d['l8']})}")
check(all(s['text'] == f"{s['a']} {s['op']} {s['b']}" for s in d['l8']), 'each sum carries its text')
check(d['same'], 'the same seed draws the same sums (no randomness of its own)')


def twice(v):
    return any(i and (s['a'], s['op'], s['b']) == (v[i - 1]['a'], v[i - 1]['op'], v[i - 1]['b']) for i, s in enumerate(v))


check(not any(twice(v) for v in (d['l1'], d['l3'], d['l8'])), 'never the same sum twice running')

# ---------- The line for each sum ----------
ln = o['lines']
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

# ---------- Right or wrong ----------
check(o['right'] == [True, False, True, True], f"right on the answer, wrong beside it, leeway honoured: {o['right']}")
check(o['goal'] == 12, 'after a miss the answer is shown')
check(o['text'] == ['3 + 4', '20 ÷ 2'], f"sum text: {o['text']}")

# ---------- Levels 1 and 2 in two halves (D-040) ----------
p1, p2, n4 = o['parts']
check([(p['plus_max'], p['to'], p['ops']) for p in p1] == [(5, 5, ['+']), (10, 10, ['+'])], f"level 1's halves: + to 5 on 0 to 5, then + to 10 on 0 to 10: {p1}")
check([(p['minus_max'], p['to'], p['ops']) for p in p2] == [(5, 5, ['−']), (10, 10, ['−'])], f"level 2's halves: − to 5 on 0 to 5, then − to 10 on 0 to 10: {p2}")
check(n4 == 1, 'a level without parts is one part')
check(o['split'] == [[0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 0, 0, 1, 1, 1], [0, 0, 1], [0] * 8],
      f"a round's landings split into halves, the first half the bigger when odd: {o['split']}")
check(o['partLines'] == [{'from': 0, 'to': 5, 'step': 1, 'label_every': 1}, {'from': 0, 'to': 10, 'step': 1, 'label_every': 1}] * 2,
      f"each half on its own line: {o['partLines']}")

# ---------- At most one 0 a round (proposed, Q-022) ----------
check(o['noZero'] == 0, f"asked to, makeSum leaves out sums answering 0 (− to 5, 300 draws): {o['noZero']} zeros")
check(o['zeroOnly'] == 0, 'if every sum answers 0, one is still asked rather than none')

# ---------- Boundaries ----------
IMPURE = re.compile(r'\b(import|document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|'
                    r'performance|Date|eval|Function|setTimeout|setInterval|requestAnimationFrame|navigator|location)\b|Math\.random')
for name in CORE:
    hits = sorted({m.group(0) for m in IMPURE.finditer(code_only(open(os.path.join(GAME, name), encoding='utf-8').read()))})
    check(not hits, f'{name} is pure' + (f': {hits}' if hits else ''))
KEEPS = r'''|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|EventSource'''
OUTSIDE = re.compile(r'''from\s+['"]\.\./(?!_common/[\w-]+/[\w-]+\.js['"])|from\s+['"]\.\./_common/[^'"]*\.\./|import\(\s*['"]\.\./''' + KEEPS)
for name in sorted(os.listdir(GAME)):
    if name.endswith('.js'):
        body = re.sub(r'(?m)^\s*//.*$', '', open(os.path.join(GAME, name), encoding='utf-8').read())
        hits = sorted({m.group(0) for m in OUTSIDE.finditer(body)})
        check(not hits, f'games/rocket-sums/{name} stays in bounds and keeps nothing on the device' + (f': {hits}' if hits else ''))
html = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
urls = sorted(set(re.findall(r'(?:src|href)="([^"]+)"', html)))
far = [u for u in urls if re.match(r'(https?:)?//', u)]
up = [u for u in urls if u.startswith('../') and not re.match(r'\.\./_common/[\w-]+/[\w.-]+$', u)]
check(not far and not up, f'index.html loads only its own files and games/_common/, nothing from outside (D-043): {urls}')
check('../_common/fonts/fredoka.css' in urls, 'index.html links the shipped font (D-043)')

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
