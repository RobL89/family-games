"""Hamster Highway step 16: mock-ups of the picnic's backdrop (levels 25 and 26), version 0.1 (21 Nov), made while Rob
was out: two looks (mock_hamster_picnic_backdrops.js 0.1), each drawn by the real game behind a stand-in 9 x 16 board,
phone sideways (844 x 390, touch) and PC (1366 x 650); a scratch worktree of HEAD gets the looks appended to its art.js;
the repo is not changed. Headless Chromium stands in for the phone and the PC. Checks (exit 1 if one fails): every
screenshot made and not blank; the page names no web address; every svg closed; the game logged no errors. --fault N
plants a fault the checks must catch (1: a web address; 2: a screenshot left out; 3: an svg left open).
Usage, from the repo root: python3 -B tools/tests/games/mock_hamster_step16.py OUT.html [--fault N]
"""
import base64, functools, http.server, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-step16-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


# ---------------------------------------------------------------- the picnic, in the real game
WT = '/tmp/hh-step16-mockwt'
SERVE = '/tmp/hh-step16-serve'
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
try:
    art = os.path.join(WT, 'games', 'hamster-highway', 'art.js')
    src = open(art).read()
    for old, new in [
        ("export function backdrop(name, w = W) {\n",
         "export function backdrop(name, w = W) {\n  if (name.startsWith('picnic')) return g({ picnicA, picnicB }[name](w), '', ` data-back=\"${name}\"`);\n"),
        ("export const backHeight = (name) => (name === 'pond' || name === 'frame' ? 540 : H);",
         "export const backHeight = (name) => (name === 'pond' || name === 'frame' || name.startsWith('picnic') ? 540 : H);"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    src += '\n' + open(os.path.join(HERE, 'mock_hamster_picnic_backdrops.js')).read()
    open(art, 'w').write(src)
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
# A stand-in board: two bars in the air and a top bar to home, the ground with a gap (not level 23's layout).
BOARD = {'id': 'picnicmock', 'name': 'Picnic mock-up', 'room': 'garden', 'spot': 'sink', 'new': None,
         'rows': ['................', '...............G', '..........######', '................', '.....######.....',
                  '................', '................', 'S...............', '#######..#######'],
         'tray': {'bouncer': 2, 'signpost': 2, 'rampL': 1, 'bridge': 2}}
LOOKS = ['picnicA', 'picnicB']
SHOTS = {}
errors = []
from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for dev, (w, h, touch) in {'phone': (844, 390, True), 'pc': (1366, 650, False)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
        for look in LOOKS:
            pg.evaluate('(d) => __test.openBoard(d)', dict(BOARD, back=look))
            pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
            pg.wait_for_timeout(400)
            drawn = pg.evaluate(f'() => !!document.querySelector(\'[data-back="{look}"]\')')
            check(drawn, f'{look} drawn on the {dev}')
            SHOTS[(look, dev)] = pg.screenshot()
        ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 2:
    del SHOTS[('picnicB', 'pc')]
check(len(SHOTS) == 4 and all(len(v) > 20000 for v in SHOTS.values()), f'four screenshots, none blank ({len(SHOTS)}: {sorted(len(v) for v in SHOTS.values())} bytes)')


def img(look, dev):
    if (look, dev) not in SHOTS:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/png;base64,{base64.b64encode(SHOTS[(look, dev)]).decode()}" alt="{look}, {dev}" class="{dev}">'


NAMES = {'picnicA': 'A. Blanket under a tree: a red gingham blanket, a teapot and cups, bunting in a big tree, a robin by the crumbs',
         'picnicB': 'B. Picnic table: a wooden table and benches, a striped parasol, a jug of lemonade, a kite caught in a tree'}
INK = '#1B1446'
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway step 16 mock-ups</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px}}
h1{{font-size:22px;margin:4px 0 2px}} h3{{font-size:16px;margin:16px 0 6px}}
.row{{display:flex;flex-wrap:wrap;gap:14px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:12px}} img.pc{{width:620px}} img.phone{{width:520px}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}} .miss{{color:#c00}}
</style></head><body>
<h1>Hamster Highway step 16: the picnic's backdrop</h1>
<p class="stamp">mock_hamster_step16.py 0.1 · 21 Nov · made while you were out; I built on A (proposed). Drawn by the real game behind a stand-in board (not level 25). Headless Chromium stands in for the phone and the PC.</p>
''' + ''.join(f'''<h3>{NAMES[k]}{' <span class="rec">built, proposed</span>' if k == 'picnicA' else ''}</h3>
<div class="row"><figure>{img(k, 'phone')}<figcaption>phone, 844 × 390</figcaption></figure><figure>{img(k, 'pc')}<figcaption>PC, 1366 × 650</figcaption></figure></div>''' for k in ('picnicA', 'picnicB')) + '''
<p><b>Why A:</b> it reads as a picnic at a glance (the blanket, the teapot), keeps the middle of the picture low behind the board, and matches the park picker's blanket.</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
if FAULT == 3:
    page = page.replace('</figcaption>', '<svg></figcaption>', 1)
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I), 'the page names no web address')
check(page.count('<svg') == page.count('</svg>'), f'every svg closed ({page.count("<svg")} opened, {page.count("</svg>")} closed)')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
