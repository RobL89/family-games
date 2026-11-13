"""Number Town release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". It checks the start of the game: making
an explorer, the Mayor's letter and walking into town; one explorer per child (P70); and the
explorer following the child between two devices through a stand-in Sheet (P77, P78). Its 3D
searches load three.js from cdnjs (set FG_THREE_JS to serve a local copy); the maker's own notes
say phone fixes aren't built yet."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-number-town'
c = Check('number-town', OUT)


def progress(pg, pid):
    """The explorer the wrapper keeps for this child on this device: {explorer, save}, or None."""
    kept = json.loads(pg.evaluate(f"localStorage.getItem('fg.state.{pid}.number-town')") or 'null')
    return kept and kept['state'] and kept['state'].get('progress')


def game_save(page, explorer):
    return json.loads(page.evaluate(f"localStorage.getItem('numberTown.player.{explorer}')") or 'null')


def set_stars(page, explorer, stars):
    """As if the game had saved and the device closed: change the explorer's stars in the game's
    own storage while the game isn't open (an open game would save its own copy over it)."""
    page.evaluate(f"""(() => {{ const k = 'numberTown.player.{explorer}'; const s = JSON.parse(localStorage.getItem(k));
                       s.stars = {stars}; localStorage.setItem(k, JSON.stringify(s)); }})()""")


def into_town(pg, fr, name):
    fr.locator('#nameInput').fill('Sam')
    fr.locator('#goBtn').click(); pg.wait_for_timeout(800)
    fr.locator('#openLetter').click(); pg.wait_for_timeout(1200)
    pg.screenshot(path=f'{OUT}/2-{name}-letter.png')
    fr.locator('#exploreBtn').click(); pg.wait_for_timeout(1500)
    return fr.locator('#btnBackpack').is_visible() and not fr.locator('#letter').is_visible()


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Make an explorer, read the letter and walk into town, at the three sizes.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg, wait=3000)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: starts with "Make your explorer"', fr.locator('#maker').is_visible())
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/1-{name}-maker.png')
        c.check(f'{name}: into town', into_town(pg, fr, name))
        pg.screenshot(path=f'{OUT}/3-{name}-town.png')
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()

    # 2. One explorer per child (P70): no "Who's playing?", and each child gets their own.
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg, wait=3000)
    c.check('a new child makes their explorer, name filled in', fr.locator('#maker').is_visible() and fr.locator('#nameInput').input_value() == 'Sam')
    into_town(pg, fr, 'sam'); pg.wait_for_timeout(2000)
    sam = progress(pg, 'p_sam')
    c.check('the explorer is kept as the child\'s, with its whole save', sam and isinstance(sam.get('explorer'), str) and sam['save']['name'] == 'Sam', sam)
    fr.locator('#btnSettings').click(); pg.wait_for_timeout(300)
    c.check('"Switch explorer" is hidden', not fr.locator('#switchPlayer').is_visible() and fr.locator('#changeLook').is_visible())
    pg.click('#home'); pg.wait_for_selector('.home')
    pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click('[data-p="p_alex"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
    pg.click('[data-g="number-town"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(4500)
    fr = pg.frame_locator('.wframe iframe')
    c.check('another child gets their own new explorer, not "Who\'s playing?"',
            fr.locator('#maker').is_visible() and not fr.locator('#players').is_visible() and fr.locator('#nameInput').input_value() == 'Alex')
    into_town(pg, fr, 'alex'); pg.wait_for_timeout(2000)
    alex = progress(pg, 'p_alex')
    c.check('the second explorer is kept as that child\'s', alex and alex['explorer'] != sam['explorer'], alex)
    pg.click('#home'); pg.wait_for_selector('.home')
    pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click('[data-p="p_sam"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
    pg.click('[data-g="number-town"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(5000)
    fr = pg.frame_locator('.wframe iframe')
    roster = json.loads(pg.frames[1].evaluate("localStorage.getItem('numberTown.players.v1')"))
    c.check('the first child goes straight back to their own explorer',
            fr.locator('#btnBackpack').is_visible() and not fr.locator('#players').is_visible() and roster['ids'] == [sam['explorer']], roster)
    pg.screenshot(path=f'{OUT}/4-sam-back.png')
    ctx.close()

    # 3. The explorer follows the child (P77, P78), with a stand-in Sheet like script 0.4.0.
    #    Two browser contexts are two devices: their storage is separate, the Sheet is shared.
    c.script = '0.4.0'
    one, pg1 = c.page(browser, 1366, 768)
    fr1, f1 = c.open_game(pg1, wait=3000)
    into_town(pg1, fr1, 'device-1'); pg1.wait_for_timeout(5000)
    mine = progress(pg1, 'p_sam')
    c.check('device 1: the new explorer is passed on', mine and mine['save']['name'] == 'Sam', mine)
    sheet = c.states.get(('p_sam', 'number-town'))
    c.check('device 1: and reaches the Sheet within seconds', sheet and sheet['state']['progress']['explorer'] == mine['explorer'], sheet)
    size = len(json.dumps(sheet['state'])) if sheet else 0
    c.check(f'a real save is small ({size} characters, the most is 20,000)', 0 < size < 20000)
    pg1.click('#home'); pg1.wait_for_selector('.home')

    two, pg2 = c.page(browser, 1366, 768)
    fr2, f2 = c.open_game(pg2, wait=6000)
    f2 = pg2.frames[1]
    roster = json.loads(f2.evaluate("localStorage.getItem('numberTown.players.v1')") or 'null')
    c.check('device 2: Sam goes straight to their explorer from device 1',
            fr2.locator('#btnBackpack').is_visible() and not fr2.locator('#maker').is_visible() and roster and roster['ids'] == [mine['explorer']], roster)
    # A change made in the game (its own Settings save at once), then straight to ⌂ Home.
    fr2.locator('#btnSettings').click(); pg2.wait_for_timeout(300)
    fr2.locator('.seg[data-key="difficulty"] button[data-v="hard"]').click(); pg2.wait_for_timeout(300)
    pg2.click('#home'); pg2.wait_for_selector('.home'); pg2.wait_for_timeout(1500)
    sheet = c.states.get(('p_sam', 'number-town'))
    hard = lambda save: bool(save) and save['settings']['difficulty'] == 'hard'
    c.check('device 2: a change in the game goes to the Sheet on ⌂ Home', sheet and hard(sheet['state']['progress']['save']))

    pg1.wait_for_timeout(200)
    pg1.click('[data-g="number-town"]'); pg1.wait_for_selector('.wframe iframe'); pg1.wait_for_timeout(6000)
    back = game_save(pg1, mine['explorer'])
    c.check('device 1: the newer progress from device 2 is put back', hard(back) and pg1.frame_locator('.wframe iframe').locator('#btnBackpack').is_visible(),
            back and back['settings'])
    pg1.click('#home'); pg1.wait_for_selector('.home'); pg1.wait_for_timeout(1000)

    # Progress saved by the game here but not passed on (the device was closed within 2 seconds) wins
    # over an older copy: here the Sheet hasn't changed since this device last passed its progress on.
    set_stars(pg1, mine['explorer'], 50)
    pg1.click('[data-g="number-town"]'); pg1.wait_for_selector('.wframe iframe'); pg1.wait_for_timeout(5000)
    c.check('device 1: progress here that wasn\'t passed on is kept, not overwritten', game_save(pg1, mine['explorer'])['stars'] == 50)
    c.check('device 1: and is passed on', c.states[('p_sam', 'number-town')]['state']['progress']['save']['stars'] == 50)
    one.close()
    two.close()

    # The first time after P77: a device with an explorer kept the old way ({ explorer } in the state)
    # passes it on; another device that also has one for that child gets the first one (newer), and
    # its own stays saved there, hidden.
    old_save = dict(mine['save'], name='Alex', stars=7)
    other_save = dict(mine['save'], name='Alex', stars=3)
    first, pa = c.page(browser, 1366, 768)
    pa.goto(BASE + 'index.html'); pa.wait_for_selector('.player')
    pa.evaluate(f"""(() => {{ localStorage.setItem('numberTown.player.palexold', JSON.stringify({json.dumps(old_save)}));
        localStorage.setItem('numberTown.players.v1', JSON.stringify({{ current: 'palexold', ids: ['palexold'] }}));
        localStorage.setItem('fg.state.p_alex.number-town', JSON.stringify({{ state: {{ explorer: 'palexold' }}, at: '2026-11-12T10:00:00.000Z' }})); }})()""")
    fa, _ = c.open_game(pa, player='p_alex', wait=6000)
    sheet = c.states.get(('p_alex', 'number-town'))
    c.check('first device after the update: its explorer is kept and passed on',
            fa.locator('#btnBackpack').is_visible() and sheet and sheet['state']['progress']['explorer'] == 'palexold'
            and sheet['state']['progress']['save']['stars'] == 7, sheet)
    first.close()
    second, pb = c.page(browser, 1366, 768)
    pb.goto(BASE + 'index.html'); pb.wait_for_selector('.player')
    pb.evaluate(f"""(() => {{ localStorage.setItem('numberTown.player.palexother', JSON.stringify({json.dumps(other_save)}));
        localStorage.setItem('numberTown.players.v1', JSON.stringify({{ current: 'palexother', ids: ['palexother'] }}));
        localStorage.setItem('fg.state.p_alex.number-town', JSON.stringify({{ state: {{ explorer: 'palexother' }}, at: '2026-11-12T09:00:00.000Z' }})); }})()""")
    fb, _ = c.open_game(pb, player='p_alex', wait=7000)
    fbf = pb.frames[1]
    roster = json.loads(fbf.evaluate("localStorage.getItem('numberTown.players.v1')") or 'null')
    c.check('second device: the first device\'s explorer is put back',
            roster and roster['ids'] == ['palexold'] and game_save(fbf, 'palexold')['stars'] == 7 and fb.locator('#btnBackpack').is_visible(), roster)
    c.check('second device: its own explorer stays saved there, hidden', (game_save(fbf, 'palexother') or {}).get('stars') == 3)
    c.check('the Sheet still has the first device\'s explorer', c.states[('p_alex', 'number-town')]['state']['progress']['explorer'] == 'palexold')
    second.close()
    c.script = '0.3.0'

    # 4. Sound off: its beeps are silenced (P67), whatever its own Sound setting says.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg, wait=3000)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound and speech are silenced', quiet['flag'] and quiet['quietAudio'], quiet)
    c.check('sound off: plays as normal', into_town(pg, fr, 'muted'))
    ctx.close()

    # 5. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/number-town/original.html'); pg.wait_for_timeout(3000)
    c.check('runs on its own, as its maker made it', pg.locator('#maker').is_visible() and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
