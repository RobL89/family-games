// Hamster Highway's saved progress (D-147). Version 1.0 (15 Nov, step 2).
//
// What is kept for a player: each level done, each golden seed found, and the GO presses on each
// level until it is first done (the brief's tries measure). No name or age. Format 1:
//   { v: 1, done: { [level id]: true }, seeds: { [level id]: true }, tries: { [level id]: whole number } }
// game.js keeps it in this browser's localStorage when the game runs on its own, or hands it to
// P-020's wrapper with fg:state, which keeps it per child (contract 0.4.2 section 4; data map 1.9).
// Pure (project rules): no page, storage, clock or randomness; every function returns a new object.
// tools/tests/games/test_hamster_highway_core.py checks each one.

export const FORMAT = 1;
const MAX_TRIES = 9999;

export const fresh = () => ({ done: {}, seeds: {}, tries: {} });

const isMap = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

// Anything handed back (the device's entry, or the wrapper's state) made safe: only format 1, only the
// game's own levels (ids), only true marks, seeds only on levels done, tries whole from 1 to 9999.
// Anything else starts afresh.
export function unpack(ids, raw) {
  const p = fresh();
  if (!isMap(raw) || raw.v !== FORMAT) return p;
  const done = isMap(raw.done) ? raw.done : {};
  const seeds = isMap(raw.seeds) ? raw.seeds : {};
  const tries = isMap(raw.tries) ? raw.tries : {};
  for (const id of ids) {
    if (done[id] === true) p.done[id] = true;
    if (seeds[id] === true && p.done[id]) p.seeds[id] = true;
    const n = typeof tries[id] === 'number' && Number.isFinite(tries[id]) ? Math.min(MAX_TRIES, Math.max(0, Math.round(tries[id]))) : 0;
    if (n > 0) p.tries[id] = n;
  }
  return p;
}

const copy = (p) => ({ done: { ...p.done }, seeds: { ...p.seeds }, tries: { ...p.tries } });

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

// What is saved: the progress with its format version.
export const pack = (p) => ({ v: FORMAT, ...copy(p) });

// Where the hamster waits in the house: the first level not done, or the last when all are.
export function nextAt(ids, p) {
  const i = ids.findIndex((id) => !p.done[id]);
  return i < 0 ? Math.max(0, ids.length - 1) : i;
}
