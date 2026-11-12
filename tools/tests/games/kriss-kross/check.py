"""Kriss Kross release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n"."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-kriss-kross'
LISTS = {'p_sam': {'kriss-kross': [
    {'list_id': 'l1', 'title': 'Space', 'words': ['rocket', 'planet', 'comet', 'orbit', 'star']},
    {'list_id': 'l2', 'title': 'Pets', 'words': ['cat', 'rabbit', 'hamster', 'parrot']},
]}}
c = Check('kriss-kross', OUT, LISTS)


def solve_with_hints(fr):
    for _ in range(40):
        if 'solved' in (fr.locator('#grid').get_attribute('class') or ''):
            return True
        fr.locator('#hintBtn').click()
        fr.locator('#grid').page.wait_for_timeout(80)
    return 'solved' in (fr.locator('#grid').get_attribute('class') or '')


def state(pg, pid='p_sam'):
    return json.loads(pg.evaluate(f"localStorage.getItem('fg.state.{pid}.kriss-kross')") or 'null')


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Plays at the three sizes, starting on the child's default list (P38).
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: starts on the default list', fr.locator('#play').is_visible() and fr.locator('#pTitle').inner_text() == 'Space',
                fr.locator('#pTitle').inner_text())
        c.fits_under_bar(pg, name, w, h)
        c.check(f'{name}: nothing wider than the screen', f.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        pg.screenshot(path=f'{OUT}/1-{name}-play.png')
        ctx.close()

    # 2. A round: solve, Next list, the last list, then the child's own words (P66).
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg)
    c.check('solving with hints works', solve_with_hints(fr))
    pg.wait_for_timeout(300)
    nxt = fr.locator('[data-fg="next"]')
    c.check('Next list appears when solved', nxt.is_visible() and nxt.text_content() == 'Next list: Pets', nxt.text_content())
    c.check('the game shows its own end of round', fr.locator('#grid.solved').count() == 1)
    pg.screenshot(path=f'{OUT}/2-solved-next.png')
    c.check('stars off: nothing queued', (pg.evaluate("localStorage.getItem('fg.outbox')") or 'null') in ('null', '{"results":[],"achievements":[]}'))
    nxt.click(); pg.wait_for_timeout(800)
    c.check('Next builds the next list', fr.locator('#pTitle').inner_text() == 'Pets')
    fr.locator('#solBtn').click(); pg.wait_for_timeout(300)
    c.check('no Next after the last list', not nxt.is_visible())
    fr.locator('#printBtn').click(); pg.wait_for_timeout(200)
    c.check('print screen has the Print button (proposed)', fr.locator('[data-fg="print"]').is_visible())
    fr.locator('#backBtn').click()
    fr.locator('#editBtn').click(); pg.wait_for_timeout(200)
    card = fr.locator('[data-fg="lists"]')
    c.check('word screen shows the grown-ups\' lists', card.is_visible() and card.locator('button').count() == 2)
    fr.locator('#puzzleTitle').fill('My dinos')
    fr.locator('#wordInput').fill('trex\nraptor\ndinosaur\negg')
    fr.locator('#buildBtn').click(); pg.wait_for_timeout(800)
    saved = state(pg)
    c.check('the child\'s own list is saved per child', saved and saved['state']['own'][0] == {'title': 'My dinos', 'words': ['trex', 'raptor', 'dinosaur', 'egg']}, saved)
    fr.locator('#editBtn').click(); pg.wait_for_timeout(200)
    fr.locator('#wordInput').fill('rocket\nplanet\ncomet\norbit\nstar'); fr.locator('#puzzleTitle').fill('Space')
    fr.locator('#buildBtn').click(); pg.wait_for_timeout(800)
    c.check('a grown-ups\' list built by hand is not saved again', len(state(pg)['state']['own']) == 1)
    pg.screenshot(path=f'{OUT}/3-own-list.png')

    # 3. Next visit: own lists come back from the wrapper (fg:start), and another child has their own.
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(500)
    pg.click('[data-g="kriss-kross"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(2500)
    fr = pg.frame_locator('.wframe iframe')
    fr.locator('#editBtn').click(); pg.wait_for_timeout(200)
    mine = fr.locator('[data-fg="lists"] .btn.ghost')
    c.check('own list is back next time', mine.count() == 1 and mine.first.inner_text() == 'My dinos')
    pg.screenshot(path=f'{OUT}/4-lists-card.png')
    mine.first.click(); pg.wait_for_timeout(800)
    c.check('an own list builds from its button', fr.locator('#pTitle').inner_text() == 'My dinos')
    ctx.close()

    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg, player='p_alex')
    c.check('a child with no lists gets the word screen', fr.locator('#setup').is_visible() and not fr.locator('#play').is_visible())
    c.check('no lists card for a child with none', not fr.locator('[data-fg="lists"]').is_visible())
    ctx.close()

    # 4. Sound off: the game has no sounds; it still plays.
    ctx, pg = c.page(browser, 390, 844, True, muted=True)
    fr, f = c.open_game(pg)
    c.check('sound off: plays as normal', fr.locator('#play').is_visible())
    ctx.close()

    # 5. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/kriss-kross/original.html'); pg.wait_for_timeout(2000)
    c.check('runs on its own, as its maker made it', pg.locator('#setup').is_visible() and pg.locator('[data-fg]').count() == 0
            and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()

    # 6. With stars switched back on (P48), a solved round is queued as before (P30).
    ctx, pg = c.page(browser, 1366, 768, features=True)
    fr, f = c.open_game(pg)
    solve_with_hints(fr); pg.wait_for_timeout(500)
    queued = json.loads(pg.evaluate("localStorage.getItem('fg.outbox')") or '{"results":[]}')['results']
    c.check('stars on: a solved round is queued', any(r['game_id'] == 'kriss-kross' and 1 <= r['stars'] <= 3 for r in queued), queued)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
