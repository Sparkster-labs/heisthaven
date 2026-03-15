import { useState, useEffect, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';

// Lock Pick — timing-based. A cursor sweeps across a bar. Tap in the "sweet spot."
interface LockPickProps {
  difficulty: number; // 1-5
  onResult: (success: boolean) => void;
}

export const LockPickGame = ({ difficulty, onResult }: LockPickProps) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  // Sweet spot shrinks with difficulty
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
    setTimeout(() => onResult(hit), 1200);
  }, [locked, position, sweetSpotStart, sweetSpotWidth, onResult]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>🔑 PICK THE LOCK</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.xl,
      }}>
        Tap when the needle hits the gold zone
      </div>

      {/* Bar */}
      <div style={{
        position: 'relative', height: 32, background: THEME.colors.dusk,
        borderRadius: THEME.radius.md, overflow: 'hidden',
        border: `1px solid ${THEME.colors.borderFaint}`, marginBottom: THEME.space.xl,
      }}>
        {/* Sweet spot */}
        <div style={{
          position: 'absolute', left: `${sweetSpotStart}%`, width: `${sweetSpotWidth}%`,
          top: 0, bottom: 0,
          background: `${THEME.colors.gold}25`,
          borderLeft: `2px solid ${THEME.colors.gold}60`,
          borderRight: `2px solid ${THEME.colors.gold}60`,
        }} />
        {/* Cursor */}
        <div style={{
          position: 'absolute', left: `${position}%`, top: -4, bottom: -4,
          width: 3, marginLeft: -1.5,
          background: result === null ? THEME.colors.pearl : result ? THEME.colors.emerald : THEME.colors.ruby,
          boxShadow: `0 0 8px ${result === null ? THEME.colors.pearl : result ? THEME.colors.emerald : THEME.colors.ruby}60`,
          transition: locked ? 'none' : undefined,
          borderRadius: 2,
        }} />
      </div>

      {result !== null ? (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ CRACKED' : '✗ JAMMED'}
        </div>
      ) : (
        <button onClick={handleTap} style={{ ...S.btnPrimary, maxWidth: 200, margin: '0 auto' }}>
          PICK NOW
        </button>
      )}
    </div>
  );
};

// Wire Cut — memory sequence. Show colored wires, player must cut them in order.
interface WireCutProps {
  difficulty: number;
  onResult: (success: boolean) => void;
}

const WIRE_COLORS = [
  { name: 'RED', color: THEME.colors.ruby },
  { name: 'BLUE', color: THEME.colors.sapphire },
  { name: 'GREEN', color: THEME.colors.emerald },
  { name: 'GOLD', color: THEME.colors.gold },
  { name: 'WHITE', color: THEME.colors.pearl },
];

export const WireCutGame = ({ difficulty, onResult }: WireCutProps) => {
  const wireCount = Math.min(3 + Math.floor(difficulty / 2), 5);
  const [sequence] = useState(() => {
    const shuffled = [...WIRE_COLORS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, wireCount);
  });
  const [phase, setPhase] = useState<'showing' | 'cutting' | 'done'>('showing');
  const [cutIndex, setCutIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [showIdx, setShowIdx] = useState(0);

  // Show sequence one by one
  useEffect(() => {
    if (phase !== 'showing') return;
    if (showIdx >= sequence.length) {
      setTimeout(() => setPhase('cutting'), 600);
      return;
    }
    const t = setTimeout(() => setShowIdx(prev => prev + 1), 800);
    return () => clearTimeout(t);
  }, [phase, showIdx, sequence.length]);

  const handleCut = (idx: number) => {
    if (phase !== 'cutting' || result !== null) return;
    const wire = WIRE_COLORS[idx]; // from displayed shuffled order
    // Player needs to cut wires in the SHOWN sequence order
    if (wire.name === sequence[cutIndex].name) {
      const nextIdx = cutIndex + 1;
      setCutIndex(nextIdx);
      if (nextIdx >= sequence.length) {
        setResult(true);
        setPhase('done');
        setTimeout(() => onResult(true), 1200);
      }
    } else {
      setResult(false);
      setPhase('done');
      setTimeout(() => onResult(false), 1200);
    }
  };

  // Shuffled display order for cutting phase
  const [displayOrder] = useState(() =>
    Array.from({ length: WIRE_COLORS.length }, (_, i) => i).sort(() => Math.random() - 0.5)
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💻 CUT THE WIRES</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.xl,
      }}>
        {phase === 'showing' ? 'Memorize the sequence...' : phase === 'cutting' ? 'Cut in the correct order!' : ''}
      </div>

      {/* Sequence display during showing phase */}
      {phase === 'showing' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: THEME.space.sm, marginBottom: THEME.space.xl, minHeight: 48 }}>
          {sequence.slice(0, showIdx).map((wire, i) => (
            <div key={i} style={{
              width: 40, height: 40, borderRadius: THEME.radius.md,
              background: wire.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.void, fontWeight: 700,
              animation: 'chaosButtonFadeIn 0.3s ease forwards',
              boxShadow: `0 0 12px ${wire.color}40`,
            }}>
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Cutting phase — show all wires */}
      {(phase === 'cutting' || phase === 'done') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, maxWidth: 260, margin: '0 auto', marginBottom: THEME.space.xl }}>
          {displayOrder.map((wireIdx) => {
            const wire = WIRE_COLORS[wireIdx];
            const alreadyCut = phase === 'cutting' && sequence.slice(0, cutIndex).some(s => s.name === wire.name);
            return (
              <button
                key={wire.name}
                onClick={() => handleCut(wireIdx)}
                disabled={phase === 'done' || alreadyCut}
                style={{
                  height: 14, borderRadius: 7,
                  background: alreadyCut ? THEME.colors.borderFaint : wire.color,
                  border: 'none', cursor: phase === 'done' || alreadyCut ? 'default' : 'pointer',
                  opacity: alreadyCut ? 0.2 : 1,
                  transition: 'all 0.2s',
                  boxShadow: alreadyCut ? 'none' : `0 0 8px ${wire.color}30`,
                  position: 'relative',
                }}
              >
                {!alreadyCut && (
                  <span style={{
                    position: 'absolute', right: 8, top: -1,
                    fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.void, fontWeight: 700,
                  }}>
                    {wire.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress dots */}
      {phase === 'cutting' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: THEME.space.md }}>
          {sequence.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < cutIndex ? THEME.colors.emerald : THEME.colors.borderFaint,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      )}

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ BYPASSED' : '✗ SHORT CIRCUIT'}
        </div>
      )}
    </div>
  );
};

// Pressure Valve — hold and release. Fill a gauge to the target zone without overfilling.
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
          const hit = false; // overflowed
          setResult(hit);
          setTimeout(() => onResult(hit), 1200);
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
    setTimeout(() => onResult(hit), 1200);
  };

  const gaugeColor = pressure >= 85 ? THEME.colors.ruby :
    pressure >= targetMin && pressure <= targetMax ? THEME.colors.emerald : THEME.colors.sapphire;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💪 PRESSURE VALVE</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.xl,
      }}>
        Hold to fill. Release in the green zone.
      </div>

      {/* Vertical gauge */}
      <div style={{
        position: 'relative', width: 48, height: 200, margin: '0 auto',
        background: THEME.colors.dusk, borderRadius: THEME.radius.md,
        border: `1px solid ${THEME.colors.borderFaint}`,
        overflow: 'hidden', marginBottom: THEME.space.xl,
      }}>
        {/* Target zone */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          bottom: `${targetMin}%`, height: `${targetMax - targetMin}%`,
          background: `${THEME.colors.emerald}20`,
          borderTop: `2px solid ${THEME.colors.emerald}60`,
          borderBottom: `2px solid ${THEME.colors.emerald}60`,
        }} />
        {/* Danger zone */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: 0, height: '15%',
          background: `${THEME.colors.ruby}15`,
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: `${pressure}%`,
          background: `linear-gradient(0deg, ${gaugeColor}80, ${gaugeColor})`,
          transition: released ? 'none' : undefined,
          boxShadow: `0 0 12px ${gaugeColor}40`,
        }} />
        {/* PSI label */}
        <div style={{
          position: 'absolute', left: '50%', bottom: `${Math.min(pressure, 94)}%`,
          transform: 'translate(-50%, 50%)',
          fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.void,
          fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          {Math.round(pressure)}
        </div>
      </div>

      {result !== null ? (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ CRACKED' : pressure >= 100 ? '✗ BURST' : '✗ MISSED'}
        </div>
      ) : (
        <button
          onMouseDown={() => setHolding(true)}
          onMouseUp={handleRelease}
          onMouseLeave={() => holding && handleRelease()}
          onTouchStart={(e) => { e.preventDefault(); setHolding(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
          style={{
            ...S.btnPrimary, maxWidth: 200, margin: '0 auto',
            background: holding ? THEME.colors.goldBright : THEME.colors.gold,
          }}
        >
          {holding ? 'RELEASE!' : 'HOLD TO FILL'}
        </button>
      )}
    </div>
  );
};
