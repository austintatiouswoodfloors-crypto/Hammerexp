import React, { useState, useEffect, useRef, useCallback } from 'react';
import NailBoard from './NailBoard';
import PowerGauge from './PowerGauge';
import { MAX_DEPTH, MAX_BEND } from '../mock';
import { SFX } from '../audio';
import { Pause, Play, Home, Clock, Zap } from 'lucide-react';

export default function GameScreen({ t, level, best, onFinish, onMenu }) {
  const makeNails = useCallback(() =>
    Array.from({ length: level.nails }, (_, i) => ({ id: i, depth: 0, bent: 0, done: false, ruined: false })),
  [level]);

  const [nails, setNails] = useState(makeNails);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.time);
  const [swinging, setSwinging] = useState(false);
  const [hitFx, setHitFx] = useState(null);
  const [feedback, setFeedback] = useState(null); // {text,color,key}
  const [paused, setPaused] = useState(false);
  const [shake, setShake] = useState(false);

  const rafRef = useRef(0);
  const phaseRef = useRef(0);
  const lastRef = useRef(0);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const statsRef = useRef({ strikes: 0, perfects: 0, bends: 0 });

  // keep refs in sync
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // reset on level change
  useEffect(() => {
    finishedRef.current = false;
    statsRef.current = { strikes: 0, perfects: 0, bends: 0 };
    setNails(makeNails());
    setActiveIndex(0); setScore(0); setCombo(0); setMaxCombo(0);
    setTimeLeft(level.time); setPaused(false);
  }, [level, makeNails]);

  // gauge animation loop
  useEffect(() => {
    const tick = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;
      if (!pausedRef.current && !finishedRef.current) {
        phaseRef.current += dt * level.speed;
        const p = phaseRef.current % 2;
        const tri = p < 1 ? p : 2 - p; // 0..1 triangle
        setPos(tri * 100);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [level.speed]);

  // countdown timer
  useEffect(() => {
    const iv = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          finish(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const finish = useCallback((win) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const { strikes, perfects, bends } = statsRef.current;
    let stars = 0;
    if (win) {
      stars = 1;
      if (bends <= 1) stars = 2;
      if (bends === 0 && perfects >= level.nails) stars = 3;
    }
    win ? SFX.clear() : SFX.fail();
    setScore((finalScore) => {
      const timeBonus = win ? Math.round((timeLeft) * 5) : 0;
      const total = finalScore + timeBonus + maxCombo * 10;
      setTimeout(() => onFinish({ win, stars, score: total, strikes, perfects, bends }), 700);
      return total;
    });
  }, [level, timeLeft, maxCombo, onFinish]);

  const advanceActive = useCallback((list) => {
    const next = list.findIndex((n) => !n.done);
    if (next === -1) { finish(true); return -1; }
    return next;
  }, [finish]);

  const doHit = useCallback(() => {
    if (paused || finishedRef.current || swinging) return;
    setSwinging(true);
    setTimeout(() => setSwinging(false), 320);
    statsRef.current.strikes += 1;

    const d = Math.abs(pos - 50); // 0..50
    let tier, addDepth, addScore;
    if (d <= level.perfect / 2) { tier = 'perfect'; addDepth = 3; addScore = 100; statsRef.current.perfects += 1; }
    else if (d <= level.good / 2) { tier = 'great'; addDepth = 2; addScore = 60; }
    else if (d <= 40) { tier = 'good'; addDepth = 1; addScore = 20; }
    else { tier = 'miss'; addDepth = 0; addScore = 0; }

    const isCombo = tier === 'perfect' || tier === 'great';
    let newCombo = combo;
    if (isCombo) { newCombo = combo + 1; setCombo(newCombo); setMaxCombo((m) => Math.max(m, newCombo)); }
    else setCombo(0);

    const comboMult = 1 + (isCombo ? newCombo - 1 : 0) * 0.15;
    const gained = Math.round(addScore * comboMult);
    setScore((s) => s + gained);

    // sfx + fx
    if (tier === 'perfect') SFX.hitPerfect();
    else if (tier === 'great') SFX.hitGood();
    else if (tier === 'good') SFX.hitOk();
    else { SFX.miss(); setShake(true); setTimeout(() => setShake(false), 350); }
    setHitFx(tier === 'miss' ? 'miss' : 'hit');
    setTimeout(() => setHitFx(null), 500);

    const label = { perfect: t.perfect, great: t.great, good: t.good, miss: t.miss }[tier];
    const color = { perfect: '#28a45a', great: '#f2b21f', good: '#8f5a22', miss: '#c23b2c' }[tier];
    setFeedback({ text: label, color, key: Date.now(), combo: isCombo && newCombo > 1 ? newCombo : null });

    // update nail
    setNails((prev) => {
      const list = prev.map((x) => ({ ...x }));
      const nail = list[activeIndex];
      if (!nail || nail.done) return prev;
      if (tier === 'miss') {
        nail.bent = Math.min(MAX_BEND, nail.bent + 1);
        statsRef.current.bends += 1;
        if (nail.bent >= MAX_BEND) { nail.ruined = true; nail.done = true; }
      } else {
        nail.depth = Math.min(MAX_DEPTH, nail.depth + addDepth);
        if (nail.depth >= MAX_DEPTH) nail.done = true;
      }
      if (nail.done) {
        const nextIdx = advanceActive(list);
        if (nextIdx >= 0) setActiveIndex(nextIdx);
      }
      return list;
    });
  }, [paused, swinging, pos, level, combo, activeIndex, t, advanceActive]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); doHit(); }
      if (e.code === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doHit]);

  const done = nails.filter((n) => n.done).length;

  return (
    <div className="min-h-screen wood-bg flex flex-col select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 pt-4 gap-2">
        <button onClick={onMenu} className="h-10 w-10 rounded-full bg-white/80 shadow flex items-center justify-center text-[#7a4a1e]">
          <Home size={18} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="bg-white/85 rounded-xl px-3 py-1 shadow text-center min-w-[92px]">
            <div className="text-[10px] font-bold text-[#a9702f] leading-none">{t.score}</div>
            <div className="font-display font-extrabold text-xl text-[#5a3410] leading-tight">{score}</div>
          </div>
          <div className={`rounded-xl px-3 py-1 shadow text-center min-w-[70px] ${timeLeft <= 10 ? 'bg-[#f7c5bf]' : 'bg-white/85'}`}>
            <div className="text-[10px] font-bold text-[#a9702f] leading-none flex items-center justify-center gap-0.5"><Clock size={10}/>{t.time}</div>
            <div className={`font-display font-extrabold text-xl leading-tight ${timeLeft <= 10 ? 'text-[#c23b2c]' : 'text-[#5a3410]'}`}>{timeLeft}</div>
          </div>
        </div>
        <button onClick={() => { SFX.click(); setPaused((p) => !p); }} className="h-10 w-10 rounded-full bg-white/80 shadow flex items-center justify-center text-[#7a4a1e]">
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>

      {/* progress + combo */}
      <div className="flex items-center justify-center gap-4 mt-3 px-4">
        <div className="text-[#7a4a1e] font-bold text-sm">{t.nails}: {done}/{nails.length}</div>
        {combo > 1 && (
          <div className="flex items-center gap-1 text-[#e0632c] font-display font-extrabold text-lg animate-pulse">
            <Zap size={18} className="fill-[#ffd257] text-[#f2b21f]" /> {combo} {t.combo}
          </div>
        )}
      </div>

      {/* Board */}
      <div className={`flex-1 flex items-center justify-center ${shake ? 'shake' : ''}`}>
        <div className="relative w-full">
          {/* feedback text */}
          {feedback && (
            <div key={feedback.key} className="feedback-pop absolute left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none" style={{ top: 40 }}>
              <div className="font-display font-extrabold text-3xl drop-shadow" style={{ color: feedback.color }}>{feedback.text}</div>
              {feedback.combo && <div className="font-display font-extrabold text-lg text-[#e0632c]">x{feedback.combo}</div>}
            </div>
          )}
          <NailBoard nails={nails} activeIndex={activeIndex} swinging={swinging} hitFx={hitFx} />
        </div>
      </div>

      {/* Gauge + hit button */}
      <div className="px-4 pb-8 pt-2">
        <PowerGauge pos={pos} perfect={level.perfect} good={level.good} />
        <p className="text-center text-[#8f5a22] text-xs font-medium mt-2">{t.tapToHit}</p>
        <button onClick={doHit}
          className="mt-3 w-full max-w-md mx-auto block h-16 rounded-2xl bg-[#e0632c] hover:bg-[#c9531f] text-white font-display font-extrabold text-2xl shadow-lg active:scale-95 transition-transform">
          {t.hammer}
        </button>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30" onClick={() => setPaused(false)}>
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="font-display font-extrabold text-2xl text-[#5a3410] mb-4">II</div>
            <button onClick={() => setPaused(false)} className="block w-48 h-12 mb-2 rounded-2xl bg-[#e0632c] text-white font-bold">{t.close}</button>
            <button onClick={onMenu} className="block w-48 h-11 rounded-2xl bg-[#f6efe2] text-[#7a4a1e] font-bold">{t.menu}</button>
          </div>
        </div>
      )}
    </div>
  );
}
