// THE GIFT HEIST — Heist Resolution Engine
// Pure functions for resolving heist outcomes

import { VAULTS, CHAOS_CARDS, CREW_MEMBERS, REP_THRESHOLDS } from './gameData';

type Vault = typeof VAULTS[number];
type ChaosCard = typeof CHAOS_CARDS[number];

interface HeistInput {
  vault: Vault;
  crewIds: string[];
  chaosCard: ChaosCard;
  miniGameResults: boolean[];
  safehouseRooms?: Record<string, number>;
}

interface JewelDrops {
  pearl: number;
  sapphire: number;
  emerald: number;
  ruby: number;
  diamond: number;
}

export interface HeistOutcome {
  busted: boolean;
  payout: number;
  jewelsFound: Partial<JewelDrops>;
  finalFailChance: number;
  xpGained: number;
  heatChange: number;
  newLevel: number | null;
  newTitle: string | null;
}

// Jewel drop rates by vault tier (as decimals 0–1)
const JEWEL_DROP_RATES: Record<number, Record<string, number>> = {
  1: { pearl: 0.40, sapphire: 0.10, emerald: 0.00, ruby: 0.00, diamond: 0.00 },
  2: { pearl: 0.30, sapphire: 0.25, emerald: 0.05, ruby: 0.00, diamond: 0.00 },
  3: { pearl: 0.20, sapphire: 0.20, emerald: 0.20, ruby: 0.05, diamond: 0.00 },
  4: { pearl: 0.10, sapphire: 0.15, emerald: 0.20, ruby: 0.15, diamond: 0.05 },
  5: { pearl: 0.05, sapphire: 0.10, emerald: 0.15, ruby: 0.20, diamond: 0.15 },
};

// Base fail chance by difficulty
const BASE_FAIL_BY_DIFFICULTY: Record<number, number> = {
  1: 0.25,
  2: 0.32,
  3: 0.40,
  4: 0.50,
  5: 0.60,
};

// Crew fail reduction per member hired (generic)
const CREW_FAIL_REDUCTION = 0.04;

// Crew-specific ability modifiers applied during heist resolution
const CREW_ABILITIES: Record<string, {
  failReduction?: number;
  payoutBonus?: number;
  heatReduction?: number;
  xpBonus?: number;
  jewelBonus?: number;
  miniGameForgive?: number;
}> = {
  fingers: { failReduction: 0.08 },           // Lockpick: reliable under pressure
  echo:    { failReduction: 0.05, heatReduction: 3 }, // Hacker: covers digital tracks
  brick:   { failReduction: 0.06, miniGameForgive: 1 }, // Muscle: brute-force backup
  silk:    { failReduction: 0.04, payoutBonus: 0.15 }, // Grifter: negotiates better fence deals
  ghost:   { failReduction: 0.12 },           // Infiltrator: massive stealth advantage
  doc:     { miniGameForgive: 1, xpBonus: 15 }, // Medic: keeps crew operational + experience
  raven:   { failReduction: 0.07, heatReduction: 5 }, // Scout: intel reduces risk & exposure
  king:    { payoutBonus: 0.25, xpBonus: 25 },  // Mastermind: plans = profit + learning
  static:  { failReduction: 0.05, heatReduction: 8 }, // Comms: jams frequencies, reduces heat
  nitro:   { failReduction: 0.06, payoutBonus: 0.10 }, // Wheelman: fast getaway saves loot
};

export function resolveHeist(input: HeistInput): HeistOutcome {
  const { vault, crewIds, chaosCard, miniGameResults, safehouseRooms } = input;

  // --- FAIL CHANCE CALCULATION ---
  let failChance = BASE_FAIL_BY_DIFFICULTY[vault.difficulty] ?? 0.35;

  // Generic crew reduction
  failChance -= crewIds.length * CREW_FAIL_REDUCTION;

  // Crew-specific fail reductions
  let totalPayoutBonus = 0;
  let totalHeatReduction = 0;
  let totalXpBonus = 0;
  let totalMiniGameForgives = 0;

  crewIds.forEach(id => {
    const ability = CREW_ABILITIES[id];
    if (!ability) return;
    if (ability.failReduction) failChance -= ability.failReduction;
    if (ability.payoutBonus) totalPayoutBonus += ability.payoutBonus;
    if (ability.heatReduction) totalHeatReduction += ability.heatReduction;
    if (ability.xpBonus) totalXpBonus += ability.xpBonus;
    if (ability.miniGameForgive) totalMiniGameForgives += ability.miniGameForgive;
  });

  // Chaos card modifier
  if (chaosCard.effect === 'heat_increase') failChance += 0.05;
  if (chaosCard.effect === 'payout_bonus') failChance -= 0.03;
  if (chaosCard.effect === 'loyalty_loss') failChance += 0.08;
  if (chaosCard.effect === 'abort_risk') {
    if (Math.random() < 0.25) {
      // Heist aborted — instant fail, no payout
      return {
        busted: true, payout: 0, jewelsFound: {},
        finalFailChance: 1, xpGained: Math.round(vault.tier * 5),
        heatChange: 5, newLevel: null, newTitle: null,
      };
    }
  }
  if (chaosCard.effect === 'crew_betrayal') failChance += 0.15;
  if (chaosCard.effect === 'loyalty_boost') failChance -= 0.05;
  if (chaosCard.effect === 'heat_reduction') failChance -= 0.04;
  if (chaosCard.effect === 'gamble') {
    failChance += Math.random() < 0.5 ? -0.28 : 0.35;
  }

  // Mini-game modifiers: each success -9%, each fail +13%
  const failCount = miniGameResults.filter(r => !r).length;
  const successCount = miniGameResults.filter(Boolean).length;

  // Apply mini-game forgives from crew (Muscle/Medic)
  const effectiveFailCount = Math.max(0, failCount - totalMiniGameForgives);
  
  miniGameResults.forEach(r => {
    if (r) {
      failChance -= 0.09;
    }
  });
  // Only count effective fails (after forgiveness)
  failChance += effectiveFailCount * 0.13;

  // Infirmary bonus: if safehouse infirmary tier >= 1, one additional fail forgiven
  if (safehouseRooms && (safehouseRooms['infirmary'] ?? 0) >= 1) {
    if (effectiveFailCount > 0) {
      failChance -= 0.13; // undo one fail penalty
      if ((safehouseRooms['infirmary'] ?? 0) >= 2 && effectiveFailCount > 1) {
        failChance -= 0.13; // undo second fail
      }
    }
  }

  // Clamp
  failChance = Math.max(0.03, Math.min(0.97, failChance));

  // If no mini-games were passed, the heist automatically fails
  const busted = successCount === 0 ? true : Math.random() < failChance;

  // --- PAYOUT ---
  let payout = 0;
  const jewelsFound: Partial<JewelDrops> = {};

  if (!busted) {
    payout = Math.floor(
      vault.payoutMin + Math.random() * (vault.payoutMax - vault.payoutMin)
    );

    // Chaos card payout modifiers
    if (chaosCard.effect === 'payout_bonus') {
      payout = Math.floor(payout * 1.3);
    }
    if (chaosCard.effect === 'gamble') {
      payout = Math.random() < 0.5 ? payout * 2 : 0;
    }

    // --- JEWEL DROPS ---
    const rates = JEWEL_DROP_RATES[vault.tier] ?? JEWEL_DROP_RATES[1];
    Object.entries(rates).forEach(([jewel, rate]) => {
      let effectiveRate = rate;
      if (chaosCard.effect === 'bonus_jewel') effectiveRate += 0.25;
      if (Math.random() < effectiveRate) {
        (jewelsFound as Record<string, number>)[jewel] =
          ((jewelsFound as Record<string, number>)[jewel] || 0) + 1;
      }
    });

    // Gem cache chaos card: guaranteed extra jewel
    if (chaosCard.id === 'gem_cache') {
      const weighted = ['pearl', 'pearl', 'pearl', 'sapphire', 'sapphire', 'emerald'];
      const pick = weighted[Math.floor(Math.random() * weighted.length)];
      (jewelsFound as Record<string, number>)[pick] =
        ((jewelsFound as Record<string, number>)[pick] || 0) + 1;
    }
  }

  // --- XP ---
  let xpGained: number;
  if (!busted) {
    xpGained = 50 + successCount * 25;
  } else {
    xpGained = Math.round(vault.tier * 5);
  }

  // --- HEAT ---
  let heatChange = busted ? 2 : 1;
  if (chaosCard.effect === 'heat_increase') heatChange += 15;
  if (chaosCard.effect === 'heat_reduction') heatChange -= 10;

  return {
    busted,
    payout,
    jewelsFound,
    finalFailChance: failChance,
    xpGained,
    heatChange,
    newLevel: null,
    newTitle: null,
  };
}

// Calculate new rep level/title from XP
export function calculateRepLevel(currentXp: number, xpGained: number) {
  const newXp = currentXp + xpGained;
  let newLevel = 1;
  let newTitle = 'Street Rat';
  for (const t of REP_THRESHOLDS) {
    if (newXp >= t.xpRequired) {
      newLevel = t.level;
      newTitle = t.title;
    }
  }
  return { newXp, newLevel, newTitle };
}

// Calculate fence hold bonus
export function calculateFenceOffer(payout: number, vaultTier: number) {
  const holdMultiplier = 1.4;
  const holdPayout = Math.floor(payout * holdMultiplier);
  const baseRaidChance = 0.15;
  const holdHours = 4;
  return { holdPayout, holdHours, raidChance: baseRaidChance };
}
