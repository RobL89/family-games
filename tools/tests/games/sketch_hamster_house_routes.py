"""Hamster Highway: two plans for every stop in the house and garden, drawn on the game's own house art.
Version 0.1 (15 Nov, after Rob's look at preview 3). Not a check: a sketch page for Rob to pick from.

Rob: "now a whole room of the house isn't used. Perhaps we should plan out all stops on the house / garden for
future levels." Levels 1 to 5 keep their places (kitchen sink, bread bin, pantry tins, living-room bookshelf,
bedroom cage); levels 6 to 10 follow D-145 (6 and 7 the cracking lolly stick, 8 the see-saw, 9 the teacup lift,
10 a treehouse finale); soft places are kept for more levels after v1 (D-136). Each plan's path is simple: it
never crosses itself or goes back along itself (D-150), which the script checks.
  A. Up and over: through the ground floor, up to the bedroom, across to the bathroom, up into a loft under the
     roof, then out over the roof and down the drainpipe into the garden.
  B. Up, out and under: through the ground floor, up to the bedroom, across to the bathroom, out of its window and
     down the wall into a hamster burrow under the house, which comes up in the garden.
The house is games/hamster-highway/house.js's (run in Node), with its own places for later and its dotted path
taken out; the loft and the burrow are drawn here, roughly, as they don't exist yet.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_hamster_house_routes.py OUT.html
It also checks the page in Chromium at phone and PC widths, light and dark (no script errors, no sideways
scrolling of the page), and exits 1 if a path crosses itself or a check fails.
"""
import html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-house-routes.html'
problems = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


JS = r'''
const [houseUrl] = process.argv.slice(1);
const H = await import(houseUrl);
H.FUTURE.length = 0;   // the sketch draws its own places for later
let s = H.houseScene({ levels: [], current: -1 });
s = s.replace(/<path d="M "[^>]*\/>/g, '');   // the empty dotted path
console.log(JSON.stringify({ svg: s, w: H.HOUSE_W, h: H.HOUSE_H, spots: H.SPOTS }));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'house.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
house = json.loads(r.stdout)
W, Hh, SP = house['w'], house['h'], house['spots']

FIXED = [('1', SP['sink'], 'Mind the gap', 'kitchen sink'), ('2', SP['breadbin'], 'Step up', 'bread bin'),
         ('3', SP['tins'], 'Boing!', 'pantry tins'), ('4', SP['bookshelf'], 'Gentle landing', 'living-room bookshelf'),
         ('5', SP['cage'], 'Tube trip', 'bedroom cage')]
# Each plan: its stops 6 to 10 and its places for later, in path order, with the path's bends between them.
PLANS = {
    'A': dict(title='A. Up and over: bathroom, loft, roof, drainpipe, garden', stops=[
        ('6', (300, 360), 'cracking lolly stick (D-143)', 'over the bath, bubbles below'),
        ('7', (430, 150), 'cracking lolly stick', 'across the loft\'s rafters'),
        ('·', (860, 150), 'later', 'the loft, by the old suitcases'),
        ('8', (1480, 712), 'see-saw (D-144)', 'veg patch: a plank on a flowerpot'),
        ('9', (1862, 560), 'teacup lift (D-144)', 'the shed\'s pulley'),
        ('·', (2100, 724), 'later', 'the pond'),
        ('10', (2322, 352), 'treehouse finale (D-145)', 'up the tree'),
    ], bends={('8', 0): [(1240, 150), (1300, 220), (1300, 700)]}),
    'B': dict(title='B. Up, out and under: bathroom, out the window, a burrow under the house, garden', stops=[
        ('6', (300, 360), 'cracking lolly stick (D-143)', 'over the bath, bubbles below'),
        ('7', (360, 868), 'cracking lolly stick', 'a burrow under the house: an underground stream'),
        ('·', (860, 868), 'later', 'the burrow, by the root cellar'),
        ('8', (1480, 712), 'see-saw (D-144)', 'veg patch: a plank on a flowerpot'),
        ('9', (1862, 560), 'teacup lift (D-144)', 'the shed\'s pulley'),
        ('·', (2100, 724), 'later', 'the pond'),
        ('10', (2322, 352), 'treehouse finale (D-145)', 'up the tree'),
    ], bends={('7', 0): [(150, 360), (36, 380), (36, 868)], ('8', 0): [(1300, 868), (1320, 760)]}),
}


def route(plan):
    """The path's points: levels 1 to 5, then the plan's stops with their bends before them."""
    pts = [p for _, p, _, _ in FIXED]
    seen = {}
    for label, p, _, _ in plan['stops']:
        n = seen.get(label, 0)
        seen[label] = n + 1
        pts += plan['bends'].get((label, n), [])
        pts.append(p)
    return pts


def crosses(a, b, c, d):
    def orient(p, q, r):
        v = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        return (v > 0) - (v < 0)
    return orient(a, b, c) * orient(a, b, d) < 0 and orient(c, d, a) * orient(c, d, b) < 0


def simple(pts):
    segs = list(zip(pts, pts[1:]))
    for i in range(len(segs)):
        for j in range(i + 2, len(segs)):
            if crosses(*segs[i], *segs[j]):
                return False, (i, j)
    return True, None


INK, BROWN, MUTED = '#1B1446', '#8B5A3C', '#8B6A4A'


def extras(key):
    """The places that don't exist yet, drawn roughly: the loft (A) or the burrow (B)."""
    if key == 'A':
        return (f'<path d="M 140 196 L 1180 196" stroke="{BROWN}" stroke-width="6"/>'
                + ''.join(f'<path d="M {x} 196 L {x + 40} {196 - 40 * 0.26 * 4}" stroke="#C98F57" stroke-width="5" opacity="0.7"/>' for x in range(200, 1100, 140))
                + f'<rect x="780" y="160" width="70" height="36" rx="6" fill="#C9B8FF" stroke="{INK}" stroke-width="2.4"/>'
                + f'<rect x="1290" y="206" width="14" height="574" rx="7" fill="#9AA7C7" stroke="{INK}" stroke-width="2.4"/>')
    return (f'<path d="M 30 868 L 1330 868" stroke="#7A4A22" stroke-width="40" stroke-linecap="round" opacity="0.55"/>'
            + f'<path d="M 120 880 q 120 -16 240 0 t 240 0" fill="none" stroke="#7FD3F7" stroke-width="6" opacity="0.8"/>'
            + f'<rect x="20" y="300" width="14" height="560" rx="7" fill="#C98F57" stroke="{INK}" stroke-width="2.4" opacity="0.8"/>')


def svg(key, plan):
    pts = route(plan)
    d = 'M ' + ' L '.join(f'{x} {y}' for x, y in pts)
    s = house['svg'] + extras(key)
    s += f'<path d="{d}" fill="none" stroke="{MUTED}" stroke-width="7" stroke-dasharray="3 16" stroke-linecap="round" opacity="0.75"/>'
    for label, (x, y), *_ in FIXED + plan['stops']:
        later = label == '·'
        s += (f'<circle cx="{x}" cy="{y}" r="{22 if later else 30}" fill="{"rgba(255,248,238,0.6)" if later else "#FFF8EE"}" stroke="{BROWN}" stroke-width="3"'
              + (' stroke-dasharray="6 6"' if later else '') + '/>')
        if not later:
            s += f'<text x="{x}" y="{y + 10}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="28" font-weight="600" fill="{MUTED}">{label}</text>'
    return f'<svg viewBox="0 0 {W} {Hh}" role="img" aria-label="{html.escape(plan["title"])}">{s}</svg>', pts


cards = ''
for key, plan in PLANS.items():
    pic, pts = svg(key, plan)
    ok, where = simple(pts)
    check(ok, f'plan {key}: the path never crosses itself ({where or "no crossings"})')
    rows = ''.join(f'<tr><td>{l}</td><td>{html.escape(name)}</td><td>{html.escape(where)}</td></tr>'
                   for l, _, name, where in FIXED + plan['stops'] if l != '·')
    later = ', '.join(html.escape(w) for l, _, _, w in plan['stops'] if l == '·')
    cards += (f'<section><h2>{html.escape(plan["title"])}</h2><div class="pic">{pic}</div>'
              f'<table><tr><th>#</th><th>Level</th><th>Where</th></tr>{rows}</table>'
              f'<p class="later">Soft places kept for more levels later: {later}.</p></section>')

page = f'''<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: where every level goes</title>
<style>
:root {{ color-scheme: light dark; --bg: #FFF8EE; --ink: #1B1446; --card: #FFFFFF; --muted: #6B5A4A; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #1B1446; --ink: #FFF8EE; --card: #2A2360; --muted: #D9CBB8; }} }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--ink); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 1.4rem; margin: 0 0 4px; }} h2 {{ font-size: 1.1rem; margin: 0 0 8px; }}
.intro, .later, .stamp {{ color: var(--muted); }} .stamp {{ overflow-wrap: anywhere; }}
section {{ background: var(--card); border-radius: 14px; padding: 14px; margin: 16px 0; }}
.pic {{ overflow-x: auto; border-radius: 10px; }} .pic svg {{ display: block; height: 340px; width: auto; }}
table {{ border-collapse: collapse; margin-top: 10px; width: 100%; max-width: 760px; }}
td, th {{ text-align: left; padding: 4px 8px; border-bottom: 1px solid rgba(127,127,127,.25); vertical-align: top; }}
</style></head><body>
<h1>Hamster Highway: where every level goes</h1>
<p class="intro">Two plans for all ten v1 levels, plus soft places for more later. Levels 1 to 5 stay where they are. Each path runs one way and never crosses itself. The house picture scrolls sideways.</p>
{cards}
<p class="stamp">Sketch 0.1 · 15 Nov 2026 · P-034 (Kids Games Development) · tools/tests/games/sketch_hamster_house_routes.py · rough: the loft, the drainpipe and the burrow aren't drawn properly yet</p>
</body></html>'''
open(OUT, 'w', encoding='utf-8').write(page)
print(f'written {OUT} ({len(page)} bytes)')

from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, scheme in ((390, 844, 'light'), (390, 844, 'dark'), (1366, 768, 'light'), (1366, 768, 'dark')):
        pg = br.new_page(viewport={'width': w, 'height': h}, color_scheme=scheme)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto('file://' + os.path.abspath(OUT))
        check(not errs, f'{w}x{h} {scheme}: no script errors {errs[:1]}')
        check(not pg.evaluate('document.scrollingElement.scrollWidth > innerWidth'), f'{w}x{h} {scheme}: no sideways scrolling of the page')
        pg.screenshot(path=f'/tmp/routes-{w}-{scheme}.png', full_page=True)
        pg.close()
    br.close()
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
