import React from 'react';
import { LEVELS, getHighScores } from '../mock';
import { Star, Lock, ArrowLeft } from 'lucide-react';

export default function LevelSelect({ t, lang, unlocked, onSelect, onBack }) {
  const hs = getHighScores();
  return (
    <div className="min-h-screen wood-bg px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="h-11 w-11 rounded-full bg-white/80 shadow flex items-center justify-center text-[#7a4a1e]">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-display font-extrabold text-3xl text-[#5a3410]">{t.levelSelect}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LEVELS.map((lv) => {
            const locked = lv.id > unlocked;
            const best = hs[lv.id];
            return (
              <button key={lv.id} disabled={locked} onClick={() => onSelect(lv)}
                className={`relative rounded-2xl p-4 text-left shadow-lg border-4 transition-transform ${
                  locked ? 'bg-[#e6dcc8] border-[#d8cbb0] cursor-not-allowed'
                         : 'bg-white border-[#e0d0b0] hover:-translate-y-1 active:scale-95'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-3xl text-[#e0632c]">{lv.id}</span>
                  {locked && <Lock size={18} className="text-[#a9702f]" />}
                </div>
                <div className="font-bold text-[#5a3410] mt-1">{lang === 'ja' ? lv.name : lv.nameEn}</div>
                <div className="text-xs text-[#a9702f] font-medium">{t.nails}: {lv.nails}</div>
                {!locked && best != null && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold text-[#f2b21f]">
                    <Star size={13} className="fill-[#ffd257] text-[#f2b21f]" /> {best}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
