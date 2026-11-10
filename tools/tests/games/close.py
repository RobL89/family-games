"""Close script for P-034 (Kids Games Development). Version 1.6.

Changes at v1.6 (step 2d-2, D-080): the ship hooks test, test_rocket_ship_hooks_e2e.py, covers the
shared engine like the hangar test, so it runs when that changes (and when it changes itself); the
one-off move of the new ships, move_rocket_new_ships.py, is not part of the run.

Changes at v1.5 (step 2d-1, D-081): a full pass is also recorded in the repo, in
tools/tests/games/close_pass.txt, committed with the close, so a new chat's clone starts from the
last full pass instead of running everything (about 13 minutes). The clone's own record still
comes first; that file changing runs the fast checks only. Everything else is as v1.4.

Changes at v1.4 (step 2c-build, D-066): the map screens' new test, test_rocket_lander_map_e2e.py, runs
when Rocket Lander's own files change (and with everything when the shared engine does).

Changes at v1.3 (step 2c-build, D-058, D-068): one rocket game. The sums tests moved with the code
(test_rocket_sums_core.py into test_rocket_lander_core.py; test_rocket_sums_e2e.py is now
test_rocket_lander_sums_e2e.py, run when Rocket Lander's files, the preview builder or its panel
change), so the map follows: a change of map, not of strictness.

Changes at v1.2 (step 2a-4c, D-056): after a full close has passed in this clone (a stamp in
.git/p034-close-pass, never committed, so each chat's fresh clone starts with a full run), a
later close runs the fast checks and only the browser tests whose files changed since that pass
(pick_tests, with the map below). A change to the shared engine, this script, or any file the
map doesn't know runs everything; so does --full. Nothing changed since: the fast checks only.

Changes at v1.1: the repo check is paths only (D-017), so no names variable is needed.

Run at every working close, before the commit and push. In order:
1. tests: every tools/tests/games/test_*.py (the checks' own tests first, then
   each game's tests as they are added)
2. repo check: nothing outside P-034's folders
3. doc check: games.json, docs/games/, pins.json
4. pins: frozen files unchanged; drift of what we rely on from P-020
It fetches main and the pinned branches from origin first, so the repo check
compares with today's main. It never commits or pushes: that stays a step the
chat takes, naming the file versions, once this passes.

Usage, from the repo root:
    python3 -B tools/tests/games/close.py [--no-fetch] [--full]
Exit 0 only if every part passes.
"""
import glob
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
PY = [sys.executable, '-B']


def run(label, cmd):
    print(f'== {label}')
    r = subprocess.run(cmd, cwd=REPO, env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    return r.returncode


T = 'tools/tests/games/'
STAMP = os.path.join(REPO, '.git', 'p034-close-pass')
PASS_FILE = os.path.join(HERE, 'close_pass.txt')  # the last full pass, committed (D-081)
# Fast checks (no browser): always run.
FAST = {'test_checks.py', 'test_close_pick.py', 'test_rocket_fleet_core.py', 'test_rocket_lander_core.py'}
# Browser tests, and the paths whose change re-runs each. The hangar test has none of its own:
# it covers the shared engine, and a change there runs everything.
COVERS = {
    'test_rocket_hangar_e2e.py': [],
    'test_rocket_lander_e2e.py': ['games/rocket-lander/'],
    'test_rocket_lander_labels.py': ['games/rocket-lander/'],
    'test_rocket_lander_levels.py': ['games/rocket-lander/'],
    'test_rocket_lander_map_e2e.py': ['games/rocket-lander/'],
    'test_rocket_lander_preview.py': ['games/rocket-lander/', T + 'build_preview.py', T + 'preview_debug_rocket_lander.js'],
    'test_rocket_lander_sums_e2e.py': ['games/rocket-lander/', T + 'build_preview.py', T + 'preview_debug_rocket_lander.js'],
    'test_rocket_ship_hooks_e2e.py': [],
}
# Changes the fast checks cover (docs, the games list), or files the run never uses (benches, sketches).
FAST_ONLY = ['docs/games/', 'games.json', T + 'mutate_', T + 'sketch_', T + 'measure_', T + 'move_', T + 'close_pass.txt']


def pick_tests(changed, tests):
    """Which tests to run: ('full' | 'unchanged' | 'some', [test file names]). changed is the
    list of repo paths changed since the last full pass in this clone, or None if there is none."""
    if changed is None:
        return 'full', list(tests)
    if not changed:
        return 'unchanged', [t for t in tests if t in FAST]
    pick = {t for t in tests if t in FAST or t not in COVERS}  # a test the map doesn't know always runs
    for path in changed:
        name = path[len(T):] if path.startswith(T) else None
        if name and name.startswith('test_') and name.endswith('.py'):
            pick.add(name)
            continue
        hits = [t for t, prefixes in COVERS.items() if any(path.startswith(p) for p in prefixes)]
        if hits:
            pick.update(h for h in hits if h in tests)
        elif not any(path.startswith(p) for p in FAST_ONLY):
            return 'full', list(tests)  # the shared engine, this script, or anything unknown
    return 'some', [t for t in tests if t in pick]


def pass_commit(paths=None):
    """The commit of the last full pass: this clone's own record first, then the repo's."""
    for path in paths or [STAMP, PASS_FILE]:
        try:
            base = open(path).read().split()[0]
        except (OSError, IndexError):
            continue
        if base:
            return base
    return None


def changed_since_pass():
    """Paths changed since the last full pass (committed, staged, unstaged or new), or None if
    there is no pass on record or its commit can't be found."""
    base = pass_commit()
    if not base:
        return None
    r = subprocess.run(['git', 'diff', '--name-only', base], cwd=REPO, capture_output=True, text=True)
    if r.returncode != 0:
        return None
    new = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=REPO, capture_output=True, text=True).stdout
    return sorted({p for p in (r.stdout + new).splitlines() if p})


def main():
    fetch = '--no-fetch' not in sys.argv[1:]
    results = []
    if fetch:
        r = subprocess.run(['git', 'fetch', '--depth=1', 'origin', '+refs/heads/main:refs/remotes/origin/main'],
                           cwd=REPO, capture_output=True, text=True)
        results.append(('fetch main', 'PASS' if r.returncode == 0 else 'FAIL'))
        if r.returncode != 0:
            print('fetch main failed:', r.stderr.strip())
    found = sorted(glob.glob(os.path.join(HERE, 'test_*.py')), key=lambda p: (not p.endswith('test_checks.py'), p))
    changed = None if '--full' in sys.argv[1:] else changed_since_pass()
    mode, names = pick_tests(changed, [os.path.basename(p) for p in found])
    tests = [p for p in found if os.path.basename(p) in names]
    print(f'== tests: {mode}' + ('' if mode == 'full' else f' (since the full pass at {(pass_commit() or "?")[:7]}; '
                                 f'changed: {", ".join(changed) or "nothing"})'))
    results.append((f'tests chosen: {mode}, {len(tests)} of {len(found)}', 'PASS'))
    for t in tests:
        code = run(os.path.relpath(t, REPO), PY + [t])
        results.append((os.path.relpath(t, REPO), 'PASS' if code == 0 else 'FAIL'))
    code = run('repo check', PY + [os.path.join(HERE, 'repo_check.py')])
    results.append(('repo check', 'PASS' if code == 0 else 'FAIL'))
    code = run('doc check', PY + [os.path.join(HERE, 'doc_check.py')])
    results.append(('doc check', 'PASS' if code == 0 else 'FAIL'))
    code = run('pins (frozen and drift)', PY + [os.path.join(HERE, 'pins_check.py')] + (['--fetch'] if fetch else []))
    results.append(('pins', 'PASS' if code == 0 else 'FAIL'))
    head = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=REPO, capture_output=True, text=True).stdout.strip()
    print(f'\n== close summary at {head}')
    for label, res in results:
        print(f'  {res:<22} {label}')
    ok = all(res == 'PASS' for _, res in results)
    if ok and mode == 'full':
        full = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=REPO, capture_output=True, text=True).stdout.strip()
        for path in (STAMP, PASS_FILE):
            with open(path, 'w') as f:
                f.write(full + '\n')
        print(f'recorded the full pass at {full[:7]} in {os.path.relpath(PASS_FILE, REPO)}: commit it with the close')
    print('CLOSE:', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
