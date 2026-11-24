"""Hamster Highway step 17c (i-b), the sketch page (D-228): levels 26 and 28 one notch up, as levels 22, 24, 25 and 27
were on step 17c (i)'s page (D-226, D-227), drawn by the real game for Rob's yes or no before the six are built.
Version 0.1 (24 Nov). The shape of mock_hamster_step17c_levels.py 0.2.1.

The two designs below (DESIGNS) are Claude's, proposed: the ids, names, places, backdrops, 26's button (one, with its
lid) and 28's Pudding (second) and trap (two worn sticks in the tray) of levels.js 1.11's L13b and L14b are kept (saved
progress stays valid); the boards, trays, button and lid places and answers are new. They are the masters until
levels.js is rebuilt from them in step 17c (ii).
  26 Lunch is served (twin of 25): up onto the cake stand, across a gap onto the teapot, where the button is; the
     dandelion down to the far end, a signpost turns them, and they come back under the cake stand, over the lid the
     button dropped, to home on the hamper. Three roads: the jam pond by the spoon or a bridge, the gap by the spoon or
     three straws (tubes) (a fourth, the spoon over the pond and two bridges and a ramp over the gap, has road B's kinds).
  28 Big and small (twin of 27): up the climbing frame by the straws to home on the podium; or round the sandpit by the
     spoon, up two steps and the straws on the far tower, a signpost, and back along the slide's top. Pudding is second:
     the two worn sticks (the trap) carry five Nibbles but snap under it; and two bouncer short cuts get the Nibbles home
     but leave Pudding behind.

Checked with core.js's own run() (the repo's HEAD, unchanged since 8ff1fe6), each road its gadgets in order:
  - every gadget fits where it goes, in that order, and the tray holds them all; all five hamsters get home; each
    gadget is needed (take any one away: not all five home, or another no longer fits); one road of each takes the
    golden seed;
  - the floors (D-228; D-212's count: rows of 'walk' steps of all five hamsters, gadgets placed): 26 every road 4
    heights and 5 gadgets; 28 every road 5 heights and 8 gadgets;
  - right roads: at least 3 on 26 and 2 on 28 (a third only if it fits, D-228: Claude's call, none), each its own gadget
    kinds as the first hamster uses them (solver 1.8's used()); at least 2 wrong roads each, none getting all five home;
  - no way home with fewer gadgets than the fewest on a road, by solver 1.8's pathSearch() (from the empty board, every
    gadget left on every square near where a hamster goes, run, and again): 26 up to 5 gadgets (its floor less one is 4;
    its roads have 7 to 9). 28 up to 5 only: its floor less one is 7, far beyond what the search can try (5 takes
    minutes, 6 would take hours), so 6 and 7 are unchecked and the page says so;
  - 26's button: every road's first hamster presses it (run()'s 'press' event), and with the button taken out of the
    level no road gets all five home;
  - 28's Pudding: the trap (two worn sticks stacked in the last gap of road 1) snaps under Pudding, leaving it and those
    behind it out, and with Pudding made a Nibble gets all five home; the two bouncer short cuts leave only Pudding out,
    and with Pudding made a Nibble get all five home.
Then a scratch worktree of HEAD, with the faded picnic and playground (mock_hamster_park_quiet.js 0.1, agreed D-226), is
drawn by the real game (built with build_preview.py, headless Chromium standing in for a PC window, 1366 x 650): every
road put down by taps through the test hook __test.openBoard(def), once just after GO with the road marked (hamster 1's
path, and Pudding's where it differs), once mid-run; the wrong roads marked to show, mid-run. The scratch copy shows the
whole board at once (VIEW 24 squares across): the real game shows 16 across and slides.

Checks (exit 1 if one fails): those above; every road drawn and its run started; the screenshots all there, none
blank; the game logged no errors; the page names no web address. --fault N plants a fault the checks must catch:
1 a web address in the page; 2 level 26 without the hamper's end left of home (two ramps walk home); 3 level 26's
button on the cake stand (the dandelion off the stand then gets home); 4 level 28 without Pudding; 5 level 28's home one
row higher (the fourth Nibble on the trap meets the podium's side); 6 a screenshot left out; 7 level 28 with three
straws in the tray (road 2 needs four).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step17c_more.py OUT.html [--fault N]
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
OUT = args[0] if args else '/tmp/hamster-step17c-more.html'
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


# ---------------------------------------------------------------- the designs (Claude's, proposed, 24 Nov)
CORAL, BLUE, GREEN, CARAMEL = '#E8594A', '#2F7DD3', '#2E9E5B', '#D9944A'
# 26: the blanket with the jam pond (2) and a pond under the lid (15 to 17); the bench; the hamper's end; the cake stand;
# the hamper's shelf (home on it) with the lid in it; the teapot beyond the gap (16, 17)
B26 = [(0, 1, 8, 8), (3, 14, 8, 8), (18, 23, 8, 8), (7, 7, 7, 7), (8, 8, 5, 7), (8, 15, 4, 4), (9, 14, 7, 7), (18, 23, 7, 7), (18, 21, 3, 3)]
M26 = {'S': (0, 7), 'G': (9, 6), '*': (3, 5)}
# 28: the ground with the sandpit pond (12 to 14); the bench; the climbing frame's ledge, step and top deck; the podium
# (home on it) and the slide's top; two steps up and the far tower
B28 = [(0, 11, 8, 8), (15, 23, 8, 8), (3, 5, 7, 7), (8, 9, 5, 5), (10, 11, 4, 4), (12, 13, 3, 3), (15, 20, 4, 4), (17, 19, 7, 7), (20, 23, 6, 7), (22, 23, 3, 5)]
M28 = {'S': (0, 7), 'G': (15, 3), '*': (14, 6)}
UP26 = [['ramp', 6, 7], ['bouncer', 7, 6]]
STRAWS26 = [['tube', 16, 3], ['tube', 17, 3], ['tube', 17, 2]]
END26 = [['floater', 21, 2], ['signpost', 23, 6]]
R28A = [['ramp', 2, 7], ['tube', 6, 6], ['tube', 6, 5], ['tube', 6, 4], ['bridge', 7, 5], ['ramp', 9, 4], ['ramp', 11, 3], ['bridge', 14, 3]]
R28B = [['ramp', 2, 7], ['catapult', 11, 7], ['ramp', 16, 7], ['ramp', 19, 6], ['tube', 21, 5], ['tube', 21, 4], ['tube', 21, 3], ['tube', 21, 2], ['signpost', 23, 2]]
DESIGNS = [
    {'def': {'id': 'L13b', 'name': 'Lunch is served', 'room': 'park', 'spot': 'picnic2', 'back': 'picnic', 'new': None, 'twin': 'L13', 'roads': 3,
             'tray': {'ramp': 2, 'bouncer': 1, 'bridge': 2, 'catapult': 1, 'tube': 3, 'floater': 1, 'signpost': 1},
             'parts': [{'kind': 'button', 'c': 19, 'r': 2, 'lid': [[15, 7], [16, 7], [17, 7]]}],
             'rows': board(24, 9, B26, M26)},
     'level': 26, 'floor': (4, 5), 'roadsMin': 3, 'search': 5,
     'idea': 'Home is on the hamper, under the cake stand, and the hamsters can only reach it from the far end. Over the jam pond, a ramp and a bounce up onto the cake stand, across a gap onto the teapot, where the button drops the lunchbox lid; the dandelion down to the far end, a signpost turns them, and back under the cake stand, over the lid, home. Three roads: the jam pond by the spoon or a bridge, the gap by the spoon or three straws.',
     'roads': [{'name': 'Road A, the spoon and the straws', 'colour': CORAL, 'seed': True,
                'placed': [['catapult', 1, 7]] + UP26 + STRAWS26 + END26,
                'words': 'the spoon flings them over the jam pond (the seed is in the air), a ramp onto the bench, bounce up onto the cake stand, three straws up onto the teapot, press the button (the lid drops), pick up the dandelion and float down to the far end, a signpost turns them, back under the cake stand, over the lid, home'},
               {'name': 'Road B, the bridge and the spoon', 'colour': BLUE,
                'placed': [['bridge', 2, 8]] + UP26 + [['catapult', 15, 3]] + END26,
                'words': 'a bridge over the jam pond, a ramp and a bounce up onto the cake stand, the spoon flings them over the gap onto the teapot, then on as road A'},
               {'name': 'Road C, the bridge and the straws', 'colour': GREEN,
                'placed': [['bridge', 2, 8]] + UP26 + STRAWS26 + END26,
                'words': 'a bridge over the jam pond, up onto the cake stand, three straws up onto the teapot, then on as road A'}],
     'wrong': [{'name': 'The dandelion off the cake stand', 'show': True, 'placed': [['catapult', 1, 7]] + UP26 + [['floater', 15, 3], ['signpost', 23, 6]],
                'words': 'they float straight down to the lid, but nobody has pressed the button yet, so they drop into the pond'},
               {'name': 'Two bridges over the gap', 'show': True, 'placed': [['catapult', 1, 7]] + UP26 + [['bridge', 16, 4], ['bridge', 17, 4]] + END26,
                'words': 'across the gap, but the teapot is a step higher: they walk into its side'},
               {'name': 'No signpost', 'placed': [['bridge', 2, 8]] + UP26 + [['catapult', 15, 3], ['floater', 21, 2]],
                'words': 'they float down and walk on to the end of the blanket'}]},
    {'def': {'id': 'L14b', 'name': 'Big and small', 'room': 'park', 'spot': 'playground2', 'back': 'playground', 'new': None, 'twin': 'L14', 'roads': 2, 'pudding': 1, 'trap': 'stick',
             'tray': {'ramp': 3, 'tube': 4, 'bridge': 2, 'catapult': 1, 'signpost': 1, 'stick': 2, 'bouncer': 1},
             'rows': board(24, 9, B28, M28)},
     'level': 28, 'floor': (5, 8), 'roadsMin': 2, 'search': 5,
     'idea': 'Home is on the podium at the top of the slide. Up the climbing frame by the straws and two ramps to its top deck, and a bridge over to home; or round the sandpit by the spoon, up two steps and four straws on the far tower, a signpost, and back along the slide\'s top. Pudding is second, and big: the two worn sticks look like the last bridge but snap under it, and the bouncer is a short cut only the Nibbles can take.',
     'roads': [{'name': 'Road 1, up the frame', 'colour': CORAL, 'placed': R28A,
                'words': 'a ramp onto the bench, three straws up, a bridge onto the frame, two ramps up its steps to the top deck, a bridge over the gap, drop down onto home'},
               {'name': 'Road 2, round the sandpit', 'colour': BLUE, 'seed': True, 'placed': R28B,
                'words': 'a ramp onto the bench, hop down, under the frame, the spoon flings them over the sandpit (the seed), two ramps up the steps, four straws up the far tower, a signpost turns them, back along the slide\'s top, home'}],
     'wrong': [{'name': 'The trap: two worn sticks for the last bridge', 'show': True, 'trap': True, 'placed': R28A[:7] + [['stick', 14, 4], ['stick', 14, 3]],
                'words': 'the first Nibble cracks the top stick and gets home; Pudding snaps both and drops into the sandpit, and everyone behind falls through the hole'},
               {'name': 'The bounce onto the frame and the spoon home', 'show': True, 'pudOnly': True,
                'placed': [['ramp', 2, 7], ['bouncer', 7, 7], ['ramp', 9, 4], ['catapult', 11, 3]],
                'words': 'only 4 gadgets: the Nibbles bounce up onto the frame and the spoon flings them home; Pudding squashes the bouncer, walks on and drops into the sandpit'},
               {'name': 'The bouncer up the far tower', 'show': True, 'pudOnly': True,
                'placed': R28B[:4] + [['bouncer', 21, 5], ['bridge', 21, 3], ['signpost', 23, 2]],
                'words': 'a bouncer and a bridge in place of four straws: the Nibbles bounce up through the bridge; Pudding squashes the bouncer and walks into the tower'}]},
]
if FAULT == 2:
    DESIGNS[0]['def']['rows'] = board(24, 9, [b for b in B26 if b != (8, 8, 5, 7)], M26)
if FAULT == 3:
    DESIGNS[0]['def']['parts'] = [{'kind': 'button', 'c': 14, 'r': 3, 'lid': [[15, 7], [16, 7], [17, 7]]}]
if FAULT == 4:
    DESIGNS[1]['def']['pudding'] = None
if FAULT == 5:
    DESIGNS[1]['def']['rows'] = board(24, 9, B28 + [(15, 15, 3, 3)], {**M28, 'G': (15, 2)})
if FAULT == 7:
    DESIGNS[1]['def']['tray'] = {**DESIGNS[1]['def']['tray'], 'tube': 3}
# levels 26 and 28 as built (levels.js 1.11), for the table at the top: their roads, the core test 1.18's ROADS
BUILT = {'L13b': [[['ramp', 2, 7], ['bouncer', 5, 6], ['bridge', 11, 4], ['bridge', 12, 4]],
                  [['ramp', 2, 7], ['catapult', 7, 7], ['tube', 20, 7], ['tube', 20, 6], ['tube', 20, 5], ['signpost', 23, 5]]],
         'L14b': [[['ramp', 2, 7], ['tube', 6, 6], ['tube', 6, 5], ['tube', 6, 4], ['bridge', 7, 5], ['ramp', 9, 4], ['bridge', 13, 4], ['ramp', 15, 4]],
                  [['ramp', 2, 7], ['catapult', 11, 7], ['ramp', 17, 7], ['tube', 20, 6], ['tube', 20, 5], ['tube', 20, 4], ['signpost', 23, 4], ['rampL', 17, 4]]]}

# ---------------------------------------------------------------- the scratch worktree: checks with run(), then the game
WT = '/tmp/hh-step17c-more-wt' + (str(FAULT) if FAULT else '')   # one each, so planted faults can run side by side
SERVE = '/tmp/hh-step17c-more-serve' + (str(FAULT) if FAULT else '')
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
CHECK_JS = r'''
const [coreUrl, levelsUrl, designsJson, builtJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const DESIGNS = JSON.parse(designsJson);
const BUILT = JSON.parse(builtJson);
const putDown = (level, list) => {
  const placed = {}; const bad = [];
  for (const [k, c, r] of list) { if (!core.fits(level, placed, k, c, r)) bad.push(`${k} ${c},${r}`); placed[core.key(c, r)] = k; }
  return { placed, bad };
};
const go = (level, list) => {
  const { placed, bad } = putDown(level, list);
  const res = core.run(level, placed);
  const rows = new Set();
  for (const h of res.hamsters) for (const st of h.steps) if (st.act === 'walk') rows.add(st.r);
  return { bad, placed, res, rows: [...rows].sort((a, b) => a - b), outs: res.hamsters.map((h) => h.outcome), home: res.hamsters.filter((h) => h.outcome === 'home').length,
    seed: res.hamsters.some((h) => h.seed), events: res.events };
};
// solver 1.8's used(): the gadget kinds the first hamster uses
function used(lv, placed) {
  const kinds = new Set();
  for (const st of core.walk(lv, placed).steps) {
    const r = Math.round(st.r);
    const here = (placed[core.key(st.c, r)] || '').split(':')[0];
    const under = placed[core.key(st.c, r + 1)];
    if (here && here !== 'peg') kinds.add(here);
    if (under === 'bridge' || under === 'stick' || (st.act === 'climb' && (under === 'ramp' || under === 'rampL'))) kinds.add(under);
  }
  return [...kinds].sort().join('+');
}
// solver 1.8's pathSearch(), as it is
function pathSearch(lv, depth) {
  const kinds = Object.keys(lv.tray);
  const seen = new Set();
  const found = [];
  const canon = (p) => Object.entries(p).map(([k, v]) => `${v}@${k}`).sort().join(' ');
  const dfs = (placed, n) => {
    const c = canon(placed);
    if (seen.has(c)) return;
    seen.add(c);
    const res = core.run(lv, placed);
    if (res.hamsters.every((h) => h.outcome === 'home')) { found.push({ n, c, k: used(lv, placed), seed: res.hamsters.some((h) => h.seed) }); return; }
    if (n >= depth) return;
    const nearSq = new Set();
    for (const h of res.hamsters) for (const st of h.steps) {
      const r0 = Math.round(st.r);
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 2; dr++) nearSq.add(core.key(st.c + dc, r0 + dr));
    }
    const left = core.left(lv, placed);
    for (const sq of nearSq) {
      const [cc, rr] = sq.split(',').map(Number);
      for (const k of kinds) if (k !== 'zip' && (left[k] || 0) > 0 && core.fits(lv, placed, k, cc, rr)) dfs({ ...placed, [sq]: k }, n + 1);
    }
  };
  dfs({}, 0);
  return { tried: seen.size, ways: found.length, fewest: found.length ? Math.min(...found.map((f) => f.n)) : null, sample: found.slice(0, 2).map((f) => f.c) };
}
const steps = (h) => h.steps.map((s) => [s.c, s.r]);
const out = { designs: [], built: {} };
for (const D of DESIGNS) {
  const level = core.parseLevel(D.def);
  const o = { id: D.def.id, pudding: level.pudding, roads: [], wrong: [] };
  for (const road of D.roads) {
    const r = go(level, road.placed);
    const need = road.placed.map((gd, i) => {
      const x = go(level, road.placed.filter((_, j) => j !== i));
      return x.home < 5 || x.bad.length > 0;   // not all home, or another gadget no longer fits
    });
    const x = { name: road.name, bad: r.bad, home: r.home, outs: r.outs, rows: r.rows, gadgets: road.placed.length, seed: r.seed, need,
      kinds: used(level, r.placed), path: steps(r.res.hamsters[0]), pudPath: level.pudding !== null ? steps(r.res.hamsters[level.pudding]) : null, ticks: r.res.ticks,
      press: r.events.filter((e) => e.kind === 'press').map((e) => e.who) };
    if ((D.def.parts || []).some((p) => p.kind === 'button')) x.noButton = go(core.parseLevel({ ...D.def, parts: [] }), road.placed).home;
    o.roads.push(x);
  }
  for (const w of D.wrong) {
    const r = go(level, w.placed);
    const x = { name: w.name, bad: r.bad, home: r.home, outs: r.outs, ticks: r.res.ticks,
      snaps: r.events.filter((e) => e.kind === 'snap').map((e) => e.who) };
    if (w.pudOnly || w.trap) x.nibbles = go(core.parseLevel({ ...D.def, pudding: null }), w.placed).home;   // with Pudding made a Nibble
    o.wrong.push(x);
  }
  if (D.search) o.search = pathSearch(level, D.search);
  out.designs.push(o);
}
for (const [id, roads] of Object.entries(BUILT)) {
  const def = LEVELS.find((d) => d.id === id);
  const level = core.parseLevel(def);
  out.built[id] = { def, roads: roads.map((rd) => { const r = go(level, rd); return { home: r.home, rows: r.rows.length, gadgets: rd.length }; }) };
}
console.log(JSON.stringify(out));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, 'file://' + os.path.join(gdir, 'core.js'), 'file://' + os.path.join(gdir, 'levels.js'),
                        json.dumps([{k: d[k] for k in ('def', 'roads', 'wrong', 'search', 'floor') if k in d} for d in DESIGNS]), json.dumps(BUILT)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    ALL = json.loads(r.stdout)
    RES = {o['id']: o for o in ALL['designs']}
    # the scratch art.js: the faded looks (agreed, D-226) appended and drawn in place of the looks now
    art = os.path.join(gdir, 'art.js')
    src = open(art).read()
    for old, new in [
        ("if (name === 'picnic') return g(picnicArt(w), '', ' data-back=\"picnic\"');",
         "if (name === 'picnic') return g(picnicQ1(w), '', ' data-back=\"picnic\"');"),
        ("if (name === 'playground') return g(playgroundArt(w), '', ' data-back=\"playground\"');",
         "if (name === 'playground') return g(playgroundQ1(w), '', ' data-back=\"playground\"');"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    open(art, 'w').write(src + '\n' + open(os.path.join(HERE, 'mock_hamster_park_quiet.js')).read() + '\n')
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
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv = D['level']
    fl = D['floor']
    for rd, R in zip(D['roads'], o['roads']):
        tag = f"level {lv} ({o['id']}) {R['name']}"
        check(not R['bad'], f'{tag}: every gadget fits, in order' + (f" (not: {R['bad']})" if R['bad'] else ''))
        over = {k: n for k, n in ((k, sum(1 for g in rd['placed'] if g[0] == k)) for k in {g[0] for g in rd['placed']}) if n > D['def']['tray'].get(k, 0)}
        check(not over, f'{tag}: the tray holds every gadget' + (f' (short: {over})' if over else ''))
        check(R['home'] == 5, f"{tag}: all five home ({' '.join(R['outs'])})")
        check(len(R['rows']) >= fl[0] and R['gadgets'] >= fl[1], f"{tag}: the floor, {len(R['rows'])} heights {R['rows']} (at least {fl[0]}) and {R['gadgets']} gadgets (at least {fl[1]})")
        check(all(R['need']), f'{tag}: every gadget needed (take one away: not all five home)')
        if rd.get('seed'):
            check(R['seed'], f'{tag}: takes the golden seed')
        if 'noButton' in R:
            check(R['press'][:1] == [0] and R['noButton'] < 5, f"{tag}: the first hamster presses the button (pressed by {R['press']}), and without the button {R['noButton']} of 5 home")
    ks = {R['kinds'] for R in o['roads']}
    check(len(o['roads']) >= D['roadsMin'] and len(ks) == len(o['roads']), f"level {lv}: {len(o['roads'])} right roads (at least {D['roadsMin']}), each its own gadget kinds {sorted(ks)}")
    check(any(R['seed'] for R in o['roads']), f'level {lv}: one road takes the seed')
    s = o['search']
    check(s['fewest'] is None, f"level {lv}: no way home with {D['search']} gadgets or fewer, along the paths ({s['tried']:,} placements tried; found {s['ways']} {s['sample']})")
    check(len(D['wrong']) >= 2, f"level {lv}: {len(D['wrong'])} wrong roads (at least 2)")
    pud = o['pudding']
    for w, W in zip(D['wrong'], o['wrong']):
        check(not W['bad'] and W['home'] < 5, f"level {lv} wrong road '{W['name']}': {W['home']} of 5 home ({' '.join(W['outs'])})")
        if w.get('pudOnly'):
            check(pud is not None and W['home'] == 4 and W['outs'][pud] != 'home' and W.get('nibbles') == 5,
                  f"level {lv}: only Pudding is left out on '{W['name']}'; with Pudding made a Nibble, {W.get('nibbles')} of 5 home")
        if w.get('trap'):
            check(pud is not None and W['outs'][pud] != 'home' and all(x != 'home' for x in W['outs'][pud:]) and pud in W['snaps'] and W.get('nibbles') == 5,
                  f"level {lv}: the trap snaps under Pudding (snapped by {W['snaps']}), leaving it and those behind out ({' '.join(W['outs'])}); with Pudding made a Nibble, {W.get('nibbles')} of 5 home")
for id_, B in ALL['built'].items():
    check(all(r['home'] == 5 for r in B['roads']), f"{id_} as built (levels.js 1.11): its roads from the core test 1.18 get all five home (for the table)")


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
    """The road marked over the board: hamster 1's path, Pudding's where it differs, and each gadget numbered."""
    pts = lambda p: ' '.join(f'{(c + 0.5) * 60:.0f},{(r + 0.5) * 60:.0f}' for c, r in p)
    s = f'<polyline points="{pts(R["path"])}" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>'
    s += f'<polyline points="{pts(R["path"])}" fill="none" stroke="{colour}" stroke-width="9" stroke-dasharray="18 10" stroke-linejoin="round" stroke-linecap="round"/>'
    if R['pudPath'] and R['pudPath'] != R['path']:
        s += f'<polyline points="{pts(R["pudPath"])}" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round" opacity="0.85"/>'
        s += f'<polyline points="{pts(R["pudPath"])}" fill="none" stroke="{CARAMEL}" stroke-width="8" stroke-dasharray="6 9" stroke-linejoin="round" stroke-linecap="round"/>'
    for i, (k, c, r) in enumerate(placed):
        x, y = c * 60, r * 60
        s += f'<rect x="{x + 3}" y="{y + 3}" width="54" height="54" rx="10" fill="none" stroke="{colour}" stroke-width="5"/>'
        s += f'<circle cx="{x + 10}" cy="{y + 10}" r="13" fill="{colour}" stroke="#fff" stroke-width="3"/><text x="{x + 10}" y="{y + 15}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">{i + 1}</text>'
    return s


DRAW_JS = """(d) => { const w = document.getElementById('world'); let g = document.getElementById('mockroad');
  if (!g) { g = document.createElementNS(d.ns, 'g'); g.id = 'mockroad'; w.insertBefore(g, document.getElementById('walkers')); }
  g.innerHTML = d.svg; }"""


def tap(pg, sel):
    b = pg.locator(sel).first.bounding_box()
    pg.mouse.click(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2)


def place(pg, kind, c, r):
    if pg.evaluate('__test.state().selected') != kind:
        tap(pg, f'[data-slot="{kind}"]')
    p = pg.evaluate(f'__test.cellPoint({c}, {r})')
    pg.mouse.click(p['x'], p['y'])


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
    for kind, c, r in placed:
        place(pg, kind, c, r)
    ok = pg.evaluate('Object.keys(__test.state().placed).length') == len(placed)
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
    for D in DESIGNS:
        o = RES[D['def']['id']]
        for rd, R in zip(D['roads'], o['roads']):
            play(pg, D['def'], rd['placed'], f"{o['id']} {rd['name']}", R['ticks'], overlay(R, rd['colour'], rd['placed']))
        for w, W in zip(D['wrong'], o['wrong']):
            if w.get('show'):
                play(pg, D['def'], w['placed'], f"{o['id']} {w['name']}", W['ticks'])
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 6:
    del SHOTS[next(iter(SHOTS))]
want = sum(2 * len(D['roads']) + sum(1 for w in D['wrong'] if w.get('show')) for D in DESIGNS)
check(len(SHOTS) == want and all(len(v) > 15000 for v in SHOTS.values()), f'{want} screenshots, none blank ({len(SHOTS)})')


# ---------------------------------------------------------------- the page
def img(b, alt, cls='shot', kind='jpeg'):
    if b is None:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/{kind};base64,{base64.b64encode(b).decode()}" alt="{alt}" class="{cls}">'


INK = '#1B1446'
NAMES = {'ramp': 'ramp', 'rampL': 'left ramp', 'bouncer': 'bouncer', 'floater': 'dandelion', 'bridge': 'bridge', 'tube': 'straw (tube)', 'catapult': 'spoon',
         'signpost': 'signpost', 'stick': 'worn stick'}
PLURAL = {'straw (tube)': 'straws (tubes)', 'worn stick': 'worn sticks'}


def tray(t):
    return ', '.join(f"{n} {PLURAL.get(NAMES[k], NAMES[k] + 's') if n > 1 else NAMES[k]}" for k, n in t.items())


def gadlist(placed):
    return ' · '.join(f'{i + 1} {NAMES[k]}' for i, (k, c, r) in enumerate(placed))


def span(xs):
    xs = sorted(xs)
    return str(xs[0]) if xs[0] == xs[-1] else f'{xs[0]} to {xs[-1]}'


secs = []
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv, fl, d = D['level'], D['floor'], D['def']
    pud = f" Pudding is {['first', 'second', 'third', 'fourth', 'fifth'][d['pudding']]} in the line." if d.get('pudding') is not None else ''
    bt = ALL['built'][d['id']]
    h = f'<section><h2>Level {lv}: {d["name"]}</h2><p class="meta">{len(d["rows"][0])} × {len(d["rows"])} · tray: {tray(d["tray"])} · a twin, pick your road.{pud}</p>' \
        + f'<p class="now"><b>As built now:</b> {len(bt["roads"])} roads of {span([r["gadgets"] for r in bt["roads"]])} gadgets on {span([r["rows"] for r in bt["roads"]])} heights.</p><p><b>Now:</b> {D["idea"]}</p>'
    h += '<table><tr><th>Road</th><th>Heights walked</th><th>Gadgets</th></tr>'
    for rd, R in zip(D['roads'], o['roads']):
        h += f'<tr><td><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</td><td>{len(R["rows"])} (at least {fl[0]})</td><td>{R["gadgets"]} (at least {fl[1]})</td></tr>'
    h += '</table>'
    for rd, R in zip(D['roads'], o['roads']):
        tag = f"{o['id']} {rd['name']}"
        h += f'<h3><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</h3><p>{rd["words"][0].upper() + rd["words"][1:]}.</p><p class="gl">{gadlist(rd["placed"])}</p>'
        h += f'<div class="row"><figure>{img(SHOTS.get(tag + " marked"), rd["name"] + ", marked")}<figcaption>just after GO, the road marked' \
             + (' (Pudding\'s own road in caramel dots)' if R['pudPath'] and R['pudPath'] != R['path'] else '') + '</figcaption></figure>' \
             + f'<figure>{img(SHOTS.get(tag + " run"), rd["name"] + ", mid-run")}<figcaption>mid-run</figcaption></figure></div>'
    h += '<h3>Wrong roads</h3><ul>'
    for w, W in zip(D['wrong'], o['wrong']):
        h += f'<li><b>{w["name"]}:</b> {w["words"]} ({W["home"]} of 5 home).</li>'
    h += '</ul>'
    h += '<div class="row">' + ''.join(f'<figure>{img(SHOTS.get(o["id"] + " " + w["name"] + " run"), w["name"])}<figcaption>{w["name"]}, mid-run</figcaption></figure>'
                                       for w in D['wrong'] if w.get('show')) + '</div>'
    chk = ['every road gets all five home', 'every gadget is needed', 'each wrong road fails']
    chk.append(f'no way home with {D["search"]} gadgets or fewer ({o["search"]["tried"]:,} placements tried along the hamsters\' paths)')
    if D['search'] < fl[1] - 1:
        chk.append(f'with {D["search"] + 1} to {fl[1] - 1} gadgets not checked (too many placements for the search)')
    if any('noButton' in R for R in o['roads']):
        chk.append('the first hamster presses the button on every road, and with the button taken out no road gets all five home')
    for w, W in zip(D['wrong'], o['wrong']):
        if w.get('pudOnly') or w.get('trap'):
            chk.append(f'with Pudding made a Nibble, "{w["name"]}" gets all {W.get("nibbles")} home')
    h += f'<p class="chk">Checked with the game\'s own rules: {"; ".join(chk)}.</p></section>'
    secs.append(h)

summ = ('<section><h2>The same notch for 26 and 28</h2><p>As you agreed for 22, 24, 25 and 27 (D-228): level 26 every road at least 4 '
        'heights and 5 gadgets, with 3 right roads; level 28 every road at least 5 heights and 8 gadgets. Both with at least two tempting '
        'wrong roads, shown failing below. Each twin is meant to feel a step on from its first: 25 has roads of 6 and 7 gadgets on 4 heights, '
        '27 two of 6 on 5.</p><table><tr><th>Level</th><th>Right roads</th><th>Gadgets a road</th><th>Heights a road (fewest)</th><th>Wrong roads</th></tr>')
for D in DESIGNS:
    o = RES[D['def']['id']]
    bt = ALL['built'][D['def']['id']]
    gs = [R['gadgets'] for R in o['roads']]
    summ += (f'<tr><td>{D["level"]}</td><td>{len(bt["roads"])} → <b>{len(o["roads"])}</b></td><td>{span([r["gadgets"] for r in bt["roads"]])} → <b>{span(gs)}</b></td>'
             f'<td>{min(r["rows"] for r in bt["roads"])} → <b>{min(len(R["rows"]) for R in o["roads"])}</b></td><td>1 → <b>{len(D["wrong"])}</b></td></tr>')
summ += ('</table><p>Level 28 has two right roads, not three: a third would mean three bridges over the sandpit, a road of 11 gadgets, '
         'which I thought too long (D-228 left that to me). Both backdrops are the faded ones you agreed.</p></section>')

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: levels 26 and 28 one notch up</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1340px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:20px;margin:30px 0 4px;padding-top:10px;border-top:3px solid {INK}22}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:12px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:10px}} img.shot{{width:640px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle}}
.meta,.gl,.chk,.stamp,.now{{font-size:14px}} .chk{{color:#2E6B3A}} .stamp{{color:#666}} .miss{{color:#c00}} .now{{color:#555}}
@media (prefers-color-scheme: dark){{body{{background:#17132E;color:#F3EEFF}} figure,table{{background:#231D45;border-color:#ffffff22}} .chk{{color:#8FD49C}} .stamp,.now{{color:#BBB}}}}
</style></head><body>
<h1>Hamster Highway: levels 26 and 28 one notch up</h1>
<p class="stamp">mock_hamster_step17c_more.py 0.1 · 24 Nov · step 17c (i-b), D-228 · drawn by the real game with each road put down by taps; nothing is built yet. The whole board is shown at once here; in the game the window still shows 16 squares across and slides. Headless Chromium stands in for a PC window.</p>
<p>The numbers on each board match the gadget list under each road. Every road was run with the game's own rules.</p>
{summ}{''.join(secs)}
<section><h2>What I'd like from you</h2><p>A yes or no for each of the two levels (or what to change). With a yes, the next chat builds all six (22, 24, 25, 26, 27 and 28) test-first as preview 22.</p></section>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
