// What every game uses (P4): who's playing, and saving the result when a round ends.
//
// In a game written as a module:
//   import { getPlayer, finish, homeButton } from '../../shared/game-kit.js';
//   homeButton();                                   // a "back to games" button
//   finish({ score: 12, stars: 3, seconds: 40 });   // saves, then returns to the launcher
//   record({ score: 12, stars: 3 });                // saves but stays (for "Play again")
//
// In a game with ordinary scripts:
//   <script type="module" src="../../shared/game-kit.js"></script>
//   ...later: window.FamilyGames.finish({ score: 12, stars: 3 });
//
// stars (1 to 3) is the headline score (P17). Results go into this device's
// outbox first and reach the Sheet when the launcher next syncs (P6).
//
// Settings from the Sheet (script 0.3.0). Describe them in games/<id>/settings.js
// (see shared/settings.js), then:
//   import { SETTINGS } from './settings.js';
//   const s = await loadSettings(SETTINGS);         // fresh from the Sheet if it answers quickly
//   s.speed, s.word_list.items ...
//   settingsNow(SETTINGS)                            // same, from this device only (no waiting)
//
// Progress that lasts between rounds (coins, unlocks), one small object per child per game:
//   const progress = await loadProgress({ coins: 0 });   // defaults for a first visit
//   progress.coins += 5; saveProgress(progress);         // device first, then the Sheet

import * as api from './api.js';
import { resolveSettings } from './settings.js';
import { playerStats, earnedIds, newlyEarned, CELEBRATE_KEY } from './achievements.js';

const LAUNCHER = new URL('../index.html', import.meta.url);
const GAMES_LIST = new URL('../games.json', import.meta.url);

export function getPlayer() {
  const id = new URLSearchParams(location.search).get('player');
  if (!id) return null;
  const cached = api.getCachedProfile(id);
  if (cached && cached.profile) return cached.profile;
  return api.getCachedProfiles().find((p) => p.profile_id === id) || { profile_id: id, nickname: '' };
}

export function getGameId() {
  const match = location.pathname.match(/\/games\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : 'unknown';
}

async function readyGameIds() {
  try {
    const list = await (await fetch(GAMES_LIST)).json();
    return list.games.filter((g) => g.status === 'ready').map((g) => g.id);
  } catch {
    return [getGameId()];
  }
}

let finishing = false;

// Saves a finished round and goes back to the launcher, which celebrates it.
export async function finish(result = {}) {
  if (finishing) return;
  finishing = true;
  await record(result);
  goHome();
}

// Saves a finished round but stays in the game (for "Play again").
// Returns the badges it earned. Does nothing if no player was picked.
export async function record({ score = 0, level = 1, stars = 1, seconds = 0 } = {}) {
  const player = getPlayer();
  if (!player) return [];

  const pid = player.profile_id;
  const gameId = getGameId();
  const cleanStars = Math.max(1, Math.min(3, Math.round(Number(stars) || 1)));
  const cleanScore = Number(score) || 0;
  const profileData = api.getCachedProfile(pid);

  const before = playerStats(profileData, api.getOutbox(), pid);
  const playedBefore = (before.plays[gameId] || 0) > 0;
  const oldBest = before.best[gameId];

  api.queueResult({
    profile_id: pid,
    game_id: gameId,
    score: cleanScore,
    level: Number(level) || 1,
    stars: cleanStars,
    seconds: Math.max(0, Math.round(Number(seconds) || 0)),
  });

  const after = playerStats(profileData, api.getOutbox(), pid, await readyGameIds(), {
    beatBest: playedBefore && oldBest != null && cleanScore > oldBest,
  });
  const fresh = newlyEarned(after, earnedIds(profileData, api.getOutbox(), pid));
  fresh.forEach((a) => api.queueAchievement({ profile_id: pid, achievement_id: a.id }));

  // News for the launcher. Several rounds in a row add up into one celebration.
  const old = api.loadLocal(CELEBRATE_KEY, null);
  const keep = old && old.profile_id === pid && Date.now() - old.at < 15 * 60 * 1000;
  api.saveLocal(CELEBRATE_KEY, {
    profile_id: pid,
    game_id: gameId,
    stars: (keep ? old.stars : 0) + cleanStars,
    stars_before: keep ? old.stars_before : before.starsTotal,
    achievements: [...(keep ? old.achievements : []), ...fresh.map((a) => a.id)],
    at: Date.now(),
  });
  return fresh;
}

// ---------- Settings ----------

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

// Settings for this game and this child, from what's on the device (no waiting).
export function settingsNow(schema, gameId = getGameId()) {
  const player = getPlayer();
  return resolveSettings(schema, api.getCachedSettings(), gameId, player ? player.profile_id : null).values;
}

// Asks the Sheet for the latest settings, waiting up to `wait` ms, then answers from the
// device either way. A late answer still lands on the device for next time.
export async function loadSettings(schema, { wait = 2500 } = {}) {
  if (api.isConfigured()) await withTimeout(api.fetchSettings(), wait).catch(() => {});
  return settingsNow(schema);
}

// ---------- Progress ----------

const newest = (a, b) => (!a ? b : !b ? a : String(a.updated_at) >= String(b.updated_at) ? a : b);
const copy = (x) => JSON.parse(JSON.stringify(x));

// This child's saved progress for this game, from the device (no waiting).
export function progressNow(defaults = {}) {
  const player = getPlayer();
  const pid = player ? player.profile_id : 'guest';
  const gameId = getGameId();
  const local = api.getDeviceProgress(pid, gameId);
  const cached = player ? api.getCachedProfile(pid) : null;
  const remote = cached && cached.progress ? cached.progress[gameId] : null;
  const pick = newest(local, remote);
  return { ...copy(defaults), ...(pick && pick.data && typeof pick.data === 'object' ? copy(pick.data) : {}) };
}

// Checks the Sheet for progress saved on another device (waiting up to `wait` ms), then
// returns whichever copy is newest, merged over the defaults.
export async function loadProgress(defaults = {}, { wait = 2000 } = {}) {
  const player = getPlayer();
  if (player && api.isConfigured()) await withTimeout(api.fetchProfile(player.profile_id), wait).catch(() => {});
  return progressNow(defaults);
}

const MAX_PROGRESS = 20000; // characters of JSON; plenty for coins and unlocks

// Saves progress on the device straight away and sends it to the Sheet in the background.
export function saveProgress(data) {
  const json = JSON.stringify(data || {});
  if (json.length > MAX_PROGRESS) {
    console.warn(`Progress not saved: ${json.length} characters is over ${MAX_PROGRESS}`);
    return false;
  }
  const player = getPlayer();
  api.queueProgress({ profile_id: player ? player.profile_id : 'guest', game_id: getGameId(), data: JSON.parse(json) }, !player);
  if (player) api.flush().catch(() => {});
  return true;
}

export function goHome(profileId) {
  const id = profileId === undefined ? (getPlayer() || {}).profile_id : profileId;
  const url = new URL(LAUNCHER);
  if (id) url.searchParams.set('player', id);
  location.href = url.href;
}

// A round "back to games" button in the top-left corner. Returns the button.
// Pass { style: {...} } to restyle it to suit the game.
export function homeButton({ style = {} } = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', 'Back to games');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true"><path fill="currentColor" d="M12 3.2l9 7.6c.6.5.2 1.4-.6 1.4H19v7.3c0 .8-.7 1.5-1.5 1.5H14v-5.5h-4V21H6.5c-.8 0-1.5-.7-1.5-1.5v-7.3H3.6c-.8 0-1.2-.9-.6-1.4z"/></svg>';
  Object.assign(b.style, {
    position: 'fixed', top: '12px', left: '12px', zIndex: '1000', width: '56px', height: '56px',
    display: 'grid', placeItems: 'center', borderRadius: '50%', border: '3px solid #2B2118',
    background: '#fff', color: '#2B2118', boxShadow: '2px 4px 0 rgba(43,33,24,.25)', cursor: 'pointer', padding: '0',
  }, style);
  b.addEventListener('click', () => goHome());
  document.body.appendChild(b);
  return b;
}

if (typeof window !== 'undefined') {
  window.FamilyGames = {
    getPlayer, getGameId, record, finish, goHome, homeButton,
    settingsNow, loadSettings, progressNow, loadProgress, saveProgress,
  };
}
