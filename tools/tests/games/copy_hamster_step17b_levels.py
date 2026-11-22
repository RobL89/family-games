"""Hamster Highway step 17b (ii): copies the four agreed designs of levels 25 to 28 (D-215) from their masters,
mock_hamster_step17b_levels.py 0.1's DESIGNS, into games/hamster-highway/levels.js, by script, never by hand.
Version 0.1 (22 Nov).

For each of L13, L13b, L14 and L14b it keeps levels.js's first line (id, name, room, spot, back, new, twin, roads,
pudding: kept so saved progress stays valid, D-215), adds `trap: 'stick'` where the design names one, and replaces the
tray, spare, parts and rows with the design's. Then it checks the copy: node imports the new levels.js and every one of
the four levels equals its design's def key for key (JSON), and the other levels are byte-identical to before. Writes
nothing if a check fails.

Usage, from the repo root (once; a second run finds the levels already copied and says so):
    python3 -B tools/tests/games/copy_hamster_step17b_levels.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEVELS = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway', 'levels.js'))
MOCK = os.path.join(HERE, 'mock_hamster_step17b_levels.py')

# DESIGNS only: the mock script's text up to its scratch worktree, run with no arguments (no fault planted)
src = open(MOCK, encoding='utf-8').read()
cut = src.index('# ---------------------------------------------------------------- the scratch worktree')
ns = {'__file__': MOCK, '__name__': 'designs'}
argv, sys.argv = sys.argv, [MOCK]
exec(compile(src[:cut], MOCK, 'exec'), ns)
sys.argv = argv
DESIGNS = {d['def']['id']: d['def'] for d in ns['DESIGNS']}
assert list(DESIGNS) == ['L13', 'L13b', 'L14', 'L14b'], list(DESIGNS)


def js(v):
    """A value as levels.js writes it: single quotes, spaces inside braces."""
    if isinstance(v, str):
        return "'" + v + "'"
    if isinstance(v, bool) or v is None:
        return {True: 'true', False: 'false', None: 'null'}[v]
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        return '[' + ', '.join(js(x) for x in v) + ']'
    return '{ ' + ', '.join(f'{k}: {js(x)}' for k, x in v.items()) + ' }'


old = open(LEVELS, encoding='utf-8').read()
new = old
for lid, d in DESIGNS.items():
    m = re.search(r"  \{\n    (id: '" + re.escape(lid) + r"',[^\n]*)\n(.*?)\n  \},\n", new, re.S)
    assert m, lid
    first = m.group(1)
    if d.get('trap') and 'trap:' not in first:
        first = first.rstrip(',') + f", trap: {js(d['trap'])},"
    body = [f"    tray: {js(d['tray'])}," + (f" spare: {js(d['spare'])}," if d.get('spare') else '')]
    if d.get('parts'):
        body.append(f"    parts: {js(d['parts'])},")
    body.append('    rows: [')
    body += [f"      '{row}'," for row in d['rows']]
    body.append('    ],')
    new = new[:m.start()] + '  {\n    ' + first + '\n' + '\n'.join(body) + '\n  },\n' + new[m.end():]
if new == old:
    print('levels.js already holds the four designs: nothing to copy')
    sys.exit(0)

# the check: the new text, imported by node, gives each design's def key for key; the other levels unchanged
CHECK = r'''
const [url, want] = process.argv.slice(1);
const { LEVELS } = await import(url);
console.log(JSON.stringify(LEVELS));
'''
tmp = LEVELS + '.copy.mjs'
open(tmp, 'w', encoding='utf-8').write(new)
try:
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK, 'file://' + tmp, ''], capture_output=True, text=True)
    r0 = subprocess.run(['node', '--input-type=module', '-e', CHECK, 'file://' + LEVELS, ''], capture_output=True, text=True)
finally:
    os.remove(tmp)
assert r.returncode == 0 and r0.returncode == 0, r.stderr + r0.stderr
got = {x['id']: x for x in json.loads(r.stdout)}
before = {x['id']: x for x in json.loads(r0.stdout)}
bad = []
for lid, d in DESIGNS.items():
    g = dict(got[lid])
    want = {k: v for k, v in d.items() if v is not None or k in g}
    if json.dumps(g, sort_keys=True) != json.dumps(want, sort_keys=True):
        bad.append(f'{lid}: {g} against {want}')
others = [i for i in before if i not in DESIGNS and json.dumps(before[i], sort_keys=True) != json.dumps(got.get(i), sort_keys=True)]
if list(got) != list(before):
    bad.append(f'the level order changed: {list(got)}')
if others:
    bad.append(f'other levels changed: {others}')
if bad:
    print('FAIL, levels.js not written:\n  ' + '\n  '.join(bad))
    sys.exit(1)
open(LEVELS, 'w', encoding='utf-8').write(new)
print(f'ok   levels.js: L13, L13b, L14 and L14b copied from DESIGNS, each equal to its design key for key; the other {len(before) - 4} levels unchanged')
