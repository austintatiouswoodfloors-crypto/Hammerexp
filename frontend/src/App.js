import React, { useState, useEffect } from 'react';
import './App.css';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import HowToModal from './components/HowToModal';
import { STR, GAME, getBest, saveBest } from './mock';
import { SFX, setMuted } from './audio';

export default function App() {
  const [screen, setScreen] = useState('title'); // title | game | result
  const [muted, setMutedState] = useState(false);
  const [howto, setHowto] = useState(false);
  const [result, setResult] = useState(null);

  const t = STR;

  useEffect(() => { setMuted(muted); }, [muted]);

  const startGame = () => { SFX.click(); setResult(null); setScreen('game'); };

  const handleFinish = (r) => {
    const isNew = saveBest(r.taps);
    setResult({ ...r, isNewRecord: isNew, best: getBest() });
    setScreen('result');
  };

  return (
    <div className="App min-h-screen w-full flex items-center justify-center sm:p-4">
      <div className="phone-shell">
        {screen === 'title' && (
          <TitleScreen t={t}
            muted={muted} onToggleMute={() => setMutedState((m) => !m)}
            onStart={startGame}
            onHowTo={() => { SFX.click(); setHowto(true); }} />
        )}

        {screen === 'game' && (
          <GameScreen t={t} game={GAME} onFinish={handleFinish}
            onMenu={() => { SFX.click(); setScreen('title'); }} />
        )}

        {screen === 'result' && result && (
          <ResultScreen t={t} taps={result.taps} stars={result.stars}
            best={result.best} isNewRecord={result.isNewRecord}
            onRetry={startGame} onMenu={() => { SFX.click(); setScreen('title'); }} />
        )}

        <HowToModal open={howto} onClose={() => setHowto(false)} t={t} />
      </div>
    </div>
  );
}
