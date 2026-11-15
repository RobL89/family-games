// Hamster Highway's rules: the board, where each gadget fits, and where a hamster goes. Version 1.0.
//
// Pure (project rules): no page, no clock, no randomness, nothing fetched. The walker rules are
// brief 0.3's (D-136), first modelled in tools/tests/games/sketch_bridge_builder.py; placing is
// "anywhere it fits" (D-139); golden seeds are D-138's. tools/tests/games/test_bridge_builder_core.py
// checks every function here, against the sketch model's own outcomes.
//
// A level's board is 7 rows of 12 characters, top row first:
//   '#' ground   '.' air   'S' where the hamsters come out   'G' their home   '*' a golden seed (in air)
// Placed gadgets are { 'c,r': kind }, kind one of GADGETS.

export const COLS = 12;
export const ROWS = 7;
export const GADGETS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube'];
export const BIG_FALL = 3;   // squares: a drop of 3 or more is a funny fall (D-136)
export const BOUNCE = 3;     // squares a bouncer throws a hamster straight up, before one square on

const MARKS = '#.SG*';
const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube']);   // what a hamster can stand on
const FLOOR = new Set(['#', 'bridge']);                    // what a ramp, bouncer or floater can stand on

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
  return { id: def.id, rows, start: found.S[0], home: found.G[0], seed: found['*'][0] || null, tray };
}

// What is in a square: '#', '.', 'S', 'G', a gadget's kind, or null off the sides or below the bottom.
// Above the top is open air. A golden seed's square is air.
export function terrain(level, placed, c, r) {
  if (c < 0 || c >= COLS || r >= ROWS) return null;
  if (r < 0) return '.';
  const g = placed[key(c, r)];
  if (g) return g;
  const ch = level.rows[r][c];
  return ch === '*' ? '.' : ch;
}

export const holds = (level, placed, c, r) => HOLDS.has(terrain(level, placed, c, r));

// Anywhere it fits (D-139): never on the start, home, seed, ground or another gadget. A bridge goes
// where a hamster would fall through, beside ground or another bridge; a ramp, bouncer or floater
// on ground or a bridge; a tube on any empty square.
export function fits(level, placed, kind, c, r) {
  if (!GADGETS.includes(kind) || c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (level.rows[r][c] !== '.' || placed[key(c, r)]) return false;
  const below = terrain(level, placed, c, r + 1);
  if (kind === 'bridge') {
    const side = (dc) => FLOOR.has(terrain(level, placed, c + dc, r));
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

// One hamster's trip. Returns { outcome, steps, seed, fell }:
//   outcome: 'home' | 'splash' (off the bottom) | 'bonk' (a drop of BIG_FALL or more) | 'stuck' | 'bonk-head'
//   steps: [{ c, r, act }] from the start; act is 'start', 'walk', 'climb' (up a ramp), 'bounce' (to the top
//          of a bounce and one square on), 'fall', 'float' (falling with a floater) or 'tube'; the step on which
//          the golden seed is taken has seed: true, and the last step of a landing has land: rows fallen
//   seed: whether this hamster takes the golden seed (the first one through does; the game removes it after)
export function walk(level, placed, seedLeft = true) {
  const at = (c, r) => terrain(level, placed, c, r);
  let [c, r] = level.start;
  const steps = [{ c, r, act: 'start' }];
  let floater = false;
  let seed = false;
  const tubed = new Set();
  const touch = (cc, rr) => {
    if (seedLeft && !seed && level.seed && level.seed[0] === cc && level.seed[1] === rr) {
      seed = true;
      steps[steps.length - 1].seed = true;
    }
  };
  const done = (outcome, fell = 0) => ({ outcome, steps, seed, fell });
  for (let guard = 0; guard < 400; guard++) {
    const k = at(c, r);
    if (k === 'G') return done('home');
    if (k === 'bouncer') {
      for (let i = 1; i <= BOUNCE; i++) if (r - i < 0 || at(c, r - i) === '#') return done('bonk-head');
      const c0 = c;
      r -= BOUNCE;
      const on = at(c + 1, r);
      if (on !== null && on !== '#') c += 1;
      steps.push({ c, r, act: 'bounce' });
      for (let i = 1; i <= BOUNCE; i++) touch(c0, r + BOUNCE - i);
      touch(c, r);
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
      for (const [tc, tr] of chain.slice(1)) { steps.push({ c: tc, r: tr, act: 'tube' }); touch(tc, tr); }
      [c, r] = chain[chain.length - 1];
    }
    let fell = 0;
    while (!holds(level, placed, c, r + 1)) {
      if (r + 1 >= ROWS) {
        steps.push({ c, r: r + 1, act: floater ? 'float' : 'fall' });
        return done('splash', fell + 1);
      }
      r += 1;
      fell += 1;
      steps.push({ c, r, act: floater ? 'float' : 'fall' });
      touch(c, r);
    }
    if (fell) steps[steps.length - 1].land = fell;
    if (fell >= BIG_FALL && !floater) return done('bonk', fell);
    if (fell) floater = false;
    if (at(c, r) === 'G') return done('home');
    const next = at(c + 1, r);
    if (next === null || next === '#') return done('stuck');
    if (next === 'ramp') {
      if (at(c + 1, r - 1) === '#') return done('stuck');
      c += 1;
      r -= 1;
      steps.push({ c, r, act: 'climb' });
    } else {
      c += 1;
      steps.push({ c, r, act: 'walk' });
    }
    touch(c, r);
  }
  return done('stuck');
}
