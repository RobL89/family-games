// keep-progress.js: for an artifact game that keeps its progress in its own device storage (P77).
// It makes that progress the game's state for this child, so the wrapper saves it to the Sheet
// and it follows the child to any device. The newest save wins (P78). The maker's page is never
// edited: the game's adapter says how to read and write the child's progress, and this does the rest.
//
//   const progress = keepProgress(fg, { game: 'number-town', read, write });
//   fg.onStart((start) => {
//     if (!progress.begin(start.state)) return; // the page is reloading to show progress put back
//     ...
//   });
//     read():          this child's progress in the game's storage now, or null if there's none yet
//     write(progress): puts it in the game's storage (throw if it can't); the page then reloads once
//
// What it does:
//   1. As the game opens: if the progress the wrapper hands over is newer than what this device
//      last passed on or put back, it's put back and the page reloads once, because a game reads
//      its storage as it opens. Until the reload, the game's own saves are ignored: it still has
//      the old progress in memory, and many games save as the page unloads, which would undo it. Otherwise, progress made here that hasn't been passed on yet is
//      passed on now. (If both happened, the other device saved later, so its play wins: this
//      device can lose at most the last couple of seconds before it was closed.)
//   2. While playing: checks the game's storage every 2 seconds and passes on any change. The
//      wrapper keeps it on the device at once and decides when it goes to the Sheet (P78).
//   3. On the way out: the wrapper calls fgSaveNow() on ⌂ Home and when the page is hidden, and
//      this checks again when the page loses focus or is hidden (after the game's own save there).
//      fgSaveNow() always returns the latest progress taken, not just a change since the last
//      call: tapping ⌂ Home first takes focus from the game, so the change may already have been
//      taken and sent as a message the page leaves before it arrives. The wrapper ignores a state
//      it already has.
//
// The state it passes on: { progress, at }, at being when it was taken (ISO time). On this device
// it notes what it last passed on or put back, per child: fg.keep.<game>.<child>.

const RELOADED = 'fg.keep.reloaded'; // sessionStorage: when this last reloaded the page, so it never loops

const load = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const store = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
const text = (value) => (value === null || value === undefined ? null : JSON.stringify(value));
const time = (iso) => Date.parse(iso || '') || 0;

// Ignores every write to this page's storage from now on. Used only just before a reload.
function freezeStorage() {
  const proto = Object.getPrototypeOf(window.localStorage);
  for (const name of ['setItem', 'removeItem', 'clear']) proto[name] = function () {};
}

export function keepProgress(fg, { game, read, write, every = 2000 }) {
  const child = new URLSearchParams(location.search).get('player') || '';
  const NOTE = `fg.keep.${game}.${child}`;
  let note = load(NOTE); // { json, at }: what this device last passed on or put back
  let started = false;
  let latest; // the last state taken while this page has been open

  const readNow = () => { try { return read(); } catch { return null; } };
  const remember = (json, at) => { note = { json, at }; store(NOTE, note); };

  // The game's progress as a state, if it changed since it was last passed on; otherwise undefined.
  function take() {
    if (!started) return undefined;
    const progress = readNow();
    const json = text(progress);
    if (json === null || (note && note.json === json)) return undefined;
    remember(json, new Date().toISOString());
    latest = { progress, at: note.at };
    return latest;
  }
  const pass = () => {
    const state = take();
    if (state !== undefined) fg.saveState(state);
  };

  function begin(kept) {
    const valid = !!kept && typeof kept === 'object' && 'progress' in kept && time(kept.at) > 0;
    const keptJson = valid ? text(kept.progress) : null;
    const localJson = text(readNow());

    if (valid && keptJson !== null && keptJson !== localJson && time(kept.at) > time(note && note.at)) {
      // Newer than anything this device has passed on or put back: put it back and reload once.
      const want = `${NOTE}|${kept.at}`;
      let last = null;
      try { last = JSON.parse(sessionStorage.getItem(RELOADED) || 'null'); } catch { /* none */ }
      const justReloaded = last && last.want === want && Date.now() - last.at < 10000;
      if (!justReloaded) {
        try {
          write(kept.progress);
          remember(keptJson, kept.at);
          sessionStorage.setItem(RELOADED, JSON.stringify({ want, at: Date.now() }));
          freezeStorage();
          location.reload();
          return false;
        } catch { /* couldn't write or reload: carry on with what this device has */ }
      }
    } else if (valid && keptJson === localJson && localJson !== null && !(note && note.json === localJson)) {
      remember(localJson, kept.at); // already the same here: just note it
    }

    started = true;
    pass(); // progress made here that hasn't been passed on yet (also the first time on a device)
    setInterval(pass, every);
    window.fgSaveNow = () => { take(); return latest; }; // for the wrapper, on ⌂ Home and when hidden
    window.addEventListener('blur', pass);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pass(); });
    return true;
  }

  return { begin };
}
