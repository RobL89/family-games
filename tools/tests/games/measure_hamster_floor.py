"""Hamster Highway: each level's floor, as D-212 counts it, version 0.1 (22 Nov).

For each level with an answer in test_hamster_highway_core.py's SOL, runs the answer (and the answer with its seed
gadgets) through core.js's run() and prints the floor heights the hamsters walk on (the rows of their 'walk' steps,
all five hamsters) and the gadgets placed, with the board size and tray. Written for the 22 Nov chat's measurement
(D-210: levels 25 to 28 walk 1 or 2 heights and place 1 or 2 gadgets; level 20 6 and 8); D-212's check in the core
test will count the same way.

Usage, from the repo root:
    python3 -B tools/tests/games/measure_hamster_floor.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway'))
JS = r'''
const [coreUrl, lvUrl, solJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(lvUrl);
const SOL = JSON.parse(solJson);
const out = [];
for (const def of LEVELS) {
  const s = SOL[def.id]; if (!s) continue;
  const level = core.parseLevel(def);
  for (const [label, gs] of [['answer', s.solve], ['answer+seed', s.solve.concat(s.seed)]]) {
    const placed = {};
    for (const [k, c, r] of gs) placed[core.key(c, r)] = k;
    const res = core.run(level, placed);
    const rows = new Set();
    for (const h of res.hamsters) for (const st of h.steps) if (st.act === 'walk') rows.add(st.r);
    out.push({ id: def.id, label, w: level.cols, h: level.height, tray: Object.values(def.tray || {}).reduce((a, b) => a + b, 0),
      placed: gs.length, home: res.hamsters.filter((x) => x.outcome === 'home').length, walkRows: [...rows].sort((a, b) => a - b) });
  }
}
console.log(JSON.stringify(out));
'''
src = open(os.path.join(HERE, 'test_hamster_highway_core.py')).read()
i = src.index('  L1: { solve:')
body = src[i:src.index('};', i)]
js = re.sub(r'//[^\n]*', '', '{' + body + '}')
js = re.sub(r'(\bL\d+b?):', r'"\1":', js).replace("'", '"').replace('solve:', '"solve":').replace('seed:', '"seed":')
sol = json.loads(re.sub(r',\s*}', '}', js))
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'), 'file://' + os.path.join(GAME, 'levels.js'),
                    json.dumps(sol)], capture_output=True, text=True)
if r.returncode:
    print(r.stderr)
    sys.exit(1)
for x in json.loads(r.stdout):
    print(f"{x['id']:5} {x['label']:12} {x['h']}x{x['w']:<2} tray {x['tray']} placed {x['placed']} home {x['home']} "
          f"heights {len(x['walkRows'])} {x['walkRows']}")
