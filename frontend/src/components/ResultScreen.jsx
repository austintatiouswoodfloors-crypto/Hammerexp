import React from 'react';
import { Button } from './ui/button';
import { Star, RotateCcw, Home, ArrowRight, Trophy } from 'lucide-react';

export default function ResultScreen({ t, win, stars, score, best, isNewRecord, hasNext, onRetry, onNext, onMenu }) {
  return (
    <div className="min-h-screen wood-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-[#e0d0b0] p-7 text-center">
        <h2 className={`font-display font-extrabold text-3xl mb-1 ${win ? 'text-[#28a45a]' : 'text-[#c23b2c]'}`}>
          {win ? t.clear : t.timeup}
        </h2>

        {/* stars */}
        <div className="flex justify-center gap-2 my-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`star-pop`} style={{ animationDelay: `${i * 0.15}s` }}>
              <Star size={46}
                className={i < stars ? 'text-[#f2b21f] fill-[#ffd257]' : 'text-gray-300 fill-gray-100'} />
            </div>
          ))}
        </div>

        {isNewRecord && (
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-[#ffd257] text-[#7a4a1e] font-extrabold text-sm animate-pulse">
            ★ {t.newRecord}
          </div>
        )}

        <div className="bg-[#f6efe2] rounded-2xl p-4 mb-5">
          <div className="text-[#8f5a22] font-bold text-sm">{t.score}</div>
          <div className="font-display font-extrabold text-5xl text-[#5a3410] leading-tight">{score}</div>
          <div className="flex items-center justify-center gap-1 text-[#a9702f] text-sm font-bold mt-1">
            <Trophy size={15} /> {t.best}: {best}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {win && hasNext && (
            <Button onClick={onNext}
              className="h-13 py-3 text-lg font-display font-extrabold rounded-2xl bg-[#e0632c] hover:bg-[#c9531f] text-white shadow active:scale-95 transition-transform">
              {t.next} <ArrowRight size={20} className="ml-1" />
            </Button>
          )}
          <Button onClick={onRetry} variant="outline"
            className="h-12 text-base font-bold rounded-2xl bg-white border-2 border-[#c68a4e] text-[#7a4a1e] hover:bg-[#faf5ec] active:scale-95 transition-transform">
            <RotateCcw size={18} className="mr-1" /> {t.retry}
          </Button>
          <Button onClick={onMenu} variant="ghost"
            className="h-11 text-base font-bold rounded-2xl text-[#8f5a22] hover:bg-[#f6efe2] active:scale-95 transition-transform">
            <Home size={18} className="mr-1" /> {t.menu}
          </Button>
        </div>
      </div>
    </div>
  );
}
