// Hamster Highway's second level picker: the park over the garden fence (D-187), for levels 21 to 30. Version 1.0.
//
// Step 14 (D-189 B, D-202): a wide picture like the house view (PARK_W x PARK_H, the same size, so the picker's
// scroll and sizing are the house's), sunny all the way: the garden's corner with its fence and the treehouse at the
// left, where the zip-line comes down from (ZIP_TOP to ZIP_FOOT), then the duck pond with its island and willow, the
// climbing frame, the picnic, the playground and the fair. Drawn from the step 12 sketch's look B
// (tools/tests/games/sketch_hamster_park.py 0.2, park('B')), with cute details that answer a tap (D-141).
// Its ten stops are PLAN's, in route order, 21 to 30 in pairs, with bends (via) between; a level's stop takes its
// place's name as its `spot` (levels.js). A place with no level yet shows softly, as the house's do. house.js's marker()
// draws a level's stop, so the park's look the same. Pure: it only builds SVG text.

import { INK, WHITE, SUN, CORAL, PINK, path, circle, ellipse, rect, line, g, place, hamster, duck } from './art.js';
import { marker } from './house.js';

export const PARK_W = 2420;
export const PARK_H = 900;
const GROUND = 780;
const TWIG = '#8B5A3C';
const WOOD = '#C98F57';
const BROWN = '#C48A4C';
const MUTED = '#B5824E';
export const ZIP_TOP = [262, 270];    // where the ride's line leaves the treehouse
export const ZIP_FOOT = [560, 640];   // its post by the pond, where the ride ends

// The park's places in route order (the sketch's), each pair's second named with a 2, and the bends between.
export const PLAN = [
  { name: 'pond', at: [620, 700] },
  { name: 'pond2', at: [740, 660] },
  { name: 'frame', at: [1030, 690], via: [[880, 640]] },
  { name: 'frame2', at: [1140, 580] },
  { name: 'picnic', at: [1450, 650], via: [[1360, 560]] },
  { name: 'picnic2', at: [1620, 640] },
  { name: 'playground', at: [1900, 650], via: [[1780, 620]] },
  { name: 'playground2', at: [2010, 496] },
  { name: 'fair', at: [2180, 570], via: [[2120, 500]] },
  { name: 'fair2', at: [2210, 360] },
];
export const SPOTS = Object.fromEntries(PLAN.map((p) => [p.name, p.at]));

function sky() {
  let s = ['#BFE6FA', '#CDEBFA', '#DBF1FB', '#E7F6FC'].map((c, i) => rect(0, (i * GROUND) / 4, PARK_W, GROUND / 4 + 1, c, 0, 0)).join('');
  s += g(circle(2250, 110, 40, SUN, 3) + circle(2238, 104, 3.4, INK, 0) + circle(2262, 104, 3.4, INK, 0) + path('M 2238 120 q 12 9 24 0', 'none', 2.6), '', ' class="poke" data-poke="sun"');
  for (const x of [700, 1500]) {
    s += g(g(ellipse(x, 120, 56, 22, WHITE, 2.4, '#B9D6E6') + ellipse(x + 34, 108, 34, 20, WHITE, 0) + ellipse(x - 30, 110, 28, 16, WHITE, 0), '', ' class="cloud"'), '', ' class="poke" data-poke="cloud"');
  }
  s += rect(0, GROUND, PARK_W, PARK_H - GROUND, '#A7DB86', 0, 0) + line(0, GROUND, PARK_W, GROUND, '#6FB35A', 4) + rect(0, GROUND + 60, PARK_W, PARK_H - GROUND - 60, '#C9935F', 0, 0);
  return s;
}

// the garden's corner: its fence and the treehouse, and the zip-line down to its post by the pond
function corner() {
  let s = '';
  for (let x = 0; x < 300; x += 34) s += path(`M ${x} ${GROUND} L ${x} ${GROUND - 72} L ${x + 12} ${GROUND - 84} L ${x + 24} ${GROUND - 72} L ${x + 24} ${GROUND} Z`, '#F6E3C6', 2.4);
  s += rect(0, GROUND - 56, 300, 10, '#E2C9A0', 0, 2) + rect(0, GROUND - 26, 300, 10, '#E2C9A0', 0, 2);
  s += path(`M 90 ${GROUND} Q 110 500 104 300 L 176 300 Q 170 500 190 ${GROUND} Z`, TWIG, 3);
  s += [[60, 200, 90], [170, 160, 110], [270, 220, 80]].map(([x, y, r]) => circle(x, y, r, '#7DC95E', 3)).join('');
  s += rect(30, 230, 230, 76, '#E7B26F', 6, 3) + path('M 16 236 L 145 196 L 274 236 Z', '#E8505B', 3) + rect(170, 248, 40, 34, '#BFE6F7', 4, 3);
  s += line(ZIP_TOP[0], ZIP_TOP[1], ZIP_FOOT[0], ZIP_FOOT[1], TWIG, 4) + rect(ZIP_FOOT[0] - 12, ZIP_FOOT[1] - 4, 22, GROUND - ZIP_FOOT[1] + 4, WOOD, 3, 3);
  return s;
}

// the duck pond (levels 21 and 22), its island and the willow
function pond() {
  let s = ellipse(760, GROUND + 14, 220, 40, '#7FD3F7', 3) + ellipse(780, GROUND + 6, 44, 14, '#8FD46E', 2.4);
  s += g(place(g(duck(), '', ' class="bob"'), 680, GROUND + 22, 1.1), '', ' class="poke duck" data-poke="duck"');
  s += g(place(g(duck(), '', ' class="bob"'), 860, GROUND + 26, 1), '', ' class="poke duck" data-poke="duck"');
  s += [600, 612, 624].map((x) => path(`M ${x} ${GROUND} q 2 -40 -6 -60`, 'none', 3, '#3E9B4F')).join('');
  s += path(`M 880 ${GROUND} L 886 520 L 910 520 L 916 ${GROUND} Z`, TWIG, 3) + circle(900, 500, 80, '#8FD46E', 3);
  let fronds = '';
  for (let x = 832; x < 980; x += 16) fronds += path(`M ${x} 520 q 6 80 -4 160`, 'none', 3, '#62C46F');
  return s + g(fronds, '', ' class="poke" data-poke="willow"');
}

// the climbing frame, the picnic, the playground and the fair (levels 23 to 30, drawn now, built later)
function rest() {
  let s = '';
  for (const x of [1090, 1190, 1290]) s += rect(x - 7, 470, 14, GROUND - 470, '#E8505B', 4, 3);
  for (const y of [540, 620, 700]) s += rect(1083, y - 6, 214, 12, SUN, 6, 3);
  s += rect(1290, 464, 150, 12, SUN, 6, 3) + rect(1433, 464, 14, GROUND - 464, '#E8505B', 4, 3);
  for (let x = 1310; x < 1440; x += 24) s += line(x, 476, x, 490, INK, 3);
  s += path(`M 1480 ${GROUND + 8} L 1820 ${GROUND + 8} L 1790 ${GROUND - 22} L 1510 ${GROUND - 22} Z`, CORAL, 3);
  for (let x = 1500; x < 1800; x += 36) s += line(x, GROUND + 8, x + 12, GROUND - 22, WHITE, 6, ' opacity="0.7"');
  s += rect(1680, GROUND - 90, 90, 70, '#D9A066', 8, 3) + path(`M 1690 ${GROUND - 90} Q 1725 ${GROUND - 130} 1760 ${GROUND - 90}`, 'none', 5, TWIG);
  s += ['#F6E3C6', '#62C46F', '#F6E3C6', '#FF9BB3'].map((c, i) => rect(1580, GROUND - 40 - 14 * i, 60, 12, c, 3, 2.4)).join('');
  s += rect(1528, GROUND - 120, 6, 98, '#CFD8E6', 2, 2) + ellipse(1531, GROUND - 24, 30, 6, '#CFD8E6', 2.4) + rect(1508, GROUND - 76, 46, 30, PINK, 6, 2.6) + circle(1531, GROUND - 82, 6, CORAL, 2);
  s += rect(1990, 560, 14, GROUND - 560, WOOD, 3, 3) + rect(2030, 560, 14, GROUND - 560, WOOD, 3, 3);
  for (let y = 600; y < 780; y += 30) s += line(1997, y, 2037, y, INK, 3);
  const slide = `M 2050 556 Q 2100 560 2120 680 Q 2140 ${GROUND - 10} 2200 ${GROUND - 6}`;
  s += rect(1984, 548, 70, 14, WOOD, 4, 3) + path(slide, 'none', 24, INK) + path(slide, 'none', 17, '#7FB3E8');
  s += path(`M 1870 ${GROUND} L 1886 ${GROUND - 30} L 1902 ${GROUND} Z`, '#E8505B', 3) + g(rect(1830, GROUND - 40, 112, 10, WOOD, 4, 2.6), `rotate(-12 1886 ${GROUND - 34})`);
  s += path(`M 2290 ${GROUND} L 2310 380 L 2370 380 L 2390 ${GROUND} Z`, '#FFF8EE', 3);
  for (let y = 470; y < 780; y += 100) s += path(`M 2296 ${y} L 2384 ${y - 40}`, 'none', 14, INK) + path(`M 2296 ${y} L 2384 ${y - 40}`, 'none', 9, CORAL);
  s += path('M 2296 380 L 2340 300 L 2384 380 Z', '#E8505B', 3) + line(2340, 300, 2340, 268, INK, 3) + path('M 2340 268 l 22 7 l -22 7 z', SUN, 2);
  let lant = '';
  [2260, 2300, 2340, 2380].forEach((x, i) => {
    const y = 440 + 30 * Math.sin(i * 0.9);
    lant += ellipse(x, y + 14, 11, 14, [CORAL, SUN, '#5FE3BD', '#B9A7FF'][i], 2.4);
  });
  s += path('M 2240 430 Q 2330 480 2420 430', 'none', 2, INK) + lant;
  s += path(`M 2150 ${GROUND} L 2150 690 L 2210 640 L 2270 690 L 2270 ${GROUND} Z`, '#FFF8EE', 3);
  for (const x of [2170, 2210, 2250]) s += path(`M ${x} ${GROUND} L ${x} 690`, 'none', 10, CORAL, ' opacity="0.8"');
  return s + g(path('M 0 0 q -10 -12 -4 -16 q 6 0 4 10 q 6 -8 12 -4 q 2 8 -12 10', '#FFB3C7', 1.6), 'translate(1240 420)', ' class="flutter"');
}

// The dotted path's points: from the zip-line's foot through the places in order, up to the next place after the last
// with a level.
export function parkPath(state) {
  const built = new Set(state.levels.map((l) => l.spot));
  const route = [{ at: ZIP_FOOT, place: true }];
  let last = 0;
  for (const p of PLAN) {
    for (const v of p.via || []) route.push({ at: v, place: false });
    route.push({ at: p.at, place: true });
    if (built.has(p.name)) last = route.length - 1;
  }
  let end = last + 1;
  while (end < route.length && !route[end].place) end++;
  return route.slice(0, end + 1).map((x) => x.at);
}

// state: { levels: [{ spot, i, open, done, seed }] (the park's levels, i their index in levels.js), current: the
// index of the level the hamster sits on }.
export function parkScene(state) {
  let s = sky() + rest() + pond() + corner();
  const built = new Set(state.levels.map((l) => l.spot));
  const pts = parkPath(state);
  s += path(`M ${pts.map(([x, y]) => `${x} ${y}`).join(' L ')}`, 'none', 4, MUTED, ' stroke-dasharray="2 12" opacity="0.4"');
  s += PLAN.filter((p) => !built.has(p.name)).map((p, k) => g(circle(p.at[0], p.at[1], 56, 'rgba(0,0,0,0)', 0, 'none')
    + circle(p.at[0], p.at[1], 24, 'rgba(255,248,238,0.5)', 3, BROWN, ' stroke-dasharray="6 6" stroke-opacity="0.4"'), '', ` class="poke future" data-poke="future" data-future="p${k}"`)).join('');
  s += state.levels.map((l) => marker(SPOTS[l.spot][0], SPOTS[l.spot][1], l.i, { ...l, current: l.i === state.current })).join('');
  return s;
}

// A hamster riding the zip-line down from the treehouse (D-202): the zip-line gadget's pose, hanging from its cotton
// reel, the reel's middle at 0,0 (on the line); game.js slides it from ZIP_TOP to ZIP_FOOT.
export function rideArt() {
  return place(hamster('zip'), -8 * 0.56, 92 * 0.56, 0.56);
}
