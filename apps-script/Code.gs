/**
 * Kids' Games: Sheet backend (Google Apps Script web app).
 *
 * Lives in the Kids' Games Google Sheet: Extensions > Apps Script.
 * Setup steps are in docs/setup-sheet.md in the family-games repo.
 *
 * Every call is a POST whose body is JSON text:
 *   { "action": "ping", "code": "<family code>", ...data }
 * The family code is kept in Script properties as FAMILY_CODE, never in the repo.
 */

const VERSION = '0.1.0';

const TABS = {
  Profiles: ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active'],
  Scores: ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
  Achievements: ['profile_id', 'achievement_id', 'earned_at'],
};

const RECENT_SCORES = 10;
const MAX_BATCH = 200;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

// ---------------------------------------------------------------------------
// Run by hand from the editor
// ---------------------------------------------------------------------------

/**
 * Adds the three tabs and their header rows if they are missing.
 * Never changes a tab that already has data in it.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = [];
  Object.keys(TABS).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      log.push('Added tab ' + name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold');
      sheet.setFrozenRows(1);
      log.push('Added header row to ' + name);
    } else {
      const headers = sheet.getRange(1, 1, 1, TABS[name].length).getValues()[0];
      if (headers.join('|') !== TABS[name].join('|')) {
        log.push('WARNING: ' + name + ' headers differ from expected; left unchanged');
      } else {
        log.push(name + ' already set up; left unchanged');
      }
    }
  });
  const hasCode = !!PropertiesService.getScriptProperties().getProperty('FAMILY_CODE');
  log.push(hasCode ? 'FAMILY_CODE is set' : 'FAMILY_CODE is NOT set yet (Project Settings > Script properties)');
  Logger.log(log.join('\n'));
  return log;
}

/**
 * Makes a dated copy of the whole spreadsheet in your Drive.
 * Run before any change to the Sheet's data or structure.
 */
function backup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HHmm');
  const copy = ss.copy(ss.getName() + ' backup ' + stamp);
  Logger.log('Backup made: ' + copy.getUrl());
  return copy.getUrl();
}

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doGet() {
  return json({ ok: true, app: 'family-games', version: VERSION, note: 'Use POST' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }

  const expected = PropertiesService.getScriptProperties().getProperty('FAMILY_CODE');
  if (!expected) return json({ ok: false, error: 'not_set_up' });
  if (String(body.code || '') !== expected) return json({ ok: false, error: 'wrong_code' });

  try {
    switch (body.action) {
      case 'ping': return json({ ok: true, version: VERSION });
      case 'profiles': return json({ ok: true, profiles: listProfiles() });
      case 'profile': return json(Object.assign({ ok: true }, getProfile(body.profile_id)));
      case 'addProfile': return json(withLock(function () { return addProfile(body); }));
      case 'sync': return json(withLock(function () { return sync(body); }));
      default: return json({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function listProfiles() {
  return rows('Profiles')
    .filter(function (p) { return p.active !== false && p.active !== 'FALSE'; })
    .map(publicProfile);
}

function getProfile(profileId) {
  if (!ID_PATTERN.test(String(profileId || ''))) throw new Error('bad_profile_id');
  const profile = rows('Profiles').filter(function (p) { return p.profile_id === profileId; })[0];
  if (!profile) throw new Error('no_such_profile');

  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const scores = rows('Scores').filter(function (s) { return s.profile_id === profileId; });
  scores.sort(function (a, b) { return toTime(b.played_at) - toTime(a.played_at); });

  const games = {};
  const days = {};
  scores.forEach(function (s) {
    const g = games[s.game_id] || (games[s.game_id] = { plays: 0, best: null, best_stars: 0, last_played: null });
    g.plays += 1;
    const score = Number(s.score);
    if (!isNaN(score) && (g.best === null || score > g.best)) g.best = score;
    g.best_stars = Math.max(g.best_stars, Number(s.stars) || 0);
    const iso = toIso(s.played_at);
    if (!g.last_played || iso > g.last_played) g.last_played = iso;
    if (s.played_at) days[Utilities.formatDate(new Date(toTime(s.played_at)), tz, 'yyyy-MM-dd')] = true;
  });

  const achievements = rows('Achievements')
    .filter(function (a) { return a.profile_id === profileId; })
    .map(function (a) { return { achievement_id: a.achievement_id, earned_at: toIso(a.earned_at) }; });

  return {
    profile: publicProfile(profile),
    recent: scores.slice(0, RECENT_SCORES).map(publicScore),
    stats: {
      total_plays: scores.length,
      games: games,
      days_played: Object.keys(days).sort(),
    },
    achievements: achievements,
  };
}

function addProfile(body) {
  const nickname = cleanText(body.nickname, 20);
  if (!nickname) return { ok: false, error: 'nickname_required' };
  const avatar = ID_PATTERN.test(String(body.avatar || '')) ? body.avatar : 'default';
  const colour = /^#[0-9A-Fa-f]{6}$/.test(String(body.colour || '')) ? body.colour : '#7F77DD';
  const profileId = 'p_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  sheet('Profiles').appendRow([profileId, nickname, avatar, colour, new Date(), true]);
  return { ok: true, profile: { profile_id: profileId, nickname: nickname, avatar: avatar, colour: colour } };
}

/**
 * Takes the device outbox in one go:
 *   { results: [ {event_id, profile_id, game_id, score, level, stars, seconds, played_at} ],
 *     achievements: [ {profile_id, achievement_id, earned_at} ] }
 * Duplicates are skipped, so a device can safely send the same outbox twice.
 */
function sync(body) {
  const results = Array.isArray(body.results) ? body.results.slice(0, MAX_BATCH) : [];
  const achievements = Array.isArray(body.achievements) ? body.achievements.slice(0, MAX_BATCH) : [];
  const profileIds = {};
  rows('Profiles').forEach(function (p) { profileIds[p.profile_id] = true; });

  const seenEvents = {};
  rows('Scores').forEach(function (s) { seenEvents[s.event_id] = true; });
  const accepted = [], duplicates = [], rejected = [];
  const scoreRows = [];
  const now = new Date();

  results.forEach(function (r) {
    const id = String(r && r.event_id || '');
    if (!ID_PATTERN.test(id) || !profileIds[r.profile_id] || !ID_PATTERN.test(String(r.game_id || ''))) {
      rejected.push(id || '(no id)');
      return;
    }
    if (seenEvents[id]) { duplicates.push(id); return; }
    seenEvents[id] = true;
    scoreRows.push([
      id, r.profile_id, r.game_id,
      num(r.score), num(r.level), num(r.stars), num(r.seconds),
      toDate(r.played_at, now), now,
    ]);
    accepted.push(id);
  });
  appendRows('Scores', scoreRows);

  const seenAch = {};
  rows('Achievements').forEach(function (a) { seenAch[a.profile_id + '|' + a.achievement_id] = true; });
  const achRows = [];
  const achAccepted = [];
  achievements.forEach(function (a) {
    if (!a || !profileIds[a.profile_id] || !ID_PATTERN.test(String(a.achievement_id || ''))) return;
    const key = a.profile_id + '|' + a.achievement_id;
    if (seenAch[key]) { achAccepted.push(key); return; }
    seenAch[key] = true;
    achRows.push([a.profile_id, a.achievement_id, toDate(a.earned_at, now)]);
    achAccepted.push(key);
  });
  appendRows('Achievements', achRows);

  return {
    ok: true,
    accepted: accepted,
    duplicates: duplicates,
    rejected: rejected,
    achievements_recorded: achAccepted,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function sheet(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) throw new Error('missing_tab_' + name + ' (run setup)');
  return s;
}

function rows(name) {
  const values = sheet(name).getDataRange().getValues();
  const headers = values.shift() || [];
  return values.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function appendRows(name, data) {
  if (!data.length) return;
  const s = sheet(name);
  s.getRange(s.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
}

function publicProfile(p) {
  return { profile_id: p.profile_id, nickname: p.nickname, avatar: p.avatar, colour: p.colour };
}

function publicScore(s) {
  return {
    game_id: s.game_id, score: s.score, level: s.level, stars: s.stars,
    seconds: s.seconds, played_at: toIso(s.played_at),
  };
}

/** Trims, caps length and strips leading characters the Sheet would treat as a formula. */
function cleanText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F]/g, '').trim().replace(/^[=+\-@]+/, '').slice(0, maxLength);
}

function num(value) {
  const n = Number(value);
  return isFinite(n) ? n : '';
}

function toDate(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
}

function toTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function toIso(value) {
  const t = toTime(value);
  return t ? new Date(t).toISOString() : null;
}
