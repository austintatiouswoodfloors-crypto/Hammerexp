import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import NailBoard from './NailBoard';
import { MAX_DEPTH, HIT_DEPTH } from '../mock';
import { SFX } from '../audio';
import { Home, Hammer } from 'lucide-react';

const PLANK_H = 92;
const NAIL_BOTTOM = PLANK_H - 6; // matches NailBoard
const MAX_EXPOSED = 150;

const exposedFor = (depth) => Math.max(8, MAX_EXPOSED * (1 - depth / MAX_DEPTH));

export default function GameScreen({ t, game, onFinish, onMenu }) {
  const makeNails = useCallback(() =>
    Array.from({ length: game.nails }, (_, i) => ({ id: i, depth: 0, done: false })),
  [game]);

  const [nails, setNails] = useState(makeNails);
  const [boardW, setBoardW] = useState(400);
  const [boardH, setBoardH] = useState(600);
  const [hammerX, setHammerX] = useState(200);
  const [hammerY, setHammerY] = useState(150);
  const [taps, setTaps] = useState(0);
  const [swinging, setSwinging] = useState(false);
  const [hitFx, setHitFx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);

  const boardRef = useRef(null);
  const finishedRef = useRef(false);
  const swingingRef = useRef(false);
  const lastYRef = useRef(150);
  const cooldownRef = useRef(null);      // nail id currently "pressed" (needs lift)
  const hammerXRef = useRef(200);
  const nailsRef = useRef(nails);
  const nailXsRef = useRef([]);
  const boardHRef = useRef(600);
  const tapsRef = useRef(0);

  useEffect(() => { hammerXRef.current = hammerX; }, [hammerX]);
  useEffect(() => { nailsRef.current = nails; }, [nails]);
  useEffect(() => { boardHRef.current = boardH; }, [boardH]);

  // reset
  useEffect(() => {
    finishedRef.current = false;
    cooldownRef.current = null;
    tapsRef.current = 0;
    setNails(makeNails());
    setTaps(0);
  }, [game, makeNails]);

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
  const gap = Math.min(78, (boardW - 70) / Math.max(n, 1));
  const nailXs = nails.map((_, i) => boardW / 2 + (i - (n - 1) / 2) * gap);
  useEffect(() => { nailXsRef.current = nailXs; });

  const nearest = (x, list = nailsRef.current, xs = nailXsRef.current) => {
    let best = -1, bd = Infinity;
    xs.forEach((nx, i) => { if (list[i] && !list[i].done) { const d = Math.abs(nx - x); if (d < bd) { bd = d; best = i; } } });
    return { best, bd };
  };
  const { best: targetIndex, bd: targetDist } = nearest(hammerX, nails, nailXs);
  const highlight = targetDist <= game.goodR ? targetIndex : -1;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const total = tapsRef.current;
    let stars = 1;
    if (total <= game.nails * 21) stars = 3;       // ~84 or fewer (near-perfect)
    else if (total <= game.nails * 30) stars = 2;  // ~120 or fewer
    SFX.clear();
    setTimeout(() => onFinish({ taps: total, stars }), 650);
  }, [game, onFinish]);

  // resolve a strike on nail `best` at horizontal distance `bd`
  const doStrike = useCallback((best, bd) => {
    if (finishedRef.current || swingingRef.current) return;
    swingingRef.current = true;
    setSwinging(true);
    setTimeout(() => { swingingRef.current = false; setSwinging(false); }, 260);

    // every swing counts as a tap
    tapsRef.current += 1;
    setTaps(tapsRef.current);

    let tier, addDepth;
    if (best < 0) { tier = 'miss'; addDepth = 0; }
    else if (bd <= game.perfectR) { tier = 'perfect'; addDepth = HIT_DEPTH.perfect(); }
    else if (bd <= game.perfectR * 1.9) { tier = 'great'; addDepth = HIT_DEPTH.great(); }
    else if (bd <= game.goodR) { tier = 'good'; addDepth = HIT_DEPTH.good(); }
    else { tier = 'miss'; addDepth = 0; }

    if (tier === 'perfect') SFX.hitPerfect();
    else if (tier === 'great') SFX.hitGood();
    else if (tier === 'good') SFX.hitOk();
    else { SFX.miss(); setShake(true); setTimeout(() => setShake(false), 280); }

    setHitFx({ index: best, type: tier === 'miss' ? 'miss' : 'hit' });
    setTimeout(() => setHitFx(null), 500);

    const list0 = nailsRef.current;
    const fy = best >= 0 && list0[best]
      ? boardHRef.current - NAIL_BOTTOM - exposedFor(list0[best].depth) - 30
      : boardHRef.current / 2;
    const label = { perfect: t.perfect, great: t.great, good: t.good, miss: t.miss }[tier];
    const color = { perfect: '#3fae6a', great: '#f0a92e', good: '#5a86a3', miss: '#e06a5a' }[tier];
    setFeedback({ text: label, color, key: Date.now(), x: hammerXRef.current, y: fy });

    setNails((prev) => {
      const list = prev.map((c) => ({ ...c }));
      const nail = best >= 0 ? list[best] : null;
      if (nail && !nail.done && addDepth > 0) {
        nail.depth = Math.min(MAX_DEPTH, nail.depth + addDepth);
        if (nail.depth >= MAX_DEPTH) nail.done = true;
      }
      if (list.every((c) => c.done)) setTimeout(finish, 250);
      return list;
    });
  }, [game, t, finish]);

  // ===== finger control: move hammer in 2D, swing DOWN onto a nail to strike =====
  const applyPointer = (clientX, clientY) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(24, Math.min(rect.width - 24, clientX - rect.left));
    const y = Math.max(12, Math.min(rect.height - 20, clientY - rect.top));
    const dy = y - lastYRef.current;
    lastYRef.current = y;
    setHammerX(x); setHammerY(y); hammerXRef.current = x;

    if (finishedRef.current) return;
    const { best, bd } = nearest(x);
    if (best < 0) { cooldownRef.current = null; return; }
    const headY = boardHRef.current - NAIL_BOTTOM - exposedFor(nailsRef.current[best].depth);
    if (cooldownRef.current !== null && cooldownRef.current !== best) cooldownRef.current = null;
    if (y < headY - 48) cooldownRef.current = null;
    if (bd <= game.goodR * 1.5 && dy > 1.5 && y >= headY - 16 && cooldownRef.current !== best) {
      cooldownRef.current = best;
      doStrike(best, bd);
    }
  };

  const onPointerDown = (e) => {
    if (finishedRef.current) return;
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
        <div className="bg-white/90 rounded-xl px-5 py-1 shadow text-center min-w-[110px]">
          <div className="text-[10px] font-bold text-[#7c9aad] leading-none flex items-center justify-center gap-1"><Hammer size={11} />{t.taps}</div>
          <div className="font-display font-extrabold text-2xl text-[#37546a] leading-tight">{taps}</div>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* progress */}
      <div className="flex items-center justify-center mt-2 px-4 h-7">
        <div className="text-[#4a7590] font-bold text-sm">{t.nails}: {done}/{n}</div>
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
          </div>
        )}
        <NailBoard nails={nails} nailXs={nailXs} hammerX={hammerX} hammerY={hammerY} swinging={swinging}
                   hitFx={hitFx} targetIndex={highlight} plankH={PLANK_H} />
      </div>

      {/* hint */}
      <div className="text-center text-[#5a86a3] text-xs font-semibold pb-5 pt-1">{t.tapToHit}</div>
    </div>
  );
}
