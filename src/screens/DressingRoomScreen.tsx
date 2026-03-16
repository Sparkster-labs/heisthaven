import { useState, useEffect, useRef, useCallback } from 'react';
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

const CATEGORIES = [
  { key: 'hat', label: 'HAT' },
  { key: 'mask', label: 'MASK' },
  { key: 'eyewear', label: 'EYEWEAR' },
  { key: 'top', label: 'TOP' },
  { key: 'coat', label: 'COAT' },
  { key: 'bottoms', label: 'BOTTOMS' },
  { key: 'shoes', label: 'SHOES' },
  { key: 'gloves', label: 'GLOVES' },
  { key: 'accessory', label: 'ACCESSORY' },
  { key: 'weapon', label: 'WEAPON' },
  { key: 'fullOutfit', label: 'FULL OUTFIT' },
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
  const [activeTab, setActiveTab] = useState<'customize' | 'wardrobe' | 'shop'>('customize');
  const [shopTier, setShopTier] = useState<1 | 2 | 3 | 'legendary'>(1);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Load data from DB ───
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

  // ─── Debounced save for avatar config ───
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

  // ─── Save equipped items ───
  const saveEquipped = async (items: EquippedItems) => {
    setEquippedItems(items);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ equippedItems: items as any }).eq('id', user.id);
  };

  const toggleEquip = (cat: string, itemId: string) => {
    const key = cat as keyof EquippedItems;
    const newItems = { ...equippedItems };
    if (newItems[key] === itemId) {
      (newItems as any)[key] = null;
    } else {
      (newItems as any)[key] = itemId;
    }
    saveEquipped(newItems);
  };

  // ─── Buy item ───
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
    if (item.jewel && item.jewelCost > 0) {
      newJewels[item.jewel] = (newJewels[item.jewel] || 0) - item.jewelCost;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [, insertRes] = await Promise.all([
      supabase.from('profiles').update({ cash: newCash, jewels: newJewels as any }).eq('id', user.id),
      supabase.from('wardrobe').insert({ user_id: user.id, item_id: item.id }),
    ]);

    if (insertRes.error) {
      toast({ title: 'Error', description: insertRes.error.message });
      return;
    }

    setPlayerCash(newCash);
    setPlayerJewels(newJewels);
    setOwnedItemIds(new Set([...ownedItemIds, item.id]));
    toast({ title: 'Purchased!', description: item.label });
  };

  const formatCash = (n: number) => '$' + n.toLocaleString();

  // ─── Compute displayed equipped (with preview override) ───
  const displayEquipped = previewItem
    ? (() => {
        const item = CLOTHING_ITEMS.find(i => i.id === previewItem);
        if (!item) return equippedItems;
        return { ...equippedItems, [item.cat]: item.id };
      })()
    : equippedItems;

  const backdrop = PHOTO_BACKDROPS[selectedBackdrop];

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  // Available hair styles for current gender
  const availableHairStyles = [
    ...(HAIR_STYLES[avatarConfig.gender] || []),
    ...(avatarConfig.gender !== 'neutral' ? HAIR_STYLES.neutral : []),
  ];

  return (
    <div style={S.page}>
      {/* ═══ PREVIEW PANEL ═══ */}
      <div style={{
        height: '44vh',
        minHeight: 280,
        background: `radial-gradient(ellipse at 50% 80%, ${backdrop?.accentColor || THEME.colors.gold}12 0%, transparent 70%), ${backdrop?.bgColor || '#0D0A12'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Back button */}
        <button onClick={onBack} style={{
          position: 'absolute', top: 12, left: 12, background: 'none', border: 'none',
          color: THEME.colors.textMuted, fontFamily: THEME.fonts.display, fontSize: 12,
          letterSpacing: 2, cursor: 'pointer',
        }}>
          ← BACK
        </button>

        {/* Photo mode button */}
        {onOpenPhotoMode && (
          <button onClick={onOpenPhotoMode} style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: `1px solid ${THEME.colors.borderFaint}`,
            color: THEME.colors.textMuted, fontFamily: THEME.fonts.display, fontSize: 11,
            letterSpacing: 1, cursor: 'pointer', padding: '4px 8px', borderRadius: 4,
          }}>
            📸
          </button>
        )}

        {/* Cash display */}
        <div style={{
          position: 'absolute', top: 12, right: onOpenPhotoMode ? 52 : 12,
          fontSize: 11, color: THEME.colors.gold, fontFamily: THEME.fonts.mono,
        }}>
          {formatCash(playerCash)}
        </div>

        <Avatar avatarConfig={avatarConfig} equippedItems={displayEquipped} size={180} />

        {/* Backdrop selector */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {PHOTO_BACKDROPS.slice(0, 4).map((bd, i) => (
            <button key={bd.id} onClick={() => setSelectedBackdrop(i)} style={{
              width: 32, height: 32, borderRadius: 4, border: `2px solid ${selectedBackdrop === i ? THEME.colors.gold : THEME.colors.borderFaint}`,
              background: bd.bgColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: bd.accentColor }} />
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${THEME.colors.borderFaint}`,
        background: THEME.colors.void,
      }}>
        {(['customize', 'wardrobe', 'shop'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${THEME.colors.gold}` : '2px solid transparent',
            color: activeTab === tab ? THEME.colors.textPrimary : THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 3,
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: THEME.space.md,
        maxWidth: 480, margin: '0 auto', width: '100%',
        paddingBottom: 40,
      }}>
        {/* ─── CUSTOMIZE TAB ─── */}
        {activeTab === 'customize' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.lg }}>
            {/* Gender */}
            <div>
              <div style={S.eyebrow}>GENDER</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['male', 'female', 'neutral'].map(g => (
                  <button key={g} onClick={() => updateAvatar({ gender: g })} style={{
                    flex: 1, padding: '8px 0', borderRadius: THEME.radius.pill, cursor: 'pointer',
                    background: avatarConfig.gender === g ? THEME.colors.gold : THEME.colors.ink,
                    color: avatarConfig.gender === g ? THEME.colors.void : THEME.colors.textMuted,
                    border: `1px solid ${avatarConfig.gender === g ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    fontFamily: THEME.fonts.display, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Face Preset */}
            <div>
              <div style={S.eyebrow}>FACE PRESET</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {FACE_PRESETS.map(fp => {
                  const skinHex = SKIN_TONES.find(t => t.id === avatarConfig.skinTone)?.hex || SKIN_TONES[0].hex;
                  return (
                    <button key={fp.id} onClick={() => updateAvatar({ facePreset: fp.id })} style={{
                      minWidth: 48, height: 56, borderRadius: 4, cursor: 'pointer',
                      background: skinHex, border: `2px solid ${avatarConfig.facePreset === fp.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 30 36" width={24} height={28}>
                        <ellipse cx={15} cy={16} rx={12} ry={14} fill={skinHex} stroke="#00000020" strokeWidth={0.5} />
                        <circle cx={11} cy={14} r={1.5} fill="#333" />
                        <circle cx={19} cy={14} r={1.5} fill="#333" />
                        <path d="M 11 20 Q 15 23 19 20" stroke="#00000030" strokeWidth={0.6} fill="none" />
                      </svg>
                      <span style={{ fontSize: 7, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>{fp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skin Tone */}
            <div>
              <div style={S.eyebrow}>SKIN TONE</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {SKIN_TONES.map(tone => (
                  <button key={tone.id} onClick={() => updateAvatar({ skinTone: tone.id })} style={{
                    width: 32, height: 32, borderRadius: '50%', background: tone.hex, cursor: 'pointer',
                    border: avatarConfig.skinTone === tone.id ? `3px solid ${THEME.colors.gold}` : `2px solid ${THEME.colors.borderFaint}`,
                    boxShadow: avatarConfig.skinTone === tone.id ? `0 0 0 3px ${THEME.colors.void}` : 'none',
                  }} />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <div style={S.eyebrow}>HAIR STYLE</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, flexWrap: 'nowrap' }}>
                {availableHairStyles.map(hs => (
                  <button key={hs.id} onClick={() => updateAvatar({ hairStyle: hs.id })} style={{
                    padding: '6px 12px', borderRadius: THEME.radius.pill, whiteSpace: 'nowrap', cursor: 'pointer',
                    background: avatarConfig.hairStyle === hs.id ? THEME.colors.gold : THEME.colors.ink,
                    color: avatarConfig.hairStyle === hs.id ? THEME.colors.void : THEME.colors.textMuted,
                    border: `1px solid ${avatarConfig.hairStyle === hs.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                    fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                  }}>
                    {hs.label}
                  </button>
                ))}
              </div>

              <div style={{ ...S.eyebrow, marginTop: THEME.space.md }}>HAIR COLOR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {HAIR_COLORS.map(hc => (
                  <button key={hc.id} onClick={() => updateAvatar({ hairColor: hc.hex })} style={{
                    width: 24, height: 24, borderRadius: '50%', background: hc.hex, cursor: 'pointer',
                    border: avatarConfig.hairColor === hc.hex ? `2px solid ${THEME.colors.gold}` : `1px solid ${THEME.colors.borderFaint}`,
                  }} title={hc.label} />
                ))}
              </div>
            </div>

            {/* Eyes */}
            <div>
              <div style={S.eyebrow}>EYE COLOR</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EYE_COLORS.map(ec => (
                  <button key={ec.id} onClick={() => updateAvatar({ eyeColor: ec.id })} style={{
                    width: 28, height: 28, borderRadius: '50%', background: ec.hex, cursor: 'pointer',
                    border: avatarConfig.eyeColor === ec.id ? `2px solid ${THEME.colors.gold}` : `1px solid ${THEME.colors.borderFaint}`,
                  }} title={ec.id} />
                ))}
              </div>
            </div>

            {/* Facial Hair (hidden for female) */}
            {avatarConfig.gender !== 'female' && (
              <div>
                <div style={S.eyebrow}>FACIAL HAIR</div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'nowrap' }}>
                  {FACIAL_HAIR.map(fh => (
                    <button key={fh.id} onClick={() => updateAvatar({ facialHair: fh.id })} style={{
                      padding: '6px 12px', borderRadius: THEME.radius.pill, whiteSpace: 'nowrap', cursor: 'pointer',
                      background: avatarConfig.facialHair === fh.id ? THEME.colors.gold : THEME.colors.ink,
                      color: avatarConfig.facialHair === fh.id ? THEME.colors.void : THEME.colors.textMuted,
                      border: `1px solid ${avatarConfig.facialHair === fh.id ? THEME.colors.gold : THEME.colors.borderFaint}`,
                      fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                    }}>
                      {fh.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── WARDROBE TAB ─── */}
        {activeTab === 'wardrobe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CATEGORIES.map(cat => {
              const ownedInCat = [...CLOTHING_ITEMS, ...LEGENDARY_ITEMS].filter(
                i => i.cat === cat.key && ownedItemIds.has(i.id)
              );
              const isExpanded = expandedCat === cat.key;
              return (
                <div key={cat.key}>
                  <button onClick={() => setExpandedCat(isExpanded ? null : cat.key)} style={{
                    width: '100%', padding: '12px 0', background: 'none', border: 'none',
                    borderBottom: `1px solid ${THEME.colors.borderFaint}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  }}>
                    <span style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textPrimary, letterSpacing: 2 }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: 10, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                      {ownedInCat.length} owned {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: `${THEME.space.sm}px 0` }}>
                      {ownedInCat.length === 0 ? (
                        <div style={{ fontSize: 11, color: THEME.colors.textMuted, fontFamily: THEME.fonts.body, fontStyle: 'italic', padding: 8 }}>
                          No {cat.label.toLowerCase()} owned — visit the Shop tab
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {ownedInCat.map(item => {
                            const isEquipped = equippedItems[cat.key as keyof EquippedItems] === item.id;
                            return (
                              <button key={item.id} onClick={() => toggleEquip(cat.key, item.id)} style={{
                                background: THEME.colors.ink, border: `2px solid ${isEquipped ? THEME.colors.gold : THEME.colors.borderFaint}`,
                                borderRadius: 6, padding: 8, cursor: 'pointer', textAlign: 'center', position: 'relative',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                                  <ItemThumbnail category={cat.key} color={item.color} size={60} goldAccent={'goldAccent' in item && !!(item as any).goldAccent} />
                                </div>
                                {isEquipped && (
                                  <div style={{
                                    position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%',
                                    background: THEME.colors.gold, color: THEME.colors.void, fontSize: 11,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                  }}>✓</div>
                                )}
                                <div style={{ fontSize: 10, color: THEME.colors.textPrimary, fontFamily: THEME.fonts.display, letterSpacing: 0.5 }}>
                                  {item.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── SHOP TAB ─── */}
        {activeTab === 'shop' && (
          <div>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: THEME.space.md }}>
              {([1, 2, 3, 'legendary'] as const).map(tier => (
                <button key={tier} onClick={() => setShopTier(tier)} style={{
                  flex: 1, padding: '8px 0', borderRadius: THEME.radius.pill, cursor: 'pointer',
                  background: shopTier === tier ? THEME.colors.gold : THEME.colors.ink,
                  color: shopTier === tier ? THEME.colors.void : THEME.colors.textMuted,
                  border: `1px solid ${shopTier === tier ? THEME.colors.gold : THEME.colors.borderFaint}`,
                  fontFamily: THEME.fonts.display, fontSize: 9, letterSpacing: 1,
                }}>
                  {tier === 'legendary' ? '★' : `T${tier}`}
                </button>
              ))}
            </div>

            {shopTier !== 'legendary' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {CLOTHING_ITEMS
                  .filter(i => i.tier === shopTier)
                  .filter(i => i.gender === 'all' || i.gender === avatarConfig.gender)
                  .map(item => {
                    const owned = ownedItemIds.has(item.id);
                    const canAfford = playerCash >= item.cashCost &&
                      (!item.jewel || (playerJewels[item.jewel] || 0) >= item.jewelCost);
                    return (
                      <div key={item.id} style={{
                        background: THEME.colors.ink, border: `1px solid ${THEME.colors.borderFaint}`,
                        borderRadius: 6, padding: 8, textAlign: 'center',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, position: 'relative' }}>
                          <ItemThumbnail category={item.cat} color={item.color} size={60} />
                          {owned && (
                            <div style={{
                              position: 'absolute', inset: 0, background: `${THEME.colors.emerald}20`,
                              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.emerald, letterSpacing: 1,
                            }}>OWNED</div>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.colors.textPrimary, fontFamily: THEME.fonts.display, marginBottom: 4, letterSpacing: 0.5 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.colors.gold, fontFamily: THEME.fonts.mono, marginBottom: 6 }}>
                          {formatCash(item.cashCost)}
                          {item.jewel && ` + ${JEWEL_EMOJIS[item.jewel] || ''}×${item.jewelCost}`}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onMouseDown={() => setPreviewItem(item.id)}
                            onMouseUp={() => setPreviewItem(null)}
                            onMouseLeave={() => setPreviewItem(null)}
                            onTouchStart={() => setPreviewItem(item.id)}
                            onTouchEnd={() => setPreviewItem(null)}
                            style={{
                              flex: 1, padding: '4px 0', fontSize: 8, fontFamily: THEME.fonts.display,
                              letterSpacing: 1, background: 'none', border: `1px solid ${THEME.colors.borderFaint}`,
                              color: THEME.colors.textMuted, borderRadius: 3, cursor: 'pointer',
                            }}
                          >
                            PREVIEW
                          </button>
                          {!owned && (
                            <button onClick={() => buyItem(item)} style={{
                              flex: 1, padding: '4px 0', fontSize: 8, fontFamily: THEME.fonts.display,
                              letterSpacing: 1, borderRadius: 3, cursor: 'pointer', border: 'none',
                              background: canAfford ? THEME.colors.gold : THEME.colors.borderFaint,
                              color: canAfford ? THEME.colors.void : THEME.colors.textMuted,
                            }}>
                              BUY
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* LEGENDARY SUB-TAB */
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: THEME.space.lg }}>
                  {LEGENDARY_ITEMS.map(item => {
                    const owned = ownedItemIds.has(item.id);
                    const cityColor = THEME.cityColors[item.city as keyof typeof THEME.cityColors] || THEME.colors.gold;
                    return (
                      <div key={item.id} style={{
                        background: THEME.colors.ink, border: `1px solid ${THEME.colors.borderFaint}`,
                        borderRadius: 6, padding: 8, textAlign: 'center', position: 'relative',
                        animation: owned ? undefined : 'none',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, position: 'relative' }}>
                          <ItemThumbnail category={item.cat} color={item.color} size={60} goldAccent={item.goldAccent} />
                          {!owned && (
                            <div style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18, opacity: 0.6, filter: 'saturate(0.3)',
                            }}>🔒</div>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.colors.textPrimary, fontFamily: THEME.fonts.display, letterSpacing: 0.5, marginBottom: 2 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 8, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: 2 }}>
                          DROPS FROM: {item.bossLabel}
                        </div>
                        <div style={{ fontSize: 8, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: 4 }}>
                          VAULT: {item.vault}
                        </div>
                        <span style={{
                          display: 'inline-block', fontSize: 8, padding: '2px 6px', borderRadius: THEME.radius.pill,
                          background: `${cityColor}20`, color: cityColor, fontFamily: THEME.fonts.display, letterSpacing: 1,
                        }}>
                          {item.city.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {owned && (
                          <div style={{ fontSize: 9, color: THEME.colors.emerald, fontFamily: THEME.fonts.display, marginTop: 4, letterSpacing: 1 }}>
                            ✓ COLLECTED
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Set completion cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.md }}>
                  {Object.entries(LEGENDARY_SETS).map(([setId, set]) => {
                    const piecesOwned = LEGENDARY_ITEMS.filter(i => i.setId === setId && ownedItemIds.has(i.id)).length;
                    const complete = piecesOwned >= set.pieces;
                    const cityColor = THEME.cityColors[set.city as keyof typeof THEME.cityColors] || THEME.colors.gold;
                    return (
                      <div key={setId} style={{
                        ...S.card,
                        border: `1px solid ${complete ? THEME.colors.gold : THEME.colors.borderFaint}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontFamily: THEME.fonts.display, fontSize: 12, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                            {set.label}
                          </div>
                          {complete && (
                            <span style={{
                              fontSize: 8, padding: '2px 8px', borderRadius: THEME.radius.pill,
                              background: THEME.colors.gold, color: THEME.colors.void,
                              fontFamily: THEME.fonts.display, letterSpacing: 1,
                            }}>SET COMPLETE</span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: cityColor, fontFamily: THEME.fonts.mono, marginBottom: 6 }}>
                          {piecesOwned}/{set.pieces} PIECES
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: 4, background: THEME.colors.borderFaint, borderRadius: 2, marginBottom: 8 }}>
                          <div style={{
                            height: '100%', width: `${(piecesOwned / set.pieces) * 100}%`,
                            background: complete ? THEME.colors.gold : cityColor,
                            borderRadius: 2, transition: 'width 0.3s',
                          }} />
                        </div>
                        <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.body }}>
                          Bonus: {set.bonus}
                        </div>
                        <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.body }}>
                          Exclusive pose: {set.pose.replace(/_/g, ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DressingRoomScreen;
