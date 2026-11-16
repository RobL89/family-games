// Hamster Highway: the screens, the taps and the hamsters' trip. Version 1.8 (16 Nov, step 9).
//
// Changes at v1.8 (step 9, D-166, D-170): a level is open by progress.js 1.2's opens(), so a child who played before
// the twins came finds them open; the twins of levels 1 to 5 play in pairs, Next going from each level to its twin.
//
// Changes at v1.7 (step 8, D-167, D-168, D-170, D-171): the help cards (cards.js). The first time a child opens a level
// that brings in a gadget or part, its card pops up over the dimmed board, a looping picture with a short caption, and
// the green tick closes it; it is marked seen at once (progress format 2), so it pops up once per child. A help button
// (a "?" at the board's top right, while building) puts a "?" on each gadget in the tray and on the see-saw or lift; a
// tap on one shows its card; a tap anywhere else ends help. Nothing is said aloud. Test hooks: card, caption, help.
//
// Changes at v1.6 (Rob's look at preview 7, D-163): two hamsters sharing a teacup sit side by side in it (SEATX),
// from stepping in to stepping out; one riding alone sits in the middle.
//
// Changes at v1.5 (step 4, D-157, D-161): the teacup lift: its string and cotton reels behind (art.js liftArt), its
// two cups moving with the run's clock (core.js cupRow), a cup going up a little right of the middle and one coming
// down a little left, swinging to the middle at each end; a hamster rides inside its cup (the cup's front is drawn
// over it, in the cupfront layer), happy, and steps in with a clink; the string's stripes run while the cups move.
// Tapping a cup makes it wobble and clink. Levels 9 (the shed) and 10 (the treehouse).
//
// Changes at v1.4 (step 4, D-156, D-158): a board wider than the screen (level 8 is 18 squares) shows through a
// window 12 squares wide that slides: while building, swipe the board or tap the big arrows at its sides, and a
// gadget dragged to the window's edge slides it on; during a run the window follows the hamsters, and it starts at
// the left. The see-saw: a plank turned on a flowerpot (art.js), at rest near end down; when run()'s 'tip' event
// comes it creaks and swings over in TIP ticks, and the hamsters on it ride along ('tilt'); one waiting on its high
// end taps its foot. Two hamsters on one square are drawn a little apart. Party confetti is drawn on the screen,
// not the board.
//
// Changes at v1.3 (step 3, D-144, D-153): GO plays core.js's timed model (run()): each hamster follows its own
// steps at their own ticks (TICK seconds each), so a worn stick can crack under each hamster and snap under the
// fourth (a crack sound and a deeper crack drawn; then a snap, the halves falling, and the stick back again after
// the run); a hamster waiting (for a teacup lift, later) taps its foot. Levels 6 and 7 (the bath, the loft).
//
// Changes at v1.2 (step 2, D-145): tubes on the board join up with their neighbours (art.js tubePiece), with an
// open mouth at each end of a chain; the clock, lamp, moon and star mobile answer a tap.
//
// Changes at v1.1 (step 2, D-147): progress is saved (progress.js, format 1): on its own, in this browser's
// entry "family-games:hamster-highway:progress"; inside P-020's wrapper, handed in with fg:start and out with
// fg:state at each change, none of it kept on the device (contract 0.4.2 section 4, through
// games/_common/rocket/link.js and shared/bridge.js). The wrapper's sound off mutes the game and hides its
// sound button. The house opens at the first level not done. Test hooks: ready, linked, muted.
//
// Title card (a Play button first, GC6) → the house and garden (D-140) → a level: build (gadgets go
// anywhere they fit, D-139: drag from the tray or click then click; click a placed gadget to take it
// back), then GO: five hamsters walk the route core.js works out, one after another, with a party when
// they're all home. Golden seeds (D-138). Cute details answer a tap (D-141).
// Runs on its own as a plain page (GC5), or in P-020's wrapper (contract 0.4.2).

import { COLS, ROWS, GADGETS, TIP, LIFT_MOVE, LIFT_STOP, key, parseLevel, fits, fitCells, left, run, terrain, cupRow } from './core.js';
import { LEVELS } from './levels.js';
import { CELL, INK, SUN, CORAL, LOOP, liftArt, teacupBack, teacupFront, stickArt, seesawArt, potArt, tubePiece, hamster, hamsterHead, gadget, block, water, duck, startArt, homeArt, seedArt, sparkle, backdrop, slot, goButton, houseButton, place, g, rect, circle, path, star, heart, text } from './art.js';
import { HOUSE_W, HOUSE_H, SPOTS, houseScene, tokenAt, titleArt } from './house.js';
import { play, heard, isMuted, setMuted } from './sound.js';
import { FORMAT, fresh, unpack, tried, finished, seen, pack, nextAt, opens } from './progress.js';
import { CARDS, CAPTION, CARD_CSS, cardArt, cardFor } from './cards.js';
import { linkUp } from '../_common/rocket/link.js';

const BW = COLS * CELL;   // 720: the window onto the board, 12 squares
const SLANT = 45;         // degrees a see-saw's plank lies at (a row a square)
const BH = ROWS * CELL;   // 420
const WALKERS = 5;
const TICK = 0.2;         // seconds a tick of the timed model lasts (walk 2 ticks, a hamster every 6)
const SC = 0.56;          // a hamster's size on the board, as in the mock-ups
const $ = (id) => document.getElementById(id);
const board = $('board');
const layer = (id) => $(id);
const IDS = LEVELS.map((d) => d.id);
const ENTRY = 'family-games:hamster-highway:progress';   // on its own only (data map 1.9)

const S = {
  screen: 'title',
  progress: fresh(),   // progress.js, format 1 (D-147)
  ready: false, linked: null, soundLocked: false, playAsked: false,
  at: 0,
  li: 0, level: null, placed: {}, selected: null, hover: null, drag: null, fresh: null,
  mode: 'build', run: null, layout: 'bottom', speed: 1, seedTaken: false, turnDismissed: false,
  vx: 0, pan: null, edge: 0,   // the window's place along a wide board (board units), a swipe, a drag at its edge
  card: null, help: false,     // the help card showing (its kind), and help's "?" marks on (D-170)
};

// ---------------------------------------------------------------- saving (D-147)
function readDevice() {
  try { return JSON.parse(localStorage.getItem(ENTRY)); } catch { return null; }
}
function keep() {
  const st = pack(S.progress);
  if (S.linked) { S.linked.saveState(st); return; }
  try { localStorage.setItem(ENTRY, JSON.stringify(st)); } catch { /* storage blocked or full: play on */ }
}

// ---------------------------------------------------------------- screens
function show(name) {
  S.screen = name;
  for (const id of ['title', 'house', 'level']) $(id).hidden = id !== name;
  if (name === 'house') renderHouse();
  if (name === 'level') fitBoard();
}

function isOpen(i) {
  return opens(IDS, S.progress, i);
}

function renderHouse() {
  const levels = LEVELS.map((d, i) => ({ spot: d.spot, open: isOpen(i), done: !!S.progress.done[d.id], seed: !!S.progress.seeds[d.id] }));
  $('house-svg').innerHTML = houseScene({ levels, current: S.at }) + `<g id="token">${tokenAt(LEVELS[S.at].spot)}</g>`;
  $('seeds').innerHTML = LEVELS.map((d) => `<svg viewBox="-14 -18 28 36"${S.progress.seeds[d.id] ? '' : ' opacity="0.3"'}>${seedArt()}</svg>`).join('');
  $('sound').innerHTML = soundIcon();
  $('sound').hidden = S.soundLocked;
  sizeHouse();
  const [x] = SPOTS[LEVELS[S.at].spot];
  const scroll = $('house-scroll');
  const k = scroll.clientHeight / HOUSE_H;
  scroll.scrollLeft = Math.max(0, x * k - scroll.clientWidth / 2);
}

function sizeHouse() {
  const h = $('house-scroll').clientHeight || window.innerHeight;
  $('house-svg').style.width = `${Math.round((h * HOUSE_W) / HOUSE_H)}px`;
}

function soundIcon() {
  const waves = isMuted() ? '<path d="M 38 22 L 50 38 M 50 22 L 38 38" stroke="#1B1446" stroke-width="4" stroke-linecap="round"/>'
    : '<path d="M 38 22 q 6 8 0 16 M 44 16 q 11 14 0 28" fill="none" stroke="#1B1446" stroke-width="4" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M 10 24 h 8 l 10 -9 v 30 l -10 -9 h -8 z" fill="#FFC93C" stroke="#1B1446" stroke-width="3.5" stroke-linejoin="round"/>${waves}</svg>`;
}

// ---------------------------------------------------------------- a level
function openLevel(i) {
  if (!isOpen(i)) return;
  S.li = i;
  S.at = i;
  S.level = parseLevel(LEVELS[i]);
  S.placed = {};
  S.selected = null;
  S.hover = null;
  S.drag = null;
  S.mode = 'build';
  S.run = null;
  S.seedTaken = false;
  S.fresh = LEVELS[i].new;
  S.vx = 0;
  S.pan = null;
  S.card = null;
  S.help = false;
  layer('card').innerHTML = '';
  $('party').hidden = true;
  show('level');
  renderLevel();
  setView(0);
  const k = cardFor(LEVELS[i]);
  if (k && !S.progress.cards[k]) showCard(k, true);   // once per child (D-170)
}

// ---------------------------------------------------------------- the help cards (D-167, D-168, D-170)
// A card over the dimmed board; first: the pop-up when a level brings the gadget in, marked seen and saved at once.
function showCard(kind, first) {
  S.card = kind;
  S.help = false;
  S.selected = null;
  S.hover = null;
  S.drag = null;
  if (first) { S.progress = seen(CARDS, S.progress, kind); keep(); }
  renderAll();
  layer('card').innerHTML = rect(-20, -20, 900, 580, 'rgba(27,20,70,0.5)', 0, 0, 'none') + cardArt(kind);
  play('pick');
}
function closeCard() {
  S.card = null;
  layer('card').innerHTML = '';
  play('tap');
  renderAll();
}
function setHelp(on) {
  S.help = on;
  renderHud();
  renderHelp();
}
// Help's "?" marks: on each gadget in the tray (screen) and on each see-saw or lift (on the board, moving with it).
function renderHelp() {
  const mark = (kind, x, y) => g(g(circle(x, y, 15, SUN, 3) + text(x, y + 7, '?', 21), '', ' class="twinkle"'), '', ` class="btn" data-help="${kind}"`);
  if (!S.help || S.mode !== 'build' || !S.level) { layer('helpl').innerHTML = ''; layer('helpw').innerHTML = ''; return; }
  layer('helpl').innerHTML = slotBoxes().map(({ kind, x, y, w }) => mark(kind, x + w - 6, y + 4)).join('');
  layer('helpw').innerHTML = S.level.parts.map((p) => (p.kind === 'seesaw' ? mark('seesaw', (p.c + 1.5) * CELL, p.r * CELL - 40)
    : mark('lift', (p.c + 0.5) * CELL + 44, (p.top - 1) * CELL + 10))).join('');
}
function helpButton() {
  const x = BW - 34;
  const y = 32;
  return g(circle(x, y, 23, S.help ? SUN : 'rgba(255,248,238,0.92)', 3) + text(x, y + 10, '?', 30), '', ' class="btn" data-btn="help" role="button" aria-label="Help"');
}

// ---------------------------------------------------------------- the window onto a wide board (D-158)
function maxView() {
  return S.level ? Math.max(0, S.level.cols * CELL - BW) : 0;
}
function setView(x) {
  S.vx = Math.max(0, Math.min(maxView(), x));
  layer('world').setAttribute('transform', `translate(${(-S.vx).toFixed(1)} 0)`);
  renderArrows();
}
function slideView(dx) {
  const from = S.vx;
  const to = Math.max(0, Math.min(maxView(), from + dx));
  const t0 = performance.now();
  const step = (now) => {
    const f = Math.min(1, (now - t0) / 350);
    setView(from + (to - from) * (1 - (1 - f) ** 3));
    if (f < 1 && S.mode === 'build') requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// big arrows at the window's sides while building, where there is more board that way
function renderArrows() {
  let s = '';
  if (S.level && maxView() > 0 && S.mode === 'build') {
    const arrow = (x, dir) => g(rect(x, 150, 44, 120, 'rgba(255,255,255,0.8)', 20, 2.5)
      + path(`M ${x + 22 + 8 * dir} 186 L ${x + 22 - 8 * dir} 210 L ${x + 22 + 8 * dir} 234`, 'none', 6, INK, ' stroke-linecap="round" stroke-linejoin="round"'),
    '', ` class="btn pan" data-btn="${dir > 0 ? 'panL' : 'panR'}"`);
    if (S.vx > 1) s += arrow(4, 1);
    if (S.vx < maxView() - 1) s += arrow(BW - 48, -1);
  }
  layer('arrows').innerHTML = s;
}

function renderLevel() {
  const lv = S.level;
  const def = LEVELS[S.li];
  let bg = backdrop(def.back, lv.cols * CELL);
  let duckDone = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < lv.cols; c++) {
      if (lv.rows[r][c] === '#') bg += block(c, r, r === 0 || lv.rows[r - 1][c] !== '#');
      else if (r === ROWS - 1) {
        bg += water(c, r);
        if (!duckDone) {
          bg += place(g(g(duck(), '', ' class="bob"'), '', ' class="poke duck" data-poke="duck"'), c * CELL + 30, r * CELL + 44, 0.62);
          duckDone = true;
        }
      }
    }
  }
  const [sc, sr] = lv.start;
  const [hc, hr] = lv.home;
  bg += place(startArt(), sc * CELL, sr * CELL, CELL / 100);
  bg += place(g(g(hamsterHead(), '', ' class="bob"'), '', ' class="poke peek" data-poke="peek" id="peek"'), sc * CELL + 50, sr * CELL + 58, 0.34);
  bg += place(homeArt(), hc * CELL, hr * CELL, CELL / 100);
  for (const p of lv.parts.filter((q) => q.kind === 'seesaw')) {
    let ground = p.r + 1;
    while (ground < ROWS && lv.rows[ground][p.c + 1] !== '#') ground += 1;
    bg += potArt((p.c + 1.5) * CELL, (p.r + 1) * CELL, ground * CELL);
  }
  for (const p of lv.parts.filter((q) => q.kind === 'lift')) bg += liftArt((p.c + 0.5) * CELL, (p.top - 1) * CELL - 20, (p.bottom + 0.6) * CELL);
  layer('bg').innerHTML = bg;
  renderParts();
  renderSeed();
  renderAll();
}

// The see-saws' planks (D-156), each turned about its flowerpot's top: at rest near end down (-SLANT), tipped +SLANT.
function renderParts() {
  layer('parts').innerHTML = S.level.parts.filter((p) => p.kind === 'seesaw')
    .map((p, i) => `<g data-saw="${i}" data-at="${p.c},${p.r}" transform="${sawTurn(p, -SLANT)}">${seesawArt()}</g>`).join('');
  // the teacup lift's cups (D-157, D-161): the inside behind the hamsters, the bowl in front of them
  let back = '';
  let front = '';
  S.level.parts.forEach((p, pi) => {
    if (p.kind !== 'lift') return;
    for (let k = 0; k < (p.cups || 1); k++) {
      const { x, y } = cupXY(p, k, 0);
      const tr = `translate(${x.toFixed(1)} ${y.toFixed(1)})`;
      back += `<g data-cup="${pi},${k}" transform="${tr}">${teacupBack()}</g>`;
      front += `<g data-cupf="${pi},${k}" transform="${tr}"><g class="poke cup" data-poke="cup">${rect(-30, -24, 60, 42, 'rgba(0,0,0,0)', 0, 0, 'none')}${teacupFront()}</g></g>`;
    }
  });
  layer('parts').innerHTML += back;
  layer('cupfront').innerHTML = front;
  for (const el of layer('bg').querySelectorAll('.loop')) el.removeAttribute('stroke-dashoffset');
}
// Where cup k of a lift is at tick t: its row from core.js; a little right going up, left coming down, and in the
// middle when stopped, swinging over as it leaves or reaches an end (look B, D-161).
function cupXY(p, k, t) {
  const row = cupRow(p, t, k);
  const dir = cupRow(p, t + 0.05, k) - row;
  const f = Math.min(1, Math.min(row - p.top, p.bottom - row) * 1.5);
  return { x: (p.c + 0.5) * CELL + (dir < 0 ? LOOP : dir > 0 ? -LOOP : 0) * f, y: row * CELL };
}
function moveCups(R) {
  const t = R.t / TICK;
  for (const el of [...layer('parts').querySelectorAll('[data-cup]'), ...layer('cupfront').querySelectorAll('[data-cupf]')]) {
    const [pi, k] = (el.dataset.cup || el.dataset.cupf).split(',').map(Number);
    const { x, y } = cupXY(S.level.parts[pi], k, t);
    el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }
  // the string's stripes run with cup 0 (as far as it has travelled, in board units)
  for (const el of layer('bg').querySelectorAll('.loop')) {
    const p = S.level.parts.find((q) => q.kind === 'lift');
    if (!p) break;
    const run = (p.bottom - p.top) * LIFT_MOVE;
    const all = 2 * (LIFT_STOP + run);
    const u = t % all;
    const moved = Math.floor(t / all) * 2 * run + Math.max(0, Math.min(run, u - LIFT_STOP)) + Math.max(0, Math.min(run, u - 2 * LIFT_STOP - run));
    el.setAttribute('stroke-dashoffset', (-moved * CELL / LIFT_MOVE).toFixed(1));
  }
}
function sawTurn(p, deg) {
  return `translate(${((p.c + 1.5) * CELL).toFixed(1)} ${((p.r + 1) * CELL).toFixed(1)}) rotate(${deg.toFixed(1)})`;
}

function renderSeed() {
  const lv = S.level;
  if (!lv.seed || S.seedTaken) { layer('seedl').innerHTML = ''; return; }
  const [c, r] = lv.seed;
  const found = !!S.progress.seeds[lv.id];
  layer('seedl').innerHTML = place(g(seedArt() + sparkle(13, -12, 6) + sparkle(-12, 10, 4), '', ' class="twinkle"'), c * CELL + 30, r * CELL + 30, 1, 0,
    ` id="seed"${found ? ' opacity="0.55"' : ''}`);
}

function renderAll() {
  renderGadgets();
  renderFits();
  renderGhost();
  renderHud();
  renderTray();
}

function renderGadgets() {
  layer('gads').innerHTML = Object.entries(S.placed).map(([k, kind]) => {
    const [c, r] = k.split(',').map(Number);
    const hit = rect(0, 0, 100, 100, 'rgba(0,0,0,0)', 0, 0, 'none');   // the whole square answers a click, not just the drawing
    const art = kind === 'tube' ? tubePiece(tubeSides(c, r)) : gadget(kind);
    return place(hit + g(art, '', k === S.justPlaced ? ' class="drop"' : ''), c * CELL, r * CELL, CELL / 100, 0, ` data-placed="${k}"`);
  }).join('');
  S.justPlaced = null;
}

// Which sides a placed tube opens to: its tube neighbours, and at each end of a chain an open mouth, on the
// left at the lower (or left) end, where a hamster walks in, and on the right at the other, where it comes out.
function tubeSides(c, r) {
  const isTube = (cc, rr) => S.placed[key(cc, rr)] === 'tube';
  const n = [['u', 0, -1], ['d', 0, 1], ['l', -1, 0], ['r', 1, 0]].filter(([, dc, dr]) => isTube(c + dc, r + dr));
  let s = n.map(([k]) => k).join('');
  if (n.length === 0) return 'lr';
  if (n.length === 1) {
    const [k] = n[0];
    const lowerEnd = k === 'u' || k === 'r';   // the chain goes up or right from here
    const mouth = lowerEnd ? 'l' : 'r';
    s += s.includes(mouth) ? (mouth === 'l' ? 'r' : 'l') : mouth;
  }
  return s;
}

function renderFits() {
  if (S.mode !== 'build' || !S.selected) { layer('fits').innerHTML = ''; return; }
  layer('fits').innerHTML = fitCells(S.level, S.placed, S.selected)
    .map(([c, r]) => rect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6, 'rgba(255,246,199,0.75)', 8, 2, '#F0A51C')).join('');
}

function renderGhost() {
  const h = S.hover;
  const kind = S.drag ? S.drag.kind : S.selected;
  layer('drag').innerHTML = '';
  if (S.mode !== 'build' || !kind || !h) { layer('ghost').innerHTML = ''; return; }
  if (h.cell) {
    const [c, r] = h.cell;
    const ok = fits(S.level, S.placed, kind, c, r);
    const col = ok ? '#2BB673' : CORAL;
    let s = rect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, col, 10, 4, col, ' fill-opacity="0.16"');
    s += place(gadget(kind), c * CELL, r * CELL, CELL / 100, 0, ' opacity="0.6"');
    if (!ok) s += path(`M ${c * CELL + 40} ${r * CELL + 8} l 14 14 m 0 -14 l -14 14`, 'none', 4.5, CORAL);
    layer('ghost').innerHTML = s;
  } else if (S.drag && S.drag.moved) {
    layer('ghost').innerHTML = '';
    layer('drag').innerHTML = place(gadget(kind), h.x - 30, h.y - 40, 0.6, 0, ' opacity="0.85"');
  } else layer('ghost').innerHTML = '';
}

function renderHud() {
  const home = S.run ? S.run.home : 0;
  let s = rect(10, 10, 200, 44, 'rgba(255,255,255,0.88)', 22, 2.5);
  for (let i = 0; i < WALKERS; i++) {
    const lit = i < home;
    s += place(g(hamsterHead(), '', lit ? ' class="tiny-hop"' : ''), 38 + 36 * i, 52, 0.36, 0, lit ? '' : ' opacity="0.3"');
  }
  if (S.level.seed) {
    const got = S.seedTaken || S.progress.seeds[S.level.id];
    s += rect(218, 10, 48, 44, 'rgba(255,255,255,0.88)', 22, 2.5) + place(seedArt(), 242, 32, 0.95, 0, got ? ' id="hud-seed"' : ' id="hud-seed" opacity="0.25"');
  }
  if (S.mode === 'build') s += helpButton();
  layer('hud').innerHTML = s;
}

function trayKinds() {
  return GADGETS.filter((k) => S.level.tray[k]);
}

// Where each gadget's slot sits in the tray, at the side or below.
function slotBoxes() {
  const kinds = trayKinds();
  if (S.layout === 'side') {
    const step = Math.min(84, 246 / kinds.length);
    return kinds.map((kind, i) => ({ kind, x: BW + 17, y: 80 + i * step, w: 96, h: step - 8 }));
  }
  return kinds.map((kind, i) => ({ kind, x: 100 + 94 * i, y: BH + 11, w: 84, h: 78 }));
}

function renderTray() {
  const counts = left(S.level, S.placed);
  const run = S.mode !== 'build';
  let s = '';
  const slots = slotBoxes().map(({ kind: k, x, y, w, h }) => slot(x, y, w, h, k, counts[k], S.selected === k && !run, S.fresh === k)).join('');
  if (S.layout === 'side') {
    s += rect(BW, 0, 130, BH, '#8B5A3C', 0, 0) + line0(BW, 0, BW, BH);
    s += houseButton(BW + 65, 40, 28);
    s += slots;
    s += goButton(BW + 9, 336, 112, 72, run ? 'stop' : 'go');
  } else {
    s += rect(0, BH, BW, 110, '#8B5A3C', 0, 0) + line0(0, BH, BW, BH);
    s += houseButton(46, BH + 55, 30);
    s += slots;
    s += goButton(578, BH + 17, 128, 76, run ? 'stop' : 'go');
  }
  layer('tray').innerHTML = s;
  const go = board.querySelector('.btn.go');
  if (go && !run && Object.keys(S.placed).length) go.classList.add('ready');   // a gentle wiggle once something is down
  if (S.mode === 'party') layer('tray').setAttribute('opacity', '0.5'); else layer('tray').removeAttribute('opacity');
  renderHelp();
}
const line0 = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="3"/>`;

function fitBoard() {
  const st = $('stage');
  const W = st.clientWidth;
  const H = st.clientHeight;
  const bottom = Math.min(W / 720, H / 530);
  const side = Math.min(W / 850, H / 420);
  const lay = side > bottom ? 'side' : 'bottom';
  const [vw, vh] = lay === 'side' ? [850, 420] : [720, 530];
  const k = Math.min(W / vw, H / vh);
  board.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  board.style.width = `${Math.floor(vw * k)}px`;
  board.style.height = `${Math.floor(vh * k)}px`;
  if (lay !== S.layout) { S.layout = lay; if (S.level) renderTray(); }
  const upright = H > W * 1.15 && window.matchMedia('(pointer: coarse)').matches;
  $('turn').hidden = !upright || S.turnDismissed;   // Q-048's stop-gap: upright still plays, smaller
}

// ---------------------------------------------------------------- placing (D-139)
function toBoard(e) {
  const m = board.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
function cellAt(p) {
  if (p.x < 0 || p.y < 0 || p.x >= BW || p.y >= BH) return null;
  const c = Math.floor((p.x + S.vx) / CELL);
  return c < S.level.cols ? [c, Math.floor(p.y / CELL)] : null;
}

function tryPlace(kind, c, r) {
  if (left(S.level, S.placed)[kind] > 0 && fits(S.level, S.placed, kind, c, r)) {
    S.placed[key(c, r)] = kind;
    S.justPlaced = key(c, r);
    if (S.fresh === kind) S.fresh = null;
    play('place');
    puff(c * CELL + 30, r * CELL + CELL - 4);
    if (left(S.level, S.placed)[kind] <= 0) S.selected = null;
    return true;
  }
  play('nope');
  return false;
}

function onDown(e) {
  const t = e.target;
  if (S.card) {   // a card is up: only its tick closes it
    if (t.closest('[data-btn="cardok"]')) closeCard();
    else { const tk = layer('card').querySelector('.hc-tick'); if (tk) bump(tk.parentNode, 'shake', 400); }
    return;
  }
  if (S.help) {   // help: a tap on a gadget or part shows its card; anything else ends help
    if (t.closest('[data-btn="help"]')) { play('tap'); setHelp(false); return; }
    const h = t.closest('[data-help]') || t.closest('[data-slot]');
    let kind = h ? h.dataset.help || h.dataset.slot : null;
    if (!kind && t.closest('[data-saw]')) kind = 'seesaw';
    if (!kind && t.closest('[data-cup], [data-cupf]')) kind = 'lift';
    setHelp(false);
    if (kind && CARDS.includes(kind)) showCard(kind, false); else play('back');
    return;
  }
  const btn = t.closest('[data-btn]');
  if (btn) { button(btn.dataset.btn); return; }
  const w = t.closest('[data-walker]');
  if (w) { cheer(w); return; }
  const pk = t.closest('[data-poke]');
  if (S.mode !== 'build') { if (pk) poke(pk); return; }
  const sl = t.closest('[data-slot]');
  const p = toBoard(e);
  if (sl) {
    const kind = sl.dataset.slot;
    if (left(S.level, S.placed)[kind] <= 0) { play('nope'); bump(sl, 'shake'); return; }
    const again = S.selected === kind;
    S.selected = kind;
    S.drag = { kind, from: null, x0: e.clientX, y0: e.clientY, moved: false, again };
    board.setPointerCapture(e.pointerId);
    play('pick');
    S.hover = { x: p.x, y: p.y, cell: null };
    renderFits(); renderTray(); renderGhost();
    return;
  }
  const pl = t.closest('[data-placed]');
  if (pl) {
    const k = pl.dataset.placed;
    const kind = S.placed[k];
    delete S.placed[k];
    S.selected = kind;
    S.drag = { kind, from: k, x0: e.clientX, y0: e.clientY, moved: false };
    board.setPointerCapture(e.pointerId);
    play('back');
    S.hover = { x: p.x, y: p.y, cell: cellAt(p) };
    renderAll();
    return;
  }
  const cell = cellAt(p);
  if (cell && S.selected) {
    S.hover = { x: p.x, y: p.y, cell };
    if (tryPlace(S.selected, cell[0], cell[1])) S.hover = null;
    renderAll();
    if (S.hover) bump(layer('ghost'), 'shake');
    return;
  }
  if (!S.selected && maxView() > 0 && p.y < BH && p.x < BW) {
    S.pan = { x0: e.clientX, vx0: S.vx, moved: false, pk };
    board.setPointerCapture(e.pointerId);
    return;
  }
  if (pk) { poke(pk); return; }
  if (S.selected) { S.selected = null; renderAll(); }
}

function onMove(e) {
  if (S.screen !== 'level' || S.mode !== 'build') return;
  const p = toBoard(e);
  if (S.pan) {
    const m = board.getScreenCTM();
    if (Math.abs(e.clientX - S.pan.x0) > 8) S.pan.moved = true;
    if (S.pan.moved && m) setView(S.pan.vx0 - (e.clientX - S.pan.x0) / m.a);
    return;
  }
  if (S.drag) {
    if (!S.drag.moved && Math.hypot(e.clientX - S.drag.x0, e.clientY - S.drag.y0) > 8) S.drag.moved = true;
    S.hover = { x: p.x, y: p.y, cell: S.drag.moved ? cellAt(p) : null };
    if (S.drag.moved) renderGhost();
    // a gadget held at the window's edge slides the board on
    const edge = S.drag.moved && p.y < BH && maxView() > 0 ? (p.x < 40 ? -1 : p.x > BW - 40 && p.x < BW ? 1 : 0) : 0;
    if (edge && !S.edge) { S.edge = edge; requestAnimationFrame(edgeSlide); } else S.edge = edge;
    return;
  }
  if (S.selected && e.pointerType === 'mouse') {
    const cell = cellAt(p);
    const was = S.hover && S.hover.cell;
    if (!cell && !was) return;
    if (cell && was && cell[0] === was[0] && cell[1] === was[1]) return;
    S.hover = { x: p.x, y: p.y, cell };
    renderGhost();
  }
}

function edgeSlide() {
  if (!S.edge || !S.drag) { S.edge = 0; return; }
  setView(S.vx + 9 * S.edge);
  if (S.hover && S.hover.cell) { S.hover.cell = cellAt(S.hover); renderGhost(); }
  requestAnimationFrame(edgeSlide);
}

function onUp(e) {
  if (S.pan) {
    const pan = S.pan;
    S.pan = null;
    if (board.hasPointerCapture(e.pointerId)) board.releasePointerCapture(e.pointerId);
    if (!pan.moved && pan.pk) poke(pan.pk);
    return;
  }
  S.edge = 0;
  const d = S.drag;
  if (!d) return;
  S.drag = null;
  if (board.hasPointerCapture(e.pointerId)) board.releasePointerCapture(e.pointerId);
  if (d.moved) {
    const cell = cellAt(toBoard(e));
    if (cell && tryPlace(d.kind, cell[0], cell[1])) S.selected = null;
    else if (d.from) { play('back'); S.selected = null; }
    else S.selected = null;
  } else if (d.from) {
    S.selected = null;            // a click on a placed gadget sends it back to the tray
  } else if (d.again) {
    S.selected = null;            // a second click on the same gadget puts it down again
  }
  S.hover = null;
  renderAll();
}

function button(name) {
  if (S.mode === 'party') { partyAct(name === 'house' ? 'house' : 'again'); return; }
  if (name === 'house') { stopRun(); S.selected = null; play('tap'); show('house'); return; }
  if (name === 'go') { startRun(); return; }
  if (name === 'help') { if (S.mode === 'build') { play('pick'); S.selected = null; renderAll(); setHelp(true); } return; }
  if (name === 'stop') { play('back'); stopRun(); renderAll(); }
  if (name === 'panL' || name === 'panR') { play('whoosh'); slideView((name === 'panL' ? -1 : 1) * 6 * CELL); }
}

// ---------------------------------------------------------------- the hamsters' trip
function feet(c, r) {
  let y = (r + 1) * CELL;
  if (terrain(S.level, S.placed, c, r + 1) === 'ramp') y = (r + 1.5) * CELL;
  if (terrain(S.level, S.placed, c, r) === 'bouncer') y = (r + 0.55) * CELL;
  return { x: (c + 0.5) * CELL, y };
}

// Two hamsters sharing a teacup (D-163) sit side by side: for each step of each hamster, how far left or right of
// the middle it is drawn (0 unless it is in a cup with another).
const SEATX = [-11, 11];
function seatOffsets(hs) {
  const count = new Map();
  const keys = hs.map((h) => {
    let k = null;
    return h.steps.map((s, i) => {
      if (s.seat === undefined) { k = null; return null; }
      if (k === null) {
        const r = h.steps.slice(i).find((x) => x.act === 'ride');
        k = r ? `${r.c}:${r.cup}:${r.t0}` : `alone${i}`;
        count.set(k, (count.get(k) || 0) + 1);
      }
      return k;
    });
  });
  return hs.map((h, n) => h.steps.map((s, i) => (keys[n][i] && count.get(keys[n][i]) > 1 ? SEATX[s.seat] : 0)));
}

// One hamster's steps (with their ticks, from run()) as the pieces it is drawn along, in seconds; offs: seatOffsets'.
function segmentsOf(st, offs = []) {
  const segs = [];
  let at = 0;
  const add = (seg) => { seg.t0 = at * TICK; seg.t1 = seg.end * TICK; seg.dur = seg.t1 - seg.t0; segs.push(seg); };
  for (let i = 1; i < st.length; i++) {
    const a = st[i - 1];
    const b = st[i];
    const p0 = segs.length ? segs[segs.length - 1].p1 : feet(a.c, a.r);
    at = b.t0;
    if (b.act === 'walk' || b.act === 'climb') {
      const p1 = feet(b.c, b.r);
      const slant = terrain(S.level, S.placed, a.c, a.r) === 'seesaw' && terrain(S.level, S.placed, b.c, b.r) === 'seesaw';
      const mid = slant ? { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 } : { x: (a.c + 1) * CELL, y: (a.r + 1) * CELL };
      const f1 = feet(b.c, b.r);
      add({ kind: b.act, p0, mid, p1: { x: f1.x + (offs[i] || 0), y: f1.y }, end: b.t1, seed: !!b.seed,
        sound: b.act === 'climb' ? 'climb' : terrain(S.level, S.placed, b.c, b.r) === 'shaft' && terrain(S.level, S.placed, a.c, a.r) !== 'shaft' ? 'clink' : null });
    } else if (b.act === 'bounce') {
      const p1 = feet(b.c, b.r);
      add({ kind: 'bounce', p0, p1, ctrl: { x: (p0.x + p1.x) / 2 - 10, y: Math.min(p0.y, p1.y) - 1.5 * CELL }, end: b.t1, seed: !!b.seed, sound: 'boing', mallow: key(a.c, a.r) });
    } else if (b.act === 'wait') {
      add({ kind: 'wait', p0, p1: p0, end: b.t1 });
    } else if (b.act === 'fall' || b.act === 'float') {
      let j = i;
      let seed = !!b.seed;
      while (j + 1 < st.length && st[j + 1].act === b.act) { j += 1; if (st[j].seed) seed = true; }
      const last = st[j];
      const rows = j - i + 1;
      const p1 = last.r >= ROWS ? { x: p0.x, y: BH - 16 } : feet(last.c, last.r);
      add({ kind: b.act, p0, p1, end: last.t1, seed, rows,
        sound: b.act === 'float' ? 'wheee' : rows >= 3 ? 'slide' : null });
      i = j;
    } else {
      const f1 = feet(b.c, b.r);
      add({ kind: b.act, p0, p1: { x: f1.x + (offs[i] || 0), y: f1.y }, end: b.t1, seed: !!b.seed, sound: b.act === 'tilt' || (b.act === 'ride' && a.act !== 'ride') ? 'wheee' : null,   // tube, ride, tilt
        lift: b.act === 'ride' ? S.level.parts.find((p) => p.kind === 'lift' && p.c === b.c) : null, cup: b.cup, dx: offs[i] || 0 });
    }
  }
  return segs;
}

function startRun() {
  if (S.mode !== 'build') return;
  const id = S.level.id;
  const before = S.progress.tries[id];
  S.progress = tried(IDS, S.progress, id);
  if (S.progress.tries[id] !== before) keep();
  const res = run(S.level, S.placed);
  const offs = seatOffsets(res.hamsters);
  const hs = res.hamsters.map((h, n) => {
    const segs = segmentsOf(h.steps, offs[n]);
    const [c, r] = S.level.start;
    return { outcome: h.outcome, segs, start: h.steps[0].t0 * TICK, total: segs.length ? segs[segs.length - 1].t1 : h.steps[0].t0 * TICK,
      last: segs.length ? segs[segs.length - 1].p1 : feet(c, r) };
  });
  const bad = res.hamsters.find((h) => h.outcome !== 'home');
  S.mode = 'run';
  S.selected = null;
  S.hover = null;
  S.drag = null;
  S.help = false;
  S.seedTaken = false;
  renderSeed();
  S.run = { res: { outcome: bad ? bad.outcome : 'home' }, hs, events: res.events, ev: 0, t: 0, home: 0, walkers: [], finishing: false, last: performance.now(), tips: {}, drawn: [] };
  layer('walkers').innerHTML = Array.from({ length: WALKERS }, (_, i) => `<g data-walker="${i}" visibility="hidden"><g class="pose"></g></g>`).join('');
  S.run.walkers = [...layer('walkers').children].map((el, i) => ({ i, el, pose: '', seg: -1, done: false, endFx: {} }));
  const peek = $('peek');
  if (peek) peek.setAttribute('visibility', 'hidden');
  play('go');
  renderAll();
  renderArrows();
  requestAnimationFrame(tick);
}

function stopRun() {
  if (!S.run) return;
  S.run = null;
  S.mode = 'build';
  layer('walkers').innerHTML = '';
  layer('fx').innerHTML = '';
  S.seedTaken = false;
  renderSeed();
  renderGadgets();
  renderParts();
  renderArrows();
  const peek = $('peek');
  if (peek) peek.removeAttribute('visibility');
}

// A worn stick's crack or snap (run()'s events), when its tick comes: a deeper crack drawn, or the stick gone with
// its halves falling. The sticks come back whole when the run ends (renderGadgets).
function stickEvent(e) {
  if (e.kind === 'tip') { play('creak'); S.run.tips[`${e.c},${e.r}`] = e.t * TICK; return; }
  const el = board.querySelector(`[data-placed="${e.c},${e.r}"]`);
  if (!el) return;
  if (e.kind === 'crack') {
    play(e.n >= 3 ? 'creak' : 'crack');
    el.lastElementChild.innerHTML = stickArt(e.n);
    bump(el.lastElementChild, 'wobble', 500);
    return;
  }
  play('snap');
  el.setAttribute('visibility', 'hidden');
  const x = e.c * CELL;
  const y = e.r * CELL;
  const half = (cls, x0) => place(g(rect(x0, 4, 52, 16, '#EED9B0', 6, 2.6) + path(`M ${x0 ? x0 + 2 : 50} 4 l -4 4 l 4 4 l -4 4 l 4 4`, 'none', 2, '#8B5A3C'), '', ` class="${cls}"`), x, y, CELL / 100);
  fx(half('snapL', -4) + half('snapR', 52), 1200);
  puff(x + 30, y + 10, 0.7);
}

function tick(now) {
  const R = S.run;
  if (!R || S.mode !== 'run') return;
  const dt = Math.min(0.05, (now - R.last) / 1000);
  R.last = now;
  R.t += dt * S.speed;
  while (R.ev < R.events.length && R.events[R.ev].t * TICK <= R.t) stickEvent(R.events[R.ev++]);
  R.drawn = [];
  for (const w of R.walkers) if (!w.done) moveWalker(R, w);
  turnSaws(R);
  moveCups(R);
  follow(R, dt);
  if (R.walkers.every((w) => w.done) && !R.finishing) {
    R.finishing = true;
    setTimeout(finishRun, 350 / S.speed);
    return;
  }
  requestAnimationFrame(tick);
}

// A tipping see-saw swings over in TIP ticks, with a bump at the end.
function turnSaws(R) {
  for (const el of layer('parts').children) {
    const t0 = R.tips[el.dataset.at];
    if (t0 === undefined) continue;
    const f = Math.max(0, Math.min(1, (R.t - t0) / (TIP * TICK)));
    const [c, r] = el.dataset.at.split(',').map(Number);
    el.setAttribute('transform', sawTurn({ c, r }, -SLANT + 2 * SLANT * f * f));
    if (f >= 1 && !el.dataset.bumped) { el.dataset.bumped = '1'; play('boing'); puff((c + 2.5) * CELL, (r + 2) * CELL, 0.8); }
  }
}

// During a run the window follows the hamsters still on their way (their middle), gently.
function follow(R, dt) {
  if (maxView() <= 0) return;
  const xs = R.walkers.filter((w) => !w.done && w.x !== undefined).map((w) => w.x);
  if (!xs.length) return;
  const want = xs.reduce((a, b) => a + b, 0) / xs.length - BW / 2;
  setView(S.vx + (want - S.vx) * Math.min(1, dt * 2.5));
}

function setPose(w, pose) {
  if (w.pose === pose) return;
  w.pose = pose;
  w.el.firstElementChild.innerHTML = hamster(pose);
}
function setAt(w, x, y, rot = 0, sc = SC, op = 1) {
  // two hamsters on one square are drawn a little apart, so a child sees both
  const R = S.run;
  if (R && R.drawn) {
    while (R.drawn.some(([dx, dy]) => Math.abs(dx - x) < 10 && Math.abs(dy - y) < 10)) x -= 18;
    R.drawn.push([x, y]);
  }
  w.x = x;
  w.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`);
  w.el.setAttribute('opacity', op.toFixed(2));
  w.el.removeAttribute('visibility');
}

function moveWalker(R, w) {
  const H = R.hs[w.i];
  const local = R.t;
  if (local < H.start) return;
  if (local < H.total) {
    let k = H.segs.findIndex((s) => local < s.t1);
    if (k < 0) k = H.segs.length - 1;
    const s = H.segs[k];
    if (k !== w.seg) {
      if (w.seg >= 0) onSegEnd(R, w, H.segs[w.seg]);
      w.seg = k;
      if (s.sound) play(s.sound);
      if (s.mallow) squishMallow(s.mallow);
    }
    const f = Math.max(0, Math.min(1, (local - s.t0) / s.dur));
    let x;
    let y;
    let rot = 0;
    let pose = Math.floor(local * 7) % 2 ? 'walk1' : 'walk2';
    if (s.kind === 'walk' || s.kind === 'climb') {
      const l1 = Math.hypot(s.mid.x - s.p0.x, s.mid.y - s.p0.y);
      const l2 = Math.hypot(s.p1.x - s.mid.x, s.p1.y - s.mid.y);
      const d = f * (l1 + l2);
      const [a, b, u] = d <= l1 ? [s.p0, s.mid, l1 ? d / l1 : 1] : [s.mid, s.p1, l2 ? (d - l1) / l2 : 1];
      x = a.x + (b.x - a.x) * u;
      y = a.y + (b.y - a.y) * u - 2.5 * Math.abs(Math.sin(local * 14));
      rot = Math.max(-24, Math.min(24, (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI * 0.5));
    } else if (s.kind === 'bounce') {
      const v = 1 - f;
      x = v * v * s.p0.x + 2 * v * f * s.ctrl.x + f * f * s.p1.x;
      y = v * v * s.p0.y + 2 * v * f * s.ctrl.y + f * f * s.p1.y;
      pose = 'boing';
    } else if (s.kind === 'fall') {
      x = s.p0.x;
      y = s.p0.y + (s.p1.y - s.p0.y) * f * f;
      pose = 'fall';
    } else if (s.kind === 'wait') {
      x = s.p0.x;
      y = s.p0.y - 2 * Math.abs(Math.sin(local * 6));
      pose = Math.floor(local * 3) % 2 ? 'walk1' : 'home';
    } else if (s.kind === 'float') {
      x = s.p0.x + 4 * Math.sin(f * Math.PI * 3);
      y = s.p0.y + (s.p1.y - s.p0.y) * f;
      pose = 'float';
    } else if (s.kind === 'ride' && s.lift) {
      ({ x, y } = cupXY(s.lift, s.cup || 0, local / TICK));   // inside its cup, wherever the cup is
      x += s.dx;
      pose = 'home';
    } else {
      x = s.p0.x + (s.p1.x - s.p0.x) * f;
      y = s.p0.y + (s.p1.y - s.p0.y) * f;
      if (s.kind === 'tilt') pose = 'fall';
    }
    setPose(w, pose);
    setAt(w, x, y, rot);
    return;
  }
  if (w.seg >= 0 && !w.endedSeg) { onSegEnd(R, w, H.segs[w.seg]); w.endedSeg = true; }
  endWalker(R, w, local - H.total);
}

function onSegEnd(R, w, s) {
  if (s.seed && !S.seedTaken) takeSeed();
  if ((s.kind === 'fall' || s.kind === 'float') && s.rows < 3 && !(s === R.hs[w.i].segs[R.hs[w.i].segs.length - 1] && R.hs[w.i].outcome === 'splash')) play('patter');
}

function endWalker(R, w, e) {
  const p = R.hs[w.i].last;
  const out = R.hs[w.i].outcome;
  const once = (name, fn) => { if (!w.endFx[name]) { w.endFx[name] = true; fn(); } };
  if (out === 'home') {
    once('home', () => { play('home'); R.home += 1; renderHud(); fxRise(heart(0, 0, 12, '#FF8FB1'), p.x + 10, p.y - 50); });
    const f = Math.min(1, e / 0.6);
    setPose(w, 'home');
    setAt(w, p.x + 18 * f, p.y - 20 * Math.sin(Math.PI * f), 0, SC * (1 - 0.85 * f), 1 - f);
    if (e >= 0.6) finishWalker(w);
  } else if (out === 'splash') {
    once('splash', () => { play('splash'); splash(p.x, BH - 22); });
    w.el.setAttribute('visibility', 'hidden');
    if (e >= 1) finishWalker(w);
  } else if (out === 'bonk' || out === 'bonk-head') {
    once('flump', () => { play('flump'); });
    if (e > 0.25) once('dizzy', () => play('dizzy'));
    setPose(w, 'bonk');
    const fade = e < 1.6 ? 1 : Math.max(0, 1 - (e - 1.6) / 0.6);
    if (e >= 1.6) once('poof', () => { play('poof'); puff(p.x, p.y - 8, 3); });
    setAt(w, p.x, p.y, 0, SC, fade);
    if (e >= 2.2) finishWalker(w);
  } else {
    // stuck: a bump, a puzzled look, a nap, then gone (≈3 s, brief 0.3)
    if (e < 0.3) { setPose(w, 'walk1'); setAt(w, p.x + 6 * Math.sin((e / 0.3) * Math.PI), p.y); }
    else if (e < 1.0) { once('huh', () => { play('huh'); fxRise(text(0, 0, '?', 26, INK, ' stroke="#fff" stroke-width="5" paint-order="stroke"'), p.x + 4, p.y - 58); }); setPose(w, 'walk1'); setAt(w, p.x, p.y); }
    else { once('snore', () => play('snore')); setPose(w, 'stuck'); setAt(w, p.x, p.y, 0, SC, e < 2.6 ? 1 : Math.max(0, 1 - (e - 2.6) / 0.6)); }
    if (e >= 3.2) finishWalker(w);
  }
}

function finishWalker(w) {
  w.done = true;
  w.el.setAttribute('visibility', 'hidden');
}

function finishRun() {
  const R = S.run;
  if (!R) return;
  const id = S.level.id;
  if (R.res.outcome === 'home' && R.home === WALKERS) {
    S.progress = finished(IDS, S.progress, id, S.seedTaken);
    keep();
    S.mode = 'party';
    party();
  } else {
    S.mode = 'build';
    S.run = null;
    layer('walkers').innerHTML = '';
    layer('fx').innerHTML = '';
    S.seedTaken = false;
    renderSeed();
    const peek = $('peek');
    if (peek) { peek.removeAttribute('visibility'); bump(peek, 'hop'); }
    play('squeak');
    renderParts();
    renderAll();
    renderArrows();
  }
}

function party() {
  play('party');
  let s = '';
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 30; i++) {
    const x = 20 + rnd() * (BW - 40);
    const kind = i % 3;
    const art = kind === 0 ? seedArt() : kind === 1 ? heart(0, 0, 9, ['#FF8FB1', CORAL, '#C9B8FF'][i % 3]) : star(0, 0, 7, [SUN, '#5FE3BD', '#8CF5FF'][i % 3]);
    s += place(g(art, '', ` class="confetti" style="--dx:${Math.round(rnd() * 80 - 40)}px;--rot:${Math.round(rnd() * 720 - 360)}deg;--t:${(2.2 + rnd() * 1.6).toFixed(2)}s;--d:${(rnd() * 1.2).toFixed(2)}s"`), x, -20, 0.9);
  }
  for (let i = 0; i < WALKERS; i++) {
    s += place(g(hamster('home'), '', ` class="dance" style="animation-delay:${(i * 0.1).toFixed(1)}s"`), 240 + i * 60, 150, 0.6, 0, ' data-walker="party"');
  }
  s += path('M 180 40 Q 360 76 540 40', 'none', 2.4) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const x = 196 + i * 46;
    const y = 40 + 36 * (1 - ((x - 360) / 180) ** 2) * 0.55;
    return path(`M ${x - 9} ${y - 2} L ${x} ${y + 16} L ${x + 9} ${y - 2} Z`, [CORAL, SUN, '#5FE3BD', '#C9B8FF'][i % 4], 1.8);
  }).join('');
  layer('fx').innerHTML = '';
  layer('pfx').innerHTML = s;
  layer('walkers').innerHTML = '';
  renderTray();
  const nextOk = S.li + 1 < LEVELS.length;
  $('party').querySelector('[data-act="next"]').hidden = !nextOk;
  $('party').hidden = false;
}

function partyAct(act) {
  play('tap');
  $('party').hidden = true;
  layer('fx').innerHTML = '';
  layer('pfx').innerHTML = '';
  if (act === 'house') { S.at = Math.min(S.li + 1, LEVELS.length - 1); S.mode = 'build'; S.run = null; show('house'); return; }
  if (act === 'next') { openLevel(S.li + 1); return; }
  S.mode = 'build';
  S.run = null;
  S.seedTaken = false;
  renderSeed();
  const peek = $('peek');
  if (peek) peek.removeAttribute('visibility');
  renderParts();
  renderAll();
  renderArrows();
}

// ---------------------------------------------------------------- little effects (D-141)
function bump(el, cls, ms = 700) {
  el.classList.remove(cls);
  el.getBoundingClientRect();
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
function fx(svg, ms) {
  const holder = layer('fx');
  holder.insertAdjacentHTML('beforeend', svg);
  const el = holder.lastElementChild;
  setTimeout(() => el.remove(), ms);
}
function fxRise(art, x, y) { fx(place(g(art, '', ' class="rise"'), x, y), 1000); }
function puff(x, y, k = 1) {
  fx(g([[-14, 0], [0, -6], [14, 0]].map(([dx, dy]) => place(g(circle(0, 0, 7 * k, '#FFF8EE', 1.6, '#C9B8A0'), '', ' class="pop"'), x + dx * k, y + dy * k)).join('')), 700);
}
function splash(x, y) {
  fx(g([-18, -8, 4, 16].map((dx, i) => place(g(circle(0, 0, 5, '#BFEAFF', 1.6, '#5FA8C9'), '', ' class="rise"'), x + dx, y - (i % 2) * 8)).join('')
    + place(g(circle(0, 0, 18, 'none', 3, '#5FA8C9'), '', ' class="pop"'), x, y)), 1000);
}
function takeSeed() {
  S.seedTaken = true;
  play('seed');
  const seedEl = $('seed');
  if (seedEl) {
    const [c, r] = S.level.seed;
    fx(place(g(seedArt() + sparkle(14, -14, 7), '', ' class="rise"'), c * CELL + 30, r * CELL + 30, 1.2), 1000);
  }
  layer('seedl').innerHTML = '';
  renderHud();
  const hs = $('hud-seed');
  if (hs) bump(hs.parentNode, 'tiny-hop');
}
function squishMallow(k) {
  const el = board.querySelector(`[data-placed="${k}"] .mallow`);
  if (el) bump(el, 'squish', 500);
}
function cheer(el) {
  play('squeak');
  const m = el.getAttribute('transform') || '';
  const t = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(m);
  if (t) fxRise(heart(0, 0, 10, '#FF8FB1'), Number(t[1]), Number(t[2]) - 56);
  else fxRise(heart(0, 0, 10, '#FF8FB1'), BW / 2, 120);
}
const POKES = {
  duck: ['hop', 'quack'], jar: ['wobble', 'clink'], tin: ['wobble', 'clink'], picture: ['wobble', 'clink'], peek: ['hop', 'squeak'],
  sun: ['wink', 'chirp'], cloud: ['squish', 'whoosh'], smoke: ['squish', 'poof'], bird: ['hop', 'chirp'], frog: ['hop', 'ribbit'],
  future: ['wobble', 'soon'], wheel: ['spin', 'squeak'], cushion: ['squish', 'poof'], mallow: ['squish', 'boing'], tube: ['wobble', 'squeak'],
  hero: ['hop', 'squeak'], clock: ['wobble', 'chirp'], lamp: ['wobble', 'clink'], moon: ['hop', 'whoosh'], mobile: ['wobble', 'clink'],
  mirror: ['wink', 'clink'], towel: ['wobble', 'whoosh'], skylight: ['wink', 'chirp'], spider: ['hop', 'squeak'], scarecrow: ['wobble', 'squeak'],
  cup: ['wobble', 'clink'], pot: ['wobble', 'tap'], trowel: ['wobble', 'clink'], can: ['wobble', 'splash'], swing: ['wobble', 'wheee'],
};
function poke(el) {
  const [cls, snd] = POKES[el.dataset.poke] || ['wobble', 'tap'];
  bump(el, cls);
  play(snd);
}

// ---------------------------------------------------------------- the house (D-140)
function onHouseTap(e) {
  const m = e.target.closest('[data-level]');
  if (m) {
    const i = Number(m.dataset.level);
    if (!isOpen(i)) { play('soon'); bump(m, 'wobble'); return; }
    goTo(i);
    return;
  }
  const pk = e.target.closest('[data-poke]');
  if (pk) poke(pk);
  const tok = e.target.closest('#token');
  if (tok) { play('squeak'); bump(tok.firstElementChild.firstElementChild, 'hop'); }
}

function goTo(i) {
  const tok = $('token');
  const from = SPOTS[LEVELS[S.at].spot];
  const to = SPOTS[LEVELS[i].spot];
  play('hop');
  if (tok && (from[0] !== to[0] || from[1] !== to[1])) {
    tok.style.transition = `transform ${0.55 / S.speed}s ease-in-out`;
    tok.style.transform = `translate(${to[0] - from[0]}px, ${to[1] - from[1]}px)`;
  }
  setTimeout(() => openLevel(i), (tok ? 650 : 0) / S.speed);
}

// ---------------------------------------------------------------- start
const cardCss = document.createElement('style');
cardCss.textContent = CARD_CSS;   // the help cards' looping pictures (cards.js), all classes hc-
document.head.appendChild(cardCss);
$('title-art').innerHTML = titleArt();
$('title-art').addEventListener('pointerdown', (e) => { const pk = e.target.closest('[data-poke]'); if (pk) poke(pk); });
$('play').addEventListener('click', () => { if (!S.ready) { S.playAsked = true; return; } play('go'); show('house'); });
$('house-svg').addEventListener('pointerdown', onHouseTap);
$('sound').addEventListener('click', () => { setMuted(!isMuted()); $('sound').innerHTML = soundIcon(); play('tap'); });
$('turn').addEventListener('click', () => { S.turnDismissed = true; $('turn').hidden = true; });
$('party').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) partyAct(b.dataset.act); });
board.addEventListener('pointerdown', onDown);
board.addEventListener('pointermove', onMove);
board.addEventListener('pointerup', onUp);
board.addEventListener('pointercancel', onUp);
board.addEventListener('pointerleave', () => { if (!S.drag && S.hover) { S.hover = null; renderGhost(); } });
window.addEventListener('resize', () => { if (S.screen === 'level') fitBoard(); if (S.screen === 'house') sizeHouse(); });

// The wrapper's start (or the game's own, at once, when it runs on its own): who's playing isn't needed;
// sound and the saved progress are.
linkUp((start, fg) => {
  S.linked = start.standalone ? null : fg;
  if (start.sound === false) { setMuted(true); S.soundLocked = true; }
  S.progress = unpack(IDS, S.linked ? start.state : readDevice(), CARDS);
  S.at = nextAt(IDS, S.progress);
  S.ready = true;
  if (S.playAsked) { play('go'); show('house'); }
});

// The test hook: reads the game and finds where to tap; the browser test taps like a child would.
window.__test = {
  state: () => ({
    screen: S.screen, mode: S.mode, level: S.level && S.level.id, placed: { ...S.placed }, selected: S.selected,
    left: S.level ? left(S.level, S.placed) : null, progress: JSON.parse(JSON.stringify(S.progress)), layout: S.layout,
    at: S.at, home: S.run ? S.run.home : 0, seedTaken: S.seedTaken, heard: heard.slice(-40),
    outcome: S.run ? S.run.res.outcome : null, ready: S.ready, linked: !!S.linked, muted: isMuted(), format: FORMAT,
    card: S.card, caption: S.card ? CAPTION[S.card] : null, help: S.help,
  }),
  cellPoint: (c, r) => {
    const m = board.getScreenCTM();
    const p = new DOMPoint((c + 0.5) * CELL - S.vx, (r + 0.5) * CELL).matrixTransform(m);
    return { x: p.x, y: p.y };
  },
  speed: (k) => { S.speed = k; },
  view: () => ({ x: S.vx, max: maxView() }),
};
