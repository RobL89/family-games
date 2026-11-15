"""Bench, not part of the close: plants faults in Hamster Highway's first build and counts how many the
tests catch (project rules: test the tests). Version 1.2 (15 Nov, step 3).
Changes at v1.2 (step 3's spike): the seed-on-foot fault follows core.js 1.1's new text; five faults in the timed model (core.js 1.1): the cup shared, stepped onto too
late, left before it moves, all five out at once, and the seed taken by every hamster. Built like mutate_rocket_map.py 1.0.
Changes at v1.1 (step 2): nine more faults, in the saved progress (progress.js), level 4's tray, and saving and
the wrapper link (game.js). Version 1.0.1 (15 Nov): renamed with the game, D-146.

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/ folders (a
temporary folder); the repo itself is never changed. A fault whose text isn't found exactly once is an
error, not a catch. Twenty-one faults caught or not by the core test (seconds each), in the rules (core.js), the
progress (progress.js) and the levels; five in the screens (game.js), by the browser test (about two minutes each).
Usage, from the repo root:
    python3 -B tools/tests/games/mutate_hamster_highway.py [--fast]
--fast skips the faults that need the browser test.
"""
import os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/hamster-highway/'
CORE, E2E = 'test_hamster_highway_core.py', 'test_hamster_highway_e2e.py'
FAULTS = [
    ('a drop of 3 is safe', G + 'core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 4;', CORE),
    ('a bouncer throws 2 up', G + 'core.js', 'export const BOUNCE = 3;', 'export const BOUNCE = 2;', CORE),
    ('a bridge holds nobody', G + 'core.js', "const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube']);", "const HOLDS = new Set(['#', 'ramp', 'tube']);", CORE),
    ('a bridge fits where they stand', G + 'core.js', 'return !HOLDS.has(below) && (side(-1) || side(1));', 'return HOLDS.has(below) && (side(-1) || side(1));', CORE),
    ('a ramp fits in mid-air', G + 'core.js', '  return FLOOR.has(below);\n}', '  return below !== null;\n}', CORE),
    ('a wall does not stop them', G + 'core.js', "if (next === null || next === '#') return done('stuck');", "if (next === null) return done('stuck');", CORE),
    ('a ramp does not lift', G + 'core.js', '      c += 1;\n      r -= 1;\n', '      c += 1;\n', CORE),
    ('the seed is missed on foot', G + 'core.js', "    yield touch(st, c, r);\n  }\n  return done('stuck');", "    yield st;\n  }\n  return done('stuck');", CORE),
    ('an empty tray entry is allowed', G + 'core.js', 'n < 1) throw', 'n < 0) throw', CORE),
    ('a placed gadget stays in the tray', G + 'core.js', 'n[kind] = (n[kind] || 0) - 1;', 'n[kind] = (n[kind] || 0) - 0;', CORE),
    ('two hamsters share the cup', G + 'core.js', 'return !riders.has(s.part) && !!cs', 'return !!cs', CORE),
    ('a hamster steps onto a cup about to move', G + 'core.js', 'cs.leaves - t >= TICKS.walk', 'cs.leaves - t >= 0', CORE),
    ('a rider sets off before the cup does', G + 'core.js', "      if (leaves > ctx.now()) yield { c, r, act: 'wait', dur: leaves - ctx.now() };\n", '', CORE),
    ('all five come out at once', G + 'core.js', 'next: i * RELEASE,', 'next: 0,', CORE),
    ('the seed is taken by every hamster', G + 'core.js', '        seed = false;\n        return true;', '        return true;', CORE),
    ('a click on a placed gadget keeps it down', G + 'game.js', '    delete S.placed[k];\n', '    void k;\n', E2E),
    ('no party when all five are home', G + 'game.js', "if (R.res.outcome === 'home' && R.home === WALKERS) {", "if (R.res.outcome === 'home' && R.home > WALKERS) {", E2E),
    ('tries count after a level is done', G + 'progress.js', '  if (!ids.includes(id) || q.done[id]) return q;', '  if (!ids.includes(id)) return q;', CORE),
    ('a seed is kept on a level not done', G + 'progress.js', 'if (seeds[id] === true && p.done[id])', 'if (seeds[id] === true)', CORE),
    ('any format is read', G + 'progress.js', '  if (!isMap(raw) || raw.v !== FORMAT) return p;', '  if (!isMap(raw)) return p;', CORE),
    ('no format version saved', G + 'progress.js', 'export const pack = (p) => ({ v: FORMAT, ...copy(p) });', 'export const pack = (p) => ({ ...copy(p) });', CORE),
    ('the house always opens at level 1', G + 'progress.js', '  return i < 0 ? Math.max(0, ids.length - 1) : i;', '  return 0;', CORE),
    ('level 4 has no spare bridge', G + 'levels.js', 'tray: { bridge: 2, floater: 1 }', 'tray: { bridge: 1, floater: 1 }', CORE),
    ('nothing kept on the device', G + 'game.js', '  try { localStorage.setItem(ENTRY, JSON.stringify(st)); }', '  try { void st; }', E2E),
    ('the wrapper is not told', G + 'game.js', '  if (S.linked) { S.linked.saveState(st); return; }', '  if (S.linked) { return; }', E2E),
    ('the wrapper\'s sound off is ignored', G + 'game.js', '  if (start.sound === false) { setMuted(true); S.soundLocked = true; }', '  if (start.sound === false) { S.soundLocked = true; }', E2E),
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
