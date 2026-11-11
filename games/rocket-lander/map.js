// Rocket Lander's maps of solar systems: one map for each track, on the same six systems (D-058,
// D-065, D-066, D-089). Version 2.2 (step 2c-3c).
//
// Changes at v2.2 (step 2c-3c): Year 1's Ice, Jungle and Ringed on the lower track and Year 3's on the
// higher, from the level plan (claude/level-plan.md 0.3, section 4), each 7 levels and a challenge, so no
// system is coming soon. The editions stay ('lower-1', 'higher-1'): only systems that were coming soon
// filled, so every level id kept its meaning. Year 1's three added Number mode levels reuse levels 6, 7
// and 8 (D-038); every other level has its own row, its numbers from Rob's syllabus notes (each `plan`
// id's params): asks.js 1.2 and sums.js 1.4. Numbers to 100 (Y1-02), and Year 3's mental adding and taking
// away (Y3-06, Y3-07), play in halves (D-094).
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
// A stretch of 10 marks, every one written (asks.js windowFor, sums.js lineForSum; D-032)
const STRETCH = { layout: 'stretch', span: 10, label_every: 1 };

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
  // Year 1 (step 2c-3c): numbers to 100, sums to 20, then groups, sharing, halves and quarters
  { id: 'ice', levels: [
    { kind: 'ask', plan: 'Y1-01', row: { ask: 'find', min: 0, max: 50, span: 10, label_every: 1, source: 'Y1-01: numerals 0 to 50' },
      about: 'Numbers to 50', sample: { rule: 'ask', ask: 'find', n: 37, value: 37 } },
    { kind: 'ask', plan: 'Y1-02', row: { ask: 'find', span: 10, label_every: 1, parts: [{ min: 0, max: 50 }, { min: 0, max: 100 }],
      source: 'Y1-02: numerals 0 to 100; D-094: to 50, then to 100' },
      about: 'Numbers to 100', sample: { rule: 'ask', ask: 'find', n: 83, value: 83 } },
    { kind: 'ask', plan: 'Y1-03', row: { ask: 'seq', steps: [1], start: 'any', min: 0, max: 100, dirs: ['forward', 'backward'], span: 10, label_every: 1,
      source: 'Y1-03: count on or back in ones from any number, 0 to 100' },
      about: 'What comes next?', sample: { rule: 'ask', ask: 'seq', step: 1, dir: 'forward', terms: [46, 47, 48], value: 49 } },
    { kind: 'ask', plan: 'Y1-04', row: { ask: 'seq', steps: [2, 5, 10], start: 0, min: 0, max: 100, dirs: ['forward'], stretch: { 10: 2 }, span: 10, label_every: 1,
      source: 'Y1-04: count in 2s, 5s and 10s from 0, to 100; 10s on a stretch in 2s (Claude)' },
      about: 'Count in 2s, 5s and 10s', sample: { rule: 'ask', ask: 'seq', step: 5, dir: 'forward', terms: [15, 20, 25], value: 30 } },
    { kind: 'ask', plan: 'Y1-05', row: { ask: 'words', min: 1, max: 20, span: 10, label_every: 1, source: 'Y1-05: number words 1 to 20' },
      about: 'Number words to 20', sample: { rule: 'ask', ask: 'words', n: 14, value: 14 } },
    { kind: 'ask', plan: 'Y1-06', row: { ask: 'more-less', min: 0, max: 100, span: 10, label_every: 1, source: 'Y1-06: one more or one less, 0 to 100' },
      about: 'One more, one less to 100', sample: { rule: 'ask', ask: 'more-less', dir: 'less', n: 60, value: 59 } },
    { kind: 'number', level: 6, plan: 'X-every-other', about: 'Every other number written', sample: { rule: 'any', value: 6 } },
    CHALLENGE,
  ] },
  { id: 'jungle', levels: [
    { kind: 'sums', plan: 'Y1-07', row: { ops: ['+'], forms: ['bond'], whole: 10, every: 1, layout: 'line', from: 0, to: 10, step: 1, label_every: 1,
      source: 'Y1-07: bonds to 10, without pictures' },
      about: 'Bonds to 10', sample: { rule: 'sum', sum: '6 + ? = 10', value: 4 } },
    { kind: 'sums', plan: 'Y1-08', row: { ops: ['+'], forms: ['facts'], max: 20, b_max: 9, cross: false, ...STRETCH,
      source: 'Y1-08: + to 20, the second number 0 to 9, not crossing 10 (its half of the split)' },
      about: 'Adding to 20', sample: { rule: 'sum', sum: '12 + 5', value: 17 } },
    { kind: 'sums', plan: 'X-add20-cross', row: { ops: ['+'], forms: ['facts'], max: 20, b_max: 9, cross: true, ...STRETCH,
      source: 'Y1-08 split in two: crossing 10 (Claude)' },
      about: 'Adding to 20, crossing 10', sample: { rule: 'sum', sum: '7 + 5', value: 12 } },
    { kind: 'sums', plan: 'Y1-09', row: { ops: ['−'], forms: ['facts'], max: 20, b_max: 9, cross: false, ...STRETCH,
      source: 'Y1-09: − from 20 or less, 0 to 9 taken, not crossing 10 (its half of the split)' },
      about: 'Taking away within 20', sample: { rule: 'sum', sum: '17 − 5', value: 12 } },
    { kind: 'sums', plan: 'X-sub20-cross', row: { ops: ['−'], forms: ['facts'], max: 20, b_max: 9, cross: true, ...STRETCH,
      source: 'Y1-09 split in two: crossing 10 (Claude)' },
      about: 'Taking away, crossing 10', sample: { rule: 'sum', sum: '13 − 5', value: 8 } },
    { kind: 'sums', plan: 'Y1-10', row: { ops: ['+'], forms: ['bond'], whole: 20, every: 1, ...STRETCH, source: 'Y1-10: bonds to 20' },
      about: 'Bonds to 20', sample: { rule: 'sum', sum: '13 + ? = 20', value: 7 } },
    { kind: 'sums', plan: 'Y1-11', row: { ops: ['+', '−'], forms: ['missing'], of: ['facts'], max: 20, blanks: ['a', 'b', 'answer'], flip: true, ...STRETCH,
      source: "Y1-11: + and − to 20, the first, second or answer missing, written both ways round as the notes' '7 = ? − 9'" },
      about: 'Missing numbers to 20', sample: { rule: 'sum', sum: '7 = ? − 9', value: 16 } },
    CHALLENGE,
  ] },
  { id: 'ringed', levels: [
    { kind: 'ask', plan: 'Y1-12', row: { ask: 'groups', sizes: [2, 5, 10], max_groups: 5, source: 'Y1-12: 1 to 5 groups of 2, 5 or 10, as an array; on the size\'s own line' },
      about: 'Groups of 2, 5 and 10', sample: { rule: 'ask', ask: 'groups', groups: 3, size: 5, value: 15 } },
    { kind: 'ask', plan: 'Y1-13', row: { ask: 'share', total_max: 20, groups: [2, 5, 10], from: 0, to: 10, label_every: 1, source: 'Y1-13: share up to 20 between 2, 5 or 10' },
      about: 'Share between 2, 5 or 10', sample: { rule: 'ask', ask: 'share', total: 15, groups: 5, value: 3 } },
    { kind: 'number', level: 7, plan: 'X-0-5-10', about: 'Only 0, 5 and 10 written', sample: { rule: 'any', value: 5 } },
    { kind: 'ask', plan: 'Y1-14', row: { ask: 'frac-shape', fractions: ['1/2', '1/4'], source: 'Y1-14: halves and quarters of shapes' },
      about: 'Halves and quarters', sample: { rule: 'ask', ask: 'frac-shape', num: 1, den: 4, look: 0, parts: 4, value: 1 } },
    { kind: 'ask', plan: 'Y1-15', row: { ask: 'frac-of', fractions: ['1/2'], total_max: 20, from: 0, to: 10, label_every: 1, source: 'Y1-15: half of 2 to 20' },
      about: 'Half of a number', sample: { rule: 'ask', ask: 'frac-of', num: 1, den: 2, total: 12, value: 6 } },
    { kind: 'ask', plan: 'X-doubles20', row: { ask: 'double', max: 10, halves: true, min: 0, span: 10, label_every: 1,
      source: "notes: year1 other: doubles and halves to 20 (double 1 to 10, half of 2 to 20, by turns)" },
      about: 'Doubles and halves to 20', sample: { rule: 'ask', ask: 'half', n: 14, value: 7 } },
    { kind: 'number', level: 8, plan: 'X-0-10', about: 'Only 0 and 10 written', sample: { rule: 'any', value: 3 } },
    CHALLENGE,
  ] },
];

// The higher track: Year 2's three systems (level plan 0.3, section 4), each level a row of its own, its
// numbers from Rob's syllabus notes. Asks on a stretch of 10 marks (`span`, asks.js windowFor); sums in
// Year 2's forms (sums.js formFacts), on a stretch of 10 (D-032) or, for tables and bonds, on their own
// line in steps. Tables go to × 12 (D-099). Y2-11 and Y2-12 play in two halves (D-094).
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
  // Year 3 (step 2c-3c): numbers to 1000 and mental sums, then pairs, estimates and tables, then fractions
  { id: 'ice', levels: [
    { kind: 'ask', plan: 'Y3-01', row: { ask: 'find', min: 100, max: 1000, span: 10, label_every: 1, source: 'Y3-01: numerals 100 to 1000' },
      about: 'Numbers to 1000', sample: { rule: 'ask', ask: 'find', n: 347, value: 347 } },
    { kind: 'ask', plan: 'Y3-02', row: { ask: 'place', digits: 3, min: 100, max: 999, span: 10, label_every: 1, source: 'Y3-02: hundreds, tens and ones, 3 digits' },
      about: 'Hundreds, tens and ones', sample: { rule: 'ask', ask: 'place', n: 347, value: 347 } },
    { kind: 'ask', plan: 'Y3-03', row: { ask: 'sign', min: 0, max: 1000, rels: { more: 2, fewer: 2, same: 1 }, span: 10, label_every: 1, source: 'Y3-03: <, > and = to 1000' },
      about: 'Bigger, smaller or the same', sample: { rule: 'range', ask: 'sign', rel: 'fewer', n: 452 } },
    { kind: 'ask', plan: 'Y3-04', row: { ask: 'more-less', by: [10, 100], min: 0, max: 1000, span: 10, label_every: 1, source: 'Y3-04: 10 or 100 more or less, 0 to 1000' },
      about: '10 or 100 more or less', sample: { rule: 'ask', ask: 'more-less', dir: 'more', by: 100, n: 347, value: 447 } },
    { kind: 'ask', plan: 'Y3-05', row: { ask: 'seq', steps: [4, 8, 50, 100], start: 0, min: 0, max: 1000, dirs: ['forward'], stretch: { 50: 10, 100: 20 }, span: 10, label_every: 1,
      source: 'Y3-05: count in 4s, 8s, 50s and 100s from 0, to 1000; 50s on a stretch in tens, 100s in twenties (Claude)' },
      about: 'Count in 4s, 8s, 50s, 100s', sample: { rule: 'ask', ask: 'seq', step: 50, dir: 'forward', terms: [250, 300, 350], value: 400 } },
    { kind: 'sums', plan: 'Y3-06', row: { ops: ['+'], forms: ['HTO+O', 'HTO+T', 'HTO+H'], max: 1000, ...STRETCH, parts: [{ cross: false }, { cross: true }],
      source: 'Y3-06: HTO + ones, tens and hundreds, to 1000; D-094: not crossing a ten or hundred, then crossing' },
      about: 'Mental adding to 1000', sample: { rule: 'sum', sum: '245 + 30', value: 275 } },
    { kind: 'sums', plan: 'Y3-07', row: { ops: ['−'], forms: ['HTO-O', 'HTO-T', 'HTO-H'], max: 1000, ...STRETCH, parts: [{ cross: false }, { cross: true }],
      source: 'Y3-07: HTO − ones, tens and hundreds; D-094: not crossing a ten or hundred, then crossing' },
      about: 'Mental take away to 1000', sample: { rule: 'sum', sum: '423 − 50', value: 373 } },
    CHALLENGE,
  ] },
  { id: 'jungle', levels: [
    { kind: 'sums', plan: 'Y3-08', row: { ops: ['+'], forms: ['bond'], whole: 100, every: 5, layout: 'line', from: 0, to: 100, step: 5, label_every: 10,
      source: 'Y3-08: pairs to 100 in 5s, on 0 to 100 in fives, every ten written' },
      about: 'Pairs to 100', sample: { rule: 'sum', sum: '65 + ? = 100', value: 35 } },
    { kind: 'sums', plan: 'Y3-09', row: { ops: ['+', '−'], forms: ['TO+TO', 'TO-TO'], max: 200, ...STRETCH, source: 'Y3-09: TO + TO (answers to 200) and TO − TO' },
      about: 'Big 2-digit sums', sample: { rule: 'sum', sum: '68 + 47', value: 115 } },
    { kind: 'sums', plan: 'Y3-10', row: { ops: ['+', '−'], forms: ['estimate'], rounds: [10, 100], near: 10, span: 10, label_every: 1,
      source: 'Y3-10: estimate + and −, to the nearest 10 (2-digit numbers) or 100 (3-digit numbers near a hundred), up to 1000' },
      about: 'Estimate it', sample: { rule: 'sum', sum: '298 + 403', a: 298, op: '+', b: 403, round: 100, exact: 701, value: 700 } },
    { kind: 'sums', plan: 'Y3-11', row: { ops: ['×'], forms: ['table'], tables: [4], times_max: 12, layout: 'line', from: 0, to: 48, step: 4, label_every: 4,
      source: 'Y3-11: the 4 times table to × 12 (D-099), on its own line' },
      about: '4 times table', sample: { rule: 'sum', sum: '4 × 7', value: 28 } },
    { kind: 'sums', plan: 'Y3-12', row: { ops: ['×'], forms: ['table'], tables: [8], times_max: 12, layout: 'line', from: 0, to: 96, step: 8, label_every: 8,
      source: 'Y3-12: the 8 times table to × 12 (D-099), on its own line' },
      about: '8 times table', sample: { rule: 'sum', sum: '8 × 6', value: 48 } },
    { kind: 'sums', plan: 'Y3-13', row: { ops: ['×'], forms: ['table'], tables: [3], times_max: 12, layout: 'line', from: 0, to: 36, step: 3, label_every: 3,
      source: 'Y3-13: the 3 times table to × 12 (D-099), on its own line' },
      about: '3 times table', sample: { rule: 'sum', sum: '3 × 9', value: 27 } },
    { kind: 'sums', plan: 'X-div348', row: { ops: ['÷'], forms: ['divide'], tables: [3, 4, 8], times_max: 12, layout: 'line', from: 0, to: 12, step: 1, label_every: 1,
      source: 'notes: year3 division: ÷ 3, 4 and 8 (new this year), whole answers 1 to 12' },
      about: 'Divide by 3, 4 and 8', sample: { rule: 'sum', sum: '32 ÷ 4', value: 8 } },
    CHALLENGE,
  ] },
  { id: 'ringed', levels: [
    { kind: 'sums', plan: 'Y3-14', row: { ops: ['×', '÷'], forms: ['table', 'divide'], tables: [2, 3, 4, 5, 8, 10], times_max: 12, ...STRETCH, fall_s: 6,
      source: 'Y3-14: × and ÷ of the 2, 3, 4, 5, 8 and 10 tables to × 12, 6 s a landing' },
      about: 'Mixed tables, fast', sample: { rule: 'sum', sum: '8 × 7', value: 56 } },
    { kind: 'sums', plan: 'Y3-15', row: { ops: ['×'], forms: ['TO*O'], a: [11, 30], b: [2, 5], ...STRETCH, source: 'Y3-15: TO × O, 11 to 30 times 2 to 5' },
      about: '2-digit times 1-digit', sample: { rule: 'sum', sum: '23 × 4', value: 92 } },
    { kind: 'sums', plan: 'X-TOdivO', row: { ops: ['÷'], forms: ['TO/O'], divisors: [2, 3, 4, 5, 8], ...STRETCH,
      source: "notes: year3 division 'extended': TO ÷ O with no remainder, by Year 3's 1-digit tables" },
      about: '2-digit divided by 1-digit', sample: { rule: 'sum', sum: '48 ÷ 4', value: 12 } },
    { kind: 'ask', plan: 'Y3-16', row: { ask: 'frac-of', fractions: ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/8', '3/8', '5/8', '7/8', '1/10', '3/10', '7/10', '9/10'],
      pick: 'den', total_max: 40, span: 10, label_every: 1, source: 'Y3-16: unit and non-unit fractions (simplest form) of amounts to 40, denominators 2, 3, 4, 5, 8, 10, whole answers' },
      about: 'Fractions of amounts', sample: { rule: 'ask', ask: 'frac-of', num: 3, den: 5, total: 20, value: 12 } },
    { kind: 'ask', plan: 'Y3-17', row: { ask: 'seq', steps: [1], den: 10, start: 'any', min: 0, max: 20, dirs: ['forward', 'backward'], span: 10, label_every: 1,
      source: 'Y3-17: count up and down in tenths, 0 to 2 (0 to 20 tenths)' },
      about: 'Counting in tenths', sample: { rule: 'ask', ask: 'seq', step: 1, dir: 'forward', terms: [7, 8, 9], value: 10, den: 10 } },
    { kind: 'ask', plan: 'Y3-18', row: { ask: 'frac-compare', dens: [2, 3, 4, 5, 6, 8, 10], min_gap: [1, 12],
      source: 'Y3-18: compare unit fractions, both marked on 0 to 1; pairs closer than 1/12 left out (Claude)' },
      about: 'Which fraction is bigger?', sample: { rule: 'ask', ask: 'frac-compare', first: 3, second: 5, parts: 15, value: 5, other: 3 } },
    { kind: 'sums', plan: 'Y3-19', row: { ops: ['+', '−'], forms: ['frac'], dens: [2, 3, 4, 5, 6, 7, 8, 9, 10], layout: 'parts',
      source: 'Y3-19: add and take away fractions with the same denominator (2 to 10), within one whole' },
      about: 'Adding fractions', sample: { rule: 'sum', sum: '5/7 + 1/7', a: 5, op: '+', b: 1, den: 7, value: 6 } },
    CHALLENGE,
  ] },
];

export const FIRST_TRACK = 'reception'; // a device with no track yet starts on the lower track
export const TRACKS = {
  reception: { name: 'Reception, then Year 1', edition: 'lower-1', systems: LOWER },
  year2: { name: 'Year 2, then Year 3', edition: 'higher-1', systems: HIGHER },
};
