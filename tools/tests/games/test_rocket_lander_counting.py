"""Rocket Lander's counting pictures, fewer and bigger (trial feedback item 1: D-123, D-124, D-125).
Version 1.0.

The step's own test (D-086). Two parts.

1. The core, by Node (pure files only): what each cut level can ask, against D-123's numbers worked out
   here in Python; and what its picture draws:
   - How many dots? 1 to 6 on a 0 to 6 line, the dots in rows of 3 (6 is 3 and 3, 4 is 3 and 1);
   - More, fewer or the same: at most 6 dots, in rows of 3, on its 0 to 10 line;
   - Share it out (Reception): up to 6 sweets between 2 plates;
   - Groups of: the words kept, then one box per group with its size written in it, and no dots;
   - Sharing (Year 1): between 2 or 5, up to 10 sweets;
   - Half of a number: up to 12; Fractions of numbers: totals up to 12;
   - Doubles and halves to 20: numbers only (the level's row says no pictures), while Reception's
     Doubles keeps its dots.
2. In a browser, on the game on its own in a page the size of P-020's wrapper frame (the screen less its
   56 px bar): the largest case of each counting picture, set with the game's test hooks, and its
   smallest dot (or sweet, block, counter, box) in px, against floors decided before the build (Claude's
   judgement, 15 Nov, from today's sizes in `measure_rocket_faces.py` 1.0): on the upright phone and the
   PC, How many dots? 36, More or fewer 30, Quick look 28, Make 5 and Make 10 26, Reception's pictured
   sums 26, Doubles 20, Share it out 20, Half of 20, Fractions of numbers 18, Groups of a box 30 tall,
   Tens and ones' ones 12, the place-value chart 16; sideways, 12 for every one and 24 for How many
   dots?. And the picture fits: no sideways scroll, the box inside the screen, and the rocket still
   falls at least 250 px upright and 60 px sideways. The fall is measured under the box as it is drawn: a
   round's first landing starts the rocket below its question's box (the engine measured the fall before
   drawing the question, so a taller picture covered the rocket's start: round.js 2.10), and a question
   set by the hook measures it again.

Stand-ins: headless Chromium (Playwright), system fonts for any not shipped; the wrapper's frame stood in
for by the page's size.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_counting.py [folder for screenshots]
Screenshots (made-up play only) go to a temporary folder unless one is given, and are never committed.
"""
import functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'rocket-lander')
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-count-')
os.makedirs(OUT, exist_ok=True)
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


# ---------- 1. The core ----------
JS = r"""
const g = process.argv[1];
const MP = await import(g + '/map.js');
const AK = await import(g + '/asks.js');
const FC = await import(g + '/faces.js');
const lv = (track, plan) => MP.TRACKS[track].systems.flatMap((s) => s.levels).find((l) => l.plan === plan);
const rows = {};
for (const [t, p] of [['reception', 'R03'], ['reception', 'R05'], ['reception', 'R11'], ['reception', 'R16'], ['reception', 'Y1-12'], ['reception', 'Y1-13'],
  ['reception', 'Y1-15'], ['reception', 'X-doubles20'], ['year2', 'Y2-20']]) rows[p] = lv(t, p).row;
const asks = Object.fromEntries(Object.entries(rows).map(([p, r]) => [p, AK.choices(r)]));
const cxs = (h) => [...h.matchAll(/class="d-on" cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
const count = (h, c) => (h.match(new RegExp(`class="${c}"`, 'g')) || []).length;
const txt = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const out = {
  rows,
  asks: Object.fromEntries(Object.entries(asks).map(([p, ts]) => [p, ts.map((T) => [T.ask, T.n ?? T.total ?? T.groups, T.groups ?? T.den ?? T.rel ?? null, T.size ?? T.num ?? null, T.value ?? null])])),
  dots: [1, 3, 4, 6].map((n) => { const h = FC.faceChip({ ask: 'dots', n, value: n }).html; return [n, cxs(h), /class="fd[^"]* r(\d)/.exec(h)[1]]; }),
  compare: ['more', 'fewer', 'same'].map((rel) => cxs(FC.faceChip({ ask: 'compare', rel, n: 6 }).html)),
  groups: [[3, 5], [5, 10], [1, 2]].map(([gr, size]) => { const c = FC.faceChip({ ask: 'groups', groups: gr, size, value: gr * size }, rows['Y1-12']);
    return [c.cls, count(c.html, 'd-on'), count(c.html, 'gb'), [...c.html.matchAll(/class="gb">(\d+)</g)].map((m) => Number(m[1])), txt(c.html)]; }),
  doubles20: [{ ask: 'double', n: 7, value: 14 }, { ask: 'half', n: 18, value: 9 }].map((T) => { const c = FC.faceChip(T, rows['X-doubles20']); return [count(c.html, 'd-on'), txt(c.html)]; }),
  doublesR: count(FC.faceChip({ ask: 'double', n: 3, value: 6 }, rows['R11']).html, 'd-on'),
};
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + GAME], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    check(False, 'the core loads in Node')
    sys.exit(1)
core = json.loads(r.stdout)
rows, asks = core['rows'], core['asks']

# D-123's numbers, worked out here
check([rows['R03'][k] for k in ('min', 'max', 'from', 'to')] == [1, 6, 0, 6], f"How many dots? 1 to 6 on a 0 to 6 line (D-123, D-125): {rows['R03']}")
check(sorted(a[1] for a in asks['R03']) == [1, 2, 3, 4, 5, 6], f"How many dots? asks 1 to 6: {[a[1] for a in asks['R03']]}")
check(max(a[1] for a in asks['R05']) == 6 and [rows['R05'][k] for k in ('from', 'to')] == [0, 10],
      f"More, fewer or the same: at most 6 dots, on 0 to 10: {max(a[1] for a in asks['R05'])}, {rows['R05']['from']} to {rows['R05']['to']}")
# 1 to 6 dots (at least one to look at, at most 6), and a number on the 0 to 10 line that fits: more than 1 to 6
# (7 to 10 are on the line), fewer than 1 to 6 (0 is on the line), the same as 1 to 6: 6 + 6 + 6 = 18
want05 = sorted([('more', n) for n in range(1, 7)] + [('fewer', n) for n in range(1, 7)] + [('same', n) for n in range(1, 7)])
check(sorted((a[2], a[1]) for a in asks['R05']) == want05, f"More, fewer, the same: 1 to 6 dots each ({len(want05)}): {len(asks['R05'])}")
check(sorted((a[1], a[4]) for a in asks['R16']) == [(2, 1), (4, 2), (6, 3)], f"Share it out: 2, 4 or 6 sweets between 2: {asks['R16']}")
want13 = sorted([(t, 2, t // 2) for t in range(2, 11, 2)] + [(t, 5, t // 5) for t in (5, 10)])
check(sorted((a[1], a[2], a[4]) for a in asks['Y1-13']) == want13, f"Sharing: 2 to 10 between 2, 5 or 10 between 5 ({len(want13)}): {asks['Y1-13']}")
check(sorted(a[1] for a in asks['Y1-15']) == [2, 4, 6, 8, 10, 12], f"Half of 2 to 12: {[a[1] for a in asks['Y1-15']]}")
want20 = sorted([(t, 2, 1) for t in range(2, 13, 2)] + [(t, 3, 1) for t in (3, 6, 9, 12)] + [(t, 4, 1) for t in (4, 8, 12)] + [(t, 4, 3) for t in (4, 8, 12)])
check(sorted((a[1], a[2], a[3]) for a in asks['Y2-20']) == want20, f"Fractions of numbers to 12 ({len(want20)}): {len(asks['Y2-20'])}")
check(sorted((a[1], a[3]) for a in asks['Y1-12']) == sorted((g, s) for s in (2, 5, 10) for g in range(1, 6)), f"Groups of 2, 5 and 10, 1 to 5 groups, kept: {len(asks['Y1-12'])}")
check(rows['X-doubles20'].get('pictures') is False and rows['R11'].get('pictures') is not False, 'Doubles and halves to 20 says no pictures; Reception\'s Doubles does not')

# Rows of 3: dot k (0 first) sits in column k % 3 and row k // 3, 10 units a cell
def rows3(n):
    return [[(k % 3) * 10 + 5, (k // 3) * 10 + 5] for k in range(n)]


for n, pts, rcls in core['dots']:
    check(pts == rows3(n) and rcls == ('1' if n <= 3 else '2'), f"How many dots? {n} in rows of 3 ({'one row' if n <= 3 else 'two rows'}): {pts}, r{rcls}")
check(all(p == rows3(6) for p in core['compare']), f"More, fewer or the same: 6 dots in rows of 3: {core['compare'][0]}")
for (gr, size), (cls, dots, boxes, nums, words) in zip([[3, 5], [5, 10], [1, 2]], core['groups']):
    check('face-groups' in cls and dots == 0 and boxes == gr and nums == [size] * gr and ('groups of' if gr > 1 else 'group of') in words,
          f"{gr} group(s) of {size}: the words, {gr} boxes each marked {size}, no dots: {[cls, dots, boxes, nums, words]}")
check([d for d, _ in core['doubles20']] == [0, 0] and 'double 7' in core['doubles20'][0][1] and 'half of 18' in core['doubles20'][1][1],
      f"Doubles and halves to 20: numbers only: {core['doubles20']}")
check(core['doublesR'] == 6, f"Reception's Doubles keeps its dots: double 3 draws 6: {core['doublesR']}")

# ---------- 2. In a browser ----------
BAR = 56
SIZES = [('phone', 390, 844 - BAR, True), ('pc', 1366, 768 - BAR, False), ('sideways', 844, 390 - BAR, True)]
# (name, track, level along the map, hook, args, the mark measured, floor upright and on the PC)
CASES = [
    ('How many dots? 6', 'reception', 3, 'aimAsk', [{'ask': 'dots', 'n': 6, 'value': 6}], 'dot', 36),
    ('Quick look 5', 'reception', 5, 'aimAsk', [{'ask': 'flash', 'n': 5, 'value': 5, 'look': 0, 'ms': 600000}], 'dot', 28),
    ('More than 6', 'reception', 6, 'aimAsk', [{'rule': 'range', 'ask': 'compare', 'rel': 'fewer', 'n': 6}], 'dot', 30),
    ('Make 5', 'reception', 10, 'aimAsk', [{'ask': 'bond', 'whole': 5, 'part': 3, 'value': 2}], 'dot', 26),
    ('5 + 0', 'reception', 11, 'aimSum', [5, '+', 0], 'dot', 26),
    ('5 − 2', 'reception', 12, 'aimSum', [5, '−', 2], 'dot', 26),
    ('Double 5', 'reception', 13, 'aimAsk', [{'ask': 'double', 'n': 5, 'value': 10}], 'dot', 20),
    ('Make 10', 'reception', 15, 'aimAsk', [{'ask': 'bond', 'whole': 10, 'part': 6, 'value': 4}], 'dot', 26),
    ('Share 6', 'reception', 22, 'aimAsk', [{'ask': 'share', 'total': 6, 'groups': 2, 'value': 3}], 'sweet', 20),
    ('5 groups of 10', 'reception', 41, 'aimAsk', [{'ask': 'groups', 'groups': 5, 'size': 10, 'value': 50}], 'box', 30),
    ('Share 10 by 5', 'reception', 42, 'aimAsk', [{'ask': 'share', 'total': 10, 'groups': 5, 'value': 2}], 'sweet', 20),
    ('Half of 12', 'reception', 45, 'aimAsk', [{'ask': 'frac-of', 'num': 1, 'den': 2, 'total': 12, 'value': 6}], 'dot', 20),
    ('Tens and ones 99', 'year2', 1, 'aimAsk', [{'ask': 'place', 'n': 99, 'value': 99}], 'one', 12),
    ('Quarter of 12', 'year2', 23, 'aimAsk', [{'ask': 'frac-of', 'num': 1, 'den': 4, 'total': 12, 'value': 3}], 'dot', 18),
    ('999 chart', 'year2', 26, 'aimAsk', [{'ask': 'place', 'n': 999, 'value': 999}], 'counter', 16),
]
SIDE = {'How many dots? 6': 24}
MARK = {'dot': 'circle.d-on', 'sweet': 'circle.sw', 'box': '.gb', 'one': 'rect.pv-one', 'counter': 'circle.pc-h, circle.pc-t, circle.pc-o'}
MEASURE = """(sel) => { const c = document.getElementById('target-n'), r = c.getBoundingClientRect(), t = __test.state();
  const ms = [...c.querySelectorAll(sel)].map((m) => { const b = m.getBoundingClientRect(); return Math.min(b.width, b.height); });
  return { n: ms.length, min: ms.length ? Math.round(Math.min(...ms) * 10) / 10 : 0, left: r.left, right: r.right, top: r.top, bottom: r.bottom,
    scroll: document.documentElement.scrollWidth > innerWidth + 1, fall: Math.round(t.touchY - t.startY), vw: innerWidth, vh: innerHeight }; }"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
PLAIN = f'{LOCAL}games/rocket-lander/index.html'


def into_level(pg, track, level):
    pg.goto(f'{PLAIN}?track={track}&level={level}')
    pg.wait_for_timeout(1200)
    b = pg.locator('#play').bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)
    for _ in range(40):
        if pg.evaluate("window.__test && __test.state().screen === 'round' && __test.state().phase === 'fly'"):
            return True
        pg.wait_for_timeout(250)
    return False


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for size, w, h, mobile in SIZES:
        ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile, device_scale_factor=1)
        asked, errors = [], []
        ctx.route('**/*', lambda rt: (asked.append(rt.request.url), rt.continue_() if rt.request.url.startswith(LOCAL) or rt.request.url.startswith('data:') else rt.abort()))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        # A round's first landing, as played (no hook): the rocket starts below the question's box
        into_level(pg, 'reception', 3)
        pg.wait_for_timeout(700)  # the box has popped in (.55 s)
        pg.evaluate('__test.freeze(true)')
        st = pg.evaluate("() => { const t = __test.state(), b = document.getElementById('target').getBoundingClientRect(); return { start: Math.round(t.startY), box: Math.round(b.bottom), n: t.target, touch: Math.round(t.touchY) }; }")
        check(st['start'] > st['box'], f"{size}: How many dots? ({st['n']}), first landing: the rocket starts at {st['start']} px, below the box's foot at {st['box']} px")
        pg.evaluate('__test.freeze(false)')
        # ... and on each landing after it, whatever the last one's box was: 1 dot (a short box), then landings
        # played right one after another, each next question drawn by the game
        pg.evaluate("__test.aimAsk({ ask: 'dots', n: 1, value: 1 })")
        late = []
        for k in range(5):
            idx = pg.evaluate('__test.state().idx')
            pg.evaluate('__test.speed(8); __test.right()')
            for _ in range(60):
                s2 = pg.evaluate('__test.state()')
                if s2['idx'] > idx and s2['phase'] == 'fly':
                    break
                pg.wait_for_timeout(100)
            pg.evaluate('__test.speed(1)')
            pg.wait_for_timeout(700)
            pg.evaluate('__test.freeze(true)')
            late.append(pg.evaluate("() => { const t = __test.state(), b = document.getElementById('target').getBoundingClientRect(); return [t.target, Math.round(t.startY), Math.round(b.bottom), Math.round(t.touchY)]; }"))
            pg.evaluate('__test.freeze(false)')
        # each start is the box's foot and the same gap, or, where that leaves too short a fall, the lowest start the
        # engine allows (one rocket above the ground: measureFall), the same for every such landing
        pts = [(st0, box, tch) for _, st0, box, tch in late] + [(st['start'], st['box'], st['touch'])]
        gaps = [st0 - box for st0, box, _ in pts]
        lowest = max(st0 for st0, _, _ in pts)
        check(all(g > 0 for g in gaps) and all(abs(g - max(gaps)) <= 2 or abs(st0 - lowest) <= 1 for g, (st0, _, _) in zip(gaps, pts)),
              f"{size}: How many dots?, the first and next 5 landings: the rocket starts the same way below each landing's own box (gaps {gaps} px; [dots, start, box's foot] {late})")
        for name, track, level, hook, args, mark, floor in CASES:
            if not into_level(pg, track, level):
                check(False, f'{size}: {name}: a round starts')
                continue
            got = pg.evaluate(f'(a) => __test.{hook}(...a)', args)
            pg.wait_for_timeout(700)
            pg.evaluate('__test.freeze(true)')
            m = pg.evaluate(MEASURE, MARK[mark])
            pg.screenshot(path=f"{OUT}/{size}-{level:02d}-{track}.png")
            need = floor if size != 'sideways' else SIDE.get(name, 12)
            fall_need = 60 if size == 'sideways' else 250
            check(got is not False and m['n'] > 0 and m['min'] >= need,
                  f"{size}: {name}: smallest {mark} {m['min']} px, at least {need} ({m['n']} drawn)")
            check(not m['scroll'] and m['left'] >= 0 and m['right'] <= m['vw'] and m['bottom'] <= m['vh'] and m['fall'] >= fall_need,
                  f"{size}: {name}: fits ({round(m['left'])} to {round(m['right'])} of {m['vw']}), the rocket falls {m['fall']} px (at least {fall_need})")
            pg.evaluate('__test.freeze(false)')
        outside = [u for u in asked if not (u.startswith(LOCAL) or u.startswith('data:'))]
        check(not outside and not errors, f'{size}: nothing fetched from outside ({len(outside)}) and no page errors ({errors[:2]})')
        ctx.close()
    browser.close()
httpd.shutdown()

print(f"\n{'PASS' if not fails else 'FAIL'}: {len(fails)} failed")
sys.exit(1 if fails else 0)
