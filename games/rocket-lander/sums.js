// Rocket Sums' sums: which sums a level can ask, and the line laid out for each one.
// Version 1.4. Changes at v1.4 (step 2c-3c): Year 1's and Year 3's forms. Fast facts within 20 may cap the
// second number (`b_max`) and cross 10 or not (`cross`: Y1-08, Y1-09 and their crossing halves); missing
// numbers may hide the answer too and be written both ways round (`blanks`, `flip`: '7 = ? − 9', Y1-11);
// HTO + and − ones, tens and hundreds, crossing a ten or hundred or not (`cross`, D-094's halves); estimates
// to the nearest 10 or 100 (`estimate`, `rounds`: the answer is the ten or hundred, landed on a line in
// tens or hundreds); TO × O (`TO*O`), TO ÷ O (`TO/O`, the divisor picked first) and fractions with the same
// denominator, added and taken away within one whole (`frac`, landed on 0 to 1 in its parts). A sum of
// several tables is asked once (3 × 8 isn't counted twice). Rows that play today play as before.
// Changes at v1.3 (step 2c-3b, D-100): Year 2's sums come in forms (`forms`, formFacts), each
// with its own numbers in place of D-021's 0 to 10: fast facts within 20, TO + O, TO + T, TO − O, TO − T,
// three small numbers, TO + TO (with or without a new ten from the ones: `carry`) and TO − TO (with or
// without exchanging: `exchange`), missing numbers (one of a form's two numbers hidden), bonds (30 + ? =
// 100), times tables (`tables`, 1 to `times_max` both ways round) and dividing by them. A level's forms
// are picked evenly before a sum (`group`), so one with thousands of sums doesn't swamp the rest. A
// 'line' level may count in steps (`step`: a table's own line, 0, 10, 20 ... 120).
// Changes at v1.2 (step 2c-3a): − may have a smallest number taken from (`minus_from`),
// for Reception's "taking away within 5", which starts from 1 to 5 (syllabus notes, R10).
// Changes at v1.1: a level may play in parts, such as two halves (D-040);
// − may have a biggest number (`minus_max`); makeSum can leave out sums answering 0, so a
// round asks at most one (proposed, Q-022). Version 1.0 was rebuilt in step 2a-2 from the maths spike's sums.js (claude/games-spike-maths,
// reference only, D-030). Pure: no page, clock or randomness of its own. Anything random
// comes in as `rand`, a function giving numbers from 0 up to (not including) 1, so a test
// can hand in a seeded one.
//
// The rules, from Rob's decisions:
//   - each number in a sum is 0 to 10 (D-021), except the number divided;
//   - nothing below zero (D-024);
//   - divide only by 2, 5 or 10, with the answer up to 10, so up to 100 ÷ 10 (D-023, D-028);
//   - no times sums with a 0 in them, such as 0 × 9 (D-033); 4 + 0 and 0 ÷ 2 stay.
// The child lands on the answer, so − and ÷ fit 0 to 10, + up to 0 to 20 and × 0 to 100.
//
// A target is { rule: 'sum', value: answer, sum: '3 + 4', a, op, b }, with op2 and c for three numbers
// ('4 + 7 + 6'), and result and missing ('a', 'b' or 'answer') for a missing number ('? + 25 = 60': the
// answer is the number hidden), flip for one written answer first ('7 = ? − 9'), den for a fraction sum
// (a, b and the answer in parts of den: '5/7 + 1/7' answers 6), and round and exact for an estimate ('298 +
// 403' answers 700, round 100, exact 701).

export const OPS = ['+', '−', '×', '÷'];
export const FORMS = ['facts', 'TO+O', 'TO+T', 'TO-O', 'TO-T', 'O+O+O', 'TO+TO', 'TO-TO', 'missing', 'bond', 'table', 'divide',
  'HTO+O', 'HTO+T', 'HTO+H', 'HTO-O', 'HTO-T', 'HTO-H', 'estimate', 'TO*O', 'TO/O', 'frac'];
export const OP_WORDS = { '+': 'plus', '−': 'take away', '×': 'times', '÷': 'divided by' };
export const DIVISORS = [2, 5, 10];
// The `operations` setting's choices (contract settings are single choices, F4).
export const OPS_OPTIONS = ['+', '+ −', '+ − ×', '+ − × ÷'];

const upTo = (n) => Array.from({ length: n + 1 }, (_, i) => i);

const runOf = (lo, hi, step = 1) => { const out = []; for (let v = lo; v <= hi; v += step) out.push(v); return out; };
const TWO = runOf(10, 99), TENS = runOf(10, 90, 10), ONES = runOf(1, 9);
const HTO = runOf(100, 999), HUNDREDS = runOf(100, 900, 100);
const plus = (a, b, form) => ({ a, op: '+', b, answer: a + b, form });
const minus = (a, b, form) => ({ a, op: '−', b, answer: a - b, form });
// a row's `cross` (crossing a ten or hundred, or not) keeps a sum if it isn't given or the sum agrees
const keep = (want, is) => want === undefined || want === is;
// The nearest multiple of r to v (none of the numbers estimated is halfway); estimates' tops by r.
const nearest = (v, r) => Math.round(v / r) * r;
export const EST_TOP = { 10: 200, 100: 1000 };

// Every sum of a form (Year 2's), as { a, op, b, answer, form }, with op2 and c for three numbers, and
// result, missing and the form it was made from (group) for a missing number. `max` caps an answer (100).
export function formFacts(form, row) {
  const max = row.max ?? 100, out = [];
  switch (form) {
    case 'facts': {
      // + and − within `max`; the second number up to `b_max` (Year 1: 0 to 9); crossing 10 or not (`cross`)
      const bmax = row.b_max ?? max;
      for (const a of upTo(max)) for (const b of upTo(Math.min(max - a, bmax))) if (keep(row.cross, a < 10 && a + b > 10)) out.push(plus(a, b, form));
      for (const a of upTo(max)) for (const b of upTo(Math.min(a, bmax))) if (keep(row.cross, a > 10 && a - b < 10)) out.push(minus(a, b, form));
      break;
    }
    case 'TO+O': for (const a of TWO) for (const b of ONES) if (a + b <= max) out.push(plus(a, b, form)); break;
    case 'TO+T': for (const a of TWO) for (const b of TENS) if (a + b <= max) out.push(plus(a, b, form)); break;
    case 'TO-O': for (const a of TWO) for (const b of ONES) out.push(minus(a, b, form)); break;
    case 'TO-T': for (const a of TWO) for (const b of TENS) if (b <= a) out.push(minus(a, b, form)); break;
    case 'O+O+O': for (const a of ONES) for (const b of ONES) for (const c of ONES) out.push({ a, op: '+', b, op2: '+', c, answer: a + b + c, form }); break;
    case 'TO+TO':
      for (const a of TWO) for (const b of TWO) {
        const carry = (a % 10) + (b % 10) >= 10; // the ones make a new ten
        if (a + b <= max && (row.carry === undefined || row.carry === carry)) out.push(plus(a, b, form));
      }
      break;
    case 'TO-TO':
      for (const a of TWO) for (const b of TWO) {
        const exchange = a % 10 < b % 10; // a ten has to be broken into ones
        if (b <= a && (row.exchange === undefined || row.exchange === exchange)) out.push(minus(a, b, form));
      }
      break;
    case 'missing':
      for (const base of row.of || []) {
        for (const f of formFacts(base, { ...row, carry: undefined, exchange: undefined, cross: undefined })) {
          if (f.c !== undefined || f.answer > max) continue;
          for (const hide of row.blanks || ['a', 'b']) {
            for (const flip of row.flip ? [false, true] : [false]) {
              const m = { a: f.a, op: f.op, b: f.b, result: f.answer, missing: hide, answer: hide === 'answer' ? f.answer : f[hide], form, group: base };
              out.push(flip ? { ...m, flip } : m);
            }
          }
        }
      }
      break;
    case 'bond': {
      const whole = row.whole ?? 10, every = row.every ?? 1;
      for (let a = every; a <= whole - every; a += every) out.push({ a, op: '+', b: whole - a, result: whole, missing: 'b', answer: whole - a, form });
      break;
    }
    case 'table': {
      const seen = new Set(); // a sum of two of the tables (3 × 8) is asked once
      const add = (a, b) => { const k = `${a}×${b}`; if (!seen.has(k)) { seen.add(k); out.push({ a, op: '×', b, answer: a * b, form }); } };
      for (const t of row.tables || []) {
        for (let n = 1; n <= (row.times_max ?? 12); n++) {
          add(t, n);
          if (n !== t) add(n, t);
        }
      }
      break;
    }
    case 'divide':
      for (const t of row.tables || []) for (let q = 1; q <= (row.times_max ?? 12); q++) out.push({ a: t * q, op: '÷', b: t, answer: q, form });
      break;
    // Year 3's mental sums with a 3-digit number: crossing a ten (ones) or a hundred (tens) or not; a
    // hundred added or taken never crosses (answers to 1000)
    case 'HTO+O': for (const a of HTO) for (const b of ONES) if (a + b <= max && keep(row.cross, (a % 10) + b >= 10)) out.push(plus(a, b, form)); break;
    case 'HTO+T': for (const a of HTO) for (const b of TENS) if (a + b <= max && keep(row.cross, (a % 100) + b >= 100)) out.push(plus(a, b, form)); break;
    case 'HTO+H': for (const a of HTO) for (const b of HUNDREDS) if (a + b <= max && keep(row.cross, false)) out.push(plus(a, b, form)); break;
    case 'HTO-O': for (const a of HTO) for (const b of ONES) if (keep(row.cross, a % 10 < b)) out.push(minus(a, b, form)); break;
    case 'HTO-T': for (const a of HTO) for (const b of TENS) if (keep(row.cross, a % 100 < b)) out.push(minus(a, b, form)); break;
    case 'HTO-H': for (const a of HTO) for (const b of HUNDREDS) if (b <= a && keep(row.cross, false)) out.push(minus(a, b, form)); break;
    case 'estimate':
      // To the nearest 10: two 2-digit numbers, none ending in 5. To the nearest 100: two 3-digit numbers
      // each within `near` (10) of a hundred. Only sums where rounding first and rounding the answer give the
      // same ten or hundred (so either way of thinking lands right), the answer not halfway, never 0, and
      // not both numbers round already.
      for (const r of row.rounds || [10, 100]) {
        const nums = r === 10 ? TWO.filter((v) => v % 10 !== 5) : HTO.filter((v) => Math.abs(v - nearest(v, 100)) <= (row.near ?? 10));
        for (const a of nums) {
          for (const b of nums) {
            if (a % r === 0 && b % r === 0) continue;
            for (const op of ['+', '−']) {
              if (op === '−' && b > a) continue;
              const exact = op === '+' ? a + b : a - b;
              if (exact > EST_TOP[r] || exact % r === r / 2) continue;
              const est = nearest(exact, r);
              if (est === 0 || est !== (op === '+' ? nearest(a, r) + nearest(b, r) : nearest(a, r) - nearest(b, r))) continue;
              out.push({ a, op, b, answer: est, exact, round: r, form, group: `r${r}` });
            }
          }
        }
      }
      break;
    case 'TO*O': {
      const [a0, a1] = row.a || [11, 30], [b0, b1] = row.b || [2, 5];
      for (const a of runOf(a0, a1)) for (const b of runOf(b0, b1)) out.push({ a, op: '×', b, answer: a * b, form });
      break;
    }
    case 'TO/O':
      for (const d of row.divisors || [2, 3, 4, 5, 8]) for (const a of TWO) if (a % d === 0) out.push({ a, op: '÷', b: d, answer: a / d, form, group: d });
      break;
    case 'frac':
      // a/d + b/d and a/d − b/d, a and b proper fractions, the answer within one whole (in parts of d)
      for (const d of row.dens || [2, 3, 4]) {
        for (let a = 1; a < d; a++) {
          for (let b = 1; b < d; b++) {
            if (a + b <= d) out.push({ a, op: '+', b, den: d, answer: a + b, form, group: d });
            if (b <= a) out.push({ a, op: '−', b, den: d, answer: a - b, form, group: d });
          }
        }
      }
      break;
    default:
      break;
  }
  return out;
}

// Every sum an operation can ask on a level: its forms' (Year 2's), or else + by `plus_max`, − by
// `minus_max`, the biggest number taken from, and `minus_from`, the smallest, 0 if not given.
export function facts(op, row) {
  if (row.forms) return row.forms.flatMap((form) => formFacts(form, row)).filter((f) => f.op === op);
  const out = [];
  const add = (a, b, answer) => out.push({ a, op, b, answer });
  if (op === '+') { const max = row.plus_max ?? 20; for (const a of upTo(10)) for (const b of upTo(10)) if (a + b <= max) add(a, b, a + b); }
  if (op === '−') for (const a of upTo(row.minus_max ?? 10)) if (a >= (row.minus_from ?? 0)) for (const b of upTo(a)) add(a, b, a - b);
  if (op === '×') for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) add(a, b, a * b);
  if (op === '÷') for (const b of DIVISORS) for (const c of upTo(10)) add(b * c, b, c);
  return out;
}

// The biggest answer an operation can give on a level.
export const topOf = (op, row) => Math.max(...facts(op, row).map((f) => f.answer));

// The operations named in a setting's text, such as "+ − ×", in the usual order.
export function parseOps(text) {
  return OPS.filter((o) => String(text ?? '').includes(o));
}

// The operations to ask: the grown-up's setting if it names any, otherwise the level's.
export function opsFor(row, S) {
  const set = parseOps(S && S.operations);
  return set.length ? set : row.ops.slice();
}

// A sum as written: '3 + 4', '4 + 7 + 6', '? + 25 = 60', '7 + 5 = ?', answer first ('7 = ? − 9'), or in
// fractions ('5/7 + 1/7').
export const sumText = (s) => {
  const v = (k) => (s.missing === k ? '?' : s.den ? `${s[k]}/${s.den}` : `${s[k]}`);
  if (s.missing) {
    const r = s.missing === 'answer' ? '?' : `${s.result}`, sum = `${v('a')} ${s.op} ${v('b')}`;
    return s.flip ? `${r} = ${sum}` : `${sum} = ${r}`;
  }
  if (s.c !== undefined) return `${s.a} ${s.op} ${s.b} ${s.op2} ${s.c}`;
  return `${v('a')} ${s.op} ${v('b')}`;
};
// the same sum as the last one asked (a sum made here, or a target, which carries its text as `sum`)
const same = (x, y) => !!x && !!y && sumText(x) === (y.sum ?? sumText(y));

// One sum: the operation picked evenly, then (where a level has several forms) a form, then a sum of it
// evenly, never the one asked last. With zeroOk false, sums answering 0 are left out (unless nothing
// else is left).
export function makeSum(ops, row, prev, rand, { zeroOk = true } = {}) {
  const op = ops[Math.min(ops.length - 1, Math.floor(rand() * ops.length))];
  let all = facts(op, row);
  if (!zeroOk && all.some((f) => f.answer !== 0)) all = all.filter((f) => f.answer !== 0);
  let pool = all.length > 1 ? all.filter((f) => !same(f, prev)) : all;
  const groups = [...new Set(pool.map((f) => f.group ?? f.form ?? ''))];
  if (groups.length > 1) {
    const g = groups[Math.min(groups.length - 1, Math.floor(rand() * groups.length))];
    pool = pool.filter((f) => (f.group ?? f.form ?? '') === g);
  }
  const f = pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
  return { ...f, text: sumText(f) };
}

// The line for a sum: the level's whole line while every answer the operations can give
// fits it; otherwise a stretch `span` marks long (10 by default) inside 0 to the biggest
// answer, with this answer somewhere in it, not always in the middle (D-032). A fraction sum lands on 0 to
// 1 in its parts, written as counted ('parts<den>'); an estimate on its own line (estimateLine).
export function lineForSum(sum, ops, row, rand) {
  if (sum.den) return { from: 0, to: sum.den, step: 1, label_every: 1, labels: `parts${sum.den}` };
  if (sum.round) return estimateLine(sum, row, rand);
  const top = Math.max(...ops.map((op) => topOf(op, row)));
  const every = row.label_every ?? 1;
  if (row.layout === 'line' && top <= row.to && sum.answer >= row.from && sum.answer <= row.to) return { from: row.from, to: row.to, step: row.step ?? 1, label_every: every };
  const span = row.span ?? 10;
  if (top <= span) return { from: 0, to: span, step: 1, label_every: every };
  const lo = Math.max(0, sum.answer - span), hi = Math.min(sum.answer, top - span);
  const from = lo + Math.min(hi - lo, Math.floor(rand() * (hi - lo + 1)));
  return { from, to: from + span, step: 1, label_every: every };
}

// An estimate's line: to the nearest 100, 0 to 1000 in hundreds; to the nearest 10, a stretch of `span`
// marks in tens inside 0 to 200, with the ten in it, as D-032's stretch places an answer.
export function estimateLine(sum, row, rand) {
  const r = sum.round;
  if (r === 100) return { from: 0, to: EST_TOP[100], step: 100, label_every: 100 };
  const span = row.span ?? 10, k = sum.answer / r, topK = EST_TOP[r] / r;
  const lo = Math.max(0, k - span), hi = Math.min(k, topK - span);
  const from = r * (lo + Math.min(hi - lo, Math.floor(rand() * (hi - lo + 1))));
  return { from, to: from + span * r, step: r, label_every: r };
}

// A level's parts, each a whole level row of its own: its `parts` laid over the row (D-040),
// or the row itself as the one part.
export function partsOf(row) {
  if (!row.parts || !row.parts.length) return [row];
  const { parts, ...base } = row;
  return parts.map((p) => ({ ...base, ...p }));
}

// Which part each of a round's landings plays: the round split evenly in order, the
// earlier parts taking the extra landing when it doesn't split evenly.
export function planParts(row, total) {
  const n = partsOf(row).length;
  return Array.from({ length: total }, (_, i) => Math.min(n - 1, Math.floor((i * n) / total)));
}

// The line shown before a round's first sum: the level's whole line, or 0 to `span`.
export function roundLine(row) {
  return row.layout === 'line' ? { from: row.from, to: row.to, step: row.step ?? 1, label_every: row.label_every ?? 1 }
    : { from: 0, to: row.span ?? 10, step: 1, label_every: row.label_every ?? 1 };
}

// A landing is right on the answer (or within `allowed` of it on a long line).
export const isRight = (T, spot, allowed = 0) => Math.abs(spot - T.value) <= allowed + 1e-9;
// After a miss the answer is shown, and the rocket hops to it.
export const goalOf = (T) => T.value;
