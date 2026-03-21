import { useState, useEffect, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CITIES } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';


interface JobBoardScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectVault: (vault: typeof VAULTS[number]) => void;
}

interface GeneratedJob {
  vault: typeof VAULTS[number];
  expiresAt: number;
  intelTier: 'none' | 'partial' | 'full';
  isChain: boolean;
}

const REFRESH_COST = 50;
const EXPIRY_HOURS = 8;

const tierAccentColors: Record<number, string> = {
  1: THEME.colors.goldDim,
  2: THEME.colors.gold,
  3: THEME.colors.sapphire,
  4: THEME.colors.ruby,
  5: THEME.colors.diamond,
};

const intelColors: Record<string, string> = {
  none: THEME.colors.textMuted,
  partial: THEME.colors.warning,
  full: THEME.colors.emerald,
};

const intelLabels: Record<string, string> = {
  none: 'NO INTEL',
  partial: 'PARTIAL',
  full: 'FULL',
};

const formatDistrict = (d: string) => d.replace(/_/g, ' ').toUpperCase();

const generateJobs = (repLevel: number, currentCity: string): GeneratedJob[] => {
  // Filter vaults by current city, weighted towards player rep
  const cityVaults = VAULTS.filter(v => v.city === currentCity);
  const weighted = cityVaults.filter(v => v.difficulty <= repLevel + 1);
  const pool = weighted.length >= 3 ? weighted : cityVaults;

  // Pick 3 random (unique)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  const expiresAt = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000;
  const intelTiers: Array<'none' | 'partial' | 'full'> = ['none', 'partial', 'full'];

  return picked.map((vault, i) => ({
    vault,
    expiresAt,
    intelTier: intelTiers[Math.floor(Math.random() * 3)],
    isChain: i === 0, // first job is always a chain starter
  }));
};

const JobBoardScreen = ({ activeTab, onTabChange, onSelectVault }: JobBoardScreenProps) => {
  const [jobs, setJobs] = useState<GeneratedJob[]>([]);
  const [cash, setCash] = useState(0);
  const [repLevel, setRepLevel] = useState(1);
  const [currentCity, setCurrentCity] = useState('new_cavendish');
  const [now, setNow] = useState(Date.now());
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('cash, rep_level, current_city').eq('id', user.id).single();
    if (data) {
      setCash(data.cash);
      setRepLevel(data.rep_level);
      setCurrentCity(data.current_city);
      return data;
    }
    return null;
  }, []);

  useEffect(() => {
    loadProfile().then((data) => {
      if (data) {
        setJobs(generateJobs(data.rep_level, data.current_city));
      }
    });
  }, [loadProfile]);

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (expiresAt: number) => {
    const diff = Math.max(0, expiresAt - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const handleRefresh = async () => {
    if (cash < REFRESH_COST || refreshing) return;
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ cash: cash - REFRESH_COST }).eq('id', user.id);
    setCash(cash - REFRESH_COST);
    setJobs(generateJobs(repLevel, currentCity));
    setRefreshing(false);
  };

  const cityData = CITIES[currentCity as keyof typeof CITIES];

  return (
    <div style={S.page} className="screen-enter">
      {/* Header */}
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: THEME.space.md, paddingLeft: THEME.space.md, paddingRight: THEME.space.md, maxWidth: 480, margin: '0 auto' }}>
        <div style={S.eyebrow}>
          {cityData?.name || 'Unknown City'}
        </div>
        <h1 style={{ ...S.h1, fontSize: 24, marginBottom: THEME.space.md }}>
          TONIGHT'S JOBS
        </h1>

        {/* Cash display */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.space.lg }}>
          <div style={{ fontSize: 13, color: THEME.colors.gold, fontFamily: THEME.fonts.mono, fontWeight: 700 }}>
            ${cash.toLocaleString()} available
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div style={{ paddingLeft: THEME.space.md, paddingRight: THEME.space.md, paddingBottom: 160, maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: THEME.space.md }}>
        {jobs.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', padding: THEME.space.xl }}>
            <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🌙</div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.textSecondary, letterSpacing: 2, marginBottom: THEME.space.sm }}>
              THE STREETS ARE QUIET TONIGHT
            </div>
            <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 12, color: THEME.colors.textMuted, lineHeight: 1.6 }}>
              Pull new jobs for ${REFRESH_COST} and see what the city has to offer.
            </div>
          </div>
        )}
        {jobs.map((job, idx) => {
          const isExpired = job.expiresAt <= now;
          const isPressed = pressedIdx === idx;

          return (
            <div key={idx}>
              <div
                onClick={() => !isExpired && onSelectVault(job.vault)}
                onMouseDown={() => setPressedIdx(idx)}
                onMouseUp={() => setPressedIdx(null)}
                onMouseLeave={() => setPressedIdx(null)}
                onTouchStart={() => setPressedIdx(idx)}
                onTouchEnd={() => setPressedIdx(null)}
                style={{
                  ...S.card,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isExpired ? 'default' : 'pointer',
                  opacity: isExpired ? 0.3 : 1,
                  transform: isPressed && !isExpired ? 'scale(0.97)' : 'scale(1)',
                  transition: 'transform 0.15s ease, opacity 0.2s',
                }}
              >
                {/* Left accent bar */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: tierAccentColors[job.vault.tier] || THEME.colors.gold,
                    borderRadius: '4px 0 0 4px',
                  }}
                />

                <div style={{ paddingLeft: THEME.space.md }}>
                  {/* Top row: name + chain */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: THEME.space.xs }}>
                     <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.gold, letterSpacing: 1 }}>
                      {'emoji' in job.vault ? <span style={{ marginRight: 6 }}>{(job.vault as any).emoji}</span> : null}
                      {job.vault.name}
                      {job.isChain && <span style={{ marginLeft: 8 }} title="Chain job">🔗</span>}
                    </div>
                    {/* Intel badge */}
                    <div
                      style={{
                        fontSize: 8,
                        fontFamily: THEME.fonts.display,
                        letterSpacing: 2,
                        padding: '3px 8px',
                        borderRadius: THEME.radius.pill,
                        background: `${intelColors[job.intelTier]}20`,
                        color: intelColors[job.intelTier],
                        border: `1px solid ${intelColors[job.intelTier]}40`,
                      }}
                    >
                      {intelLabels[job.intelTier]}
                    </div>
                  </div>

                  {/* District pill */}
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 8,
                      fontFamily: THEME.fonts.mono,
                      letterSpacing: 2,
                      padding: '2px 8px',
                      borderRadius: THEME.radius.pill,
                      background: THEME.colors.dusk,
                      color: THEME.colors.textSecondary,
                      marginBottom: THEME.space.sm,
                    }}
                  >
                    {formatDistrict(job.vault.district)}
                  </div>

                  {/* Flavor text */}
                  {'flavor' in job.vault && (
                    <div style={{
                      fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 11,
                      color: THEME.colors.textMuted, lineHeight: 1.5,
                      marginBottom: THEME.space.sm,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {(job.vault as any).flavor}
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.lg, marginBottom: THEME.space.sm }}>
                    {/* Buy-in */}
                    <div style={{ fontSize: 13, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>
                      -${job.vault.buyIn}
                    </div>
                    {/* Payout */}
                    <div style={{ fontSize: 13, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald }}>
                      +${job.vault.payoutMin}–${job.vault.payoutMax}
                    </div>
                  </div>

                  {/* Bottom row: stars + timer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Difficulty stars */}
                    <div style={{ color: THEME.colors.gold, fontSize: 12, letterSpacing: 2 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ opacity: i < job.vault.difficulty ? 1 : 0.2 }}>★</span>
                      ))}
                    </div>
                    {/* Countdown */}
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                      {isExpired ? 'EXPIRED' : `Expires in ${formatCountdown(job.expiresAt)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chain teaser */}
              {job.isChain && (
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: THEME.fonts.body,
                    fontStyle: 'italic',
                    color: THEME.colors.textMuted,
                    paddingLeft: THEME.space.lg,
                    paddingTop: THEME.space.xs,
                  }}
                >
                  🔗 Complete this job to reveal a bigger score.
                </div>
              )}
            </div>
          );
        })}

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={cash < REFRESH_COST || refreshing}
          style={{
            ...S.btnGhost,
            opacity: cash < REFRESH_COST ? 0.3 : 1,
            marginTop: THEME.space.sm,
          }}
        >
          {refreshing ? 'PULLING...' : `PULL NEW JOBS — $${REFRESH_COST}`}
        </button>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default JobBoardScreen;
