# keep-progress (P77)

For an artifact game that keeps its progress in its own device storage: its adapter uses this so the child's progress goes to the Sheet and follows them to any device. The newest save wins (P78). Games built to the contract don't need it: they send `fg:state` themselves.

The adapter gives two functions:
- `read()`: this child's progress in the game's storage now, or `null`
- `write(progress)`: puts it back in the game's storage (throw if it can't)

and calls `begin(start.state)` in its `fg.onStart`. A `false` answer means the page is reloading to show progress put back. How it decides, and why it reloads, is in the header of `keep-progress.js`. Number Town's adapter is the example. Its release check shows how to test it with two devices. What to look for in a game first: [../README.md](../README.md).
