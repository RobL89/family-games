"""Bench, not part of the close: plants faults in the rocket games' hangar (step 2a-4b) and counts
how many the tests catch. Version 1.1.

Changes at v1.1 (step 2a-4c): six faults for the Premium and Legendary ships (a price, a ship
switched off, the ship drawn past the ground's edge, less motion not handed on, the Phoenix's
wings beating when calm, every ship landing with Classic's sound); the Aurora Cruiser's fault now
switches it off. Each browser run may take 10 minutes before it counts as caught; the whole bench
takes about 50 minutes.

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/
folders (a temporary folder), run against the test meant to catch it: fleet.js's faults against
test_rocket_fleet_core.py (by Node, seconds), the rest against test_rocket_hangar_e2e.py (about
2 minutes each). The repo itself is never changed. A fault whose text isn't found exactly once
is an error, not a catch. First run, step 2a-4b: 13 of 13 caught.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_hangar.py [repo folder, default .]
"""
import os, shutil, subprocess, sys, tempfile
REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
M = [
 ('fleet', 'games/_common/rocket/fleet.js', "price: 20, sound: 'boing'", "price: 21, sound: 'boing'"),
 ('fleet', 'games/_common/rocket/fleet.js', "return rocksOf(p) >= s.price ? 'buy' : 'need';", "return rocksOf(p) > s.price ? 'buy' : 'need';"),
 ('fleet', 'games/_common/rocket/fleet.js', "rocks: rocksOf(p) - FLEET_BY_ID[id].price,", "rocks: rocksOf(p),"),
 ('fleet', 'games/_common/rocket/fleet.js', "FLEET.filter((s) => s.flies && (", "FLEET.filter((s) => ("),
 ('fleet', 'games/_common/rocket/fleet.js', "  if (!h.ships.includes(id)) return null;\n  return { ...p, ship: id", "  return { ...p, ship: id"),
 ('fleet', 'games/_common/rocket/fleet.js', "price: 200, sound: 'aurora', flies: true", "price: 200, sound: 'aurora', flies: false"),
 ('fleet', 'games/_common/rocket/fleet.js', "price: 100, sound: 'chime'", "price: 101, sound: 'chime'"),
 ('hangar', 'games/_common/rocket/kit.js', 'const FORMAT = 2;', 'const FORMAT = 1;'),
 ('hangar', 'games/_common/rocket/kit.js', 'const READS = [1, 2];', 'const READS = [2];'),
 ('hangar', 'games/_common/rocket/round.js', "buy: (id) => { const p = buyShip(progress, id); if (!p) return false; progress = p; keep(); return true; },", "buy: (id) => { const p = buyShip(progress, id); if (!p) return false; progress = p; return true; },"),
 ('hangar', 'games/_common/rocket/hangar.js', 'this.io.pick(B.toId); this.bip = null;', 'this.bip = null;'),
 ('hangar', 'games/_common/rocket/round.js', "flyShip = progress.ship !== STARTER && SHIP_BY_ID[progress.ship] ? SHIP_BY_ID[progress.ship] : null;", "flyShip = null;"),
 ('hangar', 'games/_common/rocket/round.js', "    Object.assign(p, hangarOf(p)); // D-053", "    // Object.assign(p, hangarOf(p)); // D-053"),
 ('hangar', 'games/_common/rocket/hangar.js', "if (this.door.k > 0.95 && !this.closing) { circleBtn", "if (false) { circleBtn"),
 ('hangar', 'games/_common/rocket/fleet.js', "price: 140, sound: 'harp', flies: true", "price: 140, sound: 'harp', flies: false"),
 ('hangar', 'games/_common/rocket/round.js', "PP.draw(ctx, 'back');\n    drawShip(ctx, flyShip, SH, t);", "PP.draw(ctx, 'back');\n    ctx.restore(); ctx.save();\n    drawShip(ctx, flyShip, SH, t);"),
 ('hangar', 'games/_common/rocket/round.js', "inPlay: true, calm: scene.calm });", "inPlay: true, calm: false });"),
 ('hangar', 'games/_common/rocket/ships.js', "  if (!S.calm) S.flapT +=", "  S.flapT +="),
 ('hangar', 'games/_common/rocket/round.js', "const touch = (FLEET_BY_ID[progress.ship] || FLEET_BY_ID[STARTER]).sound;", "const touch = 'thud';"),
]
TEST = {'fleet': 'tools/tests/games/test_rocket_fleet_core.py', 'hangar': 'tools/tests/games/test_rocket_hangar_e2e.py'}
caught = 0
for i, (kind, f, a, b) in enumerate(M, 1):
    d = tempfile.mkdtemp(prefix='mut-')
    for sub in ('games', 'tools'):
        shutil.copytree(os.path.join(REPO, sub), os.path.join(d, sub))
    p = os.path.join(d, f); s = open(p).read()
    assert s.count(a) == 1, (i, a)
    open(p, 'w').write(s.replace(a, b))
    try:
        r = subprocess.run([sys.executable, '-B', os.path.join(d, TEST[kind])], cwd=d, capture_output=True, text=True, timeout=600)
        hit = r.returncode != 0
    except subprocess.TimeoutExpired:
        hit = True
    caught += hit
    print(f'{i:2} {"caught" if hit else "MISSED"}  {f}: {a[:60]!r}', flush=True)
    shutil.rmtree(d, ignore_errors=True)
print(f'{caught} of {len(M)} caught')
