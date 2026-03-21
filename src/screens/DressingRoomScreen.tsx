import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { THEME, S } from '@/styles/theme';
import {
  SKIN_TONES, EYE_COLORS, HAIR_COLORS, HAIR_STYLES, FACIAL_HAIR,
  FACE_PRESETS, CLOTHING_ITEMS, LEGENDARY_ITEMS, LEGENDARY_SETS,
  PHOTO_BACKDROPS,
  type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED,
} from '@/lib/avatarData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Avatar from '@/components/Avatar';
import ItemThumbnail from '@/components/ItemThumbnail';

interface DressingRoomScreenProps {
  onBack: () => void;
  onOpenPhotoMode?: () => void;
}

const ALL_CATEGORIES = [
  { key: 'all', label: 'ALL', emoji: '🗂' },
  { key: 'hat', label: 'HATS', emoji: '🎩' },
  { key: 'mask', label: 'MASKS', emoji: '🎭' },
  { key: 'eyewear', label: 'EYES', emoji: '🕶' },
  { key: 'top', label: 'TOPS', emoji: '👔' },
  { key: 'coat', label: 'COATS', emoji: '🧥' },
  { key: 'bottoms', label: 'PANTS', emoji: '👖' },
  { key: 'shoes', label: 'SHOES', emoji: '👞' },
  { key: 'gloves', label: 'GLOVES', emoji: '🧤' },
  { key: 'accessory', label: 'ACC', emoji: '⌚' },
  { key: 'weapon', label: 'WPNS', emoji: '🗡' },
  { key: 'fullOutfit', label: 'OUTFIT', emoji: '🤵' },
];

const JEWEL_EMOJIS: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const DressingRoomScreen = ({ onBack, onOpenPhotoMode }: DressingRoomScreenProps) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>(DEFAULT_EQUIPPED);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set());
  const [playerCash, setPlayerCash] = useState(0);
  const [playerJewels, setPlayerJewels] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'customize' | 'gear'>('gear');
  const [filterCat, setFilterCat] = useState('all');
  const [filterOwned, setFilterOwned] = useState<'all' | 'owned' | 'shop'>('all');
  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [profileRes, wardrobeRes] = await Promise.all([
        supabase.from('profiles').select('avatar, "equippedItems", cash, jewels').eq('id', user.id).single(),
        supabase.from('wardrobe').select('item_id').eq('user_id', user.id),
      ]);
      if (profileRes.data) {
        const p = profileRes.data as any;
        if (p.avatar) setAvatarConfig(p.avatar as AvatarConfig);
        if (p.equippedItems) setEquippedItems(p.equippedItems as EquippedItems);
        setPlayerCash(p.cash || 0);
        setPlayerJewels((p.jewels as Record<string, number>) || {});
      }
      if (wardrobeRes.data) {
        setOwnedItemIds(new Set(wardrobeRes.data.map((r: any) => r.item_id)));
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveAvatarConfig = useCallback((config: AvatarConfig) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ avatar: config as any }).eq('id', user.id);
    }, 600);
  }, []);

  const updateAvatar = (patch: Partial<AvatarConfig>) => {
    const newConfig = { ...avatarConfig, ...patch };
    setAvatarConfig(newConfig);
    saveAvatarConfig(newConfig);
  };

  const saveEquipped = async (items: EquippedItems) => {
    setEquippedItems(items);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ equippedItems: items as any }).eq('id', user.id);
  };

  const toggleEquip = (cat: string, itemId: string) => {
    const key = cat as keyof EquippedItems;
    const newItems = { ...equippedItems };
    (newItems as any)[key] = newItems[key] === itemId ? null : itemId;
    saveEquipped(newItems);
  };

  const buyItem = async (item: typeof CLOTHING_ITEMS[number]) => {
    if (ownedItemIds.has(item.id)) return;
    if (playerCash < item.cashCost) {
      toast({ title: 'Not enough cash', description: `Need $${(item.cashCost - playerCash).toLocaleString()} more.` });
      return;
    }
    if (item.jewel && item.jewelCost > 0) {
      const have = playerJewels[item.jewel] || 0;
      if (have < item.jewelCost) {
        toast({ title: `Not enough ${item.jewel}s`, description: `Need ${item.jewelCost - have} more.` });
        return;
      }
    }
    const newCash = playerCash - item.cashCost;
    const newJewels = { ...playerJewels };
    if (item.jewel && item.jewelCost > 0) newJewels[item.jewel] = (newJewels[item.jewel] || 0) - item.jewelCost;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [, insertRes] = await Promise.all([
      supabase.from('profiles').update({ cash: newCash, jewels: newJewels as any }).eq('id', user.id),
      supabase.from('wardrobe').insert({ user_id: user.id, item_id: item.id }),
    ]);
    if (insertRes.error) { toast({ title: 'Error', description: insertRes.error.message }); return; }
    setPlayerCash(newCash);
    setPlayerJewels(newJewels);
    setOwnedItemIds(new Set([...ownedItemIds, item.id]));
    toast({ title: 'Purchased!', description: item.label });
  };

  const formatCash = (n: number) => '$' + n.toLocaleString();

  const displayEquipped = previewItem
    ? (() => {
        const item = [...CLOTHING_ITEMS, ...LEGENDARY_ITEMS].find(i => i.id === previewItem);
        if (!item) return equippedItems;
        return { ...equippedItems, [item.cat]: item.id };
      })()
    : equippedItems;

  const backdrop = PHOTO_BACKDROPS[selectedBackdrop];

  // Unified item list — all clothing + legendary, filtered
  const filteredItems = useMemo(() => {
    const allItems = [...CLOTHING_ITEMS, ...LEGENDARY_ITEMS];
    return allItems
      .filter(i => i.gender === 'all' || i.gender === avatarConfig.gender)
      .filter(i => filterCat === 'all' || i.cat === filterCat)
      .filter(i => {
        if (filterOwned === 'owned') return ownedItemIds.has(i.id);
        if (filterOwned === 'shop') return !ownedItemIds.has(i.id);
        return true;
      })
      .sort((a, b) => {
        const aOwned = ownedItemIds.has(a.id) ? 0 : 1;
        const bOwned = ownedItemIds.has(b.id) ? 0 : 1;
        if (aOwned !== bOwned) return aOwned - bOwned;
        return a.tier - b.tier;
      });
  }, [filterCat, filterOwned, ownedItemIds, avatarConfig.gender]);

  const availableHairStyles = [
    ...(HAIR_STYLES[avatarConfig.gender] || []),
    ...(avatarConfig.gender !== 'neutral' ? HAIR_STYLES.neutral : []),
  ];

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ═══ PREVIEW ═══ */}
      <div style={{
        height: '38vh', minHeight: 240,
        background: `radial-gradient(ellipse at 50% 80%, ${backdrop?.accentColor || THEME.colors.gold}12 0%, transparent 70%), ${backdrop?.bgColor || '#0D0A12'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 12, left: 12, background: 'none', border: 'none',
          color: THEME.colors.textMuted, fontFamily: THEME.fonts.display, fontSize: 12, letterSpacing: 2, cursor: 'pointer',
        }}>← BACK</button>
        {onOpenPhotoMode && (
          <button onClick={onOpenPhotoMode} style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: `1px solid ${THEME.colors.borderFaint}`,
            color: THEME.colors.textMuted, fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 1, cursor: 'pointer', padding: '4px 8px', borderRadius: 4,
          }}>📸</button>
        )}
        <div style={{ position: 'absolute', top: 12, right: onOpenPhotoMode ? 52 : 12, fontSize: 11, color: THEME.colors.gold, fontFamily: THEME.fonts.mono }}>
          {formatCash(playerCash)}
        </div>
        <Avatar avatarConfig={avatarConfig} equippedItems={displayEquipped} size={170} />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {PHOTO_BACKDROPS.slice(0, 4).map((bd, i) => (
            <button key={bd.id} onClick={() => setSelectedBackdrop(i)} style={{
              width: 28, height: 28, borderRadius: 4,
              border: `2px solid ${selectedBackdrop === i ? THEME.colors.gold : THEME.colors.borderFaint}`,
              background: bd.bgColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: bd.accentColor }} />
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${THEME.colors.borderFaint}`, background: THEME.colors.void }}>
        {(['customize', 'gear'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px 0', background: 'none', border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${THEME.colors.gold}` : '2px solid transparent',
            color: activeTab === tab ? THEME.colors.textPrimary : THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {tab === 'customize' ? '✏️ LOOK' : '🎒 GEAR'}
          </button>
        ))}
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', maxWidth: 480, margin: '0 auto', width: '100%', paddingBottom: 40 }}>
        {activeTab === 'customize' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Gender */}
            <div>
              <div style={S.eyebrow}>GENDER</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['male', 'female', 'neutral'].map(g => (
                  <button key={g} onClick={() => updateAvatar({ gender: g })} style={{
                    flex: 1, padding: '7px 0', borderRadius: 20, cursor: 'pointer',
                    background: avatarConfig.gender === g ? THEME.colors.gold : THEME.colors.ink,
                    color: avatarConfig.gender === g ? THEME.colors.void : THEME.colors.textMuted,
                    border: `1px solid ${avatarConfig.gender === g ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    fontFamily: THEME.fonts.display, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  }}>{g}</button>
                ))}
              </div>
            </div>
            {/* Face */}
            <div>
              <div style={S.eyebrow}>FACE</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {FACE_PRESETS.map(fp => (
                  <button key={fp.id} onClick={() => updateAvatar({ facePreset: fp.id })} style={{
                    minWidth: 44, height: 50, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                    background: THEME.colors.ink, border: `2px solid ${avatarConfig.facePreset === fp.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 18 }}>😐</span>
                    <span style={{ fontSize: 7, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>{fp.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Skin */}
            <div>
              <div style={S.eyebrow}>SKIN</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {SKIN_TONES.map(tone => (
                  <button key={tone.id} onClick={() => updateAvatar({ skinTone: tone.id })} style={{
                    width: 30, height: 30, borderRadius: '50%', background: tone.hex, cursor: 'pointer',
                    border: avatarConfig.skinTone === tone.id ? `3px solid ${THEME.colors.gold}` : `2px solid ${THEME.colors.borderFaint}`,
                  }} />
                ))}
              </div>
            </div>
            {/* Hair */}
            <div>
              <div style={S.eyebrow}>HAIR</div>
              <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
                {availableHairStyles.map(hs => (
                  <button key={hs.id} onClick={() => updateAvatar({ hairStyle: hs.id })} style={{
                    padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                    background: avatarConfig.hairStyle === hs.id ? THEME.colors.gold : THEME.colors.ink,
                    color: avatarConfig.hairStyle === hs.id ? THEME.colors.void : THEME.colors.textMuted,
                    border: `1px solid ${avatarConfig.hairStyle === hs.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                  }}>{hs.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                {HAIR_COLORS.map(hc => (
                  <button key={hc.id} onClick={() => updateAvatar({ hairColor: hc.hex })} style={{
                    width: 22, height: 22, borderRadius: '50%', background: hc.hex, cursor: 'pointer',
                    border: avatarConfig.hairColor === hc.hex ? `2px solid ${THEME.colors.gold}` : `1px solid ${THEME.colors.borderFaint}`,
                  }} title={hc.label} />
                ))}
              </div>
            </div>
            {/* Eyes */}
            <div>
              <div style={S.eyebrow}>EYES</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EYE_COLORS.map(ec => (
                  <button key={ec.id} onClick={() => updateAvatar({ eyeColor: ec.id })} style={{
                    width: 26, height: 26, borderRadius: '50%', background: ec.hex, cursor: 'pointer',
                    border: avatarConfig.eyeColor === ec.id ? `2px solid ${THEME.colors.gold}` : `1px solid ${THEME.colors.borderFaint}`,
                  }} title={ec.id} />
                ))}
              </div>
            </div>
            {/* Facial Hair */}
            {avatarConfig.gender !== 'female' && (
              <div>
                <div style={S.eyebrow}>FACIAL HAIR</div>
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
                  {FACIAL_HAIR.map(fh => (
                    <button key={fh.id} onClick={() => updateAvatar({ facialHair: fh.id })} style={{
                      padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                      background: avatarConfig.facialHair === fh.id ? THEME.colors.gold : THEME.colors.ink,
                      color: avatarConfig.facialHair === fh.id ? THEME.colors.void : THEME.colors.textMuted,
                      border: `1px solid ${avatarConfig.facialHair === fh.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                      fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                    }}>{fh.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gear' && (
          <div>
            {/* Category chips */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8, marginBottom: 4 }}>
              {ALL_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setFilterCat(cat.key)} style={{
                  flexShrink: 0, padding: '5px 10px', borderRadius: 16, cursor: 'pointer',
                  background: filterCat === cat.key ? THEME.colors.gold : THEME.colors.ink,
                  color: filterCat === cat.key ? THEME.colors.void : THEME.colors.textMuted,
                  border: `1px solid ${filterCat === cat.key ? THEME.colors.gold : THEME.colors.borderFaint}`,
                  fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <span style={{ fontSize: 11 }}>{cat.emoji}</span> {cat.label}
                </button>
              ))}
            </div>
            {/* Owned / Shop / All toggle */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {(['all', 'owned', 'shop'] as const).map(f => (
                <button key={f} onClick={() => setFilterOwned(f)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 12, cursor: 'pointer',
                  background: filterOwned === f ? THEME.colors.dusk : 'transparent',
                  color: filterOwned === f ? THEME.colors.textPrimary : THEME.colors.textMuted,
                  border: `1px solid ${filterOwned === f ? THEME.colors.borderFaint : 'transparent'}`,
                  fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                }}>{f}</button>
              ))}
            </div>
            {/* Item grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {filteredItems.map(item => {
                const owned = ownedItemIds.has(item.id);
                const isEquipped = equippedItems[item.cat as keyof EquippedItems] === item.id;
                const isLegendary = 'setId' in item;
                const canAfford = playerCash >= item.cashCost && (!item.jewel || (playerJewels[item.jewel] || 0) >= item.jewelCost);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (owned) toggleEquip(item.cat, item.id);
                      else if (!isLegendary) buyItem(item);
                    }}
                    onMouseDown={() => setPreviewItem(item.id)}
                    onMouseUp={() => setPreviewItem(null)}
                    onMouseLeave={() => setPreviewItem(null)}
                    onTouchStart={() => setPreviewItem(item.id)}
                    onTouchEnd={() => setPreviewItem(null)}
                    style={{
                      background: THEME.colors.ink, borderRadius: 6, padding: 6, cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${isEquipped ? THEME.colors.gold : THEME.colors.borderFaint}`,
                      position: 'relative', opacity: !owned && isLegendary ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                      <ItemThumbnail category={item.cat} color={item.color} size={48} goldAccent={'goldAccent' in item && !!(item as any).goldAccent} />
                    </div>
                    {/* Status badge */}
                    {isEquipped && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: '50%',
                        background: THEME.colors.gold, color: THEME.colors.void, fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      }}>✓</div>
                    )}
                    {!owned && !isLegendary && (
                      <div style={{
                        position: 'absolute', top: 3, left: 3, fontSize: 7, padding: '1px 4px', borderRadius: 8,
                        background: canAfford ? `${THEME.colors.gold}30` : `${THEME.colors.crimson}20`,
                        color: canAfford ? THEME.colors.gold : THEME.colors.crimson,
                        fontFamily: THEME.fonts.mono,
                      }}>{formatCash(item.cashCost)}</div>
                    )}
                    {!owned && isLegendary && (
                      <div style={{ position: 'absolute', top: 3, left: 3, fontSize: 12, opacity: 0.6 }}>🔒</div>
                    )}
                    <div style={{
                      fontSize: 8, color: THEME.colors.textPrimary, fontFamily: THEME.fonts.display,
                      letterSpacing: 0.3, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{item.label}</div>
                    {/* Tier dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                      {Array.from({ length: isLegendary ? 4 : item.tier }).map((_, i) => (
                        <div key={i} style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: isLegendary ? THEME.colors.gold : i < item.tier ? THEME.colors.textMuted : THEME.colors.borderFaint,
                        }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legendary sets summary */}
            {filterCat === 'all' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ ...S.eyebrow, marginBottom: 8 }}>LEGENDARY SETS</div>
                {Object.entries(LEGENDARY_SETS).map(([setId, set]) => {
                  const piecesOwned = LEGENDARY_ITEMS.filter(i => i.setId === setId && ownedItemIds.has(i.id)).length;
                  const complete = piecesOwned >= set.pieces;
                  return (
                    <div key={setId} style={{
                      ...S.card, marginBottom: 8,
                      border: `1px solid ${complete ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                          {set.label}
                        </span>
                        <span style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                          {piecesOwned}/{set.pieces}
                        </span>
                      </div>
                      <div style={{ height: 3, background: THEME.colors.borderFaint, borderRadius: 2, marginTop: 6 }}>
                        <div style={{
                          height: '100%', width: `${(piecesOwned / set.pieces) * 100}%`,
                          background: complete ? THEME.colors.gold : THEME.colors.textMuted,
                          borderRadius: 2, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DressingRoomScreen;
