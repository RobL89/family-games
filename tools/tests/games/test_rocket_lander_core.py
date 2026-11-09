"""Rocket Lander's pure core and its boundaries. Version 1.1 (spike branch).

Changes at v1.1, on claude/games-spike-maths only (D-030): sums.js joins the pure core,
and the defaults include the spike's four maths settings (mode, ops, layout, pads).

Fast checks, no browser. Node runs the game's own modules (numbers.js, settings.js,
planets.js) and compares them with expected values worked out by hand from the games
pack's DESIGN.md (RL-1's star rule, the number line rules) and the settings' ranges.
Then two boundary checks:
  - the core files are pure: no imports, page, network, clock, randomness or eval;
  - the game is on its own: nothing in games/rocket-lander/ imports from outside its
    folder, fetches, or uses the device's storage (D-004, D-014, data map v1.1).

Stand-in: Node 22 runs the ES modules in place of the browser.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_lander_core.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'rocket-lander')
CORE = ['numbers.js', 'settings.js', 'planets.js', 'sums.js']
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


# ---------- Values from the core, by Node ----------
JS = r"""
const g = process.argv[1];
const N = await import(g + '/numbers.js');
const S = await import(g + '/settings.js');
const P = await import(g + '/planets.js');
const line = (o) => { const l = N.makeLine(o); return { from: l.from, to: l.to, step: l.step, count: l.count, notes: l.notes }; };
const out = {
  line010: line({ from: 0, to: 10, step: 1 }),
  swapped: line({ from: 10, to: 0, step: 1 }),
  big: line({ from: 0, to: 1000, step: 0.5 }),
  halves: line({ from: 0, to: 5, step: 0.5 }),
  ragged: line({ from: 0, to: 10, step: 3 }),
  spots5: N.labelSpots(N.makeLine({ from: 0, to: 10, step: 1 }), 5),
  spots0: N.labelSpots(N.makeLine({ from: 0, to: 10, step: 1 }), 0),
  nice: [N.niceAtLeast(2.506), N.niceAtLeast(0.3), N.niceAtLeast(1), N.niceAtLeast(0)],
  fmt: [N.fmt(7), N.fmt(2.5), N.fmt(2.5, 'decimal'), N.fmt(-3), N.fmt(0.25), N.fmt(0.75), N.fmt(0), N.fmt(0.1 + 0.2, 'decimal')],
  say: [N.say(7), N.say(-3), N.say(2.5), N.say(2.5, 'decimal'), N.say(23), N.say(0.5), N.say(100)],
  stars: [[7, 8], [6, 8], [5, 8], [4, 8], [17, 20], [16, 20], [12, 20], [11, 20], [8, 8], [0, 8]].map(([r, t]) => N.starsFor(r, t)),
  nearLoose: N.nearness(N.makeLine({ from: 0, to: 10, step: 1 }), { closeEnough: 0, pxPerStep: 30, gapOfLabels: 1 }),
  nearTight: N.nearness(N.makeLine({ from: 0, to: 100, step: 1 }), { closeEnough: 0, pxPerStep: 3, gapOfLabels: 10 }),
  nearClose: N.nearness(N.makeLine({ from: 0, to: 10, step: 1 }), { closeEnough: 2, pxPerStep: 30, gapOfLabels: 1 }),
  defaults: S.resolveSettings(S.SETTINGS).values,
  defaultNotes: S.resolveSettings(S.SETTINGS).notes,
  given: S.resolveSettings(S.SETTINGS, { from: -20, to: 5000, step: 'x', show_as: 'decimal', speak: false, speed: 0, extra: 1 }),
  badOpt: S.resolveSettings(S.SETTINGS, { show_as: 'roman', speak: 'yes' }),
  planets: P.PLANETS.map((p) => p.id),
  planetIndex: [P.planetIndex('ice'), P.planetIndex('nope')],
};
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + GAME], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    check(False, 'node ran the core modules')
    sys.exit(1)
o = json.loads(r.stdout)

check(o['line010'] == {'from': 0, 'to': 10, 'step': 1, 'count': 11, 'notes': []}, f'0 to 10 in ones: 11 spots, nothing fixed ({o["line010"]})')
check(o['swapped']['from'] == 0 and o['swapped']['to'] == 10 and any('swapped' in n for n in o['swapped']['notes']), 'ends the wrong way round are swapped, with a note')
# 0 to 1000 in halves is 2001 spots, over 400: (1000 - 0) / 399 = 2.506..., and the next nice gap is 5, so 201 spots
check(o['big']['step'] == 5 and o['big']['count'] == 201 and any('more than 400' in n for n in o['big']['notes']), f'over 400 spots: step 5, 201 spots ({o["big"]})')
check(o['halves']['count'] == 11, '0 to 5 in halves: 11 spots')
# 0 to 10 in threes: 10 / 3 isn't whole, so the line ends at 9 (3 gaps, 4 spots)
check(o['ragged']['to'] == 9 and o['ragged']['count'] == 4, f'a line that isn\'t whole steps ends at the last whole step ({o["ragged"]})')
check(o['spots5'] == [0, 5, 10], 'labels every 5 on 0 to 10: 0, 5, 10')
check(o['spots0'] == [0, 10], 'label_every 0: the two ends only')
check(o['nice'] == [5, 0.5, 1, 1], f'nice gaps: 2.506 -> 5, 0.3 -> 0.5, 1 -> 1, 0 -> 1 ({o["nice"]})')
check(o['fmt'] == ['7', '2½', '2.5', '−3', '¼', '¾', '0', '0.3'], f'numbers written tidily, with a proper minus ({o["fmt"]})')
check(o['say'] == ['seven', 'minus three', 'two and a half', 'two point five', 'twenty-three', 'a half', 'one hundred'],
      f'numbers said as a child says them ({o["say"]})')
# RL-1: right on 85% or more = 3 stars, 60% or more = 2, otherwise 1.
# 7/8 = 87.5% -> 3; 6/8 = 75% -> 2; 5/8 = 62.5% -> 2; 4/8 = 50% -> 1; 17/20 = 85% -> 3; 16/20 = 80% -> 2;
# 12/20 = 60% -> 2; 11/20 = 55% -> 1; 8/8 -> 3; 0/8 -> 1
check(o['stars'] == [3, 2, 2, 1, 3, 2, 2, 1, 3, 1], f'stars by RL-1, edges included ({o["stars"]})')
check(o['nearLoose']['allowed'] == 0 and not o['nearLoose']['tight'], 'marks 30px apart: only the mark itself counts')
check(o['nearTight']['allowed'] == 5 and o['nearTight']['tight'], 'marks 3px apart, labels every 10: within 5 counts')
check(o['nearClose']['allowed'] == 2, 'close_enough 2: within 2 counts')

want = {'speak': True, 'from': 0, 'to': 10, 'step': 1, 'label_every': 1, 'show_as': 'fraction',
        'close_enough': 0, 'landings_per_round': 8, 'speed': 2,
        'mode': 'numbers', 'ops': '+ −', 'layout': 'window', 'pads': 4}
check(o['defaults'] == want and o['defaultNotes'] == [], f'built-in defaults as in the games pack\'s table ({o["defaults"]})')
g = o['given']['values']
check(g['from'] == -20 and g['to'] == 1000 and g['step'] == 1 and g['show_as'] == 'decimal' and g['speak'] is False and g['speed'] == 1
      and 'extra' not in g, f'given settings: kept in range, odd ones fall back, unknown ones ignored ({g})')
check(len(o['given']['notes']) == 3, f'one note for each value changed: to, step, speed ({o["given"]["notes"]})')
check(o['badOpt']['values']['show_as'] == 'fraction' and o['badOpt']['values']['speak'] is True and len(o['badOpt']['notes']) == 2,
      'an option not in the list, or a word for true or false, falls back to the default')
check(o['planets'] == ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed'], 'six planets, in order')
check(o['planetIndex'] == [3, 0], 'planetIndex: ice is 3; an unknown planet is the Moon')

# ---------- Boundaries ----------
def code_only(text):
    """The file without its comments and string contents, so words in them don't count."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    text = re.sub(r'(?m)//.*$', '', text)
    return re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`", "''", text)


IMPURE = re.compile(r'\b(import|document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|'
                    r'performance|Date|eval|Function|setTimeout|setInterval|requestAnimationFrame|navigator|location)\b|Math\.random')
for f in CORE:
    hits = sorted({m.group(0) for m in IMPURE.finditer(code_only(open(os.path.join(GAME, f), encoding='utf-8').read()))})
    check(not hits, f'{f} is pure' + (f': {hits}' if hits else ''))

OUTSIDE = re.compile(r'''from\s+['"]\.\./|import\(\s*['"]\.\./|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|'''
                     r'''sendBeacon|WebSocket|EventSource''')
for f in sorted(os.listdir(GAME)):
    if not f.endswith('.js'):
        continue
    raw =open(os.path.join(GAME, f), encoding='utf-8').read()
    body = re.sub(r'(?m)^\s*//.*$', '', raw)
    hits = sorted({m.group(0) for m in OUTSIDE.finditer(body)})
    check(not hits, f'{f} stays in its folder and keeps nothing on the device' + (f': {hits}' if hits else ''))
html = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
urls = sorted(set(re.findall(r'(?:src|href)="([^"]+)"', html)))
far = [u for u in urls if re.match(r'(https?:)?//', u) and not re.match(r'https://fonts\.(googleapis|gstatic)\.com', u)]
up = [u for u in urls if u.startswith('../')]
check(not far and not up, f'index.html loads only its own files (and the web font): {urls}')

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
