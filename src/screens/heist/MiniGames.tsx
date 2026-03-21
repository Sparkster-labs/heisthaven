import { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, S } from '@/styles/theme';
import { SFX } from '@/lib/sounds';

// ═══════════════════════════════════════════════════════════════
// MINI-GAME 1: LOCKPICK — Timing-based sweet spot
// ═══════════════════════════════════════════════════════════════
interface LockPickProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

export const LockPickGame = ({ difficulty, onResult }: LockPickProps) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const sweetSpotWidth = Math.max(12, 35 - difficulty * 5);
  const sweetSpotStart = 50 - sweetSpotWidth / 2;
  const speed = 0.8 + difficulty * 0.4;

  useEffect(() => {
    if (locked) return;
    const interval = setInterval(() => {
      setPosition(prev => {
        let next = prev + direction * speed;
        if (next >= 100) { next = 100; setDirection(-1); }
        if (next <= 0) { next = 0; setDirection(1); }
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [locked, direction, speed]);

  const handleTap = useCallback(() => {
    if (locked) return;
    setLocked(true);
    const hit = position >= sweetSpotStart && position <= sweetSpotStart + sweetSpotWidth;
    setResult(hit);
    if (hit) SFX.tick(); else SFX.fail();
    if (navigator.vibrate) navigator.vibrate(hit ? 50 : 200);
    setTimeout(() => onResult(hit), 1200);
  }, [locked, position, sweetSpotStart, sweetSpotWidth, onResult]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>🔑 PICK THE LOCK</div>
      <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.xl }}>
        Tap when the needle hits the gold zone
      </div>
      <div style={{ position: 'relative', height: 32, background: THEME.colors.dusk, borderRadius: THEME.radius.md, overflow: 'hidden', border: `1px solid ${THEME.colors.borderFaint}`, marginBottom: THEME.space.xl }}>
        <div style={{ position: 'absolute', left: `${sweetSpotStart}%`, width: `${sweetSpotWidth}%`, top: 0, bottom: 0, background: `${THEME.colors.gold}25`, borderLeft: `2px solid ${THEME.colors.gold}60`, borderRight: `2px solid ${THEME.colors.gold}60` }} />
        <div style={{ position: 'absolute', left: `${position}%`, top: -4, bottom: -4, width: 3, marginLeft: -1.5, background: result === null ? THEME.colors.pearl : result ? THEME.colors.emerald : THEME.colors.ruby, boxShadow: `0 0 8px ${result === null ? THEME.colors.pearl : result ? THEME.colors.emerald : THEME.colors.ruby}60`, borderRadius: 2 }} />
      </div>
      {result !== null ? (
        <div style={{ fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, color: result ? THEME.colors.emerald : THEME.colors.ruby, textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40` }}>
          {result ? '✓ CRACKED' : '✗ JAMMED'}
        </div>
      ) : (
        <button onClick={handleTap} style={{ ...S.btnPrimary, maxWidth: 200, margin: '0 auto' }}>PICK NOW</button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME 2: SAFE COMBO — Memorize L/R dial sequence
// ═══════════════════════════════════════════════════════════════
interface SafeComboProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

export const SafeComboGame = ({ difficulty, onResult }: SafeComboProps) => {
  const seqLength = difficulty <= 3 ? 4 : difficulty <= 4 ? 5 : 6;
  const [sequence] = useState(() =>
    Array.from({ length: seqLength }, () => (Math.random() < 0.5 ? 'L' : 'R') as 'L' | 'R')
  );
  const [phase, setPhase] = useState<'showing' | 'input' | 'done'>('showing');
  const [showIdx, setShowIdx] = useState(-1);
  const [inputIdx, setInputIdx] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [dialRotation, setDialRotation] = useState(0);

  // Show sequence one step at a time
  useEffect(() => {
    if (phase !== 'showing') return;
    if (showIdx >= seqLength - 1) {
      const t = setTimeout(() => { setShowIdx(-1); setPhase('input'); }, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowIdx(prev => prev + 1), 700);
    return () => clearTimeout(t);
  }, [phase, showIdx, seqLength]);

  // Rotate dial during show
  useEffect(() => {
    if (phase === 'showing' && showIdx >= 0) {
      const dir = sequence[showIdx] === 'L' ? -30 : 30;
      setDialRotation(prev => prev + dir);
    }
  }, [showIdx, phase]);

  const handleInput = (dir: 'L' | 'R') => {
    if (phase !== 'input' || result !== null) return;
    const rotation = dir === 'L' ? -30 : 30;
    setDialRotation(prev => prev + rotation);

    if (dir === sequence[inputIdx]) {
      SFX.tick();
      const nextIdx = inputIdx + 1;
      setInputIdx(nextIdx);
      if (nextIdx >= seqLength) {
        setResult(true);
        setPhase('done');
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => onResult(true), 1200);
      }
    } else {
      SFX.fail();
      setResult(false);
      setPhase('done');
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => onResult(false), 1200);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>🔐 SAFE COMBO</div>
      <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.lg }}>
        {phase === 'showing' ? 'Memorize the sequence...' : phase === 'input' ? 'Repeat the sequence!' : ''}
      </div>

      {/* Dial visual */}
      <div style={{
        width: 120, height: 120, borderRadius: '50%', margin: '0 auto',
        border: `3px solid ${THEME.colors.borderMid}`,
        background: `radial-gradient(circle, ${THEME.colors.shadow} 0%, ${THEME.colors.ink} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: THEME.space.lg, position: 'relative',
        transition: 'transform 0.3s ease-out',
        transform: `rotate(${dialRotation}deg)`,
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
          width: 4, height: 16, borderRadius: 2,
          background: THEME.colors.gold,
          boxShadow: `0 0 8px ${THEME.colors.gold}60`,
        }} />
        {/* Center dot */}
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.colors.borderBright }} />
      </div>

      {/* Sequence display during showing */}
      {phase === 'showing' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: THEME.space.lg, minHeight: 36 }}>
          {sequence.map((dir, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: THEME.radius.sm,
              background: i <= showIdx
                ? (dir === 'L' ? `${THEME.colors.sapphire}30` : `${THEME.colors.gold}30`)
                : THEME.colors.dusk,
              border: `1px solid ${i <= showIdx ? (dir === 'L' ? THEME.colors.sapphire : THEME.colors.gold) : THEME.colors.borderFaint}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontFamily: THEME.fonts.mono, fontWeight: 700,
              color: i <= showIdx ? (dir === 'L' ? THEME.colors.sapphire : THEME.colors.gold) : THEME.colors.borderFaint,
              transition: 'all 0.3s',
            }}>
              {i <= showIdx ? (dir === 'L' ? '←' : '→') : '?'}
            </div>
          ))}
        </div>
      )}

      {/* Progress dots during input */}
      {phase === 'input' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: THEME.space.lg }}>
          {sequence.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < inputIdx ? THEME.colors.emerald : THEME.colors.borderFaint,
              transition: 'background 0.2s',
              boxShadow: i < inputIdx ? `0 0 6px ${THEME.colors.emerald}40` : 'none',
            }} />
          ))}
        </div>
      )}

      {/* Input buttons */}
      {phase === 'input' && result === null && (
        <div style={{ display: 'flex', gap: THEME.space.md, justifyContent: 'center' }}>
          <button onClick={() => handleInput('L')} style={{
            ...S.btnPrimary, maxWidth: 120, background: THEME.colors.sapphire,
            fontSize: 16, padding: '16px 24px',
          }}>
            ← LEFT
          </button>
          <button onClick={() => handleInput('R')} style={{
            ...S.btnPrimary, maxWidth: 120, background: THEME.colors.gold,
            fontSize: 16, padding: '16px 24px',
          }}>
            RIGHT →
          </button>
        </div>
      )}

      {result !== null && (
        <div style={{ fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, color: result ? THEME.colors.emerald : THEME.colors.ruby, textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40` }}>
          {result ? '✓ COMBINATION SET' : '✗ WRONG COMBO'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME 3: ALARM CUT (Wire Cut) — Cut 4 wires in order
// ═══════════════════════════════════════════════════════════════
interface WireCutProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

const WIRE_COLORS = [
  { name: 'RED', color: THEME.colors.ruby },
  { name: 'BLUE', color: THEME.colors.sapphire },
  { name: 'GREEN', color: THEME.colors.emerald },
  { name: 'GOLD', color: THEME.colors.gold },
];

export const WireCutGame = ({ difficulty, onResult }: WireCutProps) => {
  const wireCount = 4;
  const timerMax = difficulty >= 4 ? 6 : 8;
  const [sequence] = useState(() => [...WIRE_COLORS].sort(() => Math.random() - 0.5));
  const [phase, setPhase] = useState<'showing' | 'cutting' | 'done'>('showing');
  const [cutIndex, setCutIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [showIdx, setShowIdx] = useState(0);
  const [timer, setTimer] = useState(timerMax);
  const [cutWires, setCutWires] = useState<string[]>([]);

  // Show sequence
  useEffect(() => {
    if (phase !== 'showing') return;
    if (showIdx >= wireCount) {
      setTimeout(() => setPhase('cutting'), 600);
      return;
    }
    const t = setTimeout(() => setShowIdx(prev => prev + 1), 800);
    return () => clearTimeout(t);
  }, [phase, showIdx]);

  // Timer during cutting
  useEffect(() => {
    if (phase !== 'cutting') return;
    const interval = setInterval(() => {
      setTimer(prev => {
        const next = prev - 0.05;
        if (next <= 0) {
          setResult(false);
          setPhase('done');
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => onResult(false), 1200);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase, onResult]);

  const handleCut = (wire: typeof WIRE_COLORS[number]) => {
    if (phase !== 'cutting' || result !== null) return;
    if (wire.name === sequence[cutIndex].name) {
      SFX.tick();
      setCutWires(prev => [...prev, wire.name]);
      const nextIdx = cutIndex + 1;
      setCutIndex(nextIdx);
      if (nextIdx >= wireCount) {
        setResult(true);
        setPhase('done');
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => onResult(true), 1200);
      }
    } else {
      SFX.fail();
      setResult(false);
      setPhase('done');
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => onResult(false), 1200);
    }
  };

  const timerPct = (timer / timerMax) * 100;
  const timerColor = timerPct > 50 ? THEME.colors.emerald : timerPct > 25 ? THEME.colors.gold : THEME.colors.ruby;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💻 CUT THE ALARM</div>
      <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.lg }}>
        {phase === 'showing' ? 'Memorize the cut order...' : phase === 'cutting' ? 'Cut in the correct order!' : ''}
      </div>

      {/* Sequence preview */}
      {phase === 'showing' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: THEME.space.xl, minHeight: 48 }}>
          {sequence.slice(0, showIdx).map((wire, i) => (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: THEME.radius.md,
              background: wire.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.void, fontWeight: 700,
              boxShadow: `0 0 12px ${wire.color}40`,
            }}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Timer bar */}
      {phase === 'cutting' && (
        <div style={{ height: 6, background: THEME.colors.dusk, borderRadius: 3, marginBottom: THEME.space.lg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: 'width 0.05s linear, background 0.3s' }} />
        </div>
      )}

      {/* Wire buttons */}
      {(phase === 'cutting' || phase === 'done') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, maxWidth: 280, margin: '0 auto', marginBottom: THEME.space.lg }}>
          {WIRE_COLORS.map(wire => {
            const isCut = cutWires.includes(wire.name);
            return (
              <button key={wire.name} onClick={() => handleCut(wire)} disabled={phase === 'done' || isCut}
                style={{
                  height: 18, borderRadius: 9, background: isCut ? THEME.colors.borderFaint : wire.color,
                  border: 'none', cursor: phase === 'done' || isCut ? 'default' : 'pointer',
                  opacity: isCut ? 0.15 : 1, transition: 'all 0.2s',
                  boxShadow: isCut ? 'none' : `0 0 8px ${wire.color}30`,
                  position: 'relative',
                }}>
                {!isCut && <span style={{ position: 'absolute', right: 8, top: 0, fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.void, fontWeight: 700 }}>{wire.name}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress dots */}
      {phase === 'cutting' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: THEME.space.md }}>
          {sequence.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < cutIndex ? THEME.colors.emerald : THEME.colors.borderFaint, transition: 'background 0.2s' }} />
          ))}
        </div>
      )}

      {result !== null && (
        <div style={{ fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, color: result ? THEME.colors.emerald : THEME.colors.ruby, textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40` }}>
          {result ? '✓ BYPASSED' : timer <= 0 ? '✗ TIME\'S UP' : '✗ SHORT CIRCUIT'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME 4: THE TAIL — Dodge police roadblocks
// ═══════════════════════════════════════════════════════════════
interface TailProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

export const TailGame = ({ difficulty, onResult }: TailProps) => {
  const LANES = 3;
  const GAME_DURATION = 10000; // 10 seconds
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const obstacleIdRef = useRef(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Game loop
  useEffect(() => {
    if (result !== null) return;
    lastTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();

    const spawnInterval = Math.max(600, 1200 - difficulty * 100);

    const loop = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setElapsed(prev => {
        const next = prev + dt;
        if (next >= GAME_DURATION) {
          setResult(true);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => onResult(true), 1200);
          return GAME_DURATION;
        }
        return next;
      });

      // Spawn obstacles
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const lane = Math.floor(Math.random() * LANES);
        obstacleIdRef.current++;
        setObstacles(prev => [...prev, { id: obstacleIdRef.current, lane, y: -10 }]);
      }

      // Move obstacles
      const speed = 0.15 + difficulty * 0.03;
      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, y: o.y + dt * speed })).filter(o => o.y < 110);
        return moved;
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [result, difficulty, onResult]);

  // Collision detection
  useEffect(() => {
    if (result !== null) return;
    for (const obs of obstacles) {
      if (obs.lane === playerLane && obs.y >= 75 && obs.y <= 95) {
        setResult(false);
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => onResult(false), 1200);
        break;
      }
    }
  }, [obstacles, playerLane, result, onResult]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (result !== null) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relX = (clientX - rect.left) / rect.width;
    if (relX < 0.33) setPlayerLane(0);
    else if (relX > 0.66) setPlayerLane(2);
    else setPlayerLane(1);
  };

  const timeLeft = Math.max(0, Math.ceil((GAME_DURATION - elapsed) / 1000));
  const progress = (elapsed / GAME_DURATION) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.sm, letterSpacing: 6 }}>🚗 THE TAIL</div>
      <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.md }}>
        Tap left/center/right to dodge. Survive {Math.ceil(GAME_DURATION / 1000)}s.
      </div>

      {/* Timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: THEME.space.sm }}>
        <div style={{ fontSize: 14, fontFamily: THEME.fonts.mono, color: timeLeft <= 3 ? THEME.colors.ruby : THEME.colors.gold }}>{timeLeft}s</div>
        <div style={{ flex: 1, maxWidth: 150, height: 4, background: THEME.colors.dusk, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: THEME.colors.gold, borderRadius: 2, transition: 'width 0.1s linear' }} />
        </div>
      </div>

      {/* Road */}
      <div
        onClick={handleTap}
        onTouchStart={handleTap}
        style={{
          position: 'relative', width: '100%', maxWidth: 240, height: 340,
          margin: '0 auto', background: THEME.colors.dusk,
          borderRadius: THEME.radius.md, overflow: 'hidden',
          border: `1px solid ${THEME.colors.borderFaint}`,
          cursor: 'pointer', touchAction: 'none',
        }}
      >
        {/* Lane dividers */}
        {[1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', left: `${(i / LANES) * 100}%`, top: 0, bottom: 0,
            width: 2, background: `${THEME.colors.gold}15`,
          }} />
        ))}

        {/* Scrolling lane markings */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', width: 3, height: '200%',
          transform: 'translateX(-50%)',
          backgroundImage: `repeating-linear-gradient(180deg, ${THEME.colors.gold}30 0px, ${THEME.colors.gold}30 20px, transparent 20px, transparent 50px)`,
          animation: 'roadScroll 0.8s linear infinite',
        }} />

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div key={obs.id} style={{
            position: 'absolute',
            left: `${(obs.lane / LANES) * 100 + 100 / LANES / 2 - 12}%`,
            top: `${obs.y}%`,
            fontSize: 24,
            transition: 'none',
          }}>
            🚔
          </div>
        ))}

        {/* Player car */}
        <div style={{
          position: 'absolute',
          left: `${(playerLane / LANES) * 100 + 100 / LANES / 2 - 12}%`,
          bottom: '8%',
          fontSize: 28,
          transition: 'left 0.15s ease-out',
          filter: result === false ? 'brightness(2) hue-rotate(0deg)' : 'none',
        }}>
          🚗
        </div>
      </div>

      {result !== null && (
        <div style={{ fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.md, color: result ? THEME.colors.emerald : THEME.colors.ruby, textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40` }}>
          {result ? '✓ LOST THEM' : '✗ CAUGHT'}
        </div>
      )}

      <style>{`
        @keyframes roadScroll {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(25px); }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME 5: THE INTERROGATION — Dialogue choice (Tier 7+)
// ═══════════════════════════════════════════════════════════════
interface InterrogationProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

const INTERROGATION_SCENARIOS = [
  {
    guardLine: '"You don\'t belong here. State your business — now."',
    options: [
      { label: 'BLUFF', flavor: '"I\'m here for the evening gala. Lord Ashford sent me."', type: 'best' },
      { label: 'BRIBE', flavor: '"Perhaps this will help you forget you saw me."', type: 'risky' },
      { label: 'INTIMIDATE', flavor: '"You don\'t want to know who sent me. Walk away."', type: 'wrong' },
    ],
  },
  {
    guardLine: '"Papers. Now. And explain why you\'re in the east wing."',
    options: [
      { label: 'BRIBE', flavor: '"My papers are right here — along with your evening bonus."', type: 'best' },
      { label: 'INTIMIDATE', flavor: '"Check with the Director. He\'ll confirm my clearance."', type: 'risky' },
      { label: 'BLUFF', flavor: '"I must have gotten lost. These halls all look the same."', type: 'wrong' },
    ],
  },
  {
    guardLine: '"The vault corridor is restricted. Last chance to explain yourself."',
    options: [
      { label: 'INTIMIDATE', flavor: '"Touch that radio and it\'s the last thing you do."', type: 'best' },
      { label: 'BLUFF', flavor: '"Maintenance scheduled a check. You weren\'t briefed?"', type: 'risky' },
      { label: 'BRIBE', flavor: '"Name your price. We can both profit tonight."', type: 'wrong' },
    ],
  },
];

export const InterrogationGame = ({ difficulty, onResult }: InterrogationProps) => {
  const [scenario] = useState(() =>
    INTERROGATION_SCENARIOS[Math.floor(Math.random() * INTERROGATION_SCENARIOS.length)]
  );
  const [phase, setPhase] = useState<'dialogue' | 'choosing' | 'result'>('dialogue');
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (phase === 'dialogue') {
      const t = setTimeout(() => setPhase('choosing'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleChoice = (idx: number) => {
    if (phase !== 'choosing' || chosenIdx !== null) return;
    setChosenIdx(idx);
    const option = scenario.options[idx];
    const roll = Math.random();
    const threshold = option.type === 'best' ? 0.85 : option.type === 'risky' ? 0.40 : 0.05;
    const success = roll < threshold;
    setResult(success);
    if (navigator.vibrate) navigator.vibrate(success ? 50 : 200);
    setPhase('result');
    setTimeout(() => onResult(success), 2000);
  };

  const choiceColors = {
    BLUFF: THEME.colors.sapphire,
    BRIBE: THEME.colors.gold,
    INTIMIDATE: THEME.colors.ruby,
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💂 THE INTERROGATION</div>

      {/* Guard */}
      <div style={{ fontSize: 56, marginBottom: THEME.space.md, filter: `drop-shadow(0 0 20px ${THEME.colors.ruby}30)` }}>
        💂
      </div>

      {/* Speech bubble */}
      <div style={{
        ...S.card, marginBottom: THEME.space.lg,
        borderColor: THEME.colors.borderMid,
        position: 'relative',
        fontFamily: THEME.fonts.body, fontSize: 13, fontStyle: 'italic',
        color: THEME.colors.textPrimary, lineHeight: 1.6,
      }}>
        {scenario.guardLine}
        {/* Speech bubble arrow */}
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderBottom: `8px solid ${THEME.colors.borderMid}`,
        }} />
      </div>

      {/* Options */}
      {(phase === 'choosing' || phase === 'result') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
          {scenario.options.map((opt, i) => {
            const isChosen = chosenIdx === i;
            const color = choiceColors[opt.label as keyof typeof choiceColors] || THEME.colors.gold;
            return (
              <button key={i} onClick={() => handleChoice(i)}
                disabled={phase === 'result'}
                style={{
                  background: isChosen ? `${color}20` : THEME.colors.ink,
                  border: `1px solid ${isChosen ? color : THEME.colors.borderFaint}`,
                  borderRadius: THEME.radius.md, padding: THEME.space.md,
                  cursor: phase === 'result' ? 'default' : 'pointer',
                  textAlign: 'left', opacity: phase === 'result' && !isChosen ? 0.3 : 1,
                  transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: 12, fontFamily: THEME.fonts.display, color, letterSpacing: 3, marginBottom: 4 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textSecondary }}>
                  {opt.flavor}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {phase === 'result' && result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.lg,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ CONVINCING' : '✗ NOT BUYING IT'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PRESSURE VALVE — Hold and release gauge
// ═══════════════════════════════════════════════════════════════
interface PressureValveProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

export const PressureValveGame = ({ difficulty, onResult }: PressureValveProps) => {
  const [pressure, setPressure] = useState(0);
  const [holding, setHolding] = useState(false);
  const [released, setReleased] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const targetMin = 55 + difficulty * 3;
  const targetMax = targetMin + Math.max(10, 25 - difficulty * 4);
  const fillSpeed = 0.6 + difficulty * 0.15;

  useEffect(() => {
    if (!holding || released) return;
    const interval = setInterval(() => {
      setPressure(prev => {
        const next = prev + fillSpeed;
        if (next >= 100) {
          setHolding(false);
          setReleased(true);
          setResult(false);
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => onResult(false), 1200);
          return 100;
        }
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [holding, released, fillSpeed, onResult]);

  const handleRelease = () => {
    if (released) return;
    setHolding(false);
    setReleased(true);
    const hit = pressure >= targetMin && pressure <= targetMax;
    setResult(hit);
    if (navigator.vibrate) navigator.vibrate(hit ? 50 : 200);
    setTimeout(() => onResult(hit), 1200);
  };

  const gaugeColor = pressure >= 85 ? THEME.colors.ruby :
    pressure >= targetMin && pressure <= targetMax ? THEME.colors.emerald : THEME.colors.sapphire;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💪 PRESSURE VALVE</div>
      <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.xl }}>
        Hold to fill. Release in the green zone.
      </div>
      <div style={{ position: 'relative', width: 48, height: 200, margin: '0 auto', background: THEME.colors.dusk, borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.borderFaint}`, overflow: 'hidden', marginBottom: THEME.space.xl }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${targetMin}%`, height: `${targetMax - targetMin}%`, background: `${THEME.colors.emerald}20`, borderTop: `2px solid ${THEME.colors.emerald}60`, borderBottom: `2px solid ${THEME.colors.emerald}60` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '15%', background: `${THEME.colors.ruby}15` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pressure}%`, background: `linear-gradient(0deg, ${gaugeColor}80, ${gaugeColor})`, boxShadow: `0 0 12px ${gaugeColor}40` }} />
        <div style={{ position: 'absolute', left: '50%', bottom: `${Math.min(pressure, 94)}%`, transform: 'translate(-50%, 50%)', fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.void, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {Math.round(pressure)}
        </div>
      </div>
      {result !== null ? (
        <div style={{ fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, color: result ? THEME.colors.emerald : THEME.colors.ruby, textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40` }}>
          {result ? '✓ CRACKED' : pressure >= 100 ? '✗ BURST' : '✗ MISSED'}
        </div>
      ) : (
        <button
          onMouseDown={() => setHolding(true)}
          onMouseUp={handleRelease}
          onMouseLeave={() => holding && handleRelease()}
          onTouchStart={(e) => { e.preventDefault(); setHolding(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
          style={{ ...S.btnPrimary, maxWidth: 200, margin: '0 auto', background: holding ? THEME.colors.goldBright : THEME.colors.gold }}
        >
          {holding ? 'RELEASE!' : 'HOLD TO FILL'}
        </button>
      )}
    </div>
  );
};
