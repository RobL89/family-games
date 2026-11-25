"""Hamster Highway step 18a (D-224): mock-ups of the fair by day and its animations, and of the zip-line's help card, for
Rob's pick before anything is built. Version 0.1 (25 Nov). Rob's answers this chat (25 Nov, Q-092 to Q-094, proposed
until logged): the zip ride, a lively fair backdrop and a fair party at home; gentle while building, full speed and
brighter once GO is pressed and at the party.

What is drawn, all Claude's, proposed:
  - the fair by day, three looks (mock_hamster_fair.js 0.1: A the big wheel, B the carousel, C the boating lake), its busy
    shapes faded to 0.4 as the park's (D-219) and moving gently, brightened and faster in a run (mock_hamster_fair.css
    0.1); drawn by the real game behind a stand-in 9 x 16 board (not level 29), phone sideways (844 x 390, touch) and PC
    (1366 x 650), building and in a run; and live on the page, building and in a run side by side;
  - the zip ride four ways (R0 today's, R1 swing and kick, R2 also the line sags, sparkles and a landing hop, R3 also a
    somersault off the end), drawn from the game's own art, live;
  - the zip-line's help card two ways (mock_hamster_zipcards.js 0.1: A "Zip down the line!", B "Hook it high, peg it
    low!"), drawn by cards.js's own frame and helpers, live;
  - a fair party at home two ways (P1 a merry-go-round, P2 the big wheel and balloons), live.
A scratch worktree of HEAD gets the three files appended to art.js, style.css and cards.js; the repo is not changed.
Headless Chromium stands in for the phone and the PC. In the game, game.js would set data-mode on the board's svg and draw
the ride frame by frame, as it draws today's; the page's live pictures are moved by CSS instead (stand-ins, named on it).

Checks (exit 1 if one fails): the scratch copy builds; each look drawn, on both, building and in a run, the game logging no
errors; the busy shapes at 0.4 building and 0.75 in a run; the run-only movement paused while building and running in a
run; balloons let go only in a run; the big wheel turns about its hub (its turning group's box keeps its middle on the
hub, within 3 px, 1.5 s apart); nothing moves with reduced motion asked for; the kicking feet found in the zip pose; each
card's caption 3 to 6 words; on the page itself: every live picture moving, no errors; every screenshot there and none
blank; the page names no web address; every svg closed. --fault N plants a fault the checks must catch: 1 a web address;
2 a screenshot left out; 3 an svg left open; 4 the wheel turning about the wrong point; 5 the run's extra spin running
while building; 6 reduced motion ignored; 7 the zip pose's feet not found; 8 a card's caption of 8 words.

Usage, from the repo root: python3 -B tools/tests/games/mock_hamster_step18a.py OUT.html [--fault N]
"""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-step18a-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


FAIR_JS = open(os.path.join(HERE, 'mock_hamster_fair.js')).read()
FAIR_CSS = open(os.path.join(HERE, 'mock_hamster_fair.css')).read()
ZIPCARDS_JS = open(os.path.join(HERE, 'mock_hamster_zipcards.js')).read()
if FAULT == 4:
    FAIR_CSS += '\n.fx-spin, .fx-spin-run { transform-origin: 50% 0; }\n'
if FAULT == 5:
    FAIR_CSS = FAIR_CSS.replace('.fx-spin-run { animation: fx-spin 9s linear infinite paused; }', '.fx-spin-run { animation: fx-spin 9s linear infinite; }')
if FAULT == 6:
    FAIR_CSS = FAIR_CSS[:FAIR_CSS.index('@media (prefers-reduced-motion')] + FAIR_CSS[FAIR_CSS.index('/* the fair party'):]
if FAULT == 7:
    FAIR_JS = FAIR_JS.replace('[ellipse(-8, 4, 8, 5, PINK, 2.4), ellipse(14, 6', '[ellipse(-8, 5, 8, 5, PINK, 2.4), ellipse(14, 6')
if FAULT == 8:
    ZIPCARDS_JS = ZIPCARDS_JS.replace("CAPTION.zipA = 'Zip down the line!';", "CAPTION.zipA = 'Zip all the way down the long line!';")
LOOKS = ['fairA', 'fairB', 'fairC']

# ---------------------------------------------------------------- the scratch worktree
WT = '/tmp/hh-step18a-wt' + (str(FAULT) if FAULT else '')
SERVE = '/tmp/hh-step18a-serve' + (str(FAULT) if FAULT else '')
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
NODE_JS = r'''
const [artUrl, cardsUrl] = process.argv.slice(1);
const art = await import(artUrl);
const cards = await import(cardsUrl);
const out = { back: {}, ride: [], card: {}, party: {} };
for (const k of Object.keys(art.FAIR_LOOKS)) out.back[k] = art.backdrop(k, 960);
for (let i = 0; i < 4; i++) out.ride.push(art.zipRide(i));
out.party.carousel = art.partyCarousel();
out.party.wheel = art.partyWheel();
for (const k of ['zipA', 'zipB']) out.card[k] = cards.zipCardArt(k);
out.caption = { zipA: cards.CAPTION.zipA, zipB: cards.CAPTION.zipB };
out.cardCss = cards.CARD_CSS + cards.ZIP_CARD_CSS;
out.kickOk = art.kickOk();
out.sag = art.ZIP_SAG;
console.log(JSON.stringify(out));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    art = os.path.join(gdir, 'art.js')
    src = open(art).read()
    for old, new in [
        ("export function backdrop(name, w = W) {\n",
         "export function backdrop(name, w = W) {\n  if (name.startsWith('fair')) return g({ fairA, fairB, fairC }[name](w), '', ` data-back=\"${name}\"`);\n"),
        ("export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' ? 540 : H);",
         "export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' || name.startsWith('fair') ? 540 : H);"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    open(art, 'w').write(src + '\n' + FAIR_JS)
    css = os.path.join(gdir, 'style.css')
    open(css, 'a').write('\n' + FAIR_CSS)
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + (b.stderr or b.stdout)[-400:]))
    # the cards only for the live pictures (built after the preview: the game itself doesn't need them)
    cards_js = os.path.join(gdir, 'cards.js')
    open(cards_js, 'a').write('\n' + ZIPCARDS_JS)
    n = subprocess.run(['node', '--input-type=module', '-e', NODE_JS, 'file://' + art, 'file://' + cards_js], capture_output=True, text=True)
    check(n.returncode == 0, 'node draws the live pictures from the scratch art.js and cards.js' + ('' if n.returncode == 0 else ': ' + n.stderr[-600:]))
    LIVE = json.loads(n.stdout) if n.returncode == 0 else {'back': {}, 'ride': [], 'card': {}, 'party': {}, 'caption': {}, 'cardCss': '', 'kickOk': False, 'sag': 0}
    STYLE = open(css).read()
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)

check(LIVE['kickOk'], 'the zip pose\'s two feet each found once in its drawing, so both kick')
for k, cap in LIVE['caption'].items():
    words = len(cap.split())
    check(3 <= words <= 6, f'card {k}: caption "{cap}" is 3 to 6 words ({words})')
# the game's moving-things block (keyframes the live pictures share: confetti, dance, cloud...), and the fair's
GAME_MOVES = STYLE[STYLE.index('/* small moving things'):STYLE.index('@media (prefers-reduced-motion: reduce) { .cloud')]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
BOARD = {'id': 'fairmock', 'name': 'Fair mock-up', 'room': 'garden', 'spot': 'sink', 'new': None,
         'rows': ['................', '...............G', '..........######', '................', '.....######.....',
                  '................', '................', 'S...............', '#######..#######'],
         'tray': {'zip': 1, 'bouncer': 2, 'signpost': 1, 'bridge': 2}}
SHOTS = {}
errors = []
WHEEL_JS = '''() => { const s = document.querySelector('[data-fx="wheel"] .fx-spin'); const par = s.parentNode;
  const m = par.getScreenCTM(); const hub = new DOMPoint(0, 0).matrixTransform(m); const b = s.getBoundingClientRect();
  return { dx: b.x + b.width / 2 - hub.x, dy: b.y + b.height / 2 - hub.y, w: b.width }; }'''
STATE_JS = '''() => { const busy = document.querySelector('.fair-busy'); const run = document.querySelector('.fx-spin-run, .fx-bob-run');
  const up = document.querySelector('.fx-up');
  return { busy: busy ? +getComputedStyle(busy).opacity : null, runState: run ? run.getAnimations().map((a) => a.playState).join(',') : 'none',
           up: up ? up.getAnimations().length : -1, upOpacity: up ? +getComputedStyle(up).opacity : null }; }'''
from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for dev, (w, h, touch) in {'phone': (844, 390, True), 'pc': (1366, 650, False)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
        for look in LOOKS:
            pg.evaluate('(d) => __test.openBoard(d)', dict(BOARD, back=look))
            pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
            pg.wait_for_timeout(500)
            drawn = pg.evaluate(f'() => !!document.querySelector(\'[data-back="{look}"]\')')
            check(drawn, f'{look} drawn on the {dev}')
            st = pg.evaluate(STATE_JS)
            check(st['busy'] is not None and abs(st['busy'] - 0.4) < 0.01, f'{look} on the {dev}, building: busy shapes at 0.4 ({st["busy"]})')
            check(st['runState'] == 'paused', f'{look} on the {dev}, building: the run\'s extra movement paused ({st["runState"]})')
            check(st['up'] in (0, -1), f'{look} on the {dev}, building: no balloons let go ({st["up"]})')
            SHOTS[(look, dev, 'build')] = pg.screenshot(type='jpeg', quality=82)
            pg.evaluate('() => { document.querySelector("[data-back]").ownerSVGElement.dataset.mode = "run"; }')
            pg.wait_for_timeout(1300)
            st = pg.evaluate(STATE_JS)
            check(abs(st['busy'] - 0.75) < 0.01, f'{look} on the {dev}, in a run: busy shapes at 0.75 ({st["busy"]})')
            check(st['runState'] == 'running', f'{look} on the {dev}, in a run: the extra movement running ({st["runState"]})')
            if look != 'fairC':
                check(st['up'] > 0, f'{look} on the {dev}, in a run: balloons let go ({st["up"]} moving)')
            if 'Wheel' not in look and look in ('fairA', 'fairC'):
                a = pg.evaluate(WHEEL_JS)
                pg.wait_for_timeout(1500)
                b2 = pg.evaluate(WHEEL_JS)
                off = max(abs(a['dx']), abs(a['dy']), abs(b2['dx']), abs(b2['dy']))
                check(off <= 3, f'{look} on the {dev}: the big wheel turns about its hub (its box\'s middle at most {off:.1f} px off, 1.5 s apart)')
            if dev == 'pc':
                SHOTS[(look, dev, 'run')] = pg.screenshot(type='jpeg', quality=82)
            pg.evaluate('() => { delete document.querySelector("[data-back]").ownerSVGElement.dataset.mode; }')
        ctx.close()
    # reduced motion: nothing in the fair moves
    ctx = br.new_context(viewport={'width': 1366, 'height': 650}, reduced_motion='reduce')
    pg = ctx.new_page()
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
    pg.evaluate('(d) => __test.openBoard(d)', dict(BOARD, back='fairA'))
    pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
    pg.evaluate('() => { document.querySelector("[data-back]").ownerSVGElement.dataset.mode = "run"; }')
    pg.wait_for_timeout(300)
    moving = pg.evaluate('() => [...document.querySelectorAll("[data-back] [class^=fx-]")].filter((e) => e.getAnimations().length).length')
    check(moving == 0, f'with reduced motion asked for, nothing in the fair moves ({moving} moving)')
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 2:
    del SHOTS[('fairB', 'pc', 'build')]
check(len(SHOTS) == 9 and all(len(v) > 15000 for v in SHOTS.values()), f'nine screenshots, none blank ({len(SHOTS)}: {sorted(len(v) for v in SHOTS.values())} bytes)')


# ---------------------------------------------------------------- the zip rides' CSS (generated: the timeline below)
def zip_css():
    """R0 to R3 on one 4.5 s loop: walk out 0-17.8%, on the line 17.9-48.9% (7 columns at the game's 0.2 s a column),
    then R0 and R1 drop to the bank and walk on; R2 a hop; R3 a somersault; walk home; home 75.6-100%."""
    A, B = (150, 90), (570, 210)
    L, t0, t1 = 4.5, 17.9, 48.9
    sag = LIVE['sag']
    T = lambda x, y: f'transform: translate({x:.1f}px, {y:.1f}px)'   # noqa: E731
    s = ('.zr-swing, .zr-flip, .zr-ham, .zr-spark, .zr-dust { transform-box: view-box; transform-origin: 0 0; }\n'
         '@keyframes zr-legs { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }\n'
         '.zr-legs1, .zr-k1 { animation: zr-legs .36s steps(1) infinite; } .zr-legs2, .zr-k2 { animation: zr-legs .36s steps(1) infinite reverse; }\n'
         '@keyframes zr-swing { 0% { transform: rotate(-13deg) } 100% { transform: rotate(13deg) } }\n'
         '.zr-swing { animation: zr-swing .45s ease-in-out infinite alternate; }\n'
         '@keyframes zr-lines { 0%, 100% { opacity: .2 } 50% { opacity: .8 } }\n.zr-lines { animation: zr-lines .3s linear infinite; }\n')
    for look in range(4):
        pts = []
        for i in range(9):
            u = i / 8
            dy = sag * 4 * u * (1 - u) if look >= 2 else 0
            pts.append((t0 + (t1 - t0) * u, A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u + dy))
        ride = ' '.join(f'{p:.1f}% {{ {T(x, y)} }}' for p, x, y in pts)
        if look <= 1:
            land = f'49% {{ {T(570, 240)} }}'
            walk_from = 49
        elif look == 2:
            land = f'49% {{ {T(570, 232)} }} 52% {{ {T(580, 214)} }} 55% {{ {T(590, 236)} }} 56.5% {{ {T(592, 240)} }}'
            walk_from = 57.8
        else:
            land = f'49% {{ {T(574, 196)} }} 53% {{ {T(586, 182)} }} 57.7% {{ {T(596, 222)} }} 57.8% {{ {T(596, 240)} }}'
            walk_from = 57.8
        s += (f'@keyframes zr-ham{look} {{ 0% {{ {T(30, 120)} }} 17.8% {{ {T(150, 120)} }} {ride} {land} 75.6%, 100% {{ {T(680, 240)} }} }}\n'
              f'.zr-ham{look} {{ animation: zr-ham{look} {L}s linear infinite; }}\n')
        walk = f'0%, 17.8% {{ opacity: 1 }} 17.9%, {walk_from - 0.1:.1f}% {{ opacity: 0 }} {walk_from}%, 75.5% {{ opacity: 1 }} 75.6%, 100% {{ opacity: 0 }}'
        s += (f'@keyframes zr-walk{look} {{ {walk} }}\n.zr{look} .zr-walk {{ animation: zr-walk{look} {L}s linear infinite; }}\n'
              f'@keyframes zr-on{look} {{ 0%, 17.8% {{ opacity: 0 }} 17.9%, 48.9% {{ opacity: 1 }} 49%, 100% {{ opacity: 0 }} }}\n'
              f'.zr{look} .zr-on {{ animation: zr-on{look} {L}s linear infinite; }}\n')
        if look == 2:   # the landing hop's squash: shown as the walk pose; nothing more
            pass
        if look == 3:
            s += (f'@keyframes zr-flip {{ 0%, 48.9% {{ opacity: 0; transform: rotate(0) }} 49% {{ opacity: 1; transform: rotate(0) }} 57.7% {{ opacity: 1; transform: rotate(360deg) }} 57.8%, 100% {{ opacity: 0; transform: rotate(360deg) }} }}\n'
                  f'.zr3 .zr-flip {{ animation: zr-flip {L}s linear infinite; }}\n')
        s += (f'@keyframes zr-home{look} {{ 0%, 75.5% {{ opacity: 0; transform: translateY(0) }} 75.6% {{ opacity: 1 }} 82% {{ transform: translateY(-16px) }} 88% {{ transform: translateY(0) }} 96% {{ opacity: 1 }} 100% {{ opacity: 0 }} }}\n'
              f'.zr{look} .zr-home {{ animation: zr-home{look} {L}s ease-in-out infinite; }}\n')
        if look >= 2:   # the line sags under the reel
            def d(u):
                x = A[0] + (B[0] - A[0]) * u
                y = A[1] + (B[1] - A[1]) * u + sag * 4 * u * (1 - u)
                return f'path("M {A[0]} {A[1]} L {x:.1f} {y:.1f} L {B[0]} {B[1]}")'
            mid = f'path("M {A[0]} {A[1]} L {(A[0] + B[0]) / 2} {(A[1] + B[1]) / 2} L {B[0]} {B[1]}")'
            frames = ' '.join(f'{t0 + (t1 - t0) * i / 8:.1f}% {{ d: {d(i / 8)} }}' for i in range(9))
            s += (f'@keyframes zr-line{look} {{ 0%, 17.8% {{ d: {mid} }} {frames} 49%, 100% {{ d: {mid} }} }}\n'
                  f'.zr{look} .zr-line {{ animation: zr-line{look} {L}s linear infinite; }}\n')
            for i in range(1, 7):
                at = t0 + (t1 - t0) * i / 7
                s += (f'@keyframes zr-spark{look}-{i} {{ 0%, {at - 0.1:.1f}% {{ opacity: 0; transform: translateY(0) scale(.4) }} {at:.1f}% {{ opacity: 1; transform: translateY(0) scale(1.2) }} '
                      f'{at + 14:.1f}% {{ opacity: 0; transform: translateY(16px) scale(.6) }} 100% {{ opacity: 0 }} }}\n'
                      f'.zr{look} .zr-spark{i} {{ animation: zr-spark{look}-{i} {L}s linear infinite; }}\n')
            s += (f'@keyframes zr-dust{look} {{ 0%, 48.9% {{ opacity: 0; transform: scale(.3) }} 49% {{ opacity: 1; transform: scale(.5) }} 58% {{ opacity: 0; transform: scale(1.4) }} 100% {{ opacity: 0 }} }}\n'
                  f'.zr{look} .zr-dust {{ animation: zr-dust{look} {L}s ease-out infinite; }}\n')
        else:
            s += f'.zr{look} .zr-spark, .zr{look} .zr-dust {{ display: none; }}\n'
    return s


# ---------------------------------------------------------------- the page
def img(key, cls):
    if key not in SHOTS:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(SHOTS[key]).decode()}" alt="{" ".join(key)}" class="{cls}">'


def live(svg_body, view, mode=None, cls='live'):
    m = f' data-mode="{mode}"' if mode else ''
    return f'<svg class="{cls}" viewBox="{view}" xmlns="http://www.w3.org/2000/svg"{m}>{svg_body}</svg>'


INK = '#1B1446'
NAMES = {
    'fairA': ('A. The big wheel', 'The big wheel turns, its cars staying upright (a Nibble rides in one); the helter-skelter\'s flag flutters; bunting flaps; balloons sway at a stall. In a run: all brighter, the wheel turns six times faster, the bunting flaps hard, balloons are let go one after another.'),
    'fairB': ('B. The carousel', 'The carousel\'s horses go up and down and its lights blink; two striped tents with flags; bunting; the balloon stall. In a run: brighter, the horses gallop, the lights flash, balloons are let go.'),
    'fairC': ('C. The boating lake', 'Swan boats bob on the lake along the bottom, little waves roll; the big wheel and the helter-skelter behind. In a run: brighter, the boats rock harder, the wheel spins faster. (The lake sits along the bottom row, under the board\'s own water.)'),
}
RIDES = [
    ('R0. Today\'s ride', 'As game.js draws it now: hangs from the reel, slides straight down, drops to the bank.'),
    ('R1. Swing and kick', 'Swings about the reel and kicks its feet, with speed lines behind; drops to the bank.'),
    ('R2. Swing, sag, sparkle, hop', 'R1, and the line sags under it, a sparkle is left at each column, a puff of dust and a little hop as it lets go.'),
    ('R3. R2 with a somersault', 'R2, but it somersaults off the end of the line and lands on its feet.'),
]
CARDS = [('zipA', 'A. Zip down the line!', 'Out along a ledge to its end under a block, a puzzled stop; the zip-line drops in whole (hook, line and peg), as the other cards\' gadgets do; it grabs its reel and zips over the water, swinging and kicking, then a hop and home. 6 s.'),
         ('zipB', 'B. Hook it high, peg it low!', 'The same, but the zip-line goes in as the child puts it in: the hook\'s square lights up and the hook drops in under the block; the low end lights up green, a dashed line stretches out to it, the peg drops in and the line turns solid. Then the ride. 7 s.')]
PARTIES = [('carousel', 'P1. The merry-go-round', 'A merry-go-round turns at home: the five Nibbles ride its horses round the front, up and down; music notes float up; the confetti falls as today.'),
           ('wheel', 'P2. The big wheel', 'The five Nibbles ride a big wheel in its cars, dancing; balloons are let go from the bottom; the confetti falls.')]

FAIR_BG = LIVE['back'].get('fairA', '')
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway step 18a: the fair, the zip ride, the zip-line's card and the party</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1400px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:19px;margin:26px 0 4px;border-top:2px solid {INK}22;padding-top:12px}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:12px}} img.pc{{width:560px}} img.phone{{width:440px}}
svg.live{{display:block;width:560px;max-width:100%;height:auto;border-radius:12px;background:#E7F6FC}} svg.card{{width:520px}} svg.ride{{width:620px}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}} .miss{{color:#c00}} p.what{{margin:2px 0 8px;max-width:900px}}
{GAME_MOVES}
{FAIR_CSS}
{zip_css()}
{LIVE["cardCss"]}
</style></head><body>
<h1>Hamster Highway step 18a: the fair by day, the zip ride, the zip-line's card and a fair party</h1>
<p class="stamp">mock_hamster_step18a.py 0.1 · 25 Nov · all Claude's, proposed, for your pick; nothing is built. The screenshots are drawn by the real game (a scratch copy with these mock-ups added) behind a stand-in board, not level 29; headless Chromium stands in for the phone and the PC. The moving pictures are drawn from the game's own art and moved here by CSS: in the game, game.js would switch the fair to "in a run" when GO is pressed and draw the ride frame by frame, as it does today.</p>
<p><b>Your picks:</b> 1. a fair look (A, B or C); 2. a zip ride (R0 to R3); 3. a card (A or B); 4. a party (P1 or P2). My recommendations are marked.</p>

<h2>1. The fair by day (levels 29 and 30)</h2>
<p class="what">Faded like the park's backdrops (its busy shapes at 40%), moving gently while the child builds; once GO is pressed, and at the party, it brightens (75%) and everything moves faster. Each live pair below: building on the left, in a run on the right.</p>
''' + ''.join(f'''<h3>{NAMES[k][0]}{' <span class="rec">recommended</span>' if k == 'fairA' else ''}</h3><p class="what">{NAMES[k][1]}</p>
<div class="row"><figure>{live(LIVE['back'].get(k, ''), '0 0 960 540')}<figcaption>live, building</figcaption></figure>
<figure>{live(LIVE['back'].get(k, ''), '0 0 960 540', 'run')}<figcaption>live, in a run</figcaption></figure></div>
<div class="row"><figure>{img((k, 'phone', 'build'), 'phone')}<figcaption>in the game: phone, 844 × 390, building</figcaption></figure>
<figure>{img((k, 'pc', 'build'), 'pc')}<figcaption>in the game: PC, 1366 × 650, building</figcaption></figure>
<figure>{img((k, 'pc', 'run'), 'pc')}<figcaption>in the game: PC, in a run</figcaption></figure></div>''' for k in LOOKS) + '''
<p><b>Why A:</b> the big wheel is the most "fair" thing to watch turn, and the helter-skelter is level 29's story (the zip-line hooks under its balcony). C's lake would sit under the board's own water and muddle it.</p>

<h2>2. The zip ride</h2>
<p class="what">Hamster 1 walks out, grabs its reel at the hook, zips down over the water at the game's speed (a column every 0.2 s), lets go and walks home. Looped.</p>
''' + ''.join(f'''<h3>{t}{' <span class="rec">recommended</span>' if i == 2 else ''}</h3><p class="what">{w}</p>{live(LIVE['ride'][i] if i < len(LIVE['ride']) else '', '0 0 720 300', None, 'live ride')}''' for i, (t, w) in enumerate(RIDES)) + '''
<p><b>Why R2:</b> the sag and sparkles make the line feel springy and fast, and the hop smooths today's little jump as it lets go. R3's somersault is the most fun once, but five hamsters somersaulting every run may get long.</p>

<h2>3. The zip-line's help card</h2>
''' + ''.join(f'''<h3>{t}{' <span class="rec">recommended</span>' if k == 'zipB' else ''}</h3><p class="what">{w}</p>{live(LIVE['card'].get(k, ''), '40 0 640 420', None, 'live card')}''' for k, t, w in CARDS) + '''
<p><b>Why B:</b> the zip-line is the first gadget put down in two taps; B shows those two taps (hook high, then peg low), which is the part a child can't guess.</p>

<h2>4. A fair party at home</h2>
''' + ''.join(f'''<h3>{t}{' <span class="rec">recommended</span>' if k == 'carousel' else ''}</h3><p class="what">{w}</p>{live('<svg viewBox="0 0 960 540" width="720" height="420" preserveAspectRatio="xMidYMax slice" data-mode="party">' + FAIR_BG + '</svg>' + LIVE['party'].get(k, ''), '0 0 720 420', None, 'live')}''' for k, t, w in PARTIES) + '''
<p><b>Why P1:</b> the riders keep passing, so it looks busy and happy for the whole party, and it reads at a glance as "the fair". (Levels 1 to 28 keep today's party.)</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
if FAULT == 3:
    page = page.replace('</figcaption>', '<svg></figcaption>', 1)
check(not re.search(r'https?://[a-z0-9.-]+\.[a-z]{2,}(?!/2000/svg)', page.replace('http://www.w3.org/2000/svg', ''), re.I), 'the page names no web address (but the svg namespace)')
check(page.count('<svg') == page.count('</svg>'), f'every svg closed ({page.count("<svg")} opened, {page.count("</svg>")} closed)')
open(OUT, 'w').write(page)

# ---------------------------------------------------------------- the page itself: every live picture moving, no errors
perr = []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    pg = br.new_page(viewport={'width': 1366, 'height': 900})
    pg.on('pageerror', lambda e: perr.append(str(e)))
    pg.goto('file://' + os.path.abspath(OUT))
    pg.wait_for_timeout(800)
    counts = pg.evaluate('() => [...document.querySelectorAll("svg.live")].map((s) => s.getAnimations ? document.getAnimations().filter((a) => s.contains(a.effect.target) && a.playState === "running").length : 0)')
    check(len(counts) == 14 and all(c > 0 for c in counts), f'every live picture on the page moving (14 pictures: {counts})')
    pg.screenshot(path=OUT.replace('.html', '-page.png'), full_page=True)
    br.close()
check(not perr, f'the page logged no errors ({perr[:2]})')
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
