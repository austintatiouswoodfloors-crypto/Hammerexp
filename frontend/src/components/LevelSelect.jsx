import React from 'react';
import { LEVELS, getHighScores } from '../mock';
import { Star, Lock, ArrowLeft } from 'lucide-react';

export default function LevelSelect({ t, unlocked, onSelect, onBack }) {
  const hs = getHighScores();
  return (
    <div className="h-full sky-bg px-6 py-7 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="h-11 w-11 rounded-full bg-white/85 shadow flex items-center justify-center text-[#4a7590] active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display font-extrabold text-2xl text-[#37546a]">{t.levelSelect}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {LEVELS.map((lv) => {
          const locked = lv.id > unlocked;
          const best = hs[lv.id];
          return (
            <button key={lv.id} disabled={locked} onClick={() => onSelect(lv)}
              className={`relative rounded-2xl p-4 text-left shadow-md border-[3px] transition-transform ${
                locked ? 'bg-[#e3edf4] border-[#d3e0ea] cursor-not-allowed'
                       : 'bg-white border-[#cfe8f8] hover:-translate-y-1 active:scale-95'}`}>
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-3xl text-[#4aa3e0]">{lv.id}</span>
                {locked && <Lock size={18} className="text-[#9fb6c6]" />}
              </div>
              <div className="font-bold text-[#37546a] mt-1">{lv.name}</div>
              <div className="text-xs text-[#7c9aad] font-medium">{t.nails}: {lv.nails}</div>
              {!locked && best != null && (
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-[#f0a92e]">
                  <Star size={13} className="fill-[#ffcf5e] text-[#f0a92e]" /> {best}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
