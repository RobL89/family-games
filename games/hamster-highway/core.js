// Hamster Highway's rules: the board, where each gadget fits, and where the hamsters go. Version 1.1.
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
// A level's board is 7 rows of 12 characters, top row first:
//   '#' ground   '.' air   'S' where the hamsters come out   'G' their home   '*' a golden seed (in air)
// Placed gadgets are { 'c,r': kind }, kind one of GADGETS.

export const COLS = 12;
export const ROWS = 7;
export const GADGETS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick'];
export const BIG_FALL = 3;   // squares: a drop of 3 or more is a funny fall (D-136)
export const BOUNCE = 3;     // squares a bouncer throws a hamster straight up, before one square on
export const SNAP = 4;       // a worn stick snaps under its fourth hamster (D-143)
export const WALKERS = 5;    // hamsters a GO sends out (brief)
export const RELEASE = 6;    // ticks between one hamster coming out and the next
export const LIFT_STOP = 6;  // ticks a teacup waits at each end
export const LIFT_MOVE = 3;  // ticks a teacup takes to move one row
export const TICKS = { walk: 2, climb: 3, bounce: 4, fall: 1, float: 2, tube: 2, wait: 1, ride: LIFT_MOVE };   // a step's length
const MAX_TICKS = 3000;      // a run ends here, anyone still out counted stuck

const MARKS = '#.SG*';
const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube', 'stick']);   // what a hamster can stand on
const FLOOR = new Set(['#', 'bridge']);                    // what a ramp, bouncer or floater can stand on (not a worn stick)
const SIDE = new Set(['#', 'bridge', 'stick']);            // what a bridge or worn stick can go beside

export const key = (c, r) => `${c},${r}`;

export function parseLevel(def) {
  const rows = def && def.rows;
  if (!Array.isArray(rows) || rows.length !== ROWS || rows.some((row) => typeof row !== 'string' || row.length !== COLS)) {
    throw new Error(`level ${def && def.id}: the board must be ${ROWS} rows of ${COLS}`);
  }
  const found = { S: [], G: [], '*': [] };
  rows.forEach((row, r) => {
    for (let c = 0; c < COLS; c++) {
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
  for (const p of def.parts || []) {
    const ok = p && p.kind === 'lift' && [p.c, p.top, p.bottom].every(Number.isInteger) && p.c >= 0 && p.c < COLS && p.top >= 1 && p.bottom < ROWS && p.top < p.bottom;
    if (!ok) throw new Error(`level ${def.id}: bad part ${JSON.stringify(p)}`);
    for (let r = p.top - 1; r <= p.bottom; r++) {
      if (rows[r][p.c] !== '.') throw new Error(`level ${def.id}: the lift part's shaft must be clear at ${p.c},${r}`);
      shaft.add(key(p.c, r));
    }
    parts.push({ kind: 'lift', c: p.c, top: p.top, bottom: p.bottom });
  }
  return { id: def.id, rows, start: found.S[0], home: found.G[0], seed: found['*'][0] || null, tray, parts, shaft };
}

// A teacup lift's loop: stopped at the bottom for LIFT_STOP ticks, up a row every LIFT_MOVE, stopped at the top,
// down again. cupRow is the row the cup is the floor of at tick t (between two rows while it moves); cupStop says
// which end it is stopped at, and the tick it leaves, or null while it moves.
const loop = (p) => { const run = (p.bottom - p.top) * LIFT_MOVE; return { run, all: 2 * (LIFT_STOP + run) }; };
export function cupRow(p, t) {
  const { run, all } = loop(p);
  const u = ((t % all) + all) % all;
  if (u < LIFT_STOP) return p.bottom;
  if (u < LIFT_STOP + run) return p.bottom - (u - LIFT_STOP) / LIFT_MOVE;
  if (u < 2 * LIFT_STOP + run) return p.top;
  return p.top + (u - 2 * LIFT_STOP - run) / LIFT_MOVE;
}
export function cupStop(p, t) {
  const { run, all } = loop(p);
  const u = ((t % all) + all) % all;
  if (u < LIFT_STOP) return { end: 'bottom', leaves: t - u + LIFT_STOP };
  if (u >= LIFT_STOP + run && u < 2 * LIFT_STOP + run) return { end: 'top', leaves: t - u + 2 * LIFT_STOP + run };
  return null;
}

// What is in a square: '#', '.', 'S', 'G', a gadget's kind, 'shaft' (a lift's, where its cup goes and a hamster
// rides), or null off the sides or below the bottom.
// Above the top is open air. A golden seed's square is air.
export function terrain(level, placed, c, r) {
  if (c < 0 || c >= COLS || r >= ROWS) return null;
  if (r < 0) return '.';
  const g = placed[key(c, r)];
  if (g) return g;
  if (level.shaft && level.shaft.has(key(c, r))) return 'shaft';
  const ch = level.rows[r][c];
  return ch === '*' ? '.' : ch;
}

export const holds = (level, placed, c, r) => HOLDS.has(terrain(level, placed, c, r));

// Anywhere it fits (D-139): never on the start, home, seed, ground or another gadget. A bridge (or worn stick) goes
// where a hamster would fall through, beside ground or another bridge; a ramp, bouncer or floater
// on ground or a bridge; a tube on any empty square.
export function fits(level, placed, kind, c, r) {
  if (!GADGETS.includes(kind) || c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (level.rows[r][c] !== '.' || placed[key(c, r)] || (level.shaft && level.shaft.has(key(c, r)))) return false;
  const below = terrain(level, placed, c, r + 1);
  if (kind === 'bridge' || kind === 'stick') {
    const side = (dc) => SIDE.has(terrain(level, placed, c + dc, r));
    return !HOLDS.has(below) && (side(-1) || side(1));
  }
  if (kind === 'tube') return true;
  return FLOOR.has(below);
}

export function fitCells(level, placed, kind) {
  const out = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (fits(level, placed, kind, c, r)) out.push([c, r]);
  return out;
}

// How many of each gadget are still in the tray.
export function left(level, placed) {
  const n = { ...level.tray };
  for (const kind of Object.values(placed)) n[kind] = (n[kind] || 0) - 1;
  return n;
}

// One hamster's trip, a step at a time (a generator, so run() can move five together). It reads the world through
// ctx: at(c, r) and holds(c, r), which may change as others pass; stand(c, r), as it stands there, true if a worn
// stick under it snaps; take(c, r), true if this hamster takes the golden seed there; and, for a lift, stop(c, r), canBoard(stop), board(stop) and leave(stop), and now(), the tick.
// It yields steps { c, r, act } (act: 'start', 'walk', 'climb', 'bounce', 'fall', 'float', 'tube', 'wait' or 'ride';
// dur: ticks, where not TICKS[act]; seed: true on the step that takes the seed; land: rows fallen, on a landing's
// last step, set when it lands) and returns { outcome, fell }: 'home' | 'splash' | 'bonk' | 'stuck' | 'bonk-head'.
export function* trip(level, ctx) {
  const at = ctx.at;
  let [c, r] = level.start;
  let floater = false;
  let riding = null;
  const tubed = new Set();
  const touch = (st, cc, rr) => { if (ctx.take(cc, rr)) st.seed = true; return st; };
  const done = (outcome, fell = 0) => { if (riding) ctx.leave(riding); riding = null; return { outcome, fell }; };
  yield { c, r, act: 'start' };
  for (let guard = 0; guard < 400; guard++) {
    const k = at(c, r);
    if (k === 'G') return done('home');
    if (k === 'bouncer') {
      for (let i = 1; i <= BOUNCE; i++) if (r - i < 0 || at(c, r - i) === '#') return done('bonk-head');
      const c0 = c;
      r -= BOUNCE;
      const on = at(c + 1, r);
      if (on !== null && on !== '#') c += 1;
      const st = { c, r, act: 'bounce' };
      for (let i = 1; i <= BOUNCE; i++) touch(st, c0, r + BOUNCE - i);
      yield touch(st, c, r);
    }
    if (k === 'floater') floater = true;
    if (k === 'tube' && !tubed.has(key(c, r))) {
      const chain = [[c, r]];
      for (;;) {
        const [lc, lr] = chain[chain.length - 1];
        const next = [[lc, lr - 1], [lc + 1, lr], [lc, lr + 1], [lc - 1, lr]]
          .find(([nc, nr]) => at(nc, nr) === 'tube' && !chain.some(([pc, pr]) => pc === nc && pr === nr));
        if (!next) break;
        chain.push(next);
      }
      for (const [tc, tr] of chain) tubed.add(key(tc, tr));
      for (const [tc, tr] of chain.slice(1)) yield touch({ c: tc, r: tr, act: 'tube' }, tc, tr);
      [c, r] = chain[chain.length - 1];
    }
    let fell = 0;
    let last = null;
    for (;;) {
      while (!ctx.holds(c, r + 1)) {
        if (r + 1 >= ROWS) {
          yield { c, r: r + 1, act: floater ? 'float' : 'fall' };
          return done('splash', fell + 1);
        }
        r += 1;
        fell += 1;
        last = touch({ c, r, act: floater ? 'float' : 'fall' }, c, r);
        yield last;
      }
      if (!ctx.stand(c, r)) break;   // a worn stick that snaps under it: on down
    }
    if (fell) last.land = fell;
    if (fell >= BIG_FALL && !floater) return done('bonk', fell);
    if (fell) floater = false;
    if (at(c, r) === 'G') return done('home');
    const next = at(c + 1, r);
    if (next === 'shaft') {
      // a teacup lift: wait at the edge for the empty cup, step in, ride to the other end, then on as usual
      const stop = ctx.stop(c + 1, r);
      if (!stop) return done('stuck');
      while (!ctx.canBoard(stop)) yield { c, r, act: 'wait' };
      ctx.board(stop);
      riding = stop;
      c += 1;
      yield touch({ c, r, act: 'walk' }, c, r);
      const leaves = ctx.leaves(stop);
      if (leaves > ctx.now()) yield { c, r, act: 'wait', dur: leaves - ctx.now() };
      const dir = stop.end === 'bottom' ? -1 : 1;
      for (let i = stop.part.bottom - stop.part.top; i > 0; i--) {
        r += dir;
        yield touch({ c, r, act: 'ride' }, c, r);
      }
      continue;
    }
    if (next === null || next === '#') return done('stuck');
    if (riding) { ctx.leave(riding); riding = null; }
    let st;
    if (next === 'ramp') {
      if (at(c + 1, r - 1) === '#') return done('stuck');
      c += 1;
      r -= 1;
      st = { c, r, act: 'climb' };
    } else {
      c += 1;
      st = { c, r, act: 'walk' };
    }
    yield touch(st, c, r);
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
  const parts = level.parts || [];
  const at = (c, r) => terrain(level, placed, c, r);
  return {
    events,
    setNow: (tick) => { t = tick; },
    ctx: (who) => ({
      at,
      now: () => t,
      holds: (c, r) => holds(level, placed, c, r) || parts.some((p) => p.c === c && cupRow(p, t) === r),
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
      take: (c, r) => {
        if (!seed || level.seed[0] !== c || level.seed[1] !== r) return false;
        seed = false;
        return true;
      },
      stop: (c, r) => {
        const part = parts.find((p) => p.c === c && (r === p.top - 1 || r === p.bottom - 1));
        return part ? { part, end: r === part.top - 1 ? 'top' : 'bottom' } : null;
      },
      canBoard: (s) => {
        const cs = cupStop(s.part, t);
        return !riders.has(s.part) && !!cs && cs.end === s.end && cs.leaves - t >= TICKS.walk;
      },
      leaves: (s) => { const cs = cupStop(s.part, t); return cs ? cs.leaves : t; },
      board: (s) => { riders.set(s.part, who); },
      leave: (s) => { if (riders.get(s.part) === who) riders.delete(s.part); },
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
