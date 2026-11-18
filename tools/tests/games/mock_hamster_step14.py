"""Hamster Highway step 14: mock-ups for Rob to pick from before building (project rules), version 0.1 (18 Nov).

1. The park picker (D-187, the park look B of D-189): three ways to get from the house and garden to the park and
   back, drawn as phone-sideways screens (844 x 390) with the game's own art (house.js 1.7's houseScene, and the park
   from sketch_hamster_park.py 0.2, look B).
2. The duck pond's backdrop (levels 21 and 22): three looks (mock_hamster_pond_backdrops.js 0.1), each drawn by the
   real game behind a stand-in 9 x 16 board (not level 21's layout), screenshot on a phone held sideways (844 x 390,
   touch) and a PC window (1366 x 650). A scratch worktree of HEAD gets the three looks appended to its art.js, and
   game.js draws a pond backdrop at its own 540 height; the repo itself is not changed. Headless Chromium stands in
   for the phone and the PC.

Checks (exit 1 if one fails): every screenshot made and not blank; the page names no web address; every svg closed;
the game logged no errors. --fault N plants a fault the checks must catch (1: a web address in the page; 2: a
screenshot left out; 3: an svg left open).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step14.py OUT.html [--fault N]
"""
import base64, functools, http.server, json, os, re, shutil, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-step14-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


# ---------------------------------------------------------------- 1. the picker, drawn
saved = sys.argv
sys.argv = [saved[0], '/tmp/hamster-park-sketch-unused.html']
sys.path.insert(0, HERE)
class _Mod:   # the sketch script's globals, so its functions can be called and its marker() swapped
    def __init__(self, ns):
        object.__setattr__(self, 'ns', ns)

    def __getattr__(self, k):
        return self.ns[k]

    def __setattr__(self, k, v):
        self.ns[k] = v


_ns = {'__file__': os.path.join(HERE, 'sketch_hamster_park.py'), '__name__': 'sketch_hamster_park'}
try:   # it builds its own page to the unused path, runs its own checks, then exits
    exec(compile(open(_ns['__file__']).read(), _ns['__file__'], 'exec'), _ns)
except SystemExit as e:
    if e.code:
        sys.exit('sketch_hamster_park.py 0.2 failed its own checks')
P = _Mod(_ns)
sys.argv = saved

JS = r'''
const [houseUrl, levelsUrl, artUrl] = process.argv.slice(1);
const H = await import(houseUrl);
const L = await import(levelsUrl);
const A = await import(artUrl);
const levels = L.LEVELS.map((l) => ({ spot: l.spot, open: true, done: true, seed: false }));
const out = { house: H.houseScene({ levels, current: levels.length - 1 }), token: H.tokenAt(L.LEVELS[L.LEVELS.length - 1].spot),
  hbtn: A.houseButton(0, 0, 30), ham: A.hamster('walk1'), zip: A.hamster('zip'), W: H.HOUSE_W, H: H.HOUSE_H };
console.log(JSON.stringify(out));
'''
GAME = os.path.join(REPO, 'games', 'hamster-highway')
r = subprocess.run(['node', '--input-type=module', '-e', JS] + ['file://' + os.path.join(GAME, f) for f in ('house.js', 'levels.js', 'art.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
HS = json.loads(r.stdout)
INK, SUN, CORAL, CREAM, BROWN, MUTED, TWIG, PINK = P.INK, P.SUN, P.CORAL, P.CREAM, P.BROWN, P.MUTED, P.TWIG, P.PINK
SCR_W, SCR_H = 844, 390
K = SCR_H / 900            # the picker fills the screen's height, as game.js's sizeHouse does
VIEW = SCR_W / K           # units of picture across the screen


def soft_marker(x, y, n, current=False, built=True):
    if not built:
        return P.circ(x, y, 24, 'rgba(255,248,238,0.5)', 3, BROWN, ' stroke-dasharray="6 6" stroke-opacity="0.4"')
    s = ''
    if current:
        s += P.circ(x, y, 38, 'none', 5, SUN, ' opacity="0.55"')
    s += P.circ(x, y, 28, CREAM, 3, BROWN, ' stroke-opacity="0.55"') + P.txt(x, y + 9, str(n), 24, MUTED)
    if current:
        s += P.ham(x, y - 30, 'walk1', 0.32)
    return s


def park_svg_inner(current=21, ride=None):
    # the step 12 park (look B), with only 21 and 22 built: 23 to 30 soft, as the house shows places with no level yet
    P.marker = lambda x, y, n, cur: soft_marker(x, y, n, n == current, n <= 22)
    svg = P.park('B')
    inner = svg[svg.index('>') + 1:svg.rindex('</svg>')]
    zx, zy = 400, 270 + (400 - 262) * 370 / 298   # the sketch's own hamster on the line, taken off (the token sits at a stop)
    sk = P.rect(zx - 14, zy - 8, 28, 18, PINK, 3, 2.4) + P.ham(zx + 2, zy + 54, 'fall', P.SC)
    assert inner.count(sk) == 1
    inner = inner.replace(sk, '')
    if ride is not None:   # the hamster part-way down the zip-line, under its reel, with motion lines
        x0, y0, x1, y1 = 262, 270, 560, 640
        x, y = x0 + (x1 - x0) * ride, y0 + (y1 - y0) * ride
        inner += P.rect(x - 14, y - 8, 28, 18, PINK, 3, 2.4) + P.place(HS['zip'], x + 2, y + 50, 0.56)
        inner += ''.join(P.line(x - 40 - 16 * k, y - 50 - 20 * k + 30, x - 70 - 16 * k, y - 87 - 20 * k + 30, INK, 3, ' opacity="0.35"') for k in range(3))
    return inner


def screen(inner, x0, extra='', label=''):
    # one phone-sideways screen showing the picture from x0, with buttons (extra) in screen units on top
    pic = f'<svg x="0" y="0" width="{SCR_W}" height="{SCR_H}" viewBox="{x0:.0f} 0 {VIEW:.0f} 900">{inner}</svg>'
    return (f'<svg viewBox="0 0 {SCR_W} {SCR_H}" width="{SCR_W}" class="phone" role="img" aria-label="{label}">'
            f'<rect x="0" y="0" width="{SCR_W}" height="{SCR_H}" fill="#FFF8EE"/>{pic}{extra}'
            f'<rect x="1.5" y="1.5" width="{SCR_W - 3}" height="{SCR_H - 3}" rx="18" fill="none" stroke="{INK}" stroke-width="3"/></svg>')


def zip_from_house():
    # the zip-line's start at the treehouse, a new glowing stop 21 beside it, the line running off to the right
    s = P.line(2392, 330, 2440, 370, TWIG, 4) + P.rect(2380, 352, 20, 16, PINK, 3, 2.4)
    return s + P.circ(2380, 180, 38, 'none', 5, SUN, ' opacity="0.55"') + P.circ(2380, 180, 28, CREAM, 3, BROWN, ' stroke-opacity="0.55"') + P.txt(2380, 189, '21', 22, MUTED)


def hbtn(x, y, sc=1.0):
    return P.place(HS['hbtn'], x, y, sc)


def bubble(x, y, s, w=None):
    w = w or 14 + 9.2 * len(s)
    return P.rect(x, y, w, 30, 'rgba(255,255,255,0.92)', 10, 2) + P.txt(x + w / 2, y + 21, s, 15)


def park_btn(x, y, locked=False):
    # a round button with a little tree and fence: the park (option C's tab)
    s = P.circ(x, y, 30, CREAM, 3) + P.rect(x - 3, y - 2, 6, 16, TWIG, 2, 2) + P.circ(x, y - 8, 12, '#7DC95E', 2.4)
    s += ''.join(P.line(x + dx, y + 16, x + dx, y + 4, BROWN, 2.4) for dx in (-16, -10, 10, 16))
    return f'<g{" opacity=\"0.4\"" if locked else ""}>{s}</g>'


house_inner = HS['house'] + HS['token']
park_A = park_svg_inner(21)
house_end = HS['W'] - VIEW

A1 = screen(house_inner + zip_from_house(), house_end, bubble(400, 14, 'Level 20 done: a new stop by the treehouse'), 'A1')
A2 = screen(park_svg_inner(0, ride=0.55), 0, bubble(470, 14, 'Tap 21: whee! the ride (≈2 s)'), 'A2')
A3 = screen(park_A, 0, hbtn(46, 46) + bubble(90, 14, 'The park: 21 and 22 at the pond; house button back'), 'A3')
# B: one long picture, the park joined on after the garden (its own copy of the garden's corner left off)
cut = 300
park_B = f'<g transform="translate({HS["W"] - cut} 0)"><svg x="{cut}" y="0" width="2420" height="900" viewBox="{cut} 0 2420 900" overflow="hidden">{park_svg_inner(21)}</svg></g>'
join_line = P.line(2392, 360, HS['W'] - cut + 560, 640, TWIG, 4) + P.rect(2380, 352, 20, 16, PINK, 3, 2.4)
B_inner = house_inner + park_B.replace(f'<svg x="{cut}"', f'<svg x="{cut}"') + join_line
B1 = screen(B_inner, HS['W'] - VIEW / 2 - 200, bubble(330, 14, 'One long picture: scroll on over the fence'), 'B1')
whole_w = 2 * HS['W'] - cut
B2 = (f'<svg viewBox="0 0 {SCR_W} {SCR_H}" width="{SCR_W}" class="phone" role="img" aria-label="B2"><rect width="{SCR_W}" height="{SCR_H}" fill="#FFF8EE"/>'
      f'<svg x="0" y="{(SCR_H - SCR_W * 900 / whole_w) / 2:.0f}" width="{SCR_W}" height="{SCR_W * 900 / whole_w:.0f}" viewBox="0 0 {whole_w} 900">{B_inner}</svg>'
      + bubble(250, 14, 'The whole picture, house then park') + f'<rect x="1.5" y="1.5" width="{SCR_W - 3}" height="{SCR_H - 3}" rx="18" fill="none" stroke="{INK}" stroke-width="3"/></svg>')
C1 = screen(house_inner, house_end, P.circ(SCR_W - 120, 46, 36, 'none', 5, SUN, ' opacity="0.55"') + hbtn(SCR_W - 120, 46) + park_btn(SCR_W - 46, 46)
            + bubble(320, 14, 'Two buttons: the house, the park'), 'C1')
C2 = screen(park_A, 0, hbtn(SCR_W - 120, 46) + P.circ(SCR_W - 46, 46, 36, 'none', 5, SUN, ' opacity="0.55"') + park_btn(SCR_W - 46, 46)
            + bubble(330, 14, 'No ride: the park opens at once'), 'C2')

# ---------------------------------------------------------------- 2. the pond, in the real game
WT = '/tmp/hh-step14-mockwt'
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
try:
    art = os.path.join(WT, 'games', 'hamster-highway', 'art.js')
    src = open(art).read()
    old = "export function backdrop(name, w = W) {\n"
    assert src.count(old) == 1
    src = src.replace(old, old + "  if (name.startsWith('pond')) return g({ pondA, pondB, pondC }[name](w), '', ` data-back=\"${name}\"`);\n")
    src += '\n' + open(os.path.join(HERE, 'mock_hamster_pond_backdrops.js')).read()
    open(art, 'w').write(src)
    gj = os.path.join(WT, 'games', 'hamster-highway', 'game.js')
    gsrc = open(gj).read()
    old = "  let bg = BH === 420 ? backdrop("
    assert gsrc.count(old) == 1
    gsrc = gsrc.replace(old, "  let bg = def.back.startsWith('pond') ? backdrop(def.back, lv.cols * CELL) : BH === 420 ? backdrop(")
    open(gj, 'w').write(gsrc)
    os.makedirs('/tmp/hh-step14-serve', exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', '/tmp/hh-step14-serve/mock.html'], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory='/tmp/hh-step14-serve'))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
BOARD = {'id': 'pondmock', 'name': 'Pond mock-up', 'room': 'garden', 'spot': 'sink', 'new': None,
         'rows': ['................', '................', '................', '................', '................',
                  'S..............G', '######...#######', '######...#######', '######...#######'],
         'tray': {'bridge': 3, 'bouncer': 1, 'floater': 1}}
SHOTS = {}
errors = []
from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for dev, (w, h, touch) in {'phone': (844, 390, True), 'pc': (1366, 650, False)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
        for look in 'ABC':
            pg.evaluate('(d) => __test.openBoard(d)', dict(BOARD, back='pond' + look))
            pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
            pg.wait_for_timeout(400)
            SHOTS[(look, dev)] = pg.screenshot()
        ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 2:
    del SHOTS[('B', 'pc')]
check(len(SHOTS) == 6 and all(len(v) > 20000 for v in SHOTS.values()), f'six screenshots, none blank ({len(SHOTS)}: {sorted(len(v) for v in SHOTS.values())} bytes)')


def img(look, dev):
    if (look, dev) not in SHOTS:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/png;base64,{base64.b64encode(SHOTS[(look, dev)]).decode()}" alt="Pond look {look}, {dev}" class="{dev}">'


NAMES = {'A': 'A willow and reeds: a big willow whose fronds sway, bulrushes, lily pads and a frog, a dragonfly',
         'B': 'A jetty and a duck house: green hills, a wooden jetty, a duck peeking from its house on a post, a paper boat',
         'C': 'A footbridge and a fountain: trees, a red arched footbridge far off, a fountain that twinkles, a duck and three ducklings'}
FONT = 'system-ui, sans-serif'
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway step 14 mock-ups</title><style>
body{{font:16px/1.45 {FONT};color:{INK};background:#FFF8EE;margin:0;padding:16px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:19px;margin:28px 0 6px}} h3{{font-size:16px;margin:16px 0 6px}}
.row{{display:flex;flex-wrap:wrap;gap:14px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} svg.phone,img{{max-width:100%;height:auto;display:block;border-radius:12px}} img.pc{{width:620px}} img.phone{{width:520px}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}} .miss{{color:#c00}}
</style></head><body>
<h1>Hamster Highway step 14: mock-ups to pick from</h1>
<p class="stamp">mock_hamster_step14.py 0.1 · 18 Nov · drawn with the game's own art; nothing here is built yet. Headless Chromium stands in for the phone and the PC.</p>
<h2>1. Getting to the park (the picker)</h2>
<p>The park is look B (D-189), with 21 and 22 at the duck pond; 23 to 30 show softly until they're built, as the house does today. Each picture is a phone held sideways.</p>
<h3>A. Its own scene, with the zip-line ride <span class="rec">recommended</span></h3>
<p>When level 20 is done, a new stop 21 glows by the treehouse. Tapping it plays the ride over the fence, then the park opens. In the park, the house button (top left) goes back to the garden. The house view for levels 1 to 20 stays as it is. Play opens wherever the next level is.</p>
<div class="row"><figure>{A1}<figcaption>A1 the house, after level 20</figcaption></figure><figure>{A2}<figcaption>A2 the ride</figcaption></figure><figure>{A3}<figcaption>A3 the park</figcaption></figure></div>
<h3>B. One long picture</h3>
<p>The park joins on after the garden, so the child scrolls on over the fence; the zip-line is drawn across the join. No separate ride; the whole picture is twice as long to scroll on the phone.</p>
<div class="row"><figure>{B1}<figcaption>B1 at the fence</figcaption></figure><figure>{B2}<figcaption>B2 the whole picture, small</figcaption></figure></div>
<h3>C. Two buttons, house and park</h3>
<p>Two scenes, with two round buttons at the top right to switch (the park's greyed until level 20 is done). The ride plays only the first time.</p>
<div class="row"><figure>{C1}<figcaption>C1 the house</figcaption></figure><figure>{C2}<figcaption>C2 the park</figcaption></figure></div>
<h2>2. The duck pond's backdrop</h2>
<p>Drawn by the real game behind a <b>stand-in board</b> (two banks and a three-square pond, 9 rows, 16 across; not level 21's layout, which comes next). The bottom row's water and the blocks are the game's own. Phone held sideways first, then a PC window.</p>
''' + ''.join(f'''<h3>{k}. {NAMES[k]}{' <span class="rec">recommended</span>' if k == 'A' else ''}</h3>
<div class="row"><figure>{img(k, 'phone')}<figcaption>{k} phone, 844 × 390</figcaption></figure><figure>{img(k, 'pc')}<figcaption>{k} PC, 1366 × 650</figcaption></figure></div>''' for k in 'ABC') + '''
<h2>What I'd pick</h2>
<p><b>Picker A:</b> the ride is the treat for finishing level 20, the house view stays exactly as the children know it, and the park scrolls no further than the house does. <b>Pond A:</b> the willow is the tallest, clearest shape behind a tall board, and plan level 22's high road runs along its branch.</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
if FAULT == 3:
    assert '</svg><figcaption>' in page
    page = page.replace('</svg><figcaption>', '<figcaption>', 1)
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page.replace('url(#', ''), 'the page names no web address')
check(page.count('<svg') == page.count('</svg>'), f'every svg closed ({page.count("<svg")} opened, {page.count("</svg>")} closed)')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
