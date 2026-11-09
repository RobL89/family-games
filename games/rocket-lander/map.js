// Rocket Lander's map of solar systems (D-058, D-065, D-066). Version 1.0 (step 2c-build, D-068).
//
// STAND-IN: these levels hold the map's place until the level plan (step 2c-2, D-059), which
// replaces them. Moon holds Number mode's eight levels (levels.js, D-038) and Red Dust the eight
// sums levels (sums-levels.js, D-039 to D-041); Candy, Ice, Jungle and Ringed show on the galaxy,
// locked, as coming soon. Each system takes the look of the planet with its id (planets.js), and
// the systems come in the planets' order.
//
// Data only. Units and meanings:
//   id        the system's id, which is also its planet's id; a level's id is `<system id>-<n>`,
//             n counting from 1 along the system;
//   soon      shown on the galaxy, locked, as coming soon; such a system has no levels yet;
//   levels    in the order they are played, each { kind, level, about, sample }:
//     kind    'number' (a Number mode level: levels.js) or 'sums' (a sums level: sums-levels.js);
//     level   the row's level number in that table;
//     about   what the level asks, in a few words, for its card (Claude's words, stand-in);
//     sample  a target of the kind the level asks, shown as a chip on its card: { rule: 'any',
//             value } for a number, { rule: 'dice', value } for a dice face, { rule: 'parity',
//             parity } for even or odd, { rule: 'sum', sum } for a sum the level can ask.

export const STAND_IN = 'Stand-in levels until the level plan (step 2c-2, D-059, D-068)';

export const SYSTEMS = [
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
