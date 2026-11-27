"""Hamster Highway step 18b (ii): copies level 30, Confetti party (L15b), as Rob agreed it on its sketch page v0.2
(D-243), from its master into games/hamster-highway/levels.js, by script, never by hand. Version 0.1 (27 Nov). A copy of
copy_hamster_step18a_level.py 0.1 with the master, the level and the first line's fields changed.

The master: DESIGN in mock_hamster_level30.py 0.2 (ef7e876), read by running the script's text up to its scratch
worktree (no fault planted, nothing drawn).

It writes the design's def whole as a new level after the last one (L15, level 29): its first line (id, name, room,
spot, back, new, twin, roads, pudding, in that order, as levels.js writes them) and its tray, parts and rows. Then it
checks the copy: node imports the new levels.js, L15b equals the design's def key for key (JSON), the levels before it
are in the same order and byte-identical (as JSON) to before, and L15b is last. Writes nothing if a check fails; copies
nothing if L15b is there already (then it only checks).

--core prints the core test's text for L15b (its SOL entry, ROADS, WRONG's names and gadgets) from the master, for
pasting by tool; --check-core checks the core test's SOL, ROADS and WRONG for L15b against the master (each list equal,
in order), and is run after every copy too, once the core test holds them.

L15b is a twin with no spare: its SOL answer is its first road that takes the seed (road B), its seed list empty, and
ROADS lists all three roads.

Usage, from the repo root:
    python3 -B tools/tests/games/copy_hamster_step18b_level.py [--core | --check-core]
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEVELS = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway', 'levels.js'))
CORE = os.path.join(HERE, 'test_hamster_highway_core.py')
MASTER = 'mock_hamster_level30.py'
LID = 'L15b'
AFTER = 'L15'
FIRST = ['id', 'name', 'room', 'spot', 'back', 'new', 'twin', 'roads', 'pudding']


def design():
    path = os.path.join(HERE, MASTER)
    src = open(path, encoding='utf-8').read()
    cut = src.index('# ---------------------------------------------------------------- the scratch worktree')
    ns = {'__file__': path, '__name__': 'design'}
    argv, sys.argv = sys.argv, [path]
    exec(compile(src[:cut], path, 'exec'), ns)
    sys.argv = argv
    d = ns['DESIGN']
    assert d['def']['id'] == LID and ns['FAULT'] == 0, (d['def']['id'], ns['FAULT'])
    return d


D = design()


def js(v):
    """A value as levels.js writes it: single quotes, spaces inside braces."""
    if isinstance(v, str):
        return "'" + v.replace("'", "\\'") + "'"
    if isinstance(v, bool) or v is None:
        return {True: 'true', False: 'false', None: 'null'}[v]
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        return '[' + ', '.join(js(x) for x in v) + ']'
    return '{ ' + ', '.join(f'{k}: {js(x)}' for k, x in v.items()) + ' }'


def plain(lst):
    return [list(g) for g in lst]


def split():
    """The design's roads as the core test holds them: SOL (the first road that takes the seed, its seed list empty),
    ROADS (every right road, in order) and WRONG (name and gadgets)."""
    seedroad = next(r for r in D['roads'] if r.get('seed'))
    sol = {'solve': plain(seedroad['placed']), 'seed': []}
    return sol, [plain(r['placed']) for r in D['roads']], [(w['name'], plain(w['placed'])) for w in D['wrong']]


if '--core' in sys.argv:
    sol, roads, wrong = split()
    print(f"  {LID}: {{ solve: {js(sol['solve'])}, seed: {js(sol['seed'])} }},\n")
    print(f'  {LID}: [')
    for r in roads:
        print(f'    {js(r)},')
    print('  ],\n')
    print(f'  {LID}: [')
    for name, placed in wrong:
        print(f'    [{js(name)}, {js(placed)}],')
    print('  ],')
    sys.exit(0)

CORE_JS = r'''
const [src] = process.argv.slice(1);
const grab = (name) => { const i = src.indexOf(`const ${name} = {`); if (i < 0) return null; const e = src.indexOf('\n};\n', i); const line = src.slice(i, src.indexOf('\n', i));
  return line.endsWith('};') ? line : src.slice(i, e + 3); };
const out = {};
for (const n of ['SOL', 'ROADS', 'WRONG']) { const t = grab(n); out[n] = t ? eval('(' + t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1).replace(/SOL\.(\w+)\.solve/g, '"SOL:$1"') + ')') : null; }
console.log(JSON.stringify(out));
'''


def check_core():
    """The core test's SOL, ROADS and WRONG for L15b, against the master: each list equal, in order."""
    src = open(CORE, encoding='utf-8').read()
    i = src.index('const SOL = {\n  L1:')   # the main SOL (the core test has a second, smaller one further on)
    j = src.index("\n'''", i)
    r = subprocess.run(['node', '-e', CORE_JS, src[i:j]], capture_output=True, text=True)
    if r.returncode != 0:
        return [f'the core test\'s SOL, ROADS and WRONG could not be read: {r.stderr[-300:]}']
    got = json.loads(r.stdout)
    sol, roads, wrong = split()
    bad = []
    if not got['SOL'] or got['SOL'].get(LID) != sol:
        bad.append(f'SOL.{LID}: {got["SOL"] and got["SOL"].get(LID)} against {sol}')
    gr = [(got['SOL'][x[4:]]['solve'] if isinstance(x, str) and x.startswith('SOL:') else x) for x in ((got['ROADS'] or {}).get(LID) or [])]
    if gr != roads:
        bad.append(f'ROADS.{LID}: {gr} against {roads}')
    gw = [(w[0], w[1]) for w in ((got['WRONG'] or {}).get(LID) or [])]
    if gw != [(n, p) for n, p in wrong]:
        bad.append(f'WRONG.{LID}: {gw} against {wrong}')
    return bad


def say_core():
    cb = check_core()
    print('FAIL ' + '\n     '.join(cb) if cb else f'ok   the core test\'s SOL, ROADS and WRONG for level 30 ({LID}) equal the master\'s DESIGN, in order')
    return 1 if cb else 0


if '--check-core' in sys.argv:
    sys.exit(say_core())

CHECK = r'''
const [url] = process.argv.slice(1);
const { LEVELS } = await import(url);
console.log(JSON.stringify(LEVELS));
'''


def levels_of(path):
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK, 'file://' + path], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


old = open(LEVELS, encoding='utf-8').read()
dd = D['def']
want = {k: v for k, v in dd.items() if v is not None or k == 'new'}
if f"id: '{LID}'," in old:
    got = {x['id']: x for x in levels_of(LEVELS)}
    same = json.dumps(got.get(LID), sort_keys=True) == json.dumps(want, sort_keys=True)
    print(('ok   ' if same else 'FAIL ') + f'levels.js already holds {LID}: nothing to copy; it {"equals" if same else "differs from"} the master\'s design key for key')
    sys.exit(say_core() or (0 if same else 1))

m = re.search(r"  \{\n    id: '" + re.escape(AFTER) + r"',[^\n]*\n.*?\n  \},\n(\];\n)", old, re.S)
assert m, AFTER
first = ', '.join(f'{k}: {js(dd.get(k))}' for k in FIRST if k in dd and (dd[k] is not None or k == 'new')) + ','
body = [f"    tray: {js(dd['tray'])}," + (f" spare: {js(dd['spare'])}," if dd.get('spare') else '')]
if dd.get('parts'):
    body.append(f"    parts: {js(dd['parts'])},")
body.append('    rows: [')
body += [f"      '{row}'," for row in dd['rows']]
body.append('    ],')
extra = set(dd) - set(FIRST) - {'tray', 'spare', 'parts', 'rows'}
assert not extra, f'the design has fields this script does not write: {extra}'
new = old[:m.start(1)] + '  {\n    ' + first + '\n' + '\n'.join(body) + '\n  },\n' + old[m.start(1):]

tmp = LEVELS + '.copy.mjs'
open(tmp, 'w', encoding='utf-8').write(new)
try:
    after = levels_of(tmp)
finally:
    os.remove(tmp)
before = levels_of(LEVELS)
bad = []
if [x['id'] for x in after] != [x['id'] for x in before] + [LID]:
    bad.append(f'the level order: {[x["id"] for x in after]}')
if json.dumps(after[-1], sort_keys=True) != json.dumps(want, sort_keys=True):
    bad.append(f'{LID}: {after[-1]} against {want}')
changed = [b['id'] for a, b in zip(after, before) if json.dumps(a, sort_keys=True) != json.dumps(b, sort_keys=True)]
if changed:
    bad.append(f'other levels changed: {changed}')
if bad:
    print('FAIL, levels.js not written:\n  ' + '\n  '.join(bad))
    sys.exit(1)
open(LEVELS, 'w', encoding='utf-8').write(new)
print(f'ok   levels.js: {LID} copied from the master\'s DESIGN after {AFTER}, equal to it key for key; the other {len(before)} levels unchanged, in the same order')
sys.exit(say_core())
