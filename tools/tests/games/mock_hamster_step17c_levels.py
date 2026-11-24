"""Hamster Highway step 17c (i), the sketch page (D-223): levels 22, 24, 25 and 27 redesigned (feedback items 10 to 12
and 14: D-218, D-220, D-221) and the picnic's and playground's backdrops faded to 40% (item 13, D-219), drawn by the
real game for Rob's yes or no before building. Version 0.2.1 (24 Nov). The shape of mock_hamster_step17b_levels.py 0.1.

Changes at v0.2.1: planted fault 2 re-aimed (0.2's, the willow branch as long as v0.1's, turned out equivalent:
all checks passed with it, as the jetty now stops the spoon off the branch's end); now level 22 without its channel.
Planted faults 1 to 7 each fail at least one check (7 of 7 caught, 24 Nov). The designs and checks are unchanged.

Changes at v0.2 (Rob, 23 Nov 22:19: "still not happy with the complexity ... very linear and simple to solve ...
complexity means more gadgets, more elevations, more right and wrong routes ... increase the complexity one notch
higher", D-225): the four levels designed again, one notch up on each of Rob's three measures, Claude's reading
(proposed, Q-088): every road at least one gadget and one height more than v0.1's floors (22: 4 gadgets on 3
heights; 24: 5 on 4; 25: 6 on 4; 27: 6 on 5); one more right road each (22 and 24: 3 roads; 25 and 27, first levels:
2 or more); at least 2 tempting wrong roads each, drawn mid-run. The checks follow: a level's right roads counted by
the gadget kinds the first hamster uses; a gadget that no longer fits once another is taken away counts as needed
(v0.1 counted it as placed anyway); 22's D-218 check now reads every way home that pathSearch finds up to the floor
(the whole tray, 8 gadgets, is far beyond every placement); 25 without its button searched up to 6 gadgets; 27's
Pudding check on its wrong road (with Pudding a Nibble, all five home) in place of comparing two searches; 27's
spread on both roads. Faults 2, 3, 4 and 7 re-aimed at the new designs.

The four designs below (DESIGNS) are Claude's, proposed: the ids, names, places, backdrops and Pudding's place of
levels.js 1.11's L11b, L12b, L13 and L14 are kept (saved progress stays valid); the boards, trays, parts and answers
are new (22, 25 and 27 are 24 wide). They are the masters until levels.js is rebuilt from them in step 17c (ii).

Checked with core.js's own run() (the repo's HEAD, unchanged since 8ff1fe6), each road its gadgets in order:
  - every gadget fits where it goes, in that order; all five hamsters get home; each gadget is needed (take any one
    away: not all five home, or another no longer fits; a first level's seed spare excepted); a seed road takes the
    golden seed (a twin: one of its roads; a first level: its roads with the spare added);
  - the floors (D-212's count: rows of 'walk' steps of all five hamsters; gadgets placed), one notch up (Q-088): 22
    every road 3 heights and 4 gadgets; 24 4 and 5; 25 4 and 6; 27 5 and 6;
  - right roads: at least 3 on 22 and 24, 2 on 25 and 27, each its own gadget kinds as the first hamster uses them
    (solver 1.8's used()); at least 2 wrong roads each, none getting all five home;
  - 27's "third height for much of the road" (D-220), Claude's measure, proposed: on each road, of hamster 1's walking
    squares, the third most-walked height has at least 20%;
  - no way home under the floor by solver 1.8's pathSearch(): from the empty board, every gadget left on every square
    near where a hamster goes, run, and again, up to the floor less one (near the paths, not every placement);
  - 22 (D-218): every way home with the seed that pathSearch finds up to the floor has the first hamster use the spoon
    or the bridge;
  - the new things: 25's roads fail without the button and pathSearch finds no way without it up to 6 gadgets; 27's
    bouncer-for-the-bridge road leaves only Pudding behind, and gets all five home with Pudding made a Nibble.
The faded backdrops (mock_hamster_park_quiet.js 0.1, appended to a scratch copy of art.js): each draws exactly the
shapes of the look now (the same elements, colours and outlines), with the busy ones in one group at 40%.
Then a scratch worktree of HEAD is drawn by the real game (built with build_preview.py, headless Chromium standing in for
a PC window, 1366 x 650): every right road put down by taps through the test hook __test.openBoard(def), once just after
GO with the road marked (hamster 1's path, and Pudding's where it differs), once mid-run; the wrong roads marked to
show, mid-run; levels 25 to 28 mid-run with the backdrop as now and faded (26 and 28 as built, levels.js 1.11, on their
answers from the core test 1.18's SOL). The scratch copy shows the whole board at once (VIEW 24 squares across): the
real game shows 16 across and slides.

Checks (exit 1 if one fails): those above; every road drawn and its run started; the screenshots all there, none
blank; the game logged no errors; the page names no web address. --fault N plants a fault the checks must catch:
1 a web address in the page; 2 level 22 without its channel (the willow road with the seed needs no bridge: 3
gadgets; a branch as long as v0.1's was tried first and is equivalent, as the jetty now stops the spoon off its end); 3 level 25 without the thermos; 4 level 27 without the roof over home (the spoon off the walkway lands home);
5 the backdrops faded at full strength; 6 a screenshot left out; 7 level 24's top bar with v0.1's first gap at col 8
(a bounce up through it makes a 3-gadget road).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step17c_levels.py OUT.html [--fault N]
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
OUT = args[0] if args else '/tmp/hamster-step17c-levels.html'
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


# ---------------------------------------------------------------- the designs (Claude's, proposed, v0.2, 23 to 24 Nov)
CORAL, BLUE, GREEN, CARAMEL, GREY = '#E8594A', '#2F7DD3', '#2E9E5B', '#D9944A', '#555555'
B22 = [(0, 3, 4, 8), (5, 8, 6, 8), (11, 13, 6, 8), (15, 23, 6, 8), (17, 23, 5, 5), (3, 10, 1, 1)]
B24 = [(3, 3, 3, 3), (5, 11, 3, 3), (13, 16, 3, 3), (18, 19, 3, 3), (0, 2, 5, 5), (10, 11, 5, 5), (6, 6, 6, 6), (15, 16, 7, 7), (17, 17, 6, 7), (0, 19, 8, 8)]
B25 = [(2, 10, 7, 7), (5, 7, 4, 4), (9, 12, 4, 4), (12, 12, 5, 7), (0, 12, 8, 8), (13, 15, 1, 1), (16, 23, 8, 8), (20, 20, 7, 7), (21, 21, 6, 7), (22, 23, 5, 7)]
B27 = [(0, 4, 3, 3), (5, 6, 5, 5), (8, 11, 5, 5), (7, 8, 3, 3), (12, 13, 2, 2), (13, 15, 4, 4), (17, 19, 4, 4), (20, 22, 7, 7), (23, 23, 6, 8), (21, 23, 3, 3),
       (0, 5, 8, 8), (9, 13, 8, 8), (16, 17, 8, 8), (20, 22, 8, 8)]
T22 = [['bridge', 14, 6], ['ramp', 16, 5]]
UP25 = [['ramp', 1, 7], ['bouncer', 4, 6]]
STEPS25 = [['ramp', 19, 7], ['ramp', 20, 6], ['ramp', 21, 5]]
R27A = [['bridge', 7, 5], ['floater', 11, 4], ['bridge', 14, 8], ['bridge', 15, 8], ['catapult', 17, 7], ['ramp', 22, 6]]
R27B = [['bridge', 7, 5], ['bridge', 12, 5], ['ramp', 12, 4], ['bridge', 16, 4], ['floater', 19, 3], ['ramp', 22, 6]]
DESIGNS = [
    {'def': {'id': 'L11b', 'name': 'Two ways round', 'room': 'park', 'spot': 'pond2', 'back': 'pond', 'new': None, 'twin': 'L11', 'roads': 3,
             'tray': {'bridge': 4, 'catapult': 1, 'bouncer': 1, 'floater': 1, 'ramp': 1},
             'rows': board(24, 9, B22, {'S': (0, 3), 'G': (23, 4), '*': (7, 0)})},
     'level': 22, 'floor': (3, 4), 'roadsMin': 3, 'search': 3, 'seedNeeds': ['catapult', 'bridge'],
     'idea': 'Now 24 wide: a high bank, a ditch, a low bank, the duck pond, an island, a second channel and a jetty up to home, with the willow branch above. Three roads: over the ditch and the spoon over the pond; up the willow for the seed and float down to the island; or bridges all the way. All three meet at the channel (a bridge) and the jetty (a ramp).',
     'roads': [{'name': 'Road A, the spoon', 'colour': CORAL,
                'placed': [['bridge', 4, 4], ['catapult', 8, 5]] + T22,
                'words': 'a bridge over the ditch, down onto the low bank, the spoon flings them over the pond onto the island, a bridge over the channel, a ramp up onto the jetty, home'},
               {'name': 'Road B, the willow, with the seed', 'colour': BLUE, 'seed': True,
                'placed': [['bouncer', 2, 3], ['floater', 4, 0]] + T22,
                'words': 'bounce up onto the willow branch, pick up the dandelion, past the seed, float down onto the island, a bridge over the channel, a ramp up onto the jetty, home'},
               {'name': 'Road C, the bridges', 'colour': GREEN,
                'placed': [['bridge', 4, 4], ['bridge', 9, 6], ['bridge', 10, 6]] + T22,
                'words': 'a bridge over the ditch, two bridges over the pond, a bridge over the channel, a ramp up onto the jetty, home'}],
     'wrong': [{'name': 'The dandelion first', 'show': True, 'placed': [['floater', 2, 3], ['catapult', 8, 5]] + T22,
                'words': 'they float off the high bank straight down into the ditch'},
               {'name': 'The spoon over the ditch', 'show': True, 'placed': [['catapult', 3, 3], ['bridge', 9, 6], ['bridge', 10, 6]] + T22,
                'words': 'the spoon flings them into the willow branch and they drop into the ditch'},
               {'name': 'Road B without the channel bridge', 'placed': [['bouncer', 2, 3], ['floater', 4, 0], ['ramp', 16, 5]],
                'words': 'they get the seed, float down onto the island and walk into the channel'}]},
    {'def': {'id': 'L12b', 'name': 'Zig, zag, home', 'room': 'park', 'spot': 'frame2', 'back': 'frame', 'new': None, 'twin': 'L12', 'roads': 3,
             'tray': {'signpost': 2, 'bouncer': 2, 'ramp': 2, 'bridge': 2, 'tube': 3},
             'rows': board(20, 9, B24, {'S': (6, 5), 'G': (11, 2), '*': (6, 2)})},
     'level': 24, 'floor': (4, 5), 'roadsMin': 3, 'search': 4,
     'idea': 'Home is on the top bar, which now has a gap on the left, a hole in the middle and a gap on the right, so every road needs more. Three roads: the zig-zag up the left (with the seed); round the steps on the right and back along the bar; or straight up the middle onto a ledge and through the hole in a tube, then turned back by a signpost.',
     'roads': [{'name': 'Road A, the zig-zag, with the seed', 'colour': CORAL, 'seed': True,
                'placed': [['signpost', 8, 7], ['bouncer', 3, 7], ['bouncer', 2, 4], ['signpost', 0, 4], ['bridge', 4, 3]],
                'words': 'drop to the ground, a signpost turns them back, bounce up onto the left shelf, a signpost turns them again, bounce up onto the top bar, a bridge over its gap, past the seed, home'},
               {'name': 'Road B, round and back', 'colour': BLUE,
                'placed': [['ramp', 14, 7], ['ramp', 16, 6], ['bouncer', 17, 5], ['signpost', 19, 2], ['bridge', 17, 3], ['bridge', 12, 3]],
                'words': 'drop to the ground, two ramps up the steps, bounce up onto the perch, a signpost turns them back, a bridge over the gap, a bridge over the hole, home'},
               {'name': 'Road C, up the middle', 'colour': GREEN,
                'placed': [['bouncer', 9, 7], ['tube', 12, 4], ['tube', 12, 3], ['tube', 12, 2], ['signpost', 13, 2]],
                'words': 'drop to the ground, bounce up onto the middle ledge, into the tube and up through the hole in the bar, a signpost turns them back, home'}],
     'wrong': [{'name': 'Road A without the bridge', 'show': True, 'placed': [['signpost', 8, 7], ['bouncer', 3, 7], ['bouncer', 2, 4], ['signpost', 0, 4]],
                'words': 'up the zig-zag and straight down through the gap in the bar'},
               {'name': 'Road C without the signpost', 'show': True, 'placed': [['bouncer', 9, 7], ['tube', 12, 4], ['tube', 12, 3], ['tube', 12, 2]],
                'words': 'up through the hole, but they walk away from home and off the far gap'},
               {'name': 'Road B with one bridge', 'placed': [['ramp', 14, 7], ['ramp', 16, 6], ['bouncer', 17, 5], ['signpost', 19, 2], ['bridge', 17, 3]],
                'words': 'back along the bar and down through the hole'}]},
    {'def': {'id': 'L13', 'name': 'Lunchbox drawbridge', 'room': 'park', 'spot': 'picnic', 'back': 'picnic', 'new': 'button',
             'tray': {'ramp': 5, 'bouncer': 1, 'bridge': 1, 'catapult': 1, 'floater': 1}, 'spare': 'ramp',
             'parts': [{'kind': 'button', 'c': 6, 'r': 3, 'lid': [[13, 8], [14, 8], [15, 8]]}],
             'rows': board(24, 9, B25, {'S': (0, 7), 'G': (23, 4), '*': (17, 6)})},
     'level': 25, 'floor': (4, 6), 'roadsMin': 2, 'search': 5,
     'idea': 'The button and its lid as before: the button on the cake stand, the lunchbox lid over the pond, and the lid on every road. Now 24 wide, with home up three steps on a cool box. Three roads, all through the button: across to the sandwich box by a bridge, or by the spoon; and up the steps by three ramps, or by a ramp and the spoon. The tempting wrong road: a bounce from the hamper straight up onto the sandwich box, past the button.',
     'roads': [{'name': 'Road 1, the bridge', 'colour': CORAL, 'placed': UP25 + [['bridge', 8, 4], ['floater', 12, 3]] + STEPS25,
                'words': 'ramp onto the hamper, bounce up onto the cake stand, press the button (the lid drops over the pond), a bridge across to the sandwich box, pick up the dandelion, float down onto the lid, three ramps up the steps to home'},
               {'name': 'Road 2, the spoon across', 'colour': BLUE, 'placed': UP25 + [['catapult', 7, 3], ['floater', 12, 3]] + STEPS25,
                'words': 'the same, but the spoon flings them from the cake stand over to the sandwich box'},
               {'name': 'Road 3, the spoon up the steps', 'colour': GREEN, 'placed': UP25 + [['bridge', 8, 4], ['floater', 12, 3], ['ramp', 19, 7], ['catapult', 20, 6]],
                'words': 'as road 1 to the far bank, then a ramp and the spoon up the steps in place of two ramps'},
               {'name': 'Road 1 with the seed', 'colour': CORAL, 'seed': True, 'placed': UP25 + [['bridge', 8, 4], ['floater', 12, 3]] + STEPS25 + [['ramp', 16, 7]],
                'words': 'road 1 with the spare ramp on the far bank: up it for the seed, then on'}],
     'wrong': [{'name': 'The tempting bounce onto the sandwich box', 'show': True, 'placed': [['ramp', 1, 7], ['bouncer', 8, 6], ['floater', 12, 3]] + STEPS25,
                'words': 'one gadget fewer and straight up onto the sandwich box, but nobody pressed the button, so they float into the pond'},
               {'name': 'The dandelion in place of the bridge', 'show': True, 'placed': UP25 + [['floater', 7, 3]] + STEPS25,
                'words': 'they press the button, then float down onto the hamper and are stuck at the thermos'},
               {'name': 'No bounce', 'placed': [['ramp', 1, 7]] + STEPS25,
                'words': 'along the hamper and stuck at the thermos'}]},
    {'def': {'id': 'L14', 'name': 'Pudding comes to play', 'room': 'park', 'spot': 'playground', 'back': 'playground', 'new': 'pudding', 'pudding': 2,
             'tray': {'bridge': 4, 'ramp': 2, 'floater': 1, 'catapult': 1, 'bouncer': 1}, 'spare': 'bouncer',
             'rows': board(24, 9, B27, {'S': (0, 2), 'G': (23, 5), '*': (8, 2)})},
     'level': 27, 'floor': (5, 6), 'roadsMin': 2, 'search': 5, 'spread': 0.2,
     'idea': 'Pudding stays simple: the seed is above the monkey bars, the spare bouncer takes the Nibbles over the top for it, but Pudding squashes it and plods on, so the bridge over the bars\' gap is always needed. After the bars the road splits: down to the ground and along (two bridges over the paddling pool, the spoon over the sandpit), or up onto the walkway (a bridge and a ramp up, a bridge over its gap, the dandelion down). Both end up the step to home.',
     'roads': [{'name': 'Road 1, down and along', 'colour': CORAL, 'placed': R27A,
                'words': 'along the deck, drop onto the monkey bars, a bridge over the gap, the dandelion down to the ground, two bridges over the paddling pool, the spoon over the sandpit, a ramp up to home'},
               {'name': 'Road 2, up and over', 'colour': BLUE, 'placed': R27B,
                'words': 'along the deck, drop onto the monkey bars, a bridge over the gap, a bridge and a ramp up onto the walkway, a bridge over its gap, the dandelion down onto the bench, a ramp up to home'},
               {'name': 'Road 1 with the seed: Pudding plods', 'colour': CORAL, 'seed': True, 'placed': R27A + [['bouncer', 6, 4]],
                'words': 'add the spare bouncer: the Nibbles bounce over the gap for the seed; Pudding (third) squashes it and walks on over the bridge'}],
     'wrong': [{'name': 'The bouncer instead of the bridge', 'show': True, 'pudOnly': True, 'placed': [['bouncer', 6, 4]] + R27A[1:],
                'words': 'the Nibbles go over the top and home; Pudding squashes the bouncer and drops into the paddling pool'},
               {'name': 'The dandelion over the gap', 'show': True, 'placed': [['floater', 6, 4]] + R27A[2:],
                'words': 'they float down through the gap in the bars into the paddling pool'},
               {'name': 'Road 1 one bridge short', 'placed': R27A[:3] + R27A[4:],
                'words': 'down and along, into the paddling pool'},
               {'name': 'Road 2 without the dandelion', 'placed': R27B[:4] + [['ramp', 22, 6]],
                'words': 'along the walkway and a big bump down onto the bench'}]},
]
if FAULT == 2:
    DESIGNS[0]['def']['rows'] = board(24, 9, B22 + [(14, 14, 6, 8)], {'S': (0, 3), 'G': (23, 4), '*': (7, 0)})
if FAULT == 3:
    DESIGNS[2]['def']['rows'] = board(24, 9, [b for b in B25 if b != (12, 12, 5, 7)], {'S': (0, 7), 'G': (23, 4), '*': (17, 6)})
if FAULT == 4:
    DESIGNS[3]['def']['rows'] = board(24, 9, [b for b in B27 if b != (21, 23, 3, 3)], {'S': (0, 2), 'G': (23, 5), '*': (8, 2)})
if FAULT == 7:
    DESIGNS[1]['def']['rows'] = board(20, 9, [(3, 7, 3, 3), (9, 11, 3, 3)] + B24[2:], {'S': (6, 5), 'G': (11, 2), '*': (6, 2)})
# levels 26 and 28 as built (levels.js 1.11), for their faded backdrops: their answers, the core test 1.18's SOL
BUILT = {'L13b': [['ramp', 2, 7], ['catapult', 7, 7], ['tube', 20, 7], ['tube', 20, 6], ['tube', 20, 5], ['signpost', 23, 5]],
         'L14b': [['ramp', 2, 7], ['catapult', 11, 7], ['ramp', 17, 7], ['tube', 20, 6], ['tube', 20, 5], ['tube', 20, 4], ['signpost', 23, 4], ['rampL', 17, 4]]}

# ---------------------------------------------------------------- the scratch worktree: checks with run(), then the game
WT = '/tmp/hh-step17c-levels-wt' + (str(FAULT) if FAULT else '')   # one each, so planted faults can run side by side
SERVE = '/tmp/hh-step17c-levels-serve' + (str(FAULT) if FAULT else '')
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
CHECK_JS = r'''
const [coreUrl, levelsUrl, artUrl, designsJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const art = await import(artUrl);
const DESIGNS = JSON.parse(designsJson);
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
  const per = {};
  for (const st of res.hamsters[0].steps) if (st.act === 'walk') per[st.r] = (per[st.r] || 0) + 1;
  return { bad, placed, res, rows: [...rows].sort((a, b) => a - b), per, outs: res.hamsters.map((h) => h.outcome), home: res.hamsters.filter((h) => h.outcome === 'home').length,
    seed: res.hamsters.some((h) => h.seed) };
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
  const seedKinds = [...new Set(found.filter((f) => f.seed).map((f) => f.k))].sort();
  return { tried: seen.size, ways: found.length, fewest: found.length ? Math.min(...found.map((f) => f.n)) : null, sample: found.slice(0, 2).map((f) => f.c), seedKinds };
}
const steps = (h) => h.steps.map((s) => [s.c, s.r]);
const out = { designs: [], built: {}, backs: {} };
for (const D of DESIGNS) {
  const level = core.parseLevel(D.def);
  const o = { id: D.def.id, pudding: level.pudding, roads: [], wrong: [] };
  for (const road of D.roads) {
    const r = go(level, road.placed);
    const need = road.placed.map((gd, i) => {
      if (road.seed && D.def.spare && i === road.placed.length - 1) return true;   // a first level's seed road: its last is the spare
      const x = go(level, road.placed.filter((_, j) => j !== i));
      return x.home < 5 || x.bad.length > 0;   // not all home, or another gadget no longer fits
    });
    o.roads.push({ name: road.name, bad: r.bad, home: r.home, outs: r.outs, rows: r.rows, per: r.per, gadgets: road.placed.length, seed: r.seed, need,
      kinds: used(level, r.placed), path: steps(r.res.hamsters[0]), pudPath: level.pudding !== null ? steps(r.res.hamsters[level.pudding]) : null, ticks: r.res.ticks });
  }
  for (const w of D.wrong) {
    const r = go(level, w.placed);
    const x = { name: w.name, bad: r.bad, home: r.home, outs: r.outs, ticks: r.res.ticks };
    if (w.pudOnly) x.nibbles = go(core.parseLevel({ ...D.def, pudding: null }), w.placed).home;   // with Pudding made a Nibble
    o.wrong.push(x);
  }
  if (D.search) o.search = pathSearch(level, D.search);
  if (D.seedNeeds) o.seedSearch = pathSearch(level, D.floor[1]);   // D-218: every way home with the seed, up to the floor
  if (D.def.new === 'button') { const nb = core.parseLevel({ ...D.def, parts: [] }); o.noButton = { answers: D.roads.map((rd) => go(nb, rd.placed).home), search: pathSearch(nb, D.floor[1]) }; }
  out.designs.push(o);
}
for (const id of ['L13b', 'L14b']) out.built[id] = LEVELS.find((d) => d.id === id);
// the faded backdrops against the looks now: the same leaf shapes (sorted), the busy ones in one group at 40%
const leaves = (svg) => (svg.match(/<(path|rect|line|circle|ellipse|polygon|polyline)\b[^>]*>/g) || []).sort();
for (const [name, now, quiet] of [['picnic', art.__picnicArt, art.picnicQ1], ['playground', art.__playgroundArt, art.playgroundQ1]]) {
  const a = now(1440), b = quiet(1440);
  const m = b.match(new RegExp(`<g[^>]*opacity="([0-9.]+)" data-quiet="${name}"`));
  out.backs[name] = { same: JSON.stringify(leaves(a)) === JSON.stringify(leaves(b)), n: leaves(a).length, opacity: m ? Number(m[1]) : null, differ: a !== b };
}
console.log(JSON.stringify(out));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    # the scratch art.js: the faded looks appended, drawn in place of the looks now unless window.__parkLook says 'now'
    art = os.path.join(gdir, 'art.js')
    src = open(art).read()
    for old, new in [
        ("if (name === 'picnic') return g(picnicArt(w), '', ' data-back=\"picnic\"');",
         "if (name === 'picnic') return g((globalThis.__parkLook === 'now' ? picnicArt : picnicQ1)(w), '', ' data-back=\"picnic\"');"),
        ("if (name === 'playground') return g(playgroundArt(w), '', ' data-back=\"playground\"');",
         "if (name === 'playground') return g((globalThis.__parkLook === 'now' ? playgroundArt : playgroundQ1)(w), '', ' data-back=\"playground\"');"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    mock = open(os.path.join(HERE, 'mock_hamster_park_quiet.js')).read()
    if FAULT == 5:
        mock = mock.replace('const PARK_QUIET = 0.4;', 'const PARK_QUIET = 1;')
    open(art, 'w').write(src + '\n' + mock + '\nexport { picnicQ1, playgroundQ1, picnicArt as __picnicArt, playgroundArt as __playgroundArt };\n')
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, 'file://' + os.path.join(gdir, 'core.js'), 'file://' + os.path.join(gdir, 'levels.js'),
                        'file://' + art, json.dumps([{k: d[k] for k in ('def', 'roads', 'wrong', 'search', 'floor', 'seedNeeds') if k in d} for d in DESIGNS])],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    ALL = json.loads(r.stdout)
    # build_preview.py reads only `export function` and the like: the checks' export line goes before the build
    open(art, 'w').write(src + '\n' + mock + '\n')
    RES = {o['id']: o for o in ALL['designs']}
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
        check(R['home'] == 5, f"{tag}: all five home ({' '.join(R['outs'])})")
        n = R['gadgets'] - (1 if rd.get('seed') and D['def'].get('spare') else 0)
        if fl:
            check(len(R['rows']) >= fl[0] and n >= fl[1], f"{tag}: the floor, {len(R['rows'])} heights {R['rows']} (at least {fl[0]}) and {n} gadgets (at least {fl[1]})")
        check(all(R['need']), f'{tag}: every gadget needed (take one away: not all five home)')
        if rd.get('seed'):
            check(R['seed'], f'{tag}: takes the golden seed')
        if D.get('spread') and not rd.get('seed'):
            walks = sorted(R['per'].values(), reverse=True)
            tot = sum(walks)
            check(len(walks) >= 3 and walks[2] / tot >= D['spread'],
                  f"{tag}: the third height walked for much of the road: hamster 1's walking squares by height {R['per']}, the third most {walks[2] if len(walks) > 2 else 0} of {tot} (at least {D['spread']:.0%})")
    right = o['roads'] if D['def'].get('twin') else [R for rd, R in zip(D['roads'], o['roads']) if not rd.get('seed')]
    ks = {R['kinds'] for R in right}
    check(len(right) >= D['roadsMin'] and len(ks) == len(right), f"level {lv}: {len(right)} right roads (at least {D['roadsMin']}), each its own gadget kinds {sorted(ks)}")
    if D['def'].get('twin'):
        check(any(R['seed'] for R in o['roads']), f'level {lv}: one road takes the seed')
    else:
        check(not any(R['seed'] for R in right) and all(R['seed'] for rd, R in zip(D['roads'], o['roads']) if rd.get('seed')), f'level {lv}: the seed needs the spare (the roads alone take none)')
    s = o['search']
    check(s['fewest'] is None, f"level {lv}: no way home with {D['search']} gadgets or fewer, along the paths ({s['tried']:,} placements tried; found {s['ways']} {s['sample']})")
    if 'seedSearch' in o:
        ss = o['seedSearch']
        skip = [k for k in ss['seedKinds'] if not set(k.split('+')) & set(D['seedNeeds'])]
        check(ss['seedKinds'] and not skip, f"level {lv} (D-218): every way home with the seed up to {D['floor'][1]} gadgets along the paths ({ss['tried']:,} tried, {ss['ways']} home) uses the spoon or the bridge: {ss['seedKinds']}{' NOT ' + str(skip) if skip else ''}")
    check(len(D['wrong']) >= 2, f"level {lv}: {len(D['wrong'])} wrong roads (at least 2)")
    for w, W in zip(D['wrong'], o['wrong']):
        check(not W['bad'] and W['home'] < 5, f"level {lv} wrong road '{W['name']}': {W['home']} of 5 home ({' '.join(W['outs'])})")
        if w.get('pudOnly'):
            check(o['pudding'] is not None and W['home'] == 4 and W['outs'][o['pudding']] != 'home' and W.get('nibbles') == 5,
                  f"level {lv}: only Pudding is left out on that road; with Pudding made a Nibble, {W.get('nibbles')} of 5 home")
    if 'noButton' in o:
        nb = o['noButton']
        check(max(nb['answers']) < 5 and nb['search']['fewest'] is None, f"level {lv}: without the button the roads get {nb['answers']} home and no way home with up to {D['floor'][1]} gadgets along the paths ({nb['search']['tried']:,} tried)")
for name, B in ALL['backs'].items():
    check(B['same'] and B['differ'] and B['opacity'] == 0.4, f"the {name} faded: the same {B['n']} shapes as now (colours and outlines kept), the busy ones in one group at {B['opacity']} (40% wanted)")


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
    # the backdrops of levels 25 to 28 mid-run, as now and faded: 25 and 27 on the new designs, 26 and 28 as built
    backs = [('L13', DESIGNS[2]['def'], DESIGNS[2]['roads'][0]['placed'], RES['L13']['roads'][0]['ticks']),
             ('L13b', ALL['built']['L13b'], BUILT['L13b'], 160), ('L14', DESIGNS[3]['def'], DESIGNS[3]['roads'][0]['placed'], RES['L14']['roads'][0]['ticks']),
             ('L14b', ALL['built']['L14b'], BUILT['L14b'], 200)]
    for look in ['now', 'faded']:
        pg.evaluate(f'globalThis.__parkLook = "{look}"')
        for lid, d, placed, ticks in backs:
            play(pg, d, placed, f'back {lid} {look}', ticks)
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 6:
    del SHOTS[next(iter(SHOTS))]
want = sum(2 * len(D['roads']) + sum(1 for w in D['wrong'] if w.get('show')) for D in DESIGNS) + 8
check(len(SHOTS) == want and all(len(v) > 15000 for v in SHOTS.values()), f'{want} screenshots, none blank ({len(SHOTS)})')
check(SHOTS.get('back L13 now run') != SHOTS.get('back L13 faded run'), 'the picnic as now and faded are different pictures')


# ---------------------------------------------------------------- the page
def img(b, alt, cls='shot', kind='jpeg'):
    if b is None:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/{kind};base64,{base64.b64encode(b).decode()}" alt="{alt}" class="{cls}">'


INK = '#1B1446'
NAMES = {'ramp': 'ramp', 'rampL': 'left ramp', 'bouncer': 'bouncer', 'floater': 'dandelion', 'bridge': 'bridge', 'tube': 'tube', 'catapult': 'spoon',
         'signpost': 'signpost', 'stick': 'worn stick'}
NOW = {22: 'Two roads of 2 and 3 gadgets on 2 and 3 heights; one wrong road.',
       24: 'Two roads of 4 and 5 gadgets, each on 4 heights; one wrong road.',
       25: 'One road of 5 gadgets on 3 heights (and the spare for the seed); two wrong roads.',
       27: 'One road of 5 gadgets on 4 heights (and the spare for the seed); one wrong road.'}
# last night's page (v0.1, 405fe47), counted from its DESIGNS: right roads, gadgets a road (fewest to most), heights a road
# (fewest), wrong roads; for the table at the top
V01 = {22: (2, '2 to 3', 2, 1), 24: (2, '4 to 5', 4, 1), 25: (1, '5', 3, 2), 27: (1, '5', 4, 1)}


def tray(t):
    return ', '.join(f"{n} {NAMES[k]}{'s' if n > 1 else ''}" for k, n in t.items())


def gadlist(placed):
    return ' · '.join(f'{i + 1} {NAMES[k]}' for i, (k, c, r) in enumerate(placed))


secs = []
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv, fl, d = D['level'], D['floor'], D['def']
    pud = f" Pudding is {['first', 'second', 'third', 'fourth', 'fifth'][d['pudding']]} in the line." if d.get('pudding') is not None else ''
    h = f'<section><h2>Level {lv}: {d["name"]}</h2><p class="meta">{len(d["rows"][0])} × {len(d["rows"])} · tray: {tray(d["tray"])}' \
        + (f' (the spare: {NAMES[d["spare"]]})' if d.get('spare') else '') + (' · a twin, pick your road' if d.get('twin') else '') + f'.{pud}</p>' \
        + f'<p class="now"><b>Last night\'s page:</b> {NOW[lv]}</p><p><b>Now:</b> {D["idea"]}</p>'
    h += '<table><tr><th>Road</th><th>Heights walked</th><th>Gadgets</th></tr>'
    for rd, R in zip(D['roads'], o['roads']):
        n = R['gadgets'] - (1 if rd.get('seed') and d.get('spare') else 0)
        h += f'<tr><td><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</td><td>{len(R["rows"])}' + (f' (at least {fl[0]})' if fl else '') \
             + f'</td><td>{n}' + (f' (at least {fl[1]})' if fl else '') + '</td></tr>'
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
    if 'noButton' in o:
        h += '<li><b>Without the button</b> (as if it weren\'t there): no way home.</li>'
    h += '</ul>'
    h += '<div class="row">' + ''.join(f'<figure>{img(SHOTS.get(o["id"] + " " + w["name"] + " run"), w["name"])}<figcaption>{w["name"]}, mid-run</figcaption></figure>'
                                       for w in D['wrong'] if w.get('show')) + '</div>'
    chk = ['every road gets all five home', 'every gadget is needed', 'each wrong road fails']
    chk.append(f'no way home with {D["search"]} gadgets or fewer ({o["search"]["tried"]:,} placements tried along the hamsters\' paths)')
    if 'seedSearch' in o:
        chk.append(f'every way home with the seed found up to {D["floor"][1]} gadgets ({o["seedSearch"]["ways"]} ways home in all) uses the spoon or a bridge')
    if 'noButton' in o:
        chk.append(f'without the button, no way home with up to {D["floor"][1]} gadgets')
    for w, W in zip(D['wrong'], o['wrong']):
        if w.get('pudOnly'):
            chk.append(f'with Pudding made a Nibble, "{w["name"]}" gets all {W.get("nibbles")} home')
    if D.get('spread'):
        for rd, R in zip(D['roads'], o['roads']):
            if not rd.get('seed'):
                chk.append(f'{rd["name"]}: hamster 1 walks ' + ', '.join(f'{v} squares on row {k}' for k, v in sorted(R['per'].items(), key=lambda kv: -kv[1])))
    h += f'<p class="chk">Checked with the game\'s own rules: {"; ".join(chk)}.</p></section>'
    secs.append(h)

summ = ('<section><h2>One notch up</h2><p>You said the levels were still too linear and simple: more gadgets, more heights, more right '
        'and wrong roads. My reading of one notch (for you to confirm, Q-088): every road at least one more gadget and one more height '
        'than last night\'s, one more right road on each level, and at least two tempting wrong roads on each, shown failing below.</p>'
        '<table><tr><th>Level</th><th>Right roads</th><th>Gadgets a road</th><th>Heights a road (fewest)</th><th>Wrong roads</th></tr>')
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv = D['level']
    right = [(rd, R) for rd, R in zip(D['roads'], o['roads']) if D['def'].get('twin') or not rd.get('seed')]
    gs = sorted(R['gadgets'] for rd, R in right)
    a = V01[lv]
    summ += (f'<tr><td>{lv}</td><td>{a[0]} → <b>{len(right)}</b></td><td>{a[1]} → <b>{gs[0]}{"" if gs[0] == gs[-1] else " to " + str(gs[-1])}</b></td>'
             f'<td>{a[2]} → <b>{min(len(R["rows"]) for rd, R in right)}</b></td><td>{a[3]} → <b>{len(D["wrong"])}</b></td></tr>')
summ += ('</table><p>One thing to know: levels 26 and 28 (kept on 23 Nov) now have fewer gadgets a road than 25 and 27 before them '
         '(26: 4 and 6; 28: 8 each, but on a far bigger tray). I\'ve left them as they are; whether to raise them too is Q-089.</p></section>')
bk = '<section><h2>The picnic and the playground faded to 40% (feedback item 13)</h2><p>As the climbing frame\'s Q1: the same shapes, colours and outlines, with the tree, bunting, blankets, teapots, cups, swings and slides at 40%. The sky, hill, bushes, robin, ball and bird stay as now. Levels 25 and 27 on their new designs; 26 and 28 as built.</p>'
for lid, lv in [('L13', 25), ('L13b', 26), ('L14', 27), ('L14b', 28)]:
    bk += f'<h3>Level {lv}</h3><div class="row"><figure>{img(SHOTS.get(f"back {lid} now run"), f"level {lv} as now")}<figcaption>as now</figcaption></figure>' \
          + f'<figure>{img(SHOTS.get(f"back {lid} faded run"), f"level {lv} faded")}<figcaption>faded to 40%</figcaption></figure></div>'
bk += '</section>'

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: levels 22, 24, 25 and 27 again</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1340px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:20px;margin:30px 0 4px;padding-top:10px;border-top:3px solid {INK}22}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:12px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:10px}} img.shot{{width:640px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle}}
.meta,.gl,.chk,.stamp,.now{{font-size:14px}} .chk{{color:#2E6B3A}} .stamp{{color:#666}} .miss{{color:#c00}} .now{{color:#555}}
@media (prefers-color-scheme: dark){{body{{background:#17132E;color:#F3EEFF}} figure,table{{background:#231D45;border-color:#ffffff22}} .chk{{color:#8FD49C}} .stamp,.now{{color:#BBB}}}}
</style></head><body>
<h1>Hamster Highway: levels 22, 24, 25 and 27 again, and the picnic and playground faded</h1>
<p class="stamp">mock_hamster_step17c_levels.py 0.2 · 24 Nov · step 17c (i), feedback items 10 to 14 · drawn by the real game with each road put down by taps; nothing is built yet. The whole board is shown at once here; in the game the window still shows 16 squares across and slides. Headless Chromium stands in for a PC window.</p>
<p>The numbers on each board match the gadget list under each road. Every road was run with the game's own rules.</p>
{summ}{''.join(secs)}{bk}
<section><h2>What I'd like from you</h2><p>A yes or no for each of the four levels (or what to change, or another notch), for the two faded backdrops, and for my reading of one notch (Q-088) and levels 26 and 28 (Q-089). Then I build them test-first as preview 22.</p></section>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
