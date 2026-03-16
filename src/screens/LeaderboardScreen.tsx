import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import BottomNav from '@/components/BottomNav';
import { AvatarMini } from '@/components/Avatar';
import { type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED } from '@/lib/avatarData';

interface LeaderboardScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface LeaderboardEntry {
  user_id: string | null;
  net_cash_earned: number;
  display_name?: string;
  notoriety_title?: string;
  rep_level?: number;
  jewels?: Record<string, number>;
  avatar?: AvatarConfig;
  equippedItems?: EquippedItems;
}

type TabType = 'weekly' | 'alltime' | 'city';

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

const medals = ['🥇', '🥈', '🥉'];

const CITY_NAMES: Record<string, string> = {
  new_cavendish: 'New Cavendish',
  shadowport: 'Shadowport',
  ironhollow: 'Ironhollow',
  verenthia: 'Verenthia',
};

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const LeaderboardScreen = ({ activeTab, onTabChange }: LeaderboardScreenProps) => {
  const [tab, setTab] = useState<TabType>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [selectedCity, setSelectedCity] = useState('new_cavendish');
  const [countdown, setCountdown] = useState('');
  const demo = useDemo();

  // Week countdown
  useEffect(() => {
    const update = () => {
      const weekStart = getWeekStart();
      const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000);
      const diff = weekEnd.getTime() - Date.now();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loadData(); }, [tab, selectedCity]);

  const loadData = async () => {
    setLoading(true);
    if (demo?.isDemo) {
      // Show demo player as the only entry
      setCurrentUserId('demo');
      setEntries([{
        user_id: 'demo',
        net_cash_earned: demo.profile.cash,
        display_name: demo.profile.display_name,
        notoriety_title: demo.profile.notoriety_title,
        rep_level: demo.profile.rep_level,
        jewels: demo.profile.jewels,
        avatar: demo.profile.avatar,
        equippedItems: demo.profile.equippedItems,
      }]);
      setMyRank(1);
      setMyEntry({
        user_id: 'demo',
        net_cash_earned: demo.profile.cash,
        display_name: demo.profile.display_name,
      });
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    let enriched: LeaderboardEntry[] = [];

    if (tab === 'weekly') {
      const weekStart = getWeekStart();
      const { data: lbData } = await supabase
        .from('leaderboard_weekly')
        .select('user_id, net_cash_earned')
        .eq('week_start', weekStart)
        .order('net_cash_earned', { ascending: false })
        .limit(50);

      if (lbData && lbData.length > 0) {
        const userIds = lbData.map(e => e.user_id).filter(Boolean) as string[];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, notoriety_title, rep_level, jewels, avatar, equippedItems')
          .in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        enriched = lbData.map(e => {
          const p = e.user_id ? profileMap.get(e.user_id) : null;
          return {
            ...e,
            display_name: p?.display_name || 'Unknown',
            notoriety_title: p?.notoriety_title || 'Street Rat',
            rep_level: p?.rep_level || 1,
            jewels: p?.jewels as Record<string, number> || {},
            avatar: (p?.avatar as any) || DEFAULT_AVATAR,
            equippedItems: (p?.equippedItems as any) || DEFAULT_EQUIPPED,
          };
        });
      }
    } else if (tab === 'alltime') {
      // Sum all weekly entries per user
      const { data: lbData } = await supabase
        .from('leaderboard_weekly')
        .select('user_id, net_cash_earned');

      if (lbData && lbData.length > 0) {
        const totals: Record<string, number> = {};
        lbData.forEach(e => {
          if (e.user_id) totals[e.user_id] = (totals[e.user_id] || 0) + e.net_cash_earned;
        });
        const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a).slice(0, 50);
        const userIds = sorted.map(([id]) => id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, notoriety_title, rep_level, jewels, avatar, equippedItems')
          .in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        enriched = sorted.map(([uid, total]) => {
          const p = profileMap.get(uid);
          return {
            user_id: uid,
            net_cash_earned: total,
            display_name: p?.display_name || 'Unknown',
            notoriety_title: p?.notoriety_title || 'Street Rat',
            rep_level: p?.rep_level || 1,
            jewels: p?.jewels as Record<string, number> || {},
            avatar: (p?.avatar as any) || DEFAULT_AVATAR,
            equippedItems: (p?.equippedItems as any) || DEFAULT_EQUIPPED,
          };
        });
      }
    } else if (tab === 'city') {
      // Aggregate from heist_history by city
      const { data: heistData } = await supabase
        .from('heist_history')
        .select('user_id, payout, cash_spent, success')
        .eq('city_id', selectedCity);

      if (heistData && heistData.length > 0) {
        const totals: Record<string, number> = {};
        heistData.forEach(e => {
          if (e.user_id) {
            const net = (e.success ? (e.payout || 0) : 0) - (e.cash_spent || 0);
            totals[e.user_id] = (totals[e.user_id] || 0) + net;
          }
        });
        const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a).slice(0, 50);
        const userIds = sorted.map(([id]) => id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, notoriety_title, rep_level, jewels, avatar, equippedItems')
          .in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        enriched = sorted.map(([uid, total]) => {
          const p = profileMap.get(uid);
          return {
            user_id: uid,
            net_cash_earned: total,
            display_name: p?.display_name || 'Unknown',
            notoriety_title: p?.notoriety_title || 'Street Rat',
            rep_level: p?.rep_level || 1,
            jewels: p?.jewels as Record<string, number> || {},
            avatar: (p?.avatar as any) || DEFAULT_AVATAR,
            equippedItems: (p?.equippedItems as any) || DEFAULT_EQUIPPED,
          };
        });
      }
    }

    setEntries(enriched);
    const idx = enriched.findIndex(e => e.user_id === user.id);
    setMyRank(idx >= 0 ? idx + 1 : null);
    setMyEntry(idx >= 0 ? enriched[idx] : null);
    setLoading(false);
  };

  const totalJewels = (jewels?: Record<string, number>) => {
    if (!jewels) return 0;
    return Object.values(jewels).reduce((a, b) => a + b, 0);
  };

  return (
    <div style={S.page}>
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>
        <div style={S.eyebrow}>COMPETITIVE</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.md }}>LEADERBOARD</h1>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 2, marginBottom: THEME.space.lg,
          background: THEME.colors.dusk, borderRadius: THEME.radius.md, padding: 2,
        }}>
          {(['weekly', 'alltime', 'city'] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
                borderRadius: THEME.radius.sm,
                background: tab === t ? THEME.colors.ink : 'transparent',
                fontFamily: THEME.fonts.display, fontSize: 10, letterSpacing: 3,
                color: tab === t ? THEME.colors.gold : THEME.colors.textMuted,
                textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {t === 'weekly' ? 'WEEKLY' : t === 'alltime' ? 'ALL-TIME' : 'CITY'}
            </button>
          ))}
        </div>

        {/* Weekly meta */}
        {tab === 'weekly' && (
          <div style={{ marginBottom: THEME.space.lg }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: THEME.radius.sm,
              background: `${THEME.colors.gold}08`, border: `1px solid ${THEME.colors.gold}20`,
              marginBottom: THEME.space.md,
            }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, letterSpacing: 1 }}>
                WEEK ENDS IN {countdown}
              </span>
            </div>

            {/* Prize pool */}
            <div style={{
              ...S.card, padding: THEME.space.md,
              borderColor: `${THEME.colors.gold}20`, background: `${THEME.colors.gold}05`,
            }}>
              <div style={{ fontSize: 9, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim, letterSpacing: 3, marginBottom: THEME.space.sm }}>
                🏆 PRIZE POOL
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { place: '1st', cash: '$10,000', jewel: '💎' },
                  { place: '2nd', cash: '$4,000', jewel: '❤️' },
                  { place: '3rd', cash: '$1,500', jewel: '💚' },
                ].map(p => (
                  <div key={p.place} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.gold, letterSpacing: 2, marginBottom: 4 }}>
                      {p.place}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald, fontWeight: 700 }}>
                      {p.cash}
                    </div>
                    <div style={{ fontSize: 14, marginTop: 2 }}>{p.jewel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* City selector for city tab */}
        {tab === 'city' && (
          <div style={{ display: 'flex', gap: THEME.space.xs, marginBottom: THEME.space.lg, flexWrap: 'wrap' }}>
            {Object.entries(CITY_NAMES).map(([id, name]) => (
              <button key={id} onClick={() => setSelectedCity(id)}
                style={{
                  padding: '6px 12px', borderRadius: THEME.radius.sm, border: 'none', cursor: 'pointer',
                  background: selectedCity === id ? THEME.colors.gold : THEME.colors.dusk,
                  color: selectedCity === id ? THEME.colors.void : THEME.colors.textMuted,
                  fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 2,
                  transition: 'all 0.2s',
                }}>
                {name.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: THEME.space.xl }}>
            <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
          </div>
        ) : (
          <>
            {/* My rank card */}
            {myEntry && myRank && (
              <div style={{
                ...S.card, marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden',
                border: `1px solid ${THEME.colors.gold}30`, boxShadow: THEME.shadows.gold,
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${THEME.colors.gold}08`, filter: 'blur(30px)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>YOUR RANK</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm }}>
                      <span style={{ fontSize: 28, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.gold }}>#{myRank}</span>
                      <span style={{ fontSize: 11, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary }}>{myEntry.display_name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>NET EARNED</div>
                    <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, fontWeight: 700, color: myEntry.net_cash_earned >= 0 ? THEME.colors.emerald : THEME.colors.ruby }}>
                      {myEntry.net_cash_earned >= 0 ? '+' : ''}${myEntry.net_cash_earned.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard list */}
            {entries.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🏆</div>
                <div style={{ fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.textPrimary, letterSpacing: 2, marginBottom: THEME.space.sm }}>
                  NO ENTRIES YET
                </div>
                <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                  Complete heists to appear on the leaderboard.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {entries.map((entry, idx) => {
                  const isMe = entry.user_id === currentUserId;
                  const rank = idx + 1;
                  const jCount = totalJewels(entry.jewels);
                  return (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: THEME.space.sm,
                      padding: `${THEME.space.sm}px ${THEME.space.md}px`,
                      background: isMe ? `${THEME.colors.gold}08` : rank <= 3 ? THEME.colors.ink : 'transparent',
                      borderRadius: THEME.radius.sm,
                      border: isMe ? `1px solid ${THEME.colors.gold}20` : rank === 1 ? `1px solid ${THEME.colors.gold}15` : '1px solid transparent',
                    }}>
                      <div style={{
                        width: 32, textAlign: 'center',
                        fontSize: rank <= 3 ? 20 : 14,
                        fontFamily: THEME.fonts.mono, fontWeight: 700,
                        color: rank <= 3 ? THEME.colors.gold : THEME.colors.textMuted,
                      }}>
                        {rank <= 3 ? medals[rank - 1] : `#${rank}`}
                      </div>
                      <AvatarMini avatarConfig={entry.avatar || DEFAULT_AVATAR} equippedItems={entry.equippedItems || DEFAULT_EQUIPPED} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: THEME.fonts.display, fontSize: 12,
                          color: isMe ? THEME.colors.gold : THEME.colors.textPrimary,
                          letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {entry.display_name}{isMe ? ' (YOU)' : ''}
                        </div>
                        <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>
                          {entry.notoriety_title} — LVL {entry.rep_level}
                          {jCount > 0 && ` — ${jCount} 💎`}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 13, fontFamily: THEME.fonts.mono, fontWeight: 700,
                        color: entry.net_cash_earned >= 0 ? THEME.colors.emerald : THEME.colors.ruby,
                      }}>
                        {entry.net_cash_earned >= 0 ? '+' : ''}${entry.net_cash_earned.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default LeaderboardScreen;
