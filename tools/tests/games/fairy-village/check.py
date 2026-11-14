"""Fairy village release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". At the three sizes it makes the child's
fairy and opens a puzzle; then it checks one explorer per child (P87): kept apart on one device,
also when the Sheet is slow (P82), and following the child to another device (P77, P78)."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-fairy-village'
c = Check('fairy-village', OUT)
KEY = 'fairy-village-v1'


def save(pg):
    return json.loads(pg.evaluate(f"localStorage.getItem('{KEY}')") or 'null')


def names(s):
    return [e.get('name') for e in (s or {}).get('explorers', [])]


def shown(fr, sel):
    return fr.locator(sel).first.is_visible()


def make_fairy(pg, fr):
    """Presses Let's go on the maker (the game saves the new explorer then)."""
    fr.locator('#make-go').click()
    pg.wait_for_timeout(1200)


def rename(pg, fr, name):
    """Changes the fairy's name through the explorer menu's Change my fairy (the game saves then)."""
    fr.locator('#v-chip').click(); pg.wait_for_timeout(500)
    fr.locator('#m-edit').click(); pg.wait_for_timeout(500)
    fr.locator('#f-name').fill(name)
    fr.locator('#make-go').click(); pg.wait_for_timeout(1200)


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. A new child at the three sizes: straight to the maker with their name, then the village
    #    and a puzzle. "Who's playing?" is never shown.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: opens on Make your fairy with the child\'s name, not Who\'s playing',
                shown(fr, '#s-make') and not shown(fr, '#s-who') and fr.locator('#f-name').input_value() == 'Sam',
                fr.locator('#f-name').input_value())
        c.check(f'{name}: Remove this explorer is hidden', not shown(fr, '#make-remove'))
        c.fits_under_bar(pg, name, w, h)
        pg.screenshot(path=f'{OUT}/1-{name}-maker.png')
        make_fairy(pg, fr)
        c.check(f'{name}: Let\'s go goes into the village', shown(fr, '#s-village') and fr.locator('#v-chip').inner_text().strip() == 'Sam')
        c.check(f'{name}: nothing wider than the screen', f.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        pg.screenshot(path=f'{OUT}/2-{name}-village.png')
        fr.locator('#v-chip').click(); pg.wait_for_timeout(500)
        c.check(f'{name}: the explorer menu has no Who\'s playing?', shown(fr, '#m-edit') and not shown(fr, '#m-who'))
        fr.locator('#m-close').click(); pg.wait_for_timeout(300)
        fr.locator('#v-fly').click(); pg.wait_for_timeout(800)
        fr.locator('.world:not(.locked)').first.click(); pg.wait_for_timeout(1000)
        fr.locator('#g-flower .tap').first.click(); pg.wait_for_timeout(1500)
        c.check(f'{name}: a puzzle opens', shown(fr, '#s-puzzle') and fr.locator('#pz-area *').count() > 0)
        pg.screenshot(path=f'{OUT}/3-{name}-puzzle.png')
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()

    # 2. One explorer per child on one device (P87). The Sheet is slow to answer, so the swap must
    #    already have happened before it answers.
    c.script = '0.4.0'
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg)
    make_fairy(pg, fr)
    rename(pg, fr, 'Sam Bluebell')
    sam = save(pg)
    c.check("Sam's explorer is the game's only one", names(sam) == ['Sam Bluebell'], names(sam))

    def switch_to(pid):
        pg.click('#home'); pg.wait_for_selector('.home')
        pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        c.hold = True  # the Sheet hasn't answered yet
        pg.click('[data-g="fairy-village"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1500)
        early = save(pg)
        owner = json.loads(pg.evaluate("localStorage.getItem('fg.fairyVillage.owner')") or 'null')
        c.release()
        pg.wait_for_timeout(3500)
        return pg.frame_locator('.wframe iframe'), early, owner

    fr, early, owner = switch_to('p_alex')
    c.check("a child new to the device sees no other child's explorer",
            owner == 'p_alex' and names(early) == [], (owner, names(early)))
    c.check('...and makes their own, with their name filled in', shown(fr, '#s-make') and fr.locator('#f-name').input_value() == 'Alex')
    make_fairy(pg, fr)
    alex = save(pg)
    c.check("Alex's explorer is the game's only one", names(alex) == ['Alex'], names(alex))
    for i, (pid, theirs) in enumerate([('p_sam', 'Sam Bluebell'), ('p_alex', 'Alex'), ('p_sam', 'Sam Bluebell')], 1):
        fr, early, owner = switch_to(pid)
        c.check(f'switch {i}, to {pid}: their explorer is swapped in before the Sheet answers',
                owner == pid and names(early) == [theirs], (owner, names(early)))
        c.check(f'switch {i}, to {pid}: straight into their village', shown(fr, '#s-village') and fr.locator('#v-chip').inner_text().strip() == theirs,
                fr.locator('#v-chip').inner_text())
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(2000)
    in_sheet = [((c.states.get((p, 'fairy-village')) or {}).get('state') or {}).get('progress', {}).get('explorer', {}).get('name') for p in ('p_sam', 'p_alex')]
    c.check("the Sheet holds each child's own explorer", in_sheet == ['Sam Bluebell', 'Alex'], in_sheet)
    ctx.close()

    # 3. The explorer follows the child to another device (P77, P78).
    two, pg2 = c.page(browser, 1366, 768)
    fr2, f2 = c.open_game(pg2, wait=6000)
    c.check("device 2: Sam's explorer from device 1 is there", shown(fr2, '#s-village') and fr2.locator('#v-chip').inner_text().strip() == 'Sam Bluebell',
            fr2.locator('#v-chip').inner_text() if shown(fr2, '#v-chip') else 'no village')
    rename(pg2, fr2, 'Sam Moon')
    pg2.click('#home'); pg2.wait_for_selector('.home'); pg2.wait_for_timeout(1500)
    sheet = c.states.get(('p_sam', 'fairy-village'))
    c.check('device 2: a change goes to the Sheet on ⌂ Home', sheet and sheet['state']['progress']['explorer']['name'] == 'Sam Moon', sheet)
    two.close()
    # A fully played explorer (every fairy home, every petal pink, big pots and scores) stays small.
    ids = ['petal', 'ripple', 'breeze', 'jingle', 'ginger', 'twinkle', 'crumble', 'rivet', 'gizmo']
    full = dict(sheet['state']['progress']['explorer'], name='Abcdefghijklmn', petals={i: [True] * 5 for i in ids},
                moved={i: True for i in ids}, pots={i: 999 for i in ids}, replay={i: [True] * 5 for i in ids}, best={i: 99999 for i in ids})
    size = len(json.dumps({'progress': {'explorer': full}, 'at': sheet['state']['at']}))
    c.check(f'a fully played explorer is small ({size} characters, the most is 20,000)', 0 < size < 20000)
    c.states.clear()
    c.script = '0.3.0'

    # 4. Sound off: its sounds and Read to me are silenced (P67), and it plays as normal.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound and speech are silenced', quiet['flag'] and quiet['quietAudio'] and quiet['speechPatched'], quiet)
    make_fairy(pg, fr)
    c.check('sound off: plays as normal', shown(fr, '#s-village'))
    ctx.close()

    # 5. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/fairy-village/original.html'); pg.wait_for_timeout(2000)
    c.check("runs on its own, as its maker made it (Who's playing?)", pg.locator('#s-who').is_visible() and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
