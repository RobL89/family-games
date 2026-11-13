"""Number Crossing release check (contract 0.4, GC7), through the wrapper with its adapter.
See ../harness.py for how to run it. Ends "PASS n of n". It plays a crossing to the end at the three
sizes, and checks each child's own setup (P84): kept apart on one device, also when the Sheet is
slow (P82), and following the child to another device (P77, P78). The game saves its setup only
when a crossing starts, never on leaving."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from harness import BASE, SIZES, SOUND_STATE, Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-number-crossing'
c = Check('number-crossing', OUT)
KEY = 'gingerbread-river-v1'
OPS = {'+': lambda a, b: a + b, '−': lambda a, b: a - b, '×': lambda a, b: a * b, '÷': lambda a, b: a // b}


def answer(fr):
    """The answer to the sum shown: "7 + 3", or "+ 3" carrying on from the total."""
    text = fr.locator('#sum').inner_text().strip()
    m = re.fullmatch(r'(\d+)?\s*([+−×÷])\s*(\d+)', text)
    if not m:
        return None, text
    a = int(m.group(1)) if m.group(1) else int(fr.locator('#totalNum').inner_text().strip())
    return OPS[m.group(2)](a, int(m.group(3))), text


def cross(pg, fr, count):
    """Answers every sum right, waiting for each jump. True if the game's own end shows."""
    ready = "!document.getElementById('ans').readOnly"  # the game locks the box while the character jumps
    for i in range(count):
        try:
            fr.locator('#ans').wait_for(state='visible', timeout=15000)
            fr.locator('body').evaluate(f'() => new Promise((ok, no) => {{ const t = Date.now(); (function w() {{ if ({ready}) ok(); else if (Date.now() - t > 15000) no(); else setTimeout(w, 100); }})(); }})')
        except Exception:
            return False
        ans, text = answer(fr)
        if ans is None:
            return False
        fr.locator('#ans').fill(str(ans))
        fr.locator('#goBtn').click()
        pg.wait_for_timeout(500)
    pg.wait_for_timeout(5000)
    return fr.locator('#overlay').is_visible() and fr.locator('#againBtn').is_visible() and 'out of' in fr.locator('#oText').inner_text()


def setup(page_or_frame):
    return json.loads(page_or_frame.evaluate(f"localStorage.getItem('{KEY}')") or 'null')


def theme(fr):
    return next((t for t in ('G', 'D', 'U') if fr.locator(f'#theme{t}').get_attribute('aria-pressed') == 'true'), None)


def choose(pg, fr, t, count):
    """Picks a theme and a number of questions, then starts (the game saves its setup then)."""
    fr.locator(f'#theme{t}').click()
    fr.locator('#countIn').fill(str(count))
    fr.locator('#startBtn').click()
    pg.wait_for_timeout(1500)


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. A whole crossing at the three sizes, typing the answers.
    for name, w, h, mobile in SIZES:
        ctx, pg = c.page(browser, w, h, mobile)
        fr, f = c.open_game(pg)
        c.check(f'{name}: adapter added once', f.evaluate("document.querySelectorAll('script[data-fg-adapter]').length") == 1)
        c.check(f'{name}: starts on its setup screen', fr.locator('#startBtn').is_visible())
        c.fits_under_bar(pg, name, w, h)
        c.check(f'{name}: nothing wider than the screen', f.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        pg.screenshot(path=f'{OUT}/1-{name}-setup.png')
        choose(pg, fr, 'G', 3)
        pg.screenshot(path=f'{OUT}/2-{name}-crossing.png')
        c.check(f'{name}: a crossing played to its own end', cross(pg, fr, 3))
        pg.screenshot(path=f'{OUT}/3-{name}-end.png')
        c.check(f'{name}: sound on is left alone', not f.evaluate(SOUND_STATE)['flag'])
        ctx.close()

    # 2. Each child's own setup on one device (P84). The Sheet is slow to answer, so the swap must
    #    already have happened before it answers.
    c.script = '0.4.0'
    ctx, pg = c.page(browser, 1366, 768)
    fr, f = c.open_game(pg)
    choose(pg, fr, 'D', 4)
    fr.locator('#quitBtn').click(); pg.wait_for_timeout(2500)
    sam = setup(pg)
    c.check("Sam's setup is the game's (dinosaur, 4 questions)", sam and sam['theme'] == 'dino' and sam['count'] == 4, sam)

    def switch_to(pid):
        pg.click('#home'); pg.wait_for_selector('.home')
        pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
        c.hold = True  # the Sheet hasn't answered yet
        pg.click('[data-g="number-crossing"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(1500)
        early = setup(pg)
        owner = json.loads(pg.evaluate("localStorage.getItem('fg.numberCrossing.owner')") or 'null')
        c.release()
        pg.wait_for_timeout(3500)
        return pg.frame_locator('.wframe iframe'), early, owner

    fr, early, owner = switch_to('p_alex')
    c.check('a child new to the device gets the game\'s defaults, not the other child\'s setup',
            owner == 'p_alex' and early is None and theme(fr) == 'G' and fr.locator('#countIn').input_value() == '10',
            (owner, early, theme(fr)))
    choose(pg, fr, 'U', 5)
    fr.locator('#quitBtn').click(); pg.wait_for_timeout(2500)
    alex = setup(pg)
    c.check("Alex's setup is the game's (unicorn, 5 questions)", alex and alex['theme'] == 'unicorn' and alex['count'] == 5, alex)
    for i, (pid, theirs, t) in enumerate([('p_sam', sam, 'D'), ('p_alex', alex, 'U'), ('p_sam', sam, 'D')], 1):
        fr, early, owner = switch_to(pid)
        c.check(f'switch {i}, to {pid}: their setup is swapped in before the Sheet answers',
                owner == pid and early == theirs, (owner, early))
        c.check(f'switch {i}, to {pid}: the game shows their setup', theme(fr) == t and setup(pg) == theirs, (theme(fr), setup(pg)))
    pg.click('#home'); pg.wait_for_selector('.home'); pg.wait_for_timeout(2000)
    in_sheet = [((c.states.get((p, 'number-crossing')) or {}).get('state') or {}).get('progress', {}).get('theme') for p in ('p_sam', 'p_alex')]
    c.check("the Sheet holds each child's own setup", in_sheet == ['dino', 'unicorn'], in_sheet)
    ctx.close()

    # 3. The setup follows the child to another device (P77, P78).
    two, pg2 = c.page(browser, 1366, 768)
    fr2, f2 = c.open_game(pg2, wait=6000)
    c.check("device 2: Sam's setup from device 1 is there", theme(fr2) == 'D' and fr2.locator('#countIn').input_value() == '4', theme(fr2))
    choose(pg2, fr2, 'G', 6)
    pg2.click('#home'); pg2.wait_for_selector('.home'); pg2.wait_for_timeout(1500)
    sheet = c.states.get(('p_sam', 'number-crossing'))
    c.check('device 2: a change goes to the Sheet on ⌂ Home', sheet and sheet['state']['progress']['count'] == 6, sheet)
    size = len(json.dumps(sheet['state'])) if sheet else 0
    c.check(f'a setup is small ({size} characters, the most is 20,000)', 0 < size < 20000)
    two.close()
    c.states.clear()
    c.script = '0.3.0'

    # 4. Sound off: its sounds are silenced (P67), and it plays as normal.
    ctx, pg = c.page(browser, 1366, 768, muted=True)
    fr, f = c.open_game(pg)
    quiet = f.evaluate(SOUND_STATE)
    c.check('sound off: sound is silenced', quiet['flag'] and quiet['quietAudio'], quiet)
    choose(pg, fr, 'G', 3)
    c.check('sound off: plays as normal', cross(pg, fr, 3))
    ctx.close()

    # 5. Running on its own (GC5): the maker's page, no adapter.
    ctx, pg = c.page(browser, 1366, 768)
    pg.goto(BASE + 'games/number-crossing/original.html'); pg.wait_for_timeout(2000)
    c.check('runs on its own, as its maker made it', pg.locator('#startBtn').is_visible() and pg.locator('script[data-fg-adapter]').count() == 0)
    ctx.close()
    browser.close()

sys.exit(0 if c.finish() else 1)
