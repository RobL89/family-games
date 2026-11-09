// Rocket Lander: steer a falling rocket onto the spot asked for on the planet's number line.
// One game with a map of solar systems (D-058). Version 3.0.
//
// Changes at v3.0 (step 2c-build, D-058, D-068): Rocket Sums joined Rocket Lander. Its sums
// (sums.js) and levels (sums-levels.js) moved here with git, and its tile retired. The levels sit
// on the map (map.js, stand-in levels until the level plan), each a number level (Number mode:
// levels.js and rules.js, D-035, D-038) or a sums level (sums.js, D-039 to D-041), and the shared
// engine (games/_common/rocket/round.js) plays each the way its kind below says. The two kinds'
// code is as it was in the two tiles (rocket-lander/game.js 2.1, rocket-sums/game.js 1.2). Version
// 2.1 was Number mode's tile alone.
//
// Runs on its own (D-004, D-014; GC5): the map's place on this device, or the level in the
// address (?level=, counted along the map: 1 to 8 on Moon, 9 to 16 on Red Dust). begin() is on
// window.__test, and at stage 3 the contract's start message calls it.

import { runRocket } from '../_common/rocket/round.js';
import { SETTINGS } from '../_common/rocket/settings.js';
import { fmt, say } from '../_common/rocket/numbers.js';
import { levelOf, followLevel } from '../_common/rocket/ladder.js';
import { PLANETS, planetIndex } from '../_common/rocket/planets.js';
import { LEVELS } from './levels.js';
import { LEVELS as SUMS_LEVELS } from './sums-levels.js';
import { SYSTEMS } from './map.js';
import { lineFor, planRound, pickTarget, isRight, goalOf } from './rules.js';
import { OP_WORDS, OPS_OPTIONS, opsFor, makeSum, lineForSum, roundLine, partsOf, planParts, isRight as sumRight, goalOf as sumGoal } from './sums.js';

// ---------- The map: each system's look and name from planets.js, each level's row by its kind ----------

const ROWS = { number: LEVELS, sums: SUMS_LEVELS };
export const MAP = SYSTEMS.map((sys) => {
  const p = planetIndex(sys.id);
  return {
    id: sys.id, name: PLANETS[p].name, planet: p, soon: !!sys.soon,
    levels: sys.levels.map((lv, n) => ({ id: `${sys.id}-${n + 1}`, kind: lv.kind, row: { ...ROWS[lv.kind][lv.level - 1], kind: lv.kind }, about: lv.about, sample: lv.sample })),
  };
});
// The levels in the order they are played, system after system (1 to 16 on the stand-in map).
const ROUTE = MAP.flatMap((sys) => sys.levels.map((lv) => lv.row));

// ---------- Number levels (Number mode, D-035, D-038) ----------

// A dice face for the chip (D-035's D1): the usual pip patterns for 1 to 6.
const PIPS = { 1: [[15, 15]], 2: [[8, 8], [22, 22]], 3: [[8, 8], [15, 15], [22, 22]], 4: [[8, 8], [22, 8], [8, 22], [22, 22]],
  5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]], 6: [[8, 8], [22, 8], [8, 15], [22, 15], [8, 22], [22, 22]] };
const dieSvg = (n) => `<svg class="die" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.8" y="1.8" width="26.4" height="26.4" rx="6.5"/>${
  PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.1"/>`).join('')}</svg>`;

const NUMBER = {
  lineFor: (row, S) => lineFor(row, S),
  planRound: (row, total, rand) => planRound(row.mix, total, rand),
  pickTarget: (kind, line, prev, rand) => pickTarget(kind || 'any', line, prev, rand),
  isRight,
  goalOf,
  chip: (T, S) => T.rule === 'dice' ? { cls: 'dice', html: dieSvg(T.value) }
    : T.rule === 'parity' ? { cls: `word ${T.parity}`, html: T.parity }
    : { cls: '', html: fmt(T.value, S.show_as) },
  // what the target says out loud, and its words for screen readers
  words: (T, S) => (T.rule === 'parity' ? `an ${T.parity} number` : say(T.value, S.show_as)),
  miss: (T, spot, goal, S) => (T.rule === 'parity'
    ? { speech: `That's ${say(spot, S.show_as)}. ${say(goal, S.show_as)} is ${T.parity}!`,
      html: `That's <b class="no-n">${fmt(spot, S.show_as)}</b>. <b class="${T.parity}">${fmt(goal, S.show_as)}</b> is ${T.parity}!` }
    : { speech: `That's ${say(spot, S.show_as)}. ${say(goal, S.show_as)} is over here!`,
      html: `That's <b class="no-n">${fmt(spot, S.show_as)}</b>. <b>${fmt(goal, S.show_as)}</b> is over here!` }),
  beam: false,
  testHooks: {
    // make this landing's target a given number on the line
    aim(v, { line, set }) { const T = { rule: 'any', value: line.value(line.index(v)) }; set(T); return T.value; },
    // make this landing's target a dice face (n) or even or odd ('even', 'odd')
    aimRule(rule, x, { line, set }) { set(rule === 'parity' ? { rule, parity: x } : { rule, value: line.value(line.index(x)) }); return true; },
  },
};

// ---------- Sums levels (once Rocket Sums: D-021, D-037, D-039 to D-041) ----------
// The line is laid out for each sum: the level's whole line while the answers fit, otherwise a
// stretch of 10 marks with the answer in it; a beam shows the exact spot the rocket will land on
// (D-032). Levels may play in parts, such as levels 1 and 2's two halves (D-040), each landing
// asking from its part, on its part's line; at most one sum answering 0 a round (D-041).

const sumWords = (T) => `${say(T.a)} ${OP_WORDS[T.op]} ${say(T.b)}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// a grown-up's written-number setting, if given, over the level's
const withLabels = (row, S) => (S.label_every === null || S.label_every === undefined ? row : { ...row, label_every: S.label_every });
const target = (s, part = 0) => ({ rule: 'sum', value: s.answer, sum: `${s.a} ${s.op} ${s.b}`, a: s.a, op: s.op, b: s.b, part });
const partOf = (row, k) => { const parts = partsOf(row); return parts[Math.min(parts.length - 1, k || 0)]; };

// This round's state: whether a sum answering 0 has been asked (at most one a round, D-041),
// and the part the latest landing played (for a sum a test sets).
let zeroAsked = false, lastPart = 0;
const ANSWER = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };

const SUMS = {
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
  isRight: sumRight,
  goalOf: sumGoal,
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
};

// ---------- Settings: the shared ones, the line's left to the level (GC3), and the operations ----------
// The line settings play on number levels; the operations on sums levels (empty: as the level says; F4).
export const SCHEMA = {
  ...followLevel(SETTINGS, ['from', 'to', 'label_every']),
  operations: { default: null, options: OPS_OPTIONS, about: 'Sums levels: which sums to ask: + only, + and −, and so on. Empty: as the level says.' },
};

runRocket({
  id: 'rocket-lander',
  name: 'Rocket Lander',
  schema: SCHEMA,
  map: MAP,
  levelOf: (given) => levelOf(ROUTE, given),
  kinds: { number: NUMBER, sums: SUMS },
});
