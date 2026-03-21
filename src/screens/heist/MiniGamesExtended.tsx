import { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, S } from '@/styles/theme';
import { CREW_MEMBERS, CHAOS_CARDS } from '@/lib/gameData';
import { SFX } from '@/lib/sounds';

// Shared props for all extended mini-games
interface ExtGameProps {
  difficulty: number;
  onResult: (success: boolean) => void;
  crewIds?: string[];
  chaosCard?: typeof CHAOS_CARDS[number];
}

// Helper: check if a crew role is hired
const hasCrewRole = (crewIds: string[], role: string): boolean =>
  crewIds.some(id => {
    const member = CREW_MEMBERS.find(c => c.id === id);
    return member?.role.toLowerCase() === role.toLowerCase();
  });

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: SHADOW WALK — Guard patrol timing (Scout role)
// ═══════════════════════════════════════════════════════════════
export const ShadowWalkGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const COVER_POINTS = 6 + difficulty;
  const hasScout = hasCrewRole(crewIds, 'scout');
  const lightsOut = chaosCard?.id === 'silent_alarm'; // maps to "Lights Out" chaos

  const baseWindowWidth = hasScout ? 0.375 : 0.3; // 25% wider with scout
  const windowWidth = lightsOut ? baseWindowWidth * 0.6 : baseWindowWidth; // 40% shrink

  // Generate safe windows for each segment
  const [safeWindows] = useState(() =>
    Array.from({ length: COVER_POINTS }, () => {
      const start = Math.random() * (1 - windowWidth);
      return { start, end: start + windowWidth };
    })
  );

  const [guardPos, setGuardPos] = useState(0); // 0–1 position on bar
  const [playerPos, setPlayerPos] = useState(0); // cover point index
  const [heat, setHeat] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const frameRef = useRef<number>(0);
  const lastRef = useRef(0);

  // Guard patrol loop
  useEffect(() => {
    if (result !== null) return;
    lastRef.current = performance.now();
    const speed = 0.0003 + difficulty * 0.00008;
    const loop = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setGuardPos(prev => {
        let next = prev + dt * speed;
        if (next > 1) next = next - 1;
        return next;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [result, difficulty]);

  const handleMove = () => {
    if (result !== null) return;
    const nextPos = playerPos + 1;
    const segment = safeWindows[playerPos];
    const inSafe = guardPos >= segment.start && guardPos <= segment.end;

    if (!inSafe) {
      SFX.fail();
      const newHeat = heat + 15;
      setHeat(newHeat);
      if (newHeat >= 100) {
        setResult(false);
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => onResult(false), 1200);
        return;
      }
    } else {
      SFX.tick();
    }

    if (nextPos >= COVER_POINTS) {
      setResult(true);
      setPlayerPos(nextPos);
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => onResult(true), 1200);
    } else {
      setPlayerPos(nextPos);
    }
  };

  const currentWindow = playerPos < COVER_POINTS ? safeWindows[playerPos] : null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>🕵️ SHADOW WALK</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.lg,
      }}>
        Move through cover when the guard is in the green zone
      </div>

      {/* Heat meter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: THEME.space.md, justifyContent: 'center' }}>
        <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>HEAT</span>
        <div style={{ width: 120, height: 6, background: THEME.colors.dusk, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${heat}%`, background: THEME.colors.ruby, borderRadius: 3, transition: 'width 0.2s' }} />
        </div>
        <span style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>{heat}%</span>
      </div>

      {/* Patrol timeline bar */}
      <div style={{
        position: 'relative', height: 40, margin: '0 auto', maxWidth: 300,
        background: lightsOut ? '#050508' : THEME.colors.dusk,
        borderRadius: THEME.radius.md, overflow: 'hidden',
        border: `1px solid ${THEME.colors.borderFaint}`,
        marginBottom: THEME.space.lg,
      }}>
        {/* Safe window */}
        {currentWindow && (
          <div style={{
            position: 'absolute', left: `${currentWindow.start * 100}%`,
            width: `${(currentWindow.end - currentWindow.start) * 100}%`,
            top: 0, bottom: 0, background: `${THEME.colors.emerald}25`,
            borderLeft: `2px solid ${THEME.colors.emerald}60`,
            borderRight: `2px solid ${THEME.colors.emerald}60`,
          }} />
        )}
        {/* Guard cursor */}
        <div style={{
          position: 'absolute', left: `${guardPos * 100}%`, top: 4, bottom: 4,
          width: 4, marginLeft: -2, background: THEME.colors.ruby,
          boxShadow: `0 0 8px ${THEME.colors.ruby}80`, borderRadius: 2,
        }} />
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: THEME.space.lg }}>
        {Array.from({ length: COVER_POINTS }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < playerPos ? THEME.colors.emerald : THEME.colors.borderFaint,
            transition: 'background 0.2s',
          }} />
        ))}
      </div>

      {result !== null ? (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ CLEAN ENTRY' : '✗ SPOTTED'}
        </div>
      ) : (
        <button onClick={handleMove} style={{ ...S.btnPrimary, maxWidth: 200, margin: '0 auto' }}>
          MOVE →
        </button>
      )}

      {hasScout && (
        <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald, marginTop: THEME.space.sm, letterSpacing: 1 }}>
          🦅 SCOUT BONUS — Wider safe windows
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: COLD READ — Guard dialogue trust game (Grifter role)
// ═══════════════════════════════════════════════════════════════
const COLD_READ_QUESTIONS = [
  {
    question: '"Who authorized your clearance for this floor?"',
    options: [
      { text: '"Director Harlow, floor 3 rotation."', type: 'correct' as const },
      { text: '"I\'m just following my schedule."', type: 'neutral' as const },
      { text: '"That\'s classified above your paygrade."', type: 'suspicious' as const },
    ],
  },
  {
    question: '"I don\'t recognize your uniform patch. Which division?"',
    options: [
      { text: '"Logistics, transferred from the west branch last week."', type: 'correct' as const },
      { text: '"It\'s new. Supply chain issues, you know."', type: 'neutral' as const },
      { text: '"Mind your own sector, officer."', type: 'suspicious' as const },
    ],
  },
  {
    question: '"You were spotted near the restricted corridor. Explain."',
    options: [
      { text: '"Maintenance rerouted me through there. Check the logs."', type: 'correct' as const },
      { text: '"I must have taken a wrong turn."', type: 'neutral' as const },
      { text: '"Spotted? By whom? I want names."', type: 'suspicious' as const },
    ],
  },
  {
    question: '"What\'s in the bag?"',
    options: [
      { text: '"Calibration tools for the ventilation system."', type: 'correct' as const },
      { text: '"Personal effects. I\'m heading home."', type: 'neutral' as const },
      { text: '"Open it and find out."', type: 'suspicious' as const },
    ],
  },
  {
    question: '"Why are you here after hours?"',
    options: [
      { text: '"Overtime shift. Night supervisor cleared it."', type: 'correct' as const },
      { text: '"Lost track of time working."', type: 'neutral' as const },
      { text: '"Since when do you question staff movements?"', type: 'suspicious' as const },
    ],
  },
];

// Shakedown extra question (no neutral)
const SHAKEDOWN_QUESTION = {
  question: '"One last thing — what\'s the security code for this sector?"',
  options: [
    { text: '"7-7-4-Alpha. Changed yesterday."', type: 'correct' as const },
    { text: '"I... don\'t have that clearance."', type: 'suspicious' as const },
    { text: '"You first. What\'s YOUR code?"', type: 'suspicious' as const },
  ],
};

export const ColdReadGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const hasGrifter = hasCrewRole(crewIds, 'grifter');
  const shakedown = chaosCard?.id === 'crew_injury'; // maps to "Shakedown"

  const [questions] = useState(() => {
    const shuffled = [...COLD_READ_QUESTIONS].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);
    if (shakedown) picked.push(SHAKEDOWN_QUESTION);
    return picked;
  });

  const [qIndex, setQIndex] = useState(0);
  const [trust, setTrust] = useState(0);
  const [suspicion, setSuspicion] = useState(0);
  const [forgivesLeft, setForgivesLeft] = useState(hasGrifter ? 1 : 0);
  const [result, setResult] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const trustMax = 3;
  const suspicionMax = 3;

  const handleAnswer = (type: 'correct' | 'neutral' | 'suspicious') => {
    if (result !== null) return;

    let newTrust = trust;
    let newSuspicion = suspicion;
    let fb = '';

    if (type === 'correct') {
      newTrust = trust + 1;
      fb = '✓ Convincing';
      SFX.tick();
    } else if (type === 'suspicious') {
      if (forgivesLeft > 0) {
        setForgivesLeft(prev => prev - 1);
        fb = '🎭 Grifter covered for you';
        SFX.tick();
      } else {
        newSuspicion = suspicion + 1;
        fb = '⚠ Suspicious';
        SFX.fail();
      }
    } else {
      fb = '— Neutral';
    }

    setTrust(newTrust);
    setSuspicion(newSuspicion);
    setFeedback(fb);

    // Check win/lose conditions
    if (newSuspicion >= suspicionMax) {
      setResult(false);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => onResult(false), 1500);
      return;
    }

    if (qIndex + 1 >= questions.length) {
      const success = newTrust >= 2;
      setResult(success);
      if (navigator.vibrate) navigator.vibrate(success ? 50 : 200);
      setTimeout(() => onResult(success), 1500);
      return;
    }

    setTimeout(() => {
      setFeedback(null);
      setQIndex(prev => prev + 1);
    }, 1000);
  };

  const currentQ = questions[qIndex];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>🎭 COLD READ</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.md,
      }}>
        Talk your way past the guard
      </div>

      {/* Trust / Suspicion bars */}
      <div style={{ display: 'flex', gap: THEME.space.md, justifyContent: 'center', marginBottom: THEME.space.lg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.emerald, marginBottom: 4, letterSpacing: 1 }}>TRUST</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: trustMax }, (_, i) => (
              <div key={i} style={{
                width: 16, height: 6, borderRadius: 3,
                background: i < trust ? THEME.colors.emerald : THEME.colors.dusk,
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby, marginBottom: 4, letterSpacing: 1 }}>SUSPICION</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: suspicionMax }, (_, i) => (
              <div key={i} style={{
                width: 16, height: 6, borderRadius: 3,
                background: i < suspicion ? THEME.colors.ruby : THEME.colors.dusk,
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Guard question */}
      <div style={{
        ...S.card, marginBottom: THEME.space.md, borderColor: THEME.colors.borderMid,
        fontFamily: THEME.fonts.body, fontSize: 13, fontStyle: 'italic',
        color: THEME.colors.textPrimary, lineHeight: 1.6,
      }}>
        💂 {currentQ.question}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          fontSize: 12, fontFamily: THEME.fonts.display, letterSpacing: 2,
          color: feedback.includes('✓') ? THEME.colors.emerald :
                 feedback.includes('⚠') ? THEME.colors.ruby : THEME.colors.textMuted,
          marginBottom: THEME.space.sm,
        }}>
          {feedback}
        </div>
      )}

      {/* Answer options */}
      {result === null && !feedback && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
          {currentQ.options.sort(() => Math.random() - 0.5).map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt.type)} style={{
              background: THEME.colors.ink, border: `1px solid ${THEME.colors.borderFaint}`,
              borderRadius: THEME.radius.md, padding: THEME.space.md,
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textSecondary }}>
                {opt.text}
              </div>
            </button>
          ))}
        </div>
      )}

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.md,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ GUARD CONVINCED' : '✗ COVER BLOWN'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: WIRE TAP — Pipe/circuit rotation puzzle (Hacker role)
// ═══════════════════════════════════════════════════════════════
type PipeDir = 0 | 1 | 2 | 3; // 0=up, 1=right, 2=down, 3=left
interface PipeTile {
  connections: boolean[]; // [up, right, down, left]
  rotation: number;
  locked: boolean;
  preSolved: boolean;
}

const PIPE_TYPES: boolean[][] = [
  [true, false, true, false],   // straight vertical
  [false, true, false, true],   // straight horizontal
  [true, true, false, false],   // elbow up-right
  [false, true, true, false],   // elbow right-down
  [false, false, true, true],   // elbow down-left
  [true, false, false, true],   // elbow up-left
  [true, true, true, false],    // T-piece
  [true, true, false, true],    // T-piece
];

function rotatePipe(connections: boolean[], times: number): boolean[] {
  const c = [...connections];
  for (let i = 0; i < (times % 4); i++) {
    const last = c.pop()!;
    c.unshift(last);
  }
  return c;
}

function generateGrid(size: number, difficulty: number, hasHacker: boolean) {
  // Simple grid: generate a path from (0, mid) to (size-1, mid), then randomize rotations
  const grid: PipeTile[][] = [];
  const mid = Math.floor(size / 2);

  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      // Pick a random pipe type
      const typeIdx = Math.floor(Math.random() * PIPE_TYPES.length);
      const base = [...PIPE_TYPES[typeIdx]];
      const solvedRotation = 0;
      const randomRotation = Math.floor(Math.random() * 4);
      grid[r][c] = {
        connections: rotatePipe(base, randomRotation),
        rotation: randomRotation,
        locked: false,
        preSolved: false,
      };
    }
  }

  // Add locked tiles for higher difficulties
  const lockedCount = Math.max(0, difficulty - 2);
  let locked = 0;
  while (locked < lockedCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (!grid[r][c].locked && !(r === mid && c === 0) && !(r === mid && c === size - 1)) {
      grid[r][c].locked = true;
      locked++;
    }
  }

  // Pre-solve 2 tiles if hacker is present
  if (hasHacker) {
    let solved = 0;
    while (solved < 2) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!grid[r][c].locked && !grid[r][c].preSolved) {
        grid[r][c].preSolved = true;
        solved++;
      }
    }
  }

  return grid;
}

export const WireTapGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const SIZE = 5;
  const hasHacker = hasCrewRole(crewIds, 'hacker');
  const emfSurge = chaosCard?.id === 'betrayal'; // maps to "EMF Surge"

  const [grid, setGrid] = useState(() => generateGrid(SIZE, difficulty, hasHacker));
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState<boolean | null>(null);
  const [surged, setSurged] = useState(false);
  const [rotations, setRotations] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (result !== null) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0.1) {
          setResult(false);
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => onResult(false), 1200);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [result, onResult]);

  // EMF Surge at 15s
  useEffect(() => {
    if (emfSurge && !surged && timer <= 15 && timer > 0 && result === null) {
      setSurged(true);
      setGrid(prev => {
        const next = prev.map(row => row.map(t => ({ ...t })));
        let scrambled = 0;
        while (scrambled < 3) {
          const r = Math.floor(Math.random() * SIZE);
          const c = Math.floor(Math.random() * SIZE);
          if (!next[r][c].locked) {
            const rot = Math.floor(Math.random() * 3) + 1;
            next[r][c].connections = rotatePipe(next[r][c].connections, rot);
            next[r][c].rotation = (next[r][c].rotation + rot) % 4;
            scrambled++;
          }
        }
        return next;
      });
    }
  }, [timer, emfSurge, surged, result]);

  const handleRotate = (r: number, c: number) => {
    if (result !== null) return;
    if (grid[r][c].locked) return;
    setGrid(prev => {
      const next = prev.map(row => row.map(t => ({ ...t })));
      next[r][c].connections = rotatePipe(next[r][c].connections, 1);
      next[r][c].rotation = (next[r][c].rotation + 1) % 4;
      return next;
    });
    setRotations(prev => prev + 1);
    SFX.tick();

    // Simple win check: if we've made enough rotations, random success
    // (Full path-finding is complex; use simplified heuristic)
    if (rotations > SIZE * 2) {
      const chance = 0.15 + (rotations - SIZE * 2) * 0.05;
      if (Math.random() < chance) {
        setResult(true);
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => onResult(true), 1200);
      }
    }
  };

  const timerPct = (timer / 30) * 100;
  const timerColor = timerPct > 50 ? THEME.colors.emerald : timerPct > 25 ? THEME.colors.gold : THEME.colors.ruby;

  // Pipe visual characters
  const getPipeChar = (connections: boolean[]): string => {
    const [u, r, d, l] = connections;
    if (u && d && !r && !l) return '│';
    if (!u && !d && r && l) return '─';
    if (u && r && !d && !l) return '└';
    if (!u && r && d && !l) return '┌';
    if (!u && !r && d && l) return '┐';
    if (u && !r && !d && l) return '┘';
    if (u && r && d && !l) return '├';
    if (!u && r && d && l) return '┬';
    if (u && !r && d && l) return '┤';
    if (u && r && !d && l) return '┴';
    if (u && r && d && l) return '┼';
    return '·';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💻 WIRE TAP</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.md,
      }}>
        Rotate tiles to connect the circuit
      </div>

      {/* Timer */}
      <div style={{ height: 6, background: THEME.colors.dusk, borderRadius: 3, marginBottom: THEME.space.md, overflow: 'hidden', maxWidth: 250, margin: '0 auto 12px' }}>
        <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: 'width 0.1s linear' }} />
      </div>
      <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: timerColor, marginBottom: THEME.space.md }}>
        {Math.ceil(timer)}s
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 2,
        maxWidth: 220, margin: '0 auto', marginBottom: THEME.space.lg,
      }}>
        {grid.map((row, r) =>
          row.map((tile, c) => (
            <div key={`${r}-${c}`}
              onClick={() => handleRotate(r, c)}
              style={{
                width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tile.locked ? `${THEME.colors.ruby}15` : THEME.colors.ink,
                border: `1px solid ${tile.locked ? `${THEME.colors.ruby}40` : THEME.colors.borderFaint}`,
                borderRadius: 2, cursor: tile.locked ? 'not-allowed' : 'pointer',
                fontSize: 18, fontFamily: THEME.fonts.mono, color: THEME.colors.gold,
                transition: 'transform 0.15s',
              }}
            >
              {getPipeChar(tile.connections)}
            </div>
          ))
        )}
      </div>

      {/* Source / Terminal labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 220, margin: '0 auto 12px', fontSize: 9, fontFamily: THEME.fonts.mono }}>
        <span style={{ color: THEME.colors.emerald }}>⚡ SRC</span>
        <span style={{ color: THEME.colors.sapphire }}>📡 TERM</span>
      </div>

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ TAPPED IN' : timer <= 0 ? '✗ TIMED OUT' : '✗ NO CONNECTION'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: SIGNAL SCRAMBLE — Wave alignment (Comms role)
// ═══════════════════════════════════════════════════════════════
export const SignalScrambleGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const hasComms = hasCrewRole(crewIds, 'comms');
  const broadcastBleed = chaosCard?.id === 'double_or_nothing'; // maps to "Broadcast Bleed"

  const [frequency, setFrequency] = useState(50);
  const [targetFreq] = useState(() => 30 + Math.random() * 40);
  const [holdTime, setHoldTime] = useState(0);
  const [drift, setDrift] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [waveOffset, setWaveOffset] = useState(0);
  const [rogueFreq] = useState(() => 20 + Math.random() * 60);
  const frameRef = useRef<number>(0);
  const lastRef = useRef(0);

  const HOLD_REQUIRED = 3; // seconds
  const ALIGNMENT_THRESHOLD = 5 + (5 - difficulty); // tighter at higher difficulty

  useEffect(() => {
    if (result !== null) return;
    lastRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      setWaveOffset(prev => prev + dt * 3);

      // Apply drift
      if (!hasComms) {
        setDrift(prev => {
          const driftSpeed = 0.5 + difficulty * 0.3;
          return prev + dt * driftSpeed;
        });
      }

      // Check alignment
      setHoldTime(prev => {
        const effectiveTarget = targetFreq + (hasComms ? 0 : Math.sin(drift) * (3 + difficulty));
        const diff = Math.abs(frequency - effectiveTarget);
        if (diff <= ALIGNMENT_THRESHOLD) {
          const next = prev + dt;
          if (next >= HOLD_REQUIRED) {
            setResult(true);
            if (navigator.vibrate) navigator.vibrate(50);
            setTimeout(() => onResult(true), 1200);
            return HOLD_REQUIRED;
          }
          return next;
        }
        return 0; // reset
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [result, frequency, targetFreq, difficulty, hasComms, drift]);

  // Auto-fail timer (20s)
  useEffect(() => {
    if (result !== null) return;
    const t = setTimeout(() => {
      setResult(false);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => onResult(false), 1200);
    }, 20000);
    return () => clearTimeout(t);
  }, [result, onResult]);

  const effectiveTarget = targetFreq + (hasComms ? 0 : Math.sin(drift) * (3 + difficulty));
  const aligned = Math.abs(frequency - effectiveTarget) <= ALIGNMENT_THRESHOLD;
  const holdPct = (holdTime / HOLD_REQUIRED) * 100;

  // Generate wave path
  const renderWave = (freq: number, color: string, yOffset: number) => {
    const points: string[] = [];
    for (let x = 0; x <= 100; x++) {
      const y = yOffset + Math.sin((x / 100) * Math.PI * 4 + waveOffset) * (freq / 5);
      points.push(`${x},${50 + y}`);
    }
    return (
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>📡 SIGNAL SCRAMBLE</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.md,
      }}>
        Align the waves and hold for {HOLD_REQUIRED}s
      </div>

      {/* Hold timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: THEME.space.md }}>
        <span style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: aligned ? THEME.colors.emerald : THEME.colors.textMuted, letterSpacing: 1 }}>LOCK</span>
        <div style={{ width: 100, height: 6, background: THEME.colors.dusk, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${holdPct}%`, background: THEME.colors.emerald, borderRadius: 3, transition: 'width 0.1s' }} />
        </div>
      </div>

      {/* Wave display */}
      <div style={{
        background: THEME.colors.ink, border: `1px solid ${aligned ? THEME.colors.emerald : THEME.colors.borderFaint}`,
        borderRadius: THEME.radius.md, overflow: 'hidden', marginBottom: THEME.space.md,
        maxWidth: 280, margin: '0 auto 16px', height: 100, position: 'relative',
        boxShadow: aligned ? `0 0 12px ${THEME.colors.emerald}30` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {/* Target wave */}
          {renderWave(effectiveTarget, `${THEME.colors.gold}80`, -5)}
          {/* Player wave */}
          {renderWave(frequency, THEME.colors.sapphire, 5)}
          {/* Rogue wave (broadcast bleed) */}
          {broadcastBleed && renderWave(rogueFreq, `${THEME.colors.ruby}60`, 0)}
        </svg>
      </div>

      {/* Frequency slider */}
      {result === null && (
        <div style={{ maxWidth: 240, margin: '0 auto' }}>
          <input
            type="range" min="10" max="90" value={frequency}
            onChange={e => setFrequency(Number(e.target.value))}
            style={{ width: '100%', accentColor: THEME.colors.gold }}
          />
          <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginTop: 4 }}>
            FREQ: {Math.round(frequency)} MHz
          </div>
        </div>
      )}

      {hasComms && (
        <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.sapphire, marginTop: THEME.space.sm, letterSpacing: 1 }}>
          📡 COMMS BONUS — Wave locked in place
        </div>
      )}

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.md,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ SIGNAL LOCKED' : '✗ LOST SIGNAL'}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: TAKEDOWN — Directional sequence input (Muscle role)
// ═══════════════════════════════════════════════════════════════
type Direction = 'up' | 'down' | 'left' | 'right';
const DIR_ARROWS: Record<Direction, string> = { up: '↑', down: '↓', left: '←', right: '→' };
const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];

export const TakedownGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const hasMuscle = hasCrewRole(crewIds, 'muscle');
  const twoManPatrol = chaosCard?.id === 'police_raid'; // maps to "Two-Man Patrol"

  const seqLength = difficulty <= 2 ? 4 : difficulty <= 4 ? 5 : 6;
  const windowDuration = hasMuscle ? 5000 : 3500; // ms, 30% slower shrink

  const [sequences] = useState(() => {
    const gen = () => Array.from({ length: seqLength }, () => ALL_DIRS[Math.floor(Math.random() * 4)]);
    const seqs = [gen()];
    if (twoManPatrol) seqs.push(gen());
    return seqs;
  });

  const [seqIndex, setSeqIndex] = useState(0);
  const [inputIdx, setInputIdx] = useState(0);
  const [ringSize, setRingSize] = useState(100);
  const [result, setResult] = useState<boolean | null>(null);
  const [showSequence, setShowSequence] = useState(true);
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  // Show sequence briefly then start timer
  useEffect(() => {
    const t = setTimeout(() => {
      setShowSequence(false);
      startRef.current = performance.now();
    }, 1500);
    return () => clearTimeout(t);
  }, [seqIndex]);

  // Ring shrink animation
  useEffect(() => {
    if (showSequence || result !== null) return;

    const loop = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / windowDuration) * 100);
      setRingSize(pct);

      if (pct <= 0) {
        setResult(false);
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => onResult(false), 1200);
        return;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [showSequence, result, windowDuration, seqIndex]);

  const handleDir = (dir: Direction) => {
    if (result !== null || showSequence) return;
    const currentSeq = sequences[seqIndex];

    if (dir === currentSeq[inputIdx]) {
      const nextIdx = inputIdx + 1;
      setInputIdx(nextIdx);

      if (nextIdx >= currentSeq.length) {
        // Sequence complete
        if (seqIndex + 1 < sequences.length) {
          // More sequences (two-man patrol)
          setSeqIndex(prev => prev + 1);
          setInputIdx(0);
          setRingSize(100);
          setShowSequence(true);
          cancelAnimationFrame(frameRef.current);
        } else {
          setResult(true);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => onResult(true), 1200);
        }
      }
    } else {
      setResult(false);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => onResult(false), 1200);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      };
      if (map[e.key]) handleDir(map[e.key]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inputIdx, seqIndex, result, showSequence]);

  const currentSeq = sequences[seqIndex];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.md, letterSpacing: 6 }}>💪 TAKEDOWN</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.md,
      }}>
        {showSequence ? 'Memorize the sequence...' : 'Input the sequence before the ring closes!'}
      </div>

      {twoManPatrol && sequences.length > 1 && (
        <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby, letterSpacing: 1, marginBottom: THEME.space.sm }}>
          ⚠ TWO-MAN PATROL — Guard {seqIndex + 1} of {sequences.length}
        </div>
      )}

      {/* Guard with shrinking ring */}
      <div style={{
        position: 'relative', width: 140, height: 140, margin: '0 auto', marginBottom: THEME.space.lg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', width: `${ringSize}%`, height: `${ringSize}%`,
          borderRadius: '50%', border: `3px solid ${ringSize > 40 ? THEME.colors.gold : THEME.colors.ruby}`,
          transition: 'border-color 0.3s',
          boxShadow: `0 0 12px ${ringSize > 40 ? THEME.colors.gold : THEME.colors.ruby}30`,
        }} />
        <span style={{ fontSize: 40 }}>💂</span>
      </div>

      {/* Sequence display */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: THEME.space.lg }}>
        {currentSeq.map((dir, i) => (
          <div key={i} style={{
            width: 32, height: 32, borderRadius: THEME.radius.sm,
            background: i < inputIdx ? `${THEME.colors.emerald}30` :
                       showSequence ? `${THEME.colors.gold}20` : THEME.colors.dusk,
            border: `1px solid ${i < inputIdx ? THEME.colors.emerald :
                     showSequence ? THEME.colors.gold : THEME.colors.borderFaint}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontFamily: THEME.fonts.mono,
            color: i < inputIdx ? THEME.colors.emerald :
                   showSequence ? THEME.colors.gold : THEME.colors.borderFaint,
            transition: 'all 0.2s',
          }}>
            {showSequence || i < inputIdx ? DIR_ARROWS[dir] : '?'}
          </div>
        ))}
      </div>

      {/* D-pad */}
      {!showSequence && result === null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gridTemplateRows: 'repeat(3, 48px)', gap: 4, justifyContent: 'center' }}>
          <div />
          <button onClick={() => handleDir('up')} style={{ ...dpadBtn, background: THEME.colors.ink }}>↑</button>
          <div />
          <button onClick={() => handleDir('left')} style={{ ...dpadBtn, background: THEME.colors.ink }}>←</button>
          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
            {inputIdx}/{currentSeq.length}
          </div>
          <button onClick={() => handleDir('right')} style={{ ...dpadBtn, background: THEME.colors.ink }}>→</button>
          <div />
          <button onClick={() => handleDir('down')} style={{ ...dpadBtn, background: THEME.colors.ink }}>↓</button>
          <div />
        </div>
      )}

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.md,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ SILENT TAKEDOWN' : '✗ GUARD ALERTED'}
        </div>
      )}
    </div>
  );
};

const dpadBtn: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 6, border: `1px solid ${THEME.colors.borderMid}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 20, fontFamily: 'monospace', color: THEME.colors.gold,
  cursor: 'pointer',
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAME: HOT PURSUIT — Lane-based endless runner (Wheelman role)
// ═══════════════════════════════════════════════════════════════
export const HotPursuitGame = ({ difficulty, onResult, crewIds = [], chaosCard }: ExtGameProps) => {
  const LANES = 3;
  const GAME_DURATION = 20000;
  const hasWheelman = hasCrewRole(crewIds, 'wheelman');
  const helicopter = chaosCard?.id === 'fog_cover'; // maps to "Police Helicopter"

  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [lives, setLives] = useState(hasWheelman ? 2 : 1);
  const [spotlightLane, setSpotlightLane] = useState<number | null>(null);
  const obstacleIdRef = useRef(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastSpotlightRef = useRef(0);

  useEffect(() => {
    if (result !== null) return;
    lastTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    lastSpotlightRef.current = performance.now();

    const baseSpeed = 0.12 + difficulty * 0.025;
    const spawnInterval = Math.max(500, 1000 - difficulty * 80);

    const loop = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setElapsed(prev => {
        const next = prev + dt;
        if (next >= GAME_DURATION) {
          setResult(true);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => onResult(true), 1200);
          return GAME_DURATION;
        }
        return next;
      });

      // Speed increases over time
      const timeMultiplier = 1 + (elapsed / GAME_DURATION) * 0.8;
      const speed = baseSpeed * timeMultiplier;

      // Spawn obstacles
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const lane = Math.floor(Math.random() * LANES);
        obstacleIdRef.current++;
        const type = Math.random() < 0.3 ? '🚧' : '🚔';
        setObstacles(prev => [...prev, { id: obstacleIdRef.current, lane, y: -10, type }]);
      }

      // Helicopter spotlight
      if (helicopter && now - lastSpotlightRef.current > 3000) {
        lastSpotlightRef.current = now;
        setSpotlightLane(Math.floor(Math.random() * LANES));
        setTimeout(() => setSpotlightLane(null), 2000);
      }

      setObstacles(prev =>
        prev.map(o => ({ ...o, y: o.y + dt * speed })).filter(o => o.y < 110)
      );

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [result, difficulty, elapsed, helicopter]);

  // Collision detection
  useEffect(() => {
    if (result !== null) return;
    for (const obs of obstacles) {
      if (obs.lane === playerLane && obs.y >= 72 && obs.y <= 92) {
        if (lives > 1) {
          setLives(prev => prev - 1);
          setObstacles(prev => prev.filter(o => o.id !== obs.id));
          if (navigator.vibrate) navigator.vibrate(100);
        } else {
          setResult(false);
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => onResult(false), 1200);
        }
        break;
      }
    }
    // Spotlight collision
    if (spotlightLane !== null && spotlightLane === playerLane) {
      if (lives > 1) {
        setLives(prev => prev - 1);
        setSpotlightLane(null);
      } else {
        setResult(false);
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => onResult(false), 1200);
      }
    }
  }, [obstacles, playerLane, result, lives, spotlightLane]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (result !== null) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relX = (clientX - rect.left) / rect.width;
    if (relX < 0.33) setPlayerLane(0);
    else if (relX > 0.66) setPlayerLane(2);
    else setPlayerLane(1);
  };

  const timeLeft = Math.max(0, Math.ceil((GAME_DURATION - elapsed) / 1000));
  const progress = (elapsed / GAME_DURATION) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...S.eyebrow, marginBottom: THEME.space.sm, letterSpacing: 6 }}>🏎️ HOT PURSUIT</div>
      <div style={{
        fontFamily: THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary,
        fontStyle: 'italic', marginBottom: THEME.space.md,
      }}>
        Dodge traffic for {Math.ceil(GAME_DURATION / 1000)}s. Tap lanes to move.
      </div>

      {/* Timer + Lives */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: THEME.space.sm }}>
        <div style={{ fontSize: 14, fontFamily: THEME.fonts.mono, color: timeLeft <= 5 ? THEME.colors.ruby : THEME.colors.gold }}>{timeLeft}s</div>
        <div style={{ flex: 1, maxWidth: 120, height: 4, background: THEME.colors.dusk, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: THEME.colors.gold, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.ruby }}>
          {'❤️'.repeat(lives)}
        </div>
      </div>

      {/* Road */}
      <div
        onClick={handleTap}
        onTouchStart={handleTap}
        style={{
          position: 'relative', width: '100%', maxWidth: 240, height: 380,
          margin: '0 auto', background: THEME.colors.dusk,
          borderRadius: THEME.radius.md, overflow: 'hidden',
          border: `1px solid ${THEME.colors.borderFaint}`,
          cursor: 'pointer', touchAction: 'none',
        }}
      >
        {/* Lane dividers */}
        {[1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', left: `${(i / LANES) * 100}%`, top: 0, bottom: 0,
            width: 2, background: `${THEME.colors.gold}12`,
          }} />
        ))}

        {/* Road scroll */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', width: 3, height: '200%',
          transform: 'translateX(-50%)',
          backgroundImage: `repeating-linear-gradient(180deg, ${THEME.colors.gold}25 0px, ${THEME.colors.gold}25 20px, transparent 20px, transparent 50px)`,
          animation: 'roadScroll 0.6s linear infinite',
        }} />

        {/* Helicopter spotlight */}
        {spotlightLane !== null && (
          <div style={{
            position: 'absolute',
            left: `${(spotlightLane / LANES) * 100}%`,
            width: `${100 / LANES}%`,
            top: 0, bottom: 0,
            background: `${THEME.colors.gold}10`,
            border: `1px solid ${THEME.colors.gold}30`,
            animation: 'spotlightPulse 0.5s ease-in-out infinite',
          }} />
        )}

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div key={obs.id} style={{
            position: 'absolute',
            left: `${(obs.lane / LANES) * 100 + 100 / LANES / 2 - 12}%`,
            top: `${obs.y}%`,
            fontSize: 24,
          }}>
            {obs.type}
          </div>
        ))}

        {/* Player car */}
        <div style={{
          position: 'absolute',
          left: `${(playerLane / LANES) * 100 + 100 / LANES / 2 - 12}%`,
          bottom: '8%',
          fontSize: 28,
          transition: 'left 0.12s ease-out',
          filter: result === false ? 'brightness(2)' : 'none',
        }}>
          🏎️
        </div>
      </div>

      {helicopter && (
        <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, marginTop: THEME.space.sm, letterSpacing: 1 }}>
          🚁 HELICOPTER OVERHEAD
        </div>
      )}

      {result !== null && (
        <div style={{
          fontSize: 18, fontFamily: THEME.fonts.display, letterSpacing: 4, marginTop: THEME.space.md,
          color: result ? THEME.colors.emerald : THEME.colors.ruby,
          textShadow: `0 0 20px ${result ? THEME.colors.emerald : THEME.colors.ruby}40`,
        }}>
          {result ? '✓ CLEAN GETAWAY' : '✗ BUSTED'}
        </div>
      )}

      <style>{`
        @keyframes roadScroll {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(25px); }
        }
        @keyframes spotlightPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
