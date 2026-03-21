import { THEME, S } from '@/styles/theme';
import { VAULTS, CITIES } from '@/lib/gameData';
import { SFX } from '@/lib/sounds';

interface VaultSelectScreenProps {
  vault: typeof VAULTS[number];
  onCommit: () => void;
  onBack: () => void;
}

const jewelDropChances: Record<number, Record<string, number>> = {
  1: { pearl: 40, sapphire: 10, emerald: 0, ruby: 0, diamond: 0 },
  2: { pearl: 30, sapphire: 25, emerald: 5, ruby: 0, diamond: 0 },
  3: { pearl: 20, sapphire: 20, emerald: 20, ruby: 5, diamond: 0 },
  4: { pearl: 10, sapphire: 15, emerald: 20, ruby: 15, diamond: 5 },
  5: { pearl: 5, sapphire: 10, emerald: 15, ruby: 20, diamond: 15 },
};

const jewelColors: Record<string, string> = {
  pearl: THEME.colors.pearl, sapphire: THEME.colors.sapphire,
  emerald: THEME.colors.emerald, ruby: THEME.colors.ruby, diamond: THEME.colors.diamond,
};

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

// ═══════════════════════════════════════════════════════════════
// DISTRICT VISUAL THEMES
// Each district has a unique accent color, ambient particle type,
// background pattern, and atmosphere description
// ═══════════════════════════════════════════════════════════════
interface DistrictTheme {
  accent: string;
  accentDim: string;
  particleType: 'rain' | 'sparks' | 'snow' | 'ash' | 'dust' | 'neon' | 'fog' | 'embers';
  particleColor: string;
  bgPattern: string; // CSS background pattern
  ambientGlow: string; // radial gradient overlay
  icon: string;
  mood: string;
}

const DISTRICT_THEMES: Record<string, DistrictTheme> = {
  // ── New Cavendish ──
  docks: {
    accent: '#5B8FA8', accentDim: '#2E4F5E',
    particleType: 'rain', particleColor: 'rgba(91,143,168,0.12)',
    bgPattern: `repeating-linear-gradient(90deg, transparent 0px, transparent 48px, rgba(91,143,168,0.03) 48px, rgba(91,143,168,0.03) 50px)`,
    ambientGlow: 'radial-gradient(ellipse at 30% 80%, rgba(91,143,168,0.08) 0%, transparent 60%)',
    icon: '⚓', mood: 'Salt air and creaking hulls',
  },
  market_square: {
    accent: '#D4A843', accentDim: '#7A6328',
    particleType: 'dust', particleColor: 'rgba(212,168,67,0.1)',
    bgPattern: `repeating-linear-gradient(45deg, transparent 0px, transparent 20px, rgba(212,168,67,0.02) 20px, rgba(212,168,67,0.02) 22px)`,
    ambientGlow: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.06) 0%, transparent 55%)',
    icon: '🏪', mood: 'Crowded stalls and whispered deals',
  },
  old_quarter: {
    accent: '#8B7355', accentDim: '#5A4A38',
    particleType: 'fog', particleColor: 'rgba(139,115,85,0.06)',
    bgPattern: `repeating-conic-gradient(rgba(139,115,85,0.02) 0deg, transparent 3deg, transparent 90deg) 0 0 / 40px 40px`,
    ambientGlow: 'radial-gradient(ellipse at 70% 90%, rgba(139,115,85,0.1) 0%, transparent 50%)',
    icon: '🏛️', mood: 'Ancient stone and flickering gas lamps',
  },
  financial_row: {
    accent: '#4CAF7D', accentDim: '#2E6B4D',
    particleType: 'dust', particleColor: 'rgba(76,175,125,0.06)',
    bgPattern: `repeating-linear-gradient(0deg, transparent 0px, transparent 30px, rgba(76,175,125,0.015) 30px, rgba(76,175,125,0.015) 31px), repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(76,175,125,0.015) 30px, rgba(76,175,125,0.015) 31px)`,
    ambientGlow: 'radial-gradient(ellipse at 80% 20%, rgba(76,175,125,0.06) 0%, transparent 50%)',
    icon: '📈', mood: 'Marble floors and silent corridors',
  },
  // ── Shadowport ──
  harborfront: {
    accent: '#4682B4', accentDim: '#2A4E6E',
    particleType: 'rain', particleColor: 'rgba(70,130,180,0.15)',
    bgPattern: `repeating-linear-gradient(180deg, transparent 0px, transparent 60px, rgba(70,130,180,0.02) 60px, rgba(70,130,180,0.02) 62px)`,
    ambientGlow: 'radial-gradient(ellipse at 20% 90%, rgba(70,130,180,0.1) 0%, transparent 60%)',
    icon: '🚢', mood: 'Foghorns and distant ship bells',
  },
  neon_strip: {
    accent: '#E040FB', accentDim: '#8E24AA',
    particleType: 'neon', particleColor: 'rgba(224,64,251,0.08)',
    bgPattern: `repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(224,64,251,0.015) 3px, rgba(224,64,251,0.015) 4px)`,
    ambientGlow: 'radial-gradient(ellipse at 50% 30%, rgba(224,64,251,0.08) 0%, transparent 40%), radial-gradient(ellipse at 20% 60%, rgba(64,224,208,0.05) 0%, transparent 35%)',
    icon: '🎰', mood: 'Neon haze and bass-heavy music',
  },
  the_undercity: {
    accent: '#607D8B', accentDim: '#37474F',
    particleType: 'fog', particleColor: 'rgba(96,125,139,0.08)',
    bgPattern: `radial-gradient(circle at 25% 25%, rgba(96,125,139,0.03) 1px, transparent 1px) 0 0 / 20px 20px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 80%, rgba(96,125,139,0.12) 0%, transparent 50%)',
    icon: '🕳️', mood: 'Dripping pipes and echoing footsteps',
  },
  clocktower_district: {
    accent: '#B8860B', accentDim: '#6B4F06',
    particleType: 'dust', particleColor: 'rgba(184,134,11,0.06)',
    bgPattern: `repeating-conic-gradient(rgba(184,134,11,0.02) 0deg, transparent 10deg, transparent 90deg) 50% 50% / 80px 80px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 10%, rgba(184,134,11,0.08) 0%, transparent 45%)',
    icon: '🕰️', mood: 'Ticking gears and moonlit cobblestone',
  },
  // ── Ironhollow ──
  foundry_row: {
    accent: '#FF6B35', accentDim: '#993F1F',
    particleType: 'embers', particleColor: 'rgba(255,107,53,0.12)',
    bgPattern: `repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255,107,53,0.02) 8px, rgba(255,107,53,0.02) 9px)`,
    ambientGlow: 'radial-gradient(ellipse at 40% 90%, rgba(255,107,53,0.15) 0%, transparent 50%)',
    icon: '🔥', mood: 'Molten glow and hammering steel',
  },
  the_yards: {
    accent: '#78909C', accentDim: '#455A64',
    particleType: 'ash', particleColor: 'rgba(120,144,156,0.08)',
    bgPattern: `repeating-linear-gradient(135deg, transparent 0px, transparent 12px, rgba(120,144,156,0.02) 12px, rgba(120,144,156,0.02) 14px)`,
    ambientGlow: 'radial-gradient(ellipse at 60% 70%, rgba(120,144,156,0.08) 0%, transparent 50%)',
    icon: '🚂', mood: 'Coal dust and distant whistles',
  },
  smelter_heights: {
    accent: '#E84A2E', accentDim: '#8B2C1B',
    particleType: 'embers', particleColor: 'rgba(232,74,46,0.1)',
    bgPattern: `radial-gradient(circle at 50% 50%, rgba(232,74,46,0.03) 1px, transparent 1px) 0 0 / 16px 16px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 100%, rgba(232,74,46,0.18) 0%, transparent 45%)',
    icon: '🏭', mood: 'Toxic fumes and blazing furnaces',
  },
  the_pit: {
    accent: '#9C2740', accentDim: '#5E1726',
    particleType: 'ash', particleColor: 'rgba(156,39,64,0.06)',
    bgPattern: `repeating-linear-gradient(180deg, transparent 0px, transparent 40px, rgba(156,39,64,0.025) 40px, rgba(156,39,64,0.025) 42px)`,
    ambientGlow: 'radial-gradient(ellipse at 50% 95%, rgba(156,39,64,0.2) 0%, transparent 50%)',
    icon: '⛏️', mood: 'Darkness below and silence above',
  },
  // ── Verenthia ──
  crystal_promenade: {
    accent: '#80DEEA', accentDim: '#4BA3AD',
    particleType: 'snow', particleColor: 'rgba(128,222,234,0.08)',
    bgPattern: `radial-gradient(circle at 30% 40%, rgba(128,222,234,0.02) 1px, transparent 1px) 0 0 / 24px 24px, radial-gradient(circle at 70% 80%, rgba(128,222,234,0.02) 1px, transparent 1px) 12px 12px / 24px 24px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 30%, rgba(128,222,234,0.1) 0%, transparent 50%)',
    icon: '🖼️', mood: 'Crystal chandeliers and hushed galleries',
  },
  the_spires: {
    accent: '#CE93D8', accentDim: '#8E4C9A',
    particleType: 'snow', particleColor: 'rgba(206,147,216,0.06)',
    bgPattern: `repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(206,147,216,0.015) 60px, rgba(206,147,216,0.015) 61px)`,
    ambientGlow: 'radial-gradient(ellipse at 70% 10%, rgba(206,147,216,0.08) 0%, transparent 40%)',
    icon: '🔭', mood: 'Vertigo heights and star-lit silence',
  },
  palace_grounds: {
    accent: '#FFD54F', accentDim: '#C49C17',
    particleType: 'dust', particleColor: 'rgba(255,213,79,0.05)',
    bgPattern: `repeating-conic-gradient(rgba(255,213,79,0.015) 0deg, transparent 5deg, transparent 45deg) 0 0 / 50px 50px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(255,213,79,0.06) 0%, transparent 50%)',
    icon: '👑', mood: 'Manicured hedges and patrolling guards',
  },
  the_sanctum: {
    accent: '#B8E8FF', accentDim: '#6BA8C4',
    particleType: 'snow', particleColor: 'rgba(184,232,255,0.05)',
    bgPattern: `radial-gradient(circle at 50% 50%, rgba(184,232,255,0.025) 1px, transparent 1px) 0 0 / 32px 32px`,
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(184,232,255,0.12) 0%, transparent 40%)',
    icon: '🕯️', mood: 'Candlelight and ancient whispers',
  },
};

const DEFAULT_THEME: DistrictTheme = {
  accent: THEME.colors.gold, accentDim: THEME.colors.goldDim,
  particleType: 'rain', particleColor: 'rgba(232,184,75,0.08)',
  bgPattern: 'none', ambientGlow: 'none', icon: '🔒', mood: '',
};

// ═══════════════════════════════════════════════════════════════
// Ambient particle generator
// ═══════════════════════════════════════════════════════════════
const AmbientParticles = ({ theme }: { theme: DistrictTheme }) => {
  const count = theme.particleType === 'neon' ? 25 : theme.particleType === 'fog' ? 12 : 35;

  const getParticleStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      pointerEvents: 'none',
    };

    switch (theme.particleType) {
      case 'rain':
        return {
          ...base,
          top: `-${Math.random() * 20}%`,
          width: 1,
          height: `${20 + Math.random() * 30}px`,
          background: `linear-gradient(180deg, transparent, ${theme.particleColor})`,
          animation: `rainFall ${1.5 + Math.random() * 2}s linear infinite`,
          animationDelay: `${Math.random() * 3}s`,
        };
      case 'sparks':
      case 'embers':
        return {
          ...base,
          bottom: `${Math.random() * 30}%`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%',
          background: theme.particleColor,
          boxShadow: `0 0 ${4 + Math.random() * 6}px ${theme.particleColor}`,
          animation: `emberRise ${2 + Math.random() * 4}s ease-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        };
      case 'snow':
        return {
          ...base,
          top: `-${Math.random() * 10}%`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%',
          background: theme.particleColor,
          animation: `snowDrift ${4 + Math.random() * 6}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
        };
      case 'ash':
        return {
          ...base,
          top: `-${Math.random() * 10}%`,
          width: `${3 + Math.random() * 4}px`,
          height: `${1 + Math.random() * 2}px`,
          background: theme.particleColor,
          transform: `rotate(${Math.random() * 360}deg)`,
          animation: `ashFall ${3 + Math.random() * 5}s linear infinite`,
          animationDelay: `${Math.random() * 4}s`,
        };
      case 'dust':
        return {
          ...base,
          top: `${Math.random() * 100}%`,
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          borderRadius: '50%',
          background: theme.particleColor,
          animation: `dustFloat ${5 + Math.random() * 8}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 6}s`,
        };
      case 'neon':
        return {
          ...base,
          top: `${Math.random() * 100}%`,
          width: `${40 + Math.random() * 80}px`,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.particleColor}, transparent)`,
          animation: `neonFlicker ${1 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        };
      case 'fog':
        return {
          ...base,
          top: `${40 + Math.random() * 50}%`,
          width: `${100 + Math.random() * 200}px`,
          height: `${30 + Math.random() * 50}px`,
          borderRadius: '50%',
          background: theme.particleColor,
          filter: `blur(${20 + Math.random() * 30}px)`,
          animation: `fogDrift ${8 + Math.random() * 12}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 6}s`,
        };
      default:
        return base;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={getParticleStyle(i)} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// VAULT DOSSIER SCREEN
// ═══════════════════════════════════════════════════════════════
const VaultSelectScreen = ({ vault, onCommit, onBack }: VaultSelectScreenProps) => {
  const cityData = CITIES[vault.city as keyof typeof CITIES];
  const baseRisk = Math.round(vault.difficulty * 16 + Math.random() * 8);
  const drops = jewelDropChances[vault.tier] || jewelDropChances[1];
  const formatDistrict = (d: string) => d.replace(/_/g, ' ');
  const theme = DISTRICT_THEMES[vault.district] || DEFAULT_THEME;

  return (
    <div style={{ ...S.page, position: 'relative', overflow: 'hidden' }}>
      {/* District background pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: theme.bgPattern,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: theme.ambientGlow,
      }} />

      {/* Ambient particles */}
      <AmbientParticles theme={theme} />

      {/* Top accent line */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 2,
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        opacity: 0.6,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        {/* Back button */}
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: THEME.colors.textMuted,
          fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
          cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
        }}>
          ← BACK TO JOBS
        </button>

        {/* District badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: THEME.radius.pill,
          background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`,
          marginBottom: THEME.space.md,
        }}>
          <span style={{ fontSize: 12 }}>{theme.icon}</span>
          <span style={{
            fontSize: 9, fontFamily: THEME.fonts.mono, letterSpacing: 2,
            color: theme.accent, textTransform: 'uppercase',
          }}>
            {formatDistrict(vault.district)}
          </span>
        </div>

        {/* City label */}
        <div style={{ ...S.eyebrow, color: theme.accentDim }}>{cityData?.name}</div>

        {/* Vault name */}
        <h1 style={{
          fontFamily: THEME.fonts.display, fontSize: 28, letterSpacing: 3,
          textTransform: 'uppercase', lineHeight: 1.1, marginBottom: THEME.space.sm,
          color: theme.accent,
          textShadow: `0 0 30px ${theme.accent}30`,
        }}>
          <span style={{ marginRight: 8 }}>{'emoji' in vault ? (vault as any).emoji : ''}</span>
          {vault.name}
        </h1>

        {/* District mood */}
        {theme.mood && (
          <div style={{
            fontSize: 10, fontFamily: THEME.fonts.mono, color: theme.accentDim,
            letterSpacing: 1, marginBottom: THEME.space.md,
          }}>
            {theme.mood}
          </div>
        )}

        {/* Flavor text */}
        <p style={{
          fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 14,
          color: THEME.colors.textSecondary, lineHeight: 1.7,
          marginBottom: THEME.space.xl,
          borderLeft: `2px solid ${theme.accent}40`,
          paddingLeft: THEME.space.md,
        }}>
          {'flavor' in vault ? (vault as any).flavor : 'A target worth your attention.'}
        </p>

        {/* Stats dossier */}
        <div style={{
          ...S.card, marginBottom: THEME.space.lg,
          borderColor: `${theme.accent}20`,
        }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, color: theme.accentDim }}>DOSSIER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: THEME.space.md, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, letterSpacing: 2, marginBottom: 4 }}>BUY-IN</div>
              <div style={{ fontSize: 18, color: THEME.colors.ruby, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
                ${vault.buyIn}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, letterSpacing: 2, marginBottom: 4 }}>PAYOUT</div>
              <div style={{ fontSize: 14, color: THEME.colors.emerald, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
                ${vault.payoutMin}–${vault.payoutMax}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, letterSpacing: 2, marginBottom: 4 }}>BASE RISK</div>
              <div style={{ fontSize: 18, color: THEME.colors.warning, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
                {baseRisk}%
              </div>
            </div>
          </div>
        </div>

        {/* Crew impact */}
        <div style={{
          fontSize: 12, fontFamily: THEME.fonts.body, fontStyle: 'italic',
          color: THEME.colors.textSecondary, textAlign: 'center',
          marginBottom: THEME.space.lg,
        }}>
          With current crew: ~{Math.max(baseRisk - 19, 5)}% risk
        </div>

        {/* Jewel drops */}
        <div style={{
          ...S.card, marginBottom: THEME.space.xl,
          borderColor: `${theme.accent}20`,
        }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>JEWEL DROP CHANCES</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {Object.entries(drops).map(([jewel, chance]) => (
              <div key={jewel} style={{ textAlign: 'center', opacity: chance > 0 ? 1 : 0.2 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{jewelEmojis[jewel]}</div>
                <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: chance > 0 ? jewelColors[jewel] : THEME.colors.textMuted }}>
                  {chance}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ textAlign: 'center', marginBottom: THEME.space.xl }}>
          <div style={{ color: theme.accent, fontSize: 18, letterSpacing: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ opacity: i < vault.difficulty ? 1 : 0.15 }}>★</span>
            ))}
          </div>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginTop: 4 }}>
            DIFFICULTY {vault.difficulty}/5
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => { SFX.vaultSelect(); onCommit(); }}
          style={{
            ...S.btnPrimary, marginBottom: THEME.space.md,
            background: theme.accent, color: THEME.colors.void,
            boxShadow: `0 0 20px ${theme.accent}25`,
          }}
        >
          COMMIT TO THE JOB
        </button>
        <button onClick={onBack} style={{
          ...S.btnGhost,
          borderColor: `${theme.accent}30`,
          color: theme.accentDim,
        }}>
          BACK TO JOB BOARD
        </button>
      </div>

      {/* Particle keyframes */}
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes emberRise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-200px) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px) scale(0); opacity: 0; }
        }
        @keyframes snowDrift {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${30 + Math.random() * 50}px); opacity: 0; }
        }
        @keyframes ashFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(${180 + Math.random() * 360}deg) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px); opacity: 0; }
        }
        @keyframes dustFloat {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.2; }
          25% { transform: translateX(${10 + Math.random() * 20}px) translateY(-${5 + Math.random() * 15}px); opacity: 0.6; }
          50% { transform: translateX(-${5 + Math.random() * 10}px) translateY(${5 + Math.random() * 10}px); opacity: 0.3; }
          75% { transform: translateX(${5 + Math.random() * 15}px) translateY(-${3 + Math.random() * 8}px); opacity: 0.5; }
        }
        @keyframes neonFlicker {
          0%, 100% { opacity: 0; }
          10% { opacity: 0.8; }
          12% { opacity: 0.2; }
          14% { opacity: 0.9; }
          50% { opacity: 0.6; }
          80% { opacity: 0.1; }
        }
        @keyframes fogDrift {
          0%, 100% { transform: translateX(-30px); opacity: 0.3; }
          50% { transform: translateX(30px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default VaultSelectScreen;
