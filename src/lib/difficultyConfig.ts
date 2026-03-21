// THE GIFT HEIST — Difficulty & Economy Configuration
// Single source of truth for all mini-game tuning parameters

// ═══════════════════════════════════════════════════════════════
// Map vault difficulty (1–5) to tuning tier (1–3)
// ═══════════════════════════════════════════════════════════════
export function getDifficultyTier(difficulty: number): 1 | 2 | 3 {
  if (difficulty <= 2) return 1;
  if (difficulty <= 3) return 2;
  return 3;
}

// ═══════════════════════════════════════════════════════════════
// DIFFICULTY_CONFIG — all tunable parameters per game per tier
// ═══════════════════════════════════════════════════════════════
export const DIFFICULTY_CONFIG = {
  lockpick: {
    1: { pins: 3, sweetSpotWidth: 30, falseSweetSpots: 0, speed: 1.0 },
    2: { pins: 4, sweetSpotWidth: 22, falseSweetSpots: 0, speed: 1.3 },
    3: { pins: 5, sweetSpotWidth: 14, falseSweetSpots: 1, speed: 1.6 },
  },
  safeCombo: {
    1: { digits: 3, catchZoneWidth: 35, decoyZones: 0 },
    2: { digits: 4, catchZoneWidth: 25, decoyZones: 0 },
    3: { digits: 5, catchZoneWidth: 16, decoyZones: 1 },
  },
  shadowWalk: {
    1: { guards: 3, safeWindowPct: 0.35, patrolSpeed: 1.0 },
    2: { guards: 4, safeWindowPct: 0.28, patrolSpeed: 1.4 },
    3: { guards: 5, safeWindowPct: 0.20, patrolSpeed: 1.9 },
  },
  coldRead: {
    1: { questions: 3, suspicionFillAt: 4, removeNeutral: false },
    2: { questions: 3, suspicionFillAt: 3, removeNeutral: true },
    3: { questions: 4, suspicionFillAt: 2, removeNeutral: true },
  },
  wireTap: {
    1: { gridSize: 5, lockedTiles: 0, timer: 30 },
    2: { gridSize: 5, lockedTiles: 3, timer: 22 },
    3: { gridSize: 6, lockedTiles: 5, timer: 18 },
  },
  signalScramble: {
    1: { driftSpeed: 0.3, holdRequired: 3, speedUpAfter: null as number | null },
    2: { driftSpeed: 0.7, holdRequired: 3, speedUpAfter: 10 },
    3: { driftSpeed: 1.2, holdRequired: 4, speedUpAfter: 6 },
  },
  takedown: {
    1: { seqLength: 4, windowMs: 4000 },
    2: { seqLength: 5, windowMs: 3200 },
    3: { seqLength: 6, windowMs: 2500 },
  },
  hotPursuit: {
    1: { baseSpeed: 1.0, duration: 20000, obstacleLanes: 2, speedRampAfter: null as number | null, roadblockClusters: false },
    2: { baseSpeed: 1.5, duration: 20000, obstacleLanes: 3, speedRampAfter: 10, roadblockClusters: false },
    3: { baseSpeed: 2.0, duration: 20000, obstacleLanes: 3, speedRampAfter: 6, roadblockClusters: true },
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// HEAT PENALTY SCALING
// ═══════════════════════════════════════════════════════════════
export const HEAT_PENALTIES = {
  mistake: { 1: 5, 2: 10, 3: 18 } as Record<number, number>,
  failure: { 1: 15, 2: 25, 3: 40 } as Record<number, number>,
};

export function getMistakeHeat(tier: 1 | 2 | 3): number {
  return HEAT_PENALTIES.mistake[tier];
}

export function getFailureHeat(tier: 1 | 2 | 3): number {
  return HEAT_PENALTIES.failure[tier];
}

// ═══════════════════════════════════════════════════════════════
// PAYOUT MULTIPLIER SYSTEM
// ═══════════════════════════════════════════════════════════════
export interface PayoutBreakdown {
  base: number;
  tierBonus: number;
  perfectBonus: number;
  crewBonus: number;
  chaosBonus: number;
  total: number;
}

export function calculatePayout(
  tier: 1 | 2 | 3,
  success: boolean,
  perfect: boolean,
  crewBonusActive: boolean,
  chaosActive: boolean,
): PayoutBreakdown {
  if (!success) {
    return { base: 0, tierBonus: 0, perfectBonus: 0, crewBonus: 0, chaosBonus: 0, total: 0 };
  }

  const base = 1.0;
  const tierBonus = (tier - 1) * 0.2; // T1=0, T2=0.2, T3=0.4
  const perfectBonus = perfect ? 0.3 : 0;
  const crewBonus = crewBonusActive ? 0.15 : 0;
  const chaosBonus = chaosActive ? 0.25 : 0;
  const total = base + tierBonus + perfectBonus + crewBonus + chaosBonus;

  return { base, tierBonus, perfectBonus, crewBonus, chaosBonus, total };
}

export function formatPayoutBreakdown(b: PayoutBreakdown): string {
  if (b.total === 0) return '×0 PAYOUT';
  const parts = [`${b.base}`];
  if (b.tierBonus > 0) parts.push(`${b.tierBonus}`);
  if (b.perfectBonus > 0) parts.push(`${b.perfectBonus}`);
  if (b.crewBonus > 0) parts.push(`${b.crewBonus}`);
  if (b.chaosBonus > 0) parts.push(`${b.chaosBonus}`);
  return `${parts.join(' + ')} = ×${b.total.toFixed(1)} PAYOUT`;
}

// ═══════════════════════════════════════════════════════════════
// CREW BONUS SUPPRESSION
// Crew bonuses are suppressed when chaos is active
// ═══════════════════════════════════════════════════════════════
export function isCrewSuppressed(chaosActive: boolean): boolean {
  return chaosActive;
}

// ═══════════════════════════════════════════════════════════════
// PROGRESSIVE UNLOCK GATES
// ═══════════════════════════════════════════════════════════════
export type GameId = 'shadow' | 'coldread' | 'wiretap' | 'signal' | 'takedown' | 'pursuit' | 'lock' | 'combo';

export interface UnlockRequirement {
  description: string;
  check: (stats: UnlockStats) => boolean;
}

export interface UnlockStats {
  entryGameSuccesses: number;    // successful shadow/coldread runs
  wireTapSuccesses: number;
  signalSuccesses: number;
  fullVaultCompletions: number;  // completed all games in a vault run
}

export const UNLOCK_REQUIREMENTS: Partial<Record<GameId, UnlockRequirement>> = {
  // Shadow Walk and Cold Read: always available (entry games)
  // Lock and Combo: always available
  wiretap: {
    description: 'Complete 2 entry game runs to unlock',
    check: (s) => s.entryGameSuccesses >= 2,
  },
  signal: {
    description: 'Complete 2 entry game runs to unlock',
    check: (s) => s.entryGameSuccesses >= 2,
  },
  takedown: {
    description: 'Complete 1 Wire Tap or Signal Scramble to unlock',
    check: (s) => s.wireTapSuccesses >= 1 || s.signalSuccesses >= 1,
  },
  pursuit: {
    description: 'Complete 1 full vault run to unlock',
    check: (s) => s.fullVaultCompletions >= 1,
  },
};

// Derive unlock stats from heist history records
export function deriveUnlockStats(heistHistory: Array<{
  success: boolean | null;
  mini_game_results: boolean[] | null;
  vault_tier: number | null;
}>): UnlockStats {
  let entryGameSuccesses = 0;
  let wireTapSuccesses = 0;
  let signalSuccesses = 0;
  let fullVaultCompletions = 0;

  for (const h of heistHistory) {
    if (h.success) {
      // Every successful heist means entry games were passed
      entryGameSuccesses++;
      // Count as wiretap/signal success if vault tier >= 3 (those games appear at higher tiers)
      if ((h.vault_tier ?? 0) >= 3) wireTapSuccesses++;
      if ((h.vault_tier ?? 0) >= 4) signalSuccesses++;
      // Full vault completion = all mini-games passed
      if (h.mini_game_results && h.mini_game_results.every(r => r)) {
        fullVaultCompletions++;
      }
    }
  }

  return { entryGameSuccesses, wireTapSuccesses, signalSuccesses, fullVaultCompletions };
}

export function isGameUnlocked(gameId: GameId, stats: UnlockStats): boolean {
  const req = UNLOCK_REQUIREMENTS[gameId];
  if (!req) return true; // No requirement = always available
  return req.check(stats);
}
