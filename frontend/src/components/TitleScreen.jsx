import React from 'react';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';
import HammerSprite from './HammerSprite';

export default function TitleScreen({ t, muted, onToggleMute, onStart, onHowTo }) {
  return (
    <div className="h-full sky-bg flex flex-col items-center px-7 relative overflow-hidden">
      <button onClick={onToggleMute}
        className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/80 shadow flex items-center justify-center text-[#4a7590] active:scale-95 transition-transform z-10">
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* decorative nails */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute nail-body-s" style={{
            width: 4, height: 30 + (i % 3) * 16, left: `${12 + i * 18}%`, top: `${12 + (i % 3) * 14}%`,
            transform: `rotate(${(i % 2 ? -1 : 1) * 18}deg)`, borderRadius: 2,
          }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bob mb-3" style={{ transform: 'rotate(-16deg)' }}>
          <HammerSprite size={120} />
        </div>
        <h1 className="font-display font-extrabold text-[44px] leading-tight text-[#37546a] tracking-tight text-center">
          {t.title}
        </h1>
        <p className="text-[#5a86a3] font-semibold text-base mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 w-full pb-14">
        <button onClick={onStart}
          className="h-15 py-4 text-xl font-display font-extrabold rounded-2xl bg-[#4aa3e0] hover:bg-[#3690d0] text-white shadow-lg active:scale-95 transition-transform">
          {t.start}
        </button>
        <button onClick={onHowTo}
          className="h-12 text-base font-bold rounded-2xl bg-white/80 border-2 border-[#bfe0f5] text-[#4a7590] hover:bg-white active:scale-95 transition-transform flex items-center justify-center">
          <HelpCircle size={18} className="mr-1.5" /> {t.howto}
        </button>
      </div>

      <div className="absolute bottom-4 text-[#7ea3bd] text-xs font-medium">CLOBAGAMES · Nailing Master</div>
    </div>
  );
}
