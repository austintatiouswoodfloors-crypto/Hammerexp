import React from 'react';

// Emoji-style claw hammer, HORIZONTAL: tan wooden handle on the left,
// silver claw head on the right. `size` = width in px.
export default function HammerSprite({ size = 130 }) {
  const w = size, h = size * (80 / 140);
  return (
    <svg width={w} height={h} viewBox="0 0 140 80" style={{ filter: 'drop-shadow(0 4px 5px rgba(40,60,90,0.28))' }}>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3c986" />
          <stop offset="0.5" stopColor="#e6b46a" />
          <stop offset="1" stopColor="#c98a41" />
        </linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f7fa" />
          <stop offset="0.45" stopColor="#cfd8e2" />
          <stop offset="0.7" stopColor="#aab7c6" />
          <stop offset="1" stopColor="#8493a4" />
        </linearGradient>
        <linearGradient id="steel2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6ecf3" />
          <stop offset="1" stopColor="#93a2b3" />
        </linearGradient>
      </defs>

      {/* handle (horizontal) */}
      <rect x="6" y="33" width="86" height="16" rx="8" fill="url(#wood)" stroke="#b07f3c" strokeWidth="0.6" />
      <rect x="9" y="35" width="80" height="3.5" rx="1.75" fill="#fff" opacity="0.4" />

      {/* neck */}
      <rect x="84" y="29" width="16" height="24" rx="5" fill="url(#steel)" />

      {/* head block (right) */}
      <rect x="90" y="11" width="32" height="61" rx="13" fill="url(#steel)" stroke="#7c8b9c" strokeWidth="0.8" />
      {/* rounded striking face (bottom) */}
      <rect x="92" y="50" width="28" height="22" rx="11" fill="url(#steel)" stroke="#7c8b9c" strokeWidth="0.6" />
      <rect x="97" y="55" width="17" height="4" rx="2" fill="#fff" opacity="0.45" />
      {/* head highlight */}
      <rect x="95" y="16" width="7" height="30" rx="3.5" fill="#fff" opacity="0.4" />

      {/* claw curving up-right from the top of the head */}
      <path d="M112 13 C 120 1, 135 1, 139 12 C 133 9, 127 11, 123 16 C 119 13, 116 12, 112 13 Z"
            fill="url(#steel2)" stroke="#7c8b9c" strokeWidth="0.6" />
    </svg>
  );
}
