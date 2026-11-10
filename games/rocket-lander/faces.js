// Reception's target faces (level plan 0.3, section 5; D-092): the pictures and phrases at the top
// that ask for a number: dots to count, a quick look, more or fewer than some dots, one more or one
// less, a frame to fill to make 5 or 10, sums with dots under each number (Q-033), doubles and
// sharing sweets. Version 1.0 (step 2c-3a). Pure: builds the chip's markup as text from a target
// (asks.js, sums.js); no imports, page, clock or randomness. Rob judges these by eye in the preview
// (D-092); the look is game.css's `.chip.face`.

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
function cells(hows, { frame = false, cls = 'dots' } = {}) {
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
  if (look === 1) return cells(many(k), { cls: 'dots fl-dots' }).replace('<svg', '<svg data-look="row"');
  const pts = look === 2 ? SCATTER[k] : PIPS[k];
  const body = pts.map(([x, y]) => `<circle class="d-on" cx="${x}" cy="${y}" r="${DOT_R}"/>`).join('');
  return `<svg class="dots fl-dots r3" data-look="${look === 2 ? 'scatter' : 'dice'}" viewBox="0 0 30 30" aria-hidden="true">${body}</svg>`;
}

// A frame of `whole` places (5 or 10), `part` of them filled: what's left is the answer.
export const bondSvg = (whole, part) => cells([...many(part), ...many(whole - part, 'empty')], { frame: true, cls: 'dots frame' });

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
      return { cls: 'face face-more-less', html: `${fw(T.dir === 'more' ? '1 more than' : '1 less than')}<b class="fn">${esc(T.n)}</b>` };
    case 'bond':
      return { cls: 'face face-bond', html: `${bondSvg(T.whole, T.part)}${fw('make')}<b class="fn">${esc(T.whole)}</b>` };
    case 'double':
      return { cls: 'face face-double', html: `${fw('double')}<span class="pc"><b class="fn">${esc(T.n)}</b><span class="pair">${dotsSvg(T.n)}${dotsSvg(T.n)}</span></span>` };
    case 'share':
      return { cls: 'face face-share', html: `${sweetsSvg(T.total)}${fw('shared by')}${platesSvg(T.groups)}` };
    default:
      return { cls: '', html: esc(T.value ?? '?') };
  }
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
  return `<svg class="dots sweets r${rows}" viewBox="-0.6 -0.6 ${cols * 12 + 1.2} ${rows * 10 + 1.2}" aria-hidden="true">${body}</svg>`;
}
export function platesSvg(g) {
  const body = Array.from({ length: g }, (_, i) => `<ellipse class="plate" cx="${i * 16 + 8}" cy="5" rx="7" ry="3.6"/><ellipse class="plate-in" cx="${i * 16 + 8}" cy="4.6" rx="4.2" ry="1.9"/>`).join('');
  return `<svg class="dots plates" viewBox="-0.6 -0.6 ${g * 16 + 1.2} 11.2" aria-hidden="true">${body}</svg>`;
}
