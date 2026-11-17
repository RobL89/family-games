"""Pins how Hamster Highway's levels 1 to 20 run, so a change to the rules can be shown to leave them byte-identical
(project rules: check a rewrite against the code it replaces). Version 1.0 (17 Nov, step 13, the spike).

For each of the 20 levels in games/hamster-highway/levels.js, with core.js's walk() and run(), it runs a sweep of
placements and hashes the results (each placement's walk() and run() as JSON, one line each, sha256 of the lines):
  - nothing placed; the level's answer; its answer and seed gadget (the answers are the core test's SOL, read from
    test_hamster_highway_core.py, their one home);
  - the answer with each one of its gadgets taken away;
  - one gadget of each kind in the level's tray in every square where it fits, alone, then added to the answer, and to
    the answer and seed gadget.
The pins live in fixture_hamster_runs_1_20.json beside this file, written once from the code before the change
(--write; step 13 wrote them from core.js 1.6 at commit a41b309). test_hamster_highway_core.py compares against
them on every run (pinned(), below).

Usage, from the repo root:
    python3 -B tools/tests/games/pin_hamster_runs.py            # compare with the pins; exit 1 on any difference
    python3 -B tools/tests/games/pin_hamster_runs.py --write    # write the pins (only from the code before a change)
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
PINS = os.path.join(HERE, 'fixture_hamster_runs_1_20.json')
OLD_KINDS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick']   # levels 1 to 20's gadgets

JS = r'''
const [coreUrl, levelsUrl, solJson, kindsJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const SOL = JSON.parse(solJson);
const KINDS = JSON.parse(kindsJson);
const out = {};
for (const d of LEVELS) {
  const lv = core.parseLevel(d);
  const put = (list) => { const p = {}; for (const [k, c, r] of list) p[core.key(c, r)] = k; return p; };
  const ans = put(SOL[d.id].solve);
  const sweep = [{}, ans, { ...ans, ...put(SOL[d.id].seed) }];
  for (const k of Object.keys(ans)) { const p = { ...ans }; delete p[k]; sweep.push(p); }
  const withSeed = sweep[2];
  for (const kind of KINDS) {
    if (!lv.tray[kind]) continue;
    for (const base of [{}, ans, withSeed]) for (const [c, r] of core.fitCells(lv, base, kind)) sweep.push({ ...base, [core.key(c, r)]: kind });
  }
  out[d.id] = sweep.map((p) => JSON.stringify({ p, walk: core.walk(lv, p), run: core.run(lv, p) }));
}
console.log(JSON.stringify(out));
'''


def sol():
    text = open(os.path.join(HERE, 'test_hamster_highway_core.py'), encoding='utf-8').read()
    body = re.search(r'\nconst SOL = \{\n(.*?)\n\};\n', text, re.S).group(1)
    out = {}
    for m in re.finditer(r"^\s*(L\d+b?): \{ solve: (\[.*?\]), seed: (\[.*?\]) \},?\s*$", body, re.M):
        out[m.group(1)] = {'solve': json.loads(m.group(2).replace("'", '"')), 'seed': json.loads(m.group(3).replace("'", '"'))}
    return out


def measure():
    """Each level's sweep: {id: {'n': placements, 'sha256': hash of its lines}}."""
    r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                        'file://' + os.path.join(GAME, 'levels.js'), json.dumps(sol()), json.dumps(OLD_KINDS)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-2000:])
    lines = json.loads(r.stdout)
    return {lid: {'n': len(ls), 'sha256': hashlib.sha256('\n'.join(ls).encode()).hexdigest()} for lid, ls in lines.items()}


def pinned():
    """(ok, what): every level's sweep against the pins."""
    pins = json.load(open(PINS, encoding='utf-8'))
    now = measure()
    differ = sorted(lid for lid in pins['levels'] if now.get(lid) != pins['levels'][lid])
    extra = sorted(set(now) - set(pins['levels']))
    n = sum(v['n'] for v in pins['levels'].values())
    return (not differ and not extra and len(now) == 20,
            f'levels 1 to 20 run byte-identically to the pins from {pins["from"]} ({len(pins["levels"])} levels, {n} placements, '
            f'walk() and run() each; differ: {differ or "none"}{"; not pinned: " + str(extra) if extra else ""})')


def main(argv):
    if '--write' in argv:
        core = open(os.path.join(GAME, 'core.js'), 'rb').read()
        head = subprocess.run(['git', '-C', REPO, 'log', '-1', '--format=%h', '--', 'games/hamster-highway/core.js'], capture_output=True, text=True).stdout.strip()
        ver = re.search(r'Version (\d+(?:\.\d+)+)', core.decode()).group(1)
        data = {'from': f'core.js {ver} (sha256 {hashlib.sha256(core).hexdigest()[:12]}, last changed at {head})',
                'by': 'pin_hamster_runs.py 1.0', 'kinds': OLD_KINDS, 'levels': measure()}
        with open(PINS, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(data, f, indent=1)
            f.write('\n')
        print('wrote', os.path.relpath(PINS, REPO), data['from'], sum(v['n'] for v in data['levels'].values()), 'placements')
        return 0
    ok, what = pinned()
    print(('ok   ' if ok else 'FAIL ') + what)
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
