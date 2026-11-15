"""Bench, not part of the close: plants faults in Hamster Highway's first build and counts how many the
tests catch (project rules: test the tests). Version 1.0 (15 Nov). Built like mutate_rocket_map.py 1.0.

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/ folders (a
temporary folder); the repo itself is never changed. A fault whose text isn't found exactly once is an
error, not a catch. Ten faults in the rules (core.js), caught or not by the core test (seconds each), and
two in the screens (game.js), by the browser test (about a minute each).
Usage, from the repo root:
    python3 -B tools/tests/games/mutate_bridge_builder.py [--fast]
--fast skips the faults that need the browser test.
"""
import os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/bridge-builder/'
CORE, E2E = 'test_bridge_builder_core.py', 'test_bridge_builder_e2e.py'
FAULTS = [
    ('a drop of 3 is safe', G + 'core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 4;', CORE),
    ('a bouncer throws 2 up', G + 'core.js', 'export const BOUNCE = 3;', 'export const BOUNCE = 2;', CORE),
    ('a bridge holds nobody', G + 'core.js', "const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube']);", "const HOLDS = new Set(['#', 'ramp', 'tube']);", CORE),
    ('a bridge fits where they stand', G + 'core.js', 'return !HOLDS.has(below) && (side(-1) || side(1));', 'return HOLDS.has(below) && (side(-1) || side(1));', CORE),
    ('a ramp fits in mid-air', G + 'core.js', '  return FLOOR.has(below);\n}', '  return below !== null;\n}', CORE),
    ('a wall does not stop them', G + 'core.js', "if (next === null || next === '#') return done('stuck');", "if (next === null) return done('stuck');", CORE),
    ('a ramp does not lift', G + 'core.js', '      c += 1;\n      r -= 1;\n', '      c += 1;\n', CORE),
    ('the seed is missed on foot', G + 'core.js', "      steps.push({ c, r, act: 'walk' });\n    }\n    touch(c, r);", "      steps.push({ c, r, act: 'walk' });\n    }", CORE),
    ('an empty tray entry is allowed', G + 'core.js', 'n < 1) throw', 'n < 0) throw', CORE),
    ('a placed gadget stays in the tray', G + 'core.js', 'n[kind] = (n[kind] || 0) - 1;', 'n[kind] = (n[kind] || 0) - 0;', CORE),
    ('a click on a placed gadget keeps it down', G + 'game.js', '    delete S.placed[k];\n', '    void k;\n', E2E),
    ('no party when all five are home', G + 'game.js', "if (R.res.outcome === 'home' && R.home === WALKERS) {", "if (R.res.outcome === 'home' && R.home > WALKERS) {", E2E),
]


def run(fault):
    name, rel, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='hh-mut-')
    try:
        for d in ('games', 'tools/tests/games'):
            shutil.copytree(os.path.join(REPO, d), os.path.join(tmp, d))
        path = os.path.join(tmp, rel)
        text = open(path, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'error: the fault\'s text is not found exactly once'
        open(path, 'w', encoding='utf-8').write(text.replace(old, new))
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', test), os.path.join(tmp, 'pics')],
                           capture_output=True, text=True, timeout=600)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] == E2E)]
results = [run(f) for f in faults]
for name, res in results:
    print(f'{res:8} {name}')
caught = sum(1 for _, r in results if r == 'caught')
print(f'{caught} of {len(results)} faults caught')
sys.exit(0 if caught == len(results) else 1)
