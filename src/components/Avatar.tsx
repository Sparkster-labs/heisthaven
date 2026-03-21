import { useMemo } from 'react';
import {
  SKIN_TONES, EYE_COLORS, FACE_PRESETS, CLOTHING_ITEMS, LEGENDARY_ITEMS,
  type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED,
} from '@/lib/avatarData';
import { THEME } from '@/styles/theme';

const getItemColor = (itemId: string | null): string | null => {
  if (!itemId) return null;
  return CLOTHING_ITEMS.find(i => i.id === itemId)?.color
    || LEGENDARY_ITEMS.find(i => i.id === itemId)?.color
    || null;
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

// Face preset → geometry offsets
const getFaceGeometry = (presetId: number) => {
  const fp = FACE_PRESETS.find(p => p.id === presetId);
  if (!fp) return { jawRx: 15, jawRy: 17, noseWidth: 3, browWeight: 1.3, chinY: 44 };
  const jawMap: Record<string, [number, number]> = {
    square: [15, 16], wide: [16, 16], narrow: [13, 18], pointed: [13, 17],
    oval: [14, 17], strong: [15, 16], soft: [14, 17], angular: [14, 16],
    heart: [15, 17], rounded: [15, 17], round: [15, 16],
  };
  const [rx, ry] = jawMap[fp.jaw] || [15, 17];
  const noseMap: Record<string, number> = { straight: 2.5, crooked: 3, sharp: 2, flat: 3.5, long: 2, button: 2, small: 1.8, defined: 2.5, upturned: 2.5, soft: 3, roman: 3, wide: 3.5, pointed: 2 };
  const browMap: Record<string, number> = { heavy: 1.6, thick: 1.5, arched: 1.2, flat: 1.0, furrowed: 1.4, bold: 1.4, fine: 0.8, dramatic: 1.5, low: 1.1, straight: 1.0, natural: 1.1, strong: 1.5, curved: 1.2, thin: 0.7 };
  return { jawRx: rx, jawRy: ry, noseWidth: noseMap[fp.nose] || 2.5, browWeight: browMap[fp.brow] || 1.3, chinY: fp.jaw === 'pointed' || fp.jaw === 'narrow' ? 46 : 44 };
};

const Avatar = ({
  avatarConfig = DEFAULT_AVATAR,
  equippedItems = DEFAULT_EQUIPPED,
  pose = 'the_lean',
  size = 240,
  showGlow = false,
}: AvatarProps) => {
  const skinHex = useMemo(() => SKIN_TONES.find(t => t.id === avatarConfig.skinTone)?.hex || SKIN_TONES[0].hex, [avatarConfig.skinTone]);
  const skinShadow = useMemo(() => shade(skinHex, -30), [skinHex]);
  const skinHighlight = useMemo(() => shade(skinHex, 25), [skinHex]);
  const eyeHex = useMemo(() => EYE_COLORS.find(e => e.id === avatarConfig.eyeColor)?.hex || EYE_COLORS[0].hex, [avatarConfig.eyeColor]);
  const hairColor = avatarConfig.hairColor || '#1a1a1a';
  const hairHighlight = useMemo(() => shade(hairColor, 30), [hairColor]);
  const face = useMemo(() => getFaceGeometry(avatarConfig.facePreset), [avatarConfig.facePreset]);
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
      case 'walking': return 'translate(2, 0) rotate(1, 50, 80)';
      case 'confident': return 'scale(1.02) translate(-1, -1)';
      case 'menacing': return 'rotate(-1, 50, 66) translate(0, -2)';
      default: return '';
    }
  }, [pose]);

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const sk = '#1a1410';
  const sw = 0.7;

  return (
    <div style={{
      position: 'relative', width: size, height,
      ...(showGlow ? { animation: 'avatarGlow 2s ease-in-out infinite', borderRadius: 8 } : {}),
    }}>
      <svg viewBox="0 0 100 133" width={size} height={height} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`sketch-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="5" seed={42} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <pattern id={`hatch-${uid}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3.5" stroke={sk} strokeWidth="0.25" opacity="0.12" />
          </pattern>
          <pattern id={`hatch2-${uid}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="3.5" stroke={sk} strokeWidth="0.2" opacity="0.08" />
          </pattern>
          <radialGradient id={`skin-${uid}`} cx="42%" cy="32%" r="65%">
            <stop offset="0%" stopColor={skinHighlight} />
            <stop offset="60%" stopColor={skinHex} />
            <stop offset="100%" stopColor={skinShadow} />
          </radialGradient>
          <linearGradient id={`hair-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={shade(hairColor, -20)} />
          </linearGradient>
        </defs>

        <g transform={poseTransform} filter={`url(#sketch-${uid})`}>
          {/* Idle breathing animation applied to body group */}
          <g className={`avatar-idle-${uid}`}>
            {/* ── BODY ── */}
            <g id="body">
              {/* Head — uses face geometry */}
              <ellipse cx={50} cy={28} rx={face.jawRx} ry={face.jawRy} fill={`url(#skin-${uid})`} stroke={sk} strokeWidth={sw} />
              <ellipse cx={55} cy={32} rx={7} ry={9} fill={`url(#hatch-${uid})`} opacity={0.25} />
              {/* Ears */}
              <ellipse cx={50 - face.jawRx + 0.5} cy={30} rx={2.8} ry={4} fill={skinHex} stroke={sk} strokeWidth={sw * 0.7} />
              <ellipse cx={50 + face.jawRx - 0.5} cy={30} rx={2.8} ry={4} fill={skinHex} stroke={sk} strokeWidth={sw * 0.7} />
              <path d={`M ${50 - face.jawRx + 1} 28 Q ${50 - face.jawRx + 2.5} 30 ${50 - face.jawRx + 1.5} 32`} stroke={skinShadow} strokeWidth={0.35} fill="none" />
              {/* Neck */}
              <rect x={44} y={43} width={12} height={8} rx={3} fill={skinHex} stroke={sk} strokeWidth={sw * 0.5} />
              {/* Torso — slightly better proportions */}
              <path d="M 33 50 Q 31 48 35 46 L 65 46 Q 69 48 67 50 L 69 82 L 31 82 Z" fill={skinHex} stroke={sk} strokeWidth={sw} />
              <path d="M 33 50 Q 31 48 35 46 L 50 46 L 50 82 L 31 82 Z" fill={`url(#hatch2-${uid})`} opacity={0.15} />
              {/* Arms — tapered */}
              <path d="M 17 49 Q 15 49 15 55 L 15 76 Q 15 82 19 82 L 27 82 Q 31 82 31 76 L 31 55 Q 31 49 27 49 Z" fill={skinHex} stroke={sk} strokeWidth={sw} />
              <path d="M 69 49 Q 73 49 73 55 L 73 76 Q 73 82 69 82 L 85 82 Q 85 82 85 76 L 85 55 Q 85 49 81 49 Z" fill={skinHex} stroke={sk} strokeWidth={sw} />
              {/* Simpler arms */}
              <rect x={17} y={49} width={13} height={30} rx={6.5} fill={skinHex} stroke={sk} strokeWidth={sw} />
              <rect x={70} y={49} width={13} height={30} rx={6.5} fill={skinHex} stroke={sk} strokeWidth={sw} />
              {/* Arm contour */}
              <path d="M 23 54 Q 21 64 23 76" stroke={skinShadow} strokeWidth={0.35} fill="none" opacity={0.25} />
              <path d="M 77 54 Q 79 64 77 76" stroke={skinShadow} strokeWidth={0.35} fill="none" opacity={0.25} />
              {/* Hands */}
              <ellipse cx={23} cy={81} rx={5} ry={3.5} fill={skinHex} stroke={sk} strokeWidth={sw * 0.6} />
              <ellipse cx={77} cy={81} rx={5} ry={3.5} fill={skinHex} stroke={sk} strokeWidth={sw * 0.6} />
              {/* Fingers */}
              <path d="M 19 80 L 18 78 M 21 79 L 20 77" stroke={sk} strokeWidth={0.25} opacity={0.35} />
              <path d="M 81 80 L 82 78" stroke={sk} strokeWidth={0.25} opacity={0.35} />
              {/* Legs */}
              <rect x={35} y={80} width={13} height={31} rx={5} fill={skinHex} stroke={sk} strokeWidth={sw} />
              <rect x={52} y={80} width={13} height={31} rx={5} fill={skinHex} stroke={sk} strokeWidth={sw} />
              {/* Knees */}
              <path d="M 39 96 Q 41.5 97 44 96" stroke={skinShadow} strokeWidth={0.35} fill="none" opacity={0.3} />
              <path d="M 56 96 Q 58.5 97 61 96" stroke={skinShadow} strokeWidth={0.35} fill="none" opacity={0.3} />
            </g>

            {/* ── BOTTOMS ── */}
            {bottomsColor && (
              <g id="bottoms">
                <rect x={35} y={80} width={13} height={27} rx={5} fill={bottomsColor} stroke={sk} strokeWidth={sw} />
                <rect x={52} y={80} width={13} height={27} rx={5} fill={bottomsColor} stroke={sk} strokeWidth={sw} />
                <path d="M 41.5 82 L 41 105" stroke={shade(bottomsColor, 25)} strokeWidth={0.4} opacity={0.2} />
                <path d="M 58.5 82 L 58 105" stroke={shade(bottomsColor, 25)} strokeWidth={0.4} opacity={0.2} />
                <rect x={35} y={80} width={6.5} height={27} rx={5} fill={`url(#hatch-${uid})`} opacity={0.12} />
                <rect x={31} y={78} width={38} height={4} rx={2} fill={shade(bottomsColor, -20)} stroke={sk} strokeWidth={0.35} />
              </g>
            )}

            {/* ── SHOES ── */}
            {shoesColor && (
              <g id="shoes">
                <path d="M 32 107 L 32 111 Q 32 114 35 114 L 50 114 Q 51 114 51 111 L 51 109 Q 51 107 48 107 Z" fill={shoesColor} stroke={sk} strokeWidth={sw} />
                <path d="M 49 107 L 49 111 Q 49 114 52 114 L 67 114 Q 69 114 69 111 L 69 109 Q 69 107 66 107 Z" fill={shoesColor} stroke={sk} strokeWidth={sw} />
                <line x1={33} y1={113} x2={50} y2={113} stroke={sk} strokeWidth={0.4} opacity={0.35} />
                <line x1={50} y1={113} x2={68} y2={113} stroke={sk} strokeWidth={0.4} opacity={0.35} />
              </g>
            )}

            {/* ── TOP ── */}
            {topColor && !fullOutfitColor && (
              <g id="top">
                <path d="M 33 50 Q 31 48 35 46 L 65 46 Q 69 48 67 50 L 69 82 L 31 82 Z" fill={topColor} stroke={sk} strokeWidth={sw} />
                <path d="M 43 46 L 50 53 L 57 46" stroke={shade(topColor, -25)} strokeWidth={0.9} fill="none" />
                <path d="M 36 55 Q 40 57 38 62" stroke={shade(topColor, -15)} strokeWidth={0.35} fill="none" opacity={0.35} />
                <path d="M 64 55 Q 60 57 62 62" stroke={shade(topColor, -15)} strokeWidth={0.35} fill="none" opacity={0.35} />
                <path d="M 33 50 Q 31 48 35 46 L 44 46 L 44 82 L 31 82 Z" fill={`url(#hatch-${uid})`} opacity={0.1} />
                <rect x={17} y={49} width={13} height={21} rx={6.5} fill={topColor} stroke={sk} strokeWidth={sw} />
                <rect x={70} y={49} width={13} height={21} rx={6.5} fill={topColor} stroke={sk} strokeWidth={sw} />
              </g>
            )}

            {/* ── FULL OUTFIT ── */}
            {fullOutfitColor && (
              <g id="fulloutfit">
                <path d="M 31 46 L 69 46 L 71 82 L 29 82 Z" fill={fullOutfitColor} stroke={sk} strokeWidth={sw} />
                <rect x={35} y={80} width={13} height={27} rx={5} fill={fullOutfitColor} stroke={sk} strokeWidth={sw} />
                <rect x={52} y={80} width={13} height={27} rx={5} fill={fullOutfitColor} stroke={sk} strokeWidth={sw} />
                <rect x={17} y={49} width={13} height={23} rx={6.5} fill={fullOutfitColor} stroke={sk} strokeWidth={sw} />
                <rect x={70} y={49} width={13} height={23} rx={6.5} fill={fullOutfitColor} stroke={sk} strokeWidth={sw} />
                <path d="M 44 46 L 50 57 L 56 46" stroke={shade(fullOutfitColor, -25)} strokeWidth={0.9} fill="none" />
                <circle cx={50} cy={60} r={1.1} fill="none" stroke={sk} strokeWidth={0.4} />
                <circle cx={50} cy={66} r={1.1} fill="none" stroke={sk} strokeWidth={0.4} />
                <circle cx={50} cy={72} r={1.1} fill="none" stroke={sk} strokeWidth={0.4} />
                <path d="M 31 46 L 50 46 L 50 82 L 29 82 Z" fill={`url(#hatch-${uid})`} opacity={0.08} />
              </g>
            )}

            {/* ── COAT ── */}
            {coatColor && !fullOutfitColor && (
              <g id="coat">
                <path d="M 27 46 L 73 46 L 75 86 L 25 86 Z" fill={coatColor} stroke={sk} strokeWidth={sw} />
                <path d="M 41 46 L 50 59 L 59 46" stroke={shade(coatColor, -20)} strokeWidth={0.9} fill="none" />
                <circle cx={50} cy={62} r={1.2} fill="none" stroke={sk} strokeWidth={0.4} />
                <circle cx={50} cy={70} r={1.2} fill="none" stroke={sk} strokeWidth={0.4} />
                <line x1={33} y1={70} x2={40} y2={70} stroke={sk} strokeWidth={0.35} opacity={0.4} />
                <line x1={60} y1={70} x2={67} y2={70} stroke={sk} strokeWidth={0.35} opacity={0.4} />
                <rect x={15} y={48} width={13} height={27} rx={6.5} fill={coatColor} stroke={sk} strokeWidth={sw} />
                <rect x={72} y={48} width={13} height={27} rx={6.5} fill={coatColor} stroke={sk} strokeWidth={sw} />
                <path d="M 27 46 L 50 46 L 50 86 L 25 86 Z" fill={`url(#hatch-${uid})`} opacity={0.08} />
              </g>
            )}

            {/* ── GLOVES ── */}
            {glovesColor && (
              <g id="gloves">
                <ellipse cx={23} cy={81} rx={5.5} ry={4} fill={glovesColor} stroke={sk} strokeWidth={sw * 0.6} />
                <ellipse cx={77} cy={81} rx={5.5} ry={4} fill={glovesColor} stroke={sk} strokeWidth={sw * 0.6} />
              </g>
            )}

            {/* ── ACCESSORY ── */}
            {accessoryColor && (
              <g id="accessory">
                <circle cx={50} cy={52} r={2.8} fill="none" stroke={accessoryColor} strokeWidth={0.9} />
                <circle cx={50} cy={52} r={0.9} fill={accessoryColor} />
                <rect x={49.2} y={52} width={1.6} height={7} rx={0.8} fill="none" stroke={accessoryColor} strokeWidth={0.5} />
              </g>
            )}

            {/* ── WEAPON ── */}
            {weaponColor && (
              <g id="weapon" transform="rotate(15, 74, 74)">
                <rect x={72} y={62} width={3.5} height={19} rx={1} fill={weaponColor} stroke={sk} strokeWidth={0.4} />
                <rect x={70} y={60} width={7.5} height={3.5} rx={1} fill={weaponColor} stroke={sk} strokeWidth={0.4} />
                <circle cx={73.75} cy={60} r={1.8} fill="none" stroke={sk} strokeWidth={0.35} />
              </g>
            )}

            {/* ── FACE ── */}
            <g id="face">
              <ellipse cx={50} cy={30} rx={face.jawRx - 2} ry={face.jawRy - 2} fill={`url(#skin-${uid})`} />
              {/* Nose — varies by width */}
              <path d={`M 49 27 L ${50 - face.noseWidth / 2} 33 Q 50 35 ${50 + face.noseWidth / 2} 33 L 51 27`} fill="none" stroke={skinShadow} strokeWidth={0.45} opacity={0.45} />
              <circle cx={50 - face.noseWidth / 3} cy={33.5} r={0.45} fill={skinShadow} opacity={0.25} />
              <circle cx={50 + face.noseWidth / 3} cy={33.5} r={0.45} fill={skinShadow} opacity={0.25} />
              {/* Mouth */}
              <path d="M 45 38 Q 47.5 39.5 50 39.5 Q 52.5 39.5 55 38" stroke={skinShadow} strokeWidth={0.55} fill="none" opacity={0.45} />
              <path d="M 46 37 Q 48 36 50 37 Q 52 36 54 37" stroke={skinShadow} strokeWidth={0.25} fill="none" opacity={0.25} />
              {/* Chin */}
              <path d={`M 44 42 Q 50 ${face.chinY} 56 42`} stroke={skinShadow} strokeWidth={0.25} fill="none" opacity={0.12} />
              {/* Jawline */}
              <path d={`M ${50 - face.jawRx + 3} 36 Q ${50 - face.jawRx / 2 + 40 - 40} 43 50 ${face.chinY} Q ${50 + face.jawRx / 2} 43 ${50 + face.jawRx - 3} 36`} stroke={sk} strokeWidth={0.25} fill="none" opacity={0.12} />
              {/* Cheek contour */}
              <path d="M 39 30 L 41 33 M 40 31 L 42 34" stroke={skinShadow} strokeWidth={0.18} opacity={0.1} />
              <path d="M 61 30 L 59 33 M 60 31 L 58 34" stroke={skinShadow} strokeWidth={0.18} opacity={0.1} />
            </g>

            {/* ── EYES ── */}
            <g id="eyes">
              <path d="M 39.5 28 Q 43 25 46.5 28 Q 43 30.5 39.5 28 Z" fill="white" stroke={sk} strokeWidth={0.45} />
              <path d="M 53.5 28 Q 57 25 60.5 28 Q 57 30.5 53.5 28 Z" fill="white" stroke={sk} strokeWidth={0.45} />
              {/* Iris — slightly larger for expressiveness */}
              <circle cx={43} cy={28} r={2.2} fill={eyeHex} />
              <circle cx={57} cy={28} r={2.2} fill={eyeHex} />
              {/* Iris ring detail */}
              <circle cx={43} cy={28} r={2.2} fill="none" stroke={shade(eyeHex, -30)} strokeWidth={0.3} opacity={0.3} />
              <circle cx={57} cy={28} r={2.2} fill="none" stroke={shade(eyeHex, -30)} strokeWidth={0.3} opacity={0.3} />
              {/* Pupil */}
              <circle cx={43} cy={28} r={1.1} fill="#0a0a0a" />
              <circle cx={57} cy={28} r={1.1} fill="#0a0a0a" />
              {/* Catch light — two per eye for life */}
              <circle cx={42} cy={27} r={0.65} fill="white" opacity={0.85} />
              <circle cx={44} cy={27.5} r={0.3} fill="white" opacity={0.5} />
              <circle cx={56} cy={27} r={0.65} fill="white" opacity={0.85} />
              <circle cx={58} cy={27.5} r={0.3} fill="white" opacity={0.5} />
              {/* Lashes */}
              <path d="M 39 26.5 Q 43 24.5 47 26.5" stroke={sk} strokeWidth={0.65} fill="none" opacity={0.65} />
              <path d="M 53 26.5 Q 57 24.5 61 26.5" stroke={sk} strokeWidth={0.65} fill="none" opacity={0.65} />
              {/* Brows — weight from face preset */}
              <path d="M 38 23 Q 43 20.5 47.5 23" stroke={shade(hairColor, -10)} strokeWidth={face.browWeight} fill="none" opacity={0.7} strokeLinecap="round" />
              <path d="M 52.5 23 Q 57 20.5 62 23" stroke={shade(hairColor, -10)} strokeWidth={face.browWeight} fill="none" opacity={0.7} strokeLinecap="round" />
              {/* Under-eye detail */}
              <path d="M 40 30 Q 43 31 46 30" stroke={skinShadow} strokeWidth={0.2} fill="none" opacity={0.15} />
              <path d="M 54 30 Q 57 31 60 30" stroke={skinShadow} strokeWidth={0.2} fill="none" opacity={0.15} />
            </g>

            {/* ── FACIAL HAIR ── */}
            {avatarConfig.facialHair !== 'none' && (
              <g id="facial-hair">
                {avatarConfig.facialHair === 'stubble' && (
                  <>
                    {[...Array(22)].map((_, i) => (
                      <line key={i} x1={40 + (i % 7) * 2.8} y1={35 + Math.floor(i / 7) * 2.2} x2={40 + (i % 7) * 2.8 + 0.4} y2={35.8 + Math.floor(i / 7) * 2.2}
                        stroke={hairColor} strokeWidth={0.35} opacity={0.22} strokeLinecap="round" />
                    ))}
                  </>
                )}
                {avatarConfig.facialHair === 'full_beard' && (
                  <path d="M 39 34 Q 38 46 50 49 Q 62 46 61 34" fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.35} opacity={0.55} />
                )}
                {avatarConfig.facialHair === 'short_beard' && (
                  <path d="M 41 35 Q 40 43 50 45 Q 60 43 59 35" fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.35} opacity={0.45} />
                )}
                {avatarConfig.facialHair === 'goatee' && (
                  <path d="M 45 36 Q 45 43 50 45 Q 55 43 55 36" fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.35} opacity={0.45} />
                )}
                {(avatarConfig.facialHair === 'handlebar' || avatarConfig.facialHair === 'pencil') && (
                  <path d="M 43 34 Q 50 36.5 57 34" stroke={hairColor} strokeWidth={avatarConfig.facialHair === 'handlebar' ? 1.8 : 0.7} fill="none" strokeLinecap="round" />
                )}
                {avatarConfig.facialHair === 'five_oclock' && (
                  <rect x={39} y={33} width={22} height={9} rx={5} fill={`url(#hatch-${uid})`} opacity={0.18} />
                )}
              </g>
            )}

            {/* ── EYEWEAR ── */}
            {eyewearColor && (
              <g id="eyewear">
                <rect x={37} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.65} stroke={sk} strokeWidth={0.45} />
                <rect x={51} y={25} width={12} height={7} rx={3} fill={eyewearColor} opacity={0.65} stroke={sk} strokeWidth={0.45} />
                <line x1={49} y1={28} x2={51} y2={28} stroke={eyewearColor} strokeWidth={0.9} />
                <line x1={39} y1={27} x2={42} y2={30} stroke="white" strokeWidth={0.25} opacity={0.25} />
                <line x1={53} y1={27} x2={56} y2={30} stroke="white" strokeWidth={0.25} opacity={0.25} />
              </g>
            )}

            {/* ── MASK ── */}
            {maskColor && (
              <g id="mask">
                <ellipse cx={50} cy={36} rx={face.jawRx - 1} ry={10} fill={maskColor} stroke={sk} strokeWidth={0.45} opacity={0.82} />
                <path d={`M ${50 - face.jawRx + 3} 35 Q ${50 - face.jawRx / 2 + 6} 37 50 35 Q ${50 + face.jawRx / 2 - 6} 37 ${50 + face.jawRx - 3} 35`} stroke={shade(maskColor, -20)} strokeWidth={0.35} fill="none" opacity={0.25} />
              </g>
            )}

            {/* ── HAIR ── */}
            <g id="hair">
              {avatarConfig.hairStyle !== 'bald' && avatarConfig.hairStyle !== 'bald_stubble' && (
                <>
                  <ellipse cx={50} cy={20} rx={face.jawRx + 1} ry={12} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={sw * 0.7} />
                  {/* Side hair */}
                  <rect x={50 - face.jawRx - 1} y={18} width={4.5} height={13} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                  <rect x={50 + face.jawRx - 3.5} y={18} width={4.5} height={13} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                  {/* Hair strands */}
                  <path d="M 40 14 Q 45 12 50 14" stroke={hairHighlight} strokeWidth={0.35} fill="none" opacity={0.25} />
                  <path d="M 42 12 Q 48 10 54 12" stroke={hairHighlight} strokeWidth={0.25} fill="none" opacity={0.18} />
                  <path d="M 44 16 Q 50 14 56 16" stroke={shade(hairColor, -20)} strokeWidth={0.25} fill="none" opacity={0.15} />
                  {/* Extra strand details */}
                  <path d="M 38 16 Q 42 13 46 15" stroke={hairHighlight} strokeWidth={0.2} fill="none" opacity={0.15} />

                  {(avatarConfig.hairStyle === 'pompadour' || avatarConfig.hairStyle === 'victory_rolls') && (
                    <ellipse cx={50} cy={13} rx={14} ry={9} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                  )}
                  {(avatarConfig.hairStyle === 'long_straight' || avatarConfig.hairStyle === 'long_waves' || avatarConfig.hairStyle === 'curly_long' || avatarConfig.hairStyle === 'locs_long') && (
                    <>
                      <rect x={50 - face.jawRx - 2} y={18} width={4.5} height={28} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                      <rect x={50 + face.jawRx - 2.5} y={18} width={4.5} height={28} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                    </>
                  )}
                  {(avatarConfig.hairStyle === 'afro_small' || avatarConfig.hairStyle === 'afro_large') && (
                    <ellipse cx={50} cy={20} rx={avatarConfig.hairStyle === 'afro_large' ? 22 : 19} ry={avatarConfig.hairStyle === 'afro_large' ? 16 : 14} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                  )}
                  {avatarConfig.hairStyle === 'mohawk' && (
                    <rect x={44} y={6} width={12} height={16} rx={4} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                  )}
                  {(avatarConfig.hairStyle === 'bob' || avatarConfig.hairStyle === 'pixie') && (
                    <>
                      <rect x={50 - face.jawRx - 2} y={18} width={4.5} height={15} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                      <rect x={50 + face.jawRx - 2.5} y={18} width={4.5} height={15} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} />
                    </>
                  )}
                  {avatarConfig.hairStyle === 'space_buns' && (
                    <>
                      <circle cx={50 - face.jawRx} cy={16} r={5.5} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                      <circle cx={50 + face.jawRx} cy={16} r={5.5} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                    </>
                  )}
                  {avatarConfig.hairStyle === 'high_pony' && (
                    <rect x={52} y={10} width={4.5} height={21} rx={2.2} fill={hairColor} stroke={sk} strokeWidth={0.25} transform="rotate(30, 55, 20)" />
                  )}
                  {avatarConfig.hairStyle === 'cornrows' && (
                    <>
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1={40 + i * 5} y1={10} x2={40 + i * 5} y2={30} stroke={hairColor} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
                      ))}
                    </>
                  )}
                  {avatarConfig.hairStyle === 'natural_coils' && (
                    <ellipse cx={50} cy={19} rx={17} ry={13} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.45} />
                  )}
                  {avatarConfig.hairStyle === 'pin_curls' && (
                    <>
                      {[38, 44, 50, 56, 62].map(cx => (
                        <circle key={cx} cx={cx} cy={14} r={3.5} fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.3} />
                      ))}
                    </>
                  )}
                  {avatarConfig.hairStyle === 'braided_updo' && (
                    <path d="M 38 14 Q 44 8 50 12 Q 56 8 62 14 Q 58 10 50 8 Q 42 10 38 14" fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.35} />
                  )}
                  {avatarConfig.hairStyle === 'side_swept' && (
                    <path d="M 34 18 Q 40 10 60 14 L 62 20" fill={`url(#hair-${uid})`} stroke={sk} strokeWidth={0.35} />
                  )}
                  {avatarConfig.hairStyle === 'shaved_side' && (
                    <>
                      <rect x={50 + face.jawRx - 3} y={14} width={5} height={18} rx={2} fill={`url(#hatch-${uid})`} opacity={0.2} />
                    </>
                  )}
                </>
              )}
              {avatarConfig.hairStyle === 'bald_stubble' && (
                <ellipse cx={50} cy={20} rx={face.jawRx} ry={11} fill={`url(#hatch-${uid})`} opacity={0.12} />
              )}
            </g>

            {/* ── HAT ── */}
            {hatColor && (
              <g id="hat">
                <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} stroke={sk} strokeWidth={sw} />
                <rect x={35} y={18} width={30} height={2.5} rx={1} fill={shade(hatColor, -25)} stroke={sk} strokeWidth={0.25} />
                <ellipse cx={50} cy={22} rx={24} ry={3.2} fill={hatColor} stroke={sk} strokeWidth={sw * 0.75} />
                <path d="M 38 12 Q 50 10 62 12" stroke={shade(hatColor, 20)} strokeWidth={0.25} fill="none" opacity={0.25} />
              </g>
            )}
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 15px ${THEME.colors.gold}40; }
          50% { box-shadow: 0 0 30px ${THEME.colors.gold}80; }
        }
        @keyframes avatarBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5px); }
        }
        .avatar-idle-${uid} {
          animation: avatarBreathe 3s ease-in-out infinite;
          transform-origin: 50% 100%;
        }
      `}</style>
    </div>
  );
};

// ─── AvatarMini ───
export const AvatarMini = ({
  avatarConfig = DEFAULT_AVATAR,
  equippedItems = DEFAULT_EQUIPPED,
  size = 48,
}: { avatarConfig?: AvatarConfig; equippedItems?: EquippedItems; size?: number }) => {
  const skinHex = SKIN_TONES.find(t => t.id === avatarConfig.skinTone)?.hex || SKIN_TONES[0].hex;
  const hairColor = avatarConfig.hairColor || '#1a1a1a';
  const topColor = getItemColor(equippedItems.fullOutfit) || getItemColor(equippedItems.coat) || getItemColor(equippedItems.top);
  const hatColor = getItemColor(equippedItems.hat);
  const eyeHex = EYE_COLORS.find(e => e.id === avatarConfig.eyeColor)?.hex || EYE_COLORS[0].hex;
  const height = size * 1.33;
  const s = '#1a1410';

  return (
    <div style={{ width: size, height }}>
      <svg viewBox="0 0 100 133" width={size} height={height}>
        <ellipse cx={50} cy={28} rx={15} ry={17} fill={skinHex} stroke={s} strokeWidth={0.7} />
        <ellipse cx={35.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} stroke={s} strokeWidth={0.45} />
        <ellipse cx={64.5} cy={30} rx={2.5} ry={3.5} fill={skinHex} stroke={s} strokeWidth={0.45} />
        <path d="M 33 50 L 67 50 L 69 82 L 31 82 Z" fill={topColor || skinHex} stroke={s} strokeWidth={0.7} />
        <rect x={35} y={80} width={13} height={31} rx={5} fill={skinHex} stroke={s} strokeWidth={0.5} />
        <rect x={52} y={80} width={13} height={31} rx={5} fill={skinHex} stroke={s} strokeWidth={0.5} />
        {avatarConfig.hairStyle !== 'bald' && (
          <ellipse cx={50} cy={20} rx={16} ry={12} fill={hairColor} stroke={s} strokeWidth={0.5} />
        )}
        <path d="M 40 28 Q 43 26 46 28 Q 43 30 40 28 Z" fill="white" stroke={s} strokeWidth={0.35} />
        <path d="M 54 28 Q 57 26 60 28 Q 57 30 54 28 Z" fill="white" stroke={s} strokeWidth={0.35} />
        <circle cx={43} cy={28} r={1.3} fill={eyeHex} />
        <circle cx={57} cy={28} r={1.3} fill={eyeHex} />
        <circle cx={43} cy={28} r={0.6} fill="#0a0a0a" />
        <circle cx={57} cy={28} r={0.6} fill="#0a0a0a" />
        {hatColor && (
          <>
            <rect x={35} y={7} width={30} height={14} rx={4} fill={hatColor} stroke={s} strokeWidth={0.7} />
            <ellipse cx={50} cy={22} rx={24} ry={3.2} fill={hatColor} stroke={s} strokeWidth={0.5} />
          </>
        )}
      </svg>
    </div>
  );
};

export default Avatar;
