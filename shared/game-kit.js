// What every game uses (P4): who's playing, and saving the result when a round ends.
//
// In a game written as a module:
//   import { getPlayer, finish, homeButton } from '../../shared/game-kit.js';
//   homeButton();                                   // a "back to games" button
//   finish({ score: 12, stars: 3, seconds: 40 });   // saves, then returns to the launcher
//   record({ score: 12, stars: 3 });                // saves but stays (for "Play again")
//
// In a game with ordinary scripts:
//   <script type="module" src="../../shared/game-kit.js"></script>
//   ...later: window.FamilyGames.finish({ score: 12, stars: 3 });
//
// stars (1 to 3) is the headline score (P17). Results go into this device's
// outbox first and reach the Sheet when the launcher next syncs (P6).

import * as api from './api.js';
import { playerStats, earnedIds, newlyEarned, CELEBRATE_KEY } from './achievements.js';

const LAUNCHER = new URL('../index.html', import.meta.url);
const GAMES_LIST = new URL('../games.json', import.meta.url);

export function getPlayer() {
  const id = new URLSearchParams(location.search).get('player');
  if (!id) return null;
  const cached = api.getCachedProfile(id);
  if (cached && cached.profile) return cached.profile;
  return api.getCachedProfiles().find((p) => p.profile_id === id) || { profile_id: id, nickname: '' };
}

export function getGameId() {
  const match = location.pathname.match(/\/games\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : 'unknown';
}

async function readyGameIds() {
  try {
    const list = await (await fetch(GAMES_LIST)).json();
    return list.games.filter((g) => g.status === 'ready').map((g) => g.id);
  } catch {
    return [getGameId()];
  }
}

let finishing = false;

// Saves a finished round and goes back to the launcher, which celebrates it.
export async function finish(result = {}) {
  if (finishing) return;
  finishing = true;
  await record(result);
  goHome();
}

// Saves a finished round but stays in the game (for "Play again").
// Returns the badges it earned. Does nothing if no player was picked.
export async function record({ score = 0, level = 1, stars = 1, seconds = 0 } = {}) {
  const player = getPlayer();
  if (!player) return [];

  const pid = player.profile_id;
  const gameId = getGameId();
  const cleanStars = Math.max(1, Math.min(3, Math.round(Number(stars) || 1)));
  const cleanScore = Number(score) || 0;
  const profileData = api.getCachedProfile(pid);

  const before = playerStats(profileData, api.getOutbox(), pid);
  const playedBefore = (before.plays[gameId] || 0) > 0;
  const oldBest = before.best[gameId];

  api.queueResult({
    profile_id: pid,
    game_id: gameId,
    score: cleanScore,
    level: Number(level) || 1,
    stars: cleanStars,
    seconds: Math.max(0, Math.round(Number(seconds) || 0)),
  });

  const after = playerStats(profileData, api.getOutbox(), pid, await readyGameIds(), {
    beatBest: playedBefore && oldBest != null && cleanScore > oldBest,
  });
  const fresh = newlyEarned(after, earnedIds(profileData, api.getOutbox(), pid));
  fresh.forEach((a) => api.queueAchievement({ profile_id: pid, achievement_id: a.id }));

  // News for the launcher. Several rounds in a row add up into one celebration.
  const old = api.loadLocal(CELEBRATE_KEY, null);
  const keep = old && old.profile_id === pid && Date.now() - old.at < 15 * 60 * 1000;
  api.saveLocal(CELEBRATE_KEY, {
    profile_id: pid,
    game_id: gameId,
    stars: (keep ? old.stars : 0) + cleanStars,
    stars_before: keep ? old.stars_before : before.starsTotal,
    achievements: [...(keep ? old.achievements : []), ...fresh.map((a) => a.id)],
    at: Date.now(),
  });
  return fresh;
}

export function goHome(profileId) {
  const id = profileId === undefined ? (getPlayer() || {}).profile_id : profileId;
  const url = new URL(LAUNCHER);
  if (id) url.searchParams.set('player', id);
  location.href = url.href;
}

// A round "back to games" button in the top-left corner. Returns the button.
export function homeButton() {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', 'Back to games');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true"><path fill="currentColor" d="M12 3.2l9 7.6c.6.5.2 1.4-.6 1.4H19v7.3c0 .8-.7 1.5-1.5 1.5H14v-5.5h-4V21H6.5c-.8 0-1.5-.7-1.5-1.5v-7.3H3.6c-.8 0-1.2-.9-.6-1.4z"/></svg>';
  Object.assign(b.style, {
    position: 'fixed', top: '12px', left: '12px', zIndex: '1000', width: '56px', height: '56px',
    display: 'grid', placeItems: 'center', borderRadius: '50%', border: '3px solid #2B2118',
    background: '#fff', color: '#2B2118', boxShadow: '2px 4px 0 rgba(43,33,24,.25)', cursor: 'pointer', padding: '0',
  });
  b.addEventListener('click', () => goHome());
  document.body.appendChild(b);
  return b;
}

if (typeof window !== 'undefined') {
  window.FamilyGames = { getPlayer, getGameId, record, finish, goHome, homeButton };
}
