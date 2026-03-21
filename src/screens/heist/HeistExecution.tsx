import { useState, useEffect, useRef, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS } from '@/lib/gameData';
import { LockPickGame, WireCutGame, SafeComboGame, PressureValveGame, TailGame, InterrogationGame } from './MiniGames';
import { ShadowWalkGame, ColdReadGame, WireTapGame, SignalScrambleGame, TakedownGame, HotPursuitGame } from './MiniGamesExtended';
import { SFX, Haptics } from '@/lib/sounds';

interface HeistExecutionProps {
  vault: typeof VAULTS[number];
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  onComplete: (results: { miniGameResults: boolean[] }) => void;
}

// ═══════════════════════════════════════════════════════
// Tier-based mini-game sequencing — expanded with 6 new games
// ═══════════════════════════════════════════════════════
type GameType = 'lock' | 'combo' | 'wire' | 'tail' | 'interrogation' | 'shadow' | 'coldread' | 'wiretap' | 'signal' | 'takedown' | 'pursuit';

function getGameSequence(tier: number): GameType[] {
  if (tier <= 1) return ['lock'];
  if (tier === 2) return ['lock', 'coldread'];
  if (tier === 3) return ['combo', 'shadow'];
  if (tier === 4) return ['shadow', 'wire', 'coldread'];
  if (tier === 5) return ['combo', 'wiretap', 'takedown'];
  if (tier === 6) return ['lock', 'signal', 'wire'];
  if (tier === 7) return ['shadow', 'wire', 'combo', 'takedown'];
  if (tier === 8) return ['wiretap', 'coldread', 'tail', 'signal'];
  if (tier === 9) return ['combo', 'wire', 'takedown', 'pursuit'];
  // Tier 10+: full gauntlet
  return ['shadow', 'coldread', 'wiretap', 'signal', 'takedown', 'pursuit'];
}

const GAME_NAMES: Record<GameType, string> = {
  lock: 'LOCKPICK',
  combo: 'SAFE COMBO',
  wire: 'ALARM CUT',
  tail: 'THE TAIL',
  interrogation: 'THE INTERROGATION',
  shadow: 'SHADOW WALK',
  coldread: 'COLD READ',
  wiretap: 'WIRE TAP',
  signal: 'SIGNAL SCRAMBLE',
  takedown: 'TAKEDOWN',
  pursuit: 'HOT PURSUIT',
};

// ═══════════════════════════════════════════════════════
// Jewel Shimmer — hidden sparkle tap target
// ═══════════════════════════════════════════════════════
const JewelShimmer = ({ vaultTier, onCollect }: { vaultTier: number; onCollect: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [collected, setCollected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // 30% chance of spawning
    if (Math.random() > 0.3) return;

    // Spawn at random time between 2-6s into the game
    const spawnDelay = 2000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      setPosition({
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 70,
      });
      setVisible(true);

      // Disappear after 2 seconds
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 2000);
    }, spawnDelay);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleTap = () => {
    if (collected || !visible) return;
    setCollected(true);
    setVisible(false);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    onCollect();
  };

  if (!visible || collected) return null;

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: 32,
        height: 32,
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        animation: 'shimmerPulse 0.8s ease-in-out infinite',
        opacity: 0.5,
        filter: `drop-shadow(0 0 8px ${THEME.colors.diamond}60)`,
        pointerEvents: 'auto',
      }}
    >
      ✨
    </div>
  );
};

const HeistExecution = ({ vault, crewIds, chaosCard, onComplete }: HeistExecutionProps) => {
  const skipMinigame = chaosCard.effect === 'skip_minigame';

  const [games] = useState(() => getGameSequence(vault.tier));
  const [currentGame, setCurrentGame] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'transitioning'>('intro');
  const [shimmerCollected, setShimmerCollected] = useState(false);

  // Auto-skip first minigame if chaos card says so
  useEffect(() => {
    if (skipMinigame && currentGame === 0 && phase === 'intro') {
      setResults([true]);
      if (games.length > 1) {
        setCurrentGame(1);
      } else {
        // Only 1 game and it's skipped
        setTimeout(() => {
          onComplete({ miniGameResults: [true] });
        }, 1500);
      }
    }
  }, [skipMinigame, currentGame, phase, games.length, onComplete]);

  // Start after intro
  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('playing'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleGameResult = useCallback((success: boolean) => {
    if (success) {
      SFX.miniGameSuccess();
      Haptics.success();
    } else {
      SFX.miniGameFail();
      Haptics.fail();
    }

    const newResults = [...results, success];
    setResults(newResults);

    if (currentGame + 1 >= games.length) {
      setTimeout(() => {
        onComplete({ miniGameResults: newResults });
      }, 1500);
    } else {
      setPhase('transitioning');
      setTimeout(() => {
        setCurrentGame(prev => prev + 1);
        setPhase('playing');
      }, 1500);
    }
  }, [results, currentGame, games.length, onComplete]);

  const renderGame = () => {
    const gameType = games[currentGame];
    const d = vault.difficulty;
    switch (gameType) {
      case 'lock': return <LockPickGame difficulty={d} onResult={handleGameResult} />;
      case 'combo': return <SafeComboGame difficulty={d} onResult={handleGameResult} />;
      case 'wire': return <WireCutGame difficulty={d} onResult={handleGameResult} />;
      case 'tail': return <TailGame difficulty={d} onResult={handleGameResult} />;
      case 'interrogation': return <InterrogationGame difficulty={d} onResult={handleGameResult} />;
    }
  };

  return (
    <div style={{
      ...S.page, display: 'flex', flexDirection: 'column',
      minHeight: '100vh', padding: THEME.space.lg,
      position: 'relative',
    }}>
      {/* Jewel Shimmer overlay */}
      {phase === 'playing' && !shimmerCollected && (
        <JewelShimmer
          vaultTier={vault.tier}
          onCollect={() => setShimmerCollected(true)}
        />
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: THEME.space.xl, marginBottom: THEME.space.xl }}>
          <div style={S.eyebrow}>{vault.name}</div>
          <h1 style={{ ...S.h1, fontSize: 20, marginBottom: THEME.space.sm }}>
            {phase === 'intro' ? 'BREACHING...' : `STAGE ${currentGame + 1} OF ${games.length}`}
          </h1>
          {phase === 'playing' && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim,
              letterSpacing: 3, marginBottom: THEME.space.sm,
            }}>
              {GAME_NAMES[games[currentGame]]}
            </div>
          )}

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

          {/* Shimmer collected indicator */}
          {shimmerCollected && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.diamond,
              marginTop: THEME.space.xs, letterSpacing: 1,
            }}>
              ✨ BONUS JEWEL SECURED
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
        @keyframes shimmerPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default HeistExecution;
