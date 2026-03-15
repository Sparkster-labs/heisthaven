// Web Audio API — oscillator-based sound effects
// No external sound files needed

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
};

const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const SFX = {
  vaultSelect: () => {
    playTone(80, 0.6, 'sine', 0.2);
    setTimeout(() => playTone(60, 0.4, 'sine', 0.1), 100);
  },
  crewHire: () => {
    playTone(800, 0.08, 'square', 0.08);
    setTimeout(() => playTone(1200, 0.08, 'square', 0.06), 60);
  },
  chaosFlip: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(200 + Math.random() * 400, 0.04, 'sawtooth', 0.04), i * 30);
    }
  },
  miniGameSuccess: () => {
    playTone(523, 0.12, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 200);
  },
  miniGameFail: () => {
    playTone(400, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.12), 120);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.08), 240);
  },
  cashPayout: () => {
    playTone(1200, 0.06, 'square', 0.08);
    setTimeout(() => playTone(1600, 0.06, 'square', 0.06), 50);
    setTimeout(() => playTone(2000, 0.1, 'square', 0.04), 100);
  },
  jewelDrop: () => {
    playTone(2000, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(2500, 0.15, 'sine', 0.08), 100);
    setTimeout(() => playTone(3000, 0.2, 'sine', 0.06), 200);
  },
  buttonTap: () => {
    playTone(600, 0.04, 'square', 0.05);
  },
};

// Haptic feedback helpers
export const Haptics = {
  success: () => { try { navigator.vibrate?.(50); } catch {} },
  fail: () => { try { navigator.vibrate?.(200); } catch {} },
  jewelDrop: () => { try { navigator.vibrate?.([50, 50, 50]); } catch {} },
  busted: () => { try { navigator.vibrate?.([100, 50, 200]); } catch {} },
};
