// THE GIFT HEIST — District Activity Definitions

export interface DistrictActivity {
  id: string;
  name: string;
  emoji: string;
  type: 'gambling' | 'fence' | 'training' | 'intel' | 'shop' | 'recruitment';
  description: string;
  lore: string;
}

export const DISTRICT_ACTIVITIES: Record<string, DistrictActivity[]> = {
  // ═══ NEW CAVENDISH ═══
  docks: [
    { id: 'dock_dice', name: 'Dock Dice', emoji: '🎲', type: 'gambling', description: 'Bet cash on dice rolls with dockworkers.', lore: 'The dice are loaded. So are the players.' },
    { id: 'smuggler_fence', name: "Smuggler's Fence", emoji: '🏴‍☠️', type: 'fence', description: 'Trade jewels with harbor smugglers at fluctuating rates.', lore: 'The tide brings goods. And occasionally bodies.' },
    { id: 'dock_recruiter', name: 'Harbor Recruiter', emoji: '🤝', type: 'recruitment', description: 'Find cheap muscle among the longshoremen.', lore: 'Strong backs. Stronger silence.' },
  ],
  market_square: [
    { id: 'card_shark', name: 'Card Shark Table', emoji: '🃏', type: 'gambling', description: 'Three-card monte. Find the queen, double your money.', lore: 'The hand is quicker than the eye. Especially his.' },
    { id: 'market_intel', name: 'Information Broker', emoji: '🕵️', type: 'intel', description: 'Buy vault intel for upcoming heists.', lore: 'Information is currency. He accepts both.' },
    { id: 'market_shop', name: 'Back Alley Shop', emoji: '🛒', type: 'shop', description: 'Discounted gear that fell off a truck.', lore: 'No receipts. No returns. No questions.' },
  ],
  old_quarter: [
    { id: 'fight_club', name: 'Underground Fights', emoji: '🥊', type: 'gambling', description: 'Bet on bare-knuckle brawls. Big payouts, bigger risks.', lore: 'First rule: there are no rules.' },
    { id: 'old_q_training', name: 'The Dojo', emoji: '⚔️', type: 'training', description: 'Train crew members to improve their skills.', lore: 'Pain is the best teacher. The master is the second best.' },
    { id: 'antique_fence', name: 'Antique Dealer', emoji: '🏺', type: 'fence', description: 'Sell rare finds at premium prices.', lore: 'He can spot a forgery from across the room.' },
  ],
  financial_row: [
    { id: 'insider_trading', name: 'Insider Tips', emoji: '📈', type: 'intel', description: 'Get advance warning on vault security changes.', lore: 'Everyone on this street has a price.' },
    { id: 'high_stakes', name: 'High Stakes Room', emoji: '💰', type: 'gambling', description: 'Private poker. Minimum buy-in $500.', lore: 'The chips are worth more than some cars.' },
    { id: 'finance_recruitment', name: 'Executive Recruiter', emoji: '👔', type: 'recruitment', description: 'Hire specialists with financial connections.', lore: 'White collar. Black heart.' },
  ],
  // ═══ SHADOWPORT ═══
  harborfront: [
    { id: 'harbor_smuggling', name: 'Smuggling Run', emoji: '🚢', type: 'fence', description: 'Move goods through the harbor for big margins.', lore: 'The customs agents are... understanding.' },
    { id: 'harbor_intel', name: 'Harbor Master', emoji: '⚓', type: 'intel', description: 'Ship manifests reveal upcoming opportunities.', lore: 'He sees everything that comes through.' },
  ],
  neon_strip: [
    { id: 'neon_slots', name: 'Neon Slots', emoji: '🎰', type: 'gambling', description: 'Digital slot machines with crypto payouts.', lore: 'The lights never dim. Neither does the addiction.' },
    { id: 'neon_shop', name: 'Tech Black Market', emoji: '🖥️', type: 'shop', description: 'Cutting-edge hacking tools and surveillance gear.', lore: 'Everything here was illegal somewhere.' },
    { id: 'neon_training', name: 'Cyber Dojo', emoji: '💻', type: 'training', description: 'Upgrade crew hacking and tech skills.', lore: 'The students learn to see the code.' },
  ],
  the_undercity: [
    { id: 'undercity_fights', name: 'The Pit Fights', emoji: '💀', type: 'gambling', description: 'Underground death matches. Extreme bets.', lore: 'Not everyone walks out. That\'s the point.' },
    { id: 'undercity_fence', name: 'Shadow Broker', emoji: '🌑', type: 'fence', description: 'The best rates for the rarest goods.', lore: 'He deals in things money can\'t buy. Mostly.' },
  ],
  clocktower_district: [
    { id: 'clocktower_intel', name: 'The Watchtower', emoji: '🕰️', type: 'intel', description: 'Surveillance feeds from across the city.', lore: 'Every clock tower has eyes. These ones record.' },
    { id: 'clocktower_recruitment', name: 'Guild Hall', emoji: '🏛️', type: 'recruitment', description: 'Recruit elite specialists.', lore: 'The guild remembers. The guild rewards loyalty.' },
  ],
  // ═══ IRONHOLLOW ═══
  foundry_row: [
    { id: 'foundry_shop', name: 'The Forge', emoji: '🔥', type: 'shop', description: 'Custom weapons and reinforced gear.', lore: 'The steel screams as it\'s shaped. So do the customers.' },
    { id: 'foundry_training', name: 'Ironworks Training', emoji: '🏋️', type: 'training', description: 'Build crew strength and endurance.', lore: 'Forge the body. Forge the will.' },
  ],
  the_yards: [
    { id: 'yards_gambling', name: 'Rail Roulette', emoji: '🚂', type: 'gambling', description: 'Bet on freight car contents. High risk, high reward.', lore: 'What\'s in the boxcar? Your fortune or your funeral.' },
    { id: 'yards_fence', name: 'Scrapyard Dealer', emoji: '♻️', type: 'fence', description: 'Strip and sell stolen goods for parts.', lore: 'Nothing is worthless. Everything has a price per pound.' },
  ],
  smelter_heights: [
    { id: 'smelter_intel', name: 'Forge Intelligence', emoji: '🔍', type: 'intel', description: 'Industrial espionage reveals corporate vault weaknesses.', lore: 'The corporations think they\'re safe. They\'re not.' },
    { id: 'smelter_shop', name: 'Black Armory', emoji: '🛡️', type: 'shop', description: 'Military-grade equipment at premium prices.', lore: 'Surplus from wars that never officially happened.' },
  ],
  the_pit: [
    { id: 'pit_arena', name: 'The Arena', emoji: '⚔️', type: 'gambling', description: 'Gladiatorial combat betting. Winner takes all.', lore: 'Two enter. One profits. The rest watch.' },
    { id: 'pit_training', name: 'Survival School', emoji: '💪', type: 'training', description: 'The hardest training in the underworld.', lore: 'If you survive this, you survive anything.' },
  ],
  // ═══ VERENTHIA ═══
  crystal_promenade: [
    { id: 'crystal_auction', name: 'Crystal Auction', emoji: '💎', type: 'fence', description: 'Auction rare jewels to the elite.', lore: 'The bidding war is almost as violent as a real one.' },
    { id: 'crystal_shop', name: 'Luxury Boutique', emoji: '👑', type: 'shop', description: 'The finest equipment money can buy.', lore: 'If you have to ask the price, you can\'t afford it.' },
  ],
  the_spires: [
    { id: 'spires_intel', name: 'The Observatory', emoji: '🔭', type: 'intel', description: 'Satellite intel on all city operations.', lore: 'From up here, everyone looks like an ant. And ants can be stepped on.' },
    { id: 'spires_gambling', name: 'Sky Lounge Casino', emoji: '🌃', type: 'gambling', description: 'Ultra-high-stakes gambling with the elite.', lore: 'The view is worth the altitude. The bets are worth more.' },
  ],
  palace_grounds: [
    { id: 'palace_recruitment', name: 'Royal Court', emoji: '🏰', type: 'recruitment', description: 'Recruit disgraced nobles as informants.', lore: 'Fallen royalty make the best spies. They have nothing left to lose.' },
    { id: 'palace_training', name: 'Royal Guard Training', emoji: '🎖️', type: 'training', description: 'Train crew with military precision.', lore: 'They were trained to protect. Now they protect your interests.' },
  ],
  the_sanctum: [
    { id: 'sanctum_fence', name: 'The Inner Circle', emoji: '⛩️', type: 'fence', description: 'Deal directly with the most powerful fence in the world.', lore: 'Some say he\'s a myth. The ones who\'ve met him wish he was.' },
    { id: 'sanctum_intel', name: 'Oracle Network', emoji: '🔮', type: 'intel', description: 'Perfect intel on any vault in any city.', lore: 'The Oracle sees all. For a price.' },
  ],
};

// Gambling payouts by district tier
export const GAMBLING_CONFIG = {
  docks: { minBet: 50, maxBet: 500, winChance: 0.45, multiplier: 2 },
  market_square: { minBet: 50, maxBet: 500, winChance: 0.4, multiplier: 2.5 },
  old_quarter: { minBet: 100, maxBet: 1000, winChance: 0.35, multiplier: 3 },
  financial_row: { minBet: 500, maxBet: 5000, winChance: 0.4, multiplier: 2.5 },
  neon_strip: { minBet: 100, maxBet: 2000, winChance: 0.42, multiplier: 2.5 },
  the_undercity: { minBet: 200, maxBet: 3000, winChance: 0.3, multiplier: 3.5 },
  the_yards: { minBet: 150, maxBet: 2500, winChance: 0.35, multiplier: 3 },
  the_pit: { minBet: 500, maxBet: 5000, winChance: 0.3, multiplier: 4 },
  the_spires: { minBet: 1000, maxBet: 10000, winChance: 0.35, multiplier: 3 },
} as Record<string, { minBet: number; maxBet: number; winChance: number; multiplier: number }>;

// Training costs
export const TRAINING_COST = {
  level_up: 500, // base cost per crew level
  loyalty_boost: 200, // cost per 5 loyalty points
};

// Intel costs
export const INTEL_COST = {
  vault_info: 300,
  chaos_preview: 500,
  district_heat_reset: 800,
};

// Fence exchange rates vary by district
export const FENCE_RATES: Record<string, Record<string, number>> = {
  docks: { pearl: 80, sapphire: 250 },
  old_quarter: { pearl: 100, sapphire: 300, emerald: 600 },
  market_square: { pearl: 90, sapphire: 280 },
  the_undercity: { pearl: 120, sapphire: 350, emerald: 700, ruby: 1500 },
  crystal_promenade: { pearl: 150, sapphire: 400, emerald: 800, ruby: 2000, diamond: 5000 },
  the_sanctum: { pearl: 200, sapphire: 500, emerald: 1000, ruby: 2500, diamond: 8000 },
};
