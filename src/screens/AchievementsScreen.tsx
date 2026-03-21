import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { ACHIEVEMENTS, CATEGORY_LABELS, Achievement } from '@/lib/achievements';
import { supabase } from '@/integrations/supabase/client';

interface AchievementsScreenProps {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: AchievementsScreenProps) => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('achievements')
        .select('achievement_id')
        .eq('user_id', user.id);
      if (data) {
        setUnlockedIds(new Set(data.map(r => r.achievement_id)));
      }
      setLoading(false);
    };
    load();
  }, []);

  const categories = Object.keys(CATEGORY_LABELS);
  const filtered = filter
    ? ACHIEVEMENTS.filter(a => a.category === filter)
    : ACHIEVEMENTS;

  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;

  return (
    <div style={S.page}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: THEME.space.lg, paddingTop: THEME.space.xl }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
            cursor: 'pointer', marginBottom: THEME.space.lg, padding: 0,
          }}
        >
          ← BACK
        </button>

        <div style={S.eyebrow}>TROPHY CASE</div>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: THEME.space.xs }}>
          ACHIEVEMENTS
        </h1>
        <div style={{
          fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.goldDim,
          marginBottom: THEME.space.lg,
        }}>
          {unlockedCount}/{ACHIEVEMENTS.length} UNLOCKED
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, background: THEME.colors.dusk, borderRadius: 3,
          marginBottom: THEME.space.lg, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
            background: THEME.colors.gold,
            borderRadius: 3,
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Category filters */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: THEME.space.lg,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          <FilterChip label="ALL" active={filter === null} onClick={() => setFilter(null)} color={THEME.colors.gold} />
          {categories.map(cat => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat].label}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              color={CATEGORY_LABELS[cat].color}
            />
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3, padding: THEME.space.xl }}>
            LOADING...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
            {filtered.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedIds.has(achievement.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color: string;
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? `${color}20` : 'transparent',
      border: `1px solid ${active ? color : THEME.colors.borderFaint}`,
      borderRadius: THEME.radius.pill,
      padding: '4px 12px',
      fontSize: 8, fontFamily: THEME.fonts.display,
      letterSpacing: 2, color: active ? color : THEME.colors.textMuted,
      cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}
  >
    {label}
  </button>
);

const AchievementCard = ({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) => {
  const catColor = CATEGORY_LABELS[achievement.category].color;
  const isHidden = achievement.hidden && !unlocked;

  return (
    <div style={{
      ...S.card,
      padding: THEME.space.md,
      opacity: unlocked ? 1 : 0.45,
      border: `1px solid ${unlocked ? `${catColor}40` : THEME.colors.borderFaint}`,
      boxShadow: unlocked ? `0 0 12px ${catColor}10` : 'none',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.md }}>
        <div style={{
          fontSize: 24, width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: unlocked ? `${catColor}15` : THEME.colors.dusk,
          borderRadius: THEME.radius.md,
          filter: unlocked ? 'none' : 'grayscale(1)',
        }}>
          {isHidden ? '❓' : achievement.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: THEME.fonts.display, fontSize: 12, letterSpacing: 1,
            color: unlocked ? THEME.colors.textPrimary : THEME.colors.textMuted,
            marginBottom: 2,
          }}>
            {isHidden ? '???' : achievement.name}
          </div>
          <div style={{
            fontSize: 10, fontFamily: THEME.fonts.body, fontStyle: 'italic',
            color: THEME.colors.textMuted,
          }}>
            {isHidden ? 'Complete a secret challenge to reveal.' : achievement.description}
          </div>
        </div>
        {unlocked && (
          <div style={{
            fontSize: 7, fontFamily: THEME.fonts.display, letterSpacing: 2,
            padding: '2px 8px', borderRadius: THEME.radius.pill,
            background: `${catColor}20`, color: catColor,
          }}>
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsScreen;
