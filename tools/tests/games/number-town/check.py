"""Number Town release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". It checks the start of the game: making
an explorer, the Mayor's letter and walking into town. Its 3D searches load three.js from cdnjs
(set FG_THREE_JS to serve a local copy); the maker's own notes say phone fixes aren't built yet."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-number-town'
c = Check('number-town', OUT)


def into_town(pg, fr, name):
    fr.locator('#nameInput').fill('Sam')
    fr.locator('#goBtn').click(); pg.wait_for_timeout(800)
    fr.locator('#openLetter').click(); pg.wait_for_timeout(1200)
    pg.screenshot(path=f'{OUT}/2-{name}-letter.png')
    fr.locator('#exploreBtn').click(); pg.wait_for_timeout(1500)
    return fr.locator('#btnBackpack').is_visible() and not fr.locator('#letter').is_visible()


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Make an explorer, read the letter and walk into town, at the three sizes.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg, wait=3000)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: starts with "Make your explorer"', fr.locator('#maker').is_visible())
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/1-{name}-maker.png')
        c.check(f'{name}: into town', into_town(pg, fr, name))
        pg.screenshot(path=f'{OUT}/3-{name}-town.png')
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()

    # 2. Sound off: its beeps are silenced (P67), whatever its own Sound setting says.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg, wait=3000)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound and speech are silenced', quiet['flag'] and quiet['quietAudio'], quiet)
    c.check('sound off: plays as normal', into_town(pg, fr, 'muted'))
    ctx.close()

    # 3. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/number-town/original.html'); pg.wait_for_timeout(3000)
    c.check('runs on its own, as its maker made it', pg.locator('#maker').is_visible() and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
