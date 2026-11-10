// The rocket game's tracks (D-089): one map for each track, on the same six systems, and the
// progress kept for them. Version 1.0 (step 2c-3a). Pure: no page, storage, clock or randomness,
// so test_rocket_lander_core.py runs it in Node; kit.js keeps the result on the device.
//
// The tracks are a game's own, given as { [id]: { map, edition } }: `map` as progress.js reads it,
// and `edition` a word that changes whenever the map's level ids start to mean other levels (a
// stand-in replaced), so progress made on an older edition is not read as this one's.
//
// Progress, format 4 (kit.js adds v: 4 on the device): format 3 (progress.js) for the track played,
// plus where the other tracks' maps stand. Changing the track keeps the moon rocks, landings and
// ships, and each track keeps its own map (D-089):
//   track     the track played (an id of the game's tracks);
//   edition   the edition of that track's map the places below were made on;
//   at, open, levels   that track's map, as format 3 holds it (progress.js);
//   rocks, landings, ship, ships   the child's, whatever the track;
//   maps      { [other track]: { edition, at, open, levels } }: the other tracks' maps, as left.
// A format 3 entry is format 4 with no track, edition or maps. Its map was made on the stand-in
// levels, so it goes to the track whose edition is STAND_IN, if there is one; otherwise only its
// rocks, landings and ships are kept.

export const STAND_IN = 'stand-in';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const known = (tracks, id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(tracks, id);
const mapPart = (o, edition) => ({ edition, at: o.at, open: o.open, levels: isObj(o.levels) ? o.levels : {} });

// The track given (by the address or the test panel), if it is one of the game's: the id, or null.
export const trackGiven = (tracks, given) => (known(tracks, given) ? given : null);

// What a kept or handed-in progress object holds, read for a game's tracks: { track (the one to play),
// p (format 3 for it, with the rocks, landings and ships: progress.js and fleet.js tidy it), others
// (the other tracks' maps, as kept) }. `given` is a track asked for, played if it is one of the game's;
// otherwise the kept track; otherwise, for a format 3 entry, the stand-in track; otherwise `first`.
export function unpack(tracks, kept, given, first) {
  const s = isObj(kept) ? kept : {};
  const maps = {};
  if (isObj(s.maps)) for (const [id, m] of Object.entries(s.maps)) if (known(tracks, id) && isObj(m)) maps[id] = mapPart(m, m.edition);
  const format3 = s.track === undefined && s.edition === undefined && s.maps === undefined;
  const standIn = Object.keys(tracks).find((id) => tracks[id].edition === STAND_IN) || null;
  const owner = known(tracks, s.track) ? s.track : format3 ? standIn : null;
  const hasMap = s.at !== undefined || s.open !== undefined || isObj(s.levels);
  if (owner && hasMap) maps[owner] = mapPart(s, format3 ? STAND_IN : s.edition);
  const track = trackGiven(tracks, given) || (known(tracks, s.track) ? s.track : null) || (format3 && hasMap ? standIn : null)
    || (known(tracks, first) ? first : Object.keys(tracks)[0]);
  const mine = maps[track];
  const p = mine && mine.edition === tracks[track].edition ? { at: mine.at, open: mine.open, levels: mine.levels } : {};
  for (const k of ['rocks', 'landings', 'ship', 'ships']) if (s[k] !== undefined) p[k] = s[k];
  const others = {};
  for (const [id, m] of Object.entries(maps)) if (id !== track) others[id] = m;
  return { track, p, others };
}

// Format 4 to keep: the track played, its map's edition and progress (format 3, ships included), and
// the other tracks' maps.
export function pack(tracks, track, p, others = {}) {
  const src = isObj(p) ? p : {};
  const out = { track, edition: tracks[track] ? tracks[track].edition : '' };
  for (const k of ['at', 'open', 'levels', 'rocks', 'landings', 'ship', 'ships']) if (src[k] !== undefined) out[k] = src[k];
  out.maps = {};
  for (const [id, m] of Object.entries(isObj(others) ? others : {})) if (id !== track && known(tracks, id)) out.maps[id] = m;
  return out;
}

// The same progress with another track to play: this track's map put by, the other's taken up.
export function switchTrack(tracks, kept, to) {
  const u = unpack(tracks, kept, to);
  return pack(tracks, u.track, u.p, u.others);
}
