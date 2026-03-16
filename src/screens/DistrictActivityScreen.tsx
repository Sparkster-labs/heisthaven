import { useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { DISTRICT_ACTIVITIES, GAMBLING_CONFIG, FENCE_RATES, TRAINING_COST, INTEL_COST } from '@/lib/districtActivities';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DistrictActivityScreenProps {
  districtId: string;
  districtName: string;
  cityColor: string;
  onBack: () => void;
}

const jewelEmojis: Record<string, string> = { pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎' };

const DistrictActivityScreen = ({ districtId, districtName, cityColor, onBack }: DistrictActivityScreenProps) => {
  const [cash, setCash] = useState(0);
  const [jewels, setJewels] = useState<Record<string, number>>({});
  const [acting, setActing] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [gamblingResult, setGamblingResult] = useState<{ won: boolean; amount: number } | null>(null);
  const [selectedFenceJewel, setSelectedFenceJewel] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const activities = DISTRICT_ACTIVITIES[districtId] || [];
  const gamblingConfig = GAMBLING_CONFIG[districtId];
  const fenceRates = FENCE_RATES[districtId];

  // Load profile data
  useState(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('cash, jewels').eq('id', user.id).single();
      if (data) {
        setCash(data.cash);
        setJewels(data.jewels as Record<string, number>);
      }
      setLoaded(true);
    };
    load();
  });

  const handleGamble = async () => {
    const bet = parseInt(betAmount);
    if (!bet || bet <= 0 || bet > cash || !gamblingConfig || acting) return;
    if (bet < gamblingConfig.minBet || bet > gamblingConfig.maxBet) return;

    setActing(true);
    const won = Math.random() < gamblingConfig.winChance;
    const payout = won ? Math.round(bet * gamblingConfig.multiplier) : 0;
    const netChange = won ? payout - bet : -bet;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash + netChange }).eq('id', user.id);
    setCash(cash + netChange);
    setGamblingResult({ won, amount: won ? payout : bet });
    setBetAmount('');
    setActing(false);

    if (won) {
      toast({ title: '🎉 YOU WON!', description: `+$${payout.toLocaleString()}` });
    } else {
      toast({ title: '💸 You lost.', description: `-$${bet.toLocaleString()}` });
    }
  };

  const handleSellJewel = async (jewelType: string) => {
    if (acting || !fenceRates || !fenceRates[jewelType]) return;
    const count = jewels[jewelType] || 0;
    if (count <= 0) return;

    setActing(true);
    const salePrice = fenceRates[jewelType];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const newJewels = { ...jewels, [jewelType]: count - 1 };
    await supabase.from('profiles').update({
      cash: cash + salePrice,
      jewels: newJewels as any,
    }).eq('id', user.id);

    setCash(cash + salePrice);
    setJewels(newJewels);
    setActing(false);
    toast({ title: `${jewelEmojis[jewelType]} Sold!`, description: `+$${salePrice.toLocaleString()}` });
  };

  const handleTraining = async (type: 'level_up' | 'loyalty_boost') => {
    if (acting) return;
    const cost = type === 'level_up' ? TRAINING_COST.level_up : TRAINING_COST.loyalty_boost;
    if (cash < cost) { toast({ title: 'Insufficient funds' }); return; }

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash - cost }).eq('id', user.id);

    // Boost random crew member
    const { data: crewData } = await supabase.from('crew_state').select('id, level, loyalty').eq('user_id', user.id);
    if (crewData && crewData.length > 0) {
      const target = crewData[Math.floor(Math.random() * crewData.length)];
      if (type === 'level_up') {
        await supabase.from('crew_state').update({ level: target.level + 1 }).eq('id', target.id);
      } else {
        await supabase.from('crew_state').update({ loyalty: Math.min(100, target.loyalty + 5) }).eq('id', target.id);
      }
    }

    setCash(cash - cost);
    setActing(false);
    toast({
      title: type === 'level_up' ? '⬆ Crew Member Leveled Up!' : '❤️ Loyalty Boosted!',
      description: `Cost: $${cost}`,
    });
  };

  const handleIntel = async (type: string) => {
    if (acting) return;
    const cost = type === 'vault_info' ? INTEL_COST.vault_info : type === 'chaos_preview' ? INTEL_COST.chaos_preview : INTEL_COST.district_heat_reset;
    if (cash < cost) { toast({ title: 'Insufficient funds' }); return; }

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash - cost }).eq('id', user.id);
    setCash(cash - cost);
    setActing(false);

    const messages: Record<string, string> = {
      vault_info: '📋 Intel acquired. Security details will be shown on your next job.',
      chaos_preview: '🔮 Chaos forecast available for your next heist.',
      district_heat_reset: '❄️ District heat has been cooled down.',
    };
    toast({ title: 'Intel Acquired', description: messages[type] || 'Information received.' });
  };

  return (
    <div style={S.page}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        {/* Back */}
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: THEME.colors.textMuted,
          fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
          cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
        }}>
          ← BACK TO MAP
        </button>

        <div style={{ ...S.eyebrow, color: cityColor }}>{districtName.toUpperCase()}</div>
        <h1 style={{ ...S.h1, fontSize: 20, marginBottom: THEME.space.sm, color: cityColor }}>
          DISTRICT ACTIVITIES
        </h1>
        <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, marginBottom: THEME.space.lg }}>
          ${cash.toLocaleString()} on hand
        </div>

        {activities.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🌙</div>
            <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
              Nothing happening here... yet.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.md }}>
          {activities.map(activity => (
            <div key={activity.id} style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
              {/* Accent bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cityColor, borderRadius: '4px 0 0 4px' }} />

              <div style={{ paddingLeft: THEME.space.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm, marginBottom: THEME.space.sm }}>
                  <span style={{ fontSize: 24 }}>{activity.emoji}</span>
                  <div>
                    <div style={{ fontFamily: THEME.fonts.display, fontSize: 13, color: THEME.colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' }}>
                      {activity.name}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.body, color: THEME.colors.textSecondary }}>
                      {activity.description}
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily: THEME.fonts.body, fontSize: 10, fontStyle: 'italic', color: THEME.colors.textMuted, marginBottom: THEME.space.md }}>
                  "{activity.lore}"
                </p>

                {/* GAMBLING UI */}
                {activity.type === 'gambling' && gamblingConfig && (
                  <div>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.sm }}>
                      BET: ${gamblingConfig.minBet}–${gamblingConfig.maxBet} | WIN: {Math.round(gamblingConfig.winChance * 100)}% | PAYOUT: {gamblingConfig.multiplier}x
                    </div>
                    <div style={{ display: 'flex', gap: THEME.space.sm }}>
                      <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                        placeholder={`$${gamblingConfig.minBet}+`}
                        style={{
                          flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`,
                          borderRadius: THEME.radius.sm, padding: '8px 12px',
                          fontFamily: THEME.fonts.mono, fontSize: 12, color: THEME.colors.textPrimary, outline: 'none',
                        }}
                      />
                      <button onClick={handleGamble} disabled={acting || !betAmount} style={{
                        ...S.btnPrimary, width: 'auto', padding: '8px 16px', fontSize: 10,
                      }}>
                        {acting ? '...' : 'BET'}
                      </button>
                    </div>
                    {gamblingResult && (
                      <div style={{
                        marginTop: THEME.space.sm, padding: THEME.space.sm, borderRadius: THEME.radius.sm,
                        background: gamblingResult.won ? `${THEME.colors.emerald}10` : `${THEME.colors.ruby}10`,
                        color: gamblingResult.won ? THEME.colors.emerald : THEME.colors.ruby,
                        fontSize: 11, fontFamily: THEME.fonts.display, textAlign: 'center', letterSpacing: 2,
                      }}>
                        {gamblingResult.won ? `🎉 WON $${gamblingResult.amount}` : `💸 LOST $${gamblingResult.amount}`}
                      </div>
                    )}
                  </div>
                )}

                {/* FENCE UI */}
                {activity.type === 'fence' && fenceRates && (
                  <div>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.sm }}>
                      SELL JEWELS FOR CASH
                    </div>
                    <div style={{ display: 'flex', gap: THEME.space.xs, flexWrap: 'wrap' }}>
                      {Object.entries(fenceRates).map(([type, price]) => {
                        const count = jewels[type] || 0;
                        return (
                          <button key={type} onClick={() => handleSellJewel(type)} disabled={count <= 0 || acting}
                            style={{
                              padding: '6px 12px', borderRadius: THEME.radius.sm, cursor: count > 0 ? 'pointer' : 'default',
                              background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`,
                              opacity: count > 0 ? 1 : 0.3, fontSize: 10, fontFamily: THEME.fonts.mono,
                              color: THEME.colors.textPrimary, display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                            {jewelEmojis[type]}{count} → ${price}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TRAINING UI */}
                {activity.type === 'training' && (
                  <div style={{ display: 'flex', gap: THEME.space.sm }}>
                    <button onClick={() => handleTraining('level_up')} disabled={acting || cash < TRAINING_COST.level_up}
                      style={{ ...S.btnPrimary, flex: 1, fontSize: 9, padding: '8px', opacity: cash < TRAINING_COST.level_up ? 0.4 : 1 }}>
                      ⬆ LEVEL UP (${TRAINING_COST.level_up})
                    </button>
                    <button onClick={() => handleTraining('loyalty_boost')} disabled={acting || cash < TRAINING_COST.loyalty_boost}
                      style={{ ...S.btnGhost, flex: 1, fontSize: 9, padding: '8px', opacity: cash < TRAINING_COST.loyalty_boost ? 0.4 : 1 }}>
                      ❤️ LOYALTY (${TRAINING_COST.loyalty_boost})
                    </button>
                  </div>
                )}

                {/* INTEL UI */}
                {activity.type === 'intel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs }}>
                    {[
                      { type: 'vault_info', label: 'VAULT INTEL', cost: INTEL_COST.vault_info, emoji: '📋' },
                      { type: 'chaos_preview', label: 'CHAOS FORECAST', cost: INTEL_COST.chaos_preview, emoji: '🔮' },
                      { type: 'heat_reset', label: 'COOL HEAT', cost: INTEL_COST.district_heat_reset, emoji: '❄️' },
                    ].map(item => (
                      <button key={item.type} onClick={() => handleIntel(item.type)}
                        disabled={acting || cash < item.cost}
                        style={{
                          ...S.btnGhost, fontSize: 9, padding: '8px 12px',
                          display: 'flex', justifyContent: 'space-between',
                          opacity: cash < item.cost ? 0.4 : 1,
                        }}>
                        <span>{item.emoji} {item.label}</span>
                        <span style={{ color: THEME.colors.gold }}>${item.cost}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* SHOP UI */}
                {activity.type === 'shop' && (
                  <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                    Visit the Black Market or Empire screen for purchases.
                  </div>
                )}

                {/* RECRUITMENT UI */}
                {activity.type === 'recruitment' && (
                  <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                    Visit the Crew screen to recruit new members.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistrictActivityScreen;
