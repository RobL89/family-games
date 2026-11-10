// The rocket game's map screens (D-058, D-065, D-066): the map of the system the child is in, with
// its level markers along a path and the rocket waiting by its place; the galaxy view of every system
// along a winding path; and the jumps between them, a short warp and, when a system is done,
// hyperspace. Version 1.2 (step 2c-build, D-068). All original and drawn in code (D-010).
//
// Changes at v1.2 (Rob, 10 Nov): hopTo(id) flies the waiting rocket over to a level's marker, for a
// tap on an open level.
// Changes at v1.1: a tap on the rocket waiting on the map makes it do a happy hop, with a boing and
// a few sparkles (Rob's pointers for this step: engaging, small touches that add up).
//
// Drawn on a canvas of its own over the scene, which draws the system's sky and ground without its
// number line (Scene.setBare). The taps land on plain buttons laid over the markers and the planets,
// so a keyboard and a screen reader reach them and the tests tap them for real. The look follows the
// round's: chunky indigo outlines, sun yellow, mint and coral, the ship flown on the map (D-052), and
// effects first (D-045), with calm versions when the device asks for less motion.
//
// io (from round.js):
//   map              the systems: { id, name, planet, soon, levels: [{ id, about, ... }] };
//   progress()       the progress (progress.js, format 3); ship(): the ship flown's id;
//   tap(id)          an open level's marker was tapped (round.js opens its card);
//   play(id)         start a round on a level (after the rocket's launch);
//   move(id)         the rocket flew to another system and waits at this level now;
//   sfx(name), say(text), calm()   sounds, words and less motion, as the game has them;
//   covered(on)      the galaxy or hyperspace covers the whole stage (round.js hides the home button).

import { drawRocket, drawRock, drawPlanetBall, rr, rgba, mix, clamp, lerp, ease, sparkle, rng, INK, FONT } from './scene.js';
import { SHIP_BY_ID, Parts, newState, tickShip, landShip, drawShip, drawTrail, star5 } from './ships.js';
import { STARTER } from './fleet.js';
import { PLANETS } from './planets.js';
import { route, placeOf, isOpen, bestOf, foundOf, systemStars, reached, placeIn, ROCKS_PER_LEVEL, PASS_STARS } from './progress.js';

const TAU = Math.PI * 2;
const SUN = '#FFC93C';
const MINT = '#5FE3BD';
const CORAL = '#FF5D73';
const SKY = '#8CF5FF';
const LILAC = '#B9A7FF';
const DIM = '#6F6AA3';

function text(ctx, s, x, y, size, { fill = '#FFFFFF', stroke = INK, weight = 700, align = 'center', base = 'middle', lw } = {}) {
  ctx.font = `${weight} ${Math.round(size)}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = base;
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = lw ?? size * 0.24; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}

function starShape(ctx, x, y, r, on, t = 0) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  ctx.closePath();
  ctx.fillStyle = on ? SUN : '#3E3874'; ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1.6, r * 0.24); ctx.strokeStyle = INK; ctx.stroke();
  if (on) { ctx.fillStyle = rgba('#FFF6CF', 0.85); ctx.beginPath(); ctx.ellipse(-r * 0.22, -r * 0.2, r * 0.18, r * 0.1, -0.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function padlock(ctx, x, y, s, col = '#E3E0F5') {
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * 0.26, 0); ctx.lineTo(-s * 0.26, -s * 0.2); ctx.arc(0, -s * 0.2, s * 0.26, Math.PI, 0); ctx.lineTo(s * 0.26, 0);
  ctx.lineWidth = s * 0.17; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = s * 0.08; ctx.strokeStyle = col; ctx.stroke();
  rr(ctx, -s * 0.4, -s * 0.06, s * 0.8, s * 0.62, s * 0.13); ctx.fillStyle = SUN; ctx.fill(); ctx.lineWidth = s * 0.1; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, s * 0.18, s * 0.08, 0, TAU); ctx.fill(); ctx.fillRect(-s * 0.035, s * 0.18, s * 0.07, s * 0.17);
  ctx.restore();
}

function halo(ctx, x, y, r, col, a) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

// A smooth path through points (quadratic curves through the midpoints), sampled every `step` px.
function smooth(pts, step = 6) {
  if (pts.length < 2) return pts.slice();
  const out = [];
  const seg = (a, c, b) => { const n = Math.max(2, Math.ceil((Math.hypot(c[0] - a[0], c[1] - a[1]) + Math.hypot(b[0] - c[0], b[1] - c[1])) / step));
    for (let i = 0; i < n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let from = pts[0];
  for (let i = 1; i < pts.length - 1; i++) { const to = mid(pts[i], pts[i + 1]); seg(from, pts[i], to); from = to; }
  seg(from, mid(from, pts[pts.length - 1]), pts[pts.length - 1]);
  out.push(pts[pts.length - 1]);
  return out;
}

// The points of a sampled path between two of its anchors (the samples nearest each).
function between(samples, a, b) {
  const near = (p) => samples.reduce((best, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(samples[best][0] - p[0], samples[best][1] - p[1]) ? i : best), 0);
  const i = near(a), j = near(b);
  const part = i <= j ? samples.slice(i, j + 1) : samples.slice(j, i + 1).reverse();
  return part.length > 1 ? part : [a, b];
}

function along(pts, k) {
  if (pts.length < 2) return { x: pts[0][0], y: pts[0][1], a: 0 };
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const want = clamp(k, 0, 1) * lens[lens.length - 1];
  let i = 1;
  while (i < lens.length - 1 && lens[i] < want) i++;
  const f = (want - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1]);
  return { x: lerp(pts[i - 1][0], pts[i][0], f), y: lerp(pts[i - 1][1], pts[i][1], f), a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) };
}

export class StarMap {
  constructor(stage, scene, io) {
    this.stage = stage; this.scene = scene; this.io = io; this.map = io.map;
    const $ = (id) => document.getElementById(id);
    this.canvas = $('starmap'); this.ctx = this.canvas.getContext('2d');
    this.el = { map: $('map'), bar: $('map-bar'), marks: $('marks'), play: $('play'), banner: $('banner'), name: $('sys-name'), of: $('sys-of'),
      prev: $('sys-prev'), next: $('sys-next'), toGalaxy: $('to-galaxy'), gx: $('galaxy-view'), orbs: $('gx-orbs'), back: $('gx-back') };
    this.view = null; this.s = 0; this.W = 0; this.H = 0; this.dpr = 1;
    this.lay = null; this.gxLay = null; this.btns = []; this.orbBtns = [];
    this.R = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, legs: 1, flame: 0, look: 0, shown: true }; // the rocket: (x, y) its feet
    this.SS = newState(60); this.P = new Parts();
    this.steps = []; this.step = null; // queued animations, and the one playing
    this.bits = []; this.ann = null; this.mk = {}; this.T = 0; this.intro = -1;
    this.calm = false; this.bannerUntil = 0;
    // pointer handlers on plain buttons: each tells this map what was tapped
    this.el.play.addEventListener('click', () => this.playHere());
    this.el.toGalaxy.addEventListener('click', () => this.openGalaxy());
    this.el.prev.addEventListener('click', () => this.stepSystem(-1));
    this.el.next.addEventListener('click', () => this.stepSystem(1));
    this.el.back.addEventListener('click', () => this.closeGalaxy());
    addEventListener('keydown', (e) => {
      if (this.view === 'galaxy' && e.key === 'Escape') { e.preventDefault(); this.closeGalaxy(); }
    });
  }

  // ---------- what's where ----------

  get busy() { return !!this.step || this.steps.length > 0; }
  levels(s = this.s) { return (this.map[s] && this.map[s].levels) || []; }
  P_() { return this.io.progress(); }
  stateOf(id) {
    const p = this.P_();
    if (!isOpen(this.map, p, id)) return 'locked';
    const best = bestOf(p, id);
    if (best >= PASS_STARS) return 'done';
    if (id === p.open) return 'next';
    return best > 0 ? 'tried' : 'open';
  }
  nextSystem(s = this.s) { return s + 1 < this.map.length ? s + 1 : -1; }

  // ---------- showing and hiding ----------

  // Show the map of the system the rocket is in. o: { from (the marker the rocket starts on), hopTo
  // (a marker to hop to after a moment), opened (a marker that opens with a burst first), stars ({ id,
  // from, to }: new stars to pop in), drop (the rocket drops in from above), banner (words to show) }.
  show(o = {}) {
    const p = this.P_();
    const at = placeOf(this.map, o.from || p.at) || placeOf(this.map, p.at) || route(this.map)[0] && { ...route(this.map)[0], i: 0 };
    this.s = at ? at.s : 0;
    this.view = 'map'; this.calm = !!this.io.calm(); this.P.k = this.calm ? 0.35 : 1;
    this.canvas.hidden = false; this.el.map.hidden = false; this.el.gx.hidden = true;
    this.io.covered(false);
    this.steps = []; this.step = null; this.bits = []; this.mk = {};
    this.layout();
    this.place(o.from || p.at);
    this.ann = o.stars || null;
    if (o.stars) this.annT = 0;
    if (o.drop) this.queue({ kind: 'drop', dur: this.calm ? 0.35 : 0.85, to: p.at });
    if (o.opened) this.queue({ kind: 'unlock', dur: 0.75, id: o.opened, wait: o.stars ? 0.35 + 0.25 * Math.max(0, o.stars.to - o.stars.from) : 0.45 });
    if (o.hopTo && o.hopTo !== (o.from || p.at)) this.queue({ kind: 'hop', to: o.hopTo, wait: o.opened ? 0.1 : 0.5 });
    if (o.banner) this.showBanner(o.banner, o.drop ? 2.8 : 2.2);
    if (o.intro) this.intro = 0;
    this.paintBar();
  }

  hide() {
    this.view = null; this.canvas.hidden = true; this.el.map.hidden = true; this.el.gx.hidden = true;
    this.hideBanner(); this.io.covered(false);
  }

  // Where the rocket stands: on a level's marker.
  place(id) {
    const m = this.lay && this.lay.marks.find((k) => k.id === id);
    if (!m) return;
    Object.assign(this.R, { x: m.x, y: m.y - m.r * 0.92, rot: 0, sx: 1, sy: 1, legs: 1, flame: 0, shown: true, at: id });
  }

  // ---------- layout ----------

  resize() {
    const W = Math.max(1, this.stage.clientWidth), H = Math.max(1, this.stage.clientHeight);
    this.W = W; this.H = H; this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(W * this.dpr); this.canvas.height = Math.round(H * this.dpr);
    this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
    if (this.view === 'map' || this.view === 'warp') { this.layout(); if (!this.busy) this.place(this.P_().at); }
    if (this.view === 'galaxy') this.layoutGalaxy();
  }

  layout() {
    const W = this.W || this.stage.clientWidth, H = this.H || this.stage.clientHeight, lv = this.levels();
    const n = lv.length, sr = this.stage.getBoundingClientRect(), bar = this.el.bar.getBoundingClientRect();
    const top = Math.max(60, bar.bottom - sr.top) + 6, ground = this.scene.groundY || H * 0.8;
    const tall = H > W * 1.15 && W < 640;
    const marks = [];
    let r, portal;
    if (tall) {
      // phone upright: a zig-zag on two rows, so each marker is big enough to tap (sketches 1)
      const m = clamp(W * 0.1, 30, 60), dx = n > 1 ? (W - 2 * m) / (n - 1) : 0;
      r = clamp(dx * 0.62, 20, 31);
      const rh = clamp(r * 2.2, 46, 96), rp = r * 1.15, bub = 74;
      const above = bub + rh + r + 8, below = r * 1.9 + 16 + bub + rp * 2 + 12;
      const gap = clamp(ground - top - above - below, 96, 170);
      const yA = top + above + Math.max(0, (ground - top - above - below - gap) * 0.5), yB = yA + gap;
      lv.forEach((l, i) => marks.push({ id: l.id, n: i, x: m + i * dx, y: i % 2 ? yB : yA, r: i === n - 1 ? r * 1.22 : r }));
      portal = { x: W / 2, y: Math.min(ground - rp - 10, yB + r * 1.9 + 16 + bub + rp), r: rp };
      this.rh = rh;
    } else {
      // phone sideways and PC: one wave from left to right, the portal at the end (sketches 1)
      const m = clamp(W * 0.06, 40, 96), pw = clamp(W * 0.13, 96, 170);
      const dx = n > 1 ? (W - m - pw - m) / (n - 1) : 0;
      r = clamp(dx * 0.3, 20, 42);
      const rh = clamp(r * 2.2, 46, 100);
      const lo = top + r + rh + 10, hi = ground - r - r * 0.9 - 16;
      const mid = (lo + hi) / 2, amp = Math.max(0, Math.min((hi - lo) / 2, clamp((ground - top) * 0.16, 12, 64)));
      lv.forEach((l, i) => marks.push({ id: l.id, n: i, x: m + i * dx, y: mid + amp * Math.sin(i * 1.15 + 0.5), r: i === n - 1 ? r * 1.22 : r }));
      const last = marks[marks.length - 1] || { x: W - pw, y: mid };
      portal = { x: W - m * 0.6 - pw * 0.42, y: clamp(last.y - r * 0.2, lo, hi), r: clamp(pw * 0.3, 24, 44) };
      this.rh = rh;
    }
    this.lay = { marks, portal, tall, top, ground, r, path: smooth(marks.map((k) => [k.x, k.y]).concat(portal ? [[portal.x, portal.y]] : [])) };
    this.SS.h = this.rh;
    this.buildButtons();
  }

  buildButtons() {
    const box = this.el.marks;
    const want = this.lay.marks.map((k) => k.id).concat(['portal', 'rocket']);
    if (this.btns.map((b) => b.dataset.level).join() !== want.join()) {
      box.innerHTML = '';
      this.btns = want.map((id) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'mk'; b.dataset.level = id;
        b.addEventListener('click', () => (id === 'portal' ? this.stepSystem(1, true) : id === 'rocket' ? this.tapRocket() : this.tapMarker(id)));
        if (id === 'rocket') { b.classList.add('rocket-hit'); b.setAttribute('aria-label', 'The rocket: give it a tap'); }
        box.appendChild(b);
        return b;
      });
    }
    const p = this.P_();
    this.btns.forEach((b) => {
      const id = b.dataset.level;
      if (id === 'rocket') return; // placed each frame, over the rocket
      const k = id === 'portal' ? this.lay.portal : this.lay.marks.find((x) => x.id === id);
      const size = Math.max(48, k.r * 2 + 14);
      Object.assign(b.style, { left: `${k.x - size / 2}px`, top: `${k.y - size / 2}px`, width: `${size}px`, height: `${size}px` });
      if (id === 'portal') {
        const ns = this.nextSystem(), S2 = ns >= 0 ? this.map[ns] : null;
        b.setAttribute('aria-label', !S2 ? 'The end of the map' : S2.soon ? `${S2.name}: coming soon` : reached(this.map, p, ns) ? `Fly to ${S2.name}` : `${S2.name}: locked`);
        return;
      }
      const lv = this.levels().find((x) => x.id === id), n = this.levels().indexOf(lv) + 1, st = this.stateOf(id), best = bestOf(p, id);
      b.setAttribute('aria-label', st === 'locked' ? `Level ${n}, locked` : `Level ${n}${best ? `, best ${best} star${best === 1 ? '' : 's'}` : st === 'next' ? ', new' : ''}`);
      b.dataset.state = st;
    });
  }

  // The top bar: the system's name, where it is on the map, and the arrows to the systems either side.
  paintBar() {
    const sys = this.map[this.s], p = this.P_();
    this.el.name.textContent = sys ? sys.name : '';
    this.el.of.textContent = `system ${this.s + 1} of ${this.map.length}`;
    const can = (d) => { const s2 = this.s + d; return s2 >= 0 && s2 < this.map.length && reached(this.map, p, s2); };
    this.el.prev.setAttribute('aria-disabled', String(!can(-1)));
    this.el.next.setAttribute('aria-disabled', String(!can(1)));
    this.el.map.style.setProperty('--sys', sys ? PLANETS[sys.planet].glow : SKY);
  }

  // ---------- taps ----------

  tapMarker(id) {
    if (this.view !== 'map' || this.busy) return;
    const k = this.mk[id] || (this.mk[id] = {});
    if (this.stateOf(id) === 'locked') {
      k.shake = 1; this.io.sfx('boop'); this.io.say('Locked!');
      return;
    }
    k.press = 1; this.io.sfx('tap');
    this.io.tap(id);
  }

  // A tap on the waiting rocket: a happy hop, a boing and a few sparkles. Nothing else happens.
  tapRocket() {
    if (this.view !== 'map' || this.busy) return;
    this.io.sfx('boing');
    this.queue({ kind: 'boing', dur: this.calm ? 0.25 : 0.55 });
  }

  playHere() {
    if (this.view !== 'map' || this.busy) return;
    const at = this.P_().at;
    this.io.sfx('tap');
    this.launch(at, () => this.io.play(at));
  }

  // The rocket flies over to a level's marker, if it isn't there already (a tap on an open level).
  hopTo(id) {
    if (this.view === 'map' && this.R.at !== id) this.queue({ kind: 'hop', to: id, wait: 0.05 });
  }

  // The rocket hops to a level's marker (if it isn't there), blasts off, and then the round starts.
  launch(id, done) {
    if (this.view !== 'map') return false;
    if (this.R.at !== id) this.queue({ kind: 'hop', to: id, wait: 0.05 });
    this.queue({ kind: 'launch', dur: this.calm ? 0.25 : 0.62, done });
    return true;
  }

  // The arrows and the portal: fly to the system next door, if it has been reached.
  stepSystem(d, portal = false) {
    if (this.view !== 'map' || this.busy) return;
    const s2 = this.s + d, p = this.P_();
    if (s2 < 0 || s2 >= this.map.length) return;
    if (!reached(this.map, p, s2)) {
      this.io.sfx('boop');
      this.io.say(this.map[s2].soon ? 'Coming soon!' : 'Locked!');
      if (portal) (this.mk.portal = this.mk.portal || {}).shake = 1;
      else (d < 0 ? this.el.prev : this.el.next).animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 300 });
      return;
    }
    this.io.sfx('whoosh');
    this.queue({ kind: 'warp', dur: this.calm ? 0.35 : 0.8, to: s2 });
  }

  // ---------- the galaxy (D-065) ----------

  openGalaxy() {
    if (this.view !== 'map' || this.busy) return;
    this.io.sfx('whoosh');
    this.view = 'galaxy'; this.gxT = 0; this.fly = null;
    this.el.map.hidden = true; this.el.gx.hidden = false; this.hideBanner();
    this.io.covered(true);
    this.layoutGalaxy();
  }

  closeGalaxy() {
    if (this.view !== 'galaxy' || this.fly) return;
    this.io.sfx('tap');
    this.view = 'map'; this.el.gx.hidden = true; this.el.map.hidden = false;
    this.io.covered(false);
    this.layout(); this.place(this.P_().at); this.paintBar();
  }

  layoutGalaxy() {
    const W = this.W, H = this.H, n = this.map.length, sr = this.stage.getBoundingClientRect();
    const head = this.el.gx.querySelector('.gx-head').getBoundingClientRect();
    const top = Math.max(70, head.bottom - sr.top + 10);
    const tall = H > W * 1.15 && W < 640;
    const wob = [0.62, -0.55, 0.42, -0.62, 0.5, -0.38];
    let orbs, r;
    if (tall) {
      const bottom = H - 30, dy = (bottom - top) / n;
      r = clamp(Math.min(dy * 0.3, W * 0.14), 24, 54);
      orbs = this.map.map((sys, i) => ({ s: i, x: W / 2 + (W * 0.27) * wob[i % wob.length], y: top + dy * (i + 0.42), r }));
    } else {
      const m = clamp(W * 0.09, 60, 130), dx = (W - 2 * m) / Math.max(1, n - 1);
      const mid = (top + H - 40) / 2 - 8, amp = clamp((H - top - 70) * 0.3, 24, 150);
      r = clamp(Math.min(dx * 0.3, (H - top) * 0.13), 24, 60);
      orbs = this.map.map((sys, i) => ({ s: i, x: m + dx * i, y: mid + amp * wob[i % wob.length], r }));
    }
    // a winding path: between each pair of planets a bend to one side, then the other (D-065)
    const pts = [];
    orbs.forEach((o, i) => {
      pts.push([o.x, o.y]);
      const b = orbs[i + 1];
      if (!b) return;
      const mx = (o.x + b.x) / 2, my = (o.y + b.y) / 2, len = Math.hypot(b.x - o.x, b.y - o.y);
      const nx = -(b.y - o.y) / len, ny = (b.x - o.x) / len, bend = len * (i % 2 ? 0.22 : -0.26);
      pts.push([mx + nx * bend, my + ny * bend]);
    });
    this.gxLay = { orbs, r, tall, path: smooth(pts, 5), top };
    // the buttons over the planets
    const box = this.el.orbs, p = this.P_();
    if (this.orbBtns.length !== orbs.length) {
      box.innerHTML = '';
      this.orbBtns = orbs.map((o) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'gx'; b.dataset.system = this.map[o.s].id;
        b.addEventListener('click', () => this.flyTo(o.s));
        box.appendChild(b);
        return b;
      });
    }
    orbs.forEach((o, i) => {
      const b = this.orbBtns[i], size = Math.max(56, o.r * 2.4), sys = this.map[o.s], st = systemStars(this.map, p, o.s);
      Object.assign(b.style, { left: `${o.x - size / 2}px`, top: `${o.y - size / 2}px`, width: `${size}px`, height: `${size}px` });
      b.setAttribute('aria-label', sys.soon ? `${sys.name}: coming soon` : reached(this.map, p, o.s) ? `${sys.name}: ${st.got} of ${st.of} stars${o.s === this.s ? ', you are here' : ''}` : `${sys.name}: locked`);
    });
  }

  flyTo(s2) {
    if (this.view !== 'galaxy' || this.fly) return;
    const p = this.P_(), o = this.gxLay.orbs[s2];
    if (s2 === this.s) { this.closeGalaxy(); return; }
    if (!reached(this.map, p, s2)) {
      o.shake = 1; this.io.sfx('boop'); this.io.say(this.map[s2].soon ? 'Coming soon!' : 'Locked!');
      return;
    }
    const a = this.gxLay.orbs[this.s];
    this.fly = { to: s2, t: 0, dur: this.calm ? 0.45 : clamp(0.5 + Math.abs(s2 - this.s) * 0.35, 0.8, 2.2), path: between(this.gxLay.path, [a.x, a.y], [o.x, o.y]) };
    this.io.sfx('whoosh');
  }

  // ---------- hyperspace (D-058): a system done, off to the next ----------

  hyperspace(toS, done) {
    this.view = 'hyper'; this.el.map.hidden = true; this.el.gx.hidden = true; this.hideBanner();
    this.canvas.hidden = false;
    this.io.covered(true);
    this.calm = !!this.io.calm();
    const from = this.map[this.s];
    this.hy = { t: 0, dur: this.calm ? 1.8 : 3.4, from: from ? PLANETS[from.planet] : PLANETS[0], to: PLANETS[this.map[toS].planet], name: this.map[toS].name, toS, done, streaks: [], flash: 0, said: false };
    this.io.sfx('warp');
    this.io.say('Hyperspace!');
  }

  // ---------- banners ----------

  showBanner(words, secs = 2.2) {
    const b = this.el.banner;
    b.textContent = words; b.hidden = false;
    if (this.lay) b.style.top = `${Math.round(this.lay.top + 8)}px`; // just under the top bar, clear of the levels
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    this.bannerUntil = this.T + secs;
  }

  hideBanner() { this.el.banner.hidden = true; this.bannerUntil = 0; }

  // ---------- animations ----------

  queue(st) { this.steps.push({ t: 0, ...st }); }

  burst(x, y, n, cols = [SUN, '#FFFFFF', MINT, SKY], spread = 160) {
    const k = this.calm ? Math.max(3, Math.round(n / 3)) : n;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * TAU + Math.random() * 0.5, sp = spread * (0.45 + Math.random() * 0.7);
      this.bits.push({ kind: 'star', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, g: 260, life: 0.7 + Math.random() * 0.4, age: 0, size: 4 + Math.random() * 5, col: cols[i % cols.length], rot: Math.random() * 3 });
    }
  }

  puff(x, y, n = 10) {
    const P = this.scene.planet || PLANETS[0], col = mix(P.ground[1], '#FFFFFF', 0.45), k = this.calm ? Math.round(n / 2) : n;
    for (let i = 0; i < k; i++) {
      const s = i % 2 ? 1 : -1;
      this.bits.push({ kind: 'puff', x: x + s * Math.random() * 10, y, vx: s * (50 + Math.random() * 110), vy: -10 - Math.random() * 40, g: 40, life: 0.6 + Math.random() * 0.4, age: 0, size: 4 + Math.random() * 6, col });
    }
  }

  runStep(st, dt) {
    const R = this.R, L = this.lay;
    if (st.wait > 0) { st.wait -= dt; return false; }
    st.t += dt;
    if (st.kind === 'hop') {
      if (!st.a) {
        const to = L.marks.find((k) => k.id === st.to);
        if (!to) return true;
        st.a = { x: R.x, y: R.y }; st.b = { x: to.x, y: to.y - to.r * 0.92 };
        const d = Math.hypot(st.b.x - st.a.x, st.b.y - st.a.y);
        st.dur = this.calm ? 0.3 : clamp(0.35 + d / 700, 0.45, 1.1); st.arc = this.calm ? 10 : clamp(40 + d * 0.3, 50, 150);
        this.io.sfx('whoosh');
      }
      const k = clamp(st.t / st.dur, 0, 1), e = ease.inOut(k);
      R.x = lerp(st.a.x, st.b.x, e); R.y = lerp(st.a.y, st.b.y, e) - Math.sin(k * Math.PI) * st.arc;
      R.legs = k < 0.15 ? 1 - k / 0.15 : k > 0.75 ? (k - 0.75) / 0.25 : 0;
      R.flame = Math.sin(k * Math.PI) * 0.9; R.rot = Math.sin(k * Math.PI) * 0.2 * Math.sign(st.b.x - st.a.x || 1);
      if (k >= 1) {
        R.at = st.to; R.flame = 0; R.rot = 0; R.legs = 1; this.squash = 1;
        this.puff(R.x, R.y, 10); this.io.sfx('puff');
        if (this.SS) landShip(this.ship(), this.SS, this.P);
        return true;
      }
      return false;
    }
    if (st.kind === 'drop') {
      const to = L.marks.find((k) => k.id === st.to) || L.marks[0];
      if (!to) return true;
      const k = clamp(st.t / st.dur, 0, 1);
      R.x = to.x; R.y = lerp(-this.rh * 1.2, to.y - to.r * 0.92, ease.out(k)); R.at = to.id;
      R.flame = 1 - k * 0.6; R.legs = k > 0.6 ? (k - 0.6) / 0.4 : 0; R.rot = 0;
      if (k >= 1) { R.flame = 0; R.legs = 1; this.squash = 1; this.puff(R.x, R.y, 14); this.io.sfx('thud'); if (this.SS) landShip(this.ship(), this.SS, this.P); return true; }
      return false;
    }
    if (st.kind === 'boing') {
      if (st.base == null) st.base = R.y;
      const k = clamp(st.t / st.dur, 0, 1);
      R.y = st.base - Math.sin(k * Math.PI) * this.rh * (this.calm ? 0.08 : 0.3);
      R.rot = this.calm ? 0 : Math.sin(k * Math.PI * 2) * 0.12;
      if (k >= 1) {
        R.y = st.base; R.rot = 0; this.squash = 1;
        this.burst(R.x, R.y - this.rh * 0.6, 10, [SUN, '#FFFFFF', MINT, CORAL], 120);
        return true;
      }
      return false;
    }
    if (st.kind === 'launch') {
      const k = st.t;
      if (k < 0.14) { R.sy = 1 - k * 1.3; R.sx = 1 + k * 0.8; R.flame = k * 4; }
      else {
        if (!st.lifted) { st.lifted = true; this.io.sfx('whoosh'); this.puff(R.x, R.y, 16); }
        const u = k - 0.14;
        R.sx = R.sy = 1; R.legs = Math.max(0, 1 - u * 5); R.flame = 1.25;
        R.y -= (300 + 2600 * u) * dt;
      }
      if (st.t >= st.dur || R.y < -this.rh * 1.5) { R.shown = false; if (st.done) st.done(); return true; }
      return false;
    }
    if (st.kind === 'unlock') {
      const k = this.mk[st.id] || (this.mk[st.id] = {});
      if (!st.fired) {
        st.fired = true; k.unlock = 0;
        const m = L.marks.find((x) => x.id === st.id);
        if (m) { this.burst(m.x, m.y, 18); }
        this.io.sfx('unlock');
      }
      k.unlock = clamp(st.t / st.dur, 0, 1);
      if (st.t >= st.dur) { delete k.unlock; k.pop = 1; return true; }
      return false;
    }
    if (st.kind === 'warp') {
      st.k = clamp(st.t / st.dur, 0, 1);
      if (!st.switched && st.k >= 0.5) {
        st.switched = true;
        this.s = st.to;
        const at = placeIn(this.map, this.P_(), st.to);
        if (at) this.io.move(at);
        this.layout(); this.place(this.P_().at); this.paintBar();
        R.shown = false;
        this.queue({ kind: 'drop', dur: this.calm ? 0.3 : 0.7, to: this.P_().at });
        this.showBanner(this.map[st.to].name, 1.6);
      }
      if (st.k >= 1) { R.shown = true; return true; }
      return false;
    }
    return true;
  }

  frame(dt, t) {
    this.T += dt;
    if (!this.view) return;
    if (this.bannerUntil && this.T > this.bannerUntil) this.hideBanner();
    // the step playing, then the next one
    if (!this.step && this.steps.length) this.step = this.steps.shift();
    if (this.step && this.runStep(this.step, dt)) { this.step = null; if (this.steps.length) this.step = this.steps.shift(); }
    // the bits
    for (const b of this.bits) { b.age += dt; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 1 - Math.min(1, dt * 2); if (b.kind === 'puff') b.size += dt * 16; }
    this.bits = this.bits.filter((b) => b.age < b.life);
    for (const k of Object.values(this.mk)) { if (k.shake) k.shake = Math.max(0, k.shake - dt * 2.6); if (k.press) k.press = Math.max(0, k.press - dt * 4); if (k.pop) k.pop = Math.max(0, k.pop - dt * 2); }
    if (this.squash) this.squash = Math.max(0, this.squash - dt * 2.4);
    if (this.ann) this.annT = (this.annT || 0) + dt;
    if (this.intro >= 0) this.intro += dt;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    if (this.view === 'map' || this.view === 'warp') this.drawMap(ctx, t, dt);
    else if (this.view === 'galaxy') this.drawGalaxy(ctx, t, dt);
    else if (this.view === 'hyper') this.drawHyper(ctx, t, dt);
    if (this.step && this.step.kind === 'warp') this.drawWarp(ctx, this.step.k || 0, t);
    // the Play bubble sits over the waiting rocket
    const play = this.el.play, show = this.view === 'map' && !this.busy && this.R.shown;
    play.hidden = !show;
    if (show) this.placePlay();
    const hit = this.btns.find((b) => b.dataset.level === 'rocket');
    if (hit) {
      hit.hidden = !show;
      if (show) {
        const w = Math.max(48, this.rh * 0.62), h = Math.max(48, this.rh * 0.9);
        Object.assign(hit.style, { left: `${this.R.x - w / 2}px`, top: `${this.R.y - this.rh * 0.98}px`, width: `${w}px`, height: `${h}px` });
      }
    }
  }

  // The Play bubble by the waiting rocket: above it if that covers nothing (the top bar, another
  // level and its stars, the portal), else under the rocket's level, else to one side (D-066).
  placePlay() {
    const play = this.el.play, R = this.R, L = this.lay, W = this.W;
    const bw = play.offsetWidth || 120, bh = play.offsetHeight || 54, tail = 14, rw = this.rh * 0.6;
    const own = L.marks.find((k) => k.id === R.at) || { x: R.x, y: R.y + 30, r: 30 };
    const cands = [
      { cls: 'up', x: R.x - bw / 2, y: R.y - this.rh * 1.02 - tail - bh },
      { cls: 'below', x: own.x - bw / 2, y: own.y + own.r * 1.95 + tail },
      { cls: 'right', x: R.x + rw / 2 + tail, y: R.y - this.rh * 0.55 - bh / 2 },
      { cls: 'left', x: R.x - rw / 2 - tail - bw, y: R.y - this.rh * 0.55 - bh / 2 },
    ];
    const boxes = L.marks.filter((k) => k !== own).map((k) => [k.x - k.r - 4, k.y - k.r - 4, k.x + k.r + 4, k.y + k.r * 1.95 + 4]);
    if (L.portal) boxes.push([L.portal.x - L.portal.r * 1.2, L.portal.y - L.portal.r * 1.3, L.portal.x + L.portal.r * 1.2, L.portal.y + L.portal.r * 1.3 + 22]);
    const hits = (c) => boxes.some(([a, b, cc, d]) => c.x < cc && a < c.x + bw && c.y < d && b < c.y + bh);
    const fits = (c) => c.x >= 6 && c.x + bw <= W - 6 && c.y >= L.top && c.y + bh <= L.ground - 4;
    const pick = cands.find((c) => fits(c) && !hits(c)) || cands.find(fits) || cands[0];
    if (play.dataset.side !== pick.cls) play.dataset.side = pick.cls;
    play.style.left = `${clamp(pick.x, 6, W - bw - 6)}px`;
    play.style.top = `${Math.max(L.top, pick.y)}px`;
  }

  // ---------- drawing: the map ----------

  ship() { return SHIP_BY_ID[this.io.ship()] || SHIP_BY_ID[STARTER]; }

  // The ship flown, standing (or flying) with its feet at (x, y).
  drawFlown(ctx, x, y, h, t, dt, { rot = 0, legs = 1, flame = 0, sx = 1, sy = 1, mood = 'happy' } = {}) {
    const ship = this.ship(), sq = this.squash ? 0.18 * this.squash * Math.cos((1 - this.squash) * 18) : 0;
    const sY = sy * (1 - sq), sX = sx * (1 + sq * 0.6);
    if (ship.id === STARTER) {
      drawRocket(ctx, { x, y: y - h * 0.5, h, rot, sx: sX, sy: sY, legs, flame, pilotIn: true, blink: ((t % 3.4) < 0.14 ? 1 : 0), mood, look: 0 }, t);
      return;
    }
    const S = this.SS;
    Object.assign(S, { x, y: y - h * 0.5, h, rot, legs, thrust: flame, air: flame > 0.05, pilotIn: true, mood, gy: y, calm: this.calm });
    tickShip(ship, S, this.P, dt, t);
    S.sx = sX; S.sy = sY;
    this.P.update(dt);
    drawTrail(ctx, ship, S, t); this.P.draw(ctx, 'back'); drawShip(ctx, ship, S, t); this.P.draw(ctx, 'front');
  }

  drawMap(ctx, t, dt) {
    const L = this.lay;
    if (!L) return;
    const p = this.P_(), sys = this.map[this.s], PL = PLANETS[sys.planet], marks = L.marks;
    const intro = this.intro >= 0 ? this.intro : 99;
    // the path: a dark shadow, the dotted trail flowing towards the new level, and gold where passed
    const path = L.path;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = rgba(INK, 0.45); ctx.lineWidth = 12; ctx.stroke();
    ctx.setLineDash([2, 13]); ctx.lineDashOffset = this.calm ? 0 : -t * 22;
    ctx.strokeStyle = rgba('#FFFFFF', 0.9); ctx.lineWidth = 6; ctx.stroke();
    ctx.setLineDash([]);
    // gold over each stretch from a passed level to the next
    marks.forEach((m, i) => {
      const b = marks[i + 1] || (i === marks.length - 1 ? L.portal : null);
      if (!b || bestOf(p, m.id) < PASS_STARS) return;
      if (b === L.portal && !reached(this.map, p, this.nextSystem())) return;
      const part = between(path, [m.x, m.y], [b.x, b.y]);
      ctx.beginPath(); part.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = SUN; ctx.lineWidth = 5.5; ctx.stroke();
    });
    ctx.restore();
    this.drawPortal(ctx, t);
    // the markers
    marks.forEach((m, i) => {
      const k = intro < 99 ? ease.back(clamp((intro - i * 0.06) / 0.4, 0, 1)) : 1;
      if (k <= 0) return;
      this.drawMarker(ctx, m, i, t, k, p, PL, i === marks.length - 1);
    });
    // the rocket
    const R = this.R;
    if (R.shown && this.view === 'map' || (this.step && this.step.kind === 'warp' && R.shown)) {
      const idle = this.busy || this.calm ? 0 : Math.sin(t * 2.4) * 2;
      ctx.save();
      // its shadow on the marker
      if (R.legs > 0.5 && !this.busy) { ctx.fillStyle = rgba(INK, 0.3); ctx.beginPath(); ctx.ellipse(R.x, R.y + 2, this.rh * 0.22, 4, 0, 0, TAU); ctx.fill(); }
      this.drawFlown(ctx, R.x, R.y + idle - (R.legs > 0.5 && !this.busy ? 2 : 0), this.rh, t, dt, { rot: R.rot, legs: R.legs, flame: R.flame, sx: R.sx, sy: R.sy });
      ctx.restore();
    }
    this.drawBits(ctx);
  }

  drawMarker(ctx, m, i, t, k, p, PL, last) {
    const st = this.stateOf(m.id), fx = this.mk[m.id] || {}, best = bestOf(p, m.id);
    const shake = fx.shake ? Math.sin(fx.shake * 30) * 6 * fx.shake : 0;
    const bob = st === 'next' && !this.calm ? Math.sin(t * 3 + i) * 3 : 0;
    const press = fx.press ? 1 - 0.12 * Math.sin(fx.press * Math.PI) : 1;
    const pop = fx.pop ? 1 + 0.25 * Math.sin(fx.pop * Math.PI) : 1;
    const x = m.x + shake, y = m.y + bob, r = m.r * k * press * pop;
    ctx.save();
    // the flag over each system's last level (Bip's big moment, D-044)
    if (last) this.drawFlag(ctx, x - r * 0.82, y - r * 0.42, r * 0.9, t, st, best, -1);
    // shadow
    ctx.fillStyle = rgba('#0A0628', 0.45); ctx.beginPath(); ctx.ellipse(x, y + r * 0.82, r * 0.95, r * 0.34, 0, 0, TAU); ctx.fill();
    if (st === 'next') {
      const ph = this.calm ? 0.5 : (t * 0.7 + i * 0.1) % 1;
      ctx.strokeStyle = rgba(SUN, 0.7 * (1 - ph)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r * (1.1 + ph * 0.55), 0, TAU); ctx.stroke();
      halo(ctx, x, y, r * 2, SUN, 0.35);
    }
    if (st === 'done' && best === 3) halo(ctx, x, y, r * 1.7, PL.glow, 0.28);
    // the disc: a little landing pad, lit from above
    const unlocking = fx.unlock != null;
    const look = unlocking ? (fx.unlock > 0.45 ? 'next' : 'locked') : st;
    const fill = look === 'done' ? MINT : look === 'next' ? SUN : look === 'locked' ? DIM : '#FFFFFF';
    ctx.beginPath(); ctx.arc(x, y + r * 0.16, r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, mix(fill, '#FFFFFF', 0.55)); g.addColorStop(0.65, fill); g.addColorStop(1, mix(fill, INK, 0.25));
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(3, r * 0.14); ctx.strokeStyle = INK; ctx.stroke();
    if (look === 'done' && best === 3) { ctx.lineWidth = Math.max(2, r * 0.08); ctx.strokeStyle = SUN; ctx.beginPath(); ctx.arc(x, y, r * 0.84, 0, TAU); ctx.stroke(); }
    // a shine
    ctx.fillStyle = rgba('#FFFFFF', look === 'locked' ? 0.25 : 0.6);
    ctx.beginPath(); ctx.ellipse(x - r * 0.42, y - r * 0.46, r * 0.22, r * 0.12, -0.7, 0, TAU); ctx.fill();
    if (look === 'locked') {
      const a = unlocking ? 1 - clamp(fx.unlock / 0.45, 0, 1) : 1;
      ctx.globalAlpha = a; padlock(ctx, x, y - (unlocking ? fx.unlock * r * 2 : 0) + r * 0.05, r * 1.05); ctx.globalAlpha = 1;
    } else {
      text(ctx, String(m.n + 1), x, y + r * 0.06, r * 1.05, { fill: INK, stroke: null });
    }
    // the best stars under it, new ones popping in
    if (best > 0 && !unlocking) {
      const sz = r * 0.36, gap = sz * 2.15, sy = y + r + sz * 1.05;
      const ann = this.ann && this.ann.id === m.id ? this.ann : null;
      for (let j = 0; j < 3; j++) {
        let s2 = sz, on = j < best;
        if (ann && j >= ann.from && j < ann.to) {
          const kk = clamp((this.annT - 0.3 - (j - ann.from) * 0.25) / 0.3, 0, 1);
          if (kk < 1) { on = kk > 0; s2 = sz * (kk > 0 ? ease.back(kk) * 1.0 : 1); }
          if (kk > 0 && !ann[`d${j}`]) { ann[`d${j}`] = true; this.io.sfx('ding'); this.burst(x + (j - 1) * gap, sy, 6, [SUN, '#FFFFFF']); }
        }
        starShape(ctx, x + (j - 1) * gap, sy + (j === 1 ? sz * 0.25 : 0), s2, on);
      }
    }
    // every rock found here: a little rock badge
    if (foundOf(p, m.id) >= ROCKS_PER_LEVEL && st !== 'locked') {
      const bx = x + r * 0.8, by = y - r * 0.72;
      ctx.beginPath(); ctx.arc(bx, by, r * 0.36, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      drawRock(ctx, bx, by + 1, r * 0.24, -0.2);
      if (!this.calm && Math.sin(t * 2 + i * 1.7) > 0.96) { ctx.fillStyle = '#FFFFFF'; sparkle(ctx, bx + r * 0.25, by - r * 0.25, 4); }
    }
    ctx.restore();
  }

  drawFlag(ctx, x, y, r, t, st, best, dir = 1) {
    const h = r * 1.5, wave = this.calm ? 0 : Math.sin(t * 4) * 0.12;
    ctx.save();
    if (dir < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    ctx.strokeStyle = '#E3E0F5'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    const fw = r * 1.1, fh = r * 0.72, col = st === 'locked' ? '#8F87C9' : best >= PASS_STARS ? SUN : CORAL;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.quadraticCurveTo(x + fw * 0.5, y - h - fh * (0.1 + wave), x + fw, y - h + fh * 0.05);
    ctx.lineTo(x + fw, y - h + fh * 0.95);
    ctx.quadraticCurveTo(x + fw * 0.5, y - h + fh * (0.8 - wave), x, y - h + fh);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.save(); ctx.translate(x + fw * 0.5, y - h + fh * 0.5); if (dir < 0) ctx.scale(-1, 1); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    star5(ctx, fh * 0.28); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.restore();
  }

  drawPortal(ctx, t) {
    const L = this.lay, o = L.portal, p = this.P_(), ns = this.nextSystem();
    if (!o || ns < 0) return;
    const S2 = this.map[ns], open = reached(this.map, p, ns), fx = this.mk.portal || {};
    const x = o.x + (fx.shake ? Math.sin(fx.shake * 30) * 5 * fx.shake : 0), y = o.y, r = o.r;
    const P2 = PLANETS[S2.planet], a = open ? 1 : 0.45;
    ctx.save();
    halo(ctx, x, y, r * 2.2, open ? P2.glow : '#8F87C9', open ? 0.45 : 0.18);
    const spin = this.calm ? 0 : t * 1.4;
    [P2.nebula[0], SKY, P2.nebula[1], '#FFFFFF'].forEach((c, i) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(spin * (i % 2 ? -1 : 1) + i);
      ctx.globalAlpha = a; ctx.setLineDash([r * 0.5, r * 0.22]);
      ctx.strokeStyle = c; ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath(); ctx.ellipse(0, 0, r * (1 - i * 0.2), r * 1.22 * (1 - i * 0.2), 0, 0, TAU); ctx.stroke();
      ctx.restore();
    });
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.55);
    g.addColorStop(0, rgba('#FFFFFF', open ? 0.95 : 0.3)); g.addColorStop(1, rgba(P2.nebula[0], 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
    if (!open) padlock(ctx, x, y + r * 0.05, r * 0.7);
    // little sparkles drawn into it
    if (open && !this.calm) for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i / 5) % 1, ang = i * 2.4 + t * 0.8; ctx.globalAlpha = ph; ctx.fillStyle = '#FFFFFF'; sparkle(ctx, x + Math.cos(ang) * r * 1.6 * (1 - ph), y + Math.sin(ang) * r * 1.6 * (1 - ph), 3.5); }
    ctx.globalAlpha = 1;
    text(ctx, S2.soon ? `${S2.name}: soon` : `to ${S2.name}`, x, y + r * 1.22 + 14, clamp(r * 0.42, 12, 17), { fill: open ? '#FFFFFF' : '#CFCBEF' });
    ctx.restore();
  }

  drawBits(ctx) {
    for (const b of this.bits) {
      const k = 1 - b.age / b.life;
      ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
      ctx.fillStyle = b.col;
      if (b.kind === 'star') { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot + b.age * 4); sparkle(ctx, 0, 0, b.size); ctx.restore(); }
      else { ctx.globalAlpha = 0.7 * k * k; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- drawing: the galaxy (D-065) ----------

  drawSpace(ctx, t, seed, tint) {
    const { W, H } = this;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07051C'); g.addColorStop(0.55, '#130E3D'); g.addColorStop(1, '#221A5C');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r = rng(seed);
    (tint || ['#6C5CE7', '#FF7EC8', '#3FE0A0']).forEach((c, i) => { halo(ctx, r() * W, r() * H, Math.max(W, H) * (0.3 + r() * 0.25), c, 0.13); });
    const n = Math.round(clamp((W * H) / 2600, 80, 420));
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * H, s = 0.4 + r() * 1.3, ph = r() * TAU, sp = 0.6 + r() * 2;
      ctx.globalAlpha = this.calm ? 0.7 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * sp + ph));
      ctx.fillStyle = r() < 0.1 ? '#FFE7A8' : '#FFFFFF';
      if (r() < 0.04) sparkle(ctx, x, y, s * 3.5); else { ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  drawGalaxy(ctx, t, dt) {
    const L = this.gxLay;
    if (!L) return;
    this.gxT = (this.gxT || 0) + dt;
    const p = this.P_();
    this.drawSpace(ctx, t, 909);
    // a comet now and then
    if (!this.calm) {
      const ph = (t * 0.09) % 1, cx = lerp(-80, this.W + 80, ph), cy = this.H * 0.18 + Math.sin(ph * 3) * 20;
      const cg = ctx.createLinearGradient(cx, cy, cx - 90, cy - 30); cg.addColorStop(0, rgba('#FFFFFF', 0.85)); cg.addColorStop(1, rgba(SKY, 0));
      ctx.strokeStyle = cg; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 90, cy - 30); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.fill();
    }
    // the path: stepping stones, gold up to the furthest system reached
    const far = Math.max(...L.orbs.filter((o) => reached(this.map, p, o.s)).map((o) => o.s), 0);
    const goldTo = between(L.path, [L.orbs[0].x, L.orbs[0].y], [L.orbs[far].x, L.orbs[far].y]).length;
    let acc = 0;
    for (let i = 1; i < L.path.length; i++) {
      const [x0, y0] = L.path[i - 1], [x1, y1] = L.path[i];
      acc += Math.hypot(x1 - x0, y1 - y0);
      if (acc < 15) continue;
      acc = 0;
      const gold = i < goldTo, tw = this.calm ? 1 : 0.75 + 0.25 * Math.sin(t * 3 - i * 0.3);
      ctx.beginPath(); ctx.arc(x1, y1, gold ? 3.6 : 2.6, 0, TAU);
      ctx.fillStyle = gold ? rgba(SUN, tw) : rgba('#FFFFFF', 0.45 * tw); ctx.fill();
      if (gold) { ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(INK, 0.6); ctx.stroke(); }
    }
    // the planets
    L.orbs.forEach((o) => {
      const sys = this.map[o.s], open = reached(this.map, p, o.s), here = o.s === this.s;
      const sh = o.shake ? Math.sin(o.shake * 30) * 6 * o.shake : 0;
      if (o.shake) o.shake = Math.max(0, o.shake - dt * 2.6);
      const k = ease.back(clamp((this.gxT - o.s * 0.07) / 0.45, 0, 1));
      const bob = this.calm ? 0 : Math.sin(t * 1.6 + o.s) * 3;
      const x = o.x + sh, y = o.y + bob, r = o.r * k;
      if (r <= 0) return;
      if (open) halo(ctx, x, y, r * 1.9, PLANETS[sys.planet].glow, here ? 0.5 : 0.28);
      if (here) {
        const ph = this.calm ? 0.4 : (t * 0.6) % 1;
        ctx.strokeStyle = rgba(SUN, 0.8 * (1 - ph)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r * (1.25 + ph * 0.5), 0, TAU); ctx.stroke();
      }
      // a planet not reached yet shows faintly, behind a padlock, so a child can see what's coming
      if (!open) ctx.globalAlpha = 0.42;
      drawPlanetBall(ctx, sys.planet, x, y, PLANETS[sys.planet].rings ? r * 0.82 : r, false);
      ctx.globalAlpha = 1;
      if (!open) padlock(ctx, x + r * 0.55, y + r * 0.5, r * 0.62);
      const fs = clamp(r * 0.42, 13, 20);
      text(ctx, sys.name, x, y + r * (PLANETS[sys.planet].rings ? 1.05 : 1) + fs * 0.95, fs, { fill: open ? '#FFFFFF' : '#A9A3D6' });
      if (open) {
        const st = systemStars(this.map, p, o.s), sy = y + r + fs * 2.15;
        starShape(ctx, x - fs * 1.7, sy, fs * 0.5, true);
        text(ctx, `${st.got} of ${st.of}`, x + fs * 0.35, sy + 1, fs * 0.8, { fill: SUN });
      } else {
        text(ctx, sys.soon ? 'coming soon' : 'locked', x, y + r + fs * 2.15, fs * 0.75, { fill: '#A9A3D6', weight: 600 });
      }
    });
    // the rocket: by the planet it's at, or flying along the path to another
    let rx, ry, rot = 0, flame = 0.4;
    const here = L.orbs[this.s];
    if (this.fly) {
      const F = this.fly;
      F.t += dt;
      const k = ease.inOut(clamp(F.t / F.dur, 0, 1)), q = along(F.path, k);
      rx = q.x; ry = q.y - L.r * 0.3; rot = q.a + Math.PI / 2; flame = 1.1;
      if (!this.calm && Math.random() < 0.5) this.bits.push({ kind: 'star', x: rx, y: ry, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, g: 0, life: 0.5, age: 0, size: 2 + Math.random() * 3, col: Math.random() < 0.5 ? SUN : '#FFFFFF', rot: 0 });
      if (F.t >= F.dur) {
        const s2 = F.to;
        this.fly = null;
        this.view = 'map'; this.el.gx.hidden = true; this.el.map.hidden = false; this.io.covered(false);
        this.s = s2;
        const at = placeIn(this.map, this.P_(), s2);
        if (at) this.io.move(at);
        this.layout(); this.paintBar();
        this.R.shown = false;
        this.queue({ kind: 'warp', dur: this.calm ? 0.35 : 0.7, to: s2 });
        return;
      }
    } else {
      rx = here.x + here.r * 0.95; ry = here.y - here.r * 0.6 + (this.calm ? 0 : Math.sin(t * 2.4) * 3); rot = 0.35;
    }
    const h = clamp(L.r * 1.25, 36, 70);
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(rot); ctx.translate(-rx, -ry);
    this.drawFlown(ctx, rx, ry + h * 0.5, h, t, dt, { legs: 0, flame });
    ctx.restore();
    this.drawBits(ctx);
  }

  // ---------- drawing: hyperspace and the warp ----------

  drawHyper(ctx, t, dt) {
    const Y = this.hy;
    if (!Y) return;
    Y.t += dt;
    const { W, H } = this, k = clamp(Y.t / Y.dur, 0, 1), cx = W / 2, cy = H / 2;
    // deep space, tinted from the old system's colours to the new one's
    ctx.fillStyle = '#04021A'; ctx.fillRect(0, 0, W, H);
    halo(ctx, cx, cy, Math.max(W, H) * 0.7, mix(Y.from.nebula[0], Y.to.nebula[0], k), 0.35);
    if (this.calm) {
      // calm: stars drift gently by; no streaks, no flash
      const r = rng(77);
      for (let i = 0; i < 160; i++) { const x = (r() * W - Y.t * 40 * (0.3 + r())) % W; ctx.globalAlpha = 0.4 + r() * 0.5; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x < 0 ? x + W : x, r() * H, 0.6 + r() * 1.2, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {
      // streaks rushing out from the middle, faster and faster
      const speed = 260 + 2600 * ease.in(clamp(Y.t / (Y.dur * 0.8), 0, 1)), far = Math.hypot(W, H) * 0.55;
      // a tunnel of light opening up ahead
      const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, far);
      tg.addColorStop(0, rgba('#FFFFFF', 0.18 + 0.12 * k)); tg.addColorStop(0.25, rgba(Y.to.glow, 0.12)); tg.addColorStop(1, rgba('#04021A', 0));
      ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H);
      const cols = [SKY, '#FFFFFF', LILAC, '#FF7EC8', Y.to.glow, Y.to.nebula[0]];
      if (!Y.streaks.length) for (let i = 0; i < 240; i++) Y.streaks.push({ a: Math.random() * TAU, d: Math.random() * far, w: 1 + Math.random() * 2.8, c: cols[i % cols.length] });
      while (Y.streaks.length < 240) Y.streaks.push({ a: Math.random() * TAU, d: 4 + Math.random() * 40, w: 1 + Math.random() * 2.8, c: cols[Math.floor(Math.random() * cols.length)] });
      ctx.lineCap = 'round';
      for (const s of Y.streaks) {
        s.d += speed * dt * (0.3 + s.d / 300);
        const len = clamp(speed * 0.08 * (0.2 + s.d / 250), 3, 320);
        const x0 = cx + Math.cos(s.a) * s.d, y0 = cy + Math.sin(s.a) * s.d, x1 = cx + Math.cos(s.a) * (s.d + len), y1 = cy + Math.sin(s.a) * (s.d + len);
        ctx.strokeStyle = rgba(s.c, clamp(0.25 + s.d / 140, 0, 1)); ctx.lineWidth = s.w * (0.6 + s.d / far); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      Y.streaks = Y.streaks.filter((s) => s.d < far * 1.4);
    }
    // the rocket, nose to the right, shaking with speed
    const h = clamp(Math.min(W, H) * 0.28, 70, 170), shake = this.calm ? 0 : Math.sin(t * 60) * 2 * k;
    ctx.save(); ctx.translate(cx + shake, cy + (this.calm ? Math.sin(Y.t * 2) * 6 : 0)); ctx.rotate(Math.PI / 2); ctx.translate(-cx, -cy);
    this.drawFlown(ctx, cx, cy + h * 0.5, h, t, dt, { legs: 0, flame: 1.25 });
    ctx.restore();
    const fs = clamp(Math.min(W, H) * 0.11, 30, 64);
    const pulse = this.calm ? 1 : 1 + Math.sin(t * 8) * 0.04;
    ctx.save(); ctx.translate(cx, fs * 1.1); ctx.scale(pulse, pulse);
    text(ctx, 'Hyperspace!', 0, 0, fs, { fill: SUN });
    ctx.restore();
    text(ctx, `Off to ${Y.name}…`, cx, H - fs * 0.8, fs * 0.5, { fill: '#FFFFFF' });
    // the flash at the end, and then the new system
    if (!this.calm && k > 0.82) { ctx.fillStyle = rgba('#FFFFFF', clamp((k - 0.82) / 0.12, 0, 1)); ctx.fillRect(0, 0, W, H); }
    if (Y.t >= Y.dur) {
      const done = Y.done; this.hy = null;
      if (done) done();
    }
  }

  drawWarp(ctx, k, t) {
    const { W, H } = this, cx = W / 2, cy = H / 2;
    const a = Math.sin(k * Math.PI);
    if (this.calm) { ctx.fillStyle = rgba('#07051C', a); ctx.fillRect(0, 0, W, H); return; }
    ctx.fillStyle = rgba('#07051C', a * 0.92); ctx.fillRect(0, 0, W, H);
    const r = rng(31);
    ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      const ang = r() * TAU, d = 20 + r() * Math.max(W, H) * 0.6, len = 30 + a * 200 * r();
      ctx.strokeStyle = rgba([SKY, '#FFFFFF', LILAC][i % 3], a * 0.9); ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d); ctx.lineTo(cx + Math.cos(ang) * (d + len), cy + Math.sin(ang) * (d + len)); ctx.stroke();
    }
  }

  // ---------- for the tests ----------

  state() {
    const p = this.P_();
    return {
      view: this.view, system: this.map[this.s] ? this.map[this.s].id : null, s: this.s, at: p.at, rocketAt: this.R.at, busy: this.busy,
      step: this.step ? this.step.kind : null, banner: this.el.banner.hidden ? null : this.el.banner.textContent,
      markers: this.lay && this.view !== 'galaxy' ? this.lay.marks.map((m) => ({ id: m.id, n: m.n + 1, state: this.stateOf(m.id), stars: bestOf(p, m.id), rocks: foundOf(p, m.id), x: m.x, y: m.y, r: m.r })) : [],
      portal: this.lay && this.lay.portal ? { x: this.lay.portal.x, y: this.lay.portal.y, r: this.lay.portal.r } : null,
      rocket: { x: this.R.x, y: this.R.y, shown: this.R.shown, h: this.rh, ship: this.ship().id },
      galaxy: this.view === 'galaxy' && this.gxLay ? this.gxLay.orbs.map((o) => ({ id: this.map[o.s].id, x: o.x, y: o.y, r: o.r, reached: reached(this.map, p, o.s),
        soon: !!this.map[o.s].soon, here: o.s === this.s, stars: systemStars(this.map, p, o.s) })) : null,
      flying: !!this.fly, hyper: this.hy ? { t: this.hy.t, dur: this.hy.dur, to: this.hy.name } : null,
    };
  }
}
