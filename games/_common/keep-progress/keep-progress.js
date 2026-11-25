// keep-progress.js: for an artifact game that keeps its progress in its own device storage (P77).
// It makes that progress the game's state for this child, so the wrapper saves it to the Sheet
// and it follows the child to any device. The newest save wins (P78). The maker's page is never
// edited: the game's adapter says how to read and write the child's progress, and this does the rest.
//
//   const progress = keepProgress(fg, { game: 'number-town', read, write });
//   fg.onStart((start) => {
//     if (!progress.begin(start.state)) return; // the page is reloading to show progress put back
//     ...
//   });
//     read():          this child's progress in the game's storage now, or null if there's none yet
//     write(progress): puts it in the game's storage (throw if it can't); the page then reloads once
//
// What it does:
//   1. As the game opens: if the progress the wrapper hands over is newer than what this device
//      last passed on or put back, it's put back and the page reloads once, because a game reads
//      its storage as it opens. Until the reload, the game's own saves are ignored: it still has
//      the old progress in memory, and many games save as the page unloads, which would undo it. Otherwise, progress made here that hasn't been passed on yet is
//      passed on now. (If both happened, the other device saved later, so its play wins: this
//      device can lose at most the last couple of seconds before it was closed.)
//   2. While playing: checks the game's storage every 2 seconds and passes on any change. The
//      wrapper keeps it on the device at once and decides when it goes to the Sheet (P78).
//   3. On the way out: the wrapper calls fgSaveNow() on ⌂ Home and when the page is hidden, and
//      this checks again when the page loses focus or is hidden (after the game's own save there).
//      fgSaveNow() always returns the latest progress taken, not just a change since the last
//      call: tapping ⌂ Home first takes focus from the game, so the change may already have been
//      taken and sent as a message the page leaves before it arrives. The wrapper ignores a state
//      it already has.
//
// The state it passes on: { progress, at }, at being when it was taken (ISO time). Progress over
// 20,000 characters as JSON goes compressed instead (P89): { packed: 'lz64:<text>', at }, made by
// lz-string, about a quarter of the size (a new Word Garden in Year 2: 89,814 characters, packed
// 26,224). Either shape is read back. On this device it notes a fingerprint of what it last passed
// on or put back, per child (fg.keep.<game>.<child>: { hash, at }), not a second copy of it.

import LZString from '../pack/lz-string.js';

const RELOADED = 'fg.keep.reloaded'; // sessionStorage: when this last reloaded the page, so it never loops
const PACK_OVER = 20000;             // progress bigger than this (characters of JSON) goes compressed (P89)
const PACKED = 'lz64:';              // starts a compressed progress: lz-string's base64 text follows

const load = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const store = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
const text = (value) => (value === null || value === undefined ? null : JSON.stringify(value));
const time = (iso) => Date.parse(iso || '') || 0;

// A fingerprint of some text (53 bits): two saves with the same fingerprint are taken to be the same.
// cyrb53, by bryc (public domain).
function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
// The fingerprint a note holds; a note from before P89 held the whole JSON instead.
const noted = (n) => (!n ? null : n.hash || (typeof n.json === 'string' ? hash(n.json) : null));

// The state passed on for some progress: compressed when it's big (P89).
const stateFor = (progress, json, at) => (json.length > PACK_OVER
  ? { packed: PACKED + LZString.compressToBase64(json), at }
  : { progress, at });

// The progress in a state the wrapper hands over, either shape; undefined if there's none to read.
function progressIn(kept) {
  if (!kept || typeof kept !== 'object' || !(time(kept.at) > 0)) return undefined;
  if ('progress' in kept) return kept.progress;
  if (typeof kept.packed === 'string' && kept.packed.startsWith(PACKED)) {
    try {
      const json = LZString.decompressFromBase64(kept.packed.slice(PACKED.length));
      return json ? JSON.parse(json) : undefined;
    } catch { return undefined; }
  }
  return undefined;
}

// Ignores every write to this page's storage from now on. Used only just before a reload: many games
// save their copy in memory as the page unloads, which would undo what was just written (P82).
// It also marks the page as on its way out (window.fgLeaving), so the wrapper keeps its cover over
// the game until the reloaded page has started (P83).
export function freezeStorage() {
  window.fgLeaving = true;
  const proto = Object.getPrototypeOf(window.localStorage);
  for (const name of ['setItem', 'removeItem', 'clear']) proto[name] = function () {};
}

export function keepProgress(fg, { game, read, write, every = 2000 }) {
  const child = new URLSearchParams(location.search).get('player') || '';
  const NOTE = `fg.keep.${game}.${child}`;
  let note = load(NOTE); // { hash, at }: what this device last passed on or put back
  let started = false;
  let latest; // the last state taken while this page has been open

  const readNow = () => { try { return read(); } catch { return null; } };
  const remember = (json, at) => { note = { hash: hash(json), at }; store(NOTE, note); };

  // The game's progress as a state, if it changed since it was last passed on; otherwise undefined.
  function take() {
    if (!started) return undefined;
    const progress = readNow();
    const json = text(progress);
    if (json === null || noted(note) === hash(json)) return undefined;
    remember(json, new Date().toISOString());
    latest = stateFor(progress, json, note.at);
    return latest;
  }
  const pass = () => {
    const state = take();
    if (state !== undefined) fg.saveState(state);
  };

  function begin(kept) {
    const keptProgress = progressIn(kept);
    const valid = keptProgress !== undefined;
    const keptJson = valid ? text(keptProgress) : null;
    const localJson = text(readNow());

    if (valid && keptJson !== null && keptJson !== localJson && time(kept.at) > time(note && note.at)) {
      // Newer than anything this device has passed on or put back: put it back and reload once.
      const want = `${NOTE}|${kept.at}`;
      let last = null;
      try { last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null'); } catch { /* none */ }
      const justReloaded = last && last.want === want && Date.now() - last.at < 10000;
      if (!justReloaded) {
        try {
          write(keptProgress);
          remember(keptJson, kept.at);
          sessionStorage.setItem(RELOADED, JSON.stringify({ want, at: Date.now() }));
          freezeStorage();
          location.reload();
          return false;
        } catch { /* couldn't write or reload: carry on with what this device has */ }
      }
    } else if (valid && keptJson === localJson && localJson !== null && noted(note) !== hash(localJson)) {
      remember(localJson, kept.at); // already the same here: just note it
    }

    started = true;
    pass(); // progress made here that hasn't been passed on yet (also the first time on a device)
    setInterval(pass, every);
    window.fgSaveNow = () => { take(); return latest; }; // for the wrapper, on ⌂ Home and when hidden
    window.addEventListener('blur', pass);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pass(); });
    return true;
  }

  return { begin };
}
