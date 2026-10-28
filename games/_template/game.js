// Starting point for a new game.
// 1. Copy this folder to games/<new-id>/ (letters, numbers, - and _ only).
// 2. Add the game to games.json with "status": "ready" (or "soon" for a placeholder tile).
// 3. When a round ends, call record() to stay in the game or finish() to go back to the launcher.
//    stars (1 to 3) is the headline score; score, level and seconds are optional numbers.

import { getPlayer, homeButton, finish } from '../../shared/game-kit.js';

homeButton();

const player = getPlayer();
document.getElementById('who').textContent = player && player.nickname
  ? `Playing: ${player.nickname}`
  : 'No player picked: results won\'t be saved.';

document.querySelectorAll('[data-stars]').forEach((button) => {
  button.addEventListener('click', () => {
    finish({ score: Number(button.dataset.stars) * 10, stars: Number(button.dataset.stars), seconds: 5 });
  });
});
