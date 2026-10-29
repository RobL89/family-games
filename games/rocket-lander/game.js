// Rocket Lander: steer a falling rocket onto the number asked for on the planet's number line.
// A round is `landings_per_round` landings; stars for how many were right. Moon rocks for
// perfect landings and planets unlocked by good rounds are kept with saveProgress().

import { homeButton, record, goHome, loadSettings, settingsNow, loadProgress, progressNow, saveProgress } from '../../shared/game-kit.js';
import { play as sfx, speak, canSpeak, stopSpeaking, isMuted } from '../../shared/sound.js';
import { SETTINGS } from './settings.js';
import { makeLine, labelGap, nearness, fmt, say, starsFor, tidy } from './numbers.js';
import { PLANETS, planetIndex } from './planets.js';
import { Scene, Fx, drawRocket, drawRock, drawPlanetBall, clamp, lerp, ease, mix } from './scene.js';

const $ = (id) => document.getElementById(id);
const DEFAULT_PROGRESS = { unlocked: 1, planet: 'moon', rocks: 0, landings: 0 };
const FALL_SECONDS = [12, 8, 6, 5, 4]; // speed 1 to 5: seconds from the top to the ground
const INTRO = 0.7; // seconds the rocket takes to swoop in from above

const stage = $('stage');
const scene = new Scene($('scene'));
const fx = new Fx($('fx'));
const calm = matchMedia('(prefers-reduced-motion: reduce)');
scene.calm = calm.matches;
calm.addEventListener?.('change', () => { scene.calm = calm.matches; });

let S = settingsNow(SETTINGS);
let progress = progressNow(DEFAULT_PROGRESS);
let ready = false;
let chosen = 0; // planet picked on the start screen
let line = null, near = null, loggedNotes = '';

// The rocket, the pilot, and everything else drawn on the scene.
const R = { x: 0, y: -200, h: 80, rot: 0, sx: 1, sy: 1, legs: 0, flame: 0, pilotIn: true, blink: 0, mood: '', look: 0, vx: 0 };
const V = { rocket: null, pilot: null, flag: null, shadow: null, highlight: null, glow: null, arrow: null, perfect: null };
const G = {
  phase: 'start', t: 0, idx: 0, total: 8, target: null, prev: null, results: [], right: 0, perfects: 0, roundRocks: 0,
  startX: 0, startY: 0, touchY: 0, fallV: 0, started: 0, events: [], land: null, unlockedNew: -1,
};
const input = { active: false, id: null, x: 0, left: false, right: false };
let timeScale = 1;

homeButton({ style: { border: '4px solid #1B1446', color: '#1B1446', boxShadow: '0 4px 0 rgba(10,6,40,.55)' } });

// ---------- Settings and the line ----------

function applySettings() {
  line = makeLine(S);
  scene.setLine(line, Math.max(0, Number(S.label_every) || 0), S.show_as);
  sizeNearness();
  const notes = [...line.notes, ...scene.notes];
  const key = notes.join('; ');
  if (notes.length && key !== loggedNotes) console.info(`Rocket Lander settings: ${key}.`);
  loggedNotes = key;
  G.total = Math.round(clamp(Number(S.landings_per_round) || 8, 3, 20));
}

function sizeNearness() {
  if (!line || !scene.W || !scene.shownIdx) return;
  const gap = labelGap(line, scene.shownIdx);
  near = nearness(line, { closeEnough: Number(S.close_enough) || 0, pxPerStep: scene.pps, gapOfLabels: gap });
}

function fallSeconds() {
  const s = clamp(Number(S.speed) || 2, 1, 5);
  const i = Math.min(3, Math.floor(s - 1));
  return lerp(FALL_SECONDS[i], FALL_SECONDS[i + 1], s - 1 - i);
}

// ---------- Layout ----------

function resize() {
  const W = stage.clientWidth, H = stage.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const oldV = line && scene.ppu ? scene.valueAt(R.x) : null;
  const oldK = scene.H ? R.y / scene.H : null;
  scene.resize(W, H, dpr);
  fx.resize(W, H, dpr);
  R.h = scene.rocketH;
  sizeNearness();
  if (G.phase === 'start' || G.phase === 'end') return;
  // keep the rocket over the same number after turning the phone
  if (oldV != null) R.x = clamp(scene.xOf(oldV), scene.x0, scene.x1);
  measureFall();
  if (G.phase === 'fly') R.y = Math.min(G.touchY, lerp(G.startY, G.touchY, oldK == null ? 0 : clamp((oldK * H - G.startY) / (G.touchY - G.startY), 0, 1)));
  else if (G.phase === 'landed') R.y = G.touchY;
  if (G.land) G.land.x = scene.xOf(G.land.spot);
  placeBubble();
}

function measureFall() {
  const hud = $('hud').getBoundingClientRect();
  const top = hud.height ? hud.bottom : 80;
  scene.topPad = top;
  G.startY = top + R.h * 0.62;
  G.touchY = scene.groundY - 1 - R.h * 0.5;
  if (G.startY > G.touchY - R.h) G.startY = G.touchY - R.h;
  G.fallV = (G.touchY - G.startY) / fallSeconds();
}

new ResizeObserver(() => resize()).observe(stage);

// ---------- Start screen ----------

function drawRockIcons() {
  document.querySelectorAll('.rock-icon').forEach((c) => {
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    drawRock(x, c.width / 2, c.height / 2 + 1, c.width * 0.36, -0.2);
  });
}

function sanitiseProgress() {
  const p = progress;
  p.unlocked = Math.round(clamp(Number(p.unlocked) || 1, 1, PLANETS.length));
  const pi = typeof p.planet === 'number' ? p.planet : planetIndex(p.planet);
  p.planet = PLANETS[clamp(pi, 0, p.unlocked - 1)].id;
  p.rocks = Math.max(0, Math.round(Number(p.rocks) || 0));
  p.landings = Math.max(0, Math.round(Number(p.landings) || 0));
}

function renderPicker() {
  sanitiseProgress();
  chosen = planetIndex(progress.planet);
  const ul = $('planets');
  ul.innerHTML = '';
  PLANETS.forEach((P, i) => {
    const locked = i >= progress.unlocked;
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'planet';
    b.dataset.i = i;
    b.setAttribute('aria-label', locked ? 'Locked planet' : P.name);
    if (locked) b.setAttribute('aria-disabled', 'true');
    else b.setAttribute('aria-pressed', String(i === chosen));
    const c = document.createElement('canvas');
    c.width = c.height = 208;
    const x = c.getContext('2d');
    x.scale(2, 2);
    drawPlanetBall(x, i, 52, 52, P.rings ? 30 : 36, locked);
    const name = document.createElement('span');
    name.textContent = locked ? '?' : P.name;
    b.append(c, name);
    b.addEventListener('click', () => pickPlanet(i, b));
    li.appendChild(b);
    ul.appendChild(li);
  });
  $('start-rocks').textContent = progress.rocks;
  $('rocks-n').textContent = progress.rocks;
}

function pickPlanet(i, b) {
  if (i >= progress.unlocked) {
    sfx('boop');
    b.classList.remove('locked-shake'); void b.offsetWidth; b.classList.add('locked-shake');
    return;
  }
  sfx('tap');
  chosen = i;
  document.querySelectorAll('.planet[aria-pressed]').forEach((el) => el.setAttribute('aria-pressed', String(Number(el.dataset.i) === i)));
  scene.setPlanet(i);
}

function drawHero(t) {
  const c = $('hero');
  if (!c || !c.offsetParent) return;
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, c.width, c.height);
  const bob = scene.calm ? 0 : Math.sin(t * 2.2) * 6;
  drawRocket(x, { x: 100, y: 108 + bob, h: 150, rot: scene.calm ? 0 : Math.sin(t * 1.3) * 0.06, legs: 0, flame: 0.75, pilotIn: true, blink: blinkAt(t), mood: 'happy', look: 0 }, t);
}

// ---------- Round ----------

function startRound() {
  if (!ready) return;
  sfx('tap');
  progress.planet = PLANETS[chosen].id;
  scene.setPlanet(chosen);
  applySettings();
  $('start').hidden = true;
  $('end').hidden = true;
  $('hud').hidden = false;
  $('say').hidden = !(S.speak && canSpeak() && !isMuted());
  G.idx = 0; G.results = []; G.right = 0; G.perfects = 0; G.roundRocks = 0; G.prev = null; G.unlockedNew = -1;
  G.started = performance.now();
  $('rocks-n').textContent = progress.rocks;
  renderDots();
  R.h = scene.rocketH;
  nextLanding();
}

function renderDots() {
  const ol = $('dots');
  ol.innerHTML = '';
  for (let i = 0; i < G.total; i++) {
    const li = document.createElement('li');
    const r = G.results[i];
    if (r) li.className = r.right ? (r.perfect ? 'yes perfect' : 'yes') : 'no';
    else if (i === G.idx && G.phase !== 'end') li.className = 'now';
    ol.appendChild(li);
  }
  ol.setAttribute('aria-label', `Landing ${Math.min(G.idx + 1, G.total)} of ${G.total}`);
}

function pickTarget() {
  let i, tries = 0;
  do { i = Math.floor(Math.random() * line.count); tries++; } while (G.prev != null && line.value(i) === G.prev && tries < 50);
  return line.value(i);
}

function nextLanding() {
  G.target = pickTarget();
  G.prev = G.target;
  measureFall();
  const xt = scene.xOf(G.target);
  const span = scene.x1 - scene.x0;
  const zone = Math.min(span * 0.28, Math.max(R.h * 0.9, scene.W * 0.16));
  let x, tries = 0;
  do { x = scene.x0 + Math.random() * span; tries++; } while (Math.abs(x - xt) < zone && tries < 80);
  Object.assign(R, { x, y: -R.h, rot: 0, sx: 1, sy: 1, legs: 0, flame: 0.6, pilotIn: true, mood: '', look: 0, vx: 0 });
  Object.assign(V, { rocket: R, pilot: null, flag: null, highlight: null, glow: null, arrow: null, perfect: null });
  V.shadow = { x, k: 0, half: 0, a: 0, fromY: 0 };
  G.startX = x;
  G.land = null;
  G.events = [];
  setPhase('fly');
  input.active = false;
  showTarget();
  renderDots();
}

function showTarget() {
  const el = $('target');
  $('target-n').textContent = fmt(G.target, S.show_as);
  el.setAttribute('aria-label', `Land on ${say(G.target, S.show_as)}`);
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  fitTarget();
  sayTarget();
}

function fitTarget() {
  const el = $('target');
  el.style.fontSize = '';
  const room = $('hud').clientWidth - ($('say').hidden ? 0 : 74) - (innerWidth > 480 ? $('dots').parentElement.clientWidth + 100 : 24);
  let fs = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > room && fs > 18) { fs -= 2; el.style.fontSize = fs + 'px'; }
}

function sayTarget() {
  if (!S.speak) return;
  if (speak(`Land on ${say(G.target, S.show_as)}!`)) {
    const b = $('say');
    b.classList.remove('talking'); void b.offsetWidth; b.classList.add('talking');
  }
}

function setPhase(p) { G.phase = p; G.t = 0; }

function at(time, fn) { G.events.push({ at: time, fn }); }

// ---------- Landing ----------

function touchDown() {
  const raw = scene.valueAt(R.x);
  const spot = line.value(line.index(raw));
  const right = Math.abs(spot - G.target) <= near.allowed + 1e-9;
  const perfect = right && Math.abs(raw - G.target) <= near.perfect + 1e-9;
  G.land = { raw, spot, right, perfect, x: scene.xOf(spot), fromX: R.x, dir: R.x < scene.W / 2 ? 1 : -1, impact: 0 };
  G.results[G.idx] = { target: G.target, spot, right, perfect };
  R.y = G.touchY; R.vx = 0; R.flame = 0;
  V.shadow = null;
  setPhase('landed');
  input.active = false;
  const dustCol = mix(scene.planet.ground[1], '#FFFFFF', 0.45);
  if (right) {
    G.right += 1;
    if (perfect) G.perfects += 1;
    sfx('puff');
    scene.dust(R.x, scene.groundY, scene.calm ? 6 : 16, R.h, dustCol);
    R.mood = 'happy';
    V.glow = { value: spot, a: 0 };
    at(0.12, () => sfx('thud'));
    at(0.45, () => { V.pilot = { x: R.x, y: R.y, s: R.h * 0.5, mood: 'happy', wave: false, squash: 0, flip: G.land.dir < 0 }; R.pilotIn = false; });
    at(0.95, () => { V.flag = { x: 0, grow: 0, text: fmt(spot, S.show_as), dir: G.land.dir }; });
    at(1.15, () => sfx('ding'));
    if (perfect) {
      at(0.3, () => {
        V.perfect = { x: R.x, y: R.y - R.h * 0.85, t: 0 };
        sfx('sparkle');
        scene.burst(R.x, R.y - R.h * 0.2, scene.calm ? 8 : 22);
      });
      at(1.0, () => flyRock());
    }
    at(2.45, () => {});
    at(3.05, () => takeOff());
  } else {
    sfx('boop');
    scene.dust(R.x, scene.groundY, scene.calm ? 4 : 9, R.h, dustCol);
    R.mood = 'oh';
    at(0.4, () => sfx('boop'));
    at(0.55, () => {
      V.highlight = { value: G.target, a: 0 };
      V.arrow = { x: scene.xOf(G.target), a: 0 };
      showBubble(spot);
      if (S.speak) speak(`That's ${say(spot, S.show_as)}. ${say(G.target, S.show_as)} is over here!`);
    });
    at(2.6, () => { hideBubble(); sfx('whoosh'); });
    at(3.55, () => {
      sfx('puff');
      scene.dust(R.x, scene.groundY, scene.calm ? 4 : 10, R.h, dustCol);
      R.mood = 'happy';
      if (V.arrow) V.arrow.leaving = true;
    });
    at(4.3, () => takeOff());
  }
  renderDots();
}

function flyRock() {
  // counted straight away; the counter on screen catches up when the rock arrives
  progress.rocks += 1;
  G.roundRocks += 1;
  const shown = progress.rocks;
  const el = $('rocks');
  const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
  fx.rock(R.x, R.y - R.h * 0.3, r.left - s.left + 20, r.top - s.top + r.height / 2, () => {
    $('rocks-n').textContent = shown;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    sfx('pop');
  });
}

function takeOff() {
  hideBubble();
  setPhase('takeoff');
  G.takeFrom = R.y;
  V.pilot = null; R.pilotIn = true;
  sfx('whoosh');
}

function afterTakeOff() {
  G.idx += 1;
  V.flag = null; V.glow = null; V.highlight = null; V.arrow = null; V.perfect = null;
  if (G.idx >= G.total) endRound();
  else nextLanding();
}

// ---------- Speech bubble ----------

function showBubble(spot) {
  const b = $('bubble');
  b.innerHTML = `That's <b class="no-n">${fmt(spot, S.show_as)}</b>. <b>${fmt(G.target, S.show_as)}</b> is over here!`;
  b.hidden = false;
  b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  placeBubble();
}

function placeBubble() {
  const b = $('bubble');
  if (b.hidden) return;
  const w = b.offsetWidth;
  const x = R.x;
  let y = R.y - R.h * 0.62 - 12;
  // keep clear of the arrow when the right number is close by
  if (G.phase === 'landed' && scene.arrowCrowded(R.x, scene.xOf(G.target))) y = Math.min(y, scene.arrowTop(true) - 10);
  const left = clamp(x, w / 2 + 10, scene.W - w / 2 - 10);
  b.style.left = left + 'px';
  b.style.top = y + 'px';
  b.style.setProperty('--tail', clamp(50 + ((x - left) / w) * 100, 14, 86) + '%');
}

function hideBubble() { $('bubble').hidden = true; }

// ---------- End of round ----------

async function endRound() {
  setPhase('end');
  input.active = false;
  hideBubble();
  $('hud').hidden = true;
  V.rocket = null; V.shadow = null;
  const stars = starsFor(G.right, G.total);
  const seconds = Math.round((performance.now() - G.started) / 1000);
  const score = G.right + G.perfects;

  progress.landings += G.right;
  G.unlockedNew = -1;
  if (stars >= 2 && progress.unlocked < PLANETS.length) {
    G.unlockedNew = progress.unlocked;
    progress.unlocked += 1;
    progress.planet = PLANETS[G.unlockedNew].id;
  }

  $('end-h').textContent = stars === 3 ? 'Super landing!' : stars === 2 ? 'Great flying!' : 'Good try, pilot!';
  $('end-stars').innerHTML = [0, 1, 2].map((i) =>
    `<svg viewBox="0 0 24 24" class="${i < stars ? 'on' : ''}" aria-hidden="true"><path d="M12 2.2l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 16.9 6.2 20l1.2-6.5L2.6 9l6.5-.8z" fill="${i < stars ? '#FFC93C' : '#D9D3F7'}" stroke="#1B1446" stroke-width="1.6" stroke-linejoin="round"/>${i < stars ? '<path d="M8.6 9.6l1.4-.2.8-1.6" fill="none" stroke="#FFF6CF" stroke-width="1.3" stroke-linecap="round"/>' : ''}</svg>`).join('');
  $('end-stars').setAttribute('aria-label', `${stars} of 3 stars`);
  const rocksLine = G.roundRocks ? `<br><canvas class="rock-icon ic" width="56" height="56" aria-hidden="true"></canvas> ${G.roundRocks} moon rock${G.roundRocks === 1 ? '' : 's'}!` : '';
  $('end-p').innerHTML = `You landed <b>${G.right}</b> of <b>${G.total}</b>!${rocksLine}`;
  const un = $('unlock');
  if (G.unlockedNew >= 0) {
    un.hidden = false;
    $('unlock-name').textContent = PLANETS[G.unlockedNew].name;
    const c = $('unlock-ball'), x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    drawPlanetBall(x, G.unlockedNew, 100, 100, PLANETS[G.unlockedNew].rings ? 58 : 70, false);
  } else un.hidden = true;
  $('end').hidden = false;
  drawRockIcons();
  sfx(stars === 3 ? 'levelup' : 'yay');
  fx.confetti(stars * 45, scene.calm);
  if (G.unlockedNew >= 0) setTimeout(() => { sfx('unlock'); fx.confetti(90, scene.calm); }, 900);
  if (S.speak) speak(stars === 3 ? 'Super landing!' : stars === 2 ? 'Great flying!' : 'Good try!');

  await record({ score, stars, seconds, level: 1 });
  saveProgress({ unlocked: progress.unlocked, planet: progress.planet, rocks: progress.rocks, landings: progress.landings });
}

function playAgain() {
  stopSpeaking();
  chosen = planetIndex(progress.planet);
  renderPicker();
  startRound();
}

// ---------- Controls ----------

function steerable() { return G.phase === 'fly'; }

stage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button, .card')) return;
  if (!steerable()) return;
  e.preventDefault();
  input.active = true; input.id = e.pointerId; input.x = e.clientX - stage.getBoundingClientRect().left;
  try { stage.setPointerCapture(e.pointerId); } catch { /* fine */ }
});
stage.addEventListener('pointermove', (e) => {
  if (!input.active || e.pointerId !== input.id) return;
  input.x = e.clientX - stage.getBoundingClientRect().left;
});
const release = (e) => { if (e.pointerId === input.id) input.active = false; };
stage.addEventListener('pointerup', release);
stage.addEventListener('pointercancel', release);
stage.addEventListener('contextmenu', (e) => e.preventDefault());

const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
addEventListener('keydown', (e) => {
  const k = KEYS[e.key];
  if (!k) return;
  input[k] = true;
  if (steerable()) e.preventDefault();
});
addEventListener('keyup', (e) => { const k = KEYS[e.key]; if (k) input[k] = false; });
addEventListener('blur', () => { input.left = input.right = false; input.active = false; });

$('play').addEventListener('click', startRound);
$('again').addEventListener('click', playAgain);
$('done').addEventListener('click', () => { stopSpeaking(); goHome(); });
$('say').addEventListener('click', (e) => { e.stopPropagation(); sayTarget(); });

// ---------- The loop ----------

function blinkAt(t) {
  const p = t % 3.4;
  return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
}

function update(dt, t) {
  G.t += dt;
  for (const ev of G.events) if (!ev.done && G.t >= ev.at) { ev.done = true; ev.fn(); }
  R.blink = blinkAt(t);
  const maxV = clamp(scene.W * 0.42, 170, 540);

  if (G.phase === 'fly') {
    let want = 0;
    if (input.active) want = clamp((input.x - R.x) * 5, -maxV, maxV);
    else if (input.left !== input.right) want = (input.right ? 1 : -1) * maxV * 0.55;
    R.vx += (want - R.vx) * Math.min(1, dt * 9);
    R.x = clamp(R.x + R.vx * dt, scene.x0, scene.x1);
    if (R.x === scene.x0 || R.x === scene.x1) R.vx = 0;
    if (G.t < INTRO) R.y = lerp(-R.h, G.startY, ease.out(G.t / INTRO));
    else R.y = Math.min(G.touchY, Math.max(R.y, G.startY) + G.fallV * dt);
    const left = G.touchY - R.y;
    const wantLegs = left < R.h * 1.7 ? 1 : 0;
    if (wantLegs && R.legs === 0) sfx('pop');
    R.legs = clamp(R.legs + (wantLegs ? dt * 3.2 : -dt * 4), 0, 1);
    R.flame = lerp(R.flame, 0.5 + 0.45 * R.legs + Math.abs(R.vx) / maxV * 0.2, Math.min(1, dt * 6));
    R.rot = (R.vx / maxV) * 0.24 + (scene.calm ? 0 : Math.sin(t * 1.8) * 0.035);
    R.look = clamp(R.vx / (maxV * 0.5), -1, 1);
    R.sx = R.sy = 1;
    const k = clamp(1 - left / Math.max(1, G.touchY - G.startY), 0, 1);
    const half = near.allowed > 0 ? near.allowed * scene.ppu : 0;
    V.shadow = { x: R.x, k, half, a: clamp(G.t / 0.6, 0, 1), fromY: R.y + R.h * 0.5, snap: line.value(line.index(scene.valueAt(R.x))) };
    scene.exhaust(R.x - Math.sin(R.rot) * R.h * 0.4, R.y, R.h, R.flame, dt);
    scene.offX = lerp(scene.offX, (R.x - scene.W / 2) * 0.6, Math.min(1, dt * 2));
    if (R.y >= G.touchY) touchDown();
  } else if (G.phase === 'landed') {
    const L = G.land, t2 = G.t;
    // slide onto the landing spot
    const snapK = ease.out(clamp(t2 / 0.25, 0, 1));
    let x = lerp(L.fromX, L.x, snapK), y = G.touchY;
    if (L.right) {
      const sq = 0.22 * Math.exp(-t2 * 6) * Math.cos(t2 * 20);
      R.sy = 1 - sq; R.sx = 1 + sq * 0.6;
      if (V.glow) V.glow.a = clamp(t2 / 0.3, 0, 1);
      R.legs = 1;
    } else {
      // two soft bounces, then a hop over to the right number
      let hop = 0;
      if (t2 < 0.4) hop = Math.sin((t2 / 0.4) * Math.PI) * R.h * 0.32;
      else if (t2 < 0.62) hop = Math.sin(((t2 - 0.4) / 0.22) * Math.PI) * R.h * 0.1;
      const after = t2 < 0.4 ? t2 : t2 < 0.62 ? t2 - 0.4 : t2 - 0.62;
      const sq = (t2 < 0.62 ? 0.16 : 0.08) * Math.exp(-after * 9) * Math.cos(after * 22);
      R.sy = 1 - sq; R.sx = 1 + sq * 0.6;
      y -= hop;
      R.rot = Math.sin(t2 * 9) * 0.08 * Math.exp(-t2 * 2.5);
      if (t2 >= 2.6 && t2 < 3.55) {
        const k = (t2 - 2.6) / 0.95;
        x = lerp(L.x, scene.xOf(G.target), ease.inOut(k));
        y = G.touchY - Math.sin(k * Math.PI) * R.h * 0.75;
        R.flame = Math.sin(k * Math.PI) * 0.85;
        R.rot = Math.sin(k * Math.PI) * 0.18 * Math.sign(scene.xOf(G.target) - L.x);
        scene.exhaust(x, y, R.h, R.flame, dt);
      } else if (t2 >= 3.55) {
        x = scene.xOf(G.target);
        R.flame = 0;
        const a2 = t2 - 3.55, sq2 = 0.16 * Math.exp(-a2 * 7) * Math.cos(a2 * 20);
        R.sy = 1 - sq2; R.sx = 1 + sq2 * 0.6; R.rot = 0;
      }
      if (V.highlight) V.highlight.a = clamp((t2 - 0.55) / 0.3, 0, 1);
      if (V.arrow) {
        V.arrow.a = V.arrow.leaving ? Math.max(0, V.arrow.a - dt * 4) : clamp((t2 - 0.55) / 0.35, 0, 1);
        V.arrow.x = scene.xOf(G.target);
        V.arrow.rocketX = x;
      }
      placeBubble();
    }
    R.x = x; R.y = y;
    // the pilot pops out, plants a flag and waves, then hops back in
    const P = V.pilot;
    if (P && L.right) {
      const s = R.h * 0.5;
      const win = { x: R.x, y: R.y - R.h * 0.045 + s * 0.6 };
      const out = { x: R.x + L.dir * (R.h * 0.42 + s * 0.38), y: scene.groundY - 1 };
      const sOut = 0.45, sBack = 2.45;
      if (t2 < sOut + 0.45) {
        const k = clamp((t2 - sOut) / 0.45, 0, 1);
        P.x = lerp(win.x, out.x, k); P.y = lerp(win.y, out.y, k) - Math.sin(k * Math.PI) * R.h * 0.75; P.s = s * lerp(0.6, 1, k);
        P.squash = 0;
      } else if (t2 < sBack) {
        P.x = out.x; P.y = out.y; P.s = s;
        const a2 = t2 - (sOut + 0.45);
        P.squash = 0.25 * Math.exp(-a2 * 8) * Math.cos(a2 * 22);
        P.wave = t2 > 1.4;
        if (V.flag) { V.flag.x = out.x + L.dir * s * 0.42; V.flag.grow = clamp((t2 - 0.95) / 0.45, 0, 1); }
      } else {
        const k = clamp((t2 - sBack) / 0.4, 0, 1);
        P.x = lerp(out.x, win.x, k); P.y = lerp(out.y, win.y, k) - Math.sin(k * Math.PI) * R.h * 0.6; P.s = s * lerp(1, 0.6, k);
        P.wave = false; P.squash = 0;
        if (k >= 1) { V.pilot = null; R.pilotIn = true; }
      }
      P.blink = R.blink;
    }
    if (V.perfect) V.perfect.t += dt;
  } else if (G.phase === 'takeoff') {
    const t2 = G.t;
    R.legs = clamp(1 - t2 * 3, 0, 1);
    R.flame = lerp(R.flame, 1.25, Math.min(1, dt * 8));
    R.sx = R.sy = 1; R.rot = scene.calm ? 0 : Math.sin(t2 * 30) * 0.02;
    const a = (2 * (G.takeFrom + R.h * 1.5)) / (0.95 * 0.95);
    R.y = G.takeFrom - 0.5 * a * Math.max(0, t2 - 0.12) ** 2;
    if (t2 < 0.2 && Math.random() < 0.6) scene.dust(R.x, scene.groundY, 1, R.h, mix(scene.planet.ground[1], '#FFFFFF', 0.45));
    scene.exhaust(R.x, R.y, R.h, R.flame, dt);
    if (V.flag) V.flag.grow = Math.max(0, V.flag.grow - dt * 4);
    if (V.glow) V.glow.a = Math.max(0, V.glow.a - dt * 3);
    if (V.highlight) V.highlight.a = Math.max(0, V.highlight.a - dt * 3);
    if (R.y < -R.h * 1.4) afterTakeOff();
  }
}

let last = performance.now(), frame = 0, clock = 0;

function loop(now) {
  const real = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  const dt = real * timeScale;
  clock += dt;
  update(dt, clock);
  if (!scene.calm) scene.scroll += dt * (G.phase === 'takeoff' ? 60 : 6);
  scene.draw(V, clock, dt);
  fx.draw(real, clock);
  if (G.phase === 'start') drawHero(clock);
  frame = requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    input.active = input.left = input.right = false;
    stopSpeaking();
  } else {
    last = performance.now();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(loop);
  }
});

// ---------- Boot ----------

function boot() {
  sanitiseProgress();
  chosen = planetIndex(progress.planet);
  scene.setPlanet(chosen);
  applySettings();
  resize();
  renderPicker();
  drawRockIcons();
  V.rocket = null;
  frame = requestAnimationFrame(loop);
  const play = $('play');
  play.disabled = true;
  play.setAttribute('aria-busy', 'true');
  Promise.all([
    loadSettings(SETTINGS).catch(() => settingsNow(SETTINGS)),
    loadProgress(DEFAULT_PROGRESS).catch(() => progressNow(DEFAULT_PROGRESS)),
  ]).then(([s, p]) => {
    S = s;
    progress = p;
    renderPicker();
    scene.setPlanet(chosen);
    applySettings();
    resize();
  }).finally(() => {
    ready = true;
    play.disabled = false;
    play.removeAttribute('aria-busy');
  });
}

boot();

// ---------- Test hook (used by tools/tests/e2e_rocket-lander.py) ----------

window.__test = {
  state: () => ({
    phase: G.phase, target: G.target, idx: G.idx, total: G.total, right: G.right, perfects: G.perfects, ready,
    rocks: progress.rocks, progress: { ...progress }, allowed: near && near.allowed, perfect: near && near.perfect, tight: near && near.tight,
    pps: scene.pps, x0: scene.x0, x1: scene.x1, rocketX: R.x, rocketY: R.y, touchY: G.touchY, startY: G.startY, startX: G.startX,
    rocketValue: line && scene.ppu ? tidy(scene.valueAt(R.x)) : null,
    labels: scene.shown.map((s) => s.text), line: line && { from: line.from, to: line.to, step: line.step, count: line.count },
    results: G.results.slice(), settings: { ...S }, labelSize: scene.fs, unlockedNew: G.unlockedNew,
  }),
  xOf: (v) => scene.xOf(v),
  // put the rocket over a number (it keeps falling)
  place(v) { R.x = clamp(scene.xOf(v), scene.x0, scene.x1); R.vx = 0; input.active = false; },
  // skip most of the fall
  drop() { if (G.phase === 'fly') { G.t = Math.max(G.t, INTRO); R.y = G.touchY - R.h * 0.25; } },
  right(offset = 0) { this.place(G.target + offset); this.drop(); },
  wrongSpot() {
    if (!line) return null;
    let best = null;
    for (let i = 0; i < line.count; i++) {
      const v = line.value(i), d = Math.abs(v - G.target);
      if (d > near.allowed + 1e-9 && (best == null || d < Math.abs(best - G.target))) best = v;
    }
    return best;
  },
  wrong() { const v = this.wrongSpot(); if (v == null) return false; this.place(v); this.drop(); return v; },
  speed(k) { timeScale = k; },
  // show another planet's scenery (looks only; nothing is saved)
  planet(i) { scene.setPlanet(i); },
  freeze(on) { if (on) { cancelAnimationFrame(frame); } else { last = performance.now(); frame = requestAnimationFrame(loop); } },
};
