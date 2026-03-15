import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { REP_THRESHOLDS, CREW_MEMBERS } from '@/lib/gameData';
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
  crew_ids: string[] | null;
  jewel_drops: Record<string, number> | null;
}

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};
const jewelColors: Record<string, string> = {
  pearl: THEME.colors.pearl, sapphire: THEME.colors.sapphire,
  emerald: THEME.colors.emerald, ruby: THEME.colors.ruby, diamond: THEME.colors.diamond,
};
const jewelLabels: Record<string, string> = {
  pearl: 'Pearl', sapphire: 'Sapphire', emerald: 'Emerald', ruby: 'Ruby', diamond: 'Diamond',
};
const jewelRarities: Record<string, string> = {
  pearl: 'Common', sapphire: 'Uncommon', emerald: 'Rare', ruby: 'Epic', diamond: 'Legendary',
};
const jewelCities: Record<string, string> = {
  pearl: 'New Cavendish', sapphire: 'New Cavendish / Shadowport',
  emerald: 'Shadowport / Ironhollow', ruby: 'Ironhollow / Verenthia', diamond: 'Verenthia',
};
const jewelLore: Record<string, string> = {
  pearl: 'Pulled from the harbor at dawn. Common as dirt, but every fortune starts small.',
  sapphire: 'The merchant\'s favorite. Worth enough to buy silence, not enough to buy loyalty.',
  emerald: 'Smuggled through the undercity in velvet pouches. Each one represents a debt collected.',
  ruby: 'Blood-red and twice as valuable. The currency of warlords and the desperate.',
  diamond: 'Verenthia\'s crown jewel. Wars have been fought over lesser stones.',
};
const jewelUses: Record<string, string[]> = {
  pearl: ['Cool district heat', 'Re-roll chaos cards', 'Parlor unlock'],
  sapphire: ['War Room Tier 3 upgrade', 'Loyalty boosts', 'City unlocks'],
  emerald: ['Vault Tier 3 upgrade', 'Parlor unlock', 'City unlocks'],
  ruby: ['Parlor upgrades', 'Penthouse unlock', 'City unlocks'],
  diamond: ['Penthouse upgrades', 'Crew level-ups', 'Endgame content'],
};

// Title tier colors
const titleColor = (level: number) => {
  if (level >= 10) return THEME.colors.diamond;
  if (level >= 7) return THEME.colors.ruby;
  if (level >= 4) return THEME.colors.emerald;
  return THEME.colors.gold;
};

const ProfileScreen = ({ activeTab, onTabChange }: ProfileScreenProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [heists, setHeists] = useState<HeistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [selectedJewel, setSelectedJewel] = useState<string | null>(null);
  const [showTitles, setShowTitles] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [profileRes, heistRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('heist_history').select('vault_name, vault_tier, success, payout, cash_spent, created_at, city_id, crew_ids, jewel_drops')
          .eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (profileRes.data) {
        setProfile({ ...profileRes.data, jewels: profileRes.data.jewels as Record<string, number> });
        setEditName(profileRes.data.display_name);
      }
      if (heistRes.data) setHeists(heistRes.data as HeistRow[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => { setSigningOut(true); await supabase.auth.signOut(); };

  const handleSaveName = async () => {
    if (!profile || !editName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ display_name: editName.trim() }).eq('id', user.id);
    setProfile({ ...profile, display_name: editName.trim() });
    setEditing(false);
  };

  if (loading || !profile) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  // Stats calculations
  const currentThreshold = REP_THRESHOLDS.find(t => t.level === profile.rep_level);
  const nextThreshold = REP_THRESHOLDS.find(t => t.level === profile.rep_level + 1);
  const repProgress = nextThreshold
    ? ((profile.rep_xp - (currentThreshold?.xpRequired || 0)) / ((nextThreshold.xpRequired) - (currentThreshold?.xpRequired || 0))) * 100
    : 100;

  const totalHeists = heists.length;
  const successfulHeists = heists.filter(h => h.success).length;
  const successRate = totalHeists > 0 ? Math.round((successfulHeists / totalHeists) * 100) : 0;
  const totalEarned = heists.reduce((sum, h) => sum + (h.success ? (h.payout || 0) : 0), 0);
  const totalSpent = heists.reduce((sum, h) => sum + (h.cash_spent || 0), 0);
  const bustedCount = heists.filter(h => !h.success).length;

  // Largest single heist
  const largestHeist = heists
    .filter(h => h.success && h.payout)
    .sort((a, b) => (b.payout || 0) - (a.payout || 0))[0];

  // Total jewels found
  const totalJewelsFound = heists.reduce((sum, h) => {
    if (!h.jewel_drops) return sum;
    return sum + Object.values(h.jewel_drops as Record<string, number>).reduce((a, b) => a + b, 0);
  }, 0);

  // Favorite crew member
  const crewCounts: Record<string, number> = {};
  heists.forEach(h => {
    (h.crew_ids || []).forEach(id => { crewCounts[id] = (crewCounts[id] || 0) + 1; });
  });
  const favCrewId = Object.entries(crewCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
  const favCrew = CREW_MEMBERS.find(c => c.id === favCrewId);

  // Winning streak
  let maxStreak = 0, streak = 0;
  heists.forEach(h => {
    if (h.success) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 0;
  });

  // Boss vaults (tier 5) cleared
  const bossVaultsCleared = new Set(heists.filter(h => h.success && h.vault_tier === 5).map(h => h.city_id)).size;

  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={S.page} className="screen-enter">
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>

        {/* ══════ IDENTITY CARD ══════ */}
        <div style={{ ...S.card, textAlign: 'center', marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: `${THEME.colors.gold}06`, filter: 'blur(60px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: THEME.space.sm }}>🎭</div>

            {/* Editable display name */}
            {editing ? (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: THEME.space.sm }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} maxLength={20}
                  style={{
                    background: THEME.colors.dusk, border: `1px solid ${THEME.colors.gold}40`,
                    color: THEME.colors.gold, fontFamily: THEME.fonts.display, fontSize: 16,
                    padding: '6px 12px', borderRadius: THEME.radius.sm, textAlign: 'center',
                    outline: 'none', letterSpacing: 2, width: 180,
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button onClick={handleSaveName} style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.emerald, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 2 }}>SAVE</button>
              </div>
            ) : (
              <div onClick={() => setEditing(true)} style={{
                fontFamily: THEME.fonts.display, fontSize: 22, color: THEME.colors.gold,
                letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4, cursor: 'pointer',
                textShadow: `0 0 30px ${THEME.colors.gold}20`,
              }}>
                {profile.display_name} ✏️
              </div>
            )}

            {/* Notoriety title — prominent, colored by tier */}
            <div style={{
              fontSize: 14, fontFamily: THEME.fonts.display, letterSpacing: 4,
              color: titleColor(profile.rep_level), textTransform: 'uppercase', marginBottom: THEME.space.md,
              textShadow: `0 0 20px ${titleColor(profile.rep_level)}30`,
            }}>
              {profile.notoriety_title}
            </div>

            {/* Rep circular badge + progress */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: THEME.space.md, marginBottom: THEME.space.sm }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: `3px solid ${THEME.colors.gold}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: THEME.fonts.mono, fontSize: 20, fontWeight: 700, color: THEME.colors.gold,
                boxShadow: `0 0 16px ${THEME.colors.gold}20`,
                position: 'relative',
              }}>
                {profile.rep_level}
                {/* Progress ring - simplified as bottom bar */}
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 40, height: 3, background: THEME.colors.borderFaint, borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{ height: '100%', width: `${Math.min(repProgress, 100)}%`, background: THEME.colors.gold, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim, letterSpacing: 2 }}>
                  REP LEVEL {profile.rep_level}
                </div>
                {nextThreshold ? (
                  <div style={{ fontSize: 9, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                    {nextThreshold.xpRequired - profile.rep_xp} XP until "{nextThreshold.title}"
                  </div>
                ) : (
                  <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.diamond }}>MAX LEVEL</div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
              Member since {memberSince}
            </div>
          </div>
        </div>

        {/* ══════ JEWEL INVENTORY ══════ */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>JEWEL COLLECTION</div>
          {Object.values(profile.jewels).every(v => v === 0) && (
            <div style={{ textAlign: 'center', padding: `${THEME.space.md}px 0`, marginBottom: THEME.space.md }}>
              <div style={{ fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.textSecondary, letterSpacing: 2, marginBottom: THEME.space.xs }}>
                YOUR COLLECTION AWAITS
              </div>
              <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 11, color: THEME.colors.textMuted, lineHeight: 1.5 }}>
                Run heists to find rare gems. Every stone tells a story.
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {['pearl', 'sapphire', 'emerald', 'ruby', 'diamond'].map(jewel => {
              const count = profile.jewels[jewel] || 0;
              return (
                <div key={jewel} onClick={() => setSelectedJewel(jewel)}
                  style={{
                    textAlign: 'center', cursor: 'pointer', opacity: count > 0 ? 1 : 0.25,
                    padding: '8px 4px', borderRadius: THEME.radius.md,
                    background: selectedJewel === jewel ? `${jewelColors[jewel]}10` : 'transparent',
                    border: `1px solid ${selectedJewel === jewel ? jewelColors[jewel] + '30' : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}>
                  <div style={{
                    fontSize: 24, marginBottom: 2,
                    filter: count > 0 ? `drop-shadow(0 0 6px ${jewelColors[jewel]}40)` : 'none',
                  }}>
                    {jewelEmojis[jewel]}
                  </div>
                  <div style={{ fontSize: 14, fontFamily: THEME.fonts.mono, color: THEME.colors.textPrimary, fontWeight: 700 }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 6, fontFamily: THEME.fonts.display, color: jewelColors[jewel], letterSpacing: 1, opacity: 0.7 }}>
                    {jewelRarities[jewel]?.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════ LIFETIME STATS — CASE FILE ══════ */}
        <div style={{
          ...S.card, marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden',
          borderTop: `2px solid ${THEME.colors.borderMid}`,
        }}>
          {/* Torn paper edge */}
          <div style={{
            position: 'absolute', top: -1, left: 0, right: 0, height: 3,
            background: `repeating-linear-gradient(90deg, ${THEME.colors.ink} 0px, ${THEME.colors.ink} 4px, transparent 4px, transparent 8px)`,
          }} />

          <div style={{ ...S.eyebrow, fontSize: 9, marginBottom: THEME.space.md }}>
            📁 CASE FILE — {profile.display_name.toUpperCase()}
          </div>

          {[
            { label: 'Total Heists Run', value: totalHeists.toString() },
            { label: 'Successful Heists', value: `${successfulHeists} (${successRate}%)`, color: successRate >= 50 ? THEME.colors.emerald : THEME.colors.ruby },
            { label: 'Total Cash Earned', value: `$${totalEarned.toLocaleString()}`, color: THEME.colors.emerald },
            { label: 'Total Cash Spent', value: `$${totalSpent.toLocaleString()}`, color: THEME.colors.ruby },
            { label: 'Largest Single Heist', value: largestHeist ? `$${(largestHeist.payout || 0).toLocaleString()} (${largestHeist.vault_name})` : '—', color: THEME.colors.gold },
            { label: 'Cities Active', value: `${profile.unlocked_cities.length}/4`, color: THEME.colors.sapphire },
            { label: 'Boss Vaults Cleared', value: `${bossVaultsCleared}/4`, color: THEME.colors.diamond },
            { label: 'Jewels Found', value: `${totalJewelsFound} total` },
            { label: 'Favorite Crew Member', value: favCrew ? `${favCrew.emoji} ${favCrew.name}` : '—' },
            { label: 'Longest Winning Streak', value: maxStreak.toString(), color: THEME.colors.emerald },
            { label: 'Times Busted', value: bustedCount.toString(), color: THEME.colors.ruby },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: `1px solid ${THEME.colors.borderFaint}20`,
            }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>
                {row.label}
              </span>
              <span style={{ fontSize: 11, fontFamily: THEME.fonts.mono, fontWeight: 700, color: row.color || THEME.colors.textPrimary }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* ══════ NOTORIETY TITLE PROGRESS ══════ */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div onClick={() => setShowTitles(!showTitles)} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={S.eyebrow}>NOTORIETY TITLES</div>
            <span style={{ fontSize: 12, color: THEME.colors.textMuted }}>{showTitles ? '▲' : '▼'}</span>
          </div>

          {showTitles && (
            <div style={{ marginTop: THEME.space.md, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {REP_THRESHOLDS.map(t => {
                const isEarned = profile.rep_level >= t.level;
                const isCurrent = profile.rep_level === t.level;
                return (
                  <div key={t.level} style={{
                    display: 'flex', alignItems: 'center', gap: THEME.space.sm,
                    padding: '6px 8px', borderRadius: THEME.radius.sm,
                    background: isCurrent ? `${THEME.colors.gold}10` : 'transparent',
                    border: isCurrent ? `1px solid ${THEME.colors.gold}30` : '1px solid transparent',
                    opacity: isEarned ? 1 : 0.4,
                  }}>
                    <span style={{ fontSize: 12, width: 20, textAlign: 'center', color: isEarned ? THEME.colors.emerald : THEME.colors.textMuted }}>
                      {isCurrent ? '►' : isEarned ? '✓' : '○'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 11, fontFamily: THEME.fonts.display,
                        color: isCurrent ? titleColor(t.level) : isEarned ? THEME.colors.textPrimary : THEME.colors.textMuted,
                        letterSpacing: 2,
                      }}>
                        {t.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                      LVL {t.level} — {t.xpRequired} XP
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════ RECENT HEISTS ══════ */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>RECENT HEISTS</div>
        {heists.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
              No heists yet. Hit the Job Board.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs, marginBottom: THEME.space.xl }}>
            {heists.slice(0, 20).map((h, i) => (
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
                <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, fontWeight: 700, color: h.success ? THEME.colors.emerald : THEME.colors.ruby }}>
                  {h.success ? `+$${(h.payout || 0) - (h.cash_spent || 0)}` : `-$${h.cash_spent || 0}`}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSignOut} disabled={signingOut}
          style={{ ...S.btnGhost, color: THEME.colors.ruby, borderColor: `${THEME.colors.ruby}30` }}>
          {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
        </button>
      </div>

      {/* ══════ JEWEL DETAIL MODAL ══════ */}
      {selectedJewel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={() => setSelectedJewel(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{
            position: 'relative', zIndex: 1, background: THEME.colors.ink,
            borderTop: `2px solid ${jewelColors[selectedJewel]}40`,
            borderRadius: `${THEME.radius.lg}px ${THEME.radius.lg}px 0 0`,
            padding: THEME.space.lg, animation: 'slideUp 0.3s ease-out',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.colors.borderMid, margin: '0 auto', marginBottom: THEME.space.lg }} />

            <div style={{ textAlign: 'center', marginBottom: THEME.space.lg }}>
              <div style={{
                fontSize: 56, marginBottom: THEME.space.sm,
                filter: `drop-shadow(0 0 20px ${jewelColors[selectedJewel]}50)`,
              }}>
                {jewelEmojis[selectedJewel]}
              </div>
              <div style={{
                fontFamily: THEME.fonts.display, fontSize: 22, color: jewelColors[selectedJewel],
                letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
              }}>
                {jewelLabels[selectedJewel]}
              </div>
              <div style={{
                fontSize: 10, fontFamily: THEME.fonts.display, color: jewelColors[selectedJewel],
                letterSpacing: 4, opacity: 0.7,
              }}>
                {jewelRarities[selectedJewel]?.toUpperCase()}
              </div>
            </div>

            {/* Count */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: THEME.space.xl,
              marginBottom: THEME.space.lg,
              padding: THEME.space.md, background: THEME.colors.shadow, borderRadius: THEME.radius.md,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>OWNED</div>
                <div style={{ fontSize: 24, fontFamily: THEME.fonts.mono, fontWeight: 700, color: jewelColors[selectedJewel] }}>
                  {profile.jewels[selectedJewel] || 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>LIFETIME</div>
                <div style={{ fontSize: 24, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.textSecondary }}>
                  {heists.reduce((sum, h) => sum + ((h.jewel_drops as Record<string, number>)?.[selectedJewel] || 0), 0)}
                </div>
              </div>
            </div>

            {/* City drop location */}
            <div style={{ marginBottom: THEME.space.md }}>
              <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>DROPS IN</div>
              <div style={{ fontSize: 12, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                {jewelCities[selectedJewel]}
              </div>
            </div>

            {/* Uses */}
            <div style={{ marginBottom: THEME.space.md }}>
              <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>USED FOR</div>
              {jewelUses[selectedJewel]?.map((use, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: THEME.fonts.body, color: THEME.colors.textSecondary, marginBottom: 2 }}>
                  • {use}
                </div>
              ))}
            </div>

            {/* Lore */}
            <p style={{
              fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic',
              color: THEME.colors.textMuted, lineHeight: 1.6, marginBottom: THEME.space.lg,
            }}>
              "{jewelLore[selectedJewel]}"
            </p>

            <button onClick={() => setSelectedJewel(null)} style={S.btnGhost}>CLOSE</button>
          </div>

          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default ProfileScreen;
