"""Rocket Lander's preview bundle (D-018). Version 1.9.

Changes at v1.9 (Rob, 10 Nov): the test panel's "3 stars on this system" fills the picked level's
system and puts the rocket at its last level, ready for hyperspace, kept through home.
Changes at v1.8 (step 2c-build): the test panel's cog covers none of the map's buttons, the
hangar's rocks count or the stamp (it covered the rocks count from the top-right corner).

Changes at v1.7 (step 2c-build, D-058, D-068): the map is home, so the stamp and the test panel's cog
show on the map; the panel sets the level picked (where the rocket goes, the map opening up to it),
that level's best stars and rocks found, and the moon rocks, in place of the planets unlocked; the
level is the map's place, kept on the device by the game, so after a reset and a reload the map
starts from level 1 (the panel no longer puts a level back for the tab); progress is format 3.

Changes at v1.6 (step 2a-4c, ER-004): "home" (a reload) keeps the progress on the device: the
rocks and planets applied in the test panel, and what the game kept since (a ship bought, rocks
spent), are not replaced by the panel's copy from when Apply was pressed.

Changes at v1.5 (step 2a-4b+): the test panel opens only with the code 1234, asks again each
time, and its Reset clears both rocket tiles' progress on a second tap, staying reset after a
reload (D-055).

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
5. with --debug: the cog shows on the map only, clear of its buttons, a level, a setting and
   progress applied in the panel reach the game, and a normal build has no cog.

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
        pg.goto(LOCAL + 'a.html?track=year2')  # the stand-in levels these checks were written for (D-089)
        pg.wait_for_function('window.__test && __test.state().ready')
        stamp_shown = pg.is_visible('.preview-stamp')
        check(pg.evaluate("document.fonts.ready.then(() => [...document.fonts].some((f) => f.family.replace(/[\"']/g, '') === 'Fredoka' && f.status === 'loaded'))"),
              f'{tag}: the font loads from inside the page')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
        check(not pg.is_visible('.preview-stamp'), f'{tag}: the stamp hides once a round starts')
        pg.evaluate('__test.right()')
        pg.wait_for_function('__test.state().right === 1', timeout=20000)
        check(stamp_shown, f'{tag}: the stamp shows on the map')
        check(True, f'{tag}: a right landing counts in the bundle')
        others = [u for u in asked if not u.startswith(LOCAL) and not u.startswith('data:')]
        check(not others, f'{tag}: asks for nothing but itself' + (f': {others[:3]}' if others else ''))
        sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        check(not sideways, f'{tag}: no sideways scrolling')
        check(pg.locator('.pv-cog').count() == 0, f'{tag}: no cog in a normal build')
        # the --debug build
        pg.goto(LOCAL + 'd.html?track=year2')
        pg.wait_for_function('window.__test && __test.state().ready')
        check(pg.is_visible('.pv-cog'), f'{tag}: debug build: the cog shows on the map')
        covered = pg.evaluate('''() => {
          const c = document.querySelector('.pv-cog').getBoundingClientRect();
          const hit = (r) => r.width && r.height && r.left < c.right && c.left < r.right && r.top < c.bottom && c.top < r.bottom;
          return [...document.querySelectorAll('button[aria-label="Back to games"], #map-bar button, #map-rocks, #marks .mk, #play, #banner, .preview-stamp')]
            .filter((e) => e.offsetParent !== null && hit(e.getBoundingClientRect())).map((e) => e.id || e.className);
        }''')
        check(not covered, f'{tag}: debug build: the cog covers none of the map\'s buttons, the rocks count or the stamp' + (f': {covered}' if covered else ''))
        pg.click('.pv-cog')
        check(pg.is_visible('.pv-lock') and not pg.is_visible('.pv-level'), f'{tag}: debug build: the cog opens the lock, not the panel (D-055)')
        pg.fill('#pv-code', '1111')
        pg.click('.pv-open')
        check(pg.is_visible('.pv-lock') and not pg.is_visible('.pv-level'), f'{tag}: debug build: a wrong code opens nothing')
        pg.fill('#pv-code', '1234')
        pg.click('.pv-open')
        check(pg.is_visible('.pv-level') and not pg.is_visible('.pv-lock'), f'{tag}: debug build: 1234 opens the panel')
        pg.select_option('.pv-level', '6')
        pg.fill('#pv-landings_per_round', '3')
        pg.fill('#pv-stars', '2')
        pg.fill('#pv-found', '5')
        pg.fill('#pv-rocks', '12')
        pg.click('.pv-apply')
        s = pg.evaluate('__test.state()')
        got = (s['level'], s['line']['from'], s['line']['to'], s['labels'], s['settings']['from'], s['settings']['landings_per_round'],
               s['progress']['at'], s['progress']['open'], s['progress']['rocks'], s['progress']['levels'].get('moon-6'))
        check(got == (6, 0, 10, ['0', '2', '4', '6', '8', '10'], None, 3, 'moon-6', 'moon-7', 12, {'stars': 2, 'rocks': 5}),
              f'{tag}: debug build: level 6 (0 to 10, every other number), 3 landings, its 2 stars (so level 7 opens) and 5 rocks, and 12 rocks reach the game: {got}')
        check(pg.inner_text('#map-rocks') == '12' and pg.evaluate('__test.state().map.rocketAt') == 'moon-6', f'{tag}: debug build: the map shows the rocks set, the rocket at level 6')
        # Home reloads the preview: progress comes from the device, not the panel's copy (ER-004)
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
        s = pg.evaluate('__test.state()')
        got = (s['progress']['rocks'], s['progress']['open'], s['level'], s['settings']['landings_per_round'])
        check(got == (12, 'moon-7', 6, 3), f'{tag}: debug build: after Apply, home keeps the rocks, the map, the place and the settings set: {got}')
        bought = {'v': 3, 'at': 'moon-6', 'open': 'moon-7', 'levels': {'moon-6': {'stars': 2, 'rocks': 5}}, 'rocks': 2, 'landings': 1, 'ship': 'box', 'ships': ['classic', 'box']}
        pg.evaluate('(e) => localStorage.setItem("family-games:rocket-lander:progress", JSON.stringify(e))', bought)
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
        p = pg.evaluate('__test.state().progress')
        got = (p['rocks'], p['ship'], p['ships'])
        check(got == (2, 'box', ['classic', 'box']), f'{tag}: debug build: what the game kept since (a ship bought, 2 rocks left) survives home: {got}')
        pg.click('.pv-cog')
        pg.fill('#pv-code', '1234')
        pg.click('.pv-open')
        if tag == 'phone':
            pg.screenshot(path=os.path.join(tmp, 'panel-phone.png'))
        else:
            pg.screenshot(path=os.path.join(tmp, 'panel-pc.png'))
        # Reset (D-055): clears both rocket tiles' progress on this device, on a second tap.
        made_up = {'v': 3, 'at': 'dust-2', 'open': 'dust-2', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}, 'rocks': 90, 'landings': 70, 'ship': 'teapot', 'ships': ['classic', 'teapot']}
        old_sums = {'v': 2, 'unlocked': 5, 'planet': 'ice', 'rocks': 90, 'landings': 70, 'ship': 'teapot', 'ships': ['classic', 'teapot']}
        pg.evaluate('([a, b]) => { localStorage.setItem("family-games:rocket-lander:progress", JSON.stringify(a)); localStorage.setItem("family-games:rocket-sums:progress", JSON.stringify(b)); }', [made_up, old_sums])
        pg.click('.pv-reset')
        kept = pg.evaluate('["rocket-lander", "rocket-sums"].map((t) => localStorage.getItem(`family-games:${t}:progress`))')
        check(all(kept), f'{tag}: debug build: one tap on Reset clears nothing yet')
        pg.click('.pv-reset')
        kept = pg.evaluate('["rocket-lander", "rocket-sums"].map((t) => JSON.parse(localStorage.getItem(`family-games:${t}:progress`)))')
        fresh = kept[0] or {}
        check(kept[1] is None and (fresh.get('rocks'), fresh.get('levels'), fresh.get('maps'), fresh.get('track')) == (0, {}, {}, 'year2'),
              f'{tag}: debug build: a second tap clears the game\'s progress (its entry now a fresh start on the same track, format 4) and the old Rocket Sums entry: {kept}')
        p = pg.evaluate('__test.state().progress')
        got = (p['open'], p['at'], p['rocks'], p['landings'], p['ship'], p['ships'], pg.inner_text('#map-rocks'), pg.input_value('#pv-rocks'))
        check(got == ('moon-1', 'moon-1', 0, 0, 'classic', ['classic'], '0', '0'), f'{tag}: debug build: the game starts afresh: {got}')
        pg.evaluate('__test.begin({ level: 6, settings: {}, state: { ships: ["classic", "teapot"], ship: "teapot", rocks: 5 } })')
        pg.wait_for_function('__test.state().doorShip === "teapot"', timeout=5000)
        pg.click('.pv-reset')
        pg.click('.pv-reset')
        pg.wait_for_function('__test.state().doorShip === "classic"', timeout=5000)
        check(True, f'{tag}: debug build: after a reset the hangar door shows Classic again')
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
        p = pg.evaluate('__test.state().progress')
        lvl = pg.evaluate('__test.state().level')
        check((p['rocks'], p['open'], lvl) == (0, 'moon-1', 1),
              f'{tag}: debug build: after a reload it stays reset, the map from level 1 (the place is the game\'s, not the tab\'s): {p["rocks"]} rocks, open to {p["open"]}, level {lvl}')
        # One tap fills a system with 3 stars, the rocket at its last level, ready for hyperspace (Rob, 10 Nov).
        pg.click('.pv-cog')
        pg.fill('#pv-code', '1234')
        pg.click('.pv-open')
        pg.select_option('.pv-level', '3')
        pg.click('.pv-fill')
        s = pg.evaluate('__test.state()')
        moon = [s['progress']['levels'].get(f'moon-{n}', {}).get('stars') for n in range(1, 9)]
        check(moon == [3] * 8 and s['progress']['at'] == 'moon-8' and s['level'] == 8 and s['map']['rocketAt'] == 'moon-8'
              and not s['progress']['levels'].get('dust-1'),
              f'{tag}: debug build: "3 stars on this system" fills the Moon\'s 8 levels and puts the rocket at level 8, nothing more: {moon}, at {s["progress"]["at"]}')
        pg.click('.pv-btns button:has-text("Close")')
        pg.reload()
        pg.wait_for_function('window.__test && __test.state().ready')
        p = pg.evaluate('__test.state().progress')
        check(sum(1 for n in range(1, 9) if p['levels'].get(f'moon-{n}', {}).get('stars') == 3) == 8 and p['at'] == 'moon-8',
              f'{tag}: debug build: the filled system is kept on the device, through home: at {p["at"]}')
        pg.click('.pv-cog')
        check(pg.is_visible('.pv-lock'), f'{tag}: debug build: the lock asks again each time')
        pg.fill('#pv-code', '1234')
        pg.click('.pv-open')
        pg.click('.pv-btns button:has-text("Close")')
        pg.click('#play', force=True)
        pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)
        check(not pg.is_visible('.pv-cog') and pg.evaluate('__test.state().levelId') == 'moon-8', f'{tag}: debug build: the cog hides once a round starts, level 8 playing')
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
