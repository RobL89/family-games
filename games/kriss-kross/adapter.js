// Kriss Kross adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. Lists (P36, P38, P56): the child's lists come in fg:start, default first. The default list
//      is built straight away; "Next list" appears when a puzzle is solved or its solution shown.
//   2. The child's own lists (P66): a list the child types and builds is saved per child (the last
//      five) in the game's state, sent to the wrapper with fg:state and handed back next time.
//      "Your lists" on the word screen holds both: the grown-ups' lists and the child's own.
//   3. Printing (proposed): a Print button on the print screen prints just this page, because the
//      browser's own print command would print the whole wrapper.
//   4. A solved puzzle is reported with fg:round, stars as P30 (no hints 3, one or two 2, more 1;
//      "Show solution" reports nothing). The wrapper ignores it while stars are switched off (P48).
// The game makes no sound, so sound off needs nothing here.

import { connect } from '../../shared/bridge.js';

const MAX_OWN = 5;        // own lists kept per child (P66)
const MAX_WORDS = 30;     // the game's own limits, from its word screen
const MAX_TITLE = 40;

const $ = (id) => document.getElementById(id);
const words = (text) => String(text || '').split(/[\s,;]+/).map((w) => w.trim()).filter(Boolean).slice(0, MAX_WORDS);
const sameWords = (a, b) => a.length === b.length && a.every((w, i) => w.toLowerCase() === String(b[i]).toLowerCase());

const fg = connect();
let grown = [];          // the grown-ups' lists from the Sheet: [{ title, words }]
let own = [];            // this child's own lists, newest first
let index = -1;          // which grown-ups' list is on screen, or -1
let building = false;    // true while the adapter itself presses Build
let round = { hints: 0, revealed: false, reported: false, t0: Date.now() }; // this puzzle so far (P30)
const newRound = () => { round = { hints: 0, revealed: false, reported: false, t0: Date.now() }; };

// ---- "Your lists" card, at the top of the word screen ----
const card = document.createElement('section');
card.className = 'card';
card.dataset.fg = 'lists';
card.setAttribute('aria-label', 'Your lists');
card.style.marginBottom = '18px';
card.hidden = true;
$('setup').querySelector('.intro').after(card);

function listButton(list, onPick, primary) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = primary ? 'btn small' : 'btn small ghost';
  b.textContent = list.title || list.words.slice(0, 3).join(' ');
  b.addEventListener('click', onPick);
  return b;
}

function drawCard() {
  card.replaceChildren();
  const add = (label, lists, pick, primary) => {
    if (!lists.length) return;
    const lab = document.createElement('p');
    lab.className = 'lab';
    lab.textContent = label;
    const row = document.createElement('div');
    row.className = 'row';
    lists.forEach((l, i) => row.append(listButton(l, () => pick(i), primary)));
    card.append(lab, row);
  };
  add('Lists from grown-ups', grown, (i) => startList(i), true);
  add('Lists you made', own, (i) => build(own[i].title, own[i].words, -1), false);
  card.hidden = !grown.length && !own.length;
}

// ---- Building a list: fill the game's own word screen and press its Build button ----
function build(title, list, i) {
  index = i;
  next.hidden = true;
  $('puzzleTitle').value = String(title || '').slice(0, MAX_TITLE);
  $('wordInput').value = list.join('\n');
  $('puzzleTitle').dispatchEvent(new Event('input', { bubbles: true }));
  $('wordInput').dispatchEvent(new Event('input', { bubbles: true }));
  building = true;
  $('buildBtn').click();
  building = false;
}

function startList(i) {
  const list = grown[i];
  if (list) build(list.title, list.words, i);
}

// ---- The child builds their own words: keep them (P66) ----
$('buildBtn').addEventListener('click', () => {
  if (building) return;
  const list = words($('wordInput').value);
  if (list.length < 2) return;
  index = grown.findIndex((g) => sameWords(g.words, list));
  if (index >= 0) return; // a grown-ups' list, unchanged
  let title = $('puzzleTitle').value.trim().slice(0, MAX_TITLE);
  if (!title || grown.some((g) => g.title.toLowerCase() === title.toLowerCase())) title = 'My words'; // not a grown-ups' list's name
  own = [{ title, words: list }, ...own.filter((l) => !sameWords(l.words, list))].slice(0, MAX_OWN);
  fg.saveState({ v: 1, own });
  drawCard();
}, true);

// ---- Next list, at the front of the puzzle's toolbar ----
const next = document.createElement('button');
next.type = 'button';
next.className = 'btn small primary';
next.dataset.fg = 'next';
next.hidden = true;
$('play').querySelector('.bar-right').prepend(next);
next.addEventListener('click', () => startList(index + 1));

function roundOver() {
  if (!round.revealed && !round.reported) {
    round.reported = true;
    const stars = round.hints === 0 ? 3 : round.hints <= 2 ? 2 : 1;
    fg.roundOver({ stars, seconds: (Date.now() - round.t0) / 1000 });
  }
  if (index < 0 || index + 1 >= grown.length) return;
  next.textContent = `Next list: ${grown[index + 1].title || 'next'}`;
  next.hidden = false;
}
// The game marks a solved grid with the class "solved"; "Show solution" also ends the round (P38).
new MutationObserver(() => { if ($('grid').classList.contains('solved')) roundOver(); })
  .observe($('grid'), { attributes: true, attributeFilter: ['class'] });
$('solBtn').addEventListener('click', () => { round.revealed = true; setTimeout(roundOver, 0); }, true);
$('hintBtn').addEventListener('click', () => { round.hints += 1; }, true);
['buildBtn', 'newBtn', 'resetBtn'].forEach((id) => $(id).addEventListener('click', newRound, true));

// ---- Print just this page (proposed) ----
const print = document.createElement('button');
print.type = 'button';
print.className = 'btn primary';
print.dataset.fg = 'print';
print.textContent = 'Print';
print.addEventListener('click', () => window.print());
$('dlBtn').before(print);

// ---- Start ----
fg.onStart((start) => {
  if (start.standalone) return; // not in the wrapper: the page runs as its maker made it
  grown = (start.lists || []).filter((l) => l && Array.isArray(l.words) && l.words.length >= 2)
    .map((l) => ({ title: String(l.title || ''), words: l.words.map(String).slice(0, MAX_WORDS) }));
  const saved = start.state && Array.isArray(start.state.own) ? start.state.own : [];
  own = saved.filter((l) => l && Array.isArray(l.words) && l.words.length >= 2)
    .map((l) => ({ title: String(l.title || '').slice(0, MAX_TITLE), words: l.words.map(String).slice(0, MAX_WORDS) }))
    .slice(0, MAX_OWN);
  drawCard();
  if (grown.length) startList(0); // each child starts with their default list (P38)
});
