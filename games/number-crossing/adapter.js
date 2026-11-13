// Number Crossing adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. Each child has their own setup (P84): their theme, which sums, biggest total, how many
//      questions and how to answer. The game keeps one setup on the device (its own key
//      gingerbread-river-v1), so without this the children would share one: a 4-year-old would get
//      the 6-year-old's times tables. As the page opens, the adapter puts this child's setup in
//      the game's key (or none, so a child new to this device gets the game's defaults) and
//      reloads the page once, because the game reads its setup as it opens. It notes on the device
//      whose setup is in the game's key (fg.numberCrossing.owner) and keeps each child's copy
//      (fg.numberCrossing.setup.<child>), so switching children needs nothing from the Sheet.
//   2. The setup follows the child (P77): it's the game's progress for this child, kept by
//      games/_common/keep-progress/, so it goes to the Sheet and is put back on any device where
//      it's newer (P78). The game saves its setup when Start the journey is pressed.
//   3. Sound off (P67): its sounds are silent, whatever its own Sound button says.
// Its own Full screen button is left as it is: the wrapper's frame allows full screen, and the
// game's own Exit full screen and Quit game bring the child back (contract section 1).

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';
import { keepProgress, freezeStorage } from '../_common/keep-progress/keep-progress.js';

const KEY = 'gingerbread-river-v1';               // the game's own setup
const OWNER = 'fg.numberCrossing.owner';           // whose setup is in KEY on this device
const COPY = (id) => `fg.numberCrossing.setup.${id}`; // each child's setup on this device
const RELOADED = 'fg.numberCrossing.reloaded';     // when this adapter last reloaded the page
const child = new URLSearchParams(location.search).get('player') || '';

const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const isSetup = (s) => !!(s && typeof s === 'object' && s.ops && typeof s.ops === 'object');

const fg = connect();

// Puts this child's setup in the game's key, if it isn't there already. Returns false if the page
// is reloading so the game reads it.
function useMine() {
  if (read(OWNER) === child) return true;
  const mine = read(COPY(child));
  try {
    const last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null');
    if (last && last.child === child && Date.now() - last.at < 10000) return true; // just reloaded for this: never loop
    if (isSetup(mine)) localStorage.setItem(KEY, JSON.stringify(mine));
    else localStorage.removeItem(KEY); // new to this device: the game's defaults
    localStorage.setItem(OWNER, JSON.stringify(child));
    sessionStorage.setItem(RELOADED, JSON.stringify({ child, at: Date.now() }));
  } catch {
    return true; // storage blocked: the game can't save either, so play on as it is
  }
  // The game still has the previous child's setup in memory: ignore its saves until the reload (P82).
  freezeStorage();
  location.reload();
  return false;
}

// The child's progress for keep-progress (P77): their setup, once it's the one in the game's key.
const progress = keepProgress(fg, {
  game: 'number-crossing',
  read() {
    if (read(OWNER) !== child) return null;
    const s = read(KEY);
    if (!isSetup(s)) return null;
    try { localStorage.setItem(COPY(child), JSON.stringify(s)); } catch { /* storage blocked */ }
    return s;
  },
  write(s) {
    if (!isSetup(s)) throw new Error('not a setup');
    localStorage.setItem(KEY, JSON.stringify(s));
    localStorage.setItem(COPY(child), JSON.stringify(s));
    localStorage.setItem(OWNER, JSON.stringify(child));
  },
});

// Swap to this child's setup as soon as the page opens, not after fg:start (which can wait up to
// 3 seconds for the Sheet), so the game never plays the other child's setup (P82).
const inWrapper = child && window.parent !== window;
const ready = inWrapper ? useMine() : true;

fg.onStart((start) => {
  if (start.standalone || !ready) return; // on its own, or reloading
  if (start.sound === false) soundOff();
  progress.begin(start.state); // false: newer setup put back, and the page reloads once
});
