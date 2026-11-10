"""Browser test for the three ship hooks round.js reads (step 2d-2, D-080). Version 1.0.

Decided before the hooks were built. Played on a phone held sideways (844 x 390), level 1 (a line of
0 to 5), three landings a round, the ship flown set in a made-up progress entry. The round's own test
hooks record where Bip is, frame by frame (__test.trace), and play is slowed down (__test.speed)
around the moment Bip first leaves the ship, so his first spot can be read to about a pixel.

  - seat(S): where Bip sits aboard. With it, his hop out to the small flag starts from the seat,
    at the seat's size, and so does Bip's moment, with a short hop from the seat to the rope
    ladder's top before he climbs down. Sunflower Copter (seat at x -0.11, y 0.13, size 0.3 of h).
  - Ships without hooks play exactly as today: the Classic (today's rocket) and the Teapot (a ship
    from ships.js) hop out from the window (y +0.255 of h, size 0.3 of h), and in Bip's moment he
    first shows at the rope ladder's top (scene.js's ladderEnds), as he did before step 2d-2.
  - ladder(S): a ship's own ladder (the Christmas Tree). Bip climbs down it from its top instead
    of hopping (never higher than where he starts), reaching the ground at its foot; in Bip's
    moment no rope ladder drops, and he climbs down the tree's own.
  - S.side: set by the round to the side the flag goes (1 right, -1 left) at each landing and in
    Bip's moment, so the tree's ladder leans that way: a landing on the line's left half puts the
    flag to the right (1), one on its right half to the left (-1).
  - After a miss on the round's last landing the rocket hops to the right number and Bip's moment
    follows: the Christmas Tree plays its landing (the star on the top, its ladder up) before Bip
    climbs down, so he never climbs a ladder that isn't there, and the tree is told the flag's side
    in Bip's moment, which after the hop may differ from the missed landing's. A ship without its own ladder plays
    after a miss as today: no landing of its own (the Sunflower Copter).

Stand-ins: headless Chromium (Playwright) for the phone, a local static server for the family
site. Made-up progress only; nothing is saved or committed.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_ship_hooks_e2e.py
"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
GAME = 'rocket-lander'
KEY = f'family-games:{GAME}:progress'
errors, fails, outside = [], [], []
TOL = 2.0  # pixels: the hop moves at most about a pixel between two slowed-down frames
WINDOW = (0.0, 0.255, 0.3)  # the Classic's window, where round.js's hop starts today
FIN_OUT = 0.95  # round.js: Bip leaves the ship in Bip's moment (FIN.out)


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def entry(ship):
    return {'v': 3, 'at': 'moon-1', 'open': 'moon-3', 'levels': {}, 'rocks': 0, 'landings': 0,
            'ship': ship, 'ships': ['classic'] + ([ship] if ship != 'classic' else [])}  # made up


def open_game(br, ship):
    ctx = br.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)

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
    pg.goto(f'{LOCAL}games/{GAME}/index.html?track=year2')  # the stand-in levels (D-089)
    pg.wait_for_function('window.__test && __test.state().ready')
    pg.evaluate('([k, e]) => localStorage.setItem(k, JSON.stringify(e))', [KEY, entry(ship)])
    pg.reload()
    pg.wait_for_function('window.__test && __test.state().ready')
    pg.evaluate('__test.begin({ level: 1, settings: { landings_per_round: 3 } })')
    pg.click('#play', force=True)
    pg.wait_for_function('__test.state().phase === "fly"')
    return pg


def ev(pg, js):
    return pg.evaluate(js)


def fly_to(pg, i, aim, right=True):
    """Landing i (0-based), aimed at a number on the line; returns the side the flag goes."""
    pg.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {i}', timeout=20000)
    ev(pg, '__test.speed(1)')
    ev(pg, f'__test.aim({aim})')
    if right:
        ev(pg, '__test.right()')
    else:
        ev(pg, '__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"', timeout=10000)


def first_out(pg, finale=False):
    """Slow play down around Bip's first step out of the ship, and read his first recorded spot."""
    if finale:
        pg.wait_for_function('__test.state().phase === "finale"', timeout=20000)
        ev(pg, '__test.speed(2)')
        pg.wait_for_function(f'__test.state().finale && __test.state().finale.t > {FIN_OUT - 0.2}', timeout=10000)
    ev(pg, '__test.speed(0.15)')
    ev(pg, '__test.trace(true)')
    pg.wait_for_function('__test.state().pilot', timeout=20000)
    ev(pg, '__test.speed(1)')
    pg.wait_for_timeout(1300 if not finale else 1200)  # the hop or the climb, at full speed
    tr = ev(pg, '__test.trace(false)')
    pts = [p for p in tr if p['pilot']]
    return pts


def near(a, b, tol=TOL):
    return abs(a - b) <= tol


def closest(pts, x, y):
    """How close Bip comes to a spot, in pixels, and when."""
    best = min(pts, key=lambda p: (p['pilot']['x'] - x) ** 2 + (p['pilot']['y'] - y) ** 2)
    return ((best['pilot']['x'] - x) ** 2 + (best['pilot']['y'] - y) ** 2) ** 0.5, best['t']


def finish_round(pg):
    ev(pg, '__test.speed(4)')


def seat_xy(p, seat):
    return p['rx'] + seat[0] * p['rh'], p['ry'] + seat[1] * p['rh'], seat[2] * p['rh']


def check_start(tag, pts, seat, what):
    if not pts:
        check(False, f'{tag}: Bip leaves the ship ({what})')
        return
    p = pts[0]
    x, y, s = seat_xy(p, seat)
    check(near(p['pilot']['x'], x) and near(p['pilot']['y'], y) and near(p['pilot']['s'], s, 1),
          f'{tag}: Bip\'s first spot out of the ship is {what}: want ({x:.1f}, {y:.1f}) size {s:.1f}, got '
          f'({p["pilot"]["x"]:.1f}, {p["pilot"]["y"]:.1f}) size {p["pilot"]["s"]:.1f} at t {p["t"]:.3f}')


def rope_top(p, d):
    # scene.js's ladderEnds: the top is h * 0.2 out and h * 0.62 up; Bip stands 0.15 of his size (h/2) below it
    return p['rx'] + d * p['rh'] * 0.2, p['gy'] - p['rh'] * 0.62 + p['rh'] * 0.5 * 0.15


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- No hooks: as today (the Classic and the Teapot) ----------
    for ship in ('classic', 'teapot'):
        pg = open_game(br, ship)
        fly_to(pg, 0, 1)
        pts = first_out(pg)
        check_start(f'{ship}, landing', pts, WINDOW, 'the window, as today')
        rise = min(p['pilot']['y'] for p in pts) if pts else 0
        check(pts and rise < pts[0]['pilot']['y'] - pts[0]['rh'] * 0.3, f'{ship}, landing: Bip hops up and out, as today (highest {rise:.1f})')
        finish_round(pg)
        fly_to(pg, 1, 1); finish_round(pg)
        fly_to(pg, 2, 5)
        pts = first_out(pg, finale=True)
        if pts:
            p = pts[0]; d = p['dir']
            x, y = rope_top(p, d)
            check(near(p['pilot']['x'], x) and near(p['pilot']['y'], y) and p['rope'],
                  f'{ship}, Bip\'s moment: Bip first shows at the rope ladder\'s top, as today: want ({x:.1f}, {y:.1f}), '
                  f'got ({p["pilot"]["x"]:.1f}, {p["pilot"]["y"]:.1f}), rope ladder {p["rope"]}')
        else:
            check(False, f'{ship}, Bip\'s moment: Bip comes out')
        pg.context.close()

    # ---------- seat(S): the Sunflower Copter ----------
    SUN_SEAT = (-0.11, 0.13, 0.3)
    pg = open_game(br, 'sunflower')
    fly_to(pg, 0, 1)
    pts = first_out(pg)
    check_start('sunflower, landing', pts, SUN_SEAT, 'its seat (x -0.11, y 0.13, size 0.3 of h)')
    finish_round(pg)
    fly_to(pg, 1, 1); finish_round(pg)
    fly_to(pg, 2, 5)
    pts = first_out(pg, finale=True)
    check_start('sunflower, Bip\'s moment', pts, SUN_SEAT, 'its seat')
    if pts:
        d = pts[0]['dir']
        x, y = rope_top(pts[0], d)
        gap, when = closest([p for p in pts if p['t'] < 1.75], x, y)
        check(gap <= 3 and abs(when - (FIN_OUT + 0.25)) < 0.05 and all(p['rope'] for p in pts),
              f'sunflower, Bip\'s moment: a short hop from the seat to the rope ladder\'s top ({x:.1f}, {y:.1f}), '
              f'reached at {when:.2f} s (want {FIN_OUT + 0.25:.2f}), {gap:.1f} px off, then down the rope ladder')
    pg.context.close()

    # ---------- ladder(S) and S.side: the Christmas Tree ----------
    pg = open_game(br, 'tree')
    for i, (aim, want) in enumerate(((1, 1), (5, -1))):
        fly_to(pg, i, aim)
        side = ev(pg, '__test.state().ship.side')
        check(side == want, f'tree, landing {i + 1} on {aim}: the flag goes {"right" if want > 0 else "left"} and the ship is told (side {side})')
        pts = first_out(pg)
        check_start(f'tree, landing {i + 1}', pts, (0.13 * want, -0.18, 0.3), 'the top of its own ladder')
        if pts:
            y0 = pts[0]['pilot']['y']
            climb = [p for p in pts if p['t'] < 0.85]
            check(all(p['pilot']['y'] >= y0 - 1 for p in climb), f'tree, landing {i + 1}: Bip climbs down, never above where he starts')
            fx = pts[0]['rx'] + want * 0.4 * pts[0]['rh']
            gap, when = closest([p for p in pts if p['t'] < 0.9], fx, pts[0]['gy'] - 1)
            check(gap <= 3 and abs(when - 0.85) < 0.03,
                  f'tree, landing {i + 1}: Bip reaches the ladder\'s foot on the ground ({fx:.1f}) at {when:.2f} s (want 0.85), {gap:.1f} px off')
            check(not any(p['rope'] for p in pts), f'tree, landing {i + 1}: no rope ladder')
        finish_round(pg)
    fly_to(pg, 2, 5)
    pts = first_out(pg, finale=True)
    side = ev(pg, '__test.state().ship.side')
    d = pts[0]['dir'] if pts else None
    check(pts and side == d, f'tree, Bip\'s moment: the ship is told the flag\'s side ({side}, flag {d})')
    check_start('tree, Bip\'s moment', pts, (0.13 * (d or 1), -0.18, 0.3), 'the top of its own ladder')
    whole = ev(pg, '__test.state().finale')
    check(pts and not any(p['rope'] for p in pts) and whole and not whole['ladder'],
          'tree, Bip\'s moment: no rope ladder drops; Bip climbs down the tree\'s own')
    if pts:
        y0 = pts[0]['pilot']['y']
        down = [p for p in pts if p['t'] < 1.75]
        fx = pts[0]['rx'] + (d or 1) * 0.4 * pts[0]['rh']
        gap, when = closest([p for p in pts if p['t'] < 1.8], fx, pts[0]['gy'] - 1)
        check(all(p['pilot']['y'] >= y0 - 1 for p in down) and gap <= 3 and abs(when - 1.75) < 0.03,
              f'tree, Bip\'s moment: Bip climbs down, never above where he starts, to its foot ({fx:.1f}) at {when:.2f} s (want 1.75), {gap:.1f} px off')
    pg.context.close()

    # ---------- A miss on the last landing ----------
    for ship, want in (('tree', True), ('sunflower', False)):
        pg = open_game(br, ship)
        fly_to(pg, 0, 1); finish_round(pg)
        fly_to(pg, 1, 1); finish_round(pg)
        fly_to(pg, 2, 3, right=False)
        check(not ev(pg, '__test.state().ship.landed'), f'{ship}, a miss on the last landing: no landing of its own yet')
        miss_side = ev(pg, '__test.state().ship.side')
        pts = first_out(pg, finale=True)
        landed = pts and pts[0]['landed']
        if ship == 'tree' and pts:
            # aimed at 3, the wrong spot nearest it is below, on the line's left half; the right one is on its right half
            side = ev(pg, '__test.state().ship.side')
            check(miss_side == 1 and side == pts[0]['dir'] == -1,
                  f'tree, Bip\'s moment after the hop: the ship is told the flag\'s new side (missed with side {miss_side}, now {side}, flag {pts[0]["dir"]})')
        check(bool(landed) == want, f'{ship}, after the hop to the right number: '
              + ('the tree lands (star on, ladder up) before Bip climbs down' if want else 'no landing of its own, as today') + f' ({landed})')
        pg.context.close()
    br.close()

httpd.shutdown()
check(not outside, 'nothing fetched from outside the local server' + ('' if not outside else ': ' + ' | '.join(sorted(set(outside))[:5])))
check(not errors, 'no console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
