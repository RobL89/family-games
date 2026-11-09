// The step 2a-4a mock-up page (D-045 to D-047): a gallery of the hangar's ships, and the two
// hangar layouts to try, A (the hall) and B (the showroom). Version 1.0. A mock-up, not the
// game: bundled by tools/tests/games/sketch_rocket_ships.py with the ships in
// sketch_rocket_ships.js and the game's own scene code from games/_common/rocket/. Rocks,
// ships and choices here are pretend, kept in memory only, and lost on a reload.

import { SHIPS, SHIP_BY_ID, TIERS, Parts, newState, tickShip, landShip, drawShip, drawTrail, glow, star5 } from './ships.js';
import { Scene, drawPilot, drawLadder, drawFirework, drawRock, drawPlanetBall, ladderEnds, rr, rgba, mix, clamp, lerp, ease, sparkle, rng, INK, FONT } from '../_common/rocket/scene.js';
import { makeLine } from '../_common/rocket/numbers.js';
import { play, speak, setMuted, canSpeak } from '../_common/rocket/sound.js';

const TAU = Math.PI * 2;
const SUN = '#FFC93C';
const MINT = '#5FE3BD';
const CORAL = '#FF5D73';
const SKY = '#8CF5FF';
const FELT = ['#3D6CF0', '#FF5D73', '#2FB892', '#9B5DE5', '#FFB020'];
const DEVICES = { sideways: { w: 844, h: 390, label: 'Phone sideways' }, upright: { w: 390, h: 844, label: 'Phone upright' }, pc: { w: 1280, h: 800, label: 'PC' } };
const FIN = { ladder: 0.5, out: 0.95, down: 1.75, walk: 2.05, flag: 2.0, stars: 2.55, bang: 3.1, end: 4.5 }; // as round.js 1.1
const BURST_AT = [{ x: 0.2, y: 0.24, r: 0.2, n: 18, turn: 0.1 }, { x: 0.8, y: 0.28, r: 0.22, n: 18, turn: 0 }, { x: 0.5, y: 0.16, r: 0.16, n: 16, turn: 0.3 }, { x: 0.33, y: 0.1, r: 0.15, n: 16, turn: 0.2 }, { x: 0.68, y: 0.12, r: 0.17, n: 16, turn: 0.5 }];

// ---------- pretend progress, shared by both hangars ----------

const wallet = { rocks: 75, owned: new Set(['classic']), picked: 'classic' };
const listeners = [];
const notify = () => listeners.forEach((f) => f());
const calm = { on: false };
const allParts = [];
function parts() { const p = new Parts(); p.k = calm.on ? 0.35 : 1; allParts.push(p); return p; }

// ---------- sounds: the game's own, plus a few made here for the mock-ups ----------

let AC = null;
let muted = false;
let noiseBuf = null;
function ac() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    return AC;
  } catch { return null; }
}
function tone(c, f, t0, len, type = 'sine', vol = 0.12, slide = null) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + len);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + len + 0.03);
}
function noise(c, t0, len, { from = 1200, to = 300, type = 'bandpass', vol = 0.2, q = 0.8 } = {}) {
  if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noiseBuf; f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(from, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + len);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  s.connect(f).connect(g).connect(c.destination); s.start(t0); s.stop(t0 + len + 0.03);
}
const SYN = {
  rumble: (c, t) => { noise(c, t, 1.1, { from: 160, to: 70, type: 'lowpass', vol: 0.4 }); tone(c, 52, t, 1.1, 'sawtooth', 0.04, 46); for (let i = 0; i < 6; i++) noise(c, t + i * 0.17, 0.06, { from: 900, to: 500, vol: 0.06 }); },
  clunk: (c, t) => { tone(c, 170, t, 0.12, 'square', 0.06, 90); noise(c, t, 0.08, { from: 1800, to: 600, vol: 0.18 }); },
  crack: (c, t) => { noise(c, t, 0.14, { from: 5000, to: 2500, type: 'highpass', vol: 0.22 }); tone(c, 2400, t, 0.05, 'square', 0.03); },
  shatter: (c, t) => { for (let i = 0; i < 8; i++) tone(c, 1800 + Math.random() * 2800, t + i * 0.028, 0.18, 'triangle', 0.045); noise(c, t, 0.4, { from: 7000, to: 3000, type: 'highpass', vol: 0.16 }); },
  boing: (c, t) => { tone(c, 200, t, 0.4, 'sine', 0.18, 560); tone(c, 400, t + 0.05, 0.25, 'triangle', 0.05, 900); },
  toot: (c, t) => { tone(c, 523, t, 0.38, 'square', 0.05); tone(c, 784, t, 0.38, 'triangle', 0.05); noise(c, t, 0.6, { from: 3000, to: 1400, vol: 0.12 }); },
  clunkLock: (c, t) => { SYN.clunk(c, t); tone(c, 988, t + 0.1, 0.3, 'sine', 0.08); tone(c, 1319, t + 0.18, 0.35, 'sine', 0.06); },
  hum: (c, t) => { tone(c, 110, t, 0.7, 'sawtooth', 0.035, 170); tone(c, 880, t + 0.15, 0.35, 'sine', 0.05, 660); tone(c, 660, t + 0.35, 0.4, 'sine', 0.04, 990); },
  chime: (c, t) => [1568, 2093, 2637, 3136, 2637].forEach((f, i) => tone(c, f, t + i * 0.07, 0.7, 'sine', 0.05)),
  harp: (c, t) => [523, 659, 784, 988, 1175, 1319, 1568, 2093].forEach((f, i) => tone(c, f, t + i * 0.045, 0.6, 'triangle', 0.05)),
  aurora: (c, t) => { [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(c, f, t + i * 0.06, 1.0, 'sine', 0.045)); tone(c, 262, t, 1.5, 'triangle', 0.06); tone(c, 392, t + 0.2, 1.3, 'triangle', 0.04); },
  fanLegend: (c, t) => { [392, 523, 659, 784].forEach((f, i) => tone(c, f, t + i * 0.12, 0.3, 'square', 0.04)); [1047, 1319, 1568].forEach((f) => tone(c, f, t + 0.5, 1.1, 'triangle', 0.05)); SYN.aurora(c, t + 0.6); },
};
const TOUCH = { classic: 'thud', box: 'boing', teapot: 'toot', pod: 'clunkLock', saucer: 'hum', crystal: 'chime', phoenix: 'harp', aurora: 'aurora' };
const FANFARE = { fun: 'yay', cool: 'levelup', premium: 'unlock', legendary: 'fanLegend' };
function sfx(name) {
  if (muted) return;
  if (SYN[name]) { const c = ac(); if (c) { try { SYN[name](c, c.currentTime + 0.01); } catch { /* no sound */ } } } else play(name);
}
function say(text) { if (!muted && canSpeak()) speak(text); }

// ---------- drawing helpers for the hangars ----------

function text(ctx, s, x, y, size, { fill = '#FFFFFF', stroke = INK, weight = 600, align = 'center', base = 'middle', lw } = {}) {
  ctx.font = `${weight} ${Math.round(size)}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = base;
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = lw ?? size * 0.22; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
const textW = (ctx, s, size, weight = 600) => { ctx.font = `${weight} ${Math.round(size)}px ${FONT}`; return ctx.measureText(s).width; };
function grad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
const hsl = (h, s, l, a = 1) => `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

function button(ctx, x, y, w, h, fill, { down = false, dim = false } = {}) {
  const r = h / 2, dy = down ? 3 : 0;
  rr(ctx, x - w / 2, y - h / 2 + 4, w, h, r); ctx.fillStyle = 'rgba(10,6,40,.55)'; ctx.fill();
  rr(ctx, x - w / 2, y - h / 2 + dy, w, h, r); ctx.fillStyle = dim ? mix(fill, '#6B6890', 0.55) : fill; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x - w / 2, y - h / 2 + dy, w, h * 0.38); ctx.restore();
  rr(ctx, x - w / 2, y - h / 2 + dy, w, h, r); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
}

function circleBtn(ctx, x, y, r, icon) {
  ctx.beginPath(); ctx.arc(x, y + 3, r, 0, TAU); ctx.fillStyle = 'rgba(10,6,40,.5)'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (icon === 'back') { ctx.moveTo(r * 0.35, 0); ctx.lineTo(-r * 0.35, 0); ctx.moveTo(-r * 0.05, -r * 0.32); ctx.lineTo(-r * 0.37, 0); ctx.lineTo(-r * 0.05, r * 0.32); }
  if (icon === 'left') { ctx.moveTo(r * 0.12, -r * 0.38); ctx.lineTo(-r * 0.22, 0); ctx.lineTo(r * 0.12, r * 0.38); }
  if (icon === 'right') { ctx.moveTo(-r * 0.12, -r * 0.38); ctx.lineTo(r * 0.22, 0); ctx.lineTo(-r * 0.12, r * 0.38); }
  ctx.stroke(); ctx.restore();
}

function padlock(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * 0.26, 0); ctx.lineTo(-s * 0.26, -s * 0.2); ctx.arc(0, -s * 0.2, s * 0.26, Math.PI, 0); ctx.lineTo(s * 0.26, 0);
  ctx.lineWidth = s * 0.17; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = s * 0.08; ctx.strokeStyle = '#E3E7F5'; ctx.stroke();
  rr(ctx, -s * 0.4, -s * 0.06, s * 0.8, s * 0.62, s * 0.13); ctx.fillStyle = SUN; ctx.fill(); ctx.lineWidth = s * 0.1; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, s * 0.18, s * 0.08, 0, TAU); ctx.fill(); ctx.fillRect(-s * 0.035, s * 0.18, s * 0.07, s * 0.17);
  ctx.restore();
}

function tickBadge(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.2); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x - r * 0.1, y + r * 0.35); ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.lineWidth = r * 0.28; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}

function tierChip(ctx, tier, x, y, size) {
  const T = TIERS[tier], label = T.name, w = textW(ctx, label, size) + size * 1.1, h = size * 1.45;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = T.rainbow ? grad(ctx, x - w / 2, 0, x + w / 2, 0, ['#FF8FB1', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF']) : T.col; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, label, x, y + 1, size, { fill: INK, stroke: null });
  return w;
}

function pricePlate(ctx, x, y, price, rocks, u, flash = 0) {
  const w = 118 * u, h = 40 * u, k = clamp(rocks / price, 0, 1);
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = flash > 0 ? mix('#1B1446', CORAL, flash) : 'rgba(27,20,70,.92)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = SUN; ctx.stroke();
  drawRock(ctx, x - w / 2 + h * 0.55, y - h * 0.06, h * 0.3, -0.2);
  text(ctx, String(price), x + h * 0.25, y - 1, h * 0.52, { fill: '#FFFFFF', stroke: null });
  const bw = w * 0.86, by = y + h / 2 + 8 * u;
  rr(ctx, x - bw / 2, by, bw, 9 * u, 4.5 * u); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
  if (k > 0) { rr(ctx, x - bw / 2, by, Math.max(9 * u, bw * k), 9 * u, 4.5 * u); ctx.fillStyle = k >= 1 ? MINT : SUN; ctx.fill(); }
  rr(ctx, x - bw / 2, by, bw, 9 * u, 4.5 * u); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, `${Math.min(rocks, price)} of ${price}`, x, by + 20 * u, 12.5 * u, { fill: '#FFFFFF', stroke: INK, lw: 3 });
}

function rockCounter(ctx, x, y, n, u, bump) {
  const h = 46 * u, s = 1 + 0.12 * bump, w = (textW(ctx, String(n), h * 0.6) + h * 1.5) * s;
  ctx.save(); ctx.translate(x - w / 2, y); ctx.scale(s, s); ctx.translate(-(x - w / 2), -y);
  rr(ctx, x - w, y - h / 2 + 3, w, h, h / 2); ctx.fillStyle = 'rgba(10,6,40,.5)'; ctx.fill();
  rr(ctx, x - w, y - h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  drawRock(ctx, x - w + h * 0.55, y, h * 0.3, -0.2);
  text(ctx, String(n), x - w + h * 1.0, y + 1, h * 0.6, { fill: INK, stroke: null, align: 'left' });
  ctx.restore();
  return { x: x - w + h * 0.55, y };
}

function archPath(ctx, l, r, top, bot, rad) {
  ctx.beginPath(); ctx.moveTo(l, bot); ctx.lineTo(l, top + rad); ctx.arcTo(l, top, l + rad, top, rad); ctx.lineTo(r - rad, top); ctx.arcTo(r, top, r, top + rad, rad); ctx.lineTo(r, bot);
}
function archPoints(l, r, top, bot, rad, n = 60) {
  const pts = [], segs = [];
  const L1 = bot - (top + rad), A = rad * Math.PI / 2, L2 = r - l - 2 * rad, total = L1 * 2 + A * 2 + L2;
  for (let i = 0; i <= n; i++) {
    let d = (i / n) * total;
    if (d < L1) { pts.push([l, bot - d]); continue; } d -= L1;
    if (d < A) { const a = Math.PI + (d / A) * Math.PI / 2; pts.push([l + rad + Math.cos(a) * rad, top + rad + Math.sin(a) * rad]); continue; } d -= A;
    if (d < L2) { pts.push([l + rad + d, top]); continue; } d -= L2;
    if (d < A) { const a = -Math.PI / 2 + (d / A) * Math.PI / 2; pts.push([r - rad + Math.cos(a) * rad, top + rad + Math.sin(a) * rad]); continue; } d -= A;
    pts.push([r, top + rad + d]);
  }
  return pts || segs;
}

// The back of a bay (or the whole showroom), dressed for its tier.
function tierBack(ctx, tier, x, y, w, hh, t, light, seed = 1, lift = 0) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, hh); ctx.clip();
  const cx = x + w / 2, m = Math.min(w, hh);
  if (tier === 'starter') {
    ctx.fillStyle = grad(ctx, 0, y, 0, y + hh, ['#34418C', '#1F275C']); ctx.fillRect(x, y, w, hh);
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { const px = x + (w * i) / 4; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + hh); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    for (let px = x + 10; px < x + w; px += 18) for (const py of [y + 10, y + hh - 22]) { ctx.beginPath(); ctx.arc(px, py, 1.8, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.translate(cx, y + hh * 0.36); ctx.globalAlpha = 0.13; star5(ctx, m * 0.2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(x, y + hh - 12, w, 12); ctx.fillStyle = SUN;
    for (let px = x - 20; px < x + w + 20; px += 22) { ctx.beginPath(); ctx.moveTo(px, y + hh); ctx.lineTo(px + 11, y + hh - 12); ctx.lineTo(px + 19, y + hh - 12); ctx.lineTo(px + 8, y + hh); ctx.fill(); }
  } else if (tier === 'fun') {
    ctx.fillStyle = grad(ctx, x, y, x + w, y + hh, ['#FFF1B8', '#FFE2C8', '#FFD9EC']); ctx.fillRect(x, y, w, hh);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const r = rng(seed * 97 + 3);
    const sx = x + w * 0.16, sy = y + hh * 0.3, sr = m * 0.07;
    ctx.strokeStyle = '#FFB020'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.stroke();
    for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + t * 0.3; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * sr * 1.35, sy + Math.sin(a) * sr * 1.35); ctx.lineTo(sx + Math.cos(a) * sr * 1.8, sy + Math.sin(a) * sr * 1.8); ctx.stroke(); }
    ctx.strokeStyle = '#3D6CF0'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i < 60; i++) { const a = i * 0.32, rad = i * m * 0.0016; const px = x + w * 0.84 + Math.cos(a) * rad, py = y + hh * 0.3 + Math.sin(a) * rad; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
    [[0.32, 0.14, 0], [0.66, 0.2, 1], [0.1, 0.62, 2], [0.9, 0.6, 3], [0.55, 0.08, 4]].forEach(([fx, fy, c]) => { ctx.save(); ctx.translate(x + w * fx, y + hh * fy); ctx.rotate(Math.sin(t + fx * 9) * 0.2); star5(ctx, m * 0.035); ctx.lineWidth = 3; ctx.strokeStyle = FELT[c]; ctx.stroke(); ctx.restore(); });
    ctx.strokeStyle = CORAL; ctx.lineWidth = 3; ctx.beginPath();
    for (let px = x; px <= x + w; px += 6) { const py = y + hh * 0.86 + Math.sin((px - x) * 0.06 + t * 2) * 4; if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
    for (const [fx, fy, c, shape] of [[0.78, 0.68, MINT, 'star'], [0.22, 0.48, '#FF8FB1', 'heart']]) {
      const px = x + w * fx, py = y + hh * fy, rad = m * 0.055;
      ctx.beginPath(); ctx.arc(px, py, rad, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(27,20,70,.35)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, rad * 0.8, 0, TAU); ctx.fillStyle = c; ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      if (shape === 'star') { ctx.save(); ctx.translate(px, py); star5(ctx, rad * 0.5); ctx.fill(); ctx.restore(); } else { ctx.beginPath(); ctx.moveTo(px, py + rad * 0.4); ctx.bezierCurveTo(px - rad * 0.7, py - rad * 0.1, px - rad * 0.3, py - rad * 0.6, px, py - rad * 0.2); ctx.bezierCurveTo(px + rad * 0.3, py - rad * 0.6, px + rad * 0.7, py - rad * 0.1, px, py + rad * 0.4); ctx.fill(); }
    }
    const by = y + 8, n = Math.max(5, Math.round(w / 34));
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, by); ctx.quadraticCurveTo(cx, by + 16, x + w, by); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const u0 = (i + 0.5) / n, px = x + w * u0, py = by + 16 * 2 * u0 * (1 - u0) * 2 * 0.5 + 1, sw = Math.sin(t * 2.4 + i) * 2;
      ctx.beginPath(); ctx.moveTo(px - 10, py); ctx.lineTo(px + 10, py); ctx.lineTo(px + sw, py + 20); ctx.closePath();
      ctx.fillStyle = FELT[(i + seed) % FELT.length]; ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
    }
    void r;
  } else if (tier === 'cool') {
    ctx.fillStyle = grad(ctx, 0, y, 0, y + hh, ['#18205C', '#0A0D30']); ctx.fillRect(x, y, w, hh);
    ctx.strokeStyle = 'rgba(140,245,255,.08)'; ctx.lineWidth = 1;
    const off = (t * 8) % 22;
    for (let px = x - 22 + off; px < x + w; px += 22) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + hh); ctx.stroke(); }
    for (let py = y + off; py < y + hh; py += 22) { ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke(); }
    const l = x + w * 0.12, r = x + w * 0.88, top = y + hh * 0.14 - lift, bot = y + hh, rad = (r - l) * 0.28;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [inset, col] of [[0, '#8CF5FF'], [10, '#FF6AD5']]) {
      archPath(ctx, l + inset, r - inset, top + inset, bot, Math.max(4, rad - inset));
      ctx.lineCap = 'round'; ctx.strokeStyle = rgba(col, 0.16 * light); ctx.lineWidth = 16; ctx.stroke();
      ctx.strokeStyle = rgba(col, 0.55 * light); ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = rgba(mix(col, '#FFFFFF', 0.6), 0.95 * light); ctx.lineWidth = 2.2; ctx.stroke();
      const pts = archPoints(l + inset, r - inset, top + inset, bot, Math.max(4, rad - inset));
      for (let k = 0; k < 3; k++) {
        const u0 = ((t * (inset ? -0.22 : 0.3) + k / 3) % 1 + 1) % 1, p = pts[Math.floor(u0 * (pts.length - 1))];
        glow(ctx, p[0], p[1], 16, mix(col, '#FFFFFF', 0.5), light);
      }
    }
    ctx.restore();
  } else if (tier === 'premium') {
    const g = ctx.createRadialGradient(cx, y + hh * 0.5, 4, cx, y + hh * 0.5, Math.max(w, hh) * 0.7);
    g.addColorStop(0, '#5E2580'); g.addColorStop(1, '#170828'); ctx.fillStyle = g; ctx.fillRect(x, y, w, hh);
    for (let i = 0; i < 10; i++) { const fx = x + (w * i) / 10; ctx.fillStyle = grad(ctx, fx, 0, fx + w / 10, 0, ['rgba(0,0,0,.18)', 'rgba(255,255,255,.04)', 'rgba(0,0,0,.18)']); ctx.fillRect(fx, y, w / 10, hh); }
    const pw = Math.max(10, w * 0.075), ar = w * 0.33, ay = y + Math.max(hh * 0.42, ar + 16) - lift;
    for (const px of [x + w * 0.07, x + w * 0.93 - pw]) {
      ctx.fillStyle = grad(ctx, px, 0, px + pw, 0, ['#FFE48A', '#F0A51C', '#FFF6C7', '#C77A0C']); ctx.fillRect(px, ay - 6, pw, hh);
      ctx.strokeStyle = 'rgba(120,60,0,.45)'; ctx.lineWidth = 1.2;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(px + (pw * k) / 4, ay); ctx.lineTo(px + (pw * k) / 4, y + hh); ctx.stroke(); }
      ctx.fillStyle = '#FFD45E'; ctx.fillRect(px - 4, ay - 14, pw + 8, 10); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(px - 4, ay - 14, pw + 8, 10);
    }
    ctx.beginPath(); ctx.arc(cx, ay, ar, Math.PI, TAU); ctx.lineWidth = 13; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 8; ctx.strokeStyle = grad(ctx, cx - ar, ay - ar, cx + ar, ay, ['#FFF6C7', '#FFD45E', '#F0A51C', '#FFE48A', '#C77A0C']); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,240,180,.6)';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i < 40; i++) { const a = i * 0.3, rad = i * 0.45; const px = cx + s * (ar * 0.62) + Math.cos(a) * rad * s, py = ay - ar * 0.55 + Math.sin(a) * rad; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    }
    const gy0 = ay - ar;
    ctx.beginPath(); ctx.moveTo(cx, gy0 - 14); ctx.lineTo(cx + 11, gy0); ctx.lineTo(cx, gy0 + 14); ctx.lineTo(cx - 11, gy0); ctx.closePath(); ctx.fillStyle = '#E8364F'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
    glow(ctx, cx, gy0, 26, '#FF5D73', 0.6 * light);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI, s = Math.max(0, Math.sin(t * 2.2 + i * 1.9)); if (s > 0.3) sparkle(ctx, cx + Math.cos(a) * ar, ay + Math.sin(a) * ar, 7 * s); }
    ctx.restore();
    const lg = ctx.createRadialGradient(cx, y + hh, 0, cx, y + hh, w * 0.6); lg.addColorStop(0, rgba('#FFC93C', 0.35 * light)); lg.addColorStop(1, rgba('#FFC93C', 0));
    ctx.fillStyle = lg; ctx.fillRect(x, y, w, hh);
  } else if (tier === 'legendary') {
    ctx.fillStyle = '#120C3A'; ctx.fillRect(x, y, w, hh);
    const n = Math.max(6, Math.round(w / 40));
    for (let i = 0; i < n; i++) { const fx = x + (w * i) / n; ctx.fillStyle = grad(ctx, fx, 0, fx + w / n, 0, ['#1A1352', '#2E2390', '#1A1352']); ctx.fillRect(fx, y, w / n + 1, hh); }
    const r = rng(seed * 31 + 7), ns = Math.round((w * hh) / 700);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < ns; i++) {
      const px = x + r() * w, py = y + r() * hh, ph = r() * 6, c = r(), s = 0.5 + 0.5 * Math.sin(t * (1.5 + c * 2) + ph);
      ctx.fillStyle = c < 0.6 ? `rgba(255,255,255,${0.35 + 0.6 * s})` : hsl(c * 360 + t * 30, 100, 80, 0.4 + 0.5 * s);
      ctx.beginPath(); ctx.arc(px, py, 1 + 1.4 * s * (c > 0.85 ? 1.6 : 1), 0, TAU); ctx.fill();
      if (c > 0.93) sparkle(ctx, px, py, 4 * s + 1);
    }
    for (const k of [-1, 1]) {
      const ox = cx + k * w * 0.42, oy = y + hh, a = -Math.PI / 2 - k * (0.3 + 0.22 * Math.sin(t * 0.9 + k)), L = hh * 1.2;
      const ex = ox + Math.cos(a) * L, ey = oy + Math.sin(a) * L, nx = -Math.sin(a), ny = Math.cos(a);
      const g = ctx.createLinearGradient(ox, oy, ex, ey); g.addColorStop(0, rgba('#FFFFFF', 0.32 * light)); g.addColorStop(1, rgba('#B9A7FF', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox - nx * 6, oy - ny * 6); ctx.lineTo(ox + nx * 6, oy + ny * 6); ctx.lineTo(ex + nx * w * 0.16, ey + ny * w * 0.16); ctx.lineTo(ex - nx * w * 0.16, ey - ny * w * 0.16); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const vh = Math.max(16, hh * 0.08);
    ctx.fillStyle = '#2B2080'; ctx.beginPath(); ctx.moveTo(x, y);
    for (let px = x; px <= x + w + 30; px += 30) ctx.quadraticCurveTo(px + 15, y + vh * 1.9, px + 30, y + vh);
    ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = grad(ctx, x, 0, x + w, 0, [hsl(t * 60, 100, 70), hsl(t * 60 + 90, 100, 70), hsl(t * 60 + 180, 100, 70), hsl(t * 60 + 270, 100, 70)]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y + vh);
    for (let px = x; px <= x + w + 30; px += 30) ctx.quadraticCurveTo(px + 15, y + vh * 1.9, px + 30, y + vh);
    ctx.stroke();
    // marquee bulbs chasing round the stage's frame
    const step = 17, pts = [];
    for (let py = y + hh - 8; py > y + vh * 2.2; py -= step) pts.push([x + 8, py]);
    for (let px = x + 8; px < x + w - 8; px += step) pts.push([px, y + vh * 2.2]);
    for (let py = y + vh * 2.2; py < y + hh - 8; py += step) pts.push([x + w - 8, py]);
    const chase = Math.floor(t * 10);
    pts.forEach(([px, py], i) => {
      const on = (i + chase) % 4 === 0, c = hsl(i * 14 + t * 90, 100, on ? 80 : 60);
      if (on) glowHue(ctx, px, py, 12, i * 14 + t * 90, light);
      ctx.fillStyle = c; ctx.globalAlpha = on ? 1 : 0.55; ctx.beginPath(); ctx.arc(px, py, on ? 3.2 : 2.4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    });
  }
  if (light < 1) { ctx.fillStyle = `rgba(6,4,24,${0.84 * (1 - light)})`; ctx.fillRect(x, y, w, hh); }
  ctx.restore();
}

function glowHue(ctx, x, y, r, hue, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hsl(hue, 100, 80, 0.8 * a)); g.addColorStop(1, hsl(hue, 100, 60, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}

function spotCone(ctx, x0, y0, x1, y1, w0, w1, col, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(col, 0.3 * a)); g.addColorStop(1, rgba(col, 0.05 * a));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - w0 / 2, y0); ctx.lineTo(x0 + w0 / 2, y0); ctx.lineTo(x1 + w1 / 2, y1); ctx.lineTo(x1 - w1 / 2, y1); ctx.closePath(); ctx.fill();
  const pg = ctx.createRadialGradient(x1, y1, 0, x1, y1, w1 * 0.7); pg.addColorStop(0, rgba(col, 0.38 * a)); pg.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(x1, y1, w1 * 0.7, w1 * 0.17, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function lamp(ctx, x, y, s, on, col) {
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.6, y + s * 0.8); ctx.lineTo(x - s * 0.6, y + s * 0.8); ctx.closePath();
  ctx.fillStyle = '#3E4580'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.8, s * 0.6, s * 0.2, 0, 0, TAU); ctx.fillStyle = on > 0.05 ? mix('#5B5F8A', '#FFFFFF', on) : '#5B5F8A'; ctx.fill();
  if (on > 0.05) glow(ctx, x, y + s * 0.85, s * 2.4, col, on * 0.8);
}

function turntable(ctx, cx, gy, rx, t, col, { owned = false, picked = false, rainbow = false, spin = 1 } = {}) {
  const ry = rx * 0.22, th = Math.max(6, rx * 0.1);
  ctx.beginPath(); ctx.ellipse(cx, gy + th, rx, ry, 0, 0, TAU); ctx.fillStyle = '#1A1C44'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#1A1C44'; ctx.fillRect(cx - rx, gy, rx * 2, th);
  ctx.beginPath(); ctx.moveTo(cx - rx, gy); ctx.lineTo(cx - rx, gy + th); ctx.moveTo(cx + rx, gy); ctx.lineTo(cx + rx, gy + th); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.08 + 0.84 * (i / 8)), x = cx - Math.cos(a) * rx * 0.98, y = gy + th * 0.5 + Math.sin(a) * ry;
    const on = (Math.floor(t * 6) + i) % 3 === 0, c = rainbow ? hsl(i * 40 + t * 90, 100, 70) : col;
    if (!rainbow) glow(ctx, x, y, 7, c, on ? 0.9 : 0.3);
    ctx.fillStyle = rainbow ? c : on ? mix(c, '#FFFFFF', 0.5) : rgba(c, 0.5); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(cx, gy, rx, ry, 0, 0, TAU);
  ctx.fillStyle = grad(ctx, cx - rx, gy - ry, cx + rx, gy + ry, ['#6A72B8', '#454B8C', '#2E3370']); ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.7 * spin; ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + Math.cos(a) * rx, gy + Math.sin(a) * ry); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(cx, gy, rx, ry, 0, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); ctx.ellipse(cx, gy, rx * 0.93, ry * 0.88, 0, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = rainbow ? hsl(t * 80, 100, 70, 0.9) : rgba(col, 0.8); ctx.stroke();
  if (owned) { ctx.beginPath(); ctx.ellipse(cx, gy, rx * 0.55, ry * 0.55, 0, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(MINT, 0.85); ctx.stroke(); }
  if (picked) { const p = 0.55 + 0.45 * Math.sin(t * 4); ctx.beginPath(); ctx.ellipse(cx, gy, rx * 0.74, ry * 0.74, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = rgba(SUN, p); ctx.stroke(); }
  ctx.restore();
}

function stageSteps(ctx, cx, gy, w, raise, t) {
  for (const [k, dy, ww] of [[0, 0, 0.44], [1, raise, 0.5]]) {
    const y = gy - raise + dy, hw = w * ww;
    ctx.fillStyle = k ? '#251C70' : '#30258A'; ctx.fillRect(cx - hw, y, hw * 2, raise + 4);
    ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.strokeRect(cx - hw, y, hw * 2, raise + 4);
    ctx.fillStyle = grad(ctx, cx - hw, 0, cx + hw, 0, ['#FFE48A', '#F0A51C', '#FFF6C7', '#C77A0C']); ctx.fillRect(cx - hw, y, hw * 2, 3);
    for (let i = 0; i < 12; i++) { const px = cx - hw + (i + 0.5) * (hw * 2) / 12; ctx.fillStyle = hsl(i * 30 + t * 120, 100, 70); ctx.beginPath(); ctx.arc(px, y + raise * 0.55, 2, 0, TAU); ctx.fill(); }
  }
}

// What keeps a ship locked: glass for Fun and Cool, a shimmering force field for Premium and
// Legendary. crack: 0 to 1, as the rocks hit.
function drawCase(ctx, tier, cx, gy, w, hh, t, crack = 0) {
  const x = cx - w / 2, y = gy - hh;
  const field = tier === 'premium' || tier === 'legendary';
  ctx.save();
  if (!field) {
    rr(ctx, x, y, w, hh, 18); ctx.fillStyle = 'rgba(170,225,255,.16)'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const u = ((t * 0.18) % 1.4) - 0.2, sx = x + w * u;
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + w * 0.16, y); ctx.lineTo(sx - w * 0.2, y + hh); ctx.lineTo(sx - w * 0.36, y + hh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + w * 0.08, y + 8, 5, hh - 16);
    ctx.restore();
    rr(ctx, x, y, w, hh, 18); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
    rr(ctx, x - 4, y - 6, w + 8, 10, 5); ctx.fillStyle = '#C9D1E6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  } else {
    const col = tier === 'premium' ? '#FFD45E' : null;
    rr(ctx, x, y, w, hh, 22);
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = col ? 'rgba(255,212,94,.07)' : hsl(t * 40, 100, 70, 0.07); ctx.fillRect(x, y, w, hh);
    const s = 11, dx = s * 1.5, dy = s * Math.sqrt(3);
    for (let i = 0, gx = x; gx < x + w + s; gx += dx, i++) {
      for (let gy0 = y + (i % 2 ? dy / 2 : 0); gy0 < y + hh + s; gy0 += dy) {
        const a = Math.pow(Math.sin(t * 2.4 + gx * 0.05 + gy0 * 0.07), 2) * 0.45 + 0.08;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const an = (k * TAU) / 6, px = gx + Math.cos(an) * s * 0.92, py = gy0 + Math.sin(an) * s * 0.92; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.closePath(); ctx.lineWidth = 1.2; ctx.strokeStyle = col ? rgba(col, a) : hsl(gx * 0.8 + t * 60, 100, 75, a); ctx.stroke();
      }
    }
    const sy = y + ((t * 60) % hh);
    ctx.fillStyle = col ? rgba(col, 0.25) : 'rgba(255,255,255,.25)'; ctx.fillRect(x, sy, w, 3);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    rr(ctx, x, y, w, hh, 22); ctx.lineWidth = 7; ctx.strokeStyle = col ? rgba(col, 0.25) : hsl(t * 60, 100, 70, 0.3); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = col ? rgba('#FFF3B0', 0.9) : hsl(t * 60 + 120, 100, 85, 0.9); ctx.stroke();
    ctx.restore();
  }
  if (crack > 0) {
    const ix = cx, iy = y + hh * 0.48, r = rng(5);
    ctx.strokeStyle = field ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.95)'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + r() * 0.5, L = Math.min(w, hh) * (0.25 + r() * 0.35) * crack;
      ctx.beginPath(); ctx.moveTo(ix, iy);
      const mx = ix + Math.cos(a + 0.2) * L * 0.5, my = iy + Math.sin(a + 0.2) * L * 0.5;
      ctx.lineTo(mx, my); ctx.lineTo(ix + Math.cos(a) * L, iy + Math.sin(a) * L); ctx.stroke();
    }
    glow(ctx, ix, iy, 30 * crack, '#FFFFFF', 0.8);
  }
  ctx.restore();
}

function shatterCase(P, tier, cx, gy, w, hh) {
  const field = tier === 'premium' || tier === 'legendary';
  const n = Math.max(10, Math.round(34 * P.k));
  for (let i = 0; i < n; i++) {
    const x = cx + (Math.random() - 0.5) * w, y = gy - Math.random() * hh, a = Math.atan2(y - (gy - hh / 2), x - cx);
    if (field) P.add({ kind: 'hex', x, y, vx: Math.cos(a) * rnd(60, 200), vy: Math.sin(a) * rnd(60, 200) - 40, drag: 2, life: rnd(0.5, 1.0), size: rnd(5, 10), col: tier === 'premium' ? '#FFD45E' : pickHue() });
    else P.add({ kind: 'glass', x, y, vx: Math.cos(a) * rnd(80, 260), vy: Math.sin(a) * rnd(80, 260) - 80, g: 600, drag: 0.8, life: rnd(0.7, 1.2), size: rnd(8, 18), rot: Math.random() * 6, vr: rnd(-12, 12) });
  }
  for (let i = 0; i < Math.round(20 * P.k); i++) P.add({ kind: 'star', x: cx + (Math.random() - 0.5) * w, y: gy - Math.random() * hh, vx: rnd(-120, 120), vy: rnd(-160, -20), g: 160, drag: 2, life: rnd(0.6, 1.1), size: rnd(5, 10), col: pick(['#FFFFFF', SUN, SKY]), add: true });
}
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickHue = () => pick(['#FF8FB1', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF']);

function confettiRain(P, W, n, cols) {
  for (let i = 0; i < Math.max(10, Math.round(n * P.k)); i++) P.add({ kind: 'confetti', x: Math.random() * W, y: -20 - Math.random() * 120, vx: rnd(-40, 40), vy: rnd(120, 260), g: 30, drag: 0.2, life: rnd(2.2, 3.4), size: rnd(7, 12), col: cols[i % cols.length], rot: Math.random() * 6, vr: rnd(-9, 9), ph: Math.random() * 6, sway: rnd(2, 4), swayAmp: 40 });
}

function reflection(ctx, ship, S, t, floorY, H) {
  ctx.save();
  ctx.beginPath(); ctx.rect(S.x - S.h, floorY, S.h * 2, H - floorY); ctx.clip();
  ctx.translate(0, 2 * S.gy + 6); ctx.scale(1, -1); ctx.globalAlpha = 0.16;
  drawShip(ctx, ship, { ...S, thrust: 0 }, t);
  ctx.restore();
}

// Bip on foot, between ships. B: { x, y, s, flip, run }.
function drawBipRun(ctx, B, t) {
  if (B.run) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const yy = B.y - B.s * (0.3 + i * 0.18), x0 = B.x - (B.flip ? -1 : 1) * B.s * (0.35 + i * 0.05); ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 - (B.flip ? -1 : 1) * B.s * 0.35, yy); ctx.stroke(); }
    ctx.restore();
  }
  drawPilot(ctx, { x: B.x, y: B.y, s: B.s, wave: !!B.wave, mood: 'happy', flip: !!B.flip, squash: B.squash || 0, blink: 0 }, t);
}

// ---------- the gallery: one card per ship ----------

const PLANET_OF = { classic: 0, box: 2, teapot: 4, pod: 3, saucer: 1, crystal: 3, phoenix: 1, aurora: 5 };

class Card {
  constructor(root, ship, idx) {
    this.ship = ship; this.idx = idx; this.mode = 'fly'; this.T = 0; this.loud = false;
    const fig = document.createElement('figure'); fig.className = 'ship-card';
    const T = TIERS[ship.tier];
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('role', 'img'); this.canvas.setAttribute('aria-label', `${ship.name}, animated`);
    const cap = document.createElement('figcaption');
    cap.innerHTML = `<div class="cardhead"><b class="sname">${ship.name}</b> <span class="tier t-${ship.tier}">${T.name}${ship.price ? ` · ${ship.price} rocks` : ' · free'}</span></div><p class="look"></p><div class="seg" role="group" aria-label="Show"><button type="button" aria-pressed="true" data-m="fly">Flying</button><button type="button" aria-pressed="false" data-m="hangar">In the hangar</button><button type="button" class="again" data-m="again">Again, with sound</button></div>`;
    cap.querySelector('.look').textContent = ship.look;
    cap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const m = b.dataset.m;
      if (m === 'again') { this.loud = true; ac(); this.restart(); return; }
      this.mode = m; cap.querySelectorAll('button[data-m="fly"],button[data-m="hangar"]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.m === m)));
      this.restart();
    }));
    this.canvas.addEventListener('click', () => { this.loud = true; ac(); this.restart(); });
    fig.append(this.canvas, cap); root.appendChild(fig);
    this.fig = fig;
    this.ctx = this.canvas.getContext('2d');
    this.scene = new Scene(this.canvas);
    this.P = parts();
    this.resize();
  }
  resize() {
    const W = Math.max(220, Math.round(this.fig.clientWidth || 320)), H = Math.round(W * 0.62);
    this.W = W; this.H = H;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.scene.setPlanet(PLANET_OF[this.ship.id] ?? 0);
    this.scene.setLine(makeLine({ from: 0, to: 10, step: 1 }), 1, 'fraction');
    this.scene.setLabelLook('plain');
    this.scene.resize(W, H, dpr);
    this.scene.calm = calm.on;
    this.h = Math.round(clamp(H * 0.3, 52, 118));
    this.scene.rocketH = this.h;
    this.restart();
  }
  restart() {
    this.T = 0; this.P.clear();
    this.S = newState(this.mode === 'fly' ? this.h : Math.round(this.H * 0.42));
    this.S.dust = mix(this.scene.planet.glow || '#EDE8FF', '#FFFFFF', 0.5);
    this.landed = false; this.fin = null; this.target = [6, 4, 7, 3, 5, 8, 2, 6][this.idx % 8];
    this.show = null; this.px = null; this.pilot = null; this.ladder = null; this.leaving = false;
  }
  frame(dt, t) {
    this.T += dt;
    if (this.mode === 'fly') this.fly(dt, t); else this.hangar(dt, t);
  }
  fly(dt, t) {
    const { S, P, scene, ship } = this, h = this.h, W = this.W, gy = scene.groundY, T = this.T;
    const tx = scene.xOf(this.target);
    S.gy = gy;
    const V = { pad: null, bigFlag: null, fireworks: null, glow: null, shadow: null };
    if (T < 3.2) {
      const u = T / 3.2;
      S.air = true; S.legs = clamp((u - 0.62) / 0.3, 0, 1); S.thrust = 0.45 + 0.55 * u;
      S.x = lerp(W * 0.25, tx, ease.inOut(u)) + Math.sin(u * TAU) * W * 0.07 * (1 - u);
      S.y = lerp(-h * 0.9, gy - h * 0.5, 1 - Math.pow(1 - u, 1.6));
      const vx = this.px == null ? 0 : (S.x - this.px) / Math.max(dt, 1e-3);
      S.steer = clamp(vx / 160, -1, 1); S.rot = clamp(vx / 1400, -0.16, 0.16);
      this.px = S.x;
      V.shadow = { x: S.x, half: 0, k: clamp(u, 0, 1), a: 1, fromY: S.y, snap: null };
    } else if (!this.landed) {
      this.landed = true; S.x = tx; S.y = gy - h * 0.5; S.rot = 0; S.steer = 0; S.legs = 1;
      landShip(ship, S, P);
      if (ship.id === 'aurora') S.landedOpen = true;
      if (this.loud) sfx(TOUCH[ship.id]);
    }
    const F = T - 3.7;
    if (this.landed && T < 9.1) {
      V.glow = { value: this.target, a: 1 };
      if (F >= 0) this.finale(F, V, dt, t);
    }
    if (T >= 9.1) {
      if (!this.leaving) { this.leaving = true; S.landedOpen = false; S.pilotIn = true; if (this.loud) sfx('whoosh'); }
      const u = (T - 9.1) / 1.5;
      S.air = true; S.thrust = 1; S.legs = clamp(1 - u * 3, 0, 1);
      S.y = gy - h * 0.5 - Math.pow(u, 2) * (gy + h * 1.5);
    } else this.leaving = false;
    if (T > 11) { this.loud = false; this.restart(); return; }
    tickShip(ship, S, P, dt, t);
    P.update(dt);
    this.draw(V, dt, t);
  }
  finale(F, V, dt, t) {
    const { S, P, ship, scene } = this, h = this.h, gy = scene.groundY;
    if (!this.fin) {
      const dir = S.x < this.W / 2 ? 1 : -1, s = h * 0.5, outX = S.x + dir * (h * 0.42 + s * 0.38);
      this.fin = { dir, outX, plantX: outX + dir * s * 0.18, flagX: outX + dir * s * 0.55, bursts: [], fired: 0, sentFinale: false };
    }
    const Fi = this.fin;
    const end = F > 4.8 ? clamp((F - 4.8) / 0.5, 0, 1) : 0;
    V.pad = { x: S.x, k: clamp(F / 0.5, 0, 1) * (1 - end) };
    const lk = clamp((F - FIN.ladder) / 0.4, 0, 1) * (1 - end);
    this.ladder = { x: S.x, dir: Fi.dir, k: lk };
    const { top, foot } = ladderEnds(S.x, gy, h, Fi.dir);
    let P0 = null;
    if (F >= FIN.out && end < 1) {
      S.pilotIn = false;
      P0 = { x: 0, y: 0, s: h * 0.5, mood: 'happy', wave: false, squash: 0, flip: Fi.dir < 0, blink: S.blink };
      if (F < FIN.down) { const k = clamp((F - FIN.out) / (FIN.down - FIN.out), 0, 1); P0.x = lerp(top.x, foot.x, k); P0.y = lerp(top.y + P0.s * 0.15, gy - 1, k) - Math.abs(Math.sin(k * Math.PI * 4)) * P0.s * 0.06; }
      else if (F < FIN.walk) { const k = ease.inOut(clamp((F - FIN.down) / (FIN.walk - FIN.down), 0, 1)); P0.x = lerp(foot.x, Fi.plantX, k); P0.y = gy - 1 - Math.abs(Math.sin(k * Math.PI * 2)) * P0.s * 0.08; }
      else if (end > 0) { const k = end; P0.x = lerp(Fi.plantX, top.x, k); P0.y = lerp(gy - 1, top.y, k); }
      else { P0.x = Fi.plantX; const jump = !calm.on && F > FIN.bang && F < FIN.end - 0.2; P0.y = gy - 1 - (jump ? Math.abs(Math.sin((F - FIN.bang) * 5.5)) * h * 0.22 : 0); P0.wave = F > FIN.flag + 0.3; }
    }
    if (end >= 1) S.pilotIn = true;
    this.pilot = P0;
    if (F >= FIN.flag) V.bigFlag = { x: Fi.flagX, dir: Fi.dir, grow: clamp((F - FIN.flag) / 0.5, 0, 1) * (1 - end), stars: 3, shown: clamp(Math.floor((F - FIN.stars) / 0.22) + 1, 0, 3) };
    const fw = ship.fw, nb = calm.on ? 1 : fw.length;
    while (Fi.fired < nb && F >= FIN.bang + Fi.fired * 0.3) {
      const b = BURST_AT[Fi.fired % BURST_AT.length];
      Fi.bursts.push({ ...b, cols: fw[Fi.fired], k: 0, a: 1, age: 0 });
      if (this.loud) sfx(Fi.fired ? 'pop' : 'sparkle');
      Fi.fired += 1;
    }
    if (!Fi.sentFinale && F >= FIN.bang) { Fi.sentFinale = true; if (ship.finale) ship.finale(S, P, this.W); }
    for (const b of Fi.bursts) { b.age += dt; b.k = ease.out(clamp(b.age / 0.8, 0, 1)); b.a = 1 - clamp((b.age - 0.9) / 0.9, 0, 1); }
    V.fireworks = Fi.bursts;
    void scene; void t;
  }
  hangar(dt, t) {
    const { S, P, ship } = this, W = this.W, H = this.H, fy = Math.round(H * 0.8), h = S.h;
    const u = this.T % 5;
    S.idle = true; S.gy = fy; S.x = W / 2;
    let lift = 0;
    if (u < 1.3) {
      if (u < 0.5) { lift = ease.out(u / 0.5) * h * 0.25; S.air = true; S.thrust = 0.8; S.legs = 1 - ease.out(u / 0.5) * 0.6; }
      else if (u < 0.9) { lift = h * 0.25 * (1 - ease.inOut((u - 0.5) / 0.4)); S.thrust = 0.55; S.legs = clamp(0.4 + (u - 0.5) * 2, 0, 1); }
      else if (!this.show) { this.show = true; S.legs = 1; landShip(ship, S, P); if (ship.id === 'aurora') S.bloom = 1.2; if (this.loud) { sfx(TOUCH[ship.id]); } }
    } else { this.show = false; S.air = false; S.thrust = 0; S.legs = 1; if (this.loud && this.T > 5) this.loud = false; }
    if (u >= 0.9) S.air = false;
    S.y = fy - h * 0.5 - lift - (calm.on ? 0 : Math.sin(t * 1.6) * h * 0.015);
    tickShip(ship, S, P, dt, t);
    P.update(dt);
    const ctx = this.ctx, dpr = this.scene.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    tierBack(ctx, ship.tier, 0, 0, W, fy, t, 1, this.idx + 1);
    ctx.fillStyle = grad(ctx, 0, fy, 0, H, ['#2C2766', '#120C32']); ctx.fillRect(0, fy, W, H - fy);
    ctx.fillStyle = INK; ctx.fillRect(0, fy - 2, W, 4);
    const T0 = TIERS[ship.tier];
    spotCone(ctx, W / 2, 0, W / 2, fy, 18, h * 1.3, T0.rainbow ? '#FFFFFF' : mix(T0.col, '#FFFFFF', 0.5), 0.9);
    const raise = ship.tier === 'legendary' ? Math.round(h * 0.1) : 0;
    if (raise) stageSteps(ctx, W / 2, fy + raise, h * 1.9, raise, t);
    reflection(ctx, ship, S, t, fy + 4, H);
    turntable(ctx, W / 2, fy, h * 0.62, t, T0.rainbow ? '#FFFFFF' : T0.col, { rainbow: !!T0.rainbow });
    drawTrail(ctx, ship, S, t);
    P.draw(ctx, 'back');
    drawShip(ctx, ship, S, t);
    P.draw(ctx, 'front');
  }
  draw(V, dt, t) {
    const { ctx, scene, S, P, ship } = this;
    scene.draw(V, t, dt);
    drawTrail(ctx, ship, S, t);
    P.draw(ctx, 'back');
    drawShip(ctx, ship, S, t);
    if (this.ladder && this.ladder.k > 0.01 && this.landed && this.T < 9.1) drawLadder(ctx, this.ladder, scene.groundY, this.h);
    if (this.pilot && this.T < 9.1) drawPilot(ctx, this.pilot, t);
    P.draw(ctx, 'front');
  }
}

// ---------- the hangars ----------

class Demo {
  constructor(root, kind) {
    this.root = root; this.kind = kind;
    this.wrap = document.createElement('div'); this.wrap.className = 'device';
    this.canvas = document.createElement('canvas'); this.canvas.className = 'demo';
    this.canvas.setAttribute('role', 'application');
    this.canvas.setAttribute('aria-label', kind === 'hall' ? 'Hangar A, the hall: a working mock-up. Tap the door, swipe, and tap ships.' : 'Hangar B, the showroom: a working mock-up. Tap the door, use the arrows or the badges, and tap ships.');
    this.wrap.appendChild(this.canvas); root.appendChild(this.wrap);
    this.ctx = this.canvas.getContext('2d');
    this.P = parts(); this.fx = parts();
    this.T = 0; this.door = { k: 0, to: 0, lit: -1 }; this.amb = 0;
    this.sel = null; this.buy = null; this.bip = null; this.flying = []; this.counterOff = 0; this.bursts = []; this.hits = []; this.press = null; this.bump = 0;
    this.counterAt = { x: 0, y: 0 }; this.lastHits = [];
    this.canvas.addEventListener('pointerdown', (e) => this.down(e));
    this.canvas.addEventListener('pointermove', (e) => this.move(e));
    this.canvas.addEventListener('pointerup', (e) => this.up(e));
    this.canvas.addEventListener('pointercancel', () => { this.press = null; });
    this.canvas.style.touchAction = 'pan-y';
    this.size = 'sideways';
    listeners.push(() => this.walletChanged());
  }
  setSize(name) { this.size = name; const d = DEVICES[name]; this.W = d.w; this.H = d.h; this.fit(); this.layout(); }
  fit() {
    const avail = Math.max(240, this.root.clientWidth);
    let sc = Math.min(1, avail / this.W);
    const maxH = Math.max(340, window.innerHeight * 0.82);
    if (this.H * sc > maxH) sc = maxH / this.H;
    this.sc = sc; this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(this.W * sc), ch = Math.round(this.H * sc);
    this.canvas.style.width = cw + 'px'; this.canvas.style.height = ch + 'px';
    this.canvas.width = Math.round(cw * this.dpr); this.canvas.height = Math.round(ch * this.dpr);
    this.u = clamp(Math.min(this.W, this.H) / 390, 0.95, 1.45);
  }
  local(e) { const r = this.canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) * this.W) / r.width, y: ((e.clientY - r.top) * this.H) / r.height }; }
  down(e) { const p = this.local(e); const now = performance.now(); this.press = { x0: p.x, y0: p.y, x: p.x, drag: false, vx: 0, lastT: now }; try { this.canvas.setPointerCapture(e.pointerId); } catch { /* fine */ } }
  move(e) {
    const pr = this.press; if (!pr) return;
    const p = this.local(e), dx = p.x - pr.x;
    if (!pr.drag && Math.abs(p.x - pr.x0) > 12 && this.door.k > 0.95) pr.drag = true;
    if (pr.drag) { const now = performance.now(); this.drag(dx); pr.vx = (dx / Math.max(8, now - pr.lastT)) * 1000; pr.lastT = now; }
    pr.x = p.x;
  }
  up(e) {
    const pr = this.press; this.press = null; if (!pr) return;
    const p = this.local(e);
    if (pr.drag) this.dragEnd(pr.vx, p.x - pr.x0); else this.tap(p.x, p.y);
  }
  drag() {}
  dragEnd() {}
  hit(x, y) { for (let i = this.lastHits.length - 1; i >= 0; i--) { const h = this.lastHits[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h; } return null; }
  addHit(id, x, y, w, h, fn) { this.hits.push({ id, x, y, w, h, fn }); }
  rectOf(id) { return this.lastHits.find((h) => h.id === id) || null; }
  tap(x, y) {
    if (this.door.to === 0) { if (this.door.k < 0.05) this.openDoor(); return; }
    if (this.door.k < 0.95) return;
    const h = this.hit(x, y); if (h) h.fn();
  }
  openDoor() { ac(); this.door.to = 1; this.door.lit = -1; sfx('rumble'); }
  closeDoor() { this.door.to = 0; this.sel = null; sfx('rumble'); this.onClose(); }
  onClose() {}
  walletChanged() {}
  stepDoor(dt) {
    const d = this.door, was = d.k;
    d.k = clamp(d.k + dt * (d.to ? 0.95 : -1.2), 0, 1);
    if (d.k >= 1 && was < 1) { d.lit = this.T; sfx('clunk'); }
    if (d.k <= 0) d.lit = -1;
    this.amb = d.lit >= 0 ? clamp((this.T - d.lit) / 0.5, 0, 1) : 0;
  }
  canAfford(ship) { return wallet.rocks >= ship.price; }
  isOwned(ship) { return wallet.owned.has(ship.id); }
  // A tap on a ship: pick it out, show it off, and say what's next.
  choose(i) {
    const ship = SHIPS[i];
    this.sel = i; this.showOff(i);
    sfx('tap');
    if (!this.isOwned(ship) && !this.canAfford(ship)) {
      this.wobble(i); sfx('boop');
      say(`${ship.name}. You need ${ship.price - wallet.rocks} more moon rocks.`);
    } else say(ship.name);
  }
  action() {
    if (this.sel == null || this.buy || this.bip) return;
    const ship = SHIPS[this.sel];
    if (this.isOwned(ship)) { if (wallet.picked !== ship.id) { sfx('tap'); this.flyShip(ship.id); } }
    else if (this.canAfford(ship)) this.startBuy(ship.id);
    else { this.wobble(this.sel); sfx('boop'); say(`You need ${ship.price - wallet.rocks} more moon rocks.`); }
  }
  startBuy(id) {
    const ship = SHIP_BY_ID[id];
    wallet.rocks -= ship.price; this.counterOff = ship.price; notify();
    const n = clamp(Math.round(ship.price / 12), 5, 16);
    this.buy = { id, t: 0, n, per: ship.price / n, arrived: 0, crackAt: 0.07 * (n - 1) + 0.78, crack: 0, done: false };
    for (let i = 0; i < n; i++) this.flying.push({ t: -i * 0.07, dur: 0.75, x0: this.counterAt.x, y0: this.counterAt.y, id, done: false });
    sfx('whoosh');
  }
  stepBuy(dt) {
    for (const r of this.flying) {
      r.t += dt;
      if (r.t >= r.dur && !r.done) {
        r.done = true; this.counterOff = Math.max(0, this.counterOff - (this.buy ? this.buy.per : 0)); this.bump = 1;
        if (this.buy) this.buy.arrived += 1;
        const p = this.caseCentre(r.id);
        for (let i = 0; i < 5; i++) this.fx.add({ kind: 'star', x: p.x, y: p.y, vx: rnd(-90, 90), vy: rnd(-90, 60), drag: 2, life: 0.5, size: rnd(4, 8), col: pick(['#FFFFFF', SUN]), add: true });
        if (this.buy && this.buy.arrived % 2 === 1) sfx('coin');
      }
    }
    this.flying = this.flying.filter((r) => !r.done);
    const b = this.buy; if (!b) return;
    b.t += dt;
    const ship = SHIP_BY_ID[b.id];
    if (b.t >= b.crackAt && b.crack === 0) { b.crack = 0.01; sfx('crack'); }
    if (b.crack > 0 && !b.done) b.crack = Math.min(1, b.crack + dt / 0.35);
    if (b.crack >= 1 && !b.done) {
      b.done = true; b.doneAt = b.t;
      wallet.owned.add(b.id); notify();
      const c = this.caseRect(b.id);
      shatterCase(this.fx, ship.tier, c.cx, c.gy, c.w, c.hh);
      sfx('shatter'); setTimeout(() => sfx(FANFARE[ship.tier] || 'yay'), 180);
      confettiRain(this.fx, this.W, ship.tier === 'legendary' ? 170 : ship.tier === 'premium' ? 120 : 80, ship.conf);
      this.swingLights(b.id);
      if (ship.tier === 'legendary' || ship.tier === 'premium') {
        const n = ship.tier === 'legendary' ? 5 : 3;
        for (let i = 0; i < (calm.on ? 1 : n); i++) this.bursts.push({ ...BURST_AT[i], cols: ship.fw[i % ship.fw.length], k: 0, a: 1, age: -i * 0.3 });
      }
      this.showOff(SHIPS.indexOf(ship));
      say(`${ship.name} is yours!`);
    }
    if (b.done && b.t - b.doneAt > 1.5) { this.buy = null; this.flyShip(b.id); }
  }
  stepBursts(dt) {
    for (const b of this.bursts) { b.age += dt; const a = Math.max(0, b.age); b.k = ease.out(clamp(a / 0.8, 0, 1)); b.a = b.age < 0 ? 0 : 1 - clamp((a - 0.9) / 0.9, 0, 1); }
    this.bursts = this.bursts.filter((b) => b.age < 2);
  }
  drawFlying(ctx, t) {
    for (const r of this.flying) {
      if (r.t < 0) continue;
      const p = this.caseCentre(r.id), k = ease.inOut(clamp(r.t / r.dur, 0, 1));
      const x = lerp(r.x0, p.x, k), y = lerp(r.y0, p.y, k) - Math.sin(k * Math.PI) * 80;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFFFFF';
      for (let i = 1; i < 4; i++) { ctx.globalAlpha = 0.5 - i * 0.12; sparkle(ctx, x - (p.x - r.x0) * 0.03 * i, y - (p.y - r.y0) * 0.03 * i, 6 - i); }
      ctx.restore();
      drawRock(ctx, x, y, lerp(15, 11, k), r.t * 7);
    }
  }
  drawUI(ctx, t) {
    const u = this.u, W = this.W;
    const r = 26 * u;
    if (this.door.k > 0.95) { circleBtn(ctx, 14 + r, 14 + r, r, 'back'); this.addHit('back', 14, 14, r * 2, r * 2, () => this.closeDoor()); }
    this.bump = Math.max(0, this.bump - 0.08);
    this.counterAt = rockCounter(ctx, W - 14, 14 + 23 * u, wallet.rocks + Math.round(this.counterOff), u, this.bump);
    for (const b of this.bursts) drawFirework(ctx, b, this.W, this.H);
    this.fx.draw(ctx, 'back'); this.fx.draw(ctx, 'front');
    this.drawFlying(ctx, t);
  }
  actionButton(ctx, x, y, t) {
    if (this.sel == null) return;
    const u = this.u, ship = SHIPS[this.sel], owned = this.isOwned(ship), picked = wallet.picked === ship.id;
    let label, fill = SUN, dim = false, rock = false;
    if (this.buy && this.buy.id === ship.id) { label = 'Unlocking…'; fill = SUN; dim = true; }
    else if (owned && picked) { label = this.bip ? 'Climbing in…' : 'Flying this one'; fill = '#FFFFFF'; dim = true; }
    else if (owned) { label = 'Fly this one'; fill = MINT; }
    else if (this.canAfford(ship)) { label = `Buy  ${ship.price}`; fill = SUN; rock = true; }
    else { label = `Need ${ship.price - wallet.rocks} more`; fill = '#B9B3E6'; dim = true; rock = true; }
    const h = 54 * u, w = Math.max(200 * u, textW(ctx, label, h * 0.44) + h * (rock ? 1.9 : 1.2));
    const breathe = !dim && !calm.on ? 1 + 0.03 * Math.sin(t * 4.2) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(breathe, breathe); ctx.translate(-x, -y);
    button(ctx, x, y, w, h, fill, { dim });
    const tx = rock ? x + h * 0.3 : x;
    if (rock) drawRock(ctx, x - w / 2 + h * 0.62, y, h * 0.26, -0.2);
    text(ctx, label, tx, y + 1, h * 0.42, { fill: INK, stroke: null });
    ctx.restore();
    this.addHit('action', x - w / 2, y - h / 2, w, h, () => this.action());
  }
  drawDoor(ctx, bottom, porthole, t) {
    const k = ease.inOut(this.door.k);
    if (k >= 0.999) return;
    const W = this.W, u = this.u, gap = 12 * u, edge = lerp(bottom - gap, -20, k), lift = (bottom - gap) - edge;
    // light spilling from under the door
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(0, edge, 0, edge + 80 * u); lg.addColorStop(0, rgba('#FFE7A8', 0.55)); lg.addColorStop(1, rgba('#FFE7A8', 0));
    ctx.fillStyle = lg; ctx.fillRect(0, edge, W, 80 * u); ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, edge);
    const pc = { x: porthole.x, y: porthole.y - lift, r: porthole.r };
    ctx.moveTo(pc.x + pc.r, pc.y); ctx.arc(pc.x, pc.y, pc.r, 0, TAU, true);
    ctx.fillStyle = grad(ctx, 0, 0, W, 0, ['#4C568F', '#6A75B3', '#58629E', '#6A75B3', '#4C568F']); ctx.fill('evenodd');
    ctx.clip('evenodd');
    ctx.strokeStyle = 'rgba(20,16,60,.55)'; ctx.lineWidth = 3;
    for (let y = edge - 24 * u; y > -30; y -= 24 * u) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2;
    for (let y = edge - 21 * u; y > -30; y -= 24 * u) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    // the porthole's rim, the sign and the bottom bar
    ctx.beginPath(); ctx.arc(pc.x, pc.y, pc.r, 0, TAU); ctx.lineWidth = 12 * u; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 7 * u; ctx.strokeStyle = '#C9D1E6'; ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8; ctx.fillStyle = '#7C82B8'; ctx.beginPath(); ctx.arc(pc.x + Math.cos(a) * pc.r, pc.y + Math.sin(a) * pc.r, 2.6 * u, 0, TAU); ctx.fill(); }
    const signY = Math.min(pc.y - pc.r - 34 * u, edge - 40 * u);
    if (signY > 6) {
      const sw = 190 * u, sh = 44 * u;
      rr(ctx, W / 2 - sw / 2, signY - sh / 2, sw, sh, 10 * u); ctx.fillStyle = '#1B1446'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = SUN; ctx.stroke();
      glow(ctx, W / 2, signY, sw * 0.45, SUN, 0.35 + 0.1 * Math.sin(t * 3));
      text(ctx, 'HANGAR', W / 2, signY + 1, sh * 0.62, { fill: SUN, stroke: null, weight: 700 });
    }
    ctx.fillStyle = INK; ctx.fillRect(0, edge - 10 * u, W, 10 * u);
    ctx.save(); ctx.beginPath(); ctx.rect(0, edge - 10 * u, W, 8 * u); ctx.clip(); ctx.fillStyle = SUN;
    for (let x = -20; x < W + 20; x += 22 * u) { ctx.beginPath(); ctx.moveTo(x, edge - 2 * u); ctx.lineTo(x + 11 * u, edge - 10 * u); ctx.lineTo(x + 19 * u, edge - 10 * u); ctx.lineTo(x + 8 * u, edge - 2 * u); ctx.fill(); }
    ctx.restore();
    const moving = this.door.k > 0.001 && this.door.k < 0.999;
    for (const bx of [22 * u, W - 22 * u]) {
      const on = moving ? 0.6 + 0.4 * Math.sin(t * 14) : 0.25 + 0.2 * Math.sin(t * 3);
      ctx.beginPath(); ctx.arc(bx, 22 * u, 9 * u, 0, TAU); ctx.fillStyle = mix('#7A4A10', '#FFB020', on); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      glow(ctx, bx, 22 * u, 34 * u, '#FFB020', on * 0.7);
    }
    if (this.door.to === 0 && this.door.k < 0.02) {
      const pulse = 1 + 0.05 * Math.sin(t * 4), label = 'Tap the door', fs = 20 * u;
      const tw = textW(ctx, label, fs) + 34 * u, ty = Math.min(this.H - 26 * u, pc.y + pc.r + 34 * u);
      ctx.save(); ctx.translate(W / 2, ty); ctx.scale(pulse, pulse);
      rr(ctx, -tw / 2, -18 * u, tw, 36 * u, 18 * u); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
      text(ctx, label, 0, 1, fs, { fill: INK, stroke: null });
      ctx.restore();
    }
  }
  // Drawing a ship that sits on a pad, with its parts.
  drawPadShip(ctx, ship, S, P, t, { owned, picked, light, floorY, H, raise = 0, rx }) {
    const T = TIERS[ship.tier];
    if (raise) stageSteps(ctx, S.x, S.gy + raise, S.h * 2.1, raise, t);
    if (light > 0.2) reflection(ctx, ship, S, t, floorY + 4, H);
    turntable(ctx, S.x, S.gy, rx, t, T.rainbow ? '#FFFFFF' : T.col, { owned, picked, rainbow: !!T.rainbow });
    drawTrail(ctx, ship, S, t);
    P.draw(ctx, 'back');
    drawShip(ctx, ship, S, t);
    P.draw(ctx, 'front');
  }
  startBip(fromPos, toId) {
    this.bip = { t: 0, from: fromPos, toId };
    sfx('pop');
  }
  // Bip's trip to a new ship: hop out, run, jump in. Returns Bip's spot, or null when done.
  stepBip(dt) {
    const B = this.bip; if (!B) return null;
    B.t += dt;
    const to = this.windowOf(B.toId), s = this.shipH * 0.5, floor = this.bipFloor();
    const dir = Math.sign(to.x - B.from.x) || 1;
    const fA = { x: B.from.x + dir * this.shipH * 0.42, y: floor }, fB = { x: to.x - dir * this.shipH * 0.45, y: floor };
    const dA = B.from.offstage ? 0 : 0.42, dRun = clamp(Math.abs(fB.x - fA.x) / 900, 0.25, 1.1), dC = 0.42;
    let x, y, run = false, squash = 0;
    if (B.t < dA) { const k = B.t / dA; x = lerp(B.from.x, fA.x, k); y = lerp(B.from.y + s * 0.6, floor, k) - Math.sin(k * Math.PI) * s * 0.8; }
    else if (B.t < dA + dRun) { const k = (B.t - dA) / dRun; x = lerp(fA.x, fB.x, ease.inOut(k)); y = floor - Math.abs(Math.sin(k * Math.PI * 5)) * s * 0.12; run = true; }
    else if (B.t < dA + dRun + dC) { const k = (B.t - dA - dRun) / dC; x = lerp(fB.x, to.x, k); y = lerp(floor, to.y + s * 0.6, k) - Math.sin(k * Math.PI) * s * 0.9; squash = k > 0.85 ? 0.15 : 0; }
    else {
      wallet.picked = B.toId; notify(); this.bip = null;
      for (let i = 0; i < Math.round(16 * this.P.k) + 4; i++) this.landSparkle(to);
      sfx('sparkle'); return null;
    }
    return { x, y, s, flip: dir < 0, run, squash };
  }
  landSparkle(p) { this.fx.add({ kind: 'star', x: this.toScreenX(p.x), y: p.y, vx: rnd(-140, 140), vy: rnd(-160, 40), drag: 2.2, g: 120, life: rnd(0.5, 0.9), size: rnd(4, 9), col: pick([SUN, '#FFFFFF', MINT]), add: true }); }
  toScreenX(x) { return x; }
}

class Hall extends Demo {
  constructor(root) { super(root, 'hall'); this.cam = 0; this.camTo = null; this.vel = 0; this.setSize('sideways'); }
  layout() {
    const { W, H } = this, up = H > W, u = this.u;
    this.fy = Math.round(H * (up ? 0.62 : 0.7));
    this.padY = this.fy + Math.round(Math.min(24 * u, (H - this.fy) * 0.25));
    this.bw = Math.round(up ? W * 0.8 : clamp(H * 0.7, 230, 330));
    const topUI = 72 * u;
    this.shipH = Math.round(Math.min(this.bw * (up ? 0.52 : 0.46), (this.padY - topUI) * 0.62));
    this.alcTop = Math.round(this.padY - this.shipH * 1.62);
    let x = Math.round(this.bw * 0.3);
    const old = this.bays;
    this.bays = SHIPS.map((ship, i) => {
      const w = ship.tier === 'legendary' ? Math.round(this.bw * 1.45) : this.bw;
      const b = { i, ship, x, w, cx: x + w / 2, S: newState(this.shipH), P: parts(), light: old ? old[i].light : 0, wob: 0, show: -1, swing: 0, raise: ship.tier === 'legendary' ? Math.round(this.shipH * 0.2) : 0 };
      b.S.idle = true; b.S.dust = '#C9CFF5';
      x += w; return b;
    });
    this.worldW = x + Math.round(this.bw * 0.3);
    this.focus(this.sel != null ? SHIPS[this.sel].id : wallet.picked, true);
  }
  bay(id) { return this.bays.find((b) => b.ship.id === id); }
  focus(id, now = false) {
    const b = this.bay(id), c = clamp(b.cx - this.W / 2, 0, Math.max(0, this.worldW - this.W));
    if (now) { this.cam = c; this.camTo = null; } else this.camTo = c;
    this.vel = 0;
  }
  onClose() { setTimeout(() => this.focus(wallet.picked, true), 900); }
  drag(dx) { this.cam = clamp(this.cam - dx, 0, Math.max(0, this.worldW - this.W)); this.camTo = null; }
  dragEnd(vx) { this.vel = clamp(-vx, -2600, 2600); }
  choose(i) { super.choose(i); this.focus(SHIPS[i].id); }
  showOff(i) { this.bays[i].show = 0; }
  wobble(i) { this.bays[i].wob = 1; this.flash = 1; }
  swingLights(id) { this.bay(id).swing = 1; }
  shipGy(b) { return this.padY - b.raise; }
  windowOf(id) { const b = this.bay(id); return { x: b.cx, y: b.S.y }; }
  bipFloor() { return this.padY + 4; }
  toScreenX(x) { return x - this.cam; }
  caseRect(id) { const b = this.bay(id), w = this.shipH * 1.22, hh = this.shipH * 1.32; return { cx: b.cx - this.cam, gy: this.shipGy(b) + 4, w, hh }; }
  caseCentre(id) { const c = this.caseRect(id); return { x: c.cx, y: c.gy - c.hh * 0.48 }; }
  flyShip(id) { const from = this.bay(wallet.picked); this.startBip({ x: from.cx, y: from.S.y }, id); }
  walletChanged() {}
  frame(dt, t) {
    this.T += dt;
    this.stepDoor(dt);
    const { W, H } = this;
    if (!this.press) {
      if (this.camTo != null) { this.cam += (this.camTo - this.cam) * Math.min(1, dt * 6); if (Math.abs(this.camTo - this.cam) < 0.5) { this.cam = this.camTo; this.camTo = null; } }
      else if (Math.abs(this.vel) > 5) { this.cam = clamp(this.cam + this.vel * dt, 0, Math.max(0, this.worldW - W)); this.vel *= Math.pow(0.05, dt); }
    }
    const lit = this.door.lit;
    for (const b of this.bays) {
      let want = 0;
      if (lit >= 0) { const d = this.T - lit - 0.25 - b.i * 0.16; want = d < 0 ? 0 : d < 0.25 ? (Math.random() < 0.5 ? 1 : 0.2) : 1; if (d >= 0 && d < dt + 0.001) sfx('clunk'); }
      else if (b.ship.id === wallet.picked) want = 0.65;
      b.light = want; b.swing = Math.max(0, b.swing - dt * 0.8); b.wob = Math.max(0, b.wob - dt * 2);
    }
    this.flash = Math.max(0, (this.flash || 0) - dt * 2);
    const bipAt = this.stepBip(dt);
    for (const b of this.bays) {
      const sx = b.cx - this.cam;
      b.vis = sx > -b.w && sx < W + b.w;
      const S = b.S, ship = b.ship;
      S.gy = this.shipGy(b); S.x = b.cx;
      let lift = 0;
      if (b.show >= 0) {
        b.show += dt; const u0 = b.show;
        if (u0 < 0.5) { lift = ease.out(u0 / 0.5) * S.h * 0.25; S.air = true; S.thrust = 0.8; S.legs = 1 - ease.out(u0 / 0.5) * 0.6; }
        else if (u0 < 0.9) { lift = S.h * 0.25 * (1 - ease.inOut((u0 - 0.5) / 0.4)); S.thrust = 0.55; S.legs = clamp(0.4 + (u0 - 0.5) * 2, 0, 1); }
        else { S.legs = 1; landShip(ship, S, b.P); if (ship.id === 'aurora') S.bloom = 1.2; if (b.vis) sfx(TOUCH[ship.id]); b.show = -1; }
      } else { S.air = false; S.thrust = 0; }
      S.rot = Math.sin(this.T * 30) * 0.08 * b.wob;
      S.y = S.gy - S.h * 0.5 - lift - (calm.on ? 0 : Math.sin(t * 1.6 + b.i) * S.h * 0.015);
      S.pilotIn = wallet.picked === ship.id && !(this.bip && (this.bip.toId === ship.id || this.bay(wallet.picked) === b));
      if (b.vis) { tickShip(ship, S, b.P, dt, t); b.P.update(dt); }
    }
    this.stepBuy(dt);
    this.stepBursts(dt);
    this.fx.update(dt);
    this.draw(t, bipAt);
  }
  draw(t, bipAt) {
    const ctx = this.ctx, { W, H, fy, padY, u } = this;
    ctx.setTransform(this.sc * this.dpr, 0, 0, this.sc * this.dpr, 0, 0);
    this.hits = [];
    const amb = Math.max(this.amb, 0.25);
    // the far wall: a long window onto space, seen past the bays
    const winTop = 0, winBot = this.alcTop - 6;
    ctx.fillStyle = grad(ctx, 0, 0, 0, fy, ['#0B0726', '#1C1450', '#2A2068']); ctx.fillRect(0, 0, W, fy);
    if (winBot > 10) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, winTop, W, winBot); ctx.clip();
      const sky = ctx.createLinearGradient(0, 0, 0, winBot); sky.addColorStop(0, '#060418'); sky.addColorStop(1, '#22185A'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, winBot);
      const r = rng(77), off = this.cam * 0.12;
      for (let i = 0; i < 140; i++) { const sx = ((r() * (W + 600) - off) % (W + 600) + (W + 600)) % (W + 600) - 300, sy = r() * winBot, s = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + i); ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * s})`; ctx.fillRect(sx, sy, 1.6, 1.6); }
      const pr = Math.min(winBot * 0.7, 70 * u);
      drawPlanetBall(ctx, 5, W * 0.72 - off * 0.6, winBot * 0.55, pr, false);
      drawPlanetBall(ctx, 2, W * 0.12 - off * 0.6 + 900, winBot * 0.4, pr * 0.5, false);
      ctx.restore();
      ctx.fillStyle = '#1B1446';
      const sp = 150, o2 = (this.cam * 0.5) % sp;
      for (let x = -o2; x < W + sp; x += sp) ctx.fillRect(x - 5, 0, 10, winBot);
      ctx.fillRect(0, winBot - 6, W, 8);
    }
    ctx.save(); ctx.translate(-this.cam, 0);
    for (const b of this.bays) {
      if (!b.vis) continue;
      const light = Math.min(b.light, 1) * (0.55 + 0.45 * amb), T = TIERS[b.ship.tier];
      tierBack(ctx, b.ship.tier, b.x + 5, this.alcTop, b.w - 10, fy - this.alcTop, t, Math.max(0.12, light), b.i + 1, 0);
      ctx.fillStyle = '#2A2F66'; ctx.fillRect(b.x - 5, this.alcTop - 14, 10, fy - this.alcTop + 14); ctx.fillRect(b.x - 5, this.alcTop - 14, b.w + 10, 12);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(b.x - 5, this.alcTop - 14, 10, fy - this.alcTop + 14);
    }
    ctx.restore();
    // the floor
    ctx.fillStyle = grad(ctx, 0, fy, 0, H, ['#2E2870', '#17113F', '#0C0826']); ctx.fillRect(0, fy, W, H - fy);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1.5;
    for (let k = 1; k < 7; k++) { const y = fy + (H - fy) * Math.pow(k / 7, 1.6); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const sp = 110, o3 = this.cam % sp;
    for (let x = -o3 - sp; x < W + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(W / 2 + (x - W / 2) * 1.9, H); ctx.stroke(); }
    ctx.fillStyle = INK; ctx.fillRect(0, fy - 3, W, 7);
    ctx.save(); ctx.translate(-this.cam, 0);
    for (const b of this.bays) {
      if (!b.vis) continue;
      const light = Math.min(b.light, 1) * (0.55 + 0.45 * amb), T = TIERS[b.ship.tier], col = T.rainbow ? '#FFFFFF' : mix(T.col, '#FFFFFF', 0.45);
      const swing = Math.sin(b.swing * 12) * b.swing * b.w * 0.3;
      lamp(ctx, b.cx + swing * 0.15, this.alcTop - 12, 14, light, col);
      spotCone(ctx, b.cx + swing * 0.15, this.alcTop + 2, b.cx + swing, this.shipGy(b), 22, b.w * 0.62, col, light * (this.sel === b.i ? 1 : 0.6) * (1 + b.swing));
      const owned = wallet.owned.has(b.ship.id), picked = wallet.picked === b.ship.id;
      this.drawPadShip(ctx, b.ship, b.S, b.P, t, { owned, picked, light, floorY: fy, H, raise: b.raise, rx: this.shipH * 0.62 });
      const buying = this.buy && this.buy.id === b.ship.id;
      if (!owned || (buying && !this.buy.done)) {
        drawCase(ctx, b.ship.tier, b.cx, this.shipGy(b) + 4, this.shipH * 1.22, this.shipH * 1.32, t, buying ? this.buy.crack : 0);
        if (!buying) padlock(ctx, b.cx, this.shipGy(b) - this.shipH * 0.06, 22 * u);
      }
      if (light < 0.98) { ctx.fillStyle = `rgba(6,4,24,${0.6 * (1 - light)})`; ctx.fillRect(b.x, this.alcTop - 14, b.w, padY - this.alcTop + 40); }
      // the bay's name plate: the name, then a tick or the price, with a bar of rocks saved
      const ny = this.alcTop + 20 * u, nm = b.ship.name, fs = 15 * u, pw = owned ? 22 * u : textW(ctx, String(b.ship.price), fs) + 34 * u;
      const nw = textW(ctx, nm, fs) + 26 * u + pw, flash = this.sel === b.i ? this.flash || 0 : 0;
      rr(ctx, b.cx - nw / 2, ny - 14 * u, nw, 28 * u, 14 * u); ctx.fillStyle = flash > 0 ? mix('#1B1446', CORAL, flash) : 'rgba(27,20,70,.92)'; ctx.fill();
      ctx.lineWidth = this.sel === b.i ? 3.5 : 2.5; ctx.strokeStyle = T.rainbow ? hsl(t * 80, 100, 70) : T.col; ctx.stroke();
      text(ctx, nm, b.cx - pw / 2, ny + 1, fs, { fill: '#FFFFFF', stroke: null });
      if (owned) tickBadge(ctx, b.cx + nw / 2 - 16 * u, ny, 9 * u);
      else {
        const px0 = b.cx + nw / 2 - pw;
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px0, ny - 9 * u); ctx.lineTo(px0, ny + 9 * u); ctx.stroke();
        drawRock(ctx, px0 + 13 * u, ny, 7.5 * u, -0.2);
        text(ctx, String(b.ship.price), px0 + 23 * u, ny + 1, fs, { fill: SUN, stroke: null, align: 'left' });
        const bw = nw * 0.8, k = clamp(wallet.rocks / b.ship.price, 0, 1), by0 = ny + 17 * u;
        rr(ctx, b.cx - bw / 2, by0, bw, 7 * u, 3.5 * u); ctx.fillStyle = 'rgba(27,20,70,.9)'; ctx.fill();
        if (k > 0) { rr(ctx, b.cx - bw / 2, by0, Math.max(7 * u, bw * k), 7 * u, 3.5 * u); ctx.fillStyle = k >= 1 ? MINT : SUN; ctx.fill(); }
        rr(ctx, b.cx - bw / 2, by0, bw, 7 * u, 3.5 * u); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke();
      }
      const sx = b.cx - this.cam;
      this.addHit(`bay:${b.ship.id}`, sx - b.w * 0.42, this.alcTop, b.w * 0.84, padY - this.alcTop + 20 * u, () => this.choose(b.i));
    }
    if (bipAt) drawBipRun(ctx, bipAt, t);
    ctx.restore();
    // the selected ship's banner, the arrows and the big button
    if (this.door.k > 0.95) {
      const ar = 24 * u, ay = padY - this.shipH * 0.55;
      if (this.cam > 4) { circleBtn(ctx, 12 + ar, ay, ar, 'left'); this.addHit('left', 12, ay - ar, ar * 2, ar * 2, () => this.step(-1)); }
      if (this.cam < this.worldW - W - 4) { circleBtn(ctx, W - 12 - ar, ay, ar, 'right'); this.addHit('right', W - 12 - ar * 2, ay - ar, ar * 2, ar * 2, () => this.step(1)); }
      const by = H - 14 - 27 * u;
      if (this.sel != null) {
        const ship = SHIPS[this.sel];
        this.actionButton(ctx, W / 2, by, t);
        const ty = 14 + 23 * u, fs = 24 * u, room = W - 2 * (40 * u + 14) - 150 * u;
        if (room > 120) { tierChip(ctx, ship.tier, W / 2, ty + 22 * u, 12 * u); text(ctx, ship.name, W / 2, ty - 6 * u, fs, { weight: 700 }); }
      } else {
        const label = 'Swipe to look round · tap a ship', fs = 15 * u, tw = textW(ctx, label, fs) + 28 * u;
        rr(ctx, W / 2 - tw / 2, by - 16 * u, tw, 32 * u, 16 * u); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
        text(ctx, label, W / 2, by + 1, fs, { fill: INK, stroke: null });
      }
    }
    const pb = this.bay(wallet.picked);
    this.drawDoor(ctx, padY + 30 * u, { x: pb.cx - this.cam, y: pb.S.y, r: this.shipH * 0.62 }, t);
    this.drawUI(ctx, t);
    this.lastHits = this.hits;
  }
  step(d) {
    const cur = this.sel ?? Math.round(clamp(this.bays.findIndex((b) => b.cx - this.cam > this.W / 2 - b.w / 2), 0, SHIPS.length - 1));
    this.choose(clamp(cur + d, 0, SHIPS.length - 1));
  }
}

class Showroom extends Demo {
  constructor(root) {
    super(root, 'show');
    this.cur = SHIPS.findIndex((s) => s.id === wallet.picked); this.sw = null; this.sinkY = 0; this.swipe = 0;
    this.setSize('sideways');
  }
  layout() {
    const { W, H } = this, up = H > W, u = this.u;
    this.tall = up;
    if (up) { this.cx = W / 2; this.padY = Math.round(H * 0.56); this.shipH = Math.round(Math.min(W * 0.5, H * 0.26)); }
    else { this.cx = Math.round(W * 0.4); this.padY = Math.round(H * 0.7); this.shipH = Math.round(Math.min(H * 0.46, W * 0.26)); }
    this.fy = this.padY - Math.round(this.shipH * 0.12);
    this.S = newState(this.shipH); this.S.idle = true; this.S.dust = '#C9CFF5';
    this.Pship = parts();
    this.sel = this.cur;
    void u;
  }
  get ship() { return SHIPS[this.cur]; }
  onClose() { setTimeout(() => { this.cur = SHIPS.findIndex((s) => s.id === wallet.picked); this.sel = this.cur; this.Pship.clear(); }, 900); }
  showOff() { this.show = 0; }
  wobble() { this.wob = 1; this.flash = 1; }
  swingLights() { this.swing = 1; }
  drag(dx) { this.swipe += dx; }
  dragEnd(vx, total) { if (Math.abs(total) > 50 || Math.abs(vx) > 600) this.switchBy(total < 0 ? 1 : -1); this.swipe = 0; }
  switchBy(d) { const j = clamp(this.cur + d, 0, SHIPS.length - 1); if (j !== this.cur) this.switchTo(j); }
  switchTo(j) {
    if (this.sw || this.buy || this.bip) return;
    this.sw = { from: this.cur, to: j, t: 0 }; sfx('whoosh');
  }
  choose() { super.choose(this.cur); }
  windowOf() { return { x: this.cx, y: this.S.y }; }
  bipFloor() { return this.padY + 6; }
  caseRect() { return { cx: this.cx, gy: this.padY + 4, w: this.shipH * 1.25, hh: this.shipH * 1.34 }; }
  caseCentre() { const c = this.caseRect(); return { x: c.cx, y: c.gy - c.hh * 0.48 }; }
  flyShip(id) { this.startBip({ x: -40, y: this.padY - this.shipH * 0.3, offstage: true }, id); }
  walletChanged() {}
  frame(dt, t) {
    this.T += dt;
    this.stepDoor(dt);
    const S = this.S, ship = this.ship;
    this.swing = Math.max(0, (this.swing || 0) - dt * 0.8); this.wob = Math.max(0, (this.wob || 0) - dt * 2); this.flash = Math.max(0, (this.flash || 0) - dt * 2);
    let sink = 0;
    if (this.sw) {
      const w = this.sw; w.t += dt;
      if (w.t < 0.32) sink = ease.in(w.t / 0.32);
      else {
        if (this.cur !== w.to) {
          this.cur = w.to; this.sel = w.to; this.Pship.clear(); this.S = newState(this.shipH); this.S.idle = true; this.S.dust = '#C9CFF5';
          for (let i = 0; i < 14; i++) this.fx.add({ kind: 'smoke', x: this.cx + rnd(-1, 1) * this.shipH * 0.6, y: this.padY, vx: rnd(-80, 80), vy: rnd(-60, -10), drag: 2, life: 0.8, size: rnd(8, 16), grow: 30, col: '#D8D3F5', a: 0.7 });
        }
        const k = clamp((w.t - 0.32) / 0.45, 0, 1); sink = 1 - ease.back(k);
        if (k >= 1) { this.sw = null; sink = 0; this.showOff(); say(this.ship.name); for (let i = 0; i < 16; i++) this.fx.add({ kind: 'star', x: this.cx + rnd(-0.5, 0.5) * this.shipH, y: this.padY - rnd(0, 1) * this.shipH, vx: rnd(-80, 80), vy: rnd(-120, -20), drag: 2, life: 0.8, size: rnd(4, 9), col: pick([SUN, '#FFFFFF', SKY]), add: true }); }
      }
    }
    this.sinkY = sink * this.shipH * 1.5;
    const Sx = this.S, sh = this.ship;
    let lift = 0;
    if (this.show != null && this.show >= 0) {
      this.show += dt; const u0 = this.show;
      if (u0 < 0.5) { lift = ease.out(u0 / 0.5) * Sx.h * 0.25; Sx.air = true; Sx.thrust = 0.8; Sx.legs = 1 - ease.out(u0 / 0.5) * 0.6; }
      else if (u0 < 0.9) { lift = Sx.h * 0.25 * (1 - ease.inOut((u0 - 0.5) / 0.4)); Sx.thrust = 0.55; Sx.legs = clamp(0.4 + (u0 - 0.5) * 2, 0, 1); }
      else { Sx.legs = 1; landShip(sh, Sx, this.Pship); if (sh.id === 'aurora') Sx.bloom = 1.2; sfx(TOUCH[sh.id]); this.show = -1; }
    } else { Sx.air = false; Sx.thrust = 0; }
    Sx.gy = this.padY; Sx.x = this.cx;
    Sx.y = this.padY - Sx.h * 0.5 - lift + this.sinkY - (calm.on ? 0 : Math.sin(t * 1.6) * Sx.h * 0.015);
    Sx.rot = Math.sin(this.T * 30) * 0.08 * this.wob;
    const bipAt = this.stepBip(dt);
    Sx.pilotIn = wallet.picked === sh.id && !this.bip;
    if (this.bip && this.bip.toId === sh.id) Sx.pilotIn = false;
    tickShip(sh, Sx, this.Pship, dt, t);
    this.Pship.update(dt);
    // dust glinting in the spotlights
    this.moteAcc = (this.moteAcc || 0) + dt * 9 * this.fx.k;
    while (this.moteAcc >= 1) {
      this.moteAcc -= 1;
      this.fx.add({ kind: 'glow', x: this.cx + rnd(-0.75, 0.75) * this.shipH, y: this.padY - rnd(0, 1.7) * this.shipH, vx: rnd(-6, 6), vy: rnd(-18, -4), life: rnd(2, 4), size: rnd(1.2, 2.6), col: '#FFFFFF', a: 0.55, layer: 'back' });
    }
    this.stepBuy(dt);
    this.stepBursts(dt);
    this.fx.update(dt);
    this.draw(t, bipAt);
    void S; void ship;
  }
  draw(t, bipAt) {
    const ctx = this.ctx, { W, H, padY, u, cx } = this, ship = this.ship, T = TIERS[ship.tier];
    ctx.setTransform(this.sc * this.dpr, 0, 0, this.sc * this.dpr, 0, 0);
    this.hits = [];
    const light = this.door.lit >= 0 ? 0.35 + 0.65 * this.amb : 0.5;
    const fy = this.fy;
    tierBack(ctx, ship.tier, 0, 0, W, fy, t, light, this.cur + 1, 0);
    const vg = ctx.createRadialGradient(cx, fy * 0.6, Math.min(W, H) * 0.2, cx, fy * 0.6, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(6,4,24,.65)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, fy);
    ctx.fillStyle = grad(ctx, 0, fy, 0, H, ['#332B7A', '#17113F', '#0B0724']); ctx.fillRect(0, fy, W, H - fy);
    ctx.fillStyle = INK; ctx.fillRect(0, fy - 2, W, 5);
    const col = T.rainbow ? '#FFFFFF' : mix(T.col, '#FFFFFF', 0.45), sweepA = this.swing || 0;
    for (const k of [-1, 1]) {
      const ox = cx + k * W * 0.32, ang = Math.sin(t * 0.7 + k) * 0.25 + Math.sin(sweepA * 12) * sweepA * 0.4;
      spotCone(ctx, ox, -10, cx + Math.sin(ang) * this.shipH * 0.6, padY, 16, this.shipH * 1.2, k < 0 ? col : mix(col, '#B9A7FF', 0.3), light * 0.7);
    }
    spotCone(ctx, cx, -10, cx, padY, 24, this.shipH * 1.5, col, light);
    const owned = wallet.owned.has(ship.id), picked = wallet.picked === ship.id;
    const raise = ship.tier === 'legendary' ? Math.round(this.shipH * 0.1) : 0;
    if (raise) stageSteps(ctx, cx, padY + raise, this.shipH * 2.3, raise, t);
    if (this.sinkY < 1 && light > 0.2) reflection(ctx, ship, this.S, t, fy + 4, H);
    turntable(ctx, cx, padY, this.shipH * 0.72, t, T.rainbow ? '#FFFFFF' : T.col, { owned, picked, rainbow: !!T.rainbow });
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, padY + 2); ctx.clip();
    drawTrail(ctx, ship, this.S, t);
    this.Pship.draw(ctx, 'back');
    drawShip(ctx, ship, this.S, t);
    this.Pship.draw(ctx, 'front');
    ctx.restore();
    const buying = this.buy && this.buy.id === ship.id;
    if (!this.sw && (!owned || (buying && !this.buy.done))) {
      drawCase(ctx, ship.tier, cx, padY + 4, this.shipH * 1.25, this.shipH * 1.34, t, buying ? this.buy.crack : 0);
      if (!buying) padlock(ctx, cx, padY - this.shipH * 0.06, 24 * u);
    }
    if (bipAt) drawBipRun(ctx, bipAt, t);
    this.addHit('ship', cx - this.shipH * 0.6, padY - this.shipH * 1.2, this.shipH * 1.2, this.shipH * 1.25, () => this.choose());
    if (this.door.k > 0.95) {
      // the name, the price and the big button
      let nx, ny, px, py, bx, by;
      if (this.tall) { nx = W / 2; ny = 92 * u; px = W / 2; py = padY + this.shipH * 0.48; bx = W / 2; by = py + (owned ? 0 : 64 * u); }
      else { nx = W * 0.79; ny = H * 0.3; px = nx; py = H * 0.47; bx = nx; by = py + (owned ? 0 : 66 * u); }
      const fs = (this.tall ? 28 : 26) * u;
      text(ctx, ship.name, nx, ny, fs, { weight: 700 });
      tierChip(ctx, ship.tier, nx, ny + fs * 1.05, 13 * u);
      if (!owned) pricePlate(ctx, px, py, ship.price, wallet.rocks, u, this.flash || 0);
      this.actionButton(ctx, bx, by, t);
      // arrows, and the badges for every ship
      const ar = 24 * u, ay = padY - this.shipH * 0.55, lx = 12 + ar, rx2 = this.tall ? W - 12 - ar : W * 0.62;
      if (this.cur > 0) { circleBtn(ctx, lx, ay, ar, 'left'); this.addHit('left', lx - ar, ay - ar, ar * 2, ar * 2, () => this.switchBy(-1)); }
      if (this.cur < SHIPS.length - 1) { circleBtn(ctx, rx2, ay, ar, 'right'); this.addHit('right', rx2 - ar, ay - ar, ar * 2, ar * 2, () => this.switchBy(1)); }
      const n = SHIPS.length, r = (this.tall ? 18 : 19) * u, gap = Math.min((W - 30) / n, r * 2.7), y0 = H - r - 16 * u;
      SHIPS.forEach((s, i) => {
        const x = W / 2 + (i - (n - 1) / 2) * gap, cur = i === this.cur, rr0 = r * (cur ? 1.18 : 1), Tt = TIERS[s.tier];
        ctx.beginPath(); ctx.arc(x, y0 + 3, rr0, 0, TAU); ctx.fillStyle = 'rgba(10,6,40,.5)'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y0, rr0, 0, TAU); ctx.fillStyle = cur ? '#3A3290' : '#241C66'; ctx.fill();
        ctx.lineWidth = cur ? 4 : 3; ctx.strokeStyle = Tt.rainbow ? hsl(t * 80 + i * 20, 100, 70) : Tt.col; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(x, y0, rr0 - 2, 0, TAU); ctx.clip();
        const mini = newState(rr0 * 1.5); mini.x = x; mini.y = y0 + rr0 * 0.15; mini.legs = 0; mini.pilotIn = wallet.picked === s.id; mini.open = s.id === 'phoenix' ? 0.2 : 0;
        drawShip(ctx, s, mini, 0);
        ctx.restore();
        if (!wallet.owned.has(s.id)) padlock(ctx, x + rr0 * 0.62, y0 + rr0 * 0.55, rr0 * 0.62);
        else tickBadge(ctx, x + rr0 * 0.68, y0 + rr0 * 0.6, rr0 * 0.36);
        this.addHit(`badge:${s.id}`, x - rr0, y0 - rr0, rr0 * 2, rr0 * 2, () => this.switchTo(i));
      });
    }
    this.drawDoor(ctx, this.padY + 28 * u, { x: cx, y: this.S.y - this.sinkY, r: this.shipH * 0.66 }, t);
    this.drawUI(ctx, t);
    this.lastHits = this.hits;
  }
}

// ---------- the page ----------

function el(tag, attrs = {}, kids = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }
  kids.forEach((k) => e.appendChild(k));
  return e;
}

function start() {
  calm.on = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const widgets = [];
  const cardsRoot = document.getElementById('ships');
  const cards = SHIPS.map((s, i) => new Card(cardsRoot, s, i));
  widgets.push(...cards);
  const hall = new Hall(document.getElementById('hall'));
  const show = new Showroom(document.getElementById('show'));
  widgets.push(hall, show);
  // device size buttons under each hangar
  for (const [id, demo] of [['hall-sizes', hall], ['show-sizes', show]]) {
    const box = document.getElementById(id);
    Object.entries(DEVICES).forEach(([k, d]) => {
      const b = el('button', { type: 'button', 'aria-pressed': String(k === demo.size), text: d.label, onclick: () => { demo.setSize(k); box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); } });
      box.appendChild(b);
    });
  }
  // the bar: pretend moon rocks, sound and motion
  const bar = document.getElementById('bar');
  const rocksOut = el('output', { class: 'rocksnow', 'aria-live': 'polite' });
  const setRocks = (n) => { wallet.rocks = Math.max(0, n); notify(); };
  const rocksBox = el('div', { class: 'grp' }, [el('span', { class: 'lbl', text: 'Pretend moon rocks:' }), rocksOut]);
  [0, 25, 75, 250, 610].forEach((n) => rocksBox.appendChild(el('button', { type: 'button', text: String(n), onclick: () => setRocks(n) })));
  rocksBox.appendChild(el('button', { type: 'button', text: '+10', onclick: () => setRocks(wallet.rocks + 10) }));
  rocksBox.appendChild(el('button', { type: 'button', text: 'Lock all ships again', onclick: () => { wallet.owned = new Set(['classic']); wallet.picked = 'classic'; notify(); hall.focus('classic', true); show.cur = 0; show.sel = 0; } }));
  const soundBtn = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Sound on', onclick: () => { muted = !muted; setMuted(muted); soundBtn.textContent = muted ? 'Sound off' : 'Sound on'; soundBtn.setAttribute('aria-pressed', String(!muted)); if (!muted) ac(); } });
  const calmBtn = el('button', { type: 'button', 'aria-pressed': String(calm.on), text: calm.on ? 'Less motion: on' : 'Less motion: off', onclick: () => { calm.on = !calm.on; allParts.forEach((p) => { p.k = calm.on ? 0.35 : 1; }); cards.forEach((c) => { c.scene.calm = calm.on; }); calmBtn.textContent = calm.on ? 'Less motion: on' : 'Less motion: off'; calmBtn.setAttribute('aria-pressed', String(calm.on)); } });
  bar.append(rocksBox, el('div', { class: 'grp' }, [soundBtn, calmBtn]));
  const showRocks = () => { rocksOut.textContent = `${wallet.rocks} · own ${wallet.owned.size} of ${SHIPS.length}`; };
  listeners.push(showRocks); showRocks();
  // only animate what's on screen
  const io = new IntersectionObserver((es) => es.forEach((e) => { const w = widgets.find((x) => x.canvas === e.target); if (w) w.visible = e.isIntersecting; }), { rootMargin: '80px' });
  widgets.forEach((w) => io.observe(w.canvas));
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { cards.forEach((c) => c.resize()); hall.fit(); show.fit(); }, 150); });
  const perf = new Map();
  let last = performance.now();
  const t0 = last;
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const t = (now - t0) / 1000;
    for (const w of widgets) {
      if (!w.visible) continue;
      const a = performance.now();
      try { w.frame(dt, t); } catch (err) { console.error(err); w.visible = false; }
      const ms = performance.now() - a, key = w.kind || `card:${w.ship.id}`;
      const arr = perf.get(key) || []; arr.push(ms); if (arr.length > 240) arr.shift(); perf.set(key, arr);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__mock = {
    ready: true, wallet, hall, show, cards, setRocks,
    perf() { const out = {}; for (const [k, a] of perf) { const s = [...a].sort((x, y) => x - y); out[k] = { n: s.length, median: s[Math.floor(s.length / 2)] || 0, p95: s[Math.floor(s.length * 0.95)] || 0 }; } return out; },
    resetPerf() { perf.clear(); },
  };
}

const go = () => { if (document.fonts && document.fonts.load) Promise.all(['500 16px Fredoka', '600 16px Fredoka', '700 16px Fredoka'].map((f) => document.fonts.load(f))).catch(() => null).then(start); else start(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
