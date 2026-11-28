"""Fossil Hunters release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". At the three sizes it makes the child's
explorer and opens a dig; then it checks one explorer per child (P93): kept apart on one device,
also when the Sheet is slow (P82); following the child to another device (P77, P78); and, with the
Sheet answering late on a device without the child's explorer, the explorer from the Sheet put back
instead of a new one replacing it (P92)."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-fossil-hunters'
c = Check('fossil-hunters', OUT)
LIST = 'fossilHunters.players.v1'


def stored(pg, key):
    return json.loads(pg.evaluate(f"localStorage.getItem({json.dumps(key)})") or 'null')


def listed(pg):
    return [p.get('name') for p in (stored(pg, LIST) or {}).get('list', [])]


def mine(pg, pid):
    return stored(pg, f'fg.fossilHunters.mine.{pid}')


def on(f, sid):
    return f.evaluate(f"document.getElementById('{sid}').classList.contains('on')")


def start_exploring(pg, fr):
    """Presses Start exploring on New explorer (the game saves the new explorer then)."""
    fr.locator('#whoGo').click()
    pg.wait_for_timeout(1500)


def dig_here(pg, fr):
    """Opens the dig at the site picked on the map."""
    fr.locator('#wInfo [data-dig]').click()
    pg.wait_for_timeout(1200)


def every_bone(pg, f):
    """The maker's own testing button: every bone of this site's animals (the game saves then)."""
    f.evaluate("document.getElementById('fillBtn').click()")
    pg.wait_for_timeout(1500)


def skeletons(save):
    return sorted(((save or {}).get('sk') or {}).keys())


def sheet_progress(pid):
    s = c.states.get((pid, 'fossil-hunters'))
    return ((s or {}).get('state') or {}).get('progress') or {}


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. A new child at the three sizes: straight to New explorer with their name, then the map and
    #    a dig. "Who's digging?" with its list is never shown.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg, wait=5000)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f"{name}: opens on New explorer with the child's name, not a list of explorers",
                on(f, 'who') and fr.locator('#whoNew').is_visible() and not fr.locator('#whoPick').is_visible()
                and fr.locator('#whoName').input_value() == 'Sam', fr.locator('#whoName').input_value())
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/1-{name}-new-explorer.png')
        start_exploring(pg, fr)
        c.check(f"{name}: Start exploring goes to the map, as Sam's expedition",
                on(f, 'world') and not on(f, 'who') and "Sam's expedition" in fr.locator('#wSub').inner_text())
        c.check(f'{name}: nothing wider than the screen', f.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        pg.screenshot(path=f'{OUT}/2-{name}-map.png')
        dig_here(pg, fr)
        c.check(f'{name}: Dig here opens the dig and its welcome', not on(f, 'world') and on(f, 'intro'))
        fr.locator('#startBtn').click(); pg.wait_for_timeout(800)
        c.check(f'{name}: Start digging shows the rock face', fr.locator('#dig').is_visible() and not on(f, 'intro'))
        pg.screenshot(path=f'{OUT}/3-{name}-dig.png')
        fr.locator('#fgBtn').click(); pg.wait_for_timeout(800)
        c.check(f'{name}: the Field Guide has no Switch explorer', on(f, 'guide') and not fr.locator('#gWho').is_visible())
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()

    # 2. One explorer per child on one device (P93). The Sheet is slow to answer, so the swap must
    #    already have happened before it answers.
    c.script = '0.4.0'
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg, wait=5000)
    start_exploring(pg, fr)
    dig_here(pg, fr)
    every_bone(pg, f)
    sam_id = mine(pg, 'p_sam')
    sam_skeletons = skeletons(stored(pg, f'fossilHunters.player.{sam_id}'))
    c.check("Sam's explorer is the game's only one, with this site's skeletons",
            listed(pg) == ['Sam'] and len(sam_skeletons) >= 1, (listed(pg), sam_skeletons))

    def switch_to(pid):
        pg.click('#home'); pg.wait_for_selector('.home')
        pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        c.hold = True  # the Sheet hasn't answered yet
        pg.click('[data-g="fossil-hunters"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1500)
        early = listed(pg)
        c.release()
        pg.wait_for_timeout(4500)
        return pg.frame_locator('.wframe iframe'), pg.frames[1], early

    fr, f, early = switch_to('p_alex')
    c.check("a child new to the device sees no other child's explorer", early == [], early)
    c.check('...and makes their own, with their name filled in', on(f, 'who') and fr.locator('#whoName').input_value() == 'Alex')
    start_exploring(pg, fr)
    c.check("Alex's explorer is the game's only one", listed(pg) == ['Alex'] and mine(pg, 'p_alex') not in (None, sam_id),
            (listed(pg), mine(pg, 'p_alex')))
    for i, (pid, theirs) in enumerate([('p_sam', 'Sam'), ('p_alex', 'Alex'), ('p_sam', 'Sam')], 1):
        fr, f, early = switch_to(pid)
        c.check(f'switch {i}, to {pid}: their explorer is swapped in before the Sheet answers', early == [theirs], early)
        c.check(f'switch {i}, to {pid}: straight onto their map', on(f, 'world') and not on(f, 'who')
                and f"{theirs}'s expedition" in fr.locator('#wSub').inner_text(), fr.locator('#wSub').inner_text())
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(2500)
    in_sheet = [sheet_progress(p).get('explorer', {}).get('name') for p in ('p_sam', 'p_alex')]
    c.check("the Sheet holds each child's own explorer", in_sheet == ['Sam', 'Alex'], in_sheet)
    c.check("Sam's skeletons are in the Sheet", skeletons(sheet_progress('p_sam').get('save')) == sam_skeletons)
    ctx.close()

    # 3. The explorer follows the child to another device (P77, P78).
    two, pg2 = c.page(browser, 1366, 768)
    fr2, f2 = c.open_game(pg2, wait=7000)
    sid2 = mine(pg2, 'p_sam')
    c.check("device 2: Sam's explorer from device 1 is there, skeletons and all",
            sid2 == sam_id and on(f2, 'world') and skeletons(stored(pg2, f'fossilHunters.player.{sid2}')) == sam_skeletons,
            (sid2, sam_id))
    fr2.locator('#wList button').nth(1).click(); pg2.wait_for_timeout(600)  # Surrey
    dig_here(pg2, fr2)
    # A fully played explorer (every bone of every animal placed and named, many extra finds) stays small.
    full = f2.evaluate("""() => {
      const sk = {}, order = Object.keys(BONES);
      order.forEach((id, i) => { const ids = BONES[id].pieces.map((p) => p.id);
        sk[id] = { num: i + 1, have: ids, placed: ids, done: true, known: true }; });
      const extras = {}; for (let i = 0; i < 40; i++) extras['find' + i] = 99;
      return { explorer: { id: 'pmx072wbb5umv', name: 'Abcdefghijklmn', badge: 'bone' },
               save: { v: 1, name: 'Abcdefghijklmn', badge: 'bone', sk, order, extras,
                       seen: { intro: true, intro_surrey: true, intro_lyme: true, rbHelp: true }, digs: 9999, site: 'gobi' } };
    }""")
    size = len(json.dumps({'progress': full, 'at': '2026-11-28T09:00:00.000Z'}))
    c.check(f'a fully played explorer is small ({size} characters, sent as it is under 20,000)', 0 < size < 20000)
    pg2.click('#home'); pg2.wait_for_selector('.home'); pg2.wait_for_timeout(2000)
    c.check('device 2: a change goes to the Sheet on ⌂ Home', sheet_progress('p_sam').get('save', {}).get('site') == 'surrey',
            sheet_progress('p_sam').get('save', {}).get('site'))
    two.close()

    # 4. A late Sheet on a device that doesn't know Sam's explorer (P92): the game starts as new, Sam
    #    makes a new explorer before the Sheet answers; when it does, the Sheet's explorer comes back
    #    and the new one never reaches the Sheet.
    three, pg3 = c.page(browser, 1366, 768)
    pg3.goto(BASE); pg3.wait_for_timeout(1500)  # the device knows the children, not their progress
    c.hold = True
    pg3.goto(BASE + 'play.html?game=fossil-hunters&player=p_sam'); pg3.wait_for_timeout(5000)
    fr3, f3 = pg3.frame_locator('.wframe iframe'), pg3.frames[1]
    c.check('late Sheet: the game starts as new before the Sheet answers', on(f3, 'who') and fr3.locator('#whoNew').is_visible())
    start_exploring(pg3, fr3)
    fresh = mine(pg3, 'p_sam')
    pg3.wait_for_timeout(3000)  # its progress is taken and kept, but must not go to the Sheet yet
    c.release()
    pg3.wait_for_timeout(9000)  # the answer, the restart and the explorer put back
    f3 = pg3.frames[1]
    back = mine(pg3, 'p_sam')
    c.check("late Sheet: Sam's explorer from the Sheet is put back, skeletons and all",
            fresh != sam_id and back == sam_id and on(f3, 'world') and skeletons(stored(pg3, f'fossilHunters.player.{back}')) == sam_skeletons,
            (fresh, back, sam_id))
    pg3.click('#home'); pg3.wait_for_selector('.home'); pg3.wait_for_timeout(2500)
    c.check("late Sheet: the Sheet still holds Sam's explorer, not the new one",
            sheet_progress('p_sam').get('explorer', {}).get('id') == sam_id, sheet_progress('p_sam').get('explorer'))
    three.close()
    c.states.clear()
    c.script = '0.3.0'

    # 5. Sound off: its sounds and Read to me are silenced (P67), and it plays as normal.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg, wait=5000)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound and speech are silenced', quiet['flag'] and quiet['quietAudio'] and quiet['speechPatched'], quiet)
    start_exploring(pg, fr)
    c.check('sound off: plays as normal', on(f, 'world'))
    ctx.close()

    # 6. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/fossil-hunters/original.html'); pg.wait_for_timeout(4000)
    c.check("runs on its own, as its maker made it (Who's digging?)",
            pg.evaluate("document.getElementById('who').classList.contains('on')") and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
