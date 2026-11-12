// Number Town adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// Its only job: when sound is off in the grown-ups' corner, the game's beeps are silent (P67, GC7),
// whatever its own Sound setting says. The game keeps its own explorers, stars and saves on the
// device (up to 8 explorers), and its own "Who's playing?"; it saves nothing through the wrapper.

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';

connect().onStart((start) => {
  if (!start.standalone && start.sound === false) soundOff();
});
