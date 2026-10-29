"""Stand-in for the Apps Script web app (apps-script/Code.gs 0.3.0), for browser tests.

No real Sheet is touched. Tests import this, build a db with make_db(), and open pages
with new_page(); every call to script.google.com is answered from the db instead.

    from standin import make_db, new_page
    db = make_db()
    page = new_page(browser, db, 390, 844, mobile=True, errors=errors)
    page.goto(BASE + 'games/word-worm/index.html?player=p_sam')

Names here are made up: the repo is public, so the family's real names never go in it.
"""
import json, re, uuid

CODE = 'test-code'
VERSION = '0.3.0'


def make_db():
    return {
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
        # The Settings tab as it looks in the Sheet: one row per setting, a column per child
        # (headed with the child's name). Blank means "use the next level down".
        'settings_header': ['game_id', 'setting', 'about', 'everyone', 'Sam', 'Alex'],
        'settings_rows': [
            ['all', 'word_list', '', 'starter_words', 'test_week', ''],
            ['all', 'speak', '', 'TRUE', '', ''],
        ],
        'lists': [
            {'list_id': 'starter_words', 'title': 'Starter words', 'items': 'cat, hat, ship, fish, frog, dog, sun, duck, bed, pig, hen, bus'},
            {'list_id': 'test_week', 'title': 'Test week', 'items': 'ship, shop, shell, fish, wish, crash'},
        ],
        'progress': {},  # (profile_id, game_id) -> {'data': {...}, 'updated_at': iso}
        'calls': [],
    }


def set_setting(db, game_id, setting, everyone='', **players):
    """Adds or changes a Settings row. players: Sam='3', Alex='1' (by column name)."""
    header = db['settings_header']
    row = next((r for r in db['settings_rows'] if r[0] == game_id and r[1] == setting), None)
    if row is None:
        row = [game_id, setting, ''] + [''] * (len(header) - 3)
        db['settings_rows'].append(row)
    row[3] = everyone
    for name, value in players.items():
        row[header.index(name)] = value


def _pub(p):
    return {k: p[k] for k in ('profile_id', 'nickname', 'avatar', 'colour', 'skin')}


def _stars_total(db, pid):
    return sum(s['stars'] for s in db['scores'] if s['profile_id'] == pid)


def _profile(db, pid):
    p = next(x for x in db['profiles'] if x['profile_id'] == pid)
    sc = sorted([s for s in db['scores'] if s['profile_id'] == pid], key=lambda s: s['played_at'], reverse=True)
    games = {}
    for s in sc:
        g = games.setdefault(s['game_id'], {'plays': 0, 'best': None, 'best_stars': 0, 'last_played': None})
        g['plays'] += 1
        g['best'] = s['score'] if g['best'] is None else max(g['best'], s['score'])
        g['best_stars'] = max(g['best_stars'], s['stars'])
    progress = {gid: v for (p_id, gid), v in db['progress'].items() if p_id == pid}
    return {'ok': True, 'profile': _pub(p), 'recent': sc[:10],
            'stats': {'total_plays': len(sc), 'stars_total': _stars_total(db, pid), 'games': games,
                      'days_played': sorted({s['played_at'][:10] for s in sc})},
            'achievements': [{'achievement_id': a['achievement_id'], 'earned_at': a['earned_at']}
                             for a in db['achievements'] if a['profile_id'] == pid],
            'progress': progress}


def _settings(db):
    header = db['settings_header']
    by_name = {p['nickname'].strip().lower(): p['profile_id'] for p in db['profiles']}
    ids = {p['profile_id'] for p in db['profiles']}
    cols, warnings = {}, []
    for i, h in enumerate(header[4:], start=4):
        key = str(h).strip()
        if not key:
            continue
        pid = key if key in ids else by_name.get(key.lower())
        if pid:
            cols[i] = pid
        else:
            warnings.append(f'Settings column "{key}" doesn\'t match a player, so it is ignored')
    out = []
    for r in db['settings_rows']:
        players = {pid: r[i] for i, pid in cols.items() if i < len(r) and str(r[i]).strip() != ''}
        out.append({'game_id': str(r[0]).strip().lower(), 'setting': str(r[1]).strip().lower(),
                    'everyone': r[3], 'players': players})
    return {'ok': True, 'version': VERSION, 'settings': out, 'lists': db['lists'], 'warnings': warnings}


def handle(db, body):
    if body.get('code') != CODE:
        return {'ok': False, 'error': 'wrong_code'}
    a = body.get('action')
    db['calls'].append(a)
    if a == 'ping':
        return {'ok': True, 'version': VERSION}
    if a == 'profiles':
        return {'ok': True, 'version': VERSION, 'profiles': [_pub(p) for p in db['profiles']], 'skins': db['skins']}
    if a == 'profile':
        return _profile(db, body['profile_id'])
    if a == 'settings':
        return _settings(db)
    if a == 'addProfile':
        p = {'profile_id': 'p_' + uuid.uuid4().hex[:10], 'nickname': body['nickname'], 'avatar': body.get('avatar', 'fox'),
             'colour': body.get('colour', '#F07A2A'), 'active': True, 'skin': 'sticker'}
        db['profiles'].append(p)
        if p['nickname'] not in db['settings_header']:
            db['settings_header'].append(p['nickname'])
            for r in db['settings_rows']:
                r.append('')
        return {'ok': True, 'profile': _pub(p)}
    if a == 'updateProfile':
        p = next(x for x in db['profiles'] if x['profile_id'] == body['profile_id'])
        if 'skin' in body:
            sk = next((s for s in db['skins'] if s['skin_id'] == body['skin']), None)
            if not sk:
                return {'ok': False, 'error': 'no_such_skin'}
            if _stars_total(db, p['profile_id']) < sk['stars_needed']:
                return {'ok': False, 'error': 'skin_locked'}
        for k in ('nickname', 'avatar', 'colour', 'skin'):
            if k in body:
                p[k] = body[k]
        return {'ok': True, 'profile': _pub(p)}
    if a == 'sync':
        seen = {s['event_id'] for s in db['scores']}
        acc, dup = [], []
        for r in body.get('results', []):
            if r['event_id'] in seen:
                dup.append(r['event_id'])
                continue
            db['scores'].append(r)
            acc.append(r['event_id'])
        rec = []
        for x in body.get('achievements', []):
            key = x['profile_id'] + '|' + x['achievement_id']
            if not any(y['profile_id'] + '|' + y['achievement_id'] == key for y in db['achievements']):
                db['achievements'].append(x)
            rec.append(key)
        saved = []
        for pr in body.get('progress', []):
            key = (pr['profile_id'], pr['game_id'])
            old = db['progress'].get(key)
            if not old or str(pr['updated_at']) >= str(old['updated_at']):
                db['progress'][key] = {'data': pr['data'], 'updated_at': pr['updated_at']}
            saved.append(f"{pr['profile_id']}|{pr['game_id']}|{pr['updated_at']}")
        return {'ok': True, 'accepted': acc, 'duplicates': dup, 'rejected': [], 'achievements_recorded': rec,
                'progress_saved': saved}
    return {'ok': False, 'error': 'unknown_action'}


def new_page(browser, db, w, h, mobile=False, errors=None):
    """A page with the family code set and Apps Script answered by the stand-in."""
    errors = errors if errors is not None else []
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile)
    ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));")
    ctx.route(re.compile(r'https://script\.google\.com/.*'),
              lambda route: route.fulfill(status=200, content_type='application/json',
                                          body=json.dumps(handle(db, json.loads(route.request.post_data or '{}')))))
    # Google Fonts aren't reachable from the test machine; pages fall back to system fonts.
    ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}')
          if m.type in ('error', 'warning') and 'fonts' not in m.text and 'ERR_FAILED' not in m.text else None)
    return pg
