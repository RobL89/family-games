"""Rocket Lander's tracks, Reception's levels and the challenge rounds, in a browser (step 2c-3a).
Version 1.1. Changes at v1.1: the fall times (D-096, D-097).

The step's own test (D-086: during a step, the new feature's own test and the fast checks). At a
phone held upright (390x844) and a PC (1280x800):
  - a new device plays the lower track (D-089): Moon, Red Dust and Candy open in turn, Ice, Jungle and
    Ringed coming soon;
  - every Reception face (dots, a quick look, more/fewer/the same, one more or less, make 5 and 10,
    pictured + and −, doubles, sharing) shows as a picture without "Land on" (said instead), fits the
    screen with no sideways scroll, and takes a right landing and a wrong one, with its own words
    after the miss; a quick look hides its dots after 1.5 s; "more than" takes any number that fits;
  - the dice lines (D-060, D-067) show a face under every mark (7 for 0 to 6, 13 for 0 to 12) and
    light the right dice after a miss;
  - a challenge round (D-091) plays its system's seven levels, each once and one more, each on its own
    line and label look, to the end card;
  - the track changes (begin({ track })), the page reloading on the other map, the moon rocks and ships
    kept and each track's map as left (format 4 on the device); a format 3 entry plays on the stand-in
    track with all of it kept;
  - nothing is fetched from outside, and no page errors.
And in the --debug preview, the 1234 panel's Track box changes the track.

Stand-ins: headless Chromium (Playwright), system fonts for any not shipped; the preview's goHome.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_reception_e2e.py
"""
import functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
KEY = 'family-games:rocket-lander:progress'
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(root):
    h = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
    h.daemon_threads = True
    threading.Thread(target=h.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{h.server_address[1]}/'


LOCAL = serve(REPO)
BASE = f'{LOCAL}games/rocket-lander/index.html'
# A made-up question for each face, set with the test hook so the picture is known (aimAsk)
FACES = {
    'moon-3': ({'ask': 'dots', 'n': 7, 'value': 7}, 7),
    'moon-5': ({'ask': 'flash', 'n': 4, 'value': 4, 'look': 2, 'ms': 1500}, 4),
    'moon-6': ({'ask': 'compare', 'rel': 'fewer', 'n': 6}, 6),
    'moon-7': ({'ask': 'more-less', 'dir': 'less', 'n': 6, 'value': 5}, 0),
    'dust-2': ({'ask': 'bond', 'whole': 5, 'part': 3, 'value': 2}, 3),
    'dust-5': ({'ask': 'double', 'n': 4, 'value': 8}, 8),
    'dust-7': ({'ask': 'bond', 'whole': 10, 'part': 6, 'value': 4}, 6),
    'candy-6': ({'ask': 'share', 'total': 8, 'groups': 2, 'value': 4}, 0),
}
MISS_WORDS = {'moon-3': 'dots', 'moon-5': 'were', 'moon-6': 'fewer than 6', 'moon-7': 'less than 6', 'dust-2': 'make 5',
              'dust-5': 'Double 4', 'dust-7': 'make 10', 'candy-6': 'each plate'}


def page(br, w, h, mobile):
    ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
    asked, errors = [], []
    ctx.route('**/*', lambda r: (asked.append(r.request.url), r.continue_() if r.request.url.startswith(LOCAL) or r.request.url.startswith('data:') else r.abort()))
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    return ctx, pg, asked, errors


def ready(pg):
    pg.wait_for_function('window.__test && __test.state().ready')


def st(pg):
    return pg.evaluate('__test.state()')


def start(pg, lid):
    """Send the rocket to a level and start its round (the Play bubble), fast."""
    pg.evaluate(f'__test.begin({{ level: "{lid}" }})')
    pg.wait_for_function('(() => { const s = __test.state(); return s.screen === "map" && s.map && !s.map.busy; })()', timeout=15000)
    pg.evaluate('__test.speed(6)')
    pg.evaluate('document.querySelector(".play-bubble").click()')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)


def next_fly(pg, i):
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return (s.phase === "fly" && s.idx > {i}) || s.phase === "end"; }})()', timeout=30000)


def home(pg):
    pg.goto(BASE)
    ready(pg)


with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in ((390, 844, True, 'phone'), (1280, 800, False, 'pc')):
        ctx, pg, asked, errors = page(br, w, h, mobile)
        pg.goto(BASE)
        ready(pg)
        s = st(pg)
        mk = s['map']['markers'] if s['map'] else []
        check(s['track'] == 'reception' and s['tracks'] == ['reception', 'year2'] and s['levelId'] == 'moon-1',
              f'{tag}: a new device plays the lower track from Moon 1 (D-089): {s["track"]}, {s["levelId"]}')
        check(len(mk) == 8, f'{tag}: the Moon has 8 level markers, the 8th its challenge: {len(mk)}')

        # Falls (D-096, D-097): 12 s at the default speed 3; 15 s for a picture, a dice face or a sum
        falls = {}
        for lid in ('moon-1', 'moon-3', 'moon-4', 'dust-3'):
            start(pg, lid)
            falls[lid] = st(pg)['fall']
            home(pg)
        check(falls == {'moon-1': 12, 'moon-3': 15, 'moon-4': 15, 'dust-3': 15} and st(pg)['settings']['speed'] == 3,
              f'{tag}: the default speed 3 falls in 12 s on a numbers level and 15 s on a picture, a dice line and a sum: {falls}')

        # The faces
        for lid, (T, dots) in FACES.items():
            start(pg, lid)
            pg.evaluate(f'__test.aimAsk({json.dumps(T)})')
            pg.wait_for_timeout(250)
            info = pg.evaluate('''(() => { const t = document.getElementById('target'), c = document.getElementById('target-n'), r = c.getBoundingClientRect();
              return { face: t.classList.contains('is-face'), lbl: getComputedStyle(t.querySelector('.target-lbl')).display, cls: c.className,
                on: c.querySelectorAll('.d-on').length, sw: c.querySelectorAll('.sw').length, left: r.left, right: r.right, h: r.height,
                aria: t.getAttribute('aria-label'), sideways: document.documentElement.scrollWidth > innerWidth }; })()''')
            want_dots = 8 if lid == 'candy-6' else dots
            got_dots = info['sw'] if lid == 'candy-6' else info['on']
            check(info['face'] and info['lbl'] == 'none' and f"face-{T['ask']}" in info['cls'] and got_dots == want_dots,
                  f'{tag} {lid}: the {T["ask"]} face, without "Land on", {want_dots} drawn: {info["cls"]}, {got_dots}')
            check(info['left'] >= 0 and info['right'] <= w and not info['sideways'] and 20 <= info['h'] <= h * 0.2,
                  f'{tag} {lid}: it fits the screen, no sideways scroll, {info["h"]:.0f} px high')
            check(bool(info['aria']) and len(info['aria']) > 8,
                  f'{tag} {lid}: its words for screen readers: {info["aria"]!r}')
            if lid == 'moon-5':
                pg.evaluate('__test.speed(0.05)')  # the rocket all but stops while the dots show
                pg.wait_for_timeout(2300)
                op = pg.evaluate("[getComputedStyle(document.querySelector('#target-n .fl-dots')).opacity, getComputedStyle(document.querySelector('#target-n .fl-q')).opacity]")
                check(float(op[0]) < 0.05 and float(op[1]) > 0.95, f'{tag} moon-5: a quick look hides its dots after 1.5 s and shows "?": {op}')
                pg.evaluate('__test.speed(6)')
            pg.evaluate('__test.right()')
            pg.wait_for_function('__test.state().right === 1', timeout=20000)
            check(True, f'{tag} {lid}: a right landing counts')
            next_fly(pg, 0)
            pg.evaluate(f'__test.aimAsk({json.dumps(T)})')
            spot = pg.evaluate('__test.wrong()')
            pg.wait_for_selector('#bubble:not([hidden])', timeout=20000)
            bub = pg.inner_text('#bubble')
            r = st(pg)['results'][1]
            check(not r['right'] and MISS_WORDS[lid] in bub, f'{tag} {lid}: a wrong landing ({spot}) is wrong, and the bubble says so in its words: {bub!r}')
            if lid == 'moon-6':
                next_fly(pg, 1)
                pg.evaluate('__test.aimAsk({ "ask": "compare", "rel": "more", "n": 3 })')
                pg.evaluate('__test.place(9); __test.drop()')
                pg.wait_for_function('__test.state().results.length === 3', timeout=20000)
                check(st(pg)['results'][2]['right'], f'{tag} moon-6: "more than 3" takes 9 as right (any number that fits)')
            home(pg)

        # Pictured sums (Q-033): dots under each number
        for lid, op in (('dust-3', '+'), ('dust-4', '−')):
            start(pg, lid)
            info = pg.evaluate("(() => { const c = document.getElementById('target-n'); return { cls: c.className, on: c.querySelectorAll('.d-on').length, gone: c.querySelectorAll('.d-gone').length, s: __test.state() }; })()")
            sm = info['s']
            a, b = [int(x) for x in sm['sum'].split(f' {op} ')]
            want = (a + b, 0) if op == '+' else (a - b, b)
            check('face-sum' in info['cls'] and (info['on'], info['gone']) == want, f'{tag} {lid}: {sm["sum"]} with dots under each number: {info["on"]} dots, {info["gone"]} crossed out')
            home(pg)

        # Dice lines (D-060, D-067)
        for lid, n in (('moon-4', 7), ('candy-7', 13)):
            start(pg, lid)
            s = st(pg)
            check(s['labelLook'] == 'dice' and len(s['labels']) == n and s['line']['from'] == 0 and s['line']['to'] == n - 1 and s['rule'] == 'any',
                  f'{tag} {lid}: a dice line, 0 to {n - 1}, a face under all {n} marks, a written number to land on: {s["labelLook"]}, {len(s["labels"])}')
            pg.evaluate('__test.aim(5)' if n == 7 else '__test.aim(9)')
            pg.evaluate('__test.wrong()')
            pg.wait_for_selector('#bubble:not([hidden])', timeout=20000)
            pg.wait_for_timeout(500)
            ov = pg.evaluate('__test.overlaps()')
            check(ov == [], f'{tag} {lid}: after a miss the right dice light up, no other face showing under them (RL-3): {ov}')
            home(pg)

        # A challenge round (D-091)
        start(pg, 'moon-8')
        subs, looks = [], []
        for i in range(8):
            next_fly(pg, i - 1) if i else None
            s = st(pg)
            subs.append(s['sub'])
            looks.append((s['sub'], s['labelLook'], s['line']['to']))
            pg.evaluate('__test.right()')
            pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
        check(sorted(set(subs)) == list(range(7)) and len(subs) == 8, f'{tag} moon-8: the challenge asks each of the Moon\'s 7 levels, and one more: {subs}')
        dice = [x for x in looks if x[0] == 3]
        check(all(l2 == 'dice' and to == 6 for _, l2, to in dice) and all(l2 != 'dice' for j, l2, _ in looks if j != 3),
              f'{tag} moon-8: each landing on its own level\'s line and look (level 4\'s dice line, 0 to 6): {looks}')
        pg.wait_for_function('__test.state().phase === "end"', timeout=30000)
        s = st(pg)
        check(s['right'] == 8 and s['progress']['levels'].get('moon-8', {}).get('stars') == 3 and s['progress']['open'] == 'dust-1',
              f'{tag} moon-8: 8 right: 3 stars, and Red Dust opens (D-058): {s["progress"]["open"]}')

        # Tracks: change, keep, come back (format 4)
        home(pg)
        rocks = st(pg)['progress']['rocks']
        pg.evaluate('__test.begin({ state: { ...__test.state().progress, rocks: 120, ships: ["classic", "teapot"], ship: "teapot" } })')
        pg.evaluate("localStorage.setItem('%s', JSON.stringify({ v: 4, ...__test.state().kept }))" % KEY)
        e = pg.evaluate(f'JSON.parse(localStorage.getItem("{KEY}"))')
        check(e['v'] == 4 and e['track'] == 'reception' and e['edition'] == 'lower-1' and e['open'] == 'dust-1' and e['maps'] == {} and e['rocks'] == 120,
              f'{tag}: kept at format 4: the track, its edition and map, the rocks, no other map yet: { {k: e[k] for k in ("v", "track", "edition", "open", "rocks")} }')
        r = pg.evaluate('__test.begin({ track: "year2" })')
        check(r == 'reload', f'{tag}: another track reloads the game on it: {r}')
        pg.wait_for_load_state()
        ready(pg)
        s = st(pg)
        check(s['track'] == 'year2' and s['progress']['rocks'] == 120 and s['progress']['ship'] == 'teapot' and s['progress']['open'] == 'moon-1'
              and s['map']['markers'] and len(s['map']['markers']) == 8,
              f'{tag}: on the higher track: its own map from Moon 1, the 120 rocks and the Teapot kept: {s["track"]}, {s["progress"]["open"]}, {s["progress"]["rocks"]}')
        pg.evaluate('__test.begin({ state: { ...__test.state().progress, rocks: 130 } })')
        pg.evaluate("localStorage.setItem('%s', JSON.stringify({ v: 4, ...__test.state().kept }))" % KEY)
        pg.evaluate('__test.begin({ track: "reception" })')
        pg.wait_for_load_state()
        ready(pg)
        s = st(pg)
        e = pg.evaluate(f'JSON.parse(localStorage.getItem("{KEY}"))')
        check(s['track'] == 'reception' and s['progress']['open'] == 'dust-1' and s['progress']['rocks'] == 130 and list(e['maps']) == ['year2'],
              f'{tag}: and back: the lower map as left (Red Dust open), the rocks earned meanwhile kept, the higher map put by: {s["progress"]["open"]}, {s["progress"]["rocks"]}')
        # A format 3 entry (from before tracks) plays on the stand-in track, all of it kept
        pg.evaluate("localStorage.setItem('%s', JSON.stringify({ v: 3, at: 'dust-2', open: 'dust-2', levels: { 'moon-1': { stars: 3, rocks: 8 } }, rocks: 50, landings: 60, ship: 'classic', ships: ['classic'] }))" % KEY)
        pg.reload()
        ready(pg)
        s = st(pg)
        check(s['track'] == 'year2' and s['levelId'] == 'dust-2' and s['kind'] == 'sums' and s['progress']['rocks'] == 50,
              f'{tag}: a format 3 entry plays on the stand-in track, where its levels mean what they did: {s["track"]}, {s["levelId"]}, {s["kind"]}')
        pg.goto(BASE + '?track=reception')
        ready(pg)
        check(st(pg)['track'] == 'reception', f'{tag}: ?track= in the address picks the track (as ?level= picks the level)')

        others = [u for u in asked if not u.startswith(LOCAL) and not u.startswith('data:')]
        check(not others, f'{tag}: nothing fetched from outside' + (f': {others[:3]}' if others else ''))
        check(not errors, f'{tag}: no page errors' + (f': {errors[:3]}' if errors else ''))
        ctx.close()

    # The --debug preview's Track box (D-089)
    tmp = tempfile.mkdtemp()
    out = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'build_preview.py'), 'rocket-lander', '--number', '0', '--debug', '--out', os.path.join(tmp, 'd.html')],
                         cwd=REPO, capture_output=True, text=True)
    if out.returncode != 0:
        check(False, f'the debug preview builds: {out.stderr[-300:]}')
    else:
        L2 = serve(tmp)
        ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(L2 + 'd.html')
        ready(pg)
        pg.click('.pv-cog')
        pg.fill('#pv-code', '1234')
        pg.click('.pv-open')
        opts = pg.evaluate("[...document.querySelectorAll('#pv-track option')].map((o) => [o.value, o.selected])")
        check(opts == [['reception', True], ['year2', False]], f'debug preview: the Track box shows both tracks, the lower picked: {opts}')
        n_levels = pg.evaluate("document.querySelectorAll('.pv-level option').length")
        check(n_levels == 24, f'debug preview: the level list is the lower track\'s playable levels (3 systems of 8): {n_levels}')
        pg.select_option('#pv-track', 'year2')
        with pg.expect_navigation():
            pg.click('.pv-apply')
        ready(pg)
        check(st(pg)['track'] == 'year2', 'debug preview: Apply with the higher track changes to it, the page reloading')
        check(not errors, 'debug preview: no page errors' + (f': {errors[:3]}' if errors else ''))
        ctx.close()
    br.close()

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
