// The rocket game's progress on its map of solar systems (D-058, D-064, D-066): where the rocket
// waits, how far the map is open, each level's best stars and the moon rocks found there, and what
// a finished round changes. Version 1.0 (step 2c-build, D-068). Pure: no page, storage, clock or
// randomness, so test_rocket_lander_core.py runs it in Node; kit.js keeps it on the device.
//
// A map is a list of systems, each { id, soon, levels: [{ id, ... }] }: a system that is `soon`, or
// has no levels, shows on the galaxy, locked, as coming soon. Levels are played in the map's order,
// system after system: the route.
//
// Progress, format 3 (D-058; kit.js adds v: 3 on the device):
//   at        the level the rocket waits at (a level id): Play by the rocket starts it;
//   open      the furthest level open (a level id): every level up to it on the route is open;
//   levels    { [level id]: { stars, rocks } } for each level played: its best stars (1 to 3) and the
//             moon rocks found there (0 to 8: one for each perfect landing, across replays, until
//             all 8 are found; Claude's reading, step 2c-1);
//   rocks     moon rocks to spend in the hangar; landings: right landings in all;
//   ship, ships   the ship flown and those owned, kept tidy by fleet.js (hangarOf).

export const ROCKS_PER_LEVEL = 8;
export const PASS_STARS = 2; // D-064: a round of 2 stars or more opens the next level

const whole = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

// The playable levels in order: [{ id, s, n, last }], where s is the system's place on the map, n
// the level's place in its system, and last whether it ends its system.
export function route(map) {
  const out = [];
  map.forEach((sys, s) => {
    if (sys.soon || !sys.levels || !sys.levels.length) return;
    sys.levels.forEach((lv, n) => out.push({ id: lv.id, s, n, last: n === sys.levels.length - 1 }));
  });
  return out;
}

export const indexOf = (map, id) => route(map).findIndex((r) => r.id === id);

// Where a level is: { id, s, n, last, i } (i its place on the route), or null.
export function placeOf(map, id) {
  const R = route(map), i = R.findIndex((r) => r.id === id);
  return i < 0 ? null : { ...R[i], i };
}

// A new player's progress: the rocket on the first level, nothing else open or found.
export function fresh(map) {
  const first = route(map)[0];
  const id = first ? first.id : null;
  return { at: id, open: id, levels: {}, rocks: 0, landings: 0 };
}

// Any progress object made safe to use: levels the map doesn't have dropped, numbers whole and in
// range, the rocket's place and the open end on the route, and every level up to the furthest of the
// place, the open end and the level after any level passed open. Ships are fleet.js's (hangarOf).
export function tidy(map, p) {
  const R = route(map), ids = R.map((r) => r.id), src = p && typeof p === 'object' ? p : {};
  const given = src.levels && typeof src.levels === 'object' && !Array.isArray(src.levels) ? src.levels : {};
  const levels = {};
  for (const id of ids) {
    const e = given[id];
    if (!e || typeof e !== 'object') continue;
    const stars = whole(e.stars, 0, 3);
    if (stars < 1) continue; // a level is recorded once played, with 1 star at least
    levels[id] = { stars, rocks: whole(e.rocks, 0, ROCKS_PER_LEVEL) };
  }
  if (!R.length) return { at: null, open: null, levels, rocks: whole(src.rocks, 0, 1e6), landings: whole(src.landings, 0, 1e9) };
  const at = Math.max(0, ids.indexOf(src.at));
  let open = Math.max(0, ids.indexOf(src.open), at);
  ids.forEach((id, i) => { if (levels[id] && levels[id].stars >= PASS_STARS) open = Math.max(open, Math.min(i + 1, R.length - 1)); });
  return { at: ids[at], open: ids[open], levels, rocks: whole(src.rocks, 0, 1e6), landings: whole(src.landings, 0, 1e9) };
}

export const isOpen = (map, p, id) => { const i = indexOf(map, id); return i >= 0 && i <= indexOf(map, p.open); };
export const bestOf = (p, id) => (p.levels && p.levels[id] ? p.levels[id].stars : 0);
export const foundOf = (p, id) => (p.levels && p.levels[id] ? p.levels[id].rocks : 0);

// Whether a perfect landing still finds a new moon rock on this level, after `already` found in
// this round: one for each perfect landing until the level's 8 are found.
export const rockLeft = (p, id, already = 0) => foundOf(p, id) + already < ROCKS_PER_LEVEL;

// What a finished round on level `id` changes (D-058, D-064). r: { stars (1 to 3), found (moon rocks
// found in the round, each one counted by rockLeft as it flew), right (right landings) }. A replay
// pays only what's above what the level holds: its best stars stay the best, and its rocks only grow
// to 8. Returns { progress (a new object), was and now ({ stars, rocks } of the level), first (never
// played before), passed (2 stars or more), newBest (more stars than before, after a first play),
// rocks (moon rocks paid), opened (the level just opened, or null), next (where the rocket waits
// now), hyper (next is in the next system), done (the level ends its system and was passed), soon
// (done, and no system after it can be played yet) }, or null if the map has no such level.
export function finish(map, p, id, { stars, found = 0, right = 0 } = {}) {
  const R = route(map), i = R.findIndex((r) => r.id === id);
  if (i < 0) return null;
  const was = { stars: bestOf(p, id), rocks: foundOf(p, id) };
  const got = whole(stars, 1, 3);
  const paid = Math.min(whole(found, 0, ROCKS_PER_LEVEL), ROCKS_PER_LEVEL - was.rocks);
  const now = { stars: Math.max(was.stars, got), rocks: was.rocks + paid };
  const passed = got >= PASS_STARS;
  const after = passed ? R[i + 1] || null : null;
  let open = Math.max(indexOf(map, p.open), i), opened = null;
  if (after && i + 1 > open) { open = i + 1; opened = after.id; }
  const done = passed && R[i].last;
  const progress = {
    ...p, at: after ? after.id : id, open: R[open].id, levels: { ...(p.levels || {}), [id]: now },
    rocks: whole(p.rocks, 0, 1e6) + paid, landings: whole(p.landings, 0, 1e9) + whole(right, 0, 1000),
  };
  return {
    progress, was, now, first: was.stars === 0, passed, newBest: was.stars > 0 && now.stars > was.stars, rocks: paid,
    opened, next: progress.at, hyper: !!after && after.s !== R[i].s, done, soon: done && !after && map.slice(R[i].s + 1).some((sys) => sys.soon),
  };
}

// A system's stars: { got, of }, the best stars of its levels against 3 for each.
export function systemStars(map, p, s) {
  const lv = (map[s] && map[s].levels) || [];
  return { got: lv.reduce((a, l) => a + bestOf(p, l.id), 0), of: lv.length * 3 };
}

// Whether the child has reached system s: its first level is open.
export function reached(map, p, s) {
  const lv = map[s] && map[s].levels;
  return !!(lv && lv.length && !map[s].soon && isOpen(map, p, lv[0].id));
}

// Where the rocket waits when it flies to system s (the galaxy, the arrows, the portal): the open
// end if it's in s; otherwise the first level of s with stars or rocks still to win, or else its
// first level. null if s hasn't been reached.
export function placeIn(map, p, s) {
  if (!reached(map, p, s)) return null;
  const end = placeOf(map, p.open);
  if (end && end.s === s) return p.open;
  const lv = map[s].levels.filter((l) => isOpen(map, p, l.id));
  const left = lv.find((l) => bestOf(p, l.id) < 3 || foundOf(p, l.id) < ROCKS_PER_LEVEL);
  return (left || lv[0]).id;
}

// The rocket goes to a level a grown-up or the shell picks (begin({ level }), the test panel), and the
// map opens up to it; nothing is won.
export function goTo(map, p, id) {
  const i = indexOf(map, id);
  if (i < 0) return p;
  return { ...p, at: id, open: route(map)[Math.max(i, indexOf(map, p.open))].id };
}

// A level given as its number along the route (1 is the first level; the address's ?level=, GC5) or
// as a level id: { id, note }. Nothing given: { id: null }; something unusable: a note saying why.
export function levelGiven(map, given) {
  if (given === null || given === undefined || given === '') return { id: null, note: '' };
  const R = route(map), n = Number(given);
  if (Number.isInteger(n) && n >= 1 && n <= R.length) return { id: R[n - 1].id, note: '' };
  if (typeof given === 'string' && R.some((r) => r.id === given)) return { id: given, note: '' };
  return { id: null, note: `level "${given}" isn't 1 to ${R.length}, so the map's own place is played` };
}
