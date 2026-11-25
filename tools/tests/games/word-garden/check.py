"""Word Garden release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". It checks making a garden at the three
sizes; one explorer per child (P90), also with a slow Sheet and the game saving as it reloads
(P82); the garden following the child between two devices, compressed, through a stand-in Sheet
like script 0.6.0 (P77, P78, P89), and staying on the device with the older script; sound off;
its recorded sounds being there; and the page running on its own."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-word-garden'
c = Check('word-garden', OUT)

# Run in a launcher page: the progress in a state, unpacked if it went compressed (P89).
UNPACK = """async (state) => {
  if (!state) return null;
  if ('progress' in state) return state.progress;
  const { default: LZ } = await import('/games/_common/pack/lz-string.js');
  return JSON.parse(LZ.decompressFromBase64(state.packed.slice(5)));
}"""


def kept(pg, pid):
    """The state the wrapper keeps for this child on this device, or None."""
    k = json.loads(pg.evaluate(f"localStorage.getItem('fg.state.{pid}.word-garden')") or 'null')
    return k and k['state']


def progress(pg, state):
    return pg.evaluate(UNPACK, state)


def roster(frame):
    return json.loads(frame.evaluate("localStorage.getItem('wordGarden.players.v1')") or 'null')


def make_garden(pg, fr, name, year='y2', shot=None):
    """In "A new garden": check the child's name is filled in, pick the year, start the garden."""
    filled = fr.locator('#nameInput').input_value()
    fr.locator(f'.yrb[data-y="{year}"]').click()
    fr.locator('#maker button[type=submit]').click()
    pg.wait_for_timeout(1500)
    if shot:
        pg.screenshot(path=f'{OUT}/{shot}.png')
    return filled == name and fr.locator('#map.on').count() == 1


def switch(pg, pid, wait=5000):
    pg.click('#home'); pg.wait_for_selector('.home')
    pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
    pg.click('[data-g="word-garden"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(wait)
    return pg.frame_locator('.wframe iframe')


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Make a garden at the three sizes: straight to "A new garden", the child's name filled in.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg, wait=3500)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: straight to "A new garden", past "Who\'s playing?"', fr.locator('#maker').is_visible())
        if w < h:  # an upright phone: the game asks to turn sideways, and lets the child keep going
            c.check(f'{name}: asks to turn sideways, with "Keep going this way"', fr.locator('#turn.on').is_visible() and fr.locator('#turnOk').is_visible())
            pg.screenshot(path=f'{OUT}/0-{name}-turn.png')
            fr.locator('#turnOk').click(); pg.wait_for_timeout(300)
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/1-{name}-new-garden.png')
        c.check(f'{name}: a Year 2 garden is made, name filled in', make_garden(pg, fr, 'Sam', 'y2', f'2-{name}-map'))
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ok = f.evaluate("fetch('sounds/s.wav').then(r => r.ok && r.headers.get('content-type'))")
        c.check(f'{name}: its recorded sounds are there', ok and 'audio' in ok, ok)
        ctx.close()

    # 2. One explorer per child (P90): each child gets their own garden, never "Who's playing?".
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg, wait=3500)
    make_garden(pg, fr, 'Sam', 'y2'); pg.wait_for_timeout(2500)
    sam = progress(pg, kept(pg, 'p_sam'))
    c.check("the garden is kept as the child's, with its whole save",
            sam and isinstance(sam.get('explorer'), str) and sam['save']['name'] == 'Sam' and len(sam['save']['words']) > 400,
            sam and sam.get('explorer'))
    c.check('a big garden is kept compressed (P89)', 'packed' in (kept(pg, 'p_sam') or {}))
    c.check('"Switch explorer" is hidden', fr.locator('#switchPlayer').count() == 1 and not fr.locator('#switchPlayer').is_visible())
    fr = switch(pg, 'p_alex')
    c.check("another child gets their own new garden, not \"Who's playing?\"",
            fr.locator('#maker').is_visible() and fr.locator('#nameInput').input_value() == 'Alex')
    make_garden(pg, fr, 'Alex', 'rec'); pg.wait_for_timeout(2500)
    alex = progress(pg, kept(pg, 'p_alex'))
    c.check("the second garden is kept as that child's", alex and alex['explorer'] != sam['explorer'] and alex['save']['year'] == 'rec',
            alex and alex.get('explorer'))
    c.check('a small garden is kept as it is, not compressed', 'progress' in (kept(pg, 'p_alex') or {}))
    fr = switch(pg, 'p_sam')
    r = roster(pg.frames[1])
    c.check('the first child goes straight back into their own garden',
            fr.locator('#map.on').count() == 1 and r and [p['id'] for p in r['players']] == [sam['explorer']] and r['last'] == sam['explorer'], r)
    pg.screenshot(path=f'{OUT}/3-sam-back.png')
    ctx.close()

    # 2b. Switching children on one device with a slow Sheet (P82): the swap to this child's garden
    #     happens before the Sheet answers, and the game saving as the page unloads (forced here)
    #     never hands a child the other's garden.
    c.script = '0.6.0'
    ctx, pg = c.page(browser, 1366, 768)
    ctx.add_init_script("addEventListener('beforeunload', () => dispatchEvent(new Event('blur')))")
    fr, f = c.open_game(pg, wait=3500)
    make_garden(pg, fr, 'Sam', 'y2'); pg.wait_for_timeout(2500)
    sam = progress(pg, kept(pg, 'p_sam'))

    def slow_switch(pid):
        pg.click('#home'); pg.wait_for_selector('.home')
        pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        c.hold = True  # the Sheet hasn't answered yet
        pg.click('[data-g="word-garden"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1500)
        early = json.loads(pg.evaluate("localStorage.getItem('wordGarden.players.v1')") or 'null')
        c.release()
        pg.wait_for_timeout(4500)
        return pg.frame_locator('.wframe iframe'), early

    fr, _ = slow_switch('p_alex')
    make_garden(pg, fr, 'Alex', 'y1'); pg.wait_for_timeout(2500)
    alex = progress(pg, kept(pg, 'p_alex'))
    for i, (pid, theirs) in enumerate([('p_sam', sam), ('p_alex', alex), ('p_sam', sam), ('p_alex', alex)], 1):
        fr, early = slow_switch(pid)
        c.check(f'switch {i}, to {pid}: their garden is swapped in before the Sheet answers',
                early and early['last'] == theirs['explorer'] and [p['id'] for p in early['players']] == [theirs['explorer']], early)
        r = roster(pg.frames[1])
        c.check(f'switch {i}, to {pid}: their own garden, though the game saves as it reloads',
                fr.locator('#map.on').count() == 1 and r and [p['id'] for p in r['players']] == [theirs['explorer']], r)
    mines = pg.evaluate("[localStorage.getItem('fg.wordGarden.mine.p_sam'), localStorage.getItem('fg.wordGarden.mine.p_alex')]")
    c.check('each child still owns only their own garden', mines == [json.dumps(sam['explorer']), json.dumps(alex['explorer'])], mines)
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(2500)
    in_sheet = [(progress(pg, c.states.get((p, 'word-garden'), {}).get('state')) or {}).get('explorer') for p in ('p_sam', 'p_alex')]
    c.check("the Sheet holds each child's own garden", in_sheet == [sam['explorer'], alex['explorer']], in_sheet)
    ctx.close()
    c.states.clear()

    # 3. The garden follows the child (P77, P78, P89), with a stand-in Sheet like script 0.6.0.
    #    Two browser contexts are two devices: their storage is separate, the Sheet is shared.
    one, pg1 = c.page(browser, 1366, 768)
    fr1, f1 = c.open_game(pg1, wait=3500)
    make_garden(pg1, fr1, 'Sam', 'y2'); pg1.wait_for_timeout(5000)
    mine = progress(pg1, kept(pg1, 'p_sam'))
    sheet = c.states.get(('p_sam', 'word-garden'))
    raw = len(json.dumps(mine['save'], separators=(',', ':'))) if mine else 0
    size = len(json.dumps(sheet['state'], separators=(',', ':'))) if sheet else 0
    c.check('device 1: the new garden reaches the Sheet within seconds, compressed',
            sheet and 'packed' in sheet['state'] and progress(pg1, sheet['state'])['explorer'] == mine['explorer'], sheet and list(sheet['state']))
    c.check(f'compressed: {raw} characters of garden go as {size} (script 0.6.0 takes 450,000)', 0 < size < raw / 2 and size < 450000)
    pg1.click('#home'); pg1.wait_for_selector('.home')

    two, pg2 = c.page(browser, 1366, 768)
    fr2, f2 = c.open_game(pg2, wait=7000)
    f2 = pg2.frames[1]
    r = roster(f2)
    c.check('device 2: Sam goes straight into their garden from device 1',
            fr2.locator('#map.on').count() == 1 and not fr2.locator('#maker').is_visible() and r and [p['id'] for p in r['players']] == [mine['explorer']], r)
    # A change made in the game (a school list, through the game's own way in), then straight to ⌂ Home.
    added = f2.evaluate(f"WordGarden.addSchoolList({json.dumps(mine['explorer'])}, {{ id: 'wk47', set: '2026-11-20', words: ['rain', 'train', 'snail'] }})")
    c.check("device 2: the game takes a school list through its own way in", added and added.get('ok'), added)
    pg2.click('#home'); pg2.wait_for_selector('.home'); pg2.wait_for_timeout(2000)
    sheet = c.states.get(('p_sam', 'word-garden'))
    has_list = lambda save: bool(save) and any(L['id'] == 'wk47' for L in save.get('school', []))
    c.check('device 2: the change goes to the Sheet on ⌂ Home', sheet and has_list(progress(pg2, sheet['state'])['save']))

    pg1.click('[data-g="word-garden"]'); pg1.wait_for_selector('.wframe iframe'); pg1.wait_for_timeout(7000)
    back = json.loads(pg1.frames[1].evaluate(f"localStorage.getItem('wordGarden.player.{mine['explorer']}')") or 'null')
    c.check('device 1: the newer garden from device 2 is put back', has_list(back) and pg1.frame_locator('.wframe iframe').locator('#map.on').count() == 1)
    note = json.loads(pg1.evaluate("localStorage.getItem('fg.keep.word-garden.p_sam')") or 'null')
    c.check('the device notes a fingerprint of the last save, not a second copy', note and 'hash' in note and 'json' not in note, note)
    one.close()
    two.close()
    c.states.clear()

    # 3b. With the script before 0.6.0 (20,000 at most), a big garden stays on the device: nothing breaks.
    c.script = '0.4.0'
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg, wait=3500)
    make_garden(pg, fr, 'Sam', 'y2'); pg.wait_for_timeout(2500)
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(1500)
    c.check('older script: the big garden is refused by the Sheet and kept on the device',
            ('p_sam', 'word-garden') not in c.states and kept(pg, 'p_sam') is not None)
    ctx.close()
    c.script = '0.3.0'

    # 4. Sound off (P67): recorded sounds, speech and garden noises are silenced.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg, wait=3500)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound and speech are silenced', quiet['flag'] and quiet['quietAudio'] and quiet['speechPatched'], quiet)
    c.check('sound off: plays as normal', make_garden(pg, fr, 'Sam', 'rec'))
    ctx.close()

    # 5. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/word-garden/original.html'); pg.wait_for_timeout(2500)
    c.check('runs on its own, as its maker made it', pg.locator('#who.on').count() == 1 and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
