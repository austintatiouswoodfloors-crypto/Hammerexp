import React from 'react';
import { X, ArrowDown } from 'lucide-react';
import HammerSprite from './HammerSprite';

export default function HowToModal({ open, onClose, t }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-black/30 backdrop-blur-sm"
         onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-[3px] border-[#bfe0f5] p-6 relative"
           onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#eef6fc] flex items-center justify-center text-[#5a7285]">
          <X size={18} />
        </button>
        <h2 className="font-display font-extrabold text-2xl text-[#3a5566] text-center mb-1">{t.howtoTitle}</h2>

        {/* mini illustration like reference cards */}
        <div className="relative h-28 my-3 rounded-2xl sky-bg overflow-hidden flex items-end justify-center">
          <div className="absolute right-6 top-4 text-[#8fb7d4] arrow-bounce"><ArrowDown size={40} strokeWidth={3} /></div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8" style={{ transform: 'translateX(-40px) rotate(-22deg)' }}>
            <HammerSprite size={58} />
          </div>
          <div className="flex gap-4 items-end mb-3">
            <div className="nail-body-s" style={{ width: 4, height: 46, borderRadius: 2 }} />
            <div className="nail-body-s" style={{ width: 4, height: 46, borderRadius: 2 }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 plank-light" />
        </div>

        <ol className="space-y-2.5 mt-2">
          {t.howtoBody.map((line, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#4aa3e0] text-white font-bold text-sm flex items-center justify-center">{i + 1}</span>
              <span className="text-[#40596b] font-medium text-sm leading-relaxed">{line}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose}
          className="mt-5 w-full h-12 rounded-2xl bg-[#4aa3e0] hover:bg-[#3690d0] text-white font-display font-extrabold text-lg active:scale-95 transition-transform">
          {t.close}
        </button>
      </div>
    </div>
  );
}
