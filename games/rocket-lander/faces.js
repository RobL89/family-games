// Reception's target faces (level plan 0.3, section 5; D-092): the pictures and phrases at the top
// that ask for a number: dots to count, a quick look, more or fewer than some dots, one more or one
// less, a frame to fill to make 5 or 10, sums with dots under each number (Q-033), doubles and
// sharing sweets. Version 1.2. Changes at v1.2 (step 2c-3c): Year 1's and Year 3's faces: a number to find
// (shown as itself, like Number mode's chip), groups of 2, 5 or 10 as rows of dots (an array, the notes'
// show_array), half of a number as its dots in two groups, a 3-digit number as counters in a place-value
// chart (H, T, O: nine hundreds as blocks wouldn't fit an upright phone's chip), 10 or 100 more or less, a
// count in tenths written as tenths (partsHtml), which of two unit fractions is bigger, and a fraction sum
// (fracSumHtml). Changes at v1.1 (step 2c-3b, D-100): Year 2's faces: a number as tens
// rods and ones (place), in words (words), "47 < ?" (sign), three numbers of a count and a box to find
// (seq), a circle or a bar cut in equal parts with some shaded (frac-shape), and a fraction of a number
// with its dots in equal groups (frac-of); fractions are written one number over the other (fracHtml).
// Version 1.0 (step 2c-3a): Reception's. Pure: builds the chip's markup as text from a target
// (asks.js, sums.js); no imports, page, clock or randomness. Rob judges these by eye in the preview
// (D-092); the look is game.css's `.chip.face` (the pictures' class is `fd`: `dots` is the landings trail's).

const DOT_R = 3.9;     // a dot's radius in a 10-unit cell
const PER_ROW = 5;     // dots go in rows of 5, as on a ten frame, so 6 is 5 and 1 more
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// A dot in a 10-unit cell at (x, y): coral, or crossed out (taken away), or an empty place to fill.
const dot = (x, y, how = 'on') => (how === 'empty'
  ? `<circle class="d-empty" cx="${x}" cy="${y}" r="${DOT_R}"/>`
  : how === 'gone'
    ? `<circle class="d-gone" cx="${x}" cy="${y}" r="${DOT_R}"/><path class="d-x" d="M${x - 3.2} ${y - 3.2}L${x + 3.2} ${y + 3.2}M${x + 3.2} ${y - 3.2}L${x - 3.2} ${y + 3.2}"/>`
    : `<circle class="d-on" cx="${x}" cy="${y}" r="${DOT_R}"/>`);

// An svg of cells in rows of 5: `hows` lists each cell's look in order ('on', 'gone', 'empty').
function cells(hows, { frame = false, cls = 'fd' } = {}) {
  const n = hows.length, cols = Math.max(1, Math.min(PER_ROW, n)), rows = Math.max(1, Math.ceil(n / PER_ROW));
  const w = cols * 10, h = rows * 10;
  const box = frame ? hows.map((_, i) => `<rect class="f-cell" x="${(i % PER_ROW) * 10 + 0.8}" y="${Math.floor(i / PER_ROW) * 10 + 0.8}" width="8.4" height="8.4" rx="1.6"/>`).join('') : '';
  const body = hows.map((how, i) => dot((i % PER_ROW) * 10 + 5, Math.floor(i / PER_ROW) * 10 + 5, how)).join('');
  return `<svg class="${cls} r${rows}" viewBox="-0.6 -0.6 ${w + 1.2} ${h + 1.2}" aria-hidden="true">${box}${body}</svg>`;
}
const many = (n, how = 'on') => Array.from({ length: n }, () => how);

// n dots in rows of 5.
export const dotsSvg = (n) => cells(many(n));

// A quick look's dots (1 to 5), laid out three ways: as on a dice, in a row, or scattered.
const PIPS = { 1: [[15, 15]], 2: [[8, 8], [22, 22]], 3: [[8, 8], [15, 15], [22, 22]], 4: [[8, 8], [22, 8], [8, 22], [22, 22]],
  5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]] };
const SCATTER = { 1: [[12, 17]], 2: [[7, 10], [21, 19]], 3: [[6, 18], [15, 7], [24, 17]], 4: [[6, 9], [18, 6], [10, 22], [24, 19]],
  5: [[5, 13], [15, 5], [25, 11], [10, 25], [22, 24]] };
export function flashSvg(n, look = 0) {
  const k = Math.max(1, Math.min(5, Math.round(n)));
  if (look === 1) return cells(many(k), { cls: 'fd fl-dots' }).replace('<svg', '<svg data-look="row"');
  const pts = look === 2 ? SCATTER[k] : PIPS[k];
  const body = pts.map(([x, y]) => `<circle class="d-on" cx="${x}" cy="${y}" r="${DOT_R}"/>`).join('');
  return `<svg class="fd fl-dots r3" data-look="${look === 2 ? 'scatter' : 'dice'}" viewBox="0 0 30 30" aria-hidden="true">${body}</svg>`;
}

// A frame of `whole` places (5 or 10), `part` of them filled: what's left is the answer.
export const bondSvg = (whole, part) => cells([...many(part), ...many(whole - part, 'empty')], { frame: true, cls: 'fd frame' });

// A number with its dots under it; for a take-away, the first number's last `gone` dots crossed out.
const column = (n, hows) => `<span class="pc"><b class="fn">${esc(n)}</b>${hows.length ? cells(hows) : '<span class="d-none"></span>'}</span>`;

// The chip for a Reception target: { cls, html } (game.js puts it in the target's chip).
export function faceChip(T) {
  const fw = (w) => `<span class="fw">${esc(w)}</span>`;
  switch (T.ask) {
    case 'dots':
      return { cls: 'face face-dots', html: dotsSvg(T.n) };
    case 'flash':
      return { cls: 'face face-flash', html: `<span class="fl" style="--show:${Math.round(T.ms ?? 1500)}ms">${flashSvg(T.n, T.look)}<b class="fl-q" aria-hidden="true">?</b></span>` };
    case 'compare':
      return { cls: 'face face-compare', html: `${fw(T.rel === 'more' ? 'more than' : T.rel === 'fewer' ? 'fewer than' : 'the same as')}${dotsSvg(T.n)}` };
    case 'more-less':
      return { cls: 'face face-more-less', html: `${fw(`${T.by ?? 1} ${T.dir === 'more' ? 'more' : 'less'} than`)}<b class="fn">${esc(T.n)}</b>` };
    case 'bond':
      return { cls: 'face face-bond', html: `${bondSvg(T.whole, T.part)}${fw('make')}<b class="fn">${esc(T.whole)}</b>` };
    case 'double':
      return { cls: 'face face-double', html: `${fw('double')}<span class="pc"><b class="fn">${esc(T.n)}</b><span class="pair">${dotsSvg(T.n)}${dotsSvg(T.n)}</span></span>` };
    case 'share':
      return { cls: 'face face-share', html: `${sweetsSvg(T.total)}${fw('shared by')}${platesSvg(T.groups)}` };
    case 'place':
      return { cls: 'face face-place', html: T.n >= 100 ? chartSvg(T.n) : placeSvg(T.n) };
    case 'words':
      return { cls: 'face face-words', html: `<span class="wd">${esc(numberWords(T.n))}</span>` };
    case 'sign':
      return { cls: 'face face-sign', html: `<b class="fn">${esc(T.n)}</b><span class="op">${T.rel === 'more' ? '&lt;' : T.rel === 'fewer' ? '&gt;' : '='}</span><b class="fq">?</b>` };
    case 'seq':
      return { cls: 'face face-seq', html: `${T.terms.map((v) => (T.den ? `<b class="fn fx">${partsHtml(v, T.den)}</b>` : `<b class="fn">${esc(v)}</b>`)).join('')}<b class="fq">?</b>` };
    case 'frac-shape':
      return { cls: 'face face-shape', html: shapeSvg(T.num, T.den, T.look) };
    case 'frac-of':
      return { cls: 'face face-fracof', html: `${fracHtml(T.num, T.den)}${fw('of')}<b class="fn">${esc(T.total)}</b>${groupsSvg(T.total, T.den)}` };
    case 'find':
      return { cls: '', html: esc(T.n) };
    case 'groups':
      return { cls: 'face face-groups', html: `<b class="fn">${esc(T.groups)}</b>${fw(T.groups === 1 ? 'group of' : 'groups of')}<b class="fn">${esc(T.size)}</b>${arraySvg(T.groups, T.size)}` };
    case 'half':
      return { cls: 'face face-half', html: `${fw('half of')}<b class="fn">${esc(T.n)}</b>${groupsSvg(T.n, 2)}` };
    case 'frac-compare':
      return { cls: 'face face-fcmp', html: `${fw('Which is bigger?')}${fracHtml(1, T.first)}${fw('or')}${fracHtml(1, T.second)}` };
    default:
      return { cls: '', html: esc(T.value ?? '?') };
  }
}

// A fraction written as at school: the top number over a line over the bottom one.
export const fracHtml = (num, den) => `<span class="fr"><b>${esc(num)}</b><b>${esc(den)}</b></span>`;

// v parts of d written as counted: 3 tenths as 3 over 10, 13 tenths as 1 and 3 over 10, 10 tenths as 1.
export function partsHtml(v, d) {
  const n = Math.round(v), w = Math.floor(n / d), r = n - w * d;
  if (r === 0) return esc(w);
  return w ? `<span class="mx">${esc(w)}${fracHtml(r, d)}</span>` : fracHtml(r, d);
}

// A fraction sum, its two fractions written one number over the other: 5/7 + 1/7.
export const fracSumHtml = (T) => `${fracHtml(T.a, T.den)}<span class="op">${esc(T.op)}</span>${fracHtml(T.b, T.den)}`;

// So many groups of 2, 5 or 10, each a row of dots in a box (an array); a row of 10 is two fives.
export function arraySvg(groups, size) {
  const gap = size > 5 ? 3 : 0, rowW = size * 10 + gap + 2, rowH = 12;
  const body = Array.from({ length: groups }, (_, r) => {
    const y = r * (rowH + 2);
    const dots = Array.from({ length: size }, (_, i) => dot(1 + i * 10 + (i >= 5 ? gap : 0) + 5, y + 6)).join('');
    return `<rect class="gr-row" x="0" y="${y}" width="${rowW}" height="${rowH}" rx="3"/>${dots}`;
  }).join('');
  const H = groups * (rowH + 2) - 2;
  return `<svg class="fd array r${groups <= 1 ? 1 : groups === 2 ? 2 : 3}" viewBox="-1 -1 ${rowW + 2} ${H + 2}" aria-hidden="true">${body}</svg>`;
}

// A 3-digit number as counters in a place-value chart: columns H, T and O, each with as many counters
// as its digit (3 a row): 347 is 3 hundreds, 4 tens and 7 ones.
export function chartSvg(n) {
  const digits = [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10], cls = ['pc-h', 'pc-t', 'pc-o'], head = ['H', 'T', 'O'];
  const cw = 32, top = 11;
  const body = digits.map((k, c) => {
    const x0 = c * (cw + 2);
    const counters = Array.from({ length: k }, (_, i) => `<circle class="${cls[c]}" cx="${x0 + 6 + (i % 3) * 10}" cy="${top + 6 + Math.floor(i / 3) * 10}" r="4.2"/>`).join('');
    return `<rect class="pc-col" x="${x0}" y="0" width="${cw}" height="${top + 32}" rx="3"/><text class="pc-hd" x="${x0 + cw / 2}" y="8.6">${head[c]}</text>${counters}`;
  }).join('');
  return `<svg class="fd chart" viewBox="-1 -1 ${3 * cw + 6} ${top + 34}" aria-hidden="true">${body}</svg>`;
}

// A number in words, to 1000 (Year 2's to 100; Year 1's to 20).
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
  'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function numberWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${numberWords(n % 100)}` : ''}`;
  return n === 1000 ? 'one thousand' : String(n);
}

// Tens rods (a column of 10 squares) and ones (single squares, in columns of 5 from the bottom), as the
// base-ten blocks children use: 34 is 3 rods and 4 ones. In units of one square (3 wide).
export function placeSvg(n) {
  const t = Math.floor(n / 10) % 10, o = n % 10, q = 3, gap = 1.1, H = 10 * q;
  const rods = Array.from({ length: t }, (_, i) => {
    const x = i * (q + gap);
    const lines = Array.from({ length: 9 }, (_, k) => `<path class="pv-l" d="M${x} ${(k + 1) * q}h${q}"/>`).join('');
    return `<rect class="pv-ten" x="${x}" y="0" width="${q}" height="${H}" rx=".5"/>${lines}`;
  }).join('');
  const ox = t ? t * (q + gap) + 1.6 : 0;
  const ones = Array.from({ length: o }, (_, i) => `<rect class="pv-one" x="${ox + Math.floor(i / 5) * (q + gap)}" y="${H - (i % 5 + 1) * (q + 0.6) + 0.6}" width="${q}" height="${q}" rx=".5"/>`).join('');
  const w = Math.max(q, ox + (o ? Math.ceil(o / 5) * (q + gap) - gap : -1.6 - gap));
  return `<svg class="fd blocks" viewBox="-0.8 -0.8 ${(w + 1.6).toFixed(1)} ${H + 1.6}" aria-hidden="true">${rods}${ones}</svg>`;
}

// A circle (look 0) or a bar (look 1) cut into `den` equal parts, the first `num` shaded.
export function shapeSvg(num, den, look = 0) {
  const part = (i) => (i < num ? 'fs-on' : 'fs-off');
  if (look === 1) {
    const w = 36, h = 13, pw = w / den;
    const body = Array.from({ length: den }, (_, i) => `<rect class="${part(i)}" x="${(i * pw).toFixed(2)}" y="0" width="${pw.toFixed(2)}" height="${h}"/>`).join('');
    return `<svg class="fd shape bar" viewBox="-1.5 -1.5 ${w + 3} ${h + 3}" aria-hidden="true">${body}<rect class="fs-edge" x="0" y="0" width="${w}" height="${h}" rx="1"/></svg>`;
  }
  const r = 14, pt = (a) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
  const body = Array.from({ length: den }, (_, i) => {
    const a0 = (i / den) * 2 * Math.PI, a1 = ((i + 1) / den) * 2 * Math.PI;
    return `<path class="${part(i)}" d="M0 0L${pt(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(a1)}Z"/>`;
  }).join('');
  return `<svg class="fd shape pie" viewBox="${-r - 1.5} ${-r - 1.5} ${2 * r + 3} ${2 * r + 3}" aria-hidden="true">${body}<circle class="fs-edge" cx="0" cy="0" r="${r}"/></svg>`;
}

// `total` dots in `den` equal groups, each group in a box: 12 in 4 groups of 3. Two or three groups side by
// side; four (and more) in rows of two (or the square root), as a quartered square, so the picture stays narrow.
export function groupsSvg(total, den) {
  const k = total / den, cols = Math.max(1, Math.ceil(Math.sqrt(k))), rows = Math.ceil(k / cols);
  const per = den <= 3 ? den : Math.ceil(Math.sqrt(den)), lines = Math.ceil(den / per);
  const bw = cols * 10 + 2, bh = rows * 10 + 2, gap = 3;
  const body = Array.from({ length: den }, (_, g) => {
    const gx = (g % per) * (bw + gap), gy = Math.floor(g / per) * (bh + gap);
    const dots = Array.from({ length: k }, (_, i) => dot(gx + 1 + (i % cols) * 10 + 5, gy + 1 + Math.floor(i / cols) * 10 + 5)).join('');
    return `<rect class="fo-group" x="${gx}" y="${gy}" width="${bw}" height="${bh}" rx="2.5"/>${dots}`;
  }).join('');
  const W = per * (bw + gap) - gap, H = lines * (bh + gap) - gap;
  return `<svg class="fd groups r${H <= 14 ? 1 : H <= 26 ? 2 : 3}" viewBox="-1 -1 ${W + 2} ${H + 2}" aria-hidden="true">${body}</svg>`;
}

// A Reception sum with dots under each number (R09, R10): 2 + 3 with 2 and 3 dots; 5 − 2 with five
// dots, the last two crossed out.
export function picturedSum(T) {
  if (T.op === '−') return { cls: 'face face-sum', html: `${column(T.a, [...many(T.a - T.b), ...many(T.b, 'gone')])}<span class="op">−</span>${column(T.b, [])}` };
  return { cls: 'face face-sum', html: `${column(T.a, many(T.a))}<span class="op">${esc(T.op)}</span>${column(T.b, many(T.b))}` };
}

// Sweets to share, in rows of 5 (wrapped sweets in the candy planet's colours), and the plates.
const SWEET_COLS = ['#FF5D73', '#FFC93C', '#5FE3BD', '#B9A7FF', '#7FD8FF'];
export function sweetsSvg(n) {
  const cols = Math.max(1, Math.min(PER_ROW, n)), rows = Math.max(1, Math.ceil(n / PER_ROW));
  const body = Array.from({ length: n }, (_, i) => {
    const x = (i % PER_ROW) * 12 + 6, y = Math.floor(i / PER_ROW) * 10 + 5, c = SWEET_COLS[i % SWEET_COLS.length];
    return `<path class="sw-end" d="M${x - 3.2} ${y}L${x - 5.6} ${y - 2.6}L${x - 5.6} ${y + 2.6}ZM${x + 3.2} ${y}L${x + 5.6} ${y - 2.6}L${x + 5.6} ${y + 2.6}Z" fill="${c}"/>`
      + `<circle class="sw" cx="${x}" cy="${y}" r="3.4" fill="${c}"/>`;
  }).join('');
  return `<svg class="fd sweets r${rows}" viewBox="-0.6 -0.6 ${cols * 12 + 1.2} ${rows * 10 + 1.2}" aria-hidden="true">${body}</svg>`;
}
export function platesSvg(g) {
  const body = Array.from({ length: g }, (_, i) => `<ellipse class="plate" cx="${i * 16 + 8}" cy="5" rx="7" ry="3.6"/><ellipse class="plate-in" cx="${i * 16 + 8}" cy="4.6" rx="4.2" ry="1.9"/>`).join('');
  return `<svg class="fd plates" viewBox="-0.6 -0.6 ${g * 16 + 1.2} 11.2" aria-hidden="true">${body}</svg>`;
}
