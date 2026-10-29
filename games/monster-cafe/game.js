// Monster Café: hungry monsters order little sums; serve the right amount to earn coins,
// then spend the coins on a café makeover. Settings come from the Sheet (settings.js).

import { homeButton, record, goHome, loadSettings, settingsNow, loadProgress, progressNow, saveProgress } from '../../shared/game-kit.js';
import { play as sfx, speak, canSpeak, stopSpeaking, isMuted } from '../../shared/sound.js';
import { SETTINGS } from './settings.js';
import { makeOrders, answerMode, cleanSettings } from './orders.js';
import * as A from './art.js';
import { DECOR, DECOR_IDS, ASPECT, lightsStrip } from './decor.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.insertAdjacentHTML('afterbegin', A.SPRITE);
homeButton({ style: { border: '3px solid #3D2340', color: '#3D2340', boxShadow: '2px 4px 0 rgba(61,35,64,.22)' } });

// ---------- Timing that stops while the tab is hidden ----------

let paused = false;
let SPEED = Number(window.__mcSpeed) || 1; // tests may speed things up

function sleep(ms) {
  return new Promise((resolve) => {
    let left = ms / SPEED, last = performance.now();
    const tick = (now) => {
      if (!paused) left -= Math.min(100, now - last);
      last = now;
      if (left <= 0) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const dur = (ms) => (reduced ? Math.min(ms, 200) : ms) / SPEED;

document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  document.body.classList.toggle('paused', paused);
  if (paused) { stopSpeaking(); document.getAnimations().forEach((a) => a.pause()); saveIfDirty(); }
  else document.getAnimations().forEach((a) => { if (a.playState === 'paused') a.play(); });
});
window.addEventListener('pagehide', saveIfDirty);

// ---------- Settings and progress ----------

let settings = settingsNow(SETTINGS);
const settingsReady = loadSettings(SETTINGS).then((s) => { settings = s; return s; });

const START_PROGRESS = { coins: 0, owned: [], served: {} };
function cleanProgress(p) {
  const served = {};
  Object.entries((p && p.served) || {}).forEach(([k, v]) => { if (Number(v) > 0) served[String(k).slice(0, 20)] = Math.round(Number(v)); });
  return {
    coins: Math.max(0, Math.round(Number(p && p.coins) || 0)),
    owned: [...new Set(((p && p.owned) || []).filter((id) => DECOR_IDS.includes(id)))],
    served,
  };
}
let progress = cleanProgress(progressNow(START_PROGRESS));
let dirty = false;
const progressReady = loadProgress(START_PROGRESS).then((p) => {
  progress = cleanProgress(p);
  showBank();
  buildScene();
  return progress;
});
function save() { dirty = false; saveProgress(progress); }
function saveIfDirty() { if (dirty) save(); }

// ---------- Round state ----------

let phase = 'start'; // start | busy | ordering | end | shop
const screen = (name) => { document.body.dataset.screen = name; };
screen('start');
let cfg = cleanSettings(settings);
let maker = null;
let R = null;
let order = null, mode = 'tap', tries = 0, frames = 1;
let tray = 0, typed = '';
let mon = null, lastMon = null;
let patienceLeft = 0, patienceTotal = 0;
let resolveOrder = null;
let helperShown = false;
let G = null;

// ---------- Layout ----------

function computeLayout() {
  const W = window.innerWidth, H = window.innerHeight;
  const portrait = H > W * 1.1;
  const s = portrait ? clamp(Math.min(W / 390, H / 844), 0.8, 1.3) : clamp(Math.min(H / 600, W / 1050), 0.64, 1.3);
  const front = Math.round(46 * s);
  const cy = Math.round(H * (portrait ? 0.575 : H < 520 ? 0.53 : 0.58));
  const g = { W, H, s, portrait, front, cy };

  // Monster: the svg box (viewBox -20 -40 240 280); y = 205 in the art sits on the counter edge.
  let mw;
  if (portrait) mw = Math.min(W * 0.44, 210 * s, (cy - 84 - 170 * s - 30 * s) / 0.79);
  else mw = Math.min(W * 0.3, 300 * s, (cy - 10) / 1.02);
  mw = Math.max(110, mw);
  const mh = mw * 280 / 240;
  const mx = portrait ? (W - mw) / 2 : Math.max(76, W * 0.27 - mw / 2);
  const my = cy - mh * 245 / 280;
  g.mon = { x: mx, y: my, w: mw, h: mh };
  g.unit = mw / 240;
  const at = (vx, vy) => ({ x: mx + (vx + 20) * g.unit, y: my + (vy + 40) * g.unit });
  g.at = at;

  // Speech bubble box.
  if (portrait) {
    const tip = at(100, 18).y;
    g.bubble = { x: 12, y: 80, w: W - 24, h: Math.max(110, tip - 28 * s - 80), tail: 'down' };
  } else {
    const left = mx + mw - 18 * g.unit;
    const top = Math.max(78, at(0, 10).y);
    g.bubble = { x: left + 30 * s, y: top, w: Math.min(W - left - 30 * s - 14, 600 * s), h: cy - top - 14 * s, tail: 'left' };
  }
  g.fs = Math.round((portrait ? 38 : 40) * s);
  g.eqs = Math.round(52 * s);
  g.eqsBig = Math.round(76 * s);

  // The counter, where the controls go.
  const pad = Math.round(10 * s);
  g.desk = { x: pad, y: cy + pad + 4 * s, w: W - pad * 2, h: H - front - cy - pad * 2 - 4 * s };
  return g;
}

// Tap mode: jar, tray and bell, in whichever arrangement gives the biggest tray slots.
function tapLayout(g, nFrames) {
  const { x, y, w, h } = g.desk, s = g.s, gap = 12 * s, trayPad = 34 * s;
  const shapes = nFrames === 1 ? [[5.52, 2.28]] : [[11.3, 2.28], [5.52, 4.82]];
  const slotFor = (tw, th) => Math.max(...shapes.map(([fw, fh]) => Math.min((tw - trayPad) / fw, (th - trayPad) / fh)));
  const options = [];
  { // jar | tray | bell
    const jh = Math.min(h, 170 * s), jw = jh * 0.8, bh = Math.min(h, 150 * s), bw = bh * 1.05;
    const slot = Math.min(slotFor(w - jw - bw - gap * 2, h), 74 * s);
    options.push({ kind: 'row', slot, jw, jh, bw, bh });
  }
  { // tray on top, jar and bell below
    const rh = clamp(h * 0.36, 90 * s, 150 * s);
    const slot = Math.min(slotFor(w, h - rh - gap), 74 * s);
    options.push({ kind: 'stack', slot, jw: rh * 0.8, jh: rh, bw: rh * 1.05, bh: rh });
  }
  { // jar over bell on the left, tray on the right
    const cw = clamp(w * 0.28, 104 * s, 140 * s);
    const jh = Math.min(cw * 1.25, (h - gap) * 0.55), bh = Math.min(cw, h - gap - jh);
    const slot = Math.min(slotFor(w - cw - gap, h), 74 * s);
    options.push({ kind: 'column', slot, jw: jh * 0.8, jh, bw: cw, bh });
  }
  const best = options.reduce((a, b) => (b.slot > a.slot + 2 ? b : a));
  const slot = Math.floor(best.slot);
  // Tray size for that slot.
  let shape = shapes[0];
  if (nFrames === 2) {
    const tw = best.kind === 'column' ? w - best.bw - gap : best.kind === 'row' ? w - best.jw - best.bw - gap * 2 : w;
    shape = (tw - trayPad) / shapes[0][0] >= slot ? shapes[0] : shapes[1];
  }
  const trayW = shape[0] * slot + trayPad, trayH = shape[1] * slot + trayPad;
  const L = { slot, stacked: shape === shapes[1] && nFrames === 2 };
  if (best.kind === 'row') {
    const total = best.jw + trayW + best.bw + gap * 2;
    let x0 = x + (w - total) / 2;
    L.jar = { x: x0, y: y + (h - best.jh) / 2, w: best.jw, h: best.jh };
    x0 += best.jw + gap;
    L.tray = { x: x0, y: y + (h - trayH) / 2, w: trayW, h: trayH };
    x0 += trayW + gap;
    L.bell = { x: x0, y: y + (h - best.bh) / 2, w: best.bw, h: best.bh };
  } else if (best.kind === 'stack') {
    L.tray = { x: x + (w - trayW) / 2, y, w: trayW, h: trayH };
    const rowY = y + trayH + gap, rowH = h - trayH - gap;
    const spread = Math.min(w, Math.max(trayW, best.jw + best.bw + 120 * g.s));
    const left = x + (w - spread) / 2;
    L.jar = { x: left, y: rowY + (rowH - best.jh) / 2, w: best.jw, h: best.jh };
    L.bell = { x: left + spread - best.bw, y: rowY + (rowH - best.bh) / 2, w: best.bw, h: best.bh };
  } else {
    const total = best.bw + gap + trayW;
    const x0 = x + (w - total) / 2;
    L.jar = { x: x0 + (best.bw - best.jw) / 2, y, w: best.jw, h: best.jh };
    L.bell = { x: x0, y: y + h - best.bh, w: best.bw, h: best.bh };
    L.tray = { x: x0 + best.bw + gap, y: y + (h - trayH) / 2, w: trayW, h: trayH };
  }
  L.left = Math.min(L.jar.x, L.tray.x, L.bell.x);
  L.right = Math.max(L.jar.x + L.jar.w, L.tray.x + L.tray.w, L.bell.x + L.bell.w);
  return L;
}

function padLayout(g) {
  const { x, y, w, h } = g.desk, s = g.s;
  if (g.portrait) {
    const pw = Math.min(w, 380 * s, h * 1.4);
    const ph = Math.min(h, 340 * s);
    return { kind: 'portrait', x: x + (w - pw) / 2, y: y + (h - ph) / 2, w: pw, h: ph };
  }
  const ph = Math.min(h, 220 * s);
  const pw = Math.min(w, ph * 5.4, 940 * s);
  return { kind: 'wide', x: x + (w - pw) / 2, y: y + (h - ph) / 2, w: pw, h: ph };
}

const place = (el, r) => {
  el.style.left = `${r.x}px`; el.style.top = `${r.y}px`;
  el.style.width = `${r.w}px`; el.style.height = `${r.h}px`;
};

// Where each decoration goes. [centre x, bottom, width]; height comes from the picture.
function decoSpots(g) {
  const { W, H, s, cy, portrait, front } = g;
  const out = {};
  const put = (id, cx, bottom, w) => {
    const h = w * ASPECT[id];
    out[id] = { x: cx - w / 2, y: bottom - h, w, h };
  };
  const desk = tapLayout(g, 1);
  if (portrait) {
    const ww = Math.min(W * 0.27, 112 * s);
    out.window = { x: W * 0.17 - ww / 2, y: cy - 40 * s - ww * 170 / 140, w: ww, h: ww * 170 / 140 };
    out.shelf = { x: W * 0.83 - ww * 0.6, y: cy - 126 * s, w: ww * 1.2, h: 44 * s };
    put('balloons', Math.max(28 * s, out.window.x + 4 * s), out.window.y + 70 * s, 54 * s);
    put('chandelier', W * 0.17, out.window.y - 2 * s, Math.min(96 * s, W * 0.26));
    put('neon', W * 0.83, out.shelf.y - 6 * s, 56 * s);
    put('plant', W * 0.29, cy + 38 * s, 74 * s);
    put('jukebox', W * 0.79, cy + 18 * s, 60 * s);
    put('cake', W * 0.1, cy + 22 * s, 64 * s);
    put('fish', W * 0.91, cy + 20 * s, 58 * s);
    put('cat', 62 * s, H - 2 * s, 104 * s);
  } else {
    const ww = Math.min(W * 0.14, cy * 0.48, 176 * s);
    const wx = Math.max(10, Math.min(W * 0.1 - ww / 2, g.mon.x - ww * 0.55));
    out.window = { x: wx, y: cy - 40 * s - ww * 170 / 140, w: ww, h: ww * 170 / 140 };
    const sw = Math.min(W * 0.15, 190 * s);
    out.shelf = { x: W * 0.9 - sw / 2, y: Math.max(cy * 0.5, cy - 150 * s), w: sw, h: 60 * s };
    put('balloons', Math.max(26 * s, wx - 2 * s), cy + 24 * s, 62 * s);
    const above = out.window.y - 8 * s;
    const neonW = Math.min(92 * s, (above - 70) / ASPECT.neon);
    if (neonW > 40) put('neon', wx + ww / 2, above, neonW);
    else put('neon', W * 0.9, out.shelf.y - 10 * s, 80 * s);
    const menuW = Math.min(sw * 0.8, 150 * s);
    const menuH = menuW * 170 / 150;
    if (out.shelf.y - menuH - 14 * s > 74 && neonW > 40) out.menu = { x: W * 0.9 - menuW / 2, y: out.shelf.y - menuH - 14 * s, w: menuW, h: menuH };
    const span = Math.min(g.bubble.w, 560 * s);
    const lampBottom = g.bubble.y - 10 * s;
    const lampW = 58 * s;
    out.ceiling = lampBottom;
    if (lampBottom > 70 * s) {
      out.lamps = [g.bubble.x + span * 0.22, g.bubble.x + span * 0.62]
        .map((x) => ({ x: x - lampW / 2, y: lampBottom - lampW, w: lampW, h: lampW }));
    }
    // The chandelier takes the lamps' place over the speech bubble.
    const chW = Math.min(150 * s, (lampBottom + 6 * s) / ASPECT.chandelier, span * 0.5);
    put('chandelier', g.bubble.x + span * 0.42, lampBottom + 6 * s, chW);
    put('plant', wx + ww * 0.9, cy + 36 * s, 92 * s);
    put('jukebox', W * 0.77, cy + 56 * s, Math.min(100 * s, cy * 0.5));
    const margin = Math.max(70 * s, desk.left);
    put('cake', margin / 2, cy + 28 * s, Math.min(84 * s, margin * 0.85));
    put('fish', W - margin / 2, cy + 28 * s, Math.min(84 * s, margin * 0.85));
    put('cat', margin / 2 + 4 * s, H - front + 10 * s, Math.min(130 * s, margin * 0.95));
  }
  out.lights = { x: 0, y: 30 * s, w: W, h: 50 * s };
  return out;
}

// ---------- The café scene ----------

const BACK = ['chandelier', 'neon', 'balloons', 'plant', 'jukebox'];
const FRONT = ['cake', 'fish', 'cat'];

function buildScene() {
  G = computeLayout();
  document.documentElement.style.setProperty('--s', G.s);
  document.documentElement.style.setProperty('--counter-y', `${G.cy}px`);
  const spots = decoSpots(G);
  G.spots = spots;

  const n = Math.ceil(G.W / (126 * G.s)) + 1;
  $('bunting').innerHTML = Array.from({ length: n }, (_, i) => A.buntingSvg(i)).join('');

  const owned = new Set(progress.owned);
  const deco = (id, svg) => {
    const r = spots[id];
    return `<div class="deco deco-${id}" data-deco="${id}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px">${svg}${id === 'cat' ? '<span class="zz" style="left:12%;top:-10%">z</span><span class="zz" style="left:20%;top:-24%">z</span>' : ''}</div>`;
  };
  const byId = Object.fromEntries(DECOR.map((d) => [d.id, d]));
  let back = '';
  const w = spots.window, sh = spots.shelf;
  if (owned.has('lights')) {
    const swags = Math.ceil(G.W / (120 * G.s));
    back += `<div class="deco deco-lights" data-deco="lights" style="left:0;top:${spots.lights.y}px;width:${swags * 120 * G.s + 8}px;height:${spots.lights.h}px">${lightsStrip(swags)}</div>`;
  }
  back += `<div class="abs win" style="left:${w.x}px;top:${w.y}px;width:${w.w}px;height:${w.h}px">${A.windowSvg}</div>`;
  const fitK = Math.min(1, (sh.w * 0.86) / (sh.h * 2.73));
  const orn = (svg, w, h, k = 1) => svg.replace('<svg', `<svg style="height:${sh.h * k * fitK}px;width:${(sh.h * k * fitK * w) / h}px"`);
  back += `<div class="abs shelf" style="left:${sh.x}px;top:${sh.y}px;width:${sh.w}px;height:${sh.h}px">${orn(A.teapotSvg, 70, 56, 0.8)}${orn(A.lollyJarSvg, 54, 70, 1.05)}${orn(A.cupsSvg, 64, 50, 0.72)}</div>`;
  if (!owned.has('chandelier')) (spots.lamps || []).forEach((r, i) => {
    back += `<div class="abs lamp" style="left:${r.x}px;top:0;width:${r.w}px;height:${r.y + r.h}px">${A.lampSvg(i % 2 ? '#7CCFEA' : '#FF8FB6', i % 2 ? '#B9E8F7' : '#FFC6D9')}</div>`;
  });
  if (spots.menu) {
    const m = spots.menu;
    back += `<div class="abs menu" style="left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px">${A.menuSvg}</div>`;
  }
  BACK.forEach((id) => { if (owned.has(id)) back += deco(id, byId[id].svg); });
  $('back').innerHTML = back;
  $('front').innerHTML = FRONT.filter((id) => owned.has(id)).map((id) => deco(id, byId[id].svg)).join('');

  placeCounter();
  placeCards();
  if (mon) placeMonster();
  if (order) { placeBubble(); buildDesk(); }
}

function placeCounter() {
  $('counter').style.top = `${G.cy}px`;
}

// Start screen: a sign hanging on the wall, a monster waving behind the counter, buttons on the counter.
function placeCards() {
  const { W, s, portrait, cy, desk } = G;
  const sign = $('signboard'), face = sign.querySelector('.sign-face');
  const title = Math.round(clamp((portrait ? W * 0.14 : Math.min(W * 0.06, cy * 0.17)), 34, 84));
  face.style.setProperty('--title', `${title}px`);
  face.classList.toggle('stacked', portrait);
  let sw, sx, sy;
  if (portrait) {
    sw = Math.min(W - 40, title * 5.6);
    sx = (W - sw) / 2; sy = 80;
  } else {
    const left = G.mon.x + G.mon.w + 10 * s, right = Math.min(G.W - 14, G.W * 0.9 - Math.min(G.W * 0.15, 190 * s) * 0.4 - 34 * s);
    sw = Math.min(title * 9.6, right - left);
    sx = left + (right - left - sw) / 2;
    // Hang it just below the lamps (or chandelier), clear of the counter.
    const signH = title * 1.05 + 62 * s;
    const below = (G.spots.ceiling || 60) + (progress.owned.includes('chandelier') ? 12 : 10) * s;
    sy = clamp(below, 70, cy - signH - 18 * s);
  }
  place(sign, { x: sx, y: sy, w: sw, h: 0 });
  sign.style.height = 'auto';
  // Shrink the title until it fits on the sign (fonts differ between devices).
  const h1 = face.querySelector('h1');
  let t = title;
  for (let i = 0; i < 12 && h1.scrollWidth > face.clientWidth - 20 * s; i++) {
    t = Math.max(26, t * 0.92);
    face.style.setProperty('--title', `${t}px`);
  }
  const sd = $('start-desk');
  place(sd, desk);
  sd.classList.toggle('col', portrait);
}

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildScene, 120);
});

stage.addEventListener('click', (e) => {
  const d = e.target.closest('[data-deco]');
  if (!d) return;
  const id = d.dataset.deco;
  if (id === 'jukebox') { playJukebox(d); return; }
  d.classList.remove('wiggle'); void d.offsetWidth; d.classList.add('wiggle');
  sfx(id === 'cat' ? 'puff' : id === 'fish' ? 'hiccup' : id === 'lights' ? 'sparkle' : 'pop');
});

// ---------- Little jukebox tune (own Web Audio; respects mute) ----------

let actx = null;
function blip(freq, start, len, type = 'square', vol = 0.05) {
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, start);
  gn.gain.setValueAtTime(0.0001, start);
  gn.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gn.gain.exponentialRampToValueAtTime(0.0001, start + len);
  o.connect(gn).connect(actx.destination);
  o.start(start); o.stop(start + len + 0.05);
}
function jingle() {
  if (isMuted()) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + 0.03, b = 0.17;
    [523, 659, 784, 659, 698, 880, 784, 0, 659, 784, 1047].forEach((f, i) => { if (f) blip(f, t + i * b, b * 1.4, 'square', 0.045); });
    [131, 196, 175, 196, 131, 262].forEach((f, i) => blip(f, t + i * b * 2, b * 1.8, 'triangle', 0.12));
  } catch { /* no sound here */ }
}
let jukeboxBusy = false;
async function playJukebox(el) {
  if (jukeboxBusy) return;
  jukeboxBusy = true;
  el.classList.add('playing');
  jingle();
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const n = document.createElement('div');
    n.className = 'note';
    n.textContent = i % 2 ? '♫' : '♪';
    $('fx').appendChild(n);
    const x = r.left + r.width * (0.2 + Math.random() * 0.6), y0 = r.top + r.height * 0.2;
    n.animate([
      { transform: `translate(${x}px, ${y0}px) scale(.5)`, opacity: 0 },
      { transform: `translate(${x + 10}px, ${y0 - 30}px) scale(1)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${x - 14}px, ${y0 - 90}px) scale(1.1)`, opacity: 0 },
    ], { duration: 1400, delay: i * 300, easing: 'ease-out', fill: 'both' }).finished.then(() => n.remove()).catch(() => n.remove());
  }
  await sleep(2100 * SPEED);
  el.classList.remove('playing');
  jukeboxBusy = false;
}

// ---------- Effects ----------

const fx = $('fx');
function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function spawn(html, cls) {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  fx.appendChild(d);
  return d;
}
function animateAway(el, frames, opts) {
  const a = el.animate(frames, { fill: 'both', ...opts });
  a.finished.then(() => el.remove()).catch(() => el.remove());
  return a;
}
function hearts(x, y, n = 6) {
  for (let i = 0; i < (reduced ? 2 : n); i++) {
    const h = spawn(A.heartSvg(), 'flyer');
    const dx = (Math.random() - 0.5) * 160 * G.s, sc = 0.6 + Math.random() * 0.6;
    animateAway(h, [
      { transform: `translate(${x - 20}px, ${y - 20}px) scale(0)`, opacity: 1 },
      { transform: `translate(${x - 20 + dx * 0.5}px, ${y - 70 * G.s}px) scale(${sc})`, opacity: 1, offset: 0.35 },
      { transform: `translate(${x - 20 + dx}px, ${y - 200 * G.s}px) scale(${sc}) rotate(${dx / 6}deg)`, opacity: 0 },
    ], { duration: dur(1500), delay: i * 110 / SPEED, easing: 'ease-out' });
  }
}
function crumbs(x, y, n = 7) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const c = spawn('', 'crumb');
    c.style.background = pick(['#C98B4E', '#E9B26B', '#FF9EC4', '#F2475F', '#6A3A2A']);
    const dx = (Math.random() - 0.5) * 120 * G.s, up = 30 + Math.random() * 50;
    animateAway(c, [
      { transform: `translate(${x}px, ${y}px) rotate(0)`, opacity: 1 },
      { transform: `translate(${x + dx * 0.6}px, ${y - up * G.s}px) rotate(120deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${x + dx}px, ${y + 60 * G.s}px) rotate(300deg)`, opacity: 0 },
    ], { duration: dur(700), easing: 'ease-out' });
  }
}
function sparkles(x, y, n = 10, spread = 90) {
  for (let i = 0; i < (reduced ? 3 : n); i++) {
    const colour = pick(['#FFC83D', '#FF8FB6', '#7CCFEA', '#8EDB5A', '#B59BFF']);
    const sp = spawn(`<svg viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="${colour}" stroke="#3D2340" stroke-width="1.6" stroke-linejoin="round"/></svg>`, 'spark');
    const a = (i / n) * Math.PI * 2, d = (0.5 + Math.random() * 0.5) * spread * G.s;
    animateAway(sp, [
      { transform: `translate(${x - 11}px, ${y - 11}px) scale(0)` },
      { transform: `translate(${x - 11 + Math.cos(a) * d}px, ${y - 11 + Math.sin(a) * d}px) scale(1.1) rotate(90deg)`, offset: 0.6 },
      { transform: `translate(${x - 11 + Math.cos(a) * d * 1.2}px, ${y - 11 + Math.sin(a) * d * 1.2}px) scale(0) rotate(180deg)` },
    ], { duration: dur(800), easing: 'ease-out' });
  }
}
function flyFood(kind, from, to, ms = 320, size = 44) {
  const f = spawn(A.food(kind), 'flyer');
  f.style.width = f.style.height = `${size}px`;
  const mx = (from.x + to.x) / 2, my = Math.min(from.y, to.y) - 70 * G.s;
  return animateAway(f, [
    { transform: `translate(${from.x - size / 2}px, ${from.y - size / 2}px) scale(.8)` },
    { transform: `translate(${mx - size / 2}px, ${my - size / 2}px) scale(1.1) rotate(-20deg)`, offset: 0.5 },
    { transform: `translate(${to.x - size / 2}px, ${to.y - size / 2}px) scale(.9)` },
  ], { duration: dur(ms), easing: 'ease-in-out' }).finished.catch(() => {});
}

// ---------- HUD ----------

function showBank() {
  $('bank').textContent = progress.coins;
  $('coins').textContent = progress.coins;
  $('shop-coins').textContent = progress.coins;
}
function bumpJar() {
  const j = $('coinjar');
  j.classList.remove('bump'); void j.offsetWidth; j.classList.add('bump');
}
function drawProgress() {
  const p = $('progress');
  if (!R) { p.hidden = true; return; }
  p.hidden = false;
  if (R.total > 10) {
    p.innerHTML = `<span style="font-size:22px;line-height:1;padding:0 4px">${Math.min(R.index + 1, R.total)} / ${R.total}</span>`;
    return;
  }
  p.innerHTML = Array.from({ length: R.total }, (_, i) => {
    const res = R.results[i];
    return `<i class="${res === 'first' ? 'star' : res ? 'done' : i === R.index ? 'now' : ''}"></i>`;
  }).join('');
}

// ---------- Monster ----------

const MON_EL = $('monster');
function placeMonster() {
  place(MON_EL, G.mon);
}
function mouth() { return G.at(100, mon.mouthY + 4); }
function headTop() { return G.at(100, 30); }
function setFace(...classes) {
  MON_EL.classList.remove('open', 'shut', 'puzzled', 'happy', 'gulp', 'look-up');
  classes.forEach((c) => c && MON_EL.classList.add(c));
}

async function monsterArrive() {
  const choices = A.MONSTERS.filter((m) => m !== lastMon);
  mon = pick(choices);
  lastMon = mon;
  MON_EL.innerHTML = A.monsterSvg(mon);
  setFace();
  placeMonster();
  MON_EL.hidden = false;
  MON_EL.classList.add('walking');
  sfx('whoosh');
  const from = G.W - G.mon.x + 20;
  await MON_EL.animate([{ transform: `translateX(${from}px)` }, { transform: 'translateX(0)' }],
    { duration: dur(900), easing: 'cubic-bezier(.25,.8,.35,1)', fill: 'both' }).finished.catch(() => {});
  MON_EL.classList.remove('walking');
  sfx('hello');
}

async function monsterLeave() {
  MON_EL.classList.add('walking');
  const to = -(G.mon.x + G.mon.w + 20);
  await MON_EL.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${to}px)` }],
    { duration: dur(800), easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'both' }).finished.catch(() => {});
  MON_EL.hidden = true;
  MON_EL.classList.remove('walking');
  MON_EL.getAnimations().forEach((a) => a.cancel());
  setFace();
}

(async function blinker() {
  for (;;) {
    await sleep(2000 + Math.random() * 3000);
    if (MON_EL.hidden) continue;
    MON_EL.classList.add('blink');
    await sleep(130);
    MON_EL.classList.remove('blink');
  }
})();

// ---------- The order bubble ----------

const BOX = $('bubble-box');
const BUB = $('bubble');
const TAIL = `<svg class="tail" viewBox="0 0 40 34" aria-hidden="true"><path d="M3 2Q17 10 16 32 26 14 37 2" fill="#fff" stroke="#3D2340" stroke-width="4" stroke-linejoin="round"/><rect x="2" y="-3" width="36" height="5.5" fill="#fff"/></svg>`;
const ARROW = '<span class="b-sep arrow"><svg viewBox="0 0 30 20" aria-hidden="true"><path d="M2 10h22M17 3l8 7-8 7" fill="none" stroke="#3D2340" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

function cellHtml(c, food) {
  const ten = c.v === 10 && ['f', 'e', 'g', 'm'].includes(c.t);
  if (ten) {
    if (c.t === 'g') return `<span class="cell wide">${A.tenBox(food, 'ghost-box').replace('<svg', '<svg style="opacity:.28"')}</span>`;
    const box = A.tenBox(food, c.t === 'e' ? 'eaten-box' : '');
    return `<span class="cell wide${c.t === 'm' ? ' more' : ''}"${c.t === 'e' ? ' style="opacity:.35"' : ''}>${box}</span>`;
  }
  switch (c.t) {
    case 'f': return `<span class="cell">${A.food(food)}</span>`;
    case 'm': return `<span class="cell more">${A.food(food)}</span>`;
    case 'e': return `<span class="cell">${A.eaten(food)}</span>`;
    case 'g': return `<span class="cell">${A.slot()}</span>`;
    case 'bag': return `<span class="cell tall">${A.bag(food, c.v)}</span>`;
    case 'gbag': return `<span class="cell tall">${A.bag(food, c.v, true)}</span>`;
    case 'plate': return `<span class="cell plate-cell">${A.plate()}<span class="pile"></span></span>`;
    default: return '';
  }
}

function boardHtml(o) {
  const { groups, seps } = o.board;
  return groups.map((g, gi) => {
    const singles = g.every((c) => c.v === 1 && ['f', 'e', 'g', 'm'].includes(c.t));
    const perRow = G && G.bubble.h < 240 ? 10 : 5;
    const cols = singles && g.length > perRow ? perRow : 0;
    const cells = g.map((c) => cellHtml(c, o.food)).join('');
    const group = `<span class="b-group${cols ? ' g5' : ''}" data-g="${gi}" style="--cols:${cols}">${cells}</span>`;
    const sep = gi < seps.length ? (seps[gi] === '→' ? ARROW : seps[gi] === 'cut' ? '<span class="b-sep cut"></span>' : `<span class="b-sep">${seps[gi]}</span>`) : '';
    return group + sep;
  }).join('');
}

function eqHtml(o) {
  return o.eq.map((t) => {
    if (t === null) return '<span class="ans empty" id="ans">?</span>';
    if (typeof t === 'number') return `<span class="num">${t}</span>`;
    if (t === 'double' || t === 'half of') return `<span class="word">${t}</span>`;
    return `<span class="op">${t}</span>`;
  }).join('');
}

function showOrder() {
  helperShown = false;
  const showPics = settings.pictures;
  BUB.innerHTML = `
    <span class="b-name" style="--name:${mon.light}">${mon.name}${settings.patience > 0 ? `<span class="patience" aria-hidden="true">${A.heartSvg()}<span class="bar"><span class="fill"></span></span></span>` : ''}</span>
    ${settings.speak && canSpeak() ? `<button class="b-speak" type="button" aria-label="Say it again">${A.speakerSvg}</button>` : ''}
    <div class="b-board" ${showPics ? '' : 'hidden'}>${boardHtml(order)}</div>
    <div class="b-eq" aria-label="${order.say}">${eqHtml(order)}</div>
    <div class="b-msg" hidden></div>
    ${TAIL}`;
  const sp = BUB.querySelector('.b-speak');
  if (sp) sp.addEventListener('click', () => sayOrder(false));
  BOX.hidden = false;
  placeBubble();
  BUB.classList.remove('pop-out');
  BUB.classList.remove('pop-in'); void BUB.offsetWidth; BUB.classList.add('pop-in');
  showAnswer();
}

function placeBubble() {
  place(BOX, G.bubble);
  BOX.classList.toggle('tail-left', G.bubble.tail === 'left');
  BUB.classList.toggle('tail-left', G.bubble.tail === 'left');
  BUB.classList.toggle('tail-down', G.bubble.tail === 'down');
  fitBubble();
}

function fitBubble() {
  const box = G.bubble;
  const big = !settings.pictures && !helperShown;
  let fs = G.fs, eqs = big ? G.eqsBig : G.eqs;
  for (let i = 0; i < 14; i++) {
    BUB.style.setProperty('--fs', `${fs}px`);
    BUB.style.setProperty('--eqs', `${eqs}px`);
    const tooTall = BUB.offsetHeight > box.h;
    const eq = BUB.querySelector('.b-eq'), board = BUB.querySelector('.b-board');
    const tooWide = (eq && eq.scrollWidth > eq.clientWidth + 1)
      || (board && !board.hidden && [...board.children].some((c) => c.offsetWidth > board.clientWidth + 1));
    if (!tooTall && !tooWide) break;
    fs = Math.max(14, fs * 0.88);
    eqs = Math.max(24, eqs * 0.9);
  }
  // Point the tail at the monster.
  if (box.tail === 'down') {
    const tx = clamp(G.W / 2 - box.x - BUB.offsetLeft, 40 * G.s, BUB.offsetWidth - 40 * G.s);
    BUB.style.setProperty('--tx', `${tx}px`);
    BUB.style.setProperty('--ty', '100%');
  } else {
    const ty = clamp(G.at(0, 100).y - box.y - BUB.offsetTop, 36 * G.s, BUB.offsetHeight - 36 * G.s);
    BUB.style.setProperty('--ty', `${ty}px`);
    BUB.style.setProperty('--tx', '0px');
  }
}

const HELLO = ['Hello!', 'Hi there!', 'Ooh, hello!', 'Yoo-hoo!', 'Hello, hello!'];
function sayOrder(first = false) {
  if (!settings.speak || !order) return;
  const sp = BUB.querySelector('.b-speak');
  const text = first ? `${pick(HELLO)} I'm ${mon.name}. ${order.say}` : order.say;
  if (speak(text) && sp) {
    sp.classList.add('talking');
    setTimeout(() => sp.classList.remove('talking'), Math.min(5000, text.length * 75));
  }
}

function showMsg(html, say) {
  const m = BUB.querySelector('.b-msg');
  if (!m) return;
  m.innerHTML = html;
  m.hidden = !html;
  fitBubble();
  if (say && settings.speak) speak(say);
}

function showAnswer() {
  const a = $('ans');
  if (!a) return;
  const v = mode === 'tap' ? (tray ? String(tray) : '') : typed;
  a.textContent = v || '?';
  a.classList.toggle('empty', !v);
  a.classList.toggle('filled', !!v);
  const d = document.querySelector('.display');
  if (d) { d.textContent = typed || '?'; d.classList.toggle('empty', !typed); }
}

async function hideBubble() {
  BUB.classList.remove('pop-in');
  BUB.classList.add('pop-out');
  await sleep(250);
  BOX.hidden = true;
  BUB.classList.remove('pop-out');
}

// ---------- Patience ----------

let lastTick = performance.now();
function tick(now) {
  const dt = Math.min(0.1, (now - lastTick) / 1000) * SPEED;
  lastTick = now;
  if (!paused && phase === 'ordering' && patienceTotal > 0 && patienceLeft > 0) {
    patienceLeft -= dt;
    const fill = BUB.querySelector('.patience .fill');
    if (fill) fill.style.transform = `scaleX(${Math.max(0, patienceLeft / patienceTotal)})`;
    const meter = BUB.querySelector('.patience');
    if (meter) meter.classList.toggle('low', patienceLeft / patienceTotal < 0.3);
    if (patienceLeft <= 0) giveUp();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

async function giveUp() {
  if (phase !== 'ordering') return;
  phase = 'busy';
  setFace('shut');
  showMsg("Oh! I'll come back later.", "Oh! I'll come back later.");
  sfx('soon');
  await sleep(1700);
  await Promise.all([hideBubble(), clearDesk()]);
  await monsterLeave();
  resolveOrder('left');
}

// ---------- The counter: tray, jar and bell, or number pad ----------

const DESK = $('desk');

function buildDesk() {
  if (mode === 'tap') buildTap(); else buildPad();
}

function buildTap() {
  const L = tapLayout(G, frames);
  const slots = Array.from({ length: frames * 10 }, (_, i) => `<span class="slot" data-i="${i}"></span>`);
  const frameHtml = Array.from({ length: frames }, (_, f) => `<div class="frame">${slots.slice(f * 10, f * 10 + 10).join('')}</div>`).join('');
  DESK.innerHTML = `
    <div class="tray" id="tray" style="--slot:${L.slot}px"><div class="frames" style="${L.stacked ? 'flex-direction:column' : ''}">${frameHtml}</div></div>
    <button class="jar" id="jar" type="button" aria-label="Put one ${order.food} on the tray">${A.jarSvg(order.food)}</button>
    <button class="bell" id="bell" type="button" aria-label="Serve"><span class="bell-wrap">${A.bellSvg}</span><span class="bell-label">Serve!</span></button>`;
  place($('tray'), L.tray);
  place($('jar'), L.jar);
  place($('bell'), L.bell);
  $('bell').querySelector('.bell-wrap').style.cssText = 'display:contents';
  $('jar').addEventListener('pointerdown', (e) => { e.preventDefault(); addItem(); });
  $('jar').addEventListener('click', (e) => { if (e.detail === 0) addItem(); });
  $('bell').addEventListener('pointerdown', (e) => { e.preventDefault(); serve(); });
  $('bell').addEventListener('click', (e) => { if (e.detail === 0) serve(); });
  $('tray').addEventListener('pointerdown', (e) => {
    const it = e.target.closest('.tray-item');
    if (it) { e.preventDefault(); removeItem(Number(it.dataset.i)); }
  });
  drawTray();
}

function drawTray(landing = -1) {
  const slots = DESK.querySelectorAll('.slot');
  slots.forEach((sl, i) => {
    const has = i < tray;
    const cur = sl.querySelector('.tray-item');
    if (has && !cur) {
      sl.innerHTML = `<button class="tray-item" type="button" data-i="${i}" aria-label="Take one back">${A.food(order.food)}<span class="n">${i + 1}</span></button>`;
      if (i === landing) {
        const it = sl.firstElementChild;
        it.style.opacity = '0';
      }
    } else if (!has && cur) sl.innerHTML = '';
  });
  $('bell') && $('bell').classList.toggle('ready', tray > 0 && phase === 'ordering');
  showAnswer();
}

async function addItem() {
  if (phase !== 'ordering' || mode !== 'tap') return;
  const jar = $('jar');
  if (tray >= frames * 10) {
    jar.classList.remove('shake'); void jar.offsetWidth; jar.classList.add('shake');
    sfx('boop');
    return;
  }
  const i = tray;
  tray += 1;
  jar.classList.remove('squish', 'nudge'); void jar.offsetWidth; jar.classList.add('squish');
  drawTray(i);
  sfx('pop');
  if (settings.speak) speak(String(tray), { rate: 1, pitch: 1.2 });
  const slot = DESK.querySelector(`.slot[data-i="${i}"]`);
  const from = center(jar), to = center(slot);
  from.y -= jar.getBoundingClientRect().height * 0.2;
  await flyFood(order.food, from, to, 300, slot.getBoundingClientRect().width * 0.92);
  const it = slot.querySelector('.tray-item');
  if (it) { it.style.opacity = ''; it.classList.add('land'); }
}

function removeItem(i) {
  if (phase !== 'ordering' || mode !== 'tap' || i >= tray) return;
  const slot = DESK.querySelector(`.slot[data-i="${i}"]`);
  const from = center(slot);
  tray -= 1;
  // Everything after the removed one shuffles down a place: redraw from scratch.
  DESK.querySelectorAll('.slot').forEach((s) => { s.innerHTML = ''; });
  drawTray();
  sfx('tap');
  flyFood(order.food, from, center($('jar')), 280, slot.getBoundingClientRect().width * 0.8);
}

function buildPad() {
  const L = padLayout(G);
  const keys = [];
  const key = (k, label, cls, pos) => keys.push(`<button class="key ${cls || ''}" type="button" data-k="${k}" style="${pos}" aria-label="${k === 'back' ? 'Clear' : k === 'serve' ? 'Serve' : k}">${label}</button>`);
  const back = A.clearSvg;
  const serveLabel = `${A.bellSvg}<span>Serve!</span>`;
  if (L.kind === 'portrait') {
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((n, i) => key(n, n, '', `grid-column:${(i % 3) + 1};grid-row:${Math.floor(i / 3) + 1}`));
    key('back', back, 'k-clear', 'grid-column:1;grid-row:4');
    key(0, 0, '', 'grid-column:2;grid-row:4');
    key('serve', serveLabel, 'k-serve', 'grid-column:3;grid-row:4');
  } else {
    [1, 2, 3, 4, 5].forEach((n, i) => key(n, n, '', `grid-column:${i + 2};grid-row:1`));
    [6, 7, 8, 9, 0].forEach((n, i) => key(n, n, '', `grid-column:${i + 2};grid-row:2`));
    key('back', back, 'k-clear', 'grid-column:7;grid-row:1');
    key('serve', serveLabel, 'k-serve', 'grid-column:7;grid-row:2');
  }
  // On a phone held upright the answer box in the speech bubble is the display.
  const display = L.kind === 'portrait' ? '' : '<div class="display empty" style="grid-column:1;grid-row:1/3">?</div>';
  DESK.innerHTML = `<div class="pad ${L.kind}" id="pad">${display}${keys.join('')}</div>`;
  place($('pad'), L);
  $('pad').addEventListener('pointerdown', (e) => {
    const k = e.target.closest('.key');
    if (!k) return;
    e.preventDefault();
    padKey(k.dataset.k);
  });
  $('pad').addEventListener('click', (e) => {
    const k = e.target.closest('.key');
    if (k && e.detail === 0) padKey(k.dataset.k);
  });
  showAnswer();
}

function padKey(k) {
  if (phase !== 'ordering' || mode !== 'pad') return;
  const el = DESK.querySelector(`[data-k="${k}"]`);
  if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 110); }
  if (k === 'serve') { serve(); return; }
  if (k === 'back') { typed = ''; sfx('puff'); showAnswer(); return; }
  if (typed.length >= String(cfg.max).length) { sfx('boop'); return; }
  typed = typed === '0' ? String(k) : typed + k;
  sfx('tap');
  if (settings.speak) speak(typed, { rate: 1, pitch: 1.15 });
  showAnswer();
}

async function clearDesk() {
  const kids = [...DESK.children];
  await Promise.all(kids.map((k) => k.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px)' }],
    { duration: dur(250), fill: 'both' }).finished.catch(() => {})));
  DESK.innerHTML = '';
}

document.addEventListener('keydown', (e) => {
  if (phase !== 'ordering' || (e.repeat && e.key !== 'ArrowUp')) return;
  // A focused button already answers Enter and Space by itself.
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('button')) return;
  if (e.key === 'Enter') { e.preventDefault(); serve(); return; }
  if (mode === 'pad') {
    if (/^[0-9]$/.test(e.key)) padKey(Number(e.key));
    else if (e.key === 'Backspace') { typed = typed.slice(0, -1); sfx('tap'); showAnswer(); }
    else if (e.key === 'Delete' || e.key === 'Escape') padKey('back');
  } else {
    if (e.key === ' ' || e.key === '+' || e.key === 'ArrowUp') { e.preventDefault(); addItem(); }
    else if ((e.key === 'Backspace' || e.key === '-' || e.key === 'ArrowDown') && tray > 0) removeItem(tray - 1);
  }
});

// ---------- Serving ----------

const YUM = ['Yum! Thank you!', 'Scrummy! Thank you!', 'Delicious!', 'Yummy yum yum!', 'Just right! Thank you!'];

async function serve() {
  if (phase !== 'ordering') return;
  const given = mode === 'tap' ? tray : typed === '' ? null : Number(typed);
  if (given === null || (mode === 'tap' && given === 0)) {
    // Nothing to serve yet: point at what to do.
    sfx('boop');
    if (mode === 'tap') { const j = $('jar'); j.classList.remove('nudge'); void j.offsetWidth; j.classList.add('nudge'); }
    else { const d = DESK.querySelector('.display') || $('ans'); if (d) d.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], 300); }
    return;
  }
  phase = 'busy';
  const bell = $('bell');
  if (bell) { bell.classList.remove('ring', 'ready'); void bell.offsetWidth; bell.classList.add('ring'); }
  sfx('pop');
  await sleep(250);
  if (given === order.answer) {
    await rightAnswer(tries === 0 ? 3 : 1);
    resolveOrder(tries === 0 ? 'first' : 'retry');
    return;
  }
  tries += 1;
  setFace('puzzled');
  sfx('boop');
  const msg = `Hmm, that's ${given}. I wanted ${order.answer}!`;
  showMsg(`Hmm, that's <b>${given}</b>.<br>I wanted <b class="hl">${order.answer}</b>`, msg);
  await sleep(1800);
  if (tries >= 3) {
    await showTheAnswer();
    resolveOrder('shown');
    return;
  }
  setFace();
  if (tries === 2) await helperCount();
  if (mode === 'pad') { typed = ''; showAnswer(); }
  showMsg(tries === 2 ? 'Can you try again?' : 'Try again!', '');
  phase = 'ordering';
  drawTray();
}

// The food goes into the monster's mouth, a chomp at a time.
async function feed() {
  const m = mouth();
  const items = mode === 'tap' ? [...DESK.querySelectorAll('.tray-item')] : [];
  const n = mode === 'tap' ? items.length : Math.min(order.answer, 6);
  const gap = Math.min(170, 1300 / Math.max(1, n));
  const size = 48 * G.s;
  const fromPad = mode === 'pad' ? center(DESK.querySelector('.display') || DESK.querySelector('[data-k="serve"]') || DESK) : null;
  const flights = [];
  for (let i = 0; i < n; i++) {
    const it = items[i];
    const from = it ? center(it) : { x: fromPad.x + (Math.random() - 0.5) * 60, y: fromPad.y };
    if (it) it.style.visibility = 'hidden';
    setFace('open');
    flights.push(flyFood(order.food, from, m, 380, size).then(() => {
      setFace('shut', 'gulp');
      sfx('chomp');
      crumbs(m.x, m.y, 5);
      setTimeout(() => setFace('open'), 60);
    }));
    await sleep(gap);
  }
  await Promise.all(flights);
  setFace('shut');
  await sleep(250);
}

async function rightAnswer(coins) {
  const a = $('ans');
  if (a) { a.textContent = order.answer; a.classList.add('good'); a.classList.remove('empty'); }
  showMsg('', '');
  await feed();
  setFace('happy', 'open');
  sfx('ding');
  const say = pick(YUM);
  showMsg(say, say);
  const h = headTop();
  hearts(h.x, h.y + 40 * G.s);
  sparkles(mouth().x, mouth().y, 8, 70);
  await sleep(500);
  await payCoins(coins);
  await sleep(700);
  progress.served[mon.name] = (progress.served[mon.name] || 0) + 1;
  await Promise.all([hideBubble(), clearDesk()]);
  await monsterLeave();
}

async function payCoins(n) {
  const m = mouth();
  const jar = center($('coinjar').querySelector('.coin'));
  const flights = [];
  for (let i = 0; i < n; i++) {
    const c = spawn(A.coinSvg('c'), 'flyer');
    c.style.width = c.style.height = `${48 * G.s}px`;
    const sz = 48 * G.s, sx = m.x + (i - (n - 1) / 2) * 50 * G.s, sy = m.y - 60 * G.s;
    sfx('pop');
    const anim = c.animate([
      { transform: `translate(${m.x - sz / 2}px, ${m.y - sz / 2}px) scale(.2)` },
      { transform: `translate(${sx - sz / 2}px, ${sy - sz / 2}px) scale(1.15)`, offset: 0.3 },
      { transform: `translate(${sx - sz / 2}px, ${sy - sz / 2 - 10}px) scale(1)`, offset: 0.45 },
      { transform: `translate(${jar.x - sz / 2}px, ${jar.y - sz / 2}px) scale(.8)` },
    ], { duration: dur(1100), easing: 'ease-in-out', fill: 'both' });
    flights.push(anim.finished.catch(() => {}).then(() => {
      c.remove();
      sfx('coin');
      progress.coins += 1;
      R.coins += 1;
      dirty = true;
      showBank();
      bumpJar();
    }));
    await sleep(260);
  }
  await Promise.all(flights);
}

async function showTheAnswer() {
  setFace('shut');
  const a = $('ans');
  if (a) { a.textContent = order.answer; a.classList.add('good'); a.classList.remove('empty'); }
  if (mode === 'pad') { typed = String(order.answer); }
  else if (order.answer <= frames * 10) {
    tray = order.answer;
    DESK.querySelectorAll('.slot').forEach((s) => { s.innerHTML = ''; });
    drawTray();
  }
  showAnswer();
  const say = `It's ${order.answer}. Thank you anyway!`;
  showMsg(`It's <b class="hl ok">${order.answer}</b><br>Thank you anyway!`, say);
  sfx('sparkle');
  await sleep(2400);
  await feed();
  setFace('happy', 'open');
  const h = headTop();
  hearts(h.x, h.y + 40 * G.s, 3);
  await sleep(900);
  progress.served[mon.name] = (progress.served[mon.name] || 0) + 1;
  dirty = true;
  await Promise.all([hideBubble(), clearDesk()]);
  await monsterLeave();
}

// The helper pops up and counts along the pictures, one at a time.
async function helperCount() {
  const board = BUB.querySelector('.b-board');
  if (!board || !order.steps.length) return;
  helperShown = true;
  board.hidden = false;
  fitBubble();
  const helper = document.createElement('div');
  helper.className = 'helper';
  helper.innerHTML = A.helperSvg;
  // It pops up from behind the counter, next to the monster.
  helper.style.left = `${Math.max(4, G.mon.x - 76 * G.s)}px`;
  helper.style.top = `${G.cy - 96 * G.s}px`;
  stage.insertBefore(helper, $('counter'));
  sfx('hello');
  showMsg("Let's count together!", "Let's count together!");
  await sleep(1300);
  const groups = [...board.querySelectorAll('.b-group')];
  const cellAt = ([g, i]) => groups[g] && groups[g].children[i];
  for (const step of order.steps) {
    board.querySelectorAll('.cell.lit').forEach((c) => c.classList.remove('lit'));
    step.cells.forEach((ref) => {
      const c = cellAt(ref);
      if (!c) return;
      c.classList.add('lit');
      if (step.plates) {
        const pile = c.querySelector('.pile');
        if (pile) pile.innerHTML = A.food(order.food);
      }
      let b = c.querySelector('.cbadge');
      if (!b) { b = document.createElement('span'); b.className = 'cbadge'; c.appendChild(b); }
      b.textContent = step.badge;
    });
    sfx('pop');
    if (settings.speak) speak(step.say, { rate: 1, pitch: 1.2 });
    await sleep(order.steps.length > 12 ? 520 : 750);
  }
  await sleep(700);
  board.querySelectorAll('.cell.lit').forEach((c) => c.classList.remove('lit'));
  helper.classList.add('out');
  await sleep(350);
  helper.remove();
}

// ---------- Rounds ----------

async function startRound() {
  sfx('tap');
  // Saying something inside the tap is what lets phones speak later on.
  if (settings.speak) speak('Here they come!');
  $('play').disabled = true;
  await Promise.all([settingsReady, progressReady]);
  $('play').disabled = false;
  cfg = cleanSettings(settings);
  maker = makeOrders(settings);
  const total = clamp(Math.round(Number(settings.orders_per_round) || 8), 3, 20);
  R = { index: 0, total, rightFirst: 0, coins: 0, results: [], started: performance.now() };
  $('start').hidden = true;
  $('end').hidden = true;
  $('dim').hidden = true;
  closeShop(true);
  phase = 'busy';
  screen('play');
  if (!MON_EL.hidden) await monsterLeave();
  drawProgress();
  for (let i = 0; i < total; i++) {
    R.index = i;
    drawProgress();
    const result = await runOrder();
    R.results[i] = result;
    if (result === 'first') R.rightFirst += 1;
    dirty = true;
  }
  R.index = total;
  drawProgress();
  await endRound();
}

async function runOrder() {
  phase = 'busy';
  order = maker.next();
  tries = 0; tray = 0; typed = '';
  mode = answerMode(settings.answer_with, order.answer);
  frames = mode === 'tap' && settings.answer_with === 'tap' && cfg.max > 10 ? 2 : 1;
  patienceTotal = Math.max(0, Number(settings.patience) || 0);
  patienceLeft = patienceTotal;
  await monsterArrive();
  showOrder();
  buildDesk();
  DESK.querySelectorAll('.tray, .jar, .bell, .pad').forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translateY(40px) scale(.9)' }, { opacity: 1, transform: 'none' }],
    { duration: dur(380), delay: i * 70 / SPEED, easing: 'cubic-bezier(.2,1.5,.4,1)', fill: 'backwards' }));
  sayOrder(true);
  phase = 'ordering';
  if (mode === 'tap') drawTray();
  const result = await new Promise((res) => { resolveOrder = res; });
  order = null;
  return result;
}

const CHEERS = { 3: 'Amazing!', 2: 'Great serving!', 1: 'Well done!' };

async function endRound() {
  phase = 'end';
  const stars = starsFor(R.rightFirst, R.total);
  const seconds = Math.round((performance.now() - R.started) / 1000);
  $('end-h').textContent = CHEERS[stars];
  $('end-p').textContent = `You served ${R.total} hungry monsters!`;
  $('end-coins').textContent = `+${R.coins}`;
  $('end-stars').innerHTML = [0, 1, 2].map((i) => A.starSvg(i < stars)).join('');
  $('end-stars').setAttribute('aria-label', `${stars} of 3 stars`);
  $('end-stars').querySelectorAll('svg').forEach((s, i) => { s.classList.add('in'); s.style.animationDelay = `${0.2 + i * 0.25}s`; });
  $('progress').hidden = true;
  $('dim').hidden = false;
  $('end').hidden = false;
  screen('end');
  sfx(stars === 3 ? 'levelup' : 'yay');
  if (settings.speak) speak(`${CHEERS[stars]} You served ${R.total} hungry monsters!`);
  setTimeout(() => {
    const r = $('end-stars').getBoundingClientRect();
    if (r.width) sparkles(r.left + r.width / 2, r.top + r.height / 2, 14, 140);
  }, 900 / SPEED);
  // Result first, then progress: saving progress sends everything waiting to the Sheet.
  try {
    await record({ score: R.coins, stars, seconds, level: 1 });
  } finally {
    save();
  }
}

export function starsFor(rightFirst, total) {
  const share = total ? rightFirst / total : 0;
  if (share >= 0.85) return 3;
  if (share >= 0.6) return 2;
  return 1;
}

// ---------- Café makeover shop ----------

let shopFrom = 'start';
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#8EDB5A" stroke="#3D2340" stroke-width="2"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#3D2340" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

async function openShop() {
  sfx('tap');
  await progressReady;
  shopFrom = !$('end').hidden ? 'end' : 'start';
  $('start').hidden = true;
  $('end').hidden = true;
  $('dim').hidden = true;
  phase = 'shop';
  screen('shop');
  drawShop();
  const sh = $('shop');
  sh.hidden = false;
  sh.classList.add('peek');
  void sh.offsetWidth;
  sh.classList.remove('peek');
}

function closeShop(quiet) {
  const sh = $('shop');
  if (sh.hidden) return;
  sh.hidden = true;
  if (quiet) return;
  sfx('tap');
  phase = shopFrom === 'end' ? 'end' : 'start';
  screen(phase);
  if (phase === 'start') greeter();
  if (shopFrom === 'end') { $('end').hidden = false; $('dim').hidden = false; }
  else $('start').hidden = false;
  // Show off anything new.
  document.querySelectorAll('.deco.new').forEach((d) => {
    const c = center(d);
    sparkles(c.x, c.y, 10, 80);
    d.classList.remove('new'); void d.offsetWidth; d.classList.add('new');
  });
  setTimeout(() => document.querySelectorAll('.deco.new').forEach((d) => d.classList.remove('new')), 1500);
}

function drawShop() {
  showBank();
  const owned = new Set(progress.owned);
  $('shop-list').innerHTML = DECOR.map((d) => {
    const have = owned.has(d.id);
    const cant = !have && progress.coins < d.price;
    return `<div class="item${have ? ' owned' : ''}${cant ? ' cant' : ''}${d.wide ? ' wide-pic' : ''}" data-id="${d.id}">
      <div class="pic">${d.svg}</div>
      <div class="nm">${d.name}</div>
      ${have ? `<span class="tick">${TICK}Got it!</span>`
        : `<button class="buy" type="button" data-buy="${d.id}" aria-label="Buy ${d.name} for ${d.price} coins">${A.coinSvg()}${d.price}</button>`}
    </div>`;
  }).join('');
}

function buy(id) {
  const d = DECOR.find((x) => x.id === id);
  if (!d || progress.owned.includes(id)) return;
  const card = $('shop-list').querySelector(`[data-id="${id}"]`);
  if (progress.coins < d.price) {
    sfx('boop');
    const b = card && card.querySelector('.buy');
    if (b) b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 300);
    return;
  }
  progress.coins -= d.price;
  progress.owned.push(id);
  save();
  sfx('unlock');
  setTimeout(() => sfx('sparkle'), 350);
  if (card) {
    const c = center(card);
    sparkles(c.x, c.y, 14, 110);
  }
  buildScene();
  const deco = document.querySelector(`.deco[data-deco="${id}"]`);
  if (deco) deco.classList.add('new');
  drawShop();
  const again = $('shop-list').querySelector(`[data-id="${id}"]`);
  if (again) again.classList.add('bought');
}

$('shop-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-buy]');
  if (b) buy(b.dataset.buy);
});
$('shop-open').addEventListener('click', openShop);
$('shop-open2').addEventListener('click', openShop);
$('shop-close').addEventListener('click', () => closeShop(false));

// ---------- Start ----------

$('sign').innerHTML = A.signSvg;
$('brush1').innerHTML = A.brushSvg;
$('brush2').innerHTML = A.brushSvg;
$('play').addEventListener('click', startRound);
$('again').addEventListener('click', startRound);

// A monster says hello on the start screen, and a new one pops up every so often.
function greeter() {
  if (phase !== 'start' && phase !== 'shop') return;
  mon = pick(A.MONSTERS.filter((m) => m !== lastMon));
  lastMon = mon;
  MON_EL.innerHTML = A.monsterSvg(mon);
  setFace('happy');
  placeMonster();
  MON_EL.hidden = false;
  MON_EL.animate([{ transform: `translateY(${G.mon.h * 0.6}px)` }, { transform: 'translateY(0)' }],
    { duration: dur(600), easing: 'cubic-bezier(.2,1.5,.4,1)' });
  setTimeout(() => { if (phase === 'start' || phase === 'shop') setFace(); }, 1600);
}
$('done').addEventListener('click', () => { saveIfDirty(); goHome(); });
showBank();
buildScene();
greeter();

// A small window into the game for the browser tests.
window.__test = {
  info: () => ({
    phase, mode, tries, tray, typed, frames,
    answer: order ? order.answer : null,
    kind: order ? order.kind : null,
    missing: order ? !!order.missing : false,
    eq: order ? order.eq : null,
    index: R ? R.index : null, total: R ? R.total : null,
    rightFirst: R ? R.rightFirst : null, roundCoins: R ? R.coins : null,
    coins: progress.coins, owned: progress.owned.slice(), monster: mon ? mon.name : null,
    settings: { ...settings },
  }),
  speed: (n) => { SPEED = n; },
  starsFor,
};
