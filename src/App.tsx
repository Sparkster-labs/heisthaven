import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { THEME } from '@/styles/theme';
import { VAULTS } from '@/lib/gameData';
import AuthScreen from '@/screens/AuthScreen';
import SafehouseScreen from '@/screens/SafehouseScreen';
import PlaceholderScreen from '@/screens/PlaceholderScreen';
import JobBoardScreen from '@/screens/JobBoardScreen';
import VaultSelectScreen from '@/screens/heist/VaultSelectScreen';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVault, setSelectedVault] = useState<typeof VAULTS[number] | null>(null);

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

  // If a vault is selected, show vault detail
  if (selectedVault) {
    return (
      <VaultSelectScreen
        vault={selectedVault}
        onCommit={() => {
          // Will connect to CrewHire in Prompt 4
          setSelectedVault(null);
          setActiveTab('jobs');
        }}
        onBack={() => setSelectedVault(null)}
      />
    );
  }

  // Tab routing
  switch (activeTab) {
    case 'home':
      return <SafehouseScreen activeTab={activeTab} onTabChange={setActiveTab} />;
    case 'jobs':
      return (
        <JobBoardScreen
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectVault={(vault) => setSelectedVault(vault)}
        />
      );
    case 'city':
      return <PlaceholderScreen title="City Map" activeTab={activeTab} onTabChange={setActiveTab} />;
    case 'crew':
      return <PlaceholderScreen title="Crew" activeTab={activeTab} onTabChange={setActiveTab} />;
    case 'profile':
      return <PlaceholderScreen title="Profile" activeTab={activeTab} onTabChange={setActiveTab} />;
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
