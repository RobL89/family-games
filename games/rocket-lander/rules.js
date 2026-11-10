// Number mode's rules: what a round asks for, whether a landing is right, and which
// number to show after a miss (D-035, D-038). Version 1.1. Changes at v1.1 (step 2c-3a): a level
// may keep its "any number" targets to part of its line (`pick`, such as 11 to 20 on a line of 10
// to 20: Reception's bigger numbers, R07). Which level to play is in
// games/_common/rocket/ladder.js, shared with Rocket Sums (step 2a-2). Pure: no page, clock or
// randomness of its own. Anything random comes in as `rand`, a function giving numbers
// from 0 up to (not including) 1, so a test can hand in a seeded one.
//
// A target is one of:
//   { rule: 'any', value }      land on that number (written, or a bare mark);
//   { rule: 'dice', value }     land on the number a dice face shows, 1 to 6;
//   { rule: 'parity', parity }  land on any even (or any odd) whole number.

export const RULES = ['any', 'parity', 'dice']; // also the order ties are broken in

const near = (a, b) => Math.abs(a - b) < 1e-6;
const whole = (v) => near(v, Math.round(v));
export const parityOf = (v) => (Math.abs(Math.round(v)) % 2 === 0 ? 'even' : 'odd');

// The line to play: the level's, with any line setting a grown-up gave in its place.
export function lineFor(row, S) {
  const pick = (k) => (S[k] === null || S[k] === undefined ? row[k] : S[k]);
  return { from: pick('from'), to: pick('to'), step: S.step === null || S.step === undefined ? 1 : S.step, label_every: pick('label_every') };
}

// How many of a round's landings each rule gets: shares of `total` by the weights in `mix`,
// rounded by largest remainder, ties going to the rule listed first in RULES.
export function roundCounts(mix, total) {
  const names = RULES.filter((r) => mix[r] > 0);
  const sum = names.reduce((a, r) => a + mix[r], 0);
  if (!names.length || !(sum > 0)) return { any: total };
  const exact = names.map((r) => ({ r, x: (mix[r] * total) / sum }));
  const out = {};
  exact.forEach(({ r, x }) => { out[r] = Math.floor(x + 1e-9); });
  let left = total - names.reduce((a, r) => a + out[r], 0);
  const byRemainder = exact.map((e, i) => ({ ...e, i, f: e.x - Math.floor(e.x + 1e-9) }))
    .sort((a, b) => (b.f - a.f > 1e-9 ? 1 : a.f - b.f > 1e-9 ? -1 : a.i - b.i));
  for (const e of byRemainder) { if (left <= 0) break; out[e.r] += 1; left -= 1; }
  return out;
}

// The round's landings in order: roundCounts' shares, shuffled with `rand`.
export function planRound(mix, total, rand) {
  const counts = roundCounts(mix, total);
  const plan = [];
  for (const r of RULES) for (let k = 0; k < (counts[r] || 0); k++) plan.push(r);
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

const spots = (line) => Array.from({ length: line.count }, (_, i) => line.value(i));
const pickFrom = (list, prevValue, rand) => {
  const pool = list.length > 1 ? list.filter((v) => !near(v, prevValue)) : list;
  return pool[Math.floor(rand() * pool.length)];
};

// One landing's target. `prev` is the last target, so the same number isn't asked twice
// running. A rule the line can't ask for (no 1 to 6 for a dice face; not both an even and
// an odd whole number) asks for any number instead. `pick` ([lo, hi]), if given, keeps any-number
// targets inside lo to hi (unless none of the line is).
export function pickTarget(rule, line, prev, rand, pick = null) {
  const prevValue = prev && prev.value !== undefined ? prev.value : NaN;
  if (rule === 'dice') {
    const faces = spots(line).filter((v) => whole(v) && v >= 1 && v <= 6);
    if (faces.length) return { rule: 'dice', value: pickFrom(faces, prevValue, rand) };
  }
  if (rule === 'parity') {
    const kinds = new Set(spots(line).filter(whole).map(parityOf));
    if (kinds.size === 2) return { rule: 'parity', parity: rand() < 0.5 ? 'even' : 'odd' };
  }
  const all = spots(line), kept = pick ? all.filter((v) => v >= pick[0] - 1e-9 && v <= pick[1] + 1e-9) : all;
  return { rule: 'any', value: pickFrom(kept.length ? kept : all, prevValue, rand) };
}

// Whether landing on `spot` is right. `allowed` is how far from a number still counts (long
// lines); it never stretches "any even" or "any odd", which need the whole number itself.
export function isRight(T, spot, allowed = 0) {
  if (T.rule === 'parity') return whole(spot) && parityOf(spot) === T.parity;
  return Math.abs(spot - T.value) <= allowed + 1e-9;
}

// The number to show (and hop to) after a miss: the target itself or, for even or odd, the
// nearest whole number of that kind to where the rocket came down (`raw`, in the line's
// numbers), the lower one on a tie.
export function goalOf(T, raw, line) {
  if (T.rule !== 'parity') return T.value;
  let best = null;
  for (const v of spots(line)) {
    if (!whole(v) || parityOf(v) !== T.parity) continue;
    if (best === null || Math.abs(v - raw) < Math.abs(best - raw) - 1e-9) best = v;
  }
  return best;
}
