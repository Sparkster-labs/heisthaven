import { THEME } from '@/styles/theme';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'jobs', emoji: '💼', label: 'Jobs' },
  { id: 'empire', emoji: '🏛️', label: 'Empire' },
  { id: 'city', emoji: '🗺️', label: 'City' },
  { id: 'crew', emoji: '👥', label: 'Crew' },
  { id: 'profile', emoji: '👤', label: 'Profile' },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: THEME.colors.ink,
        borderTop: `1px solid ${THEME.colors.borderFaint}`,
        display: 'flex',
        justifyContent: 'space-around',
        padding: `${THEME.space.xs}px 0 calc(${THEME.space.sm}px + env(safe-area-inset-bottom))`,
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              padding: `${THEME.space.xs}px 2px`,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.emoji}</span>
            <span
              style={{
                fontSize: 7,
                fontFamily: THEME.fonts.display,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isActive ? THEME.colors.gold : THEME.colors.textMuted,
                transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
