"""Hamster Highway step 17b (i), the sketch page (D-213): levels 25 to 28 designed again to D-212's floor, and looks
for Pudding's own picture in the hamster counter (feedback item 9, D-214), for Rob's yes or no before building.
Version 0.1 (22 Nov).

The four designs below (DESIGNS) are Claude's, proposed: the ids, names, places and backdrops of levels.js 1.10's
L13, L13b, L14 and L14b are kept (saved progress stays valid); the boards, trays, parts and answers are new. They are the
masters until levels.js is rebuilt from them in step 17b (ii).

Checked with core.js's own run() (the repo's HEAD, unchanged since 8ff1fe6), each road its gadgets in order:
  - every gadget fits where it goes, in that order; all five hamsters get home;
  - D-212's floor: the floor heights walked (rows of 'walk' steps, all five hamsters, as measure_hamster_floor.py 0.1
    counts) and the gadgets placed, at least: 25 3 and 4; 26 every road 3 and 4, the level 4 heights; 27 4 and 4;
    28 every road 4 and 5;
  - each gadget is needed: take any one away and not all five get home (a seed road's spare excepted);
  - a twin has at least 2 roads, each with its own set of gadget kinds (the solver's way of telling roads apart);
  - no way home with fewer gadgets than the floor, by a search along the hamsters' paths: from the empty board, put
    any gadget left in the tray on any square near where a hamster goes, run, and again, up to the floor less one. A
    stand-in for solver 1.8 (step 17b (ii)): it tries only squares near a path, not every placement;
  - the new things: level 25's answer fails without the button and the search finds no way without it; level 27's
    bouncer road leaves only Pudding behind, and with Pudding made a Nibble the search finds more ways home; level
    28's trap (two worn sticks stacked in the last gap) leaves Pudding and everyone behind it in the pond, Pudding
    snapping both, and the same sticks get five Nibbles home;
  - each wrong road shown on the page doesn't get all five home.
Then a scratch worktree of HEAD is drawn by the real game (built with build_preview.py, headless Chromium standing in for
a PC window, 1366 x 650): every road put down by taps through the test hook __test.openBoard(def), once just after GO
with the road marked (hamster 1's path, and Pudding's where it differs), once mid-run. The scratch copy shows the
whole board at once (VIEW 24 squares across, as the planned overview might): the real game shows 16 across and slides.
For the counter, the scratch copy's renderCount() draws each head with mock_hamster_counter_looks.js 0.1's countHead():
four looks (now, C1, C2, C3) on level 27 mid-run, two hamsters home.

Checks (exit 1 if one fails): those above; every road drawn on the PC and its run started; the screenshots all there,
none blank; the four counter looks drawn and four different drawings; the game logged no errors; the page names no
web address. --fault N plants a fault the checks must catch: 1 a web address in the page; 2 level 25's road without
its floater; 3 level 26 without the hamper's handle (13,4), which lets a bouncer under it make a 3-gadget road;
4 counter look C2 drawn as C1; 5 level 28 without Pudding; 6 a screenshot left out.

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step17b_levels.py OUT.html [--fault N]
"""
import base64, copy, functools, http.server, json, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-step17b-levels.html'
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


# ---------------------------------------------------------------- the designs (Claude's, proposed, 22 Nov)
CORAL, BLUE, CARAMEL = '#E8594A', '#2F7DD3', '#D9944A'
DESIGNS = [
    {'def': {'id': 'L13', 'name': 'Lunchbox drawbridge', 'room': 'park', 'spot': 'picnic', 'back': 'picnic', 'new': 'button',
             'tray': {'ramp': 2, 'bouncer': 1, 'floater': 1, 'bridge': 1}, 'spare': 'ramp',
             'parts': [{'kind': 'button', 'c': 9, 'r': 3, 'lid': [[12, 8], [13, 8], [14, 8]]}],
             'rows': board(20, 9, [(0, 4, 4, 4), (6, 11, 4, 4), (3, 8, 7, 7), (0, 11, 8, 8), (15, 16, 8, 8), (18, 19, 8, 8)],
                           {'S': (0, 7), 'G': (19, 7), '*': (16, 6)})},
     'level': 25, 'floor': (3, 4), 'search': 3,
     'idea': 'The button stays simple: on the cake stand, in the way, and its lid is the only way over the pond. The rest is a climb and a drop: up the ramp onto the hamper, a bounce up onto the cake stand (the picnic table\'s top stops a bounce any sooner), the button, the dandelion down onto the lid, a bridge over the last gap.',
     'roads': [{'name': 'The road', 'colour': CORAL,
                'placed': [['ramp', 2, 7], ['bouncer', 5, 6], ['floater', 10, 3], ['bridge', 17, 8]],
                'words': 'ramp onto the hamper, bounce up onto the cake stand, press the button (the lunchbox lid drops over the pond), pick up the dandelion, float down onto the lid, a bridge over the gap, home'},
               {'name': 'With the seed', 'colour': CORAL, 'seed': True,
                'placed': [['ramp', 2, 7], ['bouncer', 5, 6], ['floater', 10, 3], ['bridge', 17, 8], ['ramp', 15, 7]],
                'words': 'the same, with the spare ramp before the gap: up and over it for the seed'}],
     'wrong': [{'name': 'No bounce up to the cake stand', 'placed': [['ramp', 2, 7], ['floater', 10, 3], ['bridge', 17, 8]],
                'words': 'along the hamper and into the pond: nobody pressed the button'}]},
    {'def': {'id': 'L13b', 'name': 'Lunch is served', 'room': 'park', 'spot': 'picnic2', 'back': 'picnic', 'new': None, 'twin': 'L13', 'roads': 2,
             'tray': {'ramp': 1, 'bouncer': 1, 'bridge': 2, 'catapult': 1, 'signpost': 1, 'tube': 3},
             'parts': [{'kind': 'button', 'c': 22, 'r': 5, 'lid': [[17, 6], [18, 6], [19, 6]]}],
             'rows': board(24, 9, [(3, 5, 7, 7), (6, 10, 4, 4), (10, 13, 2, 2), (13, 13, 4, 4), (13, 16, 6, 6), (21, 23, 6, 6), (0, 7, 8, 8), (11, 23, 8, 8)],
                           {'S': (0, 7), 'G': (15, 5), '*': (9, 5)})},
     'level': 26, 'floor': (3, 4), 'levelHeights': 4, 'search': 3,
     'idea': 'Home is on the hamper in the middle, reached from either side. Over the top, or round the back and double back: the back road passes under the table and the hamper, flies over the jam pond, climbs a straw, presses the button at the far end and turns back over the lid it dropped. The parasol and the hamper\'s handle stop the spoon and a bouncer cutting corners.',
     'roads': [{'name': 'Road A, over the table', 'colour': CORAL,
                'placed': [['ramp', 2, 7], ['bouncer', 5, 6], ['bridge', 11, 4], ['bridge', 12, 4]],
                'words': 'ramp onto the bench, bounce up onto the table, two bridges under the parasol to the hamper\'s handle, hop down, home'},
               {'name': 'Road B, round the back', 'colour': BLUE, 'seed': True,
                'placed': [['ramp', 2, 7], ['catapult', 7, 7], ['tube', 20, 7], ['tube', 20, 6], ['tube', 20, 5], ['signpost', 23, 5]],
                'words': 'ramp onto the bench, hop down, the spoon flings them over the jam pond (the seed is in the air), under the table and the hamper, up the straw (three tubes), press the button on the far shelf, the signpost turns them, back over the lid, home'}],
     'wrong': [{'name': 'Road B with no signpost', 'placed': [['ramp', 2, 7], ['catapult', 7, 7], ['tube', 20, 7], ['tube', 20, 6], ['tube', 20, 5]],
                'words': 'they press the button and walk on to the end of the shelf: stuck'}]},
    {'def': {'id': 'L14', 'name': 'Pudding comes to play', 'room': 'park', 'spot': 'playground', 'back': 'playground', 'new': 'pudding', 'pudding': 2,
             'tray': {'bridge': 1, 'catapult': 1, 'ramp': 1, 'floater': 1, 'bouncer': 1}, 'spare': 'bouncer',
             'rows': board(20, 9, [(0, 2, 3, 3), (5, 8, 3, 3), (3, 6, 5, 5), (8, 10, 5, 5), (14, 15, 5, 5), (16, 17, 4, 4), (0, 6, 8, 8), (14, 19, 8, 8)],
                           {'S': (0, 2), 'G': (19, 7), '*': (7, 2)})},
     'level': 27, 'floor': (4, 4), 'search': 3,
     'idea': 'Pudding stays simple: the seed is up on the monkey bars, and a bouncer takes the Nibbles there, but Pudding squashes it and plods on below, so the low road must still be built. The low road is the course: hop down from the top of the slide, a bridge, the spoon over the sandpit pond, a ramp up, the dandelion down to home.',
     'roads': [{'name': 'The road', 'colour': CORAL,
                'placed': [['bridge', 7, 5], ['catapult', 10, 4], ['ramp', 15, 4], ['floater', 16, 3]],
                'words': 'hop down from the slide\'s top, a bridge over the gap, the spoon flings them over the sandpit pond, ramp up, pick up the dandelion and float down, home'},
               {'name': 'With the seed: Pudding plods', 'colour': CORAL, 'seed': True,
                'placed': [['bridge', 7, 5], ['catapult', 10, 4], ['ramp', 15, 4], ['floater', 16, 3], ['bouncer', 4, 4]],
                'words': 'add the spare bouncer: the Nibbles bounce up onto the monkey bars for the seed; Pudding (third) squashes it and walks on over the bridge; they meet again at the spoon'}],
     'wrong': [{'name': 'The bouncer instead of the bridge', 'placed': [['bouncer', 4, 4], ['catapult', 10, 4], ['ramp', 15, 4], ['floater', 16, 3]],
                'words': 'the Nibbles go over the bars and home; Pudding squashes the bouncer and falls into the pond', 'pudOnly': True}]},
    {'def': {'id': 'L14b', 'name': 'Big and small', 'room': 'park', 'spot': 'playground2', 'back': 'playground', 'new': None, 'twin': 'L14', 'roads': 2, 'pudding': 1, 'trap': 'stick',
             'tray': {'ramp': 3, 'tube': 3, 'bridge': 2, 'catapult': 1, 'signpost': 1, 'rampL': 1, 'stick': 2},
             'rows': board(24, 9, [(3, 5, 7, 7), (8, 9, 5, 5), (10, 12, 4, 5), (14, 19, 5, 5), (16, 16, 4, 4), (18, 23, 7, 7), (21, 23, 5, 5), (0, 11, 8, 8), (15, 23, 8, 8)],
                           {'S': (0, 7), 'G': (16, 3), '*': (14, 6)})},
     'level': 28, 'floor': (4, 5), 'search': 4,
     'idea': 'Home is on a little podium at the top of the slide, with a ramp up from either side. Up the climbing frame on the left, or round the sandpit and double back from the right. Pudding is second, and the two worn sticks in the tray are a trap: stacked in the gap before the slide they would carry five Nibbles (the fourth drops onto the lower one and walks on), but Pudding snaps them both.',
     'roads': [{'name': 'Road 1, up the frame', 'colour': CORAL,
                'placed': [['ramp', 2, 7], ['tube', 6, 6], ['tube', 6, 5], ['tube', 6, 4], ['bridge', 7, 5], ['ramp', 9, 4], ['bridge', 13, 4], ['ramp', 15, 4]],
                'words': 'ramp onto the bench, up the tube tunnel, a bridge onto the frame, a ramp onto its top deck, a bridge over the gap and down a step onto the slide\'s top, a ramp up the podium, home'},
               {'name': 'Road 2, round the sandpit', 'colour': BLUE, 'seed': True,
                'placed': [['ramp', 2, 7], ['catapult', 11, 7], ['ramp', 17, 7], ['tube', 20, 6], ['tube', 20, 5], ['tube', 20, 4], ['signpost', 23, 4], ['rampL', 17, 4]],
                'words': 'ramp onto the bench, hop down, under the frame, the spoon flings them over the sandpit (the seed), ramp up the step, up the tube tunnel, the signpost turns them, back along the slide\'s top, the left ramp up the podium, home'}],
     'wrong': [{'name': 'The trap: two worn sticks for the last bridge', 'trap': True,
                'placed': [['ramp', 2, 7], ['tube', 6, 6], ['tube', 6, 5], ['tube', 6, 4], ['bridge', 7, 5], ['ramp', 9, 4], ['stick', 13, 5], ['stick', 13, 4], ['ramp', 15, 4]],
                'words': 'the first Nibble cracks the top stick and gets home; Pudding snaps both and drops into the sandpit pond, and everyone behind falls through the hole'}]},
]
if FAULT == 2:
    DESIGNS[0]['roads'][0]['placed'] = [x for x in DESIGNS[0]['roads'][0]['placed'] if x[0] != 'floater']
if FAULT == 3:
    DESIGNS[1]['def']['rows'] = board(24, 9, [(3, 5, 7, 7), (6, 10, 4, 4), (10, 13, 2, 2), (13, 16, 6, 6), (21, 23, 6, 6), (0, 7, 8, 8), (11, 23, 8, 8)],
                                      {'S': (0, 7), 'G': (15, 5), '*': (9, 5)})
if FAULT == 5:
    DESIGNS[3]['def']['pudding'] = None

# ---------------------------------------------------------------- the scratch worktree: checks with run(), then the game
WT = '/tmp/hh-step17b-levels-wt'
SERVE = '/tmp/hh-step17b-levels-serve'
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
CHECK_JS = r'''
const [coreUrl, designsJson] = process.argv.slice(1);
const core = await import(coreUrl);
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
  return { bad, res, rows: [...rows].sort((a, b) => a - b), outs: res.hamsters.map((h) => h.outcome), home: res.hamsters.filter((h) => h.outcome === 'home').length,
    seed: res.hamsters.some((h) => h.seed), events: res.events.map((e) => ({ kind: e.kind, c: e.c, r: e.r, who: e.who })) };
};
// the search along the hamsters' paths (a stand-in for solver 1.8): every gadget left, on every square near a path
function search(level, depth) {
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
    const near = new Set();
    for (const h of res.hamsters) for (const st of h.steps) {
      const r0 = Math.round(st.r);
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 2; dr++) near.add(core.key(st.c + dc, r0 + dr));
    }
    const left = core.left(level, placed);
    for (const sq of near) {
      const [cc, rr] = sq.split(',').map(Number);
      for (const k of kinds) if ((left[k] || 0) > 0 && core.fits(level, placed, k, cc, rr)) dfs({ ...placed, [sq]: k }, n + 1);
    }
  };
  dfs({}, 0);
  return { tried: seen.size, ways: found.length, fewest: found.length ? Math.min(...found.map((f) => f.n)) : null, sample: found.slice(0, 3).map((f) => f.c) };
}
const out = [];
for (const D of DESIGNS) {
  const level = core.parseLevel(D.def);
  const o = { id: D.def.id, pudding: level.pudding, roads: [], wrong: [] };
  for (const road of D.roads) {
    const r = go(level, road.placed);
    const need = road.placed.map((gd, i) => {
      if (road.seed && D.def.spare && i === road.placed.length - 1) return true;   // a first level's seed road: its last is the spare
      return go(level, road.placed.filter((_, j) => j !== i)).home < 5;
    });
    const steps = (h) => h.steps.map((s) => [s.c, s.r]);
    o.roads.push({ name: road.name, bad: r.bad, home: r.home, outs: r.outs, rows: r.rows, gadgets: road.placed.length, seed: r.seed, need, events: r.events,
      kinds: [...new Set(road.placed.map((x) => x[0]))].sort(), path: steps(r.res.hamsters[0]), pudPath: level.pudding !== null ? steps(r.res.hamsters[level.pudding]) : null,
      ticks: r.res.ticks });
  }
  for (const w of D.wrong) {
    const r = go(level, w.placed);
    const x = { name: w.name, bad: r.bad, home: r.home, outs: r.outs, events: r.events };
    if (w.trap) {
      x.nibbles = go(core.parseLevel({ ...D.def, pudding: null }), w.placed).home;
      x.pudSnaps = level.pudding !== null ? r.events.filter((e) => e.kind === 'snap' && e.who === level.pudding).length : 0;
      x.pudOut = level.pudding !== null ? r.outs[level.pudding] : null;
      x.pudEnd = level.pudding !== null ? r.res.hamsters[level.pudding].end : r.res.ticks;
    }
    o.wrong.push(x);
  }
  o.search = search(level, D.search);
  if (D.def.new === 'button') o.noButton = { answer: go(core.parseLevel({ ...D.def, parts: [] }), D.roads[0].placed).home, search: search(core.parseLevel({ ...D.def, parts: [] }), 5) };
  if (D.def.new === 'pudding') o.asNibble = { asIs: search(level, 4).ways, nibble: search(core.parseLevel({ ...D.def, pudding: null }), 4).ways };
  out.push(o);
}
console.log(JSON.stringify(out));
'''
try:
    gdir = os.path.join(WT, 'games', 'hamster-highway')
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, 'file://' + os.path.join(gdir, 'core.js'), json.dumps([{k: d[k] for k in ('def', 'roads', 'wrong', 'search')} for d in DESIGNS])],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)
    RES = {o['id']: o for o in json.loads(r.stdout)}
    # the scratch copy: the whole board in view, and the counter's looks
    gj = os.path.join(gdir, 'game.js')
    src = open(gj).read()
    count_old = """  for (let i = 0; i < WALKERS; i++) {
    const lit = i < home;
    const p = at(i);
    s += place(g(hamsterHead(), '', lit ? ' class="tiny-hop"' : ''), p.x, p.y + 40 * k, k, 0, lit ? '' : ' opacity="0.3"');
  }"""
    count_new = """  const look = window.__countLook || 'now';
  const got = (S.run && S.run.got) || new Set();
  const pud = S.level.pudding;
  const order = [...Array(WALKERS).keys()];
  if (look === 'C3' && pud !== null) { order.splice(order.indexOf(pud), 1); order.push(pud); }
  order.forEach((who, i) => {
    const lit = look === 'now' ? i < home : got.has(who);
    const p = at(i);
    const apart = look === 'C3' && who === pud ? step * 0.22 : 0;
    s += countHead(look, who === pud, lit, p.x + (side ? 0 : apart), p.y + 40 * k + (side ? apart : 0), k);
  });"""
    for old, new in [
        ('const VIEW = { 7: 12, 8: 14, 9: 16 };', 'const VIEW = { 7: 24, 8: 24, 9: 24 };'),
        ('import { CELL, INK, SUN, CORAL, LOOP, pudding, ', 'import { countHead, CELL, INK, SUN, CORAL, LOOP, pudding, '),
        (count_old, count_new),
        ("layer('count').innerHTML = g(s, '', ' data-hud=\"count\"');", "layer('count').innerHTML = g(s, '', ` data-hud=\"count\" data-look=\"${look}\"`);"),
        ("R.home += 1;", "R.home += 1; (R.got || (R.got = new Set())).add(w.i);"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    open(gj, 'w').write(src)
    art = os.path.join(gdir, 'art.js')
    mock = open(os.path.join(HERE, 'mock_hamster_counter_looks.js')).read()
    if FAULT == 4:
        mock = mock.replace("if (pud && look === 'C2') {", "if (false) {")
    open(art, 'a').write('\n' + mock)
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)

# ---------------------------------------------------------------- the checks with run()
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv, (fh, fg) = D['level'], D['floor']
    for rd, R in zip(D['roads'], o['roads']):
        tag = f"level {lv} ({o['id']}) {R['name']}"
        check(not R['bad'], f'{tag}: every gadget fits, in order' + (f" (not: {R['bad']})" if R['bad'] else ''))
        check(R['home'] == 5, f"{tag}: all five home ({' '.join(R['outs'])})")
        n = R['gadgets'] - (1 if rd.get('seed') and D['def'].get('spare') else 0)
        check(len(R['rows']) >= fh and n >= fg, f"{tag}: the floor, {len(R['rows'])} heights {R['rows']} (at least {fh}) and {n} gadgets (at least {fg})")
        check(all(R['need']), f'{tag}: every gadget needed (take one away: not all five home)')
        if rd.get('seed'):
            check(R['seed'], f'{tag}: takes the golden seed')
    if 'levelHeights' in D:
        allrows = sorted({x for R in o['roads'] for x in R['rows']})
        check(len(allrows) >= D['levelHeights'], f"level {lv}: the level walks {len(allrows)} heights {allrows} (at least {D['levelHeights']})")
    if D['def'].get('twin'):
        ks = {tuple(R['kinds']) for R in o['roads']}
        check(len(o['roads']) >= 2 and len(ks) == len(o['roads']), f'level {lv}: {len(o["roads"])} roads, each its own gadget kinds {sorted(ks)}')
    else:
        check(not o['roads'][0]['seed'] and o['roads'][1]['seed'], f'level {lv}: the seed needs the spare (the road alone takes none)')
    s = o['search']
    check(s['fewest'] is None, f"level {lv}: no way home with {D['search']} gadgets or fewer, searching along the paths ({s['tried']} placements tried; found {s['ways']} {s['sample']})")
    for w, W in zip(D['wrong'], o['wrong']):
        check(not W['bad'] and W['home'] < 5, f"level {lv} wrong road '{W['name']}': {W['home']} of 5 home ({' '.join(W['outs'])})")
        if w.get('pudOnly'):
            check(o['pudding'] is not None and W['home'] == 4 and W['outs'][o['pudding']] != 'home', f'level {lv}: only Pudding is left out on that road')
        if w.get('trap'):
            check(o['pudding'] is not None and W['pudSnaps'] == 2 and W['pudOut'] != 'home' and W['nibbles'] == 5,
                  f"level {lv}: the trap: Pudding snaps both sticks ({W.get('pudSnaps')}) and isn't home; with Pudding a Nibble, {W.get('nibbles')} of 5 home")
    if 'noButton' in o:
        nb = o['noButton']
        check(nb['answer'] < 5 and nb['search']['fewest'] is None, f"level {lv}: without the button the road gets {nb['answer']} home and the search finds no way with up to 5 gadgets")
    if 'asNibble' in o:
        a = o['asNibble']
        check(a['nibble'] > a['asIs'], f"level {lv}: with Pudding made a Nibble, more ways home with up to 4 gadgets ({a['nibble']} against {a['asIs']})")


# ---------------------------------------------------------------- the screenshots, in the real game
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
SHOTS = {}
COUNT = {}
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
        shows = [(rd, R, rd['colour']) for rd, R in zip(D['roads'], o['roads'])] + [(w, W, '#555') for w, W in zip(D['wrong'], o['wrong']) if w.get('trap')]
        for rd, R, colour in shows:
            tag = (o['id'], rd['name'])
            open_board(pg, D['def'])
            for kind, c, r in rd['placed']:
                place(pg, kind, c, r)
            ok = pg.evaluate('Object.keys(__test.state().placed).length') == len(rd['placed'])
            check(ok, f"level {D['level']} {rd['name']}: all {len(rd['placed'])} gadgets put down by taps" + ('' if ok else f" (down: {pg.evaluate('__test.state().placed')})"))
            pg.evaluate('__test.speed(1)')
            tap(pg, '[data-btn="go"]')
            pg.wait_for_timeout(500)
            if 'path' in R:
                pg.evaluate(DRAW_JS, {'ns': SVGNS, 'svg': overlay(R, colour, rd['placed'])})
                SHOTS[tag + ('marked',)] = pg.screenshot(type='jpeg', quality=82)
                pg.evaluate("() => { const g = document.getElementById('mockroad'); if (g) g.remove(); }")
            if rd.get('trap'):   # just as Pudding drops through
                pg.wait_for_timeout(max(0, (R['pudEnd'] - 3) * 200 - 500))
            else:
                pg.wait_for_timeout(int(R['ticks'] * 200 * 0.45))
            check(pg.evaluate('__test.state().mode') != 'build', f"level {D['level']} {rd['name']}: the run started")
            SHOTS[tag + ('run',)] = pg.screenshot(type='jpeg', quality=82)
            tap(pg, '[data-btn="stop"]')   # stop the run, so it can't end on the next board
            pg.wait_for_function('__test.state().mode === "build"', timeout=5000)
    ctx.close()
    # the counter's looks, twice as sharp: level 27's road, two Nibbles home and Pudding (third) still out, then Pudding home
    ctx = br.new_context(viewport={'width': 1366, 'height': 650}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
    D = DESIGNS[2]
    for look in ['now', 'C1', 'C2', 'C3']:
        pg.evaluate(f'window.__countLook = "{look}"')
        open_board(pg, D['def'])
        for kind, c, r in D['roads'][0]['placed']:
            place(pg, kind, c, r)
        pg.evaluate('__test.speed(1)')
        tap(pg, '[data-btn="go"]')
        pg.wait_for_function('__test.state().home >= 2', timeout=30000, polling=50)
        loc = pg.locator('[data-hud="count"]').first
        check(pg.evaluate(f'() => !!document.querySelector(\'[data-look="{look}"]\')') and (look == 'now' or pg.evaluate(f'() => !!document.querySelector(\'[data-pudhead="{look}"]\')')),
              f'counter look {look} drawn')
        COUNT[look] = {'png': loc.screenshot(type='png'), 'svg': loc.inner_html(), 'board': pg.screenshot(type='jpeg', quality=70, scale='css')}
        pg.wait_for_function('__test.state().home >= 3', timeout=30000, polling=50)
        COUNT[look]['png3'] = loc.screenshot(type='png')
        tap(pg, '[data-btn="stop"]')
        pg.wait_for_function('__test.state().mode === "build"', timeout=5000)
    ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
check(len({re.sub(r'class="tiny-hop"| data-(pudhead|look)="\w+"', '', v['svg']) for v in COUNT.values()}) == 4, 'the four counter looks are four different drawings (their names left out)')
if FAULT == 6:
    del SHOTS[next(iter(SHOTS))]
want = sum(2 * len(D['roads']) + sum(1 for w in D['wrong'] if w.get('trap')) for D in DESIGNS)
check(len(SHOTS) == want and all(len(v) > 15000 for v in SHOTS.values()), f'{want} screenshots of the roads, none blank ({len(SHOTS)})')


# ---------------------------------------------------------------- the page
def img(b, alt, cls='shot', kind='jpeg'):
    if b is None:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/{kind};base64,{base64.b64encode(b).decode()}" alt="{alt}" class="{cls}">'


INK = '#1B1446'
NAMES = {'ramp': 'ramp', 'rampL': 'left ramp', 'bouncer': 'bouncer', 'floater': 'dandelion', 'bridge': 'bridge', 'tube': 'tube', 'catapult': 'spoon',
         'signpost': 'signpost', 'stick': 'worn stick'}


def tray(t):
    return ', '.join(f"{n} {NAMES[k]}{'s' if n > 1 else ''}" for k, n in t.items())


def gadlist(placed):
    return ' · '.join(f'{i + 1} {NAMES[k]}' for i, (k, c, r) in enumerate(placed))


secs = []
for D in DESIGNS:
    o = RES[D['def']['id']]
    lv, (fh, fg) = D['level'], D['floor']
    d = D['def']
    pud = f" Pudding is {['first', 'second', 'third', 'fourth', 'fifth'][d['pudding']]} in the line." if d.get('pudding') is not None else ''
    h = f'<section><h2>Level {lv}: {d["name"]}</h2><p class="meta">{len(d["rows"][0])} × {len(d["rows"])} · tray: {tray(d["tray"])}' \
        + (f' (the spare: {NAMES[d["spare"]]})' if d.get('spare') else '') + (' · a twin, pick your road' if d.get('twin') else '') + f'.{pud}</p><p>{D["idea"]}</p>'
    h += '<table><tr><th>Road</th><th>Heights walked</th><th>Gadgets</th></tr>'
    for rd, R in zip(D['roads'], o['roads']):
        n = R['gadgets'] - (1 if rd.get('seed') and d.get('spare') else 0)
        h += f'<tr><td><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</td><td>{len(R["rows"])} (at least {fh})</td><td>{n} (at least {fg})</td></tr>'
    if 'levelHeights' in D:
        h += f'<tr><td>The level, both roads</td><td>{len({x for R in o["roads"] for x in R["rows"]})} (at least {D["levelHeights"]})</td><td></td></tr>'
    h += '</table>'
    for rd, R in zip(D['roads'], o['roads']):
        tag = (o['id'], rd['name'])
        h += f'<h3><span class="dot" style="background:{rd["colour"]}"></span>{rd["name"]}</h3><p>{rd["words"][0].upper() + rd["words"][1:]}.</p><p class="gl">{gadlist(rd["placed"])}</p>'
        h += f'<div class="row"><figure>{img(SHOTS.get(tag + ("marked",)), rd["name"] + ", marked")}<figcaption>just after GO, the road marked' \
             + (' (Pudding\'s own road in caramel dots)' if R['pudPath'] and R['pudPath'] != R['path'] else '') + '</figcaption></figure>' \
             + f'<figure>{img(SHOTS.get(tag + ("run",)), rd["name"] + ", mid-run")}<figcaption>mid-run</figcaption></figure></div>'
    h += '<h3>Wrong roads</h3><ul>'
    for w, W in zip(D['wrong'], o['wrong']):
        h += f'<li><b>{w["name"]}:</b> {w["words"]} ({W["home"]} of 5 home).</li>'
    if 'noButton' in o:
        h += '<li><b>Without the button</b> (as if it weren\'t there): no way home at all.</li>'
    h += '</ul>'
    for w in D['wrong']:
        if w.get('trap'):
            h += f'<figure>{img(SHOTS.get((o["id"], w["name"], "run")), "the trap")}<figcaption>the trap, mid-run</figcaption></figure>'
    s = o['search']
    h += f'<p class="chk">Checked with the game\'s own rules: ' + ('every road gets all five home and meets the floor; every gadget is needed; ' if True else '') \
        + f'no way home with {D["search"]} gadgets or fewer ({s["tried"]:,} placements tried along the hamsters\' paths)' \
        + (f'; with Pudding a Nibble, {o["asNibble"]["nibble"]} ways home with up to 4 gadgets instead of {o["asNibble"]["asIs"]}' if 'asNibble' in o else '') + '.</p></section>'
    secs.append(h)

LOOKS = {'now': ('Now', 'five Nibble faces, lit in order as hamsters get home'),
         'C1': ('C1. Pudding in its place', 'Pudding\'s own face (vanilla, caramel on top) where Pudding is in the line, the same size'),
         'C2': ('C2. In its place, bigger, on a ring', 'Pudding\'s face a fifth bigger, as on the board, on a soft caramel ring'),
         'C3': ('C3. Last, set apart', 'the four Nibbles, then Pudding\'s face a little apart at the end')}
cnt = '<section><h2>Pudding in the hamster counter (feedback item 9)</h2><p>Level 27 mid-run, in the tray (at the side on a PC; along the bottom on a phone). C1 to C3 light each face when <i>that</i> hamster gets home, not in order, so Pudding\'s face lights only for Pudding.</p><div class="row">'
for k, (t, words) in LOOKS.items():
    rec = ' <span class="rec">my pick</span>' if k == 'C2' else ''
    cnt += f'<figure class="cnt"><h3>{t}{rec}</h3><div class="pair">{img(COUNT.get(k, {}).get("png"), t + ", two home", "count", "png")}{img(COUNT.get(k, {}).get("png3"), t + ", three home", "count", "png")}</div><figcaption>{words}. Left: two Nibbles home; right: Pudding home too.</figcaption></figure>'
cnt += f'</div><figure>{img(COUNT.get("C2", {}).get("board"), "C2 in the game")}<figcaption>C2 in the game, the whole screen</figcaption></figure></section>'

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: levels 25 to 28 again</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:{INK};background:#FFF8EE;margin:0;padding:16px;max-width:1340px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:20px;margin:30px 0 4px;padding-top:10px;border-top:3px solid {INK}22}} h3{{font-size:16px;margin:16px 0 4px}}
.row{{display:flex;flex-wrap:wrap;gap:12px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:10px}} img.shot{{width:640px}}
img.count{{height:300px;width:auto}} figure.cnt{{max-width:300px}} figure.cnt h3{{margin:2px 0 6px}} .pair{{display:flex;gap:8px}}
table{{border-collapse:collapse;margin:8px 0;background:#fff}} td,th{{border:1px solid {INK}33;padding:4px 10px;text-align:left;font-size:14px}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle}}
.meta,.gl,.chk,.stamp{{font-size:14px}} .chk{{color:#2E6B3A}} .stamp{{color:#666}} .miss{{color:#c00}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700;font-size:13px}}
</style></head><body>
<h1>Hamster Highway: levels 25 to 28 again, and Pudding in the counter</h1>
<p class="stamp">mock_hamster_step17b_levels.py 0.1 · 22 Nov · step 17b (i), feedback items 5 to 9 · drawn by the real game with each road put down by taps; nothing is built yet. The whole board is shown at once here; in the game the window still shows 16 squares across and slides. Headless Chromium stands in for a PC window.</p>
<p>Each level now climbs and drops more and needs more gadgets, to the floor you agreed (D-212), while the new thing stays simple. The numbers on the board match the gadget list under each road. Every road was run with the game's own rules.</p>
{''.join(secs)}{cnt}
<section><h2>What I'd like from you</h2><p>A yes or no for each level (or what to change), and a pick for the counter. Then I build them test-first as preview 21.</p></section>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page, 'the page names no web address')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
