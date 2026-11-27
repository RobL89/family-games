"""Hamster Highway step 18b (i) (D-224): level 30, Confetti party (L15b), the finale at the fair, designed to its floor on a
sketch page drawn by the real game for Rob's yes or no before anything is built; with mock-ups of the lantern gate and the
confetti poppers. Version 0.2 (27 Nov). The shape of mock_hamster_level29.py 0.1.

Changes at v0.2: a new design. Rob on v0.1 (27 Nov): "You have a large mass of blocks on the right side making it a linear
climb up. Very little puzzle solving needed." No staircase: open, separate fair things; a loop out and back (right along the
bottom, up the teacup ride, right along the top to the button, back left by the zip-line); one spoon wanted in two places;
the right hook only reached after the button, a wrong hook before it; Pudding's own wrong road at the coconut shy; checks
that every road rides the teacups. Faults 2 to 7 re-aimed at the new design.

The floor (D-238): every road at least 6 heights and 8 gadgets, 3 roads home or more, at least 4 tempting wrong roads; all
five new things (D-239): the zip-line on every road, the spoon, the signpost, the button as the lantern gate (D-240) and
Pudding in the line; the tray at most 7 kinds. The design below (DESIGN) is Claude's, proposed: the fair, second stop, with
the teacup ride (a lift, a level part since step 4) as the way up; the layout is drawn in the comment above DESIGN. 24 x 9
(D-236).

Checked with core.js's own run() (the repo's HEAD), each road its gadgets in order (a zip-line as ['zip', hc, hr, lc, lr]):
  - every gadget fits where it goes, in that order, and the tray holds them all; all five hamsters get home, Pudding too;
    each gadget is needed (take any one away: not all five home, or another no longer fits); the zip-line, the signpost
    and the button on every road (the button pressed before anyone reaches the drawbridge); the teacups ridden;
  - the floor: rows of 'walk' steps of all five hamsters (D-212's count) at least 6, gadgets at least 8;
  - right roads: at least 3, each its own gadget kinds as the first hamster uses them (solver 1.10's used()); one takes
    the golden seed; the spoon on one road or more; at least 4 wrong roads, none getting all five home, one of them
    Pudding's alone (four home, Pudding not);
  - no way home with SEARCH gadgets or fewer (--search, default 5), by solver 1.10's pathSearch() with zip-lines (as level
    29's script); D-238 asked for 6: Q-096.
Then a scratch worktree of HEAD (the fair's look A is in the game since 18a (ii)), with mock_hamster_finale.js 0.1 appended
to art.js and mock_hamster_finale.css 0.1 to style.css, is drawn by the real game (built with build_preview.py, headless
Chromium standing in for a PC window, 1366 x 650): every road put down by taps through the test hook __test.openBoard(def)
(the zip-line by its two taps, high end then low end), once just after GO with the road marked, once mid-run; the wrong
roads shown mid-run; each gate look laid over the button's drawing, before GO (the bridge up, the lanterns dark) and once
the button is pressed (lit, the bridge down); each popper look laid over the party, three frames. The scratch copy shows
the whole board at once (VIEW 24 across): the real game shows 16 across and slides.

Checks (exit 1 if one fails): those above; every road drawn and its run started; the button pressed and the lanterns lit in
each gate look; the poppers drawn in each popper look; the screenshots all there, none blank; the game logged no errors;
the page names no web address. --fault N plants a fault the checks must catch: 1 a web address in the page; 2 the lid one
square short (the drawbridge doesn't reach); 3 one straw fewer in the tray; 4 home moved onto the coconut shy (a short
cut); 5 a screenshot left out; 6 the 'hooked under the lantern' wrong road hooked in the right place (it gets home); 7 the
golden seed moved off every road.

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_level30.py OUT.html [--fault N] [--search N]
"""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
SEARCH = 5
for flag in ('--fault', '--search'):
    if flag in args:
        i = args.index(flag)
        if flag == '--fault':
            FAULT = int(args[i + 1])
        else:
            SEARCH = int(args[i + 1])
        del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-level30.html'
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


# ---------------------------------------------------------------- the design (Claude's, proposed, 27 Nov; v0.2 after Rob's "needs more work")
CORAL, BLUE, GREEN, PURPLE = '#E8594A', '#2F7DD3', '#2E9E5B', '#8A5CD0'
# The boating lake (0 to 5, open to the bottom), with the confetti stage (0 and 1, row 5, home on it) and the jetty (4 to 7,
# row 5) floating over it and the lantern drawbridge's gap between them (2 and 3, row 5: the lid); the stage's canopy (0, 1,
# rows 2 and 3) and the lantern arch over the drawbridge (2 to 5, row 2): it stops the spoon flinging them over the
# drawbridge from the jetty (a short cut past the button, found by the search on a first try). The start's patch (6), a ditch (7), the midway (8, 9); the coconut shy (10, 11, top row 6);
# the teacup ride (a lift, 12, from the shy's top up to the top walk); the top walk (13, 14 and 17, 18, row 2; a gap at 15,
# 16) with a lantern hanging over its start (14, row 0); under its far part the lower walk (17 to 19, row 4; a gap at 20;
# 21), and the button's stand (22, 23, top row 3). Every hook for the zip-line is a block's underside: the right one is the
# top walk over the lower walk, reached only after the button.
BLOCKS = [(6, 6, 8, 8), (8, 9, 8, 8), (13, 23, 8, 8), (10, 11, 6, 8), (12, 12, 7, 8),
          (0, 1, 5, 5), (4, 7, 5, 5), (0, 1, 2, 3), (2, 5, 2, 2),
          (13, 14, 2, 2), (17, 18, 2, 2), (14, 14, 0, 0),
          (17, 19, 4, 4), (21, 21, 4, 4), (22, 23, 3, 4)]
MARKS = {'S': (6, 7), 'G': (0, 4), '*': (17, 0)}   # the seed over the top walk's gap, on the spoon's arc
LID = [[2, 5], [3, 5]]
TRAY = {'zip': 1, 'catapult': 1, 'signpost': 1, 'ramp': 1, 'bridge': 2, 'tube': 5, 'bouncer': 1}
PUDDING = 2   # third in the line
if FAULT == 2:
    LID = [[3, 5]]
if FAULT == 3:
    TRAY = {**TRAY, 'tube': 4}
if FAULT == 4:
    MARKS = {**MARKS, 'G': (11, 5)}
if FAULT == 7:
    MARKS = {**MARKS, '*': (20, 0)}
DITCH = [['tube', 7, 8]]                                                # a straw lying in the ditch
SHY_SPOON = [['catapult', 8, 7]]                                        # the spoon bumps them up onto the coconut shy
SHY_STRAWS = [['tube', 9, 7], ['tube', 9, 6], ['tube', 9, 5]]           # or three straws
GAP_BRIDGES = [['bridge', 15, 2], ['bridge', 16, 2]]                    # over the top walk's gap on two bridges
GAP_SPOON = [['catapult', 14, 1]]                                       # or flung over it by the spoon, through the seed
FAR = [['tube', 20, 4]]                                                 # a straw across the lower walk's gap
END = [['ramp', 21, 3], ['signpost', 23, 2], ['zip', 17, 3, 7, 4]]      # a ramp onto the stand, past the button a signpost; the zip-line back left
DESIGN = {
    'def': {'id': 'L15b', 'name': 'Confetti party', 'room': 'park', 'spot': 'fair2', 'back': 'fairA', 'new': None, 'twin': 'L15', 'roads': 3, 'pudding': PUDDING,
            'tray': TRAY, 'parts': [{'kind': 'lift', 'c': 12, 'top': 2, 'bottom': 6, 'cups': 2}, {'kind': 'button', 'c': 22, 'r': 2, 'lid': LID}],
            'rows': board(24, 9, BLOCKS, MARKS)},
    'level': 30, 'floor': (6, 8), 'roadsMin': 3, 'wrongMin': 4, 'search': SEARCH,
    'idea': 'The fair, at the end of the day. Home is the confetti stage, just over the boating lake from the start, but its lantern drawbridge is up: its '
            'button is at the far side of the fair, at the top. So: over the ditch, up onto the coconut shy, ride the teacups up to the top walk, over its gap, '
            'drop onto the lower walk, over its gap and up the ramp onto the button\'s stand; a signpost past the button turns them back, and from under the top '
            'walk they zip-line back left over the whole fair to the jetty; the drawbridge is down now, home. Pudding is third in the line: a marshmallow squashes '
            'under it. One spoon, wanted in two places (up the shy, or over the gap), so the child has to choose.',
    'roads': [{'name': 'Road A, the spoon up the shy', 'colour': CORAL, 'placed': DITCH + SHY_SPOON + GAP_BRIDGES + FAR + END,
               'words': 'a straw in the ditch; the spoon bumps them up onto the coconut shy; the teacups take them up; two bridges over the gap in the top walk; '
                        'drop to the lower walk, a straw over its gap, the ramp onto the stand, press the button, the signpost turns them; back along under the '
                        'top walk, grab the zip-line, zip over the fair to the jetty, over the drawbridge, home'},
              {'name': 'Road B, the spoon over the gap', 'colour': BLUE, 'seed': True, 'placed': DITCH + SHY_STRAWS + GAP_SPOON + FAR + END,
               'words': 'three straws up onto the coconut shy, so the spoon is free for the top walk: it flings them over the gap, through the golden seed; then as road A'},
              {'name': 'Road C, straws and bridges', 'colour': GREEN, 'placed': DITCH + SHY_STRAWS + GAP_BRIDGES + FAR + END,
               'words': 'no spoon at all: three straws up the shy and two bridges over the gap; then as road A'}],
    'wrong': [{'name': 'A marshmallow up the shy', 'show': True, 'pudding': True, 'placed': DITCH + [['bouncer', 9, 7]] + GAP_BRIDGES + FAR + END,
               'words': 'one marshmallow in place of three straws: the Nibbles boing up onto the shy, but Pudding squashes it flat and sits at the bottom'},
              {'name': 'Hooked under the lantern', 'show': True,
               'placed': DITCH + SHY_STRAWS + GAP_BRIDGES + FAR + [['ramp', 21, 3], ['signpost', 23, 2], ['zip', 17, 3, 7, 4] if FAULT == 6 else ['zip', 14, 1, 4, 4]],
               'words': 'they grab the reel as soon as they step off the teacups, before anyone has pressed the button: the drawbridge is still up, splash'},
              {'name': 'The signpost too soon', 'show': True, 'placed': DITCH + SHY_STRAWS + GAP_SPOON + FAR + [['ramp', 21, 3], ['signpost', 19, 3], ['zip', 17, 3, 7, 4]],
               'words': 'it turns them before they reach the button: they zip back with the drawbridge still up, splash'},
              {'name': 'The spoon over the far gap', 'show': True, 'placed': DITCH + SHY_STRAWS + GAP_BRIDGES + [['catapult', 19, 3]] + END,
               'words': 'it flings them over on the way out, but a spoon only throws one way: coming back they fall in'},
              {'name': 'One bridge over the gap', 'placed': DITCH + SHY_STRAWS + GAP_BRIDGES[:1] + FAR + END,
               'words': 'one bridge short: they fall through the top walk'}]}

# ---------------------------------------------------------------- the scratch worktree: checks with run(), then the game
WT = '/tmp/hh-level30-wt' + (str(FAULT) if FAULT else '')
SERVE = '/tmp/hh-level30-serve' + (str(FAULT) if FAULT else '')
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
const lid = new Set(level.parts.filter((p) => p.kind === 'button').flatMap((p) => p.lid.map(([c, r]) => core.key(c, r - 1))));   // the squares over the drawbridge
const go = (list) => {
  const { placed, bad } = putDown(list);
  const res = core.run(level, placed);
  const rows = new Set();
  for (const h of res.hamsters) for (const st of h.steps) if (st.act === 'walk') rows.add(st.r);
  const press = res.events.find((e) => e.kind === 'press');
  let over = null;   // the first tick anyone stands over the drawbridge
  for (const h of res.hamsters) for (const st of h.steps) if (lid.has(core.key(st.c, Math.round(st.r))) && (over === null || st.t0 < over)) over = st.t0;
  return { bad, placed, res, rows: [...rows].sort((a, b) => a - b), outs: res.hamsters.map((h) => h.outcome), home: res.hamsters.filter((h) => h.outcome === 'home').length,
    seed: res.hamsters.some((h) => h.seed), press: press ? press.t : null, over, pudding: level.pudding === null ? null : res.hamsters[level.pudding].outcome,
    rode: res.hamsters.every((h) => h.steps.some((st) => st.act === 'ride')) };
};
// solver 1.10's used(): the gadget kinds the first hamster uses
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
// solver 1.10's pathSearch(), with zip-lines: each high end near the paths, with every low end it reaches
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
  o.roads.push({ name: road.name, bad: r.bad, home: r.home, outs: r.outs, rows: r.rows, gadgets: road.placed.length, seed: r.seed, need, press: r.press, over: r.over, rode: r.rode,
    kinds: used(r.placed), path: steps(r.res.hamsters[0]), ticks: r.res.ticks });
}
for (const w of D.wrong) {
  const r = go(w.placed);
  o.wrong.push({ name: w.name, bad: r.bad, home: r.home, outs: r.outs, ticks: r.res.ticks, pudding: r.pudding,
    pend: level.pudding === null ? null : r.res.hamsters[level.pudding].end });
}
const t0 = Date.now();
o.search = pathSearch(D.search);
o.search.secs = Math.round((Date.now() - t0) / 1000);
console.log(JSON.stringify(o));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    r = subprocess.run(['node', '--max-old-space-size=6000', '--input-type=module', '-e', CHECK_JS, 'file://' + os.path.join(gdir, 'core.js'),
                        json.dumps({k: DESIGN[k] for k in ('def', 'roads', 'wrong', 'search')})], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    RES = json.loads(r.stdout)
    # the scratch art.js, style.css and game.js: the gate and popper looks appended, and a hook to lay them over the game
    art = os.path.join(gdir, 'art.js')
    open(art, 'a').write('\n' + open(os.path.join(HERE, 'mock_hamster_finale.js')).read() + '\n')
    open(os.path.join(gdir, 'style.css'), 'a').write('\n' + open(os.path.join(HERE, 'mock_hamster_finale.css')).read())
    gj = os.path.join(gdir, 'game.js')
    src = open(gj).read()
    for old, new in [('const VIEW = { 7: 12, 8: 14, 9: 16 };', 'const VIEW = { 7: 24, 8: 24, 9: 24 };'),
                     ('ZIP_SAG, kickFeet, partyCarousel } from \'./art.js\';', 'ZIP_SAG, kickFeet, partyCarousel, gateLook, popperLook } from \'./art.js\';'),
                     ('window.__test = {', 'window.__mock = { gateLook, popperLook };\nwindow.__test = {')]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    open(gj, 'w').write(src)
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
    tag = f"level 30 {R['name']}"
    check(not R['bad'], f'{tag}: every gadget fits, in order' + (f" (not: {R['bad']})" if R['bad'] else ''))
    over = {k: n for k, n in ((k, sum(1 for g in rd['placed'] if g[0] == k)) for k in {g[0] for g in rd['placed']}) if n > D['def']['tray'].get(k, 0)}
    check(not over, f'{tag}: the tray holds every gadget' + (f' (short: {over})' if over else ''))
    check(R['home'] == 5, f"{tag}: all five home, Pudding too ({' '.join(R['outs'])})")
    check(len(R['rows']) >= fl[0] and R['gadgets'] >= fl[1], f"{tag}: the floor, {len(R['rows'])} heights {R['rows']} (at least {fl[0]}) and {R['gadgets']} gadgets (at least {fl[1]})")
    check(all(R['need']), f'{tag}: every gadget needed (take one away: not all five home)')
    ks = R['kinds'].split('+')
    check('zip' in ks and 'signpost' in ks, f"{tag}: the zip-line and the signpost used ({R['kinds']})")
    check(R['press'] is not None and R['over'] is not None and R['press'] < R['over'], f"{tag}: the button pressed (tick {R['press']}) before anyone reaches the drawbridge (tick {R['over']})")
    check(R['rode'], f'{tag}: all five ride the teacups')
    if rd.get('seed'):
        check(R['seed'], f'{tag}: takes the golden seed')
ks = {R['kinds'] for R in o['roads']}
check(len(o['roads']) >= D['roadsMin'] and len(ks) == len(o['roads']), f"level 30: {len(o['roads'])} right roads (at least {D['roadsMin']}), each its own gadget kinds {sorted(ks)}")
check(any(R['seed'] for R in o['roads']), 'level 30: one road takes the seed')
check(any('catapult' in R['kinds'].split('+') for R in o['roads']), 'level 30: the spoon on a road')
check(len(D['def']['tray']) <= 7, f"level 30: the tray {len(D['def']['tray'])} kinds (at most 7, D-239)")
s = o['search']
check(s['fewest'] is None, f"level 30: no way home with {D['search']} gadgets or fewer, along the paths ({s['tried']:,} placements tried in {s['secs']} s; found {s['ways']} {s['sample']})")
check(len(D['wrong']) >= D['wrongMin'], f"level 30: {len(D['wrong'])} wrong roads (at least {D['wrongMin']})")
for w, W in zip(D['wrong'], o['wrong']):
    check(not W['bad'] and W['home'] < 5, f"level 30 wrong road '{W['name']}': {W['home']} of 5 home ({' '.join(W['outs'])})" + (f" (not placed: {W['bad']})" if W['bad'] else ''))
    if w.get('pudding'):
        check(W['home'] == 4 and W['pudding'] != 'home', f"level 30 wrong road '{W['name']}': Pudding's alone (Pudding {W['pudding']})")


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
LOOKS = {'G1': 'Lantern posts', 'G2': 'A string of lanterns'}
POPS = {'C1': 'Two big poppers', 'C2': 'A wave of five'}
LOOKCHK = {}


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
# lay a gate look over the button's drawing (the lid inside its turning group, the rest in the button's group)
GATE_JS = """(d) => { const b = document.querySelector('[data-button="0"]'); if (!b) return false;
  if (b.dataset.look === d.look) return true;
  const lid = b.querySelector('[data-lid="0"]'); const look = window.__mock.gateLook(d.look, d.at);
  lid.innerHTML = look.lid; b.insertAdjacentHTML('beforeend', look.fixed); b.dataset.look = d.look; return true; }"""
POP_JS = """(look) => { const c = document.querySelector('[data-party="carousel"]'); if (!c) return 0;
  c.parentNode.insertAdjacentHTML('beforeend', window.__mock.popperLook(look));
  return document.querySelectorAll('[data-poppers] [data-popper]').length; }"""


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


def put(pg, d, placed, tag):
    open_board(pg, d)
    for g in placed:
        place(pg, g)
    squares = sum(2 if g[0] == 'zip' else 1 for g in placed)
    ok = pg.evaluate('Object.keys(__test.state().placed).length') == squares
    check(ok, f"{tag}: all {len(placed)} gadgets put down by taps" + ('' if ok else f" (down: {pg.evaluate('__test.state().placed')})"))


def play(pg, d, placed, tag, ticks, mark=None, at=None):
    """Put the road down by taps, press GO, mark it (if asked) just after, and shoot it mid-run (or at tick at); then stop."""
    put(pg, d, placed, tag)
    pg.evaluate('__test.speed(1)')
    tap(pg, '[data-btn="go"]')
    pg.wait_for_timeout(500)
    if mark:
        pg.evaluate(DRAW_JS, {'ns': SVGNS, 'svg': mark})
        SHOTS[tag + ' marked'] = pg.screenshot(type='jpeg', quality=82)
        pg.evaluate("() => { const g = document.getElementById('mockroad'); if (g) g.remove(); }")
    pg.wait_for_timeout(int(ticks * 200 * 0.45) if at is None else max(0, at * 200 - 500))
    check(pg.evaluate('__test.state().mode') != 'build', f'{tag}: the run started')
    SHOTS[tag + ' run'] = pg.screenshot(type='jpeg', quality=82)
    tap(pg, '[data-btn="stop"]')   # stop the run, so it can't end on the next board
    pg.wait_for_function('__test.state().mode === "build"', timeout=5000)


def clip(pg, c0, r0, c1, r1):
    a = pg.evaluate(f'__test.cellPoint({c0}, {r0})')
    b = pg.evaluate(f'__test.cellPoint({c1}, {r1})')
    half = (b['x'] - a['x']) / (c1 - c0) / 2
    return {'x': a['x'] - half, 'y': max(0, a['y'] - half), 'width': b['x'] - a['x'] + 2 * half, 'height': b['y'] - a['y'] + 2 * half}


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
            # Pudding's wrong road: shot just after Pudding sits down (a stuck hamster fades after 2.6 s, game.js)
            play(pg, D['def'], w['placed'], w['name'], W['ticks'], at=W['pend'] + 3 if w.get('pudding') else None)
    ctx.close()
    # the looks, closer up (2x): the gate before GO and once pressed; the poppers at the party, three frames
    ctx = br.new_context(viewport={'width': 1366, 'height': 650}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
    p0 = next(p for p in D['def']['parts'] if p['kind'] == 'button')
    hinge = sorted(p0['lid'])[0]
    at = {'bx': p0['c'] * 60, 'by': (p0['r'] + 1) * 60, 'hx': hinge[0] * 60, 'hy': hinge[1] * 60, 'n': len(p0['lid'])}
    road = D['roads'][1]
    for look, name in LOOKS.items():
        put(pg, D['def'], road['placed'], f'gate {look}')
        pg.evaluate(GATE_JS, {'look': look, 'at': at})
        pg.wait_for_timeout(300)
        SHOTS[f'gate {look} up'] = pg.screenshot(type='jpeg', quality=85, clip=clip(pg, 0, 0, 23, 6))
        pg.evaluate('__test.speed(3)')
        tap(pg, '[data-btn="go"]')
        pg.wait_for_timeout(300)
        pg.evaluate(GATE_JS, {'look': look, 'at': at})   # again, if GO drew the parts anew
        pressed = True
        try:
            pg.wait_for_function("() => { const l = document.querySelector('[data-lid=\"0\"]'); return l && l.style.transform === 'rotate(0deg)'; }", timeout=30000)
        except Exception:
            pressed = False
        pg.evaluate("() => { const b = document.querySelector('[data-button=\"0\"]'); if (b) b.setAttribute('data-lit', ''); }")
        pg.wait_for_timeout(1700)
        lamps = pg.evaluate("() => document.querySelectorAll('[data-button=\"0\"][data-lit] .gl-lamp').length")
        lit = pg.evaluate("() => [...document.querySelectorAll('[data-button=\"0\"][data-lit] .gl-lamp')].filter((e) => getComputedStyle(e).fill.replace(/ /g, '') === 'rgb(255,211,77)').length")
        LOOKCHK[look] = (pressed, lamps, lit)
        check(pressed and lamps >= 2 and lit == lamps, f'gate {look}: the button pressed in the run, the drawbridge down and {lit} of {lamps} lanterns lit')
        SHOTS[f'gate {look} lit'] = pg.screenshot(type='jpeg', quality=85, clip=clip(pg, 0, 0, 23, 6))
        tap(pg, '[data-btn="stop"]')
        pg.wait_for_function('__test.state().mode === "build"', timeout=5000)
    for look, name in POPS.items():
        put(pg, D['def'], road['placed'], f'party {look}')
        pg.evaluate('__test.speed(6)')
        tap(pg, '[data-btn="go"]')
        pg.wait_for_function('__test.state().mode === "party"', timeout=60000)
        pg.wait_for_timeout(400)
        n = pg.evaluate(POP_JS, look)
        check(n == (2 if look == 'C1' else 5) and pg.evaluate("() => document.querySelectorAll('[data-poppers] .pp-bit').length") > 0,
              f'party {look}: {n} poppers drawn over the merry-go-round, each with its burst')
        for k, wait in enumerate((350, 450, 900)):
            pg.wait_for_timeout(wait)
            SHOTS[f'party {look} {k}'] = pg.screenshot(type='jpeg', quality=85)
        pg.evaluate("() => { const b = document.querySelector('#party [data-act=\"again\"]'); if (b) b.click(); }")
        pg.wait_for_timeout(400)
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 5:
    del SHOTS[next(iter(SHOTS))]
want = 1 + 2 * len(D['roads']) + sum(1 for w in D['wrong'] if w.get('show')) + 2 * len(LOOKS) + 3 * len(POPS)
check(len(SHOTS) == want and all(len(v) > 15000 for v in SHOTS.values()), f'{want} screenshots, none blank ({len(SHOTS)})')


# ---------------------------------------------------------------- the page
def img(b, alt, cls='shot'):
    if b is None:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(b).decode()}" alt="{alt}" class="{cls}">'


INK = '#1B1446'
NAMES = {'ramp': 'ramp', 'bouncer': 'bouncer', 'bridge': 'bridge', 'tube': 'straw (tube)', 'catapult': 'spoon', 'zip': 'zip-line', 'signpost': 'signpost'}
PLURAL = {'straw (tube)': 'straws (tubes)'}


def tray(t):
    return ', '.join(f"{n} {PLURAL.get(NAMES[k], NAMES[k] + 's') if n > 1 else NAMES[k]}" for k, n in t.items())


def gadlist(placed):
    return ' · '.join(f'{i + 1} {NAMES[g[0]]}' for i, g in enumerate(placed))


d = D['def']
h = f'<p class="meta">{len(d["rows"][0])} × {len(d["rows"])} · tray: {tray(d["tray"])} ({sum(d["tray"].values())}, {len(d["tray"])} kinds) · Pudding third in the line · the fair\'s second stop, level 29\'s twin, and the last level.</p>'
h += f'<p>{D["idea"]}</p><figure>{img(SHOTS.get("empty"), "the empty board")}<figcaption>the board as the child first sees it (here the whole of it; in the game 16 squares across, sliding); the button is the red cap on the stand at the top right; the teacup ride is the lift beside the coconut shy; the drawbridge stands up at the stage\'s edge, under the arch (drawn as today\'s lid until a gate look is picked)</figcaption></figure>'
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
h += (f'<p class="chk">Checked with the game\'s own rules: every road gets all five home, Pudding too, every gadget on it is needed, each uses the zip-line, '
      f'the signpost and the button (pressed before anyone reaches the drawbridge), and each wrong road fails; no way home with {D["search"]} gadgets or fewer '
      f'({s["tried"]:,} placements tried along the hamsters\' paths, zip-lines too).</p>')
g_ = '<p>The drawbridge works as the picnic\'s lid does today (no rule change, D-240); only its picture changes. Before GO the bridge stands up and the lanterns are dark; once the button is pressed the lanterns light and the bridge swings down.</p>'
for look, name in LOOKS.items():
    g_ += f'<h3>{look}: {name}</h3><div class="row"><figure>{img(SHOTS.get(f"gate {look} up"), name + ", up")}<figcaption>before GO: the bridge up, the lanterns dark</figcaption></figure>' \
          + f'<figure>{img(SHOTS.get(f"gate {look} lit"), name + ", lit")}<figcaption>the button pressed: lit, the bridge down</figcaption></figure></div>'
p_ = '<p>Level 30\'s party is the merry-go-round (P1, as on level 29) with confetti poppers (D-241), three moments of each look:</p>'
for look, name in POPS.items():
    p_ += f'<h3>{look}: {name}</h3><div class="row">' + ''.join(f'<figure>{img(SHOTS.get(f"party {look} {k}"), name, "half")}</figure>' for k in range(3)) + '</div>'

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: level 30, Confetti party</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1340px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:20px;margin:30px 0 4px;padding-top:10px;border-top:3px solid {INK}22}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:12px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:10px}} img.shot{{width:640px}} img.half{{width:420px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle}}
.meta,.gl,.chk,.stamp{{font-size:14px}} .chk{{color:#2E6B3A}} .stamp{{color:#666}} .miss{{color:#c00}} li{{margin:4px 0}}
@media (prefers-color-scheme: dark){{body{{background:#17132E;color:#F3EEFF}} figure,table{{background:#231D45;border-color:#ffffff22}} .chk{{color:#8FD49C}} .stamp{{color:#BBB}}}}
</style></head><body>
<h1>Hamster Highway: level 30, Confetti party</h1>
<p class="stamp">mock_hamster_level30.py 0.2 · 27 Nov · step 18b (i) · drawn by the real game (the fair's look A) with each road put down by taps; the gate and popper looks laid over it from mock_hamster_finale.js 0.1; nothing is built yet. The whole board is shown at once here; in the game the window shows 16 squares across and slides. Headless Chromium stands in for a PC window.</p>
<p><b>What you picked:</b> every road at least 6 heights and 8 gadgets, 3 roads or more, at least 4 tempting wrong roads (D-238); the zip-line on every road, with the spoon, the signpost, the button as the lantern gate and Pudding in the line (D-239, D-240); the merry-go-round with confetti poppers (D-241). 24 squares wide (D-236).</p>
<p><b>What changed since the first version:</b> you said it was a big block of steps on the right, a straight climb with little to work out. This one has no staircase: separate fair things with sky between them, and a loop. Out along the bottom, up the teacup ride, along the top to the button at the far side, then back by the zip-line over the whole fair to the stage, which is just over the lake from where they started. The thinking is in the choices. There's one spoon for two places. The right hook can only be reached after the button, and there's a tempting one before it. The signpost has to go past the button, and the spoon only throws one way. A marshmallow works for everyone but Pudding. <b>New on this level: the teacup ride</b> (the lift from levels 1 to 20, as a fair ride) is the way up. It's a level part, not a gadget; say if you'd rather not have it.</p>
<h2>Level 30: {d["name"]}</h2>{h}
<h2>The lantern gate: two looks</h2>{g_}
<h2>The confetti poppers: two looks</h2>{p_}
<section><h2>What I'd like from you</h2><p>A yes or no for level 30 (or what to change), the teacup ride included, and a pick of gate look (G1 or G2) and popper look (C1 or C2). With a yes, 18b (ii) builds it.</p></section>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
