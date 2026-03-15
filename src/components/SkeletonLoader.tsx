import { THEME } from '@/styles/theme';

interface SkeletonLoaderProps {
  variant?: 'safehouse' | 'list' | 'profile' | 'default';
}

const Bone = ({ width = '100%', height = 14, style = {} }: { width?: string | number; height?: number; style?: React.CSSProperties }) => (
  <div
    className="animate-pulse"
    style={{
      width,
      height,
      borderRadius: THEME.radius.sm,
      background: THEME.colors.dusk,
      ...style,
    }}
  />
);

const SkeletonLoader = ({ variant = 'default' }: SkeletonLoaderProps) => {
  if (variant === 'safehouse') {
    return (
      <div style={{ padding: THEME.space.lg, paddingTop: 100, maxWidth: 480, margin: '0 auto' }}>
        {/* Top bar skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: THEME.space.xl }}>
          <Bone width={100} height={12} />
          <Bone width={80} height={16} />
        </div>
        {/* Room grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: THEME.space.md }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              background: THEME.colors.ink,
              border: `1px solid ${THEME.colors.borderFaint}`,
              borderRadius: THEME.radius.md,
              padding: THEME.space.lg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: THEME.space.sm,
            }}>
              <Bone width={32} height={32} style={{ borderRadius: '50%' }} />
              <Bone width={60} height={10} />
              <Bone width={40} height={8} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div style={{ padding: THEME.space.lg, maxWidth: 480, margin: '0 auto', paddingTop: THEME.space.xxl }}>
        <Bone width={120} height={10} style={{ marginBottom: THEME.space.md }} />
        <Bone width={180} height={20} style={{ marginBottom: THEME.space.xl }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            background: THEME.colors.ink,
            border: `1px solid ${THEME.colors.borderFaint}`,
            borderRadius: THEME.radius.md,
            padding: THEME.space.md,
            marginBottom: THEME.space.sm,
            display: 'flex',
            alignItems: 'center',
            gap: THEME.space.md,
          }}>
            <Bone width={40} height={40} style={{ borderRadius: THEME.radius.md, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Bone width="70%" height={12} />
              <Bone width="40%" height={8} />
            </div>
            <Bone width={60} height={24} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div style={{ padding: THEME.space.lg, maxWidth: 480, margin: '0 auto', paddingTop: THEME.space.xxl, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: THEME.space.lg }}>
        <Bone width={80} height={80} style={{ borderRadius: '50%' }} />
        <Bone width={120} height={16} />
        <Bone width={80} height={10} />
        <div style={{ display: 'flex', gap: THEME.space.md, width: '100%', justifyContent: 'center' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} width={48} height={48} style={{ borderRadius: THEME.radius.md }} />
          ))}
        </div>
        <div style={{ width: '100%' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: THEME.space.sm }}>
              <Bone width="45%" height={10} />
              <Bone width="30%" height={10} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default
  return (
    <div style={{ padding: THEME.space.lg, maxWidth: 480, margin: '0 auto', paddingTop: THEME.space.xxl }}>
      <Bone width={100} height={10} style={{ marginBottom: THEME.space.md }} />
      <Bone width="80%" height={20} style={{ marginBottom: THEME.space.lg }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <Bone key={i} width="100%" height={60} style={{ marginBottom: THEME.space.sm, borderRadius: THEME.radius.md }} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
