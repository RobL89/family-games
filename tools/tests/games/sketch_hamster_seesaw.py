"""Hamster Highway: two ways the level 8 see-saw could work, drawn with the game's own art.
Version 0.1 (15 Nov, step 4's start). Not a check: a sketch page for Rob to pick from.

D-144 agreed "a see-saw that tips under two hamsters (level 8)", slow, visible and the same every time. Drawing it
out showed a catch: there are five hamsters, so a see-saw that needs two at once and then springs back leaves the
fifth on its own. The two options here both work for all five:
  A. Two tip it, and it stays tipped (D-144 as agreed). A hamster that reaches the see-saw's high end waits there
     (the drop is too big); when a second joins it, the plank tips and both walk off. It stays tipped, so its near
     end is now a step up: the child's job is a ramp to reach it, so the other three walk straight over.
  B. One hamster tips it, and it springs back. Each hamster tips it as it passes the middle, walks off, and the
     plank springs back for the next. Simpler to watch, but not "two", and the see-saw does the work on its own.
The board is the same in both: a high bank, a gap in the veg patch with the see-saw on a flowerpot, a low bank
with the seed house. Rows and squares as core.js 1.1 counts them; nothing here is built or tested yet.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_hamster_seesaw.py OUT.html
It checks the page in Chromium at phone and PC widths, light and dark (no script errors, no sideways scrolling of
the page), and exits 1 if a check fails.
"""
import html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hamster-seesaw.html'
problems = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


# The game's art, from art.js in Node: blocks, water, the start tube, the seed house, a ramp and hamsters.
JS = r'''
const [artUrl] = process.argv.slice(1);
const A = await import(artUrl);
const out = { CELL: A.CELL, back: A.backdrop('garden') || '', start: A.startArt(), home: A.homeArt(), ramp: A.gadget('ramp'),
  walk: A.hamster('walk'), happy: A.hamster('home'), block: {}, water: {} };
for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) { out.block[`${c},${r}`] = A.block(c, r, true); out.water[`${c},${r}`] = A.water(c, r); }
console.log(JSON.stringify(out));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'art.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
ART = json.loads(r.stdout)
CELL = ART['CELL']
SC = 0.56          # game.js 1.3's hamster size
INK, PLANK, POT = '#1B1446', '#C98F57', '#D9774B'

# The shared board: near bank cols 0-3 (its top is row 4, so they stand on row 3), the gap cols 4-6 with water at
# the bottom and a flowerpot under col 5, the low bank cols 7-11 (they stand on row 5), home at 10,5.
GROUND = [(c, r) for c in range(4) for r in range(4, 7)] + [(c, 6) for c in range(7, 12)]
WATER = [(4, 6), (6, 6)]


def board():
    s = f'<rect x="0" y="0" width="{12 * CELL}" height="{7 * CELL}" fill="#DFF3E4"/>'
    s += f'<rect x="0" y="{5 * CELL}" width="{12 * CELL}" height="{2 * CELL}" fill="#CBE8C9"/>'
    for cr in GROUND:
        s += ART['block'][f'{cr[0]},{cr[1]}']
    for cr in WATER:
        s += ART['water'][f'{cr[0]},{cr[1]}']
    # cabbages and a carrot top, for the veg patch
    for x in (480, 560, 650):
        s += f'<circle cx="{x}" cy="{6 * CELL - 4}" r="12" fill="#8BD17C" stroke="{INK}" stroke-width="2"/>'
    s += f'<g transform="translate(0 {3 * CELL}) scale({CELL / 100})">{ART["start"]}</g>'
    s += f'<g transform="translate({10 * CELL} {5 * CELL}) scale({CELL / 100})">{ART["home"]}</g>'
    # the flowerpot the see-saw rests on, under col 5
    s += (f'<path d="M {5 * CELL + 8} {4 * CELL + 14} L {6 * CELL - 8} {4 * CELL + 14} L {6 * CELL - 16} {7 * CELL} '
          f'L {5 * CELL + 16} {7 * CELL} Z" fill="{POT}" stroke="{INK}" stroke-width="2.4"/>')
    s += f'<rect x="{5 * CELL + 2}" y="{4 * CELL + 8}" width="{CELL - 4}" height="14" rx="4" fill="#E98C60" stroke="{INK}" stroke-width="2.4"/>'
    return s


def plank(tipped):
    """The plank across cols 4 to 6, a row's slope a square: at rest its near end is down (they stand on row 4 at
    col 4, row 2 at col 6); tipped, the far end is down (row 2 at col 4, row 4 at col 6)."""
    y0, y1 = (330, 150) if not tipped else (150, 330)
    return (f'<line x1="{4 * CELL}" y1="{y0}" x2="{7 * CELL}" y2="{y1}" stroke="{INK}" stroke-width="18" stroke-linecap="round"/>'
            f'<line x1="{4 * CELL}" y1="{y0}" x2="{7 * CELL}" y2="{y1}" stroke="{PLANK}" stroke-width="12" stroke-linecap="round"/>'
            f'<circle cx="{5.5 * CELL}" cy="{240}" r="7" fill="#8B5A3C" stroke="{INK}" stroke-width="2"/>')


def hamster(c, row, pose='walk', flip=False, faded=False):
    art = ART['happy'] if pose == 'home' else ART['walk']
    x, y = c * CELL + 30, (row + 1) * CELL
    op = ' opacity="0.45"' if faded else ''
    return f'<g transform="translate({x} {y}) scale({SC})"{op}>{art}</g>'


def ramp(c, row):
    return f'<g transform="translate({c * CELL} {row * CELL}) scale({CELL / 100})">{ART["ramp"]}</g>'


def arrow(x0, y0, x1, y1):
    return (f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="#FF5D73" stroke-width="5" stroke-linecap="round" '
            f'stroke-dasharray="2 10" marker-end="url(#ah)"/>')


def bubble(x, y, s):
    return (f'<g transform="translate({x} {y})"><circle r="17" fill="#FFFFFF" stroke="{INK}" stroke-width="2.4"/>'
            f'<text y="9" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="26" fill="#FF5D73">{s}</text></g>')


DEFS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#FF5D73"/></marker></defs>'


def frame(body):
    return f'<svg viewBox="0 0 {12 * CELL} {7 * CELL}" role="img">{DEFS}{board()}{body}</svg>'


OPTIONS = [
    ('A', 'A. Two tip it, and it stays tipped (D-144 as agreed) · Claude\'s pick', [
        ('1. The first hamster walks up and waits at the high end: the drop is too big.',
         plank(False) + hamster(6, 2) + bubble(6 * CELL + 60, 2 * CELL - 30, '!') + hamster(4, 4) + hamster(1, 3)),
        ('2. A second joins it: the plank tips, slowly, and both walk off to the house.',
         plank(True) + hamster(6, 4) + hamster(7, 5) + arrow(8 * CELL, 5.5 * CELL, 9.6 * CELL, 5.5 * CELL) + hamster(2, 3)),
        ('3. It stays tipped, so its near end is a step up. The child\'s job: a ramp there, and the other three walk straight down it. No ramp: they nap at the step.',
         plank(True) + ramp(3, 3) + hamster(3, 2) + hamster(5, 3) + hamster(1, 3) + hamster(10, 5, 'home') + hamster(9, 5, 'home')),
    ], 'Uses the five hamsters: the first two do a job for the rest. One extra rule: a hamster at a see-saw\'s high end waits for a friend instead of jumping. A child sees why it waits (the drop) and what tips it (two).'),
    ('B', 'B. One hamster tips it, and it springs back', [
        ('1. A hamster walks up the plank.',
         plank(False) + hamster(5, 3) + hamster(2, 3)),
        ('2. As it passes the middle the plank tips, and it walks down to the house.',
         plank(True) + hamster(6, 4) + arrow(7 * CELL, 5.3 * CELL, 9.6 * CELL, 5.5 * CELL) + hamster(3, 3)),
        ('3. Empty again, it springs back for the next one.',
         plank(False) + arrow(6.6 * CELL, 2.6 * CELL, 6.6 * CELL, 1.6 * CELL) + hamster(4, 4) + hamster(7, 5) + hamster(10, 5, 'home')),
    ], 'Simpler to watch and needs no waiting rule, but it isn\'t "two" (a change to D-144), and the see-saw does the job on its own: the level\'s puzzle has to come from other gadgets around it.'),
]

cards = ''
for key, title, frames, note in OPTIONS:
    pics = ''.join(f'<figure>{frame(body)}<figcaption>{html.escape(cap)}</figcaption></figure>' for cap, body in frames)
    cards += f'<section><h2>{html.escape(title)}</h2><div class="strip">{pics}</div><p class="note">{html.escape(note)}</p></section>'

page = f'''<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: how the see-saw works</title>
<style>
:root {{ color-scheme: light dark; --bg: #FFF8EE; --ink: #1B1446; --card: #FFFFFF; --muted: #6B5A4A; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #1B1446; --ink: #FFF8EE; --card: #2A2360; --muted: #D9CBB8; }} }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--ink); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 1.4rem; margin: 0 0 4px; }} h2 {{ font-size: 1.1rem; margin: 0 0 8px; }}
.intro, .note, .stamp {{ color: var(--muted); }} .stamp {{ overflow-wrap: anywhere; }}
section {{ background: var(--card); border-radius: 14px; padding: 14px; margin: 16px 0; }}
.strip {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }}
figure {{ margin: 0; }} figure svg {{ display: block; width: 100%; height: auto; border-radius: 10px; }}
figcaption {{ font-size: 0.92rem; margin-top: 6px; }}
</style></head><body>
<h1>Hamster Highway: how the level 8 see-saw works</h1>
<p class="intro">Level 8, the veg patch: the hamsters come out on a high bank; the seed house is on a low bank past a gap. The see-saw sits on a flowerpot in the gap. Two ways it could work; both get all five hamsters home. A see-saw that needs two hamsters and then springs back would leave the fifth on its own, so it isn't shown.</p>
{cards}
<p class="stamp">Sketch 0.1 · 15 Nov 2026 · P-034 (Kids Games Development) · tools/tests/games/sketch_hamster_seesaw.py · rough: the plank, pot and garden aren't the game's final art; nothing is built yet</p>
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
        pg.screenshot(path=f'/tmp/seesaw-{w}-{scheme}.png', full_page=True)
        pg.close()
    br.close()
print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
