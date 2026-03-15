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
  pearl: THEME.colors.pearl,
  sapphire: THEME.colors.sapphire,
  emerald: THEME.colors.emerald,
  ruby: THEME.colors.ruby,
  diamond: THEME.colors.diamond,
};

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const vaultDescriptions: Record<string, string> = {
  pawnshop_safe: 'A greasy operation off the docks. Low security, lower expectations. Perfect for a warm-up.',
  harbor_lockbox: 'Shipping containers full of secrets. The harbor master looks the other way — for a price.',
  market_register: 'The busiest stalls in Market Square hide more than cheap goods. Time your entry right.',
  jewelers_case: 'Fine gems behind thin glass. The jeweler has a drinking problem. Tonight, that\'s your advantage.',
  bank_branch: 'First National thinks their branch vault is impenetrable. They haven\'t met you yet.',
  old_quarter_vault: 'Centuries-old stonework hides a modern vault. The combination changes with the tides.',
  neon_casino: 'Neon lights, loaded dice, and a cage full of cash. The house always wins — until tonight.',
  undercity_stash: 'Deep beneath the streets, the real power brokers keep their reserves. No cameras. No witnesses.',
  foundry_payroll: 'Molten steel above, cold cash below. The workers get paid Friday. You get paid Thursday.',
  pit_vault: 'The deepest vault in Ironhollow. They say it\'s never been cracked. They say a lot of things.',
  crystal_gallery: 'Art worth millions, guarded by lasers and ego. One wrong step and the floor drops.',
  the_sanctum_vault: 'The final vault. Legend says it holds enough to buy a city. Only ghosts get in.',
};

const VaultSelectScreen = ({ vault, onCommit, onBack }: VaultSelectScreenProps) => {
  const cityData = CITIES[vault.city as keyof typeof CITIES];
  const baseRisk = Math.round(vault.difficulty * 16 + Math.random() * 8);
  const drops = jewelDropChances[vault.tier] || jewelDropChances[1];
  const formatDistrict = (d: string) => d.replace(/_/g, ' ');

  return (
    <div style={{ ...S.page, position: 'relative', overflow: 'hidden' }}>
      {/* Rain effect */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              width: 1,
              height: `${20 + Math.random() * 30}px`,
              background: `linear-gradient(180deg, transparent, rgba(232,184,75,0.08))`,
              animation: `rainFall ${1.5 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.colors.textMuted,
            fontFamily: THEME.fonts.display,
            fontSize: 11,
            letterSpacing: 2,
            cursor: 'pointer',
            marginBottom: THEME.space.lg,
            padding: 0,
          }}
        >
          ← BACK TO JOBS
        </button>

        {/* Vault name */}
        <div style={S.eyebrow}>{cityData?.name} — {formatDistrict(vault.district)}</div>
        <h1
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 28,
            color: THEME.colors.gold,
            letterSpacing: 3,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: THEME.space.md,
            textShadow: '0 0 30px rgba(232,184,75,0.2)',
          }}
        >
          {vault.name}
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: THEME.fonts.body,
            fontStyle: 'italic',
            fontSize: 14,
            color: THEME.colors.textSecondary,
            lineHeight: 1.7,
            marginBottom: THEME.space.xl,
          }}
        >
          {vaultDescriptions[vault.id] || 'A target worth your attention.'}
        </p>

        {/* Stats dossier */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>DOSSIER</div>
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
        <div
          style={{
            fontSize: 12,
            fontFamily: THEME.fonts.body,
            fontStyle: 'italic',
            color: THEME.colors.textSecondary,
            textAlign: 'center',
            marginBottom: THEME.space.lg,
          }}
        >
          With current crew: ~{Math.max(baseRisk - 19, 5)}% risk
        </div>

        {/* Jewel drops */}
        <div style={{ ...S.card, marginBottom: THEME.space.xl }}>
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
          <div style={{ color: THEME.colors.gold, fontSize: 18, letterSpacing: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ opacity: i < vault.difficulty ? 1 : 0.15 }}>★</span>
            ))}
          </div>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginTop: 4 }}>
            DIFFICULTY {vault.difficulty}/5
          </div>
        </div>

        {/* Action buttons */}
        <button onClick={() => { SFX.vaultSelect(); onCommit(); }} style={{ ...S.btnPrimary, marginBottom: THEME.space.md, boxShadow: THEME.shadows.gold }}>
          COMMIT TO THE JOB
        </button>
        <button onClick={onBack} style={S.btnGhost}>
          BACK TO JOB BOARD
        </button>
      </div>

      {/* Rain keyframes */}
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VaultSelectScreen;
