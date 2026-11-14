"""Measure Rocket Lander's picture faces: how big each dot (or counter, sweet, block) is on screen and
how many there are, at the launcher's three sizes. Version 1.0 (trial feedback, 14 Nov 2026: "the dots
are too small and there can be too many").

For each level that shows things to count, the largest case the level can ask is set with the game's
own test hooks (aimAsk, aimSum), the game is frozen, and the chip at the top is measured and
screenshotted. Stand-in: the game is opened on its own in a page the size of the wrapper's frame (the
screen less P-020's 56 px bar), not inside P-020's wrapper.

Run from the repo root with the site served on 127.0.0.1:8123:
    python3 -B tools/tests/games/measure_rocket_faces.py /tmp/faces
Writes faces.json and one screenshot per case and size to the folder, then sheet.png: the cases named
in WORST, upright and sideways side by side. `--sheet` remakes sheet.png from a folder already measured.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/faces'
BASE = 'http://127.0.0.1:8123/games/rocket-lander/index.html'
BAR = 56
SIZES = [('phone', 390, 844 - BAR), ('sideways', 844, 390 - BAR), ('pc', 1366, 768 - BAR)]

# (case, track, level along the map, hook, args): the largest each level asks (map.js rows)
CASES = [
    ('R03 dots 10', 'reception', 3, 'aimAsk', [{'ask': 'dots', 'n': 10, 'value': 10}]),
    ('R03 dots 7', 'reception', 3, 'aimAsk', [{'ask': 'dots', 'n': 7, 'value': 7}]),
    ('R03 dots 4', 'reception', 3, 'aimAsk', [{'ask': 'dots', 'n': 4, 'value': 4}]),
    ('R04 quick look 5', 'reception', 5, 'aimAsk', [{'ask': 'flash', 'n': 5, 'value': 5, 'look': 0, 'ms': 600000}]),
    ('R05 compare 9', 'reception', 6, 'aimAsk', [{'rule': 'range', 'ask': 'compare', 'rel': 'more', 'n': 9}]),
    ('R08 make 5', 'reception', 10, 'aimAsk', [{'ask': 'bond', 'whole': 5, 'part': 3, 'value': 2}]),
    ('R09 sum 4 + 5', 'reception', 11, 'aimSum', [4, '+', 1]),
    ('R10 take 5 - 2', 'reception', 12, 'aimSum', [5, '−', 2]),
    ('R11 double 5', 'reception', 13, 'aimAsk', [{'ask': 'double', 'n': 5, 'value': 10}]),
    ('R12 make 10', 'reception', 15, 'aimAsk', [{'ask': 'bond', 'whole': 10, 'part': 6, 'value': 4}]),
    ('R16 share 10', 'reception', 22, 'aimAsk', [{'ask': 'share', 'total': 10, 'groups': 2, 'value': 5}]),
    ('Y1-12 groups 5 of 10', 'reception', 41, 'aimAsk', [{'ask': 'groups', 'groups': 5, 'size': 10, 'value': 50}]),
    ('Y1-13 share 20 by 10', 'reception', 42, 'aimAsk', [{'ask': 'share', 'total': 20, 'groups': 10, 'value': 2}]),
    ('Y1-15 half of 20', 'reception', 45, 'aimAsk', [{'ask': 'frac-of', 'num': 1, 'den': 2, 'total': 20, 'value': 10}]),
    ('X-doubles20 double 10', 'reception', 46, 'aimAsk', [{'ask': 'double', 'n': 10, 'value': 20}]),
    ('X-doubles20 half 20', 'reception', 46, 'aimAsk', [{'ask': 'half', 'n': 20, 'value': 10}]),
    ('Y2-01 tens 99', 'year2', 1, 'aimAsk', [{'ask': 'place', 'n': 99, 'value': 99}]),
    ('Y2-20 quarter of 20', 'year2', 23, 'aimAsk', [{'ask': 'frac-of', 'num': 1, 'den': 4, 'total': 20, 'value': 5}]),
    ('Y3-02 999 chart', 'year2', 26, 'aimAsk', [{'ask': 'place', 'n': 999, 'value': 999}]),
]

MEASURE = """() => { const c = document.getElementById('target-n'); const r = c.getBoundingClientRect();
  const marks = [...c.querySelectorAll('circle.d-on, circle.d-empty, circle.d-gone, circle.sw, circle.pc-h, circle.pc-t, circle.pc-o, rect.pv-one, rect.pv-ten')];
  const ds = marks.map((m) => { const b = m.getBoundingClientRect(); return Math.min(b.width, b.height); });
  return { chipW: Math.round(r.width), chipH: Math.round(r.height), marks: marks.length,
    minMark: ds.length ? Math.round(Math.min(...ds) * 10) / 10 : null, cls: c.className,
    box: { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), width: r.width + 12, height: r.height + 12 } }; }"""


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


WORST = ['R03 dots 10', 'R05 compare 9', 'R11 double 5', 'Y1-12 groups 5 of 10', 'Y1-13 share 20 by 10',
         'X-doubles20 double 10', 'Y2-01 tens 99', 'Y2-20 quarter of 20']


def sheet(rows):
    from PIL import Image, ImageDraw
    pick = [(c, [r for r in rows if r['case'] == c and r['size'] in ('phone', 'sideways')]) for c in WORST]
    ims = {(r['case'], r['size']): Image.open(f"{OUT}/{r['shot']}") for _, rs in pick for r in rs}
    cw = max(i.width for (c, s), i in ims.items() if s == 'phone') + 16
    sw = max(i.width for (c, s), i in ims.items() if s == 'sideways')
    hs = [max(ims[(c, 'phone')].height, ims[(c, 'sideways')].height) + 34 for c, _ in pick]
    img = Image.new('RGB', (cw + sw + 16, sum(hs) + 24), 'white')
    d = ImageDraw.Draw(img)
    d.text((8, 4), 'Upright phone', fill='black')
    d.text((cw + 8, 4), 'Sideways phone', fill='black')
    y = 24
    for (c, rs), h in zip(pick, hs):
        r0 = {r['size']: r for r in rs}
        d.text((8, y), f"{c}: {r0['phone']['marks']} to count, smallest {r0['phone']['minMark']} px upright, {r0['sideways']['minMark']} px sideways", fill='black')
        img.paste(ims[(c, 'phone')], (8, y + 16))
        img.paste(ims[(c, 'sideways')], (cw + 8, y + 16))
        y += h
    img.save(f'{OUT}/sheet.png')


os.makedirs(OUT, exist_ok=True)
if '--sheet' in sys.argv:
    with open(f'{OUT}/faces.json', encoding='utf-8') as f:
        sheet(json.load(f))
    sys.exit(0)
rows = []
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for size, w, h in SIZES:
        ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=size != 'pc', has_touch=size != 'pc', device_scale_factor=1)
        pg = ctx.new_page()
        for name, track, level, hook, args in CASES:
            ok = into_level(pg, track, level)
            got = pg.evaluate(f'(a) => __test.{hook}(...a)', args) if ok else False
            pg.wait_for_timeout(600)
            pg.evaluate('__test.freeze(true)')
            m = pg.evaluate(MEASURE)
            shot = f"{OUT}/{size}-{name.split(' ')[0]}-{name.replace(' ', '_').replace('/', '')}.png"
            pg.screenshot(path=shot, clip=m.pop('box'))
            rows.append({'case': name, 'size': size, 'hooked': bool(got), **m, 'shot': os.path.basename(shot)})
            print(f"{size:8} {name:24} hooked={bool(got)!s:5} marks={m['marks']:3} smallest={m['minMark']} px  chip {m['chipW']}x{m['chipH']}")
        ctx.close()
    browser.close()
with open(f'{OUT}/faces.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, indent=1)
sheet(rows)
