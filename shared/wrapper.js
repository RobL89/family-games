// The wrapper (P50): runs one game in a frame under a slim bar with ⌂ Home and the child's face.
// Messages follow game contract 0.4, section 5 (GC1); the game's side is shared/bridge.js.
//
// What it does:
//   1. Reads ?game=<id>&player=<id>. An unknown game or child goes back to the launcher.
//   2. Finds the game's page: "page" in games/<id>/game.json, or index.html if there's no game.json.
//   3. Starts listening, then opens the game in the frame (listening first, so fg:ready is never missed).
//   4. On fg:ready, sends fg:start: who's playing, sound on or off, word lists (if the game asks
//      for "word-lists"), the game's saved state for this child, and level null (GC3).
//   5. On fg:state, keeps the game's state for this child on this device, then sends it to the
//      Sheet's Settings tab (P51, script 0.4.0), so it follows the child to another device. When
//      it's sent (P78): within 30 seconds of a change, never more often; and at once on ⌂ Home or
//      when the page is hidden (screen off, another app, tab closed). The newest save wins, here
//      and in the Sheet. There's no Save button (P79): saving needs nothing from the child.
//      An artifact game whose adapter uses games/_common/keep-progress/ also gets its latest save
//      taken on the way out, through the page's fgSaveNow() (P77).
//   6. fg:round is ignored while stars are switched off (P48).
//   7. An artifact game's adapter (game.json "adapter", contract section 2): the maker's page is never
//      edited, so the wrapper adds the adapter to the page in the frame as soon as its HTML has been
//      read, and again if the page reloads (P67). The adapter then talks through bridge.js like any game.

import { CONFIG } from './config.js';
import * as api from './api.js';
import { injectIcons, icon } from './icons.js';
import { injectAvatars, avatarSVG } from './avatars.js';
import { DEFAULT_SKIN, applySkin } from './skins.js';
import * as sound from './sound.js';

const VERSION = 1;
const SEND_EVERY = 30000;  // ms: at most one send to the Sheet this often while playing (P78)
const SEND_FIRST = 2000;   // ms: a first change waits this long, so a burst of changes goes as one
const WAIT_FOR_SHEET = 3000; // ms: the most the game's start waits for that re-read; keep it well
                            // under the bridge's WAIT_MS (5 s), or games start on their own (P81)
const LOCAL_SKIN = (pid) => 'fg.skin.' + pid; // same key as the launcher's
const on = (name) => !CONFIG.features || CONFIG.features[name] !== false;

const params = new URLSearchParams(location.search);
const gameId = params.get('game') || '';
const pid = params.get('player') || '';
const launcher = () => `index.html${pid ? `?player=${encodeURIComponent(pid)}` : ''}`;

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

const safeFile = (f) => typeof f === 'string' && /^[\w./-]+$/.test(f) && !f.includes('..');

// Adds the adapter script to the game's page (P67). The frame is on the same site, so the wrapper
// may reach into it. It waits until the page's HTML has been read (its scripts have run, but
// nothing has been tapped yet), checking every 25 ms for up to 20 seconds, and adds it again
// after a reload. The script's address is relative to the page, so it's games/<id>/<adapter>.
function addAdapter(frame, file) {
  const add = () => {
    let doc;
    try { doc = frame.contentDocument; } catch { return false; }
    if (!doc || doc.URL === 'about:blank' || doc.readyState === 'loading' || !doc.documentElement) return false;
    if (doc.querySelector('script[data-fg-adapter]')) return true;
    const s = doc.createElement('script');
    s.type = 'module';
    s.src = file;
    s.dataset.fgAdapter = '';
    (doc.head || doc.documentElement).appendChild(s);
    return true;
  };
  const since = Date.now();
  const timer = setInterval(() => { if (add() || Date.now() - since > 20000) clearInterval(timer); }, 25);
  frame.addEventListener('load', add);
}

function wantsLists(entry, manifest) {
  const s = [].concat((manifest && manifest.settings) || [], (entry && entry.settings) || []);
  return s.includes('word-lists');
}

// The child's lists, default first, as [{ title, words }]: one set per child (P56; api.js says
// how lists kept per game by script 0.3.0 are read).
function listsFor(playerId, id) {
  return api.getCachedLists(playerId, id)
    .filter((l) => l && Array.isArray(l.words) && l.words.length)
    .map((l) => ({ title: String(l.title || ''), words: l.words.map(String) }));
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
  const page = manifest && safeFile(manifest.page) ? manifest.page : 'index.html';
  const adapter = manifest && safeFile(manifest.adapter) ? manifest.adapter : '';

  const frame = document.createElement('iframe');
  frame.title = entry.title || 'Game';
  frame.allow = 'autoplay; fullscreen';

  // The game's saved state (P51, P78). Its progress may have been made on another device, so the
  // child's profile is re-read from the Sheet while the game opens.
  const reread = api.fetchProfile(pid).catch(() => {});
  api.markUnsent(pid, gameId); // a state kept before states went to the Sheet goes now

  let sendTimer = null;
  let lastSend = 0; // when something last went to the Sheet
  const send = (opts) => api.sendStates(opts).then((n) => { if (n) lastSend = Date.now(); });
  const sendSoon = () => {
    if (sendTimer) return;
    const wait = Math.max(SEND_FIRST, lastSend + SEND_EVERY - Date.now());
    sendTimer = setTimeout(() => { sendTimer = null; send(); }, wait);
  };
  // Leaving or hidden: take the game's latest save if its adapter offers one, and send now.
  const sendNow = () => {
    clearTimeout(sendTimer);
    sendTimer = null;
    try {
      const latest = frame.contentWindow && typeof frame.contentWindow.fgSaveNow === 'function'
        ? frame.contentWindow.fgSaveNow() : undefined;
      if (latest !== undefined) api.keepState(pid, gameId, latest);
    } catch { /* the game's page is gone or not ours: what was kept already goes */ }
    send({ keepalive: true });
  };
  sendSoon();
  homeLink.addEventListener('click', sendNow); // the launcher also sends anything still waiting
  window.addEventListener('pagehide', sendNow);
  document.addEventListener('visibilitychange', () => { if (document.hidden) sendNow(); });

  // Listen before the game opens, so its fg:ready can't be missed.
  window.addEventListener('message', (e) => {
    if (e.source !== frame.contentWindow || e.origin !== location.origin) return;
    const m = e.data;
    if (!m || m.v !== VERSION) return;
    if (m.type === 'fg:ready') {
      startGame();
    } else if (m.type === 'fg:state') {
      // Kept at once; sent soon, or now if the page is being hidden (the game saved on its way out).
      if (api.keepState(pid, gameId, m.state)) (document.hidden ? sendNow : sendSoon)();
    } else if (m.type === 'fg:round' && on('stars')) {
      // Stars switched back on: the round goes into the outbox like the old game kit's.
      const stars = Math.max(1, Math.min(3, Math.round(Number(m.stars) || 1)));
      api.queueResult({ profile_id: pid, game_id: gameId, score: Number(m.score) || 0, level: 1, stars, seconds: Math.round(Number(m.seconds) || 0) });
    }
  });

  // fg:start, once the child's profile has been re-read (or WAIT_FOR_SHEET has passed).
  async function startGame() {
    await Promise.race([reread, new Promise((r) => setTimeout(r, WAIT_FOR_SHEET))]);
    frame.contentWindow.postMessage({
      type: 'fg:start',
      v: VERSION,
      player: { name: player.nickname || '', animal: player.avatar || '', colour: player.colour || '' },
      sound: !sound.isMuted(),
      lists: wantsLists(entry, manifest) ? listsFor(pid, gameId) : [],
      settings: {},
      state: api.getState(pid, gameId),
      level: null,
    }, location.origin);
  }

  frame.src = `${folder}${page}?player=${encodeURIComponent(pid)}`;
  document.getElementById('frame').appendChild(frame);
  if (adapter) addAdapter(frame, adapter);
  frame.focus();
}

start();
