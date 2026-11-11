// Reception's questions (level plan 0.3, sections 4 and 5): levels whose answer is still a number on
// the line, but asked by a picture or a phrase at the top: how many dots, a quick look, more or fewer
// than some dots, one more or one less, making 5 or 10, doubles and sharing. Version 1.2.
// Changes at v1.2 (step 2c-3c): Year 1's and Year 3's questions: find a number on a stretch (find), a
// level in parts (`parts`: numbers to 100 in halves, D-094), one more or less by 10 or 100 (`by`), a count
// whose stretch counts in a coarser step (`stretch`: counting in 10s on a stretch in 2s, so the answer isn't
// the only ten in view) or in parts of a whole (`den`: counting in tenths), groups of 2, 5 or 10 (groups:
// each size on its own line), sharing between several numbers of plates, halves with the doubles
// (`halves`: the ask 'half'), hundreds, tens and ones (place, 3 digits), fractions of amounts picked by
// denominator (`pick: 'den'`) and which of two unit fractions is bigger (frac-compare: both marked on a
// line of their common parts, only they written). askLine gives the line a landing is shown on, for every
// ask that has its own. Rows that play today play as before.
// Changes at v1.1 (step 2c-3b, D-100): Year 2's questions: tens and ones (place), number words (words),
// "47 < ?", "47 > ?" and "47 = ?" (sign: any number that fits, or the same), counting on or back in steps
// (seq), odd or even to 100 (parity: any number that is), a fraction of a shape (frac-shape: landed on a
// line of quarters or thirds, shapeLine) and of a number (frac-of). A level with `span` shows each
// landing on a stretch of `span` marks with its answer in it (windowFor), inside the level's numbers, as
// the sums' stretch does (D-032). Steps and fractions are picked evenly before a question (groupOf), so
// counting in 2s doesn't swamp 3s and 5s. Version 1.0 (step 2c-3a, D-091, D-092): Reception's seven.
// Also the challenge round's plan (D-091). Pure: no imports, page, clock or randomness of
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
//   share      total_max, groups: a number of sweets shared out equally between `groups` plates (R16);
// and Year 2's (each shown on a stretch of `span` marks inside min to max, but frac-shape):
//   place      digits, min, max: a number shown as tens rods and ones (Y2-01);
//   words      min, max: a number written in words (X-words100);
//   sign       min, max, rels: "47 < ?" (more), "47 > ?" (fewer) or "47 = ?" (same), by the weights in rels;
//              the number 3 or more inside the ends, so the line holds 3 numbers each side (Y2-02);
//   seq        steps, start (a number, or 'any'), min, max, dirs: three numbers of a count by a step, on or
//              back, then the next to find; from `start` the numbers are start + steps (Y2-03, Y2-04);
//   parity     min, max: any even (or any odd) number (Y2-18);
//   frac-shape fractions ('1/4' ...): a shape cut in equal parts, so many shaded, landed on a line of
//              quarters (halves too) or thirds (Y2-19);
//   frac-of    fractions, total_max: a fraction of a number of dots, the answer whole (Y2-20);
// and Year 1's and Year 3's (step 2c-3c):
//   find       min, max: a number to land on, shown as itself, on a stretch (Y1-01, Y1-02, Y3-01);
//   groups     sizes, max_groups: so many groups of 2, 5 or 10, landed on the size's own line (Y1-12);
// with, on the earlier kinds: share `groups` a list (Y1-13); double `halves` (X-doubles20: half of 2n is
// asked as ask 'half'); more-less `by`, the amounts (Y3-04: [10, 100]); seq `stretch` ({ step: the
// stretch's step }, Y1-04, Y3-05) and `den` (a count in parts of a whole, Y3-17); frac-of `pick: 'den'`
// (Y3-16); place with 3 digits (Y3-02); any row's `parts`, each laid over the row, played in order
// (Y1-02); and
//   frac-compare  dens, min_gap ([num, den]): two unit fractions, both marked on a line of their
//              common parts from 0 to 1, the bigger to land on; a pair whose marks are less than
//              min_gap of the line apart is left out (Y3-18).
//
// A target is { rule: 'ask', ask, value, ... } with the one right answer as `value`, or, for more or
// fewer, { rule: 'range', ask: 'compare', rel, n } with no value: every whole number that fits is
// right, as with even or odd (rules.js), and after a miss the nearest one is shown. Year 2's "<" and ">"
// are { rule: 'range', ask: 'sign', rel, n } and odd or even { rule: 'range', ask: 'parity', rel }.

export const ASKS = ['dots', 'flash', 'compare', 'more-less', 'bond', 'double', 'share', 'place', 'words', 'sign', 'seq', 'parity', 'frac-shape', 'frac-of',
  'find', 'groups', 'half', 'frac-compare'];
export const RELS = ['more', 'fewer', 'same'];
export const SHAPE_LOOKS = 2; // a fraction of a shape is drawn as a circle or a bar
const fracOf = (f) => { const [num, den] = String(f).split('/').map(Number); return { num, den }; };
// The line a fraction of a shape is landed on: halves and quarters on quarters, others on their own parts.
const partsFor = (den) => (den === 2 ? 4 : den);
export const FLASH_LOOKS = 3; // ways a quick look lays its dots out: a dice pattern, a row, a scatter

const near = (a, b) => Math.abs(a - b) < 1e-6;
const whole = (v) => near(v, Math.round(v));
const between = (lo, hi) => { const out = []; for (let v = Math.ceil(lo); v <= hi; v++) out.push(v); return out; };
const pickOne = (list, rand) => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

// A level's part k (0 the first), laid over the row: the row itself if it has no parts.
export function askPart(row, k) {
  if (!row.parts || !row.parts.length) return row;
  const { parts, ...base } = row;
  return { ...base, ...parts[Math.min(parts.length - 1, Math.max(0, k || 0))] };
}

// Whether v holds the relation to n: more than, fewer than (less than), or the same as; or, for odd or
// even, whether v is (n not used).
export function relHolds(rel, v, n) {
  if (rel === 'more') return v > n + 1e-9;
  if (rel === 'fewer') return v < n - 1e-9;
  if (rel === 'even' || rel === 'odd') return whole(v) && (Math.abs(Math.round(v)) % 2 === 0) === (rel === 'even');
  return near(v, n);
}

// Every target a level can ask on one landing, by the landing's kind (a relation for compare, a
// direction for one more or less; null otherwise, or for either).
export function choices(row, kind = null) {
  if (row.parts && row.parts.length) return row.parts.flatMap((_, k) => choices(askPart(row, k), kind)); // every part's
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
      for (const by of row.by || [1]) {
        for (const dir of dirs) {
          for (const n of (dir === 'more' ? between(lo, hi - by) : between(lo + by, hi))) {
            const value = dir === 'more' ? n + by : n - by;
            out.push(by === 1 ? { rule: 'ask', ask: 'more-less', dir, n, value } : { rule: 'ask', ask: 'more-less', dir, by, n, value });
          }
        }
      }
      return out;
    }
    case 'bond': {
      const w = row.whole ?? 10;
      return between(1, w - 1).map((part) => ({ rule: 'ask', ask: 'bond', whole: w, part, value: w - part }));
    }
    case 'double': {
      const out = [];
      if (kind !== 'half') for (const n of between(1, row.max ?? 5)) out.push({ rule: 'ask', ask: 'double', n, value: n * 2 });
      if (row.halves && kind !== 'double') for (const n of between(1, row.max ?? 5)) out.push({ rule: 'ask', ask: 'half', n: n * 2, value: n });
      return out;
    }
    case 'share': {
      const out = [];
      for (const g of [].concat(row.groups ?? 2)) for (let total = g; total <= (row.total_max ?? 10); total += g) out.push({ rule: 'ask', ask: 'share', total, groups: g, value: total / g });
      return out;
    }
    case 'find':
      return between(lo, hi).map((n) => ({ rule: 'ask', ask: 'find', n, value: n }));
    case 'groups': {
      const out = [];
      for (const size of row.sizes || [2]) for (let g = 1; g <= (row.max_groups ?? 5); g++) out.push({ rule: 'ask', ask: 'groups', groups: g, size, value: g * size });
      return out;
    }
    case 'frac-compare': {
      const out = [], dens = row.dens || [2, 3, 4], [gn, gd] = row.min_gap || [0, 1];
      for (const first of dens) {
        for (const second of dens) {
          if (first === second) continue;
          const big = Math.min(first, second), small = Math.max(first, second); // 1/big is the bigger fraction
          if (gd * (small - big) < gn * big * small) continue; // 1/big − 1/small is under min_gap: too close to write both
          const parts = (big * small) / gcd(big, small);
          out.push({ rule: 'ask', ask: 'frac-compare', first, second, parts, value: parts / big, other: parts / small });
        }
      }
      return out;
    }
    case 'place':
    case 'words':
      return between(Math.max(1, lo), hi).map((n) => ({ rule: 'ask', ask: row.ask, n, value: n }));
    case 'sign': {
      const out = [];
      for (const rel of (kind ? [kind] : RELS)) {
        for (const n of between(lo + 3, hi - 3)) out.push(rel === 'same' ? { rule: 'ask', ask: 'sign', rel, n, value: n } : { rule: 'range', ask: 'sign', rel, n });
      }
      return out;
    }
    case 'seq': {
      const out = [];
      for (const dir of (kind ? [kind] : row.dirs || ['forward'])) {
        const sgn = dir === 'backward' ? -1 : 1;
        for (const step of row.steps || [1]) {
          const firsts = row.start === 'any' ? between(lo, hi) : between(0, Math.floor((hi - (row.start ?? 0)) / step)).map((k) => (row.start ?? 0) + k * step);
          for (const t0 of firsts) {
            const t = [0, 1, 2, 3].map((k) => t0 + sgn * k * step);
            if (t.every((v) => v >= lo && v <= hi)) out.push(row.den ? { rule: 'ask', ask: 'seq', step, dir, terms: t.slice(0, 3), value: t[3], den: row.den }
              : { rule: 'ask', ask: 'seq', step, dir, terms: t.slice(0, 3), value: t[3] });
          }
        }
      }
      return out;
    }
    case 'parity':
      return (kind ? [kind] : ['even', 'odd']).map((rel) => ({ rule: 'range', ask: 'parity', rel }));
    case 'frac-shape': {
      const out = [];
      for (const f of row.fractions || []) {
        const { num, den } = fracOf(f), parts = partsFor(den);
        for (let look = 0; look < (row.looks ?? SHAPE_LOOKS); look++) out.push({ rule: 'ask', ask: 'frac-shape', num, den, look, parts, value: (num * parts) / den });
      }
      return out;
    }
    case 'frac-of': {
      const out = [];
      for (const f of row.fractions || []) {
        const { num, den } = fracOf(f);
        for (let total = den; total <= (row.total_max ?? 12); total += den) out.push({ rule: 'ask', ask: 'frac-of', num, den, total, value: (total * num) / den });
      }
      return out;
    }
    default:
      return [];
  }
}

// One question, told apart from another (so the same one isn't asked twice running). A count's start
// and step, and a fraction, tell Year 2's apart; a shape's two looks (like a quick look's three) are one
// question. Year 1's and Year 3's: the amount more or less, the plates, the groups and their size; a pair
// of fractions either way round is one question.
export const keyOf = (T) => {
  if (!T) return '';
  const k = [T.ask, T.rel ?? T.dir ?? '', T.n ?? T.part ?? T.total ?? ''];
  if (T.ask === 'seq') k.push(T.step, T.terms[0]);
  if (T.ask === 'frac-shape' || T.ask === 'frac-of') k.push(`${T.num}/${T.den}`);
  if (T.ask === 'more-less' && T.by) k.push(T.by);
  if (T.ask === 'share') k.push(T.groups);
  if (T.ask === 'groups') k.push(T.groups, T.size);
  if (T.ask === 'frac-compare') k.push(`${Math.min(T.first, T.second)}/${Math.max(T.first, T.second)}`);
  return k.join(':');
};

// What's picked evenly before a question: a count's step, a fraction (or its denominator, for a row with
// pick 'den'), the amount more or less, a group's size, the plates; null if nothing is.
const groupOf = (T, row = {}) => (T.ask === 'seq' ? T.step
  : T.ask === 'frac-shape' ? `${T.num}/${T.den}`
    : T.ask === 'frac-of' ? (row.pick === 'den' ? T.den : `${T.num}/${T.den}`)
      : T.ask === 'more-less' ? (T.by ?? null)
        : T.ask === 'groups' ? T.size
          : T.ask === 'share' ? T.groups : null);

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

// Each landing's kind in a round: for a row in parts, the part each landing plays (the round split evenly
// in order, as sums.js's planParts); for compare (and <, > and =), more, fewer and the same by the row's
// weights (2, 2 and 1 unless given), shuffled; for one more or less (and counting on or back, and doubles
// with halves), the two by turns from a random start; for odd or even, half each, shuffled; else null.
export function planAsks(row, total, rand) {
  if (row.parts && row.parts.length) {
    const n = row.parts.length;
    return Array.from({ length: total }, (_, i) => Math.min(n - 1, Math.floor((i * n) / total)));
  }
  if (row.ask === 'double' && row.halves) {
    const first = rand() < 0.5 ? 0 : 1;
    return Array.from({ length: total }, (_, i) => ((i + first) % 2 ? 'half' : 'double'));
  }
  if (row.ask === 'compare' || row.ask === 'sign') {
    const n = shares(row.rels || { more: 2, fewer: 2, same: 1 }, total), plan = [];
    for (const rel of RELS) for (let k = 0; k < (n[rel] || 0); k++) plan.push(rel);
    return shuffle(plan, rand);
  }
  if (row.ask === 'more-less') {
    const first = rand() < 0.5 ? 0 : 1;
    return Array.from({ length: total }, (_, i) => ((i + first) % 2 ? 'less' : 'more'));
  }
  if (row.ask === 'seq' && (row.dirs || []).length === 2) {
    const first = rand() < 0.5 ? 0 : 1;
    return Array.from({ length: total }, (_, i) => row.dirs[(i + first) % 2]);
  }
  if (row.ask === 'parity') {
    const n = shares({ even: 1, odd: 1 }, total), plan = [];
    for (const rel of ['even', 'odd']) for (let k = 0; k < (n[rel] || 0); k++) plan.push(rel);
    return shuffle(plan, rand);
  }
  return Array.from({ length: total }, () => null);
}

// One landing's target: a question of the landing's kind, never the one asked last unless it's the
// only one; a count's step or a fraction picked evenly first, where the level has several. In a row with
// parts, the landing's kind is its part: a question of that part, which the target keeps as `part`.
export function askTarget(row, kind, prev, rand) {
  if (row.parts && row.parts.length) {
    const k = Math.max(0, Math.min(row.parts.length - 1, kind || 0));
    return { ...askTarget(askPart(row, k), null, prev, rand), part: k };
  }
  const all = choices(row, kind);
  let pool = all.length > 1 ? all.filter((T) => keyOf(T) !== keyOf(prev)) : all;
  const groups = [...new Set(pool.map((T) => groupOf(T, row)))];
  if (groups.length > 1) { const g = pickOne(groups, rand); pool = pool.filter((T) => groupOf(T, row) === g); }
  return pickOne(pool, rand);
}

// The stretch of line a landing is shown on, for a level with `span`: `span` marks inside the level's
// numbers (min to max, or 0 to its biggest answer), the answer on a mark and, where there's room, not at an
// end; a "<" or ">" number with 3 marks each side; odd or even anywhere. The marks are in ones, or in the
// step the row's `stretch` gives a count's step (10s on a stretch in 2s), starting on a multiple of it. As
// { from, to, step, label_every } (every mark written, unless the row says otherwise).
export function windowFor(row, T, rand) {
  const span = row.span ?? 10, every = row.label_every ?? 1;
  const st = (row.stretch && T && T.step !== undefined && row.stretch[T.step]) || 1;
  const lo = row.min ?? 0;
  // a double's `max` is the biggest number doubled, not the line's top: its answers say how far it goes
  const top = row.ask !== 'double' && row.max !== undefined ? row.max
    : Math.max(lo + span * st, ...choices(row).filter((x) => x.value !== undefined).map((x) => x.value));
  const up = (v) => Math.ceil(v / st - 1e-9) * st, down = (v) => Math.floor(v / st + 1e-9) * st;
  const first = up(lo), last = Math.max(first, down(top - span * st)); // where a stretch may start
  const room = (a, b) => [Math.max(first, up(a)), Math.min(last, down(b))];
  let [a, b] = [first, last];
  if (T && T.value !== undefined) {
    [a, b] = room(T.value - (span - 1) * st, T.value - st);
    if (a > b) [a, b] = room(T.value - span * st, T.value);
  } else if (T && T.n !== undefined) {
    [a, b] = room(T.n - (span - 3) * st, T.n - 3 * st);
    if (a > b) [a, b] = room(T.n - span * st, T.n);
  }
  if (a > b) [a, b] = [first, first];
  const k = Math.round((b - a) / st);
  const from = a + st * Math.min(k, Math.floor(rand() * (k + 1)));
  return { from, to: from + span * st, step: st, label_every: every * st };
}

// The line a fraction of a shape is landed on: 0 to 1 in its parts (quarters for halves and quarters,
// thirds for a third), every mark written as a fraction (scene.js's label look 'frac<parts>').
export const shapeLine = (T) => ({ from: 0, to: T.parts, step: 1, label_every: 1, labels: `frac${T.parts}` });

// The line two unit fractions are compared on: 0 to 1 in their common parts, only the two fractions (and
// the ends) written, in their simplest form (1/3 and 1/5 on a line of fifteenths: `label_at`, the marks to
// write, the smaller first).
export const compareLine = (T) => ({ from: 0, to: T.parts, step: 1, label_every: 0, labels: `frac${T.parts}`, label_at: [T.other, T.value] });

// The line a landing is shown on, for a question that has its own (or null, to keep the round's line):
// a shape's or a pair's fraction line, a group size's own line (0 to max_groups lots in its steps), or
// the stretch of a level with `span` (in its part, for a row with parts; written in parts, 'parts<den>',
// for a count in parts of a whole).
export function askLine(row, T, rand) {
  if (!T) return null;
  const p = askPart(row, T.part);
  if (T.ask === 'frac-shape') return shapeLine(T);
  if (T.ask === 'frac-compare') return compareLine(T);
  if (T.ask === 'groups') return { from: 0, to: (p.max_groups ?? 5) * T.size, step: T.size, label_every: T.size };
  if (!p.span) return null;
  const w = windowFor(p, T, rand);
  return p.den ? { ...w, labels: `parts${p.den}` } : w;
}

// Whether landing on `spot` is right. `allowed` is how far from the answer still counts (long lines);
// more or fewer need a whole number that fits. Comparing fractions, the leeway never reaches halfway to
// the smaller fraction's mark.
export function isRight(T, spot, allowed = 0) {
  if (T.rule === 'range') return whole(spot) && relHolds(T.rel, Math.round(spot), T.n);
  const room = T.ask === 'frac-compare' ? Math.max(0, Math.min(allowed, (T.value - T.other) / 2 - 1e-6)) : allowed;
  return Math.abs(spot - T.value) <= room + 1e-9;
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
