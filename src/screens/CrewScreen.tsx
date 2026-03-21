import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { CREW_MEMBERS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';


interface CrewScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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

const CrewScreen = ({ activeTab, onTabChange }: CrewScreenProps) => {
  const [crewStates, setCrewStates] = useState<CrewStateRow[]>([]);
  const [cash, setCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recruitModal, setRecruitModal] = useState<typeof CREW_MEMBERS[number] | null>(null);
  const [acting, setActing] = useState(false);

  const fetchData = async () => {
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

  useEffect(() => { fetchData(); }, []);

  const handleRecruit = async (member: typeof CREW_MEMBERS[number]) => {
    if (cash < member.baseCost || acting) return;
    setActing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash - member.baseCost }).eq('id', user.id);

    const existing = crewStates.find(cs => cs.crew_id === member.id);
    if (existing) {
      await supabase.from('crew_state').update({ unlocked: true }).eq('user_id', user.id).eq('crew_id', member.id);
    } else {
      await supabase.from('crew_state').insert({ user_id: user.id, crew_id: member.id, unlocked: true });
    }

    setRecruitModal(null);
    setActing(false);
    toast({ title: `${member.emoji} ${member.name} Recruited!`, description: `${member.role} has joined your crew.` });
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  const unlockedMembers = CREW_MEMBERS.filter(m => {
    const state = crewStates.find(cs => cs.crew_id === m.id);
    return state?.unlocked;
  });
  const lockedMembers = CREW_MEMBERS.filter(m => {
    const state = crewStates.find(cs => cs.crew_id === m.id);
    return !state?.unlocked;
  });

  return (
    <div style={S.page} className="screen-enter">
      <div style={{ paddingTop: THEME.space.xl, paddingBottom: 100, maxWidth: 480, margin: '0 auto', padding: `${THEME.space.xl}px ${THEME.space.md}px 100px` }}>
        <div style={S.eyebrow}>YOUR NETWORK</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.sm }}>THE CREW</h1>
        <div style={{ fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.xl }}>
          {unlockedMembers.length} / {CREW_MEMBERS.length} RECRUITED
        </div>

        {/* Active crew */}
        <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>ACTIVE</div>
        {unlockedMembers.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', padding: THEME.space.xl, marginBottom: THEME.space.xl }}>
            <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🐺</div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.textSecondary, letterSpacing: 2, marginBottom: THEME.space.sm }}>
              YOU'RE FLYING SOLO
            </div>
            <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 12, color: THEME.colors.textMuted, lineHeight: 1.6 }}>
              Hire specialists to reduce your risk. Every legend needs a crew.
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm, marginBottom: THEME.space.xl }}>
          {unlockedMembers.map(member => {
            const state = crewStates.find(cs => cs.crew_id === member.id);
            if (!state) return null;

            return (
              <div key={member.id} style={{ ...S.card, padding: THEME.space.md }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.md }}>
                  <div style={{
                    fontSize: 28, width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: THEME.colors.dusk, borderRadius: THEME.radius.md,
                  }}>
                    {member.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                        {member.name}
                      </div>
                      <div style={{
                        fontSize: 8, fontFamily: THEME.fonts.mono, letterSpacing: 1,
                        padding: '2px 8px', borderRadius: THEME.radius.pill,
                        background: `${THEME.colors.gold}15`, color: THEME.colors.gold,
                      }}>
                        LVL {state.level}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1, marginBottom: 6 }}>
                      {member.role} — {member.specialty.replace(/_/g, ' ').toUpperCase()}
                    </div>

                    {/* Loyalty bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 8, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1, width: 40 }}>
                        LOYALTY
                      </span>
                      <div style={{ flex: 1, height: 4, background: THEME.colors.borderFaint, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${state.loyalty}%`,
                          background: getLoyaltyColor(state.loyalty),
                          borderRadius: 2, transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ fontSize: 8, fontFamily: THEME.fonts.display, letterSpacing: 1, color: getLoyaltyColor(state.loyalty), width: 52, textAlign: 'right' }}>
                        {getLoyaltyLabel(state.loyalty)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic',
                  color: THEME.colors.textMuted, marginTop: THEME.space.xs, paddingLeft: 60,
                }}>
                  {member.flavor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked crew */}
        {lockedMembers.length > 0 && (
          <>
            <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>AVAILABLE FOR RECRUITMENT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
              {lockedMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => setRecruitModal(member)}
                  style={{
                    ...S.card, padding: THEME.space.md,
                    opacity: 0.5, cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.md }}>
                    <div style={{
                      fontSize: 28, width: 48, height: 48,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: THEME.colors.dusk, borderRadius: THEME.radius.md,
                    }}>
                      {member.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.textPrimary, letterSpacing: 1 }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, letterSpacing: 1 }}>
                        {member.role}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.gold }}>
                      ${member.baseCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recruit modal */}
      {recruitModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: THEME.space.lg }}
          onClick={() => setRecruitModal(null)}
        >
          <div style={{ ...S.card, maxWidth: 320, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: THEME.space.md }}>{recruitModal.emoji}</div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 18, color: THEME.colors.textPrimary, letterSpacing: 2, marginBottom: 4 }}>
              {recruitModal.name}
            </div>
            <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.goldDim, letterSpacing: 2, marginBottom: THEME.space.md }}>
              {recruitModal.role}
            </div>
            <p style={{ fontFamily: THEME.fonts.body, fontSize: 13, fontStyle: 'italic', color: THEME.colors.textSecondary, marginBottom: THEME.space.lg, lineHeight: 1.6 }}>
              {recruitModal.flavor}
            </p>
            <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: 4, letterSpacing: 1 }}>
              SPECIALTY: {recruitModal.specialty.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, fontWeight: 700, marginBottom: THEME.space.lg }}>
              ${recruitModal.baseCost.toLocaleString()}
            </div>

            {cash >= recruitModal.baseCost ? (
              <button
                onClick={() => handleRecruit(recruitModal)}
                disabled={acting}
                style={{ ...S.btnPrimary, marginBottom: THEME.space.sm, opacity: acting ? 0.6 : 1 }}
              >
                {acting ? 'RECRUITING...' : 'RECRUIT'}
              </button>
            ) : (
              <div style={{ fontSize: 11, color: THEME.colors.danger, fontFamily: THEME.fonts.mono, marginBottom: THEME.space.sm }}>
                INSUFFICIENT FUNDS (${cash.toLocaleString()})
              </div>
            )}
            <button onClick={() => setRecruitModal(null)} style={S.btnGhost}>CANCEL</button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default CrewScreen;
