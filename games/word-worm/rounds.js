// Word Worm: turning settings into a round (words, letters or counts) and choosing decoys.
// Pure functions with no drawing, so they are easy to reason about and test.

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Letters that are easy to mix up, used as some of the decoys in spell mode.
const LOOKALIKE = {
  a: 'oed', b: 'dpq', c: 'eo', d: 'bpq', e: 'ac', f: 'tl', g: 'qy', h: 'nb', i: 'lj', j: 'ig',
  k: 'xh', l: 'it', m: 'nw', n: 'mhu', o: 'ca', p: 'bqd', q: 'pdg', r: 'nv', s: 'zc', t: 'fl',
  u: 'nv', v: 'uwy', w: 'mv', x: 'kz', y: 'vg', z: 'sx',
};

export const randInt = (n, rnd = Math.random) => Math.floor(rnd() * n);

export function shuffle(list, rnd = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1, rnd);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// n picks from pool: no repeats while the pool lasts, and never the same one twice in a row if avoidable.
export function pickSome(pool, n, rnd = Math.random) {
  const out = [];
  if (!pool.length) return out;
  while (out.length < n) {
    const batch = shuffle(pool, rnd);
    if (out.length && batch.length > 1 && batch[0] === out[out.length - 1]) [batch[0], batch[1]] = [batch[1], batch[0]];
    out.push(...batch.slice(0, n - out.length));
  }
  return out;
}

// Keeps only letters ("Ship!" -> "ship"), in the chosen case.
export function cleanLetters(text, upper) {
  const only = String(text == null ? '' : text).normalize('NFC').replace(/[^\p{L}]/gu, '');
  return upper ? only.toUpperCase() : only.toLowerCase();
}

const whole = (v, lo, hi, d) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};

const STEP_WORDS = { 2: 'twos', 3: 'threes', 4: 'fours', 5: 'fives', 6: 'sixes', 7: 'sevens', 8: 'eights', 9: 'nines', 10: 'tens', 100: 'hundreds' };

/**
 * Builds one round from the resolved settings.
 * Returns { mode, items, letterPool } where each item is
 *   { kind: 'word'|'letter'|'count', units: [...strings to eat in order], chip, sayStart, sayEnd, step? }
 */
export function buildRound(s, fallbackWords = ['cat', 'dog', 'sun'], rnd = Math.random) {
  const n = whole(s.words_per_round, 1, 20, 5);
  const upper = s.letter_case === 'upper';

  if (s.mode === 'letters') {
    let pool = [...new Set((Array.isArray(s.letters) ? s.letters : []).map((t) => cleanLetters(t, upper)).filter((t) => t.length >= 1 && t.length <= 3))];
    if (!pool.length) pool = ['a', 'b', 'c', 'd', 'e', 's', 't'].map((t) => cleanLetters(t, upper));
    const items = pickSome(pool, n, rnd).map((L) => ({
      kind: 'letter',
      units: [L],
      chip: L,
      sayStart: L.length === 1 ? `Find the letter ${L.toUpperCase()}` : `Find ${L.toLowerCase()}`,
      sayEnd: L.length === 1 ? `${L.toUpperCase()}!` : L.toLowerCase(),
    }));
    return { mode: 'letters', items, letterPool: pool };
  }

  if (s.mode === 'count') {
    const from = whole(s.count_from, -100, 1000, 0);
    const step = whole(s.count_step, 1, 100, 2);
    const len = whole(s.count_length, 3, 12, 6);
    // The first count starts at count_from; later ones start 0 to 10 steps on, so they practise
    // starting from different places (drawn from a shuffled bag, so starts don't repeat until all 11 are used).
    const later = pickSome([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], Math.max(0, n - 1), rnd);
    const items = [];
    for (let i = 0; i < n; i++) {
      const start = i === 0 ? from : from + later[i - 1] * step;
      const nums = Array.from({ length: len }, (_, k) => start + k * step);
      const units = nums.map(String);
      const stepWord = step === 1 ? null : STEP_WORDS[step] || `steps of ${step}`;
      items.push({
        kind: 'count',
        units,
        step,
        chip: `${units.slice(0, 3).join(', ')}…`,
        sayStart: stepWord ? `Count in ${stepWord}, from ${start}` : `Count on from ${start}`,
        sayEnd: units.join(', '),
      });
    }
    return { mode: 'count', items, from, step };
  }

  // spell
  const source = s.word_list && Array.isArray(s.word_list.items) ? s.word_list.items : [];
  let words = [...new Set(source.map((w) => cleanLetters(w, upper)).filter(Boolean))];
  if (!words.length) words = [...new Set(fallbackWords.map((w) => cleanLetters(w, upper)).filter(Boolean))];
  const items = pickSome(words, n, rnd).map((w) => ({
    kind: 'word',
    units: [...w],
    chip: w,
    // Said in lower case so a voice reads "SHIP" as a word, not as letters.
    sayStart: w.toLowerCase(),
    sayEnd: w.toLowerCase(),
  }));
  return { mode: 'spell', items, listTitle: s.word_list && s.word_list.title ? s.word_list.title : '' };
}

/**
 * Picks `count` decoys for the unit at item.units[pos], avoiding `taken` (texts already in the garden).
 * Decoys are never the letter or number needed now.
 */
export function pickDecoys(round, item, pos, count, taken = [], upper = false, rnd = Math.random) {
  if (count <= 0) return [];
  const need = item.units[pos];
  const same = (a, b) => a.toLowerCase() === b.toLowerCase();
  const avoid = (t) => same(t, need) || taken.some((x) => same(x, t));
  const out = [];
  const add = (t) => { if (out.length < count && t && !avoid(t) && !out.some((x) => same(x, t))) out.push(t); };
  const cased = (t) => (upper ? t.toUpperCase() : t.toLowerCase());

  if (item.kind === 'count') {
    const seq = new Set(item.units.map(Number));
    const n = Number(need);
    const allowNegative = Math.min(...item.units.map(Number)) < 0;
    const near = [];
    for (let d = 1; d <= countReach(item) && near.length < count * 3 + 4; d++) {
      for (const v of [n + d, n - d]) {
        if (seq.has(v) || (!allowNegative && v < 0) || avoid(String(v))) continue;
        near.push(v);
      }
    }
    // Nearest first, with a little shuffle among the close ones.
    shuffle(near.slice(0, count * 2), rnd).forEach((v) => add(String(v)));
    near.forEach((v) => add(String(v)));
    return out;
  }

  if (item.kind === 'letter') {
    shuffle(round.letterPool || [], rnd).forEach(add);
    // The set from the Sheet is too small: top up from the alphabet.
    shuffle(ALPHABET, rnd).forEach((t) => add(cased(t)));
    return out;
  }

  // spell: one lookalike, one other letter from the word, then any letters.
  const look = shuffle([...(LOOKALIKE[need.toLowerCase()] || '')], rnd).map(cased);
  const fromWord = shuffle(item.units.filter((t) => !same(t, need)), rnd);
  if (look.length) add(look[0]);
  if (fromWord.length) add(fromWord[0]);
  look.slice(1).forEach((t) => { if (rnd() < 0.5) add(t); });
  shuffle(ALPHABET, rnd).forEach((t) => add(cased(t)));
  return out;
}

// How far from the number needed a count decoy may be (wide enough to find decoys outside a long run of ones).
export const countReach = (item) => item.step * 3 + 12 + item.units.length;

// Stars: 0 or 1 mistakes = 3, 2 to 4 = 2, 5 or more = 1.
export function starsFor(mistakes) {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

// ---------- Progress and hats ----------

export const HATS = [
  { id: 'party', at: 10, name: 'Party hat' },
  { id: 'flowers', at: 25, name: 'Flower crown' },
  { id: 'wizard', at: 50, name: 'Wizard hat' },
  { id: 'crown', at: 100, name: 'Golden crown' },
];

export const PROGRESS_DEFAULTS = { words_eaten: 0, longest: 0, hats: [], hat: null };

// Tidies whatever came back from the device or the Sheet.
export function cleanProgress(p) {
  const words = Math.max(0, Math.floor(Number(p && p.words_eaten) || 0));
  const longest = Math.max(0, Math.floor(Number(p && p.longest) || 0));
  const saved = Array.isArray(p && p.hats) ? p.hats : [];
  const hats = HATS.filter((h) => saved.includes(h.id) || words >= h.at).map((h) => h.id);
  const hat = p && hats.includes(p.hat) ? p.hat : null;
  return { words_eaten: words, longest, hats, hat };
}

// Hats newly earned by going from `before` to `after` words eaten.
export function hatsEarned(before, after) {
  return HATS.filter((h) => before < h.at && after >= h.at);
}
