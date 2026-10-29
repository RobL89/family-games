/**
 * Kids' Games: Sheet backend (Google Apps Script web app).
 *
 * Lives in the Kids' Games Google Sheet: Extensions > Apps Script.
 * Setup steps are in docs/setup-sheet.md in the family-games repo.
 *
 * Every call is a POST whose body is JSON text:
 *   { "action": "ping", "code": "<family code>", ...data }
 * The family code is kept in Script properties as FAMILY_CODE, never in the repo.
 *
 * 0.2.0: Skins tab (star thresholds you can edit in the Sheet), a skin column
 *        on Profiles, star totals, and the updateProfile call.
 * 0.3.0: GameLists tab: each player's word lists per game (set up in the
 *        launcher's Game setup), returned by `profile` and saved by `saveLists`.
 */

const VERSION = '0.3.0';

const TABS = {
  Profiles: ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active', 'skin'],
  Scores: ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
  Achievements: ['profile_id', 'achievement_id', 'earned_at'],
  Skins: ['skin_id', 'name', 'stars_needed', 'active'],
  GameLists: ['list_id', 'profile_id', 'game_id', 'position', 'title', 'words', 'updated_at'],
};

// Rows put into a brand-new Skins tab. Change stars_needed in the Sheet any time;
// the launcher reads it fresh. skin_id must match a CSS file in shared/skins/.
const DEFAULT_SKINS = [
  ['sticker', 'Sticker book', 0, true],
  ['fairy', 'Fairy', 10, true],
  ['blocks', 'Blocks', 20, true],
  ['unicorn', 'Unicorn', 30, true],
];

const RECENT_SCORES = 10;
const MAX_BATCH = 200;
const MAX_LISTS = 50;      // per player per game
const MAX_WORDS = 30;      // per list (Kriss Kross fits up to 30)
const MAX_WORD_LENGTH = 20;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const COLOUR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

// ---------------------------------------------------------------------------
// Run by hand from the editor
// ---------------------------------------------------------------------------

/**
 * Adds missing tabs, header rows and columns. Never changes or removes data.
 * If anything is about to change in a spreadsheet that already has tabs,
 * it makes a backup copy first and logs the link.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const steps = planSetup(ss);
  const log = [];

  if (!steps.length) {
    log.push('Everything is already set up; nothing changed');
  } else {
    const hasTabs = Object.keys(TABS).some(function (name) { return !!ss.getSheetByName(name); });
    if (hasTabs) log.push('Backup made first: ' + backup());
    steps.forEach(function (step) {
      step.apply();
      log.push(step.label);
    });
  }

  const hasCode = !!PropertiesService.getScriptProperties().getProperty('FAMILY_CODE');
  log.push(hasCode ? 'FAMILY_CODE is set' : 'FAMILY_CODE is NOT set yet (Project Settings > Script properties)');
  Logger.log(log.join('\n'));
  return log;
}

function planSetup(ss) {
  const steps = [];
  Object.keys(TABS).forEach(function (name) {
    const wanted = TABS[name];
    const existing = ss.getSheetByName(name);

    if (!existing) {
      steps.push({
        label: 'Added tab ' + name + ' with its header row' + (name === 'Skins' ? ' and ' + DEFAULT_SKINS.length + ' skins' : ''),
        apply: function () {
          const s = ss.insertSheet(name);
          writeHeaders(s, wanted);
          if (name === 'Skins') s.getRange(2, 1, DEFAULT_SKINS.length, wanted.length).setValues(DEFAULT_SKINS);
        },
      });
      return;
    }

    if (existing.getLastRow() === 0) {
      steps.push({
        label: 'Added header row to ' + name,
        apply: function () { writeHeaders(existing, wanted); },
      });
      return;
    }

    const headers = existing.getRange(1, 1, 1, existing.getLastColumn()).getValues()[0].map(String);
    const missing = wanted.filter(function (h) { return headers.indexOf(h) === -1; });
    if (missing.length) {
      steps.push({
        label: 'Added column' + (missing.length > 1 ? 's ' : ' ') + missing.join(', ') + ' to ' + name + ' (existing data untouched)',
        apply: function () {
          existing.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
        },
      });
    }
  });
  return steps;
}

function writeHeaders(s, headers) {
  s.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  s.setFrozenRows(1);
}

/**
 * Makes a dated copy of the whole spreadsheet in your Drive.
 * Run before any change to the Sheet's data or structure (setup does this itself).
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

  // Trimmed on both sides: a stray space in the property or the box is easy to miss.
  const expected = String(PropertiesService.getScriptProperties().getProperty('FAMILY_CODE') || '').trim();
  if (!expected) return json({ ok: false, error: 'not_set_up' });
  if (String(body.code || '').trim() !== expected) return json({ ok: false, error: 'wrong_code' });

  try {
    switch (body.action) {
      case 'ping': return json({ ok: true, version: VERSION });
      case 'profiles': return json({ ok: true, version: VERSION, profiles: listProfiles(), skins: listSkins() });
      case 'profile': return json(Object.assign({ ok: true }, getProfile(body.profile_id)));
      case 'addProfile': return json(withLock(function () { return addProfile(body); }));
      case 'updateProfile': return json(withLock(function () { return updateProfile(body); }));
      case 'saveLists': return json(withLock(function () { return saveLists(body); }));
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
  return rows('Profiles').filter(isActive).map(publicProfile);
}

/** Skins from the Skins tab, cheapest first. null if the tab doesn't exist yet. */
function listSkins() {
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Skins')) return null;
  return rows('Skins')
    .filter(isActive)
    .filter(function (s) { return ID_PATTERN.test(String(s.skin_id || '')); })
    .map(function (s) {
      return {
        skin_id: String(s.skin_id),
        name: cleanText(s.name, 30) || String(s.skin_id),
        stars_needed: Math.max(0, Math.floor(Number(s.stars_needed)) || 0),
      };
    })
    .sort(function (a, b) { return a.stars_needed - b.stars_needed; });
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
  let starsTotal = 0;
  scores.forEach(function (s) {
    const g = games[s.game_id] || (games[s.game_id] = { plays: 0, best: null, best_stars: 0, last_played: null });
    g.plays += 1;
    const score = Number(s.score);
    if (!isNaN(score) && (g.best === null || score > g.best)) g.best = score;
    const stars = Number(s.stars) || 0;
    g.best_stars = Math.max(g.best_stars, stars);
    starsTotal += stars;
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
      stars_total: starsTotal,
      games: games,
      days_played: Object.keys(days).sort(),
    },
    achievements: achievements,
    lists: listsFor(profileId),
  };
}

/** A player's lists grouped by game, in order (the first is the default): { game_id: [{list_id, title, words}] } */
function listsFor(profileId) {
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GameLists')) return {};
  const out = {};
  rows('GameLists')
    .filter(function (r) { return r.profile_id === profileId && ID_PATTERN.test(String(r.game_id || '')); })
    .sort(function (a, b) { return (Number(a.position) || 0) - (Number(b.position) || 0); })
    .forEach(function (r) {
      (out[r.game_id] = out[r.game_id] || []).push({
        list_id: String(r.list_id),
        title: String(r.title || ''),
        words: splitWords(r.words),
      });
    });
  return out;
}

function splitWords(value) {
  return String(value || '').split(/[\s,;]+/).map(function (w) { return w.trim(); }).filter(Boolean);
}

/**
 * Replaces one player's lists for one game, in the order given (the first is the default):
 *   { profile_id, game_id, lists: [ {list_id?, title, words: ['cat', 'dog']} ] }
 * An empty lists array removes them all.
 */
function saveLists(body) {
  const profileId = String(body.profile_id || '');
  const gameId = String(body.game_id || '');
  if (!ID_PATTERN.test(profileId)) return { ok: false, error: 'bad_profile_id' };
  if (!ID_PATTERN.test(gameId)) return { ok: false, error: 'bad_game_id' };
  if (!rows('Profiles').some(function (p) { return p.profile_id === profileId; })) return { ok: false, error: 'no_such_profile' };
  if (!Array.isArray(body.lists)) return { ok: false, error: 'lists_required' };
  if (body.lists.length > MAX_LISTS) return { ok: false, error: 'too_many_lists' };

  const now = new Date();
  const fresh = [];
  for (let i = 0; i < body.lists.length; i++) {
    const l = body.lists[i] || {};
    const words = (Array.isArray(l.words) ? l.words : splitWords(l.words))
      .map(function (w) { return cleanText(w, MAX_WORD_LENGTH); })
      .filter(Boolean);
    if (!words.length) return { ok: false, error: 'empty_list', position: i + 1 };
    if (words.length > MAX_WORDS) return { ok: false, error: 'too_many_words', position: i + 1 };
    fresh.push({
      list_id: ID_PATTERN.test(String(l.list_id || '')) ? String(l.list_id) : 'l_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10),
      profile_id: profileId,
      game_id: gameId,
      position: i + 1,
      title: cleanText(l.title, 40) || 'List ' + (i + 1),
      words: words.join(', '),
      updated_at: now,
    });
  }

  // Keep every other player's and game's rows, swap in the new ones, and rewrite the tab body.
  const s = sheet('GameLists');
  const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  const keep = rows('GameLists').filter(function (r) { return !(r.profile_id === profileId && r.game_id === gameId); });
  const all = keep.concat(fresh).map(function (o) {
    return headers.map(function (h) { return o[h] === undefined ? '' : o[h]; });
  });
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, headers.length).clearContent();
  if (all.length) s.getRange(2, 1, all.length, headers.length).setValues(all);

  return { ok: true, lists: listsFor(profileId)[gameId] || [] };
}

function starsTotalFor(profileId) {
  return rows('Scores')
    .filter(function (s) { return s.profile_id === profileId; })
    .reduce(function (sum, s) { return sum + (Number(s.stars) || 0); }, 0);
}

function addProfile(body) {
  const nickname = cleanText(body.nickname, 20);
  if (!nickname) return { ok: false, error: 'nickname_required' };
  const profile = {
    profile_id: 'p_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10),
    nickname: nickname,
    avatar: ID_PATTERN.test(String(body.avatar || '')) ? body.avatar : 'fox',
    colour: COLOUR_PATTERN.test(String(body.colour || '')) ? body.colour : '#F07A2A',
    created_at: new Date(),
    active: true,
    skin: 'sticker',
  };
  appendObjects('Profiles', [profile]);
  return { ok: true, profile: publicProfile(profile) };
}

/**
 * Changes one player. Send only the fields to change:
 *   { profile_id, nickname?, avatar?, colour?, skin? }
 * A skin is only accepted once the player has enough stars for it.
 */
function updateProfile(body) {
  const profileId = String(body.profile_id || '');
  if (!ID_PATTERN.test(profileId)) return { ok: false, error: 'bad_profile_id' };

  const s = sheet('Profiles');
  const values = s.getDataRange().getValues();
  const headers = values[0].map(String);
  const idCol = headers.indexOf('profile_id');
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === profileId) { rowIndex = i; break; }
  }
  if (rowIndex < 1) return { ok: false, error: 'no_such_profile' };

  const changes = {};
  if (body.nickname !== undefined) {
    const nickname = cleanText(body.nickname, 20);
    if (!nickname) return { ok: false, error: 'nickname_required' };
    changes.nickname = nickname;
  }
  if (body.avatar !== undefined) {
    if (!ID_PATTERN.test(String(body.avatar))) return { ok: false, error: 'bad_avatar' };
    changes.avatar = String(body.avatar);
  }
  if (body.colour !== undefined) {
    if (!COLOUR_PATTERN.test(String(body.colour))) return { ok: false, error: 'bad_colour' };
    changes.colour = String(body.colour);
  }
  if (body.skin !== undefined) {
    const skins = listSkins();
    if (!skins) return { ok: false, error: 'missing_tab_Skins (run setup)' };
    const skin = skins.filter(function (k) { return k.skin_id === String(body.skin); })[0];
    if (!skin) return { ok: false, error: 'no_such_skin' };
    const total = starsTotalFor(profileId);
    if (total < skin.stars_needed) {
      return { ok: false, error: 'skin_locked', stars_needed: skin.stars_needed, stars_total: total };
    }
    changes.skin = skin.skin_id;
  }

  Object.keys(changes).forEach(function (field) {
    const col = headers.indexOf(field);
    if (col === -1) throw new Error('missing_column_' + field + ' (run setup)');
    s.getRange(rowIndex + 1, col + 1).setValue(changes[field]);
    values[rowIndex][col] = changes[field];
  });

  const updated = {};
  headers.forEach(function (h, i) { updated[h] = values[rowIndex][i]; });
  return { ok: true, profile: publicProfile(updated) };
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
    scoreRows.push({
      event_id: id, profile_id: r.profile_id, game_id: r.game_id,
      score: num(r.score), level: num(r.level), stars: num(r.stars), seconds: num(r.seconds),
      played_at: toDate(r.played_at, now), received_at: now,
    });
    accepted.push(id);
  });
  appendObjects('Scores', scoreRows);

  const seenAch = {};
  rows('Achievements').forEach(function (a) { seenAch[a.profile_id + '|' + a.achievement_id] = true; });
  const achRows = [];
  const achAccepted = [];
  achievements.forEach(function (a) {
    if (!a || !profileIds[a.profile_id] || !ID_PATTERN.test(String(a.achievement_id || ''))) return;
    const key = a.profile_id + '|' + a.achievement_id;
    if (seenAch[key]) { achAccepted.push(key); return; }
    seenAch[key] = true;
    achRows.push({ profile_id: a.profile_id, achievement_id: a.achievement_id, earned_at: toDate(a.earned_at, now) });
    achAccepted.push(key);
  });
  appendObjects('Achievements', achRows);

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

/** Appends objects as rows, matching keys to the tab's header row (column order doesn't matter). */
function appendObjects(name, objects) {
  if (!objects.length) return;
  const s = sheet(name);
  const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  const data = objects.map(function (o) {
    return headers.map(function (h) { return o[h] === undefined ? '' : o[h]; });
  });
  s.getRange(s.getLastRow() + 1, 1, data.length, headers.length).setValues(data);
}

function isActive(row) {
  return row.active !== false && String(row.active).toUpperCase() !== 'FALSE';
}

function publicProfile(p) {
  return {
    profile_id: p.profile_id, nickname: p.nickname, avatar: p.avatar, colour: p.colour,
    skin: p.skin ? String(p.skin) : '',
  };
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
