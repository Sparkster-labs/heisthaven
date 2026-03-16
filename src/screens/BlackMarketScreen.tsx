import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import type { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

interface BlackMarketScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// Daily seeded random for consistent stock across sessions
// ═══════════════════════════════════════════════════════════════
function dailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ═══════════════════════════════════════════════════════════════
// Item definitions
// ═══════════════════════════════════════════════════════════════
interface MarketItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  costType: 'cash' | 'jewel';
  costAmount: number;
  jewelType?: string;
  stock: number;
  effect: string;
}

const CASH_ITEM_POOL: Omit<MarketItem, 'stock'>[] = [
  { id: 'crew_insurance', name: 'Crew Insurance', emoji: '🛡️', description: 'Protect against one crew betrayal per heist.', costType: 'cash', costAmount: 150, effect: 'crew_insurance' },
  { id: 'intel_package', name: 'Full Intel Package', emoji: '📋', description: 'Reveals chaos card before the heist begins.', costType: 'cash', costAmount: 100, effect: 'intel_package' },
  { id: 'bail_out', name: 'Bail Out Option', emoji: '🚪', description: '50% refund if you quit mid-run.', costType: 'cash', costAmount: 75, effect: 'bail_out' },
  { id: 'lucky_charm', name: 'Lucky Charm', emoji: '🍀', description: '+5% success chance on your next heist.', costType: 'cash', costAmount: 200, effect: 'lucky_charm' },
  { id: 'lockpick_set', name: 'Master Lockpick Set', emoji: '🔑', description: 'Lockpick sweet spot 30% wider on next run.', costType: 'cash', costAmount: 250, effect: 'lockpick_boost' },
  { id: 'scanner', name: 'Wire Scanner', emoji: '📡', description: 'First wire in Alarm Cut highlighted.', costType: 'cash', costAmount: 180, effect: 'wire_hint' },
  { id: 'adrenaline', name: 'Adrenaline Shot', emoji: '💉', description: '+3 seconds on all timed mini-games.', costType: 'cash', costAmount: 120, effect: 'timer_boost' },
  { id: 'disguise', name: 'Guard Disguise', emoji: '🥸', description: 'Interrogation success +20%.', costType: 'cash', costAmount: 300, effect: 'disguise' },
];

const JEWEL_ITEM_POOL: Omit<MarketItem, 'stock'>[] = [
  { id: 'pearl_exchange', name: 'Pearl Exchange', emoji: '🤍', description: 'Trade 3 Pearls for 1 Sapphire.', costType: 'jewel', costAmount: 3, jewelType: 'pearl', effect: 'pearl_to_sapphire' },
  { id: 'sapphire_exchange', name: 'Sapphire Exchange', emoji: '💙', description: 'Trade 2 Sapphires for 1 Emerald.', costType: 'jewel', costAmount: 2, jewelType: 'sapphire', effect: 'sapphire_to_emerald' },
  { id: 'heat_pearl', name: 'Cool Down', emoji: '❄️', description: 'Spend 1 Pearl to reduce district heat by 5.', costType: 'jewel', costAmount: 1, jewelType: 'pearl', effect: 'heat_reduction' },
  { id: 'loyalty_gem', name: 'Loyalty Gift', emoji: '💎', description: 'Spend 1 Sapphire to boost all crew loyalty +10.', costType: 'jewel', costAmount: 1, jewelType: 'sapphire', effect: 'loyalty_boost' },
  { id: 'emerald_reroll', name: 'Chaos Rewrite', emoji: '💚', description: 'Spend 1 Emerald for guaranteed positive chaos card.', costType: 'jewel', costAmount: 1, jewelType: 'emerald', effect: 'chaos_rewrite' },
];

function generateDailyStock(): { cashItems: MarketItem[]; jewelItems: MarketItem[] } {
  const rand = seededRandom(dailySeed());
  const shuffledCash = [...CASH_ITEM_POOL].sort(() => rand() - 0.5);
  const shuffledJewel = [...JEWEL_ITEM_POOL].sort(() => rand() - 0.5);

  return {
    cashItems: shuffledCash.slice(0, 4).map(item => ({ ...item, stock: 1 + Math.floor(rand() * 2) })),
    jewelItems: shuffledJewel.slice(0, 3).map(item => ({ ...item, stock: 1 + Math.floor(rand() * 2) })),
  };
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};
const jewelColors: Record<string, string> = {
  pearl: THEME.colors.pearl, sapphire: THEME.colors.sapphire,
  emerald: THEME.colors.emerald, ruby: THEME.colors.ruby, diamond: THEME.colors.diamond,
};

const BlackMarketScreen = ({ activeTab, onTabChange }: BlackMarketScreenProps) => {
  const [profile, setProfile] = useState<{ cash: number; jewels: Record<string, number> } | null>(null);
  const [{ cashItems, jewelItems }] = useState(() => generateDailyStock());
  const [purchased, setPurchased] = useState<Record<string, number>>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  // Midnight countdown
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('cash, jewels').eq('id', user.id).single();
    if (data) setProfile({ cash: data.cash, jewels: data.jewels as Record<string, number> });
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!profile || purchasing) return;
    const timesPurchased = purchased[item.id] || 0;
    if (timesPurchased >= item.stock) return;

    if (item.costType === 'cash' && profile.cash < item.costAmount) return;
    if (item.costType === 'jewel' && item.jewelType && (profile.jewels[item.jewelType] || 0) < item.costAmount) return;

    setPurchasing(item.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPurchasing(null); return; }

    let newCash = profile.cash;
    let newJewels = { ...profile.jewels };

    if (item.costType === 'cash') {
      newCash -= item.costAmount;
    } else if (item.costType === 'jewel' && item.jewelType) {
      newJewels[item.jewelType] = (newJewels[item.jewelType] || 0) - item.costAmount;
    }

    // Apply effect
    if (item.effect === 'crew_insurance') {
      await supabase.from('profiles').update({
        cash: newCash, crew_insurance: true,
      }).eq('id', user.id);
    } else if (item.effect === 'pearl_to_sapphire') {
      newJewels.sapphire = (newJewels.sapphire || 0) + 1;
      await supabase.from('profiles').update({
        jewels: newJewels as unknown as Json,
      }).eq('id', user.id);
    } else if (item.effect === 'sapphire_to_emerald') {
      newJewels.emerald = (newJewels.emerald || 0) + 1;
      await supabase.from('profiles').update({
        jewels: newJewels as unknown as Json,
      }).eq('id', user.id);
    } else if (item.effect === 'loyalty_boost') {
      // Boost all crew loyalty +10
      const { data: crewData } = await supabase.from('crew_state')
        .select('id, loyalty').eq('user_id', user.id);
      if (crewData) {
        for (const c of crewData) {
          await supabase.from('crew_state')
            .update({ loyalty: Math.min(100, c.loyalty + 10) })
            .eq('id', c.id);
        }
      }
      await supabase.from('profiles').update({
        jewels: newJewels as unknown as Json,
      }).eq('id', user.id);
    } else {
      // Generic: just deduct cost (effect stored client-side for run state)
      await supabase.from('profiles').update({
        cash: newCash,
        jewels: newJewels as unknown as Json,
      }).eq('id', user.id);
    }

    setPurchased(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    setProfile({ cash: newCash, jewels: newJewels });
    setPurchasing(null);
    toast({ title: `${item.emoji} ${item.name}`, description: 'Purchased!' });
  };

  if (!profile) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const renderItem = (item: MarketItem) => {
    const timesPurchased = purchased[item.id] || 0;
    const soldOut = timesPurchased >= item.stock;
    const canAfford = item.costType === 'cash'
      ? profile.cash >= item.costAmount
      : item.jewelType ? (profile.jewels[item.jewelType] || 0) >= item.costAmount : false;

    return (
      <div key={item.id} style={{
        ...S.card, padding: THEME.space.md,
        opacity: soldOut ? 0.4 : 1,
        position: 'relative', overflow: 'hidden',
      }}>
        {soldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', zIndex: 2,
          }}>
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.ruby,
              letterSpacing: 4, transform: 'rotate(-15deg)',
              border: `2px solid ${THEME.colors.ruby}`, padding: '4px 16px',
            }}>
              SOLD OUT
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: THEME.space.md, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 12, color: THEME.colors.textPrimary,
              letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase',
            }}>
              {item.name}
            </div>
            <div style={{
              fontFamily: THEME.fonts.body, fontSize: 11, color: THEME.colors.textSecondary,
              lineHeight: 1.4, marginBottom: 8,
            }}>
              {item.description}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                fontSize: 12, fontFamily: THEME.fonts.mono, fontWeight: 700,
                color: item.costType === 'cash' ? THEME.colors.gold : (jewelColors[item.jewelType || ''] || THEME.colors.gold),
              }}>
                {item.costType === 'cash'
                  ? `$${item.costAmount}`
                  : `${item.costAmount} ${jewelEmojis[item.jewelType || ''] || item.jewelType}`}
              </div>
              <div style={{
                fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted,
              }}>
                {item.stock - timesPurchased} left
              </div>
            </div>
          </div>
        </div>

        {!soldOut && (
          <button
            onClick={() => handlePurchase(item)}
            disabled={!canAfford || purchasing === item.id}
            style={{
              ...S.btnPrimary,
              marginTop: THEME.space.sm,
              fontSize: 10, padding: '10px 16px',
              opacity: !canAfford ? 0.4 : purchasing === item.id ? 0.6 : 1,
            }}
          >
            {purchasing === item.id ? 'PROCESSING...' : !canAfford ? 'CAN\'T AFFORD' : 'PURCHASE'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={S.page}>
      <div style={{
        paddingTop: THEME.space.xl, paddingBottom: 80,
        paddingLeft: THEME.space.md, paddingRight: THEME.space.md,
        maxWidth: 480, margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: THEME.space.lg }}>
          <div style={S.eyebrow}>RESTRICTED ACCESS</div>
          <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.sm }}>THE BLACK MARKET</h1>
          <div style={{
            fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic',
            color: THEME.colors.textMuted, marginBottom: THEME.space.md,
          }}>
            "Goods acquired through channels best left unquestioned."
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: THEME.radius.sm,
            background: `${THEME.colors.ruby}10`, border: `1px solid ${THEME.colors.ruby}30`,
          }}>
            <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby, letterSpacing: 1 }}>
              STOCK RESETS IN {countdown}
            </span>
          </div>
        </div>

        {/* Player funds */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: THEME.space.lg,
          marginBottom: THEME.space.lg, padding: THEME.space.md,
          background: THEME.colors.shadow, borderRadius: THEME.radius.md,
        }}>
          <div style={{ fontSize: 14, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, fontWeight: 700 }}>
            ${profile.cash.toLocaleString()}
          </div>
          {Object.entries(profile.jewels).filter(([, c]) => c > 0).map(([type, count]) => (
            <span key={type} style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: jewelColors[type] || THEME.colors.textMuted }}>
              {jewelEmojis[type]}{count}
            </span>
          ))}
        </div>

        {/* Cash items */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>💰 CASH ITEMS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, marginBottom: THEME.space.xl }}>
          {cashItems.map(renderItem)}
        </div>

        {/* Jewel items */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>💎 JEWEL ITEMS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, marginBottom: THEME.space.lg }}>
          {jewelItems.map(renderItem)}
        </div>

        {/* Last stocked */}
        <div style={{
          textAlign: 'center', fontSize: 9, fontFamily: THEME.fonts.mono,
          color: THEME.colors.textMuted, letterSpacing: 1,
        }}>
          LAST STOCKED: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default BlackMarketScreen;
