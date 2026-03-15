import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { REP_THRESHOLDS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';

interface ProfileScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface ProfileData {
  display_name: string;
  cash: number;
  rep_level: number;
  rep_xp: number;
  notoriety_title: string;
  jewels: Record<string, number>;
  unlocked_cities: string[];
  created_at: string | null;
}

interface HeistRow {
  vault_name: string | null;
  vault_tier: number | null;
  success: boolean | null;
  payout: number | null;
  cash_spent: number | null;
  created_at: string | null;
  city_id: string | null;
}

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};
const jewelLabels: Record<string, string> = {
  pearl: 'Pearl', sapphire: 'Sapphire', emerald: 'Emerald', ruby: 'Ruby', diamond: 'Diamond',
};

const ProfileScreen = ({ activeTab, onTabChange }: ProfileScreenProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [heists, setHeists] = useState<HeistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, heistRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('heist_history').select('vault_name, vault_tier, success, payout, cash_spent, created_at, city_id')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          jewels: profileRes.data.jewels as Record<string, number>,
        });
      }
      if (heistRes.data) setHeists(heistRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
  };

  if (loading || !profile) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  // Rep progress
  const currentThreshold = REP_THRESHOLDS.find(t => t.level === profile.rep_level);
  const nextThreshold = REP_THRESHOLDS.find(t => t.level === profile.rep_level + 1);
  const repProgress = nextThreshold
    ? ((profile.rep_xp - (currentThreshold?.xpRequired || 0)) / ((nextThreshold.xpRequired) - (currentThreshold?.xpRequired || 0))) * 100
    : 100;

  // Stats
  const totalHeists = heists.length;
  const successfulHeists = heists.filter(h => h.success).length;
  const successRate = totalHeists > 0 ? Math.round((successfulHeists / totalHeists) * 100) : 0;
  const totalEarned = heists.reduce((sum, h) => sum + (h.success ? (h.payout || 0) : 0), 0);
  const totalSpent = heists.reduce((sum, h) => sum + (h.cash_spent || 0), 0);
  const netProfit = totalEarned - totalSpent;
  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={S.page} className="screen-enter">
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>

        {/* Identity card */}
        <div style={{ ...S.card, textAlign: 'center', marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 200, borderRadius: '50%',
            background: `${THEME.colors.gold}06`, filter: 'blur(60px)',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: THEME.space.sm }}>🎭</div>
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 22, color: THEME.colors.gold,
              letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
              textShadow: `0 0 30px ${THEME.colors.gold}20`,
            }}>
              {profile.display_name}
            </div>
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.display, letterSpacing: 3,
              color: THEME.colors.textMuted, textTransform: 'uppercase', marginBottom: THEME.space.md,
            }}>
              {profile.notoriety_title}
            </div>

            {/* Rep bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: THEME.space.xs }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim, letterSpacing: 2 }}>
                REP {profile.rep_level}
              </span>
              <div style={{ width: 120, height: 4, background: THEME.colors.borderFaint, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.min(repProgress, 100)}%`,
                  background: THEME.colors.gold, borderRadius: 2, transition: 'width 0.5s',
                }} />
              </div>
              {nextThreshold && (
                <span style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                  {profile.rep_xp}/{nextThreshold.xpRequired} XP
                </span>
              )}
            </div>
            <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
              Member since {memberSince}
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>WALLET</div>
          <div style={{
            fontSize: 28, fontFamily: THEME.fonts.mono, fontWeight: 700,
            color: THEME.colors.gold, textAlign: 'center', marginBottom: THEME.space.md,
            textShadow: `0 0 20px ${THEME.colors.gold}15`,
          }}>
            ${profile.cash.toLocaleString()}
          </div>

          {/* Jewels */}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {Object.entries(profile.jewels).map(([jewel, count]) => (
              <div key={jewel} style={{ textAlign: 'center', opacity: count > 0 ? 1 : 0.25 }}>
                <div style={{ fontSize: 22, marginBottom: 2 }}>{jewelEmojis[jewel]}</div>
                <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.textPrimary, fontWeight: 700 }}>
                  {count}
                </div>
                <div style={{ fontSize: 7, fontFamily: THEME.fonts.display, color: THEME.colors.textMuted, letterSpacing: 1 }}>
                  {jewelLabels[jewel]?.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime stats */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>LIFETIME STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: THEME.space.md }}>
            {[
              { label: 'HEISTS', value: totalHeists.toString(), color: THEME.colors.textPrimary },
              { label: 'SUCCESS RATE', value: `${successRate}%`, color: successRate >= 50 ? THEME.colors.emerald : THEME.colors.ruby },
              { label: 'TOTAL EARNED', value: `$${totalEarned.toLocaleString()}`, color: THEME.colors.emerald },
              { label: 'NET PROFIT', value: `${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`, color: netProfit >= 0 ? THEME.colors.emerald : THEME.colors.ruby },
              { label: 'CITIES UNLOCKED', value: profile.unlocked_cities.length.toString(), color: THEME.colors.sapphire },
              { label: 'TOTAL SPENT', value: `$${totalSpent.toLocaleString()}`, color: THEME.colors.ruby },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontFamily: THEME.fonts.mono, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heist history */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>RECENT HEISTS</div>
        {heists.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
              No heists yet. Hit the Job Board.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs, marginBottom: THEME.space.xl }}>
            {heists.map((h, i) => (
              <div key={i} style={{
                ...S.card, padding: `${THEME.space.sm}px ${THEME.space.md}px`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm }}>
                  <span style={{ fontSize: 14 }}>{h.success ? '✅' : '❌'}</span>
                  <div>
                    <div style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                      {h.vault_name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                      {h.created_at ? new Date(h.created_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 12, fontFamily: THEME.fonts.mono, fontWeight: 700,
                  color: h.success ? THEME.colors.emerald : THEME.colors.ruby,
                }}>
                  {h.success ? `+$${(h.payout || 0) - (h.cash_spent || 0)}` : `-$${h.cash_spent || 0}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ ...S.btnGhost, color: THEME.colors.ruby, borderColor: `${THEME.colors.ruby}30` }}
        >
          {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
        </button>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default ProfileScreen;
