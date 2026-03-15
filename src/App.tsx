import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import { THEME } from '@/styles/theme';
import { VAULTS, CHAOS_CARDS } from '@/lib/gameData';
import AuthScreen from '@/screens/AuthScreen';
import SafehouseScreen from '@/screens/SafehouseScreen';
import PlaceholderScreen from '@/screens/PlaceholderScreen';
import CityMapScreen from '@/screens/CityMapScreen';
import CrewScreen from '@/screens/CrewScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HeldLootScreen from '@/screens/HeldLootScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import JobBoardScreen from '@/screens/JobBoardScreen';
import VaultSelectScreen from '@/screens/heist/VaultSelectScreen';
import CrewHireScreen from '@/screens/heist/CrewHireScreen';
import ChaosCardReveal from '@/screens/heist/ChaosCardReveal';
import HeistExecution from '@/screens/heist/HeistExecution';
import HeistResults from '@/screens/heist/HeistResults';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVault, setSelectedVault] = useState<typeof VAULTS[number] | null>(null);
  const [heistPhase, setHeistPhase] = useState<'vault' | 'crew' | 'chaos' | 'execution' | 'results' | null>(null);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [chaosCard, setChaosCard] = useState<typeof CHAOS_CARDS[number] | null>(null);
  const [heistOutcome, setHeistOutcome] = useState<{ miniGameResults: boolean[] } | null>(null);
  const [subScreen, setSubScreen] = useState<string | null>(null);

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

  if (!session) {
    return <AuthScreen onAuth={() => {}} />;
  }

  // Sub-screens
  if (subScreen === 'held_loot') {
    return <HeldLootScreen onBack={() => setSubScreen(null)} />;
  }
  if (subScreen === 'leaderboard') {
    return <LeaderboardScreen activeTab={activeTab} onTabChange={(tab) => { setSubScreen(null); setActiveTab(tab); }} />;
  }

  // Heist results
  if (selectedVault && heistPhase === 'results' && chaosCard && heistOutcome) {
    return (
      <HeistResults
        vault={selectedVault}
        crewIds={selectedCrewIds}
        chaosCard={chaosCard}
        miniGameResults={heistOutcome.miniGameResults}
        onFinish={() => {
          setHeistPhase(null);
          setSelectedVault(null);
          setSelectedCrewIds([]);
          setChaosCard(null);
          setHeistOutcome(null);
          setActiveTab('home');
        }}
      />
    );
  }

  // Heist execution (mini-games)
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

  // Chaos card reveal
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
        onBack={() => {
          setSelectedVault(null);
          setHeistPhase(null);
        }}
      />
    );
  }

  // Tab routing
  switch (activeTab) {
    case 'home':
      return <SafehouseScreen activeTab={activeTab} onTabChange={setActiveTab} onOpenRoom={(roomId) => {
        if (roomId === 'vault') setSubScreen('held_loot');
        if (roomId === 'war_room') setSubScreen('leaderboard');
      }} />;
    case 'jobs':
      return (
        <JobBoardScreen
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectVault={(vault) => { setSelectedVault(vault); setHeistPhase('vault'); }}
        />
      );
    case 'city':
      return <CityMapScreen activeTab={activeTab} onTabChange={setActiveTab} />;
    case 'crew':
      return <CrewScreen activeTab={activeTab} onTabChange={setActiveTab} />;
    case 'profile':
      return <ProfileScreen activeTab={activeTab} onTabChange={setActiveTab} />;
    default:
      return <SafehouseScreen activeTab={activeTab} onTabChange={setActiveTab} />;
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
      <AppContent />
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
