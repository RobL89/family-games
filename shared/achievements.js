// Badges (P16) and the rules for earning them (P8). The Sheet only records which
// badges each player has; the rules live here. Stats combine what the Sheet
// last said with anything still waiting in this device's outbox.

export const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First game', icon: 'b-flag', colour: '#E5533D', test: (s) => s.totalPlays >= 1 },
  { id: 'three_stars', name: 'Three stars', icon: 'b-star', colour: '#E0A100', test: (s) => s.maxStars >= 3 },
  {
    id: 'every_game', name: 'Try every game', icon: 'b-grid', colour: '#2E8FD0',
    test: (s) => s.readyGames.length > 0 && s.readyGames.every((id) => (s.plays[id] || 0) > 0),
  },
  { id: 'three_days', name: '3 days in a row', icon: 'b-cal', colour: '#F07A2A', test: (s) => s.longestRun >= 3 },
  { id: 'beat_best', name: 'Beat your best', icon: 'b-up', colour: '#2FA34A', test: (s) => s.beatBest },
  { id: 'games_10', name: '10 games', icon: 'b-10', colour: '#7E4FC9', test: (s) => s.totalPlays >= 10 },
  { id: 'games_50', name: '50 games', icon: 'b-50', colour: '#E0457B', test: (s) => s.totalPlays >= 50 },
  { id: 'games_100', name: '100 games', icon: 'b-100', colour: '#119C8F', test: (s) => s.totalPlays >= 100 },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// Where a game leaves news for the launcher to celebrate when the child comes back.
export const CELEBRATE_KEY = 'fg.celebrate';

const pad = (n) => String(n).padStart(2, '0');
function localDay(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function longestRun(days) {
  const times = [...days].map((d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  for (const t of times) {
    run = prev !== null && t - prev === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

export function pendingResults(outbox, profileId) {
  return ((outbox && outbox.results) || []).filter((r) => r.profile_id === profileId);
}

/**
 * One player's stats: the Sheet's last answer (profileData from the `profile` call)
 * plus results still waiting on this device.
 * extra.beatBest is set by the game kit when the round just played beat the old best.
 */
export function playerStats(profileData, outbox, profileId, readyGames = [], extra = {}) {
  const st = (profileData && profileData.stats) || {};
  const plays = {}, best = {}, bestStars = {};
  Object.entries(st.games || {}).forEach(([id, g]) => {
    plays[id] = g.plays || 0;
    best[id] = g.best;
    bestStars[id] = g.best_stars || 0;
  });
  let totalPlays = st.total_plays || 0;
  // Script 0.1.0 didn't send stars_total; the sum of best stars is the closest stand-in.
  let starsTotal = typeof st.stars_total === 'number'
    ? st.stars_total
    : Object.values(bestStars).reduce((a, b) => a + b, 0);
  const days = new Set(st.days_played || []);

  pendingResults(outbox, profileId).forEach((r) => {
    const s = Number(r.stars) || 0;
    const score = Number(r.score);
    plays[r.game_id] = (plays[r.game_id] || 0) + 1;
    totalPlays += 1;
    starsTotal += s;
    bestStars[r.game_id] = Math.max(bestStars[r.game_id] || 0, s);
    if (!isNaN(score) && (best[r.game_id] == null || score > best[r.game_id])) best[r.game_id] = score;
    if (r.played_at) days.add(localDay(r.played_at));
  });

  return {
    totalPlays,
    starsTotal,
    plays,
    best,
    bestStars,
    maxStars: Math.max(0, ...Object.values(bestStars)),
    longestRun: longestRun(days),
    readyGames,
    beatBest: !!extra.beatBest,
  };
}

export function earnedIds(profileData, outbox, profileId) {
  const ids = new Set(((profileData && profileData.achievements) || []).map((a) => a.achievement_id));
  ((outbox && outbox.achievements) || [])
    .filter((a) => a.profile_id === profileId)
    .forEach((a) => ids.add(a.achievement_id));
  return ids;
}

export function newlyEarned(stats, earned) {
  return ACHIEVEMENTS.filter((a) => !earned.has(a.id) && a.test(stats));
}
