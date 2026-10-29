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
 * 0.3.0: Game settings and word lists you edit in the Sheet (Settings and Lists
 *        tabs), saved game progress (Progress tab), and the settings call.
 */

const VERSION = '0.3.0';

const TABS = {
  Profiles: ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active', 'skin'],
  Scores: ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
  Achievements: ['profile_id', 'achievement_id', 'earned_at'],
  Skins: ['skin_id', 'name', 'stars_needed', 'active'],
  // One row per game setting. After "everyone" comes a column per child, headed with
  // the child's name; a value there beats the everyone value for that child.
  Settings: ['game_id', 'setting', 'about', 'everyone'],
  Lists: ['list_id', 'title', 'items', 'about'],
  Progress: ['profile_id', 'game_id', 'data', 'updated_at'],
};

const SETTINGS_FIXED = TABS.Settings;

// Rows put into a brand-new Lists tab.
const DEFAULT_LISTS = [
  ['starter_words', 'Starter words', 'cat, hat, ship, fish, frog, dog, sun, duck, bed, pig, hen, bus',
    "Example words. Replace them with this week's spellings, or add more lists below and name one in the Settings tab."],
];

// Rows for the Settings tab: [game_id, setting, about, everyone].
// Made from each game's games/<id>/settings.js by tools/settings-seed.mjs; don't edit by hand.
// setup() adds any of these that the tab doesn't have yet, and never changes rows already there.
// <SETTINGS-SEED>
const DEFAULT_SETTINGS = [
  ["all","word_list","Words for word games: the list_id of a list in the Lists tab, or the words themselves separated by commas.","starter_words"],
  ["all","speak","Say words and questions out loud with the device's own voice (TRUE or FALSE). Sound off in the grown-ups' corner also stops it.","TRUE"],
  ["word-worm","mode","spell = eat the letters of each word in order; letters = find the letter shown (for early readers); count = eat the numbers in order.","spell"],
  ["word-worm","show_word","spell mode: always = the word stays on screen; peek = shown for a few seconds, then hidden; listen = only said out loud.","always"],
  ["word-worm","words_per_round","Words (or letters, or counts) in one round.","5"],
  ["word-worm","decoys","Wrong letters or numbers in the garden at once.","3"],
  ["word-worm","speed","How fast the worm goes: 1 (slow) to 5 (fast).","2"],
  ["word-worm","letter_case","Letters shown as lower case (a b c) or capitals (A B C).","lower"],
  ["word-worm","letters","letters mode: the letters to find, separated by commas.","a, b, c, d, e, s, t"],
  ["word-worm","count_from","count mode: the first number.","0"],
  ["word-worm","count_step","count mode: count in steps of this (2 means 0, 2, 4, 6...).","2"],
  ["word-worm","count_length","count mode: how many numbers to eat in a row.","6"],
  ["monster-cafe","sums","Kinds of order, separated by commas: add, take (away), bonds (make the number), double, half, times, share.","add, take"],
  ["monster-cafe","max_number","Biggest number in any order or answer.","10"],
  ["monster-cafe","bond_to","bonds: the number to make (10 means \"I have 7, make it 10\").","10"],
  ["monster-cafe","tables","times and share: which times tables, separated by commas.","2, 5, 10"],
  ["monster-cafe","answer_with","tap = put food on the tray one at a time (counting); pad = number buttons; auto = tap for answers up to 10, pad above.","auto"],
  ["monster-cafe","pictures","Show food pictures in the orders to help with counting (TRUE or FALSE).","TRUE"],
  ["monster-cafe","missing_number","Sometimes ask for the missing number, like ? + 3 = 7 (TRUE or FALSE).","FALSE"],
  ["monster-cafe","orders_per_round","Orders in one round.","8"],
  ["monster-cafe","patience","Seconds a monster waits before it leaves. 0 = it waits for ever.","0"],
  ["rocket-lander","from","The number at the left end of the line.","0"],
  ["rocket-lander","to","The number at the right end of the line.","10"],
  ["rocket-lander","step","Gap between landing spots: 1 = whole numbers, 0.5 = halves, 0.25 = quarters, 0.1 = tenths, 10 = tens.","1"],
  ["rocket-lander","label_every","Write a number under a mark this often: 1 = every number, 5 = 0, 5, 10..., 0 = only the two ends.","1"],
  ["rocket-lander","show_as","Halves and quarters shown as 2½ (fraction) or 2.5 (decimal).","fraction"],
  ["rocket-lander","close_enough","How near counts as a good landing: 0 = on the mark itself (long lines get a little leeway automatically); 5 = within 5.","0"],
  ["rocket-lander","landings_per_round","Landings in one round.","8"],
  ["rocket-lander","speed","How fast the rocket falls: 1 (slow) to 5 (fast).","2"],
];
// </SETTINGS-SEED>

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
const MAX_PROGRESS = 20000; // characters of JSON per child per game
const MAX_CELL = 5000;      // characters read from a settings or list cell
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
      const extra = { Skins: ' and ' + DEFAULT_SKINS.length + ' skins',
        Settings: ' and ' + DEFAULT_SETTINGS.length + ' game settings',
        Lists: ' and ' + DEFAULT_LISTS.length + ' starter list' }[name] || '';
      steps.push({
        label: 'Added tab ' + name + ' with its header row' + extra,
        apply: function () {
          const s = ss.insertSheet(name);
          writeHeaders(s, wanted);
          if (name === 'Skins') s.getRange(2, 1, DEFAULT_SKINS.length, wanted.length).setValues(DEFAULT_SKINS);
          if (name === 'Settings') formatSettings(s);
          if (name === 'Lists') formatLists(s);
          if (name === 'Progress') s.getRange('C:D').setNumberFormat('@');
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

  // Settings: rows for settings the tab doesn't have yet, and a column for each player.
  const settingsTab = ss.getSheetByName('Settings');
  // (A brand-new Settings tab gets its rows when it's made, above.)
  const newRows = settingsTab ? missingSettingRows(settingsTab) : [];
  if (newRows.length) {
    steps.push({
      label: 'Added ' + newRows.length + ' game setting' + (newRows.length > 1 ? 's' : '') + ' to Settings: ' +
        newRows.map(function (r) { return r[0] + ' ' + r[1]; }).join(', '),
      apply: function () {
        const s = ss.getSheetByName('Settings');
        const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
        const data = missingSettingRows(s).map(function (r) {
          return headers.map(function (h) {
            const i = SETTINGS_FIXED.indexOf(h);
            return i === -1 ? '' : r[i];
          });
        });
        if (data.length) s.getRange(s.getLastRow() + 1, 1, data.length, headers.length).setValues(data);
      },
    });
  }
  const players = missingPlayerColumns(settingsTab);
  if (players.length) {
    steps.push({
      label: 'Added a Settings column for ' + players.join(', ') + ' (empty, so the everyone value applies)',
      apply: function () {
        missingPlayerColumns(ss.getSheetByName('Settings')).forEach(function (n) { addSettingsColumn(n); });
      },
    });
  }
  return steps;
}

// Settings rows from DEFAULT_SETTINGS that the tab doesn't have (all of them for a new tab).
function missingSettingRows(s) {
  const have = {};
  if (s && s.getLastRow() > 1) {
    const values = s.getDataRange().getValues();
    const headers = values.shift().map(String);
    const g = headers.indexOf('game_id'), k = headers.indexOf('setting');
    values.forEach(function (r) {
      have[String(r[g]).trim().toLowerCase() + '|' + String(r[k]).trim().toLowerCase()] = true;
    });
  }
  return DEFAULT_SETTINGS.filter(function (r) { return !have[r[0] + '|' + r[1]]; });
}

// Names of active players with no column in the Settings tab (all of them for a new tab).
function missingPlayerColumns(s) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName('Profiles') || ss.getSheetByName('Profiles').getLastRow() < 2) return [];
  const headers = s ? s.getRange(1, 1, 1, Math.max(1, s.getLastColumn())).getValues()[0].map(function (h) {
    return String(h).trim().toLowerCase();
  }) : [];
  return rows('Profiles').filter(isActive).filter(function (p) {
    return headers.indexOf(String(p.nickname).trim().toLowerCase()) === -1 && headers.indexOf(String(p.profile_id).toLowerCase()) === -1;
  }).map(function (p) { return String(p.nickname); });
}

// Adds an empty column headed with a player's name to the Settings tab (if it has none).
function addSettingsColumn(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!s || !name) return;
  const last = s.getLastColumn();
  const headers = s.getRange(1, 1, 1, last).getValues()[0].map(function (h) { return String(h).trim().toLowerCase(); });
  if (headers.indexOf(String(name).trim().toLowerCase()) !== -1) return;
  s.getRange(1, last + 1).setValue(name).setFontWeight('bold');
  s.getRange(1, last + 1, s.getMaxRows(), 1).setNumberFormat('@');
}

function formatSettings(s) {
  // Plain text, so the Sheet doesn't turn "2, 5" or "1/2" into numbers or dates.
  s.getRange('D:Z').setNumberFormat('@');
  if (DEFAULT_SETTINGS.length) s.getRange(2, 1, DEFAULT_SETTINGS.length, 4).setValues(DEFAULT_SETTINGS);
  s.setFrozenColumns(2);
  s.setColumnWidth(3, 340);
  s.getRange('C:C').setWrap(true);
}

function formatLists(s) {
  s.getRange('A:C').setNumberFormat('@');
  s.getRange(2, 1, DEFAULT_LISTS.length, 4).setValues(DEFAULT_LISTS);
  s.setColumnWidth(3, 420);
  s.setColumnWidth(4, 300);
  s.getRange('C:D').setWrap(true);
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
      case 'settings': return json(Object.assign({ ok: true, version: VERSION }, readSettings()));
      case 'profile': return json(Object.assign({ ok: true }, getProfile(body.profile_id)));
      case 'addProfile': return json(withLock(function () { return addProfile(body); }));
      case 'updateProfile': return json(withLock(function () { return updateProfile(body); }));
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
    progress: progressFor(profileId),
  };
}

/** Saved progress for one player: { game_id: { data, updated_at } }. Empty if no Progress tab yet. */
function progressFor(profileId) {
  const out = {};
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Progress')) return out;
  rows('Progress').forEach(function (p) {
    if (p.profile_id !== profileId) return;
    try {
      out[String(p.game_id)] = { data: JSON.parse(String(p.data || '{}')), updated_at: String(p.updated_at) };
    } catch (err) {
      // A cell that isn't valid JSON (edited by hand) is skipped; the game uses its device copy.
    }
  });
  return out;
}

/**
 * The Settings and Lists tabs, ready for the games (shared/settings.js works out
 * which value applies to which child). Player columns are matched to players by
 * name (or profile_id); anything that doesn't fit comes back in warnings.
 */
function readSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const warnings = [];
  if (!ss.getSheetByName('Settings') || !ss.getSheetByName('Lists')) {
    return { settings: [], lists: [], warnings: ['The Settings and Lists tabs are missing: run setup'] };
  }

  const byName = {}, ids = {};
  rows('Profiles').forEach(function (p) {
    ids[p.profile_id] = true;
    const key = String(p.nickname || '').trim().toLowerCase();
    if (key && byName[key] && isActive(p)) warnings.push('Two players are called ' + p.nickname + '; their Settings column is ambiguous');
    if (key && (isActive(p) || !byName[key])) byName[key] = p.profile_id;
  });

  const values = sheet('Settings').getDataRange().getValues();
  const headers = (values.shift() || []).map(function (h) { return String(h).trim(); });
  const col = function (name) { return headers.indexOf(name); };
  const playerCols = [];
  headers.forEach(function (h, i) {
    if (!h || SETTINGS_FIXED.indexOf(h) !== -1) return;
    const pid = ids[h] ? h : byName[h.toLowerCase()];
    if (pid) playerCols.push({ i: i, pid: pid });
    else warnings.push('Settings column "' + h + '" doesn\'t match a player\'s name, so it is ignored');
  });

  const seen = {};
  const settings = [];
  values.forEach(function (r, n) {
    const game = String(r[col('game_id')] || '').trim().toLowerCase();
    const setting = String(r[col('setting')] || '').trim().toLowerCase();
    if (!game && !setting) return;
    if (!game || !setting) { warnings.push('Settings row ' + (n + 2) + ' needs both a game_id and a setting'); return; }
    if (seen[game + '|' + setting]) warnings.push('Settings has ' + game + ' ' + setting + ' twice; the first one is used');
    seen[game + '|' + setting] = true;
    const players = {};
    playerCols.forEach(function (c) {
      const v = cellValue(r[c.i]);
      if (v !== '') players[c.pid] = v;
    });
    settings.push({ game_id: game, setting: setting, everyone: cellValue(r[col('everyone')]), players: players });
  });

  const lists = [];
  const listIds = {};
  rows('Lists').forEach(function (l, n) {
    const id = String(l.list_id || '').trim();
    if (!id && !String(l.items || '').trim()) return;
    if (!ID_PATTERN.test(id)) {
      warnings.push('Lists row ' + (n + 2) + ': list_id "' + id + '" should be letters, numbers, - or _ only (no spaces)');
      return;
    }
    if (listIds[id.toLowerCase()]) warnings.push('Lists has ' + id + ' twice; the first one is used');
    listIds[id.toLowerCase()] = true;
    lists.push({ list_id: id, title: cleanText(l.title, 60), items: String(cellValue(l.items)).slice(0, MAX_CELL) });
  });

  return { settings: settings, lists: lists, warnings: warnings };
}

/** A cell's value as the games expect it: text, a number, or TRUE/FALSE. */
function cellValue(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return toIso(v) || '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return v;
  return String(v).trim().slice(0, MAX_CELL);
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
  addSettingsColumn(nickname); // so the new player can have their own settings straight away
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

  if (changes.nickname) renameSettingsColumn(String(values[rowIndex][headers.indexOf('nickname')]), changes.nickname);

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

/** When a player is renamed, their Settings column follows. */
function renameSettingsColumn(oldName, newName) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!s || !oldName) return;
  const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const i = headers.indexOf(String(oldName).trim().toLowerCase());
  if (i >= SETTINGS_FIXED.length) s.getRange(1, i + 1).setValue(newName);
}

/**
 * Takes the device outbox in one go:
 *   { results: [ {event_id, profile_id, game_id, score, level, stars, seconds, played_at} ],
 *     achievements: [ {profile_id, achievement_id, earned_at} ],
 *     progress: [ {profile_id, game_id, data, updated_at} ] }
 * Duplicates are skipped, so a device can safely send the same outbox twice.
 * Progress keeps one row per player per game; an older copy never replaces a newer one.
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

  const out = {
    ok: true,
    accepted: accepted,
    duplicates: duplicates,
    rejected: rejected,
    achievements_recorded: achAccepted,
  };
  // Left out until setup has made the Progress tab: the device then keeps its own copy.
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Progress')) {
    out.progress_saved = saveProgress(Array.isArray(body.progress) ? body.progress.slice(0, MAX_BATCH) : [], profileIds);
  }
  return out;
}

/** Upserts progress rows. Returns "profile_id|game_id|updated_at" for every entry dealt with. */
function saveProgress(list, profileIds) {
  const done = [];
  if (!list.length) return done;
  const s = sheet('Progress');
  const values = s.getDataRange().getValues();
  const headers = values[0].map(String);
  const iP = headers.indexOf('profile_id'), iG = headers.indexOf('game_id');
  const iD = headers.indexOf('data'), iU = headers.indexOf('updated_at');
  if ([iP, iG, iD, iU].indexOf(-1) !== -1) throw new Error('missing_column_in_Progress (run setup)');

  const rowOf = {};
  for (let r = 1; r < values.length; r++) rowOf[values[r][iP] + '|' + values[r][iG]] = r;
  const fresh = {};

  list.forEach(function (p) {
    if (!p) return;
    const stamp = String(p.updated_at || '');
    const key = p.profile_id + '|' + p.game_id;
    done.push(key + '|' + stamp);
    // Anything unusable is dropped (still reported as done, so the device stops resending it).
    if (!profileIds[p.profile_id] || !ID_PATTERN.test(String(p.game_id || ''))) return;
    if (!/^\d{4}-\d\d-\d\dT/.test(stamp) || !p.data || typeof p.data !== 'object' || Array.isArray(p.data)) return;
    const data = JSON.stringify(p.data);
    if (data.length > MAX_PROGRESS) return;

    const r = rowOf[key];
    if (r !== undefined) {
      if (String(values[r][iU]) < stamp) {
        s.getRange(r + 1, iD + 1).setValue(data);
        s.getRange(r + 1, iU + 1).setValue(stamp);
        values[r][iU] = stamp;
      }
    } else if (!fresh[key] || fresh[key].updated_at < stamp) {
      fresh[key] = { profile_id: p.profile_id, game_id: p.game_id, data: data, updated_at: stamp };
    }
  });
  appendObjects('Progress', Object.keys(fresh).map(function (k) { return fresh[k]; }));
  return done;
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
