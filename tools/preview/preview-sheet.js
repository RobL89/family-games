// Stand-in Sheet for the private preview (tools/preview/README.md). Not part of the live site.
// The preview page can't reach the Apps Script (a claude.ai page may not call other sites), so
// build_preview.py points shared/api.js's call() here instead. It answers like Code.gs 0.4.0
// (one set of word lists per child, each game's state, skins without stars) and keeps its
// made-up players in this browser's storage only.
// Nothing here ever reaches the real Sheet.

const KEY = 'fg.preview.sheet';
const VERSION = '0.4.0 (preview stand-in)';
const ID = /^[A-Za-z0-9_-]{1,40}$/;
const COLOUR = /^#[0-9A-Fa-f]{6}$/;

// The family code on a preview device: any code works, so fill one in if the device has none.
try {
  if (!localStorage.getItem('fg.familyCode')) localStorage.setItem('fg.familyCode', JSON.stringify('preview'));
} catch { /* storage blocked: the launcher asks for a code, and any code works */ }

function seed() {
  return {
    profiles: [
      { profile_id: 'p_sam', nickname: 'Sam', avatar: 'fox', colour: '#2E8FD0', active: true, skin: 'sticker' },
      { profile_id: 'p_alex', nickname: 'Alex', avatar: 'bunny', colour: '#E0457B', active: true, skin: 'sticker' },
    ],
    // Same star targets as a new live Skins tab (Code.gs DEFAULT_SKINS); the launcher ignores them (P49).
    skins: [
      { skin_id: 'sticker', name: 'Sticker book', stars_needed: 0 },
      { skin_id: 'fairy', name: 'Fairy', stars_needed: 10 },
      { skin_id: 'blocks', name: 'Blocks', stars_needed: 20 },
      { skin_id: 'unicorn', name: 'Unicorn', stars_needed: 30 },
    ],
    scores: [],
    achievements: [],
    lists: [
      { list_id: 'l_demo1', profile_id: 'p_sam', game_id: '', position: 1, title: 'Animals', words: ['cat', 'dog', 'cow', 'pig', 'horse'] },
      { list_id: 'l_demo2', profile_id: 'p_sam', game_id: '', position: 2, title: 'Colours', words: ['red', 'blue', 'green', 'pink'] },
    ],
    states: [], // { profile_id, game_id, state, at }: the newest save wins (P78)
  };
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); }
}
function store(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full or blocked */ }
}

const pub = (p) => ({ profile_id: p.profile_id, nickname: p.nickname, avatar: p.avatar, colour: p.colour, skin: p.skin });
const starsTotal = (db, pid) => db.scores.filter((s) => s.profile_id === pid).reduce((n, s) => n + (Number(s.stars) || 0), 0);
const newId = (prefix) => prefix + Math.random().toString(36).slice(2, 12);

// One set per child (P56), as Code.gs 0.4.0's wordListsFor.
function listsFor(db, pid) {
  return db.lists.filter((l) => l.profile_id === pid).sort((a, b) => a.position - b.position)
    .map((l) => ({ list_id: l.list_id, title: l.title, words: l.words.slice() }));
}

function statesFor(db, pid) {
  const out = {};
  (db.states || []).filter((x) => x.profile_id === pid).forEach((x) => { out[x.game_id] = { state: x.state, at: x.at }; });
  return out;
}

function profile(db, pid) {
  const p = db.profiles.find((x) => x.profile_id === pid);
  if (!p) return { ok: false, error: 'no_such_profile' };
  const sc = db.scores.filter((s) => s.profile_id === pid).sort((a, b) => (a.played_at < b.played_at ? 1 : -1));
  const games = {};
  sc.forEach((s) => {
    const g = games[s.game_id] = games[s.game_id] || { plays: 0, best: null, best_stars: 0, last_played: null };
    g.plays += 1;
    g.best = g.best == null ? s.score : Math.max(g.best, s.score);
    g.best_stars = Math.max(g.best_stars, s.stars);
    g.last_played = g.last_played || s.played_at;
  });
  return {
    ok: true,
    profile: pub(p),
    recent: sc.slice(0, 10),
    stats: { total_plays: sc.length, stars_total: starsTotal(db, pid), games, days_played: [...new Set(sc.map((s) => String(s.played_at).slice(0, 10)))].sort() },
    achievements: db.achievements.filter((a) => a.profile_id === pid).map((a) => ({ achievement_id: a.achievement_id, earned_at: a.earned_at })),
    word_lists: listsFor(db, pid),
    states: statesFor(db, pid),
  };
}

function answer(db, action, body) {
  switch (action) {
    case 'ping': return { ok: true, version: VERSION };
    case 'profiles': return { ok: true, version: VERSION, profiles: db.profiles.filter((p) => p.active).map(pub), skins: db.skins };
    case 'profile': return profile(db, body.profile_id);
    case 'addProfile': {
      const nickname = String(body.nickname || '').trim().slice(0, 20);
      if (!nickname) return { ok: false, error: 'nickname_required' };
      const p = { profile_id: newId('p_'), nickname, avatar: ID.test(String(body.avatar || '')) ? body.avatar : 'fox',
        colour: COLOUR.test(String(body.colour || '')) ? body.colour : '#F07A2A', active: true, skin: 'sticker' };
      db.profiles.push(p);
      return { ok: true, profile: pub(p) };
    }
    case 'updateProfile': {
      const p = db.profiles.find((x) => x.profile_id === body.profile_id);
      if (!p) return { ok: false, error: 'no_such_profile' };
      if (body.skin !== undefined) {
        const skin = db.skins.find((k) => k.skin_id === String(body.skin));
        if (!skin) return { ok: false, error: 'no_such_skin' }; // no star check, as Code.gs 0.4.0 (P63)
      }
      if (body.nickname !== undefined) p.nickname = String(body.nickname).trim().slice(0, 20) || p.nickname;
      if (body.avatar !== undefined && ID.test(String(body.avatar))) p.avatar = body.avatar;
      if (body.colour !== undefined && COLOUR.test(String(body.colour))) p.colour = body.colour;
      if (body.skin !== undefined) p.skin = String(body.skin);
      return { ok: true, profile: pub(p) };
    }
    case 'saveLists': {
      const pid = String(body.profile_id || ''); // game_id ignored: one set per child (P56)
      if (!db.profiles.some((p) => p.profile_id === pid)) return { ok: false, error: 'no_such_profile' };
      if (!Array.isArray(body.lists)) return { ok: false, error: 'lists_required' };
      const fresh = [];
      for (let i = 0; i < body.lists.length; i++) {
        const l = body.lists[i] || {};
        const words = (Array.isArray(l.words) ? l.words : String(l.words || '').split(/[\s,;]+/)).map((w) => String(w).trim().slice(0, 20)).filter(Boolean);
        if (!words.length) return { ok: false, error: 'empty_list', position: i + 1 };
        if (words.length > 30) return { ok: false, error: 'too_many_words', position: i + 1 };
        fresh.push({ list_id: ID.test(String(l.list_id || '')) ? l.list_id : newId('l_'), profile_id: pid, game_id: '', position: i + 1,
          title: String(l.title || '').trim().slice(0, 40) || `List ${i + 1}`, words });
      }
      db.lists = db.lists.filter((l) => l.profile_id !== pid).concat(fresh);
      return { ok: true, lists: listsFor(db, pid) };
    }
    case 'saveState': {
      const pid = String(body.profile_id || ''), gid = String(body.game_id || '');
      if (!ID.test(gid)) return { ok: false, error: 'bad_game_id' };
      if (!db.profiles.some((p) => p.profile_id === pid)) return { ok: false, error: 'no_such_profile' };
      const state = body.state === undefined ? null : body.state;
      if (JSON.stringify(state).length > 20000) return { ok: false, error: 'state_too_big' };
      const now = new Date().toISOString();
      const at = body.at && Date.parse(body.at) && body.at < now ? new Date(body.at).toISOString() : now;
      const had = (db.states || []).find((x) => x.profile_id === pid && x.game_id === gid);
      if (had && had.at > at) return { ok: true, saved: false, at: had.at };
      db.states = (db.states || []).filter((x) => x !== had).concat([{ profile_id: pid, game_id: gid, state, at }]);
      return { ok: true, saved: true, at };
    }
    case 'sync': {
      const seen = new Set(db.scores.map((s) => s.event_id));
      const accepted = [], duplicates = [], rec = [];
      (body.results || []).forEach((r) => {
        if (seen.has(r.event_id)) { duplicates.push(r.event_id); return; }
        db.scores.push(r); accepted.push(r.event_id);
      });
      (body.achievements || []).forEach((a) => {
        const key = a.profile_id + '|' + a.achievement_id;
        if (!db.achievements.some((x) => x.profile_id + '|' + x.achievement_id === key)) db.achievements.push(a);
        rec.push(key);
      });
      return { ok: true, accepted, duplicates, rejected: [], achievements_recorded: rec };
    }
    default: return { ok: false, error: 'unknown_action' };
  }
}

// What shared/api.js's call() does in the preview: same answers and errors, after a short pause like a real call.
export async function standIn(action, body = {}) {
  await new Promise((r) => setTimeout(r, 150));
  const db = load();
  const result = JSON.parse(JSON.stringify(answer(db, action, body)));
  store(db);
  if (!result.ok) throw new Error(result.error || 'unknown_error');
  return result;
}

// Start the preview's data again (the stamp's "Reset" link calls this).
export function resetStandIn() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('fg.')).forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('fg.familyCode', JSON.stringify('preview'));
  } catch { /* nothing to reset */ }
}
