"""Tests for the close script's choice of tests (close.py pick_tests, pass_commit). Version 1.5.

Changes at v1.5 (D-086): close.choose(): the close runs the fast checks only unless asked;
--full runs everything, --changed picks by the map as before.

Changes at v1.4 (step 2d-2): the ship hooks test is one of the tests, run with the shared engine
or when it changes itself; the one-off move script is not in the run.

Changes at v1.3 (step 2d-1, D-081): the last full pass is also kept in the repo, in
tools/tests/games/close_pass.txt, so a new chat's clone starts from it; that file changing runs
the fast checks only, and pass_commit reads the clone's own record first, then the repo's.

Changes at v1.2 (step 2c-build): the map screens' test runs with Rocket Lander's own files.

Changes at v1.1 (step 2c-build, D-058): one rocket game: the sums tests are Rocket Lander's, so
the cases that named Rocket Sums' files now name Rocket Lander's; every case is kept.

Step 2a-4c (D-056). After a full close has passed in this clone, a later close runs the fast
checks and only the browser tests whose files changed; anything in the shared engine, the
close script itself, or a file the map doesn't know means the full set. Fast: no browser.
Usage, from the repo root: python3 -B tools/tests/games/test_close_pick.py
"""
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('close', os.path.join(HERE, 'close.py'))
close = importlib.util.module_from_spec(spec)
spec.loader.exec_module(close)
T = 'tools/tests/games/'
ALL = ['test_checks.py', 'test_close_pick.py', 'test_rocket_fleet_core.py', 'test_rocket_hangar_e2e.py',
       'test_rocket_lander_core.py', 'test_rocket_lander_e2e.py', 'test_rocket_lander_labels.py',
       'test_rocket_lander_levels.py', 'test_rocket_lander_map_e2e.py', 'test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py',
       'test_rocket_ship_hooks_e2e.py']
FAST = ['test_checks.py', 'test_close_pick.py', 'test_rocket_fleet_core.py', 'test_rocket_lander_core.py']
fails = []


def check(changed, want_mode, want, what, tests=ALL):
    mode, got = close.pick_tests(changed, tests)
    ok = mode == want_mode and sorted(got) == sorted(want)
    print(('ok   ' if ok else 'FAIL ') + f'{what}: {mode} {sorted(got)}')
    if not ok:
        fails.append(what)


# D-086: tests in batches at checkpoints; a wrap-up's close is the fast checks only
def check_choose(args, want_mode, want, what, changed=None):
    mode, got = close.choose(args, ALL, lambda: changed)
    ok = mode == want_mode and sorted(got) == sorted(want)
    print(('ok   ' if ok else 'FAIL ') + f'{what}: {mode} {sorted(got)}')
    if not ok:
        fails.append(what)


check_choose([], 'fast', FAST, 'no option (a wrap-up, D-086): the fast checks only, whatever changed', changed=['games/_common/rocket/round.js'])
check_choose(['--full'], 'full', ALL, '--full (a checkpoint): everything', changed=[])
check_choose(['--changed'], 'full', ALL, '--changed: picked by the map, the shared engine runs everything', changed=['games/_common/rocket/round.js'])
check_choose(['--changed'], 'some', FAST, '--changed: picked by the map, a bench runs the fast checks', changed=[T + 'mutate_rocket_hangar.py'])
check(None, 'full', ALL, 'no full pass in this clone yet: everything')
check([], 'unchanged', FAST, 'nothing changed since the full pass: the fast checks only')
check(['docs/games/README.md', 'games.json'], 'some', FAST, 'docs and the games list: the fast checks (the doc check covers them)')
check([T + 'preview_debug_rocket_lander.js'], 'some', FAST + ['test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py'],
      "Rocket Lander's test panel: both tests that open it")
check([T + 'build_preview.py'], 'some', FAST + ['test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py'], 'the preview builder: both preview tests')
check(['games/rocket-lander/levels.js'], 'some', FAST + ['test_rocket_lander_e2e.py', 'test_rocket_lander_labels.py', 'test_rocket_lander_levels.py',
      'test_rocket_lander_map_e2e.py', 'test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py'], "Rocket Lander's own files: its six browser tests")
check(['games/rocket-lander/map.js'], 'some', FAST + ['test_rocket_lander_e2e.py', 'test_rocket_lander_labels.py', 'test_rocket_lander_levels.py',
      'test_rocket_lander_map_e2e.py', 'test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py'], 'the map is Rocket Lander\'s own: its six browser tests')
check(['games/rocket-lander/sums.js'], 'some', FAST + ['test_rocket_lander_e2e.py', 'test_rocket_lander_labels.py', 'test_rocket_lander_levels.py',
      'test_rocket_lander_map_e2e.py', 'test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py'], 'the sums, now Rocket Lander\'s own: its six browser tests')
check([T + 'test_rocket_hangar_e2e.py'], 'some', FAST + ['test_rocket_hangar_e2e.py'], 'a changed test runs itself')
check([T + 'mutate_rocket_hangar.py', T + 'sketch_rocket_door.py'], 'some', FAST, 'benches and sketches: not in the run, the fast checks only')
check([T + 'test_rocket_ship_hooks_e2e.py'], 'some', FAST + ['test_rocket_ship_hooks_e2e.py'], 'the ship hooks test (step 2d-2) runs itself when it changes')
check([T + 'move_rocket_new_ships.py'], 'some', FAST, 'the one-off move of the new ships (step 2d-2): not in the run, the fast checks only')
check(['games/_common/rocket/round.js'], 'full', ALL, 'the shared engine: everything')
check([T + 'close.py'], 'full', ALL, 'the close script itself: everything')
check(['games/word-worm/index.html'], 'full', ALL, 'a file the map does not know: everything')
check([T + 'repo_check.py'], 'full', ALL, 'a check script the map does not know: everything')
check([T + 'preview_debug_rocket_lander.js'], 'some', FAST + ['test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py', 'test_new_e2e.py'],
      'a test the map does not know always runs', tests=ALL + ['test_new_e2e.py'])
check([T + 'close_pass.txt'], 'some', FAST, 'the full pass kept in the repo: the fast checks only')
check([T + 'close_pass.txt', T + 'sketch_rocket_new_ships.js'], 'some', FAST, 'the pass record and a sketch: the fast checks only')

import tempfile  # noqa: E402
with tempfile.TemporaryDirectory() as d:
    clone, repo, missing = os.path.join(d, 'clone'), os.path.join(d, 'repo'), os.path.join(d, 'none')
    with open(repo, 'w') as f:
        f.write('aaaa111\n')
    for got, want, what in ((close.pass_commit([missing, missing]), None, 'no pass on record: none'),
                            (close.pass_commit([missing, repo]), 'aaaa111', "a new clone starts from the repo's record")):
        print(('ok   ' if got == want else 'FAIL ') + f'{what}: {got}')
        if got != want:
            fails.append(what)
    with open(clone, 'w') as f:
        f.write('bbbb222\n')
    got = close.pass_commit([clone, repo])
    print(('ok   ' if got == 'bbbb222' else 'FAIL ') + f"the clone's own record comes first: {got}")
    if got != 'bbbb222':
        fails.append('clone first')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
