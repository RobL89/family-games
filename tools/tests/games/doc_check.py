"""Doc check for P-034 (Kids Games Development)'s governing files. Version 1.1.

Changes at v1.1 (D-122): games.json is no longer checked: it is P-020 (Family Games Launcher)'s
file (D-113), with P-020's own statuses and artifact games, and P-020 checks it.

Run before every save of a governing file. Checks:
- docs/games/*.md: a "Version" line, a "Change log" heading, and every
  relative link points to a file or folder that exists in the repo.
- tools/tests/games/pins.json: valid JSON with format 1, and every frozen file
  it names exists.

Usage, from the repo root:
    python3 -B tools/tests/games/doc_check.py [--repo .]
Exit 0 pass, 1 fail.
"""
import argparse
import glob
import json
import os
import re
import sys

LINK_RE = re.compile(r'\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')


def check_docs(repo):
    errs = []
    files = sorted(glob.glob(os.path.join(repo, 'docs', 'games', '**', '*.md'), recursive=True))
    if not files:
        errs.append('docs/games: no .md files')
    for f in files:
        rel = os.path.relpath(f, repo)
        with open(f, encoding='utf-8') as fh:
            text = fh.read()
        if not re.search(r'^(\*\*)?Version\b', text, re.MULTILINE) and not re.search(r'\|\s*\*\*Version\*\*\s*\|', text):
            errs.append(f'{rel}: no Version line')
        if not re.search(r'^#+\s*Change log\s*$', text, re.MULTILINE | re.IGNORECASE):
            errs.append(f'{rel}: no "Change log" heading')
        for target in LINK_RE.findall(text):
            if re.match(r'^[a-z][a-z0-9+.-]*:', target, re.IGNORECASE) or target.startswith('#'):
                continue
            target = target.split('#', 1)[0]
            dest = os.path.normpath(os.path.join(os.path.dirname(f), target))
            if not os.path.exists(dest):
                errs.append(f'{rel}: broken link {target!r}')
    return errs


def check_pins(repo):
    path = os.path.join(repo, 'tools', 'tests', 'games', 'pins.json')
    try:
        with open(path, encoding='utf-8') as fh:
            pins = json.load(fh)
    except (OSError, ValueError) as e:
        return [f'pins.json: cannot read: {e}']
    errs = []
    if pins.get('format') != 1:
        errs.append(f'pins.json: format {pins.get("format")!r}, expected 1')
    for item in pins.get('frozen', []):
        if not os.path.isfile(os.path.join(repo, item.get('path', ''))):
            errs.append(f'pins.json: frozen file missing: {item.get("path")!r}')
    return errs


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--repo', default='.')
    a = ap.parse_args(argv)
    errs = check_docs(a.repo) + check_pins(a.repo)
    for e in errs:
        print('  ' + e)
    print('docs:', 'PASS' if not errs else f'FAIL ({len(errs)})')
    return 0 if not errs else 1


if __name__ == '__main__':
    sys.exit(main())
