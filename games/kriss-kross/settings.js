// Kriss Kross settings, read from the Sheet's Settings tab (see shared/settings.js).
import { SHARED_SETTINGS } from '../../shared/settings.js';

export const SETTINGS = {
  ...SHARED_SETTINGS.pick('word_list'),
};
