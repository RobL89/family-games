"""RL-3: after a miss, the lit-up number must not sit on top of its neighbours. Version 1.1.

Changes at v1.1: --page runs the same check on another page, such as a preview bundle
(test_rocket_lander_preview.py); with no --page it tests the game folder as before.

The bug (games pack, rocket-lander/DESIGN.md, RL-3): on a phone, on -10 to 10 labelled
every 5, the lit-up number after a wrong landing overlapped the numbers beside it.

For each target beside a label (6, -4, 1, 9, -9, -6, 4, -1), it makes the landing miss,
waits until the number is fully lit, and asks the game which labels are still drawn
(alpha over 0.05) where they cross the lit-up box. There must be none, on a phone
(390x844) and a PC (1280x800). One screenshot of each width is kept for the eye check.

Stand-ins: headless Chromium (Playwright); a local static server; system fonts.
Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_lander_labels.py [--page FILE] [folder for screenshots]
"""
import functools, http.server, os, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = sys.argv[1:]
PAGE = None
if '--page' in ARGS:
    i = ARGS.index('--page')
    PAGE = os.path.abspath(ARGS[i + 1])
    del ARGS[i:i + 2]
ROOT, PATH = (os.path.dirname(PAGE), os.path.basename(PAGE)) if PAGE else (REPO, 'games/rocket-lander/index.html')
OUT = ARGS[0] if ARGS else tempfile.mkdtemp(prefix='rl3-shots-')
os.makedirs(OUT, exist_ok=True)
TARGETS = [6, -4, 1, 9, -9, -6, 4, -1]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
fails, errors = [], []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def run(br, w, h, mobile, tag):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                         is_mobile=mobile, has_touch=mobile)
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(LOCAL) else r.abort())
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.goto(LOCAL + PATH + '?track=year2')  # the stand-in levels (D-089)
    pg.wait_for_function('window.__test && __test.state().ready')
    pg.evaluate("__test.begin({ settings: { from: -10, to: 10, label_every: 5, landings_per_round: 8 } })")
    pg.click('#play', force=True)
    bad = {}
    for n, t in enumerate(TARGETS):
        pg.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {n}', timeout=20000)
        got = pg.evaluate(f'__test.aim({t})')
        pg.evaluate('__test.wrong()')
        pg.wait_for_function('__test.overlaps() !== null', timeout=5000)
        hits = pg.evaluate('__test.overlaps()')
        if hits:
            bad[got] = hits
        if n == 0:
            pg.wait_for_timeout(250)
            pg.screenshot(path=f'{OUT}/rl3-{tag}.png')
        pg.evaluate('__test.speed(4)')
    check(not bad, f'{tag}: no label shows through the lit-up number after a miss' + (f': {bad}' if bad else ''))
    ctx.close()


with sync_playwright() as pw:
    br = pw.chromium.launch()
    run(br, 390, 844, True, 'phone')
    run(br, 1280, 800, False, 'pc')
    br.close()
httpd.shutdown()
check(not errors, 'no page errors' + ('' if not errors else ': ' + ' | '.join(errors[:3])))
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
