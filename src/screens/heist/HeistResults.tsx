import { useState, useEffect, useRef } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS, CREW_MEMBERS, REP_THRESHOLDS } from '@/lib/gameData';
import { resolveHeist, calculateRepLevel, calculateFenceOffer } from '@/lib/heistEngine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import { SFX, Haptics } from '@/lib/sounds';

interface HeistResultsProps {
  vault: typeof VAULTS[number];
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  miniGameResults: boolean[];
  onFinish: () => void;
}

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};
const jewelColors: Record<string, string> = {
  pearl: THEME.colors.pearl, sapphire: THEME.colors.sapphire,
  emerald: THEME.colors.emerald, ruby: THEME.colors.ruby, diamond: THEME.colors.diamond,
};
const jewelLabels: Record<string, string> = {
  pearl: 'PEARL', sapphire: 'SAPPHIRE', emerald: 'EMERALD', ruby: 'RUBY', diamond: 'DIAMOND',
};

// Animated number counter hook
function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (target === 0) { setValue(0); return; }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

type Phase = 'flash' | 'headline' | 'payout' | 'jewels' | 'ledger' | 'fence' | 'saving' | 'done';

const HeistResults = ({ vault, crewIds, chaosCard, miniGameResults, onFinish }: HeistResultsProps) => {
  const { toast } = useToast();

  // Resolve heist outcome using engine
  const [outcome] = useState(() => resolveHeist({
    vault, crewIds, chaosCard, miniGameResults,
  }));

  const success = !outcome.busted;
  const payout = outcome.payout;
  const xpGained = outcome.xpGained;
  const jewelDrops = outcome.jewelsFound as Record<string, number>;
  const hasJewels = Object.values(jewelDrops).some(v => v > 0);
  const fenceOffer = success && payout > 0 ? calculateFenceOffer(payout, vault.tier) : null;

  const [phase, setPhase] = useState<Phase>('flash');
  const [flashOpacity, setFlashOpacity] = useState(1);
  const [sirenPhase, setSirenPhase] = useState(0);
  const [revealedJewels, setRevealedJewels] = useState<string[]>([]);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevelInfo, setNewLevelInfo] = useState<{ level: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [fenceChoice, setFenceChoice] = useState<'cash' | 'hold' | null>(null);

  const countedPayout = useCountUp(payout, 1500, phase !== 'flash');

  // Phase sequencing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Flash phase
    timers.push(setTimeout(() => {
      setFlashOpacity(0);
      setPhase('headline');
    }, 600));

    // Payout phase
    timers.push(setTimeout(() => { setPhase('payout'); if (success && payout > 0) SFX.cashPayout(); }, 1800));

    // Jewels phase
    if (hasJewels) {
      timers.push(setTimeout(() => setPhase('jewels'), 3600));
      // Reveal jewels one by one
      const jewelEntries = Object.entries(jewelDrops).filter(([, c]) => c > 0);
      jewelEntries.forEach(([jewel], i) => {
        timers.push(setTimeout(() => {
          setRevealedJewels(prev => [...prev, jewel]);
          SFX.jewelDrop();
          Haptics.jewelDrop();
        }, 3900 + i * 500));
      });
      timers.push(setTimeout(() => setPhase('ledger'), 3900 + jewelEntries.length * 500 + 800));
    } else {
      timers.push(setTimeout(() => setPhase('ledger'), 3600));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Siren animation for failure
  useEffect(() => {
    if (!success && (phase === 'headline' || phase === 'payout' || phase === 'ledger')) {
      const interval = setInterval(() => setSirenPhase(p => (p + 1) % 4), 400);
      return () => clearInterval(interval);
    }
  }, [success, phase]);

  // Auto-save after ledger shows (if no fence offer)
  useEffect(() => {
    if (phase === 'ledger' && !fenceOffer) {
      const t = setTimeout(() => saveResults('cash'), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const saveResults = async (choice: 'cash' | 'hold') => {
    if (saving) return;
    setSaving(true);
    setPhase('saving');
    setFenceChoice(choice);

    if (demo?.isDemo) {
      // Demo mode: update local state
      const currentJewels = { ...demo.profile.jewels };
      Object.entries(jewelDrops).forEach(([jewel, count]) => {
        currentJewels[jewel] = (currentJewels[jewel] || 0) + count;
      });
      const { newXp, newLevel, newTitle } = calculateRepLevel(demo.profile.rep_xp, xpGained);
      if (newLevel > demo.profile.rep_level) {
        setLeveledUp(true);
        setNewLevelInfo({ level: newLevel, title: newTitle });
      }
      let cashDelta = -vault.buyIn;
      if (choice === 'cash') cashDelta += payout;
      demo.updateProfile({
        cash: Math.max(0, demo.profile.cash + cashDelta),
        jewels: currentJewels,
        rep_xp: newXp,
        rep_level: newLevel,
        notoriety_title: newTitle,
      });
      if (choice === 'hold' && fenceOffer) {
        demo.addHeldLoot({
          id: crypto.randomUUID(),
          amount: fenceOffer.holdPayout,
          held_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + fenceOffer.holdHours * 60 * 60 * 1000).toISOString(),
          raid_chance: fenceOffer.raidChance,
        });
      }
      demo.addHeist({
        vault_name: vault.name, vault_tier: vault.tier, city_id: vault.city,
        crew_ids: crewIds, success, payout: choice === 'cash' ? payout : 0,
        cash_spent: vault.buyIn, jewel_drops: jewelDrops, created_at: new Date().toISOString(),
      });
      if (success && choice === 'cash' && payout > 0) {
        toast({ title: `⬆ +$${payout.toLocaleString()}`, description: 'Cash secured.' });
      }
      Object.entries(jewelDrops).forEach(([jewel, count]) => {
        if (count > 0) toast({ title: `${jewelEmojis[jewel]} ${jewelLabels[jewel]} FOUND`, description: `×${count}` });
      });
      setSaving(false);
      setPhase('done');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return;

    // Jewels
    const currentJewels = profile.jewels as Record<string, number>;
    const newJewels = { ...currentJewels };
    Object.entries(jewelDrops).forEach(([jewel, count]) => {
      newJewels[jewel] = (newJewels[jewel] || 0) + count;
    });

    // Rep
    const { newXp, newLevel, newTitle } = calculateRepLevel(profile.rep_xp, xpGained);
    if (newLevel > profile.rep_level) {
      setLeveledUp(true);
      setNewLevelInfo({ level: newLevel, title: newTitle });
    }

    // Cash
    let cashDelta = -vault.buyIn;
    if (choice === 'cash') {
      cashDelta += payout;
    }
    const newCash = Math.max(0, profile.cash + cashDelta);

    // Update profile
    await supabase.from('profiles').update({
      cash: newCash,
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
      payout: choice === 'cash' ? payout : 0,
      cash_spent: vault.buyIn,
      success,
      jewel_drops: jewelDrops as unknown as Json,
    });

    // If holding, create held_loot row
    if (choice === 'hold' && fenceOffer) {
      const expiresAt = new Date(Date.now() + fenceOffer.holdHours * 60 * 60 * 1000).toISOString();
      await supabase.from('held_loot').insert({
        user_id: user.id,
        amount: fenceOffer.holdPayout,
        expires_at: expiresAt,
        raid_chance: fenceOffer.raidChance,
      });
    }

    // Loyalty changes
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

    // Weekly leaderboard
    const netEarned = (choice === 'cash' ? payout : 0) - vault.buyIn;
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

    // Toasts
    if (success && choice === 'cash' && payout > 0) {
      toast({ title: `⬆ +$${payout.toLocaleString()}`, description: 'Cash secured.' });
    }
    if (choice === 'hold' && fenceOffer) {
      toast({ title: `💰 $${fenceOffer.holdPayout.toLocaleString()} held`, description: `Collect in ${fenceOffer.holdHours}h. ${Math.round(fenceOffer.raidChance * 100)}% raid risk.` });
    }
    Object.entries(jewelDrops).forEach(([jewel, count]) => {
      if (count > 0) {
        toast({ title: `${jewelEmojis[jewel]} ${jewelLabels[jewel]} FOUND`, description: `×${count}` });
      }
    });

    setSaving(false);
    setPhase('done');
  };

  const net = payout - vault.buyIn;
  const raidColor = fenceOffer
    ? fenceOffer.raidChance < 0.08 ? THEME.colors.emerald
      : fenceOffer.raidChance <= 0.15 ? THEME.colors.gold
        : THEME.colors.ruby
    : THEME.colors.gold;

  // Siren background tint
  const sirenBg = !success
    ? sirenPhase % 2 === 0
      ? `${THEME.colors.ruby}08`
      : `${THEME.colors.sapphire}06`
    : 'transparent';

  return (
    <div style={{
      ...S.page, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      minHeight: '100vh', padding: THEME.space.lg,
      paddingTop: THEME.space.xxl,
      background: `${THEME.colors.void}`,
      transition: 'background 0.4s',
    }}>
      {/* Siren tint overlay for failures */}
      {!success && phase !== 'flash' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: sirenBg, transition: 'background 0.3s',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}

      {/* Initial flash */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: success ? THEME.colors.gold : THEME.colors.ruby,
        opacity: flashOpacity,
        transition: 'opacity 0.6s ease-out',
        pointerEvents: 'none', zIndex: 100,
      }} />

      <div style={{ maxWidth: 380, width: '100%', position: 'relative', zIndex: 2 }}>

        {/* HEADLINE */}
        {phase !== 'flash' && (
          <div style={{
            textAlign: 'center', marginBottom: THEME.space.xl,
            animation: 'resultSlam 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            <div style={{
              fontSize: 56, marginBottom: THEME.space.sm,
              filter: `drop-shadow(0 0 30px ${success ? THEME.colors.emerald : THEME.colors.ruby}50)`,
            }}>
              {success ? '💰' : '🚨'}
            </div>
            <h1 style={{
              ...S.h1,
              fontSize: success ? 28 : 36,
              color: success ? THEME.colors.emerald : THEME.colors.ruby,
              textShadow: `0 0 40px ${success ? THEME.colors.emerald : THEME.colors.ruby}40`,
              marginBottom: THEME.space.xs,
            }}>
              {success ? 'HEIST SUCCESSFUL' : 'BUSTED'}
            </h1>
            <div style={{
              fontFamily: THEME.fonts.body, fontSize: 13, fontStyle: 'italic',
              color: THEME.colors.textSecondary,
            }}>
              {success
                ? `Clean getaway from ${vault.name}.`
                : `The ${vault.name} job went sideways.`}
            </div>
          </div>
        )}

        {/* ANIMATED CASH COUNTER */}
        {(phase === 'payout' || phase === 'jewels' || phase === 'ledger' || phase === 'fence' || phase === 'done' || phase === 'saving') && success && payout > 0 && (
          <div style={{
            textAlign: 'center', marginBottom: THEME.space.lg,
            animation: 'fadeSlideUp 0.5s ease-out',
          }}>
            <div style={{
              fontSize: 42, fontFamily: THEME.fonts.mono, fontWeight: 700,
              color: THEME.colors.gold,
              textShadow: `0 0 30px ${THEME.colors.gold}40`,
              letterSpacing: -1,
            }}>
              ${countedPayout.toLocaleString()}
            </div>
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim,
              letterSpacing: 4, marginTop: 4,
            }}>
              PAYOUT
            </div>
          </div>
        )}

        {/* JEWEL DROPS — pop in one by one */}
        {(phase === 'jewels' || phase === 'ledger' || phase === 'fence' || phase === 'done' || phase === 'saving') && hasJewels && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: THEME.space.lg,
            marginBottom: THEME.space.lg,
          }}>
            {revealedJewels.map((jewel) => (
              <div key={jewel} style={{
                textAlign: 'center',
                animation: 'jewelPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <div style={{
                  fontSize: 36,
                  filter: `drop-shadow(0 0 12px ${jewelColors[jewel]}60)`,
                }}>
                  {jewelEmojis[jewel]}
                </div>
                <div style={{
                  fontSize: 10, fontFamily: THEME.fonts.mono,
                  color: jewelColors[jewel], letterSpacing: 1, marginTop: 4,
                }}>
                  ×{jewelDrops[jewel]}
                </div>
                <div style={{
                  fontSize: 8, fontFamily: THEME.fonts.display,
                  color: jewelColors[jewel], letterSpacing: 2, opacity: 0.7,
                }}>
                  {jewelLabels[jewel]}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEDGER / CASE FILE */}
        {(phase === 'ledger' || phase === 'fence' || phase === 'done' || phase === 'saving') && (
          <div style={{
            ...S.card, marginBottom: THEME.space.md,
            animation: 'fadeSlideUp 0.4s ease-out',
            borderTop: `2px solid ${THEME.colors.borderMid}`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Torn paper edge effect */}
            <div style={{
              position: 'absolute', top: -1, left: 0, right: 0, height: 3,
              background: `repeating-linear-gradient(90deg, ${THEME.colors.ink} 0px, ${THEME.colors.ink} 4px, transparent 4px, transparent 8px)`,
            }} />

            <div style={{ ...S.eyebrow, fontSize: 9, marginBottom: THEME.space.md }}>
              CASE FILE #{Math.floor(Math.random() * 9000 + 1000)}
            </div>

            {/* Mini-game results */}
            <div style={{ display: 'flex', gap: 6, marginBottom: THEME.space.md }}>
              {miniGameResults.map((r, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: THEME.radius.sm,
                  background: r ? `${THEME.colors.emerald}15` : `${THEME.colors.ruby}15`,
                  border: `1px solid ${r ? THEME.colors.emerald : THEME.colors.ruby}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: r ? THEME.colors.emerald : THEME.colors.ruby,
                }}>
                  {r ? '✓' : '✗'}
                </div>
              ))}
            </div>

            <LedgerRow label="TARGET" value={vault.name} color={THEME.colors.textPrimary} />
            <LedgerRow label="CREW" value={crewIds.length > 0 ? `${crewIds.length} hired` : 'Solo'} color={THEME.colors.textSecondary} />
            <LedgerRow label="CHAOS" value={chaosCard.name} color={THEME.colors.textSecondary} />
            <LedgerRow label="RISK" value={`${Math.round(outcome.finalFailChance * 100)}%`} color={THEME.colors.textMuted} />

            <div style={S.divider} />

            <LedgerRow label="INVESTED" value={`-$${vault.buyIn}`} color={THEME.colors.ruby} />
            <LedgerRow label="PAYOUT" value={success ? `+$${payout.toLocaleString()}` : '$0'} color={success ? THEME.colors.emerald : THEME.colors.textMuted} />

            <div style={S.divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary, letterSpacing: 3 }}>NET</span>
              <span style={{
                fontSize: 20, fontFamily: THEME.fonts.mono, fontWeight: 700,
                color: net >= 0 ? THEME.colors.emerald : THEME.colors.ruby,
              }}>
                {net >= 0 ? '+' : ''}${net.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* XP GAIN — floats up */}
        {(phase === 'ledger' || phase === 'fence' || phase === 'done' || phase === 'saving') && (
          <div style={{
            textAlign: 'center', marginBottom: THEME.space.md,
            animation: 'xpFloat 0.6s ease-out',
          }}>
            <span style={{
              fontSize: 14, fontFamily: THEME.fonts.mono, color: THEME.colors.gold,
              letterSpacing: 1, fontWeight: 700,
            }}>
              +{xpGained} REP XP
            </span>
          </div>
        )}

        {/* LEVEL UP celebration */}
        {leveledUp && newLevelInfo && phase === 'done' && (
          <div style={{
            textAlign: 'center', padding: THEME.space.lg,
            background: `${THEME.colors.gold}10`,
            border: `1px solid ${THEME.colors.gold}30`,
            borderRadius: THEME.radius.md,
            marginBottom: THEME.space.md,
            animation: 'levelUpFlash 0.6s ease-out',
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>⭐</div>
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 16,
              color: THEME.colors.gold, letterSpacing: 3,
            }}>
              REP LEVEL {newLevelInfo.level}
            </div>
            <div style={{
              fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic',
              color: THEME.colors.goldMid, marginTop: 4,
            }}>
              "{newLevelInfo.title}"
            </div>
          </div>
        )}

        {/* FENCE OFFER — slides up from bottom */}
        {phase === 'ledger' && fenceOffer && success && payout > 0 && (
          <div style={{
            ...S.card, marginBottom: THEME.space.md,
            border: `1px solid ${THEME.colors.gold}30`,
            animation: 'fenceSlideUp 0.5s ease-out',
          }}>
            <div style={{
              ...S.eyebrow, color: THEME.colors.goldMid, marginBottom: THEME.space.md,
            }}>
              THE FENCE IS INTERESTED
            </div>

            <div style={{ display: 'flex', gap: THEME.space.sm, marginBottom: THEME.space.md }}>
              {/* Cash out option */}
              <div style={{
                flex: 1, padding: THEME.space.md,
                background: THEME.colors.shadow, borderRadius: THEME.radius.sm,
                border: `1px solid ${THEME.colors.borderFaint}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>
                  CASH OUT
                </div>
                <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald, fontWeight: 700 }}>
                  ${payout.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginTop: 4 }}>
                  NOW
                </div>
              </div>

              {/* Hold option */}
              <div style={{
                flex: 1, padding: THEME.space.md,
                background: THEME.colors.shadow, borderRadius: THEME.radius.sm,
                border: `1px solid ${THEME.colors.gold}20`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim, letterSpacing: 2, marginBottom: 4 }}>
                  HOLD {fenceOffer.holdHours}H
                </div>
                <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, fontWeight: 700 }}>
                  ${fenceOffer.holdPayout.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: raidColor, marginTop: 4 }}>
                  {Math.round(fenceOffer.raidChance * 100)}% RAID RISK
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: THEME.space.sm }}>
              <button
                onClick={() => saveResults('cash')}
                disabled={saving}
                style={{ ...S.btnPrimary, flex: 1, fontSize: 11, padding: '12px 16px' }}
              >
                CASH OUT
              </button>
              <button
                onClick={() => saveResults('hold')}
                disabled={saving}
                style={{ ...S.btnGhost, flex: 1, fontSize: 11, padding: '12px 16px', color: THEME.colors.gold, borderColor: `${THEME.colors.gold}40` }}
              >
                HOLD FOR MORE
              </button>
            </div>
          </div>
        )}

        {/* SAVING STATE */}
        {phase === 'saving' && (
          <div style={{
            textAlign: 'center', padding: THEME.space.lg,
            fontFamily: THEME.fonts.display, fontSize: 12,
            color: THEME.colors.goldMid, letterSpacing: 3,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            SECURING THE TAKE...
          </div>
        )}

        {/* RETURN BUTTON */}
        {phase === 'done' && (
          <button
            onClick={onFinish}
            style={{
              ...S.btnPrimary,
              boxShadow: THEME.shadows.gold,
              animation: 'fadeSlideUp 0.3s ease-out',
            }}
          >
            RETURN TO SAFEHOUSE
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes resultSlam {
          0% { transform: scale(2.5) translateY(-20px); opacity: 0; }
          60% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes jewelPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes xpFloat {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fenceSlideUp {
          0% { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes levelUpFlash {
          0% { background: ${THEME.colors.gold}40; transform: scale(0.9); }
          50% { background: ${THEME.colors.gold}20; }
          100% { background: ${THEME.colors.gold}10; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// Ledger row helper
const LedgerRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
    <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color }}>{value}</span>
  </div>
);

export default HeistResults;
