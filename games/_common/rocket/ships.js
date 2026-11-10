// The hangar's ships for the rocket games (D-045, D-046, D-049): how each one looks and what it
// does when it comes down, lands and shows off. Version 1.4. All original and drawn in code (D-010).
//
// Changes at v1.4 (step 2d-2, D-073 to D-080): five new ships, the Splash Tub, Jack-in-the-Box,
// Sunflower Copter, Spin Cycle and Christmas Tree, moved here unchanged from
// tools/tests/games/sketch_rocket_new_ships.js 1.0, the step 2d-1 mock-ups Rob accepted (D-078), by
// move_rocket_new_ships.py 1.0; with them three new kinds of spark in drawPart (a music note, a
// petal, a water drop). SHIPS is in D-079's order, cheapest first in each tier. The new ships give
// up to three hooks that round.js reads (D-080); ships without them play as before:
//   seat(S)    where Bip is aboard: { x, y, s }, his feet and size in units of h from the ship's
//              middle; his hop out to the small flag, and Bip's moment, start from here (the
//              Classic's window, round.js's default, is { x: 0, y: 0.255, s: 0.3 });
//   ladder(S)  a ship's own ladder, { top, foot } in units of h (the Christmas Tree): Bip climbs
//              down it instead of hopping, and Bip's moment uses it in place of the rope ladder;
//   S.side     set by the round to the side the flag goes (1 right, -1 left).
// Changes at v1.3 (step 2a-4c): S.calm, below: when the device asks for less motion (D-045), the
// Golden Phoenix's wings stop beating and the Aurora Cruiser's ribbons stop rippling; with fewer
// effects (the game's P.k), that is each ship's calm version. Changes at v1.2 (step 2a-4b): S.inPlay, below. Changes at v1.1 (step 2a-4b, D-053): moved here unchanged from
// tools/tests/games/sketch_rocket_ships.js 1.0, the step 2a-4a mock-ups' drawings, which Rob
// accepted (D-049). The names, tiers, prices and touchdown sounds now come from the one table in
// fleet.js, merged into each ship below; the drawings, moving parts and effects are as they were,
// but for one thing in play (S.inPlay): the Saucer's beam of light stops short of the ground, so it
// never covers the game's own beam or the numbers (D-045); in the hangar it still reaches the floor.
//
// Every ship keeps the classic rocket's envelope, so play is the same whichever is flown
// (D-045, D-046): drawn round its middle (x, y), h tall, feet on the ground at y + h/2 once
// its legs are out, Bip's window near y.
//
// A ship's state S (newState): x, y, h, rot, sx, sy, legs (0 to 1), thrust (0 to 1), pilotIn,
// blink, mood, look, gy (the ground's y), air (flying), idle (showing off in the hangar), calm (less motion),
// open and openT (wings and sails, now and wanted), spin, lock, flap, hop, steer (-1 to 1),
// trail (world points, for ribbons), sqT (time since touchdown, for the squash).

import { drawRocket, drawPilotHead, drawPilot, rr, rgba, mix, clamp, lerp, ease, sparkle, INK } from './scene.js';
import { FLEET_BY_ID } from './fleet.js';

const TAU = Math.PI * 2;
const CORAL = '#FF5D73';
const SUN = '#FFC93C';
const MINT = '#5FE3BD';
const SKY = '#8CF5FF';
const LILAC = '#B9A7FF';
const PINK = '#FF8FB1';
const GOLD = ['#FFF6C7', '#FFD45E', '#F0A51C', '#FFE48A', '#C77A0C'];
const SILVER = ['#FFFFFF', '#D6DCEC', '#8E98B8', '#E8ECF7', '#7A84A6'];
const ICE = ['#EFFCFF', '#B2EBFF', '#78D3FA', '#45A6F0', '#3A6CDF', '#C3B5FF'];
const FELT = ['#3D6CF0', CORAL, '#2FB892', '#9B5DE5', '#FFB020'];

const lwOf = (h) => Math.max(2, h * 0.032);
const hs = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hsl = (hue, s, l, a = 1) => `hsla(${((hue % 360) + 360) % 360},${s}%,${l}%,${a})`;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function grad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

function poly(ctx, pts, h) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * h, y * h) : ctx.moveTo(x * h, y * h)));
  ctx.closePath();
}

function outline(ctx, lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }

// A soft additive glow; col is a #hex colour.
export function glow(ctx, x, y, r, col, a = 1) {
  if (r <= 0.5 || a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, 0.85 * a)); g.addColorStop(0.35, rgba(col, 0.32 * a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}

function glowHue(ctx, x, y, r, hue, a = 1) {
  if (r <= 0.5 || a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hsl(hue, 100, 80, 0.85 * a)); g.addColorStop(0.4, hsl(hue, 100, 65, 0.3 * a)); g.addColorStop(1, hsl(hue, 100, 60, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}

export function star5(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r;
    if (i) ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); else ctx.moveTo(Math.cos(a) * q, Math.sin(a) * q);
  }
  ctx.closePath();
}

// A feather or leaf along +y, from 0 to L.
function featherPath(ctx, L, W) {
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.bezierCurveTo(W, L * 0.25, W * 0.8, L * 0.75, 0, L);
  ctx.bezierCurveTo(-W * 0.8, L * 0.75, -W, L * 0.25, 0, 0);
  ctx.closePath();
}

// A flame tongue: round end at 0, tip at L along +y.
function tear(ctx, L, W) {
  ctx.beginPath(); ctx.moveTo(0, L);
  ctx.bezierCurveTo(W * 0.9, L * 0.55, W, 0, 0, -W * 0.45);
  ctx.bezierCurveTo(-W, 0, -W * 0.9, L * 0.55, 0, L);
  ctx.closePath();
}

// ---------- particles ----------

function drawPart(ctx, p) {
  const k = clamp(1 - p.age / p.life, 0, 1);
  ctx.globalAlpha = 1;
  switch (p.kind) {
    case 'glow': case 'ember': {
      const fl = p.kind === 'ember' ? 0.6 + 0.4 * Math.sin(p.age * 30 + (p.ph || 0)) : 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = k * (p.a ?? 1) * fl; ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, p.size * (0.4 + 0.6 * k)), 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'smoke':
      ctx.globalAlpha = (p.a ?? 0.5) * k * k; ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      break;
    case 'steam': {
      ctx.globalAlpha = (p.a ?? 0.85) * k * Math.min(1, p.age * 8); ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      ctx.globalAlpha *= 0.6; ctx.fillStyle = '#E4E0FA';
      ctx.beginPath(); ctx.arc(p.x + p.size * 0.25, p.y + p.size * 0.3, p.size * 0.55, 0, TAU); ctx.fill();
      break;
    }
    case 'star': {
      const tw = p.tw ? 0.55 + 0.45 * Math.sin(p.age * p.tw + (p.ph || 0)) : 1;
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, k * 1.8); ctx.fillStyle = p.col;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); sparkle(ctx, 0, 0, p.size * tw); ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'star5':
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); star5(ctx, p.size);
      ctx.lineWidth = Math.max(1.5, p.size * 0.28); ctx.lineJoin = 'round'; ctx.strokeStyle = p.col; ctx.stroke(); ctx.restore();
      break;
    case 'confetti':
      ctx.globalAlpha = Math.min(1, k * 2.5); ctx.fillStyle = p.col;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.age * 9 + (p.ph || 0)));
      ctx.fillRect(-p.size / 2, -p.size * 0.32, p.size, p.size * 0.64); ctx.restore();
      break;
    case 'feather': {
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + Math.sin(p.age * 3 + (p.ph || 0)) * 0.5);
      featherPath(ctx, p.size, p.size * 0.32);
      ctx.fillStyle = grad(ctx, 0, 0, 0, p.size, [GOLD[0], GOLD[1], GOLD[2], '#FF7A2F']); ctx.fill();
      ctx.lineWidth = Math.max(1, p.size * 0.06); ctx.strokeStyle = 'rgba(120,60,0,.8)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, p.size * 0.95); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'fflame': {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      const L = p.size * (0.5 + 0.5 * k);
      tear(ctx, L, L * 0.32);
      ctx.fillStyle = grad(ctx, 0, 0, 0, L, ['#FFF3B0', '#FFB347', '#FF5D2E', 'rgba(232,54,79,0)']); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'shard': {
      const g = ease.back(clamp(p.age / 0.22, 0, 1)), hh = p.size * g, w = p.size * 0.28;
      if (hh < 1) break;
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(w * 0.15, -hh); ctx.lineTo(w, 0); ctx.closePath();
      ctx.fillStyle = grad(ctx, -w, 0, w, -hh, [ICE[3], ICE[1], '#FFFFFF']); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.15, -hh); ctx.lineTo(0, 0); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(w * 0.15, -hh); ctx.lineTo(w, 0); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
      break;
    }
    case 'glass':
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath(); ctx.moveTo(-p.size * 0.5, p.size * 0.3); ctx.lineTo(p.size * 0.1, -p.size * 0.6); ctx.lineTo(p.size * 0.55, p.size * 0.4); ctx.closePath();
      ctx.fillStyle = p.col || 'rgba(190,240,255,.55)'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      ctx.restore();
      break;
    case 'bubble': {
      ctx.globalAlpha = Math.min(1, k * 3);
      if (k < 0.14) {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const a = i * TAU / 6, r0 = p.size * (1 + (0.14 - k) * 6), r1 = r0 + p.size * 0.4; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0); ctx.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); ctx.stroke(); }
      } else {
        ctx.fillStyle = 'rgba(200,235,255,.25)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
        ctx.lineWidth = Math.max(1.5, p.size * 0.12); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.2, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'ring':
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * (p.a ?? 1);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(1, p.size), Math.max(0.5, p.size * (p.flat || 0.22)), 0, 0, TAU);
      ctx.lineWidth = Math.max(1, (p.lw || 6) * (0.3 + 0.7 * k)); ctx.strokeStyle = p.col; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      break;
    case 'prism': {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * 0.9;
      const L = p.size;
      const g = ctx.createLinearGradient(p.x - L, p.y, p.x + L, p.y);
      ['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF'].forEach((c, i) => g.addColorStop(i / 4, c));
      ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, L * 0.12); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - L, p.y); ctx.lineTo(p.x + L, p.y); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'hex': {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6, x = p.x + Math.cos(a) * p.size, y = p.y + Math.sin(a) * p.size; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.closePath(); ctx.lineWidth = 1.6; ctx.strokeStyle = p.col; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'note': {
      ctx.globalAlpha = Math.min(1, k * 2.2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot || 0) + Math.sin(p.age * 4 + (p.ph || 0)) * 0.25);
      musicNote(ctx, p.size, p.col, p.two); ctx.restore();
      break;
    }
    case 'petal':
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + 0.45 * Math.cos(p.age * 7 + (p.ph || 0)));
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.42, p.size, 0, 0, TAU);
      ctx.fillStyle = p.col || SUN; ctx.fill(); ctx.lineWidth = Math.max(1, p.size * 0.16); ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
      break;
    case 'drop':
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vx, -p.vy));
      tear(ctx, p.size * 1.7, p.size * 0.6); ctx.fillStyle = p.col || SKY; ctx.fill();
      ctx.lineWidth = Math.max(1, p.size * 0.22); ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
      break;
    default: break;
  }
}

// A ship's own sparks, puffs and feathers. k scales how many are made (1, or less when the
// device asks for less motion).
export class Parts {
  constructor() { this.list = []; this.k = 1; }
  add(p) {
    if (this.list.length >= 1400) return;
    this.list.push({ age: 0, vx: 0, vy: 0, g: 0, drag: 0, rot: 0, vr: 0, size: 4, grow: 0, layer: 'front', delay: 0, ...p });
  }
  update(dt) {
    for (const p of this.list) {
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.age += dt;
      const d = Math.max(0, 1 - p.drag * dt);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt + (p.sway ? Math.sin(p.age * p.sway + (p.ph || 0)) * (p.swayAmp || 20) * dt : 0);
      p.y += p.vy * dt;
      p.size = Math.max(0, p.size + p.grow * dt);
      p.rot += p.vr * dt;
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }
  draw(ctx, layer) {
    for (const p of this.list) if (p.layer === layer && !(p.delay > 0)) drawPart(ctx, p);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  shift(dx) { for (const p of this.list) p.x += dx; }
  clear() { this.list = []; }
}

function every(S, key, rate, dt, fn) {
  S.acc[key] = (S.acc[key] || 0) + rate * dt;
  let n = 0;
  while (S.acc[key] >= 1 && n < 40) { S.acc[key] -= 1; n += 1; fn(); }
}

function dust(S, P, col = '#EDE8FF', n = 14) {
  const m = Math.max(4, Math.round(n * P.k));
  for (let i = 0; i < m; i++) {
    const s = i % 2 ? 1 : -1;
    P.add({ kind: 'smoke', x: S.x + s * Math.random() * S.h * 0.3, y: S.gy - 3, vx: s * rnd(60, 220), vy: rnd(-80, -20), g: 60, drag: 2.6, life: rnd(0.6, 1.2), size: rnd(5, 13), grow: 22, col, a: 0.8 });
  }
}

function burst(P, x, y, n, cols, { sp = 160, up = 40, g = 160, size = [5, 11], kind = 'star', life = [0.6, 1.1], add = false, layer = 'front' } = {}) {
  const m = Math.max(3, Math.round(n * P.k));
  for (let i = 0; i < m; i++) {
    const a = (i / m) * TAU + Math.random() * 0.4, v = sp * rnd(0.55, 1.15);
    P.add({ kind, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, g, drag: 2.2, life: rnd(...life), size: rnd(...size), col: cols[i % cols.length], rot: Math.random() * 3, vr: rnd(-6, 6), add, layer, tw: kind === 'star' ? rnd(10, 22) : 0, ph: Math.random() * 6 });
  }
}

function confettiBurst(P, x, y, n, cols, sp = 260) {
  const m = Math.max(6, Math.round(n * P.k));
  for (let i = 0; i < m; i++) {
    const a = -Math.PI / 2 + rnd(-1.1, 1.1);
    P.add({ kind: 'confetti', x, y, vx: Math.cos(a) * sp * rnd(0.4, 1.1), vy: Math.sin(a) * sp * rnd(0.6, 1.2), g: 260, drag: 1.6, life: rnd(1.4, 2.4), size: rnd(6, 11), col: cols[i % cols.length], rot: Math.random() * 6, vr: rnd(-9, 9), ph: Math.random() * 6, sway: rnd(2, 4), swayAmp: 30 });
  }
}

// ---------- shared pieces of the drawings ----------

// Bip in a round window: the glass, Bip's head (if aboard) and the glare.
function bipGlass(ctx, cx, cy, r, S, t, inner = '#7FDBFF', outer = '#2747A8', headDy = 0.38, headR = 0.62) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 1.1);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);
  if (S.pilotIn !== false) drawPilotHead(ctx, cx, cy + r * headDy, r * headR, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, Math.PI * 1.05, Math.PI * 1.45); ctx.arc(cx, cy, r * 0.6, Math.PI * 1.45, Math.PI * 1.05, true); ctx.fill();
  ctx.restore();
}

function porthole(ctx, cx, cy, r, S, t, lw, { frame = '#E9ECFF', bolt = '#B9BFE6', inner, outer } = {}) {
  ctx.fillStyle = frame; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, TAU); ctx.fill(); ctx.stroke();
  if (bolt) {
    ctx.fillStyle = bolt;
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15, r * 0.08, 0, TAU); ctx.fill(); }
  }
  bipGlass(ctx, cx, cy, r, S, t, inner, outer);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
}

// Two folding legs. o: hip and foot positions (fractions of h), colours, and a foot drawer.
function struts(ctx, h, legs, o) {
  if (legs <= 0.01) return;
  const k = ease.back(clamp(legs, 0, 1)), lw = lwOf(h), w = h * (o.w || 0.055);
  for (const s of [-1, 1]) {
    const hx = s * o.hip[0] * h, hy = o.hip[1] * h;
    const fx = s * lerp(o.foot0[0], o.foot1[0], k) * h, fy = lerp(o.foot0[1], o.foot1[1], k) * h;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy);
    ctx.lineWidth = w + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = o.col; ctx.stroke();
    if (o.foot) o.foot(fx, fy, s, k);
    else { rr(ctx, fx - h * 0.07, fy - h * 0.005, h * 0.14, h * 0.04, h * 0.018); ctx.fillStyle = o.pad || '#7C82B8'; ctx.fill(); outline(ctx, lw); }
  }
}

// A sweeping band of light across a shape (call with the shape already clipped).
function sweep(ctx, h, t, speed, col = 'rgba(255,255,255,.6)', width = 0.09) {
  const u = ((t * speed) % 1.6) - 0.3;
  const x = lerp(-0.6, 0.6, u) * h;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x - width * h, -0.7 * h); ctx.lineTo(x + width * h * 0.4, -0.7 * h); ctx.lineTo(x + width * h * 0.4 - 0.5 * h, 0.7 * h); ctx.lineTo(x - width * h - 0.5 * h, 0.7 * h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------- the ships ----------

// Classic: today's rocket, unchanged, with two fin-tip lights that blink in the hangar.
const classic = {
  id: 'classic',
  look: 'Today\'s rocket: free, and yours from the start.',
  fw: [[SUN, '#FFFFFF', PINK], [LILAC, CORAL, SUN], [MINT, SKY, '#FFFFFF']],
  conf: [CORAL, SUN, MINT, SKY, '#FFFFFF'],
  draw(ctx, S, t) {
    const h = S.h;
    drawRocket(ctx, { x: 0, y: 0, h, rot: 0, sx: 1, sy: 1, legs: S.legs, flame: S.thrust, pilotIn: S.pilotIn, blink: S.blink, mood: S.mood, look: S.look }, t);
    if (S.idle || S.air) {
      const on = Math.sin(t * 5) > 0;
      glow(ctx, -h * 0.38, h * 0.39, h * 0.09, CORAL, on ? 0.9 : 0.15);
      glow(ctx, h * 0.38, h * 0.39, h * 0.09, MINT, on ? 0.15 : 0.9);
    }
  },
  thrust(S, P, dt) {
    const h = S.h, x = S.x, y = S.y + h * 0.42 * S.sy, p = S.thrust;
    every(S, 'sp', 70 * p * P.k, dt, () => P.add({ kind: 'glow', x: x + rnd(-0.06, 0.06) * h, y, vx: rnd(-35, 35), vy: 120 + Math.random() * 160 * p, drag: 2, life: rnd(0.25, 0.6), size: 1.5 + Math.random() * h * 0.035, col: Math.random() < 0.5 ? '#FFE066' : '#FF9F3A', layer: 'back' }));
    every(S, 'sm', 9 * p * P.k, dt, () => P.add({ kind: 'smoke', x: x + rnd(-0.05, 0.05) * h, y: y + h * 0.15, vx: rnd(-15, 15), vy: rnd(30, 60), g: -20, drag: 1.5, life: rnd(0.9, 1.7), size: h * rnd(0.06, 0.11), grow: h * 0.16, col: '#F4F1FF', a: 0.5, layer: 'back' }));
  },
  land(S, P) {
    dust(S, P, S.dust);
    burst(P, S.x, S.y - S.h * 0.2, 14, ['#FFE066', '#FFFFFF', SKY, PINK]);
  },
};

// Cardboard Box: a home-made rocket of a box, tape, a party hat and paper fins.
function crayonFlame(ctx, h, p, boil) {
  const top = 0.31 * h, len = h * (0.16 + 0.36 * p);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  [['#FF5D73', 0.15, 1], ['#FF9F3A', 0.11, 0.8], ['#FFE066', 0.065, 0.55]].forEach(([col, w, lk], li) => {
    const L = len * lk, W = h * w, n = 9 + li * 2;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const u = i / n, side = i % 2 ? 1 : -1;
      const x = side * W * (1 - u * 0.9) * (0.8 + 0.4 * hs(i * 3.3 + boil + li * 11));
      const y = top + u * L + (hs(i * 7.1 + boil * 1.7 + li) - 0.5) * h * 0.03;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.lineWidth = h * 0.034; ctx.strokeStyle = col; ctx.stroke();
  });
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI * (i / 14);
    const x = Math.cos(a) * 0.16 * h + (hs(i + boil * 5) - 0.5) * h * 0.02;
    const y = top + Math.sin(a) * len * (0.92 + 0.12 * hs(i * 2 + boil));
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.lineWidth = h * 0.016; ctx.strokeStyle = '#E2304F'; ctx.stroke();
  ctx.restore();
}

const box = {
  id: 'box',
  look: 'A box, sticky tape, a party hat and paper fins. Crayon flame; drawn-on stars fly off it.',
  fw: [[CORAL, SUN, '#3D6CF0'], ['#2FB892', '#FFB020', '#9B5DE5'], ['#FFFFFF', CORAL, '#3D6CF0']],
  conf: ['#FF5D73', '#3D6CF0', '#FFC93C', '#2FB892', '#9B5DE5', '#FFFFFF'],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), boil = Math.floor(t * 7);
    const j = (i) => (hs(i * 13.7 + boil * 3.1) - 0.5) * 0.01;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (S.thrust > 0.02) crayonFlame(ctx, h, S.thrust, boil);
    // paper-tube legs
    const k = ease.back(clamp(S.legs, 0, 1));
    if (S.legs > 0.01) {
      for (const s of [-1, 1]) {
        const x0 = (s * 0.15 - 0.055) * h, top = 0.25 * h, bot = (0.25 + 0.25 * k) * h;
        rr(ctx, x0, top, 0.11 * h, bot - top, 0.02 * h); ctx.fillStyle = '#F3EBDD'; ctx.fill(); outline(ctx, lw);
        ctx.strokeStyle = 'rgba(160,120,70,.6)'; ctx.lineWidth = lw * 0.6;
        for (let y = top + 0.05 * h; y < bot - 0.02 * h; y += 0.05 * h) { ctx.beginPath(); ctx.moveTo(x0 + 0.01 * h, y); ctx.lineTo(x0 + 0.1 * h, y + 0.015 * h); ctx.stroke(); }
        ctx.beginPath(); ctx.ellipse(x0 + 0.055 * h, bot, 0.055 * h, 0.018 * h, 0, 0, TAU); ctx.fillStyle = '#C9B79C'; ctx.fill(); outline(ctx, lw * 0.8);
      }
    }
    // paper fins, ruled like an exercise book
    for (const s of [-1, 1]) {
      const pts = [[s * 0.22, 0.0], [s * 0.44, 0.36], [s * 0.2, 0.3]];
      poly(ctx, pts, h); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.save(); poly(ctx, pts, h); ctx.clip();
      ctx.strokeStyle = '#9CC7FF'; ctx.lineWidth = lw * 0.5;
      for (let y = 0.04; y < 0.38; y += 0.045) { ctx.beginPath(); ctx.moveTo(-0.5 * h, y * h); ctx.lineTo(0.5 * h, y * h); ctx.stroke(); }
      ctx.strokeStyle = PINK; ctx.beginPath(); ctx.moveTo(s * 0.27 * h, 0); ctx.lineTo(s * 0.27 * h, 0.4 * h); ctx.stroke();
      ctx.restore();
      poly(ctx, pts, h); outline(ctx, lw);
    }
    // top flaps (the right one pops open on landing)
    const flap = Math.max(S.flap, S.idle ? Math.pow(Math.max(0, Math.sin(t * 1.3)), 14) * 0.8 : 0);
    poly(ctx, [[-0.25, -0.16], [-0.36, -0.27], [-0.08, -0.23]], h); ctx.fillStyle = '#C98A4B'; ctx.fill(); outline(ctx, lw);
    ctx.save(); ctx.translate(0.25 * h, -0.16 * h); ctx.rotate(-flap * 1.2);
    poly(ctx, [[0, 0], [0.11, -0.11], [-0.17, -0.07]], h); ctx.fillStyle = '#C98A4B'; ctx.fill(); outline(ctx, lw);
    ctx.restore();
    // the side and the front of the box
    poly(ctx, [[0.25, -0.16], [0.31, -0.2], [0.32, 0.27], [0.26, 0.31]], h); ctx.fillStyle = '#B5793F'; ctx.fill(); outline(ctx, lw);
    poly(ctx, [[-0.25 + j(1), -0.16 + j(2)], [0.25 + j(3), -0.16 + j(4)], [0.26 + j(5), 0.31 + j(6)], [-0.24 + j(7), 0.32 + j(8)]], h);
    ctx.fillStyle = grad(ctx, -0.25 * h, 0, 0.26 * h, 0, ['#F0C58F', '#DFA569', '#CE9255']); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(150,100,50,.22)'; ctx.lineWidth = lw * 0.5;
    for (let x = -0.24; x < 0.26; x += 0.035) { ctx.beginPath(); ctx.moveTo(x * h, -0.2 * h); ctx.lineTo(x * h, 0.35 * h); ctx.stroke(); }
    // tape across the bottom and over a corner
    ctx.fillStyle = 'rgba(255,246,214,.72)';
    ctx.beginPath(); ctx.moveTo(-0.3 * h, 0.18 * h); ctx.lineTo(0.3 * h, 0.17 * h); ctx.lineTo(0.3 * h, 0.23 * h); ctx.lineTo(-0.3 * h, 0.24 * h); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(-0.2 * h, -0.12 * h); ctx.rotate(-0.75); ctx.fillRect(-0.08 * h, -0.025 * h, 0.16 * h, 0.05 * h); ctx.restore();
    ctx.restore();
    poly(ctx, [[-0.25 + j(1), -0.16 + j(2)], [0.25 + j(3), -0.16 + j(4)], [0.26 + j(5), 0.31 + j(6)], [-0.24 + j(7), 0.32 + j(8)]], h); outline(ctx, lw);
    // felt-tip doodles: a star, and two arrows saying "this way up"
    ctx.save(); ctx.translate(-0.15 * h, 0.1 * h); ctx.rotate(0.2); star5(ctx, 0.045 * h); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = CORAL; ctx.stroke(); ctx.restore();
    ctx.strokeStyle = '#2FB892'; ctx.lineWidth = lw * 0.7;
    for (const ax of [0.13, 0.19]) { ctx.beginPath(); ctx.moveTo(ax * h, 0.13 * h); ctx.lineTo(ax * h, 0.04 * h); ctx.moveTo((ax - 0.02) * h, 0.065 * h); ctx.lineTo(ax * h, 0.04 * h); ctx.lineTo((ax + 0.02) * h, 0.065 * h); ctx.stroke(); }
    // the cut-out window, ringed twice in blue felt tip
    bipGlass(ctx, 0, -0.01 * h, 0.115 * h, S, t, '#A9E4FF', '#2D4FA8');
    ctx.strokeStyle = '#3D6CF0'; ctx.lineWidth = lw * 0.9;
    for (let ring = 0; ring < 2; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) { const a = (i / 20) * TAU + ring * 0.4, r = (0.135 + ring * 0.012 + (hs(i + ring * 30 + boil) - 0.5) * 0.012) * h; const x = Math.cos(a) * r, y = -0.01 * h + Math.sin(a) * r; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // the party hat, with a pom-pom
    poly(ctx, [[-0.2, -0.155], [0, -0.5], [0.2, -0.155]], h);
    ctx.fillStyle = CORAL; ctx.fill();
    ctx.save(); poly(ctx, [[-0.2, -0.155], [0, -0.5], [0.2, -0.155]], h); ctx.clip();
    [[-0.08, -0.22, SUN], [0.06, -0.3, MINT], [-0.02, -0.38, SUN], [0.1, -0.2, '#FFFFFF'], [-0.12, -0.18, MINT], [0.02, -0.24, '#FFFFFF']].forEach(([x, y, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x * h, y * h, 0.025 * h, 0, TAU); ctx.fill(); });
    ctx.restore();
    poly(ctx, [[-0.2, -0.155], [0, -0.5], [0.2, -0.155]], h); outline(ctx, lw);
    const pom = 1 + 0.08 * Math.sin(t * 9) * (S.air ? 1 : 0.3);
    ctx.fillStyle = SUN;
    for (let i = 0; i < 7; i++) { const a = i * TAU / 7; ctx.beginPath(); ctx.arc(Math.cos(a) * 0.032 * h * pom, -0.51 * h + Math.sin(a) * 0.032 * h * pom, 0.026 * h, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, -0.51 * h, 0.05 * h * pom, 0, TAU); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'st', 9 * p * P.k, dt, () => P.add({ kind: 'star5', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + h * 0.5, vx: rnd(-90, 90), vy: rnd(20, 90), g: -40, drag: 1.4, life: rnd(0.9, 1.5), size: h * rnd(0.04, 0.07), col: pick(FELT), rot: Math.random() * 6, vr: rnd(-4, 4), layer: 'back' }));
  },
  land(S, P) {
    S.flap = 1;
    dust(S, P, S.dust);
    confettiBurst(P, S.x, S.y - S.h * 0.3, 40, this.conf, 300);
    burst(P, S.x, S.y - S.h * 0.1, 8, FELT, { kind: 'star5', size: [S.h * 0.05, S.h * 0.08], g: 120 });
  },
  idle(S, P, dt) {
    every(S, 'id', 1.2 * P.k, dt, () => P.add({ kind: 'star5', x: S.x + rnd(-0.4, 0.4) * S.h, y: S.y + rnd(-0.3, 0.2) * S.h, vy: -14, life: 1.6, size: S.h * 0.045, col: pick(FELT), rot: Math.random() * 6, vr: rnd(-1, 1) }));
  },
};

// Teapot: a spotty china pot with Bip under a glass lid, on a ring of little blue flames.
function gasRing(ctx, h, p, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const n = 9;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, front = Math.sin(a) > 0;
      if ((pass === 0) === front) continue;
      const x = Math.cos(a) * 0.16 * h, y = 0.33 * h + Math.sin(a) * 0.03 * h;
      const L = h * (0.05 + 0.12 * p) * (0.8 + 0.3 * Math.sin(t * 30 + i * 2.1)) * (front ? 1 : 0.75);
      ctx.save(); ctx.translate(x, y);
      tear(ctx, L, h * 0.03);
      ctx.fillStyle = grad(ctx, 0, 0, 0, L, ['#E0F6FF', '#6FA8FF', 'rgba(60,90,255,0)']); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

const teapot = {
  id: 'teapot',
  look: 'A spotty china teapot. Little blue flames underneath, a rattling lid, and a big toot of steam when it lands.',
  fw: [['#4F7BEA', '#FFFFFF', SUN], [PINK, '#FFFFFF', '#4F7BEA'], [SUN, MINT, '#FFFFFF']],
  conf: ['#4F7BEA', '#FFFFFF', SUN, PINK, MINT],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (S.thrust > 0.02) gasRing(ctx, h, S.thrust, t);
    // three china feet
    const k = ease.back(clamp(S.legs, 0, 1));
    for (const fx of [0, -0.17, 0.17]) {
      const top = 0.26 * h, bot = (0.27 + 0.2 * k) * h, w = fx === 0 ? 0.04 : 0.05;
      if (S.legs > 0.01) {
        poly(ctx, [[fx - w, 0.26], [fx + w, 0.26], [fx + w * 0.6, bot / h], [fx - w * 0.6, bot / h]], h);
        ctx.fillStyle = fx === 0 ? '#E6E1F5' : '#FFFDF7'; ctx.fill(); outline(ctx, lw * 0.9);
      }
      ctx.beginPath(); ctx.ellipse(fx * h, Math.max(top, bot), (w + 0.025) * h, 0.026 * h, 0, 0, TAU);
      ctx.fillStyle = grad(ctx, (fx - w) * h, 0, (fx + w) * h, 0, GOLD); ctx.fill(); outline(ctx, lw * 0.9);
    }
    // the handle
    ctx.beginPath(); ctx.moveTo(-0.24 * h, -0.07 * h); ctx.bezierCurveTo(-0.52 * h, -0.12 * h, -0.52 * h, 0.27 * h, -0.22 * h, 0.2 * h);
    ctx.lineWidth = h * 0.09; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = h * 0.09 - lw * 2; ctx.strokeStyle = '#FFFDF7'; ctx.stroke();
    ctx.lineWidth = h * 0.012; ctx.strokeStyle = GOLD[2]; ctx.stroke();
    // the spout
    ctx.beginPath();
    ctx.moveTo(0.2 * h, -0.01 * h);
    ctx.bezierCurveTo(0.36 * h, -0.01 * h, 0.37 * h, -0.13 * h, 0.44 * h, -0.21 * h);
    ctx.lineTo(0.51 * h, -0.18 * h);
    ctx.bezierCurveTo(0.45 * h, -0.07 * h, 0.39 * h, 0.16 * h, 0.21 * h, 0.17 * h);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0.2 * h, 0, 0.5 * h, 0, ['#FFFFFF', '#F1EDFF', '#D9D2F2']); ctx.fill(); outline(ctx, lw);
    ctx.beginPath(); ctx.ellipse(0.475 * h, -0.195 * h, 0.04 * h, 0.018 * h, -0.45, 0, TAU); ctx.fillStyle = GOLD[1]; ctx.fill(); outline(ctx, lw * 0.8);
    // the pot
    const cy = 0.06 * h;
    ctx.beginPath(); ctx.ellipse(0, cy, 0.3 * h, 0.25 * h, 0, 0, TAU);
    const g = ctx.createRadialGradient(-0.1 * h, cy - 0.08 * h, 0.02 * h, 0, cy, 0.32 * h);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.6, '#F6F2FF'); g.addColorStop(1, '#D4CCF0');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    [[-0.17, 0.0], [0.0, 0.12], [0.16, -0.02], [-0.08, 0.2], [0.13, 0.19], [-0.22, 0.14], [0.22, 0.09], [0.06, -0.08], [-0.12, -0.1]].forEach(([x, y], i) => {
      ctx.fillStyle = i % 3 === 1 ? PINK : '#5A86F0';
      ctx.beginPath(); ctx.arc(x * h, cy + y * h, 0.034 * h, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(x * h - 0.01 * h, cy + y * h - 0.01 * h, 0.011 * h, 0, TAU); ctx.fill();
    });
    ctx.lineWidth = h * 0.022; ctx.strokeStyle = GOLD[2];
    ctx.beginPath(); ctx.ellipse(0, cy - 0.16 * h, 0.25 * h, 0.05 * h, 0, 0.05, Math.PI - 0.05); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, cy + 0.17 * h, 0.22 * h, 0.05 * h, 0, 0.05, Math.PI - 0.05); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-0.15 * h, cy - 0.08 * h, 0.05 * h, 0.09 * h, 0.5, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, cy, 0.3 * h, 0.25 * h, 0, 0, TAU); outline(ctx, lw);
    // the lid: a gold rim and a glass dome with Bip inside, rattling while it flies
    const rattle = Math.sin(t * 46) * 0.07 * S.thrust + (S.idle ? Math.sin(t * 40) * 0.04 * Math.pow(Math.max(0, Math.sin(t * 0.9)), 20) : 0);
    ctx.save(); ctx.translate(0, -0.17 * h - S.hop * 0.09 * h * Math.sin(S.hop * Math.PI)); ctx.rotate(rattle);
    bipGlass(ctx, 0, -0.1 * h, 0.14 * h, S, t, '#BDEBFF', '#3557B5');
    ctx.beginPath(); ctx.arc(0, -0.1 * h, 0.14 * h, 0, TAU); outline(ctx, lw);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.18 * h, 0.045 * h, 0, 0, TAU); ctx.fillStyle = grad(ctx, -0.18 * h, 0, 0.18 * h, 0, GOLD); ctx.fill(); outline(ctx, lw);
    ctx.beginPath(); ctx.arc(0, -0.26 * h, 0.035 * h, 0, TAU); ctx.fillStyle = grad(ctx, -0.04 * h, -0.3 * h, 0.04 * h, -0.22 * h, GOLD); ctx.fill(); outline(ctx, lw * 0.8);
    ctx.restore();
  },
  spoutTip(S) { return { x: S.x + 0.49 * S.h * S.sx, y: S.y - 0.2 * S.h * S.sy }; },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'st', 12 * p * P.k, dt, () => P.add({ kind: 'steam', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + 0.4 * h, vx: rnd(-50, 50), vy: rnd(60, 130), drag: 2.2, g: -60, life: rnd(0.6, 1.1), size: h * rnd(0.04, 0.07), grow: h * 0.12, layer: 'back' }));
    const tip = this.spoutTip(S);
    every(S, 'sw', 5 * P.k, dt, () => P.add({ kind: 'steam', x: tip.x, y: tip.y, vx: rnd(10, 40), vy: rnd(-60, -20), drag: 1.5, life: rnd(0.5, 0.9), size: h * 0.025, grow: h * 0.08, a: 0.7 }));
  },
  land(S, P) {
    S.hop = 1;
    dust(S, P, S.dust);
    const tip = this.spoutTip(S), h = S.h;
    for (let i = 0; i < Math.round(16 * P.k) + 4; i++) P.add({ kind: 'steam', x: tip.x, y: tip.y, vx: rnd(90, 230), vy: rnd(-260, -110), drag: 2.4, g: -30, life: rnd(0.8, 1.4), size: h * rnd(0.035, 0.06), grow: h * 0.2, delay: i * 0.01 });
    for (let i = 0; i < 3; i++) P.add({ kind: 'bubble', x: tip.x + i * 8, y: tip.y - 6, vx: rnd(10, 40), vy: rnd(-70, -45), drag: 0.6, life: 1.3 + i * 0.25, size: h * rnd(0.04, 0.06), sway: 3, swayAmp: 25, delay: 0.15 + i * 0.12 });
  },
  idle(S, P, dt) {
    const tip = this.spoutTip(S);
    every(S, 'id', 3 * P.k, dt, () => P.add({ kind: 'steam', x: tip.x, y: tip.y, vx: rnd(5, 25), vy: rnd(-40, -20), drag: 1, life: rnd(0.8, 1.2), size: S.h * 0.02, grow: S.h * 0.07, a: 0.6 }));
  },
};

// Bubble Pod: a glass ball in a spinning chrome ring with chasing lights; Bip sits inside.
const LIGHTS = [MINT, SKY, SUN, PINK];
// One of the pod's two chrome rings, tilted across the ball like a gyroscope's.
function podRing(ctx, h, S, t, front, tilt, dir) {
  const lw = lwOf(h), rx = 0.41 * h, ry = 0.12 * h;
  ctx.save(); ctx.translate(0, -0.07 * h); ctx.rotate(tilt);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
  ctx.lineWidth = h * 0.05 + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = h * 0.05; ctx.strokeStyle = grad(ctx, -rx, 0, rx, 0, SILVER); ctx.stroke();
  ctx.lineWidth = h * 0.01; ctx.strokeStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.ellipse(0, -h * 0.012, rx, ry, 0, front ? 0.2 : Math.PI + 0.2, front ? Math.PI - 0.2 : TAU - 0.2); ctx.stroke();
  const n = 10, lock = S.lock;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + S.spin * dir, s = Math.sin(a);
    if ((s > 0) !== front) continue;
    const x = Math.cos(a) * rx, y = s * ry;
    const b = 0.3 + 0.7 * Math.max(0, Math.cos(a * 2 - t * 7 * dir));
    const col = lock > 0.05 ? MINT : LIGHTS[(i + (dir > 0 ? 0 : 2)) % 4];
    glow(ctx, x, y, h * (front ? 0.075 : 0.05), col, (front ? 0.95 : 0.45) * Math.max(b, lock));
    ctx.fillStyle = mix(col, '#FFFFFF', 0.4); ctx.beginPath(); ctx.arc(x, y, h * (front ? 0.018 : 0.012), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

const pod = {
  id: 'pod',
  look: 'A glass ball held in two spinning chrome rings of chasing lights, with Bip sitting inside. Jets puff as you steer; the rings lock green on landing.',
  fw: [[MINT, SKY, '#FFFFFF'], [SUN, PINK, SKY], [SKY, '#FFFFFF', MINT]],
  conf: [MINT, SKY, SUN, PINK, '#FFFFFF'],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), cy = -0.07 * h, R = 0.29 * h;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (S.thrust > 0.02) {
      const L = h * (0.14 + 0.3 * S.thrust);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.translate(0, 0.31 * h); tear(ctx, L, h * 0.07);
      ctx.fillStyle = grad(ctx, 0, 0, 0, L, ['#FFFFFF', '#BFF8FF', 'rgba(95,227,189,0)']); ctx.fill();
      ctx.restore();
      glow(ctx, 0, 0.33 * h, h * 0.2, SKY, 0.6 * S.thrust);
    }
    struts(ctx, h, S.legs, { hip: [0.08, 0.24], foot0: [0.11, 0.3], foot1: [0.22, 0.465], col: '#C9D1E6', w: 0.05 });
    // the cradle under the ball
    poly(ctx, [[-0.15, 0.17], [0.15, 0.17], [0.09, 0.3], [-0.09, 0.3]], h);
    ctx.fillStyle = grad(ctx, -0.15 * h, 0, 0.15 * h, 0, SILVER); ctx.fill(); outline(ctx, lw);
    rr(ctx, -0.07 * h, 0.28 * h, 0.14 * h, 0.04 * h, 0.015 * h); ctx.fillStyle = '#5B5F8A'; ctx.fill(); outline(ctx, lw);
    podRing(ctx, h, S, t, false, 0.45, 1);
    podRing(ctx, h, S, t, false, -0.45, -1);
    // the glass ball, with Bip sitting inside
    ctx.save();
    ctx.beginPath(); ctx.arc(0, cy, R, 0, TAU); ctx.clip();
    const back = ctx.createRadialGradient(0, cy, R * 0.2, 0, cy, R);
    back.addColorStop(0, 'rgba(70,110,210,.35)'); back.addColorStop(1, 'rgba(30,50,140,.55)');
    ctx.fillStyle = back; ctx.fillRect(-R, cy - R, R * 2, R * 2);
    rr(ctx, -0.14 * h, cy + R * 0.5, 0.28 * h, 0.1 * h, 0.045 * h); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.8);
    if (S.pilotIn !== false) drawPilot(ctx, { x: 0, y: cy + R * 0.7, s: R * 1.12, wave: S.wave, mood: S.mood || 'happy', blink: S.blink }, t);
    const g = ctx.createRadialGradient(-R * 0.25, cy - R * 0.3, R * 0.1, 0, cy, R);
    g.addColorStop(0, 'rgba(230,252,255,.08)'); g.addColorStop(0.75, 'rgba(160,235,255,.18)'); g.addColorStop(1, 'rgba(120,215,255,.6)');
    ctx.fillStyle = g; ctx.fillRect(-R, cy - R, R * 2, R * 2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, cy, R, 0, TAU); outline(ctx, lw);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = h * 0.035;
    ctx.beginPath(); ctx.arc(0, cy, R * 0.8, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    ctx.lineWidth = h * 0.02; ctx.beginPath(); ctx.arc(0, cy, R * 0.82, Math.PI * 0.18, Math.PI * 0.3); ctx.stroke();
    ctx.restore();
    podRing(ctx, h, S, t, true, 0.45, 1);
    podRing(ctx, h, S, t, true, -0.45, -1);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'rw', 4.5 * p * P.k, dt, () => P.add({ kind: 'ring', x: S.x, y: S.y + 0.36 * h, vy: 110, life: 0.6, size: h * 0.08, grow: h * 0.35, flat: 0.28, col: SKY, lw: 5, layer: 'back' }));
    every(S, 'gl', 26 * p * P.k, dt, () => P.add({ kind: 'glow', x: S.x + rnd(-0.05, 0.05) * h, y: S.y + 0.36 * h, vx: rnd(-40, 40), vy: rnd(90, 200), drag: 2, life: rnd(0.3, 0.6), size: h * rnd(0.015, 0.03), col: pick(['#FFFFFF', SKY, MINT]), layer: 'back' }));
    const st = S.steer || 0;
    if (Math.abs(st) > 0.15) every(S, 'jet', 14 * Math.abs(st) * P.k, dt, () => { const s = st > 0 ? -1 : 1; P.add({ kind: 'smoke', x: S.x + s * 0.53 * h, y: S.y + 0.02 * h, vx: s * rnd(80, 160), vy: rnd(-20, 20), drag: 3, life: 0.5, size: h * 0.035, grow: h * 0.12, col: '#E6FBFF', a: 0.7 }); });
  },
  land(S, P) {
    S.lock = 1;
    dust(S, P, S.dust, 10);
    P.add({ kind: 'ring', x: S.x, y: S.gy, life: 0.9, size: S.h * 0.2, grow: S.h * 1.6, flat: 0.2, col: MINT, lw: 8 });
    burst(P, S.x, S.y + 0.02 * S.h, 14, [MINT, '#FFFFFF', SKY], { kind: 'glow', size: [2, 5], sp: 220, g: 0, add: true });
  },
  idle(S, P, dt, t) {
    S.wave = Math.sin(t * 0.8) > 0.55;
    every(S, 'jet', 0.5 * P.k, dt, () => { for (const s of [-1, 1]) P.add({ kind: 'smoke', x: S.x + s * 0.53 * S.h, y: S.y + 0.02 * S.h, vx: s * 90, drag: 3, life: 0.5, size: S.h * 0.03, grow: S.h * 0.1, col: '#E6FBFF', a: 0.6 }); });
  },
};

// Saucer: a humming disc with a glass dome and chasing rim bulbs, riding a beam of light.
const BULBS = [CORAL, SUN, MINT, SKY, LILAC, PINK];
const saucer = {
  id: 'saucer',
  look: 'A humming disc with a glass dome and chasing rim bulbs. A beam of light reaches the ground before it does; ripples spread when it lands.',
  fw: [[SKY, LILAC, '#FFFFFF'], [MINT, SKY, SUN], [PINK, LILAC, SKY]],
  conf: [SKY, LILAC, MINT, PINK, '#FFFFFF'],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.save();
    if (S.air) ctx.rotate(Math.sin(t * 3.1) * 0.06);
    // the beam, down to the ground
    const beam = clamp(S.air ? 0.4 + 0.6 * S.thrust : (S.idle ? 0.35 : 0), 0, 1);
    if (beam > 0.02) {
      const top = 0.2 * h, ground = Math.max(top + 4, ((S.gy - S.y) / (S.sy || 1)));
      const bot = S.inPlay ? Math.min(ground, top + 0.55 * h) : ground; // D-045: in play, short of the ground
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const bg = ctx.createLinearGradient(0, top, 0, bot);
      bg.addColorStop(0, rgba(SKY, 0.5 * beam)); bg.addColorStop(1, rgba(SKY, 0.1 * beam));
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(-0.08 * h, top); ctx.lineTo(0.08 * h, top); ctx.lineTo(0.3 * h, bot); ctx.lineTo(-0.3 * h, bot); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = rgba('#FFFFFF', 0.22 * beam);
      const step = 0.07 * h, off = (t * 0.25 * h) % step;
      for (let y = top + off; y < bot; y += step) ctx.fillRect(-0.4 * h, y, 0.8 * h, h * 0.012);
      ctx.restore();
      ctx.fillStyle = rgba(SKY, 0.35 * beam); ctx.beginPath(); ctx.ellipse(0, bot, 0.32 * h, 0.05 * h, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // three thin legs
    if (S.legs > 0.01) {
      const k = ease.back(clamp(S.legs, 0, 1));
      for (const s of [-1, 0, 1]) {
        const hx = s * 0.22 * h, hy = 0.17 * h, fx = s * lerp(0.24, 0.36, k) * h, fy = lerp(0.24, 0.47, k) * h;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy);
        ctx.lineWidth = h * 0.035 + lw * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = h * 0.035; ctx.strokeStyle = '#C9D1E6'; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(fx, fy + 0.012 * h, 0.04 * h, 0.018 * h, 0, 0, TAU); ctx.fillStyle = '#7C82B8'; ctx.fill(); outline(ctx, lw * 0.8);
      }
    }
    // the underside and its glowing emitter
    ctx.save(); ctx.beginPath(); ctx.rect(-0.6 * h, 0.1 * h, 1.2 * h, 0.3 * h); ctx.clip();
    ctx.beginPath(); ctx.ellipse(0, 0.11 * h, 0.42 * h, 0.11 * h, 0, 0, TAU);
    ctx.fillStyle = grad(ctx, 0, 0.1 * h, 0, 0.22 * h, ['#6E73A8', '#3E427A']); ctx.fill(); outline(ctx, lw);
    ctx.restore();
    const em = 0.35 + 0.65 * beam;
    glow(ctx, 0, 0.2 * h, h * 0.16, SKY, em);
    ctx.beginPath(); ctx.ellipse(0, 0.2 * h, 0.09 * h, 0.03 * h, 0, 0, TAU); ctx.fillStyle = mix('#3E427A', '#E6FBFF', em); ctx.fill(); outline(ctx, lw * 0.8);
    // the dome with Bip, then the top of the hull over its foot
    bipGlass(ctx, 0, -0.1 * h, 0.19 * h, S, t, '#C8F6FF', '#3B5BC0', -0.12, 0.56);
    ctx.beginPath(); ctx.arc(0, -0.1 * h, 0.19 * h, Math.PI, TAU); outline(ctx, lw);
    ctx.beginPath(); ctx.ellipse(0, 0.1 * h, 0.47 * h, 0.17 * h, 0, Math.PI, TAU); ctx.closePath();
    ctx.fillStyle = grad(ctx, -0.3 * h, -0.06 * h, 0.3 * h, 0.1 * h, ['#FFFFFF', '#E3E6FA', '#AEB4DD', '#8D93C6']); ctx.fill(); outline(ctx, lw);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0.1 * h, 0.47 * h, 0.17 * h, 0, Math.PI, TAU); ctx.clip();
    ctx.strokeStyle = 'rgba(80,86,150,.45)'; ctx.lineWidth = lw * 0.6;
    ctx.beginPath(); ctx.ellipse(0, 0.1 * h, 0.33 * h, 0.1 * h, 0, Math.PI, TAU); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, -0.05 * h, 0.2 * h, 0.035 * h, 0, 0, Math.PI); ctx.lineWidth = h * 0.02; ctx.strokeStyle = GOLD[1]; ctx.stroke();
    // the rim and its bulbs
    ctx.beginPath(); ctx.ellipse(0, 0.11 * h, 0.5 * h, 0.065 * h, 0, 0, TAU);
    ctx.fillStyle = grad(ctx, -0.5 * h, 0, 0.5 * h, 0, ['#B9BEE6', '#8A90C4', '#6E73A8']); ctx.fill(); outline(ctx, lw);
    const chase = Math.floor(t * 9);
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (0.06 + 0.88 * (i / 10)), x = -Math.cos(a) * 0.47 * h, y = 0.11 * h + Math.sin(a) * 0.055 * h;
      const col = BULBS[(i + chase) % BULBS.length], on = (i + chase) % 3 === 0;
      glow(ctx, x, y, h * 0.06, col, on ? 0.9 : 0.35);
      ctx.fillStyle = mix(col, '#FFFFFF', on ? 0.5 : 0.1); ctx.beginPath(); ctx.arc(x, y, h * 0.02, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
  thrust(S, P, dt) {
    const h = S.h;
    const reach = S.inPlay ? Math.min(h * 0.55, S.gy - S.y - h * 0.2) : S.gy - S.y - h * 0.2; // D-045
    every(S, 'mo', 14 * P.k, dt, () => { const y = S.y + h * 0.2 + Math.random() * Math.max(0, reach); P.add({ kind: 'glow', x: S.x + rnd(-0.18, 0.18) * h * (0.5 + (y - S.y) / Math.max(1, S.gy - S.y)), y, vy: rnd(-70, -30), life: rnd(0.5, 0.9), size: h * rnd(0.012, 0.025), col: pick(['#FFFFFF', SKY]), layer: 'back' }); });
  },
  land(S, P) {
    for (let i = 0; i < 3; i++) P.add({ kind: 'ring', x: S.x, y: S.gy, life: 1.0, size: S.h * 0.25, grow: S.h * 1.5, flat: 0.16, col: i === 1 ? LILAC : SKY, lw: 7, delay: i * 0.17 });
    dust(S, P, S.dust, 8);
  },
  idle(S, P, dt) { this.thrust(S, P, dt * 0.4); },
};

// Crystal Comet: a rocket of cut ice-blue crystal with silver trim and a glittering tail.
const CR = { N: [0, -0.53], R1: [0.15, -0.25], R2: [0.2, 0.02], R3: [0.15, 0.3], B: [0, 0.38], L1: [-0.15, -0.25], L2: [-0.2, 0.02], L3: [-0.15, 0.3], C1: [0.01, -0.22], C2: [0.03, 0.05], C3: [0.0, 0.3] };
const CR_FACETS = [['N', 'R1', 'C1', 1], ['N', 'C1', 'L1', 5], ['R1', 'R2', 'C2', 'C1', 0], ['L1', 'C1', 'C2', 'L2', 2], ['R2', 'R3', 'C3', 'C2', 1], ['L2', 'C2', 'C3', 'L3', 4], ['R3', 'B', 'C3', 2], ['L3', 'C3', 'B', 4]];
const CR_OUT = ['N', 'R1', 'R2', 'R3', 'B', 'L3', 'L2', 'L1'];

const crystal = {
  id: 'crystal',
  look: 'Cut ice-blue crystal with silver trim and glints sweeping across it. A long glittering comet tail; crystal shards ring up out of the ground when it lands.',
  fw: [[SKY, '#FFFFFF', LILAC], ['#C6F5FF', PINK, '#FFFFFF'], [LILAC, SKY, '#FFFFFF']],
  conf: ['#FFFFFF', '#C6F5FF', '#93E2FA', LILAC, '#FFC6F0'],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), P = (n) => [CR[n][0] * h, CR[n][1] * h];
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (S.thrust > 0.02) {
      const L = h * (0.2 + 0.42 * S.thrust);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, 0.36 * h);
      tear(ctx, L, h * 0.085); ctx.fillStyle = grad(ctx, 0, 0, 0, L, ['#FFFFFF', '#C6F5FF', '#7FB8FF', 'rgba(127,184,255,0)']); ctx.fill();
      tear(ctx, L * 0.55, h * 0.04); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
      ctx.restore();
      glow(ctx, 0, 0.42 * h, h * 0.22, SKY, 0.5 * S.thrust);
    }
    struts(ctx, h, S.legs, {
      hip: [0.11, 0.24], foot0: [0.14, 0.3], foot1: [0.24, 0.45], col: '#E8ECF7', w: 0.04,
      foot: (fx, fy) => { ctx.beginPath(); ctx.moveTo(fx - 0.06 * h, fy + 0.05 * h); ctx.lineTo(fx, fy - 0.03 * h); ctx.lineTo(fx + 0.06 * h, fy + 0.05 * h); ctx.closePath(); ctx.fillStyle = grad(ctx, fx - 0.06 * h, 0, fx + 0.06 * h, 0, [ICE[1], ICE[3]]); ctx.fill(); outline(ctx, lw * 0.8); },
    });
    // crystal fins, two facets each
    for (const s of [-1, 1]) {
      const a = [s * 0.17, 0.0], b = [s * 0.43, 0.37], c = [s * 0.15, 0.28], m = [s * 0.26, 0.21];
      poly(ctx, [a, b, m], h); ctx.fillStyle = s < 0 ? ICE[3] : ICE[1]; ctx.fill();
      poly(ctx, [m, b, c], h); ctx.fillStyle = s < 0 ? ICE[4] : ICE[2]; ctx.fill();
      ctx.beginPath(); ctx.moveTo(m[0] * h, m[1] * h); ctx.lineTo(b[0] * h, b[1] * h); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
      poly(ctx, [a, b, c], h); outline(ctx, lw);
    }
    // the body's facets
    for (const f of CR_FACETS) {
      const pts = f.slice(0, -1).map((n) => CR[n]);
      poly(ctx, pts, h); ctx.fillStyle = ICE[f[f.length - 1]]; ctx.fill();
    }
    ctx.save(); poly(ctx, CR_OUT.map((n) => CR[n]), h); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = lw * 0.55;
    for (const f of CR_FACETS) { poly(ctx, f.slice(0, -1).map((n) => CR[n]), h); ctx.stroke(); }
    glow(ctx, 0, 0.06 * h, h * 0.3, SKY, 0.35 + 0.15 * Math.sin(t * 3));
    sweep(ctx, h, t, 0.42, 'rgba(255,255,255,.6)', 0.07);
    sweep(ctx, h, t + 0.35, 0.42, 'rgba(255,190,240,.35)', 0.03);
    ctx.restore();
    // silver trim at the collar and the base
    for (const [l, r] of [['L1', 'R1'], ['L3', 'R3']]) {
      ctx.beginPath(); ctx.moveTo(...P(l)); ctx.lineTo(0, (CR[l][1] + 0.03) * h); ctx.lineTo(...P(r));
      ctx.lineWidth = h * 0.04 + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.lineWidth = h * 0.04; ctx.strokeStyle = grad(ctx, CR[l][0] * h, 0, CR[r][0] * h, 0, SILVER); ctx.stroke();
    }
    poly(ctx, CR_OUT.map((n) => CR[n]), h); outline(ctx, lw);
    porthole(ctx, 0, -0.04 * h, 0.1 * h, S, t, lw, { frame: grad(ctx, -0.13 * h, -0.17 * h, 0.13 * h, 0.09 * h, SILVER), bolt: ICE[2], inner: '#D5F8FF', outer: '#2B6FCB' });
    // twinkles at the points
    ctx.fillStyle = '#FFFFFF';
    [['N', 0], ['R2', 1.7], ['L2', 3.1], ['B', 4.4]].forEach(([n, ph]) => { const s = Math.max(0, Math.sin(t * 2.6 + ph)); if (s > 0.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; sparkle(ctx, CR[n][0] * h, CR[n][1] * h, h * 0.06 * s); ctx.restore(); } });
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust, y = S.y + 0.4 * h;
    every(S, 'tail', 60 * p * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.12, 0.12) * h, y: y - rnd(0, 0.5) * h, vx: rnd(-35, 35), vy: rnd(-70, 0), g: -30, drag: 0.8, life: rnd(1.3, 2.2), size: h * rnd(0.035, 0.075), col: pick(['#FFFFFF', '#C6F5FF', LILAC, '#FFC6F0', SKY]), tw: rnd(10, 24), ph: Math.random() * 6, rot: Math.random(), add: true, layer: 'back' }));
    every(S, 'mote', 22 * p * P.k, dt, () => P.add({ kind: 'glow', x: S.x + rnd(-0.05, 0.05) * h, y, vx: rnd(-30, 30), vy: rnd(40, 140), drag: 1.5, life: rnd(0.4, 0.8), size: h * 0.025, col: SKY, layer: 'back' }));
    every(S, 'prism', 3 * P.k, dt, () => P.add({ kind: 'prism', x: S.x + rnd(-0.25, 0.25) * h, y: S.y + rnd(-0.3, 0.3) * h, life: 0.35, size: h * 0.08 }));
  },
  land(S, P) {
    const h = S.h, n = Math.max(6, Math.round(12 * P.k));
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1, d = (0.32 + (i >> 1) * (0.42 / (n / 2))) * h;
      P.add({ kind: 'shard', x: S.x + s * d, y: S.gy + 2, life: 1.3, size: h * rnd(0.16, 0.3), rot: s * rnd(0.05, 0.3), delay: (i >> 1) * 0.04, layer: 'back' });
    }
    for (let i = 0; i < 8; i++) { const s = i % 2 ? 1 : -1; P.add({ kind: 'prism', x: S.x + s * 0.2 * h, y: S.gy - 4, vx: s * rnd(120, 260), drag: 1.5, life: 0.9, size: h * 0.1, delay: 0.1 }); }
    burst(P, S.x, S.y - h * 0.1, 18, ['#FFFFFF', '#C6F5FF', LILAC], { add: true, sp: 200 });
    dust(S, P, '#E6FBFF', 8);
  },
  finale(S, P, W) { for (let i = 0; i < Math.round(30 * P.k); i++) P.add({ kind: 'star', x: S.x + rnd(-0.45, 0.45) * W, y: rnd(-20, S.gy * 0.4), vy: rnd(40, 90), life: rnd(1.5, 2.5), size: S.h * rnd(0.025, 0.05), col: pick(['#FFFFFF', '#C6F5FF', LILAC]), tw: 18, add: true, delay: Math.random() * 0.6 }); },
  idle(S, P, dt) {
    every(S, 'id', 5 * P.k, dt, () => { const a = Math.random() * TAU, r = S.h * rnd(0.3, 0.6); P.add({ kind: 'star', x: S.x + Math.cos(a) * r, y: S.y + Math.sin(a) * r * 0.8, vy: -12, life: rnd(1.0, 1.8), size: S.h * rnd(0.02, 0.04), col: pick(['#FFFFFF', '#C6F5FF', LILAC]), tw: 14, add: true }); });
  },
};

// Golden Phoenix: a golden firebird of a rocket, with wings of light that beat to slow it.
function phoenixWing(ctx, h, s, open, flapT, t) {
  const ax = s * 0.15 * h, ay = -0.06 * h, n = 6;
  const flap = open * 0.25 * Math.sin(flapT);
  ctx.save(); ctx.translate(ax, ay); ctx.globalCompositeOperation = 'lighter';
  for (let i = n - 1; i >= 0; i--) {
    const ang = lerp(1.32 + i * 0.05, -0.62 + i * 0.3, open) + flap * (1 - i * 0.12);
    const L = h * (0.2 + 0.5 * open) * (1 - i * 0.08);
    ctx.save(); ctx.scale(s, 1); ctx.rotate(-Math.PI / 2 + ang);
    featherPath(ctx, L, L * 0.2);
    const g = ctx.createLinearGradient(0, 0, 0, L);
    g.addColorStop(0, 'rgba(255,240,170,.95)'); g.addColorStop(0.45, 'rgba(255,170,60,.7)'); g.addColorStop(1, 'rgba(255,80,50,0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1, h * 0.008); ctx.strokeStyle = `rgba(255,248,210,${0.35 + 0.3 * open})`; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  if (open > 0.2) glow(ctx, ax + s * 0.15 * h * open, ay, h * 0.35 * open, '#FFB347', 0.25 * open + 0.05 * Math.sin(t * 6));
}

function phoenixBody(ctx, h) {
  ctx.beginPath();
  ctx.moveTo(0, -0.47 * h);
  ctx.bezierCurveTo(0.13 * h, -0.47 * h, 0.22 * h, -0.2 * h, 0.2 * h, 0.0);
  ctx.bezierCurveTo(0.19 * h, 0.15 * h, 0.1 * h, 0.27 * h, 0, 0.3 * h);
  ctx.bezierCurveTo(-0.1 * h, 0.27 * h, -0.19 * h, 0.15 * h, -0.2 * h, 0.0);
  ctx.bezierCurveTo(-0.22 * h, -0.2 * h, -0.13 * h, -0.47 * h, 0, -0.47 * h);
  ctx.closePath();
}

const phoenix = {
  id: 'phoenix',
  look: 'A gold and flame-orange firebird. Wings of light unfold and beat slowly to brake it; golden feathers drift down when it lands.',
  fw: [[SUN, '#FFF3B0', '#FF7A2F'], ['#FF5D2E', SUN, '#FFFFFF'], ['#E8364F', '#FFB347', SUN]],
  conf: [SUN, '#FFE48A', '#FF7A2F', '#E8364F', '#FFFFFF'],
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), o = clamp(S.open, 0, 1);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    phoenixWing(ctx, h, -1, o, S.flapT, t);
    phoenixWing(ctx, h, 1, o, S.flapT, t);
    if (S.thrust > 0.02) {
      const L = h * (0.16 + 0.3 * S.thrust);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, 0.32 * h);
      tear(ctx, L, h * 0.09); ctx.fillStyle = grad(ctx, 0, 0, 0, L, ['#FFF3B0', '#FFB347', '#FF5D2E', 'rgba(232,54,79,0)']); ctx.fill();
      ctx.restore();
    }
    struts(ctx, h, S.legs, {
      hip: [0.1, 0.18], foot0: [0.13, 0.28], foot1: [0.2, 0.47], col: GOLD[2], w: 0.045,
      foot: (fx, fy, s) => { ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.6; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(fx, fy - 0.01 * h); ctx.quadraticCurveTo(fx + d * 0.05 * h, fy, fx + d * 0.06 * h, fy + 0.03 * h); ctx.stroke(); } ctx.strokeStyle = GOLD[1]; ctx.lineWidth = lw * 0.7; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(fx, fy - 0.01 * h); ctx.quadraticCurveTo(fx + d * 0.05 * h, fy, fx + d * 0.06 * h, fy + 0.03 * h); ctx.stroke(); } },
    });
    // tail feathers fanned under the body
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 0.27 + Math.sin(t * 3 + i) * 0.05, L = h * (i === 2 ? 0.25 : 0.2);
      ctx.save(); ctx.translate(0, 0.22 * h); ctx.rotate(off);
      featherPath(ctx, L, L * 0.26);
      ctx.fillStyle = grad(ctx, 0, 0, 0, L, [GOLD[1], '#FF9F3A', '#E8364F']); ctx.fill(); outline(ctx, lw * 0.8);
      ctx.beginPath(); ctx.moveTo(0, L * 0.1); ctx.lineTo(0, L * 0.85); ctx.lineWidth = lw * 0.5; ctx.strokeStyle = 'rgba(120,40,0,.6)'; ctx.stroke();
      ctx.restore();
    }
    // the crest: three plumes of flame
    [[-0.065, -0.43, -0.35, 0.14], [0, -0.46, 0, 0.18], [0.065, -0.43, 0.35, 0.14]].forEach(([x, y, a, L], i) => {
      const fl = 0.9 + 0.15 * Math.sin(t * 9 + i * 2);
      ctx.save(); ctx.translate(x * h, y * h); ctx.rotate(Math.PI + a); ctx.scale(1, fl);
      tear(ctx, L * h, 0.045 * h);
      ctx.fillStyle = grad(ctx, 0, 0, 0, L * h, ['#FFE066', '#FF9F3A', '#E8364F']); ctx.fill(); outline(ctx, lw * 0.8);
      ctx.restore();
    });
    // the golden body, with scale-like feathers on its belly
    phoenixBody(ctx, h);
    ctx.fillStyle = grad(ctx, -0.2 * h, -0.3 * h, 0.22 * h, 0.25 * h, GOLD); ctx.fill();
    ctx.save(); phoenixBody(ctx, h); ctx.clip();
    ctx.strokeStyle = 'rgba(190,110,10,.55)'; ctx.lineWidth = lw * 0.6;
    for (let r = 0; r < 4; r++) {
      const y = (0.07 + r * 0.055) * h, off = r % 2 ? 0.035 : 0;
      for (let x = -0.24 + off; x < 0.26; x += 0.07) { ctx.beginPath(); ctx.arc(x * h, y, 0.035 * h, 0.15, Math.PI - 0.15); ctx.stroke(); }
    }
    sweep(ctx, h, t, 0.35, 'rgba(255,255,230,.45)', 0.06);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-0.1 * h, -0.2 * h, 0.035 * h, 0.12 * h, 0.25, 0, TAU); ctx.fill();
    ctx.restore();
    phoenixBody(ctx, h); outline(ctx, lw);
    // a crimson gem, and Bip's gold-framed window
    poly(ctx, [[0, -0.4], [0.035, -0.35], [0, -0.3], [-0.035, -0.35]], h); ctx.fillStyle = '#E8364F'; ctx.fill(); outline(ctx, lw * 0.8);
    ctx.fillStyle = '#FFFFFF'; sparkle(ctx, -0.008 * h, -0.36 * h, 0.012 * h);
    porthole(ctx, 0, -0.13 * h, 0.105 * h, S, t, lw, { frame: grad(ctx, -0.14 * h, -0.27 * h, 0.14 * h, 0.01 * h, GOLD), bolt: '#E8364F', inner: '#FFE7B0', outer: '#B5452A' });
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust, y = S.y + 0.42 * h;
    every(S, 'ff', 16 * p * P.k, dt, () => { const vx = rnd(-50, 50), vy = rnd(80, 170); P.add({ kind: 'fflame', x: S.x + rnd(-0.05, 0.05) * h, y, vx, vy, drag: 2, life: rnd(0.35, 0.65), size: h * rnd(0.07, 0.12), rot: Math.atan2(vy, vx) - Math.PI / 2, layer: 'back' }); });
    every(S, 'em', 26 * p * P.k, dt, () => P.add({ kind: 'ember', x: S.x + rnd(-0.12, 0.12) * h, y: y - 0.05 * h, vx: rnd(-60, 60), vy: rnd(20, 120), g: -60, drag: 1.4, life: rnd(0.8, 1.5), size: h * rnd(0.012, 0.025), col: pick(['#FFE066', '#FF9F3A', '#FF5D2E']), ph: Math.random() * 6, sway: 4, swayAmp: 30, layer: 'back' }));
  },
  land(S, P) {
    const h = S.h, n = Math.max(6, Math.round(18 * P.k));
    for (let i = 0; i < n; i++) P.add({ kind: 'feather', x: S.x + rnd(-0.2, 0.2) * h, y: S.y - rnd(0, 0.2) * h, vx: rnd(-170, 170), vy: rnd(-280, -120), g: 110, drag: 1.7, life: rnd(2.2, 3.2), size: h * rnd(0.08, 0.13), rot: Math.random() * 6, vr: rnd(-1, 1), ph: Math.random() * 6, sway: rnd(2, 3.5), swayAmp: 40 });
    burst(P, S.x, S.y - h * 0.1, 18, [SUN, '#FFF3B0', '#FF9F3A'], { add: true, sp: 210 });
    dust(S, P, '#FFE7B0', 10);
  },
  finale(S, P, W) { for (let i = 0; i < Math.round(12 * P.k); i++) P.add({ kind: 'feather', x: S.x + rnd(-0.4, 0.4) * W, y: rnd(-40, -10), vy: rnd(30, 60), g: 0, life: rnd(3, 4), size: S.h * rnd(0.08, 0.12), rot: Math.random() * 6, ph: Math.random() * 6, sway: 2.5, swayAmp: 50, delay: Math.random() * 0.8 }); },
  idle(S, P, dt) {
    every(S, 'em', 6 * P.k, dt, () => P.add({ kind: 'ember', x: S.x + rnd(-0.1, 0.1) * S.h, y: S.y + 0.3 * S.h, vx: rnd(-20, 20), vy: rnd(-60, -30), drag: 0.6, life: rnd(1.0, 1.8), size: S.h * rnd(0.012, 0.022), col: pick(['#FFE066', '#FF9F3A']), ph: Math.random() * 6, sway: 3, swayAmp: 20 }));
  },
  tick(S, dt, t) { S.openT = S.air ? 0.35 + 0.65 * S.thrust : S.idle ? 0.45 + 0.1 * Math.sin(t * 1.5) : 0; },
};

// Aurora Cruiser: pearl and chrome, rainbow lights, a halo of stars and northern-lights ribbons.
function auroraBody(ctx, h) {
  ctx.beginPath();
  ctx.moveTo(0, -0.55 * h);
  ctx.bezierCurveTo(0.07 * h, -0.5 * h, 0.15 * h, -0.32 * h, 0.16 * h, -0.1 * h);
  ctx.bezierCurveTo(0.17 * h, 0.08 * h, 0.15 * h, 0.22 * h, 0.11 * h, 0.31 * h);
  ctx.lineTo(-0.11 * h, 0.31 * h);
  ctx.bezierCurveTo(-0.15 * h, 0.22 * h, -0.17 * h, 0.08 * h, -0.16 * h, -0.1 * h);
  ctx.bezierCurveTo(-0.15 * h, -0.32 * h, -0.07 * h, -0.5 * h, 0, -0.55 * h);
  ctx.closePath();
}

function halo(ctx, h, t, front) {
  const n = 10, rx = 0.5 * h, ry = 0.13 * h, cy = -0.06 * h;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * 0.9, s = Math.sin(a);
    if ((s > 0) !== front) continue;
    const x = Math.cos(a) * rx, y = cy + s * ry - Math.cos(a) * 0.06 * h;
    const tw = 0.6 + 0.4 * Math.sin(t * 7 + i * 1.7), hue = (i * 36 + t * 60) % 360;
    glowHue(ctx, x, y, h * (front ? 0.1 : 0.065) * tw, hue, front ? 1 : 0.5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFFFFF'; sparkle(ctx, x, y, h * (front ? 0.045 : 0.028) * tw); ctx.restore();
  }
}

function petals(ctx, h, open, t) {
  if (open < 0.03) return;
  const angs = [-2.75, -2.25, -1.8, -1.34, -0.89, -0.39];
  ctx.save(); ctx.translate(0, 0.02 * h);
  angs.forEach((a0, i) => {
    const a = lerp(-Math.PI / 2 + (a0 + Math.PI / 2) * 0.25, a0, open) + Math.sin(t * 1.2 + i) * 0.03;
    const L = h * 0.62 * open, W = h * 0.12 * open;
    ctx.save(); ctx.rotate(a - Math.PI / 2);
    featherPath(ctx, L, W);
    const hue = (i * 50 + t * 40) % 360;
    const g = ctx.createLinearGradient(0, 0, 0, L);
    g.addColorStop(0, hsl(hue, 95, 88, 0.85)); g.addColorStop(0.6, hsl(hue + 60, 95, 72, 0.6)); g.addColorStop(1, hsl(hue + 120, 95, 68, 0.45));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1, h * 0.008); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = Math.max(0.8, h * 0.005);
    for (const f of [0.35, 0.6, 0.82]) { ctx.beginPath(); ctx.moveTo(-W * 0.7 * Math.sin(f * Math.PI), L * f); ctx.lineTo(W * 0.7 * Math.sin(f * Math.PI), L * f); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, L * 0.95); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

const aurora = {
  id: 'aurora',
  look: 'Pearl and chrome with rainbow running lights and a halo of stars. Rainbow ribbons stream behind it like the northern lights; solar sails open like petals when it lands.',
  fw: [['#FF5D73', '#FFC93C', '#FFFFFF'], ['#5FE3BD', '#8CF5FF', '#FFFFFF'], ['#B9A7FF', '#FF8FB1', '#FFFFFF'], ['#FFC93C', '#5FE3BD', '#8CF5FF'], ['#FF8FB1', '#B9A7FF', '#FFC93C']],
  conf: ['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF', '#FF8FB1', '#FFFFFF'],
  drawTrail(ctx, S, t) {
    const tr = S.trail;
    if (tr.length < 3) return;
    const h = S.h;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const pass of [0, 1]) {
      for (let r = 0; r < 4; r++) {
        const hue = r * 75 + t * 70;
        for (let i = 1; i < tr.length; i++) {
          const u = i / tr.length, a = tr[i - 1], b = tr[i];
          const off = (u0) => (S.calm ? 0 : Math.sin(u0 * 6 - t * 4 + r * 1.6) * h * 0.22 * u0) + (r - 1.5) * h * 0.11 * u0; // calm: no ripple
          ctx.strokeStyle = hsl(hue + u * 120, 100, pass ? 72 : 60, (pass ? 0.85 : 0.25) * (1 - u));
          ctx.lineWidth = Math.max(1, h * (pass ? 0.09 : 0.22) * (1 - u * 0.5));
          ctx.beginPath(); ctx.moveTo(a.x + off((i - 1) / tr.length), a.y); ctx.lineTo(b.x + off(u), b.y); ctx.stroke();
        }
      }
    }
    ctx.restore();
  },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), hue = t * 40;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    glowHue(ctx, 0, 0.0, h * 0.75, hue + 200, 0.32);
    glowHue(ctx, 0, 0.25 * h, h * 0.45, hue + 320, 0.25);
    petals(ctx, h, clamp(S.open, 0, 1), t);
    halo(ctx, h, t, false);
    if (S.thrust > 0.02) {
      const L = h * (0.2 + 0.4 * S.thrust);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, 0.39 * h);
      tear(ctx, L, h * 0.08);
      const g = ctx.createLinearGradient(0, 0, 0, L);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, hsl(hue + 300, 100, 80, 0.9)); g.addColorStop(0.7, hsl(hue + 180, 100, 70, 0.5)); g.addColorStop(1, hsl(hue, 100, 70, 0));
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
    struts(ctx, h, S.legs, { hip: [0.1, 0.24], foot0: [0.13, 0.3], foot1: [0.25, 0.465], col: '#EEF1FA', w: 0.035, pad: '#9AA3C4' });
    // swept chrome fins with rainbow edges, and little canards
    for (const s of [-1, 1]) {
      const fin = [[s * 0.15, 0.0], [s * 0.42, 0.3], [s * 0.38, 0.4], [s * 0.12, 0.29]];
      poly(ctx, fin, h); ctx.fillStyle = grad(ctx, s * 0.12 * h, 0, s * 0.42 * h, 0.4 * h, SILVER); ctx.fill();
      ctx.lineWidth = h * 0.02; ctx.strokeStyle = hsl(hue + (s > 0 ? 0 : 180), 100, 70); ctx.beginPath(); ctx.moveTo(s * 0.15 * h, 0); ctx.lineTo(s * 0.42 * h, 0.3 * h); ctx.stroke();
      poly(ctx, fin, h); outline(ctx, lw);
      poly(ctx, [[s * 0.14, -0.22], [s * 0.26, -0.11], [s * 0.15, -0.08]], h); ctx.fillStyle = grad(ctx, 0, -0.22 * h, 0, -0.08 * h, SILVER); ctx.fill(); outline(ctx, lw * 0.8);
    }
    // the engine bell
    poly(ctx, [[-0.09, 0.29], [0.09, 0.29], [0.12, 0.4], [-0.12, 0.4]], h); ctx.fillStyle = grad(ctx, -0.12 * h, 0, 0.12 * h, 0, ['#9AA3C4', '#E8ECF7', '#5B5F8A']); ctx.fill(); outline(ctx, lw);
    // the pearl body, its colours always moving
    auroraBody(ctx, h);
    const g = ctx.createLinearGradient(-0.2 * h, -0.5 * h, 0.2 * h, 0.3 * h);
    g.addColorStop(0, hsl(hue + 330, 95, 86)); g.addColorStop(0.3, hsl(hue, 95, 78)); g.addColorStop(0.55, hsl(hue + 90, 90, 76)); g.addColorStop(0.8, hsl(hue + 190, 90, 76)); g.addColorStop(1, hsl(hue + 270, 85, 70));
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); auroraBody(ctx, h); ctx.clip();
    const sh = ctx.createLinearGradient(-0.17 * h, 0, 0.17 * h, 0);
    sh.addColorStop(0, 'rgba(255,255,255,.55)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(60,40,150,.3)');
    ctx.fillStyle = sh; ctx.fillRect(-0.2 * h, -0.6 * h, 0.4 * h, h);
    sweep(ctx, h, t, 0.3, hsl(hue + 150, 100, 85, 0.5), 0.06);
    ctx.fillStyle = grad(ctx, -0.17 * h, 0, 0.17 * h, 0, SILVER); ctx.fillRect(-0.2 * h, -0.37 * h, 0.4 * h, 0.035 * h);
    ctx.fillStyle = grad(ctx, -0.17 * h, 0, 0.17 * h, 0, SILVER); ctx.fillRect(-0.2 * h, 0.21 * h, 0.4 * h, 0.03 * h);
    ctx.restore();
    auroraBody(ctx, h); outline(ctx, lw);
    // rainbow running lights down both sides
    [[-0.2, 0.125], [-0.05, 0.155], [0.1, 0.15], [0.22, 0.12]].forEach(([y, x], i) => {
      for (const s of [-1, 1]) {
        const hh = (hue * 3 + i * 50 + (s > 0 ? 180 : 0)) % 360;
        glowHue(ctx, s * x * h, y * h, h * 0.05, hh, 0.8);
        ctx.fillStyle = hsl(hh, 100, 85); ctx.beginPath(); ctx.arc(s * x * h, y * h, h * 0.014, 0, TAU); ctx.fill();
      }
    });
    // the panoramic window
    ctx.beginPath(); ctx.ellipse(0, -0.14 * h, 0.125 * h, 0.165 * h, 0, 0, TAU);
    ctx.fillStyle = grad(ctx, -0.13 * h, -0.3 * h, 0.13 * h, 0.03 * h, SILVER); ctx.fill(); outline(ctx, lw);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -0.14 * h, 0.095 * h, 0.135 * h, 0, 0, TAU); ctx.clip();
    const wg = ctx.createRadialGradient(-0.03 * h, -0.2 * h, 0.01 * h, 0, -0.14 * h, 0.16 * h);
    wg.addColorStop(0, '#F0DCFF'); wg.addColorStop(1, '#3B2C9E'); ctx.fillStyle = wg; ctx.fillRect(-0.1 * h, -0.3 * h, 0.2 * h, 0.32 * h);
    if (S.pilotIn !== false) drawPilotHead(ctx, 0, -0.09 * h, 0.075 * h, { blink: S.blink, mood: S.mood || 'happy', look: S.look, t });
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-0.04 * h, -0.2 * h, 0.02 * h, 0.06 * h, 0.3, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, -0.14 * h, 0.095 * h, 0.135 * h, 0, 0, TAU); outline(ctx, lw);
    // the nose's star
    glowHue(ctx, 0, -0.55 * h, h * 0.09, hue * 2, 0.7 + 0.3 * Math.sin(t * 5));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFFFFF'; sparkle(ctx, 0, -0.55 * h, h * 0.045); ctx.restore();
    halo(ctx, h, t, true);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'st', 24 * p * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.08, 0.08) * h, y: S.y + 0.45 * h, vx: rnd(-50, 50), vy: rnd(0, 80), g: -30, drag: 1.2, life: rnd(0.8, 1.4), size: h * rnd(0.025, 0.045), col: pick(['#FFFFFF', '#FF8FB1', '#8CF5FF', '#FFE066', '#B9A7FF', '#5FE3BD']), tw: 16, add: true, layer: 'back' }));
  },
  land(S, P) {
    const h = S.h;
    S.bloom = 1.4;
    P.add({ kind: 'ring', x: S.x, y: S.gy, life: 0.8, size: h * 0.2, grow: h * 2.6, flat: 0.18, col: '#FFFFFF', lw: 10 });
    P.add({ kind: 'ring', x: S.x, y: S.gy, life: 1.0, size: h * 0.15, grow: h * 1.8, flat: 0.18, col: '#FFC6F0', lw: 7, delay: 0.1 });
    const cols = ['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF', '#FF8FB1'];
    const n = Math.max(8, Math.round(26 * P.k));
    for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1; P.add({ kind: 'star', x: S.x, y: S.gy - rnd(2, 12), vx: s * rnd(140, 420), vy: rnd(-60, -10), g: 80, drag: 1.8, life: rnd(0.8, 1.3), size: h * rnd(0.035, 0.06), col: cols[i % 6], tw: 14, add: true }); }
    burst(P, S.x, S.y - h * 0.2, 22, cols, { add: true, sp: 240 });
  },
  finale(S, P, W) { for (let i = 0; i < Math.round(36 * P.k); i++) P.add({ kind: 'star', x: S.x + rnd(-0.5, 0.5) * W, y: rnd(-30, S.gy * 0.35), vy: rnd(30, 80), life: rnd(1.6, 2.6), size: S.h * rnd(0.03, 0.05), col: pick(['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF', '#FF8FB1']), tw: 16, add: true, delay: Math.random() * 0.8 }); },
  idle(S, P, dt) {
    every(S, 'id', 4 * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.35, 0.35) * S.h, y: S.y + rnd(0.2, 0.5) * S.h, vy: rnd(-30, -10), life: rnd(1.2, 2), size: S.h * 0.03, col: pick(['#FF8FB1', '#8CF5FF', '#FFE066', '#B9A7FF']), tw: 12, add: true }));
  },
  tick(S, dt, t) {
    S.bloom = Math.max(0, (S.bloom || 0) - dt);
    S.openT = S.air ? 0 : (S.bloom > 0 || S.landedOpen) ? 1 : S.idle ? 0.42 + 0.06 * Math.sin(t * 1.3) : 0;
    // about a second and a quarter of where it has been, so the ribbons reach out behind it
    if (S.air) S.trail.unshift({ x: S.x, y: S.y + 0.1 * S.h, t });
    while (S.trail.length && (t - S.trail[S.trail.length - 1].t > 1.25 || S.trail.length > 90)) S.trail.pop();
  },
};

// ---------- the five new ships (step 2d-1, D-073 to D-077) ----------

// Bip on his own, outside a window: feet at (x, y), size s, as drawPilot draws him.
function bipOut(ctx, S, t, x, y, s, o = {}) {
  drawPilot(ctx, { x, y, s, mood: o.mood || S.mood || 'happy', blink: S.blink || 0, wave: !!o.wave, flip: !!o.flip, squash: o.squash || 0 }, t);
}

// A music note, its head at (0, 0), size s; two joined when two is true.
function musicNote(ctx, s, col, two) {
  const lw = Math.max(1.2, s * 0.13);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.fillStyle = col || '#FFFFFF';
  const heads = two ? [[-0.42, 0.1], [0.42, 0]] : [[0, 0]];
  for (const [hx, hy] of heads) {
    ctx.beginPath(); ctx.ellipse(hx * s, hy * s, s * 0.34, s * 0.25, -0.4, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath();
  if (two) { ctx.moveTo(-0.12 * s, 0.05 * s); ctx.lineTo(-0.12 * s, -0.95 * s); ctx.lineTo(0.72 * s, -1.05 * s); ctx.lineTo(0.72 * s, -0.05 * s); }
  else { ctx.moveTo(0.3 * s, -0.05 * s); ctx.lineTo(0.3 * s, -1.0 * s); ctx.quadraticCurveTo(0.75 * s, -0.75 * s, 0.6 * s, -0.4 * s); }
  ctx.lineWidth = lw * 2.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = lw * 1.1; ctx.strokeStyle = col || '#FFFFFF'; ctx.stroke();
}

// A sock: cuff at the top (0, 0), toe to the right, size s; striped when stripe is a colour.
function sockShape(ctx, s, col, stripe) {
  const lw = Math.max(1, s * 0.09);
  ctx.beginPath();
  ctx.moveTo(-0.22 * s, 0); ctx.lineTo(0.22 * s, 0); ctx.lineTo(0.22 * s, 0.62 * s);
  ctx.quadraticCurveTo(0.22 * s, 0.74 * s, 0.38 * s, 0.74 * s); ctx.lineTo(0.62 * s, 0.74 * s);
  ctx.quadraticCurveTo(0.85 * s, 0.76 * s, 0.82 * s, 0.97 * s); ctx.quadraticCurveTo(0.78 * s, 1.12 * s, 0.55 * s, 1.1 * s);
  ctx.lineTo(0.0, 1.1 * s); ctx.quadraticCurveTo(-0.22 * s, 1.1 * s, -0.22 * s, 0.88 * s); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (stripe) {
    ctx.save(); ctx.clip(); ctx.fillStyle = stripe;
    ctx.fillRect(-0.3 * s, 0.3 * s, 1.3 * s, 0.13 * s); ctx.fillRect(-0.3 * s, 0.55 * s, 1.3 * s, 0.13 * s);
    ctx.restore();
  }
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, -0.26 * s, -0.08 * s, 0.52 * s, 0.2 * s, 0.06 * s); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
}

// A rubber duck sitting at (0, 0), facing right, size s.
function rubberDuck(ctx, s, t) {
  const lw = Math.max(1, s * 0.1);
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.42, 0, 0, TAU); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.55 * s, -0.1 * s); ctx.quadraticCurveTo(-0.85 * s, -0.35 * s, -0.62 * s, -0.42 * s); ctx.quadraticCurveTo(-0.5 * s, -0.2 * s, -0.4 * s, -0.25 * s); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.32 * s, -0.48 * s, s * 0.33, 0, TAU); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.68 * s, -0.42 * s, s * 0.22, s * 0.11, 0.15, 0, TAU); ctx.fillStyle = '#FF9F43'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.42 * s, -0.56 * s, s * 0.06, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-0.15 * s, -0.12 * s, s * 0.2, s * 0.1, -0.3, 0, TAU); ctx.fill();
  void t;
}

// A soft heap of foam: circles [x, y, r] in units of h.
function foam(ctx, h, blobs, lw, shade = '#E4E8FA') {
  ctx.fillStyle = INK;
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h, y * h, r * h + lw, 0, TAU); ctx.fill(); }
  ctx.fillStyle = shade;
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h, y * h, r * h, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#FFFFFF';
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h - r * h * 0.15, y * h - r * h * 0.18, r * h * 0.78, 0, TAU); ctx.fill(); }
}

// Splash Tub (D-073): a pink bath seen from its end, so it's narrow where it lands.
const tub = {
  id: 'tub',
  look: 'A pink bath seen end on, full of bubbles: gold claw feet, two taps, a shower on a curly pipe and a rubber duck. Bubbles stream from the plughole; it lands with a SPLOSH.',
  fw: [[PINK, SKY, '#FFFFFF'], [SUN, '#FFFFFF', PINK], [SKY, MINT, '#FFFFFF']],
  conf: [PINK, SKY, '#FFFFFF', SUN, MINT],
  seat() { return { x: 0, y: -0.02, s: 0.3 }; },
  showerAt(S) { return { x: S.x - 0.05 * S.h, y: S.y - 0.39 * S.h }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), sp = S.splash || 0;
    // the water sloshing over both ends (behind the tub)
    if (sp > 0.01) {
      const grow = 1 - sp * sp;
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(s * 0.24 * h, -0.08 * h); ctx.scale(s * (0.5 + 0.7 * grow), 0.4 + 0.9 * grow); ctx.globalAlpha = Math.min(1, sp * 2.2);
        ctx.beginPath(); ctx.moveTo(0, 0.02 * h); ctx.quadraticCurveTo(0.1 * h, -0.02 * h, 0.2 * h, -0.17 * h); ctx.quadraticCurveTo(0.12 * h, -0.13 * h, 0.11 * h, -0.15 * h);
        ctx.quadraticCurveTo(0.14 * h, -0.25 * h, 0.1 * h, -0.34 * h); ctx.quadraticCurveTo(0.06 * h, -0.22 * h, 0.04 * h, -0.19 * h); ctx.quadraticCurveTo(0.03 * h, -0.29 * h, -0.03 * h, -0.34 * h);
        ctx.quadraticCurveTo(-0.02 * h, -0.18 * h, -0.04 * h, 0.0); ctx.closePath();
        ctx.fillStyle = grad(ctx, 0, -0.34 * h, 0, 0, ['#E6FBFF', SKY, '#5CC8F0']); ctx.fill(); outline(ctx, lw * 0.7);
        ctx.restore();
      }
    }
    // the shower on its curly pipe, behind the tub
    ctx.beginPath(); ctx.moveTo(-0.205 * h, -0.05 * h); ctx.lineTo(-0.205 * h, -0.37 * h); ctx.quadraticCurveTo(-0.205 * h, -0.47 * h, -0.1 * h, -0.47 * h);
    ctx.lineWidth = 0.045 * h + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 0.045 * h; ctx.strokeStyle = grad(ctx, -0.23 * h, 0, -0.18 * h, 0, SILVER); ctx.stroke();
    ctx.save(); ctx.translate(-0.07 * h, -0.45 * h); ctx.rotate(0.3);
    ctx.beginPath(); ctx.moveTo(-0.075 * h, 0.04 * h); ctx.quadraticCurveTo(-0.07 * h, -0.035 * h, 0, -0.035 * h); ctx.quadraticCurveTo(0.07 * h, -0.035 * h, 0.075 * h, 0.04 * h); ctx.closePath();
    ctx.fillStyle = grad(ctx, -0.075 * h, 0, 0.075 * h, 0, SILVER); ctx.fill(); outline(ctx, lw * 0.9);
    ctx.fillStyle = INK; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 0.026 * h, 0.03 * h, 0.007 * h, 0, TAU); ctx.fill(); }
    ctx.restore();
    // gold claw feet: two seen end on, tucked up in flight
    for (const s of [-1, 1]) {
      const fx = s * 0.15 * h, fy = lerp(0.37, 0.465, k) * h;
      ctx.beginPath(); ctx.moveTo(fx - 0.045 * h, 0.28 * h); ctx.quadraticCurveTo(fx - s * 0.02 * h, fy - 0.06 * h, fx - 0.022 * h, fy - 0.01 * h);
      ctx.lineTo(fx + 0.022 * h, fy - 0.01 * h); ctx.quadraticCurveTo(fx + s * 0.03 * h, fy - 0.08 * h, fx + 0.045 * h, 0.28 * h); ctx.closePath();
      ctx.fillStyle = grad(ctx, fx - 0.05 * h, 0, fx + 0.05 * h, 0, GOLD); ctx.fill(); outline(ctx, lw * 0.8);
      for (const dx of [-0.032, 0.032]) { ctx.beginPath(); ctx.arc(fx + dx * h, fy + 0.016 * h, 0.019 * h, 0, TAU); ctx.fillStyle = GOLD[2]; ctx.fill(); outline(ctx, lw * 0.6); }
      ctx.beginPath(); ctx.arc(fx, fy, 0.034 * h, 0, TAU); ctx.fillStyle = grad(ctx, fx - 0.03 * h, fy - 0.03 * h, fx + 0.03 * h, fy + 0.03 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.7);
    }
    // the tub's end: a deep rounded U
    const end = () => { ctx.beginPath(); ctx.moveTo(-0.25 * h, -0.08 * h); ctx.bezierCurveTo(-0.25 * h, 0.3 * h, -0.2 * h, 0.39 * h, 0, 0.39 * h); ctx.bezierCurveTo(0.2 * h, 0.39 * h, 0.25 * h, 0.3 * h, 0.25 * h, -0.08 * h); ctx.closePath(); };
    end(); ctx.fillStyle = grad(ctx, 0, -0.08 * h, 0, 0.39 * h, ['#FFE3EE', '#FFB3CC', '#FF8FB1']); ctx.fill();
    ctx.save(); end(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-0.165 * h, 0.12 * h, 0.03 * h, 0.17 * h, 0.12, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,60,120,.16)'; ctx.beginPath(); ctx.ellipse(0.2 * h, 0.15 * h, 0.07 * h, 0.25 * h, -0.1, 0, TAU); ctx.fill();
    ctx.restore();
    end(); outline(ctx, lw);
    // the plug on its chain, swinging on the left; one tap with its spout on the right
    const sw = (S.air ? Math.sin(t * 9) * 0.25 : Math.sin(t * 2) * 0.08) + sp * 0.5 * Math.sin(t * 14);
    ctx.save(); ctx.translate(-0.12 * h, -0.035 * h); ctx.rotate(sw);
    ctx.setLineDash([0.012 * h, 0.01 * h]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 0.14 * h); ctx.lineWidth = lw * 0.9; ctx.strokeStyle = SILVER[2]; ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, -0.03 * h, 0.14 * h, 0.06 * h, 0.04 * h, 0.012 * h); ctx.fillStyle = '#3A3560'; ctx.fill(); outline(ctx, lw * 0.6);
    ctx.restore();
    {
      const x = 0.12 * h, y = 0.04 * h, turn = (S.air ? t * 3 : 0) + sp * 2;
      ctx.beginPath(); ctx.arc(x, y, 0.034 * h, 0, TAU); ctx.fillStyle = grad(ctx, x - 0.035 * h, y - 0.035 * h, x + 0.035 * h, y + 0.035 * h, SILVER); ctx.fill(); outline(ctx, lw * 0.7);
      ctx.save(); ctx.translate(x, y); ctx.rotate(turn);
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); rr(ctx, -0.012 * h, -0.058 * h, 0.024 * h, 0.04 * h, 0.012 * h); ctx.fillStyle = '#E8ECF7'; ctx.fill(); outline(ctx, lw * 0.6); }
      ctx.beginPath(); ctx.arc(0, 0, 0.016 * h, 0, TAU); ctx.fillStyle = CORAL; ctx.fill(); outline(ctx, lw * 0.5);
      ctx.restore();
    }
    // the bubbles, Bip in among them, and the rolled rim
    foam(ctx, h, [[-0.21, -0.12, 0.06], [-0.13, -0.17, 0.07], [-0.05, -0.15, 0.06], [0.07, -0.16, 0.065], [0.15, -0.13, 0.06], [0.22, -0.11, 0.05]], lw);
    if (S.pilotIn !== false) drawPilotHead(ctx, 0, -0.205 * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
    foam(ctx, h, [[-0.065, -0.115, 0.04], [0, -0.1, 0.045], [0.065, -0.115, 0.04], [-0.17, -0.1, 0.035], [0.17, -0.1, 0.035]], lw * 0.8);
    const beard = S.beard || 0;
    if (beard > 0.02 && S.pilotIn !== false) {
      ctx.globalAlpha = Math.min(1, beard * 2);
      foam(ctx, h, [[-0.04, -0.16, 0.022], [0, -0.148, 0.026], [0.04, -0.16, 0.022]], lw * 0.5);
      ctx.globalAlpha = 1;
    }
    rr(ctx, -0.28 * h, -0.105 * h, 0.56 * h, 0.065 * h, 0.032 * h); ctx.fillStyle = grad(ctx, 0, -0.105 * h, 0, -0.04 * h, ['#FFFFFF', '#E4E0FA']); ctx.fill(); outline(ctx, lw);
    // the duck, on the rim, hopping up at the splash
    const d = S.duckT;
    const up = d != null && d < 0.8 ? Math.sin((d / 0.8) * Math.PI) * 0.34 * h : 0;
    const bob = S.idle || S.air ? Math.sin(t * 3.1) * 0.008 * h : 0;
    ctx.save(); ctx.translate(0.17 * h, -0.135 * h - up + bob); ctx.rotate(d != null && d < 0.8 ? (d / 0.8) * TAU : 0);
    rubberDuck(ctx, 0.07 * h, t); ctx.restore();
  },
  tick(S, dt) {
    S.splash = Math.max(0, (S.splash || 0) - dt * 1.7);
    if (S.duckT != null) { S.duckT += dt; if (S.duckT > 1) S.duckT = null; }
    if (S.air) S.beard = Math.max(0, (S.beard || 0) - dt * 2.5);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'bb', 10 * p * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.04, 0.04) * h, y: S.y + 0.4 * h, vx: rnd(-30, 30), vy: rnd(70, 150), drag: 1.2, life: rnd(0.6, 1.1), size: h * rnd(0.025, 0.05), sway: 4, swayAmp: 20, layer: 'back' }));
    const sh = this.showerAt(S);
    every(S, 'dr', 5 * P.k, dt, () => P.add({ kind: 'drop', x: sh.x + rnd(-0.03, 0.03) * h, y: sh.y, vx: rnd(-10, 25), vy: rnd(60, 110), g: 300, life: 0.3, size: h * 0.018, col: SKY }));
  },
  land(S, P) {
    S.splash = 1; S.duckT = 0; S.beard = 1;
    dust(S, P, S.dust, 10);
    const h = S.h, n = Math.round(9 * P.k) + 2;
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) P.add({ kind: 'drop', x: S.x + s * 0.27 * h, y: S.y - 0.12 * h, vx: s * rnd(60, 220), vy: rnd(-300, -130), g: 620, life: rnd(0.55, 0.95), size: h * rnd(0.022, 0.038), col: SKY });
    for (let i = 0; i < Math.round(6 * P.k) + 1; i++) P.add({ kind: 'bubble', x: S.x + rnd(-0.22, 0.22) * h, y: S.y - 0.2 * h, vx: rnd(-30, 30), vy: rnd(-90, -40), drag: 0.6, life: rnd(1, 1.6), size: h * rnd(0.03, 0.055), sway: 3, swayAmp: 22, delay: i * 0.06 });
  },
  idle(S, P, dt) {
    every(S, 'id', 1.4 * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.2, 0.2) * S.h, y: S.y - 0.18 * S.h, vy: rnd(-40, -25), drag: 0.3, life: rnd(1.4, 2.2), size: S.h * rnd(0.025, 0.045), sway: 2.5, swayAmp: 16 }));
    const sh = this.showerAt(S);
    every(S, 'dr', 1.6 * P.k, dt, () => P.add({ kind: 'drop', x: sh.x, y: sh.y, vy: 40, g: 400, life: 0.32, size: S.h * 0.02, col: SKY }));
  },
};

// Jack-in-the-Box (D-073): a starry box with a winding handle; Bip peeps out under the lid.
// The box is drawn a little in 3-D: x across, y down, z into the page (0 at the front).
const JK = { x0: -0.23, x1: 0.23, y0: -0.2, y1: 0.43, d: 0.26, ox: 0.3, oy: 0.22, L: 0.4 };
const jkP = (x, y, z, h) => [(x + JK.ox * z) * h, (y - JK.oy * z) * h];
function jackPop(S) {
  if (S.popT != null) { const u = S.popT; return JK.L * (1 - Math.exp(-6 * u) * Math.cos(15 * u)); }
  return JK.L * (S.retract || 0);
}
const jack = {
  id: 'jack',
  look: 'A starry toy box with a winding handle. The handle turns like a propeller and music notes float out; on landing, POP! Bip springs out on a coil.',
  fw: [['#A88BFF', SUN, '#FFFFFF'], [SUN, CORAL, '#A88BFF'], [SKY, '#FFFFFF', SUN]],
  conf: ['#A88BFF', SUN, CORAL, SKY, '#FFFFFF'],
  seat(S) {
    const L = jackPop(S);
    return L > 0.05 ? { x: 0.03, y: JK.y0 - 0.02 - L, s: 0.3 } : { x: 0.03, y: 0.0, s: 0.3 };
  },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), P3 = (x, y, z) => jkP(x, y, z, h);
    const L = jackPop(S);
    const aboard = S.pilotIn !== false;
    const lid = S.popT != null ? Math.min(2.15, S.popT * 16) : (S.retract || 0) > 0.02 ? Math.max(0.75, 2.15 * S.retract) : !aboard ? 0.05 + (S.idle ? 0.1 * Math.pow(Math.max(0, Math.sin(t * 1.1)), 12) : 0)
      : S.air ? 0.8 + 0.07 * Math.sin(t * 11) : 0.72 + (S.idle ? 0.06 * Math.sin(t * 1.7) : 0);
    const quad = (pts, fill, w = lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); outline(ctx, w); };
    // little gold ball feet (front two seen)
    for (const fx of [-0.16, 0.16]) {
      const fy = lerp(0.4, 0.465, k) * h;
      ctx.beginPath(); ctx.arc(fx * h, fy, 0.035 * h, 0, TAU); ctx.fillStyle = grad(ctx, (fx - 0.03) * h, fy - 0.03 * h, (fx + 0.03) * h, fy + 0.03 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.8);
    }
    const s = Math.sin(lid), co = Math.cos(lid);
    const lidPts = [P3(JK.x0, JK.y0, JK.d), P3(JK.x1, JK.y0, JK.d), P3(JK.x1, JK.y0 - JK.d * s, JK.d - JK.d * co), P3(JK.x0, JK.y0 - JK.d * s, JK.d - JK.d * co)];
    const drawLid = () => {
      quad(lidPts, co > 0 ? grad(ctx, 0, lidPts[2][1], 0, lidPts[0][1], ['#C4AEFF', '#9270F2']) : '#5E3FC4');
      if (co > 0.2) { const [mx, my] = P3(0.0, JK.y0 - JK.d * s * 0.5, JK.d - JK.d * co * 0.5); ctx.save(); ctx.translate(mx, my); ctx.scale(1, Math.max(0.2, co * 0.5)); star5(ctx, 0.05 * h); ctx.fillStyle = SUN; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    };
    const lidBehind = lid > 0.3;
    if (lidBehind) drawLid();
    // the open top: dark inside, then Bip peeping or the coil
    quad([P3(JK.x0, JK.y0, 0), P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y0, JK.d), P3(JK.x0, JK.y0, JK.d)], '#2A1D6B', lw * 0.8);
    if (L > 0.03) {
      const top = (JK.y0 - 0.02 - L) * h, x = 0.03 * h, n = 7;
      ctx.beginPath(); ctx.moveTo(x, (JK.y0 + 0.02) * h);
      for (let i = 1; i <= n * 2; i++) ctx.lineTo(x + (i % 2 ? 1 : -1) * 0.05 * h, lerp((JK.y0 + 0.02) * h, top + 0.02 * h, i / (n * 2)));
      ctx.lineTo(x, top);
      ctx.lineWidth = 0.022 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.lineWidth = 0.022 * h; ctx.strokeStyle = grad(ctx, x - 0.05 * h, 0, x + 0.05 * h, 0, SILVER); ctx.stroke();
      if (S.pilotIn !== false) {
        const b = S.popT != null ? Math.exp(-4 * S.popT) * Math.sin(S.popT * 15) : 0;
        bipOut(ctx, S, t, x, top, 0.3 * h, { wave: true, squash: -0.18 * b, mood: 'happy' });
      } else {
        ctx.save(); ctx.translate(x, top - 0.035 * h); ctx.rotate(Math.sin(t * 3) * 0.2); star5(ctx, 0.055 * h);
        ctx.fillStyle = grad(ctx, -0.05 * h, -0.05 * h, 0.05 * h, 0.05 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.7); ctx.restore();
      }
    } else if (S.pilotIn !== false) {
      drawPilotHead(ctx, 0.03 * h, (JK.y0 - 0.085) * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
      for (const x of [-0.08, 0.14]) { ctx.beginPath(); ctx.arc(x * h, (JK.y0 + 0.005) * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.6); }
    }
    // the side, with the winding handle
    quad([P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y0, JK.d), P3(JK.x1, JK.y1, JK.d), P3(JK.x1, JK.y1, 0)], grad(ctx, JK.x1 * h, 0, (JK.x1 + JK.ox * JK.d) * h, 0, ['#6A49D8', '#4E31B4']));
    const [ax, ay] = P3(JK.x1, 0.1, JK.d * 0.5), c = S.crank || 0;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 0.05 * h, ay); ctx.lineWidth = 0.025 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.025 * h; ctx.strokeStyle = SILVER[1]; ctx.stroke();
    const ex = ax + 0.05 * h + Math.cos(c) * 0.02 * h, ey = ay + Math.sin(c) * 0.085 * h;
    ctx.beginPath(); ctx.moveTo(ax + 0.05 * h, ay); ctx.lineTo(ex, ey); ctx.lineWidth = 0.022 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.022 * h; ctx.strokeStyle = SILVER[1]; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 0.028 * h, 0, TAU); ctx.fillStyle = CORAL; ctx.fill(); outline(ctx, lw * 0.7);
    // the front, starry
    const front = [P3(JK.x0, JK.y0, 0), P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y1, 0), P3(JK.x0, JK.y1, 0)];
    quad(front, grad(ctx, 0, JK.y0 * h, 0, JK.y1 * h, ['#B79CFF', '#9270F2', '#7553E0']));
    ctx.save(); ctx.beginPath(); front.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    [[-0.12, -0.08, 0.055, 0.2], [0.11, 0.06, 0.07, -0.3], [-0.1, 0.25, 0.05, 0.5], [0.13, 0.31, 0.04, 0.1], [0.0, 0.15, 0.035, -0.2]].forEach(([x, y, r, a], i) => {
      ctx.save(); ctx.translate(x * h, y * h); ctx.rotate(a + (S.idle ? Math.sin(t * 2 + i) * 0.08 : 0)); star5(ctx, r * h); ctx.fillStyle = i % 2 ? '#FFFFFF' : SUN; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    });
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(JK.x0 * h, JK.y0 * h, 0.05 * h, (JK.y1 - JK.y0) * h);
    ctx.restore();
    ctx.lineWidth = lw * 0.7; ctx.strokeStyle = GOLD[1];
    ctx.beginPath(); ctx.moveTo((JK.x0 + 0.02) * h, (JK.y0 + 0.03) * h); ctx.lineTo((JK.x1 - 0.02) * h, (JK.y0 + 0.03) * h); ctx.moveTo((JK.x0 + 0.02) * h, (JK.y1 - 0.03) * h); ctx.lineTo((JK.x1 - 0.02) * h, (JK.y1 - 0.03) * h); ctx.stroke();
    quad(front, 'rgba(0,0,0,0)');
    // a shut lid lies over the top, hinged along its back
    if (!lidBehind) drawLid();
  },
  tick(S, dt) {
    S.crank = (S.crank || 0) + dt * (S.air ? 4 + 14 * S.thrust : S.idle ? 1.2 : 0) * (S.calm ? 0.4 : 1);
    if (S.popT != null) {
      S.popT += dt;
      if (S.air) { S.popT = null; S.retract = 1; }
    }
    if ((S.retract || 0) > 0) S.retract = Math.max(0, S.retract - dt * 5);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'nt', 3.2 * P.k, dt, () => P.add({ kind: 'note', x: S.x + 0.4 * h, y: S.y + 0.05 * h, vx: rnd(20, 60), vy: rnd(-70, -30), drag: 0.4, life: rnd(1.0, 1.5), size: h * rnd(0.06, 0.08), col: pick(['#FFFFFF', SUN, PINK, SKY]), two: Math.random() < 0.4, rot: rnd(-0.3, 0.3), ph: Math.random() * 6 }));
    every(S, 'pf', 10 * p * P.k, dt, () => P.add({ kind: 'glow', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + 0.47 * h, vx: rnd(-40, 40), vy: rnd(60, 140), drag: 2, life: rnd(0.3, 0.6), size: h * rnd(0.015, 0.03), col: pick(['#FFFFFF', '#D9CCFF', SUN]), layer: 'back' }));
  },
  land(S, P) {
    S.popT = 0; S.retract = 0;
    dust(S, P, S.dust, 10);
    burst(P, S.x + 0.03 * S.h, S.y - 0.55 * S.h, 14, [SUN, '#FFFFFF', '#A88BFF', PINK], { kind: 'star5', size: [S.h * 0.035, S.h * 0.06], g: 160, sp: 200 });
    for (let i = 0; i < Math.round(4 * P.k) + 1; i++) P.add({ kind: 'note', x: S.x + rnd(-0.2, 0.3) * S.h, y: S.y - 0.3 * S.h, vx: rnd(-60, 60), vy: rnd(-120, -60), drag: 0.8, life: 1.2, size: S.h * 0.07, col: pick(['#FFFFFF', SUN, PINK]), two: i % 2 === 0, rot: rnd(-0.3, 0.3), ph: i });
  },
  idle(S, P, dt) {
    every(S, 'nt', 0.7 * P.k, dt, () => P.add({ kind: 'note', x: S.x + 0.4 * S.h, y: S.y + 0.05 * S.h, vx: rnd(10, 30), vy: rnd(-40, -25), drag: 0.3, life: 1.6, size: S.h * 0.06, col: pick(['#FFFFFF', SUN, PINK]), two: Math.random() < 0.4, ph: Math.random() * 6 }));
  },
};

// Sunflower Copter (D-073): a flower pot that flies like a helicopter; the sunflower is the rotor.
function sunHead(ctx, h, lw, ang, fast, open = 1) {
  if (fast > 0.05) {
    ctx.save(); ctx.globalAlpha = 0.35 * fast; ctx.beginPath(); ctx.arc(0, 0, 0.2 * h, 0, TAU); ctx.fillStyle = SUN; ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 1 - 0.45 * fast;
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate(ang + i * TAU / 12); ctx.translate(0, -0.115 * h * open);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.034 * h, 0.07 * h, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#FFD23F' : SUN; ctx.fill(); outline(ctx, lw * 0.55);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(0, 0, 0.085 * h, 0, TAU); ctx.fillStyle = grad(ctx, -0.08 * h, -0.08 * h, 0.08 * h, 0.08 * h, ['#9A6236', '#7A4A2A', '#5A3418']); ctx.fill(); outline(ctx, lw * 0.75);
  ctx.fillStyle = '#3E220E';
  for (let i = 0; i < 9; i++) { const a = ang * 0.5 + i * 2.4, r = 0.022 * h * Math.sqrt(i + 0.5); ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 0.009 * h, 0, TAU); ctx.fill(); }
}
function beeAt(u) {
  // a loop round Bip's head: in from the right, round, and away up to the left (units of h)
  if (u < 0.15) { const k = u / 0.15; return [lerp(0.34, 0.09, k), lerp(-0.5, -0.12, k)]; }
  if (u < 0.78) { const a = ((u - 0.15) / 0.63) * TAU; return [-0.11 + 0.2 * Math.cos(a), -0.12 - 0.17 * Math.sin(a)]; }
  const k = (u - 0.78) / 0.22; return [lerp(0.09, -0.42, k), lerp(-0.12, -0.62, k)];
}
const sunflower = {
  id: 'sunflower',
  look: 'A flower pot that flies like a helicopter: the sunflower spins round as its rotor, shedding the odd petal. Bip peeps over the rim; on landing the flower slows and nods, and a bee buzzes a loop round Bip.',
  fw: [[SUN, '#FFFFFF', '#3FBF6A'], [CORAL, SUN, MINT], ['#FFD23F', '#FF9F43', '#FFFFFF']],
  conf: [SUN, '#3FBF6A', CORAL, '#FFFFFF', '#FF9F43'],
  seat() { return { x: -0.11, y: 0.13, s: 0.3 }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1));
    // three little feet and the saucer
    for (const fx of [-0.15, 0, 0.15]) {
      const fy = lerp(0.42, 0.465, k) * h;
      rr(ctx, (fx - 0.035) * h, fy - 0.035 * h, 0.07 * h, 0.07 * h, 0.02 * h); ctx.fillStyle = '#B85433'; ctx.fill(); outline(ctx, lw * 0.7);
    }
    rr(ctx, -0.25 * h, 0.375 * h, 0.5 * h, 0.065 * h, 0.03 * h); ctx.fillStyle = grad(ctx, 0, 0.375 * h, 0, 0.44 * h, ['#E07A4E', '#B85433']); ctx.fill(); outline(ctx, lw);
    // the stem and its leaves (flapping as it flies)
    const n = S.nodT == null ? 0 : (S.nodT < 0.3 ? ease.out(S.nodT / 0.3) : Math.max(0, 1 - (S.nodT - 1.3) / 0.6)) * (1 + 0.12 * Math.sin((S.nodT || 0) * 9));
    const hx = 0.05 * n * h, hy = (-0.31 + 0.03 * n) * h;
    ctx.beginPath(); ctx.moveTo(0.06 * h, 0.06 * h); ctx.quadraticCurveTo(0.1 * h, -0.13 * h, hx, hy);
    ctx.lineWidth = 0.042 * h + lw * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.042 * h; ctx.strokeStyle = '#3FBF6A'; ctx.stroke();
    const flap = S.air ? Math.sin(t * 22) * 0.35 * S.thrust : S.idle ? Math.sin(t * 2) * 0.08 : 0;
    for (const [x, y, s, a] of [[0.085, -0.04, 1, 0.3], [0.095, -0.13, 1, -0.45]]) {
      ctx.save(); ctx.translate(x * h, y * h); ctx.rotate(a + s * flap); ctx.scale(s, 1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0.08 * h, -0.08 * h, 0.17 * h, -0.015 * h); ctx.quadraticCurveTo(0.08 * h, 0.05 * h, 0, 0); ctx.closePath();
      ctx.fillStyle = '#5FD47C'; ctx.fill(); outline(ctx, lw * 0.75);
      ctx.beginPath(); ctx.moveTo(0.01 * h, 0); ctx.quadraticCurveTo(0.08 * h, -0.02 * h, 0.14 * h, -0.015 * h); ctx.lineWidth = lw * 0.5; ctx.strokeStyle = '#2E9C55'; ctx.stroke();
      ctx.restore();
    }
    // Bip, peeping over the rim
    if (S.pilotIn !== false) drawPilotHead(ctx, -0.11 * h, -0.07 * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
    // the pot, with a daisy painted on, and its rim
    poly(ctx, [[-0.23, 0.07], [0.23, 0.07], [0.175, 0.385], [-0.175, 0.385]], h);
    ctx.fillStyle = grad(ctx, -0.23 * h, 0, 0.23 * h, 0, ['#F59466', '#E07A4E', '#C25E36']); ctx.fill(); outline(ctx, lw);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, 0.22 * h); ctx.rotate(i * TAU / 6 + (S.idle ? t * 0.3 : 0)); ctx.beginPath(); ctx.ellipse(0, -0.04 * h, 0.018 * h, 0.036 * h, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(0, 0.22 * h, 0.02 * h, 0, TAU); ctx.fillStyle = SUN; ctx.fill();
    rr(ctx, -0.27 * h, -0.01 * h, 0.54 * h, 0.09 * h, 0.025 * h); ctx.fillStyle = grad(ctx, 0, -0.01 * h, 0, 0.08 * h, ['#FFB28A', '#F49A6E']); ctx.fill(); outline(ctx, lw);
    if (S.pilotIn !== false) for (const x of [-0.18, -0.04]) { ctx.beginPath(); ctx.arc(x * h, -0.005 * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.7); }
    // the sunflower, spinning as the rotor
    const fast = clamp(((S.rotorV || 0) - 4) / 10, 0, 1);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(0.5 * n);
    sunHead(ctx, h, lw, S.rotor || 0, fast);
    ctx.restore();
    if (fast > 0.2) {
      ctx.save(); ctx.globalAlpha = 0.8 * fast; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = lw * 0.9; ctx.lineCap = 'round';
      for (const a0 of [0.2, Math.PI + 0.2]) { ctx.beginPath(); ctx.arc(hx, hy, 0.235 * h, a0 + (S.rotor || 0) * 0.15, a0 + 0.9 + (S.rotor || 0) * 0.15); ctx.stroke(); }
      ctx.restore();
    }
    // the bee, after landing
    if (S.beeT != null && S.beeT < 2) {
      const u = S.beeT / 2, [bx, by] = beeAt(u);
      ctx.save(); ctx.setLineDash([0.012 * h, 0.022 * h]); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.beginPath();
      for (let i = 0; i <= 14; i++) { const [x, y] = beeAt(Math.max(0, u - 0.22 + (i / 14) * 0.22)); if (i) ctx.lineTo(x * h, y * h); else ctx.moveTo(x * h, y * h); }
      ctx.stroke(); ctx.restore();
      const [px, py] = beeAt(Math.max(0, u - 0.01)), dir = bx >= px ? 1 : -1;
      ctx.save(); ctx.translate(bx * h, by * h); ctx.scale(dir, 1);
      const w = Math.sin(t * 60) * 0.4;
      ctx.scale(1.6, 1.6);
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = lw * 0.5; ctx.strokeStyle = INK;
      for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (0.5 + w)); ctx.beginPath(); ctx.ellipse(-0.005 * h, -0.035 * h, 0.018 * h, 0.03 * h, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.ellipse(0, 0, 0.04 * h, 0.028 * h, 0, 0, TAU); ctx.fillStyle = SUN; ctx.fill(); outline(ctx, lw * 0.6);
      ctx.save(); ctx.clip(); ctx.fillStyle = INK; ctx.fillRect(-0.016 * h, -0.04 * h, 0.012 * h, 0.08 * h); ctx.fillRect(0.008 * h, -0.04 * h, 0.012 * h, 0.08 * h); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 0, 0.04 * h, 0.028 * h, 0, 0, TAU); outline(ctx, lw * 0.6);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.026 * h, -0.006 * h, 0.006 * h, 0, TAU); ctx.fill();
      ctx.restore();
    }
  },
  tick(S, dt) {
    const want = S.air ? 6 + 20 * S.thrust : S.idle ? 1.4 : 0;
    S.rotorV = (S.rotorV || 0) + (Math.min(want, S.calm ? 2 : 99) - (S.rotorV || 0)) * Math.min(1, dt * (want > (S.rotorV || 0) ? 4 : 1.3));
    S.rotor = (S.rotor || 0) + dt * (S.rotorV || 0);
    if (S.nodT != null) { S.nodT += dt; if (S.nodT > 2) S.nodT = null; }
    if (S.beeT != null) { S.beeT += dt; if (S.beeT > 2) S.beeT = null; }
    if (S.air && S.thrust > 0.3) { S.nodT = null; }
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'pt', 3 * p * P.k, dt, () => P.add({ kind: 'petal', x: S.x + rnd(-0.15, 0.15) * h, y: S.y - 0.3 * h, vx: rnd(-90, 90), vy: rnd(30, 90), g: 30, drag: 1.4, life: rnd(1.0, 1.5), size: h * rnd(0.03, 0.045), col: pick([SUN, '#FFD23F']), rot: Math.random() * 6, vr: rnd(-5, 5), ph: Math.random() * 6 }));
    every(S, 'dw', 12 * p * P.k, dt, () => { const s = Math.random() < 0.5 ? -1 : 1; P.add({ kind: 'smoke', x: S.x + s * rnd(0.05, 0.2) * h, y: S.y + 0.46 * h, vx: s * rnd(60, 160), vy: rnd(30, 90), drag: 2.5, life: rnd(0.4, 0.7), size: h * rnd(0.025, 0.045), grow: h * 0.1, col: '#F7F3FF', a: 0.55, layer: 'back' }); });
  },
  land(S, P) {
    S.nodT = 0; S.beeT = 0;
    dust(S, P, S.dust, 10);
    for (let i = 0; i < Math.round(8 * P.k) + 2; i++) P.add({ kind: 'petal', x: S.x + rnd(-0.18, 0.18) * S.h, y: S.y - 0.31 * S.h, vx: rnd(-140, 140), vy: rnd(-160, -40), g: 220, drag: 1.2, life: rnd(1, 1.4), size: S.h * rnd(0.032, 0.045), col: pick([SUN, '#FFD23F']), rot: Math.random() * 6, vr: rnd(-6, 6), ph: Math.random() * 6 });
  },
  idle(S, P, dt) {
    every(S, 'pt', 0.6 * P.k, dt, () => P.add({ kind: 'petal', x: S.x + rnd(-0.15, 0.15) * S.h, y: S.y - 0.3 * S.h, vx: rnd(-20, 20), vy: 25, g: 10, life: 2.2, size: S.h * 0.035, col: SUN, rot: Math.random() * 6, vr: rnd(-2, 2), ph: Math.random() * 6, sway: 2, swayAmp: 20 }));
  },
};

// Spin Cycle (D-073): a washing machine that flies; Bip whirls round in the window with the socks.
const spin = {
  id: 'spin',
  look: 'A washing machine that flies on puffs of suds, one sock stuck in its door. Bip whirls round in the window with the socks; on landing it shakes to a stop, CLUNK, and the door swings open.',
  fw: [[SKY, '#FFFFFF', CORAL], ['#4F7BEA', '#FFFFFF', SUN], [MINT, SKY, '#FFFFFF']],
  conf: ['#4F7BEA', CORAL, '#FFFFFF', SKY, SUN],
  seat(S) { return (S.door || 0) > 0.5 ? { x: 0.03, y: 0.33, s: 0.36 } : { x: 0, y: 0.3, s: 0.32 }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), sh = S.calm ? 0 : S.shake || 0;
    // four little feet (two seen)
    for (const s of [-1, 1]) {
      const fy = lerp(0.4, 0.46, k) * h;
      rr(ctx, (s * 0.23 - 0.03) * h, 0.38 * h, 0.06 * h, fy - 0.38 * h, 0.01 * h); ctx.fillStyle = '#9FA6BF'; ctx.fill(); outline(ctx, lw * 0.6);
      rr(ctx, (s * 0.23 - 0.06) * h, fy, 0.12 * h, 0.04 * h, 0.02 * h); ctx.fillStyle = '#3A3560'; ctx.fill(); outline(ctx, lw * 0.6);
    }
    ctx.save();
    if (sh > 0.01) { ctx.translate(Math.sin(t * 71) * 0.012 * h * sh, Math.cos(t * 53) * 0.008 * h * sh); ctx.rotate(Math.sin(t * 37) * 0.035 * sh); }
    // the machine
    rr(ctx, -0.32 * h, -0.43 * h, 0.64 * h, 0.84 * h, 0.07 * h); ctx.fillStyle = grad(ctx, -0.32 * h, 0, 0.32 * h, 0, ['#FFFFFF', '#F1EEFF', '#D9D3F0']); ctx.fill(); outline(ctx, lw);
    ctx.beginPath(); ctx.moveTo(-0.32 * h, -0.27 * h); ctx.lineTo(0.32 * h, -0.27 * h); outline(ctx, lw * 0.7);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-0.28 * h, -0.2 * h, 0.03 * h, 0.5 * h);
    rr(ctx, -0.27 * h, -0.38 * h, 0.17 * h, 0.075 * h, 0.015 * h); ctx.fillStyle = '#F1F2F8'; ctx.fill(); outline(ctx, lw * 0.6);
    ctx.beginPath(); ctx.moveTo(-0.23 * h, -0.343 * h); ctx.lineTo(-0.14 * h, -0.343 * h); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
    const run = S.air || S.idle || (S.wcT != null && S.wcT < 0.35);
    glow(ctx, 0.0, -0.34 * h, 0.05 * h, MINT, run && Math.sin(t * 6) > 0 ? 0.9 : 0.1);
    glow(ctx, 0.07 * h, -0.34 * h, 0.05 * h, CORAL, run && Math.sin(t * 6) <= 0 ? 0.9 : 0.1);
    for (const [x, col] of [[0, MINT], [0.07, CORAL]]) { ctx.beginPath(); ctx.arc(x * h, -0.34 * h, 0.022 * h, 0, TAU); ctx.fillStyle = col; ctx.fill(); outline(ctx, lw * 0.5); }
    // the dial: dots, no numbers
    ctx.beginPath(); ctx.arc(0.21 * h, -0.34 * h, 0.05 * h, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill(); outline(ctx, lw * 0.6);
    const da = -0.8 + (S.drum || 0) * 0.15;
    ctx.beginPath(); ctx.moveTo(0.21 * h, -0.34 * h); ctx.lineTo(0.21 * h + Math.cos(da) * 0.035 * h, -0.34 * h + Math.sin(da) * 0.035 * h); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); ctx.beginPath(); ctx.arc(0.21 * h + Math.cos(a) * 0.072 * h, -0.34 * h + Math.sin(a) * 0.072 * h, 0.008 * h, 0, TAU); ctx.fill(); }
    // the door: shut with the wash whirling, or swung open with Bip leaning out
    const cx = 0, cy = 0.08 * h, R = 0.235 * h, r = 0.17 * h, op = S.door || 0, ang = S.calm ? 0 : S.drum || 0;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, TAU); ctx.fillStyle = '#E3E0F2'; ctx.fill(); outline(ctx, lw * 0.6);
    if (op > 0.02) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = '#3B3561'; ctx.fill(); outline(ctx, lw * 0.8);
      ctx.fillStyle = '#5E5790'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.3; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72, 0.012 * h, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(cx - 0.04 * h, cy + 0.08 * h); ctx.rotate(-0.3); sockShape(ctx, 0.08 * h, CORAL); ctx.restore();
      if (S.pilotIn !== false && op > 0.4) {
        const dz = S.wcT != null && S.wcT < 1.4 ? Math.sin(S.wcT * 10) * 0.15 : 0;
        drawPilotHead(ctx, cx + 0.03 * h, cy - 0.02 * h, 0.1 * h, { blink: S.blink || 0, mood: 'oh', look: dz, t });
        ctx.save(); ctx.translate(cx + 0.0 * h, cy - 0.17 * h); ctx.rotate(-1.3 + dz); sockShape(ctx, 0.09 * h, '#FFFFFF', '#4F7BEA'); ctx.restore();
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 0.12 * h, cy + 0.08 * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.6); }
      }
      foam(ctx, h, [[-0.08, 0.19, 0.03], [-0.02, 0.205, 0.035], [0.05, 0.2, 0.03], [0.1, 0.185, 0.025]], lw * 0.6);
    }
    const phi = op * 1.95, cz = Math.cos(phi), dx = -R + R * cz;
    ctx.save(); ctx.translate(cx + dx, cy); ctx.scale(Math.max(0.06, Math.abs(cz)), 1);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = grad(ctx, -R, -R, R, R, SILVER); ctx.fill(); outline(ctx, lw / Math.max(0.3, Math.abs(cz)));
    if (cz > 0.15) {
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      ctx.fillStyle = '#C9F1FF'; ctx.fillRect(-r, -r, r * 2, r * 2);
      const wave = Math.sin(t * 5) * 0.02 * h;
      ctx.beginPath(); ctx.moveTo(-r, 0.03 * h + wave); ctx.quadraticCurveTo(0, -0.01 * h - wave, r, 0.03 * h + wave); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fillStyle = 'rgba(95,180,240,.75)'; ctx.fill();
      if (op < 0.02) {
        for (const [a0, col, st] of [[0, CORAL, null], [Math.PI, '#FFFFFF', '#4F7BEA'], [Math.PI * 0.5, SUN, null]]) {
          ctx.save(); ctx.rotate(ang + a0); ctx.translate(0.1 * h, 0); ctx.rotate(ang * 1.5); sockShape(ctx, 0.06 * h, col, st); ctx.restore();
        }
        if (S.pilotIn !== false) { ctx.save(); ctx.rotate(ang); drawPilotHead(ctx, 0, 0, 0.085 * h, { blink: S.blink || 0, mood: S.air ? 'oh' : S.mood || 'happy', look: 0, t }); ctx.restore(); }
        ctx.fillStyle = '#FFFFFF'; for (const [x, y, rr0] of [[-0.11, 0.06, 0.016], [0.1, 0.09, 0.02], [-0.03, 0.12, 0.014], [0.06, -0.08, 0.012]]) { ctx.beginPath(); ctx.arc(x * h, y * h, rr0 * h, 0, TAU); ctx.fill(); }
      }
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, Math.PI * 1.05, Math.PI * 1.45); ctx.arc(0, 0, r * 0.6, Math.PI * 1.45, Math.PI * 1.05, true); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); outline(ctx, lw * 0.8 / Math.max(0.3, cz));
      rr(ctx, R * 0.82, -0.05 * h, 0.05 * h, 0.1 * h, 0.02 * h); ctx.fillStyle = '#E8ECF7'; ctx.fill(); outline(ctx, lw * 0.6);
    }
    ctx.restore();
    // a sock stuck in the door, flapping like a flag
    if (op < 0.02 && S.air) {
      ctx.save(); ctx.translate(0.19 * h, 0.22 * h); ctx.rotate(-1.9 + Math.sin(t * 16) * 0.45 * (0.4 + 0.6 * S.thrust)); sockShape(ctx, 0.085 * h, '#FFFFFF', '#4F7BEA'); ctx.restore();
    }
    ctx.restore();
    // a sock flung out as the door opens
    if (S.wcT != null && S.wcT > 0.3 && S.wcT < 1.1) {
      const v = (S.wcT - 0.3) / 0.8;
      ctx.save(); ctx.globalAlpha = Math.min(1, (1 - v) * 3); ctx.translate((0.05 + 0.45 * v) * h, (0.05 - 0.9 * v + 0.7 * v * v) * h); ctx.rotate(v * 8); sockShape(ctx, 0.08 * h, CORAL); ctx.restore();
    }
  },
  tick(S, dt) {
    if (S.wcT != null) { S.wcT += dt; if (S.air) S.wcT = null; }
    const want = S.wcT != null && S.wcT > 0.28 ? 1 : 0;
    S.door = (S.door || 0) + (want - (S.door || 0)) * Math.min(1, dt * (want ? 9 : 14));
    const landed = S.wcT != null;
    S.shake = landed ? Math.max(0, 1 - S.wcT / 0.32) : S.air ? 0.3 * S.thrust : 0;
    const spinWant = landed ? 0 : S.air ? 5 + 9 * S.thrust : S.idle ? 1 : 0;
    S.drumV = (S.drumV || 0) + (spinWant - (S.drumV || 0)) * Math.min(1, dt * (landed ? 5 : 2));
    S.drum = (S.drum || 0) + dt * (S.drumV || 0);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'sd', 11 * p * P.k, dt, () => P.add({ kind: 'steam', x: S.x + rnd(-0.18, 0.18) * h, y: S.y + 0.45 * h, vx: rnd(-50, 50), vy: rnd(60, 140), drag: 2.2, g: -50, life: rnd(0.5, 0.9), size: h * rnd(0.04, 0.065), grow: h * 0.1, layer: 'back' }));
    every(S, 'sb', 3 * p * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.2, 0.2) * h, y: S.y + 0.44 * h, vx: rnd(-40, 40), vy: rnd(40, 90), drag: 1, life: rnd(0.6, 1), size: h * rnd(0.02, 0.035), sway: 3, swayAmp: 18, layer: 'back' }));
  },
  land(S, P) {
    S.wcT = 0;
    dust(S, P, S.dust, 12);
    for (let i = 0; i < Math.round(8 * P.k) + 2; i++) P.add({ kind: 'bubble', x: S.x + rnd(-0.1, 0.15) * S.h, y: S.y + 0.05 * S.h, vx: rnd(-60, 80), vy: rnd(-120, -50), drag: 0.8, life: rnd(0.9, 1.5), size: S.h * rnd(0.025, 0.05), sway: 3, swayAmp: 20, delay: 0.3 + i * 0.04 });
  },
  idle(S, P, dt) {
    every(S, 'sb', 0.8 * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.1, 0.1) * S.h, y: S.y + 0.0 * S.h, vy: -30, drag: 0.3, life: 1.8, size: S.h * 0.03, sway: 2.5, swayAmp: 14 }));
  },
};

// Christmas Tree (D-073, as Rob changed it): Bip holds on to the top while it flies, the star in
// his other hand; on landing he puts the star on the top, it lights, and he climbs down a ladder.
const TREE_TIERS = [[-0.04, 0.22, 0.3], [-0.2, 0.06, 0.235], [-0.355, -0.1, 0.165]];
const TREE_LIGHTS = [[-0.2, 0.15], [-0.07, 0.17], [0.07, 0.17], [0.2, 0.14], [-0.15, 0.0], [0.0, 0.02], [0.14, -0.01], [-0.08, -0.15], [0.07, -0.16], [0.0, -0.27]];
const LIGHT_COLS = ['#FFE14D', '#FF6B81', '#8CF5FF', '#7CFF6B'];
function treeLadder(S) {
  const s = S.side || 1;
  return { top: { x: s * 0.13, y: -0.18 }, foot: { x: s * 0.4, y: 0.5 } };
}
// Bip on the tree, in units of h: flying, he holds the top and streams out in the wind; standing
// before he's landed, he dangles from the top; once landed, he stands on the ladder's top.
// th turns him (his head towards the top); hand is his free hand, holding the star.
function treePose(S, t) {
  const L = treeLadder(S);
  if (S.tadaT != null && !S.air) return { kind: 'ladder', fx: L.top.x, fy: L.top.y, th: 0, hand: { x: L.top.x + (S.side || 1) * 0.07, y: L.top.y - 0.33 } };
  const s = 0.3, d = 0.98 * s, wind = !!S.air;
  const th = wind ? 1.15 + (S.calm ? 0.04 : 0.13) * Math.sin(t * 13) * (0.4 + 0.6 * S.thrust) : 0.35 + (S.calm ? 0 : 0.05 * Math.sin(t * 2));
  const fx = -0.02 - d * Math.sin(th), fy = -0.36 + d * Math.cos(th);
  const hx = -0.1185 * s, hy = -0.211 * s, c = Math.cos(th), sn = Math.sin(th); // drawPilot's left hand
  return { kind: wind ? 'wind' : 'dangle', fx, fy, th, hand: { x: fx + hx * c - hy * sn - 0.02, y: fy + hx * sn + hy * c - 0.03 } };
}
function treeStar(S, t, h) {
  // where the star is: in Bip's hand until he's landed, then on the top
  const top = { x: 0, y: -0.425 * h, on: true };
  if (S.pilotIn === false) return top;
  const P = treePose(S, t);
  if (P.kind !== 'ladder') return { x: P.hand.x * h, y: P.hand.y * h, on: false };
  if (S.tadaT < 0.3) { const k = ease.inOut(clamp((S.tadaT - 0.1) / 0.2, 0, 1)); return { x: lerp(P.hand.x * h, top.x, k), y: lerp(P.hand.y * h, top.y, k), on: k >= 1 }; }
  return top;
}
const tree = {
  id: 'tree',
  look: 'A little fir tree flying out of a wrapped gift box, lights twinkling. Bip holds on to the top with the star in his other hand; on landing he puts the star on the top, it lights up, and he climbs down a ladder.',
  fw: [['#2FA36B', SUN, '#FFFFFF'], ['#E8443A', '#FFFFFF', SUN], [SUN, '#7CFF6B', SKY]],
  conf: ['#2FA36B', '#E8443A', SUN, '#FFFFFF', SKY],
  seat(S) { const P = treePose(S, 0); return { x: P.fx, y: P.fy, s: 0.3 }; },
  ladder(S) { return treeLadder(S); },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), side = S.side || 1, lit = S.lit || 0;
    // the gift box it flies out of
    rr(ctx, -0.17 * h, 0.31 * h, 0.34 * h, 0.19 * h, 0.02 * h); ctx.fillStyle = grad(ctx, -0.17 * h, 0, 0.17 * h, 0, ['#FF6A5E', '#E8443A', '#C2332B']); ctx.fill(); outline(ctx, lw);
    ctx.fillStyle = grad(ctx, -0.03 * h, 0, 0.03 * h, 0, GOLD); ctx.fillRect(-0.03 * h, 0.31 * h, 0.06 * h, 0.19 * h);
    ctx.beginPath(); ctx.rect(-0.03 * h, 0.31 * h, 0.06 * h, 0.19 * h); outline(ctx, lw * 0.5);
    // the trunk and the three tiers, with snow, garland, baubles and lights
    rr(ctx, -0.035 * h, 0.18 * h, 0.07 * h, 0.12 * h, 0.01 * h); ctx.fillStyle = '#8E5A34'; ctx.fill(); outline(ctx, lw * 0.7);
    TREE_TIERS.forEach(([yt, yb, hw]) => {
      const path = () => { ctx.beginPath(); ctx.moveTo(0, yt * h); ctx.lineTo(hw * h, yb * h); ctx.quadraticCurveTo(0, (yb + 0.05) * h, -hw * h, yb * h); ctx.closePath(); };
      path(); ctx.fillStyle = '#2FA36B'; ctx.fill();
      ctx.save(); path(); ctx.clip();
      ctx.fillStyle = '#24865A'; ctx.beginPath(); ctx.moveTo(0, yt * h); ctx.lineTo(-hw * h, yb * h); ctx.lineTo(-hw * 0.15 * h, (yb + 0.05) * h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(-hw, hw, u) * h, y = (yb + 0.05 * 4 * u * (1 - u) * 0.5) * h; ctx.beginPath(); ctx.arc(x, y, 0.022 * h, 0, TAU); ctx.fill(); }
      ctx.restore();
      path(); outline(ctx, lw);
    });
    ctx.lineWidth = lw * 0.8; ctx.strokeStyle = GOLD[1];
    ctx.beginPath(); ctx.moveTo(-0.22 * h, 0.04 * h); ctx.quadraticCurveTo(0, 0.13 * h, 0.22 * h, 0.02 * h); ctx.moveTo(-0.16 * h, -0.11 * h); ctx.quadraticCurveTo(0, -0.04 * h, 0.15 * h, -0.13 * h); ctx.stroke();
    for (const [x, y, c] of [[-0.19, 0.17, CORAL], [0.13, 0.18, SKY], [-0.02, 0.05, SUN], [-0.12, -0.03, PINK], [0.1, -0.05, CORAL], [0.0, -0.21, SKY], [-0.06, -0.17, SUN]]) {
      ctx.beginPath(); ctx.arc(x * h, y * h, 0.028 * h, 0, TAU); ctx.fillStyle = c; ctx.fill(); outline(ctx, lw * 0.5);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc((x - 0.009) * h, (y - 0.009) * h, 0.008 * h, 0, TAU); ctx.fill();
    }
    TREE_LIGHTS.forEach(([x, y], i) => {
      const tw = 0.5 + 0.5 * Math.sin(t * (S.calm ? 2 : 6) + i * 1.7), a = Math.min(1, 0.45 + 0.55 * tw + lit);
      glow(ctx, x * h, y * h, (0.035 + 0.03 * lit) * h, LIGHT_COLS[i % 4], a * 0.8);
      ctx.beginPath(); ctx.arc(x * h, y * h, 0.014 * h, 0, TAU); ctx.fillStyle = LIGHT_COLS[i % 4]; ctx.fill();
    });
    // the bow on the box, in front of the trunk
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0.31 * h); ctx.quadraticCurveTo(s * 0.11 * h, 0.22 * h, s * 0.11 * h, 0.3 * h); ctx.quadraticCurveTo(s * 0.06 * h, 0.33 * h, 0, 0.31 * h); ctx.fillStyle = GOLD[1]; ctx.fill(); outline(ctx, lw * 0.6); }
    ctx.beginPath(); ctx.arc(0, 0.31 * h, 0.022 * h, 0, TAU); ctx.fillStyle = GOLD[2]; ctx.fill(); outline(ctx, lw * 0.5);
    // the ladder, leaning on the tree once landed
    const lk = S.ladK || 0;
    if (lk > 0.01) {
      const L = treeLadder(S), tx = L.top.x * h, ty = L.top.y * h, fx = L.foot.x * h, fy = L.foot.y * h;
      const bx = lerp(tx, fx, lk), by = lerp(ty, fy, lk);
      const nx = (fy - ty), ny = -(fx - tx), nl = Math.hypot(nx, ny), ox = (nx / nl) * 0.055 * h, oy = (ny / nl) * 0.055 * h;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(tx + s * ox, ty + s * oy); ctx.lineTo(bx + s * ox, by + s * oy); ctx.lineWidth = 0.016 * h + lw * 1.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.016 * h; ctx.strokeStyle = '#D9A06A'; ctx.stroke(); }
      for (let i = 1; i <= 8; i++) { const u = (i - 0.5) / 8; if (u > lk) break; const x = lerp(tx, fx, u), y = lerp(ty, fy, u); ctx.beginPath(); ctx.moveTo(x - ox * 0.85, y - oy * 0.85); ctx.lineTo(x + ox * 0.85, y + oy * 0.85); ctx.lineWidth = lw * 2.2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = lw * 0.9; ctx.strokeStyle = '#C98A5A'; ctx.stroke(); }
    }
    // the star: in Bip's hand, or on the top and lit
    const st = treeStar(S, t, h);
    if (st.on) {
      glow(ctx, st.x, st.y, (0.14 + 0.1 * lit) * h, SUN, 0.5 + 0.5 * lit);
      if (lit > 0.02) {
        ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(t * 0.8); ctx.strokeStyle = `rgba(255,236,150,${0.85 * lit})`; ctx.lineWidth = lw * 0.9; ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(0.1 * h, 0); ctx.lineTo((0.15 + 0.03 * Math.sin(t * 6 + i)) * h, 0); ctx.stroke(); }
        ctx.restore();
      }
    }
    // Bip: holding the top in the wind, dangling from it, or on the ladder's top
    if (S.pilotIn !== false) {
      const P = treePose(S, t), s = 0.3 * h;
      if (P.kind === 'ladder') bipOut(ctx, S, t, P.fx * h, P.fy * h, s, { wave: S.tadaT < 0.45 || S.idle, flip: side < 0, mood: 'happy' });
      else {
        ctx.save(); ctx.translate(P.fx * h, P.fy * h); ctx.rotate(P.th);
        bipOut(ctx, S, t, 0, 0, s, { wave: true, mood: P.kind === 'wind' && S.thrust > 0.6 ? 'oh' : 'happy' });
        ctx.restore();
      }
    }
    {
      ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.on ? Math.sin(t * 2) * 0.05 : Math.sin(t * 4) * 0.2); star5(ctx, 0.065 * h);
      ctx.fillStyle = grad(ctx, -0.06 * h, -0.06 * h, 0.06 * h, 0.06 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.8);
      ctx.restore();
    }
  },
  tick(S, dt) {
    if (S.tadaT != null) { S.tadaT += dt; if (S.air) S.tadaT = null; }
    const placed = S.tadaT != null && S.tadaT >= 0.3;
    S.lit = placed ? Math.max(0, 1 - (S.tadaT - 0.3) / 1.6) : Math.max(0, (S.lit || 0) - dt * 2);
    const want = S.tadaT != null && !S.air ? 1 : 0;
    S.ladK = (S.ladK || 0) + (want - (S.ladK || 0)) * Math.min(1, dt * (want ? 7 : 12));
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'ts', 16 * p * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.14, 0.14) * h, y: S.y + 0.5 * h, vx: rnd(-50, 50), vy: rnd(70, 160), drag: 1.8, life: rnd(0.4, 0.8), size: h * rnd(0.02, 0.04), col: pick([SUN, '#FFFFFF', GOLD[0], '#FFE14D']), tw: 20, add: true, layer: 'back' }));
    every(S, 'sn', 7 * p * P.k, dt, () => P.add({ kind: 'smoke', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + 0.5 * h, vx: rnd(-40, 40), vy: rnd(40, 100), drag: 2, life: rnd(0.5, 0.9), size: h * rnd(0.025, 0.045), grow: h * 0.08, col: '#FFFFFF', a: 0.7, layer: 'back' }));
  },
  land(S, P) {
    S.tadaT = 0;
    dust(S, P, S.dust, 10);
    burst(P, S.x, S.y - 0.42 * S.h, 16, [SUN, '#FFFFFF', '#FFE14D'], { kind: 'star', size: [S.h * 0.03, S.h * 0.06], sp: 180, g: 60, add: true, life: [0.7, 1.2] });
    for (const p of P.list.slice(-Math.max(3, Math.round(16 * P.k)))) p.delay = 0.3;
  },
  idle(S, P, dt) {
    every(S, 'sn', 1.2 * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.3, 0.3) * S.h, y: S.y + rnd(-0.45, 0.2) * S.h, vy: -10, life: 1.2, size: S.h * 0.03, col: pick(['#FFFFFF', SUN]), tw: 10, add: true }));
  },
};

// Each ship's name, tier, price and sound from fleet.js's table (D-053), merged into the drawing.
export const SHIPS = [classic, box, tub, teapot, jack, sunflower, pod, spin, saucer, tree, crystal, phoenix, aurora].map((s) => Object.assign(s, FLEET_BY_ID[s.id]));
export const SHIP_BY_ID = Object.fromEntries(SHIPS.map((s) => [s.id, s]));
export const TIERS = {
  starter: { name: 'Starter', col: '#B9BFE6', ink: INK },
  fun: { name: 'Fun', col: '#FF8FB1', ink: INK },
  cool: { name: 'Cool', col: '#8CF5FF', ink: INK },
  premium: { name: 'Premium', col: '#FFC93C', ink: INK },
  legendary: { name: 'Legendary', col: '#FFFFFF', ink: INK, rainbow: true },
};

export function newState(h) {
  return { x: 0, y: 0, h, rot: 0, sx: 1, sy: 1, legs: 1, thrust: 0, pilotIn: true, blink: 0, mood: 'happy', look: 0, gy: 0, air: false, idle: false, open: 0, openT: 0, spin: 0, lock: 0, flap: 0, hop: 0, steer: 0, trail: [], sqT: null, flapT: 0, wave: false, acc: {}, dust: '#EDE8FF', bloom: 0, landedOpen: false };
}

// Moves a ship's own moving parts on by dt seconds, and makes its sparks and puffs.
export function tickShip(ship, S, P, dt, t) {
  S.blink = ((t + S.h * 0.37) % 3.7) < 0.13 ? 1 : 0;
  if (S.sqT != null) {
    S.sqT += dt;
    const u = S.sqT;
    S.sy = 1 - 0.17 * Math.exp(-6 * u) * Math.cos(15 * u);
    S.sx = 1 + (1 - S.sy) * 0.7;
    if (u > 1.2) { S.sqT = null; S.sx = 1; S.sy = 1; }
  }
  S.flap = Math.max(0, S.flap - dt * 1.6);
  S.hop = Math.max(0, S.hop - dt * 2.2);
  S.lock = Math.max(0, S.lock - dt * 1.1);
  if (!S.calm) S.flapT += dt * (2.4 + 2.2 * S.thrust); // wings hold still when calm
  S.spin += dt * (S.air || S.idle ? 2.2 : 0.15) * (1 - S.lock);
  if (ship.tick) ship.tick(S, dt, t);
  S.open += (S.openT - S.open) * Math.min(1, dt * 4);
  if (S.thrust > 0.02 && ship.thrust) ship.thrust(S, P, dt, t);
  if (S.idle && ship.idle) ship.idle(S, P, dt, t);
}

// Touchdown: the squash and the ship's own landing show.
export function landShip(ship, S, P) {
  S.sqT = 0; S.air = false; S.thrust = 0;
  if (ship.land) ship.land(S, P);
}

export function drawShip(ctx, ship, S, t) {
  ctx.save();
  ctx.translate(S.x, S.y); ctx.rotate(S.rot || 0);
  const h = S.h;
  ctx.translate(0, h * 0.5); ctx.scale(S.sx || 1, S.sy || 1); ctx.translate(0, -h * 0.5);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ship.draw(ctx, S, t);
  ctx.restore();
}

export function drawTrail(ctx, ship, S, t) { if (ship.drawTrail) ship.drawTrail(ctx, S, t); }
