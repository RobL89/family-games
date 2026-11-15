"""Mock-ups for D-123 and D-124 (trial feedback item 1): bigger, fewer things to count at the top of
Rocket Lander. Version 1.0.

Opens the real game in a round, sets the question with its own test hooks, then swaps in each option's
picture and sizes (CSS and markup written here, not in the game) and screenshots the whole frame, so the
mock-ups show the real sky, line and rocket and how much falling room each option leaves. Options:
  How many dots? (1 to 6): A rows of 5, bigger; B a dice face; C rows of 3.
  Groups of (up to 5 groups of 2, 5 or 10): A the words, and under them a box per group with its size in it;
  B the boxes alone, bigger (the question is still read out).
Stand-in: the game on its own in a page the size of the wrapper's frame (screen less P-020's 56 px bar).

Run from the repo root with the site served on 127.0.0.1:8123:
    python3 -B tools/tests/games/sketch_rocket_counting.py /tmp/counting
Writes one screenshot per option, case and size, sketch.json (smallest dot and the fall in px) and a
sheet per device: sheet-phone.png, sheet-pc.png, sheet-sideways.png.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/counting'
BASE = 'http://127.0.0.1:8123/games/rocket-lander/index.html'
BAR = 56
SIZES = [('phone', 390, 844 - BAR), ('pc', 1366, 768 - BAR), ('sideways', 844, 390 - BAR)]
R = 3.9  # a dot's radius in a 10-unit cell, as faces.js


def dot(x, y):
    return f'<circle class="d-on" cx="{x}" cy="{y}" r="{R}"/>'


def rows_of(n, per):
    cols, rows = min(per, n), -(-n // per)
    body = ''.join(dot((i % per) * 10 + 5, (i // per) * 10 + 5) for i in range(n))
    return f'<svg class="fd mz r{rows}" viewBox="-0.6 -0.6 {cols * 10 + 1.2} {rows * 10 + 1.2}" aria-hidden="true">{body}</svg>'


PIPS = {1: [(15, 15)], 2: [(8, 8), (22, 22)], 3: [(8, 8), (15, 15), (22, 22)], 4: [(8, 8), (22, 8), (8, 22), (22, 22)],
        5: [(8, 8), (22, 8), (15, 15), (8, 22), (22, 22)], 6: [(8, 7), (22, 7), (8, 15), (22, 15), (8, 23), (22, 23)]}


def dice(n):
    body = ''.join(f'<circle class="d-on" cx="{x}" cy="{y}" r="3.4"/>' for x, y in PIPS[n])
    return f'<svg class="fd mz die6" viewBox="-1 -1 32 32" aria-hidden="true"><rect class="die-face" x="0" y="0" width="30" height="30" rx="5"/>{body}</svg>'


def boxes(groups, size):
    return '<span class="gbx">' + ''.join(f'<b class="gb">{size}</b>' for _ in range(groups)) + '</span>'


CSS = """
.chip.face svg.mz.r1 { height: 1.15em; } .chip.face svg.mz.r2 { height: 2.05em; }
.chip.face svg.die6 { height: 2.05em; } .chip .die-face { fill: var(--paper); stroke: var(--ink); stroke-width: 1.6; }
.chip .gbx { display: inline-flex; flex-wrap: wrap; gap: .12em; max-width: 6.4em; justify-content: center; }
.chip .gb { display: inline-grid; place-items: center; min-width: 1.25em; height: 1.1em; padding: 0 .1em; border-radius: .25em;
  background: var(--lilac); border: 2px solid var(--ink); font-size: .74em; line-height: 1; }
.chip.opt-boxes .gbx { max-width: 7.6em; } .chip.opt-boxes .gb { font-size: .92em; }
.chip.opt-words { flex-wrap: wrap; justify-content: center; row-gap: .1em; } .chip.opt-words .gbx { flex-basis: 100%; max-width: none; }
"""

FW = '<span class="fw">{}</span>'
NUM = '<b class="fn">{}</b>'
OPTIONS = [
    # (option, case, track, level along the map, the hook's question, chip class, chip html)
    ('Dots A: rows of 5', '6', 'reception', 3, {'ask': 'dots', 'n': 6, 'value': 6}, 'face face-dots', rows_of(6, 5)),
    ('Dots A: rows of 5', '4', 'reception', 3, {'ask': 'dots', 'n': 4, 'value': 4}, 'face face-dots', rows_of(4, 5)),
    ('Dots B: dice', '6', 'reception', 3, {'ask': 'dots', 'n': 6, 'value': 6}, 'face face-dots', dice(6)),
    ('Dots B: dice', '4', 'reception', 3, {'ask': 'dots', 'n': 4, 'value': 4}, 'face face-dots', dice(4)),
    ('Dots C: rows of 3', '6', 'reception', 3, {'ask': 'dots', 'n': 6, 'value': 6}, 'face face-dots', rows_of(6, 3)),
    ('Dots C: rows of 3', '4', 'reception', 3, {'ask': 'dots', 'n': 4, 'value': 4}, 'face face-dots', rows_of(4, 3)),
    ('Groups A: words and boxes', '3 of 5', 'reception', 41, {'ask': 'groups', 'groups': 3, 'size': 5, 'value': 15},
     'face face-groups opt-words', NUM.format(3) + FW.format('groups of') + NUM.format(5) + boxes(3, 5)),
    ('Groups A: words and boxes', '5 of 10', 'reception', 41, {'ask': 'groups', 'groups': 5, 'size': 10, 'value': 50},
     'face face-groups opt-words', NUM.format(5) + FW.format('groups of') + NUM.format(10) + boxes(5, 10)),
    ('Groups B: boxes alone', '3 of 5', 'reception', 41, {'ask': 'groups', 'groups': 3, 'size': 5, 'value': 15},
     'face face-groups opt-boxes', boxes(3, 5)),
    ('Groups B: boxes alone', '5 of 10', 'reception', 41, {'ask': 'groups', 'groups': 5, 'size': 10, 'value': 50},
     'face face-groups opt-boxes', boxes(5, 10)),
]

SWAP = """([cls, html, css]) => { let st = document.getElementById('mk-css');
  if (!st) { st = document.createElement('style'); st.id = 'mk-css'; document.head.appendChild(st); } st.textContent = css;
  const c = document.getElementById('target-n'); c.className = 'chip ' + cls; c.innerHTML = html;
  dispatchEvent(new Event('resize')); }"""
MEASURE = """() => { const c = document.getElementById('target-n'), r = c.getBoundingClientRect();
  const ds = [...c.querySelectorAll('circle.d-on')].map((m) => { const b = m.getBoundingClientRect(); return Math.min(b.width, b.height); });
  const t = __test.state();
  return { chipH: Math.round(r.height), chipW: Math.round(r.width), minDot: ds.length ? Math.round(Math.min(...ds) * 10) / 10 : null,
    box: c.querySelector('.gb') ? Math.round(c.querySelector('.gb').getBoundingClientRect().height) : null,
    fall: Math.round(t.touchY - t.startY) }; }"""


def into_level(pg, track, level):
    pg.goto(f'{BASE}?track={track}&level={level}')
    pg.wait_for_timeout(1500)
    b = pg.locator('#play').bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)
    for _ in range(40):
        if pg.evaluate("window.__test && __test.state().screen === 'round' && __test.state().phase === 'fly'"):
            return True
        pg.wait_for_timeout(250)
    return False


def slug(s):
    return ''.join(ch if ch.isalnum() else '_' for ch in s)


def sheets(rows):
    from PIL import Image, ImageDraw
    for size, w, h in SIZES:
        rs = [r for r in rows if r['size'] == size]
        scale = 0.5 if size == 'pc' else 0.75 if size == 'sideways' else 0.8
        ims = [Image.open(f"{OUT}/{r['shot']}") for r in rs]
        ims = [i.resize((int(i.width * scale), int(i.height * scale))) for i in ims]
        cols = 2 if size != 'phone' else 4
        cw, ch = ims[0].width + 12, ims[0].height + 40
        n_rows = -(-len(ims) // cols)
        sheet = Image.new('RGB', (cols * cw + 12, n_rows * ch + 12), 'white')
        d = ImageDraw.Draw(sheet)
        for k, (r, im) in enumerate(zip(rs, ims)):
            x, y = 12 + (k % cols) * cw, 12 + (k // cols) * ch
            d.text((x, y), f"{r['option']} ({r['case']})", fill='black')
            extra = f"dot {r['minDot']} px" if r['minDot'] else f"box {r['box']} px"
            d.text((x, y + 13), f"{extra}, fall {r['fall']} px (now {r['fall_now']} px)", fill='black')
            sheet.paste(im, (x, y + 28))
        sheet.save(f'{OUT}/sheet-{size}.png')


os.makedirs(OUT, exist_ok=True)
if '--sheet' in sys.argv:
    with open(f'{OUT}/sketch.json', encoding='utf-8') as f:
        sheets(json.load(f))
    sys.exit(0)
rows = []
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for size, w, h in SIZES:
        ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=size != 'pc', has_touch=size != 'pc', device_scale_factor=1)
        pg = ctx.new_page()
        for option, case, track, level, T, cls, html in OPTIONS:
            into_level(pg, track, level)
            pg.evaluate('(T) => __test.aimAsk(T)', T)
            pg.wait_for_timeout(500)
            fall_now = pg.evaluate('() => { const t = __test.state(); return Math.round(t.touchY - t.startY); }')
            pg.evaluate(SWAP, [cls, html, CSS])
            pg.set_viewport_size({'width': w, 'height': h + 1})  # the stage's ResizeObserver measures the fall again,
            pg.wait_for_timeout(200)  # under the taller box, as the game will
            pg.set_viewport_size({'width': w, 'height': h})
            pg.wait_for_timeout(500)
            pg.evaluate('__test.freeze(true)')
            m = pg.evaluate(MEASURE)
            shot = f'{size}-{slug(option)}-{slug(case)}.png'
            pg.screenshot(path=f'{OUT}/{shot}')
            rows.append({'option': option, 'case': case, 'size': size, **m, 'fall_now': fall_now, 'shot': shot})
            print(f"{size:8} {option:26} {case:8} dot={m['minDot']} box={m['box']} chip {m['chipW']}x{m['chipH']} fall {m['fall']} (now {fall_now})")
        ctx.close()
    browser.close()
with open(f'{OUT}/sketch.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, indent=1)
sheets(rows)
