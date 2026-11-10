// Rocket Lander: steer a falling rocket onto the spot asked for on the planet's number line.
// One game with a map of solar systems (D-058). Version 3.2.
//
// Changes at v3.2 (step 2c-3a, D-089 to D-094): two tracks, each with its own map (map.js 2.0: the lower
// track's Reception systems, the higher track's stand-in levels until step 2c-3b), handed to the engine
// as mode.tracks. Two new kinds of level: 'ask', Reception's questions asked by a picture or a phrase
// (asks.js, faces.js), and 'challenge', a round mixing its system's seven levels, each landing played
// the way its own level plays it (asks.js, planChallenge; D-091). Sums levels may show dots under each
// number (`pictures`, Q-033); number levels may keep their targets to part of the line (`pick`).
// Changes at v3.1 (step 2c-build, D-066): the map sets the level (round.js and progress.js), so the
// flat list of levels for levelOf goes.
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
import { fmt, say, makeLine } from '../_common/rocket/numbers.js';
import { followLevel } from '../_common/rocket/ladder.js';
import { PLANETS, planetIndex } from '../_common/rocket/planets.js';
import { LEVELS } from './levels.js';
import { LEVELS as SUMS_LEVELS } from './sums-levels.js';
import { TRACKS as MAP_TRACKS, FIRST_TRACK } from './map.js';
import { lineFor, planRound, pickTarget, isRight, goalOf } from './rules.js';
import { planAsks, askTarget, isRight as askRight, goalOf as askGoal, planChallenge } from './asks.js';
import { faceChip, picturedSum } from './faces.js';
import { OP_WORDS, OPS_OPTIONS, opsFor, makeSum, lineForSum, roundLine, partsOf, planParts, isRight as sumRight, goalOf as sumGoal } from './sums.js';

// ---------- The map: each system's look and name from planets.js, each level's row by its kind ----------

// A level's row: its own (map.js) or its table's; a challenge's row is its system's other levels.
const ROWS = { number: LEVELS, sums: SUMS_LEVELS };
const rowOf = (lv) => ({ ...(lv.row || ROWS[lv.kind][lv.level - 1]), kind: lv.kind });
const buildMap = (systems) => systems.map((sys) => {
  const p = planetIndex(sys.id);
  const mix = sys.levels.filter((lv) => lv.kind !== 'challenge').map((lv) => ({ kind: lv.kind, row: rowOf(lv) }));
  return {
    id: sys.id, name: PLANETS[p].name, planet: p, soon: !!sys.soon,
    levels: sys.levels.map((lv, n) => ({ id: `${sys.id}-${n + 1}`, kind: lv.kind, plan: lv.plan || null,
      row: lv.kind === 'challenge' ? { kind: 'challenge', mix } : rowOf(lv), about: lv.about, sample: lv.sample })),
  };
});
// Each track's map, as the engine and the test panel read them (D-089).
export const TRACKS = Object.fromEntries(Object.entries(MAP_TRACKS).map(([id, t]) => [id, { name: t.name, edition: t.edition, map: buildMap(t.systems) }]));

// ---------- Number levels (Number mode, D-035, D-038) ----------

// A dice face for the chip (D-035's D1): the usual pip patterns for 1 to 6.
const PIPS = { 1: [[15, 15]], 2: [[8, 8], [22, 22]], 3: [[8, 8], [15, 15], [22, 22]], 4: [[8, 8], [22, 8], [8, 22], [22, 22]],
  5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]], 6: [[8, 8], [22, 8], [8, 15], [22, 15], [8, 22], [22, 22]] };
const dieSvg = (n) => `<svg class="die" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.8" y="1.8" width="26.4" height="26.4" rx="6.5"/>${
  PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.1"/>`).join('')}</svg>`;

const NUMBER = {
  lineFor: (row, S) => lineFor(row, S),
  planRound: (row, total, rand) => planRound(row.mix, total, rand),
  pickTarget: (kind, line, prev, rand, row) => pickTarget(kind || 'any', line, prev, rand, row && row.pick),
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
  // Reception's sums show dots under each number (Q-033)
  chip: (T, S, row) => (row && row.pictures && T.a !== undefined ? picturedSum(T) : { cls: 'sum', html: esc(T.sum) }),
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

// ---------- Reception's questions (asks.js, faces.js; level plan section 5) ----------
// The answer is a number on the level's own line; the question is a picture or a phrase, said out loud.
// A face asks by itself, so "Land on" is left to the voice (sayAll).

const n$ = (v) => say(v);
const ASK_SAY = {
  dots: () => 'How many dots? Land on that number!',
  flash: () => 'Quick look! How many dots?',
  compare: (T) => (T.rel === 'same' ? 'Land on the same number as the dots!' : `Land on a number ${T.rel === 'more' ? 'more' : 'fewer'} than the dots!`),
  'more-less': (T) => `Land on one ${T.dir === 'more' ? 'more' : 'less'} than ${n$(T.n)}!`,
  bond: (T) => `${n$(T.part)} and how many more make ${n$(T.whole)}?`,
  double: (T) => `Land on double ${n$(T.n)}!`,
  share: (T) => `Share ${n$(T.total)} sweets between ${n$(T.groups)} plates. How many on each?`,
};
// After a miss: { speech, html }, the right number (or the nearest that fits) as `goal`.
function askMiss(T, spot, goal) {
  const was = { speech: `That's ${n$(spot)}.`, html: `That's <b class="no-n">${spot}</b>.` };
  const say2 = (speech, html) => ({ speech: `${was.speech} ${speech}`, html: `${was.html} ${html}` });
  switch (T.ask) {
    case 'dots': return say2(`There are ${n$(T.n)} dots. ${n$(goal)} is over here!`, `There are <b>${goal}</b> dots!`);
    case 'flash': return say2(`There were ${n$(T.n)} dots. Over here!`, `There were <b>${goal}</b> dots!`);
    case 'compare':
      return T.rel === 'same' ? say2(`${n$(goal)} dots, so ${n$(goal)}!`, `The same as the dots is <b>${goal}</b>!`)
        : say2(`${n$(goal)} is ${T.rel} than ${n$(T.n)}!`, `<b>${goal}</b> is ${T.rel} than ${T.n}!`);
    case 'more-less': return say2(`One ${T.dir} than ${n$(T.n)} is ${n$(goal)}!`, `1 ${T.dir} than ${T.n} is <b>${goal}</b>!`);
    case 'bond': return say2(`${n$(T.part)} and ${n$(goal)} make ${n$(T.whole)}!`, `${T.part} and <b>${goal}</b> make ${T.whole}!`);
    case 'double': return say2(`Double ${n$(T.n)} is ${n$(goal)}!`, `Double ${T.n} is <b>${goal}</b>!`);
    case 'share': return say2(`${n$(goal)} on each plate!`, `<b>${goal}</b> on each plate!`);
    default: return say2(`${n$(goal)} is over here!`, `<b>${goal}</b> is over here!`);
  }
}
const ASK = {
  // the level's own line: its answers are made for it, so a grown-up's line settings don't move it
  lineFor: (row, S) => ({ from: row.from, to: row.to, step: 1, label_every: S.label_every ?? row.label_every ?? 1 }),
  planRound: (row, total, rand) => planAsks(row, total, rand),
  pickTarget: (kind, line, prev, rand, row) => askTarget(row, kind, prev && prev.ask ? prev : null, rand),
  isRight: askRight,
  goalOf: askGoal,
  chip: (T) => faceChip(T),
  words: (T) => (ASK_SAY[T.ask] ? ASK_SAY[T.ask](T) : 'the number').replace(/^Land on /, '').replace(/[!?]$/, ''),
  sayAll: (T) => (ASK_SAY[T.ask] ? ASK_SAY[T.ask](T) : 'Land on the number!'),
  miss: (T, spot, goal) => askMiss(T, spot, goal),
  beam: false,
  testHooks: {
    // make this landing's question a given one, such as aimAsk({ ask: 'dots', n: 4, value: 4 })
    aimAsk(T, { set }) { set({ rule: T.value === undefined ? 'range' : 'ask', ...T }); return true; },
  },
};

// ---------- Challenge rounds (D-091): the system's seven levels mixed ----------
// Each landing comes from one of the levels (planChallenge: each once and one more at random), and is
// asked, laid out and judged the way that level plays it, on its own line with its own label look.

const KINDS = { number: NUMBER, sums: SUMS, ask: ASK };
const subOf = (T) => KINDS[T.subKind];
const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 16.9 6.2 20l1.2-6.5L2.6 9l6.5-.8z" fill="#FFC93C" stroke="#1B1446" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const CHALLENGE = {
  lineFor: (row, S) => KINDS[row.mix[0].kind].lineFor(row.mix[0].row, S),
  landingLine: (T, row, S, rand) => {
    const m = row.mix[T.sub], k = KINDS[m.kind];
    const own = k.landingLine ? k.landingLine(T, m.row, S, rand) : null;
    return { ...(own || k.lineFor(m.row, S)), labels: m.row.labels || 'plain' };
  },
  planRound: (row, total, rand) => {
    const plans = row.mix.map((m) => KINDS[m.kind].planRound(m.row, total, rand));
    return planChallenge(row.mix.length, total, rand).map((j) => ({ sub: j, kind: plans[j][Math.floor(rand() * plans[j].length)] }));
  },
  pickTarget: (P, line, prev, rand, row, S) => {
    const m = row.mix[P.sub], k = KINDS[m.kind];
    const own = makeLine(k.lineFor(m.row, S));
    const T = k.pickTarget(P.kind, own, prev && prev.sub === P.sub ? prev : null, rand, m.row, S);
    return { ...T, sub: P.sub, subKind: m.kind };
  },
  isRight: (T, spot, allowed) => subOf(T).isRight(T, spot, allowed),
  goalOf: (T, raw, line) => subOf(T).goalOf(T, raw, line),
  chip: (T, S, row) => (T.rule === 'challenge' ? { cls: 'challenge', html: `${STAR_SVG}mix!` } : subOf(T).chip(T, S, row && row.mix ? row.mix[T.sub].row : row)),
  words: (T, S) => (T.rule === 'challenge' ? 'a mix of levels' : subOf(T).words(T, S)),
  sayAll: (T, S) => (subOf(T).sayAll ? subOf(T).sayAll(T, S) : `Land on ${subOf(T).words(T, S)}!`),
  miss: (T, spot, goal, S) => subOf(T).miss(T, spot, goal, S),
  beam: (T) => !!(T && T.subKind && KINDS[T.subKind].beam),
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
  tracks: TRACKS,
  track: FIRST_TRACK,
  kinds: { number: NUMBER, sums: SUMS, ask: ASK, challenge: CHALLENGE },
});
