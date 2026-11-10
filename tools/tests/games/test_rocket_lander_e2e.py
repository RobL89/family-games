"""Browser test for Rocket Lander, played on its own as a plain page. Version 1.5.

Changes at v1.5 (step 2c-build, D-058, D-064, D-066): one game with a map. The game opens on the
map, so a round starts from the Play bubble by the waiting rocket, and what the start card and its
planet picker showed is now on the map: a good round opens the next level (in place of the next
planet), and the map shows the levels and rocks kept. Progress is format 3 (the map's place, how
far it's open, each level's best stars and rocks found), so the agreed shape changes, the unknown
format version is 4, and a format 2 entry starts afresh. Every planet's scenery is still shot, by
the test hook, since only the Moon and Red Dust can be played on the stand-in map. The map's own
screens have their own test, test_rocket_lander_map_e2e.py.

Changes at v1.4 (step 2a-4b): the progress entry is at format version 2, with the ships owned
and flown (D-053), so the agreed shape gains `ship` and `ships`, and the unknown version is 3.
The hangar has its own test, test_rocket_hangar_e2e.py.

Changes at v1.3: the close_enough check lands 2 away on the side that stays on the line, and
always aims at 4, near the end of level 1's 0 to 5, where it used to fail by chance (ER-002).

Changes at v1.2 (step 2a-3): the round ends with Bip's moment (D-044), checked to play before
the round is reported; progress is kept on the device under the tile's one entry (D-042), and a
broken or unknown entry starts afresh; the font comes from games/_common/fonts/ and nothing at
all is fetched from outside (D-043).

Changes at v1.1: played on its own, the game is on level 1, whose line is 0 to 5 (D-038,
contract v0.3 GC5); Number mode's other levels have their own test, test_rocket_lander_levels.py.

Copied from games-wip (7ef1ff0) tools/tests/e2e_rocket-lander.py and changed for step 1b:
no stand-in Sheet any more (D-004). The game plays on built-in defaults (D-014); settings
and saved state are handed in with __test.begin(), the way the shell will at stage 2a, and
results and state are read back with __test.reported() and __test.saved().

Stand-ins: headless Chromium (Playwright) for the phone and PC, a local static server for
the family site.

Needs Python Playwright. From the repo root:
    python3 -B tools/tests/games/test_rocket_lander_e2e.py [folder for screenshots]
It starts its own server on a free port. Screenshots go to a temporary folder unless one
is given; they show made-up play only and are never committed.
Fails on any request that leaves the local server, on any
console error or warning, and on sideways scrolling at phone, phone-sideways and PC sizes,
light and dark. RL-3 has its own test, test_rocket_lander_labels.py.
"""
import functools, http.server, os, re, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-shots-')
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
PORT = httpd.server_address[1]
LOCAL = f'http://127.0.0.1:{PORT}/'
BASE = f'{LOCAL}games/rocket-lander/index.html?track=year2'  # the stand-in levels these checks were written for (D-089)
KEY = 'family-games:rocket-lander:progress'  # D-042: the tile's one entry on the device

errors, infos, fails, outside = [], [], [], []


def new_page(browser, w, h, mobile=False):
    """A fresh phone or PC page. Any outside request is a failure (D-043)."""
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile)

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


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def state(pg):
    return pg.evaluate('__test.state()')


def open_game(br, w, h, mobile, settings=None, saved=None):
    """Opens the game; settings and saved state, if given, are handed in as the shell will."""
    pg = new_page(br, w, h, mobile=mobile)
    pg.on('console', lambda m: infos.append(m.text) if m.type == 'info' else None)
    pg.goto(BASE)
    pg.wait_for_function('window.__test && __test.state().ready')
    if settings or saved:
        ok = pg.evaluate('([s, p]) => __test.begin({ settings: s, state: p })', [settings or {}, saved])
        check(ok, 'begin() accepted on the start screen')
    pg.wait_for_timeout(300)
    return pg


def begin(pg, settings=None, saved=None):
    return pg.evaluate('([s, p]) => __test.begin({ settings: s, state: p })', [settings or {}, saved])


def reported(pg):
    return pg.evaluate('__test.reported()')


def saved(pg):
    return pg.evaluate('__test.saved()')


def start(pg):
    pg.click('#play', force=True)  # force: the Play bubble gently "breathes"; the rocket blasts off first
    pg.wait_for_function('__test.state().phase === "fly"')


def wait_fly(pg, idx):
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "end" || (s.phase === "fly" && s.idx === {idx}); }})()', timeout=20000)


def land(pg, good, shot=None, wait=1700):
    """One landing: good=True lands on the target, False just beside it."""
    idx = state(pg)['idx']
    pg.wait_for_timeout(250)
    if good:
        pg.evaluate('__test.right()')
    else:
        pg.evaluate('__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"')
    if shot:
        pg.wait_for_timeout(wait)
        pg.screenshot(path=f'{OUT}/{shot}.png')
    pg.evaluate('__test.speed(4)')
    wait_fly(pg, idx + 1)
    pg.evaluate('__test.speed(1)')


def finale(pg, stars, shot=None):
    """Bip's moment after the last landing (D-044): it plays before the round is reported."""
    pg.wait_for_function('__test.state().phase === "finale"', timeout=20000)
    check(reported(pg) == [], 'the round is reported only after Bip\'s moment')
    pg.wait_for_function('__test.state().finale.t > 3.3', timeout=20000)
    f = state(pg)['finale']
    check(f['stars'] == stars and f['pad'] and f['ladder'] and f['flag'] and f['fireworks'] > 0 and not f['pilotIn'],
          f'Bip\'s moment: the pad, ladder, a flag with {stars} stars and fireworks, Bip outside: {f}')
    if shot:
        pg.screenshot(path=f'{OUT}/{shot}.png')
    pg.wait_for_function('__test.state().phase === "end"', timeout=20000)
    check(len(reported(pg)) == 1, 'then the round is reported once')


def play_round(pg, pattern, shots=None, stars=None):
    shots = shots or {}
    for i, good in enumerate(pattern[:-1]):
        land(pg, good, shots.get(i), 1700 if good else 1500)
    idx = state(pg)['idx']
    pg.wait_for_timeout(250)
    pg.evaluate('__test.right()' if pattern[-1] else '__test.wrong()')
    if stars is not None:
        finale(pg, stars, shots.get('finale'))
    pg.wait_for_function('__test.state().phase === "end"', timeout=20000)


def steer_by_hand(pg, mobile):
    """Real input: hold/drag (phone) or keys (PC) and check the rocket moves that way."""
    s = state(pg)
    x0 = s['rocketX']
    target_x = s['x1'] if x0 < (s['x0'] + s['x1']) / 2 else s['x0']
    if mobile:
        cdp = pg.context.new_cdp_session(pg)
        y = 400
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': target_x, 'y': y}]})
        pg.wait_for_timeout(700)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        key = 'ArrowRight' if target_x > x0 else 'ArrowLeft'
        pg.keyboard.down(key)
        pg.wait_for_timeout(600)
        pg.keyboard.up(key)
    x1 = state(pg)['rocketX']
    check(abs(x1 - x0) > 40 and (x1 - x0) * (target_x - x0) > 0, f'rocket steers towards the {"finger" if mobile else "arrow key"} ({x0:.0f} -> {x1:.0f})')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- Phone: a full round with default settings (level 1: 0 to 5) ----------
    ph = open_game(br, 390, 844, True)
    ph.screenshot(path=f'{OUT}/ph-start.png')
    check(reported(ph) == [] and saved(ph) is None, 'nothing reported or saved before a round')
    s = state(ph)
    check(s['level'] == 1 and s['line'] == {'from': 0, 'to': 5, 'step': 1, 'count': 6}, f'on its own: level 1, a line of 0 to 5 in ones ({s["line"]})')
    check(s['labels'] == [str(i) for i in range(6)], f'phone shows every number 0 to 5: {s["labels"]}')
    start(ph)
    s = state(ph)
    check(abs(s['startX'] - ph.evaluate(f'__test.xOf({s["target"]})')) > 50, 'rocket does not start straight above the target')
    ph.wait_for_timeout(1300)
    ph.screenshot(path=f'{OUT}/ph-fly.png')
    steer_by_hand(ph, True)
    # 7 right of 8 = 87.5% -> 3 stars
    check(ph.evaluate("document.fonts.ready.then(() => [...document.fonts].some((f) => f.family.replace(/[\"']/g, '') === 'Fredoka' && f.status === 'loaded'))"),
          'the Fredoka font loads from games/_common/fonts/ (D-043)')
    play_round(ph, [True, True, False, True, True, True, True, True], {0: 'ph-right', 2: 'ph-wrong', 'finale': 'ph-finale'}, stars=3)
    ph.wait_for_timeout(1600)
    ph.screenshot(path=f'{OUT}/ph-end.png')
    s = state(ph)
    check(s['right'] == 7, f'7 right landings counted ({s["right"]})')
    check(s['result']['opened'] == 'moon-2', f'a 3-star round opens the next level (D-064): {s["result"]["opened"]}')
    rows = reported(ph)
    check(len(rows) == 1 and rows[0]['stars'] == 3, f'the round is reported with 3 stars: {rows}')
    check(rows and rows[0]['score'] == 7 + s['perfects'], f'score = right + perfects ({rows[0]["score"] if rows else None})')
    prog = saved(ph)
    rk = min(8, s['perfects'])  # a level's rocks: one for each perfect landing, 8 at most (D-058)
    check(bool(prog) and prog.get('open') == 'moon-2' and prog.get('at') == 'moon-2' and prog.get('landings') == 7
          and prog.get('rocks') == rk and prog.get('levels') == {'moon-1': {'stars': 3, 'rocks': rk}},
          f'the state is saved: {prog}')

    # D-042: the progress is kept on the device, under the tile's one entry, with a format version
    keys = ph.evaluate('Object.keys(localStorage)')
    entry = ph.evaluate(f'JSON.parse(localStorage.getItem("{KEY}"))')
    check(keys == [KEY] and entry == {'v': 4, 'track': 'year2', 'edition': 'stand-in', 'at': 'moon-2', 'open': 'moon-2', 'levels': {'moon-1': {'stars': 3, 'rocks': rk}}, 'rocks': rk,
                                      'landings': 7, 'ship': 'classic', 'ships': ['classic'], 'maps': {}},
          f'only the game\'s entry is written, in the agreed shape (format 4, D-058, D-089): {keys}, {entry}')
    ph.reload()
    ph.wait_for_function('window.__test && __test.state().ready')
    p2 = state(ph)['progress']
    check(saved(ph) is None and (p2['at'], p2['open'], p2['rocks'], p2['landings']) == ('moon-2', 'moon-2', rk, 7),
          f'a reload keeps the progress: {p2}')
    mk = state(ph)['map']['markers']
    check([k['state'] for k in mk][:3] == ['done', 'next', 'locked'] and mk[0]['stars'] == 3 and ph.inner_text('#map-rocks') == str(rk),
          'the map shows the kept levels and rocks')
    for bad, why in (('{broken', 'a broken entry'), ('{"v":5,"at":"dust-3","open":"dust-3","rocks":9}', 'an entry of an unknown format version'),
                     ('{"v":2,"unlocked":5,"planet":"ice","rocks":9}', 'a format 2 entry, from before the map')):
        ph.evaluate(f'localStorage.setItem("{KEY}", {bad!r})')
        ph.reload()
        ph.wait_for_function('window.__test && __test.state().ready')
        p3 = state(ph)['progress']
        check(p3['open'] == 'moon-1' and p3['rocks'] == 0, f'{why} starts afresh: {p3}')
    ph.evaluate('localStorage.clear()')
    # The saved state handed back, as the shell will: two levels open on the map
    check(begin(ph, None, prog), 'begin() takes the saved state back')
    ph.wait_for_timeout(600)
    ph.screenshot(path=f'{OUT}/ph-map-two.png')
    check([k['state'] for k in state(ph)['map']['markers']][:3] == ['done', 'next', 'locked'], 'the map: two levels can be played')
    # Play by the rocket: level 2, with a 1-star result
    start(ph)
    check(state(ph)['levelId'] == 'moon-2', 'Play by the rocket plays level 2, where it waits')
    ph.wait_for_timeout(900)
    ph.screenshot(path=f'{OUT}/ph-dust-fly.png')
    play_round(ph, [True, False, False, True, False, False, False, False], {'finale': 'ph-finale-miss'}, stars=1)  # after a miss too
    ph.wait_for_timeout(1400)
    ph.screenshot(path=f'{OUT}/ph-end-1star.png')
    rows = reported(ph)
    check(len(rows) == 1 and rows[0]['stars'] == 1, f'2 of 8 right gives 1 star: {rows}')
    check(saved(ph)['open'] == 'moon-2' and saved(ph)['at'] == 'moon-2' and saved(ph)['levels']['moon-2']['stars'] == 1, 'a 1-star round opens nothing')
    check(begin(ph) is False, 'begin() is refused away from the map')
    ph.context.close()

    # ---------- PC: a full round, mouse and keys ----------
    pc = open_game(br, 1280, 800, False)
    pc.screenshot(path=f'{OUT}/pc-start.png')
    start(pc)
    pc.wait_for_timeout(1000)
    steer_by_hand(pc, False)
    # mouse: hold the button and the rocket glides towards the pointer
    s = state(pc)
    gx = 200 if s['rocketX'] > 640 else 1080
    pc.mouse.move(gx, 400); pc.mouse.down(); pc.wait_for_timeout(800); pc.mouse.up()
    s2 = state(pc)
    check((s2['rocketX'] - s['rocketX']) * (gx - s['rocketX']) > 0 and abs(s2['rocketX'] - s['rocketX']) > 60, 'holding the mouse glides the rocket towards the pointer')
    pc.screenshot(path=f'{OUT}/pc-fly.png')
    # 5 of 8 = 62.5% -> 2 stars
    play_round(pc, [True, False, True, True, False, True, False, True], {0: 'pc-right', 1: 'pc-wrong', 'finale': 'pc-finale'}, stars=2)
    pc.wait_for_timeout(1700)
    pc.screenshot(path=f'{OUT}/pc-end.png')
    rows = reported(pc)
    check(len(rows) == 1 and rows[0]['stars'] == 2, f'PC: 5 of 8 gives 2 stars: {rows}')
    check((saved(pc) or {}).get('open') == 'moon-2', 'PC: 2 stars opens the next level (D-064)')
    pc.context.close()

    # ---------- Landscape phone ----------
    ls = open_game(br, 844, 390, True)
    ls.screenshot(path=f'{OUT}/land-start.png')
    start(ls)
    land(ls, True, 'land-right')
    land(ls, False, 'land-wrong')
    ls.context.close()

    # ---------- Settings variations ----------
    def variation(name, w, h, mobile, settings, expect=None, play=(True, False), progress=None):
        pg = open_game(br, w, h, mobile, settings, progress)
        start(pg)
        s = state(pg)
        if expect:
            expect(s)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{OUT}/{name}-fly.png')
        for i, good in enumerate(play):
            land(pg, good, f'{name}-{"right" if good else "wrong"}', 1700 if good else 1500)
        pg.context.close()

    def v100(s):
        check(s['line']['count'] == 101 and s['labels'] == [str(i) for i in range(0, 101, 10)], f'0-100: labels every 10 ({s["labels"]})')
        check(s['tight'] and s['allowed'] == 5, f'0-100 on a phone: marks too close, so within 5 counts (allowed {s["allowed"]})')
    variation('v100-ph', 390, 844, True, {'from': 0, 'to': 100, 'step': 1, 'label_every': 10}, v100)
    variation('v100-pc', 1280, 800, False, {'from': 0, 'to': 100, 'step': 1, 'label_every': 10},
              lambda s: check(s['tight'] and s['allowed'] == 5, f'0-100 on PC: {s["pps"]:.1f}px apart, within 5 counts'))

    def vhalf(s):
        check(s['labels'] == ['0', '½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5'], f'0-5 in halves shown as fractions: {s["labels"]}')
    variation('vhalf-ph', 390, 844, True, {'from': 0, 'to': 5, 'step': 0.5, 'label_every': 0.5}, vhalf)
    variation('vhalf-pc', 1280, 800, False, {'from': 0, 'to': 5, 'step': 0.5}, None, play=(True,))
    variation('vhalf-dec-pc', 1280, 800, False, {'from': 0, 'to': 5, 'step': 0.5, 'label_every': 0.5, 'show_as': 'decimal'},
              lambda s: check('2.5' in s['labels'] and '0.5' in s['labels'], f'decimal: {s["labels"]}'), play=(False,))

    def vneg(s):
        check(s['labels'] == ['−10', '−5', '0', '5', '10'], f'-10 to 10 every 5 with a proper minus: {s["labels"]}')
    variation('vneg-ph', 390, 844, True, {'from': -10, 'to': 10, 'label_every': 5}, vneg)
    variation('vneg-pc', 1280, 800, False, {'from': -10, 'to': 10, 'label_every': 5}, vneg, play=(False,))

    # speed 1: about 12 seconds from the top to the ground (speed 2: about 8)
    def measure_fall(speed):
        pg = open_game(br, 390, 844, True, {'speed': speed} if speed is not None else None)
        start(pg)
        pg.wait_for_timeout(1200)
        a = state(pg)
        pg.wait_for_timeout(2000)
        b = state(pg)
        per_sec = (b['rocketY'] - a['rocketY']) / 2.0
        secs = (a['touchY'] - a['startY']) / per_sec
        if speed == 1:
            pg.screenshot(path=f'{OUT}/speed1-ph.png')
        pg.context.close()
        return secs
    s1, s2 = measure_fall(1), measure_fall(None)
    check(11 < s1 < 13.2, f'speed 1 takes about 12 s to fall ({s1:.1f} s)')
    check(7.2 < s2 < 8.8, f'speed 2 (default) takes about 8 s to fall ({s2:.1f} s)')

    # odd settings are fixed and explained with console.info
    infos.clear()
    pg = open_game(br, 390, 844, True, {'from': 10, 'to': 0})
    start(pg)
    s = state(pg)
    check(s['line']['from'] == 0 and s['line']['to'] == 10, 'to below from: the ends are swapped')
    check(any('swapped' in m for m in infos), f'console.info explains the fix: {infos}')
    pg.context.close()
    infos.clear()
    pg = open_game(br, 390, 844, True, {'from': 0, 'to': 1000, 'step': 0.5, 'label_every': 100})
    start(pg)
    s = state(pg)
    check(s['line']['count'] <= 400, f'more than 400 spots: the step is made bigger ({s["line"]})')
    check(any('more than 400' in m for m in infos), 'console.info explains the bigger step')
    pg.wait_for_timeout(1300)
    pg.screenshot(path=f'{OUT}/v1000-ph.png')
    pg.context.close()

    # close_enough: within 2 counts on a short line
    pg = open_game(br, 1280, 800, False, {'close_enough': 2})
    start(pg)
    pg.evaluate('__test.aim(4)')  # ER-002: a target near the line's end, every run
    s = state(pg)
    off = 2 if s['target'] + 2 <= s['line']['to'] else -2  # ER-002: stay on the line
    pg.wait_for_timeout(1300)
    pg.screenshot(path=f'{OUT}/close2-pc-fly.png')
    pg.evaluate(f'__test.right({off})')
    pg.wait_for_function('__test.state().phase === "landed"')
    s = state(pg)
    check(s['results'][0]['right'] and s['results'][0]['spot'] == s['target'] + off, f'close_enough 2: landing 2 away counts ({s["results"][0]})')
    pg.context.close()

    # The map with two levels open (PC), and every planet's scenery in flight (the test hook shows the
    # planets the stand-in map can't reach yet; looks only)
    pg = open_game(br, 1280, 800, False, None, {'at': 'moon-2', 'open': 'moon-2', 'levels': {'moon-1': {'stars': 2, 'rocks': 3}}, 'rocks': 5, 'landings': 20})
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{OUT}/pc-map-two.png')
    check(pg.locator('#map-rocks').inner_text() == '5', 'PC map: the moon rock total comes from the saved state')
    pg.context.close()
    for (w, h, mob, tag) in ((390, 844, True, 'ph'), (1280, 800, False, 'pc')):
        pg = open_game(br, w, h, mob)
        start(pg)
        for i, name in enumerate(['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed']):
            pg.evaluate(f'__test.planet({i})')
            pg.wait_for_timeout(700)
            pg.screenshot(path=f'{OUT}/planet-{name}-{tag}.png')
        pg.context.close()

    # Phone, phone sideways and PC, light and dark: no sideways scrolling, start screen and in flight
    for (w, h, mobile) in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
        for scheme in ('light', 'dark'):
            pg = open_game(br, w, h, mobile)
            pg.emulate_media(color_scheme=scheme)
            wide = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
            start(pg)
            pg.wait_for_timeout(900)
            wide = max(wide, pg.evaluate('document.documentElement.scrollWidth - innerWidth'))
            check(wide <= 0, f'{w}x{h} {scheme}: no sideways scrolling ({wide}px over)')
            pg.context.close()

    # Odd settings handed in are fixed, not used (resolveSettings)
    infos.clear()
    pg = open_game(br, 390, 844, True, {'from': -5000, 'show_as': 'roman', 'speed': 'fast'})
    s = state(pg)
    check(s['settings']['from'] == -1000 and s['settings']['show_as'] == 'fraction' and s['settings']['speed'] == 2,
          f'odd settings fall back or are kept in range: {s["settings"]}')
    check(any('outside' in m for m in infos), 'console.info explains the odd settings')
    pg.context.close()

    br.close()

httpd.shutdown()
check(not outside, 'nothing fetched from outside the local server' + ('' if not outside else ': ' + ' | '.join(sorted(set(outside))[:5])))
check(not errors, 'no console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
