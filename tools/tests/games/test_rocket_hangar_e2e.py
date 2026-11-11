"""Browser test for the rocket game's hangar: the door, the showroom, buying and flying a ship.
Version 1.9.

Changes at v1.9 (checkpoint after step 2c-3c, D-105, ER-007): progress has been format 4 since the tracks
came in (D-089), so a purchase is kept at format 4, and the "unknown version starts afresh" check uses
version 5 (4 is known now); the checks are otherwise unchanged.

Changes at v1.8 (step 2c-3b, D-100): Year 2 replaced the stand-in levels on the higher track, so this
test's pages are served the stand-in map it was written for (stand_in.py: map.js 2.0, byte for byte,
checked by its sha256) in place of the game's map.js; its checks are unchanged.

Changes at v1.7 (step 2d-2, D-077 to D-080): thirteen ships, cheapest first in each tier (D-079),
so the right arrow from the Teapot shows the Jack-in-the-Box (35 - 7 = 28 rocks short), refused
with 7 rocks. The five new ships join the picture check: each is flown through a round of 3
landings and Bip's moment, nothing of it or its effects below the line's edge (ER-003), and
each lands with its own sound (D-077).

Changes at v1.6 (D-072): the calm versions are back on; the less-motion checks expect calm again.
Changes at v1.5 (D-071): with the calm versions off for now, a device asking for less motion gets
the full effects.
Changes at v1.4 (Rob, 10 Nov): the ship badges are 44 px or more, clear of each other and of the
big button, and go into rows on narrow screens (320 px wide added to the sizes).

Changes at v1.3 (step 2c-build, D-052, D-058, D-066): the map is home. The hangar door is on the
map's top bar, with the rocks on it, and the showroom shuts back to the map; the map's rocket is the
ship flown (the start card's title rocket went with the card). Progress is format 3: the made-up
entries are format 3, an entry without ships has Classic owned and flown, and the unknown format
version is 4 (formats 1 and 2 start afresh, checked in test_rocket_lander_map_e2e.py).

Changes at v1.2 (step 2c-build, D-058): one rocket game. What ran in both tiles now runs twice in
Rocket Lander, the second time on a sums level (map level 9 for the round after buying, 15 for the
picture check, a times level with its beam and stretch), so both kinds of level are still flown
with every check; the progress entry is the one game's.

Changes at v1.1 (step 2a-4c, D-045, D-047, D-051): Crystal Comet, Golden Phoenix and Aurora
Cruiser are on sale: in both tiles they are bought with real taps (500 - 100 - 140 - 200 = 60
rocks left) and the Aurora Cruiser flies and lands with its own touchdown sound. A picture check:
every ship but Classic is flown through a round of 3 landings and Bip's moment in Rocket Lander
(phone sideways), and in Rocket Sums for the three new ones, drawing the ship and its effects
alone (__test.shipPixels) again and again; nothing may show below the line's edge, where the
numbers are written. With less motion the ship flown is told to be calm and makes fewer effects,
and the Golden Phoenix's wings hold still (the Aurora Cruiser's still ribbons are checked by reading only).

Step 2a-4b (D-046, D-050 to D-053). Played on its own as a plain page, in both tiles (Rocket
Lander and Rocket Sums share the engine in games/_common/rocket/). With real taps on the page:
  - a version 1 progress entry still loads, as Classic owned and flown (D-053);
  - the hangar door on the start card shows the ship flown; the title's rocket never changes (D-052);
  - the door opens the showroom, which starts on the ship flown; badges, arrows and a swipe
    change ship; the big button buys a ship there are enough rocks for, at its price, once;
  - it refuses a ship the rocks don't cover and the three not flying until 2a-4c (D-051);
  - after buying, Bip runs in and the new ship is flown: in the doorway and in play;
  - the progress entry is written at format version 2 with the ships, and a reload keeps them;
    odd entries are tidied, and an unknown version starts afresh;
  - begin() takes ships in the saved state, as the shell will;
  - the showroom fits phone, phone sideways and PC, light and dark, with no sideways scrolling
    and its buttons on screen, and still works with less motion.

Stand-ins: headless Chromium (Playwright) for the phone and PC, a local static server for the
family site. Screenshots show made-up play only and are never committed.
Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_hangar_e2e.py [folder for screenshots]
"""
import functools, http.server, json, os, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright
import stand_in  # the stand-in map these checks were written for (step 2c-3b)

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='hangar-shots-')
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
errors, fails, outside = [], [], []
V1 = {'v': 3, 'at': 'moon-3', 'open': 'moon-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}, 'moon-2': {'stars': 2, 'rocks': 4}}, 'rocks': 37, 'landings': 40}  # made up; no ships


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def new_page(br, w, h, mobile, scheme='light', motion='no-preference'):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                         is_mobile=mobile, has_touch=mobile, color_scheme=scheme, reduced_motion=motion)

    def route(r):
        url = r.request.url
        if url.startswith(LOCAL) or url.startswith('data:') or url.startswith('blob:'):
            return r.continue_()
        outside.append(url)
        return r.abort()
    ctx.route('**/*', route)
    stand_in.serve(ctx)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
          if m.type in ('error', 'warning') and 'ERR_FAILED' not in m.text else None)
    return pg


def ready(pg):
    pg.wait_for_function('window.__test && __test.state().ready')


GAME = 'rocket-lander'  # D-058: one rocket game; the sums levels are its map's Red Dust (9 to 16)


def open_tile(br, tile, w=390, h=844, mobile=True, entry=V1, level=None, **kw):
    """The game, with a progress entry on the device if given, and a level to play if given."""
    pg = new_page(br, w, h, mobile, **kw)
    pg.goto(f'{LOCAL}games/{GAME}/index.html?track=year2')  # the stand-in levels (D-089)
    ready(pg)
    if entry is not None:
        pg.evaluate('([k, e]) => localStorage.setItem(k, JSON.stringify(e))', [key(tile), entry])
        pg.reload()
        ready(pg)
    if level is not None:
        pg.evaluate(f'__test.begin({{ level: {level} }})')
    pg.wait_for_timeout(300)
    return pg


def key(tile):
    return f'family-games:{GAME}:progress'


def st(pg):
    return pg.evaluate('__test.state()')


def hangar(pg):
    return pg.evaluate('__test.state().hangar')


def entry_of(pg, tile):
    return pg.evaluate(f'JSON.parse(localStorage.getItem("{key(tile)}"))')


def tap(pg, hit):
    """A real tap or click on one of the showroom's buttons, where it is drawn."""
    p = pg.evaluate(f'__test.hangarHit({json.dumps(hit)})')
    if not p:
        return False
    pg.mouse.click(p['x'], p['y'])
    return True


def open_hangar(pg):
    pg.click('#hangar')
    pg.wait_for_function('__test.state().hangar && __test.state().hangar.open && __test.state().hangar.door >= 1', timeout=10000)
    pg.wait_for_timeout(200)


def show(pg, ship):
    ok = tap(pg, f'badge:{ship}')
    pg.wait_for_function(f'__test.state().hangar.cur === "{ship}" && !__test.state().hangar.switching', timeout=5000)
    return ok


PREMIUM = [('crystal', 100), ('phoenix', 140), ('aurora', 200)]
OTHERS = [('box', 20), ('teapot', 30), ('pod', 50), ('saucer', 70)]
NEW = [('tub', 25, 'splosh'), ('jack', 35, 'jackPop'), ('sunflower', 40, 'bzzz'), ('spin', 60, 'spinClunk'), ('tree', 80, 'tada')]  # D-077


def play_round_pixels(pg, sid, tag, full=True, level=None):
    """Fly a round of 3 landings (or one, if not full), all right, with Bip's moment if full,
    drawing the ship flown and its effects alone again and again (__test.shipPixels)."""
    pg.evaluate('(l) => __test.begin({ level: l ?? undefined, settings: { landings_per_round: 3 } })', level)
    pg.click('#play', force=True)
    pg.wait_for_function('__test.state().phase === "fly"')
    out = {'n': 0, 'below': 0, 'drawn': False, 'flown': None, 'finale': False, 'worst': None}

    def look():
        p = pg.evaluate('__test.shipPixels()')
        if p:
            out['n'] += 1
            out['drawn'] = out['drawn'] or p['above'] > 0
            if p['below'] > out['below']:
                out['below'], out['worst'] = p['below'], st(pg)['phase']
    for i in range(3 if full else 1):
        pg.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {i}', timeout=20000)
        for _ in range(3):
            pg.wait_for_timeout(150)
            look()
        out['flown'] = st(pg)['flown']
        pg.evaluate('__test.place(__test.state().target ?? 0)')
        if i == 0:
            pg.wait_for_timeout(250)
            pg.screenshot(path=f'{OUT}/pix-{tag}-{sid}-fly.png')
        pg.evaluate('__test.right()')
        for _ in range(12):  # coming down, touchdown and its show
            pg.wait_for_timeout(110)
            look()
        if i == 0:
            pg.screenshot(path=f'{OUT}/pix-{tag}-{sid}-land.png')
        if full and i < 2:
            pg.evaluate('__test.speed(4)')
            pg.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {i + 1}', timeout=20000)
            pg.evaluate('__test.speed(1)')
    if full:
        pg.wait_for_function('__test.state().phase === "finale"', timeout=20000)
        out['finale'] = True
        shot = False
        while st(pg)['phase'] == 'finale':
            look()
            if not shot and (st(pg)['finale'] or {}).get('t', 0) > 2.2:
                pg.screenshot(path=f'{OUT}/pix-{tag}-{sid}-finale.png')
                shot = True
            pg.wait_for_timeout(200)
    return out


with sync_playwright() as pw:
    br = pw.chromium.launch()
    for tile, lv in (('rocket-lander', None), ('sums level', 9)):
        T = tile
        # ---------- A version 1 entry loads as Classic (D-053) ----------
        pg = open_tile(br, T, level=lv)
        p = st(pg)['progress']
        OPEN = 'moon-3' if lv is None else 'dust-1'  # begin({ level: 9 }) takes the rocket to Red Dust 1 and opens the map up to it
        check(p['ship'] == 'classic' and p['ships'] == ['classic'] and p['rocks'] == 37 and p['open'] == OPEN,
              f'{T}: an entry without ships loads with Classic owned and flown: {p}')
        check(pg.is_visible('#hangar') and pg.inner_text('#map-rocks') == '37',
              f'{T}: the map\'s top bar has the hangar door, with the rocks on it (D-052)')
        check(st(pg)['doorShip'] == 'classic' and st(pg)['map']['rocket']['ship'] == 'classic', f'{T}: the doorway and the map\'s rocket show the ship flown')
        pg.screenshot(path=f'{OUT}/{T}-start.png')

        # ---------- The showroom: starts on the ship flown ----------
        open_hangar(pg)
        h = hangar(pg)
        check(h['cur'] == 'classic' and h['verdict'] == 'flying', f'{T}: the showroom opens on the ship flown: {h}')
        pg.screenshot(path=f'{OUT}/{T}-showroom-classic.png')

        # ---------- Buy the Teapot (30) with 37 rocks ----------
        show(pg, 'teapot')
        check(hangar(pg)['verdict'] == 'buy', f'{T}: the Teapot can be bought with 37 rocks')
        pg.screenshot(path=f'{OUT}/{T}-showroom-teapot.png')
        tap(pg, 'action')
        pg.wait_for_function('__test.state().progress.ships.includes("teapot")', timeout=8000)
        p = st(pg)['progress']
        check(p['rocks'] == 7 and p['ships'] == ['classic', 'teapot'], f'{T}: bought at its price, 37 - 30 = 7 left: {p}')
        e = entry_of(pg, T)
        check(e and e.get('v') == 4 and e.get('rocks') == 7 and e.get('ships') == ['classic', 'teapot'] and e.get('open') == OPEN,
              f'{T}: the purchase is kept on the device straight away, at format version 4 (D-089), the map kept too: {e}')
        pg.wait_for_timeout(700)
        pg.screenshot(path=f'{OUT}/{T}-showroom-bought.png')
        pg.wait_for_function('__test.state().progress.ship === "teapot" && !__test.state().hangar.bip', timeout=10000)
        check(hangar(pg)['verdict'] == 'flying', f'{T}: after Bip runs in, the Teapot is the ship flown')
        check(entry_of(pg, T).get('ship') == 'teapot', f'{T}: the ship flown is kept on the device')
        tap(pg, 'action')
        pg.wait_for_timeout(500)
        check(st(pg)['progress']['rocks'] == 7, f'{T}: pressing the button again buys nothing')

        # ---------- Refused: not enough rocks; not flying until 2a-4c ----------
        tap(pg, 'right')
        pg.wait_for_function('__test.state().hangar.cur === "jack" && !__test.state().hangar.switching', timeout=5000)
        check(hangar(pg)['verdict'] == 'need', f'{T}: the right arrow shows the Jack-in-the-Box (D-079), 35 - 7 = 28 rocks short')
        tap(pg, 'action')
        pg.wait_for_timeout(600)
        p = st(pg)['progress']
        check(p['rocks'] == 7 and p['ships'] == ['classic', 'teapot'], f'{T}: the Jack-in-the-Box is refused with 7 rocks: {p}')
        pg.screenshot(path=f'{OUT}/{T}-showroom-need.png')
        show(pg, 'crystal')
        check(hangar(pg)['verdict'] == 'need', f'{T}: Crystal Comet is on sale now (2a-4c), 100 - 7 = 93 rocks short')
        pg.screenshot(path=f'{OUT}/{T}-showroom-crystal.png')
        # a swipe to the left shows the next ship
        box = pg.locator('#hangar-room').bounding_box()
        y = box['y'] + box['height'] * 0.45
        pg.mouse.move(box['x'] + box['width'] * 0.7, y); pg.mouse.down()
        for i in range(1, 9):
            pg.mouse.move(box['x'] + box['width'] * (0.7 - 0.05 * i), y)
            pg.wait_for_timeout(16)
        pg.mouse.up()
        pg.wait_for_function('__test.state().hangar.cur === "phoenix" && !__test.state().hangar.switching', timeout=5000)
        check(True, f'{T}: a swipe shows the next ship')

        # ---------- Back to the map, and into play ----------
        tap(pg, 'back')
        pg.wait_for_function('!__test.state().hangar.open', timeout=8000)
        pg.wait_for_timeout(300)
        check(pg.is_visible('#map') and st(pg)['doorShip'] == 'teapot' and st(pg)['map']['rocket']['ship'] == 'teapot',
              f'{T}: back on the map, the doorway and the map\'s rocket show the Teapot')
        pg.screenshot(path=f'{OUT}/{T}-start-teapot.png')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"')
        pg.wait_for_timeout(900)
        check(st(pg)['flown'] == 'teapot', f'{T}: the Teapot flies in play')
        pg.screenshot(path=f'{OUT}/{T}-fly-teapot.png')
        pg.evaluate('__test.right()')
        pg.wait_for_function('__test.state().phase === "landed"')
        pg.wait_for_timeout(500)
        pg.screenshot(path=f'{OUT}/{T}-land-teapot.png')
        check(st(pg)['results'][0]['right'], f'{T}: it lands like any rocket')

        # ---------- A reload keeps the ships ----------
        pg.reload(); ready(pg)
        p = st(pg)['progress']
        check(p['ship'] == 'teapot' and p['ships'] == ['classic', 'teapot'] and p['rocks'] == 7, f'{T}: a reload keeps the ships: {p}')
        for bad, want, why in (
            ({**V1, 'ship': 'aurora', 'ships': ['aurora', 'box', 'box', 'zzz']}, ('aurora', ['classic', 'box', 'aurora'], 37), 'odd ships are tidied: repeats and unknown ones dropped, Classic added (the Aurora Cruiser flies since 2a-4c)'),
            ({**V1, 'v': 5, 'ship': 'box', 'ships': ['box']}, ('classic', ['classic'], 0), 'an unknown version (5) starts afresh'),
        ):
            pg.evaluate('([k, e]) => localStorage.setItem(k, JSON.stringify(e))', [key(T), bad])
            pg.reload(); ready(pg)
            p = st(pg)['progress']
            check((p['ship'], p['ships'], p['rocks']) == want, f'{T}: {why}: {p}')
        # the shell hands the state in (stage 3): begin() takes the ships
        ok = pg.evaluate('(s) => __test.begin({ state: s })', {'at': 'moon-1', 'open': 'moon-1', 'levels': {}, 'rocks': 3, 'landings': 0, 'ship': 'box', 'ships': ['classic', 'box']})
        pg.wait_for_timeout(200)
        check(ok and st(pg)['progress']['ship'] == 'box' and st(pg)['doorShip'] == 'box', f'{T}: begin() takes the ships handed in')
        pg.context.close()

        # ---------- The Premium and Legendary ships (2a-4c): bought with real taps, then flown ----------
        pg = open_tile(br, T, entry={**V1, 'rocks': 500}, level=lv)
        open_hangar(pg)
        left = 500
        for sid, price in PREMIUM:
            show(pg, sid)
            on_sale = hangar(pg)['verdict'] == 'buy'
            check(on_sale, f'{T}: {sid} is on sale, and {left} rocks cover its {price}')
            if on_sale:
                tap(pg, 'action')
                pg.wait_for_function(f'__test.state().progress.ship === "{sid}" && !__test.state().hangar.bip', timeout=15000)
            p = st(pg)['progress']
            check(p['rocks'] == left - price and sid in p['ships'], f'{T}: {sid} bought at its price, {left} - {price} = {left - price} left, and flown: {p}')
            left -= price
        pg.wait_for_timeout(600)
        pg.screenshot(path=f'{OUT}/{T}-showroom-aurora.png')
        e = entry_of(pg, T)
        check(e and e.get('rocks') == 60 and e.get('ships') == ['classic', 'crystal', 'phoenix', 'aurora'] and e.get('ship') == 'aurora',
              f'{T}: kept on the device: 500 - 100 - 140 - 200 = 60 rocks, all three owned, the Aurora Cruiser flown: {e}')
        tap(pg, 'back')
        pg.wait_for_function('!__test.state().hangar.open', timeout=8000)
        pg.wait_for_timeout(300)
        check(st(pg)['doorShip'] == 'aurora' and st(pg)['map']['rocket']['ship'] == 'aurora', f'{T}: the doorway and the map show the Aurora Cruiser')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"')
        pg.wait_for_timeout(900)
        check(st(pg)['flown'] == 'aurora', f'{T}: the Aurora Cruiser flies in play')
        n0 = len(st(pg)['heard'])
        pg.evaluate('__test.right()')
        pg.wait_for_function('__test.state().phase === "landed"')
        pg.wait_for_timeout(500)
        s = st(pg)
        check(s['results'][0]['right'] and 'aurora' in s['heard'][n0:], f'{T}: it lands like any rocket, with its own touchdown sound: {s["heard"][n0:]}')
        pg.screenshot(path=f'{OUT}/{T}-land-aurora.png')
        pg.context.close()

    # ---------- Effects never over the numbers (D-045): each ship flown, its effects drawn alone ----------
    SOUND = {sid: snd for sid, _, snd in NEW}
    for tile, ships, lv in (('rocket-lander', [s for s, _ in OTHERS] + [s for s, _, _ in NEW] + [s for s, _ in PREMIUM], None), ('sums level', [s for s, _ in PREMIUM], 15)):
        for sid in ships:
            pg = open_tile(br, tile, 844, 390, True, {**V1, 'ship': sid, 'ships': ['classic', sid]})
            pix = play_round_pixels(pg, sid, tile.replace(' ', '-'), full=tile == 'rocket-lander', level=lv)
            check(pix['flown'] == sid and pix['n'] > 10 and pix['drawn'] and pix['below'] == 0,
                  f'{tile} {sid}: flown; in {pix["n"]} looks (flying, landing{", Bip" + chr(39) + "s moment" if pix["finale"] else ""}) '
                  f'nothing of the ship or its effects below the line\'s edge: {pix}')
            if sid in SOUND:
                heard = st(pg)['heard']
                check(SOUND[sid] in heard, f'{tile} {sid}: lands with its own sound, {SOUND[sid]} (D-077): {heard[-12:]}')
            pg.context.close()
    # less motion: the ship flown is calm, makes about a third of the effects, and stays off the numbers
    pg = open_tile(br, 'rocket-lander', 844, 390, True, {**V1, 'ship': 'aurora', 'ships': ['classic', 'aurora']}, motion='reduce')
    pix = play_round_pixels(pg, 'aurora', 'calm', full=False)
    sh = st(pg)['ship']
    check(sh and sh['calm'] and sh['k'] == 0.35 and pix['below'] == 0, f'less motion: the Aurora Cruiser flies calmly, with fewer effects, off the numbers: {sh} {pix}')
    pg.context.close()
    for motion, still in (('reduce', True), ('no-preference', False)):
        pg = open_tile(br, 'rocket-lander', 844, 390, True, {**V1, 'ship': 'phoenix', 'ships': ['classic', 'phoenix']}, motion=motion)
        play_round_pixels(pg, 'phoenix', 'calm' if still else 'beat', full=False)
        sh = st(pg)['ship']
        check(sh and (sh['flap'] == 0) == still, f'{motion}: the Golden Phoenix\'s wings {"hold still" if still else "beat"} (wing beat clock {sh and sh["flap"]})')
        pg.context.close()

    # ---------- Sizes and looks (Rocket Lander): phone, sideways, PC; light and dark ----------
    for (w, h, mobile) in [(390, 844, True), (844, 390, True), (1280, 800, False), (360, 740, True)]:
        for scheme in ('light', 'dark'):
            pg = open_tile(br, 'rocket-lander', w, h, mobile, {**V1, 'rocks': 75}, scheme=scheme)
            wide = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
            card = pg.evaluate('(() => { const r = document.getElementById("hangar").getBoundingClientRect(); return r.right > innerWidth || r.left < 0 || r.top < -20 ? 2 : 0; })()')
            if scheme == 'light':
                pg.screenshot(path=f'{OUT}/size-{w}x{h}-start.png')
            open_hangar(pg)
            show(pg, 'saucer')
            wide = max(wide, pg.evaluate('document.documentElement.scrollWidth - innerWidth'))
            hits = {k: pg.evaluate(f'__test.hangarHit("{k}")') for k in ('action', 'back', 'left', 'right', 'badge:classic', 'badge:aurora')}
            on = all(v and 0 <= v['x'] <= w and 0 <= v['y'] <= h for v in hits.values())
            check(wide <= 0 and card <= 1 and on, f'{w}x{h} {scheme}: no sideways scrolling ({wide}), the hangar door on screen on the map ({card}), showroom buttons on screen: {hits}')
            # the badges (Rob, 10 Nov): at least 44 px, clear of each other and of the big button, in rows when narrow
            ids = ['classic', 'box', 'tub', 'teapot', 'jack', 'sunflower', 'pod', 'spin', 'saucer', 'tree', 'crystal', 'phoenix', 'aurora']  # all thirteen (D-079)
            bs = [pg.evaluate(f'__test.hangarHit("badge:{i}")') for i in ids]
            act = hits['action']
            big = all(b and min(b['w'], b['h']) >= 44 for b in bs)
            apart = all(abs(a['x'] - b['x']) >= (a['w'] + b['w']) / 2 or abs(a['y'] - b['y']) >= (a['h'] + b['h']) / 2 for i, a in enumerate(bs) for b in bs[i + 1:])
            clear = all(b['y'] - b['h'] / 2 >= act['y'] + act['h'] / 2 or abs(b['x'] - act['x']) >= (b['w'] + act['w']) / 2 for b in bs)
            rows = len({round(b['y']) for b in bs})
            check(big and apart and clear and (rows >= 2 if w < 400 else True) and all(0 <= b['x'] - b['w'] / 2 and b['x'] + b['w'] / 2 <= w for b in bs),
                  f'{w}x{h} {scheme}: the ship badges are 44 px or more ({[round(b["w"]) for b in bs]}), apart, clear of the big button, on screen, in {rows} row(s)')
            if scheme == 'light':
                pg.screenshot(path=f'{OUT}/size-{w}x{h}-showroom.png')
            pg.context.close()

    # ---------- Less motion: the showroom still opens and buys ----------
    pg = open_tile(br, 'rocket-lander', 390, 844, True, {**V1, 'rocks': 25}, motion='reduce')
    open_hangar(pg)
    show(pg, 'box')
    tap(pg, 'action')
    pg.wait_for_function('__test.state().progress.ship === "box"', timeout=12000)
    check(st(pg)['progress']['rocks'] == 5 and hangar(pg)['calm'], 'less motion: the Cardboard Box is bought and flown, calmly (25 - 20 = 5)')
    pg.context.close()
    br.close()

httpd.shutdown()
check(not outside, 'nothing fetched from outside the local server' + ('' if not outside else ': ' + ' | '.join(sorted(set(outside))[:5])))
check(not errors, 'no console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
