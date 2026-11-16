"""Hamster Highway release check (contract 0.4.2, GC7), through P-020's wrapper. Version 1.1.

Changes at v1.1 (step 8, D-170, D-171): level 1's help card pops up the first time each child opens it; play_level1
closes it with its tick, as a child would, and the progress sent is format 2, with the bridge's card seen. Not yet
run at 1.1: it runs at the release (step 11), extended there for the 20 levels.

See ../harness.py for how to run it (serve the repo root on 127.0.0.1:8123 first). Ends "PASS n of n".
Made-up players only (Sam and Alex, the harness's). It checks, in the wrapper (play.html):
  1. the three sizes: the game fits under the bar, is linked, opens its house at level 1, plays
     level 1 to its own party (GC7.2, GC7.6), its progress goes out with fg:state and nothing is
     kept on the device by the game (D-147, GC7.5);
  2. coming back: the same child's house opens where they were (fg:start);
  3. another child starts at level 1; the first child's progress is untouched;
  4. sound off: the game is told, its sound button is hidden and no audio is made; sound on makes
     sound (GC7.3; the game says nothing either way);
  5. a slow Sheet (P81): the wrapper's start comes after about 3 s and the game still takes it;
  6. two devices (script 0.4.0): progress made on one opens on the other;
and, on its own (GC5, GC7.4): not linked, plays, and its progress is kept on the device.

games.json is P-020's (D-113): until it lists Hamster Highway, the test browser is served a copy with
a `testing` entry added; the repo's file is never changed.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-hamster-highway'
GAME = 'hamster-highway'
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
DEVICE_KEY = f'family-games:{GAME}:progress'  # the game's own entry when it runs on its own (game.js)
ENTRY = {'id': GAME, 'title': 'Hamster Highway', 'icon': 'g-planet', 'colour': '#E8823B',
         'folder': f'games/{GAME}/', 'status': 'testing'}
L1_DONE = {'v': 2, 'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 1}, 'cards': {'bridge': True}}
# Counts every audio context made and every word said, in any page of the context.
COUNT_SOUND = """(() => { window.__made = { audio: 0, said: 0 };
  for (const n of ['AudioContext', 'webkitAudioContext']) { const R = window[n]; if (typeof R !== 'function') continue;
    window[n] = class extends R { constructor(...a) { super(...a); window.__made.audio++; } }; }
  if (window.speechSynthesis) { const s = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { window.__made.said++; return s(u); }; } })()"""


def games_json():
    with open(os.path.join(REPO, 'games.json'), encoding='utf-8') as f:
        d = json.load(f)
    if not any(g.get('id') == GAME for g in d['games']):
        d['games'].insert(0, ENTRY)
    return json.dumps(d)


BODY = games_json()


def device(browser, w=1366, h=768, mobile=False, muted=False):
    ctx, pg = c.page(browser, w, h, mobile, muted=muted)
    ctx.route(re.compile(r'.*/games\.json(\?.*)?$'), lambda route: route.fulfill(status=200, content_type='application/json', body=BODY))
    return ctx, pg


def game(pg):
    return pg.frames[1]


def st(f):
    return f.evaluate('window.__test ? __test.state() : null')


def kept(pg, pid='p_sam'):
    """The state the wrapper keeps for this child on this device ({state, at, sent}), or None."""
    return json.loads(pg.evaluate(f"localStorage.getItem('fg.state.{pid}.{GAME}')") or 'null')


def tap(pg, f, sel):
    """A click in the middle of an element in the game's frame (page pixels)."""
    b = f.locator(sel).first.bounding_box()
    x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    pg.mouse.click(x, y)


def square(pg, f, col, row):
    """A click on a board square: the game's point inside its frame, plus where the frame sits."""
    o = f.frame_element().bounding_box() if f != pg.main_frame else {'x': 0, 'y': 0}
    p = f.evaluate(f'__test.cellPoint({col}, {row})')
    pg.mouse.click(o['x'] + p['x'], o['y'] + p['y'])


def to_house(pg, f):
    f.wait_for_function('window.__test && __test.state().ready', timeout=10000)
    tap(pg, f, '#play')
    f.wait_for_function('__test.state().screen === "house"', timeout=5000)
    f.wait_for_timeout(300)


def play_level1(pg, f):
    """Level 1 as a child plays it: open it, the bridge over the gap (5,6), GO, to the party."""
    tap(pg, f, '[data-level="0"]')
    f.wait_for_function('__test.state().level === "L1" && __test.state().screen === "level"', timeout=5000)
    f.wait_for_timeout(300)
    if st(f)['card']:   # the bridge's help card, the first time this child opens level 1 (D-170)
        tap(pg, f, '#card [data-btn="cardok"]')
        f.wait_for_function('__test.state().card === null', timeout=5000)
    tap(pg, f, '[data-slot="bridge"]')
    square(pg, f, 5, 6)
    f.evaluate('__test.speed(8)')
    tap(pg, f, '[data-btn="go"]')
    f.wait_for_function('__test.state().mode === "party"', timeout=30000)
    f.wait_for_timeout(600)


def reopen(pg, pid='p_sam', wait=3500):
    """⌂ Home on the wrapper's bar, then the tile again (as the same or another child)."""
    pg.click('#home'); pg.wait_for_selector('.home')
    if pid != (pg.evaluate("new URLSearchParams(location.search).get('player')") or pid):
        pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home')
    pg.wait_for_timeout(800)
    pg.click(f'[data-g="{GAME}"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(wait)
    return game(pg)


c = Check(GAME, OUT)
with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. The three sizes, each a new device with a new child.
    for name, w, h, mobile in SIZES:
        ctx, pg = device(browser, w, h, mobile)
        c.open_game(pg, wait=3000)
        f = game(pg)
        c.fits_under_bar(pg, name, w, h)
        s = st(f)
        c.check(f'{name}: linked to the wrapper', s and s['linked'] is True, s and s['linked'])
        pg.screenshot(path=f'{OUT}/1-{name}-title.png')
        to_house(pg, f)
        s = st(f)
        c.check(f'{name}: a new child\'s house opens at level 1', s['at'] == 0 and s['progress'] == {'done': {}, 'seeds': {}, 'tries': {}, 'cards': {}}, (s['at'], s['progress']))
        pg.screenshot(path=f'{OUT}/2-{name}-house.png')
        play_level1(pg, f)
        s = st(f)
        c.check(f'{name}: level 1 played to its own party, all five home (GC7.2)', f.locator('#party').is_visible() and s['home'] == 5, s['home'])
        pg.screenshot(path=f'{OUT}/3-{name}-party.png')
        k = kept(pg)
        c.check(f'{name}: the progress goes out with fg:state (GC7.5)', k and k['state'] == L1_DONE, k and k['state'])
        c.check(f'{name}: the game keeps nothing on the device in the wrapper (D-147)', f.evaluate(f"localStorage.getItem('{DEVICE_KEY}')") is None)
        c.check(f'{name}: no sideways scrolling in the game', not f.evaluate('document.scrollingElement.scrollWidth > innerWidth'))
        ctx.close()

    # 2 and 3. Coming back, and another child, on one device.
    ctx, pg = device(browser)
    c.open_game(pg, wait=3000)
    f = game(pg)
    to_house(pg, f)
    play_level1(pg, f)
    f = reopen(pg)
    to_house(pg, f)
    s = st(f)
    c.check('the same child comes back to their house: level 1 done, level 2 waiting',
            s['progress'] == {k: L1_DONE[k] for k in ('done', 'seeds', 'tries', 'cards')} and s['at'] == 1
            and f.locator('[data-level="1"].locked').count() == 0, (s['at'], s['progress']))
    f = reopen(pg, 'p_alex')
    to_house(pg, f)
    s = st(f)
    c.check('another child starts at level 1 with nothing done', s['at'] == 0 and s['progress']['done'] == {}
            and f.locator('[data-level="1"].locked').count() == 1, (s['at'], s['progress']))
    c.check('the first child\'s progress is untouched', kept(pg, 'p_sam')['state'] == L1_DONE, kept(pg, 'p_sam'))
    ctx.close()

    # 4. Sound off makes no sound and says nothing; sound on makes sound (the counter works).
    for muted in (True, False):
        ctx, pg = device(browser, muted=muted)
        ctx.add_init_script(COUNT_SOUND)
        c.open_game(pg, wait=3000)
        f = game(pg)
        s = st(f)
        c.check(f'sound {"off" if muted else "on"}: the game is told', s['muted'] is muted, s['muted'])
        to_house(pg, f)
        c.check(f'sound {"off" if muted else "on"}: the game\'s own sound button is {"hidden" if muted else "shown"}',
                f.locator('#sound').is_visible() is (not muted))
        play_level1(pg, f)
        made = f.evaluate('window.__made')
        if muted:
            c.check('sound off: no audio made and nothing said (GC7.3)', made['audio'] == 0 and made['said'] == 0, made)
        else:
            c.check('sound on: audio made, and nothing said (the game has no words)', made['audio'] > 0 and made['said'] == 0, made)
        ctx.close()

    # 5. A slow Sheet (P81): the wrapper waits up to 3 s for it before fg:start; the game waits 5 s.
    c.script = '0.4.0'
    c.states[('p_sam', GAME)] = {'state': L1_DONE, 'at': '2026-01-01T00:00:00.000Z'}
    ctx, pg = device(browser)
    pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1000)
    c.hold = True
    pg.click(f'[data-g="{GAME}"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(4500)
    c.release()
    f = game(pg)
    f.wait_for_function('window.__test && __test.state().ready', timeout=10000)
    s = st(f)
    c.check('slow Sheet: the game still takes the wrapper\'s start, with the child\'s progress from the Sheet',
            s['linked'] is True and s['progress']['done'] == {'L1': True} and s['at'] == 1, (s['linked'], s['progress']))
    ctx.close()
    c.states.clear()

    # 6. Two devices through the stand-in Sheet (script 0.4.0): progress made on one opens on the other.
    one, p1 = device(browser)
    c.open_game(p1, wait=3000)
    f1 = game(p1)
    to_house(p1, f1)
    play_level1(p1, f1)
    p1.click('#home'); p1.wait_for_selector('.home'); p1.wait_for_timeout(1500)
    sheet = c.states.get(('p_sam', GAME))
    c.check('device 1: the progress reaches the Sheet', sheet and sheet['state'] == L1_DONE, sheet)
    two, p2 = device(browser)
    c.open_game(p2, wait=3500)
    f2 = game(p2)
    to_house(p2, f2)
    s = st(f2)
    c.check('device 2: the same child opens their house from device 1, level 2 waiting',
            s['progress']['done'] == {'L1': True} and s['at'] == 1, s['progress'])
    one.close(); two.close()
    c.script = '0.3.0'

    # 7. On its own (GC5, GC7.4): not linked, plays, and its progress is kept on the device.
    ctx, pg = device(browser, 844, 390, True)
    pg.goto(BASE + f'games/{GAME}/index.html'); pg.wait_for_timeout(2500)
    f = pg.main_frame
    s = st(f)
    c.check('on its own: runs at once, not linked', s and s['ready'] and s['linked'] is False, s and (s['ready'], s['linked']))
    to_house(pg, f)
    play_level1(pg, f)
    c.check('on its own: progress kept on the device',
            json.loads(pg.evaluate(f"localStorage.getItem('{DEVICE_KEY}')") or 'null') == L1_DONE)
    pg.screenshot(path=f'{OUT}/4-alone-party.png')
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
