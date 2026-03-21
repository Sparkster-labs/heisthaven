import { THEME } from '@/styles/theme';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', emoji: '🏠', label: 'Safehouse' },
  { id: 'jobs', emoji: '💼', label: 'Heist' },
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
        padding: `${THEME.space.sm}px 0 calc(${THEME.space.sm}px + env(safe-area-inset-bottom))`,
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
              gap: 2,
              cursor: 'pointer',
              padding: `${THEME.space.xs}px ${THEME.space.md}px`,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.emoji}</span>
            <span
              style={{
                fontSize: 9,
                fontFamily: THEME.fonts.display,
                letterSpacing: 1,
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
