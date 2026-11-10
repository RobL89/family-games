// Rocket Lander's maps of solar systems: one map for each track, on the same six systems (D-058,
// D-065, D-066, D-089). Version 2.0 (step 2c-3a).
//
// Changes at v2.0 (step 2c-3a, D-089 to D-094): two tracks. The lower track (Reception, then Year 1)
// holds Reception's three systems from the level plan (claude/level-plan.md 0.3, section 4): Moon, Red
// Dust and Candy, each 7 levels and a challenge round that mixes them (D-091); Year 1's Ice, Jungle
// and Ringed are coming soon (step 2c-3c). The higher track (Year 2, then Year 3) holds version 1.0's
// stand-in levels until step 2c-3b builds Year 2: Number mode's eight on the Moon and the eight sums
// levels on Red Dust (D-068), so a device's progress from before tracks keeps its meaning there.
// Version 1.0 (step 2c-build) was the stand-in map alone.
//
// Each system takes the look of the planet with its id (planets.js), and the systems come in the
// planets' order. Data only. Units and meanings:
//   TRACKS    { [id]: { name, edition, systems } }: name for the test panel; edition changes when the
//             map's level ids start to mean other levels (tracks.js), so older progress isn't misread;
//             'stand-in' is tracks.js's STAND_IN, the edition a format 3 entry's map was made on;
//   id        the system's id, which is also its planet's id; a level's id is `<system id>-<n>`, n
//             counting from 1 along the system, the same ids on both tracks;
//   soon      shown on the galaxy, locked, as coming soon; such a system has no levels yet;
//   levels    in the order they are played, each { kind, level or row, plan, about, sample }:
//     kind    'number' (Number mode: levels.js, rules.js), 'sums' (sums-levels.js, sums.js), 'ask'
//             (Reception's pictures and phrases: asks.js) or 'challenge' (the system's levels mixed);
//     level   the row's level number in that kind's table (levels.js, sums-levels.js), or
//     row     the level's own row, in the units of that kind's table (an ask row: asks.js);
//     plan    the level plan's id for it: a syllabus level (R01 ...), an added level (X-...), or
//             'challenge' (plan_rocket_levels.py, which checks the plan against Rob's notes);
//     about   what the level asks, in a few words, for its card (Claude's words);
//     sample  a target of the kind the level asks, shown as a chip on its card.

const CHALLENGE = { kind: 'challenge', plan: 'challenge', about: 'Challenge: levels 1 to 7 mixed', sample: { rule: 'challenge' } };

// The lower track: Reception's three systems (level plan 0.3, section 4). Rows reused as they play today
// (Moon 1 and 2, Red Dust 6, Candy 1 to 5) keep their table's level number; the rest are new rows, their
// numbers from Rob's syllabus notes (claude/syllabus-notes.json: each `plan` id's params).
const LOWER = [
  { id: 'moon', levels: [
    { kind: 'number', level: 1, plan: 'R01', about: 'Land on numbers, 0 to 5', sample: { rule: 'any', value: 3 } },
    { kind: 'number', level: 2, plan: 'R02', about: 'Numbers to 10, and dice', sample: { rule: 'dice', value: 4 } },
    { kind: 'ask', plan: 'R03', row: { ask: 'dots', min: 1, max: 10, from: 0, to: 10, label_every: 1 },
      about: 'How many dots?', sample: { rule: 'ask', ask: 'dots', n: 6, value: 6 } },
    { kind: 'number', plan: 'X-dice6', row: { from: 0, to: 6, label_every: 1, labels: 'dice', mix: { any: 1 }, source: 'D-060, D-067: dice faces on the line, 0 an empty die' },
      about: 'Dice faces on the line', sample: { rule: 'any', value: 5 } },
    { kind: 'ask', plan: 'R04', row: { ask: 'flash', min: 1, max: 5, show_ms: 1500, from: 0, to: 5, label_every: 1 },
      about: 'Quick look: how many?', sample: { rule: 'ask', ask: 'flash', n: 4, value: 4, look: 0, ms: 1500 } },
    { kind: 'ask', plan: 'R05', row: { ask: 'compare', min: 0, max: 10, rels: { more: 2, fewer: 2, same: 1 }, from: 0, to: 10, label_every: 1 },
      about: 'More, fewer or the same', sample: { rule: 'range', ask: 'compare', rel: 'more', n: 3 } },
    { kind: 'ask', plan: 'R06', row: { ask: 'more-less', min: 0, max: 10, from: 0, to: 10, label_every: 1 },
      about: 'One more, one less', sample: { rule: 'ask', ask: 'more-less', dir: 'more', n: 6, value: 7 } },
    CHALLENGE,
  ] },
  { id: 'dust', levels: [
    { kind: 'number', plan: 'R07', row: { from: 10, to: 20, label_every: 1, labels: 'plain', mix: { any: 1 }, pick: [11, 20], source: 'R07: numerals 11 to 20' },
      about: 'Bigger numbers: 11 to 20', sample: { rule: 'any', value: 14 } },
    { kind: 'ask', plan: 'R08', row: { ask: 'bond', whole: 5, from: 0, to: 5, label_every: 1 },
      about: 'Make 5', sample: { rule: 'ask', ask: 'bond', whole: 5, part: 3, value: 2 } },
    { kind: 'sums', plan: 'R09', row: { ops: ['+'], plus_max: 5, layout: 'line', from: 0, to: 5, label_every: 1, pictures: true, source: 'R09: + to 5, with dots' },
      about: 'Adding to 5, with dots', sample: { rule: 'sum', sum: '2 + 3', a: 2, op: '+', b: 3, value: 5 } },
    { kind: 'sums', plan: 'R10', row: { ops: ['−'], minus_max: 5, minus_from: 1, layout: 'line', from: 0, to: 5, label_every: 1, pictures: true, source: 'R10: − from 1 to 5, with dots' },
      about: 'Taking away, with dots', sample: { rule: 'sum', sum: '5 − 2', a: 5, op: '−', b: 2, value: 3 } },
    { kind: 'ask', plan: 'R11', row: { ask: 'double', max: 5, from: 0, to: 10, label_every: 1 },
      about: 'Doubles', sample: { rule: 'ask', ask: 'double', n: 3, value: 6 } },
    { kind: 'number', level: 5, plan: 'X-odd-faint', about: 'Odd numbers fade away', sample: { rule: 'any', value: 7 } },
    { kind: 'ask', plan: 'R12', row: { ask: 'bond', whole: 10, from: 0, to: 10, label_every: 1 },
      about: 'Make 10', sample: { rule: 'ask', ask: 'bond', whole: 10, part: 6, value: 4 } },
    CHALLENGE,
  ] },
  { id: 'candy', levels: [
    { kind: 'sums', level: 1, plan: 'R13', about: 'Plus sums to 5, then to 10', sample: { rule: 'sum', sum: '4 + 3' } },
    { kind: 'sums', level: 2, plan: 'R14', about: 'Take-away sums', sample: { rule: 'sum', sum: '7 − 2' } },
    { kind: 'sums', level: 3, plan: 'X-mix10', about: 'Plus and take away, to 10', sample: { rule: 'sum', sum: '4 + 5' } },
    { kind: 'number', level: 3, plan: 'R15', about: 'Even and odd numbers', sample: { rule: 'parity', parity: 'even' } },
    { kind: 'number', level: 4, plan: 'X-parity-faint', about: 'Even and odd, colours faint', sample: { rule: 'parity', parity: 'odd' } },
    { kind: 'ask', plan: 'R16', row: { ask: 'share', total_max: 10, groups: 2, from: 0, to: 5, label_every: 1 },
      about: 'Share it out', sample: { rule: 'ask', ask: 'share', total: 6, groups: 2, value: 3 } },
    { kind: 'number', plan: 'X-dice12', row: { from: 0, to: 12, label_every: 1, labels: 'dice', mix: { any: 1 }, source: 'D-060: 7 to 12 as a 6 and the rest' },
      about: 'Dice up to 12', sample: { rule: 'any', value: 9 } },
    CHALLENGE,
  ] },
  { id: 'ice', soon: true, levels: [] },
  { id: 'jungle', soon: true, levels: [] },
  { id: 'ringed', soon: true, levels: [] },
];

// The higher track, until step 2c-3b: version 1.0's stand-in levels (D-068).
const STAND_IN_SYSTEMS = [
  { id: 'moon', levels: [
    { kind: 'number', level: 1, about: 'Land on numbers, 0 to 5', sample: { rule: 'any', value: 3 } },
    { kind: 'number', level: 2, about: 'Numbers to 10, and dice', sample: { rule: 'dice', value: 4 } },
    { kind: 'number', level: 3, about: 'Even and odd numbers', sample: { rule: 'parity', parity: 'even' } },
    { kind: 'number', level: 4, about: 'Even and odd, colours faint', sample: { rule: 'parity', parity: 'odd' } },
    { kind: 'number', level: 5, about: 'Odd numbers fade away', sample: { rule: 'any', value: 7 } },
    { kind: 'number', level: 6, about: 'Every other number written', sample: { rule: 'any', value: 5 } },
    { kind: 'number', level: 7, about: 'Only 0, 5 and 10 written', sample: { rule: 'any', value: 8 } },
    { kind: 'number', level: 8, about: 'Only 0 and 10 written!', sample: { rule: 'any', value: 6 } },
  ] },
  { id: 'dust', levels: [
    { kind: 'sums', level: 1, about: 'Plus sums to 5, then to 10', sample: { rule: 'sum', sum: '2 + 3' } },
    { kind: 'sums', level: 2, about: 'Take-away sums', sample: { rule: 'sum', sum: '5 − 2' } },
    { kind: 'sums', level: 3, about: 'Plus and take away, to 10', sample: { rule: 'sum', sum: '4 + 5' } },
    { kind: 'sums', level: 4, about: 'Plus sums up to 20', sample: { rule: 'sum', sum: '9 + 7' } },
    { kind: 'sums', level: 5, about: 'Plus and take away, to 20', sample: { rule: 'sum', sum: '9 − 4' } },
    { kind: 'sums', level: 6, about: 'Every other number written', sample: { rule: 'sum', sum: '8 + 6' } },
    { kind: 'sums', level: 7, about: 'Times sums', sample: { rule: 'sum', sum: '3 × 4' } },
    { kind: 'sums', level: 8, about: 'All four: + − × ÷', sample: { rule: 'sum', sum: '20 ÷ 5' } },
  ] },
  { id: 'candy', soon: true, levels: [] },
  { id: 'ice', soon: true, levels: [] },
  { id: 'jungle', soon: true, levels: [] },
  { id: 'ringed', soon: true, levels: [] },
];

export const FIRST_TRACK = 'reception'; // a device with no track yet starts on the lower track
export const TRACKS = {
  reception: { name: 'Reception, then Year 1', edition: 'lower-1', systems: LOWER },
  year2: { name: 'Year 2, then Year 3 (stand-in until step 2c-3b)', edition: 'stand-in', systems: STAND_IN_SYSTEMS },
};
