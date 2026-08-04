import React from 'react';
import { MAX_DEPTH } from '../mock';
import HammerSprite from './HammerSprite';

// Nails on a plank, a finger-tracking hammer, hit sparks + twinkle-on-complete.
export default function NailBoard({ nails, nailXs, hammerX, hammerY, swinging, hitFx, doneFx, plankH = 90, maxExposed = 200, hammerSize = 128, night = false }) {
  const nailBottom = plankH - 6;
  const bodyW = Math.max(12, Math.round(maxExposed * 0.075));
  const headW = bodyW * 2.6;
  const headH = Math.max(9, Math.round(bodyW * 0.9));
  return (
    <>
      {/* nails */}
      {nails.map((nail, i) => {
        const progress = Math.min(nail.depth / MAX_DEPTH, 1);
        const exposed = Math.max(10, maxExposed * (1 - progress));
        const ring = hitFx && hitFx.index === i;
        const twinkle = doneFx && doneFx.index === i;
        return (
          <div key={nail.id} className="absolute flex flex-col items-center pointer-events-none"
               style={{ left: nailXs[i], bottom: nailBottom, transform: 'translateX(-50%)' }}>
            <div style={{ height: maxExposed, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              <div style={{ transformOrigin: 'bottom center', transition: 'height 0.12s linear' }}
                   className="relative flex flex-col items-center">
                <div className="nail-head-s rounded-full" style={{ width: headW, height: headH, zIndex: 2 }} />
                <div className="nail-body-s" style={{ width: bodyW, height: exposed, marginTop: -2,
                                 clipPath: 'polygon(0 0,100% 0,58% 100%,42% 100%)' }} />
              </div>
              {ring && <Sparks key={hitFx.key} />}
              {twinkle && <Twinkle key={doneFx.key} />}
            </div>
          </div>
        );
      })}

      {/* hammer tracks touch 1:1 — striking face sits exactly on the touch point */}
      <div className="absolute pointer-events-none" style={{
        left: hammerX, top: hammerY, transform: 'translate(-75.7%,-90%)',
      }}>
        <div className={swinging ? 'hammer-strike' : ''}
             style={{ transformOrigin: '80% 62%' }}>
          <HammerSprite size={hammerSize} />
        </div>
      </div>

      {/* plank */}
      <div className={`absolute left-0 right-0 bottom-0 ${night ? 'night-plank' : 'plank-light'}`} style={{ height: plankH }}>
        <div className="w-full h-full opacity-30"
             style={{ background: 'repeating-linear-gradient(90deg, rgba(150,110,60,0.15) 0 1px, transparent 1px 70px)' }} />
      </div>
    </>
  );
}

// Firecracker-style spark burst emitted from a nail head on strike.
function Sparks() {
  const COLORS = ['#ffd54a', '#ff9f1a', '#ffffff', '#ffcf5e', '#ffb347'];
  const parts = React.useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
    const d = 20 + Math.random() * 30;
    return {
      tx: Math.cos(a) * d,
      ty: Math.sin(a) * d - 6,
      c: COLORS[i % COLORS.length],
      s: 3 + Math.random() * 3,
      delay: Math.random() * 0.04,
    };
  }), []);
  return (
    <div className="absolute" style={{ left: '50%', top: 6, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 5 }}>
      <div className="ring-burst rounded-full absolute" style={{
        left: '50%', top: '50%', width: 20, height: 20,
        background: 'radial-gradient(circle, #fff 0%, #ffe08a 55%, transparent 70%)',
      }} />
      {parts.map((p, idx) => (
        <span key={idx} className="spark absolute rounded-full" style={{
          left: '50%', top: '50%', width: p.s, height: p.s, background: p.c,
          boxShadow: `0 0 6px ${p.c}, 0 0 10px ${p.c}`,
          animationDelay: `${p.delay}s`,
          '--tx': `${p.tx}px`, '--ty': `${p.ty}px`,
        }} />
      ))}
    </div>
  );
}

// Golden twinkle ring + star sparkles shown when a nail is fully driven.
function Twinkle() {
  const stars = React.useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6;
    const d = 22 + Math.random() * 8;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, delay: Math.random() * 0.15 };
  }), []);
  return (
    <div className="absolute" style={{ left: '50%', top: 4, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 6 }}>
      <div className="twinkle-ring rounded-full absolute" style={{
        left: '50%', top: '50%', width: 34, height: 34,
        border: '3px solid #ffd35a', boxShadow: '0 0 14px rgba(255,211,90,0.8)',
      }} />
      {stars.map((s, i) => (
        <span key={i} className="twinkle-star absolute" style={{
          left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)`,
          color: '#fff2b0', animationDelay: `${s.delay}s`,
        }}>
          <Star4 />
        </span>
      ))}
    </div>
  );
}

function Star4() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px #ffe08a)' }}>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}
