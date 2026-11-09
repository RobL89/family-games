// The rocket games' round flow, shared by Rocket Lander and Rocket Sums (D-027, D-037).
// Version 1.2. Changes at v1.2 (step 2a-4b): the hangar (D-050 to D-053). The moon-rocks counter
// on the start card is the hangar door, its doorway showing the ship flown (the title's rocket
// stays today's, as the logo); it opens the showroom (hangar.js), where ships are bought and
// picked through fleet.js. The ship flown is drawn in play (ships.js) with its own effects,
// kept above the ground so they never cover the numbers (D-045), and its own touchdown sound;
// Bip's fireworks take its colours. Progress gains `ship` and `ships` (D-053).
// Changes at v1.1 (step 2a-3): the round ends with Bip's moment (D-044): after the
// last landing (a right one, or after the hop to the right number) a gold pad slides out, a
// ladder drops, Bip climbs down and plants a big flag with the round's stars, fireworks go
// off, and only then is the round reported and the end card shown. Played on its own, a tile
// keeps its progress on the device (D-042, kit.js). Version 1.0 moved the flow here from
// games/rocket-lander/game.js in step 2a-2; what differs between the two tiles comes in as a
// mode (below).
//
// Steer a falling rocket onto the spot asked for on the planet's number line. A round is
// `landings_per_round` landings; stars for how many were right. Moon rocks for perfect
// landings and planets unlocked by good rounds are kept with saveState(). Runs on its own
// (D-004, D-014; GC5): level 1, or ?level= in the address, built-in settings, and its state
// kept in memory while it runs. begin() takes a level, settings and saved state; at stage 3
// the game contract's start message calls it.
//
// A mode is an object with:
//   id                         the tile's folder name, for its progress kept on the device;
//   name                       the tile's name, for console notes;
//   schema                     its settings schema (settings.js's shape);
//   levelOf(given)             { level, row, note }: the level to play (GC3, GC5);
//   lineFor(row, S)            the round's line { from, to, step, label_every };
//   landingLine(T, row, S, rand)  optional: a line for this landing alone (Maths mode's
//                              window), or null to keep the round's;
//   planRound(row, total, rand)   the kind of target for each landing;
//   pickTarget(kind, line, prev, rand, row, S)  one landing's target T: { rule, value?, ... },
//                              where `value` is the one right spot, if there is one;
//   isRight(T, spot, allowed), goalOf(T, raw, line)  right or wrong, and the spot shown
//                              (and hopped to) after a miss;
//   chip(T, S)                 { cls, html } for the target chip; words(T, S) for speech;
//   miss(T, spot, goal, S)     { speech, html } said and shown after a miss;
//   beam                       true to show a beam to the exact landing spot (D-032);
//   testHooks                  optional extra __test functions, each called while flying
//                              as fn(...args, { line, set(T) }).

import { homeButton, report, reported, goHome, saveState, savedState, keepOnDevice, keptOnDevice } from './kit.js';
import { play as sfx, speak, canSpeak, stopSpeaking, isMuted } from './sound.js';
import { resolveSettings } from './settings.js';
import { makeLine, labelGap, nearness, fmt, starsFor, tidy } from './numbers.js';
import { PLANETS, planetIndex } from './planets.js';
import { Scene, Fx, drawRocket, drawRock, drawPlanetBall, ladderEnds, clamp, lerp, ease, mix } from './scene.js';
import { FLEET_BY_ID, STARTER, hangarOf, buy as buyShip, pick as pickShip } from './fleet.js';
import { SHIP_BY_ID, Parts, newState, tickShip, landShip, drawShip, drawTrail } from './ships.js';
import { Hangar } from './hangar.js';

export function runRocket(mode) {
  const $ = (id) => document.getElementById(id);
  const DEFAULT_PROGRESS = { unlocked: 1, planet: 'moon', rocks: 0, landings: 0, ship: STARTER, ships: [STARTER] };
  const FALL_SECONDS = [12, 8, 6, 5, 4]; // speed 1 to 5: seconds from the top to the ground
  const INTRO = 0.7; // seconds the rocket takes to swoop in from above

  const stage = $('stage');
  const scene = new Scene($('scene'));
  const fx = new Fx($('fx'));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  scene.calm = calm.matches;
  calm.addEventListener?.('change', () => { scene.calm = calm.matches; });

  const SCHEMA = mode.schema;
  let S = resolveSettings(SCHEMA).values;
  let level = mode.levelOf(null);
  let progress = { ...DEFAULT_PROGRESS };
  let ready = false;
  let chosen = 0; // planet picked on the start screen
  let line = null, lineKey = '', near = null, loggedNotes = '';

  // The rocket, the pilot, and everything else drawn on the scene.
  const R = { x: 0, y: -200, h: 80, rot: 0, sx: 1, sy: 1, legs: 0, flame: 0, pilotIn: true, blink: 0, mood: '', look: 0, vx: 0 };
  const V = { rocket: null, pilot: null, flag: null, shadow: null, highlight: null, glow: null, arrow: null, perfect: null,
    pad: null, ladder: null, bigFlag: null, fireworks: null };
  const G = {
    phase: 'start', t: 0, idx: 0, total: 8, T: null, goal: null, prev: null, plan: [], results: [], right: 0, perfects: 0, roundRocks: 0,
    startX: 0, startY: 0, touchY: 0, fallV: 0, started: 0, events: [], land: null, unlockedNew: -1, fin: null,
  };
  const input = { active: false, id: null, x: 0, left: false, right: false };
  let timeScale = 1;
  let hangar = null; // the showroom (made at boot)
  let flyShip = null; // the ship flown in play, when it isn't today's rocket
  let flownId = null; // the ship last drawn in play (for the tests)
  const SH = newState(80), PP = new Parts(); // its state and effects in play
  const DS = { id: null, S: null, P: new Parts() }; // the ship in the hangar door's doorway

  const home = homeButton({ style: { border: '4px solid #1B1446', color: '#1B1446', boxShadow: '0 4px 0 rgba(10,6,40,.55)' } });

  // ---------- Settings and the line ----------

  function applySettings() {
    useLine(mode.lineFor(level.row, S));
    scene.setLabelLook(level.row.labels || 'plain');
    G.total = Math.round(clamp(Number(S.landings_per_round) || 8, 3, 20));
  }

  // Lay out a line ({ from, to, step, label_every }) and size the landing leeway to it.
  function useLine(L) {
    line = makeLine(L);
    lineKey = [L.from, L.to, L.step, L.label_every].join(',');
    scene.setLine(line, Math.max(0, Number(L.label_every) || 0), S.show_as);
    sizeNearness();
    const notes = [...line.notes, ...scene.notes];
    const key = notes.join('; ');
    if (notes.length && key !== loggedNotes) console.info(`${mode.name} settings: ${key}.`);
    loggedNotes = key;
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
    if (hangar) hangar.resize();
    R.h = scene.rocketH;
    sizeNearness();
    if (G.phase === 'start' || (G.phase === 'end' && !G.fin)) return;
    // keep the rocket over the same number after turning the phone
    if (oldV != null) R.x = clamp(scene.xOf(oldV), scene.x0, scene.x1);
    measureFall();
    if (G.phase === 'fly') R.y = Math.min(G.touchY, lerp(G.startY, G.touchY, oldK == null ? 0 : clamp((oldK * H - G.startY) / (G.touchY - G.startY), 0, 1)));
    else if (G.phase === 'landed' || G.fin) R.y = G.touchY;
    if (G.land) G.land.x = scene.xOf(G.land.spot);
    if (G.fin) { G.fin.x = R.x; placeFinale(); }
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
    Object.assign(p, hangarOf(p)); // D-053: Classic always; only ships owned are flown
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

  // ---------- The hangar (D-050 to D-053) ----------

  // The ship flown, in the hangar door's doorway on the start card (D-052), with its effects.
  function drawDoorShip(t, dt) {
    const c = $('door-ship');
    if (!c || !c.offsetParent) return;
    const ship = SHIP_BY_ID[progress.ship] || SHIP_BY_ID[STARTER];
    if (DS.id !== ship.id) { DS.id = ship.id; DS.S = newState(150); DS.P.clear(); }
    const S = DS.S;
    DS.P.k = scene.calm ? 0.35 : 1;
    Object.assign(S, { x: 70, y: 86 + (scene.calm ? 0 : Math.sin(t * 2.2) * 6), rot: scene.calm ? 0 : Math.sin(t * 1.3) * 0.06, legs: 0, thrust: 0.75, air: true, gy: 190 });
    tickShip(ship, S, DS.P, dt, t);
    DS.P.update(dt);
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, c.width, c.height);
    DS.P.draw(x, 'back'); drawShip(x, ship, S, t); DS.P.draw(x, 'front');
  }

  // What's kept: in memory for the shell (GC8) and on this device until the shell keeps it (D-042).
  function keep() {
    const kept = { unlocked: progress.unlocked, planet: progress.planet, rocks: progress.rocks, landings: progress.landings, ship: progress.ship, ships: progress.ships.slice() };
    saveState(kept);
    keepOnDevice(mode.id, kept);
  }

  function openHangar() {
    if (!ready || G.phase !== 'start' || !hangar.open()) return;
    sfx('tap');
    $('start').hidden = true;
    home.hidden = true;
  }

  function hangarClosed() {
    $('start').hidden = false;
    home.hidden = false;
    renderPicker();
    drawRockIcons();
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
    G.idx = 0; G.results = []; G.right = 0; G.perfects = 0; G.roundRocks = 0; G.prev = null; G.unlockedNew = -1; G.fin = null;
    G.plan = mode.planRound(level.row, G.total, Math.random);
    G.started = performance.now();
    $('rocks-n').textContent = progress.rocks;
    renderDots();
    R.h = scene.rocketH;
    // the ship flown (D-053): today's rocket is drawn as before; any other by ships.js
    flyShip = progress.ship !== STARTER && SHIP_BY_ID[progress.ship] ? SHIP_BY_ID[progress.ship] : null;
    flownId = flyShip ? null : STARTER; // set by drawFlyShip once the ship is really drawn
    PP.clear(); PP.k = scene.calm ? 0.35 : 1;
    V.drawShip = flyShip ? drawFlyShip : null;
    nextLanding();
  }

  // The ship flown follows the rocket's every move (R), so play is the same whichever it is
  // (D-046); its own moving parts and effects come from ships.js.
  function syncShip(dt, t) {
    if (!flyShip) return;
    Object.assign(SH, { x: R.x, y: R.y, h: R.h, rot: R.rot, legs: R.legs, pilotIn: R.pilotIn, mood: R.mood || 'happy', look: R.look, gy: scene.groundY, inPlay: true });
    SH.thrust = clamp(R.flame, 0, 1.25);
    SH.air = G.phase === 'fly' || G.phase === 'takeoff' || R.flame > 0.05;
    SH.steer = clamp(R.vx / 300, -1, 1);
    tickShip(flyShip, SH, PP, dt, t);
    SH.sx = R.sx; SH.sy = R.sy; SH.sqT = null; SH.blink = R.blink; // the round's own squash and blink
    PP.update(dt);
  }

  // Effects stay above the ground, so they never cover the numbers under the line (D-045).
  function drawFlyShip(ctx, t) {
    const clip = () => { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, scene.W, scene.groundY + 6); ctx.clip(); };
    clip(); drawTrail(ctx, flyShip, SH, t); PP.draw(ctx, 'back'); ctx.restore();
    drawShip(ctx, flyShip, SH, t);
    flownId = flyShip.id;
    clip(); PP.draw(ctx, 'front'); ctx.restore();
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

  // The spot a target points at: its one right spot or, where several are right (even or
  // odd), the nearest right one to x.
  function spotFor(T, x = R.x) { return T.value !== undefined ? T.value : mode.goalOf(T, scene.valueAt(x), line); }

  // The mode's own line for this landing, if it has one (Maths mode's stretch of 10 marks).
  function lineForTarget() {
    const own = mode.landingLine ? mode.landingLine(G.T, level.row, S, Math.random) : null;
    if (own && [own.from, own.to, own.step, own.label_every].join(',') !== lineKey) useLine(own);
  }

  function nextLanding() {
    G.T = mode.pickTarget(G.plan[G.idx], line, G.prev, Math.random, level.row, S);
    G.prev = G.T;
    lineForTarget();
    G.goal = null;
    measureFall();
    const xt = scene.xOf(spotFor(G.T, scene.W / 2));
    const span = scene.x1 - scene.x0;
    const zone = Math.min(span * 0.28, Math.max(R.h * 0.9, scene.W * 0.16));
    let x, tries = 0;
    do { x = scene.x0 + Math.random() * span; tries++; } while (Math.abs(x - xt) < zone && tries < 80);
    Object.assign(R, { x, y: -R.h, rot: 0, sx: 1, sy: 1, legs: 0, flame: 0.6, pilotIn: true, mood: '', look: 0, vx: 0 });
    Object.assign(V, { rocket: R, pilot: null, flag: null, highlight: null, glow: null, arrow: null, perfect: null,
      pad: null, ladder: null, bigFlag: null, fireworks: null });
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
    const el = $('target'), chip = $('target-n'), T = G.T;
    const c = mode.chip(T, S);
    chip.className = 'chip' + (c.cls ? ` ${c.cls}` : '');
    chip.innerHTML = c.html;
    el.setAttribute('aria-label', `Land on ${mode.words(T, S)}`);
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
    if (speak(`Land on ${mode.words(G.T, S)}!`)) {
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
    const T = G.T;
    const right = mode.isRight(T, spot, near.allowed);
    const perfect = right && Math.abs(raw - (T.value !== undefined ? T.value : spot)) <= near.perfect + 1e-9;
    G.goal = right ? spot : mode.goalOf(T, raw, line);
    G.land = { raw, spot, right, perfect, x: scene.xOf(spot), fromX: R.x, dir: R.x < scene.W / 2 ? 1 : -1, impact: 0 };
    G.results[G.idx] = { target: T.value !== undefined ? T.value : null, rule: T.rule, parity: T.parity || null, ...(T.sum ? { sum: T.sum } : {}),
      goal: G.goal, spot, right, perfect };
    R.y = G.touchY; R.vx = 0; R.flame = 0;
    V.shadow = null;
    setPhase('landed');
    input.active = false;
    const dustCol = mix(scene.planet.ground[1], '#FFFFFF', 0.45);
    const last = G.idx >= G.total - 1;
    const touch = (FLEET_BY_ID[progress.ship] || FLEET_BY_ID[STARTER]).sound; // each ship's own (D-046)
    if (flyShip && right) { SH.dust = dustCol; landShip(flyShip, SH, PP); SH.sqT = null; }
    if (right && last) {
      // the round's last landing: Bip's moment instead of the small flag and take-off (D-044)
      G.right += 1;
      if (perfect) G.perfects += 1;
      sfx('puff');
      scene.dust(R.x, scene.groundY, scene.calm ? 6 : 16, R.h, dustCol);
      R.mood = 'happy';
      V.glow = { value: spot, a: 0 };
      at(0.12, () => sfx(touch));
      if (perfect) {
        at(0.3, () => {
          V.perfect = { x: R.x, y: R.y - R.h * 0.85, t: 0 };
          sfx('sparkle');
          scene.burst(R.x, R.y - R.h * 0.2, scene.calm ? 8 : 22);
        });
        at(0.5, () => flyRock());
      }
      at(0.6, () => startFinale());
    } else if (right) {
      G.right += 1;
      if (perfect) G.perfects += 1;
      sfx('puff');
      scene.dust(R.x, scene.groundY, scene.calm ? 6 : 16, R.h, dustCol);
      R.mood = 'happy';
      V.glow = { value: spot, a: 0 };
      at(0.12, () => sfx(touch));
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
        V.highlight = { value: G.goal, a: 0 };
        V.arrow = { x: scene.xOf(G.goal), a: 0 };
        const m = mode.miss(T, spot, G.goal, S);
        showBubble(m.html);
        if (S.speak) speak(m.speech);
      });
      at(2.6, () => { hideBubble(); sfx('whoosh'); });
      at(3.55, () => {
        sfx('puff');
        scene.dust(R.x, scene.groundY, scene.calm ? 4 : 10, R.h, dustCol);
        R.mood = 'happy';
        if (V.arrow) V.arrow.leaving = true;
      });
      at(4.3, () => (last ? startFinale() : takeOff()));
    }
    renderDots();
  }

  // ---------- Bip's moment (D-025, D-044) ----------
  // Times in seconds from its start: the pad slides out, the ladder drops (0.5), Bip climbs
  // down (0.95 to 1.75) and walks over (to 2.05), the big flag goes up (2.0 to 2.5) and its
  // stars light one by one, fireworks (from 3.1) while Bip jumps, then the round ends (4.5).
  const FIN = { ladder: 0.5, out: 0.95, down: 1.75, walk: 2.05, flag: 2.0, stars: 2.55, bang: 3.1, end: 4.5 };
  const BURSTS = [
    { x: 0.2, y: 0.24, r: 0.2, cols: ['#FFC93C', '#FFFFFF', '#FF8FB1'], n: 18, turn: 0.1 },
    { x: 0.8, y: 0.28, r: 0.22, cols: ['#B9A7FF', '#FF5D73', '#FFC93C'], n: 18, turn: 0 },
    { x: 0.5, y: 0.16, r: 0.16, cols: ['#5FE3BD', '#8CF5FF', '#FFFFFF'], n: 16, turn: 0.3 },
  ];

  function startFinale() {
    hideBubble();
    $('hud').hidden = true;
    const stars = starsFor(G.right, G.total);
    const dir = R.x < scene.W / 2 ? 1 : -1;
    G.fin = { stars, dir, x: R.x, t: 0 };
    Object.assign(V, { arrow: null, highlight: null, flag: null, pilot: null, perfect: null, bigFlag: null, fireworks: [] });
    V.glow = { value: G.goal, a: 1 };
    V.pad = { x: R.x, k: 0 };
    V.ladder = { x: R.x, dir, k: 0 };
    Object.assign(R, { y: G.touchY, legs: 1, flame: 0, sx: 1, sy: 1, rot: 0, mood: 'happy', pilotIn: true });
    setPhase('finale');
    sfx('sparkle');
    at(FIN.ladder, () => sfx('pop'));
    at(FIN.out, () => {
      R.pilotIn = false;
      V.pilot = { x: R.x, y: G.touchY, s: R.h * 0.5, mood: 'happy', wave: false, squash: 0, flip: dir < 0, blink: 0 };
    });
    at(FIN.flag, () => { V.bigFlag = { x: 0, dir, grow: 0, stars, shown: 0 }; sfx('whoosh'); placeFinale(); });
    for (let i = 0; i < stars; i++) at(FIN.stars + i * 0.22, () => { if (V.bigFlag) V.bigFlag.shown = i + 1; sfx('ding'); });
    (scene.calm ? BURSTS.slice(0, 1) : BURSTS).forEach((b, i) => at(FIN.bang + i * 0.3, () => {
      V.fireworks.push({ ...b, ...(flyShip ? { cols: flyShip.fw[i % flyShip.fw.length] } : {}), k: 0, a: 1, age: 0 });
      if (!i && flyShip && flyShip.finale) flyShip.finale(SH, PP, scene.W);
      sfx(i ? 'pop' : 'sparkle');
    }));
    at(FIN.end, () => endRound());
    placeFinale();
  }

  // Where the finale's pieces stand, from the rocket's spot (also after the screen turns).
  function placeFinale() {
    const F = G.fin;
    if (!F) return;
    R.x = F.x;
    if (V.pad) V.pad.x = F.x;
    if (V.ladder) V.ladder.x = F.x;
    const s = R.h * 0.5, outX = F.x + F.dir * (R.h * 0.42 + s * 0.38);
    F.plantX = outX + F.dir * s * 0.18;
    if (V.bigFlag) V.bigFlag.x = outX + F.dir * s * 0.55;
  }

  function finaleFrame(dt) {
    const F = G.fin;
    if (G.phase === 'finale') F.t = G.t;
    const t2 = F.t, gy = scene.groundY;
    R.y = G.touchY;
    if (V.pad) V.pad.k = clamp(t2 / 0.5, 0, 1);
    if (V.ladder) V.ladder.k = clamp((t2 - FIN.ladder) / 0.4, 0, 1);
    const P = V.pilot;
    if (P) {
      const { top, foot } = ladderEnds(F.x, gy, R.h, F.dir);
      P.s = R.h * 0.5; P.blink = R.blink;
      if (t2 < FIN.down) {
        const k = clamp((t2 - FIN.out) / (FIN.down - FIN.out), 0, 1);
        P.x = lerp(top.x, foot.x, k); P.y = lerp(top.y + P.s * 0.15, gy - 1, k) - Math.abs(Math.sin(k * Math.PI * 4)) * P.s * 0.06;
        P.wave = false; P.squash = 0;
      } else if (t2 < FIN.walk) {
        const k = ease.inOut(clamp((t2 - FIN.down) / (FIN.walk - FIN.down), 0, 1));
        P.x = lerp(foot.x, F.plantX, k); P.y = gy - 1 - Math.abs(Math.sin(k * Math.PI * 2)) * P.s * 0.08;
      } else {
        P.x = F.plantX;
        const jump = !scene.calm && t2 > FIN.bang && t2 < FIN.end - 0.2;
        P.y = gy - 1 - (jump ? Math.abs(Math.sin((t2 - FIN.bang) * 5.5)) * R.h * 0.22 : 0);
        P.wave = t2 > FIN.flag + 0.3;
        P.squash = 0;
      }
    }
    if (V.bigFlag) V.bigFlag.grow = clamp((t2 - FIN.flag) / 0.5, 0, 1);
    for (const b of V.fireworks || []) {
      b.age += dt;
      b.k = ease.out(clamp(b.age / 0.8, 0, 1));
      b.a = 1 - clamp((b.age - 0.9) / 0.9, 0, 1);
    }
    if (V.glow) V.glow.a = 1;
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

  function showBubble(html) {
    const b = $('bubble');
    b.innerHTML = html;
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
    if (G.phase === 'landed' && G.goal != null && scene.arrowCrowded(R.x, scene.xOf(G.goal))) y = Math.min(y, scene.arrowTop(true) - 10);
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
    if (!G.fin) V.rocket = null;
    V.shadow = null;
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

    report({ score, stars, seconds, level: level.level });
    keep(); // D-042: until the shell keeps it
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
  $('hangar').addEventListener('click', openHangar);
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
      // with a beam (D-032) it points at the one spot, so no band of leeway is drawn
      V.shadow = { x: R.x, k, half: mode.beam ? 0 : half, a: clamp(G.t / 0.6, 0, 1), fromY: R.y + R.h * 0.5, beam: !!mode.beam,
        snap: line.value(line.index(scene.valueAt(R.x))) };
      if (!flyShip) scene.exhaust(R.x - Math.sin(R.rot) * R.h * 0.4, R.y, R.h, R.flame, dt);
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
          x = lerp(L.x, scene.xOf(G.goal), ease.inOut(k));
          y = G.touchY - Math.sin(k * Math.PI) * R.h * 0.75;
          R.flame = Math.sin(k * Math.PI) * 0.85;
          R.rot = Math.sin(k * Math.PI) * 0.18 * Math.sign(scene.xOf(G.goal) - L.x);
          if (!flyShip) scene.exhaust(x, y, R.h, R.flame, dt);
        } else if (t2 >= 3.55) {
          x = scene.xOf(G.goal);
          R.flame = 0;
          const a2 = t2 - 3.55, sq2 = 0.16 * Math.exp(-a2 * 7) * Math.cos(a2 * 20);
          R.sy = 1 - sq2; R.sx = 1 + sq2 * 0.6; R.rot = 0;
        }
        if (V.highlight) V.highlight.a = clamp((t2 - 0.55) / 0.3, 0, 1);
        if (V.arrow) {
          V.arrow.a = V.arrow.leaving ? Math.max(0, V.arrow.a - dt * 4) : clamp((t2 - 0.55) / 0.35, 0, 1);
          V.arrow.x = scene.xOf(G.goal);
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
      if (!flyShip) scene.exhaust(R.x, R.y, R.h, R.flame, dt);
      if (V.flag) V.flag.grow = Math.max(0, V.flag.grow - dt * 4);
      if (V.glow) V.glow.a = Math.max(0, V.glow.a - dt * 3);
      if (V.highlight) V.highlight.a = Math.max(0, V.highlight.a - dt * 3);
      if (R.y < -R.h * 1.4) afterTakeOff();
    } else if (G.fin && (G.phase === 'finale' || G.phase === 'end')) {
      finaleFrame(dt);
    }
    syncShip(dt, t);
  }

  let last = performance.now(), frame = 0, clock = 0;

  function loop(now) {
    const real = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const dt = real * timeScale;
    clock += dt;
    update(dt, clock);
    if (!scene.calm) scene.scroll += dt * (G.phase === 'takeoff' ? 60 : 6);
    // the showroom covers the whole stage once its door is up: the scene needn't be drawn
    const covered = hangar && hangar.isOpen && hangar.door.k >= 1;
    if (!covered) { scene.draw(V, clock, dt); fx.draw(real, clock); }
    if (G.phase === 'start' && !$('start').hidden) { drawHero(clock); drawDoorShip(clock, dt); }
    if (hangar) hangar.frame(dt, clock);
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

  // GC5: on its own, the game plays level 1, or the level in the address (?level=3).
  function levelFromAddress() {
    try { return new URLSearchParams(location.search).get('level'); } catch { return null; }
  }

  function useLevel(given) {
    level = mode.levelOf(given);
    if (level.note) console.info(`${mode.name}: ${level.note}.`);
  }

  function boot() {
    hangar = new Hangar(stage, {
      progress: () => progress,
      buy: (id) => { const p = buyShip(progress, id); if (!p) return false; progress = p; keep(); return true; },
      pick: (id) => { const p = pickShip(progress, id); if (!p) return false; progress = p; keep(); return true; },
      sfx: (name) => sfx(name),
      say: (text) => { if (S.speak) speak(text); },
      calm: () => scene.calm,
      closed: hangarClosed,
    });
    useLevel(levelFromAddress());
    progress = { ...DEFAULT_PROGRESS, ...(keptOnDevice(mode.id) || {}) }; // D-042
    sanitiseProgress();
    chosen = planetIndex(progress.planet);
    scene.setPlanet(chosen);
    applySettings();
    resize();
    renderPicker();
    drawRockIcons();
    V.rocket = null;
    frame = requestAnimationFrame(loop);
    ready = true;
  }

  // The level, settings and saved state handed to the game (by a test or the preview's test
  // panel now, by the shell at stage 3). Only on the start screen; anything missing or odd
  // falls back to level 1 and the built-in defaults. No level given: the address's, or 1.
  function begin({ level: givenLevel = undefined, settings = {}, state = null } = {}) {
    if (G.phase !== 'start' || (hangar && hangar.isOpen)) return false;
    useLevel(givenLevel === undefined ? levelFromAddress() : givenLevel);
    const r = resolveSettings(SCHEMA, settings);
    if (r.notes.length) console.info(`${mode.name} settings: ${r.notes.join('; ')}.`);
    S = r.values;
    // the state handed in (by the shell, a test or the test panel), or else what this device kept
    progress = { ...DEFAULT_PROGRESS, ...(state && typeof state === 'object' ? state : keptOnDevice(mode.id) || {}) };
    sanitiseProgress();
    chosen = planetIndex(progress.planet);
    renderPicker();
    scene.setPlanet(chosen);
    applySettings();
    resize();
    drawRockIcons();
    return true;
  }

  boot();

  // ---------- Test hook (used by the games' end-to-end tests in tools/tests/games/) ----------

  const api = {
    state: () => ({
      phase: G.phase, target: G.T && G.T.value !== undefined ? G.T.value : null, rule: G.T && G.T.rule, parity: G.T && G.T.parity || null,
      sum: G.T && G.T.sum || null, beam: !!(V.shadow && V.shadow.beam), snap: V.shadow ? V.shadow.snap : null,
      goal: G.goal, level: level.level, labelLook: level.row.labels, plan: G.plan.slice(), idx: G.idx, total: G.total, right: G.right, perfects: G.perfects, ready,
      rocks: progress.rocks, progress: { ...progress }, allowed: near && near.allowed, perfect: near && near.perfect, tight: near && near.tight,
      pps: scene.pps, x0: scene.x0, x1: scene.x1, rocketX: R.x, rocketY: R.y, touchY: G.touchY, startY: G.startY, startX: G.startX,
      rocketValue: line && scene.ppu ? tidy(scene.valueAt(R.x)) : null,
      labels: scene.shown.map((s) => s.text), line: line && { from: line.from, to: line.to, step: line.step, count: line.count },
      results: G.results.slice(), settings: { ...S }, labelSize: scene.fs, unlockedNew: G.unlockedNew,
      finale: G.fin && { t: G.fin.t, stars: G.fin.stars, pad: !!V.pad && V.pad.k > 0, ladder: !!V.ladder && V.ladder.k > 0,
        flag: !!V.bigFlag && V.bigFlag.grow > 0, shown: V.bigFlag ? V.bigFlag.shown : 0, fireworks: (V.fireworks || []).length, pilotIn: R.pilotIn },
      hangar: hangar ? hangar.state() : null, doorShip: DS.id, heroShip: STARTER, flown: G.phase === 'start' ? null : flownId,
    }),
    // the middle of one of the showroom's buttons, in page pixels, for a real tap
    hangarHit: (id) => (hangar ? hangar.hitPoint(id) : null),
    begin,
    reported,
    saved: savedState,
    xOf: (v) => scene.xOf(v),
    // each written number's fill and strength, by the level's label look (D-035, D-038)
    labelFills: () => (scene.labelBoxes || []).map((b) => ({ text: b.text, ...scene.labelFill(b.i) })),
    // put the rocket over a number (it keeps falling)
    place(v) { R.x = clamp(scene.xOf(v), scene.x0, scene.x1); R.vx = 0; input.active = false; },
    // skip most of the fall
    drop() { if (G.phase === 'fly') { G.t = Math.max(G.t, INTRO); R.y = G.touchY - R.h * 0.25; } },
    right(offset = 0) { this.place(spotFor(G.T) + offset); this.drop(); },
    // the wrong spot nearest the target (for even or odd, nearest a right one)
    wrongSpot() {
      if (!line) return null;
      const aim = spotFor(G.T);
      let best = null;
      for (let i = 0; i < line.count; i++) {
        const v = line.value(i);
        if (!mode.isRight(G.T, v, near.allowed) && (best == null || Math.abs(v - aim) < Math.abs(best - aim))) best = v;
      }
      return best;
    },
    wrong() { const v = this.wrongSpot(); if (v == null) return false; this.place(v); this.drop(); return v; },
    speed(k) { timeScale = k; },
    // RL-3: labels still showing (alpha over 0.05) under the lit-up number after a miss
    overlaps() {
      const h = scene.hlBox;
      if (!h || h.a < 0.95) return null;
      const hit = (b) => b.x < h.x + h.w && h.x < b.x + b.w && b.y < h.y + h.h && h.y < b.y + b.h;
      return (scene.labelBoxes || []).filter((b) => b.alpha > 0.05 && hit(b)).map((b) => ({ text: b.text, alpha: b.alpha }));
    },
    // show another planet's scenery (looks only; nothing is saved)
    planet(i) { scene.setPlanet(i); },
    freeze(on) { if (on) { cancelAnimationFrame(frame); } else { last = performance.now(); frame = requestAnimationFrame(loop); } },
  };
  // The mode's own hooks, such as making this landing's target a given one (while flying).
  const set = (T) => { G.T = T; G.prev = T; lineForTarget(); showTarget(); };
  for (const [name, fn] of Object.entries(mode.testHooks || {})) {
    api[name] = (...args) => (G.phase !== 'fly' || !line ? false : fn(...args, { line, set }));
  }
  window.__test = api;
  return api;
}
