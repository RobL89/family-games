// Hamster Highway step 15: three candidate backdrops for the climbing frame (levels 23 and 24), for Rob to pick from
// (project rules: mock-ups before building anything judged by eye). Version 0.1 (21 Nov).
// Not part of the game: mock_hamster_step15.py appends these function declarations to a scratch copy of art.js (1.8),
// where art.js's own helpers (rect, circle, ellipse, path, line, g, place and the colours) and the pond's sky
// (pondSky, sun and clouds) are in scope, and draws each behind a stand-in 9 x 16 board in the real game. The one Rob
// picks is copied into art.js by script, not retyped. Each is drawn 540 tall (9 rows of 60) and w wide, sunny like the
// rest of the park (D-189 park B). Cute details carry class "poke" and a data-poke name (D-141) that game.js already
// knows (bird, swing, spider), so a tap makes them hop or wobble.
// Also frameBar(c, r, top): the board's own floors drawn as a yellow climbing bar on red posts, in place of art.js's
// earth block, for the "floors as bars" extra.

const FH = 540;
const FRED = '#E8505B';
const FWOOD = '#C98B5A';

function frameHill(w) {
  return rect(0, 380, w, FH - 380, '#E7F6FC', 0, 0) + path(`M 0 432 Q ${w * 0.25} 404 ${w * 0.5} 424 T ${w} 418 L ${w} ${FH} L 0 ${FH} Z`, '#CDEFB9', 0, 'none')
    + path(`M 0 432 Q ${w * 0.25} 404 ${w * 0.5} 424 T ${w} 418`, 'none', 3, '#8FC97A');
}

function frameBush(x, y) {
  return circle(x, y, 34, '#9ED98A', 2.4, '#6FB35A') + circle(x + 38, y + 6, 26, '#A9DE94', 2.4, '#6FB35A');
}

function frameRobin(x, y) {
  return g(ellipse(x, y - 12, 16, 13, '#A9744F', 2.2) + ellipse(x + 4, y - 9, 9, 8, CORAL, 0) + circle(x + 12, y - 24, 9, '#A9744F', 2.2)
    + circle(x + 15, y - 26, 2, INK, 0) + path(`M ${x + 20} ${y - 24} l 7 2 l -7 2 Z`, SUN, 1.4) + path(`M ${x - 14} ${y - 14} l -12 -6 l 2 10 Z`, '#8B5A3C', 1.8)
    + line(x - 3, y, x - 3, y + 5, INK, 2) + line(x + 4, y, x + 4, y + 5, INK, 2), '', ' class="poke" data-poke="bird"');
}

function frameLadybird(x, y) {
  return g(ellipse(x, y, 10, 12, CORAL, 2) + line(x, y - 12, x, y + 12, INK, 1.6) + circle(x, y - 13, 5, INK, 0)
    + circle(x - 4, y - 2, 2.2, INK, 0) + circle(x + 4, y + 4, 2.2, INK, 0) + circle(x + 4, y - 4, 1.8, INK, 0), '', ' class="poke" data-poke="spider"');
}

// A: the park's red and yellow frame (as the park picker draws it): red posts, yellow bars, monkey bars between two
// towers, a flag on top that wobbles, a robin on a bar, a ladybird climbing a post, bushes.
function frameA(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 420) d += frameBush(x, 448);
  let k = 0;
  for (let x = 230; x + 420 <= w + 40; x += 600, k++) {
    const post = (px, top) => rect(px - 8, top, 16, 452 - top, FRED, 4, 3) + ellipse(px, 452, 14, 5, '#8FC97A', 0);
    d += post(x, 170) + post(x + 200, 170) + post(x + 420, 230) + post(x + 560, 230);
    for (const y of [240, 320, 400]) d += rect(x - 10, y - 7, 220, 14, SUN, 7, 3);
    for (const y of [300, 380]) d += rect(x + 410, y - 7, 160, 14, SUN, 7, 3);
    d += rect(x + 192, 224, 236, 12, SUN, 6, 3) + rect(x + 192, 254, 236, 12, SUN, 6, 3)
      + [0, 1, 2, 3, 4, 5, 6].map((i) => line(x + 222 + 30 * i, 236, x + 222 + 30 * i, 254, INK, 3)).join('');
    d += g(line(x + 100, 170, x + 100, 110, INK, 3.5) + path(`M ${x + 100} 112 L ${x + 146} 126 L ${x + 100} 140 Z`, k % 2 ? LEAF : CORAL, 2.6), '', ' class="poke" data-poke="swing"');
    d += line(x - 8, 172, x + 208, 172, FRED, 0) + rect(x - 12, 162, 224, 14, FRED, 6, 3);
    if (k === 0) d += frameRobin(x + 150, 233) + frameLadybird(x + 420, 330);
  }
  return s + g(d, '', ' opacity="0.92"');
}

// B: a wooden climbing tower with a red pointed roof and a round window, a rope net sloping down from its deck, a
// rope ladder, a big tree, a squirrel peeking over the deck.
function frameB(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 520; x < w; x += 640) d += frameBush(x, 450);
  let k = 0;
  for (let x = 160; x + 380 <= w + 60; x += 640, k++) {
    d += [x, x + 170].map((px) => rect(px - 9, 150, 18, 302, FWOOD, 3, 3)).join('');
    d += rect(x - 24, 268, 218, 18, '#E2A867', 4, 3) + rect(x - 4, 180, 178, 88, 'rgba(255,248,238,0.5)', 0, 0, 'none');
    d += path(`M ${x - 34} 156 L ${x + 85} 76 L ${x + 204} 156 Z`, FRED, 3) + circle(x + 85, 124, 14, '#BFE6F7', 2.6);
    for (const y of [200, 236]) d += line(x, y, x + 170, y, FWOOD, 6);
    let net = '';
    for (let i = 0; i <= 6; i++) net += line(x + 194, 286 + 0 * i, x + 194 + 30 * i + 40, 452, '#D9B98A', 3);
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      net += line(x + 194 + 40 * t, 286 + 166 * t, x + 194 + 220 * t, 286 + 166 * t, '#D9B98A', 3);
    }
    d += net + line(x + 194, 286, x + 234, 452, '#B89464', 4) + line(x + 194, 286, x + 414, 452, '#B89464', 4);
    d += [x - 60, x - 30].map((px) => line(px, 286, px, 440, '#B89464', 3)).join('')
      + [320, 350, 380, 410].map((y) => line(x - 60, y, x - 30, y, FWOOD, 5)).join('') + line(x - 60, 286, x - 24, 280, '#B89464', 3) + line(x - 30, 286, x - 24, 280, '#B89464', 3);
    if (k === 0) {
      d += g(path(`M ${x + 40} 268 q -6 -26 10 -30 q 16 -4 18 12 q 14 -10 22 6 q -16 0 -18 12 Z`, '#C77A4A', 2.4)
        + circle(x + 52, 248, 2.4, INK, 0) + circle(x + 62, 248, 2.4, INK, 0) + ellipse(x + 57, 255, 3, 2, PINK, 0), '', ' class="poke" data-poke="bird"');
    }
  }
  const tx = w - 130;
  d += path(`M ${tx - 26} 452 Q ${tx - 16} 330 ${tx - 22} 230 L ${tx + 22} 230 Q ${tx + 16} 330 ${tx + 26} 452 Z`, '#8B5A3C', 3)
    + [[-80, 200, 80], [0, 160, 96], [80, 200, 80]].map(([dx, y, r]) => circle(tx + dx, y, r, '#8FD46E', 3)).join('');
  return s + g(d, '', ' opacity="0.92"');
}

// C: a rainbow dome climber, a tyre swing hanging from a big tree that wobbles when tapped, two butterflies.
function frameC(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 520) d += frameBush(x, 448);
  const BOW = [FRED, '#FF9A3C', SUN, LEAF, '#4FA3E0', '#8E6BD8'];
  let k = 0;
  for (let cx = 330; cx + 200 <= w + 80; cx += 620, k++) {
    let dome = '';
    for (let i = 0; i < 4; i++) dome += path(`M ${cx - 200 + 46 * i} 452 A ${200 - 46 * i} ${230 - 52 * i} 0 0 1 ${cx + 200 - 46 * i} 452`, 'none', 9, INK) + path(`M ${cx - 200 + 46 * i} 452 A ${200 - 46 * i} ${230 - 52 * i} 0 0 1 ${cx + 200 - 46 * i} 452`, 'none', 5.5, BOW[(i + k) % 6]);
    for (const y of [300, 360, 410]) {
      const half = 200 * Math.sqrt(1 - ((452 - y) / 230) ** 2);
      dome += line(cx - half, y, cx + half, y, INK, 8) + line(cx - half, y, cx + half, y, BOW[(y / 60 + 4 + k) % 6 | 0], 4.5);
    }
    d += dome;
    if (k === 0) d += g(g(path(`M ${cx + 240} 268 q -18 -18 -6 -26 q 10 -4 6 22 q 18 -14 24 -2 q -8 10 -24 6`, PINK, 2), '', ' class="flutter"'), '', ' class="poke" data-poke="bird"')
      + g(g(path(`M ${cx - 260} 214 q -16 -16 -6 -24 q 10 -4 6 20 q 16 -12 22 -2 q -8 10 -22 6`, SUN, 2), '', ' class="flutter"'), '', ' class="poke" data-poke="bird"');
  }
  const tx = w - 170;
  d += path(`M ${tx - 28} 452 Q ${tx - 18} 330 ${tx - 24} 180 L ${tx + 24} 180 Q ${tx + 18} 330 ${tx + 28} 452 Z`, '#8B5A3C', 3)
    + path(`M ${tx} 230 Q ${tx - 70} 200 ${tx - 130} 214`, 'none', 18, '#8B5A3C') + path(`M ${tx} 230 Q ${tx - 70} 200 ${tx - 130} 214`, 'none', 12, '#A8703F', 0)
    + [[-110, 150, 80], [0, 120, 100], [100, 160, 76]].map(([dx, y, r]) => circle(tx + dx, y, r, '#8FD46E', 3)).join('');
  d += g(line(tx - 110, 214, tx - 110, 360, INK, 3) + ellipse(tx - 110, 384, 30, 24, '#3B3B3B', 3) + ellipse(tx - 110, 384, 13, 10, '#BFE6F7', 2), '', ' class="poke" data-poke="swing"');
  return s + g(d, '', ' opacity="0.92"');
}

// The extra: a board floor drawn as a climbing bar (a yellow bar, a red post under every other square),
// in board units, the same footprint as art.js's block(c, r, top). Floors in the bottom row stay earth (the ground).
function frameBar(c, r, top) {
  const x = c * CELL;
  const y = r * CELL;
  let s = c % 2 === 0 ? rect(x + 22, y + 22, 16, CELL - 22, FRED, 0, 2.4) : '';
  s += rect(x, y, CELL, top ? 24 : CELL, top ? SUN : 'rgba(255,201,60,0.55)', 0, 0) + line(x, y, x + CELL, y, INK, 2.4) + line(x, y + 24, x + CELL, y + 24, INK, 2.4);
  return s + (top ? line(x + 8, y + 7, x + 40, y + 7, WHITE, 3, ' opacity="0.6"') : '');
}
