"""Hamster Highway: the numbers behind step 12's assessment of 9-tall boards and the twig signpost (D-185, D-186).
Version 0.1 (17 Nov, step 12). Not part of the close: a measurement, kept so the assessment's figures can be re-run.

It works out, from game.js 1.9's own layout numbers (read from the file, so a change there shows here):
  1. the size on screen of a square, a hamster and a tray slot, for today's 7 x 12 window and for 8 x 14 (option A)
     and 9 x 16 (option B), on three screens (assumed sizes: the real phone and PC are measured in step 13's spike);
  2. where the game's files assume 7 rows (ROWS, BH, the 420 and 530 of the layout) or a hamster walking right
     (c + 1 in core.js), listed by line, so the assessment can say how much a change touches.

Rules taken for options A and B (proposed in the assessment, not built): the window shows the option's squares
across; the side tray stays 130 wide and the bottom tray 110 high (as game.js 1.9); in the side tray the slots fill
from y 80 to 80 above GO (GO's top at BH - 84), which is game.js 1.9's 246 units at BH 420.

Usage, from the repo root:
    python3 -B tools/tests/games/measure_hamster_tall_boards.py
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')


def read(name):
    with open(os.path.join(GAME, name), encoding='utf-8') as f:
        return f.read()


GJS, CORE, ART = read('game.js'), read('core.js'), read('art.js')
CELL = int(re.search(r'export const CELL = (\d+);', ART).group(1))
SC = float(re.search(r'const SC = ([\d.]+);', GJS).group(1))
step = re.search(r"const step = Math\.min\((\d+), (\d+) / kinds\.length\);\n\s+return kinds\.map\(\(kind, i\) => \(\{ kind, x: BW \+ 17, y: (\d+) \+ i \* step, w: (\d+), h: step - (\d+)", GJS)
STEP_MAX, ROOM7, SLOT_Y, SLOT_W, GAP = (int(x) for x in step.groups())
bottom = re.search(r"x: 100 \+ 94 \* i, y: BH \+ 11, w: (\d+), h: (\d+)", GJS)
BSLOT_W, BSLOT_H = (int(x) for x in bottom.groups())
side_w = int(re.search(r"rect\(BW, 0, (\d+), BH", GJS).group(1))
bottom_h = int(re.search(r"rect\(0, BH, BW, (\d+)", GJS).group(1))
HAM_H = 73   # a standing hamster's art, art.js 1.5's hamster('walk1'): its right ear's circle (13, -63, r 10) tops out at y -73; feet at 0
print(f'from game.js 1.9: CELL {CELL}, SC {SC}, side tray {side_w} wide, bottom tray {bottom_h} high, '
      f'side slots from y {SLOT_Y}, step min({STEP_MAX}, {ROOM7} / kinds), {SLOT_W} wide, gap {GAP}; bottom slots {BSLOT_W} x {BSLOT_H}')

SCREENS = {'phone 844x390': (844, 390), 'PC 1366x650': (1366, 650), 'PC 1920x950': (1920, 950)}
OPTS = [('today', 7, 12), ('A', 8, 14), ('B', 9, 16)]


def layout(W, H, rows, cols):
    bw, bh = cols * CELL, rows * CELL
    side = min(W / (bw + side_w), H / bh)
    bot = min(W / bw, H / (bh + bottom_h))
    return (side, 'side') if side >= bot else (bot, 'bottom')


print('\n1. Sizes on screen (px). Square = CELL x k; hamster = 73 units x SC x k; side-tray slot height for 3, 5 and 7 kinds')
for name, rows, cols in OPTS:
    bh = rows * CELL
    room = ROOM7 + (bh - 7 * CELL)   # the slots' room grows with the board's height
    for sname, (W, H) in SCREENS.items():
        k, lay = layout(W, H, rows, cols)
        slots = ', '.join(f'{n}: {(min(STEP_MAX, room / n) - GAP) * k:.0f}' for n in (3, 5, 7))
        extra = f'slot heights ({slots}), {SLOT_W * k:.0f} wide' if lay == 'side' else f'bottom slots {BSLOT_W * k:.0f} x {BSLOT_H * k:.0f}'
        print(f'  {name:5} {rows} x {cols:2} {sname:13} {lay:6} square {CELL * k:5.1f}  hamster {HAM_H * SC * k:4.1f}  {extra}')

print('\n2. Where the code assumes 7 rows or walking right')
def where(text, name, pat):
    hits = [(i + 1, l.strip()) for i, l in enumerate(text.split('\n')) if re.search(pat, l) and not l.strip().startswith('//')]
    print(f'  {name}: {len(hits)} lines match /{pat}/')
    for n, l in hits:
        print(f'    {n:4}: {l[:110]}')
    return len(hits)

where(CORE, 'core.js 1.6', r'\bROWS\b')
where(GJS, 'game.js 1.9', r'\bROWS\b|\bBH\b|\b420\b|\b530\b')
where(CORE, 'core.js 1.6', r'c \+ 1|c \+= 1|on\.i \+ 1|i === 2|i < 2')
where(GJS, 'game.js 1.9', r'c \+ 1|\(a\.c \+ 1\)')
with open(os.path.join(HERE, 'solve_hamster_highway.py'), encoding='utf-8') as f:
    where(f.read(), 'solve_hamster_highway.py 1.4', r'\bROWS\b')
