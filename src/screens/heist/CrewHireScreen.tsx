import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { CREW_MEMBERS, VAULTS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import { SFX } from '@/lib/sounds';

interface CrewHireScreenProps {
  vault: typeof VAULTS[number];
  onLaunch: (selectedCrewIds: string[]) => void;
  onBack: () => void;
}

interface CrewStateRow {
  crew_id: string;
  unlocked: boolean;
  level: number;
  loyalty: number;
}

const getLoyaltyColor = (loyalty: number) => {
  if (loyalty >= 80) return THEME.colors.emerald;
  if (loyalty >= 50) return THEME.colors.warning;
  return THEME.colors.ruby;
};

const getLoyaltyLabel = (loyalty: number) => {
  if (loyalty >= 90) return 'DEVOTED';
  if (loyalty >= 70) return 'LOYAL';
  if (loyalty >= 50) return 'STEADY';
  if (loyalty >= 30) return 'WAVERING';
  return 'DISLOYAL';
};

const getHireCost = (member: typeof CREW_MEMBERS[number], level: number) => {
  return Math.round(member.baseCost * 0.1 * level) || 0;
};

const CrewHireScreen = ({ vault, onLaunch, onBack }: CrewHireScreenProps) => {
  const [crewStates, setCrewStates] = useState<CrewStateRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cash, setCash] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [crewRes, profileRes] = await Promise.all([
        supabase.from('crew_state').select('crew_id, unlocked, level, loyalty').eq('user_id', user.id),
        supabase.from('profiles').select('cash').eq('id', user.id).single(),
      ]);

      if (crewRes.data) setCrewStates(crewRes.data);
      if (profileRes.data) setCash(profileRes.data.cash);
      setLoading(false);
    };
    load();
  }, []);

  const unlockedCrew = crewStates.filter(cs => cs.unlocked);
  const maxSlots = vault.crewSlots;

  const toggleCrew = (crewId: string) => {
    if (selectedIds.includes(crewId)) {
      setSelectedIds(selectedIds.filter(id => id !== crewId));
    } else if (selectedIds.length < maxSlots) {
      SFX.crewHire();
      setSelectedIds([...selectedIds, crewId]);
    }
  };

  // Risk calculation
  const baseRisk = vault.difficulty * 18;
  const crewReduction = selectedIds.reduce((acc, id) => {
    const state = crewStates.find(cs => cs.crew_id === id);
    if (!state) return acc;
    const loyaltyBonus = state.loyalty * 0.08;
    const levelBonus = state.level * 2;
    return acc + loyaltyBonus + levelBonus;
  }, 0);
  const finalRisk = Math.max(5, Math.round(baseRisk - crewReduction));

  const totalHireCost = selectedIds.reduce((acc, id) => {
    const member = CREW_MEMBERS.find(m => m.id === id);
    const state = crewStates.find(cs => cs.crew_id === id);
    if (!member || !state) return acc;
    return acc + getHireCost(member, state.level);
  }, 0);

  const totalCost = vault.buyIn + totalHireCost;
  const canAfford = cash >= totalCost;

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>
          ASSEMBLING CREW...
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
            cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
          }}
        >
          ← BACK TO DOSSIER
        </button>

        {/* Header */}
        <div style={S.eyebrow}>ASSEMBLE YOUR CREW</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.sm }}>
          {vault.name}
        </h1>
        <div style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.lg }}>
          {selectedIds.length}/{maxSlots} SLOTS FILLED
        </div>

        {/* Risk gauge */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg, textAlign: 'center' }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.sm }}>MISSION RISK</div>
          <div style={{
            fontSize: 36, fontFamily: THEME.fonts.mono, fontWeight: 700,
            color: finalRisk > 60 ? THEME.colors.ruby : finalRisk > 35 ? THEME.colors.warning : THEME.colors.emerald,
            textShadow: `0 0 20px ${finalRisk > 60 ? THEME.colors.ruby : finalRisk > 35 ? THEME.colors.warning : THEME.colors.emerald}40`,
          }}>
            {finalRisk}%
          </div>
          {/* Risk bar */}
          <div style={{ height: 4, background: THEME.colors.borderFaint, borderRadius: 2, marginTop: THEME.space.sm, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${finalRisk}%`,
              background: finalRisk > 60 ? THEME.colors.ruby : finalRisk > 35 ? THEME.colors.warning : THEME.colors.emerald,
              borderRadius: 2, transition: 'all 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginTop: THEME.space.xs, letterSpacing: 1 }}>
            BASE {baseRisk}% — CREW REDUCES BY {Math.round(crewReduction)}%
          </div>
        </div>

        {/* Crew list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, marginBottom: THEME.space.lg }}>
          {unlockedCrew.map((cs) => {
            const member = CREW_MEMBERS.find(m => m.id === cs.crew_id);
            if (!member) return null;
            const isSelected = selectedIds.includes(cs.crew_id);
            const hireCost = getHireCost(member, cs.level);
            const isFull = selectedIds.length >= maxSlots && !isSelected;

            return (
              <div
                key={cs.crew_id}
                onClick={() => !isFull && toggleCrew(cs.crew_id)}
                style={{
                  ...S.card,
                  cursor: isFull ? 'default' : 'pointer',
                  opacity: isFull ? 0.35 : 1,
                  border: `1px solid ${isSelected ? THEME.colors.gold : THEME.colors.borderFaint}`,
                  boxShadow: isSelected ? THEME.shadows.gold : 'none',
                  transition: 'all 0.2s ease',
                  padding: THEME.space.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.md }}>
                  {/* Emoji */}
                  <div style={{
                    fontSize: 28, width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? `${THEME.colors.gold}15` : THEME.colors.dusk,
                    borderRadius: THEME.radius.md,
                  }}>
                    {member.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontFamily: THEME.fonts.display, fontSize: 13, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                        {member.name}
                      </div>
                      {isSelected && (
                        <div style={{
                          fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 2,
                          padding: '2px 8px', borderRadius: THEME.radius.pill,
                          background: `${THEME.colors.gold}20`, color: THEME.colors.gold,
                        }}>
                          HIRED
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1, marginBottom: 4 }}>
                      {member.role} — LVL {cs.level}
                      {hireCost > 0 && <span style={{ color: THEME.colors.goldDim }}> — ${hireCost}</span>}
                    </div>

                    {/* Loyalty bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 3, background: THEME.colors.borderFaint, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${cs.loyalty}%`,
                          background: getLoyaltyColor(cs.loyalty),
                          borderRadius: 2, transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 7, fontFamily: THEME.fonts.display, letterSpacing: 1,
                        color: getLoyaltyColor(cs.loyalty),
                      }}>
                        {getLoyaltyLabel(cs.loyalty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flavor text */}
                <div style={{
                  fontSize: 10, fontFamily: THEME.fonts.body, fontStyle: 'italic',
                  color: THEME.colors.textMuted, marginTop: THEME.space.xs,
                  paddingLeft: 56,
                }}>
                  {member.flavor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost summary */}
        <div style={{ ...S.card, marginBottom: THEME.space.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.space.xs }}>
            <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>BUY-IN</span>
            <span style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>${vault.buyIn}</span>
          </div>
          {totalHireCost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.space.xs }}>
              <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>CREW FEES</span>
              <span style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>${totalHireCost}</span>
            </div>
          )}
          <div style={S.divider} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary, letterSpacing: 2 }}>TOTAL</span>
            <span style={{ fontSize: 16, fontFamily: THEME.fonts.mono, color: canAfford ? THEME.colors.gold : THEME.colors.ruby, fontWeight: 700 }}>
              ${totalCost}
            </span>
          </div>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, textAlign: 'right', marginTop: 2 }}>
            Balance after: ${Math.max(0, cash - totalCost)}
          </div>
        </div>

        {/* Launch button */}
        <button
          onClick={() => {
            if (selectedIds.length > 0 && canAfford) {
              onLaunch(selectedIds);
            }
          }}
          disabled={selectedIds.length === 0 || !canAfford}
          style={{
            ...S.btnPrimary,
            opacity: selectedIds.length === 0 || !canAfford ? 0.4 : 1,
            marginBottom: THEME.space.md,
            boxShadow: selectedIds.length > 0 && canAfford ? THEME.shadows.gold : 'none',
          }}
        >
          {!canAfford ? 'INSUFFICIENT FUNDS' : selectedIds.length === 0 ? 'SELECT CREW' : 'LAUNCH THE HEIST'}
        </button>
        <button onClick={onBack} style={S.btnGhost}>
          ABORT MISSION
        </button>
      </div>
    </div>
  );
};

export default CrewHireScreen;
