"""Rocket Lander's Year 1 levels on the lower track and Year 3 levels on the higher, in a browser (step 2c-3c).
Version 1.0.

The step's own test (D-086: during a step, the new feature's own test and the fast checks). At a
phone held upright (390x844) and a PC (1280x800):
  - Ice, Jungle and Ringed hold 8 levels each on both tracks, the 8th a challenge, none coming soon; a
    map kept with Candy 8 passed opens Ice 1 (no new edition: only systems coming soon filled);
  - every Year 1 and Year 3 level, with a made-up question set by the test hook so its picture and words
    are known: its chip (a number to find, a count, words, one more or less, groups of, sharing, a shape,
    half of, hundreds tens and ones, <, > or =, 10 or 100 more or less, tenths, which fraction is bigger)
    or its sum (bonds, sums to 20 crossing 10 or not, a missing number written answer first, HTO sums,
    pairs to 100, an estimate, tables, TO x O, TO / O, a fraction sum) fits the screen with no sideways
    scroll and words for screen readers; its line holds the answer (a stretch of 10 marks, in 2s for
    counting in 10s; Year 3's 3-digit numbers and tenths on 7 marks (D-103), in 50s for counting in 100s;
    a group size's or a table's own line; tenths and
    fraction sums written as counted; a pair of fractions with only the two written); a right landing
    counts, and a wrong one is wrong, its bubble saying so in its own words, with nothing showing under
    the lit-up number (RL-3);
  - Year 1's three Number mode levels write every other number, then 0, 5 and 10, then 0 and 10 (D-038);
  - numbers to 100 play in halves (D-094, D-104): 4 landings on 51 to 100, then 4 on 0 to 100; Year 3's mental adding and
    taking away: 4 landings not crossing a ten or hundred, then 4 crossing;
  - mixed tables fall in 6 s (the notes), a question asked by a picture or a phrase in 15 s (D-097);
  - Year 1's Ice challenge and Year 3's Ringed challenge play each of their 7 levels and one more, each on
    its own line and label look;
  - nothing is fetched from outside, and no page errors.

Stand-ins: headless Chromium (Playwright), system fonts for any not shipped.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_year1_year3_e2e.py [folder for screenshots] [--only phone|pc]
Screenshots (made-up play only) go to a temporary folder unless one is given, and are never committed. --only runs
one of the two sizes (the fault bench uses it, to halve a run); the close runs both.
"""
import functools, http.server, json, os, re, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
KEY = 'family-games:rocket-lander:progress'
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
if ONLY:
    ARGS = [a for a in ARGS if a != ONLY]
OUT = ARGS[0] if ARGS else tempfile.mkdtemp(prefix='rl-y13-')
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
TRACK = {'reception': PLAIN + '?track=reception', 'year2': PLAIN + '?track=year2'}

# A made-up question for each level, set with the hook: (question, chip class wanted ('' for a plain
# number), words the bubble must hold after a miss, the line wanted: (from, to, step), a span and step
# (('span', marks, step)), or None for a stretch of 10 in ones)
ASKS = {
    'reception': {
        'ice-1': ({'ask': 'find', 'n': 37, 'value': 37}, '', '37 is over here', None),
        'ice-2': ({'ask': 'find', 'n': 83, 'value': 83, 'part': 1}, '', '83 is over here', None),
        'ice-3': ({'ask': 'seq', 'step': 1, 'dir': 'forward', 'terms': [46, 47, 48], 'value': 49}, 'face-seq', '46, 47, 48, 49', None),
        'ice-4': ({'ask': 'seq', 'step': 10, 'dir': 'forward', 'terms': [10, 20, 30], 'value': 40}, 'face-seq', '10, 20, 30, 40', ('span', 10, 2)),
        'ice-5': ({'ask': 'words', 'n': 14, 'value': 14}, 'face-words', 'fourteen is 14', None),
        'ice-6': ({'ask': 'more-less', 'dir': 'less', 'n': 60, 'value': 59}, 'face-more-less', '1 less than 60 is 59', None),
        'ringed-1': ({'ask': 'groups', 'groups': 3, 'size': 5, 'value': 15}, 'face-groups', '3 groups of 5 make 15', (0, 25, 5)),
        'ringed-2': ({'ask': 'share', 'total': 15, 'groups': 5, 'value': 3}, 'face-share', '3 on each plate', (0, 10, 1)),
        'ringed-4': ({'ask': 'frac-shape', 'num': 1, 'den': 4, 'look': 1, 'parts': 4, 'value': 1}, 'face-shape', 'is shaded', (0, 4, 1)),
        'ringed-5': ({'ask': 'frac-of', 'num': 1, 'den': 2, 'total': 12, 'value': 6}, 'face-fracof', 'of 12 is 6', (0, 10, 1)),
        'ringed-6': ({'ask': 'half', 'n': 14, 'value': 7}, 'face-half', 'Half of 14 is 7', None),
    },
    'year2': {
        'ice-1': ({'ask': 'find', 'n': 347, 'value': 347}, '', '347 is over here', ('span', 6, 1)),
        'ice-2': ({'ask': 'place', 'n': 347, 'value': 347}, 'face-place', '3 hundreds, 4 tens and 7 ones make 347', ('span', 6, 1)),
        'ice-3': ({'ask': 'sign', 'rel': 'fewer', 'n': 452}, 'face-sign', '452 > ', ('span', 6, 1)),
        'ice-4': ({'ask': 'more-less', 'dir': 'more', 'by': 100, 'n': 347, 'value': 447}, 'face-more-less', '100 more than 347 is 447', ('span', 6, 1)),
        'ice-5': ({'ask': 'seq', 'step': 100, 'dir': 'forward', 'terms': [100, 200, 300], 'value': 400}, 'face-seq', '100, 200, 300, 400', ('span', 6, 50)),
        'ringed-4': ({'ask': 'frac-of', 'num': 3, 'den': 5, 'total': 20, 'value': 12}, 'face-fracof', 'of 20 is 12', None),
        'ringed-5': ({'ask': 'seq', 'step': 1, 'dir': 'forward', 'terms': [7, 8, 9], 'value': 10, 'den': 10}, 'face-seq', '9 10, 1', ('span', 6, 1)),
        'ringed-6': ({'ask': 'frac-compare', 'first': 3, 'second': 5, 'parts': 15, 'value': 5, 'other': 3}, 'face-fcmp', 'is bigger than', (0, 15, 1)),
    },
}
SUMS = {
    'reception': {
        'jungle-1': ({'a': 6, 'op': '+', 'b': 4, 'result': 10, 'missing': 'b'}, '6 + 4 = 10', (0, 10, 1)),
        'jungle-2': ({'a': 12, 'op': '+', 'b': 5}, '12 + 5 = 17', None),
        'jungle-3': ({'a': 7, 'op': '+', 'b': 5}, '7 + 5 = 12', None),
        'jungle-4': ({'a': 17, 'op': '−', 'b': 5}, '17 − 5 = 12', None),
        'jungle-5': ({'a': 13, 'op': '−', 'b': 5}, '13 − 5 = 8', None),
        'jungle-6': ({'a': 13, 'op': '+', 'b': 7, 'result': 20, 'missing': 'b'}, '13 + 7 = 20', None),
        'jungle-7': ({'a': 16, 'op': '−', 'b': 9, 'result': 7, 'missing': 'a', 'flip': True}, '7 = 16 − 9', None),
    },
    'year2': {
        'ice-6': ({'a': 245, 'op': '+', 'b': 30}, '245 + 30 = 275', ('span', 6, 1)),
        'ice-7': ({'a': 423, 'op': '−', 'b': 50}, '423 − 50 = 373', ('span', 6, 1)),
        'jungle-1': ({'a': 65, 'op': '+', 'b': 35, 'result': 100, 'missing': 'b'}, '65 + 35 = 100', (0, 100, 5)),
        'jungle-2': ({'a': 68, 'op': '+', 'b': 47}, '68 + 47 = 115', ('span', 6, 1)),
        'jungle-3': ({'a': 298, 'op': '+', 'b': 403, 'round': 100}, '298 + 403 = 701, about 700', (0, 1000, 100)),
        'jungle-3b': ({'a': 38, 'op': '+', 'b': 53, 'round': 10}, '38 + 53 = 91, about 90', ('span', 6, 10)),
        'jungle-4': ({'a': 4, 'op': '×', 'b': 7}, '4 × 7 = 28', (0, 48, 4)),
        'jungle-5': ({'a': 8, 'op': '×', 'b': 6}, '8 × 6 = 48', (0, 96, 8)),
        'jungle-6': ({'a': 3, 'op': '×', 'b': 9}, '3 × 9 = 27', (0, 36, 3)),
        'jungle-7': ({'a': 32, 'op': '÷', 'b': 4}, '32 ÷ 4 = 8', (0, 12, 1)),
        'ringed-1': ({'a': 8, 'op': '×', 'b': 7}, '8 × 7 = 56', ('span', 6, 1)),
        'ringed-2': ({'a': 23, 'op': '×', 'b': 4}, '23 × 4 = 92', ('span', 6, 1)),
        'ringed-3': ({'a': 48, 'op': '÷', 'b': 4}, '48 ÷ 4 = 12', None),
        'ringed-7': ({'a': 5, 'op': '+', 'b': 1, 'den': 7}, '= 6 7', (0, 7, 1)),
    },
}
LOOKS = {('year2', 'ringed-5'): 'parts10', ('year2', 'ringed-6'): 'frac15', ('reception', 'ringed-4'): 'frac4', ('year2', 'ringed-7'): 'parts7'}
LABELS = {('year2', 'ringed-6'): ['0', '1/5', '1/3', '1'], ('year2', 'ringed-7'): ['0', '1/7', '2/7', '3/7', '4/7', '5/7', '6/7', '1']}
FACE_SUMS = {('year2', 'jungle-3'), ('year2', 'jungle-3b')}  # an estimate asks as a face ("≈ ?", nearest 100)
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


def home(pg, track):
    pg.goto(TRACK[track])
    ready(pg)


def miss(pg, hook, arg):
    """A wrong landing at real speed (so its 2 s bubble is read before it goes), then the lit-up number."""
    pg.evaluate('__test.speed(1)')
    pg.evaluate(f'__test.{hook}({json.dumps(arg)})')
    spot = pg.evaluate('__test.wrong()')
    pg.wait_for_selector('#bubble:not([hidden])', timeout=20000)
    bub = re.sub(r'\s+([,.!])', r'\1', re.sub(r'\s+', ' ', pg.inner_text('#bubble')).strip())  # a stacked fraction reads '9 10 ,': no space before the comma
    pg.wait_for_timeout(600)
    ov = pg.evaluate('__test.overlaps()')
    pg.evaluate('__test.speed(6)')
    return spot, bub, ov


def line_ok(ln, want, ans):
    """The landing's line holds the answer on a mark, and is the line wanted."""
    holds = ans is not None and ln['from'] <= ans <= ln['to'] and abs((ans - ln['from']) / ln['step'] - round((ans - ln['from']) / ln['step'])) < 1e-9
    if want is None:
        return holds and ln['to'] - ln['from'] == 10 and ln['step'] == 1
    if want[0] == 'span':
        return holds and ln['step'] == want[2] and (ln['to'] - ln['from']) == want[1] * want[2] and ln['from'] % want[2] == 0
    return holds and (ln['from'], ln['to'], ln['step']) == want


def fits(info, w, h):
    return info['left'] >= 0 and info['right'] <= w and not info['sideways'] and 20 <= info['h'] <= h * 0.2 and len(info['aria'] or '') > 8


with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in [s for s in ((390, 844, True, 'phone'), (1280, 800, False, 'pc')) if not ONLY or s[3] == ONLY]:
        ctx, pg, asked, errors = page(br, w, h, mobile)
        for track in ('reception', 'year2'):
            home(pg, track)
            sizes = {}
            for sysid in ('ice', 'jungle', 'ringed'):
                pg.evaluate(f'__test.begin({{ level: "{sysid}-1" }})')
                pg.wait_for_function('(() => { const s = __test.state(); return s.screen === "map" && s.map && !s.map.busy; })()', timeout=15000)
                sizes[sysid] = len(st(pg)['map']['markers'])
            check(sizes == {'ice': 8, 'jungle': 8, 'ringed': 8}, f'{tag} {track}: Ice, Jungle and Ringed hold 8 levels each, the 8th a challenge: {sizes}')

            # the questions, each with a made-up question set by the hook
            for lid, (T, cls, words, want) in ASKS[track].items():
                home(pg, track)
                start(pg, lid)
                pg.evaluate(f'__test.aimAsk({json.dumps(T)})')
                pg.wait_for_timeout(700)  # the target's pop (0.55 s) over, so it's measured at rest
                info, s = pg.evaluate(CHIP), st(pg)
                pg.screenshot(path=os.path.join(OUT, f'{tag}-{track}-{lid}.png'))
                ln = s['line']
                ans = T.get('value') if T.get('value') is not None else None
                wide = want[1] * want[2] if want and want[0] == 'span' else 10
                on = line_ok(ln, want, ans) if ans is not None else (ln['to'] - ln['from'] == wide and T['n'] - ln['from'] >= 3 and ln['to'] - T['n'] >= 3)
                look = LOOKS.get((track, lid))
                look_ok = (s['labelLook'] == look) if look else s['labelLook'] in ('plain', None)
                labels_ok = s['labels'] == LABELS[(track, lid)] if (track, lid) in LABELS else True
                chip_ok = (info['cls'] == 'chip' and not info['face']) if cls == '' else (cls in info['cls'] and info['face'])
                check(chip_ok and on and look_ok and labels_ok,
                      f'{tag} {track} {lid}: the {T["ask"]} chip on its line {ln["from"]} to {ln["to"]} in {ln["step"]}s, look {s["labelLook"]}, labels {s["labels"][:6]}: {info["cls"]}, {info["text"]!r}')
                check(fits(info, w, h), f'{tag} {track} {lid}: it fits the screen, no sideways scroll, {info["h"]:.0f} px high; screen readers hear {info["aria"]!r}')
                pg.evaluate('__test.right()')
                pg.wait_for_function('__test.state().right === 1', timeout=20000)
                check(st(pg)['results'][0]['right'], f'{tag} {track} {lid}: a right landing counts')
                next_fly(pg, 0)
                spot, bub, ov = miss(pg, 'aimAsk', T)
                r = st(pg)['results'][1]
                # on a line of plain numbers the bubble names the spot as it's written ("That's 11."); a fraction's den is no line's
                said = bub.startswith(f"That's {spot:g}.") if not look and T['ask'] != 'frac-compare' else True
                check(not r['right'] and words in bub and said and ov == [], f'{tag} {track} {lid}: a wrong landing ({spot}) is wrong, the bubble says {bub!r}, nothing under the lit-up number: {ov}')

            # the sums
            for key, (f, words, want) in SUMS[track].items():
                lid = key[:-1] if key.endswith('b') else key
                home(pg, track)
                start(pg, lid)
                pg.evaluate(f'__test.aimFact({json.dumps(f)})')
                pg.wait_for_timeout(700)
                info, s = pg.evaluate(CHIP), st(pg)
                pg.screenshot(path=os.path.join(OUT, f'{tag}-{track}-{key}.png'))
                ln, ans = s['line'], s['target']
                look = LOOKS.get((track, key))
                look_ok = (s['labelLook'] == look) if look else s['labelLook'] in ('plain', None)
                labels_ok = s['labels'] == LABELS[(track, key)] if (track, key) in LABELS else True
                face = (track, key) in FACE_SUMS
                check('sum' in info['cls'] and info['face'] == face and line_ok(ln, want, ans) and look_ok and labels_ok and (('?' in info['text']) == ('missing' in f or face)),
                      f'{tag} {track} {key}: {s["sum"]} on its line {ln["from"]} to {ln["to"]} in {ln["step"]}s, the answer {ans} on it, look {s["labelLook"]}; chip {info["text"]!r}')
                check(fits(info, w, h), f'{tag} {track} {key}: it fits the screen, no sideways scroll, {info["h"]:.0f} px high; screen readers hear {info["aria"]!r}')
                pg.evaluate('__test.right()')
                pg.wait_for_function('__test.state().right === 1', timeout=20000)
                check(st(pg)['results'][0]['right'], f'{tag} {track} {key}: a right landing counts')
                next_fly(pg, 0)
                spot, bub, ov = miss(pg, 'aimFact', f)
                r = st(pg)['results'][1]
                check(not r['right'] and words in bub and ov == [], f'{tag} {track} {key}: a wrong landing ({spot}) is wrong, the bubble says {bub!r}, nothing under the lit-up number: {ov}')

        # Year 1's Number mode levels (D-038): every other number written, then 0, 5 and 10, then 0 and 10
        home(pg, 'reception')
        lab = {}
        for lid in ('ice-7', 'ringed-3', 'ringed-7'):
            start(pg, lid)
            lab[lid] = st(pg)['labels']
            home(pg, 'reception')
        check(lab == {'ice-7': ['0', '2', '4', '6', '8', '10'], 'ringed-3': ['0', '5', '10'], 'ringed-7': ['0', '10']},
              f'{tag}: Year 1\'s Number mode levels write every other number, then 0, 5 and 10, then 0 and 10: {lab}')

        # Halves (D-094): numbers to 100: 4 landings to 50, then 4 to 100
        start(pg, 'ice-2')
        got = []
        for i in range(8):
            if i:
                next_fly(pg, i - 1)
            s = st(pg)
            got.append((s['target'], s['line']['from'], s['line']['to']))
            pg.evaluate('__test.right()')
            pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
        check(all(t >= 51 and fr >= 51 and to <= 100 for t, fr, to in got[:4]) and all(fr >= 0 and to <= 100 for _, fr, to in got[4:]),
              f'{tag} reception ice-2: numbers to 100 in halves (D-104): 4 landings on 51 to 100, then 4 on 0 to 100: {got}')

        # Year 3's mental adding and taking away in halves: not crossing, then crossing
        home(pg, 'year2')
        for lid, op in (('ice-6', '+'), ('ice-7', '−')):
            start(pg, lid)
            sums = []
            for i in range(8):
                if i:
                    next_fly(pg, i - 1)
                sums.append(st(pg)['sum'])
                pg.evaluate('__test.right()')
                pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
            pairs = [[int(x) for x in t.split(f' {op} ')] for t in sums]

            def crosses(a, b):
                if op == '+':
                    return (b < 10 and a % 10 + b >= 10) or (10 <= b < 100 and a % 100 + b >= 100)
                return (b < 10 and a % 10 < b) or (10 <= b < 100 and a % 100 < b)
            flags = [crosses(a, b) for a, b in pairs]
            check(flags == [False] * 4 + [True] * 4 and all(100 <= a <= 999 for a, _ in pairs),
                  f'{tag} year2 {lid}: a 3-digit number and ones, tens or hundreds, 4 landings not crossing a ten or hundred, then 4 crossing: {sums}')
            home(pg, 'year2')

        # Falls (D-097, the notes' 6 s): a phrase or a picture in 15 s; mixed tables in 6 s
        falls = {}
        for lid in ('ice-1', 'ringed-1', 'ringed-6'):
            start(pg, lid)
            falls[lid] = st(pg)['fall']
            home(pg, 'year2')
        check(falls == {'ice-1': 15, 'ringed-1': 6, 'ringed-6': 15}, f'{tag} year2: a question to read falls in 15 s; mixed tables in 6 s: {falls}')

        # Challenge rounds (D-091): Year 1's Ice and Year 3's Ringed
        for track, lid in (('reception', 'ice-8'), ('year2', 'ringed-8')):
            home(pg, track)
            start(pg, lid)
            subs, looks = [], []
            for i in range(8):
                if i:
                    next_fly(pg, i - 1)
                s = st(pg)
                subs.append(s['sub'])
                looks.append((s['sub'], s['labelLook'], s['fall'], s['line']['step']))
                pg.evaluate('__test.right()')
                pg.wait_for_function(f'__test.state().results.length === {i + 1}', timeout=20000)
            check(sorted(set(subs)) == list(range(7)) and len(subs) == 8, f"{tag} {track} {lid}: each of the system's 7 levels, and one more: {subs}")
            if lid == 'ringed-8':
                # tenths on 'parts10'; a pair of fractions on 'frac<common parts>'; a fraction sum on 'parts<den>' (den 10 too)
                ok = all((fall == 6) == (j == 0) for j, _, fall, _ in looks) and all(lk == 'parts10' for j, lk, _, _ in looks if j == 4)
                ok = ok and all(lk.startswith('frac') for j, lk, _, _ in looks if j == 5) and all(lk.startswith('parts') for j, lk, _, _ in looks if j == 6)
                ok = ok and all(lk == 'plain' for j, lk, _, _ in looks if j in (0, 1, 2, 3))
                check(ok, f'{tag} year2 ringed-8: each landing as its own level: mixed tables in 6 s, tenths and fraction sums written as counted, the pair of fractions on its own line: {looks}')
            else:
                ok = all(lk == 'plain' for _, lk, _, _ in looks) and all(stp in (1, 2) for _, _, _, stp in looks)
                check(ok, f'{tag} reception ice-8: numbers, counts, words and one more or less, written plainly on their stretches: {looks}')
            pg.wait_for_function('__test.state().phase === "end"', timeout=30000)
            s = st(pg)
            check(s['right'] == 8 and s['progress']['levels'].get(lid, {}).get('stars') == 3, f'{tag} {track} {lid}: 8 right, 3 stars: {s["progress"]["levels"].get(lid)}')

        # A map kept before this step, with Candy 8 passed, now opens Ice 1 (the editions are unchanged)
        kept = {'v': 4, 'track': 'reception', 'edition': 'lower-1', 'at': 'candy-8', 'open': 'candy-8', 'levels': {'candy-8': {'stars': 2, 'rocks': 3}},
                'rocks': 30, 'landings': 40, 'ship': 'classic', 'ships': ['classic'], 'maps': {}}
        pg.evaluate(f'localStorage.setItem("{KEY}", {json.dumps(json.dumps(kept))})')
        pg.goto(PLAIN)
        ready(pg)
        s = st(pg)
        check(s['track'] == 'reception' and s['progress']['open'] == 'ice-1' and s['progress']['levels'].get('candy-8', {}).get('stars') == 2 and s['progress']['rocks'] == 30,
              f'{tag}: a map kept with Candy 8 passed keeps its stars and rocks and opens Ice 1: {s["progress"]["open"]}, {s["progress"]["rocks"]}')

        others = [u for u in asked if not u.startswith(LOCAL) and not u.startswith('data:')]
        check(not others, f'{tag}: nothing fetched from outside' + (f': {others[:3]}' if others else ''))
        check(not errors, f'{tag}: no page errors' + (f': {errors[:3]}' if errors else ''))
        ctx.close()
    br.close()

print(f'\nScreenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
