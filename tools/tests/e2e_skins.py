"""Browser test for the launcher, run against a stand-in for the Apps Script (no real Sheet is touched).
Needs Python Playwright. From the repo root: python3 -m http.server 8123 --bind 127.0.0.1
then: python3 tools/tests/e2e_skins.py <folder for screenshots>
"""
import json, sys, re
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
db = {'profiles': [
        {'profile_id': 'p_sam', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#2E8FD0', 'skin': 'sticker'},
        {'profile_id': 'p_alex', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'skin': ''}],
      'scores': [{'event_id': f's{i}', 'profile_id': 'p_sam', 'game_id': 'bubble-pop', 'score': 15, 'level': 1, 'stars': 3,
                  'seconds': 30, 'played_at': f'2026-10-2{i % 3 + 5}T10:00:00Z'} for i in range(8)],
      'achievements': [{'profile_id': 'p_sam', 'achievement_id': a, 'earned_at': '2026-10-27T10:00:00Z'} for a in ('first_game', 'three_stars', 'three_days')],
      'skins': [{'skin_id': 'sticker', 'name': 'Sticker book', 'stars_needed': 0}, {'skin_id': 'fairy', 'name': 'Fairy', 'stars_needed': 10},
                {'skin_id': 'blocks', 'name': 'Blocks', 'stars_needed': 20}, {'skin_id': 'unicorn', 'name': 'Unicorn', 'stars_needed': 30}]}

def profile(pid):
    p = next(x for x in db['profiles'] if x['profile_id'] == pid)
    sc = sorted([s for s in db['scores'] if s['profile_id'] == pid], key=lambda s: s['played_at'], reverse=True)
    games = {}
    for s in sc:
        g = games.setdefault(s['game_id'], {'plays': 0, 'best': None, 'best_stars': 0})
        g['plays'] += 1; g['best'] = max(g['best'] or 0, s['score']); g['best_stars'] = max(g['best_stars'], s['stars'])
    return {'ok': True, 'profile': p, 'recent': sc[:10], 'stats': {'total_plays': len(sc), 'stars_total': sum(s['stars'] for s in sc),
            'games': games, 'days_played': sorted({s['played_at'][:10] for s in sc})},
            'achievements': [a for a in db['achievements'] if a['profile_id'] == pid]}

synced = []
def handle(b):
    a = b.get('action')
    if a == 'profiles': return {'ok': True, 'version': '0.2.0', 'profiles': db['profiles'], 'skins': db['skins']}
    if a == 'profile': return profile(b['profile_id'])
    if a == 'sync':
        synced.extend(b.get('results', []))
        db['scores'].extend(b.get('results', []))
        return {'ok': True, 'accepted': [r['event_id'] for r in b.get('results', [])], 'duplicates': [], 'rejected': [],
                'achievements_recorded': [x['profile_id'] + '|' + x['achievement_id'] for x in b.get('achievements', [])]}
    if a == 'updateProfile': return {'ok': True, 'profile': next(x for x in db['profiles'] if x['profile_id'] == b['profile_id'])}
    return {'ok': True}

errors = []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    def page(w, h, mobile=False):
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));")
        ctx.route(re.compile(r'https://script\.google\.com/.*'), lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(handle(json.loads(r.request.post_data or '{}')))))
        ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda r: r.abort())
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        return pg

    ph = page(390, 844, True)
    ph.goto(BASE + 'index.html?player=p_sam'); ph.wait_for_selector('.home'); ph.wait_for_timeout(1200)
    if ph.is_visible('.party'): ph.click('[data-yay]'); ph.wait_for_timeout(300)
    for name in ('sticker', 'fairy', 'blocks', 'unicorn'):
        ph.click('.debug'); ph.wait_for_timeout(1700)
        ph.screenshot(path=f'{OUT}/ph-{name}.png')
        ph.mouse.click(200, 430); ph.wait_for_timeout(220)
        ph.screenshot(path=f'{OUT}/ph-{name}-tap.png', clip={'x': 80, 'y': 300, 'width': 240, 'height': 240})
        ph.wait_for_timeout(900)
    # who's playing in each skin (debug keeps going)
    ph.click('.debug'); ph.wait_for_timeout(200)  # off
    ph.click('[data-back]'); ph.wait_for_selector('.player')
    for name in ('sticker', 'fairy', 'blocks', 'unicorn'):
        ph.click('.debug'); ph.wait_for_timeout(1500)
        ph.screenshot(path=f'{OUT}/who-{name}.png')

    pc = page(1366, 800)
    pc.goto(BASE + 'index.html?player=p_sam'); pc.wait_for_selector('.home'); pc.wait_for_timeout(1200)
    if pc.is_visible('.party'): pc.click('[data-yay]'); pc.wait_for_timeout(300)
    for name in ('sticker', 'fairy', 'blocks', 'unicorn'):
        pc.click('.debug'); pc.wait_for_timeout(1700)
        pc.mouse.move(700, 400); pc.mouse.move(760, 430, steps=12)
        pc.screenshot(path=f'{OUT}/pc-{name}.png')

    # Kriss Kross: build the example puzzle, solve with hints, check stars are saved.
    kk = page(1280, 860)
    kk.goto(BASE + 'index.html?player=p_sam'); kk.wait_for_selector('.home'); kk.wait_for_timeout(800)
    kk.goto(BASE + 'games/kriss-kross/index.html?player=p_sam'); kk.wait_for_selector('#buildBtn')
    kk.screenshot(path=f'{OUT}/kk-setup.png')
    kk.click('#buildBtn'); kk.wait_for_selector('#play:not([hidden])')
    for _ in range(40):
        if kk.inner_text('#fgSaved').strip(): break
        kk.click('#hintBtn'); kk.wait_for_timeout(120)
    kk.wait_for_timeout(500)
    print('kk saved line:', kk.inner_text('#fgSaved'))
    print('outbox:', kk.evaluate("JSON.parse(localStorage.getItem('fg.outbox')).results.map(r => [r.game_id, r.stars, r.score])"))
    kk.screenshot(path=f'{OUT}/kk-solved.png')
    kk.click('button[aria-label="Back to games"]'); kk.wait_for_selector('.home'); kk.wait_for_timeout(1500)
    kk.screenshot(path=f'{OUT}/kk-back.png')
    print('synced:', [(r['game_id'], r['stars']) for r in synced])
    br.close()
print('\n'.join(errors) or 'no page errors')
