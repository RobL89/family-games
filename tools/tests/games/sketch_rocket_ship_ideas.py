"""Sketches: six new ship ideas for Rocket Lander's hangar. Version 1.0.

Rob, 10 Nov (after step 2c-build): the last ships were too rocket-shaped; he wants unusual, funny,
original ships like the Cardboard Box and the Teapot, described in words and SVG sketches before
any are drawn in detail, so he can pick the best few (D-062: new ships when Rob asks).

Each idea is drawn three ways, as plain SVG, original art (D-010): flying, landing (its landing
joke, kept above the number line, ER-003) and standing at its size in play on a sideways phone
(58.5 px: scene.js's rocketH, min(15% of the height, 20% of the width), 56 to 128 px). Every
idea keeps today's ships' envelope (ships.js: as tall as the classic rocket, feet on the ground,
Bip near the middle), so play would not change (D-045, D-046). Bip is drawn as scene.js draws
him. Nothing in the game's files changes. A sketch, not the finished look.

Writes index.html into the folder given (default /mnt/user-data/outputs/ship-ideas/), then checks
the page in headless Chromium (a stand-in for the phone and PC): phone upright and sideways and
PC, light and dark, no script errors, nothing fetched, no sideways scrolling, every drawing drawn;
saves pictures of the page and of each drawing to the folder's shots/ for looking over.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_rocket_ship_ideas.py [out-folder]
Exits 1 if a check fails.
"""
import math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/outputs/ship-ideas'
os.makedirs(OUT, exist_ok=True)
VERSION = '1.0'
COMMIT = subprocess.check_output(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], text=True).strip()

# The game's colours (scene.js, ships.js)
INK, SUN, MINT, CORAL, PINK, SKY, LILAC = '#1B1446', '#FFC93C', '#5FE3BD', '#FF5D73', '#FF8FB1', '#8CF5FF', '#B9A7FF'
GOLD = ['#FFF6C7', '#FFD45E', '#F0A51C', '#FFE48A', '#C77A0C']
LW = 3.2  # ships.js lwOf(h) = h * 0.032, for a ship 100 units tall
PLAY_H = min(max(min(390 * 0.15, 844 * 0.2), 56), 128)  # a ship's height on a sideways phone, px
_uid = [0]


def uid(p):
    _uid[0] += 1
    return f'{p}{_uid[0]}'


def rnd(seed):
    s = [seed * 9301 + 49297]
    def r():
        s[0] = (s[0] * 9301 + 49297) % 233280
        return s[0] / 233280
    return r


def f(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


# ---------- drawing helpers (ship units: 100 tall, centre (0, 0), feet at y = 50) ----------

def path(d, fill, w=LW, stroke=INK, extra=''):
    st = f' stroke="{stroke}" stroke-width="{f(w)}"' if stroke else ''
    return f'<path d="{d}" fill="{fill}"{st} stroke-linejoin="round" stroke-linecap="round"{extra}/>'


def circle(x, y, r, fill, w=LW, stroke=INK, extra=''):
    st = f' stroke="{stroke}" stroke-width="{f(w)}"' if stroke else ''
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}"{st}{extra}/>'


def ellipse(x, y, rx, ry, fill, w=LW, stroke=INK, rot=0, extra=''):
    st = f' stroke="{stroke}" stroke-width="{f(w)}"' if stroke else ''
    tr = f' transform="rotate({f(rot)} {f(x)} {f(y)})"' if rot else ''
    return f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}"{st}{tr}{extra}/>'


def line(d, col, w, extra=''):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{f(w)}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'


def tube(d, col, w):
    """A thick line with an ink outline (a pipe, a stalk, a handle)."""
    return line(d, INK, w + LW * 1.4) + line(d, col, w)


def blob(circles, fill, w=LW * 0.8):
    """Circles merged into one shape with one outline (foam, cream, clouds)."""
    return (''.join(circle(x, y, r, INK, stroke=None) for x, y, r in circles)
            + ''.join(circle(x, y, r - w, fill, stroke=None) for x, y, r in circles))


def grad(stops, x2=0, y2=1):
    gid = uid('g')
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return gid, f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="{x2}" y2="{y2}">{st}</linearGradient></defs>'


def rgrad(stops, cx=0.35, cy=0.3, r=0.75):
    gid = uid('r')
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"' + (f' stop-opacity="{a}"' if a is not None else '') + '/>' for o, c, a in stops)
    return gid, f'<defs><radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{st}</radialGradient></defs>'


def bip(cx, cy, r, mood='', clip=None):
    """Bip's head as scene.js's drawPilotHead draws it: antenna and glowing bulb, mint head, pink
    ear bolts, the dark face screen with cyan eyes, a smile and pink cheeks."""
    lw = max(1.4, r * 0.12)
    gid, defs = rgrad([(0, '#B4FFE6', None), (0.6, MINT, None), (1, '#2FB892', None)])
    gl, gdefs = rgrad([(0, SUN, 0.75), (1, SUN, 0)], 0.5, 0.5, 0.5)
    s = [defs, gdefs]
    bx, by = cx + r * 0.22, cy - r * 1.55
    s.append(circle(bx, by, r * 0.6, f'url(#{gl})', stroke=None))
    s.append(line(f'M{f(cx)} {f(cy - r * 0.9)}Q{f(cx + r * 0.1)} {f(cy - r * 1.3)} {f(bx)} {f(cy - r * 1.5)}', INK, lw))
    s.append(circle(bx, by, r * 0.2, SUN, lw))
    s.append(circle(cx, cy, r, f'url(#{gid})', lw))
    for sg in (-1, 1):
        s.append(circle(cx + sg * r * 0.98, cy + r * 0.05, r * 0.16, PINK, lw))
    s.append(f'<rect x="{f(cx - r * 0.66)}" y="{f(cy - r * 0.42)}" width="{f(r * 1.32)}" height="{f(r * 0.86)}" '
             f'rx="{f(r * 0.38)}" fill="#1E2A5A" stroke="{INK}" stroke-width="{f(lw * 0.7)}"/>')
    ex, ey = r * 0.28, cy - r * 0.04
    for sg in (-1, 1):
        x = cx + sg * ex
        if mood == 'happy':
            s.append(line(f'M{f(x - r * 0.13)} {f(ey + r * 0.08)}A{f(r * 0.13)} {f(r * 0.13)} 0 0 1 {f(x + r * 0.13)} {f(ey + r * 0.08)}', SKY, r * 0.12))
        elif mood == 'oh':
            s.append(circle(x, ey, r * 0.13, SKY, stroke=None))
        else:
            s.append(f'<rect x="{f(x - r * 0.08)}" y="{f(ey - r * 0.13)}" width="{f(r * 0.16)}" height="{f(r * 0.26)}" rx="{f(r * 0.08)}" fill="{SKY}"/>')
    if mood == 'oh':
        s.append(circle(cx, cy + r * 0.24, r * 0.07, 'none', r * 0.09, SKY))
    else:
        a, b = math.pi * 0.2, math.pi * 0.8
        s.append(line(f'M{f(cx + r * 0.16 * math.cos(a))} {f(cy + r * 0.13 + r * 0.16 * math.sin(a))}A{f(r * 0.16)} {f(r * 0.16)} 0 0 1 '
                      f'{f(cx + r * 0.16 * math.cos(b))} {f(cy + r * 0.13 + r * 0.16 * math.sin(b))}', SKY, r * 0.09))
    for sg in (-1, 1):
        s.append(ellipse(cx + sg * r * 0.5, cy + r * 0.58, r * 0.13, r * 0.08, PINK, stroke=None, extra=' opacity=".85"'))
    g = ''.join(s)
    return f'<g clip-path="url(#{clip})">{g}</g>' if clip else g


def hand(x, y, r=2.6):
    return circle(x, y, r, MINT, LW * 0.5)


def bang(x, y, word, size=17, rot=0, fill=SUN):
    return (f'<text x="{f(x)}" y="{f(y)}" font-size="{size}" font-weight="900" text-anchor="middle" fill="{fill}" stroke="{INK}" '
            f'stroke-width="{f(size * 0.24)}" paint-order="stroke" stroke-linejoin="round" font-family="system-ui, sans-serif" '
            f'transform="rotate({rot} {f(x)} {f(y)})">{word}</text>')


def sparkle(x, y, r, col='#FFFFFF', op=0.9):
    d = (f'M{f(x)} {f(y - r)}Q{f(x + r * 0.18)} {f(y - r * 0.18)} {f(x + r)} {f(y)}Q{f(x + r * 0.18)} {f(y + r * 0.18)} {f(x)} {f(y + r)}'
         f'Q{f(x - r * 0.18)} {f(y + r * 0.18)} {f(x - r)} {f(y)}Q{f(x - r * 0.18)} {f(y - r * 0.18)} {f(x)} {f(y - r)}Z')
    return path(d, col, stroke=None, extra=f' opacity="{op}"')


def motion(d, op=0.75, w=2.2, dash=''):
    da = f' stroke-dasharray="{dash}"' if dash else ''
    return line(d, '#FFFFFF', w, f' opacity="{op}"{da}')


# ---------- the six ideas ----------

def toaster(mode):
    s = []
    if mode == 'fly':
        gid, defs = rgrad([(0, '#FFB347', 0.95), (1, '#FF7A3D', 0)], 0.5, 0.5, 0.5)
        s.append(defs + ellipse(0, 44, 30, 16, f'url(#{gid})', stroke=None))
        for x, y, a in ((-10, 54, 20), (7, 61, -15), (-3, 70, 40), (12, 77, 10), (-14, 83, -30), (3, 91, 25)):
            s.append(f'<rect x="{f(x - 2.4)}" y="{f(y - 2)}" width="4.8" height="4" rx="1.2" fill="#D9963F" stroke="{INK}" '
                     f'stroke-width="1" transform="rotate({a} {x} {y})"/>')
    # spring legs with rubber feet
    for x in (-24, 24):
        s.append(tube(f'M{x} 31l5 2.4l-10 2.8l10 2.8l-10 2.8l10 2.8l-5 2.4', '#D6DCEC', 2.2))
        s.append(ellipse(x, 48.2, 6.2, 2.6, '#3A3560', LW * 0.5))
    # the toast in the right slot and Bip in the left one, behind the body
    toast = lambda dx, dy, rot: (f'<g transform="translate({dx} {dy}) rotate({rot})">'
                                 + path('M-11 14V-6Q-11 -14 -5 -14Q0 -18 5 -14Q11 -14 11 -6V14Z', '#D98B3A')
                                 + path('M-7.5 14V-5Q-7.5 -10.5 -3.5 -10.5Q0 -13.5 3.5 -10.5Q7.5 -10.5 7.5 -5V14Z', '#FFD58A', stroke=None)
                                 + '</g>')
    if mode == 'land':
        s.append(toast(30, -70, 38))
        s.append(motion('M14 -40Q22 -62 38 -58', 0.8, 2, '3 4'))
        s.append(tube('M-17 -24L-17 -12', MINT, 9))  # Bip's body, popped up
        s.append(tube('M-21 -28L-30 -44', MINT, 3) + tube('M-13 -28L-4 -44', MINT, 3))
        s.append(hand(-30.5, -45) + hand(-3.5, -45))
        s.append(bip(-17, -42, 10, 'happy'))
        for a in (200, 235, 305, 340):
            ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
            s.append(motion(f'M{f(-17 + ca * 17)} {f(-44 + sa * 17)}L{f(-17 + ca * 23)} {f(-44 + sa * 23)}', 0.9, 2))
    else:
        s.append(toast(17, -22, 0))
        s.append(bip(-17, -23, 10))
    gid, defs = grad([(0, '#C4E1FF'), (1, '#7FB0F2')])
    s.append(defs + f'<rect x="-42" y="-14" width="84" height="46" rx="14" fill="url(#{gid})" stroke="{INK}" stroke-width="{LW}"/>')
    s.append(f'<rect x="-42" y="7" width="84" height="8" fill="#EEF1FA" stroke="{INK}" stroke-width="{f(LW * 0.6)}"/>')
    s.append(line('M-34 -8H-12', '#FFFFFF', 3, ' opacity=".75"'))
    for x0 in (-31, 5):  # the slots
        s.append(f'<rect x="{x0}" y="-13.5" width="26" height="4" rx="2" fill="{INK}"/>')
    if mode != 'land':
        s.append(hand(-27, -14) + hand(-7, -14))
    # the dial (dots, no numbers: the game is about numbers) and a star badge
    s.append(circle(-27, -1, 5.5, '#FFFFFF', LW * 0.6))
    s.append(line('M-27 -1L-24 -4', INK, 1.6))
    for a in range(200, 341, 35):
        s.append(circle(-27 + 8 * math.cos(math.radians(a)), -1 + 8 * math.sin(math.radians(a)), 0.9, INK, stroke=None))
    s.append(path('M14 -6l1.8 3.7 4.1.5-3 2.8.8 4L14 3l-3.7 2 .8-4-3-2.8 4.1-.5z', SUN, LW * 0.45))
    # the lever on the side
    s.append(f'<rect x="41" y="-1" width="6" height="4" fill="#9FA6BF" stroke="{INK}" stroke-width="{f(LW * 0.5)}"/>')
    s.append(circle(49.5, 1, 4.6, CORAL, LW * 0.6) + circle(48.2, -0.4, 1.2, '#FFFFFF', stroke=None))
    if mode == 'land':
        s.append(bang(40, -24, 'DING!', 15, 14))
        for x, y, a in ((-36, -30, 30), (34, 2, -20), (-46, -8, 60), (44, -42, 15), (24, -46, -35)):
            s.append(f'<rect x="{f(x - 2)}" y="{f(y - 1.7)}" width="4" height="3.4" rx="1" fill="#D9963F" stroke="{INK}" '
                     f'stroke-width="0.9" transform="rotate({a} {x} {y})"/>')
    return ''.join(s)


def tub(mode):
    s = []
    if mode == 'fly':
        s.append(path('M-5 31Q0 40 5 31Z', SKY, LW * 0.5))
        for x, y, r in ((0, 41, 5), (-5, 50, 4.2), (4, 58, 3.6), (-3, 66, 3), (3, 73, 2.5), (-1, 80, 2)):
            s.append(circle(x, y, r, '#DDF7FF', 1.3) + circle(x - r * 0.35, y - r * 0.35, r * 0.25, '#FFFFFF', stroke=None))
    if mode == 'land':
        # SPLOSH: water over both ends (behind the tub), the duck shooting up, a bubble beard
        crown = 'M-38 -10Q-50 -14 -60 -28Q-52 -24 -50 -26Q-54 -36 -50 -46Q-46 -34 -43 -30Q-42 -40 -36 -46Q-37 -30 -34 -12Z'
        for sg in (-1, 1):
            s.append(f'<g transform="scale({sg} 1)">' + path(crown, SKY, LW * 0.7)
                     + line('M-41 -14Q-46 -22 -48 -30', '#FFFFFF', 1.8, ' opacity=".8"') + '</g>')
        for x, y, r in ((-63, -34, 2.4), (-55, -52, 2.2), (-40, -53, 1.8), (63, -34, 2.4), (55, -52, 2.2), (40, -53, 1.8)):
            s.append(ellipse(x, y, r * 0.8, r * 1.2, SKY, 1, rot=-20 if x < 0 else 20))
    for x in (-30, 30):  # gold claw feet
        s.append(path(f'M{x - 6} 24Q{x - 9} 36 {x - 3.5} 44L{x + 3.5} 44Q{x + 1} 36 {x + 6} 24Z', GOLD[1], LW * 0.9))
        s.append(circle(x - 4.6, 48, 2.6, GOLD[1], LW * 0.6) + circle(x + 4.6, 48, 2.6, GOLD[1], LW * 0.6) + circle(x, 46.4, 4.3, GOLD[2], LW * 0.7))
    # the shower on its curly pipe, behind the tub
    s.append(tube('M-41 -6V-33Q-41 -43 -31 -43', '#D6DCEC', 3.4))
    s.append(path('M-33 -47L-21 -47Q-20 -40 -27 -39Q-34 -40 -33 -47Z', '#E8ECF7', LW * 0.7))
    if mode != 'land':
        for x, y in ((-30, -33), (-25, -31), (-28, -27)):
            s.append(ellipse(x, y, 1.4, 2.4, SKY, 0.8))
    foam = [(-38, -12, 7), (-30, -17, 8), (-20, -14, 7), (-10, -18, 7), (0, -14, 7), (10, -18, 8), (20, -15, 7), (30, -18, 8), (39, -12, 6)]
    s.append(blob(foam, '#FFFFFF'))
    if mode == 'land':
        s.append(bip(-12, -27, 10.5, 'happy'))
        s.append(blob([(-17, -18, 4.2), (-12, -16.5, 4.6), (-7, -18, 4.2)], '#FFFFFF', 1.6))
        s.append(f'<g transform="translate(44 -64) rotate(-25)">{duck(0, 0)}</g>' + motion('M26 -26Q30 -48 40 -54', 0.8, 2, '3 4'))
        s.append(bang(-8, -58, 'SPLOSH!', 15, -8))
    else:
        s.append(bip(-12, -27, 10.5))
        s.append(blob([(-18, -16, 4.6), (-12, -15, 5), (-6, -16, 4.6)], '#FFFFFF', 1.6))
        s.append(duck(24, -21))
        for x, y, r in ((-4, -40, 2.4), (14, -38, 3), (36, -33, 2)):
            s.append(circle(x, y, r, '#FFFFFF', 1.1))
    s.append(f'<rect x="-48" y="-10" width="96" height="8" rx="4" fill="#FFFFFF" stroke="{INK}" stroke-width="{LW}"/>')
    gid, defs = grad([(0, '#FFD6E4'), (1, '#FF97BA')])
    s.append(defs + path('M-45 -2Q-46 26 -22 30H22Q46 26 45 -2Z', f'url(#{gid})'))
    s.append(line('M-36 6Q-34 18 -22 22', '#FFFFFF', 2.6, ' opacity=".7"'))
    return ''.join(s)


def duck(x, y):
    return (ellipse(x, y + 1, 9, 6.5, GOLD[1], LW * 0.7) + circle(x + 5, y - 7.5, 5.2, GOLD[1], LW * 0.7)
            + ellipse(x + 10.4, y - 6.8, 3.4, 1.9, '#FF9F43', LW * 0.5) + circle(x + 6.4, y - 8.6, 1.1, INK, stroke=None)
            + line(f'M{x - 4} {y}Q{x} {y + 3.6} {x + 3} {y}', INK, 1.2))


def snail(mode):
    s = []
    if mode == 'fly':
        for i, col in enumerate(('#FF8FB1', SUN, MINT, SKY)):
            dy = i * 3.6
            s.append(line(f'M-44 {41 + dy}C-62 {38 + dy} -78 {26 + dy} -104 {18 + dy}', col, 3.6, ' opacity=".9"'))
        for x, y, r in ((-70, 20, 3.2), (-92, 12, 2.6), (-58, 46, 2.2), (-84, 34, 2.4)):
            s.append(sparkle(x, y, r))
        for x, y in ((-52, 2), (-60, 12), (-50, 22)):
            s.append(motion(f'M{x} {y}h-14', 0.7, 2.2))
        for x, y, r in ((-24, -44, 4.2), (-31, -50, 5.2), (-41, -55, 6.2)):
            s.append(circle(x, y, r, '#FFFFFF', 1.1, extra=' opacity=".9"'))
    # eye stalks and eyes
    tips = ((27, -48), (53, -50)) if mode == 'land' else ((31, -32), (49, -34))
    for (bx, by), (tx, ty) in zip(((38, -5), (45, -5)), tips):
        s.append(tube(f'M{bx} {by}Q{(bx + tx) / 2 + (2 if tx > bx else -2)} {(by + ty) / 2} {tx} {ty}', '#D7CCFF', 4.2))
    for tx, ty in tips:
        s.append(circle(tx, ty, 5.8, '#FFFFFF', LW * 0.8) + circle(tx + 1.6, ty + 0.4, 2.6, INK, stroke=None) + circle(tx + 0.6, ty - 1, 0.9, '#FFFFFF', stroke=None))
    if mode == 'land':
        for tx, ty in tips:
            s.append(motion(f'M{tx - 10} {ty + 2}q-3 -4 0 -8', 0.9, 2) + motion(f'M{tx + 10} {ty + 2}q3 -4 0 -8', 0.9, 2))
    gid, defs = grad([(0, '#E3DAFF'), (1, '#B4A2F5')])
    s.append(defs + path('M-48 47Q-46 38 -34 38L24 38Q31 38 32 30L33 2Q34 -8 42 -8Q50 -8 50 2L50 40Q50 50 40 50L-38 50Q-48 50 -48 47Z', f'url(#{gid})'))
    s.append(line('M40 13Q45 18 49 13', INK, LW * 0.7) + ellipse(39.5, 18.5, 3, 2, PINK, stroke=None))
    # chimney, then the shell over its foot
    s.append(f'<rect x="-25" y="-35" width="9" height="16" fill="#C9563C" stroke="{INK}" stroke-width="{f(LW * 0.8)}"/>')
    s.append(f'<rect x="-27" y="-38" width="13" height="4.5" rx="1.5" fill="#A8432E" stroke="{INK}" stroke-width="{f(LW * 0.7)}"/>')
    gid, defs = rgrad([(0, '#FFD2A1', None), (1, '#FF8455', None)], 0.4, 0.35, 0.8)
    s.append(defs + circle(-8, 6, 30, f'url(#{gid})'))
    s.append(line('M16 6A24 24 0 0 0 -8 -18A21 21 0 0 0 -29 3A18 18 0 0 0 -11 21A14 14 0 0 0 4 9', '#E2643A', 3.4))
    cid = uid('c')
    s.append(f'<defs><clipPath id="{cid}"><circle cx="-8" cy="4" r="9.6"/></clipPath></defs>')
    s.append(circle(-8, 4, 12.6, GOLD[1], LW * 0.9) + circle(-8, 4, 9.6, '#7FDBFF', LW * 0.6))
    s.append(bip(-8, 7, 7.2, 'happy' if mode == 'land' else '', cid))
    s.append(circle(-11.5, 0.5, 2.2, '#FFFFFF', stroke=None, extra=' opacity=".6"'))
    if mode == 'land':
        s.append(path('M-21 -44c-2.6-3.4-8.6-1.2-6 3.4l6 5.4 6-5.4c2.6-4.6-3.4-6.8-6-3.4z', PINK, LW * 0.6))
        s.append(bang(-30, -58, 'SCHLUP!', 14, -10))
        for x, y in ((-44, 40), (-30, 34), (40, -10)):
            s.append(sparkle(x, y, 3.6, '#FFFFFF'))
    return ''.join(s)


def hopper(mode):
    s, squash = [], mode == 'land'
    if mode == 'fly':
        s.append(blob([(-9, 55, 6), (0, 52, 7.4), (9, 55, 6)], '#FFFFFF', 1.8))
        s.append(blob([(-20, 70, 4), (-14, 68, 5), (-8, 70, 4)], '#FFFFFF', 1.4).replace('<circle', '<circle opacity=".8"'))
        s.append(motion('M-32 57Q0 76 32 57', 0.7, 2.2, '4 5'))
        s.append(sparkle(24, 70, 3.4) + sparkle(-30, 46, 2.6))
    rider = '<g transform="translate(0 10)">' if squash else '<g>'
    rider += tube('M-9 -14Q-24 -26 -15 -41', '#C9A2FF', 6) + tube('M9 -14Q24 -26 15 -41', '#C9A2FF', 6)
    rider += tube('M0 -24L0 -15', MINT, 10)
    rider += tube('M-5 -22L-14 -38', MINT, 3) + tube('M5 -22L14 -38', MINT, 3)
    rider += bip(0, -31, 10, 'happy' if squash else '')
    rider += hand(-14.6, -39.5) + hand(14.6, -39.5)
    if squash:
        rider += motion('M8 -54q4 -3 2 -7', 0.9, 2) + motion('M14 -52q5 -2 4 -7', 0.9, 2)
    rider += '</g>'
    gid, defs = rgrad([(0, '#D8B6FF', None), (0.55, '#A774FF', None), (1, '#6A3FD6', None)], 0.35, 0.3, 0.8)
    ball = defs + circle(0, 16, 33.5, f'url(#{gid})')
    ball += ellipse(-14, 1, 9, 5.6, '#FFFFFF', stroke=None, rot=-30, extra=' opacity=".55"')
    for sg in (-1, 1):
        if squash:
            ball += line(f'M{sg * 11 - 5} 12A5 5 0 0 1 {sg * 11 + 5} 12', INK, 2.6)
        else:
            ball += ellipse(sg * 11, 12, 6, 7.5, '#FFFFFF', LW * 0.7) + circle(sg * 11 + 1, 9.3, 3, INK, stroke=None) + circle(sg * 11 + 2, 8.2, 1, '#FFFFFF', stroke=None)
        ball += ellipse(sg * 22, 24, 4.4, 3, PINK, stroke=None, extra=' opacity=".85"')
    ball += path('M-15 23Q0 40 15 23Q0 29 -15 23Z' if not squash else 'M-18 22Q0 44 18 22Q0 29 -18 22Z', '#7A1F45', LW * 0.7)
    ball += path('M-6 30.5Q0 36 6 30.5Q0 28.5 -6 30.5Z', PINK, stroke=None)
    if squash:
        s.append(f'<g transform="translate(0 50) scale(1.16 0.84) translate(0 -50)">{ball}</g>' + rider)
        for sg in (-1, 1):
            for k, (y0, y1) in enumerate(((-6, 16), (0, 26), (8, 34))):
                s.append(motion(f'M{sg * (46 + 7 * k)} {y0}V{y1}', 0.9 - 0.2 * k, 2.4))
        s.append(motion('M-30 -28Q-40 -46 -30 -60', 0.8, 2, '3 4') + path('M-30 -60l-4.6 3.6 6 .8z', '#FFFFFF', stroke=None, extra=' opacity=".8"'))
        s.append(blob([(-32, 43, 3.6), (-38, 42, 2.8)], '#FFFFFF', 1.2) + blob([(32, 43, 3.6), (38, 42, 2.8)], '#FFFFFF', 1.2))
        s.append(bang(36, -40, 'BOING!', 15, 10))
    else:
        s.append(ball + rider)
    return ''.join(s)


def sunflower(mode):
    s = []
    if mode == 'fly':
        for x, y, a in ((-16, 58, 30), (10, 66, -40), (-4, 78, 70)):
            s.append(ellipse(x, y, 2.4, 5, SUN, 1, rot=a))
        s.append(sparkle(18, 56, 2.6, SUN) + sparkle(-24, 72, 2.2, SUN))
    for x in (-15, 0, 15):  # three little feet
        s.append(path(f'M{x - 3.5} 44L{x - 2.5} 50H{x + 2.5}L{x + 3.5} 44Z', '#B85433', LW * 0.7))
    s.append(f'<rect x="-26" y="38.5" width="52" height="6.5" rx="3" fill="#C9643E" stroke="{INK}" stroke-width="{LW}"/>')
    s.append(tube('M6 6Q9 -12 0 -30', '#3FBF6A', 4.2))
    s.append(path('M6 -10Q18 -21 25 -12Q16 -5 6 -10Z', '#5FD47C', LW * 0.7) + line('M8 -10.5Q16 -13 22 -12.5', '#2E9C55', 1.2))
    s.append(path('M4 -19Q-9 -28 -16 -19Q-8 -12 4 -19Z', '#5FD47C', LW * 0.7) + line('M2 -19Q-6 -21 -13 -19.5', '#2E9C55', 1.2))
    fx, fy, tilt = (5, -27, 28) if mode == 'land' else (0, -31, 0)
    head = []
    if mode == 'fly':
        head.append(circle(0, 0, 19.5, SUN, stroke=None, extra=' opacity=".28"'))
    for i in range(12):
        head.append(ellipse(0, -11.5, 3.6, 7, SUN, LW * 0.55, extra=f' transform="rotate({i * 30 + 12} 0 0)"'))
    head.append(circle(0, 0, 9, '#7A4A2A', LW * 0.75))
    for x, y in ((-3, -3), (3, -3), (0, 0), (-3, 3), (3, 3), (-5.5, 0), (5.5, 0), (0, -5.5), (0, 5.5)):
        head.append(circle(x, y, 1.1, '#4E2C14', stroke=None))
    s.append(f'<g transform="translate({fx} {fy}) rotate({tilt})">{"".join(head)}</g>')
    if mode == 'fly':
        s.append(motion('M-25 -44A26 26 0 0 1 -8 -56', 0.85, 2.4) + path('M-8 -56l-5.5 -2.6 1.4 5.6z', '#FFFFFF', stroke=None, extra=' opacity=".85"'))
        s.append(motion('M25 -18A26 26 0 0 1 8 -6', 0.85, 2.4) + path('M8 -6l5.5 2.6 -1.4 -5.6z', '#FFFFFF', stroke=None, extra=' opacity=".85"'))
    s.append(bip(-11, -6, 10, 'happy' if mode == 'land' else ''))
    gid, defs = grad([(0, '#F59466'), (1, '#C25E36')])
    s.append(defs + path('M-23 8L-17 39H17L23 8Z', f'url(#{gid})'))
    s.append(f'<rect x="-27" y="-1" width="54" height="10" rx="3" fill="#F49A6E" stroke="{INK}" stroke-width="{LW}"/>')
    for a in range(0, 360, 72):  # a daisy painted on the pot
        s.append(ellipse(0, 19, 1.8, 3.6, '#FFFFFF', stroke=None, extra=f' transform="rotate({a} 0 23.5)"'))
    s.append(circle(0, 23.5, 1.9, SUN, stroke=None))
    s.append(hand(-18, 0) + hand(-4, 0))
    if mode == 'land':
        s.append(motion('M-38 -20C-48 -48 -6 -64 14 -48S36 -38 26 -54', 0.8, 1.6, '3 4'))
        s.append(f'<g transform="translate(28 -57) rotate(-15)">'
                 + ellipse(-2, -4.5, 3.4, 2.4, '#FFFFFF', 0.9, extra=' opacity=".9"') + ellipse(3, -4.5, 3.4, 2.4, '#FFFFFF', 0.9, extra=' opacity=".9"')
                 + ellipse(0, 0, 5.6, 4, SUN, 1.2) + line('M-1.5 -3.6V3.6M2 -3.4V3.4', INK, 1.4) + circle(4.2, -0.8, 0.8, INK, stroke=None) + '</g>')
        s.append(bang(-30, -60, 'BZZZ!', 13, -8))
        s.append(ellipse(-34, 30, 2.4, 5, SUN, 1, rot=50) + ellipse(34, 20, 2.4, 5, SUN, 1, rot=-30))
    return ''.join(s)


def jelly(mode):
    s = []
    if mode == 'fly':
        cols = (SUN, MINT, '#4F7BEA', PINK, '#9B5DE5', CORAL)
        r = rnd(7)
        for i in range(14):
            x, y, a = -22 + r() * 44, 54 + r() * 34, r() * 180
            s.append(f'<rect x="{f(x - 2.4)}" y="{f(y - 0.9)}" width="4.8" height="1.8" rx="0.9" fill="{cols[i % 6]}" transform="rotate({f(a)} {f(x)} {f(y)})"/>')
        for sg in (-1, 1):
            s.append(motion(f'M{sg * 38} -10Q{sg * 44} 0 {sg * 38} 10', 0.7, 2.2) + motion(f'M{sg * 45} -15Q{sg * 53} 0 {sg * 45} 15', 0.5, 2.2))
    # the cake stand and its plate
    s.append(path('M-17 50Q-17 44 -6 43L-4 35H4L6 43Q17 44 17 50Z', '#FFFFFF') + line('M-13 47.2H13', '#4F7BEA', 1.6))
    s.append(ellipse(0, 32, 40, 5, '#FFFFFF') + ellipse(0, 31.4, 32, 2.8, 'none', 1.4, '#4F7BEA'))
    J = 'M-34 28L-28 6Q-28 1 -23 1L-20 -20Q-19 -27 -12 -27H12Q19 -27 20 -20L23 1Q28 1 28 6L34 28Z'
    body = [path(J, '#FFC2CD', stroke=None)]
    body.append(bip(0, 9, 10.5, 'happy' if mode == 'land' else ''))
    for x, y, r in ((-15, -8, 2.2), (15, 16, 1.8), (-9, 22, 1.5), (13, -14, 1.4)):
        body.append(circle(x, y, r, '#FFFFFF', stroke=None, extra=' opacity=".8"'))
    body.append(path(J, '#FF3B5C', extra=' fill-opacity=".24"'))
    for d in ('M-24 5L-28.5 27', 'M24 5L28.5 27', 'M-13.5 -26L-16.5 0', 'M13.5 -26L16.5 0'):
        body.append(line(d, '#D8243F', 1.6, ' opacity=".55"'))
    body.append(line('M-28 4.5Q0 8.5 28 4.5', '#FFFFFF', 2, ' opacity=".55"'))
    body.append(line('M-16 -20Q-18 -9 -19.5 -1', '#FFFFFF', 3, ' opacity=".8"') + line('M-26 9Q-28 16 -29.5 22', '#FFFFFF', 2.4, ' opacity=".7"'))
    body.append(blob([(-11, -28, 6), (-3, -31, 7), (5, -29.5, 6.5), (11.5, -27.5, 5)], '#FFFDF7'))
    if mode == 'land':
        s.append(f'<g transform="translate(0 28) skewX(-9) scale(1.12 0.86) translate(0 -28)">{"".join(body)}</g>')
        for sg in (-1, 1):
            for k, op in ((0, 0.9), (7, 0.6)):
                s.append(motion(f'M{sg * (40 + k)} -6Q{sg * (47 + k)} 6 {sg * (40 + k)} 18', op, 2.4))
        cx, cy = 4, -70
        s.append(motion('M2 -36Q-2 -52 2 -60', 0.85, 2, '3 4'))
        s.append(bang(-46, -40, 'WIBBLE', 13, -12) + bang(48, -32, 'WOBBLE!', 13, 10))
    else:
        s.append(''.join(body))
        cx, cy = 2, -38
    gl, gdefs = rgrad([(0, '#FF8FA0', 0.7), (1, '#FF8FA0', 0)], 0.5, 0.5, 0.5)
    s.append(gdefs + circle(cx, cy, 11, f'url(#{gl})', stroke=None))
    s.append(tube(f'M{cx + 1} {cy - 5}Q{cx + 3} {cy - 12} {cx + 8} {cy - 13}', '#5A8F2E', 1.8))
    gid, defs = rgrad([(0, '#FF8A9C', None), (1, '#D2183A', None)], 0.35, 0.3, 0.8)
    s.append(defs + circle(cx, cy, 6, f'url(#{gid})', LW * 0.8) + circle(cx - 2, cy - 2, 1.6, '#FFFFFF', stroke=None))
    return ''.join(s)


def classic():
    """The classic rocket today, for scale (sketch_rocket_map.py's crude rocket, centred)."""
    return ('<g transform="translate(0 50) scale(2.08)">'
            '<path d="M-12 -6L-20 2L-12 0Z M12 -6L20 2L12 0Z" fill="#FF6B6B" stroke="#1B1446" stroke-width="2.5" stroke-linejoin="round"/>'
            '<path d="M0 -46Q14 -30 12 0H-12Q-14 -30 0 -46Z" fill="#F2F4FF" stroke="#1B1446" stroke-width="3" stroke-linejoin="round"/>'
            '<path d="M0 -46Q7 -40 9 -33H-9Q-7 -40 0 -46Z" fill="#FF6B6B" stroke="#1B1446" stroke-width="2.5"/>'
            '<circle cx="0" cy="-20" r="6" fill="#8CF5FF" stroke="#1B1446" stroke-width="2.5"/></g>')


# ---------- panels ----------

def space(w, h, seed):
    gid, defs = grad([(0, '#100B31'), (1, '#2D2275')])
    r = rnd(seed)
    st = ''.join(circle(r() * w, r() * h, 0.6 + r() * 1.3, '#FFFFFF', stroke=None, extra=f' opacity="{0.3 + r() * 0.6:.2f}"') for _ in range(46))
    sp = ''.join(sparkle(r() * w, r() * h * 0.8, 3 + r() * 3, '#FFFFFF', 0.8) for _ in range(4))
    planet = circle(w * 0.86, h * 0.18, h * 0.09, '#5B4FC9', stroke=None, extra=' opacity=".55"')
    return f'{defs}<rect width="{w}" height="{h}" fill="url(#{gid})"/>{planet}{st}{sp}'


def ground(w, h, top, tx, gap=64):
    """The moon's ground with the number line along its top, and the target the ship landed on."""
    g = f'<rect x="0" y="{top}" width="{w}" height="{h - top}" fill="#CBCEDC"/>'
    g += f'<rect x="0" y="{top}" width="{w}" height="5" fill="#F1F2F8"/>'
    g += ellipse(tx, top + 2, 34, 6, SUN, stroke=None, extra=' opacity=".55"')
    for k in range(-3, 4):
        x = tx + k * gap
        if 8 < x < w - 8:
            g += line(f'M{x} {top}v9', INK, 2.4)
            n = 5 + k
            g += (f'<text x="{x}" y="{top + 30}" font-size="18" font-weight="800" text-anchor="middle" fill="{SUN if k == 0 else "#FFFFFF"}" '
                  f'stroke="{INK}" stroke-width="4.5" paint-order="stroke" font-family="system-ui, sans-serif">{n}</text>')
    return g


def ship_at(fn, mode, x, y, s, rot=0):
    return f'<g transform="translate({f(x)} {f(y)}) rotate({rot}) scale({f(s)})">{fn(mode)}</g>'


def svg(w, h, body, width=None, label=''):
    size = f' width="{width}" height="{f(h * width / w)}"' if width else ''
    return (f'<svg viewBox="0 0 {w} {h}"{size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}" '
            f'font-family="system-ui, sans-serif">{body}</svg>')


def fly_panel(fn, seed, name):
    w, h = 360, 300
    return svg(w, h, space(w, h, seed) + ship_at(fn, 'fly', 192, 128, 1.95, -8), label=f'{name}, flying')


def land_panel(fn, seed, name):
    w, h, top = 360, 300, 236
    return svg(w, h, space(w, h, seed + 50) + ground(w, h, top, 196) + ship_at(fn, 'land', 196, top - 50 * 1.62, 1.62), label=f'{name}, landing')


def tile(fn, name, seed):
    w, h, top = 112, 104, 78
    s = PLAY_H / 100
    body = space(w, h, seed + 90) + f'<rect x="0" y="{top}" width="{w}" height="{h - top}" fill="#CBCEDC"/><rect x="0" y="{top}" width="{w}" height="3" fill="#F1F2F8"/>'
    body += f'<g transform="translate(56 {f(top - 50 * s)}) scale({f(s)})">{fn("stand") if fn is not classic else classic()}</g>'
    body += f'<text x="56" y="{h - 7}" font-size="11" font-weight="700" text-anchor="middle" fill="{INK}" font-family="system-ui, sans-serif">{name}</text>'
    return f'<figure class="tile">{svg(w, h, body, width=w, label=f"{name} at its size in play")}</figure>'


IDEAS = [
    (toaster, 'Pop-Up Toaster', 'A retro toaster that flies. Bip rides in one slot, like a slice of toast.', [
        ('Looks', 'A rounded sky-blue toaster with a chrome stripe, a dial (dots, no numbers) and a red lever. Toast in one slot, Bip in the other.'),
        ('Flies on', 'A warm glow underneath, dropping toast crumbs.'),
        ('Stands on', 'Two springy coils with rubber feet.'),
        ('Landing joke', '<b>DING!</b> The toast flips up into the air and Bip pops out of the slot, arms up, then drops back in.'),
        ('Sound', 'A spring sproing, then a toaster ding.'),
        ('Watch', 'Bip rides a little higher than the usual window, so Bip\'s moment needs a look when it\'s drawn in detail.')]),
    (tub, 'Splash Tub', 'A pink bath full of bubbles, flying through space.', [
        ('Looks', 'A pink bath with gold claw feet, bubbles piled over the top, a shower on a curly pipe and a rubber duck. Bip pokes out of the bubbles.'),
        ('Flies on', 'A stream of bubbles from the plughole.'),
        ('Stands on', 'Its four gold claw feet.'),
        ('Landing joke', '<b>SPLOSH!</b> Water sloshes over both ends, the duck shoots up, and Bip is left with a bubble beard.'),
        ('Sound', 'A splosh and a squeaky duck.'),
        ('Watch', 'The splash and the bubbles stay above the number line, and the foam never hides Bip.')]),
    (jelly, 'Wobble Jelly', 'A strawberry jelly on a cake stand. Bip floats inside it, like fruit in a jelly.', [
        ('Looks', 'A red castle-shaped jelly with whipped cream and a glowing cherry on top, on a china cake stand.'),
        ('Flies on', 'Wobbles, sprinkling hundreds and thousands behind it.'),
        ('Stands on', 'The cake stand.'),
        ('Landing joke', '<b>WIBBLE WOBBLE!</b> It squashes and wobbles from side to side, and the cherry jumps off and lands back on top.'),
        ('Sound', 'A wobbly boing and a plop.'),
        ('Watch', 'The jelly is see-through, so Bip must stay easy to see inside it.')]),
    (hopper, 'Bouncy Hopper', 'A big purple bouncy ball with a grin. Bip rides on top, holding its handles.', [
        ('Looks', 'A shiny purple ball with two horn handles and a cheeky face that looks up at Bip.'),
        ('Flies on', 'Little cloud puffs it bounces off, as if hopping across space.'),
        ('Stands on', 'The ball itself.'),
        ('Landing joke', '<b>BOING!</b> It bounces three times on the spot, each one smaller, then squashes down with a huge grin.'),
        ('Sound', 'A rising boing-oing-oing.'),
        ('Watch', 'Bip rides on top, higher than the usual window; the bounces stay on the target and above the line.')]),
    (snail, 'Speedy Snail', 'A snail that is really, really fast. Its shell is a cosy cottage with a chimney.', [
        ('Looks', 'A lilac snail with eyes on stalks, and an orange spiral shell with a round window (Bip inside) and a little chimney.'),
        ('Flies on', 'A glittery rainbow slime trail, with puffs of smoke from the chimney like a steam train.'),
        ('Stands on', 'Its own squishy foot: no legs.'),
        ('Landing joke', '<b>SCHLUP!</b> Its eye stalks boing out extra long and wobble, and the chimney puffs out a heart.'),
        ('Sound', 'A squelchy schlup and a boing-oing.'),
        ('Watch', 'The slime trail is only drawn in the air, never on the number line.')]),
    (sunflower, 'Sunflower Copter', 'A flower pot that flies like a helicopter: the sunflower is the propeller.', [
        ('Looks', 'A terracotta pot on its saucer, a sunflower on a tall stem, and Bip peeping over the rim.'),
        ('Flies on', 'The sunflower spinning round and round, shedding the odd petal.'),
        ('Stands on', 'The pot\'s saucer, on three little feet.'),
        ('Landing joke', 'The flower slows down and nods, and a bee buzzes a loop round Bip.'),
        ('Sound', 'A whirr winding down, then bzzz.'),
        ('Watch', 'The sunflower has no face, so it stays our own and not like another game\'s.')]),
]
ALSO = [
    ('Spin Cycle', 'a washing machine; Bip spins round with the socks behind the round door.'),
    ('Watermelon Boat', 'a slice of watermelon, its seeds as windows.'),
    ('Snow Globe', 'Bip inside a snow globe; landing shakes up a snowstorm.'),
    ('Comfy Armchair', 'an armchair with slippers and a reading lamp.'),
    ('Shopping Trolley', 'with one wonky wheel that squeaks.'),
    ('Hamster Ball', 'Bip rolls along inside a clear ball.'),
]

sections = []
for i, (fn, name, pitch, rows) in enumerate(IDEAS, 1):
    dl = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in rows)
    sections.append(f'<section><h2>{i}. {name}</h2><p class="pitch">{pitch}</p><div class="row">'
                    f'<figure>{fly_panel(fn, i, name)}<figcaption>Flying</figcaption></figure>'
                    f'<figure>{land_panel(fn, i, name)}<figcaption>Landing</figcaption></figure>'
                    f'<dl>{dl}</dl></div></section>')
tiles = ''.join(tile(fn, name, i) for i, (fn, name, _, _) in enumerate(IDEAS, 1)) + tile(classic, 'Classic, today', 9)
also = ''.join(f'<li><b>{n}</b>: {d}</li>' for n, d in ALSO)

html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket Lander: new ship ideas (sketches 1)</title>
<style>
:root {{ --bg: #F7F5FF; --fg: #1B1446; --mut: #5d5880; --card: #fff; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #121027; --fg: #EDEBFF; --mut: #a9a5c9; --card: #1d1a3a; }} }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 22px; margin: 0 0 4px; }} h2 {{ font-size: 20px; margin: 26px 0 2px; }}
p {{ margin: 0 0 10px; max-width: 70ch; }} .pitch {{ font-weight: 600; }}
.stamp {{ color: var(--mut); font-size: 13px; }}
.row {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }}
figure {{ margin: 0; background: var(--card); border-radius: 14px; padding: 8px; box-sizing: border-box; flex: 1 1 300px; max-width: 380px; }}
figure svg {{ display: block; width: 100%; height: auto; border-radius: 10px; }}
figcaption {{ font-size: 13px; color: var(--mut); text-align: center; margin-top: 4px; }}
dl {{ flex: 1 1 280px; margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 15px; align-content: start; }}
dt {{ font-weight: 700; }} dd {{ margin: 0; }}
.tiles {{ display: flex; flex-wrap: wrap; gap: 8px; }}
figure.tile {{ flex: 0 0 auto; max-width: none; padding: 4px; }}
figure.tile svg {{ width: 112px; height: auto; }}
ul {{ padding-left: 20px; max-width: 70ch; }}
</style></head><body>
<h1>Rocket Lander: new ship ideas (sketches 1)</h1>
<p class="stamp">Sketches, not the finished look: the shapes, the jokes, and how each one flies and lands. All original. sketch_rocket_ship_ideas.py {VERSION} · built at {COMMIT} · draft</p>
<p>Six ideas that are not rockets: funny everyday things, a toy and a snail, each with its own way of flying, its own landing joke and sound, and Bip on show. Each keeps today's ships' size and landing spot, so play doesn't change. Pick the best few to draw in detail.</p>
{"".join(sections)}
<section><h2>At their size in play</h2>
<p>On a sideways phone a ship is {PLAY_H:g} px tall (bigger upright and on the PC). Each idea is drawn here at that size, next to today's Classic, to check it still reads when it's small.</p>
<div class="tiles">{tiles}</div></section>
<section><h2>Also thought of (not sketched)</h2><p>Swap any of these in for one above.</p><ul>{also}</ul></section>
</body></html>'''
page = os.path.join(OUT, 'index.html')
with open(page, 'w', encoding='utf-8') as fh:
    fh.write(html)
print(page, len(html.encode()), 'bytes')

# ---------- the page check (headless Chromium, a stand-in for the phone and PC) ----------
from playwright.sync_api import sync_playwright  # noqa: E402

SHOTS = os.path.join(OUT, 'shots')
os.makedirs(SHOTS, exist_ok=True)
problems = []
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
        tag = f'{w}x{h} {scheme}'
        others = [u for u in asked if u != url]
        sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        blank = pg.evaluate('[...document.querySelectorAll("svg")].filter((s) => { const r = s.getBoundingClientRect(); return !(r.width > 50 && r.height > 50); }).length')
        n = pg.evaluate('document.querySelectorAll("svg").length')
        for ok, what in ((not errors, f'no script errors {errors[:2]}'), (not others, f'asks for nothing but itself {others[:2]}'),
                         (not sideways, 'no sideways scrolling'), (blank == 0 and n == 2 * len(IDEAS) + len(IDEAS) + 1, f'every drawing drawn ({n} drawings, {blank} blank)')):
            print(('ok   ' if ok else 'FAIL ') + f'{tag}: {what}')
            if not ok:
                problems.append(f'{tag}: {what}')
        pg.screenshot(path=os.path.join(SHOTS, f'page-{w}x{h}-{scheme}.png'), full_page=True)
        if w == 1280 and scheme == 'light':
            for k, el in enumerate(pg.query_selector_all('section figure')):
                el.screenshot(path=os.path.join(SHOTS, f'fig-{k + 1:02d}.png'))
        ctx.close()
    br.close()
print(f'Pictures: {SHOTS}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
