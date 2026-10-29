// Word Worm: steer a hungry worm round a sunny garden, eating letters in the right order
// to spell words (or find letters, or count). Wrong letters give it hiccups; there is no game over.

import { homeButton, record, goHome, loadSettings, settingsNow, loadProgress, progressNow, saveProgress } from '../../shared/game-kit.js';
import { play as sfx, speak, canSpeak, stopSpeaking, isMuted } from '../../shared/sound.js';
import { SETTINGS } from './settings.js';
import { buildRound, pickDecoys, countReach, starsFor, HATS, PROGRESS_DEFAULTS, cleanProgress, hatsEarned, shuffle } from './rounds.js';
import { FRUITS, INK, drawToken, drawShadow, drawHat, starSvg, clearTextCache } from './art.js';
import { Worm, paintWorm } from './worm.js';
import { Garden } from './garden.js';

const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, k) => a + (b - a) * k;
const easeOutBack = (k) => { const c = 1.9; const m = k - 1; return 1 + (c + 1) * m * m * m + c * m * m; };
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

const els = {
  garden: $('garden'), fx: $('fx'), hud: $('hud'), bar: $('bar'), pre: $('bar-pre'), look: $('look'), slots: $('slots'),
  dots: $('dots'), tools: $('tools'), eye: $('eye'), say: $('say'), start: $('start'), hero: $('hero'),
  wardrobe: $('wardrobe'), play: $('play'), end: $('end'), endStars: $('end-stars'), endH: $('end-h'),
  endWorm: $('end-worm'), grewN: $('grew-n'), longest: $('longest'), unlock: $('unlock'), unlockHat: $('unlock-hat'),
  unlockP: $('unlock-p'), chips: $('chips'), again: $('again'), done: $('done'),
};
const ctx = els.garden.getContext('2d');
const fx = els.fx.getContext('2d');

const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
let calm = !!(motionQuery && motionQuery.matches);
if (motionQuery && motionQuery.addEventListener) motionQuery.addEventListener('change', (e) => { calm = e.matches; });

const START_LEN = 5;                       // head and four body segments
const FALLBACK_WORDS = SETTINGS.word_list.fallback || ['cat', 'dog', 'sun'];

const worm = new Worm();
const garden = new Garden();

let S = settingsNow(SETTINGS);
let P = cleanProgress(progressNow(PROGRESS_DEFAULTS));
let hatTouched = false;
worm.hat = P.hat;

// Fresh settings and progress from the Sheet (each waits a couple of seconds at most).
const ready = Promise.allSettled([
  loadSettings(SETTINGS).then((v) => { S = v; }),
  loadProgress(PROGRESS_DEFAULTS).then((p) => {
    const fresh = cleanProgress(p);
    if (hatTouched) fresh.hat = P.hat && fresh.hats.includes(P.hat) ? P.hat : null;
    P = fresh;
    worm.hat = P.hat;
    buildWardrobe();
  }),
]);

let phase = 'start';          // start | play | end
let T = 0;                    // game clock in seconds; stops while the tab is hidden
let paused = false;
let tasks = [];
const later = (s, fn) => tasks.push({ at: T + s, fn });

let plan = null;              // the round: { mode, items, ... } from buildRound()
let game = null;              // progress through the round
let tokens = [];
let parts = [];
let W = 0, H = 0, DPR = 1, R = 24, TR = 34, unit = 400;
let hudBottom = 0;
let hudPick = null;            // how the word bar was fitted (for tests)
let showUntil = 0;
let immuneUntil = 0, slowUntil = 0;
let fruitBag = [];
let endInfo = null;
const said = [];              // what was said out loud (for tests)

const item = () => (plan && game ? plan.items[game.idx] : null);
const need = () => { const it = item(); return it && game.pos < it.units.length ? it.units[game.pos] : null; };
const upper = () => S.letter_case === 'upper';
const voiceOK = () => !!S.speak && canSpeak() && !isMuted();

function say(text) {
  if (!text || !voiceOK()) return;
  said.push(text);
  if (said.length > 40) said.shift();
  speak(text);
}

homeButton();

// ---------- Sizes ----------

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  for (const c of [els.garden, els.fx]) {
    c.width = Math.round(W * DPR);
    c.height = Math.round(H * DPR);
  }
  const m = Math.min(W, H);
  R = clamp(m * 0.062, 20, 32);
  TR = clamp(m * 0.085, 30, 46);           // at least 60px across on a phone
  unit = clamp(m, 320, 760);
  worm.setR(R);
  garden.build(W, H, DPR);
  const l = garden.lawn;
  worm.room = ((l.x1 - l.x0) * (l.y1 - l.y0)) / (R * 5);  // longest the body may stretch, in pixels
  tokens.forEach((t) => { t.r = TR; });
  layoutHud();
  keepInside();
}

function lawnTop() { return phase === 'play' ? Math.max(garden.lawn.y0, hudBottom) : garden.lawn.y0; }

function wormBounds() {
  const l = garden.lawn;
  return { x0: l.x0 + R * 0.5, x1: l.x1 - R * 0.5, y0: lawnTop() + R * 0.8, y1: l.y1 - R * 0.5 };
}

function tokenBounds(r) {
  const l = garden.lawn;
  const b = { x0: l.x0 + r + 6, x1: l.x1 - r - 6, y0: lawnTop() + r + 10, y1: l.y1 - r - 6 };
  if (b.x1 < b.x0) b.x0 = b.x1 = (l.x0 + l.x1) / 2;
  if (b.y1 < b.y0) b.y0 = b.y1 = (b.y0 + l.y1) / 2;
  return b;
}

function keepInside() {
  for (const t of tokens) {
    const b = tokenBounds(t.r);
    t.x = clamp(t.x, b.x0, b.x1); t.y = clamp(t.y, b.y0, b.y1);
    t.tx = clamp(t.tx, b.x0, b.x1); t.ty = clamp(t.ty, b.y0, b.y1);
  }
  const b = wormBounds();
  worm.x = clamp(worm.x, b.x0, b.x1);
  worm.y = clamp(worm.y, b.y0, b.y1);
}

// Pixels a second: speed 1 is a gentle crawl for a 4-year-old.
const speedPx = () => unit * (0.13 + (clamp(Number(S.speed) || 2, 1, 5) - 1) * 0.085);

// ---------- Word bar ----------

// Slot width in slot heights: one letter is a circle, numbers get a wider pill.
const slotW = (u) => (u.length <= 1 ? 1 : 0.32 + 0.34 * u.length);

// Fits the word bar: one row when the slots can be big enough, else as few rows as will do
// (long words or long counts on a phone).
function layoutHud() {
  const it = item();
  if (!it || els.hud.hidden) { hudBottom = 0; return; }
  const toolsN = (els.say.hidden ? 0 : 1) + (els.eye.hidden ? 0 : 1);
  const right = toolsN ? 24 + toolsN * 56 + (toolsN - 1) * 8 : 12;
  const side = Math.max(80, right);
  const ws = it.units.map(slotW);
  const n = ws.length;
  const gap = 0.12;
  const letters = it.kind === 'letter';
  const pref = letters ? clamp(Math.min(W, H) * 0.17, 62, 88) : clamp(Math.min(W, H) * 0.125, 42, 60);
  const good = Math.min(pref, it.kind === 'count' ? 34 : 38);
  const preK = letters ? 1.6 : 0;
  const chrome = 24 + 7 + 6 + (preK ? 10 : 0) + (it.kind === 'count' ? 8 : 0);
  const fit = (avail, wsum, cnt) => (avail - chrome) / (wsum + (cnt - 1) * gap + preK);

  let pick = null;
  for (let rows = 1; rows <= 4; rows++) {
    if (rows > 1 && n < rows * 2) break;
    const per = Math.ceil(n / rows);
    let rowW = 0;
    for (let i = 0; i < n; i += per) rowW = Math.max(rowW, ws.slice(i, i + per).reduce((x, y) => x + y, 0));
    const sInline = fit(W - 2 * side, rowW, per);
    const sStack = fit(W - 24, rowW, per);
    const stack = sInline < Math.min(pref, sStack) * 0.92;
    let sz = Math.min(pref, stack ? sStack : sInline);
    if (rows * sz * 1.15 > H * 0.24) sz = (H * 0.24) / (rows * 1.15);
    // Prefer fewer rows unless more rows make the slots clearly bigger.
    if (!pick || sz > pick.sz * 1.18) pick = { rows, per, rowW, stack, sz };
    if (sz >= good) break;
  }
  const sz = Math.max(22, Math.floor(pick.sz));
  els.hud.classList.toggle('stack', pick.stack);
  els.hud.style.setProperty('--hud-side', `${side}px`);
  els.hud.style.setProperty('--slot', `${sz}px`);
  els.slots.style.maxWidth = pick.rows > 1 ? `${Math.ceil(pick.rowW * sz + (pick.per - 1) * gap * sz) + 2}px` : '';
  els.dots.style.setProperty('--dot', plan.items.length > 12 ? '9px' : '13px');
  hudBottom = els.hud.getBoundingClientRect().bottom + 6;
  hudPick = { ...pick, sz };
}

function buildSlots() {
  const it = item();
  els.slots.textContent = '';
  it.units.forEach((u, i) => {
    const s = document.createElement('span');
    s.className = 'slot';
    s.style.setProperty('--w', slotW(u).toFixed(2));
    if (u.length > 2) s.classList.add('long');
    s.style.setProperty('--i', i);
    const ghost = document.createElement('span');
    ghost.className = 'ghost';
    ghost.textContent = u;
    const got = document.createElement('span');
    got.className = 'got';
    s.append(ghost, got);
    els.slots.appendChild(s);
  });
  els.bar.classList.remove('done');
  els.hud.classList.toggle('count', it.kind === 'count');
  els.bar.classList.toggle('letters', it.kind === 'letter');
  els.pre.hidden = it.kind === 'word';
  els.pre.classList.toggle('step', it.kind === 'count');
  els.pre.textContent = it.kind === 'letter' ? 'Find' : it.kind === 'count' ? `+${it.step}` : '';
  els.pre.setAttribute('aria-label', it.kind === 'count' ? `Count in steps of ${it.step}` : '');
}

function updateSlots() {
  const it = item();
  if (!it) return;
  const view = game.view;
  const peekOn = view === 'peek' && T < showUntil;
  game.peekOn = peekOn;
  [...els.slots.children].forEach((el, i) => {
    el.classList.toggle('filled', game.filled.has(i));
    el.classList.toggle('next', !game.busy && i === game.pos);
    const show = view === 'always' || view === 'letters' || peekOn || (view === 'count' && i === 0);
    el.classList.toggle('show', show);
  });
  els.bar.classList.toggle('peek', peekOn);
  els.look.hidden = !peekOn;
  els.dots.style.visibility = peekOn ? 'hidden' : '';
}

function updateDots() {
  els.dots.textContent = '';
  plan.items.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'dot' + (i < game.idx ? ' on' : i === game.idx ? ' now' : '');
    els.dots.appendChild(d);
  });
}

function updateTools() {
  els.say.hidden = !voiceOK();
  els.eye.hidden = !(game && game.view === 'peek');
  els.tools.hidden = els.say.hidden && els.eye.hidden;
}

function ping(el) {
  el.classList.remove('ping');
  void el.offsetWidth;
  el.classList.add('ping');
}

// ---------- Letter tokens ----------

function nextFruit() {
  if (!fruitBag.length) fruitBag = shuffle(FRUITS);
  return fruitBag.pop();
}

// A free spot on the lawn: away from the worm's head and body and from other tokens.
function spawnSpot(r, self = null) {
  const b = tokenBounds(r);
  const minHead = Math.max(R * 4 + r, Math.min(W, H) * 0.28);
  const ahead = { x: worm.x + Math.cos(worm.angle) * R * 3, y: worm.y + Math.sin(worm.angle) * R * 3 };
  let best = null, bestScore = -Infinity;
  for (let i = 0; i < 70; i++) {
    const x = rand(b.x0, b.x1), y = rand(b.y0, b.y1);
    let score = Math.min(Math.hypot(x - worm.x, y - worm.y) - minHead, 0) * 3;
    score += Math.min(Math.hypot(x - ahead.x, y - ahead.y) - minHead, 0) * 1.5;
    let dt = Infinity;
    for (const o of tokens) {
      if (o === self || o.state === 'gone' || o.state === 'vanish') continue;
      dt = Math.min(dt, Math.hypot(x - o.tx, y - o.ty) - (r + o.r) * 1.3);
    }
    score += Math.min(dt, 0) * 4 + Math.min(dt, 140) * 0.06;
    for (let k = 1; k < worm.segs.length; k += 2) {
      const s = worm.segs[k];
      score += Math.min(Math.hypot(x - s.x, y - s.y) - (s.r + r + 6), 0) * 2;
    }
    score += Math.random() * 18;
    if (score > bestScore) { bestScore = score; best = { x, y }; }
  }
  return best || { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 };
}

function addToken(text, isNeed, delay = 0) {
  const spot = spawnSpot(TR);
  const t = {
    text, need: isNeed, x: spot.x, y: spot.y, tx: spot.x, ty: spot.y, r: TR, f: nextFruit(),
    born: T + delay, since: T + delay, patience: rand(13, 19), state: 'live', ph: Math.random() * TAU,
    sq: 0, sqv: 0, z: 0, hop: null, vanishAt: 0,
  };
  tokens.push(t);
  return t;
}

const liveTokens = () => tokens.filter((t) => t.state === 'live' || t.state === 'hop');

function vanish(t, delay = 0) {
  if (t.state === 'gone' || t.state === 'vanish') return;
  t.state = 'vanish';
  t.vanishAt = T + delay;
}

// Makes sure the garden holds the letter needed now, plus the right number of decoys.
function syncTokens(stagger = false) {
  const it = item();
  const n = need();
  if (!it || !n) return;
  let k = 0;
  const live = liveTokens();
  live.forEach((t) => { t.need = false; });
  const found = live.find((t) => t.text === n);
  if (found) found.need = true;
  else addToken(n, true, stagger ? k++ * 0.09 : 0);
  // Count mode: decoys should stay near the number needed now.
  if (it.kind === 'count') {
    const far = countReach(it);
    live.forEach((t) => { if (!t.need && Math.abs(Number(t.text) - Number(n)) > far) vanish(t); });
  }
  const want = clamp(Math.round(Number(S.decoys) || 0), 0, 8);
  const decoys = liveTokens().filter((t) => !t.need);
  if (decoys.length > want) decoys.slice(want).forEach((t) => vanish(t));
  if (decoys.length < want) {
    const taken = liveTokens().map((t) => t.text);
    pickDecoys(plan, it, game.pos, want - decoys.length, taken, upper())
      .forEach((d) => addToken(d, false, stagger ? k++ * 0.09 : 0.1));
  }
}

function hop(t, bounced) {
  const spot = spawnSpot(t.r, t);
  const dist = Math.hypot(spot.x - t.x, spot.y - t.y);
  t.state = 'hop';
  t.hop = {
    x0: t.x, y0: t.y, x1: spot.x, y1: spot.y, start: T,
    dur: calm ? 0.35 : clamp(0.5 + dist / 900, 0.55, 0.95),
    h: calm ? 0 : clamp(40 + dist * 0.2, 40, 150),
  };
  t.tx = spot.x; t.ty = spot.y;
  t.sqv = bounced ? 9 : 5;
  if (!bounced) sfx('boop');
}

function updateTokens(dt) {
  const playing = phase === 'play' && game && !game.busy;
  for (const t of tokens) {
    t.sqv += (-230 * t.sq - 11 * t.sqv) * dt;
    t.sq = clamp(t.sq + t.sqv * dt, -0.35, 0.35);
    if (t.state === 'hop') {
      const k = clamp((T - t.hop.start) / t.hop.dur, 0, 1);
      const e = easeInOut(k);
      t.x = lerp(t.hop.x0, t.hop.x1, e);
      t.y = lerp(t.hop.y0, t.hop.y1, e);
      t.z = Math.sin(k * Math.PI) * t.hop.h;
      if (k >= 1) {
        t.state = 'live';
        t.z = 0;
        t.since = T;
        t.patience = rand(13, 19);
        t.sqv = -8;
        dust(t.x, t.y + t.r * 0.6);
      }
    } else if (t.state === 'live' && playing && T - t.since > t.patience) {
      // Uneaten for a long time: hop somewhere new.
      hop(t, false);
    }
  }
  tokens = tokens.filter((t) => t.state !== 'gone' && !(t.state === 'vanish' && T - t.vanishAt > 0.32));
}

function drawTokenAt(g, t) {
  if (T < t.born) return;
  let s = 1;
  const age = T - t.born;
  if (age < 0.38) s = Math.max(0, easeOutBack(age / 0.38));
  if (t.state === 'vanish' && T > t.vanishAt) s *= Math.max(0, 1 - (T - t.vanishAt) / 0.3);
  if (s < 0.04) return;
  const bob = calm ? t.r * 0.06 : t.r * (0.08 + Math.sin(T * 2.3 + t.ph) * 0.07);
  const z = t.z + bob;
  drawShadow(g, t.x, t.y, t.r * s * 0.94, z, 0.2 + 0.08 * (1 - Math.min(1, z / 120)));
  drawToken(g, t.x, t.y - z, t.r, t.f, t.text, {
    sx: s * (1 + t.sq), sy: s * (1 - t.sq), rot: calm ? 0 : Math.sin(T * 1.3 + t.ph) * 0.07,
  });
}

// ---------- Eating ----------

function checkBites() {
  for (const t of tokens) {
    if (t.state !== 'live' || T - t.born < 0.2) continue;
    if (Math.hypot(t.x - worm.x, t.y - worm.y) < R * 0.85 + t.r * 0.75) {
      if (t.need) goodBite(t); else badBite(t);
      return;
    }
  }
}

function goodBite(t) {
  const it = item();
  const i = game.pos;
  t.state = 'gone';
  sfx('chomp');
  worm.grow(T);
  worm.kick(5);
  game.correct += 1;
  game.pos += 1;
  crumbs(t.x, t.y, t.f);
  flyToSlot(t, i);
  if (it.kind === 'count' && game.pos < it.units.length) say(t.text);
  if (game.pos >= it.units.length) {
    game.busy = true;
    later(calm ? 0.35 : 0.62, wordDone);
  } else {
    syncTokens();
  }
  updateSlots();
}

function badBite(t) {
  game.mistakes += 1;
  sfx('hiccup');
  worm.hiccup(T);
  immuneUntil = T + 0.7;
  slowUntil = T + 0.6;
  puff(t.x, t.y, 6);
  hop(t, true);
}

// The eaten letter flies up to its slot in the word bar.
function flyToSlot(t, i) {
  const slot = els.slots.children[i];
  if (!slot) return;
  const token = game.token;
  const rect = slot.getBoundingClientRect();
  const size = t.r * 2;
  const el = document.createElement('div');
  el.className = 'flyer';
  el.textContent = t.text;
  el.style.width = el.style.height = `${size}px`;
  el.style.fontSize = `${Math.round(t.r * (t.text.length > 2 ? 0.75 : 1.05))}px`;
  el.style.setProperty('--c', t.f.c); el.style.setProperty('--hi', t.f.hi); el.style.setProperty('--lo', t.f.lo);
  document.body.appendChild(el);
  const x0 = t.x - t.r, y0 = t.y - t.r - t.r * 0.1;
  const x1 = rect.left + rect.width / 2 - t.r, y1 = rect.top + rect.height / 2 - t.r;
  const sc = rect.height / size;
  const mx = (x0 + x1) / 2 + (x0 < x1 ? -50 : 50), my = Math.min(y0, y1) + (Math.max(y0, y1) - Math.min(y0, y1)) * 0.25;
  const landNow = () => { el.remove(); land(i, t.f, token); };
  if (!el.animate) { landNow(); return; }
  const anim = el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)` },
    { transform: `translate(${mx}px, ${my}px) scale(1.18) rotate(-8deg)`, offset: 0.45 },
    { transform: `translate(${x1}px, ${y1}px) scale(${sc})` },
  ], { duration: calm ? 220 : 540, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
  anim.onfinish = landNow;
  anim.oncancel = landNow;
}

function land(i, f, token) {
  if (!game || game.token !== token) return;
  game.filled.add(i);
  const slot = els.slots.children[i];
  if (!slot) return;
  slot.style.setProperty('--c', f.c); slot.style.setProperty('--hi', f.hi); slot.style.setProperty('--lo', f.lo);
  slot.lastChild.textContent = item().units[i];
  slot.classList.remove('pop');
  void slot.offsetWidth;
  slot.classList.add('pop');
  sfx('pop');
  const r = slot.getBoundingClientRect();
  sparks(r.left + r.width / 2, r.top + r.height / 2, calm ? 3 : 7);
  updateSlots();
}

function wordDone() {
  const it = item();
  const lastOne = game.idx >= plan.items.length - 1;
  game.done.push(it.chip);
  P.words_eaten += 1;
  P.longest = Math.max(P.longest, worm.len);
  game.dirty = true;
  worm.setMood('happy', T + (lastOne ? 2.2 : 1.3));
  sfx(lastOne ? 'levelup' : 'ding');
  els.bar.classList.add('done');
  confetti(els.bar.getBoundingClientRect(), calm ? 16 : lastOne ? 90 : 50);
  say(it.sayEnd);
  liveTokens().forEach((t, k) => vanish(t, 0.15 + k * 0.05));
  game.dotsDone = game.idx + 1;
  [...els.dots.children].forEach((d, i) => { d.className = 'dot' + (i <= game.idx ? ' on' : ''); });
  later(lastOne ? 1.3 : 1.15, nextItem);
}

function nextItem() {
  if (!game) return;
  game.idx += 1;
  if (game.idx >= plan.items.length) endRound();
  else startItem();
}

function startItem() {
  const it = item();
  game.pos = 0;
  game.busy = false;
  game.filled = new Set();
  game.token = {};
  if (plan.mode === 'spell') {
    const v = S.show_word;
    game.view = v === 'listen' && !voiceOK() ? 'peek' : v === 'peek' || v === 'listen' ? v : 'always';
  } else {
    game.view = plan.mode === 'letters' ? 'letters' : 'count';
  }
  showUntil = game.view === 'peek' ? T + 3 : 0;
  buildSlots();
  updateTools();
  updateDots();
  layoutHud();
  syncTokens(true);
  updateSlots();
  later(0.3, () => { if (item() === it) say(it.sayStart); });
}

// ---------- Round ----------

let starting = false;

async function startRound() {
  if (starting) return;
  starting = true;
  tasks = [];
  sfx('tap');
  warmUpVoice();
  els.play.disabled = els.again.disabled = true;
  await ready;
  starting = false;
  els.play.disabled = els.again.disabled = false;
  flushHat();

  plan = buildRound(S, FALLBACK_WORDS);
  game = {
    idx: 0, pos: 0, mistakes: 0, correct: 0, done: [], filled: new Set(), busy: false, view: 'always',
    t0: T, wordsBefore: P.words_eaten, longestBefore: P.longest, dirty: false, token: {},
  };
  phase = 'play';
  els.start.hidden = true;
  els.end.hidden = true;
  endInfo = null;
  els.hud.hidden = false;
  tokens.forEach((t) => vanish(t));
  if (worm.len > START_LEN) puff(worm.segs[worm.segs.length - 1].x, worm.segs[worm.segs.length - 1].y, 8);
  worm.len = START_LEN;
  worm.hat = P.hat;
  worm.bulges = [];
  startItem();
}

// Phones only allow speech that starts from a tap: say nothing, quietly, now.
function warmUpVoice() {
  if (!voiceOK()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch { /* no voice: the game works without it */ }
}

async function endRound() {
  phase = 'end';
  const stars = starsFor(game.mistakes);
  const seconds = Math.round(T - game.t0);
  const earned = hatsEarned(game.wordsBefore, P.words_eaten);
  P = cleanProgress(P);
  if (earned.length) P.hat = earned[earned.length - 1].id;
  worm.hat = P.hat;
  const bestEver = worm.len > game.longestBefore;
  endInfo = { stars, len: worm.len, earned, bestEver, longest: P.longest, done: game.done.slice(), mode: plan.mode };
  game.dirty = false;
  later(1.1, showEnd);
  try {
    await record({ score: game.correct, stars, seconds, level: 1 });
  } catch { /* saved on the device; the launcher sends it later */ }
  saveProgress(P);
}

function showEnd() {
  const e = endInfo;
  els.hud.hidden = true;
  els.tools.hidden = true;
  hudBottom = 0;
  els.endStars.innerHTML = [0, 1, 2].map((i) => starSvg(i < e.stars)).join('');
  els.endStars.setAttribute('role', 'img');
  els.endStars.setAttribute('aria-label', `${e.stars} of 3 stars`);
  els.endH.textContent = e.stars === 3 ? 'Amazing!' : e.stars === 2 ? 'Brilliant!' : 'Well done!';
  els.grewN.textContent = e.len;
  els.longest.textContent = e.bestEver ? 'Your longest worm ever!' : `Longest ever: ${e.longest}`;
  els.longest.classList.toggle('best', e.bestEver);
  els.chips.textContent = '';
  e.done.forEach((c) => {
    const li = document.createElement('li');
    li.textContent = c;
    els.chips.appendChild(li);
  });
  els.chips.classList.toggle('many', e.done.length > 8);
  els.chips.setAttribute('aria-label', e.mode === 'spell' ? 'Words you spelled' : e.mode === 'letters' ? 'Letters you found' : 'Numbers you counted');
  els.unlock.hidden = !e.earned.length;
  if (e.earned.length) {
    const h = e.earned[e.earned.length - 1];
    els.unlockP.textContent = `New ${h.name.toLowerCase()}!`;
    later(0.8, () => { sfx('unlock'); const r = els.unlock.getBoundingClientRect(); sparks(r.left + r.width / 2, r.top + r.height * 0.4, 14); });
  }
  showCard(els.end);
  sfx('yay');
  setTimeout(() => els.again.focus({ preventScroll: true }), 50);
}

function showCard(el) {
  el.hidden = false;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// ---------- Particles (drawn on the top canvas) ----------

const CONFETTI = ['#F2505D', '#FFC933', '#4F78E6', '#3FB760', '#FF78B0', '#A35FE3', '#FF9A1F'];

function crumbs(x, y, f) {
  const n = calm ? 5 : 12;
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(90, 260);
    parts.push({ k: 'crumb', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 5, age: 0, life: rand(0.35, 0.6), r: rand(3, 6.5), c: i % 3 ? f.c : f.hi });
  }
  parts.push({ k: 'ring', x, y, vx: 0, vy: 0, age: 0, life: 0.4, r0: TR * 0.6, r1: TR * 1.2, c: '#fff' });
}

function dust(x, y) {
  if (calm) return;
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.1 + 0.8 * (i / 4)), sp = rand(40, 90);
    parts.push({ k: 'puff', x, y, vx: Math.cos(a) * sp * (i % 2 ? 1 : -1), vy: -Math.abs(Math.sin(a)) * sp * 0.3, drag: 4, age: 0, life: 0.45, r: rand(5, 8) });
  }
}

function puff(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(30, 110);
    parts.push({ k: 'puff', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 4, age: 0, life: rand(0.35, 0.55), r: rand(6, 11) });
  }
}

function sparks(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rand(-0.3, 0.3), sp = rand(70, 170);
    parts.push({ k: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.5, age: 0, life: rand(0.45, 0.7), s: rand(6, 10), rot: rand(0, TAU), vr: rand(-4, 4), c: i % 2 ? '#FFE36E' : '#fff' });
  }
}

function confetti(rect, n) {
  for (let i = 0; i < n; i++) {
    const x = rand(rect.left, rect.right), y = rect.bottom - 6;
    parts.push({
      k: 'conf', x, y, vx: rand(-170, 170), vy: rand(-320, -60), g: 620, drag: 1.2, age: 0, life: rand(1.4, 2.4),
      w: rand(7, 12), h: rand(4, 7), rot: rand(0, TAU), vr: rand(-9, 9), flip: rand(5, 11), c: CONFETTI[i % CONFETTI.length],
    });
  }
}

function star(g, x, y, R1, r1, rot) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5;
    const d = i % 2 ? r1 : R1;
    g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  g.closePath();
}

function updateParticles(dt) {
  for (const p of parts) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.g) p.vy += p.g * dt;
    if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; }
    if (p.vr) p.rot += p.vr * dt;
  }
  if (parts.length) parts = parts.filter((p) => p.age < p.life);
}

let fxDirty = false;
function drawParticles() {
  if (!parts.length && !fxDirty) return;
  fx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fx.clearRect(0, 0, W, H);
  fxDirty = parts.length > 0;
  for (const p of parts) {
    const k = p.age / p.life;
    fx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    if (p.k === 'conf') {
      fx.save();
      fx.translate(p.x, p.y);
      fx.rotate(p.rot);
      fx.scale(1, Math.cos(p.age * p.flip));
      fx.fillStyle = p.c;
      fx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      fx.restore();
    } else if (p.k === 'crumb') {
      fx.beginPath();
      fx.arc(p.x, p.y, p.r * (1 - k * 0.5), 0, TAU);
      fx.fillStyle = p.c;
      fx.fill();
      fx.lineWidth = 1.5;
      fx.strokeStyle = INK;
      fx.stroke();
    } else if (p.k === 'ring') {
      fx.beginPath();
      fx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * k, 0, TAU);
      fx.lineWidth = 5 * (1 - k);
      fx.strokeStyle = p.c;
      fx.stroke();
    } else if (p.k === 'puff') {
      fx.beginPath();
      fx.arc(p.x, p.y, p.r * (0.6 + k * 0.8), 0, TAU);
      fx.fillStyle = 'rgba(255,255,255,.75)';
      fx.fill();
    } else if (p.k === 'spark') {
      const s = p.s * (k < 0.25 ? k / 0.25 : 1 - (k - 0.25) * 0.6);
      star(fx, p.x, p.y, s, s * 0.42, p.rot);
      fx.fillStyle = p.c;
      fx.fill();
      fx.lineWidth = 1.4;
      fx.strokeStyle = INK;
      fx.stroke();
    }
  }
  fx.globalAlpha = 1;
}

// ---------- Steering ----------

let held = null;     // a finger (or mouse button) held on the garden
let mouse = null;    // where the mouse last moved
const keys = new Set();
const KEYS = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };

els.garden.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  held = { id: e.pointerId, x: e.clientX, y: e.clientY };
  if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY, at: T, done: false };
  try { els.garden.setPointerCapture(e.pointerId); } catch { /* fine */ }
});
els.garden.addEventListener('pointermove', (e) => {
  if (held && e.pointerId === held.id) { held.x = e.clientX; held.y = e.clientY; }
  if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY, at: T, done: false };
});
const letGo = (e) => { if (held && e.pointerId === held.id) held = null; };
els.garden.addEventListener('pointerup', letGo);
els.garden.addEventListener('pointercancel', letGo);
els.garden.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') mouse = null; });
els.garden.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  const k = KEYS[e.key];
  if (!k || phase !== 'play') return;
  keys.add(k);
  e.preventDefault();
});
window.addEventListener('keyup', (e) => { const k = KEYS[e.key]; if (k) keys.delete(k); });
window.addEventListener('blur', () => { keys.clear(); held = null; });

// Nobody steering: the worm drifts, but turns away from wrong letters just ahead of it,
// so a child who stops steering doesn't collect mistakes.
function dodge() {
  const hx = Math.cos(worm.angle), hy = Math.sin(worm.angle);
  let ax = 0, ay = 0;
  for (const t of tokens) {
    if (t.need || t.state !== 'live' || T < t.born) continue;
    const dx = t.x - worm.x, dy = t.y - worm.y, d = Math.hypot(dx, dy) || 1;
    const reach = R * 2.5 + t.r * 2;
    if (d > reach || (dx * hx + dy * hy) / d < -0.1) continue;
    const k = 1 - d / reach;
    // Push sideways, away from the letter.
    const side = Math.sign(hx * dy - hy * dx) || 1;
    ax += hy * side * k * 3 - (dx / d) * k;
    ay += -hx * side * k * 3 - (dy / d) * k;
  }
  if (!ax && !ay) return null;
  const x = hx + ax, y = hy + ay, l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}

function steer() {
  if (keys.size) {
    const x = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0);
    const y = (keys.has('d') ? 1 : 0) - (keys.has('u') ? 1 : 0);
    if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l }; }
  }
  let target = null;
  if (held) target = held;
  else if (mouse && !mouse.done && T - mouse.at < 4) target = mouse;
  if (!target) return null;
  const dx = target.x - worm.x, dy = target.y - worm.y, d = Math.hypot(dx, dy);
  // Reached the pointer: carry on (a resting mouse would otherwise have the worm circling it).
  if (d < R * (target === mouse ? 2 : 1.2)) {
    if (target === mouse) mouse.done = true;
    return { x: Math.cos(worm.angle), y: Math.sin(worm.angle) };
  }
  return { x: dx / d, y: dy / d };
}

// ---------- Main loop ----------

function update(dt) {
  const playing = phase === 'play';
  const v = speedPx() * (T < slowUntil ? 0.35 : 1) * (playing ? 1 : 0.55);
  const omega = Math.max(2.6, v / (R * 1.6));
  const nt = playing && !game.busy ? tokens.find((t) => t.need && (t.state === 'live' || t.state === 'hop') && T >= t.born) : null;
  if (nt) {
    const dx = nt.x - worm.x, dy = nt.y - nt.z - worm.y, d = Math.hypot(dx, dy) || 1;
    worm.look = { x: dx / d, y: dy / d };
  } else if (phase === 'start' && !els.start.hidden) {
    worm.look = { x: Math.sin(T * 0.7) * 0.8, y: -0.5 };
  } else {
    worm.look = { x: Math.cos(worm.angle) * 0.6, y: Math.sin(worm.angle) * 0.6 };
  }
  worm.update(dt, T, playing ? steer() || dodge() : null, wormBounds(), v, omega, calm);

  let near = Infinity;
  for (const t of tokens) if (t.state === 'live' && T > t.born) near = Math.min(near, Math.hypot(t.x - worm.x, t.y - worm.y) - t.r);
  const open = playing ? clamp(1 - (near - R) / (R * 2.5), 0, 1) : 0;
  worm.mouth += (open - worm.mouth) * Math.min(1, dt * 12);

  updateTokens(dt);
  if (playing && !game.busy && T > immuneUntil) checkBites();
  if (playing && game.view === 'peek' && game.peekOn !== T < showUntil) updateSlots();
  garden.update(dt, T, calm, lawnTop());
  updateParticles(dt);
}

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  garden.drawBack(ctx, T, calm);
  garden.drawGround(ctx);
  for (const t of tokens) if (t.state !== 'hop') drawTokenAt(ctx, t);
  worm.draw(ctx, T);
  for (const t of tokens) if (t.state === 'hop') drawTokenAt(ctx, t);
  worm.drawBubbles(ctx, T);
  garden.drawAir(ctx);
  drawParticles();
  if (!els.start.hidden) drawHero();
  if (!els.end.hidden && endInfo) drawEnd();
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (paused) return;
  T += dt;
  if (tasks.length) {
    const due = tasks.filter((x) => x.at <= T);
    if (due.length) {
      tasks = tasks.filter((x) => x.at > T);
      due.forEach((x) => x.fn());
    }
  }
  update(dt);
  draw();
}

document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (paused) { stopSpeaking(); keys.clear(); held = null; }
});

// Leaving mid-round still counts the words already finished.
window.addEventListener('pagehide', () => {
  if (game && game.dirty) { game.dirty = false; saveProgress(cleanProgress(P)); }
});

// ---------- Start card: the worm, its hat, the wardrobe ----------

function fitCanvas(c) {
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return null;
  const pw = Math.round(w * DPR), ph = Math.round(h * DPR);
  if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
  const g = c.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, w, h);
  return g;
}

function bodyAlong(n, hx, hy, Rh, sp, amp, phase0) {
  const segs = [];
  for (let i = 0; i < n; i++) {
    const tail = n - 1 - i;
    const r = i === 0 ? Rh : Rh * 0.86 * (tail < 4 ? 0.62 + tail * 0.095 : 1);
    const wave = calm ? Math.sin(i * 0.8) : Math.sin(i * 0.75 - phase0);
    segs.push({ x: hx - i * sp, y: hy + wave * amp * Math.min(1, i / 2), r });
  }
  return segs;
}

function drawHero() {
  const g = fitCanvas(els.hero);
  if (!g) return;
  const w = els.hero.clientWidth, h = els.hero.clientHeight;
  const n = 8;
  const Rh = Math.min(h * 0.2, 30, w / 10.4);
  const sp = Rh * 0.68;
  const tokR = Rh * 1.08;
  const span = (n - 1) * sp + Rh + Rh * 1.4 + tokR * 2;
  const hx = (w - span) / 2 + Rh * 0.2 + (n - 1) * sp, hy = h * 0.66;
  const segs = bodyAlong(n, hx, hy, Rh, sp, Rh * 0.32, T * 3.2);
  const tx = hx + Rh * 1.4 + tokR, ty = hy - Rh * 0.25;
  const bob = calm ? 0 : Math.sin(T * 2.3) * 4 + 4;
  drawShadow(g, tx, ty, tokR * 0.94, bob, 0.16);
  paintWorm(g, segs, {
    dir: { x: 1, y: 0 }, look: { x: 0.9, y: -0.3 }, blink: T % 3.6 < 0.13, hat: worm.hat,
    mouth: calm ? 0.3 : 0.3 + 0.25 * Math.sin(T * 3),
  });
  const label = S.mode === 'count' ? '1' : upper() ? 'A' : 'a';
  drawToken(g, tx, ty - bob, tokR, FRUITS[0], label, { rot: calm ? 0 : Math.sin(T * 1.3) * 0.08 });
}

function buildWardrobe() {
  els.wardrobe.textContent = '';
  const options = [{ id: null, name: 'No hat', at: 0 }, ...HATS];
  options.forEach((h) => {
    const open = h.id === null || P.hats.includes(h.id);
    const left = Math.max(0, h.at - P.words_eaten);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hat-btn' + (open ? '' : ' locked');
    b.setAttribute('aria-pressed', String(open && P.hat === h.id));
    b.setAttribute('aria-label', open ? h.name : `${h.name}: ${left} more to go`);
    const c = document.createElement('canvas');
    b.appendChild(c);
    if (!open) {
      const s = document.createElement('span');
      s.className = 'need';
      s.textContent = left;
      b.appendChild(s);
    }
    b.addEventListener('click', () => pickHat(h, open, b));
    els.wardrobe.appendChild(b);
    paintHatButton(c, h.id, open);
  });
}

function paintHatButton(c, id, open) {
  const g = fitCanvas(c);
  if (!g) return;
  const w = c.clientWidth, h = c.clientHeight;
  const Rh = Math.min(w, h) * 0.25;
  if (open) {
    paintWorm(g, [{ x: w / 2, y: h * 0.68, r: Rh }], { dir: { x: 0, y: 1 }, look: { x: 0, y: 0.3 }, hat: id, shadow: false });
  } else {
    drawHat(g, id, w / 2, h * 0.72, Rh * 1.05, { mono: true });
  }
}

let hatSaveTimer = 0;
function pickHat(h, open, btn) {
  if (!open) {
    btn.classList.remove('wiggle');
    void btn.offsetWidth;
    btn.classList.add('wiggle');
    sfx('boop');
    return;
  }
  hatTouched = true;
  P.hat = h.id;
  worm.hat = h.id;
  [...els.wardrobe.children].forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  sfx('pop');
  sparks(btn.getBoundingClientRect().left + 32, btn.getBoundingClientRect().top + 20, 6);
  clearTimeout(hatSaveTimer);
  hatSaveTimer = setTimeout(flushHat, 900);
}

function flushHat() {
  if (!hatSaveTimer) return;
  clearTimeout(hatSaveTimer);
  hatSaveTimer = 0;
  saveProgress(P);
}

// ---------- End card drawings ----------

function drawEnd() {
  const g = fitCanvas(els.endWorm);
  if (g) {
    const w = els.endWorm.clientWidth, h = els.endWorm.clientHeight;
    const n = Math.min(endInfo.len, 140);
    const margin = 16;
    let Rh = Math.min(h * 0.24, 24);
    let sp = Rh * 0.66;
    const room = w - margin * 2 - Rh * 2;
    if ((n - 1) * sp > room) { sp = room / (n - 1); Rh = clamp(sp / 0.62, 7, Rh); }
    const len = (n - 1) * sp + Rh * 2;
    const hx = (w + len) / 2 - Rh, hy = h * 0.62;
    const segs = bodyAlong(n, hx, hy, Rh, sp, Math.min(h * 0.16, Rh * 0.7), T * 4);
    paintWorm(g, segs, { dir: { x: 1, y: 0 }, look: { x: 0.4, y: -0.6 }, mood: 'happy', hat: worm.hat });
  }
  if (!els.unlock.hidden && endInfo.earned.length) {
    const u = fitCanvas(els.unlockHat);
    if (u) {
      const w = els.unlockHat.clientWidth, h = els.unlockHat.clientHeight;
      const Rh = Math.min(w, h) * 0.24;
      const bob = calm ? 0 : Math.sin(T * 3) * 3;
      paintWorm(u, [{ x: w / 2, y: h * 0.7 + bob, r: Rh }], {
        dir: { x: 0, y: 1 }, look: { x: 0, y: -0.4 }, mood: 'happy', hat: endInfo.earned[endInfo.earned.length - 1].id, shadow: false,
      });
    }
  }
}

// ---------- Buttons ----------

els.play.addEventListener('click', startRound);
els.again.addEventListener('click', startRound);
els.done.addEventListener('click', () => { sfx('tap'); flushHat(); goHome(); });
els.say.addEventListener('click', () => {
  const it = item();
  if (!it) return;
  ping(els.say);
  say(it.sayStart);
});
els.eye.addEventListener('click', () => {
  if (!game || game.view !== 'peek') return;
  ping(els.eye);
  sfx('tap');
  showUntil = Math.max(showUntil, T + 2);
  updateSlots();
});

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 120);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { clearTextCache(); layoutHud(); }).catch(() => {});

// ---------- Go ----------

resize();
worm.reset(W * 0.32, H * 0.74, -0.6, START_LEN + 3, R);
buildWardrobe();
showCard(els.start);
requestAnimationFrame((now) => { last = now; frame(now); });

// A small hook for the browser tests (tools/tests/e2e_word-worm.py).
window.__test = {
  state: () => ({
    phase, mode: plan && plan.mode, view: game && game.view, idx: game && game.idx, pos: game && game.pos, need: game && need(),
    busy: game && game.busy, mistakes: game && game.mistakes, correct: game && game.correct, len: worm.len,
    items: plan ? plan.items.map((i) => i.units.join(i.kind === 'count' ? ',' : '')) : [],
    listTitle: plan && plan.listTitle, settings: S, progress: P, said: said.slice(), hudBottom, hudPick, R, TR,
    tokens: liveTokens().map((t) => ({ text: t.text, need: t.need, state: t.state, x: Math.round(t.x), y: Math.round(t.y), r: t.r })),
    slots: [...els.slots.children].map((el) => ({
      ghost: el.classList.contains('show') ? el.firstChild.textContent : '', got: el.lastChild.textContent, next: el.classList.contains('next'),
    })),
  }),
  // Puts the needed (or a wrong) letter under the worm's head, so the next frame bites it.
  good: () => feed((t) => t.need),
  bad: () => feed((t) => !t.need),
  head: () => ({ x: worm.x, y: worm.y, angle: worm.angle }),
};

function feed(pick) {
  if (phase !== 'play' || !game || game.busy || T <= immuneUntil) return false;
  const t = tokens.find((x) => x.state === 'live' && T - x.born > 0.25 && pick(x));
  if (!t) return false;
  t.x = t.tx = worm.x;
  t.y = t.ty = worm.y;
  return true;
}
