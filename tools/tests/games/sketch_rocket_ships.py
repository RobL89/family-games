"""Animated mock-ups of the hangar's ships and two hangar layouts, for Rob to choose from
(step 2a-4a; D-045 to D-047). Version 1.0.

Not a check, and not part of the game: it builds one page of moving mock-ups to look at and
try before anything is built. It bundles
  - tools/tests/games/sketch_rocket_ships.js 1.0: the ships, how they look and what they do
    (drawn here only until Rob has chosen; the chosen ones move into games/_common/rocket/), and
  - tools/tests/games/sketch_rocket_hangar.js 1.0: the page: a gallery of the ships, and the
    two hangars, A (the hall) and B (the showroom), working, with pretend moon rocks,
with the shared engine modules they import from games/_common/rocket/ (scene, numbers,
planets, sound), unchanged, the same way build_preview.py bundles a game (its module rules,
reused from it), and Fredoka from games/_common/fonts/ inlined (D-043). The game's own files
are not changed, and the page fetches nothing.

Then it checks the page in headless Chromium (a stand-in for the phone and PC): at phone
(both ways round) and PC sizes, light and dark, no script errors, no sideways scrolling,
nothing fetched, and every canvas drawn (not blank). It then plays both hangars by mouse:
opens the door, picks a ship, buys it with pretend rocks and checks the rocks, the ships
owned and the ship picked; and taps a ship it can't afford and checks nothing changed. It
measures each animation's drawing time a frame, and saves pictures to OUT_DIR/shots/ for
looking over.

Usage, from the repo root:
    python3 -I -B tools/tests/games/sketch_rocket_ships.py OUT_DIR
Writes OUT_DIR/ships-mockups.html and OUT_DIR/shots/*.png, prints the page's size and sha256
and the check's results, and exits 1 if any check fails.
"""
import hashlib, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_preview as bp  # noqa: E402  (the preview builder's module and font rules)
from playwright.sync_api import sync_playwright  # noqa: E402

REPO = bp.REPO
GAME = 'ships-mock'  # a folder name for the bundle only: no such folder exists in games/
VIRTUAL = {f'games/{GAME}/page': 'sketch_rocket_hangar.js', f'games/{GAME}/ships': 'sketch_rocket_ships.js'}
FONT_CSS = 'games/_common/fonts/fredoka.css'
VERSION = '1.0'


def source_of(key):
    if key in VIRTUAL:
        path = os.path.join(HERE, VIRTUAL[key])
    else:
        path = os.path.join(REPO, key + '.js')
    if not os.path.exists(path):
        raise bp.BuildError(f'{key}.js is imported but does not exist')
    return path, bp.read(path)


def bundle():
    entry = f'games/{GAME}/page'
    mods, files, todo = {}, {}, [entry]
    while todo:
        key = todo.pop()
        if key in mods:
            continue
        path, text = source_of(key)
        files[key] = path
        mods[key] = bp.parse_module(GAME, key, text)
        todo.extend(dep for dep, _ in mods[key][0])
    order = bp.order_modules(entry, mods)
    parts = []
    for m in order:
        imports, exports, body = mods[m]
        for dep, names in imports:
            have = set(mods[dep][1])
            for n, _ in names:
                if n not in have:
                    raise bp.BuildError(f'{m}.js imports {n} from {dep}.js, which does not export it')
        head = ''.join(f"const {{ {', '.join(n if n == loc else f'{n}: {loc}' for n, loc in names)} }} = {bp.ident(dep)};\n"
                       for dep, names in imports)
        tail = f"\nreturn {{ {', '.join(exports)} }};\n" if exports else '\n'
        parts.append(f'// ---- {os.path.relpath(files[m], REPO)} ----\nconst {bp.ident(m)} = (() => {{\n{head}{body}{tail}}})();\n')
    used = sorted(os.path.relpath(p, REPO) for p in files.values()) + [FONT_CSS] + bp.css_fonts(GAME, FONT_CSS)
    h = hashlib.sha256()
    for rel in used:
        with open(os.path.join(REPO, rel), 'rb') as f:
            data = f.read()
        h.update(rel.encode() + b'\0' + str(len(data)).encode() + b'\0' + data)
    return ''.join(parts), used, h.hexdigest()


CSS = """
:root { --ink:#1B1446; --night:#120C3A; --sun:#FFC93C; --mint:#5FE3BD; --lilac:#EDE8FF; --coral:#FF5D73; color-scheme: dark; }
* { box-sizing:border-box }
html, body { overflow-x:hidden }
body { margin:0; background:var(--night); color:#fff; font:500 17px/1.45 Fredoka, "Segoe UI", system-ui, sans-serif; }
main { max-width:1320px; margin:0 auto; padding:18px 14px 48px; }
h1 { margin:4px 0 6px; font-size:28px; color:var(--sun); line-height:1.2 }
.lead { margin:0 0 10px; color:var(--lilac); max-width:70ch }
h2 { margin:30px 0 4px; font-size:23px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.n { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:50%; background:var(--sun); color:var(--ink); border:3px solid #fff; flex:none; }
.why { margin:0 0 12px; color:var(--lilac); max-width:75ch }
.rec { display:inline-block; padding:0 10px; border-radius:10px; background:var(--mint); color:var(--ink); font-size:15px; }
.bar { position:sticky; top:0; z-index:5; display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; padding:10px 12px; margin:10px -4px 4px;
  background:rgba(18,12,58,.94); border:2px solid #3A3290; border-radius:16px; }
.bar .grp { display:flex; flex-wrap:wrap; gap:6px; align-items:center }
.bar .lbl { color:var(--lilac); font-size:15px }
.rocksnow { display:inline-block; min-width:9.5em; padding:2px 10px; border-radius:10px; background:#fff; color:var(--ink); font-weight:600; font-size:15px }
button { font:600 15px/1 Fredoka, system-ui, sans-serif; color:var(--ink); background:#fff; border:3px solid var(--ink); border-radius:999px;
  padding:7px 12px; cursor:pointer; box-shadow:0 3px 0 rgba(10,6,40,.6); min-height:36px }
button[aria-pressed="true"] { background:var(--sun) }
button:active { translate:0 2px; box-shadow:0 1px 0 rgba(10,6,40,.6) }
button:focus-visible { outline:3px solid var(--sun); outline-offset:2px }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap:14px; align-items:start; }
.ship-card { margin:0; background:#1F1858; border:4px solid var(--ink); border-radius:20px; overflow:hidden; box-shadow:0 0 0 2px rgba(255,255,255,.12); }
.ship-card canvas { display:block; width:100%; height:auto; cursor:pointer; background:#0B0724 }
.ship-card figcaption { padding:10px 12px 12px; font-size:15px; }
.cardhead { display:flex; flex-wrap:wrap; gap:6px 8px; align-items:center }
.sname { font-size:19px }
.look { margin:6px 0 8px; color:var(--lilac) }
.tier { display:inline-block; padding:1px 9px; border-radius:10px; color:var(--ink); font-size:14px; font-weight:600; border:2px solid var(--ink) }
.t-starter { background:#B9BFE6 } .t-fun { background:#FF8FB1 } .t-cool { background:#8CF5FF } .t-premium { background:#FFC93C }
.t-legendary { background:linear-gradient(90deg,#FF8FB1,#FFC93C,#5FE3BD,#8CF5FF,#B9A7FF) }
.seg { display:flex; flex-wrap:wrap; gap:6px }
.seg button { font-size:14px; padding:6px 10px; min-height:34px }
.sizes { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 10px }
.stage { display:flex; justify-content:center; }
.device { display:inline-block; border:6px solid #000; border-radius:22px; overflow:hidden; box-shadow:0 0 0 3px #3A3290, 0 10px 30px rgba(0,0,0,.5); background:#000; line-height:0 }
.device canvas { display:block; touch-action:pan-y }
ol.ask { margin:6px 0 0; padding-left:1.4em; max-width:75ch } ol.ask li { margin:4px 0 }
.stamp { margin-top:30px; font-size:13px; color:#B9B3E6; max-width:90ch }
"""


def page(script, commit, src):
    css_font = bp.inline_fonts(GAME, FONT_CSS, bp.read(os.path.join(REPO, FONT_CSS)))
    if '</style' in css_font.lower() or '</script' in script.lower():
        raise bp.BuildError('a closing tag would end the inline style or script')
    return f"""<!DOCTYPE html>
<!-- Mock-ups for step 2a-4a, built by tools/tests/games/sketch_rocket_ships.py {VERSION} from claude/games at {commit}; sha256 of the files bundled: {src} -->
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket games: the hangar and its ships (mock-ups)</title>
<style>
{css_font}</style>
<style>{CSS}</style></head><body><main>
<h1>Rocket games: the hangar and its ships</h1>
<p class="lead">Step 2a-4a (D-045 to D-047). Mock-ups that move: everything here is drawn by code as you watch, with the game's own Bip, planets and number line.
The pretend moon rocks below let you try buying; nothing is saved, and a reload starts afresh.</p>
<div class="bar" id="bar" aria-label="Mock-up controls"></div>

<section aria-labelledby="h-ships"><h2 id="h-ships"><span class="n">1</span> The ships</h2>
<p class="why">Today's rocket, then seven new ships in four tiers, each tier a step up in shine, light, moving parts and landing show.
<b>Flying</b> shows each ship coming down onto a number (the beam and pads aren't shown), its touchdown, then Bip's big moment with fireworks in the ship's colours.
<b>In the hangar</b> shows it showing off on its pad. Tap a picture to replay it with sound. They're drawn a little larger than in play.</p>
<div class="grid" id="ships"></div></section>

<section aria-labelledby="h-hall"><h2 id="h-hall"><span class="n">2</span> Hangar A: the hall <span class="rec">my lean</span></h2>
<p class="why">Tap the door to open it. Swipe, or use the arrows, to walk along the hall; tap a ship to see it show off, then <b>Buy</b> or <b>Fly this one</b>.
The bays get grander along the hall: doodles, neon, a gold gallery, and a stage for the Legendary ship. Bip sits in the ship you fly, and runs to a new one.
On the real start screen, the hangar would open from a door-shaped button beside the planets.</p>
<div class="sizes" id="hall-sizes" role="group" aria-label="Screen size for hangar A"></div>
<div class="stage" id="hall"></div></section>

<section aria-labelledby="h-show"><h2 id="h-show"><span class="n">3</span> Hangar B: the showroom</h2>
<p class="why">One ship at a time, big, on a turning platform under spotlights. Use the arrows, swipe, or tap a badge along the bottom to change ship; tap the ship to see it show off.</p>
<div class="sizes" id="show-sizes" role="group" aria-label="Screen size for hangar B"></div>
<div class="stage" id="show"></div></section>

<section aria-labelledby="h-ask"><h2 id="h-ask"><span class="n">4</span> What I need from you</h2>
<ol class="ask">
<li>Which ships to keep, change or drop, and anything to make bigger, slower, louder or quieter.</li>
<li>Hall (A), showroom (B), or a mix, for example the hall to look round, and tapping a ship opens it in the showroom.</li>
<li>Anything to change in the buying moment: the rocks flying in, the glass or force field breaking, the fanfare, Bip running to the new ship.</li>
</ol>
<p class="why">The prices (20 to 200 moon rocks) are starting values, to tune from the trial week's rock counts (Q-025).</p></section>

<p class="stamp">Mock-ups, not the game. Built from claude/games at {commit} by tools/tests/games/sketch_rocket_ships.py {VERSION}: the ships are drawn by sketch_rocket_ships.js {VERSION},
the page by sketch_rocket_hangar.js {VERSION}, with the game's games/_common/rocket/ scene, numbers, planets and sounds as they are. Fredoka is inlined from games/_common/fonts/ (D-043);
nothing is fetched. All drawing and sounds are original and made in code. Checked in headless Chromium, standing in for the phone and PC.
With "Less motion" on, or when the device asks for less motion, there are fewer sparks, one firework and no bobbing.</p>
</main>
<script>
{script}</script></body></html>
"""


def check(path, out):
    shots = os.path.join(out, 'shots')
    os.makedirs(shots, exist_ok=True)
    fails, notes, perf = [], [], {}
    url = 'file://' + os.path.abspath(path)
    with sync_playwright() as p:
        br = p.chromium.launch()

        def open_page(w, h, mob, scheme):
            ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob, color_scheme=scheme, device_scale_factor=2 if mob else 1)
            asked, errors = [], []

            def route(r):
                u = r.request.url
                if u.startswith('file:') or u.startswith('data:') or u.startswith('blob:'):
                    return r.continue_()
                asked.append(u)
                return r.abort()
            ctx.route('**/*', route)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'page error: {e}'))
            pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type == 'error' else None)
            pg.goto(url)
            pg.wait_for_function('window.__mock && window.__mock.ready', timeout=20000)
            return ctx, pg, asked, errors

        for w, h, mob in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
            for scheme in ('light', 'dark'):
                ctx, pg, asked, errors = open_page(w, h, mob, scheme)
                n = pg.evaluate('document.querySelectorAll("canvas").length')
                blank = []
                for i in range(n):
                    pg.evaluate(f'document.querySelectorAll("canvas")[{i}].scrollIntoView({{block: "center"}})')
                    pg.wait_for_timeout(450)
                    ok = pg.evaluate(f"""(() => {{ const c = document.querySelectorAll('canvas')[{i}];
                        const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data, seen = new Set();
                        for (let k = 0; k < d.length; k += 4 * 97) seen.add(d[k] + ',' + d[k + 1] + ',' + d[k + 2]);
                        return seen.size; }})()""")
                    if ok < 12:
                        blank.append(i)
                wide = pg.evaluate('document.documentElement.scrollWidth - window.innerWidth')
                tag = f'{w}x{h} {scheme}'
                if errors:
                    fails.append(f'{tag}: {errors[:3]}')
                if asked:
                    fails.append(f'{tag}: fetched {asked[:3]}')
                if wide > 1:
                    fails.append(f'{tag}: sideways scrolling by {wide}px')
                if blank:
                    fails.append(f'{tag}: blank canvases {blank}')
                notes.append(f'{tag}: {n} canvases, none blank' if not blank else f'{tag}: blank {blank}')
                if scheme == 'dark':
                    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(300)
                    pg.screenshot(path=os.path.join(shots, f'page-top-{w}x{h}.png'))
                ctx.close()

        # Play both hangars with the mouse, on a PC-sized page.
        ctx, pg, asked, errors = open_page(1280, 800, False, 'dark')

        def click(sel, x, y):
            box = pg.locator(sel).bounding_box()
            W = pg.evaluate(f"__mock.{'hall' if 'hall' in sel else 'show'}.W")
            sc = box['width'] / W
            pg.mouse.click(box['x'] + x * sc, box['y'] + y * sc)

        def click_hit(sel, demo, hid):
            r = pg.evaluate(f"(() => {{ const r = __mock.{demo}.rectOf('{hid}'); return r && {{ x: r.x, y: r.y, w: r.w, h: r.h }}; }})()")
            if not r:
                fails.append(f'{demo}: no {hid} to tap')
                return False
            click(sel, r['x'] + r['w'] / 2, r['y'] + r['h'] / 2)
            return True

        state = lambda: pg.evaluate('({ rocks: __mock.wallet.rocks, owned: [...__mock.wallet.owned].sort(), picked: __mock.wallet.picked })')
        pg.evaluate('__mock.setRocks(75)')
        pg.locator('#hall canvas').scroll_into_view_if_needed(); pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(shots, 'hall-door.png'))
        W, H = pg.evaluate('[__mock.hall.W, __mock.hall.H]')
        click('#hall canvas', W / 2, H / 2); pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(shots, 'hall-door-opening.png'))
        pg.wait_for_timeout(2600)
        pg.screenshot(path=os.path.join(shots, 'hall-open.png'))
        if click_hit('#hall canvas', 'hall', 'bay:box'):
            pg.wait_for_timeout(1400)
            pg.screenshot(path=os.path.join(shots, 'hall-box-picked.png'))
            click_hit('#hall canvas', 'hall', 'action'); pg.wait_for_timeout(1150)
            pg.screenshot(path=os.path.join(shots, 'hall-buying.png'))
            pg.wait_for_timeout(500)
            pg.screenshot(path=os.path.join(shots, 'hall-bought.png'))
            pg.wait_for_timeout(4200)
            s = state()
            want = {'rocks': 55, 'owned': ['box', 'classic'], 'picked': 'box'}
            notes.append(f'hall: bought the Cardboard Box with 75 pretend rocks: {s}')
            if s != want:
                fails.append(f'hall: after buying the box, {s}, expected {want}')
            pg.screenshot(path=os.path.join(shots, 'hall-after.png'))
        # walk to the far end, to see the grander bays
        for _ in range(7):
            click_hit('#hall canvas', 'hall', 'right'); pg.wait_for_timeout(450)
        pg.wait_for_timeout(900)
        pg.screenshot(path=os.path.join(shots, 'hall-legendary.png'))
        for _ in range(2):
            click_hit('#hall canvas', 'hall', 'left'); pg.wait_for_timeout(450)
        pg.wait_for_timeout(900)
        pg.screenshot(path=os.path.join(shots, 'hall-premium.png'))
        before = state()
        click_hit('#hall canvas', 'hall', 'action'); pg.wait_for_timeout(600)
        after = state()
        notes.append(f'hall: tapped Buy on a ship it can\'t afford: {after}')
        if after != before:
            fails.append(f'hall: a ship it couldn\'t afford changed things: {before} -> {after}')
        for size in ('upright', 'pc'):
            pg.evaluate(f"__mock.hall.setSize('{size}')"); pg.wait_for_timeout(1200)
            pg.locator('#hall canvas').screenshot(path=os.path.join(shots, f'hall-{size}.png'))
        pg.evaluate("__mock.hall.setSize('sideways')")

        pg.evaluate('__mock.setRocks(60)')
        pg.locator('#show canvas').scroll_into_view_if_needed(); pg.wait_for_timeout(500)
        W, H = pg.evaluate('[__mock.show.W, __mock.show.H]')
        click('#show canvas', W / 2, H / 2); pg.wait_for_timeout(3200)
        pg.screenshot(path=os.path.join(shots, 'show-open.png'))
        if click_hit('#show canvas', 'show', 'badge:pod'):
            pg.wait_for_timeout(1500)
            pg.screenshot(path=os.path.join(shots, 'show-pod.png'))
            click_hit('#show canvas', 'show', 'action'); pg.wait_for_timeout(1500)
            pg.screenshot(path=os.path.join(shots, 'show-buying.png'))
            pg.wait_for_timeout(4200)
            s = state()
            want = {'rocks': 10, 'owned': ['box', 'classic', 'pod'], 'picked': 'pod'}
            notes.append(f'showroom: bought the Bubble Pod with 60 pretend rocks: {s}')
            if s != want:
                fails.append(f'showroom: after buying the pod, {s}, expected {want}')
            pg.screenshot(path=os.path.join(shots, 'show-after.png'))
        for sid in ('saucer', 'crystal', 'phoenix', 'aurora'):
            click_hit('#show canvas', 'show', f'badge:{sid}'); pg.wait_for_timeout(1700)
            pg.locator('#show canvas').screenshot(path=os.path.join(shots, f'show-{sid}.png'))
        before = state()
        click_hit('#show canvas', 'show', 'action'); pg.wait_for_timeout(600)
        after = state()
        notes.append(f'showroom: tapped the button on the Aurora Cruiser with 10 rocks: {after}')
        if after != before:
            fails.append(f'showroom: a ship it couldn\'t afford changed things: {before} -> {after}')
        for size in ('upright', 'pc'):
            pg.evaluate(f"__mock.show.setSize('{size}')"); pg.wait_for_timeout(1200)
            pg.locator('#show canvas').screenshot(path=os.path.join(shots, f'show-{size}.png'))
        pg.evaluate("__mock.show.setSize('sideways')")

        # Each ship in the gallery at four moments: coming down, touchdown, Bip's moment, the hangar.
        for i, sid in enumerate(pg.evaluate('__mock.cards.map((c) => c.ship.id)')):
            sel = f'#ships figure:nth-child({i + 1}) canvas'
            pg.locator(sel).scroll_into_view_if_needed()
            for name, T in (('down', 1.5), ('touch', 3.42), ('moment', 7.2)):
                pg.evaluate(f'(() => {{ const c = __mock.cards[{i}]; c.restart(); c.T = {T - 0.6}; }})()')
                pg.wait_for_timeout(600)
                pg.locator(sel).screenshot(path=os.path.join(shots, f'card-{i}-{sid}-{name}.png'))
            pg.locator(f'#ships figure:nth-child({i + 1}) button[data-m="hangar"]').click(); pg.wait_for_timeout(1100)
            pg.locator(sel).screenshot(path=os.path.join(shots, f'card-{i}-{sid}-hangar.png'))
            pg.locator(f'#ships figure:nth-child({i + 1}) button[data-m="fly"]').click()

        # How long each animation takes to draw a frame (headless Chromium, software drawing).
        for sel in ('#hall canvas', '#show canvas', '#ships figure:nth-child(8) canvas'):
            pg.locator(sel).scroll_into_view_if_needed(); pg.wait_for_timeout(300)
            pg.evaluate('__mock.resetPerf()'); pg.wait_for_timeout(3000)
            perf.update({k: v for k, v in pg.evaluate('__mock.perf()').items() if v['n'] > 20})
        if errors:
            fails.append(f'play-through: {errors[:3]}')
        if asked:
            fails.append(f'play-through: fetched {asked[:3]}')
        ctx.close()
        br.close()
    return fails, notes, perf


def main(argv):
    if len(argv) != 2:
        print(__doc__.split('Usage')[1])
        return 2
    out = argv[1]
    os.makedirs(out, exist_ok=True)
    script, used, src = bundle()
    commit = bp.commit_of('games/_common', *[f'tools/tests/games/{f}' for f in VIRTUAL.values()], 'tools/tests/games/sketch_rocket_ships.py')
    html = page(script, commit, src)
    far = sorted(set(bp.re.findall(r'https?://[\w.-]+', html)))
    if far:
        raise bp.BuildError(f'outside addresses named in the page: {far[:5]}')
    path = os.path.join(out, 'ships-mockups.html')
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(html)
    data = html.encode('utf-8')
    print(f'page: {path}, {len(data)} bytes, sha256 {hashlib.sha256(data).hexdigest()}')
    print(f'bundled: {", ".join(used)}; sources sha256 {src}')
    fails, notes, perf = check(path, out)
    for n in notes:
        print('  ' + n)
    print('frame drawing time, ms (median / 95th percentile):')
    for k, v in sorted(perf.items()):
        print(f'  {k}: {v["median"]:.2f} / {v["p95"]:.2f} over {v["n"]} frames')
    if fails:
        print('FAIL')
        for f in fails:
            print('  ' + f)
        return 1
    print('PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
