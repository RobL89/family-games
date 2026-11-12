"""Mutation bench for P-034 (Kids Games Development)'s checks. Version 1.2.

Changes at v1.2: repo_check 1.2's folders (D-113): the folder mutants follow its new lines.
Changes at v1.1: the names mutants are removed with the names check (D-017).

Tests the tests: plants one fault at a time in repo_check.py, doc_check.py and
pins_check.py, runs test_checks.py and counts the faults caught. Each file is
put back byte for byte after each run, and checked by hash at the end.
Not part of the close (it takes a few minutes); run by hand after changing a check:
    python3 -B tools/tests/games/mutate_checks.py
Exit 0 if every fault is caught.
"""
import hashlib
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

MUTANTS = [
    ('repo_check.py', "OWNED = ('games/', 'docs/games/', 'tools/tests/games/')",
     "OWNED = ('games', 'docs/games', 'tools/tests/games/')", 'folder prefixes without the slash'),
    ('repo_check.py', "OWNED = ('games/', 'docs/games/', 'tools/tests/games/')",
     "OWNED = ('games/', 'games.json', 'docs/games/', 'tools/tests/games/')", 'games.json still ours'),
    ('repo_check.py', "NOT_OURS = ('games/kriss-kross/', 'games/_template/')",
     "NOT_OURS = ('games/kriss-kross', 'games/_template/')", "P-020's folder without the slash"),
    ('repo_check.py', "    if any(path.startswith(p) for p in NOT_OURS):", "    if False:", "P-020's game folders ours"),
    ('repo_check.py', "'--no-merges', '--no-renames',", "'--no-merges',", 'renames not split'),
    ('repo_check.py', "'--untracked-files=all', '--no-renames'", "'--untracked-files=no', '--no-renames'", 'untracked files ignored'),
    ('repo_check.py', "    outside = sorted(p for p in committed | working if not owned(p))",
     "    outside = sorted(p for p in committed if not owned(p))", 'working tree ignored'),
    ('doc_check.py', "        elif gid in seen:", "        elif False:", 'duplicate ids allowed'),
    ('doc_check.py', "STATUSES = {'ready', 'testing', 'soon'}", "STATUSES = {'ready', 'testing', 'soon', 'live'}", 'unknown status allowed'),
    ('doc_check.py', "        if status in ('ready', 'testing') and not folder:", "        if status == 'ready' and not folder:", 'testing without folder allowed'),
    ('doc_check.py', "            if not os.path.exists(dest):", "            if False:", 'broken links allowed'),
    ('doc_check.py', "        if not os.path.isfile(os.path.join(repo, item.get('path', ''))):", "        if False:", 'missing frozen file allowed'),
    ('pins_check.py', "digest = hashlib.sha256(fh.read()).hexdigest()",
     "digest = hashlib.sha256(fh.read().replace(b'\\r\\n', b'\\n')).hexdigest()", 'frozen file line endings normalised'),
    ('pins_check.py', "        if digest != item['sha256']:", "        if False:", 'frozen hash not compared'),
    ('pins_check.py', "        elif obj != d['object']:", "        elif False:", 'drift ignored'),
    ('pins_check.py', "            errs.append(f'drift {d[\"name\"]}: NOT RUN", "            print(f'drift {d[\"name\"]}: NOT RUN", 'unreadable drift passes'),
]


def sha(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def main():
    files = sorted({m[0] for m in MUTANTS})
    before = {f: sha(os.path.join(HERE, f)) for f in files}
    caught, missed, bad = 0, [], []
    for fname, old, new, label in MUTANTS:
        path = os.path.join(HERE, fname)
        with open(path, 'rb') as fh:
            original = fh.read()
        text = original.decode('utf-8')
        if text.count(old) != 1:
            bad.append(label)
            print(f'  NOT APPLIED ({text.count(old)} matches): {label}')
            continue
        try:
            with open(path, 'wb') as fh:
                fh.write(text.replace(old, new).encode('utf-8'))
            r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'test_checks.py')], capture_output=True, text=True)
        finally:
            with open(path, 'wb') as fh:
                fh.write(original)
        if r.returncode != 0:
            caught += 1
            print(f'  caught: {label}')
        else:
            missed.append(label)
            print(f'  MISSED: {label}')
    after = {f: sha(os.path.join(HERE, f)) for f in files}
    restored = before == after
    print(f'mutants: {caught}/{len(MUTANTS)} caught; {len(bad)} not applied; files restored: {restored}')
    return 0 if caught == len(MUTANTS) and restored else 1


if __name__ == '__main__':
    sys.exit(main())
