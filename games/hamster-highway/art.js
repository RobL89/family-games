// Hamster Highway's drawings, as SVG text. Version 1.4.
//
// Changes at v1.4 (step 4, D-157, D-161): the teacup lift: a red-and-white string looped round two cotton reels
// (liftArt), up on the right and down on the left (LOOP), and its teacups, white with pink spots on a saucer, drawn
// in two parts so a hamster rides inside (teacupBack behind it, teacupFront in front). The shed backdrop for level 9
// (plank walls, a cobwebbed window, a shelf of flowerpots, hanging tools and a watering can) and the treehouse for
// level 10 (sky, a big tree, its leaves, a rope swing, the treehouse with bunting for the party, and a bird), each as
// wide as its board.
//
// Changes at v1.3 (step 4, D-156, D-158): the veg patch backdrop for level 8, as wide as its board (a sky with a sun
// and clouds that answer a tap, a picket fence, sunflowers, a scarecrow made of a broom and a flowerpot hat); the
// see-saw: a garden plank (seesawArt, drawn level with its top edge on the pivot, so game.js just turns it) on a
// terracotta flowerpot (potArt). backdrop() takes the board's width.
//
// Changes at v1.2 (step 3, D-153, D-154): the worn lolly stick (stickArt: pale, already a little cracked, a crack
// more with each hamster, and a sticking plaster for luck); the bathroom backdrop for level 6 (tiles, a round
// mirror, a towel, bubbles that bob) and the loft for level 7 (planks, rafters, a round window, a spider that
// answers a tap).
//
// Changes at v1.1 (step 2, D-145, D-149): the living room and bedroom backdrops for levels 4 and 5, with
// things that answer a tap (the clock, the lamp, the moon, the star mobile, the wheel); each backdrop sits in a
// group named data-back. Tubes on the board join up with their neighbours (tubePiece).
//
// Original art (D-010), moved from the agreed mock-ups (tools/tests/games/sketch_bridge_builder.py,
// theme A, Hamster Highway, D-133) and drawn the same way: the Nibbles, their five gadgets (the worn stick came later), the wooden
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
  if (kind === 'stick') return stickArt(0);
  return tube(TUBE_ICON, '#A8ECFF', '#6CCBE8');
}

// The worn lolly stick (D-143, D-153), in a 100-wide square: paler than the sturdy bridge, already a little
// cracked; each crack (0 to 3) adds a zigzag and the stick sags a little more.
const CRACKS = [[50, 'M 46 6 l 6 6 l -5 4 l 5 6'], [26, 'M 24 6 l 5 5 l -4 5 l 4 6'], [74, 'M 72 6 l -5 5 l 5 5 l -4 6'], [38, 'M 36 6 l 6 7 l -6 4 l 5 5']];
export function stickArt(cracks = 0) {
  const sag = 2 * cracks;
  let s = path(`M -4 ${4} Q 50 ${4 + sag * 2} 104 4 L 104 20 Q 50 ${20 + sag * 2} -4 20 Z`, '#EED9B0', 2.6);
  s += line(10, 10, 40, 10 + sag, '#D9BC8A', 1.6) + line(60, 15 + sag, 92, 14, '#D9BC8A', 1.6);
  s += CRACKS.slice(0, cracks + 1).map(([, d]) => path(d, 'none', 2.2, '#8B5A3C')).join('');
  s += g(rect(56, 2 + sag, 18, 18, '#FFC9B0', 4, 1.8) + circle(62, 9 + sag, 1.2, '#E39A80', 0) + circle(68, 14 + sag, 1.2, '#E39A80', 0), '', ' opacity="0.95"');
  return s;
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

// Each level's backdrop, in a group named for it (data-back), so the tests can see which is drawn; w is the board's
// width (the backdrops for 12-square boards are drawn 720 wide).
export function backdrop(name, w = W) {
  if (name === 'veg') return g(vegArt(w), '', ' data-back="veg"');
  if (name === 'shed') return g(shedArt(w), '', ' data-back="shed"');
  if (name === 'treehouse') return g(treehouseArt(w), '', ' data-back="treehouse"');
  return g(backdropArt(name), '', ` data-back="${['pantry', 'living', 'bedroom', 'bathroom', 'loft'].includes(name) ? name : 'kitchen'}"`);
}

// The veg patch (level 8, D-151), w wide: sky, a sun and clouds, a picket fence, sunflowers and a scarecrow.
function vegArt(w) {
  let s = ['#CDEBFA', '#D7F0FB', '#E1F4FC', '#EAF8FD'].map((c, i) => rect(0, (i * 300) / 4, w, 76, c, 0, 0)).join('');
  s += rect(0, 296, w, H - 296, '#D9F2C9', 0, 0);
  let d = g(circle(90, 70, 34, SUN, 3) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i * Math.PI) / 4;
    return line(90 + 42 * Math.cos(a), 70 + 42 * Math.sin(a), 90 + 54 * Math.cos(a), 70 + 54 * Math.sin(a), '#F0A51C', 4);
  }).join('') + circle(80, 64, 3.2, INK, 0) + circle(100, 64, 3.2, INK, 0) + path('M 80 80 q 10 8 20 0', 'none', 2.6), '', ' class="poke" data-poke="sun"');
  for (let x = 300; x < w; x += 420) {
    d += g(g(ellipse(x, 64, 46, 20, WHITE, 2.4, '#B9D6E6') + ellipse(x + 30, 54, 30, 18, WHITE, 0) + ellipse(x - 26, 56, 24, 14, WHITE, 0), '', ' class="cloud"'), '', ' class="poke" data-poke="cloud"');
  }
  for (let x = 10; x < w; x += 34) d += path(`M ${x} 300 L ${x} 240 L ${x + 11} 228 L ${x + 22} 240 L ${x + 22} 300 Z`, '#FFF8EE', 2, '#D8C9B0');
  d += rect(0, 252, w, 10, '#FFF8EE', 0, 2, '#D8C9B0') + rect(0, 282, w, 10, '#FFF8EE', 0, 2, '#D8C9B0');
  for (let x = 200; x < w; x += 360) {
    d += line(x, 300, x, 170, '#3E9B4F', 5) + path(`M ${x} 250 q -26 -4 -30 -20 q 20 0 30 14`, LEAF, 2)
      + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const a = (i * Math.PI) / 5;
        return ellipse(x + 22 * Math.cos(a), 160 + 22 * Math.sin(a), 11, 6, SUN, 1.6, INK, (a * 180) / Math.PI);
      }).join('') + circle(x, 160, 14, '#8B5A3C', 2);
  }
  const sx = Math.max(560, w - 260);
  d += g(line(sx, 300, sx, 150, '#8B5A3C', 6) + line(sx - 44, 196, sx + 44, 196, '#8B5A3C', 5)
    + circle(sx, 140, 20, '#F6E7C8', 2.4) + circle(sx - 7, 136, 2.6, INK, 0) + circle(sx + 7, 136, 2.6, INK, 0) + path(`M ${sx - 7} 146 q 7 6 14 0`, 'none', 2)
    + path(`M ${sx - 18} 126 L ${sx + 18} 126 L ${sx + 12} 104 L ${sx - 12} 104 Z`, '#D9774B', 2.4)
    + rect(sx - 24, 176, 48, 60, '#9FD3F5', 8, 2.4) + rect(sx - 10, 190, 12, 12, '#FF9BB3', 2, 1.6), '', ' class="poke" data-poke="scarecrow"');
  return s + g(d, '', ' opacity="0.92"');
}

// The see-saw's plank, a garden board 3 squares long on the slant (3 x CELL x √2), drawn level and centred on 0,0
// with its top edge on y 0, where the hamsters' feet go; game.js turns it about 0,0 (the flowerpot's top).
export function seesawArt() {
  const L = Math.round(3 * CELL * Math.SQRT2);
  return rect(-L / 2, 0, L, 16, '#C98F57', 6, 2.6) + line(-L / 2 + 14, 6, -12, 6, '#A8703F', 1.6) + line(18, 11, L / 2 - 16, 11, '#A8703F', 1.6)
    + circle(-L / 2 + 10, 8, 2.4, '#8B5A3C', 0) + circle(L / 2 - 10, 8, 2.4, '#8B5A3C', 0) + circle(0, 8, 7, '#8B5A3C', 2.2);
}

// The teacup lift (D-157, D-161: look B): a string looped round two cotton reels, from the top reel at y0 to the
// bottom one at y1, in the column centred on x. A cup going up rides LOOP right of the middle, one coming down LOOP
// left; at each end it swings round its reel to the middle, where a hamster steps in or out (game.js).
export const LOOP = 16;
function reel(x, y) {
  return rect(x - 16, y - 7, 32, 14, '#E8505B', 3, 2) + line(x - 12, y - 2, x + 12, y - 2, '#FFB3C0', 1.6) + line(x - 12, y + 3, x + 12, y + 3, '#FFB3C0', 1.6)
    + rect(x - 23, y - 12, 8, 24, '#E7B26F', 3, 2.4) + rect(x + 15, y - 12, 8, 24, '#E7B26F', 3, 2.4) + circle(x, y, 3.4, INK, 0);
}
export function liftArt(x, y0, y1) {
  const o = LOOP;
  const loop = `M ${x - o} ${y0} L ${x - o} ${y1} A ${o} ${o} 0 0 0 ${x + o} ${y1} L ${x + o} ${y0} A ${o} ${o} 0 0 0 ${x - o} ${y0} Z`;
  return path(loop, 'none', 4, WHITE) + path(loop, 'none', 4, '#E8505B', ' stroke-dasharray="10 6" class="loop"') + reel(x, y0) + reel(x, y1);
}
// A teacup, drawn about its floor line (0,0), where a riding hamster's feet go: the inside behind the hamster ...
export function teacupBack() {
  return ellipse(0, -16, 25, 6, '#B98A7A', 2.5);
}
// ... and the bowl, its spots, its handle and the saucer in front.
export function teacupFront() {
  return ellipse(0, 12, 30, 5, '#FFD6E0', 2.2)
    + path('M -26 -16 Q -25 8 -12 10 L 12 10 Q 25 8 26 -16 Q 0 -9 -26 -16 Z', '#FFF8EE', 2.6)
    + [[-14, -4], [0, 2], [14, -4], [-6, -10], [8, -10]].map(([x, y]) => circle(x, y, 3, PINK, 0)).join('')
    + path('M 24 -10 q 13 2 6 14 q -3 3 -8 1', 'none', 2.6);
}

// The flowerpot the see-saw stands on: x its middle, from y0 (just under the plank's middle) down to y1 (the ground).
export function potArt(x, y0, y1) {
  return path(`M ${x - 26} ${y0 + 12} L ${x + 26} ${y0 + 12} L ${x + 18} ${y1} L ${x - 18} ${y1} Z`, '#D9774B', 2.6)
    + rect(x - 30, y0 + 4, 60, 14, '#E98C60', 4, 2.6) + path(`M ${x - 12} ${y0 + 34} q 12 8 24 0`, 'none', 2, '#B85F38')
    + path(`M ${x} ${y0 + 4} L ${x - 8} ${y0 - 4} L ${x + 8} ${y0 - 4} Z`, '#8B5A3C', 2);
}

// The shed (level 9, D-151), w wide: plank walls, a cobwebbed window, a shelf of flowerpots, tools on hooks and a
// watering can. Things that answer a tap: the flowerpots, the watering can and the trowel.
function shedArt(w) {
  let s = rect(0, 0, w, H, '#D9B98C', 0, 0);
  for (let x = 0; x < w; x += 40) s += rect(x, 0, 40, H, x % 80 ? '#D4B283' : '#DDBF93', 0, 1.4, '#C29B68');
  s += rect(0, 0, w, 26, '#B57A44', 0, 0);
  let d = '';
  for (let x = 140; x < w; x += 520) {
    d += g(rect(x, 60, 120, 90, '#BFE6F7', 4, 5, '#8B5A3C') + line(x + 60, 60, x + 60, 150, '#8B5A3C', 4) + line(x, 105, x + 120, 105, '#8B5A3C', 4)
      + path(`M ${x + 120} 60 l -34 0 M ${x + 120} 60 l -28 22 M ${x + 120} 60 l 0 32 M ${x + 104} 60 q 6 14 16 18 M ${x + 94} 60 q 10 24 26 30`, 'none', 1.2, WHITE, ' opacity="0.9"'),
    '', ' class="poke picture" data-poke="skylight"');
  }
  for (let x = 330; x < w; x += 520) {
    d += rect(x, 92, 150, 10, '#8B5A3C', 3, 2.4);
    d += [0, 52, 104].map((dx, i) => g(path(`M ${x + dx + 4} 92 L ${x + dx + 40} 92 L ${x + dx + 34} 56 L ${x + dx + 10} 56 Z`, '#D9774B', 2.2)
      + rect(x + dx + 6, 50, 32, 9, '#E98C60', 3, 2.2) + (i === 1 ? path(`M ${x + dx + 22} 50 q -10 -16 -2 -26 m 2 26 q 6 -18 14 -20`, 'none', 2.6, '#3E9B4F') : ''),
    '', ' class="poke pot" data-poke="pot"')).join('');
  }
  for (let x = 40; x < w; x += 520) {
    d += circle(x + 20, 190, 4, '#5A3A22', 0) + g(line(x + 20, 190, x + 20, 250, '#8B5A3C', 5) + path(`M ${x + 8} 250 L ${x + 32} 250 L ${x + 26} 290 Q ${x + 20} 300 ${x + 14} 290 Z`, '#9AA7B5', 2.4), '', ' class="poke trowel" data-poke="trowel"');
    d += circle(x + 64, 190, 4, '#5A3A22', 0) + line(x + 64, 190, x + 64, 250, '#8B5A3C', 5) + path(`M ${x + 52} 250 L ${x + 76} 250 M ${x + 54} 250 L ${x + 54} 284 M ${x + 64} 250 L ${x + 64} 286 M ${x + 74} 250 L ${x + 74} 284`, 'none', 3.4, '#9AA7B5');
  }
  const wx = Math.max(560, w - 140);
  d += g(path(`M ${wx - 40} 300 L ${wx + 40} 300 L ${wx + 34} 236 L ${wx - 34} 236 Z`, '#5FA8C9', 2.6) + path(`M ${wx + 34} 250 L ${wx + 76} 220 L ${wx + 80} 228 L ${wx + 38} 262`, '#5FA8C9', 2.4)
    + ellipse(wx + 80, 222, 8, 5, '#4A8FB0', 2) + path(`M ${wx - 34} 244 q -26 -10 -14 -40 q 14 -16 30 -6`, 'none', 4, '#3E7F9E'), '', ' class="poke can" data-poke="can"');
  return s + g(d, '', ' opacity="0.9"');
}

// The treehouse (level 10, D-151), w wide: sky, a big tree with its leaves, a rope swing, and the treehouse at the
// right with bunting for the party at the end. Things that answer a tap: the swing, the clouds and a bird.
function treehouseArt(w) {
  let s = ['#BFE6FA', '#CDEBFA', '#DBF1FB', '#E7F6FC'].map((c, i) => rect(0, i * 80, w, 82, c, 0, 0)).join('');
  s += rect(0, 320, w, H - 320, '#CDEFB9', 0, 0);
  let d = '';
  for (let x = 160; x < w; x += 480) {
    d += g(g(ellipse(x, 70, 50, 20, WHITE, 2.4, '#B9D6E6') + ellipse(x + 32, 60, 30, 18, WHITE, 0) + ellipse(x - 28, 62, 24, 14, WHITE, 0), '', ' class="cloud"'), '', ' class="poke" data-poke="cloud"');
  }
  const tx = w - 210;
  d += path(`M ${tx - 50} ${H} Q ${tx - 30} 300 ${tx - 36} 150 L ${tx + 36} 150 Q ${tx + 30} 300 ${tx + 50} ${H} Z`, '#8B5A3C', 3);
  d += [[-150, 70, 90], [-40, 40, 110], [80, 60, 100], [-250, 110, 70], [150, 120, 70]].map(([dx, y, r]) => circle(tx + dx, y, r, '#7DC95E', 3)).join('');
  d += [[-120, 60], [-10, 30], [100, 70], [-220, 100]].map(([dx, y]) => circle(tx + dx, y, 22, '#8FD46E', 0)).join('');
  const sx = w - 80;   // a rope swing under the treehouse, clear of the lift
  d += g(line(sx - 22, 180, sx - 22, 300, '#C48A4C', 3) + line(sx + 22, 180, sx + 22, 300, '#C48A4C', 3) + rect(sx - 32, 298, 64, 12, '#E7B26F', 4, 2.4), '', ' class="poke swing" data-poke="swing"');
  d += rect(w - 320, 40, 250, 82, '#E7B26F', 6, 3) + path(`M ${w - 334} 46 L ${w - 195} 4 L ${w - 56} 46 Z`, '#E8505B', 3)
    + rect(w - 160, 60, 40, 36, '#BFE6F7', 4, 3) + line(w - 140, 60, w - 140, 96, '#8B5A3C', 2.4);
  d += path(`M ${w - 330} 100 Q ${w - 200} 140 ${w - 60} 100`, 'none', 2, INK)
    + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const x = w - 316 + i * 30; const y = 100 + 34 * Math.sin((Math.PI * (i + 0.5)) / 9.2);
      return path(`M ${x} ${y} l 8 16 l 8 -16 z`, [CORAL, SUN, '#5FE3BD', '#B9A7FF', PINK][i % 5], 1.4); }).join('');
  const bx = Math.round(w * 0.45);   // a bird on its own in the open sky
  d += g(ellipse(bx, 176, 14, 11, '#7FB3E8', 2.2) + circle(bx + 8, 170, 7, '#7FB3E8', 2) + circle(bx + 10, 168, 1.6, INK, 0)
    + path(`M ${bx + 14} 170 l 6 2 l -6 2 z`, SUN, 1.2), '', ' class="poke bird" data-poke="bird"');
  return s + g(d, '', ' opacity="0.92"');
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

// The bathroom (level 6, D-154): pale tiles, a round mirror, a towel on its rail, and bubbles that bob up.
function bathroomArt() {
  let s = bands(['#E3F4FA', '#DBEFF7', '#D3EAF3', '#CBE5F0']);
  for (let y = 30; y < H; y += 40) s += line(0, y, W, y, '#BFDDEA', 1.6);
  for (let x = 20; x < W; x += 40) s += line(x, 0, x, H, '#BFDDEA', 1.6);
  let d = g(circle(560, 96, 56, '#F4FBFF', 5, '#C9A26E') + path('M 528 74 q 14 -16 34 -14', 'none', 4, WHITE) + path('M 536 92 q 6 -8 16 -8', 'none', 3, WHITE),
    '', ' class="poke picture" data-poke="mirror"');
  d += line(300, 70, 430, 70, '#C9A26E', 5) + g(rect(318, 70, 92, 96, '#FF9BB3', 6, 2.6) + line(318, 140, 410, 140, WHITE, 6) + line(318, 152, 410, 152, WHITE, 3),
    '', ' class="poke towel" data-poke="towel"');
  d += [[120, 160, 14], [160, 120, 9], [96, 96, 7], [210, 150, 11], [640, 220, 10]].map(([x, y, r], i) =>
    g(circle(x, y, r, 'rgba(255,255,255,0.55)', 2, '#9FD3E8') + circle(x - r / 3, y - r / 3, r / 4, WHITE, 0), '', ` class="bob" style="animation-delay:${(i * 0.4).toFixed(1)}s"`)).join('');
  return s + g(d, '', ' opacity="0.9"');
}

// The loft (level 7, D-154): bare planks, rafters under the roof, a round window, and a little spider.
function loftArt() {
  let s = bands(['#E8CFA6', '#E2C69A', '#DBBC8E', '#D4B282']);
  for (let x = 0; x < W; x += 48) s += line(x, 0, x, H, '#C9A26E', 2, ' opacity="0.6"');
  s += path(`M 0 120 L 360 0 L ${W} 120`, 'none', 14, '#B57A44', ' opacity="0.7"');
  s += [80, 200, 520, 640].map((x) => line(x, 120 - Math.abs(360 - x) / 3, x, H, '#B57A44', 10, ' opacity="0.45"')).join('');
  let d = g(circle(360, 90, 38, '#9FD3F5', 5, '#8B5A3C') + line(360, 52, 360, 128, '#8B5A3C', 4) + line(322, 90, 398, 90, '#8B5A3C', 4)
    + circle(372, 78, 8, '#FFF3B0', 0), '', ' class="poke picture" data-poke="skylight"');
  d += path('M 620 0 L 700 0 M 640 0 L 690 40 M 660 0 L 700 20 M 650 0 Q 676 22 700 38', 'none', 1.4, '#FFF8EE', ' opacity="0.8"');
  d += g(line(676, 0, 676, 58, '#5A3A22', 1.4) + circle(676, 64, 7, '#5A3A22', 0) + circle(673, 62, 1.6, WHITE, 0) + circle(679, 62, 1.6, WHITE, 0)
    + [-1, 1].map((k) => path(`M 676 64 l ${9 * k} -5 M 676 66 l ${10 * k} 2 M 676 68 l ${8 * k} 7`, 'none', 1.4, '#5A3A22')).join(''),
  '', ' class="poke spider" data-poke="spider"');
  return s + g(d, '', ' opacity="0.9"');
}

function backdropArt(name) {
  if (name === 'bathroom') return bathroomArt();
  if (name === 'loft') return loftArt();
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
  const lift = kind === 'bridge' || kind === 'stick' ? 40 * k : 0;
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
