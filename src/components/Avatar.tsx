import { useMemo } from 'react';
import {
  SKIN_TONES, EYE_COLORS, CLOTHING_ITEMS, LEGENDARY_ITEMS,
  type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED,
} from '@/lib/avatarData';
import { THEME } from '@/styles/theme';

const getItemColor = (itemId: string | null): string | null => {
  if (!itemId) return null;
  const ci = CLOTHING_ITEMS.find(i => i.id === itemId);
  if (ci) return ci.color;
  const li = LEGENDARY_ITEMS.find(i => i.id === itemId);
  if (li) return li.color;
  return null;
};

// Darken/lighten helpers
const shade = (hex: string, amt: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
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

  const skinShadow = useMemo(() => shade(skinHex, -30), [skinHex]);
  const skinHighlight = useMemo(() => shade(skinHex, 25), [skinHex]);

  const eyeHex = useMemo(() => {
    const ec = EYE_COLORS.find(e => e.id === avatarConfig.eyeColor);
    return ec?.hex || EYE_COLORS[0].hex;
  }, [avatarConfig.eyeColor]);

  const hairColor = avatarConfig.hairColor || '#1a1a1a';
  const hairHighlight = useMemo(() => shade(hairColor, 30), [hairColor]);
  const height = size * 1.33;

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

  const poseTransform = useMemo(() => {
    switch (pose) {
      case 'arms_crossed': return 'translate(0, -1)';
      case 'looking_away': return 'rotate(-3, 50, 66)';
      case 'the_lean': return 'rotate(2, 50, 66)';
      case 'walking': return 'translate(2, 0)';
      default: return '';
    }
  }, [pose]);

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

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
        <defs>
          {/* Skin gradient */}
          <radialGradient id={`skin-${uid}`} cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor={skinHighlight} />
            <stop offset="70%" stopColor={skinHex} />
            <stop offset="100%" stopColor={skinShadow} />
          </radialGradient>
          {/* Hair sheen */}
          <linearGradient id={`hair-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={shade(hairColor, -20)} />
          </linearGradient>
          {/* Cloth sheen */}
          <linearGradient id={`cloth-${uid}`} x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Drop shadow */}
          <filter id={`shadow-${uid}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
          </filter>
          {/* Ambient occlusion for face */}
          <radialGradient id={`face-ao-${uid}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor={skinHex} stopOpacity="0" />
            <stop offset="85%" stopColor="#000" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        <g transform={poseTransform}>
          {/* ── BODY ── */}
          <g id="body" filter={`url(#shadow-${uid})`}>
            {/* Head */}
            <ellipse cx={50} cy={28} rx={15} ry={17} fill={`url(#skin-${uid})`} />
            {/* Ears */}
            <ellipse cx={35.5} cy={30} rx={3} ry={4.5} fill={skinHex} />
            <ellipse cx={35.5} cy={30} rx={1.5} ry={2.5} fill={skinShadow} opacity={0.3} />
            <ellipse cx={64.5} cy={30} rx={3} ry={4.5} fill={skinHex} />
            <ellipse cx={64.5} cy={30} rx={1.5} ry={2.5} fill={skinShadow} opacity={0.3} />
            {/* Neck */}
            <rect x={44} y={43} width={12} height={8} rx={3} fill={skinHex} />
            <rect x={44} y={43} width={6} height={8} rx={3} fill={skinHighlight} opacity={0.15} />
            {/* Torso */}
            <path d="M 32 50 Q 30 48 34 46 L 66 46 Q 70 48 68 50 L 70 82 L 30 82 Z" fill={skinHex} />
            {/* Arms */}
            <rect x={16} y={49} width={14} height={30} rx={7} fill={skinHex} />
            <rect x={16} y={49} width={7} height={30} rx={5} fill={skinHighlight} opacity={0.1} />
            <rect x={70} y={49} width={14} height={30} rx={7} fill={skinHex} />
            {/* Hands */}
            <ellipse cx={23} cy={81} rx={5.5} ry={4} fill={skinHex} />
            <ellipse cx={77} cy={81} rx={5.5} ry={4} fill={skinHex} />
            {/* Legs */}
            <rect x={34} y={80} width={14} height={32} rx={5} fill={skinHex} />
            <rect x={52} y={80} width={14} height={32} rx={5} fill={skinHex} />
          </g>

          {/* ── BOTTOMS ── */}
          {bottomsColor && (
            <g id="bottoms">
              <rect x={34} y={80} width={14} height={28} rx={5} fill={bottomsColor} />
              <rect x={52} y={80} width={14} height={28} rx={5} fill={bottomsColor} />
              {/* Crease highlights */}
              <rect x={39} y={82} width={2} height={24} rx={1} fill="white" opacity={0.06} />
              <rect x={57} y={82} width={2} height={24} rx={1} fill="white" opacity={0.06} />
              {/* Waistband */}
              <rect x={30} y={78} width={40} height={4} rx={2} fill={shade(bottomsColor, -20)} />
            </g>
          )}

          {/* ── SHOES ── */}
          {shoesColor && (
            <g id="shoes">
              <path d="M 31 107 L 31 112 Q 31 115 34 115 L 50 115 Q 52 115 52 112 L 52 110 Q 52 107 48 107 Z" fill={shoesColor} />
              <path d="M 49 107 L 49 112 Q 49 115 52 115 L 68 115 Q 70 115 70 112 L 70 110 Q 70 107 66 107 Z" fill={shoesColor} />
              {/* Sole */}
              <rect x={31} y={113} width={21} height={2} rx={1} fill={shade(shoesColor, -30)} />
              <rect x={49} y={113} width={21} height={2} rx={1} fill={shade(shoesColor, -30)} />
              {/* Sheen */}
              <ellipse cx={40} cy={110} rx={6} ry={2} fill="white" opacity={0.06} />
              <ellipse cx={58} cy={110} rx={6} ry={2} fill="white" opacity={0.06} />
            </g>
          )}

          {/* ── TOP ── */}
          {topColor && !fullOutfitColor && (
            <g id="top">
              <path d="M 32 50 Q 30 48 34 46 L 66 46 Q 70 48 68 50 L 70 82 L 30 82 Z" fill={topColor} />
              {/* Collar */}
              <path d="M 42 46 L 50 54 L 58 46" stroke={shade(topColor, -25)} strokeWidth={1.5} fill="none" />
              {/* Shoulder seams */}
              <line x1={34} y1={48} x2={30} y2={52} stroke={shade(topColor, -15)} strokeWidth={0.6} opacity={0.5} />
              <line x1={66} y1={48} x2={70} y2={52} stroke={shade(topColor, -15)} strokeWidth={0.6} opacity={0.5} />
              {/* Cloth sheen */}
              <path d="M 32 50 Q 30 48 34 46 L 50 46 L 50 82 L 30 82 Z" fill={`url(#cloth-${uid})`} />
              {/* Sleeves */}
              <rect x={16} y={49} width={14} height={22} rx={7} fill={topColor} />
              <rect x={70} y={49} width={14} height={22} rx={7} fill={topColor} />
            </g>
          )}

          {/* ── FULL OUTFIT ── */}
          {fullOutfitColor && (
            <g id="fulloutfit">
              <path d="M 30 46 L 70 46 L 72 82 L 28 82 Z" fill={fullOutfitColor} />
              <rect x={34} y={80} width={14} height={28} rx={5} fill={fullOutfitColor} />
              <rect x={52} y={80} width={14} height={28} rx={5} fill={fullOutfitColor} />
              <rect x={16} y={49} width={14} height={24} rx={7} fill={fullOutfitColor} />
              <rect x={70} y={49} width={14} height={24} rx={7} fill={fullOutfitColor} />
              {/* Lapel line */}
              <path d="M 44 46 L 50 58 L 56 46" stroke={shade(fullOutfitColor, -25)} strokeWidth={1.2} fill="none" />
              {/* Buttons */}
              <circle cx={50} cy={60} r={1.2} fill={shade(fullOutfitColor, 40)} opacity={0.5} />
              <circle cx={50} cy={66} r={1.2} fill={shade(fullOutfitColor, 40)} opacity={0.5} />
              <circle cx={50} cy={72} r={1.2} fill={shade(fullOutfitColor, 40)} opacity={0.5} />
              <path d="M 30 46 L 50 46 L 50 82 L 28 82 Z" fill={`url(#cloth-${uid})`} />
            </g>
          )}

          {/* ── COAT ── */}
          {coatColor && !fullOutfitColor && (
            <g id="coat">
              <path d="M 26 46 L 74 46 L 76 86 L 24 86 Z" fill={coatColor} />
              {/* Lapels */}
              <path d="M 40 46 L 50 60 L 60 46" stroke={shade(coatColor, -20)} strokeWidth={1.2} fill="none" />
              {/* Buttons */}
              <circle cx={50} cy={62} r={1.3} fill={shade(coatColor, 50)} opacity={0.4} />
              <circle cx={50} cy={70} r={1.3} fill={shade(coatColor, 50)} opacity={0.4} />
              {/* Pockets */}
              <rect x={32} y={70} width={8} height={1} rx={0.5} fill={shade(coatColor, -15)} opacity={0.5} />
              <rect x={60} y={70} width={8} height={1} rx={0.5} fill={shade(coatColor, -15)} opacity={0.5} />
              {/* Sleeves */}
              <rect x={14} y={48} width={14} height={28} rx={7} fill={coatColor} />
              <rect x={72} y={48} width={14} height={28} rx={7} fill={coatColor} />
              {/* Cloth sheen */}
              <path d="M 26 46 L 50 46 L 50 86 L 24 86 Z" fill={`url(#cloth-${uid})`} />
            </g>
          )}

          {/* ── GLOVES ── */}
          {glovesColor && (
            <g id="gloves">
              <ellipse cx={23} cy={81} rx={6} ry={4.5} fill={glovesColor} />
              <ellipse cx={77} cy={81} rx={6} ry={4.5} fill={glovesColor} />
              {/* Finger details */}
              <path d="M 18 79 Q 17 76 19 76" stroke={shade(glovesColor, -20)} strokeWidth={0.5} fill="none" />
              <path d="M 82 79 Q 83 76 81 76" stroke={shade(glovesColor, -20)} strokeWidth={0.5} fill="none" />
            </g>
          )}

          {/* ── ACCESSORY ── */}
          {accessoryColor && (
            <g id="accessory">
              <circle cx={50} cy={52} r={3} fill={accessoryColor} />
              <rect x={48.5} y={52} width={3} height={8} rx={1} fill={accessoryColor} opacity={0.7} />
              {/* Sparkle */}
              <circle cx={50} cy={52} r={1.2} fill="white" opacity={0.3} />
            </g>
          )}

          {/* ── WEAPON ── */}
          {weaponColor && (
            <g id="weapon" transform="rotate(15, 74, 74)">
              <rect x={72} y={62} width={4} height={20} rx={1} fill={weaponColor} />
              <rect x={70} y={60} width={8} height={4} rx={1} fill={weaponColor} />
              {/* Barrel sheen */}
              <rect x={73} y={64} width={1.5} height={16} rx={0.5} fill="white" opacity={0.1} />
            </g>
          )}

          {/* ── FACE ── */}
          <g id="face">
            <ellipse cx={50} cy={30} rx={13} ry={15} fill={`url(#skin-${uid})`} />
            {/* Ambient occlusion */}
            <ellipse cx={50} cy={30} rx={13} ry={15} fill={`url(#face-ao-${uid})`} />
            {/* Nose - more defined */}
            <path d="M 49 28 L 48 33 Q 50 35 52 33 L 51 28" fill={skinShadow} opacity={0.2} />
            <ellipse cx={50} cy={33.5} rx={2.5} ry={1.8} fill={skinHex} stroke={skinShadow} strokeWidth={0.3} opacity={0.6} />
            {/* Nostrils */}
            <circle cx={48.5} cy={34} r={0.6} fill={skinShadow} opacity={0.3} />
            <circle cx={51.5} cy={34} r={0.6} fill={skinShadow} opacity={0.3} />
            {/* Mouth */}
            <path d="M 45 38 Q 47 39 50 39.5 Q 53 39 55 38" stroke={skinShadow} strokeWidth={0.8} fill="none" opacity={0.4} />
            {/* Upper lip shadow */}
            <path d="M 46 37.5 Q 48 36.5 50 37 Q 52 36.5 54 37.5" stroke={skinShadow} strokeWidth={0.4} fill="none" opacity={0.2} />
            {/* Chin definition */}
            <ellipse cx={50} cy={42} rx={6} ry={2} fill={skinShadow} opacity={0.06} />
            {/* Cheek highlights */}
            <ellipse cx={42} cy={33} rx={3} ry={2} fill={skinHighlight} opacity={0.12} />
            <ellipse cx={58} cy={33} rx={3} ry={2} fill={skinHighlight} opacity={0.12} />
          </g>

          {/* ── EYES ── */}
          <g id="eyes">
            {/* Eye whites with subtle shadow */}
            <ellipse cx={43} cy={28} rx={3.5} ry={2.8} fill="white" />
            <ellipse cx={57} cy={28} rx={3.5} ry={2.8} fill="white" />
            {/* Upper eyelid shadow */}
            <ellipse cx={43} cy={26.5} rx={3.5} ry={1.2} fill={skinShadow} opacity={0.15} />
            <ellipse cx={57} cy={26.5} rx={3.5} ry={1.2} fill={skinShadow} opacity={0.15} />
            {/* Iris */}
            <circle cx={43} cy={28.2} r={2} fill={eyeHex} />
            <circle cx={57} cy={28.2} r={2} fill={eyeHex} />
            {/* Iris detail ring */}
            <circle cx={43} cy={28.2} r={2} fill="none" stroke={shade(eyeHex, -30)} strokeWidth={0.3} />
            <circle cx={57} cy={28.2} r={2} fill="none" stroke={shade(eyeHex, -30)} strokeWidth={0.3} />
            {/* Pupil */}
            <circle cx={43} cy={28.2} r={1} fill="#0a0a0a" />
            <circle cx={57} cy={28.2} r={1} fill="#0a0a0a" />
            {/* Catch light */}
            <circle cx={42} cy={27.2} r={0.8} fill="white" opacity={0.9} />
            <circle cx={56} cy={27.2} r={0.8} fill="white" opacity={0.9} />
            <circle cx={44} cy={29} r={0.4} fill="white" opacity={0.5} />
            <circle cx={58} cy={29} r={0.4} fill="white" opacity={0.5} />
            {/* Eyelashes / upper lid line */}
            <path d="M 39.5 26 Q 43 24.5 46.5 26" stroke="#1a1a1a" strokeWidth={0.8} fill="none" opacity={0.6} />
            <path d="M 53.5 26 Q 57 24.5 60.5 26" stroke="#1a1a1a" strokeWidth={0.8} fill="none" opacity={0.6} />
            {/* Brows */}
            <path d="M 38.5 23 Q 43 21 47.5 23" stroke={shade(hairColor, -10)} strokeWidth={1.2} fill="none" opacity={0.7} />
            <path d="M 52.5 23 Q 57 21 61.5 23" stroke={shade(hairColor, -10)} strokeWidth={1.2} fill="none" opacity={0.7} />
          </g>

          {/* ── FACIAL HAIR ── */}
          {avatarConfig.facialHair !== 'none' && (
            <g id="facial-hair">
              {avatarConfig.facialHair === 'stubble' && (
                <>
                  <rect x={41} y={35} width={18} height={7} rx={4} fill={hairColor} opacity={0.12} />
                  {/* Stubble dots */}
                  {[...Array(12)].map((_, i) => (
                    <circle key={i} cx={42 + (i % 4) * 4.5} cy={36 + Math.floor(i / 4) * 2.5} r={0.4} fill={hairColor} opacity={0.2} />
                  ))}
                </>
              )}
              {avatarConfig.facialHair === 'full_beard' && (
                <path d="M 39 34 Q 38 46 50 49 Q 62 46 61 34" fill={`url(#hair-${uid})`} opacity={0.7} />
              )}
              {avatarConfig.facialHair === 'short_beard' && (
                <path d="M 41 35 Q 40 43 50 45 Q 60 43 59 35" fill={`url(#hair-${uid})`} opacity={0.6} />
              )}
              {avatarConfig.facialHair === 'goatee' && (
                <path d="M 45 36 Q 45 43 50 45 Q 55 43 55 36" fill={`url(#hair-${uid})`} opacity={0.6} />
              )}
              {(avatarConfig.facialHair === 'handlebar' || avatarConfig.facialHair === 'pencil') && (
                <path d="M 43 34 Q 50 36.5 57 34" stroke={hairColor} strokeWidth={avatarConfig.facialHair === 'handlebar' ? 2 : 0.8} fill="none" strokeLinecap="round" />
              )}
              {avatarConfig.facialHair === 'five_oclock' && (
                <rect x={39} y={33} width={22} height={9} rx={5} fill={hairColor} opacity={0.1} />
              )}
            </g>
          )}

          {/* ── EYEWEAR ── */}
          {eyewearColor && (
            <g id="eyewear">
              <rect x={37} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.85} />
              <rect x={51} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.85} />
              <rect x={49} y={27} width={2} height={2} rx={1} fill={eyewearColor} />
              {/* Lens reflection */}
              <line x1={39} y1={27} x2={42} y2={30} stroke="white" strokeWidth={0.4} opacity={0.3} />
              <line x1={53} y1={27} x2={56} y2={30} stroke="white" strokeWidth={0.4} opacity={0.3} />
            </g>
          )}

          {/* ── MASK ── */}
          {maskColor && (
            <g id="mask">
              <ellipse cx={50} cy={36} rx={14} ry={10} fill={maskColor} opacity={0.88} />
              <ellipse cx={50} cy={36} rx={14} ry={10} fill={`url(#cloth-${uid})`} />
              {/* Fabric fold lines */}
              <path d="M 40 34 Q 50 38 60 34" stroke={shade(maskColor, -20)} strokeWidth={0.4} fill="none" opacity={0.3} />
            </g>
          )}

          {/* ── HAIR ── */}
          <g id="hair">
            {avatarConfig.hairStyle !== 'bald' && avatarConfig.hairStyle !== 'bald_stubble' && (
              <>
                <ellipse cx={50} cy={20} rx={16} ry={12} fill={`url(#hair-${uid})`} />
                {/* Side hair */}
                <rect x={34} y={18} width={5} height={14} rx={2.5} fill={hairColor} />
                <rect x={61} y={18} width={5} height={14} rx={2.5} fill={hairColor} />
                {/* Hair highlight */}
                <ellipse cx={46} cy={16} rx={6} ry={4} fill={hairHighlight} opacity={0.15} />

                {(avatarConfig.hairStyle === 'pompadour' || avatarConfig.hairStyle === 'victory_rolls') && (
                  <ellipse cx={50} cy={13} rx={14} ry={9} fill={`url(#hair-${uid})`} />
                )}
                {(avatarConfig.hairStyle === 'long_straight' || avatarConfig.hairStyle === 'long_waves' || avatarConfig.hairStyle === 'curly_long' || avatarConfig.hairStyle === 'locs_long') && (
                  <>
                    <rect x={33} y={18} width={5} height={30} rx={2.5} fill={hairColor} />
                    <rect x={62} y={18} width={5} height={30} rx={2.5} fill={hairColor} />
                  </>
                )}
                {(avatarConfig.hairStyle === 'afro_small' || avatarConfig.hairStyle === 'afro_large') && (
                  <>
                    <ellipse cx={50} cy={20} rx={avatarConfig.hairStyle === 'afro_large' ? 22 : 19} ry={avatarConfig.hairStyle === 'afro_large' ? 16 : 14} fill={`url(#hair-${uid})`} />
                    {/* Texture */}
                    <ellipse cx={44} cy={16} rx={4} ry={3} fill={hairHighlight} opacity={0.1} />
                  </>
                )}
                {avatarConfig.hairStyle === 'mohawk' && (
                  <rect x={44} y={6} width={12} height={16} rx={4} fill={`url(#hair-${uid})`} />
                )}
                {(avatarConfig.hairStyle === 'bob' || avatarConfig.hairStyle === 'pixie') && (
                  <>
                    <rect x={33} y={18} width={5} height={16} rx={2.5} fill={hairColor} />
                    <rect x={62} y={18} width={5} height={16} rx={2.5} fill={hairColor} />
                  </>
                )}
                {avatarConfig.hairStyle === 'space_buns' && (
                  <>
                    <circle cx={35} cy={16} r={6} fill={`url(#hair-${uid})`} />
                    <circle cx={65} cy={16} r={6} fill={`url(#hair-${uid})`} />
                  </>
                )}
                {avatarConfig.hairStyle === 'high_pony' && (
                  <rect x={52} y={10} width={5} height={22} rx={2.5} fill={hairColor} transform="rotate(30, 55, 20)" />
                )}
              </>
            )}
            {avatarConfig.hairStyle === 'bald_stubble' && (
              <ellipse cx={50} cy={20} rx={15} ry={11} fill={hairColor} opacity={0.12} />
            )}
          </g>

          {/* ── HAT ── */}
          {hatColor && (
            <g id="hat">
              <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} />
              {/* Hat band */}
              <rect x={35} y={18} width={30} height={3} rx={1} fill={shade(hatColor, -25)} opacity={0.6} />
              {/* Brim */}
              <ellipse cx={50} cy={22} rx={24} ry={3.5} fill={hatColor} />
              {/* Top sheen */}
              <ellipse cx={46} cy={12} rx={8} ry={3} fill="white" opacity={0.06} />
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
        <ellipse cx={50} cy={28} rx={15} ry={17} fill={skinHex} />
        <ellipse cx={35.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} />
        <ellipse cx={64.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} />
        <path d="M 32 50 L 68 50 L 70 82 L 30 82 Z" fill={topColor || skinHex} />
        <rect x={34} y={80} width={14} height={32} rx={5} fill={skinHex} />
        <rect x={52} y={80} width={14} height={32} rx={5} fill={skinHex} />
        {avatarConfig.hairStyle !== 'bald' && (
          <ellipse cx={50} cy={20} rx={16} ry={12} fill={hairColor} />
        )}
        {/* Simple eyes */}
        <circle cx={43} cy={28} r={1.5} fill="#1a1a1a" />
        <circle cx={57} cy={28} r={1.5} fill="#1a1a1a" />
        {hatColor && (
          <>
            <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} />
            <ellipse cx={50} cy={22} rx={24} ry={3.5} fill={hatColor} />
          </>
        )}
      </svg>
    </div>
  );
};

export default Avatar;
