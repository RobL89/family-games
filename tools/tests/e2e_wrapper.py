"""Launcher browser test (stages 2 and 3): stars and stickers switched off, skins free, the testing status, and the
wrapper (play.html) with its messages (game contract 0.4). Runs against a stand-in for the Apps
Script; no real Sheet is touched, and the grown-ups' answer is a test one (test_config.py).

Needs Python Playwright. From the repo root:
    python3 -m http.server 8123 --bind 127.0.0.1
then:
    python3 -B tools/tests/e2e_wrapper.py <folder for screenshots>
    FG_SCRIPT=0.4.0 python3 -B tools/tests/e2e_wrapper.py <folder>   (the stand-in answers like script 0.4.0)
Ends with "PASS n of n" or lists what failed. Run it both ways: the launcher works with either script.
"""
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import TEST_ANSWER, route_config  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-wrapper-shots'
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
os.makedirs(OUT, exist_ok=True)
SCRIPT = os.environ.get('FG_SCRIPT', '0.3.0')
V4 = SCRIPT == '0.4.0'

# ---- Stand-in Sheet: the same answers as apps-script/Code.gs 0.3.0 (skin check included) or 0.4.0 ----
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
    'states': {},  # 0.4.0: (profile_id, game_id) -> {'state', 'at'}, the newest save winning (P78)
}
calls = []


def handle(body):
    if body.get('code') != CODE:
        return {'ok': False, 'error': 'wrong_code'}
    a = body.get('action')
    calls.append(a)
    if a == 'ping':
        return {'ok': True, 'version': SCRIPT}
    if a == 'profiles':
        return {'ok': True, 'version': SCRIPT, 'profiles': db['profiles'], 'skins': db['skins']}
    if a == 'profile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        out = {'ok': True, 'profile': p, 'recent': [], 'achievements': [],
               'stats': {'total_plays': 0, 'stars_total': 0, 'games': {}, 'days_played': []}}
        if V4:  # one set of lists per child (here, the child's first game's) and each game's state
            per_game = db['lists'].get(p['profile_id'], {})
            out['word_lists'] = per_game[sorted(per_game)[0]] if per_game else []
            out['states'] = {g: dict(v) for (pid, g), v in db['states'].items() if pid == p['profile_id']}
        else:
            out['lists'] = db['lists'].get(p['profile_id'], {})
        return out
    if a == 'saveState' and V4:
        now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        at = min(body.get('at') or now, now)
        key = (body['profile_id'], body['game_id'])
        if key in db['states'] and db['states'][key]['at'] > at:
            return {'ok': True, 'saved': False, 'at': db['states'][key]['at']}
        db['states'][key] = {'state': body.get('state'), 'at': at}
        return {'ok': True, 'saved': True, 'at': at}
    if a == 'updateProfile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        if 'skin' in body:
            sk = next((s for s in db['skins'] if s['skin_id'] == body['skin']), None)
            if not sk:
                return {'ok': False, 'error': 'no_such_skin'}
            if sk['stars_needed'] > 0 and not V4:  # no stars any more, so only the free one passes the 0.3.0 check
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

        def new_page(w, h, mobile=False, testing=False, debug=False):
            ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile,
                                      device_scale_factor=2 if mobile else 1)
            ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));"
                                + ("localStorage.setItem('fg.testing', 'true');" if testing else '')
                                + ("localStorage.setItem('fg.debug', 'true');" if debug else ''))
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
        # This device once had the skin preview button ticked (fg.debug): it must stay hidden (P73).
        ctx, pg = new_page(390, 844, mobile=True, debug=True)
        pg.goto(BASE + 'index.html'); pg.wait_for_selector('.player'); pg.wait_for_timeout(300)
        check("no Debug skin button on Who's playing, though this device had it on (P73)", pg.locator('.debug').count() == 0)
        before = len(calls)
        pg.click('[data-p="p_sam"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{OUT}/01-phone-home.png', full_page=True)
        check('no Debug skin button on home (P73)', pg.locator('.debug').count() == 0)
        check("picking a child re-reads their lists from the Sheet (P74)", 'profile' in calls[before:], calls[before:])
        check('no star total', pg.locator('.total').count() == 0)
        check('no sticker slots', pg.locator('.slot').count() == 0)
        check('no "Last played"', pg.locator('.minis, .mini').count() == 0 and 'Last played' not in pg.inner_text('.home'))
        check('no stars on tiles', pg.locator('.tile .stars').count() == 0)
        check('no locked skins', pg.locator('.skin.locked, .lockmark').count() == 0 and pg.locator('.progress').count() == 0)
        check('home is just the games (no side panel)', pg.locator('.side').count() == 0 and pg.locator('button[data-skin]').count() == 0)
        check('the face has the paint badge', pg.locator('.head [data-skins] .face-badge svg').count() == 1)
        pg.click('.head [data-skins]'); pg.wait_for_selector('.skin-card')
        pg.screenshot(path=f'{OUT}/01b-phone-skin-picker.png')
        check('tapping the face opens the skin picker', pg.locator('.skin-card button[data-skin]').count() == 4)
        check('the picker fits the phone', pg.evaluate("(() => { const r = document.querySelector('.skin-card').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; })()"))
        check('testing game hidden without the switch', pg.locator('[data-g="wrapper-check"]').count() == 0)
        check('placeholder tiles hidden (P65)', pg.locator('.tile.soon').count() == 0)
        check('games being tested hidden without the switch', pg.locator('[data-g="wrapper-check"]').count() == 0)
        check('the artifact games are on home', all(pg.locator(f'[data-g="{g}"]').count() == 1 for g in ('kriss-kross', 'space-explorer', 'number-town')))
        no_overflow = pg.evaluate('document.documentElement.scrollWidth <= innerWidth')
        check('home fits the phone width', no_overflow)

        # Skins are free: a star-priced skin applies straight away. Script 0.3.0 still refuses it, so it stays on the device.
        pg.click('.skin-card [data-skin="unicorn"]'); pg.wait_for_timeout(1200)
        check('unicorn applies with no stars', pg.evaluate('document.documentElement.dataset.skin') == 'unicorn')
        check('the picker stays open to try another', pg.locator('.skin-card .skin.on[data-skin="unicorn"]').count() == 1)
        pg.screenshot(path=f'{OUT}/01c-phone-picker-unicorn.png')
        pg.click('[data-sheet-close]'); pg.wait_for_timeout(300)
        check('the tick closes the picker', pg.locator('.skin-sheet').count() == 0)
        pg.click('.head [data-skins]'); pg.wait_for_selector('.skin-sheet')
        pg.mouse.click(5, 5); pg.wait_for_timeout(300)
        check('tapping outside closes the picker', pg.locator('.skin-sheet').count() == 0)
        pg.click('.head [data-skins]'); pg.wait_for_selector('.skin-sheet'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        check('Escape closes the picker', pg.locator('.skin-sheet').count() == 0)
        if V4:
            check('0.4.0: unicorn saved in the Sheet, so not kept apart on the device', db['profiles'][0]['skin'] == 'unicorn'
                  and 'unicorn' not in (pg.evaluate("localStorage.getItem('fg.skin.p_sam')") or ''), db['profiles'][0])
        else:
            check('unicorn kept on the device', 'unicorn' in (pg.evaluate("localStorage.getItem('fg.skin.p_sam')") or ''))
        pg.reload(); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
        check('unicorn still on after reload', pg.evaluate('document.documentElement.dataset.skin') == 'unicorn')

        # The old game kit: a finished round saves nothing (record() with stars off).
        pg.goto(BASE + 'games/wrapper-check/index.html?player=p_sam'); pg.wait_for_timeout(2000)
        saved = pg.evaluate("""async () => {
            const kit = await import('./../../shared/game-kit.js');
            const fresh = await kit.record({ score: 5, stars: 3, seconds: 10 });
            return { fresh: fresh.length, outbox: localStorage.getItem('fg.outbox'), news: localStorage.getItem('fg.celebrate') };
        }""")
        check('a finished round queues nothing', not saved['outbox'] or json.loads(saved['outbox'])['results'] == [], saved)
        check('no celebration news', saved['news'] in (None, 'null') and saved['fresh'] == 0, saved)
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
        check('corner has no skin preview tick-box (P73)', pg.locator('#dbg').count() == 0 and 'Skin preview' not in corner)
        pg.check('#tst'); pg.wait_for_timeout(200)
        pg.click('[data-close]'); pg.wait_for_timeout(600)
        check('testing game shows with the switch on', pg.locator('[data-g="wrapper-check"] .testing-tape').count() == 1)
        ctx.close()

        # ---------- The wrapper at three sizes ----------
        for name, w, h, mobile in [('phone', 390, 844, True), ('sideways', 844, 390, True), ('pc', 1366, 768, False)]:
            ctx, pg = new_page(w, h, mobile=mobile, testing=True)
            db['states'].clear()
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
            if V4:
                pg.wait_for_timeout(1600)
                got = db['states'].get(('p_sam', 'wrapper-check'))
                check(f'{name}: 0.4.0: fg:state reaches the Sheet', got and got['state'] == {'rounds': 1}, db['states'])
            check(f'{name}: fg:round queues nothing', (pg.evaluate("localStorage.getItem('fg.outbox')") or 'null') in ('null', '{"results":[],"achievements":[]}'))
            pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(500)
            check(f'{name}: Home goes back to the child\'s games', 'player=p_sam' in pg.url)
            pg.click('[data-g="wrapper-check"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check(f'{name}: saved state comes back in fg:start', 'Rounds finished before: 1' in fr.locator('#facts').inner_text())
            ctx.close()

        # PC home: the games use the whole width once the side panel has gone.
        ctx, pg = new_page(1366, 768)
        pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/04-pc-home.png')
        games_w = pg.evaluate("document.querySelector('.games').getBoundingClientRect().width")
        home_w = pg.evaluate("document.querySelector('.home').getBoundingClientRect().width")
        check('pc: games use the whole width', games_w > home_w * .95, f'{games_w} of {home_w}')
        pg.click('.head [data-skins]'); pg.wait_for_selector('.skin-card'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{OUT}/05-pc-skin-picker.png')
        ctx.close()

        if V4:
            # Progress made on another device arrives through the Sheet (P51).
            db['states'][('p_sam', 'wrapper-check')] = {'state': {'rounds': 5}, 'at': '2026-11-13T09:00:00.000Z'}
            ctx, pg = new_page(1366, 768, testing=True)
            pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
            pg.goto(BASE + 'play.html?game=wrapper-check&player=p_sam'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(900)
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check('0.4.0: state saved on another device comes back', 'Rounds finished before: 5' in fr.locator('#facts').inner_text())
            ctx.close()
            # A state kept on the device by the earlier launcher (no "sent" mark) goes to the Sheet.
            ctx, pg = new_page(1366, 768, testing=True)
            pg.goto(BASE + 'index.html?player=p_alex'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
            pg.evaluate("localStorage.setItem('fg.state.p_alex.wrapper-check', JSON.stringify({ state: { rounds: 3 }, at: '2026-11-12T10:00:00Z' }))")
            pg.goto(BASE + 'play.html?game=wrapper-check&player=p_alex'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(2200)
            got = db['states'].get(('p_alex', 'wrapper-check'))
            check("0.4.0: a state kept before goes to the Sheet", got and got['state'] == {'rounds': 3}, db['states'])
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check('0.4.0: and the game still gets it', 'Rounds finished before: 3' in fr.locator('#facts').inner_text())
            ctx.close()
            del db['states'][('p_alex', 'wrapper-check')]
            # The newest save wins (P78): an older copy in the Sheet doesn't replace newer progress on the
            # device, and a newer one from another device does.
            ctx, pg = new_page(1366, 768, testing=True)
            pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1200)
            pg.evaluate("localStorage.setItem('fg.state.p_sam.wrapper-check', JSON.stringify({ state: { rounds: 8 }, at: '2026-11-13T12:00:00.000Z', sent: false }))")
            db['states'][('p_sam', 'wrapper-check')] = {'state': {'rounds': 6}, 'at': '2026-11-13T11:00:00.000Z'}
            pg.goto(BASE + 'play.html?game=wrapper-check&player=p_sam'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1200)
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check("0.4.0: newer progress on the device beats an older copy in the Sheet", 'Rounds finished before: 8' in fr.locator('#facts').inner_text())
            pg.wait_for_timeout(2500)
            check("0.4.0: and replaces it there", db['states'][('p_sam', 'wrapper-check')]['state'] == {'rounds': 8}, db['states'])
            db['states'][('p_sam', 'wrapper-check')] = {'state': {'rounds': 20}, 'at': '2099-01-01T00:00:00.000Z'}
            pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
            pg.click('[data-g="wrapper-check"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1200)
            fr = pg.frame_locator('.wframe iframe'); fr.locator('#go').click(); pg.wait_for_timeout(200)
            check("0.4.0: a newer save from another device beats this device's", 'Rounds finished before: 20' in fr.locator('#facts').inner_text())
            ctx.close()
            db['states'].clear()

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
