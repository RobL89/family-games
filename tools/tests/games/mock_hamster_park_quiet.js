// Hamster Highway: the picnic's and the playground's backdrops faded to 40%, as the climbing frame's look Q1 (D-211),
// version 0.1, 23 Nov (feedback item 13, D-219: make the backgrounds of levels 26 to 28 transparent; level 25 shares
// the picnic's). Not loaded by the game: mock_hamster_step17c_levels.py appends this file to a scratch copy of art.js
// 1.12, so it uses art.js's own helpers and constants (g, path, line, rect, circle, ellipse, pondSky, frameHill,
// frameBush, picTree, picBunting, picTeacup, playSwing, playSlide, PRED, SUN, CORAL, INK, WHITE).
// The shapes, colours, outlines and places are art.js's picnicArt (look A, D-214) and playgroundArt (look A, D-209),
// unchanged; only the big things behind the floors go into a group at 40% opacity, as frameQ1 does with the frame:
//   picnicQ1      the tree, the bunting, the blankets and their teapots and cups at 40%; the sky, the hill, the bushes
//                 and the robin as now;
//   playgroundQ1  the swings and the slides at 40%; the sky, the hill, the bushes, the ball and the bird as now.
const PARK_QUIET = 0.4;

function picnicQ1(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 460) d += frameBush(x, 448);
  const tx = w - 170;
  let busy = picTree(tx) + picBunting(tx - 520, tx - 60, 200);
  for (let x = 160; x + 300 <= w + 40; x += 640) {
    busy += path(`M ${x} 452 L ${x + 300} 452 L ${x + 270} 420 L ${x + 30} 420 Z`, PRED, 3);
    for (let i = 1; i < 6; i++) busy += line(x + 30 + 48 * i - 6, 420, x + 48 * i - 6, 452, WHITE, 6, ' opacity="0.7"');
    busy += line(x + 15, 436, x + 285, 436, WHITE, 6, ' opacity="0.7"');
    busy += g(ellipse(x + 90, 410, 26, 20, '#9FD3F5', 2.6) + path(`M ${x + 114} 404 q 18 -6 16 -20`, 'none', 4) + rect(x + 82, 384, 16, 8, '#9FD3F5', 3, 2.4), '', ' class="poke" data-poke="cup"')
      + picTeacup(x + 160, 418) + picTeacup(x + 210, 420);
  }
  d += g(busy, '', ` opacity="${PARK_QUIET}" data-quiet="picnic"`);
  d += g(ellipse(260, 440, 14, 11, '#A9744F', 2.2) + ellipse(263, 443, 8, 6, CORAL, 0) + circle(272, 428, 8, '#A9744F', 2.2) + circle(275, 426, 1.8, INK, 0)
    + path('M 279 428 l 6 2 l -6 2 Z', SUN, 1.4), '', ' class="poke" data-poke="bird"');
  return s + g(d, '', ' opacity="0.92"');
}

function playgroundQ1(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 480) d += frameBush(x, 448);
  let busy = '';
  for (let x = 230; x + 160 <= w + 40; x += 620) busy += playSwing(x) + playSlide(x + 180);
  d += g(busy, '', ` opacity="${PARK_QUIET}" data-quiet="playground"`);
  d += g(circle(140, 438, 16, CORAL, 2.6) + path('M 124 438 Q 140 430 156 438', 'none', 2.4, WHITE), '', ' class="poke" data-poke="cup"')
    + g(ellipse(232, 162, 13, 10, '#A9744F', 2.2) + circle(242, 150, 7, '#A9744F', 2.2) + circle(244, 148, 1.6, INK, 0) + path('M 248 150 l 6 2 l -6 2 Z', SUN, 1.2), '', ' class="poke" data-poke="bird"');
  return s + g(d, '', ' opacity="0.92"');
}
