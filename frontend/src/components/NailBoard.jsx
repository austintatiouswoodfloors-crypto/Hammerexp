import React from 'react';
import { MAX_DEPTH } from '../mock';
import HammerSprite from './HammerSprite';

// Renders sky area, nails on a light plank, a finger-following hammer + aim guide.
// props: nails, nailXs (px), hammerX (px), swinging, hitFx {index,type},
//        targetIndex, plankH, nailBaseBottom
export default function NailBoard({ nails, nailXs, hammerX, hammerY, swinging, hitFx, targetIndex, plankH = 90 }) {
  const maxExposed = 150;
  const nailBottom = plankH - 6;
  return (
    <>
      {/* aim guide line */}
      <div className="absolute pointer-events-none" style={{
        left: hammerX, bottom: nailBottom, top: 8, width: 2, transform: 'translateX(-1px)',
        background: 'repeating-linear-gradient(180deg, rgba(74,163,224,0.55) 0 6px, transparent 6px 13px)',
      }} />

      {/* nails */}
      {nails.map((nail, i) => {
        const progress = Math.min(nail.depth / MAX_DEPTH, 1);
        const exposed = Math.max(8, maxExposed * (1 - progress));
        const isTarget = i === targetIndex && !nail.done;
        const ring = hitFx && hitFx.index === i;
        return (
          <div key={nail.id} className="absolute flex flex-col items-center pointer-events-none"
               style={{ left: nailXs[i], bottom: nailBottom, transform: 'translateX(-50%)' }}>
            <div style={{ height: maxExposed, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {/* target highlight */}
              {isTarget && (
                <div className="target-pulse absolute rounded-full" style={{
                  left: '50%', top: 6, width: 30, height: 30,
                  border: '3px solid #4aa3e0',
                }} />
              )}
              <div style={{ transformOrigin: 'bottom center', transition: 'height 0.18s' }}
                   className="relative flex flex-col items-center">
                <div className="nail-head-s rounded-full" style={{ width: 16, height: 6, zIndex: 2 }} />
                <div className="nail-body-s" style={{ width: 6, height: exposed, marginTop: -2,
                                 clipPath: 'polygon(0 0,100% 0,58% 100%,42% 100%)' }} />
              </div>
              {ring && <Sparks key={hitFx.key} />}
            </div>
          </div>
        );
      })}

      {/* hammer follows finger (2D) — bigger & horizontal, head over the aim point */}
      <div className="absolute pointer-events-none" style={{
        left: hammerX, top: hammerY, transform: 'translate(-76%,-84%)',
      }}>
        <div className={swinging ? 'hammer-strike' : ''}
             style={{ transformOrigin: '80% 62%' }}>
          <HammerSprite size={128} />
        </div>
      </div>

      {/* light plank */}
      <div className="absolute left-0 right-0 bottom-0 plank-light" style={{ height: plankH }}>
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
      ty: Math.sin(a) * d - 6, // bias upward like a spark shower
      c: COLORS[i % COLORS.length],
      s: 3 + Math.random() * 3,
      delay: Math.random() * 0.04,
    };
  }), []);
  return (
    <div className="absolute" style={{ left: '50%', top: 6, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 5 }}>
      {/* bright flash */}
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
