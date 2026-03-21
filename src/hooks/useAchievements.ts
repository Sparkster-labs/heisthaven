// Achievement unlock logic — call after heist results are saved
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface HeistContext {
  success: boolean;
  crewIds: string[];
  miniGameResults: boolean[];
  vaultTier: number;
  chaosCardEffect: string;
}

export async function checkAndUnlockAchievements(userId: string, heistCtx?: HeistContext) {
  // Get current achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlocked = new Set((existing || []).map(r => r.achievement_id));
  const toUnlock: string[] = [];

  const tryUnlock = (id: string) => {
    if (!unlocked.has(id) && ACHIEVEMENTS.find(a => a.id === id)) {
      toUnlock.push(id);
    }
  };

  // Fetch profile + history
  const [profileRes, historyRes, crewRes, heldRes] = await Promise.all([
    supabase.from('profiles').select('cash, jewels, unlocked_cities').eq('id', userId).single(),
    supabase.from('heist_history').select('success, crew_ids, mini_game_results, vault_tier, chaos_card_id').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('crew_state').select('crew_id, unlocked, loyalty, level').eq('user_id', userId),
    supabase.from('held_loot').select('id').eq('user_id', userId),
  ]);

  const profile = profileRes.data;
  const history = historyRes.data || [];
  const crew = crewRes.data || [];
  const heldLoot = heldRes.data || [];

  // HEIST achievements
  const totalHeists = history.length;
  if (totalHeists >= 1) tryUnlock('first_blood');
  if (totalHeists >= 10) tryUnlock('ten_heists');
  if (totalHeists >= 50) tryUnlock('fifty_heists');

  // Solo wolf
  if (history.some(h => h.success && (!h.crew_ids || h.crew_ids.length === 0))) {
    tryUnlock('solo_wolf');
  }

  // Flawless
  if (history.some(h => h.success && h.mini_game_results && (h.mini_game_results as boolean[]).every(r => r))) {
    tryUnlock('flawless');
  }

  // Hot streak (5 successive successes)
  let streak = 0;
  for (const h of history) {
    if (h.success) { streak++; if (streak >= 5) { tryUnlock('five_streak'); break; } }
    else streak = 0;
  }

  // Jailbird / repeat offender
  const busts = history.filter(h => !h.success).length;
  if (busts >= 1) tryUnlock('jail_bird');
  if (busts >= 3) tryUnlock('three_busts');

  // CREW
  const unlockedCrew = crew.filter(c => c.unlocked);
  if (unlockedCrew.length >= 5) tryUnlock('crew_5');
  if (crew.some(c => c.loyalty >= 100)) tryUnlock('max_loyalty');
  if (crew.some(c => c.level >= 5)) tryUnlock('level_5_crew');

  // Full crew (check heist context)
  if (heistCtx && heistCtx.crewIds.length >= 3) tryUnlock('full_crew');

  // WEALTH
  if (profile) {
    if (profile.cash >= 10000) tryUnlock('first_10k');
    if (profile.cash >= 100000) tryUnlock('first_100k');
    if (profile.cash >= 1000000) tryUnlock('first_million');

    const jewels = profile.jewels as Record<string, number>;
    if (jewels && jewels.pearl > 0 && jewels.sapphire > 0 && jewels.emerald > 0 && jewels.ruby > 0 && jewels.diamond > 0) {
      tryUnlock('jewel_collector');
    }

    if ((profile.unlocked_cities as string[]).length >= 4) tryUnlock('all_cities');
  }

  if (heldLoot.length > 0) tryUnlock('held_loot');

  // SKILL — count mini-game type successes from heist context
  // (simplified: count total successful heists as proxy for mini-game mastery)
  const successfulHeists = history.filter(h => h.success);
  if (successfulHeists.length >= 10) {
    tryUnlock('lockpick_master');
    tryUnlock('cold_reader');
    tryUnlock('shadow_master');
  }

  // Chaos master
  if (heistCtx && heistCtx.success && heistCtx.chaosCardEffect !== 'payout_bonus' && heistCtx.chaosCardEffect !== 'loyalty_boost' && heistCtx.miniGameResults.every(r => r)) {
    tryUnlock('chaos_master');
  }

  // Tier 5 clear
  if (history.some(h => h.success && (h.vault_tier ?? 0) >= 5)) tryUnlock('tier5_clear');

  // Ghost run — solo, flawless, tier 3+
  if (heistCtx && heistCtx.success && heistCtx.crewIds.length === 0 && heistCtx.vaultTier >= 3 && heistCtx.miniGameResults.every(r => r)) {
    tryUnlock('ghost_run');
  }

  // Insert new achievements
  if (toUnlock.length > 0) {
    await supabase.from('achievements').insert(
      toUnlock.map(id => ({ user_id: userId, achievement_id: id }))
    );
  }

  return toUnlock;
}
