// Lightweight Web Audio SFX engine (no external assets needed)
let ctx = null;
let muted = false;

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(v) { muted = v; }
export function isMuted() { return muted; }

function tone(freq, dur, type = 'sine', gain = 0.15, startAt = 0, slideTo = null) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

function noiseThock(gain = 0.25) {
  const c = ac();
  if (!c || muted) return;
  const len = Math.floor(c.sampleRate * 0.08);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09);
  const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 1400;
  src.connect(filt); filt.connect(g); g.connect(c.destination);
  src.start();
}

export const SFX = {
  hitPerfect() { noiseThock(0.3); tone(880, 0.12, 'square', 0.12); tone(1320, 0.14, 'sine', 0.1, 0.02); },
  hitGood() { noiseThock(0.28); tone(660, 0.1, 'triangle', 0.1); },
  hitOk() { noiseThock(0.22); tone(360, 0.09, 'sine', 0.08); },
  miss() { noiseThock(0.2); tone(200, 0.16, 'sawtooth', 0.09, 0, 90); },
  click() { tone(520, 0.06, 'square', 0.08); },
  clear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, i * 0.09));
  },
  fail() { tone(300, 0.25, 'sawtooth', 0.1, 0, 120); tone(220, 0.3, 'sawtooth', 0.08, 0.08, 90); },
};
