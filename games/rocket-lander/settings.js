// Rocket Lander settings, read from the Sheet's Settings tab (see shared/settings.js).
import { SHARED_SETTINGS } from '../../shared/settings.js';

export const SETTINGS = {
  ...SHARED_SETTINGS.pick('speak'),
  from: { default: 0, min: -1000, max: 1000, about: 'The number at the left end of the line.' },
  to: { default: 10, min: -1000, max: 1000, about: 'The number at the right end of the line.' },
  step: { default: 1, min: 0.01, max: 100, about: 'Gap between landing spots: 1 = whole numbers, 0.5 = halves, 0.25 = quarters, 0.1 = tenths, 10 = tens.' },
  label_every: { default: 1, min: 0, max: 500, about: 'Write a number under a mark this often: 1 = every number, 5 = 0, 5, 10..., 0 = only the two ends.' },
  show_as: { default: 'fraction', options: ['fraction', 'decimal'], about: 'Halves and quarters shown as 2½ (fraction) or 2.5 (decimal).' },
  close_enough: { default: 0, min: 0, max: 500, about: 'How near counts as a good landing: 0 = on the mark itself (long lines get a little leeway automatically); 5 = within 5.' },
  landings_per_round: { default: 8, min: 3, max: 20, about: 'Landings in one round.' },
  speed: { default: 2, min: 1, max: 5, about: 'How fast the rocket falls: 1 (slow) to 5 (fast).' },
};
