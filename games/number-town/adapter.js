// Number Town adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. One explorer per child (P70). The game keeps its explorers on the device (its own keys
//      numberTown.players.v1 and numberTown.player.<id>) and shows its own "Who's playing?" when
//      there are two or more. Here the child has already picked themselves in the launcher, so the
//      adapter shows the game only this child's explorer:
//        - which explorer is theirs is the game's state for this child (fg:state, { explorer: id });
//        - before the game starts, the game's list of explorers is set to just that one (or to none,
//          so a child without one makes their explorer first, with their name filled in);
//        - the game reads its list as it opens, so if the list had to change the page reloads once;
//        - "Switch explorer" is hidden. "Change my look" stays, so the child can still edit it all.
//      Other children's explorers stay saved on the device; only the game's list changes.
//   2. Sound off (P67): its beeps are silent, whatever its own Sound setting says.

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';

const ROSTER = 'numberTown.players.v1';            // the game's list of explorers: { current, ids }
const SAVE = (id) => `numberTown.player.${id}`;    // one explorer's save
const RELOADED = 'fg.numberTown.reloaded';         // when this adapter last reloaded the page

const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const hasExplorer = (id) => { const s = id && read(SAVE(id)); return !!(s && s.look); };

const fg = connect();

// The game's own "Switch explorer" button is hidden: one explorer per child.
const style = document.createElement('style');
style.textContent = '#switchPlayer { display: none !important; }';
document.head.appendChild(style);

// Shows the game only this child's explorer. Returns false if the page is reloading.
function useOnlyMine(mine) {
  const want = hasExplorer(mine) ? { current: mine, ids: [mine] } : { current: null, ids: [] };
  const now = read(ROSTER) || { current: null, ids: [] };
  if (now.current === want.current && JSON.stringify(now.ids) === JSON.stringify(want.ids)) return true;
  try {
    localStorage.setItem(ROSTER, JSON.stringify(want));
    const key = JSON.stringify(want);
    const last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null');
    if (last && last.want === key && Date.now() - last.at < 10000) return true; // just reloaded for this: never loop
    sessionStorage.setItem(RELOADED, JSON.stringify({ want: key, at: Date.now() }));
  } catch {
    return true; // storage blocked: the game can't save either, so play on as it is
  }
  location.reload();
  return false;
}

// A new explorer: fill in the child's name when "Make your explorer" opens empty.
function fillName(name) {
  const maker = document.getElementById('maker');
  const input = document.getElementById('nameInput');
  if (!maker || !input || !name) return;
  const fill = () => { if (!maker.hidden && !input.value) input.value = name.slice(0, 12); };
  new MutationObserver(fill).observe(maker, { attributes: true, attributeFilter: ['hidden'] });
  fill();
}

// Notices the explorer the child makes (the game saves it when Go is pressed) and keeps its id.
function watchForNew(mine) {
  let known = mine;
  setInterval(() => {
    const r = read(ROSTER);
    const id = r && r.current;
    if (id && id !== known && hasExplorer(id)) {
      known = id;
      fg.saveState({ explorer: id });
    }
  }, 1500);
}

fg.onStart((start) => {
  if (start.standalone) return; // not in the wrapper: the page runs as its maker made it
  if (start.sound === false) soundOff();
  const mine = start.state && typeof start.state.explorer === 'string' ? start.state.explorer : null;
  if (!useOnlyMine(mine)) return;
  if (!hasExplorer(mine)) fillName(start.player && start.player.name);
  watchForNew(hasExplorer(mine) ? mine : null);
});
