// Number line maths for Rocket Lander (no drawing here): tidying the settings, landing
// spots, which marks get a number, how near counts, and numbers written and said nicely.

export const MAX_SPOTS = 400;
const MINUS = '−';

// Rounds away floating point noise: 0.1 + 0.2 gives 0.3, not 0.30000000000000004.
export const tidy = (n) => Math.round(n * 1e6) / 1e6;

const decimals = (n) => {
  const s = String(tidy(Math.abs(n)));
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};

// The smallest "nice" gap (1, 2, 2.5 or 5 times a power of ten) that is at least x.
export function niceAtLeast(x) {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (tidy(m * p) >= x - 1e-9) return tidy(m * p);
  return tidy(10 * p);
}

// Works out the landing spots from the settings, fixing odd ones sensibly.
// Returns the line plus notes saying what was fixed (for a console.info).
export function makeLine({ from, to, step }) {
  const notes = [];
  from = tidy(Number(from) || 0);
  to = tidy(Number(to));
  step = tidy(Number(step));
  if (!Number.isFinite(to)) to = from + 10;
  if (!(step > 0)) { notes.push(`step ${step} can't be used, so it is 1`); step = 1; }
  if (to < from) {
    notes.push(`"to" (${to}) was below "from" (${from}), so they were swapped`);
    [from, to] = [to, from];
  }
  if (to === from) {
    const nt = tidy(from + 10 * step);
    notes.push(`"to" was the same as "from" (${from}), so the line goes to ${nt}`);
    to = nt;
  }
  if ((to - from) / step < 2 - 1e-9) {
    const ns = niceAtLeast((to - from) / 10);
    notes.push(`step ${step} is too big for ${from} to ${to}, so it became ${ns}`);
    step = ns;
  }
  let gaps = (to - from) / step;
  if (gaps > MAX_SPOTS - 1 + 1e-9) {
    const ns = niceAtLeast((to - from) / (MAX_SPOTS - 1));
    notes.push(`${Math.floor(gaps + 1e-6) + 1} landing spots is more than ${MAX_SPOTS}, so step ${step} became ${ns}`);
    step = ns;
    gaps = (to - from) / step;
  }
  let n = Math.round(gaps);
  if (Math.abs(gaps - n) > 1e-6) {
    n = Math.floor(gaps + 1e-6);
    const nt = tidy(from + n * step);
    notes.push(`${to} isn't a whole number of steps of ${step} from ${from}, so the line ends at ${nt}`);
    to = nt;
  }
  const places = Math.min(4, Math.max(decimals(step), decimals(from)));
  return {
    from, to, step, gaps: n, count: n + 1, places, notes,
    value: (i) => tidy(from + i * step),
    index: (v) => Math.max(0, Math.min(n, Math.round((v - from) / step))),
  };
}

// Which spots get a number under them: both ends, then every multiple of `every`.
export function labelSpots(line, every) {
  const set = new Set([0, line.gaps]);
  if (every > 0) {
    for (let i = 1; i < line.gaps; i++) {
      const q = line.value(i) / every;
      if (Math.abs(q - Math.round(q)) < 1e-6) set.add(i);
    }
  }
  return [...set].sort((a, b) => a - b);
}

// The usual gap between numbered marks, in the line's units (for automatic leeway).
export function labelGap(line, idx) {
  const diffs = [];
  for (let k = 1; k < idx.length - 1; k++) diffs.push(idx[k] - idx[k - 1]);
  if (!diffs.length) {
    const g = niceAtLeast((line.to - line.from) / 10);
    return Math.max(line.step, tidy(Math.round(g / line.step) * line.step));
  }
  diffs.sort((a, b) => a - b);
  return tidy(diffs[Math.floor(diffs.length / 2)] * line.step);
}

// How near counts. allowed: how far (in the line's units) a landing may be from the
// target and still count (0 = only the target's own mark). perfect: how near the
// rocket's middle must be for "Perfect!": a quarter of the gap the child aims across
// (the marks, or the numbered marks when the marks are too close), and never under 6px.
export const TIGHT_PX = 24;
export function nearness(line, { closeEnough = 0, pxPerStep, gapOfLabels }) {
  const tight = pxPerStep < TIGHT_PX;
  let allowed = 0;
  if (closeEnough > 0) allowed = closeEnough;
  else if (tight) allowed = gapOfLabels / 2;
  const aimGap = tight ? gapOfLabels : line.step;
  const sixPx = pxPerStep > 0 ? (6 / pxPerStep) * line.step : 0;
  return { allowed: tidy(allowed), tight, perfect: Math.max(aimGap / 4, sixPx) };
}

const FRACTIONS = [[0.5, '½', 'a half'], [0.25, '¼', 'a quarter'], [0.75, '¾', 'three quarters']];
const fractionOf = (f) => FRACTIONS.find(([v]) => Math.abs(f - v) < 1e-6);

// A number as it's written on screen: 7, −3, 2½ (fraction) or 2.5 (decimal).
export function fmt(v, showAs = 'fraction') {
  v = tidy(v);
  if (Math.abs(v) < 1e-9) return '0';
  const sign = v < 0 ? MINUS : '';
  const a = Math.abs(v);
  if (showAs === 'fraction') {
    const whole = Math.floor(a + 1e-9);
    const f = fractionOf(tidy(a - whole));
    if (f) return sign + (whole ? String(whole) : '') + f[1];
  }
  return sign + String(tidy(a));
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  if (n < 1e6) {
    const r = n % 1000;
    return words(Math.floor(n / 1000)) + ' thousand' + (r ? (r < 100 ? ' and ' : ' ') + words(r) : '');
  }
  return String(n);
}

// A number as it's said out loud: "seven", "minus three", "two and a half", "two point five".
export function say(v, showAs = 'fraction') {
  v = tidy(v);
  const neg = v < -1e-9;
  const a = Math.abs(v);
  const whole = Math.floor(a + 1e-9);
  const f = tidy(a - whole);
  let out;
  if (f < 1e-6) out = words(whole);
  else if (showAs === 'fraction' && fractionOf(f)) out = whole ? `${words(whole)} and ${fractionOf(f)[2]}` : fractionOf(f)[2];
  else out = `${words(whole)} point ${String(f).slice(2).split('').map((d) => ONES[Number(d)]).join(' ')}`;
  return (neg ? 'minus ' : '') + out;
}

// Stars for a round: right on 85% or more = 3, 60% or more = 2, otherwise 1.
export function starsFor(right, total) {
  if (right * 100 >= 85 * total) return 3;
  if (right * 100 >= 60 * total) return 2;
  return 1;
}
