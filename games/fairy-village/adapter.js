// Fairy village adapter: connects the maker's page (original.html and its files, never edited) to
// the wrapper. The wrapper adds this file to the page once its HTML has been read (P67). Opened on
// its own, original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. One explorer per child (P87, like P70 and P84). The game keeps every explorer in one save on
//      the device (its own key fairy-village-v1: { explorers, current, sound }) and always opens on
//      its own "Who's playing?". Here the child has already picked themselves in the launcher, so:
//        - as the page opens, the adapter puts only this child's explorer in the game's save (or
//          none, so a child new to this device makes theirs first) and reloads the page once,
//          because the game reads its save as it opens. It notes on the device whose explorer is
//          in the game's save (fg.fairyVillage.owner) and keeps each child's copy
//          (fg.fairyVillage.explorer.<child>), so switching children needs nothing from the Sheet;
//        - then it goes straight past "Who's playing?": into the village with the child's explorer,
//          or into "Make your fairy" with the child's name filled in;
//        - the explorer menu's "Who's playing?" and the maker's "Remove this explorer" are hidden.
//          "Change my fairy" stays, so the child can still change their name, level and look.
//   2. The explorer follows the child (P77): their whole explorer (look, level, Read to me, petals,
//      fairies moved in, petal pots, best scores) is the game's progress for this child, kept by
//      games/_common/keep-progress/, so it goes to the Sheet and is put back on any device where
//      it's newer (P78). The game saves at every petal, move-in and game; changes are passed on
//      within 2 seconds.
//   3. Sound off (P67): its sounds and Read to me are silent, whatever its own Sounds button says.
//      Its music and heartbeat puzzles still light up, so they can be played by watching.
// Its own Full screen button is left as it is: the wrapper's frame allows full screen, and the
// button leaves it again (contract section 1).

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';
import { keepProgress, freezeStorage } from '../_common/keep-progress/keep-progress.js';

const KEY = 'fairy-village-v1';                        // the game's own save: { explorers, current, sound }
const OWNER = 'fg.fairyVillage.owner';                 // whose explorer is in KEY on this device
const COPY = (id) => `fg.fairyVillage.explorer.${id}`; // each child's explorer on this device
const RELOADED = 'fg.fairyVillage.reloaded';           // when this adapter last reloaded the page
const child = new URLSearchParams(location.search).get('player') || '';

const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const isExplorer = (e) => !!(e && typeof e === 'object' && typeof e.id === 'string' && e.look && typeof e.look === 'object');

// The one explorer in the game's save: the current one, or the only one.
function inSave(save) {
  if (!save || !Array.isArray(save.explorers)) return null;
  const e = save.explorers.find((x) => x && x.id === save.current) || (save.explorers.length === 1 ? save.explorers[0] : null);
  return isExplorer(e) ? e : null;
}
// The game's save holding just this explorer (or none), keeping its own Sounds setting.
function saveWith(explorer) {
  const now = read(KEY);
  const sound = now && typeof now.sound === 'boolean' ? now.sound : true;
  return explorer ? { explorers: [explorer], current: explorer.id, sound } : { explorers: [], current: null, sound };
}

const fg = connect();

// Hidden: the way back to "Who's playing?" and removing the explorer (P87). Ids from the maker's page.
const style = document.createElement('style');
style.textContent = '#m-who, #make-remove { display: none !important; }';
document.head.appendChild(style);

// Puts this child's explorer in the game's save, if it isn't there already. Returns false if the
// page is reloading so the game reads it.
function useMine() {
  const owner = read(OWNER);
  if (owner === child) return true;
  try {
    const last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null');
    if (last && last.child === child && Date.now() - last.at < 10000) return true; // just reloaded for this: never loop
    // Keep the previous child's explorer first, in case the last change wasn't copied yet.
    const theirs = inSave(read(KEY));
    if (owner && theirs) localStorage.setItem(COPY(owner), JSON.stringify(theirs));
    const mine = read(COPY(child));
    localStorage.setItem(KEY, JSON.stringify(saveWith(isExplorer(mine) ? mine : null)));
    localStorage.setItem(OWNER, JSON.stringify(child));
    sessionStorage.setItem(RELOADED, JSON.stringify({ child, at: Date.now() }));
  } catch {
    return true; // storage blocked: the game can't save either, so play on as it is
  }
  // The game still has the previous child's explorer in memory: ignore its saves until the reload (P82).
  freezeStorage();
  location.reload();
  return false;
}

// The child's progress for keep-progress (P77): their explorer, once it's the one in the game's save.
const progress = keepProgress(fg, {
  game: 'fairy-village',
  read() {
    if (read(OWNER) !== child) return null;
    const e = inSave(read(KEY));
    if (!e) return null;
    try { localStorage.setItem(COPY(child), JSON.stringify(e)); } catch { /* storage blocked */ }
    return { explorer: e };
  },
  write(p) {
    if (!p || !isExplorer(p.explorer)) throw new Error('not an explorer');
    localStorage.setItem(KEY, JSON.stringify(saveWith(p.explorer)));
    localStorage.setItem(COPY(child), JSON.stringify(p.explorer));
    localStorage.setItem(OWNER, JSON.stringify(child));
  },
});

// Straight past "Who's playing?" (P87): into the village with the child's explorer, or into
// "Make your fairy" with their name filled in. Ids and classes from the maker's page.
function goIn(name) {
  const who = document.getElementById('s-who');
  if (!who || who.hidden) return;
  const card = document.querySelector('#who-list .who-card:not(.who-new)');
  if (card) { card.click(); return; }
  const make = document.querySelector('#who-list .who-new');
  if (!make) return;
  make.click();
  const input = document.getElementById('f-name');
  if (input && !input.value && name) {
    input.value = name.slice(0, 14); // the box takes 14 letters
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Swap to this child's explorer as soon as the page opens, not after fg:start (which can wait up to
// 3 seconds for the Sheet), so the game never shows the other child's explorer (P82).
const inWrapper = child && window.parent !== window;
const ready = inWrapper ? useMine() : true;

fg.onStart((start) => {
  if (start.standalone || !ready) return; // on its own, or reloading
  if (start.sound === false) soundOff();
  if (!progress.begin(start.state)) return; // newer explorer put back: the page reloads once
  goIn(start.player && start.player.name);
});
