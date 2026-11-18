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
 * 0.4.0: Settings tab: each game's saved state per player (P51), saved by `saveState`
 *        and returned by `profile` as `states`; the newest save wins (P78). One set of word lists per player for
 *        every game (P56), returned by `profile` as `word_lists`. Skins no longer need
 *        stars (P49, P63). Tested in Node first: tools/tests/script/ (P75).
 * 0.5.0: Plays tab: one row each time a child taps a game in the launcher, with the date and
 *        time, their name, the game, the minutes it was played and phone or PC (P88). They come
 *        in the device outbox with `sync`, like results. A "Plays summary" tab holds pivot tables
 *        (games by child, by day and by device) and a Name filter. The unused Scores and Achievements
 *        tabs are hidden, not deleted (P48, P52).
 */

const VERSION = '0.5.0';

const TABS = {
  Profiles: ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active', 'skin'],
  Scores: ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
  Achievements: ['profile_id', 'achievement_id', 'earned_at'],
  Skins: ['skin_id', 'name', 'stars_needed', 'active'],
  GameLists: ['list_id', 'profile_id', 'game_id', 'position', 'title', 'words', 'updated_at'],
  // One row per player, game and key (P51, Q12). Key "state" holds the game's own saved
  // progress as JSON text, written by the launcher's wrapper, never typed by hand.
  Settings: ['profile_id', 'game_id', 'key', 'value', 'updated_at'],
  // One row per tap on a game tile (P88). played_at is when the tile was tapped; day is the same
  // date without the time, for the summary's "by day" table; minutes grows as the game is played.
  Plays: ['played_at', 'day', 'name', 'game', 'minutes', 'device', 'play_id', 'profile_id', 'game_id', 'received_at'],
};

// The summary of the Plays tab (P88): built by setup, rebuilt by running `summary` by hand.
const SUMMARY_TAB = 'Plays summary';
// Empty rows kept below the plays. The summary's tables read the Plays tab down to its last row,
// so new plays are counted without the tables being rebuilt.
const PLAYS_ROOM = 1000;
// Kept but hidden (P52): nothing has written to them since stars and stickers were switched off
// (P48). To show one again, take it out of this list and use the tab's menu, Show sheet; setup
// hides the ones listed each time it runs.
const HIDDEN_TABS = ['Scores', 'Achievements'];
// The Plays summary's first table has a pair of columns per player: room is left for this many
// more players than there are, and at least SUMMARY_MIN_PLAYERS, before the next table starts.
const SUMMARY_SPARE_PLAYERS = 3;
const SUMMARY_MIN_PLAYERS = 6;
const MAX_PLAY_SECONDS = 6 * 60 * 60; // a longer play is taken as a clock mistake and capped

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
const MAX_LISTS = 50;      // per player (one set for every game, P56)
const MAX_WORDS = 30;      // per list (Kriss Kross fits up to 30)
const MAX_WORD_LENGTH = 20;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const COLOUR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const MAX_STATE = 20000;   // characters of JSON per game per player (game contract, section 5)

// Switched off (P49, P63): every skin is free. true brings back the old rule that a skin
// needs the player's star total to reach its stars_needed in the Skins tab.
const SKINS_NEED_STARS = false;

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
          if (name === 'Plays') formatPlays(s);
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

  // The summary of plays (P88), once the Plays tab is there (it may be added just above).
  if (!ss.getSheetByName(SUMMARY_TAB)) {
    steps.push({
      label: 'Added tab ' + SUMMARY_TAB + ': plays and minutes for games by child, by day and by device, with a Name filter',
      apply: function () { buildSummary(ss); },
    });
  }

  // Unused tabs hidden, not deleted (P48, P52).
  HIDDEN_TABS.forEach(function (name) {
    const s = ss.getSheetByName(name);
    if (s && !s.isSheetHidden()) {
      steps.push({
        label: 'Hid tab ' + name + ' (kept with its data, not deleted)',
        apply: function () { s.hideSheet(); },
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

/**
 * Rebuilds the Plays summary tab from scratch (P88): run it if the tab has been changed by hand
 * and you want it back as it was. Any changes made to that tab by hand are lost; the Plays tab
 * itself is never touched.
 */
function summary() {
  buildSummary(SpreadsheetApp.getActiveSpreadsheet());
  Logger.log('Rebuilt the ' + SUMMARY_TAB + ' tab');
}

/**
 * For trying 0.5.0 on a COPY of the spreadsheet only (P88): adds made-up plays for each player,
 * today and yesterday, so the Plays summary's tables and Name filter have something to show.
 * Refuses to run unless the spreadsheet's name has "copy" or "backup" in it.
 */
function previewPlays() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!/copy|backup/i.test(ss.getName())) throw new Error('previewPlays is for a copy only: this spreadsheet is called ' + ss.getName());
  const now = new Date();
  const plays = [];
  rows('Profiles').filter(isActive).forEach(function (p, i) {
    const games = rows('Settings').filter(function (r) { return r.profile_id === p.profile_id; })
      .map(function (r) { return String(r.game_id); }).concat(['example-game']);
    [0, 1, 2].forEach(function (k) {
      plays.push({
        play_id: 'preview_' + i + '_' + k,
        profile_id: p.profile_id,
        game_id: games[k % games.length],
        game: games[k % games.length],
        device: k % 2 ? 'Phone' : 'PC',
        played_at: new Date(now.getTime() - k * 20 * 60 * 60 * 1000).toISOString(),
        seconds: 60 * (3 + 4 * k + i),
      });
    });
  });
  withLock(function () { recordPlays(plays, now); });
  Logger.log('Added ' + plays.length + ' made-up plays to this copy');
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
      case 'saveState': return json(withLock(function () { return saveState(body); }));
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
    word_lists: wordListsFor(profileId),
    states: statesFor(profileId),
  };
}

/**
 * A player's word lists, one set for every game (P56), in order (the first is the default):
 *   [{list_id, title, words}]
 * Lists saved since 0.4.0 have no game_id. A player whose lists haven't been saved since
 * then still has rows per game: their first game's lists (by game_id) stand in, as the
 * launcher did before (P61), until Game setup next saves them.
 */
function wordListsFor(profileId) {
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GameLists')) return [];
  const mine = rows('GameLists').filter(function (r) { return r.profile_id === profileId; });
  let pick = mine.filter(function (r) { return String(r.game_id || '') === ''; });
  if (!pick.length) {
    const games = mine.map(function (r) { return String(r.game_id || ''); })
      .filter(function (g) { return ID_PATTERN.test(g); })
      .sort();
    pick = mine.filter(function (r) { return String(r.game_id) === games[0]; });
  }
  return pick
    .sort(function (a, b) { return (Number(a.position) || 0) - (Number(b.position) || 0); })
    .map(function (r) {
      return { list_id: String(r.list_id), title: String(r.title || ''), words: splitWords(r.words) };
    });
}

function splitWords(value) {
  return String(value || '').split(/[\s,;]+/).map(function (w) { return w.trim(); }).filter(Boolean);
}

/**
 * Replaces one player's word lists, in the order given (the first is the default):
 *   { profile_id, lists: [ {list_id?, title, words: ['cat', 'dog']} ] }
 * One set for every game (P56): a game_id sent by an older launcher is ignored, and all the
 * player's rows are replaced, including any from before 0.4.0 kept per game. That is how
 * the old lists move. An empty lists array removes them all.
 */
function saveLists(body) {
  const profileId = String(body.profile_id || '');
  if (!ID_PATTERN.test(profileId)) return { ok: false, error: 'bad_profile_id' };
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
      game_id: '',
      position: i + 1,
      title: cleanText(l.title, 40) || 'List ' + (i + 1),
      words: words.join(', '),
      updated_at: now,
    });
  }

  // Keep every other player's rows, swap in the new ones, and rewrite the tab body.
  const s = sheet('GameLists');
  const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  const keep = rows('GameLists').filter(function (r) { return r.profile_id !== profileId; });
  const all = keep.concat(fresh).map(function (o) {
    return headers.map(function (h) { return o[h] === undefined ? '' : o[h]; });
  });
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, headers.length).clearContent();
  if (all.length) s.getRange(2, 1, all.length, headers.length).setValues(all);

  return { ok: true, lists: wordListsFor(profileId) };
}

/**
 * Each game's saved state for one player, with when it was made:
 *   { game_id: { state, at } }   at: ISO time. Empty until setup adds the Settings tab.
 */
function statesFor(profileId) {
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings')) return {};
  const out = {};
  rows('Settings').forEach(function (r) {
    if (r.profile_id !== profileId || r.key !== 'state' || !ID_PATTERN.test(String(r.game_id || ''))) return;
    // String() first: the Sheet turns JSON like 42 or true into a number or TRUE.
    try { out[r.game_id] = { state: JSON.parse(String(r.value)), at: toIso(r.updated_at) }; } catch (err) { /* not JSON: skipped */ }
  });
  return out;
}

/**
 * Keeps one game's saved state for one player (P51):
 *   { profile_id, game_id, state, at }   state: anything JSON can hold, up to MAX_STATE characters;
 *                                        at: when the game made it (ISO time, from the device).
 * The newest save wins (P78): one older than what the Sheet has is ignored (saved: false), so a
 * device coming back online can't overwrite newer play from another device. A time in the future
 * (a device clock running fast) counts as now, so it can't win for ever.
 */
function saveState(body) {
  const profileId = String(body.profile_id || '');
  const gameId = String(body.game_id || '');
  if (!ID_PATTERN.test(profileId)) return { ok: false, error: 'bad_profile_id' };
  if (!ID_PATTERN.test(gameId)) return { ok: false, error: 'bad_game_id' };
  const value = JSON.stringify(body.state === undefined ? null : body.state);
  if (value.length > MAX_STATE) return { ok: false, error: 'state_too_big' };
  if (!rows('Profiles').some(function (p) { return p.profile_id === profileId; })) return { ok: false, error: 'no_such_profile' };
  const now = new Date();
  const at = toDate(body.at, now) > now ? now : toDate(body.at, now);
  const kept = setSetting(profileId, gameId, 'state', value, at);
  return { ok: true, saved: kept.saved, at: toIso(kept.at) };
}

/**
 * Writes one Settings row (player, game, key) made at `at`: changes it if it's there and not
 * newer, adds it if not. Returns { saved, at } with the time of what the row now holds.
 */
function setSetting(profileId, gameId, key, value, at) {
  const s = sheet('Settings');
  const values = s.getDataRange().getValues();
  const headers = values[0].map(String);
  const col = function (h) {
    const i = headers.indexOf(h);
    if (i === -1) throw new Error('missing_column_' + h + ' (run setup)');
    return i;
  };
  const p = col('profile_id'), g = col('game_id'), k = col('key'), v = col('value'), u = col('updated_at');
  for (let i = 1; i < values.length; i++) {
    if (values[i][p] === profileId && values[i][g] === gameId && values[i][k] === key) {
      if (toTime(values[i][u]) > at.getTime()) return { saved: false, at: values[i][u] };
      s.getRange(i + 1, v + 1).setValue(value);
      s.getRange(i + 1, u + 1).setValue(at);
      return { saved: true, at: at };
    }
  }
  appendObjects('Settings', [{ profile_id: profileId, game_id: gameId, key: key, value: value, updated_at: at }]);
  return { saved: true, at: at };
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
 * Any active skin in the Skins tab is accepted; the star check is switched off (SKINS_NEED_STARS).
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
    if (SKINS_NEED_STARS) {
      const total = starsTotalFor(profileId);
      if (total < skin.stars_needed) {
        return { ok: false, error: 'skin_locked', stars_needed: skin.stars_needed, stars_total: total };
      }
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
 *     achievements: [ {profile_id, achievement_id, earned_at} ],
 *     plays: [ {play_id, profile_id, game_id, game, device, played_at, seconds} ] }   (0.5.0, P88)
 * Duplicates are skipped, so a device can safely send the same outbox twice. A play sent again
 * with more seconds updates its minutes.
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

  const plays = Array.isArray(body.plays) ? body.plays.slice(0, MAX_BATCH) : [];
  return {
    ok: true,
    accepted: accepted,
    duplicates: duplicates,
    rejected: rejected,
    achievements_recorded: achAccepted,
    plays_done: recordPlays(plays, now),
  };
}

/**
 * Plays (P88): a new play_id adds a row; one already in the tab updates its minutes if more time
 * came in. Returns { play_id, seconds } for each play the device can stop sending: recorded,
 * updated, already there, or refused (an unknown child or game would be refused every time).
 */
function recordPlays(plays, now) {
  if (!plays.length) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName('Plays');
  if (!s) return []; // setup not run yet: the plays wait on the device
  const tz = ss.getSpreadsheetTimeZone();
  const values = s.getDataRange().getValues();
  const headers = values[0].map(String);
  const idCol = headers.indexOf('play_id');
  const minCol = headers.indexOf('minutes');
  const rowOf = {};
  for (let i = 1; i < values.length; i++) rowOf[String(values[i][idCol])] = i + 1;

  const names = {};
  rows('Profiles').forEach(function (p) { names[p.profile_id] = cleanText(p.nickname, 40); });

  const done = [];
  const fresh = [];
  const freshById = {};
  plays.forEach(function (p) {
    const id = String(p && p.play_id || '');
    const seconds = Math.max(0, Math.min(MAX_PLAY_SECONDS, Math.round(Number(p && p.seconds) || 0)));
    if (!ID_PATTERN.test(id)) return; // nothing to tell the device: it can't be named
    done.push({ play_id: id, seconds: Number(p.seconds) || 0 });
    if (!Object.prototype.hasOwnProperty.call(names, String(p.profile_id)) || !ID_PATTERN.test(String(p.game_id || ''))) return; // refused
    const minutes = toMinutes(seconds);

    if (freshById[id]) { // twice in one batch
      freshById[id].minutes = Math.max(freshById[id].minutes, minutes);
    } else if (rowOf[id]) {
      const cell = s.getRange(rowOf[id], minCol + 1);
      if (minutes > (Number(cell.getValues()[0][0]) || 0)) cell.setValues([[minutes]]);
    } else {
      const at = toDate(p.played_at, now);
      const row = {
        played_at: at,
        day: dayOf(at, tz),
        name: names[p.profile_id],
        game: cleanText(p.game, 60) || p.game_id,
        minutes: minutes,
        device: cleanText(p.device, 20),
        play_id: id,
        profile_id: p.profile_id,
        game_id: p.game_id,
        received_at: now,
      };
      freshById[id] = row;
      fresh.push(row);
    }
  });
  if (fresh.length) {
    makeRoom(ss, s, fresh.length);
    appendObjects('Plays', fresh);
  }
  return done;
}

function toMinutes(seconds) {
  return Math.round(seconds / 6) / 10; // to a tenth of a minute
}

/** The date of `at` in the Sheet's time zone, as noon UTC that day: shown as that date anywhere near London. */
function dayOf(at, tz) {
  const ymd = Utilities.formatDate(at, tz, 'yyyy-MM-dd').split('-').map(Number);
  return new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], 12));
}

/**
 * Keeps empty rows below the plays (P88). New rows go in above the tab's last row, inside the
 * range the summary reads, so its tables grow with the tab. If a table or the Name filter still
 * doesn't reach the end, the summary is rebuilt.
 */
function makeRoom(ss, s, adding) {
  const max = s.getMaxRows();
  if (s.getLastRow() + adding < max) return;
  s.insertRowsBefore(max, s.getLastRow() + adding - max + 1 + PLAYS_ROOM);
  formatPlays(s);
  const summaryTab = ss.getSheetByName(SUMMARY_TAB);
  if (!summaryTab) return;
  const end = s.getMaxRows();
  const short = summaryTab.getPivotTables().some(function (t) { return t.getSourceDataRange().getLastRow() < end; })
    || summaryTab.getSlicers().some(function (x) { return x.getRange().getLastRow() < end; });
  if (short) buildSummary(ss);
}

/** Date and number formats for the Plays tab's columns, down to its last row. */
function formatPlays(s) {
  const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  const formats = { played_at: 'ddd dd/mm/yyyy hh:mm', day: 'ddd dd/mm/yyyy', minutes: '0.0', received_at: 'dd/mm/yyyy hh:mm' };
  Object.keys(formats).forEach(function (h) {
    const col = headers.indexOf(h);
    if (col >= 0 && s.getMaxRows() > 1) s.getRange(2, col + 1, s.getMaxRows() - 1, 1).setNumberFormat(formats[h]);
  });
  // Easy to read (18 Nov 2026): wide enough for a date and time or a game's name; the ids and the
  // time the Sheet got the play are for the script, so they're hidden (P52), not removed.
  const widths = { played_at: 150, day: 110, name: 100, game: 160, minutes: 70, device: 70 };
  Object.keys(widths).forEach(function (h) {
    const col = headers.indexOf(h);
    if (col >= 0) s.setColumnWidth(col + 1, widths[h]);
  });
  ['play_id', 'profile_id', 'game_id', 'received_at'].forEach(function (h) {
    const col = headers.indexOf(h);
    if (col >= 0) s.hideColumns(col + 1);
  });
}

/**
 * The Plays summary tab (P88): three pivot tables side by side, each with plays and minutes: games
 * by child (games down, children across, each child's columns coloured apart), then by day
 * (newest first) and by device. A Name filter above them filters all three. Rebuilding starts
 * from an empty tab.
 */
function buildSummary(ss) {
  const plays = ss.getSheetByName('Plays');
  if (!plays) throw new Error('missing_tab_Plays (run setup)');
  let s = ss.getSheetByName(SUMMARY_TAB);
  if (s) { // start from an empty tab: no tables, filter, text, formats or colours left from before
    s.getPivotTables().forEach(function (t) { t.remove(); });
    s.getSlicers().forEach(function (x) { x.remove(); });
    s.clear();
    s.clearConditionalFormatRules();
  } else {
    s = ss.insertSheet(SUMMARY_TAB);
  }
  formatPlays(plays);
  const headers = plays.getRange(1, 1, 1, plays.getLastColumn()).getValues()[0].map(String);
  const col = function (h) {
    const i = headers.indexOf(h);
    if (i < 0) throw new Error('missing_column_' + h + ' in Plays (run setup)');
    return i + 1;
  };
  const source = plays.getRange(1, 1, plays.getMaxRows(), headers.length);
  const notEmpty = function () { return SpreadsheetApp.newFilterCriteria().whenCellNotEmpty().build(); };

  // The Name filter, top left. On the name column. "Not empty" is its only condition to start
  // with: that is what keeps the empty rows below the plays out of the tables (a "not empty"
  // filter on each table didn't, seen on a copy 18 Nov 2026). A null filter, tried first, dropped
  // the column too, so Google put the filter on played_at with no names to pick.
  const filter = s.insertSlicer(source, 1, 1);
  filter.setTitle('Name');
  filter.setColumnFilterCriteria(col('name'), notEmpty());
  filter.setApplyToPivotTables(true);

  // Layout (Rob, 18 Nov 2026). First, games by child: games down the side, each child across the
  // top with their plays and minutes, a total for each game at the end. It grows sideways, two
  // columns per child, so room is left for SUMMARY_SPARE_PLAYERS more players than there are now;
  // if it ever runs into the next table, run `summary`. Then minutes by day (it grows downwards,
  // one row a day) and by device. By game and by child are the first table's totals, so they
  // aren't repeated.
  const players = Math.max(SUMMARY_MIN_PLAYERS, rows('Profiles').length + SUMMARY_SPARE_PLAYERS);
  const gridWidth = 1 + (players + 1) * 2;
  const dayAt = gridWidth + 2;
  const deviceAt = dayAt + 4;
  const tables = [
    { at: 1, by: 'game', label: 'Game', across: 'name', acrossLabel: 'Child', title: 'Games by child' },
    { at: dayAt, by: 'day', label: 'Day', title: 'By day', newestFirst: true },
    { at: deviceAt, by: 'device', label: 'Device', title: 'By device' },
  ];
  tables.forEach(function (t) {
    s.getRange(4, t.at).setValues([[t.title]]).setFontWeight('bold').setFontSize(12);
    const table = s.getRange(5, t.at).createPivotTable(source);
    const group = table.addRowGroup(col(t.by));
    group.setDisplayName(t.label);
    group.showTotals(true);
    if (t.newestFirst) group.sortDescending();
    if (t.across) table.addColumnGroup(col(t.across)).setDisplayName(t.acrossLabel).showTotals(true);
    table.addPivotValue(col('play_id'), SpreadsheetApp.PivotTableSummarizeFunction.COUNTA).setDisplayName('Plays');
    table.addPivotValue(col('minutes'), SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName('Minutes');
  });

  // A short note beside the filter, in grey.
  s.getRange(1, 5, 2, 1).setValues([
    ['Plays: times a game was opened. Minutes: time it was on screen and played.'],
    ['Pick children with the Name filter: Clear, tick names, OK. Select all to see everyone.'],
  ]).setFontColor('#5F6368');

  // Whole minutes and plays; dates as dates. Column widths to fit.
  s.getRange(6, 1, 400, deviceAt + 2).setNumberFormat('0');
  s.getRange(6, dayAt, 400, 1).setNumberFormat('ddd dd/mm/yyyy');
  s.setColumnWidth(1, 160);
  s.setColumnWidths(2, gridWidth - 1, 64);
  s.setColumnWidth(gridWidth + 1, 30);
  s.setColumnWidth(dayAt, 120);
  s.setColumnWidths(dayAt + 1, 2, 64);
  s.setColumnWidth(dayAt + 3, 30);
  s.setColumnWidth(deviceAt, 90);
  s.setColumnWidths(deviceAt + 1, 2, 64);

  // Each child's pair of columns in games by child is told apart by colour: every other child
  // shaded blue, the totals shaded yellow, and Plays in grey so Minutes stand out. These are
  // conditional colours, so they follow the table as children and games are added: a column is
  // coloured by the child named at the top of its pair (row 6), a row only if it has a game.
  // The first rule that fits a cell is the one Google uses, so the order matters.
  const grid = s.getRange(6, 2, 400, gridWidth - 1);
  const pair = 'INDEX($6:$6,COLUMN()-MOD(COLUMN(),2))';
  const body = 'ROW()>7,$A6<>""';
  const plays_ = 'ISEVEN(COLUMN())';
  const shaded = 'ISEVEN(INT((COLUMN()-2)/2))';
  const header = 'ROW()>=6,ROW()<=7,' + pair + '<>""';
  const rule = function (formula, background, font, bold) {
    const r = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(' + formula + ')').setRanges([grid]);
    if (background) r.setBackground(background);
    if (font) r.setFontColor(font);
    if (bold) r.setBold(true);
    return r.build();
  };
  const TOTAL = '#FEF3C7', SHADE = '#E3EDFB', GREY = '#80868B', HEAD = '#1A3E72', HEAD_ALT = '#3B6FB6', HEAD_TOTAL = '#B45309';
  s.setConditionalFormatRules([
    rule(header + ',' + pair + '="Grand Total"', HEAD_TOTAL, '#FFFFFF', true),
    rule(header + ',' + shaded, HEAD, '#FFFFFF', true),
    rule(header, HEAD_ALT, '#FFFFFF', true),
    rule(body + ',' + pair + '="Grand Total",' + plays_, TOTAL, GREY),
    rule(body + ',' + pair + '="Grand Total"', TOTAL, null, true),
    rule(body + ',' + pair + '<>"",' + shaded + ',' + plays_, SHADE, GREY),
    rule(body + ',' + pair + '<>"",' + shaded, SHADE),
    rule(body + ',' + pair + '<>"",' + plays_, null, GREY),
  ]);
  return s;
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
