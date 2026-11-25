// Word Garden adapter: connects the maker's page (original.html and its sounds/, never edited) to
// the wrapper. The wrapper adds this file to the page once its HTML has been read (P67). Opened on
// its own, original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. One explorer per child (P90, like P70). The game keeps its explorers on the device: a list
//      (its own key wordGarden.players.v1: { v, players: [{ id, name, year, look }], last, pk })
//      and one save per explorer (wordGarden.player.<id>), and always opens on its own "Who's
//      playing?". Here the child has already picked themselves in the launcher, so:
//        - which explorer is theirs on this device is noted in fg.wordGarden.mine.<child>;
//        - as the page opens, the game's list is set to just that explorer (or to none, so a child
//          new to this device makes their garden first). The game reads its list as it opens, so
//          if the list had to change the page reloads once. The list's word-packet changes (pk,
//          made by a grown-up for every explorer on this browser) stay as they are;
//        - then it goes straight past "Who's playing?" into the child's garden, or, for a new
//          garden, fills in the child's name in "A new garden" (the year is still picked there);
//        - "Switch explorer" is hidden. The grown-ups' corner (the game's own code) is unchanged.
//      Other children's gardens stay saved on the device; only the game's list changes.
//   2. The garden follows the child (P77, P89): the explorer's whole save (words, beds, school
//      lists, school test results, practice tests) is the game's progress for this child, kept by
//      games/_common/keep-progress/. It is big (a new Year 2 garden is about 90,000 characters),
//      so keep-progress sends it compressed, and script 0.6.0 keeps it in the Sheet in parts.
//      The game saves after every answer and planting; changes are passed on within 2 seconds.
//   3. Sound off (P67): its recorded sounds, speech and garden noises are silent, whatever else.
// Its own Full screen button is left as it is: the wrapper's frame allows full screen, and the
// button leaves it again (as Fairy village, P87).

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';
import { keepProgress, freezeStorage } from '../_common/keep-progress/keep-progress.js';

const ROSTER = 'wordGarden.players.v1';            // the game's list of explorers
const SAVE = (id) => `wordGarden.player.${id}`;    // one explorer's save
const RELOADED = 'fg.wordGarden.reloaded';         // when this adapter last reloaded the page
const child = new URLSearchParams(location.search).get('player') || '';
const MINE = `fg.wordGarden.mine.${child}`;       // which explorer is this child's on this device

const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const saveOf = (id) => { const s = id && read(SAVE(id)); return s && s.id === id && s.name ? s : null; };
const hasExplorer = (id) => !!saveOf(id);
const roster = () => { const r = read(ROSTER); return r && Array.isArray(r.players) ? r : { v: 1, players: [], last: null }; };
const entryFor = (save) => ({ id: save.id, name: save.name, year: save.year, look: save.look });

const fg = connect();

// The game's own "Switch explorer" button is hidden: one explorer per child.
const style = document.createElement('style');
style.textContent = '#switchPlayer { display: none !important; }';
document.head.appendChild(style);

// Shows the game only this child's explorer. Returns false if the page is reloading.
function useOnlyMine(mine) {
  const save = saveOf(mine);
  const now = roster();
  const want = { ...now, players: save ? [entryFor(save)] : [], last: save ? mine : null };
  if (now.players.length === want.players.length && (!save || (now.players[0] && now.players[0].id === mine))
    && now.last === want.last) return true;
  try {
    localStorage.setItem(ROSTER, JSON.stringify(want));
    const key = JSON.stringify([want.players.map((p) => p.id), want.last]);
    const last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null');
    if (last && last.want === key && Date.now() - last.at < 10000) return true; // just reloaded for this: never loop
    sessionStorage.setItem(RELOADED, JSON.stringify({ want: key, at: Date.now() }));
  } catch {
    return true; // storage blocked: the game can't save either, so play on as it is
  }
  // The game still has the previous list in memory and saves it with every answer, which would
  // put the other explorers back: ignore its saves until the reload (P82).
  freezeStorage();
  location.reload();
  return false;
}

// Another child's explorer on this device, as noted by the adapter.
function anotherChilds(id) {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('fg.wordGarden.mine.') && k !== MINE && read(k) === id);
  } catch { return false; }
}

// A new garden: fill in the child's name when "A new garden" opens empty.
function fillName(name) {
  const modal = document.getElementById('modal');
  if (!modal || !name) return;
  const fill = () => {
    const input = document.getElementById('nameInput');
    if (input && !input.value && !input.dataset.fgFilled) { input.value = name.slice(0, 16); input.dataset.fgFilled = '1'; }
  };
  new MutationObserver(fill).observe(modal, { childList: true, subtree: true });
  fill();
}

// Straight into the child's garden: their flower on "Who's playing?", or "New explorer".
function goIn() {
  const who = document.getElementById('who');
  if (!who || !who.classList.contains('on')) return;
  const card = mine && who.querySelector(`.card[data-act="pick"][data-id="${CSS.escape(mine)}"]`);
  (card || who.querySelector('.card.new'))?.click();
}

// This child's explorer. Once the game shows only theirs, a garden the child makes (picked as it
// is made) becomes theirs.
let mine = null;
let playing = false;
function myExplorer() {
  if (playing) {
    const last = roster().last;
    // A new garden the child just made becomes theirs; never one that is another child's (P82).
    if (last && last !== mine && hasExplorer(last) && !anotherChilds(last)) setMine(last);
  }
  return hasExplorer(mine) ? mine : null;
}
function setMine(id) {
  mine = id;
  try { localStorage.setItem(MINE, JSON.stringify(id)); } catch { /* storage blocked */ }
}

// The child's progress for keep-progress (P77): their explorer's id and whole save.
const progress = keepProgress(fg, {
  game: 'word-garden',
  read() {
    const id = myExplorer();
    return id ? { explorer: id, save: read(SAVE(id)) } : null;
  },
  write(p) {
    if (!p || typeof p.explorer !== 'string' || !p.save || p.save.id !== p.explorer || !p.save.name) throw new Error('not a garden');
    localStorage.setItem(SAVE(p.explorer), JSON.stringify(p.save));
    localStorage.setItem(ROSTER, JSON.stringify({ ...roster(), players: [entryFor(p.save)], last: p.explorer }));
    setMine(p.explorer);
  },
});

// Swap to this child's explorer as soon as the page opens, if this device already knows it, rather
// than after fg:start (which can wait up to 3 seconds for the Sheet): less time showing the
// previous child's list (P82). A child new to this device is handled in onStart.
if (child && window.parent !== window && hasExplorer(read(MINE))) useOnlyMine(read(MINE));

fg.onStart((start) => {
  if (start.standalone) return; // not in the wrapper: the page runs as its maker made it
  if (start.sound === false) soundOff();
  mine = read(MINE);
  if (!progress.begin(start.state)) return; // newer progress put back: the page reloads once
  if (!useOnlyMine(myExplorer())) return;
  playing = true;
  if (myExplorer()) setMine(mine);
  else fillName(start.player && start.player.name);
  goIn();
});
