import React from 'react';

// Emoji-style claw hammer, HORIZONTAL: warm tan wooden handle on the left,
// shiny silver claw head on the right. `size` = width in px.
export default function HammerSprite({ size = 130 }) {
  const w = size, h = size * (100 / 160);
  return (
    <svg width={w} height={h} viewBox="0 0 160 100" style={{ filter: 'drop-shadow(0 4px 5px rgba(40,60,90,0.28))' }}>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2cf8e" />
          <stop offset="0.5" stopColor="#e3b264" />
          <stop offset="1" stopColor="#c68f3f" />
        </linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfdff" />
          <stop offset="0.4" stopColor="#d3dbe4" />
          <stop offset="0.7" stopColor="#aab7c6" />
          <stop offset="1" stopColor="#8493a4" />
        </linearGradient>
        <linearGradient id="steelDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2e8ef" />
          <stop offset="1" stopColor="#8b98a8" />
        </linearGradient>
      </defs>

      {/* handle (horizontal, slight taper toward head) */}
      <path d="M8 42 Q5 50 8 58 L100 60 Q104 50 100 40 Z" fill="url(#wood)" stroke="#c79a52" strokeWidth="0.6" />
      <rect x="12" y="44" width="76" height="3.5" rx="1.75" fill="#fff" opacity="0.45" />

      {/* silver ferrule / collar */}
      <rect x="97" y="37" width="12" height="26" rx="4" fill="url(#steel)" stroke="#8b98a8" strokeWidth="0.5" />

      {/* neck (eye) */}
      <rect x="107" y="34" width="20" height="32" rx="9" fill="url(#steel)" stroke="#8b98a8" strokeWidth="0.6" />

      {/* head block */}
      <rect x="120" y="16" width="30" height="70" rx="14" fill="url(#steel)" stroke="#8b98a8" strokeWidth="0.8" />
      {/* rounded striking face (poll) at bottom */}
      <rect x="122" y="58" width="26" height="28" rx="13" fill="url(#steel)" stroke="#8b98a8" strokeWidth="0.6" />
      <ellipse cx="135" cy="79" rx="9" ry="5" fill="#fff" opacity="0.3" />
      {/* head highlight */}
      <rect x="125" y="22" width="7" height="34" rx="3.5" fill="#fff" opacity="0.42" />

      {/* claw curving up and to the right */}
      <path d="M138 18 C 149 1, 168 -1, 173 12 C 165 7, 157 9, 152 16 C 148 12, 143 12, 138 18 Z"
            fill="url(#steelDark)" stroke="#8b98a8" strokeWidth="0.6" />
    </svg>
  );
}
