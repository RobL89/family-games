// Hamster Highway step 14: three candidate backdrops for the duck pond (levels 21 and 22), for Rob to pick from
// (project rules: mock-ups before building anything judged by eye). Version 0.2 (18 Nov). Changes at 0.2: B's and C's pond side raised so it shows above the banks. Not part of the game:
// mock_hamster_step14.py appends these function declarations to a scratch copy of art.js, where art.js's own helpers
// (rect, circle, ellipse, path, line, g, place, duck, star, heart and the colours) are in scope, and draws each
// behind a stand-in 9 x 16 board in the real game. The one Rob picks is copied into art.js by script, not retyped.
// Each is drawn 540 tall (9 rows of 60, assessment-tall-boards-signpost.md 0.2, section 1) and w wide; sunny all the
// way (D-189 park B). Cute details carry class "poke" and a data-poke name (D-141), using style.css's animations.

const PH = 540;

function pondSky(w, sunX) {
  let s = ['#BFE6FA', '#CDEBFA', '#DBF1FB', '#E7F6FC'].map((c, i) => rect(0, i * 96, w, 98, c, 0, 0)).join('');
  let d = g(circle(sunX, 74, 34, SUN, 3) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i * Math.PI) / 4;
    return line(sunX + 42 * Math.cos(a), 74 + 42 * Math.sin(a), sunX + 54 * Math.cos(a), 74 + 54 * Math.sin(a), '#F0A51C', 4);
  }).join('') + circle(sunX - 10, 68, 3.2, INK, 0) + circle(sunX + 10, 68, 3.2, INK, 0) + path(`M ${sunX - 10} 84 q 10 8 20 0`, 'none', 2.6), '', ' class="poke" data-poke="sun"');
  for (let x = sunX + 260; x < w; x += 440) {
    d += g(g(ellipse(x, 66, 48, 20, WHITE, 2.4, '#B9D6E6') + ellipse(x + 30, 56, 30, 18, WHITE, 0) + ellipse(x - 26, 58, 24, 14, WHITE, 0), '', ' class="cloud"'), '', ' class="poke" data-poke="cloud"');
  }
  return [s, d];
}

function bulrush(x, y, k = 1) {
  return path(`M ${x} ${y} q ${-4 * k} -50 ${2 * k} -96`, 'none', 3, '#3E9B4F') + rect(x - 4 + 2 * k, y - 120, 9, 30, '#8B5A3C', 4, 2)
    + path(`M ${x + 3} ${y} q 14 -30 20 -60`, 'none', 3, '#4FAE5A');
}

function lily(x, y, flower) {
  return path(`M ${x} ${y} m -26 0 a 26 9 0 1 0 52 0 a 26 9 0 1 0 -52 0 M ${x} ${y} l 22 -5`, LEAF, 2.2)
    + (flower ? g(ellipse(x - 6, y - 8, 6, 10, PINK, 1.6, INK, -30) + ellipse(x + 6, y - 8, 6, 10, PINK, 1.6, INK, 30) + ellipse(x, y - 10, 6, 11, '#FFC2D3', 1.6), '', ' class="poke" data-poke="lily"') : '');
}

// A: a willow and reeds. The far bank low across the back, a big willow on the right whose fronds sway, bulrushes,
// lily pads with a frog, a dragonfly.
function pondA(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky;
  d += path(`M 0 400 Q ${w * 0.3} 370 ${w * 0.55} 392 T ${w} 384 L ${w} ${PH} L 0 ${PH} Z`, '#CDEFB9', 0, 'none');
  d += path(`M 0 400 Q ${w * 0.3} 370 ${w * 0.55} 392 T ${w} 384`, 'none', 3, '#8FC97A');
  d += rect(0, 448, w, PH - 448, '#BFE8F8', 0, 0) + line(0, 448, w, 448, '#8FCBE3', 3);
  for (let x = 40; x < w; x += 150) d += path(`M ${x} 480 q 15 -6 30 0 t 30 0`, 'none', 2, '#8FCBE3');
  for (let x = 120; x < w - 300; x += 330) d += g(circle(x, 378, 40, '#9ED98A', 2.4, '#6FB35A') + circle(x + 44, 386, 30, '#A9DE94', 2.4, '#6FB35A'), '', '');
  const tx = w - 200;
  let willow = path(`M ${tx - 34} 452 Q ${tx - 20} 330 ${tx - 26} 200 L ${tx + 26} 200 Q ${tx + 20} 330 ${tx + 34} 452 Z`, '#8B5A3C', 3);
  willow += [[-110, 170, 90], [0, 130, 110], [110, 170, 90]].map(([dx, y, r]) => circle(tx + dx, y, r, '#8FD46E', 3)).join('');
  let fronds = '';
  for (let x = tx - 190; x <= tx + 190; x += 18) fronds += path(`M ${x} ${190 + Math.abs(x - tx) * 0.2} q 8 90 -2 ${190 - Math.abs(x - tx) * 0.25}`, 'none', 3, '#62C46F');
  willow += g(fronds, '', ' class="poke swing" data-poke="willow"');
  d += willow;
  d += [60, 74, 92].map((x, i) => bulrush(x, 452, i % 2 ? -1 : 1)).join('') + [w - 420, w - 404].map((x, i) => bulrush(x, 452, i ? 1 : -1)).join('');
  d += lily(260, 470, true) + lily(w * 0.5, 492, false) + lily(w * 0.5 + 90, 476, true);
  d += g(ellipse(w * 0.5, 480, 14, 10, '#7DC95E', 2.2) + circle(w * 0.5 - 6, 470, 5, WHITE, 1.8) + circle(w * 0.5 + 6, 470, 5, WHITE, 1.8)
    + circle(w * 0.5 - 5, 470, 2, INK, 0) + circle(w * 0.5 + 7, 470, 2, INK, 0) + path(`M ${w * 0.5 - 7} 482 q 7 4 14 0`, 'none', 1.6), '', ' class="poke frog" data-poke="frog"');
  const fx = Math.round(w * 0.38);
  d += g(line(fx - 18, 300, fx + 18, 300, '#3A86C8', 4) + g(ellipse(fx - 4, 292, 12, 5, '#BFE6FF', 1.4, '#3A86C8') + ellipse(fx + 6, 292, 12, 5, '#BFE6FF', 1.4, '#3A86C8'), '', ' class="flutter"')
    + circle(fx + 20, 300, 4, '#3A86C8', 0), '', ' class="poke" data-poke="dragonfly"');
  return s + g(d, '', ' opacity="0.92"');
}

// B: a jetty and a duck house. Green hills at the back, a wooden jetty out from the left, a little duck house on a
// post standing in the water (a duck peeks out), water lilies, a paper boat that bobs.
function pondB(w) {
  const [s, sky] = pondSky(w, w - 110);
  let d = '';
  d += path(`M 0 360 Q ${w * 0.18} 300 ${w * 0.36} 350 Q ${w * 0.6} 290 ${w * 0.82} 345 Q ${w * 0.92} 320 ${w} 340 L ${w} ${PH} L 0 ${PH} Z`, '#B8E6A0', 3, '#8FC97A');
  d += path(`M 0 410 Q ${w * 0.4} 380 ${w} 404 L ${w} ${PH} L 0 ${PH} Z`, '#CDEFB9', 0, 'none');
  for (let x = 70; x < w; x += 210) d += g(line(x, 360, x, 330, '#8B5A3C', 4) + circle(x, 318, 18, '#7DC95E', 2.4), '', '');
  d += rect(0, 440, w, PH - 440, '#BFE8F8', 0, 0) + line(0, 440, w, 440, '#8FCBE3', 3);
  for (let x = 70; x < w; x += 170) d += path(`M ${x} 474 q 15 -6 30 0 t 30 0`, 'none', 2, '#8FCBE3');
  // the jetty
  d += rect(0, 418, 250, 14, '#C98F57', 2, 3) + [30, 110, 190, 240].map((x) => rect(x, 430, 12, 60, '#A8703F', 2, 2.4)).join('')
    + [40, 80, 120, 160, 200].map((x) => line(x, 420, x, 430, '#8B5A3C', 1.6)).join('');
  // the duck house on its post
  const hx = Math.round(w * 0.62);
  d += rect(hx - 6, 340, 12, 140, '#A8703F', 2, 2.4) + rect(hx - 44, 300, 88, 50, '#FFF8EE', 4, 3) + path(`M ${hx - 54} 304 L ${hx} 262 L ${hx + 54} 304 Z`, CORAL, 3)
    + circle(hx, 328, 14, '#5C4630', 2.4) + rect(hx - 34, 350, 68, 8, '#C98F57', 2, 2.4);
  d += g(place(duck(), hx + 2, 338, 0.7), '', ' class="poke bob" data-poke="duckhouse"');
  d += lily(w * 0.36, 470, true) + lily(w * 0.36 + 70, 486, false) + lily(w - 160, 478, true);
  // a paper boat
  const bx = Math.round(w * 0.82);
  d += g(path(`M ${bx - 26} 456 L ${bx + 26} 456 L ${bx + 16} 470 L ${bx - 16} 470 Z`, WHITE, 2.2) + path(`M ${bx - 14} 456 L ${bx} 428 L ${bx + 14} 456 Z`, '#FFF3B0', 2.2), '', ' class="poke bob" data-poke="boat"');
  // raised 80 so the pond's far side shows above the level's banks (a 9-row board's banks start at y 360)
  d = sky + rect(0, 360, w, PH - 360, '#BFE8F8', 0, 0) + g(d, 'translate(0 -80)');
  return s + g(d, '', ' opacity="0.92"');
}

// C: a little footbridge and a fountain. Trees at the back, a red arched footbridge far off over the water, a round
// stone fountain whose spray twinkles, a mother duck and three ducklings in a line.
function pondC(w) {
  const [s, sky] = pondSky(w, 90);
  let d = '';
  d += rect(0, 380, w, PH - 380, '#CDEFB9', 0, 0) + line(0, 380, w, 380, '#8FC97A', 3);
  for (let x = 220; x < w; x += 260) d += g(rect(x - 8, 300, 16, 84, '#8B5A3C', 3, 2.4) + circle(x, 280, 54, '#8FD46E', 3) + circle(x - 22, 268, 16, '#A9DE94', 0), '', '');
  d += rect(0, 432, w, PH - 432, '#BFE8F8', 0, 0) + line(0, 432, w, 432, '#8FCBE3', 3);
  for (let x = 30; x < w; x += 160) d += path(`M ${x} 468 q 15 -6 30 0 t 30 0`, 'none', 2, '#8FCBE3');
  // the footbridge
  const bx = Math.round(w * 0.3);
  d += path(`M ${bx - 110} 436 Q ${bx} 360 ${bx + 110} 436`, 'none', 16, INK) + path(`M ${bx - 110} 436 Q ${bx} 360 ${bx + 110} 436`, 'none', 10, '#E8505B')
    + [-80, -40, 0, 40, 80].map((dx) => line(bx + dx, 436 - 76 * (1 - (dx / 110) ** 2) + 4, bx + dx, 436 - 76 * (1 - (dx / 110) ** 2) - 26, INK, 3)).join('')
    + path(`M ${bx - 96} ${410} Q ${bx} 330 ${bx + 96} 410`, 'none', 3, INK);
  // the fountain
  const fx = Math.round(w * 0.7);
  d += ellipse(fx, 446, 70, 16, '#D6D9E3', 3) + rect(fx - 12, 380, 24, 64, '#D6D9E3', 4, 3) + ellipse(fx, 382, 34, 9, '#D6D9E3', 3);
  d += g([[-30, 330], [0, 310], [30, 330], [-16, 300], [16, 300]].map(([dx, y]) => ellipse(fx + dx, y, 5, 8, '#BFE6FA', 2, '#5FA8C9')).join('')
    + path(`M ${fx} 380 q -10 -60 -36 -46 M ${fx} 380 q 10 -60 36 -46 M ${fx} 380 l 0 -70`, 'none', 3, '#5FA8C9'), '', ' class="poke twinkle" data-poke="fountain"');
  // ducks in a line
  const dx0 = Math.round(w * 0.46);
  d += g(place(duck(), dx0, 476, 1) + [1, 2, 3].map((i) => place(duck(), dx0 - 40 - 28 * i, 476, 0.6)).join(''), '', ' class="poke bob" data-poke="ducklings"');
  d += lily(60, 484, true) + lily(w - 120, 488, true);
  // raised 70 so the pond's far side shows above the level's banks (a 9-row board's banks start at y 360)
  d = sky + rect(0, 360, w, PH - 360, '#BFE8F8', 0, 0) + g(d, 'translate(0 -70)');
  return s + g(d, '', ' opacity="0.92"');
}
