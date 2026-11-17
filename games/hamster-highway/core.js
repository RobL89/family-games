// Hamster Highway's rules: the board, where each gadget fits, and where the hamsters go. Version 1.7.
//
// Changes at v1.7 (step 13, the spike: D-185, D-190, D-196; assessment-tall-boards-signpost.md 0.2):
//   - boards 7 to 9 rows (MAX_ROWS), each level its own height, read from its rows (level.height), as v1.2 made the
//     width; levels 1 to 20 stay 7 rows, and run byte-identically (tools/tests/games/pin_hamster_runs.py);
//   - hamsters walk both ways: a trip keeps a facing (d, +1 right, -1 left), and a step says dir: -1 while its hamster
//     faces left (an added field, as v1.6's carry). The twig signpost ('signpost', on a floor) turns round a hamster
//     that ends a step in its square, falling in too (a 'turn' step); at the same signpost a third time it sits down
//     dizzy ('dizzy'); walking back into the start square it naps ('nap'); off the left edge it is stuck. A left ramp
//     ('rampL', its own tray slot, D-190 (a)) climbs walking left; a ramp's back is a step either way. A bouncer throws
//     it one square on the way it faces, tubes join up the way it faces, a teacup lift takes it from either side; a
//     left-walker reaching a see-saw is stuck (the see-saw stays left to right only);
//   - the zip-line ('zip', D-196): placed as a pair, the high end 'zip:lc,lr' in an empty square under a block, the
//     low end 'peg:hc,hr' in an empty square on a floor (ground or a bridge), 1 or more rows lower and ZIP_MIN to
//     ZIP_MAX across either way, the line between the two middles crossing no block (exactly: touching a corner isn't
//     crossing); zipHighs(), zipLows(), fitsZip(), zipPair(). A hamster that ends a step in the high end slides down
//     the line a column a step ('zip', 1 tick: twice walking speed), lets go at the low end and walks on the way it
//     slid. Each hamster has its own reel, so nobody waits.
//
// Changes at v1.6 (step 10b, D-177 (3), D-178, D-179): a step taken while a hamster holds the dandelion clock says
// carry: true, from the step after it reaches the floater's square until it lands (its last float step), so game.js
// can draw it held overhead. An added field: nothing else changes.
//
// Changes at v1.5 (step 10b, D-177 (1), ER-013): a worn stick also fits above a worn stick, so sticks one under the
// other go down in either order (a placed stick holds, so the lower one first used to refuse the upper).
//
// Changes at v1.4 (Rob's look at preview 7, D-163): a teacup takes up to SEATS (2) hamsters, side by side; the second
// in (seat 1) waits SHARE_WAIT ticks at the other end before stepping out, so the two keep apart. A hamster's steps
// in and on a cup say its seat.
//
// Changes at v1.3 (step 4, D-157): a teacup lift may have two cups on its loop ({ kind: 'lift', c, top, bottom,
// cups: 2 }; 1 if it says nothing), half a loop apart, so one goes up as the other comes down; still one hamster a
// cup. cupRow(p, t, k) and cupStop(p, t, k) give cup k's place; a hamster boards whichever empty cup is stopped at
// its end, and its 'ride' steps say which (cup).
//
// Changes at v1.2 (step 4, D-156, D-158): boards may be 12 to 24 squares wide (MAX_COLS), each level its own width,
// read from its rows (level.cols); 7 tall as before. And the see-saw, a part ({ kind: 'seesaw', c, r }): a plank over
// columns c to c+2 on a flowerpot under c+1, where a hamster stands on row r at the middle. At rest its near end is
// down (they stand on rows r+1, r, r-1 along it); tipped, the far end is down (r-1, r, r+1). Along the plank a
// hamster climbs or steps down; it can't step up onto it from outside. One that reaches the high far end waits there
// for a friend (SEESAW_WAIT ticks, then naps); when two (PAIR) stand on the far end it tips, in TIP ticks, and stays
// tipped for the rest of the run; anyone on it moves with it ('tilt' steps). run() lists the tip in events.
//
// Changes at v1.1 (step 3, D-143, D-153): the worn lolly stick, a sixth gadget ('stick'): it fits and holds like a
// bridge, takes nothing on it, gets a crack with each hamster that stands on it, and snaps under the fourth (SNAP); run() lists the
// cracks and snaps in events. And (the spike, D-144): the timed model. run() moves all five hamsters together, tick by tick,
// so a moving part can matter: one hamster's trip is now a generator (trip), and walk() is that trip with
// nothing moving, giving the same routes as v1.0.1. A level may have parts: a teacup lift ({ kind: 'lift', c,
// top, bottom }), a cup in column c that stops at rows top and bottom (the rows it is the floor of) and carries
// one hamster at a time on a slow loop (cupRow). A hamster waits at its edge for the empty cup, rides to the
// other end and walks off. Lengths are in ticks; game.js decides how long a tick is.
//
// Changes at v1.0.1 (D-146): its test's new name, test_hamster_highway_core.py; the rules are unchanged.
//
// Pure (project rules): no page, no clock, no randomness, nothing fetched. The walker rules are
// brief 0.3's (D-136), first modelled in tools/tests/games/sketch_bridge_builder.py; placing is
// "anywhere it fits" (D-139); golden seeds are D-138's. tools/tests/games/test_hamster_highway_core.py
// checks every function here, against the sketch model's own outcomes.
//
// A level's board is 7 to 9 rows of 12 to 24 characters, top row first:
//   '#' ground   '.' air   'S' where the hamsters come out   'G' their home   '*' a golden seed (in air)
// Placed gadgets are { 'c,r': kind }, kind one of GADGETS, but a zip-line's two ends: 'zip:lc,lr' and 'peg:hc,hr'.

export const COLS = 12;       // a board's narrowest, and levels 1 to 7's width
export const MAX_COLS = 24;   // the widest (D-158)
export const ROWS = 7;       // a board's lowest, and levels 1 to 20's height
export const MAX_ROWS = 9;   // the tallest (D-185)
export const GADGETS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'rampL', 'signpost', 'zip'];
export const ZIP_MIN = 2;    // squares across a zip-line spans, at least (D-196)
export const ZIP_MAX = 10;   // and at most
export const DIZZY = 3;      // turned round at one signpost this many times, a hamster sits down dizzy (D-190)
export const BIG_FALL = 3;   // squares: a drop of 3 or more is a funny fall (D-136)
export const BOUNCE = 3;     // squares a bouncer throws a hamster straight up, before one square on
export const SNAP = 4;       // a worn stick snaps under its fourth hamster (D-143)
export const WALKERS = 5;    // hamsters a GO sends out (brief)
export const RELEASE = 6;    // ticks between one hamster coming out and the next
export const LIFT_STOP = 6;  // ticks a teacup waits at each end
export const LIFT_MOVE = 3;  // ticks a teacup takes to move one row
export const TIP = 4;        // ticks a see-saw takes to tip
export const SEATS = 2;      // hamsters a teacup takes at once, side by side (D-163)
export const SHARE_WAIT = 4; // ticks the second in a cup waits at the other end before stepping out (D-163)
export const PAIR = 2;       // hamsters on its far end that tip it (D-144)
export const SEESAW_WAIT = 24;   // ticks a hamster waits on a see-saw's high end for a friend before it naps
export const TICKS = { walk: 2, climb: 3, bounce: 4, fall: 1, float: 2, tube: 2, wait: 1, ride: LIFT_MOVE, tilt: TIP, turn: 2, zip: 1 };   // a step's length
const MAX_TICKS = 3000;      // a run ends here, anyone still out counted stuck

const MARKS = '#.SG*';
const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube', 'stick', 'rampL']);   // what a hamster can stand on
const FLOOR = new Set(['#', 'bridge']);                    // what a ramp, bouncer or floater can stand on (not a worn stick)
const SIDE = new Set(['#', 'bridge', 'stick']);            // what a bridge or worn stick can go beside

export const key = (c, r) => `${c},${r}`;
const kindOf = (v) => (v ? v.split(':')[0] : v);   // a placed square's kind ('zip:12,5' is a zip-line's high end)
const tall = (level) => level.height || ROWS;

export function parseLevel(def) {
  const rows = def && def.rows;
  const cols = Array.isArray(rows) && typeof rows[0] === 'string' ? rows[0].length : 0;
  const height = Array.isArray(rows) ? rows.length : 0;
  if (!Array.isArray(rows) || height < ROWS || height > MAX_ROWS || cols < COLS || cols > MAX_COLS || rows.some((row) => typeof row !== 'string' || row.length !== cols)) {
    throw new Error(`level ${def && def.id}: the board must be ${ROWS} to ${MAX_ROWS} rows of ${COLS} to ${MAX_COLS} squares, all the same`);
  }
  const found = { S: [], G: [], '*': [] };
  rows.forEach((row, r) => {
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      if (!MARKS.includes(ch)) throw new Error(`level ${def.id}: unknown mark "${ch}" at ${c},${r}`);
      if (found[ch]) found[ch].push([c, r]);
    }
  });
  if (found.S.length !== 1 || found.G.length !== 1) throw new Error(`level ${def.id}: needs one start and one home`);
  if (found['*'].length > 1) throw new Error(`level ${def.id}: at most one golden seed`);
  const tray = {};
  for (const [kind, n] of Object.entries(def.tray || {})) {
    if (!GADGETS.includes(kind) || !Number.isInteger(n) || n < 1) throw new Error(`level ${def.id}: bad tray entry ${kind}`);
    tray[kind] = n;
  }
  const parts = [];
  const shaft = new Set();
  const space = new Set();
  for (const p of def.parts || []) {
    if (p && p.kind === 'seesaw') {
      const fine = [p.c, p.r].every(Number.isInteger) && p.c >= 1 && p.c + 2 < cols && p.r >= 1 && p.r + 2 < height;
      if (!fine) throw new Error(`level ${def.id}: bad part ${JSON.stringify(p)}`);
      const sq = [];
      for (let c = p.c; c <= p.c + 2; c++) for (let r = p.r - 1; r <= p.r + 2; r++) sq.push([c, r]);
      for (let r = p.r + 3; r < height && rows[r][p.c + 1] !== '#'; r++) sq.push([p.c + 1, r]);   // the flowerpot, down to the ground
      for (const [c, r] of sq) {
        if (rows[r][c] !== '.') throw new Error(`level ${def.id}: the see-saw part's space must be clear at ${c},${r}`);
        space.add(key(c, r));
      }
      parts.push({ kind: 'seesaw', c: p.c, r: p.r });
      continue;
    }
    const cups = p && p.cups === undefined ? 1 : p && p.cups;
    const ok = p && p.kind === 'lift' && [p.c, p.top, p.bottom].every(Number.isInteger) && p.c >= 0 && p.c < cols && p.top >= 1 && p.bottom < height && p.top < p.bottom
      && (cups === 1 || cups === 2);
    if (!ok) throw new Error(`level ${def.id}: bad part ${JSON.stringify(p)}`);
    for (let r = p.top - 1; r <= p.bottom; r++) {
      if (rows[r][p.c] !== '.') throw new Error(`level ${def.id}: the lift part's shaft must be clear at ${p.c},${r}`);
      shaft.add(key(p.c, r));
    }
    parts.push({ kind: 'lift', c: p.c, top: p.top, bottom: p.bottom, cups });
  }
  return { id: def.id, rows, cols, height, start: found.S[0], home: found.G[0], seed: found['*'][0] || null, tray, parts, shaft, space };
}

// A teacup lift's loop: stopped at the bottom for LIFT_STOP ticks, up a row every LIFT_MOVE, stopped at the top,
// down again. cupRow is the row cup k is the floor of at tick t (between two rows while it moves); cupStop says
// which end it is stopped at, and the tick it leaves, or null while it moves. Cup 0 starts at the bottom; a second
// cup (k 1) is half a loop on, at the top (D-157).
const loop = (p) => { const run = (p.bottom - p.top) * LIFT_MOVE; return { run, all: 2 * (LIFT_STOP + run) }; };
const phase = (p, t, k) => { const { all } = loop(p); const u = t + (k * all) / 2; return ((u % all) + all) % all; };
export function cupRow(p, t, k = 0) {
  const { run } = loop(p);
  const u = phase(p, t, k);
  if (u < LIFT_STOP) return p.bottom;
  if (u < LIFT_STOP + run) return p.bottom - (u - LIFT_STOP) / LIFT_MOVE;
  if (u < 2 * LIFT_STOP + run) return p.top;
  return p.top + (u - 2 * LIFT_STOP - run) / LIFT_MOVE;
}
export function cupStop(p, t, k = 0) {
  const { run } = loop(p);
  const u = phase(p, t, k);
  if (u < LIFT_STOP) return { end: 'bottom', leaves: t - u + LIFT_STOP };
  if (u >= LIFT_STOP + run && u < 2 * LIFT_STOP + run) return { end: 'top', leaves: t - u + 2 * LIFT_STOP + run };
  return null;
}

// A see-saw's plank: the row a hamster stands on at its square i (0 near end, 1 middle, 2 far end), at rest or tipped.
export function plankStand(p, i, tipped) {
  return p.r + (i - 1) * (tipped ? 1 : -1);
}

// What is in a square: '#', '.', 'S', 'G', a gadget's kind, 'shaft' (a lift's, where its cup goes and a hamster
// rides), 'seesaw' (a see-saw's space: air but for its plank, which run() knows), or null off the sides or below
// the bottom.
// Above the top is open air. A golden seed's square is air.
export function terrain(level, placed, c, r) {
  if (c < 0 || c >= (level.cols || COLS) || r >= tall(level)) return null;
  if (r < 0) return '.';
  const g = placed[key(c, r)];
  if (g) return kindOf(g);
  if (level.shaft && level.shaft.has(key(c, r))) return 'shaft';
  if (level.space && level.space.has(key(c, r))) return 'seesaw';
  const ch = level.rows[r][c];
  return ch === '*' ? '.' : ch;
}

export const holds = (level, placed, c, r) => HOLDS.has(terrain(level, placed, c, r));

// Anywhere it fits (D-139): never on the start, home, seed, ground or another gadget. A bridge (or worn stick) goes
// where a hamster would fall through, beside ground or another bridge; a worn stick also above a worn stick (D-177
// (1)); a ramp, left ramp, bouncer, floater or signpost
// on ground or a bridge; a tube on any empty square; a zip-line's high end where zipHighs() says.
const empty = (level, placed, c, r) => c >= 0 && c < (level.cols || COLS) && r >= 0 && r < tall(level) && level.rows[r][c] === '.' && !placed[key(c, r)]
  && !(level.shaft && level.shaft.has(key(c, r))) && !(level.space && level.space.has(key(c, r)));
export function fits(level, placed, kind, c, r) {
  if (!GADGETS.includes(kind) || !empty(level, placed, c, r)) return false;
  if (kind === 'zip') return zipLows(level, placed, c, r).length > 0;
  const below = terrain(level, placed, c, r + 1);
  if (kind === 'bridge' || kind === 'stick') {
    const side = (dc) => SIDE.has(terrain(level, placed, c + dc, r));
    const open = !HOLDS.has(below) || (kind === 'stick' && below === 'stick');
    return open && (side(-1) || side(1));
  }
  if (kind === 'tube') return true;
  return FLOOR.has(below);
}

export function fitCells(level, placed, kind) {
  const out = [];
  for (let r = 0; r < tall(level); r++) for (let c = 0; c < (level.cols || COLS); c++) if (fits(level, placed, kind, c, r)) out.push([c, r]);
  return out;
}

// The zip-line (D-196). Does the line between the middles of squares a and b cross the inside of square (c, r)? Exact,
// in whole numbers (Liang-Barsky on doubled units, comparing fractions by cross-multiplying): touching a corner or an
// edge isn't crossing.
function crosses(a, b, c, r) {
  const x0 = 2 * a[0] + 1;
  const y0 = 2 * a[1] + 1;
  const dx = 2 * (b[0] - a[0]);
  const dy = 2 * (b[1] - a[1]);
  let lo = [0, 1];   // the part of the line inside the square runs from t = lo to t = hi (fractions [n, d], d > 0)
  let hi = [1, 1];
  const less = (p, q) => p[0] * q[1] < q[0] * p[1];
  for (const [p, q] of [[-dx, x0 - 2 * c], [dx, 2 * c + 2 - x0], [-dy, y0 - 2 * r], [dy, 2 * r + 2 - y0]]) {
    if (p === 0) { if (q <= 0) return false; continue; }
    const t = p < 0 ? [-q, -p] : [q, p];
    if (p < 0) { if (less(lo, t)) lo = t; } else if (less(t, hi)) hi = t;
  }
  return less(lo, hi);
}
const clearLine = (level, a, b) => {
  for (let r = Math.min(a[1], b[1]); r <= Math.max(a[1], b[1]); r++) {
    for (let c = Math.min(a[0], b[0]); c <= Math.max(a[0], b[0]); c++) if (level.rows[r][c] === '#' && crosses(a, b, c, r)) return false;
  }
  return true;
};
const under = (level, c, r) => r >= 1 && level.rows[r - 1][c] === '#';   // a block straight above to hook under
// Where a zip-line's low end can go from a high end at hc, hr: empty, on a floor, lower, ZIP_MIN to ZIP_MAX across, the
// line clear (rows top first, then columns, as fitCells).
export function zipLows(level, placed, hc, hr) {
  if (!empty(level, placed, hc, hr) || !under(level, hc, hr)) return [];
  const out = [];
  for (let r = hr + 1; r < tall(level); r++) {
    for (let c = 0; c < (level.cols || COLS); c++) {
      const across = Math.abs(c - hc);
      if (across < ZIP_MIN || across > ZIP_MAX || !empty(level, placed, c, r) || !FLOOR.has(terrain(level, placed, c, r + 1))) continue;
      if (clearLine(level, [hc, hr], [c, r])) out.push([c, r]);
    }
  }
  return out;
}
export const zipHighs = (level, placed) => fitCells(level, placed, 'zip');
export function fitsZip(level, placed, hc, hr, lc, lr) {
  return zipLows(level, placed, hc, hr).some(([c, r]) => c === lc && r === lr);
}
// A placed zip-line, as the two squares it takes, each naming the other.
export const zipPair = (hc, hr, lc, lr) => ({ [key(hc, hr)]: `zip:${lc},${lr}`, [key(lc, lr)]: `peg:${hc},${hr}` });

// How many of each gadget are still in the tray (a zip-line counted once, by its high end).
export function left(level, placed) {
  const n = { ...level.tray };
  for (const v of Object.values(placed)) {
    const kind = kindOf(v);
    if (kind !== 'peg') n[kind] = (n[kind] || 0) - 1;
  }
  return n;
}

// One hamster's trip, a step at a time (a generator, so run() can move five together). It reads the world through
// ctx: at(c, r) and holds(c, r), which may change as others pass; stand(c, r), as it stands there, true if a worn
// stick under it snaps; take(c, r), true if this hamster takes the golden seed there; and, for a lift, stop(c, r),
// canBoard(stop), board(stop) (which sets stop.cup, the cup it boards), leaves(stop) and leave(stop), and now(), the tick;
// for a see-saw, plank(c, r) (the plank's square there now, if any: { part, i }), standAt(part, i), tipped(part),
// weigh(part) (it stands on the far end; true once it has tipped), unweigh(part) and carry(c, r) (where a tipping
// plank takes it: { r, dur }, or null); for a zip-line, zip(c, r): the low end of one whose high end is there, or null.
// It yields steps { c, r, act } (act: 'start', 'walk', 'climb', 'bounce', 'fall', 'float', 'tube', 'wait', 'ride', 'tilt',
// 'turn' or 'zip'; dur: ticks, where not TICKS[act]; seed: true on the step that takes the seed; land: rows fallen, on a
// landing's last step, set when it lands; carry: true while it holds the dandelion clock, D-179; dir: -1 while it faces
// left, D-190; a zip step's r is on the line, between rows) and returns { outcome, fell }: 'home' | 'splash' | 'bonk' |
// 'stuck' | 'bonk-head' | 'dizzy' | 'nap'.
export function* trip(level, ctx) {
  const at = ctx.at;
  let [c, r] = level.start;
  let d = 1;                 // the way it faces: +1 right, -1 left (D-190)
  let away = false;          // it has left the start square
  let floater = false;
  let riding = null;
  let waited = 0;
  const tubed = new Set();
  const turns = new Map();   // times turned at each signpost
  const touch = (st, cc, rr) => { if (ctx.take(cc, rr)) st.seed = true; return st; };
  const mark = (st) => { if (floater) st.carry = true; if (d < 0) st.dir = -1; return st; };   // holding the dandelion clock (D-179); facing left (D-190)
  const done = (outcome, fell = 0) => { if (riding) ctx.leave(riding); riding = null; return { outcome, fell }; };
  yield { c, r, act: 'start' };
  for (let guard = 0; guard < 600; guard++) {
    const k = at(c, r);
    if (k === 'G') return done('home');
    if (k === 'S' && away) return done('nap');   // back into the start tube (D-190)
    if (c !== level.start[0] || r !== level.start[1]) away = true;
    if (k === 'signpost') {
      const n = (turns.get(key(c, r)) || 0) + 1;
      turns.set(key(c, r), n);
      if (n >= DIZZY) return done('dizzy');
      d = -d;
      yield mark({ c, r, act: 'turn' });
    }
    if (k === 'zip') {
      // grab a reel and slide down the line a column a step, then let go and walk on the way it slid (D-196)
      const [lc, lr] = ctx.zip(c, r);
      const [hc, hr] = [c, r];
      const n = Math.abs(lc - hc);
      d = lc > hc ? 1 : -1;
      for (let i = 1; i <= n; i++) {
        c = hc + d * i;
        r = hr + ((lr - hr) * i) / n;
        yield mark(touch({ c, r, act: 'zip' }, c, Math.round(r)));
      }
      continue;
    }
    if (k === 'bouncer') {
      for (let i = 1; i <= BOUNCE; i++) if (r - i < 0 || at(c, r - i) === '#') return done('bonk-head');
      const c0 = c;
      r -= BOUNCE;
      const on = at(c + d, r);
      if (on !== null && on !== '#') c += d;
      const st = { c, r, act: 'bounce' };
      for (let i = 1; i <= BOUNCE; i++) touch(st, c0, r + BOUNCE - i);
      yield mark(touch(st, c, r));
      if (at(c, r) === 'zip') continue;   // thrown into a zip-line's high end: it grabs the reel
    }
    if (k === 'floater') floater = true;
    if (k === 'tube' && !tubed.has(key(c, r))) {
      const chain = [[c, r]];
      for (;;) {
        const [lc, lr] = chain[chain.length - 1];
        const next = [[lc, lr - 1], [lc + d, lr], [lc, lr + 1], [lc - d, lr]]
          .find(([nc, nr]) => at(nc, nr) === 'tube' && !chain.some(([pc, pr]) => pc === nc && pr === nr));
        if (!next) break;
        chain.push(next);
      }
      for (const [tc, tr] of chain) tubed.add(key(tc, tr));
      for (const [tc, tr] of chain.slice(1)) yield mark(touch({ c: tc, r: tr, act: 'tube' }, tc, tr));
      [c, r] = chain[chain.length - 1];
    }
    let fell = 0;
    let last = null;
    drop: for (;;) {
      for (;;) {
        const moved = ctx.carry(c, r);   // a see-saw tipping from under it, or up through it
        if (moved) {
          r = moved.r;
          yield mark(touch({ c, r, act: 'tilt', dur: moved.dur }, c, r));
          continue;
        }
        if (ctx.holds(c, r + 1)) break;
        if (r + 1 >= tall(level)) {
          yield mark({ c, r: r + 1, act: floater ? 'float' : 'fall' });
          return done('splash', fell + 1);
        }
        r += 1;
        fell += 1;
        last = mark(touch({ c, r, act: floater ? 'float' : 'fall' }, c, r));
        yield last;
        if (at(c, r) === 'zip') break drop;   // falling past a zip-line's high end: it grabs the reel
      }
      if (!ctx.stand(c, r)) break;   // a worn stick that snaps under it: on down
    }
    if (at(c, r) === 'zip') continue;
    if (fell) last.land = fell;
    if (fell >= BIG_FALL && !floater) return done('bonk', fell);
    if (fell) floater = false;
    if (at(c, r) === 'G') return done('home');
    if (fell && at(c, r) === 'signpost') continue;   // fallen into a signpost's square: it turns round there
    if (d < 0 && (ctx.plank(c, r + 1) || ctx.plank(c + d, r) || at(c + d, r) === 'seesaw')) return done('stuck');   // the see-saw: left to right only
    const on = ctx.plank(c, r + 1);
    if (on && on.i === 2 && !ctx.tipped(on.part)) {
      // a see-saw's high end: wait here for a friend; two tip it, and the carry above takes them down with it
      if (ctx.weigh(on.part)) continue;
      if (++waited > SEESAW_WAIT) { ctx.unweigh(on.part); return done('stuck'); }
      yield mark({ c, r, act: 'wait' });
      continue;
    }
    if (on && on.i < 2) {
      // along the plank: up or down a row a square
      const s = ctx.standAt(on.part, on.i + 1);
      if (s === r - 1 || s === r + 1) {
        const act = s === r - 1 ? 'climb' : 'walk';
        c += 1;
        r = s;
        yield mark(touch({ c, r, act }, c, r));
        continue;
      }
    }
    if (ctx.plank(c + 1, r)) return done('stuck');   // a see-saw's raised end: a step up from outside
    const next = at(c + d, r);
    if (next === 'shaft') {
      // a teacup lift: wait at the edge for the empty cup, step in, ride to the other end, then on as usual
      const stop = ctx.stop(c + d, r);
      if (!stop) return done('stuck');
      while (!ctx.canBoard(stop)) yield mark({ c, r, act: 'wait' });
      ctx.board(stop);
      riding = stop;
      c += d;
      yield mark(touch({ c, r, act: 'walk', seat: stop.seat }, c, r));
      const leaves = ctx.leaves(stop);
      if (leaves > ctx.now()) yield mark({ c, r, act: 'wait', dur: leaves - ctx.now(), seat: stop.seat });
      const dir = stop.end === 'bottom' ? -1 : 1;
      for (let i = stop.part.bottom - stop.part.top; i > 0; i--) {
        r += dir;
        yield mark(touch({ c, r, act: 'ride', cup: stop.cup, seat: stop.seat }, c, r));
      }
      if (stop.seat) yield mark({ c, r, act: 'wait', dur: SHARE_WAIT, seat: stop.seat });   // the second waits, so they keep apart
      continue;
    }
    if (next === null || next === '#') return done('stuck');
    if (riding) { ctx.leave(riding); riding = null; }
    let st;
    if (next === (d > 0 ? 'rampL' : 'ramp')) return done('stuck');   // a ramp's back: a step (D-190)
    if (next === (d > 0 ? 'ramp' : 'rampL')) {
      if (at(c + d, r - 1) === '#') return done('stuck');
      c += d;
      r -= 1;
      st = { c, r, act: 'climb' };
    } else {
      c += d;
      st = { c, r, act: 'walk' };
    }
    yield mark(touch(st, c, r));
  }
  return done('stuck');
}

// The world as run() and walk() share it: the board and gadgets (worn sticks go when they snap), the lifts' cups
// at tick now(), who rides each, who has cracked each worn stick, and the golden seed, taken once. events lists
// each crack and snap: { t, kind: 'crack' | 'snap', c, r, n: hamsters so far, who }.
function world(level, placed0, seedLeft) {
  let t = 0;
  let seed = seedLeft && !!level.seed;
  const placed = { ...placed0 };
  const riders = new Map();
  const worn = new Map();
  const events = [];
  const parts = (level.parts || []).filter((p) => p.kind === 'lift');
  const saws = (level.parts || []).filter((p) => p.kind === 'seesaw').map((p) => ({ p, tippedAt: null, far: new Set() }));
  const at = (c, r) => terrain(level, placed, c, r);
  const cups = (p) => Array.from({ length: p.cups || 1 }, (_, k) => k);
  const aboard = (p, k) => riders.get(`${p.c},${p.top},${k}`) || [];
  // the empty cup stopped at a stop's end with time to step in, if any
  const free = (s) => cups(s.part).find((k) => {
    const cs = cupStop(s.part, t, k);
    return aboard(s.part, k).length < SEATS && !!cs && cs.end === s.end && cs.leaves - t >= TICKS.walk;
  });
  const tipped = (s) => s.tippedAt !== null && s.tippedAt <= t;
  // the plank's square at c, r now, if any
  const plank = (c, r) => {
    for (const s of saws) {
      const i = c - s.p.c;
      if (i >= 0 && i <= 2 && plankStand(s.p, i, tipped(s)) + 1 === r) return { part: s, i };
    }
    return null;
  };
  return {
    events,
    setNow: (tick) => { t = tick; },
    ctx: (who) => ({
      at,
      now: () => t,
      holds: (c, r) => holds(level, placed, c, r) || parts.some((p) => p.c === c && cups(p).some((k) => cupRow(p, t, k) === r)) || !!plank(c, r),
      plank,
      standAt: (s, i) => plankStand(s.p, i, tipped(s)),
      tipped,
      weigh: (s) => {
        s.far.add(who);
        if (s.tippedAt === null && s.far.size >= PAIR) {
          s.tippedAt = t;
          events.push({ t, kind: 'tip', c: s.p.c, r: s.p.r, n: s.far.size, who });
        }
        return tipped(s);
      },
      unweigh: (s) => { s.far.delete(who); },
      carry: (c, r) => {
        for (const s of saws) {
          const i = c - s.p.c;
          if (i < 0 || i > 2 || !tipped(s)) continue;
          const was = plankStand(s.p, i, false);
          const now = plankStand(s.p, i, true);
          if (was !== now && (r === was || r === now + 1)) return { r: now, dur: Math.max(1, s.tippedAt + TIP - t) };
        }
        return null;
      },
      stand: (c, r) => {
        const k = key(c, r + 1);
        if (placed[k] !== 'stick') return false;
        const by = worn.get(k) || new Set();
        if (by.has(who)) return false;
        by.add(who);
        worn.set(k, by);
        const snap = by.size >= SNAP;
        events.push({ t, kind: snap ? 'snap' : 'crack', c, r: r + 1, n: by.size, who });
        if (snap) delete placed[k];
        return snap;
      },
      zip: (c, r) => {
        const v = placed[key(c, r)];
        return v && v.startsWith('zip:') ? v.slice(4).split(',').map(Number) : null;
      },
      take: (c, r) => {
        if (!seed || level.seed[0] !== c || level.seed[1] !== r) return false;
        seed = false;
        return true;
      },
      stop: (c, r) => {
        const part = parts.find((p) => p.c === c && (r === p.top - 1 || r === p.bottom - 1));
        return part ? { part, end: r === part.top - 1 ? 'top' : 'bottom' } : null;
      },
      canBoard: (s) => free(s) !== undefined,
      leaves: (s) => { const cs = cupStop(s.part, t, s.cup || 0); return cs ? cs.leaves : t; },
      board: (s) => { s.cup = free(s); const on = [...aboard(s.part, s.cup), who]; s.seat = on.length - 1; riders.set(`${s.part.c},${s.part.top},${s.cup}`, on); },
      leave: (s) => { const k = `${s.part.c},${s.part.top},${s.cup}`; riders.set(k, aboard(s.part, s.cup).filter((x) => x !== who)); },
    }),
  };
}

// One hamster on its own, with nothing moving (time stands at 0): the route v1.0's walk() gave. Returns
// { outcome, steps, seed, fell }; seed: whether it takes the golden seed (seedLeft: whether the seed is still there).
export function walk(level, placed, seedLeft = true) {
  const w = world(level, placed, seedLeft);
  const g = trip(level, w.ctx(0));
  const steps = [];
  let seed = false;
  for (;;) {
    const x = g.next();
    if (x.done) return { outcome: x.value.outcome, steps, seed, fell: x.value.fell };
    if (x.value.seed) seed = true;
    steps.push(x.value);
  }
}

// The whole GO: WALKERS hamsters, the first at tick 0 and each next RELEASE ticks later, all moving together,
// a tick at a time, in order (the first hamster first in each tick), so the same build always gives the same run.
// Returns { hamsters: [{ outcome, steps, seed, fell, end }], events, ticks }: each step has t0 and t1, its ticks; end is
// the tick a hamster's trip ends (home, or its fall or nap starts); ticks the last end.
export function run(level, placed, walkers = WALKERS) {
  const w = world(level, placed, true);
  const hs = Array.from({ length: walkers }, (_, i) => ({ i, gen: trip(level, w.ctx(i)), next: i * RELEASE, steps: [], outcome: null, seed: false, fell: 0, end: 0 }));
  let t = 0;
  for (; t <= MAX_TICKS && hs.some((h) => !h.outcome); t++) {
    w.setNow(t);
    for (const h of hs) {
      while (!h.outcome && h.next <= t) {
        const x = h.gen.next();
        if (x.done) {
          h.outcome = x.value.outcome;
          h.fell = x.value.fell;
          h.end = t;
          break;
        }
        const st = x.value;
        st.t0 = t;
        st.t1 = t + (st.act === 'start' ? 0 : st.dur || TICKS[st.act]);
        delete st.dur;
        if (st.seed) h.seed = true;
        h.steps.push(st);
        h.next = st.t1;
      }
    }
  }
  for (const h of hs) if (!h.outcome) { h.outcome = 'stuck'; h.end = MAX_TICKS; }
  return { hamsters: hs.map(({ outcome, steps, seed, fell, end }) => ({ outcome, steps, seed, fell, end })), events: w.events, ticks: Math.max(0, ...hs.map((h) => h.end)) };
}
