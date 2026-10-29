"""Browser test: grown-ups' question, skin preview toggle, Game setup word lists, Kriss Kross default list + Next.
Runs against a stand-in for the Apps Script (no real Sheet is touched).
From the repo root: python3 -m http.server 8123 --bind 127.0.0.1
then: GROWNUP_ANSWER='<the answer>' python3 tools/tests/e2e_lists.py <folder for screenshots>
The answer is never stored in this repo."""
import json, os, re, sys, uuid
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]
ANSWER = os.environ['GROWNUP_ANSWER']
BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
db = {
    'profiles': [{'profile_id': 'p_a', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#F07A2A', 'skin': 'sticker'},
                 {'profile_id': 'p_b', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'skin': 'sticker'}],
    'scores': [], 'achievements': [], 'lists': [],
    'skins': [{'skin_id': 'sticker', 'name': 'Sticker book', 'stars_needed': 0}, {'skin_id': 'fairy', 'name': 'Fairy', 'stars_needed': 10},
              {'skin_id': 'blocks', 'name': 'Blocks', 'stars_needed': 20}, {'skin_id': 'unicorn', 'name': 'Unicorn', 'stars_needed': 30}],
}
calls = []

def lists_for(pid):
    out = {}
    for r in sorted([r for r in db['lists'] if r['profile_id'] == pid], key=lambda r: r['position']):
        out.setdefault(r['game_id'], []).append({'list_id': r['list_id'], 'title': r['title'], 'words': [w.strip() for w in r['words'].split(',')]})
    return out

def handle(b):
    a = b.get('action'); calls.append(a)
    if b.get('code') != CODE: return {'ok': False, 'error': 'wrong_code'}
    if a == 'ping': return {'ok': True, 'version': '0.3.0'}
    if a == 'profiles': return {'ok': True, 'version': '0.3.0', 'profiles': db['profiles'], 'skins': db['skins']}
    if a == 'profile':
        pid = b['profile_id']; sc = [s for s in db['scores'] if s['profile_id'] == pid]
        return {'ok': True, 'profile': next(p for p in db['profiles'] if p['profile_id'] == pid), 'recent': sc[::-1][:10],
                'stats': {'total_plays': len(sc), 'stars_total': sum(s['stars'] for s in sc), 'games': {}, 'days_played': []},
                'achievements': [], 'lists': lists_for(pid)}
    if a == 'saveLists':
        pid, gid = b['profile_id'], b['game_id']
        db['lists'] = [r for r in db['lists'] if not (r['profile_id'] == pid and r['game_id'] == gid)]
        for i, l in enumerate(b['lists']):
            db['lists'].append({'list_id': l.get('list_id') or 'l_' + uuid.uuid4().hex[:10], 'profile_id': pid, 'game_id': gid,
                                'position': i + 1, 'title': l['title'], 'words': ', '.join(l['words'])})
        return {'ok': True, 'lists': lists_for(pid).get(gid, [])}
    if a == 'sync':
        db['scores'].extend(b.get('results', []))
        return {'ok': True, 'accepted': [r['event_id'] for r in b.get('results', [])], 'duplicates': [], 'rejected': [],
                'achievements_recorded': [x['profile_id'] + '|' + x['achievement_id'] for x in b.get('achievements', [])]}
    return {'ok': True}

errors = []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width': 1280, 'height': 900})
    ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));")
    ctx.route(re.compile(r'https://script\.google\.com/.*'), lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(handle(json.loads(r.request.post_data or '{}')))))
    ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda r: r.abort())
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)

    pg.goto(BASE + 'index.html?player=p_a'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
    print('debug button visible at start:', pg.locator('.debug').count())
    print('ready tiles:', pg.eval_on_selector_all('a.tile', 'els => els.map(e => e.dataset.g)'))
    pg.screenshot(path=f'{OUT}/01-home.png')

    def open_corner(answer):
        box = pg.locator('.gear').bounding_box()
        pg.mouse.move(box['x'] + 20, box['y'] + 20); pg.mouse.down(); pg.wait_for_timeout(1200); pg.mouse.up()
        pg.wait_for_selector('#quiz-a'); pg.fill('#quiz-a', answer); pg.click('#quiz [type=submit]'); pg.wait_for_timeout(1200)

    open_corner('wrong answer')
    print('wrong answer msg:', pg.inner_text('.corner .msg'))
    pg.screenshot(path=f'{OUT}/02-gate.png')
    pg.fill('#quiz-a', ANSWER.lower().replace('d', 'D ', 1)); pg.click('#quiz [type=submit]'); pg.wait_for_selector('[data-setup]')
    print('opened with variant spacing/case')
    pg.check('#dbg'); pg.wait_for_timeout(200)
    print('debug button after toggle:', pg.locator('.debug').count())
    pg.screenshot(path=f'{OUT}/03-corner.png', full_page=True)

    # Game setup for Sam
    pg.click('[data-setup="p_a"]'); pg.wait_for_selector('[data-gs-add]')
    pg.click('[data-gs-add]'); pg.fill('#gs-title', 'Week 1'); pg.fill('#gs-words', 'a\ncat\ndog'); pg.wait_for_timeout(100)
    print('check (bad):', pg.inner_text('#gs-check'), '| submit disabled:', pg.is_disabled('#gs-form [type=submit]'))
    pg.screenshot(path=f'{OUT}/04-check.png')
    pg.fill('#gs-words', 'cat, dog, cot, dot, tag, god'); pg.click('#gs-form [type=submit]'); pg.wait_for_selector('.gs-item'); pg.wait_for_timeout(300)
    for title, words in [('Week 2', 'rocket\nplanet\ncomet\norbit\nstar'), ('Week 3', 'apple pear plum peach lemon lime')]:
        pg.click('[data-gs-add]'); pg.fill('#gs-title', title); pg.fill('#gs-words', words); pg.click('#gs-form [type=submit]'); pg.wait_for_timeout(400)
    pg.click('[data-gs-down="0"]'); pg.wait_for_timeout(400)            # Week 1 -> position 2
    pg.click('[data-gs-default="2"]'); pg.wait_for_timeout(400)         # Week 3 -> default
    pg.click('[data-gs-edit="1"]'); pg.fill('#gs-title', 'Week 2 space'); pg.click('#gs-form [type=submit]'); pg.wait_for_timeout(400)
    pg.click('[data-gs-del="2"]'); pg.wait_for_timeout(100); pg.screenshot(path=f'{OUT}/05-delete-confirm.png', full_page=True)
    pg.click('[data-gs-del-no]'); pg.wait_for_timeout(200)
    print('sheet order:', [(r['position'], r['title']) for r in sorted(db['lists'], key=lambda r: r['position'])])
    print('status:', pg.inner_text('.corner .msg'))
    pg.screenshot(path=f'{OUT}/06-setup.png', full_page=True)
    pg.click('[data-gs-back]'); pg.wait_for_selector('[data-setup]')
    pg.click('.corner [data-close]'); pg.wait_for_timeout(300)

    # Play Kriss Kross: default list, solve by hints, Next, ... last
    pg.goto(BASE + 'games/kriss-kross/index.html?player=p_a'); pg.wait_for_selector('#play:not([hidden])', timeout=10000)
    titles = []
    for round_no in range(4):
        titles.append(pg.inner_text('#pTitle'))
        for _ in range(40):
            if pg.inner_text('#fgSaved').strip(): break
            pg.click('#hintBtn'); pg.wait_for_timeout(60)
        pg.wait_for_timeout(500)
        nxt = pg.locator('#play .bar-right .btn.primary')
        print(f'round {round_no + 1}:', titles[-1], '|', pg.inner_text('#fgSaved'), '| next:', nxt.inner_text() if nxt.is_visible() else '(none)')
        if round_no == 0: pg.screenshot(path=f'{OUT}/07-kk-next.png')
        if not nxt.is_visible(): break
        nxt.click(); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{OUT}/08-kk-last.png')
    print('levels saved:', pg.evaluate("JSON.parse(localStorage.getItem('fg.outbox')).results.map(r => [r.level, r.stars])"))

    # Alex has no lists: game shows its own word screen
    pg.goto(BASE + 'games/kriss-kross/index.html?player=p_b'); pg.wait_for_timeout(2500)
    print('Alex sees setup screen:', pg.is_visible('#setup'), '| play hidden:', not pg.is_visible('#play'))

    # Phone view of Game setup
    ph = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ph.add_init_script(f"localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));")
    ph.route(re.compile(r'https://script\.google\.com/.*'), lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(handle(json.loads(r.request.post_data or '{}')))))
    ph.route(re.compile(r'https://fonts\..*'), lambda r: r.abort())
    pp = ph.new_page(); pp.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pp.goto(BASE + 'index.html'); pp.wait_for_selector('.player'); pp.wait_for_timeout(500)
    box = pp.locator('.gear').bounding_box()
    pp.mouse.move(box['x'] + 20, box['y'] + 20); pp.mouse.down(); pp.wait_for_timeout(1200); pp.mouse.up()
    pp.fill('#quiz-a', ANSWER); pp.click('#quiz [type=submit]'); pp.wait_for_selector('[data-setup]')
    pp.screenshot(path=f'{OUT}/09-phone-corner.png')
    pp.click('[data-setup="p_a"]'); pp.wait_for_selector('.gs-item'); pp.wait_for_timeout(300)
    pp.screenshot(path=f'{OUT}/10-phone-setup.png')
    pp.goto(BASE + 'games/kriss-kross/index.html?player=p_a'); pp.wait_for_selector('#play:not([hidden])', timeout=10000); pp.wait_for_timeout(500)
    pp.screenshot(path=f'{OUT}/11-phone-kk.png')
    br.close()
print('\n'.join(errors) or 'no page errors')
