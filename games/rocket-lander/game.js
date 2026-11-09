// Rocket Lander, Number mode: steer a falling rocket onto the number asked for on the
// planet's number line. Version 2.1. Changes at v2.1: the tile's id, for its progress kept on
// the device (D-042). Changes at v2.0: the round flow moved to the shared
// engine, games/_common/rocket/round.js (D-027, step 2a-2); this file is now Number mode's
// part of it: its levels, targets, chip and words.
//
// Levels (contract v0.3 GC3) come from levels.js (D-038): each sets the line, how the
// numbers are written and what a round asks for (any number, even or odd, dice faces;
// rules.js, D-035). Runs on its own (D-004, D-014; GC5): level 1, or ?level= in the
// address. begin() is on window.__test, and at stage 3 the contract's start message calls it.

import { runRocket } from '../_common/rocket/round.js';
import { SETTINGS } from '../_common/rocket/settings.js';
import { fmt, say } from '../_common/rocket/numbers.js';
import { LEVELS } from './levels.js';
import { levelOf, followLevel } from '../_common/rocket/ladder.js';
import { lineFor, planRound, pickTarget, isRight, goalOf } from './rules.js';

// A dice face for the chip (D-035's D1): the usual pip patterns for 1 to 6.
const PIPS = { 1: [[15, 15]], 2: [[8, 8], [22, 22]], 3: [[8, 8], [15, 15], [22, 22]], 4: [[8, 8], [22, 8], [8, 22], [22, 22]],
  5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]], 6: [[8, 8], [22, 8], [8, 15], [22, 15], [8, 22], [22, 22]] };
const dieSvg = (n) => `<svg class="die" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.8" y="1.8" width="26.4" height="26.4" rx="6.5"/>${
  PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.1"/>`).join('')}</svg>`;

runRocket({
  id: 'rocket-lander',
  name: 'Rocket Lander',
  // Number mode's settings: the shared ones, with the line's left to the level (GC3).
  schema: followLevel(SETTINGS, ['from', 'to', 'label_every']),
  levelOf: (given) => levelOf(LEVELS, given),
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
});
