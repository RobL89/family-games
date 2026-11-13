// The rocket game's link to P-020's wrapper (game contract 0.4.2, D-120). Version 1.0.
//
// The game talks to the wrapper only through P-020's shared/bridge.js (GC4), which says who's
// playing, whether sound is off and the child's saved progress (fg:start), and takes the progress
// back (fg:state). Opened on its own, the game starts at once; opened in the wrapper, it starts when
// the wrapper's fg:start arrives, or on its own after the bridge's 5 s wait (GC5, P81).
//
// In a frame from another site, such as a private preview (D-018), no wrapper can answer (the bridge
// takes messages from this site only), so the game starts at once there too, not after 5 s.

import { connect } from '../../../shared/bridge.js';

// True when the page's parent is another page on this site: the wrapper.
export function sameSiteParent(win = window) {
  try { return win.parent !== win && win.parent.location.origin === win.location.origin; } catch { return false; }
}

// Calls onStart(start, fg) once, with the bridge's start ({ player, sound, state, standalone, ... })
// and the bridge itself, for fg.saveState(). Returns the bridge.
export function linkUp(onStart, win = window) {
  const fg = connect(sameSiteParent(win) ? {} : { wait: 0 });
  fg.onStart((start) => onStart(start, fg));
  return fg;
}
