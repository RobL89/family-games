"""Hamster Highway in a browser: the house, placing gadgets, runs and parties. Version 1.16 (24 Nov, step 17c (ii)).

Changes at v1.16 (step 17c (ii), D-226, D-229): levels 22 and 24 to 28 played by their new seed roads, as the core
test's SOL holds them (22 the willow road; 24 the zig-zag and its bridge; 25 road 1 and the spare ramp; 26 road A, the
spoon and the straws; 27 road 1, first without its first bridge and with the spare bouncer, the wrong road that leaves
Pudding in the paddling pool, then with it; 28 road 2 round the sandpit and up the far tower). The counter's checks as
before (25 five Nibble heads; 27 Pudding's face third, lit by who; 28 second). Level 25's clink is caught as the lid
moves: on its longer road it is gone from the state's last 40 sounds by the party.

Changes at v1.15 (step 17b (ii), D-215, D-216): levels 25 to 28 played by their new roads (25 its road and spare ramp; 26
road B round the back over its one lid; 27 its road and the spare bouncer; 28 road 2 round the sandpit); the hamster
counter watched as it is drawn: on 25 five Nibble heads lit in order; on 27, first the wrong road (the bouncer in
place of the bridge: a GO press, so level 27's tries are 2), Pudding's own face third, the four Nibbles' faces lit
and Pudding's left faded (lit by who); on 28 Pudding's face second.

Changes at v1.14 (step 17, D-194): after level 26, Next goes on to level 27 at the playground: Pudding's card pops up;
with the bridge and the spare bouncer, the third hamster is drawn as Pudding (vanilla) and squashes the marshmallow
(a flump), the Nibbles go up the slide, all five home with the seed; Next to its twin: two bridges and the bouncer,
home with the seed; no Next after it, the last level.

Changes at v1.13 (step 16, D-194): after level 24, Next goes on to level 25 at the picnic (its backdrop): the button's
card pops up; the bottle top and the lid stand drawn, the lid up; with the bouncer and the spare ramp, during the run
the bottle top clicks down and the lid swings down (watched), all five home with the seed, and the lid stands up again
after; Next to its twin: the high road (the bouncer onto the cake stand), its drawbridge down, home with the seed; no
Next after it, the last level.

Changes at v1.12 (step 15, D-208): after level 22, Next goes on to level 23 at the climbing frame (its backdrop, 9 rows):
the signpost's card pops up; the two bouncers, the signpost at the bar's end and the spare left ramp: a party with the
seed, the hamsters turned round at the signpost (facing left after it, drawn mirrored); Next to its twin, no card, the
zig-zag road (two signposts, two bouncers) home with the seed; no Next after it, the last level.

Changes at v1.11 (step 14b, D-206): on level 21, the placed spoon takes the throw for each of the five, its arm, reel
and puff inside.

Changes at v1.10 (step 14, D-187, D-194, D-202): the park. The house shows the garden's 20 levels and, until level 20 is
done, a soft place for the zip-line's stop (3 places still to come); after level 20 there is no Next (the park is
reached by the ride); back in the house its stop glows, numbered 21; a tap plays the ride and the park opens with
the hamster at 21; its house button goes back to the garden, the ride again to the park. Level 21 (9 rows, the pond
backdrop): the catapult's card pops up; the spoon at the bank's edge and the spare ramp: a party with the seed,
a boing as they fly; Next to its twin, which takes the high road with the seed; no Next after it; the house button
goes back to the park; saved, and after a reload Play opens the park. place() reads the window's width (960 on a
9-row board).

Changes at v1.9 (step 10b, D-177 (1) and (3), ER-013): worn sticks one under the other go down bottom first, the order
Rob found refused: on level 7 by mouse (the lower layer, then the upper), checked placed before the run, and in level
6's and 7's twins' answers; on level 4, the hamsters walk along holding the dandelion clock overhead (game.js's carry
poses) after picking it up, before they float, and never after their last float.

Changes at v1.8 (step 10, D-166, D-170): the twins of levels 6 to 10 too, each played straight after its first level
(the worn sticks', the see-saw's and the lift's on their wide boards, and level 10's twin, the second finale); no Next
after level 10's twin, the last of 20.

Changes at v1.7 (step 9, D-166, D-170): the twins of levels 1 to 5 play in pairs: the house shows every level (the
order read from levels.js), only the first open; after level 1, back in the house, its twin is open and level 2
waits; each twin opens with no card, its answer and spare give a party with the seed, and Next goes on to the next
level; the saved tries include the twins (1 each); in the wrapper, a child who did level 1 before the twins came
finds level 1's twin open and waiting and level 2 locked, and plays the twin; level 8 by touch is opened by its own
place in the order.

Changes at v1.6 (step 8, D-170, D-171): each level's help card, when one pops up, is closed with its tick as a child
would (opened()); the cards popped up on the way through levels 1 to 10 are bridge to lift with none on 7 or 10;
saved progress is format 2, with the cards seen (D-171). The cards themselves: test_hamster_highway_cards_e2e.py.

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
import subprocess  # noqa: E402

# the levels' ids in play order, from levels.js itself (the twins sit straight after their first levels, D-166)
IDS = json.loads(subprocess.run(['node', '--input-type=module', '-e', 'const { LEVELS } = await import(process.argv[1]); console.log(JSON.stringify(LEVELS.map((d) => d.id)))',
                                 'file://' + os.path.join(REPO, 'games', 'hamster-highway', 'levels.js')], capture_output=True, text=True, check=True).stdout)
# each twin's answer then its spare for the seed (Claude's, by hand; test_hamster_highway_core.py 1.9's SOL)
HOUSE_IDS = IDS[:IDS.index('L10b') + 1]   # the house and garden's levels, 1 to 20; the rest are the park's (D-187)
TWIN = {
    'L1b': [('bridge', 3, 4), ('bridge', 9, 6), ('bridge', 7, 4)],
    'L2b': [('bridge', 2, 6), ('ramp', 4, 5), ('ramp', 7, 4), ('ramp', 5, 4)],
    'L3b': [('bridge', 1, 6), ('bouncer', 2, 5), ('bouncer', 6, 5), ('ramp', 10, 4)],
    'L4b': [('bridge', 2, 2), ('bridge', 5, 2), ('floater', 6, 1), ('bridge', 8, 2)],
    'L5b': [('bridge', 1, 6), ('tube', 7, 5), ('tube', 7, 4), ('tube', 7, 3), ('tube', 7, 2), ('tube', 7, 1)],
    'L6b': [('stick', 5, 5), ('stick', 5, 4), ('ramp', 7, 4), ('ramp', 8, 3)],   # the lower stick first (ER-013)
    'L7b': [('stick', 5, 4), ('stick', 6, 4), ('stick', 5, 3), ('stick', 6, 3), ('ramp', 8, 3), ('ramp', 4, 2)],
    'L8b': [('bridge', 3, 5), ('ramp', 5, 4), ('ramp', 10, 3), ('bridge', 15, 6), ('ramp', 14, 5)],
    'L9b': [('bridge', 3, 5), ('ramp', 5, 4), ('floater', 13, 1), ('bridge', 15, 2), ('ramp', 16, 5)],
    'L10b': [('bridge', 2, 6), ('bouncer', 4, 5), ('floater', 6, 2), ('tube', 9, 5), ('tube', 9, 4), ('tube', 9, 3), ('ramp', 11, 3), ('ramp', 15, 4), ('ramp', 20, 1)],
}


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
    bw = float(pg.evaluate('document.querySelector("#window rect").getAttribute("width")'))   # the window: 720, or 960 on a 9-row board
    while True:   # on a wide board, the arrows slide the window until the square shows (6 squares a tap)
        v = pg.evaluate('__test.view()')
        x = (c + 0.5) * 60 - v['x']
        if 40 < x < bw - 40 or (x <= 40 and v['x'] <= 0) or (x >= bw - 40 and v['x'] >= v['max']):   # at the board's edge, no further to slide (column 0, level 24)
            break
        tap(pg, '[data-btn="panR"]' if x >= bw - 40 else '[data-btn="panL"]', touch)
        pg.wait_for_timeout(450)
    cell(pg, c, r, touch)


def opened(pg, lv=None, touch=False):
    """A level has opened; its help card, if one pops up (D-170), is closed with its tick, as a child would.
    Returns the card's kind or None (test_hamster_highway_cards_e2e.py checks the cards themselves)."""
    pg.wait_for_function(f'__test.state().screen === "level"' + (f' && __test.state().level === "{lv}"' if lv else ''))
    pg.wait_for_timeout(100)
    kind = state(pg)['card']
    if kind:
        tap(pg, '#card [data-btn="cardok"]', touch)
        pg.wait_for_function('__test.state().card === null')
    return kind


def go_and_wait(pg, mode_after, touch=False):
    pg.evaluate('__test.speed(8)')
    tap(pg, '[data-btn="go"]', touch)
    pg.wait_for_function('__test.state().mode === "run"', timeout=5000)
    pg.wait_for_function(f'__test.state().mode === "{mode_after}"', timeout=20000)


def play_twin(pg, lid, cards, from_party=True):
    """From a party, Next to level lid's twin (or it is open already): no card; its answer and spare: a party with the seed."""
    if from_party:
        tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, lid))
    for kind, c, r in TWIN[lid]:
        place(pg, kind, c, r)
    go_and_wait(pg, 'party')
    s = state(pg)
    check(cards[-1] is None and s['home'] == 5 and s['seedTaken'] and s['progress']['done'].get(lid) and s['progress']['seeds'].get(lid),
          f'PC: {lid}, the twin: no card (nothing new), and its answer with the spare: all five home with the seed ({cards[-1]}, {s["home"]}, {s["seedTaken"]})')


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
    check(n_markers == len(HOUSE_IDS) and locked == len(HOUSE_IDS) - 1 and future == 3 and pg.locator('[data-ride]').count() == 0,
          f'PC: the house shows the garden\'s levels ({len(HOUSE_IDS)}), all but the first locked, the plan\'s 2 places still to come and the zip-line\'s stop, soft (D-151, D-202) ({n_markers}, {locked}, {future})')
    check(pg.evaluate('document.getElementById("house-scroll").scrollWidth > document.getElementById("house-scroll").clientWidth'),
          'PC: the house is wider than the screen and scrolls sideways inside itself (D-140)')
    pg.screenshot(path=os.path.join(OUT, 'pc-2-house.png'))
    tap(pg, '[data-level="1"]')
    pg.wait_for_timeout(300)
    check(state(pg)['screen'] == 'house', 'PC: a locked level does not open')
    tap(pg, '[data-level="0"]')
    cards = [opened(pg, 'L1')]
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
    check(k == {'v': 2, 'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 1}, 'cards': {'bridge': True}} and not s['linked'],
          f'PC on its own: level 1 done, its seed, its one try and the bridge\'s card seen are kept in the device\'s entry, format 2 (D-147, D-171) ({k})')
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, 'pc-5-party.png'))
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    open2 = pg.locator('[data-level="1"].locked').count() == 0 and pg.locator('[data-level="2"].locked').count() == 1
    check(open2 and s['progress']['seeds'].get('L1') and state(pg)['at'] == 1, 'PC: back in the house, level 1\'s twin is open and the hamster waits there; level 2 is locked (pairs, D-166)')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'pc-6-house-after.png'))
    tap(pg, '[data-poke="duck"]')
    tap(pg, '[data-poke="jar"]')
    s = state(pg)
    check('quack' in s['heard'] and 'clink' in s['heard'], 'PC: the duck quacks and a jar clinks when tapped')

    # level 1's twin, then level 2
    tap(pg, '[data-level="1"]')
    play_twin(pg, 'L1b', cards, from_party=False)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L2'))
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

    # level 2's twin, then level 3
    play_twin(pg, 'L2b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L3'))
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

    # level 3's twin, then level 4: the floater
    play_twin(pg, 'L3b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L4'))
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
    held = []
    for ps in (s.get('poses') or []):
        carry = [i for i, p in enumerate(ps) if p in ('carry1', 'carry2')]
        floats = [i for i, p in enumerate(ps) if p == 'float']
        held.append(bool(carry and floats and carry[0] < floats[0] and not [i for i in carry if i > floats[-1]]))
    check(len(held) == 5 and held[0] and sum(held) >= 3,
          f'PC: level 4: having picked up the dandelion, a hamster walks on holding it overhead, then floats, and doesn\'t hold it once landed (D-177 (3), D-178) ({held}, {[ps[:12] for ps in (s.get("poses") or [])][:1]})')

    # level 4's twin, then level 5: the tube
    play_twin(pg, 'L4b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L5'))
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

    # level 5's twin, then level 6: the worn stick (D-143, D-153)
    play_twin(pg, 'L5b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L6'))
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

    # level 6's twin, then level 7: two layers of sticks
    play_twin(pg, 'L6b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L7'))
    check(pg.locator('#bg [data-back="loft"]').count() == 1, 'PC: level 7 has the loft for its backdrop (D-154)')
    for cc, rr in ((5, 4), (6, 4), (5, 3), (6, 3)):   # the lower layer first, as Rob did (ER-013)
        place(pg, 'stick', cc, rr)
    check(state(pg)['placed'] == {'5,4': 'stick', '6,4': 'stick', '5,3': 'stick', '6,3': 'stick'},
          f'PC: level 7: the lower layer of sticks first, then the upper: all four go down (D-177 (1), ER-013) ({state(pg)["placed"]})')
    place(pg, 'ramp', 4, 2)
    pg.screenshot(path=os.path.join(OUT, 'pc-15-level7-built.png'))
    go_and_wait(pg, 'party')
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and 'snap' in s['heard'], 'PC: level 7 with four sticks in two layers and the ramp before the gap: a snap, then all five home with the seed')

    # level 7's twin, then level 8: the wide board (D-158) and the see-saw (D-156)
    play_twin(pg, 'L7b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L8'))
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
    # level 8's twin, then level 9: the shed and the teacup lift with two cups (D-157, D-161)
    play_twin(pg, 'L8b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L9'))
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
    # level 9's twin, then level 10: the treehouse finale
    play_twin(pg, 'L9b', cards)
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L10'))
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
    # level 10's twin, the second finale (D-170 (c)), the last of 20
    play_twin(pg, 'L10b', cards)
    pg.screenshot(path=os.path.join(OUT, 'pc-19-level10b-party.png'))
    check(not pg.locator('#party [data-act="next"]').is_visible(), 'PC: after the garden\'s last level, level 10\'s twin, there is no Next: the park is reached by the ride (D-202)')
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'pc-10-house-all.png'))
    s = state(pg)
    check(s['scene'] == 'house' and pg.locator('[data-ride]').count() == 1 and pg.locator('[data-ride] text').text_content() == '21' and pg.locator('[data-ride] .glow').count() == 1
          and pg.locator('[data-level]').count() == len(HOUSE_IDS) + 1 and pg.locator('#back').is_hidden(),
          f'PC: back in the house after level 20, the zip-line\'s stop by the treehouse glows, numbered 21; no house button ({s["scene"]})')
    tap(pg, '[data-ride]')
    pg.wait_for_timeout(120)
    check(state(pg)['scene'] == 'park' and pg.locator('#ride g').count() > 0, 'PC: a tap on it plays the ride: the park opens with the hamster on the zip-line (D-202)')
    pg.screenshot(path=os.path.join(OUT, 'pc-20-ride.png'))
    pg.wait_for_function('!document.querySelector("#ride g")', timeout=5000)
    s = state(pg)
    check(s['scene'] == 'park' and s['at'] == IDS.index('L11') and 'wheee' in s['heard'] and pg.locator('#back').is_visible() and pg.locator('[data-level]').count() == len(IDS) - len(HOUSE_IDS),
          f'PC: the ride ends in the park, the hamster at level 21\'s stop by the pond, with a house button; the park shows its levels ({s["at"]}, {s["heard"][-3:]})')
    pg.screenshot(path=os.path.join(OUT, 'pc-21-park.png'))
    tap(pg, '#back')
    check(state(pg)['scene'] == 'house' and pg.locator('[data-ride]').count() == 1, 'PC: the house button goes back to the garden; the ride takes them to the park again')
    tap(pg, '[data-ride]')
    pg.wait_for_function('__test.state().scene === "park" && !document.querySelector("#ride g")', timeout=5000)
    tap(pg, f'[data-level="{IDS.index("L11")}"]')
    cards.append(opened(pg, 'L11'))
    check(cards[-1] == 'catapult' and pg.locator('#bg [data-back="pond"]').count() == 1 and float(pg.evaluate('document.querySelector("#window rect").getAttribute("height")')) == 540,
          f'PC: level 21 opens on the pond backdrop, 9 rows tall, and the catapult\'s card pops up (D-194, D-203) ({cards[-1]})')
    for kind, c, r in (('catapult', 4, 4), ('ramp', 10, 5)):
        place(pg, kind, c, r)
    # the spoon's throw (D-206, option B): watch for the placed spoon taking the throw class, with its reel and puff
    pg.evaluate('''() => { window.__threw = []; const b = document.getElementById('board');
      new MutationObserver((ms) => { const seen = new Set(); for (const m of ms) { const el = m.target;   // one throw per element per batch
        if (el.classList && el.classList.contains('throw') && !(m.oldValue || '').split(' ').includes('throw') && !seen.has(el)) { seen.add(el);
          window.__threw.push([el.closest('[data-placed]')?.dataset.placed, !!el.querySelector('.reel'), !!el.querySelector('.spoon'), !!el.querySelector('.spoon-puff')]); } } })
        .observe(b, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] }); }''')
    go_and_wait(pg, 'party')
    threw = pg.evaluate('window.__threw')
    check(len(threw) == 5 and all(t == ['4,4', True, True, True] for t in threw),
          f'PC: the spoon throws each of the five (D-206): the placed spoon at 4,4 takes the throw, its arm, reel and puff inside ({threw[:2]}, {len(threw)})')
    s = state(pg)
    check(s['home'] == 5 and s['seedTaken'] and 'boing' in s['heard'], f'PC: level 21 with the spoon at the bank\'s edge and the spare ramp: all five flung over and home with the seed ({s["heard"][-6:]})')
    pg.screenshot(path=os.path.join(OUT, 'pc-22-level21-party.png'))
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L11b'))
    for kind, c, r in (('bouncer', 2, 3), ('floater', 4, 0), ('bridge', 14, 6), ('ramp', 16, 5)):
        place(pg, kind, c, r)
    go_and_wait(pg, 'party')
    s = state(pg)
    check(cards[-1] is None and s['home'] == 5 and s['seedTaken'] and pg.locator('#party [data-act="next"]').is_visible(),
          f'PC: level 22, its twin (D-226): no card; the willow road (bounce up onto the branch, the dandelion down to the island, a bridge over the channel, a ramp up the jetty): '
          f'home with the seed; Next goes on in the park ({cards[-1]})')
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L12'))
    check(cards[-1] == 'signpost' and pg.locator('#bg [data-back="frame"]').count() == 1 and float(pg.evaluate('document.querySelector("#window rect").getAttribute("height")')) == 540
          and pg.locator('[data-slot="signpost"]').count() == 1 and pg.locator('[data-slot="rampL"]').count() == 1,
          f'PC: level 23 opens on the climbing frame, 9 rows tall, with the signpost and a left ramp in the tray, and the signpost\'s card pops up (D-208) ({cards[-1]})')
    for kind, c, r in (('bouncer', 3, 7), ('bouncer', 4, 4), ('signpost', 12, 4), ('rampL', 2, 1)):
        place(pg, kind, c, r)
    # facing left after the signpost: the first hamster's drawing mirrored (a negative x scale), watched while it runs
    pg.evaluate('''() => { window.__faced = new Set(); const t = setInterval(() => { const w = document.querySelector('#walkers [data-walker]');
      if (w) { const m = /scale\\((-?[\\d.]+)/.exec(w.getAttribute('transform') || ''); if (m) window.__faced.add(Number(m[1]) < 0 ? 'left' : 'right'); }
      if (__test.state().screen !== 'level' || document.querySelector('#party:not([hidden])')) clearInterval(t); }, 40); }''')
    go_and_wait(pg, 'party')
    s = state(pg)
    faced = sorted(pg.evaluate('[...window.__faced]'))
    check(s['home'] == 5 and s['seedTaken'] and faced == ['left', 'right'],
          f'PC: level 23: bounced up, turned round at the signpost (drawn facing left after it, D-190), bounced up-left, up the left ramp for the seed, all five home ({faced})')
    pg.screenshot(path=os.path.join(OUT, 'pc-23-level23-party.png'))
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L12b'))
    for kind, c, r in (('signpost', 8, 7), ('bouncer', 3, 7), ('bouncer', 2, 4), ('signpost', 0, 4), ('bridge', 4, 3)):
        place(pg, kind, c, r)
    go_and_wait(pg, 'party')
    s = state(pg)
    check(cards[-1] is None and s['home'] == 5 and s['seedTaken'] and pg.locator('#party [data-act="next"]').is_visible(),
          f'PC: level 24, its twin (D-226): no card; the zig-zag road (two signposts, two bouncers) and a bridge over the top bar\'s gap: home with the seed ({cards[-1]})')
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L13'))
    lid0 = pg.evaluate('getComputedStyle(document.querySelector("[data-lid=\\"0\\"]")).transform')
    check(cards[-1] == 'button' and pg.locator('#bg [data-back="picnic"]').count() == 1 and pg.locator('[data-cap="0"]').count() == 1 and lid0 not in ('none', 'matrix(1, 0, 0, 1, 0, 0)'),
          f'PC: level 25 opens on the picnic, the bottle top drawn and its lid standing up ({lid0}), and the button\'s card pops up (D-194) ({cards[-1]})')
    for kind, c, r in (('ramp', 1, 7), ('bouncer', 4, 6), ('bridge', 8, 4), ('floater', 12, 3), ('ramp', 19, 7), ('ramp', 20, 6), ('ramp', 21, 5), ('ramp', 16, 7)):
        place(pg, kind, c, r)
    # the counter's heads, each time it is drawn: [Pudding's head here?, lit?] for each of the five (D-216)
    pg.evaluate('''() => { window.__heads = []; const box = document.getElementById('count');
      new MutationObserver(() => { const h = box.querySelector('[data-hud="count"]'); if (!h) return;
        const heads = [...h.children].filter((e) => e.tagName === 'g' && e.id !== 'hud-seed');
        window.__heads.push(heads.map((e) => [e.dataset.pudhead || null, e.getAttribute('opacity') === null])); }).observe(box, { childList: true, subtree: true }); }''')
    # the lid's moves, and whether the clink was asked for by then (the state's sounds are the last 40 only: on this long
    # level the clink is gone from them by the party)
    pg.evaluate('''() => { window.__lid = []; window.__clink = false; const el = document.querySelector('[data-lid="0"]');
      new MutationObserver(() => { window.__lid.push(el.style.transform); window.__clink = window.__clink || __test.state().heard.includes('clink'); })
        .observe(el, { attributes: true, attributeFilter: ['style'] }); }''')
    go_and_wait(pg, 'party')
    s = state(pg)
    lid = pg.evaluate('window.__lid')
    heads = pg.evaluate('window.__heads')
    check(s['home'] == 5 and s['seedTaken'] and 'rotate(0deg)' in lid and pg.evaluate('window.__clink'),
          f'PC: level 25 (D-226): up the ramp onto the hamper, bounced onto the cake stand, the bottle top clicked and the lid swung down ({lid[:2]}), a bridge to the sandwich box, '
          f'the dandelion down onto the lid, the spare ramp for the seed and three ramps up the steps: all five home with the seed ({s["home"]}, {s["seedTaken"]}, {s["heard"][-10:]})')
    check(heads and all(len(x) == 5 and not any(p for p, _ in x) for x in heads) and all([l for _, l in x] == sorted([l for _, l in x], reverse=True) for x in heads) and all(l for _, l in heads[-1]),
          f'PC: level 25 has no Pudding: the counter shows five Nibble heads, lit in order by count as before (D-216) ({len(heads)} drawings, last {heads[-1] if heads else None})')
    pg.screenshot(path=os.path.join(OUT, 'pc-25-level25-party.png'))
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L13b'))
    lids = pg.evaluate('[...document.querySelectorAll("[data-lid]")].map((e) => e.style.transform)')
    check(lids == ['rotate(-90deg)'], f'PC: level 26 opens with its lid standing up ({lids})')
    for kind, c, r in (('catapult', 1, 7), ('ramp', 6, 7), ('bouncer', 7, 6), ('tube', 16, 3), ('tube', 17, 3), ('tube', 17, 2), ('floater', 21, 2), ('signpost', 23, 6)):
        place(pg, kind, c, r)
    go_and_wait(pg, 'party')
    s = state(pg)
    check(cards[-1] is None and s['home'] == 5 and s['seedTaken'] and pg.locator('[data-cap]').count() == 1 and pg.locator('#party [data-act="next"]').is_visible(),
          f'PC: level 26, its twin (D-229): no card, one bottle top; road A (the spoon over the jam pond with the seed, up onto the cake stand, three straws onto the teapot, the button, '
          f'the dandelion down, a signpost back under the cake stand over the lid) home with the seed ({cards[-1]})')
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L14'))
    check(cards[-1] == 'pudding' and pg.locator('#bg [data-back="playground"]').count() == 1, f'PC: level 27 opens on the playground and Pudding\'s card pops up ({cards[-1]})')
    # first the wrong road, the bouncer in place of the bridge: the Nibbles go over the bars, Pudding squashes the bouncer
    # and falls into the pond; the counter's heads watched as they are drawn (D-216: lit by who)
    for kind, c, r in (('bouncer', 6, 4), ('floater', 11, 4), ('bridge', 14, 8), ('bridge', 15, 8), ('catapult', 17, 7), ('ramp', 22, 6)):
        place(pg, kind, c, r)
    pg.evaluate('''() => { window.__heads = []; const box = document.getElementById('count');
      new MutationObserver(() => { const h = box.querySelector('[data-hud="count"]'); if (!h) return;
        const heads = [...h.children].filter((e) => e.tagName === 'g' && e.id !== 'hud-seed');
        window.__heads.push(heads.map((e) => [e.dataset.pudhead || null, e.getAttribute('opacity') === null])); }).observe(box, { childList: true, subtree: true }); }''')
    go_and_wait(pg, 'build')
    heads = pg.evaluate('window.__heads')
    out_of_order = [x for x in heads if not x[2][1] and any(l for _, l in x[3:])]
    check(heads and all([p for p, _ in x] == [None, None, 'C2', None, None] for x in heads) and [l for _, l in heads[-1]] == [True, True, False, True, True] and out_of_order,
          f'PC: level 27\'s counter (D-216): Pudding\'s own face in its place (third); with the bouncer in place of the bridge the four Nibbles get home and their faces light, '
          f'Pudding\'s stays faded (lit by who, not by count) ({len(heads)} drawings, last {heads[-1] if heads else None})')
    # then the bridge over the bars' gap too: road 1 with the spare bouncer
    place(pg, 'bridge', 7, 5)
    pg.evaluate('''() => { window.__pud = false; const t = setInterval(() => { const w = document.querySelector('#walkers [data-walker="2"]');
      if (w && w.innerHTML.includes('#FFF4DE')) window.__pud = true; if (__test.state().screen !== 'level' || document.querySelector('#party:not([hidden])')) clearInterval(t); }, 40); }''')
    go_and_wait(pg, 'party')
    s = state(pg)
    pud = pg.evaluate('window.__pud')
    check(s['home'] == 5 and s['seedTaken'] and pud and 'flump' in s['heard'],
          f'PC: level 27 (D-226): the third hamster drawn as Pudding squashes the marshmallow (a flump) and plods on over the bridge; the Nibbles bounce over the top for the seed; '
          f'all five home with the seed ({pud})')
    pg.screenshot(path=os.path.join(OUT, 'pc-27-level27-party.png'))
    tap(pg, '#party [data-act="next"]')
    cards.append(opened(pg, 'L14b'))
    for kind, c, r in (('ramp', 2, 7), ('catapult', 11, 7), ('ramp', 16, 7), ('ramp', 19, 6), ('tube', 21, 5), ('tube', 21, 4), ('tube', 21, 3), ('tube', 21, 2), ('signpost', 23, 2)):
        place(pg, kind, c, r)
    # the counter's heads, each time it is drawn: [Pudding's head here?, lit?] for each of the five (D-216)
    pg.evaluate('''() => { window.__heads = []; const box = document.getElementById('count');
      new MutationObserver(() => { const h = box.querySelector('[data-hud="count"]'); if (!h) return;
        const heads = [...h.children].filter((e) => e.tagName === 'g' && e.id !== 'hud-seed');
        window.__heads.push(heads.map((e) => [e.dataset.pudhead || null, e.getAttribute('opacity') === null])); }).observe(box, { childList: true, subtree: true }); }''')
    go_and_wait(pg, 'party')
    s = state(pg)
    heads = pg.evaluate('window.__heads')
    check(cards[-1] is None and s['home'] == 5 and s['seedTaken'] and not pg.locator('#party [data-act="next"]').is_visible(),
          f'PC: level 28, its twin (D-229): no card; road 2 round the sandpit (the spoon, two ramps up the steps, four straws up the far tower, the signpost, back along the slide\'s top): '
          f'home with the seed; no Next after the last level ({cards[-1]})')
    check(heads and all([p for p, _ in x] == [None, 'C2', None, None, None] for x in heads) and all(l for _, l in heads[-1]),
          f'PC: level 28\'s counter: Pudding\'s face second, as Pudding is (D-216) ({heads[-1] if heads else None})')
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    check(state(pg)['scene'] == 'park', 'PC: the house button after a park level goes back to the park')
    sizes_ok(pg, 'PC 1366x712', errors, asked)
    ids = IDS
    want = {'v': 2, 'done': {i: True for i in ids}, 'seeds': {i: True for i in ids},
            'tries': {'L1': 1, 'L2': 2, 'L3': 3, 'L4': 2, 'L5': 1, 'L6': 2, 'L7': 1, 'L8': 2, 'L9': 2, 'L10': 1, **{t: 1 for t in TWIN if t in IDS}, 'L11': 1, 'L11b': 1, 'L12': 1, 'L12b': 1, 'L13': 1, 'L13b': 1, 'L14': 2, 'L14b': 1},
            'cards': {c: True for c in ('bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost', 'button', 'pudding')}}
    check(cards == ['bridge', None, 'ramp', None, 'bouncer', None, 'floater', None, 'tube', None, 'stick', None, None, None, 'seesaw', None, 'lift', None, None, None, 'catapult', None, 'signpost', None, 'button', None, 'pudding', None],
          f'PC: each level\'s new gadget\'s card popped up once on the way, and was closed; none on the twins ({cards})')
    check(kept(pg) == want, f'PC on its own: the entry holds every level done, their seeds, and the GO presses until each was first done (1, 2, 3, 2, 1, 2, 1, 2, 2, 1, and 1 on each twin; the replays for seeds not counted) ({kept(pg)})')
    pg.reload()
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    s = state(pg)
    check(s['progress'] == {k: want[k] for k in ('done', 'seeds', 'tries', 'cards')} and pg.locator('[data-level].locked').count() == 0 and s['scene'] == 'park',
          f'PC on its own: after a reload, Play opens the park, where the hamster was; every level open, the seeds found ({s["progress"]})')
    pg.evaluate(f"localStorage.setItem('{ENTRY}', '{{oops')")
    pg.reload()
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    tap(pg, '#play')
    pg.wait_for_function('__test.state().screen === "house"')
    s = state(pg)
    check(s['progress'] == {'done': {}, 'seeds': {}, 'tries': {}, 'cards': {}} and s['at'] == 0, f'PC on its own: a broken entry starts afresh at level 1 ({s["progress"]})')
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
          f'wrapper: a child who did level 1 before the twins came: level 1\'s twin open and waiting, level 2 locked (D-170 (a)) ({s["at"]})')
    check(not fr.locator('#sound').is_visible(), 'wrapper: with sound off, the game\'s own sound button is hidden')
    pg.screenshot(path=os.path.join(OUT, 'wrapper-1-house.png'))
    ftap(pg, fr, '[data-level="1"]')
    fr.wait_for_function('__test.state().level === "L1b"')
    fr.wait_for_timeout(100)
    check(fr.evaluate('__test.state().card') is None, 'wrapper: level 1\'s twin opens with no card')
    fgo(pg, fr, 'build')
    last = pg.evaluate('window.__states[window.__states.length - 1]')
    check(last == {'v': 2, 'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 2, 'L1b': 1}, 'cards': {}}, f'wrapper: a GO goes out with fg:state at once, the try counted ({last})')
    ftap(pg, fr, '[data-slot="bridge"]'); fcell(pg, fr, 3, 4)
    fcell(pg, fr, 9, 6)
    fgo(pg, fr, 'party')
    last = pg.evaluate('window.__states[window.__states.length - 1]')
    check(last == {'v': 2, 'done': {'L1': True, 'L1b': True}, 'seeds': {}, 'tries': {'L1': 2, 'L1b': 2}, 'cards': {}}, f'wrapper: the party goes out with fg:state: level 1\'s twin done (GC7.5) ({last})')
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
        if pg.locator('#turn').is_visible():
            tap(pg, '#turn', True)   # the turn-sideways picture first, then the bridge's card
            pg.wait_for_timeout(100)
            turned = True
        else:
            turned = False
        opened(pg, 'L1', True)
        s = state(pg)
        want = 'bottom' if h > w else 'side'
        check(s['layout'] == want, f'{tag}: the tray goes {"below" if want == "bottom" else "at the side"} ({s["layout"]})')
        check(turned == (h > w), f'{tag}: the turn-sideways picture {"shows" if h > w else "stays hidden"}')
        pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-level.png'))
        if turned:
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
            done7 = {i: True for i in IDS[:IDS.index('L8')]}   # every level before level 8, the twins too
            pg.evaluate(f"localStorage.setItem('{ENTRY}', JSON.stringify({{v: 1, done: {json.dumps(done7)}, seeds: {{}}, tries: {{}}}}))")
            pg.reload()
            pg.wait_for_function('window.__test !== undefined && __test.state().ready')
            tap(pg, '#play', True)
            pg.wait_for_function('__test.state().screen === "house"')
            tap(pg, f'[data-level="{IDS.index("L8")}"]', True)
            opened(pg, 'L8', True)
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
