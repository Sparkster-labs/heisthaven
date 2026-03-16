import { useState, useEffect } from 'react';
import { THEME } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HeldLootBannerProps {
  onNavigateToLoot?: () => void;
}

interface LootSummary {
  totalAmount: number;
  earliestExpiry: string;
}

const HeldLootBanner = ({ onNavigateToLoot }: HeldLootBannerProps) => {
  const [loot, setLoot] = useState<LootSummary | null>(null);
  const [now, setNow] = useState(Date.now());
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const fetchLoot = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('held_loot').select('amount, expires_at')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        const totalAmount = data.reduce((s, r) => s + r.amount, 0);
        const earliestExpiry = data.reduce((min, r) =>
          r.expires_at < min ? r.expires_at : min, data[0].expires_at);
        setLoot({ totalAmount, earliestExpiry });
      }
    };
    fetchLoot();
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  if (!loot) return null;

  const diff = Math.max(0, new Date(loot.earliestExpiry).getTime() - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const timeStr = diff === 0 ? 'MATURED' : `${hours}h ${minutes}m`;

  const handleCollect = async () => {
    if (acting) return;
    setActing(true);
    // Quick collect all matured
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const { data: lootRows } = await supabase.from('held_loot').select('*').eq('user_id', user.id);
    if (!lootRows || lootRows.length === 0) { setActing(false); return; }

    const { data: profile } = await supabase.from('profiles').select('cash').eq('id', user.id).single();
    if (!profile) { setActing(false); return; }

    let totalReturn = 0;
    for (const row of lootRows) {
      const isMatured = new Date(row.expires_at).getTime() <= now;
      totalReturn += isMatured ? Math.round(row.amount * 1.1) : row.amount;
    }

    await supabase.from('profiles').update({ cash: profile.cash + totalReturn }).eq('id', user.id);
    for (const row of lootRows) {
      await supabase.from('held_loot').delete().eq('id', row.id);
    }

    setLoot(null);
    setActing(false);
    toast({ title: '💰 Collected!', description: `$${totalReturn.toLocaleString()} returned to wallet.` });
  };

  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${THEME.colors.goldDim}30, ${THEME.colors.gold}15, ${THEME.colors.goldDim}30)`,
        border: `1px solid ${THEME.colors.gold}30`,
        borderRadius: THEME.radius.md,
        padding: `${THEME.space.sm}px ${THEME.space.md}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: THEME.space.sm,
        marginBottom: THEME.space.md,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: THEME.fonts.mono,
          fontSize: 11,
          color: THEME.colors.gold,
          fontWeight: 700,
        }}>
          💰 ${loot.totalAmount.toLocaleString()} LOOT HELD
        </div>
        <div style={{
          fontFamily: THEME.fonts.mono,
          fontSize: 9,
          color: THEME.colors.textMuted,
        }}>
          {diff === 0 ? '✓ Ready to collect' : `Expires in ${timeStr}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={handleCollect}
          disabled={acting}
          style={{
            background: THEME.colors.gold,
            color: THEME.colors.void,
            border: 'none',
            borderRadius: THEME.radius.sm,
            padding: '4px 10px',
            fontFamily: THEME.fonts.display,
            fontSize: 8,
            letterSpacing: 1,
            cursor: 'pointer',
          }}
        >
          COLLECT
        </button>
        {onNavigateToLoot && (
          <button
            onClick={onNavigateToLoot}
            style={{
              background: 'transparent',
              color: THEME.colors.textMuted,
              border: `1px solid ${THEME.colors.borderFaint}`,
              borderRadius: THEME.radius.sm,
              padding: '4px 10px',
              fontFamily: THEME.fonts.display,
              fontSize: 8,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            DETAILS
          </button>
        )}
      </div>
    </div>
  );
};

export default HeldLootBanner;
