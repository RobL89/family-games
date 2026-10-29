// This game's settings, read from the Sheet's Settings tab. Rules for each kind are in
// shared/settings.js. When the game goes live:
//   1. add "settings": true to its line in games.json,
//   2. run `node tools/settings-seed.mjs` so apps-script/Code.gs knows the new rows,
//   3. paste the new Code.gs into Apps Script and run setup (it backs up first and
//      only adds the rows that are missing).
import { SHARED_SETTINGS } from '../../shared/settings.js';

export const SETTINGS = {
  ...SHARED_SETTINGS.pick('speak'),          // shared with every game ("all" in the Sheet)
  rounds: { default: 3, min: 1, max: 10, about: 'Rounds in one game.' },
};
