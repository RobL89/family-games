"""Browser test for Monster Café, against the stand-in Sheet (no real Sheet is touched).
From the repo root: python3 -m http.server 8132 --bind 127.0.0.1
then: python3 tools/tests/e2e_monster-cafe.py <folder for screenshots>

Plays full rounds on phone (390x844) and PC (1280x800), checks the result and progress reach
the stand-in, and screenshots the settings variations and the café makeover shop.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from standin import make_db, new_page, set_setting
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/monster-cafe'
PORT = os.environ.get('PORT', '8132')
BASE = f'http://127.0.0.1:{PORT}/'
GAME = 'monster-cafe'
URL = BASE + f'games/{GAME}/index.html?player=p_sam'
os.makedirs(OUT, exist_ok=True)

errors = []
failures = []


def check(ok, what):
    print(('ok    ' if ok else 'FAIL  ') + what)
    if not ok:
        failures.append(what)


def info(pg):
    return pg.evaluate('window.__test.info()')


def wait_ordering(pg, timeout=15000):
    pg.wait_for_function("window.__test.info().phase === 'ordering'", timeout=timeout)
    return info(pg)


def give(pg, n):
    """Puts n on the tray (tap) or types n (pad), the way a child would."""
    i = info(pg)
    if i['mode'] == 'tap':
        while info(pg)['tray'] > 0:
            pg.dispatch_event('.tray-item', 'pointerdown')
        for _ in range(n):
            pg.dispatch_event('#jar', 'pointerdown')
    else:
        for _ in range(len(i['typed'])):
            pg.dispatch_event('[data-k="back"]', 'pointerdown')
        for d in str(n):
            pg.dispatch_event(f'[data-k="{d}"]', 'pointerdown')


def serve(pg):
    sel = '#bell' if info(pg)['mode'] == 'tap' else '[data-k="serve"]'
    pg.dispatch_event(sel, 'pointerdown')
    pg.wait_for_function("window.__test.info().phase !== 'ordering'", timeout=5000)


def wrong_number(answer, mode):
    if mode == 'tap':
        return answer + 1 if answer < 10 else answer - 1
    return answer + 1


def play_order(pg, plan):
    """plan: 'first' (right first time), 'retry' (wrong then right), 'shown' (wrong three times)."""
    i = wait_ordering(pg)
    if plan == 'first':
        give(pg, i['answer']); serve(pg)
    elif plan == 'retry':
        give(pg, wrong_number(i['answer'], i['mode'])); serve(pg)
        wait_ordering(pg)
        give(pg, i['answer']); serve(pg)
    else:
        for _ in range(3):
            wait_ordering(pg, 30000)
            give(pg, wrong_number(i['answer'], i['mode'])); serve(pg)
    return i


def finish_round(pg):
    pg.wait_for_selector('#end:not([hidden])', timeout=40000)
    pg.wait_for_timeout(1300)


def new_db(**settings):
    db = make_db()
    for k, v in settings.items():
        set_setting(db, GAME, k, v)
    return db


def open_game(browser, db, w, h, mobile, speed=4):
    pg = new_page(browser, db, w, h, mobile=mobile, errors=errors)
    pg.goto(URL)
    pg.wait_for_function('window.__test && window.__test.info().phase === "start"')
    pg.wait_for_timeout(700)
    pg.evaluate(f'window.__test.speed({speed})')
    return pg


def first_order_shot(browser, name, w, h, mobile, wait_kind=None, **settings):
    """Starts a round with these settings and screenshots the first order (and one of wait_kind)."""
    db = new_db(**settings)
    pg = open_game(browser, db, w, h, mobile)
    pg.click('#play')
    i = wait_ordering(pg)
    pg.evaluate('window.__test.speed(1)')
    pg.wait_for_timeout(700)
    pg.screenshot(path=f'{OUT}/{name}.png')
    pg.evaluate('window.__test.speed(4)')
    seen = [i]
    if wait_kind:
        for _ in range(12):
            if wait_kind(i):
                break
            give(pg, i['answer']); serve(pg)
            i = wait_ordering(pg)
            seen.append(i)
        pg.evaluate('window.__test.speed(1)')
        pg.wait_for_timeout(700)
        pg.screenshot(path=f'{OUT}/{name}-b.png')
    pg.context.close()
    return seen


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        # ---------- Phone, default settings: a full round, every order right first time ----------
        db = new_db()
        pg = open_game(browser, db, 390, 844, True)
        pg.screenshot(path=f'{OUT}/01-phone-start.png')
        check(pg.inner_text('#bank') == '0', 'start screen shows the coin jar total (0)')
        pg.click('#play')
        i = wait_ordering(pg)
        check(set(i['settings']['sums']) == {'add', 'take'} and i['settings']['answer_with'] == 'auto', 'default settings: add, take, auto')
        kinds, total = set(), i['total']
        check(total == 8, 'orders_per_round default 8')
        for n in range(total):
            i = play_order(pg, 'first')
            kinds.add(i['kind'])
            check(i['mode'] == 'tap', f'order {n + 1} {i["eq"]} answered with tap')
            nums = [x for x in i['eq'] if isinstance(x, int)] + [i['answer']]
            check(all(0 <= x <= 10 for x in nums), f'order {n + 1} numbers within 0 to 10')
            if n == 1:
                pg.wait_for_timeout(200)
        finish_round(pg)
        pg.screenshot(path=f'{OUT}/02-phone-end.png')
        end = info(pg)
        check(end['roundCoins'] == 24, f'8 right first time = 24 coins (got {end["roundCoins"]})')
        pg.wait_for_timeout(800)
        rows = [s for s in db['scores'] if s['game_id'] == GAME]
        check(len(rows) == 1 and rows[0]['stars'] == 3 and rows[0]['score'] == 24, f'score row reached the Sheet with 3 stars, score 24: {rows}')
        prog = db['progress'].get(('p_sam', GAME))
        check(bool(prog) and prog['data']['coins'] == 24 and sum(prog['data']['served'].values()) == 8,
              f'progress reached the Sheet: {prog and prog["data"]}')

        # Spend from the end screen: balloons (10) leaves 14; plant (15) is then too dear.
        pg.click('#shop-open2'); pg.wait_for_timeout(600)
        pg.click('[data-buy="balloons"]'); pg.wait_for_timeout(300)
        pg.click('[data-buy="plant"]'); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/03-phone-shop.png')
        i = info(pg)
        check(i['owned'] == ['balloons'] and i['coins'] == 14, f'bought balloons only (plant too dear): {i["owned"]}, coins {i["coins"]}')
        pg.click('#shop-close'); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{OUT}/04-phone-end-after-shop.png')
        pg.wait_for_timeout(600)
        prog = db['progress'].get(('p_sam', GAME))
        check(prog['data']['owned'] == i['owned'], f'decorations saved to the Sheet: {prog["data"]}')
        pg.context.close()

        # ---------- PC, default settings: a mixed round for 2 stars ----------
        db = new_db()
        db['progress'][('p_sam', GAME)] = {'data': {'coins': 5, 'owned': [], 'served': {}}, 'updated_at': '2026-10-28T10:00:00Z'}
        pg = open_game(browser, db, 1280, 800, False)
        pg.screenshot(path=f'{OUT}/10-pc-start.png')
        check(pg.inner_text('#bank') == '5', 'PC start shows saved coins (5)')
        pg.click('#play')
        plans = ['first', 'retry', 'first', 'shown', 'first', 'first', 'first', 'retry']
        for n, plan in enumerate(plans):
            if n == 1:
                i = wait_ordering(pg)
                pg.evaluate('window.__test.speed(1)'); pg.wait_for_timeout(500)
                pg.screenshot(path=f'{OUT}/11-pc-order.png')
                give(pg, wrong_number(i['answer'], i['mode']))
                pg.wait_for_timeout(500)
                pg.screenshot(path=f'{OUT}/12-pc-tray.png')
                serve(pg); pg.wait_for_timeout(900)
                pg.screenshot(path=f'{OUT}/13-pc-puzzled.png')
                pg.evaluate('window.__test.speed(4)')
                wait_ordering(pg)
                give(pg, i['answer']); serve(pg)
                pg.evaluate('window.__test.speed(1)'); pg.wait_for_timeout(2300)
                pg.screenshot(path=f'{OUT}/14-pc-happy.png')
                pg.evaluate('window.__test.speed(4)')
                continue
            if plan == 'shown':
                i = wait_ordering(pg)
                for k in range(2):
                    give(pg, wrong_number(i['answer'], i['mode'])); serve(pg)
                    if k == 1:
                        pg.wait_for_selector('.helper', timeout=8000)
                        pg.evaluate('window.__test.speed(1)'); pg.wait_for_timeout(2600)
                        pg.screenshot(path=f'{OUT}/15-pc-helper.png')
                        pg.evaluate('window.__test.speed(4)')
                    wait_ordering(pg, 30000)
                give(pg, wrong_number(i['answer'], i['mode'])); serve(pg)
                pg.wait_for_timeout(900)
                pg.screenshot(path=f'{OUT}/16-pc-shown.png')
                continue
            play_order(pg, plan)
        finish_round(pg)
        pg.screenshot(path=f'{OUT}/17-pc-end.png')
        end = info(pg)
        # 5 first (15) + 2 retries (2) + 1 shown (0) = 17 coins; 5/8 = 62% right first time = 2 stars
        check(end['rightFirst'] == 5 and end['roundCoins'] == 17, f'mixed round: 5 right first, 17 coins (got {end["rightFirst"]}, {end["roundCoins"]})')
        pg.wait_for_timeout(800)
        rows = [s for s in db['scores'] if s['game_id'] == GAME]
        check(len(rows) == 1 and rows[0]['stars'] == 2 and rows[0]['score'] == 17, f'PC score row: 2 stars, score 17: {rows}')
        prog = db['progress'].get(('p_sam', GAME))
        check(prog and prog['data']['coins'] == 22, f'PC progress coins 5 + 17 = 22: {prog and prog["data"]}')
        # Keyboard: Play again, then Enter with an empty tray does nothing, space adds, Enter serves.
        pg.click('#again')
        i = wait_ordering(pg)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
        check(info(pg)['phase'] == 'ordering', 'Enter with nothing on the tray does not serve')
        for _ in range(i['answer']):
            pg.keyboard.press('Space')
        pg.keyboard.press('Enter')
        pg.wait_for_function('window.__test.info().index === 1', timeout=15000)
        check(info(pg)['rightFirst'] == 1 and info(pg)['roundCoins'] == 3, f'keyboard: space to add, Enter to serve ({info(pg)})')
        pg.context.close()

        # ---------- Settings variations (screenshots) ----------
        seen = first_order_shot(browser, '20-phone-times-50', 390, 844, True,
                                wait_kind=lambda i: i['mode'] == 'pad',
                                sums='times', tables='2, 5, 10', max_number='50')
        check(all(x['kind'] == 'times' for x in seen), 'sums times: only times orders')
        check(any(x['mode'] == 'pad' for x in seen), 'max_number 50: pad used for answers over 10')
        check(all(x['eq'][2] in (2, 5, 10) or x['eq'][0] in (2, 5, 10) for x in seen), 'tables 2, 5, 10 used')
        first_order_shot(browser, '21-pc-times-50', 1280, 800, False,
                         wait_kind=lambda i: i['mode'] == 'pad', sums='times', tables='2, 5, 10', max_number='50')
        first_order_shot(browser, '22-land-times-50', 844, 390, True,
                         wait_kind=lambda i: i['mode'] == 'pad', sums='times', tables='2, 5, 10', max_number='50')

        seen = first_order_shot(browser, '23-phone-bonds', 390, 844, True, sums='bonds')
        check(seen[0]['kind'] == 'bonds' and seen[0]['eq'][4] == 10, f'sums bonds: make 10 ({seen[0]["eq"]})')
        first_order_shot(browser, '24-pc-bonds', 1280, 800, False, sums='bonds', bond_to='20', max_number='20')

        seen = first_order_shot(browser, '25-phone-missing', 390, 844, True,
                                wait_kind=lambda i: i['missing'], missing_number='TRUE')
        check(any(x['missing'] for x in seen), 'missing_number TRUE: a ? + 3 = 7 style order appears')
        first_order_shot(browser, '26-pc-missing', 1280, 800, False,
                         wait_kind=lambda i: i['missing'], missing_number='TRUE', sums='add, take, times', max_number='20')

        first_order_shot(browser, '27-phone-nopictures', 390, 844, True, pictures='FALSE')
        first_order_shot(browser, '28-pc-nopictures', 1280, 800, False, pictures='FALSE')

        first_order_shot(browser, '29-phone-share-double-half', 390, 844, True,
                         wait_kind=lambda i: i['kind'] == 'share', sums='share, double, half', tables='2, 3', max_number='12')

        # Patience: the heart meter drains and the monster leaves (not right first time).
        db = new_db(patience='20', orders_per_round='3')
        pg = open_game(browser, db, 390, 844, True, speed=1)
        pg.click('#play')
        wait_ordering(pg)
        pg.wait_for_timeout(6000)
        pg.screenshot(path=f'{OUT}/30-phone-patience.png')
        pg.evaluate('window.__test.speed(8)')
        pg.wait_for_function('window.__test.info().index === 1', timeout=20000)
        check(info(pg)['rightFirst'] == 0, 'patience ran out: monster left, not counted right first time')
        play_order(pg, 'first'); play_order(pg, 'first')
        finish_round(pg)
        pg.wait_for_timeout(800)
        rows = [s for s in db['scores'] if s['game_id'] == GAME]
        check(len(rows) == 1 and rows[0]['stars'] == 2, f'patience round: 2 of 3 right first = 2 stars: {rows}')
        pg.context.close()

        # ---------- Shop and café with decorations owned ----------
        for name, (w, h, m) in {'phone': (390, 844, True), 'pc': (1280, 800, False), 'land': (844, 390, True)}.items():
            db = new_db()
            db['progress'][('p_sam', GAME)] = {'data': {'coins': 75, 'owned': ['balloons', 'plant', 'lights', 'cat'], 'served': {'Pip': 2}},
                                               'updated_at': '2026-10-28T10:00:00Z'}
            pg = open_game(browser, db, w, h, m, speed=1)
            check(pg.inner_text('#bank') == '75', f'{name}: saved coins from the Sheet shown on start (75)')
            pg.screenshot(path=f'{OUT}/40-{name}-start-decorated.png')
            pg.click('#shop-open'); pg.wait_for_timeout(700)
            pg.screenshot(path=f'{OUT}/41-{name}-shop.png')
            pg.click('[data-buy="jukebox"]'); pg.wait_for_timeout(500)
            check(info(pg)['coins'] == 25 and 'jukebox' in info(pg)['owned'], f'{name}: bought the jukebox for 50')
            pg.click('#shop-close'); pg.wait_for_timeout(1500)
            box = pg.locator('[data-deco="jukebox"]').bounding_box()
            pg.click('[data-deco="jukebox"]', position={'x': box['width'] / 2, 'y': box['height'] * 0.2})
            pg.wait_for_timeout(500)
            check(pg.locator('.deco-jukebox.playing').count() == 1, f'{name}: tapping the jukebox plays a jingle')
            pg.screenshot(path=f'{OUT}/42-{name}-jukebox.png')
            pg.wait_for_timeout(500)
            check(db['progress'][('p_sam', GAME)]['data']['owned'][-1] == 'jukebox', f'{name}: jukebox saved to the Sheet')
            pg.context.close()

        # ---------- Reduced motion and a hidden tab still work ----------
        db = new_db(orders_per_round='3')
        ctx_pg = new_page(browser, db, 390, 844, mobile=True, errors=errors)
        ctx_pg.emulate_media(reduced_motion='reduce')
        ctx_pg.goto(URL)
        ctx_pg.wait_for_function('window.__test && window.__test.info().phase === "start"')
        ctx_pg.evaluate('window.__test.speed(4)')
        ctx_pg.click('#play')
        for _ in range(3):
            play_order(ctx_pg, 'first')
        finish_round(ctx_pg)
        check(ctx_pg.is_visible('#end'), 'reduced motion: round still completes')
        ctx_pg.context.close()

        browser.close()


run()
print('\nconsole/page errors:')
print('\n'.join(errors) or 'none')
print(f'\n{len(failures)} failed' if failures else '\nall checks passed')
sys.exit(1 if failures or errors else 0)
