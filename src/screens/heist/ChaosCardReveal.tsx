import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { CHAOS_CARDS } from '@/lib/gameData';

interface ChaosCardRevealProps {
  onComplete: (card: typeof CHAOS_CARDS[number]) => void;
}

const effectIcons: Record<string, string> = {
  heat_increase: '🚨',
  payout_bonus: '💰',
  loyalty_loss: '🩸',
  gamble: '🎲',
  skip_minigame: '🔓',
  abort_risk: '🚔',
  bonus_jewel: '💎',
  crew_betrayal: '🗡️',
  loyalty_boost: '🤝',
  heat_reduction: '🌫️',
};

const effectColors: Record<string, string> = {
  heat_increase: THEME.colors.ruby,
  payout_bonus: THEME.colors.emerald,
  loyalty_loss: THEME.colors.ruby,
  gamble: THEME.colors.warning,
  skip_minigame: THEME.colors.emerald,
  abort_risk: THEME.colors.ruby,
  bonus_jewel: THEME.colors.diamond,
  crew_betrayal: THEME.colors.ruby,
  loyalty_boost: THEME.colors.emerald,
  heat_reduction: THEME.colors.sapphire,
};

const ChaosCardReveal = ({ onComplete }: ChaosCardRevealProps) => {
  const [card] = useState(() => CHAOS_CARDS[Math.floor(Math.random() * CHAOS_CARDS.length)]);
  const [phase, setPhase] = useState<'intro' | 'flipping' | 'revealed'>('intro');

  useEffect(() => {
    // Auto-start flip after dramatic pause
    const t1 = setTimeout(() => setPhase('flipping'), 1500);
    const t2 = setTimeout(() => setPhase('revealed'), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const icon = effectIcons[card.effect] || '🃏';
  const color = effectColors[card.effect] || THEME.colors.gold;

  return (
    <div style={{
      ...S.page,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: THEME.space.lg,
    }}>
      {/* Ambient particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="chaos-particle"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2, height: 2,
              borderRadius: '50%',
              background: color,
              opacity: 0.3,
              animation: `chaosFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: THEME.fonts.display, fontSize: 12, letterSpacing: 6,
        color: THEME.colors.textMuted, textTransform: 'uppercase',
        marginBottom: THEME.space.xl,
        opacity: phase === 'intro' ? 1 : 0.4,
        transition: 'opacity 0.5s',
        position: 'relative', zIndex: 1,
      }}>
        FATE INTERVENES
      </div>

      {/* Card container with 3D perspective */}
      <div style={{
        perspective: 800,
        width: 240, height: 340,
        marginBottom: THEME.space.xl,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: phase === 'intro' ? 'rotateY(0deg)' : phase === 'flipping' ? 'rotateY(180deg)' : 'rotateY(180deg)',
        }}>
          {/* Card Back */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: THEME.radius.lg,
            border: `2px solid ${THEME.colors.borderMid}`,
            background: `linear-gradient(145deg, ${THEME.colors.ink}, ${THEME.colors.shadow})`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 ${THEME.colors.borderMid}`,
          }}>
            {/* Decorative pattern */}
            <div style={{
              width: 180, height: 260,
              border: `1px solid ${THEME.colors.borderFaint}`,
              borderRadius: THEME.radius.md,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${THEME.colors.borderFaint}15 8px, ${THEME.colors.borderFaint}15 9px)`,
            }}>
              <div style={{
                fontFamily: THEME.fonts.display, fontSize: 32,
                color: THEME.colors.goldDim, letterSpacing: 2,
              }}>
                🃏
              </div>
            </div>
          </div>

          {/* Card Front */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: THEME.radius.lg,
            border: `2px solid ${color}60`,
            background: `linear-gradient(170deg, ${THEME.colors.ink}, ${THEME.colors.void})`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: THEME.space.lg,
            boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${color}15`,
          }}>
            {/* Icon */}
            <div style={{
              fontSize: 48, marginBottom: THEME.space.md,
              filter: `drop-shadow(0 0 12px ${color}60)`,
            }}>
              {icon}
            </div>

            {/* Card name */}
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 16,
              color, letterSpacing: 3,
              textTransform: 'uppercase', textAlign: 'center',
              marginBottom: THEME.space.md,
              textShadow: `0 0 20px ${color}40`,
            }}>
              {card.name}
            </div>

            {/* Divider */}
            <div style={{
              width: 60, height: 1,
              background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
              marginBottom: THEME.space.md,
            }} />

            {/* Description */}
            <div style={{
              fontFamily: THEME.fonts.body, fontSize: 12,
              color: THEME.colors.textSecondary,
              textAlign: 'center', lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              {card.description}
            </div>
          </div>
        </div>
      </div>

      {/* Continue button — only after reveal */}
      {phase === 'revealed' && (
        <button
          onClick={() => onComplete(card)}
          style={{
            ...S.btnPrimary,
            maxWidth: 280,
            opacity: 0,
            animation: 'chaosButtonFadeIn 0.6s ease forwards',
            animationDelay: '0.3s',
            position: 'relative', zIndex: 1,
            boxShadow: `0 0 30px ${color}20`,
          }}
        >
          ACCEPT YOUR FATE
        </button>
      )}

      <style>{`
        @keyframes chaosFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.5; }
        }
        @keyframes chaosButtonFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChaosCardReveal;
