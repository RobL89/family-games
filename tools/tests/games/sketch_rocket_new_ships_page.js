// The step 2d-1 mock-up page (D-073 to D-077): the five new ships landing as in play, in Bip's
// moment, side by side at their size in play, and in the game's own showroom with all thirteen.
// Version 1.0. A mock-up, not the game: bundled by tools/tests/games/sketch_rocket_new_ships.py,
// which splices the new ships (sketch_rocket_new_ships.js) into copies of ships.js, fleet.js and
// sound.js for this page only. Rocks and ships here are pretend, kept in memory, lost on a reload.

import { SHIPS, SHIP_BY_ID, TIERS, Parts, newState, tickShip, landShip, drawShip, drawTrail } from '../_common/rocket/ships.js';
import { Scene, drawPilot, drawLadder, ladderEnds, clamp, lerp, ease, mix, INK } from '../_common/rocket/scene.js';
import { makeLine } from '../_common/rocket/numbers.js';
import { play, speak, canSpeak, setMuted, SOUND_NAMES } from '../_common/rocket/sound.js';
import { FLEET, FLEET_BY_ID, buy as fleetBuy, pick as fleetPick } from '../_common/rocket/fleet.js';
import { Hangar } from '../_common/rocket/hangar.js';

const TAU = Math.PI * 2;
const NEW = ['tub', 'jack', 'sunflower', 'spin', 'tree'];
const PLANET_OF = { classic: 0, tub: 5, jack: 2, sunflower: 4, spin: 0, tree: 3 };
const SEAT = { x: 0, y: 0.255, s: 0.3 }; // the Classic's window, as round.js's hop starts
const seatOf = (ship, S) => (ship.seat ? ship.seat(S) : SEAT);
const FIN = { ladder: 0.5, out: 0.95, down: 1.75, walk: 2.05, flag: 2.0, stars: 2.55, bang: 3.1, end: 4.5 }; // as round.js
const BURST_AT = [{ x: 0.2, y: 0.24, r: 0.2, n: 18, turn: 0.1 }, { x: 0.8, y: 0.28, r: 0.22, n: 18, turn: 0 }, { x: 0.5, y: 0.16, r: 0.16, n: 16, turn: 0.3 }];
const PLAY = { W: 844, H: 390 }; // a phone held sideways
const PLAY_H = clamp(Math.min(PLAY.H * 0.15, PLAY.W * 0.2), 56, 128); // scene.js's rocketH there: 58.5 px
const DEVICES = { sideways: { w: 844, h: 390, label: 'Phone sideways' }, upright: { w: 390, h: 844, label: 'Phone upright' }, pc: { w: 1280, h: 800, label: 'PC' } };

// ---------- shared settings: sound, less motion, pretend rocks ----------

const opts = { sound: false, calm: false };
const reduce = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
opts.calm = reduce;
setMuted(true);
const sfx = (name) => { if (opts.sound) play(name); };
// Sound on, from a tap (browsers start sound only from one), and the bar's button to match.
function soundOn() {
  opts.sound = true; setMuted(false); play('tap');
  const b = document.querySelector('#bar button[data-k="sound"]'); if (b) b.setAttribute('aria-pressed', 'true');
}
const say = (text) => { if (opts.sound && canSpeak()) speak(text); };
const allParts = [];
function parts() { const p = new Parts(); p.k = opts.calm ? 0.35 : 1; allParts.push(p); return p; }
let wallet = { rocks: 120, ships: ['classic'], ship: 'classic' };

// ---------- timing, for the check ----------

const perfs = {};
function timed(name, fn) {
  const a = performance.now(); fn(); const d = performance.now() - a;
  (perfs[name] = perfs[name] || []).push(d);
}

// ---------- 1. a card per new ship: a landing as in play, or Bip's moment ----------

class Card {
  constructor(root, ship) {
    this.ship = ship; this.mode = 'land'; this.T = 0; this.loud = false;
    const fig = document.createElement('figure'); fig.className = 'ship-card'; fig.id = `card-${ship.id}`;
    const T = TIERS[ship.tier];
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('role', 'img'); this.canvas.setAttribute('aria-label', `${ship.name}, moving`);
    const cap = document.createElement('figcaption');
    cap.innerHTML = `<div class="cardhead"><b class="sname"></b> <span class="tier t-${ship.tier}">${T.name} · ${ship.price} rocks</span></div><p class="look"></p>`
      + '<div class="seg" role="group" aria-label="Show"><button type="button" aria-pressed="true" data-m="land">A landing</button>'
      + '<button type="button" aria-pressed="false" data-m="moment">Bip\'s moment</button><button type="button" data-m="again">Again, with sound</button></div>';
    cap.querySelector('.sname').textContent = ship.name;
    cap.querySelector('.look').textContent = ship.look;
    cap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const m = b.dataset.m;
      if (m === 'again') { soundOn(); this.loud = true; this.restart(); return; }
      this.setMode(m);
    }));
    this.canvas.addEventListener('click', () => { soundOn(); this.loud = true; this.restart(); });
    fig.append(this.canvas, cap); root.appendChild(fig);
    this.fig = fig; this.cap = cap;
    this.ctx = this.canvas.getContext('2d');
    this.scene = new Scene(this.canvas);
    this.P = parts();
    this.resize();
  }
  setMode(m) {
    this.mode = m;
    this.cap.querySelectorAll('button[data-m="land"],button[data-m="moment"]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.m === m)));
    this.restart();
  }
  resize() {
    const W = Math.max(240, Math.round(this.fig.clientWidth || 320)), H = Math.round(W * 0.72);
    this.W = W; this.H = H;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.scene.setPlanet(PLANET_OF[this.ship.id] ?? 0);
    this.scene.setLine(makeLine({ from: 0, to: 10, step: 1 }), 1, 'fraction');
    this.scene.setLabelLook('plain');
    this.scene.resize(W, H, dpr);
    this.scene.calm = opts.calm;
    this.h = Math.round(clamp(H * 0.24, 52, 110));
    this.scene.rocketH = this.h;
    this.restart();
  }
  restart() {
    this.T = 0; this.P.clear(); this.P.k = opts.calm ? 0.35 : 1;
    this.S = newState(this.h);
    this.S.dust = mix(this.scene.planet.glow || '#EDE8FF', '#FFFFFF', 0.5);
    this.S.calm = opts.calm;
    this.target = this.mode === 'land' ? 3 : 4;
    this.dir = 1; this.S.side = 1;
    this.landed = false; this.fin = null; this.pilot = null; this.ladder = null; this.flag = null; this.px = null; this.fired = {};
  }
  once(key, fn) { if (!this.fired[key]) { this.fired[key] = true; fn(); } }
  frame(dt, t) {
    this.T += dt;
    const { S, P, scene, ship } = this, h = this.h, W = this.W, gy = scene.groundY, T = this.T, DESC = 3;
    const tx = scene.xOf(this.target), loud = this.loud;
    S.gy = gy; S.calm = opts.calm;
    const V = { pad: null, bigFlag: null, fireworks: null, glow: null, shadow: null, flag: null };
    this.pilot = null; this.ladder = null;
    if (T < DESC) {
      const u = T / DESC;
      S.air = true; S.legs = clamp((u - 0.62) / 0.3, 0, 1); S.thrust = 0.45 + 0.55 * u; S.pilotIn = true;
      S.x = lerp(W * 0.78, tx, ease.inOut(u)) + Math.sin(u * TAU) * W * 0.06 * (1 - u);
      S.y = lerp(-h * 0.9, gy - h * 0.5, 1 - Math.pow(1 - u, 1.6));
      const vx = this.px == null ? 0 : (S.x - this.px) / Math.max(dt, 1e-3);
      S.steer = clamp(vx / 160, -1, 1); S.rot = clamp(vx / 1400, -0.16, 0.16);
      this.px = S.x;
      V.shadow = { x: S.x, half: 0, k: clamp(u, 0, 1), a: 1, fromY: S.y + h * 0.5, beam: true, snap: null };
    } else {
      const tau = T - DESC;
      if (!this.landed) {
        this.landed = true; S.x = tx; S.y = gy - h * 0.5; S.rot = 0; S.steer = 0; S.legs = 1; S.thrust = 0; S.air = false;
        this.dir = S.x < W / 2 ? 1 : -1; S.side = this.dir;
        landShip(ship, S, P);
        if (loud) sfx('puff');
      }
      if (tau >= 0.12) this.once('touch', () => { if (loud) sfx(ship.sound); });
      if (this.mode === 'land') this.landing(tau, V, dt, t);
      else this.moment(tau, V, dt, t);
    }
    tickShip(ship, S, P, dt, t);
    P.update(dt);
    this.draw(V, dt, t);
  }
  // A right landing, not the round's last: as round.js today, with Bip hopping out from the
  // ship's seat (or down its own ladder) to plant the small flag, and back.
  landing(tau, V, dt, t) {
    const { S, ship, scene } = this, h = this.h, gy = scene.groundY, dir = this.dir, s = h * 0.5, loud = this.loud;
    if (tau < 3.05) V.glow = { value: this.target, a: clamp(tau / 0.3, 0, 1) };
    const out = { x: S.x + dir * (h * 0.42 + s * 0.38), y: gy - 1 };
    const seat = seatOf(ship, S), win = { x: S.x + seat.x * h, y: S.y + seat.y * h }, s0 = seat.s * h;
    const own = ship.ladder ? ship.ladder(S) : null;
    const foot = own ? { x: S.x + own.foot.x * h, y: gy - 1 } : null;
    if (tau >= 0.45 && tau < 2.85) {
      S.pilotIn = false;
      const P0 = { x: out.x, y: out.y, s, mood: 'happy', wave: false, squash: 0, flip: dir < 0, blink: S.blink };
      if (tau < 0.9) {
        if (own && tau < 0.85) { const k = clamp((tau - 0.45) / 0.4, 0, 1); P0.x = lerp(win.x, foot.x, k); P0.y = lerp(win.y, foot.y, k) - Math.abs(Math.sin(k * Math.PI * 4)) * s * 0.05; P0.s = lerp(s0, s, k); }
        else if (own) { const k = clamp((tau - 0.85) / 0.05, 0, 1); P0.x = lerp(foot.x, out.x, k); }
        else { const k = clamp((tau - 0.45) / 0.45, 0, 1); P0.x = lerp(win.x, out.x, k); P0.y = lerp(win.y, out.y, k) - Math.sin(k * Math.PI) * h * 0.75; P0.s = lerp(s0, s, k); }
        if (tau >= 0.45) this.once('out', () => { if (loud) sfx('pop'); });
      } else if (tau < 2.45) {
        const a2 = tau - 0.9;
        P0.squash = 0.25 * Math.exp(-a2 * 8) * Math.cos(a2 * 22);
        P0.wave = tau > 1.4;
      } else {
        if (own && tau < 2.55) { const k = clamp((tau - 2.45) / 0.1, 0, 1); P0.x = lerp(out.x, foot.x, k); }
        else if (own) { const k = clamp((tau - 2.55) / 0.3, 0, 1); P0.x = lerp(foot.x, win.x, k); P0.y = lerp(foot.y, win.y, k) - Math.abs(Math.sin(k * Math.PI * 4)) * s * 0.05; P0.s = lerp(s, s0, k); }
        else { const k = clamp((tau - 2.45) / 0.4, 0, 1); P0.x = lerp(out.x, win.x, k); P0.y = lerp(out.y, win.y, k) - Math.sin(k * Math.PI) * h * 0.6; P0.s = lerp(s, s0, k); }
      }
      this.pilot = P0;
    } else S.pilotIn = true;
    if (tau >= 0.95) {
      const grow = tau < 3.05 ? clamp((tau - 0.95) / 0.45, 0, 1) : Math.max(0, 1 - (tau - 3.05) * 4);
      V.flag = { x: out.x + dir * s * 0.42, grow, text: String(this.target), dir };
      if (tau >= 1.15) this.once('ding', () => { if (loud) sfx('ding'); });
    }
    if (tau >= 3.05) this.takeOff(tau - 3.05);
    if (tau > 4.6) { this.loud = false; this.restart(); }
  }
  takeOff(u0) {
    const { S, scene } = this, h = this.h, gy = scene.groundY;
    this.once('lift', () => { if (this.loud) sfx('whoosh'); });
    S.air = true; S.thrust = 1; S.legs = clamp(1 - u0 * 3, 0, 1); S.pilotIn = true;
    const u = u0 / 1.4;
    S.y = gy - h * 0.5 - Math.pow(u, 2) * (gy + h * 1.6);
  }
  // The round's last landing: Bip's moment (D-044), as round.js today, but Bip starts from the
  // ship's seat and, on a ship with its own ladder, climbs down that instead of the rope ladder.
  moment(tau, V, dt, t) {
    const { S, ship, scene } = this, h = this.h, gy = scene.groundY, loud = this.loud;
    V.glow = { value: this.target, a: clamp(tau / 0.3, 0, 1) };
    const F = tau - 0.6;
    if (F < 0) return;
    if (!this.fin) {
      const dir = this.dir, s = h * 0.5, outX = S.x + dir * (h * 0.42 + s * 0.38);
      this.fin = { dir, outX, plantX: outX + dir * s * 0.18, flagX: outX + dir * s * 0.55, bursts: [], fired: 0 };
    }
    const Fi = this.fin, s = h * 0.5;
    const end = F > 4.8 ? clamp((F - 4.8) / 0.5, 0, 1) : 0;
    if (F < 5.4) V.pad = { x: S.x, k: clamp(F / 0.5, 0, 1) * (1 - end) };
    if (F >= FIN.ladder) this.once('lad', () => { if (loud) sfx('pop'); });
    const own = ship.ladder ? ship.ladder(S) : null;
    let top, foot;
    if (own) { top = { x: S.x + own.top.x * h, y: S.y + own.top.y * h }; foot = { x: S.x + own.foot.x * h, y: gy - 1 }; }
    else { ({ top, foot } = ladderEnds(S.x, gy, h, Fi.dir)); this.ladder = { x: S.x, dir: Fi.dir, k: clamp((F - FIN.ladder) / 0.4, 0, 1) * (1 - end) }; }
    const seat = seatOf(ship, S), sw = { x: S.x + seat.x * h, y: S.y + seat.y * h }, s0 = seat.s * h;
    if (F >= FIN.out && end < 1) {
      S.pilotIn = false;
      const P0 = { x: 0, y: 0, s, mood: 'happy', wave: false, squash: 0, flip: Fi.dir < 0, blink: S.blink };
      const hop = own ? 0 : 0.25;
      if (F < FIN.out + hop) {
        const k = clamp((F - FIN.out) / hop, 0, 1);
        P0.x = lerp(sw.x, top.x, k); P0.y = lerp(sw.y, top.y + s * 0.15, k) - Math.sin(k * Math.PI) * h * 0.2; P0.s = lerp(s0, s, k);
      } else if (F < FIN.down) {
        const k = clamp((F - FIN.out - hop) / (FIN.down - FIN.out - hop), 0, 1);
        P0.x = lerp(top.x, foot.x, k); P0.y = lerp(own ? top.y : top.y + s * 0.15, gy - 1, k) - Math.abs(Math.sin(k * Math.PI * 4)) * s * 0.06;
        P0.s = own ? lerp(s0, s, k) : s;
      } else if (F < FIN.walk) {
        const k = ease.inOut(clamp((F - FIN.down) / (FIN.walk - FIN.down), 0, 1));
        P0.x = lerp(foot.x, Fi.plantX, k); P0.y = gy - 1 - Math.abs(Math.sin(k * Math.PI * 2)) * s * 0.08;
      } else if (end > 0) {
        P0.x = lerp(Fi.plantX, sw.x, end); P0.y = lerp(gy - 1, sw.y, end) - Math.sin(end * Math.PI) * h * 0.45; P0.s = lerp(s, s0, end);
      } else {
        P0.x = Fi.plantX;
        const jump = !opts.calm && F > FIN.bang && F < FIN.end - 0.2;
        P0.y = gy - 1 - (jump ? Math.abs(Math.sin((F - FIN.bang) * 5.5)) * h * 0.22 : 0);
        P0.wave = F > FIN.flag + 0.3;
      }
      this.pilot = P0;
    }
    if (end >= 1) S.pilotIn = true;
    if (F >= FIN.flag && F < 5.4) {
      this.once('flag', () => { if (loud) sfx('whoosh'); });
      V.bigFlag = { x: Fi.flagX, dir: Fi.dir, grow: clamp((F - FIN.flag) / 0.5, 0, 1) * (1 - end), stars: 3, shown: clamp(Math.floor((F - FIN.stars) / 0.22) + 1, 0, 3) };
    }
    const fw = ship.fw, nb = opts.calm ? 1 : fw.length;
    while (Fi.fired < nb && F >= FIN.bang + Fi.fired * 0.3) {
      Fi.bursts.push({ ...BURST_AT[Fi.fired % BURST_AT.length], cols: fw[Fi.fired], k: 0, a: 1, age: 0 });
      if (loud) sfx(Fi.fired ? 'pop' : 'sparkle');
      Fi.fired += 1;
    }
    for (const b of Fi.bursts) { b.age += dt; b.k = ease.out(clamp(b.age / 0.8, 0, 1)); b.a = 1 - clamp((b.age - 0.9) / 0.9, 0, 1); }
    V.fireworks = Fi.bursts;
    if (F >= 5.4) this.takeOff(F - 5.4);
    if (F > 7) { this.loud = false; this.restart(); }
    void t;
  }
  draw(V, dt, t) {
    const { ctx, scene, S, P, ship } = this;
    scene.draw(V, t, dt);
    // the ship and its effects stay above the ground, as in play (round.js's drawFlyShip, ER-003)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, this.W, scene.groundY + 6); ctx.clip();
    drawTrail(ctx, ship, S, t); P.draw(ctx, 'back');
    drawShip(ctx, ship, S, t);
    P.draw(ctx, 'front');
    ctx.restore();
    if (this.ladder && this.ladder.k > 0.01) drawLadder(ctx, this.ladder, scene.groundY, this.h);
    if (this.pilot) drawPilot(ctx, this.pilot, t);
  }
}

// ---------- 2. all six at their size in play, on a sideways phone's line ----------

class Strip {
  constructor(root) {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'The Classic and the five new ships standing on the number line at their size in play, landing in turn');
    this.canvas.className = 'strip';
    root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.scene = new Scene(this.canvas);
    this.ids = ['classic', ...NEW];
    this.T = 0;
    this.layout();
  }
  layout() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.scene.setPlanet(0);
    this.scene.setLine(makeLine({ from: 0, to: 10, step: 1 }), 1, 'fraction');
    this.scene.setLabelLook('plain');
    this.scene.resize(PLAY.W, PLAY.H, dpr);
    Object.assign(this.canvas.style, { width: '100%', height: 'auto' }); // scaled to fit, never cropped
    this.scene.calm = opts.calm;
    this.h = this.scene.rocketH; // 58.5 on a sideways phone, as in play
    const gy = this.scene.groundY;
    this.ships = this.ids.map((id, i) => {
      const S = newState(this.h); S.x = this.scene.xOf(i * 2); S.y = gy - this.h * 0.5; S.gy = gy; S.legs = 1; S.dust = '#EDE8FF'; S.side = i < 3 ? 1 : -1;
      return { ship: SHIP_BY_ID[id], S, P: parts(), at: i * 1.15 + 0.6, landed: true };
    });
  }
  frame(dt, t) {
    this.T += dt;
    const gy = this.scene.groundY, h = this.h, cyc = 8;
    for (const o of this.ships) {
      const { S } = o, u = (this.T + cyc - o.at) % cyc;
      S.calm = opts.calm;
      if (u < 0.5) { const k = ease.out(u / 0.5); S.air = true; S.thrust = 0.9; S.legs = 1 - k; S.y = gy - h * 0.5 - k * h * 1.1; o.landed = false; }
      else if (u < 1.3) { const k = ease.inOut((u - 0.5) / 0.8); S.air = true; S.thrust = 0.6; S.legs = clamp((k - 0.5) * 2.5, 0, 1); S.y = gy - h * 0.5 - (1 - k) * h * 1.1; }
      else { if (!o.landed) { o.landed = true; S.y = gy - h * 0.5; S.legs = 1; landShip(o.ship, S, o.P); } S.air = false; S.thrust = 0; }
      tickShip(o.ship, S, o.P, dt, t);
      o.P.update(dt);
    }
    const ctx = this.ctx, sc = this.scene;
    sc.draw({}, t, dt);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PLAY.W, gy + 6); ctx.clip();
    for (const o of this.ships) { drawTrail(ctx, o.ship, o.S, t); o.P.draw(ctx, 'back'); drawShip(ctx, o.ship, o.S, t); o.P.draw(ctx, 'front'); }
    ctx.restore();
  }
}

// How wide each ship is, measured from its drawing standing still (legs out, Bip aboard), and
// across its feet (its lowest tenth) both standing and at its landing joke, in units of its height.
function measure(ship) {
  const H = 200, c = document.createElement('canvas'); c.width = 600; c.height = 600;
  const ctx = c.getContext('2d'), S = newState(H);
  const scan = (y0, y1) => {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let x0 = Infinity, x1 = -Infinity, lo = -Infinity;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] < 40) continue;
      if (y >= y0 && y <= y1) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
      if (y > lo) lo = y;
    }
    return { w: x1 >= x0 ? (x1 - x0 + 1) / H : 0, lo };
  };
  const at = (fn) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); fn(); };
  Object.assign(S, { x: 300, y: 330, legs: 1, air: false, idle: false, pilotIn: true, gy: 330 + H / 2 });
  const feetY = S.y + H / 2;
  at(() => drawShip(ctx, ship, S, 0));
  const all = scan(0, c.height), feet = scan(feetY - H * 0.1, feetY + H * 0.05);
  // the landing joke, 0.4 s after touchdown (just before Bip hops out in play)
  const P = new Parts(); P.k = 0;
  landShip(ship, S, P); S.side = 1;
  for (let i = 0; i < 24; i++) tickShip(ship, S, P, 1 / 60, i / 60);
  at(() => drawShip(ctx, ship, S, 0.4));
  const joke = scan(feetY - H * 0.1, feetY + H * 0.05);
  return { id: ship.id, wide: all.w, feet: feet.w, jokeFeet: joke.w, below: (all.lo - feetY) / H };
}

// ---------- 3. the game's own showroom (hangar.js, unchanged), with all thirteen ships ----------

class Showroom {
  constructor(wrap, sizes) {
    this.wrap = wrap; this.size = 'sideways';
    this.box = document.createElement('div'); this.box.className = 'device';
    this.stage = document.createElement('div'); this.stage.className = 'stage-inner';
    this.btn = document.createElement('button'); this.btn.type = 'button'; this.btn.className = 'opendoor'; this.btn.textContent = 'Open the hangar door';
    this.btn.addEventListener('click', () => this.open());
    this.stage.appendChild(this.btn);
    this.box.appendChild(this.stage); wrap.appendChild(this.box);
    this.hangar = new Hangar(this.stage, {
      progress: () => wallet,
      buy: (id) => { const p = fleetBuy(wallet, id); if (!p) return false; wallet = p; paintRocks(); return true; },
      pick: (id) => { const p = fleetPick(wallet, id); if (!p) return false; wallet = p; return true; },
      sfx, say,
      calm: () => opts.calm,
      closed: () => { this.btn.hidden = false; },
    });
    for (const [k, d] of Object.entries(DEVICES)) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = d.label; b.dataset.size = k;
      b.setAttribute('aria-pressed', String(k === this.size));
      b.addEventListener('click', () => this.setSize(k));
      sizes.appendChild(b);
    }
    this.sizes = sizes;
    this.fit();
  }
  open() { this.btn.hidden = true; this.hangar.open(); }
  setSize(k) {
    this.size = k; this.sizes.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === k)));
    this.fit(); this.hangar.resize();
  }
  fit() {
    const d = DEVICES[this.size], avail = Math.max(200, this.wrap.clientWidth - 12);
    const k = Math.min(1, avail / d.w, 660 / d.h);
    Object.assign(this.stage.style, { width: `${d.w}px`, height: `${d.h}px`, transform: `scale(${k})` });
    Object.assign(this.box.style, { width: `${Math.round(d.w * k)}px`, height: `${Math.round(d.h * k)}px` });
  }
}

// ---------- the page ----------

const cards = [];
let strip = null;
let show = null;
const visible = new Set();

function scaleNote() {
  const el = document.getElementById('scale'); if (!el || !strip) return;
  const k = strip.canvas.getBoundingClientRect().width / PLAY.W;
  el.textContent = k > 0.985 ? 'Shown at true size, as on a phone held sideways.'
    : `Shown at ${Math.round(k * 100)}% of true size here; turn your phone sideways, or widen the window, to see it at true size.`;
}

function paintRocks() { const el = document.getElementById('rocksnow'); if (el) el.textContent = `${wallet.rocks} pretend moon rocks`; }

function bar(root) {
  const mk = (label, fn, pressed) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (pressed != null) b.setAttribute('aria-pressed', String(pressed)); b.addEventListener('click', () => fn(b)); return b; };
  const g1 = document.createElement('div'); g1.className = 'grp';
  const snd = mk('Sound', (b) => { opts.sound = !opts.sound; setMuted(!opts.sound); b.setAttribute('aria-pressed', String(opts.sound)); if (opts.sound) play('tap'); }, false);
  snd.dataset.k = 'sound'; g1.append(snd);
  g1.append(mk('Less motion', (b) => { opts.calm = !opts.calm; b.setAttribute('aria-pressed', String(opts.calm)); allParts.forEach((p) => { p.k = opts.calm ? 0.35 : 1; }); cards.forEach((c) => { c.scene.calm = opts.calm; c.restart(); }); if (strip) strip.scene.calm = opts.calm; }, opts.calm));
  const g2 = document.createElement('div'); g2.className = 'grp';
  const lbl = document.createElement('span'); lbl.className = 'rocksnow'; lbl.id = 'rocksnow';
  g2.append(lbl);
  for (const n of [0, 40, 120, 400]) g2.append(mk(`${n}`, () => { wallet = { ...wallet, rocks: n }; paintRocks(); }));
  g2.append(mk('Start again', () => { wallet = { rocks: 120, ships: ['classic'], ship: 'classic' }; paintRocks(); }));
  root.append(g1, g2);
  paintRocks();
}

function widthsTable(el) {
  const rows = SHIPS.map(measure), classic = rows.find((r) => r.id === 'classic');
  const px = (v) => `${Math.round(v * PLAY_H)} px`;
  const body = rows.map((r) => {
    const isNew = NEW.includes(r.id), ok = r.feet <= classic.feet + 1e-9 && r.jokeFeet <= classic.feet + 1e-9 && r.wide <= classic.wide + 1e-9;
    const s = SHIP_BY_ID[r.id];
    return `<tr${isNew ? ' class="new"' : ''}><th scope="row">${s.name}${isNew ? ' <span class="newtag">new</span>' : ''}</th><td>${px(r.feet)}</td><td>${px(r.jokeFeet)}</td><td>${px(r.wide)}</td><td>${isNew ? (ok ? 'Yes' : '<b>No</b>') : '—'}</td></tr>`;
  }).join('');
  el.innerHTML = `<table><caption>Measured from each drawing at ${PLAY_H} px tall (a sideways phone). Across its feet: its lowest tenth.</caption>`
    + '<thead><tr><th scope="col">Ship</th><th scope="col">Across its feet</th><th scope="col">Across its feet, landing</th><th scope="col">Widest</th><th scope="col">No wider than the Classic</th></tr></thead>'
    + `<tbody>${body}</tbody></table>`;
  return rows;
}

let last = 0, clock = 0, ready = false, widths = [];
function loop(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now; clock += dt;
  for (const c of cards) if (visible.has(c.canvas) && !c.frozen) timed(`card ${c.ship.id}`, () => c.frame(dt, clock));
  if (strip && visible.has(strip.canvas) && !strip.frozen) timed('strip', () => strip.frame(dt, clock));
  if (show && show.hangar.isOpen) timed('showroom', () => show.hangar.frame(dt, clock));
  requestAnimationFrame(loop);
}

function start() {
  bar(document.getElementById('bar'));
  const grid = document.getElementById('ships');
  for (const id of NEW) cards.push(new Card(grid, SHIP_BY_ID[id]));
  strip = new Strip(document.getElementById('strip'));
  widths = widthsTable(document.getElementById('widths'));
  scaleNote();
  show = new Showroom(document.getElementById('show'), document.getElementById('show-sizes'));
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: '120px' });
  cards.forEach((c) => io.observe(c.canvas)); io.observe(strip.canvas);
  let rt = null;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { cards.forEach((c) => c.resize()); show.fit(); show.hangar.resize(); scaleNote(); }, 120); });
  requestAnimationFrame(loop);
  ready = true;
}

// For the page check (sketch_rocket_new_ships.py): what's here, and a way to drive it.
window.__mock = {
  get ready() { return ready; },
  cards, NEW,
  get strip() { return strip; },
  get show() { return show; },
  get wallet() { return wallet; },
  setRocks(n) { wallet = { ...wallet, rocks: n }; paintRocks(); },
  widths: () => widths,
  fleet: () => FLEET.map((s) => ({ ...s })),
  ships: () => SHIPS.map((s) => s.id),
  sounds: () => SOUND_NAMES.slice(),
  soundOf: (id) => (FLEET_BY_ID[id] || {}).sound,
  playAll() { const was = opts.sound; opts.sound = true; setMuted(false); const done = []; for (const id of NEW) { play(FLEET_BY_ID[id].sound); done.push(id); } opts.sound = was; setMuted(!was); return done; },
  // Holds a card still at T seconds into a mode (stepped at 60 frames a second), for a picture.
  freeze(i, mode, T) {
    const c = cards[i]; c.frozen = true; c.setMode(mode);
    let tt = clock; for (let k = 0; k < Math.round(T * 60); k++) { tt += 1 / 60; c.frame(1 / 60, tt); }
    return { T: c.T, pilotIn: c.S.pilotIn, landed: c.landed, pilot: !!c.pilot };
  },
  thaw(i) { cards[i].frozen = false; },
  freezeStrip(T) { strip.frozen = true; strip.T = 0; strip.layout(); let tt = clock; for (let k = 0; k < Math.round(T * 60); k++) { tt += 1 / 60; strip.frame(1 / 60, tt); } },
  thawStrip() { strip.frozen = false; },
  // One ship drawn large in its poses, for looking over: flying, standing, its landing joke at
  // three moments, the same with Bip hopped out, and in the showroom not yet flown.
  closeup(id, H = 200) {
    const ship = SHIP_BY_ID[id], W = Math.round(H * 1.3), poses = [['flying', 'fly', 0], ['standing', 'rest', 0], ['joke 0.15 s', 'land', 0.15], ['joke 0.4 s', 'land', 0.4], ['joke 1 s', 'land', 1], ['Bip out', 'out', 1], ['showroom', 'show', 1]];
    const cv = document.createElement('canvas'); cv.width = W * poses.length; cv.height = Math.round(H * 1.9);
    const ctx = cv.getContext('2d'), gy = Math.round(H * 1.55);
    ctx.fillStyle = '#2D2275'; ctx.fillRect(0, 0, cv.width, cv.height);
    poses.forEach(([label, kind, tt], i) => {
      const S = newState(H), P = new Parts(); P.k = 0;
      Object.assign(S, { x: W * i + W / 2, y: gy - H / 2, gy, dust: '#EDE8FF', side: 1, legs: 1 });
      const run = (n, t0 = 0) => { for (let k = 0; k < n; k++) tickShip(ship, S, P, 1 / 60, t0 + k / 60); };
      if (kind === 'fly') { S.air = true; S.thrust = 1; S.legs = 0; run(30); }
      else if (kind === 'show') { S.idle = true; S.pilotIn = false; run(60); }
      else if (kind !== 'rest') { landShip(ship, S, P); run(Math.round(tt * 60)); if (kind === 'out') S.pilotIn = false; }
      ctx.fillStyle = '#CBCEDC'; ctx.fillRect(W * i, gy, W, cv.height - gy);
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.strokeRect(W * i + 0.5, 0.5, W - 1, cv.height - 1);
      drawShip(ctx, ship, S, 1.3);
      ctx.fillStyle = '#FFFFFF'; ctx.font = `600 ${Math.round(H * 0.08)}px sans-serif`; ctx.fillText(label, W * i + 8, Math.round(H * 0.1));
    });
    return cv.toDataURL('image/png');
  },
  resetPerf() { for (const k of Object.keys(perfs)) delete perfs[k]; },
  perf() {
    const out = {};
    for (const [k, v] of Object.entries(perfs)) { const s = v.slice().sort((a, b) => a - b); out[k] = { n: s.length, median: s[Math.floor(s.length / 2)] || 0, p95: s[Math.floor(s.length * 0.95)] || 0 }; }
    return out;
  },
};

if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start); else start();
void INK;
