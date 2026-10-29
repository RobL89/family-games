"""Browser test for Rocket Lander, run against the stand-in Sheet (no real Sheet is touched).
Needs Python Playwright. From the repo root: python3 -m http.server 8133 --bind 127.0.0.1
then: python3 tools/tests/e2e_rocket-lander.py <folder for screenshots> [port]

Plays full rounds on a phone (390x844) and a PC (1280x800), checks the result and the
progress reached the stand-in, tries the settings variations and screenshots each.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from standin import make_db, new_page, set_setting
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
PORT = sys.argv[2] if len(sys.argv) > 2 else '8133'
BASE = f'http://127.0.0.1:{PORT}/games/rocket-lander/index.html?player=p_sam'
GAME = 'rocket-lander'
os.makedirs(OUT, exist_ok=True)

errors, infos, fails = [], [], []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


def state(pg):
    return pg.evaluate('__test.state()')


def open_game(br, db, w, h, mobile):
    pg = new_page(br, db, w, h, mobile=mobile, errors=errors)
    pg.on('console', lambda m: infos.append(m.text) if m.type == 'info' else None)
    pg.goto(BASE)
    pg.wait_for_function('window.__test && __test.state().ready')
    pg.wait_for_timeout(300)
    return pg


def start(pg):
    pg.click('#play', force=True)  # force: the Play button gently "breathes"
    pg.wait_for_function('__test.state().phase === "fly"')


def wait_fly(pg, idx):
    pg.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "end" || (s.phase === "fly" && s.idx === {idx}); }})()', timeout=20000)


def land(pg, good, shot=None, wait=1700):
    """One landing: good=True lands on the target, False just beside it."""
    idx = state(pg)['idx']
    pg.wait_for_timeout(250)
    if good:
        pg.evaluate('__test.right()')
    else:
        pg.evaluate('__test.wrong()')
    pg.wait_for_function('__test.state().phase === "landed"')
    if shot:
        pg.wait_for_timeout(wait)
        pg.screenshot(path=f'{OUT}/{shot}.png')
    pg.evaluate('__test.speed(4)')
    wait_fly(pg, idx + 1)
    pg.evaluate('__test.speed(1)')


def play_round(pg, pattern, shots=None):
    shots = shots or {}
    for i, good in enumerate(pattern):
        land(pg, good, shots.get(i), 1700 if good else 1500)
    pg.wait_for_function('__test.state().phase === "end"')


def steer_by_hand(pg, mobile):
    """Real input: hold/drag (phone) or keys (PC) and check the rocket moves that way."""
    s = state(pg)
    x0 = s['rocketX']
    target_x = s['x1'] if x0 < (s['x0'] + s['x1']) / 2 else s['x0']
    if mobile:
        cdp = pg.context.new_cdp_session(pg)
        y = 400
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': target_x, 'y': y}]})
        pg.wait_for_timeout(700)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        key = 'ArrowRight' if target_x > x0 else 'ArrowLeft'
        pg.keyboard.down(key)
        pg.wait_for_timeout(600)
        pg.keyboard.up(key)
    x1 = state(pg)['rocketX']
    check(abs(x1 - x0) > 40 and (x1 - x0) * (target_x - x0) > 0, f'rocket steers towards the {"finger" if mobile else "arrow key"} ({x0:.0f} -> {x1:.0f})')


with sync_playwright() as pw:
    br = pw.chromium.launch()

    # ---------- Phone: a full round with default settings (0 to 10) ----------
    db = make_db()
    ph = open_game(br, db, 390, 844, True)
    ph.screenshot(path=f'{OUT}/ph-start.png')
    s = state(ph)
    check(s['line'] == {'from': 0, 'to': 10, 'step': 1, 'count': 11}, 'default line is 0 to 10 in ones')
    check(s['labels'] == [str(i) for i in range(11)], f'phone shows every number 0 to 10: {s["labels"]}')
    start(ph)
    s = state(ph)
    check(abs(s['startX'] - ph.evaluate(f'__test.xOf({s["target"]})')) > 50, 'rocket does not start straight above the target')
    ph.wait_for_timeout(1300)
    ph.screenshot(path=f'{OUT}/ph-fly.png')
    steer_by_hand(ph, True)
    # 7 right of 8 = 87.5% -> 3 stars
    play_round(ph, [True, True, False, True, True, True, True, True], {0: 'ph-right', 2: 'ph-wrong'})
    ph.wait_for_timeout(1600)
    ph.screenshot(path=f'{OUT}/ph-end.png')
    s = state(ph)
    check(s['right'] == 7, f'7 right landings counted ({s["right"]})')
    check(s['unlockedNew'] == 1, 'a 3-star round unlocks the next planet')
    ph.wait_for_timeout(1500)
    rows = [r for r in db['scores'] if r['game_id'] == GAME]
    check(len(rows) == 1 and rows[0]['stars'] == 3, f'result reached the stand-in with 3 stars: {rows}')
    check(rows and rows[0]['score'] == 7 + s['perfects'], f'score = right + perfects ({rows[0]["score"] if rows else None})')
    prog = db['progress'].get(('p_sam', GAME))
    check(bool(prog) and prog['data'].get('unlocked') == 2 and prog['data'].get('landings') == 7
          and prog['data'].get('planet') == 'dust' and prog['data'].get('rocks') == s['perfects'],
          f'progress reached the stand-in: {prog and prog["data"]}')

    # Back to the start screen with two planets unlocked: the planet picker
    ph.reload()
    ph.wait_for_function('window.__test && __test.state().ready')
    ph.wait_for_timeout(600)
    ph.screenshot(path=f'{OUT}/ph-picker-two.png')
    check(ph.locator('.planet:not([aria-disabled])').count() == 2, 'picker: two planets can be tapped')
    # The picked planet changes the scenery; play a round on Red Dust with a 1-star result
    start(ph)
    ph.wait_for_timeout(900)
    ph.screenshot(path=f'{OUT}/ph-dust-fly.png')
    play_round(ph, [True, False, False, True, False, False, False, False])
    ph.wait_for_timeout(1400)
    ph.screenshot(path=f'{OUT}/ph-end-1star.png')
    ph.wait_for_timeout(800)
    rows = [r for r in db['scores'] if r['game_id'] == GAME]
    check(len(rows) == 2 and rows[1]['stars'] == 1, '2 of 8 right gives 1 star')
    check(db['progress'][('p_sam', GAME)]['data']['unlocked'] == 2, 'a 1-star round unlocks nothing')
    ph.context.close()

    # ---------- PC: a full round, mouse and keys ----------
    db = make_db()
    pc = open_game(br, db, 1280, 800, False)
    pc.screenshot(path=f'{OUT}/pc-start.png')
    start(pc)
    pc.wait_for_timeout(1000)
    steer_by_hand(pc, False)
    # mouse: hold the button and the rocket glides towards the pointer
    s = state(pc)
    gx = 200 if s['rocketX'] > 640 else 1080
    pc.mouse.move(gx, 400); pc.mouse.down(); pc.wait_for_timeout(800); pc.mouse.up()
    s2 = state(pc)
    check((s2['rocketX'] - s['rocketX']) * (gx - s['rocketX']) > 0 and abs(s2['rocketX'] - s['rocketX']) > 60, 'holding the mouse glides the rocket towards the pointer')
    pc.screenshot(path=f'{OUT}/pc-fly.png')
    # 5 of 8 = 62.5% -> 2 stars
    play_round(pc, [True, False, True, True, False, True, False, True], {0: 'pc-right', 1: 'pc-wrong'})
    pc.wait_for_timeout(1700)
    pc.screenshot(path=f'{OUT}/pc-end.png')
    pc.wait_for_timeout(800)
    rows = [r for r in db['scores'] if r['game_id'] == GAME]
    check(len(rows) == 1 and rows[0]['stars'] == 2, f'PC: 5 of 8 gives 2 stars: {rows}')
    check(db['progress'].get(('p_sam', GAME), {}).get('data', {}).get('unlocked') == 2, 'PC: 2 stars unlocks the next planet')
    pc.context.close()

    # ---------- Landscape phone ----------
    db = make_db()
    ls = open_game(br, db, 844, 390, True)
    ls.screenshot(path=f'{OUT}/land-start.png')
    start(ls)
    land(ls, True, 'land-right')
    land(ls, False, 'land-wrong')
    ls.context.close()

    # ---------- Settings variations ----------
    def variation(name, w, h, mobile, settings, expect=None, play=(True, False), progress=None):
        db = make_db()
        for k, v in settings.items():
            set_setting(db, GAME, k, str(v))
        if progress:
            db['progress'][('p_sam', GAME)] = {'data': progress, 'updated_at': '2026-10-29T08:00:00Z'}
        pg = open_game(br, db, w, h, mobile)
        start(pg)
        s = state(pg)
        if expect:
            expect(s)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{OUT}/{name}-fly.png')
        for i, good in enumerate(play):
            land(pg, good, f'{name}-{"right" if good else "wrong"}', 1700 if good else 1500)
        pg.context.close()

    def v100(s):
        check(s['line']['count'] == 101 and s['labels'] == [str(i) for i in range(0, 101, 10)], f'0-100: labels every 10 ({s["labels"]})')
        check(s['tight'] and s['allowed'] == 5, f'0-100 on a phone: marks too close, so within 5 counts (allowed {s["allowed"]})')
    variation('v100-ph', 390, 844, True, {'from': 0, 'to': 100, 'step': 1, 'label_every': 10}, v100)
    variation('v100-pc', 1280, 800, False, {'from': 0, 'to': 100, 'step': 1, 'label_every': 10},
              lambda s: check(s['tight'] and s['allowed'] == 5, f'0-100 on PC: {s["pps"]:.1f}px apart, within 5 counts'))

    def vhalf(s):
        check(s['labels'] == ['0', '½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5'], f'0-5 in halves shown as fractions: {s["labels"]}')
    variation('vhalf-ph', 390, 844, True, {'from': 0, 'to': 5, 'step': 0.5, 'label_every': 0.5}, vhalf)
    variation('vhalf-pc', 1280, 800, False, {'from': 0, 'to': 5, 'step': 0.5}, None, play=(True,))
    variation('vhalf-dec-pc', 1280, 800, False, {'from': 0, 'to': 5, 'step': 0.5, 'label_every': 0.5, 'show_as': 'decimal'},
              lambda s: check('2.5' in s['labels'] and '0.5' in s['labels'], f'decimal: {s["labels"]}'), play=(False,))

    def vneg(s):
        check(s['labels'] == ['−10', '−5', '0', '5', '10'], f'-10 to 10 every 5 with a proper minus: {s["labels"]}')
    variation('vneg-ph', 390, 844, True, {'from': -10, 'to': 10, 'label_every': 5}, vneg)
    variation('vneg-pc', 1280, 800, False, {'from': -10, 'to': 10, 'label_every': 5}, vneg, play=(False,))

    # speed 1: about 12 seconds from the top to the ground (speed 2: about 8)
    def measure_fall(speed):
        db = make_db()
        if speed is not None:
            set_setting(db, GAME, 'speed', str(speed))
        pg = open_game(br, db, 390, 844, True)
        start(pg)
        pg.wait_for_timeout(1200)
        a = state(pg)
        pg.wait_for_timeout(2000)
        b = state(pg)
        per_sec = (b['rocketY'] - a['rocketY']) / 2.0
        secs = (a['touchY'] - a['startY']) / per_sec
        if speed == 1:
            pg.screenshot(path=f'{OUT}/speed1-ph.png')
        pg.context.close()
        return secs
    s1, s2 = measure_fall(1), measure_fall(None)
    check(11 < s1 < 13.2, f'speed 1 takes about 12 s to fall ({s1:.1f} s)')
    check(7.2 < s2 < 8.8, f'speed 2 (default) takes about 8 s to fall ({s2:.1f} s)')

    # odd settings are fixed and explained with console.info
    infos.clear()
    db = make_db()
    set_setting(db, GAME, 'from', '10'); set_setting(db, GAME, 'to', '0')
    pg = open_game(br, db, 390, 844, True)
    start(pg)
    s = state(pg)
    check(s['line']['from'] == 0 and s['line']['to'] == 10, 'to below from: the ends are swapped')
    check(any('swapped' in m for m in infos), f'console.info explains the fix: {infos}')
    pg.context.close()
    infos.clear()
    db = make_db()
    set_setting(db, GAME, 'from', '0'); set_setting(db, GAME, 'to', '1000'); set_setting(db, GAME, 'step', '0.5'); set_setting(db, GAME, 'label_every', '100')
    pg = open_game(br, db, 390, 844, True)
    start(pg)
    s = state(pg)
    check(s['line']['count'] <= 400, f'more than 400 spots: the step is made bigger ({s["line"]})')
    check(any('more than 400' in m for m in infos), 'console.info explains the bigger step')
    pg.wait_for_timeout(1300)
    pg.screenshot(path=f'{OUT}/v1000-ph.png')
    pg.context.close()

    # close_enough: within 2 counts on a short line
    db = make_db()
    set_setting(db, GAME, 'close_enough', '2')
    pg = open_game(br, db, 1280, 800, False)
    start(pg)
    s = state(pg)
    off = 2 if s['target'] <= 8 else -2
    pg.wait_for_timeout(1300)
    pg.screenshot(path=f'{OUT}/close2-pc-fly.png')
    pg.evaluate(f'__test.right({off})')
    pg.wait_for_function('__test.state().phase === "landed"')
    s = state(pg)
    check(s['results'][0]['right'] and s['results'][0]['spot'] == s['target'] + off, f'close_enough 2: landing 2 away counts ({s["results"][0]})')
    pg.context.close()

    # The planet picker with two planets unlocked (PC), and every planet's scenery
    db = make_db()
    db['progress'][('p_sam', GAME)] = {'data': {'unlocked': 2, 'planet': 'dust', 'rocks': 5, 'landings': 20}, 'updated_at': '2026-10-29T08:00:00Z'}
    pg = open_game(br, db, 1280, 800, False)
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{OUT}/pc-picker-two.png')
    pg.context.close()
    db = make_db()
    db['progress'][('p_sam', GAME)] = {'data': {'unlocked': 6, 'planet': 'moon', 'rocks': 12, 'landings': 80}, 'updated_at': '2026-10-29T08:00:00Z'}
    pg = open_game(br, db, 390, 844, True)
    pg.wait_for_timeout(400)
    pg.screenshot(path=f'{OUT}/ph-picker-all.png')
    for i, name in enumerate(['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed']):
        pg.click(f'.planet[data-i="{i}"]')
        start(pg)
        pg.wait_for_timeout(1400)
        pg.screenshot(path=f'{OUT}/planet-{name}-ph.png')
        pg.reload(); pg.wait_for_function('window.__test && __test.state().ready'); pg.wait_for_timeout(200)
    pg.context.close()
    db = make_db()
    db['progress'][('p_sam', GAME)] = {'data': {'unlocked': 6, 'planet': 'moon', 'rocks': 12, 'landings': 80}, 'updated_at': '2026-10-29T08:00:00Z'}
    pg = open_game(br, db, 1280, 800, False)
    for i, name in enumerate(['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed']):
        pg.click(f'.planet[data-i="{i}"]')
        start(pg)
        pg.wait_for_timeout(1400)
        pg.screenshot(path=f'{OUT}/planet-{name}-pc.png')
        pg.reload(); pg.wait_for_function('window.__test && __test.state().ready'); pg.wait_for_timeout(200)
    pg.context.close()

    br.close()

check(not errors, 'no console errors or warnings' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
