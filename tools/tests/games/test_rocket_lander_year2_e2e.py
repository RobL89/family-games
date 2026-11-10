"""Rocket Lander's Year 2 levels on the higher track, in a browser (step 2c-3b). Version 1.0.

The step's own test (D-086: during a step, the new feature's own test and the fast checks). At a
phone held upright (390x844) and a PC (1280x800):
  - the higher track (?track=year2) on a new device starts at Moon 1, and Moon, Red Dust and Candy
    each hold 8 levels (D-091);
  - every Year 2 level, with a made-up question set by the test hook so its picture and words are
    known: its face (tens rods and ones, words, <, > or =, a count, odd or even, a shaded shape, a
    fraction of dots) or its sum (a missing number in a box, three numbers, a table) fits the screen with
    no sideways scroll and words for screen readers; its line holds the answer (a stretch of 10 marks;
    a table's line in its steps; tens bonds in tens; a shape's fraction line written in fractions); a
    right landing counts, and a wrong one is wrong, its bubble saying so in its own words, with nothing
    showing under the lit-up number (RL-3), fractions included;
  - the timed level falls in 6 s (the notes), the others in 15 s at the default speed (D-097);
  - adding and taking away two 2-digit numbers play in halves: no new ten (or exchanging) for 4
    landings, then with (D-094);
  - the Moon's and Candy's challenge rounds play each of their 7 levels and one more, the fast facts
    in 6 s and the shapes on their fraction lines;
  - a map kept on the stand-in levels (format 4, edition 'stand-in') starts Year 2 afresh with its rocks
    and ships; a format 3 entry plays the lower track with its rocks and ships (no stand-in track left);
  - nothing is fetched from outside, and no page errors.

Stand-ins: headless Chromium (Playwright), system fonts for any not shipped.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_year2_e2e.py [folder for screenshots]
Screenshots (made-up play only) go to a temporary folder unless one is given, and are never committed.
"""
import functools, http.server, json, os, re, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
KEY = 'family-games:rocket-lander:progress'
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-y2-')
os.makedirs(OUT, exist_ok=True)
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
PLAIN = f'{LOCAL}games/rocket-lander/index.html'
BASE = PLAIN + '?track=year2'

# A made-up question for each level, set with the test hook so the picture and the words are known:
# (hook, question, chip class wanted, words the bubble must hold after a miss, the line wanted or None)
ASKS = {
    'moon-1': ({'ask': 'place', 'n': 34, 'value': 34}, 'face-place', '3 tens and 4 ones make 34'),
    'moon-2': ({'ask': 'words', 'n': 47, 'value': 47}, 'face-words', 'forty-seven is 47'),
    'moon-3': ({'ask': 'sign', 'rel': 'more', 'n': 47}, 'face-sign', '47 < '),
    'moon-4': ({'ask': 'seq', 'step': 3, 'dir': 'forward', 'terms': [9, 12, 15], 'value': 18}, 'face-seq', '9, 12, 15, 18'),
    'moon-5': ({'ask': 'seq', 'step': 10, 'dir': 'backward', 'terms': [83, 73, 63], 'value': 53}, 'face-seq', '83, 73, 63, 53'),
    'candy-5': ({'ask': 'parity', 'rel': 'odd'}, 'word', 'is odd'),
    'candy-6': ({'ask': 'frac-shape', 'num': 1, 'den': 3, 'look': 1, 'parts': 3, 'value': 1}, 'face-shape', 'is shaded'),
    'candy-7': ({'ask': 'frac-of', 'num': 3, 'den': 4, 'total': 12, 'value': 9}, 'face-fracof', 'of 12 is 9'),
}
SUMS = {
    'moon-6': ({'a': 13, 'op': '+', 'b': 5}, '13 + 5 = 18', None),
    'moon-7': ({'a': 30, 'op': '+', 'b': 70, 'result': 100, 'missing': 'b'}, '30 + 70 = 100', (0, 100, 10)),
    'dust-1': ({'a': 34, 'op': '+', 'b': 5}, '34 + 5 = 39', None),
    'dust-2': ({'a': 34, 'op': '+', 'b': 20}, '34 + 20 = 54', None),
    'dust-3': ({'a': 47, 'op': '−', 'b': 20}, '47 − 20 = 27', None),
    'dust-4': ({'a': 4, 'op': '+', 'b': 7, 'op2': '+', 'c': 6}, '4 + 7 + 6 = 17', None),
    'dust-5': ({'a': 34, 'op': '+', 'b': 28}, '34 + 28 = 62', None),
    'dust-6': ({'a': 52, 'op': '−', 'b': 27}, '52 − 27 = 25', None),
    'dust-7': ({'a': 35, 'op': '+', 'b': 25, 'result': 60, 'missing': 'a'}, '35 + 25 = 60', None),
    'candy-1': ({'a': 10, 'op': '×', 'b': 7}, '10 × 7 = 70', (0, 120, 10)),
    'candy-2': ({'a': 6, 'op': '×', 'b': 2}, '6 × 2 = 12', (0, 24, 2)),
    'candy-3': ({'a': 5, 'op': '×', 'b': 9}, '5 × 9 = 45', (0, 60, 5)),
    'candy-4': ({'a': 35, 'op': '÷', 'b': 5}, '35 ÷ 5 = 7', (0, 12, 1)),
}
CHIP = '''(() => { const t = document.getElementById('target'), c = document.getElementById('target-n'), r = t.getBoundingClientRect();
  return { face: t.classList.contains('is-face'), cls: c.className, left: r.left, right: r.right, h: r.height, text: c.innerText.replace(/\\s+/g, ' ').trim(),
    aria: t.getAttribute('aria-label'), sideways: document.documentElement.scrollWidth > innerWidth }; })()'''


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


def start(pg, lid, fast=True):
    """Send the rocket to a level and start its round (the Play bubble)."""
    pg.evaluate(f'__test.begin({{ level: "{lid}" }})')
    pg.wait_for_function('(() => { const s = __test.state(); return s.screen === "map" && s.map && !s.map.busy; })()', timeout=15000)
    pg.evaluate('__test.speed(6)' if fast else '__test.speed(1)')
    pg.evaluate('document.querySelector(".play-bubble").click()')
    pg.wait_for_function('__test.state().phase === "fly"', timeout=20000)


def next_fly(pg, i):
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return (s.phase === "fly" && s.idx > {i}) || s.phase === "end"; }})()', timeout=30000)


def home(pg):
    pg.goto(BASE)
    ready(pg)


def miss(pg, hook, arg):
    """A wrong landing at real speed (so its 2 s bubble is read before it goes), then the lit-up number."""
    pg.evaluate('__test.speed(1)')
    pg.evaluate(f'__test.{hook}({json.dumps(arg)})')
    spot = pg.evaluate('__test.wrong()')
    pg.wait_for_selector('#bubble:not([hidden])', timeout=20000)
    bub = re.sub(r'\s+', ' ', pg.inner_text('#bubble')).strip()
    pg.wait_for_timeout(600)
    ov = pg.evaluate('__test.overlaps()')
    pg.evaluate('__test.speed(6)')
    return spot, bub, ov


with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in ((390, 844, True, 'phone'), (1280, 800, False, 'pc')):
        ctx, pg, asked, errors = page(br, w, h, mobile)
        pg.goto(BASE)
        ready(pg)
        s = st(pg)
        check(s['track'] == 'year2' and s['levelId'] == 'moon-1' and s['progress']['open'] == 'moon-1',
              f'{tag}: the higher track on a new device starts at Moon 1: {s["track"]}, {s["levelId"]}')
        sizes = {}
        for sysid in ('moon', 'dust', 'candy'):
            pg.evaluate(f'__test.begin({{ level: "{sysid}-1" }})')
            pg.wait_for_function('(() => { const s = __test.state(); return s.screen === "map" && s.map && !s.map.busy; })()', timeout=15000)
            sizes[sysid] = len(st(pg)['map']['markers'])
        check(sizes == {'moon': 8, 'dust': 8, 'candy': 8}, f'{tag}: Moon, Red Dust and Candy hold 8 levels each, the 8th a challenge: {sizes}')
        home(pg)

        # Falls (D-096, D-097, the notes' 6 s): 15 s for a picture or a sum at the default speed 3; the timed level 6 s
        falls = {}
        for lid in ('moon-1', 'moon-6', 'dust-1'):
            start(pg, lid)
            falls[lid] = st(pg)['fall']
            home(pg)
        check(falls == {'moon-1': 15, 'moon-6': 6, 'dust-1': 15}, f'{tag}: a picture or a sum falls in 15 s; the fast facts in 6 s: {falls}')

        # Year 2's questions, each with a made-up question set by the hook
        for lid, (T, cls, words) in ASKS.items():
            start(pg, lid)
            pg.evaluate(f'__test.aimAsk({json.dumps(T)})')
            pg.wait_for_timeout(700)  # the target's pop (0.55 s) over, so it's measured at rest
            info, s = pg.evaluate(CHIP), st(pg)
            pg.screenshot(path=os.path.join(OUT, f'{tag}-{lid}.png'))
            ln = s['line']
            if lid == 'candy-6':
                on = ln['from'] == 0 and ln['to'] == 3 and s['labelLook'] == 'frac3' and s['labels'] == ['0', '1/3', '2/3', '1']
            elif T.get('value') is not None:
                on = ln['to'] - ln['from'] == 10 and ln['step'] == 1 and ln['from'] <= T['value'] <= ln['to']
            elif T['ask'] == 'sign':
                on = ln['to'] - ln['from'] == 10 and T['n'] - ln['from'] >= 3 and ln['to'] - T['n'] >= 3
            else:
                on = ln['to'] - ln['from'] == 10 and 1 <= ln['from'] and ln['to'] <= 100
            check(cls in info['cls'] and (info['face'] == (cls != 'word')) and on,
                  f'{tag} {lid}: the {T["ask"]} {"face" if cls != "word" else "word chip"} on its line {ln["from"]} to {ln["to"]}, look {s["labelLook"]}: {info["cls"]}, {info["text"]!r}')
            check(info['left'] >= 0 and info['right'] <= w and not info['sideways'] and 20 <= info['h'] <= h * 0.2 and len(info['aria'] or '') > 8,
                  f'{tag} {lid}: it fits the screen, no sideways scroll, {info["h"]:.0f} px high; screen readers hear {info["aria"]!r}')
            pg.evaluate('__test.right()')
            pg.wait_for_function('__test.state().right === 1', timeout=20000)
            check(st(pg)['results'][0]['right'], f'{tag} {lid}: a right landing counts')
            next_fly(pg, 0)
            spot, bub, ov = miss(pg, 'aimAsk', T)
            r = st(pg)['results'][1]
            check(not r['right'] and words in bub and ov == [], f'{tag} {lid}: a wrong landing ({spot}) is wrong, the bubble says {bub!r}, nothing under the lit-up number: {ov}')
            if lid == 'candy-6':
                next_fly(pg, 1)
                pg.evaluate('__test.aimAsk({ "ask": "frac-shape", "num": 2, "den": 4, "look": 0, "parts": 4, "value": 2 })')
                pg.wait_for_timeout(250)
                s = st(pg)
                check(s['labelLook'] == 'frac4' and s['labels'] == ['0', '1/4', '1/2', '3/4', '1'],
                      f'{tag} candy-6: a shape in quarters lands on a line of quarters, 2/4 written 1/2: {s["labels"]}')
                pg.evaluate('__test.right()')
                pg.wait_for_function('__test.state().results.length === 3', timeout=20000)
                check(st(pg)['results'][2]['right'] and st(pg)['results'][2]['spot'] == 2, f'{tag} candy-6: two quarters shaded: landing on 1/2 is right')
            home(pg)

        # Year 2's sums
        for lid, (f, words, want) in SUMS.items():
            start(pg, lid)
            pg.evaluate(f'__test.aimFact({json.dumps(f)})')
            pg.wait_for_timeout(700)  # the target's pop (0.55 s) over, so it's measured at rest
            info, s = pg.evaluate(CHIP), st(pg)
            pg.screenshot(path=os.path.join(OUT, f'{tag}-{lid}.png'))
            ln, ans = s['line'], s['target']
            on = (ln['from'], ln['to'], ln['step']) == want if want else (ln['to'] - ln['from'] == 10 and ln['step'] == 1)
            check('sum' in info['cls'] and ln['from'] <= ans <= ln['to'] and on and (('?' in info['text']) == ('missing' in f)),
                  f'{tag} {lid}: {s["sum"]} on its line {ln["from"]} to {ln["to"]} in {ln["step"]}s, the answer {ans} on it; chip {info["text"]!r}')
            check(info['left'] >= 0 and info['right'] <= w and not info['sideways'] and 20 <= info['h'] <= h * 0.2 and len(info['aria'] or '') > 8,
                  f'{tag} {lid}: it fits the screen, no sideways scroll, {info["h"]:.0f} px high; screen readers hear {info["aria"]!r}')
            pg.evaluate('__test.right()')
            pg.wait_for_function('__test.state().right === 1', timeout=20000)
            check(st(pg)['results'][0]['right'], f'{tag} {lid}: a right landing counts')
            next_fly(pg, 0)
            spot, bub, ov = miss(pg, 'aimFact', f)
            r = st(pg)['results'][1]
            check(not r['right'] and words in bub and ov == [], f'{tag} {lid}: a wrong landing ({spot}) is wrong, the bubble says {bub!r}, nothing under the lit-up number: {ov}')
            home(pg)

        # Halves (D-094): no new ten (no exchanging) for 4 landings, then a new ten (exchanging)
        for lid, op in (('dust-5', '+'), ('dust-6', '−')):
            start(pg, lid)
            sums = []
            for i in range(8):
                if i:
                    next_fly(pg, i - 1)
                sums.append(st(pg)['sum'])
                pg.evaluate('__test.right()')
                pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
            pairs = [[int(x) for x in t.split(f' {op} ')] for t in sums]
            flags = [(a % 10 + b % 10 >= 10) if op == '+' else (a % 10 < b % 10) for a, b in pairs]
            check(flags == [False] * 4 + [True] * 4 and all(10 <= a <= 99 and 10 <= b <= 99 for a, b in pairs),
                  f'{tag} {lid}: two 2-digit numbers, 4 landings without {"a new ten" if op == "+" else "exchanging"}, then 4 with: {sums}')
            home(pg)

        # Challenge rounds (D-091): the Moon's (the fast facts in 6 s) and Candy's (shapes on fraction lines)
        for lid in ('moon-8', 'candy-8'):
            start(pg, lid)
            subs, looks = [], []
            for i in range(8):
                if i:
                    next_fly(pg, i - 1)
                s = st(pg)
                subs.append(s['sub'])
                looks.append((s['sub'], s['labelLook'], s['fall'], s['line']['to'] - s['line']['from'], s['line']['step']))
                pg.evaluate('__test.right()')
                pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
            check(sorted(set(subs)) == list(range(7)) and len(subs) == 8, f"{tag} {lid}: each of the system's 7 levels, and one more: {subs}")
            if lid == 'moon-8':
                ok = all((fall == 6) == (j == 5) for j, _, fall, _, _ in looks) and all(lk == 'plain' for _, lk, _, _, _ in looks)
                ok = ok and all((sp, stp) == (100, 10) for j, _, _, sp, stp in looks if j == 6) and all(sp == 10 for j, _, _, sp, _ in looks if j < 6)
                check(ok, f'{tag} moon-8: each landing as its own level: the fast facts in 6 s, the rest 15 s; tens bonds on 0 to 100 in tens: {looks}')
            else:
                ok = all((lk in ('frac3', 'frac4')) == (j == 5) for j, lk, _, _, _ in looks) and all(lk == 'plain' for j, lk, _, _, _ in looks if j != 5)
                ok = ok and all(stp == 10 and sp == 120 for j, _, _, sp, stp in looks if j == 0) and all(stp == 2 for j, _, _, _, stp in looks if j == 1)
                check(ok, f'{tag} candy-8: the shapes on a fraction line, the tables on their own lines, the rest written plainly: {looks}')
            pg.wait_for_function('__test.state().phase === "end"', timeout=30000)
            s = st(pg)
            nxt = 'dust-1' if lid == 'moon-8' else 'candy-8'
            check(s['right'] == 8 and s['progress']['levels'].get(lid, {}).get('stars') == 3,
                  f'{tag} {lid}: 8 right, 3 stars: {s["progress"]["levels"].get(lid)}, open {s["progress"]["open"]}')
            home(pg)

        # Progress kept on the stand-in levels (D-100): Year 2 starts afresh, the rocks and ships kept
        stand = {'v': 4, 'track': 'year2', 'edition': 'stand-in', 'at': 'dust-2', 'open': 'dust-3', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}},
                 'rocks': 50, 'landings': 60, 'ship': 'teapot', 'ships': ['classic', 'teapot'], 'maps': {}}
        pg.evaluate(f'localStorage.setItem("{KEY}", {json.dumps(json.dumps(stand))})')
        pg.goto(PLAIN)
        ready(pg)
        s = st(pg)
        check(s['track'] == 'year2' and s['progress']['open'] == 'moon-1' and s['progress']['levels'] == {} and s['progress']['rocks'] == 50
              and s['progress']['ship'] == 'teapot' and s['levelId'] == 'moon-1',
              f'{tag}: a map kept on the stand-ins (edition stand-in): Year 2 from Moon 1, the 50 rocks and the Teapot kept: {s["progress"]["open"]}, {s["progress"]["rocks"]}')
        old = {'v': 3, 'at': 'dust-2', 'open': 'dust-2', 'levels': {'moon-1': {'stars': 3, 'rocks': 8}}, 'rocks': 50, 'landings': 60, 'ship': 'classic', 'ships': ['classic']}
        pg.evaluate(f'localStorage.setItem("{KEY}", {json.dumps(json.dumps(old))})')
        pg.goto(PLAIN)
        ready(pg)
        s = st(pg)
        check(s['track'] == 'reception' and s['progress']['open'] == 'moon-1' and s['progress']['rocks'] == 50,
              f'{tag}: a format 3 entry (no stand-in track left) plays the lower track from the start, its 50 rocks kept: {s["track"]}, {s["progress"]["open"]}')

        others = [u for u in asked if not u.startswith(LOCAL) and not u.startswith('data:')]
        check(not others, f'{tag}: nothing fetched from outside' + (f': {others[:3]}' if others else ''))
        check(not errors, f'{tag}: no page errors' + (f': {errors[:3]}' if errors else ''))
        ctx.close()
    br.close()

print(f'\nScreenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
