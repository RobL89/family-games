// Hamster Highway: the screens, the taps and the hamsters' trip. Version 1.0 (15 Nov, the first build).
//
// Title card (a Play button first, GC6) → the house and garden (D-140) → a level: build (gadgets go
// anywhere they fit, D-139: drag from the tray or click then click; click a placed gadget to take it
// back), then GO: five hamsters walk the route core.js works out, one after another, with a party when
// they're all home. Golden seeds (D-138). Cute details answer a tap (D-141).
// Progress is kept only while the page is open: the data map has no row for it yet (Q-051).
// Runs on its own as a plain page (GC5); linking to P-020's wrapper comes before the release.

import { COLS, ROWS, GADGETS, key, parseLevel, fits, fitCells, left, walk, terrain } from './core.js';
import { LEVELS } from './levels.js';
import { CELL, INK, SUN, CORAL, hamster, hamsterHead, gadget, block, water, duck, startArt, homeArt, seedArt, sparkle, backdrop, slot, goButton, houseButton, place, g, rect, circle, path, star, heart, text } from './art.js';
import { HOUSE_W, HOUSE_H, SPOTS, houseScene, tokenAt, titleArt } from './house.js';
import { play, heard, isMuted, setMuted } from './sound.js';

const BW = COLS * CELL;   // 720
const BH = ROWS * CELL;   // 420
const WALKERS = 5;
const GAP = 1.25;         // seconds between hamsters
const SC = 0.56;          // a hamster's size on the board, as in the mock-ups
const $ = (id) => document.getElementById(id);
const board = $('board');
const layer = (id) => $(id);

const S = {
  screen: 'title',
  progress: { done: {}, seeds: {}, tries: {} },   // only while the page is open (Q-051)
  at: 0,
  li: 0, level: null, placed: {}, selected: null, hover: null, drag: null, fresh: null,
  mode: 'build', run: null, layout: 'bottom', speed: 1, seedTaken: false, turnDismissed: false,
};

// ---------------------------------------------------------------- screens
function show(name) {
  S.screen = name;
  for (const id of ['title', 'house', 'level']) $(id).hidden = id !== name;
  if (name === 'house') renderHouse();
  if (name === 'level') fitBoard();
}

function isOpen(i) {
  return i === 0 || !!S.progress.done[LEVELS[i - 1].id];
}

function renderHouse() {
  const levels = LEVELS.map((d, i) => ({ spot: d.spot, open: isOpen(i), done: !!S.progress.done[d.id], seed: !!S.progress.seeds[d.id] }));
  $('house-svg').innerHTML = houseScene({ levels, current: S.at }) + `<g id="token">${tokenAt(LEVELS[S.at].spot)}</g>`;
  $('seeds').innerHTML = LEVELS.map((d) => `<svg viewBox="-14 -18 28 36"${S.progress.seeds[d.id] ? '' : ' opacity="0.3"'}>${seedArt()}</svg>`).join('');
  $('sound').innerHTML = soundIcon();
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
  $('party').hidden = true;
  show('level');
  renderLevel();
}

function renderLevel() {
  const lv = S.level;
  const def = LEVELS[S.li];
  let bg = backdrop(def.back);
  let duckDone = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
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
  layer('bg').innerHTML = bg;
  renderSeed();
  renderAll();
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
    return place(hit + g(gadget(kind), '', k === S.justPlaced ? ' class="drop"' : ''), c * CELL, r * CELL, CELL / 100, 0, ` data-placed="${k}"`);
  }).join('');
  S.justPlaced = null;
}

function renderFits() {
  if (S.mode !== 'build' || !S.selected) { layer('fits').innerHTML = ''; return; }
  layer('fits').innerHTML = fitCells(S.level, S.placed, S.selected)
    .map(([c, r]) => rect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6, 'rgba(255,246,199,0.75)', 8, 2, '#F0A51C')).join('');
}

function renderGhost() {
  const h = S.hover;
  const kind = S.drag ? S.drag.kind : S.selected;
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
    layer('ghost').innerHTML = place(gadget(kind), h.x - 30, h.y - 40, 0.6, 0, ' opacity="0.85"');
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
  layer('hud').innerHTML = s;
}

function trayKinds() {
  return GADGETS.filter((k) => S.level.tray[k]);
}

function renderTray() {
  const counts = left(S.level, S.placed);
  const kinds = trayKinds();
  const run = S.mode !== 'build';
  let s = '';
  if (S.layout === 'side') {
    s += rect(BW, 0, 130, BH, '#8B5A3C', 0, 0) + line0(BW, 0, BW, BH);
    s += houseButton(BW + 65, 40, 28);
    const step = Math.min(84, 246 / kinds.length);
    kinds.forEach((k, i) => { s += slot(BW + 17, 80 + i * step, 96, step - 8, k, counts[k], S.selected === k && !run, S.fresh === k); });
    s += goButton(BW + 9, 336, 112, 72, run ? 'stop' : 'go');
  } else {
    s += rect(0, BH, BW, 110, '#8B5A3C', 0, 0) + line0(0, BH, BW, BH);
    s += houseButton(46, BH + 55, 30);
    kinds.forEach((k, i) => { s += slot(100 + 94 * i, BH + 11, 84, 78, k, counts[k], S.selected === k && !run, S.fresh === k); });
    s += goButton(578, BH + 17, 128, 76, run ? 'stop' : 'go');
  }
  layer('tray').innerHTML = s;
  const go = board.querySelector('.btn.go');
  if (go && !run && Object.keys(S.placed).length) go.classList.add('ready');   // a gentle wiggle once something is down
  if (S.mode === 'party') layer('tray').setAttribute('opacity', '0.5'); else layer('tray').removeAttribute('opacity');
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
  return [Math.floor(p.x / CELL), Math.floor(p.y / CELL)];
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
  if (pk) { poke(pk); return; }
  if (S.selected) { S.selected = null; renderAll(); }
}

function onMove(e) {
  if (S.screen !== 'level' || S.mode !== 'build') return;
  const p = toBoard(e);
  if (S.drag) {
    if (!S.drag.moved && Math.hypot(e.clientX - S.drag.x0, e.clientY - S.drag.y0) > 8) S.drag.moved = true;
    S.hover = { x: p.x, y: p.y, cell: S.drag.moved ? cellAt(p) : null };
    if (S.drag.moved) renderGhost();
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

function onUp(e) {
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
  if (name === 'stop') { play('back'); stopRun(); renderAll(); }
}

// ---------------------------------------------------------------- the hamsters' trip
function feet(c, r) {
  let y = (r + 1) * CELL;
  if (terrain(S.level, S.placed, c, r + 1) === 'ramp') y = (r + 1.5) * CELL;
  if (terrain(S.level, S.placed, c, r) === 'bouncer') y = (r + 0.55) * CELL;
  return { x: (c + 0.5) * CELL, y };
}

function segmentsOf(res) {
  const st = res.steps;
  const segs = [];
  let t = 0;
  const add = (seg) => { seg.t0 = t; seg.t1 = t + seg.dur; t = seg.t1; segs.push(seg); };
  for (let i = 1; i < st.length; i++) {
    const a = st[i - 1];
    const b = st[i];
    const p0 = segs.length ? segs[segs.length - 1].p1 : feet(a.c, a.r);
    if (b.act === 'walk' || b.act === 'climb') {
      const mid = { x: (a.c + 1) * CELL, y: (a.r + 1) * CELL };
      add({ kind: b.act, p0, mid, p1: feet(b.c, b.r), dur: b.act === 'climb' ? 0.55 : 0.42, seed: !!b.seed, sound: b.act === 'climb' ? 'climb' : null });
    } else if (b.act === 'bounce') {
      const p1 = feet(b.c, b.r);
      add({ kind: 'bounce', p0, p1, ctrl: { x: (p0.x + p1.x) / 2 - 10, y: Math.min(p0.y, p1.y) - 1.5 * CELL }, dur: 0.85, seed: !!b.seed, sound: 'boing', mallow: key(a.c, a.r) });
    } else if (b.act === 'fall' || b.act === 'float') {
      let j = i;
      let seed = !!b.seed;
      while (j + 1 < st.length && st[j + 1].act === b.act) { j += 1; if (st[j].seed) seed = true; }
      const last = st[j];
      const rows = j - i + 1;
      const p1 = last.r >= ROWS ? { x: p0.x, y: BH - 16 } : feet(last.c, last.r);
      add({ kind: b.act, p0, p1, dur: b.act === 'float' ? 0.5 * rows : 0.16 + 0.09 * rows, seed, rows,
        sound: b.act === 'float' ? 'wheee' : rows >= 3 ? 'slide' : null });
      i = j;
    } else if (b.act === 'tube') {
      add({ kind: 'tube', p0, p1: feet(b.c, b.r), dur: 0.3, seed: !!b.seed });
    }
  }
  return segs;
}

function startRun() {
  if (S.mode !== 'build') return;
  const id = S.level.id;
  S.progress.tries[id] = (S.progress.tries[id] || 0) + 1;
  const seedLeft = !!S.level.seed;
  const res = walk(S.level, S.placed, seedLeft);
  const segs = segmentsOf(res);
  S.mode = 'run';
  S.selected = null;
  S.hover = null;
  S.drag = null;
  S.seedTaken = false;
  renderSeed();
  const total = segs.length ? segs[segs.length - 1].t1 : 0;
  S.run = { res, segs, total, t: 0, home: 0, walkers: [], finishing: false, last: performance.now() };
  layer('walkers').innerHTML = Array.from({ length: WALKERS }, (_, i) => `<g data-walker="${i}" visibility="hidden"><g class="pose"></g></g>`).join('');
  S.run.walkers = [...layer('walkers').children].map((el, i) => ({ i, el, pose: '', seg: -1, done: false, endFx: {} }));
  const peek = $('peek');
  if (peek) peek.setAttribute('visibility', 'hidden');
  play('go');
  renderAll();
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
  const peek = $('peek');
  if (peek) peek.removeAttribute('visibility');
}

function tick(now) {
  const R = S.run;
  if (!R || S.mode !== 'run') return;
  const dt = Math.min(0.05, (now - R.last) / 1000);
  R.last = now;
  R.t += dt * S.speed;
  for (const w of R.walkers) if (!w.done) moveWalker(R, w);
  if (R.walkers.every((w) => w.done) && !R.finishing) {
    R.finishing = true;
    setTimeout(finishRun, 350 / S.speed);
    return;
  }
  requestAnimationFrame(tick);
}

function setPose(w, pose) {
  if (w.pose === pose) return;
  w.pose = pose;
  w.el.firstElementChild.innerHTML = hamster(pose);
}
function setAt(w, x, y, rot = 0, sc = SC, op = 1) {
  w.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`);
  w.el.setAttribute('opacity', op.toFixed(2));
  w.el.removeAttribute('visibility');
}

function moveWalker(R, w) {
  const local = R.t - w.i * GAP;
  if (local < 0) return;
  if (local < R.total) {
    let k = R.segs.findIndex((s) => local < s.t1);
    if (k < 0) k = R.segs.length - 1;
    const s = R.segs[k];
    if (k !== w.seg) {
      if (w.seg >= 0) onSegEnd(R, w, R.segs[w.seg]);
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
    } else if (s.kind === 'float') {
      x = s.p0.x + 4 * Math.sin(f * Math.PI * 3);
      y = s.p0.y + (s.p1.y - s.p0.y) * f;
      pose = 'float';
    } else {
      x = s.p0.x + (s.p1.x - s.p0.x) * f;
      y = s.p0.y + (s.p1.y - s.p0.y) * f;
    }
    setPose(w, pose);
    setAt(w, x, y, rot);
    return;
  }
  if (w.seg >= 0 && !w.endedSeg) { onSegEnd(R, w, R.segs[w.seg]); w.endedSeg = true; }
  endWalker(R, w, local - R.total);
}

function onSegEnd(R, w, s) {
  if (s.seed && w.i === 0 && !S.seedTaken) takeSeed();
  if ((s.kind === 'fall' || s.kind === 'float') && s.rows < 3 && R.res.outcome !== 'splash') play('patter');
}

function lastPoint(R) {
  if (R.segs.length) return R.segs[R.segs.length - 1].p1;
  const [c, r] = S.level.start;
  return feet(c, r);
}

function endWalker(R, w, e) {
  const p = lastPoint(R);
  const out = R.res.outcome;
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
    S.progress.done[id] = true;
    if (S.seedTaken) S.progress.seeds[id] = true;
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
    renderAll();
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
  layer('fx').innerHTML = s;
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
  if (act === 'house') { S.at = Math.min(S.li + 1, LEVELS.length - 1); S.mode = 'build'; S.run = null; show('house'); return; }
  if (act === 'next') { openLevel(S.li + 1); return; }
  S.mode = 'build';
  S.run = null;
  S.seedTaken = false;
  renderSeed();
  const peek = $('peek');
  if (peek) peek.removeAttribute('visibility');
  renderAll();
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
  hero: ['hop', 'squeak'],
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
$('title-art').innerHTML = titleArt();
$('title-art').addEventListener('pointerdown', (e) => { const pk = e.target.closest('[data-poke]'); if (pk) poke(pk); });
$('play').addEventListener('click', () => { play('go'); show('house'); });
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

// The test hook: reads the game and finds where to tap; the browser test taps like a child would.
window.__test = {
  state: () => ({
    screen: S.screen, mode: S.mode, level: S.level && S.level.id, placed: { ...S.placed }, selected: S.selected,
    left: S.level ? left(S.level, S.placed) : null, progress: JSON.parse(JSON.stringify(S.progress)), layout: S.layout,
    at: S.at, home: S.run ? S.run.home : 0, seedTaken: S.seedTaken, heard: heard.slice(-40),
    outcome: S.run ? S.run.res.outcome : null,
  }),
  cellPoint: (c, r) => {
    const m = board.getScreenCTM();
    const p = new DOMPoint((c + 0.5) * CELL, (r + 0.5) * CELL).matrixTransform(m);
    return { x: p.x, y: p.y };
  },
  speed: (k) => { S.speed = k; },
};
