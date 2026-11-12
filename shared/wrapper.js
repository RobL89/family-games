// The wrapper (P50): runs one game in a frame under a slim bar with ⌂ Home and the child's face.
// Messages follow game contract 0.4, section 5 (GC1); the game's side is shared/bridge.js.
//
// What it does:
//   1. Reads ?game=<id>&player=<id>. An unknown game or child goes back to the launcher.
//   2. Finds the game's page: "page" in games/<id>/game.json, or index.html if there's no game.json.
//   3. Starts listening, then opens the game in the frame (listening first, so fg:ready is never missed).
//   4. On fg:ready, sends fg:start: who's playing, sound on or off, word lists (if the game asks
//      for "word-lists"), the game's saved state for this child, and level null (GC3).
//   5. On fg:state, keeps the game's state for this child on this device (P51), until script 0.4.0
//      saves it in the Sheet's Settings tab.
//   6. fg:round is ignored while stars are switched off (P48).

import { CONFIG } from './config.js';
import * as api from './api.js';
import { injectIcons, icon } from './icons.js';
import { injectAvatars, avatarSVG } from './avatars.js';
import { DEFAULT_SKIN, applySkin } from './skins.js';
import * as sound from './sound.js';

const VERSION = 1;
const MAX_STATE = 20000; // characters of JSON (contract section 5)
const STATE_KEY = (pid, gameId) => `fg.state.${pid}.${gameId}`; // a game's saved state, per child (P51)
const LOCAL_SKIN = (pid) => 'fg.skin.' + pid; // same key as the launcher's
const on = (name) => !CONFIG.features || CONFIG.features[name] !== false;

const params = new URLSearchParams(location.search);
const gameId = params.get('game') || '';
const pid = params.get('player') || '';
const launcher = () => `index.html${pid ? `?player=${encodeURIComponent(pid)}` : ''}`;

// ---- Saved state per child (on this device until script 0.4.0) ----

export function loadState(playerId, id) {
  const saved = api.loadLocal(STATE_KEY(playerId, id), null);
  return saved && 'state' in saved ? saved.state : null;
}

function saveState(playerId, id, state) {
  const json = JSON.stringify(state ?? null);
  if (json.length > MAX_STATE) return false; // too big: the game keeps its own copy (contract section 5)
  return api.saveLocal(STATE_KEY(playerId, id), { state: JSON.parse(json), at: new Date().toISOString() });
}

// ---- The game and the child ----

async function loadJSON(url) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

function childSkin(p) {
  const local = api.loadLocal(LOCAL_SKIN(p.profile_id), null);
  return (local && local.skin) || p.skin || DEFAULT_SKIN; // skins are free (P49)
}

function wantsLists(entry, manifest) {
  const s = [].concat((manifest && manifest.settings) || [], (entry && entry.settings) || []);
  return s.includes('word-lists');
}

// The child's lists, default first, as [{ title, words }]. Until script 0.4.0 the Sheet keeps
// them per game, so this game's own lists are used if it has any, otherwise the first set this
// child has for any game: one set per child, as P56 will make it (P61).
function listsFor(playerId, id) {
  const clean = (lists) => (lists || [])
    .filter((l) => l && Array.isArray(l.words) && l.words.length)
    .map((l) => ({ title: String(l.title || ''), words: l.words.map(String) }));
  const own = clean(api.getCachedLists(playerId, id));
  if (own.length) return own;
  const cached = api.getCachedProfile(playerId);
  const all = (cached && cached.lists) || {};
  for (const key of Object.keys(all).sort()) {
    const set = clean(all[key]);
    if (set.length) return set;
  }
  return [];
}

async function start() {
  injectIcons();
  injectAvatars();
  const homeLink = document.getElementById('home');
  homeLink.innerHTML = icon('i-home');
  homeLink.href = launcher();
  homeLink.addEventListener('click', () => sound.play('tap'));

  const list = await loadJSON('games.json');
  const entry = list && Array.isArray(list.games) ? list.games.find((g) => g.id === gameId) : null;
  const player = api.getCachedProfiles().find((p) => p.profile_id === pid) || null;
  if (!entry || !['ready', 'testing'].includes(entry.status) || !/^[\w-]+$/.test(gameId) || !player) {
    location.replace(launcher());
    return;
  }

  applySkin(childSkin(player));
  document.title = entry.title || 'Family games';
  const face = document.getElementById('face');
  face.innerHTML = `<span class="disc">${avatarSVG(player.avatar)}</span>`;
  face.style.setProperty('--c', player.colour || '#F07A2A');
  face.hidden = false;
  document.getElementById('name').textContent = player.nickname || '';

  const folder = `games/${gameId}/`;
  const manifest = await loadJSON(`${folder}game.json`);
  const page = (manifest && typeof manifest.page === 'string' && /^[\w./-]+$/.test(manifest.page) && !manifest.page.includes('..'))
    ? manifest.page : 'index.html';

  const frame = document.createElement('iframe');
  frame.title = entry.title || 'Game';
  frame.allow = 'autoplay; fullscreen';

  // Listen before the game opens, so its fg:ready can't be missed.
  window.addEventListener('message', (e) => {
    if (e.source !== frame.contentWindow || e.origin !== location.origin) return;
    const m = e.data;
    if (!m || m.v !== VERSION) return;
    if (m.type === 'fg:ready') {
      frame.contentWindow.postMessage({
        type: 'fg:start',
        v: VERSION,
        player: { name: player.nickname || '', animal: player.avatar || '', colour: player.colour || '' },
        sound: !sound.isMuted(),
        lists: wantsLists(entry, manifest) ? listsFor(pid, gameId) : [],
        settings: {},
        state: loadState(pid, gameId),
        level: null,
      }, location.origin);
    } else if (m.type === 'fg:state') {
      saveState(pid, gameId, m.state);
    } else if (m.type === 'fg:round' && on('stars')) {
      // Stars switched back on: the round goes into the outbox like the old game kit's.
      const stars = Math.max(1, Math.min(3, Math.round(Number(m.stars) || 1)));
      api.queueResult({ profile_id: pid, game_id: gameId, score: Number(m.score) || 0, level: 1, stars, seconds: Math.round(Number(m.seconds) || 0) });
    }
  });

  frame.src = `${folder}${page}?player=${encodeURIComponent(pid)}`;
  document.getElementById('frame').appendChild(frame);
  frame.focus();
}

start();
