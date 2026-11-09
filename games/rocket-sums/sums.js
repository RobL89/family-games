// Rocket Sums' sums: which sums a level can ask, and the line laid out for each one.
// Version 1.0, rebuilt in step 2a-2 from the maths spike's sums.js (claude/games-spike-maths,
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
// A target is { rule: 'sum', value: answer, sum: '3 + 4', a, op, b }.

export const OPS = ['+', '−', '×', '÷'];
export const OP_WORDS = { '+': 'plus', '−': 'take away', '×': 'times', '÷': 'divided by' };
export const DIVISORS = [2, 5, 10];
// The `operations` setting's choices (contract settings are single choices, F4).
export const OPS_OPTIONS = ['+', '+ −', '+ − ×', '+ − × ÷'];

const upTo = (n) => Array.from({ length: n + 1 }, (_, i) => i);

// Every sum an operation can ask on a level (only + depends on the level: `plus_max`).
export function facts(op, row) {
  const out = [];
  const add = (a, b, answer) => out.push({ a, op, b, answer });
  if (op === '+') { const max = row.plus_max ?? 20; for (const a of upTo(10)) for (const b of upTo(10)) if (a + b <= max) add(a, b, a + b); }
  if (op === '−') for (const a of upTo(10)) for (const b of upTo(a)) add(a, b, a - b);
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

export const sumText = (s) => `${s.a} ${s.op} ${s.b}`;
const same = (x, y) => !!x && !!y && x.a === y.a && x.op === y.op && x.b === y.b;

// One sum: the operation picked evenly, then a sum of it evenly, never the one asked last.
export function makeSum(ops, row, prev, rand) {
  const op = ops[Math.min(ops.length - 1, Math.floor(rand() * ops.length))];
  const all = facts(op, row);
  const pool = all.length > 1 ? all.filter((f) => !same(f, prev)) : all;
  const f = pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
  return { ...f, text: sumText(f) };
}

// The line for a sum: the level's whole line while every answer the operations can give
// fits it; otherwise a stretch `span` marks long (10 by default) inside 0 to the biggest
// answer, with this answer somewhere in it, not always in the middle (D-032).
export function lineForSum(sum, ops, row, rand) {
  const top = Math.max(...ops.map((op) => topOf(op, row)));
  const every = row.label_every ?? 1;
  if (row.layout === 'line' && top <= row.to) return { from: row.from, to: row.to, step: 1, label_every: every };
  const span = row.span ?? 10;
  if (top <= span) return { from: 0, to: span, step: 1, label_every: every };
  const lo = Math.max(0, sum.answer - span), hi = Math.min(sum.answer, top - span);
  const from = lo + Math.min(hi - lo, Math.floor(rand() * (hi - lo + 1)));
  return { from, to: from + span, step: 1, label_every: every };
}

// The line shown before a round's first sum: the level's whole line, or 0 to `span`.
export function roundLine(row) {
  return row.layout === 'line' ? { from: row.from, to: row.to, step: 1, label_every: row.label_every ?? 1 }
    : { from: 0, to: row.span ?? 10, step: 1, label_every: row.label_every ?? 1 };
}

// A landing is right on the answer (or within `allowed` of it on a long line).
export const isRight = (T, spot, allowed = 0) => Math.abs(spot - T.value) <= allowed + 1e-9;
// After a miss the answer is shown, and the rocket hops to it.
export const goalOf = (T) => T.value;
