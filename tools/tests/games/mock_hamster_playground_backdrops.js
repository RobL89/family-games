// Hamster Highway step 17: two candidate backdrops for the playground (levels 27 and 28), made while Rob couldn't test
// (he asked for more levels, 21 Nov): Claude builds on its pick, A, marked proposed, for Rob to confirm or swap.
// Version 0.1 (21 Nov). Not part of the game: mock_hamster_step17.py appends these to a scratch copy of art.js (1.11),
// where its helpers, the park's sky (pondSky) and hill (frameHill, frameBush) and the picnic's tree (picTree) are in
// scope, and draws each behind a stand-in board in the real game. Each is 540 tall and w wide, sunny like the park.

const PLAY_BLUE = '#4FA3E0';

function playSwing(x) {
  return line(x - 70, 452, x - 40, 170, PLAY_BLUE, 9) + line(x + 70, 452, x + 40, 170, PLAY_BLUE, 9) + line(x - 46, 170, x + 46, 170, PLAY_BLUE, 9)
    + g(line(x - 14, 172, x - 14, 340, INK, 2.4) + line(x + 14, 172, x + 14, 340, INK, 2.4) + rect(x - 22, 338, 44, 10, CORAL, 4, 2.6), '', ' class="poke" data-poke="swing"');
}

function playSlide(x) {
  return rect(x - 8, 220, 12, 232, CORAL, 3, 2.6) + rect(x + 52, 220, 12, 232, CORAL, 3, 2.6) + rect(x - 14, 214, 84, 14, SUN, 5, 2.6)
    + [260, 300, 340, 380, 420].map((y) => line(x - 2, y, x + 58, y, CORAL, 5)).join('')
    + path(`M ${x + 64} 222 Q ${x + 150} 250 ${x + 210} 440 L ${x + 236} 440 Q ${x + 176} 236 ${x + 70} 204 Z`, SUN, 2.6);
}

// A: a swing set and a red and yellow slide, a ball in the grass, a bird on the swing's top bar.
function playgroundA(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 480) d += frameBush(x, 448);
  for (let x = 230; x + 160 <= w + 40; x += 620) d += playSwing(x) + playSlide(x + 180);
  d += g(circle(140, 438, 16, CORAL, 2.6) + path('M 124 438 Q 140 430 156 438', 'none', 2.4, WHITE), '', ' class="poke" data-poke="cup"')
    + g(ellipse(232, 162, 13, 10, '#A9744F', 2.2) + circle(242, 150, 7, '#A9744F', 2.2) + circle(244, 148, 1.6, INK, 0) + path('M 248 150 l 6 2 l -6 2 Z', SUN, 1.2), '', ' class="poke" data-poke="bird"');
  return s + g(d, '', ' opacity="0.92"');
}

// B: a roundabout and a springy rocking horse, a sandcastle bucket, a tree with a kite.
function playgroundB(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 520; x < w; x += 520) d += frameBush(x, 448);
  d += picTree(w - 160);
  for (let x = 220; x + 300 <= w - 200; x += 700) {
    d += g(ellipse(x, 430, 90, 18, PLAY_BLUE, 3) + line(x, 430, x, 360, INK, 4) + [-60, -20, 20, 60].map((dx) => line(x + dx, 424, x, 364, SUN, 4)).join('') + circle(x, 360, 8, CORAL, 2.4), '', ' class="poke" data-poke="swing"');
    d += path(`M ${x + 220} 452 q -10 -20 4 -40 q 14 20 4 40 Z`, '#8B5A3C', 2) + g(ellipse(x + 230, 380, 40, 22, CORAL, 3) + circle(x + 266, 356, 14, CORAL, 3) + circle(x + 270, 352, 2, INK, 0), '', ' class="poke" data-poke="cup"');
  }
  return s + g(d, '', ' opacity="0.92"');
}
