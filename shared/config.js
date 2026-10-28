// Settings shared by the launcher and every game.
// The Apps Script link is not secret (the family code is), so it can live here.

export const CONFIG = {
  // Web app URL from Apps Script (Deploy > Manage deployments), ending in /exec.
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbx7beHr1JbjAXpnrIwrJseG1qTGUkw8m370f_bi15VFa6LHkfsYRdrNj1JBIKRhtAlX-Q/exec',

  // How many recent scores the profile screen shows.
  recentScores: 10,

  // Shows the grown-ups' "Debug skin" button on the launcher, which switches
  // skins without unlocking or saving them. Set to false when you're done testing.
  debug: true,
};
