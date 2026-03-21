import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JailScreenProps {
  onRelease: () => void;
}

const JAIL_DURATION_MINUTES = 30;
const BASE_BAIL = 500;
const BAIL_MULTIPLIER = 1.8; // each offense multiplies cost

const JailScreen = ({ onRelease }: JailScreenProps) => {
  const { toast } = useToast();
  const [jailData, setJailData] = useState<{
    release_at: string;
    bail_cost: number;
    offense_count: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paying, setPaying] = useState(false);
  const [cash, setCash] = useState(0);
  const [barPhase, setBarPhase] = useState(0);

  // Load jail state
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: jail } = await supabase
        .from('jail_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!jail || jail.paid) {
        onRelease();
        return;
      }

      // Check if already released by timer
      if (new Date(jail.release_at) <= new Date()) {
        await supabase.from('jail_state').delete().eq('id', jail.id);
        onRelease();
        return;
      }

      setJailData({
        release_at: jail.release_at,
        bail_cost: jail.bail_cost,
        offense_count: jail.offense_count,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('cash')
        .eq('id', user.id)
        .single();
      if (profile) setCash(profile.cash);
    };
    load();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!jailData) return;
    const tick = () => {
      const now = new Date().getTime();
      const release = new Date(jailData.release_at).getTime();
      const diff = Math.max(0, release - now);
      setSecondsLeft(Math.ceil(diff / 1000));

      if (diff <= 0) {
        // Auto-release
        handleAutoRelease();
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [jailData]);

  // Bar ambiance
  useEffect(() => {
    const interval = setInterval(() => setBarPhase(p => (p + 1) % 6), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoRelease = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('jail_state').delete().eq('user_id', user.id);
    onRelease();
  };

  const handlePayBail = async () => {
    if (!jailData || paying) return;
    if (cash < jailData.bail_cost) {
      toast({ title: '💸 Not enough cash', description: `You need $${jailData.bail_cost.toLocaleString()} for bail.` });
      return;
    }
    setPaying(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPaying(false); return; }

    // Deduct cash
    await supabase.from('profiles').update({
      cash: Math.max(0, cash - jailData.bail_cost),
    }).eq('id', user.id);

    // Remove jail record
    await supabase.from('jail_state').delete().eq('user_id', user.id);

    toast({ title: '🔓 Bail posted', description: `Paid $${jailData.bail_cost.toLocaleString()}. You're free.` });
    setPaying(false);
    onRelease();
  };

  if (!jailData) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.textMuted, fontFamily: THEME.fonts.display, letterSpacing: 3, fontSize: 12 }}>
          PROCESSING...
        </div>
      </div>
    );
  }

  const canAfford = cash >= jailData.bail_cost;
  const totalSeconds = JAIL_DURATION_MINUTES * 60;
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds));

  return (
    <div style={{
      ...S.page,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: THEME.space.lg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Prison bar shadows */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 42px,
          rgba(0,0,0,0.25) 42px,
          rgba(0,0,0,0.25) 48px
        )`,
        opacity: 0.6 + Math.sin(barPhase) * 0.1,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Red ambient pulse */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', width: 300, height: 300,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${THEME.colors.ruby}12 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 340, width: '100%', position: 'relative', zIndex: 2 }}>
        {/* Icon */}
        <div style={{
          textAlign: 'center', fontSize: 64, marginBottom: THEME.space.md,
          filter: `drop-shadow(0 0 40px ${THEME.colors.ruby}40)`,
          animation: 'jailPulse 3s ease-in-out infinite',
        }}>
          ⛓️
        </div>

        {/* Header */}
        <h1 style={{
          ...S.h1, textAlign: 'center', fontSize: 32,
          color: THEME.colors.ruby,
          textShadow: `0 0 60px ${THEME.colors.ruby}30`,
          marginBottom: THEME.space.xs,
        }}>
          LOCKED UP
        </h1>

        <div style={{
          textAlign: 'center', fontFamily: THEME.fonts.body, fontSize: 13,
          color: THEME.colors.textSecondary, fontStyle: 'italic',
          marginBottom: THEME.space.xl,
        }}>
          Offense #{jailData.offense_count}. The law caught up.
        </div>

        {/* Countdown card */}
        <div style={{
          ...S.card, textAlign: 'center', marginBottom: THEME.space.md,
          borderTop: `2px solid ${THEME.colors.ruby}40`,
        }}>
          <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>
            TIME REMAINING
          </div>
          <div style={{
            fontSize: 48, fontFamily: THEME.fonts.mono, fontWeight: 700,
            color: THEME.colors.textPrimary, letterSpacing: 2,
            textShadow: `0 0 20px ${THEME.colors.ruby}20`,
          }}>
            {timeLeft}
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: THEME.space.md, height: 4,
            background: THEME.colors.dusk, borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${THEME.colors.ruby}, ${THEME.colors.gold})`,
              borderRadius: 2,
              transition: 'width 1s linear',
            }} />
          </div>

          <div style={{
            marginTop: THEME.space.sm, fontSize: 9,
            fontFamily: THEME.fonts.display, color: THEME.colors.textMuted,
            letterSpacing: 2,
          }}>
            AUTO-RELEASE IN {JAIL_DURATION_MINUTES} MINUTES
          </div>
        </div>

        {/* Bail card */}
        <div style={{
          ...S.card, marginBottom: THEME.space.md,
          border: `1px solid ${canAfford ? THEME.colors.gold : THEME.colors.borderFaint}30`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: THEME.space.md,
          }}>
            <span style={{ ...S.eyebrow, marginBottom: 0 }}>BAIL</span>
            <span style={{
              fontSize: 22, fontFamily: THEME.fonts.mono, fontWeight: 700,
              color: THEME.colors.gold,
            }}>
              ${jailData.bail_cost.toLocaleString()}
            </span>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: THEME.space.md,
          }}>
            <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
              YOUR CASH
            </span>
            <span style={{
              fontSize: 12, fontFamily: THEME.fonts.mono,
              color: canAfford ? THEME.colors.emerald : THEME.colors.ruby,
            }}>
              ${cash.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePayBail}
            disabled={!canAfford || paying}
            style={{
              ...S.btnPrimary,
              opacity: canAfford && !paying ? 1 : 0.4,
              cursor: canAfford && !paying ? 'pointer' : 'not-allowed',
            }}
          >
            {paying ? 'POSTING BAIL...' : canAfford ? 'PAY BAIL' : 'INSUFFICIENT FUNDS'}
          </button>
        </div>

        {/* Flavor text */}
        <div style={{
          textAlign: 'center', fontSize: 10, fontFamily: THEME.fonts.body,
          color: THEME.colors.textMuted, fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          {jailData.offense_count >= 3
            ? '"Repeat offenders make the warden smile. Higher bail, longer memory."'
            : '"The walls are thin. Plan your next move carefully."'}
        </div>
      </div>

      <style>{`
        @keyframes jailPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default JailScreen;

export function calculateBailCost(offenseCount: number): number {
  return Math.floor(BASE_BAIL * Math.pow(BAIL_MULTIPLIER, offenseCount - 1));
}

export const JAIL_DURATION_MS = JAIL_DURATION_MINUTES * 60 * 1000;
