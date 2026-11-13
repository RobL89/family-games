"""Spike for Q-039 (stage 3, D-120): does Rocket Lander fit under the wrapper's bar? Version 1.0.

Opens Rocket Lander through P-020's live wrapper (play.html) at contract 0.4's three sizes, on the
harness's stand-in Sheet with made-up players, and for each size: screenshots of the map and of a
round in flight, and the numbers that say whether it is cramped: the frame below the bar, the line's
label size, how many numbers are written, and whether the ground and the target chip are inside the
frame. The same game opened on its own at the full size is measured alongside, to compare.

games.json isn't P-034's (D-113): the test browser is served a copy with a `testing` entry for
rocket-lander added, and the repo's file is not changed.

Run from the repo root with the site served (see harness.py):
    python3 -B tools/tests/games/spike_rocket_lander_fit.py /tmp/fit
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import BASE, SIZES, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fit'
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ENTRY = {'id': 'rocket-lander', 'title': 'Rocket Lander', 'icon': 'g-planet', 'colour': '#5B4CC4',
         'folder': 'games/rocket-lander/', 'status': 'testing'}


def games_json():
    with open(os.path.join(REPO, 'games.json'), encoding='utf-8') as f:
        d = json.load(f)
    if not any(g.get('id') == 'rocket-lander' for g in d['games']):
        d['games'].insert(0, ENTRY)
    return json.dumps(d)


MEASURE = """() => { const t = window.__test && __test.state(); const q = (s) => { const e = document.querySelector(s);
  if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
  return { vw: innerWidth, vh: innerHeight, screen: t && t.screen, labelSize: t && t.labelSize, labels: t && t.labels.length,
    line: t && t.line, ground: t && Math.round(t.touchY), start: t && Math.round(t.startY), fall: t && t.fall,
    hud: q('#hud'), mapBar: q('#map-bar'), home: (() => { const b = [...document.querySelectorAll('button[aria-label="Back to games"]')][0];
      return b && !b.hidden ? b.getBoundingClientRect().toJSON() : null; })() }; }"""


def into_round(pg, f):
    """A real tap on Play by the waiting rocket (it bobs, so no waiting for it to be still)."""
    b = f.locator('#play').bounding_box()  # in the page's own pixels, frame or not
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)
    pg.wait_for_timeout(1800)


c = Check('rocket-lander', OUT)
rows = []
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for name, w, h, mobile in SIZES:
        # In the wrapper
        ctx, pg = c.page(browser, w, h, mobile)
        body = games_json()
        ctx.route(re.compile(r'.*/games\.json(\?.*)?$'), lambda route: route.fulfill(status=200, content_type='application/json', body=body))
        fr, f = c.open_game(pg, wait=7000)  # the game doesn't speak to the wrapper yet: the cover stays its 6 s
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/{name}-1-map-wrapper.png')
        m_map = f.evaluate(MEASURE)
        into_round(pg, f)
        pg.screenshot(path=f'{OUT}/{name}-2-round-wrapper.png')
        m_round = f.evaluate(MEASURE)
        bar = pg.evaluate("document.querySelector('.wbar').getBoundingClientRect().height")
        ctx.close()
        # On its own, the whole screen
        ctx, pg = c.page(browser, w, h, mobile)
        pg.goto(BASE + 'games/rocket-lander/index.html')
        pg.wait_for_timeout(2500)
        alone_map = pg.evaluate(MEASURE)
        into_round(pg, pg)
        pg.screenshot(path=f'{OUT}/{name}-3-round-alone.png')
        alone = pg.evaluate(MEASURE)
        ctx.close()
        rows.append({'size': name, 'w': w, 'h': h, 'bar': bar, 'wrapper_map': m_map, 'wrapper_round': m_round,
                     'alone_map': alone_map, 'alone_round': alone})
        # The tallest question faces: a picture to count (moon-3) and a dice line (moon-4), in the wrapper
        if name == 'sideways':
            ctx, pg = c.page(browser, w, h, mobile)
            ctx.route(re.compile(r'.*/games\.json(\?.*)?$'), lambda route: route.fulfill(status=200, content_type='application/json', body=body))
            fr, f = c.open_game(pg, wait=7000)
            for lid in ('moon-3', 'moon-4'):
                f.evaluate(f"__test.begin({{ level: '{lid}' }})")
                pg.wait_for_timeout(600)
                into_round(pg, f)
                pg.screenshot(path=f'{OUT}/{name}-4-{lid}-wrapper.png')
                r = f.evaluate(MEASURE)
                rows.append({'size': f'{name} {lid}', 'wrapper_round': r})
                print(f"{name} {lid}: fall {r['start']}->{r['ground']} px, labels {r['labels']} at {r['labelSize']} px, hud {r['hud']}")
                c.check(f'{name} {lid}: the rocket has room to fall (at least 60 px)', r['ground'] - r['start'] >= 60, r)
                f.evaluate("__test.speed(20)"); pg.wait_for_timeout(9000)
                f.evaluate("document.querySelector('#to-map') && document.querySelector('#to-map').click()"); pg.wait_for_timeout(1500)
            ctx.close()
        c.check(f'{name}: ground inside the frame', m_round['ground'] and m_round['ground'] < m_round['vh'], m_round)
        c.check(f'{name}: as many numbers written as on its own', m_round['labels'] == alone['labels'],
                f"{m_round['labels']} against {alone['labels']}")
    browser.close()

with open(f'{OUT}/fit.json', 'w', encoding='utf-8') as fh:
    json.dump(rows, fh, indent=1)
for r in rows:
    if 'alone_round' not in r:
        continue
    a, b = r['wrapper_round'], r['alone_round']
    print(f"{r['size']}: bar {r['bar']:.0f} px; frame {a['vw']}x{a['vh']} (alone {b['vw']}x{b['vh']}); "
          f"labels {a['labels']} at {a['labelSize']} px (alone {b['labels']} at {b['labelSize']} px); "
          f"fall {a['start']}->{a['ground']} px (alone {b['start']}->{b['ground']}); line {a['line']}")
c.finish()
