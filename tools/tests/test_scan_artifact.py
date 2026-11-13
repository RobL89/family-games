"""Checks tools/scan_artifact.py (P80) against the three artifact games it was built from.
Run from the repo root: `python3 -I tools/tests/test_scan_artifact.py`. Ends "PASS n of n"."""
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCAN = os.path.join(ROOT, 'tools', 'scan_artifact.py')
results = []


def run(*args):
    p = subprocess.run([sys.executable, '-I', SCAN, *args], cwd=ROOT, capture_output=True, text=True)
    return p.returncode, p.stdout


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))


# What each game is known to do (from taking them in, P66 to P72, P77).
EXPECT = {
    'kriss-kross': ['kk.letters, kk.title, kk.words', '[Own buttons] prints'],
    'number-town': ['numberTown.player.', 'numberTown.players.v1', '[Saves on leaving]', '[Own players]', '[Sound] makes sound', 'three.js/r128'],
    'space-explorer': ['spaceExplorer.place', '[Sound] speaks', '[Permissions]', 'three.js/r128'],
}
for game, wants in EXPECT.items():
    page = f'games/{game}/original.html'
    _, out = run(page)
    for w in wants:
        check(f'{game}: finds {w}', w in out, out[:300])
    code, out = run(page, page, f'games/{game}/adapter.js')
    check(f'{game}: an unchanged update passes', code == 0 and 'still there' in out, out)

# A broken update: a key renamed and a button the adapter uses renamed.
with tempfile.TemporaryDirectory() as tmp:
    new = os.path.join(tmp, 'new.html')
    with open(os.path.join(ROOT, 'games/kriss-kross/original.html'), encoding='utf-8') as f:
        text = f.read().replace('id="hintBtn"', 'id="hintButton"').replace('kk.title', 'kk.name')
    with open(new, 'w', encoding='utf-8') as f:
        f.write(text)
    code, out = run('games/kriss-kross/original.html', new, 'games/kriss-kross/adapter.js')
    check('a broken update fails', code == 1, out)
    check('it names the changed key', 'Gone: kk.title. New: kk.name.' in out, out)
    check('it names the lost id', 'lost: hintBtn' in out, out)

print(f'\nPASS {sum(results)} of {len(results)}' if all(results) else f'\n{len(results) - sum(results)} FAILED of {len(results)}')
sys.exit(0 if all(results) else 1)
