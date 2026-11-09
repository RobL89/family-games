"""Browser test for Rocket Sums, played on its own as a plain page. Version 1.2.

Changes at v1.2 (step 2a-3): the round ends with Bip's moment (D-044), here after a missed last
landing, and is reported only after it; progress is kept under the tile's one entry on the
device (D-042); nothing at all is fetched from outside, and the preview carries its font (D-043).

Changes at v1.1: levels 1 and 2 play in two halves, each on its own line (D-040), and a round
asks at most one sum answering 0 (proposed, Q-022), checked over whole rounds.

Rocket Sums is the rocket game's maths tile (D-021, D-027, D-037), on the shared engine in
games/_common/rocket/round.js. Its pure parts (levels, sums, lines) have their own test,
test_rocket_sums_core.py; this one plays it:
  - on its own: level 1, a line of 0 to 5, + sums with answers up to 5 (D-039; GC5);
  - the chip shows the sum and the target is read as words; a beam points at the exact
    spot the rocket would land on (D-032);
  - right and wrong landings: a miss shows the answer and the sum in the bubble;
  - levels from begin({ level }) and the address (?level=): level 2 asks −, level 7 asks ×
    on a stretch of 10 marks around the answer, re-laid for each sum;
  - the operations setting overrides the level;
  - a full round reports its stars and level, and saves the state, as Rocket Lander does;
  - the --debug preview bundle builds the same bytes twice and plays, with its test panel.

Stand-ins: headless Chromium (Playwright) for the phone and PC, a local static server for
the family site.

Needs Python Playwright. From the repo root:
    python3 -B tools/tests/games/test_rocket_sums_e2e.py [folder for screenshots]
Fails on any request that leaves the local server, on any
console error or warning, and on sideways scrolling at phone (both ways round) and PC
sizes, light and dark. Screenshots show made-up play only and are never committed.
"""
import functools, http.server, os, re, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rs-shots-')
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
BASE = f'{LOCAL}games/rocket-sums/index.html'
KEY = 'family-games:rocket-sums:progress'  # D-042: the tile's one entry on the device
FONT_LOADED = "document.fonts.ready.then(() => [...document.fonts].some((f) => f.family.replace(/[\"']/g, '') === 'Fredoka' && f.status === 'loaded'))"
ANSWER = {'+': lambda a, b: a + b, '−': lambda a, b: a - b, '×': lambda a, b: a * b, '÷': lambda a, b: a // b}
errors, fails, outside = [], [], []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def open_game(br, w, h, mobile=False, dark=False, query=''):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                         is_mobile=mobile, has_touch=mobile, color_scheme='dark' if dark else 'light')

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
    pg.goto(BASE + query)
    pg.wait_for_function('window.__test && __test.state().ready')
    return pg


def state(pg):
    return pg.evaluate('__test.state()')


def start(pg):
    pg.evaluate("document.getElementById('play').click()")  # the Play button breathes
    pg.wait_for_function('__test.state().phase === "fly"')


def next_fly(pg, idx):
    pg.evaluate('__test.speed(4)')
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "end" || (s.phase === "fly" && s.idx === {idx}); }})()', timeout=20000)
    pg.evaluate('__test.speed(1)')


def land(pg, good):
    idx = state(pg)['idx']
    pg.wait_for_timeout(200)
    pg.evaluate('__test.right()' if good else '__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"')
    return idx


def sum_ok(s, ops, max_answer=None):
    """The target is a sum of one of these operations, its answer right and in the rules."""
    m = re.fullmatch(r'(\d+) (.) (\d+)', s['sum'] or '')
    if not m or m.group(2) not in ops:
        return False
    a, op, b = int(m.group(1)), m.group(2), int(m.group(3))
    return ANSWER[op](a, b) == s['target'] and s['target'] >= 0 and (max_answer is None or s['target'] <= max_answer)


def no_sideways(pg, name):
    w = pg.evaluate('[document.documentElement.scrollWidth, innerWidth]')
    check(w[0] <= w[1], f'{name}: no sideways scrolling ({w[0]} <= {w[1]})')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- Phone: on its own, level 1 ----------
    ph = open_game(br, 390, 844, mobile=True)
    s = state(ph)
    check(s['level'] == 1 and s['line'] == {'from': 0, 'to': 5, 'step': 1, 'count': 6}, f'on its own: level 1, a line of 0 to 5 (D-039): {s["line"]}')
    check(s['settings'].get('operations') is None and 'from' not in s['settings'], f'settings: operations as the level says, no line ends: {sorted(s["settings"])}')
    ph.screenshot(path=f'{OUT}/ph-start.png')
    check(ph.locator('#title').get_attribute('aria-label') == 'Rocket Sums', 'the start screen is called Rocket Sums')
    start(ph)
    s = state(ph)
    check(s['rule'] == 'sum' and sum_ok(s, '+', 5), f'level 1 asks + with answers up to 5: {s["sum"]} = {s["target"]}')
    chip = ph.evaluate("[document.getElementById('target-n').textContent, document.getElementById('target').getAttribute('aria-label')]")
    check(chip[0] == s['sum'], f'the chip shows the sum: {chip[0]!r}')
    check(chip[1].startswith('Land on ') and ' plus ' in chip[1], f'the sum is read as words: {chip[1]!r}')
    ph.wait_for_timeout(1200)
    s = state(ph)
    check(s['beam'] and s['snap'] is not None and 0 <= s['snap'] <= 5 and s['snap'] == round(s['snap']),
          f'a beam points at the exact spot the rocket would land on: {s["snap"]}')
    ph.screenshot(path=f'{OUT}/ph-fly.png')
    # a right landing
    land(ph, True)
    s = state(ph)
    check(s['results'][0]['right'] and s['results'][0]['sum'], f'a landing on the answer counts: {s["results"][0]}')
    next_fly(ph, 1)
    # a wrong landing: the bubble shows the sum and its answer
    goal = state(ph)['target']
    sum_text = state(ph)['sum']
    land(ph, False)
    ph.wait_for_timeout(1300)
    s = state(ph)
    bub = ph.evaluate("document.getElementById('bubble').textContent")
    check(not s['results'][1]['right'] and s['goal'] == goal, f'a miss shows the answer: goal {s["goal"]}, answer {goal}')
    check(f'{sum_text} = {goal}' in bub, f'the bubble shows the sum and its answer: {bub!r}')
    ph.screenshot(path=f'{OUT}/ph-wrong.png')
    no_sideways(ph, 'phone, light')
    ph.context.close()

    # ---------- PC: a full round on level 1; reported and saved ----------
    pc = open_game(br, 1280, 800)
    start(pc)
    seen1 = []
    check(pc.evaluate(FONT_LOADED), 'the Fredoka font loads from games/_common/fonts/ (D-043)')
    for i, good in enumerate([True, True, True, True, True, True, True, False]):
        s = state(pc)
        seen1.append((s['sum'], s['target'], s['line']['to']))
        land(pc, good)
        if i < 7:
            next_fly(pc, i + 1)
    # Bip's moment (D-044) after a missed last landing: it follows the hop to the right answer
    pc.wait_for_function('__test.state().phase === "finale"', timeout=20000)
    f0 = state(pc)
    check(pc.evaluate('__test.reported()') == [] and abs(f0['rocketX'] - pc.evaluate(f'__test.xOf({f0["goal"]})')) < 2,
          f'after a miss, Bip\'s moment starts on the right answer, before the round is reported (rocket at {f0["rocketX"]:.0f})')
    pc.wait_for_function('__test.state().finale.t > 3.3', timeout=20000)
    f = state(pc)['finale']
    check(f['stars'] == 3 and f['pad'] and f['ladder'] and f['flag'] and f['fireworks'] > 0 and not f['pilotIn'],
          f'Bip\'s moment: the pad, ladder, a flag with 3 stars and fireworks: {f}')
    pc.screenshot(path=f'{OUT}/pc-finale.png')
    check(all(to == 5 and ans <= 5 for _, ans, to in seen1[:4]) and all(to == 10 and ans <= 10 for _, ans, to in seen1[4:])
          and all(sum_ok({'sum': t, 'target': a}, '+') for t, a, _ in seen1),
          f'level 1: + to 5 on 0 to 5, then + to 10 on 0 to 10 (D-040): {seen1}')
    check(sum(a == 0 for _, a, _ in seen1) <= 1, 'level 1: at most one answer of 0 in the round (Q-022)')
    pc.wait_for_function('__test.state().phase === "end"')
    rows = pc.evaluate('__test.reported()')
    check(len(rows) == 1 and rows[0]['stars'] == 3 and rows[0]['level'] == 1, f'the round is reported: 3 stars, level 1: {rows}')
    saved = pc.evaluate('__test.saved()')
    check(bool(saved) and saved.get('unlocked') == 2, f'the state is saved: {saved}')
    keys = pc.evaluate('Object.keys(localStorage)')
    entry = pc.evaluate(f'JSON.parse(localStorage.getItem("{KEY}"))')
    check(keys == [KEY] and entry == {'v': 1, **{k: saved[k] for k in ('unlocked', 'planet', 'rocks', 'landings')}},
          f'kept on the device under the tile\'s one entry (D-042): {keys}, {entry}')
    pc.reload()
    pc.wait_for_function('window.__test && __test.state().ready')
    check(state(pc)['progress']['unlocked'] == 2, 'a reload keeps the progress')
    pc.wait_for_timeout(1200)
    pc.screenshot(path=f'{OUT}/pc-end.png')
    no_sideways(pc, 'PC, light')
    pc.context.close()

    # ---------- Levels through begin() ----------
    pc = open_game(br, 1280, 800, dark=True)
    check(pc.evaluate('__test.begin({ level: 2 })'), 'begin() takes level 2')
    start(pc)
    seen2 = []
    for i in range(8):
        s = state(pc)
        top = 5 if i < 4 else 10
        seen2.append((s['sum'], s['target'], s['line']['to'], sum_ok(s, '−', top) and int(s['sum'].split()[0]) <= top
                      and s['line']['from'] == 0 and s['line']['to'] == top))
        land(pc, True)
        next_fly(pc, i + 1)
    check(all(ok for *_, ok in seen2), f'level 2: − from 5 or less on 0 to 5, then from 10 or less on 0 to 10, nothing below zero (D-040): {seen2}')
    check(sum(a == 0 for _, a, _, _ in seen2) <= 1, f'level 2: at most one answer of 0 in the round (Q-022)')
    pc.context.close()

    pc = open_game(br, 1280, 800)
    check(pc.evaluate('__test.begin({ level: 7 })'), 'begin() takes level 7')
    start(pc)
    seen = []
    for i in range(4):
        s = state(pc)
        L = s['line']
        seen.append((s['sum'], L['from'], L['to']))
        check(sum_ok(s, '×', 100) and L['to'] - L['from'] == 10 and L['from'] <= s['target'] <= L['to'],
              f'level 7: {s["sum"]} = {s["target"]} on a stretch of 10 marks, {L["from"]} to {L["to"]}')
        land(pc, True)
        next_fly(pc, i + 1)
    check(len({(f, t) for _, f, t in seen}) > 1, f'the stretch is laid out anew for each sum: {seen}')
    got = pc.evaluate("__test.aimSum(7, '×', 8)")
    s = state(pc)
    check(got == 56 and s['line']['from'] <= 56 <= s['line']['to'] and s['line']['to'] - s['line']['from'] == 10,
          f'a sum set while flying gets its own stretch: 7 × 8 on {s["line"]}')
    labels = s['labels']
    check('56' in labels or (s['line']['from'] < 56 < s['line']['to'] and len(labels) == 11), f'the stretch writes its numbers: {labels}')
    pc.wait_for_timeout(900)
    pc.screenshot(path=f'{OUT}/pc-level7.png')
    land(pc, True)
    check(state(pc)['results'][-1]['right'] and state(pc)['results'][-1]['spot'] == 56, 'landing on 56 counts for 7 × 8')
    no_sideways(pc, 'PC, level 7')
    pc.context.close()

    # ---------- The operations setting, and the address's level ----------
    pc = open_game(br, 1280, 800, query='?level=8')
    check(state(pc)['level'] == 8, 'the address sets the level (?level=8)')
    check(pc.evaluate("__test.begin({ level: 8, settings: { operations: '+' } })"), 'begin() takes an operations setting')
    start(pc)
    plus = []
    for i in range(5):
        s = state(pc)
        plus.append(sum_ok(s, '+', 20))
        land(pc, True)
        next_fly(pc, i + 1)
    check(all(plus), f'the operations setting overrides level 8: only + asked: {plus}')
    pc.context.close()

    # ---------- Phone sideways and dark: level 5 on a stretch ----------
    ps = open_game(br, 844, 390, mobile=True, dark=True)
    check(ps.evaluate('__test.begin({ level: 5 })'), 'begin() takes level 5')
    start(ps)
    ps.wait_for_timeout(1200)
    s = state(ps)
    check(sum_ok(s, '+−', 20) and s['line']['to'] - s['line']['from'] == 10, f'level 5 sideways: {s["sum"]} on {s["line"]}')
    ps.screenshot(path=f'{OUT}/ps-level5.png')
    no_sideways(ps, 'phone sideways, dark')
    ps.context.close()

    # ---------- The preview bundle with its test panel (D-018, D-020) ----------
    sys.path.insert(0, HERE)
    import build_preview as bp
    page, src, stamp = bp.build('rocket-sums', 'test', debug=True)
    check('Rocket Sums' in page and 'rocket-sums-preview-test-panel' in page, f'the --debug preview builds: {stamp}')
    check(page == bp.build('rocket-sums', 'test', debug=True)[0], 'the same files build the same bytes')
    tmp = tempfile.mkdtemp(prefix='rs-preview-')
    with open(os.path.join(tmp, 'p.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    ctx = br.new_context(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True)
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') or r.request.url.startswith('data:') else (r.abort(), outside.append(r.request.url)))
    pv = ctx.new_page()
    pv.on('pageerror', lambda e: errors.append(f'preview pageerror: {e}'))
    pv.goto('file://' + os.path.join(tmp, 'p.html'))
    pv.wait_for_function('window.__test && __test.state().ready')
    check(pv.evaluate(FONT_LOADED), 'the preview carries its font inside the page (D-043)')
    pv.click('.pv-cog')
    opts = pv.evaluate("[...document.querySelectorAll('.pv-level option')].length")
    ops = pv.evaluate("[...document.getElementById('pv-operations').options].map((o) => o.value)")
    check(opts == 8 and ops == ['', '+', '+ −', '+ − ×', '+ − × ÷'], f'the test panel offers 8 levels and the operations: {opts}, {ops}')
    pv.select_option('.pv-level', '7')
    pv.click('.pv-apply')
    check(state(pv)['level'] == 7, 'Apply plays the level picked')
    pv.screenshot(path=f'{OUT}/preview-panel.png')
    pv.click('.pv-btns button:nth-child(3)')
    start(pv)
    check(state(pv)['sum'] and '×' in state(pv)['sum'], f'the preview plays level 7: {state(pv)["sum"]}')
    ctx.close()
    br.close()

check(not outside, f'nothing fetched from outside: {outside[:3]}')
check(not errors, f'no console errors or warnings: {errors[:3]}')
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
