"""Hamster Highway's help cards in a browser (D-167, D-168, D-170). Version 1.0 (16 Nov, step 8).

The checks, decided before the build:
  - on a new device, level 1 opens with the bridge's card over the board: its caption on screen, a picture that
    moves (CSS animations running, and two pictures 1.2 s apart differ), and a green tick; a tap anywhere but the
    tick leaves it up and puts nothing down; the tick closes it, and the level plays as before;
  - the card is seen once per child: it is saved at once (progress format 2, D-171) and level 1 opened again has no
    card; a child with format 1 progress (all ten levels done, no cards) sees each card once, on the first level
    that brings it in: bridge, ramp, bouncer, floater, tube, stick, nothing on level 7 (the stick seen on 6),
    see-saw, lift, nothing on level 10; all eight are then kept;
  - the help button (a "?" on the board, while building): it puts a "?" on each gadget in the tray and on the
    see-saw or lift; a tap on a gadget or part shows its card, and the tick takes it away; a tap elsewhere ends
    help with nothing shown or put down; no help button during a run;
  - in the stand-in wrapper, a card seen goes out with fg:state at once (format 2) and nothing is kept on the
    device; a child whose progress says the bridge's card was seen gets no card on level 1;
  - on a phone held upright and sideways, by touch: the card fits the screen, its caption is at least 14 px tall,
    the tick closes it, help and a gadget show its card; no sideways scrolling;
  - the captions are on screen only: nothing is spoken (speechSynthesis is never asked), no script errors, and
    nothing fetched but the game's own files and the shared font.
Headless Chromium is the stand-in for the PC and the phone, as test_hamster_highway_e2e.py. Pictures of every card
go to OUT/ (default /tmp/hamster-highway-cards) for looking over.

Usage, from the repo root:
    python3 -B tools/tests/games/test_hamster_highway_cards_e2e.py [OUT]
Exits 1 if a check fails.
"""
import functools, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-highway-cards'
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
ENTRY = 'family-games:hamster-highway:progress'
WRAP = f'{BASE}/__wrapper.html'
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
# counts anything spoken: the captions must stay on screen only (the release check's rule)
NO_SPEECH = """(() => { window.__spoke = 0; try { if (window.speechSynthesis) speechSynthesis.speak = () => { window.__spoke++; }; } catch (e) {} })()"""
CAPTION = {'bridge': 'Bridges cross the gaps', 'lift': 'Hop in and ride up!'}
EIGHT = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift']

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


def kept(pg):
    return json.loads(pg.evaluate(f"localStorage.getItem('{ENTRY}')") or 'null')


def open_page(br, w, h, touch=False):
    ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch)
    ctx.add_init_script(NO_SPEECH)
    pg = ctx.new_page()
    errors, asked = [], []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
    pg.on('request', lambda r: asked.append(r.url))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    return ctx, pg, errors, asked


def to_house(pg, touch=False):
    tap(pg, '#play', touch)
    pg.wait_for_function('__test.state().screen === "house"')


def open_level(pg, i, touch=False):
    pg.locator(f'[data-level="{i}"]').first.scroll_into_view_if_needed()   # the house scrolls sideways; a child swipes to the stop
    pg.wait_for_timeout(100)
    tap(pg, f'[data-level="{i}"]', touch)
    pg.wait_for_function(f'__test.state().screen === "level" && __test.state().level === "L{i + 1}"')
    pg.wait_for_timeout(150)


def card_moving(pg):
    return pg.evaluate('''document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.target
      && a.effect.target.closest && a.effect.target.closest('#card')).length''')


def sizes_ok(pg, tag, errors, asked):
    check(not errors, f'{tag}: no script errors {errors[:2]}')
    others = [u for u in asked if u != URL and not u.startswith(OWN)]
    check(not others, f'{tag}: fetches only its own files and the shared font {others[:3]}')
    check(not pg.evaluate('document.scrollingElement.scrollWidth > innerWidth'), f'{tag}: no sideways scrolling of the page')
    check(pg.evaluate('window.__spoke') == 0, f'{tag}: nothing is spoken: the captions are on screen only')


def close_card(pg, touch=False):
    tap(pg, '#card [data-btn="cardok"]', touch)
    pg.wait_for_function('__test.state().card === null')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---- the PC, a new device: level 1's card, once
    ctx, pg, errors, asked = open_page(br, 1366, 712)
    to_house(pg)
    open_level(pg, 0)
    s = state(pg)
    check(s['card'] == 'bridge' and pg.locator('#card [data-card="bridge"]').count() == 1, f'PC: level 1 opens with the bridge\'s card over the board ({s["card"]})')
    check(pg.locator('#card text', has_text=CAPTION['bridge']).count() == 1 and pg.locator('#card text', has_text=CAPTION['bridge']).first.is_visible(),
          f'PC: its caption "{CAPTION["bridge"]}" is on screen')
    moving = card_moving(pg)
    a = pg.locator('#card [data-card]').screenshot()
    pg.wait_for_timeout(1200)
    b = pg.locator('#card [data-card]').screenshot()
    pg.screenshot(path=os.path.join(OUT, 'pc-card-bridge.png'))
    check(moving > 0 and a != b, f'PC: the card\'s picture moves: {moving} animations running, and two pictures 1.2 s apart differ (D-168)')
    check(s['progress']['cards'] == {'bridge': True} and (kept(pg) or {}).get('v') == 2 and (kept(pg) or {}).get('cards') == {'bridge': True},
          f'PC: the card is marked seen and kept at once, format 2 (D-171) ({kept(pg)})')
    cell(pg, 10, 6)   # on the card, off the tick (square 5,6 lies under the tick)
    cell(pg, 1, 1)    # on the dimmed board, off the card
    s = state(pg)
    check(s['card'] == 'bridge' and s['placed'] == {} and s['selected'] is None, f'PC: a tap off the tick leaves the card up and puts nothing down ({s["card"]}, {s["placed"]})')
    close_card(pg)
    check(pg.locator('#card [data-card]').count() == 0, 'PC: the green tick closes the card')
    tap(pg, '[data-slot="bridge"]')
    cell(pg, 5, 6)
    check(state(pg)['placed'] == {'5,6': 'bridge'}, 'PC: after the card, the level plays as before: the bridge goes over the gap')
    cell(pg, 5, 6)
    # help: the "?" then the gadget
    check(pg.locator('[data-btn="help"]').count() == 1 and pg.locator('[data-btn="help"]').first.is_visible(), 'PC: the help button shows while building')
    tap(pg, '[data-btn="help"]')
    s = state(pg)
    check(s['help'] and pg.locator('[data-help]').count() == 1 and pg.locator('[data-help="bridge"]').count() == 1,
          f'PC: help puts a "?" on the tray\'s one gadget ({s["help"]}, {pg.locator("[data-help]").count()})')
    pg.screenshot(path=os.path.join(OUT, 'pc-help.png'))
    tap(pg, '[data-slot="bridge"]')
    s = state(pg)
    check(s['card'] == 'bridge' and not s['help'] and s['selected'] is None, f'PC: in help, a tap on the bridge shows its card, and picks nothing up ({s["card"]}, {s["selected"]})')
    close_card(pg)
    tap(pg, '[data-btn="help"]')
    cell(pg, 3, 2)
    s = state(pg)
    check(not s['help'] and s['card'] is None and s['placed'] == {} and pg.locator('[data-help]').count() == 0,
          f'PC: in help, a tap elsewhere ends help with nothing shown or put down ({s["help"]}, {s["card"]}, {s["placed"]})')
    tap(pg, '[data-btn="help"]')
    tap(pg, '[data-btn="help"]')
    check(not state(pg)['help'], 'PC: a second tap on the help button ends help')
    tap(pg, '[data-slot="bridge"]')
    cell(pg, 5, 6)
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_function('__test.state().mode === "run"')
    check(pg.locator('[data-btn="help"]').count() == 0, 'PC: no help button during a run')
    pg.evaluate('__test.speed(8)')
    pg.wait_for_function('__test.state().mode === "party"', timeout=20000)
    tap(pg, '#party [data-act="house"]')
    pg.wait_for_function('__test.state().screen === "house"')
    open_level(pg, 0)
    check(state(pg)['card'] is None and pg.locator('#card [data-card]').count() == 0, 'PC: level 1 opened again has no card: once per child (D-170)')
    sizes_ok(pg, 'PC, a new device', errors, asked)

    # ---- format 1 progress, all ten done, no cards: each card once, on the first level that brings it in
    ids = [f'L{i}' for i in range(1, 11)]
    pg.evaluate(f"localStorage.setItem('{ENTRY}', JSON.stringify({{v: 1, done: {json.dumps({i: True for i in ids})}, seeds: {{}}, tries: {{L1: 2}}}}))")
    pg.reload()
    pg.wait_for_function('window.__test !== undefined && __test.state().ready')
    to_house(pg)
    check(state(pg)['progress'] == {'done': {i: True for i in ids}, 'seeds': {}, 'tries': {'L1': 2}, 'cards': {}}, 'PC: a format 1 entry is read, with no cards seen')
    shown = []
    for i in range(10):
        open_level(pg, i)
        s = state(pg)
        shown.append(s['card'])
        if s['card']:
            pg.wait_for_timeout(1500)
            pg.screenshot(path=os.path.join(OUT, f'pc-card-{s["card"]}.png'))
            check(card_moving(pg) > 0 and pg.locator('#card text', has_text=s['caption']).count() == 1, f'PC: the {s["card"]}\'s card moves and shows its caption "{s["caption"]}"')
            close_card(pg)
        if i == 7:
            # the see-saw: slide to it, then help, then tap the plank
            while pg.locator('[data-btn="panR"]').count():
                tap(pg, '[data-btn="panR"]')
                pg.wait_for_timeout(450)
            tap(pg, '[data-btn="help"]')
            n = pg.locator('[data-help]').count()
            pg.screenshot(path=os.path.join(OUT, 'pc-help-seesaw.png'))
            tap(pg, '[data-saw]')
            s = state(pg)
            check(n == 3 and s['card'] == 'seesaw', f'PC: level 8: help marks its two gadgets and the see-saw; a tap on the plank shows the see-saw\'s card ({n}, {s["card"]})')
            close_card(pg)
        if i == 8:
            tap(pg, '[data-btn="help"]')
            n = pg.locator('[data-help]').count()
            tap(pg, '#cupfront [data-cupf]')
            s = state(pg)
            check(n == 4 and s['card'] == 'lift', f'PC: level 9: help marks its three gadgets and the lift; a tap on a teacup shows the lift\'s card ({n}, {s["card"]})')
            close_card(pg)
            tap(pg, '[data-btn="help"]')
            tap(pg, '[data-help="floater"]')
            check(state(pg)['card'] == 'floater', 'PC: level 9: in help, a tap on the floater\'s "?" shows the floater\'s card, though it came in on level 4')
            close_card(pg)
        tap(pg, '[data-btn="house"]')
        pg.wait_for_function('__test.state().screen === "house"')
    check(shown == ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', None, 'seesaw', 'lift', None],
          f'PC: each card pops up once, on the first level that brings it in; none on level 7 or 10 ({shown})')
    k = kept(pg)
    check(k and k.get('v') == 2 and k.get('cards') == {c: True for c in EIGHT} and k.get('done') == {i: True for i in ids} and k.get('tries') == {'L1': 2},
          f'PC: all eight cards are kept as seen, with the levels done and tries as they were ({k})')
    open_level(pg, 2)
    check(state(pg)['card'] is None, 'PC: after the reload and every card, level 3 opens with no card')
    sizes_ok(pg, 'PC, format 1 progress', errors, asked)
    ctx.close()

    # ---- in the stand-in wrapper
    def framed(start):
        c = br.new_context(viewport={'width': 1366, 'height': 768})
        c.add_init_script(NO_SPEECH)
        c.route('**/__wrapper.html', lambda route: route.fulfill(status=200, content_type='text/html', body=WRAPPER))
        p = c.new_page()
        errs = []
        p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto(WRAP + '#' + json.dumps(start))
        p.wait_for_function('window.__ready > 0', timeout=10000)
        f = [x for x in p.frames if x != p.main_frame][0]
        f.wait_for_function('window.__test && __test.state().ready', timeout=10000)
        return c, p, f, errs

    def ftap(p, f, sel):
        b = f.locator(sel).first.bounding_box()
        p.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)

    ctx, pg, fr, errs = framed({'sound': False, 'state': {'v': 1, 'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 2}}})
    ftap(pg, fr, '#play')
    fr.wait_for_function('__test.state().screen === "house"')
    ftap(pg, fr, '[data-level="1"]')
    fr.wait_for_function('__test.state().level === "L2"')
    last = pg.evaluate('window.__states[window.__states.length - 1]')
    check(fr.evaluate('__test.state().card') == 'ramp' and last == {'v': 2, 'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 2}, 'cards': {'ramp': True}},
          f'wrapper: level 2 shows the ramp\'s card, and the card seen goes out with fg:state at once, format 2 ({last})')
    check(pg.evaluate(f"localStorage.getItem('{ENTRY}')") is None, 'wrapper: nothing is kept on the device by the game')
    ftap(pg, fr, '#card [data-btn="cardok"]')
    check(fr.evaluate('__test.state().card') is None and not errs and fr.evaluate('window.__spoke') == 0, f'wrapper: the tick closes it; no script errors, nothing spoken {errs[:2]}')
    ctx.close()
    ctx, pg, fr, errs = framed({'sound': True, 'state': {'v': 2, 'done': {}, 'seeds': {}, 'tries': {}, 'cards': {'bridge': True}}})
    ftap(pg, fr, '#play')
    fr.wait_for_function('__test.state().screen === "house"')
    ftap(pg, fr, '[data-level="0"]')
    fr.wait_for_function('__test.state().level === "L1"')
    fr.wait_for_timeout(200)
    check(fr.evaluate('__test.state().card') is None and fr.evaluate('__test.state().progress.cards') == {'bridge': True},
          'wrapper: a child whose progress says the bridge\'s card was seen gets no card on level 1')
    check(not errs, f'wrapper (format 2 handed in): no script errors {errs[:2]}')
    ctx.close()

    # ---- phones, by touch
    for w, h, tag in ((390, 844, 'phone upright'), (844, 390, 'phone sideways')):
        ctx, pg, errors, asked = open_page(br, w, h, touch=True)
        to_house(pg, True)
        open_level(pg, 0, True)
        if pg.locator('#turn').is_visible():
            tap(pg, '#turn', True)
        box = pg.locator('#card [data-card]').bounding_box()
        cap = pg.locator('#card text', has_text=CAPTION['bridge']).first.bounding_box()
        check(state(pg)['card'] == 'bridge' and box and box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= w + 1 and box['y'] + box['height'] <= h + 1,
              f'{tag}: the bridge\'s card fits the screen ({box and {k: round(v) for k, v in box.items()}})')
        check(cap and cap['height'] >= 14, f'{tag}: its caption is at least 14 px tall ({cap and round(cap["height"], 1)})')
        pg.wait_for_timeout(1000)
        pg.screenshot(path=os.path.join(OUT, f'{w}x{h}-card.png'))
        close_card(pg, True)
        tap(pg, '[data-btn="help"]', True)
        tap(pg, '[data-slot="bridge"]', True)
        check(state(pg)['card'] == 'bridge', f'{tag}: help, then a tap on the bridge, shows its card by touch')
        close_card(pg, True)
        tap(pg, '[data-slot="bridge"]', True)
        cell(pg, 5, 6, True)
        check(state(pg)['placed'] == {'5,6': 'bridge'}, f'{tag}: then the bridge goes down by touch')
        sizes_ok(pg, tag, errors, asked)
        ctx.close()
    br.close()

print(f'Pictures: {OUT}')
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
