import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Hammer } from 'lucide-react';

export default function HowToModal({ open, onClose, t }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl border-4 border-[#e0d0b0] bg-[#fdf8ef]">
        <DialogHeader>
          <DialogTitle className="font-display font-extrabold text-2xl text-[#5a3410] flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-[#c23b2c] flex items-center justify-center">
              <Hammer size={18} className="text-white" />
            </span>
            {t.howtoTitle}
          </DialogTitle>
        </DialogHeader>
        <ol className="space-y-3 mt-2">
          {t.howtoBody.map((line, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#e0632c] text-white font-bold text-sm flex items-center justify-center">{i + 1}</span>
              <span className="text-[#5a3410] font-medium text-sm leading-relaxed">{line}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose}
          className="mt-4 w-full h-12 rounded-2xl bg-[#e0632c] hover:bg-[#c9531f] text-white font-display font-extrabold text-lg active:scale-95 transition-transform">
          {t.close}
        </button>
      </DialogContent>
    </Dialog>
  );
}
