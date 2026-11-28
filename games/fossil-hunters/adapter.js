// Fossil Hunters adapter: connects the maker's page (original.html and its files, never edited) to
// the wrapper. The wrapper adds this file to the page once its HTML has been read (P67). Opened on
// its own, original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. One explorer per child (P93, like P70 and P87). The game keeps its list of explorers on the
//      device (fossilHunters.players.v1: { v, list: [{ id, name, badge }], last }), each explorer's
//      save under its own key (fossilHunters.player.<id>), and always opens on "Who's digging?".
//      Here the child has already picked themselves in the launcher, so:
//        - as the page opens, the adapter makes the game's list hold only this child's explorer (or
//          none, so a child new to this device makes theirs first) and reloads the page once if it
//          had to change it, because the game reads the list as it opens. Which explorer is the
//          child's is noted on the device (fg.fossilHunters.mine.<child>); other explorers' saves
//          stay on the device, out of the list;
//        - then it goes straight past "Who's digging?": into the child's explorer, or onto "New
//          explorer" with their name filled in (the child picks a badge and taps Start exploring);
//        - "Switch explorer" (Field Guide) and "Remove an explorer" are hidden.
//      A new explorer becomes the child's when it's made, unless another child already has it.
//   2. The explorer follows the child (P77): their explorer (name, badge) and its whole save
//      (skeletons, finds, digs, site) are the game's progress for this child, kept by
//      games/_common/keep-progress/, so they go to the Sheet and are put back on any device where
//      they're newer (P78). The game saves at every find, placed bone and dig; changes are passed
//      on within 2 seconds.
//   3. Sound off (P67): its dig sounds and Read to me are silent, whatever its Sound button says.
// Its 3D museum is hidden by its maker for now; three.js comes with it (lib/three.min.js).

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';
import { keepProgress, freezeStorage } from '../_common/keep-progress/keep-progress.js';

const LIST = 'fossilHunters.players.v1';                 // the game's list: { v, list, last }
const SAVE = (id) => `fossilHunters.player.${id}`;        // the game's save for one explorer
const MINE = (child) => `fg.fossilHunters.mine.${child}`; // which explorer is this child's, on this device
const RELOADED = 'fg.fossilHunters.reloaded';             // sessionStorage: when this adapter last reloaded
const child = new URLSearchParams(location.search).get('player') || '';

const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const isId = (id) => typeof id === 'string' && id.length > 0 && id.length < 60;
const isSave = (s) => !!(s && typeof s === 'object' && typeof s.name === 'string');
// An explorer's list entry, from its save (the save holds its name and badge).
const entryFor = (id, save) => ({ id, name: save.name, badge: save.badge });

// Is this explorer another child's on this device?
function othersHave(id) {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('fg.fossilHunters.mine.')
      && k !== MINE(child) && read(k) === id);
  } catch { return false; }
}

const fg = connect();

// Hidden: switching and removing explorers (P93). Ids from the maker's page.
const style = document.createElement('style');
style.textContent = '#gWho, #whoEdit, #whoCancel { display: none !important; }';
document.head.appendChild(style);

// Makes the game's list hold only this child's explorer (or none). Returns false if the page is
// reloading so the game reads it.
function useMine() {
  try {
    const mine = read(MINE(child));
    const save = isId(mine) ? read(SAVE(mine)) : null;
    const want = isSave(save) ? [mine] : [];
    const now = read(LIST);
    const have = now && Array.isArray(now.list) ? now.list.map((p) => p && p.id) : [];
    if (JSON.stringify(have) === JSON.stringify(want)) return true;
    const last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null');
    if (last && last.child === child && Date.now() - last.at < 10000) return true; // just reloaded for this: never loop
    localStorage.setItem(LIST, JSON.stringify(want.length
      ? { v: 1, list: [entryFor(mine, save)], last: mine }
      : { v: 1, list: [], last: null }));
    sessionStorage.setItem(RELOADED, JSON.stringify({ child, at: Date.now() }));
  } catch {
    return true; // storage blocked: the game can't save either, so play on as it is
  }
  freezeStorage(); // the game still has the old list in memory: ignore its saves until the reload (P82)
  location.reload();
  return false;
}

// The child's progress for keep-progress (P77): their explorer and its save, once it's in the list.
const progress = keepProgress(fg, {
  game: 'fossil-hunters',
  read() {
    const list = read(LIST);
    const id = list && list.last;
    if (!isId(id) || !Array.isArray(list.list) || !list.list.some((p) => p && p.id === id)) return null;
    const save = read(SAVE(id));
    if (!isSave(save)) return null;
    const mine = read(MINE(child));
    if (mine !== id) {
      // A new explorer, made by this child here: theirs, unless their own is still on the device
      // or another child has it.
      if ((isId(mine) && isSave(read(SAVE(mine)))) || othersHave(id)) return null;
      try { localStorage.setItem(MINE(child), JSON.stringify(id)); } catch { return null; }
    }
    return { explorer: entryFor(id, save), save };
  },
  write(p) {
    if (!p || !p.explorer || !isId(p.explorer.id) || !isSave(p.save)) throw new Error('not an explorer');
    const id = p.explorer.id;
    localStorage.setItem(SAVE(id), JSON.stringify(p.save));
    localStorage.setItem(LIST, JSON.stringify({ v: 1, list: [entryFor(id, p.save)], last: id }));
    localStorage.setItem(MINE(child), JSON.stringify(id));
  },
});

// Straight past "Who's digging?" (P93), once the game shows it (after its pictures have loaded):
// into the child's explorer, or "New explorer" with their name filled in. Ids from the maker's page.
function goIn(name) {
  const since = Date.now();
  const timer = setInterval(() => {
    const who = document.getElementById('who');
    if (Date.now() - since > 30000) { clearInterval(timer); return; }
    if (!who || !who.classList.contains('on')) return;
    clearInterval(timer);
    const tile = document.querySelector('#whoList .whoTile[data-id]');
    if (tile) { tile.click(); return; }
    const input = document.getElementById('whoName');
    if (input && !input.value && name) {
      input.value = name.slice(0, 14); // the box takes 14 letters
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, 100);
}

// Swap to this child's explorer as soon as the page opens, not after fg:start (which can wait up to
// 3 seconds for the Sheet), so the game never shows another child's explorer (P82).
const inWrapper = child && window.parent !== window;
const ready = inWrapper ? useMine() : true;

fg.onStart((start) => {
  if (start.standalone || !ready) return; // on its own, or reloading
  if (start.sound === false) soundOff();
  if (!progress.begin(start.state)) return; // newer explorer put back: the page reloads once
  goIn(start.player && start.player.name);
});
