"""Bench, not part of the close: plants faults in Rocket Sums and counts how many the tests catch.
Version 1.0. Copied from mutate_rocket_lander.py 1.3 in step 2a-2, with Rocket Sums' faults.

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/
folders (a temporary folder), run against the test meant to catch it. The repo itself is
never changed. A fault whose text isn't found exactly once is an error, not a catch.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_sums.py [--fast]
--fast skips the faults that need the browser test (about 2 minutes each).
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/rocket-sums/'
C = 'games/_common/rocket/'
CORE, E2E = 'test_rocket_sums_core.py', 'test_rocket_sums_e2e.py'

FAULTS = [
    ('a times sum with a 0 (D-033)', G + 'sums.js', "if (op === '×') for (let a = 1;", "if (op === '×') for (let a = 0;", CORE),
    ('take away below zero (D-024)', G + 'sums.js', 'for (const b of upTo(a)) add(a, b, a - b);', 'for (const b of upTo(10)) add(a, b, a - b);', CORE),
    ('divide by 3 (D-023)', G + 'sums.js', 'export const DIVISORS = [2, 5, 10];', 'export const DIVISORS = [2, 3, 5, 10];', CORE),
    ('+ ignores the level\'s biggest answer', G + 'sums.js', 'if (a + b <= max) add(a, b, a + b);', 'add(a, b, a + b);', CORE),
    ('the same sum twice running', G + 'sums.js', 'const pool = all.length > 1 ? all.filter((f) => !same(f, prev)) : all;', 'const pool = all;', CORE),
    ('the answer always mid-stretch', G + 'sums.js', 'const from = lo + Math.min(hi - lo, Math.floor(rand() * (hi - lo + 1)));', 'const from = Math.round((lo + hi) / 2);', CORE),
    ('a stretch past the biggest answer', G + 'sums.js', 'hi = Math.min(sum.answer, top - span);', 'hi = sum.answer;', CORE),
    ('the operations setting ignored', G + 'sums.js', 'return set.length ? set : row.ops.slice();', 'return row.ops.slice();', CORE),
    ('level 1 on 0 to 10 (D-039)', G + 'levels.js', "plus_max: 5, layout: 'line', from: 0, to: 5,", "plus_max: 5, layout: 'line', from: 0, to: 10,", CORE),
    ('randomness in the sums', G + 'sums.js', 'export function makeSum(ops, row, prev, rand) {', 'export function makeSum(ops, row, prev, rand = Math.random) {', CORE),
    # the page (browser test)
    ('the stretch laid out for the wrong value', G + 'game.js', 'lineForSum({ answer: T.value },', 'lineForSum(T,', E2E),
    ('no beam (D-032)', G + 'game.js', '  beam: true,', '  beam: false,', E2E),
    ('the bubble leaves out the sum', G + 'game.js', '. ${esc(T.sum)} = <b>${T.value}</b>', '. = <b>${T.value}</b>', E2E),
    ('a sum set by a test keeps the old line', C + 'round.js', 'lineForTarget(); showTarget(); };', 'showTarget(); };', E2E),
]


def run(fault):
    name, path, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='rs-mut-')
    try:
        shutil.copytree(os.path.join(REPO, 'games'), os.path.join(tmp, 'games'))
        shutil.copytree(os.path.join(REPO, 'tools/tests/games'), os.path.join(tmp, 'tools/tests/games'))
        p = os.path.join(tmp, path)
        text = open(p, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'ERROR (text found %d times)' % text.count(old)
        open(p, 'w', encoding='utf-8').write(text.replace(old, new))
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', test)], capture_output=True, text=True, timeout=900)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] == E2E)]
with ThreadPoolExecutor(max_workers=3) as ex:
    results = list(ex.map(run, faults))
for name, res in results:
    print(f'  {res:<28} {name}')
caught = sum(res == 'caught' for _, res in results)
print(f'{caught}/{len(results)} planted faults caught')
sys.exit(0 if caught == len(results) else 1)
