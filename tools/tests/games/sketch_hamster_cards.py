"""Hamster Highway: mock-ups of the gadget help cards (D-167, Q-055) and of the house view with paired stops (D-166),
drawn with the game's own art (art.js 1.4, house.js 1.5). Not a check of the game: a sketch page for Rob to pick from.
Version 0.1 (16 Nov, step 7).

The cards: the bridge and the teacup lift, each in three formats, on a card over the level's dimmed backdrop:
  A. One picture: the gadget doing its job.
  B. A strip of three pictures: the problem, the gadget, the hamster home.
  C. A looping animation of a few seconds (CSS only; the scene fades out and in at the loop's join).
Each has a caption of 3 to 6 words, on screen only (the game says nothing aloud), and a big green tick to close it.

The house view: the 10 places each hold two stops, numbered 1 to 20 in pairs, a little apart along the way the route
runs there (each pair sits either side of the place's old stop, PAIR units apart, along the line from the stop before
to the stop after; a few are set by hand in TWEAK). Two looks: A, two stops on their own; B, the pair on a shared
soft plate. The script checks D-151's rule on the whole new route (it never crosses itself or runs back along
itself), with the same test as test_hamster_highway_core.py, that no two stops' tap circles (56 across the middle,
house.js's marker) overlap, and that nothing in the page would be fetched. It exits 1 if a check fails.

Usage, from the repo root:
    python3 -B tools/tests/games/sketch_hamster_cards.py OUT.html
"""
import json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-cards.html'

JS = r'''
const [artUrl, houseUrl] = process.argv.slice(1);
const A = await import(artUrl);
const H = await import(houseUrl);
const out = { ham: {}, block: {}, water: {} };
for (const p of ['walk1', 'walk2', 'home', 'stuck']) out.ham[p] = A.hamster(p);
for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) { out.block[`${c},${r},1`] = A.block(c, r, true); out.block[`${c},${r},0`] = A.block(c, r, false); out.water[`${c},${r}`] = A.water(c, r); }
out.bridge = A.gadget('bridge');
out.home = A.homeArt();
out.seed = A.seedArt();
out.lift = A.liftArt(210, 100, 336);
out.cupBack = A.teacupBack();
out.cupFront = A.teacupFront();
out.backKitchen = A.backdrop('kitchen');
out.backShed = A.backdrop('shed', 720);
out.sparkle = A.sparkle(0, 0, 12);
out.star = A.star(0, 0, 8);
out.heart = A.heart(0, 0, 10);
out.house = H.houseScene({ levels: [], current: -1 });
out.HW = H.HOUSE_W; out.HH = H.HOUSE_H; out.SPOTS = H.SPOTS; out.PLAN = H.PLAN;
out.token = A.hamster('walk1');
console.log(JSON.stringify(out));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'art.js'), 'file://' + os.path.join(GAME, 'house.js')],
                   capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
ART = json.loads(r.stdout)
INK, SUN, CORAL, PINK, CREAM, GREEN = '#1B1446', '#FFC93C', '#FF5D73', '#FF9BB3', '#FFF8EE', '#3CC864'
BROWN, MUTED = '#C48A4C', '#B5824E'
FONT = 'Fredoka, system-ui, sans-serif'
SC = 0.56   # a hamster's size on the board (game.js SC)
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


def place(body, x, y, sc=1.0, extra=''):
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({sc})"{extra}>{body}</g>'


def ham(x, y, pose='walk1', sc=SC):
    return place(ART['ham'][pose], x, y, sc)


def txt(x, y, s, size, fill=INK, extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="middle" font-weight="700" font-family="{FONT}"{extra}>{s}</text>'


def huh(x, y):
    return txt(x, y, '?', 30, INK, ' stroke="#fff" stroke-width="5" paint-order="stroke"')


def arrow(x1, y1, x2, y2, col=CORAL, w=7):
    # a fat arrow with a white edge, as the game's hints would draw it
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 16 * math.cos(a), y2 - 16 * math.sin(a)
    l, rr = a + 2.5, a - 2.5
    head = f'M {x2:.1f} {y2:.1f} L {x2 + 18 * math.cos(l):.1f} {y2 + 18 * math.sin(l):.1f} L {x2 + 18 * math.cos(rr):.1f} {y2 + 18 * math.sin(rr):.1f} Z'
    s = f'<line x1="{x1}" y1="{y1}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="#fff" stroke-width="{w + 5}" stroke-linecap="round"/>'
    s += f'<path d="{head}" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>'
    s += f'<line x1="{x1}" y1="{y1}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'
    return s + f'<path d="{head}" fill="{col}" stroke="{col}" stroke-width="2" stroke-linejoin="round"/>'


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


# ---------------------------------------------------------------- the bridge's scenes (board units, a gap at column 3)
B_ROWS = ['........'] * 6 + ['###.####']
B_FLOOR = 360
BRIDGE = place(ART['bridge'], 180, B_FLOOR, 0.6)
HOME_B = place(ART['home'], 420, 300, 0.6)
B_GROUND = board(B_ROWS, [(3, 6)]) + HOME_B


def bridge_one():
    s = B_GROUND + f'<ellipse cx="210" cy="{B_FLOOR + 6}" rx="52" ry="16" fill="{SUN}" opacity="0.35"/>' + BRIDGE
    s += place(ART['sparkle'], 172, 344) + place(ART['sparkle'], 252, 340, 0.7)
    s += '<path d="M 70 268 Q 210 214 360 268" fill="none" stroke="#5FA8C9" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round"/>'
    s += arrow(330, 258, 368, 274, '#5FA8C9', 5)
    s += ham(96, B_FLOOR, 'walk2') + ham(212, B_FLOOR, 'walk1')
    return s


def bridge_strip():
    p1 = B_GROUND + ham(150, B_FLOOR, 'walk1') + huh(160, B_FLOOR - 62)
    p2 = (B_GROUND + f'<rect x="183" y="{B_FLOOR - 2}" width="54" height="54" rx="8" fill="{SUN}" opacity="0.3" stroke="{SUN}" stroke-width="3" stroke-dasharray="6 5"/>'
          + place(ART['bridge'], 180, B_FLOOR - 34, 0.6) + arrow(210, 272, 210, 316, CORAL, 6) + ham(150, B_FLOOR, 'walk1'))
    p3 = B_GROUND + BRIDGE + ham(212, B_FLOOR, 'walk2') + ham(300, B_FLOOR - 4, 'home')
    return [p1, p2, p3]


def bridge_loop():
    # 5 s: walks to the gap, stops (?), the bridge drops in, walks across, a happy hop at home, fades
    s = B_GROUND
    s += f'<g class="bfit"><rect x="183" y="{B_FLOOR - 2}" width="54" height="54" rx="8" fill="{SUN}" opacity="0.3" stroke="{SUN}" stroke-width="3" stroke-dasharray="6 5"/></g>'
    s += f'<g class="bdrop">{BRIDGE}</g>'
    s += f'<g class="bspark">{place(ART["sparkle"], 172, 344)}{place(ART["sparkle"], 252, 340, 0.7)}</g>'
    walk = f'<g class="legs1">{ham(0, B_FLOOR, "walk1")}</g><g class="legs2">{ham(0, B_FLOOR, "walk2")}</g>'
    s += (f'<g class="bham"><g class="bmove">{walk}</g><g class="bwait">{ham(0, B_FLOOR, "walk1")}{huh(10, B_FLOOR - 62)}</g>'
          f'<g class="bhome">{ham(0, B_FLOOR - 4, "home")}</g></g>')
    return f'<g class="bscene">{s}</g>'


# ---------------------------------------------------------------- the teacup lift's scenes (lift in column 3, rows 2 to 5)
L_ROWS = ['.......', '.......', '.......', '....###', '....###', '###.###', '#######']
LX, LTOP, LBOT, OFF = 210, 180, 300, 16
L_GROUND = ART['lift'] + board(L_ROWS) + place(ART['home'], 360, LTOP - 60, 0.6)


def cup(x, y, rider=''):
    return place(ART['cupBack'], x, y) + rider + place(ART['cupFront'], x, y)


def lift_one():
    s = L_GROUND
    s += cup(LX, LBOT, ham(LX - 10, LBOT - 4, 'walk1')) + ham(LX - 70, LBOT, 'walk2')
    s += cup(LX, LTOP) + ham(LX + 66, LTOP, 'home')
    s += arrow(LX + 30, 272, LX + 30, 208, CORAL, 6) + arrow(LX - 30, 208, LX - 30, 272, '#5FA8C9', 6)
    return s


def lift_strip():
    p1 = L_GROUND + cup(LX, LTOP) + cup(LX, LBOT) + ham(LX - 62, LBOT, 'walk1') + arrow(LX - 66, 228, LX - 30, 256, CORAL, 5)
    lines = ''.join(f'<line x1="{LX + OFF + dx}" y1="{254 + abs(dx) * 0.2:.1f}" x2="{LX + OFF + dx}" y2="{268 + abs(dx) * 0.2:.1f}" stroke="{INK}" stroke-width="2.4" stroke-linecap="round" opacity="0.5"/>' for dx in (-12, 0, 12))
    p2 = L_GROUND + cup(LX - OFF, 246) + cup(LX + OFF, 234, ham(LX + OFF, 230, 'walk1')) + lines
    p3 = L_GROUND + cup(LX, LBOT) + cup(LX, LTOP) + ham(LX + 70, LTOP - 4, 'home')
    return [p1, p2, p3]


def lift_loop():
    # 6 s: walks into the bottom cup, rides up as the other cup comes down, steps out at the top, a happy hop, fades
    s = ART['lift'].replace('class="loop"', 'class="loop lstring"') + board(L_ROWS) + place(ART['home'], 360, LTOP - 60, 0.6)
    s += f'<g class="lcupB">{cup(LX, LTOP)}</g>'
    s += f'<g class="lcupA">{place(ART["cupBack"], LX, LBOT)}</g>'
    walk = f'<g class="legs1">{ham(0, LBOT, "walk1")}</g><g class="legs2">{ham(0, LBOT, "walk2")}</g>'
    s += (f'<g class="lham"><g class="lmove">{walk}</g><g class="lride">{ham(0, LBOT, "walk1")}</g>'
          f'<g class="lhome">{ham(0, LBOT - 4, "home")}</g></g>')
    s += f'<g class="lcupA">{place(ART["cupFront"], LX, LBOT)}</g>'
    s += f'<g class="lwait">{ham(66, LBOT, "walk2")}</g>'
    return f'<g class="lscene">{s}</g>'


CSS_ANIM = '''
@keyframes legs { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
.legs1 { animation: legs .36s steps(1) infinite; } .legs2 { animation: legs .36s steps(1) infinite reverse; }
@keyframes bscene { 0% { opacity: 0 } 5%, 93% { opacity: 1 } 100% { opacity: 0 } }
@keyframes bham { 0% { transform: translateX(40px) } 25%, 50% { transform: translateX(150px) } 82%, 100% { transform: translateX(398px) } }
@keyframes bmove { 0%, 24.9% { opacity: 1 } 25%, 49.9% { opacity: 0 } 50%, 81.9% { opacity: 1 } 82%, 100% { opacity: 0 } }
@keyframes bwait { 0%, 24.9% { opacity: 0 } 25%, 49.9% { opacity: 1 } 50%, 100% { opacity: 0 } }
@keyframes bhome { 0%, 81.9% { opacity: 0; transform: translateY(0) } 82% { opacity: 1; transform: translateY(0) } 87% { transform: translateY(-14px) } 92%, 100% { opacity: 1; transform: translateY(0) } }
@keyframes bfit { 0%, 27% { opacity: 0 } 31%, 40% { opacity: 1 } 44%, 100% { opacity: 0 } }
@keyframes bdrop { 0%, 38% { opacity: 0; transform: translateY(-120px) } 40% { opacity: 1; transform: translateY(-120px) } 47% { transform: translateY(0) } 50% { transform: translateY(-9px) } 53%, 100% { opacity: 1; transform: translateY(0) } }
@keyframes bspark { 0%, 46% { opacity: 0 } 50%, 58% { opacity: 1 } 64%, 100% { opacity: 0 } }
.bscene { animation: bscene 5s linear infinite; }
.bham { animation: bham 5s linear infinite; } .bmove { animation: bmove 5s linear infinite; } .bwait { animation: bwait 5s linear infinite; }
.bhome { animation: bhome 5s ease-in-out infinite; } .bfit { animation: bfit 5s linear infinite; }
.bdrop { animation: bdrop 5s ease-in infinite; } .bspark { animation: bspark 5s linear infinite; }
@keyframes lscene { 0% { opacity: 0 } 5%, 93% { opacity: 1 } 100% { opacity: 0 } }
@keyframes lcupA { 0%, 22% { transform: translate(0, 0) } 26% { transform: translate(16px, -16px) } 51% { transform: translate(16px, -104px) } 55%, 100% { transform: translate(0, -120px) } }
@keyframes lcupB { 0%, 22% { transform: translate(0, 0) } 26% { transform: translate(-16px, 16px) } 51% { transform: translate(-16px, 104px) } 55%, 100% { transform: translate(0, 120px) } }
@keyframes lham { 0% { transform: translate(40px, 0) } 18% { transform: translate(196px, 0) } 22% { transform: translate(204px, -4px) } 26% { transform: translate(220px, -20px) }
  51% { transform: translate(220px, -108px) } 55% { transform: translate(204px, -124px) } 60% { transform: translate(236px, -120px) } 78%, 100% { transform: translate(330px, -120px) } }
@keyframes lmove { 0%, 21.9% { opacity: 1 } 22%, 57.9% { opacity: 0 } 58%, 77.9% { opacity: 1 } 78%, 100% { opacity: 0 } }
@keyframes lride { 0%, 21.9% { opacity: 0 } 22%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 } }
@keyframes lhome { 0%, 77.9% { opacity: 0; transform: translateY(0) } 78% { opacity: 1; transform: translateY(0) } 84% { transform: translateY(-14px) } 90%, 100% { opacity: 1; transform: translateY(0) } }
@keyframes lstring { 0%, 22% { stroke-dashoffset: 0 } 55%, 100% { stroke-dashoffset: -120 } }
@keyframes lwait { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
.lscene { animation: lscene 6s linear infinite; } .lcupA { animation: lcupA 6s ease-in-out infinite; } .lcupB { animation: lcupB 6s ease-in-out infinite; }
.lham { animation: lham 6s ease-in-out infinite; } .lmove { animation: lmove 6s linear infinite; } .lride { animation: lride 6s linear infinite; }
.lhome { animation: lhome 6s ease-in-out infinite; } .lstring { animation: lstring 6s ease-in-out infinite; } .lwait { animation: lwait .8s ease-in-out infinite; }
'''

# ---------------------------------------------------------------- the card (720 x 420, the board's size)
CAPTION = {'bridge': 'Bridges cross the gaps', 'lift': 'Hop in and ride up!'}
VIEW = {'bridge': ('0 236 480 184', '80 250 260 170'), 'lift': ('40 76 380 284', '96 84 300 280')}


def badge(kind):
    s = f'<rect x="84" y="30" width="78" height="78" rx="16" fill="#FFF" stroke="{INK}" stroke-width="3"/>'
    if kind == 'bridge':
        s += place(ART['bridge'], 92, 66, 0.62)
    else:
        s += f'<line x1="123" y1="36" x2="123" y2="70" stroke="#E8505B" stroke-width="3" stroke-dasharray="6 4"/>' + place(ART['cupBack'], 123, 86, 1.0) + place(ART['cupFront'], 123, 86, 1.0)
    return s


def tick_button():
    return (f'<rect x="300" y="340" width="120" height="54" rx="27" fill="{GREEN}" stroke="{INK}" stroke-width="3.5"/>'
            f'<rect x="312" y="347" width="96" height="14" rx="7" fill="rgba(255,255,255,0.28)"/>'
            f'<path d="M 340 368 L 355 382 L 382 352" fill="none" stroke="{INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="M 340 368 L 355 382 L 382 352" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')


def nest(x, y, w, h, vb, body, frame=False):
    f = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#F3E3C8" stroke="{INK}" stroke-width="2.5"/>' if frame else ''
    return f + f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vb}" preserveAspectRatio="xMidYMid meet" overflow="hidden">{body}</svg>'


def card(kind, fmt):
    back = ART['backKitchen'] if kind == 'bridge' else ART['backShed']
    s = back + '<rect x="0" y="0" width="720" height="420" fill="rgba(27,20,70,0.5)"/>'
    s += f'<rect x="58" y="16" width="604" height="390" rx="28" fill="{CREAM}" stroke="{INK}" stroke-width="4"/>'
    s += badge(kind) + txt(400, 82, CAPTION[kind], 34)
    one, strip = VIEW[kind]
    if fmt == 'one':
        body = bridge_one() if kind == 'bridge' else lift_one()
        s += nest(90, 120, 540, 212, one, body, True)
    elif fmt == 'strip':
        panels = bridge_strip() if kind == 'bridge' else lift_strip()
        for i, p in enumerate(panels):
            x = 90 + i * 190
            top, ph = (126, 200) if kind == 'lift' else (150, 130)
            s += nest(x, top, 160, ph, strip, p, True)
            s += f'<circle cx="{x + 18}" cy="{top + 18}" r="13" fill="{SUN}" stroke="{INK}" stroke-width="2.4"/>' + txt(x + 18, top + 25, str(i + 1), 18)
            if i < 2:
                ay = top + ph / 2
                s += f'<path d="M {x + 166} {ay} l 18 0 m -8 -9 l 9 9 l -9 9" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    else:
        body = bridge_loop() if kind == 'bridge' else lift_loop()
        s += nest(90, 120, 540, 212, one, body, True)
    s += tick_button()
    return f'<svg viewBox="0 0 720 420" role="img" aria-label="{CAPTION[kind]}">{s}</svg>'


# ---------------------------------------------------------------- the house view with paired stops
SPOTS, PLAN = ART['SPOTS'], ART['PLAN']
PAIR = 116          # units between a pair's two stops (house.js's marker: tap circle 56 across the middle, so 112 keeps them apart)
FIRST5 = ['sink', 'breadbin', 'tins', 'bookshelf', 'cage']
# place: ((x, y) first, (x, y) second), set by hand where the line from the stops either side lands badly: the
# bookshelf's second stop sat on the floor between the storeys, and the cage's first on the bedroom's tube
TWEAK = {'bookshelf': ((1010, 620), (1110, 560)), 'cage': ((1090, 300), (974, 290))}

route = [{'name': n, 'at': SPOTS[n], 'level': i + 1} for i, n in enumerate(FIRST5)]
for p in PLAN:
    for v in p.get('via') or []:
        route.append({'name': None, 'at': v, 'level': None})
    route.append({'name': p['name'], 'at': p['at'], 'level': p['level']})

pts, stops = [], []
for i, st in enumerate(route):
    if not st['level']:
        pts.append(st['at'])
        if st['name']:
            stops.append({'at': st['at'], 'n': None, 'name': st['name']})
        continue
    prev = route[i - 1]['at'] if i > 0 else st['at']
    nxt = route[i + 1]['at'] if i + 1 < len(route) else st['at']
    dx, dy = nxt[0] - prev[0], nxt[1] - prev[1]
    d = math.hypot(dx, dy)
    ux, uy = dx / d, dy / d
    a = (round(st['at'][0] - ux * PAIR / 2), round(st['at'][1] - uy * PAIR / 2))
    b = (round(st['at'][0] + ux * PAIR / 2), round(st['at'][1] + uy * PAIR / 2))
    if st['name'] in TWEAK:
        a, b = TWEAK[st['name']]
    k = st['level']
    stops += [{'at': a, 'n': 2 * k - 1, 'name': st['name'], 'pair': b}, {'at': b, 'n': 2 * k, 'name': st['name']}]
    pts += [list(a), list(b)]


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


segs = list(zip(pts, pts[1:]))
bad = [(i, j) for i in range(len(segs)) for j in range(i + 1, len(segs))
       if (j == i + 1 and (orient(*segs[i], segs[j][1]) == 0 and on(*segs[i], segs[j][1]) or orient(*segs[j], segs[i][0]) == 0 and on(*segs[j], segs[i][0])))
       or (j > i + 1 and meet(*segs[i], *segs[j]))]
check(not bad, f'the house\'s whole route with paired stops never crosses itself or runs back along itself (D-151) ({bad or len(segs)} segments)')
turns = []
for p, q, s in zip(pts, pts[1:], pts[2:]):
    a1 = math.atan2(q[1] - p[1], q[0] - p[0])
    a2 = math.atan2(s[1] - q[1], s[0] - q[0])
    turns.append(abs((math.degrees(a2 - a1) + 180) % 360 - 180))
check(max(turns) < 150, f'no turn on the route folds back sharply (largest {max(turns):.0f} degrees, under 150)')
numbered = [s for s in stops if s['n']]
check([s['n'] for s in numbered] == list(range(1, 21)), f'20 stops, numbered 1 to 20 along the route ({[s["n"] for s in numbered]})')
close = min(math.dist(p['at'], q['at']) for i, p in enumerate(stops) for q in stops[i + 1:])
check(close >= 112, f'no two stops\' tap circles overlap: the closest are {close:.0f} units apart (112 or more)')
inside = all(56 <= s['at'][0] <= ART['HW'] - 56 and 56 <= s['at'][1] <= ART['HH'] - 56 for s in stops)
check(inside, 'every stop sits inside the house picture')
for s in numbered:
    print(f'     stop {s["n"]:>2} at {s["name"]:<9} {tuple(s["at"])}')

BARE = re.sub(r'<g class="poke future"[^>]*>.*?</g>', '', ART['house'])
BARE = re.sub(r'<path [^>]*stroke-dasharray="2 12"[^>]*/>', '', BARE)


def marker(x, y, n, done, seed, current, locked):
    s = ''
    if current:
        s += f'<circle cx="{x}" cy="{y}" r="38" fill="none" stroke="{SUN}" stroke-width="5" opacity="0.55"/>'
    s += f'<circle cx="{x}" cy="{y}" r="28" fill="{"#FFE9C7" if done else CREAM}" stroke="{BROWN}" stroke-width="3" stroke-opacity="0.55"/>'
    s += txt(x, y + 9, str(n), 26, MUTED)
    if done:
        s += place(ART['heart'], x + 22, y - 22, 0.7)
    if seed:
        s += place(ART['seed'], x + 24, y + 18, 0.55)
    dim = ' opacity="0.5"' if locked else ''
    return f'<g{dim}>{s}</g>'


def house(look):
    s = BARE + f'<path d="M {" L ".join(f"{x} {y}" for x, y in pts)}" fill="none" stroke="{MUTED}" stroke-width="4" stroke-dasharray="2 12" opacity="0.45"/>'
    if look == 'B':
        for st in stops:
            if st.get('pair'):
                (x1, y1), (x2, y2) = st['at'], st['pair']
                ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
                cx, cy, L = (x1 + x2) / 2, (y1 + y2) / 2, math.dist(st['at'], st['pair'])
                s += (f'<rect x="{cx - L / 2 - 40:.1f}" y="{cy - 40:.1f}" width="{L + 80:.1f}" height="80" rx="40" fill="rgba(255,248,238,0.7)" '
                      f'stroke="{BROWN}" stroke-width="3" stroke-dasharray="7 6" stroke-opacity="0.55" transform="rotate({ang:.1f} {cx:.1f} {cy:.1f})"/>')
    for st in stops:
        x, y = st['at']
        if not st['n']:
            s += f'<circle cx="{x}" cy="{y}" r="24" fill="rgba(255,248,238,0.5)" stroke="{BROWN}" stroke-width="3" stroke-dasharray="6 6" stroke-opacity="0.4"/>'
            continue
        n = st['n']
        s += marker(x, y, n, n <= 7, n in (1, 3, 4, 6), n == 8, n > 8)
    cur = next(st for st in stops if st['n'] == 8)['at']
    s += place(ART['token'], cur[0], cur[1] - 26, 0.42)
    return f'<svg viewBox="0 0 {ART["HW"]} {ART["HH"]}" class="house" role="img" aria-label="House view {look}">{s}</svg>'


# ---------------------------------------------------------------- the page
FMT = [('one', 'A. One picture'), ('strip', 'B. A strip of three'), ('loop', 'C. A looping animation')]


def figs(kind):
    return ''.join(f'<figure>{card(kind, f)}<figcaption>{label}</figcaption></figure>' for f, label in FMT)


page = f'''<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: help cards and paired stops</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #FFF8EE; color: #1B1446; }}
h1 {{ font-size: 1.3rem; margin: 0 0 8px; }} h2 {{ font-size: 1.1rem; margin: 22px 0 4px; }}
p, li {{ margin: 4px 0 8px; max-width: 64ch; line-height: 1.4; }}
.row {{ display: flex; flex-wrap: wrap; gap: 14px; }}
figure {{ margin: 0; flex: 1 1 300px; max-width: 460px; min-width: 0; }}
figure svg {{ width: 100%; height: auto; border: 2px solid #1B1446; border-radius: 12px; display: block; }}
figcaption {{ font-size: .95rem; margin-top: 4px; font-weight: 600; }}
.scroll {{ overflow-x: auto; border: 2px solid #1B1446; border-radius: 12px; max-width: 100%; }}
.scroll svg {{ height: 380px; width: auto; display: block; }}
small {{ opacity: .8; }}
@media (prefers-color-scheme: dark) {{ body {{ background: #1B1446; color: #FFF8EE; }} figure svg, .scroll {{ border-color: #FFF8EE; }} }}
{CSS_ANIM}
</style></head><body>
<h1>Hamster Highway: help cards and the house with 20 stops</h1>
<p>Mock-ups for the next version (D-166, D-167), drawn with the game's own art. Nothing here is built yet.</p>
<h2>1. The bridge's help card</h2>
<p>It pops up before the first level with a new gadget; the green tick closes it. Caption: “{CAPTION['bridge']}”.</p>
<div class="row">{figs('bridge')}</div>
<h2>2. The teacup lift's help card</h2>
<p>Caption: “{CAPTION['lift']}”. The lift is part of the level, not a gadget in the tray, so its card comes up when level 9 (now 17) first opens.</p>
<div class="row">{figs('lift')}</div>
<h2>3. The house with paired stops</h2>
<p>Each place holds two stops a little apart, numbered in pairs along the path; the path still never crosses itself or runs back along itself. Shown with levels 1 to 7 done and 8 next. Swipe sideways inside the picture.</p>
<p><b>Look A: two stops on their own</b></p>
<div class="scroll">{house('A')}</div>
<p><b>Look B: each pair on a shared soft plate</b></p>
<div class="scroll">{house('B')}</div>
<p><small>Sketch only: tools/tests/games/sketch_hamster_cards.py 0.1 on claude/games.</small></p>
</body></html>
'''
check('http' not in page, 'nothing in the page would be fetched (no http text at all)')
check(page.count('<svg') == page.count('</svg>'), f'every svg is closed ({page.count("<svg")} opened)')
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(page)
print('wrote', OUT, len(page), 'bytes')
sys.exit(1 if FAILS else 0)
