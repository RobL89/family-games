// Talks to the Google Sheet through the Apps Script web app.
//
// Results and achievements go into an outbox on the device first, then are
// sent with flush(). If the device is offline, they wait and go next time.
// Each result has a unique event_id, so sending twice never counts twice.
//
// Works with Apps Script 0.3.0 and 0.4.0, so the launcher can go live before the script:
//   - word lists: 0.4.0 keeps one set per child (P56, `word_lists`); 0.3.0 keeps them per game.
//   - a game's saved state: kept on the device first, then sent to the Sheet's Settings tab
//     (P51, `saveState`), so it follows the child; the newest save wins (P78). With 0.3.0 it
//     just stays on the device until the new script is in.

import { CONFIG } from './config.js';

const KEYS = {
  code: 'fg.familyCode',
  outbox: 'fg.outbox',
  profiles: 'fg.cache.profiles',
  skins: 'fg.cache.skins',
  profilePrefix: 'fg.cache.profile.',
  statePrefix: 'fg.state.', // + <child>.<game>: { state, at, sent } (P51)
};
const MAX_STATE = 20000; // characters of JSON (game contract, section 5)

// ---- Device storage (wrapped: storage can be blocked or full) ----------------

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// For other shared code that keeps small things on the device (sound, celebrations).
export { load as loadLocal, save as saveLocal };

// ---- Family code ---------------------------------------------------------------

export function getFamilyCode() {
  return load(KEYS.code, '');
}

export function setFamilyCode(code) {
  return save(KEYS.code, String(code || '').trim());
}

export function isConfigured() {
  return CONFIG.appsScriptUrl.startsWith('https://') && !!getFamilyCode();
}

// ---- Calling the script ----------------------------------------------------------

export async function call(action, data = {}, { keepalive = false } = {}) {
  if (!CONFIG.appsScriptUrl.startsWith('https://')) {
    throw new Error('not_configured: set appsScriptUrl in shared/config.js');
  }
  // text/plain keeps this a "simple" request, so the browser doesn't send a
  // CORS preflight that Apps Script can't answer.
  const response = await fetch(CONFIG.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...data, action, code: getFamilyCode() }),
    redirect: 'follow',
    keepalive, // lets a last save finish while the page closes
  });
  if (!response.ok) throw new Error('http_' + response.status);
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'unknown_error');
  return result;
}

// ---- Profiles (cached so the launcher shows something straight away) ------------

export function getCachedProfiles() {
  return load(KEYS.profiles, []);
}

export async function fetchProfiles() {
  const { profiles, skins } = await call('profiles');
  save(KEYS.profiles, profiles);
  // skins is null until the Sheet has a Skins tab (script 0.2.0 + setup).
  if (Array.isArray(skins)) save(KEYS.skins, skins);
  return profiles;
}

// Skins and their star thresholds, as last read from the Sheet (null if never).
export function getCachedSkins() {
  return load(KEYS.skins, null);
}

export function getCachedProfile(profileId) {
  return load(KEYS.profilePrefix + profileId, null);
}

export async function fetchProfile(profileId) {
  const result = await call('profile', { profile_id: profileId });
  save(KEYS.profilePrefix + profileId, result);
  return result;
}

export async function addProfile({ nickname, avatar, colour }) {
  const { profile } = await call('addProfile', { nickname, avatar, colour });
  await fetchProfiles().catch(() => {});
  return profile;
}

// Send only the fields to change: { nickname, avatar, colour, skin }.
export async function updateProfile(profileId, changes) {
  const { profile } = await call('updateProfile', { ...changes, profile_id: profileId });
  const list = getCachedProfiles().map((p) => (p.profile_id === profileId ? { ...p, ...profile } : p));
  save(KEYS.profiles, list);
  const cached = getCachedProfile(profileId);
  if (cached) save(KEYS.profilePrefix + profileId, { ...cached, profile: { ...cached.profile, ...profile } });
  return profile;
}

// ---- Word lists (Game setup) --------------------------------------------------------

// A child's word lists, default first, as this device last read them: [{list_id, title, words}].
// Script 0.4.0 keeps one set per child (P56). With 0.3.0 they're kept per game, so it's the
// lists of `gameId` if it has any, otherwise the first set the child has for any game (P61).
export function getCachedLists(profileId, gameId) {
  const cached = getCachedProfile(profileId) || {};
  if (Array.isArray(cached.word_lists)) return cached.word_lists;
  const all = cached.lists || {};
  if (gameId && Array.isArray(all[gameId]) && all[gameId].length) return all[gameId];
  for (const key of Object.keys(all).sort()) {
    if (Array.isArray(all[key]) && all[key].length) return all[key];
  }
  return [];
}

// Replaces a child's word lists; the first is the default. `gameId` is only for script 0.3.0,
// which keeps lists per game; 0.4.0 ignores it and keeps one set for every game.
export async function saveLists(profileId, lists, gameId) {
  const result = await call('saveLists', { profile_id: profileId, game_id: gameId, lists });
  const cached = getCachedProfile(profileId) || { profile: { profile_id: profileId } };
  save(KEYS.profilePrefix + profileId, {
    ...cached,
    word_lists: result.lists,
    lists: { ...(cached.lists || {}), ...(gameId ? { [gameId]: result.lists } : {}) },
  });
  return result.lists;
}

// ---- A game's saved state, per child (P51) ----------------------------------------------

const stateKey = (profileId, gameId) => `${KEYS.statePrefix}${profileId}.${gameId}`;

// The state to hand a game in fg:start: the newest of this device's copy and the Sheet's, which
// may come from another device (P78). Each carries `at`, when the game made it.
export function getState(profileId, gameId) {
  const local = load(stateKey(profileId, gameId), null);
  const mine = local && 'state' in local ? local : null;
  const sheet = ((getCachedProfile(profileId) || {}).states || {})[gameId];
  const theirs = sheet && typeof sheet === 'object' && 'state' in sheet ? sheet : null;
  if (!mine || !theirs) return (mine || theirs || { state: null }).state;
  return (Date.parse(theirs.at) || 0) > (Date.parse(mine.at) || 0) ? theirs.state : mine.state;
}

// Keeps a game's state on this device, made now, and marks it to go to the Sheet. The same state
// as the one already kept changes nothing. Returns false if it's too big to keep (the game keeps
// its own copy, contract section 5).
export function keepState(profileId, gameId, state) {
  const json = JSON.stringify(state ?? null);
  if (json.length > MAX_STATE) return false;
  const kept = load(stateKey(profileId, gameId), null);
  if (kept && 'state' in kept && JSON.stringify(kept.state) === json) return true;
  return save(stateKey(profileId, gameId), { state: JSON.parse(json), at: new Date().toISOString(), sent: false });
}

// A state kept before the launcher could send states has no `sent` mark: mark it so it goes.
export function markUnsent(profileId, gameId) {
  const local = load(stateKey(profileId, gameId), null);
  if (local && 'state' in local && !('sent' in local)) save(stateKey(profileId, gameId), { ...local, sent: false });
}

let sendingStates = null;

// Sends every state the Sheet hasn't got yet. Never throws: with script 0.3.0, offline, or a
// refusal, states stay on the device and go next time. Returns how many were sent.
export function sendStates({ keepalive = false } = {}) {
  if (sendingStates) return sendingStates;
  sendingStates = (async () => {
    if (!isConfigured()) return 0;
    let keys = [];
    try { keys = Object.keys(localStorage).filter((k) => k.startsWith(KEYS.statePrefix)); } catch { return 0; }
    let sent = 0;
    for (const key of keys) {
      const local = load(key, null);
      if (!local || local.sent !== false) continue;
      const [profileId, ...rest] = key.slice(KEYS.statePrefix.length).split('.');
      const gameId = rest.join('.');
      let reply;
      try {
        reply = await call('saveState', { profile_id: profileId, game_id: gameId, state: local.state, at: local.at }, { keepalive });
      } catch (err) {
        if (/unknown_action|missing_tab_Settings|not_configured/.test(String(err && err.message))) return sent; // script 0.3.0
        continue; // offline or refused: try again next time
      }
      const now = load(key, null);
      if (now && now.at === local.at) save(key, { ...now, sent: true }); // unless it changed meanwhile
      // The Sheet now holds this save, unless it already had a newer one (saved: false).
      const cached = getCachedProfile(profileId);
      if (cached && reply.saved !== false) {
        save(KEYS.profilePrefix + profileId, { ...cached, states: { ...(cached.states || {}), [gameId]: { state: local.state, at: local.at } } });
      }
      sent++;
    }
    return sent;
  })().finally(() => {
    sendingStates = null;
  });
  return sendingStates;
}

// ---- Outbox --------------------------------------------------------------------

function newId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

export function getOutbox() {
  return load(KEYS.outbox, { results: [], achievements: [] });
}

export function queueResult({ profile_id, game_id, score, level, stars, seconds }) {
  const outbox = getOutbox();
  const result = {
    event_id: newId(),
    profile_id,
    game_id,
    score,
    level,
    stars,
    seconds,
    played_at: new Date().toISOString(),
  };
  outbox.results.push(result);
  save(KEYS.outbox, outbox);
  return result;
}

export function queueAchievement({ profile_id, achievement_id }) {
  const outbox = getOutbox();
  const exists = outbox.achievements.some(
    (a) => a.profile_id === profile_id && a.achievement_id === achievement_id,
  );
  if (!exists) {
    outbox.achievements.push({ profile_id, achievement_id, earned_at: new Date().toISOString() });
    save(KEYS.outbox, outbox);
  }
}

let flushing = null;

// Sends everything waiting in the outbox. Safe to call often.
export function flush() {
  if (flushing) return flushing;
  flushing = (async () => {
    await sendStates();
    const outbox = getOutbox();
    if (!outbox.results.length && !outbox.achievements.length) return { sent: 0 };
    if (!isConfigured()) return { sent: 0, waiting: true };
    const result = await call('sync', outbox);

    // Remove only what the Sheet confirmed, in case more was queued meanwhile.
    const done = new Set([...result.accepted, ...result.duplicates, ...result.rejected]);
    const doneAch = new Set(result.achievements_recorded);
    const latest = getOutbox();
    latest.results = latest.results.filter((r) => !done.has(r.event_id));
    latest.achievements = latest.achievements.filter(
      (a) => !doneAch.has(a.profile_id + '|' + a.achievement_id),
    );
    save(KEYS.outbox, latest);
    return { sent: result.accepted.length, rejected: result.rejected };
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

// Try again whenever the device comes back online.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flush().catch(() => {});
  });
}
