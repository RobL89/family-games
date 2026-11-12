"""Repo check for P-034 (Kids Games Development). Version 1.2.

Changes at v1.2: the repo is P-020 (Family Games Launcher)'s, the host of every game
(D-113): games.json, games/kriss-kross/ and games/_template/ are no longer P-034's.
Changes at v1.1: the private-names part is removed (D-017: the children's
names are not private); the check is now paths only, exit 0 or 1.

Fails if this branch changes anything outside P-034's folders (D-113):
games/ (but not games/kriss-kross/ or games/_template/), docs/games/,
tools/tests/games/. It looks at every
non-merge commit in BASE..HEAD (renames counted as delete + add) and at the
working tree (staged, unstaged and untracked files).

Usage, from the repo root:
    python3 -B tools/tests/games/repo_check.py [--base origin/main] [--repo .]
Exit 0 pass, 1 fail.
"""
import argparse
import subprocess
import sys

OWNED = ('games/', 'docs/games/', 'tools/tests/games/')
NOT_OURS = ('games/kriss-kross/', 'games/_template/')  # P-020's, inside games/ (D-113)


def owned(path):
    """True if a repo-relative path is inside P-034's folders."""
    if any(path.startswith(p) for p in NOT_OURS):
        return False
    return any(path.startswith(p) for p in OWNED)


def git(repo, *args):
    r = subprocess.run(['git', '-C', repo, *args], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError('git ' + ' '.join(args) + ' failed: ' + r.stderr.decode('utf-8', 'replace').strip())
    return r.stdout.decode('utf-8', 'surrogateescape')


def changed_paths(repo, base):
    """Paths changed by this branch's own commits, plus the working tree."""
    git(repo, 'rev-parse', '--verify', '--quiet', base + '^{commit}')
    out = git(repo, 'log', '--no-merges', '--no-renames', '--format=', '--name-only', '-z', base + '..HEAD')
    committed = {p.strip('\n') for p in out.split('\0') if p.strip('\n')}
    status = git(repo, 'status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames')
    working = {e[3:] for e in status.split('\0') if len(e) > 3}
    return committed, working


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--base', default='origin/main')
    ap.add_argument('--repo', default='.')
    a = ap.parse_args(argv)
    try:
        committed, working = changed_paths(a.repo, a.base)
    except RuntimeError as e:
        print('repo check: FAIL, cannot read the branch:', e)
        return 1
    outside = sorted(p for p in committed | working if not owned(p))
    print(f'paths: {len(committed)} changed in commits since {a.base}, {len(working)} in the working tree')
    for p in outside:
        where = 'commit' if p in committed else 'working tree'
        if p in committed and p in working:
            where = 'commit and working tree'
        print(f'  outside P-034\'s folders ({where}): {p}')
    paths_ok = not outside
    print('paths:', 'PASS' if paths_ok else f'FAIL ({len(outside)} outside)')
    return 0 if paths_ok else 1


if __name__ == '__main__':
    sys.exit(main())
