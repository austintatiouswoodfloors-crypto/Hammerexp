import React from 'react';

// Emoji-style claw hammer: tan wooden handle + silver claw head.
export default function HammerSprite({ size = 72 }) {
  const w = size, h = size * 1.12;
  return (
    <svg width={w} height={h} viewBox="0 0 72 80" style={{ filter: 'drop-shadow(0 4px 5px rgba(40,60,90,0.28))' }}>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9a15a" />
          <stop offset="0.45" stopColor="#f3c986" />
          <stop offset="0.55" stopColor="#eec079" />
          <stop offset="1" stopColor="#c98a41" />
        </linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f7fa" />
          <stop offset="0.4" stopColor="#cfd8e2" />
          <stop offset="0.65" stopColor="#aab7c6" />
          <stop offset="1" stopColor="#8493a4" />
        </linearGradient>
        <linearGradient id="steel2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6ecf3" />
          <stop offset="1" stopColor="#93a2b3" />
        </linearGradient>
      </defs>

      {/* handle */}
      <rect x="31" y="30" width="11" height="48" rx="5.5" fill="url(#wood)" />
      <rect x="34.5" y="31" width="2.5" height="46" rx="1.2" fill="#fff" opacity="0.35" />

      {/* claw (curving up-left) */}
      <path d="M26 22 C14 20 9 12 6 4 C13 8 19 10 24 12 C27 15 28 18 28 22 Z"
            fill="url(#steel2)" stroke="#7c8b9c" strokeWidth="0.6" />
      {/* head block */}
      <rect x="22" y="14" width="34" height="20" rx="6" fill="url(#steel)" stroke="#7c8b9c" strokeWidth="0.6" />
      {/* striking face (right, brighter) */}
      <rect x="48" y="12" width="11" height="24" rx="5" fill="url(#steel)" stroke="#7c8b9c" strokeWidth="0.6" />
      <rect x="51" y="15" width="4" height="18" rx="2" fill="#fff" opacity="0.45" />
      {/* neck */}
      <rect x="30" y="28" width="13" height="9" rx="3" fill="url(#steel)" />
    </svg>
  );
}
