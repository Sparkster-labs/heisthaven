/**
 * ItemThumbnail — pencil-sketch style SVG icons for clothing items.
 * Hand-drawn aesthetic with visible strokes and cross-hatching.
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
  const sk = '#1a1410'; // sketch stroke color
  const sw = 0.8; // stroke width

  return (
    <svg viewBox="0 0 56 56" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`thumb-sketch-${category}-${color.replace('#','')}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="3" seed={13} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id={`thumb-hatch-${category}-${color.replace('#','')}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={sk} strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="56" height="56" rx="6" fill={bg} stroke={sk} strokeWidth={0.3} opacity={0.5} />

      {/* Category-specific icon with sketch style */}
      <g transform="translate(28, 28)" filter={`url(#thumb-sketch-${category}-${color.replace('#','')})`}>
        {category === 'hat' && (
          <g>
            <rect x={-12} y={-8} width={24} height={12} rx={3} fill={color} stroke={sk} strokeWidth={sw} />
            <ellipse cx={0} cy={4} rx={18} ry={4} fill={color} stroke={sk} strokeWidth={sw} />
            <rect x={-12} y={-1} width={24} height={2.5} rx={1} fill={accentColor} stroke={sk} strokeWidth={0.3} />
            {/* Pencil texture lines */}
            <line x1={-8} y1={-5} x2={8} y2={-5} stroke={sk} strokeWidth={0.2} opacity={0.15} />
            <line x1={-6} y1={-3} x2={6} y2={-3} stroke={sk} strokeWidth={0.2} opacity={0.1} />
          </g>
        )}

        {category === 'mask' && (
          <g>
            <path d="M -16 -4 Q -16 -12 -6 -12 L 6 -12 Q 16 -12 16 -4 L 16 4 Q 16 12 6 12 L -6 12 Q -16 12 -16 4 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <ellipse cx={-7} cy={-2} rx={4} ry={3} fill={bg} stroke={sk} strokeWidth={0.4} />
            <ellipse cx={7} cy={-2} rx={4} ry={3} fill={bg} stroke={sk} strokeWidth={0.4} />
            <path d="M -2 -2 L 0 4 L 2 -2" stroke={sk} strokeWidth={0.4} fill="none" opacity={0.3} />
          </g>
        )}

        {category === 'eyewear' && (
          <g>
            <rect x={-18} y={-5} width={14} height={10} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.8} />
            <rect x={4} y={-5} width={14} height={10} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.8} />
            <path d="M -4 0 Q 0 -3 4 0" stroke={sk} strokeWidth={0.8} fill="none" />
            <line x1={-18} y1={-3} x2={-22} y2={-6} stroke={sk} strokeWidth={0.6} />
            <line x1={18} y1={-3} x2={22} y2={-6} stroke={sk} strokeWidth={0.6} />
            {/* Lens reflections */}
            <line x1={-14} y1={-3} x2={-10} y2={2} stroke="white" strokeWidth={0.4} opacity={0.2} />
            <line x1={8} y1={-3} x2={12} y2={2} stroke="white" strokeWidth={0.4} opacity={0.2} />
          </g>
        )}

        {category === 'top' && (
          <g>
            <path d="M -14 -12 L -10 -16 L 10 -16 L 14 -12 L 14 14 L -14 14 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -6 -16 L 0 -8 L 6 -16" stroke={sk} strokeWidth={0.8} fill="none" />
            <rect x={-20} y={-12} width={8} height={14} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.85} />
            <rect x={12} y={-12} width={8} height={14} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.85} />
            {/* Wrinkle lines */}
            <path d="M -8 -6 Q -4 -4 -6 0" stroke={sk} strokeWidth={0.3} fill="none" opacity={0.2} />
            <path d="M 8 -6 Q 4 -4 6 0" stroke={sk} strokeWidth={0.3} fill="none" opacity={0.2} />
          </g>
        )}

        {category === 'coat' && (
          <g>
            <path d="M -16 -14 L -12 -18 L 12 -18 L 16 -14 L 18 16 L -18 16 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -6 -18 L -2 -6 L 0 -10 L 2 -6 L 6 -18" stroke={sk} strokeWidth={0.6} fill="none" />
            <circle cx={0} cy={-2} r={1.2} fill="none" stroke={sk} strokeWidth={0.4} />
            <circle cx={0} cy={4} r={1.2} fill="none" stroke={sk} strokeWidth={0.4} />
            <circle cx={0} cy={10} r={1.2} fill="none" stroke={sk} strokeWidth={0.4} />
            <rect x={-22} y={-14} width={8} height={18} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.85} />
            <rect x={14} y={-14} width={8} height={18} rx={3} fill={color} stroke={sk} strokeWidth={sw} opacity={0.85} />
          </g>
        )}

        {category === 'bottoms' && (
          <g>
            <rect x={-14} y={-16} width={28} height={6} rx={2} fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -14 -10 L -12 16 L -2 16 L 0 -10 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M 0 -10 L 2 16 L 12 16 L 14 -10 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <rect x={-3} y={-15} width={6} height={4} rx={1} fill="none" stroke={sk} strokeWidth={0.4} />
            {/* Crease lines */}
            <line x1={-7} y1={-4} x2={-7} y2={14} stroke={sk} strokeWidth={0.2} opacity={0.15} />
            <line x1={7} y1={-4} x2={7} y2={14} stroke={sk} strokeWidth={0.2} opacity={0.15} />
          </g>
        )}

        {category === 'shoes' && (
          <g>
            <path d="M -20 -2 L -20 4 Q -20 8 -16 8 L -2 8 Q 2 8 2 4 L 2 2 Q 2 -2 -2 -2 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M 4 -2 L 4 4 Q 4 8 8 8 L 22 8 Q 26 8 26 4 L 26 2 Q 26 -2 22 -2 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <line x1={-18} y1={7} x2={0} y2={7} stroke={sk} strokeWidth={0.5} opacity={0.4} />
            <line x1={6} y1={7} x2={24} y2={7} stroke={sk} strokeWidth={0.5} opacity={0.4} />
          </g>
        )}

        {category === 'gloves' && (
          <g>
            <path d="M -18 4 L -18 -8 Q -18 -12 -14 -12 L -8 -12 Q -4 -12 -4 -8 L -4 4 Q -4 8 -8 8 L -14 8 Q -18 8 -18 4 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M 4 4 L 4 -8 Q 4 -12 8 -12 L 14 -12 Q 18 -12 18 -8 L 18 4 Q 18 8 14 8 L 8 8 Q 4 8 4 4 Z" fill={color} stroke={sk} strokeWidth={sw} />
            {/* Finger lines */}
            <line x1={-15} y1={-12} x2={-15} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
            <line x1={-11} y1={-12} x2={-11} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
            <line x1={-7} y1={-12} x2={-7} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
            <line x1={7} y1={-12} x2={7} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
            <line x1={11} y1={-12} x2={11} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
            <line x1={15} y1={-12} x2={15} y2={-8} stroke={sk} strokeWidth={0.4} opacity={0.3} />
          </g>
        )}

        {category === 'accessory' && (
          <g>
            <circle cx={0} cy={0} r={14} fill="none" stroke={color} strokeWidth={1.5} />
            <circle cx={0} cy={0} r={14} fill="none" stroke={sk} strokeWidth={0.3} />
            <circle cx={0} cy={14} r={5} fill="none" stroke={color} strokeWidth={1.2} />
            <circle cx={0} cy={14} r={2} fill={accentColor} />
          </g>
        )}

        {category === 'weapon' && (
          <g>
            <rect x={-4} y={2} width={8} height={14} rx={2} fill={color} stroke={sk} strokeWidth={sw} />
            <rect x={-14} y={-4} width={22} height={8} rx={2} fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -2 8 Q 0 12 2 8" stroke={sk} strokeWidth={0.6} fill="none" />
            <circle cx={-14} cy={0} r={2.5} fill={bg} stroke={sk} strokeWidth={0.6} />
          </g>
        )}

        {category === 'fullOutfit' && (
          <g>
            <path d="M -10 -18 L -8 -22 L 8 -22 L 10 -18 L 12 6 L -12 6 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -12 6 L -10 22 L -2 22 L 0 6 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M 0 6 L 2 22 L 10 22 L 12 6 Z" fill={color} stroke={sk} strokeWidth={sw} />
            <path d="M -4 -22 L 0 -16 L 4 -22" stroke={sk} strokeWidth={0.6} fill="none" />
            <circle cx={0} cy={-10} r={1} fill="none" stroke={sk} strokeWidth={0.4} />
            <circle cx={0} cy={-4} r={1} fill="none" stroke={sk} strokeWidth={0.4} />
            <circle cx={0} cy={2} r={1} fill="none" stroke={sk} strokeWidth={0.4} />
          </g>
        )}
      </g>

      {/* Gold accent corner for legendary */}
      {goldAccent && (
        <g>
          <path d="M 44 0 L 56 0 L 56 12 Z" fill="#C49A3C" opacity={0.6} stroke={sk} strokeWidth={0.3} />
          <text x={52} y={8} fontSize={6} fill="#06040A" textAnchor="middle" fontWeight="bold">★</text>
        </g>
      )}
    </svg>
  );
};

export default ItemThumbnail;
