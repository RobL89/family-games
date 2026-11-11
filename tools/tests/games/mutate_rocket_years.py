"""Bench, not part of the close: plants faults in Year 1's and Year 3's levels (step 2c-3c) and counts how
many the tests catch. Version 1.0. Built like mutate_rocket_map.py 1.0.

Only this step's new code is faulted (D-057): the questions (asks.js 1.2), sums (sums.js 1.4), faces
(faces.js 1.2), parts written as counted (numbers.js 1.2) and the map's rows (map.js 2.2), by the core
test (seconds each); and four in the browser side (game.js 3.4, scene.js 1.6, game.css 2.3), by the step's
browser test at the one screen size that shows each (about 7 minutes each). Each fault is one exact text
change in a copy of the repo's games/ and tools/tests/games/ folders (a temporary folder); the repo itself
is never changed. A fault whose text isn't found exactly once is an error, not a catch.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_years.py [--fast]
--fast skips the faults that need the browser test.
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G, C = 'games/rocket-lander/', 'games/_common/rocket/'
CORE, Y13 = 'test_rocket_lander_core.py', 'test_rocket_lander_year1_year3_e2e.py'

FAULTS = [
    # the questions (asks.js 1.2)
    ('find asks one past its top', G + 'asks.js', "return between(lo, hi).map((n) => ({ rule: 'ask', ask: 'find', n, value: n }));",
     "return between(lo, hi + 1).map((n) => ({ rule: 'ask', ask: 'find', n, value: n }));", CORE),
    ('a row in parts always plays its first part', G + 'asks.js', 'return { ...base, ...parts[Math.min(parts.length - 1, Math.max(0, k || 0))] };',
     'return { ...base, ...parts[0] };', CORE),
    ('10 or 100 more or less is always 1', G + 'asks.js', 'for (const by of row.by || [1]) {', 'for (const by of [1]) {', CORE),
    ("a count's stretch always in ones", G + 'asks.js', 'const st = (row.stretch && T && T.step !== undefined && row.stretch[T.step]) || 1;', 'const st = 1;', CORE),
    ('groups land on a line in ones', G + 'asks.js', "if (T.ask === 'groups') return { from: 0, to: (p.max_groups ?? 5) * T.size, step: T.size, label_every: T.size };",
     "if (T.ask === 'groups') return { from: 0, to: (p.max_groups ?? 5) * T.size, step: 1, label_every: T.size };", CORE),
    ('sharing only between the first number of plates', G + 'asks.js', 'for (const g of [].concat(row.groups ?? 2))', 'for (const g of [].concat(row.groups ?? 2).slice(0, 1))', CORE),
    ('halves never asked with the doubles', G + 'asks.js', "if (row.halves && kind !== 'double') for", 'if (false) for', CORE),
    ('pairs of fractions too close to read are kept', G + 'asks.js', 'if (gd * (small - big) < gn * big * small) continue;', 'if (false) continue;', CORE),
    ('the smaller fraction is the answer', G + 'asks.js', "value: parts / big, other: parts / small });", "value: parts / small, other: parts / big });", CORE),
    ("a long line's leeway reaches the smaller fraction", G + 'asks.js', "const room = T.ask === 'frac-compare' ? Math.max(0, Math.min(allowed, (T.value - T.other) / 2 - 1e-6)) : allowed;",
     'const room = allowed;', CORE),
    ('fractions of amounts picked by fraction, not denominator', G + 'asks.js', ": T.ask === 'frac-of' ? (row.pick === 'den' ? T.den : `${T.num}/${T.den}`)",
     ": T.ask === 'frac-of' ? `${T.num}/${T.den}`", CORE),
    ('a count in tenths forgets its tenths', G + 'asks.js', 'if (t.every((v) => v >= lo && v <= hi)) out.push(row.den ? {', 'if (t.every((v) => v >= lo && v <= hi)) out.push(false ? {', CORE),
    ("doubles and halves don't take turns", G + 'asks.js', "return Array.from({ length: total }, (_, i) => ((i + first) % 2 ? 'half' : 'double'));",
     "return Array.from({ length: total }, () => 'double');", CORE),
    # the sums (sums.js 1.4)
    ('crossing 10 ignored', G + 'sums.js', 'if (keep(row.cross, a < 10 && a + b > 10)) out.push(plus(a, b, form));', 'out.push(plus(a, b, form));', CORE),
    ('the second number not kept to 0 to 9', G + 'sums.js', 'const bmax = row.b_max ?? max;', 'const bmax = max;', CORE),
    ('a missing answer hides the second number', G + 'sums.js', "answer: hide === 'answer' ? f.answer : f[hide]", "answer: hide === 'answer' ? f.b : f[hide]", CORE),
    ('sums never written answer first', G + 'sums.js', 'for (const flip of row.flip ? [false, true] : [false]) {', 'for (const flip of [false]) {', CORE),
    ('HTO + tens crossing a ten, not a hundred', G + 'sums.js', 'keep(row.cross, (a % 100) + b >= 100)', 'keep(row.cross, (a % 10) + b >= 10)', CORE),
    ('HTO + hundreds in the crossing half too', G + 'sums.js', 'for (const b of HUNDREDS) if (a + b <= max && keep(row.cross, false)) out.push(plus(a, b, form));',
     'for (const b of HUNDREDS) if (a + b <= max) out.push(plus(a, b, form));', CORE),
    ('estimates where rounding first disagrees', G + 'sums.js', 'if (est === 0 || est !== (op === \'+\' ? nearest(a, r) + nearest(b, r) : nearest(a, r) - nearest(b, r))) continue;',
     'if (est === 0) continue;', CORE),
    ('3-digit estimates from numbers 20 from a hundred', G + 'sums.js', '<= (row.near ?? 10));', '<= (row.near ?? 10) + 10);', CORE),
    ('TO ÷ O with a remainder', G + 'sums.js', "if (a % d === 0) out.push({ a, op: '÷', b: d, answer: a / d, form, group: d });",
     "if (a % d <= 1) out.push({ a, op: '÷', b: d, answer: Math.floor(a / d), form, group: d });", CORE),
    ('fraction take-aways below zero', G + 'sums.js', "if (b <= a) out.push({ a, op: '−', b, den: d, answer: a - b, form, group: d });",
     "if (b <= a + 1) out.push({ a, op: '−', b, den: d, answer: a - b, form, group: d });", CORE),
    ('a sum of two tables asked twice', G + 'sums.js', 'if (!seen.has(k)) { seen.add(k); out.push(', 'if (true) { seen.add(k); out.push(', CORE),
    ("an estimate's stretch of tens one ten short", G + 'sums.js', 'return { from, to: from + span * r, step: r, label_every: r };',
     'return { from, to: from + (span - 1) * r, step: r, label_every: r };', CORE),
    # parts written and said as counted (numbers.js 1.2)
    ('tenths written in simplest form', C + 'numbers.js', 'const g = simplest ? gcd(r, d) : 1;', 'const g = gcd(r, d);', CORE),
    ('parts said without "and"', C + 'numbers.js', 'return w ? `${words(w)} and ${fracSay(r, d)}` : fracSay(r, d);', 'return w ? `${words(w)} ${fracSay(r, d)}` : fracSay(r, d);', CORE),
    # the faces (faces.js 1.2)
    ("the chart's tens and ones swapped", G + 'faces.js', 'const digits = [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10],',
     'const digits = [Math.floor(n / 100) % 10, n % 10, Math.floor(n / 10) % 10],', CORE),
    ('groups drawn as one row', G + 'faces.js', 'const body = Array.from({ length: groups }, (_, r) => {', 'const body = Array.from({ length: 1 }, (_, r) => {', CORE),
    # the map's rows (map.js 2.2)
    ("numbers to 100's halves as D-094 first had them (D-104)", G + 'map.js', 'parts: [{ min: 51, max: 100 }, { min: 0, max: 100 }]', 'parts: [{ min: 0, max: 50 }, { min: 0, max: 100 }]', CORE),
    ('Year 3 back on stretches of 10 (D-103)', G + 'map.js', "const STRETCH7 = { layout: 'stretch', span: 6, label_every: 1 };",
     "const STRETCH7 = { layout: 'stretch', span: 10, label_every: 1 };", CORE),
    # the browser side, by the step's browser test at one size
    ("a fraction of an amount's miss said in parts", G + 'game.js', "const was = T.ask === 'seq' && T.den ?", 'const was = T.den ?', (Y13, 'phone')),
    ('a pair of fractions writes every mark', C + 'scene.js',
     '    this.labelIdx = this.labelAt ? [...new Set([0, line.gaps, ...this.labelAt.map((v) => line.index(v))])].sort((a, b) => a - b) : labelSpots(line, labelEvery);',
     '    this.labelIdx = labelSpots(line, labelEvery);', (Y13, 'phone')),
    ("a fraction sum lands on a line of whole numbers", G + 'game.js', 'lineForSum({ answer: T.value, den: T.den, round: T.round }', 'lineForSum({ answer: T.value, round: T.round }', (Y13, 'phone')),
    ("a fraction sum's chip too tall for a PC", C + 'game.css', '.chip.sum.frac .fr { font-size: .62em; }', '.chip.sum.frac .fr { font-size: .9em; }', (Y13, 'pc')),
]


def run(fault):
    name, path, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='rl-y13-mut-')
    try:
        shutil.copytree(os.path.join(REPO, 'games'), os.path.join(tmp, 'games'))
        shutil.copytree(os.path.join(REPO, 'tools/tests/games'), os.path.join(tmp, 'tools/tests/games'))
        p = os.path.join(tmp, path)
        text = open(p, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'ERROR (text found %d times)' % text.count(old)
        open(p, 'w', encoding='utf-8').write(text.replace(old, new))
        script, only = (test, None) if isinstance(test, str) else test
        cmd = [sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', script)] + (['--only', only] if only else [])
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=2400)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] != CORE)]
fast = [f for f in faults if f[4] == CORE]
slow = [f for f in faults if f[4] != CORE]
with ThreadPoolExecutor(max_workers=2) as ex:
    results = list(ex.map(run, fast))
results += [run(f) for f in slow]  # one browser run at a time
for name, res in results:
    print(f'  {res:<28} {name}')
caught = sum(res == 'caught' for _, res in results)
print(f'{caught}/{len(results)} planted faults caught')
sys.exit(0 if caught == len(results) else 1)
