"""Bench, not part of the close: plants faults in the one game's map (step 2c-build, D-058, D-064 to
D-068) and counts how many the tests catch. Version 1.0. Built like mutate_rocket_sums.py 1.2.

Only this step's new code is faulted (D-057): the map's progress rules (progress.js, by the core
test, seconds each) and three faults in the screens (round.js, starmap.js, kit.js, by the map's
browser test, about 4 minutes each). Each fault is one exact text change in a copy of the repo's
games/ and tools/tests/games/ folders (a temporary folder); the repo itself is never changed. A
fault whose text isn't found exactly once is an error, not a catch.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_map.py [--fast]
--fast skips the faults that need the browser test.
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
C = 'games/_common/rocket/'
CORE, MAP = 'test_rocket_lander_core.py', 'test_rocket_lander_map_e2e.py'

FAULTS = [
    ('a replay pays its rocks again', C + 'progress.js', 'const paid = Math.min(whole(found, 0, ROCKS_PER_LEVEL), ROCKS_PER_LEVEL - was.rocks);',
     'const paid = whole(found, 0, ROCKS_PER_LEVEL);', CORE),
    ('a worse replay lowers the best', C + 'progress.js', 'const now = { stars: Math.max(was.stars, got),', 'const now = { stars: got,', CORE),
    ('1 star opens the next level (D-064)', C + 'progress.js', 'export const PASS_STARS = 2;', 'export const PASS_STARS = 1;', CORE),
    ('hyperspace after any level', C + 'progress.js', 'hyper: !!after && after.s !== R[i].s', 'hyper: !!after', CORE),
    ('the rocket stays put after a pass', C + 'progress.js', 'at: after ? after.id : id, open:', 'at: id, open:', CORE),
    ('a replay closes the levels after it', C + 'progress.js', 'let open = Math.max(indexOf(map, p.open), i), opened = null;', 'let open = i, opened = null;', CORE),
    ('a level keeps more than 8 rocks', C + 'progress.js', 'levels[id] = { stars, rocks: whole(e.rocks, 0, ROCKS_PER_LEVEL) };', 'levels[id] = { stars, rocks: whole(e.rocks, 0, 99) };', CORE),
    ('flying to a system forgets the newest level', C + 'progress.js', '  if (end && end.s === s) return p.open;\n', '', CORE),
    ('a picked level opens nothing', C + 'progress.js', "return { ...p, at: id, open: route(map)[Math.max(i, indexOf(map, p.open))].id };", 'return { ...p, at: id };', CORE),
    ('levels counted from 0 along the map', C + 'progress.js', "return { id: R[n - 1].id, note: '' };", "return { id: (R[n] || R[n - 1]).id, note: '' };", CORE),
    ('the last system never says more are coming', C + 'progress.js', 'soon: done && !after && map.slice(R[i].s + 1).some((sys) => sys.soon),', 'soon: false,', CORE),
    ('randomness in the progress', C + 'progress.js', 'Math.round(Number(v) || 0)', 'Math.round(Number(v) || Math.random())', CORE),
    ('right landings not added up', C + 'progress.js', 'landings: whole(p.landings, 0, 1e9) + whole(right, 0, 1000),', 'landings: whole(p.landings, 0, 1e9),', CORE),
    # the screens (browser test)
    ('format 2 still read', C + 'kit.js', 'const READS = [3];', 'const READS = [2, 3];', MAP),
    ('rocks fly when all 8 are found', C + 'round.js', 'if (!rockLeft(progress, level.id, G.roundRocks)) {', 'if (false) {', MAP),
    ('a locked level opens its card', C + 'starmap.js', "    if (this.stateOf(id) === 'locked') {\n      k.shake = 1;", "    if (false) {\n      k.shake = 1;", MAP),
]


def run(fault):
    name, path, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='rl-map-mut-')
    try:
        shutil.copytree(os.path.join(REPO, 'games'), os.path.join(tmp, 'games'))
        shutil.copytree(os.path.join(REPO, 'tools/tests/games'), os.path.join(tmp, 'tools/tests/games'))
        p = os.path.join(tmp, path)
        text = open(p, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'ERROR (text found %d times)' % text.count(old)
        open(p, 'w', encoding='utf-8').write(text.replace(old, new))
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', test)], capture_output=True, text=True, timeout=1200)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] == MAP)]
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
