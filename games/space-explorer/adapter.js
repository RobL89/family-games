// Space Explorer adapter: connects the maker's page (original.html, never edited) to the wrapper.
// The wrapper adds this file to the page once its HTML has been read (P67). Opened on its own,
// original.html runs without it, as the maker made it (GC5).
//
// Its only job: when sound is off in the grown-ups' corner, "Read to me" says nothing (P67, GC7).
// The game keeps its own "My place" on the device; it saves nothing through the wrapper.

import { connect } from '../../shared/bridge.js';
import { soundOff } from '../_common/sound-off/sound-off.js';

connect().onStart((start) => {
  if (!start.standalone && start.sound === false) soundOff();
});
