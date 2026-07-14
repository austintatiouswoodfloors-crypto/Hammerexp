// Mock data for Nailing Master (English, mobile).
// NOTE: High scores & progress are MOCKED on the frontend via localStorage.
// A real backend/leaderboard can be added later.

export const MAX_DEPTH = 6; // hit-depth needed to drive a nail flush
export const MAX_BEND = 3;  // bends before a nail is ruined

// Difficulty via aim tolerance (px). Smaller radii = must hit dead-center.
export const LEVELS = [
  { id: 1, name: 'Practice', nails: 3, perfectR: 28, goodR: 58, time: 45 },
  { id: 2, name: 'Easy',     nails: 4, perfectR: 26, goodR: 54, time: 45 },
  { id: 3, name: 'Normal',   nails: 5, perfectR: 24, goodR: 50, time: 50 },
  { id: 4, name: 'Hard',     nails: 6, perfectR: 22, goodR: 46, time: 50 },
  { id: 5, name: 'Expert',   nails: 7, perfectR: 20, goodR: 42, time: 55 },
  { id: 6, name: 'Master',   nails: 8, perfectR: 18, goodR: 38, time: 55 },
];

export const STR = {
  title: 'Nailing Master',
  subtitle: 'Hammer every nail flush!',
  start: 'START',
  howto: 'HOW TO PLAY',
  levelSelect: 'SELECT STAGE',
  back: 'BACK',
  perfect: 'PERFECT!',
  great: 'GREAT!',
  good: 'GOOD',
  miss: 'MISS!',
  combo: 'COMBO',
  score: 'SCORE',
  time: 'TIME',
  nails: 'NAILS',
  result: 'RESULT',
  clear: 'STAGE CLEAR!',
  timeup: "TIME'S UP",
  retry: 'RETRY',
  next: 'NEXT STAGE',
  menu: 'MENU',
  best: 'BEST',
  newRecord: 'NEW RECORD!',
  tapToHit: 'Swing the hammer down onto the nails',
  howtoTitle: 'HOW TO PLAY',
  howtoBody: [
    'Drag your finger to move the hammer around.',
    'Swing it straight DOWN onto a nail head to drive it in.',
    'Lift up and swing down again to keep hammering.',
    'Land dead-center for a PERFECT strike — build combos!',
    'Drive every nail flush before time runs out to clear the stage.',
  ],
  close: 'GOT IT',
  stage: 'STAGE',
  strikes: 'STRIKES',
};

const HS_KEY = 'nm_highscores_v2';
const PROG_KEY = 'nm_progress_v2';

export function getHighScores() {
  try { return JSON.parse(localStorage.getItem(HS_KEY)) || {}; }
  catch { return {}; }
}
export function saveHighScore(levelId, score) {
  const hs = getHighScores();
  const isNew = !hs[levelId] || score > hs[levelId];
  if (isNew) { hs[levelId] = score; localStorage.setItem(HS_KEY, JSON.stringify(hs)); }
  return isNew;
}
export function getUnlocked() {
  try { const v = parseInt(localStorage.getItem(PROG_KEY), 10); return Number.isFinite(v) ? v : 1; }
  catch { return 1; }
}
export function unlockLevel(levelId) {
  const cur = getUnlocked();
  if (levelId > cur) localStorage.setItem(PROG_KEY, String(levelId));
}
