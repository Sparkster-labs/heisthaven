import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const FLAVOR_MESSAGES = [
  "The streets remember you.",
  "Another night, another opportunity.",
  "The underworld stirs at your return.",
  "Your reputation precedes you.",
  "The fence saved something for you.",
  "The city never sleeps. Neither do you.",
  "Back for more? Good. The vaults won't crack themselves.",
];

const DailyLoginModal = () => {
  const [show, setShow] = useState(false);
  const [reward, setReward] = useState(0);
  const [flavor, setFlavor] = useState('');
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const checkDailyLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles')
        .select('rep_level, cash, last_login')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const lastLogin = profile.last_login as string | null;

      if (lastLogin === today) return; // Already claimed today

      // Calculate reward based on rep level
      const baseReward = 50;
      const repBonus = (profile.rep_level - 1) * 15;
      const dailyReward = baseReward + repBonus + Math.floor(Math.random() * 50);

      setReward(dailyReward);
      setFlavor(FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)]);
      setShow(true);
    };

    // Small delay so the app renders first
    setTimeout(checkDailyLogin, 800);
  }, []);

  const handleClaim = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles')
      .select('cash')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    await supabase.from('profiles').update({
      cash: profile.cash + reward,
      last_login: today,
    }).eq('id', user.id);

    setClaimed(true);
    toast({ title: '💰 Daily Bonus', description: `$${reward} added to your wallet.` });

    setTimeout(() => setShow(false), 1200);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
    }}
      onClick={() => claimed && setShow(false)}
    >
      <div
        className="screen-enter"
        style={{
          ...S.card,
          maxWidth: 320,
          width: '90%',
          textAlign: 'center',
          padding: THEME.space.xl,
          border: `1px solid ${THEME.colors.gold}30`,
          boxShadow: THEME.shadows.gold,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 40, marginBottom: THEME.space.md }}>🌙</div>
        <div style={{
          ...S.eyebrow,
          color: THEME.colors.goldMid,
          marginBottom: THEME.space.sm,
        }}>
          DAILY REPORT
        </div>
        <div style={{
          fontFamily: THEME.fonts.body,
          fontStyle: 'italic',
          fontSize: 13,
          color: THEME.colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: THEME.space.lg,
        }}>
          {flavor}
        </div>

        <div style={{
          fontFamily: THEME.fonts.mono,
          fontSize: 28,
          fontWeight: 700,
          color: THEME.colors.gold,
          marginBottom: THEME.space.xs,
        }}>
          +${reward}
        </div>
        <div style={{
          fontFamily: THEME.fonts.mono,
          fontSize: 9,
          color: THEME.colors.textMuted,
          letterSpacing: 2,
          marginBottom: THEME.space.lg,
        }}>
          DAILY BONUS
        </div>

        <button
          onClick={handleClaim}
          disabled={claimed}
          style={{
            ...S.btnPrimary,
            opacity: claimed ? 0.6 : 1,
          }}
        >
          {claimed ? '✓ CLAIMED' : 'CLAIM REWARD'}
        </button>
      </div>
    </div>
  );
};

export default DailyLoginModal;
