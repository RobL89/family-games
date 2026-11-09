"""Rocket Lander's preview bundle (D-018). Version 1.4.

Changes at v1.4 (step 2a-3): the font ships with the games (D-043): the bundle carries it inside
the page, its files are covered by the stamp, and the page asks for nothing but itself.

Changes at v1.3: the test panel's level picker plays Number mode's real levels (D-038):
level 6 picked in the panel reaches the game with its line and written numbers.

Changes at v1.2: the shared engine is in games/_common/rocket/ (D-027): the stamp's sha256
and commit cover it, the stand-ins are in its kit.js, and the bundle may reach no further
outside the game's folder than games/_common/ (D-036).

Changes at v1.1: checks the --debug test panel (D-020): only in a --debug build, only on
the start screen, and Apply reaches the game through begin().

Checks that build_preview.py:
1. gives the same bytes on a rebuild, and stamps the game folder's sha256 and commit;
2. stops, rather than building something wrong, when a stand-in's text no longer
   matches the game's files exactly once;
3. makes a page that asks for nothing but itself (D-043), with its font loaded from inside
   the page, no page errors, and that plays a landing;
4. passes the RL-3 labels test (test_rocket_lander_labels.py --page) as the bundle;
5. with --debug: the cog shows on the start screen only, a level, a setting and progress
   applied in the panel reach the game, and a normal build has no cog.

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
a, b, d = os.path.join(tmp, 'a.html'), os.path.join(tmp, 'b.html'), os.path.join(tmp, 'd.html')
for out in (a, b, d):
    r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'build_preview.py'), 'rocket-lander',
                        '--number', 'T', '--out', out] + (['--debug'] if out == d else []),
                       cwd=REPO, capture_output=True, text=True)
    check(r.returncode == 0, f'build to {os.path.basename(out)}' + ('' if r.returncode == 0 else ': ' + r.stderr.strip()))
page = open(a, 'rb').read()
check(page == open(b, 'rb').read(), 'a rebuild gives the same bytes')
src = bp.source_hash('rocket-lander')
used = bp.used_files('rocket-lander')
check('games/_common/rocket/scene.js' in used and 'games/_common/rocket/game.css' in used and 'games/rocket-lander/game.js' in used
      and 'games/_common/fonts/fredoka.css' in used and 'games/_common/fonts/fredoka-latin-600-normal.woff2' in used,
      f'the bundle is made from the game folder, the shared engine and the font ({len(used)} files)')
check(f'games/_common/fonts, games/_common/rocket): {src}'.encode() in page, 'the stamp carries the sha256 of the game and the shared files')
check(bp.commit_of('games/rocket-lander', 'games/_common/fonts', 'games/_common/rocket').encode() in page, 'the stamp carries their last commit')
check(page.count(b'url(data:font/woff2;base64,') == 3 and b'fonts.googleapis' not in page and b'fonts.gstatic' not in page,
      'the three font files are inside the page, and Google Fonts is not named (D-043)')
check(b'window.__test' in page and b'import.meta' not in page, 'test hook kept; no import.meta left')
check(b'pv-cog' not in page and b'pv-cog' in open(d, 'rb').read(), 'the test panel is only in the --debug build')

# 2. A stand-in that no longer matches must stop the build.
saved = bp.STAND_INS['rocket-lander']
bp.STAND_INS['rocket-lander'] = [('_common/rocket/kit.js', 'this text is not in kit.js', 'x')]
try:
    bp.build('rocket-lander', 'T')
    check(False, 'a stand-in that does not match stops the build')
except bp.BuildError as e:
    check('stand-in text found 0 times' in str(e), 'a stand-in that does not match stops the build, saying why: ' + str(e)[:80])
finally:
    bp.STAND_INS['rocket-lander'] = saved

# 2b. D-036: an import outside the game's folder and games/_common/ must stop the build.
try:
    bp.resolve('rocket-lander', 'games/rocket-lander/game', '../word-worm/x')
    check(False, 'an import from another game\'s folder stops the build')
except bp.BuildError as e:
    check('outside games/rocket-lander/ and games/_common/' in str(e), 'an import from another game\'s folder stops the build')
check(bp.resolve('rocket-lander', 'games/rocket-lander/game', '../_common/rocket/scene') == 'games/_common/rocket/scene',
      'an import from games/_common/ is allowed')

# 3. Requests, errors and one landing in the bundle.
from playwright.sync_api import sync_playwright  # noqa: E402


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=tmp))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in ((390, 844, True, 'phone'), (1280, 800, False, 'pc')):
        ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
        asked, errors = [], []
        ctx.route('**/*', lambda r: (asked.append(r.request.url),
                                     r.continue_() if r.request.url.startswith(LOCAL) or r.request.url.startswith('data:') else r.abort()))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(LOCAL + 'a.html')
        pg.wait_for_function('window.__test && __test.state().ready')
        stamp_shown = pg.is_visible('.preview-stamp')
        check(pg.evaluate("document.fonts.ready.then(() => [...document.fonts].some((f) => f.family.replace(/[\"']/g, '') === 'Fredoka' && f.status === 'loaded'))"),
              f'{tag}: the font loads from inside the page')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
        check(not pg.is_visible('.preview-stamp'), f'{tag}: the stamp hides once a round starts')
        pg.evaluate('__test.right()')
        pg.wait_for_function('__test.state().right === 1', timeout=20000)
        check(stamp_shown, f'{tag}: the stamp shows on the start screen')
        check(True, f'{tag}: a right landing counts in the bundle')
        others = [u for u in asked if not u.startswith(LOCAL) and not u.startswith('data:')]
        check(not others, f'{tag}: asks for nothing but itself' + (f': {others[:3]}' if others else ''))
        sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        check(not sideways, f'{tag}: no sideways scrolling')
        check(pg.locator('.pv-cog').count() == 0, f'{tag}: no cog in a normal build')
        # the --debug build
        pg.goto(LOCAL + 'd.html')
        pg.wait_for_function('window.__test && __test.state().ready')
        check(pg.is_visible('.pv-cog'), f'{tag}: debug build: the cog shows on the start screen')
        pg.click('.pv-cog')
        check(pg.is_visible('.pv-sheet'), f'{tag}: debug build: the cog opens the panel')
        pg.select_option('.pv-level', '6')
        pg.fill('#pv-landings_per_round', '3')
        pg.fill('#pv-unlocked', '4')
        pg.fill('#pv-rocks', '12')
        pg.click('.pv-apply')
        s = pg.evaluate('__test.state()')
        got = (s['level'], s['line']['from'], s['line']['to'], s['labels'], s['settings']['from'], s['settings']['landings_per_round'],
               s['progress']['unlocked'], s['progress']['rocks'])
        check(got == (6, 0, 10, ['0', '2', '4', '6', '8', '10'], None, 3, 4, 12),
              f'{tag}: debug build: level 6 (0 to 10, every other number), 3 landings, 4 planets and 12 rocks reach the game: {got}')
        check(pg.inner_text('#start-rocks') == '12', f'{tag}: debug build: the start screen shows the rocks set')
        if tag == 'phone':
            pg.screenshot(path=os.path.join(tmp, 'panel-phone.png'))
        else:
            pg.screenshot(path=os.path.join(tmp, 'panel-pc.png'))
        pg.click('.pv-btns button:has-text("Close")')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
        check(not pg.is_visible('.pv-cog'), f'{tag}: debug build: the cog hides once a round starts')
        check(not errors, f'{tag}: no page errors' + ('' if not errors else ': ' + ' | '.join(errors[:3])))
        ctx.close()
    br.close()
httpd.shutdown()

# 4. RL-3 on the bundle.
r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'test_rocket_lander_labels.py'), '--page', a,
                    os.path.join(tmp, 'shots')], cwd=REPO, capture_output=True, text=True)
print('\n'.join('     ' + ln for ln in r.stdout.strip().splitlines()))
check(r.returncode == 0, 'RL-3 labels test passes on the bundle')

print(f'Screenshots of the panel: {tmp}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
