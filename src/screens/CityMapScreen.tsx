import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { CITIES } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

interface CityMapScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface ProfileData {
  cash: number;
  rep_level: number;
  current_city: string;
  unlocked_cities: string[];
  jewels: Record<string, number>;
}

interface CityProgressRow {
  city_id: string;
  unlocked_districts: string[];
  district_heat: Record<string, number>;
  boss_vault_cleared: boolean;
}

const formatDistrict = (d: string) => d.replace(/_/g, ' ');

const jewelEmojis: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const canAffordCity = (profile: ProfileData, city: typeof CITIES[keyof typeof CITIES]) => {
  if (profile.cash < city.unlockCost) return false;
  if (profile.rep_level < city.repRequired) return false;
  if (city.jewelCost) {
    const jc = city.jewelCost;
    if ((profile.jewels[jc.type] || 0) < jc.count) return false;
    if ('extra' in jc && jc.extra) {
      const extra = jc.extra as { type: string; count: number };
      if ((profile.jewels[extra.type] || 0) < extra.count) return false;
    }
  }
  return true;
};

const formatJewelCost = (city: typeof CITIES[keyof typeof CITIES]) => {
  if (!city.jewelCost) return '';
  const jc = city.jewelCost;
  let str = `${jc.count} ${jewelEmojis[jc.type] || jc.type}`;
  if ('extra' in jc && jc.extra) {
    const extra = jc.extra as { type: string; count: number };
    str += ` + ${extra.count} ${jewelEmojis[extra.type] || extra.type}`;
  }
  return str;
};

const districtEmojis: Record<string, string> = {
  docks: '⚓', market_square: '🏪', old_quarter: '🏛️', financial_row: '🏦',
  harborfront: '🌊', neon_strip: '🎰', the_undercity: '🕳️', clocktower_district: '🕰️',
  foundry_row: '🔥', the_yards: '🏗️', smelter_heights: '⛰️', the_pit: '🕳️',
  crystal_promenade: '💎', the_spires: '🗼', palace_grounds: '🏰', the_sanctum: '⛩️',
};

const CityMapScreen = ({ activeTab, onTabChange }: CityMapScreenProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [cityProgress, setCityProgress] = useState<CityProgressRow[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [travelModal, setTravelModal] = useState<string | null>(null);
  const [unlockModal, setUnlockModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, progressRes] = await Promise.all([
      supabase.from('profiles').select('cash, rep_level, current_city, unlocked_cities, jewels').eq('id', user.id).single(),
      supabase.from('city_progress').select('*').eq('user_id', user.id),
    ]);

    if (profileRes.data) {
      setProfile({
        ...profileRes.data,
        jewels: profileRes.data.jewels as Record<string, number>,
      });
      setSelectedCity(profileRes.data.current_city);
    }
    if (progressRes.data) {
      setCityProgress(progressRes.data.map(r => ({
        ...r,
        district_heat: r.district_heat as Record<string, number>,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleTravel = async (cityId: string) => {
    if (!profile || acting) return;
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ current_city: cityId }).eq('id', user.id);

    // Create city_progress if not exists
    const exists = cityProgress.find(cp => cp.city_id === cityId);
    if (!exists) {
      const city = CITIES[cityId as keyof typeof CITIES];
      await supabase.from('city_progress').insert({
        user_id: user.id,
        city_id: cityId,
        unlocked_districts: [city.districts[0]],
      });
    }

    setTravelModal(null);
    setActing(false);
    const city = CITIES[cityId as keyof typeof CITIES];
    toast({ title: `✈️ Arrived in ${city.name}`, description: city.tagline });
    fetchData();
  };

  const handleUnlockCity = async (cityId: string) => {
    if (!profile || acting) return;
    const city = CITIES[cityId as keyof typeof CITIES];
    if (!canAffordCity(profile, city)) return;

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    // Deduct jewels if needed
    const updatedJewels = { ...profile.jewels };
    if (city.jewelCost) {
      updatedJewels[city.jewelCost.type] = (updatedJewels[city.jewelCost.type] || 0) - city.jewelCost.count;
      if ('extra' in city.jewelCost && city.jewelCost.extra) {
        const extra = city.jewelCost.extra as { type: string; count: number };
        updatedJewels[extra.type] = (updatedJewels[extra.type] || 0) - extra.count;
      }
    }

    await supabase.from('profiles').update({
      cash: profile.cash - city.unlockCost,
      unlocked_cities: [...profile.unlocked_cities, cityId],
      jewels: updatedJewels as unknown as Json,
    }).eq('id', user.id);

    await supabase.from('city_progress').insert({
      user_id: user.id,
      city_id: cityId,
      unlocked_districts: [city.districts[0]],
    });

    setUnlockModal(null);
    setActing(false);
    fetchData();
  };

  const handleUnlockDistrict = async (cityId: string, districtId: string) => {
    if (!profile || acting) return;
    const cost = 500; // base district unlock cost
    if (profile.cash < cost) return;

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const cp = cityProgress.find(c => c.city_id === cityId);
    if (!cp) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: profile.cash - cost }).eq('id', user.id);
    await supabase.from('city_progress').update({
      unlocked_districts: [...cp.unlocked_districts, districtId],
    }).eq('user_id', user.id).eq('city_id', cityId);

    setActing(false);
    fetchData();
  };

  if (loading || !profile) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const cityEntries = Object.entries(CITIES) as [string, typeof CITIES[keyof typeof CITIES]][];
  const viewCity = selectedCity ? CITIES[selectedCity as keyof typeof CITIES] : null;
  const viewProgress = selectedCity ? cityProgress.find(cp => cp.city_id === selectedCity) : null;
  const isUnlocked = (cityId: string) => profile.unlocked_cities.includes(cityId);
  const isCurrent = (cityId: string) => profile.current_city === cityId;

  return (
    <div style={S.page} className="screen-enter">
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>
        <div style={S.eyebrow}>THE UNDERWORLD</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.lg }}>CITY MAP</h1>

        {/* City selector pills */}
        <div style={{ display: 'flex', gap: THEME.space.sm, marginBottom: THEME.space.xl, overflowX: 'auto', paddingBottom: 4 }}>
          {cityEntries.map(([id, city]) => {
            const unlocked = isUnlocked(id);
            const active = selectedCity === id;
            return (
              <button
                key={id}
                onClick={() => unlocked ? setSelectedCity(id) : setUnlockModal(id)}
                style={{
                  background: active ? `${city.accentColor}20` : 'transparent',
                  border: `1px solid ${active ? city.accentColor : unlocked ? THEME.colors.borderFaint : THEME.colors.borderFaint}`,
                  borderRadius: THEME.radius.pill,
                  padding: '6px 14px',
                  fontFamily: THEME.fonts.display,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: active ? city.accentColor : unlocked ? THEME.colors.textSecondary : THEME.colors.textMuted,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: unlocked ? 1 : 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {unlocked ? '' : '🔒 '}{city.name}
              </button>
            );
          })}
        </div>

        {/* Selected city detail */}
        {viewCity && selectedCity && isUnlocked(selectedCity) && (
          <>
            {/* City header */}
            <div style={{ ...S.card, marginBottom: THEME.space.lg, position: 'relative', overflow: 'hidden' }}>
              {/* Accent glow */}
              <div style={{
                position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                borderRadius: '50%', background: `${viewCity.accentColor}08`,
                filter: 'blur(40px)',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: THEME.space.sm }}>
                  <div>
                    <div style={{
                      fontFamily: THEME.fonts.display, fontSize: 20, color: viewCity.accentColor,
                      letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
                    }}>
                      {viewCity.name}
                    </div>
                    <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, fontStyle: 'italic', color: THEME.colors.textSecondary }}>
                      {viewCity.tagline}
                    </div>
                  </div>
                  {isCurrent(selectedCity) ? (
                    <div style={{
                      fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 2,
                      padding: '3px 10px', borderRadius: THEME.radius.pill,
                      background: `${THEME.colors.emerald}20`, color: THEME.colors.emerald,
                      border: `1px solid ${THEME.colors.emerald}40`,
                    }}>
                      YOU ARE HERE
                    </div>
                  ) : (
                    <button
                      onClick={() => setTravelModal(selectedCity)}
                      style={{
                        fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 2,
                        padding: '3px 10px', borderRadius: THEME.radius.pill,
                        background: `${viewCity.accentColor}15`, color: viewCity.accentColor,
                        border: `1px solid ${viewCity.accentColor}40`,
                        cursor: 'pointer',
                      }}
                    >
                      TRAVEL
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Districts */}
            <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>DISTRICTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
              {viewCity.districts.map((districtId) => {
                const districtUnlocked = viewProgress?.unlocked_districts.includes(districtId);
                const heat = viewProgress?.district_heat[districtId] || 0;
                const heatColor = heat > 60 ? THEME.colors.ruby : heat > 30 ? THEME.colors.warning : THEME.colors.emerald;

                return (
                  <div
                    key={districtId}
                    style={{
                      ...S.card, padding: THEME.space.md,
                      opacity: districtUnlocked ? 1 : 0.4,
                      border: `1px solid ${districtUnlocked ? THEME.colors.borderFaint : THEME.colors.borderFaint}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm }}>
                        <span style={{ fontSize: 20 }}>{districtEmojis[districtId] || '📍'}</span>
                        <div>
                          <div style={{
                            fontFamily: THEME.fonts.display, fontSize: 12, color: THEME.colors.textPrimary,
                            letterSpacing: 1, textTransform: 'uppercase',
                          }}>
                            {formatDistrict(districtId)}
                          </div>
                          {districtUnlocked && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                              <span style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>
                                HEAT
                              </span>
                              <div style={{ width: 50, height: 3, background: THEME.colors.borderFaint, borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${heat}%`,
                                  background: heatColor, borderRadius: 2,
                                  transition: 'width 0.3s',
                                }} />
                              </div>
                              <span style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: heatColor }}>
                                {heat}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {!districtUnlocked && (
                        <button
                          onClick={() => handleUnlockDistrict(selectedCity, districtId)}
                          disabled={profile.cash < 500 || acting}
                          style={{
                            fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 1,
                            padding: '4px 10px', borderRadius: THEME.radius.sm,
                            background: profile.cash >= 500 ? `${THEME.colors.gold}15` : 'transparent',
                            color: profile.cash >= 500 ? THEME.colors.gold : THEME.colors.textMuted,
                            border: `1px solid ${profile.cash >= 500 ? THEME.colors.gold : THEME.colors.borderFaint}40`,
                            cursor: profile.cash >= 500 ? 'pointer' : 'default',
                          }}
                        >
                          🔒 $500
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Locked city info */}
        {selectedCity && !isUnlocked(selectedCity) && viewCity && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: THEME.space.md }}>🔒</div>
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 18, color: viewCity.accentColor,
              letterSpacing: 2, textTransform: 'uppercase', marginBottom: THEME.space.sm,
            }}>
              {viewCity.name}
            </div>
            <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 13, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg }}>
              {viewCity.tagline}
            </div>
            <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.sm }}>
              Requires: Rep Level {viewCity.repRequired}
              {profile.rep_level >= viewCity.repRequired ? ' ✓' : ` (You: ${profile.rep_level})`}
            </div>
            <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, marginBottom: THEME.space.lg }}>
              Cost: ${viewCity.unlockCost.toLocaleString()}
            </div>
            <button
              onClick={() => setUnlockModal(selectedCity)}
              disabled={profile.cash < viewCity.unlockCost || profile.rep_level < viewCity.repRequired}
              style={{
                ...S.btnPrimary,
                opacity: profile.cash >= viewCity.unlockCost && profile.rep_level >= viewCity.repRequired ? 1 : 0.4,
              }}
            >
              UNLOCK CITY
            </button>
          </div>
        )}
      </div>

      {/* Travel modal */}
      {travelModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: THEME.space.lg }}
          onClick={() => setTravelModal(null)}
        >
          <div style={{ ...S.card, maxWidth: 300, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>✈️</div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.textPrimary, letterSpacing: 2, marginBottom: THEME.space.md }}>
              TRAVEL TO {CITIES[travelModal as keyof typeof CITIES]?.name.toUpperCase()}?
            </div>
            <div style={{ fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg }}>
              Jobs will refresh for the new city.
            </div>
            <button onClick={() => handleTravel(travelModal)} disabled={acting} style={{ ...S.btnPrimary, marginBottom: THEME.space.sm }}>
              {acting ? 'TRAVELING...' : 'CONFIRM TRAVEL'}
            </button>
            <button onClick={() => setTravelModal(null)} style={S.btnGhost}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Unlock city modal */}
      {unlockModal && (() => {
        const city = CITIES[unlockModal as keyof typeof CITIES];
        if (!city) return null;
        const canAfford = profile.cash >= city.unlockCost && profile.rep_level >= city.repRequired;
        return (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: THEME.space.lg }}
            onClick={() => setUnlockModal(null)}
          >
            <div style={{ ...S.card, maxWidth: 300, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🗝️</div>
              <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: city.accentColor, letterSpacing: 2, marginBottom: THEME.space.sm }}>
                UNLOCK {city.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 12, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg }}>
                {city.tagline}
              </div>
              <div style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: 4 }}>
                Rep Required: {city.repRequired} {profile.rep_level >= city.repRequired ? '✓' : '✗'}
              </div>
              <div style={{ fontSize: 14, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, marginBottom: THEME.space.lg }}>
                ${city.unlockCost.toLocaleString()}
              </div>
              {canAfford ? (
                <button onClick={() => handleUnlockCity(unlockModal)} disabled={acting} style={{ ...S.btnPrimary, marginBottom: THEME.space.sm }}>
                  {acting ? 'UNLOCKING...' : 'UNLOCK'}
                </button>
              ) : (
                <div style={{ fontSize: 11, color: THEME.colors.danger, fontFamily: THEME.fonts.mono, marginBottom: THEME.space.sm }}>
                  {profile.rep_level < city.repRequired ? 'REP TOO LOW' : 'INSUFFICIENT FUNDS'}
                </div>
              )}
              <button onClick={() => setUnlockModal(null)} style={S.btnGhost}>CANCEL</button>
            </div>
          </div>
        );
      })()}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default CityMapScreen;
