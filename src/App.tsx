import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import { THEME } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS } from '@/lib/gameData';
import { TransitionProvider, useTransition } from '@/contexts/TransitionContext';
import DailyLoginModal from '@/components/DailyLoginModal';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import AuthScreen from '@/screens/AuthScreen';
import SafehouseScreen from '@/screens/SafehouseScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HeldLootScreen from '@/screens/HeldLootScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import JobBoardScreen from '@/screens/JobBoardScreen';
import BlackMarketScreen from '@/screens/BlackMarketScreen';
import EmpireScreen from '@/screens/EmpireScreen';
import IAPScreen from '@/screens/IAPScreen';
import CityMapScreen from '@/screens/CityMapScreen';
import CrewScreen from '@/screens/CrewScreen';
import VaultSelectScreen from '@/screens/heist/VaultSelectScreen';
import CrewHireScreen from '@/screens/heist/CrewHireScreen';
import ChaosCardReveal from '@/screens/heist/ChaosCardReveal';
import HeistExecution from '@/screens/heist/HeistExecution';
import HeistResults from '@/screens/heist/HeistResults';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import PhotoModeScreen from '@/screens/PhotoModeScreen';
import DistrictActivityScreen from '@/screens/DistrictActivityScreen';
import JailScreen from '@/screens/JailScreen';
import AchievementsScreen from '@/screens/AchievementsScreen';
import BottomNav from '@/components/BottomNav';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const AppInner = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVault, setSelectedVault] = useState<typeof VAULTS[number] | null>(null);
  const [heistPhase, setHeistPhase] = useState<'vault' | 'crew' | 'chaos' | 'execution' | 'results' | null>(null);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [chaosCard, setChaosCard] = useState<typeof CHAOS_CARDS[number] | null>(null);
  const [heistOutcome, setHeistOutcome] = useState<{ miniGameResults: boolean[] } | null>(null);
  const [subScreen, setSubScreen] = useState<string | null>(null);
  const [districtInfo, setDistrictInfo] = useState<{ id: string; name: string; color: string } | null>(null);
  const [isJailed, setIsJailed] = useState(false);
  const { triggerTransition } = useTransition();

  const navigate = (cb: () => void) => triggerTransition(cb);

  // Check jail status on session load
  useEffect(() => {
    if (!session) return;
    const checkJail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: jail } = await supabase
        .from('jail_state')
        .select('release_at, paid')
        .eq('user_id', user.id)
        .single();
      if (jail && !jail.paid && new Date(jail.release_at) > new Date()) {
        setIsJailed(true);
      }
    };
    checkJail();
  }, [session]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: THEME.colors.void, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3, fontSize: 16 }}>
          LOADING...
        </div>
      </div>
    );
  }

  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordScreen />;
  }

  if (!session) {
    return <AuthScreen onAuth={() => {}} />;
  }

  // Determine which screen to render and whether to show bottom nav
  const handleTabChange = (tab: string) => navigate(() => setActiveTab(tab));
  let showNav = true;
  let content: React.ReactNode = null;

  if (isJailed) {
    showNav = false;
    content = <JailScreen onRelease={() => navigate(() => { setIsJailed(false); setActiveTab('home'); })} />;
  } else if (subScreen === 'held_loot') {
    content = <HeldLootScreen onBack={() => navigate(() => setSubScreen(null))} />;
  } else if (subScreen === 'leaderboard') {
    content = <LeaderboardScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  } else if (subScreen === 'black_market') {
    content = <BlackMarketScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  } else if (subScreen === 'iap') {
    content = <IAPScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} onBack={() => navigate(() => setSubScreen(null))} />;
  } else if (subScreen === 'photo_mode') {
    showNav = false;
    content = <PhotoModeScreen onBack={() => navigate(() => setSubScreen(null))} />;
  } else if (subScreen === 'empire') {
    content = <EmpireScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  } else if (subScreen === 'city') {
    content = <CityMapScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} onOpenDistrict={(id, name, color) => navigate(() => { setDistrictInfo({ id, name, color }); setSubScreen('district_activity'); })} />;
  } else if (subScreen === 'crew') {
    content = <CrewScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  } else if (subScreen === 'district_activity' && districtInfo) {
    content = <DistrictActivityScreen districtId={districtInfo.id} districtName={districtInfo.name} cityColor={districtInfo.color} onBack={() => navigate(() => { setSubScreen('city'); setDistrictInfo(null); })} />;
  } else if (subScreen === 'achievements') {
    content = <AchievementsScreen onBack={() => navigate(() => setSubScreen(null))} />;
  } else if (selectedVault && heistPhase === 'results' && chaosCard && heistOutcome) {
    showNav = false;
    content = <HeistResults vault={selectedVault} crewIds={selectedCrewIds} chaosCard={chaosCard} miniGameResults={heistOutcome.miniGameResults} onFinish={() => navigate(() => { setHeistPhase(null); setSelectedVault(null); setSelectedCrewIds([]); setChaosCard(null); setHeistOutcome(null); setActiveTab('home'); })} onJailed={() => navigate(() => { setHeistPhase(null); setSelectedVault(null); setSelectedCrewIds([]); setChaosCard(null); setHeistOutcome(null); setIsJailed(true); })} />;
  } else if (selectedVault && heistPhase === 'execution' && chaosCard) {
    showNav = false;
    content = <HeistExecution vault={selectedVault} crewIds={selectedCrewIds} chaosCard={chaosCard} onComplete={(outcome) => { setHeistOutcome(outcome); setHeistPhase('results'); }} />;
  } else if (selectedVault && heistPhase === 'chaos') {
    showNav = false;
    content = <ChaosCardReveal onComplete={(card) => { setChaosCard(card); setHeistPhase('execution'); }} />;
  } else if (selectedVault && heistPhase === 'crew') {
    showNav = false;
    content = <CrewHireScreen vault={selectedVault} onLaunch={(crewIds) => { setSelectedCrewIds(crewIds); setHeistPhase('chaos'); }} onBack={() => setHeistPhase('vault')} />;
  } else if (selectedVault && heistPhase === 'vault') {
    showNav = false;
    content = <VaultSelectScreen vault={selectedVault} onCommit={() => setHeistPhase('crew')} onBack={() => navigate(() => { setSelectedVault(null); setHeistPhase(null); })} />;
  } else {
    switch (activeTab) {
      case 'home':
        content = (
          <>
            <DailyLoginModal />
            <OnboardingOverlay onNavigate={(tab) => handleTabChange(tab)} />
            <SafehouseScreen
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onOpenRoom={(roomId) => {
                if (roomId === 'vault') navigate(() => setSubScreen('held_loot'));
                if (roomId === 'war_room') navigate(() => setSubScreen('leaderboard'));
              }}
              onOpenIAP={() => navigate(() => setSubScreen('iap'))}
              onOpenBlackMarket={() => navigate(() => setSubScreen('black_market'))}
              onOpenHeldLoot={() => navigate(() => setSubScreen('held_loot'))}
              onOpenEmpire={() => navigate(() => setSubScreen('empire'))}
              onOpenCity={() => navigate(() => setSubScreen('city'))}
              onOpenCrew={() => navigate(() => setSubScreen('crew'))}
            />
          </>
        );
        break;
      case 'jobs':
        content = <JobBoardScreen activeTab={activeTab} onTabChange={handleTabChange} onSelectVault={(vault) => navigate(() => { setSelectedVault(vault); setHeistPhase('vault'); })} />;
        break;
      case 'profile':
        content = <ProfileScreen activeTab={activeTab} onTabChange={handleTabChange} onOpenAchievements={() => navigate(() => setSubScreen('achievements'))} />;
        break;
      default:
        content = <SafehouseScreen activeTab={activeTab} onTabChange={handleTabChange} />;
    }
  }

  return (
    <>
      {content}
      {showNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Film grain overlay */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0.035, pointerEvents: 'none', zIndex: 9999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
        }}
      />
      <TransitionProvider>
        <AppInner />
      </TransitionProvider>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
