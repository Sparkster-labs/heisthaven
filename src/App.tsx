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
import CityMapScreen from '@/screens/CityMapScreen';
import CrewScreen from '@/screens/CrewScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HeldLootScreen from '@/screens/HeldLootScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import JobBoardScreen from '@/screens/JobBoardScreen';
import BlackMarketScreen from '@/screens/BlackMarketScreen';
import IAPScreen from '@/screens/IAPScreen';
import VaultSelectScreen from '@/screens/heist/VaultSelectScreen';
import CrewHireScreen from '@/screens/heist/CrewHireScreen';
import ChaosCardReveal from '@/screens/heist/ChaosCardReveal';
import HeistExecution from '@/screens/heist/HeistExecution';
import HeistResults from '@/screens/heist/HeistResults';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import DressingRoomScreen from '@/screens/DressingRoomScreen';
import PhotoModeScreen from '@/screens/PhotoModeScreen';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [skipAuth, setSkipAuth] = useState(false);
  const [selectedVault, setSelectedVault] = useState<typeof VAULTS[number] | null>(null);
  const [heistPhase, setHeistPhase] = useState<'vault' | 'crew' | 'chaos' | 'execution' | 'results' | null>(null);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [chaosCard, setChaosCard] = useState<typeof CHAOS_CARDS[number] | null>(null);
  const [heistOutcome, setHeistOutcome] = useState<{ miniGameResults: boolean[] } | null>(null);
  const [subScreen, setSubScreen] = useState<string | null>(null);
  const { triggerTransition } = useTransition();

  const navigate = (cb: () => void) => triggerTransition(cb);

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

  // Reset password route (must be accessible without session)
  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordScreen />;
  }

  if (!session && !skipAuth) {
    return <AuthScreen onAuth={() => {}} onSkip={() => setSkipAuth(true)} />;
  }

  // Sub-screens
  if (subScreen === 'held_loot') {
    return <HeldLootScreen onBack={() => navigate(() => setSubScreen(null))} />;
  }
  if (subScreen === 'leaderboard') {
    return <LeaderboardScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  }
  if (subScreen === 'black_market') {
    return <BlackMarketScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} />;
  }
  if (subScreen === 'iap') {
    return <IAPScreen activeTab={activeTab} onTabChange={(tab) => navigate(() => { setSubScreen(null); setActiveTab(tab); })} onBack={() => navigate(() => setSubScreen(null))} />;
  }
  if (subScreen === 'dressing_room') {
    return <DressingRoomScreen onBack={() => navigate(() => setSubScreen(null))} />;
  }

  // Heist results
  if (selectedVault && heistPhase === 'results' && chaosCard && heistOutcome) {
    return (
      <HeistResults
        vault={selectedVault}
        crewIds={selectedCrewIds}
        chaosCard={chaosCard}
        miniGameResults={heistOutcome.miniGameResults}
        onFinish={() => navigate(() => {
          setHeistPhase(null);
          setSelectedVault(null);
          setSelectedCrewIds([]);
          setChaosCard(null);
          setHeistOutcome(null);
          setActiveTab('home');
        })}
      />
    );
  }

  // Heist execution
  if (selectedVault && heistPhase === 'execution' && chaosCard) {
    return (
      <HeistExecution
        vault={selectedVault}
        crewIds={selectedCrewIds}
        chaosCard={chaosCard}
        onComplete={(outcome) => {
          setHeistOutcome(outcome);
          setHeistPhase('results');
        }}
      />
    );
  }

  // Chaos card
  if (selectedVault && heistPhase === 'chaos') {
    return (
      <ChaosCardReveal
        onComplete={(card) => {
          setChaosCard(card);
          setHeistPhase('execution');
        }}
      />
    );
  }

  if (selectedVault && heistPhase === 'crew') {
    return (
      <CrewHireScreen
        vault={selectedVault}
        onLaunch={(crewIds) => {
          setSelectedCrewIds(crewIds);
          setHeistPhase('chaos');
        }}
        onBack={() => setHeistPhase('vault')}
      />
    );
  }

  if (selectedVault && heistPhase === 'vault') {
    return (
      <VaultSelectScreen
        vault={selectedVault}
        onCommit={() => setHeistPhase('crew')}
        onBack={() => navigate(() => {
          setSelectedVault(null);
          setHeistPhase(null);
        })}
      />
    );
  }

  // Tab routing
  const handleTabChange = (tab: string) => navigate(() => setActiveTab(tab));

  switch (activeTab) {
    case 'home':
      return (
        <>
          <DailyLoginModal />
          <OnboardingOverlay />
          <SafehouseScreen
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenRoom={(roomId) => {
              if (roomId === 'vault') navigate(() => setSubScreen('held_loot'));
              if (roomId === 'war_room') navigate(() => setSubScreen('leaderboard'));
              if (roomId === 'dressing_room') navigate(() => setSubScreen('dressing_room'));
            }}
            onOpenIAP={() => navigate(() => setSubScreen('iap'))}
            onOpenBlackMarket={() => navigate(() => setSubScreen('black_market'))}
            onOpenHeldLoot={() => navigate(() => setSubScreen('held_loot'))}
          />
        </>
      );
    case 'jobs':
      return (
        <JobBoardScreen
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSelectVault={(vault) => navigate(() => { setSelectedVault(vault); setHeistPhase('vault'); })}
        />
      );
    case 'city':
      return <CityMapScreen activeTab={activeTab} onTabChange={handleTabChange} />;
    case 'crew':
      return <CrewScreen activeTab={activeTab} onTabChange={handleTabChange} />;
    case 'profile':
      return <ProfileScreen activeTab={activeTab} onTabChange={handleTabChange} />;
    default:
      return <SafehouseScreen activeTab={activeTab} onTabChange={handleTabChange} />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Film grain overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.035,
          pointerEvents: 'none',
          zIndex: 9999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
      <TransitionProvider>
        <AppContent />
      </TransitionProvider>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
