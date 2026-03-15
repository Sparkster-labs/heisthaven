import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';

const Index = () => {
  const [started, setStarted] = useState(false);
  const [hoverBegin, setHoverBegin] = useState(false);

  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&family=Lora:ital,wght@0,400;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={S.page}>
      {/* Film grain overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.035,
          pointerEvents: 'none',
          zIndex: 9999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: THEME.space.lg,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {!started ? (
          <>
            {/* Eyebrow */}
            <div style={{ ...S.eyebrow, marginBottom: THEME.space.lg }}>
              A Noir Heist RPG
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 42,
                color: THEME.colors.gold,
                letterSpacing: 6,
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.1,
                marginBottom: THEME.space.sm,
                textShadow: `0 0 40px rgba(232,184,75,0.3), 0 0 80px rgba(232,184,75,0.1)`,
              }}
            >
              THE GIFT
              <br />
              HEIST
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: THEME.fonts.body,
                fontStyle: 'italic',
                fontSize: 14,
                color: THEME.colors.textSecondary,
                textAlign: 'center',
                marginBottom: THEME.space.xxl,
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              Every city has its rats.
              <br />
              Be the one they fear.
            </p>

            {/* Decorative line */}
            <div
              style={{
                width: 60,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${THEME.colors.gold}, transparent)`,
                marginBottom: THEME.space.xxl,
              }}
            />

            {/* BEGIN button */}
            <button
              onClick={() => setStarted(true)}
              onMouseEnter={() => setHoverBegin(true)}
              onMouseLeave={() => setHoverBegin(false)}
              style={{
                ...S.btnPrimary,
                maxWidth: 240,
                boxShadow: hoverBegin
                  ? `0 0 30px rgba(232,184,75,0.4), 0 0 60px rgba(232,184,75,0.15)`
                  : THEME.shadows.gold,
                transform: hoverBegin ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              BEGIN
            </button>

            {/* Version tag */}
            <div
              style={{
                position: 'absolute',
                bottom: THEME.space.lg,
                fontSize: 9,
                letterSpacing: 3,
                color: THEME.colors.textMuted,
                fontFamily: THEME.fonts.mono,
                textTransform: 'uppercase',
              }}
            >
              v0.1 — Prompt 1
            </div>
          </>
        ) : (
          <div
            style={{
              fontFamily: THEME.fonts.display,
              fontSize: 18,
              color: THEME.colors.goldMid,
              letterSpacing: 4,
              textTransform: 'uppercase',
              animation: 'pulse 2s infinite',
            }}
          >
            GAME LOADING...
          </div>
        )}
      </div>

      {/* Pulse animation for loading state */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Index;
