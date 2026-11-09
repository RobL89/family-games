"""Tests for the close script's choice of tests (close.py pick_tests). Version 1.2.

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
       'test_rocket_lander_levels.py', 'test_rocket_lander_map_e2e.py', 'test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py']
FAST = ['test_checks.py', 'test_close_pick.py', 'test_rocket_fleet_core.py', 'test_rocket_lander_core.py']
fails = []


def check(changed, want_mode, want, what, tests=ALL):
    mode, got = close.pick_tests(changed, tests)
    ok = mode == want_mode and sorted(got) == sorted(want)
    print(('ok   ' if ok else 'FAIL ') + f'{what}: {mode} {sorted(got)}')
    if not ok:
        fails.append(what)


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
check(['games/_common/rocket/round.js'], 'full', ALL, 'the shared engine: everything')
check([T + 'close.py'], 'full', ALL, 'the close script itself: everything')
check(['games/word-worm/index.html'], 'full', ALL, 'a file the map does not know: everything')
check([T + 'repo_check.py'], 'full', ALL, 'a check script the map does not know: everything')
check([T + 'preview_debug_rocket_lander.js'], 'some', FAST + ['test_rocket_lander_preview.py', 'test_rocket_lander_sums_e2e.py', 'test_new_e2e.py'],
      'a test the map does not know always runs', tests=ALL + ['test_new_e2e.py'])
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
