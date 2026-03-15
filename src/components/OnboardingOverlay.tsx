import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';

const STEPS = [
  {
    step: 0,
    title: 'WELCOME, RECRUIT',
    message: 'Start at the War Room. Pick your first job and prove your worth.',
    emoji: '🎯',
    target: 'War Room',
  },
  {
    step: 1,
    title: 'BUILD YOUR CREW',
    message: 'Hire crew to lower your risk. Each specialist covers a different skill.',
    emoji: '👥',
    target: 'Crew',
  },
  {
    step: 2,
    title: 'THE FENCE AWAITS',
    message: 'After a heist, cash out or hold your loot for a bonus. The choice is yours.',
    emoji: '💰',
    target: 'Loot',
  },
];

const OnboardingOverlay = () => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('giftHeist_tutorialStep');
    if (stored === null) {
      setCurrentStep(0);
      localStorage.setItem('giftHeist_tutorialStep', '0');
    } else {
      const step = parseInt(stored);
      if (step < STEPS.length) {
        setCurrentStep(step);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep === null) return;
    const next = currentStep + 1;
    if (next >= STEPS.length) {
      localStorage.setItem('giftHeist_tutorialStep', String(STEPS.length));
      setCurrentStep(null);
    } else {
      localStorage.setItem('giftHeist_tutorialStep', String(next));
      setCurrentStep(next);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('giftHeist_tutorialStep', String(STEPS.length));
    setCurrentStep(null);
  };

  if (currentStep === null || currentStep >= STEPS.length) return null;

  const step = STEPS[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        padding: THEME.space.lg,
        paddingBottom: 100,
      }}
      onClick={handleNext}
    >
      <div
        className="screen-enter"
        style={{
          ...S.card,
          maxWidth: 340,
          width: '100%',
          textAlign: 'center',
          padding: THEME.space.xl,
          border: `1px solid ${THEME.colors.gold}30`,
          boxShadow: THEME.shadows.gold,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>{step.emoji}</div>
        <div style={{
          fontFamily: THEME.fonts.display,
          fontSize: 14,
          color: THEME.colors.gold,
          letterSpacing: 2,
          marginBottom: THEME.space.sm,
        }}>
          {step.title}
        </div>
        <div style={{
          fontFamily: THEME.fonts.body,
          fontSize: 13,
          color: THEME.colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: THEME.space.lg,
          fontStyle: 'italic',
        }}>
          {step.message}
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: THEME.space.md }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i === currentStep ? THEME.colors.gold : THEME.colors.borderMid,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: THEME.space.sm }}>
          <button onClick={handleSkip} style={{ ...S.btnGhost, flex: 1, padding: '10px' }}>
            SKIP
          </button>
          <button onClick={handleNext} style={{ ...S.btnPrimary, flex: 1, padding: '10px' }}>
            {currentStep === STEPS.length - 1 ? 'GOT IT' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
