# Wrapper check

A launcher tool, not a game for the children. It is listed as `testing`, so its tile shows only where the grown-ups' corner's Testing switch is on.

**What it's for:** trying the wrapper (`play.html`) on a phone or PC. It shows everything the wrapper sends in `fg:start` and saves a small state, so a grown-up can see that each service works:

- **Who's playing:** the child's name, animal and colour.
- **Sound:** the Play button beeps unless sound is off in the grown-ups' corner (GC6: the tap lets the phone play sound).
- **Word lists:** how many lists it got and the first list's title (it asks for `word-lists`).
- **Saved state:** a count of rounds, sent with `fg:state` and handed back next time (P51).

**Its own rules:** none. It has one round: press Done to see its own end screen, then Again.

**Running on its own:** opened directly, it says so and counts rounds on the device only.
