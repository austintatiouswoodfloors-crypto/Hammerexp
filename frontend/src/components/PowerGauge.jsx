import React from 'react';

// Horizontal power/timing gauge with colored zones and a moving marker.
// props: pos (0-100), perfect (zone width), good (zone width), flashClass
export default function PowerGauge({ pos, perfect, good }) {
  // Convert widths (centered on 50) to % boundaries
  const perfectL = 50 - perfect / 2;
  const goodL = 50 - good / 2;
  const goodW = good;
  const perfectW = perfect;

  return (
    <div className="w-full max-w-md mx-auto select-none">
      <div className="relative h-11 rounded-full overflow-hidden shadow-inner border-2 border-[#7a4a1e]"
           style={{ background: 'linear-gradient(180deg,#e05a4a,#c23b2c)' }}>
        {/* good zone */}
        <div className="absolute top-0 bottom-0"
             style={{ left: `${goodL}%`, width: `${goodW}%`,
                      background: 'linear-gradient(180deg,#ffd257,#f2b21f)' }} />
        {/* perfect zone */}
        <div className="absolute top-0 bottom-0"
             style={{ left: `${perfectL}%`, width: `${perfectW}%`,
                      background: 'linear-gradient(180deg,#5ad17f,#28a45a)' }} />
        {/* center line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/60" style={{ left: '50%' }} />
        {/* zone tick labels */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display font-extrabold text-white/90 text-sm tracking-wider drop-shadow">PERFECT</span>
        </div>
        {/* marker */}
        <div className="absolute -top-1 -bottom-1 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-none"
             style={{ left: `calc(${pos}% - 3px)` }} />
      </div>
    </div>
  );
}
