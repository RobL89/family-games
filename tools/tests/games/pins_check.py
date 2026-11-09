"""Pins check for P-034 (Kids Games Development). Version 1.0.

Reads tools/tests/games/pins.json and checks:
- frozen: each file is byte for byte as pinned (sha256), e.g. Rob's wife's
  Kriss Kross page (D-005).
- drift: each thing we rely on from P-020 (Family Games Launcher) is unchanged
  on its branch since it was pinned (git object id of the file or folder at
  origin/<branch>). A change fails the check: read what changed, then re-pin
  by a logged decision in P-034.

Usage, from the repo root:
    python3 -B tools/tests/games/pins_check.py [--repo .] [--fetch]
--fetch first fetches each pinned branch from origin (depth 1).
Exit 0 pass, 1 fail.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys


def git(repo, *args):
    r = subprocess.run(['git', '-C', repo, *args], capture_output=True, text=True)
    return r.returncode, r.stdout.strip(), r.stderr.strip()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--repo', default='.')
    ap.add_argument('--fetch', action='store_true')
    a = ap.parse_args(argv)
    with open(os.path.join(a.repo, 'tools', 'tests', 'games', 'pins.json'), encoding='utf-8') as fh:
        pins = json.load(fh)
    errs = []

    for item in pins.get('frozen', []):
        path = os.path.join(a.repo, item['path'])
        try:
            with open(path, 'rb') as fh:
                digest = hashlib.sha256(fh.read()).hexdigest()
        except OSError as e:
            errs.append(f'frozen {item["path"]}: cannot read: {e}')
            continue
        if digest != item['sha256']:
            errs.append(f'frozen {item["path"]}: CHANGED (sha256 {digest[:12]}..., pinned {item["sha256"][:12]}...)')
        else:
            print(f'  frozen {item["path"]}: unchanged')

    branches = sorted({d['branch'] for d in pins.get('drift', [])})
    if a.fetch:
        for b in branches:
            code, _, err = git(a.repo, 'fetch', '--depth=1', 'origin', f'+refs/heads/{b}:refs/remotes/origin/{b}')
            if code != 0:
                errs.append(f'drift: cannot fetch {b}: {err}')
    for d in pins.get('drift', []):
        code, obj, err = git(a.repo, 'rev-parse', f'origin/{d["branch"]}:{d["path"]}')
        if code != 0:
            errs.append(f'drift {d["name"]}: NOT RUN, cannot read origin/{d["branch"]}:{d["path"]}')
        elif obj != d['object']:
            errs.append(f'drift {d["name"]}: CHANGED on {d["branch"]} since {d["pinned_at"]} ({d["path"]})')
        else:
            print(f'  drift {d["name"]}: unchanged since {d["pinned_at"]}')

    for e in errs:
        print('  ' + e)
    print('pins:', 'PASS' if not errs else f'FAIL ({len(errs)})')
    return 0 if not errs else 1


if __name__ == '__main__':
    sys.exit(main())
