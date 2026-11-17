"""Hamster Highway's step 13 spike in a browser: the 9-row test board, hamsters both ways and placing zip-lines, and
the preview's tap counter. Version 1.0 (17 Nov, step 13; D-185, D-190, D-196; assessment-tall-boards-signpost.md 0.2).

Written before game.js 1.10 and the preview's test panel (preview_debug_hamster_highway.js 1.0). It builds the preview
with its test panel (build_preview.py --debug, into the output folder), serves it on 127.0.0.1 and checks, as Rob
would use it on the phone (844 x 390, touch) and the PC (1366 x 768, mouse):
  - the title screen has a "Test board" button that opens the 16 x 9 test board (no help card; nothing saved);
  - the window is the level's own: 16 x 9 squares (960 x 540 units) for the test board, so 43.3 px squares on the
    phone's 390 px height (assessment 0.2's figure), and 12 x 7 still for level 1;
  - placing by touch: a wrong tap is counted; the ten marked gadgets each go down on their marked square, counted;
  - the zip-line by touch (D-196): pick it, tap a high end: it is held and the low ends it can reach glow, as many as
    core.js's zipLows() says; tap a glowing end: placed as a pair, the tray's zip-line used; tap either end: both
    gone, back in the tray; a tap on a square that doesn't glow cancels the first end, counted; five zip-lines, the
    first four taken back as the panel asks, the fifth left for the road;
  - GO: all five home; walkers drawn facing left at some point, and hanging from a reel on the zip-line;
  - the panel's results: the counts above, the screen's size and the square's size in px;
  - on the PC: the ghost line follows the mouse from a held high end, green over a good low end, grey elsewhere;
  - no script errors, nothing fetched beyond the page, no sideways scrolling.
Headless Chromium stands in for the phone and the PC.

Usage, from the repo root:
    python3 -B tools/tests/games/test_hamster_highway_spike_e2e.py [OUT_DIR]
Exits 1 if a check fails.
"""
import functools, http.server, json, os, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-highway-spike-e2e'
os.makedirs(OUT, exist_ok=True)
problems = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


sys.path.insert(0, HERE)
import build_preview  # noqa: E402

try:
    html, _, stamp = build_preview.build('hamster-highway', 'spike', debug=True)
except build_preview.BuildError as e:
    check(False, f'the preview builds with its test panel ({e})')
    print(f'{len(problems)} problem(s)')
    sys.exit(1)
with open(os.path.join(OUT, 'spike.html'), 'w', encoding='utf-8', newline='') as f:
    f.write(html)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=OUT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/spike.html'

# the test board, its marked gadgets and zip-lines, as the panel holds them (read from the page, below), and
# core.js's own zipLows() for the glows
LOWS_JS = r'''
const [coreUrl, defJson, placedJson, hc, hr] = process.argv.slice(1);
const core = await import(coreUrl);
console.log(JSON.stringify(core.zipLows(core.parseLevel(JSON.parse(defJson)), JSON.parse(placedJson), Number(hc), Number(hr))));
'''


def lows(defn, placed, hc, hr):
    r = subprocess.run(['node', '--input-type=module', '-e', LOWS_JS, 'file://' + os.path.join(REPO, 'games', 'hamster-highway', 'core.js'),
                        json.dumps(defn), json.dumps(placed), str(hc), str(hr)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


from playwright.sync_api import sync_playwright  # noqa: E402


def state(pg):
    return pg.evaluate('__test.state()')


def spike(pg):
    return pg.evaluate('__spike.state()')


def tap(pg, sel, touch=False):
    b = pg.locator(sel).first.bounding_box()
    (pg.touchscreen.tap if touch else pg.mouse.click)(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)
    pg.wait_for_timeout(60)


def cell(pg, c, r, touch=False):
    p = pg.evaluate(f'__test.cellPoint({c}, {r})')
    (pg.touchscreen.tap if touch else pg.mouse.click)(p['x'], p['y'])
    pg.wait_for_timeout(60)


def open_page(br, w, h, touch):
    ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch)
    pg = ctx.new_page()
    errors, asked = [], []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
    pg.on('request', lambda r: asked.append(r.url))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready && window.__spike !== undefined', timeout=10000)
    return ctx, pg, errors, asked


def open_board(pg, touch):
    tap(pg, '#spike-open', touch)
    pg.wait_for_function('__test.state().screen === "level" && __test.state().level === "spike"', timeout=5000)
    pg.wait_for_timeout(100)


def window_of(pg):
    return pg.evaluate('''(() => { const b = document.getElementById('board'); const r = document.querySelector('#window rect');
      const box = b.getBoundingClientRect(); const vb = b.getAttribute('viewBox').split(' ').map(Number);
      return { viewBox: vb, clip: [Number(r.getAttribute('width')), Number(r.getAttribute('height'))], square: box.height / vb[3] * 60 }; })()''')


def finish(pg, tag, errors, asked):
    check(not errors, f'{tag}: no script errors {errors[:2]}')
    others = [u for u in asked if u != URL and not u.startswith('data:')]
    check(not others, f'{tag}: nothing fetched beyond the page {others[:3]}')
    check(not pg.evaluate('document.scrollingElement.scrollWidth > innerWidth'), f'{tag}: no sideways scrolling of the page')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------------------------------------------------------------- the phone, held sideways, by touch
    ctx, pg, errors, asked = open_page(br, 844, 390, True)
    tag = 'phone 844x390'
    check(pg.locator('#spike-open').is_visible(), f'{tag}: the title screen has the test board button')
    open_board(pg, True)
    s, sp = state(pg), spike(pg)
    DEF, GADS, ZIPS = sp['board'], sp['gadgets'], sp['zips']
    win = window_of(pg)
    check(s['card'] is None and s['layout'] == 'side' and win['viewBox'] == [0, 0, 1090, 540] and win['clip'] == [960, 540],
          f'{tag}: the test board opens with no card, its window 16 x 9 squares (960 x 540) and the tray beside it ({s["card"]}, {s["layout"]}, {win})')
    check(abs(win['square'] - 43.33) < 0.6, f'{tag}: a square is {win["square"]:.1f} px on the phone (assessment 0.2: 43.3)')
    check(len(GADS) == 10 and len(ZIPS) == 5 and sp['phase'] == 'gadgets' and sp['target'] == GADS[0],
          f'{tag}: the panel marks 10 gadgets, then 5 zip-lines, the first gadget first ({len(GADS)}, {len(ZIPS)}, {sp["phase"]})')
    pg.screenshot(path=os.path.join(OUT, 'phone-start.png'))
    # a wrong tap, then the ten gadgets by touch: tap its slot, tap its marked square
    cell(pg, 0, 0, True)
    check(spike(pg)['gadgetWrong'] == 1 and state(pg)['placed'] == {}, f'{tag}: a tap off the marked square is counted wrong ({spike(pg)["gadgetWrong"]})')
    for kind, c, r in [(g['kind'], g['c'], g['r']) for g in GADS]:
        if state(pg)['selected'] != kind:
            tap(pg, f'[data-slot="{kind}"]', True)
        cell(pg, c, r, True)
    s, sp = state(pg), spike(pg)
    want = {f'{g["c"]},{g["r"]}': g['kind'] for g in GADS}
    check(s['placed'] == want and sp['gadgetHits'] == 10 and sp['gadgetWrong'] == 1 and sp['phase'] == 'zips',
          f'{tag}: all ten gadgets down on their marked squares, 10 right and 1 wrong tap counted, on to the zip-lines ({sp["gadgetHits"]}, {sp["gadgetWrong"]}, {sp["phase"]})')
    pg.screenshot(path=os.path.join(OUT, 'phone-gadgets.png'))
    # the five zip-lines
    for i, z in enumerate(ZIPS):
        (hc, hr), (lc, lr) = z['high'], z['low']
        if state(pg)['selected'] != 'zip':
            tap(pg, '[data-slot="zip"]', True)
        if i == 0:
            check(pg.locator('#fits [data-high]').count() > 0 and pg.locator('#fits [data-low]').count() == 0,
                  f'{tag}: picked from the tray, the zip-line\'s high ends glow ({pg.locator("#fits [data-high]").count()})')
        cell(pg, hc, hr, True)
        if i == 1:   # a tap on a square that doesn't glow cancels the first end
            cell(pg, 0, 0, True)
            s, sp = state(pg), spike(pg)
            check(s['zipFrom'] is None and s['placed'] == want and sp['zipCancelled'] == 1 and sp['zipWrong'] == 1,
                  f'{tag}: a tap on a square that doesn\'t glow lets go of the first end, counted as a wrong tap and a line cancelled ({s["zipFrom"]}, {sp["zipCancelled"]}, {sp["zipWrong"]})')
            if state(pg)['selected'] != 'zip':
                tap(pg, '[data-slot="zip"]', True)
            cell(pg, hc, hr, True)
        s = state(pg)
        if i == 0:
            n = lows(DEF, want, hc, hr)
            check(s['zipFrom'] == [hc, hr] and pg.locator('#fits [data-low]').count() == len(n) and len(n) >= 2,
                  f'{tag}: a tap on a high end holds it, and the {len(n)} low ends core.js allows glow ({s["zipFrom"]}, {pg.locator("#fits [data-low]").count()})')
            pg.screenshot(path=os.path.join(OUT, 'phone-zip-held.png'))
        cell(pg, lc, lr, True)
        s = state(pg)
        pair = {f'{hc},{hr}': f'zip:{lc},{lr}', f'{lc},{lr}': f'peg:{hc},{hr}'}
        check(all(s['placed'].get(k) == v for k, v in pair.items()) and s['left']['zip'] == 0 and s['zipFrom'] is None,
              f'{tag}: zip-line {i + 1} ({hc},{hr} to {lc},{lr}, {"left" if lc < hc else "right"}) placed as a pair, the tray\'s used ({s["left"]["zip"]})')
        if i == 0:
            pg.screenshot(path=os.path.join(OUT, 'phone-zip-placed.png'))
        if not z['keep']:
            cell(pg, *((lc, lr) if i % 2 == 0 else (hc, hr)), True)
            s = state(pg)
            check(s['placed'] == want and s['left']['zip'] == 1, f'{tag}: a tap on its {"low" if i % 2 == 0 else "high"} end takes zip-line {i + 1} back, both ends ({s["left"]["zip"]})')
    sp = spike(pg)
    check(sp['phase'] == 'go' and sp['zipDone'] == 5 and sp['zipWrong'] == 1 and sp['zipCancelled'] == 1 and sp['takeBacks'] == 4,
          f'{tag}: five zip-lines placed, four taken back, 1 wrong tap and 1 cancelled counted; on to GO ({sp["zipDone"]}, {sp["takeBacks"]}, {sp["zipWrong"]}, {sp["zipCancelled"]}, {sp["phase"]})')
    # GO: the road home
    pg.evaluate('__test.speed(8)')
    tap(pg, '[data-btn="go"]', True)
    pg.wait_for_function('__test.state().mode === "run"', timeout=5000)
    left_seen = False
    shot = False
    for _ in range(400):
        st = pg.evaluate('({ mode: __test.state().mode, flipped: [...document.querySelectorAll("#walkers [data-walker]")].some((w) => /scale\\(-/.test(w.getAttribute("transform") || "")) })')
        left_seen = left_seen or st['flipped']
        if st['flipped'] and not shot:
            pg.screenshot(path=os.path.join(OUT, 'phone-walking-left.png'))
            shot = True
        if st['mode'] != 'run':
            break
        pg.wait_for_timeout(25)
    s = state(pg)
    poses = s['poses'] or []
    check(s['mode'] == 'party' and s['home'] == 5, f'{tag}: GO: all five home on the test board ({s["mode"]}, {s["home"]})')
    check(left_seen, f'{tag}: walkers are drawn facing left (mirrored) after the signpost')
    check(poses and all('zip' in p for p in poses), f'{tag}: every walker hangs from a reel on the zip-line ({[("zip" in p) for p in poses]})')
    sp = spike(pg)
    res = pg.locator('#spike-results')
    text = res.inner_text() if res.count() else ''
    check(res.count() == 1 and res.is_visible() and 'Wrong taps: 1 of 11' in text and 'Zip-lines: 5' in text and 'Cancelled: 1' in text
          and '43.3 px' in text and '844 × 390' in text,
          f'{tag}: the panel shows the results: wrong taps, zip-lines, cancelled, the screen and square sizes ({text!r})')
    kept = pg.evaluate("localStorage.getItem('family-games:hamster-highway:progress')")
    check(s['progress']['done'] == {} and s['progress']['tries'] == {} and kept is None,
          f'{tag}: the test board saves nothing: no level done or tried, and nothing kept on the device ({s["progress"]["done"]}, {s["progress"]["tries"]}, {kept})')
    pg.screenshot(path=os.path.join(OUT, 'phone-results.png'))
    finish(pg, tag, errors, asked)
    ctx.close()

    # ---------------------------------------------------------------- the PC, by mouse
    ctx, pg, errors, asked = open_page(br, 1366, 768, False)
    tag = 'PC 1366x768'
    # level 1 keeps its 12 x 7 window
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    tap(pg, '[data-level="0"]')
    pg.wait_for_function('__test.state().screen === "level" && __test.state().level === "L1"')
    pg.wait_for_timeout(100)
    if state(pg)['card']:
        tap(pg, '#card [data-btn="cardok"]')
    win = window_of(pg)
    check(win['viewBox'] == [0, 0, 850, 420] and win['clip'] == [720, 420], f'{tag}: level 1 keeps its 12 x 7 window ({win})')
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready && window.__spike !== undefined', timeout=10000)
    open_board(pg, False)
    win = window_of(pg)
    check(win['viewBox'] == [0, 0, 1090, 540] and win['clip'] == [960, 540], f'{tag}: the test board\'s window is 16 x 9 squares ({win}, {win["square"]:.1f} px a square)')
    tap(pg, '[data-slot="zip"]')
    cell(pg, 2, 3)
    good, bad = pg.evaluate('__test.cellPoint(6, 4)'), pg.evaluate('__test.cellPoint(6, 6)')
    pg.mouse.move(good['x'], good['y'])
    pg.wait_for_timeout(60)
    g1 = pg.evaluate('[...document.querySelectorAll("#ghost [data-zipghost]")].map((e) => e.getAttribute("stroke"))')
    pg.mouse.move(bad['x'], bad['y'])
    pg.wait_for_timeout(60)
    g2 = pg.evaluate('[...document.querySelectorAll("#ghost [data-zipghost]")].map((e) => e.getAttribute("stroke"))')
    check(g1 == ['#2BB673'] and g2 == ['#9AA0B4'], f'{tag}: a ghost line follows the mouse from the held high end: green over a good low end, grey elsewhere ({g1}, {g2})')
    pg.mouse.click(good['x'], good['y'])
    s = state(pg)
    check(s['placed'] == {'2,3': 'zip:6,4', '6,4': 'peg:2,3'}, f'{tag}: a click on the green end places the zip-line ({s["placed"]})')
    pg.screenshot(path=os.path.join(OUT, 'pc-zip.png'))
    finish(pg, tag, errors, asked)
    ctx.close()
    br.close()

print(f'Pictures: {OUT}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
