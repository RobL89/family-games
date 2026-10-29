// Talks to the Google Sheet through the Apps Script web app.
//
// Results and achievements go into an outbox on the device first, then are
// sent with flush(). If the device is offline, they wait and go next time.
// Each result has a unique event_id, so sending twice never counts twice.

import { CONFIG } from './config.js';

const KEYS = {
  code: 'fg.familyCode',
  outbox: 'fg.outbox',
  profiles: 'fg.cache.profiles',
  skins: 'fg.cache.skins',
  profilePrefix: 'fg.cache.profile.',
};

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

export async function call(action, data = {}) {
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

// ---- Per-player game lists (Game setup) --------------------------------------------

// A player's lists for one game, from what this device last read: [{list_id, title, words}].
export function getCachedLists(profileId, gameId) {
  const cached = getCachedProfile(profileId);
  return (cached && cached.lists && cached.lists[gameId]) || [];
}

// Replaces a player's lists for one game. The first list is the default.
export async function saveLists(profileId, gameId, lists) {
  const result = await call('saveLists', { profile_id: profileId, game_id: gameId, lists });
  const cached = getCachedProfile(profileId) || { profile: { profile_id: profileId } };
  save(KEYS.profilePrefix + profileId, { ...cached, lists: { ...(cached.lists || {}), [gameId]: result.lists } });
  return result.lists;
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
