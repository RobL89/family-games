"""Stage 2 browser test: stars and stickers switched off, skins free, the testing status, and the
wrapper (play.html) with its messages (game contract 0.4). Runs against a stand-in for the Apps
Script; no real Sheet is touched, and the grown-ups' answer is a test one (test_config.py).

Needs Python Playwright. From the repo root:
    python3 -m http.server 8123 --bind 127.0.0.1
then:
    python3 -B tools/tests/e2e_wrapper.py <folder for screenshots>
Ends with "PASS n of n" or lists what failed.
"""
import json
import os
import re
import sys
import uuid

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import TEST_ANSWER, route_config  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-wrapper-shots'
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
os.makedirs(OUT, exist_ok=True)

# ---- Stand-in Sheet: the same answers as apps-script/Code.gs 0.3.0, skin check included ----
db = {
    'profiles': [
        {'profile_id': 'p_sam', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#2E8FD0', 'skin': 'sticker'},
        {'profile_id': 'p_alex', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'skin': 'sticker'},
    ],
    'skins': [
        {'skin_id': 'sticker', 'name': 'Sticker book', 'stars_needed': 0},
        {'skin_id': 'fairy', 'name': 'Fairy', 'stars_needed': 10},
        {'skin_id': 'blocks', 'name': 'Blocks', 'stars_needed': 20},
        {'skin_id': 'unicorn', 'name': 'Unicorn', 'stars_needed': 30},
    ],
    'scores': [],
    'lists': {'p_sam': {'kriss-kross': [{'list_id': 'l1', 'title': 'Animals', 'words': ['cat', 'dog', 'hen']},
                                        {'list_id': 'l2', 'title': 'Colours', 'words': ['red', 'blue']}]}},
}
calls = []


def handle(body):
    if body.get('code') != CODE:
        return {'ok': False, 'error': 'wrong_code'}
    a = body.get('action')
    calls.append(a)
    if a == 'ping':
        return {'ok': True, 'version': '0.3.0'}
    if a == 'profiles':
        return {'ok': True, 'version': '0.3.0', 'profiles': db['profiles'], 'skins': db['skins']}
    if a == 'profile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        return {'ok': True, 'profile': p, 'recent': [], 'achievements': [], 'lists': db['lists'].get(p['profile_id'], {}),
                'stats': {'total_plays': 0, 'stars_total': 0, 'games': {}, 'days_played': []}}
    if a == 'updateProfile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        if 'skin' in body:
            sk = next((s for s in db['skins'] if s['skin_id'] == body['skin']), None)
            if not sk:
                return {'ok': False, 'error': 'no_such_skin'}
            if sk['stars_needed'] > 0:  # no stars any more, so only the free one passes the 0.3.0 check
                return {'ok': False, 'error': 'skin_locked'}
        for k in ('nickname', 'avatar', 'colour', 'skin'):
            if k in body:
                p[k] = body[k]
        return {'ok': True, 'profile': p}
    if a == 'addProfile':
        p = {'profile_id': 'p_' + uuid.uuid4().hex[:10], 'nickname': body['nickname'], 'avatar': body.get('avatar', 'fox'),
             'colour': body.get('colour', '#F07A2A'), 'skin': 'sticker'}
        db['profiles'].append(p)
        return {'ok': True, 'profile': p}
    if a == 'sync':
        db['scores'] += body.get('results', [])
        return {'ok': True, 'accepted': [r['event_id'] for r in body.get('results', [])], 'duplicates': [], 'rejected': [],
                'achievements_recorded': []}
    return {'ok': False, 'error': 'unknown_action'}


results = []
errors = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        def new_page(w, h, mobile=False, testing=False):
            ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile,
                                      device_scale_factor=2 if mobile else 1)
            ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));"
                                + ("localStorage.setItem('fg.testing', 'true');" if testing else ''))
            ctx.route(re.compile(r'https://script\.google\.com/.*'),
                      lambda route: route.fulfill(status=200, content_type='application/json',
                                                  body=json.dumps(handle(json.loads(route.request.post_data or '{}')))))
            ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
            route_config(ctx)  # the repo's switches as they are, with the test answer
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
            pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
                  if m.type in ('error', 'warning') and 'fonts' not in m.text and 'ERR_FAILED' not in m.text else None)
            return ctx, pg

        # ---------- Home with the switches off (P48, P49) ----------
        ctx, pg = new_page(390, 844, mobile=True)
        pg.goto(BASE + 'index.html'); pg.wait_for_selector('.player')
        pg.click('[data-p="p_sam"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{OUT}/01-phone-home.png', full_page=True)
        check('no star total', pg.locator('.total').count() == 0)
        check('no sticker slots', pg.locator('.slot').count() == 0)
        check('no "Last played"', pg.locator('.minis, .mini').count() == 0 and 'Last played' not in pg.inner_text('.home'))
        check('no stars on tiles', pg.locator('.tile .stars').count() == 0)
        check('no locked skins', pg.locator('.skin.locked, .lockmark').count() == 0 and pg.locator('.progress').count() == 0)
        check('four skins to pick', pg.locator('button[data-skin]').count() == 4)
        check('testing game hidden without the switch', pg.locator('[data-g="wrapper-check"]').count() == 0)
        kk = pg.get_attribute('[data-g="kriss-kross"]', 'href') or ''
        check('Kriss Kross still on its own page', kk.startswith('games/kriss-kross/index.html'), kk)
        no_overflow = pg.evaluate('document.documentElement.scrollWidth <= innerWidth')
        check('home fits the phone width', no_overflow)

        # Skins are free: a star-priced skin applies straight away. Script 0.3.0 still refuses it, so it stays on the device.
        pg.click('[data-skin="unicorn"]'); pg.wait_for_timeout(1200)
        check('unicorn applies with no stars', pg.evaluate('document.documentElement.dataset.skin') == 'unicorn')
        check('unicorn kept on the device', 'unicorn' in (pg.evaluate("localStorage.getItem('fg.skin.p_sam')") or ''))
        pg.reload(); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
        check('unicorn still on after reload', pg.evaluate('document.documentElement.dataset.skin') == 'unicorn')

        # Kriss Kross: a solved round saves nothing and says nothing (record() with stars off).
        pg.goto(BASE + 'games/kriss-kross/index.html?player=p_sam'); pg.wait_for_timeout(2000)
        saved = pg.evaluate("""async () => {
            const kit = await import('./../../shared/game-kit.js');
            const fresh = await kit.record({ score: 5, stars: 3, seconds: 10 });
            return { fresh: fresh.length, outbox: localStorage.getItem('fg.outbox'), news: localStorage.getItem('fg.celebrate') };
        }""")
        check('a finished round queues nothing', not saved['outbox'] or json.loads(saved['outbox'])['results'] == [], saved)
        check('no celebration news', saved['news'] in (None, 'null') and saved['fresh'] == 0, saved)
        pg.evaluate("document.dispatchEvent(new CustomEvent('kk:solved', { detail: { hints: 0, words: 3, seconds: 9 } }))")
        pg.wait_for_timeout(500)
        check('Kriss Kross says nothing about stars', '★' not in pg.inner_text('#fgSaved'))
        pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        check('no celebration on coming back', pg.locator('.party').count() == 0)

        # Grown-ups' corner: the Testing switch, and no "More" line about stars.
        pg.dispatch_event('.gear', 'pointerdown'); pg.wait_for_timeout(1300); pg.dispatch_event('.gear', 'pointerup')
        pg.wait_for_selector('#quiz-a'); pg.fill('#quiz-a', TEST_ANSWER); pg.click('#quiz [type=submit]')
        pg.wait_for_selector('[data-add]'); pg.wait_for_timeout(300)
        corner = pg.inner_text('dialog.corner')
        pg.screenshot(path=f'{OUT}/02-phone-corner.png', full_page=True)
        check('corner has the Testing switch', pg.locator('#tst').count() == 1)
        check('corner has no stars_needed line', 'stars_needed' not in corner)
        check('corner hides "Waiting to sync" when empty', 'Waiting to sync' not in corner)
        pg.check('#tst'); pg.wait_for_timeout(200)
        pg.click('[data-close]'); pg.wait_for_timeout(600)
        check('testing game shows with the switch on', pg.locator('[data-g="wrapper-check"] .testing-tape').count() == 1)
        ctx.close()

        # ---------- The wrapper at three sizes ----------
        for name, w, h, mobile in [('phone', 390, 844, True), ('sideways', 844, 390, True), ('pc', 1366, 768, False)]:
            ctx, pg = new_page(w, h, mobile=mobile, testing=True)
            pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)  # fills the cache, lists included
            href = pg.get_attribute('[data-g="wrapper-check"]', 'href')
            check(f'{name}: tile opens the wrapper', href == 'play.html?game=wrapper-check&player=p_sam', href)
            pg.click('[data-g="wrapper-check"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
            fr = pg.frame_locator('.wframe iframe')
            fr.locator('#go').click(); pg.wait_for_timeout(300)
            facts = fr.locator('#facts').inner_text()
            check(f'{name}: game is in the wrapper', 'Running in the wrapper' in facts, facts)
            check(f'{name}: who is playing arrives', 'Sam (fox)' in facts, facts)
            check(f'{name}: word lists arrive (shared per child)', 'Word lists: 2 (first: Animals' in facts, facts)
            bar = pg.evaluate("document.querySelector('.wbar').getBoundingClientRect().height")
            frame = pg.evaluate("(() => { const r = document.querySelector('.wframe iframe').getBoundingClientRect(); return [r.top, r.bottom, r.width]; })()")
            check(f'{name}: frame fills below the bar', abs(frame[0] - bar) < 2 and abs(frame[1] - h) < 2 and abs(frame[2] - w) < 2, f'bar {bar}, frame {frame}')
            check(f'{name}: bar is slim', bar <= 64, f'{bar}px')
            check(f'{name}: home button and face in the bar', pg.locator('.wbar #home svg').count() == 1 and pg.locator('.wbar .face .disc svg').count() == 1)
            pg.screenshot(path=f'{OUT}/03-{name}-wrapper.png')
            fr.locator('#done').click(); pg.wait_for_timeout(300)
            stored = json.loads(pg.evaluate("localStorage.getItem('fg.state.p_sam.wrapper-check')") or 'null')
            check(f'{name}: fg:state kept per child', stored and stored['state'] == {'rounds': 1}, stored)
            check(f'{name}: fg:round queues nothing', (pg.evaluate("localStorage.getItem('fg.outbox')") or 'null') in ('null', '{"results":[],"achievements":[]}'))
            pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(500)
            check(f'{name}: Home goes back to the child\'s games', 'player=p_sam' in pg.url)
            pg.click('[data-g="wrapper-check"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check(f'{name}: saved state comes back in fg:start', 'Rounds finished before: 1' in fr.locator('#facts').inner_text())
            ctx.close()

        # Another child has their own state.
        ctx, pg = new_page(1366, 768, testing=True)
        pg.goto(BASE + 'index.html?player=p_alex'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        pg.evaluate("localStorage.setItem('fg.state.p_sam.wrapper-check', JSON.stringify({ state: { rounds: 7 } }))")
        pg.goto(BASE + 'play.html?game=wrapper-check&player=p_alex'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
        fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
        check('state is per child', 'Rounds finished before: 0' in fr.locator('#facts').inner_text())

        # Unknown game, unknown child, a "soon" game, or a testing game that isn't listed: back to the launcher.
        for bad in ['play.html?game=nope&player=p_sam', 'play.html?game=wrapper-check&player=nobody', 'play.html?game=bubble-pop&player=p_sam']:
            pg.goto(BASE + bad); pg.wait_for_timeout(1000)
            check(f'{bad} goes back to the launcher', '/index.html' in pg.url, pg.url)
        # Sound off reaches the game.
        pg.evaluate("localStorage.setItem('fg.muted', 'true')")
        pg.goto(BASE + 'play.html?game=wrapper-check&player=p_sam'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
        fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
        check('sound off reaches the game', 'Sound: off' in fr.locator('#facts').inner_text())
        # Running on its own (GC5).
        pg.goto(BASE + 'games/wrapper-check/index.html'); pg.wait_for_timeout(1900)
        pg.click('#go'); pg.wait_for_timeout(200)
        check('the game runs on its own without the wrapper', 'Running on its own' in pg.inner_text('#facts'))
        ctx.close()
        browser.close()

    check('no page errors', not errors, '; '.join(errors[:5]))
    check('nothing reached the Scores tab', db['scores'] == [], db['scores'])
    passed = sum(1 for _, ok, _ in results if ok)
    print(f'\nPASS {passed} of {len(results)}' if passed == len(results) else f'\n{len(results) - passed} FAILED of {len(results)}')
    return passed == len(results)


if __name__ == '__main__':
    sys.exit(0 if run() else 1)
