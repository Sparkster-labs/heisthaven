import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { EMPIRE_ASSETS, EMPIRE_CATEGORIES, getUpgradeCost, getIncomeAtLevel } from '@/lib/empireData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';


interface EmpireScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface OwnedAsset {
  asset_id: string;
  level: number;
  last_collected: string;
}

const jewelEmojis: Record<string, string> = { pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎' };

const EmpireScreen = ({ activeTab, onTabChange }: EmpireScreenProps) => {
  const [cash, setCash] = useState(0);
  const [jewels, setJewels] = useState<Record<string, number>>({});
  const [repLevel, setRepLevel] = useState(1);
  const [unlockedCities, setUnlockedCities] = useState<string[]>(['new_cavendish']);
  const [ownedAssets, setOwnedAssets] = useState<OwnedAsset[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('business');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profileRes, assetsRes] = await Promise.all([
      supabase.from('profiles').select('cash, jewels, rep_level, unlocked_cities').eq('id', user.id).single(),
      supabase.from('owned_assets').select('asset_id, level, last_collected').eq('user_id', user.id),
    ]);
    if (profileRes.data) {
      setCash(profileRes.data.cash);
      setJewels(profileRes.data.jewels as Record<string, number>);
      setRepLevel(profileRes.data.rep_level);
      setUnlockedCities(profileRes.data.unlocked_cities);
    }
    if (assetsRes.data) setOwnedAssets(assetsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePurchase = async (asset: typeof EMPIRE_ASSETS[number]) => {
    if (acting) return;
    const owned = ownedAssets.find(a => a.asset_id === asset.id);
    if (owned) return;
    if (cash < asset.cost) { toast({ title: 'Insufficient funds' }); return; }
    if (asset.jewelCost && (jewels[asset.jewelCost.type] || 0) < asset.jewelCost.count) {
      toast({ title: `Need ${asset.jewelCost.count} ${asset.jewelCost.type}` }); return;
    }
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    let newCash = cash - asset.cost;
    let newJewels = { ...jewels };
    if (asset.jewelCost) {
      newJewels[asset.jewelCost.type] = (newJewels[asset.jewelCost.type] || 0) - asset.jewelCost.count;
    }

    await Promise.all([
      supabase.from('profiles').update({ cash: newCash, jewels: newJewels as any }).eq('id', user.id),
      supabase.from('owned_assets').insert({ user_id: user.id, asset_id: asset.id, asset_type: asset.category }),
    ]);

    setActing(false);
    toast({ title: `${asset.emoji} ${asset.name}`, description: 'Acquired!' });
    fetchData();
  };

  const handleUpgrade = async (asset: typeof EMPIRE_ASSETS[number]) => {
    if (acting) return;
    const owned = ownedAssets.find(a => a.asset_id === asset.id);
    if (!owned || owned.level >= asset.maxLevel) return;
    const upgCost = getUpgradeCost(asset, owned.level);
    if (cash < upgCost) { toast({ title: 'Insufficient funds' }); return; }
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await Promise.all([
      supabase.from('profiles').update({ cash: cash - upgCost }).eq('id', user.id),
      supabase.from('owned_assets').update({ level: owned.level + 1 }).eq('user_id', user.id).eq('asset_id', asset.id),
    ]);

    setActing(false);
    toast({ title: `${asset.emoji} Upgraded to Level ${owned.level + 1}` });
    fetchData();
  };

  const handleCollectIncome = async () => {
    if (acting) return;
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    let totalIncome = 0;
    const now = Date.now();
    for (const owned of ownedAssets) {
      const asset = EMPIRE_ASSETS.find(a => a.id === owned.asset_id);
      if (!asset?.incomePerHour) continue;
      const hoursSince = Math.min(24, (now - new Date(owned.last_collected).getTime()) / 3600000);
      const income = Math.floor(getIncomeAtLevel(asset, owned.level) * hoursSince);
      totalIncome += income;
    }

    if (totalIncome <= 0) {
      toast({ title: 'No income to collect yet' });
      setActing(false);
      return;
    }

    await supabase.from('profiles').update({ cash: cash + totalIncome }).eq('id', user.id);
    // Update all last_collected timestamps
    for (const owned of ownedAssets) {
      const asset = EMPIRE_ASSETS.find(a => a.id === owned.asset_id);
      if (asset?.incomePerHour) {
        await supabase.from('owned_assets').update({ last_collected: new Date().toISOString() })
          .eq('user_id', user.id).eq('asset_id', owned.asset_id);
      }
    }

    setActing(false);
    toast({ title: `💰 Collected $${totalIncome.toLocaleString()}`, description: 'Business income deposited.' });
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const filteredAssets = EMPIRE_ASSETS.filter(a => a.category === selectedCat);
  const totalIncomePerHour = ownedAssets.reduce((sum, owned) => {
    const asset = EMPIRE_ASSETS.find(a => a.id === owned.asset_id);
    if (!asset?.incomePerHour) return sum;
    return sum + getIncomeAtLevel(asset, owned.level);
  }, 0);

  return (
    <div style={S.page} className="screen-enter">
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>
        <div style={S.eyebrow}>YOUR CRIMINAL</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.md }}>EMPIRE</h1>

        {/* Wealth summary */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>CASH</div>
            <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.gold }}>${cash.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>INCOME/HR</div>
            <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.emerald }}>${totalIncomePerHour}</div>
          </div>
          <div>
            <div style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>ASSETS</div>
            <div style={{ fontSize: 18, fontFamily: THEME.fonts.mono, fontWeight: 700, color: THEME.colors.textPrimary }}>{ownedAssets.length}</div>
          </div>
        </div>

        {/* Collect income button */}
        {totalIncomePerHour > 0 && (
          <button onClick={handleCollectIncome} disabled={acting} style={{
            ...S.btnPrimary, marginBottom: THEME.space.lg,
            background: `linear-gradient(135deg, ${THEME.colors.gold}, ${THEME.colors.goldBright})`,
          }}>
            {acting ? 'COLLECTING...' : '💰 COLLECT BUSINESS INCOME'}
          </button>
        )}

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 4, marginBottom: THEME.space.lg, overflowX: 'auto', paddingBottom: 4 }}>
          {EMPIRE_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
              padding: '8px 12px', borderRadius: THEME.radius.pill, whiteSpace: 'nowrap', cursor: 'pointer',
              background: selectedCat === cat.key ? `${THEME.colors.gold}20` : 'transparent',
              color: selectedCat === cat.key ? THEME.colors.gold : THEME.colors.textMuted,
              border: `1px solid ${selectedCat === cat.key ? THEME.colors.gold : THEME.colors.borderFaint}`,
              fontFamily: THEME.fonts.display, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Asset cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
          {filteredAssets.map(asset => {
            const owned = ownedAssets.find(a => a.asset_id === asset.id);
            const isOwned = !!owned;
            const canAfford = cash >= asset.cost && (!asset.jewelCost || (jewels[asset.jewelCost.type] || 0) >= asset.jewelCost.count);
            const meetsRep = repLevel >= asset.repRequired;
            const meetsCity = !asset.requiredCity || unlockedCities.includes(asset.requiredCity);
            const isExpanded = selectedAsset === asset.id;
            const isMaxed = isOwned && owned.level >= asset.maxLevel;

            return (
              <div key={asset.id} onClick={() => setSelectedAsset(isExpanded ? null : asset.id)} style={{
                ...S.card, padding: THEME.space.md, cursor: 'pointer',
                opacity: (!meetsRep || !meetsCity) && !isOwned ? 0.4 : 1,
                border: `1px solid ${isOwned ? THEME.colors.emerald + '40' : THEME.colors.borderFaint}`,
                position: 'relative', overflow: 'hidden',
              }}>
                {isOwned && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0, padding: '2px 8px',
                    background: THEME.colors.emerald, color: THEME.colors.void,
                    fontSize: 7, fontFamily: THEME.fonts.display, letterSpacing: 1, borderRadius: '0 0 0 6px',
                  }}>
                    {isMaxed ? 'MAX' : `LVL ${owned.level}`}
                  </div>
                )}

                <div style={{ display: 'flex', gap: THEME.space.md, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{asset.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: THEME.fonts.display, fontSize: 13, color: THEME.colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                      {asset.name}
                    </div>
                    <div style={{ fontFamily: THEME.fonts.body, fontSize: 11, color: THEME.colors.textSecondary, lineHeight: 1.4, marginBottom: 6 }}>
                      {asset.description}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: THEME.space.sm, flexWrap: 'wrap' }}>
                      {!isOwned && (
                        <span style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, fontWeight: 700 }}>
                          ${asset.cost.toLocaleString()}
                          {asset.jewelCost && ` + ${asset.jewelCost.count}${jewelEmojis[asset.jewelCost.type]}`}
                        </span>
                      )}
                      {asset.incomePerHour && (
                        <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald }}>
                          +${isOwned ? getIncomeAtLevel(asset, owned.level) : asset.incomePerHour}/hr
                        </span>
                      )}
                      {asset.heistBonus && (
                        <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.sapphire }}>
                          {asset.heistBonus}
                        </span>
                      )}
                    </div>

                    {!meetsRep && !isOwned && (
                      <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby, marginTop: 4 }}>
                        REP {asset.repRequired} REQUIRED (You: {repLevel})
                      </div>
                    )}
                    {!meetsCity && !isOwned && asset.requiredCity && (
                      <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby, marginTop: 2 }}>
                        UNLOCK {asset.requiredCity.replace(/_/g, ' ').toUpperCase()} FIRST
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: THEME.space.md, paddingTop: THEME.space.md, borderTop: `1px solid ${THEME.colors.borderFaint}` }}>
                    <p style={{ fontFamily: THEME.fonts.body, fontSize: 11, fontStyle: 'italic', color: THEME.colors.textMuted, lineHeight: 1.6, marginBottom: THEME.space.md }}>
                      "{asset.lore}"
                    </p>

                    {!isOwned && meetsRep && meetsCity && (
                      <button onClick={(e) => { e.stopPropagation(); handlePurchase(asset); }} disabled={!canAfford || acting} style={{
                        ...S.btnPrimary, fontSize: 11, padding: '10px 16px',
                        opacity: !canAfford ? 0.4 : acting ? 0.6 : 1,
                      }}>
                        {acting ? 'PURCHASING...' : !canAfford ? "CAN'T AFFORD" : 'PURCHASE'}
                      </button>
                    )}

                    {isOwned && !isMaxed && (
                      <button onClick={(e) => { e.stopPropagation(); handleUpgrade(asset); }} disabled={acting || cash < getUpgradeCost(asset, owned.level)} style={{
                        ...S.btnPrimary, fontSize: 11, padding: '10px 16px',
                        opacity: cash < getUpgradeCost(asset, owned.level) ? 0.4 : acting ? 0.6 : 1,
                      }}>
                        {acting ? 'UPGRADING...' : `UPGRADE TO LVL ${owned.level + 1} — $${getUpgradeCost(asset, owned.level).toLocaleString()}`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default EmpireScreen;
