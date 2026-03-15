import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS, REP_THRESHOLDS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface HeistResultsProps {
  vault: typeof VAULTS[number];
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  miniGameResults: boolean[];
  success: boolean;
  onFinish: () => void;
}

const jewelDropChances: Record<number, Record<string, number>> = {
  1: { pearl: 40, sapphire: 10, emerald: 0, ruby: 0, diamond: 0 },
  2: { pearl: 30, sapphire: 25, emerald: 5, ruby: 0, diamond: 0 },
  3: { pearl: 20, sapphire: 20, emerald: 20, ruby: 5, diamond: 0 },
  4: { pearl: 10, sapphire: 15, emerald: 20, ruby: 15, diamond: 5 },
  5: { pearl: 5, sapphire: 10, emerald: 15, ruby: 20, diamond: 15 },
};

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const HeistResults = ({ vault, crewIds, chaosCard, miniGameResults, success, onFinish }: HeistResultsProps) => {
  const [phase, setPhase] = useState<'calculating' | 'reveal' | 'saved'>('calculating');
  const [payout, setPayout] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [jewelDrops, setJewelDrops] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Calculate results
    const successRate = miniGameResults.filter(Boolean).length / miniGameResults.length;

    let calculatedPayout = 0;
    const drops: Record<string, number> = {};
    let xp = 0;

    if (success) {
      // Payout based on success rate
      const range = vault.payoutMax - vault.payoutMin;
      calculatedPayout = Math.round(vault.payoutMin + range * successRate);

      // Chaos card modifier
      if (chaosCard.effect === 'payout_bonus') {
        calculatedPayout = Math.round(calculatedPayout * 1.3);
      }
      if (chaosCard.effect === 'gamble') {
        if (Math.random() > 0.5) {
          calculatedPayout *= 2;
        } else {
          calculatedPayout = 0;
        }
      }

      // Jewel drops
      const chances = jewelDropChances[vault.tier] || jewelDropChances[1];
      Object.entries(chances).forEach(([jewel, chance]) => {
        let effectiveChance = chance;
        if (chaosCard.effect === 'bonus_jewel') effectiveChance += 20;
        if (Math.random() * 100 < effectiveChance) {
          drops[jewel] = (drops[jewel] || 0) + 1;
        }
      });

      // XP
      xp = vault.tier * 25 + Math.round(successRate * 50);
    } else {
      // Failed heist — small consolation XP
      xp = Math.round(vault.tier * 5);
    }

    setPayout(calculatedPayout);
    setXpGained(xp);
    setJewelDrops(drops);

    setTimeout(() => setPhase('reveal'), 2000);
  }, []);

  const saveResults = async () => {
    if (saving) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return;

    const currentJewels = profile.jewels as Record<string, number>;
    const newJewels = { ...currentJewels };
    Object.entries(jewelDrops).forEach(([jewel, count]) => {
      newJewels[jewel] = (newJewels[jewel] || 0) + count;
    });

    // Calculate new rep
    const newXp = profile.rep_xp + xpGained;
    let newLevel = profile.rep_level;
    let newTitle = profile.notoriety_title;
    for (const t of REP_THRESHOLDS) {
      if (newXp >= t.xpRequired) {
        newLevel = t.level;
        newTitle = t.title;
      }
    }

    // Deduct buy-in, add payout
    const newCash = profile.cash - vault.buyIn + payout;

    // Update profile
    await supabase.from('profiles').update({
      cash: Math.max(0, newCash),
      jewels: newJewels as unknown as Json,
      rep_xp: newXp,
      rep_level: newLevel,
      notoriety_title: newTitle,
    }).eq('id', user.id);

    // Save heist history
    await supabase.from('heist_history').insert({
      user_id: user.id,
      vault_name: vault.name,
      vault_tier: vault.tier,
      city_id: vault.city,
      crew_ids: crewIds,
      chaos_card_id: chaosCard.id,
      mini_game_results: miniGameResults,
      payout,
      cash_spent: vault.buyIn,
      success,
      jewel_drops: jewelDrops as unknown as Json,
    });

    // Loyalty changes from chaos card
    if (chaosCard.effect === 'loyalty_loss') {
      for (const crewId of crewIds) {
        const { data: cs } = await supabase.from('crew_state')
          .select('loyalty').eq('user_id', user.id).eq('crew_id', crewId).single();
        if (cs) {
          await supabase.from('crew_state')
            .update({ loyalty: Math.max(0, cs.loyalty - 10) })
            .eq('user_id', user.id).eq('crew_id', crewId);
        }
      }
    }
    if (chaosCard.effect === 'loyalty_boost') {
      for (const crewId of crewIds) {
        const { data: cs } = await supabase.from('crew_state')
          .select('loyalty').eq('user_id', user.id).eq('crew_id', crewId).single();
        if (cs) {
          await supabase.from('crew_state')
            .update({ loyalty: Math.min(100, cs.loyalty + 5) })
            .eq('user_id', user.id).eq('crew_id', crewId);
        }
      }
    }

    // Update weekly leaderboard
    const netEarned = payout - vault.buyIn;
    const weekStart = (() => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday.toISOString().split('T')[0];
    })();

    const { data: existingLb } = await supabase
      .from('leaderboard_weekly')
      .select('id, net_cash_earned')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single();

    if (existingLb) {
      await supabase.from('leaderboard_weekly')
        .update({ net_cash_earned: existingLb.net_cash_earned + netEarned })
        .eq('id', existingLb.id);
    } else {
      await supabase.from('leaderboard_weekly')
        .insert({ user_id: user.id, week_start: weekStart, net_cash_earned: netEarned });
    }

    setPhase('saved');
    setSaving(false);
  };

  useEffect(() => {
    if (phase === 'reveal') saveResults();
  }, [phase]);

  const hasJewels = Object.values(jewelDrops).some(v => v > 0);

  return (
    <div style={{
      ...S.page, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: THEME.space.lg,
    }}>
      {phase === 'calculating' && (
        <div style={{
          fontFamily: THEME.fonts.display, fontSize: 14,
          color: THEME.colors.goldMid, letterSpacing: 4,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          COUNTING THE TAKE...
        </div>
      )}

      {(phase === 'reveal' || phase === 'saved') && (
        <div style={{ maxWidth: 340, width: '100%', textAlign: 'center' }}>
          {/* Success/Fail banner */}
          <div style={{
            fontSize: 48, marginBottom: THEME.space.md,
            filter: `drop-shadow(0 0 20px ${success ? THEME.colors.emerald : THEME.colors.ruby}40)`,
          }}>
            {success ? '🎉' : '💀'}
          </div>
          <h1 style={{
            ...S.h1, fontSize: 24, marginBottom: THEME.space.sm,
            color: success ? THEME.colors.emerald : THEME.colors.ruby,
            textShadow: `0 0 30px ${success ? THEME.colors.emerald : THEME.colors.ruby}30`,
          }}>
            {success ? 'HEIST SUCCESSFUL' : 'HEIST FAILED'}
          </h1>
          <div style={{
            fontFamily: THEME.fonts.body, fontSize: 13, fontStyle: 'italic',
            color: THEME.colors.textSecondary, marginBottom: THEME.space.xl,
          }}>
            {success
              ? `Clean getaway from ${vault.name}.`
              : `The ${vault.name} job went sideways.`}
          </div>

          {/* Mini-game results */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: THEME.space.lg }}>
            {miniGameResults.map((r, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: THEME.radius.sm,
                background: r ? `${THEME.colors.emerald}20` : `${THEME.colors.ruby}20`,
                border: `1px solid ${r ? THEME.colors.emerald : THEME.colors.ruby}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>
                {r ? '✓' : '✗'}
              </div>
            ))}
          </div>

          {/* Payout card */}
          <div style={{ ...S.card, marginBottom: THEME.space.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: THEME.space.xs }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>BUY-IN</span>
              <span style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>-${vault.buyIn}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: THEME.space.xs }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>PAYOUT</span>
              <span style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald }}>+${payout}</span>
            </div>
            <div style={S.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary, letterSpacing: 2 }}>NET</span>
              <span style={{
                fontSize: 16, fontFamily: THEME.fonts.mono, fontWeight: 700,
                color: payout - vault.buyIn >= 0 ? THEME.colors.emerald : THEME.colors.ruby,
              }}>
                {payout - vault.buyIn >= 0 ? '+' : ''}${payout - vault.buyIn}
              </span>
            </div>
          </div>

          {/* XP */}
          <div style={{
            fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.gold,
            marginBottom: THEME.space.md, letterSpacing: 1,
          }}>
            +{xpGained} REP XP
          </div>

          {/* Jewel drops */}
          {hasJewels && (
            <div style={{ ...S.card, marginBottom: THEME.space.xl }}>
              <div style={{ ...S.eyebrow, marginBottom: THEME.space.sm }}>JEWELS FOUND</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: THEME.space.md }}>
                {Object.entries(jewelDrops).filter(([, c]) => c > 0).map(([jewel, count]) => (
                  <div key={jewel} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28 }}>{jewelEmojis[jewel]}</div>
                    <div style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.textPrimary }}>
                      ×{count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chaos card effect reminder */}
          <div style={{
            fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted,
            marginBottom: THEME.space.xl, fontStyle: 'italic',
          }}>
            Chaos: {chaosCard.name} — {chaosCard.description}
          </div>

          {/* Return button */}
          <button
            onClick={onFinish}
            disabled={phase !== 'saved'}
            style={{
              ...S.btnPrimary,
              opacity: phase === 'saved' ? 1 : 0.5,
              boxShadow: THEME.shadows.gold,
            }}
          >
            {phase === 'saved' ? 'RETURN TO SAFEHOUSE' : 'SAVING...'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HeistResults;
