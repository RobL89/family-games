"""Hamster Highway: sketches for levels 21 to 30 (step 12, D-184 to D-187): the five new things (the spoon catapult,
the twig signpost, the bottle-top button, Pudding the heavy hamster and the sandpit), the signpost's open questions
(Q-065 to Q-067), the zip-line and the park scene, drawn with the game's own art (art.js 1.5) for Rob to pick from.
Not a check of the game and nothing here is built: a sketch page. Version 0.1 (17 Nov, step 12).

Each new thing is shown doing its job under the rule plan-levels-21-30.md 0.2 proposes, in two or three looks
where its look is open. The park is a wide picture like the house view (house.js 1.7: 2420 x 900, stops 56 across
the middle to tap), with ten stops numbered 21 to 30 in pairs along a path from the zip-line, in two looks.

Checks (exit 1 if one fails): the park's path never crosses itself or runs back along itself (D-151's rule, the test
sketch_hamster_cards.py 0.1 uses); ten stops, 21 to 30 in order; no two stops' tap circles overlap (112 apart or
more); every stop inside the picture; nothing in the page would be fetched; every svg closed.
--fault N plants a fault the checks must catch (1: stop 26 on top of 25; 2: the path doubles back across itself;
3: a web address in the page), for testing the checks.

Usage, from the repo root:
    python3 -B tools/tests/games/sketch_hamster_park.py OUT.html [--fault N]
"""
import json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-park.html'

JS = r'''
const [artUrl] = process.argv.slice(1);
const A = await import(artUrl);
const out = { ham: {}, block: {}, water: {}, gadget: {} };
for (const p of ['walk1', 'walk2', 'home', 'stuck', 'bonk', 'boing', 'fall', 'carry1']) out.ham[p] = A.hamster(p);
for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) { out.block[`${c},${r},1`] = A.block(c, r, true); out.block[`${c},${r},0`] = A.block(c, r, false); out.water[`${c},${r}`] = A.water(c, r); }
for (const k of ['bridge', 'ramp', 'bouncer', 'floater', 'tube']) out.gadget[k] = A.gadget(k);
out.stick3 = A.stickArt(3);
out.saw = A.seesawArt();
out.pot = A.potArt(0, 0, 50);
out.start = A.startArt();
out.home = A.homeArt();
out.seed = A.seedArt();
out.duck = A.duck();
out.cupBack = A.teacupBack();
out.cupFront = A.teacupFront();
out.sparkle = A.sparkle(0, 0, 12);
out.star = A.star(0, 0, 8);
out.heart = A.heart(0, 0, 10);
out.back = A.backdrop('veg', 720);
out.FUR = A.FUR; out.BELLY = A.BELLY;
console.log(JSON.stringify(out));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'art.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
ART = json.loads(r.stdout)
INK, SUN, CORAL, PINK, CREAM, GREEN, LEAF = '#1B1446', '#FFC93C', '#FF5D73', '#FF9BB3', '#FFF8EE', '#3CC864', '#62C46F'
WOOD, TWIG, SAND, MUTED, BROWN = '#C98F57', '#8B5A3C', '#F3D58A', '#B5824E', '#C48A4C'
FONT = 'Fredoka, system-ui, sans-serif'
SC = 0.56   # a hamster's size on the board (game.js 1.9's SC)
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


def place(body, x, y, sc=1.0, extra='', flip=False):
    fx = f' scale({-sc} {sc})' if flip else f' scale({sc})'
    return f'<g transform="translate({x:.1f} {y:.1f}){fx}"{extra}>{body}</g>'


def ham(x, y, pose='walk1', sc=SC, flip=False, body=None):
    return place(body or ART['ham'][pose], x, y, sc, flip=flip)


def txt(x, y, s, size, fill=INK, extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="middle" font-weight="700" font-family="{FONT}"{extra}>{s}</text>'


def line(x1, y1, x2, y2, col=INK, w=3, extra=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"{extra}/>'


def rect(x, y, w, h, fill, rx=0, sw=3, stroke=INK, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}/>'


def circ(x, y, rr, fill, sw=3, stroke=INK, extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{rr}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}/>'


def ell(x, y, rx, ry, fill, sw=3, stroke=INK, rot=0, extra=''):
    t = f' transform="rotate({rot} {x} {y})"' if rot else ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{t}{extra}/>'


def path(d, fill='none', w=3, stroke=INK, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'


def dashed(d, col='#5FA8C9', w=4):
    return path(d, 'none', w, col, ' stroke-dasharray="3 10"')


def board(rows, water=()):
    s = ''
    for rr, row in enumerate(rows):
        for cc, ch in enumerate(row):
            if ch == '#':
                top = rr == 0 or rows[rr - 1][cc] != '#'
                s += ART['block'][f'{cc},{rr},{1 if top else 0}']
    for cc, rr in water:
        s += ART['water'][f'{cc},{rr}']
    return s


def sky(w, h, col='#E1F4FC'):
    return f'<rect x="0" y="0" width="{w}" height="{h}" fill="{col}"/>'


def fig(w, h, body, caption, label=None):
    aria = label or re.sub('<[^>]+>', '', caption)
    return f'<figure><svg viewBox="0 0 {w} {h}" role="img" aria-label="{aria}">{body}</svg><figcaption>{caption}</figcaption></figure>'


def gad(kind, c, r, flip=False):
    if flip:
        return place(ART['gadget'][kind], c * 60 + 60, r * 60, 0.6, flip=True)
    return place(ART['gadget'][kind], c * 60, r * 60, 0.6)


def badge(art, sc=0.9):
    # a close-up of the new thing, top left, in a white box (as the help cards' badge)
    return rect(10, 10, 104, 104, '#FFF', 14, 3) + place(art, 17, 12, sc)


# ================================================================ 1. the spoon catapult (100 x 100 square, floor at 100)
def spoon_handle(x1, y1, x2, y2, col):
    return line(x1, y1, x2, y2, INK, 13) + line(x1, y1, x2, y2, col, 7)


def cat_a():   # a wooden spoon resting on a cotton reel
    s = rect(44, 92, 38, 8, '#E2A867', 2, 2.4) + rect(48, 70, 30, 24, PINK, 0, 2.4) + rect(44, 64, 38, 8, '#E2A867', 2, 2.4)
    s += ''.join(line(50, y, 76, y, '#E77D98', 1.6) for y in (76, 82, 88))
    s += spoon_handle(30, 84, 98, 44, '#D9A066')
    return s + ell(18, 88, 20, 10, '#D9A066', 3, INK, -24) + ell(18, 87, 13, 5, '#E9BC86', 0, INK, -24)


def cat_b():   # a spoon tied to a lolly-stick post with a pink elastic band
    s = rect(2, 92, 96, 8, '#EED9B0', 3, 2.4) + rect(64, 34, 10, 60, '#EED9B0', 3, 2.4)
    s += spoon_handle(30, 84, 92, 30, '#D9A066')
    s += ell(69, 52, 10, 6, 'none', 3.5, CORAL)
    return s + ell(18, 88, 20, 10, '#D9A066', 3, INK, -30) + ell(18, 87, 13, 5, '#E9BC86', 0, INK, -30)


def cat_c():   # a silver teaspoon on a cork
    s = rect(50, 68, 34, 32, '#D9A066', 7, 2.6) + ''.join(circ(x, y, 1.8, '#B5824E', 0) for x, y in ((58, 78), (72, 84), (63, 92), (77, 74)))
    s += spoon_handle(28, 84, 96, 52, '#CFD8E6')
    return s + ell(18, 88, 20, 10, '#CFD8E6', 3, INK, -22) + ell(18, 87, 13, 5, '#EEF2F8', 0, INK, -22)


CATS = [('A', 'A wooden spoon on a cotton reel', cat_a), ('B', 'A spoon tied to a lolly-stick post with a pink band', cat_b),
        ('C', 'A teaspoon balanced on a cork', cat_c)]
CAT_ROWS = ['.........'] * 4 + ['###...###']


def catapult_scene(art):
    s = sky(540, 300) + board(CAT_ROWS, [(3, 4), (4, 4), (5, 4)]) + place(ART['duck'], 230, 278, 0.8) + place(ART['duck'], 300, 282, 0.7)
    s += place(art(), 120, 180, 0.6) + badge(art())
    s += dashed('M 132 220 Q 270 30 392 228')
    s += ham(132, 238, 'walk1', 0.5)
    s += place(ham(0, 0, 'boing', 0.5), 262, 140, 1, ' opacity="0.55"')
    s += ham(398, 240, 'home')
    s += txt(262, 214, '4 squares on', 16, '#2E7DA3')
    return s


# ================================================================ 2. the twig signpost (100 x 100 square, floor at 100)
UTURN = 'M 62 48 L 62 30 A 12 12 0 0 0 38 30 L 38 42'


def u_arrow(col, w=5, dx=0, dy=0):
    return f'<g transform="translate({dx} {dy})">' + path(UTURN, 'none', w, col) + path('M 30 40 L 38 52 L 46 40 Z', col, 2, col) + '</g>'


def twig(top=40):
    return path(f'M 50 100 L 50 {top}', 'none', 7, TWIG) + path('M 50 74 L 62 64', 'none', 4, TWIG) + ell(66, 60, 7, 4, LEAF, 2, INK, -30)


def sign_a():   # a round sign
    return twig(60) + circ(50, 34, 28, SUN, 3) + u_arrow(INK)


def sign_b():   # a lolly-stick board
    return twig(56) + rect(18, 10, 64, 48, '#EED9B0', 6, 3) + u_arrow(CORAL, 6, 0, 2)


def sign_c():   # the twig itself bent round, with a bow
    s = path('M 50 100 L 50 46 Q 50 16 30 16 Q 12 16 12 36', 'none', 12, INK) + path('M 50 100 L 50 46 Q 50 16 30 16 Q 12 16 12 36', 'none', 6, TWIG)
    s += path('M 4 34 L 12 48 L 20 34 Z', LEAF, 2.4)
    return s + path('M 50 56 l -12 -7 l 0 14 z', PINK, 2) + path('M 50 56 l 12 -7 l 0 14 z', PINK, 2) + circ(50, 56, 3.5, CORAL, 2)


SIGNS = [('A', 'A round sign with a turn-round arrow', sign_a), ('B', 'A lolly-stick board with a turn-round arrow', sign_b),
         ('C', 'The twig itself bent round, with a bow', sign_c)]
SIGN_ROWS = ['........'] * 3 + ['########']


def sign_scene(art):
    s = sky(480, 240) + board(SIGN_ROWS) + place(art(), 360, 120, 0.6) + badge(art())
    s += dashed('M 120 120 L 340 120 Q 380 120 380 150 Q 380 172 340 172 L 150 172')
    s += path('M 160 164 L 146 172 L 160 180', 'none', 4, '#5FA8C9')
    s += place(ham(0, 0, 'walk1'), 240, 180, 1, ' opacity="0.45"') + ham(170, 180, 'walk2', flip=True)
    return s


# the ramp facing left (Q-065)
def mini_slot(x, y, flip, count=2):
    s = rect(x, y, 96, 76, CREAM, 14, 3)
    s += place(ART['gadget']['ramp'], x + 66 if flip else x + 18, y + 6, 0.6, flip=flip)
    s += ''.join(circ(x + 48 + 13 * (j - (count - 1) / 2), y + 65, 4.5, SUN, 2) for j in range(count))
    return s


RAMP_ROWS = ['......', '......', '.#....', '######']


def ramp_a():
    s = sky(360, 240) + board([r_[:4] for r_ in RAMP_ROWS]) + gad('ramp', 2, 2, flip=True) + ham(150, 150, 'walk1', flip=True) + ham(214, 180, 'walk2', flip=True)
    s += rect(240, 0, 120, 240, '#8B5A3C', 0, 0) + line(240, 0, 240, 240, INK, 3) + mini_slot(252, 22, False) + mini_slot(252, 124, True)
    return s


def ramp_b():
    s = sky(360, 240) + board(RAMP_ROWS) + gad('ramp', 2, 2, flip=True)
    s += circ(200, 132, 17, CREAM, 3) + path('M 192 126 A 9 9 0 1 1 196 140', 'none', 3.5, INK) + path('M 186 122 L 192 128 L 198 120', 'none', 3, INK)
    s += place(ART['sparkle'], 220, 112, 0.7) + ham(150, 150, 'walk1', flip=True) + ham(260, 180, 'walk2', flip=True)
    return s


def ramp_c():
    hump = path('M 120 180 Q 150 108 180 180 Z', '#FFD54A', 3) + ell(150, 160, 6, 5, '#F0B429', 0) + ell(140, 172, 4, 3, '#F0B429', 0)
    return sky(360, 240) + board(RAMP_ROWS) + hump + ham(150, 138, 'walk1', flip=True) + ham(260, 180, 'walk2', flip=True)


def dizzy():
    s = sky(480, 240) + board(SIGN_ROWS) + place(sign_a(), 60, 120, 0.6) + place(sign_a(), 360, 120, 0.6)
    s += dashed('M 120 150 L 350 150 M 350 166 L 130 166', '#5FA8C9', 3)
    return s + ham(240, 180, 'bonk')


def nap():
    s = sky(480, 240) + board(SIGN_ROWS) + place(ART['start'], 60, 120, 0.6) + place(sign_a(), 300, 120, 0.6)
    s += dashed('M 150 150 L 300 150 Q 330 150 330 164 L 150 164', '#5FA8C9', 3)
    return s + ham(100, 176, 'stuck', 0.46, flip=True)


# ================================================================ 3. the bottle-top button
BTN_ROWS = ['..........'] * 3 + ['####..####']


def cap(x, y, col):
    teeth = ''.join(f'L {x + i * 6 + 3} {y - 4} L {x + i * 6 + 6} {y} ' for i in range(8))
    return path(f'M {x} {y + 12} L {x} {y} {teeth}L {x + 48} {y + 12} Z', col, 2.6) + ell(x + 24, y + 6, 14, 3, 'rgba(255,255,255,0.45)', 0)


def lid(up, col='#7FD3C8', dot=None):
    body = rect(0, -14, 120, 14, col, 5, 3) + rect(48, -22, 24, 9, '#5BB8AC', 3, 2.4)
    if dot:
        body += circ(96, -7, 5, dot, 2)
    return f'<g transform="translate(360 180) rotate({90 if up else 0}) translate(-120 0)">{body}</g>'


def button_scene(look, after):
    col = CORAL if look == 'A' else '#4FA3E8'
    s = sky(600, 240) + board(BTN_ROWS, [(4, 3), (5, 3)])
    s += cap(76, 166 + (6 if after else 0), col) if after else cap(76, 166, col)
    if look == 'A':
        s += path('M 124 176 Q 230 192 300 170 Q 350 150 360 60' if not after else 'M 124 180 Q 230 196 300 186 Q 340 182 352 178', 'none', 2.4, TWIG)
    s += lid(not after, dot=None if look == 'A' else '#4FA3E8')
    if after:
        s += ham(100, 172, 'walk1') + ham(300, 166, 'walk2')
        s += place(ART['sparkle'], 250, 150, 0.8) + place(ART['sparkle'], 330, 146, 0.6)
        if look == 'B':
            s += ''.join(place(ART['star'], x, 150 - 40 * math.sin((x - 120) / 230 * math.pi), 0.6) for x in (150, 200, 250, 300))
        s += ham(520, 180, 'home')
    else:
        s += ham(40, 180, 'walk1') + txt(300, 230, '', 1)
    return s


# ================================================================ 4. Pudding, the heavy hamster
def recolour(pose, fur, belly):
    return ART['ham'][pose].replace(ART['FUR'], fur).replace(ART['BELLY'], belly)


def pudding(look, pose='walk1'):
    if look == 'A':   # vanilla with caramel on top
        s = recolour(pose, '#FFF4DE', '#FFFFFF')
        s += path('M -28 -54 Q -10 -70 10 -66 Q 28 -64 32 -52 Q 26 -46 22 -54 Q 18 -44 12 -52 Q 4 -42 -2 -54 Q -10 -44 -16 -54 Q -22 -46 -28 -54 Z', '#D9944A', 2.2)
    elif look == 'B':   # rice pudding with a dollop of jam
        s = recolour(pose, '#FBF3E6', '#FFFFFF')
        s += path('M -34 -22 q 4 -14 18 -10 q 10 4 4 14 q -6 8 -16 4 q -8 -2 -6 -8 z', '#F06C8B', 2.2) + circ(-18, -18, 2.4, '#FFFFFF', 0, INK, ' opacity="0.7"')
    else:               # custard with a napkin
        s = recolour(pose, '#FFE7A3', '#FFF8DE')
        s += path('M 2 -22 L 38 -22 L 20 2 Z', '#FFFFFF', 2.4) + ''.join(rect(x, -20, 5, 5, CORAL, 0, 0) for x in (8, 18, 28)) + rect(15, -12, 5, 5, CORAL, 0, 0)
    return s


PUD = [('A', 'Vanilla, with caramel on top'), ('B', 'Rice pudding, with a dollop of jam'), ('C', 'Custard-yellow, with a napkin')]
FLAT_ROWS = ['........'] * 3 + ['########']


def squashed(x, y):
    return place(f'<g transform="translate(0 100) scale(1 0.42) translate(0 -100)">{ART["gadget"]["bouncer"]}</g>', x, y - 60, 0.6)


def pudding_look(look):
    s = sky(480, 240) + board(FLAT_ROWS) + squashed(240, 180)
    s += ham(110, 180, 'walk1') + ham(270, 172, body=pudding(look), sc=SC * 1.3)
    return s + ham(400, 180, 'walk2')


def pudding_rules():
    p = pudding('A')
    big = SC * 1.3
    flat = ['....'] * 3 + ['####']
    s1 = sky(240, 240) + board(flat) + squashed(90, 180) + ham(120, 172, body=p, sc=big) + txt(170, 60, 'squash!', 22, CORAL)
    half = lambda x, rot: f'<g transform="rotate({rot} {x} 180)">' + rect(x if rot > 0 else x - 30, 174, 30, 14, '#EED9B0', 5, 2.6) + '</g>'
    s2 = sky(240, 240) + board(['....'] * 3 + ['##.#']) + half(120, 70) + half(180, -70) + ham(150, 236, body=pudding('A', 'fall'), sc=big) + txt(170, 60, 'snap!', 22, CORAL)
    saw = f'<g transform="translate(120 130) rotate(28)">{place(ART["saw"], 0, 0, 0.62)}</g>'
    s3 = sky(240, 240) + board(flat) + place(ART['pot'], 120, 130, 1) + saw + ham(180, 160, body=p, sc=big) + txt(70, 60, 'tip!', 22, CORAL)
    return [(s1, 'Squashes the marshmallow and walks on'), (s2, 'A worn stick snaps at once'), (s3, 'Tips a see-saw on its own')]


# ================================================================ 5. the sandpit
SAND_ROWS = ['###....', '###....', '###....', '###....', '###.###']


def sand_a():   # a wooden sandbox with a spade
    s = rect(0, 0, 60, 60, SAND, 0, 2.4) + rect(0, 0, 60, 9, '#C98F57', 0, 2.4)
    s += ''.join(circ(x, y, 1.8, '#D8B45E', 0) for x, y in ((12, 22), (30, 34), (46, 20), (20, 46), (44, 48)))
    return s + rect(8, -26, 5, 28, CORAL, 2, 2) + path('M 4 -2 L 17 -2 L 15 10 L 6 10 Z', '#FFD54A', 2)


def sand_b():   # a soft sand heap with a little castle
    s = rect(0, 0, 60, 60, SAND, 0, 2.4) + path('M -2 2 Q 30 -18 62 2', SAND, 2.4)
    s += path('M 8 -2 q 8 -4 16 0 m 12 -2 q 8 -4 16 0', 'none', 1.8, '#D8B45E')
    return s + rect(36, -20, 14, 14, '#E9C66E', 1, 2) + path('M 36 -20 l 0 -4 l 4 0 l 0 4 m 2 0 l 0 -4 l 4 0 l 0 4 m 2 0 l 0 -4 l 2 0 l 0 4', 'none', 1.6, INK)


def sand_scene(art, soft=True):
    s = sky(420, 300) + board(SAND_ROWS)
    if soft:
        s += place(art(), 180, 240, 1)
    else:
        s += ART['block']['3,4,1']
    s += dashed('M 160 60 Q 200 60 210 100 L 210 226', '#5FA8C9', 3)
    s += place(ham(0, 0, 'walk1'), 140, 60, 1, ' opacity="0.45"')
    if soft:
        s += ''.join(circ(x, y, 3, SAND, 1.6) for x, y in ((186, 226), (194, 216), (228, 218), (236, 228)))
        s += ham(210, 236, 'home')
    else:
        s += ham(210, 240, 'bonk')
    return s


# ================================================================ 6. the zip-line and the park
def zip_scene(look):
    s = sky(480, 300) + board(['###.....', '###.....'] + ['........'] * 2 + ['......##'])
    s += line(150, 40, 420, 230, '#8B5A3C', 3) + rect(410, 226, 14, 14, WOOD, 3, 2.4)
    x, y = 260, 40 + (260 - 150) * 190 / 270
    if look == 'A':   # a cotton reel running on the string, the hamster holding on below
        s += rect(x - 14, y - 8, 28, 18, PINK, 3, 2.4) + rect(x - 18, y - 12, 36, 6, '#E2A867', 2, 2) + rect(x - 18, y + 8, 36, 6, '#E2A867', 2, 2)
        s += ham(x + 2, y + 54, 'fall', SC)
    else:             # a teacup hanging from the string by a ribbon
        s += line(x, y, x, y + 34, CORAL, 3) + place(ART['cupBack'], x, y + 74) + ham(x - 2, y + 70, 'home', 0.46) + place(ART['cupFront'], x, y + 74)
    return s + dashed(f'M {x + 40} {y + 10} L {x + 100} {y + 52}', '#5FA8C9', 3)


PW, PH, GROUND = 2420, 900, 780


def park(look):
    gid = f'dusk{look}'
    if look == 'A':
        s = (f'<defs><linearGradient id="{gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#CDEBFA"/><stop offset="0.45" stop-color="#E7F6FC"/>'
             f'<stop offset="0.7" stop-color="#F9C9A8"/><stop offset="0.86" stop-color="#9C7BB0"/><stop offset="1" stop-color="#3B3470"/></linearGradient></defs>'
             f'<rect x="0" y="0" width="{PW}" height="{GROUND}" fill="url(#{gid})"/>')
        s += ''.join(place(ART['star'], x, y, 0.7) for x, y in ((2280, 90), (2370, 160), (2190, 60), (2400, 60)))
        s += circ(2340, 110, 30, '#FFF3B0', 3) + circ(2352, 100, 26, '#3B3470', 0)
    else:
        s = ''.join(rect(0, i * GROUND / 4, PW, GROUND / 4 + 1, c, 0, 0) for i, c in enumerate(['#BFE6FA', '#CDEBFA', '#DBF1FB', '#E7F6FC']))
        s += circ(2250, 110, 40, SUN, 3)
    s += rect(0, GROUND, PW, PH - GROUND, '#A7DB86', 0, 0) + line(0, GROUND, PW, GROUND, '#6FB35A', 4) + rect(0, GROUND + 60, PW, PH - GROUND - 60, '#C9935F', 0, 0)
    # the garden's corner: its fence and the treehouse, where the zip-line starts
    s += ''.join(path(f'M {x} {GROUND} L {x} {GROUND - 72} L {x + 12} {GROUND - 84} L {x + 24} {GROUND - 72} L {x + 24} {GROUND} Z', '#F6E3C6', 2.4) for x in range(0, 300, 34))
    s += rect(0, GROUND - 56, 300, 10, '#E2C9A0', 0, 2) + rect(0, GROUND - 26, 300, 10, '#E2C9A0', 0, 2)
    s += path(f'M 90 {GROUND} Q 110 500 104 300 L 176 300 Q 170 500 190 {GROUND} Z', TWIG, 3)
    s += ''.join(circ(x, y, rr, '#7DC95E', 3) for x, y, rr in ((60, 200, 90), (170, 160, 110), (270, 220, 80)))
    s += rect(30, 230, 230, 76, '#E7B26F', 6, 3) + path('M 16 236 L 145 196 L 274 236 Z', '#E8505B', 3) + rect(170, 248, 40, 34, '#BFE6F7', 4, 3)
    # the zip-line
    s += line(262, 270, 560, 640, TWIG, 4) + rect(548, 636, 22, GROUND - 636, WOOD, 3, 3)
    zx, zy = 400, 270 + (400 - 262) * 370 / 298
    s += rect(zx - 14, zy - 8, 28, 18, PINK, 3, 2.4) + ham(zx + 2, zy + 54, 'fall', SC)
    # the duck pond, its island and a willow
    s += ell(760, GROUND + 14, 220, 40, '#7FD3F7', 3) + ell(780, GROUND + 6, 44, 14, '#8FD46E', 2.4) + place(ART['duck'], 680, GROUND + 22, 1.1) + place(ART['duck'], 860, GROUND + 26, 1)
    s += ''.join(path(f'M {x} {GROUND} q 2 -40 -6 -60', 'none', 3, '#3E9B4F') for x in (600, 612, 624))
    s += path(f'M 880 {GROUND} L 886 520 L 910 520 L 916 {GROUND} Z', TWIG, 3) + circ(900, 500, 80, '#8FD46E', 3)
    s += ''.join(path(f'M {x} 520 q 6 80 -4 160', 'none', 3, '#62C46F') for x in range(832, 980, 16))
    # the climbing frame
    for x in (1090, 1190, 1290):
        s += rect(x - 7, 470, 14, GROUND - 470, '#E8505B', 4, 3)
    for y in (540, 620, 700):
        s += rect(1083, y - 6, 214, 12, SUN, 6, 3)
    s += rect(1290, 464, 150, 12, SUN, 6, 3) + rect(1433, 464, 14, GROUND - 464, '#E8505B', 4, 3) + ''.join(line(x, 476, x, 490, INK, 3) for x in range(1310, 1440, 24))
    # the picnic: a blanket, a hamper, sandwiches and a cake stand
    s += path(f'M 1480 {GROUND + 8} L 1820 {GROUND + 8} L 1790 {GROUND - 22} L 1510 {GROUND - 22} Z', CORAL, 3)
    s += ''.join(line(x, GROUND + 8, x + 12, GROUND - 22, '#FFF', 6, ' opacity="0.7"') for x in range(1500, 1800, 36))
    s += rect(1680, GROUND - 90, 90, 70, '#D9A066', 8, 3) + path(f'M 1690 {GROUND - 90} Q 1725 {GROUND - 130} 1760 {GROUND - 90}', 'none', 5, TWIG)
    s += ''.join(rect(1580, GROUND - 40 - 14 * i, 60, 12, ['#F6E3C6', '#62C46F', '#F6E3C6', '#FF9BB3'][i], 3, 2.4) for i in range(4))
    s += rect(1528, GROUND - 120, 6, 98, '#CFD8E6', 2, 2) + ell(1531, GROUND - 24, 30, 6, '#CFD8E6', 2.4) + rect(1508, GROUND - 76, 46, 30, PINK, 6, 2.6) + circ(1531, GROUND - 82, 6, CORAL, 2)
    # the playground: a slide, a see-saw and a sandpit
    s += rect(1990, 560, 14, GROUND - 560, WOOD, 3, 3) + rect(2030, 560, 14, GROUND - 560, WOOD, 3, 3) + ''.join(line(1997, y, 2037, y, INK, 3) for y in range(600, 780, 30))
    s += rect(1984, 548, 70, 14, WOOD, 4, 3) + path(f'M 2050 556 Q 2100 560 2120 680 Q 2140 {GROUND - 10} 2200 {GROUND - 6}', 'none', 24, INK) + path(f'M 2050 556 Q 2100 560 2120 680 Q 2140 {GROUND - 10} 2200 {GROUND - 6}', 'none', 17, '#7FB3E8')
    s += path(f'M 1870 {GROUND} L 1886 {GROUND - 30} L 1902 {GROUND} Z', '#E8505B', 3) + f'<g transform="rotate(-12 1886 {GROUND - 34})">{rect(1830, GROUND - 40, 112, 10, WOOD, 4, 2.6)}</g>'
    s += rect(1900, GROUND - 6, 80, 20, SAND, 4, 2.6)
    # the night fair: a helter-skelter, lanterns and a tent
    s += path(f'M 2290 {GROUND} L 2310 380 L 2370 380 L 2390 {GROUND} Z', '#FFF8EE', 3)
    s += ''.join(path(f'M {2296 + (y - 380) * 0} {y} L {2384} {y - 40}', 'none', 14, INK) + path(f'M 2296 {y} L 2384 {y - 40}', 'none', 9, CORAL) for y in range(470, 780, 100))
    s += path('M 2296 380 L 2340 300 L 2384 380 Z', '#E8505B', 3) + line(2340, 300, 2340, 268, INK, 3) + path('M 2340 268 l 22 7 l -22 7 z', SUN, 2)
    lant = ''
    for i, x in enumerate(range(2260, 2420, 40)):
        y = 440 + 30 * math.sin(i * 0.9)
        glow = f'<circle cx="{x}" cy="{y + 14}" r="22" fill="#FFE27A" opacity="{0.55 if look == "A" else 0.0}"/>'
        lant += glow + ell(x, y + 14, 11, 14, [CORAL, SUN, '#5FE3BD', '#B9A7FF', PINK][i % 5], 2.4)
    s += path('M 2240 430 Q 2330 480 2420 430', 'none', 2, INK) + lant
    s += path(f'M 2150 {GROUND} L 2150 690 L 2210 640 L 2270 690 L 2270 {GROUND} Z', '#FFF8EE', 3) + ''.join(path(f'M {x} {GROUND} L {x} 690', 'none', 10, CORAL, ' opacity="0.8"') for x in (2170, 2210, 2250))
    if look == 'A':
        s += ''.join(place(ART['sparkle'], x, y, 1.6) for x, y in ((2200, 200), (2300, 240)))
    # the path and the stops
    s += path('M ' + ' L '.join(f'{x} {y}' for x, y in PTS), 'none', 4, MUTED, ' stroke-dasharray="2 12" opacity="0.6"')
    for st in STOPS:
        s += marker(*st['at'], st['n'], st['n'] == 21)
    return f'<svg viewBox="0 0 {PW} {PH}" role="img" aria-label="The park, look {look}">{s}</svg>'


def marker(x, y, n, current):
    s = ''
    if current:
        s += circ(x, y, 38, 'none', 5, SUN, ' opacity="0.55"')
    s += circ(x, y, 28, CREAM, 3, BROWN, ' stroke-opacity="0.55"') + txt(x, y + 9, str(n), 24, MUTED)
    if current:
        s += ham(x, y - 30, 'walk1', 0.32)
    return f'<g{"" if current else " opacity=\"0.8\""}>{s}</g>'


# the park's route: the zip-line's end, then each place's pair of stops (21 to 30), with corners (via) between
ROUTE = [('via', (560, 640)), (21, (620, 700)), (22, (740, 660)), ('via', (880, 640)), (23, (1030, 690)), (24, (1140, 580)),
         ('via', (1360, 560)), (25, (1450, 650)), (26, (1620, 640)), ('via', (1780, 620)), (27, (1900, 650)), (28, (2010, 496)),
         ('via', (2120, 500)), (29, (2180, 570)), (30, (2210, 360))]
if FAULT == 1:
    ROUTE = [(26, (1460, 660)) if k == 26 else (k, p) for k, p in ROUTE]
if FAULT == 2:
    ROUTE.insert(8, ('via', (1250, 720)))
PTS = [p for _, p in ROUTE]
STOPS = [{'n': k, 'at': p} for k, p in ROUTE if k != 'via']


def orient(p, q, s):
    v = (q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0])
    return (v > 0) - (v < 0)


def on(p, q, s):
    return min(p[0], q[0]) <= s[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= s[1] <= max(p[1], q[1])


def meet(a, b, c, d):
    o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
    if o1 * o2 < 0 and o3 * o4 < 0:
        return True
    return any(o == 0 and on(*seg, pt) for o, seg, pt in ((o1, (a, b), c), (o2, (a, b), d), (o3, (c, d), a), (o4, (c, d), b)))


segs = list(zip(PTS, PTS[1:]))
bad = [(i, j) for i in range(len(segs)) for j in range(i + 1, len(segs))
       if (j == i + 1 and (orient(*segs[i], segs[j][1]) == 0 and on(*segs[i], segs[j][1]) or orient(*segs[j], segs[i][0]) == 0 and on(*segs[j], segs[i][0])))
       or (j > i + 1 and meet(*segs[i], *segs[j]))]
turns = []
for p, q, s_ in zip(PTS, PTS[1:], PTS[2:]):
    a1, a2 = math.atan2(q[1] - p[1], q[0] - p[0]), math.atan2(s_[1] - q[1], s_[0] - q[0])
    turns.append(abs((math.degrees(a2 - a1) + 180) % 360 - 180))
check(not bad and max(turns) < 150, f'the park\'s path never crosses itself or runs back along itself (D-151) ({bad or len(segs)} segments, sharpest turn {max(turns):.0f} degrees, under 150)')
check([s['n'] for s in STOPS] == list(range(21, 31)), f'ten stops, 21 to 30 in order along the path ({[s["n"] for s in STOPS]})')
close = min(math.dist(p['at'], q['at']) for i, p in enumerate(STOPS) for q in STOPS[i + 1:])
check(close >= 112, f'no two stops\' tap circles overlap: the closest are {close:.0f} units apart (112 or more)')
check(all(56 <= s['at'][0] <= PW - 56 and 56 <= s['at'][1] <= PH - 56 for s in STOPS), 'every stop sits inside the park picture')

# ================================================================ the page
CSS = '''
body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #FFF8EE; color: #1B1446; }
h1 { font-size: 1.3rem; margin: 0 0 8px; } h2 { font-size: 1.12rem; margin: 26px 0 4px; } h3 { font-size: 1rem; margin: 14px 0 4px; }
p, li { margin: 4px 0 8px; max-width: 70ch; line-height: 1.4; }
.row { display: flex; flex-wrap: wrap; gap: 14px; }
figure { margin: 0; flex: 1 1 260px; max-width: 420px; min-width: 0; }
figure svg { width: 100%; height: auto; border: 2px solid #1B1446; border-radius: 12px; display: block; background: #FFF; }
figcaption { font-size: .95rem; margin-top: 4px; font-weight: 600; }
.scroll { overflow-x: auto; border: 2px solid #1B1446; border-radius: 12px; max-width: 100%; }
.scroll svg { height: min(480px, 70vw); min-height: 300px; width: auto; display: block; }
.rule { background: #FFF; border: 2px solid #E2C9A0; border-radius: 10px; padding: 6px 10px; max-width: 70ch; }
.pick { color: #2E7D32; font-weight: 700; }
small { opacity: .8; }
@media (prefers-color-scheme: dark) { body { background: #1B1446; color: #FFF8EE; } figure svg, .scroll { border-color: #FFF8EE; } .rule { background: #2A2360; border-color: #6B5FA8; } .pick { color: #8EE59A; } }
'''


def row(items):
    return '<div class="row">' + ''.join(items) + '</div>'


cat_figs = row(fig(540, 300, catapult_scene(fn), f'{k}. {name}') for k, name, fn in CATS)
sign_figs = row(fig(480, 240, sign_scene(fn), f'{k}. {name}') for k, name, fn in SIGNS)
ramp_figs = row([fig(360, 240, ramp_a(), '(a) Two ramp slots, one facing each way <span class="pick">(Claude\'s pick)</span>', '(a) Two ramp slots'),
                 fig(360, 240, ramp_b(), '(b) A small turn-arrow on a placed ramp flips it'),
                 fig(360, 240, ramp_c(), '(c) Ramps climb from either side (a hump)')])
odd_figs = row([fig(480, 240, dizzy(), 'Q-066: turned at the same signpost a third time: sits down dizzy <span class="pick">(Claude\'s pick)</span>', 'Dizzy'),
                fig(480, 240, nap(), 'Q-067: walked back into the start tube: curls up for a nap', 'Nap in the tube')])
btn_figs = ''.join(row([fig(600, 240, button_scene(k, False), f'{k}. {name}: before'), fig(600, 240, button_scene(k, True), f'{k}. after: the lid is down')])
                   for k, name in (('A', 'A red bottle top, with a string to the lunchbox lid'), ('B', 'A blue bottle top, and a blue dot on the lid it opens')))
pud_figs = row(fig(480, 240, pudding_look(k), f'{k}. {name}') for k, name in PUD)
pud_rules = row(fig(240, 240, s, cap_) for s, cap_ in pudding_rules())
sand_figs = row([fig(420, 300, sand_scene(sand_a), 'A. A wooden sandbox with a spade'), fig(420, 300, sand_scene(sand_b), 'B. A soft sand heap with a little castle'),
                 fig(420, 300, sand_scene(None, False), 'The same drop onto grass: bonk (as today)')])
zip_figs = row([fig(480, 300, zip_scene('A'), 'A. Holding on under a cotton reel'), fig(480, 300, zip_scene('B'), 'B. Riding in a teacup on a ribbon')])

page = f'''<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: sketches for levels 21 to 30</title>
<style>{CSS}</style></head><body>
<h1>Hamster Highway: sketches for levels 21 to 30</h1>
<p>Step 12 (D-184 to D-187), drawn with the game's own hamsters, blocks and gadgets. Nothing here is built. For each, pick a look (or say what to change); the rules are as plan 0.2 proposes, with the signpost's three open questions in section 2.</p>

<h2>1. The spoon catapult (gadget)</h2>
<p class="rule">On a floor. A hamster stepping into the spoon is flung over and lands 4 squares on, the way it was walking. A wall in the way: bonk, and it slides down. A drop of 3 or more where it lands: a funny fall, unless it holds a dandelion.</p>
{cat_figs}

<h2>2. The twig signpost (gadget)</h2>
<p class="rule">On a floor. Any hamster that ends a step in its square turns round and walks back. Everything else works both ways, but a ramp climbs only the way its slope faces, and the see-saw stays left-to-right only.</p>
{sign_figs}
<h3>Q-065: how does a ramp face left?</h3>
<p>A tap on a placed gadget already sends it back to the tray, so a tap can't also flip it.</p>
{ramp_figs}
<h3>Q-066 and Q-067: two funny endings</h3>
{odd_figs}

<h2>3. The bottle-top button (part of the level)</h2>
<p class="rule">Part of the level, not the tray. The first hamster to step on it drops the lunchbox lid over the gap somewhere else, and it stays down.</p>
{btn_figs}

<h2>4. Pudding, the heavy hamster</h2>
<p class="rule">One of the five in the line, bigger (here 1.3 times a Nibble), shown waiting at the start. Pudding squashes the marshmallow and walks on, snaps a worn stick at once, and tips a see-saw on its own.</p>
{pud_figs}
<h3>Pudding's rules (shown with look A)</h3>
{pud_rules}

<h2>5. The sandpit (ground)</h2>
<p class="rule">Ground, not a gadget: any drop into it is a soft landing, however far.</p>
{sand_figs}

<h2>6. The zip-line from the treehouse</h2>
<p>How the hamster goes over the fence from the garden (stop 20, the treehouse) to the park.</p>
{zip_figs}

<h2>7. The park</h2>
<p>Over the garden fence, by the zip-line: the duck pond (21, 22), the climbing frame (23, 24), the picnic (25, 26), the playground (27, 28) and the night fair (29, 30). Shown with 21 next. Swipe sideways inside the picture.</p>
<p><b>Look A: day turns to dusk along the way, the fair lit up at night</b></p>
<div class="scroll">{park('A')}</div>
<p><b>Look B: a sunny day all the way, the fair's lanterns unlit</b></p>
<div class="scroll">{park('B')}</div>
<p><small>Sketch only: tools/tests/games/sketch_hamster_park.py 0.1 on claude/games.</small></p>
</body></html>
'''
if FAULT == 3:
    page = page.replace('</body>', '<img src="https://example.org/x.png"></body>')
check('http' not in page, 'nothing in the page would be fetched (no http text at all)')
check(page.count('<svg') == page.count('</svg>'), f'every svg is closed ({page.count("<svg")} opened)')
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(page)
print('wrote', OUT, len(page), 'bytes')
sys.exit(1 if FAILS else 0)
