import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import NailBoard from './NailBoard';
import { MAX_DEPTH, MAX_BEND } from '../mock';
import { SFX } from '../audio';
import { Pause, Play, Home, Clock, Zap } from 'lucide-react';

const PLANK_H = 92;
const NAIL_BOTTOM = PLANK_H - 6; // matches NailBoard
const MAX_EXPOSED = 150;

const exposedFor = (depth) => Math.max(8, MAX_EXPOSED * (1 - depth / MAX_DEPTH));

export default function GameScreen({ t, level, onFinish, onMenu }) {
  const makeNails = useCallback(() =>
    Array.from({ length: level.nails }, (_, i) => ({ id: i, depth: 0, bent: 0, done: false, ruined: false })),
  [level]);

  const [nails, setNails] = useState(makeNails);
  const [boardW, setBoardW] = useState(400);
  const [boardH, setBoardH] = useState(600);
  const [hammerX, setHammerX] = useState(200);
  const [hammerY, setHammerY] = useState(150);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.time);
  const [swinging, setSwinging] = useState(false);
  const [hitFx, setHitFx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [paused, setPaused] = useState(false);
  const [shake, setShake] = useState(false);

  const boardRef = useRef(null);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const swingingRef = useRef(false);
  const lastYRef = useRef(150);
  const cooldownRef = useRef(null);      // nail id currently "pressed" (needs lift)
  const hammerXRef = useRef(200);
  const nailsRef = useRef(nails);
  const nailXsRef = useRef([]);
  const boardHRef = useRef(600);
  const statsRef = useRef({ strikes: 0, perfects: 0, bends: 0 });

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { hammerXRef.current = hammerX; }, [hammerX]);
  useEffect(() => { nailsRef.current = nails; }, [nails]);
  useEffect(() => { boardHRef.current = boardH; }, [boardH]);

  // reset per level
  useEffect(() => {
    finishedRef.current = false;
    cooldownRef.current = null;
    statsRef.current = { strikes: 0, perfects: 0, bends: 0 };
    setNails(makeNails());
    setScore(0); setCombo(0); setMaxCombo(0); setTimeLeft(level.time); setPaused(false);
  }, [level, makeNails]);

  // measure board
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => {
      setBoardW(el.clientWidth);
      setBoardH(el.clientHeight);
      setHammerX((prev) => (prev && prev > 0 ? prev : el.clientWidth / 2));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // nail x positions
  const n = nails.length;
  const gap = Math.min(74, (boardW - 70) / Math.max(n, 1));
  const nailXs = nails.map((_, i) => boardW / 2 + (i - (n - 1) / 2) * gap);
  useEffect(() => { nailXsRef.current = nailXs; });

  const nearest = (x, list = nailsRef.current, xs = nailXsRef.current) => {
    let best = -1, bd = Infinity;
    xs.forEach((nx, i) => { if (list[i] && !list[i].done) { const d = Math.abs(nx - x); if (d < bd) { bd = d; best = i; } } });
    return { best, bd };
  };
  const { best: targetIndex, bd: targetDist } = nearest(hammerX, nails, nailXs);
  const highlight = targetDist <= level.goodR ? targetIndex : -1;

  // timer
  useEffect(() => {
    const iv = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(iv); finish(false); return 0; }
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
    if (win) { stars = 1; if (bends <= 1) stars = 2; if (bends === 0 && perfects >= level.nails) stars = 3; }
    win ? SFX.clear() : SFX.fail();
    setScore((finalScore) => {
      const timeBonus = win ? Math.round(timeLeft * 5) : 0;
      const total = finalScore + timeBonus + maxCombo * 10;
      setTimeout(() => onFinish({ win, stars, score: total, strikes, perfects, bends }), 650);
      return total;
    });
  }, [level, timeLeft, maxCombo, onFinish]);

  // resolve a strike on nail index `best` at horizontal distance `bd`
  const doStrike = useCallback((best, bd) => {
    if (pausedRef.current || finishedRef.current || swingingRef.current) return;
    swingingRef.current = true;
    setSwinging(true);
    setTimeout(() => { swingingRef.current = false; setSwinging(false); }, 260);
    statsRef.current.strikes += 1;

    let tier, addDepth, addScore;
    if (best < 0) { tier = 'miss'; addDepth = 0; addScore = 0; }
    else if (bd <= level.perfectR) { tier = 'perfect'; addDepth = 3; addScore = 100; statsRef.current.perfects += 1; }
    else if (bd <= level.perfectR * 1.9) { tier = 'great'; addDepth = 2; addScore = 60; }
    else if (bd <= level.goodR) { tier = 'good'; addDepth = 1; addScore = 20; }
    else { tier = 'miss'; addDepth = 0; addScore = 0; }

    const glancing = tier === 'miss' && best >= 0 && bd <= level.goodR * 1.7;
    const isCombo = tier === 'perfect' || tier === 'great';
    let newCombo = 0;
    if (isCombo) { newCombo = combo + 1; setCombo(newCombo); setMaxCombo((m) => Math.max(m, newCombo)); }
    else setCombo(0);
    const comboMult = 1 + (isCombo ? newCombo - 1 : 0) * 0.15;
    const gained = Math.round(addScore * comboMult);
    if (gained) setScore((s) => s + gained);

    if (tier === 'perfect') SFX.hitPerfect();
    else if (tier === 'great') SFX.hitGood();
    else if (tier === 'good') SFX.hitOk();
    else { SFX.miss(); setShake(true); setTimeout(() => setShake(false), 300); }

    setHitFx({ index: best, type: tier === 'miss' ? 'miss' : 'hit' });
    setTimeout(() => setHitFx(null), 500);

    // feedback position
    const list0 = nailsRef.current;
    const fy = best >= 0 && list0[best]
      ? boardHRef.current - NAIL_BOTTOM - exposedFor(list0[best].depth) - 30
      : boardHRef.current / 2;
    const label = { perfect: t.perfect, great: t.great, good: t.good, miss: t.miss }[tier];
    const color = { perfect: '#3fae6a', great: '#f0a92e', good: '#5a86a3', miss: '#e06a5a' }[tier];
    setFeedback({ text: label, color, key: Date.now(), x: hammerXRef.current, y: fy, combo: isCombo && newCombo > 1 ? newCombo : null });

    setNails((prev) => {
      const list = prev.map((c) => ({ ...c }));
      const nail = best >= 0 ? list[best] : null;
      if (nail && !nail.done) {
        if (tier === 'miss') {
          if (glancing) {
            nail.bent = Math.min(MAX_BEND, nail.bent + 1);
            statsRef.current.bends += 1;
            if (nail.bent >= MAX_BEND) { nail.ruined = true; nail.done = true; }
          }
        } else {
          nail.depth = Math.min(MAX_DEPTH, nail.depth + addDepth);
          if (nail.depth >= MAX_DEPTH) nail.done = true;
        }
      }
      if (list.every((c) => c.done)) setTimeout(() => finish(true), 250);
      return list;
    });
  }, [level, combo, t, finish]);

  // ===== finger control: move hammer in 2D, swing DOWN onto a nail to strike =====
  const applyPointer = (clientX, clientY) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(24, Math.min(rect.width - 24, clientX - rect.left));
    const y = Math.max(12, Math.min(rect.height - 20, clientY - rect.top));
    const dy = y - lastYRef.current;
    lastYRef.current = y;
    setHammerX(x); setHammerY(y); hammerXRef.current = x;

    if (pausedRef.current || finishedRef.current) return;
    const { best, bd } = nearest(x);
    if (best < 0) { cooldownRef.current = null; return; }
    const headY = boardHRef.current - NAIL_BOTTOM - exposedFor(nailsRef.current[best].depth);
    // clear cooldown if switched nail or lifted well above the head
    if (cooldownRef.current !== null && cooldownRef.current !== best) cooldownRef.current = null;
    if (y < headY - 48) cooldownRef.current = null;
    // downward swing reaching the nail head, within contact range
    if (bd <= level.goodR * 1.6 && dy > 1.5 && y >= headY - 16 && cooldownRef.current !== best) {
      cooldownRef.current = best;
      doStrike(best, bd);
    }
  };

  const onPointerDown = (e) => {
    if (paused || finishedRef.current) return;
    e.preventDefault();
    try { boardRef.current.setPointerCapture(e.pointerId); } catch {}
    lastYRef.current = e.clientY - boardRef.current.getBoundingClientRect().top;
    applyPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => { applyPointer(e.clientX, e.clientY); };

  // keyboard fallback (desktop)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); const { best, bd } = nearest(hammerXRef.current); doStrike(best, bd); }
      else if (e.code === 'ArrowLeft') setHammerX((x) => { const nx = Math.max(24, x - 18); hammerXRef.current = nx; return nx; });
      else if (e.code === 'ArrowRight') setHammerX((x) => { const nx = Math.min(boardW - 24, x + 18); hammerXRef.current = nx; return nx; });
      else if (e.code === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doStrike, boardW]);

  const done = nails.filter((c) => c.done).length;

  return (
    <div className="h-full sky-bg flex flex-col select-none overflow-hidden">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 pt-4 gap-2">
        <button onClick={onMenu} className="h-10 w-10 rounded-full bg-white/85 shadow flex items-center justify-center text-[#4a7590] active:scale-95 transition-transform">
          <Home size={18} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="bg-white/90 rounded-xl px-3 py-1 shadow text-center min-w-[92px]">
            <div className="text-[10px] font-bold text-[#7c9aad] leading-none">{t.score}</div>
            <div className="font-display font-extrabold text-xl text-[#37546a] leading-tight">{score}</div>
          </div>
          <div className={`rounded-xl px-3 py-1 shadow text-center min-w-[70px] ${timeLeft <= 10 ? 'bg-[#fbd9d2]' : 'bg-white/90'}`}>
            <div className="text-[10px] font-bold text-[#7c9aad] leading-none flex items-center justify-center gap-0.5"><Clock size={10} />{t.time}</div>
            <div className={`font-display font-extrabold text-xl leading-tight ${timeLeft <= 10 ? 'text-[#e06a5a]' : 'text-[#37546a]'}`}>{timeLeft}</div>
          </div>
        </div>
        <button onClick={() => { SFX.click(); setPaused((p) => !p); }} className="h-10 w-10 rounded-full bg-white/85 shadow flex items-center justify-center text-[#4a7590] active:scale-95 transition-transform">
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>

      {/* progress + combo */}
      <div className="flex items-center justify-center gap-4 mt-2 px-4 h-7">
        <div className="text-[#4a7590] font-bold text-sm">{t.nails}: {done}/{n}</div>
        {combo > 1 && (
          <div className="flex items-center gap-1 text-[#f0932e] font-display font-extrabold text-lg">
            <Zap size={18} className="fill-[#ffcf5e] text-[#f0a92e]" /> {combo} {t.combo}
          </div>
        )}
      </div>

      {/* interactive board */}
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className={`relative flex-1 mt-1 ${shake ? 'shake' : ''}`}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        {feedback && (
          <div key={feedback.key} className="feedback-pop absolute z-20 text-center pointer-events-none"
               style={{ left: feedback.x, top: feedback.y, transform: 'translateX(-50%)' }}>
            <div className="font-display font-extrabold text-2xl drop-shadow" style={{ color: feedback.color }}>{feedback.text}</div>
            {feedback.combo && <div className="font-display font-extrabold text-base text-[#f0932e]">x{feedback.combo}</div>}
          </div>
        )}
        <NailBoard nails={nails} nailXs={nailXs} hammerX={hammerX} hammerY={hammerY} swinging={swinging}
                   hitFx={hitFx} targetIndex={highlight} plankH={PLANK_H} />
      </div>

      {/* hint */}
      <div className="text-center text-[#5a86a3] text-xs font-semibold pb-5 pt-1">{t.tapToHit}</div>

      {/* pause overlay */}
      {paused && (
        <div className="absolute inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-30" onClick={() => setPaused(false)}>
          <div className="bg-white rounded-3xl p-7 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="font-display font-extrabold text-2xl text-[#37546a] mb-4">PAUSED</div>
            <button onClick={() => setPaused(false)} className="block w-48 h-12 mb-2 rounded-2xl bg-[#4aa3e0] text-white font-bold active:scale-95 transition-transform">{t.close}</button>
            <button onClick={onMenu} className="block w-48 h-11 rounded-2xl bg-[#eef7fd] text-[#4a7590] font-bold active:scale-95 transition-transform">{t.menu}</button>
          </div>
        </div>
      )}
    </div>
  );
}
