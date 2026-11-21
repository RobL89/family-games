// Hamster Highway's test panel for previews: step 13's spike (D-185, D-190, D-196). Version 1.4 (21 Nov).
//
// Changes at 1.4 (step 17): a "Picnic done" button under "Frame done": levels 1 to 26 done, 21 to 26 tried, eleven
// cards seen, so Rob can try levels 27 and 28 at once.
//
// Changes at 1.3 (step 16): a "Frame done" button under "Pond done": levels 1 to 24 done, 21 to 24 tried, ten cards
// seen, so Rob can try levels 25 and 26 at once.
//
// Changes at 1.2 (step 15): a "Pond done" button under "Garden done": as it, with levels 21 and 22 done and tried and
// the catapult's card seen too, so Rob can open the park and try levels 23 and 24 at once.
//
// Changes at 1.1 (step 14): a "Garden done" button on the title screen, under "Test board": it marks levels 1 to 20 done
// and their eight help cards seen in this browser's own entry (the game on its own, data map 1.9) and reloads, so
// Rob can try the ride to the park and levels 21 and 22 without playing the first 20. Seeds and tries start empty.
//
// For Rob's testing only (D-020), added to a preview by build_preview.py --debug, never to the game itself. A "Test
// board" button on the title screen opens the 9 x 16 test board (a climbing frame and a lake, in the kitchen's
// colours) through the game's own test hook (__test.openBoard), so the board is placed with the game's real taps and
// drawing; nothing is saved. Then it marks squares one at a time and counts the taps, as assessment-tall-boards-
// signpost.md 0.2's spike asks:
//   1. ten gadgets, each on its ringed square: a tap on the board that isn't on the ring is a wrong tap (a tap on a
//      gadget already down, to take it back, is counted apart, as a fix);
//   2. five zip-lines, each from its pink ring (the high end) to its blue ring (the low end); the first four taken
//      back by a tap on either end, the fifth left for the road home: wrong taps, and lines let go of (cancelled);
//   3. GO: the hamsters walk the road both ways and ride the zip-line home.
// The results, with the screen's size and a square's and a tray slot's size in px, show at the top when step 2 is
// done. Taps in the tray aren't counted. The gate (assessment 0.2): more than 1 wrong tap in 10 gadgets → 8 x 14;
// more than 1 of 5 zip-lines wrong → rethink its placing.
// The board's road (worked out with core.js 1.7, 17 Nov; all five home in 88 ticks): over the bridge, bounce up onto the
// frame, a signpost turns them, bounce up again leftwards, up the left ramp, a signpost turns them, onto the zip-line
// over the lake, onto the far bank's bridge, up three tubes, home. test_hamster_highway_spike_e2e.py checks it all.
// __spike.state() reads the counts (for the test).

(() => {
  const BOARD = {
    id: 'spike', name: 'Test board', room: 'kitchen', spot: 'sink', back: 'kitchen', new: null,
    rows: ['....##..........',
           '.#..............',
           '..##............',
           '................',
           '................',
           '....#####......G',
           '....#...#.....##',
           'S...#...#.....##',
           '#.##....#..#.###'],
    tray: { bridge: 2, bouncer: 2, signpost: 2, rampL: 1, tube: 3, zip: 1 },
  };
  const GADS = [
    { kind: 'bridge', c: 1, r: 8 }, { kind: 'bouncer', c: 3, r: 7 }, { kind: 'bouncer', c: 4, r: 4 }, { kind: 'signpost', c: 8, r: 4 },
    { kind: 'rampL', c: 2, r: 1 }, { kind: 'signpost', c: 1, r: 0 }, { kind: 'bridge', c: 12, r: 8 },
    { kind: 'tube', c: 13, r: 7 }, { kind: 'tube', c: 13, r: 6 }, { kind: 'tube', c: 13, r: 5 },
  ];
  const ZIPS = [
    { high: [2, 3], low: [6, 4], keep: false }, { high: [5, 1], low: [1, 7], keep: false }, { high: [5, 1], low: [11, 7], keep: false },
    { high: [3, 3], low: [1, 7], keep: false }, { high: [4, 1], low: [12, 7], keep: true },
  ];
  const NAME = { bridge: 'bridge', bouncer: 'bouncer', signpost: 'signpost', rampL: 'left ramp', tube: 'tube' };
  const CELL = 60;
  const T = { phase: 'gadgets', gi: 0, zi: 0, zstep: 'place', gadgetHits: 0, gadgetWrong: 0, fixes: 0, zipHits: 0, zipWrong: 0, zipCancelled: 0,
    zipDone: 0, takeBacks: 0, down: null, before: null, results: null };
  const k = (c, r) => `${c},${r}`;
  const same = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  const onSpike = () => { const s = window.__test.state(); return s.screen === 'level' && s.level === 'spike' && s.mode === 'build'; };

  const css = document.createElement('style');
  css.textContent = '#spike-open,#park-skip,#pond-skip,#frame-skip,#picnic-skip{position:absolute;left:max(12px,env(safe-area-inset-left));top:12px;z-index:6;font:700 16px system-ui,sans-serif;'
    + 'padding:10px 16px;border-radius:14px;border:3px solid #1B1446;background:#FFC93C;color:#1B1446}'
    + '#spike-banner,#spike-results{position:fixed;z-index:7;pointer-events:none;font:600 12px/1.3 system-ui,sans-serif;box-sizing:border-box;'
    + 'color:#1B1446;background:rgba(255,255,255,0.92);border:2px solid #1B1446;border-radius:10px;padding:3px 8px;margin:0}'
    + '#spike-results{white-space:pre-line}'
    + '@keyframes spike-pulse{50%{opacity:0.35}}.spike-ring{animation:spike-pulse 1s ease-in-out infinite}';
  document.head.appendChild(css);
  const open = document.createElement('button');
  open.id = 'spike-open';
  open.type = 'button';
  open.textContent = 'Test board';
  document.getElementById('title').appendChild(open);
  const skip = document.createElement('button');
  skip.id = 'park-skip';
  skip.type = 'button';
  skip.textContent = 'Garden done';
  skip.style.top = '64px';
  document.getElementById('title').appendChild(skip);
  skip.addEventListener('click', () => {
    const ids = [];
    for (let n = 1; n <= 10; n++) ids.push(`L${n}`, `L${n}b`);
    const done = Object.fromEntries(ids.map((i) => [i, true]));
    const cards = Object.fromEntries(['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift'].map((k) => [k, true]));
    try { localStorage.setItem('family-games:hamster-highway:progress', JSON.stringify({ v: 2, done, seeds: {}, tries: {}, cards })); } catch { /* storage blocked */ }
    location.reload();
  });
  const pond = document.createElement('button');
  pond.id = 'pond-skip';
  pond.type = 'button';
  pond.textContent = 'Pond done';
  pond.style.top = '116px';
  document.getElementById('title').appendChild(pond);
  pond.addEventListener('click', () => {
    const ids = ['L11', 'L11b'];
    for (let n = 1; n <= 10; n++) ids.push(`L${n}`, `L${n}b`);
    const done = Object.fromEntries(ids.map((i) => [i, true]));
    const cards = Object.fromEntries(['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult'].map((k) => [k, true]));
    try { localStorage.setItem('family-games:hamster-highway:progress', JSON.stringify({ v: 2, done, seeds: {}, tries: { L11: 1, L11b: 1 }, cards })); } catch { /* storage blocked */ }
    location.reload();
  });
  const frame = document.createElement('button');
  frame.id = 'frame-skip';
  frame.type = 'button';
  frame.textContent = 'Frame done';
  frame.style.top = '168px';
  document.getElementById('title').appendChild(frame);
  frame.addEventListener('click', () => {
    const ids = ['L11', 'L11b', 'L12', 'L12b'];
    for (let n = 1; n <= 10; n++) ids.push(`L${n}`, `L${n}b`);
    const done = Object.fromEntries(ids.map((i) => [i, true]));
    const cards = Object.fromEntries(['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost'].map((k) => [k, true]));
    try { localStorage.setItem('family-games:hamster-highway:progress', JSON.stringify({ v: 2, done, seeds: {}, tries: { L11: 1, L11b: 1, L12: 1, L12b: 1 }, cards })); } catch { /* storage blocked */ }
    location.reload();
  });
  const picnic = document.createElement('button');
  picnic.id = 'picnic-skip';
  picnic.type = 'button';
  picnic.textContent = 'Picnic done';
  picnic.style.top = '220px';
  document.getElementById('title').appendChild(picnic);
  picnic.addEventListener('click', () => {
    const ids = ['L11', 'L11b', 'L12', 'L12b', 'L13', 'L13b'];
    for (let n = 1; n <= 10; n++) ids.push(`L${n}`, `L${n}b`);
    const done = Object.fromEntries(ids.map((i) => [i, true]));
    const cards = Object.fromEntries(['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost', 'button'].map((k) => [k, true]));
    try { localStorage.setItem('family-games:hamster-highway:progress', JSON.stringify({ v: 2, done, seeds: {}, tries: { L11: 1, L11b: 1, L12: 1, L12b: 1, L13: 1, L13b: 1 }, cards })); } catch { /* storage blocked */ }
    location.reload();
  });
  const banner = document.createElement('p');
  banner.id = 'spike-banner';
  banner.hidden = true;
  document.body.appendChild(banner);
  const results = document.createElement('p');
  results.id = 'spike-results';
  results.hidden = true;
  document.body.appendChild(results);

  // ---------------------------------------------------------------- the marks on the board, and the banner
  function ring(c, r, col, label) {
    const x = c * CELL;
    const y = r * CELL;
    return `<g class="spike-ring"><rect x="${x + 2}" y="${y + 2}" width="${CELL - 4}" height="${CELL - 4}" rx="10" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="9 5"/>`
      + (label ? `<text x="${x + CELL / 2}" y="${y + 14}" text-anchor="middle" font-size="13" font-weight="700" fill="${col}" stroke="#fff" stroke-width="3" paint-order="stroke">${label}</text>` : '') + '</g>';
  }
  function draw() {
    const world = document.getElementById('world');
    let marks = document.getElementById('spike-marks');
    if (!marks) {
      world.insertAdjacentHTML('beforeend', '<g id="spike-marks" pointer-events="none"></g>');
      marks = document.getElementById('spike-marks');
    }
    let s = '';
    let say = '';
    if (T.phase === 'gadgets') {
      const t = GADS[T.gi];
      s = ring(t.c, t.r, '#D6246E', NAME[t.kind]);
      say = `Put the ${NAME[t.kind]} on the ring (${T.gi + 1} of 10). Wrong taps: ${T.gadgetWrong}`;
    } else if (T.phase === 'zips') {
      const z = ZIPS[T.zi];
      s = ring(z.high[0], z.high[1], '#D6246E', '1') + ring(z.low[0], z.low[1], '#1F6FD1', '2');
      say = T.zstep === 'back' ? `Tap either end of zip-line ${T.zi + 1} to take it back.`
        : `Zip-line ${T.zi + 1} of 5: pick it, tap the pink ring (1), then the blue ring (2)${z.keep ? '; this one stays' : ''}. Wrong taps: ${T.zipWrong}, let go: ${T.zipCancelled}`;
    } else {
      say = 'All done: press GO to watch them go. Reload the page to try again.';
    }
    marks.innerHTML = s;
    banner.textContent = say;
    banner.hidden = false;
    pin();
  }
  // the banner and results sit over the board's empty top right (columns 9 to 14, rows 0 to 3: no marks there)
  function pin() {
    const b = document.getElementById('board');
    const box = b.getBoundingClientRect();
    const u = box.height / Number(b.getAttribute('viewBox').split(' ')[3]);
    for (const el of [banner, results]) {
      el.style.left = `${(box.left + 9.1 * CELL * u).toFixed(0)}px`;
      el.style.width = `${(5.6 * CELL * u).toFixed(0)}px`;
    }
    banner.style.top = `${(box.top + 4).toFixed(0)}px`;
    results.style.top = `${(box.top + 8 + banner.getBoundingClientRect().height).toFixed(0)}px`;
  }
  addEventListener('resize', () => { if (!banner.hidden) pin(); });

  function measure() {
    const b = document.getElementById('board');
    const vb = b.getAttribute('viewBox').split(' ').map(Number);
    const sq = (b.getBoundingClientRect().height / vb[3]) * CELL;
    const slot = document.querySelector('#tray [data-slot]');
    return { w: innerWidth, h: innerHeight, square: sq.toFixed(1), slot: slot ? slot.getBoundingClientRect().height.toFixed(0) : '?' };
  }
  function finish() {
    const m = measure();
    T.results = m;
    results.textContent = `Gadgets: 10 placed. Wrong taps: ${T.gadgetWrong} of ${T.gadgetWrong + T.gadgetHits}${T.fixes ? `; taps to take one back: ${T.fixes}` : ''}\n`
      + `Zip-lines: ${T.zipDone} placed, ${T.takeBacks} taken back. Wrong taps: ${T.zipWrong}. Cancelled: ${T.zipCancelled}.\n`
      + `Screen: ${m.w} × ${m.h} px; a square ${m.square} px; a tray slot ${m.slot} px tall.\n`
      + 'Gate: 1 or fewer wrong taps in 10 gadgets; 1 or fewer zip-lines wrong in 5.';
    results.hidden = false;
    pin();
  }

  // ---------------------------------------------------------------- counting (taps in the tray aren't counted)
  function judge(cell, before) {
    const after = window.__test.state();
    const was = before.placed[k(cell[0], cell[1])];
    if (T.phase === 'gadgets') {
      const t = GADS[T.gi];
      if (cell[0] === t.c && cell[1] === t.r) T.gadgetHits += 1;
      else if (was) T.fixes += 1;
      else T.gadgetWrong += 1;
      while (T.gi < GADS.length && after.placed[k(GADS[T.gi].c, GADS[T.gi].r)] === GADS[T.gi].kind) T.gi += 1;
      if (T.gi >= GADS.length) T.phase = 'zips';
    } else if (T.phase === 'zips') {
      const z = ZIPS[T.zi];
      const line = `zip:${z.low[0]},${z.low[1]}`;
      if (T.zstep === 'place') {
        const want = before.zipFrom ? z.low : z.high;
        if (same(cell, want)) T.zipHits += 1;
        else if (was) T.fixes += 1;
        else T.zipWrong += 1;
        const lines = (p) => Object.values(p).filter((v) => v.startsWith('zip:')).length;
        if (before.zipFrom && !after.zipFrom && lines(after.placed) === lines(before.placed)) T.zipCancelled += 1;
        if (after.placed[k(z.high[0], z.high[1])] === line) {
          T.zipDone += 1;
          if (z.keep) T.zi += 1; else T.zstep = 'back';
        }
      } else {
        if (same(cell, z.high) || same(cell, z.low)) T.takeBacks += 1;
        else if (was) T.fixes += 1;
        else T.zipWrong += 1;
        if (!after.placed[k(z.high[0], z.high[1])]) { T.zi += 1; T.zstep = 'place'; }
      }
      if (T.zi >= ZIPS.length) { T.phase = 'go'; finish(); }
    }
    draw();
  }
  const board = document.getElementById('board');
  board.addEventListener('pointerdown', (e) => {
    T.down = null;
    if (!onSpike() || T.phase === 'go') return;
    const w = window.__test.where(e.clientX, e.clientY);
    const s = window.__test.state();
    T.down = { area: w.area, cell: w.cell, x: e.clientX, y: e.clientY };
    T.before = { placed: s.placed, zipFrom: s.zipFrom };
  }, true);
  board.addEventListener('pointerup', (e) => {
    const d = T.down;
    T.down = null;
    if (!d) return;
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8;
    const w = window.__test.where(e.clientX, e.clientY);
    let cell = null;
    if (d.area === 'board') cell = moved && w.cell ? w.cell : d.cell;
    else if (d.area === 'tray' && moved && w.area === 'board') cell = w.cell;   // dragged from the tray onto the board
    if (!cell) return;
    const before = T.before;
    setTimeout(() => judge(cell, before), 0);
  }, true);

  open.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!window.__test.state().ready) return;
    document.getElementById('title').hidden = true;
    window.__test.openBoard(BOARD);
    draw();
  });

  window.__spike = {
    state: () => ({ phase: T.phase, target: T.phase === 'gadgets' ? GADS[T.gi] : null, zip: T.phase === 'zips' ? ZIPS[T.zi] : null, zstep: T.zstep,
      gadgetHits: T.gadgetHits, gadgetWrong: T.gadgetWrong, fixes: T.fixes, zipHits: T.zipHits, zipWrong: T.zipWrong, zipCancelled: T.zipCancelled,
      zipDone: T.zipDone, takeBacks: T.takeBacks, results: T.results, board: BOARD, gadgets: GADS, zips: ZIPS }),
  };
})();
