// Settings shared by the launcher and every game.
// The Apps Script link is not secret (the family code is), so it can live here.

export const CONFIG = {
  // Web app URL from Apps Script (Deploy > Manage deployments), ending in /exec.
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbx7beHr1JbjAXpnrIwrJseG1qTGUkw8m370f_bi15VFa6LHkfsYRdrNj1JBIKRhtAlX-Q/exec',

  // How many recent scores the profile screen shows.
  recentScores: 10,

  // The skin preview button is now switched on and off in the grown-ups' corner
  // (saved on each device). This is only the starting value for a new device.
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
