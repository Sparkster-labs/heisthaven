import { useState, useEffect, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  emoji: string;
  /** Which bottom nav tab to highlight (null = none) */
  highlightTab?: 'home' | 'jobs' | 'profile' | null;
  /** Action label on the primary button */
  action: string;
  /** If set, clicking the action auto-navigates to this tab */
  navigateTo?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'WELCOME, RECRUIT',
    message: 'This is your Safehouse — your base of operations. Everything starts here.',
    emoji: '🏠',
    highlightTab: 'home',
    action: 'NEXT',
  },
  {
    id: 'job_board',
    title: 'PICK A JOB',
    message: 'Head to the Heist tab to browse available vaults. Higher tiers mean bigger payouts — and bigger risks.',
    emoji: '💼',
    highlightTab: 'jobs',
    action: 'GO TO HEISTS',
    navigateTo: 'jobs',
  },
  {
    id: 'vault_select',
    title: 'CHOOSE YOUR VAULT',
    message: 'Each vault has a difficulty tier. Pick one that matches your skill and crew strength.',
    emoji: '🔐',
    action: 'NEXT',
  },
  {
    id: 'crew_hire',
    title: 'HIRE YOUR CREW',
    message: 'Before each heist, recruit specialists. Each crew member lowers risk in their area of expertise.',
    emoji: '👥',
    action: 'NEXT',
  },
  {
    id: 'mini_games',
    title: 'EXECUTE THE HEIST',
    message: 'Complete mini-games like Lockpick, Wire Tap, and Shadow Walk. Pass enough to crack the vault!',
    emoji: '🎮',
    action: 'NEXT',
  },
  {
    id: 'results',
    title: 'COLLECT OR HOLD',
    message: 'After a heist, cash out immediately or hold your loot for a bonus — but risk getting raided.',
    emoji: '💰',
    action: 'NEXT',
  },
  {
    id: 'jail_warning',
    title: 'WATCH YOUR HEAT',
    message: 'Fail a heist and you might get busted. You\'ll sit in jail until your sentence ends — or pay bail to get out early.',
    emoji: '🚨',
    action: 'NEXT',
  },
  {
    id: 'profile_tip',
    title: 'TRACK YOUR STATS',
    message: 'Check your Profile to see your rep, cash, jewels, and crew. Climb the leaderboard to become the top thief.',
    emoji: '👤',
    highlightTab: 'profile',
    action: 'GOT IT — LET\'S GO',
    navigateTo: 'home',
  },
];

const STORAGE_KEY = 'giftHeist_tutorialStep';

interface OnboardingOverlayProps {
  onNavigate?: (tab: string) => void;
}

const OnboardingOverlay = ({ onNavigate }: OnboardingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      setCurrentStep(0);
      localStorage.setItem(STORAGE_KEY, '0');
    } else {
      const step = parseInt(stored);
      if (step < TUTORIAL_STEPS.length) {
        setCurrentStep(step);
      }
    }
  }, []);

  const advance = useCallback(() => {
    if (currentStep === null || animating) return;
    const step = TUTORIAL_STEPS[currentStep];
    const next = currentStep + 1;

    setAnimating(true);
    setTimeout(() => {
      if (step.navigateTo && onNavigate) {
        onNavigate(step.navigateTo);
      }
      if (next >= TUTORIAL_STEPS.length) {
        localStorage.setItem(STORAGE_KEY, String(TUTORIAL_STEPS.length));
        setCurrentStep(null);
      } else {
        localStorage.setItem(STORAGE_KEY, String(next));
        setCurrentStep(next);
      }
      setAnimating(false);
    }, 200);
  }, [currentStep, animating, onNavigate]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(TUTORIAL_STEPS.length));
    setCurrentStep(null);
  }, []);

  if (currentStep === null || currentStep >= TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(6,4,10,0.85)',
        padding: THEME.space.md,
        paddingBottom: 90,
      }}
      onClick={advance}
    >
      {/* Highlighted tab indicator */}
      {step.highlightTab && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            zIndex: 2001,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {['home', 'jobs', 'profile'].map((tab) => (
            <div
              key={tab}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: tab === step.highlightTab
                  ? `2px solid ${THEME.colors.gold}`
                  : '2px solid transparent',
                boxShadow: tab === step.highlightTab
                  ? `0 0 20px ${THEME.colors.gold}40, inset 0 0 12px ${THEME.colors.gold}20`
                  : 'none',
                transition: 'all 0.4s ease',
                animation: tab === step.highlightTab ? 'tutorialPulse 2s ease-in-out infinite' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Tutorial card */}
      <div
        style={{
          ...S.card,
          maxWidth: 360,
          width: '100%',
          margin: '0 auto',
          textAlign: 'center',
          padding: THEME.space.xl,
          border: `1px solid ${THEME.colors.gold}30`,
          boxShadow: THEME.shadows.gold,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step counter */}
        <div style={{
          ...S.eyebrow,
          fontSize: 9,
          color: THEME.colors.textMuted,
          marginBottom: THEME.space.sm,
        }}>
          STEP {currentStep + 1} OF {TUTORIAL_STEPS.length}
        </div>

        {/* Emoji */}
        <div style={{
          fontSize: 40,
          marginBottom: THEME.space.md,
          filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.3))',
        }}>
          {step.emoji}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: THEME.fonts.display,
          fontSize: 15,
          color: THEME.colors.gold,
          letterSpacing: 2,
          marginBottom: THEME.space.sm,
        }}>
          {step.title}
        </div>

        {/* Message */}
        <div style={{
          fontFamily: THEME.fonts.body,
          fontSize: 13,
          color: THEME.colors.textSecondary,
          lineHeight: 1.7,
          marginBottom: THEME.space.lg,
        }}>
          {step.message}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: 3,
          background: THEME.colors.borderFaint,
          borderRadius: 2,
          marginBottom: THEME.space.md,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${THEME.colors.goldDim}, ${THEME.colors.gold})`,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: THEME.space.sm }}>
          <button
            onClick={handleSkip}
            style={{ ...S.btnGhost, flex: 0.6, padding: '10px', fontSize: 10 }}
          >
            SKIP ALL
          </button>
          <button
            onClick={advance}
            style={{ ...S.btnPrimary, flex: 1, padding: '10px', fontSize: 11 }}
          >
            {step.action}
          </button>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingOverlay;
