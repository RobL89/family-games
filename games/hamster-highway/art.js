// Hamster Highway's drawings, as SVG text. Version 1.1.
//
// Changes at v1.1 (step 2, D-145, D-149): the living room and bedroom backdrops for levels 4 and 5, with
// things that answer a tap (the clock, the lamp, the moon, the star mobile, the wheel); each backdrop sits in a
// group named data-back. Tubes on the board join up with their neighbours (tubePiece).
//
// Original art (D-010), moved from the agreed mock-ups (tools/tests/games/sketch_bridge_builder.py,
// theme A, Hamster Highway, D-133) and drawn the same way: the Nibbles, their five gadgets, the wooden
// blocks, the kitchen backdrop, the cardboard tube and the seed house. New here: the pantry backdrop,
// a hamster peeking from the tube, a rubber duck in the water, golden seeds, and the tray's buttons.
// Pure: it only builds text; game.js puts it on the page (so a test can check it touches nothing else).
//
// A hamster is drawn facing right with its feet at 0,0, about 86 units tall; a gadget fills a square of
// 100 x 100 with the floor at 100; the board's squares are CELL units.

export const CELL = 60;
export const INK = '#1B1446';
export const WHITE = '#FFFFFF';
export const SUN = '#FFC93C';
export const CORAL = '#FF5D73';
export const FUR = '#F4A259';
export const BELLY = '#FFF3DC';
export const PINK = '#FF9BB3';
export const SEED = '#FFD45E';
export const LEAF = '#62C46F';
const LW = 3;

let uidCount = 0;
export const uid = (p) => `${p}${++uidCount}`;

const n = (v) => String(Math.round(v * 100) / 100);

export function path(d, fill = 'none', w = LW, stroke = INK, extra = '') {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${n(w)}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
}
export function circle(x, y, r, fill, w = LW, stroke = INK, extra = '') {
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${n(w)}"${extra}/>`;
}
export function ellipse(x, y, rx, ry, fill, w = LW, stroke = INK, rot = 0, extra = '') {
  const t = rot ? ` transform="rotate(${n(rot)} ${n(x)} ${n(y)})"` : '';
  return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" stroke="${stroke}" stroke-width="${n(w)}"${t}${extra}/>`;
}
export function rect(x, y, w, h, fill, rx = 0, sw = LW, stroke = INK, extra = '') {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fill}" stroke="${stroke}" stroke-width="${n(sw)}"${extra}/>`;
}
export function line(x1, y1, x2, y2, col = INK, w = LW, extra = '') {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="round"${extra}/>`;
}
export function text(x, y, s, size = 14, fill = INK, extra = '') {
  return `<text x="${n(x)}" y="${n(y)}" font-size="${n(size)}" fill="${fill}" text-anchor="middle" font-weight="700" font-family="Fredoka, system-ui, sans-serif"${extra}>${s}</text>`;
}
export function g(body, tr = '', extra = '') {
  return `<g${tr ? ` transform="${tr}"` : ''}${extra}>${body}</g>`;
}
export function place(body, x, y, sc = 1, rot = 0, extra = '') {
  return g(body, `translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''}${sc !== 1 ? ` scale(${n(sc)})` : ''}`, extra);
}
export function star(x, y, r, fill = SUN, w = 2) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${n(x + rr * Math.cos(a))},${n(y - rr * Math.sin(a))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="${n(w)}" stroke-linejoin="round"/>`;
}
export function heart(x, y, s, fill = CORAL) {
  const k = s / 10;
  return path(`M ${n(x)} ${n(y + 6 * k)} C ${n(x - 10 * k)} ${n(y - 2 * k)} ${n(x - 6 * k)} ${n(y - 10 * k)} ${n(x)} ${n(y - 5 * k)} `
    + `C ${n(x + 6 * k)} ${n(y - 10 * k)} ${n(x + 10 * k)} ${n(y - 2 * k)} ${n(x)} ${n(y + 6 * k)} Z`, fill, 1.8);
}
function eye(x, y, r, kind) {
  if (kind === 'open') return circle(x, y, r, INK, 0) + circle(x - r * 0.3, y - r * 0.35, r * 0.36, WHITE, 0);
  const wd = Math.max(1.6, r * 0.5);
  if (kind === 'closed') return path(`M ${n(x - r)} ${n(y)} q ${n(r)} ${n(r * 0.8)} ${n(2 * r)} 0`, 'none', wd);
  if (kind === 'happy') return path(`M ${n(x - r)} ${n(y + r * 0.4)} q ${n(r)} ${n(-r * 1.5)} ${n(2 * r)} 0`, 'none', wd);
  return path(`M ${n(x - r)} ${n(y)} a ${n(r)} ${n(r)} 0 1 1 ${n(r)} ${n(r)} a ${n(r * 0.6)} ${n(r * 0.6)} 0 1 1 ${n(-r * 0.6)} ${n(-r * 0.6)}`, 'none', Math.max(1.4, r * 0.4));
}
const zzz = (x, y) => text(x, y, 'z', 13, '#7C77B9') + text(x + 10, y - 13, 'Z', 18, '#7C77B9');
const motionBelow = () => [-12, 0, 12].map((x) => line(x, 8 + Math.abs(x) * 0.2, x, 20 + Math.abs(x) * 0.2, INK, 2.2, ' opacity="0.45"')).join('');

// ---------------------------------------------------------------- the Nibbles
const FEET = {
  walk1: [[-14, 0], [16, -5]], walk2: [[-8, -5], [20, 0]], float: [[-8, 8], [14, 10]], boing: [[-8, 6], [12, 6]],
  fall: [[-8, 6], [12, 6]], stuck: [[-4, 0], [24, 0]], bonk: [],
};
const SQUASH = { boing: [0.86, 1.18], fall: [0.92, 1.08], bonk: [1.42, 0.42], stuck: [1.06, 0.88] };

export function hamster(pose) {
  const eyes = { stuck: 'closed', bonk: 'swirl', home: 'happy' }[pose] || 'open';
  const feet = FEET[pose] || [[-12, 0], [14, 0]];
  const [sx, sy] = SQUASH[pose] || [1, 1];
  const armsUp = ['boing', 'fall', 'float', 'home'].includes(pose);
  let b = circle(-34, -26, 5.5, FUR, 2.4);
  if (armsUp) b += ellipse(-12, -70, 6, 9, FUR, 2.4, INK, -25) + ellipse(28, -71, 6, 9, FUR, 2.4, INK, 25);
  b += circle(-15, -60, 10, FUR) + circle(-15, -60, 5, PINK, 0);
  b += circle(13, -63, 10, FUR) + circle(13, -63, 5, PINK, 0);
  b += ellipse(0, -33, 35, 31, FUR);
  b += ellipse(9, -22, 20, 15, BELLY, 0) + ellipse(21, -40, 15, 12, BELLY, 0);
  b += g(eye(11, -45, 4.6, eyes) + eye(26, -44, 4.2, eyes), '', ' class="eyes"');
  b += ellipse(35, -37, 4.2, 3.4, PINK, 1.8);
  b += ellipse(25, -31, 6, 3.4, PINK, 0, INK, 0, ' opacity="0.6"');
  b += line(37, -36, 49, -40, INK, 1.4) + line(37, -34, 49, -31, INK, 1.4);
  b += pose === 'home' || pose === 'fall' ? path('M 27 -29 q 4 7 9 0 z', '#C2185B', 1.8) : path('M 29 -30 q 2.5 3 5 0', 'none', 1.6);
  if (!armsUp && pose !== 'bonk') b += ellipse(22, -16, 5.5, 4.5, PINK, 2.2);
  let s = feet.map(([x, y]) => ellipse(x, y - 4, 8, 5, PINK, 2.4)).join('') + g(b, `scale(${sx} ${sy})`);
  if (pose === 'boing') s += motionBelow();
  else if (pose === 'float') {
    let puff = '';
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI) / 7;
      puff += line(8 + 7 * Math.cos(a), -126 + 7 * Math.sin(a), 8 + 20 * Math.cos(a), -126 + 20 * Math.sin(a), '#C9C4E6', 1.4)
        + circle(8 + 21 * Math.cos(a), -126 + 21 * Math.sin(a), 1.8, '#C9C4E6', 0);
    }
    s = line(8, -72, 8, -106, '#3E9B4F', 3.5) + circle(8, -126, 23, WHITE, 2, '#B9B4D6') + puff + circle(8, -126, 4, '#E9E4FF', 1.4, '#B9B4D6') + s;
  } else if (pose === 'stuck') s = g(s + zzz(36, -62), '', ' opacity="0.7"');
  else if (pose === 'bonk') {
    s += g(star(-26, -38, 6) + star(0, -46, 7) + star(26, -38, 6), '', ' class="dizzy"');
  } else if (pose === 'home') s = g(s, 'translate(0 -8)') + star(-36, -80, 6) + star(42, -84, 5) + heart(6, -98, 9);
  return s;
}

// Just the head: for the tray's walker count, the house picker's hamster and one peeking from the tube.
export function hamsterHead(eyes = 'open') {
  return circle(-15, -60, 10, FUR) + circle(-15, -60, 5, PINK, 0) + circle(13, -63, 10, FUR) + circle(13, -63, 5, PINK, 0)
    + ellipse(0, -40, 30, 26, FUR) + ellipse(14, -36, 15, 12, BELLY, 0)
    + g(eye(4, -46, 4.6, eyes) + eye(20, -45, 4.2, eyes), '', ' class="eyes"')
    + ellipse(29, -38, 4.2, 3.4, PINK, 1.8) + ellipse(19, -32, 6, 3.4, PINK, 0, INK, 0, ' opacity="0.6"')
    + line(31, -37, 43, -41, INK, 1.4) + line(31, -35, 43, -32, INK, 1.4) + path('M 23 -31 q 2.5 3 5 0', 'none', 1.6);
}

// ---------------------------------------------------------------- gadgets (a 100 x 100 square, floor at 100)
const TUBE_ICON = 'M 4 74 L 52 74 Q 74 74 74 52 L 74 4';
function tube(d, body, ring) {
  return path(d, 'none', 36) + path(d, 'none', 29, body) + path(d, 'none', 4, WHITE, ' opacity="0.65"')
    + path(d, 'none', 29, ring, ' stroke-dasharray="3 22" stroke-linecap="butt" opacity="0.8"');
}

export function gadget(kind, count = 1) {
  const w = 100 * count;
  if (kind === 'bridge') {
    return rect(-6, 0, w + 12, 22, '#F3D9A4', 11) + line(10, 8, w * 0.45, 8, '#D8B47A', 2) + line(w * 0.55, 14, w - 10, 14, '#D8B47A', 2);
  }
  if (kind === 'ramp') {
    return path('M 2 100 L 100 100 L 100 4 Z', '#FFD54A')
      + [[80, 76, 8, 7], [90, 44, 5, 5], [58, 91, 5, 4], [70, 58, 4, 4]].map(([x, y, rx, ry]) => ellipse(x, y, rx, ry, '#F0B429', 0)).join('');
  }
  if (kind === 'bouncer') {
    return g(rect(20, 50, 60, 48, '#FFE6EE', 16) + ellipse(50, 53, 29, 8, '#FFF6F9', 2.2)
      + path('M 28 72 q 22 -8 44 0', 'none', 2.2, PINK) + path('M 28 84 q 22 -8 44 0', 'none', 2.2, PINK), '', ' class="mallow"');
  }
  if (kind === 'floater') {
    let puff = '';
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI) / 7;
      puff += line(50 + 7 * Math.cos(a), 34 + 7 * Math.sin(a), 50 + 22 * Math.cos(a), 34 + 22 * Math.sin(a), '#C9C4E6', 1.4);
    }
    return line(50, 100, 50, 52, '#3E9B4F', 4) + path('M 50 86 q -16 -2 -20 -14 q 14 0 20 10', LEAF, 2)
      + circle(50, 34, 26, WHITE, 2, '#B9B4D6') + puff + circle(50, 34, 4.5, '#E9E4FF', 1.4, '#B9B4D6');
  }
  return tube(TUBE_ICON, '#A8ECFF', '#6CCBE8');
}

// A tube square on the board, joined to its neighbours: dirs is a string of the sides it opens to, of
// 'u', 'd', 'l', 'r' (game.js works them out). Two sides make a straight or an elbow; one side a stub.
export function tubePiece(dirs) {
  const E = { u: [50, 0], d: [50, 100], l: [0, 50], r: [100, 50] };
  const ends = [...new Set(dirs.split(''))].filter((k) => E[k]);
  let d;
  if (ends.length === 1) d = `M 50 50 L ${E[ends[0]].join(' ')}`;
  else d = ends.slice(1).map((k) => `M ${E[ends[0]].join(' ')} Q 50 50 ${E[k].join(' ')}`).join(' ');
  return tube(d, '#A8ECFF', '#6CCBE8');
}

// ---------------------------------------------------------------- the board's pieces (board units)
export function block(c, r, top) {
  const x = c * CELL;
  const y = r * CELL;
  let s = rect(x, y, CELL, CELL, '#E2A867', 0, 2.4);
  s += path(`M ${x + 8} ${y + 26} q 14 -5 26 0 t 18 0`, 'none', 1.8, '#C48A4C') + path(`M ${x + 14} ${y + 44} q 10 4 22 0`, 'none', 1.8, '#C48A4C');
  return s + (top ? rect(x, y, CELL, 10, '#F6D7A7', 0, 2.4) : '');
}

export function water(c, r) {
  const x = c * CELL;
  const y = r * CELL;
  return rect(x, y + 34, CELL, CELL - 34, '#7FD3F7', 0, 0)
    + g(path(`M ${x} ${y + 34} q 15 -6 30 0 t 30 0`, 'none', 2.4), '', ' class="wave"');
}

export function duck() {
  // A rubber duck, about 30 wide, its waterline at 0.
  return path('M -14 -2 Q -16 -14 -4 -12 Q -6 -26 6 -26 Q 16 -26 15 -16 L 22 -14 L 15 -11 Q 18 -2 8 0 Z', SUN, 2.2)
    + circle(8, -20, 1.8, INK, 0) + path('M -8 -7 q 6 3 12 -1', 'none', 1.6, '#E0A41C');
}

export function startArt() {
  return ellipse(-12, 67, 13, 31, '#C98F57') + rect(-12, 36, 96, 62, '#C98F57', 2, 0)
    + line(-12, 36, 84, 36) + line(-12, 98, 84, 98) + path('M 10 36 L 38 98', 'none', 2, '#A8703F')
    + path('M 44 36 L 72 98', 'none', 2, '#A8703F') + ellipse(84, 67, 13, 31, '#5A3A22');
}

export function homeArt() {
  const seeds = [[82, 95, 20], [90, 95, -20], [86, 90, 0], [96, 94, 30]].map(([x, y, r]) => ellipse(x, y, 4, 2.4, '#3B3B3B', 1, INK, r)).join('');
  return rect(10, 28, 80, 70, '#E7B26F', 4) + path('M -2 34 L 50 -14 L 102 34 Z', '#E8505B')
    + path('M 34 98 L 34 72 A 16 16 0 0 1 66 72 L 66 98 Z', '#5A3A22') + heart(50, 14, 10, '#FFE6EE') + seeds;
}

export function seedArt() {
  // A golden sunflower seed, about 20 x 30, centred on 0,0.
  return path('M 0 -14 C 10 -6 10 8 0 15 C -10 8 -10 -6 0 -14 Z', SEED, 2.4) + path('M 0 -9 L 0 10', 'none', 1.8, '#C77A0C')
    + path('M -4 -8 q -3 6 0 12', 'none', 1.6, WHITE, ' opacity="0.8"');
}

export function sparkle(x, y, r) {
  return path(`M ${x} ${y - r} L ${x + r * 0.25} ${y - r * 0.25} L ${x + r} ${y} L ${x + r * 0.25} ${y + r * 0.25} L ${x} ${y + r} `
    + `L ${x - r * 0.25} ${y + r * 0.25} L ${x - r} ${y} L ${x - r * 0.25} ${y - r * 0.25} Z`, '#FFF6C7', 1.4, '#F0A51C');
}

// ---------------------------------------------------------------- backdrops (720 x 420 units)
const W = 720;
const H = 420;
function bands(cols) {
  return cols.map((c, i) => rect(0, (i * H) / cols.length, W, H / cols.length + 1, c, 0, 0)).join('');
}
function jar(x, h, col, lid = '#E8505B') {
  return g(rect(x, -h, 36, h, col, 8, 2.4) + rect(x - 2, -h - 8, 40, 10, lid, 4, 2.4)
    + rect(x + 7, -h + 10, 8, h - 20, WHITE, 4, 0, INK, ' opacity="0.35"'), '', ` class="poke jar" data-poke="jar"`);
}

// Each level's backdrop, in a group named for it (data-back), so the tests can see which is drawn.
export function backdrop(name) {
  return g(backdropArt(name), '', ` data-back="${['pantry', 'living', 'bedroom'].includes(name) ? name : 'kitchen'}"`);
}

// The living room (level 4, D-149): striped wallpaper, a sunflower picture, a cuckoo clock and a hanging lamp.
function livingArt() {
  let s = bands(['#E6F1E3', '#DEECDA', '#D6E7D1', '#CEE2C8']);
  for (let x = 20; x < W; x += 40) s += line(x, 0, x, H, '#D3E6CD', 8, ' opacity="0.7"');
  let d = ellipse(600, 150, 80, 56, '#FFF3B0', 0, INK, 0, ' opacity="0.5"');
  d += g(rect(300, 40, 80, 70, '#FFF8EE', 4, 3) + circle(340, 70, 14, SUN, 2.2) + circle(340, 70, 6, '#8B5A3C', 0)
    + path('M 340 84 L 340 102', 'none', 2.4, '#3E9B4F') + path('M 340 96 q 10 -6 14 -2', 'none', 2, '#3E9B4F'), '', ' class="poke picture" data-poke="picture"');
  d += g(rect(456, 32, 52, 58, '#B57A44', 6, 2.6) + path('M 448 36 L 482 10 L 516 36 Z', '#8B5A3C', 2.6) + rect(474, 18, 16, 12, '#5A3A22', 3, 1.6)
    + circle(482, 60, 16, '#FFF8EE', 2) + line(482, 60, 482, 49, INK, 2) + line(482, 60, 490, 62, INK, 2)
    + line(476, 90, 476, 120, '#8B5A3C', 1.6) + line(488, 90, 488, 110, '#8B5A3C', 1.6) + ellipse(476, 124, 4, 7, SUN, 1.4) + ellipse(488, 114, 4, 7, SUN, 1.4),
  '', ' class="poke clock" data-poke="clock"');
  d += g(line(600, 0, 600, 64, '#8B5A3C', 3) + path('M 568 106 L 632 106 L 616 64 L 584 64 Z', '#FFE08A', 2.6)
    + circle(600, 112, 7, '#FFF8EE', 1.8), '', ' class="poke lamp" data-poke="lamp"');
  return s + g(d, '', ' opacity="0.85"');
}

// The bedroom at night (level 5, D-149): a window with the moon, a star mobile, the cage's bars and its wheel.
function bedroomArt() {
  let s = bands(['#5B5598', '#6661A3', '#716CAE', '#7C77B9']);
  for (let x = 432; x < W; x += 18) s += line(x, 0, x, 230, '#9C97D6', 2.4, ' opacity="0.45"');
  s += line(420, 230, W, 230, '#9C97D6', 4, ' opacity="0.45"');
  let d = g(rect(40, 28, 160, 116, '#272463', 4, 0)
    + [[70, 56, 4], [110, 44, 3], [170, 70, 4], [92, 110, 3], [150, 118, 3]].map(([x, y, r], i) =>
      g(star(x, y, r, '#FFF3B0', 0), '', ` class="twinkle" style="animation-delay:${(i * 0.3).toFixed(1)}s"`)).join('')
    + g(circle(140, 80, 20, '#FFF3B0', 2, '#E8D98A') + circle(132, 74, 4, '#F2E4A0', 0) + circle(146, 88, 3, '#F2E4A0', 0)
      + path('M 130 86 q 6 5 12 0', 'none', 1.6, '#B8A65A'), '', ' class="poke moon" data-poke="moon"')
    + rect(40, 28, 160, 116, 'none', 4, 7, WHITE) + line(120, 28, 120, 144, WHITE, 5) + line(40, 86, 200, 86, WHITE, 5), 'translate(0 66)');
  d += g(line(330, 0, 330, 24, '#E9E4FF', 2) + line(290, 24, 370, 24, '#E9E4FF', 2.4)
    + [[290, 52, SUN], [330, 44, '#FFB3C7'], [370, 56, '#9FE3CF']].map(([x, y, col]) => line(x, 24, x, y - 9, '#E9E4FF', 1.6) + star(x, y, 9, col, 1.8)).join(''),
  '', ' class="poke mobile" data-poke="mobile"');
  d += g(circle(560, 150, 46, 'none', 5, '#A8ECFF') + circle(560, 150, 6, '#A8ECFF', 2) + line(560, 104, 560, 196, '#A8ECFF', 2.4)
    + line(514, 150, 606, 150, '#A8ECFF', 2.4) + line(527, 117, 593, 183, '#A8ECFF', 2) + line(593, 117, 527, 183, '#A8ECFF', 2), '', ' class="poke wheel" data-poke="wheel"');
  return s + g(d, '', ' opacity="0.9"');
}

function backdropArt(name) {
  if (name === 'living') return livingArt();
  if (name === 'bedroom') return bedroomArt();
  if (name === 'pantry') {
    let s = bands(['#F7DDB5', '#F2D3A6', '#ECC897', '#E5BD88']);
    s += Array.from({ length: 12 }, (_, i) => line(i * 60 + 30, 0, i * 60 + 30, H, '#DDB27C', 1.6, ' opacity="0.6"')).join('');
    let d = rect(14, 104, 300, 12, '#B57A44', 3, 2.4);
    d += g(jar(30, 50, '#FFD54A', '#7A4A22') + jar(84, 64, '#FF9BB3') + jar(140, 42, '#9FE3CF', '#5FA8C9'), 'translate(0 104)');
    d += g(g(rect(194, -58, 40, 58, '#E8505B', 6, 2.4) + rect(194, -44, 40, 10, '#FFE6EE', 0, 0), '', ' class="poke tin" data-poke="tin"')
      + g(rect(244, -46, 44, 46, '#5FA8C9', 6, 2.4) + rect(244, -34, 44, 8, SUN, 0, 0), '', ' class="poke tin" data-poke="tin"'), 'translate(0 104)');
    d += rect(580, 86, 130, 12, '#B57A44', 3, 2.4) + g(jar(596, 40, '#C9B8FF', '#8B5A3C') + jar(650, 54, '#FFE6EE'), 'translate(0 86)');
    d += line(452, 0, 452, 46, '#8B5A3C', 2.4) + [[446, 52], [458, 70], [446, 88]].map(([x, y]) => ellipse(x, y, 10, 11, '#F6E7C8', 2.2)
      + path(`M ${x} ${y - 11} l 0 -6`, 'none', 2, LEAF)).join('');
    d += g(rect(40, 168, 74, 60, '#FFF8EE', 4, 3) + circle(77, 196, 13, SUN, 2.2) + circle(77, 196, 5, '#8B5A3C', 0)
      + path('M 77 209 L 77 222', 'none', 2.4, '#3E9B4F'), '', ' class="poke picture" data-poke="picture"');
    return s + g(d, '', ' opacity="0.85"');
  }
  let s = bands(['#FFE9C7', '#FFE2BC', '#FFDAB0', '#FFD3A5']);
  for (let y = 240; y < H; y += 30) s += line(0, y, W, y, '#F3C995', 1.4);
  for (let x = 0; x < W; x += 30) s += line(x, 240, x, H, '#F3C995', 1.4);
  const sky = uid('sky');
  s += `<defs><linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A76"/><stop offset="1" stop-color="#FFD36E"/></linearGradient></defs>`;
  s += rect(230, 34, 160, 112, `url(#${sky})`, 0, 0) + g(circle(320, 116, 22, '#FFF2B0', 0), '', ' class="sunset"')
    + path('M 230 146 Q 280 112 330 132 T 390 124 L 390 146 Z', '#F2A65A', 0);
  s += g(path('M 262 66 q 6 -6 12 0 q 6 -6 12 0', 'none', 2, '#B5652D'), '', ' class="bird"');
  s += rect(230, 34, 160, 112, 'none', 4, 8, WHITE) + line(310, 34, 310, 146, WHITE, 6) + line(230, 90, 390, 90, WHITE, 6);
  const d = rect(24, 236, 180, 10, '#C48A4C', 3, 2.4) + g(jar(40, 46, '#FF9BB3') + jar(90, 58, '#9FE3CF') + jar(146, 40, '#FFE08A'), 'translate(0 236)');
  return s + g(d, '', ' opacity="0.85"');
}

// ---------------------------------------------------------------- the tray's pieces
export function slot(x, y, w, h, kind, count, selected, fresh) {
  const k = Math.min((w - 20) / 100, (h - 26) / 100);
  const lift = kind === 'bridge' ? 40 * k : 0;
  let s = rect(x, y, w, h, '#FFF8EE', 14, 3, INK, count ? '' : ' opacity="0.45"');
  s += place(gadget(kind), x + (w - 100 * k) / 2, y + 6 + lift, k, 0, count ? '' : ' opacity="0.35"');
  for (let j = 0; j < count; j++) s += circle(x + w / 2 + 13 * (j - (count - 1) / 2), y + h - 11, 4.5, SUN, 2);
  if (selected) s = rect(x - 5, y - 5, w + 10, h + 10, 'none', 18, 5, SUN) + s;
  if (fresh) s += g(star(x + w - 6, y + 6, 11) + star(x + w - 22, y - 2, 5), '', ' class="twinkle"');
  return g(s, selected ? 'translate(0 -8)' : '', ` class="slot" data-slot="${kind}"`);
}

export function goButton(x, y, w, h, mode) {
  const run = mode === 'stop';
  const fill = run ? '#FF8FA0' : '#3CC864';
  const fs = Math.min(32, h * 0.42);
  let s = rect(x, y, w, h, fill, h / 2, 3.5) + rect(x + 10, y + 8, w - 20, h * 0.26, 'rgba(255,255,255,0.28)', h * 0.13, 0);
  if (run) {
    s += rect(x + w / 2 - 14, y + h / 2 - 14, 28, 28, WHITE, 5, 3);
  } else {
    const t = Math.min(w * 0.22, h * 0.5);
    s += path(`M ${n(x + w * 0.17)} ${n(y + h / 2 - t / 2)} L ${n(x + w * 0.17)} ${n(y + h / 2 + t / 2)} L ${n(x + w * 0.17 + t * 0.8)} ${n(y + h / 2)} Z`, WHITE, 3);
    s += text(x + w * 0.66, y + h / 2 + fs * 0.36, 'GO!', fs, WHITE, ` stroke="${INK}" stroke-width="5" paint-order="stroke" stroke-linejoin="round"`);
  }
  return g(s, '', ` class="btn go${run ? ' stop' : ''}" data-btn="${run ? 'stop' : 'go'}"`);
}

export function houseButton(x, y, r) {
  const s = circle(x, y, r, '#FFF8EE', 3) + path(`M ${x - 15} ${y + 2} L ${x} ${y - 13} L ${x + 15} ${y + 2}`, 'none', 3.5, INK)
    + rect(x - 11, y, 22, 15, '#E7B26F', 2, 2.6) + rect(x - 4, y + 5, 8, 10, '#5A3A22', 2, 0);
  return g(s, '', ' class="btn" data-btn="house"');
}
