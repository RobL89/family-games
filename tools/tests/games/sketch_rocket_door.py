"""Mock-ups: where the hangar door goes on the rocket tiles' start screen. Version 1.1.

Changes at v1.1: two more places, C and D, as Rob asked after mock-ups 1 ("can you think of
2 more mock ups"); the page becomes mock-ups 2, with all four side by side.

Step 2a-4b (D-050: the showroom is entered through a hangar door from the start screen).
Builds the real start screens from the repo (build_preview.py, no test panel), with made-up
progress (3 planets, 37 moon rocks), adds the door in one of two places, and photographs
each at phone upright, phone sideways and PC sizes in headless Chromium:

  A  Door in the bottom row: moon rocks, the door, Play. Rocks sit next to where they're spent.
  B  Door behind the rocket: the start screen's rocket stands in an open hangar doorway, and
     tapping the rocket (your ship) opens the showroom.
  C  Door in the top corner: a hangar door in the top-right corner, outside the card, facing
     the home button; always in the same place.
  D  Rocks and door as one button: the moon-rocks counter becomes a purple hangar button with
     the door at its left; tap your rocks to spend them.

The door is drawn here as an SVG (original art). Nothing in the game's files changes.
Writes JPEGs and an index.html into the folder given (default /mnt/user-data/outputs/door/).

Stand-in: headless Chromium (Playwright) for the phone and PC.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_rocket_door.py [out-folder]
"""
import base64, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/outputs/door'
os.makedirs(OUT, exist_ok=True)
VERSION = '1.1'

# The door: an arched frame, a roller shutter part raised, hazard stripes, a beacon and a glow
# from inside. Ink and colours are game.css's own (--ink, --sun, --sky, --lilac).
DOOR = '''<svg class="door-svg" viewBox="0 0 100 120" aria-hidden="true">
  <defs>
    <linearGradient id="dg-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1F6B"/><stop offset="1" stop-color="#8CF5FF"/></linearGradient>
    <pattern id="dg-haz" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="#FFC93C"/><rect width="6" height="12" fill="#1B1446"/></pattern>
  </defs>
  <path d="M8 116V44Q8 10 50 10Q92 10 92 44V116Z" fill="#5B4CC4" stroke="#1B1446" stroke-width="5" stroke-linejoin="round"/>
  <path d="M20 112V48Q20 24 50 24Q80 24 80 48V112Z" fill="url(#dg-in)" stroke="#1B1446" stroke-width="4"/>
  <g class="shutter">
    <path d="M20 48Q20 24 50 24Q80 24 80 48V66H20Z" fill="#B9B3E6" stroke="#1B1446" stroke-width="4" stroke-linejoin="round"/>
    <path d="M22 44H78M21 52H79M21 60H79" stroke="#1B1446" stroke-width="2.5" opacity=".55"/>
    <rect x="20" y="62" width="60" height="7" fill="url(#dg-haz)" stroke="#1B1446" stroke-width="3"/>
  </g>
  <rect x="4" y="110" width="92" height="9" rx="4" fill="url(#dg-haz)" stroke="#1B1446" stroke-width="4"/>
  <circle class="beacon" cx="50" cy="9" r="7" fill="#FF5D73" stroke="#1B1446" stroke-width="4"/>
</svg>'''

CSS = '''
.door-btn { position: relative; width: 74px; height: 74px; padding: 0; border: 0; background: none; cursor: pointer; flex: none; }
.door-btn .door-svg { width: 100%; height: 100%; overflow: visible; }
.door-btn .mini { position: absolute; left: 50%; bottom: 7px; width: 34px; height: 44px; translate: -50% 0; }
.door-hero { position: relative; width: 112px; height: 134px; flex: none; margin-left: -12px; cursor: pointer; }
.door-hero .door-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.door-hero .hero { position: absolute; left: 50%; bottom: 6px; translate: -50% 0; margin: 0; width: 76px; height: 99px; }
.door-corner { position: fixed; top: 10px; right: 12px; z-index: 1000; width: 70px; height: 80px; }
.door-rocks { display: inline-flex; align-items: center; gap: 6px; min-height: 66px; padding: 4px 8px 4px 6px; cursor: pointer;
  border: 4px solid var(--ink); border-radius: 999px; background: #7C6CF0; box-shadow: 0 6px 0 var(--ink); font: inherit; }
.door-rocks .door-svg { width: 50px; height: 58px; flex: none; }
.door-rocks .mini2 { position: absolute; width: 23px; height: 30px; left: 19px; bottom: 9px; }
.door-rocks .big-rocks { box-shadow: none; }
@media (orientation: landscape) and (max-height: 520px) { .door-btn { width: 62px; height: 62px; } .door-corner { width: 58px; height: 66px; } }
'''

# Injected after the page has drawn: A puts a door button between the rocks and Play, with a
# small copy of the rocket inside; B wraps the hero rocket in the doorway.
INJECT = r'''([opt, door, css]) => {
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const hero = document.getElementById('hero');
  const mirror = (c) => { const copy = () => { const x = c.getContext('2d'); x.clearRect(0, 0, 200, 260); x.drawImage(hero, 0, 0); }; copy(); setInterval(copy, 50); };
  if (opt === 'C') {
    const b = document.createElement('button');
    b.className = 'door-btn door-corner'; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.innerHTML = door + '<canvas class="mini" width="200" height="260"></canvas>';
    document.body.appendChild(b); mirror(b.querySelector('.mini'));
    return;
  }
  if (opt === 'D') {
    const pill = document.querySelector('.big-rocks');
    const b = document.createElement('button');
    b.className = 'door-rocks'; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.style.position = 'relative';
    b.innerHTML = door + '<canvas class="mini2" width="200" height="260"></canvas>';
    pill.parentNode.insertBefore(b, pill); b.appendChild(pill); mirror(b.querySelector('.mini2'));
    return;
  }
  if (opt === 'A') {
    const b = document.createElement('button');
    b.className = 'door-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.innerHTML = door + '<canvas class="mini" width="200" height="260"></canvas>';
    const foot = document.querySelector('.start-foot');
    foot.insertBefore(b, document.getElementById('play'));
    mirror(b.querySelector('.mini'));
  } else {
    const w = document.createElement('div');
    w.className = 'door-hero'; w.setAttribute('role', 'button'); w.setAttribute('aria-label', 'Hangar');
    hero.parentNode.insertBefore(w, hero);
    w.innerHTML = door; w.appendChild(hero);
  }
}'''

SIZES = [('phone', 390, 844), ('sideways', 844, 390), ('pc', 1280, 800)]
PROGRESS = {'v': 1, 'unlocked': 3, 'planet': 'moon', 'rocks': 37, 'landings': 40}  # made-up values

tmp = tempfile.mkdtemp(prefix='door-')
pages = {}
for game in ('rocket-lander', 'rocket-sums'):
    out = os.path.join(tmp, game + '.html')
    r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'build_preview.py'), game, '--number', 'D', '--out', out],
                       cwd=REPO, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'build failed for {game}: {r.stderr.strip()}')
    pages[game] = out

from playwright.sync_api import sync_playwright  # noqa: E402

shots, problems = [], []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for game, path in pages.items():
        for opt in ('none', 'A', 'B', 'C', 'D'):
            if game == 'rocket-sums' and opt == 'none':
                continue
            for name, w, h in SIZES:
                if game == 'rocket-sums' and name != 'phone':
                    continue  # Rocket Sums' start screen matches Rocket Lander's; one size shows it
                ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2)
                ctx.add_init_script(f'localStorage.setItem("family-games:{game}:progress", {json.dumps(json.dumps(PROGRESS))});')
                pg = ctx.new_page()
                errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.goto('file://' + path)
                pg.wait_for_timeout(900)
                if opt != 'none':
                    pg.evaluate(INJECT, [opt, DOOR, CSS])
                pg.wait_for_timeout(300)
                wide = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
                card = pg.evaluate('(() => { const c = document.getElementById("start"); return c.scrollHeight > c.clientHeight + 1; })()')
                if errs: problems.append(f'{game} {opt} {name}: page errors {errs}')
                if wide: problems.append(f'{game} {opt} {name}: sideways scrolling')
                if card: problems.append(f'{game} {opt} {name}: the start card scrolls')
                f = f'{game}-{opt}-{name}.jpg'
                pg.screenshot(path=os.path.join(OUT, f), type='jpeg', quality=78)
                shots.append((game, opt, name, f, card))
                ctx.close()
    br.close()


def img(f):
    return 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(OUT, f), 'rb').read()).decode()


TITLES = {'none': 'Today (no door)', 'A': 'A · Door in the bottom row', 'B': 'B · Door behind the rocket',
          'C': 'C · Door in the top corner', 'D': 'D · Rocks and door as one button'}
ABOUT = {
    'none': 'The start screen as it is now, with made-up progress: 3 planets open, 37 moon rocks.',
    'A': 'A small hangar door between the moon rocks and Play, with your ship peeking out. Rocks sit right next to where they are spent. One more thing in the bottom row.',
    'B': 'The rocket at the top already shows your ship; it now stands in an open hangar doorway, and tapping it opens the showroom. Nothing added to the bottom row, but a child has to find that the rocket can be tapped.',
    'C': 'A hangar door in the top-right corner, outside the card, facing the home button, with your ship inside. Always in the same place and nothing on the card changes, but it is the furthest from the rocks and sits where the test cog goes in debug previews (the cog would move).',
    'D': 'The moon-rocks counter becomes a purple hangar button: the door, with your ship in it, on the left of your rocks. Tap your rocks to spend them. The bottom row keeps two things, but the door is the smallest of the four.',
}
sec = []
for opt in ('none', 'A', 'B', 'C', 'D'):
    figs = ''.join(
        f'<figure class="{name}"><img src="{img(f)}" alt="{TITLES[opt]}, {name}"><figcaption>{name}{" (card scrolls)" if card else ""}</figcaption></figure>'
        for g, o, name, f, card in shots if g == 'rocket-lander' and o == opt)
    sec.append(f'<section><h2>{TITLES[opt]}</h2><p>{ABOUT[opt]}</p><div class="row">{figs}</div></section>')
sums = ''.join(f'<figure class="phone"><img src="{img(f)}" alt="Rocket Sums, {o}"><figcaption>{TITLES[o]}</figcaption></figure>'
               for g, o, name, f, card in shots if g == 'rocket-sums')
sec.append(f'<section><h2>Rocket Sums, phone</h2><p>The other tile, with each door.</p><div class="row">{sums}</div></section>')

html = f'''<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket games: where the hangar door goes (mock-ups)</title>
<style>
:root {{ color-scheme: light dark; --bg:#f4f1ff; --fg:#1B1446; --mut:#5d5880; --card:#fff; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#120C3A; --fg:#EDE8FF; --mut:#b7b1dc; --card:#221a5a; }} }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 22px; margin: 0 0 4px; }} h2 {{ font-size: 18px; margin: 0 0 4px; }}
.stamp {{ color: var(--mut); font-size: 13px; margin: 0 0 14px; }}
section {{ background: var(--card); border-radius: 14px; padding: 14px; margin-bottom: 14px; }}
section p {{ margin: 0 0 10px; color: var(--mut); }}
.row {{ display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; }}
figure {{ margin: 0; flex: none; }} figcaption {{ font-size: 13px; color: var(--mut); text-align: center; }}
figure img {{ display: block; border-radius: 10px; border: 2px solid #0003; height: auto; }}
figure.phone img {{ width: 180px; }} figure.sideways img {{ width: 360px; }} figure.pc img {{ width: 420px; }}
@media (max-width: 600px) {{ figure.sideways img, figure.pc img {{ width: 300px; }} }}
</style></head><body>
<h1>Where the hangar door goes</h1>
<p class="stamp">Mock-ups 2 · step 2a-4b · built by tools/tests/games/sketch_rocket_door.py {VERSION} from the real start screens · made-up progress · the door is a sketch, not final art</p>
{''.join(sec)}
</body></html>'''
open(os.path.join(OUT, 'index.html'), 'w').write(html)
print(f'{len(shots)} pictures, index.html written to {OUT}')
for p in problems:
    print('NOTE', p)
