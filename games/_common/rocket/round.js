// The rocket game's round flow (D-027, D-058). Version 2.8.
//
// Changes at v2.8 (step 2c-3c): a landing's line may name the only marks to write (`label_at`: two unit
// fractions on a line of their common parts), handed to the scene and part of the line's key, so a new pair
// lays its line out afresh.
//
// Changes at v2.7 (step 2c-3b, D-100): a kind may give a level's own fall time (fallTime(T, row): Year
// 2's fast facts fall in 6 s, whatever the speed), and the flag after a right landing writes its number
// the way the line does (scene.textOf: a fraction on a fraction line).
//
// Changes at v2.6 (step 2c-3a, D-089 to D-092): tracks, and what Reception's levels and the challenge
// rounds ask of the engine. A game may give mode.tracks ({ [id]: { name, map, edition } }) and
// mode.track (the first): the track played is the address's (?track=), else this device's, else the
// first, and its map is the game's map for the whole visit. Progress is format 4 (tracks.js): changing
// the track (begin({ track }), the test panel) keeps the rocks and ships, puts this track's map by and
// takes up the other's, and reloads the page on it. A landing's own line (landingLine) may bring its
// own label look (`labels`: a challenge round's levels each keep theirs), laid out afresh when it
// changes; a kind's `beam` may be a function of the target; a kind may say its whole spoken ask
// (sayAll), in place of "Land on" and its words. Falls are slower (settings.js 1.1, D-096), and a kind's
// moreTime(T, row) gives a landing 25% more (D-097). Test hooks: the track played and the tracks.
// Changes at v2.5 (step 2d-2, D-080): three hooks a ship may give (ships.js 1.4), read here; ships
// without them play exactly as before. seat(S): where Bip sits aboard, so his hop out to the small
// flag and back starts and ends there, and Bip's moment starts there with a short hop to the rope
// ladder's top. ladder(S): a ship's own ladder (the Christmas Tree), which Bip climbs down and up
// instead of hopping, and which takes the rope ladder's place in Bip's moment; after a miss on the
// round's last landing such a ship plays its landing once it has hopped to the right number, so its
// ladder is up before Bip climbs it. S.side: the side the flag goes, told to the ship at each landing
// and in Bip's moment. Test hooks: Bip's spot (state().pilot), the ship's side and whether it has
// played its landing, and trace(), which records Bip's spot frame by frame.
// Changes at v2.4 (D-072, Rob, 10 Nov): the calm versions are back on: the game follows the device's
// less-motion setting again (D-045), as before v2.2.
// Changes at v2.3 (Rob, 10 Nov): the map's portal goes on to the next system through the full
// hyperspace, landing at that system's level as the arrows would (placeIn), with a welcome.
// Changes at v2.2 (D-071, Rob, 10 Nov): the calm versions are off for now: the game plays its full
// motion even when the device asks for less. The calm code stays, back on by FOLLOW_CALM = true.
// Changes at v2.1 (Rob, 10 Nov): a tap on an open level flies the rocket over to it and keeps it
// there on the device, before its card opens; so leaving a round with home comes back to the
// rocket on the level that was being played.
//
// Changes at v2.0 (step 2c-build, D-058, D-064 to D-068): one game with a map of solar systems.
// The game opens on the map of the system the child is in (starmap.js, D-066), with no start card
// or planet picker: Play by the waiting rocket starts its level, and any open level opens a card
// (what it asks, its best stars, the rocks found there) with its own Play. Each level is played the
// way its kind says (mode.kinds: a number level or a sums level, games/rocket-lander/game.js), on
// its system's planet. Progress is format 3 (progress.js, kit.js): the rocket's place, how far the
// map is open, each level's best stars and moon rocks found; a replay pays only what's above what
// the level holds, so a perfect landing finds a rock only while the level has some left (8 a
// level), and 2 stars open the next level (D-064). After a round the end card says what was new, and
// the map shows it: new stars pop in, a level opens, the rocket hops on; a system's last level passed
// ends in hyperspace to the next system (D-058), with a calm version (D-045). The hangar door is on
// the map's top bar (D-052's look). The flying, landing, Bip's moment and the showroom are as they
// were. Earlier notes follow.
//
// Changes at v1.4 (step 2c-build, D-058): one game; each level is played the way its
// kind says (mode.kinds: number or sums, games/rocket-lander/game.js), and each kind's test hooks
// work on its own levels. Changes at v1.3 (step 2a-4c): in play the ship flown is drawn inside the same edge as
// its effects, so no part of it (a flame, a glow) reaches the numbers under the line (D-045, ER-003);
// the ship is told when the device asks for less motion (S.calm). Test hooks: the sounds played
// (`heard`), the ship flown's state, and shipPixels(), which draws the ship flown and its effects
// alone to count what shows below the line's edge. Changes at v1.2 (step 2a-4b): the hangar (D-050 to D-053). The moon-rocks counter
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
// landings, and the map's progress, are kept with saveState() and on the device. Runs on its own
// (D-004, D-014; GC5): the map's place on this device, or ?level= in the address (counted along the
// map), built-in settings. begin() takes a level, settings and saved state; at stage 3 the game
// contract's start message calls it.
//
// A mode is an object with:
//   id                         the game's folder name, for its progress kept on the device;
//   name                       the game's name, for console notes;
//   schema                     its settings schema (settings.js's shape);
//   map                        its systems: [{ id, name, planet, soon, levels: [{ id, kind, row,
//                              about, sample }] }] (progress.js's map, with what the screens show);
//   kinds                      { number, sums }: how each kind of level is played, each with:
//   lineFor(row, S)            the round's line { from, to, step, label_every };
//   landingLine(T, row, S, rand)  optional: a line for this landing alone (Maths mode's
//                              window), or null to keep the round's;
//   planRound(row, total, rand)   the kind of target for each landing;
//   pickTarget(kind, line, prev, rand, row, S)  one landing's target T: { rule, value?, ... },
//                              where `value` is the one right spot, if there is one;
//   isRight(T, spot, allowed), goalOf(T, raw, line)  right or wrong, and the spot shown
//                              (and hopped to) after a miss;
//   chip(T, S, row)            { cls, html } for the target chip (a 'face' class hides "Land on");
//                              words(T, S) for speech; sayAll(T, S) optional: the whole ask said;
//   miss(T, spot, goal, S)     { speech, html } said and shown after a miss;
//   beam                       true to show a beam to the exact landing spot (D-032), or a
//                              function of the target;
//   testHooks                  optional extra __test functions, each called while flying
//                              as fn(...args, { line, set(T) }).

import { homeButton, report, reported, goHome, saveState, savedState, keepOnDevice, keptOnDevice } from './kit.js';
import { play as playSound, speak, canSpeak, stopSpeaking, isMuted } from './sound.js';
import { resolveSettings, fallSecondsFor } from './settings.js';
import { makeLine, labelGap, nearness, starsFor, tidy } from './numbers.js';
import { PLANETS } from './planets.js';
import { Scene, Fx, drawRock, drawPlanetBall, ladderEnds, clamp, lerp, ease, mix, INK, FONT } from './scene.js';
import { FLEET_BY_ID, STARTER, hangarOf, buy as buyShip, pick as pickShip } from './fleet.js';
import { SHIP_BY_ID, Parts, newState, tickShip, landShip, drawShip, drawTrail } from './ships.js';
import { Hangar } from './hangar.js';
import { StarMap } from './starmap.js';
import { route, placeOf, fresh, tidy as tidyProgress, finish, rockLeft, goTo, levelGiven, bestOf, foundOf, systemStars, placeIn, ROCKS_PER_LEVEL, PASS_STARS } from './progress.js';
import { unpack, pack, switchTrack, trackGiven } from './tracks.js';

export function runRocket(mode) {
  const heard = []; // the last sounds played, by name, for the tests
  const sfx = (name) => { heard.push(name); if (heard.length > 200) heard.shift(); playSound(name); };
  const $ = (id) => document.getElementById(id);
  // The tracks (D-089): the one played is the address's, else this device's, else the game's first;
  // its map is the map for this visit. The other tracks' maps are kept as they were left (others).
  const TRACKS = mode.tracks || { one: { name: '', map: mode.map, edition: '' } };
  const opening = unpack(TRACKS, keptOnDevice(mode.id), fromAddress('track'), mode.track);
  const TRACK = opening.track;
  const MAP = TRACKS[TRACK].map;
  let others = opening.others;
  const ROUTE = route(MAP);
  // A level of the map: { id, i (its place along the route), s, n, last, kind, row, about, sample }.
  const levelById = (id) => { const at = placeOf(MAP, id) || { ...ROUTE[0], i: 0 }; return { ...at, ...MAP[at.s].levels[at.n] }; };
  // Progress, format 3 (D-058), with the ships (D-053): anything handed in or read back made safe.
  const tidyAll = (raw) => ({ ...tidyProgress(MAP, raw), ...hangarOf(raw && typeof raw === 'object' ? raw : {}) });
  const INTRO = 0.7; // seconds the rocket takes to swoop in from above

  const stage = $('stage');
  const scene = new Scene($('scene'));
  const fx = new Fx($('fx'));
  const FOLLOW_CALM = true; // D-072: follows the device's less-motion setting (D-045); false plays full motion always (as D-071 did)
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  scene.calm = FOLLOW_CALM && calm.matches;
  calm.addEventListener?.('change', () => { scene.calm = FOLLOW_CALM && calm.matches; });

  const SCHEMA = mode.schema;
  // The level's kind plays it (D-058): a number level or a sums level, each with its own lines,
  // targets, chip and words (games/rocket-lander/game.js).
  const K = () => (mode.kinds ? mode.kinds[(level && level.row.kind) || 'number'] : mode);
  let S = resolveSettings(SCHEMA).values;
  let progress = tidyAll(null);
  let level = levelById(progress.at);
  let ready = false;
  let line = null, lineKey = '', near = null, loggedNotes = '';

  // The rocket, the pilot, and everything else drawn on the scene.
  const R = { x: 0, y: -200, h: 80, rot: 0, sx: 1, sy: 1, legs: 0, flame: 0, pilotIn: true, blink: 0, mood: '', look: 0, vx: 0 };
  const V = { rocket: null, pilot: null, flag: null, shadow: null, highlight: null, glow: null, arrow: null, perfect: null,
    pad: null, ladder: null, bigFlag: null, fireworks: null };
  const G = {
    phase: 'map', t: 0, idx: 0, total: 8, T: null, goal: null, prev: null, plan: [], results: [], right: 0, perfects: 0, roundRocks: 0,
    startX: 0, startY: 0, touchY: 0, fallV: 0, started: 0, events: [], land: null, fin: null, result: null,
  };
  const input = { active: false, id: null, x: 0, left: false, right: false };
  let timeScale = 1;
  let hangar = null; // the showroom (made at boot)
  let starmap = null; // the map, the galaxy and hyperspace (made at boot)
  let cardId = null; // the level whose card is open
  let flyShip = null; // the ship flown in play, when it isn't today's rocket
  let flownId = null; // the ship last drawn in play (for the tests)
  const SH = newState(80), PP = new Parts(); // its state and effects in play
  // Where Bip sits aboard, in units of the rocket's height from its middle (D-080): the ship's own
  // seat, or the Classic's window, where his hop has always started.
  const WINDOW = { x: 0, y: 0.255, s: 0.3 };
  const seatOf = () => (flyShip && flyShip.seat ? flyShip.seat(SH) : WINDOW);
  const ownLadder = () => (flyShip && flyShip.ladder ? flyShip.ladder(SH) : null);
  let TR = null; // test hook: Bip's spot, frame by frame, while recording
  const DS = { id: null, S: null, P: new Parts() }; // the ship in the hangar door's doorway

  const home = homeButton({ style: { border: '4px solid #1B1446', color: '#1B1446', boxShadow: '0 4px 0 rgba(10,6,40,.55)' } });

  // ---------- Settings and the line ----------

  function applySettings() {
    scene.setLabelLook(level.row.labels || 'plain');
    useLine(K().lineFor(level.row, S));
    G.total = Math.round(clamp(Number(S.landings_per_round) || 8, 3, 20));
  }

  // Lay out a line ({ from, to, step, label_every, label_at? }) and size the landing leeway to it.
  const keyOfLine = (L) => [L.from, L.to, L.step, L.label_every, (L.label_at || []).join('/')].join(',');
  function useLine(L) {
    line = makeLine(L);
    lineKey = keyOfLine(L);
    scene.setLine(line, Math.max(0, Number(L.label_every) || 0), S.show_as, L.label_at || null);
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

  // The fall for this landing (settings.js, D-096): 25% more when the kind says its question takes
  // longer to read (a picture, a dice face, a sum: D-097); or the level's own time (fallTime).
  function fallSeconds() {
    const more = !!(K().moreTime && G.T && K().moreTime(G.T, level.row));
    const own = K().fallTime && G.T ? K().fallTime(G.T, level.row) : null;
    return fallSecondsFor(S.speed, more, own);
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
    if (starmap) starmap.resize();
    R.h = scene.rocketH;
    sizeNearness();
    if (G.phase === 'map' || (G.phase === 'end' && !G.fin)) return;
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

  // ---------- The map: home (D-066) ----------

  function renderRocks() {
    $('map-rocks').textContent = progress.rocks;
    $('rocks-n').textContent = progress.rocks;
  }

  // The map of the system the rocket is in, its sky and ground without the number line.
  function showMap(o = {}) {
    setPhase('map');
    input.active = false;
    hideBubble();
    closeCard(true);
    $('hud').hidden = true; $('end').hidden = true;
    Object.assign(V, { rocket: null, pilot: null, flag: null, shadow: null, highlight: null, glow: null, arrow: null, perfect: null,
      pad: null, ladder: null, bigFlag: null, fireworks: null });
    G.fin = null;
    const at = placeOf(MAP, o.from || progress.at) || placeOf(MAP, progress.at);
    scene.setPlanet(MAP[at.s].planet);
    scene.setBare(true);
    scene.offX = 0;
    home.hidden = false;
    renderRocks();
    drawRockIcons();
    starmap.show(o);
  }

  // A level's card: what it asks, its best stars, the rocks found there, and Play (sketches 1, §2).
  function openCard(id) {
    if (G.phase !== 'map') return;
    const lv = levelById(id), best = bestOf(progress, id), found = foundOf(progress, id);
    cardId = id;
    $('lc-sys').textContent = MAP[lv.s].name;
    $('lc-h').textContent = `Level ${lv.n + 1}`;
    $('lc-about').textContent = lv.about || '';
    const c = mode.kinds[lv.kind].chip(lv.sample, S, lv.row);
    const chip = $('lc-chip');
    chip.className = 'chip' + (c.cls ? ` ${c.cls}` : '');
    chip.innerHTML = c.html;
    $('lc-stars').innerHTML = starsHtml(best);
    $('lc-stars').setAttribute('aria-label', best ? `Your best: ${best} of 3 stars` : 'Not played yet');
    $('lc-stars').classList.toggle('none', !best);
    slots($('lc-rocks'), found, 0);
    const left = ROCKS_PER_LEVEL - found;
    $('lc-note').textContent = !best ? `${ROCKS_PER_LEVEL} moon rocks to find here!`
      : left > 0 ? `${left} moon rock${left === 1 ? '' : 's'} still to find!` : `All ${ROCKS_PER_LEVEL} rocks found here!`;
    $('lc-back').hidden = false;
    $('level-card').hidden = false;
    drawRockIcons();
    if (S.speak) speak(`Level ${lv.n + 1}. ${lv.about || ''}`);
  }

  // The rocket flies over to a tapped open level and waits there, kept on the device (Rob, 10 Nov).
  function pickLevel(id) {
    if (G.phase !== 'map' || id === progress.at) return;
    progress = { ...progress, at: id };
    level = levelById(id);
    keep();
    starmap.hopTo(id);
  }

  function closeCard(quiet) {
    if (!cardId && $('level-card').hidden) return;
    cardId = null;
    $('level-card').hidden = true;
    $('lc-back').hidden = true;
    if (!quiet) sfx('tap');
  }

  function playCard() {
    const id = cardId;
    if (!id || G.phase !== 'map') return;
    sfx('tap');
    closeCard(true);
    starmap.launch(id, () => startRound(id));
  }

  const STAR_PATH = 'M12 2.2l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 16.9 6.2 20l1.2-6.5L2.6 9l6.5-.8z';
  function starsHtml(n) {
    return [0, 1, 2].map((i) => `<svg viewBox="0 0 24 24" class="${i < n ? 'on' : ''}" aria-hidden="true"><path d="${STAR_PATH}" fill="${i < n ? '#FFC93C' : '#D9D3F7'}" stroke="#1B1446" stroke-width="1.6" stroke-linejoin="round"/>${i < n ? '<path d="M8.6 9.6l1.4-.2.8-1.6" fill="none" stroke="#FFF6CF" stroke-width="1.3" stroke-linecap="round"/>' : ''}</svg>`).join('');
  }

  // A level's eight rock slots: found ones show a rock, the newest popping in one by one.
  function slots(el, found, fresh) {
    el.innerHTML = Array.from({ length: ROCKS_PER_LEVEL }, (_, i) => {
      const on = i < found, isNew = on && i >= found - fresh;
      return `<span class="slot${on ? ' on' : ''}${isNew ? ' new' : ''}"${isNew ? ` style="animation-delay:${0.5 + (i - (found - fresh)) * 0.18}s"` : ''}>${on ? '<canvas class="rock-icon" width="56" height="56" aria-hidden="true"></canvas>' : ''}</span>`;
    }).join('');
    el.setAttribute('aria-label', `Moon rocks found here: ${found} of ${ROCKS_PER_LEVEL}`);
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
    Object.assign(S, { x: 70, y: 86 + (scene.calm ? 0 : Math.sin(t * 2.2) * 6), rot: scene.calm ? 0 : Math.sin(t * 1.3) * 0.06, legs: 0, thrust: 0.75, air: true, gy: 190, calm: scene.calm });
    tickShip(ship, S, DS.P, dt, t);
    DS.P.update(dt);
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, c.width, c.height);
    DS.P.draw(x, 'back'); drawShip(x, ship, S, t); DS.P.draw(x, 'front');
  }

  // What's kept: in memory for the shell (GC8) and on this device until the shell keeps it (D-042), in
  // format 4 (tracks.js): this track's map with the rocks and ships, and the other tracks' maps.
  function whole() {
    const mine = { at: progress.at, open: progress.open, levels: JSON.parse(JSON.stringify(progress.levels)), rocks: progress.rocks,
      landings: progress.landings, ship: progress.ship, ships: progress.ships.slice() };
    return pack(TRACKS, TRACK, mine, JSON.parse(JSON.stringify(others)));
  }
  function keep() {
    const kept = whole();
    saveState(kept);
    keepOnDevice(mode.id, kept);
  }

  function openHangar() {
    if (!ready || G.phase !== 'map' || cardId || starmap.view !== 'map' || starmap.busy || !hangar.open()) return;
    sfx('tap');
    $('map').hidden = true;
    home.hidden = true;
  }

  function hangarClosed() {
    $('map').hidden = false;
    home.hidden = false;
    renderRocks();
    drawRockIcons();
  }

  // ---------- Round ----------

  function startRound(id = level.id) {
    if (!ready) return;
    level = levelById(id);
    progress = { ...progress, at: level.id };
    starmap.hide();
    closeCard(true);
    scene.setPlanet(MAP[level.s].planet);
    scene.setBare(false);
    applySettings();
    $('end').hidden = true;
    $('hud').hidden = false;
    $('say').hidden = !(S.speak && canSpeak() && !isMuted());
    G.idx = 0; G.results = []; G.right = 0; G.perfects = 0; G.roundRocks = 0; G.prev = null; G.fin = null; G.result = null;
    G.plan = K().planRound(level.row, G.total, Math.random);
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
    Object.assign(SH, { x: R.x, y: R.y, h: R.h, rot: R.rot, legs: R.legs, pilotIn: R.pilotIn, mood: R.mood || 'happy', look: R.look, gy: scene.groundY, inPlay: true, calm: scene.calm });
    SH.thrust = clamp(R.flame, 0, 1.25);
    SH.air = G.phase === 'fly' || G.phase === 'takeoff' || R.flame > 0.05;
    SH.steer = clamp(R.vx / 300, -1, 1);
    tickShip(flyShip, SH, PP, dt, t);
    SH.sx = R.sx; SH.sy = R.sy; SH.sqT = null; SH.blink = R.blink; // the round's own squash and blink
    PP.update(dt);
  }

  // The ship and its effects stay above the ground, so they never cover the numbers under the
  // line (D-045); a flame or glow reaching lower is cut off at the ground (ER-003).
  function drawFlyShip(ctx, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, scene.W, scene.groundY + 6); ctx.clip();
    drawTrail(ctx, flyShip, SH, t); PP.draw(ctx, 'back');
    drawShip(ctx, flyShip, SH, t);
    flownId = flyShip.id;
    PP.draw(ctx, 'front');
    ctx.restore();
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
  function spotFor(T, x = R.x) { return T.value !== undefined ? T.value : K().goalOf(T, scene.valueAt(x), line); }

  // The mode's own line for this landing, if it has one (Maths mode's stretch of 10 marks; a
  // challenge round's level's line, with its own label look).
  function lineForTarget() {
    const own = K().landingLine ? K().landingLine(G.T, level.row, S, Math.random) : null;
    if (!own) return;
    const look = own.labels || null;
    if (look && look !== scene.labelLook) { scene.setLabelLook(look); lineKey = ''; }
    if (keyOfLine(own) !== lineKey) useLine(own);
  }

  function nextLanding() {
    G.T = K().pickTarget(G.plan[G.idx], line, G.prev, Math.random, level.row, S);
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
    G.shipLanded = false; // the ship flown hasn't played its landing on this one yet
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
    const c = K().chip(T, S, level.row);
    chip.className = 'chip' + (c.cls ? ` ${c.cls}` : '');
    el.classList.toggle('is-face', /\bface\b/.test(c.cls || '')); // a face asks by itself; "Land on" is said
    chip.innerHTML = c.html;
    el.setAttribute('aria-label', askOf(T).replace(/!$/, ''));
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    fitTarget();
    sayTarget();
  }

  function fitTarget() {
    const el = $('target');
    el.style.fontSize = '';
    const room = $('hud').clientWidth - ($('say').hidden ? 0 : $('say').offsetWidth + 14) - (innerWidth > 480 ? $('dots').parentElement.clientWidth + 100 : 24);
    let fs = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > room && fs > 18) { fs -= 2; el.style.fontSize = fs + 'px'; }
  }

  // What's said for a target: the kind's own whole ask, or "Land on" and its words.
  function askOf(T) { return K().sayAll ? K().sayAll(T, S) : `Land on ${K().words(T, S)}!`; }

  function sayTarget() {
    if (!S.speak) return;
    if (speak(askOf(G.T))) {
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
    const right = K().isRight(T, spot, near.allowed);
    const perfect = right && Math.abs(raw - (T.value !== undefined ? T.value : spot)) <= near.perfect + 1e-9;
    G.goal = right ? spot : K().goalOf(T, raw, line);
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
    SH.side = G.land.dir; // the side the flag goes (D-080)
    if (flyShip && right) { SH.dust = dustCol; landShip(flyShip, SH, PP); SH.sqT = null; G.shipLanded = true; }
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
      at(0.95, () => { V.flag = { x: 0, grow: 0, text: scene.textOf(spot), dir: G.land.dir }; });
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
        const m = K().miss(T, spot, G.goal, S);
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
    SH.side = dir;
    // a ship with its own ladder uses it in place of the rope ladder (D-080); after a miss it plays
    // its landing now, having hopped to the right number, so its ladder is up before Bip climbs it
    V.ladder = flyShip && flyShip.ladder ? null : { x: R.x, dir, k: 0 };
    if (flyShip && flyShip.ladder && !G.shipLanded) {
      SH.dust = mix(scene.planet.ground[1], '#FFFFFF', 0.45); landShip(flyShip, SH, PP); SH.sqT = null; G.shipLanded = true;
    }
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
      // down the rope ladder, or the ship's own (D-080); from its seat if it has one, with a short
      // hop to the rope ladder's top, or, without one, from the ladder's top as before
      const own = ownLadder(), seat = flyShip && flyShip.seat ? flyShip.seat(SH) : null;
      const { top, foot } = own ? { top: { x: F.x + own.top.x * R.h, y: R.y + own.top.y * R.h }, foot: { x: F.x + own.foot.x * R.h, y: gy - 1 } }
        : ladderEnds(F.x, gy, R.h, F.dir);
      P.s = R.h * 0.5; P.blink = R.blink;
      const s0 = seat ? seat.s * R.h : P.s, hop = seat && !own ? 0.25 : 0;
      if (t2 < FIN.out + hop) {
        const k = clamp((t2 - FIN.out) / hop, 0, 1), sx = F.x + seat.x * R.h, sy = R.y + seat.y * R.h;
        P.x = lerp(sx, top.x, k); P.y = lerp(sy, top.y + P.s * 0.15, k) - Math.sin(k * Math.PI) * R.h * 0.2; P.s = lerp(s0, P.s, k);
        P.wave = false; P.squash = 0;
      } else if (t2 < FIN.down) {
        const k = clamp((t2 - FIN.out - hop) / (FIN.down - FIN.out - hop), 0, 1);
        P.x = lerp(top.x, foot.x, k); P.y = lerp(own ? top.y : top.y + P.s * 0.15, gy - 1, k) - Math.abs(Math.sin(k * Math.PI * 4)) * P.s * 0.06;
        if (own) P.s = lerp(s0, P.s, k);
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

  // A perfect landing finds one of the level's moon rocks while it has some left (D-058): a replay
  // pays only the rocks not yet found. Counted straight away (paid at the round's end, progress.js);
  // the counter on screen catches up when the rock arrives. With all 8 found, a burst of gold instead.
  function flyRock() {
    if (!rockLeft(progress, level.id, G.roundRocks)) {
      scene.burst(R.x, R.y - R.h * 0.3, scene.calm ? 6 : 16, ['#FFC93C', '#FFFFFF', '#FFE48A']);
      return;
    }
    G.roundRocks += 1;
    const shown = progress.rocks + G.roundRocks;
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
    V.pilot = null; R.pilotIn = true; G.shipLanded = false;
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

    // what the round changes (D-058, D-064): best stars, rocks found, the next level, the rocket's place
    const res = finish(MAP, progress, level.id, { stars, found: G.roundRocks, right: G.right });
    progress = { ...progress, ...res.progress };
    G.result = res;
    renderEnd(res, stars);
    $('end').hidden = false;
    drawRockIcons();
    sfx(stars === 3 ? 'levelup' : 'yay');
    fx.confetti(stars * 45, scene.calm);
    if (res.opened || res.done) setTimeout(() => { sfx('unlock'); fx.confetti(90, scene.calm); }, 900);
    if (S.speak) speak(res.newBest ? 'New best!' : stars === 3 ? 'Super landing!' : stars === 2 ? 'Great flying!' : 'Good try!');

    report({ score, stars, seconds, level: level.i + 1 });
    keep(); // D-042: until the shell keeps it
  }

  // The end card (sketches 1, §3): the round's stars, a new best, the level's rocks with the new ones
  // popping in, what opened, and a system done.
  function renderEnd(res, stars) {
    const sys = MAP[level.s], next = res.opened ? levelById(res.opened) : null;
    $('end-h').textContent = res.newBest ? 'New best!' : stars === 3 ? 'Super landing!' : stars === 2 ? 'Great flying!' : 'Good try, pilot!';
    $('end-stars').innerHTML = starsHtml(stars) + (res.newBest || (res.first && res.passed) ? '<span class="nb">NEW</span>' : '');
    $('end-stars').setAttribute('aria-label', `${stars} of 3 stars${res.newBest ? ', a new best' : ''}`);
    $('end-p').innerHTML = `You landed <b>${G.right}</b> of <b>${G.total}</b>!`;
    slots($('end-rocks'), res.now.rocks, res.rocks);
    $('end-rocks-p').innerHTML = res.rocks ? `<b>+${res.rocks}</b> moon rock${res.rocks === 1 ? '' : 's'}!`
      : res.now.rocks >= ROCKS_PER_LEVEL ? `You've found all ${ROCKS_PER_LEVEL} rocks here` : 'No new rocks this time';
    const done = $('end-done');
    if (res.done) {
      const st = systemStars(MAP, progress, level.s);
      done.hidden = false;
      done.textContent = `${sys.name} done! ★ ${st.got} of ${st.of}`;
    } else done.hidden = true;
    const un = $('unlock'), c = $('unlock-ball'), x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    if (res.hyper) {
      const to = MAP[levelById(res.next).s];
      un.hidden = false; $('unlock-lbl').textContent = 'Next stop'; $('unlock-name').textContent = to.name;
      drawPlanetBall(x, to.planet, 100, 100, PLANETS[to.planet].rings ? 58 : 70, false);
    } else if (res.soon) {
      const to = MAP[level.s + 1];
      un.hidden = false; $('unlock-lbl').textContent = 'Coming soon'; $('unlock-name').textContent = 'More systems!';
      drawPlanetBall(x, to.planet, 100, 100, PLANETS[to.planet].rings ? 58 : 70, true);
    } else if (next) {
      un.hidden = false; $('unlock-lbl').textContent = 'Open now!'; $('unlock-name').textContent = `Level ${next.n + 1}`;
      drawMarkerIcon(x, next.n + 1);
    } else if (!res.passed && ROUTE[level.i + 1] && !(placeOf(MAP, progress.open).i > level.i)) {
      un.hidden = false; $('unlock-lbl').textContent = 'Get 2 stars to open'; $('unlock-name').textContent = `Level ${level.n + 2 > sys.levels.length ? 1 : level.n + 2}`;
      drawMarkerIcon(x, level.n + 2 > sys.levels.length ? 1 : level.n + 2, true);
    } else un.hidden = true;
    const go = $('to-map');
    go.innerHTML = res.hyper ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c3 2.4 4.4 5.6 4.4 9.2V17H7.6v-5.3c0-3.6 1.4-6.8 4.4-9.2zM7.6 13.5L4.5 17v3h3.1M16.4 13.5l3.1 3.5v3h-3.1" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg> Hyperspace!' : 'Map';
    go.classList.toggle('hyper', !!res.hyper);
  }

  // A level's marker as a picture for the end card: a sun-yellow pad with its number (or locked).
  function drawMarkerIcon(x, n, locked = false) {
    x.save();
    x.beginPath(); x.arc(100, 108, 62, 0, Math.PI * 2); x.fillStyle = INK; x.fill();
    x.beginPath(); x.arc(100, 100, 62, 0, Math.PI * 2); x.fillStyle = locked ? '#8F87C9' : '#FFC93C'; x.fill();
    x.lineWidth = 9; x.strokeStyle = INK; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.ellipse(74, 72, 14, 8, -0.7, 0, Math.PI * 2); x.fill();
    x.font = `700 70px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = INK; x.fillText(String(n), 100, 104);
    x.restore();
  }

  function playAgain() {
    stopSpeaking();
    startRound(level.id);
  }

  // Back to the map after a round (sketches 1, §3 and §4): new stars pop in on the level just
  // played, a level that opened bursts open and the rocket hops to it; a system's last level passed
  // goes through hyperspace to the next system (D-058).
  function toMap() {
    stopSpeaking();
    const res = G.result, from = level.id;
    if (!res) { showMap(); return; }
    const stars = res.now.stars > res.was.stars ? { id: from, from: res.was.stars, to: res.now.stars } : null;
    if (res.hyper) {
      setPhase('map');
      $('end').hidden = true; $('hud').hidden = true;
      V.rocket = null; G.fin = null;
      fx.bits = []; fx.rocks = []; // the end card's confetti stays behind
      starmap.hyperspace(levelById(res.next).s, () => {
        const to = MAP[levelById(res.next).s];
        showMap({ drop: true, banner: `Welcome to ${to.name}!` });
        if (S.speak) speak(`Welcome to ${to.name}!`);
      });
      return;
    }
    showMap({ from, hopTo: res.next !== from ? res.next : null, opened: res.opened, stars, banner: res.soon ? 'More systems soon!' : null });
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

  $('hangar').addEventListener('click', openHangar);
  $('again').addEventListener('click', playAgain);
  $('to-map').addEventListener('click', toMap);
  $('lc-play').addEventListener('click', playCard);
  $('lc-close').addEventListener('click', () => closeCard());
  $('lc-back').addEventListener('click', () => closeCard());
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && cardId) { e.preventDefault(); closeCard(); } });
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
      const beam = typeof K().beam === 'function' ? !!K().beam(G.T) : !!K().beam;
      V.shadow = { x: R.x, k, half: beam ? 0 : half, a: clamp(G.t / 0.6, 0, 1), fromY: R.y + R.h * 0.5, beam,
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
        // from the ship's seat (D-080; the window, as before, on ships without one), hopping, or
        // down and back up the ship's own ladder
        const s = R.h * 0.5, seat = seatOf(), s0 = seat.s * R.h;
        const win = { x: R.x + seat.x * R.h, y: R.y + seat.y * R.h };
        const out = { x: R.x + L.dir * (R.h * 0.42 + s * 0.38), y: scene.groundY - 1 };
        const own = ownLadder(), foot = own ? { x: R.x + own.foot.x * R.h, y: scene.groundY - 1 } : null;
        const sOut = 0.45, sBack = 2.45;
        if (t2 < sOut + 0.45) {
          if (own && t2 < sOut + 0.4) {
            const k = clamp((t2 - sOut) / 0.4, 0, 1);
            P.x = lerp(win.x, foot.x, k); P.y = lerp(win.y, foot.y, k) - Math.abs(Math.sin(k * Math.PI * 4)) * s * 0.05; P.s = lerp(s0, s, k);
          } else if (own) {
            const k = clamp((t2 - sOut - 0.4) / 0.05, 0, 1);
            P.x = lerp(foot.x, out.x, k); P.y = out.y; P.s = s;
          } else {
            const k = clamp((t2 - sOut) / 0.45, 0, 1);
            P.x = lerp(win.x, out.x, k); P.y = lerp(win.y, out.y, k) - Math.sin(k * Math.PI) * R.h * 0.75; P.s = lerp(s0, s, k);
          }
          P.squash = 0;
        } else if (t2 < sBack) {
          P.x = out.x; P.y = out.y; P.s = s;
          const a2 = t2 - (sOut + 0.45);
          P.squash = 0.25 * Math.exp(-a2 * 8) * Math.cos(a2 * 22);
          P.wave = t2 > 1.4;
          if (V.flag) { V.flag.x = out.x + L.dir * s * 0.42; V.flag.grow = clamp((t2 - 0.95) / 0.45, 0, 1); }
        } else {
          let k;
          if (own && t2 < sBack + 0.1) {
            k = 0;
            const k1 = clamp((t2 - sBack) / 0.1, 0, 1);
            P.x = lerp(out.x, foot.x, k1); P.y = out.y; P.s = s;
          } else if (own) {
            k = clamp((t2 - sBack - 0.1) / 0.3, 0, 1);
            P.x = lerp(foot.x, win.x, k); P.y = lerp(foot.y, win.y, k) - Math.abs(Math.sin(k * Math.PI * 4)) * s * 0.05; P.s = lerp(s, s0, k);
          } else {
            k = clamp((t2 - sBack) / 0.4, 0, 1);
            P.x = lerp(out.x, win.x, k); P.y = lerp(out.y, win.y, k) - Math.sin(k * Math.PI) * R.h * 0.6; P.s = lerp(s, s0, k);
          }
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
    if (TR) {
      TR.push({ t: G.t, phase: G.phase, fin: G.fin ? G.fin.t : null, pilot: V.pilot ? { x: V.pilot.x, y: V.pilot.y, s: V.pilot.s } : null,
        rx: R.x, ry: R.y, rh: R.h, gy: scene.groundY, rope: !!V.ladder && V.ladder.k > 0, dir: G.fin ? G.fin.dir : G.land ? G.land.dir : null,
        side: SH.side ?? null, landed: !!G.shipLanded });
      if (TR.length > 4000) TR.shift();
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
    // the showroom covers the whole stage once its door is up: the scene needn't be drawn
    const covered = (hangar && hangar.isOpen && hangar.door.k >= 1) || (starmap && (starmap.view === 'galaxy' || starmap.view === 'hyper'));
    if (!covered) scene.draw(V, clock, dt);
    fx.draw(real, clock); // above the galaxy and hyperspace too, so its canvas never holds a stale frame
    if (starmap) starmap.frame(dt, clock);
    if (G.phase === 'map' && !$('map').hidden) drawDoorShip(clock, dt);
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

  // GC5: on its own, the game plays the map's place, or the level in the address (?level=3),
  // counted along the map (progress.js, levelGiven); the rocket goes there and the map opens up to it.
  // The track may be in the address too (?track=year2, D-089).
  function fromAddress(name) {
    try { return new URLSearchParams(location.search).get(name); } catch { return null; }
  }
  function levelFromAddress() { return fromAddress('level'); }

  // Progress handed in or kept, read for this track: format 4 (with a track or maps) through
  // tracks.js, putting the other tracks' maps by; anything else is this track's own (format 3).
  function readProgress(raw) {
    if (!raw || typeof raw !== 'object') others = {}; // nothing kept: the other tracks' maps go too
    if (raw && typeof raw === 'object' && (raw.track !== undefined || raw.maps !== undefined || raw.edition !== undefined)) {
      const u = unpack(TRACKS, raw, TRACK, TRACK);
      others = u.others;
      return tidyAll(u.p);
    }
    return tidyAll(raw);
  }

  // Another track (D-089): this progress kept with that track to play, and the page loaded afresh on
  // it, its map and all, without any track or level in the address that would undo it.
  function changeTrack(to) {
    keepOnDevice(mode.id, switchTrack(TRACKS, whole(), to));
    try {
      const u = new URL(location.href);
      u.searchParams.delete('track'); u.searchParams.delete('level');
      history.replaceState(null, '', u.href);
    } catch { /* the address stays as it is */ }
    location.reload();
  }

  function useLevel(given) {
    const g = levelGiven(MAP, given);
    if (g.note) console.info(`${mode.name}: ${g.note}.`);
    if (g.id) progress = { ...progress, ...goTo(MAP, progress, g.id) };
    level = levelById(progress.at);
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
    starmap = new StarMap(stage, scene, {
      map: MAP,
      progress: () => progress,
      ship: () => progress.ship,
      tap: (id) => { pickLevel(id); openCard(id); },
      play: (id) => startRound(id),
      move: (id) => { progress = { ...progress, at: id }; level = levelById(id); keep(); },
      portal: (s2) => { // through the portal to the next system: the full hyperspace (Rob, 10 Nov)
        const at = placeIn(MAP, progress, s2);
        if (!at) return;
        progress = { ...progress, at }; level = levelById(at); keep();
        starmap.hyperspace(s2, () => { showMap({ drop: true, banner: `Welcome to ${MAP[s2].name}!` }); if (S.speak) speak(`Welcome to ${MAP[s2].name}!`); });
      },
      sfx: (name) => sfx(name),
      say: (text) => { if (S.speak) speak(text); },
      calm: () => scene.calm,
      covered: (on) => { home.hidden = !!on; },
    });
    progress = tidyAll(opening.p); // D-042, D-058, D-089: this track's progress on this device, or afresh
    useLevel(levelFromAddress());
    scene.setPlanet(MAP[level.s].planet);
    applySettings();
    resize();
    drawRockIcons();
    V.rocket = null;
    showMap({ intro: true });
    frame = requestAnimationFrame(loop);
    ready = true;
  }

  // The level, settings and saved state handed to the game (by a test or the preview's test
  // panel now, by the shell at stage 3). Only on the map, with the hangar shut; anything missing
  // or odd falls back to the map's own place and the built-in defaults. A level given (a number
  // along the map, or a level's id) takes the rocket there and opens the map up to it. Another track
  // given (D-089) is changed to, the page reloading on it ('reload'); the rest is then not used.
  function begin({ track = undefined, level: givenLevel = undefined, settings = {}, state = null } = {}) {
    if (G.phase !== 'map' || (hangar && hangar.isOpen)) return false;
    const to = trackGiven(TRACKS, track);
    if (to && to !== TRACK) { changeTrack(to); return 'reload'; }
    const r = resolveSettings(SCHEMA, settings);
    if (r.notes.length) console.info(`${mode.name} settings: ${r.notes.join('; ')}.`);
    S = r.values;
    // the state handed in (by the shell, a test or the test panel), or else what this device kept
    progress = readProgress(state && typeof state === 'object' ? state : keptOnDevice(mode.id));
    useLevel(givenLevel === undefined ? levelFromAddress() : givenLevel);
    scene.setPlanet(MAP[level.s].planet);
    applySettings();
    resize();
    showMap();
    return true;
  }

  boot();

  // ---------- Test hook (used by the games' end-to-end tests in tools/tests/games/) ----------

  const api = {
    state: () => ({
      track: TRACK, tracks: Object.keys(TRACKS), kept: whole(), fall: G.T && G.fallV ? +((G.touchY - G.startY) / G.fallV).toFixed(3) : null, ask: G.T && G.T.ask || null, sub: G.T && G.T.sub !== undefined ? G.T.sub : null,
      phase: G.phase, target: G.T && G.T.value !== undefined ? G.T.value : null, rule: G.T && G.T.rule, parity: G.T && G.T.parity || null,
      sum: G.T && G.T.sum || null, beam: !!(V.shadow && V.shadow.beam), snap: V.shadow ? V.shadow.snap : null,
      goal: G.goal, level: level.i + 1, levelId: level.id, kind: level.kind, labelLook: scene.labelLook || level.row.labels, plan: G.plan.slice(), idx: G.idx, total: G.total, right: G.right, perfects: G.perfects, ready,
      rocks: progress.rocks, progress: { ...progress }, allowed: near && near.allowed, perfect: near && near.perfect, tight: near && near.tight,
      pps: scene.pps, x0: scene.x0, x1: scene.x1, rocketX: R.x, rocketY: R.y, touchY: G.touchY, startY: G.startY, startX: G.startX,
      rocketValue: line && scene.ppu ? tidy(scene.valueAt(R.x)) : null,
      labels: scene.shown.map((s) => s.text), line: line && { from: line.from, to: line.to, step: line.step, count: line.count },
      results: G.results.slice(), settings: { ...S }, labelSize: scene.fs, roundRocks: G.roundRocks,
      result: G.result && { ...G.result, progress: undefined }, card: cardId, map: starmap ? starmap.state() : null, bare: scene.bare,
      screen: hangar && hangar.isOpen ? 'hangar' : G.phase !== 'map' ? (G.phase === 'end' ? 'end' : 'round') : cardId ? 'card' : starmap ? starmap.view : null,
      finale: G.fin && { t: G.fin.t, stars: G.fin.stars, pad: !!V.pad && V.pad.k > 0, ladder: !!V.ladder && V.ladder.k > 0,
        flag: !!V.bigFlag && V.bigFlag.grow > 0, shown: V.bigFlag ? V.bigFlag.shown : 0, fireworks: (V.fireworks || []).length, pilotIn: R.pilotIn },
      hangar: hangar ? hangar.state() : null, doorShip: DS.id, flown: G.phase === 'map' ? null : flownId,
      ship: flyShip ? { id: flyShip.id, calm: !!SH.calm, k: PP.k, effects: PP.list.length, flap: SH.flapT, side: SH.side ?? null, landed: !!G.shipLanded } : null, heard: heard.slice(),
      pilot: V.pilot ? { x: V.pilot.x, y: V.pilot.y, s: V.pilot.s } : null,
    }),
    // The ship flown and its effects alone, drawn as in play onto a clear canvas: how many pixels
    // show below the line's edge, where the numbers are written (D-045), and above it.
    shipPixels() {
      if (!V.drawShip || !V.rocket) return null;
      const k = 2, c = document.createElement('canvas');
      c.width = Math.ceil(scene.W * k); c.height = Math.ceil(scene.H * k);
      const x = c.getContext('2d');
      x.setTransform(k, 0, 0, k, 0, 0);
      V.drawShip(x, clock);
      const d = x.getImageData(0, 0, c.width, c.height).data, edge = Math.ceil((scene.groundY + 6) * k) + 1;
      let below = 0, above = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 2) { if (Math.floor((i >> 2) / c.width) >= edge) below++; else above++; }
      return { below, above, edge: edge / k, ground: scene.groundY };
    },
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
        if (!K().isRight(G.T, v, near.allowed) && (best == null || Math.abs(v - aim) < Math.abs(best - aim))) best = v;
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
    // where a map button is, in page pixels, for a real tap: a level's marker ('moon-3'), the portal or a galaxy planet ('gx:dust')
    mapHit(id) {
      const el = id.startsWith('gx:') ? document.querySelector(`.gx[data-system="${id.slice(3)}"]`) : document.querySelector(`.mk[data-level="${id}"]`);
      if (!el || !el.offsetParent) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    },
    // Bip's spot, frame by frame: trace(true) starts recording afresh; trace(false) stops and returns it
    trace(on) { const out = TR || []; TR = on ? [] : null; return out; },
    freeze(on) { if (on) { cancelAnimationFrame(frame); } else { last = performance.now(); frame = requestAnimationFrame(loop); } },
  };
  // The mode's own hooks, such as making this landing's target a given one (while flying).
  const set = (T) => { G.T = T; G.prev = T; lineForTarget(); showTarget(); };
  // each kind's hooks work while one of its own levels is played
  for (const k of Object.values(mode.kinds || { one: mode })) {
    for (const [name, fn] of Object.entries(k.testHooks || {})) {
      api[name] = (...args) => (G.phase !== 'fly' || !line || K() !== k ? false : fn(...args, { line, set }));
    }
  }
  window.__test = api;
  return api;
}
