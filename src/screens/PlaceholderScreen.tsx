import { THEME, S } from '@/styles/theme';
import BottomNav from '@/components/BottomNav';

interface PlaceholderScreenProps {
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const PlaceholderScreen = ({ title, activeTab, onTabChange }: PlaceholderScreenProps) => {
  return (
    <div style={S.page}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: THEME.space.lg,
        }}
      >
        <div style={S.eyebrow}>Coming Soon</div>
        <div
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 24,
            color: THEME.colors.textPrimary,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default PlaceholderScreen;
