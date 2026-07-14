// Mock data for Nailing Master (single level, tap-count scoring).
// NOTE: Best (fewest taps) is MOCKED on the frontend via localStorage.

export const MAX_DEPTH = 100; // depth needed to drive a nail flush (many taps)

// Depth gained per strike (with slight randomness so totals vary):
//  perfect ~19 taps/nail  -> best run ~70-80 total (4 nails)
//  good    ~35 taps/nail  -> sloppy run ~120-180 total
export const HIT_DEPTH = {
  perfect: () => 4.8 + Math.random() * 1.0,
  great: () => 3.4 + Math.random() * 0.9,
  good: () => 2.3 + Math.random() * 0.9,
};

// Single stage config.
export const GAME = { nails: 4, perfectR: 30, goodR: 62 };

export const STR = {
  title: 'Nailing Master',
  subtitle: 'Hammer every nail flush!',
  start: 'START',
  howto: 'HOW TO PLAY',
  back: 'BACK',
  perfect: 'PERFECT!',
  great: 'GREAT!',
  good: 'GOOD',
  miss: 'MISS!',
  taps: 'TAPS',
  nails: 'NAILS',
  clear: 'ALL NAILS IN!',
  retry: 'PLAY AGAIN',
  menu: 'MENU',
  best: 'BEST',
  newRecord: 'NEW BEST!',
  tapToHit: 'Swing the hammer down onto the nails',
  howtoTitle: 'HOW TO PLAY',
  howtoBody: [
    'Drag your finger to move the hammer around.',
    'Swing it straight DOWN onto a nail head to drive it in.',
    'Lift up and swing down again to keep hammering.',
    'Fewer taps is a better score — aim for dead-center hits!',
    'Chain PERFECT hits in a row to power up and finish faster!',
    'Drive all 4 nails flush to finish.',
  ],
  close: 'GOT IT',
};

// Best score = FEWEST taps.
const BEST_KEY = 'nm_best_taps_v3';
export function getBest() {
  try { const v = parseInt(localStorage.getItem(BEST_KEY), 10); return Number.isFinite(v) ? v : null; }
  catch { return null; }
}
export function saveBest(taps) {
  const cur = getBest();
  const isNew = cur == null || taps < cur;
  if (isNew) localStorage.setItem(BEST_KEY, String(taps));
  return isNew;
}
