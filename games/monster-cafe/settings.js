// Monster Café settings, read from the Sheet's Settings tab (see shared/settings.js).
import { SHARED_SETTINGS } from '../../shared/settings.js';

export const SETTINGS = {
  ...SHARED_SETTINGS.pick('speak'),
  sums: {
    type: 'choices',
    default: ['add', 'take'],
    options: ['add', 'take', 'bonds', 'double', 'half', 'times', 'share'],
    about: 'Kinds of order, separated by commas: add, take (away), bonds (make the number), double, half, times, share.',
  },
  max_number: { default: 10, min: 3, max: 100, about: 'Biggest number in any order or answer.' },
  bond_to: { default: 10, min: 2, max: 100, about: 'bonds: the number to make (10 means "I have 7, make it 10").' },
  tables: { type: 'numbers', default: [2, 5, 10], min: 1, max: 12, about: 'times and share: which times tables, separated by commas.' },
  answer_with: {
    default: 'auto',
    options: ['auto', 'tap', 'pad'],
    about: 'tap = put food on the tray one at a time (counting); pad = number buttons; auto = tap for answers up to 10, pad above.',
  },
  pictures: { default: true, about: 'Show food pictures in the orders to help with counting (TRUE or FALSE).' },
  missing_number: { default: false, about: 'Sometimes ask for the missing number, like ? + 3 = 7 (TRUE or FALSE).' },
  orders_per_round: { default: 8, min: 3, max: 20, about: 'Orders in one round.' },
  patience: { default: 0, min: 0, max: 120, about: 'Seconds a monster waits before it leaves. 0 = it waits for ever.' },
};
