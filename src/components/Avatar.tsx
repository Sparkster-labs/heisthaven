import { useMemo } from 'react';
import {
  SKIN_TONES, EYE_COLORS, CLOTHING_ITEMS, LEGENDARY_ITEMS,
  type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED,
} from '@/lib/avatarData';
import { THEME } from '@/styles/theme';

// ─── Helper: find item color by id ───
const getItemColor = (itemId: string | null): string | null => {
  if (!itemId) return null;
  const ci = CLOTHING_ITEMS.find(i => i.id === itemId);
  if (ci) return ci.color;
  const li = LEGENDARY_ITEMS.find(i => i.id === itemId);
  if (li) return li.color;
  return null;
};

interface AvatarProps {
  avatarConfig?: AvatarConfig;
  equippedItems?: EquippedItems;
  pose?: string;
  size?: number;
  showGlow?: boolean;
}

const Avatar = ({
  avatarConfig = DEFAULT_AVATAR,
  equippedItems = DEFAULT_EQUIPPED,
  pose = 'the_lean',
  size = 240,
  showGlow = false,
}: AvatarProps) => {
  const skinHex = useMemo(() => {
    const tone = SKIN_TONES.find(t => t.id === avatarConfig.skinTone);
    return tone?.hex || SKIN_TONES[0].hex;
  }, [avatarConfig.skinTone]);

  const eyeHex = useMemo(() => {
    const ec = EYE_COLORS.find(e => e.id === avatarConfig.eyeColor);
    return ec?.hex || EYE_COLORS[0].hex;
  }, [avatarConfig.eyeColor]);

  const hairColor = avatarConfig.hairColor || '#1a1a1a';
  const height = size * 1.33;

  // Resolve equipped item colors
  const fullOutfitColor = getItemColor(equippedItems.fullOutfit);
  const topColor = fullOutfitColor || getItemColor(equippedItems.top);
  const coatColor = getItemColor(equippedItems.coat);
  const bottomsColor = fullOutfitColor || getItemColor(equippedItems.bottoms);
  const shoesColor = getItemColor(equippedItems.shoes);
  const glovesColor = getItemColor(equippedItems.gloves);
  const hatColor = getItemColor(equippedItems.hat);
  const maskColor = getItemColor(equippedItems.mask);
  const eyewearColor = getItemColor(equippedItems.eyewear);
  const accessoryColor = getItemColor(equippedItems.accessory);
  const weaponColor = getItemColor(equippedItems.weapon);

  // Pose offsets (subtle body angle changes)
  const poseTransform = useMemo(() => {
    switch (pose) {
      case 'arms_crossed': return 'translate(0, -1)';
      case 'looking_away': return 'rotate(-3, 50, 66)';
      case 'the_lean': return 'rotate(2, 50, 66)';
      case 'walking': return 'translate(2, 0)';
      default: return '';
    }
  }, [pose]);

  return (
    <div style={{
      position: 'relative',
      width: size,
      height,
      ...(showGlow ? {
        animation: 'avatarGlow 2s ease-in-out infinite',
        borderRadius: 8,
      } : {}),
    }}>
      <svg viewBox="0 0 100 133" width={size} height={height} xmlns="http://www.w3.org/2000/svg">
        <g transform={poseTransform}>
          {/* Layer 1: Body silhouette */}
          <g id="layer-body">
            {/* Head */}
            <ellipse cx={50} cy={28} rx={16} ry={18} fill={skinHex} />
            {/* Neck */}
            <rect x={45} y={44} width={10} height={6} rx={2} fill={skinHex} />
            {/* Torso */}
            <rect x={32} y={48} width={36} height={34} rx={4} fill={skinHex} />
            {/* Left arm */}
            <rect x={16} y={50} width={16} height={28} rx={6} fill={skinHex} />
            {/* Right arm */}
            <rect x={68} y={50} width={16} height={28} rx={6} fill={skinHex} />
            {/* Left leg */}
            <rect x={34} y={80} width={14} height={32} rx={4} fill={skinHex} />
            {/* Right leg */}
            <rect x={52} y={80} width={14} height={32} rx={4} fill={skinHex} />
          </g>

          {/* Layer 2: Bottoms */}
          {bottomsColor && (
            <g id="layer-bottoms">
              <rect x={34} y={80} width={14} height={28} rx={4} fill={bottomsColor} />
              <rect x={52} y={80} width={14} height={28} rx={4} fill={bottomsColor} />
            </g>
          )}

          {/* Layer 3: Shoes */}
          {shoesColor && (
            <g id="layer-shoes">
              <rect x={32} y={106} width={18} height={8} rx={3} fill={shoesColor} />
              <rect x={50} y={106} width={18} height={8} rx={3} fill={shoesColor} />
            </g>
          )}

          {/* Layer 4: Top */}
          {topColor && !fullOutfitColor && (
            <g id="layer-top">
              <rect x={32} y={48} width={36} height={34} rx={4} fill={topColor} />
              {/* Collar */}
              <path d="M 42 48 L 50 54 L 58 48" stroke={topColor} strokeWidth={2} fill="none" opacity={0.6} />
            </g>
          )}

          {/* Full outfit override */}
          {fullOutfitColor && (
            <g id="layer-fulloutfit">
              <rect x={30} y={46} width={40} height={38} rx={4} fill={fullOutfitColor} />
              <rect x={34} y={80} width={14} height={28} rx={4} fill={fullOutfitColor} />
              <rect x={52} y={80} width={14} height={28} rx={4} fill={fullOutfitColor} />
            </g>
          )}

          {/* Layer 5: Coat */}
          {coatColor && !fullOutfitColor && (
            <g id="layer-coat">
              <rect x={28} y={46} width={44} height={38} rx={4} fill={coatColor} opacity={0.9} />
              {/* Lapels */}
              <path d="M 40 46 L 50 58 L 60 46" stroke={`${coatColor}80`} strokeWidth={1.5} fill="none" />
            </g>
          )}

          {/* Layer 6: Gloves */}
          {glovesColor && (
            <g id="layer-gloves">
              <ellipse cx={20} cy={80} rx={6} ry={4} fill={glovesColor} />
              <ellipse cx={80} cy={80} rx={6} ry={4} fill={glovesColor} />
            </g>
          )}

          {/* Layer 7: Accessory */}
          {accessoryColor && (
            <g id="layer-accessory">
              <circle cx={50} cy={52} r={3} fill={accessoryColor} />
              <rect x={48} y={52} width={4} height={8} rx={1} fill={accessoryColor} opacity={0.7} />
            </g>
          )}

          {/* Layer 8: Weapon */}
          {weaponColor && (
            <g id="layer-weapon">
              <rect x={72} y={64} width={4} height={20} rx={1} fill={weaponColor} transform="rotate(15, 74, 74)" />
              <rect x={70} y={62} width={8} height={4} rx={1} fill={weaponColor} transform="rotate(15, 74, 64)" />
            </g>
          )}

          {/* Layer 9: Face */}
          <g id="layer-face">
            <ellipse cx={50} cy={30} rx={13} ry={15} fill={skinHex} />
            {/* Nose */}
            <ellipse cx={50} cy={33} rx={2} ry={2.5} fill={`${skinHex}CC`} stroke={`${skinHex}80`} strokeWidth={0.5} />
            {/* Mouth */}
            <path d="M 45 38 Q 50 41 55 38" stroke="#00000030" strokeWidth={0.8} fill="none" />
          </g>

          {/* Layer 10: Eyes */}
          <g id="layer-eyes">
            <ellipse cx={43} cy={28} rx={3} ry={2.5} fill="white" />
            <ellipse cx={57} cy={28} rx={3} ry={2.5} fill="white" />
            <circle cx={43} cy={28} r={1.8} fill={eyeHex} />
            <circle cx={57} cy={28} r={1.8} fill={eyeHex} />
            <circle cx={43} cy={27.5} r={0.6} fill="white" />
            <circle cx={57} cy={27.5} r={0.6} fill="white" />
            {/* Brows */}
            <path d="M 39 24 Q 43 22 47 24" stroke="#00000060" strokeWidth={1} fill="none" />
            <path d="M 53 24 Q 57 22 61 24" stroke="#00000060" strokeWidth={1} fill="none" />
          </g>

          {/* Layer 11: Facial hair */}
          {avatarConfig.facialHair !== 'none' && (
            <g id="layer-facial-hair">
              {avatarConfig.facialHair === 'stubble' && (
                <rect x={42} y={35} width={16} height={6} rx={3} fill="#00000020" />
              )}
              {avatarConfig.facialHair === 'full_beard' && (
                <path d="M 40 34 Q 40 46 50 48 Q 60 46 60 34" fill={hairColor} opacity={0.7} />
              )}
              {avatarConfig.facialHair === 'short_beard' && (
                <path d="M 42 35 Q 42 42 50 44 Q 58 42 58 35" fill={hairColor} opacity={0.6} />
              )}
              {avatarConfig.facialHair === 'goatee' && (
                <path d="M 46 36 Q 46 42 50 44 Q 54 42 54 36" fill={hairColor} opacity={0.6} />
              )}
              {(avatarConfig.facialHair === 'handlebar' || avatarConfig.facialHair === 'pencil') && (
                <path d="M 44 34 Q 50 36 56 34" stroke={hairColor} strokeWidth={avatarConfig.facialHair === 'handlebar' ? 2 : 0.8} fill="none" />
              )}
              {avatarConfig.facialHair === 'five_oclock' && (
                <rect x={40} y={33} width={20} height={8} rx={4} fill="#00000015" />
              )}
            </g>
          )}

          {/* Layer 12: Eyewear */}
          {eyewearColor && (
            <g id="layer-eyewear">
              <rect x={37} y={25.5} width={26} height={6} rx={3} fill={eyewearColor} opacity={0.8} />
              <rect x={48} y={26} width={4} height={2} rx={1} fill={eyewearColor} />
            </g>
          )}

          {/* Layer 13: Mask */}
          {maskColor && (
            <g id="layer-mask">
              <ellipse cx={50} cy={36} rx={14} ry={10} fill={maskColor} opacity={0.85} />
            </g>
          )}

          {/* Layer 14: Hair */}
          <g id="layer-hair">
            {avatarConfig.hairStyle !== 'bald' && avatarConfig.hairStyle !== 'bald_stubble' && (
              <>
                {/* Base hair shape */}
                <ellipse cx={50} cy={20} rx={17} ry={12} fill={hairColor} />
                {/* Side hair */}
                <rect x={33} y={18} width={6} height={14} rx={3} fill={hairColor} />
                <rect x={61} y={18} width={6} height={14} rx={3} fill={hairColor} />
                {/* Style variations */}
                {(avatarConfig.hairStyle === 'pompadour' || avatarConfig.hairStyle === 'victory_rolls') && (
                  <ellipse cx={50} cy={14} rx={14} ry={8} fill={hairColor} />
                )}
                {(avatarConfig.hairStyle === 'long_straight' || avatarConfig.hairStyle === 'long_waves' || avatarConfig.hairStyle === 'curly_long' || avatarConfig.hairStyle === 'locs_long') && (
                  <>
                    <rect x={33} y={18} width={6} height={28} rx={3} fill={hairColor} />
                    <rect x={61} y={18} width={6} height={28} rx={3} fill={hairColor} />
                  </>
                )}
                {(avatarConfig.hairStyle === 'afro_small' || avatarConfig.hairStyle === 'afro_large') && (
                  <ellipse cx={50} cy={20} rx={avatarConfig.hairStyle === 'afro_large' ? 22 : 19} ry={avatarConfig.hairStyle === 'afro_large' ? 16 : 14} fill={hairColor} />
                )}
                {avatarConfig.hairStyle === 'mohawk' && (
                  <rect x={44} y={8} width={12} height={14} rx={3} fill={hairColor} />
                )}
                {(avatarConfig.hairStyle === 'bob' || avatarConfig.hairStyle === 'pixie') && (
                  <>
                    <rect x={33} y={18} width={6} height={16} rx={3} fill={hairColor} />
                    <rect x={61} y={18} width={6} height={16} rx={3} fill={hairColor} />
                  </>
                )}
                {avatarConfig.hairStyle === 'space_buns' && (
                  <>
                    <circle cx={35} cy={16} r={6} fill={hairColor} />
                    <circle cx={65} cy={16} r={6} fill={hairColor} />
                  </>
                )}
                {avatarConfig.hairStyle === 'high_pony' && (
                  <rect x={52} y={10} width={6} height={20} rx={3} fill={hairColor} transform="rotate(30, 55, 20)" />
                )}
              </>
            )}
            {avatarConfig.hairStyle === 'bald_stubble' && (
              <ellipse cx={50} cy={20} rx={16} ry={11} fill={hairColor} opacity={0.15} />
            )}
          </g>

          {/* Layer 15: Hat */}
          {hatColor && (
            <g id="layer-hat">
              {/* Hat crown */}
              <rect x={35} y={8} width={30} height={14} rx={3} fill={hatColor} />
              {/* Hat brim */}
              <rect x={28} y={20} width={44} height={4} rx={2} fill={hatColor} />
            </g>
          )}
        </g>
      </svg>

      {showGlow && (
        <style>{`
          @keyframes avatarGlow {
            0%, 100% { box-shadow: 0 0 15px ${THEME.colors.gold}40; }
            50% { box-shadow: 0 0 30px ${THEME.colors.gold}80; }
          }
        `}</style>
      )}
    </div>
  );
};

// ─── AvatarMini — simplified small version ───
export const AvatarMini = ({
  avatarConfig = DEFAULT_AVATAR,
  equippedItems = DEFAULT_EQUIPPED,
  size = 48,
}: { avatarConfig?: AvatarConfig; equippedItems?: EquippedItems; size?: number }) => {
  const skinHex = SKIN_TONES.find(t => t.id === avatarConfig.skinTone)?.hex || SKIN_TONES[0].hex;
  const hairColor = avatarConfig.hairColor || '#1a1a1a';
  const topColor = getItemColor(equippedItems.fullOutfit) || getItemColor(equippedItems.coat) || getItemColor(equippedItems.top);
  const hatColor = getItemColor(equippedItems.hat);
  const height = size * 1.33;

  return (
    <div style={{ width: size, height }}>
      <svg viewBox="0 0 100 133" width={size} height={height}>
        <ellipse cx={50} cy={28} rx={16} ry={18} fill={skinHex} />
        <rect x={32} y={48} width={36} height={34} rx={4} fill={topColor || skinHex} />
        <rect x={34} y={80} width={14} height={32} rx={4} fill={skinHex} />
        <rect x={52} y={80} width={14} height={32} rx={4} fill={skinHex} />
        {avatarConfig.hairStyle !== 'bald' && (
          <ellipse cx={50} cy={20} rx={17} ry={12} fill={hairColor} />
        )}
        {hatColor && (
          <>
            <rect x={35} y={8} width={30} height={14} rx={3} fill={hatColor} />
            <rect x={28} y={20} width={44} height={4} rx={2} fill={hatColor} />
          </>
        )}
      </svg>
    </div>
  );
};

export default Avatar;
