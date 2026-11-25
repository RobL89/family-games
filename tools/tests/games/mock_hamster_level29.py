"""Hamster Highway step 18a (D-224): level 29, Zip over the lake (L15), designed to its floor on a sketch page, drawn by the
real game for Rob's yes or no before anything is built. Version 0.1 (25 Nov). The shape of mock_hamster_step17c_more.py 0.1.

The floor (Rob, 25 Nov, Q-092 (a), proposed until logged): every road at least 5 heights and 7 gadgets, 3 roads home or
more, every road using the zip-line, at least 3 tempting wrong roads. The design below (DESIGN) is Claude's, proposed:
the fair, the helter-skelter on the left with its balcony (the zip-line hooks under it), the boating lake, the swan island,
a channel, the coconut shy, a gap and the big wheel's stage with home on top. 24 wide, not the plan's 28: the game's
widest board is 24 (core.js MAX_COLS, D-158); a wider board is a change to the core, not made here.

Checked with core.js's own run() (the repo's HEAD), each road its gadgets in order (a zip-line as ['zip', hc, hr, lc, lr]):
  - every gadget fits where it goes, in that order, and the tray holds them all; all five hamsters get home; each gadget
    is needed (take any one away: not all five home, or another no longer fits); the zip-line on every road;
  - the floor: rows of 'walk' steps of all five hamsters (D-212's count) at least 5, gadgets at least 7;
  - right roads: at least 3, each its own gadget kinds as the first hamster uses them (solver 1.9's used()); one takes
    the golden seed; at least 3 wrong roads, none getting all five home;
  - no way home with 6 gadgets or fewer (the floor less one, D-227's rule), by solver 1.9's pathSearch() widened to put
    down zip-lines too (every high end near where a hamster goes, with every low end it reaches).
Then a scratch worktree of HEAD, with the fair's look A appended (mock_hamster_fair.js 0.1 and mock_hamster_fair.css 0.1,
step 18a's recommended look, proposed), is drawn by the real game (built with build_preview.py, headless Chromium standing in
for a PC window, 1366 x 650): every road put down by taps through the test hook __test.openBoard(def) (the zip-line by
its two taps, high end then low end), once just after GO with the road marked, once mid-run; the wrong roads shown
mid-run. The scratch copy shows the whole board at once (VIEW 24 across): the real game shows 16 across and slides.

Checks (exit 1 if one fails): those above; every road drawn and its run started; the screenshots all there, none blank;
the game logged no errors; the page names no web address. --fault N plants a fault the checks must catch: 1 a web address
in the page; 2 the balcony without its last block (no hook there); 3 one straw fewer in the tray; 4 home moved onto the
coconut shy (a short cut); 5 a screenshot left out; 6 the spoon's wrong road given its ramp (it gets home); 7 the golden
seed moved off every road.

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_level29.py OUT.html [--fault N]
"""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-level29.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


def board(w, h, blocks, marks):
    """A board's rows from blocks (c0, c1, r0, r1, inclusive) and marks {'S': (c, r), ...}."""
    g = [['.'] * w for _ in range(h)]
    for c0, c1, r0, r1 in blocks:
        for r in range(r0, r1 + 1):
            for c in range(c0, c1 + 1):
                g[r][c] = '#'
    for ch, (c, r) in marks.items():
        g[r][c] = ch
    return [''.join(x) for x in g]


# ---------------------------------------------------------------- the design (Claude's, proposed, 25 Nov)
CORAL, BLUE, GREEN, PURPLE = '#E8594A', '#2F7DD3', '#2E9E5B', '#8A5CD0'
# the start bank (0 to 2); the ticket booth (3 to 5, top row 5); the helter-skelter (6 and 7 top row 4, 8 top row 3) and
# its balcony (6 to 9, row 1); the boating lake (9 to 13); the swan island (14, 15, top row 6); the channel (16); the
# coconut shy (17, 18, top row 3); a gap (19); the big wheel's stage (20 top row 2, 21 to 23 top row 1), home on top
BLOCKS = [(0, 8, 8, 8), (3, 8, 5, 7), (6, 8, 4, 4), (8, 8, 3, 3), (6, 9, 1, 1), (14, 15, 6, 8), (17, 18, 3, 8), (20, 23, 2, 8), (21, 23, 1, 1)]
MARKS = {'S': (0, 7), 'G': (21, 0), '*': (15, 3)}   # home two squares in from the right, clear of the help button
TRAY = {'zip': 1, 'bouncer': 2, 'ramp': 4, 'tube': 6, 'bridge': 2, 'catapult': 1}
UP = [['bouncer', 2, 7], ['ramp', 5, 4], ['ramp', 7, 3], ['zip', 9, 2, 14, 5]]     # up the helter-skelter, the zip-line over the lake
STRAWS = [['tube', 16, 5], ['tube', 16, 4], ['tube', 16, 3], ['tube', 16, 2]]      # out of the channel onto the coconut shy
BOUNCE = [['bouncer', 15, 5], ['bridge', 16, 3]]                                    # or a bounce from the island onto a bridge
STAGE_STRAWS = [['tube', 19, 2], ['tube', 19, 1], ['ramp', 20, 1]]                  # up onto the stage: two straws and a ramp
STAGE_BRIDGE = [['bridge', 19, 3], ['ramp', 19, 2], ['ramp', 20, 1]]                # or a bridge and two ramps
STAGE_SPOON = [['catapult', 18, 2], ['ramp', 20, 1]]                                # or the spoon, onto a ramp
if FAULT == 2:
    BLOCKS = [b if b != (6, 9, 1, 1) else (6, 8, 1, 1) for b in BLOCKS]
if FAULT == 3:
    TRAY = {**TRAY, 'tube': 5}
if FAULT == 4:
    MARKS = {**MARKS, 'G': (18, 2)}
if FAULT == 7:
    MARKS = {**MARKS, '*': (12, 0)}
DESIGN = {
    'def': {'id': 'L15', 'name': 'Zip over the lake', 'room': 'park', 'spot': 'fair', 'back': 'fairA', 'new': 'zip', 'twin': None, 'roads': 4,
            'tray': TRAY, 'rows': board(24, 9, BLOCKS, MARKS)},
    'level': 29, 'floor': (5, 7), 'roadsMin': 3, 'wrongMin': 3, 'search': 6,
    'idea': 'The fair. Up the ticket booth and the helter-skelter, hook the zip-line under its balcony and zip over the boating lake to the swan island; '
            'then out of the channel onto the coconut shy, over the gap and up onto the big wheel\'s stage, home on top. Four roads, every one by the '
            'zip-line: the channel by four straws or a bounce onto a bridge (past the golden seed), the stage by two straws, a bridge and two ramps, or the spoon.',
    'roads': [{'name': 'Road A, straws all the way', 'colour': CORAL, 'placed': UP + STRAWS + STAGE_STRAWS,
               'words': 'a bouncer onto the ticket booth, two ramps up the helter-skelter, hook the zip-line under its balcony and zip over the lake to the swan island, four straws up out of the channel onto the coconut shy, two straws over the gap and a ramp up onto the stage, home'},
              {'name': 'Road B, bounce and bridges', 'colour': BLUE, 'seed': True, 'placed': UP + BOUNCE + STAGE_BRIDGE,
               'words': 'up and over the lake as road A, then a bouncer on the island throws them up past the golden seed onto a bridge over the channel; a bridge over the gap and two ramps up onto the stage, home'},
              {'name': 'Road C, the spoon to the stage', 'colour': GREEN, 'seed': True, 'placed': UP + BOUNCE + STAGE_SPOON,
               'words': 'as road B onto the coconut shy (the seed), then the spoon flings them over the gap: they bump the stage\'s edge and plop onto a ramp, up and home'},
              {'name': 'Road D, straws and the spoon', 'colour': PURPLE, 'placed': UP + STRAWS + STAGE_SPOON,
               'words': 'as road A onto the coconut shy, then the spoon and the ramp as road C'}],
    'wrong': [{'name': 'A bounce up the helter-skelter', 'show': True, 'placed': [['bouncer', 2, 7], ['bouncer', 5, 4]],
               'words': 'a second bouncer at its foot: they boing up, bonk their heads on the balcony and fall back down'},
              {'name': 'The spoon off the island', 'show': True, 'placed': UP + [['catapult', 15, 5]],
               'words': 'flung into the side of the coconut shy, and splash into the channel'},
              {'name': 'A bounce off the island, no bridge', 'show': True, 'placed': UP + [['bouncer', 15, 5]],
               'words': 'up over the channel and straight down into it, splash'},
              {'name': 'The spoon with no ramp', 'show': True, 'placed': UP + BOUNCE + [['catapult', 18, 2]] + ([['ramp', 20, 1]] if FAULT == 6 else []),
               'words': 'flung onto the stage\'s low step, but the top is still a step higher: they sit down for a nap'},
              {'name': 'One straw over the gap', 'placed': UP + BOUNCE + [['tube', 19, 2], ['ramp', 20, 1]],
               'words': 'one straw holds nobody up: splash'}]}

# ---------------------------------------------------------------- the scratch worktree: checks with run(), then the game
WT = '/tmp/hh-level29-wt' + (str(FAULT) if FAULT else '')
SERVE = '/tmp/hh-level29-serve' + (str(FAULT) if FAULT else '')
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
CHECK_JS = r'''
const [coreUrl, designJson] = process.argv.slice(1);
const core = await import(coreUrl);
const D = JSON.parse(designJson);
const level = core.parseLevel(D.def);
const putDown = (list) => {
  const placed = {}; const bad = [];
  for (const g of list) {
    const [k, c, r] = g;
    if (k === 'zip') { if (!core.fitsZip(level, placed, c, r, g[3], g[4])) bad.push(`zip ${c},${r} to ${g[3]},${g[4]}`); Object.assign(placed, core.zipPair(c, r, g[3], g[4])); continue; }
    if (!core.fits(level, placed, k, c, r)) bad.push(`${k} ${c},${r}`);
    placed[core.key(c, r)] = k;
  }
  return { placed, bad };
};
const go = (list) => {
  const { placed, bad } = putDown(list);
  const res = core.run(level, placed);
  const rows = new Set();
  for (const h of res.hamsters) for (const st of h.steps) if (st.act === 'walk') rows.add(st.r);
  return { bad, placed, res, rows: [...rows].sort((a, b) => a - b), outs: res.hamsters.map((h) => h.outcome), home: res.hamsters.filter((h) => h.outcome === 'home').length,
    seed: res.hamsters.some((h) => h.seed) };
};
// solver 1.9's used(): the gadget kinds the first hamster uses
function used(placed) {
  const kinds = new Set();
  for (const st of core.walk(level, placed).steps) {
    const r = Math.round(st.r);
    const here = (placed[core.key(st.c, r)] || '').split(':')[0];
    const under = placed[core.key(st.c, r + 1)];
    if (here && here !== 'peg') kinds.add(here);
    if (under === 'bridge' || under === 'stick' || (st.act === 'climb' && (under === 'ramp' || under === 'rampL'))) kinds.add(under);
  }
  return [...kinds].sort().join('+');
}
// solver 1.9's pathSearch(), widened to put down zip-lines: each high end near the paths, with every low end it reaches
function pathSearch(depth) {
  const kinds = Object.keys(level.tray);
  const seen = new Set();
  const found = [];
  const canon = (p) => Object.entries(p).map(([k, v]) => `${v}@${k}`).sort().join(' ');
  const dfs = (placed, n) => {
    const c = canon(placed);
    if (seen.has(c)) return;
    seen.add(c);
    const res = core.run(level, placed);
    if (res.hamsters.every((h) => h.outcome === 'home')) { found.push({ n, c }); return; }
    if (n >= depth) return;
    const nearSq = new Set();
    for (const h of res.hamsters) for (const st of h.steps) {
      const r0 = Math.round(st.r);
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 2; dr++) nearSq.add(core.key(st.c + dc, r0 + dr));
    }
    const left = core.left(level, placed);
    for (const sq of nearSq) {
      const [cc, rr] = sq.split(',').map(Number);
      for (const k of kinds) {
        if ((left[k] || 0) <= 0) continue;
        if (k === 'zip') {
          if (core.fits(level, placed, 'zip', cc, rr)) for (const [lc, lr] of core.zipLows(level, placed, cc, rr)) dfs({ ...placed, ...core.zipPair(cc, rr, lc, lr) }, n + 1);
          continue;
        }
        if (core.fits(level, placed, k, cc, rr)) dfs({ ...placed, [sq]: k }, n + 1);
      }
    }
  };
  dfs({}, 0);
  return { tried: seen.size, ways: found.length, fewest: found.length ? Math.min(...found.map((f) => f.n)) : null, sample: found.slice(0, 2).map((f) => f.c) };
}
const steps = (h) => h.steps.map((s) => [s.c, s.r]);
const o = { roads: [], wrong: [] };
for (const road of D.roads) {
  const r = go(road.placed);
  const need = road.placed.map((gd, i) => { const x = go(road.placed.filter((_, j) => j !== i)); return x.home < 5 || x.bad.length > 0; });
  o.roads.push({ name: road.name, bad: r.bad, home: r.home, outs: r.outs, rows: r.rows, gadgets: road.placed.length, seed: r.seed, need,
    kinds: used(r.placed), path: steps(r.res.hamsters[0]), ticks: r.res.ticks });
}
for (const w of D.wrong) {
  const r = go(w.placed);
  o.wrong.push({ name: w.name, bad: r.bad, home: r.home, outs: r.outs, ticks: r.res.ticks });
}
o.search = pathSearch(D.search);
console.log(JSON.stringify(o));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, 'file://' + os.path.join(gdir, 'core.js'),
                        json.dumps({k: DESIGN[k] for k in ('def', 'roads', 'wrong', 'search')})], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    RES = json.loads(r.stdout)
    # the scratch art.js and style.css: the fair's look A (step 18a's mock-ups, recommended, proposed) appended
    art = os.path.join(gdir, 'art.js')
    src = open(art).read()
    for old, new in [
        ("export function backdrop(name, w = W) {\n",
         "export function backdrop(name, w = W) {\n  if (name.startsWith('fair')) return g({ fairA, fairB, fairC }[name](w), '', ` data-back=\"${name}\"`);\n"),
        ("export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' ? 540 : H);",
         "export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' || name.startsWith('fair') ? 540 : H);"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    open(art, 'w').write(src + '\n' + open(os.path.join(HERE, 'mock_hamster_fair.js')).read() + '\n')
    open(os.path.join(gdir, 'style.css'), 'a').write('\n' + open(os.path.join(HERE, 'mock_hamster_fair.css')).read())
    # the scratch copy: the whole board in view
    gj = os.path.join(gdir, 'game.js')
    src = open(gj).read()
    old = 'const VIEW = { 7: 12, 8: 14, 9: 16 };'
    assert src.count(old) == 1
    open(gj, 'w').write(src.replace(old, 'const VIEW = { 7: 24, 8: 24, 9: 24 };'))
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)

# ---------------------------------------------------------------- the checks with run()
D, o = DESIGN, RES
fl = D['floor']
for rd, R in zip(D['roads'], o['roads']):
    tag = f"level 29 {R['name']}"
    check(not R['bad'], f'{tag}: every gadget fits, in order' + (f" (not: {R['bad']})" if R['bad'] else ''))
    over = {k: n for k, n in ((k, sum(1 for g in rd['placed'] if g[0] == k)) for k in {g[0] for g in rd['placed']}) if n > D['def']['tray'].get(k, 0)}
    check(not over, f'{tag}: the tray holds every gadget' + (f' (short: {over})' if over else ''))
    check(R['home'] == 5, f"{tag}: all five home ({' '.join(R['outs'])})")
    check(len(R['rows']) >= fl[0] and R['gadgets'] >= fl[1], f"{tag}: the floor, {len(R['rows'])} heights {R['rows']} (at least {fl[0]}) and {R['gadgets']} gadgets (at least {fl[1]})")
    check(all(R['need']), f'{tag}: every gadget needed (take one away: not all five home)')
    check('zip' in R['kinds'].split('+'), f"{tag}: the zip-line used ({R['kinds']})")
    if rd.get('seed'):
        check(R['seed'], f'{tag}: takes the golden seed')
ks = {R['kinds'] for R in o['roads']}
check(len(o['roads']) >= D['roadsMin'] and len(ks) == len(o['roads']), f"level 29: {len(o['roads'])} right roads (at least {D['roadsMin']}), each its own gadget kinds {sorted(ks)}")
check(any(R['seed'] for R in o['roads']), 'level 29: one road takes the seed')
s = o['search']
check(s['fewest'] is None, f"level 29: no way home with {D['search']} gadgets or fewer, along the paths ({s['tried']:,} placements tried; found {s['ways']} {s['sample']})")
check(len(D['wrong']) >= D['wrongMin'], f"level 29: {len(D['wrong'])} wrong roads (at least {D['wrongMin']})")
for w, W in zip(D['wrong'], o['wrong']):
    check(not W['bad'] and W['home'] < 5, f"level 29 wrong road '{W['name']}': {W['home']} of 5 home ({' '.join(W['outs'])})" + (f" (not placed: {W['bad']})" if W['bad'] else ''))


# ---------------------------------------------------------------- the screenshots, in the real game
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
SHOTS = {}
errors = []
SVGNS = 'http' + '://www.w3.org/2000/svg'   # split so this file's own text check stays simple; never on the page


def overlay(R, colour, placed):
    """The road marked over the board: hamster 1's path, and each gadget numbered (a zip-line at its high end, its low end ringed)."""
    pts = lambda p: ' '.join(f'{(c + 0.5) * 60:.0f},{(r + 0.5) * 60:.0f}' for c, r in p)   # noqa: E731
    s = f'<polyline points="{pts(R["path"])}" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>'
    s += f'<polyline points="{pts(R["path"])}" fill="none" stroke="{colour}" stroke-width="9" stroke-dasharray="18 10" stroke-linejoin="round" stroke-linecap="round"/>'
    for i, g in enumerate(placed):
        k, c, r = g[:3]
        x, y = c * 60, r * 60
        s += f'<rect x="{x + 3}" y="{y + 3}" width="54" height="54" rx="10" fill="none" stroke="{colour}" stroke-width="5"/>'
        if k == 'zip':
            s += f'<rect x="{g[3] * 60 + 3}" y="{g[4] * 60 + 3}" width="54" height="54" rx="27" fill="none" stroke="{colour}" stroke-width="5" stroke-dasharray="8 6"/>'
        s += f'<circle cx="{x + 10}" cy="{y + 10}" r="13" fill="{colour}" stroke="#fff" stroke-width="3"/><text x="{x + 10}" y="{y + 15}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">{i + 1}</text>'
    return s


DRAW_JS = """(d) => { const w = document.getElementById('world'); let g = document.getElementById('mockroad');
  if (!g) { g = document.createElementNS(d.ns, 'g'); g.id = 'mockroad'; w.insertBefore(g, document.getElementById('walkers')); }
  g.innerHTML = d.svg; }"""


def tap(pg, sel):
    b = pg.locator(sel).first.bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def cell(pg, c, r):
    p = pg.evaluate(f'__test.cellPoint({c}, {r})')
    pg.mouse.click(p['x'], p['y'])


def place(pg, g):
    kind = g[0]
    if pg.evaluate('__test.state().selected') != kind:
        tap(pg, f'[data-slot="{kind}"]')
    cell(pg, g[1], g[2])
    if kind == 'zip':   # the second tap: the low end
        cell(pg, g[3], g[4])


def open_board(pg, d):
    pg.evaluate('(d) => __test.openBoard(d)', d)
    pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
    pg.wait_for_timeout(300)
    if pg.evaluate('__test.state().card'):
        tap(pg, '#card [data-btn="cardok"]')
        pg.wait_for_function('__test.state().card === null')


def play(pg, d, placed, tag, ticks, mark=None):
    """Put the road down by taps, press GO, mark it (if asked) just after, and shoot it mid-run; then stop."""
    open_board(pg, d)
    for g in placed:
        place(pg, g)
    squares = sum(2 if g[0] == 'zip' else 1 for g in placed)
    ok = pg.evaluate('Object.keys(__test.state().placed).length') == squares
    check(ok, f"{tag}: all {len(placed)} gadgets put down by taps" + ('' if ok else f" (down: {pg.evaluate('__test.state().placed')})"))
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(500)
    if mark:
        pg.evaluate(DRAW_JS, {'ns': SVGNS, 'svg': mark})
        SHOTS[tag + ' marked'] = pg.screenshot(type='jpeg', quality=82)
        pg.evaluate("() => { const g = document.getElementById('mockroad'); if (g) g.remove(); }")
    pg.wait_for_timeout(int(ticks * 200 * 0.45))
    check(pg.evaluate('__test.state().mode') != 'build', f'{tag}: the run started')
    SHOTS[tag + ' run'] = pg.screenshot(type='jpeg', quality=82)
    tap(pg, '[data-btn="stop"]')   # stop the run, so it can't end on the next board
    pg.wait_for_function('__test.state().mode === "build"', timeout=5000)


from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width': 1366, 'height': 650}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
    open_board(pg, D['def'])
    SHOTS['empty'] = pg.screenshot(type='jpeg', quality=82)
    for rd, R in zip(D['roads'], o['roads']):
        play(pg, D['def'], rd['placed'], rd['name'], R['ticks'], overlay(R, rd['colour'], rd['placed']))
    for w, W in zip(D['wrong'], o['wrong']):
        if w.get('show'):
            play(pg, D['def'], w['placed'], w['name'], W['ticks'])
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 5:
    del SHOTS[next(iter(SHOTS))]
want = 1 + 2 * len(D['roads']) + sum(1 for w in D['wrong'] if w.get('show'))
check(len(SHOTS) == want and all(len(v) > 15000 for v in SHOTS.values()), f'{want} screenshots, none blank ({len(SHOTS)})')


# ---------------------------------------------------------------- the page
def img(b, alt, cls='shot'):
    if b is None:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(b).decode()}" alt="{alt}" class="{cls}">'


INK = '#1B1446'
NAMES = {'ramp': 'ramp', 'bouncer': 'bouncer', 'bridge': 'bridge', 'tube': 'straw (tube)', 'catapult': 'spoon', 'zip': 'zip-line'}
PLURAL = {'straw (tube)': 'straws (tubes)'}


def tray(t):
    return ', '.join(f"{n} {PLURAL.get(NAMES[k], NAMES[k] + 's') if n > 1 else NAMES[k]}" for k, n in t.items())


def gadlist(placed):
    return ' · '.join(f'{i + 1} {NAMES[g[0]]}' for i, g in enumerate(placed))


d = D['def']
h = f'<p class="meta">{len(d["rows"][0])} × {len(d["rows"])} · tray: {tray(d["tray"])} ({sum(d["tray"].values())}) · the first of the fair\'s pair: it brings in the zip-line (its card first).</p>'
h += f'<p>{D["idea"]}</p><figure>{img(SHOTS.get("empty"), "the empty board")}<figcaption>the board as the child first sees it (here the whole of it; in the game 16 squares across, sliding)</figcaption></figure>'
h += '<table><tr><th>Road</th><th>Heights walked</th><th>Gadgets</th><th>Seed</th></tr>'
for rd, R in zip(D['roads'], o['roads']):
    h += f'<tr><td><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</td><td>{len(R["rows"])} (at least {fl[0]})</td><td>{R["gadgets"]} (at least {fl[1]})</td><td>{"yes" if R["seed"] else ""}</td></tr>'
h += '</table>'
for rd, R in zip(D['roads'], o['roads']):
    h += f'<h3><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</h3><p>{rd["words"][0].upper() + rd["words"][1:]}.</p><p class="gl">{gadlist(rd["placed"])}</p>'
    h += f'<div class="row"><figure>{img(SHOTS.get(rd["name"] + " marked"), rd["name"] + ", marked")}<figcaption>just after GO, the road marked (the zip-line\'s low end ringed)</figcaption></figure>' \
         + f'<figure>{img(SHOTS.get(rd["name"] + " run"), rd["name"] + ", mid-run")}<figcaption>mid-run</figcaption></figure></div>'
h += '<h3>Wrong roads</h3><ul>'
for w, W in zip(D['wrong'], o['wrong']):
    h += f'<li><b>{w["name"]}:</b> {w["words"]} ({W["home"]} of 5 home).</li>'
h += '</ul><div class="row">' + ''.join(f'<figure>{img(SHOTS.get(w["name"] + " run"), w["name"])}<figcaption>{w["name"]}, mid-run</figcaption></figure>'
                                         for w in D['wrong'] if w.get('show')) + '</div>'
s = o['search']
h += (f'<p class="chk">Checked with the game\'s own rules: every road gets all five home, every gadget on it is needed, each uses the zip-line, '
      f'and each wrong road fails; no way home with {D["search"]} gadgets or fewer ({s["tried"]:,} placements tried along the hamsters\' paths, zip-lines too).</p>')

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: level 29, Zip over the lake</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1340px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:20px;margin:30px 0 4px;padding-top:10px;border-top:3px solid {INK}22}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:12px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:10px}} img.shot{{width:640px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle}}
.meta,.gl,.chk,.stamp{{font-size:14px}} .chk{{color:#2E6B3A}} .stamp{{color:#666}} .miss{{color:#c00}}
@media (prefers-color-scheme: dark){{body{{background:#17132E;color:#F3EEFF}} figure,table{{background:#231D45;border-color:#ffffff22}} .chk{{color:#8FD49C}} .stamp{{color:#BBB}}}}
</style></head><body>
<h1>Hamster Highway: level 29, Zip over the lake</h1>
<p class="stamp">mock_hamster_level29.py 0.1 · 25 Nov · step 18a · drawn by the real game with each road put down by taps, in front of the fair's look A (from the mock-ups page, recommended, not yet picked); nothing is built yet. The whole board is shown at once here; in the game the window shows 16 squares across and slides. Headless Chromium stands in for a PC window.</p>
<p><b>The floor you picked:</b> every road at least 5 heights and 7 gadgets, 3 roads or more, every road by the zip-line, at least 3 tempting wrong roads. <b>One change from the plan:</b> it is 24 squares wide, not 28, because the game's widest board is 24; making it wider would be a change to the game's rules, which I haven't made.</p>
<h2>Level 29: {d["name"]}</h2>{h}
<section><h2>What I'd like from you</h2><p>A yes or no for level 29 (or what to change). With a yes, level 30 (the finale, step 18b) is next.</p></section>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
