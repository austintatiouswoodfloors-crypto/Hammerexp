import React from 'react';
import { Volume2, VolumeX, HelpCircle, Moon, Sun } from 'lucide-react';
import HammerSprite from './HammerSprite';
import NightSky from './NightSky';

export default function TitleScreen({ t, night, muted, onToggleMute, onToggleNight, onStart, onHowTo }) {
  const titleColor = night ? 'text-white' : 'text-[#37546a]';
  const subColor = night ? 'text-slate-300' : 'text-[#5a86a3]';
  return (
    <div className={`h-full ${night ? 'night-bg' : 'sky-bg'} flex flex-col items-center px-7 relative overflow-hidden`}>
      {night && <NightSky />}

      <div className="absolute top-5 right-5 flex gap-2 z-10">
        <button onClick={onToggleNight}
          className={`h-11 w-11 rounded-full shadow flex items-center justify-center active:scale-95 transition-transform ${night ? 'bg-white/15 text-yellow-200' : 'bg-white/80 text-[#4a7590]'}`}>
          {night ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={onToggleMute}
          className={`h-11 w-11 rounded-full shadow flex items-center justify-center active:scale-95 transition-transform ${night ? 'bg-white/15 text-white' : 'bg-white/80 text-[#4a7590]'}`}>
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* decorative nails (day only) */}
      {!night && (
        <div className="absolute inset-0 pointer-events-none opacity-25">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute nail-body-s" style={{
              width: 4, height: 30 + (i % 3) * 16, left: `${12 + i * 18}%`, top: `${12 + (i % 3) * 14}%`,
              transform: `rotate(${(i % 2 ? -1 : 1) * 18}deg)`, borderRadius: 2,
            }} />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center z-[1]">
        <div className="bob mb-3" style={{ transform: 'rotate(-10deg)' }}>
          <HammerSprite size={150} />
        </div>
        <h1 className={`font-display font-extrabold text-[44px] leading-tight tracking-tight text-center ${titleColor}`}>
          {t.title}
        </h1>
        <p className={`font-semibold text-base mt-1 ${subColor}`}>{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 w-full pb-14 z-[1]">
        <button onClick={onStart}
          className="h-15 py-4 text-xl font-display font-extrabold rounded-2xl bg-[#4aa3e0] hover:bg-[#3690d0] text-white shadow-lg active:scale-95 transition-transform">
          {t.start}
        </button>
        <button onClick={onHowTo}
          className={`h-12 text-base font-bold rounded-2xl border-2 active:scale-95 transition-transform flex items-center justify-center ${night ? 'bg-white/10 border-white/25 text-white' : 'bg-white/80 border-[#bfe0f5] text-[#4a7590]'}`}>
          <HelpCircle size={18} className="mr-1.5" /> {t.howto}
        </button>
      </div>

      <div className={`absolute bottom-4 text-xs font-medium z-[1] ${night ? 'text-slate-400' : 'text-[#7ea3bd]'}`}>CLOBAGAMES · Nailing Master</div>
    </div>
  );
}
