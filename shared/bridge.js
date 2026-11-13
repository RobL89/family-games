// bridge.js: the game's side of the messages between a game and the wrapper (play.html).
// Version 1, for game contract 0.4, section 5 (GC1). Grown from the games pack's draft
// (docs/games-pack/contract/bridge.js), which stays as background.
//
// In a game:
//   import { connect } from '../../shared/bridge.js';
//   const fg = connect();
//   fg.onStart((start) => {
//     // start.player:     { name, animal, colour }, or null when the game runs on its own
//     // start.sound:      false means no sounds and no speech (Q15)
//     // start.lists:      the child's word lists, default first: [{ title, words: [...] }]
//     // start.settings:   only what a grown-up set, e.g. { speed: 1 } (none built yet)
//     // start.state:      the game's own saved state for this child, or null (P51, GC8)
//     // start.level:      always null: games run their own levels (GC3)
//     // start.standalone: true when there's no wrapper
//   });
//   fg.saveState({ planet: 3, hats: ['party'] });   // whenever the game's progress changes
//   fg.roundOver({ stars: 3, score: 12 });          // optional; the wrapper ignores it while stars are off (P48)
//
// Running on its own (GC5): the page isn't in a frame, or no start message arrives within
// about 5 seconds (P81: the wrapper may wait up to 3 seconds for the Sheet before it sends one). The game then gets no player, no lists, sound on and no saved state,
// and saveState() and roundOver() do nothing, so the game saves to the device itself.

const VERSION = 1;
const WAIT_MS = 5000; // how long to wait for the wrapper before running on its own (P81: more than
                      // the wrapper's WAIT_FOR_SHEET of 3 s, plus time for the page to load)
const MAX_STATE = 20000; // characters of JSON (contract section 5)

export function connect({ wait = WAIT_MS } = {}) {
  const framed = window.parent && window.parent !== window;
  let handler = null;
  let pending = null;   // a start that arrived before onStart() was called
  let inShell = false;
  let alone = false;    // gave up waiting and started on its own
  let timer = null;

  const deliver = (start) => {
    if (handler) handler(start);
    else pending = start;
  };

  const standalone = () => {
    alone = true;
    deliver({ player: null, sound: true, lists: [], settings: {}, state: null, level: null, standalone: true });
  };

  // Only the wrapper, on the same site, may talk to the game.
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== location.origin) return;
    const m = e.data;
    if (!m || m.v !== VERSION || m.type !== 'fg:start') return;
    if (alone) return; // the game already started on its own; a late wrapper is ignored
    clearTimeout(timer);
    inShell = true;
    deliver({
      player: m.player || null,
      sound: m.sound !== false,
      lists: Array.isArray(m.lists) ? m.lists : [],
      settings: m.settings || {},
      state: m.state ?? null,
      level: null,
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

    // Save the game's own state for this child (P51). One small object, under 20,000 characters.
    saveState(state) {
      if (!inShell) return false;
      const json = JSON.stringify(state ?? null);
      if (json.length > MAX_STATE) { console.warn(`bridge: state not saved, ${json.length} characters`); return false; }
      send({ type: 'fg:state', state: JSON.parse(json) });
      return true;
    },

    // Optional: report a finished round. The game always shows its own end of round (P50),
    // so this returns false. The wrapper ignores it while stars are switched off (P48).
    roundOver({ stars, score, seconds, detail } = {}) {
      if (!inShell) return false;
      const msg = { type: 'fg:round', stars: Math.max(0, Math.min(3, Math.round(Number(stars) || 0))) };
      if (Number.isFinite(score)) msg.score = score;
      if (Number.isFinite(seconds)) msg.seconds = Math.round(seconds);
      if (detail) msg.detail = String(detail).slice(0, 100);
      send(msg);
      return false;
    },
  };
}
