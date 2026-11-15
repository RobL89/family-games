"""Hamster Highway in a browser: the house, placing gadgets, runs and parties. Version 1.5 (15 Nov).

Changes at v1.5 (step 4, D-157, D-161): the house shows ten levels and the plan's 2 places still to come; after level
8, Next opens level 9 (the shed backdrop, 20 squares wide, a lift with two cups): with the bridge and the step's ramp
only, they step into the cups with a clink, ride up and have a funny fall off the bench; the cups move during a
run; with the floater and the spare bridge, a party with the seed. Level 10 (the treehouse, 24 wide, a see-saw and a
lift): its answer and the spare ramp give a party with the seed, and no Next after it; the saved tries 2 and 1.

Changes at v1.4 (step 4, D-156, D-158): the house shows eight levels and the plan's 4 places still to come; level 8
(the veg patch backdrop, 18 squares wide): the window starts at the left with an arrow to the right only; a swipe
on the board slides it 4 squares; an arrow slides it to the end; a ramp held at the window's right edge slides it on;
with the bridge and the step's ramp only, the see-saw creaks over and they ride it, but not all get home; with the
ramp to its raised end and the spare ramp at the first gap, a party with the seed, the window having followed them
along; no Next after level 8; its saved tries 2. On a phone held sideways, level 8's arrows slide it by touch and a
ramp goes down at 10,3 by touch.

Changes at v1.3 (step 3, D-144, D-153, D-154): runs play the timed model (game.js 1.3); the house shows seven
levels and the plan's five places still to come; level 6 (the bathroom backdrop): one worn stick cracks under three
hamsters and snaps under the fourth, two splash, then two sticks one under the other and the spare ramp past the
bath give a party with the seed; level 7 (the loft): four sticks in two layers and the spare ramp before the gap,
a party with the seed, and no Next after it; the saved tries 2 and 1.

Changes at v1.2 (D-151): the house shows seven soft places, the plan's, for levels 6 to 10 and two later.

Changes at v1.1 (step 2): levels 4 and 5 (D-145): the house shows five levels and five places for later; on
level 4 the bridge alone ends in a funny fall, and the floater with the spare bridge floats them down past
the seed; on level 5 three tubes take them up and home without the seed, then a fourth on top takes it;
each with its own backdrop (D-149). And (D-147) saving and the wrapper link. On its own, the progress is kept in the
device's entry and comes back after a reload, and a broken entry starts afresh. In a stand-in wrapper (a
page served to the test browser only, framing the game and answering fg:ready with fg:start the way
shared/bridge.js expects): the child's progress handed in opens the house where they were; each change
goes out with fg:state and nothing is kept on the device; sound off makes no audio and hides the sound
button; with sound on and no progress, a new player starts at level 1. The game may also fetch
games/_common/rocket/link.js and shared/bridge.js. Version 1.0.1 (15 Nov): renamed with the game, D-146.

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
import functools, http.server, json, os, socketserver, sys, threading

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
OWN = (f'{BASE}/games/hamster-highway/', f'{BASE}/games/_common/fonts/', f'{BASE}/games/_common/rocket/link.js', f'{BASE}/shared/bridge.js')
ENTRY = 'family-games:hamster-highway:progress'   # the game's own entry on its own (data map 1.9)
WRAP = f'{BASE}/__wrapper.html'                  # the stand-in wrapper, served by the test only
WRAPPER = '''<!doctype html><html><body style="margin:0"><div style="height:56px;background:#ddd"></div>
<iframe id="g" src="/games/hamster-highway/index.html" style="display:block;border:0;width:100vw;height:calc(100vh - 56px)"></iframe>
<script>
window.__states = []; window.__ready = 0;
const START = JSON.parse(decodeURIComponent(location.hash.slice(1)) || '{}');
addEventListener('message', (e) => {
  const f = document.getElementById('g').contentWindow;
  if (e.source !== f || e.origin !== location.origin) return;
  const m = e.data;
  if (m && m.v === 1 && m.type === 'fg:ready') { window.__ready++; f.postMessage({ v: 1, type: 'fg:start', player: { name: 'Sam', animal: 'fox', colour: '#2E8FD0' },
    sound: START.sound !== false, lists: [], settings: {}, state: START.state === undefined ? null : START.state, level: null }, location.origin); }
  if (m && m.v === 1 && m.type === 'fg:state') window.__states.push(m.state);
});
</script></body></html>'''
COUNT_AUDIO = """(() => { window.__audio = 0; for (const n of ['AudioContext', 'webkitAudioContext']) { const R = window[n];
  if (typeof R !== 'function') continue; window[n] = class extends R { constructor(...a) { super(...a); window.__audio++; } }; } })()"""

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
    while True:   # on a wide board, the arrows slide the window until the square shows (6 squares a tap)
        x = (c + 0.5) * 60 - pg.evaluate('__test.view()')['x']
        if 40 < x < 680:
            break
        tap(pg, '[data-btn="panR"]' if x >= 680 else '[data-btn="panL"]', touch)
        pg.wait_for_timeout(450)
    cell(pg, c, r, touch)


def go_and_wait(pg, mode_after, touch=False):
    pg.evaluate('__test.speed(8)')
    tap(pg, '[data-btn="go"]', touch)
    pg.wait_for_function('__test.state().mode === "run"', timeout=5000)
    pg.wait_for_function(f'__test.state().mode === "{mode_after}"', timeout=20000)


def kept(pg):
    return json.loads(pg.evaluate(f"localStorage.getItem('{ENTRY}')") or 'null')


def framed(br, start, w=1366, h=768):
    """The game in the stand-in wrapper, with fg:start's sound and state from `start`."""
    ctx = br.new_context(viewport={'width': w, 'height': h})
    ctx.add_init_script(COUNT_AUDIO)
    ctx.route('**/__wrapper.html', lambda route: route.fulfill(status=200, content_type='text/html', body=WRAPPER))
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
    pg.goto(WRAP + '#' + json.dumps(start))
    pg.wait_for_function('window.__ready > 0', timeout=10000)
    f = pg.frame_locator('#g')
    fr = [x for x in pg.frames if x != pg.main_frame][0]
    fr.wait_for_function('window.__test && __test.state().ready', timeout=10000)
    return ctx, pg, fr, errors


def ftap(pg, fr, sel):
    b = fr.locator(sel).first.bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def fcell(pg, fr, c, r):
    o = pg.locator('#g').bounding_box()
    p = fr.evaluate(f'__test.cellPoint({c}, {r})')
    pg.mouse.click(o['x'] + p['x'], o['y'] + p['y'])


def fgo(pg, fr, mode_after):
    fr.evaluate('__test.speed(8)')
    ftap(pg, fr, '[data-btn="go"]')
    fr.wait_for_function('__test.state().mode === "run"', timeout=5000)
    fr.wait_for_function(f'__test.state().mode === "{mode_after}"', timeout=20000)


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
    check(n_markers == 10 and locked == 9 and future == 2, f'PC: the house shows levels 1 to 10, nine locked, and the plan\'s 2 places still to come (D-151) ({n_markers}, {locked}, {future})')
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
    k = kept(pg)
    check(k == {'v': 1, 'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 1}} and not s['linked'],
          f'PC on its own: level 1 done, its seed and its one try are kept in the device\'s entry, format 1 (D-147) ({k})')
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

    # level 4: the floater
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L4"')
    check(pg.locator('#bg [data-back="living"]').count() == 1, 'PC: level 4 has the living room for its backdrop (D-149)')
    place(pg, 'bridge', 3, 2)
    go_and_wait(pg, 'build')
    check(all(x in state(pg)['heard'] for x in ('flump', 'dizzy')), 'PC: level 4 with just the bridge: a drop of 4, a funny fall')
    place(pg, 'floater', 5, 1)
    place(pg, 'bridge', 6, 2)
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(3000)
    pg.screenshot(path=os.path.join(OUT, 'pc-11-level4-float.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and 'wheee' in s['heard'], 'PC: level 4 with the floater and the spare bridge: they float down past the seed, and home')

    # level 5: the tube
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L5"')
    check(pg.locator('#bg [data-back="bedroom"]').count() == 1, 'PC: level 5 has the bedroom for its backdrop (D-149)')
    place(pg, 'bridge', 3, 6)
    for rr in (5, 4, 3):
        place(pg, 'tube', 6, rr)
    pg.screenshot(path=os.path.join(OUT, 'pc-12-level5-built.png'))
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and not s['seedTaken'], 'PC: level 5 with three tubes: up and home, without the seed')
    tap(pg, '#party [data-act="again"]')
    pg.wait_for_function('__test.state().mode === "build"')
    place(pg, 'tube', 6, 2)
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(2400)
    pg.screenshot(path=os.path.join(OUT, 'pc-13-level5-tube.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and s['progress']['seeds'].get('L5'), 'PC: level 5 with a fourth tube on top: out beside the seed, and home with it')

    # level 6: the worn stick (D-143, D-153)
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L6"')
    check(pg.locator('#bg [data-back="bathroom"]').count() == 1 and pg.locator('[data-slot="stick"]').count() == 1,
          'PC: level 6 has the bathroom for its backdrop and the worn stick in its tray (D-153, D-154)')
    place(pg, 'stick', 5, 4)
    go_and_wait(pg, 'build')
    s = state(pg)
    check(all(x in s['heard'] for x in ('crack', 'snap', 'splash')) and s['placed'] == {'5,4': 'stick'},
          f'PC: level 6 with one stick: it cracks, snaps under the fourth, they splash, and the stick is back for the next try ({s["placed"]})')
    place(pg, 'stick', 5, 5)
    place(pg, 'ramp', 6, 4)
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(6200)
    pg.screenshot(path=os.path.join(OUT, 'pc-14-level6-snap.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'], 'PC: level 6 with a stick under the stick and the spare ramp past the bath: all five home, with the seed')

    # level 7: two layers of sticks
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L7"')
    check(pg.locator('#bg [data-back="loft"]').count() == 1, 'PC: level 7 has the loft for its backdrop (D-154)')
    for cc, rr in ((5, 3), (6, 3), (5, 4), (6, 4)):
        place(pg, 'stick', cc, rr)
    place(pg, 'ramp', 4, 2)
    pg.screenshot(path=os.path.join(OUT, 'pc-15-level7-built.png'))
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and 'snap' in s['heard'], 'PC: level 7 with four sticks in two layers and the ramp before the gap: a snap, then all five home with the seed')

    # level 8: the wide board (D-158) and the see-saw (D-156)
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L8"')
    v = pg.evaluate('__test.view()')
    check(pg.locator('#bg [data-back="veg"]').count() == 1 and pg.locator('[data-saw]').count() == 1 and v == {'x': 0, 'max': 360},
          f'PC: level 8 has the veg patch for its backdrop and a see-saw; 18 squares wide, its window starts at the left ({v})')
    check(pg.locator('[data-btn="panR"]').count() == 1 and pg.locator('[data-btn="panL"]').count() == 0, 'PC: level 8 shows an arrow to the right only')
    place(pg, 'bridge', 3, 5)
    place(pg, 'ramp', 5, 4)
    tap(pg, '[data-slot="ramp"]')   # put the ramp back down: nothing in hand, so a drag on the board slides it
    a = pg.evaluate('__test.cellPoint(8, 1)')
    b = pg.evaluate('__test.cellPoint(4, 1)')
    pg.mouse.move(a['x'], a['y'])
    pg.mouse.down()
    for k in range(1, 11):
        pg.mouse.move(a['x'] + (b['x'] - a['x']) * k / 10, a['y'])
    pg.mouse.up()
    v = pg.evaluate('__test.view()')
    check(abs(v['x'] - 240) < 2 and state(pg)['placed'] == {'3,5': 'bridge', '5,4': 'ramp'}, f'PC: a swipe slides the board 4 squares and puts nothing down ({v["x"]})')
    tap(pg, '[data-btn="panR"]')
    pg.wait_for_timeout(450)
    v = pg.evaluate('__test.view()')
    check(v['x'] == 360 and pg.locator('[data-btn="panR"]').count() == 0, f'PC: the right arrow slides it to the end, and goes ({v["x"]})')
    tap(pg, '[data-btn="panL"]')
    pg.wait_for_timeout(450)
    check(pg.evaluate('__test.view()')['x'] == 0, 'PC: the left arrow slides it back to the start (6 squares a tap)')
    sb = pg.locator('[data-slot="ramp"]').first.bounding_box()
    e = pg.evaluate('__test.cellPoint(11, 3)')
    pg.mouse.move(sb['x'] + sb['width'] / 2, sb['y'] + sb['height'] / 2)
    pg.mouse.down()
    for k in range(1, 11):
        pg.mouse.move(sb['x'] + sb['width'] / 2 + (e['x'] - sb['x'] - sb['width'] / 2) * k / 10, sb['y'] + sb['height'] / 2 + (e['y'] - sb['y'] - sb['height'] / 2) * k / 10)
    pg.wait_for_timeout(500)
    held = pg.evaluate('__test.view()')['x']
    pg.mouse.move(sb['x'] + sb['width'] / 2, sb['y'] + sb['height'] / 2)
    pg.mouse.up()
    check(held > 0 and state(pg)['placed'] == {'3,5': 'bridge', '5,4': 'ramp'}, f'PC: a ramp held at the window\'s right edge slides the board on; let go over the tray, nothing goes down ({held})')
    go_and_wait(pg, 'build')
    s = state(pg)
    check(all(x in s['heard'] for x in ('creak', 'wheee', 'snore')), f'PC: level 8 without the ramp to the see-saw: it creaks over, they ride it, and some nap at its raised end ({s["heard"][-12:]})')
    while pg.evaluate('__test.view()')['x'] > 0:
        tap(pg, '[data-btn="panL"]')
        pg.wait_for_timeout(450)
    place(pg, 'ramp', 2, 4)
    tap(pg, '[data-btn="panR"]')
    pg.wait_for_timeout(450)
    place(pg, 'ramp', 10, 3)
    check(state(pg)['placed'] == {'3,5': 'bridge', '5,4': 'ramp', '2,4': 'ramp', '10,3': 'ramp'}, f'PC: level 8: a ramp put down at 10,3 with the board slid along ({state(pg)["placed"]})')
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(8700)
    pg.screenshot(path=os.path.join(OUT, 'pc-16-level8-tip.png'))
    mid = pg.evaluate('__test.view()')['x']
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and mid > 0, f'PC: level 8 with the ramp to the see-saw and the spare at the first gap: all five home with the seed; the window followed them ({mid})')
    # level 9: the shed and the teacup lift with two cups (D-157, D-161)
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L9"')
    v = pg.evaluate('__test.view()')
    check(pg.locator('#bg [data-back="shed"]').count() == 1 and pg.locator('#parts [data-cup]').count() == 2 and pg.locator('#cupfront [data-cupf]').count() == 2
          and pg.locator('#bg .loop').count() == 1 and v == {'x': 0, 'max': 480},
          f'PC: level 9 has the shed for its backdrop and a lift with two cups on one loop; 20 squares wide, its window at the left ({v})')
    place(pg, 'bridge', 3, 5)
    place(pg, 'ramp', 5, 4)
    cups0 = pg.evaluate('[...document.querySelectorAll("#parts [data-cup]")].map((e) => e.getAttribute("transform"))')
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(4600)
    cups1 = pg.evaluate('[...document.querySelectorAll("#parts [data-cup]")].map((e) => e.getAttribute("transform"))')
    pg.screenshot(path=os.path.join(OUT, 'pc-17-level9-lift.png'))
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().outcome === "bonk"', timeout=10000)   # the run's outcome is known as it starts
    pg.wait_for_function('__test.state().mode === "build"', timeout=30000)
    s = {**state(pg), 'outcome': 'bonk'}   # back to building, the outcome is gone; the sounds are all in
    check(cups0 == ['translate(510.0 300.0)', 'translate(510.0 120.0)'] and all(a != b for a, b in zip(cups0, cups1)),
          f'PC: level 9\'s cups wait one at the bottom, one at the top, and move during a run ({cups0}, {cups1})')
    check(s['outcome'] == 'bonk' and all(x in s['heard'] for x in ('clink', 'wheee', 'flump')),
          f'PC: level 9 without the floater: they step into the cups (clink), ride up (wheee), then a funny fall off the bench ({s["outcome"]}, {s["heard"][-10:]})')
    place(pg, 'floater', 13, 1)
    place(pg, 'bridge', 15, 2)
    check(state(pg)['placed'] == {'3,5': 'bridge', '5,4': 'ramp', '13,1': 'floater', '15,2': 'bridge'}, f'PC: level 9: the floater and the spare bridge put down along the bench ({state(pg)["placed"]})')
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'], 'PC: level 9 with the floater and the spare bridge: all five ride the lift home, with the seed')
    # level 10: the treehouse finale
    tap(pg, '#party [data-act="next"]')
    pg.wait_for_function('__test.state().level === "L10"')
    v = pg.evaluate('__test.view()')
    check(pg.locator('#bg [data-back="treehouse"]').count() == 1 and pg.locator('[data-saw]').count() == 1 and pg.locator('#parts [data-cup]').count() == 2 and v == {'x': 0, 'max': 720},
          f'PC: level 10 has the treehouse for its backdrop, a see-saw and a lift with two cups; 24 squares wide ({v})')
    for kind, c, r in (('bridge', 2, 6), ('bouncer', 4, 5), ('floater', 6, 2), ('tube', 9, 5), ('tube', 9, 4), ('tube', 9, 3), ('ramp', 11, 3), ('ramp', 20, 1)):
        place(pg, kind, c, r)
    check(len(state(pg)['placed']) == 8 and state(pg)['left'] == {'bridge': 0, 'ramp': 0, 'bouncer': 0, 'floater': 0, 'tube': 0},
          f'PC: level 10: all eight gadgets put down along the board ({state(pg)["placed"]})')
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and all(x in s['heard'] for x in ('boing', 'creak', 'clink')),
          f'PC: level 10 with its answer and the spare ramp: a bounce, the see-saw, the lift, all five home with the seed ({s["heard"][-8:]})')
    pg.screenshot(path=os.path.join(OUT, 'pc-18-level10-party.png'))
    check(not pg.locator('#party [data-act="next"]').is_visible(), 'PC: after the last level there is no Next')
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'pc-10-house-all.png'))
    sizes_ok(pg, 'PC 1366x712', errors, asked)
    ids = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10']
    want = {'v': 1, 'done': {i: True for i in ids}, 'seeds': {i: True for i in ids}, 'tries': {'L1': 1, 'L2': 2, 'L3': 3, 'L4': 2, 'L5': 1, 'L6': 2, 'L7': 1, 'L8': 2, 'L9': 2, 'L10': 1}}
    check(kept(pg) == want, f'PC on its own: the entry holds levels 1 to 10 done, their seeds, and the GO presses until each was first done (1, 2, 3, 2, 1, 2, 1, 2, 2, 1; the replays for seeds not counted) ({kept(pg)})')
    pg.reload()
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    s = state(pg)
    check(s['progress'] == {k: want[k] for k in ('done', 'seeds', 'tries')} and pg.locator('[data-level].locked').count() == 0,
          f'PC on its own: after a reload, the house comes back as it was left: every level open, the seeds found ({s["progress"]})')
    pg.evaluate(f"localStorage.setItem('{ENTRY}', '{{oops')")
    pg.reload()
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    s = state(pg)
    check(s['progress'] == {'done': {}, 'seeds': {}, 'tries': {}} and s['at'] == 0, f'PC on its own: a broken entry starts afresh at level 1 ({s["progress"]})')
    check(not errors, f'PC on its own: no script errors after the reloads {errors[:2]}')
    ctx.close()

    # ---- in the stand-in wrapper: progress in with fg:start, out with fg:state, sound off
    ctx, pg, fr, errors = framed(br, {'sound': False, 'state': {'v': 1, 'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 2}}})
    s = fr.evaluate('__test.state()')
    check(s['linked'] and s['muted'], f'wrapper: the game takes fg:start: linked, and sound off ({s["linked"]}, {s["muted"]})')
    ftap(pg, fr, '#play')
    fr.wait_for_function('__test.state().screen === "house"')
    s = fr.evaluate('__test.state()')
    check(fr.locator('[data-level="1"].locked').count() == 0 and fr.locator('[data-level="2"].locked').count() == 1 and s['at'] == 1,
          f'wrapper: the child\'s progress opens the house where they were: level 2 open and waiting, level 3 locked ({s["at"]})')
    check(not fr.locator('#sound').is_visible(), 'wrapper: with sound off, the game\'s own sound button is hidden')
    pg.screenshot(path=os.path.join(OUT, 'wrapper-1-house.png'))
    ftap(pg, fr, '[data-level="1"]')
    fr.wait_for_function('__test.state().level === "L2"')
    fgo(pg, fr, 'build')
    last = pg.evaluate('window.__states[window.__states.length - 1]')
    check(last == {'v': 1, 'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 2, 'L2': 1}}, f'wrapper: a GO goes out with fg:state at once, the try counted ({last})')
    ftap(pg, fr, '[data-slot="bridge"]'); fcell(pg, fr, 3, 6)
    ftap(pg, fr, '[data-slot="ramp"]'); fcell(pg, fr, 7, 5)
    fgo(pg, fr, 'party')
    last = pg.evaluate('window.__states[window.__states.length - 1]')
    check(last == {'v': 1, 'done': {'L1': True, 'L2': True}, 'seeds': {}, 'tries': {'L1': 2, 'L2': 2}}, f'wrapper: the party goes out with fg:state: level 2 done (GC7.5) ({last})')
    check(kept(pg) is None, 'wrapper: nothing is kept on the device by the game')
    check(pg.evaluate('[...document.querySelectorAll("iframe")].length') == 1 and fr.evaluate('window.__audio') == 0,
          f'wrapper: with sound off, no audio is made ({fr.evaluate("window.__audio")})')
    check(not errors, f'wrapper: no script errors {errors[:2]}')
    ctx.close()
    ctx, pg, fr, errors = framed(br, {'sound': True, 'state': None})
    s = fr.evaluate('__test.state()')
    ftap(pg, fr, '#play')
    fr.wait_for_function('__test.state().screen === "house"')
    check(s['linked'] and not s['muted'] and fr.locator('#sound').is_visible() and fr.locator('[data-level].locked').count() == fr.locator('[data-level]').count() - 1,
          'wrapper: with sound on and no progress, the sound button shows and a new player starts at level 1')
    check(fr.evaluate('window.__audio') >= 1, 'wrapper: with sound on, Play makes sound')
    check(not errors, f'wrapper (sound on): no script errors {errors[:2]}')
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
        if (w, h) == (844, 390):
            # level 8 by touch: the arrows slide the wide board, and a ramp goes down along it
            done7 = {f'L{i}': True for i in range(1, 8)}
            pg.evaluate(f"localStorage.setItem('{ENTRY}', JSON.stringify({{v: 1, done: {json.dumps(done7)}, seeds: {{}}, tries: {{}}}}))")
            pg.reload()
            pg.wait_for_function('window.__test !== undefined && __test.state().ready')
            tap(pg, '#play', True)
            pg.wait_for_function('__test.state().screen === "house"')
            tap(pg, '[data-level="7"]', True)
            pg.wait_for_function('__test.state().level === "L8"')
            tap(pg, '[data-btn="panR"]', True)
            pg.wait_for_timeout(450)
            v = pg.evaluate('__test.view()')
            place(pg, 'ramp', 10, 3, True)
            check(v['x'] == 360 and state(pg)['placed'] == {'10,3': 'ramp'}, f'{tag}: on level 8 the arrow slides the board by touch, and a ramp goes down at 10,3 ({v}, {state(pg)["placed"]})')
            pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-level8.png'))
        sizes_ok(pg, tag, errors, asked)
        ctx.close()
    br.close()

print(f'Pictures: {OUT}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
