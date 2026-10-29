// Game settings from the Sheet (script 0.3.0): the Settings and Lists tabs.
//
// Each game describes its settings in games/<id>/settings.js, for example:
//
//   export const SETTINGS = {
//     speed:     { default: 2, min: 1, max: 5, about: 'How fast, 1 (slow) to 5 (fast)' },
//     mode:      { default: 'spell', options: ['spell', 'count'], about: '...' },
//     tables:    { type: 'numbers', default: [2, 5, 10], min: 1, max: 12, about: '...' },
//     sums:      { type: 'choices', default: ['add'], options: ['add', 'take'], about: '...' },
//     letters:   { type: 'items', default: ['a', 'b'], about: '...' },
//     word_list: { type: 'list', shared: true, default: 'starter_words', fallback: ['cat', 'dog'], about: '...' },
//     speak:     { shared: true, default: true, about: '...' },
//   };
//
// Types: number and boolean follow the default; a default string with options is
// a pick from the options; 'items' is a list of words; 'numbers' a list of numbers;
// 'choices' several picks from the options; 'list' is a word list: a list_id from
// the Lists tab, or the words themselves typed into the cell.
//
// shared: true means the setting's row in the Sheet uses game "all", so every
// game shares it (one word list per child, not one per game).
//
// In the Sheet, each setting is a row: game_id | setting | about | everyone | <a column per child>.
// The most specific value wins:
//   this game + this child  >  "all" games + this child  >  this game + everyone  >  "all" + everyone  >  the game's default.
// A value that doesn't make sense (a word where a number should be) falls back to the game's default.

const MAX_ITEMS = 100;

export function splitItems(text) {
  return String(text == null ? '' : text)
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

const blank = (v) => v === undefined || v === null || String(v).trim() === '';

export function kindOf(spec) {
  if (spec.type) return spec.type;
  if (typeof spec.default === 'number') return 'number';
  if (typeof spec.default === 'boolean') return 'boolean';
  return spec.options ? 'option' : 'text';
}

function listMap(config) {
  const map = {};
  ((config && config.lists) || []).forEach((l) => {
    if (l && l.list_id) map[String(l.list_id).toLowerCase()] = l;
  });
  return map;
}

function fallbackList(spec) {
  return { id: null, title: spec.fallbackTitle || '', items: (spec.fallback || []).slice() };
}

// Turns one raw cell value into the right kind. Returns { value }, { value, problem }
// (used, with a note) or { bad: true, problem } (unusable, so the next level down is tried).
function coerce(spec, raw, lists) {
  const kind = kindOf(spec);
  const fallback = (problem) => ({ bad: true, problem });

  const text = String(raw).trim();

  switch (kind) {
    case 'number': {
      const n = Number(text);
      if (!Number.isFinite(n)) return fallback(`"${text}" isn't a number`);
      const min = spec.min ?? -Infinity, max = spec.max ?? Infinity;
      if (n < min || n > max) return { value: Math.min(max, Math.max(min, n)), problem: `${n} is outside ${spec.min} to ${spec.max}, so it was kept inside` };
      return { value: n };
    }
    case 'boolean': {
      const t = text.toLowerCase();
      if (['true', 'yes', 'y', 'on', '1'].includes(t)) return { value: true };
      if (['false', 'no', 'n', 'off', '0'].includes(t)) return { value: false };
      return fallback(`"${text}" isn't yes or no`);
    }
    case 'option': {
      const t = text.toLowerCase();
      if (spec.options.includes(t)) return { value: t };
      return fallback(`"${text}" isn't one of ${spec.options.join(', ')}`);
    }
    case 'items': {
      const items = splitItems(text);
      return items.length ? { value: items } : fallback('no items');
    }
    case 'numbers': {
      const min = spec.min ?? -Infinity, max = spec.max ?? Infinity;
      const parts = splitItems(text);
      const nums = parts.map(Number).filter((n) => Number.isFinite(n) && n >= min && n <= max);
      if (!nums.length) return fallback(`no usable numbers in "${text}"`);
      return nums.length < parts.length
        ? { value: nums, problem: `left out ${parts.length - nums.length} that aren't numbers from ${spec.min} to ${spec.max}` }
        : { value: nums };
    }
    case 'choices': {
      const parts = splitItems(text).map((s) => s.toLowerCase());
      const picks = parts.filter((s) => spec.options.includes(s));
      if (!picks.length) return fallback(`none of "${text}" is one of ${spec.options.join(', ')}`);
      const odd = parts.filter((s) => !spec.options.includes(s));
      return odd.length
        ? { value: [...new Set(picks)], problem: `left out ${odd.join(', ')} (not one of ${spec.options.join(', ')})` }
        : { value: [...new Set(picks)] };
    }
    case 'list': {
      const found = lists[text.toLowerCase()];
      if (found) {
        const items = splitItems(found.items);
        if (!items.length) return fallback(`list "${text}" is empty`);
        return { value: { id: String(found.list_id), title: String(found.title || ''), items } };
      }
      const items = splitItems(text);
      // A single word that looks like a list name but isn't in the Lists tab is most likely a typo.
      if (items.length === 1 && /_/.test(items[0])) return fallback(`no list called "${text}" in the Lists tab`);
      return items.length ? { value: { id: null, title: '', items } } : fallback('no words');
    }
    default:
      return { value: text };
  }
}

function defaultValue(spec, lists) {
  const kind = kindOf(spec);
  if (kind === 'list') {
    const found = lists && lists[String(spec.default || '').toLowerCase()];
    if (found && splitItems(found.items).length) {
      return { id: String(found.list_id), title: String(found.title || ''), items: splitItems(found.items) };
    }
    return fallbackList(spec);
  }
  return Array.isArray(spec.default) ? spec.default.slice() : spec.default;
}

/**
 * Works out every setting for one game and one child.
 *   schema:    the game's SETTINGS
 *   config:    what the Sheet sent ({ settings, lists, warnings }), or null if never fetched
 *   gameId:    e.g. 'word-worm'
 *   profileId: the child, or null
 * Returns { values, sources, problems }: values to use, where each came from, and anything odd.
 */
export function resolveSettings(schema, config, gameId, profileId) {
  const rows = (config && config.settings) || [];
  const lists = listMap(config);
  const values = {}, sources = {}, problems = [];

  Object.entries(schema).forEach(([name, spec]) => {
    const lookup = (game, who) => {
      const row = rows.find((r) => r.game_id === game && r.setting === name);
      if (!row) return undefined;
      const v = who === 'everyone' ? row.everyone : (row.players || {})[who];
      return blank(v) ? undefined : v;
    };
    const order = [];
    if (profileId) order.push([gameId, profileId], ['all', profileId]);
    order.push([gameId, 'everyone'], ['all', 'everyone']);

    // Most specific first; an unusable value is reported and the next level down is tried.
    let value, from = 'game default';
    for (const [game, who] of order) {
      const raw = lookup(game, who);
      if (raw === undefined) continue;
      const where = `${game === 'all' ? 'all games' : game}, ${who === 'everyone' ? 'everyone' : 'this child'}`;
      const result = coerce(spec, raw, lists);
      if (result.problem) problems.push(`${name} (${where}): ${result.problem}`);
      if (result.bad) continue;
      value = result.value;
      from = where;
      break;
    }
    values[name] = from === 'game default' ? defaultValue(spec, lists) : value;
    sources[name] = from;
  });

  return { values, sources, problems };
}

/**
 * Rows to seed the Settings tab from one or more game schemas.
 * games: [{ id, settings }]. Returns [[game_id, setting, about, everyone], ...].
 * Shared settings appear once, under "all".
 */
export function seedRows(games) {
  const out = [];
  const seen = new Set();
  games.forEach(({ id, settings }) => {
    Object.entries(settings).forEach(([name, spec]) => {
      const game = spec.shared ? 'all' : id;
      const key = game + '|' + name;
      if (seen.has(key)) return;
      seen.add(key);
      const d = spec.default;
      const everyone = Array.isArray(d) ? d.join(', ') : typeof d === 'boolean' ? (d ? 'TRUE' : 'FALSE') : String(d);
      out.push([game, name, spec.about || '', everyone]);
    });
  });
  return out;
}

// Settings every game can share. A game includes the ones it uses:
//   export const SETTINGS = { ...SHARED_SETTINGS.pick('word_list', 'speak'), speed: {...} };
const SHARED = {
  word_list: {
    type: 'list',
    shared: true,
    default: 'starter_words',
    fallback: ['cat', 'hat', 'ship', 'fish', 'frog', 'dog', 'sun', 'duck', 'bed', 'pig', 'hen', 'bus'],
    fallbackTitle: 'Starter words',
    about: 'Words for word games: the list_id of a list in the Lists tab, or the words themselves separated by commas.',
  },
  speak: {
    shared: true,
    default: true,
    about: "Say words and questions out loud with the device's own voice (TRUE or FALSE). Sound off in the grown-ups' corner also stops it.",
  },
};

export const SHARED_SETTINGS = {
  pick: (...names) => Object.fromEntries(names.map((n) => [n, SHARED[n]])),
};
