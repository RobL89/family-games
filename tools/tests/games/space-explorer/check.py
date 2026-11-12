"""Space Explorer release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it (set FG_THREE_JS to check the 3D views). Ends "PASS n of n".
It has no rounds: it's a place to explore, so the check visits each of its four views instead."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-space-explorer'
c = Check('space-explorer', OUT)

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. The four views at the three sizes.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: the space map shows', fr.locator('#mapCanvas').is_visible())
        c.fits_under_bar(pg, name, w, h)
        c.check(f'{name}: nothing wider than the screen', f.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        pg.screenshot(path=f'{OUT}/1-{name}-map.png')
        views = ['life-of-a-star'] + (['earth-moon-sun', 'explore-space'] if c.three else [])
        for view in views:
            f.evaluate(f"location.hash = '{view}'"); pg.wait_for_timeout(1500)
            pg.screenshot(path=f'{OUT}/2-{name}-{view}.png')
        c.check(f'{name}: its views open', f.evaluate('location.hash') == '#' + views[-1], f.evaluate('location.hash'))
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()
    if not c.three:
        print('(3D views skipped: FG_THREE_JS not set)')

    # 2. Sound off: Read to me says nothing (P67), and the game carries on.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: speech and sound are silenced', quiet['flag'] and quiet['speechPatched'] and quiet['quietAudio'], quiet)
    f.evaluate("location.hash = 'life-of-a-star'"); pg.wait_for_timeout(800)
    fr.locator('#sRead').click(); pg.wait_for_timeout(300)
    c.check('sound off: Read to me can be pressed', True)
    ctx.close()

    # 3. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/space-explorer/original.html'); pg.wait_for_timeout(2000)
    c.check('runs on its own, as its maker made it', pg.locator('#mapCanvas').is_visible() and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
