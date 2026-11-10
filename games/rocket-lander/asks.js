// Reception's questions (level plan 0.3, sections 4 and 5): levels whose answer is still a number on
// the line, but asked by a picture or a phrase at the top: how many dots, a quick look, more or fewer
// than some dots, one more or one less, making 5 or 10, doubles and sharing. Version 1.0 (step 2c-3a,
// D-091, D-092). Also the challenge round's plan (D-091). Pure: no imports, page, clock or randomness of
// its own. Anything random comes in as `rand`, a function giving numbers from 0 up to (not including)
// 1, so a test can hand in a seeded one.
//
// A level row of this kind: { ask, from, to, label_every, ... } with, by ask:
//   dots       min, max: how many dots to count (R03);
//   flash      min, max, show_ms: dots shown for show_ms milliseconds, then hidden (R04);
//   compare    min, max, rels: land on a number with more (or fewer, or the same) than the dots (R05),
//              rels the weights of the three in a round;
//   more-less  min, max: one more or one less than a number, the answer staying in min to max (R06);
//   bond       whole: what part and the answer make, 5 or 10, shown as a frame of that many (R08, R12);
//   double     max: double 1 to max (R11);
//   share      total_max, groups: a number of sweets shared out equally between `groups` plates (R16).
//
// A target is { rule: 'ask', ask, value, ... } with the one right answer as `value`, or, for more or
// fewer, { rule: 'range', ask: 'compare', rel, n } with no value: every whole number that fits is
// right, as with even or odd (rules.js), and after a miss the nearest one is shown.

export const ASKS = ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share'];
export const RELS = ['more', 'fewer', 'same'];
export const FLASH_LOOKS = 3; // ways a quick look lays its dots out: a dice pattern, a row, a scatter

const near = (a, b) => Math.abs(a - b) < 1e-6;
const whole = (v) => near(v, Math.round(v));
const between = (lo, hi) => { const out = []; for (let v = Math.ceil(lo); v <= hi; v++) out.push(v); return out; };
const pickOne = (list, rand) => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];

// Whether v holds the relation to n: more than, fewer than (less than), or the same as.
export function relHolds(rel, v, n) {
  if (rel === 'more') return v > n + 1e-9;
  if (rel === 'fewer') return v < n - 1e-9;
  return near(v, n);
}

// Every target a level can ask on one landing, by the landing's kind (a relation for compare, a
// direction for one more or less; null otherwise, or for either).
export function choices(row, kind = null) {
  const lo = row.min ?? row.from ?? 0, hi = row.max ?? row.to ?? 10;
  switch (row.ask) {
    case 'dots':
      return between(Math.max(1, lo), hi).map((n) => ({ rule: 'ask', ask: 'dots', n, value: n }));
    case 'flash': {
      const out = [];
      for (const n of between(Math.max(1, lo), hi)) for (let look = 0; look < FLASH_LOOKS; look++) out.push({ rule: 'ask', ask: 'flash', n, value: n, look, ms: row.show_ms ?? 1500 });
      return out;
    }
    case 'compare': {
      const rels = kind ? [kind] : RELS;
      const out = [];
      for (const rel of rels) {
        // at least one dot to look at, and at least one number on the line that fits
        const ns = rel === 'more' ? between(Math.max(1, lo), hi - 1) : rel === 'fewer' ? between(Math.max(1, lo + 1), hi) : between(Math.max(1, lo), hi);
        for (const n of ns) out.push(rel === 'same' ? { rule: 'ask', ask: 'compare', rel, n, value: n } : { rule: 'range', ask: 'compare', rel, n });
      }
      return out;
    }
    case 'more-less': {
      const dirs = kind ? [kind] : ['more', 'less'];
      const out = [];
      for (const dir of dirs) for (const n of (dir === 'more' ? between(lo, hi - 1) : between(lo + 1, hi))) out.push({ rule: 'ask', ask: 'more-less', dir, n, value: dir === 'more' ? n + 1 : n - 1 });
      return out;
    }
    case 'bond': {
      const w = row.whole ?? 10;
      return between(1, w - 1).map((part) => ({ rule: 'ask', ask: 'bond', whole: w, part, value: w - part }));
    }
    case 'double':
      return between(1, row.max ?? 5).map((n) => ({ rule: 'ask', ask: 'double', n, value: n * 2 }));
    case 'share': {
      const g = row.groups ?? 2, out = [];
      for (let total = g; total <= (row.total_max ?? 10); total += g) out.push({ rule: 'ask', ask: 'share', total, groups: g, value: total / g });
      return out;
    }
    default:
      return [];
  }
}

// One question, told apart from another (so the same one isn't asked twice running).
export const keyOf = (T) => (T ? [T.ask, T.rel ?? T.dir ?? '', T.n ?? T.part ?? T.total ?? ''].join(':') : '');

// How many of a round's landings each kind gets, by whole-number weights: shares of `total`,
// rounded by largest remainder, ties to the kind listed first.
export function shares(weights, total) {
  const names = Object.keys(weights).filter((k) => weights[k] > 0);
  const sum = names.reduce((a, k) => a + weights[k], 0);
  const out = {};
  if (!names.length) return out;
  const exact = names.map((k, i) => ({ k, i, x: (weights[k] * total) / sum }));
  exact.forEach(({ k, x }) => { out[k] = Math.floor(x + 1e-9); });
  let left = total - names.reduce((a, k) => a + out[k], 0);
  const order = exact.map((e) => ({ ...e, f: e.x - Math.floor(e.x + 1e-9) })).sort((a, b) => (b.f - a.f > 1e-9 ? 1 : a.f - b.f > 1e-9 ? -1 : a.i - b.i));
  for (const e of order) { if (left <= 0) break; out[e.k] += 1; left -= 1; }
  return out;
}

const shuffle = (list, rand) => {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
};

// Each landing's kind in a round: for compare, more, fewer and the same by the row's weights (2, 2
// and 1 unless given), shuffled; for one more or less, the two by turns from a random start; else null.
export function planAsks(row, total, rand) {
  if (row.ask === 'compare') {
    const n = shares(row.rels || { more: 2, fewer: 2, same: 1 }, total), plan = [];
    for (const rel of RELS) for (let k = 0; k < (n[rel] || 0); k++) plan.push(rel);
    return shuffle(plan, rand);
  }
  if (row.ask === 'more-less') {
    const first = rand() < 0.5 ? 0 : 1;
    return Array.from({ length: total }, (_, i) => ((i + first) % 2 ? 'less' : 'more'));
  }
  return Array.from({ length: total }, () => null);
}

// One landing's target: a question of the landing's kind, never the one asked last unless it's the
// only one.
export function askTarget(row, kind, prev, rand) {
  const all = choices(row, kind);
  const pool = all.length > 1 ? all.filter((T) => keyOf(T) !== keyOf(prev)) : all;
  return pickOne(pool, rand);
}

// Whether landing on `spot` is right. `allowed` is how far from the answer still counts (long lines);
// more or fewer need a whole number that fits.
export function isRight(T, spot, allowed = 0) {
  if (T.rule === 'range') return whole(spot) && relHolds(T.rel, Math.round(spot), T.n);
  return Math.abs(spot - T.value) <= allowed + 1e-9;
}

// The number to show (and hop to) after a miss: the answer or, for more or fewer, the nearest whole
// number that fits to where the rocket came down (`raw`, in the line's numbers), the lower on a tie.
export function goalOf(T, raw, line) {
  if (T.rule !== 'range') return T.value;
  let best = null;
  for (let i = 0; i < line.count; i++) {
    const v = line.value(i);
    if (!whole(v) || !relHolds(T.rel, v, T.n)) continue;
    if (best === null || Math.abs(v - raw) < Math.abs(best - raw) - 1e-9) best = v;
  }
  return best;
}

// A challenge round's plan (D-091): which of a system's `count` levels each landing asks from. Every
// level once, in a shuffled order, then again for any landings left (8 landings, 7 levels: each once
// and one more at random), the whole shuffled so the extra can come anywhere.
export function planChallenge(count, total, rand) {
  const out = [];
  while (out.length < total) out.push(...shuffle(Array.from({ length: count }, (_, i) => i), rand));
  return shuffle(out.slice(0, total), rand);
}
