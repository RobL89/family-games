"""Hamster Highway feedback item 4 (D-209): quieter looks for the climbing frame's backdrop, mock-ups for Rob to pick
from before building (project rules), version 0.1 (22 Nov).

Rob on preview 20: the frame's colours stand out too much behind the floors the hamsters walk on, so it is less
obvious that they don't walk on the frame. Three quieter looks (mock_hamster_frame_quiet.js 0.1: Q1 faded, Q2 soft,
Q3 far) and the frame as built now, each drawn by the real game on the real levels mid-run: level 23 (L12) on a phone
held sideways (844 x 390, touch) and level 24 (L12b) in a PC window (1366 x 650), with each level's answer from
test_hamster_highway_core.py 1.17's SOL put down by taps and GO pressed. A scratch worktree of HEAD gets the looks
appended to its art.js; the repo itself is not changed. Headless Chromium stands in for the phone and the PC.

Also a contrast table: how far the frame's bars and outlines stand off the sky behind them (WCAG contrast ratio,
1 = invisible), beside the floors' blocks, from the colours and opacities the looks use.

Checks (exit 1 if one fails): every look drawn on both devices; the answer gets the hamsters out (the run started);
eight screenshots, none blank; the four looks four different drawings; each quieter look's bars stand off the sky less than now; the page names no web
address; the game logged no errors. --fault N plants a fault the checks must catch (1: a web address in the page;
2: a screenshot left out; 3: look Q2 drawn as the frame now; 4: look Q1 at full opacity).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step17b.py OUT.html [--fault N]
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
OUT = args[0] if args else '/tmp/hamster-step17b-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


# the levels' answers, copied from test_hamster_highway_core.py 1.17's SOL (8ff1fe6)
ANSWER = {'L12': [('bouncer', 3, 7), ('bouncer', 4, 4), ('signpost', 12, 4)],
          'L12b': [('signpost', 8, 7), ('bouncer', 3, 7), ('bouncer', 2, 4), ('signpost', 0, 4)]}
LOOKS = ['frame', 'frameQ1', 'frameQ2', 'frameQ3']
WT = '/tmp/hh-step17b-mockwt'
SERVE = '/tmp/hh-step17b-serve'
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    art = os.path.join(gdir, 'art.js')
    src = open(art).read()
    for old, new in [
        ("export function backdrop(name, w = W) {\n",
         "export function backdrop(name, w = W) {\n  if (name.startsWith('frameQ')) return g({ frameQ1, frameQ2, frameQ3 }[name](w), '', ` data-back=\"${name}\"`);\n"),
        ("export const backHeight = (name) => (name === 'pond' || name === 'frame' ||",
         "export const backHeight = (name) => (name === 'pond' || name.startsWith('frame') ||"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    mock = open(os.path.join(HERE, 'mock_hamster_frame_quiet.js')).read()
    if FAULT == 3:
        mock = mock.replace("const frameQ2 = (w) => frameQuiet(w, 'Q2');", "const frameQ2 = (w) => frameArt(w);")
    if FAULT == 4:
        mock = mock.replace("""g(frameQShapes(x, k, FQ_NOW), '', ' opacity="0.4"')""", "frameQShapes(x, k, FQ_NOW)").replace('Q1: [SUN, INK, 0.92 * 0.4]', 'Q1: [SUN, INK, 0.92]')
    src += '\n' + mock
    open(art, 'w').write(src)
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
    JS = r'''
const [artUrl, lvUrl] = process.argv.slice(1);
const A = await import(artUrl);
const { LEVELS } = await import(lvUrl);
const defs = Object.fromEntries(LEVELS.filter((d) => d.id === 'L12' || d.id === 'L12b').map((d) => [d.id, d]));
console.log(JSON.stringify({ defs, colours: A.FRAME_QUIET_COLOURS }));
'''
    r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + art, 'file://' + os.path.join(gdir, 'levels.js')], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    D = json.loads(r.stdout)
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)


# ---------------------------------------------------------------- the contrast table (WCAG 2 relative luminance)
def lum(hexc):
    v = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in v]
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]


def over(fg, bg, a):
    f = [int(fg[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(bg[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(a * x + (1 - a) * y):02X}' for x, y in zip(f, b))


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


SKY = '#DBF1FB'   # pondSky's third band (rows 192 to 288), behind the monkey bars and the towers' tops
CON = {}
for look, (bar, outline, a) in D['colours'].items():
    CON[look] = (ratio(over(bar, SKY, a), SKY), ratio(over(outline, SKY, a), SKY) if outline else None)
BLOCK = (ratio('#E2A867', SKY), ratio('#1B1446', SKY))   # art.js block(): its fill and its ink outline, at full strength
for q in ('Q1', 'Q2', 'Q3'):
    check(CON[q][0] < CON['now'][0] and (CON[q][1] or 1) < CON['now'][1],
          f'look {q}: its bars ({CON[q][0]:.2f}) and outlines ({(CON[q][1] or 1):.2f}) stand off the sky less than now ({CON["now"][0]:.2f}, {CON["now"][1]:.2f})')


# ---------------------------------------------------------------- the screenshots, in the real game
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
SHOTS = {}
DRAWN = {}   # each look's drawing (the backdrop's svg), to check the looks really differ
errors = []


def tap(pg, sel, touch):
    b = pg.locator(sel).first.bounding_box()
    (pg.touchscreen.tap if touch else pg.mouse.click)(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def place(pg, kind, c, r, touch):   # as test_hamster_highway_e2e.py 1.14's place(): pick the slot, slide the window, tap the square
    if pg.evaluate('__test.state().selected') != kind:
        tap(pg, f'[data-slot="{kind}"]', touch)
    bw = float(pg.evaluate('document.querySelector("#window rect").getAttribute("width")'))
    while True:
        v = pg.evaluate('__test.view()')
        x = (c + 0.5) * 60 - v['x']
        if 40 < x < bw - 40 or (x <= 40 and v['x'] <= 0) or (x >= bw - 40 and v['x'] >= v['max']):
            break
        tap(pg, '[data-btn="panR"]' if x >= bw - 40 else '[data-btn="panL"]', touch)
        pg.wait_for_timeout(450)
    p = pg.evaluate(f'__test.cellPoint({c}, {r})')
    (pg.touchscreen.tap if touch else pg.mouse.click)(p['x'], p['y'])


from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for dev, (w, h, touch, lv, wait) in {'phone': (844, 390, True, 'L12', 4200), 'pc': (1366, 650, False, 'L12b', 5200)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
        for look in LOOKS:
            pg.evaluate('(d) => __test.openBoard(d)', dict(D['defs'][lv], back=look))
            pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
            pg.wait_for_timeout(300)
            if pg.evaluate('__test.state().card'):
                tap(pg, '#card [data-btn="cardok"]', touch)
                pg.wait_for_function('__test.state().card === null')
            check(pg.evaluate(f'() => !!document.querySelector(\'[data-back="{look}"]\')'), f'{look} drawn on the {dev} ({lv})')
            DRAWN[(look, dev)] = pg.evaluate(f'() => (document.querySelector(\'[data-back="{look}"]\') || {{}}).innerHTML || ""')
            for kind, c, r in ANSWER[lv]:
                place(pg, kind, c, r, touch)
            pg.evaluate('__test.speed(1)')
            tap(pg, '[data-btn="go"]', touch)
            pg.wait_for_timeout(wait)
            check(pg.evaluate('__test.state().mode') != 'build', f'{look} on the {dev}: the run started')
            SHOTS[(look, dev)] = pg.screenshot()
        ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
for dev in ('phone', 'pc'):
    check(len({DRAWN.get((k, dev)) for k in LOOKS}) == len(LOOKS), f'the four looks are four different drawings on the {dev}')
if FAULT == 2:
    del SHOTS[('frameQ2', 'pc')]
check(len(SHOTS) == 8 and all(len(v) > 20000 for v in SHOTS.values()), f'eight screenshots, none blank ({len(SHOTS)}: {sorted(len(v) for v in SHOTS.values())} bytes)')


def img(look, dev):
    if (look, dev) not in SHOTS:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/png;base64,{base64.b64encode(SHOTS[(look, dev)]).decode()}" alt="{look}, {dev}" class="{dev}">'


NAMES = {'frame': ('Now', 'as built (D-208): full red and yellow with dark outlines, like everything a hamster can walk on', 'now'),
         'frameQ1': ('Q1. Faded', 'the same frame at 40%: shapes, colours and dark outlines kept, just see-through', 'Q1'),
         'frameQ2': ('Q2. Soft', 'pastel pink and cream, the dark outlines swapped for thin soft ones, at 75%: still a bright frame, but plainly scenery', 'Q2'),
         'frameQ3': ('Q3. Far', 'two-thirds the size, standing back on the hill behind the bushes, pastel with no outlines and hazed blue; the robin and ladybird move onto the bushes', 'Q3')}
REC = ' <span class="rec">recommended</span>'
INK = '#1B1446'
FONT = 'system-ui, sans-serif'


def con(k):
    b, o = CON[k]
    return f'bars {b:.2f}, outlines {o:.2f}' if o else f'bars {b:.2f}, no outlines'


page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: a quieter climbing frame</title><style>
body{{font:16px/1.45 {FONT};color:{INK};background:#FFF8EE;margin:0;padding:16px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:19px;margin:28px 0 6px}} h3{{font-size:16px;margin:16px 0 6px}}
.row{{display:flex;flex-wrap:wrap;gap:14px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:12px}} img.pc{{width:620px}} img.phone{{width:520px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}} .miss{{color:#c00}}
</style></head><body>
<h1>Hamster Highway: a quieter climbing frame (levels 23 and 24)</h1>
<p class="stamp">mock_hamster_step17b.py 0.1 · 22 Nov · feedback item 4 · drawn by the real game, mid-run, with each level's answer put down; nothing here is built yet. Headless Chromium stands in for the phone and the PC.</p>
<p>You said the frame's colours compete with the floors the hamsters walk on. The floors stay exactly as they are; only the frame behind them changes. Level 23 on a phone held sideways, level 24 in a PC window.</p>
''' + ''.join(f'''<h2>{NAMES[k][0]}{REC if k == 'frameQ2' else ''}</h2><p>{NAMES[k][1]}.</p>
<div class="row"><figure>{img(k, 'phone')}<figcaption>level 23, phone 844 × 390</figcaption></figure><figure>{img(k, 'pc')}<figcaption>level 24, PC 1366 × 650</figcaption></figure></div>''' for k in LOOKS) + f'''
<h2>How much each stands out</h2>
<p>Contrast against the sky behind it, in lightness only (the WCAG ratio: 1 means it vanishes into the sky, higher stands out more), worked out from each look's colours and opacity. It doesn't count how strong a colour is, so the bright yellow bars score low even now: the dark outlines are what the numbers catch. The floors' blocks are the reference: what the hamsters walk on.</p>
<table><tr><th>Look</th><th>Frame against the sky</th></tr>
{''.join(f'<tr><td>{NAMES[k][0]}</td><td>{con(NAMES[k][2])}</td></tr>' for k in LOOKS)}
<tr><td><b>Floors (blocks)</b></td><td>fill {BLOCK[0]:.2f}, outlines {BLOCK[1]:.2f}</td></tr></table>
<h2>What I'd pick</h2>
<p><b>Q2, Soft.</b> In the game, everything the hamsters can walk on or touch has a dark outline; the frame has the same outlines and the same warm yellow as the floors, which is what pulls the eye. Q2 drops both and keeps the frame bright and cheerful. Q1 is the smallest change but leaves grey outlines; Q3 is the calmest but the frame becomes a small thing in the distance.</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
