import { useState, useEffect, useRef, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';
import { CREW_MEMBERS, CHAOS_CARDS } from '@/lib/gameData';

// ═══════════════════════════════════════════════════════════════
// FLOATING TEXT — reusable "+value" / "-value" popup
// ═══════════════════════════════════════════════════════════════
interface FloatingTextProps {
  value: string;
  color: string;
  x: number;
  y: number;
  onDone: () => void;
}

export const FloatingText = ({ value, color, x, y, onDone }: FloatingTextProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const t = setTimeout(onDone, 650);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50,
      fontFamily: THEME.fonts.display, fontSize: 16, fontWeight: 700,
      color, letterSpacing: 2, textShadow: `0 0 8px ${color}60`,
      transform: mounted ? 'translateY(-40px)' : 'translateY(0px)',
      opacity: mounted ? 0 : 1,
      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
    }}>
      {value}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Floating text manager hook
// ═══════════════════════════════════════════════════════════════
interface FloatItem {
  id: number;
  value: string;
  color: string;
  x: number;
  y: number;
}

export function useFloatingTexts() {
  const [items, setItems] = useState<FloatItem[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback((value: string, color: string, x = 150, y = 100) => {
    const id = ++idRef.current;
    setItems(prev => [...prev, { id, value, color, x, y }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const renderFloats = () => (
    <>
      {items.map(item => (
        <FloatingText
          key={item.id}
          value={item.value}
          color={item.color}
          x={item.x}
          y={item.y}
          onDone={() => remove(item.id)}
        />
      ))}
    </>
  );

  return { spawn, renderFloats };
}

// ═══════════════════════════════════════════════════════════════
// RESULT OVERLAY — success/failure full-screen feedback
// ═══════════════════════════════════════════════════════════════
interface ResultOverlayProps {
  success: boolean;
  roleName?: string;
  payoutMultiplier?: string;
  heatPenalty?: string;
  onDismiss: () => void;
}

export const ResultOverlay = ({ success, roleName, payoutMultiplier, heatPenalty, onDismiss }: ResultOverlayProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: success ? 'rgba(6,4,10,0.92)' : 'rgba(6,4,10,0.95)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
        cursor: 'pointer',
      }}
    >
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
        animation: 'scanlineScroll 4s linear infinite',
        zIndex: 1,
      }} />

      {/* Pulse / flicker background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: success
          ? `radial-gradient(circle at center, ${THEME.colors.gold}20 0%, transparent 60%)`
          : `radial-gradient(circle at center, ${THEME.colors.ruby}15 0%, transparent 50%)`,
        animation: success ? 'goldPulse 1.5s ease-in-out infinite' : 'redFlicker 0.3s ease-in-out 3',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {success ? (
          <>
            <div style={{
              fontSize: 36, fontFamily: THEME.fonts.display, letterSpacing: 6,
              color: THEME.colors.gold,
              textShadow: `0 0 30px ${THEME.colors.gold}50`,
              marginBottom: THEME.space.md,
            }}>
              {roleName || 'CLEAR'}
            </div>
            {payoutMultiplier && (
              <div style={{
                fontSize: 16, fontFamily: THEME.fonts.mono, letterSpacing: 3,
                color: THEME.colors.goldBright,
              }}>
                {payoutMultiplier}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{
              fontSize: 40, fontFamily: THEME.fonts.display, letterSpacing: 8,
              color: THEME.colors.ruby,
              textShadow: `0 0 30px ${THEME.colors.ruby}60`,
              marginBottom: THEME.space.md,
              animation: 'redFlicker 0.15s ease-in-out 3',
            }}>
              BLOWN
            </div>
            {heatPenalty && (
              <div style={{
                fontSize: 14, fontFamily: THEME.fonts.mono, letterSpacing: 2,
                color: THEME.colors.ruby,
              }}>
                {heatPenalty}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes scanlineScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes goldPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes redFlicker {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BLACK FLASH — 200ms noir transition
// ═══════════════════════════════════════════════════════════════
export const BlackFlash = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: THEME.colors.void,
      animation: 'blackFlash 0.2s ease-out forwards',
    }}>
      <style>{`
        @keyframes blackFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME HUD — persistent top bar during gameplay
// ═══════════════════════════════════════════════════════════════
interface MiniGameHUDProps {
  vaultTier: number;
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  currentGameType: string;
  visible: boolean;
}

const GAME_ROLES: Record<string, string> = {
  shadow: 'Scout', coldread: 'Grifter', wiretap: 'Hacker',
  signal: 'Comms', takedown: 'Muscle', pursuit: 'Wheelman',
  lock: 'Lockpick', combo: '', wire: 'Hacker', tail: '', interrogation: '',
};

export const MiniGameHUD = ({ vaultTier, crewIds, chaosCard, currentGameType, visible }: MiniGameHUDProps) => {
  const activeCrewBonuses = crewIds
    .map(id => CREW_MEMBERS.find(c => c.id === id))
    .filter(Boolean)
    .filter(c => {
      const role = GAME_ROLES[currentGameType];
      return role && c!.role.toLowerCase() === role.toLowerCase();
    });

  const hasChaos = chaosCard.effect !== 'payout_bonus' && chaosCard.effect !== 'loyalty_boost';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      background: `${THEME.colors.void}E0`,
      borderBottom: `1px solid ${THEME.colors.borderFaint}`,
      padding: '6px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: THEME.fonts.mono, fontSize: 9, letterSpacing: 1,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease-out',
    }}>
      {/* Tier */}
      <div style={{ color: THEME.colors.goldDim }}>
        TIER {vaultTier}
      </div>

      {/* Crew bonuses */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {activeCrewBonuses.map(c => (
          <span key={c!.id} style={{ color: THEME.colors.sapphire }}>
            {c!.emoji} {c!.role.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Chaos indicator */}
      {hasChaos && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: THEME.colors.ruby,
            animation: 'chaosPulse 1s ease-in-out infinite',
          }} />
          <span style={{ color: THEME.colors.ruby, fontSize: 8 }}>
            {chaosCard.name.toUpperCase()}
          </span>
        </div>
      )}

      <style>{`
        @keyframes chaosPulse {
          0%, 100% { opacity: 0.4; box-shadow: 0 0 4px ${THEME.colors.ruby}40; }
          50% { opacity: 1; box-shadow: 0 0 8px ${THEME.colors.ruby}80; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL POLISH KEYFRAMES — injected once
// ═══════════════════════════════════════════════════════════════
export const PolishStyles = () => (
  <style>{`
    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0.92); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeOutSlide {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
    @keyframes slideUpFade {
      0% { opacity: 0; transform: translateY(16px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .minigame-enter {
      animation: fadeInScale 0.3s ease-out both;
    }
    .minigame-exit {
      animation: fadeOutSlide 0.25s ease-in both;
    }
  `}</style>
);
