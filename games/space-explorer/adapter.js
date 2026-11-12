// Space Explorer adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// What it does:
//   1. "Find me" in Explore space sets the place to London, England (P71), instead of asking the
//      device for its location: it presses the game's own London button. The game keeps its own
//      "My place" on the device; the child can still pick another town or type numbers.
//   2. Sound off (P67, GC7): "Read to me" says nothing.
// It saves nothing through the wrapper.

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';

// Before the game's own "Find me" handler runs (capture on window), press its London button instead.
window.addEventListener('click', (e) => {
  if (!e.target.closest || !e.target.closest('#xFind')) return;
  const london = [...document.querySelectorAll('#xPlaces button')].find((b) => b.textContent.trim() === 'London');
  if (!london) return; // no London button: leave the game's own behaviour
  e.preventDefault();
  e.stopImmediatePropagation();
  london.click();
}, true);

connect().onStart((start) => {
  if (!start.standalone && start.sound === false) soundOff();
});
