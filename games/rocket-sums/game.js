// Rocket Sums, the rocket game's maths tile (D-021, D-027, D-037): a sum at the top, and the
// rocket steered onto its answer on the number line. Version 1.1, step 2a-2. Changes at
// v1.1: levels in parts, such as levels 1 and 2's two halves (D-040), each landing asking
// from its part, on its part's line; at most one sum answering 0 a round (proposed, Q-022).
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
import { OP_WORDS, OPS_OPTIONS, opsFor, makeSum, lineForSum, roundLine, partsOf, planParts, isRight, goalOf } from './sums.js';

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
const target = (s, part = 0) => ({ rule: 'sum', value: s.answer, sum: `${s.a} ${s.op} ${s.b}`, a: s.a, op: s.op, b: s.b, part });
const partOf = (row, k) => { const parts = partsOf(row); return parts[Math.min(parts.length - 1, k || 0)]; };

// This round's state: whether a sum answering 0 has been asked (at most one a round, Q-022),
// and the part the latest landing played (for a sum a test sets).
let zeroAsked = false, lastPart = 0;
const ANSWER = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };

runRocket({
  name: 'Rocket Sums',
  schema: SCHEMA,
  levelOf: (given) => levelOf(LEVELS, given),
  lineFor: (row, S) => roundLine(withLabels(partOf(row, 0), S)),
  landingLine: (T, row, S, rand) => { const p = partOf(row, T.part); return lineForSum({ answer: T.value }, opsFor(p, S), withLabels(p, S), rand); },
  // each landing's kind is the part it plays (D-040)
  planRound: (row, total) => { zeroAsked = false; return planParts(row, total); },
  pickTarget: (kind, line, prev, rand, row, S) => {
    const p = partOf(row, kind);
    const s = makeSum(opsFor(p, S), p, prev, rand, { zeroOk: !zeroAsked });
    if (s.answer === 0) zeroAsked = true;
    lastPart = kind || 0;
    return target(s, lastPart);
  },
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
      set(target({ a, op, b, answer }, lastPart));
      return answer;
    },
  },
});
