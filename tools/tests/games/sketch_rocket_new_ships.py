"""Animated mock-ups of the five new ships for Rocket Lander's hangar, for Rob to choose from
(step 2d-1; D-073 to D-077). Version 1.0.

Not a check, and not part of the game: it builds one page of moving mock-ups to look at and try
before anything is built. The five ships are drawn in tools/tests/games/sketch_rocket_new_ships.js
1.0, written as ships.js writes ships. This script splices its parts into copies of three game
modules, for the page only (each splice must match exactly one place, or the build stops):
  - games/_common/rocket/ships.js: the five ships before its SHIPS table, which lists all
    thirteen; and three new kinds of spark in drawPart (a music note, a petal, a water drop);
  - games/_common/rocket/fleet.js: the five rows, at D-077's tiers and prices;
  - games/_common/rocket/sound.js: each new ship's own landing sound (D-077).
The page itself is tools/tests/games/sketch_rocket_new_ships_page.js 1.0, bundled with those
copies and the rest of games/_common/rocket/ as they are (the game's own showroom, hangar.js,
included), the way build_preview.py bundles a game (its module rules, reused), with Fredoka
inlined from games/_common/fonts/ (D-043). Nothing in games/ changes, and the page fetches nothing.

The checks, decided before the page was built:
  - at phone (upright and sideways) and PC sizes, light and dark: no script errors, nothing
    fetched, no sideways scrolling, every canvas on show drawn (not blank), and the size strip
    scaled to fit its box, never cropped or squashed;
  - narrow where it lands (D-076): measured from each drawing, each new ship is no wider across
    its feet (its lowest tenth) than the Classic, standing and at its landing joke, and no
    wider overall; and nothing is drawn below its feet further than the Classic's own feet go;
  - the fleet: the five rows at D-077's tiers and prices (850 rocks for all twelve to buy), the
    hangar's order cheapest first in each tier, and each new ship's own sound, made in code;
  - the showroom, played by mouse: buys the Splash Tub and the Christmas Tree with 120 pretend
    rocks (95, then 15 left, each flown once bought), then taps Buy on the Jack-in-the-Box with
    too few and checks nothing changed;
  - every new sound plays without a script error.
It saves pictures to OUT_DIR/shots/ for looking over, and measures each animation's drawing time.

Usage, from the repo root:
    python3 -I -B tools/tests/games/sketch_rocket_new_ships.py OUT_DIR
Writes OUT_DIR/new-ships.html and OUT_DIR/shots/*.png, prints the page's size and sha256 and the
checks' results, and exits 1 if any check fails.
"""
import base64, hashlib, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_preview as bp  # noqa: E402  (the preview builder's module and font rules)
from playwright.sync_api import sync_playwright  # noqa: E402

REPO = bp.REPO
VERSION = '1.0'
GAME = 'new-ships-mock'  # a folder name for the bundle only: no such folder exists in games/
PAGE = 'sketch_rocket_new_ships_page.js'
SHIPS_SKETCH = 'sketch_rocket_new_ships.js'
VIRTUAL = {f'games/{GAME}/page': PAGE}
FONT_CSS = 'games/_common/fonts/fredoka.css'
NEW = ['tub', 'jack', 'sunflower', 'spin', 'tree']
WANT = {'tub': ('Splash Tub', 'fun', 25), 'jack': ('Jack-in-the-Box', 'fun', 35), 'sunflower': ('Sunflower Copter', 'fun', 40),
        'spin': ('Spin Cycle', 'cool', 60), 'tree': ('Christmas Tree', 'cool', 80)}  # D-077
ORDER = ['classic', 'box', 'tub', 'teapot', 'jack', 'sunflower', 'pod', 'spin', 'saucer', 'tree', 'crystal', 'phoenix', 'aurora']


def sketch_parts():
    parts, cur = {}, None
    for line in bp.read(os.path.join(HERE, SHIPS_SKETCH)).split('\n'):
        m = re.match(r'^// @part (\w+)\s*$', line)
        if m:
            cur = m.group(1)
            parts[cur] = []
            continue
        if cur:
            parts[cur].append(line)
    return {k: '\n'.join(v).strip('\n') for k, v in parts.items()}


def once(text, old, new, where):
    n = text.count(old)
    if n != 1:
        raise bp.BuildError(f'{where}: expected one place to splice, found {n}: {old[:60]!r}')
    return text.replace(old, new)


def splice(key, text, parts):
    if key == 'games/_common/rocket/ships':
        anchor = "// Each ship's name, tier, price and sound from fleet.js's table (D-053), merged into the drawing.\n"
        text = once(text, anchor, parts['ships'] + '\n\n' + anchor, 'ships.js')
        text = once(text, 'export const SHIPS = [classic, box, teapot, pod, saucer, crystal, phoenix, aurora].map(',
                    f"export const SHIPS = [{parts['order'].strip()}].map(", 'ships.js')
        text = once(text, '    default: break;\n  }\n}', parts['particles'] + '\n    default: break;\n  }\n}', 'ships.js drawPart')
    elif key == 'games/_common/rocket/fleet':
        for line in parts['fleet'].split('\n'):
            if not line.strip():
                continue
            after, row = [x.strip() for x in line.split('|', 1)]
            m = re.search(r"^  \{ id: '" + re.escape(after) + r"',[^\n]*\n", text, re.M)
            if not m or text.count(f"{{ id: '{after}',") != 1:
                raise bp.BuildError(f'fleet.js: no single row for {after!r}')
            text = text[:m.end()] + '  ' + row + '\n' + text[m.end():]
    elif key == 'games/_common/rocket/sound':
        anchor = '\n};\n\nexport const SOUND_NAMES'
        before = text.split(anchor)[0]
        if not before.rstrip().endswith(','):
            raise bp.BuildError('sound.js: the last sound before the splice has no comma')
        text = once(text, anchor, '\n' + parts['sounds'] + anchor, 'sound.js')
    return text


SPLICED = {'games/_common/rocket/ships', 'games/_common/rocket/fleet', 'games/_common/rocket/sound'}


def bundle():
    parts = sketch_parts()
    for k in ('ships', 'particles', 'sounds', 'fleet', 'order'):
        if k not in parts:
            raise bp.BuildError(f'{SHIPS_SKETCH}: no "// @part {k}"')
    entry = f'games/{GAME}/page'
    mods, files, todo = {}, {}, [entry]
    while todo:
        key = todo.pop()
        if key in mods:
            continue
        path = os.path.join(HERE, VIRTUAL[key]) if key in VIRTUAL else os.path.join(REPO, key + '.js')
        if not os.path.exists(path):
            raise bp.BuildError(f'{key}.js is imported but does not exist')
        text = bp.read(path)
        if key in SPLICED:
            text = splice(key, text, parts)
        files[key] = path
        mods[key] = bp.parse_module(GAME, key, text)
        todo.extend(dep for dep, _ in mods[key][0])
    order = bp.order_modules(entry, mods)
    out = []
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
        label = os.path.relpath(files[m], REPO) + (f' (with {SHIPS_SKETCH} spliced in, for this page only)' if m in SPLICED else '')
        out.append(f'// ---- {label} ----\nconst {bp.ident(m)} = (() => {{\n{head}{body}{tail}}})();\n')
    used = sorted(os.path.relpath(p, REPO) for p in files.values()) + [f'tools/tests/games/{SHIPS_SKETCH}', FONT_CSS] + bp.css_fonts(GAME, FONT_CSS)
    h = hashlib.sha256()
    for rel in used:
        with open(os.path.join(REPO, rel), 'rb') as f:
            data = f.read()
        h.update(rel.encode() + b'\0' + str(len(data)).encode() + b'\0' + data)
    return ''.join(out), used, h.hexdigest()


CSS = """
:root { --ink:#1B1446; --night:#120C3A; --sun:#FFC93C; --mint:#5FE3BD; --lilac:#EDE8FF; --coral:#FF5D73; color-scheme: dark; }
* { box-sizing:border-box }
html, body { overflow-x:hidden }
body { margin:0; background:var(--night); color:#fff; font:500 17px/1.45 Fredoka, "Segoe UI", system-ui, sans-serif; }
main { max-width:1320px; margin:0 auto; padding:18px 14px 48px; }
h1 { margin:4px 0 6px; font-size:28px; color:var(--sun); line-height:1.2 }
.lead { margin:0 0 10px; color:var(--lilac); max-width:72ch }
h2 { margin:30px 0 4px; font-size:23px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.n { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:50%; background:var(--sun); color:var(--ink); border:3px solid #fff; flex:none; }
.why { margin:0 0 12px; color:var(--lilac); max-width:75ch }
.bar { position:sticky; top:0; z-index:5; display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; padding:10px 12px; margin:10px -4px 4px;
  background:rgba(18,12,58,.94); border:2px solid #3A3290; border-radius:16px; }
.bar .grp { display:flex; flex-wrap:wrap; gap:6px; align-items:center }
.rocksnow { display:inline-block; min-width:10.5em; padding:2px 10px; border-radius:10px; background:#fff; color:var(--ink); font-weight:600; font-size:15px }
button { font:600 15px/1 Fredoka, system-ui, sans-serif; color:var(--ink); background:#fff; border:3px solid var(--ink); border-radius:999px;
  padding:7px 12px; cursor:pointer; box-shadow:0 3px 0 rgba(10,6,40,.6); min-height:36px }
button[aria-pressed="true"] { background:var(--sun) }
button:active { translate:0 2px; box-shadow:0 1px 0 rgba(10,6,40,.6) }
button:focus-visible { outline:3px solid var(--sun); outline-offset:2px }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 330px), 1fr)); gap:14px; align-items:start; }
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
#strip { max-width:844px; border:4px solid var(--ink); border-radius:16px; overflow:hidden; box-shadow:0 0 0 2px rgba(255,255,255,.12); line-height:0 }
canvas.strip { display:block; width:100%; height:auto; background:#0B0724 }
.scale { margin:6px 0 0; font-size:14px; color:#B9B3E6 }
table { border-collapse:collapse; margin:14px 0 0; font-size:15px; min-width:min(100%, 560px) }
caption { text-align:left; color:#B9B3E6; font-size:14px; padding-bottom:6px; caption-side:top }
th, td { padding:5px 10px; border-bottom:1px solid #3A3290; text-align:left; font-weight:500 }
thead th { color:var(--sun); font-weight:600 }
tr.new th { color:#fff; font-weight:600 }
.newtag { display:inline-block; padding:0 7px; border-radius:8px; background:var(--mint); color:var(--ink); font-size:12px }
.tablewrap { overflow-x:auto; max-width:100% }
.sizes { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 10px }
.stagewrap { display:flex; justify-content:center; }
.device { position:relative; border:6px solid #000; border-radius:22px; overflow:hidden; box-shadow:0 0 0 3px #3A3290, 0 10px 30px rgba(0,0,0,.5); background:#000; box-sizing:content-box }
.stage-inner { position:absolute; left:0; top:0; transform-origin:0 0; overflow:hidden; display:grid; place-items:center; background:radial-gradient(ellipse at 50% 20%, #3B2D8F 0%, #1A1250 55%, #0B0724 100%); }
.hangar-room { position:absolute; inset:0; width:100%; height:100%; z-index:40; display:block; }
.hangar-room[hidden] { display:none; }
.opendoor { font-size:26px; padding:16px 28px; background:#B9A7FF; }
.opendoor[hidden] { display:none }
ol.ask { margin:6px 0 0; padding-left:1.4em; max-width:75ch } ol.ask li { margin:6px 0 }
.stamp { margin-top:30px; font-size:13px; color:#B9B3E6; max-width:90ch }
"""


def page(script, commit, src):
    css_font = bp.inline_fonts(GAME, FONT_CSS, bp.read(os.path.join(REPO, FONT_CSS)))
    if '</style' in css_font.lower() or '</script' in script.lower():
        raise bp.BuildError('a closing tag would end the inline style or script')
    return f"""<!DOCTYPE html>
<!-- Mock-ups for step 2d-1, built by tools/tests/games/sketch_rocket_new_ships.py {VERSION} from claude/games at {commit}; sha256 of the files bundled: {src} -->
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket Lander: the five new ships (mock-ups)</title>
<style>
{css_font}</style>
<style>{CSS}</style></head><body><main>
<h1>Rocket Lander: the five new ships</h1>
<p class="lead">Step 2d-1 (D-073 to D-077). Mock-ups that move, drawn by the code they'd have in the game, with the game's own Bip, number line and showroom.
Nothing here is in the game yet. Sound is off until you turn it on in the bar; the pretend moon rocks are for the showroom, and a reload starts afresh.</p>
<div class="bar" id="bar" aria-label="Mock-up controls"></div>

<section aria-labelledby="h-ships"><h2 id="h-ships"><span class="n">1</span> The five ships</h2>
<p class="why"><b>A landing</b> is a right landing in a round, as it plays today: the ship comes down, does its landing joke, Bip pops out and plants the small flag, hops back in, and off it goes.
In play Bip hops out about half a second after touchdown, so the joke is quick there; you see all of it in <b>Bip's moment</b> (the round's last landing) and in the showroom below.
Tap a picture, or <b>Again, with sound</b>, to replay it with its own landing sound. They're drawn larger here than in play.</p>
<div class="grid" id="ships"></div></section>

<section aria-labelledby="h-size"><h2 id="h-size"><span class="n">2</span> At their size in play</h2>
<p class="why">On a phone held sideways a ship is 58.5 px tall. Here are the Classic and the five at that size on the game's line, landing in turn, to check they read when small and stay narrow over the numbers (D-076).
The table measures each drawing: all five are narrower than the Classic, whose legs reach furthest.</p>
<div id="strip"></div><p class="scale" id="scale"></p>
<div class="tablewrap" id="widths"></div></section>

<section aria-labelledby="h-show"><h2 id="h-show"><span class="n">3</span> In the showroom</h2>
<p class="why">The game's own showroom, unchanged, with all thirteen ships, cheapest first in each tier: the five new ones go in among the Fun and Cool ships.
Open the door, then use the arrows, a swipe or the badges; set the pretend rocks in the bar to try buying. A ship you fly shows off with Bip aboard.</p>
<div class="sizes" id="show-sizes" role="group" aria-label="Screen size for the showroom"></div>
<div class="stagewrap" id="show"></div></section>

<section aria-labelledby="h-ask"><h2 id="h-ask"><span class="n">4</span> What I need from you</h2>
<ol class="ask">
<li>Each ship: keep it as drawn, or what to change (bigger, slower, louder, a different joke).</li>
<li>The Splash Tub, now seen end on: narrow enough, and still a bath?</li>
<li>The Christmas Tree: Bip holds the star while flying, so he has it to put on the top. Keep that?</li>
<li>Their places in the showroom, cheapest first in each tier, and the prices (D-077: 25 to 80 rocks). Keep, or change?</li>
</ol></section>

<p class="stamp">Mock-ups, not the game. Built from claude/games at {commit} by tools/tests/games/sketch_rocket_new_ships.py {VERSION}: the five ships are drawn by tools/tests/games/sketch_rocket_new_ships.js {VERSION},
spliced for this page only into copies of games/_common/rocket/ships.js, fleet.js and sound.js; the page is sketch_rocket_new_ships_page.js {VERSION}, with the game's games/_common/rocket/
scene, showroom (hangar.js) and number line as they are. Fredoka is inlined from games/_common/fonts/ (D-043); nothing is fetched. All drawing and sounds are original and made in code.
Checked in headless Chromium, standing in for the phone and PC. With "Less motion" on, or when the device asks for less, there are fewer sparks, one firework, and the washing machine and the sunflower barely turn.</p>
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

        blank_js = """(i) => { const c = [...document.querySelectorAll('canvas')].filter((x) => x.offsetParent)[i];
            const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data, seen = new Set();
            for (let k = 0; k < d.length; k += 4 * 97) seen.add(d[k] + ',' + d[k + 1] + ',' + d[k + 2]);
            return seen.size; }"""
        for w, h, mob in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
            for scheme in ('light', 'dark'):
                ctx, pg, asked, errors = open_page(w, h, mob, scheme)
                n = pg.evaluate('[...document.querySelectorAll("canvas")].filter((x) => x.offsetParent).length')
                blank = []
                for i in range(n):
                    pg.evaluate(f'[...document.querySelectorAll("canvas")].filter((x) => x.offsetParent)[{i}].scrollIntoView({{block: "center"}})')
                    pg.wait_for_timeout(450)
                    if pg.evaluate(blank_js, i) < 12:
                        blank.append(i)
                wide = pg.evaluate('document.documentElement.scrollWidth - window.innerWidth')
                tag = f'{w}x{h} {scheme}'
                fit = pg.evaluate('''(() => { const c = document.querySelector('#strip canvas').getBoundingClientRect(), b = document.querySelector('#strip').getBoundingClientRect();
                    return { w: c.width, box: b.width, ratio: c.width / c.height }; })()''')
                if fit['w'] > fit['box'] + 1 or abs(fit['ratio'] - 844 / 390) > 0.02:
                    fails.append(f'{tag}: the size strip is cropped or squashed: {fit}')
                if errors:
                    fails.append(f'{tag}: {errors[:3]}')
                if asked:
                    fails.append(f'{tag}: fetched {asked[:3]}')
                if wide > 1:
                    fails.append(f'{tag}: sideways scrolling by {wide}px')
                if blank:
                    fails.append(f'{tag}: blank canvases {blank}')
                notes.append(f'{tag}: {n} canvases on show, ' + ('none blank' if not blank else f'blank {blank}') + f'; no script errors: {not errors}; nothing fetched: {not asked}; sideways scroll {max(0, wide)}px')
                if scheme == 'dark':
                    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(300)
                    pg.screenshot(path=os.path.join(shots, f'page-top-{w}x{h}.png'))
                    pg.locator('#strip').scroll_into_view_if_needed(); pg.wait_for_timeout(600)
                    pg.screenshot(path=os.path.join(shots, f'page-strip-{w}x{h}.png'))
                ctx.close()

        ctx, pg, asked, errors = open_page(1280, 800, False, 'dark')
        # narrow where it lands (D-076)
        rows = {r['id']: r for r in pg.evaluate('__mock.widths()')}
        c = rows['classic']
        notes.append(f"Classic: feet {c['feet']:.3f} h, widest {c['wide']:.3f} h, lowest {c['below']:+.3f} h past its feet line")
        for sid in NEW:
            r = rows[sid]
            line = f"{sid}: feet {r['feet']:.3f} h, at its joke {r['jokeFeet']:.3f} h, widest {r['wide']:.3f} h, lowest {r['below']:+.3f} h"
            bad = [k for k, ok in (('feet', r['feet'] <= c['feet']), ('feet at its joke', r['jokeFeet'] <= c['feet']),
                                   ('widest', r['wide'] <= c['wide']), ('below its feet', r['below'] <= max(c['below'], 0.02))) if not ok]
            notes.append(line + (' FAIL ' + ', '.join(bad) if bad else ' ok'))
            if bad:
                fails.append(f'{sid}: wider or lower than the Classic: {bad}')
        # the fleet, the order and the sounds
        fleet = {r['id']: r for r in pg.evaluate('__mock.fleet()')}
        for sid, (name, tier, price) in WANT.items():
            r = fleet.get(sid)
            if not r or (r['name'], r['tier'], r['price']) != (name, tier, price) or not r['flies']:
                fails.append(f'fleet: {sid} is {r}, expected {name}, {tier}, {price}')
        total = sum(r['price'] for r in fleet.values())
        notes.append(f'fleet: {len(fleet)} ships, {total} rocks for all to buy (D-077: 850)')
        if total != 850 or len(fleet) != 13:
            fails.append(f'fleet: {len(fleet)} ships costing {total}, expected 13 and 850')
        order = pg.evaluate('__mock.ships()')
        if order != ORDER or [r for r in fleet] != ORDER:
            fails.append(f'order: ships {order}, fleet {list(fleet)}, expected {ORDER}')
        sounds = pg.evaluate('__mock.sounds()')
        mine = [fleet[s]['sound'] for s in NEW]
        missing = [s for s in mine if s not in sounds]
        if missing or len(set(mine)) != 5 or set(mine) & {fleet[s]['sound'] for s in fleet if s not in NEW}:
            fails.append(f'sounds: {mine}, missing {missing}')
        notes.append(f'sounds: {dict(zip(NEW, mine))}, each its own and made in code')
        pg.evaluate('__mock.playAll()'); pg.wait_for_timeout(1500)
        # the showroom, played by mouse
        state = lambda: pg.evaluate('({ rocks: __mock.wallet.rocks, ships: [...__mock.wallet.ships].sort(), ship: __mock.wallet.ship })')

        def tap(hid):
            pt = pg.evaluate(f"__mock.show.hangar.hitPoint('{hid}')")
            if not pt:
                fails.append(f'showroom: no {hid} to tap')
                return False
            pg.mouse.click(pt['x'], pt['y'])
            return True
        pg.evaluate('__mock.setRocks(120)')
        pg.locator('#show').scroll_into_view_if_needed(); pg.wait_for_timeout(400)
        pg.locator('.opendoor').click(); pg.wait_for_timeout(3200)
        pg.screenshot(path=os.path.join(shots, 'show-open.png'))
        for sid, after in (('tub', {'rocks': 95, 'ships': ['classic', 'tub'], 'ship': 'tub'}), ('tree', {'rocks': 15, 'ships': ['classic', 'tree', 'tub'], 'ship': 'tree'})):
            if tap(f'badge:{sid}'):
                pg.wait_for_timeout(1500)
                pg.locator('#show .device').screenshot(path=os.path.join(shots, f'show-{sid}-locked.png'))
                tap('action'); pg.wait_for_timeout(1300)
                pg.locator('#show .device').screenshot(path=os.path.join(shots, f'show-{sid}-buying.png'))
                pg.wait_for_timeout(4200)
                s = state()
                notes.append(f'showroom: bought the {sid}: {s}')
                if s != after:
                    fails.append(f'showroom: after buying the {sid}, {s}, expected {after}')
                tap('ship'); pg.wait_for_timeout(1200)
                pg.locator('#show .device').screenshot(path=os.path.join(shots, f'show-{sid}-flown.png'))
        for sid in ('jack', 'sunflower', 'spin'):
            tap(f'badge:{sid}'); pg.wait_for_timeout(1700)
            pg.locator('#show .device').screenshot(path=os.path.join(shots, f'show-{sid}.png'))
        before = state()
        tap('badge:jack'); pg.wait_for_timeout(1200); tap('action'); pg.wait_for_timeout(700)
        after = state()
        notes.append(f'showroom: Buy on the Jack-in-the-Box with {before["rocks"]} rocks: {after}')
        if after != before:
            fails.append(f'showroom: a ship it couldn\'t afford changed things: {before} -> {after}')
        for size in ('upright', 'pc'):
            pg.evaluate(f"__mock.show.setSize('{size}')"); pg.wait_for_timeout(1200)
            pg.locator('#show .device').screenshot(path=os.path.join(shots, f'show-{size}.png'))
        pg.evaluate("__mock.show.setSize('sideways')")
        # each new ship drawn large in its poses
        for sid in NEW:
            url = pg.evaluate(f"__mock.closeup('{sid}')")
            with open(os.path.join(shots, f'closeup-{sid}.png'), 'wb') as f:
                f.write(base64.b64decode(url.split(',', 1)[1]))
        # each card held still at its moments
        moments = [('land', 1.6, 'down'), ('land', 3.12, 'touch'), ('land', 3.32, 'joke'), ('land', 3.44, 'joke2'), ('land', 3.75, 'hop'), ('land', 5.0, 'flag'),
                   ('moment', 4.4, 'mjoke'), ('moment', 5.6, 'mdown'), ('moment', 7.2, 'mflag'), ('moment', 8.4, 'mend')]
        for i, sid in enumerate(NEW):
            sel = f'#card-{sid} canvas'
            pg.locator(sel).scroll_into_view_if_needed()
            for mode, T, name in moments:
                pg.evaluate(f"__mock.freeze({i}, '{mode}', {T})")
                pg.locator(sel).screenshot(path=os.path.join(shots, f'card-{sid}-{name}.png'))
            pg.evaluate(f'__mock.thaw({i})')
        pg.locator('#strip').scroll_into_view_if_needed()
        for T in (1.2, 2.6, 5.0):
            pg.evaluate(f'__mock.freezeStrip({T})')
            pg.locator('#strip canvas').screenshot(path=os.path.join(shots, f'strip-{T}.png'))
        pg.evaluate('__mock.thawStrip()')
        # how long each animation takes to draw a frame (headless Chromium, software drawing)
        for sel in ('#card-tub canvas', '#card-tree canvas', '#strip canvas', '#show .device'):
            pg.locator(sel).scroll_into_view_if_needed(); pg.wait_for_timeout(300)
            pg.evaluate('__mock.resetPerf()'); pg.wait_for_timeout(2500)
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
    commit = bp.commit_of('games/_common', *[f'tools/tests/games/{f}' for f in (PAGE, SHIPS_SKETCH)], 'tools/tests/games/sketch_rocket_new_ships.py')
    html = page(script, commit, src)
    far = sorted(set(bp.re.findall(r'https?://[\w.-]+', html)))
    if far:
        raise bp.BuildError(f'outside addresses named in the page: {far[:5]}')
    path = os.path.join(out, 'new-ships.html')
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
