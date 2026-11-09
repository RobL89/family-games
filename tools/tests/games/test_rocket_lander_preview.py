"""Rocket Lander's preview bundle (D-018). Version 1.0.

Checks that build_preview.py:
1. gives the same bytes on a rebuild, and stamps the game folder's sha256 and commit;
2. stops, rather than building something wrong, when a stand-in's text no longer
   matches the game's files exactly once;
3. makes a page that asks for nothing but itself and Google Fonts (the only outside
   host the game uses, Q-008), with no page errors, and that plays a landing;
4. passes the RL-3 labels test (test_rocket_lander_labels.py --page) as the bundle.

Stand-ins: headless Chromium (Playwright) for phone and PC; a local static server.
Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_lander_preview.py
"""
import functools, hashlib, http.server, os, re, socketserver, subprocess, sys, tempfile, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import build_preview as bp  # noqa: E402

fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


tmp = tempfile.mkdtemp(prefix='rl-preview-')
a, b = os.path.join(tmp, 'a.html'), os.path.join(tmp, 'b.html')
for out in (a, b):
    r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'build_preview.py'), 'rocket-lander',
                        '--number', 'T', '--out', out], cwd=REPO, capture_output=True, text=True)
    check(r.returncode == 0, f'build to {os.path.basename(out)}' + ('' if r.returncode == 0 else ': ' + r.stderr.strip()))
page = open(a, 'rb').read()
check(page == open(b, 'rb').read(), 'a rebuild gives the same bytes')
src = bp.source_hash(os.path.join(REPO, 'games', 'rocket-lander'))
check(f'sha256 of games/rocket-lander: {src}'.encode() in page, 'the stamp carries the game folder\'s sha256')
check(bp.commit_of('games/rocket-lander').encode() in page, 'the stamp carries the game folder\'s commit')
check(b'window.__test' in page and b'import.meta' not in page, 'test hook kept; no import.meta left')

# 2. A stand-in that no longer matches must stop the build.
saved = bp.STAND_INS['rocket-lander']
bp.STAND_INS['rocket-lander'] = [('kit.js', 'this text is not in kit.js', 'x')]
try:
    bp.build('rocket-lander', 'T')
    check(False, 'a stand-in that does not match stops the build')
except bp.BuildError as e:
    check('stand-in text found 0 times' in str(e), 'a stand-in that does not match stops the build, saying why: ' + str(e)[:80])
finally:
    bp.STAND_INS['rocket-lander'] = saved

# 3. Requests, errors and one landing in the bundle.
from playwright.sync_api import sync_playwright  # noqa: E402


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=tmp))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
FONTS = re.compile(r'^https://fonts\.(googleapis|gstatic)\.com/')

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in ((390, 844, True, 'phone'), (1280, 800, False, 'pc')):
        ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
        asked, errors = [], []
        ctx.route('**/*', lambda r: (asked.append(r.request.url),
                                     r.continue_() if r.request.url.startswith(LOCAL) else r.abort()))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(LOCAL + 'a.html')
        pg.wait_for_function('window.__test && __test.state().ready')
        stamp_shown = pg.is_visible('.preview-stamp')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
        check(not pg.is_visible('.preview-stamp'), f'{tag}: the stamp hides once a round starts')
        pg.evaluate('__test.right()')
        pg.wait_for_function('__test.state().right === 1', timeout=20000)
        check(stamp_shown, f'{tag}: the stamp shows on the start screen')
        check(True, f'{tag}: a right landing counts in the bundle')
        others = [u for u in asked if not u.startswith(LOCAL) and not FONTS.match(u)]
        check(not others, f'{tag}: asks for nothing but itself and Google Fonts' + (f': {others[:3]}' if others else ''))
        sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        check(not sideways, f'{tag}: no sideways scrolling')
        check(not errors, f'{tag}: no page errors' + ('' if not errors else ': ' + ' | '.join(errors[:3])))
        ctx.close()
    br.close()
httpd.shutdown()

# 4. RL-3 on the bundle.
r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'test_rocket_lander_labels.py'), '--page', a,
                    os.path.join(tmp, 'shots')], cwd=REPO, capture_output=True, text=True)
print('\n'.join('     ' + ln for ln in r.stdout.strip().splitlines()))
check(r.returncode == 0, 'RL-3 labels test passes on the bundle')

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
