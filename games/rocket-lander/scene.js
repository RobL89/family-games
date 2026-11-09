// Drawing for Rocket Lander, all original and drawn in code: space, distant planets,
// the planet's ground with its number line, the rocket, its robot pilot Bip, and effects.

import { PLANETS } from './planets.js';
import { fmt, labelSpots, tidy } from './numbers.js';

export const INK = '#1B1446';
export const FONT = '"Fredoka", "Baloo 2", "Nunito", "Arial Rounded MT Bold", "Segoe UI Rounded", system-ui, sans-serif';
const TAU = Math.PI * 2;
const CORAL = '#FF5D73';
const SUN = '#FFC93C';
const MINT = '#5FE3BD';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = {
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t * t * t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t) => { const c = 1.8; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
};

export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgba = (h, a) => `rgba(${rgb(h).join(',')},${a})`;
export const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function layer(W, H, dpr) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(W * dpr));
  c.height = Math.max(1, Math.round(H * dpr));
  const x = c.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [c, x];
}

export function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// ---------- Hills: smooth or jagged ridges, and where their surface is ----------

function ridgePts(r, w, base, amp, step) {
  const pts = [];
  for (let x = -step; x <= w + step * 2; x += step * (0.7 + r() * 0.6)) pts.push([x, base - amp * (0.3 + 0.7 * r())]);
  return pts;
}

function ridgePath(ctx, pts, bottom, smooth) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], bottom);
  ctx.lineTo(pts[0][0], pts[0][1]);
  if (smooth) {
    for (let i = 1; i < pts.length - 1; i++) {
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    }
    ctx.lineTo(...pts[pts.length - 1]);
  } else {
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
  }
  ctx.lineTo(pts[pts.length - 1][0], bottom);
  ctx.closePath();
}

// The surface height of a smooth ridge at x (follows the same curves as ridgePath).
function ridgeY(pts, x, smooth) {
  if (!smooth) {
    for (let i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) { const t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]); return lerp(pts[i - 1][1], pts[i][1], t); }
    }
    return pts[pts.length - 1][1];
  }
  const mid = (i) => [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = i === 1 ? pts[0] : mid(i - 1), b = mid(i);
    if (x <= b[0]) {
      const t = clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
      return (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * pts[i][1] + t * t * b[1];
    }
  }
  return pts[pts.length - 1][1];
}

function crater(ctx, x, y, rx, ry, dark, light) {
  ctx.fillStyle = light;
  ctx.beginPath(); ctx.ellipse(x, y + ry * 0.12, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(x, y, rx * 0.86, ry * 0.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba('#000000', 0.08);
  ctx.beginPath(); ctx.ellipse(x - rx * 0.12, y - ry * 0.1, rx * 0.6, ry * 0.45, 0, 0, TAU); ctx.fill();
}

function lolly(ctx, x, y, h, c1, c2, lw) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = lw + 3.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
  const r = h * 0.38;
  ctx.fillStyle = c1; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y - h, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y - h, r - 1, 0, TAU); ctx.clip();
  ctx.strokeStyle = c2; ctx.lineWidth = r * 0.26;
  ctx.beginPath();
  for (let a = 0; a < 5.2 * Math.PI; a += 0.2) { const rad = (a / (5.2 * Math.PI)) * r; ctx.lineTo(x + Math.cos(a) * rad, y - h + Math.sin(a) * rad); }
  ctx.stroke(); ctx.restore();
  ctx.fillStyle = rgba('#FFFFFF', 0.6);
  ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - h - r * 0.4, r * 0.22, r * 0.13, -0.6, 0, TAU); ctx.fill();
}

function crystal(ctx, x, y, h, w, ang, c1, c2) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h * 0.72); ctx.lineTo(0, -h); ctx.lineTo(w / 2, -h * 0.72); ctx.lineTo(w / 2, 0); ctx.closePath();
  ctx.fillStyle = c1; ctx.fill();
  ctx.fillStyle = c2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.lineTo(w / 2, -h * 0.72); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.75);
  ctx.beginPath(); ctx.moveTo(-w * 0.32, -h * 0.1); ctx.lineTo(-w * 0.32, -h * 0.66); ctx.lineTo(-w * 0.14, -h * 0.8); ctx.lineTo(-w * 0.14, -h * 0.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(INK, 0.7); ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h * 0.72); ctx.lineTo(0, -h); ctx.lineTo(w / 2, -h * 0.72); ctx.lineTo(w / 2, 0);
  ctx.stroke();
  ctx.restore();
}

function oddPlant(ctx, x, y, h, kind, r, lw) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 0) { // curly stalk with a glowing bulb
    const top = [x + (r() - 0.5) * h * 0.4, y - h];
    ctx.strokeStyle = INK; ctx.lineWidth = lw + 3;
    const path = () => { ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - h * 0.25, y - h * 0.4, x + h * 0.3, y - h * 0.7, top[0], top[1]); };
    path(); ctx.stroke();
    ctx.strokeStyle = '#9BE36D'; ctx.lineWidth = lw; path(); ctx.stroke();
    const col = r() < 0.5 ? '#FFE066' : '#FF8AD8';
    const g = ctx.createRadialGradient(top[0], top[1], 0, top[0], top[1], h * 0.32);
    g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(top[0], top[1], h * 0.32, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(top[0], top[1], h * 0.11, 0, TAU); ctx.fill(); ctx.stroke();
  } else if (kind === 1) { // fan of round leaves
    for (let i = -2; i <= 2; i++) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(i * 0.38);
      ctx.fillStyle = i % 2 ? '#3FBF6A' : '#58D47E'; ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(0, -h * 0.5, h * 0.17, h * 0.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = rgba(INK, 0.35); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.1); ctx.lineTo(0, -h * 0.85); ctx.stroke();
      ctx.restore();
    }
  } else { // spotted mushroom
    ctx.fillStyle = '#F5F0D8'; ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
    rr(ctx, x - h * 0.1, y - h * 0.55, h * 0.2, h * 0.55, h * 0.08); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FF7A59';
    ctx.beginPath(); ctx.ellipse(x, y - h * 0.55, h * 0.36, h * 0.3, 0, Math.PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF4E0';
    [[-0.17, -0.68, 0.06], [0.1, -0.74, 0.05], [0.2, -0.6, 0.04]].forEach(([dx, dy, s]) => { ctx.beginPath(); ctx.arc(x + dx * h, y + dy * h, s * h, 0, TAU); ctx.fill(); });
  }
}

function spire(ctx, x, y, h, w, col, tip) {
  ctx.fillStyle = col; ctx.strokeStyle = rgba(INK, 0.75); ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * 0.1, y - h * 0.5, x, y - h); ctx.quadraticCurveTo(x + w * 0.1, y - h * 0.5, x + w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  const g = ctx.createRadialGradient(x, y - h, 0, x, y - h, w * 0.9);
  g.addColorStop(0, rgba(tip, 0.8)); g.addColorStop(1, rgba(tip, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - h, w * 0.9, 0, TAU); ctx.fill();
  ctx.fillStyle = tip; ctx.beginPath(); ctx.arc(x, y - h, w * 0.16, 0, TAU); ctx.fill();
}

// ---------- Rocket, pilot, flag, rock ----------

function flameLayer(ctx, top, w, L, col) {
  ctx.beginPath();
  ctx.moveTo(-w, top);
  ctx.bezierCurveTo(-w, top + L * 0.45, -w * 0.25, top + L * 0.78, 0, top + L);
  ctx.bezierCurveTo(w * 0.25, top + L * 0.78, w, top + L * 0.45, w, top);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
}

function bodyPath(ctx, h) {
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.bezierCurveTo(h * 0.17, -h * 0.44, h * 0.27, -h * 0.24, h * 0.265, 0);
  ctx.bezierCurveTo(h * 0.26, h * 0.17, h * 0.235, h * 0.29, h * 0.18, h * 0.35);
  ctx.lineTo(-h * 0.18, h * 0.35);
  ctx.bezierCurveTo(-h * 0.235, h * 0.29, -h * 0.26, h * 0.17, -h * 0.265, 0);
  ctx.bezierCurveTo(-h * 0.27, -h * 0.24, -h * 0.17, -h * 0.44, 0, -h * 0.5);
  ctx.closePath();
}

// Bip's head: a round mint robot with a screen face. mood: 'happy' | 'oh' | ''.
export function drawPilotHead(ctx, x, y, r, { blink = 0, mood = '', look = 0, t = 0 } = {}) {
  const lw = Math.max(1.4, r * 0.12);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // antenna
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x, y - r * 0.9); ctx.quadraticCurveTo(x + r * 0.1, y - r * 1.3, x + r * 0.22, y - r * 1.5); ctx.stroke();
  const glow = 0.6 + 0.4 * Math.sin(t * 5);
  const g = ctx.createRadialGradient(x + r * 0.22, y - r * 1.55, 0, x + r * 0.22, y - r * 1.55, r * 0.6);
  g.addColorStop(0, rgba(SUN, 0.7 * glow)); g.addColorStop(1, rgba(SUN, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + r * 0.22, y - r * 1.55, r * 0.6, 0, TAU); ctx.fill();
  ctx.fillStyle = SUN; ctx.beginPath(); ctx.arc(x + r * 0.22, y - r * 1.55, r * 0.2, 0, TAU); ctx.fill(); ctx.stroke();
  // head
  const hg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  hg.addColorStop(0, '#B4FFE6'); hg.addColorStop(0.6, MINT); hg.addColorStop(1, '#2FB892');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  // ear bolts
  ctx.fillStyle = '#FF8FB1';
  [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(x + s * r * 0.98, y + r * 0.05, r * 0.16, 0, TAU); ctx.fill(); ctx.stroke(); });
  // face screen
  rr(ctx, x - r * 0.66, y - r * 0.42, r * 1.32, r * 0.86, r * 0.38);
  ctx.fillStyle = '#1E2A5A'; ctx.fill();
  ctx.lineWidth = lw * 0.7; ctx.stroke();
  const ex = r * 0.28, ey = y - r * 0.04, lx = look * r * 0.08;
  ctx.fillStyle = '#8CF5FF'; ctx.strokeStyle = '#8CF5FF';
  if (mood === 'happy') {
    ctx.lineWidth = r * 0.13;
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(x + s * ex + lx, ey + r * 0.06, r * 0.13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
  } else if (mood === 'oh') {
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(x + s * ex + lx, ey, r * 0.13, 0, TAU); ctx.fill(); });
  } else {
    const eh = r * 0.26 * (1 - clamp(blink, 0, 1) * 0.85);
    [-1, 1].forEach((s) => { rr(ctx, x + s * ex - r * 0.08 + lx, ey - eh / 2, r * 0.16, eh, r * 0.08); ctx.fill(); });
  }
  ctx.lineWidth = r * 0.09;
  ctx.beginPath();
  if (mood === 'oh') ctx.arc(x + lx, y + r * 0.24, r * 0.07, 0, TAU);
  else ctx.arc(x + lx, y + r * 0.13, r * 0.16, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  // cheeks
  ctx.fillStyle = rgba('#FF8FB1', 0.85);
  [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(x + s * r * 0.5, y + r * 0.58, r * 0.13, r * 0.08, 0, 0, TAU); ctx.fill(); });
  // shine
  ctx.fillStyle = rgba('#FFFFFF', 0.7);
  ctx.beginPath(); ctx.ellipse(x - r * 0.5, y - r * 0.6, r * 0.16, r * 0.09, -0.7, 0, TAU); ctx.fill();
}

// The whole rocket. R: { x, y, h, rot, sx, sy, legs, flame, pilotIn, blink, mood, look }
export function drawRocket(ctx, R, t) {
  const h = R.h, lw = Math.max(2, h * 0.032);
  ctx.save();
  ctx.translate(R.x, R.y);
  ctx.rotate(R.rot || 0);
  ctx.translate(0, h * 0.5); ctx.scale(R.sx || 1, R.sy || 1); ctx.translate(0, -h * 0.5);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  // flame and its glow
  if (R.flame > 0.02) {
    const p = R.flame;
    const f = 1 + 0.16 * Math.sin(t * 41) + 0.1 * Math.sin(t * 23 + 1.3);
    const L = h * (0.16 + 0.34 * p) * f, w = h * 0.11 * (0.75 + 0.25 * Math.min(p, 1.2));
    const top = h * 0.39;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, top + L * 0.3, 0, 0, top + L * 0.3, h * 0.45 * (0.6 + p * 0.5));
    g.addColorStop(0, rgba('#FFB347', 0.45)); g.addColorStop(1, rgba('#FF5D73', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, top + L * 0.3, h * 0.45 * (0.6 + p * 0.5), 0, TAU); ctx.fill();
    ctx.restore();
    flameLayer(ctx, top, w * 1.25, L * 1.12, rgba('#FF5D73', 0.9));
    flameLayer(ctx, top, w, L, '#FF9F3A');
    flameLayer(ctx, top, w * 0.62, L * 0.7, '#FFE066');
    flameLayer(ctx, top, w * 0.3, L * 0.4, '#FFFBEA');
  }

  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  // landing legs
  if (R.legs > 0.01) {
    const k = ease.back(clamp(R.legs, 0, 1));
    [-1, 1].forEach((s) => {
      const hx = s * h * 0.17, hy = h * 0.2;
      const fx = s * (h * 0.2 + h * 0.2 * k), fy = h * 0.3 + h * 0.165 * k;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy);
      ctx.lineWidth = h * 0.065 + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.lineWidth = h * 0.065; ctx.strokeStyle = '#B7BCE6'; ctx.stroke();
      rr(ctx, fx - h * 0.08, fy - h * 0.005, h * 0.16, h * 0.045, h * 0.02);
      ctx.fillStyle = '#7C82B8'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    });
  }
  // fins
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s * h * 0.2, h * 0.0);
    ctx.quadraticCurveTo(s * h * 0.42, h * 0.14, s * h * 0.39, h * 0.41);
    ctx.quadraticCurveTo(s * h * 0.3, h * 0.37, s * h * 0.15, h * 0.33);
    ctx.closePath();
    ctx.fillStyle = CORAL; ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba('#FFFFFF', 0.35);
    ctx.beginPath(); ctx.moveTo(s * h * 0.25, h * 0.07); ctx.quadraticCurveTo(s * h * 0.36, h * 0.16, s * h * 0.35, h * 0.33); ctx.lineTo(s * h * 0.3, h * 0.3); ctx.quadraticCurveTo(s * h * 0.31, h * 0.17, s * h * 0.25, h * 0.07); ctx.fill();
  });
  // nozzle
  ctx.beginPath();
  ctx.moveTo(-h * 0.1, h * 0.33); ctx.lineTo(h * 0.1, h * 0.33); ctx.lineTo(h * 0.135, h * 0.415); ctx.lineTo(-h * 0.135, h * 0.415); ctx.closePath();
  ctx.fillStyle = '#5B5F8A'; ctx.fill(); ctx.stroke();
  // body
  bodyPath(ctx, h);
  const bg = ctx.createLinearGradient(-h * 0.27, 0, h * 0.27, 0);
  bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(0.55, '#F4F1FF'); bg.addColorStop(1, '#CFC7F5');
  ctx.fillStyle = bg; ctx.fill();
  ctx.save(); bodyPath(ctx, h); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-h * 0.4, -h * 0.6); ctx.lineTo(h * 0.4, -h * 0.6); ctx.lineTo(h * 0.4, -h * 0.29); ctx.quadraticCurveTo(0, -h * 0.21, -h * 0.4, -h * 0.29); ctx.closePath();
  ctx.fillStyle = CORAL; ctx.fill();
  ctx.beginPath(); ctx.moveTo(h * 0.4, -h * 0.29); ctx.quadraticCurveTo(0, -h * 0.21, -h * 0.4, -h * 0.29); ctx.stroke();
  ctx.fillStyle = rgba('#FFFFFF', 0.45);
  ctx.beginPath(); ctx.ellipse(-h * 0.07, -h * 0.4, h * 0.035, h * 0.07, 0.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2EC4D6'; ctx.fillRect(-h * 0.4, h * 0.2, h * 0.8, h * 0.075);
  ctx.beginPath(); ctx.moveTo(-h * 0.4, h * 0.2); ctx.lineTo(h * 0.4, h * 0.2); ctx.moveTo(-h * 0.4, h * 0.275); ctx.lineTo(h * 0.4, h * 0.275); ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  [-0.15, -0.05, 0.05, 0.15].forEach((dx) => { ctx.beginPath(); ctx.arc(dx * h, h * 0.2375, h * 0.012, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = rgba('#FFFFFF', 0.85); ctx.lineWidth = h * 0.035;
  ctx.beginPath(); ctx.moveTo(-h * 0.19, -h * 0.17); ctx.quadraticCurveTo(-h * 0.215, 0, -h * 0.19, h * 0.14); ctx.stroke();
  ctx.restore();
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  bodyPath(ctx, h); ctx.stroke();
  // window with Bip inside
  const wy = -h * 0.045, wr = h * 0.135;
  ctx.fillStyle = '#E9ECFF';
  ctx.beginPath(); ctx.arc(0, wy, wr * 1.3, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#B9BFE6';
  [0, 1, 2, 3, 4, 5].forEach((i) => { const a = i * TAU / 6 + 0.3; ctx.beginPath(); ctx.arc(Math.cos(a) * wr * 1.15, wy + Math.sin(a) * wr * 1.15, h * 0.011, 0, TAU); ctx.fill(); });
  ctx.save();
  ctx.beginPath(); ctx.arc(0, wy, wr, 0, TAU); ctx.clip();
  const gg = ctx.createRadialGradient(-wr * 0.3, wy - wr * 0.3, wr * 0.1, 0, wy, wr * 1.1);
  gg.addColorStop(0, '#7FDBFF'); gg.addColorStop(1, '#2747A8');
  ctx.fillStyle = gg; ctx.fillRect(-wr, wy - wr, wr * 2, wr * 2);
  if (R.pilotIn !== false) drawPilotHead(ctx, 0, wy + wr * 0.38, wr * 0.62, { blink: R.blink, mood: R.mood, look: R.look, t });
  ctx.fillStyle = rgba('#FFFFFF', 0.4);
  ctx.beginPath(); ctx.arc(0, wy, wr * 0.82, Math.PI * 1.05, Math.PI * 1.45); ctx.arc(0, wy, wr * 0.6, Math.PI * 1.45, Math.PI * 1.05, true); ctx.fill();
  ctx.restore();
  ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(0, wy, wr, 0, TAU); ctx.stroke();
  ctx.restore();
}

// Bip standing on the ground. P: { x, y (feet), s (height), wave, mood, flip, squash }
export function drawPilot(ctx, P, t) {
  const s = P.s, lw = Math.max(1.6, s * 0.035);
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.scale((P.flip ? -1 : 1) * (1 + (P.squash || 0) * 0.5), 1 - (P.squash || 0));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  // legs
  [-1, 1].forEach((k) => {
    rr(ctx, k * s * 0.1 - s * 0.055, -s * 0.16, s * 0.11, s * 0.16, s * 0.04);
    ctx.fillStyle = '#B7BCE6'; ctx.fill(); ctx.stroke();
    rr(ctx, k * s * 0.1 - s * 0.08, -s * 0.06, s * 0.16, s * 0.07, s * 0.035);
    ctx.fillStyle = '#5B5F8A'; ctx.fill(); ctx.stroke();
  });
  // arms (one waves)
  const wave = P.wave ? Math.sin(t * 12) * 0.35 - 1.9 : 0.5;
  [[-1, 0.5], [1, wave]].forEach(([k, a]) => {
    ctx.save(); ctx.translate(k * s * 0.2, -s * 0.36); ctx.rotate(k * a);
    ctx.lineWidth = s * 0.09 + lw * 2; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, s * 0.17); ctx.stroke();
    ctx.lineWidth = s * 0.09; ctx.strokeStyle = MINT; ctx.stroke();
    ctx.restore();
  });
  // body
  rr(ctx, -s * 0.22, -s * 0.48, s * 0.44, s * 0.36, s * 0.16);
  const bg = ctx.createLinearGradient(-s * 0.22, 0, s * 0.22, 0);
  bg.addColorStop(0, '#9FFBDD'); bg.addColorStop(1, '#2FB892');
  ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
  rr(ctx, -s * 0.11, -s * 0.4, s * 0.22, s * 0.16, s * 0.05);
  ctx.fillStyle = '#E9ECFF'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(-s * 0.04, -s * 0.32, s * 0.025, 0, TAU); ctx.fill();
  ctx.fillStyle = SUN; ctx.beginPath(); ctx.arc(s * 0.04, -s * 0.32, s * 0.025, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.scale(1 + (P.squash || 0) * 0.5, 1 - (P.squash || 0));
  drawPilotHead(ctx, 0, -s * 0.66, s * 0.24, { mood: P.mood, blink: P.blink, t });
  ctx.restore();
}

// A flag with a number. F: { x, y (ground), h, grow, text, dir (1 right, -1 left) }
export function drawFlag(ctx, F, t, font) {
  if (F.grow <= 0) return;
  const k = ease.back(clamp(F.grow, 0, 1));
  const ph = F.h * k, top = F.y - ph;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(F.x, F.y); ctx.lineTo(F.x, top); ctx.stroke();
  ctx.strokeStyle = '#F4F1FF'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = SUN; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(F.x, top - 3, 5, 0, TAU); ctx.fill(); ctx.stroke();
  const fs = Math.round(F.h * 0.3);
  ctx.font = `600 ${fs}px ${font}`;
  const tw = ctx.measureText(F.text).width;
  const pw = (tw + fs * 0.9) * clamp(F.grow * 1.4 - 0.4, 0.05, 1), phh = fs * 1.35;
  const d = F.dir || 1, y0 = top + 2;
  const wav = (u) => Math.sin(t * 6 - u * 4) * fs * 0.08 * u;
  ctx.beginPath();
  ctx.moveTo(F.x, y0);
  for (let u = 0; u <= 1.001; u += 0.1) ctx.lineTo(F.x + d * pw * u, y0 + wav(u));
  for (let u = 1; u >= -0.001; u -= 0.1) ctx.lineTo(F.x + d * pw * u, y0 + phh + wav(u) - (u > 0.98 ? 0 : 0));
  ctx.closePath();
  ctx.fillStyle = CORAL; ctx.fill(); ctx.lineJoin = 'round'; ctx.stroke();
  if (F.grow > 0.8) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cx = F.x + d * pw / 2, cy = y0 + phh / 2 + wav(0.5) + fs * 0.04;
    ctx.lineWidth = fs * 0.22; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    ctx.strokeText(F.text, cx, cy);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(F.text, cx, cy);
  }
  ctx.restore();
}

const ROCK = [[1, 0.05], [0.78, 0.6], [0.3, 0.95], [-0.35, 0.88], [-0.88, 0.55], [-1, -0.05], [-0.72, -0.62], [-0.15, -0.95], [0.45, -0.82], [0.88, -0.45]];

export function drawRock(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  const m = (i) => { const a = ROCK[i % ROCK.length], b = ROCK[(i + 1) % ROCK.length]; return [(a[0] + b[0]) / 2 * r, (a[1] + b[1]) / 2 * r]; };
  ctx.moveTo(...m(0));
  for (let i = 1; i <= ROCK.length; i++) { const p = ROCK[i % ROCK.length]; ctx.quadraticCurveTo(p[0] * r, p[1] * r, ...m(i)); }
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#F1EDFF'); g.addColorStop(0.5, '#C4BBF0'); g.addColorStop(1, '#8B80CC');
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.14); ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = rgba('#7C70C2', 0.55);
  [[0.3, 0.3, 0.22], [-0.35, 0.35, 0.14], [0.05, -0.35, 0.12]].forEach(([dx, dy, s]) => { ctx.beginPath(); ctx.arc(dx * r, dy * r, s * r, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#FFFFFF';
  sparkle(ctx, -r * 0.42, -r * 0.4, r * 0.32);
  ctx.restore();
}

// A planet as a round picture, for the planet picker. Locked ones are dark silhouettes.
export function drawPlanetBall(ctx, i, cx, cy, r, locked) {
  const P = PLANETS[i];
  const lw = Math.max(2, r * 0.08);
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const ring = (front) => {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.35);
    ctx.beginPath();
    if (front) ctx.ellipse(0, 0, r * 1.55, r * 0.42, 0, 0, Math.PI);
    else ctx.ellipse(0, 0, r * 1.55, r * 0.42, 0, Math.PI, TAU);
    ctx.strokeStyle = INK; ctx.lineWidth = r * 0.22 + lw * 2; ctx.stroke();
    ctx.strokeStyle = locked ? '#2C2560' : '#FFD9A8'; ctx.lineWidth = r * 0.22; ctx.stroke();
    if (!locked) { ctx.strokeStyle = '#FFB3D9'; ctx.lineWidth = r * 0.07; ctx.stroke(); }
    ctx.restore();
  };
  if (P.rings) ring(false);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
  if (locked) {
    ctx.fillStyle = '#2C2560'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    if (P.rings) ring(true);
    // padlock
    const s = r * 0.42;
    ctx.strokeStyle = '#8D85C9'; ctx.lineWidth = s * 0.28;
    ctx.beginPath(); ctx.arc(cx, cy - s * 0.25, s * 0.45, Math.PI, TAU); ctx.lineTo(cx + s * 0.45, cy + s * 0.1); ctx.moveTo(cx - s * 0.45, cy - s * 0.25); ctx.lineTo(cx - s * 0.45, cy + s * 0.1); ctx.stroke();
    rr(ctx, cx - s * 0.75, cy, s * 1.5, s * 1.1, s * 0.25); ctx.fillStyle = '#8D85C9'; ctx.fill();
    ctx.fillStyle = '#2C2560'; ctx.beginPath(); ctx.arc(cx, cy + s * 0.45, s * 0.17, 0, TAU); ctx.fill();
    ctx.restore();
    return;
  }
  ctx.save(); ctx.clip();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, P.ground[0]); g.addColorStop(1, P.ground[2]);
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const R = rng(P.seed);
  if (P.id === 'moon') {
    [[-0.3, -0.25, 0.3], [0.35, 0.2, 0.22], [-0.2, 0.45, 0.16], [0.4, -0.45, 0.12], [0.0, 0.05, 0.1]].forEach(([dx, dy, s]) => crater(ctx, cx + dx * r, cy + dy * r, s * r, s * r * 0.85, '#A3A7C2', '#F4F5FA'));
  } else if (P.id === 'dust') {
    ctx.strokeStyle = rgba('#7A2E1A', 0.45); ctx.lineWidth = r * 0.12;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); for (let u = -1.2; u <= 1.2; u += 0.1) ctx.lineTo(cx + u * r, cy + k * r * 0.38 + Math.sin(u * 5 + k) * r * 0.08); ctx.stroke(); }
  } else if (P.id === 'candy') {
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22;
    for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(cx + k * r * 0.5 - r, cy - r); ctx.lineTo(cx + k * r * 0.5 + r, cy + r); ctx.stroke(); }
  } else if (P.id === 'ice') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.95, r * 0.9, r * 0.4, 0, 0, TAU); ctx.fill();
    for (let k = 0; k < 6; k++) { const x = cx + (R() - 0.5) * r * 1.6, y = cy + (R() - 0.2) * r * 1.2; ctx.fillStyle = rgba('#FFFFFF', 0.7); ctx.beginPath(); ctx.moveTo(x, y - r * 0.2); ctx.lineTo(x + r * 0.1, y); ctx.lineTo(x, y + r * 0.08); ctx.lineTo(x - r * 0.1, y); ctx.fill(); }
  } else if (P.id === 'jungle') {
    for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 2 ? '#2F7F40' : '#B6F27A'; ctx.beginPath(); ctx.ellipse(cx + (R() - 0.5) * r * 1.8, cy + (R() - 0.5) * r * 1.8, r * (0.2 + R() * 0.25), r * (0.12 + R() * 0.15), R() * 3, 0, TAU); ctx.fill(); }
  } else {
    ctx.strokeStyle = rgba('#E8D6FF', 0.6); ctx.lineWidth = r * 0.12;
    [-0.5, 0, 0.45].forEach((k) => { ctx.beginPath(); ctx.ellipse(cx, cy + k * r, r * 1.1, r * 0.12, 0, 0, TAU); ctx.stroke(); });
  }
  const sg = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.2, cx, cy, r * 1.15);
  sg.addColorStop(0, rgba('#FFFFFF', 0.28)); sg.addColorStop(0.6, rgba('#FFFFFF', 0)); sg.addColorStop(1, rgba('#14092E', 0.42));
  ctx.fillStyle = sg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
  ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
  ctx.fillStyle = rgba('#FFFFFF', 0.75);
  ctx.beginPath(); ctx.ellipse(cx - r * 0.45, cy - r * 0.5, r * 0.16, r * 0.09, -0.7, 0, TAU); ctx.fill();
  if (P.rings) ring(true);
  ctx.restore();
}

function farPlanet(ctx, x, y, r, f) {
  const hg = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.6);
  hg.addColorStop(0, rgba(f.c1, 0.28)); hg.addColorStop(1, rgba(f.c1, 0));
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, mix(f.c1, '#FFFFFF', 0.35)); g.addColorStop(0.55, f.c1); g.addColorStop(1, f.c2);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  if (f.kind === 'swirl' || f.kind === 'bands') {
    ctx.strokeStyle = rgba(f.c2, 0.4); ctx.lineWidth = r * 0.13;
    [-0.55, -0.15, 0.25, 0.6].forEach((k, i) => { ctx.beginPath(); for (let u = -1.1; u <= 1.1; u += 0.1) ctx.lineTo(x + u * r, y + k * r + Math.sin(u * 4 + i) * r * 0.06); ctx.stroke(); });
    if (f.kind === 'swirl') { ctx.fillStyle = rgba('#FFFFFF', 0.5); ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.1, r * 0.2, r * 0.11, 0.2, 0, TAU); ctx.fill(); }
  } else if (f.kind === 'craters') {
    [[-0.3, -0.2, 0.25], [0.35, 0.25, 0.18], [-0.15, 0.45, 0.12]].forEach(([dx, dy, s]) => { ctx.fillStyle = rgba(f.c2, 0.45); ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, s * r, 0, TAU); ctx.fill(); });
  } else if (f.kind === 'lolly') {
    ctx.strokeStyle = rgba('#FFFFFF', 0.75); ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    for (let a = 0; a < 5 * Math.PI; a += 0.15) { const rad = (a / (5 * Math.PI)) * r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    ctx.stroke();
  }
  const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  sh.addColorStop(0.45, rgba('#0A0530', 0)); sh.addColorStop(1, rgba('#0A0530', 0.5));
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = rgba(mix(f.c1, '#FFFFFF', 0.5), 0.55); ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.95, Math.PI * 1.75); ctx.stroke();
}

// ---------- The scene ----------

export class Scene {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0; this.H = 0; this.dpr = 1;
    this.pi = 0; this.planet = PLANETS[0];
    this.line = null; this.labelIdx = []; this.showAs = 'fraction';
    this.scroll = 0; this.offX = 0;
    this.shooting = []; this.nextShoot = 2.5;
    this.particles = [];
    this.calm = false;
    this.notes = [];
    this.acc = { spark: 0, smoke: 0 };
    this.topPad = 90;
  }

  resize(W, H, dpr) {
    this.W = W; this.H = H; this.dpr = dpr;
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    this.c.style.width = W + 'px'; this.c.style.height = H + 'px';
    this.layout();
  }

  setPlanet(i) {
    this.pi = i; this.planet = PLANETS[i];
    if (this.W) this.build();
  }

  setLine(line, labelEvery, showAs) {
    this.line = line; this.labelEvery = labelEvery; this.showAs = showAs;
    this.labelIdx = labelSpots(line, labelEvery);
    if (this.W) this.layout();
  }

  layout() {
    const { W, H } = this;
    this.groundH = Math.round(clamp(H * 0.19, 84, 150));
    this.groundY = H - this.groundH;
    this.rocketH = clamp(Math.min(H * 0.15, W * 0.2), 56, 128);
    this.fitLabels();
    this.makeStars();
    this.build();
  }

  // Chooses the label size and the line's ends so numbers fit without overlapping.
  // If the asked-for labels can't fit even when smaller, every 2nd, 5th, 10th... is
  // written instead, so the numbers shown stay evenly spaced. The ends are always written.
  fitLabels() {
    const { line, ctx, W } = this;
    if (!line) { this.x0 = 40; this.x1 = W - 40; this.ppu = 1; this.pps = 1; this.shown = []; this.shownIdx = []; this.fs = 20; return; }
    const base = clamp(this.groundH * 0.25, 17, 36);
    const MIN = 15;
    ctx.font = `600 ${base}px ${FONT}`;
    const text = (i) => fmt(line.value(i), this.showAs);
    const wid = (i) => ctx.measureText(text(i)).width;
    const last = line.gaps;
    const every = this.labelEvery > 0 ? this.labelEvery : 0;
    const asked = this.labelIdx;
    const widest = Math.max(...asked.map(wid));
    const marginFor = (k) => Math.max(30, (widest * k) / 2 + 14, W * 0.045);
    const tries = every > 0 ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000] : [0];
    let pick = null;
    // An end that isn't on the regular pattern (0 to 97 in tens) may crowd its neighbour;
    // that neighbour is left out below rather than shrinking every number.
    const regular = (i, e) => e > 0 && Math.abs(line.value(i) / e - Math.round(line.value(i) / e)) < 1e-6;
    for (const f of tries) {
      const e = f ? tidy(every * f) : 0;
      const idx = f ? labelSpots(line, e) : [0, last];
      const pps = (W - marginFor(1) * 2) / last;
      // the scale that makes neighbouring labels fit
      let s = 1;
      for (let j = 1; j < idx.length; j++) {
        const a = idx[j - 1], b = idx[j];
        if ((a === 0 && !regular(a, e)) || (b === last && !regular(b, e))) continue;
        // widths plus the dark outline round each number (0.28 of the size)
        s = Math.min(s, ((b - a) * pps - 4) / ((wid(a) + wid(b)) / 2 + base * 0.16));
      }
      if (base * s >= MIN || f === tries[tries.length - 1]) { pick = { f, idx, fs: clamp(base * s, MIN, base) }; break; }
    }
    const fs = pick.fs, k = fs / base;
    const margin = marginFor(k);
    const pps = (W - margin * 2) / last;
    const xOf = (i) => margin + i * pps;
    const ends = [0, last];
    // inner labels that would bump into an end label are left out
    const shownIdx = pick.idx.filter((i) => ends.includes(i)
      || (xOf(i) - (wid(i) * k) / 2 - 5 >= xOf(0) + (wid(0) * k) / 2 && xOf(i) + (wid(i) * k) / 2 + 5 <= xOf(last) - (wid(last) * k) / 2));
    this.notes = pick.f > 1 ? [`numbers every ${every} are too crowded to write at this size, so every ${tidy(every * pick.f)} is written`] : [];
    this.fs = fs;
    this.shownIdx = shownIdx;
    this.shown = shownIdx.map((i) => ({ i, text: text(i) }));
    this.x0 = margin; this.x1 = W - margin;
    this.pps = pps; this.ppu = pps / line.step;
  }

  xOf(v) { return this.x0 + (v - this.line.from) * this.ppu; }
  valueAt(x) { return this.line.from + (x - this.x0) / this.ppu; }

  makeStars() {
    const r = rng(4242);
    const n = Math.round(clamp((this.W * this.H) / 2300, 90, 480));
    const cols = ['#FFFFFF', '#FFF4C9', '#CFE8FF', '#FFD6F2'];
    this.stars = Array.from({ length: n }, (_, i) => {
      const d = [0.3, 0.6, 1][i % 3];
      return { x: r() * (this.W + 80), y: r() * (this.groundY + 60), d, s: (0.45 + r() * 1.0) * (0.6 + d * 0.8), ph: r() * TAU, sp: 0.8 + r() * 2.4, c: cols[Math.floor(r() * 4)], big: r() < 0.045 };
    });
  }

  build() {
    if (!this.W) return;
    this.buildSky();
    this.buildHills();
    this.buildGround();
  }

  buildSky() {
    const { W, H, planet: P, groundY: gy } = this;
    const [c, x] = layer(W, H, this.dpr);
    const g = x.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, P.sky[0]); g.addColorStop(0.6, P.sky[1]); g.addColorStop(1, P.sky[2]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const r = rng(P.seed);
    for (let i = 0; i < 7; i++) {
      const cx = r() * W, cy = r() * gy * 0.85, rad = (0.2 + r() * 0.3) * Math.max(W, H);
      const col = P.nebula[i % P.nebula.length];
      const ng = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      ng.addColorStop(0, rgba(col, 0.2)); ng.addColorStop(0.5, rgba(col, 0.08)); ng.addColorStop(1, rgba(col, 0));
      x.fillStyle = ng; x.fillRect(0, 0, W, H);
    }
    const hg = x.createLinearGradient(0, gy - H * 0.3, 0, gy);
    hg.addColorStop(0, rgba(P.nebula[2], 0)); hg.addColorStop(1, rgba(P.nebula[2], 0.28));
    x.fillStyle = hg; x.fillRect(0, gy - H * 0.3, W, H * 0.3);
    if (P.rings) {
      const cx = W * 0.42, cy = gy + H * 0.32, rx = Math.max(W, H) * 1.0, ry = H * 0.62;
      x.save(); x.translate(cx, cy); x.rotate(-0.13);
      [[1.0, 0.045, 0.5], [0.95, 0.015, 0.4], [0.915, 0.06, 0.38], [0.86, 0.02, 0.5], [0.82, 0.04, 0.3], [0.77, 0.012, 0.35]].forEach(([k, wf, a], i) => {
        x.beginPath(); x.ellipse(0, 0, rx * k, ry * k, 0, Math.PI, TAU);
        x.strokeStyle = rgba(P.rings[i % P.rings.length], a); x.lineWidth = wf * ry; x.stroke();
      });
      x.restore();
    }
    this.sky = c;
  }

  buildHills() {
    const PAD = 48;
    const { H, planet: P, groundY: gy } = this;
    const w = this.W + PAD * 2;
    const [c, x] = layer(w, H, this.dpr);
    const r = rng(P.seed * 13 + 7);
    const amp = clamp(H * 0.11, 36, 100);
    const lw = 2;
    x.lineJoin = 'round'; x.lineCap = 'round';
    const id = P.id;
    const smoothFar = id !== 'ice';
    const far = ridgePts(r, w, gy + 6, amp * (id === 'ice' ? 1.15 : 1), id === 'dust' ? 170 : id === 'ice' ? 55 : 110);
    if (id === 'dust') {
      // flat-topped mesas far away
      x.fillStyle = P.back[1];
      for (let i = 0; i < 4; i++) {
        const mx = r() * w, mw = 60 + r() * 120, mh = amp * (0.7 + r() * 0.6);
        x.beginPath(); x.moveTo(mx - mw / 2 - 20, gy + 4); x.lineTo(mx - mw / 2, gy - mh); x.lineTo(mx + mw / 2, gy - mh); x.lineTo(mx + mw / 2 + 20, gy + 4); x.closePath(); x.fill();
        x.fillStyle = rgba('#FFD2A6', 0.25); x.fillRect(mx - mw / 2, gy - mh, mw, 4); x.fillStyle = P.back[1];
      }
    }
    ridgePath(x, far, H, smoothFar);
    x.fillStyle = id === 'dust' ? mix(P.back[1], P.sky[2], 0.3) : P.back[1]; x.fill();
    if (id === 'ice') {
      // snowy tips on the far peaks
      x.save(); ridgePath(x, far, H, false); x.clip();
      x.fillStyle = rgba('#FFFFFF', 0.85);
      far.forEach(([px, py]) => { x.beginPath(); x.moveTo(px - 22, py + 22); x.lineTo(px, py - 1); x.lineTo(px + 22, py + 22); x.lineTo(px + 8, py + 15); x.lineTo(px, py + 24); x.lineTo(px - 9, py + 14); x.closePath(); x.fill(); });
      x.restore();
    }
    if (id === 'moon') {
      x.save(); ridgePath(x, far, H, true); x.clip();
      for (let i = 0; i < 9; i++) { const cx = r() * w; crater(x, cx, ridgeY(far, cx, true) + 10 + r() * amp * 0.4, 8 + r() * 14, 3 + r() * 4, mix(P.back[1], '#000000', 0.12), mix(P.back[1], '#FFFFFF', 0.15)); }
      x.restore();
    }
    const near = ridgePts(r, w, gy + 6, amp * 0.5, id === 'dust' ? 210 : 85);
    ridgePath(x, near, H, true);
    x.fillStyle = id === 'candy' ? P.back[1] : P.back[0]; x.fill();
    x.strokeStyle = rgba(P.rim, 0.35); x.lineWidth = 2.5;
    ridgePath(x, near, gy + 400, true); x.stroke();
    // decorations standing on the near hills
    const spots = [];
    for (let px = 20 + r() * 60; px < w - 10; px += 55 + r() * 110) spots.push(px);
    if (id === 'moon') {
      x.save(); ridgePath(x, near, H, true); x.clip();
      spots.forEach((px) => crater(x, px, ridgeY(near, px, true) + 8 + r() * 10, 10 + r() * 16, 3 + r() * 4, mix(P.back[0], '#000000', 0.1), mix(P.back[0], '#FFFFFF', 0.2)));
      x.restore();
      for (let i = 0; i < 6; i++) { const px = r() * w; const py = ridgeY(near, px, true) + 3; x.fillStyle = P.ground[1]; x.strokeStyle = rgba(INK, 0.55); x.lineWidth = 1.5; x.beginPath(); x.ellipse(px, py, 6 + r() * 6, 4 + r() * 3, 0, Math.PI, TAU); x.closePath(); x.fill(); x.stroke(); }
    } else if (id === 'dust') {
      x.strokeStyle = rgba('#FFD2A6', 0.4); x.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const px = r() * w; const py = ridgeY(near, px, true) + 14; x.beginPath(); x.moveTo(px - 40, py); x.quadraticCurveTo(px, py - 8, px + 40, py); x.stroke(); }
      spots.forEach((px, i) => { if (i % 2) return; const py = ridgeY(near, px, true) + 3, s = 8 + r() * 10; x.fillStyle = '#9E4325'; x.strokeStyle = rgba(INK, 0.6); x.lineWidth = 1.6; x.beginPath(); x.moveTo(px - s, py); x.lineTo(px - s * 0.6, py - s); x.lineTo(px + s * 0.3, py - s * 1.2); x.lineTo(px + s, py); x.closePath(); x.fill(); x.stroke(); });
    } else if (id === 'candy') {
      const pairs = [[CORAL, '#FFFFFF'], ['#FFD36E', '#FF6FA8'], ['#9BFFF0', '#8C7BFF'], ['#FFFFFF', '#FF6FA8']];
      spots.forEach((px, i) => {
        const py = ridgeY(near, px, true) + 4;
        if (i % 3 === 2) {
          const s = 10 + r() * 8; x.fillStyle = P.back[2]; x.strokeStyle = INK; x.lineWidth = 1.8;
          x.beginPath(); x.moveTo(px - s, py); x.quadraticCurveTo(px - s, py - s * 1.6, px, py - s * 1.6); x.quadraticCurveTo(px + s, py - s * 1.6, px + s, py); x.closePath(); x.fill(); x.stroke();
          x.fillStyle = rgba('#FFFFFF', 0.85); for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(px + (r() - 0.5) * s, py - s * (0.4 + r()), 1.3, 0, TAU); x.fill(); }
        } else {
          const [c1, c2] = pairs[i % pairs.length];
          lolly(x, px, py, amp * (0.45 + r() * 0.35), c1, c2, 3);
        }
      });
    } else if (id === 'ice') {
      spots.forEach((px) => {
        const py = ridgeY(near, px, true) + 6;
        const n = 2 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const hh = amp * (0.3 + r() * 0.55), ww = 9 + r() * 9;
          crystal(x, px + (k - n / 2) * ww * 0.7, py, hh, ww, (k - (n - 1) / 2) * 0.28 + (r() - 0.5) * 0.15, k % 2 ? '#BDEFFF' : '#8ADCF7', k % 2 ? '#7CC6EE' : '#5FB3E3');
        }
      });
    } else if (id === 'jungle') {
      spots.forEach((px) => { const py = ridgeY(near, px, true) + 5; oddPlant(x, px, py, amp * (0.5 + r() * 0.5), Math.floor(r() * 3), r, lw + 1.5); });
    } else {
      spots.forEach((px, i) => {
        const py = ridgeY(near, px, true) + 5;
        if (i % 2) spire(x, px, py, amp * (0.5 + r() * 0.7), 12 + r() * 8, '#D8B8FF', i % 4 === 1 ? '#FFB3D9' : '#FFDDB0');
        else { x.fillStyle = '#9C6BE3'; x.strokeStyle = rgba(INK, 0.6); x.lineWidth = 1.6; const s = 7 + r() * 8; x.beginPath(); x.arc(px, py, s, Math.PI, TAU); x.closePath(); x.fill(); x.stroke(); x.strokeStyle = rgba('#FFD9A8', 0.8); x.lineWidth = 2; x.beginPath(); x.ellipse(px, py - s * 0.4, s * 1.5, s * 0.35, -0.2, 0, TAU); x.stroke(); }
      });
    }
    this.hills = c; this.hillsPad = PAD;
  }

  buildGround() {
    const { W, H, planet: P, groundY: gy } = this;
    const [c, x] = layer(W, H, this.dpr);
    const r = rng(P.seed * 31 + 3);
    x.lineJoin = 'round'; x.lineCap = 'round';
    const g = x.createLinearGradient(0, gy, 0, H);
    g.addColorStop(0, P.ground[0]); g.addColorStop(0.55, P.ground[1]); g.addColorStop(1, P.ground[2]);
    x.fillStyle = g; x.fillRect(0, gy, W, H - gy);
    const below = gy + 20 + this.fs * 1.1; // texture stays clear of the numbers
    x.save(); x.beginPath(); x.rect(0, gy, W, H - gy); x.clip();
    if (P.id === 'moon') {
      for (let i = 0; i < Math.round(W / 45); i++) {
        const cx = r() * W, cy = below + r() * Math.max(10, H - below), s = 6 + r() * 22;
        crater(x, cx, cy, s, s * 0.35, mix(P.ground[1], '#000000', 0.12), mix(P.ground[0], '#FFFFFF', 0.4));
      }
    } else if (P.id === 'dust') {
      for (let k = 0; k < 5; k++) {
        const y = gy + (k + 0.6) * (H - gy) / 5;
        x.strokeStyle = rgba(k % 2 ? '#7A2E1A' : '#FFD2A6', 0.22); x.lineWidth = 6;
        x.beginPath(); for (let px = -10; px <= W + 10; px += 12) x.lineTo(px, y + Math.sin(px / 60 + k * 1.7) * 6); x.stroke();
      }
    } else if (P.id === 'candy') {
      x.fillStyle = P.ground[1];
      const sw = 26;
      for (let px = -H; px < W + H; px += sw * 2) { x.beginPath(); x.moveTo(px, gy); x.lineTo(px + sw, gy); x.lineTo(px + sw + (H - gy), H); x.lineTo(px + (H - gy), H); x.closePath(); x.fill(); }
      x.fillStyle = rgba('#FFFFFF', 0.25); x.fillRect(0, gy, W, 8);
    } else if (P.id === 'ice') {
      x.strokeStyle = rgba('#FFFFFF', 0.8); x.lineWidth = 2;
      for (let i = 0; i < Math.round(W / 70); i++) {
        let px = r() * W, py = below + r() * Math.max(10, H - below - 10);
        x.beginPath(); x.moveTo(px, py);
        for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 40; py += r() * 14; x.lineTo(px, py); }
        x.stroke();
      }
      x.fillStyle = '#FFFFFF';
      for (let i = 0; i < Math.round(W / 30); i++) sparkle(x, r() * W, below + r() * (H - below), 2 + r() * 3);
    } else if (P.id === 'jungle') {
      x.fillStyle = rgba('#1E5531', 0.35);
      for (let i = 0; i < Math.round(W / 14); i++) { x.beginPath(); x.ellipse(r() * W, below + r() * (H - below), 3 + r() * 6, 2 + r() * 3, 0, 0, TAU); x.fill(); }
    } else {
      for (let i = 0; i < Math.round(W / 22); i++) { x.fillStyle = rgba(i % 2 ? '#E8D6FF' : '#3E1F7A', 0.4); x.beginPath(); x.arc(r() * W, below + r() * (H - below), 1.5 + r() * 3, 0, TAU); x.fill(); }
      x.strokeStyle = rgba('#FFD9A8', 0.45); x.lineWidth = 2;
      for (let i = 0; i < Math.round(W / 140); i++) { const px = r() * W, py = below + 8 + r() * Math.max(4, H - below - 16); x.beginPath(); x.ellipse(px, py, 12, 3.5, -0.15, 0, TAU); x.stroke(); }
    }
    const shade = x.createLinearGradient(0, gy, 0, H);
    shade.addColorStop(0, rgba('#000000', 0)); shade.addColorStop(1, rgba('#0A0530', 0.28));
    x.fillStyle = shade; x.fillRect(0, gy, W, H - gy);
    x.restore();
    if (P.id === 'jungle') {
      for (let px = 0; px < W; px += 7 + r() * 8) {
        const hh = 5 + r() * 9; x.strokeStyle = r() < 0.5 ? '#2F7F40' : '#9BE36D'; x.lineWidth = 2.2;
        x.beginPath(); x.moveTo(px, gy + 2); x.quadraticCurveTo(px + 2, gy - hh * 0.5, px + (r() - 0.5) * 6, gy - hh); x.stroke();
      }
    }
    x.fillStyle = rgba(P.rim, 0.85); x.fillRect(0, gy - 1, W, 3);
    x.fillStyle = rgba(INK, 0.35); x.fillRect(0, gy - 3, W, 2);
    if (this.line) this.drawStrip(x);
    this.ground = c;
  }

  drawStrip(x) {
    const { x0, x1, groundY: gy, line, planet: P, pps } = this;
    const pad = 18;
    rr(x, x0 - pad, gy - 5, x1 - x0 + pad * 2, 16, 8);
    x.fillStyle = P.strip; x.fill(); x.lineWidth = 2.5; x.strokeStyle = INK; x.stroke();
    x.save();
    x.shadowColor = P.glow; x.shadowBlur = 10; x.strokeStyle = P.glow; x.lineWidth = 3;
    x.beginPath(); x.moveTo(x0, gy + 3); x.lineTo(x1, gy + 3); x.stroke();
    x.restore();
    const labelled = new Set(this.shownIdx);
    let every = 1;
    while (pps * every < 2.4) every += 1;
    const thin = pps < 7;
    for (let i = 0; i <= line.gaps; i++) {
      const px = x0 + i * pps;
      if (labelled.has(i)) {
        rr(x, px - 2.5, gy - 15, 5, 30, 2.5); x.fillStyle = INK; x.fill();
        rr(x, px - 1.5, gy - 14, 3, 28, 1.5); x.fillStyle = P.glow; x.fill();
      } else if (i % every === 0) {
        x.fillStyle = rgba(P.glow, thin ? 0.75 : 0.95);
        const tw = thin ? 1.2 : 2.4;
        x.fillRect(px - tw / 2, gy - (thin ? 5 : 8), tw, thin ? 15 : 19);
      }
    }
    // end lamps
    [x0 - pad + 2, x1 + pad - 2].forEach((px) => { x.fillStyle = INK; x.beginPath(); x.arc(px, gy + 3, 6, 0, TAU); x.fill(); });
    // numbers
    const fs = this.fs, ly = gy + 17 + fs * 0.92;
    x.font = `600 ${fs}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
    this.shown.forEach(({ i, text }) => {
      const px = x0 + i * pps;
      x.lineWidth = Math.max(3, fs * 0.28); x.strokeStyle = INK; x.strokeText(text, px, ly);
      x.fillStyle = '#FFFFFF'; x.fillText(text, px, ly);
    });
    this.labelY = ly;
  }

  // ---------- per-frame bits ----------

  emit(p) { if (this.particles.length < 600) this.particles.push(p); }

  exhaust(x, y, h, power, dt) {
    if (power < 0.05) return;
    const calmK = this.calm ? 0.4 : 1;
    this.acc.spark += dt * 70 * power * calmK;
    this.acc.smoke += dt * 9 * power * calmK;
    while (this.acc.spark >= 1) {
      this.acc.spark -= 1;
      const life = 0.25 + Math.random() * 0.35;
      this.emit({ kind: 'spark', x: x + (Math.random() - 0.5) * h * 0.12, y: y + h * 0.45, vx: (Math.random() - 0.5) * 70, vy: 120 + Math.random() * 160 * power, g: 0, drag: 2, life, max: life, size: 1.5 + Math.random() * h * 0.035, grow: 0, col: Math.random() < 0.5 ? '#FFE066' : '#FF9F3A' });
    }
    while (this.acc.smoke >= 1) {
      this.acc.smoke -= 1;
      const life = 0.9 + Math.random() * 0.8;
      this.emit({ kind: 'smoke', x: x + (Math.random() - 0.5) * h * 0.1, y: y + h * (0.55 + power * 0.2), vx: (Math.random() - 0.5) * 30, vy: 30 + Math.random() * 30, g: -20, drag: 1.5, life, max: life, size: h * (0.06 + Math.random() * 0.05), grow: h * 0.16, col: mix('#F4F1FF', this.planet.nebula[0], 0.15), a: 0.5 });
    }
  }

  dust(x, y, n, spread, col) {
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1, life = 0.6 + Math.random() * 0.6;
      this.emit({ kind: 'smoke', front: true, x: x + s * Math.random() * spread * 0.3, y: y - 3, vx: s * (60 + Math.random() * 160), vy: -20 - Math.random() * 60, g: 60, drag: 2.6, life, max: life, size: 5 + Math.random() * 8, grow: 22, col, a: 0.85 });
    }
  }

  burst(x, y, n, cols = ['#FFE066', '#FFFFFF', '#8CF5FF', '#FF8FB1']) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + Math.random() * 0.4, sp = 90 + Math.random() * 160, life = 0.6 + Math.random() * 0.5;
      this.emit({ kind: 'star', front: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 160, drag: 2.2, life, max: life, size: 5 + Math.random() * 6, grow: 0, col: cols[i % cols.length], rot: Math.random() * 3, vr: (Math.random() - 0.5) * 8 });
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      const d = Math.max(0, 1 - p.drag * dt);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.size += p.grow * dt;
      if (p.vr) p.rot += p.vr * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  drawParticles(ctx, front) {
    for (const p of this.particles) {
      if (!!p.front !== front) continue;
      const k = clamp(p.life / p.max, 0, 1);
      if (p.kind === 'spark') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = k; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      } else if (p.kind === 'smoke') {
        ctx.globalAlpha = (p.a || 0.5) * k * k; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      } else {
        ctx.globalAlpha = Math.min(1, k * 1.6); ctx.fillStyle = p.col;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); sparkle(ctx, 0, 0, p.size); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  updateShooting(dt) {
    if (this.calm) { this.shooting = []; return; }
    this.nextShoot -= dt;
    if (this.nextShoot <= 0) {
      this.nextShoot = 4 + Math.random() * 7;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const sp = Math.max(500, this.W * 0.9);
      this.shooting.push({ x: this.W * (dir > 0 ? 0.05 + Math.random() * 0.5 : 0.45 + Math.random() * 0.5), y: this.groundY * (0.05 + Math.random() * 0.35), vx: dir * sp * 0.85, vy: sp * 0.42, life: 0.75, max: 0.75 });
    }
    this.shooting.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
    this.shooting = this.shooting.filter((s) => s.life > 0);
  }

  drawShooting(ctx) {
    for (const s of this.shooting) {
      const k = Math.sin((s.life / s.max) * Math.PI);
      const len = 110, n = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / n) * len, ty = s.y - (s.vy / n) * len;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, rgba('#FFFFFF', 0.95 * k)); g.addColorStop(1, rgba('#FFFFFF', 0));
      ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = rgba('#FFFFFF', k); ctx.beginPath(); ctx.arc(s.x, s.y, 2.6, 0, TAU); ctx.fill();
    }
  }

  drawStars(ctx, t) {
    const SW = this.W + 80, SH = this.groundY + 60;
    for (const s of this.stars) {
      let x = (s.x - this.offX * s.d * 0.05) % SW; if (x < 0) x += SW; x -= 40;
      let y = (s.y - this.scroll * s.d) % SH; if (y < 0) y += SH; y -= 30;
      const tw = this.calm ? 0.85 : 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
      ctx.globalAlpha = 0.25 + 0.75 * tw; ctx.fillStyle = s.c;
      if (s.big) sparkle(ctx, x, y, s.s * (3 + tw * 1.5));
      else { ctx.beginPath(); ctx.arc(x, y, s.s, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  drawFar(ctx, t) {
    const base = Math.sqrt(this.W * this.H);
    const tall = this.H > this.W * 1.2;
    for (const f of this.planet.far) {
      const r = f.r * base * (tall ? 0.95 : 1.1);
      const x = f.x * this.W - this.offX * f.par;
      // on tall phones the heads-up takes the top, so planets sit a little lower
      const fy = tall ? lerp(this.topPad + r, this.groundY * 0.75, f.y * 1.6) : Math.max(r * 0.6, f.y * this.groundY);
      const y = fy + (this.calm ? 0 : Math.sin(t * 0.25 + f.x * 9) * 2.5);
      farPlanet(ctx, x, y, r, f);
    }
  }

  drawLights(ctx, t) {
    const { x0, x1, groundY: gy, planet: P } = this;
    const n = Math.max(2, Math.round((x1 - x0) / 38));
    for (let i = 0; i <= n; i++) {
      const px = lerp(x0, x1, (i + 0.5) / (n + 1));
      const on = this.calm ? 0.7 : Math.max(0, Math.sin(t * 3 - i * 0.55)) ** 3;
      const g = ctx.createRadialGradient(px, gy + 9, 0, px, gy + 9, 9);
      g.addColorStop(0, rgba(P.lights, 0.75 * on)); g.addColorStop(1, rgba(P.lights, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, gy + 9, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = on > 0.3 ? P.lights : mix(P.lights, P.strip, 0.6);
      ctx.beginPath(); ctx.arc(px, gy + 9, 1.9, 0, TAU); ctx.fill();
    }
    [x0 - 16, x1 + 16].forEach((px, i) => {
      const on = this.calm ? 1 : 0.5 + 0.5 * Math.sin(t * 4 + i * Math.PI);
      ctx.fillStyle = rgba(i ? '#FF8FB1' : '#7DFFB5', 0.5 + 0.5 * on);
      ctx.beginPath(); ctx.arc(px, gy + 3, 3.6, 0, TAU); ctx.fill();
    });
  }

  // The rocket's shadow, and on long lines the faint band of how near counts.
  drawShadow(ctx, S) {
    const gy = this.groundY;
    if (S.half > 0) {
      const a = 0.33 * S.a;
      const g = ctx.createLinearGradient(S.x - S.half, 0, S.x + S.half, 0);
      g.addColorStop(0, rgba(this.planet.glow, 0)); g.addColorStop(0.18, rgba(this.planet.glow, a)); g.addColorStop(0.82, rgba(this.planet.glow, a)); g.addColorStop(1, rgba(this.planet.glow, 0));
      ctx.fillStyle = g; ctx.fillRect(S.x - S.half, gy - 6, S.half * 2, 18);
      if (S.fromY < gy - 10) {
        const cg = ctx.createLinearGradient(0, S.fromY, 0, gy);
        cg.addColorStop(0, rgba(this.planet.glow, 0)); cg.addColorStop(1, rgba(this.planet.glow, 0.1 * S.a));
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.moveTo(S.x - 6, S.fromY); ctx.lineTo(S.x + 6, S.fromY); ctx.lineTo(S.x + S.half, gy - 5); ctx.lineTo(S.x - S.half, gy - 5); ctx.closePath(); ctx.fill();
      }
    }
    ctx.fillStyle = rgba(INK, 0.12 + 0.3 * S.k);
    ctx.beginPath(); ctx.ellipse(S.x, gy - 1, this.rocketH * (0.2 + 0.25 * S.k), 3 + 3 * S.k, 0, 0, TAU); ctx.fill();
    // the mark the rocket would land on now, lit softly
    if (S.snap != null && this.pps >= 8) {
      const px = this.xOf(S.snap);
      ctx.fillStyle = rgba('#FFFFFF', (0.35 + 0.5 * S.k) * S.a);
      rr(ctx, px - 2.5, gy - 14, 5, 28, 2.5); ctx.fill();
    }
  }

  // The right number lit up after a wrong landing (it may not have a label of its own).
  drawHighlight(ctx, Hl, t) {
    const px = this.xOf(Hl.value), gy = this.groundY, a = Hl.a;
    const pulse = this.calm ? 1 : 0.85 + 0.15 * Math.sin(t * 6);
    const w = Math.max(18, this.rocketH * 0.35);
    const g = ctx.createLinearGradient(0, gy, 0, gy - this.H * 0.45);
    g.addColorStop(0, rgba(SUN, 0.55 * a * pulse)); g.addColorStop(1, rgba(SUN, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(px - w * 0.3, gy); ctx.lineTo(px - w, gy - this.H * 0.45); ctx.lineTo(px + w, gy - this.H * 0.45); ctx.lineTo(px + w * 0.3, gy); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = a;
    rr(ctx, px - 3.5, gy - 18, 7, 36, 3.5); ctx.fillStyle = INK; ctx.fill();
    rr(ctx, px - 2, gy - 16.5, 4, 33, 2); ctx.fillStyle = SUN; ctx.fill();
    const fs = Math.round(this.fs * 1.2);
    ctx.font = `600 ${fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const text = fmt(Hl.value, this.showAs), tw = ctx.measureText(text).width;
    const cy = gy + 17 + this.fs * 0.55;
    const bx = clamp(px, tw / 2 + 12, this.W - tw / 2 - 12);
    rr(ctx, bx - tw / 2 - 9, cy - fs * 0.68, tw + 18, fs * 1.36, fs * 0.5);
    ctx.fillStyle = SUN; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; ctx.fillText(text, bx, cy + fs * 0.04);
    ctx.globalAlpha = 1;
  }

  // A soft mint glow on the mark the rocket landed on (a right landing).
  drawGlow(ctx, G, t) {
    const px = this.xOf(G.value), gy = this.groundY;
    const pulse = this.calm ? 1 : 0.8 + 0.2 * Math.sin(t * 7);
    const r = Math.max(26, this.rocketH * 0.55);
    const g = ctx.createRadialGradient(px, gy + 3, 0, px, gy + 3, r);
    g.addColorStop(0, rgba(MINT, 0.75 * G.a * pulse)); g.addColorStop(1, rgba(MINT, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, gy + 3, r * 1.4, r * 0.55, 0, 0, TAU); ctx.fill();
  }

  // A bouncing arrow over the right number. If the rocket is sitting close by, the
  // arrow rides higher so it doesn't cover the rocket.
  arrowSize() { return clamp(this.rocketH * 0.5, 30, 54); }
  arrowCrowded(rocketX, x) { return Math.abs(rocketX - x) < this.rocketH * 0.5 + this.arrowSize() * 0.6; }
  // the highest point the arrow reaches (for keeping the speech bubble above it)
  arrowTop(crowded) { const s = this.arrowSize(); return this.groundY - 22 - s * 1.35 - s * 0.35 - (crowded ? this.rocketH : 0); }

  drawArrow(ctx, A, t) {
    const s = this.arrowSize();
    const bob = this.calm ? 0 : Math.abs(Math.sin(t * 4.5)) * s * 0.35;
    const lift = A.rocketX != null && this.arrowCrowded(A.rocketX, A.x) ? this.rocketH * 1.0 : 0;
    A.lift = lerp(A.lift || 0, lift, 0.15);
    const tipY = this.groundY - 22 - bob - A.lift;
    const k = ease.back(clamp(A.a, 0, 1));
    ctx.save();
    ctx.translate(A.x, tipY); ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-s * 0.55, -s * 0.6); ctx.lineTo(-s * 0.22, -s * 0.6); ctx.lineTo(-s * 0.22, -s * 1.35);
    ctx.lineTo(s * 0.22, -s * 1.35); ctx.lineTo(s * 0.22, -s * 0.6); ctx.lineTo(s * 0.55, -s * 0.6); ctx.closePath();
    ctx.fillStyle = SUN; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = rgba('#FFFFFF', 0.6); ctx.fillRect(-s * 0.12, -s * 1.25, s * 0.08, s * 0.55);
    ctx.restore();
  }

  drawPerfect(ctx, Pf) {
    const k = clamp(Pf.t / 0.35, 0, 1);
    const fade = clamp((2.4 - Pf.t) / 0.4, 0, 1);
    if (fade <= 0) return;
    const fs = clamp(this.rocketH * 0.42, 26, 46);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(clamp(Pf.x, fs * 2.4, this.W - fs * 2.4), Pf.y - Pf.t * 18);
    ctx.rotate(-0.08 + (this.calm ? 0 : Math.sin(Pf.t * 9) * 0.04));
    ctx.scale(ease.back(k), ease.back(k));
    ctx.font = `700 ${fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = fs * 0.3; ctx.strokeStyle = INK; ctx.strokeText('Perfect!', 0, 0);
    const g = ctx.createLinearGradient(0, -fs * 0.5, 0, fs * 0.5);
    g.addColorStop(0, '#FFF3A6'); g.addColorStop(1, '#FFB020');
    ctx.fillStyle = g; ctx.fillText('Perfect!', 0, 0);
    ctx.restore();
  }

  draw(v, t, dt) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.updateShooting(dt);
    this.updateParticles(dt);
    ctx.drawImage(this.sky, 0, 0, this.W, this.H);
    this.drawStars(ctx, t);
    this.drawShooting(ctx);
    this.drawFar(ctx, t);
    ctx.drawImage(this.hills, -this.hillsPad - this.offX * 0.03, 0, this.W + this.hillsPad * 2, this.H);
    ctx.drawImage(this.ground, 0, 0, this.W, this.H);
    if (!this.line) return;
    if (v.highlight) this.drawHighlight(ctx, v.highlight, t);
    if (v.glow) this.drawGlow(ctx, v.glow, t);
    this.drawLights(ctx, t);
    if (v.shadow) this.drawShadow(ctx, v.shadow);
    this.drawParticles(ctx, false);
    if (v.flag) drawFlag(ctx, { ...v.flag, y: this.groundY - 2, h: this.rocketH * 0.95 }, t, FONT);
    if (v.rocket) drawRocket(ctx, v.rocket, t);
    if (v.pilot) drawPilot(ctx, v.pilot, t);
    this.drawParticles(ctx, true);
    if (v.arrow) this.drawArrow(ctx, v.arrow, t);
    if (v.perfect) this.drawPerfect(ctx, v.perfect);
  }
}

// Confetti and moon rocks flying to the counter, drawn above everything.
export class Fx {
  constructor(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.bits = []; this.rocks = []; this.dirty = false;
  }

  resize(W, H, dpr) {
    this.W = W; this.H = H; this.dpr = dpr;
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    this.c.style.width = W + 'px'; this.c.style.height = H + 'px';
  }

  confetti(n, calm) {
    const cols = ['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF', '#FF8FB1', '#FFFFFF'];
    for (let i = 0; i < (calm ? Math.round(n / 3) : n); i++) {
      const life = 2.2 + Math.random() * 1.6;
      this.bits.push({ x: Math.random() * this.W, y: -20 - Math.random() * this.H * 0.4, vx: (Math.random() - 0.5) * 80, vy: 120 + Math.random() * 160, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, w: 7 + Math.random() * 7, h: 4 + Math.random() * 5, col: cols[i % cols.length], life, max: life, sway: Math.random() * 6 });
    }
  }

  rock(x0, y0, x1, y1, onArrive) {
    this.rocks.push({ x0, y0, x1, y1, t: 0, dur: 0.9, onArrive });
  }

  get busy() { return this.bits.length > 0 || this.rocks.length > 0; }

  draw(dt, t) {
    const ctx = this.ctx;
    if (!this.busy) { if (this.dirty) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.c.width, this.c.height); this.dirty = false; } return; }
    this.dirty = true;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.c.width, this.c.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    for (const b of this.bits) {
      b.life -= dt; b.x += (b.vx + Math.sin(t * 3 + b.sway) * 40) * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      ctx.globalAlpha = clamp(b.life / 0.6, 0, 1);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.scale(1, Math.cos(t * 6 + b.sway));
      ctx.fillStyle = b.col; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    this.bits = this.bits.filter((b) => b.life > 0 && b.y < this.H + 30);
    for (const r of this.rocks) {
      r.t += dt;
      const k = ease.inOut(clamp(r.t / r.dur, 0, 1));
      const x = lerp(r.x0, r.x1, k), y = lerp(r.y0, r.y1, k) - Math.sin(k * Math.PI) * 90;
      drawRock(ctx, x, y, lerp(22, 14, k), r.t * 6);
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.6 - i * 0.2; sparkle(ctx, x - (r.x1 - r.x0) * 0.04 * (i + 1), y + 10 * (i + 1), 5 - i); }
      ctx.globalAlpha = 1;
      if (r.t >= r.dur && !r.done) { r.done = true; if (r.onArrive) r.onArrive(); }
    }
    this.rocks = this.rocks.filter((r) => !r.done);
  }
}
