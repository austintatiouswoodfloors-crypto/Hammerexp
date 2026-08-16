import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import NailBoard from './NailBoard';
import NightSky from './NightSky';
import { MAX_DEPTH } from '../mock';
import { SFX } from '../audio';
import { Home, Hammer } from 'lucide-react';

const PLANK_H = 92;
const NAIL_BOTTOM = PLANK_H - 6; // matches NailBoard

// speed (px/ms downward) -> depth per strike. slow = shallow, fast = deep.
// Tuned so a nail (depth 100) takes ~20 taps (fast) to ~30 taps (slow).
function depthFromSpeed(vy) {
  const s = Math.max(vy, 0);
  const norm = Math.min(Math.max((s - 0.12) / (2.0 - 0.12), 0), 1);
  return 3.35 + norm * (5.0 - 3.35); // slow ~3.35 (~30 taps) .. fast ~5.0 (~20 taps)
}

export default function GameScreen({ t, game, night, onFinish, onMenu }) {
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
  const [doneFx, setDoneFx] = useState(null);
  const [cleared, setCleared] = useState(false);

  const boardRef = useRef(null);
  const finishedRef = useRef(false);
  const swingingRef = useRef(false);
  const lastYRef = useRef(150);
  const lastTimeRef = useRef(0);
  const cooldownRef = useRef(null);      // nail id currently "pressed" (needs lift)
  const hammerXRef = useRef(200);
  const nailsRef = useRef(nails);
  const nailXsRef = useRef([]);
  const boardHRef = useRef(600);
  const tapsRef = useRef(0);
  const maxExposedRef = useRef(200);

  const maxExposed = Math.max(180, Math.round(boardH * 0.30));
  const hammerSize = Math.min(310, Math.max(200, Math.round(boardW * 0.66)));
  useEffect(() => { maxExposedRef.current = maxExposed; }, [maxExposed]);
  const exposedFor = useCallback((depth) => Math.max(12, maxExposedRef.current * (1 - depth / MAX_DEPTH)), []);

  useEffect(() => { hammerXRef.current = hammerX; }, [hammerX]);
  useEffect(() => { nailsRef.current = nails; }, [nails]);
  useEffect(() => { boardHRef.current = boardH; }, [boardH]);

  useEffect(() => {
    finishedRef.current = false;
    cooldownRef.current = null;
    tapsRef.current = 0;
    setNails(makeNails());
    setTaps(0);
    setDoneFx(null);
    setCleared(false);
  }, [game, makeNails]);

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

  const n = nails.length;
  const gap = Math.min(78, (boardW - 70) / Math.max(n, 1));
  const nailXs = nails.map((_, i) => boardW / 2 + (i - (n - 1) / 2) * gap);
  useEffect(() => { nailXsRef.current = nailXs; });

  const nearest = (x, list = nailsRef.current, xs = nailXsRef.current) => {
    let best = -1, bd = Infinity;
    xs.forEach((nx, i) => { if (list[i] && !list[i].done) { const d = Math.abs(nx - x); if (d < bd) { bd = d; best = i; } } });
    return { best, bd };
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const total = tapsRef.current;
    let stars = 1;
    if (total <= game.nails * 22) stars = 3;
    else if (total <= game.nails * 27) stars = 2;
    SFX.win(); // plays even if muted, to alert the player of the win
    setTimeout(() => onFinish({ taps: total, stars }), 700);
  }, [game, onFinish]);

  // resolve a strike on nail `best` with downward speed `vy`
  const doStrike = useCallback((best, vy) => {
    if (finishedRef.current || best < 0) return;
    swingingRef.current = true;
    setSwinging(true);
    setTimeout(() => { swingingRef.current = false; setSwinging(false); }, 180);

    tapsRef.current += 1;
    setTaps(tapsRef.current);

    const addDepth = depthFromSpeed(vy);
    SFX.tap();
    setHitFx({ index: best, type: 'hit', key: Date.now() });
    setTimeout(() => setHitFx(null), 500);

    const cur = nailsRef.current[best];
    const nailDone = cur && !cur.done && cur.depth + addDepth >= MAX_DEPTH;
    if (nailDone) {
      const idx = best;
      SFX.twinkle();
      setDoneFx({ index: idx, key: Date.now() });
      setTimeout(() => setDoneFx((d) => (d && d.index === idx ? null : d)), 900);
    }

    setNails((prev) => {
      const list = prev.map((c) => ({ ...c }));
      const nail = list[best];
      if (nail && !nail.done) {
        nail.depth = Math.min(MAX_DEPTH, nail.depth + addDepth);
        if (nail.depth >= MAX_DEPTH) nail.done = true;
      }
      nailsRef.current = list; // sync immediately so rapid taps use fresh depth
      if (list.every((c) => c.done)) {
        setTimeout(() => setCleared(true), 0); // full-board win twinkle (visible even when muted)
        setTimeout(finish, 450);
      }
      return list;
    });
  }, [finish]);

  // ===== finger control: hammer tracks touch 1:1; swing DOWN onto a nail to strike =====
  const applyPointer = (clientX, clientY) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const now = performance.now();
    let dt = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (dt <= 0) dt = 16;
    const dy = y - lastYRef.current;
    lastYRef.current = y;
    const vy = dy / dt; // px per ms (downward positive)

    setHammerX(x); setHammerY(y); hammerXRef.current = x;

    if (finishedRef.current) return;
    const { best, bd } = nearest(x);
    // not over a nail -> release contact so the next touch can count
    if (best < 0 || bd > game.goodR * 1.6) { cooldownRef.current = null; return; }
    const headY = boardHRef.current - NAIL_BOTTOM - exposedFor(nailsRef.current[best].depth);
    // switched to a different nail -> reset contact
    if (cooldownRef.current !== null && cooldownRef.current !== best) cooldownRef.current = null;
    // edge-trigger: the moment the hammer head reaches the nail head, count ONE tap.
    if (y >= headY - 8) {
      if (cooldownRef.current !== best) {
        cooldownRef.current = best; // mark this contact as counted
        doStrike(best, vy);
      }
    } else if (y < headY - 26) {
      // lifted clear of the head -> ready for the next tap
      if (cooldownRef.current === best) cooldownRef.current = null;
    }
  };

  const onPointerDown = (e) => {
    if (finishedRef.current) return;
    e.preventDefault();
    try { boardRef.current.setPointerCapture(e.pointerId); } catch {}
    const rect = boardRef.current.getBoundingClientRect();
    lastYRef.current = e.clientY - rect.top;
    lastTimeRef.current = performance.now();
    applyPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => { applyPointer(e.clientX, e.clientY); };

  // keyboard fallback (desktop): space = medium-speed strike
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); const { best } = nearest(hammerXRef.current); doStrike(best, 1.0); }
      else if (e.code === 'ArrowLeft') setHammerX((x) => { const nx = Math.max(0, x - 18); hammerXRef.current = nx; return nx; });
      else if (e.code === 'ArrowRight') setHammerX((x) => { const nx = Math.min(boardW, x + 18); hammerXRef.current = nx; return nx; });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doStrike, boardW]);

  const boxCls = night ? 'bg-white/12 text-white' : 'bg-[#f4f7fa] text-[#37546a]';
  const iconBtn = night ? 'bg-white/12 text-white' : 'bg-[#eef2f6] text-[#4a7590]';

  return (
    <div className={`h-full flex flex-col select-none overflow-hidden relative ${night ? 'night-bg' : 'bg-white'}`}>
      {night && <NightSky />}

      {/* HUD */}
      <div className="flex items-center justify-between px-4 pt-4 gap-2 z-[2]">
        <button onClick={onMenu} className={`h-10 w-10 rounded-full shadow flex items-center justify-center active:scale-95 transition-transform ${iconBtn}`}>
          <Home size={18} />
        </button>
        <div className={`rounded-xl px-5 py-1 shadow text-center min-w-[110px] ${boxCls}`}>
          <div className={`text-[10px] font-bold leading-none flex items-center justify-center gap-1 ${night ? 'text-slate-300' : 'text-[#7c9aad]'}`}><Hammer size={11} />{t.taps}</div>
          <div className="font-display font-extrabold text-2xl leading-tight">{taps}</div>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* interactive board */}
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative flex-1 mt-3 z-[1]"
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <NailBoard nails={nails} nailXs={nailXs} hammerX={hammerX} hammerY={hammerY} swinging={swinging}
                   hitFx={hitFx} doneFx={doneFx} plankH={PLANK_H}
                   maxExposed={maxExposed} hammerSize={hammerSize} night={night} />
        {cleared && <ClearBurst t={t} />}
      </div>

      {/* hint */}
      <div className={`text-center text-xs font-semibold pb-5 pt-1 z-[2] ${night ? 'text-slate-300' : 'text-[#5a86a3]'}`}>{t.tapToHit}</div>
    </div>
  );
}

// Full-board win twinkle — visual celebration that plays even when muted.
function ClearBurst({ t }) {
  const stars = React.useMemo(() => Array.from({ length: 28 }, () => ({
    left: 4 + Math.random() * 92,
    top: 6 + Math.random() * 82,
    size: 12 + Math.random() * 20,
    delay: Math.random() * 0.55,
    dur: 0.55 + Math.random() * 0.5,
    color: Math.random() > 0.5 ? '#ffd35a' : '#fff2b0',
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none z-[10] overflow-hidden">
      {/* soft golden flash */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 45%, rgba(255,224,138,0.4), rgba(255,224,138,0) 62%)',
        animation: 'star-twinkle 0.9s ease-out',
      }} />
      {/* CLEAR! banner */}
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 star-pop">
        <div className="font-display font-extrabold text-4xl" style={{ color: '#f0a92e', textShadow: '0 2px 0 #fff, 0 0 14px rgba(255,211,90,0.8)' }}>
          {t.clear}
        </div>
      </div>
      {/* twinkling stars across the board */}
      {stars.map((s, i) => (
        <span key={i} className="absolute" style={{
          left: `${s.left}%`, top: `${s.top}%`, color: s.color,
          animation: `star-pop ${s.dur}s ease-out ${s.delay}s both, star-twinkle 0.9s ease-in-out ${s.delay + 0.3}s infinite`,
        }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(0 0 5px #ffe08a)' }}>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
