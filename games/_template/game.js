// Starting point for a new game.
// 1. Copy this folder to games/<new-id>/ (letters, numbers, - and _ only).
// 2. Add the game to games.json with "status": "ready" (or "soon" for a placeholder tile).
// 3. Describe its settings in settings.js (see the notes there) and read them with loadSettings().
// 4. When a round ends, call record() to stay in the game or finish() to go back to the launcher.
//    stars (1 to 3) is the headline score; score, level and seconds are optional numbers.
// 5. Anything that should last between rounds (coins, unlocks) goes through loadProgress()
//    and saveProgress(): kept on the device and in the Sheet's Progress tab.

import { getPlayer, homeButton, finish, loadSettings, loadProgress, saveProgress } from '../../shared/game-kit.js';
import { SETTINGS } from './settings.js';

homeButton();

const player = getPlayer();
document.getElementById('who').textContent = player && player.nickname
  ? `Playing: ${player.nickname}`
  : 'No player picked: results won\'t be saved.';

const settings = await loadSettings(SETTINGS);
const progress = await loadProgress({ played: 0 });
document.getElementById('info').textContent =
  `Rounds: ${settings.rounds}. Played here before: ${progress.played} time${progress.played === 1 ? '' : 's'}.`;

document.querySelectorAll('[data-stars]').forEach((button) => {
  button.addEventListener('click', () => {
    progress.played += 1;
    saveProgress(progress);
    finish({ score: Number(button.dataset.stars) * 10, stars: Number(button.dataset.stars), seconds: 5 });
  });
});
