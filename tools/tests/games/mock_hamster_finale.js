// Hamster Highway step 18b (i): mock-ups for level 30, the finale at the fair: the lantern gate (D-240: the bottle-top
// button's lid drawn as a lantern-lit drawbridge) and the confetti poppers over the merry-go-round party (D-241), two looks
// of each, all Claude's, proposed, for Rob's pick. Version 0.1 (27 Nov).
// Not part of the game: mock_hamster_level30.py appends this to a scratch copy of art.js (1.14), where its helpers (rect,
// circle, path, line, ellipse, g, place, star, heart, hamster, the colours, FBLUE, FLILAC, FMINT, FCOLS) are in scope, and
// lays each look over the real game's button and party (in the game, game.js would draw them; nothing here changes a rule).
//
// The gate: gateLook(look, { bx, by, hx, hy, n }) gives { lid, fixed }: lid goes inside the lid's turning group (it stands
// up at the hinge hx, hy and swings down over n squares when the button is pressed, as today); fixed is drawn in the
// board (posts, lanterns on the string). Lanterns are class gl-lamp and light up once the button's group has data-lit.
// The poppers: popperLook(look) gives the poppers in the party's 720 x 420 frame (as partyCarousel()), moved by
// mock_hamster_finale.css. Every moving part sits in an inner group whose own class moves it (a group with a transform
// attribute is never animated, handoff quirk).

const GL_OFF = '#F3D9B8';   // a paper lantern, unlit
const GL_ON = '#FFD34D';    // lit

function glLantern(x, y, col, i, size = 1) {
  // a paper lantern hanging at x, y (its top): ribs, a cap and a tassel; its glow behind it, shown once lit
  const w = 13 * size;
  const h = 18 * size;
  return g(circle(0, h * 0.6, w * 1.9, 'rgba(255,211,77,0.55)', 0, 'none', ' class="gl-halo"')
    + line(0, -6 * size, 0, 0, INK, 1.8)
    + ellipse(0, h * 0.6, w, h * 0.6, GL_OFF, 2.4, INK, 0, ` class="gl-lamp" data-col="${col}"`)
    + line(0, h * 0.1, 0, h * 1.1, INK, 1.2) + ellipse(0, h * 0.6, w * 0.5, h * 0.58, 'none', 1.2)
    + rect(-w * 0.45, -2, w * 0.9, 5 * size, col, 1.5, 1.8) + rect(-w * 0.45, h * 1.12, w * 0.9, 4 * size, col, 1.5, 1.8)
    + line(0, h * 1.25, 0, h * 1.6, col, 2.4), `translate(${x} ${y})`, ` style="--i:${i}"`);
}

export function gateLook(look, { bx, by, hx, hy, n }) {
  const L = n * 60;
  if (look === 'G1') {
    // G1, lantern posts: a fair-striped drawbridge with a rope rail, and a lantern post at each end of the gap
    let stripes = '';
    for (let i = 0; i < n * 4; i++) stripes += rect(i * 15, 0, 15, 14, i % 2 ? WHITE : FRED, 0, 0, 'none');
    const lid = rect(0, 0, L, 14, 'none', 5, 0, 'none') + stripes + rect(0, 0, L, 14, 'none', 5, 3)
      + path(`M 4 -2 Q ${L / 2} -14 ${L - 4} -2`, 'none', 2.4, '#8B5A3C') + circle(L - 6, 7, 3.5, SUN, 1.6);
    const post = (x, i) => rect(x - 4, -78, 8, 78, '#8B5A3C', 3, 2.4) + path(`M ${x} -78 L ${x + 18} -78`, 'none', 3) + glLantern(x + 18, -72, i ? FBLUE : FRED, i, 1.15);
    const fixed = g(post(-14, 0) + post(L + 10, 1), `translate(${hx} ${hy})`);
    return { lid, fixed };
  }
  // G2, a string of lanterns: the string from the button to the bridge hung with lanterns that light one after another,
  // from the button to the bridge, as it is pressed; a wooden drawbridge
  const lid = rect(0, 0, L, 14, '#C98B55', 5, 3) + [1, 2, 3].map((k) => line((L * k) / 4, 2, (L * k) / 4, 12, INK, 1.6)).join('');
  const [x0, y0, x2, y2] = [bx + 30, by - 14, hx + 6, hy - 4];
  const [cx, cy] = [(bx + hx) / 2, Math.min(by, hy) - 40];
  let fixed = '';
  const N = 9;
  for (let k = 1; k <= N; k++) {
    const t = k / (N + 1);
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y2;
    fixed += glLantern(x, y + 2, FCOLS[k % FCOLS.length], k, 0.9);
  }
  return { lid, fixed: g(fixed, '', ' class="gl-string"') };
}

function popper(col, flip) {
  // a party popper: a striped cone, mouth up, a pull string; the burst comes out of its mouth (0, -46)
  let s = path('M -14 -44 L 14 -44 L 3 0 L -3 0 Z', col, 2.6);
  s += path('M -9 -30 L 9 -30', 'none', 3, WHITE) + path('M -6 -16 L 6 -16', 'none', 3, WHITE);
  s += ellipse(0, -44, 14, 4, SUN, 2.2) + path('M 0 0 q 6 10 -2 18', 'none', 2, INK);
  return flip ? g(s, 'scale(-1 1)') : s;
}
function burst(n, spread, seed0) {
  // streamers and bits shot out of the mouth in a fan, each on its own path (--bx, --by) and spin
  let seed = seed0;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let s = g(star(0, 0, 20, WHITE, 2.4), '', ' class="pp-flash"');
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * spread;
    const d = 90 + rnd() * 70;
    const col = FCOLS[i % FCOLS.length];
    const bit = i % 3 === 0 ? path('M 0 0 q 6 -8 0 -16 q -6 -8 0 -16', 'none', 3.5, col) : i % 3 === 1 ? star(0, 0, 7, col, 1.6) : rect(-5, -3, 10, 6, col, 1.5, 1.4);
    s += `<g class="pp-bit" style="--bx:${(Math.cos(a) * d).toFixed(0)}px;--by:${(Math.sin(a) * d).toFixed(0)}px;--rot:${Math.round(rnd() * 540 - 270)}deg">${bit}</g>`;
  }
  return s;
}
export function popperLook(look) {
  // in the party's 720 x 420 frame; the merry-go-round's floor is at y 330, its middle x 360
  if (look === 'C1') {
    // C1, two big poppers either side, leaning in, popping in turn
    const one = (x, rot, col, i, flip) => g(`<g class="pp-pop" style="--d:${i * 1.2}s"><g class="pp-cone">${popper(col, flip)}</g>`
      + g(burst(14, 1.5, 11 + i * 5), 'translate(0 -48)') + '</g>', `translate(${x} 338) rotate(${rot}) scale(1.5)`, ` data-popper="${i}"`);
    return `<g data-poppers="C1">${one(118, 24, FBLUE, 0, false) + one(602, -24, FRED, 1, true)}</g>`;
  }
  // C2, five small poppers along the front, popping one after another, left to right, like a wave
  let s = '';
  for (let i = 0; i < 5; i++) {
    const x = 170 + i * 95;
    s += g(`<g class="pp-pop pp-wave" style="--d:${(i * 0.3).toFixed(1)}s"><g class="pp-cone">${popper(FCOLS[(i + 1) % FCOLS.length], i > 2)}</g>`
      + g(burst(8, 1.1, 3 + i * 7), 'translate(0 -48)') + '</g>', `translate(${x} 398) rotate(${(i - 2) * 9})`, ` data-popper="${i}"`);
  }
  return `<g data-poppers="C2">${s}</g>`;
}
