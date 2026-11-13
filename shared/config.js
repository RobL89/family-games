// Settings shared by the launcher and every game.
// The Apps Script link is not secret (the family code is), so it can live here.

export const CONFIG = {
  // Web app URL from Apps Script (Deploy > Manage deployments), ending in /exec.
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbx7beHr1JbjAXpnrIwrJseG1qTGUkw8m370f_bi15VFa6LHkfsYRdrNj1JBIKRhtAlX-Q/exec',

  // How many recent scores the profile screen shows.
  recentScores: 10,

  // Feature switches (P48, P49, P52): the one place to turn old features off and on.
  // Off means hidden and not run; nothing is deleted. Set one to true to bring it back.
  features: {
    stars: false,        // stars on the home screen, saving results to the Scores tab, and stars per round in games (P48)
    stickers: false,     // the sticker or badge slots on the home screen, and earning them (P48)
    lastPlayed: false,   // the "Last played" row on the home screen (P48)
    tileStars: false,    // each tile's best stars (P48)
    celebration: false,  // the confetti card after a round, with new stickers and skins (P48)
    skinLocks: false,    // skins locked behind star totals from the Skins tab (P49: all skins free)
    skinPreview: false,  // the grown-ups' "Debug skin" button and its tick-box in the corner (P34); off since skins are free and the picker tries them (P73)
  },

  // Only used while features.skinPreview is on: the skin preview button is then switched on and
  // off in the grown-ups' corner (saved on each device), and this is the starting value for a new device.
  debug: false,

  // The grown-ups' corner question. Only a one-way hash of the answer is kept here
  // (PBKDF2-SHA256 of the answer in lower case with spaces and punctuation removed),
  // so the answer itself is never in this public repo. To change it, ask Claude to
  // make a new hash; don't type the answer into this file.
  grownUps: {
    question: 'Address of first house',
    salt: '349666b56419aaba9a5a497581ab6fb9',
    iterations: 150000,
    hash: '9eb68eca0ec47c264397691c0d4fcfa054733b861a18089fc919fd9750d46ee9',
  },
};
