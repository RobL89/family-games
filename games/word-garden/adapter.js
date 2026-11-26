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
//   4. School lists and tests from the Sheet (P91; game.json asks for "school-lists"): the child's
//      rows from the School lists and School tests tabs come in fg:start's settings.school. Each one
//      the garden doesn't have yet goes in through the game's own way in (window.WordGarden), as if
//      typed in its grown-ups' corner: a list arrives as a seed packet; a test (its missed words, the
//      rest right) is matched to the list set on that day. Then, and every few seconds while the
//      game is open, what the garden holds (including lists and tests entered in the game itself)
//      is reported back with fg:school, for the Sheet's status and result columns and new rows.
//      A row the game can't take (a Reception garden, a missed word not on the list) is reported
//      with the reason. Nothing reaches a child with no garden yet: their rows wait.
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

// ---- School lists and tests (P91) ----
const WG = () => window.WordGarden;
const lower = (w) => String(w).toLowerCase();
const niceDay = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? `${m[3]}/${m[2]}/${m[1]}` : d; };
let school = null;         // the child's rows from the Sheet, from fg:start
let delivered = null;      // the garden they were delivered to
const problems = new Map(); // Sheet id -> why the game couldn't take it
const sheetTest = new Map(); // "<list id>|<taken>" -> the Sheet's id for that test
let lastReport = null;

// Puts the Sheet's lists and tests the garden doesn't have yet into it.
function deliverSchool(id) {
  const api = WG();
  if (!school || !api || delivered === id) return;
  delivered = id;
  problems.clear();
  const have = new Set((api.schoolLists(id) || []).map((L) => L.id));
  school.lists.forEach((L) => {
    if (have.has(L.id)) return;
    const r = api.addSchoolList(id, { id: L.id, set: L.set, words: L.words });
    if (!r || !r.ok) problems.set(L.id, { kind: 'list', why: (r && r.error) || 'the game did not take it' });
  });
  const lists = api.schoolLists(id) || [];
  school.tests.forEach((T) => {
    const on = lists.filter((L) => L.set === T.list_set);
    if (on.length !== 1) {
      problems.set(T.id, { kind: 'test', why: on.length ? `more than one list set on ${niceDay(T.list_set)}` : `no list set on ${niceDay(T.list_set)} in the garden` });
      return;
    }
    const L = on[0];
    const missed = new Set(T.missed.map(lower));
    const unknown = T.missed.filter((w) => !L.words.some((e) => lower(e.w) === lower(w)));
    if (unknown.length) { problems.set(T.id, { kind: 'test', why: `not on that list: ${unknown.join(', ')}` }); return; }
    sheetTest.set(`${L.id}|${T.taken}`, T.id);
    const results = L.words.map((e) => !missed.has(lower(e.w)));
    const same = (api.schoolTests(id) || []).find((x) => x.list === L.id && x.taken === T.taken);
    if (same && same.results.length === results.length && same.results.every((x, i) => x.ok === results[i])) return;
    const r = api.recordSchoolTest(id, { id: T.id, list: L.id, taken: T.taken, results });
    if (!r || !r.ok) problems.set(T.id, { kind: 'test', why: (r && r.error) || 'the game did not take it' });
  });
}

// Reports what the garden holds now, with the Sheet's rows it couldn't take; only when it changed.
function reportSchool() {
  const api = WG();
  const id = myExplorer();
  if (!api || !playing) return;
  if (id) deliverSchool(id);
  const lists = id ? (api.schoolLists(id) || []).map((L) => ({ id: L.id, set: L.set, words: L.words.map((e) => e.w), planted: L.planted || null })) : [];
  const tests = id ? (api.schoolTests(id) || []).map((t) => ({
    id: sheetTest.get(`${t.list}|${t.taken}`) || t.id, list: t.list, taken: t.taken,
    missed: t.results.filter((x) => x.ok === false).map((x) => x.w),
    right: t.results.filter((x) => x.ok === true).length, total: t.results.length,
  })) : [];
  problems.forEach((p, pid) => (p.kind === 'list' ? lists : tests).push({ id: pid, problem: p.why }));
  const report = { lists, tests };
  const json = JSON.stringify(report);
  if (json === lastReport || (!lists.length && !tests.length)) return;
  if (fg.saveSchool(report)) lastReport = json;
}

fg.onStart((start) => {
  if (start.standalone) return; // not in the wrapper: the page runs as its maker made it
  if (start.sound === false) soundOff();
  mine = read(MINE);
  if (!progress.begin(start.state)) return; // newer progress put back: the page reloads once
  if (!useOnlyMine(myExplorer())) return;
  playing = true;
  if (myExplorer()) setMine(mine);
  else fillName(start.player && start.player.name);
  const s = start.settings && start.settings.school;
  school = s && Array.isArray(s.lists) && Array.isArray(s.tests) ? s : null;
  reportSchool(); // delivers the Sheet's rows first, before the game shows the garden
  goIn();
  setInterval(reportSchool, 3000);
});
