"""How much number line fits: a measurement, not a test. Version 1.0.

For a few lines (0 to 10, 0 to 20, 0 to 50, 0 to 100) at phone portrait (390x844), phone
landscape (844x390) and PC (1280x800), it asks Rocket Lander for the line's length on
screen and the pixels between marks, then works out whether the marks are "tight"
(under numbers.js's TIGHT_PX, 24 px), in which case a landing counts anywhere within
half a numbered gap, so an exact answer can't be asked for. It also gives the longest
whole-number line that stays untight at each size.

Used for the maths-mode ideas in the step 1b+ chat (claude/rocket-lander-ideas.md).
Stand-ins: headless Chromium (Playwright), system fonts; real phones may differ a little.
Usage, from the repo root:
    python3 -B tools/tests/games/measure_rocket_lander_line.py
"""
import functools, http.server, os, socketserver, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
TIGHT_PX = 24
SIZES = [('phone portrait', 390, 844, True), ('phone landscape', 844, 390, True), ('PC', 1280, 800, False)]
LINES = [(0, 10, 1), (0, 20, 5), (0, 50, 10), (0, 100, 10)]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for tag, w, h, mobile in SIZES:
        ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(LOCAL) else r.abort())
        pg = ctx.new_page()
        pg.goto(LOCAL + 'games/rocket-lander/index.html')
        pg.wait_for_function('window.__test && __test.state().ready')
        rows = []
        for a, b, every in LINES:
            pg.evaluate(f'__test.begin({{ settings: {{ from: {a}, to: {b}, step: 1, label_every: {every} }} }})')
            pg.click('#play', force=True)
            pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
            s = pg.evaluate('__test.state()')
            length = s['x1'] - s['x0']
            pps = length / (b - a)
            rows.append((a, b, length, pps, s['tight'], s['allowed']))
            pg.reload()
            pg.wait_for_function('window.__test && __test.state().ready')
        length = rows[0][2]
        longest = int(length // TIGHT_PX)
        print(f'\n{tag} ({w}x{h}): line {length:.0f} px long; longest untight whole-number line: 0 to {longest}')
        for a, b, L, pps, tight, allowed in rows:
            print(f'  {a} to {b}: {pps:5.1f} px per number, tight={tight}, a landing counts within {allowed}')
        ctx.close()
    br.close()
httpd.shutdown()
