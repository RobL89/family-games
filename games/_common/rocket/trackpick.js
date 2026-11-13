// The one-time track pick (D-121). Version 1.0.
//
// Inside the wrapper, a child with no progress yet in the game is asked once which track to play
// (D-089), for a grown-up to tap; the track is then kept in that child's progress. The card is in
// the game's page (#track-pick); this fills in the child's name and a button for each track. The map
// (#map) is hidden behind it until the pick, as the game hasn't drawn it yet.

export function pickTrack(tracks, player, onPick, doc = document) {
  const box = doc.getElementById('track-pick');
  const row = doc.getElementById('tp-row');
  const map = doc.getElementById('map');
  doc.getElementById('tp-name').textContent = (player && player.name) || 'this child';
  row.textContent = '';
  let picked = false;
  Object.entries(tracks).forEach(([id, t], i) => {
    const b = doc.createElement('button');
    b.type = 'button';
    b.className = `big ${i ? 'alt' : 'go'} tp-btn`;
    b.dataset.track = id;
    b.textContent = t.name;
    b.addEventListener('click', () => {
      if (picked) return;
      picked = true;
      box.hidden = true;
      if (map) map.hidden = false;
      onPick(id);
    });
    row.appendChild(b);
  });
  if (map) map.hidden = true;
  box.hidden = false;
}
