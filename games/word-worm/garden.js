// The garden seen from above: striped lawn, flower beds with pebble edging, corner shrubs
// (drawn once to an offscreen canvas), plus swaying flowers, ladybirds and butterflies.

import { INK } from './art.js';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);

// A repeatable random sequence, so the garden looks the same after a resize.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const FLOWER_KINDS = [
  { petals: 5, c: '#FF7FB5', mid: '#FFE06A' },
  { petals: 6, c: '#FFFFFF', mid: '#FFC933' },
  { petals: 5, c: '#B08CF0', mid: '#FFF0A0' },
  { petals: 8, c: '#FFD447', mid: '#E07A1F' },
  { petals: 5, c: '#FF6B5E', mid: '#FFE9A8' },
  { petals: 4, c: '#7FB7FF', mid: '#FFFFFF' },
];

const WINGS = [
  ['#FF9F2E', '#FFD447'],
  ['#5AB0FF', '#B9E1FF'],
  ['#FF77B4', '#FFD1E6'],
];

export class Garden {
  constructor() {
    this.bg = document.createElement('canvas');
    this.flowers = [];
    this.ladybirds = [];
    this.butterflies = [];
    this.w = 0; this.h = 0; this.edge = 30;
  }

  /** Lawn rectangle (inside the beds). */
  get lawn() {
    const e = this.edge;
    return { x0: e, y0: e, x1: this.w - e, y1: this.h - e };
  }

  build(w, h, dpr) {
    this.w = w; this.h = h;
    const e = (this.edge = Math.round(Math.max(22, Math.min(48, Math.min(w, h) * 0.065))));
    const c = this.bg;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rnd = seeded(20261029);

    // Lawn with mown stripes
    const stripes = Math.max(4, Math.round(w / 72));
    const sw = w / stripes;
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 ? '#76C34C' : '#88D45D';
      g.fillRect(i * sw, 0, sw + 1, h);
    }
    // Sunlight from the top left
    const sun = g.createRadialGradient(w * 0.15, h * 0.1, 0, w * 0.15, h * 0.1, Math.hypot(w, h) * 0.9);
    sun.addColorStop(0, 'rgba(255,250,200,.22)');
    sun.addColorStop(0.6, 'rgba(255,250,200,0)');
    sun.addColorStop(1, 'rgba(20,80,30,.12)');
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);

    // Grass blades
    const blades = Math.round((w * h) / 260);
    g.lineCap = 'round';
    g.lineWidth = 1.4;
    for (let i = 0; i < blades; i++) {
      const x = rnd() * w, y = rnd() * h, l = 3 + rnd() * 5, a = -Math.PI / 2 + (rnd() - 0.5) * 0.9;
      g.strokeStyle = rnd() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(30,100,30,.12)';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    // Clover patches and tiny lawn daisies
    for (let i = 0; i < Math.round((w * h) / 26000); i++) {
      const x = e + rnd() * (w - 2 * e), y = e + rnd() * (h - 2 * e);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + rnd();
        g.beginPath();
        g.arc(x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, 3.4, 0, TAU);
        g.fillStyle = 'rgba(40,120,40,.32)';
        g.fill();
      }
    }
    for (let i = 0; i < Math.round((w * h) / 22000); i++) {
      const x = e + rnd() * (w - 2 * e), y = e + rnd() * (h - 2 * e);
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        g.beginPath();
        g.ellipse(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.1, 1.2, a, 0, TAU);
        g.fill();
      }
      g.beginPath();
      g.arc(x, y, 1.6, 0, TAU);
      g.fillStyle = '#FFD447';
      g.fill();
    }

    // Flower beds: a soil border with a wavy inner edge.
    const inner = [];
    const steps = Math.round((2 * (w + h)) / 10);
    const rr = e * 1.6;
    for (let i = 0; i < steps; i++) {
      const p = this.perimeterPoint(i / steps, e, rr);
      const wob = Math.sin(i * 0.9) * 2 + Math.sin(i * 0.37) * 3;
      inner.push({ x: p.x + p.nx * wob, y: p.y + p.ny * wob, nx: p.nx, ny: p.ny });
    }
    const innerPath = () => {
      g.beginPath();
      inner.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.closePath();
    };
    // Shade cast onto the lawn by the bed edge
    g.save();
    innerPath();
    g.clip();
    g.shadowColor = 'rgba(20,70,20,.45)';
    g.shadowBlur = 14;
    g.lineWidth = 10;
    g.strokeStyle = 'rgba(20,70,20,.35)';
    innerPath();
    g.stroke();
    g.restore();

    g.save();
    g.beginPath();
    g.rect(0, 0, w, h);
    inner.slice().reverse().forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.closePath();
    g.clip('evenodd');
    g.fillStyle = '#8A5A3A';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < Math.round((2 * (w + h) * e) / 40); i++) {
      const p = this.perimeterPoint(rnd(), e * rnd(), rr);
      g.beginPath();
      g.arc(p.x, p.y, 1 + rnd() * 2.2, 0, TAU);
      g.fillStyle = rnd() < 0.5 ? 'rgba(60,35,20,.45)' : 'rgba(190,140,100,.35)';
      g.fill();
    }
    // Leafy clumps where the flowers grow
    this.flowers = [];
    const fr = seeded(77);
    const per = 2 * (w + h);
    const count = Math.max(16, Math.round(per / Math.max(30, e * 1.35)));
    for (let i = 0; i < count; i++) {
      const u = (i + fr() * 0.5) / count;
      const p = this.perimeterPoint(u, e * (0.42 + fr() * 0.16), rr);
      const r = e * (0.34 + fr() * 0.12);
      for (let k = 0; k < 4; k++) {
        const a = fr() * TAU;
        g.beginPath();
        g.ellipse(p.x + Math.cos(a) * r * 0.9, p.y + Math.sin(a) * r * 0.9, r * 0.75, r * 0.4, a, 0, TAU);
        g.fillStyle = k % 2 ? '#3E9A3A' : '#4FAE45';
        g.fill();
        g.lineWidth = 1.2;
        g.strokeStyle = 'rgba(20,60,20,.5)';
        g.stroke();
      }
      this.flowers.push({ x: p.x, y: p.y, r, kind: FLOWER_KINDS[i % FLOWER_KINDS.length], ph: fr() * TAU, rot: fr() * TAU });
    }
    g.restore();

    // Pebble edging along the inner edge
    let along = 0;
    for (let i = 1; i < inner.length + 1; i++) {
      const a = inner[i - 1], b = inner[i % inner.length];
      along += Math.hypot(b.x - a.x, b.y - a.y);
      if (along < 13) continue;
      along = 0;
      const pr = 4.6 + rnd() * 3.2;
      const px = b.x - b.nx * pr * 0.2, py = b.y - b.ny * pr * 0.2;
      const shade = ['#EFE8DA', '#D9D0BF', '#C7BCA8', '#E6DCCB'][Math.floor(rnd() * 4)];
      g.beginPath();
      g.ellipse(px + 1.6, py + 2.2, pr * 1.1, pr * 0.85, rnd(), 0, TAU);
      g.fillStyle = 'rgba(30,40,20,.3)';
      g.fill();
      g.beginPath();
      g.ellipse(px, py, pr * 1.1, pr * 0.85, rnd() * TAU, 0, TAU);
      g.fillStyle = shade;
      g.fill();
      g.lineWidth = 1.4;
      g.strokeStyle = 'rgba(70,60,45,.55)';
      g.stroke();
      g.beginPath();
      g.arc(px - pr * 0.35, py - pr * 0.3, pr * 0.3, 0, TAU);
      g.fillStyle = 'rgba(255,255,255,.6)';
      g.fill();
    }

    // Round shrubs in the corners
    const corners = [[0, 0], [w, 0], [0, h], [w, h]];
    corners.forEach(([cx, cy], ci) => {
      const R = e * 1.55;
      const blobs = [];
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * TAU + ci;
        blobs.push([cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55, R * (0.5 + rnd() * 0.15)]);
      }
      blobs.push([cx, cy, R * 0.7]);
      g.fillStyle = 'rgba(20,60,20,.32)';
      blobs.forEach(([x, y, r]) => { g.beginPath(); g.arc(x + 4, y + 6, r, 0, TAU); g.fill(); });
      g.lineWidth = 2.5;
      g.strokeStyle = INK;
      blobs.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); });
      blobs.forEach(([x, y, r], k) => {
        const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
        gr.addColorStop(0, '#7FD35C');
        gr.addColorStop(1, k % 2 ? '#2F8A36' : '#37953A');
        g.beginPath();
        g.arc(x, y, r - 1, 0, TAU);
        g.fillStyle = gr;
        g.fill();
      });
      // Berries
      for (let k = 0; k < 5; k++) {
        const a = rnd() * TAU, d = rnd() * R * 0.8;
        g.beginPath();
        g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.6, 0, TAU);
        g.fillStyle = '#FF5C6B';
        g.fill();
      }
    });

    this.spawnCritters();
  }

  // A point on the rounded rectangle `inset` px inside the screen; u from 0 to 1 goes round once.
  perimeterPoint(u, inset, r) {
    const w = this.w, h = this.h;
    const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
    const rr = Math.max(0, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
    const sw = x1 - x0 - 2 * rr, sh = y1 - y0 - 2 * rr, arc = (Math.PI / 2) * rr;
    const total = 2 * sw + 2 * sh + 4 * arc;
    let d = (((u % 1) + 1) % 1) * total;
    const seg = [
      [sw, (s) => ({ x: x0 + rr + s, y: y0, nx: 0, ny: -1 })],
      [arc, (s) => { const a = -Math.PI / 2 + s / rr; return { x: x1 - rr + Math.cos(a) * rr, y: y0 + rr + Math.sin(a) * rr, nx: Math.cos(a), ny: Math.sin(a) }; }],
      [sh, (s) => ({ x: x1, y: y0 + rr + s, nx: 1, ny: 0 })],
      [arc, (s) => { const a = s / rr; return { x: x1 - rr + Math.cos(a) * rr, y: y1 - rr + Math.sin(a) * rr, nx: Math.cos(a), ny: Math.sin(a) }; }],
      [sw, (s) => ({ x: x1 - rr - s, y: y1, nx: 0, ny: 1 })],
      [arc, (s) => { const a = Math.PI / 2 + s / rr; return { x: x0 + rr + Math.cos(a) * rr, y: y1 - rr + Math.sin(a) * rr, nx: Math.cos(a), ny: Math.sin(a) }; }],
      [sh, (s) => ({ x: x0, y: y1 - rr - s, nx: -1, ny: 0 })],
      [arc, (s) => { const a = Math.PI + s / rr; return { x: x0 + rr + Math.cos(a) * rr, y: y0 + rr + Math.sin(a) * rr, nx: Math.cos(a), ny: Math.sin(a) }; }],
    ];
    for (const [len, f] of seg) {
      if (d <= len || len === 0 && d === 0) return f(rr === 0 && len === arc ? 0 : d);
      d -= len;
    }
    return seg[0][1](0);
  }

  spawnCritters() {
    const { x0, y0, x1, y1 } = this.lawn;
    const big = this.w * this.h > 600000;
    if (this.ladybirds.length === 0) {
      for (let i = 0; i < 2; i++) {
        this.ladybirds.push({ x: rand(x0 + 30, x1 - 30), y: rand(y0 + 60, y1 - 30), a: rand(0, TAU), turn: 0, rest: rand(0, 3), step: rand(0, TAU), r: 0 });
      }
    }
    const want = big ? 3 : 2;
    while (this.butterflies.length < want) {
      const i = this.butterflies.length;
      this.butterflies.push({ x: rand(x0, x1), y: rand(y0, y1), a: rand(0, TAU), flap: rand(0, TAU), wings: WINGS[i % WINGS.length], wob: rand(0, TAU), z: rand(26, 40) });
    }
    // Keep everything on screen after a resize.
    [...this.ladybirds, ...this.butterflies].forEach((c) => {
      c.x = Math.min(x1 - 10, Math.max(x0 + 10, c.x));
      c.y = Math.min(y1 - 10, Math.max(y0 + 10, c.y));
    });
  }

  update(dt, t, calm, top) {
    const { x0, x1, y1 } = this.lawn;
    const y0 = Math.max(this.lawn.y0, top);
    const steerIn = (c, m) => {
      let fx = 0, fy = 0;
      if (c.x < x0 + m) fx += 1; if (c.x > x1 - m) fx -= 1;
      if (c.y < y0 + m) fy += 1; if (c.y > y1 - m) fy -= 1;
      if (fx || fy) {
        const want = Math.atan2(fy, fx);
        const d = Math.atan2(Math.sin(want - c.a), Math.cos(want - c.a));
        c.a += Math.sign(d) * Math.min(Math.abs(d), 2.2 * dt);
      }
    };
    for (const b of this.ladybirds) {
      b.r = Math.max(9, Math.min(13, this.edge * 0.36));
      if (calm) continue;
      if (b.rest > 0) { b.rest -= dt; continue; }
      b.turn += (Math.random() - 0.5) * dt * 4;
      b.turn *= 0.96;
      b.a += b.turn * dt;
      steerIn(b, 40);
      b.x += Math.cos(b.a) * 16 * dt;
      b.y += Math.sin(b.a) * 16 * dt;
      b.step += dt * 18;
      if (Math.random() < dt * 0.15) b.rest = rand(1, 3.5);
    }
    for (const f of this.butterflies) {
      const sp = calm ? 10 : 34;
      f.flap += dt * (calm ? 4 : 15);
      f.wob += dt;
      f.a += Math.sin(f.wob * 1.3) * dt * 1.4;
      steerIn(f, 50);
      f.x += Math.cos(f.a) * sp * dt;
      f.y += Math.sin(f.a) * sp * dt;
    }
  }

  drawBack(ctx, t, calm) {
    ctx.drawImage(this.bg, 0, 0, this.w, this.h);
    // Swaying flowers in the beds
    for (const f of this.flowers) {
      const sway = calm ? 0 : Math.sin(t * 1.4 + f.ph);
      const x = f.x + sway * 1.6, y = f.y + Math.cos(t * 1.1 + f.ph) * (calm ? 0 : 0.8);
      const r = f.r;
      const k = f.kind;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(f.rot + sway * 0.12);
      ctx.beginPath();
      ctx.arc(2, 3, r * 0.95, 0, TAU);
      ctx.fillStyle = 'rgba(30,50,10,.28)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = INK;
      for (let i = 0; i < k.petals; i++) {
        const a = (i / k.petals) * TAU;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.5, r * (k.petals > 6 ? 0.22 : 0.34), a, 0, TAU);
        ctx.fillStyle = k.c;
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, TAU);
      ctx.fillStyle = k.mid;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawGround(ctx) {
    for (const b of this.ladybirds) {
      const r = b.r;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.a);
      ctx.beginPath();
      ctx.ellipse(1.5, 2.5, r * 1.05, r * 0.9, 0, 0, TAU);
      ctx.fillStyle = 'rgba(20,60,20,.3)';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3;
      const leg = Math.sin(b.step) * r * 0.15;
      for (const s of [-1, 1]) {
        for (const k of [-0.45, 0, 0.45]) {
          ctx.beginPath();
          ctx.moveTo(k * r, s * r * 0.6);
          ctx.lineTo(k * r + (k === 0 ? -leg : leg) * s, s * r * 1.05);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(r * 0.78, 0, r * 0.42, 0, TAU);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r * 0.78, 0, 0, TAU);
      ctx.fillStyle = '#F2393F';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r * 0.85, 0);
      ctx.lineTo(-r * 0.9, 0);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = INK;
      [[0.3, 0.38], [-0.3, 0.42], [0.3, -0.38], [-0.3, -0.42], [-0.62, 0.15], [-0.62, -0.15]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.15, 0, TAU);
        ctx.fill();
      });
      ctx.beginPath();
      ctx.ellipse(r * 0.15, -r * 0.4, r * 0.25, r * 0.12, 0, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fill();
      ctx.restore();
    }
  }

  drawAir(ctx) {
    for (const f of this.butterflies) {
      const s = Math.max(12, Math.min(19, this.edge * 0.5));
      const open = 0.25 + 0.75 * Math.abs(Math.sin(f.flap));
      // Shadow on the lawn
      ctx.save();
      ctx.translate(f.x + f.z * 0.5, f.y + f.z);
      ctx.rotate(f.a + Math.PI / 2);
      ctx.fillStyle = 'rgba(20,60,20,.1)';
      ctx.beginPath();
      ctx.ellipse(-s * 0.55 * open, 0, s * 0.6 * open, s * 0.75, 0, 0, TAU);
      ctx.ellipse(s * 0.55 * open, 0, s * 0.6 * open, s * 0.75, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.a + Math.PI / 2);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.scale(side * open, 1);
        ctx.beginPath();
        ctx.ellipse(s * 0.55, -s * 0.3, s * 0.62, s * 0.5, -0.5, 0, TAU);
        ctx.fillStyle = f.wings[0];
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(s * 0.45, s * 0.42, s * 0.42, s * 0.36, 0.5, 0, TAU);
        ctx.fillStyle = f.wings[1];
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s * 0.62, -s * 0.36, s * 0.16, 0, TAU);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.14, s * 0.62, 0, 0, TAU);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.55);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.95, -s * 0.36, -s * 1.0);
      ctx.moveTo(s * 0.05, -s * 0.55);
      ctx.quadraticCurveTo(s * 0.2, -s * 0.95, s * 0.36, -s * 1.0);
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
    }
  }
}
