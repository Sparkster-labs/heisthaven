import { useState, useEffect, useRef, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS, CREW_MEMBERS } from '@/lib/gameData';
import { LockPickGame, WireCutGame, SafeComboGame, PressureValveGame, TailGame, InterrogationGame } from './MiniGames';
import { ShadowWalkGame, ColdReadGame, WireTapGame, SignalScrambleGame, TakedownGame, HotPursuitGame } from './MiniGamesExtended';
import { SFX, Haptics } from '@/lib/sounds';
import { ResultOverlay, BlackFlash, MiniGameHUD, PolishStyles } from './MiniGamePolish';
import { getDifficultyTier, calculatePayout, formatPayoutBreakdown, getFailureHeat, isCrewSuppressed } from '@/lib/difficultyConfig';

interface HeistExecutionProps {
  vault: typeof VAULTS[number];
  crewIds: string[];
  chaosCard: typeof CHAOS_CARDS[number];
  onComplete: (results: { miniGameResults: boolean[] }) => void;
}

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
  return ['shadow', 'coldread', 'wiretap', 'signal', 'takedown', 'pursuit'];
}

const GAME_NAMES: Record<GameType, string> = {
  lock: 'LOCKPICK', combo: 'SAFE COMBO', wire: 'ALARM CUT',
  tail: 'THE TAIL', interrogation: 'THE INTERROGATION',
  shadow: 'SHADOW WALK', coldread: 'COLD READ', wiretap: 'WIRE TAP',
  signal: 'SIGNAL SCRAMBLE', takedown: 'TAKEDOWN', pursuit: 'HOT PURSUIT',
};

const GAME_ROLES: Record<GameType, string> = {
  lock: 'LOCKPICK', combo: 'SAFECRACKER', wire: 'HACKER',
  tail: 'DRIVER', interrogation: 'GRIFTER',
  shadow: 'SCOUT', coldread: 'GRIFTER', wiretap: 'HACKER',
  signal: 'COMMS', takedown: 'MUSCLE', pursuit: 'WHEELMAN',
};

// Jewel Shimmer
const JewelShimmer = ({ onCollect }: { vaultTier: number; onCollect: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [collected, setCollected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (Math.random() > 0.3) return;
    const spawnDelay = 2000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      setPosition({ x: 15 + Math.random() * 70, y: 10 + Math.random() * 70 });
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 2000);
    }, spawnDelay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleTap = () => {
    if (collected || !visible) return;
    setCollected(true);
    setVisible(false);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    SFX.tick();
    onCollect();
  };

  if (!visible || collected) return null;

  return (
    <div onClick={handleTap} style={{
      position: 'absolute', left: `${position.x}%`, top: `${position.y}%`,
      width: 32, height: 32, cursor: 'pointer', zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, animation: 'shimmerPulse 0.8s ease-in-out infinite',
      opacity: 0.5, filter: `drop-shadow(0 0 8px ${THEME.colors.diamond}60)`,
      pointerEvents: 'auto',
    }}>
      ✨
    </div>
  );
};

const HeistExecution = ({ vault, crewIds, chaosCard, onComplete }: HeistExecutionProps) => {
  const skipMinigame = chaosCard.effect === 'skip_minigame';
  const tier = getDifficultyTier(vault.difficulty);
  const chaosActive = chaosCard.effect !== 'payout_bonus' && chaosCard.effect !== 'loyalty_boost';
  const crewSuppressed = isCrewSuppressed(chaosActive);

  // Check if relevant crew role is active for current game
  const hasRelevantCrew = (gameType: GameType): boolean => {
    const roleMap: Record<string, string> = {
      shadow: 'scout', coldread: 'grifter', wiretap: 'hacker',
      signal: 'comms', takedown: 'muscle', pursuit: 'wheelman',
    };
    const role = roleMap[gameType];
    if (!role) return false;
    return crewIds.some(id => {
      const m = CREW_MEMBERS.find(c => c.id === id);
      return m?.role.toLowerCase() === role;
    });
  };

  const [games] = useState(() => getGameSequence(vault.tier));
  const [currentGame, setCurrentGame] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'intro' | 'entering' | 'playing' | 'result' | 'blackflash' | 'transitioning'>('intro');
  const [shimmerCollected, setShimmerCollected] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [payoutText, setPayoutText] = useState<string>('');
  const [heatText, setHeatText] = useState<string>('');

  useEffect(() => {
    if (skipMinigame && currentGame === 0 && phase === 'intro') {
      setResults([true]);
      if (games.length > 1) {
        setCurrentGame(1);
      } else {
        setTimeout(() => onComplete({ miniGameResults: [true] }), 1500);
      }
    }
  }, [skipMinigame, currentGame, phase, games.length, onComplete]);

  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('entering'), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'entering') {
      const t = setTimeout(() => setPhase('playing'), 300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (chaosActive) {
      SFX.chaos();
    }
  }, []);

  const handleGameResult = useCallback((success: boolean) => {
    if (success) {
      SFX.success();
      Haptics.success();
    } else {
      SFX.fail();
      Haptics.fail();
    }

    const currentGameType = games[currentGame];
    const crewBonusActive = hasRelevantCrew(currentGameType) && !crewSuppressed;
    // For now assume perfect = success (simplified; a full implementation would track mistakes per game)
    const payout = calculatePayout(tier, success, success, crewBonusActive, chaosActive && success);
    const breakdown = formatPayoutBreakdown(payout);

    const failHeat = getFailureHeat(tier);
    const chaosExtraHeat = chaosActive && !success ? 10 : 0;

    setPayoutText(success ? breakdown : '');
    setHeatText(!success ? `+${failHeat + chaosExtraHeat}% HEAT` : '');

    setLastResult(success);
    const newResults = [...results, success];
    setResults(newResults);
    setPhase('result');
  }, [results, games, currentGame, tier, chaosActive, crewSuppressed]);

  const handleResultDismiss = useCallback(() => {
    setPhase('blackflash');
  }, []);

  const handleBlackFlashDone = useCallback(() => {
    if (currentGame + 1 >= games.length) {
      onComplete({ miniGameResults: results });
    } else {
      setCurrentGame(prev => prev + 1);
      setPhase('entering');
    }
  }, [currentGame, games.length, onComplete, results]);

  const renderGame = () => {
    const gameType = games[currentGame];
    const d = vault.difficulty;
    const extProps = { difficulty: d, onResult: handleGameResult, crewIds, chaosCard };
    switch (gameType) {
      case 'lock': return <LockPickGame difficulty={d} onResult={handleGameResult} />;
      case 'combo': return <SafeComboGame difficulty={d} onResult={handleGameResult} />;
      case 'wire': return <WireCutGame difficulty={d} onResult={handleGameResult} />;
      case 'tail': return <TailGame difficulty={d} onResult={handleGameResult} />;
      case 'interrogation': return <InterrogationGame difficulty={d} onResult={handleGameResult} />;
      case 'shadow': return <ShadowWalkGame {...extProps} />;
      case 'coldread': return <ColdReadGame {...extProps} />;
      case 'wiretap': return <WireTapGame {...extProps} />;
      case 'signal': return <SignalScrambleGame {...extProps} />;
      case 'takedown': return <TakedownGame {...extProps} />;
      case 'pursuit': return <HotPursuitGame {...extProps} />;
    }
  };

  const currentGameType = games[currentGame];
  const roleName = GAME_ROLES[currentGameType];

  return (
    <div style={{
      ...S.page, display: 'flex', flexDirection: 'column',
      minHeight: '100vh', padding: THEME.space.lg,
      position: 'relative',
    }}>
      <PolishStyles />

      <MiniGameHUD
        vaultTier={vault.tier}
        crewIds={crewIds}
        chaosCard={chaosCard}
        currentGameType={currentGameType}
        visible={phase === 'playing' || phase === 'entering'}
        crewSuppressed={crewSuppressed}
      />

      {(phase === 'playing' || phase === 'entering') && !shimmerCollected && (
        <JewelShimmer vaultTier={vault.tier} onCollect={() => setShimmerCollected(true)} />
      )}

      {phase === 'result' && lastResult !== null && (
        <ResultOverlay
          success={lastResult}
          roleName={lastResult ? `${roleName} CLEAR` : undefined}
          payoutMultiplier={payoutText || undefined}
          heatPenalty={heatText || undefined}
          onDismiss={handleResultDismiss}
        />
      )}

      {phase === 'blackflash' && <BlackFlash onDone={handleBlackFlashDone} />}

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', paddingTop: THEME.space.xl, marginBottom: THEME.space.xl }}>
          <div style={S.eyebrow}>{vault.name}</div>
          <h1 style={{ ...S.h1, fontSize: 20, marginBottom: THEME.space.sm }}>
            {phase === 'intro' ? 'BREACHING...' : `STAGE ${currentGame + 1} OF ${games.length}`}
          </h1>
          {(phase === 'playing' || phase === 'entering') && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.display, color: THEME.colors.goldDim,
              letterSpacing: 3, marginBottom: THEME.space.sm,
            }}>
              {GAME_NAMES[currentGameType]}
            </div>
          )}

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

          {skipMinigame && currentGame <= 1 && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald,
              marginTop: THEME.space.sm, letterSpacing: 1,
            }}>
              🔓 INSIDE JOB — Stage 1 bypassed
            </div>
          )}

          {shimmerCollected && (
            <div style={{
              fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.diamond,
              marginTop: THEME.space.xs, letterSpacing: 1,
            }}>
              ✨ BONUS JEWEL SECURED
            </div>
          )}
        </div>

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
          {phase === 'entering' && (
            <div className="minigame-enter">
              {renderGame()}
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
