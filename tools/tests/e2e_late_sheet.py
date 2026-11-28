"""Late Sheet test (P92): the wrapper waits up to 3 seconds for the child's profile, then starts the
game anyway. Found live on 2026-11-28 (Hamster Highway): a device without the child's latest
progress started the game as new, and its first save, being the newest, could replace the real
progress in the Sheet. Here the Sheet answers after 6 seconds:
  A. the Sheet has newer progress, the child plays a little first: the Sheet keeps its progress, and
     the game restarts with it;
  B. the same, but the child presses ⌂ Home before the Sheet answers: the Sheet keeps its progress,
     and the game opens with it next time;
  C. the Sheet has nothing newer: no restart, and the child's play reaches the Sheet.
Fails on the wrapper before P92 (A and B: the Sheet's progress is replaced).

Uses the stand-in Sheet from e2e_wrapper.py (answering like script 0.4.0) and the Wrapper check game.
From the repo root, with the test server running (python3 -m http.server 8123 --bind 127.0.0.1):
    python3 -B tools/tests/e2e_late_sheet.py
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

LATE = 6.0     # seconds the Sheet takes to answer: well past the wrapper's 3-second wait
EARLIER = '2026-11-20T09:00:00.000Z'  # when the other device saved the real progress
results = []
delay = {'s': 0.0}


def check(name, ok, detail=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))


def sheet_rounds(pid):
    s = w.db['states'].get((pid, 'wrapper-check'))
    return s and s['state'] and s['state'].get('rounds')


async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()

        async def device():
            ctx = await browser.new_context(viewport={'width': 1280, 'height': 800})
            await ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{w.CODE}'));"
                                      " localStorage.setItem('fg.testing', 'true');")

            async def sheet(route):
                body = json.loads(route.request.post_data or '{}')
                if delay['s']:
                    await asyncio.sleep(delay['s'])
                answer = w.handle(body)  # answered as it arrives, like the live Sheet
                await route.fulfill(status=200, content_type='application/json', body=json.dumps(answer))
            await ctx.route(re.compile(r'https://script\.google\.com/.*'), sheet)
            await ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
            cfg = config_js()
            await ctx.route(CONFIG_ROUTE, lambda route: route.fulfill(status=200, content_type='text/javascript', body=cfg))
            pg = await ctx.new_page()
            # The launcher with a quick Sheet: the device knows the children, but not the progress below.
            delay['s'] = 0.0
            await pg.goto(w.BASE)
            await pg.wait_for_timeout(1500)
            return ctx, pg

        async def facts(game):
            await game.locator('#go').click()
            await pg_wait(300)
            return await game.locator('#facts').inner_text()

        async def pg_wait(ms):
            await asyncio.sleep(ms / 1000)

        # A. Newer progress in the Sheet; the child finishes a round before the Sheet answers.
        ctx, pg = await device()
        w.db['states'][('p_sam', 'wrapper-check')] = {'state': {'rounds': 7}, 'at': EARLIER}
        delay['s'] = LATE
        await pg.goto(w.BASE + 'play.html?game=wrapper-check&player=p_sam')
        game = pg.frame_locator('iframe')
        await pg.wait_for_timeout(4200)  # the game has started without the Sheet's answer
        first = await facts(game)
        check('A: the game starts before the Sheet answers, without its progress',
              'Running in the wrapper' in first and 'Rounds finished before: 0' in first, first[:200])
        await game.locator('#done').click()  # a save made from nothing
        await pg.wait_for_timeout(int(LATE * 1000) * 2 + 2000)  # the answer, and any save sent meanwhile
        check("A: the Sheet keeps the child's real progress", sheet_rounds('p_sam') == 7, w.db['states'])
        delay['s'] = 0.0
        await pg.wait_for_timeout(1500)
        again = await facts(game)
        check("A: the game has restarted with the Sheet's progress", 'Rounds finished before: 7' in again, again[:200])
        await game.locator('#done').click()
        await pg.wait_for_timeout(500)
        await pg.click('#home')
        await pg.wait_for_timeout(2500)
        check('A: playing on from there reaches the Sheet', sheet_rounds('p_sam') == 8, w.db['states'])
        await ctx.close()

        # B. The same, but ⌂ Home before the Sheet answers.
        w.db['states'][('p_sam', 'wrapper-check')] = {'state': {'rounds': 7}, 'at': EARLIER}
        ctx, pg = await device()
        delay['s'] = LATE
        await pg.goto(w.BASE + 'play.html?game=wrapper-check&player=p_sam')
        game = pg.frame_locator('iframe')
        await pg.wait_for_timeout(4200)
        await facts(game)
        await game.locator('#done').click()
        await pg.wait_for_timeout(300)
        await pg.click('#home')  # the launcher's own refresh is slow too
        await pg.wait_for_timeout(int(LATE * 1000) * 3 + 2000)
        check("B: ⌂ Home before the Sheet answers: the Sheet keeps the child's real progress", sheet_rounds('p_sam') == 7, w.db['states'])
        delay['s'] = 0.0
        await pg.goto(w.BASE + 'play.html?game=wrapper-check&player=p_sam')
        game = pg.frame_locator('iframe')
        await pg.wait_for_timeout(2000)
        nxt = await facts(game)
        check("B: next time the game opens with the Sheet's progress", 'Rounds finished before: 7' in nxt, nxt[:200])
        await ctx.close()

        # C. Nothing newer in the Sheet: no restart, and the round reaches the Sheet.
        w.db['states'].pop(('p_alex', 'wrapper-check'), None)
        ctx, pg = await device()
        delay['s'] = LATE
        await pg.goto(w.BASE + 'play.html?game=wrapper-check&player=p_alex')
        game = pg.frame_locator('iframe')
        await pg.wait_for_timeout(4200)
        await facts(game)
        await game.locator('#done').click()
        await pg.wait_for_timeout(int(LATE * 1000) + 1500)
        delay['s'] = 0.0
        check('C: nothing newer in the Sheet: no restart (the round-over screen stays)',
              await game.locator('#end').is_visible(), await game.locator('body').inner_text())
        await pg.wait_for_timeout(2500)
        await pg.click('#home')
        await pg.wait_for_timeout(2500)
        check("C: the child's round reaches the Sheet", sheet_rounds('p_alex') == 1, w.db['states'])
        unchecked = await pg.evaluate("Object.keys(localStorage).filter(k => k.startsWith('fg.unchecked.'))")
        check('C: no start is left marked unchecked', unchecked == [], unchecked)
        await ctx.close()
        await browser.close()

    passed = sum(results)
    print(f'\nPASS {passed} of {len(results)}' if passed == len(results) else f'\n{len(results) - passed} FAILED of {len(results)}')
    return passed == len(results)


if __name__ == '__main__':
    sys.exit(0 if asyncio.run(run()) else 1)
