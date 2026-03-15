import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HeldLootScreenProps {
  onBack: () => void;
}

interface HeldLootRow {
  id: string;
  amount: number;
  held_at: string;
  expires_at: string;
  raid_chance: number;
}

const HOLD_HOURS = 24;
const BASE_RAID_CHANCE = 0.15;
const BONUS_RATE = 0.10; // 10% bonus if held to maturity

const HeldLootScreen = ({ onBack }: HeldLootScreenProps) => {
  const [cash, setCash] = useState(0);
  const [heldLoot, setHeldLoot] = useState<HeldLootRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stashAmount, setStashAmount] = useState('');
  const [acting, setActing] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, lootRes] = await Promise.all([
      supabase.from('profiles').select('cash').eq('id', user.id).single(),
      supabase.from('held_loot').select('*').eq('user_id', user.id).order('held_at', { ascending: false }),
    ]);

    if (profileRes.data) setCash(profileRes.data.cash);
    if (lootRes.data) setHeldLoot(lootRes.data.map(r => ({
      ...r,
      raid_chance: Number(r.raid_chance),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStash = async () => {
    const amount = parseInt(stashAmount);
    if (!amount || amount <= 0 || amount > cash || acting) return;

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const expiresAt = new Date(Date.now() + HOLD_HOURS * 60 * 60 * 1000).toISOString();

    await supabase.from('profiles').update({ cash: cash - amount }).eq('id', user.id);
    await supabase.from('held_loot').insert({
      user_id: user.id,
      amount,
      expires_at: expiresAt,
      raid_chance: BASE_RAID_CHANCE,
    });

    setStashAmount('');
    setActing(false);
    fetchData();
  };

  const handleWithdraw = async (loot: HeldLootRow) => {
    if (acting) return;
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const isMatured = new Date(loot.expires_at).getTime() <= now;

    // Raid check
    const raided = Math.random() < loot.raid_chance;
    let withdrawAmount = loot.amount;

    if (raided && !isMatured) {
      // Lose 50% to raid
      withdrawAmount = Math.round(loot.amount * 0.5);
    } else if (isMatured) {
      // Bonus for holding to maturity
      withdrawAmount = Math.round(loot.amount * (1 + BONUS_RATE));
    }

    await supabase.from('profiles').update({ cash: cash + withdrawAmount }).eq('id', user.id);
    await supabase.from('held_loot').delete().eq('id', loot.id);

    setActing(false);
    fetchData();

    // Show result feedback (simple alert-style inline)
    if (raided && !isMatured) {
      alert(`🚨 RAIDED! You lost half. Retrieved $${withdrawAmount} of $${loot.amount}.`);
    } else if (isMatured) {
      alert(`💰 Matured! You earned a ${Math.round(BONUS_RATE * 100)}% bonus: $${withdrawAmount}!`);
    }
  };

  const formatCountdown = (expiresAt: string) => {
    const diff = Math.max(0, new Date(expiresAt).getTime() - now);
    if (diff === 0) return 'MATURED';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const totalStashed = heldLoot.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div style={S.page}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
            cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
          }}
        >
          ← BACK TO SAFEHOUSE
        </button>

        <div style={S.eyebrow}>THE VAULT</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.lg }}>HELD LOOT</h1>

        {/* Summary */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>ON HAND</div>
              <div style={{ fontSize: 20, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.gold }}>${cash.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>STASHED</div>
              <div style={{ fontSize: 20, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.sapphire }}>${totalStashed.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Stash form */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>STASH CASH</div>
          <div style={{ fontFamily: THEME.fonts.body, fontSize: 11, color: THEME.colors.textSecondary, fontStyle: 'italic', marginBottom: THEME.space.md, lineHeight: 1.6 }}>
            Lock cash for {HOLD_HOURS}h. Earn {Math.round(BONUS_RATE * 100)}% bonus at maturity.
            Early withdrawal risks a {Math.round(BASE_RAID_CHANCE * 100)}% raid chance (lose 50%).
          </div>
          <div style={{ display: 'flex', gap: THEME.space.sm }}>
            <input
              type="number"
              value={stashAmount}
              onChange={e => setStashAmount(e.target.value)}
              placeholder="Amount..."
              style={{
                flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`,
                borderRadius: THEME.radius.sm, padding: '10px 12px',
                fontFamily: THEME.fonts.mono, fontSize: 13, color: THEME.colors.textPrimary,
                outline: 'none',
              }}
            />
            <button
              onClick={handleStash}
              disabled={!stashAmount || parseInt(stashAmount) <= 0 || parseInt(stashAmount) > cash || acting}
              style={{
                ...S.btnPrimary, width: 'auto', padding: '10px 20px',
                opacity: !stashAmount || parseInt(stashAmount) <= 0 || parseInt(stashAmount) > cash ? 0.4 : 1,
              }}
            >
              {acting ? '...' : 'STASH'}
            </button>
          </div>
          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: THEME.space.xs, marginTop: THEME.space.sm }}>
            {[100, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => setStashAmount(String(Math.min(amt, cash)))}
                disabled={cash < amt}
                style={{
                  flex: 1, background: 'transparent',
                  border: `1px solid ${THEME.colors.borderFaint}`,
                  borderRadius: THEME.radius.sm, padding: '6px',
                  fontFamily: THEME.fonts.mono, fontSize: 10, color: THEME.colors.textMuted,
                  cursor: cash >= amt ? 'pointer' : 'default',
                  opacity: cash >= amt ? 1 : 0.3,
                }}
              >
                ${amt}
              </button>
            ))}
            <button
              onClick={() => setStashAmount(String(cash))}
              disabled={cash <= 0}
              style={{
                flex: 1, background: 'transparent',
                border: `1px solid ${THEME.colors.borderFaint}`,
                borderRadius: THEME.radius.sm, padding: '6px',
                fontFamily: THEME.fonts.mono, fontSize: 10, color: THEME.colors.goldDim,
                cursor: cash > 0 ? 'pointer' : 'default',
                opacity: cash > 0 ? 1 : 0.3,
              }}
            >
              ALL
            </button>
          </div>
        </div>

        {/* Active stashes */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>ACTIVE STASHES</div>
        {heldLoot.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
              No active stashes. Deposit to earn interest.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
            {heldLoot.map(loot => {
              const isMatured = new Date(loot.expires_at).getTime() <= now;
              const maturedAmount = Math.round(loot.amount * (1 + BONUS_RATE));
              const progress = Math.min(100, ((now - new Date(loot.held_at).getTime()) / (new Date(loot.expires_at).getTime() - new Date(loot.held_at).getTime())) * 100);

              return (
                <div key={loot.id} style={{ ...S.card, padding: THEME.space.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.space.sm }}>
                    <div style={{ fontFamily: THEME.fonts.mono, fontSize: 16, fontWeight: 700, color: THEME.colors.gold }}>
                      ${loot.amount.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 2,
                      padding: '3px 8px', borderRadius: THEME.radius.pill,
                      background: isMatured ? `${THEME.colors.emerald}20` : `${THEME.colors.warning}15`,
                      color: isMatured ? THEME.colors.emerald : THEME.colors.warning,
                      border: `1px solid ${isMatured ? THEME.colors.emerald : THEME.colors.warning}40`,
                    }}>
                      {isMatured ? '✓ MATURED' : formatCountdown(loot.expires_at)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 3, background: THEME.colors.borderFaint, borderRadius: 2, marginBottom: THEME.space.sm, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${progress}%`,
                      background: isMatured ? THEME.colors.emerald : THEME.colors.gold,
                      borderRadius: 2, transition: 'width 1s linear',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                      {isMatured
                        ? `Withdraw: $${maturedAmount} (+${Math.round(BONUS_RATE * 100)}%)`
                        : `Raid risk: ${Math.round(loot.raid_chance * 100)}%`}
                    </div>
                    <button
                      onClick={() => handleWithdraw(loot)}
                      disabled={acting}
                      style={{
                        fontSize: 9, fontFamily: THEME.fonts.display, letterSpacing: 2,
                        padding: '4px 12px', borderRadius: THEME.radius.sm,
                        background: isMatured ? `${THEME.colors.emerald}15` : 'transparent',
                        color: isMatured ? THEME.colors.emerald : THEME.colors.textMuted,
                        border: `1px solid ${isMatured ? THEME.colors.emerald : THEME.colors.borderFaint}40`,
                        cursor: 'pointer',
                      }}
                    >
                      WITHDRAW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeldLootScreen;
