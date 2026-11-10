// Rocket Lander's maps of solar systems: one map for each track, on the same six systems (D-058,
// D-065, D-066, D-089). Version 2.1 (step 2c-3b).
//
// Changes at v2.1 (step 2c-3b, D-100): the higher track holds Year 2's three systems from the level plan
// (claude/level-plan.md 0.3, section 4), Moon, Red Dust and Candy, each 7 levels and a challenge, in
// place of the stand-in levels: a new edition ('higher-1'), so a map kept on the stand-ins starts afresh
// there (tracks.js). Year 3's Ice, Jungle and Ringed are coming soon (step 2c-3c). Every Year 2 level has
// its own row, its numbers from Rob's syllabus notes (each `plan` id's params): Year 2's questions
// (asks.js 1.1) and sums in forms (sums.js 1.3). The stand-in map (version 2.0's higher track) is kept,
// byte for byte, as tools/tests/games/fixture_map_stand_in.js, which the older browser tests play.
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

// The higher track: Year 2's three systems (level plan 0.3, section 4), each level a row of its own, its
// numbers from Rob's syllabus notes. Asks on a stretch of 10 marks (`span`, asks.js windowFor); sums in
// Year 2's forms (sums.js formFacts), on a stretch of 10 (D-032) or, for tables and bonds, on their own
// line in steps. Tables go to × 12 (D-099). Y2-11 and Y2-12 play in two halves (D-094).
const STRETCH = { layout: 'stretch', span: 10, label_every: 1 };
const HIGHER = [
  { id: 'moon', levels: [
    { kind: 'ask', plan: 'Y2-01', row: { ask: 'place', digits: 2, min: 10, max: 99, span: 10, label_every: 1, source: 'Y2-01: tens and ones, 2 digits' },
      about: 'Tens and ones', sample: { rule: 'ask', ask: 'place', n: 34, value: 34 } },
    { kind: 'ask', plan: 'X-words100', row: { ask: 'words', min: 1, max: 100, span: 10, label_every: 1, source: 'notes: year2 number_words 1 to 100' },
      about: 'Number words to 100', sample: { rule: 'ask', ask: 'words', n: 47, value: 47 } },
    { kind: 'ask', plan: 'Y2-02', row: { ask: 'sign', min: 0, max: 100, rels: { more: 2, fewer: 2, same: 1 }, span: 10, label_every: 1, source: 'Y2-02: <, > and = to 100' },
      about: 'Bigger, smaller or the same', sample: { rule: 'range', ask: 'sign', rel: 'more', n: 47 } },
    { kind: 'ask', plan: 'Y2-03', row: { ask: 'seq', steps: [2, 3, 5], start: 0, min: 0, max: 60, dirs: ['forward', 'backward'], span: 10, label_every: 1,
      source: 'Y2-03: count in 2s, 3s and 5s from 0, to 60, both ways' },
      about: 'Count in 2s, 3s and 5s', sample: { rule: 'ask', ask: 'seq', step: 2, dir: 'forward', terms: [6, 8, 10], value: 12 } },
    { kind: 'ask', plan: 'Y2-04', row: { ask: 'seq', steps: [10], start: 'any', min: 0, max: 100, dirs: ['forward', 'backward'], span: 10, label_every: 1,
      source: 'Y2-04: tens from any number, to 100; both ways, as the curriculum says' },
      about: 'Tens from any number', sample: { rule: 'ask', ask: 'seq', step: 10, dir: 'forward', terms: [23, 33, 43], value: 53 } },
    { kind: 'sums', plan: 'Y2-05', row: { ops: ['+', '−'], forms: ['facts'], max: 20, ...STRETCH, fall_s: 6, source: 'Y2-05: + and − within 20, 6 s a landing' },
      about: 'Fast facts to 20', sample: { rule: 'sum', sum: '13 + 5', value: 18 } },
    { kind: 'sums', plan: 'Y2-06', row: { ops: ['+'], forms: ['bond'], whole: 100, every: 10, layout: 'line', from: 0, to: 100, step: 10, label_every: 10,
      source: 'Y2-06: tens that make 100, on 0 to 100 in tens' },
      about: 'Tens that make 100', sample: { rule: 'sum', sum: '30 + ? = 100', value: 70 } },
    CHALLENGE,
  ] },
  { id: 'dust', levels: [
    { kind: 'sums', plan: 'Y2-07', row: { ops: ['+'], forms: ['TO+O'], max: 100, ...STRETCH, source: 'Y2-07: TO + O, answers to 100' },
      about: 'Add ones: 34 + 5', sample: { rule: 'sum', sum: '34 + 5', value: 39 } },
    { kind: 'sums', plan: 'Y2-08', row: { ops: ['+'], forms: ['TO+T'], max: 100, ...STRETCH, source: 'Y2-08: TO + T, answers to 100' },
      about: 'Add tens: 34 + 20', sample: { rule: 'sum', sum: '34 + 20', value: 54 } },
    { kind: 'sums', plan: 'Y2-09', row: { ops: ['−'], forms: ['TO-O', 'TO-T'], max: 100, ...STRETCH, source: 'Y2-09: TO − O and TO − T' },
      about: 'Take away ones and tens', sample: { rule: 'sum', sum: '47 − 20', value: 27 } },
    { kind: 'sums', plan: 'Y2-10', row: { ops: ['+'], forms: ['O+O+O'], ...STRETCH, source: 'Y2-10: three numbers 1 to 9' },
      about: 'Three small numbers', sample: { rule: 'sum', sum: '4 + 7 + 6', value: 17 } },
    { kind: 'sums', plan: 'Y2-11', row: { ops: ['+'], forms: ['TO+TO'], max: 100, ...STRETCH, parts: [{ carry: false }, { carry: true }],
      source: 'Y2-11: TO + TO to 100; D-094: no new ten from the ones, then a new ten' },
      about: 'Add two 2-digit numbers', sample: { rule: 'sum', sum: '34 + 25', value: 59 } },
    { kind: 'sums', plan: 'Y2-12', row: { ops: ['−'], forms: ['TO-TO'], max: 100, ...STRETCH, parts: [{ exchange: false }, { exchange: true }],
      source: 'Y2-12: TO − TO; D-094: no exchanging, then exchanging' },
      about: 'Take away 2-digit numbers', sample: { rule: 'sum', sum: '56 − 23', value: 33 } },
    { kind: 'sums', plan: 'Y2-13', row: { ops: ['+', '−'], forms: ['missing'], of: ['TO+O', 'TO+T', 'TO+TO', 'TO-O', 'TO-T', 'TO-TO'], max: 100, ...STRETCH,
      source: "Y2-13: + and − to 100, a number missing; Year 2's own forms (Claude)" },
      about: 'Missing numbers to 100', sample: { rule: 'sum', sum: '? + 25 = 60', value: 35 } },
    CHALLENGE,
  ] },
  { id: 'candy', levels: [
    { kind: 'sums', plan: 'Y2-14', row: { ops: ['×'], forms: ['table'], tables: [10], times_max: 12, layout: 'line', from: 0, to: 120, step: 10, label_every: 10,
      source: 'Y2-14: the 10 times table to × 12 (D-099), on its own line' },
      about: '10 times table', sample: { rule: 'sum', sum: '10 × 7', value: 70 } },
    { kind: 'sums', plan: 'Y2-15', row: { ops: ['×'], forms: ['table'], tables: [2], times_max: 12, layout: 'line', from: 0, to: 24, step: 2, label_every: 2,
      source: 'Y2-15: the 2 times table to × 12 (D-099), on its own line' },
      about: '2 times table', sample: { rule: 'sum', sum: '2 × 6', value: 12 } },
    { kind: 'sums', plan: 'Y2-16', row: { ops: ['×'], forms: ['table'], tables: [5], times_max: 12, layout: 'line', from: 0, to: 60, step: 5, label_every: 5,
      source: 'Y2-16: the 5 times table to × 12 (D-099), on its own line' },
      about: '5 times table', sample: { rule: 'sum', sum: '5 × 4', value: 20 } },
    { kind: 'sums', plan: 'Y2-17', row: { ops: ['÷'], forms: ['divide'], tables: [2, 5, 10], times_max: 12, layout: 'line', from: 0, to: 12, step: 1, label_every: 1,
      source: 'Y2-17: ÷ 2, 5 and 10, whole answers 1 to 12' },
      about: 'Divide by 2, 5 and 10', sample: { rule: 'sum', sum: '30 ÷ 5', value: 6 } },
    { kind: 'ask', plan: 'Y2-18', row: { ask: 'parity', min: 1, max: 100, span: 10, label_every: 1, source: 'Y2-18: odd or even, 1 to 100' },
      about: 'Odd or even to 100', sample: { rule: 'range', ask: 'parity', rel: 'even' } },
    { kind: 'ask', plan: 'Y2-19', row: { ask: 'frac-shape', fractions: ['1/2', '1/3', '1/4', '2/4', '3/4'], source: 'Y2-19: fractions of shapes' },
      about: 'Fractions of shapes', sample: { rule: 'ask', ask: 'frac-shape', num: 3, den: 4, look: 0, parts: 4, value: 3 } },
    { kind: 'ask', plan: 'Y2-20', row: { ask: 'frac-of', fractions: ['1/2', '1/3', '1/4', '3/4'], total_max: 24, span: 10, label_every: 1, source: 'Y2-20: fractions of numbers to 24, whole answers' },
      about: 'Fractions of numbers', sample: { rule: 'ask', ask: 'frac-of', num: 3, den: 4, total: 12, value: 9 } },
    CHALLENGE,
  ] },
  { id: 'ice', soon: true, levels: [] },
  { id: 'jungle', soon: true, levels: [] },
  { id: 'ringed', soon: true, levels: [] },
];

export const FIRST_TRACK = 'reception'; // a device with no track yet starts on the lower track
export const TRACKS = {
  reception: { name: 'Reception, then Year 1', edition: 'lower-1', systems: LOWER },
  year2: { name: 'Year 2, then Year 3', edition: 'higher-1', systems: HIGHER },
};
