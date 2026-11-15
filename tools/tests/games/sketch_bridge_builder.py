"""Sketches: Bridge & Ramp Builder (working name; working id bridge-builder). Version 0.2.

Changes at v0.2 (15 Nov, Rob: theme A, Hamster Highway (D-133); PC first, phone sideways (D-134); "Show
me examples for item placing"; "If you were given more freedom on the gadget or level design what would
you do? Make three suggestions on each."): a second page, sketches 2, now the default (--sketches 2):
three ways to place gadgets, each as three steps on level 2 in Hamster Highway's style ((a) build
spots, (b) anywhere it fits, (c) anywhere at all), then three gadget ideas and three level ideas. The
board and the tray are drawn by board() and tray(), split out of scene() unchanged, so sketches 1
(--sketches 1) builds as before, apart from its stamp. The walker model and its checks are unchanged;
sketches 2 adds checks of option (b)'s rule on level 2.

Rob, 15 Nov 2026, the new game's first chat: a retro-style puzzle game where the child places
gadgets on a side-view grid in Build mode, then presses a big GO and a line of characters walks
from the left to the right on its own. It plays a little like Lemmings and Pipe Mania; the look,
characters and sounds are our own (D-010). No time pressure, no maths or reading; forgiving,
charming, funny noises; a walker that falls too far does a funny fall and fades, and one that is
stuck fades after a few seconds; heights, backdrops and platforms vary; early levels need fewer
gadgets. He asked for three themes (hero, goal, 4 or 5 gadgets), a mock-up of a sample level with
the toolbar and the character sprites, and five first levels that bring in one gadget at a time,
before any game code.

This script draws, as plain SVG and original art (D-010), for Rob to choose from:
  - for each of three themes: the same sample level mid-run, with its tray, GO button and walkers
    on four gadgets; a strip of the hero's poses; and the theme's five gadgets;
  - the sample level's fit on the phone (upright and sideways) and the PC under the wrapper's
    56 px bar (Q-039), each square's size worked out here;
  - five first levels as plain sketches, each with its build spots, the gadgets that solve it,
    the walkers' route, and what happens without the gadgets.
The levels are text grids run through a small walker model of the proposed rules (WALKER RULES
below). The script checks that each level, the sample included, is solved with its gadgets and
not solved without them. The model is a sketch of the rules, not the game's code.

WALKER RULES (proposed, draft): a walker stands in a square with something solid under it and
walks right one square at a time. Ground, bridges, ramps and tubes hold it up. It can't climb a
step on its own: a ramp takes it up one square, a bouncer three (straight up, then one square on).
A drop of one or two squares is fine; three or more is a funny fall (unless it carries a floater),
and off the bottom is a splash. A wall it can't get past leaves it stuck, and it fades. A tube
carries it from one end of a chain of tube squares to the other.

Writes index.html into the folder given (default /mnt/user-data/outputs/bridge-builder-sketches-N/),
then checks the page in headless Chromium (a stand-in for the phone and PC): phone upright and
sideways and PC, light and dark: no script errors, nothing fetched, no sideways scrolling, every
drawing drawn; saves pictures to the folder's shots/.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_bridge_builder.py [out-folder] [--sketches 1|2]
Exits 1 if a check fails.
"""
import base64, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = sys.argv[1:]
SKETCHES = 2
if '--sketches' in ARGS:
    i = ARGS.index('--sketches')
    SKETCHES = int(ARGS[i + 1])
    del ARGS[i:i + 2]
OUT = ARGS[0] if ARGS else f'/mnt/user-data/outputs/bridge-builder-sketches-{SKETCHES}'
os.makedirs(OUT, exist_ok=True)
VERSION = '0.2'
COMMIT = subprocess.check_output(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], text=True).strip()

INK, WHITE = '#1B1446', '#FFFFFF'
SUN, MINT, CORAL, SKY, LILAC = '#FFC93C', '#5FE3BD', '#FF5D73', '#8CF5FF', '#B9A7FF'
LW = 3.0
COLS, ROWS, CELL = 12, 7, 60
problems = []
_uid = [0]


def uid(p):
    _uid[0] += 1
    return f'{p}{_uid[0]}'


def f(v):
    if isinstance(v, float):
        s = f'{v:.2f}'.rstrip('0').rstrip('.')
        return '0' if s in ('', '-0') else s
    return str(v)


def path(d, fill='none', w=LW, stroke=INK, extra=''):
    return (f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{f(w)}" '
            f'stroke-linejoin="round" stroke-linecap="round"{extra}/>')


def circle(x, y, r, fill, w=LW, stroke=INK, extra=''):
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" stroke="{stroke}" stroke-width="{f(w)}"{extra}/>'


def ellipse(x, y, rx, ry, fill, w=LW, stroke=INK, rot=0, extra=''):
    t = f' transform="rotate({f(rot)} {f(x)} {f(y)})"' if rot else ''
    return (f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{f(w)}"{t}{extra}/>')


def rect(x, y, w_, h, fill, rx=0, w=LW, stroke=INK, extra=''):
    return (f'<rect x="{f(x)}" y="{f(y)}" width="{f(w_)}" height="{f(h)}" rx="{f(rx)}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{f(w)}"{extra}/>')


def line(x1, y1, x2, y2, col=INK, w=LW, extra=''):
    return (f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{col}" stroke-width="{f(w)}" '
            f'stroke-linecap="round"{extra}/>')


def text(x, y, s, size=14, fill=INK, anchor='middle', weight=700, family='Fredoka, system-ui, sans-serif', extra=''):
    return (f'<text x="{f(x)}" y="{f(y)}" font-size="{f(size)}" fill="{fill}" text-anchor="{anchor}" '
            f'font-weight="{weight}" font-family="{family}"{extra}>{s}</text>')


def g(body, tr='', extra=''):
    t = f' transform="{tr}"' if tr else ''
    return f'<g{t}{extra}>{body}</g>'


def place(body, x, y, sc=1.0, rot=0, op=1.0):
    tr = f'translate({f(x)} {f(y)})' + (f' rotate({f(rot)})' if rot else '') + (f' scale({f(sc)})' if sc != 1 else '')
    return g(body, tr, f' opacity="{f(op)}"' if op != 1 else '')


def star(x, y, r, fill=SUN, w=2.0):
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f'{f(x + rr * math.cos(a))},{f(y - rr * math.sin(a))}')
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{INK}" stroke-width="{f(w)}" stroke-linejoin="round"/>'


def heart(x, y, s, fill=CORAL):
    k = s / 10
    d = (f'M {f(x)} {f(y + 6 * k)} C {f(x - 10 * k)} {f(y - 2 * k)} {f(x - 6 * k)} {f(y - 10 * k)} {f(x)} {f(y - 5 * k)} '
         f'C {f(x + 6 * k)} {f(y - 10 * k)} {f(x + 10 * k)} {f(y - 2 * k)} {f(x)} {f(y + 6 * k)} Z')
    return path(d, fill, 1.8)


def eye(x, y, r, kind, col=INK, shine=True):
    if kind == 'open':
        s = circle(x, y, r, col, w=0)
        return s + (circle(x - r * 0.3, y - r * 0.35, r * 0.36, WHITE, w=0) if shine else '')
    wd = max(1.6, r * 0.5)
    if kind == 'closed':
        return path(f'M {f(x - r)} {f(y)} q {f(r)} {f(r * 0.8)} {f(2 * r)} 0', w=wd, stroke=col)
    if kind == 'happy':
        return path(f'M {f(x - r)} {f(y + r * 0.4)} q {f(r)} {f(-r * 1.5)} {f(2 * r)} 0', w=wd, stroke=col)
    return path(f'M {f(x - r)} {f(y)} a {f(r)} {f(r)} 0 1 1 {f(r)} {f(r)} a {f(r * 0.6)} {f(r * 0.6)} 0 1 1 '
                f'{f(-r * 0.6)} {f(-r * 0.6)}', w=max(1.4, r * 0.4), stroke=col)


def zzz(x, y, col='#7C77B9'):
    return text(x, y, 'z', 13, col) + text(x + 10, y - 13, 'Z', 18, col)


def motion_below(col=INK):
    return ''.join(line(x, 8 + abs(x) * 0.2, x, 20 + abs(x) * 0.2, col, 2.2, ' opacity="0.45"') for x in (-12, 0, 12))


# ---------------------------------------------------------------- heroes (feet at 0, facing right)
FUR, BELLY, PINK = '#F4A259', '#FFF3DC', '#FF9BB3'


def hamster(pose):
    eyes = {'stuck': 'closed', 'bonk': 'swirl', 'home': 'happy'}.get(pose, 'open')
    feet = {'walk1': [(-14, 0), (16, -5)], 'walk2': [(-8, -5), (20, 0)], 'float': [(-8, 8), (14, 10)],
            'boing': [(-8, 6), (12, 6)], 'stuck': [(-4, 0), (24, 0)], 'bonk': []}.get(pose, [(-12, 0), (14, 0)])
    sx, sy = {'boing': (0.86, 1.18), 'bonk': (1.42, 0.42), 'stuck': (1.06, 0.88)}.get(pose, (1, 1))
    b = circle(-34, -26, 5.5, FUR, w=2.4)
    if pose in ('boing', 'float', 'home'):
        b += ellipse(-12, -70, 6, 9, FUR, w=2.4, rot=-25) + ellipse(28, -71, 6, 9, FUR, w=2.4, rot=25)
    b += circle(-15, -60, 10, FUR) + circle(-15, -60, 5, PINK, w=0)
    b += circle(13, -63, 10, FUR) + circle(13, -63, 5, PINK, w=0)
    b += ellipse(0, -33, 35, 31, FUR)
    b += ellipse(9, -22, 20, 15, BELLY, w=0) + ellipse(21, -40, 15, 12, BELLY, w=0)
    b += eye(11, -45, 4.6, eyes) + eye(26, -44, 4.2, eyes)
    b += ellipse(35, -37, 4.2, 3.4, PINK, w=1.8)
    b += ellipse(25, -31, 6, 3.4, PINK, w=0, extra=' opacity="0.6"')
    b += line(37, -36, 49, -40, INK, 1.4) + line(37, -34, 49, -31, INK, 1.4)
    b += path('M 27 -29 q 4 7 9 0 z', '#C2185B', 1.8) if pose == 'home' else path('M 29 -30 q 2.5 3 5 0', w=1.6)
    if pose not in ('boing', 'float', 'home', 'bonk'):
        b += ellipse(22, -16, 5.5, 4.5, PINK, w=2.2)
    s = ''.join(ellipse(x, y - 4, 8, 5, PINK, w=2.4) for x, y in feet) + g(b, f'scale({f(sx)} {f(sy)})')
    if pose == 'boing':
        s += motion_below()
    elif pose == 'float':
        s = (line(8, -72, 8, -106, '#3E9B4F', 3.5) + circle(8, -126, 23, WHITE, w=2, stroke='#B9B4D6')
             + ''.join(line(8 + 7 * math.cos(a), -126 + 7 * math.sin(a), 8 + 20 * math.cos(a), -126 + 20 * math.sin(a), '#C9C4E6', 1.4)
                       + circle(8 + 21 * math.cos(a), -126 + 21 * math.sin(a), 1.8, '#C9C4E6', w=0)
                       for a in [i * math.pi / 7 for i in range(14)])
             + circle(8, -126, 4, '#E9E4FF', w=1.4, stroke='#B9B4D6') + s)
    elif pose == 'stuck':
        s = g(s + zzz(36, -62), extra=' opacity="0.55"')
    elif pose == 'bonk':
        s += star(-26, -38, 6) + star(0, -46, 7) + star(26, -38, 6)
        s += circle(-50, -5, 6, '#EDEBFF', w=1.6, stroke='#B9B4D6') + circle(52, -5, 7, '#EDEBFF', w=1.6, stroke='#B9B4D6')
    elif pose == 'home':
        s = g(s, 'translate(0 -8)') + star(-36, -80, 6) + star(42, -84, 5) + heart(6, -98, 9)
    return s


TEAL, TEAL_D, SCREEN, GLOW, STEEL = '#37C2C9', '#2196A8', '#1D2550', '#8CF5FF', '#56607E'


def robot(pose):
    eyes = {'stuck': 'closed', 'bonk': 'swirl', 'home': 'happy'}.get(pose, 'open')
    if pose == 'bonk':
        s = line(-10, -12, -34, -2, INK, 7) + line(-10, -12, -34, -2, STEEL, 4) + line(10, -12, 36, -2, INK, 7) + line(10, -12, 36, -2, STEEL, 4)
        s += path('M -4 -40 l -10 -6 l 10 -6 l -10 -6 l 10 -6', w=3.2)
        s += rect(-26, -40, 52, 32, TEAL, rx=12) + rect(-19, -36, 40, 18, SCREEN, rx=7, w=2.4)
        s += eye(-7, -27, 4.6, 'swirl', GLOW) + eye(10, -27, 4.6, 'swirl', GLOW)
        s += path('M 6 -40 q 6 -12 18 -10', w=3) + circle(44, -6, 5, CORAL, w=2.4)
        for x, y in ((-44, -5), (-22, -54), (30, -46)):
            s += path(f'M {x - 4} {y} l 2 -3.5 h 4 l 2 3.5 l -2 3.5 h -4 z', '#C9D3EA', 1.8)
        return s + star(-34, -36, 6) + star(2, -64, 7) + star(36, -60, 6)
    feet = {'walk1': [(-16, 0), (14, -5)], 'walk2': [(-8, -5), (18, 0)], 'float': [(-8, 8), (10, 10)],
            'boing': [(-10, 6), (10, 6)], 'stuck': [(-14, 0), (12, 0)]}.get(pose, [(-12, 0), (12, 0)])
    sx, sy = {'boing': (0.88, 1.14), 'stuck': (1.04, 0.9)}.get(pose, (1, 1))
    s = ''
    for (fx, fy), hx in zip(feet, (-10, 10)):
        s += line(hx, -16, fx, fy - 4, INK, 7) + line(hx, -16, fx, fy - 4, STEEL, 4) + ellipse(fx, fy - 3, 8, 4.5, STEEL, w=2.4)
    b = line(-27, -44, -38, -44, INK, 4) + ellipse(-42, -50, 5, 4, SUN, w=2.2) + ellipse(-42, -38, 5, 4, SUN, w=2.2)
    if pose in ('boing', 'float', 'home'):
        b += line(-24, -54, -34, -78, INK, 6) + line(-24, -54, -34, -78, TEAL, 3) + circle(-35, -80, 4, STEEL, w=2)
        b += line(24, -54, 34, -78, INK, 6) + line(24, -54, 34, -78, TEAL, 3) + circle(35, -80, 4, STEEL, w=2)
    if pose != 'float':
        b += line(0, -68, 3, -82, INK, 3) + circle(3, -86, 5, CORAL, w=2.4)
    b += rect(-26, -68, 52, 52, TEAL, rx=14)
    b += rect(-19, -62, 40, 24, SCREEN, rx=8, w=2.4)
    b += eye(-7, -50, 5, eyes, GLOW, shine=False) + eye(10, -50, 5, eyes, GLOW, shine=False)
    b += rect(-12, -33, 24, 11, TEAL_D, rx=4, w=2)
    b += circle(-6, -27.5, 2.4, CORAL, w=0) + circle(0, -27.5, 2.4, SUN, w=0) + circle(6, -27.5, 2.4, MINT, w=0)
    if pose not in ('boing', 'float', 'home'):
        b += ellipse(28, -36, 5, 8, TEAL, w=2.4)
    if pose == 'float':
        b += path('M -18 -68 Q -18 -84 0 -84 Q 18 -84 18 -68 Z', SUN, 2.6) + line(0, -84, 0, -96, INK, 3)
        b += ellipse(-15, -98, 15, 4, CORAL, w=2.2) + ellipse(15, -98, 15, 4, SKY, w=2.2) + circle(0, -98, 3.5, WHITE, w=2)
        b += path('M -34 -106 q 34 -12 68 0', w=1.8, stroke='#9AA7C7', extra=' stroke-dasharray="4 5"')
    s += g(b, f'scale({f(sx)} {f(sy)})')
    if pose == 'boing':
        s += motion_below()
    elif pose == 'stuck':
        s = g(s + text(34, -70, '...', 18, '#7C77B9'), extra=' opacity="0.55"')
    elif pose == 'home':
        s = (g(s, 'translate(0 -8)') + star(-40, -84, 6)
             + path('M 44 -96 l -8 14 h 7 l -4 12 l 11 -16 h -7 l 4 -10 z', SUN, 1.8))
    return s


SOCK_D = ('M -16 -84 L 12 -84 L 12 -36 C 12 -27 18 -22 27 -22 L 30 -22 C 40 -22 45 -15 45 -10 '
          'C 45 -3 40 0 33 0 L -6 0 C -14 0 -19 -6 -19 -14 Z')
SOCK_COLS = ('#FF6B8B', '#5FD3F3')


def sock_body(eyes, cols=SOCK_COLS, mouth='smile'):
    cid = uid('sk')
    inner = rect(-30, -100, 90, 110, '#FFF7EC', w=0)
    for i, y in enumerate(range(-74, 0, 12)):
        inner += rect(-30, y, 90, 6, cols[i % 2], w=0)
    inner += circle(38, -8, 13, cols[0], w=0) + circle(-17, -6, 12, cols[0], w=0)
    inner += rect(-30, -90, 90, 14, SUN, w=0) + ''.join(line(x, -84, x, -77, '#E0A41C', 1.6) for x in range(-12, 12, 5))
    s = f'<clipPath id="{cid}"><path d="{SOCK_D}"/></clipPath>' + g(inner, extra=f' clip-path="url(#{cid})"')
    s += path(SOCK_D, 'none', LW)
    s += circle(-6, -62, 7.5, WHITE, w=2.2) + circle(9, -63, 7.5, WHITE, w=2.2)
    if eyes == 'open':
        s += circle(-3.5, -61, 3.6, INK, w=0) + circle(11.5, -62, 3.6, INK, w=0)
    else:
        s += eye(-6, -62, 4, eyes) + eye(9, -63, 4, eyes)
    s += path('M -1 -50 q 4 6 9 0 z', '#C2185B', 1.8) if mouth == 'open' else path('M -2 -50 q 5 5 10 0', w=2)
    return s


def sock(pose):
    eyes = {'stuck': 'closed', 'bonk': 'swirl', 'home': 'happy'}.get(pose, 'open')
    b = sock_body(eyes, mouth='open' if pose == 'home' else 'smile')
    if pose == 'walk1':
        return g(b, 'scale(1.08 0.92)')
    if pose == 'walk2':
        return g(b, 'translate(0 -9) scale(0.95 1.05)') + motion_below()
    if pose == 'boing':
        return g(b, 'scale(0.85 1.2)') + motion_below()
    if pose == 'float':
        return (g(b, 'translate(0 -10)') + circle(10, -50, 54, 'rgba(255,255,255,0.28)', w=2.6, stroke='#7FC8F0')
                + path('M -24 -78 Q -16 -100 6 -104', w=4, stroke=WHITE) + path('M 34 0 A 52 52 0 0 0 64 -26', w=1.8, stroke=PINK)
                + path('M 28 4 A 58 58 0 0 0 68 -20', w=1.6, stroke=LILAC))
    if pose == 'stuck':
        return g(g(b, 'skewX(-14) scale(1.1 0.72)') + zzz(36, -60), extra=' opacity="0.55"')
    if pose == 'bonk':
        lint = ''.join(circle(x, -6, r, '#EDEBFF', w=1.6, stroke='#B9B4D6') for x, r in ((-40, 6), (-30, 4), (58, 7), (68, 4)))
        return lint + g(b, 'scale(1.35 0.42)') + star(-22, -42, 6) + star(6, -50, 7) + star(32, -42, 6)
    return g(b, 'translate(0 -10)') + heart(-30, -88, 9) + heart(40, -96, 7, PINK) + star(46, -66, 5)


# ---------------------------------------------------------------- gadgets (a 100 x 100 square; floor at 100)
def tube(d, body, ring):
    return (path(d, 'none', 36) + path(d, 'none', 29, body) + path(d, 'none', 4, WHITE, ' opacity="0.65"')
            + path(d, 'none', 29, ring, ' stroke-dasharray="3 22" stroke-linecap="butt" opacity="0.8"'))


TUBE_ICON = 'M 4 74 L 52 74 Q 74 74 74 52 L 74 4'


def gadget(theme, kind, n=1):
    w = 100 * n
    if theme == 'hamster':
        if kind == 'bridge':
            return rect(-6, 0, w + 12, 22, '#F3D9A4', rx=11) + line(10, 8, w * 0.45, 8, '#D8B47A', 2) + line(w * 0.55, 14, w - 10, 14, '#D8B47A', 2)
        if kind == 'ramp':
            return (path('M 2 100 L 100 100 L 100 4 Z', '#FFD54A')
                    + ''.join(ellipse(x, y, rx, ry, '#F0B429', w=0) for x, y, rx, ry in ((80, 76, 8, 7), (90, 44, 5, 5), (58, 91, 5, 4), (70, 58, 4, 4))))
        if kind == 'spring':
            return (rect(20, 50, 60, 48, '#FFE6EE', rx=16) + ellipse(50, 53, 29, 8, '#FFF6F9', w=2.2)
                    + path('M 28 72 q 22 -8 44 0', w=2.2, stroke=PINK) + path('M 28 84 q 22 -8 44 0', w=2.2, stroke=PINK))
        if kind == 'float':
            return (line(50, 100, 50, 52, '#3E9B4F', 4) + path('M 50 86 q -16 -2 -20 -14 q 14 0 20 10', '#62C46F', 2)
                    + circle(50, 34, 26, WHITE, w=2, stroke='#B9B4D6')
                    + ''.join(line(50 + 7 * math.cos(a), 34 + 7 * math.sin(a), 50 + 22 * math.cos(a), 34 + 22 * math.sin(a), '#C9C4E6', 1.4)
                              for a in [i * math.pi / 7 for i in range(14)])
                    + circle(50, 34, 4.5, '#E9E4FF', w=1.4, stroke='#B9B4D6'))
        return tube(TUBE_ICON, '#A8ECFF', '#6CCBE8')
    if theme == 'robot':
        if kind == 'bridge':
            zig = 'M 0 20 ' + ' '.join(f'L {f(12.5 * (i + 1))} {4 if i % 2 == 0 else 20}' for i in range(int(w / 12.5)))
            return (rect(-4, 0, w + 8, 24, '#E8505B', rx=3) + path(zig, w=2.4, stroke='#FFD1D6')
                    + circle(4, 12, 2.4, '#FFD1D6', w=0) + circle(w - 4, 12, 2.4, '#FFD1D6', w=0))
        if kind == 'ramp':
            plate = ''.join(line(x, y, x + 6, y - 6, '#C9D3EA', 2) for x, y in
                            [(x, y) for x in range(30, 96, 14) for y in range(94, 20, -14) if y > 100 - (x - 2) * 96 / 98 + 8])
            return (path('M 2 100 L 100 100 L 100 4 Z', '#9AA7C7') + plate + line(4, 98, 98, 6, SUN, 7)
                    + line(4, 98, 98, 6, INK, 7, ' stroke-dasharray="7 9" stroke-linecap="butt"'))
        if kind == 'spring':
            return (rect(14, 88, 72, 12, STEEL, rx=3) + path('M 28 86 L 72 78 L 28 70 L 72 62 L 28 54 L 72 46', w=8)
                    + path('M 28 86 L 72 78 L 28 70 L 72 62 L 28 54 L 72 46', w=4.5, stroke='#D7DEEE') + rect(20, 34, 60, 12, CORAL, rx=6))
        if kind == 'float':
            return (path('M 26 98 Q 26 66 50 66 Q 74 66 74 98 Z', SUN) + ellipse(68, 97, 18, 4, '#F0A51C', w=2.2)
                    + line(50, 66, 50, 50, INK, 3) + ellipse(35, 48, 16, 5, CORAL, w=2.2) + ellipse(65, 48, 16, 5, SKY, w=2.2)
                    + circle(50, 48, 3.5, WHITE, w=2))
        return tube(TUBE_ICON, '#E08A4C', '#B5652D')
    if kind == 'bridge':
        return rect(-4, 0, w + 8, 22, '#FFD84D', rx=3) + ''.join(line(x, 22, x, 22 - (10 if (x - 4) % 50 == 0 else 5), INK, 1.6) for x in range(4, w, 10))
    if kind == 'ramp':
        return (line(58, 62, 82, 100, STEEL, 4) + line(84, 38, 52, 100, STEEL, 4)
                + path('M 0 100 L 92 8 Q 100 0 100 12 L 100 22 L 18 100 Z', '#7FD1F6')
                + ''.join(circle(x, 100 - (x - 4) * 0.92 + 4, 2.2, WHITE, w=0) for x in range(20, 96, 13)))
    if kind == 'spring':
        return (rect(16, 60, 68, 38, '#FFE14D', rx=8) + ''.join(ellipse(x, y, 4, 3, '#EBC42E', w=0) for x, y in ((30, 74), (50, 86), (68, 72), (40, 90), (74, 88)))
                + rect(16, 48, 68, 15, '#53C27A', rx=6))
    if kind == 'float':
        return (circle(50, 62, 34, 'rgba(255,255,255,0.35)', w=2.6, stroke='#7FC8F0') + path('M 28 52 Q 32 36 48 32', w=4, stroke=WHITE)
                + path('M 24 72 A 28 28 0 0 0 60 94', w=1.8, stroke=PINK) + circle(86, 28, 7, 'rgba(255,255,255,0.35)', w=2, stroke='#7FC8F0'))
    return tube(TUBE_ICON, '#ECE6FF', LILAC)


# ---------------------------------------------------------------- starts, homes, blocks, backdrops (cell coords)
def start_art(theme):
    if theme == 'hamster':
        return (ellipse(-12, 67, 13, 31, '#C98F57') + rect(-12, 36, 96, 62, '#C98F57', rx=2, w=0)
                + line(-12, 36, 84, 36) + line(-12, 98, 84, 98) + path('M 10 36 L 38 98', w=2, stroke='#A8703F')
                + path('M 44 36 L 72 98', w=2, stroke='#A8703F') + ellipse(84, 67, 13, 31, '#5A3A22'))
    if theme == 'robot':
        stripes = ''.join(path(f'M {x} 18 l 8 -12 h 7 l -8 12 z', INK, 0) for x in range(-4, 84, 15))
        return (rect(-6, 6, 92, 94, STEEL, rx=8) + rect(6, 22, 68, 78, '#1A1838', rx=6) + rect(-6, 6, 92, 12, SUN, rx=4)
                + stripes + circle(40, 60, 5, '#FF5D73', w=0, extra=' opacity="0.6"'))
    return (rect(-8, -26, 96, 126, '#F4F6FB', rx=10) + line(-8, -6, 88, -6, INK, 2) + circle(68, -16, 6, '#C3CAD8', w=2)
            + circle(8, -16, 3, MINT, w=0) + circle(18, -16, 3, CORAL, w=0)
            + circle(40, 46, 32, '#C3CAD8') + circle(40, 46, 24, '#9ADBF7', w=2.4)
            + path('M 18 52 q 11 -8 22 0 q 11 8 22 0', w=2, stroke=WHITE)
            + circle(32, 36, 4, 'rgba(255,255,255,0.6)', w=1.4, stroke=WHITE) + circle(48, 60, 3, 'rgba(255,255,255,0.6)', w=1.2, stroke=WHITE))


def home_art(theme):
    if theme == 'hamster':
        seeds = ''.join(ellipse(x, y, 4, 2.4, '#3B3B3B', w=1, stroke=INK, rot=r) for x, y, r in ((82, 95, 20), (90, 95, -20), (86, 90, 0), (96, 94, 30)))
        return (rect(10, 28, 80, 70, '#E7B26F', rx=4) + path('M -2 34 L 50 -14 L 102 34 Z', '#E8505B')
                + path('M 34 98 L 34 72 A 16 16 0 0 1 66 72 L 66 98 Z', '#5A3A22') + heart(50, 14, 10, '#FFE6EE') + seeds)
    if theme == 'robot':
        arch = 'M 10 88 L 10 36 Q 10 4 50 4 Q 90 4 90 36 L 90 88'
        return (rect(16, 20, 68, 66, MINT, w=0, extra=' opacity="0.2"') + path(arch, w=11) + path(arch, w=6, stroke=MINT)
                + path('M 56 18 L 38 48 L 50 48 L 44 74 L 66 40 L 54 40 L 60 18 Z', SUN, 2.4) + rect(-4, 86, 108, 14, '#3B4466', rx=4))
    peek = ''.join(g(sock_body('open', cols), f'translate({x} -24) scale(0.32)') for x, cols in ((30, ('#53C27A', SUN)), (64, (LILAC, '#FF6B8B'))))
    return (rect(6, -30, 88, 128, '#C98F57', rx=6) + peek + rect(-2, -24, 104, 38, '#E0A867', rx=4) + circle(50, -5, 4, '#7A4A22', w=2)
            + rect(14, 22, 72, 32, '#B57A44', rx=4) + circle(50, 38, 4, '#7A4A22', w=2)
            + rect(14, 60, 72, 32, '#B57A44', rx=4) + circle(50, 76, 4, '#7A4A22', w=2))


BLOCK = {'hamster': ('#E2A867', '#F6D7A7', '#C48A4C'), 'robot': ('#6E7BA3', '#9AA7C7', '#C9D3EA'),
         'sock': (('#FFB3C7', '#9FE3CF', '#C9B8FF', '#FFE08A'), None, None)}


def block(theme, c, r, top):
    x, y = c * CELL, r * CELL
    if theme == 'hamster':
        body, lip, grain = BLOCK[theme]
        s = rect(x, y, CELL, CELL, body, w=2.4)
        s += path(f'M {x + 8} {y + 26} q 14 -5 26 0 t 18 0', w=1.8, stroke=grain) + path(f'M {x + 14} {y + 44} q 10 4 22 0', w=1.8, stroke=grain)
        return s + (rect(x, y, CELL, 10, lip, w=2.4) if top else '')
    if theme == 'robot':
        body, lip, rivet = BLOCK[theme]
        s = rect(x, y, CELL, CELL, body, w=2.4) + rect(x + 6, y + 6, CELL - 12, CELL - 12, 'none', rx=3, w=1.6, stroke='#56607E')
        s += ''.join(circle(x + dx, y + dy, 2.4, rivet, w=0) for dx in (6, CELL - 6) for dy in (6, CELL - 6))
        return s + (rect(x, y, CELL, 7, lip, w=2.4) if top else '')
    col = BLOCK['sock'][0][c % 4]
    return (rect(x + 1, y + 1, CELL - 2, CELL - 2, col, rx=9, w=2.4)
            + path(f'M {x + 6} {y + 21} q {CELL / 2 - 6} 5 {CELL - 12} 0', w=1.8, stroke='rgba(27,20,70,0.35)')
            + path(f'M {x + 6} {y + 40} q {CELL / 2 - 6} 5 {CELL - 12} 0', w=1.8, stroke='rgba(27,20,70,0.35)'))


def pit(theme, c, r):
    x, y = c * CELL, r * CELL
    if theme == 'robot':
        return (rect(x, y + 34, CELL, CELL - 34, '#7DE36B', w=0) + path(f'M {x} {y + 34} q 15 -6 30 0 t 30 0', w=2.4)
                + circle(x + 18, y + 46, 3.5, '#B8F5A8', w=1.4) + circle(x + 42, y + 50, 2.5, '#B8F5A8', w=1.4))
    water = '#7FD3F7' if theme == 'hamster' else '#9ADBF7'
    s = rect(x, y + 34, CELL, CELL - 34, water, w=0) + path(f'M {x} {y + 34} q 15 -6 30 0 t 30 0', w=2.4)
    if theme == 'sock':
        s += ''.join(circle(x + dx, y + 32 + dy, rr, WHITE, w=1.6) for dx, dy, rr in ((10, -2, 6), (24, -5, 8), (40, -2, 6), (52, -4, 5)))
    return s


def backdrop(theme):
    W, H = COLS * CELL, ROWS * CELL
    if theme == 'hamster':
        bands = ('#FFE9C7', '#FFE2BC', '#FFDAB0', '#FFD3A5')
        s = ''.join(rect(0, i * H / 4, W, H / 4 + 1, c, w=0) for i, c in enumerate(bands))
        s += ''.join(line(0, y, W, y, '#F3C995', 1.4) for y in range(240, H, 30)) + ''.join(line(x, 240, x, H, '#F3C995', 1.4) for x in range(0, W, 30))
        sky = uid('sky')
        s += f'<defs><linearGradient id="{sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A76"/><stop offset="1" stop-color="#FFD36E"/></linearGradient></defs>'
        s += rect(230, 34, 160, 112, f'url(#{sky})', w=0) + circle(320, 116, 22, '#FFF2B0', w=0) + path('M 230 146 Q 280 112 330 132 T 390 124 L 390 146 Z', '#F2A65A', w=0)
        s += rect(230, 34, 160, 112, 'none', rx=4, w=8, stroke=WHITE) + line(310, 34, 310, 146, WHITE, 6) + line(230, 90, 390, 90, WHITE, 6)
        d = rect(24, 236, 180, 10, '#C48A4C', rx=3, w=2.4)
        for x, h, col in ((40, 46, '#FF9BB3'), (90, 58, '#9FE3CF'), (146, 40, '#FFE08A')):
            d += rect(x, 236 - h, 36, h, col, rx=8, w=2.4) + rect(x - 2, 236 - h - 8, 40, 10, '#E8505B', rx=4, w=2.4)
        return s + g(d, extra=' opacity="0.8"')
    if theme == 'robot':
        bands = ('#2A2659', '#2F2B63', '#35306E', '#3B3578')
        s = ''.join(rect(0, i * H / 4, W, H / 4 + 1, c, w=0) for i, c in enumerate(bands))
        s += ''.join(circle(x, y, 2, '#4A4588', w=0) for x in range(40, 520, 24) for y in range(30, 250, 24))
        s += path('M 240 90 l 40 40 m -46 -46 a 12 12 0 1 0 12 12', w=8, stroke='#5A54A0')
        s += rect(170, 80, 12, 60, '#5A54A0', rx=4, w=0) + rect(156, 70, 40, 16, '#5A54A0', rx=4, w=0)
        s += rect(60, 86, 8, 48, '#5A54A0', rx=3, w=0) + path('M 58 134 l 6 18 l 6 -18 z', '#5A54A0', w=0)
        s += circle(130, 236, 44, '#14123A', w=6, stroke='#56607E') + path('M 144 210 a 24 24 0 1 0 0 48 a 18 18 0 1 1 0 -48 z', '#FFF2B0', w=0)
        s += ''.join(star(x, y, r, '#FFF2B0', 0) for x, y, r in ((108, 222, 4), (118, 262, 3), (156, 270, 3)))
        s += line(380, 0, 380, 30, INK, 3) + path('M 356 52 L 368 28 L 392 28 L 404 52 Z', CORAL, 2.4)
        s += path('M 356 52 L 320 200 L 440 200 L 404 52 Z', '#FFF2B0', 0, extra=' opacity="0.12"')
        return s
    bands = ('#F1E9FF', '#EADFFF', '#E2D4FF', '#DACAFF')
    s = ''.join(rect(0, i * H / 4, W, H / 4 + 1, c, w=0) for i, c in enumerate(bands))
    s += path('M 0 52 Q 360 92 720 52', w=2.4, stroke='#7C77B9')
    for x, cols in ((110, ('#FF6B8B', '#5FD3F3')), (140, ('#FF6B8B', '#5FD3F3')), (290, ('#53C27A', SUN)), (320, ('#53C27A', SUN))):
        yy = 52 + 40 * (1 - ((x - 360) / 360) ** 2) * 0.9
        s += g(g(sock_body('closed', cols), f'translate({x} {f(yy + 40)}) scale(0.42)') + rect(x - 5, yy - 4, 10, 14, '#C9B8FF', rx=3, w=2), extra=' opacity="0.8"')
    s += ''.join(circle(x, y, r, 'rgba(255,255,255,0.45)', w=2, stroke=WHITE) + path(f'M {x - r * 0.5} {y - r * 0.2} q {r * 0.2} {-r * 0.4} {r * 0.5} {-r * 0.5}', w=2, stroke=WHITE)
                 for x, y, r in ((260, 150, 18), (300, 120, 10), (560, 170, 22), (610, 130, 12), (40, 190, 14), (700, 220, 9)))
    return s


# ---------------------------------------------------------------- the walker model (proposed rules)
def walk(rows, gadgets):
    """Run one walker through a level. rows: text grid ('#' solid, 'S' start, 'G' home, '.' air);
    gadgets: {(col, row): 'B' bridge | 'R' ramp | 'P' bouncer | 'U' floater | 'T' tube}.
    Returns (outcome, route), outcome one of home, splash, bonk, stuck, bonk-head."""
    def cell(c, r):
        if c < 0 or c >= COLS or r >= ROWS:
            return None
        if r < 0:
            return '.'
        return gadgets.get((c, r), rows[r][c])

    def holds(c, r):
        return cell(c, r) in ('#', 'B', 'R', 'T')

    c, r = next((c, r) for r in range(ROWS) for c in range(COLS) if rows[r][c] == 'S')
    route, floater, tubed = [(c, r)], False, set()
    for _ in range(200):
        k = cell(c, r)
        if k == 'G':
            return 'home', route
        if k == 'P':
            if any(cell(c, r - i) == '#' for i in (1, 2, 3)) or r - 3 < 0:
                return 'bonk-head', route
            r -= 3
            route.append((c, r))
            if cell(c + 1, r) not in (None, '#'):
                c += 1
                route.append((c, r))
        if k == 'U':
            floater = True
        if k == 'T' and (c, r) not in tubed:
            chain = [(c, r)]
            while True:
                nxt = [(c2, r2) for c2, r2 in ((chain[-1][0], chain[-1][1] - 1), (chain[-1][0] + 1, chain[-1][1]),
                                              (chain[-1][0], chain[-1][1] + 1), (chain[-1][0] - 1, chain[-1][1]))
                       if cell(c2, r2) == 'T' and (c2, r2) not in chain]
                if not nxt:
                    break
                chain.append(nxt[0])
            tubed.update(chain)
            route += chain[1:]
            c, r = chain[-1]
        fell = 0
        while not holds(c, r + 1):
            if r + 1 >= ROWS:
                route.append((c, r + 1))
                return 'splash', route
            r += 1
            fell += 1
            route.append((c, r))
        if fell >= 3 and not floater:
            return 'bonk', route
        if fell:
            floater = False
        if cell(c, r) == 'G':
            return 'home', route
        n = cell(c + 1, r)
        if n is None or n == '#':
            return 'stuck', route
        if n == 'R':
            if cell(c + 1, r - 1) == '#':
                return 'stuck', route
            c, r = c + 1, r - 1
        else:
            c += 1
        route.append((c, r))
    return 'stuck', route


SAMPLE = ['............',
          '............',
          '........###.',
          '............',
          '............',
          'S......#...G',
          '###..#######']
SAMPLE_GADGETS = {(3, 6): 'B', (4, 6): 'B', (6, 5): 'R', (7, 4): 'P', (10, 1): 'U'}
KIND = {'B': 'bridge', 'R': 'ramp', 'P': 'spring', 'U': 'float', 'T': 'tube'}

LEVELS = [
    dict(name='Mind the gap', new='bridge', k='B', back=1, rows=['............', '............', '............', '............',
                                                          '............', 'S.........G.', '#####.######'],
         sol={(5, 6): 'B'}),
    dict(name='Step up', new='ramp', k='R', back=1, rows=['............', '............', '............', '............',
                                                   '..........G.', 'S.......####', '###.########'],
         sol={(3, 6): 'B', (7, 5): 'R'}),
    dict(name='Boing!', new='bouncer', k='P', back=2, rows=['............', '............', '............', '......###...',
                                                     '......###.G.', 'S.....######', '##.#########'],
         sol={(2, 6): 'B', (5, 5): 'P'}),
    dict(name='Gentle landing', new='floater', k='U', back=2, rows=['............', 'S...........', '###.##......', '............',
                                                             '............', '..........G.', '....########'],
         sol={(3, 2): 'B', (5, 1): 'U'}),
    dict(name='Tube trip', new='tube', k='T', back=3, rows=['............', '............', '............', '.........G..',
                                                     '.......####.', 'S...........', '###.########'],
         sol={(3, 6): 'B', (6, 5): 'T', (6, 4): 'T', (6, 3): 'T'}),
]
WITHOUT = {'splash': 'they fall into the water: splash', 'bonk': 'they drop too far: a funny fall',
           'stuck': 'they stop at the wall, nod off and fade', 'bonk-head': 'they bonk their heads'}
NAMES = {'bridge': 'bridge', 'ramp': 'ramp', 'spring': 'bouncer', 'float': 'floater', 'tube': 'tube'}


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


def without_new(L):
    return {p: v for p, v in L['sol'].items() if v != L['k']}


for i, L in enumerate(LEVELS, 1):
    out, _ = walk(L['rows'], without_new(L))
    check(out != 'home', f'level {i}: not solved without its new gadget, the {L["new"]} ({out})')
for name, rows, sol in [('sample level', SAMPLE, SAMPLE_GADGETS)] + [(f'level {i}', L['rows'], L['sol']) for i, L in enumerate(LEVELS, 1)]:
    assert len(rows) == ROWS and all(len(x) == COLS for x in rows), name
    with_, _ = walk(rows, sol)
    without, _ = walk(rows, {})
    check(with_ == 'home', f'{name}: solved with its gadgets ({with_})')
    check(without != 'home', f'{name}: not solved without them ({without})')
    for (c, r), k in sol.items():
        check(rows[r][c] == '.', f'{name}: {KIND[k]} goes in an empty square ({c},{r})')

# ---------------------------------------------------------------- themes
THEMES = [
    dict(id='hamster', key='A', title='Hamster Highway', hero=hamster, sc=0.56, panel='#8B5A3C', slot='#FFF8EE', slot_stroke=INK,
         pitch='Chubby hamsters scurry across the kitchen to their cosy house full of seeds.',
         rows=[('Heroes', 'the Nibbles: round ginger hamsters with pink paws.'),
               ('Start → home', 'out of a cardboard tube, home to a little wooden house with a pile of sunflower seeds.'),
               ('Backdrops', 'the kitchen worktop at sunset; the veg patch; the bedroom bookshelf at night.'),
               ('Gadgets', 'bridge: a lolly stick · ramp: a cheese wedge · bouncer: a marshmallow · floater: a dandelion clock · tube: a hamster tube (the Pipe Mania nod).'),
               ('Funny fall', 'flump! flat as a pancake, dizzy stars, then a puff of fluff and gone.'),
               ('Stuck', 'sits down, has a nibble, nods off and fades.'),
               ('Noises', 'squeaky footsteps, a soft boing, “wheee!” on the dandelion, munch-munch at home.')]),
    dict(id='robot', key='B', title='Wind-up Workshop', hero=robot, sc=0.53, panel='#22204A', slot='#3B3578', slot_stroke='#8C86D9',
         pitch='Little clockwork robots march across the toy workshop to their charging dock.',
         rows=[('Heroes', 'the Sprockets: teal wind-up bots with a key in the back and a light on top.'),
               ('Start → home', 'out of a hatch in the toy box, home to a glowing charging dock.'),
               ('Backdrops', 'the toy workshop at night; the junkyard at dusk; the rooftop under the stars.'),
               ('Gadgets', 'bridge: a red girder · ramp: a steel ramp · bouncer: a coil spring · floater: a propeller cap · tube: a copper pipe.'),
               ('Funny fall', 'clatter! falls to bits: the light pops off, a spring boings out, bolts roll away.'),
               ('Stuck', 'the key winds down, “…”, the screen goes dim and it fades.'),
               ('Noises', 'tick-tock steps, sproing, a propeller whirr, beep-boop! at the dock.')]),
    dict(id='sock', key='C', title='Odd Socks', hero=sock, sc=0.56, panel='#7E6BD6', slot='#F4F0FF', slot_stroke=INK,
         pitch='Lost socks hop out of the washing machine and bounce home to the sock drawer.',
         rows=[('Heroes', 'the Odd Socks: stripy socks with googly eyes that hop instead of walk.'),
               ('Start → home', 'out of the washing machine, home to the sock drawer (each finds its pair).'),
               ('Backdrops', 'the laundry room; the bathroom full of bubbles; the bedroom by the drawers.'),
               ('Gadgets', 'bridge: a ruler · ramp: an ironing board · bouncer: a sponge · floater: a soap bubble · tube: the laundry chute.'),
               ('Funny fall', 'a slide-whistle, then a crumpled heap with spinning eyes, and it puffs away as fluff.'),
               ('Stuck', 'flops over like an empty sock, “phew”, and fades.'),
               ('Noises', 'soft fwup-fwup hops, a squelch on the sponge, a bubble plip and pop, a happy “ahh” at the drawer.')]),
]
GADGET_ORDER = ['bridge', 'ramp', 'spring', 'float', 'tube']


def go_button(x, y):
    return (rect(x, y, 128, 76, '#3CC864', rx=38, w=3.5) + rect(x + 10, y + 8, 108, 20, 'rgba(255,255,255,0.28)', rx=10, w=0)
            + path(f'M {x + 22} {y + 20} L {x + 22} {y + 56} L {x + 50} {y + 38} Z', WHITE, 3)
            + text(x + 90, y + 50, 'GO!', 32, WHITE, extra=f' stroke="{INK}" stroke-width="5" paint-order="stroke" stroke-linejoin="round"'))


def icon(theme, kind, x, y, sc):
    lift = 40 if kind == 'bridge' else 0
    return place(gadget(theme, kind), x, y + lift * sc, sc)


def board(T, rows):
    """The backdrop, blocks, water, start and home of a 12 x 7 level, in theme T."""
    th = T['id']
    s = backdrop(th)
    for r in range(ROWS):
        for c in range(COLS):
            if rows[r][c] == '#':
                s += block(th, c, r, r == 0 or rows[r - 1][c] != '#')
            elif r == ROWS - 1:
                s += pit(th, c, r)
    (sc, sr), (gc, gr) = [next((c, r) for r in range(ROWS) for c in range(COLS) if rows[r][c] == ch) for ch in 'SG']
    return s + place(start_art(th), sc * CELL, sr * CELL, CELL / 100) + place(home_art(th), gc * CELL, gr * CELL, CELL / 100)


def tray(T, counts, selected=None, H=ROWS * CELL):
    """The tray under the board: the level map button, the five gadgets (dots = how many) and GO.
    The selected gadget is lifted and ringed."""
    th, W = T['id'], COLS * CELL
    s = rect(0, H, W, 110, T['panel'], w=0) + line(0, H, W, H, INK, 3)
    s += circle(46, H + 55, 30, T['slot'], w=3, stroke=T['slot_stroke'])
    s += ''.join(rect(32 + 15 * dx, H + 41 + 15 * dy, 12, 12, SUN if (dx, dy) == (0, 0) else '#C9D3EA', rx=3, w=2) for dx in (0, 1) for dy in (0, 1))
    for i, kind in enumerate(GADGET_ORDER):
        x = 100 + 94 * i
        n = counts[kind]
        one = rect(x, H + 11, 84, 78, T['slot'], rx=14, w=3, stroke=T['slot_stroke'], extra='' if n else ' opacity="0.45"')
        one += g(icon(th, kind, x + 17, H + 14, 0.5), extra='' if n else ' opacity="0.35"')
        one += ''.join(circle(x + 42 + 13 * (j - (n - 1) / 2), H + 76, 4.5, SUN, w=2) for j in range(n))
        if kind == selected:
            one = rect(x - 5, H + 6, 94, 88, 'none', rx=18, w=5, stroke=SUN) + one
            one = g(one, 'translate(0 -10)')
        s += one
    return s + go_button(578, H + 17)


def scene(T):
    th, W, H = T['id'], COLS * CELL, ROWS * CELL
    s = board(T, SAMPLE)
    s += place(gadget(th, 'bridge', 2), 3 * CELL, 6 * CELL, CELL / 100)
    for (c, r), k in SAMPLE_GADGETS.items():
        if k != 'B':
            s += place(gadget(th, KIND[k]), c * CELL, r * CELL, CELL / 100)
    s += path('M 450 254 C 446 150 466 70 506 116', w=2.4, stroke=INK, extra=' stroke-dasharray="2 8" opacity="0.55"')
    hero, sc = T['hero'], T['sc']
    s += place(hero('walk1'), 222, 360, sc) + place(hero('walk2'), 392, 330, sc, rot=-24)
    s += place(hero('boing'), 452, 124, sc) + place(hero('float'), 684, 246, sc) + place(hero('home'), 632, 360, sc)
    s += rect(10, 10, 200, 44, 'rgba(255,255,255,0.88)', rx=22, w=2.5)
    for i in range(5):
        s += place(hero('walk1'), 38 + 36 * i, 49, 0.34, op=1 if i == 0 else 0.3)
    s += star(48, 20, 7)
    s += circle(684, 32, 22, WHITE, w=2.5) + path('M 674 26 a 12 12 0 1 1 -1 12', w=3) + path('M 668 18 L 673 27 L 682 22', w=3)
    s += tray(T, {'bridge': 2, 'ramp': 1, 'spring': 1, 'float': 1, 'tube': 0})
    return f'<svg viewBox="0 0 {W} {H + 110}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{T["title"]}: the sample level">{s}</svg>'


POSES = [('walk1', 'walk'), ('walk2', 'walk'), ('boing', 'bouncer'), ('float', 'floater'), ('stuck', 'stuck: fades'),
         ('bonk', 'funny fall'), ('home', 'home!')]


def sprites(T):
    s = ''
    for i, (pose, label) in enumerate(POSES):
        x = i * 110
        s += rect(x + 4, 4, 102, 128, T['slot'] if T['id'] != 'robot' else '#2F2B63', rx=14, w=2, stroke='rgba(27,20,70,0.25)')
        sc = T['sc'] * (1.08 if pose == 'float' else 1.5)
        s += place(T['hero'](pose), x + 55, 118, sc)
        s += text(x + 55, 152, label, 14, 'currentColor', weight=600, family='system-ui, sans-serif')
    return f'<svg viewBox="0 0 770 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{T["title"]}: poses">{s}</svg>'


def gadget_strip(T):
    s = ''
    for i, kind in enumerate(GADGET_ORDER):
        x = i * 124
        s += rect(x + 4, 4, 116, 100, T['slot'] if T['id'] != 'robot' else '#2F2B63', rx=14, w=2, stroke='rgba(27,20,70,0.25)')
        s += icon(T['id'], kind, x + 27, 16, 0.7)
        s += text(x + 62, 126, NAMES[kind], 15, 'currentColor', weight=600, family='system-ui, sans-serif')
    return f'<svg viewBox="0 0 620 136" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{T["title"]}: gadgets">{s}</svg>'


# ---------------------------------------------------------------- fit on the devices (worked out here)
BAR, TRAY = 56, 96   # the wrapper's bar (Q-039); a tray 96 px deep, my judgement (buttons about 76 px)
DEVICES = [('Phone, upright', 390, 844), ('Phone, sideways', 844, 390), ('PC', 1366, 768)]
FIT = []
for name, w, h in DEVICES:
    fh = h - BAR
    bottom, side = min(w / COLS, (fh - TRAY) / ROWS), min((w - TRAY) / COLS, fh / ROWS)
    FIT.append((name, w, h, fh, bottom, side, 'side' if side > bottom else 'bottom', max(bottom, side)))
    print(f'fit {name}: frame {w}x{fh}, square {bottom:.1f} px with the tray below, {side:.1f} px with it at the side')


def fit_svg():
    k, s, slot0 = 0.22, '', 10
    for name, w, h, fh, bottom, side, where, cell in FIT:
        W_, H_ = w * k, h * k
        slot = max(W_, 190)
        x0 = slot0 + (slot - W_) / 2
        s += rect(x0, 10, W_, H_, '#F7F5FF', rx=6, w=2.4) + rect(x0, 10, W_, BAR * k, '#3B3578', w=0)
        bw, bh = cell * COLS * k, cell * ROWS * k
        if where == 'bottom':
            ax, ay, aw, ah = x0, 10 + BAR * k, W_, (fh - TRAY) * k
            s += rect(x0, 10 + H_ - TRAY * k, W_, TRAY * k, '#7E6BD6', w=0) + circle(x0 + W_ - 14, 10 + H_ - TRAY * k / 2, 8, '#3CC864', w=1.6)
        else:
            ax, ay, aw, ah = x0, 10 + BAR * k, W_ - TRAY * k, fh * k
            s += rect(x0 + W_ - TRAY * k, 10 + BAR * k, TRAY * k, fh * k, '#7E6BD6', w=0) + circle(x0 + W_ - TRAY * k / 2, 10 + H_ - 14, 8, '#3CC864', w=1.6)
        bx, by = ax + (aw - bw) / 2, ay + (ah - bh) / 2
        s += rect(bx, by, bw, bh, '#EAF4FF', w=0)
        s += ''.join(line(bx + i * cell * k, by, bx + i * cell * k, by + bh, '#A9B6D6', 0.6) for i in range(COLS + 1))
        s += ''.join(line(bx, by + j * cell * k, bx + bw, by + j * cell * k, '#A9B6D6', 0.6) for j in range(ROWS + 1))
        s += rect(x0, 10, W_, H_, 'none', rx=6, w=2.4)
        s += text(slot0 + slot / 2, 10 + 190 + 22, name, 14, 'currentColor', weight=700, family='system-ui, sans-serif')
        s += text(slot0 + slot / 2, 10 + 190 + 40, f'squares {cell:.0f} px, tray {"below" if where == "bottom" else "at the side"}', 13,
                  'currentColor', weight=400, family='system-ui, sans-serif')
        slot0 += slot + 24
    return f'<svg viewBox="0 0 {f(slot0)} 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The sample level on each device">{s}</svg>'


# ---------------------------------------------------------------- level sketches (plain)
def glyph(kind, x, y, s):
    a = 'fill-opacity="0.85"'
    if kind == 'bridge':
        return rect(x - 2, y, s + 4, s * 0.24, '#F0A51C', rx=3, w=1.8, extra=f' {a}')
    if kind == 'ramp':
        return path(f'M {x + 2} {y + s} L {x + s} {y + s} L {x + s} {y + 2} Z', '#F0A51C', 1.8, extra=f' {a}')
    if kind == 'spring':
        return path(f'M {x + 6} {y + s - 3} l {s - 12} -5 l {-(s - 12)} -5 l {s - 12} -5 l {-(s - 12)} -5', w=2.6, stroke='#C77A0C') + rect(x + 5, y + s - 32, s - 10, 5, '#F0A51C', rx=2, w=1.6)
    if kind == 'float':
        return (path(f'M {x + 4} {y + s * 0.45} A {s * 0.42} {s * 0.38} 0 0 1 {x + s - 4} {y + s * 0.45} Z', '#F0A51C', 1.8)
                + line(x + s / 2, y + s * 0.45, x + s / 2, y + s - 2, INK, 1.8))
    return ''


def level_svg(L):
    k, rows, sol = 30, L['rows'], L['sol']
    W, H = COLS * k, ROWS * k
    s = rect(0, 0, W, H, {1: '#EAF4FF', 2: '#FFF1E2', 3: '#F1EBFF'}[L['back']], w=0)
    for r in range(ROWS):
        for c in range(COLS):
            if rows[r][c] == '#':
                s += rect(c * k, r * k, k, k, '#7D8BB0', w=1.4, stroke='#5A6C8C')
                if r == 0 or rows[r - 1][c] != '#':
                    s += rect(c * k, r * k, k, 5, '#A9B6D6', w=0)
            elif r == ROWS - 1:
                s += rect(c * k, r * k + 18, k, k - 18, '#9ADBF7', w=0)
    tubes = [(c, r) for (c, r), v in sol.items() if v == 'T']
    if tubes:
        _, rt = walk(rows, sol)
        chain = [p for p in rt if p in tubes]
        d = f'M {chain[0][0] * k - 6} {chain[0][1] * k + k / 2} ' + ' '.join(f'L {c * k + k / 2} {r * k + k / 2}' for c, r in chain) + f' L {chain[-1][0] * k + k + 4} {chain[-1][1] * k + k / 2}'
        s += path(d, 'none', 18, '#C77A0C') + path(d, 'none', 13, '#FFD45E')
    for (c, r), v in sol.items():
        s += rect(c * k + 2, r * k + 2, k - 4, k - 4, 'none', rx=5, w=2, stroke='#C77A0C', extra=' stroke-dasharray="4 3"')
        s += glyph(KIND[v], c * k, r * k, k)
    sc, sr = next((c, r) for r in range(ROWS) for c in range(COLS) if rows[r][c] == 'S')
    gc, gr = next((c, r) for r in range(ROWS) for c in range(COLS) if rows[r][c] == 'G')
    s += rect(sc * k + 4, sr * k + 2, k - 10, k - 2, '#3CC864', rx=4, w=1.8) + star(gc * k + k / 2, gr * k + k / 2, 12)
    outcome, route = walk(rows, sol)
    pts = ' '.join(f'{c * k + k / 2},{r * k + k / 2 + 4}' for c, r in route)
    s += f'<polyline points="{pts}" fill="none" stroke="#2BB673" stroke-width="3.2" stroke-dasharray="0.1 7" stroke-linecap="round" stroke-linejoin="round"/>'
    bad, broute = walk(rows, without_new(L))
    bc, br = broute[-1]
    bx, by = bc * k + k / 2, min(br, ROWS - 1) * k + k / 2 + (8 if br >= ROWS - 1 else 0)
    word = {'splash': 'splash!', 'bonk': 'bonk!', 'stuck': 'stuck', 'bonk-head': 'bonk!'}[bad]
    s += star(bx, by, 10, CORAL, 1.6) + text(min(max(bx, 30), W - 30), by - 16, word, 13, '#C2185B', weight=800, family='system-ui, sans-serif',
                                              extra=' stroke="#FFFFFF" stroke-width="4" paint-order="stroke" stroke-linejoin="round"')
    s += rect(0, 0, W, H, 'none', w=2)
    return f'<svg viewBox="-2 -2 {W + 4} {H + 4}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Level sketch: {L["name"]}">{s}</svg>', outcome, bad


# ---------------------------------------------------------------- page 1: three themes (sketches 1, 15 Nov)
font = base64.b64encode(open(os.path.join(REPO, 'games', '_common', 'fonts', 'fredoka-latin-700-normal.woff2'), 'rb').read()).decode()


def page1():
    theme_html = ''
    for T in THEMES:
        dl = ''.join(f'<dt>{a}</dt><dd>{b}</dd>' for a, b in T['rows'])
        theme_html += (f'<section id="theme-{T["id"]}"><h2>{T["key"]}. {T["title"]}</h2><p class="pitch">{T["pitch"]}</p>'
                       f'<figure class="scene">{scene(T)}<figcaption>The sample level just after GO: walkers on the bridge, the ramp, '
                       f'the bouncer and the floater, and the first one home. The tray shows the level\'s gadgets as it starts '
                       f'(dots = how many); the tube isn\'t in this level.</figcaption></figure>'
                       f'<div class="row"><figure class="strip">{sprites(T)}<figcaption>The hero\'s poses</figcaption></figure>'
                       f'<figure class="strip narrow">{gadget_strip(T)}<figcaption>The five gadgets</figcaption></figure></div>'
                       f'<dl>{dl}</dl></section>')
    level_html = ''
    for i, L in enumerate(LEVELS, 1):
        svg_, outcome, bad = level_svg(L)
        tray_txt = ', '.join(f'{n} {NAMES[KIND[k]]}{"s" if n > 1 else ""}' for k, n in
                             sorted({v: list(L['sol'].values()).count(v) for v in L['sol'].values()}.items(), key=lambda kv: 'BRPUT'.index(kv[0])))
        level_html += (f'<figure class="level">{svg_}<figcaption><b>{i}. {L["name"]}</b> · new: the {L["new"]} · tray: {tray_txt} · '
                       f'backdrop {L["back"]}<br>Without the {L["new"]}, {WITHOUT[bad]}.</figcaption></figure>')
    (up, side_, pc) = FIT
    fit_text = (f'The board is 12 × 7 squares. On the phone held upright it can only be {up[1]} px wide, so each square is about '
                f'{up[7]:.0f} px: small for a child\'s finger (my judgement). Held sideways, with the tray down the side, each is about '
                f'{side_[7]:.0f} px; on the PC about {pc[7]:.0f} px. Worked out here from the screen sizes Rocket Lander was checked at, '
                f'less the wrapper\'s {BAR} px bar, with a {TRAY} px tray (my judgement).')
    body = f'''
<h1>Bridge &amp; Ramp Builder: three themes (sketches 1)</h1>
<p class="stamp">Sketches, not the finished look. Original art throughout (D-010): it plays a little like Lemmings and Pipe Mania, but looks like neither. sketch_bridge_builder.py {VERSION} · built at {COMMIT} · draft, for Rob to choose from</p>
<h2>How a level plays (proposed)</h2>
<ul>
<li><b>Build:</b> tap a gadget in the tray, then a glowing build spot. Tap a placed gadget to take it back.</li>
<li><b>GO!</b> Five walkers come out one after another and walk to the right on their own. The gadgets stay where they are, so another try costs nothing.</li>
<li><b>Falls:</b> one or two squares down is fine; three or more is a funny fall, then the walker fades. A walker stuck at a wall nods off and fades after about 3 seconds.</li>
<li><b>Home:</b> when they're all home, there's a party and the next level opens. No timer, no score, nothing to read.</li>
</ul>
{theme_html}
<section id="fit"><h2>The same level on your devices</h2><p>{fit_text}</p>
<figure class="fit">{fit_svg()}<figcaption>To scale: the wrapper's bar (dark), the board (light) and the tray with GO (purple).</figcaption></figure></section>
<section id="levels"><h2>Five first levels, one new gadget each</h2>
<p>Plain sketches, the same in any theme. Dashed squares are build spots, shown with the gadget that solves them; the green dots are the walkers' route; the red star is where they end up without the level's new gadget. Each was run through the proposed walker rules by this script.</p>
<div class="row">{level_html}</div>
<p><b>After level 5 (proposed):</b> mix them up, two or three gadgets at once; then spare spots and a spare gadget, so there's a choice to make; then taller levels with more platforms.</p></section>
'''
    return 'Bridge &amp; Ramp Builder: three themes (sketches 1)', body, '', 3 * len(THEMES) + 1 + len(LEVELS)


# ---------------------------------------------------------------- page 2: placing gadgets and six ideas (sketches 2, 15 Nov)
HAM = THEMES[0]
STEP = LEVELS[1]['rows']      # level 2, Step up: the gap at (3, 6), the step at (7, 5)
SPOTS = [(3, 6), (7, 5)]
GREEN, AMBER = '#2BB673', '#F0A51C'
C0 = {'bridge': 1, 'ramp': 1, 'spring': 0, 'float': 0, 'tube': 0}


def fits(rows, placed, kind):
    """Option (b), anywhere it fits: a bridge over a gap in the ground (an empty square in the bottom
    row); any other gadget on an empty square with ground or a placed bridge under it."""
    out = []
    for r in range(ROWS):
        for c in range(COLS):
            if rows[r][c] != '.' or (c, r) in placed:
                continue
            if kind == 'bridge':
                ok = r == ROWS - 1
            else:
                ok = r + 1 < ROWS and (rows[r + 1][c] == '#' or placed.get((c, r + 1)) == 'B')
            if ok:
                out.append((c, r))
    return out


def marks_svg(cells, style):
    s = ''
    for c, r in cells:
        x, y = c * CELL, r * CELL
        if style == 'spot':
            s += rect(x + 4, y + 4, CELL - 8, CELL - 8, 'rgba(255,201,60,0.3)', rx=10, w=3, stroke=AMBER, extra=' stroke-dasharray="8 6"')
        else:
            s += rect(x + 3, y + 3, CELL - 6, CELL - 6, 'rgba(255,246,199,0.8)', rx=8, w=2, stroke=AMBER)
    return s


def ghost(c, r, kind, ok):
    x, y = c * CELL, r * CELL
    col = GREEN if ok else CORAL
    s = rect(x + 2, y + 2, CELL - 4, CELL - 4, col, rx=10, w=4, stroke=col, extra=' fill-opacity="0.16"')
    s += place(gadget('hamster', kind), x, y, CELL / 100, op=0.6)
    if not ok:
        s += line(x + 40, y + 8, x + 54, y + 22, CORAL, 4.5) + line(x + 54, y + 8, x + 40, y + 22, CORAL, 4.5)
    return s


def pointer(x, y):
    return path(f'M {x} {y} l 0 30 l 8 -7 l 6 13 l 6 -3 l -6 -12 l 10 0 z', WHITE, 2.4)


def sparkle(c, r):
    x, y = c * CELL, r * CELL
    return star(x + 6, y + 8, 6) + star(x + 58, y + 4, 5) + star(x + 62, y + 40, 4) + circle(x + 2, y + 56, 4, '#EDEBFF', w=1.4, stroke='#B9B4D6')


def frame(n, placed=None, counts=C0, selected=None, marks=(), ghost_=None, ptr=None, extra=''):
    placed = placed or {}
    s = board(HAM, STEP)
    for (c, r), k in placed.items():
        s += place(gadget('hamster', KIND[k]), c * CELL, r * CELL, CELL / 100)
    for cells, style in marks:
        s += marks_svg(cells, style)
    if ghost_:
        s += ghost(*ghost_)
    s += extra + tray(HAM, counts, selected)
    if ptr:
        s += pointer(*ptr)
    s += circle(32, 32, 22, WHITE, w=3) + text(32, 42, str(n), 26)
    return f'<svg viewBox="0 0 720 530" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placing gadgets, step {n}">{s}</svg>'


def less(counts, **k):
    d = dict(counts)
    d.update(k)
    return d


BRIDGED = {(3, 6): 'B'}
RAMP_FITS = fits(STEP, BRIDGED, 'ramp')
def options():
    """Built only for sketches 2, so sketches 1's drawing ids stay as they were."""
    return [
        ('a', 'Build spots', 'The level marks a few squares, and any gadget can go in any spot. The simplest: few places to try, and every level is known to have an answer. The least to think about.', [
            (frame(1, selected='ramp', marks=[(SPOTS, 'spot')], ptr=(240, 462)), 'Pick the ramp: the build spots glow.'),
            (frame(2, selected='ramp', marks=[([(3, 6)], 'spot')], ghost_=(7, 5, 'ramp', True), ptr=(462, 344)), 'Drag it onto a spot, or click the spot.'),
            (frame(3, placed={(7, 5): 'R'}, counts=less(C0, ramp=0), marks=[([(3, 6)], 'spot')], extra=sparkle(7, 5)), 'In it pops. Click it again to send it back.')]),
        ('b', 'Anywhere it fits', 'Pick a gadget and every square where it can stand lights up: a bridge only over a gap, the others on any floor. More places to choose from, so more to work out (where exactly does the ramp go?), but no muddles like a ramp in mid-air.', [
            (frame(1, selected='bridge', marks=[(fits(STEP, {}, 'bridge'), 'fit')], ptr=(146, 462)), 'Pick the bridge: only the gap lights up.'),
            (frame(2, placed=BRIDGED, counts=less(C0, bridge=0), selected='ramp', marks=[(RAMP_FITS, 'fit')], ghost_=(5, 2, 'ramp', False), ptr=(342, 164)),
             'Pick the ramp: every floor square lights up. In mid-air it turns red and won\'t go.'),
            (frame(3, placed=BRIDGED, counts=less(C0, bridge=0), selected='ramp', marks=[([p for p in RAMP_FITS if p != (7, 5)], 'fit')], ghost_=(7, 5, 'ramp', True), ptr=(462, 344)),
             'By the step it goes green: drop it there.')]),
        ('c', 'Anywhere at all', 'Any empty square, with no glow. The most freedom, and the most muddles: a ramp floating in the air does nothing, and the child finds out only by pressing GO.', [
            (frame(1, selected='ramp', ptr=(342, 164)), 'Pick the ramp: nothing lights up.'),
            (frame(2, placed={(3, 6): 'B', (5, 2): 'R'}, counts=less(C0, bridge=0, ramp=0), extra=sparkle(5, 2)), 'It goes wherever it\'s dropped, even in mid-air.'),
            (frame(3, placed={(3, 6): 'B', (5, 2): 'R'}, counts=less(C0, bridge=0, ramp=0),
                   extra=place(hamster('stuck'), 396, 360, 0.56) + circle(430, 268, 16, WHITE, w=2.4) + text(430, 277, '?', 22)
                   + place(hamster('walk1'), 250, 360, 0.56)), 'After GO: stuck at the step. Try again.')]),
    ]


def mini(rows):
    """An 8-wide level corner in Hamster Highway's style: plain kitchen bands, blocks, water, start and home."""
    H, W = len(rows) * CELL, len(rows[0]) * CELL
    s = ''.join(rect(0, i * H / 4, W, H / 4 + 1, c, w=0) for i, c in enumerate(('#FFE9C7', '#FFE2BC', '#FFDAB0', '#FFD3A5')))
    s += ''.join(line(0, y, W, y, '#F3C995', 1.4) for y in range(150, H, 30)) + ''.join(line(x, 150, x, H, '#F3C995', 1.4) for x in range(0, W, 30))
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == '#':
                s += block('hamster', c, r, r == 0 or rows[r - 1][c] != '#')
            elif r == len(rows) - 1:
                s += pit('hamster', c, r)
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == 'S':
                s += place(start_art('hamster'), c * CELL, r * CELL, CELL / 100)
            if ch == 'G':
                s += place(home_art('hamster'), c * CELL, r * CELL, CELL / 100)
    return s, W, H


def route(d, col=GREEN, op=1.0):
    return path(d, w=3.2, stroke=col, extra=f' stroke-dasharray="0.1 8" opacity="{f(op)}"')


def arrow_head(x, y, ang, col=GREEN):
    a = math.radians(ang)
    p1 = (x - 10 * math.cos(a - 0.5), y - 10 * math.sin(a - 0.5))
    p2 = (x - 10 * math.cos(a + 0.5), y - 10 * math.sin(a + 0.5))
    return path(f'M {f(p1[0])} {f(p1[1])} L {f(x)} {f(y)} L {f(p2[0])} {f(p2[1])}', w=3.2, stroke=col)


def leftward(body):
    return g(body, 'scale(-1 1)')


def seed(x, y, sc=1.0):
    return g(path('M 0 -14 C 10 -6 10 8 0 15 C -10 8 -10 -6 0 -14 Z', '#FFD45E', 2.4) + path('M 0 -9 L 0 10', w=1.8, stroke='#C77A0C'),
             f'translate({f(x)} {f(y)}) scale({f(sc)})')


def idea_svg(name, body, W, H):
    return f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{name}">{body}</svg>'


def idea_catapult():
    s, W, H = mini(['........', '........', '........', 'S......G', '##....##'])
    s += route('M 132 192 Q 262 -30 400 230')
    s += rect(80, 218, 24, 22, '#C98F57', rx=4, w=2.4)
    s += line(58, 238, 124, 198, INK, 12) + line(58, 238, 124, 198, '#E2A867', 7) + ellipse(132, 192, 16, 9, '#E2A867', rot=-32)
    s += place(hamster('boing'), 262, 96, 0.56, rot=24) + text(262, 30, 'wheee!', 18, '#C77A0C')
    s += place(hamster('home'), 386, 240, 0.56) + place(hamster('walk1'), 36, 240, 0.56)
    return idea_svg('Spoon catapult', s, W, H)


def idea_signpost():
    s, W, H = mini(['........', 'S.......', '###.....', 'G.......', '########'])
    s += route('M 70 108 L 200 108 L 214 222 L 430 222') + arrow_head(430, 222, 0)
    s += route('M 430 234 L 70 234', '#C77A0C') + arrow_head(70, 234, 180, '#C77A0C')
    s += line(452, 240, 452, 192, '#8B5A3C', 6) + path('M 424 200 L 436 186 L 474 186 L 474 212 L 436 212 Z', '#C98F57', 2.4)
    s += place(hamster('walk2'), 214, 168, 0.56) + place(hamster('walk1'), 330, 240, 0.56)
    s += place(leftward(hamster('walk1')), 410, 240, 0.56) + place(leftward(hamster('walk2')), 150, 240, 0.56)
    return idea_svg('Twig signpost', s, W, H)


def idea_wheel():
    s, W, H = mini(['........', '........', '........', 'S......G', '####..##'])
    s += line(150, 180, 118, 240, STEEL, 6) + line(150, 180, 182, 240, STEEL, 6)
    s += circle(150, 168, 58, 'rgba(255,255,255,0.45)', w=4) + circle(150, 168, 48, 'none', w=2.4, stroke='#C9D3EA')
    s += ''.join(line(150, 168, 150 + 48 * math.cos(a), 168 + 48 * math.sin(a), '#C9D3EA', 2) for a in [i * math.pi / 4 for i in range(8)])
    s += place(hamster('walk2'), 150, 222, 0.5) + text(150, 98, 'whirr!', 16, '#C77A0C')
    s += path('M 150 168 L 300 40 L 356 236', w=2, stroke='#8B5A3C', extra=' stroke-dasharray="5 4"') + circle(300, 40, 9, '#C9D3EA', w=2.4)
    s += place(gadget('hamster', 'bridge', 2), 240, 240, CELL / 100)
    s += place(hamster('walk1'), 296, 240, 0.56) + place(hamster('walk2'), 392, 240, 0.56) + place(hamster('walk1'), 54, 240, 0.56, op=0.9)
    return idea_svg('Hamster wheel', s, W, H)


def idea_seeds():
    s, W, H = mini(['........', '........', '...###..', 'S......G', '########'])
    s += route('M 64 232 L 400 232', '#9AA7C7')
    s += route('M 150 220 C 150 40 180 30 196 108 L 350 108 L 364 222 L 400 222')
    s += place(gadget('hamster', 'spring'), 120, 180, CELL / 100)
    s += seed(272, 92, 1.2) + star(250, 70, 6, '#FFF2B0', 1.4) + star(296, 74, 5, '#FFF2B0', 1.4)
    s += place(hamster('walk1'), 226, 120, 0.56) + place(hamster('walk2'), 290, 240, 0.56, op=0.55)
    s += rect(10, 10, 92, 40, 'rgba(255,255,255,0.88)', rx=20, w=2.5) + seed(36, 30, 0.8) + seed(64, 30, 0.8) + g(seed(88, 30, 0.8), extra=' opacity="0.3"')
    s += text(300, 274, 'easy way', 14, '#5A6C8C', weight=600, family='system-ui, sans-serif')
    s += text(196, 24, 'seed way', 14, GREEN, weight=700, family='system-ui, sans-serif')
    return idea_svg('Golden seeds', s, W, H)


def idea_fixit():
    s, W, H = mini(['........', '........', '......G.', 'S....###', '##.#####'])
    s += place(gadget('hamster', 'ramp'), 120, 240, CELL / 100) + place(gadget('hamster', 'bridge'), 240, 227, CELL / 100)
    s += place(hamster('stuck'), 270, 240, 0.56) + circle(300, 150, 16, WHITE, w=2.4) + text(300, 159, '?', 22)
    s += path('M 150 236 C 160 120 250 120 262 214', w=3, stroke=AMBER, extra=' stroke-dasharray="7 6"') + arrow_head(262, 214, 80, AMBER) + arrow_head(150, 236, 95, AMBER)
    s += text(206, 112, 'swap!', 16, '#C77A0C')
    return idea_svg('Fix-it level', s, W, H)


def idea_rooms():
    W, H = 480, 300
    s = rect(0, 0, W, H, '#DFF3FF', w=0) + rect(0, 250, W, 50, '#8BD48B', w=0) + line(0, 250, W, 250, INK, 2.4)
    s += path('M 6 96 L 160 16 L 314 96 Z', '#E8505B') + rect(20, 96, 280, 154, '#FFE9C7', w=3) + line(20, 172, 300, 172, INK, 3)
    s += text(160, 118, 'bookshelf (later)', 14, '#9AA7C7', weight=600, family='system-ui, sans-serif') + text(252, 192, 'kitchen', 14, '#8B5A3C', weight=700, family='system-ui, sans-serif')
    s += text(400, 196, 'veg patch', 14, '#3E9B4F', weight=700, family='system-ui, sans-serif')
    s += ''.join(ellipse(x, 262, 14, 6, '#8B5A3C', w=1.6) + path(f'M {x} 256 q -6 -10 -10 -6 m 10 6 q 6 -10 10 -6', w=1.8, stroke='#3E9B4F') for x in (330, 372, 414, 456))
    pts = [(46, 228), (96, 214), (146, 228), (196, 214), (250, 228), (330, 230), (372, 212), (414, 230), (448, 212), (448, 160)]
    s += path('M ' + ' L '.join(f'{x} {y}' for x, y in pts), w=3, stroke=AMBER, extra=' stroke-dasharray="2 7"')
    s += ''.join(circle(x, y, 13, SUN if i < 3 else WHITE, w=2.4) + text(x, y + 5, str(i + 1), 13, INK) for i, (x, y) in enumerate(pts))
    s += ''.join(circle(x, 148, 9, '#EDEBFF', w=2, stroke='#9AA7C7') for x in (80, 130, 180, 230))
    s += place(hamster('home'), 146, 214, 0.36) + seed(108, 240, 0.6) + seed(372, 236, 0.6)
    s += path('M 404 120 L 470 120', w=2, stroke=INK) + ''.join(path(f'M {x} 120 l 6 12 l 6 -12 z', c, 1.6) for x, c in ((408, CORAL), (424, SUN), (440, MINT), (456, LILAC)))
    s += rect(430, 136, 36, 14, PINK, rx=4, w=2) + star(448, 132, 5)
    return idea_svg('Rooms with a story', s, W, H)


GADGET_IDEAS = [
    ('Spoon catapult', idea_catapult, 'A wooden spoon on a cork. A hamster that steps on it is flung in an arc across a wide gap, landing three squares on. The bouncer goes up; the spoon goes across, so it crosses gaps too wide for the bridges in the tray.', 'judging how far', 'v1.1'),
    ('Twig signpost', idea_signpost, 'A little arrow sign: a hamster that reaches it turns round and walks the other way. Home can then be behind or under the start, and later levels can zig-zag up the bookshelf.', 'left and right, and a route that turns back', 'v1.1'),
    ('Hamster wheel', idea_wheel, 'The first hamster to reach it hops in and runs. While it runs, it lowers a drawbridge (or lifts a teacup lift) somewhere else; the rest cross, and the runner follows the last one home.', 'cause and effect: one thing making another happen', 'later: it ends the rule that every hamster does the same'),
]
LEVEL_IDEAS = [
    ('Golden seeds', idea_seeds, 'A shiny seed on a harder route. Every level can still be finished the easy way; the seed is a reason for a second go, and the level map shows where seeds are still hidden.', 'more than one way works, and trying again on purpose', 'v1: no new rule'),
    ('Fix-it levels', idea_fixit, 'The gadgets are already out, but two are in the wrong places. Press GO, watch what goes wrong, then swap them.', 'spotting a mistake and putting it right (the start of debugging)', 'v1: one or two of the 10 levels'),
    ('Rooms with a story', idea_rooms, 'The levels sit on a map of the house: the kitchen worktop, then the veg patch, each room ending in a bigger level that uses everything so far, and a seed party. New rooms later bring new gadgets.', 'nothing new on its own: it gives the 10 levels a journey and a reason to go on', 'v1: it is the level map'),
]


def page2():
    opts = ''
    for key, name, pitch, frames in options():
        figs = ''.join(f'<figure class="frame">{svg_}<figcaption>{cap}</figcaption></figure>' for svg_, cap in frames)
        opts += f'<section id="placing-{key}"><h3>({key}) {name}</h3><p>{pitch}</p><div class="row">{figs}</div></section>'

    def ideas(lst):
        return ''.join(f'<figure class="idea">{fn()}<figcaption><b>{i}. {name}.</b> {pitch} <b>Teaches:</b> {teach}. <b>Band:</b> {band} (proposed).</figcaption></figure>'
                       for i, (name, fn, pitch, teach, band) in enumerate(lst, 1))
    body = f'''
<h1>Hamster Highway: placing gadgets, and six ideas (sketches 2)</h1>
<p class="stamp">Sketches, not the finished look; original art (D-010). sketch_bridge_builder.py {VERSION} · built at {COMMIT} · draft, for Rob to choose from</p>
<p><b>Decided so far:</b> the Hamster Highway theme (D-133); built for the PC first, playable on a phone held sideways (D-134); the next game we make (D-135); the five first levels, with up to 10 in all after the trial (D-136).</p>
<h2>Placing gadgets: three ways</h2>
<p>All three on level 2, Step up, which needs a bridge over the gap and a ramp up the step. On the PC: drag a gadget from the tray, or click it and then click the square. On a phone: tap, then tap. Clicking or tapping a placed gadget sends it back to the tray.</p>
{opts}
<p><b>Claude's pick: (b), anywhere it fits</b> (my judgement). With a mouse, exact drops are easy; it asks more of the child than spots, yet still steers away from muddles. The first levels can stay simple by having only one or two squares that fit.</p>
<h2>With more freedom: three gadgets</h2>
<div class="row">{ideas(GADGET_IDEAS)}</div>
<p>Also thought of: a toy car that jumps off the end of a ramp, a desk fan that blows floaters sideways, and a teacup lift.</p>
<h2>…and three level ideas</h2>
<div class="row">{ideas(LEVEL_IDEAS)}</div>
'''
    css = ('h3 {{ font-size: 18px; margin: 22px 0 2px; }} figure.frame {{ flex: 1 1 280px; max-width: 380px; }} '
           'figure.idea {{ flex: 1 1 300px; max-width: 480px; }}').replace('{{', '{').replace('}}', '}')
    return 'Hamster Highway: placing gadgets, and six ideas (sketches 2)', body, css, 3 * 3 + len(GADGET_IDEAS) + len(LEVEL_IDEAS)


if SKETCHES == 2:
    check(fits(STEP, {}, 'bridge') == [(3, 6)], 'sketches 2: in option (b) the bridge fits only over the gap (3,6)')
    check((7, 5) in RAMP_FITS and (5, 2) not in RAMP_FITS, 'sketches 2: in option (b) the ramp fits by the step, not in mid-air')
    check(walk(STEP, {(3, 6): 'B', (7, 5): 'R'})[0] == 'home', 'sketches 2: level 2 is solved with the ramp by the step')
    check(walk(STEP, {(3, 6): 'B', (5, 2): 'R'})[0] == 'stuck', 'sketches 2: with the ramp in mid-air they get stuck at the step')
    check(walk(STEP, {})[0] != 'home', 'sketches 2: level 2 needs its gadgets')
TITLE, BODY, EXTRA_CSS, N_SVG = (page1 if SKETCHES == 1 else page2)()

html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<style>
@font-face {{ font-family: 'Fredoka'; font-weight: 700; src: url(data:font/woff2;base64,{font}) format('woff2'); }}
:root {{ --bg: #F7F5FF; --fg: #1B1446; --mut: #5d5880; --card: #fff; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #121027; --fg: #EDEBFF; --mut: #a9a5c9; --card: #1d1a3a; }} }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 22px; margin: 0 0 4px; }} h2 {{ font-size: 20px; margin: 30px 0 2px; }}
p, ul {{ margin: 0 0 10px; max-width: 70ch; }} ul {{ padding-left: 20px; }} .pitch {{ font-weight: 600; }}
.stamp {{ color: var(--mut); font-size: 13px; }}
.row {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; margin-top: 12px; }}
figure {{ margin: 0; background: var(--card); color: var(--fg); border-radius: 14px; padding: 8px; box-sizing: border-box; }}
figure svg {{ display: block; width: 100%; height: auto; border-radius: 10px; }}
figure.scene {{ max-width: 760px; }} figure.strip {{ flex: 1 1 340px; max-width: 560px; }} figure.strip.narrow {{ max-width: 460px; }}
figure.level {{ flex: 1 1 300px; max-width: 420px; }} figure.fit {{ max-width: 760px; }}
figcaption {{ font-size: 13px; color: var(--mut); margin-top: 6px; }}
dl {{ margin: 12px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 15px; max-width: 760px; }}
dt {{ font-weight: 700; }} dd {{ margin: 0; }}
{EXTRA_CSS}</style></head><body>{BODY}</body></html>'''
page = os.path.join(OUT, 'index.html')
with open(page, 'w', encoding='utf-8') as fh:
    fh.write(html)
print(page, len(html.encode()), 'bytes')

# ---------- the page check (headless Chromium, a stand-in for the phone and PC) ----------
from playwright.sync_api import sync_playwright  # noqa: E402

SHOTS = os.path.join(OUT, 'shots')
os.makedirs(SHOTS, exist_ok=True)
url = 'file://' + page
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, scheme in ((390, 844, 'light'), (844, 390, 'light'), (1280, 800, 'light'), (390, 844, 'dark'), (844, 390, 'dark'), (1280, 800, 'dark')):
        ctx = br.new_context(viewport={'width': w, 'height': h}, color_scheme=scheme, device_scale_factor=2 if w == 1280 and scheme == 'light' else 1)
        asked, errors = [], []
        ctx.route('**/*', lambda r: (asked.append(r.request.url), r.continue_() if r.request.url == url else r.abort()))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(url)
        pg.wait_for_timeout(300)
        tag = f'{w}x{h} {scheme}'
        others = [u for u in asked if u != url]
        sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        blank = pg.evaluate('[...document.querySelectorAll("svg")].filter((s) => { const r = s.getBoundingClientRect(); return !(r.width > 50 && r.height > 50); }).length')
        n = pg.evaluate('document.querySelectorAll("svg").length')
        fonted = pg.evaluate('document.fonts.check("700 32px Fredoka")')
        check(not errors, f'{tag}: no script errors {errors[:2]}')
        check(not others, f'{tag}: asks for nothing but itself {others[:2]}')
        check(not sideways, f'{tag}: no sideways scrolling')
        check(blank == 0 and n == N_SVG, f'{tag}: every drawing drawn ({n} of {N_SVG}, {blank} blank)')
        check(fonted, f'{tag}: the GO button\'s font is loaded from the page itself')
        pg.screenshot(path=os.path.join(SHOTS, f'page-{w}x{h}-{scheme}.png'), full_page=True)
        if w == 1280 and scheme == 'light':
            for j, el in enumerate(pg.query_selector_all('figure')):
                el.screenshot(path=os.path.join(SHOTS, f'fig-{j + 1:02d}.png'))
        ctx.close()
    br.close()
print(f'Pictures: {SHOTS}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
