import { useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

// ═══════════════════════════════════════════════════════════════
// Full 3-tier room upgrade definitions from Prompt 7
// ═══════════════════════════════════════════════════════════════
interface TierDef {
  cost: number;
  jewel?: { type: string; count: number };
  effect: string;
}

interface RoomDef {
  id: string;
  name: string;
  emoji: string;
  lore: string;
  tiers: [TierDef, TierDef, TierDef];
}

const ROOM_DEFS: RoomDef[] = [
  {
    id: 'war_room', name: 'The War Room', emoji: '🎯',
    lore: 'Where plans are hatched and debts are settled. The walls remember every scheme.',
    tiers: [
      { cost: 0, effect: 'Plan heists and manage your crew.' },
      { cost: 3000, effect: 'Job board shows 4 jobs instead of 3.' },
      { cost: 8000, jewel: { type: 'sapphire', count: 1 }, effect: 'Job refresh is free once per day.' },
    ],
  },
  {
    id: 'vault', name: 'The Vault', emoji: '🏦',
    lore: 'Cold steel and colder silence. Your fortune rests behind three inches of tempered iron.',
    tiers: [
      { cost: 1000, effect: 'Hold loot from fence. 15% raid chance.' },
      { cost: 4000, effect: '8% raid chance. Hold bonus +50%.' },
      { cost: 12000, jewel: { type: 'emerald', count: 1 }, effect: '3% raid chance. Hold bonus +75%. Raid timing revealed.' },
    ],
  },
  {
    id: 'garage', name: 'The Garage', emoji: '🚗',
    lore: 'Engines idle in the dark, ready to scream through the night at a moment\'s notice.',
    tiers: [
      { cost: 2500, effect: 'Roxy\'s loyalty bonus always active.' },
      { cost: 6000, effect: 'Tail mini-game starts with 3 extra seconds.' },
      { cost: 15000, effect: 'Second vehicle — choose optimal getaway post-run.' },
    ],
  },
  {
    id: 'study', name: 'The Study', emoji: '📚',
    lore: 'Leather-bound journals and stolen blueprints. Knowledge is the sharpest weapon.',
    tiers: [
      { cost: 5000, effect: 'Preview chaos card suit before committing.' },
      { cost: 10000, effect: 'Preview chaos card type (good/bad/wild).' },
      { cost: 25000, effect: 'Full chaos card revealed before committing.' },
    ],
  },
  {
    id: 'infirmary', name: 'The Infirmary', emoji: '💉',
    lore: 'Fluorescent lights and the smell of antiseptic. Doc Voss works miracles here.',
    tiers: [
      { cost: 8000, effect: 'Recover from one failed mini-game per job.' },
      { cost: 18000, effect: 'Recover from two failed mini-games per job.' },
      { cost: 35000, effect: 'Failed mini-games count as partial success (50% reduction).' },
    ],
  },
  {
    id: 'signal_room', name: 'The Signal Room', emoji: '📡',
    lore: 'Frequencies crackle with intercepted chatter. Every whisper is an advantage.',
    tiers: [
      { cost: 15000, effect: 'Zero\'s loyalty bonus always active.' },
      { cost: 30000, effect: 'Alarm Cut shows one correct wire highlighted.' },
      { cost: 60000, effect: 'Hacker variant unlocks — digital mini-game for Zero runs.' },
    ],
  },
  {
    id: 'parlor', name: 'The Parlor', emoji: '🎭',
    lore: 'Velvet curtains and whispered deals. The fence\'s favorite establishment.',
    tiers: [
      { cost: 30000, jewel: { type: 'emerald', count: 1 }, effect: 'Leaderboard display. Weekly guest fence with premium stock.' },
      { cost: 50000, jewel: { type: 'ruby', count: 1 }, effect: 'Guest fence visits twice a week.' },
      { cost: 80000, jewel: { type: 'ruby', count: 1 }, effect: 'All fence prices -15%. Jewel stock always available.' },
    ],
  },
  {
    id: 'penthouse', name: 'The Penthouse', emoji: '🏙️',
    lore: 'The skyline stretches endlessly below. From here, you own the city.',
    tiers: [
      { cost: 80000, jewel: { type: 'ruby', count: 1 }, effect: 'Prestige suite. Unlocks Verenthia city access.' },
      { cost: 120000, jewel: { type: 'diamond', count: 1 }, effect: 'City travel discounted by 30%.' },
      { cost: 200000, jewel: { type: 'diamond', count: 1 }, effect: 'All four cities permanently active simultaneously.' },
    ],
  },
];

interface SafehouseRoomModalProps {
  roomId: string;
  currentTier: number; // 0 = locked, 1-3 = tier
  playerCash: number;
  playerJewels: Record<string, number>;
  onUpgrade: () => void;
  onClose: () => void;
  onOpenBlackMarket?: () => void;
}

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const SafehouseRoomModal = ({ roomId, currentTier, playerCash, playerJewels, onUpgrade, onClose }: SafehouseRoomModalProps) => {
  const [upgrading, setUpgrading] = useState(false);
  const room = ROOM_DEFS.find(r => r.id === roomId);
  if (!room) return null;

  const nextTierIdx = currentTier; // currentTier 0 → upgrade to tier 1 (index 0), etc.
  const isMaxed = currentTier >= 3;
  const nextTier = !isMaxed ? room.tiers[nextTierIdx] : null;

  const canAfford = nextTier
    ? playerCash >= nextTier.cost &&
      (!nextTier.jewel || (playerJewels[nextTier.jewel.type] || 0) >= nextTier.jewel.count)
    : false;

  const handleUpgrade = async () => {
    if (!nextTier || upgrading || !canAfford) return;
    setUpgrading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUpgrading(false); return; }

    // Deduct cash + jewels
    let newCash = playerCash - nextTier.cost;
    let newJewels = { ...playerJewels };
    if (nextTier.jewel) {
      newJewels[nextTier.jewel.type] = (newJewels[nextTier.jewel.type] || 0) - nextTier.jewel.count;
    }

    await supabase.from('profiles').update({
      cash: newCash,
      jewels: newJewels as unknown as Json,
    }).eq('id', user.id);

    // Update safehouse room tier
    const { data: sh } = await supabase.from('safehouse').select('rooms').eq('user_id', user.id).single();
    if (sh) {
      const rooms = sh.rooms as Record<string, number>;
      rooms[roomId] = currentTier + 1;
      await supabase.from('safehouse').update({ rooms: rooms as unknown as Json }).eq('user_id', user.id);
    }

    setUpgrading(false);
    toast({ title: `${room.emoji} ${room.name} Upgraded!`, description: nextTier.effect });
    onUpgrade();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: THEME.colors.ink,
          borderTop: `2px solid ${THEME.colors.borderMid}`,
          borderRadius: `${THEME.radius.lg}px ${THEME.radius.lg}px 0 0`,
          padding: THEME.space.lg,
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: THEME.colors.borderMid,
          margin: '0 auto', marginBottom: THEME.space.lg,
        }} />

        {/* Room header */}
        <div style={{ textAlign: 'center', marginBottom: THEME.space.lg }}>
          <div style={{ fontSize: 48, marginBottom: THEME.space.sm }}>{room.emoji}</div>
          <div style={{
            fontFamily: THEME.fonts.display, fontSize: 20,
            color: THEME.colors.textPrimary, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: THEME.space.sm,
          }}>
            {room.name}
          </div>

          {/* Tier dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: THEME.space.md }}>
            {[1, 2, 3].map(t => (
              <div key={t} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: t <= currentTier ? THEME.colors.gold : THEME.colors.borderFaint,
                border: `2px solid ${t <= currentTier ? THEME.colors.gold : THEME.colors.borderMid}`,
                boxShadow: t <= currentTier ? `0 0 8px ${THEME.colors.gold}40` : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {isMaxed && (
            <div style={{
              fontSize: 11, fontFamily: THEME.fonts.display, color: THEME.colors.gold,
              letterSpacing: 4, padding: '6px 16px',
              border: `1px solid ${THEME.colors.gold}40`,
              borderRadius: THEME.radius.sm, display: 'inline-block',
            }}>
              ✦ FULLY UPGRADED ✦
            </div>
          )}
        </div>

        {/* Lore text */}
        <p style={{
          fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic',
          color: THEME.colors.textMuted, textAlign: 'center',
          lineHeight: 1.6, marginBottom: THEME.space.lg,
        }}>
          {room.lore}
        </p>

        {/* Tier list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, marginBottom: THEME.space.lg }}>
          {room.tiers.map((tier, i) => {
            const tierNum = i + 1;
            const isActive = tierNum <= currentTier;
            const isNext = tierNum === currentTier + 1;
            return (
              <div key={i} style={{
                ...S.card,
                padding: THEME.space.md,
                borderColor: isNext ? THEME.colors.gold + '60' : isActive ? THEME.colors.emerald + '30' : THEME.colors.borderFaint,
                background: isNext ? `${THEME.colors.gold}08` : isActive ? `${THEME.colors.emerald}05` : THEME.colors.ink,
                opacity: !isActive && !isNext ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{
                    fontSize: 10, fontFamily: THEME.fonts.display,
                    color: isActive ? THEME.colors.emerald : isNext ? THEME.colors.gold : THEME.colors.textMuted,
                    letterSpacing: 3,
                  }}>
                    {isActive ? '✓ ' : ''}TIER {tierNum}
                  </div>
                  {!isActive && (
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.gold }}>
                      ${tier.cost.toLocaleString()}
                      {tier.jewel && (
                        <span style={{ marginLeft: 4 }}>
                          + {tier.jewel.count} {jewelEmojis[tier.jewel.type] || tier.jewel.type}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11, fontFamily: THEME.fonts.body,
                  color: isActive ? THEME.colors.textSecondary : THEME.colors.textMuted,
                  lineHeight: 1.5,
                }}>
                  {tier.effect}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade button */}
        {!isMaxed && nextTier && (
          <div>
            {/* Cost breakdown */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: THEME.space.md,
              marginBottom: THEME.space.md,
            }}>
              <div style={{
                fontSize: 11, fontFamily: THEME.fonts.mono,
                color: playerCash >= nextTier.cost ? THEME.colors.gold : THEME.colors.ruby,
              }}>
                ${nextTier.cost.toLocaleString()}
                {playerCash < nextTier.cost && <span style={{ fontSize: 9, marginLeft: 4 }}>({playerCash.toLocaleString()} owned)</span>}
              </div>
              {nextTier.jewel && (
                <div style={{
                  fontSize: 11, fontFamily: THEME.fonts.mono,
                  color: (playerJewels[nextTier.jewel.type] || 0) >= nextTier.jewel.count ? THEME.colors.gold : THEME.colors.ruby,
                }}>
                  {nextTier.jewel.count} {jewelEmojis[nextTier.jewel.type] || nextTier.jewel.type}
                  {(playerJewels[nextTier.jewel.type] || 0) < nextTier.jewel.count && (
                    <span style={{ fontSize: 9, marginLeft: 4 }}>({playerJewels[nextTier.jewel.type] || 0} owned)</span>
                  )}
                </div>
              )}
            </div>

            {canAfford ? (
              <button onClick={handleUpgrade} disabled={upgrading}
                style={{ ...S.btnPrimary, opacity: upgrading ? 0.6 : 1 }}>
                {upgrading ? 'UPGRADING...' : `UPGRADE TO TIER ${currentTier + 1}`}
              </button>
            ) : (
              <div style={{
                textAlign: 'center', fontSize: 11,
                color: THEME.colors.ruby, fontFamily: THEME.fonts.mono, letterSpacing: 1,
              }}>
                INSUFFICIENT RESOURCES
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{ ...S.btnGhost, marginTop: THEME.space.md }}>
          CLOSE
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SafehouseRoomModal;
