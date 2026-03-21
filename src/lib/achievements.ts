// THE GIFT HEIST — Achievements System

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'heist' | 'crew' | 'wealth' | 'skill' | 'legendary';
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // HEIST
  { id: 'first_blood', name: 'First Blood', description: 'Complete your first heist.', emoji: '🩸', category: 'heist' },
  { id: 'ten_heists', name: 'Career Criminal', description: 'Complete 10 heists.', emoji: '📋', category: 'heist' },
  { id: 'fifty_heists', name: 'Professional', description: 'Complete 50 heists.', emoji: '🏅', category: 'heist' },
  { id: 'solo_wolf', name: 'Lone Wolf', description: 'Complete a heist solo with no crew.', emoji: '🐺', category: 'heist' },
  { id: 'flawless', name: 'Flawless Execution', description: 'Complete a heist with all mini-games passed.', emoji: '💯', category: 'heist' },
  { id: 'five_streak', name: 'Hot Streak', description: 'Complete 5 heists in a row without getting busted.', emoji: '🔥', category: 'heist' },
  { id: 'jail_bird', name: 'Jailbird', description: 'Get busted and sent to jail.', emoji: '🔒', category: 'heist' },
  { id: 'three_busts', name: 'Repeat Offender', description: 'Get busted 3 times.', emoji: '🚔', category: 'heist' },

  // CREW
  { id: 'full_crew', name: 'Full House', description: 'Fill all crew slots on a heist.', emoji: '🃏', category: 'crew' },
  { id: 'crew_5', name: 'Crew Boss', description: 'Unlock 5 crew members.', emoji: '👥', category: 'crew' },
  { id: 'max_loyalty', name: 'Ride or Die', description: 'Get a crew member to 100 loyalty.', emoji: '💕', category: 'crew' },
  { id: 'level_5_crew', name: 'Elite Operator', description: 'Level a crew member to level 5.', emoji: '⭐', category: 'crew' },

  // WEALTH
  { id: 'first_10k', name: 'Five Figures', description: 'Accumulate $10,000 cash.', emoji: '💵', category: 'wealth' },
  { id: 'first_100k', name: 'Six Figures', description: 'Accumulate $100,000 cash.', emoji: '💰', category: 'wealth' },
  { id: 'first_million', name: 'Millionaire', description: 'Accumulate $1,000,000 cash.', emoji: '🤑', category: 'wealth' },
  { id: 'jewel_collector', name: 'Gem Collector', description: 'Collect one of every jewel type.', emoji: '💎', category: 'wealth' },
  { id: 'held_loot', name: 'Patient Thief', description: 'Successfully hold loot with the fence.', emoji: '⏳', category: 'wealth' },

  // SKILL
  { id: 'lockpick_master', name: 'Lockpick Master', description: 'Pass the lockpick mini-game 10 times.', emoji: '🔑', category: 'skill' },
  { id: 'cold_reader', name: 'Silver Tongue', description: 'Pass the cold read mini-game 10 times.', emoji: '🎭', category: 'skill' },
  { id: 'shadow_master', name: 'Shadow Master', description: 'Pass the shadow walk mini-game 10 times.', emoji: '🕵️', category: 'skill' },
  { id: 'chaos_master', name: 'Chaos Master', description: 'Complete a heist during a chaos event with no mistakes.', emoji: '🌀', category: 'skill' },

  // LEGENDARY
  { id: 'tier5_clear', name: 'Untouchable', description: 'Complete a Tier 5 vault.', emoji: '👑', category: 'legendary' },
  { id: 'all_cities', name: 'World Tour', description: 'Unlock all four cities.', emoji: '🌍', category: 'legendary' },
  { id: 'ghost_run', name: 'Ghost Run', description: 'Complete a Tier 3+ vault solo with a flawless run.', emoji: '👻', category: 'legendary', hidden: true },
];

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  heist: { label: 'HEIST', color: '#E8B84B' },
  crew: { label: 'CREW', color: '#4A9FE8' },
  wealth: { label: 'WEALTH', color: '#3DCB7A' },
  skill: { label: 'SKILL', color: '#E84A6A' },
  legendary: { label: 'LEGENDARY', color: '#B8E8FF' },
};
