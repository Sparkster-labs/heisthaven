// ─── AVATAR DATA — Single source of truth for all avatar customization ───

export const SKIN_TONES = [
  { id: 1, hex: '#F5D5B8', label: 'Fair' },
  { id: 2, hex: '#E8B88A', label: 'Light' },
  { id: 3, hex: '#C68642', label: 'Medium' },
  { id: 4, hex: '#8D5524', label: 'Tan' },
  { id: 5, hex: '#4A2912', label: 'Deep' },
];

export const EYE_COLORS = [
  { id: 'brown',        hex: '#6B3F1E' },
  { id: 'hazel',        hex: '#8B7355' },
  { id: 'green',        hex: '#3D7A4A' },
  { id: 'blue',         hex: '#4A7FB5' },
  { id: 'grey',         hex: '#7A8A8E' },
  { id: 'amber',        hex: '#C47B2B' },
  { id: 'silver',       hex: '#A8B4B8' },
  { id: 'violet',       hex: '#7B5EA7' },
  { id: 'black',        hex: '#1A1A1A' },
  { id: 'heterochromia',hex: '#6B3F1E' },
];

export const HAIR_COLORS = [
  { id: 'black',        hex: '#1a1a1a', label: 'Black' },
  { id: 'dark_brown',   hex: '#3B2314', label: 'Dark Brown' },
  { id: 'med_brown',    hex: '#6B4226', label: 'Medium Brown' },
  { id: 'light_brown',  hex: '#9B6A3A', label: 'Light Brown' },
  { id: 'dirty_blonde', hex: '#B8974E', label: 'Dirty Blonde' },
  { id: 'blonde',       hex: '#D4B86A', label: 'Blonde' },
  { id: 'strawberry',   hex: '#C07850', label: 'Strawberry Blonde' },
  { id: 'auburn',       hex: '#8B2E0A', label: 'Auburn' },
  { id: 'red',          hex: '#C0180A', label: 'Red' },
  { id: 'grey',         hex: '#8A8A8A', label: 'Grey' },
  { id: 'white',        hex: '#E8E8E8', label: 'White' },
  { id: 'platinum',     hex: '#E8E0D0', label: 'Platinum' },
  { id: 'silver_blue',  hex: '#8AB0C8', label: 'Silver Blue' },
  { id: 'cobalt',       hex: '#1A3A8B', label: 'Cobalt' },
  { id: 'forest',       hex: '#1A5A2A', label: 'Forest Green' },
  { id: 'emerald_h',    hex: '#00A86B', label: 'Emerald' },
  { id: 'rose_gold',    hex: '#C8786A', label: 'Rose Gold' },
  { id: 'burgundy',     hex: '#6A1020', label: 'Burgundy' },
  { id: 'lavender',     hex: '#9A7AB8', label: 'Lavender' },
  { id: 'charcoal_h',   hex: '#3A3A4A', label: 'Charcoal' },
];

export const HAIR_STYLES: Record<string, { id: string; label: string }[]> = {
  male: [
    { id: 'slicked_back',   label: 'Slicked Back' },
    { id: 'side_part',      label: 'Side Part' },
    { id: 'pompadour',      label: 'Pompadour' },
    { id: 'undercut',       label: 'Undercut' },
    { id: 'crew_cut',       label: 'Crew Cut' },
    { id: 'buzzcut',        label: 'Buzzcut' },
    { id: 'fedora_short',   label: 'Fedora Ready' },
    { id: 'wavy_long',      label: 'Wavy Long' },
    { id: 'shaggy',         label: 'Shaggy' },
    { id: 'mohawk',         label: 'Mohawk' },
    { id: 'bald',           label: 'Bald' },
    { id: 'bald_stubble',   label: 'Bald + Stubble' },
  ],
  female: [
    { id: 'bob',            label: 'Bob Cut' },
    { id: 'long_straight',  label: 'Long Straight' },
    { id: 'curly_short',    label: 'Curly Short' },
    { id: 'curly_long',     label: 'Curly Long' },
    { id: 'pin_curls',      label: 'Pin Curls' },
    { id: 'victory_rolls',  label: 'Victory Rolls' },
    { id: 'high_pony',      label: 'High Ponytail' },
    { id: 'low_chignon',    label: 'Low Chignon' },
    { id: 'braided_updo',   label: 'Braided Updo' },
    { id: 'side_swept',     label: 'Side Swept' },
    { id: 'pixie',          label: 'Pixie Cut' },
    { id: 'long_waves',     label: 'Long Waves' },
    { id: 'space_buns',     label: 'Space Buns' },
    { id: 'shaved_side',    label: 'Shaved Side' },
  ],
  neutral: [
    { id: 'locs_short',     label: 'Short Locs' },
    { id: 'locs_long',      label: 'Long Locs' },
    { id: 'afro_small',     label: 'Afro (Small)' },
    { id: 'afro_large',     label: 'Afro (Large)' },
    { id: 'cornrows',       label: 'Cornrows' },
    { id: 'natural_coils',  label: 'Natural Coils' },
  ],
};

export const FACIAL_HAIR = [
  { id: 'none',         label: 'None' },
  { id: 'stubble',      label: 'Stubble' },
  { id: 'short_beard',  label: 'Short Beard' },
  { id: 'full_beard',   label: 'Full Beard' },
  { id: 'goatee',       label: 'Goatee' },
  { id: 'handlebar',    label: 'Handlebar Mustache' },
  { id: 'pencil',       label: 'Pencil Mustache' },
  { id: 'five_oclock',  label: "Five O'Clock Shadow" },
];

export const FACE_PRESETS = [
  { id: 1,  gender: 'male',    label: 'Angular',     jaw: 'square',    nose: 'straight',  brow: 'heavy' },
  { id: 2,  gender: 'male',    label: 'Rugged',      jaw: 'wide',      nose: 'crooked',   brow: 'thick' },
  { id: 3,  gender: 'male',    label: 'Sharp',       jaw: 'narrow',    nose: 'sharp',     brow: 'arched' },
  { id: 4,  gender: 'male',    label: 'Broad',       jaw: 'square',    nose: 'flat',      brow: 'flat' },
  { id: 5,  gender: 'male',    label: 'Gaunt',       jaw: 'pointed',   nose: 'long',      brow: 'furrowed' },
  { id: 6,  gender: 'female',  label: 'Classic',     jaw: 'oval',      nose: 'button',    brow: 'arched' },
  { id: 7,  gender: 'female',  label: 'Bold',        jaw: 'strong',    nose: 'straight',  brow: 'bold' },
  { id: 8,  gender: 'female',  label: 'Delicate',    jaw: 'soft',      nose: 'small',     brow: 'fine' },
  { id: 9,  gender: 'female',  label: 'Striking',    jaw: 'angular',   nose: 'defined',   brow: 'dramatic' },
  { id: 10, gender: 'female',  label: 'Mysterious',  jaw: 'heart',     nose: 'upturned',  brow: 'low' },
  { id: 11, gender: 'neutral', label: 'Geometric',   jaw: 'wide',      nose: 'defined',   brow: 'straight' },
  { id: 12, gender: 'neutral', label: 'Soft Edge',   jaw: 'rounded',   nose: 'soft',      brow: 'natural' },
  { id: 13, gender: 'neutral', label: 'Chiseled',    jaw: 'square',    nose: 'roman',     brow: 'strong' },
  { id: 14, gender: 'neutral', label: 'Round',       jaw: 'round',     nose: 'wide',      brow: 'curved' },
  { id: 15, gender: 'neutral', label: 'Narrow',      jaw: 'narrow',    nose: 'pointed',   brow: 'thin' },
];

// ─── CLOTHING ITEMS ───────────────────────────────────────────────────

export interface ClothingItem {
  id: string;
  cat: string;
  tier: number;
  label: string;
  cashCost: number;
  jewel: string | null;
  jewelCost: number;
  color: string;
  gender: string;
}

export const CLOTHING_ITEMS: ClothingItem[] = [
  // ── TIER 1 — STREET LEVEL (cash only) ────────────────────────────
  // HATS
  { id: 'fedora_black',    cat: 'hat',       tier: 1, label: 'Classic Fedora (Black)',    cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'flat_cap',        cat: 'hat',       tier: 1, label: 'Flat Cap',                  cashCost: 250,   jewel: null,       jewelCost: 0,  color: '#3a3028', gender: 'all' },
  { id: 'newsboy_cap',     cat: 'hat',       tier: 1, label: 'Newsboy Cap',               cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#4a3a28', gender: 'all' },
  { id: 'cloche_hat',      cat: 'hat',       tier: 1, label: 'Cloche Hat',                cashCost: 350,   jewel: null,       jewelCost: 0,  color: '#2a2020', gender: 'female' },
  { id: 'fedora_brown',    cat: 'hat',       tier: 1, label: 'Fedora (Brown)',             cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#5a3a20', gender: 'all' },
  { id: 'beanie',          cat: 'hat',       tier: 1, label: 'Beanie',                    cashCost: 200,   jewel: null,       jewelCost: 0,  color: '#2a2a2a', gender: 'all' },
  { id: 'beret',           cat: 'hat',       tier: 1, label: 'Beret (Black)',              cashCost: 280,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  // MASKS
  { id: 'bandana',         cat: 'mask',      tier: 1, label: 'Cloth Bandana',             cashCost: 200,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'half_scarf',      cat: 'mask',      tier: 1, label: 'Half-Face Scarf',           cashCost: 250,   jewel: null,       jewelCost: 0,  color: '#2a2a2a', gender: 'all' },
  { id: 'domino_mask',     cat: 'mask',      tier: 1, label: 'Domino Mask',               cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'balaclava',       cat: 'mask',      tier: 1, label: 'Balaclava',                 cashCost: 350,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  // EYEWEAR
  { id: 'wire_glasses',    cat: 'eyewear',   tier: 1, label: 'Round Wire Glasses',        cashCost: 280,   jewel: null,       jewelCost: 0,  color: '#8a7040', gender: 'all' },
  { id: 'cat_eye',         cat: 'eyewear',   tier: 1, label: 'Cat-Eye Frames',            cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'aviator_shades',  cat: 'eyewear',   tier: 1, label: 'Aviator Shades',            cashCost: 350,   jewel: null,       jewelCost: 0,  color: '#4a3a10', gender: 'all' },
  { id: 'monocle',         cat: 'eyewear',   tier: 1, label: 'Monocle',                   cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#C49A3C', gender: 'all' },
  // TOPS
  { id: 'white_shirt',     cat: 'top',       tier: 1, label: 'White Dress Shirt',         cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#e8e0d0', gender: 'all' },
  { id: 'black_turtle',    cat: 'top',       tier: 1, label: 'Black Turtleneck',          cashCost: 350,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'stripe_vest',     cat: 'top',       tier: 1, label: 'Striped Vest',              cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#3a3a3a', gender: 'all' },
  { id: 'linen_blouse',    cat: 'top',       tier: 1, label: 'Linen Blouse',              cashCost: 320,   jewel: null,       jewelCost: 0,  color: '#d4c4a0', gender: 'female' },
  { id: 'suspenders',      cat: 'top',       tier: 1, label: 'Suspenders',                cashCost: 280,   jewel: null,       jewelCost: 0,  color: '#2a2a2a', gender: 'all' },
  { id: 'tactical_tank',   cat: 'top',       tier: 1, label: 'Tactical Tank',             cashCost: 250,   jewel: null,       jewelCost: 0,  color: '#2a3020', gender: 'all' },
  // COATS
  { id: 'leather_brown',   cat: 'coat',      tier: 1, label: 'Leather Jacket (Brown)',    cashCost: 800,   jewel: null,       jewelCost: 0,  color: '#5a3a20', gender: 'all' },
  { id: 'leather_black',   cat: 'coat',      tier: 1, label: 'Leather Jacket (Black)',    cashCost: 800,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'wool_overcoat',   cat: 'coat',      tier: 1, label: 'Wool Overcoat',             cashCost: 900,   jewel: null,       jewelCost: 0,  color: '#3a3028', gender: 'all' },
  { id: 'trench_tan',      cat: 'coat',      tier: 1, label: 'Trenchcoat (Tan)',          cashCost: 1000,  jewel: null,       jewelCost: 0,  color: '#8a7048', gender: 'all' },
  { id: 'peacoat',         cat: 'coat',      tier: 1, label: 'Peacoat',                   cashCost: 850,   jewel: null,       jewelCost: 0,  color: '#1a1a2a', gender: 'all' },
  // BOTTOMS
  { id: 'hw_trousers',     cat: 'bottoms',   tier: 1, label: 'High-Waist Trousers',       cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#2a2a2a', gender: 'all' },
  { id: 'wide_slacks',     cat: 'bottoms',   tier: 1, label: 'Wide-Leg Slacks',           cashCost: 450,   jewel: null,       jewelCost: 0,  color: '#3a3028', gender: 'all' },
  { id: 'pencil_skirt',    cat: 'bottoms',   tier: 1, label: 'Pencil Skirt',              cashCost: 380,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'female' },
  { id: 'aline_skirt',     cat: 'bottoms',   tier: 1, label: 'A-Line Skirt',              cashCost: 380,   jewel: null,       jewelCost: 0,  color: '#3a2828', gender: 'female' },
  { id: 'cargo_pants',     cat: 'bottoms',   tier: 1, label: 'Cargo Pants',               cashCost: 420,   jewel: null,       jewelCost: 0,  color: '#3a4030', gender: 'all' },
  { id: 'pinstripe_t1',    cat: 'bottoms',   tier: 1, label: 'Pinstripe Trousers',        cashCost: 500,   jewel: null,       jewelCost: 0,  color: '#2a2a3a', gender: 'all' },
  // SHOES
  { id: 'oxfords',         cat: 'shoes',     tier: 1, label: 'Oxford Shoes',              cashCost: 450,   jewel: null,       jewelCost: 0,  color: '#3a2010', gender: 'all' },
  { id: 'tstrap_heels',    cat: 'shoes',     tier: 1, label: 'T-Strap Heels',             cashCost: 480,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'female' },
  { id: 'combat_boots',    cat: 'shoes',     tier: 1, label: 'Combat Boots',              cashCost: 500,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'chelsea_boots',   cat: 'shoes',     tier: 1, label: 'Chelsea Boots',             cashCost: 520,   jewel: null,       jewelCost: 0,  color: '#2a1a10', gender: 'all' },
  { id: 'loafers',         cat: 'shoes',     tier: 1, label: 'Loafers',                   cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#4a3020', gender: 'all' },
  { id: 'mary_janes',      cat: 'shoes',     tier: 1, label: 'Mary Janes',                cashCost: 420,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'female' },
  // GLOVES
  { id: 'leather_gloves',  cat: 'gloves',    tier: 1, label: 'Leather Gloves',            cashCost: 350,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'lace_gloves',     cat: 'gloves',    tier: 1, label: 'Lace Gloves',               cashCost: 320,   jewel: null,       jewelCost: 0,  color: '#e0d8c8', gender: 'female' },
  { id: 'fingerless',      cat: 'gloves',    tier: 1, label: 'Fingerless Gloves',         cashCost: 280,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'driving_gloves',  cat: 'gloves',    tier: 1, label: 'Driving Gloves',            cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#3a2010', gender: 'all' },
  // ACCESSORIES
  { id: 'silk_tie',        cat: 'accessory', tier: 1, label: 'Silk Tie',                  cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#6a1a1a', gender: 'all' },
  { id: 'bow_tie',         cat: 'accessory', tier: 1, label: 'Bow Tie',                   cashCost: 280,   jewel: null,       jewelCost: 0,  color: '#1a1a1a', gender: 'all' },
  { id: 'neck_scarf',      cat: 'accessory', tier: 1, label: 'Neck Scarf',                cashCost: 300,   jewel: null,       jewelCost: 0,  color: '#6a4a1a', gender: 'all' },
  { id: 'gold_watch',      cat: 'accessory', tier: 1, label: 'Gold Watch',                cashCost: 600,   jewel: null,       jewelCost: 0,  color: '#C49A3C', gender: 'all' },
  { id: 'pocket_watch',    cat: 'accessory', tier: 1, label: 'Silver Pocket Watch',       cashCost: 650,   jewel: null,       jewelCost: 0,  color: '#a0a0a8', gender: 'all' },
  { id: 'cigarette_ear',   cat: 'accessory', tier: 1, label: 'Cigarette (Behind Ear)',    cashCost: 150,   jewel: null,       jewelCost: 0,  color: '#e8e0d0', gender: 'all' },
  { id: 'shoulder_holster',cat: 'accessory', tier: 1, label: 'Shoulder Holster',          cashCost: 400,   jewel: null,       jewelCost: 0,  color: '#3a2810', gender: 'all' },
  // WEAPONS
  { id: 'revolver',        cat: 'weapon',    tier: 1, label: 'Holstered Revolver',        cashCost: 800,   jewel: null,       jewelCost: 0,  color: '#2a2a2a', gender: 'all' },
  { id: 'hip_knife',       cat: 'weapon',    tier: 1, label: 'Hip Knife',                 cashCost: 600,   jewel: null,       jewelCost: 0,  color: '#4a4040', gender: 'all' },
  { id: 'brass_knuckles',  cat: 'weapon',    tier: 1, label: 'Brass Knuckles',            cashCost: 500,   jewel: null,       jewelCost: 0,  color: '#C49A3C', gender: 'all' },

  // ── TIER 2 — SYNDICATE GRADE (cash + sapphire or emerald) ────────
  { id: 'velvet_fedora',   cat: 'hat',       tier: 2, label: 'Velvet Fedora (Purple)',    cashCost: 2000,  jewel: 'sapphire', jewelCost: 1,  color: '#3a1a5a', gender: 'all' },
  { id: 'widebrim_boss',   cat: 'hat',       tier: 2, label: 'Wide-Brim Boss Hat',        cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'gold_trilby',     cat: 'hat',       tier: 2, label: 'Gold-Pinned Trilby',        cashCost: 2200,  jewel: 'sapphire', jewelCost: 1,  color: '#2a2010', gender: 'all' },
  { id: 'silk_turban',     cat: 'hat',       tier: 2, label: 'Silk Turban',               cashCost: 2000,  jewel: 'sapphire', jewelCost: 1,  color: '#1a3a5a', gender: 'all' },
  { id: 'porcelain_mask',  cat: 'mask',      tier: 2, label: 'Porcelain Half-Mask',       cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#e8e0d8', gender: 'all' },
  { id: 'venetian_mask',   cat: 'mask',      tier: 2, label: 'Venetian Carnival Mask',    cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'gas_mask',        cat: 'mask',      tier: 2, label: 'Gas Mask (Stylized)',       cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#2a3020', gender: 'all' },
  { id: 'plague_mask',     cat: 'mask',      tier: 2, label: 'Golden Plague Doctor Mask', cashCost: 3500,  jewel: 'emerald',  jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'gold_frames',     cat: 'eyewear',   tier: 2, label: 'Gold Wire Frames',          cashCost: 2000,  jewel: 'sapphire', jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'mirror_goggles',  cat: 'eyewear',   tier: 2, label: 'Mirrored Goggles',          cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#4a4a5a', gender: 'all' },
  { id: 'diamond_shades',  cat: 'eyewear',   tier: 2, label: 'Diamond-Stud Sunglasses',   cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'smoking_jacket',  cat: 'top',       tier: 2, label: 'Silk Smoking Jacket',       cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a3a', gender: 'all' },
  { id: 'stripe_waistcoat',cat: 'top',       tier: 2, label: 'Pinstripe Waistcoat',       cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#2a2a3a', gender: 'all' },
  { id: 'mandarin_collar', cat: 'top',       tier: 2, label: 'Mandarin Collar Shirt',     cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#1a2a1a', gender: 'all' },
  { id: 'corseted_blouse', cat: 'top',       tier: 2, label: 'Corseted Noir Blouse',      cashCost: 2600,  jewel: 'sapphire', jewelCost: 1,  color: '#1a1a1a', gender: 'female' },
  { id: 'floor_trench',    cat: 'coat',      tier: 2, label: 'Floor-Length Trenchcoat',   cashCost: 4000,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'fur_collar_coat', cat: 'coat',      tier: 2, label: 'Fur-Collared Overcoat',     cashCost: 4500,  jewel: 'emerald',  jewelCost: 1,  color: '#2a1a10', gender: 'all' },
  { id: 'gangster_coat',   cat: 'coat',      tier: 2, label: 'Double-Breasted Gangster',  cashCost: 3800,  jewel: 'sapphire', jewelCost: 1,  color: '#2a2a1a', gender: 'all' },
  { id: 'opera_cape',      cat: 'coat',      tier: 2, label: 'Embroidered Opera Cape',    cashCost: 4200,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a2a', gender: 'all' },
  { id: 'pinstripe_suit_b',cat: 'bottoms',   tier: 2, label: 'Pinstripe Suit Trousers',   cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#2a2a3a', gender: 'all' },
  { id: 'slit_skirt',      cat: 'bottoms',   tier: 2, label: 'High Slit Evening Skirt',   cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#1a1a1a', gender: 'female' },
  { id: 'silk_pleated',    cat: 'bottoms',   tier: 2, label: 'Silk Pleated Wide-Legs',    cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#1a2a2a', gender: 'all' },
  { id: 'riding_jodphurs', cat: 'bottoms',   tier: 2, label: 'Riding Jodhpurs',           cashCost: 2600,  jewel: 'sapphire', jewelCost: 1,  color: '#3a3020', gender: 'all' },
  { id: 'two_tone_shoes',  cat: 'shoes',     tier: 2, label: 'Two-Tone Spectators',       cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#e0d8c8', gender: 'all' },
  { id: 'thigh_boots',     cat: 'shoes',     tier: 2, label: 'Thigh-High Boots',          cashCost: 3500,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a1a', gender: 'female' },
  { id: 'patent_heels',    cat: 'shoes',     tier: 2, label: 'Patent Leather Heels',      cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#1a1a1a', gender: 'female' },
  { id: 'steel_toe_eng',   cat: 'shoes',     tier: 2, label: 'Steel-Toe Boots (Engraved)',cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#2a2a2a', gender: 'all' },
  { id: 'satin_gloves',    cat: 'gloves',    tier: 2, label: 'Elbow-Length Satin Gloves', cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#1a1a1a', gender: 'female' },
  { id: 'armored_gloves',  cat: 'gloves',    tier: 2, label: 'Armored Knuckle Gloves',    cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#2a2a2a', gender: 'all' },
  { id: 'fur_cuff_gloves', cat: 'gloves',    tier: 2, label: 'Fur-Cuffed Leather Gloves', cashCost: 2800,  jewel: 'sapphire', jewelCost: 1,  color: '#3a2010', gender: 'all' },
  { id: 'diamond_tie_pin', cat: 'accessory', tier: 2, label: 'Diamond Tie Pin',           cashCost: 3000,  jewel: 'emerald',  jewelCost: 1,  color: '#B8E8FF', gender: 'all' },
  { id: 'pearl_necklace',  cat: 'accessory', tier: 2, label: 'Pearl Necklace',            cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#F0EDE8', gender: 'all' },
  { id: 'gold_chain',      cat: 'accessory', tier: 2, label: 'Gold Chain (Heavy)',        cashCost: 3500,  jewel: 'emerald',  jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'signet_ring',     cat: 'accessory', tier: 2, label: 'Signet Ring',               cashCost: 2000,  jewel: 'sapphire', jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'lit_cigar',       cat: 'accessory', tier: 2, label: 'Lit Cigar',                 cashCost: 1500,  jewel: 'sapphire', jewelCost: 1,  color: '#8a6040', gender: 'all' },
  { id: 'briefcase',       cat: 'accessory', tier: 2, label: 'Briefcase',                 cashCost: 2500,  jewel: 'sapphire', jewelCost: 1,  color: '#3a2810', gender: 'all' },
  { id: 'umbrella_cane',   cat: 'accessory', tier: 2, label: 'Umbrella / Cane',           cashCost: 2200,  jewel: 'sapphire', jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'engraved_pistol', cat: 'weapon',    tier: 2, label: 'Engraved Pistol',           cashCost: 4000,  jewel: 'emerald',  jewelCost: 1,  color: '#2a2010', gender: 'all' },
  { id: 'twin_daggers',    cat: 'weapon',    tier: 2, label: 'Twin Daggers (Crossed)',     cashCost: 3500,  jewel: 'emerald',  jewelCost: 1,  color: '#3a3a3a', gender: 'all' },
  { id: 'sawnoff',         cat: 'weapon',    tier: 2, label: 'Sawn-Off Shotgun',          cashCost: 4500,  jewel: 'emerald',  jewelCost: 1,  color: '#2a2018', gender: 'all' },
  { id: 'tommy_gun',       cat: 'weapon',    tier: 2, label: 'Tommy Gun (Over Shoulder)', cashCost: 5000,  jewel: 'emerald',  jewelCost: 1,  color: '#2a2020', gender: 'all' },

  // ── TIER 3 — BOSS WEAR (cash + ruby or diamond) ───────────────────
  { id: 'crown_thorns',    cat: 'hat',       tier: 3, label: 'Crown of Thorns',           cashCost: 8000,  jewel: 'ruby',     jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'spiked_mil_cap',  cat: 'hat',       tier: 3, label: 'Spiked Military Cap',       cashCost: 10000, jewel: 'ruby',     jewelCost: 1,  color: '#2a2a2a', gender: 'all' },
  { id: 'diamond_tophat',  cat: 'hat',       tier: 3, label: 'Diamond-Band Top Hat',      cashCost: 15000, jewel: 'diamond',  jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'skull_mask_gold', cat: 'mask',      tier: 3, label: 'Skull Mask (Gold Filigree)',cashCost: 12000, jewel: 'ruby',     jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'iron_face',       cat: 'mask',      tier: 3, label: 'Iron Face (Riveted)',       cashCost: 15000, jewel: 'ruby',     jewelCost: 1,  color: '#4a4a4a', gender: 'all' },
  { id: 'white_face',      cat: 'mask',      tier: 3, label: 'The White Face',            cashCost: 20000, jewel: 'diamond',  jewelCost: 1,  color: '#F0EDE8', gender: 'all' },
  { id: 'black_cape',      cat: 'coat',      tier: 3, label: 'The Black Cape',            cashCost: 18000, jewel: 'ruby',     jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'general_coat',    cat: 'coat',      tier: 3, label: "General's Coat (Medals)",   cashCost: 20000, jewel: 'ruby',     jewelCost: 1,  color: '#1a2a1a', gender: 'all' },
  { id: 'syndicate_long',  cat: 'coat',      tier: 3, label: 'Syndicate Longcoat',        cashCost: 25000, jewel: 'diamond',  jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'executioner_suit',cat: 'fullOutfit', tier: 3, label: 'The Executioner',          cashCost: 30000, jewel: 'ruby',     jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'aristocrat_suit', cat: 'fullOutfit', tier: 3, label: 'The Aristocrat',           cashCost: 35000, jewel: 'diamond',  jewelCost: 1,  color: '#e8e0d0', gender: 'all' },
  { id: 'shadow_layers',   cat: 'fullOutfit', tier: 3, label: 'The Shadow',               cashCost: 40000, jewel: 'diamond',  jewelCost: 1,  color: '#1a1a1a', gender: 'all' },
  { id: 'gold_revolver',   cat: 'weapon',    tier: 3, label: 'Gold-Plated Revolver',      cashCost: 20000, jewel: 'ruby',     jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'jeweled_cane',    cat: 'weapon',    tier: 3, label: 'Jeweled Sword Cane',        cashCost: 25000, jewel: 'ruby',     jewelCost: 1,  color: '#C49A3C', gender: 'all' },
  { id: 'last_word',       cat: 'weapon',    tier: 3, label: 'The Last Word (Sniper)',    cashCost: 35000, jewel: 'diamond',  jewelCost: 1,  color: '#2a2020', gender: 'all' },
];

// ─── LEGENDARY ITEMS (boss drops only, never purchasable) ─────────────

export interface LegendaryItem {
  id: string;
  cat: string;
  setId: string;
  city: string;
  boss: string;
  bossLabel: string;
  vault: string;
  label: string;
  color: string;
  goldAccent: boolean;
}

export const LEGENDARY_ITEMS: LegendaryItem[] = [
  // NEW CAVENDISH — "THE VANE COLLECTION"
  { id: 'vane_fedora',    cat: 'hat',       setId: 'vane', city: 'new_cavendish', boss: 'aldous_vane',      bossLabel: 'Aldous Vane',          vault: 'City Bank',       label: 'The Vane Fedora',      color: '#3a3028', goldAccent: true },
  { id: 'vane_ring',      cat: 'accessory', setId: 'vane', city: 'new_cavendish', boss: 'aldous_vane',      bossLabel: 'Aldous Vane',          vault: 'City Bank',       label: 'The Vane Signet Ring', color: '#C49A3C', goldAccent: true },
  { id: 'vane_trench',    cat: 'coat',      setId: 'vane', city: 'new_cavendish', boss: 'commissioner_doyle',bossLabel: 'Commissioner Doyle',  vault: 'Reserve Vault',   label: 'The Vane Trenchcoat',  color: '#4a4840', goldAccent: true },
  { id: 'vane_oxfords',   cat: 'shoes',     setId: 'vane', city: 'new_cavendish', boss: 'commissioner_doyle',bossLabel: 'Commissioner Doyle',  vault: 'Reserve Vault',   label: 'The Vane Oxfords',     color: '#2a1a10', goldAccent: true },
  { id: 'vane_waistcoat', cat: 'top',       setId: 'vane', city: 'new_cavendish', boss: 'madame_sinclair',  bossLabel: 'Madame Sinclair',      vault: 'Private Bank',    label: 'The Vane Waistcoat',   color: '#2a2a3a', goldAccent: true },
  { id: 'vane_watch',     cat: 'accessory', setId: 'vane', city: 'new_cavendish', boss: 'madame_sinclair',  bossLabel: 'Madame Sinclair',      vault: 'Private Bank',    label: 'The Vane Pocket Watch',color: '#C49A3C', goldAccent: true },

  // SHADOWPORT — "THE FOG COLLECTION"
  { id: 'fog_longcoat',   cat: 'coat',      setId: 'fog',  city: 'shadowport',    boss: 'harbormaster_kane', bossLabel: 'Harbormaster Kane',   vault: 'Harbormaster Vault', label: 'The Fog Longcoat',  color: '#1a3028', goldAccent: false },
  { id: 'fog_boots',      cat: 'shoes',     setId: 'fog',  city: 'shadowport',    boss: 'harbormaster_kane', bossLabel: 'Harbormaster Kane',   vault: 'Harbormaster Vault', label: 'The Fog Boots',     color: '#1a1a1a', goldAccent: false },
  { id: 'fog_mask',       cat: 'mask',      setId: 'fog',  city: 'shadowport',    boss: 'queen_reva',        bossLabel: 'Syndicate Queen Reva',vault: 'Syndicate Treasury', label: 'The Fog Mask',      color: '#6a4a28', goldAccent: false },
  { id: 'fog_gloves',     cat: 'gloves',    setId: 'fog',  city: 'shadowport',    boss: 'queen_reva',        bossLabel: 'Syndicate Queen Reva',vault: 'Syndicate Treasury', label: 'The Fog Gloves',    color: '#2a2a1a', goldAccent: false },
  { id: 'fog_hat',        cat: 'hat',       setId: 'fog',  city: 'shadowport',    boss: 'the_merchant',      bossLabel: 'The Merchant',        vault: 'The Ghost Ship',  label: 'The Fog Hat',       color: '#2a2820', goldAccent: false },
  { id: 'fog_compass',    cat: 'accessory', setId: 'fog',  city: 'shadowport',    boss: 'the_merchant',      bossLabel: 'The Merchant',        vault: 'The Ghost Ship',  label: 'The Fog Compass',   color: '#8a7040', goldAccent: false },

  // IRONHOLLOW — "THE IRON COLLECTION"
  { id: 'iron_pauldrons', cat: 'coat',      setId: 'iron', city: 'ironhollow',    boss: 'general_crowe',     bossLabel: 'General Crowe',       vault: 'Arsenal Vault',   label: 'Iron Pauldrons',    color: '#3a3a3a', goldAccent: false },
  { id: 'iron_boots',     cat: 'shoes',     setId: 'iron', city: 'ironhollow',    boss: 'general_crowe',     bossLabel: 'General Crowe',       vault: 'Arsenal Vault',   label: 'Iron Boots',        color: '#2a2a2a', goldAccent: false },
  { id: 'iron_coat',      cat: 'coat',      setId: 'iron', city: 'ironhollow',    boss: 'overseer_munt',     bossLabel: 'Overseer Munt',       vault: 'Foundry Vault',   label: 'Iron Greatcoat',    color: '#1a2a1a', goldAccent: false },
  { id: 'iron_gloves',    cat: 'gloves',    setId: 'iron', city: 'ironhollow',    boss: 'overseer_munt',     bossLabel: 'Overseer Munt',       vault: 'Foundry Vault',   label: 'Iron Gloves',       color: '#3a3a3a', goldAccent: false },
  { id: 'iron_mask',      cat: 'mask',      setId: 'iron', city: 'ironhollow',    boss: 'the_warden',        bossLabel: 'The Warden',          vault: 'Restricted Zone', label: 'Iron Mask',         color: '#2a2a2a', goldAccent: false },
  { id: 'iron_belt',      cat: 'accessory', setId: 'iron', city: 'ironhollow',    boss: 'the_warden',        bossLabel: 'The Warden',          vault: 'Restricted Zone', label: 'Iron Belt',         color: '#1a1a1a', goldAccent: false },

  // VERENTHIA — "THE RELIQUARY COLLECTION"
  { id: 'rel_crown',      cat: 'hat',       setId: 'reliquary', city: 'verenthia', boss: 'count_ashmore',    bossLabel: 'Count Ashmore',       vault: 'Noble House Vault',label: 'Reliquary Crown',  color: '#C49A3C', goldAccent: true },
  { id: 'rel_ring',       cat: 'accessory', setId: 'reliquary', city: 'verenthia', boss: 'count_ashmore',    bossLabel: 'Count Ashmore',       vault: 'Noble House Vault',label: 'Reliquary Ring',   color: '#B8E8FF', goldAccent: true },
  { id: 'rel_robe',       cat: 'coat',      setId: 'reliquary', city: 'verenthia', boss: 'archbishop_veld',  bossLabel: 'Archbishop Veld',     vault: 'Cathedral Vault', label: 'Reliquary Robe',   color: '#5a0a0a', goldAccent: true },
  { id: 'rel_gloves',     cat: 'gloves',    setId: 'reliquary', city: 'verenthia', boss: 'archbishop_veld',  bossLabel: 'Archbishop Veld',     vault: 'Cathedral Vault', label: 'Reliquary Gloves', color: '#e8e0d0', goldAccent: true },
  { id: 'rel_mask',       cat: 'mask',      setId: 'reliquary', city: 'verenthia', boss: 'the_phantom',      bossLabel: 'The Phantom',         vault: 'The Reliquary',   label: 'Reliquary Mask',   color: '#C49A3C', goldAccent: true },
  { id: 'rel_cane',       cat: 'weapon',    setId: 'reliquary', city: 'verenthia', boss: 'the_phantom',      bossLabel: 'The Phantom',         vault: 'The Reliquary',   label: 'Reliquary Cane',   color: '#C49A3C', goldAccent: true },
];

export const LEGENDARY_SETS: Record<string, { label: string; city: string; bonus: string; pose: string; pieces: number }> = {
  vane:      { label: 'The Vane Collection',      city: 'new_cavendish', bonus: 'Golden shimmer aura',      pose: 'the_don',      pieces: 6 },
  fog:       { label: 'The Fog Collection',        city: 'shadowport',    bonus: 'Blue mist swirl effect',   pose: 'the_smuggler', pieces: 6 },
  iron:      { label: 'The Iron Collection',       city: 'ironhollow',    bonus: 'Metallic sheen + sparks',  pose: 'the_general',  pieces: 6 },
  reliquary: { label: 'The Reliquary Collection',  city: 'verenthia',     bonus: 'All jewel colors cycling', pose: 'the_phantom',  pieces: 6 },
};

export const POSES = [
  { id: 'the_lean',          label: 'The Lean',              tier: 'standard' as const },
  { id: 'arms_crossed',      label: 'Arms Crossed',          tier: 'standard' as const },
  { id: 'hand_in_pocket',    label: 'Hand in Pocket',        tier: 'standard' as const },
  { id: 'looking_away',      label: 'Looking Away',          tier: 'standard' as const },
  { id: 'back_to_wall',      label: 'Back to Wall',          tier: 'standard' as const },
  { id: 'cigarette_break',   label: 'Cigarette Break',       tier: 'standard' as const },
  { id: 'ready_stance',      label: 'Ready Stance',          tier: 'standard' as const },
  { id: 'walking',           label: 'Walking',               tier: 'standard' as const },
  { id: 'the_vault_jump',    label: 'The Vault',             tier: 'standard' as const },
  { id: 'running',           label: 'Running',               tier: 'standard' as const },
  { id: 'drawing_weapon',    label: 'Drawing Weapon',        tier: 'standard' as const },
  { id: 'looking_back',      label: 'Looking Over Shoulder', tier: 'standard' as const },
  { id: 'the_detective',     label: 'The Detective',         tier: 'standard' as const },
  { id: 'the_dancer',        label: 'The Dancer',            tier: 'standard' as const },
  { id: 'hands_up',          label: 'Hands Up',              tier: 'standard' as const },
  { id: 'the_handshake',     label: 'The Handshake',         tier: 'standard' as const },
  { id: 'sitting_command',   label: 'Commanding Sit',        tier: 'standard' as const },
  { id: 'contemplating',     label: 'Contemplating',         tier: 'standard' as const },
  { id: 'the_don',           label: 'The Don',               tier: 'legendary' as const, setId: 'vane',      unlockNote: 'Complete The Vane Collection' },
  { id: 'the_smuggler',      label: 'The Smuggler',          tier: 'legendary' as const, setId: 'fog',       unlockNote: 'Complete The Fog Collection' },
  { id: 'the_general',       label: 'The General',           tier: 'legendary' as const, setId: 'iron',      unlockNote: 'Complete The Iron Collection' },
  { id: 'the_phantom',       label: 'The Phantom',           tier: 'legendary' as const, setId: 'reliquary', unlockNote: 'Complete The Reliquary Collection' },
];

export const PHOTO_BACKDROPS = [
  { id: 'nc_alley',      city: 'new_cavendish', label: 'Rain-Slicked Alley',     bgColor: '#0D1A0A', accentColor: '#E8B84B' },
  { id: 'nc_jazz_club',  city: 'new_cavendish', label: 'Jazz Club Exterior',     bgColor: '#1A0D0A', accentColor: '#E8B84B' },
  { id: 'nc_docks',      city: 'new_cavendish', label: 'The Docks at Night',     bgColor: '#0A0D1A', accentColor: '#E8B84B' },
  { id: 'sp_harbor',     city: 'shadowport',    label: 'Foggy Harbor',           bgColor: '#0A1520', accentColor: '#4A9FE8' },
  { id: 'sp_ghost_ship', city: 'shadowport',    label: 'The Ghost Ship Deck',    bgColor: '#0D1A18', accentColor: '#4A9FE8' },
  { id: 'ih_steel_mill', city: 'ironhollow',    label: 'Steel Mill Interior',    bgColor: '#1A0A0A', accentColor: '#E84A6A' },
  { id: 've_cathedral',  city: 'verenthia',     label: 'Cathedral Steps',        bgColor: '#0A0A1A', accentColor: '#B8E8FF' },
  { id: 've_bank_hall',  city: 'verenthia',     label: 'Grand Banking Hall',     bgColor: '#1A1508', accentColor: '#B8E8FF' },
];

export const PHOTO_LIGHTING = [
  { id: 'spotlight',  label: 'Spotlight',  cssFilter: 'contrast(1.2) brightness(0.8)',  overlay: 'radial-gradient(ellipse at 50% 20%, rgba(255,240,200,0.15) 0%, rgba(0,0,0,0.5) 70%)' },
  { id: 'neon',       label: 'Neon',       cssFilter: 'saturate(1.5) contrast(1.1)',     overlay: 'linear-gradient(180deg, rgba(74,159,232,0.1) 0%, rgba(232,74,106,0.1) 100%)' },
  { id: 'foglight',   label: 'Foglight',   cssFilter: 'brightness(0.7) blur(0.5px)',     overlay: 'radial-gradient(ellipse at 50% 50%, rgba(200,220,240,0.12) 0%, rgba(0,0,0,0.4) 100%)' },
  { id: 'moonlight',  label: 'Moonlight',  cssFilter: 'brightness(0.65) hue-rotate(200deg) saturate(0.7)', overlay: 'linear-gradient(180deg, rgba(184,232,255,0.08) 0%, transparent 60%)' },
];

// ─── TYPE EXPORTS ─────────────────────────────────────────────────────

export interface AvatarConfig {
  gender: string;
  skinTone: number;
  facePreset: number;
  eyeShape: number;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  facialHair: string;
}

export interface EquippedItems {
  hat: string | null;
  mask: string | null;
  eyewear: string | null;
  top: string | null;
  coat: string | null;
  bottoms: string | null;
  shoes: string | null;
  gloves: string | null;
  accessory: string | null;
  weapon: string | null;
  fullOutfit: string | null;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'neutral',
  skinTone: 1,
  facePreset: 1,
  eyeShape: 1,
  eyeColor: 'brown',
  hairStyle: 'slicked_back',
  hairColor: '#1a1a1a',
  facialHair: 'none',
};

export const DEFAULT_EQUIPPED: EquippedItems = {
  hat: null,
  mask: null,
  eyewear: null,
  top: null,
  coat: null,
  bottoms: null,
  shoes: null,
  gloves: null,
  accessory: null,
  weapon: null,
  fullOutfit: null,
};
