// Mock data for 釘打ち名人 (Nailing Master)
// NOTE: This data is MOCKED on the frontend. High scores are stored in
// the browser (localStorage). Later this can be backed by a real API/DB.

export const MAX_DEPTH = 6; // hits-worth of depth needed to fully sink a nail
export const MAX_BEND = 3;  // bends before a nail is ruined

// Level configuration. Difficulty scales: more nails, faster gauge, smaller perfect zone.
export const LEVELS = [
  { id: 1, name: '練習', nameEn: 'Practice',  nails: 3, speed: 0.85, perfect: 12, good: 26, time: 40 },
  { id: 2, name: '初級', nameEn: 'Easy',      nails: 4, speed: 1.05, perfect: 11, good: 24, time: 40 },
  { id: 3, name: '中級', nameEn: 'Normal',    nails: 5, speed: 1.25, perfect: 10, good: 22, time: 45 },
  { id: 4, name: '上級', nameEn: 'Hard',      nails: 6, speed: 1.5,  perfect: 9,  good: 20, time: 45 },
  { id: 5, name: '達人', nameEn: 'Expert',    nails: 7, speed: 1.75, perfect: 8,  good: 18, time: 50 },
  { id: 6, name: '名人', nameEn: 'Master',    nails: 8, speed: 2.1,  perfect: 7,  good: 16, time: 50 },
];

// Bilingual UI strings
export const T = {
  ja: {
    title: '釘打ち名人',
    subtitle: 'ハンマーで釘を打ち込め！',
    start: 'スタート',
    howto: 'あそびかた',
    levelSelect: 'ステージ選択',
    back: 'もどる',
    hammer: '打つ！',
    perfect: 'パーフェクト！',
    great: 'グレート！',
    good: 'グッド',
    ok: 'あまい',
    miss: 'ミス！',
    combo: 'コンボ',
    score: 'スコア',
    time: 'タイム',
    nails: '釘',
    result: 'リザルト',
    clear: 'ステージクリア！',
    timeup: 'タイムアップ',
    retry: 'もう一度',
    next: '次のステージ',
    menu: 'メニューへ',
    best: 'ベスト',
    newRecord: '新記録！',
    tapToHit: 'タップ / スペースキーで打つ',
    howtoTitle: 'あそびかた',
    howtoBody: [
      'ゲージが動いている間にタップ（またはスペースキー）でハンマーを振る。',
      '中央の緑ゾーンで打つほど釘が深く入り、コンボでスコアUP！',
      '赤ゾーンで打つと釘が曲がる。曲げすぎると釘がダメに…',
      '制限時間内にすべての釘を打ち込もう！',
    ],
    close: 'とじる',
    stage: 'ステージ',
    strikes: '打数',
  },
  en: {
    title: 'Nailing Master',
    subtitle: 'Hammer the nails in!',
    start: 'START',
    howto: 'HOW TO PLAY',
    levelSelect: 'SELECT STAGE',
    back: 'BACK',
    hammer: 'HIT!',
    perfect: 'PERFECT!',
    great: 'GREAT!',
    good: 'GOOD',
    ok: 'WEAK',
    miss: 'MISS!',
    combo: 'COMBO',
    score: 'SCORE',
    time: 'TIME',
    nails: 'NAILS',
    result: 'RESULT',
    clear: 'STAGE CLEAR!',
    timeup: 'TIME UP',
    retry: 'RETRY',
    next: 'NEXT STAGE',
    menu: 'MENU',
    best: 'BEST',
    newRecord: 'NEW RECORD!',
    tapToHit: 'Tap / press SPACE to hit',
    howtoTitle: 'HOW TO PLAY',
    howtoBody: [
      'While the gauge moves, tap (or press SPACE) to swing the hammer.',
      'Hit inside the green PERFECT zone to sink the nail deeper and build combos!',
      'Hitting the red zone bends the nail. Bend it too much and it is ruined.',
      'Sink all the nails before time runs out!',
    ],
    close: 'CLOSE',
    stage: 'STAGE',
    strikes: 'STRIKES',
  },
};

// ---- Local high-score persistence (mocked backend) ----
const HS_KEY = 'nm_highscores_v1';
const PROG_KEY = 'nm_progress_v1';

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
  try {
    const v = parseInt(localStorage.getItem(PROG_KEY), 10);
    return Number.isFinite(v) ? v : 1;
  } catch { return 1; }
}

export function unlockLevel(levelId) {
  const cur = getUnlocked();
  if (levelId > cur) localStorage.setItem(PROG_KEY, String(levelId));
}
