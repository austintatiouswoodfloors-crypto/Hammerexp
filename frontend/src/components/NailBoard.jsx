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
              {ring && (
                <div className="absolute" style={{ left: '50%', top: 8 }}>
                  <div className={`ring-burst rounded-full border-4 ${hitFx.type === 'miss' ? 'border-red-300' : 'border-sky-300'}`}
                       style={{ width: 26, height: 26 }} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* hammer follows finger (2D) */}
      <div className="absolute pointer-events-none" style={{
        left: hammerX, top: hammerY, transform: 'translate(-50%,-64%)',
      }}>
        <div className={swinging ? 'hammer-strike' : ''}
             style={{ transform: 'rotate(-28deg)', transformOrigin: '50% 92%' }}>
          <HammerSprite size={72} />
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
