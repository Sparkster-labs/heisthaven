
-- Add avatar config columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar jsonb NOT NULL DEFAULT '{
    "gender": "neutral",
    "skinTone": 1,
    "facePreset": 1,
    "eyeShape": 1,
    "eyeColor": "brown",
    "hairStyle": "slicked_back",
    "hairColor": "#1a1a1a",
    "facialHair": "none"
  }',
  ADD COLUMN IF NOT EXISTS "equippedItems" jsonb NOT NULL DEFAULT '{
    "hat": null,
    "mask": null,
    "eyewear": null,
    "top": null,
    "coat": null,
    "bottoms": null,
    "shoes": null,
    "gloves": null,
    "accessory": null,
    "weapon": null,
    "fullOutfit": null
  }';

-- Wardrobe: items the player owns
CREATE TABLE IF NOT EXISTS wardrobe (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  acquired_from text NOT NULL DEFAULT 'shop',
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);
ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wardrobe"
  ON wardrobe FOR ALL USING (auth.uid() = user_id);

-- Boss vault progress: tracks legendary piece drops
CREATE TABLE IF NOT EXISTS boss_vault_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  boss_id text NOT NULL,
  city_id text NOT NULL,
  legendary_piece_id text,
  cleared_at timestamptz DEFAULT now(),
  UNIQUE(user_id, boss_id)
);
ALTER TABLE boss_vault_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boss progress"
  ON boss_vault_progress FOR ALL USING (auth.uid() = user_id);

-- Update safehouse rooms default to include dressing_room
ALTER TABLE safehouse
  ALTER COLUMN rooms SET DEFAULT '{"war_room":1,"vault":0,"garage":0,"dressing_room":0,"study":0,"infirmary":0,"signal_room":0,"parlor":0,"penthouse":0}'::jsonb;
