// Word Worm settings, read from the Sheet's Settings tab (see shared/settings.js).
import { SHARED_SETTINGS } from '../../shared/settings.js';

export const SETTINGS = {
  ...SHARED_SETTINGS.pick('word_list', 'speak'),
  mode: {
    default: 'spell',
    options: ['spell', 'letters', 'count'],
    about: 'spell = eat the letters of each word in order; letters = find the letter shown (for early readers); count = eat the numbers in order.',
  },
  show_word: {
    default: 'always',
    options: ['always', 'peek', 'listen'],
    about: 'spell mode: always = the word stays on screen; peek = shown for a few seconds, then hidden; listen = only said out loud.',
  },
  words_per_round: { default: 5, min: 1, max: 20, about: 'Words (or letters, or counts) in one round.' },
  decoys: { default: 3, min: 0, max: 8, about: 'Wrong letters or numbers in the garden at once.' },
  speed: { default: 2, min: 1, max: 5, about: 'How fast the worm goes: 1 (slow) to 5 (fast).' },
  letter_case: { default: 'lower', options: ['lower', 'upper'], about: 'Letters shown as lower case (a b c) or capitals (A B C).' },
  letters: {
    type: 'items',
    default: ['a', 'b', 'c', 'd', 'e', 's', 't'],
    about: 'letters mode: the letters to find, separated by commas.',
  },
  count_from: { default: 0, min: -100, max: 1000, about: 'count mode: the first number.' },
  count_step: { default: 2, min: 1, max: 100, about: 'count mode: count in steps of this (2 means 0, 2, 4, 6...).' },
  count_length: { default: 6, min: 3, max: 12, about: 'count mode: how many numbers to eat in a row.' },
};
