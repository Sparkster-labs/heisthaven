import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_AVATAR, DEFAULT_EQUIPPED, type AvatarConfig, type EquippedItems } from '@/lib/avatarData';
import { CREW_MEMBERS } from '@/lib/gameData';

export interface DemoProfile {
  display_name: string;
  cash: number;
  rep_level: number;
  rep_xp: number;
  notoriety_title: string;
  jewels: Record<string, number>;
  avatar: AvatarConfig;
  equippedItems: EquippedItems;
  current_city: string;
  unlocked_cities: string[];
  crew_insurance: boolean;
  created_at: string;
  last_login: string | null;
}

export interface DemoCrewState {
  crew_id: string;
  unlocked: boolean;
  level: number;
  loyalty: number;
}

export interface DemoSafehouse {
  rooms: Record<string, number>;
}

export interface DemoHeldLoot {
  id: string;
  amount: number;
  held_at: string;
  expires_at: string;
  raid_chance: number;
}

export interface DemoHeist {
  vault_name: string | null;
  vault_tier: number | null;
  success: boolean | null;
  payout: number | null;
  cash_spent: number | null;
  created_at: string | null;
  city_id: string | null;
  crew_ids: string[] | null;
  jewel_drops: Record<string, number> | null;
}

interface DemoContextType {
  isDemo: boolean;
  profile: DemoProfile;
  safehouse: DemoSafehouse;
  crewStates: DemoCrewState[];
  ownedItemIds: Set<string>;
  heldLoot: DemoHeldLoot[];
  heistHistory: DemoHeist[];
  updateProfile: (updates: Partial<DemoProfile>) => void;
  updateSafehouse: (updates: Partial<DemoSafehouse>) => void;
  updateCrewState: (crewId: string, updates: Partial<DemoCrewState>) => void;
  addOwnedItem: (itemId: string) => void;
  addHeldLoot: (loot: DemoHeldLoot) => void;
  removeHeldLoot: (id: string) => void;
  addHeist: (heist: DemoHeist) => void;
}

const defaultProfile: DemoProfile = {
  display_name: 'Demo Player',
  cash: 2000,
  rep_level: 2,
  rep_xp: 150,
  notoriety_title: 'Street Rat',
  jewels: { ruby: 0, pearl: 2, diamond: 0, emerald: 0, sapphire: 1 },
  avatar: DEFAULT_AVATAR,
  equippedItems: DEFAULT_EQUIPPED,
  current_city: 'new_cavendish',
  unlocked_cities: ['new_cavendish'],
  crew_insurance: false,
  created_at: new Date().toISOString(),
  last_login: null,
};

const defaultSafehouse: DemoSafehouse = {
  rooms: {
    study: 0,
    vault: 1,
    garage: 0,
    parlor: 0,
    war_room: 1,
    infirmary: 0,
    penthouse: 0,
    signal_room: 0,
    dressing_room: 1,
  },
};

const defaultCrew: DemoCrewState[] = CREW_MEMBERS.slice(0, 5).map(m => ({
  crew_id: m.id,
  unlocked: true,
  level: 1,
  loyalty: 60,
}));

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  return ctx;
};

export const DemoProvider = ({ children, enabled }: { children: ReactNode; enabled: boolean }) => {
  const [profile, setProfile] = useState<DemoProfile>(defaultProfile);
  const [safehouse, setSafehouse] = useState<DemoSafehouse>(defaultSafehouse);
  const [crewStates, setCrewStates] = useState<DemoCrewState[]>(defaultCrew);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set());
  const [heldLoot, setHeldLoot] = useState<DemoHeldLoot[]>([]);
  const [heistHistory, setHeistHistory] = useState<DemoHeist[]>([]);

  const updateProfile = useCallback((updates: Partial<DemoProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSafehouse = useCallback((updates: Partial<DemoSafehouse>) => {
    setSafehouse(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCrewState = useCallback((crewId: string, updates: Partial<DemoCrewState>) => {
    setCrewStates(prev => prev.map(c => c.crew_id === crewId ? { ...c, ...updates } : c));
  }, []);

  const addOwnedItem = useCallback((itemId: string) => {
    setOwnedItemIds(prev => new Set([...prev, itemId]));
  }, []);

  const addHeldLoot = useCallback((loot: DemoHeldLoot) => {
    setHeldLoot(prev => [loot, ...prev]);
  }, []);

  const removeHeldLoot = useCallback((id: string) => {
    setHeldLoot(prev => prev.filter(l => l.id !== id));
  }, []);

  const addHeist = useCallback((heist: DemoHeist) => {
    setHeistHistory(prev => [heist, ...prev]);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <DemoContext.Provider value={{
      isDemo: true,
      profile,
      safehouse,
      crewStates,
      ownedItemIds,
      heldLoot,
      heistHistory,
      updateProfile,
      updateSafehouse,
      updateCrewState,
      addOwnedItem,
      addHeldLoot,
      removeHeldLoot,
      addHeist,
    }}>
      {children}
    </DemoContext.Provider>
  );
};
