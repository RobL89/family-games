"""Build the launcher's private preview (P57). Version 1.

Rob tries launcher changes on his phone and PC before he says "publish". The preview is a
private claude.ai artifact made from the launcher's own files, with one change: a claude.ai page
may not call other sites, so the Apps Script is replaced by a stand-in Sheet (preview-sheet.js)
that keeps made-up players in the browser. The real Sheet is never touched.

What changes on the way in, and nothing else:
  - shared/api.js: call() answers from shared/preview-sheet.js instead of the Apps Script;
  - shared/preview-sheet.js is added (a copy of tools/preview/preview-sheet.js);
  - games left out with --leave-out are marked "hidden" in games.json, so they have no tile;
  - index.html gets a small stamp under the page: the preview number, the commit the files
    match ("+changes" if the working tree differs from it), a short hash of the files, and a
    Reset link that starts the stand-in's data again.

Every other file is copied byte for byte. Only games a child can open (ready or testing) go in,
less any named with --leave-out (for example a big artifact game Rob can try at its maker's own
link instead). Same inputs give the same bytes.

Usage, from the repo root:
    python3 -B tools/preview/build_preview.py --number 1 [--out PATH] [--leave-out ID ...]
It prints the output folder and writes files.json there: the list Claude publishes with
publish_files (each file's served path and its path on disk). files.json itself isn't published.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))

# What the launcher serves: the two pages, the games list, shared code and the games.
TOP_FILES = ['index.html', 'play.html', 'games.json']
FOLDERS = ['shared', 'games']

STAND_INS = [
    ('shared/api.js',
     "import { CONFIG } from './config.js';\n",
     "import { CONFIG } from './config.js';\n"
     "import { standIn } from './preview-sheet.js'; // Preview only (tools/preview): the stand-in Sheet\n"),
    ('shared/api.js',
     "export async function call(action, data = {}) {\n",
     "export async function call(action, data = {}) {\n"
     "  return standIn(action, { ...data, code: getFamilyCode() }); // Preview only: never the real Sheet\n"),
]

STAMP = """
<!-- Preview only (tools/preview/build_preview.py) -->
<div style="position:relative;z-index:1;width:max-content;max-width:calc(100% - 24px);margin:-3.5rem auto 1rem;font:600 11px/1.3 system-ui,sans-serif;color:#2B2118;background:rgba(255,255,255,.75);padding:2px 6px;border-radius:6px">
  Preview {number} · {commit} · {short} · <button id="preview-reset" type="button" style="font:inherit;text-decoration:underline;background:none;border:0;padding:0;cursor:pointer">Reset</button>
</div>
<script type="module">
  import {{ resetStandIn }} from './shared/preview-sheet.js';
  document.getElementById('preview-reset').addEventListener('click', () => {{ resetStandIn(); location.href = 'index.html'; }});
</script>
"""


class BuildError(Exception):
    pass


def git(*args):
    return subprocess.run(['git', '-C', REPO, *args], check=True, capture_output=True, text=True).stdout


LEAVE_OUT = set()  # game ids left out of this build (--leave-out)


def playable_folders():
    """Game folders a child can open: ready or testing in games.json, plus games/_common/.
    "Soon" and hidden games and games/_template/ can't be opened, so they stay out of the preview."""
    with open(os.path.join(REPO, 'games.json'), encoding='utf-8') as f:
        games = json.load(f).get('games', [])
    return ['games/_common/'] + [f"games/{g['id']}/" for g in games
                                 if g.get('status') in ('ready', 'testing') and g['id'] not in LEAVE_OUT]


def source_files():
    """The launcher's files in the working tree, tracked or new (ignored files left out), sorted."""
    listed = git('ls-files', '--cached', '--others', '--exclude-standard', '--', *TOP_FILES, *FOLDERS).split('\n')
    keep = playable_folders()
    files = sorted({f for f in listed if f and os.path.isfile(os.path.join(REPO, f))
                    and (not f.startswith('games/') or any(f.startswith(k) for k in keep))})
    for top in TOP_FILES:
        if top not in files:
            raise BuildError(f'missing {top}')
    return files


def read_bytes(rel):
    with open(os.path.join(REPO, rel), 'rb') as f:
        return f.read()


def build(number, out):
    files = source_files()
    digest = hashlib.sha256()
    for rel in files:
        digest.update(rel.encode() + b'\0' + read_bytes(rel) + b'\0')
    short = digest.hexdigest()[:10]
    commit = git('rev-parse', '--short', 'HEAD').strip()
    if git('status', '--porcelain', '--', *TOP_FILES, *FOLDERS).strip():
        commit += '+changes'

    contents = {rel: read_bytes(rel) for rel in files}
    for rel, old, new in STAND_INS:
        text = contents[rel].decode('utf-8')
        if text.count(old) != 1:
            raise BuildError(f'{rel}: the text to replace is found {text.count(old)} times, not once: {old.strip()[:60]}')
        contents[rel] = text.replace(old, new).encode('utf-8')
    contents['shared/preview-sheet.js'] = read_bytes('tools/preview/preview-sheet.js')
    if LEAVE_OUT:  # a left-out game is hidden in the preview's games.json, so it has no tile
        listing_json = json.loads(contents['games.json'])
        for g in listing_json['games']:
            if g['id'] in LEAVE_OUT:
                g['status'] = 'hidden'
        contents['games.json'] = (json.dumps(listing_json, indent=2) + '\n').encode('utf-8')

    page = contents['index.html'].decode('utf-8')
    if page.count('</body>') != 1:
        raise BuildError('index.html: no single </body>')
    stamp = STAMP.format(number=number, commit=commit, short=short)
    contents['index.html'] = page.replace('</body>', stamp + '</body>').encode('utf-8')

    # Start from an empty folder, so no file from an older build is left behind. Only a folder this
    # script made before (it has files.json) is cleared.
    if os.path.exists(out):
        if not os.path.isfile(os.path.join(out, 'files.json')):
            raise BuildError(f'{out} exists and is not an earlier preview build; choose another --out')
        shutil.rmtree(out)
    os.makedirs(out)
    listing = []
    for rel in sorted(contents):
        path = os.path.join(out, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            f.write(contents[rel])
        listing.append({'as': rel, 'path': os.path.abspath(path)})
    with open(os.path.join(out, 'files.json'), 'w', encoding='utf-8') as f:
        json.dump(listing, f, indent=1)
    return commit, short, len(listing)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--number', type=int, required=True, help='the preview number shown in the stamp')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(REPO), 'family-games-preview'),
                    help='where to write the build (outside the repo; it is a build, not a master)')
    ap.add_argument('--leave-out', nargs='*', default=[], metavar='ID', help='game ids to leave out of this build')
    a = ap.parse_args()
    LEAVE_OUT.update(a.leave_out)
    try:
        commit, short, count = build(a.number, os.path.abspath(a.out))
    except BuildError as e:
        sys.exit(f'build_preview: {e}')
    print(f'{os.path.abspath(a.out)}  preview {a.number}, {commit}, files {short}, {count} files')


if __name__ == '__main__':
    main()
