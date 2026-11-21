// Hamster Highway step 16: two candidate backdrops for the picnic (levels 25 and 26), made while Rob was out (he asked
// for more levels while away, 21 Nov): Claude builds on its pick, A, marked proposed, for Rob to confirm or swap.
// Version 0.1 (21 Nov). Not part of the game: mock_hamster_step16.py appends these function declarations to a scratch
// copy of art.js (1.9), where art.js's helpers (rect, circle, ellipse, path, line, g and the colours) and the park's
// sky (pondSky) and hill (frameHill, frameBush) are in scope, and draws each behind a stand-in 9 x 16 board in the real
// game. The one picked is copied into art.js by script. Each is drawn 540 tall and w wide, sunny like the rest of the
// park (D-189 park B), its cute details answering a tap with game.js's own pokes (bird, swing, cup).

const PRED = '#E8505B';

function picBunting(x0, x1, y) {
  let s = path(`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + 40} ${x1} ${y}`, 'none', 2.4);
  const cols = [PRED, SUN, LEAF, '#4FA3E0', PINK];
  for (let i = 1; i < 9; i++) {
    const x = x0 + ((x1 - x0) * i) / 9;
    const yy = y + 40 * (1 - ((2 * i) / 9 - 1) ** 2) * 0.9;
    s += path(`M ${x - 12} ${yy - 2} L ${x} ${yy + 22} L ${x + 12} ${yy - 2} Z`, cols[i % 5], 2);
  }
  return g(s, '', ' class="poke" data-poke="swing"');
}

function picTree(x) {
  return path(`M ${x - 26} 452 Q ${x - 16} 330 ${x - 22} 220 L ${x + 22} 220 Q ${x + 16} 330 ${x + 26} 452 Z`, '#8B5A3C', 3)
    + [[-100, 190, 86], [0, 150, 104], [100, 190, 86]].map(([dx, y, r]) => circle(x + dx, y, r, '#8FD46E', 3)).join('');
}

function picTeacup(x, y) {
  return g(path(`M ${x - 16} ${y - 18} L ${x + 16} ${y - 18} L ${x + 12} ${y} L ${x - 12} ${y} Z`, WHITE, 2.4)
    + path(`M ${x + 15} ${y - 14} q 10 0 8 8 q -2 6 -10 4`, 'none', 2.4) + ellipse(x, y + 1, 20, 4, WHITE, 2.4)
    + circle(x - 4, y - 9, 3, PINK, 0), '', ' class="poke" data-poke="cup"');
}

// A: a gingham blanket on the grass under a big tree hung with bunting, a teapot and teacups, a robin by the crumbs.
function picnicA(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 460) d += frameBush(x, 448);
  const tx = w - 170;
  d += picTree(tx) + picBunting(tx - 520, tx - 60, 200);
  for (let x = 160; x + 300 <= w + 40; x += 640) {
    d += path(`M ${x} 452 L ${x + 300} 452 L ${x + 270} 420 L ${x + 30} 420 Z`, PRED, 3);
    for (let i = 1; i < 6; i++) d += line(x + 30 + 48 * i - 6, 420, x + 48 * i - 6, 452, WHITE, 6, ' opacity="0.7"');
    d += line(x + 15, 436, x + 285, 436, WHITE, 6, ' opacity="0.7"');
    d += g(ellipse(x + 90, 410, 26, 20, '#9FD3F5', 2.6) + path(`M ${x + 114} 404 q 18 -6 16 -20`, 'none', 4) + rect(x + 82, 384, 16, 8, '#9FD3F5', 3, 2.4), '', ' class="poke" data-poke="cup"')
      + picTeacup(x + 160, 418) + picTeacup(x + 210, 420);
  }
  d += g(ellipse(260, 440, 14, 11, '#A9744F', 2.2) + ellipse(263, 443, 8, 6, CORAL, 0) + circle(272, 428, 8, '#A9744F', 2.2) + circle(275, 426, 1.8, INK, 0)
    + path('M 279 428 l 6 2 l -6 2 Z', SUN, 1.4), '', ' class="poke" data-poke="bird"');
  return s + g(d, '', ' opacity="0.92"');
}

// B: a wooden picnic table with a striped parasol, a jug of lemonade, a kite caught in a tree, a wasp-free cupcake stand.
function picnicB(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 520; x < w; x += 520) d += frameBush(x, 448);
  d += picTree(w - 150) + g(path(`M ${w - 220} 120 L ${w - 190} 90 L ${w - 160} 120 L ${w - 190} 150 Z`, PINK, 2.6) + path(`M ${w - 190} 150 q -20 40 0 80 q 20 40 -10 70`, 'none', 2), '', ' class="poke" data-poke="swing"');
  for (let x = 180; x + 280 <= w - 260; x += 700) {
    d += rect(x, 360, 280, 18, '#C98B5A', 4, 3) + line(x + 40, 378, x + 10, 452, '#A8703F', 8) + line(x + 240, 378, x + 270, 452, '#A8703F', 8)
      + rect(x - 10, 410, 300, 12, '#C98B5A', 4, 3);
    d += line(x + 140, 360, x + 140, 200, INK, 4);
    for (let i = 0; i < 6; i++) d += path(`M ${x + 140} 196 L ${x + 20 + 40 * i} 250 L ${x + 60 + 40 * i} 250 Z`, i % 2 ? WHITE : '#4FA3E0', 2.4);
    d += g(rect(x + 40, 320, 30, 40, '#FFF3A6', 6, 2.6) + rect(x + 44, 330, 22, 26, '#FFE066', 4, 0), '', ' class="poke" data-poke="cup"') + picTeacup(x + 200, 358);
  }
  return s + g(d, '', ' opacity="0.92"');
}
