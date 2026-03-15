/**
 * ItemThumbnail — renders a category-specific SVG icon for clothing items.
 * Shows a stylized silhouette of the item type with the item's color.
 */

interface ItemThumbnailProps {
  category: string;
  color: string;
  size?: number;
  goldAccent?: boolean;
}

const ItemThumbnail = ({ category, color, size = 56, goldAccent = false }: ItemThumbnailProps) => {
  const accentColor = goldAccent ? '#C49A3C' : '#ffffff18';
  const bg = '#13101A';

  return (
    <svg viewBox="0 0 56 56" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`glow-${category}-${color.replace('#','')}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={bg} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sheen-${category}-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="56" height="56" rx="6" fill={bg} />
      <rect width="56" height="56" rx="6" fill={`url(#glow-${category}-${color.replace('#','')})`} />

      {/* Category-specific icon */}
      <g transform="translate(28, 28)">
        {category === 'hat' && (
          <g>
            {/* Hat crown */}
            <rect x={-12} y={-8} width={24} height={12} rx={3} fill={color} />
            {/* Hat brim */}
            <ellipse cx={0} cy={4} rx={18} ry={4} fill={color} />
            {/* Band */}
            <rect x={-12} y={-1} width={24} height={2.5} rx={1} fill={accentColor} opacity={0.6} />
            {/* Sheen */}
            <rect x={-12} y={-8} width={24} height={12} rx={3} fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}

        {category === 'mask' && (
          <g>
            {/* Mask shape */}
            <path d="M -16 -4 Q -16 -12 -6 -12 L 6 -12 Q 16 -12 16 -4 L 16 4 Q 16 12 6 12 L -6 12 Q -16 12 -16 4 Z" fill={color} />
            {/* Eye holes */}
            <ellipse cx={-7} cy={-2} rx={4} ry={3} fill={bg} />
            <ellipse cx={7} cy={-2} rx={4} ry={3} fill={bg} />
            {/* Nose bridge */}
            <path d="M -2 -2 L 0 4 L 2 -2" stroke={accentColor} strokeWidth={0.8} fill="none" opacity={0.5} />
            {/* Sheen */}
            <path d="M -16 -4 Q -16 -12 -6 -12 L 6 -12 Q 16 -12 16 -4 L 16 4 Q 16 12 6 12 L -6 12 Q -16 12 -16 4 Z" fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}

        {category === 'eyewear' && (
          <g>
            {/* Left lens */}
            <rect x={-18} y={-5} width={14} height={10} rx={3} fill={color} />
            {/* Right lens */}
            <rect x={4} y={-5} width={14} height={10} rx={3} fill={color} />
            {/* Bridge */}
            <path d="M -4 0 Q 0 -3 4 0" stroke={color} strokeWidth={1.5} fill="none" />
            {/* Temple arms */}
            <line x1={-18} y1={-3} x2={-22} y2={-6} stroke={color} strokeWidth={1.2} />
            <line x1={18} y1={-3} x2={22} y2={-6} stroke={color} strokeWidth={1.2} />
            {/* Lens reflection */}
            <line x1={-15} y1={-3} x2={-10} y2={2} stroke="white" strokeWidth={0.5} opacity={0.3} />
            <line x1={7} y1={-3} x2={12} y2={2} stroke="white" strokeWidth={0.5} opacity={0.3} />
          </g>
        )}

        {category === 'top' && (
          <g>
            {/* Torso shape */}
            <path d="M -14 -12 L -10 -16 L 10 -16 L 14 -12 L 14 14 L -14 14 Z" fill={color} />
            {/* Collar/V-neck */}
            <path d="M -6 -16 L 0 -8 L 6 -16" stroke={bg} strokeWidth={1.5} fill="none" />
            {/* Sleeve hints */}
            <rect x={-20} y={-12} width={8} height={14} rx={3} fill={color} opacity={0.85} />
            <rect x={12} y={-12} width={8} height={14} rx={3} fill={color} opacity={0.85} />
            {/* Sheen */}
            <path d="M -14 -12 L -10 -16 L 10 -16 L 14 -12 L 14 14 L -14 14 Z" fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}

        {category === 'coat' && (
          <g>
            {/* Coat body */}
            <path d="M -16 -14 L -12 -18 L 12 -18 L 16 -14 L 18 16 L -18 16 Z" fill={color} />
            {/* Lapels */}
            <path d="M -6 -18 L -2 -6 L 0 -10 L 2 -6 L 6 -18" stroke={bg} strokeWidth={1.2} fill="none" />
            {/* Buttons */}
            <circle cx={0} cy={-2} r={1.2} fill={accentColor} opacity={0.7} />
            <circle cx={0} cy={4} r={1.2} fill={accentColor} opacity={0.7} />
            <circle cx={0} cy={10} r={1.2} fill={accentColor} opacity={0.7} />
            {/* Sleeve */}
            <rect x={-22} y={-14} width={8} height={18} rx={3} fill={color} opacity={0.85} />
            <rect x={14} y={-14} width={8} height={18} rx={3} fill={color} opacity={0.85} />
            {/* Sheen */}
            <path d="M -16 -14 L -12 -18 L 12 -18 L 16 -14 L 18 16 L -18 16 Z" fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}

        {category === 'bottoms' && (
          <g>
            {/* Waistband */}
            <rect x={-14} y={-16} width={28} height={6} rx={2} fill={color} />
            {/* Left leg */}
            <path d="M -14 -10 L -12 16 L -2 16 L 0 -10 Z" fill={color} />
            {/* Right leg */}
            <path d="M 0 -10 L 2 16 L 12 16 L 14 -10 Z" fill={color} />
            {/* Belt buckle */}
            <rect x={-3} y={-15} width={6} height={4} rx={1} fill={accentColor} opacity={0.5} />
            {/* Crease lines */}
            <line x1={-7} y1={-4} x2={-7} y2={14} stroke="white" strokeWidth={0.3} opacity={0.15} />
            <line x1={7} y1={-4} x2={7} y2={14} stroke="white" strokeWidth={0.3} opacity={0.15} />
          </g>
        )}

        {category === 'shoes' && (
          <g>
            {/* Left shoe */}
            <path d="M -20 -2 L -20 4 Q -20 8 -16 8 L -2 8 Q 2 8 2 4 L 2 2 Q 2 -2 -2 -2 Z" fill={color} />
            {/* Right shoe */}
            <path d="M 4 -2 L 4 4 Q 4 8 8 8 L 22 8 Q 26 8 26 4 L 26 2 Q 26 -2 22 -2 Z" fill={color} />
            {/* Sole lines */}
            <line x1={-18} y1={7} x2={0} y2={7} stroke={bg} strokeWidth={0.8} opacity={0.5} />
            <line x1={6} y1={7} x2={24} y2={7} stroke={bg} strokeWidth={0.8} opacity={0.5} />
            {/* Sheen */}
            <ellipse cx={-10} cy={1} rx={6} ry={2} fill="white" opacity={0.08} />
            <ellipse cx={14} cy={1} rx={6} ry={2} fill="white" opacity={0.08} />
          </g>
        )}

        {category === 'gloves' && (
          <g>
            {/* Left glove */}
            <path d="M -18 4 L -18 -8 Q -18 -12 -14 -12 L -8 -12 Q -4 -12 -4 -8 L -4 4 Q -4 8 -8 8 L -14 8 Q -18 8 -18 4 Z" fill={color} />
            {/* Right glove */}
            <path d="M 4 4 L 4 -8 Q 4 -12 8 -12 L 14 -12 Q 18 -12 18 -8 L 18 4 Q 18 8 14 8 L 8 8 Q 4 8 4 4 Z" fill={color} />
            {/* Finger lines (left) */}
            <line x1={-15} y1={-12} x2={-15} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            <line x1={-11} y1={-12} x2={-11} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            <line x1={-7} y1={-12} x2={-7} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            {/* Finger lines (right) */}
            <line x1={7} y1={-12} x2={7} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            <line x1={11} y1={-12} x2={11} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            <line x1={15} y1={-12} x2={15} y2={-8} stroke={bg} strokeWidth={0.5} opacity={0.4} />
            {/* Cuff accent */}
            <rect x={-18} y={5} width={14} height={3} rx={1} fill={accentColor} opacity={0.4} />
            <rect x={4} y={5} width={14} height={3} rx={1} fill={accentColor} opacity={0.4} />
          </g>
        )}

        {category === 'accessory' && (
          <g>
            {/* Chain/necklace circle */}
            <circle cx={0} cy={0} r={14} fill="none" stroke={color} strokeWidth={2.5} />
            {/* Pendant */}
            <circle cx={0} cy={14} r={5} fill={color} />
            <circle cx={0} cy={14} r={3} fill={accentColor} opacity={0.6} />
            {/* Sparkle */}
            <line x1={0} y1={-4} x2={0} y2={4} stroke="white" strokeWidth={0.5} opacity={0.3} />
            <line x1={-4} y1={0} x2={4} y2={0} stroke="white" strokeWidth={0.5} opacity={0.3} />
          </g>
        )}

        {category === 'weapon' && (
          <g>
            {/* Pistol grip */}
            <rect x={-4} y={2} width={8} height={14} rx={2} fill={color} />
            {/* Barrel */}
            <rect x={-14} y={-4} width={22} height={8} rx={2} fill={color} />
            {/* Trigger guard */}
            <path d="M -2 8 Q 0 12 2 8" stroke={bg} strokeWidth={1} fill="none" />
            {/* Barrel detail */}
            <line x1={-14} y1={-1} x2={6} y2={-1} stroke={accentColor} strokeWidth={0.6} opacity={0.4} />
            {/* Muzzle */}
            <circle cx={-14} cy={0} r={2.5} fill={bg} stroke={color} strokeWidth={1} />
            {/* Sheen */}
            <rect x={-14} y={-4} width={22} height={8} rx={2} fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}

        {category === 'fullOutfit' && (
          <g>
            {/* Full body suit silhouette */}
            {/* Torso */}
            <path d="M -10 -18 L -8 -22 L 8 -22 L 10 -18 L 12 6 L -12 6 Z" fill={color} />
            {/* Left leg */}
            <path d="M -12 6 L -10 22 L -2 22 L 0 6 Z" fill={color} />
            {/* Right leg */}
            <path d="M 0 6 L 2 22 L 10 22 L 12 6 Z" fill={color} />
            {/* Collar */}
            <path d="M -4 -22 L 0 -16 L 4 -22" stroke={bg} strokeWidth={1} fill="none" />
            {/* Buttons */}
            <circle cx={0} cy={-10} r={1} fill={accentColor} opacity={0.6} />
            <circle cx={0} cy={-4} r={1} fill={accentColor} opacity={0.6} />
            <circle cx={0} cy={2} r={1} fill={accentColor} opacity={0.6} />
            {/* Sheen */}
            <path d="M -10 -18 L -8 -22 L 8 -22 L 10 -18 L 12 6 L -12 6 Z" fill={`url(#sheen-${category}-${color.replace('#','')})`} />
          </g>
        )}
      </g>

      {/* Gold accent corner for legendary */}
      {goldAccent && (
        <g>
          <path d="M 44 0 L 56 0 L 56 12 Z" fill="#C49A3C" opacity={0.6} />
          <text x={52} y={8} fontSize={6} fill="#06040A" textAnchor="middle" fontWeight="bold">★</text>
        </g>
      )}
    </svg>
  );
};

export default ItemThumbnail;
