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
  const strokeColor = '#1a1410';
  const strokeW = 0.8;

  return (
    <div style={{
      position: 'relative', width: size, height,
      ...(showGlow ? { animation: 'avatarGlow 2s ease-in-out infinite', borderRadius: 8 } : {}),
    }}>
      <svg viewBox="0 0 100 133" width={size} height={height} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Pencil sketch filter — organic, hand-drawn edges */}
          <filter id={`sketch-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed={42} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Cross-hatching pattern for shadows */}
          <pattern id={`hatch-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke={strokeColor} strokeWidth="0.3" opacity="0.15" />
          </pattern>
          <pattern id={`hatch2-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="4" stroke={strokeColor} strokeWidth="0.25" opacity="0.1" />
          </pattern>
          {/* Skin gradient */}
          <radialGradient id={`skin-${uid}`} cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor={skinHighlight} />
            <stop offset="70%" stopColor={skinHex} />
            <stop offset="100%" stopColor={skinShadow} />
          </radialGradient>
          {/* Hair */}
          <linearGradient id={`hair-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={shade(hairColor, -20)} />
          </linearGradient>
          {/* Pencil paper texture */}
          <filter id={`paper-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="multiply" />
          </filter>
        </defs>

        <g transform={poseTransform} filter={`url(#sketch-${uid})`}>
          {/* ── BODY (pencil outline style) ── */}
          <g id="body">
            {/* Head */}
            <ellipse cx={50} cy={28} rx={15} ry={17} fill={`url(#skin-${uid})`} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Cross-hatch shadow on head */}
            <ellipse cx={55} cy={32} rx={8} ry={10} fill={`url(#hatch-${uid})`} opacity={0.3} />
            {/* Ears */}
            <ellipse cx={35.5} cy={30} rx={3} ry={4.5} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
            <ellipse cx={64.5} cy={30} rx={3} ry={4.5} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
            {/* Ear inner detail */}
            <path d="M 34.5 28 Q 36 30 35 32" stroke={skinShadow} strokeWidth={0.4} fill="none" />
            <path d="M 65.5 28 Q 64 30 65 32" stroke={skinShadow} strokeWidth={0.4} fill="none" />
            {/* Neck */}
            <rect x={44} y={43} width={12} height={8} rx={3} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW * 0.6} />
            {/* Torso */}
            <path d="M 32 50 Q 30 48 34 46 L 66 46 Q 70 48 68 50 L 70 82 L 30 82 Z" fill={skinHex} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Torso hatching */}
            <path d="M 32 50 Q 30 48 34 46 L 50 46 L 50 82 L 30 82 Z" fill={`url(#hatch2-${uid})`} opacity={0.2} />
            {/* Arms */}
            <rect x={16} y={49} width={14} height={30} rx={7} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW} />
            <rect x={70} y={49} width={14} height={30} rx={7} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Arm detail lines */}
            <path d="M 23 55 Q 21 65 23 75" stroke={skinShadow} strokeWidth={0.4} fill="none" opacity={0.3} />
            <path d="M 77 55 Q 79 65 77 75" stroke={skinShadow} strokeWidth={0.4} fill="none" opacity={0.3} />
            {/* Hands */}
            <ellipse cx={23} cy={81} rx={5.5} ry={4} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
            <ellipse cx={77} cy={81} rx={5.5} ry={4} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
            {/* Finger lines */}
            <path d="M 19 80 L 18 78" stroke={strokeColor} strokeWidth={0.3} opacity={0.4} />
            <path d="M 21 79 L 20 77" stroke={strokeColor} strokeWidth={0.3} opacity={0.4} />
            <path d="M 81 80 L 82 78" stroke={strokeColor} strokeWidth={0.3} opacity={0.4} />
            {/* Legs */}
            <rect x={34} y={80} width={14} height={32} rx={5} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW} />
            <rect x={52} y={80} width={14} height={32} rx={5} fill={skinHex} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Knee lines */}
            <path d="M 38 96 Q 41 97 44 96" stroke={skinShadow} strokeWidth={0.4} fill="none" opacity={0.4} />
            <path d="M 56 96 Q 59 97 62 96" stroke={skinShadow} strokeWidth={0.4} fill="none" opacity={0.4} />
          </g>

          {/* ── BOTTOMS ── */}
          {bottomsColor && (
            <g id="bottoms">
              <rect x={34} y={80} width={14} height={28} rx={5} fill={bottomsColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={52} y={80} width={14} height={28} rx={5} fill={bottomsColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Pencil crease lines */}
              <path d="M 41 82 L 40 106" stroke={shade(bottomsColor, 30)} strokeWidth={0.5} opacity={0.2} />
              <path d="M 59 82 L 58 106" stroke={shade(bottomsColor, 30)} strokeWidth={0.5} opacity={0.2} />
              {/* Hatching for depth */}
              <rect x={34} y={80} width={7} height={28} rx={5} fill={`url(#hatch-${uid})`} opacity={0.15} />
              <rect x={52} y={80} width={7} height={28} rx={5} fill={`url(#hatch-${uid})`} opacity={0.15} />
              {/* Waistband */}
              <rect x={30} y={78} width={40} height={4} rx={2} fill={shade(bottomsColor, -20)} stroke={strokeColor} strokeWidth={0.4} />
            </g>
          )}

          {/* ── SHOES ── */}
          {shoesColor && (
            <g id="shoes">
              <path d="M 31 107 L 31 112 Q 31 115 34 115 L 50 115 Q 52 115 52 112 L 52 110 Q 52 107 48 107 Z" fill={shoesColor} stroke={strokeColor} strokeWidth={strokeW} />
              <path d="M 49 107 L 49 112 Q 49 115 52 115 L 68 115 Q 70 115 70 112 L 70 110 Q 70 107 66 107 Z" fill={shoesColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Sole line */}
              <line x1={32} y1={114} x2={50} y2={114} stroke={strokeColor} strokeWidth={0.5} opacity={0.4} />
              <line x1={50} y1={114} x2={69} y2={114} stroke={strokeColor} strokeWidth={0.5} opacity={0.4} />
            </g>
          )}

          {/* ── TOP ── */}
          {topColor && !fullOutfitColor && (
            <g id="top">
              <path d="M 32 50 Q 30 48 34 46 L 66 46 Q 70 48 68 50 L 70 82 L 30 82 Z" fill={topColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Collar V */}
              <path d="M 42 46 L 50 54 L 58 46" stroke={shade(topColor, -25)} strokeWidth={1} fill="none" />
              {/* Wrinkle lines */}
              <path d="M 35 55 Q 40 57 38 62" stroke={shade(topColor, -15)} strokeWidth={0.4} fill="none" opacity={0.4} />
              <path d="M 65 55 Q 60 57 62 62" stroke={shade(topColor, -15)} strokeWidth={0.4} fill="none" opacity={0.4} />
              {/* Cross-hatch shadow */}
              <path d="M 32 50 Q 30 48 34 46 L 44 46 L 44 82 L 30 82 Z" fill={`url(#hatch-${uid})`} opacity={0.12} />
              {/* Sleeves */}
              <rect x={16} y={49} width={14} height={22} rx={7} fill={topColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={70} y={49} width={14} height={22} rx={7} fill={topColor} stroke={strokeColor} strokeWidth={strokeW} />
            </g>
          )}

          {/* ── FULL OUTFIT ── */}
          {fullOutfitColor && (
            <g id="fulloutfit">
              <path d="M 30 46 L 70 46 L 72 82 L 28 82 Z" fill={fullOutfitColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={34} y={80} width={14} height={28} rx={5} fill={fullOutfitColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={52} y={80} width={14} height={28} rx={5} fill={fullOutfitColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={16} y={49} width={14} height={24} rx={7} fill={fullOutfitColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={70} y={49} width={14} height={24} rx={7} fill={fullOutfitColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Lapel */}
              <path d="M 44 46 L 50 58 L 56 46" stroke={shade(fullOutfitColor, -25)} strokeWidth={1} fill="none" />
              {/* Buttons */}
              <circle cx={50} cy={60} r={1.2} fill="none" stroke={strokeColor} strokeWidth={0.5} />
              <circle cx={50} cy={66} r={1.2} fill="none" stroke={strokeColor} strokeWidth={0.5} />
              <circle cx={50} cy={72} r={1.2} fill="none" stroke={strokeColor} strokeWidth={0.5} />
              {/* Hatching */}
              <path d="M 30 46 L 50 46 L 50 82 L 28 82 Z" fill={`url(#hatch-${uid})`} opacity={0.1} />
            </g>
          )}

          {/* ── COAT ── */}
          {coatColor && !fullOutfitColor && (
            <g id="coat">
              <path d="M 26 46 L 74 46 L 76 86 L 24 86 Z" fill={coatColor} stroke={strokeColor} strokeWidth={strokeW} />
              <path d="M 40 46 L 50 60 L 60 46" stroke={shade(coatColor, -20)} strokeWidth={1} fill="none" />
              {/* Buttons as circles */}
              <circle cx={50} cy={62} r={1.3} fill="none" stroke={strokeColor} strokeWidth={0.5} />
              <circle cx={50} cy={70} r={1.3} fill="none" stroke={strokeColor} strokeWidth={0.5} />
              {/* Pocket lines */}
              <line x1={32} y1={70} x2={40} y2={70} stroke={strokeColor} strokeWidth={0.4} opacity={0.5} />
              <line x1={60} y1={70} x2={68} y2={70} stroke={strokeColor} strokeWidth={0.4} opacity={0.5} />
              {/* Sleeves */}
              <rect x={14} y={48} width={14} height={28} rx={7} fill={coatColor} stroke={strokeColor} strokeWidth={strokeW} />
              <rect x={72} y={48} width={14} height={28} rx={7} fill={coatColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Hatching */}
              <path d="M 26 46 L 50 46 L 50 86 L 24 86 Z" fill={`url(#hatch-${uid})`} opacity={0.1} />
            </g>
          )}

          {/* ── GLOVES ── */}
          {glovesColor && (
            <g id="gloves">
              <ellipse cx={23} cy={81} rx={6} ry={4.5} fill={glovesColor} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
              <ellipse cx={77} cy={81} rx={6} ry={4.5} fill={glovesColor} stroke={strokeColor} strokeWidth={strokeW * 0.7} />
            </g>
          )}

          {/* ── ACCESSORY ── */}
          {accessoryColor && (
            <g id="accessory">
              <circle cx={50} cy={52} r={3} fill="none" stroke={accessoryColor} strokeWidth={1} />
              <circle cx={50} cy={52} r={1} fill={accessoryColor} />
              <rect x={49} y={52} width={2} height={8} rx={1} fill="none" stroke={accessoryColor} strokeWidth={0.6} />
            </g>
          )}

          {/* ── WEAPON ── */}
          {weaponColor && (
            <g id="weapon" transform="rotate(15, 74, 74)">
              <rect x={72} y={62} width={4} height={20} rx={1} fill={weaponColor} stroke={strokeColor} strokeWidth={0.5} />
              <rect x={70} y={60} width={8} height={4} rx={1} fill={weaponColor} stroke={strokeColor} strokeWidth={0.5} />
              <circle cx={74} cy={60} r={2} fill="none" stroke={strokeColor} strokeWidth={0.4} />
            </g>
          )}

          {/* ── FACE ── */}
          <g id="face">
            <ellipse cx={50} cy={30} rx={13} ry={15} fill={`url(#skin-${uid})`} />
            {/* Nose — sketchy pencil lines */}
            <path d="M 49 27 L 47.5 33 Q 50 35 52.5 33 L 51 27" fill="none" stroke={skinShadow} strokeWidth={0.5} opacity={0.5} />
            {/* Nostril dots */}
            <circle cx={48.5} cy={33.5} r={0.5} fill={skinShadow} opacity={0.3} />
            <circle cx={51.5} cy={33.5} r={0.5} fill={skinShadow} opacity={0.3} />
            {/* Mouth — loose pencil curve */}
            <path d="M 45 38 Q 47.5 39.5 50 39.5 Q 52.5 39.5 55 38" stroke={skinShadow} strokeWidth={0.6} fill="none" opacity={0.5} />
            {/* Upper lip */}
            <path d="M 46 37 Q 48 36 50 37 Q 52 36 54 37" stroke={skinShadow} strokeWidth={0.3} fill="none" opacity={0.3} />
            {/* Chin line */}
            <path d="M 44 42 Q 50 44 56 42" stroke={skinShadow} strokeWidth={0.3} fill="none" opacity={0.15} />
            {/* Jawline */}
            <path d="M 37 36 Q 40 43 50 44 Q 60 43 63 36" stroke={strokeColor} strokeWidth={0.3} fill="none" opacity={0.15} />
            {/* Cheek contour hatching */}
            <path d="M 39 30 L 41 33 M 40 31 L 42 34" stroke={skinShadow} strokeWidth={0.2} opacity={0.12} />
            <path d="M 61 30 L 59 33 M 60 31 L 58 34" stroke={skinShadow} strokeWidth={0.2} opacity={0.12} />
          </g>

          {/* ── EYES ── */}
          <g id="eyes">
            {/* Eye shapes — more hand-drawn */}
            <path d="M 39.5 28 Q 43 25 46.5 28 Q 43 30.5 39.5 28 Z" fill="white" stroke={strokeColor} strokeWidth={0.5} />
            <path d="M 53.5 28 Q 57 25 60.5 28 Q 57 30.5 53.5 28 Z" fill="white" stroke={strokeColor} strokeWidth={0.5} />
            {/* Iris */}
            <circle cx={43} cy={28} r={2} fill={eyeHex} />
            <circle cx={57} cy={28} r={2} fill={eyeHex} />
            {/* Pupil */}
            <circle cx={43} cy={28} r={1} fill="#0a0a0a" />
            <circle cx={57} cy={28} r={1} fill="#0a0a0a" />
            {/* Catch light */}
            <circle cx={42} cy={27} r={0.7} fill="white" opacity={0.8} />
            <circle cx={56} cy={27} r={0.7} fill="white" opacity={0.8} />
            {/* Lash lines — sketchy */}
            <path d="M 39 26.5 Q 43 24.5 47 26.5" stroke={strokeColor} strokeWidth={0.7} fill="none" opacity={0.7} />
            <path d="M 53 26.5 Q 57 24.5 61 26.5" stroke={strokeColor} strokeWidth={0.7} fill="none" opacity={0.7} />
            {/* Brows — expressive pencil strokes */}
            <path d="M 38 23 Q 43 20.5 47.5 23" stroke={shade(hairColor, -10)} strokeWidth={1.3} fill="none" opacity={0.7} strokeLinecap="round" />
            <path d="M 52.5 23 Q 57 20.5 62 23" stroke={shade(hairColor, -10)} strokeWidth={1.3} fill="none" opacity={0.7} strokeLinecap="round" />
          </g>

          {/* ── FACIAL HAIR ── */}
          {avatarConfig.facialHair !== 'none' && (
            <g id="facial-hair">
              {avatarConfig.facialHair === 'stubble' && (
                <>
                  {[...Array(18)].map((_, i) => (
                    <line key={i} x1={41 + (i % 6) * 3} y1={35 + Math.floor(i / 6) * 2.5} x2={41 + (i % 6) * 3 + 0.5} y2={36 + Math.floor(i / 6) * 2.5}
                      stroke={hairColor} strokeWidth={0.4} opacity={0.25} strokeLinecap="round" />
                  ))}
                </>
              )}
              {avatarConfig.facialHair === 'full_beard' && (
                <path d="M 39 34 Q 38 46 50 49 Q 62 46 61 34" fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.4} opacity={0.6} />
              )}
              {avatarConfig.facialHair === 'short_beard' && (
                <path d="M 41 35 Q 40 43 50 45 Q 60 43 59 35" fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.4} opacity={0.5} />
              )}
              {avatarConfig.facialHair === 'goatee' && (
                <path d="M 45 36 Q 45 43 50 45 Q 55 43 55 36" fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.4} opacity={0.5} />
              )}
              {(avatarConfig.facialHair === 'handlebar' || avatarConfig.facialHair === 'pencil') && (
                <path d="M 43 34 Q 50 36.5 57 34" stroke={hairColor} strokeWidth={avatarConfig.facialHair === 'handlebar' ? 2 : 0.8} fill="none" strokeLinecap="round" />
              )}
              {avatarConfig.facialHair === 'five_oclock' && (
                <rect x={39} y={33} width={22} height={9} rx={5} fill={`url(#hatch-${uid})`} opacity={0.2} />
              )}
            </g>
          )}

          {/* ── EYEWEAR ── */}
          {eyewearColor && (
            <g id="eyewear">
              <rect x={37} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.7} stroke={strokeColor} strokeWidth={0.5} />
              <rect x={51} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.7} stroke={strokeColor} strokeWidth={0.5} />
              <line x1={49} y1={28} x2={51} y2={28} stroke={eyewearColor} strokeWidth={1} />
              {/* Lens reflections */}
              <line x1={39} y1={27} x2={42} y2={30} stroke="white" strokeWidth={0.3} opacity={0.3} />
              <line x1={53} y1={27} x2={56} y2={30} stroke="white" strokeWidth={0.3} opacity={0.3} />
            </g>
          )}

          {/* ── MASK ── */}
          {maskColor && (
            <g id="mask">
              <ellipse cx={50} cy={36} rx={14} ry={10} fill={maskColor} stroke={strokeColor} strokeWidth={0.5} opacity={0.85} />
              {/* Fabric fold sketch lines */}
              <path d="M 38 35 Q 44 37 50 35 Q 56 37 62 35" stroke={shade(maskColor, -20)} strokeWidth={0.4} fill="none" opacity={0.3} />
            </g>
          )}

          {/* ── HAIR ── */}
          <g id="hair">
            {avatarConfig.hairStyle !== 'bald' && avatarConfig.hairStyle !== 'bald_stubble' && (
              <>
                <ellipse cx={50} cy={20} rx={16} ry={12} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={strokeW * 0.8} />
                {/* Side hair */}
                <rect x={34} y={18} width={5} height={14} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                <rect x={61} y={18} width={5} height={14} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                {/* Pencil hair strand lines */}
                <path d="M 40 14 Q 45 12 50 14" stroke={hairHighlight} strokeWidth={0.4} fill="none" opacity={0.3} />
                <path d="M 42 12 Q 48 10 54 12" stroke={hairHighlight} strokeWidth={0.3} fill="none" opacity={0.2} />
                <path d="M 44 16 Q 50 14 56 16" stroke={shade(hairColor, -20)} strokeWidth={0.3} fill="none" opacity={0.2} />

                {(avatarConfig.hairStyle === 'pompadour' || avatarConfig.hairStyle === 'victory_rolls') && (
                  <ellipse cx={50} cy={13} rx={14} ry={9} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.5} />
                )}
                {(avatarConfig.hairStyle === 'long_straight' || avatarConfig.hairStyle === 'long_waves' || avatarConfig.hairStyle === 'curly_long' || avatarConfig.hairStyle === 'locs_long') && (
                  <>
                    <rect x={33} y={18} width={5} height={30} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                    <rect x={62} y={18} width={5} height={30} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                  </>
                )}
                {(avatarConfig.hairStyle === 'afro_small' || avatarConfig.hairStyle === 'afro_large') && (
                  <ellipse cx={50} cy={20} rx={avatarConfig.hairStyle === 'afro_large' ? 22 : 19} ry={avatarConfig.hairStyle === 'afro_large' ? 16 : 14} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.5} />
                )}
                {avatarConfig.hairStyle === 'mohawk' && (
                  <rect x={44} y={6} width={12} height={16} rx={4} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.5} />
                )}
                {(avatarConfig.hairStyle === 'bob' || avatarConfig.hairStyle === 'pixie') && (
                  <>
                    <rect x={33} y={18} width={5} height={16} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                    <rect x={62} y={18} width={5} height={16} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} />
                  </>
                )}
                {avatarConfig.hairStyle === 'space_buns' && (
                  <>
                    <circle cx={35} cy={16} r={6} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.5} />
                    <circle cx={65} cy={16} r={6} fill={`url(#hair-${uid})`} stroke={strokeColor} strokeWidth={0.5} />
                  </>
                )}
                {avatarConfig.hairStyle === 'high_pony' && (
                  <rect x={52} y={10} width={5} height={22} rx={2.5} fill={hairColor} stroke={strokeColor} strokeWidth={0.3} transform="rotate(30, 55, 20)" />
                )}
              </>
            )}
            {avatarConfig.hairStyle === 'bald_stubble' && (
              <ellipse cx={50} cy={20} rx={15} ry={11} fill={`url(#hatch-${uid})`} opacity={0.15} />
            )}
          </g>

          {/* ── HAT ── */}
          {hatColor && (
            <g id="hat">
              <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} stroke={strokeColor} strokeWidth={strokeW} />
              {/* Hat band */}
              <rect x={35} y={18} width={30} height={3} rx={1} fill={shade(hatColor, -25)} stroke={strokeColor} strokeWidth={0.3} />
              {/* Brim */}
              <ellipse cx={50} cy={22} rx={24} ry={3.5} fill={hatColor} stroke={strokeColor} strokeWidth={strokeW * 0.8} />
              {/* Hat detail lines */}
              <path d="M 38 12 Q 50 10 62 12" stroke={shade(hatColor, 20)} strokeWidth={0.3} fill="none" opacity={0.3} />
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

// ─── AvatarMini — simplified small version with sketch feel ───
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
  const sk = '#1a1410';

  return (
    <div style={{ width: size, height }}>
      <svg viewBox="0 0 100 133" width={size} height={height}>
        <ellipse cx={50} cy={28} rx={15} ry={17} fill={skinHex} stroke={sk} strokeWidth={0.8} />
        <ellipse cx={35.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} stroke={sk} strokeWidth={0.5} />
        <ellipse cx={64.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} stroke={sk} strokeWidth={0.5} />
        <path d="M 32 50 L 68 50 L 70 82 L 30 82 Z" fill={topColor || skinHex} stroke={sk} strokeWidth={0.8} />
        <rect x={34} y={80} width={14} height={32} rx={5} fill={skinHex} stroke={sk} strokeWidth={0.6} />
        <rect x={52} y={80} width={14} height={32} rx={5} fill={skinHex} stroke={sk} strokeWidth={0.6} />
        {avatarConfig.hairStyle !== 'bald' && (
          <ellipse cx={50} cy={20} rx={16} ry={12} fill={hairColor} stroke={sk} strokeWidth={0.6} />
        )}
        {/* Pencil-style eyes */}
        <path d="M 40 28 Q 43 26 46 28 Q 43 30 40 28 Z" fill="white" stroke={sk} strokeWidth={0.4} />
        <path d="M 54 28 Q 57 26 60 28 Q 57 30 54 28 Z" fill="white" stroke={sk} strokeWidth={0.4} />
        <circle cx={43} cy={28} r={1.2} fill="#1a1a1a" />
        <circle cx={57} cy={28} r={1.2} fill="#1a1a1a" />
        {hatColor && (
          <>
            <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} stroke={sk} strokeWidth={0.8} />
            <ellipse cx={50} cy={22} rx={24} ry={3.5} fill={hatColor} stroke={sk} strokeWidth={0.6} />
          </>
        )}
      </svg>
    </div>
  );
};

export default Avatar;
