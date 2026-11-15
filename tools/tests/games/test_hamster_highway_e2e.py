"""Hamster Highway in a browser: the house, placing gadgets, runs and parties. Version 1.0.1 (15 Nov; renamed with the game, D-146).

Headless Chromium is the stand-in for the PC and the phone. The game is served from the repo on
127.0.0.1 and played the way a child would: real mouse clicks, a drag, and touch taps, at the
centres of what's on screen (window.__test only reads the game, finds a square's centre and speeds
up the walk). The checks, decided before the build:
  - at the PC size (1366 x 712, under the wrapper's 56 px bar), a sideways phone alone (844 x 390)
    and in the wrapper (844 x 334), and an upright phone (390 x 844): no script errors, nothing
    fetched but the game's own files and the shared font, and no sideways scrolling of the page (the
    house scrolls inside itself, D-140); the tray goes at the side or below, whichever gives the
    bigger squares, and the upright phone shows the turn-sideways picture until tapped (Q-048's stop-gap);
  - the title card has a Play button (GC6); the house shows levels 1 to 3, only level 1 open, and seven
    soft places for later levels; a locked level doesn't open;
  - level 1: the bridge lights up only the gap (D-139); a mid-air square refuses it; a click on a placed
    bridge puts it back; a drag puts it down; GO; all five home, a party, the seed taken; the house then
    shows level 1 done, its seed found and level 2 open;
  - level 2: with just the bridge they get stuck and the game goes back to building, the bridge still
    down; with the ramp by the step and the spare ramp before the seed, a party with the seed;
  - level 3: with nothing down, a splash; with a ramp on the wall's top, a funny fall (bonk); with the
    bridge and the bouncer, a party without the seed; then the spare ramp where they land, and the seed;
  - a tap on the duck quacks, on a jar clinks; the sounds of each event are asked for (sound.js's tally,
    as the stand-in browser plays no audio);
  - on a sideways phone, touch taps place a gadget and start a run.
Pictures go to OUT/ (default /tmp/hamster-highway-e2e) for looking over.

Usage, from the repo root:
    python3 -B tools/tests/games/test_hamster_highway_e2e.py [OUT]
Exits 1 if a check fails.
"""
import functools, http.server, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-highway-e2e'
os.makedirs(OUT, exist_ok=True)
problems = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
PORT = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'
URL = f'{BASE}/games/hamster-highway/index.html'
OWN = (f'{BASE}/games/hamster-highway/', f'{BASE}/games/_common/fonts/')

from playwright.sync_api import sync_playwright  # noqa: E402


def state(pg):
    return pg.evaluate('__test.state()')


def tap(pg, sel, touch=False):
    b = pg.locator(sel).first.bounding_box()
    x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    (pg.touchscreen.tap if touch else pg.mouse.click)(x, y)


def cell(pg, c, r, touch=False):
    p = pg.evaluate(f'__test.cellPoint({c}, {r})')
    (pg.touchscreen.tap if touch else pg.mouse.click)(p['x'], p['y'])


def place(pg, kind, c, r, touch=False):
    if state(pg)['selected'] != kind:   # a second tap on the picked gadget would put it down again
        tap(pg, f'[data-slot="{kind}"]', touch)
    cell(pg, c, r, touch)


def go_and_wait(pg, mode_after, touch=False):
    pg.evaluate('__test.speed(8)')
    tap(pg, '[data-btn="go"]', touch)
    pg.wait_for_function('__test.state().mode === "run"', timeout=5000)
    pg.wait_for_function(f'__test.state().mode === "{mode_after}"', timeout=20000)


def open_page(br, w, h, touch=False):
    ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch)
    pg = ctx.new_page()
    errors, asked = [], []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
    pg.on('request', lambda r: asked.append(r.url))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined')
    return ctx, pg, errors, asked


def sizes_ok(pg, tag, errors, asked):
    check(not errors, f'{tag}: no script errors {errors[:2]}')
    others = [u for u in asked if u != URL and not u.startswith(OWN)]
    check(not others, f'{tag}: fetches only its own files and the shared font {others[:3]}')
    check(not pg.evaluate('document.scrollingElement.scrollWidth > innerWidth'), f'{tag}: no sideways scrolling of the page')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---- the PC: the whole first three levels
    ctx, pg, errors, asked = open_page(br, 1366, 712)
    check(pg.locator('#play').is_visible(), 'PC: the title card shows a Play button (GC6)')
    pg.screenshot(path=os.path.join(OUT, 'pc-1-title.png'))
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    n_markers = pg.locator('[data-level]').count()
    locked = pg.locator('[data-level].locked').count()
    future = pg.locator('[data-future]').count()
    check(n_markers == 3 and locked == 2 and future == 7, f'PC: the house shows levels 1 to 3, two locked, and 7 places for later ({n_markers}, {locked}, {future})')
    check(pg.evaluate('document.getElementById("house-scroll").scrollWidth > document.getElementById("house-scroll").clientWidth'),
          'PC: the house is wider than the screen and scrolls sideways inside itself (D-140)')
    pg.screenshot(path=os.path.join(OUT, 'pc-2-house.png'))
    tap(pg, '[data-level="1"]')
    pg.wait_for_timeout(300)
    check(state(pg)['screen'] == 'house', 'PC: a locked level does not open')
    tap(pg, '[data-level="0"]')
    pg.wait_for_function('__test.state().screen === "level"')
    s = state(pg)
    check(s['level'] == 'L1' and s['layout'] == 'side', f'PC: level 1 opens, with the tray at the side ({s["level"]}, {s["layout"]})')
    tap(pg, '[data-slot="bridge"]')
    fits_n = pg.locator('#fits rect').count()
    check(fits_n == 1, f'PC: with the bridge picked, only the gap lights up ({fits_n})')
    pg.screenshot(path=os.path.join(OUT, 'pc-3-picked.png'))
    cell(pg, 5, 2)
    s = state(pg)
    check(s['placed'] == {} and 'nope' in s['heard'], 'PC: a mid-air square refuses the bridge, with a "nope"')
    cell(pg, 5, 6)
    s = state(pg)
    check(s['placed'] == {'5,6': 'bridge'} and s['left'] == {'bridge': 0} and 'place' in s['heard'], f'PC: the bridge goes over the gap ({s["placed"]})')
    cell(pg, 5, 6)
    s = state(pg)
    check(s['placed'] == {} and s['left'] == {'bridge': 1}, f'PC: a click on the placed bridge puts it back in the tray ({s["placed"]})')
    b = pg.locator('[data-slot="bridge"]').bounding_box()
    p = pg.evaluate('__test.cellPoint(5, 6)')
    pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)
    pg.mouse.down()
    for k in range(1, 11):
        pg.mouse.move(b['x'] + b['width'] / 2 + (p['x'] - b['x'] - b['width'] / 2) * k / 10, b['y'] + b['height'] / 2 + (p['y'] - b['y'] - b['height'] / 2) * k / 10)
    pg.mouse.up()
    s = state(pg)
    check(s['placed'] == {'5,6': 'bridge'}, f'PC: dragging the bridge onto the gap puts it down ({s["placed"]})')
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(2600)
    pg.screenshot(path=os.path.join(OUT, 'pc-4-run.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and s['progress']['done'].get('L1') and s['progress']['seeds'].get('L1'),
          f'PC: level 1: all five home, a party, the seed taken ({s["home"]}, {s["seedTaken"]})')
    check(all(x in s['heard'] for x in ('go', 'home', 'seed', 'party')), 'PC: level 1: go, home, seed and party sounds asked for')
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, 'pc-5-party.png'))
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    open2 = pg.locator('[data-level="1"].locked').count() == 0
    check(open2 and s['progress']['seeds'].get('L1'), 'PC: back in the house, level 2 is open')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'pc-6-house-after.png'))
    tap(pg, '[data-poke="duck"]')
    tap(pg, '[data-poke="jar"]')
    s = state(pg)
    check('quack' in s['heard'] and 'clink' in s['heard'], 'PC: the duck quacks and a jar clinks when tapped')

    # level 2
    tap(pg, '[data-level="1"]')
    pg.wait_for_function('__test.state().level === "L2"')
    place(pg, 'bridge', 3, 6)
    go_and_wait(pg, 'build')
    s = state(pg)
    check(s['placed'] == {'3,6': 'bridge'}, f'PC: level 2 with just the bridge: stuck at the step, then back to building, the bridge still down ({s["placed"]})')
    check(all(x in s['heard'] for x in ('huh', 'snore')), 'PC: level 2: a stuck hamster says "huh" and snores')
    place(pg, 'ramp', 7, 5)
    place(pg, 'ramp', 4, 5)
    pg.screenshot(path=os.path.join(OUT, 'pc-7-level2-built.png'))
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(3200)
    pg.screenshot(path=os.path.join(OUT, 'pc-8-level2-run.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and 'climb' in s['heard'], 'PC: level 2 with both ramps: up the hop for the seed, then home with it')

    # level 3
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L3"')
    go_and_wait(pg, 'build')
    check('splash' in state(pg)['heard'], 'PC: level 3 with nothing down: a splash, then back to building')
    place(pg, 'bridge', 2, 6)
    place(pg, 'bouncer', 5, 5)
    place(pg, 'ramp', 8, 2)
    pg.evaluate('__test.speed(8)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_function('__test.state().outcome === "bonk"', timeout=5000)
    pg.wait_for_function('__test.state().mode === "build"', timeout=20000)
    s = state(pg)
    check(all(x in s['heard'] for x in ('boing', 'flump', 'dizzy')), 'PC: level 3 with a ramp on the wall: up the bouncer, then a funny fall (boing, flump, dizzy)')
    cell(pg, 8, 2)
    s = state(pg)
    check('8,2' not in s['placed'], 'PC: the ramp on the wall goes back to the tray')
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and not s['seedTaken'], 'PC: level 3 with the bridge and bouncer: a party, without the seed')
    tap(pg, '#party [data-act="again"]')
    pg.wait_for_function('__test.state().mode === "build"')
    place(pg, 'ramp', 9, 4)
    pg.evaluate('__test.speed(1.5)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(2200)
    pg.screenshot(path=os.path.join(OUT, 'pc-9-level3-run.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and s['progress']['seeds'].get('L3'), 'PC: level 3 with the spare ramp where they land: the seed, and a party')
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'pc-10-house-all.png'))
    sizes_ok(pg, 'PC 1366x712', errors, asked)
    ctx.close()

    # ---- phones
    for w, h, tag in ((844, 390, 'phone sideways'), (844, 334, 'phone sideways in the wrapper'), (390, 844, 'phone upright')):
        ctx, pg, errors, asked = open_page(br, w, h, touch=True)
        tap(pg, '#play', True)
        pg.wait_for_function('__test.state().screen === "house"')
        pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-house.png'))
        tap(pg, '[data-level="0"]', True)
        pg.wait_for_function('__test.state().screen === "level"')
        s = state(pg)
        want = 'bottom' if h > w else 'side'
        check(s['layout'] == want, f'{tag}: the tray goes {"below" if want == "bottom" else "at the side"} ({s["layout"]})')
        turn = pg.locator('#turn').is_visible()
        check(turn == (h > w), f'{tag}: the turn-sideways picture {"shows" if h > w else "stays hidden"}')
        pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-level.png'))
        if turn:
            tap(pg, '#turn', True)
            check(not pg.locator('#turn').is_visible(), f'{tag}: a tap puts the turn-sideways picture away')
        place(pg, 'bridge', 5, 6, True)
        s = state(pg)
        check(s['placed'] == {'5,6': 'bridge'}, f'{tag}: tap, then tap, puts the bridge down ({s["placed"]})')
        go_and_wait(pg, 'party', True)
        check(state(pg)['home'] == 5, f'{tag}: GO by touch: all five home')
        pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-party.png'))
        sizes_ok(pg, tag, errors, asked)
        ctx.close()
    br.close()

print(f'Pictures: {OUT}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
