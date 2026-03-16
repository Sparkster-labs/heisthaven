// THE GIFT HEIST — Empire Assets Data
// Businesses, Real Estate, Vehicles, Gear, Luxuries

export interface EmpireAsset {
  id: string;
  name: string;
  emoji: string;
  category: 'business' | 'real_estate' | 'vehicle' | 'gear' | 'luxury';
  description: string;
  lore: string;
  cost: number;
  jewelCost?: { type: string; count: number };
  maxLevel: number;
  upgradeCostMultiplier: number;
  // For businesses: income per hour
  incomePerHour?: number;
  // For vehicles/gear: heist bonuses
  heistBonus?: string;
  bonusValue?: number;
  // City requirement
  requiredCity?: string;
  repRequired: number;
}

export const EMPIRE_ASSETS: EmpireAsset[] = [
  // ═══ BUSINESSES ═══
  {
    id: 'pawn_shop', name: 'Pawn Shop', emoji: '🏪', category: 'business',
    description: 'A front for moving stolen goods. Generates steady income.',
    lore: 'The bell above the door hasn\'t rung honestly in years.',
    cost: 2000, maxLevel: 5, upgradeCostMultiplier: 2,
    incomePerHour: 25, repRequired: 2,
  },
  {
    id: 'dive_bar', name: 'The Blind Tiger', emoji: '🍺', category: 'business',
    description: 'A speakeasy that draws the underworld crowd.',
    lore: 'The password changes nightly. The whiskey doesn\'t.',
    cost: 5000, maxLevel: 5, upgradeCostMultiplier: 2,
    incomePerHour: 50, repRequired: 3,
  },
  {
    id: 'laundromat', name: 'Clean Slate Laundry', emoji: '🧺', category: 'business',
    description: 'Money laundering disguised as... actual laundry.',
    lore: 'Spin cycle takes exactly as long as a wire transfer.',
    cost: 8000, maxLevel: 5, upgradeCostMultiplier: 2,
    incomePerHour: 80, repRequired: 4,
  },
  {
    id: 'casino_front', name: 'Lucky Sevens Casino', emoji: '🎰', category: 'business',
    description: 'The house always wins. Especially when you own it.',
    lore: 'The odds are rigged, but nobody complains twice.',
    cost: 25000, maxLevel: 5, upgradeCostMultiplier: 2.5,
    incomePerHour: 200, repRequired: 6, requiredCity: 'shadowport',
    jewelCost: { type: 'sapphire', count: 1 },
  },
  {
    id: 'nightclub', name: 'Club Obsidian', emoji: '🪩', category: 'business',
    description: 'VIP rooms where deals are sealed with champagne.',
    lore: 'The bass drops. So do the bodies, occasionally.',
    cost: 50000, maxLevel: 5, upgradeCostMultiplier: 3,
    incomePerHour: 400, repRequired: 8, requiredCity: 'ironhollow',
    jewelCost: { type: 'emerald', count: 1 },
  },
  {
    id: 'import_export', name: 'Meridian Imports', emoji: '📦', category: 'business',
    description: 'An import/export firm with creative customs declarations.',
    lore: 'What\'s in the containers? Best you don\'t ask.',
    cost: 100000, maxLevel: 5, upgradeCostMultiplier: 3,
    incomePerHour: 800, repRequired: 12, requiredCity: 'verenthia',
    jewelCost: { type: 'ruby', count: 1 },
  },

  // ═══ REAL ESTATE ═══
  {
    id: 'apartment', name: 'Downtown Flat', emoji: '🏢', category: 'real_estate',
    description: 'A clean apartment above a butcher shop. Nobody asks questions.',
    lore: 'The landlord takes cash and keeps his mouth shut.',
    cost: 3000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: '+5% payout bonus', bonusValue: 5, repRequired: 2,
  },
  {
    id: 'warehouse', name: 'Harbor Warehouse', emoji: '🏭', category: 'real_estate',
    description: 'Extra storage for gear and getaway vehicles.',
    lore: 'The rats know better than to touch what\'s stored here.',
    cost: 10000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: '+1 crew slot capacity', bonusValue: 1, repRequired: 4,
  },
  {
    id: 'loft', name: 'Penthouse Loft', emoji: '🏙️', category: 'real_estate',
    description: 'Glass walls overlooking the city. The ultimate trophy.',
    lore: 'The elevator requires a fingerprint. The view requires ambition.',
    cost: 40000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: '+10% rep XP gain', bonusValue: 10, repRequired: 7,
    jewelCost: { type: 'sapphire', count: 1 },
  },
  {
    id: 'island_villa', name: 'Private Island Villa', emoji: '🏝️', category: 'real_estate',
    description: 'An offshore retreat for when heat gets too high.',
    lore: 'No extradition. No questions. No neighbors.',
    cost: 150000, maxLevel: 3, upgradeCostMultiplier: 4,
    heistBonus: 'Heat decays 2x faster', bonusValue: 2, repRequired: 12,
    jewelCost: { type: 'ruby', count: 2 },
  },

  // ═══ VEHICLES ═══
  {
    id: 'sedan', name: 'Unmarked Sedan', emoji: '🚗', category: 'vehicle',
    description: 'Blends into traffic. The perfect getaway car.',
    lore: 'License plates change with the seasons.',
    cost: 1500, maxLevel: 3, upgradeCostMultiplier: 2.5,
    heistBonus: '+3s on timed mini-games', bonusValue: 3, repRequired: 1,
  },
  {
    id: 'motorcycle', name: 'Shadow Bike', emoji: '🏍️', category: 'vehicle',
    description: 'Fast, nimble, untraceable.',
    lore: 'It purrs like a cat and vanishes like a ghost.',
    cost: 5000, maxLevel: 3, upgradeCostMultiplier: 2.5,
    heistBonus: '+5% escape success', bonusValue: 5, repRequired: 3,
  },
  {
    id: 'sports_car', name: 'Phantom GT', emoji: '🏎️', category: 'vehicle',
    description: 'When you need to outrun everything.',
    lore: 'Zero to sixty in three seconds. Zero to gone in two.',
    cost: 20000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: '+10% payout on successful escape', bonusValue: 10, repRequired: 6,
    jewelCost: { type: 'sapphire', count: 1 },
  },
  {
    id: 'armored_van', name: 'The Fortress', emoji: '🚐', category: 'vehicle',
    description: 'Armored transport. Nothing gets in or out.',
    lore: 'Bulletproof glass and a minibar. Priorities.',
    cost: 35000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: 'Held loot raid chance -50%', bonusValue: 50, repRequired: 8,
    jewelCost: { type: 'emerald', count: 1 },
  },

  // ═══ GEAR ═══
  {
    id: 'lockpick_set_pro', name: 'Pro Lockpick Set', emoji: '🔧', category: 'gear',
    description: 'Titanium picks that never break.',
    lore: 'Hand-forged by a blind locksmith in Shadowport.',
    cost: 3000, maxLevel: 3, upgradeCostMultiplier: 2,
    heistBonus: 'Lockpick sweet spot +20% wider', bonusValue: 20, repRequired: 3,
  },
  {
    id: 'hacking_rig', name: 'Neural Interface', emoji: '💻', category: 'gear',
    description: 'Military-grade hacking equipment.',
    lore: 'Echo built it from stolen government parts.',
    cost: 8000, maxLevel: 3, upgradeCostMultiplier: 2.5,
    heistBonus: 'Wire puzzle auto-solves 1 wire', bonusValue: 1, repRequired: 5,
    jewelCost: { type: 'sapphire', count: 1 },
  },
  {
    id: 'thermal_goggles', name: 'Thermal Goggles', emoji: '🥽', category: 'gear',
    description: 'See through walls. See through lies.',
    lore: 'The guards never know you\'re watching.',
    cost: 12000, maxLevel: 3, upgradeCostMultiplier: 2.5,
    heistBonus: 'Guard patrol patterns revealed', bonusValue: 1, repRequired: 6,
  },
  {
    id: 'grapple_gun', name: 'Grapple Launcher', emoji: '🪝', category: 'gear',
    description: 'Access alternate entry points on heists.',
    lore: 'Vertical approach. Horizontal disappearance.',
    cost: 18000, maxLevel: 3, upgradeCostMultiplier: 3,
    heistBonus: 'Skip one mini-game per heist', bonusValue: 1, repRequired: 8,
    jewelCost: { type: 'emerald', count: 1 },
  },

  // ═══ LUXURIES ═══
  {
    id: 'gold_chain', name: 'Gold Cuban Link', emoji: '⛓️', category: 'luxury',
    description: 'Heavy gold chain. Pure flex.',
    lore: 'It catches the light and the attention.',
    cost: 2000, maxLevel: 1, upgradeCostMultiplier: 1,
    heistBonus: '+2% crew loyalty gain', bonusValue: 2, repRequired: 2,
  },
  {
    id: 'diamond_ring', name: 'Diamond Pinky Ring', emoji: '💍', category: 'luxury',
    description: 'Three carats of pure intimidation.',
    lore: 'The fence tried to lowball you. Once.',
    cost: 8000, maxLevel: 1, upgradeCostMultiplier: 1,
    heistBonus: 'Fence offers +5% higher', bonusValue: 5, repRequired: 5,
    jewelCost: { type: 'sapphire', count: 1 },
  },
  {
    id: 'yacht_membership', name: 'Yacht Club Pass', emoji: '⛵', category: 'luxury',
    description: 'Access to the most exclusive criminal networking events.',
    lore: 'The champagne flows. The secrets flow faster.',
    cost: 30000, maxLevel: 1, upgradeCostMultiplier: 1,
    heistBonus: '+15% rep XP from heists', bonusValue: 15, repRequired: 8,
    jewelCost: { type: 'emerald', count: 1 },
  },
  {
    id: 'art_collection', name: 'Stolen Art Collection', emoji: '🖼️', category: 'luxury',
    description: 'A private gallery of "acquired" masterpieces.',
    lore: 'Every painting has a story. Most end with sirens.',
    cost: 75000, maxLevel: 1, upgradeCostMultiplier: 1,
    heistBonus: 'Prestige title: Art Collector', bonusValue: 0, repRequired: 10,
    jewelCost: { type: 'ruby', count: 1 },
  },
  {
    id: 'vintage_car', name: 'Vintage Rolls-Royce', emoji: '🚙', category: 'luxury',
    description: 'A classic beauty that turns heads everywhere.',
    lore: 'The previous owner disappeared. The car didn\'t.',
    cost: 120000, maxLevel: 1, upgradeCostMultiplier: 1,
    heistBonus: 'All business income +20%', bonusValue: 20, repRequired: 12,
    jewelCost: { type: 'diamond', count: 1 },
  },
];

export const EMPIRE_CATEGORIES = [
  { key: 'business', label: 'Businesses', emoji: '🏪', description: 'Generate passive income' },
  { key: 'real_estate', label: 'Real Estate', emoji: '🏢', description: 'Prestige & bonuses' },
  { key: 'vehicle', label: 'Vehicles', emoji: '🚗', description: 'Heist advantages' },
  { key: 'gear', label: 'Gear', emoji: '🔧', description: 'Tactical upgrades' },
  { key: 'luxury', label: 'Luxuries', emoji: '💎', description: 'Status symbols' },
] as const;

export const getUpgradeCost = (asset: EmpireAsset, currentLevel: number): number => {
  return Math.round(asset.cost * Math.pow(asset.upgradeCostMultiplier, currentLevel));
};

export const getIncomeAtLevel = (asset: EmpireAsset, level: number): number => {
  if (!asset.incomePerHour) return 0;
  return Math.round(asset.incomePerHour * (1 + (level - 1) * 0.5));
};
