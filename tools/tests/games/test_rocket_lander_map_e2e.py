"""Browser test for Rocket Lander's map screens (step 2c-build, D-058, D-064 to D-068). Version 1.6.

Changes at v1.6 (D-072): the calm versions are back on, so less motion gets the calm hyperspace again.
Changes at v1.5 (Rob, 10 Nov): the portal by level 8 goes on through the full hyperspace; the
arrows and the galaxy keep the quick warp.
Changes at v1.4 (D-071): with the calm versions off for now, a device asking for less motion gets
the full hyperspace.
Changes at v1.3 (Rob, 10 Nov): after a flight in the galaxy the rocket rests by the planet a moment
before its map comes; hyperspace lasts longer.
Changes at v1.2 (Rob, 10 Nov): a tap on an open level flies the rocket over to it and the device keeps
it there, so leaving a round with home comes back to the rocket on that level.
Changes at v1.1: a tap on the waiting rocket makes it hop with a boing, and starts nothing.

Rocket Lander is one game with a map of solar systems (D-058). This test plays it on its own as a
plain page, with real taps on the page, and checks:
  - the map is home (D-066): no start card; the system the child is in, its eight levels left to
    right with the next one lit and the rest locked, the rocket waiting by its place with a Play
    bubble; the top bar's name, arrows and hangar door; the scene without its number line;
  - a locked level can't be opened; an open level's card says what it asks, shows a sample chip, its
    best stars and the rocks found there, and Play starts it (sketches 1, sections 1 and 2);
  - a round's end (sketches 1, section 3): a first pass opens the next level (D-064) and the rocket
    hops to it; a replay pays only what's above what the level holds: a level's 8 rocks are found
    once each across replays (Claude's reading, step 2c-1); a worse round takes nothing away;
  - progress format 3 on the device (D-058): the agreed shape, a reload keeps it, and formats 1 and
    2 and the old Rocket Sums entry are ignored (start afresh);
  - a system done (section 4): the end card says so, Hyperspace! takes the rocket to the next
    system's first level, and a reload opens there; the last stand-in system says more come soon;
  - the galaxy (section 5, D-065): every system along a path, the ones reached with their stars, the
    rest locked or coming soon; flying back, and the arrows between systems;
  - calm versions when the device asks for less motion (D-045);
  - phone upright, phone sideways and PC, light and dark: nothing scrolls sideways, the markers and
    the Play bubble are on screen, big enough to tap and clear of each other and the top bar, and
    the cards fit; no console errors and nothing fetched from outside (D-043).

Stand-ins: headless Chromium (Playwright) for the phone and PC, a local static server for the
family site. Screenshots show made-up play only and are never committed.
Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_lander_map_e2e.py [folder for screenshots]
"""
import functools, http.server, json, os, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-map-')
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
BASE = f'{LOCAL}games/rocket-lander/index.html?track=year2'  # the stand-in levels these checks were written for (D-089)
KEY = 'family-games:rocket-lander:progress'
errors, fails, outside = [], [], []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def new_page(br, w=390, h=844, mobile=True, scheme='dark', motion='no-preference'):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                         is_mobile=mobile, has_touch=mobile, color_scheme=scheme, reduced_motion=motion)

    def route(r):
        url = r.request.url
        if url.startswith(LOCAL) or url.startswith('data:') or url.startswith('blob:'):
            return r.continue_()
        outside.append(url)
        return r.abort()
    ctx.route('**/*', route)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
          if m.type in ('error', 'warning') and 'ERR_FAILED' not in m.text else None)
    return pg


def open_game(br, entry=None, **kw):
    """The game on a fresh device, or with a progress entry kept on it."""
    pg = new_page(br, **kw)
    pg.goto(BASE)
    pg.wait_for_function('window.__test && __test.state().ready')
    if entry is not None:
        pg.evaluate('([k, e]) => localStorage.setItem(k, JSON.stringify(e))', [KEY, entry])
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
    settle(pg)
    return pg


def st(pg):
    return pg.evaluate('__test.state()')


def mp(pg):
    return pg.evaluate('__test.state().map')


def settle(pg, timeout=15000):
    """Wait until the map isn't moving (hops, drops, warps)."""
    pg.wait_for_function('(() => { const s = __test.state(); return s.screen !== "map" || (s.map && !s.map.busy); })()', timeout=timeout)
    pg.wait_for_timeout(150)


def tap(pg, sel):
    """A real tap in the middle of an element on the page."""
    b = pg.locator(sel).bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def tap_level(pg, lid):
    p = pg.evaluate(f'__test.mapHit("{lid}")')
    pg.mouse.click(p['x'], p['y'])


def entry(pg):
    return pg.evaluate(f'JSON.parse(localStorage.getItem("{KEY}"))')


def play_round(pg, pattern, landings=None):
    """A round from the fly phase on: True lands on the target, False just beside it; then Bip's
    moment and the end card."""
    for i, good in enumerate(pattern):
        pg.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {i}', timeout=20000)
        pg.wait_for_timeout(120)
        pg.evaluate('__test.right()' if good else '__test.wrong()')
        pg.wait_for_function('__test.state().phase === "landed"', timeout=10000)
        pg.evaluate('__test.speed(4)')
        pg.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "finale" || s.phase === "end" || (s.phase === "fly" && s.idx === {i + 1}); }})()', timeout=20000)
        pg.evaluate('__test.speed(1)')
    pg.evaluate('__test.speed(4)')
    pg.wait_for_function('__test.state().phase === "end"', timeout=20000)
    pg.evaluate('__test.speed(1)')
    pg.wait_for_timeout(300)


def start_from_bubble(pg):
    tap(pg, '#play')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=10000)


def three(pg):
    """Rounds of 3 landings, to keep the test short: 3 right is 3 stars, 2 is 2, 1 is 1."""
    return pg.evaluate('__test.begin({ settings: { landings_per_round: 3 } })')


MOON7 = {'v': 3, 'at': 'moon-8', 'open': 'moon-8', 'rocks': 56, 'landings': 56, 'ship': 'classic', 'ships': ['classic'],
         'levels': {f'moon-{n}': {'stars': 3, 'rocks': 8} for n in range(1, 8)}}  # made up: Moon 1 to 7 done

with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- The map is home (D-066) ----------
    pg = open_game(br)
    s = st(pg)
    m = s['map']
    check(s['screen'] == 'map' and s['phase'] == 'map' and pg.locator('#start').count() == 0, f'the game opens on the map, with no start card (D-066): {s["screen"]}')
    check(m['system'] == 'moon' and len(m['markers']) == 8 and [k['id'] for k in m['markers']] == [f'moon-{n}' for n in range(1, 9)],
          f"the Moon's map with its eight levels: {[k['id'] for k in m['markers']]}")
    check([k['state'] for k in m['markers']] == ['next'] + ['locked'] * 7, f"level 1 lit as the next, the rest locked: {[k['state'] for k in m['markers']]}")
    check(m['at'] == 'moon-1' and m['rocketAt'] == 'moon-1' and m['rocket']['shown'], f"the rocket waits at level 1: {m['at']}")
    check(pg.is_visible('#play') and pg.inner_text('#sys-name') == 'Moon' and 'system 1 of 6' in pg.inner_text('#sys-of'),
          f"Play by the rocket; the top bar names the system: {pg.inner_text('#sys-name')!r}, {pg.inner_text('#sys-of')!r}")
    check(pg.get_attribute('#sys-prev', 'aria-disabled') == 'true' and pg.get_attribute('#sys-next', 'aria-disabled') == 'true',
          'the arrows are off: no system before the Moon, and Red Dust not reached yet')
    check(pg.is_visible('#hangar') and pg.inner_text('#map-rocks') == '0', 'the hangar door with the moon rocks is on the top bar (D-052)')
    check(s['bare'] is True, 'the scene shows the sky and ground without the number line')
    pg.screenshot(path=f'{OUT}/map-phone-fresh.png')
    # a tap on the waiting rocket: a happy hop and a boing, and nothing else (a small delight)
    n0 = len(st(pg)['heard'])
    tap(pg, '.rocket-hit')
    pg.wait_for_timeout(200)
    hopping = mp(pg)['step']
    settle(pg)
    s = st(pg)
    check(hopping == 'boing' and 'boing' in s['heard'][n0:] and s['screen'] == 'map' and s['card'] is None and s['map']['rocketAt'] == 'moon-1',
          f'a tap on the rocket makes it hop with a boing, and starts nothing: {hopping}, {s["heard"][n0:]}')

    # ---------- A locked level stays shut; an open level's card ----------
    n0 = len(s['heard'])
    tap_level(pg, 'moon-3')
    pg.wait_for_timeout(400)
    s = st(pg)
    check(s['screen'] == 'map' and s['card'] is None and 'boop' in s['heard'][n0:], f'a locked level shakes and boops, and opens nothing: {s["heard"][n0:]}')
    tap_level(pg, 'moon-1')
    pg.wait_for_selector('#level-card:not([hidden])')
    card = pg.evaluate("""(() => ({ h: document.getElementById('lc-h').textContent, about: document.getElementById('lc-about').textContent,
      chip: document.getElementById('lc-chip').textContent.trim(), sys: document.getElementById('lc-sys').textContent,
      slots: document.querySelectorAll('#lc-rocks .slot').length, on: document.querySelectorAll('#lc-rocks .slot.on').length,
      note: document.getElementById('lc-note').textContent, none: document.getElementById('lc-stars').classList.contains('none') }))()""")
    check(card == {'h': 'Level 1', 'about': 'Land on numbers, 0 to 5', 'chip': '3', 'sys': 'Moon', 'slots': 8, 'on': 0,
                   'note': '8 moon rocks to find here!', 'none': True}, f"level 1's card: what it asks, a sample chip, no stars yet, 8 rocks to find: {card}")
    check(st(pg)['screen'] == 'card', 'the card is open')
    pg.screenshot(path=f'{OUT}/card-phone-level1.png')
    tap(pg, '#lc-close')
    pg.wait_for_timeout(200)
    check(pg.is_hidden('#level-card') and st(pg)['screen'] == 'map', 'the card closes')

    # ---------- A first round: 3 of 3 right opens level 2 (D-064) ----------
    three(pg)
    tap_level(pg, 'moon-1')
    pg.wait_for_selector('#level-card:not([hidden])')
    tap(pg, '#lc-play')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=10000)
    s = st(pg)
    check(s['levelId'] == 'moon-1' and s['level'] == 1 and s['kind'] == 'number' and s['line']['to'] == 5 and not s['bare'],
          f"the card's Play starts level 1 on its line, 0 to 5, the number line back: {s['levelId']}, {s['line']}")
    play_round(pg, [True, True, True])
    s = st(pg)
    r = s['result']
    check(r and r['passed'] and r['first'] and r['opened'] == 'moon-2' and r['now'] == {'stars': 3, 'rocks': 3} and r['rocks'] == 3,
          f'3 of 3 right, all perfect: 3 stars, 3 rocks found and paid, level 2 opened: {r}')
    endc = pg.evaluate("""(() => ({ h: document.getElementById('end-h').textContent, nb: !!document.querySelector('#end-stars .nb'),
      on: document.querySelectorAll('#end-rocks .slot.on').length, rocks: document.getElementById('end-rocks-p').textContent,
      lbl: document.getElementById('unlock-lbl').textContent, name: document.getElementById('unlock-name').textContent,
      un: !document.getElementById('unlock').hidden, go: document.getElementById('to-map').textContent.trim() }))()""")
    check(endc == {'h': 'Super landing!', 'nb': True, 'on': 3, 'rocks': '+3 moon rocks!', 'lbl': 'Open now!', 'name': 'Level 2', 'un': True, 'go': 'Map'},
          f'the end card: the cheer, NEW, 3 rocks in their slots, "+3 moon rocks!", level 2 open, and Map: {endc}')
    rep = pg.evaluate('__test.reported()')
    check(len(rep) == 1 and rep[0]['level'] == 1 and rep[0]['stars'] == 3, f'the round is reported as level 1, 3 stars: {rep}')
    e = entry(pg)
    check(e == {'v': 4, 'track': 'year2', 'edition': 'stand-in', 'at': 'moon-2', 'open': 'moon-2', 'levels': {'moon-1': {'stars': 3, 'rocks': 3}}, 'rocks': 3, 'landings': 3, 'ship': 'classic', 'ships': ['classic'], 'maps': {}},
          f'kept on the device at format 4, in the agreed shape (D-058, D-089): {e}')
    check(pg.evaluate('Object.keys(localStorage)') == [KEY], 'only the one game\'s entry is written')
    pg.screenshot(path=f'{OUT}/end-phone-first.png')
    tap(pg, '#to-map')
    pg.wait_for_function('__test.state().screen === "map"')
    pg.wait_for_timeout(250)
    hop = mp(pg)['step']
    settle(pg)
    m = mp(pg)
    check(hop in ('unlock', 'hop') and m['at'] == 'moon-2' and m['rocketAt'] == 'moon-2', f'back on the map, level 2 bursts open and the rocket hops to it: {hop}, at {m["rocketAt"]}')
    check([k['state'] for k in m['markers']][:3] == ['done', 'next', 'locked'] and m['markers'][0]['stars'] == 3,
          f"level 1 done with 3 stars, level 2 next, level 3 locked: {[(k['state'], k['stars']) for k in m['markers'][:3]]}")
    check(pg.inner_text('#map-rocks') == '3', 'the hangar door shows the 3 rocks')
    pg.screenshot(path=f'{OUT}/map-phone-after1.png')

    # ---------- A replay pays only what's missing ----------
    tap_level(pg, 'moon-1')
    pg.wait_for_selector('#level-card:not([hidden])')
    note = pg.inner_text('#lc-note')
    stars_on = pg.evaluate("document.querySelectorAll('#lc-stars svg.on').length")
    check(stars_on == 3 and note == '5 moon rocks still to find!', f"level 1's card now: best 3 stars, 8 - 3 = 5 rocks still to find: {stars_on}, {note!r}")
    tap(pg, '#lc-play')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=10000)
    check(st(pg)['levelId'] == 'moon-1', 'the rocket hops back to level 1 and plays it')
    play_round(pg, [True, True, False])
    r = st(pg)['result']
    check(r['now'] == {'stars': 3, 'rocks': 5} and r['rocks'] == 2 and not r['newBest'] and r['opened'] is None and r['next'] == 'moon-2',
          f'a 2-star replay: the best stays 3, 2 more rocks (3 + 2 = 5), nothing new opens, the rocket goes on to level 2: {r}')
    check(pg.inner_text('#end-h') == 'Great flying!' and pg.locator('#end-stars .nb').count() == 0, 'no NEW for a replay that beats nothing')
    tap(pg, '#to-map')
    settle(pg)
    # all 8 found: a round on a level with 7 found pays 1, then none
    pg.evaluate('(e) => __test.begin({ state: e, settings: { landings_per_round: 3 } })',
                {**entry(pg), 'v': 3, 'at': 'moon-1', 'levels': {'moon-1': {'stars': 3, 'rocks': 7}}})
    settle(pg)
    rocks0 = st(pg)['progress']['rocks']
    start_from_bubble(pg)
    play_round(pg, [True, True, True])
    r = st(pg)['result']
    check(r['rocks'] == 1 and r['now']['rocks'] == 8 and st(pg)['progress']['rocks'] == rocks0 + 1 and st(pg)['roundRocks'] == 1,
          f'3 perfect landings with 7 found already: only 1 rock flies and is paid (7 + 1 = 8): {r["rocks"]}, round {st(pg)["roundRocks"]}')
    tap(pg, '#again')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=10000)
    play_round(pg, [True, True, True])
    r = st(pg)['result']
    check(r['rocks'] == 0 and st(pg)['roundRocks'] == 0 and pg.inner_text('#end-rocks-p') == "You've found all 8 rocks here",
          f'Play again with all 8 found: no rock flies, and the card says so: {pg.inner_text("#end-rocks-p")!r}')
    tap(pg, '#to-map')
    settle(pg)
    k1 = [k for k in mp(pg)['markers'] if k['id'] == 'moon-1'][0]
    check(k1['rocks'] == 8 and k1['stars'] == 3, f'level 1 on the map: 3 stars and every rock found: {k1}')

    # ---------- Tapping an open level flies the rocket there; leaving a round keeps it there (Rob, 10 Nov) ----------
    check(mp(pg)['rocketAt'] == 'moon-2', f'before: the rocket waits at level 2: {mp(pg)["rocketAt"]}')
    tap_level(pg, 'moon-1')
    pg.wait_for_selector('#level-card:not([hidden])')
    pg.wait_for_function('!__test.state().map.busy', timeout=10000)
    check(mp(pg)['rocketAt'] == 'moon-1' and entry(pg)['at'] == 'moon-1',
          f'a tap on open level 1 flies the rocket over to it, and the device keeps it there: {mp(pg)["rocketAt"]}, kept {entry(pg)["at"]}')
    tap(pg, '#lc-play')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=10000)
    # the launcher is P-020's page: a blank page stands in for it here, so its own fetches aren't counted as the game's
    pg.route(lambda u: u.startswith(LOCAL) and '/games/' not in u, lambda r: r.fulfill(status=200, content_type='text/html', body='<!doctype html><title>launcher</title>'))
    tap(pg, 'button[aria-label="Back to games"]')
    pg.wait_for_url(lambda u: 'rocket-lander' not in u, timeout=10000)  # home has left the game (ER-005)
    pg.wait_for_load_state()
    pg.goto(BASE)
    pg.wait_for_function('window.__test && __test.state().ready')
    settle(pg)
    check(mp(pg)['rocketAt'] == 'moon-1', f'home in the middle of level 1, then back: the rocket is still at level 1: {mp(pg)["rocketAt"]}')
    tap_level(pg, 'moon-2')
    pg.wait_for_selector('#level-card:not([hidden])')
    pg.wait_for_function('!__test.state().map.busy', timeout=10000)
    tap(pg, '#lc-close')
    check(mp(pg)['rocketAt'] == 'moon-2' and entry(pg)['at'] == 'moon-2', f'closing the card leaves the rocket where it flew: {mp(pg)["rocketAt"]}')

    # ---------- A round of 1 star opens nothing; the rocket stays to try again ----------
    pg.evaluate('__test.begin({ level: 2, settings: { landings_per_round: 3 } })')
    settle(pg)
    start_from_bubble(pg)
    play_round(pg, [True, False, False])
    r = st(pg)['result']
    lbl = pg.evaluate("[document.getElementById('unlock-lbl').textContent, document.getElementById('unlock-name').textContent]")
    check(not r['passed'] and r['opened'] is None and r['next'] == 'moon-2' and lbl == ['Get 2 stars to open', 'Level 3'],
          f'1 star on level 2: nothing opens, and the card says how to open level 3: {lbl}')
    pg.screenshot(path=f'{OUT}/end-phone-1star.png')
    tap(pg, '#to-map')
    settle(pg)
    m = mp(pg)
    check(m['rocketAt'] == 'moon-2' and [k['state'] for k in m['markers']][1:3] == ['next', 'locked'], f'the rocket waits at level 2, level 3 still locked: {m["rocketAt"]}')
    pg.context.close()

    # ---------- Format 3 only: older entries start afresh (D-058) ----------
    for bad, why in (({'v': 2, 'unlocked': 4, 'planet': 'dust', 'rocks': 40, 'landings': 9, 'ship': 'teapot', 'ships': ['classic', 'teapot']}, 'a format 2 entry'),
                     ({'v': 1, 'unlocked': 3, 'planet': 'moon', 'rocks': 37, 'landings': 40}, 'a format 1 entry'),
                     ('{broken', 'a broken entry')):
        pg = new_page(br)
        pg.goto(BASE)
        pg.wait_for_function('window.__test && __test.state().ready')
        pg.evaluate('([k, e]) => localStorage.setItem(k, typeof e === "string" ? e : JSON.stringify(e))', [KEY, bad])
        pg.evaluate('(e) => localStorage.setItem("family-games:rocket-sums:progress", JSON.stringify(e))', {'v': 2, 'unlocked': 6, 'rocks': 99})
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
        p = st(pg)['progress']
        check(p['at'] == 'moon-1' and p['open'] == 'moon-1' and p['rocks'] == 0 and p['levels'] == {} and p['ships'] == ['classic'],
              f'{why} (and the old Rocket Sums entry beside it) is ignored: a fresh start: {p}')
        pg.context.close()

    # ---------- A system done: hyperspace to the next (D-058) ----------
    pg = open_game(br, MOON7)
    m = mp(pg)
    check(m['at'] == 'moon-8' and [k['state'] for k in m['markers']] == ['done'] * 7 + ['next'], f"Moon's levels 1 to 7 done, level 8 next: {[k['state'] for k in m['markers']]}")
    pg.screenshot(path=f'{OUT}/map-phone-moon8.png')
    three(pg)
    start_from_bubble(pg)
    check(st(pg)['levelId'] == 'moon-8', 'Play by the rocket starts level 8')
    play_round(pg, [True, True, True])
    r = st(pg)['result']
    check(r['done'] and r['hyper'] and r['next'] == 'dust-1' and r['opened'] == 'dust-1', f'level 8 passed: Moon done, on to Red Dust 1: {r}')
    endc = pg.evaluate("""(() => ({ done: document.getElementById('end-done').hidden ? null : document.getElementById('end-done').textContent,
      lbl: document.getElementById('unlock-lbl').textContent, name: document.getElementById('unlock-name').textContent, go: document.getElementById('to-map').textContent.trim() }))()""")
    check(endc == {'done': 'Moon done! ★ 24 of 24', 'lbl': 'Next stop', 'name': 'Red Dust', 'go': 'Hyperspace!'}, f'the end card: Moon done, the next stop, and Hyperspace!: {endc}')
    pg.screenshot(path=f'{OUT}/end-phone-moon-done.png')
    tap(pg, '#to-map')
    pg.wait_for_function('__test.state().screen === "hyper"', timeout=5000)
    pg.wait_for_timeout(1300)
    hy = mp(pg)['hyper']
    check(hy and hy['to'] == 'Red Dust' and pg.is_hidden('#map'), f'hyperspace, off to Red Dust: {hy}')
    pg.screenshot(path=f'{OUT}/hyper-phone.png')
    pg.wait_for_function('__test.state().screen === "map"', timeout=10000)
    pg.wait_for_timeout(300)
    banner = mp(pg)['banner']
    settle(pg)
    m = mp(pg)
    check(m['system'] == 'dust' and m['at'] == 'dust-1' and m['rocketAt'] == 'dust-1' and banner == 'Welcome to Red Dust!' and m['markers'][0]['state'] == 'next',
          f'landed on Red Dust\'s map, level 1 lit, with a welcome: {m["system"]}, {m["at"]}, {banner!r}')
    check(pg.inner_text('#sys-name') == 'Red Dust' and pg.get_attribute('#sys-prev', 'aria-disabled') == 'false', 'the top bar names Red Dust; the arrow back to the Moon is on')
    pg.screenshot(path=f'{OUT}/map-phone-dust.png')
    pg.reload()
    pg.wait_for_function('window.__test && __test.state().ready')
    settle(pg)
    check(mp(pg)['system'] == 'dust', 'a reload opens on Red Dust, the system the child is in (D-066)')

    # ---------- The galaxy (D-065) ----------
    tap(pg, '#to-galaxy')
    pg.wait_for_function('__test.state().screen === "galaxy"')
    pg.wait_for_timeout(700)
    g = mp(pg)['galaxy']
    check([o['id'] for o in g] == ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'] and [o['reached'] for o in g] == [True, True, False, False, False, False]
          and [o['soon'] for o in g] == [False, False, True, True, True, True] and [o['here'] for o in g] == [False, True, False, False, False, False],
          f'the galaxy: six systems; Moon and Red Dust reached, the rocket at Red Dust, the rest coming soon: {[(o["id"], o["reached"], o["here"]) for o in g]}')
    check(g[0]['stars'] == {'got': 24, 'of': 24} and g[1]['stars'] == {'got': 0, 'of': 24}, f"each system's stars: {g[0]['stars']}, {g[1]['stars']}")
    ys = [o['y'] for o in g]
    check(len({round(y) for y in ys}) > 2 or len({round(o['x']) for o in g}) > 2, f'the planets sit along a winding path, not a straight line (D-065): {[(round(o["x"]), round(o["y"])) for o in g]}')
    check(pg.locator('button[aria-label="Back to games"]').is_hidden(), 'the home button steps aside while the galaxy covers the screen')
    pg.screenshot(path=f'{OUT}/galaxy-phone.png')
    n0 = len(st(pg)['heard'])
    p = pg.evaluate('__test.mapHit("gx:candy")')
    pg.mouse.click(p['x'], p['y'])
    pg.wait_for_timeout(400)
    check(st(pg)['screen'] == 'galaxy' and 'boop' in st(pg)['heard'][n0:], 'Candy, coming soon, shakes and stays shut')
    p = pg.evaluate('__test.mapHit("gx:moon")')
    pg.mouse.click(p['x'], p['y'])
    pg.wait_for_timeout(300)
    check(mp(pg)['flying'], 'tapping the Moon flies the rocket along the path')
    pg.wait_for_function('(() => { const f = __test.state().map.arrived; return f !== null && f >= 0.2; })()', timeout=10000)
    check(st(pg)['screen'] == 'galaxy', 'the rocket rests by the Moon for a moment before the map comes (Rob, 10 Nov)')
    pg.wait_for_function('__test.state().screen === "map" && __test.state().map.system === "moon"', timeout=10000)
    settle(pg)
    m = mp(pg)
    check(m['at'] == 'moon-8' and m['rocketAt'] == 'moon-8', f'back on the Moon, the rocket waits at its first level with something left to win (level 8, 3 rocks found): {m["at"]}')
    # the arrows: the Moon to Red Dust and back
    tap(pg, '#sys-next')
    pg.wait_for_timeout(250)
    seen_hyper = st(pg)['screen'] == 'hyper'
    pg.wait_for_function('__test.state().map.system === "dust"', timeout=8000)
    settle(pg)
    check(mp(pg)['at'] == 'dust-1' and not seen_hyper, 'the arrow flies on to Red Dust, to its newest level, by the quick warp')
    tap(pg, '#sys-prev')
    pg.wait_for_function('__test.state().map.system === "moon"', timeout=8000)
    settle(pg)
    check(mp(pg)['system'] == 'moon' and entry(pg)['at'] == 'moon-8', 'and back again; the place is kept on the device')
    # the portal by level 8 goes on through hyperspace, the full one (Rob, 10 Nov)
    p = pg.evaluate('__test.mapHit("portal")')
    pg.mouse.click(p['x'], p['y'])
    pg.wait_for_function('__test.state().screen === "hyper"', timeout=5000)
    check(mp(pg)['hyper']['dur'] > 5 and mp(pg)['hyper']['to'] == 'Red Dust', f'the portal: hyperspace to Red Dust: {mp(pg)["hyper"]}')
    pg.wait_for_function('__test.state().screen === "map" && __test.state().map.system === "dust"', timeout=12000)
    pg.wait_for_timeout(300)
    banner = mp(pg)['banner']
    settle(pg)
    check(mp(pg)['rocketAt'] == 'dust-1' and entry(pg)['at'] == 'dust-1' and banner == 'Welcome to Red Dust!', f'through the portal: Red Dust\'s map, the rocket at level 1, a welcome: {mp(pg)["rocketAt"]}, {banner!r}')
    tap(pg, '#sys-prev')
    pg.wait_for_function('__test.state().map.system === "moon"', timeout=8000)
    settle(pg)
    tap(pg, '#to-galaxy')
    pg.wait_for_function('__test.state().screen === "galaxy"')
    tap(pg, '#gx-back')
    pg.wait_for_function('__test.state().screen === "map"')
    check(mp(pg)['system'] == 'moon', 'the galaxy\'s back button returns to the map')
    pg.context.close()

    # ---------- The last stand-in system: more coming soon ----------
    D7 = {**MOON7, 'at': 'dust-8', 'open': 'dust-8', 'levels': {**MOON7['levels'], 'moon-8': {'stars': 3, 'rocks': 8},
          **{f'dust-{n}': {'stars': 2, 'rocks': 4} for n in range(1, 8)}}}
    pg = open_game(br, D7, w=844, h=390)
    three(pg)
    start_from_bubble(pg)
    check(st(pg)['kind'] == 'sums' and st(pg)['sum'], f'Red Dust 8 is a sums level: {st(pg)["sum"]}')
    play_round(pg, [True, True, True])
    r = st(pg)['result']
    endc = pg.evaluate("[document.getElementById('unlock-lbl').textContent, document.getElementById('unlock-name').textContent, document.getElementById('to-map').textContent.trim()]")
    check(r['done'] and r['soon'] and not r['hyper'] and r['next'] == 'dust-8' and endc == ['Coming soon', 'More systems!', 'Map'],
          f'Red Dust 8 passed: Red Dust done, more systems soon, no hyperspace: {endc}')
    tap(pg, '#to-map')
    pg.wait_for_function('__test.state().screen === "map"')
    pg.wait_for_timeout(300)
    check(mp(pg)['banner'] == 'More systems soon!', f'the map says more systems are coming: {mp(pg)["banner"]!r}')
    settle(pg)
    pg.screenshot(path=f'{OUT}/map-sideways-dust-done.png')
    pg.context.close()

    # ---------- Less motion (D-045, back on by D-072): calm hyperspace, the map still works ----------
    pg = open_game(br, MOON7, motion='reduce')
    three(pg)
    start_from_bubble(pg)
    play_round(pg, [True, True, True])
    tap(pg, '#to-map')
    pg.wait_for_function('__test.state().screen === "hyper"', timeout=5000)
    check(mp(pg)['hyper']['dur'] < 2.5, f'less motion: a shorter, calm hyperspace: {mp(pg)["hyper"]}')
    pg.wait_for_function('__test.state().screen === "map" && __test.state().map.system === "dust"', timeout=10000)
    check(True, 'less motion: it lands on Red Dust all the same')
    pg.context.close()

    # ---------- Sizes and looks: phone upright and sideways, PC; light and dark ----------
    for (w, h, mob) in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
        for scheme in ('light', 'dark'):
            pg = open_game(br, {**MOON7, 'at': 'moon-5', 'open': 'moon-5', 'levels': {f'moon-{n}': {'stars': 3 - n % 2, 'rocks': n} for n in range(1, 5)}},
                           w=w, h=h, mobile=mob, scheme=scheme)
            m = mp(pg)
            boxes = pg.evaluate("""(() => ['to-galaxy', 'sys-prev', 'sys-next', 'sys-name', 'hangar', 'play'].map((id) => {
              const r = document.getElementById(id).getBoundingClientRect(); return { id, l: r.left, t: r.top, r: r.right, b: r.bottom }; }))()""")
            wide = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
            bar_bottom = max(b['b'] for b in boxes if b['id'] != 'play')
            mk = m['markers']
            on = all(k['r'] <= k['x'] <= w - k['r'] and bar_bottom < k['y'] - k['r'] and k['y'] + k['r'] < h for k in mk)
            apart = all(((a['x'] - b['x']) ** 2 + (a['y'] - b['y']) ** 2) ** 0.5 >= a['r'] + b['r'] + 6 for i, a in enumerate(mk) for b in mk[i + 1:])
            taps = [pg.evaluate(f'__test.mapHit("{k["id"]}")') for k in mk]
            big = all(t and t['w'] >= 48 and t['h'] >= 48 for t in taps)
            bar = [b for b in boxes if b['id'] != 'play']
            clear = all(a['r'] <= b['l'] or b['r'] <= a['l'] or a['b'] <= b['t'] or b['b'] <= a['t'] for i, a in enumerate(bar) for b in bar[i + 1:])
            play = [b for b in boxes if b['id'] == 'play'][0]
            play_ok = 0 <= play['l'] and play['r'] <= w and play['t'] >= bar_bottom - 1 and play['b'] <= h
            check(wide <= 0 and on and apart and big and clear and play_ok,
                  f'{w}x{h} {scheme}: no sideways scroll ({wide}), markers on screen below the bar ({on}), apart ({apart}), 48 px to tap ({big}), '
                  f'the bar\'s buttons clear of each other ({clear}), Play on screen ({play_ok})')
            if scheme == 'dark':
                pg.screenshot(path=f'{OUT}/size-{w}x{h}-map.png')
            tap_level(pg, 'moon-3')
            pg.wait_for_selector('#level-card:not([hidden])')
            fit = pg.evaluate("(() => { const c = document.getElementById('level-card'); const r = c.getBoundingClientRect(); return [c.scrollHeight - c.clientHeight, r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth]; })()")
            check(fit[0] <= 1 and fit[1], f'{w}x{h} {scheme}: the level card fits without scrolling: {fit}')
            if scheme == 'dark':
                pg.screenshot(path=f'{OUT}/size-{w}x{h}-card.png')
            pg.wait_for_function('!__test.state().map.busy', timeout=10000)  # the rocket flies to level 3 first
            tap(pg, '#lc-close')
            tap(pg, '#to-galaxy')
            pg.wait_for_function('__test.state().screen === "galaxy"')
            pg.wait_for_timeout(700)
            g = mp(pg)['galaxy']
            gon = all(o['r'] <= o['x'] <= w - o['r'] and o['r'] <= o['y'] <= h - o['r'] for o in g)
            check(gon and pg.evaluate('document.documentElement.scrollWidth - innerWidth') <= 0, f'{w}x{h} {scheme}: the galaxy\'s planets are all on screen')
            if scheme == 'dark':
                pg.screenshot(path=f'{OUT}/size-{w}x{h}-galaxy.png')
            pg.context.close()
    br.close()

httpd.shutdown()
check(not outside, 'nothing fetched from outside the local server' + ('' if not outside else ': ' + ' | '.join(sorted(set(outside))[:5])))
check(not errors, 'no console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
