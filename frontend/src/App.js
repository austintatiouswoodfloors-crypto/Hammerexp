import React, { useState, useEffect } from 'react';
import './App.css';
import TitleScreen from './components/TitleScreen';
import LevelSelect from './components/LevelSelect';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import HowToModal from './components/HowToModal';
import { T, LEVELS, getHighScores, saveHighScore, getUnlocked, unlockLevel } from './mock';
import { SFX, setMuted } from './audio';

export default function App() {
  const [screen, setScreen] = useState('title'); // title | levels | game | result
  const [lang, setLang] = useState('ja');
  const [muted, setMutedState] = useState(false);
  const [howto, setHowto] = useState(false);
  const [level, setLevel] = useState(LEVELS[0]);
  const [unlocked, setUnlocked] = useState(getUnlocked());
  const [result, setResult] = useState(null);

  const t = T[lang];

  useEffect(() => { setMuted(muted); }, [muted]);

  const startLevel = (lv) => { SFX.click(); setLevel(lv); setResult(null); setScreen('game'); };

  const handleFinish = (r) => {
    const isNew = saveHighScore(level.id, r.score);
    if (r.win) { unlockLevel(level.id + 1); setUnlocked(getUnlocked()); }
    setResult({ ...r, isNewRecord: isNew, best: getHighScores()[level.id] || r.score });
    setScreen('result');
  };

  const nextLevel = () => {
    const idx = LEVELS.findIndex((l) => l.id === level.id);
    if (idx < LEVELS.length - 1) startLevel(LEVELS[idx + 1]);
    else setScreen('levels');
  };

  const hasNext = LEVELS.findIndex((l) => l.id === level.id) < LEVELS.length - 1;

  return (
    <div className="App">
      {screen === 'title' && (
        <TitleScreen t={t} lang={lang}
          onToggleLang={() => { SFX.click(); setLang((l) => (l === 'ja' ? 'en' : 'ja')); }}
          muted={muted} onToggleMute={() => setMutedState((m) => !m)}
          onStart={() => { SFX.click(); setScreen('levels'); }}
          onHowTo={() => { SFX.click(); setHowto(true); }} />
      )}

      {screen === 'levels' && (
        <LevelSelect t={t} lang={lang} unlocked={unlocked}
          onSelect={startLevel} onBack={() => { SFX.click(); setScreen('title'); }} />
      )}

      {screen === 'game' && (
        <GameScreen t={t} level={level} best={getHighScores()[level.id] || 0}
          onFinish={handleFinish} onMenu={() => setScreen('levels')} />
      )}

      {screen === 'result' && result && (
        <ResultScreen t={t} win={result.win} stars={result.stars} score={result.score}
          best={result.best} isNewRecord={result.isNewRecord} hasNext={hasNext}
          onRetry={() => startLevel(level)} onNext={nextLevel}
          onMenu={() => { SFX.click(); setScreen('levels'); }} />
      )}

      <HowToModal open={howto} onClose={() => setHowto(false)} t={t} />
    </div>
  );
}
