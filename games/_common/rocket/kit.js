// The rocket games' own small kit, in place of the old launcher's shared/game-kit.js, so a
// game runs on its own as a plain page (D-004, D-014). Version 1.4. Changes at v1.4 (step 2c-3a,
// D-089): the entry is at format version 4 (tracks.js: the track played and each track's map, with the
// rocks, landings and ships shared), and a format 3 entry is still read: tracks.js puts its map on the
// stand-in track. Changes at v1.3 (step
// 2c-build, D-058): one game with a map: its entry is at format version 3 (progress.js: the rocket's
// place, how far the map is open, each level's best stars and rocks found, rocks, landings, ships),
// and formats 1 and 2 are no longer read, so test progress starts afresh. Changes at v1.2 (step
// 2a-4b): the tile's entry is at format version 2, with the ships owned and flown, and a
// version 1 entry is still read (D-053). Changes at v1.1: a tile's
// progress is kept on the device (D-042), here and nowhere else. Nothing here reaches a Sheet
// or the network:
//   - report(result) keeps each finished round's result in memory (reported());
//   - saveState(state) keeps the game's rewards in memory (savedState());
//   - keepOnDevice(tile, state) and keptOnDevice(tile): the tile's progress in this browser,
//     one localStorage entry per tile with a format version, until the shell keeps it.
// At stage 2a these become the game contract's messages (contract v0.3): the result is
// sent to the shell, and the state goes out with fg:state and comes back in fg:start.
//
// homeButton() is copied unchanged from shared/game-kit.js (games-wip, 7ef1ff0).

const LAUNCHER = new URL('../../../index.html', import.meta.url);

const results = [];
let saved = null;
const copy = (x) => JSON.parse(JSON.stringify(x));

// A finished round: { score, stars (1 to 3), seconds, level }. Kept in memory only.
export function report({ score = 0, level = 1, stars = 1, seconds = 0 } = {}) {
  const r = {
    score: Number(score) || 0,
    level: Number(level) || 1,
    stars: Math.max(1, Math.min(3, Math.round(Number(stars) || 1))),
    seconds: Math.max(0, Math.round(Number(seconds) || 0)),
  };
  results.push(r);
  return r;
}
export const reported = () => results.map(copy);

// The game's own rewards (planets, moon rocks). Kept in memory only, so a reload starts afresh.
export function saveState(state) { saved = copy(state || {}); return true; }
export const savedState = () => (saved ? copy(saved) : null);

// The game's progress on this device (D-042, D-058, D-089): one entry, "family-games:<game>:progress",
// holding { v: 4, ...state }, the progress in format 4 (tracks.js: the track's map in format 3, as
// progress.js has it, the other tracks' maps, and the ships, D-053). A format 3 entry is read as it
// is (tracks.js tells the two apart). Formats 1 and 2 (the two tiles' planets) are not read: the map
// starts afresh. If storage is blocked or full, or the entry is broken or of another format version,
// nothing is kept or read back, and the game plays on from the start. One child per device until the
// shell keeps it (D-058).
const FORMAT = 4;
const READS = [3, 4];
const entryOf = (tile) => `family-games:${tile}:progress`;
export function keepOnDevice(tile, state) {
  try {
    localStorage.setItem(entryOf(tile), JSON.stringify({ v: FORMAT, ...copy(state || {}) }));
    return true;
  } catch { return false; }
}
export function keptOnDevice(tile) {
  try {
    const e = JSON.parse(localStorage.getItem(entryOf(tile)));
    if (!e || typeof e !== 'object' || Array.isArray(e) || !READS.includes(e.v)) return null;
    const { v, ...state } = e;
    return state;
  } catch { return null; }
}

// Back to the launcher's page, three folders up from games/_common/rocket/ on the family site.
export function goHome() { location.href = LAUNCHER.href; }

// A round "back to games" button in the top-left corner. Returns the button.
// Pass { style: {...} } to restyle it to suit the game.
export function homeButton({ style = {} } = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', 'Back to games');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true"><path fill="currentColor" d="M12 3.2l9 7.6c.6.5.2 1.4-.6 1.4H19v7.3c0 .8-.7 1.5-1.5 1.5H14v-5.5h-4V21H6.5c-.8 0-1.5-.7-1.5-1.5v-7.3H3.6c-.8 0-1.2-.9-.6-1.4z"/></svg>';
  Object.assign(b.style, {
    position: 'fixed', top: '12px', left: '12px', zIndex: '1000', width: '56px', height: '56px',
    display: 'grid', placeItems: 'center', borderRadius: '50%', border: '3px solid #2B2118',
    background: '#fff', color: '#2B2118', boxShadow: '2px 4px 0 rgba(43,33,24,.25)', cursor: 'pointer', padding: '0',
  }, style);
  b.addEventListener('click', () => goHome());
  document.body.appendChild(b);
  return b;
}
