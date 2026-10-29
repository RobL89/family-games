// The worm: a head that always moves forward and steers, and a body that follows its trail.
// paintWorm() draws any pose, so the start card, wardrobe and end card reuse it.

import { INK, FONT, drawHat } from './art.js';

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

const HEAD = hex('#FF6F9C');
const TAIL = hex('#FFAA3B');
const BAND = hex('#FFE36E');
const WHITE = [255, 255, 255];
const DARK = hex('#7A2346');

const paletteCache = new Map();
// Colours for each segment: pink at the head to orange at the tail, with a sunny band every third segment.
function palette(n) {
  let p = paletteCache.get(n);
  if (p) return p;
  p = [];
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    let c = mix(HEAD, TAIL, Math.pow(t, 0.8));
    if (i > 0 && i % 3 === 0) c = mix(c, BAND, 0.62);
    p.push({ c: css(c), hi: css(mix(c, WHITE, 0.5)), lo: css(mix(c, DARK, 0.28)) });
  }
  if (paletteCache.size > 60) paletteCache.clear();
  paletteCache.set(n, p);
  return p;
}

function eye(ctx, x, y, er, px, py, lw, state) {
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  if (state === 'blink' || state === 'happy') {
    ctx.beginPath();
    if (state === 'happy') ctx.arc(x, y + er * 0.25, er * 0.62, Math.PI * 1.12, Math.PI * 1.88);
    else { ctx.moveTo(x - er * 0.7, y + er * 0.1); ctx.quadraticCurveTo(x, y + er * 0.5, x + er * 0.7, y + er * 0.1); }
    ctx.lineWidth = lw * 1.3;
    ctx.stroke();
    return;
  }
  if (state === 'hicL' || state === 'hicR') {
    const s = state === 'hicL' ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x - s * er * 0.55, y - er * 0.45);
    ctx.lineTo(x + s * er * 0.45, y);
    ctx.lineTo(x - s * er * 0.55, y + er * 0.45);
    ctx.lineWidth = lw * 1.3;
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.arc(x, y, er, 0, TAU);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.stroke();
  const pr = er * 0.52;
  ctx.beginPath();
  ctx.arc(x + px, y + py, pr, 0, TAU);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + px - pr * 0.35, y + py - pr * 0.38, pr * 0.32, 0, TAU);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

/**
 * Draws a worm. segs: head first, each { x, y, r }.
 * o: { dir: {x,y} heading, look: {x,y} pupils (in eye radii, up to 1), mood, blink, hat, sx, sy (head squash),
 *      shadow: true, mouth: 0..1 open, mono }
 */
export function paintWorm(ctx, segs, o = {}) {
  const n = segs.length;
  if (!n) return;
  const pal = palette(n);
  const head = segs[0];
  const R = head.r;
  const lw = Math.max(2.5, R * 0.14);
  const dir = o.dir || { x: 0, y: 1 };

  // Soft shadow on the lawn (one path, so overlaps don't darken).
  if (o.shadow !== false) {
    ctx.beginPath();
    const ox = R * 0.22, oy = R * 0.36;
    for (let i = 0; i < n; i++) {
      const s = segs[i];
      ctx.moveTo(s.x + ox + s.r * 1.05, s.y + oy);
      ctx.arc(s.x + ox, s.y + oy, s.r * 1.05, 0, TAU);
    }
    ctx.fillStyle = 'rgba(30,80,20,.22)';
    ctx.fill();
  }

  // One chunky outline around the whole body.
  ctx.beginPath();
  for (let i = 1; i < n; i++) {
    const s = segs[i];
    ctx.moveTo(s.x + s.r + lw, s.y);
    ctx.arc(s.x, s.y, s.r + lw, 0, TAU);
  }
  ctx.fillStyle = INK;
  ctx.fill();

  // Body segments, tail first so each one tucks under the one in front.
  for (let i = n - 1; i >= 1; i--) {
    const s = segs[i];
    const p = pal[i];
    const g = ctx.createRadialGradient(s.x - s.r * 0.38, s.y - s.r * 0.45, s.r * 0.1, s.x, s.y, s.r * 1.02);
    g.addColorStop(0, p.hi);
    g.addColorStop(0.5, p.c);
    g.addColorStop(1, p.lo);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, lw * 0.4);
    ctx.strokeStyle = 'rgba(122,35,70,.38)';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s.x - s.r * 0.36, s.y - s.r * 0.42, s.r * 0.26, s.r * 0.14, -0.7, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fill();
  }

  // Head, with squash and stretch along its heading.
  const a = Math.atan2(dir.y, dir.x);
  const sx = o.sx || 1, sy = o.sy || 1;
  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(a);
  ctx.scale(sx, sy);
  ctx.beginPath();
  ctx.arc(0, 0, R + lw, 0, TAU);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.rotate(-a);
  const hp = pal[0];
  const g = ctx.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.1, 0, 0, R * 1.02);
  g.addColorStop(0, hp.hi);
  g.addColorStop(0.55, hp.c);
  g.addColorStop(1, hp.lo);
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  // The face stays upright, nudged towards where the worm is going.
  const squashY = sy / sx;
  const fx = head.x + dir.x * R * 0.16;
  const fy = head.y + dir.y * R * 0.12;
  const er = R * 0.37;
  const ex = R * 0.39;
  const ey = fy - R * 0.2 * squashY;
  const look = o.look || { x: 0, y: 0 };
  const reach = er * 0.4;
  const px = clamp(look.x, -1, 1) * reach, py = clamp(look.y, -1, 1) * reach;
  const mood = o.mood || 'normal';

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255,70,110,.35)';
  [-1, 1].forEach((k) => {
    ctx.beginPath();
    ctx.ellipse(fx + k * R * 0.62, fy + R * 0.2, R * 0.17, R * 0.11, 0, 0, TAU);
    ctx.fill();
  });

  const eyeState = mood === 'happy' ? 'happy' : mood === 'hic' ? null : o.blink ? 'blink' : 'open';
  eye(ctx, fx - ex, ey, er, px, py, lw * 0.75, eyeState || 'hicL');
  eye(ctx, fx + ex, ey, er, px, py, lw * 0.75, eyeState || 'hicR');

  // Mouth
  const my = fy + R * 0.34 * squashY;
  ctx.lineWidth = lw * 0.8;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  const open = clamp(o.mouth || 0, 0, 1);
  if (mood === 'happy' || open > 0.05) {
    const w = R * (mood === 'happy' ? 0.42 : 0.28 + open * 0.08);
    const h = R * (mood === 'happy' ? 0.3 : 0.12 + open * 0.22);
    // A wide smiling "D": eager when a letter is close, beaming when happy.
    ctx.beginPath();
    ctx.moveTo(fx - w, my - h * 0.35);
    ctx.quadraticCurveTo(fx, my - h * 0.55, fx + w, my - h * 0.35);
    ctx.quadraticCurveTo(fx + w * 0.8, my + h * 1.1, fx, my + h * 1.05);
    ctx.quadraticCurveTo(fx - w * 0.8, my + h * 1.1, fx - w, my - h * 0.35);
    ctx.fillStyle = '#7A1E3A';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(fx, my + h * 1.0, w * 0.6, h * 0.55, 0, 0, TAU);
    ctx.fillStyle = '#FF7F95';
    ctx.fill();
    ctx.restore();
    ctx.stroke();
  } else if (mood === 'hic') {
    ctx.beginPath();
    ctx.ellipse(fx, my + R * 0.04, R * 0.1, R * 0.12, 0, 0, TAU);
    ctx.fillStyle = '#7A1E3A';
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(fx, my - R * 0.12, R * 0.24, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();
  }

  if (o.hat) drawHat(ctx, o.hat, head.x + dir.x * R * 0.08, head.y - R * 0.12 + dir.y * R * 0.06, R, { mono: o.mono });
}

/** Segments for a still pose along a gentle S curve, head first (start card, wardrobe, end card). */
export function posePoints(n, hx, hy, R, { spacing = 0.62, curl = 1, heading = Math.PI * 0.85 } = {}) {
  const pts = [{ x: hx, y: hy, r: R }];
  let a = heading + Math.PI; // walking backwards from the head
  let x = hx, y = hy;
  for (let i = 1; i < n; i++) {
    a += Math.sin(i * 0.55) * 0.32 * curl;
    x += Math.cos(a) * R * spacing;
    y += Math.sin(a) * R * spacing;
    const tail = n - i;
    const r = R * 0.86 * (tail < 4 ? 0.62 + tail * 0.095 : 1);
    pts.push({ x, y, r });
  }
  return pts;
}

export class Worm {
  constructor() {
    this.x = 0; this.y = 0; this.angle = 0;
    this.R = 24; this.len = 3;
    this.path = [];
    this.segs = [];
    this.sq = 0; this.sqv = 0;          // head squash spring
    this.body = 0; this.bodyv = 0;      // whole-body hiccup spring
    this.bulges = [];                   // food travelling down the body
    this.growAt = -1;                   // when the newest tail segment appeared
    this.mood = 'normal'; this.moodUntil = 0;
    this.blinkAt = 1 + Math.random() * 3; this.blinkUntil = 0;
    this.look = { x: 0, y: 0 };
    this.pup = { x: 0, y: 0, vx: 0, vy: 0 };
    this.mouth = 0;
    this.wander = 0;
    this.hat = null;
    this.hic = [];                      // "hic!" bubbles
    this.happyUntil = 0;
  }

  // Gap between segments. A very long worm packs its segments a little closer so it still fits the garden.
  get spacing() {
    const sp = this.R * 0.62;
    if (!this.room) return sp;
    return Math.max(this.R * 0.4, Math.min(sp, this.room / Math.max(1, this.len)));
  }

  reset(x, y, angle, len, R) {
    this.x = x; this.y = y; this.angle = angle; this.len = len; this.R = R;
    this.path = [];
    const back = (len + 4) * this.spacing;
    for (let d = back; d > 0; d -= 3) this.path.push({ x: x - Math.cos(angle) * d, y: y - Math.sin(angle) * d });
    this.bulges = []; this.hic = []; this.sq = this.sqv = this.body = this.bodyv = 0;
    this.wander = angle;
    this.mood = 'normal'; this.growAt = -1;
  }

  setR(R) { this.R = R; }

  kick(v) { this.sqv += v; }

  setMood(mood, until) { this.mood = mood; this.moodUntil = until; }

  grow(t) {
    this.len += 1;
    this.growAt = t;
    this.bulges.push(0);
  }

  hiccup(t) {
    this.setMood('hic', t + 0.8);
    this.bodyv += 9;
    this.sqv -= 7;
    this.hic.push({ born: t, x: this.x, y: this.y, side: Math.random() < 0.5 ? -1 : 1 });
  }

  /**
   * want: unit vector to steer towards, or null to wander. b: { x0, y0, x1, y1 } bounds for the head.
   * v: pixels a second. omega: fastest turn, radians a second.
   */
  update(dt, t, want, b, v, omega, calm) {
    const R = this.R;
    let hx = Math.cos(this.angle), hy = Math.sin(this.angle);
    let wx, wy, gain;
    if (want) {
      wx = want.x; wy = want.y; gain = 6;
    } else {
      // Nobody steering: meander gently (a slow random walk near the heading), drifting back to the middle.
      this.wander += (Math.random() - 0.5) * 3 * dt + Math.sin(t * 0.37) * 0.25 * dt;
      const off = Math.atan2(Math.sin(this.wander - this.angle), Math.cos(this.wander - this.angle));
      if (Math.abs(off) > 0.6) this.wander = this.angle + Math.sign(off) * 0.6;
      const cx = (b.x0 + b.x1) / 2 - this.x, cy = (b.y0 + b.y1) / 2 - this.y;
      const cd = Math.hypot(cx, cy) || 1;
      wx = Math.cos(this.wander) + (cx / cd) * 0.18;
      wy = Math.sin(this.wander) + (cy / cd) * 0.18;
      gain = 1.1;
    }

    // Edges: turn smoothly away before reaching them.
    const m = R * 2.6 + v * 0.45;
    let rx = 0, ry = 0;
    const push = (d) => Math.pow(clamp(1 - d / m, 0, 1), 2);
    rx += push(this.x - b.x0) - push(b.x1 - this.x);
    ry += push(this.y - b.y0) - push(b.y1 - this.y);
    const rs = Math.hypot(rx, ry);
    if (rs > 0) {
      // Only steer away if heading into the edge.
      const into = -(hx * rx + hy * ry) / rs;
      const k = rs * (into > -0.2 ? 5 : 1.5);
      wx += (rx / rs) * k;
      wy += (ry / rs) * k;
      if (into > -0.2) gain = Math.max(gain, 1 + rs * 6);
    }
    const wl = Math.hypot(wx, wy);
    if (wl > 1e-6) {
      wx /= wl; wy /= wl;
      const diff = Math.atan2(hx * wy - hy * wx, hx * wx + hy * wy);
      const maxTurn = omega * (rs > 0.25 ? 1.6 : 1);
      const rate = Math.sign(diff) * Math.min(Math.abs(diff) * gain, maxTurn);
      this.angle += rate * dt;
    }
    hx = Math.cos(this.angle); hy = Math.sin(this.angle);
    // Stay inside the lawn; if the lawn shrank (the word bar appeared), ease back in rather than jump.
    const pull = 140 * dt;
    let nx = this.x + hx * v * dt, ny = this.y + hy * v * dt;
    if (nx < b.x0) nx = Math.min(b.x0, Math.max(nx, this.x) + pull);
    if (nx > b.x1) nx = Math.max(b.x1, Math.min(nx, this.x) - pull);
    if (ny < b.y0) ny = Math.min(b.y0, Math.max(ny, this.y) + pull);
    if (ny > b.y1) ny = Math.max(b.y1, Math.min(ny, this.y) - pull);
    this.x = nx;
    this.y = ny;

    const lastP = this.path[this.path.length - 1];
    if (!lastP || Math.hypot(this.x - lastP.x, this.y - lastP.y) > 1.5) this.path.push({ x: this.x, y: this.y });

    // Springs
    const spring = (val, vel, k, d) => {
      vel += (-k * val - d * vel) * dt;
      return [val + vel * dt, vel];
    };
    [this.sq, this.sqv] = spring(this.sq, this.sqv, 260, 12);
    [this.body, this.bodyv] = spring(this.body, this.bodyv, 180, 7);
    this.sq = clamp(this.sq, -0.45, 0.45);
    this.body = clamp(this.body, -0.5, 0.5);

    // Googly pupils lag behind where they want to look.
    const tx = this.look.x, ty = this.look.y;
    this.pup.vx += ((tx - this.pup.x) * 140 - this.pup.vx * 9) * dt;
    this.pup.vy += ((ty - this.pup.y) * 140 - this.pup.vy * 9) * dt;
    this.pup.x += this.pup.vx * dt;
    this.pup.y += this.pup.vy * dt;

    if (t > this.blinkAt) {
      this.blinkUntil = t + 0.13;
      this.blinkAt = t + 2.2 + Math.random() * 3.5;
    }
    if (this.mood !== 'normal' && t > this.moodUntil) this.mood = 'normal';
    const step = (calm ? 10 : 16) * dt;
    this.bulges = this.bulges.map((p) => p + step).filter((p) => p < this.len + 2);
    this.hic = this.hic.filter((h) => t - h.born < 1.1);
    this.computeSegs(t, calm);
  }

  computeSegs(t, calm = false) {
    const out = this.segs;
    out.length = 0;
    const need = this.len;
    const sp = this.spacing;
    let px = this.x, py = this.y;
    out.push({ x: px, y: py, a: this.angle });
    let acc = 0;
    let used = this.path.length;
    for (let k = this.path.length - 1; k >= 0 && out.length < need; k--) {
      const q = this.path[k];
      let dx = q.x - px, dy = q.y - py;
      let d = Math.hypot(dx, dy);
      while (d > 1e-6 && acc + d >= sp && out.length < need) {
        const f = (sp - acc) / d;
        const sx = px + dx * f, sy = py + dy * f;
        out.push({ x: sx, y: sy, a: Math.atan2(-dy, -dx) });
        px = sx; py = sy;
        dx = q.x - px; dy = q.y - py;
        d = Math.hypot(dx, dy);
        acc = 0;
      }
      acc += d;
      px = q.x; py = q.y;
      used = k;
    }
    while (out.length < need) {
      const l = out[out.length - 1];
      out.push({ x: l.x - Math.cos(l.a) * sp, y: l.y - Math.sin(l.a) * sp, a: l.a });
    }
    // Forget trail the body no longer needs.
    if (used > 200) this.path.splice(0, used - 20);

    // Radii, wiggle and swallowed bulges.
    const R = this.R;
    const n = out.length;
    const amp = calm ? 0 : R * 0.1;
    const happy = this.mood === 'happy';
    for (let i = 0; i < n; i++) {
      const s = out[i];
      const tail = n - 1 - i;
      let r = i === 0 ? R : R * 0.86 * (tail < 4 ? 0.62 + tail * 0.095 : 1);
      if (!calm) r *= 1 + Math.sin(t * 7 - i * 0.7) * 0.035;
      for (const b of this.bulges) r += R * 0.22 * Math.exp(-((i - b) * (i - b)) / 1.6);
      if (i === n - 1 && this.growAt >= 0) {
        const g = clamp((t - this.growAt) / 0.35, 0, 1);
        r *= 0.3 + 0.7 * (1 - Math.pow(1 - g, 3));
      }
      r *= 1 + this.body * (i % 2 ? 0.35 : -0.25);
      s.r = r;
      if (i > 0) {
        const w = Math.sin(t * (happy ? 14 : 5.5) - i * 0.6) * (happy ? R * 0.28 : amp) * Math.min(1, i / 3);
        s.x += -Math.sin(s.a) * w;
        s.y += Math.cos(s.a) * w;
      }
    }
  }

  draw(ctx, t, { mono = false } = {}) {
    const dir = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
    const sq = this.sq;
    paintWorm(ctx, this.segs, {
      dir,
      look: this.pup,
      mood: this.mood,
      blink: t < this.blinkUntil,
      hat: this.hat,
      sx: 1 + sq, sy: 1 - sq * 0.8,
      mouth: this.mouth,
      mono,
    });
  }

  // "hic!" bubbles float up from the head (drawn above everything on the lawn).
  drawBubbles(ctx, t) {
    for (const h of this.hic) {
      const k = (t - h.born) / 1.1;
      const R = this.R;
      const x = h.x + h.side * R * (1.1 + k * 0.5);
      const y = h.y - R * (1.3 + k * 1.6);
      const s = k < 0.15 ? k / 0.15 : 1;
      ctx.save();
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.translate(x, y);
      ctx.scale(s, s);
      const fs = Math.max(16, R * 0.75);
      ctx.font = `600 ${fs}px ${FONT}`;
      const w = ctx.measureText('hic!').width + fs * 0.8;
      const hh = fs * 1.35;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -hh / 2, w, hh, hh / 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-h.side * w * 0.42, hh * 0.62, fs * 0.16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('hic!', 0, fs * 0.05);
      ctx.restore();
    }
  }
}
