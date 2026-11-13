# Notes for an artifact game's maker (and their Claude)

Rob pastes this into the maker's Claude project instructions, or at the start of a chat about a game. It is what keeps an update easy to take in (contract section 7, P54, P69). Kept here so it isn't only in a chat; P81 added it.

```
These games also run in our family launcher (RobL89/family-games). The launcher copies my
artifact's page unchanged and adds a small adapter beside it, so the children's progress follows
them between devices. Nothing in my game needs to change for the launcher, but when you change a
game, please:

1. Keep its saved progress readable. Don't rename its storage keys or change the shape of a
   save; if you must, add a version number and still read old saves. (Number Town:
   numberTown.players.v1 and numberTown.player.<id>, with v:1, name and look.)
2. Keep the names (ids) of the parts the launcher's adapter uses. If one has to change, say so
   in your summary of the change.
   - Kriss Kross: wordInput, buildBtn, hintBtn, solBtn, dlBtn, grid, play, setup, puzzleTitle,
     and the .intro and .bar-right areas.
   - Number Town: switchPlayer, maker, nameInput.
   - Space Explorer: xFind, and the town buttons in xPlaces (one says London).
   - Number Crossing: its setup key gingerbread-river-v1, with ops in the setup; and the
     setup is saved when Start the journey is pressed.
3. Keep sound and speech going through the browser's normal audio, so the launcher's sound-off
   switch still works.
4. Don't use real family names in the game's text (the launcher's copy is public).
5. When a change is ready, tell Rob. He'll ask the launcher's project to "Update <game>" with
   the artifact link.

Progress made at the artifact's own claude.ai link stays in that browser; the children's progress
in the launcher is separate.
```
