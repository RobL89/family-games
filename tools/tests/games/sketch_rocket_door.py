"""Mock-ups: where the hangar door goes on the rocket tiles' start screen. Version 1.3.

Changes at v1.3 (step 2a-4b): the ship drawings are read from games/_common/rocket/ships.js,
where they moved (D-053). The game now has door D2 built in (D-052), so this script adds a
second door to a start card that already has one: to rebuild mock-ups 3 as Rob saw them, run it
from commit 26b299c. It is kept as the record of how they were made.

Changes at v1.2: mock-ups 3. Rob leans to D and asked for a bigger door, and for the rocket at
the top of the start card to show the ship being flown. Three ways to give D a bigger door
(D1 taller button, D2 door standing on the button, D3 door above the rocks), each drawn with a
bought ship (the Teapot) at the top and in the doorway, using the accepted ship drawings
(sketch_rocket_ships.js 1.0, D-049). A to D from mock-ups 2 stay on the page, phone only.
The pictures are now taken from a local web server, so the ship module can load.
Changes at v1.1: two more places, C and D, as Rob asked after mock-ups 1.

Step 2a-4b (D-050: the showroom is entered through a hangar door from the start screen).
Builds the real start screens from the repo (build_preview.py, no test panel), with made-up
progress (3 planets, 37 moon rocks), adds the door, and photographs each at phone upright,
phone sideways and PC sizes in headless Chromium:

  A  Door in the bottom row: moon rocks, the door, Play.
  B  Door behind the rocket: the start card's rocket stands in an open hangar doorway.
  C  Door in the top corner, outside the card, facing the home button.
  D  Rocks and door as one button: the moon-rocks counter becomes a purple hangar button.
  D1 As D, the button taller, so the door is about half as big again.
  D2 As D, the button the height of Play, with a big door standing on its left end.
  D3 As D, the door on top and the rocks underneath, in one tall button beside Play.

The door is drawn here as an SVG (original art). Nothing in the game's files changes.
Writes JPEGs and an index.html into the folder given (default /mnt/user-data/outputs/door/).

Stand-ins: headless Chromium (Playwright) for the phone and PC; a local static server.
Usage, from the repo root:
    python3 -B tools/tests/games/sketch_rocket_door.py [out-folder]
"""
import base64, functools, http.server, json, os, shutil, socketserver, subprocess, sys, tempfile, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/outputs/door'
os.makedirs(OUT, exist_ok=True)
VERSION = '1.3'
SHIP = 'teapot'  # the bought ship shown in mock-ups 3 (made-up progress)

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
    <path d="M20 48Q20 24 50 24Q80 24 80 48V50H20Z" fill="#B9B3E6" stroke="#1B1446" stroke-width="4" stroke-linejoin="round"/>
    <path d="M24 36H76M21 44H79" stroke="#1B1446" stroke-width="2.5" opacity=".55"/>
    <rect x="20" y="46" width="60" height="7" fill="url(#dg-haz)" stroke="#1B1446" stroke-width="3"/>
  </g>
  <rect x="4" y="110" width="92" height="9" rx="4" fill="url(#dg-haz)" stroke="#1B1446" stroke-width="4"/>
  <circle class="beacon" cx="50" cy="9" r="7" fill="#FF5D73" stroke="#1B1446" stroke-width="4"/>
</svg>'''
# The door with its doorway: the ship being flown shows in the opening under the shutter.
DOOR = f'<span class="door-wrap">{DOOR}<canvas class="mini" width="140" height="190"></canvas></span>'

CSS = '''
.door-wrap { position: relative; display: inline-block; flex: none; width: 50px; height: 60px; }
.door-wrap .door-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.door-wrap .mini { position: absolute; left: 29%; top: 44%; width: 42%; height: 47.5%; }
.door-btn { position: relative; width: 74px; height: 74px; padding: 0; border: 0; background: none; cursor: pointer; flex: none; }
.door-btn .door-wrap { width: 100%; height: 100%; }
.door-hero { position: relative; width: 112px; height: 134px; flex: none; margin-left: -12px; cursor: pointer; }
.door-hero .door-wrap { position: absolute; inset: 0; width: 100%; height: 100%; }
.door-hero .hero { position: absolute; left: 50%; bottom: 6px; translate: -50% 0; margin: 0; width: 76px; height: 99px; }
.door-corner { position: fixed; top: 10px; right: 12px; z-index: 1000; width: 70px; height: 80px; }
.door-rocks { position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 66px; padding: 4px 8px 4px 6px; cursor: pointer;
  border: 4px solid var(--ink); border-radius: 999px; background: #7C6CF0; box-shadow: 0 6px 0 var(--ink); font: inherit; color: var(--ink); }
.door-rocks .big-rocks { box-shadow: none; }
/* D1: taller button, bigger door */
.door-rocks.d1 { min-height: 100px; padding: 6px 12px 6px 10px; border-radius: 34px; gap: 10px; }
.door-rocks.d1 .door-wrap { width: 74px; height: 89px; }
/* D2: Play-height button, a big door standing on its left end */
.start-foot.has-d2 { margin-top: 44px; }
.door-rocks.d2 { padding-left: 92px; }
.door-rocks.d2 .door-wrap { position: absolute; left: -6px; bottom: -6px; width: 96px; height: 115px; }
/* D3: the door on top, the rocks underneath, beside Play */
.door-rocks.d3 { flex-direction: column; gap: 2px; padding: 6px 8px 8px; border-radius: 30px; }
.door-rocks.d3 .door-wrap { width: 84px; height: 101px; }
.door-rocks.d3 .big-rocks { font-size: 22px; padding: 2px 12px 2px 4px; }
.door-rocks.d3 .big-rocks .rock-icon { width: 28px; height: 28px; }
@media (orientation: landscape) and (max-height: 520px) {
  .door-btn { width: 62px; height: 62px; } .door-corner { width: 58px; height: 66px; }
  .door-rocks.d1 { min-height: 84px; } .door-rocks.d1 .door-wrap { width: 60px; height: 72px; }
  .start-foot.has-d2 { margin-top: 30px; }
  .door-rocks.d3 .door-wrap { width: 62px; height: 74px; }
}
'''

# Injected after the page has drawn. With a ship, the start card's rocket is redrawn as that
# ship (window.__ships, loaded from the ship sketch), and every doorway shows the same picture.
INJECT = r'''([opt, door, css, shipId]) => {
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  let hero = document.getElementById('hero');
  if (shipId) {
    const M = window.__ships, ship = M.SHIP_BY_ID[shipId];
    const c = document.createElement('canvas');
    c.width = hero.width; c.height = hero.height; c.className = hero.className; c.id = 'hero-ship';
    hero.style.display = 'none'; hero.parentNode.insertBefore(c, hero); hero = c;
    const S = M.newState(150), P = new M.Parts();
    S.x = 100; S.y = 108; S.thrust = 0.75; S.air = true; S.legs = 0;
    let last = performance.now() / 1000;
    const tick = () => {
      const t = performance.now() / 1000, dt = Math.min(0.05, t - last); last = t;
      S.y = 108 + Math.sin(t * 2.2) * 6; S.rot = Math.sin(t * 1.3) * 0.06;
      M.tickShip(ship, S, P, dt, t); P.update(dt);
      const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
      P.draw(x, 'back'); M.drawShip(x, ship, S, t); P.draw(x, 'front');
      requestAnimationFrame(tick);
    };
    tick();
  }
  // The doorway shows the start card's ship, cropped to the ship and its flame.
  const mirror = (m) => { const copy = () => { const x = m.getContext('2d'); x.clearRect(0, 0, m.width, m.height); x.drawImage(hero, 30, 22, 140, 190, 0, 0, m.width, m.height); }; copy(); setInterval(copy, 50); };
  const rocksButton = (cls) => {
    const pill = document.querySelector('.big-rocks');
    const b = document.createElement('button');
    b.className = 'door-rocks ' + cls; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.innerHTML = door;
    pill.parentNode.insertBefore(b, pill); b.appendChild(pill); mirror(b.querySelector('.mini'));
    if (cls === 'd2') document.querySelector('.start-foot').classList.add('has-d2');
  };
  if (opt === 'D' || opt === 'D1' || opt === 'D2' || opt === 'D3') { rocksButton(opt.toLowerCase()); return; }
  if (opt === 'C') {
    const b = document.createElement('button');
    b.className = 'door-btn door-corner'; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.innerHTML = door;
    document.body.appendChild(b); mirror(b.querySelector('.mini'));
    return;
  }
  if (opt === 'A') {
    const b = document.createElement('button');
    b.className = 'door-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Hangar');
    b.innerHTML = door;
    document.querySelector('.start-foot').insertBefore(b, document.getElementById('play'));
    mirror(b.querySelector('.mini'));
  } else if (opt === 'B') {
    const w = document.createElement('div');
    w.className = 'door-hero'; w.setAttribute('role', 'button'); w.setAttribute('aria-label', 'Hangar');
    hero.parentNode.insertBefore(w, hero);
    w.innerHTML = door; w.appendChild(hero);
  }
}'''

SIZES = [('phone', 390, 844), ('sideways', 844, 390), ('pc', 1280, 800)]
PROGRESS = {'v': 1, 'unlocked': 3, 'planet': 'moon', 'rocks': 37, 'landings': 40}  # made-up values
# (game, option, size, ship): mock-ups 3 in full, then mock-ups 2's options on the phone.
SHOTS = ([('rocket-lander', o, s, SHIP) for o in ('D1', 'D2', 'D3') for s, _, _ in SIZES]
         + [('rocket-sums', o, 'phone', SHIP) for o in ('D1', 'D2', 'D3')]
         + [('rocket-lander', o, 'phone', None) for o in ('A', 'B', 'C', 'D')])

# A folder served over http: the two start screens, the shared engine (linked, unchanged) and a
# copy of the ship sketch where its import '../_common/rocket/scene.js' finds the engine.
root = tempfile.mkdtemp(prefix='door-')
os.makedirs(os.path.join(root, 'games', 'ships-mock'))
os.symlink(os.path.join(REPO, 'games', '_common'), os.path.join(root, 'games', '_common'))
with open(os.path.join(root, 'games', 'ships-mock', 'ships.js'), 'w') as fh:  # the ships moved to the engine (D-053)
    fh.write("export * from '../_common/rocket/ships.js';\n")
for game in ('rocket-lander', 'rocket-sums'):
    r = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'build_preview.py'), game, '--number', 'D',
                        '--out', os.path.join(root, game + '.html')], cwd=REPO, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'build failed for {game}: {r.stderr.strip()}')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


Quiet.extensions_map = {**Quiet.extensions_map, '.js': 'text/javascript'}
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}'

from playwright.sync_api import sync_playwright  # noqa: E402

done, problems = [], []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for game, opt, name, ship in SHOTS:
        w, h = next((w, h) for n, w, h in SIZES if n == name)
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2)
        ctx.add_init_script(f'localStorage.setItem("family-games:{game}:progress", {json.dumps(json.dumps(PROGRESS))});')
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f'{BASE}/{game}.html')
        pg.wait_for_timeout(900)
        if ship:
            pg.add_script_tag(type='module', content="import * as M from '/games/ships-mock/ships.js'; window.__ships = M;")
            pg.wait_for_function('!!window.__ships', timeout=10000)
        pg.evaluate(INJECT, [opt, DOOR, CSS, ship])
        pg.wait_for_timeout(1200)
        wide = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
        card = pg.evaluate('(() => { const c = document.getElementById("start"); return c.scrollHeight > c.clientHeight + 1; })()')
        if errs: problems.append(f'{game} {opt} {name}: page errors {errs}')
        if wide: problems.append(f'{game} {opt} {name}: sideways scrolling')
        if card: problems.append(f'{game} {opt} {name}: the start card scrolls')
        f = f'{game}-{opt}-{name}.jpg'
        pg.screenshot(path=os.path.join(OUT, f), type='jpeg', quality=78)
        done.append((game, opt, name, f, card))
        ctx.close()
    br.close()
srv.shutdown()


def img(f):
    return 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(OUT, f), 'rb').read()).decode()


def figs(rows, caption):
    return ''.join(f'<figure class="{name}"><img src="{img(f)}" alt="{opt}, {name}"><figcaption>{caption(opt, name)}'
                   f'{" (card scrolls)" if card else ""}</figcaption></figure>' for g, opt, name, f, card in rows)


TITLES = {'D1': 'D1 · Taller button', 'D2': 'D2 · Door standing on the button', 'D3': 'D3 · Door above the rocks',
          'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D'}
ABOUT = {
    'D1': 'The purple button grows taller, so the door is about half as big again, with the rocks beside it. On an upright phone Play sits on its own line underneath.',
    'D2': 'The button stays the height of Play, and a big door stands on its left end, rising above the button like a hangar building. The bottom row needs a little more room above it.',
    'D3': 'One tall button: the big door on top, your rocks underneath. It fits beside Play in one row on every screen.',
}
sec = []
for opt in ('D1', 'D2', 'D3'):
    rows = [d for d in done if d[0] == 'rocket-lander' and d[1] == opt]
    sec.append(f'<section><h2>{TITLES[opt]}</h2><p>{ABOUT[opt]}</p><div class="row">{figs(rows, lambda o, n: n)}</div></section>')
sec.append('<section><h2>Rocket Sums, phone</h2><p>The other tile, with each.</p><div class="row">'
           + figs([d for d in done if d[0] == 'rocket-sums'], lambda o, n: TITLES[o]) + '</div></section>')
sec.append('<section><h2>Earlier: A to D (mock-ups 2), phone</h2><p>For comparison, with today\'s rocket.</p><div class="row">'
           + figs([d for d in done if d[1] in ('A', 'B', 'C', 'D')], lambda o, n: TITLES[o]) + '</div></section>')

html = f'''<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket games: where the hangar door goes (mock-ups)</title>
<style>
:root {{ color-scheme: light dark; --bg:#f4f1ff; --fg:#1B1446; --mut:#5d5880; --card:#fff; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#120C3A; --fg:#EDE8FF; --mut:#b7b1dc; --card:#221a5a; }} }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 22px; margin: 0 0 4px; }} h2 {{ font-size: 18px; margin: 0 0 4px; }}
.stamp {{ color: var(--mut); font-size: 13px; margin: 0 0 8px; }}
.lead {{ margin: 0 0 14px; }}
section {{ background: var(--card); border-radius: 14px; padding: 14px; margin-bottom: 14px; }}
section p {{ margin: 0 0 10px; color: var(--mut); }}
.row {{ display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; }}
figure {{ margin: 0; flex: none; }} figcaption {{ font-size: 13px; color: var(--mut); text-align: center; }}
figure img {{ display: block; border-radius: 10px; border: 2px solid #0003; height: auto; }}
figure.phone img {{ width: 180px; }} figure.sideways img {{ width: 360px; }} figure.pc img {{ width: 420px; }}
@media (max-width: 600px) {{ figure.sideways img, figure.pc img {{ width: 300px; }} }}
</style></head><body>
<h1>Where the hangar door goes</h1>
<p class="stamp">Mock-ups 3 · step 2a-4b · built by tools/tests/games/sketch_rocket_door.py {VERSION} from the real start screens · made-up progress · the door is a sketch, not final art</p>
<p class="lead">Three ways to make D's door bigger. In each, the Teapot has been bought and picked, so the rocket at the top of the card and the ship in the doorway are both the Teapot: they always show the ship you'll fly.</p>
{''.join(sec)}
</body></html>'''
open(os.path.join(OUT, 'index.html'), 'w').write(html)
print(f'{len(done)} pictures, index.html written to {OUT}')
for p in problems:
    print('NOTE', p)
