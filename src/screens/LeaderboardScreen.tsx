import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';

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
}

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

const medals = ['🥇', '🥈', '🥉'];

const LeaderboardScreen = ({ activeTab, onTabChange }: LeaderboardScreenProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const weekStart = getWeekStart();

      // Get leaderboard entries for this week
      const { data: lbData } = await supabase
        .from('leaderboard_weekly')
        .select('user_id, net_cash_earned')
        .eq('week_start', weekStart)
        .order('net_cash_earned', { ascending: false })
        .limit(50);

      if (!lbData || lbData.length === 0) {
        setLoading(false);
        return;
      }

      // Get profile info for each user
      const userIds = lbData.map(e => e.user_id).filter(Boolean) as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, notoriety_title, rep_level')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enriched: LeaderboardEntry[] = lbData.map(e => {
        const p = e.user_id ? profileMap.get(e.user_id) : null;
        return {
          ...e,
          display_name: p?.display_name || 'Unknown',
          notoriety_title: p?.notoriety_title || 'Street Rat',
          rep_level: p?.rep_level || 1,
        };
      });

      setEntries(enriched);

      // Find current user's rank
      const idx = enriched.findIndex(e => e.user_id === user.id);
      if (idx >= 0) {
        setMyRank(idx + 1);
        setMyEntry(enriched[idx]);
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const weekStart = getWeekStart();
  const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((weekEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div style={S.page}>
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>
        <div style={S.eyebrow}>COMPETITIVE</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.sm }}>WEEKLY LEADERBOARD</h1>
        <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.lg }}>
          {daysLeft} DAYS LEFT — RESETS MONDAY
        </div>

        {/* My rank card */}
        {myEntry && myRank && (
          <div style={{
            ...S.card, marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden',
            border: `1px solid ${THEME.colors.gold}30`,
            boxShadow: THEME.shadows.gold,
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              borderRadius: '50%', background: `${THEME.colors.gold}08`, filter: 'blur(30px)',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>
                  YOUR RANK
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm }}>
                  <span style={{ fontSize: 28, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.gold }}>
                    #{myRank}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary }}>
                    {myEntry.display_name}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>
                  NET EARNED
                </div>
                <div style={{
                  fontSize: 18, fontFamily: THEME.fonts.mono, fontWeight: 700,
                  color: myEntry.net_cash_earned >= 0 ? THEME.colors.emerald : THEME.colors.ruby,
                }}>
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
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: THEME.space.sm,
                    padding: `${THEME.space.sm}px ${THEME.space.md}px`,
                    background: isMe ? `${THEME.colors.gold}08` : rank <= 3 ? `${THEME.colors.ink}` : 'transparent',
                    borderRadius: THEME.radius.sm,
                    border: isMe ? `1px solid ${THEME.colors.gold}20` : '1px solid transparent',
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 32, textAlign: 'center',
                    fontSize: rank <= 3 ? 20 : 14,
                    fontFamily: THEME.fonts.mono, fontWeight: 700,
                    color: rank <= 3 ? THEME.colors.gold : THEME.colors.textMuted,
                  }}>
                    {rank <= 3 ? medals[rank - 1] : `#${rank}`}
                  </div>

                  {/* Player info */}
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
                    </div>
                  </div>

                  {/* Net cash */}
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
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default LeaderboardScreen;
