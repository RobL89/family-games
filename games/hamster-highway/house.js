// Hamster Highway's level picker: a cross-section of a house and garden (D-140), and the title card. Version 1.5.
//
// Changes at v1.5 (step 4): level 8 at the veg patch, PLAN's place for it; a built level keeps its plan place's
// bends in the dotted path, so the way to the veg patch still goes over the roof and down the drainpipe.
//
// Changes at v1.4 (step 3, D-154): levels 6 (the bath) and 7 (the loft's rafters) are built, so their places are
// SPOTS at PLAN's own places; a PLAN place shows softly only while no level sits there.
//
// Changes at v1.3 (D-151, plan A of tools/tests/games/sketch_hamster_house_routes.py 0.1): every stop is planned.
// After the bedroom the route goes left to the bath (6), up into a loft under the roof (7, and a later place by
// the suitcases), over the roof and down the drainpipe to the veg patch (8), the shed (9), the pond (later) and
// the treehouse (10). PLAN holds it; the soft places are PLAN's; the loft and drainpipe are drawn, simply, for now.
//
// Changes at v1.2 (Rob's look at preview 2, D-150): the path through the levels never doubles back: the bedroom
// is drawn upstairs on the right, above the living room, and the bathroom on the left, so the levels run
// kitchen, pantry, living room, up to the bedroom, and out to the garden.
//
// Changes at v1.1 (step 2, D-145): level 4 by the living room's bookshelf (a hamster floats down to the sofa on a
// dandelion) and level 5 at the bedroom's hamster cage (up its tube); both rooms drawn in full now. Five soft
// places are left for levels 6 to 10.
//
// Each level sits in a place drawn like its level (the kitchen sink for level 1, the bread bin step for
// level 2, the pantry's tins and marshmallow for level 3). The other rooms and the garden wait for later
// levels; their places are drawn softly, without numbers. Markers are soft, in the theme's colours (D-140).
// Cute details that move or answer a tap carry class "poke" and a data-poke name (game.js, D-141).
// Pure: it only builds SVG text.

import { INK, WHITE, SUN, FUR, PINK, SEED, LEAF, CORAL, path, circle, ellipse, rect, line, text, g, place, star, heart, hamster, seedArt, duck, uid } from './art.js';

export const HOUSE_W = 2420;
export const HOUSE_H = 900;
const GROUND = 780;

// Where each level's marker sits, by the `spot` levels.js gives it.
export const SPOTS = { sink: [282, 650], breadbin: [530, 632], tins: [772, 668], bookshelf: [1100, 560], cage: [1102, 300], bath: [300, 360], rafters: [430, 150], veg: [1480, 712] };
// The plan for the stops after level 5 (D-151), in route order: name, place, the level planned there (null: kept
// for a level after v1), and any bends before it. Levels 6 to 10 follow D-145. Drawn softly without numbers until
// a level's spot takes the place's name; test_hamster_highway_core.py checks the whole route never crosses itself.
export const PLAN = [
  { name: 'bath', at: [300, 360], level: 6 },
  { name: 'rafters', at: [430, 150], level: 7 },
  { name: 'suitcases', at: [860, 150], level: null },
  { name: 'veg', at: [1480, 712], level: 8, via: [[1240, 150], [1300, 220], [1300, 700]] },
  { name: 'shed', at: [1862, 560], level: 9 },
  { name: 'pond', at: [2100, 724], level: null },
  { name: 'treehouse', at: [2322, 352], level: 10 },
];
export const FUTURE = PLAN.map((p) => p.at);

const KITCH = '#FFE9C7';
const WOOD = '#E2A867';
const LIP = '#F6D7A7';
const BROWN = '#C48A4C';
const MUTED = '#B5824E';

function miniBlocks(x, y, cols, rows, size = 30) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    s += rect(x + c * size, y + r * size, size, size, WOOD, 0, 2);
    if (r === 0) s += rect(x + c * size, y, size, 6, LIP, 0, 2);
  }
  return s;
}
const jarAt = (x, base, h, col, lid = '#E8505B') => g(rect(x, base - h, 24, h, col, 6, 2) + rect(x - 2, base - h - 6, 28, 8, lid, 3, 2), '', ' class="poke jar" data-poke="jar"');
const mini = (x, y, pose = 'walk1', sc = 0.32) => place(hamster(pose), x, y, sc);

function sky() {
  const cols = ['#CDEEFF', '#D9F2FF', '#E6F5FC', '#F1F5EE', '#FBF1DC'];
  let s = cols.map((c, i) => rect(0, (i * GROUND) / cols.length, HOUSE_W, GROUND / cols.length + 1, c, 0, 0)).join('');
  s += g(circle(1500, 120, 52, '#FFE48A', 3) + g(circle(1484, 112, 4, INK, 0) + circle(1516, 112, 4, INK, 0), '', ' class="sun-eyes"')
    + path('M 1482 132 q 18 14 36 0', 'none', 3) + ellipse(1474, 128, 7, 4, PINK, 0, INK, 0, ' opacity="0.6"') + ellipse(1526, 128, 7, 4, PINK, 0, INK, 0, ' opacity="0.6"'),
  '', ' class="poke sun" data-poke="sun"');
  const cloud = (x, y, k) => g(ellipse(x, y, 60 * k, 26 * k, WHITE, 2.4, '#C9D7E8') + ellipse(x - 40 * k, y + 6 * k, 36 * k, 20 * k, WHITE, 0)
    + ellipse(x + 42 * k, y + 8 * k, 34 * k, 18 * k, WHITE, 0) + ellipse(x + 6 * k, y - 18 * k, 34 * k, 22 * k, WHITE, 0), '', ' class="poke cloud" data-poke="cloud"');
  s += cloud(380, 96, 1) + cloud(1880, 150, 0.8) + cloud(2250, 80, 1.1);
  return s;
}

function ground() {
  let s = rect(0, GROUND, HOUSE_W, HOUSE_H - GROUND, '#A7DB86', 0, 0) + line(0, GROUND, HOUSE_W, GROUND, '#6FB35A', 4);
  s += rect(0, GROUND + 60, HOUSE_W, HOUSE_H - GROUND - 60, '#C9935F', 0, 0) + line(0, GROUND + 60, HOUSE_W, GROUND + 60, '#A9733F', 2);
  for (let x = 1290; x < HOUSE_W; x += 70) s += path(`M ${x} ${GROUND} l 4 -12 m 4 12 l 6 -16 m 4 16 l 4 -10`, 'none', 2.4, '#6FB35A');
  const flower = (x, col) => line(x, GROUND, x, GROUND - 22, '#3E9B4F', 2.4) + [0, 72, 144, 216, 288].map((a) => circle(x + 7 * Math.cos((a * Math.PI) / 180), GROUND - 26 + 7 * Math.sin((a * Math.PI) / 180), 5, col, 1.6)).join('') + circle(x, GROUND - 26, 4, SUN, 1.4);
  s += flower(1300, PINK) + flower(1730, '#C9B8FF') + flower(2230, PINK) + flower(1990, WHITE);
  return s;
}

function houseShell() {
  let s = path('M 24 206 L 660 40 L 1296 206 Z', '#E8505B', 4);
  for (let i = 1; i < 5; i++) s += line(24 + i * 127, 206 - (i * 166) / 5, 1296 - i * 127, 206 - (i * 166) / 5, '#C93D48', 2.4);
  s += loft();
  s += rect(980, 70, 60, 100, '#C98F57', 3, 4) + rect(972, 60, 76, 16, '#A8703F', 3, 3);
  s += g([0, 1, 2].map((i) => circle(1010, 46, 14 + i * 4, '#F2EFF7', 2, '#C9C4E6', ` class="puff p${i}"`)).join(''), '', ' class="poke smoke" data-poke="smoke"');
  s += rect(60, 196, 1200, 584, '#F6E3C6', 0, 5);
  return s;
}

// The loft under the roof (D-151): bare boards and rafters, a round window and two old suitcases. Simple for now.
function loft() {
  let s = path('M 130 196 L 660 70 L 1190 196 Z', '#F2D3A6', 3);
  for (let x = 250; x < 1100; x += 120) {
    const top = 196 - (126 * (540 - Math.abs(x - 660))) / 540;
    s += line(x, 196, x, top, '#C98F57', 4);
  }
  s += rect(130, 188, 1060, 10, '#B57A44', 0, 2.4);
  s += circle(660, 130, 22, '#CDEEFF', 4, WHITE) + line(660, 108, 660, 152, WHITE, 3) + line(638, 130, 682, 130, WHITE, 3);
  s += rect(800, 156, 64, 32, '#C9B8FF', 6, 2.4) + rect(822, 150, 20, 8, '#8B5A3C', 3, 1.8) + rect(870, 166, 46, 22, '#FFB3C7', 5, 2.4);
  return g(s, '', ' class="later"');
}

// The gutter and drainpipe down the house's right side (D-151): the way from the roof to the garden.
function drainpipe() {
  return g(rect(1170, 200, 140, 10, '#9AA7C7', 4, 2.4) + rect(1293, 206, 14, 560, '#9AA7C7', 7, 2.4)
    + path('M 1293 760 q 7 14 22 14', 'none', 10, '#9AA7C7') + ellipse(1322, 780, 16, 4, '#BFEAFF', 1.6, '#5FA8C9'), '', ' class="later"');
}

function kitchen() {
  let s = rect(70, 492, 580, 288, KITCH, 0, 0);
  for (let y = 650; y < 770; y += 24) s += line(70, y, 650, y, '#F3C995', 1.4);
  for (let x = 70; x < 650; x += 24) s += line(x, 650, x, 770, '#F3C995', 1.4);
  const sky1 = uid('hsky');
  s += `<defs><linearGradient id="${sky1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A76"/><stop offset="1" stop-color="#FFD36E"/></linearGradient></defs>`;
  s += rect(200, 516, 132, 88, `url(#${sky1})`, 0, 0) + circle(266, 584, 16, '#FFF2B0', 0) + path('M 200 604 Q 240 578 280 592 T 332 588 L 332 604 Z', '#F2A65A', 0);
  s += rect(200, 516, 132, 88, 'none', 3, 7, WHITE) + line(266, 516, 266, 604, WHITE, 5) + line(200, 560, 332, 560, WHITE, 5);
  s += rect(420, 590, 170, 8, BROWN, 3, 2) + jarAt(436, 590, 34, '#FF9BB3') + jarAt(476, 590, 44, '#9FE3CF') + jarAt(520, 590, 30, '#FFE08A');
  // the worktop: level 1's sink and level 2's step (the bread bin)
  s += miniBlocks(70, 710, 6, 2) + miniBlocks(310, 710, 7, 2) + miniBlocks(520, 680, 4, 1) + miniBlocks(520, 710, 4, 2);
  s += rect(250, 742, 60, 28, '#7FD3F7', 0, 0) + g(path('M 250 742 q 15 -5 30 0 t 30 0', 'none', 2.2), '', ' class="wave"');
  s += place(g(g(duck(), '', ' class="bob"'), '', ' class="poke duck" data-poke="duck"'), 282, 744, 0.75);
  s += place('<path d="M 0 0 L 14 0 L 14 -60 Q 14 -74 28 -74 L 44 -74" fill="none" stroke="#C9D3EA" stroke-width="7" stroke-linecap="round"/>', 296, 710);
  s += g(ellipse(66, 692, 8, 18, '#C98F57', 2.4) + rect(66, 674, 46, 36, '#C98F57', 0, 0) + line(66, 674, 112, 674, INK, 2.4)
    + line(66, 710, 112, 710, INK, 2.4) + ellipse(112, 692, 8, 18, '#5A3A22', 2.4), '', ' class="poke tube" data-poke="tube"');
  s += place(g(rect(10, 28, 80, 70, '#E7B26F', 4) + path('M -2 34 L 50 -14 L 102 34 Z', '#E8505B')
    + path('M 34 98 L 34 72 A 16 16 0 0 1 66 72 L 66 98 Z', '#5A3A22')), 590, 640, 0.42);
  return s;
}

function pantry() {
  let s = rect(660, 492, 290, 288, '#F2D3A6', 0, 0);
  for (let x = 680; x < 950; x += 30) s += line(x, 492, x, 780, '#DDB27C', 1.4, ' opacity="0.7"');
  s += rect(670, 556, 270, 8, '#B57A44', 3, 2) + jarAt(684, 556, 34, '#FFD54A', '#7A4A22') + jarAt(718, 556, 42, '#FF9BB3')
    + g(rect(756, 516, 30, 40, '#E8505B', 5, 2) + rect(756, 528, 30, 8, '#FFE6EE', 0, 0), '', ' class="poke tin" data-poke="tin"')
    + g(rect(794, 524, 34, 32, '#5FA8C9', 5, 2) + rect(794, 534, 34, 7, SUN, 0, 0), '', ' class="poke tin" data-poke="tin"') + jarAt(840, 556, 30, '#C9B8FF', '#8B5A3C');
  s += line(905, 492, 905, 528, '#8B5A3C', 2) + [[900, 534], [910, 550], [900, 566]].map(([x, y]) => ellipse(x, y, 8, 9, '#F6E7C8', 2)).join('');
  // level 3 in small: a gap, the marshmallow, the tall stack of tins and the low step
  s += miniBlocks(660, 740, 1, 1) + miniBlocks(720, 740, 3, 1) + miniBlocks(810, 680, 2, 3) + miniBlocks(870, 710, 2, 2);
  s += rect(690, 752, 30, 18, '#7FD3F7', 0, 0);
  s += place(g(rect(20, 50, 60, 48, '#FFE6EE', 16) + ellipse(50, 53, 29, 8, '#FFF6F9', 2.2) + path('M 28 72 q 22 -8 44 0', 'none', 2.2, PINK), '', ' class="poke mallow" data-poke="mallow"'), 750, 704, 0.36);
  s += place(g(seedArt(), '', ' class="twinkle"'), 912, 690, 0.7);
  return s;
}

function living() {
  let s = rect(960, 492, 290, 288, '#E6F1E3', 0, 0) + rect(980, 760, 160, 10, '#C9B8FF', 5, 0);
  s += rect(1150, 506, 90, 264, '#B57A44', 4, 3);
  const books = ['#FF9BB3', '#5FA8C9', SUN, '#9FE3CF', '#C9B8FF', CORAL];
  for (let sh = 0; sh < 4; sh++) {
    const y = 506 + 10 + sh * 64;
    s += rect(1156, y + 50, 78, 6, '#8B5A3C', 0, 0);
    for (let b = 0; b < 5; b++) s += rect(1160 + b * 14, y + 14 + (b % 2) * 6, 12, 36 - (b % 2) * 6, books[(b + sh) % books.length], 2, 1.6);
  }
  s += rect(990, 700, 120, 60, '#FF9BB3', 18, 3) + rect(990, 676, 26, 84, '#FF9BB3', 12, 3) + rect(1084, 676, 26, 84, '#FF9BB3', 12, 3);
  s += g(ellipse(1050, 690, 18, 12, '#F6E7C8', 2) + path('M 1040 682 q 10 -8 20 0', 'none', 1.6), '', ' class="poke cushion" data-poke="cushion"');
  // level 4 in small: a hamster floating down from the top shelf to the sofa on a dandelion clock
  s += g(line(1160, 600, 1160, 624, '#3E9B4F', 2.4) + circle(1160, 592, 13, WHITE, 1.8, '#B9B4D6') + mini(1160, 650, 'float', 0.3), '', ' class="bob"');
  s += place(g(seedArt(), '', ' class="twinkle"'), 1124, 640, 0.6);
  return g(s, '', ' class="room"');
}

function bedroom() {
  let s = rect(70, 206, 580, 274, '#ECE7FF', 0, 0);
  s += rect(110, 236, 90, 70, '#CDEEFF', 3, 5, WHITE) + line(155, 236, 155, 306, WHITE, 4);
  s += rect(90, 410, 230, 50, '#FFB3C7', 10, 3) + rect(90, 380, 40, 80, '#C98F57', 6, 3) + rect(96, 400, 80, 20, WHITE, 8, 2);
  s += rect(380, 436, 250, 12, '#B57A44', 2, 3) + line(400, 448, 400, 478, '#8B5A3C', 5) + line(610, 448, 610, 478, '#8B5A3C', 5);
  s += rect(420, 350, 160, 86, 'rgba(255,255,255,0.4)', 8, 3);
  for (let x = 436; x < 580; x += 16) s += line(x, 352, x, 434, '#9AA7C7', 2);
  s += g(circle(470, 404, 24, 'none', 4, '#5FA8C9') + line(470, 380, 470, 428, '#5FA8C9', 2) + line(446, 404, 494, 404, '#5FA8C9', 2), '', ' class="poke wheel" data-poke="wheel"');
  s += path('M 560 360 C 600 300 520 260 600 240 C 640 230 640 300 620 330', 'none', 16, INK) + path('M 560 360 C 600 300 520 260 600 240 C 640 230 640 300 620 330', 'none', 11, '#A8ECFF');
  s += mini(530, 434, 'walk1', 0.3);
  // level 5 in small: the tube goes up, and a seed waits at its top
  s += place(g(seedArt(), '', ' class="twinkle"'), 636, 236, 0.6);
  return g(s, '', ' class="room"');
}

function bathroom() {
  let s = rect(660, 206, 590, 274, '#DFF3FF', 0, 0);
  for (let y = 330; y < 480; y += 22) s += line(660, y, 1250, y, '#C3E3F5', 1.4);
  s += rect(760, 400, 260, 64, WHITE, 26, 3) + line(780, 464, 774, 478, INK, 4) + line(1000, 464, 1006, 478, INK, 4);
  s += [[800, 396, 16], [830, 388, 22], [866, 394, 16], [900, 386, 20], [940, 394, 16], [975, 390, 18]].map(([x, y, r]) => circle(x, y, r, 'rgba(255,255,255,0.85)', 2, '#9ADBF7')).join('');
  s += place(g(duck(), '', ' class="poke duck" data-poke="duck"'), 1000, 400, 0.8);
  s += rect(1110, 300, 100, 10, '#9AA7C7', 4, 2) + rect(1120, 310, 36, 80, '#FF9BB3', 4, 2) + rect(1162, 310, 36, 66, SUN, 4, 2);
  return g(s, '', ' class="later"');
}

function garden() {
  let s = '';
  for (let x = 1272; x < HOUSE_W; x += 34) s += path(`M ${x} 780 L ${x} 708 L ${x + 12} 696 L ${x + 24} 708 L ${x + 24} 780 Z`, '#F6E3C6', 2.4);
  s += rect(1266, 724, HOUSE_W - 1266, 10, '#E2C9A0', 0, 2) + rect(1266, 754, HOUSE_W - 1266, 10, '#E2C9A0', 0, 2);
  // veg patch
  let veg = '';
  for (let i = 0; i < 6; i++) {
    const x = 1340 + i * 62;
    veg += ellipse(x, 778, 30, 10, '#9A6A3A', 2.4) + path(`M ${x} 770 q -8 -18 -2 -26 m 2 26 q 4 -20 10 -24 m -10 24 q -2 -14 -12 -16`, 'none', 3, '#3E9B4F');
    if (i % 2 === 0) veg += path(`M ${x - 4} 772 L ${x} 790 L ${x + 4} 772 Z`, '#FF9A4C', 1.6);
  }
  s += g(veg, '', ' class="later"');
  s += g(g(path('M 0 0 q -10 -12 -4 -16 q 6 0 4 10 q 6 -8 12 -4 q 2 8 -12 10', '#FFB3C7', 1.6), '', ' class="flutter"'), 'translate(1500 650)');
  s += g(g(path('M 0 0 q -10 -12 -4 -16 q 6 0 4 10 q 6 -8 12 -4 q 2 8 -12 10', '#C9B8FF', 1.6), '', ' class="flutter f2"'), 'translate(1660 610)');
  // shed
  s += g(rect(1770, 610, 180, 170, '#C98F57', 4, 4) + path('M 1754 616 L 1860 548 L 1966 616 Z', '#8B5A3C', 4)
    + rect(1800, 670, 50, 110, '#A8703F', 3, 3) + circle(1840, 726, 4, SUN, 1.6) + rect(1880, 652, 46, 40, '#CDEEFF', 3, 3)
    + line(1903, 652, 1903, 692, INK, 2) + line(1774, 650, 1774, 780, '#A8703F', 2), '', ' class="later"');
  // pond and frog
  s += g(ellipse(2100, 792, 104, 22, '#7FD3F7', 3) + ellipse(2060, 788, 22, 7, LEAF, 2), '', ' class="later"');
  s += g(ellipse(2140, 780, 14, 10, '#7DC95E', 2.2) + circle(2134, 770, 5, WHITE, 1.8) + circle(2146, 770, 5, WHITE, 1.8)
    + circle(2135, 770, 2, INK, 0) + circle(2147, 770, 2, INK, 0) + path('M 2133 782 q 7 4 14 0', 'none', 1.6), '', ' class="poke frog" data-poke="frog"');
  // tree and treehouse, with bunting for the party at the end
  s += g(rect(2300, 380, 44, 400, '#8B5A3C', 8, 4) + circle(2322, 300, 110, '#7DC95E', 4) + circle(2240, 330, 60, '#8FD46E', 3) + circle(2400, 330, 60, '#8FD46E', 3)
    + rect(2250, 392, 150, 14, '#C98F57', 3, 3) + rect(2276, 330, 90, 62, '#E7B26F', 4, 3) + path('M 2268 334 L 2321 290 L 2374 334 Z', '#E8505B', 3)
    + path('M 2252 380 L 2400 360', 'none', 2, INK) + [2264, 2290, 2316, 2342, 2368].map((x, i) => path(`M ${x} ${378 - (x - 2252) * 0.135} l 6 12 l 6 -12 z`, [CORAL, SUN, '#5FE3BD', '#B9A7FF', PINK][i], 1.4)).join(''), '', ' class="later"');
  s += g(ellipse(1300, 690, 14, 11, '#7FB3E8', 2.2) + circle(1308, 684, 7, '#7FB3E8', 2) + circle(1310, 682, 1.6, INK, 0)
    + path('M 1314 684 l 6 2 l -6 2 z', SUN, 1.2) + path('M 1290 690 q -8 -2 -10 -8', 'none', 2.2), '', ' class="poke bird" data-poke="bird"');
  return s;
}

function marker(x, y, i, st) {
  // st: { open, done, seed, current }
  let s = circle(x, y, 56, 'rgba(0,0,0,0)', 0, 'none');
  if (st.current) s += circle(x, y, 38, 'none', 5, SUN, ' class="glow" opacity="0.55"');
  s += circle(x, y, 28, st.done ? '#FFE9C7' : '#FFF8EE', 3, BROWN, ' stroke-opacity="0.55"');
  s += text(x, y + 9, String(i + 1), 26, MUTED);
  if (st.done) s += heart(x + 22, y - 22, 7, '#FFB3C7');
  if (st.seed) s += place(seedArt(), x + 24, y + 18, 0.55);
  return g(s, '', ` class="marker${st.open ? '' : ' locked'}" data-level="${i}"${st.open ? '' : ' opacity="0.5"'}`);
}

// state: { levels: [{ spot, open, done, seed }], current: index of the level the hamster sits on }
export function houseScene(state) {
  // the bedroom (drawn at x 70 to 650) goes upstairs right and the bathroom (660 to 1250) upstairs left (D-150)
  let s = sky() + ground() + houseShell() + rect(655, 206, 600, 274, '#ECE7FF', 0, 0) + g(bedroom(), 'translate(590 0)') + g(bathroom(), 'translate(-590 0)') + kitchen() + pantry() + living();
  s += rect(60, 476, 1200, 16, '#C48A4C', 0, 3) + line(655, 206, 655, 476, INK, 8) + line(655, 492, 655, 780, INK, 8) + line(955, 492, 955, 780, INK, 8);
  s += rect(60, 196, 1200, 584, 'none', 0, 5);
  s += garden() + drainpipe();
  // a soft dotted path through the levels there are, and on to the next place (not across the whole house)
  const built = new Set(state.levels.map((l) => l.spot));
  const later = PLAN.filter((p) => !built.has(p.name));
  const pts = housePath(state);
  s += path(`M ${pts.map(([x, y]) => `${x} ${y}`).join(' L ')}`, 'none', 4, MUTED, ' stroke-dasharray="2 12" opacity="0.4"');
  s += later.map((p) => p.at).map(([x, y], k) => g(circle(x, y, 56, 'rgba(0,0,0,0)', 0, 'none') + circle(x, y, 24, 'rgba(255,248,238,0.5)', 3, BROWN, ' stroke-dasharray="6 6" stroke-opacity="0.4"'),
    '', ` class="poke future" data-poke="future" data-future="${k}"`)).join('');
  s += state.levels.map((l, i) => marker(SPOTS[l.spot][0], SPOTS[l.spot][1], i, { ...l, current: i === state.current })).join('');
  return s;
}

// The dotted path's points: the route (levels 1 to 5's places, then PLAN in its order, with its bends) through the
// levels there are and on to the next place after the last of them.
export function housePath(state) {
  const built = new Set(state.levels.map((l) => l.spot));
  const route = state.levels.filter((l) => !PLAN.some((p) => p.name === l.spot)).map((l) => ({ at: SPOTS[l.spot], place: true }));
  let last = route.length - 1;
  for (const p of PLAN) {
    for (const v of p.via || []) route.push({ at: v, place: false });
    route.push({ at: p.at, place: true });
    if (built.has(p.name)) last = route.length - 1;
  }
  let end = last + 1;
  while (end < route.length && !route[end].place) end++;
  return route.slice(0, end + 1).map((x) => x.at);
}

export function tokenAt(levelSpot) {
  const [x, y] = SPOTS[levelSpot];
  return place(g(hamster('walk1'), '', ' class="bob"'), x, y - 26, 0.42);
}

// The title card, 600 x 340.
export function titleArt() {
  let s = rect(0, 0, 600, 340, '#FFE9C7', 0, 0) + rect(0, 260, 600, 80, '#E2A867', 0, 0) + line(0, 260, 600, 260, INK, 3);
  for (let x = 0; x < 600; x += 40) s += line(x, 260, x, 340, BROWN, 1.6);
  s += line(120, 260, 120, 150, '#8B5A3C', 10) + line(400, 260, 400, 150, '#8B5A3C', 10);
  s += rect(70, 40, 380, 140, '#F3D9A4', 18, 5) + rect(84, 54, 352, 112, 'none', 12, 2.4, BROWN);
  s += text(260, 102, 'Hamster', 50, '#E8823B', ` stroke="${INK}" stroke-width="6" paint-order="stroke" stroke-linejoin="round"`);
  s += text(260, 152, 'Highway', 50, SUN, ` stroke="${INK}" stroke-width="6" paint-order="stroke" stroke-linejoin="round"`);
  s += place(g(g(hamster('home'), '', ' class="bob"'), '', ' class="poke hero" data-poke="hero"'), 510, 256, 1.05);
  s += place(seedArt(), 60, 240, 0.9) + place(seedArt(), 560, 120, 0.7, 20) + star(470, 40, 9) + star(30, 120, 6);
  s += place(g(rect(-6, 0, 212, 22, '#F3D9A4', 11) + line(10, 8, 90, 8, '#D8B47A', 2)), 196, 236, 0.9)
    + place(path('M 2 100 L 100 100 L 100 4 Z', '#FFD54A'), 350, 194, 0.66);
  return s;
}
