"""Hamster Highway: two looks for level 9's teacup lift with two cups (D-157), drawn with the game's own art.
Version 0.1 (15 Nov, step 4). Not a check: a sketch page for Rob to pick from.

core.js 1.3 has the rules: two cups on one loop in one column, half a loop apart, so whenever one is stopped at
the bottom the other is stopped at the top, and they pass each other half way. Both looks keep those rules; they
differ only in how the passing is drawn:
  A. One string: both cups ride the middle of the column, and as they pass, the one going up is drawn in front of
     the one coming down.
  B. A loop round two cotton reels: the string goes up on the right and down on the left, so a cup going up sits a
     little right and one coming down a little left; at each end it swings round the reel to the middle, where a
     hamster steps in or out. They pass side by side.
Each look is drawn twice: stopped (a hamster stepping into the bottom cup, one stepping out at the top) and half
way (the cups passing, one carrying a hamster). Rows and squares as level 9's draft (lift at column 8, top 2,
bottom 5). Usage, from the repo root:
    python3 -B tools/tests/games/sketch_hamster_lift.py OUT.html
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-lift.html'

JS = r'''
const [artUrl] = process.argv.slice(1);
const A = await import(artUrl);
const out = { walk: A.hamster('walk1'), happy: A.hamster('home'), block: {} };
for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) out.block[`${c},${r}`] = A.block(c, r, r === 0 || r === 2 || (c < 8 && r === 5));
console.log(JSON.stringify(out));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'art.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
ART = json.loads(r.stdout)
CELL, INK = 60, '#1B1446'
C, TOP, BOT = 8, 2, 5
CX = (C + 0.5) * CELL
# the little board: cols 5 to 11 of level 9's draft, the step, the pit, the bench
ROWS = ['............', '............', '.........###', '.........###', '......#..###', '########.###', '############']


def ham(x, y, pose='walk', sc=0.56, flip=False):
    art = ART['happy'] if pose == 'happy' else ART['walk']
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({-sc if flip else sc} {sc})">{art}</g>'


def cup_back(x, y):
    # the inside of the cup, behind a hamster riding it; y is the floor line (the hamster's feet)
    return f'<ellipse cx="{x}" cy="{y - 16}" rx="25" ry="6" fill="#B98A7A" stroke="{INK}" stroke-width="2.5"/>'


def cup_front(x, y, hang=''):
    # the bowl (white with pink spots), the handle and a saucer, in front of the hamster
    bowl = (f'<path d="M {x - 26} {y - 16} Q {x - 25} {y + 8} {x - 12} {y + 10} L {x + 12} {y + 10} Q {x + 25} {y + 8} {x + 26} {y - 16} '
            f'Q {x} {y - 9} {x - 26} {y - 16} Z" fill="#FFF8EE" stroke="{INK}" stroke-width="2.6"/>')
    dots = ''.join(f'<circle cx="{x + dx}" cy="{y + dy}" r="3" fill="#FF9BB3"/>' for dx, dy in ((-14, -4), (0, 2), (14, -4), (-6, -10), (8, -10)))
    handle = f'<path d="M {x + 24} {y - 10} q 13 2 6 14 q -3 3 -8 1" fill="none" stroke="{INK}" stroke-width="2.6"/>'
    saucer = f'<ellipse cx="{x}" cy="{y + 12}" rx="30" ry="5" fill="#FFD6E0" stroke="{INK}" stroke-width="2.2"/>'
    return hang + saucer + bowl + dots + handle


def board(body):
    s = '<rect x="0" y="0" width="720" height="420" fill="#F3E3C8"/>'
    s += ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="420" stroke="#E2CBA4" stroke-width="3"/>' for x in range(30, 720, 60))
    for rr, row in enumerate(ROWS):
        for cc, ch in enumerate(row):
            if ch == '#':
                s += ART['block'][f'{cc},{rr}']
    return f'<svg viewBox="270 0 450 420" xmlns="http://www.w3.org/2000/svg">{s}{body}</svg>'


def look_a(stopped):
    s = f'<line x1="{CX}" y1="28" x2="{CX}" y2="352" stroke="#8B5A3C" stroke-width="3"/>'
    s += f'<circle cx="{CX}" cy="28" r="12" fill="#E7B26F" stroke="{INK}" stroke-width="2.6"/><circle cx="{CX}" cy="352" r="10" fill="#E7B26F" stroke="{INK}" stroke-width="2.6"/>'
    if stopped:
        top, bot = TOP * CELL, BOT * CELL
        s += cup_back(CX, top) + ham(CX + 4, top - 4, 'happy') + cup_front(CX, top)
        s += cup_back(CX, bot) + ham(CX - 22, bot - 4) + cup_front(CX, bot) + ham(CX - 60, bot, 'walk')
        s += ham(CX + 62, top, 'walk')
    else:
        down, up = 3.15 * CELL, 3.85 * CELL   # just before they pass, so both show
        s += cup_back(CX, down) + cup_front(CX, down)   # coming down, empty, behind
        s += cup_back(CX, up) + ham(CX, up - 4, 'happy') + cup_front(CX, up)   # going up, in front
        s += ham(CX - 60, BOT * CELL) + ham(CX - 78, BOT * CELL)
    return board(s)


def look_b(stopped):
    off = 16
    s = (f'<path d="M {CX - off} 28 L {CX - off} 352 A {off} {off} 0 0 0 {CX + off} 352 L {CX + off} 28 A {off} {off} 0 0 0 {CX - off} 28 Z" '
         f'fill="none" stroke="#E8505B" stroke-width="3" stroke-dasharray="10 5"/>')
    reel = lambda y: (f'<rect x="{CX - 22}" y="{y - 8}" width="44" height="16" rx="4" fill="#E7B26F" stroke="{INK}" stroke-width="2.4"/>'
                      f'<circle cx="{CX}" cy="{y}" r="4" fill="{INK}"/>')
    s += reel(28) + reel(352)
    if stopped:
        top, bot = TOP * CELL, BOT * CELL
        s += cup_back(CX, top) + ham(CX + 4, top - 4, 'happy') + cup_front(CX, top)
        s += cup_back(CX, bot) + ham(CX - 22, bot - 4) + cup_front(CX, bot) + ham(CX - 60, bot, 'walk')
        s += ham(CX + 62, top, 'walk')
    else:
        mid = 3.5 * CELL
        s += cup_back(CX - off, mid) + cup_front(CX - off, mid)
        s += cup_back(CX + off, mid) + ham(CX + off, mid - 2, 'happy') + cup_front(CX + off, mid)
        s += ham(CX - 66, BOT * CELL) + ham(CX - 84, BOT * CELL)
    return board(s)


page = f'''<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: the teacup lift's look</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #FFF8EE; color: #1B1446; }}
h1 {{ font-size: 1.3rem; margin: 0 0 8px; }} h2 {{ font-size: 1.1rem; margin: 18px 0 4px; }}
p {{ margin: 4px 0 10px; max-width: 60ch; line-height: 1.4; }}
.pair {{ display: flex; flex-wrap: wrap; gap: 12px; }}
figure {{ margin: 0; flex: 1 1 260px; max-width: 360px; }}
figure svg {{ width: 100%; height: auto; border: 2px solid #1B1446; border-radius: 12px; display: block; }}
figcaption {{ font-size: .9rem; margin-top: 4px; }}
@media (prefers-color-scheme: dark) {{ body {{ background: #1B1446; color: #FFF8EE; }} figure svg {{ border-color: #FFF8EE; }} }}
</style></head><body>
<h1>Level 9: how the two teacups pass</h1>
<p>The rules are built (D-157): two cups on one loop, one at the bottom while the other is at the top, passing half way. Only the drawing differs. Pictures 1 and 3: stopped, a hamster stepping in at the bottom and one stepping out at the top. Pictures 2 and 4: half way.</p>
<h2>A. One string: they pass one in front of the other</h2>
<div class="pair"><figure>{look_a(True)}<figcaption>1. Stopped</figcaption></figure><figure>{look_a(False)}<figcaption>2. About to pass: the cup going up in front</figcaption></figure></div>
<h2>B. A loop round two cotton reels: up on the right, down on the left</h2>
<div class="pair"><figure>{look_b(True)}<figcaption>3. Stopped: each cup swings round its reel to the middle</figcaption></figure><figure>{look_b(False)}<figcaption>4. Half way: side by side</figcaption></figure></div>
<p>Sketch only (sketch_hamster_lift.py 0.1); built in the game after your pick.</p>
</body></html>
'''
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(page)
print('wrote', OUT, len(page), 'bytes')
