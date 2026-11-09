// The rocket games' hangar (D-026, D-029, D-045, D-046, D-050 to D-053): the showroom behind the
// hangar door on the start card, where a child looks round the ships, buys one with moon rocks
// and picks the one to fly. Version 1.1. All original and drawn in code (D-010).
//
// Changes at v1.1 (step 2a-4c): the ship on the turntable is told when the device asks for less
// motion (S.calm), so the Golden Phoenix's wings and the Aurora Cruiser's ribbons keep still.
// Version 1.0 was step 2a-4b's.
//
// Moved from the accepted mock-up page (tools/tests/games/sketch_rocket_hangar.js 1.0, D-050):
// its drawing helpers are copied unchanged (all but the hall's lamp), and its Demo and Showroom
// are joined into one Hangar below, with the pretend wallet replaced by the tile's progress and
// fleet.js's rules for buying and picking. Sounds are sound.js's, through the game.

import { SHIPS, SHIP_BY_ID, TIERS, Parts, newState, tickShip, landShip, drawShip, drawTrail, glow, star5 } from './ships.js';
import { drawPilot, drawFirework, drawRock, rr, rgba, mix, clamp, lerp, ease, sparkle, rng, INK, FONT } from './scene.js';
import { verdict, shortOf } from './fleet.js';

const TAU = Math.PI * 2;
const SUN = '#FFC93C';
const MINT = '#5FE3BD';
const CORAL = '#FF5D73';
const SKY = '#8CF5FF';
const FELT = ['#3D6CF0', '#FF5D73', '#2FB892', '#9B5DE5', '#FFB020'];

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

// ---------- the showroom ----------

const BURST_AT = [{ x: 0.2, y: 0.24, r: 0.2, n: 18, turn: 0.1 }, { x: 0.8, y: 0.28, r: 0.22, n: 18, turn: 0 }, { x: 0.5, y: 0.16, r: 0.16, n: 16, turn: 0.3 }, { x: 0.33, y: 0.1, r: 0.15, n: 16, turn: 0.2 }, { x: 0.68, y: 0.12, r: 0.17, n: 16, turn: 0.5 }];
const FANFARE = { fun: 'yay', cool: 'levelup', premium: 'unlock', legendary: 'fanLegend' };

// The showroom (D-050), as on the accepted mock-up page (sketch_rocket_hangar.js 1.0's Demo and
// Showroom, joined into one): a full-screen canvas over the stage, entered through the hangar
// door on the start card (D-052). The game hands in io:
//   progress()   the tile's progress now (ship, ships, rocks);
//   buy(id)      buys a ship through fleet.js and keeps the progress; true if bought;
//   pick(id)     flies an owned ship and keeps the progress; true if picked;
//   sfx(name), say(text)   sounds and words, already muted or not as the game is;
//   calm()       true when the device asks for less motion;
//   closed()     called once the door has shut again, to show the start card.
export class Hangar {
  constructor(stage, io) {
    this.io = io; this.stage = stage;
    const c = document.createElement('canvas');
    c.id = 'hangar-room'; c.className = 'hangar-room'; c.hidden = true;
    c.setAttribute('role', 'application');
    c.setAttribute('aria-label', 'The hangar: one ship at a time. Arrows or a swipe change ship; the big button buys or flies it; the back button shuts the door.');
    stage.appendChild(c);
    this.canvas = c; this.ctx = c.getContext('2d');
    this.fx = new Parts(); this.Pship = new Parts();
    this.isOpen = false; this.closing = false; this.calm = false;
    this.T = 0; this.door = { k: 0, to: 0, lit: -1 }; this.amb = 0;
    this.cur = 0; this.sel = 0; this.sw = null; this.sinkY = 0; this.swipe = 0;
    this.buy = null; this.bip = null; this.flying = []; this.counterOff = 0; this.bursts = []; this.hits = []; this.lastHits = [];
    this.press = null; this.bump = 0; this.counterAt = { x: 0, y: 0 }; this.show = null;
    // pointer handlers are named onDown, onMove and onUp: a field called down, move or up
    // would hide them (the mock-up's lesson, handoff)
    c.addEventListener('pointerdown', (e) => this.onDown(e));
    c.addEventListener('pointermove', (e) => this.onMove(e));
    c.addEventListener('pointerup', (e) => this.onUp(e));
    c.addEventListener('pointercancel', () => { this.press = null; });
    c.style.touchAction = 'none';
    addEventListener('keydown', (e) => {
      if (!this.isOpen || this.door.k < 0.95) return;
      const k = { ArrowLeft: () => this.switchBy(-1), ArrowRight: () => this.switchBy(1), Enter: () => this.action(), ' ': () => this.action(), Escape: () => this.close() }[e.key];
      if (k) { e.preventDefault(); k(); }
    });
  }

  // ---------- opening and closing ----------

  open() {
    if (this.isOpen && !this.closing) return false;
    this.isOpen = true; this.closing = false;
    this.calm = !!this.io.calm();
    this.fx.k = this.Pship.k = this.calm ? 0.35 : 1;
    this.fx.clear(); this.Pship.clear();
    this.canvas.hidden = false;
    this.cur = Math.max(0, SHIPS.findIndex((s) => s.id === this.io.progress().ship)); this.sel = this.cur;
    this.sw = null; this.buy = null; this.bip = null; this.flying = []; this.bursts = []; this.counterOff = 0; this.show = null;
    this.door = { k: 0, to: 1, lit: -1 };
    this.resize();
    this.io.sfx('rumble');
    return true;
  }

  close() {
    if (!this.isOpen || this.closing || this.buy || this.bip) return false;
    this.closing = true; this.door.to = 0; this.io.sfx('rumble');
    return true;
  }

  resize() {
    if (!this.isOpen) return;
    const W = Math.max(1, this.stage.clientWidth), H = Math.max(1, this.stage.clientHeight);
    this.W = W; this.H = H; this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(W * this.dpr); this.canvas.height = Math.round(H * this.dpr);
    this.u = clamp(Math.min(W, H) / 390, 0.95, 1.45);
    const up = H > W;
    this.tall = up;
    if (up) { this.cx = W / 2; this.padY = Math.round(H * 0.56); this.shipH = Math.round(Math.min(W * 0.5, H * 0.26)); }
    else { this.cx = Math.round(W * 0.4); this.padY = Math.round(H * 0.7); this.shipH = Math.round(Math.min(H * 0.46, W * 0.26)); }
    this.fy = this.padY - Math.round(this.shipH * 0.12);
    this.S = newState(this.shipH); this.S.idle = true; this.S.dust = '#C9CFF5';
  }

  get ship() { return SHIPS[this.cur]; }
  owned(id) { return this.io.progress().ships.includes(id); }
  // a ship being bought still shows behind its glass until the glass breaks
  ownedShown(id) { return this.owned(id) && !(this.buy && this.buy.id === id && !this.buy.done); }

  // ---------- input ----------

  local(e) { const r = this.canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) * this.W) / r.width, y: ((e.clientY - r.top) * this.H) / r.height }; }
  onDown(e) { const p = this.local(e); this.press = { x0: p.x, y0: p.y, x: p.x, drag: false, vx: 0, lastT: performance.now() }; try { this.canvas.setPointerCapture(e.pointerId); } catch { /* fine */ } }
  onMove(e) {
    const pr = this.press; if (!pr) return;
    const p = this.local(e), dx = p.x - pr.x;
    if (!pr.drag && Math.abs(p.x - pr.x0) > 12 && this.door.k > 0.95) pr.drag = true;
    if (pr.drag) { const now = performance.now(); this.swipe += dx; pr.vx = (dx / Math.max(8, now - pr.lastT)) * 1000; pr.lastT = now; }
    pr.x = p.x;
  }
  onUp(e) {
    const pr = this.press; this.press = null; if (!pr) return;
    const p = this.local(e);
    if (pr.drag) { const total = p.x - pr.x0; if (Math.abs(total) > 50 || Math.abs(pr.vx) > 600) this.switchBy(total < 0 ? 1 : -1); this.swipe = 0; }
    else this.tap(p.x, p.y);
  }
  hit(x, y) { for (let i = this.lastHits.length - 1; i >= 0; i--) { const h = this.lastHits[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h; } return null; }
  addHit(id, x, y, w, h, fn) { this.hits.push({ id, x, y, w, h, fn }); }
  tap(x, y) { if (this.door.k < 0.95 || this.closing) return; const h = this.hit(x, y); if (h) h.fn(); }
  // Where a button is on the page, for the tests' real taps: its middle in page pixels.
  hitPoint(id) {
    const h = this.lastHits.find((x) => x.id === id);
    if (!h || !this.isOpen) return null;
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((h.x + h.w / 2) * r.width) / this.W, y: r.top + ((h.y + h.h / 2) * r.height) / this.H };
  }

  // ---------- choosing, buying and flying ----------

  switchBy(d) { const j = clamp(this.cur + d, 0, SHIPS.length - 1); if (j !== this.cur) this.switchTo(j); }
  switchTo(j) {
    if (this.sw || this.buy || this.bip || j === this.cur) return;
    this.sw = { from: this.cur, to: j, t: 0 }; this.io.sfx('whoosh');
  }
  showOff() { this.show = 0; }
  wobble() { this.wob = 1; this.flash = 1; }
  // A tap on the ship: show it off, and say what's next.
  choose() {
    const ship = this.ship, v = verdict(this.io.progress(), ship.id);
    this.sel = this.cur; this.showOff(); this.io.sfx('tap');
    if (v === 'need') { this.wobble(); this.io.sfx('boop'); this.io.say(`${ship.name}. You need ${shortOf(this.io.progress(), ship.id)} more moon rocks.`); }
    else if (v === 'soon') { this.wobble(); this.io.say(`${ship.name}. Coming soon!`); }
    else this.io.say(ship.name);
  }
  action() {
    if (this.buy || this.bip || this.sw || this.closing) return;
    const ship = this.ship, v = verdict(this.io.progress(), ship.id);
    if (v === 'fly') { this.io.sfx('tap'); this.flyShip(ship.id); }
    else if (v === 'buy') this.startBuy(ship.id);
    else if (v === 'need') { this.wobble(); this.io.sfx('boop'); this.io.say(`You need ${shortOf(this.io.progress(), ship.id)} more moon rocks.`); }
    else if (v === 'soon') { this.wobble(); this.io.sfx('boop'); this.io.say('Coming soon!'); }
  }
  startBuy(id) {
    const ship = SHIP_BY_ID[id];
    if (!this.io.buy(id)) return;
    this.counterOff = ship.price;
    const n = clamp(Math.round(ship.price / 12), 5, 16);
    this.buy = { id, t: 0, n, per: ship.price / n, arrived: 0, crackAt: 0.07 * (n - 1) + 0.78, crack: 0, done: false };
    for (let i = 0; i < n; i++) this.flying.push({ t: -i * 0.07, dur: 0.75, x0: this.counterAt.x, y0: this.counterAt.y, id, done: false });
    this.io.sfx('whoosh');
  }
  stepBuy(dt) {
    for (const r of this.flying) {
      r.t += dt;
      if (r.t >= r.dur && !r.done) {
        r.done = true; this.counterOff = Math.max(0, this.counterOff - (this.buy ? this.buy.per : 0)); this.bump = 1;
        if (this.buy) this.buy.arrived += 1;
        const p = this.caseCentre();
        for (let i = 0; i < 5; i++) this.fx.add({ kind: 'star', x: p.x, y: p.y, vx: rnd(-90, 90), vy: rnd(-90, 60), drag: 2, life: 0.5, size: rnd(4, 8), col: pick(['#FFFFFF', SUN]), add: true });
        if (this.buy && this.buy.arrived % 2 === 1) this.io.sfx('coin');
      }
    }
    this.flying = this.flying.filter((r) => !r.done);
    const b = this.buy; if (!b) return;
    b.t += dt;
    const ship = SHIP_BY_ID[b.id];
    if (b.t >= b.crackAt && b.crack === 0) { b.crack = 0.01; this.io.sfx('crack'); }
    if (b.crack > 0 && !b.done) b.crack = Math.min(1, b.crack + dt / 0.35);
    if (b.crack >= 1 && !b.done) {
      b.done = true; b.doneAt = b.t; this.counterOff = 0;
      const c = this.caseRect();
      shatterCase(this.fx, ship.tier, c.cx, c.gy, c.w, c.hh);
      this.io.sfx('shatter'); setTimeout(() => this.io.sfx(FANFARE[ship.tier] || 'yay'), 180);
      confettiRain(this.fx, this.W, ship.tier === 'legendary' ? 170 : ship.tier === 'premium' ? 120 : 80, ship.conf);
      this.swing = 1;
      if (ship.tier === 'legendary' || ship.tier === 'premium') {
        const n = ship.tier === 'legendary' ? 5 : 3;
        for (let i = 0; i < (this.calm ? 1 : n); i++) this.bursts.push({ ...BURST_AT[i], cols: ship.fw[i % ship.fw.length], k: 0, a: 1, age: -i * 0.3 });
      }
      this.showOff();
      this.io.say(`${ship.name} is yours!`);
    }
    if (b.done && b.t - b.doneAt > 1.5) { this.buy = null; this.flyShip(b.id); }
  }
  stepBursts(dt) {
    for (const b of this.bursts) { b.age += dt; const a = Math.max(0, b.age); b.k = ease.out(clamp(a / 0.8, 0, 1)); b.a = b.age < 0 ? 0 : 1 - clamp((a - 0.9) / 0.9, 0, 1); }
    this.bursts = this.bursts.filter((b) => b.age < 2);
  }
  windowOf() { return { x: this.cx, y: this.S.y }; }
  bipFloor() { return this.padY + 6; }
  caseRect() { return { cx: this.cx, gy: this.padY + 4, w: this.shipH * 1.25, hh: this.shipH * 1.34 }; }
  caseCentre() { const c = this.caseRect(); return { x: c.cx, y: c.gy - c.hh * 0.48 }; }
  // Bip runs in from the side and climbs aboard; then the ship is the one flown.
  flyShip(id) { this.bip = { t: 0, from: { x: -40, y: this.padY - this.shipH * 0.3, offstage: true }, toId: id }; this.io.sfx('pop'); }
  stepBip(dt) {
    const B = this.bip; if (!B) return null;
    B.t += dt;
    const to = this.windowOf(), s = this.shipH * 0.5, floor = this.bipFloor();
    const dir = Math.sign(to.x - B.from.x) || 1;
    const fA = { x: B.from.x + dir * this.shipH * 0.42, y: floor }, fB = { x: to.x - dir * this.shipH * 0.45, y: floor };
    const dA = B.from.offstage ? 0 : 0.42, dRun = clamp(Math.abs(fB.x - fA.x) / 900, 0.25, 1.1), dC = 0.42;
    let x, y, run = false, squash = 0;
    if (B.t < dA) { const k = B.t / dA; x = lerp(B.from.x, fA.x, k); y = lerp(B.from.y + s * 0.6, floor, k) - Math.sin(k * Math.PI) * s * 0.8; }
    else if (B.t < dA + dRun) { const k = (B.t - dA) / dRun; x = lerp(fA.x, fB.x, ease.inOut(k)); y = floor - Math.abs(Math.sin(k * Math.PI * 5)) * s * 0.12; run = true; }
    else if (B.t < dA + dRun + dC) { const k = (B.t - dA - dRun) / dC; x = lerp(fB.x, to.x, k); y = lerp(floor, to.y + s * 0.6, k) - Math.sin(k * Math.PI) * s * 0.9; squash = k > 0.85 ? 0.15 : 0; }
    else {
      this.io.pick(B.toId); this.bip = null;
      for (let i = 0; i < Math.round(16 * this.Pship.k) + 4; i++) this.fx.add({ kind: 'star', x: to.x, y: to.y, vx: rnd(-140, 140), vy: rnd(-160, 40), drag: 2.2, g: 120, life: rnd(0.5, 0.9), size: rnd(4, 9), col: pick([SUN, '#FFFFFF', MINT]), add: true });
      this.io.sfx('sparkle'); return null;
    }
    return { x, y, s, flip: dir < 0, run, squash };
  }
  stepDoor(dt) {
    const d = this.door, was = d.k;
    d.k = clamp(d.k + dt * (d.to ? (this.calm ? 1.6 : 0.95) : -(this.calm ? 2 : 1.2)), 0, 1);
    if (d.k >= 1 && was < 1) { d.lit = this.T; this.io.sfx('clunk'); }
    if (d.k <= 0) d.lit = -1;
    this.amb = d.lit >= 0 ? clamp((this.T - d.lit) / 0.5, 0, 1) : 0;
  }

  // ---------- each frame ----------

  frame(dt, t) {
    if (!this.isOpen) return;
    this.T += dt;
    this.stepDoor(dt);
    if (this.closing && this.door.k <= 0) {
      this.isOpen = false; this.closing = false; this.canvas.hidden = true; this.fx.clear(); this.Pship.clear();
      this.io.closed();
      return;
    }
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
        if (k >= 1) {
          this.sw = null; sink = 0; this.showOff(); this.io.say(this.ship.name);
          for (let i = 0; i < 16; i++) this.fx.add({ kind: 'star', x: this.cx + rnd(-0.5, 0.5) * this.shipH, y: this.padY - rnd(0, 1) * this.shipH, vx: rnd(-80, 80), vy: rnd(-120, -20), drag: 2, life: 0.8, size: rnd(4, 9), col: pick([SUN, '#FFFFFF', SKY]), add: true });
        }
      }
    }
    this.sinkY = sink * this.shipH * 1.5;
    const Sx = this.S, sh = this.ship;
    let lift = 0;
    if (this.show != null && this.show >= 0) {
      this.show += dt; const u0 = this.show;
      if (u0 < 0.5) { lift = ease.out(u0 / 0.5) * Sx.h * 0.25; Sx.air = true; Sx.thrust = 0.8; Sx.legs = 1 - ease.out(u0 / 0.5) * 0.6; }
      else if (u0 < 0.9) { lift = Sx.h * 0.25 * (1 - ease.inOut((u0 - 0.5) / 0.4)); Sx.thrust = 0.55; Sx.legs = clamp(0.4 + (u0 - 0.5) * 2, 0, 1); }
      else { Sx.legs = 1; landShip(sh, Sx, this.Pship); if (sh.id === 'aurora') Sx.bloom = 1.2; this.io.sfx(sh.sound); this.show = -1; }
    } else { Sx.air = false; Sx.thrust = 0; }
    Sx.gy = this.padY; Sx.x = this.cx;
    Sx.y = this.padY - Sx.h * 0.5 - lift + this.sinkY - (this.calm ? 0 : Math.sin(t * 1.6) * Sx.h * 0.015);
    Sx.rot = Math.sin(this.T * 30) * 0.08 * (this.wob || 0);
    const bipAt = this.stepBip(dt);
    Sx.pilotIn = this.io.progress().ship === sh.id && !this.bip;
    if (this.bip && this.bip.toId === sh.id) Sx.pilotIn = false;
    Sx.calm = this.calm;
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
  }

  draw(t, bipAt) {
    const ctx = this.ctx, { W, H, padY, u, cx } = this, ship = this.ship, T = TIERS[ship.tier], prog = this.io.progress();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
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
    const owned = this.ownedShown(ship.id), picked = prog.ship === ship.id;
    const raise = ship.tier === 'legendary' ? Math.round(this.shipH * 0.1) : 0;
    if (raise) stageSteps(ctx, cx, padY + raise, this.shipH * 2.3, raise, t);
    if (this.sinkY < 1 && light > 0.2) reflection(ctx, ship, this.S, t, fy + 4, H);
    turntable(ctx, cx, padY, this.shipH * 0.72, t, T.rainbow ? '#FFFFFF' : T.col, { owned, picked, rainbow: !!T.rainbow, spin: this.calm ? 0.3 : 1 });
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, padY + 2); ctx.clip();
    drawTrail(ctx, ship, this.S, t);
    this.Pship.draw(ctx, 'back');
    drawShip(ctx, ship, this.S, t);
    this.Pship.draw(ctx, 'front');
    ctx.restore();
    const buying = this.buy && this.buy.id === ship.id;
    if (!this.sw && !owned) {
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
      if (!owned) pricePlate(ctx, px, py, ship.price, prog.rocks, u, this.flash || 0);
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
        const mini = newState(rr0 * 1.5); mini.x = x; mini.y = y0 + rr0 * 0.15; mini.legs = 0; mini.pilotIn = prog.ship === s.id; mini.open = s.id === 'phoenix' ? 0.2 : 0;
        drawShip(ctx, s, mini, 0);
        ctx.restore();
        if (!this.ownedShown(s.id)) padlock(ctx, x + rr0 * 0.62, y0 + rr0 * 0.55, rr0 * 0.62);
        else tickBadge(ctx, x + rr0 * 0.68, y0 + rr0 * 0.6, rr0 * 0.36);
        this.addHit(`badge:${s.id}`, x - rr0, y0 - rr0, rr0 * 2, rr0 * 2, () => this.switchTo(i));
      });
    }
    this.drawDoor(ctx, this.padY + 28 * u, { x: cx, y: this.S.y - this.sinkY, r: this.shipH * 0.66 }, t);
    this.drawUI(ctx, t);
    this.lastHits = this.hits;
  }

  drawUI(ctx, t) {
    const u = this.u, W = this.W, r = 26 * u;
    if (this.door.k > 0.95 && !this.closing) { circleBtn(ctx, 14 + r, 14 + r, r, 'back'); this.addHit('back', 14, 14, r * 2, r * 2, () => this.close()); }
    this.bump = Math.max(0, this.bump - 0.08);
    this.counterAt = rockCounter(ctx, W - 14, 14 + 23 * u, this.io.progress().rocks + Math.round(this.counterOff), u, this.bump);
    for (const b of this.bursts) drawFirework(ctx, b, this.W, this.H);
    this.fx.draw(ctx, 'back'); this.fx.draw(ctx, 'front');
    for (const r0 of this.flying) {
      if (r0.t < 0) continue;
      const p = this.caseCentre(), k = ease.inOut(clamp(r0.t / r0.dur, 0, 1));
      const x = lerp(r0.x0, p.x, k), y = lerp(r0.y0, p.y, k) - Math.sin(k * Math.PI) * 80;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFFFFF';
      for (let i = 1; i < 4; i++) { ctx.globalAlpha = 0.5 - i * 0.12; sparkle(ctx, x - (p.x - r0.x0) * 0.03 * i, y - (p.y - r0.y0) * 0.03 * i, 6 - i); }
      ctx.restore();
      drawRock(ctx, x, y, lerp(15, 11, k), r0.t * 7);
    }
  }

  actionButton(ctx, x, y, t) {
    const u = this.u, ship = this.ship, prog = this.io.progress(), v = verdict(prog, ship.id);
    let label, fill = SUN, dim = false, rock = false;
    if (this.buy && this.buy.id === ship.id) { label = 'Unlocking…'; dim = true; }
    else if (this.bip && this.bip.toId === ship.id) { label = 'Climbing in…'; fill = '#FFFFFF'; dim = true; }
    else if (v === 'flying') { label = 'Flying this one'; fill = '#FFFFFF'; dim = true; }
    else if (v === 'fly') { label = 'Fly this one'; fill = MINT; }
    else if (v === 'buy') { label = `Buy  ${ship.price}`; rock = true; }
    else if (v === 'need') { label = `Need ${shortOf(prog, ship.id)} more`; fill = '#B9B3E6'; dim = true; rock = true; }
    else { label = 'Coming soon'; fill = '#B9B3E6'; dim = true; }
    const h = 54 * u, w = Math.max(200 * u, textW(ctx, label, h * 0.44) + h * (rock ? 1.9 : 1.2));
    const breathe = !dim && !this.calm ? 1 + 0.03 * Math.sin(t * 4.2) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(breathe, breathe); ctx.translate(-x, -y);
    button(ctx, x, y, w, h, fill, { dim });
    const tx = rock ? x + h * 0.3 : x;
    if (rock) drawRock(ctx, x - w / 2 + h * 0.62, y, h * 0.26, -0.2);
    text(ctx, label, tx, y + 1, h * 0.42, { fill: INK, stroke: null });
    ctx.restore();
    this.addHit('action', x - w / 2, y - h / 2, w, h, () => this.action());
  }

  // The showroom's own big door: it rolls up as you come in, and down as you leave.
  drawDoor(ctx, bottom, porthole, t) {
    const k = ease.inOut(this.door.k);
    if (k >= 0.999) return;
    const W = this.W, u = this.u, gap = 12 * u, edge = lerp(bottom - gap, -20, k), lift = (bottom - gap) - edge;
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
  }

  state() {
    const id = this.ship ? this.ship.id : null;
    return { open: this.isOpen, closing: this.closing, door: this.door.k, cur: id, verdict: id ? verdict(this.io.progress(), id) : null,
      buying: !!this.buy, bip: !!this.bip, switching: !!this.sw, calm: this.calm };
  }
}
