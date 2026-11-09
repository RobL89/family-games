// The rocket games' level helpers, shared by Rocket Lander and Rocket Sums (D-027): which
// level to play, and settings that follow the level (contract v0.3 GC3, GC5). Version 1.0.
// Moved here word for word from games/rocket-lander/rules.js in step 2a-2. Pure: no page,
// clock or randomness.

// The level to play: a whole number from 1 to the table's length (a string from an address
// is fine). Anything else plays level 1; given but unusable, with a note saying why.
export function levelOf(levels, given) {
  if (given === null || given === undefined || given === '') return { level: 1, row: levels[0], note: '' };
  const n = Number(given);
  if (Number.isInteger(n) && n >= 1 && n <= levels.length) return { level: n, row: levels[n - 1], note: '' };
  return { level: 1, row: levels[0], note: `level "${given}" isn't 1 to ${levels.length}, so level 1 is played` };
}

// A copy of a settings schema in which the named settings default to null, meaning
// "follow the level"; a grown-up's value overrides the level for that one thing (GC3).
export function followLevel(schema, names) {
  const out = {};
  for (const [k, spec] of Object.entries(schema)) {
    out[k] = names.includes(k) ? { ...spec, type: 'number', default: null, about: `${spec.about} Empty: as the level says.` } : spec;
  }
  return out;
}
