// Grown-ups' corner > Game setup: settings for one player in each game (P36).
// For now the only kind of setting is "word-lists" (Kriss Kross): an ordered set of
// lists, the first being the default. The game opens with the default list and a
// Next button moves on to the following list. Every change is saved straight to
// the Sheet's GameLists tab, so there's no separate Save step.

import * as api from './api.js';

const MIN_LEN = 2, MAX_LEN = 15, MAX_WORDS = 30, MIN_WORDS = 2, MAX_LISTS = 50;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Same clean-up the game does: accents removed, letters only, capitals.
function normal(word) {
  return Array.from(String(word).normalize('NFD').replace(/\p{M}/gu, '').toUpperCase())
    .filter((ch) => /\p{L}/u.test(ch)).join('');
}

function splitWords(text) {
  return String(text).split(/[\s,;]+/).map((w) => w.trim()).filter(Boolean);
}

// Checks a list the way Kriss Kross will. Returns { words, problems }.
function checkWords(text) {
  const words = splitWords(text);
  const seen = new Set();
  const short = [], long = [], dup = [];
  words.forEach((w) => {
    const n = normal(w);
    const len = Array.from(n).length;
    if (len < MIN_LEN) short.push(w);
    else if (len > MAX_LEN) long.push(w);
    else if (seen.has(n)) dup.push(w);
    seen.add(n);
  });
  const problems = [];
  if (short.length) problems.push(`Too short (needs ${MIN_LEN}+ letters): ${short.join(', ')}`);
  if (long.length) problems.push(`Too long (over ${MAX_LEN} letters): ${long.join(', ')}`);
  if (dup.length) problems.push(`Listed twice: ${dup.join(', ')}`);
  if (words.length > MAX_WORDS) problems.push(`${words.length} words: the most is ${MAX_WORDS}`);
  if (words.length < MIN_WORDS) problems.push(`Add at least ${MIN_WORDS} words`);
  return { words, problems };
}

let activeUnwire = null;

export async function openGameSetup(corner, player, games, back) {
  const withSettings = games.filter((g) => g.settings === 'word-lists');
  const ui = {
    gameId: withSettings.length ? withSettings[0].id : null,
    lists: [],
    editing: null,   // index being edited, or 'new'
    confirming: null, // index waiting for delete confirmation
    message: '',
    good: true,
    busy: false,
  };

  function shell(inner) {
    corner.innerHTML = `
      <div class="pad gs">
        <button class="x" type="button" data-close aria-label="Close">×</button>
        <h2 id="corner-h">Game setup: ${esc(player.nickname)}</h2>
        <div class="row" style="margin-top:4px"><button class="btn" type="button" data-gs-back>Back to grown-ups' corner</button></div>
        ${inner}
      </div>`;
  }

  if (!ui.gameId) {
    shell('<p style="margin-top:16px">None of the games has settings yet.</p>');
    wire();
    return;
  }

  shell('<p style="margin-top:16px">Loading lists…</p>');
  wire();
  try {
    await api.fetchProfile(player.profile_id);
  } catch {
    ui.message = "Couldn't reach the Sheet, so these are the lists this device last saw.";
    ui.good = false;
  }
  ui.lists = clone(api.getCachedLists(player.profile_id, ui.gameId));
  render();

  function clone(lists) {
    return lists.map((l) => ({ list_id: l.list_id, title: l.title, words: (l.words || []).slice() }));
  }

  function render() {
    const game = withSettings.find((g) => g.id === ui.gameId);
    const picker = withSettings.length > 1
      ? `<label for="gs-game">Game</label><select id="gs-game">${withSettings.map((g) =>
          `<option value="${esc(g.id)}"${g.id === ui.gameId ? ' selected' : ''}>${esc(g.title)}</option>`).join('')}</select>`
      : '';
    const items = ui.lists.map((l, i) => {
      if (ui.editing === i) return `<li class="gs-item editing">${form(l)}</li>`;
      const tools = ui.confirming === i
        ? `<span class="small">Delete “${esc(l.title)}”?</span>
           <button class="btn small danger" type="button" data-gs-del-yes="${i}">Delete</button>
           <button class="btn small" type="button" data-gs-del-no>Keep</button>`
        : `<button class="btn small" type="button" data-gs-edit="${i}">Edit</button>
           <button class="btn small" type="button" data-gs-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move “${esc(l.title)}” up">Up</button>
           <button class="btn small" type="button" data-gs-down="${i}" ${i === ui.lists.length - 1 ? 'disabled' : ''} aria-label="Move “${esc(l.title)}” down">Down</button>
           ${i === 0 ? '' : `<button class="btn small" type="button" data-gs-default="${i}">Make default</button>`}
           <button class="btn small" type="button" data-gs-del="${i}">Delete</button>`;
      return `
        <li class="gs-item">
          <div class="gs-top"><span class="gs-num">${i + 1}</span><strong>${esc(l.title)}</strong>
            ${i === 0 ? '<span class="gs-tag">Default</span>' : ''}<span class="small">${plural(l.words.length, 'word')}</span></div>
          <p class="small gs-words">${esc(l.words.join(', '))}</p>
          <div class="row">${tools}</div>
        </li>`;
    }).join('');

    shell(`
      ${picker}
      <h3>${esc(game.title)}: word lists</h3>
      <p class="small">The game opens with the default list (number 1). When ${esc(player.nickname)} finishes a puzzle, <strong>Next list</strong> loads the next one in this order. Changes save to the Sheet straight away.</p>
      <p class="msg ${ui.good ? 'good' : 'bad'}" role="status">${esc(ui.message)}</p>
      ${ui.lists.length ? `<ol class="gs-lists">${items}</ol>` : `<p>No lists yet, so ${esc(player.nickname)} sees the game's own word screen.</p>`}
      ${ui.editing === 'new' ? `<div class="gs-item editing">${form({ title: '', words: [] })}</div>`
        : `<div class="row"><button class="btn primary" type="button" data-gs-add ${ui.lists.length >= MAX_LISTS || ui.busy ? 'disabled' : ''}>Add a list</button></div>`}
    `);
    corner.querySelectorAll('.gs button').forEach((b) => { if (ui.busy && !b.matches('[data-close]')) b.disabled = true; });
    const ta = corner.querySelector('#gs-words');
    if (ta) {
      updateCheck();
      ta.addEventListener('input', updateCheck);
      (ui.editing === 'new' ? corner.querySelector('#gs-title') : ta).focus();
    }
  }

  function form(l) {
    return `
      <form id="gs-form">
        <label for="gs-title">List name</label>
        <input id="gs-title" type="text" maxlength="40" value="${esc(l.title)}" placeholder="For example: Week 3 spellings">
        <label for="gs-words">Words (one per line, or separated by commas)</label>
        <textarea id="gs-words" rows="7" spellcheck="false" autocapitalize="off">${esc(l.words.join('\n'))}</textarea>
        <p class="small" id="gs-check" role="status"></p>
        <div class="row">
          <button class="btn primary" type="submit">${ui.editing === 'new' ? 'Add list' : 'Save list'}</button>
          <button class="btn" type="button" data-gs-cancel>Cancel</button>
        </div>
      </form>`;
  }

  function updateCheck() {
    const { words, problems } = checkWords(corner.querySelector('#gs-words').value);
    const out = corner.querySelector('#gs-check');
    out.className = 'small' + (problems.length ? ' bad' : ' good');
    out.innerHTML = problems.length ? problems.map(esc).join('<br>') : `${plural(words.length, 'word')} ready.`;
    corner.querySelector('#gs-form [type=submit]').disabled = problems.length > 0;
  }

  async function commit(next, done) {
    const before = ui.lists;
    ui.lists = next;
    ui.busy = true;
    ui.message = 'Saving…';
    ui.good = true;
    render();
    try {
      ui.lists = clone(await api.saveLists(player.profile_id, ui.gameId, next.map((l) => ({ list_id: l.list_id, title: l.title, words: l.words }))));
      ui.message = done;
      ui.good = true;
    } catch (err) {
      ui.lists = before;
      const m = String(err.message || err);
      ui.message = /unknown_action|missing_tab_GameLists/.test(m)
        ? 'Lists need the new Apps Script (version 0.3.0). See docs/setup-sheet.md, then try again.'
        : `Couldn't save, so nothing changed: ${m}`;
      ui.good = false;
    }
    ui.busy = false;
    render();
  }

  // Only one Game setup screen listens at a time; closing the corner (× or Esc) stops it.
  function wire() {
    if (activeUnwire) activeUnwire();
    corner.addEventListener('click', onClick);
    corner.addEventListener('submit', onSubmit);
    corner.addEventListener('change', onChange);
    corner.addEventListener('close', unwire);
    activeUnwire = unwire;
  }

  function unwire() {
    corner.removeEventListener('click', onClick);
    corner.removeEventListener('submit', onSubmit);
    corner.removeEventListener('change', onChange);
    corner.removeEventListener('close', unwire);
    if (activeUnwire === unwire) activeUnwire = null;
  }

  function onChange(e) {
    if (e.target.id !== 'gs-game') return;
    ui.gameId = e.target.value;
    ui.lists = clone(api.getCachedLists(player.profile_id, ui.gameId));
    ui.editing = ui.confirming = null;
    ui.message = '';
    render();
  }

  function onSubmit(e) {
    if (e.target.id !== 'gs-form') return;
    e.preventDefault();
    const { words, problems } = checkWords(corner.querySelector('#gs-words').value);
    if (problems.length) return;
    const title = corner.querySelector('#gs-title').value.trim() || `List ${ui.lists.length + 1}`;
    const next = clone(ui.lists);
    if (ui.editing === 'new') next.push({ title, words });
    else next[ui.editing] = { ...next[ui.editing], title, words };
    const wasNew = ui.editing === 'new';
    ui.editing = null;
    commit(next, wasNew ? `Added “${title}”.` : `Saved “${title}”.`);
  }

  function onClick(e) {
    const t = e.target.closest('button');
    if (!t || ui.busy) return;
    const d = t.dataset;
    const move = (from, to) => { const next = clone(ui.lists); const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; };

    if ('gsBack' in d) { unwire(); back(); return; }
    if ('gsAdd' in d) { ui.editing = 'new'; ui.confirming = null; ui.message = ''; render(); return; }
    if ('gsCancel' in d) { ui.editing = null; render(); return; }
    if (d.gsEdit !== undefined) { ui.editing = Number(d.gsEdit); ui.confirming = null; ui.message = ''; render(); return; }
    if (d.gsUp !== undefined) { const i = Number(d.gsUp); commit(move(i, i - 1), 'Moved up.'); return; }
    if (d.gsDown !== undefined) { const i = Number(d.gsDown); commit(move(i, i + 1), 'Moved down.'); return; }
    if (d.gsDefault !== undefined) { const i = Number(d.gsDefault); commit(move(i, 0), `“${ui.lists[i].title}” is now the default.`); return; }
    if (d.gsDel !== undefined) { ui.confirming = Number(d.gsDel); ui.editing = null; render(); return; }
    if ('gsDelNo' in d) { ui.confirming = null; render(); return; }
    if (d.gsDelYes !== undefined) {
      const i = Number(d.gsDelYes);
      const title = ui.lists[i].title;
      ui.confirming = null;
      commit(ui.lists.filter((_, j) => j !== i), `Deleted “${title}”.`);
    }
  }
}
