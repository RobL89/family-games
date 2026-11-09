// Maths mode's sums: a spike (D-030) on claude/games-spike-maths, to try the line layouts.
// Pure: no page, network, clock or randomness of its own. Callers pass rnd(), a function
// giving 0 <= x < 1, so tests can use a seeded one.
//
// The rules, from Rob's decisions:
//   - each number in a sum is at most 10 (D-021);
//   - nothing below zero (D-024);
//   - divide only by 2, 5 or 10, with the answer up to 10, so up to 100 ÷ 10 (D-023, D-028).
// The child lands on the answer, so − and ÷ fit a line of 0 to 10, + needs 0 to 20 and
// × 0 to 100 (claude/rocket-lander-ideas.md, F5).

export const OPS = ['+', '−', '×', '÷'];
export const OP_WORDS = { '+': 'plus', '−': 'take away', '×': 'times', '÷': 'divided by' };
export const MAX_ANSWER = { '+': 20, '−': 10, '×': 100, '÷': 10 };
export const DIVISORS = [2, 5, 10];

// The operations named in a setting such as "+ − ÷"; plus alone if none are named.
export function parseOps(text) {
  const ops = OPS.filter((o) => String(text ?? '').includes(o));
  return ops.length ? ops : ['+'];
}

const pick = (rnd, list) => list[Math.min(list.length - 1, Math.floor(rnd() * list.length))];
const upTo = (rnd, n) => Math.min(n, Math.floor(rnd() * (n + 1)));

// One sum: { a, op, b, answer, text }. The operation is picked first, evenly, then the numbers.
export function makeSum(ops, rnd) {
  const op = pick(rnd, ops);
  let a, b, answer;
  if (op === '+') { a = upTo(rnd, 10); b = upTo(rnd, 10); answer = a + b; }
  else if (op === '−') { a = upTo(rnd, 10); b = upTo(rnd, a); answer = a - b; }
  else if (op === '×') { a = upTo(rnd, 10); b = upTo(rnd, 10); answer = a * b; }
  else { b = pick(rnd, DIVISORS); answer = upTo(rnd, 10); a = b * answer; }
  return { a, op, b, answer, text: `${a} ${op} ${b}` };
}

export const sameSum = (x, y) => !!x && !!y && x.a === y.a && x.op === y.op && x.b === y.b;

// The right end of the whole line for these operations: the biggest answer they can give.
export const lineTop = (ops) => Math.max(...ops.map((o) => MAX_ANSWER[o]));

// The "window" layout: a stretch `span` wide inside 0 to top, with the answer somewhere in
// it (not always in the middle, so where it sits still has to be worked out).
export function windowFor(answer, top, span, rnd) {
  if (top <= span) return { from: 0, to: top };
  const lo = Math.max(0, answer - span);
  const hi = Math.min(answer, top - span);
  const from = lo + upTo(rnd, hi - lo);
  return { from, to: from + span };
}

// The "pads" layout: n values on 0 to top, the answer among them, all at least `gap` apart
// so they can be told apart on screen. Wrong answers that teach come first: one off, the
// wrong operation, a neighbouring times-table fact; then any that fit. Sorted.
export function padsFor(sum, top, n, gap, rnd) {
  const { a, b, op, answer } = sum;
  const tempting = op === '+' ? [answer + 1, answer - 1, a * b, Math.abs(a - b), answer + 2, answer - 2]
    : op === '−' ? [answer + 1, answer - 1, a + b, answer + 2, answer - 2]
    : op === '×' ? [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, answer + 1, answer - 1]
    : [answer + 1, answer - 1, a - b, answer + 2, answer - 2];
  const pads = [answer];
  const fits = (v) => Number.isInteger(v) && v >= 0 && v <= top && pads.every((p) => Math.abs(p - v) >= gap);
  for (const v of tempting) {
    if (pads.length >= n) break;
    if (fits(v)) pads.push(v);
  }
  for (let tries = 0; pads.length < n && tries < 500; tries++) {
    const v = upTo(rnd, top);
    if (fits(v)) pads.push(v);
  }
  return pads.sort((x, y) => x - y);
}

// The pad nearest to a value on the line (where a landing counts).
export function nearestPad(pads, v) {
  let best = pads[0];
  for (const p of pads) if (Math.abs(p - v) < Math.abs(best - v)) best = p;
  return best;
}
