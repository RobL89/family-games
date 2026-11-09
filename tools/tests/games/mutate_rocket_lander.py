"""Bench, not part of the close: plants faults in Rocket Lander and counts how many the tests catch.
Version 1.1.

Changes at v1.1: the shared engine's files are in games/_common/rocket/ (D-027).

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/
folders (a temporary folder), run against the test meant to catch it. The repo itself is
never changed. A fault whose text isn't found exactly once is an error, not a catch.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_lander.py [--fast]
--fast skips the faults that need the full browser test (about 3 minutes each).
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/rocket-lander/'
C = 'games/_common/rocket/'
CORE, LABELS, E2E = 'test_rocket_lander_core.py', 'test_rocket_lander_labels.py', 'test_rocket_lander_e2e.py'

FAULTS = [
    ('stars rule 85% becomes 80%', C + 'numbers.js', 'right * 100 >= 85 * total', 'right * 100 >= 80 * total', CORE),
    ('ends no longer swapped', C + 'numbers.js', '[from, to] = [to, from];', '', CORE),
    ('ordinary minus sign', C + 'numbers.js', "const MINUS = '−';", "const MINUS = '-';", CORE),
    ('settings not kept in range', C + 'settings.js', 'v = Math.min(spec.max, Math.max(spec.min, n));', 'v = n;', CORE),
    ('any option accepted', C + 'settings.js', 'if (spec.options.includes(raw)) v = raw;', 'v = raw;', CORE),
    ('a default changed', C + 'settings.js', 'landings_per_round: { default: 8,', 'landings_per_round: { default: 10,', CORE),
    ('clock in the core', C + 'numbers.js', 'export const tidy = (n) =>', 'export const started = Date.now();\nexport const tidy = (n) =>', CORE),
    ('a launcher import comes back', G + 'game.js', "from '../_common/rocket/sound.js';", "from '../../shared/sound.js';", CORE),
    ('state kept on the device', C + 'kit.js', 'export function saveState(state) { saved = copy(state || {});',
     "export function saveState(state) { saved = copy(state || {}); localStorage.setItem('rl', '1');", CORE),
    ('RL-3: labels never fade', C + 'scene.js', 'b.alpha = crosses(b) ? clamp(1 - hb.a * 1.5, 0, 1) : 1;', 'b.alpha = 1;', LABELS),
    ('RL-3: overlap tested on half the box', C + 'scene.js', 'b.x < hb.x + hb.w && hb.x < b.x + b.w', 'b.x < hb.x + hb.w / 2 && hb.x + hb.w / 2 < b.x + b.w', LABELS),
    ('begin() drops the saved state', G + 'game.js', "progress = { ...DEFAULT_PROGRESS, ...(state && typeof state === 'object' ? state : {}) };",
     'progress = { ...DEFAULT_PROGRESS };', E2E),
    ('a good round unlocks nothing', G + 'game.js', 'if (stars >= 2 && progress.unlocked < PLANETS.length) {', 'if (stars >= 3 && progress.unlocked < PLANETS.length) {', E2E),
]


def run(fault):
    name, path, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='rl-mut-')
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
