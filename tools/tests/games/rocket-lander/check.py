"""Rocket Lander release check (contract 0.4.2, GC7), through P-020's wrapper. Version 1.0.

See ../harness.py for how to run it (serve the repo root on 127.0.0.1:8123 first). Ends "PASS n of n".
Made-up players only (Sam and Alex, the harness's). It checks, in the wrapper (play.html):
  1. the three sizes: a new child is asked once which track (D-121), the game fits under the bar,
     has no Home of its own (D-118), plays a round to its own end card (GC7.2, GC7.6), and its
     progress goes out with fg:state and nothing is kept on the device by the game (D-042, GC7.5);
  2. coming back: the same child goes straight to their map, track and moon rocks (fg:start);
  3. another child gets their own track pick and map; the first child's is untouched;
  4. sound off: no audio is made and nothing is said, and sound on does both (GC7.3);
  5. a slow Sheet (P81): the wrapper's start comes after about 3 s and the game still takes it;
  6. two devices (script 0.4.0): progress made on one opens on the other;
and, on its own (GC5, GC7.4): no pick, its own Home, and progress kept on the device as before.

games.json is P-020's (D-113): until it lists Rocket Lander, the test browser is served a copy with
a `testing` entry added; the repo's file is never changed.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-rocket-lander'
GAME = 'rocket-lander'
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
DEVICE_KEY = f'family-games:{GAME}:progress'  # the game's own entry when it runs on its own (kit.js)
ENTRY = {'id': GAME, 'title': 'Rocket Lander', 'icon': 'g-planet', 'colour': '#5B4CC4',
         'folder': f'games/{GAME}/', 'status': 'testing'}
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
    """A real tap in the middle of an element in the game's frame (page pixels)."""
    b = f.locator(sel).bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def own_home(f):
    # (the button is position: fixed, so offsetParent can't tell; its box can)
    return f.evaluate("[...document.querySelectorAll('button[aria-label=\"Back to games\"]')].some((b) => !b.hidden && b.getClientRects().length > 0)")


def pick_shown(f):
    return f.evaluate("(() => { const e = document.getElementById('track-pick'); return !!e && !e.hidden && !!e.offsetParent; })()")


def play_round(f, landings=3):
    """Play Rocket Lander's waiting level as a round of `landings`, all right, to its end card."""
    f.evaluate(f'__test.begin({{ settings: {{ landings_per_round: {landings} }} }})')
    f.wait_for_timeout(300)
    f.evaluate("document.getElementById('play').click()")
    for i in range(landings):
        f.wait_for_function(f'__test.state().phase === "fly" && __test.state().idx === {i}', timeout=20000)
        f.wait_for_timeout(120)
        f.evaluate('__test.right()')
        f.wait_for_function('__test.state().phase === "landed"', timeout=10000)
        f.evaluate('__test.speed(4)')
        f.wait_for_function(f'(() => {{ const s = __test.state(); return s.phase === "finale" || s.phase === "end" || (s.phase === "fly" && s.idx === {i + 1}); }})()', timeout=20000)
        f.evaluate('__test.speed(1)')
    f.evaluate('__test.speed(4)')
    f.wait_for_function('__test.state().phase === "end"', timeout=30000)
    f.evaluate('__test.speed(1)')
    f.wait_for_timeout(500)


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
        c.check(f'{name}: a new child is asked which track (D-121)', pick_shown(f))
        pg.screenshot(path=f'{OUT}/1-{name}-pick.png')
        c.check(f'{name}: no Home of its own inside the wrapper (D-118)', not own_home(f))
        tap(pg, f, '[data-track="year2"]')
        f.wait_for_timeout(1500)
        s = st(f)
        c.check(f'{name}: linked to the wrapper', s['linked'] is True, s['linked'])
        c.check(f'{name}: the pick opens that track\'s map', not pick_shown(f) and s['track'] == 'year2' and s['screen'] == 'map', (s['track'], s['screen']))
        k = kept(pg)
        c.check(f'{name}: the pick goes out with fg:state at once', k and k['state'] and k['state'].get('track') == 'year2', k)
        pg.screenshot(path=f'{OUT}/2-{name}-map.png')
        play_round(f)
        c.check(f'{name}: its own end of round (GC7.2)', f.locator('#end').is_visible())
        pg.screenshot(path=f'{OUT}/3-{name}-end.png')
        k = kept(pg)
        c.check(f'{name}: the round\'s progress goes out with fg:state (GC7.5)',
                k and k['state'].get('landings', 0) >= 3, k and k['state'])
        c.check(f'{name}: the game keeps nothing on the device in the wrapper (D-042)', f.evaluate(f"localStorage.getItem('{DEVICE_KEY}')") is None)
        c.check(f'{name}: still no Home of its own after a round', not own_home(f))
        ctx.close()

    # 2 and 3. Coming back, and another child, on one device.
    ctx, pg = device(browser)
    c.open_game(pg, wait=3000)
    f = game(pg)
    tap(pg, f, '[data-track="year2"]'); f.wait_for_timeout(1200)
    play_round(f)
    sam = kept(pg)['state']
    f = reopen(pg)
    s = st(f)
    c.check('the same child comes back to their map, track and rocks, with no pick',
            not pick_shown(f) and s['track'] == 'year2' and s['rocks'] == sam.get('rocks', 0) and s['progress']['landings'] == sam['landings'],
            (s['track'], s['rocks'], sam.get('rocks')))
    f = reopen(pg, 'p_alex')
    c.check('another child is asked for their own track', pick_shown(f))
    tap(pg, f, '[data-track="reception"]'); f.wait_for_timeout(1200)
    s = st(f)
    c.check('and gets their own map, from the start', s['track'] == 'reception' and s['rocks'] == 0 and s['progress']['landings'] == 0, s['progress'])
    c.check('the first child\'s progress is untouched', kept(pg, 'p_sam')['state'] == sam)
    ctx.close()

    # 4. Sound off makes no sound and says nothing; sound on does both (the counter works).
    for muted in (True, False):
        ctx, pg = device(browser, muted=muted)
        ctx.add_init_script(COUNT_SOUND)
        c.open_game(pg, wait=3000)
        f = game(pg)
        tap(pg, f, '[data-track="reception"]'); f.wait_for_timeout(800)
        c.check(f'sound {"off" if muted else "on"}: the game is told', st(f)['muted'] is muted, st(f)['muted'])
        f.evaluate("__test.begin({ settings: { speak: true } })")
        play_round(f)
        made = f.evaluate('window.__made')
        if muted:
            c.check('sound off: no audio made and nothing said (GC7.3)', made['audio'] == 0 and made['said'] == 0, made)
        else:
            c.check('sound on: audio made and words said', made['audio'] > 0 and made['said'] > 0, made)
        ctx.close()

    # 5. A slow Sheet (P81): the wrapper waits up to 3 s for it before fg:start; the game waits 5 s.
    c.script = '0.4.0'
    ctx, pg = device(browser)
    pg.goto(BASE + 'index.html?player=p_sam'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1000)
    c.hold = True
    pg.click(f'[data-g="{GAME}"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(4500)
    c.release()
    f = game(pg)
    c.check('slow Sheet: the game still takes the wrapper\'s start (the pick shows only in the wrapper)', pick_shown(f))
    tap(pg, f, '[data-track="reception"]'); f.wait_for_timeout(800)
    c.check('slow Sheet: and plays linked', st(f)['linked'] is True)
    ctx.close()

    # 6. Two devices through the stand-in Sheet (script 0.4.0): progress made on one opens on the other.
    one, p1 = device(browser)
    c.open_game(p1, wait=3000)
    f1 = game(p1)
    tap(p1, f1, '[data-track="year2"]'); f1.wait_for_timeout(1000)
    play_round(f1)
    made = st(f1)['progress']
    p1.click('#home'); p1.wait_for_selector('.home'); p1.wait_for_timeout(1500)
    sheet = c.states.get(('p_sam', GAME))
    c.check('device 1: the progress reaches the Sheet', sheet and sheet['state'].get('track') == 'year2' and sheet['state'].get('landings') == made['landings'], sheet)
    two, p2 = device(browser)
    c.open_game(p2, wait=3500)
    f2 = game(p2)
    s = st(f2)
    c.check('device 2: the same child opens their map from device 1, with no pick',
            not pick_shown(f2) and s['track'] == 'year2' and s['progress']['landings'] == made['landings'], s['progress'])
    one.close(); two.close()
    c.script = '0.3.0'

    # 7. On its own (GC5, GC7.4): as before, with its own Home and progress kept on the device.
    ctx, pg = device(browser, 390, 844, True)
    pg.goto(BASE + f'games/{GAME}/index.html'); pg.wait_for_timeout(2500)
    s = st(pg.main_frame)
    c.check('on its own: runs at once, not linked, no pick, its own Home',
            s and s.get('linked') is False and s['screen'] == 'map' and not pick_shown(pg.main_frame) and own_home(pg.main_frame), s and (s.get('linked'), s['screen']))
    play_round(pg.main_frame)
    c.check('on its own: progress kept on the device', pg.evaluate(f"localStorage.getItem('{DEVICE_KEY}')") is not None)
    pg.screenshot(path=f'{OUT}/4-alone-end.png')
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
