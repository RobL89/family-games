// Talks to the Google Sheet through the Apps Script web app.
//
// Results, achievements and game progress go into an outbox on the device first,
// then are sent with flush(). If the device is offline, they wait and go next time.
// Each result has a unique event_id, so sending twice never counts twice.
// Game settings and word lists (script 0.3.0) are fetched and kept on the device.

import { CONFIG } from './config.js';

const KEYS = {
  code: 'fg.familyCode',
  outbox: 'fg.outbox',
  profiles: 'fg.cache.profiles',
  skins: 'fg.cache.skins',
  profilePrefix: 'fg.cache.profile.',
  settings: 'fg.cache.settings',
  progressPrefix: 'fg.progress.',
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

// ---- Game settings and word lists (Settings and Lists tabs, script 0.3.0) --------

// { settings, lists, warnings, at } as last read from the Sheet, or null if never.
export function getCachedSettings() {
  return load(KEYS.settings, null);
}

export async function fetchSettings() {
  const { settings, lists, warnings } = await call('settings');
  const data = { settings: settings || [], lists: lists || [], warnings: warnings || [], at: Date.now() };
  save(KEYS.settings, data);
  return data;
}

// ---- Game progress (Progress tab, script 0.3.0) ------------------------------------
// One small saved state per child per game (coins, unlocked planets...). The device
// copy is kept separately from the outbox, so it survives even if the Sheet can't take it.

export function getDeviceProgress(profileId, gameId) {
  return load(KEYS.progressPrefix + profileId + '.' + gameId, null);
}

// Saves on the device; queues for the Sheet unless localOnly (no player picked).
export function queueProgress({ profile_id, game_id, data }, localOnly = false) {
  const entry = { profile_id, game_id, data, updated_at: new Date().toISOString() };
  save(KEYS.progressPrefix + profile_id + '.' + game_id, entry);
  if (localOnly) return entry;
  const outbox = getOutbox();
  outbox.progress = outbox.progress.filter((p) => !(p.profile_id === profile_id && p.game_id === game_id));
  outbox.progress.push(entry);
  save(KEYS.outbox, outbox);
  return entry;
}

// ---- Outbox --------------------------------------------------------------------

function newId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

export function getOutbox() {
  const box = load(KEYS.outbox, null) || {};
  return {
    results: Array.isArray(box.results) ? box.results : [],
    achievements: Array.isArray(box.achievements) ? box.achievements : [],
    progress: Array.isArray(box.progress) ? box.progress : [],
  };
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
    if (!outbox.results.length && !outbox.achievements.length && !outbox.progress.length) return { sent: 0 };
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
    if (Array.isArray(result.progress_saved)) {
      const doneProg = new Set(result.progress_saved);
      latest.progress = latest.progress.filter((p) => !doneProg.has(p.profile_id + '|' + p.game_id + '|' + p.updated_at));
    } else {
      // Script older than 0.3.0: it can't store progress, which stays on this device instead.
      latest.progress = [];
    }
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
