"""Hamster Highway's pure core, its levels and its boundaries. Version 1.12 (17 Nov, step 13, the spike).

Changes at v1.12 (step 13: D-185, D-190, D-196; assessment-tall-boards-signpost.md 0.2): worked out by hand before
core.js 1.7, on test boards (the section "step 13, the spike" says what each expects): boards 7 to 9 rows, each its
own height; hamsters walking both ways (a step's dir: -1 facing left; the signpost, falling in too; dizzy at the third
turn at one signpost; the nap back in the start tube; the left edge; the left ramp and a ramp's back either way; a
bouncer, tubes and a teacup lift walked into from the right; a see-saw from the right is a step); the zip-line (its
high and low ends cross-checked on every square of a 16 x 9 board against an exact test of this file's own, in
fractions; placed as a pair, counted once; the slide a column a tick, both ways). Nine gadgets now; TICKS gain turn 2
and zip 1; the cards stay one for each of levels 1 to 20's six gadgets and two parts. And levels 1 to 20 run
byte-identically to the pins written from core.js 1.6 before the change (pin_hamster_runs.py 1.0: 2213 placements).
Two of the new boards first had their start where the walk back left passes it (a nap, not the see-saw or the lift);
the start was moved a row up on both before core.js 1.7 was committed.

Changes at v1.11 (step 10b, D-177 (1), ER-013): every level's answer and spare go down in every order, each where it
fits, but for a bridge or stick put down before the one beside it that holds it up (D-139's build out from the edge,
unchanged: only L7 and L7b, half their orders); before the fix the lower stick first was refused too (3 of L6's 6
orders, 12 of L6b's 24, 105 of L7's 120, 630 of L7b's 720, counted 17 Nov). A worn stick fits above a worn stick,
and a bridge still doesn't (nor a stick above a bridge). The see-saw's card (D-177 (2)): after the tip, a ramp
drops in at the end of the bank before its raised near end, and a third hamster, waiting puzzled there, climbs it,
steps onto the raised end, walks down the plank and home; the loop is 6.5 s (the handoff's 5 to 6.5), its bank a row
higher than the near end at rest, as level 8's, so one ramp reaches the raised end. The dandelion held (D-177 (3),
D-178): a step taken while a hamster holds the dandelion clock says carry: true, from the step after it reaches the
floater's square until it lands; on level 4's answer, by hand: the walk to 6,1 and the four float steps down to 6,5,
not the step onto 5,1 nor any after the landing; every hamster the same; on all 20 answers every float step carries,
each carrying stretch starts just after a floater's square and ends on a landing (or at the trip's end), and nothing
carries where there's no floater. art.js draws two carrying poses: walking feet, arms up and the float pose's
dandelion overhead.

Changes at v1.10 (step 10, D-166, D-169, D-170): the twins of levels 6 to 10 (L6b to L10b), so 20 levels in pairs:
the same checks as v1.9's twins, with the worn sticks still only at the bath and the loft (D-170 (b)) and level 10's
twin a second finale at the treehouse with the see-saw and the lift (D-170 (c)); each twin with parts not solved
without either part. The house: all 20 stops at the sketch's places, house.js's PLAN with both stops of each place
numbered 11 to 20; the timed-model check skips every level with worn sticks or parts, twins too.

Changes at v1.9 (step 9, D-166, D-169, D-170): the twins of levels 1 to 5 (L1b to L5b), each straight after its first
level: same room and backdrop, its stop the first's spot with a 2, nothing new (so no card), only gadget kinds its
first level has, and `more` names the gadget it needs one more of: each is solved with its answer, and not with any
one of its `more` gadgets taken away; its seed needs its spare, in the squares worked out by hand and with the solver
1.4 (16 Nov). The house: the ten stops of levels 1 to 5 and their twins at the step 7 sketch's places (D-169), no two
stops' tap circles overlapping, and the whole route still never crossing itself. progress.js 1.2's opens(): a level is
open if it is the first, the one before it is done, or it or any level after it is done (D-170 (a)). The level rows
are read by each level's whole id (v1.8 read two characters, so L1b would have been taken for L1).

Changes at v1.8 (step 8, D-167, D-168, D-170, D-171): the help cards (cards.js): 8, one for each gadget and part, in
order; captions of 3 to 6 words, the bridge's and lift's as agreed; loops of 3 to 8 s; each level's new gadget has its
card, level 10 none; each card drawn with its caption, a tick, its badge, every svg closed and nothing fetched; every
class it moves by starts hc-, has its rule and keyframes, and no moving group has a transform attribute; cards.js is
pure and imports only art.js. Progress format 2: the cards seen (seen()), format 1 still read with none seen, only the
game's own cards kept, 20 levels and all 8 cards under fg:state's 20,000 characters.

Changes at v1.7 (Rob's look at preview 7, D-163): a teacup takes up to two hamsters, side by side; the second in
waits SHARE_WAIT (4) ticks at the far end before stepping out, so they keep apart. The one-cup and two-cup lift
boards' times worked out again by hand before core.js 1.4: who shares, which seat, the second's wait at the top,
never three in a cup.

Changes at v1.6 (step 4, D-157): levels 9 (the shed, the teacup lift) and 10 (the treehouse finale): solved with
their gadgets, not without their lift (or, on 10, without the see-saw or the lift), the seed only with the spare in
the squares the solver found, and their places in the house. And the teacup lift with two cups on the one-cup test board, worked out by hand
before core.js 1.3: where the second cup is, that one is stopped at each end at once, who rides which cup and
when, the run's length (96 ticks against one cup's 171), a hamster just too late for one cup taking the other,
and the cups a lift may have (1 or 2).

Changes at v1.5 (step 4, D-156, D-158): wider boards (12 to 24 squares, each level its own) and the see-saw on
level 8's board, worked out by hand before core.js 1.2: who waits, when it tips, who it carries, the ends of all
five, without the ramp to its raised end, a lone hamster, and nothing fits in its space.

Changes at v1.4 (step 3, D-143, D-144, D-153, D-154): the worn lolly stick, a sixth gadget that cracks with each
hamster and snaps under the fourth, on level 6's board, by hand; nothing goes on it. Levels 6 (the bath) and 7 (the
loft's rafters): all five home with their sticks (run()), not without, not with any one stick fewer, and the seed
only with the spare ramp in the squares the solver found. Levels are now judged by all five hamsters. And the spike: the timed model, run() and cupRow(): on boards with nothing that moves,
five hamsters go walk()'s way 6 ticks apart and only the first takes the seed; a teacup lift on a test board
(stops 6 ticks, moves a row in 3) carries them one at a time at times worked out by hand, and never takes
on a hamster too late to step in before it moves; the same build
always gives the same result; nothing fits in a lift's shaft; parseLevel refuses a bad part.

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
  return { id: lv.id, cols: lv.cols, start: lv.start, home: lv.home, seed: lv.seed, tray: lv.tray, fitsBy, spare: d.spare || null, new: d.new, room: d.room, spot: d.spot, back: d.back,
           twin: d.twin || null, more: d.more || null, parts: d.parts || [] };
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
  L6: { solve: [['stick', 5, 4], ['stick', 5, 5]], seed: [['ramp', 6, 4]] },
  L7: { solve: [['stick', 5, 3], ['stick', 6, 3], ['stick', 5, 4], ['stick', 6, 4]], seed: [['ramp', 4, 2]] },
  L8: { solve: [['bridge', 3, 5], ['ramp', 5, 4], ['ramp', 10, 3]], seed: [['ramp', 2, 4]] },
  L9: { solve: [['bridge', 3, 5], ['ramp', 5, 4], ['floater', 13, 1]], seed: [['bridge', 15, 2]] },
  L10: { solve: [['bridge', 2, 6], ['bouncer', 4, 5], ['floater', 6, 2], ['tube', 9, 5], ['tube', 9, 4], ['tube', 9, 3], ['ramp', 11, 3]], seed: [['ramp', 20, 1]] },
  // the twins (D-166): Claude's answers, by hand, 16 Nov
  L1b: { solve: [['bridge', 3, 4], ['bridge', 9, 6]], seed: [['bridge', 7, 4]] },
  L2b: { solve: [['bridge', 2, 6], ['ramp', 4, 5], ['ramp', 7, 4]], seed: [['ramp', 5, 4]] },
  L3b: { solve: [['bridge', 1, 6], ['bouncer', 2, 5], ['bouncer', 6, 5]], seed: [['ramp', 10, 4]] },
  L4b: { solve: [['bridge', 2, 2], ['bridge', 5, 2], ['floater', 6, 1]], seed: [['bridge', 8, 2]] },
  L5b: { solve: [['bridge', 1, 6], ['tube', 7, 5], ['tube', 7, 4], ['tube', 7, 3], ['tube', 7, 2]], seed: [['tube', 7, 1]] },
  L6b: { solve: [['stick', 5, 4], ['stick', 5, 5], ['ramp', 7, 4]], seed: [['ramp', 8, 3]] },
  L7b: { solve: [['stick', 5, 3], ['stick', 6, 3], ['stick', 5, 4], ['stick', 6, 4], ['ramp', 8, 3]], seed: [['ramp', 4, 2]] },
  L8b: { solve: [['bridge', 3, 5], ['bridge', 15, 6], ['ramp', 5, 4], ['ramp', 10, 3]], seed: [['ramp', 14, 5]] },
  L9b: { solve: [['bridge', 3, 5], ['ramp', 5, 4], ['floater', 13, 1], ['ramp', 16, 5]], seed: [['bridge', 15, 2]] },
  L10b: { solve: [['bridge', 2, 6], ['bouncer', 4, 5], ['floater', 6, 2], ['tube', 9, 5], ['tube', 9, 4], ['tube', 9, 3], ['ramp', 11, 3], ['ramp', 20, 1]], seed: [['ramp', 15, 4]] },
};
// every order of each level's answer and spare: how many orders put a gadget where it doesn't fit (D-177 (1), ER-013),
// apart from a bridge or stick with nothing beside it yet to hold it up (side: D-139's build out from the edge)
function* perms(a) { if (a.length <= 1) { yield a; return; } for (let i = 0; i < a.length; i++) for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p]; }
out.orders = {};
for (const d of LEVELS) {
  const lv = core.parseLevel(d);
  let n = 0, refused = 0, side = 0, first = null;
  const beside = (placed, c, r) => [-1, 1].some((dc) => ['#', 'bridge', 'stick'].includes(core.terrain(lv, placed, c + dc, r)));
  for (const p of perms([...SOL[d.id].solve, ...SOL[d.id].seed])) {
    n += 1;
    const placed = {};
    for (const [k, c, r] of p) {
      if (core.fits(lv, placed, k, c, r)) { placed[core.key(c, r)] = k; continue; }
      if ((k === 'bridge' || k === 'stick') && !beside(placed, c, r)) side += 1;
      else { refused += 1; first = first || `${k} does not fit at ${c},${r} after ${Object.keys(placed).join(' ')}`; }
      break;
    }
  }
  const bottomFirst = (SOL[d.id].solve.concat(SOL[d.id].seed)).slice().sort((a, b) => b[2] - a[2] || a[1] - b[1]);
  out.orders[d.id] = { n, refused, side, first, bottomFirst: placeAll(lv, bottomFirst).error || null };
}
// all five hamsters (run(), the timed model): 'home' only if every one gets home, else the first other outcome
const five = (lv, placed) => {
  const r = core.run(lv, placed);
  const bad = r.hamsters.find((h) => h.outcome !== 'home');
  return { outcome: bad ? bad.outcome : 'home', seed: r.hamsters.some((h) => h.seed), homes: r.hamsters.filter((h) => h.outcome === 'home').length };
};
// the level with one of its parts taken away (a level's new thing; the finale, which brings in nothing new, both)
const without = (d, kind, placed) => five(core.parseLevel({ ...d, parts: (d.parts || []).filter((p) => p.kind !== kind) }), placed).outcome;
out.play = {};
for (const d of LEVELS) {
  const lv = core.parseLevel(d);
  const s = SOL[lv.id];
  const a = placeAll(lv, s.solve);
  const b = placeAll(lv, [...s.solve, ...s.seed]);
  const withoutNew = Object.fromEntries(Object.entries(a.placed || {}).filter(([, k]) => k !== d.new));
  const ra = a.placed ? five(lv, a.placed) : null;
  const rb = b.placed ? five(lv, b.placed) : null;
  // every square the spare gadget fits, with the level solved: which take the seed home?
  const spare = [];
  if (a.placed && s.seed.length) {
    for (const [c, r] of core.fitCells(lv, a.placed, d.spare)) {
      const res = five(lv, { ...a.placed, [core.key(c, r)]: d.spare });
      if (res.outcome === 'home' && res.seed) spare.push([c, r]);
    }
  }
  out.play[lv.id] = {
    errA: a.error || null, errB: b.error || null,
    solved: ra && ra.outcome, solvedSeed: ra && ra.seed,
    withSeed: rb && rb.outcome, seedTaken: rb && rb.seed,
    noNew: a.placed ? (core.GADGETS.includes(d.new) ? five(lv, withoutNew).outcome : d.new ? without(d, d.new, a.placed)
      : ((d.parts || []).map((p) => without(d, p.kind, a.placed)).find((o) => o === 'home') || 'not home')) : null,
    noParts: a.placed ? (d.parts || []).map((p) => [p.kind, without(d, p.kind, a.placed)]) : null,
    oneStickLess: a.placed ? Object.keys(a.placed).filter((k) => a.placed[k] === 'stick').map((k) => { const p = { ...a.placed }; delete p[k]; return five(lv, p).homes; }) : null,
    seedGone: rb ? core.walk(lv, b.placed, false).seed : null,
    // a twin: its answer with any one of its `more` gadgets taken away
    noMore: a.placed && d.more ? Object.keys(a.placed).filter((k) => a.placed[k] === d.more).map((k) => { const p = { ...a.placed }; delete p[k]; return five(lv, p).outcome; }) : null,
    leftAfter: a.placed ? core.left(lv, a.placed) : null,
    spare,
  };
}
// the dandelion held (D-177 (3)): which steps carry one, on level 4's answer and on every level's answer and spare
{
  const d4 = LEVELS.find((d) => d.id === 'L4');
  const l4 = core.parseLevel(d4);
  const p4 = placeAll(l4, SOL.L4.solve).placed;
  const w4 = core.walk(l4, p4);
  const r4 = core.run(l4, p4);
  out.carry4 = { walk: w4.steps.map((st) => [st.c, st.r, st.act, !!st.carry]), runs: r4.hamsters.map((h) => h.steps.filter((st) => st.carry).map((st) => [st.c, st.r, st.act])) };
  out.carryAll = {};
  for (const d of LEVELS) {
    const lv = core.parseLevel(d);
    const pl = placeAll(lv, [...SOL[d.id].solve, ...SOL[d.id].seed]).placed;
    const fl = new Set(Object.keys(pl).filter((k) => pl[k] === 'floater'));
    const bad = [];
    let carried = 0;
    core.run(lv, pl).hamsters.forEach((h, n) => {
      h.steps.forEach((st, i) => {
        const prev = h.steps[i - 1];
        const next = h.steps[i + 1];
        if (st.carry) carried += 1;
        if (st.act === 'float' && !st.carry) bad.push(`${n}:${i} floats without one`);
        if (st.carry && !(prev && (prev.carry || fl.has(core.key(prev.c, prev.r))))) bad.push(`${n}:${i} starts away from a floater`);
        if (st.carry && next && !next.carry && !st.land && !fl.has(core.key(st.c, st.r))) bad.push(`${n}:${i} stops before landing`);
        if (st.carry && !fl.size) bad.push(`${n}:${i} carries with no floater`);
      });
    });
    out.carryAll[d.id] = { carried, bad: bad.slice(0, 3), floater: fl.size > 0 };
  }
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
    LV_ROWS[_line[:_line.index("'")]] = re.findall(r"'([.#SG*]{12,24})'", _line)[:7]

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
for name, frag in (('short', 'must be 7 to 9 rows of 12'), ('narrow', 'must be 7 to 9 rows of 12'), ('mark', 'unknown mark'),
                   ('twoStarts', 'one start and one home'), ('noHome', 'one start and one home'), ('twoSeeds', 'at most one golden seed'),
                   ('badTray', 'bad tray entry'), ('zeroTray', 'bad tray entry')):
    check(frag in ref[name], f'parseLevel refuses a board or tray that is {name} ({ref[name]})')

# levels.js
lv = {x['id']: x for x in out['levels']}
ORDER = [x for n in range(1, 11) for x in (f'L{n}', f'L{n}b')]
check(list(lv) == ORDER, f'levels.js holds 20 levels: levels 1 to 10, each with its twin straight after it, played in pairs (D-166) ({list(lv)})')
check([lv[i]['seed'] for i in ORDER if i.endswith('b')] == [[8, 3], [6, 3], [11, 3], [9, 3], [8, 1], [8, 2], [5, 1], [15, 4], [16, 2], [15, 3]], 'each twin has its golden seed where levels.js says')
check([i for i in ORDER if 'stick' in lv[i]['tray']] == ['L6', 'L6b', 'L7', 'L7b'], 'worn sticks on the 4 levels at the bath and the loft only (D-154, D-170 (b))')
check(lv['L10b']['parts'] == lv['L10']['parts'] and lv['L10b']['cols'] == 24 and lv['L10b']['back'] == 'treehouse',
      f'level 10\'s twin is a second finale at the treehouse: 24 wide, the see-saw and the lift (D-170 (c))')
TWINS = [i for i in ORDER if lv[i]['twin']]
for t in TWINS:
    f = lv[lv[t]['twin']]
    check(ORDER.index(t) == ORDER.index(f['id']) + 1 and t == f['id'] + 'b',
          f'{t}: the twin of {f["id"]}, its id the first\'s with a b (new ids keep saved progress, D-170), straight after it')
    check((lv[t]['room'], lv[t]['back'], lv[t]['spot']) == (f['room'], f['back'], f['spot'] + '2') and lv[t]['new'] is None,
          f'{t}: in the same room on the same backdrop, at its own stop ({lv[t]["spot"]}), bringing in nothing new (D-166)')
    check(set(lv[t]['tray']) <= set(f['tray']) and lv[t]['more'] in f['tray'] and lv[t]['spare'] in f['tray'],
          f'{t}: only gadget kinds its first level has, one more of the {lv[t]["more"]} (no new kinds early, D-166) ({lv[t]["tray"]} against {f["tray"]})')
check(lv['L1']['seed'] == [8, 5] and lv['L2']['seed'] == [5, 4] and lv['L3']['seed'] == [10, 3] and lv['L4']['seed'] == [7, 3] and lv['L5']['seed'] == [7, 2]
      and lv['L6']['seed'] == [7, 3] and lv['L7']['seed'] == [5, 1] and lv['L8']['seed'] == [3, 3] and lv['L9']['seed'] == [16, 1] and lv['L10']['seed'] == [20, 0],
      'each level has its golden seed where levels.js says')
check([lv[i]['new'] for i in lv if not lv[i]['twin']] == ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'stick', 'seesaw', 'lift', None],
      'each level brings in one new thing, in the agreed order; 6 and 7 the worn stick, 8 the see-saw, 9 the teacup lift; 10, the finale, nothing new (D-136, D-145, D-153, D-156, D-157)')
check([lv[i]['spare'] for i in lv] == [None, 'bridge', 'ramp', 'ramp', 'ramp', 'ramp', 'bridge', 'bridge', 'tube', 'tube', 'ramp', 'ramp', 'ramp', 'ramp', 'ramp', 'ramp', 'bridge', 'bridge', 'ramp', 'ramp'],
      'every level but level 1 names the spare gadget its seed needs, the twins too')
check([(t, lv[t]['tray'], lv[t]['more']) for t in TWINS] == [('L1b', {'bridge': 3}, 'bridge'), ('L2b', {'bridge': 1, 'ramp': 3}, 'ramp'),
      ('L3b', {'bridge': 1, 'bouncer': 2, 'ramp': 1}, 'bouncer'), ('L4b', {'bridge': 3, 'floater': 1}, 'bridge'), ('L5b', {'bridge': 1, 'tube': 5}, 'tube'),
      ('L6b', {'stick': 2, 'ramp': 2}, 'ramp'), ('L7b', {'stick': 4, 'ramp': 2}, 'ramp'), ('L8b', {'bridge': 2, 'ramp': 3}, 'bridge'),
      ('L9b', {'bridge': 2, 'ramp': 2, 'floater': 1}, 'ramp'), ('L10b', {'bridge': 1, 'ramp': 3, 'bouncer': 1, 'floater': 1, 'tube': 3}, 'ramp')],
      'the twins\' trays: 3 bridges (2 gaps and a spare); a bridge and 3 ramps (2 steps and a spare); a bridge, 2 bouncers and a spare ramp; 3 bridges (2 gaps and a spare) and a floater; a bridge and 5 tubes (4 up and a spare); '
      '2 sticks and 2 ramps (a step and a spare); 4 sticks and 2 ramps; 2 bridges (2 gaps) and 3 ramps; 2 bridges (one a spare), 2 ramps (2 steps) and a floater; level 10\'s tray and one more ramp (a step in the treehouse)')
check(lv['L9']['tray'] == {'bridge': 2, 'ramp': 1, 'floater': 1} and lv['L9']['cols'] == 20 and (lv['L9']['room'], lv['L9']['spot'], lv['L9']['back']) == ('garden', 'shed', 'shed'),
      f'level 9: 20 squares wide, 2 bridges (one a spare for the seed), a ramp and a floater, at the shed with its own backdrop ({lv["L9"]["tray"]}, {lv["L9"]["cols"]})')
check(lv['L10']['tray'] == {'bridge': 1, 'ramp': 2, 'bouncer': 1, 'floater': 1, 'tube': 3} and lv['L10']['cols'] == 24
      and (lv['L10']['room'], lv['L10']['spot'], lv['L10']['back']) == ('garden', 'treehouse', 'treehouse'),
      f'level 10: 24 squares wide (D-158), every gadget but the worn stick (D-154), 2 ramps (one a spare for the seed) and 3 tubes, at the treehouse with its own backdrop ({lv["L10"]["tray"]}, {lv["L10"]["cols"]})')
check(lv['L8']['tray'] == {'bridge': 1, 'ramp': 3} and lv['L8']['cols'] == 18 and (lv['L8']['room'], lv['L8']['spot'], lv['L8']['back']) == ('garden', 'veg', 'veg'),
      f'level 8: 18 squares wide (D-158), a bridge and 3 ramps (one a spare for the seed), at the veg patch with its own backdrop ({lv["L8"]["tray"]}, {lv["L8"]["cols"]})')
check(lv['L6']['tray'] == {'stick': 2, 'ramp': 1} and lv['L7']['tray'] == {'stick': 4, 'ramp': 1},
      'the trays: level 6 has 2 worn sticks and a ramp; level 7 4 worn sticks and a ramp (each ramp a spare for the seed)')
check([(lv[i]['room'], lv[i]['spot'], lv[i]['back']) for i in ('L6', 'L7')] == [('bathroom', 'bath', 'bathroom'), ('loft', 'rafters', 'loft')],
      'level 6 is at the bath, level 7 on the loft\'s rafters, each with its own backdrop (D-149, D-151)')
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
for lid, o in out['orders'].items():
    check(o['refused'] == 0 and o['n'] > 0 and o['bottomFirst'] is None,
          f'{lid}: its answer and spare go down in any order, bottom row first too, each where it fits ({o["n"]} orders, {o["refused"]} refused{": " + o["first"] if o["first"] else ""}; D-177 (1), ER-013)')
sided = {lid: (o['side'], o['n']) for lid, o in out['orders'].items() if o['side']}
check(sided == {'L7': (60, 120), 'L7b': (360, 720)},
      f'only on the loft does order matter, and only from the edge: a stick at 6,3 needs the one at 5,3 beside it first, as bridges always have (D-139) ({sided})')
check(out['play']['L1']['solvedSeed'] is True, 'level 1: the seed is on the way (taken with just the bridge)')
check(all(out['play'][i]['solvedSeed'] is False for i in ORDER if i != 'L1'), 'every level but level 1, the twins too: the seed needs the spare gadget')
for t in TWINS:
    nm = out['play'][t]['noMore']
    check(nm and all(o != 'home' for o in nm), f'{t}: not solved with any one of its {lv[t]["more"]}s taken away: it needs the one more (D-166) ({nm})')
check([out['play'][t]['spare'] for t in TWINS] == [[[7, 4]], [[5, 4], [6, 4]], [[10, 4]], [[8, 2]], [[7, 1]], [[8, 3]], [[4, 2]], [[14, 5], [15, 5]], [[15, 2], [15, 3]], [[15, 4]]],
      f'the twins: the spare takes the seed home only beside the ledge at 7,4; from 5,4 or 6,4 on the first step; on the landing at 10,4; beside the ledge at 8,2; on top of the tubes at 7,1; '
      f'on the step at 8,3; before the gap at 4,2; where they land off the see-saw, 14,5 or 15,5; beside the bench, 15,2 or 15,3; where they step off the see-saw, 15,4 ({[out["play"][t]["spare"] for t in TWINS]})')
for t in ('L8b', 'L9b', 'L10b'):
    check(out['play'][t]['noParts'] and all(o != 'home' for _, o in out['play'][t]['noParts']), f'{t}: not solved without its see-saw or lift ({out["play"][t]["noParts"]})')
check(out['play']['L9']['spare'] == [[15, 2]], f'level 9: the spare bridge takes the seed home only at 15,2, the shelf made one longer ({out["play"]["L9"]["spare"]})')
check(out['play']['L10']['spare'] == [[19, 1], [20, 1]], f'level 10: the spare ramp takes the seed home from 19,1 or 20,1 only, in the treehouse ({out["play"]["L10"]["spare"]})')
check(out['play']['L9']['noParts'] == [['lift', 'stuck']], f'level 9: without its teacup lift, stuck at the bench ({out["play"]["L9"]["noParts"]})')
check(out['play']['L10']['noParts'] == [['seesaw', 'splash'], ['lift', 'stuck']], f'level 10: without the see-saw, into the water; without the lift, stuck under the treehouse ({out["play"]["L10"]["noParts"]})')
check(out['play']['L8']['spare'] == [[2, 4], [3, 4]], f'level 8: the spare ramp takes the seed home from 2,4 or 3,4 (on the bridge) only, at the first gap ({out["play"]["L8"]["spare"]})')
check(out['play']['L6']['spare'] == [[6, 4], [7, 4]], f'level 6: the spare ramp takes the seed home from 6,4 or 7,4 only, past the bath ({out["play"]["L6"]["spare"]})')
check(out['play']['L7']['spare'] == [[4, 2]], f'level 7: the spare ramp takes the seed home only from 4,2, just before the gap ({out["play"]["L7"]["spare"]})')
check(out['play']['L6']['oneStickLess'] == [3, 3] and all(n < 5 for n in out['play']['L7']['oneStickLess']) and len(out['play']['L7']['oneStickLess']) == 4,
      f'levels 6 and 7: take away any one stick and not all five get home (the five hamsters matter, D-143) ({out["play"]["L6"]["oneStickLess"]}, {out["play"]["L7"]["oneStickLess"]})')
check(out['play']['L4']['spare'] == [[6, 2]], f'level 4: the spare bridge takes the seed home only beside the ledge, at 6,2, so they float down past it ({out["play"]["L4"]["spare"]})')
check(out['play']['L5']['spare'] == [[6, 2]], f'level 5: the spare tube takes the seed home only on top of the others, at 6,2 ({out["play"]["L5"]["spare"]})')
check(out['play']['L2']['spare'] == [[4, 5], [5, 5]], f'level 2: the spare ramp takes the seed home from 4,5 or 5,5 only ({out["play"]["L2"]["spare"]})')
check(out['play']['L3']['spare'] == [[9, 4], [10, 4]], f'level 3: the spare ramp takes the seed home from 9,4 or 10,4 only ({out["play"]["L3"]["spare"]})')
check(out['play']['L2']['leftAfter'] == {'bridge': 0, 'ramp': 1}, f'left(): level 2 with its two gadgets down leaves one ramp ({out["play"]["L2"]["leftAfter"]})')

# the dandelion held (D-177 (3), D-178), by hand on level 4's answer (bridge 3,2, floater 5,1)
want4 = [[0, 1, 'start', False], [1, 1, 'walk', False], [2, 1, 'walk', False], [3, 1, 'walk', False], [4, 1, 'walk', False], [5, 1, 'walk', False],
         [6, 1, 'walk', True], [6, 2, 'float', True], [6, 3, 'float', True], [6, 4, 'float', True], [6, 5, 'float', True],
         [7, 5, 'walk', False], [8, 5, 'walk', False], [9, 5, 'walk', False], [10, 5, 'walk', False]]
c4 = out['carry4']
check(c4['walk'] == want4, f'level 4: a hamster holds the dandelion from the step after the floater\'s square (6,1) through its float down to 6,5, and not after it lands, by hand ({c4["walk"]})')
check(len(c4['runs']) == 5 and all(r == [x[:3] for x in want4 if x[3]] for r in c4['runs']), f'level 4: all five hamsters hold it the same way ({c4["runs"]})')
ca = out['carryAll']
check(all(not v['bad'] for v in ca.values()), f'every level\'s answer: every float step holds the dandelion, each holding starts just after a floater and ends on landing, none without a floater ({ {k: v["bad"] for k, v in ca.items() if v["bad"]} })')
check(sorted(k for k, v in ca.items() if v['carried']) == sorted(k for k, v in ca.items() if v['floater']) and any(v['floater'] for v in ca.values()),
      f'the levels with a floater, and only those, have hamsters holding a dandelion ({sorted(k for k, v in ca.items() if v["carried"])})')

# small functions
check(out['terrain'] == ['bridge', '.', None, None, '.', '.', 'S', 'G'], f'terrain(): a bridge, air, off the side, below the bottom, above the top, a seed\'s square, start, home ({out["terrain"]})')
check(out['holds'] == [True, False, True, False], 'holds(): a bridge and ground hold a hamster; air and a seed\'s square do not')
check(out['key'] == '3,6', 'key(3, 6) is "3,6"')
check(out['consts'] == [12, 7, ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'rampL', 'signpost', 'zip'], 3, 3],
      'the board is 12 x 7 for levels 1 to 20; nine gadgets (the worn stick, D-153; the left ramp and the signpost, D-190; the zip-line, D-196); a fall of 3 bonks; a bounce is 3 up')
check(out['noStack'] == [False, False, False, False, False, False], 'nothing fits on a gadget, the start, the home or the seed, nor an unknown gadget, nor off the board')

# progress.js (D-147): what is saved, on the device or through the wrapper, made safe on the way in
PJS = r"""
const [progUrl] = process.argv.slice(1);
const P = await import(progUrl);
const ids = ['L1', 'L2', 'L3'];
const kinds = ['bridge', 'ramp'];
const o = {};
o.format = P.FORMAT;
o.fresh = P.fresh();
o.unpack = {
  nul: P.unpack(ids, null, kinds), str: P.unpack(ids, 'x', kinds), arr: P.unpack(ids, [], kinds), noV: P.unpack(ids, { done: { L1: true } }, kinds),
  v3: P.unpack(ids, { v: 3, done: { L1: true } }, kinds), v0: P.unpack(ids, { v: 0, done: { L1: true } }, kinds),
  good: P.unpack(ids, { v: 1, done: { L1: true, L2: true }, seeds: { L1: true }, tries: { L1: 3, L2: 1 } }, kinds),
  good1cards: P.unpack(ids, { v: 1, done: { L1: true }, seeds: {}, tries: {}, cards: { bridge: true } }, kinds),
  good2: P.unpack(ids, { v: 2, done: { L1: true }, seeds: { L1: true }, tries: { L1: 2 }, cards: { bridge: true } }, kinds),
  messy: P.unpack(ids, { v: 1, done: { L1: true, L2: 'yes', L9: true, L3: 1 }, seeds: { L2: true, L1: 1, L3: true }, tries: { L1: 2.6, L2: -4, L3: 'many', L7: 5, L4: 1e9 } }, kinds),
  messyCards: P.unpack(ids, { v: 2, done: {}, seeds: {}, tries: {}, cards: { bridge: true, ramp: 'yes', lift: true, tube: 1 } }, kinds),
  badParts: P.unpack(ids, { v: 1, done: [true], seeds: 'all', tries: null }, kinds),
  badCards: P.unpack(ids, { v: 2, done: { L1: true }, seeds: {}, tries: {}, cards: [true] }, kinds),
  noKinds: P.unpack(ids, { v: 2, done: {}, seeds: {}, tries: {}, cards: { bridge: true } }),
};
const c1 = P.seen(kinds, P.fresh(), 'bridge');
const c2 = P.seen(kinds, c1, 'bridge');
const fz = P.fresh();
o.seen = { c1: c1.cards, c2: c2.cards, same: c1 === fz, untouched: fz.cards, unknown: P.seen(kinds, c1, 'lift').cards,
  kept: P.seen(kinds, { done: { L1: true }, seeds: { L1: true }, tries: { L2: 3 }, cards: {} }, 'ramp') };
let p = P.fresh();
const t1 = P.tried(ids, p, 'L1'); const t2 = P.tried(ids, t1, 'L1');
o.tried = { first: t1.tries, second: t2.tries, same: t1 === p, untouched: p.tries };
const f1 = P.finished(ids, t2, 'L1', false);
const f2 = P.finished(ids, f1, 'L1', true);
const f3 = P.finished(ids, f2, 'L1', false);
o.finished = { f1, f2, f3, afterDone: P.tried(ids, f3, 'L1').tries, otherTries: P.tried(ids, f3, 'L2').tries };
o.unknown = { tried: P.tried(ids, p, 'L9'), finished: P.finished(ids, p, 'L9', true) };
const withCard = P.seen(kinds, f2, 'ramp');
o.cardsKept = { tried: P.tried(ids, withCard, 'L2').cards, finished: P.finished(ids, withCard, 'L2', false).cards };
o.pack = P.pack(withCard);
o.round = P.unpack(ids, JSON.parse(JSON.stringify(P.pack(withCard))), kinds);
const many = Array.from({ length: 10 }, (_, i) => [`L${i + 1}`, `L${i + 1}b`]).flat();   // the 20 levels' ids (D-166, D-170)
const all8 = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift'];
o.size = JSON.stringify(P.pack({ done: Object.fromEntries(many.map((i) => [i, true])), seeds: Object.fromEntries(many.map((i) => [i, true])),
  tries: Object.fromEntries(many.map((i) => [i, 9999])), cards: Object.fromEntries(all8.map((k) => [k, true])) })).length;
// opens() (D-170 (a)): the first; the one before done; or it or any after it done (old progress: twins before it open)
const tw = ['L1', 'L1b', 'L2', 'L2b', 'L3'];
const op = (done) => tw.map((_, i) => P.opens(tw, { done, seeds: {}, tries: {} }, i));
o.opens = [op({}), op({ L1: true }), op({ L1: true, L1b: true }), op({ L1: true, L2: true }), op({ L2: true }), op({ L1: true, L2: true, L3: true }),
           P.opens(tw, P.fresh(), -1), P.opens(tw, P.fresh(), 5)];
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
        F = {'done': {}, 'seeds': {}, 'tries': {}, 'cards': {}}
        check(o['format'] == 2 and o['fresh'] == F, f'progress: format 2 (the help cards seen, D-171); a new player has nothing done, found, tried or seen ({o["fresh"]})')
        u = o['unpack']
        check(all(u[k] == F for k in ('nul', 'str', 'arr', 'noV', 'v3', 'v0', 'badParts')),
              f'progress: nothing, not an object, a list, no format, another format, or broken parts all start afresh ({[k for k in u if u[k] != F]})')
        check(u['good'] == {'done': {'L1': True, 'L2': True}, 'seeds': {'L1': True}, 'tries': {'L1': 3, 'L2': 1}, 'cards': {}}, f'progress: a good format 1 entry is still read, with no cards seen ({u["good"]})')
        check(u['good1cards']['cards'] == {}, f'progress: format 1 had no cards, so any there are not read ({u["good1cards"]})')
        check(u['good2'] == {'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 2}, 'cards': {'bridge': True}}, f'progress: a good format 2 entry is read as it is ({u["good2"]})')
        check(u['messy'] == {'done': {'L1': True}, 'seeds': {}, 'tries': {'L1': 3}, 'cards': {}},
              f'progress: a messy entry keeps only true marks of known levels, seeds only on done levels, whole tries 0 to 9999 ({u["messy"]})')
        check(u['messyCards']['cards'] == {'bridge': True} and u['badCards'] == {**F, 'done': {'L1': True}} and u['noKinds']['cards'] == {},
              f'progress: only true marks of the game\'s own cards are read; broken cards start with none seen ({u["messyCards"]}, {u["badCards"]}, {u["noKinds"]})')
        sn = o['seen']
        check(sn['c1'] == {'bridge': True} and sn['c2'] == {'bridge': True} and not sn['same'] and sn['untouched'] == {} and sn['unknown'] == {'bridge': True},
              f'progress: seen() marks a card seen, in a new object; again changes nothing; a card the game doesn\'t have changes nothing ({sn})')
        check(sn['kept'] == {'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L2': 3}, 'cards': {'ramp': True}}, f'progress: seeing a card keeps the rest ({sn["kept"]})')
        check(o['cardsKept'] == {'tried': {'ramp': True}, 'finished': {'ramp': True}}, f'progress: a GO and a party keep the cards seen ({o["cardsKept"]})')
        check(o['tried']['first'] == {'L1': 1} and o['tried']['second'] == {'L1': 2} and not o['tried']['same'] and o['tried']['untouched'] == {},
              f'progress: each GO counts a try on a level not yet done, in a new object ({o["tried"]})')
        fi = o['finished']
        check(fi['f1']['done'] == {'L1': True} and fi['f1']['seeds'] == {} and fi['f1']['tries'] == {'L1': 2}, f'progress: a party marks the level done, its tries kept ({fi["f1"]})')
        check(fi['f2']['seeds'] == {'L1': True} and fi['f3']['seeds'] == {'L1': True}, 'progress: a seed found stays found, even after a party without it')
        check(fi['afterDone'] == {'L1': 2} and fi['otherTries'] == {'L1': 2, 'L2': 1}, f'progress: once a level is done, its GO presses no longer count; another level\'s do ({fi["afterDone"]}, {fi["otherTries"]})')
        check(o['unknown']['tried'] == F and o['unknown']['finished'] == F, 'progress: a level that is not in the game changes nothing')
        check(o['pack'] == {'v': 2, 'done': {'L1': True}, 'seeds': {'L1': True}, 'tries': {'L1': 2}, 'cards': {'ramp': True}} and o['round'] == {k: o['pack'][k] for k in ('done', 'seeds', 'tries', 'cards')},
              f'progress: pack adds the format version, and unpack reads it back the same ({o["pack"]})')
        check(o['size'] < 20000, f'progress: 20 levels done, found and tried 9999 times, and all 8 cards seen, is under the 20,000 characters fg:state allows ({o["size"]})')
        check(o['nextAt'] == [0, 1, 2, 0], f'progress: the hamster waits at the first level not done, or the last when all are ({o["nextAt"]})')
        T, F_ = True, False
        check(o.get('opens') == [[T, F_, F_, F_, F_], [T, T, F_, F_, F_], [T, T, T, F_, F_], [T, T, T, T, F_], [T, T, T, T, F_], [T, T, T, T, T], F_, F_],
              f'progress: opens(): a new player has only the first open; each done opens the next; a child who did levels 1 and 2 before the twins finds the twins before them open, not done, and the next after them waits for the twin before it (D-170 (a)); off the list, nothing ({o.get("opens")})')

# the house's path (D-150, D-151): levels 1 to 5's places, then the plan for 6 to 10 and two places kept for later,
# with its bends; the whole route never crosses itself or runs back along itself
HJS = r"""
const [houseUrl, levelsUrl] = process.argv.slice(1);
const H = await import(houseUrl);
const { LEVELS } = await import(levelsUrl);
// levels 1 to 5's places, then every PLAN place in its own order, built or not, with its bends (built ones sit at PLAN's place, atPlan)
const pts = LEVELS.filter((d) => !(H.PLAN || []).some((p) => p.name === d.spot)).map((d) => H.SPOTS[d.spot]);
for (const p of H.PLAN || []) pts.push(...(p.via || []), p.at);
// the path the house draws now (levels there are, and on to the next place): it must run along that route's start
const drawn = H.housePath ? H.housePath({ levels: LEVELS }) : null;
const atPlan = LEVELS.filter((d) => (H.PLAN || []).some((p) => p.name === d.spot)).map((d) => [d.id, JSON.stringify(H.SPOTS[d.spot]) === JSON.stringify(H.PLAN.find((p) => p.name === d.spot).at), H.PLAN.find((p) => p.name === d.spot).level]);
const stops = LEVELS.map((d) => [d.id, H.SPOTS[d.spot]]);
console.log(JSON.stringify({ pts, drawn, atPlan, stops, plan: (H.PLAN || []).map((p) => [p.name, p.level]), future: H.FUTURE, planAt: (H.PLAN || []).map((p) => p.at) }));
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
    check(h['plan'] == [['bath', 11], ['bath2', 12], ['rafters', 13], ['rafters2', 14], ['suitcases', None], ['veg', 15], ['veg2', 16], ['shed', 17], ['shed2', 18], ['pond', None], ['treehouse', 19], ['treehouse2', 20]],
          f'the plan (D-151, plan A; D-169 pairs): 11 and 12 the bath, 13 and 14 the loft\'s rafters, a later place by the suitcases, 15 and 16 the veg patch, 17 and 18 the shed, a later place at the pond, 19 and 20 the treehouse ({h["plan"]})')
    check(h['future'] == h['planAt'], 'the soft places in the house are the plan\'s places, in its order')
    k = len(h['drawn'] or [])
    check(k > 0 and h['drawn'] == h['pts'][:k], f'the house draws its dotted path along that route, through the levels there are and on to the next place, never back to a place it passed ({h["drawn"]})')
    check(h['atPlan'] == [[i, True, ORDER.index(i) + 1] for i in ORDER[10:]],
          f'levels 6 to 10 and their twins (11 to 20 in play) sit at the plan\'s own places for them, numbered as they play (D-151, D-169) ({h["atPlan"]})')
    # D-169: each place's two stops apart, at the step 7 sketch's places (sketch_hamster_cards.py 0.1, stops 1 to 10)
    st = dict((i, tuple(xy) if xy else None) for i, xy in h['stops'])
    SKETCHED = {'L1': (224, 654), 'L1b': (340, 646), 'L2': (472, 630), 'L2b': (588, 634), 'L3': (714, 675), 'L3b': (830, 661),
                'L4': (1010, 620), 'L4b': (1110, 560), 'L5': (1090, 300), 'L5b': (974, 290),
                'L6': (357, 373), 'L6b': (243, 347), 'L7': (376, 170), 'L7b': (484, 130), 'L8': (1424, 726), 'L8b': (1536, 698),
                'L9': (1804, 559), 'L9b': (1920, 561), 'L10': (2292, 402), 'L10b': (2352, 302)}
    check(all(st.get(i) == xy for i, xy in SKETCHED.items()) and len(st) == 20, f'all 20 levels sit at the sketch\'s 20 stops, each pair a little apart (D-169) ({ {i: st.get(i) for i in SKETCHED} })')
    xs = [(i, xy) for i, xy in st.items() if xy]
    near = min(((a[1][0] - b[1][0]) ** 2 + (a[1][1] - b[1][1]) ** 2) ** 0.5 for k, a in enumerate(xs) for b in xs[k + 1:])
    check(len(xs) == len(st) and near >= 112, f'every level has its stop, and no two stops\' tap circles (56 across the middle) overlap: the closest are {near:.0f} apart (112 or more)')

# the timed model (step 3's spike, D-144): every hamster's place at each tick, with one slow, looping moving part.
# What to expect was worked out by hand before core.js 1.1 was written (15 Nov):
#   - on boards with nothing that moves or wears out, run() gives each of the five hamsters exactly walk()'s route,
#     the first starting at tick 0 and each next RELEASE (6) ticks later; only the first takes the golden seed;
#   - each step lasts its act's ticks (walk 2, climb 3, bounce 4, fall 1, float 2, tube 2, wait 1);
#   - a teacup lift (a test board, not a game level) stops 6 ticks at each end and moves a row every 3 ticks
#     (a loop of 30 ticks): the cup's row at ticks 0, 5, 6, 7.5, 15, 20, 21, 30 is 5, 5, 5, 4.5, 2, 2, 2, 5;
#     the hamsters queue at its edge and ride it two at a time (D-163, 15 Nov: by hand again), stepping on at ticks
#     30, 30, 60, 60 and 90 and home at 51, 55 (the second waits 4 ticks at the top), 81, 85 and 111; never three on
#     the cup; without the lift every one is stuck;
#   - the same build always gives the same result.
TJS = r"""
const [coreUrl, levelsUrl, sketchJson] = process.argv.slice(1);
const core = await import(coreUrl);
const { LEVELS } = await import(levelsUrl);
const o = { consts: [core.WALKERS, core.RELEASE, core.TICKS, core.LIFT_STOP, core.LIFT_MOVE] };
const strip = (steps) => steps.map((s) => [s.c, s.r, s.act, !!s.seed, s.land || 0]);
const cases = [];
for (const [name, s] of Object.entries(JSON.parse(sketchJson))) {
  const lv = core.parseLevel({ id: name, rows: s.rows, tray: {} });
  const without = Object.fromEntries(Object.entries(s.sol).filter(([, k]) => k !== s.new));
  cases.push([name + ' solved', lv, s.sol], [name + ' bare', lv, {}], [name + ' without its new gadget', lv, without]);
}
const SOL = {
  L1: [['bridge', 5, 6]], L2: [['bridge', 3, 6], ['ramp', 7, 5], ['ramp', 4, 5]], L3: [['bridge', 2, 6], ['bouncer', 5, 5], ['ramp', 9, 4]],
  L4: [['bridge', 3, 2], ['floater', 5, 1], ['bridge', 6, 2]], L5: [['bridge', 3, 6], ['tube', 6, 5], ['tube', 6, 4], ['tube', 6, 3], ['tube', 6, 2]],
  L1b: [['bridge', 3, 4], ['bridge', 9, 6], ['bridge', 7, 4]], L2b: [['bridge', 2, 6], ['ramp', 4, 5], ['ramp', 7, 4], ['ramp', 5, 4]],
  L3b: [['bridge', 1, 6], ['bouncer', 2, 5], ['bouncer', 6, 5], ['ramp', 10, 4]], L4b: [['bridge', 2, 2], ['bridge', 5, 2], ['floater', 6, 1], ['bridge', 8, 2]],
  L5b: [['bridge', 1, 6], ['tube', 7, 5], ['tube', 7, 4], ['tube', 7, 3], ['tube', 7, 2], ['tube', 7, 1]],
};
for (const d of LEVELS) {
  if (d.new === 'stick' || (d.tray || {}).stick || (d.parts || []).length) continue;   // worn sticks and moving parts change the route for later hamsters: their own checks
  const lv = core.parseLevel(d);
  const placed = {};
  for (const [k, c, r] of SOL[d.id]) placed[core.key(c, r)] = k;
  cases.push([d.id + ' with its seed', lv, placed]);
}
o.same = cases.map(([name, lv, placed]) => {
  const run = core.run(lv, placed);
  const w0 = core.walk(lv, placed, true);
  const w1 = core.walk(lv, placed, false);
  const bad = [];
  if (run.hamsters.length !== 5) bad.push('not five hamsters');
  run.hamsters.forEach((h, i) => {
    if (JSON.stringify(strip(h.steps)) !== JSON.stringify(strip((i ? w1 : w0).steps))) bad.push(`hamster ${i + 1}'s route`);
    if (h.outcome !== w0.outcome) bad.push(`hamster ${i + 1}'s outcome ${h.outcome}`);
    if (h.seed !== (i === 0 && w0.seed)) bad.push(`hamster ${i + 1}'s seed`);
    if (h.steps[0].t0 !== i * core.RELEASE) bad.push(`hamster ${i + 1} comes out at ${h.steps[0].t0}`);
    h.steps.forEach((s, j) => {
      if (j && s.t0 !== h.steps[j - 1].t1) bad.push(`hamster ${i + 1} step ${j} starts late`);
      if (s.t1 - s.t0 !== (j ? core.TICKS[s.act] : 0)) bad.push(`hamster ${i + 1} step ${j} (${s.act}) lasts ${s.t1 - s.t0}`);
    });
    if (h.end !== h.steps[h.steps.length - 1].t1) bad.push(`hamster ${i + 1} ends at ${h.end}`);
  });
  return [name, w0.outcome, bad];
});
// the teacup lift test board
const LIFT = { id: 'lift', tray: {}, parts: [{ kind: 'lift', c: 5, top: 2, bottom: 5 }], rows: [
  '............',
  '........G...',
  '......######',
  '......######',
  'S.....######',
  '#####.######',
  '############',
] };
const lv = core.parseLevel(LIFT);
o.cup = [0, 5, 6, 7.5, 15, 20, 21, 30].map((t) => core.cupRow(lv.parts[0], t));
const a = core.run(lv, {});
const b = core.run(core.parseLevel(LIFT), {});
o.same2 = JSON.stringify(a) === JSON.stringify(b);
o.lift = a.hamsters.map((h) => {
  const on = h.steps.findIndex((s) => s.c === 5);
  const off = h.steps.findIndex((s, j) => j > on && s.c !== 5);
  return { outcome: h.outcome, end: h.end, on: on < 0 ? null : h.steps[on].t0, off: off < 0 ? null : h.steps[off].t0,
           acts: [...new Set(h.steps.map((s) => s.act))] };
});
o.ticks = a.ticks;
// a lone hamster reaching the edge one tick before the cup leaves (a fall of 1, then 2 walks: tick 5) waits for the next stop
const late = core.parseLevel({ ...LIFT, rows: LIFT.rows.map((row, r) => (r === 3 ? '..S...######' : r === 4 ? '......######' : row)) });
o.late = core.run(late, {}, 1).hamsters.map((h) => [h.outcome, h.steps.find((s) => s.c === 5).t0]);
o.bare = core.run(core.parseLevel({ ...LIFT, parts: [] }), {}).hamsters.map((h) => h.outcome);
o.fitShaft = [core.fits(lv, {}, 'tube', 5, 3), core.fits(lv, {}, 'tube', 5, 0), core.fits(lv, {}, 'ramp', 4, 4)];
const refuse = (parts) => { try { core.parseLevel({ ...LIFT, parts }); return 'parsed'; } catch (e) { return e.message; } };
o.refuse = [refuse([{ kind: 'swing', c: 5, top: 2, bottom: 5 }]), refuse([{ kind: 'lift', c: 6, top: 2, bottom: 5 }]),
            refuse([{ kind: 'lift', c: 5, top: 5, bottom: 2 }]), refuse([{ kind: 'lift', c: 5, top: 0, bottom: 5 }])];
console.log(JSON.stringify(o));
"""
r = subprocess.run(['node', '--input-type=module', '-e', TJS, 'file://' + os.path.join(GAME, 'core.js'),
                    'file://' + os.path.join(GAME, 'levels.js'), json.dumps(sketch_in)], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout[-2000:], r.stderr[-2000:])
    check(False, 'node ran the timed model (run, cupRow)')
else:
    o = json.loads(r.stdout)
    check(o['consts'] == [5, 6, {'walk': 2, 'climb': 3, 'bounce': 4, 'fall': 1, 'float': 2, 'tube': 2, 'wait': 1, 'ride': 3, 'tilt': 4, 'turn': 2, 'zip': 1}, 6, 3],
          f'timed model: five hamsters, 6 ticks apart; walk 2, climb 3, bounce 4, fall 1, float 2, tube 2, wait 1, ride 3, tilt 4 (a see-saw tipping, D-156), turn 2 (at a signpost, D-190), zip 1 (a square across, twice walking speed, D-196); the cup stops 6, moves a row in 3 ({o["consts"]})')
    bad = [(n, b) for n, _, b in o['same'] if b]
    check(not bad and len(o['same']) == 28, f'timed model: on the 18 sketch boards and levels 1 to 5 and their twins with their seeds, each hamster goes walk()\'s way, 6 ticks apart, only the first takes the seed, each step its own length ({bad or len(o["same"])})')
    check(o['cup'] == [5, 5, 5, 4.5, 2, 2, 2, 5], f'teacup lift: stops at the bottom, rises a row every 3 ticks, stops at the top, comes back, a loop of 30 ({o["cup"]})')
    L = o['lift']
    check([h['outcome'] for h in L] == ['home'] * 5, f'teacup lift: all five get home ({[h["outcome"] for h in L]})')
    check([h['on'] for h in L] == [30, 30, 60, 60, 90] and [h['end'] for h in L] == [51, 55, 81, 85, 111],
          f'teacup lift: they ride two at a time (D-163), on at 30, 30, 60, 60, 90, home at 51, 55, 81, 85, 111, by hand ({[(h["on"], h["end"]) for h in L]})')
    spans = sorted((h['on'], h['off']) for h in L)
    most = max(sum(1 for a, b in spans if a <= t < b) for t in range(0, 200))
    check(all(x[1] is not None for x in spans) and most == 2, f'teacup lift: never more than two hamsters on the cup, and two do share it ({spans}, {most})')
    check(all('wait' in h['acts'] and 'ride' in h['acts'] for h in L), 'teacup lift: each hamster waits at the edge, then rides')
    check(o['late'] == [['home', 30]], f'teacup lift: a hamster at the edge one tick before the cup leaves waits for the next stop (tick 30), never steps onto a cup about to move ({o["late"]})')
    check(o['ticks'] == 111, f'teacup lift: the run lasts 111 ticks ({o["ticks"]})')
    check(o['same2'], 'timed model: the same build always gives the same result')
    check(o['bare'] == ['stuck'] * 5, f'teacup lift: without it, every hamster drops into the shaft and is stuck ({o["bare"]})')
    check(o['fitShaft'] == [False, True, True], f'teacup lift: nothing fits in its shaft; above it and beside it they do ({o["fitShaft"]})')
    check(all('part' in x for x in o['refuse']), f'parseLevel refuses an unknown part, a shaft through ground, a lift upside down, a lift off the top ({o["refuse"]})')

# the worn lolly stick (D-143, D-153): its own gadget, fits where a bridge does, gets a crack with each hamster that
# stands on it and snaps under the fourth. Worked out by hand (15 Nov) on level 6's board without its seed: the
# hamsters reach the gap's square at ticks 10, 16, 22, 28, 34. One stick on top: three home, then two splashes,
# cracks at 10, 16 and 22 and the snap at 28; one stick underneath: the same outcomes; one on top and one under it:
# all five home, the top one snaps at 28 and the fourth falls one square onto the lower one, which cracks at 29 and
# 35; a sturdy bridge: all home, no cracks. Nothing goes on a worn stick (else a ramp on it crosses for ever). walk() (one hamster) is home with one stick.
SJS = r"""
const [coreUrl] = process.argv.slice(1);
const core = await import(coreUrl);
const F6 = core.parseLevel({ id: 'f6', tray: {}, rows: [
  '............', '............', '............', 'S...........', '#####.....G.', '#####.######', '#####.######'] });
const go = (placed) => { const r = core.run(F6, placed); return { out: r.hamsters.map((h) => h.outcome), ev: r.events.map((e) => [e.t, e.kind, e.c, e.r, e.n]) }; };
console.log(JSON.stringify({
  snap: core.SNAP, kinds: core.GADGETS,
  top: go({ '5,4': 'stick' }), under: go({ '5,5': 'stick' }), both: go({ '5,4': 'stick', '5,5': 'stick' }), bridge: go({ '5,4': 'bridge' }),
  fits: JSON.stringify(core.fitCells(F6, {}, 'stick')) === JSON.stringify(core.fitCells(F6, {}, 'bridge')) && core.fitCells(F6, {}, 'stick').length > 0,
  besideStick: core.fits(F6, { '5,5': 'stick' }, 'ramp', 5, 4),
  stickOnStick: core.fits(F6, { '5,5': 'stick' }, 'stick', 5, 4),
  bridgeOnStick: core.fits(F6, { '5,5': 'stick' }, 'bridge', 5, 4),
  stickOnBridge: core.fits(F6, { '5,5': 'bridge' }, 'stick', 5, 4),
  stickUnder: core.fits(F6, { '5,4': 'stick' }, 'stick', 5, 5),
  holds: core.holds(F6, { '5,4': 'stick' }, 5, 4),
  walk: core.walk(F6, { '5,4': 'stick' }).outcome,
}));
"""
r = subprocess.run(['node', '--input-type=module', '-e', SJS, 'file://' + os.path.join(GAME, 'core.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout[-2000:], r.stderr[-2000:])
    check(False, 'node ran the worn lolly stick')
else:
    o = json.loads(r.stdout)
    check(o['snap'] == 4 and o['kinds'][:6] == ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick'], f'the worn stick is a sixth gadget and snaps under the fourth hamster (D-143, D-153) ({o["snap"]}, {o["kinds"]})')
    five_three = ['home', 'home', 'home', 'splash', 'splash']
    check(o['top']['out'] == five_three and o['top']['ev'] == [[10, 'crack', 5, 4, 1], [16, 'crack', 5, 4, 2], [22, 'crack', 5, 4, 3], [28, 'snap', 5, 4, 4]],
          f'worn stick on top: cracks at 10, 16, 22, snaps under the fourth at 28; three home, two splash, by hand ({o["top"]})')
    check(o['under']['out'] == five_three, f'worn stick underneath: three home, two splash ({o["under"]["out"]})')
    check(o['both']['out'] == ['home'] * 5 and o['both']['ev'] == [[10, 'crack', 5, 4, 1], [16, 'crack', 5, 4, 2], [22, 'crack', 5, 4, 3], [28, 'snap', 5, 4, 4], [29, 'crack', 5, 5, 1], [35, 'crack', 5, 5, 2]],
          f'one stick under another: the top one snaps at 28, the fourth drops onto the lower one (cracks at 29, 35); all five home, by hand ({o["both"]})')
    check(o['bridge'] == {'out': ['home'] * 5, 'ev': []}, f'a sturdy bridge never cracks ({o["bridge"]})')
    check(o['fits'] and o['holds'] and o['besideStick'] is False, 'a worn stick fits where a bridge does and holds a hamster, but nothing goes on it (a ramp on it would never crack it)')
    check(o['walk'] == 'home', f'walk(): one hamster crosses one worn stick ({o["walk"]})')
    check(o['stickOnStick'] is True and o['stickUnder'] is True,
          f'one stick under another goes down in either order: a worn stick fits above a worn stick, and under one (D-177 (1), ER-013) ({o["stickOnStick"]}, {o["stickUnder"]})')
    check(o['bridgeOnStick'] is False and o['stickOnBridge'] is False,
          f'only a stick over a stick: a bridge still doesn\'t fit above a worn stick, nor a stick above a bridge ({o["bridgeOnStick"]}, {o["stickOnBridge"]})')

# wider boards (D-158) and the see-saw (D-144, D-156). A level may be 12 to 24 squares wide, 7 tall. A see-saw is a
# part { kind: 'seesaw', c, r }: a plank over columns c to c+2 on a flowerpot under c+1, where a hamster stands on row
# r at the middle. At rest its near end is down (they stand on rows r+1, r, r-1 along it); tipped, its far end is down
# (r-1, r, r+1). A hamster climbs or steps down along the plank, but can't step up onto it from outside. One that
# reaches the high far end waits there for a friend (up to SEESAW_WAIT = 24 ticks, then it naps); when two stand on
# the far end it tips, in TIP = 4 ticks, and stays tipped; anyone on the plank moves with it.
# Worked out by hand (15 Nov) on level 8's board (18 wide, see-saw at c 11, r 3), without its seed, before core.js 1.2:
#   - bridge 3,5, ramps 5,4 and 10,3: the first hamster waits at 13,2 from tick 32; the second gets there at 38 and it
#     tips (one 'tip' event at 38); the first waits 32 to 38, rides down 39 to 42; the third, dropping onto the near end,
#     is lifted with it 38 to 42; all five home, at 49, 49, 53, 53 and 59;
#   - without the ramp at 10,3: it tips at 36; the third is lifted; the fourth and fifth are stuck at the raised end
#     (at 39 and 45): home, home, home, stuck, stuck;
#   - one hamster alone waits 24 ticks (32 to 55), then naps: stuck at 56;
#   - without the see-saw (its part taken away), they drop into the gap: splash.
WJS = r"""
const [coreUrl] = process.argv.slice(1);
const core = await import(coreUrl);
const ROWS8 = ['..................', '..................', '..................', '..................',
  'S.....#####.......', '###.#######.....G.', '###.#######.#.####'];
const SAW = { kind: 'seesaw', c: 11, r: 3 };
const L8 = core.parseLevel({ id: 'w8', tray: {}, rows: ROWS8, parts: [SAW] });
const FULL = { '3,5': 'bridge', '5,4': 'ramp', '10,3': 'ramp' };
const go = (lv, placed, n) => { const r = core.run(lv, placed, n); return { out: r.hamsters.map((h) => h.outcome), end: r.hamsters.map((h) => h.end),
  acts: r.hamsters.map((h) => [...new Set(h.steps.map((s) => s.act))]), ev: r.events.map((e) => [e.t, e.kind, e.c, e.r, e.n]),
  h1: r.hamsters[0].steps.filter((s) => s.act === 'wait' || s.act === 'tilt').map((s) => [s.act, s.t0, s.t1, s.c, s.r]),
  h3: r.hamsters[2] ? r.hamsters[2].steps.filter((s) => s.act === 'tilt').map((s) => [s.t0, s.t1, s.c, s.r]) : [], ticks: r.ticks }; };
const refuse = (rows, parts) => { try { core.parseLevel({ id: 'bad', rows, tray: {}, parts }); return 'parsed'; } catch (e) { return e.message; } };
const wide = (n) => ROWS8.map((row) => (row + '.'.repeat(30)).slice(0, n));
console.log(JSON.stringify({
  consts: [core.COLS, core.MAX_COLS, core.TIP, core.SEESAW_WAIT],
  cols: L8.cols, cols12: core.parseLevel({ id: 'n', tray: {}, rows: ['............', '............', '............', '............', '............', 'S.........G.', '############'] }).cols,
  full: go(L8, FULL), noRamp: go(L8, { '3,5': 'bridge', '5,4': 'ramp' }), alone: go(L8, FULL, 1),
  bare: go(core.parseLevel({ id: 'w8', tray: {}, rows: ROWS8 }), FULL).out,
  again: JSON.stringify(core.run(L8, FULL)) === JSON.stringify(core.run(L8, FULL)),
  fitSpace: [core.fits(L8, {}, 'tube', 11, 2), core.fits(L8, {}, 'tube', 13, 5), core.fits(L8, {}, 'tube', 12, 5), core.fits(L8, {}, 'tube', 14, 2), core.fits(L8, {}, 'ramp', 17, 5), core.fits(L8, {}, 'ramp', 18, 5)],
  terrain: [core.terrain(L8, {}, 12, 4), core.terrain(L8, {}, 17, 6), core.terrain(L8, {}, 18, 6)],
  refuse: { w25: refuse(wide(25)), w24: refuse(wide(24)), ragged: refuse(ROWS8.map((r, i) => (i === 0 ? r + '.' : r))),
            notClear: refuse(ROWS8.map((r, i) => (i === 3 ? r.slice(0, 12) + '#' + r.slice(13) : r)), [SAW]),
            offEnd: refuse(ROWS8, [{ kind: 'seesaw', c: 16, r: 3 }]), offTop: refuse(ROWS8, [{ kind: 'seesaw', c: 11, r: 0 }]) },
  walk: core.walk(L8, FULL).outcome,
}));
"""
r = subprocess.run(['node', '--input-type=module', '-e', WJS, 'file://' + os.path.join(GAME, 'core.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout[-2000:], r.stderr[-2000:])
    check(False, 'node ran the wider boards and the see-saw')
else:
    o = json.loads(r.stdout)
    check(o['consts'] == [12, 24, 4, 24], f'boards 12 to 24 wide (D-158); a see-saw tips in 4 ticks; a hamster waits up to 24 ticks for a friend ({o["consts"]})')
    check(o['cols'] == 18 and o['cols12'] == 12, f'parseLevel reads each board\'s width: 18 and 12 ({o["cols"]}, {o["cols12"]})')
    rf = o['refuse']
    check('rows of 12 to 24' in rf['w25'] and rf['w24'] == 'parsed' and 'rows of 12 to 24' in rf['ragged'], f'a board 24 wide parses; 25 wide or ragged rows are refused ({rf["w24"]}, {rf["w25"]}, {rf["ragged"]})')
    check(all('part' in rf[k] for k in ('notClear', 'offEnd', 'offTop')), f'parseLevel refuses a see-saw through ground, off the end or off the top ({rf})')
    check(o['terrain'] == ['seesaw', '#', None], f'terrain(): the see-saw\'s space, the far bank\'s last square, off the end of an 18-wide board ({o["terrain"]})')
    check(o['fitSpace'] == [False, False, False, True, True, False], f'nothing fits in the see-saw\'s space; above and past it they do; nothing off the end ({o["fitSpace"]})')
    f = o['full']
    check(f['out'] == ['home'] * 5 and f['end'] == [49, 49, 53, 53, 59] and f['ticks'] == 59, f'see-saw, solved: all five home at 49, 49, 53, 53, 59, by hand ({f["out"]}, {f["end"]})')
    check(f['ev'] == [[38, 'tip', 11, 3, 2]], f'see-saw: it tips once, at 38, under two hamsters, by hand ({f["ev"]})')
    check(f['h1'] == [['wait', t, t + 1, 13, 2] for t in range(32, 39)] + [['tilt', 39, 42, 13, 4]], f'see-saw: the first waits at the high end 32 to 38, then rides down to 13,4 by 42 ({f["h1"]})')
    check(f['h3'] == [[38, 42, 11, 2]], f'see-saw: the third, on the near end as it tips, is lifted to 11,2 by 42 ({f["h3"]})')
    check('wait' not in f['acts'][3] and 'tilt' not in f['acts'][3], f'see-saw: the fourth walks straight over it, tipped ({f["acts"][3]})')
    n = o['noRamp']
    check(n['out'] == ['home', 'home', 'home', 'stuck', 'stuck'] and n['ev'] == [[36, 'tip', 11, 3, 2]] and n['end'][3:] == [39, 45],
          f'see-saw without the ramp to its raised end: it tips at 36, three home, the fourth and fifth stuck at 39 and 45 ({n["out"]}, {n["ev"]}, {n["end"]})')
    a = o['alone']
    check(a['out'] == ['stuck'] and a['end'] == [56] and a['ev'] == [], f'see-saw: one hamster alone waits 24 ticks and naps at 56; it never tips ({a})')
    check(o['bare'] == ['splash'] * 5, f'without the see-saw, they drop into the gap ({o["bare"]})')
    check(o['again'], 'see-saw: the same build always gives the same run')
    check(o['walk'] == 'stuck', f'walk() (one hamster, time standing still): waits at the high end, then naps ({o["walk"]})')

# the teacup lift with two cups (D-157): a lift part may say cups: 2 (1 if it says nothing): two cups on one loop,
# half a loop apart, so one goes up as the other comes down; still one hamster a cup. Worked out by hand (15 Nov,
# step 4) on the one-cup test board above (lift at c 5, top 2, bottom 5: a loop of 30 ticks, half a loop 15),
# before core.js 1.3:
#   - cup 1 is half a loop on from cup 0: at ticks 0, 6, 10.5, 15, 21, 30 its row is 2, 2, 3.5, 5, 5, 2; the two cups
#     pass at row 3.5 at tick 10.5; whenever one is stopped, the other is stopped at the other end;
#   - (D-163, two a cup, by hand again) the first reaches the edge at 8 (four walks), the second at 14; cup 1 comes
#     down to the bottom at 15 and both step in (seats 0 and 1), wait to 21, ride 21 to 30; the first walks home by
#     36, the second waits at the top 30 to 34 and is home by 40; cup 0 takes the third and fourth at 30 (home 51 and
#     55), cup 1 the fifth at 45 (home 66): on at 15, 15, 30, 30, 45 (cups 1, 1, 0, 0, 1); the run lasts 66 ticks
#     (13.2 s at 0.2 s a tick; one hamster a cup took 96, 19.2 s);
#   - a lone hamster at the edge one tick before cup 0 leaves (tick 5) waits for cup 1, on at 15;
#   - a lift with 0 or 3 cups is refused.
CJS = r"""
const [coreUrl] = process.argv.slice(1);
const core = await import(coreUrl);
const ROWS = ['............', '........G...', '......######', '......######', 'S.....######', '#####.######', '############'];
const TWO = { kind: 'lift', c: 5, top: 2, bottom: 5, cups: 2 };
const lv = core.parseLevel({ id: 'lift2', tray: {}, parts: [TWO], rows: ROWS });
const p = lv.parts[0];
const ends = [];
for (let t = 0; t < 30; t++) { const a = core.cupStop(p, t, 0); const b = core.cupStop(p, t, 1); ends.push([a ? a.end : null, b ? b.end : null]); }
const res = core.run(lv, {});
const late = core.parseLevel({ id: 'late2', tray: {}, parts: [TWO], rows: ROWS.map((row, r) => (r === 3 ? '..S...######' : r === 4 ? '......######' : row)) });
const refuse = (cups) => { try { core.parseLevel({ id: 'bad', tray: {}, parts: [{ ...TWO, cups }], rows: ROWS }); return 'parsed'; } catch (e) { return e.message; } };
console.log(JSON.stringify({
  cups: [p.cups, core.parseLevel({ id: 'one', tray: {}, parts: [{ kind: 'lift', c: 5, top: 2, bottom: 5 }], rows: ROWS }).parts[0].cups],
  cup1: [0, 6, 10.5, 15, 21, 30].map((t) => core.cupRow(p, t, 1)), cup0: core.cupRow(p, 10.5, 0), cup0at0: core.cupRow(p, 0),
  ends,
  out: res.hamsters.map((h) => h.outcome), end: res.hamsters.map((h) => h.end), ticks: res.ticks,
  on: res.hamsters.map((h) => { const s = h.steps.find((st) => st.c === 5); return s ? s.t0 : null; }),
  rides: res.hamsters.map((h) => [...new Set(h.steps.filter((s) => s.act === 'ride').map((s) => s.cup))]),
  seats: res.hamsters.map((h) => [...new Set(h.steps.filter((s) => s.act === 'ride').map((s) => s.seat))]),
  topWait: res.hamsters.map((h) => h.steps.filter((s) => s.act === 'wait' && s.r === 1).map((s) => [s.t0, s.t1])),
  consts: [core.SEATS, core.SHARE_WAIT],
  spans: res.hamsters.map((h) => { const r = h.steps.filter((s) => s.act === 'ride'); return r.length ? [r[0].cup, r[0].t0, r[r.length - 1].t1] : null; }),
  late: core.run(late, {}, 1).hamsters.map((h) => [h.outcome, h.steps.find((s) => s.c === 5).t0]),
  again: JSON.stringify(core.run(lv, {})) === JSON.stringify(res),
  refuse: [refuse(0), refuse(3), refuse(1.5), refuse(1), refuse(2)],
}));
"""
r = subprocess.run(['node', '--input-type=module', '-e', CJS, 'file://' + os.path.join(GAME, 'core.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout[-2000:], r.stderr[-2000:])
    check(False, 'node ran the teacup lift with two cups')
else:
    o = json.loads(r.stdout)
    check(o['cups'] == [2, 1], f'a lift part has the cups it says, 1 if it says nothing ({o["cups"]})')
    check(o['cup1'] == [2, 2, 3.5, 5, 5, 2] and o['cup0'] == 3.5 and o['cup0at0'] == 5,
          f'two cups: cup 1 is half a loop on (rows 2, 2, 3.5, 5, 5, 2 at ticks 0, 6, 10.5, 15, 21, 30); they pass at 3.5 at 10.5; cup 0 alone is as before ({o["cup1"]}, {o["cup0"]}, {o["cup0at0"]})')
    pairs = {tuple(x) for x in o['ends']}
    check(pairs == {('bottom', 'top'), ('top', 'bottom'), (None, None)}, f'two cups: whenever one is stopped, the other is stopped at the other end ({sorted(pairs, key=str)})')
    check(o['consts'] == [2, 4], f'a cup takes two hamsters; the second waits 4 ticks at the other end (D-163) ({o["consts"]})')
    check(o['out'] == ['home'] * 5 and o['on'] == [15, 15, 30, 30, 45] and o['end'] == [36, 40, 51, 55, 66],
          f'two cups: all five home; on at 15, 15, 30, 30, 45, home at 36, 40, 51, 55, 66, by hand ({o["out"]}, {o["on"]}, {o["end"]})')
    check(o['rides'] == [[1], [1], [0], [0], [1]] and o['seats'] == [[0], [1], [0], [1], [0]],
          f'two cups: two share a cup, side by side, the cups taking turns: cups 1, 1, 0, 0, 1, seats 0, 1, 0, 1, 0 ({o["rides"]}, {o["seats"]})')
    check(o['topWait'] == [[], [[30, 34]], [], [[45, 49]], []], f'two cups: the second in a cup waits 4 ticks at the top before stepping out, so they keep apart ({o["topWait"]})')
    sp = [s for s in o['spans'] if s]
    most = max(sum(1 for a in sp if a[0] == k and a[1] <= t < a[2]) for k in (0, 1) for t in range(0, 100))
    check(len(sp) == 5 and most == 2, f'two cups: never more than two hamsters on one cup at once ({o["spans"]}, {most})')
    check(o['ticks'] == 66, f'two cups: the run lasts 66 ticks (13.2 s; one a cup took 96) ({o["ticks"]})')
    check(o['late'] == [['home', 15]], f'two cups: a hamster at the edge one tick before cup 0 leaves takes cup 1 at 15 ({o["late"]})')
    check(o['again'], 'two cups: the same build always gives the same run')
    rf = o['refuse']
    check(all('part' in x for x in rf[:3]) and rf[3:] == ['parsed', 'parsed'], f'parseLevel takes a lift of 1 or 2 cups and refuses 0, 3 or 1.5 ({rf})')

# the help cards (D-167, D-168, D-170): cards.js, one card for each gadget and part a level brings in
KJS = r"""
const [cardsUrl, levelsUrl, coreUrl] = process.argv.slice(1);
const K = await import(cardsUrl);
const A = await import(cardsUrl.replace('cards.js', 'art.js'));
const { LEVELS } = await import(levelsUrl);
const core = await import(coreUrl);
console.log(JSON.stringify({
  cards: K.CARDS, caption: K.CAPTION, loops: K.LOOP_S, css: K.CARD_CSS, gadgets: core.GADGETS,
  art: Object.fromEntries(K.CARDS.map((k) => [k, K.cardArt(k)])),
  badge: Object.fromEntries(K.CARDS.map((k) => [k, K.badgeArt(k)])),
  levels: LEVELS.map((d) => [d.id, d.new, K.cardFor(d)]),
  odd: [K.cardFor({ new: null }), K.cardFor({ new: 'catapult' }), K.cardFor({})],
  again: K.cardArt('bridge') === K.cardArt('bridge'),
  poses: Object.fromEntries(['walk1', 'walk2', 'float', 'carry1', 'carry2'].map((p) => [p, A.hamster(p)])),
}));
"""
kp = os.path.join(GAME, 'cards.js')
if not os.path.exists(kp):
    check(False, 'cards.js exists (the help cards, D-167)')
else:
    r = subprocess.run(['node', '--input-type=module', '-e', KJS, 'file://' + kp, 'file://' + os.path.join(GAME, 'levels.js'), 'file://' + os.path.join(GAME, 'core.js')],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-2000:], r.stderr[-2000:])
        check(False, 'node ran cards.js')
    else:
        k = json.loads(r.stdout)
        EIGHT = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift']
        check(k['cards'] == EIGHT and set(k['cards']) == set(k['gadgets'][:6]) | {'seesaw', 'lift'},
              f'cards: 8, one for each of levels 1 to 20\'s six gadgets and the two parts, in the order they come in (D-167); the left ramp, '
              f'signpost and zip-line get theirs with their levels (steps 15 and 18) ({k["cards"]})')
        words = {c: len(k['caption'].get(c, '').split()) for c in EIGHT}
        check(all(3 <= n <= 6 for n in words.values()), f'cards: every caption is 3 to 6 words (D-167) ({words})')
        check(k['caption'].get('bridge') == 'Bridges cross the gaps' and k['caption'].get('lift') == 'Hop in and ride up!',
              f'cards: the bridge\'s and the lift\'s captions are the agreed ones (D-168) ({k["caption"].get("bridge")}, {k["caption"].get("lift")})')
        check(all(isinstance(k['loops'].get(c), (int, float)) and 3 <= k['loops'][c] <= 8 for c in EIGHT), f'cards: each loops in a few seconds, 3 to 8 (D-168) ({k["loops"]})')
        lv = k['levels']
        check(all(new == card for _, new, card in lv) and [new for i, new, _ in lv if not i.endswith('b')] == ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'stick', 'seesaw', 'lift', None],
              f'cards: each level\'s new gadget or part has its card; level 10 brings in nothing ({lv})')
        check([card for i, _, card in lv if i.endswith('b')] == [None] * sum(1 for i, _, _ in lv if i.endswith('b')) and any(i.endswith('b') for i, _, _ in lv),
              f'cards: the twins bring in nothing, so no card pops up for them (D-166) ({[x for x in lv if x[0].endswith("b")]})')
        check(k['odd'] == [None, None, None], f'cards: no card for nothing new or a gadget the game doesn\'t have ({k["odd"]})')
        css = k['css']
        frames = set(re.findall(r'@keyframes\s+([\w-]+)', css))
        rules = {}
        for sel, body in re.findall(r'((?:\.[\w-]+(?:\s*,\s*)?)+)\s*\{([^{}]*)\}', css):
            for c in re.findall(r'\.([\w-]+)', sel):
                rules[c] = rules.get(c, '') + body
        check(rules and all(c.startswith('hc-') for c in rules) and frames and all(f.startswith('hc-') for f in frames),
              f'cards: every class and animation in their CSS starts hc-, so none clashes with the game\'s own (.loop, .bob) ({sorted(c for c in rules if not c.startswith("hc-"))})')
        for c in EIGHT:
            a = k['art'].get(c, '')
            used = set(re.findall(r'\bhc-[\w-]+', ' '.join(re.findall(r'class="([^"]*)"', a))))
            missing = sorted(u for u in used if u not in rules)
            unframed = sorted(u for u in used if u in rules and not set(re.findall(r'animation:\s*([\w-]+)', rules[u])) <= frames)
            onTr = re.findall(r'<g[^>]*class="[^"]*hc-[^"]*"[^>]*transform=|<g[^>]*transform="[^"]*"[^>]*class="[^"]*hc-', a)
            scene = rules.get(f'hc-{c}', '')
            dur = re.search(r'animation:\s*hc-[\w-]+\s+([\d.]+)s', scene)
            check(f'data-card="{c}"' in a and f'>{k["caption"].get(c)}<' in a and 'data-btn="cardok"' in a and a.count('<svg') == a.count('</svg>') and 'http' not in a,
                  f'card {c}: drawn with its caption on screen and a tick to close it, every svg closed, nothing fetched')
            check(used and not missing and not unframed, f'card {c}: it moves, and every class it moves by has its rule and keyframes ({sorted(used)[:6]}, missing {missing}, no keyframes {unframed})')
            check(not onTr, f'card {c}: no moving group also has a transform attribute, which the animation would override ({len(onTr)})')
            check(dur and float(dur.group(1)) == k['loops'].get(c), f'card {c}: its scene loops every {k["loops"].get(c)} s ({dur.group(1) if dur else None})')
            check(k['badge'].get(c) and k['badge'][c] in a, f'card {c}: its badge shows the gadget or part')
        # the see-saw's card (D-177 (2)): the tip, then a ramp at its start, then a third hamster up it and across
        def frames_of(name):
            m = re.search(r'@keyframes\s+' + re.escape(name) + r'\s*\{(.*?)\}\s*\n', css)
            out = []
            for stops, body in re.findall(r'([\d.%,\s]+)\{([^{}]*)\}', m.group(1) if m else ''):
                for st in re.findall(r'([\d.]+)%', stops):
                    out.append((float(st), body))
            return sorted(out, key=lambda x: x[0])
        tilt = frames_of('hc-seesaw-tilt')
        tipped = min((p for p, b in tilt if 'rotate(45deg)' in b), default=None)
        drop = frames_of('hc-seesaw-drop')
        shown = min((p for p, b in drop if 'opacity: 1' in b), default=None)
        landed = min((p for p, b in drop if 'translateY(0)' in b and p > (shown or 0)), default=None)
        h3 = [(p, tuple(map(float, re.search(r'translate\(([-\d.]+)px, ([-\d.]+)px\)', b).groups()))) for p, b in frames_of('hc-seesaw-h3') if 'translate(' in b]
        up = min((p for p, (x, y) in h3 if y == 180 and x >= 120), default=None)       # on the ramp's top / the raised end
        across = min((p for p, (x, y) in h3 if (x, y) == (270, 300)), default=None)    # the plank's low far end
        home = max((x for p, (x, y) in h3), default=0)
        art = k['art'].get('seesaw', '')
        check('hc-seesaw-drop' in art and 'M 2 100 L 100 100 L 100 4 Z' in art and 'hc-seesaw-h3' in art and 'hc-seesaw-fit' in art,
              'card seesaw: it has a ramp that drops in, its spot lit first, and a third hamster (D-177 (2))')
        check(None not in (tipped, shown, landed, up, across) and tipped < shown < landed < up < across and home >= 390,
              f'card seesaw: it tips ({tipped}%), then the ramp drops in ({shown}% to {landed}%), then the third climbs to the raised end ({up}%), walks down the plank ({across}%) and home (x {home}) (D-177 (2))')
        check(k['loops'].get('seesaw') == 6.5, f'card seesaw: a loop of 6.5 s, for the ramp and the third hamster ({k["loops"].get("seesaw")})')
        check(k['again'], 'cards: the same card is drawn the same each time')
        # art.js: the carrying poses (D-178): walking feet, arms up and the float pose's dandelion overhead
        po = k['poses']
        dandelion = re.search(r'<line[^>]*y1="-72"[^>]*y2="-106"[^>]*/?>', po['float'])
        arms = re.findall(r'<ellipse[^>]*cy="-7[01]"', po['float'])
        feet = lambda a: re.findall(r'<ellipse[^>]*ry="5"[^>]*/?>', a)[:2]
        check(bool(dandelion) and all(dandelion.group(0) in po[c] for c in ('carry1', 'carry2')) and dandelion.group(0) not in po['walk1'],
              'art: the carrying poses hold the float pose\'s dandelion overhead; walking doesn\'t (D-178)')
        check(len(arms) == 2 and all(a in po[c] for a in arms for c in ('carry1', 'carry2')), 'art: the carrying poses have both arms up, holding it')
        check(feet(po['carry1']) == feet(po['walk1']) and feet(po['carry2']) == feet(po['walk2']) and po['carry1'] != po['carry2'],
              'art: the carrying poses step like walking (walk1\'s and walk2\'s feet), so the hamster walks along holding it')

# ================================================================ step 13, the spike (D-185, D-190, D-196): boards 9 tall,
# hamsters walking both ways, and the zip-line. Worked out by hand before core.js 1.7 (17 Nov), on test boards, not levels:
#   - heights: a level is 7 to 9 rows (MAX_ROWS 9), its own height read from its rows (height); a 9-row board's bottom
#     row is water, so a hamster walking off a ledge at row 6 falls 2 rows and splashes below row 8 (fell 3); nothing
#     is below row 8, a tube fits on row 8, a see-saw and a lift fit as low as a 9-row board allows; 6 or 10 rows refused;
#   - a step says dir: -1 while its hamster faces left (an added field: none on levels 1 to 20, pinned below); a signpost
#     turns a hamster that ends a step in its square (a 'turn' step, 2 ticks), falling in too; at the same signpost a
#     third time it sits down dizzy ('dizzy', no turn); back into the start square it naps ('nap'); off the left edge
#     it is stuck; a left ramp (rampL) climbs walking left, and a ramp's back is a step either way; a bouncer throws it
#     one square on the way it faces, tubes join up the way it faces, a teacup lift takes it from either side; a
#     left-walker reaching a see-saw is stuck (the see-saw stays left to right only, assessment 0.2);
#   - the zip-line: a high end in an empty square under a block, with at least one low end; a low end in an empty
#     square with ground or a bridge below, 1 or more rows lower, 2 to 10 across either way, the line between the two
#     middles crossing no block (touching a corner isn't crossing, as the sketch's exact test); placed as a pair
#     (zipPair: the high end 'zip:lc,lr', the low end 'peg:hc,hr'), counted once in the tray; a hamster that ends a
#     step in the high end slides a column a tick ('zip' steps, the row on the line), lets go at the low end and walks
#     on the way it slid. Highs and lows are cross-checked against this file's own exact test (fractions, below).
from fractions import Fraction as _Fr

BW_JS = r"""
const [coreUrl] = process.argv.slice(1);
const core = await import(coreUrl);
const o = {};
const tryy = (f) => { try { return f(); } catch (e) { return 'ERROR ' + e.message; } };
const P = (rows, parts) => core.parseLevel({ id: 't', rows, tray: {}, parts });
const strip = (steps) => steps.map((s) => [s.c, s.r, s.act, s.dir || 1]);
const W = (rows, placed, parts) => tryy(() => { const w = core.walk(P(rows, parts), placed); return { out: w.outcome, steps: strip(w.steps), fell: w.fell }; });
const refuse = (rows) => { try { P(rows); return 'parsed'; } catch (e) { return 'refused'; } };
// part 1: heights
const H9 = ['................', '................', '................', '................', '................', '................',
            'S..............G', '####............', '................'];
o.maxRows = core.MAX_ROWS;
o.heights = tryy(() => [P(H9).height, P(H9.slice(1)).height, P(H9.slice(2)).height]);
o.refuse = [refuse(H9.slice(3)), refuse([...H9, H9[0]]), refuse(H9.map((r, i) => (i === 8 ? r + '.' : r)))];
o.h9 = tryy(() => { const lv = P(H9); return { terrain: [core.terrain(lv, {}, 0, 7), core.terrain(lv, {}, 0, 8), core.terrain(lv, {}, 0, 9)],
  fits: [core.fits(lv, {}, 'tube', 10, 8), core.fits(lv, {}, 'ramp', 5, 8), core.fits(lv, {}, 'ramp', 3, 6)],
  tubeRows: [...new Set(core.fitCells(lv, {}, 'tube').map(([, r]) => r))].sort(),
  parts: [P(H9, [{ kind: 'seesaw', c: 5, r: 6 }]).parts.length, P(H9, [{ kind: 'lift', c: 10, top: 2, bottom: 8 }]).parts.length] }; });
o.h9walk = W(H9, {});
// part 2: both ways
const B = (r4, r5, extra = {}) => Object.assign(['............', '............', '............', '............', r4, r5, '############'], extra);
o.nap = W(B('............', 'S.......G...'), { '3,5': 'signpost' });
o.napNone = W(B('............', 'S.......G...'), {});
const T2 = B('.G...S......', '##..........');
o.rampL = W(T2, { '8,5': 'signpost', '2,5': 'rampL' });
o.rampBack = W(T2, { '8,5': 'signpost', '2,5': 'ramp' });
o.rampLBack = W(B('............', 'S.......G...'), { '3,5': 'rampL' });
o.dizzy = W(B('.....S......', '...........G'), { '2,5': 'signpost', '8,5': 'signpost' });
o.bounce = W(['............', '............', '...G........', '...###......', '.........S..', '............', '############'], { '10,5': 'signpost', '6,5': 'bouncer' });
o.tubes = W(['............', '............', '............', '....G.......', '....##...S..', '............', '############'], { '10,5': 'signpost', '6,5': 'tube', '6,4': 'tube', '6,3': 'tube' });
o.edge = W(B('...S........', '...........G'), { '5,5': 'signpost' });
o.fallIn = W(['............', '............', '............', 'S...........', '##..........', '...........G', '############'], { '2,5': 'signpost' });
o.saw = W(['............', '............', '............', '.........S..', 'G...........', '......######', '############'], { '10,4': 'signpost' }, [{ kind: 'seesaw', c: 3, r: 3 }]);
o.lift = tryy(() => {
  const lv = P(['............', '.G..........', '#####.......', '.........S..', '............', '......######', '############'], [{ kind: 'lift', c: 5, top: 2, bottom: 5, cups: 2 }]);
  const r = core.run(lv, { '10,4': 'signpost' });
  return { outs: r.hamsters.map((h) => h.outcome), first: strip(r.hamsters[0].steps.filter((s) => s.act !== 'wait')) };
});
o.fitsNew = tryy(() => { const lv = P(T2); return [core.fits(lv, {}, 'signpost', 8, 5), core.fits(lv, {}, 'rampL', 2, 5), core.fits(lv, {}, 'signpost', 8, 3),
  core.fits(lv, {}, 'rampL', 8, 3), core.holds(lv, { '2,5': 'rampL' }, 2, 5), core.holds(lv, { '8,5': 'signpost' }, 8, 5)]; });
o.runTurn = tryy(() => { const r = core.run(P(T2), { '8,5': 'signpost', '2,5': 'rampL' }); const t = r.hamsters[0].steps.find((s) => s.act === 'turn');
  return { outs: r.hamsters.map((h) => h.outcome), turnTicks: t.t1 - t.t0 }; });
// part 3: the zip-line
const Z = ['................', '................', '.######.........', 'S...............', '#####...........', '#####.........G.',
           '#####....#..####', '#####....#..####', '#####....#..####'];
o.zip = tryy(() => {
  const lv = P(Z);
  const highs = core.zipHighs(lv, {});
  const lows = {};
  for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) lows[`${c},${r}`] = core.zipLows(lv, {}, c, r);
  const pair = core.zipPair(4, 3, 12, 5);
  return { highs, lows, fitCells: core.fitCells(lv, {}, 'zip'), fitsZip: [core.fits(lv, {}, 'zip', 4, 3), core.fits(lv, {}, 'zip', 1, 3), core.fits(lv, {}, 'zip', 4, 1)],
    pairOk: [core.fitsZip(lv, {}, 4, 3, 12, 5), core.fitsZip(lv, {}, 4, 3, 13, 5), core.fitsZip(lv, {}, 4, 3, 8, 4), core.fitsZip(lv, {}, 1, 3, 9, 5),
             core.fitsZip(lv, {}, 4, 3, 15, 5), core.fitsZip(lv, {}, 4, 3, 4, 3), core.fitsZip(lv, pair, 4, 3, 9, 5), core.fitsZip(lv, pair, 5, 3, 12, 5)],
    onBridge: [core.zipLows(lv, {}, 4, 3).some(([c, r]) => c === 10 && r === 5), core.zipLows(lv, { '10,6': 'bridge' }, 4, 3).some(([c, r]) => c === 10 && r === 5)],
    pair, terrain: [core.terrain(lv, pair, 4, 3), core.terrain(lv, pair, 12, 5)], holds: [core.holds(lv, pair, 4, 3), core.holds(lv, pair, 12, 4)],
    left: core.left(core.parseLevel({ id: 'z', rows: Z, tray: { zip: 2, bridge: 1 } }), pair),
    noFit: [core.fits(lv, pair, 'tube', 4, 3), core.fits(lv, pair, 'tube', 12, 5)] };
});
o.zipRide = tryy(() => { const lv = P(Z); const w = core.walk(lv, core.zipPair(4, 3, 12, 5)); const r = core.run(lv, core.zipPair(4, 3, 12, 5));
  return { out: w.outcome, steps: strip(w.steps), none: core.walk(lv, {}).outcome, outs: r.hamsters.map((h) => h.outcome),
           zipTicks: r.hamsters[0].steps.filter((s) => s.act === 'zip').map((s) => s.t1 - s.t0) }; });
o.zipBounce = tryy(() => { const lv = P(['............', '....#.......', '............', '............', '............', 'S..........G', '############']);
  const w = core.walk(lv, { '3,5': 'bouncer', ...core.zipPair(4, 2, 9, 5) }); return { out: w.outcome, steps: strip(w.steps) }; });
const ZL = ['................', '................', '.........###....', '.........S......', '.........#......', '.G..............', '####............', '................', '................'];
o.zipLeft = tryy(() => { const lv = P(ZL); const p = core.zipPair(10, 3, 2, 5); const w = core.walk(lv, p);
  return { ok: core.fitsZip(lv, {}, 10, 3, 2, 5), out: w.outcome, steps: strip(w.steps), none: core.walk(lv, {}).outcome }; });
console.log(JSON.stringify(o));
"""
r = subprocess.run(['node', '--input-type=module', '-e', BW_JS, 'file://' + os.path.join(GAME, 'core.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stdout, r.stderr[-1500:])
    check(False, 'node ran the spike\'s checks (step 13)')
    o = {}
else:
    o = json.loads(r.stdout)
E = lambda k: o.get(k, 'missing')
# part 1
check(E('maxRows') == 9 and E('heights') == [9, 8, 7], f'boards 7 to 9 rows, each its own height (D-185) ({E("maxRows")}, {E("heights")})')
check(E('refuse') == ['refused'] * 3, f'6 rows, 10 rows and a ragged 9-row board are refused ({E("refuse")})')
check(E('h9') == {'terrain': ['#', '.', None], 'fits': [True, False, True], 'tubeRows': list(range(9)), 'parts': [1, 1]},
      f'a 9-row board: row 8 is the bottom, nothing below it; a tube fits on row 8, a ramp needs a floor; a see-saw and a lift fit low down ({E("h9")})')
check(E('h9walk') == {'out': 'splash', 'steps': [[0, 6, 'start', 1], [1, 6, 'walk', 1], [2, 6, 'walk', 1], [3, 6, 'walk', 1], [4, 6, 'walk', 1],
                                                  [4, 7, 'fall', 1], [4, 8, 'fall', 1], [4, 9, 'fall', 1]], 'fell': 3},
      f'a 9-row board: off the ledge at row 6, down rows 7 and 8 and a splash below the bottom, by hand ({E("h9walk")})')
# part 2
L = -1
check(E('nap') == {'out': 'nap', 'steps': [[0, 5, 'start', 1], [1, 5, 'walk', 1], [2, 5, 'walk', 1], [3, 5, 'walk', 1], [3, 5, 'turn', L],
                                           [2, 5, 'walk', L], [1, 5, 'walk', L], [0, 5, 'walk', L]], 'fell': 0},
      f'a signpost turns a hamster round; walking back into the start tube it naps (D-190), by hand ({E("nap")})')
check(isinstance(E('napNone'), dict) and E('napNone')['out'] == 'home', 'the same board without the signpost: home')
check(E('rampL') == {'out': 'home', 'steps': [[5, 4, 'start', 1], [5, 5, 'fall', 1], [6, 5, 'walk', 1], [7, 5, 'walk', 1], [8, 5, 'walk', 1],
                                              [8, 5, 'turn', L], [7, 5, 'walk', L], [6, 5, 'walk', L], [5, 5, 'walk', L], [4, 5, 'walk', L],
                                              [3, 5, 'walk', L], [2, 4, 'climb', L], [1, 4, 'walk', L]], 'fell': 0},
      f'walking left, a left ramp climbs (D-190 (a)); every step after the turn says dir -1, by hand ({E("rampL")})')
check(isinstance(E('rampBack'), dict) and E('rampBack')['out'] == 'stuck' and E('rampBack')['steps'][-1] == [3, 5, 'walk', L],
      f'walking left into a right ramp\'s back: stuck before it ({E("rampBack") if not isinstance(E("rampBack"), dict) else E("rampBack")["steps"][-1:]})')
check(E('rampLBack') == {'out': 'stuck', 'steps': [[0, 5, 'start', 1], [1, 5, 'walk', 1], [2, 5, 'walk', 1]], 'fell': 0},
      f'walking right into a left ramp\'s back: stuck before it ({E("rampLBack")})')
want = [[5, 4, 'start', 1], [5, 5, 'fall', 1]]
for lap in range(5):   # B, A, B, A, then B a third time: dizzy
    d = 1 if lap % 2 == 0 else L
    cols = range(6 if lap == 0 else 3, 9) if d == 1 else range(7, 1, -1)
    want += [[c, 5, 'walk', d] for c in cols]
    if lap < 4:
        want.append([8 if d == 1 else 2, 5, 'turn', -d])
check(E('dizzy') == {'out': 'dizzy', 'steps': want, 'fell': 0},
      f'two signposts facing: turned twice at each, at the third turn it sits down dizzy (D-190), by hand ({len(want)} steps; got {E("dizzy") if not isinstance(E("dizzy"), dict) else (E("dizzy")["out"], len(E("dizzy")["steps"]))})')
check(E('bounce') == {'out': 'home', 'steps': [[9, 4, 'start', 1], [9, 5, 'fall', 1], [10, 5, 'walk', 1], [10, 5, 'turn', L], [9, 5, 'walk', L],
                                               [8, 5, 'walk', L], [7, 5, 'walk', L], [6, 5, 'walk', L], [5, 2, 'bounce', L], [4, 2, 'walk', L], [3, 2, 'walk', L]], 'fell': 0},
      f'walking left, a bouncer throws it up and one square left, by hand ({E("bounce")})')
check(E('tubes') == {'out': 'home', 'steps': [[9, 4, 'start', 1], [9, 5, 'fall', 1], [10, 5, 'walk', 1], [10, 5, 'turn', L], [9, 5, 'walk', L],
                                              [8, 5, 'walk', L], [7, 5, 'walk', L], [6, 5, 'walk', L], [6, 4, 'tube', L], [6, 3, 'tube', L], [5, 3, 'walk', L], [4, 3, 'walk', L]], 'fell': 0},
      f'walking left, up three tubes and out on the left, by hand ({E("tubes")})')
check(E('edge') == {'out': 'stuck', 'steps': [[3, 4, 'start', 1], [3, 5, 'fall', 1], [4, 5, 'walk', 1], [5, 5, 'walk', 1], [5, 5, 'turn', L],
                                              [4, 5, 'walk', L], [3, 5, 'walk', L], [2, 5, 'walk', L], [1, 5, 'walk', L], [0, 5, 'walk', L]], 'fell': 0},
      f'walking off the board\'s left edge: stuck, as the right edge (D-190), by hand ({E("edge")})')
check(E('fallIn') == {'out': 'stuck', 'steps': [[0, 3, 'start', 1], [1, 3, 'walk', 1], [2, 3, 'walk', 1], [2, 4, 'fall', 1], [2, 5, 'fall', 1],
                                                [2, 5, 'turn', L], [1, 5, 'walk', L], [0, 5, 'walk', L]], 'fell': 0},
      f'falling into a signpost\'s square turns it round too, by hand ({E("fallIn")})')
check(isinstance(E('saw'), dict) and E('saw')['out'] == 'stuck' and E('saw')['steps'][-1] == [6, 4, 'walk', L],
      f'walking left to a see-saw: stuck before it (the see-saw stays left to right only, assessment 0.2) ({E("saw") if not isinstance(E("saw"), dict) else E("saw")["steps"][-1:]})')
check(E('lift') == {'outs': ['home'] * 5, 'first': [[9, 3, 'start', 1], [9, 4, 'fall', 1], [10, 4, 'walk', 1], [10, 4, 'turn', L], [9, 4, 'walk', L], [8, 4, 'walk', L],
                                                      [7, 4, 'walk', L], [6, 4, 'walk', L], [5, 4, 'walk', L], [5, 3, 'ride', L], [5, 2, 'ride', L], [5, 1, 'ride', L],
                                                      [4, 1, 'walk', L], [3, 1, 'walk', L], [2, 1, 'walk', L], [1, 1, 'walk', L]]},
      f'walking left, a teacup lift takes them up from its right side; all five home (run()), by hand ({E("lift")})')
check(E('fitsNew') == [True, True, False, False, True, False],
      f'a signpost and a left ramp go on a floor, not in the air; a left ramp holds a hamster, a signpost doesn\'t ({E("fitsNew")})')
check(E('runTurn') == {'outs': ['home'] * 5, 'turnTicks': 2}, f'run(): all five turn, climb the left ramp and get home; a turn takes 2 ticks ({E("runTurn")})')


# the zip-line's rules, by an exact test of this file's own (fractions), to cross-check core.js's
def _zip_expect(rows, placed=None):
    placed = placed or {}
    R, C = len(rows), len(rows[0])
    solid = lambda c, r: 0 <= r < R and 0 <= c < C and rows[r][c] == '#'
    empty = lambda c, r: 0 <= r < R and 0 <= c < C and rows[r][c] == '.' and f'{c},{r}' not in placed
    floor = lambda c, r: solid(c, r) or placed.get(f'{c},{r}') == 'bridge'

    def crosses(a, b, c, r):   # does the segment between the middles of a and b cross the open square (c, r)? (Liang-Barsky, exact)
        x0, y0, x1, y1 = _Fr(2 * a[0] + 1, 2), _Fr(2 * a[1] + 1, 2), _Fr(2 * b[0] + 1, 2), _Fr(2 * b[1] + 1, 2)
        dx, dy, t0, t1 = x1 - x0, y1 - y0, _Fr(0), _Fr(1)
        for p, q in ((-dx, x0 - c), (dx, c + 1 - x0), (-dy, y0 - r), (dy, r + 1 - y0)):
            if p == 0:
                if q <= 0:
                    return False
            elif p < 0:
                t0 = max(t0, q / p)
            else:
                t1 = min(t1, q / p)
        return t0 < t1

    def lows(h):
        hc, hr = h
        if not (empty(hc, hr) and solid(hc, hr - 1)):
            return []
        return [[c, r] for r in range(R) for c in range(C) if r > hr and 2 <= abs(c - hc) <= 10 and empty(c, r) and floor(c, r + 1)
                and not any(crosses(h, (c, r), cc, rr) for rr in range(R) for cc in range(C) if solid(cc, rr))]
    return {f'{c},{r}': lows((c, r)) for r in range(R) for c in range(C)}


ZB = ['................', '................', '.######.........', 'S...............', '#####...........', '#####.........G.',
      '#####....#..####', '#####....#..####', '#####....#..####']
zx = _zip_expect(ZB)
z = E('zip')
zhighs = [[int(v) for v in k.split(',')] for k, ls in zx.items() if ls]
check(isinstance(z, dict) and z['lows'] == zx, f'zip-line: the low ends from every square of the 16 x 9 test board match an exact test of this file\'s own '
      f'({sum(len(v) for v in zx.values())} pairs; {"same" if isinstance(z, dict) and z["lows"] == zx else z if not isinstance(z, dict) else "differ"})')
check(isinstance(z, dict) and z['highs'] == zhighs == z['fitCells'] and zx['4,3'] == [[9, 5], [12, 5], [13, 5]] and zx['1,3'] == [],
      f'zip-line: the high ends are the squares under a block with a low end; from 4,3 the lows are 9,5, 12,5 and 13,5, by hand; '
      f'1,3 has none (its line to 9,5 crosses the block at 4,4) ({zhighs})')
check(isinstance(z, dict) and z['fitsZip'] == [True, False, False] and z['pairOk'] == [True, True, False, False, False, False, False, False],
      f'zip-line: fits at 4,3, not at 1,3 (no low) nor 4,1 (no block above); 4,3 to 12,5 and 13,5 yes; to 8,4 (no floor), from 1,3 to 9,5 (a block across), '
      f'11 across, to itself, from a used high end or to a used low end: no ({z.get("fitsZip") if isinstance(z, dict) else z}, {z.get("pairOk") if isinstance(z, dict) else ""})')
check(isinstance(z, dict) and z['onBridge'] == [False, True] and _zip_expect(ZB, {'10,6': 'bridge'})['4,3'] == [[9, 5], [10, 5], [12, 5], [13, 5]],
      f'zip-line: a low end may be on a bridge (D-196 "on a floor") ({z.get("onBridge") if isinstance(z, dict) else z})')
check(isinstance(z, dict) and z['pair'] == {'4,3': 'zip:12,5', '12,5': 'peg:4,3'} and z['terrain'] == ['zip', 'peg'] and z['holds'] == [False, False]
      and z['left'] == {'zip': 1, 'bridge': 1} and z['noFit'] == [False, False],
      f'zip-line: placed as a pair, each end naming the other; counted once in the tray; nothing else fits on either end; neither end holds a hamster '
      f'({ {k: z.get(k) for k in ("pair", "terrain", "holds", "left", "noFit")} if isinstance(z, dict) else z})')
zr = E('zipRide')
zsteps = [[0, 3, 'start', 1], [1, 3, 'walk', 1], [2, 3, 'walk', 1], [3, 3, 'walk', 1], [4, 3, 'walk', 1]] \
    + [[4 + i, 3 + 2 * i / 8, 'zip', 1] for i in range(1, 9)] + [[13, 5, 'walk', 1], [14, 5, 'walk', 1]]
check(isinstance(zr, dict) and zr['out'] == 'home' and zr['steps'] == zsteps and zr['none'] == 'splash',
      f'zip-line: into the high end at 4,3, eight columns down the line a square a step, off at 12,5 and on home; without it, a splash, by hand '
      f'({zr if not isinstance(zr, dict) else (zr["out"], zr["steps"][4:7], zr["none"])})')
check(isinstance(zr, dict) and zr['outs'] == ['home'] * 5 and zr['zipTicks'] == [1] * 8,
      f'zip-line: run(): all five ride their own reel home, a column a tick (twice walking speed, D-196) ({zr.get("outs") if isinstance(zr, dict) else zr}, {zr.get("zipTicks") if isinstance(zr, dict) else ""})')
zb = E('zipBounce')
check(zb == {'out': 'home', 'steps': [[0, 5, 'start', 1], [1, 5, 'walk', 1], [2, 5, 'walk', 1], [3, 5, 'walk', 1], [4, 2, 'bounce', 1]]
             + [[4 + i, 2 + 3 * i / 5, 'zip', 1] for i in range(1, 6)] + [[10, 5, 'walk', 1], [11, 5, 'walk', 1]]},
      f'zip-line: a bouncer throws a hamster into a high end and it grabs the reel (a block above, so it can\'t fall in), by hand ({zb})')
zl = E('zipLeft')
zlsteps = [[9, 3, 'start', 1], [10, 3, 'walk', 1]] + [[10 - i, 3 + 2 * i / 8, 'zip', L] for i in range(1, 9)] + [[1, 5, 'walk', L]]
check(isinstance(zl, dict) and zl['ok'] and zl['out'] == 'home' and zl['steps'] == zlsteps and zl['none'] == 'splash',
      f'zip-line leftwards: a hamster walking right slides left and walks on left, facing the way it slid (D-196), by hand '
      f'({zl if not isinstance(zl, dict) else (zl["out"], zl["steps"][-2:], zl["none"])})')

# levels 1 to 20 run byte-identically to the pins written from core.js 1.6 before the change (pin_hamster_runs.py)
sys.path.insert(0, HERE)
import pin_hamster_runs
_ok, _what = pin_hamster_runs.pinned()
check(_ok, _what)

# boundaries
IMPURE = re.compile(r'\b(document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|Math\.random|Date|'
                    r'performance|setTimeout|setInterval|requestAnimationFrame|eval|Function|AudioContext|navigator)\b')


def code_only(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return '\n'.join(re.sub(r'(^|[^:])//.*$', r'\1', line) for line in text.split('\n'))


for f in ('core.js', 'levels.js', 'art.js', 'house.js', 'progress.js', 'cards.js'):
    p = os.path.join(GAME, f)
    if not os.path.exists(p):
        check(False, f'{f} exists')
        continue
    code = code_only(open(p, encoding='utf-8').read())
    hits = sorted({m.group(0) for m in IMPURE.finditer(code)})
    check(not hits, f'{f} is pure: no page, clock or randomness ({hits})')
    specs = re.findall(r"^\s*import\s.*?from\s+'([^']+)'", code, re.M) + re.findall(r'^\s*import\s+[\'"]([^\'"]+)', code, re.M)
    allowed = ['./art.js'] if f in ('house.js', 'cards.js') else []
    check(all(sp in allowed for sp in specs), f'{f} imports {"only art.js" if allowed else "nothing"} ({specs})')
for f in sorted(os.listdir(GAME)):
    if f.endswith('.js'):
        specs = re.findall(r"^\s*import\s.*?from\s+'([^']+)'", open(os.path.join(GAME, f), encoding='utf-8').read(), re.M)
        bad = [s for s in specs if not (s.startswith('./') and '/' not in s[2:]) and not s.startswith('../_common/')]
        check(not bad, f'{f} imports only from its own folder or games/_common/ (GC4) ({bad})')

print('All good.' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
