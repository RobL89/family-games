// sound-off.js: silences an artifact game when sound is off in the grown-ups' corner (P67,
// contract GC7: sound off means no sound and no speech). The maker's page is never edited, so
// this quietens the browser's sound tools inside the game's page instead:
//   - Web Audio: every new audio context plays into a silent volume and stays paused.
//   - Speech: nothing is spoken, and the game is told at once that speaking has finished,
//     so its own "Read to me" button doesn't wait.
//   - Audio and video elements: muted.
// Used by an artifact game's adapter.js. Call it before the game first makes a sound; games
// usually make their audio context on the first tap, which is after the adapter has run.

export function soundOff(win = window) {
  if (win.__fgSoundOff) return;
  win.__fgSoundOff = true;

  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const Real = win[name];
    if (typeof Real !== 'function') continue;
    const realDestination = Object.getOwnPropertyDescriptor(Real.prototype, 'destination')
      || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Real.prototype), 'destination');
    class Quiet extends Real {
      constructor(...args) {
        super(...args);
        const silent = this.createGain();
        silent.gain.value = 0;
        silent.connect(realDestination.get.call(this));
        Object.defineProperty(this, 'destination', { value: silent }); // the game plays into this
        try { super.suspend(); } catch { /* already closed */ }
      }
      resume() { return Promise.resolve(); } // stays paused
    }
    win[name] = Quiet;
  }

  if (win.SpeechSynthesis) {
    win.SpeechSynthesis.prototype.speak = function (utterance) {
      setTimeout(() => { try { utterance.dispatchEvent(new Event('end')); } catch { /* nothing to tell */ } }, 0);
    };
  }

  const mute = (el) => { el.muted = true; };
  win.document.querySelectorAll('audio, video').forEach(mute);
  const realPlay = win.HTMLMediaElement && win.HTMLMediaElement.prototype.play;
  if (realPlay) {
    win.HTMLMediaElement.prototype.play = function (...args) { mute(this); return realPlay.apply(this, args); };
  }
}
