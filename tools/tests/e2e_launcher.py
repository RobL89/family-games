"""Browser test for the launcher, run against a stand-in for the Apps Script (no real Sheet is touched).
Needs Python Playwright. From the repo root: python3 -m http.server 8123 --bind 127.0.0.1
then: GROWNUP_ANSWER='<the answer>' python3 tools/tests/e2e_launcher.py <folder for screenshots>
"""
import json, os, sys, uuid, re
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'

# ---- Stand-in Sheet (same answers as apps-script/Code.gs 0.2.0) ----
db = {
    'profiles': [
        {'profile_id': 'p_sam', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#2E8FD0', 'active': True, 'skin': 'sticker'},
        {'profile_id': 'p_alex', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'active': True, 'skin': ''},
    ],
    'scores': [],
    'achievements': [],
    'skins': [
        {'skin_id': 'sticker', 'name': 'Sticker book', 'stars_needed': 0},
        {'skin_id': 'fairy', 'name': 'Fairy', 'stars_needed': 10},
        {'skin_id': 'blocks', 'name': 'Blocks', 'stars_needed': 20},
        {'skin_id': 'unicorn', 'name': 'Unicorn', 'stars_needed': 30},
    ],
}
calls = []

def pub(p):
    return {k: p[k] for k in ('profile_id', 'nickname', 'avatar', 'colour', 'skin')}

def stars_total(pid):
    return sum(s['stars'] for s in db['scores'] if s['profile_id'] == pid)

def profile(pid):
    p = next(x for x in db['profiles'] if x['profile_id'] == pid)
    sc = sorted([s for s in db['scores'] if s['profile_id'] == pid], key=lambda s: s['played_at'], reverse=True)
    games = {}
    for s in sc:
        g = games.setdefault(s['game_id'], {'plays': 0, 'best': None, 'best_stars': 0, 'last_played': None})
        g['plays'] += 1
        g['best'] = s['score'] if g['best'] is None else max(g['best'], s['score'])
        g['best_stars'] = max(g['best_stars'], s['stars'])
    return {'ok': True, 'profile': pub(p), 'recent': sc[:10],
            'stats': {'total_plays': len(sc), 'stars_total': stars_total(pid), 'games': games,
                      'days_played': sorted({s['played_at'][:10] for s in sc})},
            'achievements': [{'achievement_id': a['achievement_id'], 'earned_at': a['earned_at']}
                             for a in db['achievements'] if a['profile_id'] == pid]}

def handle(body):
    if body.get('code') != CODE:
        return {'ok': False, 'error': 'wrong_code'}
    a = body.get('action')
    calls.append(a)
    if a == 'ping': return {'ok': True, 'version': '0.2.0'}
    if a == 'profiles': return {'ok': True, 'version': '0.2.0', 'profiles': [pub(p) for p in db['profiles']], 'skins': db['skins']}
    if a == 'profile': return profile(body['profile_id'])
    if a == 'addProfile':
        p = {'profile_id': 'p_' + uuid.uuid4().hex[:10], 'nickname': body['nickname'], 'avatar': body.get('avatar', 'fox'),
             'colour': body.get('colour', '#F07A2A'), 'active': True, 'skin': 'sticker'}
        db['profiles'].append(p); return {'ok': True, 'profile': pub(p)}
    if a == 'updateProfile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        if 'skin' in body:
            sk = next((s for s in db['skins'] if s['skin_id'] == body['skin']), None)
            if not sk: return {'ok': False, 'error': 'no_such_skin'}
            if stars_total(p['profile_id']) < sk['stars_needed']:
                return {'ok': False, 'error': 'skin_locked'}
        for k in ('nickname', 'avatar', 'colour', 'skin'):
            if k in body: p[k] = body[k]
        return {'ok': True, 'profile': pub(p)}
    if a == 'sync':
        seen = {s['event_id'] for s in db['scores']}
        acc, dup = [], []
        for r in body.get('results', []):
            if r['event_id'] in seen: dup.append(r['event_id']); continue
            db['scores'].append(r); acc.append(r['event_id'])
        rec = []
        for x in body.get('achievements', []):
            key = x['profile_id'] + '|' + x['achievement_id']
            if not any(y['profile_id'] + '|' + y['achievement_id'] == key for y in db['achievements']):
                db['achievements'].append(x)
            rec.append(key)
        return {'ok': True, 'accepted': acc, 'duplicates': dup, 'rejected': [], 'achievements_recorded': rec}
    return {'ok': False, 'error': 'unknown_action'}

errors = []

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        def new_page(w, h, mobile=False):
            ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                                      is_mobile=mobile, has_touch=mobile)
            ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));"
                                "localStorage.setItem('fg.debug', 'true');")
            ctx.route(re.compile(r'https://script\.google\.com/.*'),
                      lambda route: route.fulfill(status=200, content_type='application/json',
                                                  body=json.dumps(handle(json.loads(route.request.post_data or '{}')))))
            ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
            pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type in ('error', 'warning') and 'fonts' not in m.text and 'ERR_FAILED' not in m.text else None)
            return pg

        # ---------- Phone ----------
        pg = new_page(390, 844, mobile=True)
        pg.goto(BASE + 'index.html'); pg.wait_for_selector('.player'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{OUT}/01-phone-who.png')

        pg.click('[data-p="p_sam"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{OUT}/02-phone-home.png', full_page=True)

        # Play Bubble pop: pop every bubble as it appears.
        pg.goto(BASE + 'games/bubble-pop/index.html?player=p_sam'); pg.wait_for_selector('#play')  # Bubble pop is a Soon tile now
        pg.click('#play')
        for _ in range(400):
            pg.evaluate("document.querySelectorAll('.bubble:not(.popped)').forEach(b => b.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})))")
            if pg.is_visible('#end'): break
            pg.wait_for_timeout(100)
        pg.wait_for_timeout(600)
        pg.screenshot(path=f'{OUT}/03-phone-game-end.png')
        pg.click('#done'); pg.wait_for_selector('.party'); pg.wait_for_timeout(1600)
        pg.screenshot(path=f'{OUT}/04-phone-party.png')
        pg.click('[data-yay]'); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{OUT}/05-phone-home-after.png', full_page=True)
        print('after one round: sheet scores', len(db['scores']), 'achievements', [a['achievement_id'] for a in db['achievements']],
              'stars', stars_total('p_sam'))

        # Give Sam enough stars to unlock Fairy and Blocks, then reload and pick Blocks.
        for i in range(6):
            db['scores'].append({'event_id': f'seed{i}', 'profile_id': 'p_sam', 'game_id': 'bubble-pop', 'score': 15,
                                 'level': 1, 'stars': 3, 'seconds': 30, 'played_at': f'2026-10-2{i % 3 + 5}T10:00:00Z'})
        pg.reload(); pg.wait_for_selector('.home'); pg.wait_for_timeout(1500)
        if pg.is_visible('.party'): pg.click('[data-yay]'); pg.wait_for_timeout(400)
        pg.click('[data-skin="blocks"]'); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{OUT}/06-phone-home-blocks.png', full_page=True)
        print('sam skin in sheet:', next(p for p in db['profiles'] if p['profile_id'] == 'p_sam')['skin'])
        pg.click('[data-skin="unicorn"]'); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{OUT}/07-phone-locked-tap.png')

        # ---------- PC: debug skin cycle ----------
        pc = new_page(1366, 800)
        pc.goto(BASE + 'index.html?player=p_alex'); pc.wait_for_selector('.home'); pc.wait_for_timeout(1200)
        if pc.is_visible('.party'): pc.click('[data-yay]'); pc.wait_for_timeout(300)
        pc.screenshot(path=f'{OUT}/10-pc-home-sticker.png')
        for name in ('sticker', 'fairy', 'blocks', 'unicorn'):
            pc.click('.debug'); pc.wait_for_timeout(700)
            label = pc.inner_text('.debug')
            pc.screenshot(path=f'{OUT}/11-pc-debug-{name}.png')
            print('debug label:', label)
        pc.click('.debug'); pc.wait_for_timeout(300)  # back to off
        pc.click('[data-back]'); pc.wait_for_selector('.player'); pc.wait_for_timeout(300)
        pc.screenshot(path=f'{OUT}/12-pc-who.png')

        # Grown-ups' corner: hold the gear, answer the sum, open the add-player form.
        box = pc.locator('.gear').bounding_box()
        pc.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
        pc.mouse.down(); pc.wait_for_timeout(1250); pc.mouse.up()
        pc.wait_for_selector('#quiz-a')
        pc.fill('#quiz-a', os.environ['GROWNUP_ANSWER']); pc.click('#quiz [type=submit]'); pc.wait_for_selector('[data-add]')
        pc.click('[data-add]'); pc.wait_for_timeout(300)
        pc.screenshot(path=f'{OUT}/13-pc-corner.png')

        # Phone in each debug skin (who's playing and home).
        ph = new_page(390, 844, mobile=True)
        ph.goto(BASE + 'index.html?player=p_sam'); ph.wait_for_selector('.home'); ph.wait_for_timeout(1000)
        if ph.is_visible('.party'): ph.click('[data-yay]'); ph.wait_for_timeout(300)
        for name in ('sticker', 'fairy', 'blocks', 'unicorn'):
            ph.click('.debug'); ph.wait_for_timeout(600)
            ph.screenshot(path=f'{OUT}/20-phone-home-{name}.png')
        browser.close()

run()
print('calls:', calls)
print('\n'.join(errors) or 'no page errors')
