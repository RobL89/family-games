"""Slow Sheet test (P81): the live Sheet takes 2.5 to 3 seconds to answer (timed 2026-11-13), and the
wrapper waits up to 3 seconds for it before sending fg:start. A game must still start in the wrapper,
with the child's name, and its progress must still reach the Sheet. With the bridge's old 1.5-second
wait every game ran on its own; this test fails on that.

Uses the stand-in Sheet from e2e_wrapper.py (answering like script 0.4.0), with every answer delayed.
From the repo root, with the test server running (python3 -m http.server 8123 --bind 127.0.0.1):
    python3 -B tools/tests/e2e_slow_sheet.py
Ends with "PASS n of n" or lists what failed.
"""
import asyncio
import json
import os
import re
import sys

os.environ['FG_SCRIPT'] = '0.4.0'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import e2e_wrapper as w  # noqa: E402  (its stand-in Sheet; importing it runs nothing)
from test_config import CONFIG_ROUTE, config_js  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

DELAY = float(os.environ.get('FG_SHEET_DELAY', '3.5'))  # seconds: longer than the wrapper's 3-second wait
results = []


def check(name, ok, detail=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))


async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        ctx = await browser.new_context(viewport={'width': 1280, 'height': 800})
        await ctx.add_init_script(f"localStorage.setItem('fg.familyCode', JSON.stringify('{w.CODE}'));")

        async def slow(route):
            await asyncio.sleep(DELAY)
            body = w.handle(json.loads(route.request.post_data or '{}'))
            await route.fulfill(status=200, content_type='application/json', body=json.dumps(body))
        await ctx.route(re.compile(r'https://script\.google\.com/.*'), slow)
        await ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
        cfg = config_js()  # the repo's switches as they are, with the test answer
        await ctx.route(CONFIG_ROUTE, lambda route: route.fulfill(status=200, content_type='text/javascript', body=cfg))
        pg = await ctx.new_page()

        # The launcher, so the device knows the players (its first read waits for the slow Sheet).
        await pg.goto(w.BASE)
        await pg.wait_for_timeout(int(DELAY * 1000) + 1500)

        # A game in the wrapper while the Sheet is slow.
        await pg.goto(w.BASE + 'play.html?game=wrapper-check&player=p_sam')
        game = pg.frame_locator('iframe')
        await pg.wait_for_timeout(6000)
        await game.locator('#go').click()  # Play shows what the game was given
        await pg.wait_for_timeout(300)
        facts = await game.locator('#facts').inner_text()
        check(f'with the Sheet taking {DELAY} s, the game starts in the wrapper, not on its own',
              'Running in the wrapper' in facts, facts[:120])
        check("the game is given the child's name", 'Sam' in facts, facts[:120])

        # Its progress still reaches the Sheet: finish the round, then ⌂ Home.
        await game.locator('#done').click()
        await pg.wait_for_timeout(500)
        await pg.click('#home')
        await pg.wait_for_timeout(int(DELAY * 1000) + 2000)
        saved = w.db['states'].get(('p_sam', 'wrapper-check'))
        check('its progress reached the Sheet after ⌂ Home', saved is not None, w.calls[-5:])
        await browser.close()

    passed = sum(results)
    print(f'\nPASS {passed} of {len(results)}' if passed == len(results) else f'\n{len(results) - passed} FAILED of {len(results)}')
    return passed == len(results)


if __name__ == '__main__':
    sys.exit(0 if asyncio.run(run()) else 1)
