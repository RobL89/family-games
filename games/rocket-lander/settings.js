// Rocket Lander's settings: built-in defaults the game plays on (D-014), and what a grown-up
// could change. Pure: no page, network, clock or randomness here.
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
  speed: { default: 2, min: 1, max: 5, about: 'How fast the rocket falls: 1 (slow) to 5 (fast).' },
  // Maths spike (D-030, claude/games-spike-maths): tried in a preview, not agreed.
  mode: { default: 'numbers', options: ['numbers', 'maths'], about: 'Spike: land on numbers, or on the answer to a sum. In maths, from, to, step and label_every are set by the sum.' },
  ops: { default: '+ −', options: ['+', '−', '+ −', '÷', '+ − ÷', '×', '+ − × ÷'], about: 'Maths: which sums. Each number up to 10, nothing below zero, ÷ by 2, 5 or 10 with the answer up to 10.' },
  layout: { default: 'whole', options: ['whole', 'window', 'pads'], about: 'Maths: the whole line (0 to the biggest answer), a stretch of 10 round the answer, or landing pads to choose from.' },
  pads: { default: 4, min: 2, max: 6, about: 'Maths with pads: how many pads to choose from.' },
};

// The settings to play with: each given value that makes sense, otherwise the default.
// Numbers outside their range are kept inside it. Returns { values, notes }.
export function resolveSettings(schema, given = {}) {
  const values = {}, notes = [];
  for (const [name, spec] of Object.entries(schema)) {
    const raw = given && Object.prototype.hasOwnProperty.call(given, name) ? given[name] : undefined;
    let v = spec.default;
    if (raw !== undefined && raw !== null && raw !== '') {
      if (typeof spec.default === 'number') {
        const n = Number(raw);
        if (!Number.isFinite(n)) notes.push(`${name}: "${raw}" isn't a number, so ${spec.default} is used`);
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
