"""Plays browser test (P88): a tap on a game tile queues a play for the Sheet's Plays tab, the
wrapper adds the time the game is played (not while hidden, not after 3 minutes with no touch),
and the plays go to the Sheet with sync. Runs against a stand-in for the Apps Script; no real
Sheet is touched. The browser's clock is Playwright's, so minutes pass in moments.

Needs Python Playwright. From the repo root:
    python3 -m http.server 8123 --bind 127.0.0.1
then:
    python3 -B tools/tests/e2e_plays.py <folder for screenshots>
    FG_SCRIPT=0.4.0 python3 -B tools/tests/e2e_plays.py <folder>   (the stand-in answers like script 0.4.0: plays wait)
Ends with "PASS n of n" or lists what failed. Run it both ways.
"""
import json
import os
import re
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import route_config  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-plays-shots'
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
os.makedirs(OUT, exist_ok=True)
SCRIPT = os.environ.get('FG_SCRIPT', '0.5.0')
V5 = SCRIPT == '0.5.0'
WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'

profiles = [
    {'profile_id': 'p_sam', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#2E8FD0', 'skin': 'sticker'},
    {'profile_id': 'p_alex', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'skin': 'sticker'},
]
sheet_plays = {}  # play_id -> the play as the stand-in Sheet keeps it (0.5.0)
syncs = []        # the plays each sync call carried


def handle(body):
    if body.get('code') != CODE:
        return {'ok': False, 'error': 'wrong_code'}
    a = body.get('action')
    if a == 'ping':
        return {'ok': True, 'version': SCRIPT}
    if a == 'profiles':
        return {'ok': True, 'version': SCRIPT, 'profiles': profiles, 'skins': []}
    if a == 'profile':
        p = next(x for x in profiles if x['profile_id'] == body['profile_id'])
        return {'ok': True, 'profile': p, 'recent': [], 'achievements': [], 'word_lists': [], 'states': {},
                'stats': {'total_plays': 0, 'stars_total': 0, 'games': {}, 'days_played': []}}
    if a == 'saveState':
        return {'ok': True, 'saved': True, 'at': body.get('at')}
    if a == 'sync':
        syncs.append(body.get('plays'))
        out = {'ok': True, 'accepted': [r['event_id'] for r in body.get('results', [])], 'duplicates': [], 'rejected': [],
               'achievements_recorded': []}
        if V5:  # as Code.gs 0.5.0: a new play adds a row, more time updates it
            done = []
            for p in body.get('plays') or []:
                kept = sheet_plays.setdefault(p['play_id'], dict(p))
                kept['seconds'] = max(kept['seconds'], p['seconds'])
                done.append({'play_id': p['play_id'], 'seconds': p['seconds']})
            out['plays_done'] = done
        return out
    return {'ok': False, 'error': 'unknown_action'}


results = []
errors = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('  ok   ' if ok else '  FAIL ') + name + ('' if ok else f'  [{detail}]'))


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        def new_page(ua, outbox=None):
            ctx = browser.new_context(viewport={'width': 1200, 'height': 800}, user_agent=ua)
            init = (f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));"
                    "localStorage.setItem('fg.testing', 'true');")
            if outbox is not None:
                init += f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('fg.outbox', {json.dumps(json.dumps(outbox))}); sessionStorage.setItem('seeded', '1'); }}"
            ctx.add_init_script(init)
            ctx.route(re.compile(r'https://script\.google\.com/.*'),
                      lambda route: route.fulfill(status=200, content_type='application/json',
                                                  body=json.dumps(handle(json.loads(route.request.post_data or '{}')))))
            ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
            route_config(ctx)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
            pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
                  if m.type in ('error', 'warning') and 'fonts' not in m.text and 'ERR_FAILED' not in m.text else None)
            return ctx, pg

        outbox = lambda pg: json.loads(pg.evaluate("localStorage.getItem('fg.outbox')") or '{}')  # noqa: E731

        # ---------- A tap on a tile queues a play, and its id goes to the wrapper ----------
        ctx, pg = new_page(WINDOWS)
        pg.clock.install()
        pg.goto(BASE + 'index.html'); pg.wait_for_selector('.player'); pg.clock.run_for(1500)
        pg.click('[data-p="p_sam"]'); pg.wait_for_selector('.home'); pg.clock.run_for(1500)
        pg.click('.tile.soon'); pg.clock.run_for(500)
        check('a Soon tile queues no play', outbox(pg).get('plays', []) == [], outbox(pg))
        pg.click('[data-g="wrapper-check"]'); pg.wait_for_url(re.compile(r'play\.html')); pg.wait_for_selector('.wframe iframe')
        url = pg.url
        plays = outbox(pg).get('plays', [])
        check('one play queued', len(plays) == 1, plays)
        p = plays[0] if plays else {}
        check('the play: child, game id and title, PC, time, no seconds yet',
              (p.get('profile_id'), p.get('game_id'), p.get('game'), p.get('device'), p.get('seconds'), p.get('sent'))
              == ('p_sam', 'wrapper-check', 'Wrapper check', 'PC', 0, -1) and p.get('played_at', '').endswith('Z'), p)
        check('the wrapper got the play id in its link', f"play={p.get('play_id')}" in url and 'game=wrapper-check&player=p_sam' in url, url)
        fr = pg.frame_locator('.wframe iframe')
        for _ in range(40):  # the game starts: the Sheet's answer comes in real time, the timers on the test clock
            pg.wait_for_timeout(100); pg.clock.run_for(500)
            if fr.locator('#go').is_visible() and pg.locator('#cover').is_hidden():
                break
        check('the game started', fr.locator('#go').is_visible(), pg.screenshot(path=f'{OUT}/plays-start.png'))

        # ---------- Time played ----------
        frame_box = pg.locator('.wframe iframe').bounding_box()
        touch_game = lambda: pg.mouse.click(frame_box['x'] + 20, frame_box['y'] + frame_box['height'] - 20)  # noqa: E731
        for _ in range(4):  # a touch in the game every 30 s for 2 minutes
            touch_game()
            pg.clock.run_for(30000)
        secs = outbox(pg)['plays'][0]['seconds']
        check('2 minutes of play counted (within one tick)', 115 <= secs <= 125, secs)
        pg.clock.run_for(10 * 60000)  # no touch for 10 minutes
        idle = outbox(pg)['plays'][0]['seconds']
        # The last touch was 30 s before these 10 minutes, so 2.5 more minutes count, then it's a break.
        check('no touch for 10 minutes: counting stops 3 minutes after the last touch', secs + 145 <= idle <= secs + 155, (secs, idle))
        pg.mouse.click(600, 30)  # a touch on the wrapper's own bar counts too
        pg.evaluate("Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })")
        pg.clock.run_for(60000)
        hidden = outbox(pg)['plays'][0]['seconds']
        check('hidden (another app, screen off): nothing counted', hidden == idle, (idle, hidden))
        pg.evaluate("Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })")
        touch_game(); pg.clock.run_for(20000)
        total = outbox(pg)['plays'][0]['seconds']
        check('back on screen and touched: counting again', total >= hidden + 15, (hidden, total))

        # ---------- Home sends it ----------
        before = len(syncs)
        pg.click('#home'); pg.wait_for_selector('.home'); pg.clock.run_for(3000)
        sent = [x for x in syncs[before:] if x]
        check('Home sends the play with its time', any(any(q['play_id'] == p.get('play_id') and q['seconds'] == total for q in s) for s in sent),
              (total, sent))
        check('what is sent has no device bookkeeping (sent)', all('sent' not in q for s in sent for q in s), sent)
        after = outbox(pg)['plays']
        if V5:
            check('0.5.0: the Sheet has it all', sheet_plays.get(p.get('play_id'), {}).get('seconds') == total, sheet_plays)
            check('0.5.0: marked sent on the device, kept a while', len(after) == 1 and after[0]['sent'] == after[0]['seconds'] == total, after)
            n = len(syncs)
            pg.reload(); pg.wait_for_selector('.home'); pg.clock.run_for(3000)
            check('0.5.0: a play the Sheet has all of is not sent again', all(not s for s in syncs[n:]), syncs[n:])
        else:
            check('0.4.0: the play waits on the device', len(after) == 1 and after[0]['sent'] == -1 and after[0]['seconds'] == total, after)

        # Back into the same game: a fresh play for the new tap.
        pg.click('[data-g="wrapper-check"]'); pg.wait_for_url(re.compile(r'play\.html')); pg.wait_for_selector('.wframe iframe')
        ids = [q['play_id'] for q in outbox(pg)['plays']]
        check('a second tap is a second play', len(ids) == 2 and len(set(ids)) == 2, ids)
        check('its link carries only the new id', pg.url.count('play=') == 1 and f'play={ids[-1]}' in pg.url, pg.url)
        ctx.close()

        # ---------- Phone; an outbox from before plays; the launcher's own sync ----------
        old = {'results': [], 'achievements': []}
        ctx, pg = new_page(ANDROID, outbox=old)
        pg.goto(BASE + 'index.html'); pg.wait_for_selector('.player'); pg.wait_for_timeout(1500)
        check('an outbox from before plays still loads', 'plays' not in outbox(pg) or outbox(pg)['plays'] == [], outbox(pg))
        pg.click('[data-p="p_alex"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        pg.click('[data-g="wrapper-check"]'); pg.wait_for_url(re.compile(r'play\.html')); pg.wait_for_timeout(1500)
        q = outbox(pg)['plays'][0]
        check('Android shows as Phone', q['device'] == 'Phone' and q['profile_id'] == 'p_alex', q)
        before = len(syncs)
        pg.goto(BASE + 'index.html?player=p_alex'); pg.wait_for_selector('.home'); pg.wait_for_timeout(2500)
        check("the launcher's own sync carries the play too", any(s and any(x['play_id'] == q['play_id'] for x in s) for s in syncs[before:]), syncs[before:])
        pg.screenshot(path=f'{OUT}/plays-phone-home.png')
        ctx.close()
        browser.close()


run()
for e in errors:
    print('  note: ' + e)
failed = [r for r in results if not r[1]]
bad_errors = [e for e in errors if 'pageerror' in e]
if bad_errors:
    print('FAIL: page errors')
print(f"{'PASS' if not failed and not bad_errors else 'FAIL'} {len(results) - len(failed)} of {len(results)} (stand-in script {SCRIPT})")
sys.exit(1 if failed or bad_errors else 0)
