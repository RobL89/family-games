// bridge.js: the messages between a game and the launcher's game shell.
// DRAFT v1, proposed in the games pack (INTEGRATION.md, section 5). The launcher project
// owns the final version, which will live at shared/bridge.js. Nothing here is decided yet.
//
// In a game:
//   import { connect } from '../../shared/bridge.js';   // here: '../bridge.js'
//   const fg = connect();
//   fg.onStart((start) => {
//     // start.round:      'first', 'again' or 'next'
//     // start.player:     { name, animal, colour } or null when standalone
//     // start.level:      a number, or null if the game has no levels
//     // start.settings:   only what a grown-up set, e.g. { speed: 1 }
//     // start.lists:      the child's word lists, default first: [{ title, words: [...] }]
//     // start.sound:      false means no sounds and no speech
//     // start.state:      the game's saved state, or null (open question GQ2)
//     // start.standalone: true when there's no shell; the game shows its own end card
//   });
//   fg.roundOver({ stars: 3, score: 12, seconds: 40, detail: 'Week 3 spellings', help: 1, next: true });
//   fg.saveState({ hats: ['party'] });   // only if GQ2 is answered "a"
//
// Standalone (no shell): the page isn't in a frame, or no start message arrives in time.
// The game then gets level 1 (or ?level= in the address), no settings, no lists and sound on,
// and roundOver() and saveState() do nothing.

const VERSION = 1;
const WAIT_MS = 1500; // how long to wait for the shell before running standalone

export function connect({ wait = WAIT_MS } = {}) {
  const framed = window.parent && window.parent !== window;
  let handler = null;
  let pending = null;   // a start that arrived before onStart() was called
  let inShell = false;
  let alone = false;    // gave up waiting and started standalone
  let timer = null;

  const deliver = (start) => {
    if (handler) handler(start);
    else pending = start;
  };

  const standalone = () => {
    alone = true;
    const level = Number(new URLSearchParams(location.search).get('level')) || 1;
    deliver({ round: 'first', player: null, level, settings: {}, lists: [], sound: true, state: null, standalone: true });
  };

  // Only the shell, on the same site, may talk to the game.
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== location.origin) return;
    const m = e.data;
    if (!m || m.v !== VERSION || m.type !== 'fg:start') return;
    if (alone) return; // the game already started on its own; a late shell is ignored
    clearTimeout(timer);
    inShell = true;
    deliver({
      round: m.round || 'first',
      player: m.player || null,
      level: m.level ?? null,
      settings: m.settings || {},
      lists: Array.isArray(m.lists) ? m.lists : [],
      sound: m.sound !== false,
      state: m.state ?? null,
      standalone: false,
    });
  });

  const send = (msg) => {
    if (framed) window.parent.postMessage({ v: VERSION, ...msg }, location.origin);
  };

  return {
    // Register the start handler. Call it once, as early as possible.
    onStart(fn) {
      handler = fn;
      if (pending) { const p = pending; pending = null; fn(p); }
      if (!framed) { standalone(); return; }
      send({ type: 'fg:ready' });
      timer = setTimeout(() => { if (!inShell) standalone(); }, wait);
    },
    get inShell() { return inShell; },

    // Report a finished round, once per round. stars 0 means "finished with the answer shown".
    // Returns true if the shell will show the end-of-round panel; false means the game shows its own.
    roundOver({ stars, score, seconds, detail, help, next, again } = {}) {
      if (!inShell) return false;
      const s = Math.max(0, Math.min(3, Math.round(Number(stars) || 0)));
      const msg = { type: 'fg:round', stars: s };
      if (Number.isFinite(score)) msg.score = score;
      if (Number.isFinite(seconds)) msg.seconds = Math.round(seconds);
      if (detail) msg.detail = String(detail).slice(0, 100);
      if (Number.isFinite(help)) msg.help = help;
      if (next) msg.next = true;
      if (again === false) msg.again = false;
      send(msg);
      return true;
    },

    // Save the game's own state (open question GQ2). Kept small: under 20,000 characters.
    saveState(state) {
      if (!inShell) return false;
      const json = JSON.stringify(state || {});
      if (json.length > 20000) { console.warn(`bridge: state not saved, ${json.length} characters`); return false; }
      send({ type: 'fg:state', state: JSON.parse(json) });
      return true;
    },
  };
}
