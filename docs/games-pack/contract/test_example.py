"""Plays the example game through the fake shell, as a pattern for each game's own test.
DRAFT, proposed in the games pack (INTEGRATION.md, section 9).

    cd docs/games-pack                      (or the unzipped pack folder)
    python3 -m http.server 8150 &
    python3 contract/test_example.py 8150 [folder for screenshots]

Needs Python Playwright. Prints PASS or FAIL for each check, then a total.
"""
import sys
from playwright.sync_api import sync_playwright

PORT = sys.argv[1] if len(sys.argv) > 1 else '8150'
OUT = sys.argv[2] if len(sys.argv) > 2 else None
BASE = f'http://127.0.0.1:{PORT}/contract/'
results = []


def check(name, ok):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name)


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for label, size in [('phone', '390x844'), ('sideways', '844x390'), ('pc', '1366x768')]:
        errors = []
        pg = browser.new_page(viewport={'width': 1800, 'height': 900})
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        pg.goto(BASE + f'fake-shell.html?game=example/game.html&size={size}&level=2')
        pg.wait_for_function('window.__shell.starts.length === 1')
        game = pg.frame_locator('#frame')
        game.locator('#go').click()
        check(f'{label}: the game got the level and the word list',
              'level 2' in game.locator('#who').inner_text() and 'Test week' in game.locator('#word').inner_text())
        game.locator('[data-stars="3"]').click()
        pg.wait_for_function('window.__shell.rounds.length === 1')
        r = pg.evaluate('window.__shell.rounds[0]')
        check(f'{label}: one fg:round with 3 stars and the list as detail', r['stars'] == 3 and r['detail'] == 'Test week')
        check(f'{label}: the shell panel shows, the game shows no end card of its own',
              pg.is_visible('#panel') and not game.locator('#own-end').is_visible())
        check(f'{label}: no Next with only one list', not pg.is_visible('#next'))
        if OUT:
            pg.locator('#device').screenshot(path=f'{OUT}/fake-shell-{label}.png')
        pg.click('#again')
        pg.wait_for_function('window.__shell.starts.length === 2')
        check(f'{label}: Again starts a round without the Play screen',
              pg.evaluate("window.__shell.starts[1].round") == 'again' and game.locator('#game').is_visible())
        game.locator('[data-stars="0"]').click()
        pg.wait_for_function('window.__shell.rounds.length === 2')
        check(f'{label}: "show the answer" is reported as 0 stars', pg.evaluate('window.__shell.rounds[1].stars') == 0)
        check(f'{label}: no errors', not errors)
        pg.close()

    # Two lists: Next appears and moves to the second list.
    pg = browser.new_page(viewport={'width': 1800, 'height': 900})
    pg.goto(BASE + 'fake-shell.html?game=example/game.html&lists=[{"title":"Week 1","words":["cat"]},{"title":"Week 2","words":["dog"]}]')
    pg.wait_for_function('window.__shell.starts.length === 1')
    game = pg.frame_locator('#frame')
    game.locator('#go').click()
    game.locator('[data-stars="1"]').click()
    pg.wait_for_function('window.__shell.rounds.length >= 1')
    check('two lists: Next shows', pg.is_visible('#next'))
    pg.click('#next')
    pg.wait_for_function("window.__shell.starts.some(s => s.round === 'next')")
    try:
        game.locator('#word', has_text='Week 2').wait_for(timeout=3000)
        moved = True
    except Exception:
        moved = False
    check('two lists: Next moves to Week 2', moved)
    pg.close()

    # A grown-up setting beats the level; sound off reaches the game.
    pg = browser.new_page()
    pg.goto(BASE + 'fake-shell.html?game=example/game.html&level=3&sound=0&settings={"rounds":1}')
    pg.wait_for_function('window.__shell.starts.length === 1')
    who = pg.frame_locator('#frame').locator('#who').inner_text()
    check('a setting beats the level, and sound off arrives', 'rounds 1' in who and 'sound off' in who)
    pg.close()

    # Standalone: no shell, the game uses its defaults and draws its own end card.
    pg = browser.new_page(viewport={'width': 390, 'height': 844})
    pg.goto(BASE + 'example/game.html')
    pg.click('#go')
    check('standalone: built-in words and level 1', 'Built-in words' in pg.inner_text('#word') and 'level 1' in pg.inner_text('#who'))
    pg.click('[data-stars="3"]')
    check('standalone: the game shows its own end card', pg.is_visible('#own-end'))
    browser.close()

print(f"\n{'PASS' if all(results) else 'FAIL'} {sum(results)} of {len(results)}")
sys.exit(0 if all(results) else 1)
