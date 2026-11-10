// Rocket Lander's settings: built-in defaults the game plays on (D-014), and what a grown-up
// could change. Pure: no page, network, clock or randomness here. Version 1.1.
// Changes at v1.1 (step 2c-3a, Rob): slower falls. Speeds 1 to 5 fall in 18, 15, 12, 9 and 7 seconds
// (was 12, 8, 6, 5, 4), and the default is 3, 12 s, the old speed 1 (D-096); questions asked by a
// picture, a dice face or a sum get 25% more time than plain numbers (D-097). The table moved here
// from round.js so the core test can check it.
//
// A number setting may say `type: 'number'` with `default: null`, meaning "as the level
// says" (contract v0.3 GC3); Number mode makes its line settings so (rules.js, followLevel).
//
// Salvaged from games-wip (7ef1ff0), where the values came from the old Sheet's Settings tab
// through shared/settings.js (D-004 leaves that data layer behind). `speak` was the old shared
// setting, copied here so the game needs nothing outside its folder. At stage 2a the game
// contract's start message may hand over values; resolveSettings() checks them.

export const SETTINGS = {
  speak: { default: true, about: "Say the target out loud with the device's own voice." },
  from: { default: 0, min: -1000, max: 1000, about: 'The number at the left end of the line.' },
  to: { default: 10, min: -1000, max: 1000, about: 'The number at the right end of the line.' },
  step: { default: 1, min: 0.01, max: 100, about: 'Gap between landing spots: 1 = whole numbers, 0.5 = halves, 0.25 = quarters, 0.1 = tenths, 10 = tens.' },
  label_every: { default: 1, min: 0, max: 500, about: 'Write a number under a mark this often: 1 = every number, 5 = 0, 5, 10..., 0 = only the two ends.' },
  show_as: { default: 'fraction', options: ['fraction', 'decimal'], about: 'Halves and quarters shown as 2½ (fraction) or 2.5 (decimal).' },
  close_enough: { default: 0, min: 0, max: 500, about: 'How near counts as a good landing: 0 = on the mark itself (long lines get a little leeway automatically); 5 = within 5.' },
  landings_per_round: { default: 8, min: 3, max: 20, about: 'Landings in one round.' },
  speed: { default: 3, min: 1, max: 5, about: 'How fast the rocket falls: 1 (slow, 18 s) to 5 (fast, 7 s); 3 is 12 s.' },
};

// Seconds from the top to the ground for speeds 1 to 5 (D-096), and the extra for a question asked by a
// picture, a dice face or a sum (D-097).
export const FALL_SECONDS = [18, 15, 12, 9, 7];
export const MORE_TIME = 1.25;

// The fall's seconds at a speed (between two speeds, in a straight line; outside 1 to 5, the nearest
// end; not a number, the default), with 25% more if `more`.
export function fallSecondsFor(speed, more = false) {
  const n = Number(speed);
  const v = Number.isFinite(n) ? Math.max(1, Math.min(5, n)) : SETTINGS.speed.default;
  const i = Math.min(3, Math.floor(v - 1));
  const s = FALL_SECONDS[i] + (FALL_SECONDS[i + 1] - FALL_SECONDS[i]) * (v - 1 - i);
  return more ? s * MORE_TIME : s;
}

// The settings to play with: each given value that makes sense, otherwise the default
// (null: the level's). Numbers outside their range are kept inside it. Returns { values, notes }.
export function resolveSettings(schema, given = {}) {
  const values = {}, notes = [];
  for (const [name, spec] of Object.entries(schema)) {
    const raw = given && Object.prototype.hasOwnProperty.call(given, name) ? given[name] : undefined;
    let v = spec.default;
    if (raw !== undefined && raw !== null && raw !== '') {
      if (spec.type === 'number' || typeof spec.default === 'number') {
        const n = Number(raw);
        if (!Number.isFinite(n)) notes.push(`${name}: "${raw}" isn't a number, so ${spec.default === null ? "the level's" : spec.default} is used`);
        else if (n < spec.min || n > spec.max) {
          v = Math.min(spec.max, Math.max(spec.min, n));
          notes.push(`${name}: ${n} is outside ${spec.min} to ${spec.max}, so ${v} is used`);
        } else v = n;
      } else if (typeof spec.default === 'boolean') {
        if (typeof raw === 'boolean') v = raw;
        else notes.push(`${name}: "${raw}" isn't true or false, so ${spec.default} is used`);
      } else if (spec.options) {
        if (spec.options.includes(raw)) v = raw;
        else notes.push(`${name}: "${raw}" isn't one of ${spec.options.join(', ')}, so ${spec.default} is used`);
      }
    }
    values[name] = v;
  }
  return { values, notes };
}
