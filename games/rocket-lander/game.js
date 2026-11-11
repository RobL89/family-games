// Rocket Lander: steer a falling rocket onto the spot asked for on the planet's number line.
// One game with a map of solar systems (D-058). Version 3.4.
//
// Changes at v3.4 (step 2c-3c): Year 1 and Year 3 (map.js 2.2). Their questions (asks.js 1.2) land on the
// line askLine gives each landing: a stretch (in its half, for numbers to 100; counting in 10s on a
// stretch in 2s, 50s in tens and 100s in twenties; tenths written as tenths), a group size's own line, or a
// pair of fractions' line with only the two written (`label_at`). Said and shown after a miss in their own
// words: a number to find, 10 or 100 more or less, groups of, half of, hundreds, tens and ones, a count in
// tenths, which fraction is bigger. Their sums (sums.js 1.4): a missing answer and sums written answer first
// ('7 = ? − 9'), fraction sums written one number over the other, on 0 to 1 in their parts, and estimates
// (a face: '298 + 403 ≈ ?', nearest 100), on a line in tens or hundreds; the test hook aims these too.
//
// Changes at v3.3 (step 2c-3b, D-100): Year 2 on the higher track (map.js 2.1). Year 2's questions
// (asks.js 1.1, faces.js 1.1) land on a stretch of 10 marks with the answer in it (windowFor), or a
// shape's fraction on a line of quarters or thirds written as fractions (shapeLine, scene.js 'frac'
// looks); the voice doesn't say a number the child is to read (tens and ones, words). Year 2's sums
// (sums.js 1.3) in forms: three numbers, missing numbers ("? + 25 = 60", the box to find), tables on
// their own lines; a grown-up's operations setting leaves them as the level says. A level may set its
// own fall time (the timed level, 6 s: fallTime). A challenge's landing keeps its own level's label look
// (a fraction line) and fall time.
//
// Changes at v3.2 (step 2c-3a, D-089 to D-094): two tracks, each with its own map (map.js 2.0: the lower
// track's Reception systems, the higher track's stand-in levels until step 2c-3b), handed to the engine
// as mode.tracks. Two new kinds of level: 'ask', Reception's questions asked by a picture or a phrase
// (asks.js, faces.js), and 'challenge', a round mixing its system's seven levels, each landing played
// the way its own level plays it (asks.js, planChallenge; D-091). Sums levels may show dots under each
// number (`pictures`, Q-033); number levels may keep their targets to part of the line (`pick`). Each
// kind says which landings get 25% more time to fall (moreTime, D-097): pictures, dice and sums.
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
import { fmt, say, makeLine, fracText, fracSay, partsSay } from '../_common/rocket/numbers.js';
import { followLevel } from '../_common/rocket/ladder.js';
import { PLANETS, planetIndex } from '../_common/rocket/planets.js';
import { LEVELS } from './levels.js';
import { LEVELS as SUMS_LEVELS } from './sums-levels.js';
import { TRACKS as MAP_TRACKS, FIRST_TRACK } from './map.js';
import { lineFor, planRound, pickTarget, isRight, goalOf } from './rules.js';
import { planAsks, askTarget, isRight as askRight, goalOf as askGoal, planChallenge, askLine, askPart } from './asks.js';
import { faceChip, picturedSum, fracHtml, numberWords, partsHtml, fracSumHtml } from './faces.js';
import { OP_WORDS, OPS_OPTIONS, opsFor, makeSum, lineForSum, roundLine, partsOf, planParts, sumText, isRight as sumRight, goalOf as sumGoal } from './sums.js';

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
  moreTime: (T, row) => T.rule === 'dice' || (row && row.labels === 'dice'), // dice to read (D-097)
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

// A sum said out loud: "four plus seven plus six"; a missing number as "what": "what plus twenty-five
// makes sixty", "seven plus five makes what", answer first: "seven equals what take away nine"; fractions
// as written: "five sevenths plus one seventh"; anything else "seven take away two".
const sumWords = (T) => {
  if (T.den) return `${fracSay(T.a, T.den)} ${OP_WORDS[T.op]} ${fracSay(T.b, T.den)}`;
  const w = (k) => (T.missing === k ? 'what' : say(T[k]));
  if (T.missing) {
    const r = T.missing === 'answer' ? 'what' : say(T.result), sum = `${w('a')} ${OP_WORDS[T.op]} ${w('b')}`;
    return T.flip ? `${r} equals ${sum}` : `${sum} makes ${r}`;
  }
  return `${say(T.a)} ${OP_WORDS[T.op]} ${say(T.b)}${T.c !== undefined ? ` ${OP_WORDS[T.op2]} ${say(T.c)}` : ''}`;
};
// The whole sum with its answer, said: "thirty-five plus twenty-five makes sixty", "four plus seven plus six is
// seventeen", "five sevenths plus one seventh is six sevenths", "two hundred and ninety-eight plus four hundred
// and three is seven hundred and one, about seven hundred".
const fullWords = (T) => (T.missing ? `${say(T.a)} ${OP_WORDS[T.op]} ${say(T.b)} makes ${say(T.result)}`
  : T.den ? `${sumWords(T)} is ${partsSay(T.value, T.den)}`
    : T.round ? `${sumWords(T)} is ${say(T.exact)}, about ${say(T.value)}` : `${sumWords(T)} is ${say(T.value)}`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());
// a grown-up's written-number setting, if given, over the level's
const withLabels = (row, S) => (S.label_every === null || S.label_every === undefined ? row : { ...row, label_every: S.label_every });
const target = (s, part = 0) => {
  const T = { rule: 'sum', value: s.answer, sum: sumText(s), a: s.a, op: s.op, b: s.b, part };
  for (const k of ['op2', 'c', 'result', 'missing', 'flip', 'den', 'round', 'exact']) if (s[k] !== undefined) T[k] = s[k];
  return T;
};
const partOf = (row, k) => { const parts = partsOf(row); return parts[Math.min(parts.length - 1, k || 0)]; };
// Year 2's sums are as the level says; a grown-up's operations setting plays on the earlier sums levels
const opsOf = (p, S) => (p.forms ? p.ops.slice() : opsFor(p, S));

// This round's state: whether a sum answering 0 has been asked (at most one a round, D-041),
// and the part the latest landing played (for a sum a test sets).
let zeroAsked = false, lastPart = 0;
const ANSWER = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };

const SUMS = {
  lineFor: (row, S) => roundLine(withLabels(partOf(row, 0), S)),
  landingLine: (T, row, S, rand) => { const p = partOf(row, T.part); return lineForSum({ answer: T.value, den: T.den, round: T.round }, opsOf(p, S), withLabels(p, S), rand); },
  // each landing's kind is the part it plays (D-040)
  planRound: (row, total) => { zeroAsked = false; return planParts(row, total); },
  pickTarget: (kind, line, prev, rand, row, S) => {
    const p = partOf(row, kind);
    const s = makeSum(opsOf(p, S), p, prev, rand, { zeroOk: !zeroAsked });
    if (s.answer === 0) zeroAsked = true;
    lastPart = kind || 0;
    return target(s, lastPart);
  },
  isRight: sumRight,
  goalOf: sumGoal,
  // Reception's sums show dots under each number (Q-033); a missing number shows a box to find; a fraction
  // sum is written one number over the other; an estimate asks for the nearest ten or hundred (a face)
  chip: (T, S, row) => (row && row.pictures && T.a !== undefined ? picturedSum(T)
    : T.den ? { cls: 'sum frac', html: fracSumHtml(T) }
      : T.round ? { cls: 'face face-est sum', html: `<span class="sm">${esc(T.sum)} ≈ <b class="q">?</b></span><span class="fw">nearest ${T.round}</span>` }
        : { cls: 'sum', html: T.missing || /\?/.test(T.sum) ? `<span class="sm">${esc(T.sum).replace('?', '<b class="q">?</b>')}</span>` : esc(T.sum) }),
  words: sumWords,
  sayAll: (T) => (T.round ? `Estimate ${sumWords(T)}. Land on the nearest ${T.round === 100 ? 'hundred' : 'ten'}!`
    : T.missing ? `${sumWords(T).replace(/^what/, 'What')}?` : `Land on ${sumWords(T)}!`),
  miss: (T, spot) => {
    if (T.den) {
      return { speech: `That's ${partsSay(spot, T.den)}. ${fullWords(T)}. Over here!`,
        html: `That's ${partsHtml(spot, T.den)}. ${fracSumHtml(T)} = <b>${partsHtml(T.value, T.den)}</b>, over here!` };
    }
    if (T.round) return { speech: `That's ${say(spot)}. ${fullWords(T)}. Over here!`, html: `That's <b class="no-n">${spot}</b>. ${esc(T.sum)} = ${T.exact}, about <b>${T.value}</b>!` };
    if (T.missing) {
      const bold = (k, v) => (T.missing === k ? `<b>${v}</b>` : v), sum = `${bold('a', T.a)} ${T.op} ${bold('b', T.b)}`, res = bold('answer', T.result);
      return { speech: `That's ${say(spot)}. ${fullWords(T)}. Over here!`, html: `That's <b class="no-n">${spot}</b>. ${T.flip ? `${res} = ${sum}` : `${sum} = ${res}`}, over here!` };
    }
    return { speech: `That's ${say(spot)}. ${fullWords(T)}. Over here!`, html: `That's <b class="no-n">${spot}</b>. ${esc(T.sum)} = <b>${T.value}</b>, over here!` };
  },
  beam: true,
  moreTime: () => true, // a sum to work out (D-097)
  fallTime: (T, row) => (row && row.fall_s) || null, // the timed level's own fall (Year 2's fast facts: 6 s)
  testHooks: {
    // make this landing's sum a given one, such as aimSum(7, '×', 8); its line is laid out anew
    aimSum(a, op, b, { set }) {
      const answer = ANSWER[op] ? ANSWER[op](a, b) : NaN;
      if (!Number.isInteger(answer) || answer < 0) return false;
      set(target({ a, op, b, answer }, lastPart));
      return answer;
    },
    // make this landing's sum a given fact: { a, op, b, op2?, c?, result?, missing? ('a', 'b' or 'answer'),
    // flip?, den? (a fraction sum, in parts), round? (an estimate: the answer is the nearest ten or hundred) }
    aimFact(f, { set }) {
      const whole = f.c !== undefined ? ANSWER[f.op2](ANSWER[f.op](f.a, f.b), f.c) : ANSWER[f.op](f.a, f.b);
      const answer = f.round ? Math.round(whole / f.round) * f.round : f.missing ? (f.missing === 'answer' ? whole : f[f.missing]) : whole;
      if (!Number.isInteger(answer) || answer < 0 || (f.missing && whole !== f.result)) return false;
      set(target({ ...f, answer, ...(f.round ? { exact: whole } : {}) }, lastPart));
      return answer;
    },
  },
};

// ---------- Reception's questions (asks.js, faces.js; level plan section 5) ----------
// The answer is a number on the level's own line; the question is a picture or a phrase, said out loud.
// A face asks by itself, so "Land on" is left to the voice (sayAll).

const n$ = (v) => say(v);
const tenthsWord = (den) => (den === 10 ? 'tenths' : fracSay(2, den).replace(/^two /, ''));
// a count's step said as a plural: twos, fives, tens, fours, eights, fifties, hundreds
const stepsWord = (k) => ({ 50: 'fifties', 100: 'hundreds' }[k] || `${n$(k)}s`);
const ASK_SAY = {
  dots: () => 'How many dots? Land on that number!',
  flash: () => 'Quick look! How many dots?',
  compare: (T) => (T.rel === 'same' ? 'Land on the same number as the dots!' : `Land on a number ${T.rel === 'more' ? 'more' : 'fewer'} than the dots!`),
  'more-less': (T) => `Land on ${T.by ? n$(T.by) : 'one'} ${T.dir === 'more' ? 'more' : 'less'} than ${n$(T.n)}!`,
  bond: (T) => `${n$(T.part)} and how many more make ${n$(T.whole)}?`,
  double: (T) => `Land on double ${n$(T.n)}!`,
  share: (T) => `Share ${n$(T.total)} sweets between ${n$(T.groups)} plates. How many on each?`,
  // Year 2's: a number the child is to read (blocks, words) isn't said
  place: (T) => (T.n >= 100 ? 'Count the hundreds, tens and ones. Land on that number!' : 'Count the tens and ones. Land on that number!'),
  words: () => 'Read the number. Land on it!',
  sign: (T) => (T.rel === 'same' ? `Land on a number equal to ${n$(T.n)}!` : `Land on a number ${T.rel === 'more' ? 'bigger' : 'smaller'} than ${n$(T.n)}!`),
  seq: (T) => (T.den ? `Count ${T.dir === 'backward' ? 'back ' : ''}in ${tenthsWord(T.den)}: ${T.terms.map((v) => partsSay(v, T.den)).join(', ')}. What comes next?`
    : `Count ${T.dir === 'backward' ? 'back ' : ''}in ${stepsWord(T.step)}: ${T.terms.map(n$).join(', ')}. What comes next?`),
  parity: (T) => `Land on an ${T.rel} number!`,
  'frac-shape': () => 'What fraction is shaded? Land on it!',
  'frac-of': (T) => `What is ${fracSay(T.num, T.den)} of ${n$(T.total)}?`,
  // Year 1's and Year 3's
  find: (T) => `Land on ${n$(T.n)}!`,
  groups: (T) => `${cap(n$(T.groups))} group${T.groups === 1 ? '' : 's'} of ${n$(T.size)}. How many altogether?`,
  half: (T) => `Land on half of ${n$(T.n)}!`,
  'frac-compare': (T) => `Which is bigger, ${fracSay(1, T.first)} or ${fracSay(1, T.second)}? Land on it!`,
};
// A number's tens and ones (and hundreds), written and said: "3 tens and 4 ones", "3 hundreds, 4 tens and 7 ones".
const PLACE = (n) => {
  const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
  const p = (k, word, f) => `${f(k)} ${word}${k === 1 ? '' : 's'}`;
  const mk = (f) => (h ? `${p(h, 'hundred', f)}, ${p(t, 'ten', f)} and ${p(o, 'one', f)}` : `${p(t, 'ten', f)} and ${p(o, 'one', f)}`);
  return [mk(String), mk(n$)];
};
// After a miss: { speech, html }, the right number (or the nearest that fits) as `goal`; a spot on a line
// counted in parts (tenths) said and written as counted.
function askMiss(T, spot, goal) {
  // a count in parts (tenths) lands on a line counted in them; a fraction's `den` (frac-of, frac-shape) doesn't
  const was = T.ask === 'seq' && T.den ? { speech: `That's ${partsSay(spot, T.den)}.`, html: `That's ${partsHtml(spot, T.den)}.` }
    : { speech: `That's ${n$(spot)}.`, html: `That's <b class="no-n">${spot}</b>.` };
  const say2 = (speech, html) => ({ speech: `${was.speech} ${speech}`, html: `${was.html} ${html}` });
  switch (T.ask) {
    case 'dots': return say2(`There are ${n$(T.n)} dots. ${n$(goal)} is over here!`, `There are <b>${goal}</b> dots!`);
    case 'flash': return say2(`There were ${n$(T.n)} dots. Over here!`, `There were <b>${goal}</b> dots!`);
    case 'compare':
      return T.rel === 'same' ? say2(`${n$(goal)} dots, so ${n$(goal)}!`, `The same as the dots is <b>${goal}</b>!`)
        : say2(`${n$(goal)} is ${T.rel} than ${n$(T.n)}!`, `<b>${goal}</b> is ${T.rel} than ${T.n}!`);
    case 'more-less': return say2(`${T.by ? cap(n$(T.by)) : 'One'} ${T.dir} than ${n$(T.n)} is ${n$(goal)}!`, `${T.by ?? 1} ${T.dir} than ${T.n} is <b>${goal}</b>!`);
    case 'bond': return say2(`${n$(T.part)} and ${n$(goal)} make ${n$(T.whole)}!`, `${T.part} and <b>${goal}</b> make ${T.whole}!`);
    case 'double': return say2(`Double ${n$(T.n)} is ${n$(goal)}!`, `Double ${T.n} is <b>${goal}</b>!`);
    case 'share': return say2(`${n$(goal)} on each plate!`, `<b>${goal}</b> on each plate!`);
    case 'place': { const [w, s] = PLACE(T.n); return say2(`${s} make ${n$(T.n)}!`, `${w} make <b>${T.n}</b>!`); }
    case 'words': return say2(`The words say ${n$(T.n)}. Over here!`, `${numberWords(T.n)} is <b>${T.n}</b>!`);
    case 'sign':
      return T.rel === 'same' ? say2(`${n$(T.n)} equals ${n$(T.n)}!`, `<b>${T.n}</b> = ${T.n}!`)
        : say2(`${n$(goal)} is ${T.rel === 'more' ? 'bigger' : 'smaller'} than ${n$(T.n)}!`, `${T.n} ${T.rel === 'more' ? '&lt;' : '&gt;'} <b>${goal}</b>!`);
    case 'seq':
      if (T.den) {
        const sv = (v) => partsSay(v, T.den), hv = (v) => partsHtml(v, T.den);
        return say2(`${[...T.terms, goal].map(sv).join(', ')}. ${sv(goal)} comes next!`, `${T.terms.map(hv).join(', ')}, <b>${hv(goal)}</b>!`);
      }
      return say2(`${[...T.terms, goal].map(n$).join(', ')}. ${n$(goal)} comes next!`, `${T.terms.join(', ')}, <b>${goal}</b>!`);
    case 'parity': return say2(`${n$(goal)} is ${T.rel}!`, `<b>${goal}</b> is ${T.rel}!`);
    case 'frac-shape': {
      const same = T.den === 4 && T.num === 2; // two quarters is a half (the notes: 2/4 equals 1/2)
      return { speech: `That's ${fracSay(...simple(spot, T.parts))}. ${fracSay(T.num, T.den)} ${same ? 'is the same as one half' : 'is shaded'}. Over here!`,
        html: `That's ${fracHtml(...simple(spot, T.parts))}. ${fracHtml(T.num, T.den)} ${same ? `= ${fracHtml(1, 2)}` : 'is shaded'}, <b>over here!</b>` };
    }
    case 'frac-of': return say2(`${fracSay(T.num, T.den)} of ${n$(T.total)} is ${n$(goal)}!`, `${fracHtml(T.num, T.den)} of ${T.total} is <b>${goal}</b>!`);
    case 'groups': {
      const g = `group${T.groups === 1 ? '' : 's'}`, verb = T.groups === 1 ? 'is' : 'make';
      return say2(`${cap(n$(T.groups))} ${g} of ${n$(T.size)} ${verb} ${n$(goal)}!`, `${T.groups} ${g} of ${T.size} ${verb} <b>${goal}</b>!`);
    }
    case 'half': return say2(`Half of ${n$(T.n)} is ${n$(goal)}!`, `Half of ${T.n} is <b>${goal}</b>!`);
    case 'frac-compare': {
      const big = Math.min(T.first, T.second), small = Math.max(T.first, T.second);
      return { speech: `${cap(fracSay(1, big))} is bigger than ${fracSay(1, small)}. Over here!`,
        html: `<b>${fracHtml(1, big)}</b> is bigger than ${fracHtml(1, small)}, over here!` };
    }
    default: return say2(`${n$(goal)} is over here!`, `<b>${goal}</b> is over here!`);
  }
}
// A spot on a fraction line (in parts) as [numerator, denominator] in its simplest form: 2 of 4 is [1, 2].
const simple = (v, parts) => { const t = fracText(v, parts); const m = /^(\d+)\/(\d+)$/.exec(t); return m ? [Number(m[1]), Number(m[2])] : [Number(t) * parts, parts]; };
const ASK = {
  // the level's own line: its answers are made for it, so a grown-up's line settings don't move it; a
  // level on a stretch (`span`) starts on its first stretch, a shape's on a line of quarters, groups on the
  // first size's line, a pair of fractions on sixths (each landing then lays out its own)
  lineFor: (row, S) => (row.span ? { from: row.min ?? 0, to: (row.min ?? 0) + row.span, step: 1, label_every: S.label_every ?? row.label_every ?? 1 }
    : row.ask === 'frac-shape' ? { from: 0, to: 4, step: 1, label_every: 1 }
      : row.ask === 'groups' ? { from: 0, to: (row.max_groups ?? 5) * row.sizes[0], step: row.sizes[0], label_every: row.sizes[0] }
        : row.ask === 'frac-compare' ? { from: 0, to: 6, step: 1, label_every: 0 }
          : { from: row.from, to: row.to, step: 1, label_every: S.label_every ?? row.label_every ?? 1 }),
  // each landing on its own line (askLine): a stretch with its answer in it, a shape's or a pair's fraction
  // line, a group size's line; a grown-up's written-numbers setting plays on the stretches
  landingLine: (T, row, S, rand) => {
    const own = askLine(row, T, rand);
    return own && askPart(row, T.part).span && S.label_every !== null && S.label_every !== undefined ? { ...own, label_every: S.label_every } : own;
  },
  planRound: (row, total, rand) => planAsks(row, total, rand),
  pickTarget: (kind, line, prev, rand, row) => askTarget(row, kind, prev && prev.ask ? prev : null, rand),
  isRight: askRight,
  goalOf: askGoal,
  // odd or even to 100 takes Number mode's word chip ("Land on [even]"); the rest are faces
  chip: (T) => (T.ask === 'parity' ? { cls: `word ${T.rel}`, html: T.rel } : faceChip(T)),
  words: (T) => (ASK_SAY[T.ask] ? ASK_SAY[T.ask](T) : 'the number').replace(/^Land on /, '').replace(/[!?]$/, ''),
  sayAll: (T) => (ASK_SAY[T.ask] ? ASK_SAY[T.ask](T) : 'Land on the number!'),
  miss: (T, spot, goal) => askMiss(T, spot, goal),
  beam: false,
  moreTime: () => true, // a picture or a phrase to read (D-097)
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
    return { ...(own || k.lineFor(m.row, S)), labels: (own && own.labels) || m.row.labels || 'plain' };
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
  moreTime: (T, row) => { const k = T && KINDS[T.subKind]; return !!(k && k.moreTime && k.moreTime(T, row && row.mix ? row.mix[T.sub].row : row)); },
  fallTime: (T, row) => { const k = T && KINDS[T.subKind]; return (k && k.fallTime && k.fallTime(T, row && row.mix ? row.mix[T.sub].row : row)) || null; },
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
