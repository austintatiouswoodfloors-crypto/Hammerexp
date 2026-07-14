import React from 'react';
import { Star, RotateCcw, Home, Trophy, Hammer } from 'lucide-react';

export default function ResultScreen({ t, taps, stars, best, isNewRecord, onRetry, onMenu }) {
  return (
    <div className="h-full sky-bg flex items-center justify-center px-6">
      <div className="w-full bg-white rounded-3xl shadow-2xl border-[3px] border-[#cfe8f8] p-7 text-center">
        <h2 className="font-display font-extrabold text-3xl mb-1 text-[#3fae6a]">{t.clear}</h2>

        <div className="flex justify-center gap-2 my-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="star-pop" style={{ animationDelay: `${i * 0.15}s` }}>
              <Star size={46}
                className={i < stars ? 'text-[#f0a92e] fill-[#ffcf5e]' : 'text-gray-300 fill-gray-100'} />
            </div>
          ))}
        </div>

        {isNewRecord && (
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-[#ffcf5e] text-[#8a5a12] font-extrabold text-sm animate-pulse">
            ★ {t.newRecord}
          </div>
        )}

        <div className="bg-[#eef7fd] rounded-2xl p-4 mb-5">
          <div className="text-[#5a86a3] font-bold text-sm flex items-center justify-center gap-1">
            <Hammer size={14} /> {t.taps}
          </div>
          <div className="font-display font-extrabold text-6xl text-[#37546a] leading-tight">{taps}</div>
          <div className="flex items-center justify-center gap-1 text-[#7c9aad] text-sm font-bold mt-1">
            <Trophy size={15} /> {t.best}: {best}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={onRetry}
            className="h-13 py-3 text-lg font-display font-extrabold rounded-2xl bg-[#4aa3e0] hover:bg-[#3690d0] text-white shadow active:scale-95 transition-transform flex items-center justify-center">
            <RotateCcw size={20} className="mr-1.5" /> {t.retry}
          </button>
          <button onClick={onMenu}
            className="h-11 text-base font-bold rounded-2xl text-[#5a86a3] hover:bg-[#eef7fd] active:scale-95 transition-transform flex items-center justify-center">
            <Home size={18} className="mr-1.5" /> {t.menu}
          </button>
        </div>
      </div>
    </div>
  );
}
