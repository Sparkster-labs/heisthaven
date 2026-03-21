import { useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';


interface IAPScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack?: () => void;
}

const PACKS = [
  {
    id: 'pearl_case',
    name: "The Pearl Case",
    emoji: '🤍',
    price: '$0.99',
    jewels: { pearl: 5 },
    label: '5 Pearls',
    flavor: "A beginner's luck, bottled.",
    badge: null,
    accentColor: THEME.colors.pearl,
  },
  {
    id: 'sapphire_pouch',
    name: 'The Sapphire Pouch',
    emoji: '💙',
    price: '$1.99',
    jewels: { sapphire: 3, pearl: 2 },
    label: '3 Sapphires + 2 Pearls',
    flavor: 'Smuggled from the harbor.',
    badge: null,
    accentColor: THEME.colors.sapphire,
  },
  {
    id: 'emerald_envelope',
    name: 'The Emerald Envelope',
    emoji: '💚',
    price: '$4.99',
    jewels: { emerald: 2, sapphire: 2, pearl: 3 },
    label: '2 Emeralds + 2 Sapphires + 3 Pearls',
    flavor: 'Left in a dead drop.',
    badge: null,
    accentColor: THEME.colors.emerald,
  },
  {
    id: 'ruby_case',
    name: 'The Ruby Case',
    emoji: '❤️',
    price: '$9.99',
    jewels: { ruby: 1, emerald: 2, sapphire: 3 },
    label: '1 Ruby + 2 Emeralds + 3 Sapphires',
    flavor: "A general's private collection.",
    badge: 'BEST VALUE',
    accentColor: THEME.colors.ruby,
  },
  {
    id: 'diamond_briefcase',
    name: 'The Diamond Briefcase',
    emoji: '💎',
    price: '$19.99',
    jewels: { diamond: 1, ruby: 1, emerald: 2, pearl: 5 },
    label: '1 Diamond + 1 Ruby + 2 Emeralds + 5 Pearls',
    flavor: "Verenthia's finest. Ask no questions.",
    badge: null,
    accentColor: THEME.colors.diamond,
  },
  {
    id: 'fences_special',
    name: "The Fence's Special",
    emoji: '🔄',
    price: '$4.99/mo',
    jewels: {},
    label: '1 Sapphire/week + 20% fence discount + bonus job slot',
    flavor: 'A standing arrangement.',
    badge: 'SUBSCRIPTION',
    accentColor: THEME.colors.goldMid,
  },
] as const;

const IAPScreen = ({ activeTab, onTabChange, onBack }: IAPScreenProps) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const handlePurchase = async (pack: typeof PACKS[number]) => {
    if (pack.id === 'fences_special') {
      toast({ title: '🔄 Coming Soon', description: 'Subscriptions will be available soon.' });
      return;
    }

    setPurchasing(pack.id);

    // Simulate purchase processing
    await new Promise(r => setTimeout(r, 1500));

    // Grant jewels
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('jewels').eq('id', user.id).single();
      if (profile) {
        const currentJewels = profile.jewels as Record<string, number>;
        const updatedJewels = { ...currentJewels };
        Object.entries(pack.jewels).forEach(([type, count]) => {
          updatedJewels[type] = (updatedJewels[type] || 0) + count;
        });
        await supabase.from('profiles').update({ jewels: updatedJewels }).eq('id', user.id);
      }
    }

    setPurchasing(null);
    setPurchased(prev => new Set([...prev, pack.id]));
    toast({ title: '✨ Acquired!', description: `${pack.name} has been added to your collection.` });
  };

  return (
    <div style={S.page} className="screen-enter">
      {/* Header */}
      <div style={{
        padding: `${THEME.space.xl}px ${THEME.space.lg}px ${THEME.space.md}px`,
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: THEME.space.xxl,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', color: THEME.colors.textMuted,
              fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
              cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
            }}
          >
            ← BACK
          </button>
        )}

        <div style={S.eyebrow}>EXCLUSIVE ACCESS</div>
        <h1 className="gold-shimmer" style={{ ...S.h1, fontSize: 20, marginBottom: THEME.space.sm }}>
          THE FENCE'S PRIVATE COLLECTION
        </h1>
        <p style={{
          fontFamily: THEME.fonts.body,
          fontStyle: 'italic',
          fontSize: 12,
          color: THEME.colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: THEME.space.lg,
        }}>
          Rare goods. Acquired through channels best left unquestioned.
        </p>
      </div>

      {/* Packs */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: `0 ${THEME.space.lg}px`,
        paddingBottom: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: THEME.space.md,
      }}
        className="stagger-children"
      >
        {PACKS.map(pack => {
          const isPurchasing = purchasing === pack.id;
          const isPurchased = purchased.has(pack.id);

          return (
            <div
              key={pack.id}
              style={{
                ...S.card,
                position: 'relative',
                borderColor: isPurchased ? `${pack.accentColor}40` : THEME.colors.borderFaint,
                overflow: 'hidden',
              }}
            >
              {/* Badge */}
              {pack.badge && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: -28,
                  background: pack.badge === 'BEST VALUE' ? THEME.colors.emerald : THEME.colors.goldMid,
                  color: THEME.colors.void,
                  fontFamily: THEME.fonts.display,
                  fontSize: 7,
                  letterSpacing: 2,
                  padding: '3px 32px',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'center',
                }}>
                  {pack.badge}
                </div>
              )}

              {/* Pack header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: THEME.space.md }}>
                {/* Jewel display */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: THEME.radius.md,
                  background: `${pack.accentColor}10`,
                  border: `1px solid ${pack.accentColor}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${pack.accentColor}15`,
                }}>
                  {pack.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: THEME.fonts.display,
                    fontSize: 14,
                    color: THEME.colors.textPrimary,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}>
                    {pack.name}
                  </div>
                  <div style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: 10,
                    color: pack.accentColor,
                    marginBottom: 4,
                  }}>
                    {pack.label}
                  </div>
                  <div style={{
                    fontFamily: THEME.fonts.body,
                    fontStyle: 'italic',
                    fontSize: 10,
                    color: THEME.colors.textMuted,
                  }}>
                    "{pack.flavor}"
                  </div>
                </div>
              </div>

              {/* Price + buy button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: THEME.space.md,
                paddingTop: THEME.space.sm,
                borderTop: `1px solid ${THEME.colors.borderFaint}`,
              }}>
                <div style={{
                  fontFamily: THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: THEME.colors.gold,
                }}>
                  {pack.price}
                </div>
                <button
                  onClick={() => handlePurchase(pack)}
                  disabled={isPurchasing || isPurchased}
                  style={{
                    fontFamily: THEME.fonts.display,
                    fontSize: 10,
                    letterSpacing: 2,
                    padding: '8px 20px',
                    borderRadius: THEME.radius.sm,
                    border: 'none',
                    cursor: isPurchasing || isPurchased ? 'default' : 'pointer',
                    background: isPurchased ? `${THEME.colors.emerald}20` : THEME.colors.gold,
                    color: isPurchased ? THEME.colors.emerald : THEME.colors.void,
                    opacity: isPurchasing ? 0.6 : 1,
                  }}
                >
                  {isPurchasing ? 'PROCESSING...' : isPurchased ? '✓ ACQUIRED' : 'ACQUIRE'}
                </button>
              </div>
            </div>
          );
        })}

        {/* Disclaimer */}
        <div style={{
          textAlign: 'center',
          padding: `${THEME.space.lg}px 0`,
        }}>
          <div style={{
            fontFamily: THEME.fonts.mono,
            fontSize: 9,
            color: THEME.colors.textMuted,
            lineHeight: 1.8,
          }}>
            All jewels available through gameplay. Purchases support development.
          </div>
          <div style={{
            fontFamily: THEME.fonts.body,
            fontStyle: 'italic',
            fontSize: 9,
            color: THEME.colors.textMuted,
            marginTop: 4,
          }}>
            No pay-to-win. No exclusive content. One criminal to another.
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default IAPScreen;
