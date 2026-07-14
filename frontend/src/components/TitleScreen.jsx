import React from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX, Globe, Hammer, HelpCircle } from 'lucide-react';

export default function TitleScreen({ t, lang, onToggleLang, muted, onToggleMute, onStart, onHowTo }) {
  return (
    <div className="min-h-screen wood-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* top-right controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onToggleMute}
          className="h-11 w-11 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-[#7a4a1e] transition-colors">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button onClick={onToggleLang}
          className="h-11 px-3 rounded-full bg-white/80 hover:bg-white shadow flex items-center gap-1 text-[#7a4a1e] font-bold transition-colors">
          <Globe size={18} /> {lang === 'ja' ? 'EN' : 'JA'}
        </button>
      </div>

      {/* decorative floating nails */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute nail-body" style={{
            width: 6, height: 40 + (i % 3) * 20, left: `${8 + i * 15}%`, top: `${10 + (i % 4) * 18}%`,
            transform: `rotate(${(i % 2 ? -1 : 1) * 20}deg)`,
          }} />
        ))}
      </div>

      {/* Logo */}
      <div className="bob mb-2">
        <div className="h-24 w-24 rounded-3xl bg-[#c23b2c] shadow-xl flex items-center justify-center rotate-[-8deg] border-4 border-white">
          <Hammer size={54} className="text-white" strokeWidth={2.4} />
        </div>
      </div>

      <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-[#5a3410] tracking-tight drop-shadow-sm mt-4">
        {t.title}
      </h1>
      <p className="text-[#8f5a22] font-bold text-lg mt-2 mb-10">{t.subtitle}</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={onStart}
          className="h-14 text-xl font-display font-extrabold rounded-2xl bg-[#e0632c] hover:bg-[#c9531f] text-white shadow-lg active:scale-95 transition-transform">
          {t.start}
        </Button>
        <Button onClick={onHowTo} variant="outline"
          className="h-12 text-base font-bold rounded-2xl bg-white/70 border-2 border-[#c68a4e] text-[#7a4a1e] hover:bg-white active:scale-95 transition-transform">
          <HelpCircle size={18} className="mr-1" /> {t.howto}
        </Button>
      </div>

      <div className="absolute bottom-4 text-[#a9702f] text-xs font-medium">CLOBAGAMES · Nailing Master</div>
    </div>
  );
}
