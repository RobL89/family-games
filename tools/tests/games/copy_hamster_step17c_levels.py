"""Hamster Highway step 17c (ii): copies the six agreed designs of levels 22, 24, 25, 26, 27 and 28 (D-226, D-229) from
their masters into games/hamster-highway/levels.js, by script, never by hand. Version 0.1 (24 Nov). The shape of
copy_hamster_step17b_levels.py 0.1.

The masters: DESIGNS in mock_hamster_step17c_levels.py 0.2.1 (L11b, L12b, L13, L14: levels 22, 24, 25, 27) and in
mock_hamster_step17c_more.py 0.1 (L13b, L14b: levels 26 and 28), read by running each script's text up to its scratch
worktree (no fault planted, nothing drawn).

For each of the six it writes the design's def whole: its first line (id, name, room, spot, back, new, twin, roads,
pudding, trap, in that order, as levels.js writes them) and its tray, spare, parts and rows. The ids, names, places,
backdrops, new things, twins, Pudding's places and traps must equal levels.js 1.11's (saved progress stays valid,
D-226, D-229); only `roads` may change (22, 24 and 26 now name 3). Then it checks the copy: node imports the new
levels.js and every one of the six equals its design's def key for key (JSON), the order of the levels is unchanged and
the other levels are byte-identical (as JSON) to before. Writes nothing if a check fails.

--core prints the core test's text for the six (SOL entries, ROADS, WRONG's names and gadgets) from the masters, for
pasting by tool; --check-core checks the core test's SOL, ROADS and WRONG against the masters (each list equal, in
order), and is run after every copy too, once the core test holds them.

Usage, from the repo root:
    python3 -B tools/tests/games/copy_hamster_step17c_levels.py [--core | --check-core]
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEVELS = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway', 'levels.js'))
CORE = os.path.join(HERE, 'test_hamster_highway_core.py')
MASTERS = ['mock_hamster_step17c_levels.py', 'mock_hamster_step17c_more.py']
IDS = ['L11b', 'L12b', 'L13', 'L13b', 'L14', 'L14b']
FIRST = ['id', 'name', 'room', 'spot', 'back', 'new', 'twin', 'roads', 'pudding', 'trap']
KEPT = ['id', 'name', 'room', 'spot', 'back', 'new', 'twin', 'pudding', 'trap']


def designs():
    out = {}
    for m in MASTERS:
        path = os.path.join(HERE, m)
        src = open(path, encoding='utf-8').read()
        cut = src.index('# ---------------------------------------------------------------- the scratch worktree')
        ns = {'__file__': path, '__name__': 'designs'}
        argv, sys.argv = sys.argv, [path]
        exec(compile(src[:cut], path, 'exec'), ns)
        sys.argv = argv
        for d in ns['DESIGNS']:
            out[d['def']['id']] = d
    assert sorted(out) == sorted(IDS), sorted(out)
    return {i: out[i] for i in IDS}


D = designs()


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
    return [[k, c, r] for k, c, r in lst]


def split(lid):
    """A design's roads as the core test holds them: SOL (a twin's answer is its seed road, its seed list empty; a first
    level's answer is the road its seed road adds the spare to, its seed list that spare), ROADS (every right road, a
    first level's seed road left out: it is a road with the spare added) and WRONG (name and gadgets)."""
    d = D[lid]
    first = d['def'].get('twin') is None
    seedroad = next(r for r in d['roads'] if r.get('seed'))
    if first:
        roads = [r for r in d['roads'] if r is not seedroad]
        base = next(r for r in roads if plain(seedroad['placed'][:len(r['placed'])]) == plain(r['placed']))
        sol = {'solve': plain(base['placed']), 'seed': plain(seedroad['placed'][len(base['placed']):])}
    else:
        roads = d['roads']
        sol = {'solve': plain(seedroad['placed']), 'seed': []}
    return sol, [plain(r['placed']) for r in roads], [(w['name'], plain(w['placed'])) for w in d['wrong']]


if '--core' in sys.argv:
    for lid in IDS:
        sol, roads, wrong = split(lid)
        print(f"  {lid}: {{ solve: {js(sol['solve'])}, seed: {js(sol['seed'])} }},")
    print()
    for lid in IDS:
        print(f'  {lid}: [')
        for r in split(lid)[1]:
            print(f'    {js(r)},')
        print('  ],')
    print()
    for lid in IDS:
        print(f'  {lid}: [')
        for name, placed in split(lid)[2]:
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
    """The core test's SOL, ROADS and WRONG for the six, against the masters: each list equal, in order."""
    src = open(CORE, encoding='utf-8').read()
    i = src.index('const SOL = {\n  L1:')   # the main SOL (the core test has a second, smaller one further on)
    j = src.index("\n'''", i)
    r = subprocess.run(['node', '-e', CORE_JS, src[i:j]], capture_output=True, text=True)
    if r.returncode != 0:
        return [f'the core test\'s SOL, ROADS and WRONG could not be read: {r.stderr[-300:]}']
    got = json.loads(r.stdout)
    bad = []
    for lid in IDS:
        sol, roads, wrong = split(lid)
        if not got['SOL'] or got['SOL'].get(lid) != sol:
            bad.append(f'SOL.{lid}: {got["SOL"] and got["SOL"].get(lid)} against {sol}')
        gr = [(got['SOL'][x[4:]]['solve'] if isinstance(x, str) and x.startswith('SOL:') else x) for x in ((got['ROADS'] or {}).get(lid) or [])]
        if gr != roads:
            bad.append(f'ROADS.{lid}: {gr} against {roads}')
        gw = [(w[0], w[1]) for w in ((got['WRONG'] or {}).get(lid) or [])]
        if gw != [(n, p) for n, p in wrong]:
            bad.append(f'WRONG.{lid}: {gw} against {wrong}')
    return bad


if '--check-core' in sys.argv:
    bad = check_core()
    print('FAIL ' + '\n     '.join(bad) if bad else 'ok   the core test\'s SOL, ROADS and WRONG for the six levels equal the masters\' DESIGNS, in order')
    sys.exit(1 if bad else 0)

old = open(LEVELS, encoding='utf-8').read()
new = old
bad = []
for lid, d in D.items():
    m = re.search(r"  \{\n    (id: '" + re.escape(lid) + r"',[^\n]*)\n(.*?)\n  \},\n", new, re.S)
    assert m, lid
    dd = d['def']
    first = ', '.join(f'{k}: {js(dd.get(k))}' for k in FIRST if k in dd and (dd[k] is not None or k == 'new')) + ','
    body = [f"    tray: {js(dd['tray'])}," + (f" spare: {js(dd['spare'])}," if dd.get('spare') else '')]
    if dd.get('parts'):
        body.append(f"    parts: {js(dd['parts'])},")
    body.append('    rows: [')
    body += [f"      '{row}'," for row in dd['rows']]
    body.append('    ],')
    new = new[:m.start()] + '  {\n    ' + first + '\n' + '\n'.join(body) + '\n  },\n' + new[m.end():]
if new == old:
    print('levels.js already holds the six designs: nothing to copy')
else:
    # the check: the new text, imported by node, gives each design's def key for key; the rest unchanged
    CHECK = r'''
const [url] = process.argv.slice(1);
const { LEVELS } = await import(url);
console.log(JSON.stringify(LEVELS));
'''
    tmp = LEVELS + '.copy.mjs'
    open(tmp, 'w', encoding='utf-8').write(new)
    try:
        r = subprocess.run(['node', '--input-type=module', '-e', CHECK, 'file://' + tmp], capture_output=True, text=True)
        r0 = subprocess.run(['node', '--input-type=module', '-e', CHECK, 'file://' + LEVELS], capture_output=True, text=True)
    finally:
        os.remove(tmp)
    assert r.returncode == 0 and r0.returncode == 0, r.stderr + r0.stderr
    got = {x['id']: x for x in json.loads(r.stdout)}
    before = {x['id']: x for x in json.loads(r0.stdout)}
    for lid, d in D.items():
        want = {k: v for k, v in d['def'].items() if v is not None or k == 'new'}
        if json.dumps(got[lid], sort_keys=True) != json.dumps(want, sort_keys=True):
            bad.append(f'{lid}: {got[lid]} against {want}')
        kept = {k: before[lid].get(k) for k in KEPT}
        if kept != {k: got[lid].get(k) for k in KEPT}:
            bad.append(f'{lid}: its saved-progress fields changed: {kept} against {({k: got[lid].get(k) for k in KEPT})}')
    others = [i for i in before if i not in D and json.dumps(before[i], sort_keys=True) != json.dumps(got.get(i), sort_keys=True)]
    if list(got) != list(before):
        bad.append(f'the level order changed: {list(got)}')
    if others:
        bad.append(f'other levels changed: {others}')
    if bad:
        print('FAIL, levels.js not written:\n  ' + '\n  '.join(bad))
        sys.exit(1)
    open(LEVELS, 'w', encoding='utf-8').write(new)
    print(f'ok   levels.js: {", ".join(D)} copied from the masters\' DESIGNS, each equal to its design key for key, ids, names, places, '
          f'backdrops, new things, twins, Pudding and traps as before; the other {len(before) - len(D)} levels unchanged, the order unchanged')
cb = check_core()
print('FAIL ' + '\n     '.join(cb) if cb else 'ok   the core test\'s SOL, ROADS and WRONG for the six levels equal the masters\' DESIGNS, in order')
sys.exit(1 if cb else 0)
