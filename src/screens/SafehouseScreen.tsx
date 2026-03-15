import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { SAFEHOUSE_ROOMS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import BottomNav from '@/components/BottomNav';

interface SafehouseScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenRoom?: (roomId: string) => void;
}

interface ProfileData {
  display_name: string;
  cash: number;
  rep_level: number;
  rep_xp: number;
  notoriety_title: string;
  jewels: Record<string, number>;
}

interface SafehouseData {
  rooms: Record<string, number>;
}

const SafehouseScreen = ({ activeTab, onTabChange, onOpenRoom }: SafehouseScreenProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [safehouse, setSafehouse] = useState<SafehouseData | null>(null);
  const [unlockModal, setUnlockModal] = useState<typeof SAFEHOUSE_ROOMS[number] | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, safehouseRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('safehouse').select('*').eq('user_id', user.id).single(),
    ]);

    if (profileRes.data) {
      setProfile({
        display_name: profileRes.data.display_name,
        cash: profileRes.data.cash,
        rep_level: profileRes.data.rep_level,
        rep_xp: profileRes.data.rep_xp,
        notoriety_title: profileRes.data.notoriety_title,
        jewels: profileRes.data.jewels as Record<string, number>,
      });
    }
    if (safehouseRes.data) {
      setSafehouse({
        rooms: safehouseRes.data.rooms as Record<string, number>,
      });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getRepProgress = () => {
    if (!profile) return 0;
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
    const currentIdx = Math.min(profile.rep_level - 1, thresholds.length - 2);
    const currentThreshold = thresholds[currentIdx];
    const nextThreshold = thresholds[currentIdx + 1] || thresholds[currentIdx] + 1000;
    return ((profile.rep_xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  };

  const handleUnlock = async (room: typeof SAFEHOUSE_ROOMS[number]) => {
    if (!profile || !safehouse) return;
    if (profile.cash < room.cost) return;
    if (room.jewel) {
      const jewels = profile.jewels;
      if ((jewels[room.jewel.type] || 0) < room.jewel.count) return;
    }

    setUnlocking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Deduct cash
    let newCash = profile.cash - room.cost;
    let newJewels = { ...profile.jewels };
    if (room.jewel) {
      newJewels[room.jewel.type] = (newJewels[room.jewel.type] || 0) - room.jewel.count;
    }

    // Update profile
    await supabase.from('profiles').update({
      cash: newCash,
      jewels: newJewels as unknown as Json,
    }).eq('id', user.id);

    // Update safehouse
    const newRooms = { ...safehouse.rooms, [room.id]: 1 };
    await supabase.from('safehouse').update({
      rooms: newRooms as unknown as Json,
    }).eq('user_id', user.id);

    setUnlocking(false);
    setUnlockModal(null);
    fetchData();
  };

  const formatCash = (n: number) => '$' + n.toLocaleString();

  if (!profile || !safehouse) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>
          LOADING...
        </div>
      </div>
    );
  }

  const jewelsWithCount = Object.entries(profile.jewels).filter(([, count]) => count > 0);
  const jewelColors: Record<string, string> = {
    pearl: THEME.colors.pearl,
    sapphire: THEME.colors.sapphire,
    emerald: THEME.colors.emerald,
    ruby: THEME.colors.ruby,
    diamond: THEME.colors.diamond,
  };
  const jewelEmojis: Record<string, string> = {
    pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
  };

  return (
    <div style={S.page}>
      {/* TOP BAR */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: THEME.colors.void,
          borderBottom: `1px solid ${THEME.colors.borderFaint}`,
          padding: `${THEME.space.md}px ${THEME.space.md}px ${THEME.space.sm}px`,
        }}
      >
        {/* Main bar row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480, margin: '0 auto' }}>
          {/* Left: player info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: THEME.colors.gold, fontFamily: THEME.fonts.display, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.display_name}
            </div>
            <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, letterSpacing: 2, textTransform: 'uppercase' }}>
              {profile.notoriety_title}
            </div>
          </div>

          {/* Center: title */}
          <div style={{ fontFamily: THEME.fonts.display, fontSize: 13, color: THEME.colors.textPrimary, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center' }}>
            THE SAFEHOUSE
          </div>

          {/* Right: cash + jewels */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
            <div style={{ fontSize: 13, color: THEME.colors.gold, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
              {formatCash(profile.cash)}
            </div>
            {jewelsWithCount.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                {jewelsWithCount.map(([type, count]) => (
                  <span key={type} style={{ fontSize: 10 }}>
                    {jewelEmojis[type]}{count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rep bar */}
        <div style={{ maxWidth: 480, margin: '8px auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: THEME.colors.goldDim, fontFamily: THEME.fonts.display, letterSpacing: 2 }}>
              REP {profile.rep_level}
            </span>
            <div style={{ flex: 1, height: 3, background: THEME.colors.borderFaint, borderRadius: 2 }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(getRepProgress(), 100)}%`,
                  background: THEME.colors.gold,
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ROOM GRID */}
      <div
        style={{
          paddingTop: 100,
          paddingBottom: 80,
          paddingLeft: THEME.space.md,
          paddingRight: THEME.space.md,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: THEME.space.md,
          }}
        >
          {SAFEHOUSE_ROOMS.map((room) => {
            const isUnlocked = safehouse.rooms[room.id] === 1;
            return (
              <div
                key={room.id}
                onClick={() => {
                  if (isUnlocked) {
                    onOpenRoom?.(room.id);
                  } else {
                    setUnlockModal(room);
                  }
                }}
                style={{
                  ...S.card,
                  textAlign: 'center',
                  cursor: 'pointer',
                  opacity: isUnlocked ? 1 : 0.4,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = THEME.colors.borderBright;
                  (e.currentTarget as HTMLDivElement).style.opacity = isUnlocked ? '1' : '0.6';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = THEME.colors.borderFaint;
                  (e.currentTarget as HTMLDivElement).style.opacity = isUnlocked ? '1' : '0.4';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: THEME.space.sm }}>{room.emoji}</div>
                <div
                  style={{
                    fontFamily: THEME.fonts.display,
                    fontSize: 12,
                    color: THEME.colors.textPrimary,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: THEME.space.xs,
                  }}
                >
                  {room.name}
                </div>
                {isUnlocked ? (
                  <div style={{ fontSize: 10, color: THEME.colors.emerald, fontFamily: THEME.fonts.mono, letterSpacing: 2 }}>
                    OPEN
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: THEME.colors.goldDim, fontFamily: THEME.fonts.mono }}>
                    🔒 {formatCash(room.cost)}
                    {room.jewel && ` + ${room.jewel.count} ${room.jewel.type}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* UNLOCK MODAL */}
      {unlockModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: THEME.space.lg,
          }}
          onClick={() => setUnlockModal(null)}
        >
          <div
            style={{
              ...S.card,
              maxWidth: 320,
              width: '100%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: THEME.space.md }}>{unlockModal.emoji}</div>
            <div style={{ ...S.eyebrow, marginBottom: THEME.space.xs }}>LOCKED</div>
            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 20,
                color: THEME.colors.textPrimary,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: THEME.space.md,
              }}
            >
              {unlockModal.name}
            </div>
            <p style={{ fontFamily: THEME.fonts.body, fontSize: 13, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg, lineHeight: 1.5 }}>
              {unlockModal.description}
            </p>
            <div style={{ fontSize: 14, color: THEME.colors.gold, fontFamily: THEME.fonts.mono, marginBottom: THEME.space.lg }}>
              Requires {formatCash(unlockModal.cost)}
              {unlockModal.jewel && ` + ${unlockModal.jewel.count} ${unlockModal.jewel.type.charAt(0).toUpperCase() + unlockModal.jewel.type.slice(1)}`}
            </div>

            {profile.cash >= unlockModal.cost &&
             (!unlockModal.jewel || (profile.jewels[unlockModal.jewel.type] || 0) >= unlockModal.jewel.count) ? (
              <button
                onClick={() => handleUnlock(unlockModal)}
                disabled={unlocking}
                style={{ ...S.btnPrimary, opacity: unlocking ? 0.6 : 1 }}
              >
                {unlocking ? 'UPGRADING...' : 'UPGRADE'}
              </button>
            ) : (
              <div style={{ fontSize: 11, color: THEME.colors.danger, fontFamily: THEME.fonts.mono, letterSpacing: 1 }}>
                INSUFFICIENT FUNDS
              </div>
            )}

            <button
              onClick={() => setUnlockModal(null)}
              style={{ ...S.btnGhost, marginTop: THEME.space.md }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default SafehouseScreen;
