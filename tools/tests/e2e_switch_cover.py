"""Switching children never shows the previous child's view (P83).

A game's page first shows what it kept on the device (Kriss Kross: the last puzzle's title; Number
Town: the last explorer) until fg:start says who is playing, and Number Town may reload once. The
wrapper's cover hides the game until then. This switches children on one device with the stand-in
Sheet held back like the live one (2.5 to 3 s, P81), looks at the screen every 50 ms, and fails if the
game is ever uncovered while it shows the other child's puzzle or explorer.

From the repo root, serve the site with `python3 -m http.server 8123 --bind 127.0.0.1`, then run
`python3 -B tools/tests/e2e_switch_cover.py`. Ends "PASS n of n".
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'games'))
from harness import Check  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fg-switch-cover'
LISTS = {
    'p_sam': {'kriss-kross': [{'list_id': 's1', 'title': 'Space', 'words': ['rocket', 'planet', 'comet', 'orbit']}]},
    'p_alex': {'kriss-kross': [{'list_id': 'a1', 'title': 'Pets', 'words': ['cat', 'rabbit', 'hamster', 'parrot']}]},
}
results = []

# What the wrapper's screen shows now: is the game covered, and which child's view is in the frame.
# Kriss Kross: the title on its puzzle or word screen. Number Town: the explorer the page read as it
# opened (noted by the init script below), and whether the page is on its way out.
LOOK = """() => {
  const cover = document.getElementById('cover');
  const f = document.querySelector('.wframe iframe');
  const out = { covered: !!cover && !cover.hidden, view: null };
  try {
    const w = f.contentWindow, d = f.contentDocument;
    if (!d || d.URL === 'about:blank') return out;
    const play = d.getElementById('play');
    if (play && d.getElementById('pTitle')) {
      out.view = play.offsetParent !== null ? d.getElementById('pTitle').textContent : d.getElementById('puzzleTitle').value;
    } else if ('__rosterAtLoad' in w) {
      const r = JSON.parse(w.__rosterAtLoad || 'null');
      out.view = r && r.current;
    }
  } catch (e) { out.err = String(e); }
  return out;
}"""
ROSTER_AT_LOAD = ("if (location.pathname.includes('/games/number-town/')) "
                  "window.__rosterAtLoad = localStorage.getItem('numberTown.players.v1');")


def watch(c, pg, game, pid, want, label):
    """Switch to pid and open game with the Sheet held back for 2.5 s, looking every 50 ms."""
    pg.click('#home'); pg.wait_for_selector('.home')
    pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click(f'[data-p="{pid}"]'); pg.wait_for_selector('.home')
    pg.wait_for_timeout(800)
    c.hold = True
    pg.click(f'[data-g="{game}"]'); pg.wait_for_selector('.wframe iframe')
    seen, released, t0, uncovered_at = [], None, time.time(), None
    while time.time() - t0 < 6:
        if released is None and time.time() - t0 > 2.5:
            c.release(); released = time.time()
        s = pg.evaluate(LOOK)
        seen.append(s)
        if len(seen) == 15 and s['covered']:
            pg.screenshot(path=f'{OUT}/{label.replace(" ", "-")}-covered.png')
        if not s['covered'] and uncovered_at is None and released:
            uncovered_at = time.time()
        pg.wait_for_timeout(50)
    wrong = [s['view'] for s in seen if not s['covered'] and s['view'] is not None and s['view'] != want]
    c.check(f'{label}: the other child\'s view never shows', not wrong, f'{len(wrong)} of {len(seen)} looks showed {sorted(set(map(str, wrong)))}')
    c.check(f'{label}: covered while the Sheet is slow', any(s['covered'] for s in seen[:20]), seen[:3])
    last = seen[-1]
    c.check(f'{label}: then uncovered, on their own view', not last['covered'] and last['view'] == want, last)
    lag = (uncovered_at - released) if uncovered_at and released else None
    c.check(f'{label}: uncovered within 1.5 s of the Sheet answering', lag is not None and lag < 1.5, lag)
    pg.screenshot(path=f'{OUT}/{label.replace(" ", "-")}.png')


def progress(pg, pid):
    kept = json.loads(pg.evaluate(f"localStorage.getItem('fg.state.{pid}.number-town')") or 'null')
    return kept and kept['state'] and kept['state'].get('progress')


def into_town(pg, fr):
    fr.locator('#nameInput').fill('Sam')
    fr.locator('#goBtn').click(); pg.wait_for_timeout(800)
    fr.locator('#openLetter').click(); pg.wait_for_timeout(1200)
    fr.locator('#exploreBtn').click(); pg.wait_for_timeout(1500)


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # Kriss Kross: Sam's last puzzle ("Space") must never show when Alex opens it, and back.
    kk = Check('kriss-kross', OUT, LISTS, script='0.4.0')
    ctx, pg = kk.page(browser, 390, 844, True)
    kk.open_game(pg, wait=3000)
    watch(kk, pg, 'kriss-kross', 'p_alex', 'Pets', 'kriss kross to Alex')
    watch(kk, pg, 'kriss-kross', 'p_sam', 'Space', 'kriss kross to Sam')
    ctx.close()
    results += kk.results
    errors = kk.errors

    # Number Town: each child's explorer; the page reloads once to swap them.
    nt = Check('number-town', OUT, script='0.4.0')
    ctx, pg = nt.page(browser, 390, 844, True)
    ctx.add_init_script(ROSTER_AT_LOAD)
    fr, _ = nt.open_game(pg, wait=3000)
    into_town(pg, fr); pg.wait_for_timeout(2500)
    sam = progress(pg, 'p_sam')['explorer']
    pg.click('#home'); pg.wait_for_selector('.home')
    pg.click('[data-back]'); pg.wait_for_selector('.player'); pg.click('[data-p="p_alex"]'); pg.wait_for_selector('.home'); pg.wait_for_timeout(800)
    pg.click('[data-g="number-town"]'); pg.wait_for_selector('.wframe iframe'); pg.wait_for_timeout(4500)
    into_town(pg, pg.frame_locator('.wframe iframe')); pg.wait_for_timeout(2500)
    alex = progress(pg, 'p_alex')['explorer']
    watch(nt, pg, 'number-town', 'p_sam', sam, 'number town to Sam')
    watch(nt, pg, 'number-town', 'p_alex', alex, 'number town to Alex')
    ctx.close()
    nt.results = results + nt.results
    nt.errors = errors + nt.errors
    browser.close()

sys.exit(0 if nt.finish() else 1)
