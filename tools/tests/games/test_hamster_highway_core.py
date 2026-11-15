"""Hamster Highway's pure core, its levels and its boundaries. Version 1.3 (15 Nov).

Changes at v1.3 (D-151, plan A of the house routes): the whole planned route (levels 1 to 5's places, then
house.js's PLAN for levels 6 to 10 and two places kept for later, with its bends over the roof and down the
drainpipe) never crosses itself or runs back along itself, in place of v1.2's "only goes right"; PLAN holds
levels 6 to 10 in order with two later places, and FUTURE is PLAN's places.

Changes at v1.2 (Rob's look at preview 2, D-150): the house's dotted path, through the levels in order and on to
the places kept for later, only ever goes right (never doubles back).

Changes at v1.1 (step 2): levels 4 and 5 (the floater and the tube, D-145) with their golden seeds, each
needing the level's spare gadget (`spare` in levels.js; the counts from solve_hamster_highway.py 1.0, 15 Nov);
and (D-147) progress.js, the saved progress (format 1): fresh, unpack (what the device or
the wrapper hands back, made safe), tried (a GO counts until the level is first done), finished, pack and
nextAt; and progress.js is pure and imports nothing. Version 1.0.1 (15 Nov): renamed with the game, D-146.

Fast, no browser: node runs games/hamster-highway/core.js and levels.js. It checks:
  - every function in core.js: key, parseLevel (and the boards it refuses), terrain, holds, fits,
    fitCells, left and walk;
  - walk() against the sketch model's own outcomes (tools/tests/games/sketch_bridge_builder.py 0.1,
    run 15 Nov, hand-checked then): the sample level and the five first levels (D-136) solved with
    their gadgets, not without any, and not without the level's new gadget (splash, stuck, stuck,
    bonk, stuck), and level 3's route square by square;
  - levels.js: levels 1 to 3 parse, each is solved with its gadgets (put down in an order where each
    fits, D-139) and not without its new one, and each golden seed (D-138) is taken: level 1's on the
    way, level 2's and level 3's only with the spare ramp in a square that fits, the level still solved;
  - placing anywhere it fits (D-139): where each gadget fits on levels 1 to 3, by hand;
  - the boundaries (project rules): core.js, levels.js, art.js and house.js touch no page, clock or
    randomness; core.js, levels.js and art.js import nothing and house.js only art.js; every module
    imports only from its own folder or games/_common/.

Usage, from the repo root:
    python3 -B tools/tests/games/test_hamster_highway_core.py
Exits 1 if a check fails.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
problems = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        problems.append(what)


# The sketch model's levels and its outcomes (sketch_bridge_builder.py 0.1, 15 Nov). Its letters:
# B bridge, R ramp, P bouncer, U floater, T tube.
SKETCH = {
    'sample': (['............', '............', '........###.', '............', '............', 'S......#...G', '###..#######'],
               {(3, 6): 'B', (4, 6): 'B', (6, 5): 'R', (7, 4): 'P', (10, 1): 'U'}, None, 'splash'),
    'level 1': (['............', '............', '............', '............', '............', 'S.........G.', '#####.######'],
                {(5, 6): 'B'}, 'B', 'splash'),
    'level 2': (['............', '............', '............', '............', '..........G.', 'S.......####', '###.########'],
                {(3, 6): 'B', (7, 5): 'R'}, 'R', 'stuck'),
    'level 3': (['............', '............', '............', '......###...', '......###.G.', 'S.....######', '##.#########'],
                {(2, 6): 'B', (5, 5): 'P'}, 'P', 'stuck'),
    'level 4': (['............', 'S...........', '###.##......', '............', '............', '..........G.', '....########'],
                {(3, 2): 'B', (5, 1): 'U'}, 'U', 'bonk'),
    'level 5': (['............', '............', '............', '.........G..', '.......####.', 'S...........', '###.########'],
                {(3, 6): 'B', (6, 5): 'T', (6, 4): 'T', (6, 3): 'T'}, 'T', 'stuck'),
}
KIND = {'B': 'bridge', 'R': 'ramp', 'P': 'bouncer', 'U': 'floater', 'T': 'tube'}
sketch_in = {name: {'rows': rows, 'sol': {f'{c},{r}': KIND[k] for (c, r), k in sol.items()},
                    'new': KIND[new] if new else None} for name, (rows, sol, new, _) in SKETCH.items()}

JS = r'''
const [coreUrl, levelsUrl, sketchJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const out = {};
const P = (rows, id = 'x', tray = {}) => core.parseLevel({ id, rows, tray });
// the sketch model's levels
out.sketch = {};
for (const [name, s] of Object.entries(JSON.parse(sketchJson))) {
  const lv = P(s.rows);
  const without = Object.fromEntries(Object.entries(s.sol).filter(([, k]) => k !== s.new));
  out.sketch[name] = { with: core.walk(lv, s.sol).outcome, none: core.walk(lv, {}).outcome,
                       noNew: s.new ? core.walk(lv, without).outcome : null,
                       noNewEnd: s.new ? (({ steps }) => [steps[steps.length - 1].c, steps[steps.length - 1].r])(core.walk(lv, without)) : null,
                       route: core.walk(lv, s.sol).steps.map((st) => [st.c, st.r, st.act]) };
}
// parseLevel refusals
const refuse = (rows, tray) => { try { core.parseLevel({ id: 'bad', rows, tray }); return 'parsed'; } catch (e) { return e.message; } };
const ok7 = LEVELS[0].rows;
out.refuse = {
  short: refuse(ok7.slice(1)),
  narrow: refuse(ok7.map((r) => r.slice(1))),
  mark: refuse(ok7.map((r, i) => (i === 0 ? 'x' + r.slice(1) : r))),
  twoStarts: refuse(ok7.map((r, i) => (i === 0 ? 'S' + r.slice(1) : r))),
  noHome: refuse(ok7.map((r) => r.replace('G', '.'))),
  twoSeeds: refuse(ok7.map((r, i) => (i === 0 ? '*' + r.slice(1) : r))),
  badTray: refuse(ok7, { rocket: 1 }),
  zeroTray: refuse(ok7, { bridge: 0 }),
};
// levels.js
out.levels = LEVELS.map((d) => {
  const lv = core.parseLevel(d);
  const fitsBy = {};
  for (const k of core.GADGETS) fitsBy[k] = core.fitCells(lv, {}, k);
  return { id: lv.id, start: lv.start, home: lv.home, seed: lv.seed, tray: lv.tray, fitsBy, spare: d.spare || null, new: d.new, room: d.room, spot: d.spot, back: d.back };
});
// placing in order, each where it fits
const placeAll = (lv, list) => {
  const placed = {};
  for (const [k, c, r] of list) {
    if (!core.fits(lv, placed, k, c, r)) return { error: `${k} does not fit at ${c},${r}` };
    placed[core.key(c, r)] = k;
  }
  return { placed };
};
const SOL = {
  L1: { solve: [['bridge', 5, 6]], seed: [] },
  L2: { solve: [['bridge', 3, 6], ['ramp', 7, 5]], seed: [['ramp', 4, 5]] },
  L3: { solve: [['bridge', 2, 6], ['bouncer', 5, 5]], seed: [['ramp', 9, 4]] },
  L4: { solve: [['bridge', 3, 2], ['floater', 5, 1]], seed: [['bridge', 6, 2]] },
  L5: { solve: [['bridge', 3, 6], ['tube', 6, 5], ['tube', 6, 4], ['tube', 6, 3]], seed: [['tube', 6, 2]] },
};
out.play = {};
for (const d of LEVELS) {
  const lv = core.parseLevel(d);
  const s = SOL[lv.id];
  const a = placeAll(lv, s.solve);
  const b = placeAll(lv, [...s.solve, ...s.seed]);
  const withoutNew = Object.fromEntries(Object.entries(a.placed || {}).filter(([, k]) => k !== d.new));
  const ra = a.placed ? core.walk(lv, a.placed) : null;
  const rb = b.placed ? core.walk(lv, b.placed) : null;
  // every square the spare gadget fits, with the level solved: which take the seed home?
  const spare = [];
  if (a.placed && s.seed.length) {
    for (const [c, r] of core.fitCells(lv, a.placed, d.spare)) {
      const res = core.walk(lv, { ...a.placed, [core.key(c, r)]: d.spare });
      if (res.outcome === 'home' && res.seed) spare.push([c, r]);
    }
  }
  out.play[lv.id] = {
    errA: a.error || null, errB: b.error || null,
    solved: ra && ra.outcome, solvedSeed: ra && ra.seed,
    withSeed: rb && rb.outcome, seedTaken: rb && rb.seed,
    noNew: a.placed ? core.walk(lv, withoutNew).outcome : null,
    seedGone: rb ? core.walk(lv, b.placed, false).seed : null,
    leftAfter: a.placed ? core.left(lv, a.placed) : null,
    spare,
  };
}
// terrain, holds, key on level 1
const l1 = core.parseLevel(LEVELS[0]);
const pl = { [core.key(5, 6)]: 'bridge' };
out.terrain = [core.terrain(l1, pl, 5, 6), core.terrain(l1, {}, 5, 6), core.terrain(l1, {}, -1, 0), core.terrain(l1, {}, 0, 7),
               core.terrain(l1, {}, 0, -1), core.terrain(l1, {}, 8, 5), core.terrain(l1, {}, 0, 5), core.terrain(l1, {}, 10, 5)];
out.holds = [core.holds(l1, pl, 5, 6), core.holds(l1, {}, 5, 6), core.holds(l1, {}, 0, 6), core.holds(l1, {}, 8, 5)];
out.key = core.key(3, 6);
out.consts = [core.COLS, core.ROWS, core.GADGETS, core.BIG_FALL, core.BOUNCE];
// no gadget on a gadget, the start, the home or the seed
out.noStack = [core.fits(l1, pl, 'bridge', 5, 6), core.fits(l1, {}, 'ramp', 0, 5), core.fits(l1, {}, 'ramp', 10, 5),
               core.fits(l1, {}, 'ramp', 8, 5), core.fits(l1, {}, 'rocket', 3, 5), core.fits(l1, {}, 'ramp', 12, 5)];
console.log(JSON.stringify(out));
'''

r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), json.dumps(sketch_in)], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    check(False, 'node ran core.js and levels.js')
    sys.exit(1)
out = json.loads(r.stdout)
LV_ROWS = {}
for _line in open(os.path.join(GAME, 'levels.js'), encoding='utf-8').read().split("id: '")[1:]:
    LV_ROWS[_line[:2]] = re.findall(r"'([.#SG*]{12})'", _line)[:7]

# the sketch model's outcomes
for name, (_, _, new, no_new) in SKETCH.items():
    o = out['sketch'][name]
    check(o['with'] == 'home', f'{name} (sketch model): solved with its gadgets ({o["with"]})')
    check(o['none'] == 'splash', f'{name} (sketch model): without any gadget, a splash, as the model ({o["none"]})')
    if new:
        check(o['noNew'] == no_new, f'{name} (sketch model): without its new gadget, {no_new}, as the model ({o["noNew"]})')
want3 = [[0, 5, 'start'], [1, 5, 'walk'], [2, 5, 'walk'], [3, 5, 'walk'], [4, 5, 'walk'], [5, 5, 'walk'], [6, 2, 'bounce'],
         [7, 2, 'walk'], [8, 2, 'walk'], [9, 2, 'walk'], [9, 3, 'fall'], [9, 4, 'fall'], [10, 4, 'walk']]
for name, end in (('level 2', [7, 5]), ('level 3', [5, 5]), ('level 4', [6, 5]), ('level 5', [11, 5])):
    got = out['sketch'][name]['noNewEnd']
    check(got == end, f'{name} (sketch model): without its new gadget they end at {end}, by hand: before the step or wall, where they fall, at the edge ({got})')
check(out['sketch']['level 3']['route'] == want3, 'level 3 (sketch model): the route square by square, by hand (up 3 off the bouncer, one on, a drop of 2)')

# parseLevel refusals
ref = out['refuse']
for name, frag in (('short', 'must be 7 rows of 12'), ('narrow', 'must be 7 rows of 12'), ('mark', 'unknown mark'),
                   ('twoStarts', 'one start and one home'), ('noHome', 'one start and one home'), ('twoSeeds', 'at most one golden seed'),
                   ('badTray', 'bad tray entry'), ('zeroTray', 'bad tray entry')):
    check(frag in ref[name], f'parseLevel refuses a board or tray that is {name} ({ref[name]})')

# levels.js
lv = {x['id']: x for x in out['levels']}
check(list(lv) == ['L1', 'L2', 'L3', 'L4', 'L5'], f'levels.js holds levels 1 to 5, in order ({list(lv)})')
check(lv['L1']['seed'] == [8, 5] and lv['L2']['seed'] == [5, 4] and lv['L3']['seed'] == [10, 3] and lv['L4']['seed'] == [7, 3] and lv['L5']['seed'] == [7, 2],
      'each level has its golden seed where levels.js says')
check([lv[i]['new'] for i in lv] == ['bridge', 'ramp', 'bouncer', 'floater', 'tube'], 'each level brings in one new gadget, in the agreed order (D-136, D-145)')
check([lv[i]['spare'] for i in lv] == [None, 'ramp', 'ramp', 'bridge', 'tube'], 'levels 2 to 5 each name the spare gadget their seed needs')
check(lv['L4']['tray'] == {'bridge': 2, 'floater': 1} and lv['L5']['tray'] == {'bridge': 1, 'tube': 4},
      'the trays: level 4 has 2 bridges and a floater; level 5 a bridge and 4 tubes (one of each a spare for the seed)')
check([(lv[i]['room'], lv[i]['spot'], lv[i]['back']) for i in ('L4', 'L5')] == [('living', 'bookshelf', 'living'), ('bedroom', 'cage', 'bedroom')],
      'level 4 is by the living room\'s bookshelf, level 5 at the bedroom\'s hamster cage, each with its own backdrop (D-140, D-149)')
# the sketch model's boards for levels 4 and 5, with only the golden seed added
check(all(SKETCH[f'level {n}'][0][r] == ''.join('.' if ch == '*' else ch for ch in LV_ROWS[f'L{n}'][r]) for n in (4, 5) for r in range(7)),
      'levels 4 and 5 are the sketch model\'s boards, with only the golden seed added')
check(lv['L3']['home'] == [11, 4], 'level 3\'s home moved to 11,4 for its seed')
check(lv['L1']['tray'] == {'bridge': 1} and lv['L2']['tray'] == {'bridge': 1, 'ramp': 2} and lv['L3']['tray'] == {'bridge': 1, 'bouncer': 1, 'ramp': 1},
      'the trays: 1 bridge; 1 bridge and 2 ramps; 1 bridge, 1 bouncer and 1 ramp')
# where each gadget fits (D-139), by hand
check(lv['L1']['fitsBy']['bridge'] == [[5, 6]], f'level 1: the bridge fits only over the gap ({lv["L1"]["fitsBy"]["bridge"]})')
check(lv['L2']['fitsBy']['bridge'] == [[3, 6]], f'level 2: the bridge fits only over the gap ({lv["L2"]["fitsBy"]["bridge"]})')
check(sorted(lv['L3']['fitsBy']['bridge']) == [[2, 6], [5, 3], [5, 4], [9, 3]],
      f'level 3: a bridge fits over the gap and beside the wall where a hamster would fall ({lv["L3"]["fitsBy"]["bridge"]})')
ramp1 = sorted(lv['L1']['fitsBy']['ramp'])
check(ramp1 == sorted([[c, 5] for c in range(1, 10) if c not in (5, 8)] + [[11, 5]]),
      f'level 1: a ramp fits on every floor square but the start, the home and the seed ({ramp1})')
check(lv['L1']['fitsBy']['ramp'] == lv['L1']['fitsBy']['bouncer'] == lv['L1']['fitsBy']['floater'], 'level 1: a ramp, a bouncer and a floater fit the same squares')
check(len(lv['L1']['fitsBy']['tube']) == 12 * 7 - 11 - 3, f'level 1: a tube fits any empty square: 84 less 11 ground, the start, home and seed ({len(lv["L1"]["fitsBy"]["tube"])})')
for i, (lid, p) in enumerate(out['play'].items(), 1):
    check(p['errA'] is None and p['errB'] is None, f'level {i}: each gadget put down where it fits ({p["errA"] or p["errB"] or "ok"})')
    check(p['solved'] == 'home', f'level {i}: solved with its gadgets ({p["solved"]})')
    check(p['noNew'] != 'home', f'level {i}: not solved without its new gadget ({p["noNew"]})')
    check(p['withSeed'] == 'home' and p['seedTaken'], f'level {i}: the golden seed taken, and still home ({p["withSeed"]}, {p["seedTaken"]})')
    check(p['seedGone'] is False, f'level {i}: once taken, the seed is not taken again')
check(out['play']['L1']['solvedSeed'] is True, 'level 1: the seed is on the way (taken with just the bridge)')
check(all(out['play'][i]['solvedSeed'] is False for i in ('L2', 'L3', 'L4', 'L5')), 'levels 2 to 5: the seed needs the spare gadget')
check(out['play']['L4']['spare'] == [[6, 2]], f'level 4: the spare bridge takes the seed home only beside the ledge, at 6,2, so they float down past it ({out["play"]["L4"]["spare"]})')
check(out['play']['L5']['spare'] == [[6, 2]], f'level 5: the spare tube takes the seed home only on top of the others, at 6,2 ({out["play"]["L5"]["spare"]})')
check(out['play']['L2']['spare'] == [[4, 5], [5, 5]], f'level 2: the spare ramp takes the seed home from 4,5 or 5,5 only ({out["play"]["L2"]["spare"]})')
check(out['play']['L3']['spare'] == [[9, 4], [10, 4]], f'level 3: the spare ramp takes the seed home from 9,4 or 10,4 only ({out["play"]["L3"]["spare"]})')
check(out['play']['L2']['leftAfter'] == {'bridge': 0, 'ramp': 1}, f'left(): level 2 with its two gadgets down leaves one ramp ({out["play"]["L2"]["leftAfter"]})')

# small functions
check(out['terrain'] == ['bridge', '.', None, None, '.', '.', 'S', 'G'], f'terrain(): a bridge, air, off the side, below the bottom, above the top, a seed\'s square, start, home ({out["terrain"]})')
check(out['holds'] == [True, False, True, False], 'holds(): a bridge and ground hold a hamster; air and a seed\'s square do not')
check(out['key'] == '3,6', 'key(3, 6) is "3,6"')
check(out['consts'] == [12, 7, ['bridge', 'ramp', 'bouncer', 'floater', 'tube'], 3, 3], 'the board is 12 x 7; five gadgets; a fall of 3 bonks; a bounce is 3 up')
check(out['noStack'] == [False, False, False, False, False, False], 'nothing fits on a gadget, the start, the home or the seed, nor an unknown gadget, nor off the board')

# progress.js (D-147): what is saved, on the device or through the wrapper, made safe on the way in
PJS = r"""
const [progUrl] = process.argv.slice(1);
const P = await import(progUrl);
const ids = ['L1', 'L2', 'L3'];
const o = {};
o.format = P.FORMAT;
o.fresh = P.fresh();
o.unpack = {
  nul: P.unpack(ids, null), str: P.unpack(ids, 'x'), arr: P.unpack(ids, []), noV: P.unpack(ids, { done: { L1: true } }),
  v2: P.unpack(ids, { v: 2, done: { L1: true } }),
  good: P.unpack(ids, { v: 1, done: { L1: true, L2: true }, seeds: { L1: true }, tries: { L1: 3, L2: 1 } }),
  messy: P.unpack(ids, { v: 1, done: { L1: true, L2: 'yes', L9: true, L3: 1 }, seeds: { L2: true, L1: 1, L3: true }, tries: { L1: 2.6, L2: -4, L3: 'many', L7: 5, L4: 1e9 } }),
  badParts: P.unpack(ids, { v: 1, done: [true], seeds: 'all', tries: null }),
};
let p = P.fresh();
const t1 = P.tried(ids, p, 'L1'); const t2 = P.tried(ids, t1, 'L1');
o.tried = { first: t1.tries, second: t2.tries, same: t1 === p, untouched: p.tries };
const f1 = P.finished(ids, t2, 'L1', false);
const f2 = P.finished(ids, f1, 'L1', true);
const f3 = P.finished(ids, f2, 'L1', false);
o.finished = { f1, f2, f3, afterDone: P.tried(ids, f3, 'L1').tries, otherTries: P.tried(ids, f3, 'L2').tries };
o.unknown = { tried: P.tried(ids, p, 'L9'), finished: P.finished(ids, p, 'L9', true) };
o.pack = P.pack(f2);
o.round = P.unpack(ids, JSON.parse(JSON.stringify(P.pack(f2))));
o.size = JSON.stringify(P.pack({ done: Object.fromEntries(ids.map((i) => [i, true])), seeds: Object.fromEntries(ids.map((i) => [i, true])), tries: Object.fromEntries(ids.map((i) => [i, 9999])) })).length;
o.nextAt = [P.nextAt(ids, P.fresh()), P.nextAt(ids, f2), P.nextAt(ids, { done: { L1: true, L2: true, L3: true }, seeds: {}, tries: {} }),
            P.nextAt(ids, { done: { L2: true }, seeds: {}, tries: {} })];
console.log(JSON.stringify(o));
"""
pp = os.path.join(GAME, 'progress.js')
if not os.path.exists(pp):
    check(False, 'progress.js exists (D-147)')
else:
    r = subprocess.run(['node', '--input-type=module', '-e', PJS, 'file://' + pp], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        check(False, 'node ran progress.js')
    else:
        o = json.loads(r.stdout)
        F = {'done': {}, 'seeds': {}, 'tries': {}}
        check(o['format'] == 1 and o['fresh'] == F, f'progress: format 1; a new player has nothing done, found or tried ({o["fresh"]})')
        u = o['unpack']
        check(all(u[k] == F for k in ('nul', 'str', 'arr', 'noV', 'v2', 'badParts')),
              f'progress: nothing, not an object, a list, no format, another format, or broken parts all start afresh ({[k for k in u if u[k] != F]})')
        check(u['good'] == {'done': {'L1': True, 'L2': True}, 'seeds': {'L1': True}, 'tries': {'L1': 3, 'L2': 1}}, f'progress: a good format 1 entry is read as it is ({u["good"]})')
        check(u['messy'] == {'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 3}},
              f'progress: a messy entry keeps only true marks of known levels, seeds only on done levels, whole tries 0 to 9999 ({u["messy"]})')
        check(o['tried']['first'] == {'L1': 1} and o['tried']['second'] == {'L1': 2} and not o['tried']['same'] and o['tried']['untouched'] == {},
              f'progress: each GO counts a try on a level not yet done, in a new object ({o["tried"]})')
        fi = o['finished']
        check(fi['f1']['done'] == {'L1': True} and fi['f1']['seeds'] == {} and fi['f1']['tries'] == {'L1': 2}, f'progress: a party marks the level done, its tries kept ({fi["f1"]})')
        check(fi['f2']['seeds'] == {'L1': True} and fi['f3']['seeds'] == {'L1': True}, 'progress: a seed found stays found, even after a party without it')
        check(fi['afterDone'] == {'L1': 2} and fi['otherTries'] == {'L1': 2, 'L2': 1}, f'progress: once a level is done, its GO presses no longer count; another level\'s do ({fi["afterDone"]}, {fi["otherTries"]})')
        check(o['unknown']['tried'] == F and o['unknown']['finished'] == F, 'progress: a level that is not in the game changes nothing')
        check(o['pack'] == {'v': 1, 'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 2}} and o['round'] == {k: o['pack'][k] for k in ('done', 'seeds', 'tries')},
              f'progress: pack adds the format version, and unpack reads it back the same ({o["pack"]})')
        check(o['size'] < 20000, f'progress: every level done, found and tried 9999 times is under the 20,000 characters fg:state allows ({o["size"]})')
        check(o['nextAt'] == [0, 1, 2, 0], f'progress: the hamster waits at the first level not done, or the last when all are ({o["nextAt"]})')

# the house's path (D-150, D-151): levels 1 to 5's places, then the plan for 6 to 10 and two places kept for later,
# with its bends; the whole route never crosses itself or runs back along itself
HJS = r"""
const [houseUrl, levelsUrl] = process.argv.slice(1);
const H = await import(houseUrl);
const { LEVELS } = await import(levelsUrl);
const pts = LEVELS.map((d) => H.SPOTS[d.spot]);
for (const p of H.PLAN || []) pts.push(...(p.via || []), p.at);
console.log(JSON.stringify({ pts, plan: (H.PLAN || []).map((p) => [p.name, p.level]), future: H.FUTURE, planAt: (H.PLAN || []).map((p) => p.at) }));
"""
r = subprocess.run(['node', '--input-type=module', '-e', HJS, 'file://' + os.path.join(GAME, 'house.js'), 'file://' + os.path.join(GAME, 'levels.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr)
    check(False, 'node ran house.js')
else:
    h = json.loads(r.stdout)

    def orient(p, q, s):
        v = (q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0])
        return (v > 0) - (v < 0)

    def on(p, q, s):   # s on the segment p-q, given the three are in a line
        return min(p[0], q[0]) <= s[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= s[1] <= max(p[1], q[1])

    def meet(a, b, c, d):
        o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
        if o1 * o2 < 0 and o3 * o4 < 0:
            return True
        return any(o == 0 and on(*seg, pt) for o, seg, pt in ((o1, (a, b), c), (o2, (a, b), d), (o3, (c, d), a), (o4, (c, d), b)))

    segs = list(zip(h['pts'], h['pts'][1:]))
    bad = [(i, j) for i in range(len(segs)) for j in range(i + 1, len(segs))
           if (j == i + 1 and (orient(*segs[i], segs[j][1]) == 0 and on(*segs[i], segs[j][1]) or orient(*segs[j], segs[i][0]) == 0 and on(*segs[j], segs[i][0])))
           or (j > i + 1 and meet(*segs[i], *segs[j]))]
    check(not bad, f'the house\'s whole planned route never crosses itself or runs back along itself (D-151) ({bad or len(segs)} segments)')
    check(h['plan'] == [['bath', 6], ['rafters', 7], ['suitcases', None], ['veg', 8], ['shed', 9], ['pond', None], ['treehouse', 10]],
          f'the plan (D-151, plan A): 6 the bath, 7 the loft\'s rafters, a later place by the suitcases, 8 the veg patch, 9 the shed, a later place at the pond, 10 the treehouse ({h["plan"]})')
    check(h['future'] == h['planAt'], 'the soft places in the house are the plan\'s places, in its order')

# boundaries
IMPURE = re.compile(r'\b(document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|Math\.random|Date|'
                    r'performance|setTimeout|setInterval|requestAnimationFrame|eval|Function|AudioContext|navigator)\b')


def code_only(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return '\n'.join(re.sub(r'(^|[^:])//.*$', r'\1', line) for line in text.split('\n'))


for f in ('core.js', 'levels.js', 'art.js', 'house.js', 'progress.js'):
    p = os.path.join(GAME, f)
    if not os.path.exists(p):
        check(False, f'{f} exists')
        continue
    code = code_only(open(p, encoding='utf-8').read())
    hits = sorted({m.group(0) for m in IMPURE.finditer(code)})
    check(not hits, f'{f} is pure: no page, clock or randomness ({hits})')
    specs = re.findall(r"^\s*import\s.*?from\s+'([^']+)'", code, re.M) + re.findall(r'^\s*import\s+[\'"]([^\'"]+)', code, re.M)
    allowed = ['./art.js'] if f == 'house.js' else []
    check(all(sp in allowed for sp in specs), f'{f} imports {"only art.js" if allowed else "nothing"} ({specs})')
for f in sorted(os.listdir(GAME)):
    if f.endswith('.js'):
        specs = re.findall(r"^\s*import\s.*?from\s+'([^']+)'", open(os.path.join(GAME, f), encoding='utf-8').read(), re.M)
        bad = [s for s in specs if not (s.startswith('./') and '/' not in s[2:]) and not s.startswith('../_common/')]
        check(not bad, f'{f} imports only from its own folder or games/_common/ (GC4) ({bad})')

print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
