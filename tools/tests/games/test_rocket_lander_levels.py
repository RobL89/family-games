"""Browser test for Rocket Lander's Number mode levels (D-035, D-038). Version 1.1.

Changes at v1.1 (step 2c-build, D-058): one game with a map. Number mode's levels are Moon's, 1 to 8
along the map as before, and the sums levels follow as 9 to 16, so the address's level out of range
is now ?level=17 (it was 9): the same check of a level past the end.

Plays the game on its own as a plain page and checks each of the eight levels: the line
and the numbers written, how they look (plain, even and odd coloured, colours faint, odd
numbers faint), and what a round asks for (any number, even or odd, dice faces) in the
shares levels.js gives. Then the new targets close up: the dice-face chip, the even and odd
chip, a right and a wrong landing for each, the spot shown after a miss and the bubble's
words; the level from the address (?level=, contract v0.3 GC5); the level in the round's
report; the colours' contrast against the dark outline; and no sideways scrolling with the
new chips at phone (both ways round) and PC sizes, light and dark.

Stand-ins: headless Chromium (Playwright) for the phone and PC, a local static server for
the family site, and system fonts in place of Google Fonts (blocked here).

Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_lander_levels.py [folder for screenshots]
Fails on any request that leaves the local server other than the blocked fonts, and on any
console error or warning. Screenshots show made-up play only and are never committed.
"""
import functools, http.server, os, re, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-levels-')
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
BASE = f'{LOCAL}games/rocket-lander/index.html?track=year2'  # the stand-in levels these checks were written for (D-089)
FONTS = re.compile(r'https://fonts\.(googleapis|gstatic)\.com/')
INK = '#1B1446'
errors, infos, fails, outside = [], [], [], []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def page(br, w=844, h=390, mobile=True, url=BASE, scheme='dark'):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                         is_mobile=mobile, has_touch=mobile, color_scheme=scheme)

    def route(r):
        u = r.request.url
        if u.startswith(LOCAL) or u.startswith('data:') or u.startswith('blob:'):
            return r.continue_()
        if not FONTS.match(u):
            outside.append(u)
        return r.abort()
    ctx.route('**/*', route)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
          if m.type in ('error', 'warning') and 'fonts' not in m.text and 'ERR_FAILED' not in m.text else
          (infos.append(m.text) if m.type == 'info' else None))
    pg.goto(url)
    pg.wait_for_function('window.__test && __test.state().ready')
    return pg


def state(pg):
    return pg.evaluate('__test.state()')


def begin(pg, level, settings=None):
    return pg.evaluate('([l, s]) => __test.begin({ level: l, settings: s })', [level, settings or {}])


def start(pg):
    pg.evaluate("document.getElementById('play').click()")  # the Play button "breathes"
    pg.wait_for_function('__test.state().phase === "fly"')


def land(pg, good, shot=None):
    idx = state(pg)['idx']
    pg.wait_for_timeout(200)
    pg.evaluate('__test.right()' if good else '__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"')
    if shot:
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{OUT}/{shot}.png')
    s = state(pg)
    pg.evaluate('__test.speed(4)')
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "end" || (s.phase === "fly" && s.idx === {idx + 1}); }})()', timeout=20000)
    pg.evaluate('__test.speed(1)')
    return s


def lum(hexc):
    c = [int(hexc.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


# D-038 and levels.js, with the round shares worked out by hand for 8 landings
# (largest remainder, ties to any, then even-or-odd, then dice; see test_rocket_lander_core.py).
TABLE = {
    1: ('0 to 5', [str(i) for i in range(6)], 'plain', {'any': 8}),
    2: ('0 to 10', [str(i) for i in range(11)], 'plain', {'any': 5, 'dice': 3}),
    3: ('0 to 10', [str(i) for i in range(11)], 'parity', {'parity': 5, 'dice': 3}),
    4: ('0 to 10', [str(i) for i in range(11)], 'parity-faint', {'any': 3, 'parity': 3, 'dice': 2}),
    5: ('0 to 10', [str(i) for i in range(11)], 'odd-faint', {'any': 5, 'dice': 3}),
    6: ('0 to 10', [str(i) for i in range(0, 11, 2)], 'plain', {'any': 5, 'dice': 3}),
    7: ('0 to 10', ['0', '5', '10'], 'plain', {'any': 5, 'dice': 3}),
    8: ('0 to 10', ['0', '10'], 'plain', {'any': 8}),
}

with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- Each level: line, numbers written, their look, the round's shares ----------
    pg = page(br)
    css = pg.evaluate("(() => { const s = getComputedStyle(document.documentElement); return [s.getPropertyValue('--even').trim(), s.getPropertyValue('--odd').trim()]; })()")
    even_c, odd_c = css
    check(even_c.lower() == '#7fd8ff' and odd_c.lower() == '#ffc93c', f'the stylesheet\'s even and odd colours: sky blue and sun yellow ({css})')
    for n, (span, labels, look, shares) in TABLE.items():
        if n > 1:
            pg.reload(); pg.wait_for_function('window.__test && __test.state().ready')
        check(begin(pg, n), f'level {n}: begin() takes it')
        pg.wait_for_timeout(250)
        s = state(pg)
        frm, to = (int(x) for x in span.split(' to '))
        check(s['level'] == n and s['line']['from'] == frm and s['line']['to'] == to, f'level {n}: line {span} ({s["line"]})')
        check(s['labels'] == labels, f'level {n}: numbers written {labels} ({s["labels"]})')
        check(s['labelLook'] == look, f'level {n}: numbers look "{look}"')
        fills = pg.evaluate('__test.labelFills()')
        if look == 'plain':
            check(all(f['fill'] == '#FFFFFF' and f['a'] == 1 for f in fills), f'level {n}: written numbers are plain white')
        elif look == 'parity':
            check(all(f['fill'].lower() == (even_c if int(f['text']) % 2 == 0 else odd_c).lower() for f in fills), f'level {n}: even numbers blue, odd yellow')
        elif look == 'parity-faint':
            ok = all(f['fill'].lower() not in (even_c.lower(), odd_c.lower(), '#ffffff') for f in fills)
            ok = ok and len({f['fill'] for f in fills if int(f['text']) % 2 == 0}) == 1 and len({f['fill'] for f in fills if int(f['text']) % 2}) == 1
            check(ok, f'level {n}: even and odd colours, faded ({sorted({f["fill"] for f in fills})})')
        elif look == 'odd-faint':
            check(all((f['a'] == 0.3) == (int(f['text']) % 2 == 1) for f in fills), f'level {n}: odd numbers faint (0.3), even ones full')
        start(pg)
        s = state(pg)
        tally = {}
        for k in s['plan']:
            tally[k] = tally.get(k, 0) + 1
        check(tally == shares, f'level {n}: the round asks for {shares} ({tally})')
        pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/level-{n}.png')
    pg.context.close()

    # ---------- Faded and full colours: contrast against the dark outline ----------
    pg = page(br)
    begin(pg, 4)
    faint = sorted({f['fill'] for f in pg.evaluate('__test.labelFills()')})
    for c in [even_c, odd_c, '#FFFFFF', *faint]:
        r = contrast(c, INK)
        check(r >= 7, f'{c} on the dark outline {INK}: contrast {r:.1f} (7 or more)')
    pg.context.close()

    # ---------- Dice faces: the chip, a right and a wrong landing ----------
    pg = page(br)
    begin(pg, 2)
    start(pg)
    pg.evaluate("__test.aimRule('dice', 4)")
    chip = pg.evaluate("(() => { const c = document.getElementById('target-n'); return { cls: c.className, pips: c.querySelectorAll('svg.die circle').length, text: c.textContent.trim(), aria: document.getElementById('target').getAttribute('aria-label') }; })()")
    check('dice' in chip['cls'] and chip['pips'] == 4 and chip['text'] == '', f'dice face: the chip shows a die with 4 pips and no numeral ({chip})')
    check(chip['aria'] == 'Land on four', f'dice face: said as the number ({chip["aria"]})')
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{OUT}/dice-fly.png')
    s = land(pg, True, 'dice-right')
    check(s['results'][-1]['right'] and s['results'][-1]['rule'] == 'dice' and s['results'][-1]['spot'] == 4, f'dice 4: landing on 4 is right ({s["results"][-1]})')
    pg.evaluate("__test.aimRule('dice', 6)")
    s = land(pg, False)
    r = s['results'][-1]
    check(not r['right'] and r['goal'] == 6 and s['goal'] == 6, f'dice 6: a miss shows 6 ({r})')
    pg.context.close()

    # ---------- Even and odd: the chip, right, wrong, the spot shown and the words ----------
    pg = page(br)
    begin(pg, 3)
    start(pg)
    pg.evaluate("__test.aimRule('parity', 'even')")
    chip = pg.evaluate("(() => { const c = document.getElementById('target-n'); return { cls: c.className, text: c.textContent, bg: getComputedStyle(c).backgroundColor, aria: document.getElementById('target').getAttribute('aria-label') }; })()")
    check(chip['text'] == 'even' and 'even' in chip['cls'] and chip['bg'] == 'rgb(127, 216, 255)', f'even: the chip says "even" on blue ({chip})')
    check(chip['aria'] == 'Land on an even number', f'even: said "an even number" ({chip["aria"]})')
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{OUT}/even-fly.png')
    s = land(pg, True, 'even-right')
    r = s['results'][-1]
    check(r['right'] and r['rule'] == 'parity' and r['parity'] == 'even' and r['spot'] % 2 == 0, f'even: landing on an even number is right ({r})')
    pg.evaluate("__test.aimRule('parity', 'odd')")
    chip = pg.evaluate("getComputedStyle(document.getElementById('target-n')).backgroundColor")
    check(chip == 'rgb(255, 201, 60)', f'odd: the chip is yellow ({chip})')
    pg.wait_for_timeout(200)
    pg.evaluate('__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"')
    pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{OUT}/odd-wrong.png')
    s = state(pg)
    r = s['results'][-1]
    bubble = pg.evaluate("(() => { const b = document.getElementById('bubble'); return { text: b.textContent, hidden: b.hidden, cls: [...b.querySelectorAll('b')].map((x) => x.className) }; })()")
    check(not r['right'] and r['spot'] % 2 == 0 and r['goal'] % 2 == 1 and abs(r['goal'] - r['spot']) == 1,
          f'odd: an even landing is wrong, and the odd number next to it is shown ({r})')
    check(not bubble['hidden'] and bubble['text'] == f"That's {r['spot']}. {r['goal']} is odd!" and bubble['cls'] == ['no-n', 'odd'],
          f'odd: the bubble says so, the odd number in yellow ({bubble})')
    pg.context.close()

    # ---------- A whole round at level 3: every landing right, reported as level 3 ----------
    pg = page(br)
    begin(pg, 3)
    start(pg)
    for i in range(8):
        land(pg, True)
    pg.wait_for_function('__test.state().phase === "end"')
    s = state(pg)
    rules = sorted(r['rule'] for r in s['results'])
    check(s['right'] == 8 and rules == ['dice'] * 3 + ['parity'] * 5, f'level 3: 8 of 8 right, 5 even-or-odd and 3 dice faces ({rules})')
    rep = pg.evaluate('__test.reported()')
    check(len(rep) == 1 and rep[0]['level'] == 3 and rep[0]['stars'] == 3, f'the round is reported as level 3, 3 stars ({rep})')
    pg.context.close()

    # ---------- The level from the address (GC5) ----------
    pg = page(br, url=BASE + '&level=6')
    s = state(pg)
    check(s['level'] == 6 and s['labels'] == [str(i) for i in range(0, 11, 2)], f'?level=6: level 6, every other number ({s["labels"]})')
    pg.context.close()
    before = len(infos)
    pg = page(br, url=BASE + '&level=17')
    s = state(pg)
    note = [t for t in infos[before:] if 'level' in t]
    check(s['level'] == 1 and note and '"17"' in note[0], f'?level=17, past the map\'s 16: level 1, with a note ({note})')
    pg.context.close()

    # ---------- The new chips: no sideways scrolling, phone both ways round and PC, light and dark ----------
    for w, h, mob in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
        for scheme in ('light', 'dark'):
            pg = page(br, w, h, mob, scheme=scheme)
            begin(pg, 3)
            start(pg)
            widths = []
            for rule, x in [('parity', 'even'), ('parity', 'odd'), ('dice', 6)]:
                pg.evaluate(f"__test.aimRule('{rule}', {x!r})")
                pg.wait_for_timeout(150)
                widths.append(pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]'))
            check(all(a <= b for a, b in widths), f'{w}x{h} {scheme}: no sideways scrolling with the even, odd and dice chips ({widths[0]})')
            if scheme == 'dark':
                pg.screenshot(path=f'{OUT}/chip-{w}x{h}.png')
            pg.context.close()

    br.close()

check(not errors, 'no page errors, console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
check(not outside, 'nothing fetched from outside the local server (fonts aside)' + ('' if not outside else ': ' + ' | '.join(sorted(set(outside))[:5])))
httpd.shutdown()
print(f'\nScreenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
