import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { SAFEHOUSE_ROOMS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import SafehouseRoomModal from '@/components/SafehouseRoomModal';
import HeldLootBanner from '@/components/HeldLootBanner';
import SkeletonLoader from '@/components/SkeletonLoader';
import { AvatarMini } from '@/components/Avatar';
import { type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED } from '@/lib/avatarData';

interface SafehouseScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenRoom?: (roomId: string) => void;
  onOpenIAP?: () => void;
  onOpenBlackMarket?: () => void;
  onOpenHeldLoot?: () => void;
}

interface ProfileData {
  display_name: string;
  cash: number;
  rep_level: number;
  rep_xp: number;
  notoriety_title: string;
  jewels: Record<string, number>;
  avatar: AvatarConfig;
  equippedItems: EquippedItems;
}

interface SafehouseData {
  rooms: Record<string, number>;
}

const SafehouseScreen = ({ activeTab, onTabChange, onOpenRoom, onOpenIAP, onOpenBlackMarket, onOpenHeldLoot }: SafehouseScreenProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [safehouse, setSafehouse] = useState<SafehouseData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

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
        avatar: (profileRes.data.avatar as any) || DEFAULT_AVATAR,
        equippedItems: (profileRes.data.equippedItems as any) || DEFAULT_EQUIPPED,
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

  const formatCash = (n: number) => '$' + n.toLocaleString();

  if (!profile || !safehouse) {
    return (
      <div style={S.page}>
        <SkeletonLoader variant="safehouse" />
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
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
    <div style={S.page} className="screen-enter">
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
          padding: `calc(${THEME.space.md}px + env(safe-area-inset-top)) ${THEME.space.md}px ${THEME.space.sm}px`,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textPrimary, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>
            THE SAFEHOUSE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
              <AvatarMini avatarConfig={profile.avatar} equippedItems={profile.equippedItems} size={28} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: THEME.colors.gold, fontFamily: THEME.fonts.display, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                  {profile.display_name}
                </div>
                <div style={{ fontSize: 8, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {profile.notoriety_title}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
              <div style={{ fontSize: 12, color: THEME.colors.gold, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
                {formatCash(profile.cash)}
              </div>
              {jewelsWithCount.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
                  {jewelsWithCount.map(([type, count]) => (
                    <span key={type} style={{ fontSize: 9 }}>
                      {jewelEmojis[type]}{count}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
        {/* HELD LOOT BANNER */}
        <HeldLootBanner onNavigateToLoot={onOpenHeldLoot} />

        {/* Quick links */}
        <div style={{ display: 'flex', gap: THEME.space.sm, marginBottom: THEME.space.md }}>
          {onOpenBlackMarket && (
            <button
              onClick={onOpenBlackMarket}
              style={{
                flex: 1,
                ...S.btnGhost,
                padding: '8px',
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              🏪 BLACK MARKET
            </button>
          )}
          {onOpenIAP && (
            <button
              onClick={onOpenIAP}
              style={{
                flex: 1,
                ...S.btnGhost,
                padding: '8px',
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                borderColor: `${THEME.colors.gold}30`,
                color: THEME.colors.goldMid,
              }}
            >
              💎 THE FENCE
            </button>
          )}
        </div>

        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: THEME.space.md,
          }}
        >
          {SAFEHOUSE_ROOMS.map((room) => {
            const roomTier = safehouse.rooms[room.id] || 0;
            const isUnlocked = roomTier >= 1;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                style={{
                  ...S.card,
                  textAlign: 'center',
                  cursor: 'pointer',
                  opacity: isUnlocked ? 1 : 0.4,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                className="tap-active"
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
                    TIER {roomTier}
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

      {/* ROOM UPGRADE MODAL */}
      {selectedRoom && (
        <SafehouseRoomModal
          roomId={selectedRoom}
          currentTier={safehouse.rooms[selectedRoom] || 0}
          playerCash={profile.cash}
          playerJewels={profile.jewels}
          onUpgrade={() => { setSelectedRoom(null); fetchData(); }}
          onClose={() => setSelectedRoom(null)}
          onOpenBlackMarket={onOpenBlackMarket}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default SafehouseScreen;
