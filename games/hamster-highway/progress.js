// Hamster Highway's saved progress (D-147). Version 1.2 (16 Nov, step 9).
//
// Changes at v1.2 (step 9, D-166, D-170 (a)): opens(ids, p, i), which levels a child may open, moved here from game.js
// so it is tested: the first, the one after a level done, and any level with itself or a later level done, so a child
// who played before the twins came finds the twins before their furthest level open but not done. The format is
// unchanged: the twins' new ids are new keys.
//
// Changes at v1.1 (D-170, D-171): format 2 adds the help cards a player has seen, so each pops up once per child:
//   { v: 2, done: {...}, seeds: {...}, tries: {...}, cards: { [card kind]: true } }
// Format 1 is still read, with no cards seen; anything saved is format 2. seen() marks a card seen; unpack() takes the
// game's card kinds (cards.js CARDS) and keeps only those.
//
// What is kept for a player: each level done, each golden seed found, the GO presses on each level until it is first
// done (the brief's tries measure), and the help cards seen. No name or age. Format 1 was:
//   { v: 1, done: { [level id]: true }, seeds: { [level id]: true }, tries: { [level id]: whole number } }
// game.js keeps it in this browser's localStorage when the game runs on its own, or hands it to
// P-020's wrapper with fg:state, which keeps it per child (contract 0.4.2 section 4; data map 1.10).
// Pure (project rules): no page, storage, clock or randomness; every function returns a new object.
// tools/tests/games/test_hamster_highway_core.py checks each one.

export const FORMAT = 2;
const READS = [1, 2];   // the formats unpack() reads
const MAX_TRIES = 9999;

export const fresh = () => ({ done: {}, seeds: {}, tries: {}, cards: {} });

const isMap = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

// Anything handed back (the device's entry, or the wrapper's state) made safe: only formats 1 and 2, only the
// game's own levels (ids) and cards (kinds), only true marks, seeds only on levels done, tries whole from 1 to 9999,
// cards only in format 2. Anything else starts afresh.
export function unpack(ids, raw, kinds = []) {
  const p = fresh();
  if (!isMap(raw) || !READS.includes(raw.v)) return p;
  const done = isMap(raw.done) ? raw.done : {};
  const seeds = isMap(raw.seeds) ? raw.seeds : {};
  const tries = isMap(raw.tries) ? raw.tries : {};
  const cards = raw.v >= 2 && isMap(raw.cards) ? raw.cards : {};
  for (const id of ids) {
    if (done[id] === true) p.done[id] = true;
    if (seeds[id] === true && p.done[id]) p.seeds[id] = true;
    const n = typeof tries[id] === 'number' && Number.isFinite(tries[id]) ? Math.min(MAX_TRIES, Math.max(0, Math.round(tries[id]))) : 0;
    if (n > 0) p.tries[id] = n;
  }
  for (const k of kinds) if (cards[k] === true) p.cards[k] = true;
  return p;
}

const copy = (p) => ({ done: { ...p.done }, seeds: { ...p.seeds }, tries: { ...p.tries }, cards: { ...(p.cards || {}) } });

// A GO press on level id: counted while the level isn't done yet. Levels the game doesn't know change nothing.
export function tried(ids, p, id) {
  const q = copy(p);
  if (!ids.includes(id) || q.done[id]) return q;
  q.tries[id] = Math.min(MAX_TRIES, (q.tries[id] || 0) + 1);
  return q;
}

// All five home on level id: done, and its seed found if this run took it (a found seed stays found).
export function finished(ids, p, id, seed) {
  const q = copy(p);
  if (!ids.includes(id)) return q;
  q.done[id] = true;
  if (seed) q.seeds[id] = true;
  return q;
}

// A help card shown to the player (D-170): marked seen, so it doesn't pop up again. Cards the game doesn't have change nothing.
export function seen(kinds, p, kind) {
  const q = copy(p);
  if (kinds.includes(kind)) q.cards[kind] = true;
  return q;
}

// What is saved: the progress with its format version.
export const pack = (p) => ({ v: FORMAT, ...copy(p) });

// Whether level i may be opened: the first; or the one before it is done; or it or any level after it is done.
export function opens(ids, p, i) {
  if (!Number.isInteger(i) || i < 0 || i >= ids.length) return false;
  return i === 0 || !!p.done[ids[i - 1]] || ids.slice(i).some((id) => !!p.done[id]);
}

// Where the hamster waits in the house: the first level not done, or the last when all are.
export function nextAt(ids, p) {
  const i = ids.findIndex((id) => !p.done[id]);
  return i < 0 ? Math.max(0, ids.length - 1) : i;
}
