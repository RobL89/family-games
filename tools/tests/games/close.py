"""Close script for P-034 (Kids Games Development). Version 1.1.

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
    python3 -B tools/tests/games/close.py [--no-fetch]
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


def main():
    fetch = '--no-fetch' not in sys.argv[1:]
    results = []
    if fetch:
        r = subprocess.run(['git', 'fetch', '--depth=1', 'origin', '+refs/heads/main:refs/remotes/origin/main'],
                           cwd=REPO, capture_output=True, text=True)
        results.append(('fetch main', 'PASS' if r.returncode == 0 else 'FAIL'))
        if r.returncode != 0:
            print('fetch main failed:', r.stderr.strip())
    tests = sorted(glob.glob(os.path.join(HERE, 'test_*.py')), key=lambda p: (not p.endswith('test_checks.py'), p))
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
    print('CLOSE:', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
