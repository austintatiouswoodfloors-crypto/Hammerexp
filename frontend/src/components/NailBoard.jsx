import React from 'react';
import { MAX_DEPTH, MAX_BEND } from '../mock';

// Renders the wooden plank with nails and the swinging hammer above the active nail.
// props: nails [{depth,bent,done,ruined}], activeIndex, swinging, hitFx
export default function NailBoard({ nails, activeIndex, swinging, hitFx }) {
  const n = nails.length;
  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ height: 320 }}>
      {/* Nails row (above plank) */}
      <div className="absolute left-0 right-0" style={{ bottom: 96 }}>
        <div className="flex items-end justify-center gap-3 sm:gap-6 px-4">
          {nails.map((nail, i) => {
            const progress = Math.min(nail.depth / MAX_DEPTH, 1);
            const maxExposed = 150;
            const exposed = Math.max(10, maxExposed * (1 - progress));
            const isActive = i === activeIndex && !nail.done;
            const tilt = nail.ruined ? 26 : nail.bent * 7;
            return (
              <div key={nail.id} className="relative flex flex-col items-center"
                   style={{ width: 30 }}>
                {/* active indicator */}
                {isActive && (
                  <div className="absolute -top-9 pulse-arrow text-[#c23b2c]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21l-8-9h5V3h6v9h5z" />
                    </svg>
                  </div>
                )}
                {/* nail */}
                <div className="relative" style={{ height: maxExposed, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ transform: `rotate(${tilt}deg)`, transformOrigin: 'bottom center', transition: 'transform 0.25s, height 0.18s' }}
                       className="relative flex flex-col items-center">
                    {/* head */}
                    <div className="nail-head rounded-full" style={{ width: 20, height: 8, zIndex: 2 }} />
                    {/* body */}
                    <div className="nail-body" style={{ width: 8, height: exposed, marginTop: -2,
                                     clipPath: 'polygon(0 0,100% 0,60% 100%,40% 100%)' }} />
                  </div>
                  {/* hit ring fx */}
                  {isActive && hitFx && (
                    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -6 }}>
                      <div className={`ring-burst rounded-full border-4 ${hitFx === 'miss' ? 'border-red-400' : 'border-yellow-200'}`}
                           style={{ width: 30, height: 30 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hammer above active nail */}
      {activeIndex >= 0 && nails[activeIndex] && !nails[activeIndex].done && (
        <div className="absolute" style={{
          bottom: 200,
          left: `calc(50% + ${(activeIndex - (n - 1) / 2) * (n > 6 ? 44 : 54)}px)`,
          transform: 'translateX(-50%)',
        }}>
          <div className={swinging ? 'hammer-swing' : ''} style={{ transform: 'rotate(-42deg)', transformOrigin: '80% 90%' }}>
            <Hammer />
          </div>
        </div>
      )}

      {/* Wooden plank */}
      <div className="absolute left-0 right-0 bottom-0 mx-auto plank rounded-xl"
           style={{ height: 96, maxWidth: 620 }}>
        <div className="w-full h-full rounded-xl opacity-40"
             style={{ background: 'repeating-linear-gradient(90deg, rgba(60,32,10,0.25) 0 1px, transparent 1px 60px)' }} />
      </div>
    </div>
  );
}

function Hammer() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))' }}>
      {/* handle */}
      <rect x="30" y="24" width="7" height="36" rx="3.5" fill="#b5762f" />
      <rect x="31.5" y="24" width="2" height="36" fill="#d69648" />
      {/* head */}
      <rect x="12" y="12" width="40" height="18" rx="4" fill="#5b6169" />
      <rect x="12" y="12" width="40" height="6" rx="3" fill="#7d848d" />
      <rect x="44" y="10" width="12" height="22" rx="4" fill="#464b52" />
    </svg>
  );
}
