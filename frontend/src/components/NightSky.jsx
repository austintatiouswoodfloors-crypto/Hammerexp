import React from 'react';

// Decorative starfield + moon for night mode.
export default function NightSky() {
  const stars = React.useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 62,
    size: 1 + Math.random() * 2.4,
    delay: Math.random() * 2.4,
    twinkle: Math.random() > 0.4,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* moon */}
      <div className="absolute rounded-full" style={{
        right: 30, top: 40, width: 58, height: 58,
        background: 'radial-gradient(circle at 35% 32%, #fefae6 0%, #f3ecc6 55%, #e2d79c 100%)',
        boxShadow: '0 0 26px rgba(245,236,190,0.6)',
      }}>
        <div className="absolute rounded-full" style={{ left: 30, top: 12, width: 12, height: 12, background: 'rgba(210,198,150,0.5)' }} />
        <div className="absolute rounded-full" style={{ left: 16, top: 32, width: 8, height: 8, background: 'rgba(210,198,150,0.45)' }} />
      </div>
      {/* stars */}
      {stars.map((s, i) => (
        <span key={i} className={`absolute rounded-full bg-white ${s.twinkle ? 'star-twinkle' : ''}`}
          style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
            opacity: 0.8, boxShadow: '0 0 4px rgba(255,255,255,0.7)', animationDelay: `${s.delay}s`,
          }} />
      ))}
    </div>
  );
}
