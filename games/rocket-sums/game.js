// Rocket Sums, the rocket game's maths tile (D-021, D-027, D-037): a sum at the top, and the
// rocket steered onto its answer on the number line. Version 1.0, step 2a-2.
//
// The round flow is the shared engine's (games/_common/rocket/round.js); this file is Maths
// mode's part: its levels (levels.js, D-039), sums (sums.js), chip and words. The line is
// laid out for each sum: the level's whole line while the answers fit, otherwise a stretch
// of 10 marks with the answer in it; a beam shows the exact spot the rocket will land on
// (D-032). Runs on its own (D-004, D-014; GC5): level 1, or ?level= in the address.

import { runRocket } from '../_common/rocket/round.js';
import { SETTINGS } from '../_common/rocket/settings.js';
import { say } from '../_common/rocket/numbers.js';
import { levelOf, followLevel } from '../_common/rocket/ladder.js';
import { LEVELS } from './levels.js';
import { OP_WORDS, OPS_OPTIONS, opsFor, makeSum, lineForSum, roundLine, isRight, goalOf } from './sums.js';

// Maths mode's settings: the shared ones that make sense for whole-number answers, the
// written numbers left to the level, and the operations (empty: as the level says; F4).
const { from, to, step, show_as, ...KEEP } = SETTINGS;
const SCHEMA = {
  ...followLevel(KEEP, ['label_every']),
  operations: { default: null, options: OPS_OPTIONS, about: 'Which sums to ask: + only, + and −, and so on. Empty: as the level says.' },
};

const sumWords = (T) => `${say(T.a)} ${OP_WORDS[T.op]} ${say(T.b)}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// a grown-up's written-number setting, if given, over the level's
const withLabels = (row, S) => (S.label_every === null || S.label_every === undefined ? row : { ...row, label_every: S.label_every });
const target = (s) => ({ rule: 'sum', value: s.answer, sum: `${s.a} ${s.op} ${s.b}`, a: s.a, op: s.op, b: s.b });
const ANSWER = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };

runRocket({
  name: 'Rocket Sums',
  schema: SCHEMA,
  levelOf: (given) => levelOf(LEVELS, given),
  lineFor: (row, S) => roundLine(withLabels(row, S)),
  landingLine: (T, row, S, rand) => lineForSum({ answer: T.value }, opsFor(row, S), withLabels(row, S), rand),
  planRound: (row, total) => Array(total).fill('sum'),
  pickTarget: (kind, line, prev, rand, row, S) => target(makeSum(opsFor(row, S), row, prev, rand)),
  isRight,
  goalOf,
  chip: (T) => ({ cls: 'sum', html: esc(T.sum) }),
  words: sumWords,
  miss: (T, spot) => ({
    speech: `That's ${say(spot)}. ${sumWords(T)} is ${say(T.value)}. Over here!`,
    html: `That's <b class="no-n">${spot}</b>. ${esc(T.sum)} = <b>${T.value}</b>, over here!`,
  }),
  beam: true,
  testHooks: {
    // make this landing's sum a given one, such as aimSum(7, '×', 8); its line is laid out anew
    aimSum(a, op, b, { set }) {
      const answer = ANSWER[op] ? ANSWER[op](a, b) : NaN;
      if (!Number.isInteger(answer) || answer < 0) return false;
      set(target({ a, op, b, answer }));
      return answer;
    },
  },
});
