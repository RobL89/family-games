// Little sounds made in the browser (no sound files to download). Mute lives in
// the grown-ups' corner and is remembered on this device (P19).

import { loadLocal, saveLocal } from './api.js';

const KEY = 'fg.muted';
let ctx = null;

export const isMuted = () => !!loadLocal(KEY, false);
export const setMuted = (muted) => saveLocal(KEY, !!muted);

function tone(freq, start, length, type = 'sine', volume = 0.16) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

const SOUNDS = {
  tap: (t) => tone(660, t, 0.09, 'triangle'),
  hello: (t) => { tone(523, t, 0.12); tone(784, t + 0.1, 0.16); },
  soon: (t) => { tone(392, t, 0.12, 'triangle'); tone(330, t + 0.11, 0.16, 'triangle'); },
  pop: (t) => { tone(900, t, 0.06); tone(1300, t + 0.03, 0.05, 'sine', 0.08); },
  peel: (t) => { tone(700, t, 0.08, 'triangle'); tone(1050, t + 0.07, 0.12, 'triangle'); },
  yay: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.22, 'triangle')),
};

export function play(name) {
  if (isMuted() || !SOUNDS[name]) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name](ctx.currentTime + 0.01);
  } catch {
    // No sound on this device; carry on silently.
  }
}
