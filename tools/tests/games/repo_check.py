"""Repo check for P-034 (Kids Games Development). Version 1.0.

Two parts:
1. Paths: fails if this branch changes anything outside P-034's folders (D-002):
   games/, games.json, docs/games/, tools/tests/games/. It looks at every
   non-merge commit in BASE..HEAD (renames counted as delete + add) and at the
   working tree (staged, unstaged and untracked files).
2. Names: fails if a private name appears in P-034's files, in their paths, in
   this branch's commit messages or in the branch name (D-010, D-011). The names
   come only from the environment variable FG_PRIVATE_NAMES (comma-separated),
   never from the repo. A name found is reported by its number, never printed.

Exit codes: 0 pass; 1 fail; 2 paths pass but the names part was NOT RUN
because FG_PRIVATE_NAMES is unset (treated as a failure by close.py).

Usage, from the repo root:
    python3 -B tools/tests/games/repo_check.py [--base origin/main] [--repo .]
"""
import argparse
import os
import re
import subprocess
import sys

OWNED = ('games/', 'games.json', 'docs/games/', 'tools/tests/games/')
OWNED_PATHSPEC = ['games', 'games.json', 'docs/games', 'tools/tests/games']
NAMES_VAR = 'FG_PRIVATE_NAMES'


def owned(path):
    """True if a repo-relative path is inside P-034's folders."""
    for p in OWNED:
        if p.endswith('/'):
            if path.startswith(p):
                return True
        elif path == p:
            return True
    return False


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


def load_names():
    raw = os.environ.get(NAMES_VAR, '')
    return [n.strip() for n in raw.split(',') if n.strip()]


def name_patterns(names):
    return [re.compile(r'(?<![^\W\d_])' + re.escape(n) + r'(?![^\W\d_])', re.IGNORECASE) for n in names]


def scan_names(repo, base, pats):
    """Return (hits, binaries). A hit is (name number, where)."""
    hits, binaries = [], []
    files = git(repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', *OWNED_PATHSPEC)
    for path in sorted({f for f in files.split('\0') if f}):
        for i, pat in enumerate(pats, 1):
            if pat.search(path):
                hits.append((i, path + ' (file name)'))
        full = os.path.join(repo, path)
        if not os.path.isfile(full):
            continue
        with open(full, 'rb') as fh:
            data = fh.read()
        if b'\0' in data:
            binaries.append(path)
            continue
        text = data.decode('utf-8', 'replace')
        for n, line in enumerate(text.splitlines(), 1):
            for i, pat in enumerate(pats, 1):
                if pat.search(line):
                    hits.append((i, f'{path}:{n}'))
    msgs = git(repo, 'log', '--format=%H%x00%B%x01', base + '..HEAD')
    for entry in msgs.split('\x01'):
        if '\0' not in entry:
            continue
        sha, body = entry.strip('\n').split('\0', 1)
        for i, pat in enumerate(pats, 1):
            if pat.search(body):
                hits.append((i, f'commit message {sha[:7]}'))
    branch = git(repo, 'rev-parse', '--abbrev-ref', 'HEAD').strip()
    for i, pat in enumerate(pats, 1):
        if pat.search(branch):
            hits.append((i, 'branch name'))
    return hits, binaries


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

    names = load_names()
    if not names:
        print(f'names: NOT RUN ({NAMES_VAR} is unset)')
        return 1 if not paths_ok else 2
    hits, binaries = scan_names(a.repo, a.base, name_patterns(names))
    for i, where in hits:
        print(f'  private name #{i} at {where}')
    for b in binaries:
        print(f'  binary, not scanned: {b}')
    print(f'names: {len(names)} checked,', 'PASS' if not hits else f'FAIL ({len(hits)} found)')
    return 0 if paths_ok and not hits else 1


if __name__ == '__main__':
    sys.exit(main())
