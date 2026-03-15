import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS } from '@/lib/gameData';
import { LockPickGame, WireCutGame, PressureValveGame } from './MiniGames';

interface HeistExecutionProps {
  vault: typeof VAULTS[number];
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  onComplete: (results: { success: boolean; miniGameResults: boolean[] }) => void;
}

const GAME_TYPES = ['lock', 'wire', 'pressure'] as const;

const HeistExecution = ({ vault, crewIds, chaosCard, onComplete }: HeistExecutionProps) => {
  const skipMinigame = chaosCard.effect === 'skip_minigame';
  const gameCount = Math.min(vault.difficulty, 3);

  // Generate random game sequence
  const [games] = useState(() => {
    const picked: typeof GAME_TYPES[number][] = [];
    for (let i = 0; i < gameCount; i++) {
      picked.push(GAME_TYPES[i % GAME_TYPES.length]);
    }
    return picked;
  });

  const [currentGame, setCurrentGame] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'transitioning'>('intro');

  // Auto-skip first minigame if chaos card says so
  useEffect(() => {
    if (skipMinigame && currentGame === 0 && phase === 'intro') {
      setResults([true]);
      setCurrentGame(1);
    }
  }, [skipMinigame, currentGame, phase]);

  // Start after intro
  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('playing'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleGameResult = (success: boolean) => {
    const newResults = [...results, success];
    setResults(newResults);

    if (currentGame + 1 >= games.length) {
      // All games done
      setTimeout(() => {
        onComplete({ success: newResults.filter(Boolean).length > newResults.length / 2, miniGameResults: newResults });
      }, 1500);
    } else {
      setPhase('transitioning');
      setTimeout(() => {
        setCurrentGame(prev => prev + 1);
        setPhase('playing');
      }, 1500);
    }
  };

  const renderGame = () => {
    const gameType = games[currentGame];
    switch (gameType) {
      case 'lock':
        return <LockPickGame difficulty={vault.difficulty} onResult={handleGameResult} />;
      case 'wire':
        return <WireCutGame difficulty={vault.difficulty} onResult={handleGameResult} />;
      case 'pressure':
        return <PressureValveGame difficulty={vault.difficulty} onResult={handleGameResult} />;
    }
  };

  return (
    <div style={{
      ...S.page, display: 'flex', flexDirection: 'column',
      minHeight: '100vh', padding: THEME.space.lg,
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: THEME.space.xl, marginBottom: THEME.space.xl }}>
          <div style={S.eyebrow}>{vault.name}</div>
          <h1 style={{ ...S.h1, fontSize: 20, marginBottom: THEME.space.md }}>
            {phase === 'intro' ? 'BREACHING...' : `STAGE ${currentGame + 1} OF ${games.length}`}
          </h1>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {games.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < results.length
                  ? (results[i] ? THEME.colors.emerald : THEME.colors.ruby)
                  : i === currentGame ? THEME.colors.gold : THEME.colors.borderFaint,
                boxShadow: i === currentGame ? `0 0 8px ${THEME.colors.gold}60` : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {/* Chaos card reminder */}
          {skipMinigame && currentGame <= 1 && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald,
              marginTop: THEME.space.sm, letterSpacing: 1,
            }}>
              🔓 INSIDE JOB — Stage 1 bypassed
            </div>
          )}
        </div>

        {/* Game area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {phase === 'intro' && (
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.goldMid,
              letterSpacing: 4, textAlign: 'center',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              STAND BY...
            </div>
          )}
          {phase === 'playing' && renderGame()}
          {phase === 'transitioning' && (
            <div style={{
              fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.textMuted,
              letterSpacing: 4, textAlign: 'center',
            }}>
              NEXT STAGE...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HeistExecution;
