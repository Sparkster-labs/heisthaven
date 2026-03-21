// THE GIFT HEIST — Static Game Data
// Single source of truth for all game logic

export const CITIES = {
  new_cavendish: {
    id: 'new_cavendish',
    name: 'New Cavendish',
    tagline: 'Where fortunes are made and stolen.',
    accentColor: '#E8B84B',
    districts: ['docks', 'market_square', 'old_quarter', 'financial_row'],
    unlockCost: 0,
    jewelCost: null,
    repRequired: 1,
  },
  shadowport: {
    id: 'shadowport',
    name: 'Shadowport',
    tagline: 'The city that never sleeps — or forgives.',
    accentColor: '#4A9FE8',
    districts: ['harborfront', 'neon_strip', 'the_undercity', 'clocktower_district'],
    unlockCost: 25000,
    jewelCost: { type: 'sapphire' as const, count: 2 },
    repRequired: 5,
  },
  ironhollow: {
    id: 'ironhollow',
    name: 'Ironhollow',
    tagline: 'Built on steel. Runs on blood.',
    accentColor: '#E84A6A',
    districts: ['foundry_row', 'the_yards', 'smelter_heights', 'the_pit'],
    unlockCost: 80000,
    jewelCost: { type: 'emerald' as const, count: 2, extra: { type: 'ruby' as const, count: 1 } },
    repRequired: 10,
  },
  verenthia: {
    id: 'verenthia',
    name: 'Verenthia',
    tagline: 'Where the elite keep their darkest secrets.',
    accentColor: '#B8E8FF',
    districts: ['crystal_promenade', 'the_spires', 'palace_grounds', 'the_sanctum'],
    unlockCost: 250000,
    jewelCost: { type: 'ruby' as const, count: 2, extra: { type: 'diamond' as const, count: 1 } },
    repRequired: 15,
  },
} as const;

export const CREW_MEMBERS = [
  {
    id: 'fingers',
    name: 'Fingers Malone',
    role: 'Lockpick',
    specialty: 'lock_sequences',
    emoji: '🔑',
    flavor: 'Fastest hands in New Cavendish. Never met a lock he couldn\'t sweet-talk.',
    baseCost: 0,
    unlocked: true,
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Hacker',
    specialty: 'wire_puzzles',
    emoji: '💻',
    flavor: 'Ghost in the machine. She sees the code behind the code.',
    baseCost: 0,
    unlocked: true,
  },
  {
    id: 'brick',
    name: 'Brick Wallace',
    role: 'Muscle',
    specialty: 'pressure_valves',
    emoji: '💪',
    flavor: 'Two hundred pounds of quiet persuasion.',
    baseCost: 0,
    unlocked: true,
  },
  {
    id: 'silk',
    name: 'Silk',
    role: 'Grifter',
    specialty: 'deception',
    emoji: '🎭',
    flavor: 'Could sell sand in a desert and make you thank her for it.',
    baseCost: 0,
    unlocked: true,
  },
  {
    id: 'ghost',
    name: 'The Ghost',
    role: 'Infiltrator',
    specialty: 'stealth',
    emoji: '👻',
    flavor: 'You won\'t see him coming. Neither will the guards.',
    baseCost: 0,
    unlocked: true,
  },
  {
    id: 'doc',
    name: 'Doc Voss',
    role: 'Medic',
    specialty: 'recovery',
    emoji: '💉',
    flavor: 'Patch you up or put you down. Either way, he\'s precise.',
    baseCost: 5000,
    unlocked: false,
  },
  {
    id: 'raven',
    name: 'Raven',
    role: 'Scout',
    specialty: 'intel',
    emoji: '🦅',
    flavor: 'Eyes everywhere. She knows the layout before you arrive.',
    baseCost: 8000,
    unlocked: false,
  },
  {
    id: 'king',
    name: 'The Kingpin',
    role: 'Mastermind',
    specialty: 'planning',
    emoji: '👑',
    flavor: 'Retired legend. His plans don\'t fail — they evolve.',
    baseCost: 25000,
    unlocked: false,
  },
  {
    id: 'static',
    name: 'Static',
    role: 'Comms',
    specialty: 'signals',
    emoji: '📡',
    flavor: 'Tunes into any frequency. If it broadcasts, she owns it.',
    baseCost: 12000,
    unlocked: false,
  },
  {
    id: 'nitro',
    name: 'Nitro',
    role: 'Wheelman',
    specialty: 'driving',
    emoji: '🏎️',
    flavor: 'Behind the wheel, he\'s untouchable. On foot, less so.',
    baseCost: 10000,
    unlocked: false,
  },
] as const;

export const VAULTS = [
  // ══════════ NEW CAVENDISH ══════════
  // Docks
  { id: 'pawnshop_safe', name: 'Pawnshop Safe', emoji: '🔓', tier: 1, city: 'new_cavendish', district: 'docks', buyIn: 50, payoutMin: 120, payoutMax: 210, difficulty: 1, crewSlots: 1, flavor: 'A greasy operation off the docks. Low security, lower expectations.' },
  { id: 'harbor_lockbox', name: 'Harbor Lockbox', emoji: '📦', tier: 1, city: 'new_cavendish', district: 'docks', buyIn: 75, payoutMin: 180, payoutMax: 320, difficulty: 1, crewSlots: 1, flavor: 'Shipping containers full of secrets. The harbor master looks the other way — for a price.' },
  { id: 'dockmaster_office', name: "Dockmaster's Office", emoji: '⚓', tier: 1, city: 'new_cavendish', district: 'docks', buyIn: 90, payoutMin: 200, payoutMax: 380, difficulty: 1, crewSlots: 1, flavor: 'The old man keeps a ledger and a lockbox. Tonight you only need one.' },
  // Market Square
  { id: 'market_register', name: 'Market Register', emoji: '🏪', tier: 1, city: 'new_cavendish', district: 'market_square', buyIn: 100, payoutMin: 250, payoutMax: 450, difficulty: 2, crewSlots: 2, flavor: 'The busiest stalls hide more than cheap goods. Time your entry right.' },
  { id: 'jewelers_case', name: "Jeweler's Case", emoji: '💍', tier: 2, city: 'new_cavendish', district: 'market_square', buyIn: 200, payoutMin: 500, payoutMax: 900, difficulty: 2, crewSlots: 2, flavor: 'Fine gems behind thin glass. The jeweler has a drinking problem. Tonight, that\'s your advantage.' },
  { id: 'spice_merchant', name: 'Spice Merchant Vault', emoji: '🫙', tier: 2, city: 'new_cavendish', district: 'market_square', buyIn: 175, payoutMin: 420, payoutMax: 800, difficulty: 2, crewSlots: 2, flavor: 'The rarest saffron is worth more than gold. He knows it. So do you.' },
  // Old Quarter
  { id: 'old_quarter_vault', name: 'Old Quarter Vault', emoji: '🏛️', tier: 3, city: 'new_cavendish', district: 'old_quarter', buyIn: 750, payoutMin: 1800, payoutMax: 3200, difficulty: 4, crewSlots: 3, flavor: 'Centuries-old stonework hides a modern vault. The combination changes with the tides.' },
  { id: 'antiquarian_cellar', name: 'Antiquarian Cellar', emoji: '📜', tier: 2, city: 'new_cavendish', district: 'old_quarter', buyIn: 350, payoutMin: 800, payoutMax: 1500, difficulty: 3, crewSlots: 2, flavor: 'Maps, manuscripts, and money — the antiquarian hoards them all beneath the floorboards.' },
  // Financial Row
  { id: 'bank_branch', name: 'First National Branch', emoji: '🏦', tier: 2, city: 'new_cavendish', district: 'financial_row', buyIn: 400, payoutMin: 900, payoutMax: 1600, difficulty: 3, crewSlots: 2, flavor: 'First National thinks their branch vault is impenetrable. They haven\'t met you yet.' },
  { id: 'exchange_floor', name: 'The Exchange Floor', emoji: '📈', tier: 3, city: 'new_cavendish', district: 'financial_row', buyIn: 600, payoutMin: 1400, payoutMax: 2600, difficulty: 3, crewSlots: 3, flavor: 'Bearer bonds sit in pneumatic tubes overnight. The night shift is one man and a crossword.' },

  // ══════════ SHADOWPORT ══════════
  // Harborfront
  { id: 'smugglers_den', name: "Smuggler's Den", emoji: '🚢', tier: 2, city: 'shadowport', district: 'harborfront', buyIn: 250, payoutMin: 600, payoutMax: 1200, difficulty: 2, crewSlots: 2, flavor: 'Behind the fish market, past the brine, a den of contraband waits uncounted.' },
  { id: 'customs_house', name: 'Customs House', emoji: '🛃', tier: 3, city: 'shadowport', district: 'harborfront', buyIn: 500, payoutMin: 1200, payoutMax: 2200, difficulty: 3, crewSlots: 2, flavor: 'Seized goods pile up. The customs officers take their cut. Tonight you take yours.' },
  // Neon Strip
  { id: 'neon_casino', name: 'Neon Casino Cage', emoji: '🎰', tier: 2, city: 'shadowport', district: 'neon_strip', buyIn: 300, payoutMin: 700, payoutMax: 1400, difficulty: 3, crewSlots: 2, flavor: 'Neon lights, loaded dice, and a cage full of cash. The house always wins — until tonight.' },
  { id: 'fortune_lounge', name: 'Fortune Lounge', emoji: '🃏', tier: 3, city: 'shadowport', district: 'neon_strip', buyIn: 550, payoutMin: 1300, payoutMax: 2500, difficulty: 3, crewSlots: 3, flavor: 'High-rollers leave their coats — and their wallets — at the door. The back room is the real prize.' },
  // The Undercity
  { id: 'undercity_stash', name: 'Undercity Stash', emoji: '🕳️', tier: 3, city: 'shadowport', district: 'the_undercity', buyIn: 600, payoutMin: 1500, payoutMax: 2800, difficulty: 4, crewSlots: 3, flavor: 'Deep beneath the streets, the real power brokers keep their reserves. No cameras. No witnesses.' },
  { id: 'tunnel_cache', name: 'Tunnel Cache', emoji: '🚇', tier: 3, city: 'shadowport', district: 'the_undercity', buyIn: 700, payoutMin: 1700, payoutMax: 3100, difficulty: 4, crewSlots: 3, flavor: 'An abandoned rail tunnel. The cache moves every week. This week, you know where.' },
  // Clocktower District
  { id: 'clocktower_archives', name: 'Clocktower Archives', emoji: '🕰️', tier: 2, city: 'shadowport', district: 'clocktower_district', buyIn: 350, payoutMin: 850, payoutMax: 1600, difficulty: 3, crewSlots: 2, flavor: 'The clock strikes twelve and the night watchman sleeps. The archives hold more than history.' },
  { id: 'bellringers_stash', name: "Bellringer's Stash", emoji: '🔔', tier: 3, city: 'shadowport', district: 'clocktower_district', buyIn: 650, payoutMin: 1600, payoutMax: 2900, difficulty: 4, crewSlots: 3, flavor: 'Two hundred steps up. One wrong move and the bells wake the whole district.' },

  // ══════════ IRONHOLLOW ══════════
  // Foundry Row
  { id: 'foundry_payroll', name: 'Foundry Payroll', emoji: '🔥', tier: 3, city: 'ironhollow', district: 'foundry_row', buyIn: 800, payoutMin: 2000, payoutMax: 4000, difficulty: 4, crewSlots: 3, flavor: 'Molten steel above, cold cash below. The workers get paid Friday. You get paid Thursday.' },
  { id: 'forgemasters_safe', name: "Forgemaster's Safe", emoji: '⚒️', tier: 3, city: 'ironhollow', district: 'foundry_row', buyIn: 900, payoutMin: 2200, payoutMax: 4200, difficulty: 4, crewSlots: 3, flavor: 'The forgemaster built his own safe. Iron walls, iron will. But every lock has a flaw.' },
  // The Yards
  { id: 'railyard_depot', name: 'Railyard Depot', emoji: '🚂', tier: 3, city: 'ironhollow', district: 'the_yards', buyIn: 850, payoutMin: 2100, payoutMax: 3800, difficulty: 4, crewSlots: 3, flavor: 'Coal trains carry more than fuel. The midnight express has a special cargo car.' },
  { id: 'scrapyard_bunker', name: 'Scrapyard Bunker', emoji: '♻️', tier: 4, city: 'ironhollow', district: 'the_yards', buyIn: 1200, payoutMin: 3200, payoutMax: 6000, difficulty: 4, crewSlots: 3, flavor: 'Beneath mountains of twisted metal, someone built a fortress. The scrapyard king doesn\'t share.' },
  // Smelter Heights
  { id: 'smelter_office', name: 'Smelter Heights Office', emoji: '🏭', tier: 4, city: 'ironhollow', district: 'smelter_heights', buyIn: 1300, payoutMin: 3500, payoutMax: 6500, difficulty: 5, crewSlots: 3, flavor: 'The air burns your lungs. The office sits above the smelter floor, unreachable by cowards.' },
  { id: 'refinery_vault', name: 'Refinery Vault', emoji: '⚗️', tier: 4, city: 'ironhollow', district: 'smelter_heights', buyIn: 1400, payoutMin: 3800, payoutMax: 7200, difficulty: 5, crewSlots: 3, flavor: 'Precious metals flow through here daily. The vault catches the overflow. Tonight it overflows for you.' },
  // The Pit
  { id: 'pit_vault', name: 'The Pit Vault', emoji: '⛏️', tier: 4, city: 'ironhollow', district: 'the_pit', buyIn: 1500, payoutMin: 4000, payoutMax: 8000, difficulty: 5, crewSlots: 3, flavor: 'The deepest vault in Ironhollow. They say it\'s never been cracked. They say a lot of things.' },
  { id: 'pit_bosses_den', name: "Pit Boss's Den", emoji: '💀', tier: 5, city: 'ironhollow', district: 'the_pit', buyIn: 2500, payoutMin: 6000, payoutMax: 12000, difficulty: 5, crewSlots: 3, flavor: 'The Pit Boss runs Ironhollow from a chair made of rail ties. His den has no door — just a reputation.' },

  // ══════════ VERENTHIA ══════════
  // Crystal Promenade
  { id: 'crystal_gallery', name: 'Crystal Gallery', emoji: '🖼️', tier: 4, city: 'verenthia', district: 'crystal_promenade', buyIn: 2000, payoutMin: 6000, payoutMax: 12000, difficulty: 5, crewSlots: 3, flavor: 'Art worth millions, guarded by lasers and ego. One wrong step and the floor drops.' },
  { id: 'diamond_boutique', name: 'Diamond Boutique', emoji: '💎', tier: 4, city: 'verenthia', district: 'crystal_promenade', buyIn: 2200, payoutMin: 6500, payoutMax: 13000, difficulty: 5, crewSlots: 3, flavor: 'Invitation only. The boutique opens at midnight for clients who pay in silence.' },
  // The Spires
  { id: 'observatory_vault', name: 'Observatory Vault', emoji: '🔭', tier: 4, city: 'verenthia', district: 'the_spires', buyIn: 2500, payoutMin: 7000, payoutMax: 14000, difficulty: 5, crewSlots: 3, flavor: 'The astronomers watch the stars. Nobody watches the astronomers. Or what they keep in the basement.' },
  { id: 'penthouse_safe', name: 'Penthouse Safe', emoji: '🌃', tier: 5, city: 'verenthia', district: 'the_spires', buyIn: 4000, payoutMin: 12000, payoutMax: 24000, difficulty: 5, crewSlots: 3, flavor: 'Eighty floors up. Glass walls. One elevator. The safe is behind a Monet. The Monet is also worth stealing.' },
  // Palace Grounds
  { id: 'royal_treasury', name: 'Royal Treasury', emoji: '👑', tier: 5, city: 'verenthia', district: 'palace_grounds', buyIn: 4500, payoutMin: 13000, payoutMax: 26000, difficulty: 5, crewSlots: 3, flavor: 'The old palace is now a museum. The treasury was never moved. Guards patrol in pairs.' },
  { id: 'ambassadors_suite', name: "Ambassador's Suite", emoji: '🏰', tier: 4, city: 'verenthia', district: 'palace_grounds', buyIn: 3000, payoutMin: 8000, payoutMax: 16000, difficulty: 5, crewSlots: 3, flavor: 'Diplomatic immunity covers a multitude of sins. The ambassador collects more than art.' },
  // The Sanctum
  { id: 'the_sanctum_vault', name: 'The Sanctum', emoji: '🕯️', tier: 5, city: 'verenthia', district: 'the_sanctum', buyIn: 5000, payoutMin: 15000, payoutMax: 30000, difficulty: 5, crewSlots: 3, flavor: 'The final vault. Legend says it holds enough to buy a city. Only ghosts get in.' },
  { id: 'inner_reliquary', name: 'Inner Reliquary', emoji: '⚱️', tier: 5, city: 'verenthia', district: 'the_sanctum', buyIn: 6000, payoutMin: 18000, payoutMax: 35000, difficulty: 5, crewSlots: 3, flavor: 'Beyond the Sanctum lies the Reliquary. What\'s kept here has no price — only consequences.' },
] as const;

export const CHAOS_CARDS = [
  { id: 'silent_alarm', name: 'Silent Alarm', effect: 'heat_increase', description: 'The alarm was tripped. District heat rises by 15.', modifier: { heat: 15 } },
  { id: 'lucky_break', name: 'Lucky Break', effect: 'payout_bonus', description: 'You found a hidden compartment. Payout increased by 30%.', modifier: { payoutMultiplier: 1.3 } },
  { id: 'crew_injury', name: 'Crew Injury', effect: 'loyalty_loss', description: 'A crew member took a hit. Loyalty drops by 10.', modifier: { loyaltyLoss: 10 } },
  { id: 'double_or_nothing', name: 'Double or Nothing', effect: 'gamble', description: 'The fence offers a deal. Risk it all for double payout.', modifier: { payoutMultiplier: 2, failChance: 0.5 } },
  { id: 'inside_job', name: 'Inside Job', effect: 'skip_minigame', description: 'A guard looks the other way. Skip one mini-game.', modifier: { skipMinigame: true } },
  { id: 'police_raid', name: 'Police Raid', effect: 'abort_risk', description: 'Cops are closing in. 25% chance the heist is aborted.', modifier: { abortChance: 0.25 } },
  { id: 'gem_cache', name: 'Gem Cache', effect: 'bonus_jewel', description: 'A hidden gem cache! Bonus jewel drop guaranteed.', modifier: { bonusJewel: true } },
  { id: 'betrayal', name: 'Betrayal', effect: 'crew_betrayal', description: 'Someone tipped off the guards. Lowest loyalty crew member leaves.', modifier: { betrayal: true } },
  { id: 'smooth_operation', name: 'Smooth Operation', effect: 'loyalty_boost', description: 'Flawless execution. All crew gain +5 loyalty.', modifier: { loyaltyBoost: 5 } },
  { id: 'fog_cover', name: 'Fog Cover', effect: 'heat_reduction', description: 'Dense fog rolls in. District heat reduced by 10.', modifier: { heat: -10 } },
] as const;

// Rep level thresholds
export const REP_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Street Rat' },
  { level: 2, xpRequired: 100, title: 'Petty Thief' },
  { level: 3, xpRequired: 300, title: 'Cat Burglar' },
  { level: 4, xpRequired: 600, title: 'Safecracker' },
  { level: 5, xpRequired: 1000, title: 'Heist Artist' },
  { level: 6, xpRequired: 1500, title: 'Vault Breaker' },
  { level: 7, xpRequired: 2200, title: 'Shadow Broker' },
  { level: 8, xpRequired: 3000, title: 'Crime Lord' },
  { level: 9, xpRequired: 4000, title: 'Phantom' },
  { level: 10, xpRequired: 5500, title: 'Ghost King' },
  { level: 11, xpRequired: 7500, title: 'Untouchable' },
  { level: 12, xpRequired: 10000, title: 'Legend' },
] as const;

// Safehouse room definitions
export const SAFEHOUSE_ROOMS = [
  { id: 'war_room', name: 'The War Room', emoji: '🎯', cost: 0, jewel: null, description: 'Plan your heists and manage your crew.' },
  { id: 'vault', name: 'The Vault', emoji: '🏦', cost: 1000, jewel: null, description: 'Store jewels and track your fortune.' },
  { id: 'garage', name: 'The Garage', emoji: '🚗', cost: 2500, jewel: null, description: 'Getaway vehicles for faster escapes.' },
  { id: 'dressing_room', name: 'The Dressing Room', emoji: '🪞', cost: 3500, jewel: null, description: 'Customize your avatar and wardrobe.' },
  { id: 'study', name: 'The Study', emoji: '📚', cost: 5000, jewel: null, description: 'Research targets for better intel.' },
  { id: 'infirmary', name: 'The Infirmary', emoji: '💉', cost: 8000, jewel: null, description: 'Heal injured crew faster.' },
  { id: 'signal_room', name: 'The Signal Room', emoji: '📡', cost: 15000, jewel: null, description: 'Intercept communications for tips.' },
  { id: 'parlor', name: 'The Parlor', emoji: '🎭', cost: 30000, jewel: { type: 'emerald', count: 1 }, description: 'Recruit high-tier crew members.' },
  { id: 'penthouse', name: 'The Penthouse', emoji: '🏙️', cost: 80000, jewel: { type: 'ruby', count: 1 }, description: 'The crown jewel. Ultimate prestige.' },
] as const;
