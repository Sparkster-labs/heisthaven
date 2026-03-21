import { useEffect, useMemo, useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { DISTRICT_ACTIVITIES, GAMBLING_CONFIG, FENCE_RATES, TRAINING_COST, INTEL_COST } from '@/lib/districtActivities';
import { CREW_MEMBERS } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Haptics, SFX } from '@/lib/sounds';

interface DistrictActivityScreenProps {
  districtId: string;
  districtName: string;
  cityColor: string;
  onBack: () => void;
  onOpenBlackMarket?: () => void;
}

const jewelEmojis: Record<string, string> = { pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎' };
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

type ResultOutcome = 'win' | 'loss' | 'push';

interface ActivityResult {
  outcome: ResultOutcome;
  amount: number;
  detail?: string;
}

interface CrewStateRow {
  crew_id: string;
  unlocked: boolean;
  level: number;
  loyalty: number;
}

interface PokerCard {
  rank: number;
  suit: '♠' | '♥' | '♦' | '♣';
  label: string;
}

interface PokerRoundState {
  phase: 'idle' | 'decision' | 'showdown';
  playerHole: PokerCard[];
  opponentHole: PokerCard[];
  community: PokerCard[];
  deck: PokerCard[];
  summary?: string;
  playerHand?: string;
  opponentHand?: string;
}

interface Fighter {
  id: string;
  name: string;
  emoji: string;
  power: number;
}

interface PokerEvaluation {
  rank: number;
  label: string;
  kickers: number[];
}

const RECRUITER_POOLS: Record<string, string[]> = {
  dock_recruiter: ['mako', 'anchor', 'drift'],
  finance_recruitment: ['ledger', 'vanta', 'proxy'],
};

const FIGHTER_POOL: Fighter[] = [
  { id: 'fighter_1', name: 'Brass Knuckles Benny', emoji: '🥊', power: 66 },
  { id: 'fighter_2', name: 'Knifeline Kara', emoji: '🔪', power: 72 },
  { id: 'fighter_3', name: 'Rook', emoji: '♜', power: 61 },
  { id: 'fighter_4', name: 'Tank Morrow', emoji: '🛡️', power: 80 },
  { id: 'fighter_5', name: 'Velvet Fang', emoji: '🐍', power: 63 },
  { id: 'fighter_6', name: 'Diesel Duke', emoji: '⚙️', power: 74 },
  { id: 'fighter_7', name: 'Crowbar Cole', emoji: '🪓', power: 69 },
  { id: 'fighter_8', name: 'Whisper', emoji: '🌫️', power: 58 },
  { id: 'fighter_9', name: 'Madam Mire', emoji: '🕷️', power: 71 },
  { id: 'fighter_10', name: 'Iron Nyx', emoji: '⛓️', power: 79 },
  { id: 'fighter_11', name: 'Sledge Orrin', emoji: '🔨', power: 77 },
  { id: 'fighter_12', name: 'Viper Vale', emoji: '🐉', power: 65 },
  { id: 'fighter_13', name: 'The Widowmaker', emoji: '🕸️', power: 83 },
  { id: 'fighter_14', name: 'Mercury Max', emoji: '⚡', power: 64 },
  { id: 'fighter_15', name: 'Gutter Saint', emoji: '🕯️', power: 60 },
  { id: 'fighter_16', name: 'Rattle Cain', emoji: '☠️', power: 75 },
  { id: 'fighter_17', name: 'Nova Pike', emoji: '🌟', power: 68 },
  { id: 'fighter_18', name: 'Razor June', emoji: '🪒', power: 67 },
  { id: 'fighter_19', name: 'Stonewall Ronan', emoji: '🧱', power: 82 },
  { id: 'fighter_20', name: 'Hex', emoji: '🧿', power: 62 },
  { id: 'fighter_21', name: 'Brawler Bex', emoji: '🥷', power: 70 },
  { id: 'fighter_22', name: 'Nocturne', emoji: '🌙', power: 59 },
  { id: 'fighter_23', name: 'Garnet Grin', emoji: '😈', power: 73 },
  { id: 'fighter_24', name: 'The Freight', emoji: '🚂', power: 78 },
  { id: 'fighter_25', name: 'Cipher', emoji: '🧠', power: 57 },
];

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createPokerDeck = (): PokerCard[] => {
  const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
  const rankLabels: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };

  const deck: PokerCard[] = [];
  for (const suit of suits) {
    for (let rank = 2; rank <= 14; rank += 1) {
      deck.push({ rank, suit, label: rankLabels[rank] });
    }
  }
  return shuffleArray(deck);
};

const detectStraightHigh = (ranks: number[]): number | null => {
  const unique = [...new Set(ranks)];
  for (let high = 14; high >= 5; high -= 1) {
    const needed = high === 5 ? [5, 4, 3, 2, 14] : [high, high - 1, high - 2, high - 3, high - 4];
    if (needed.every((rank) => unique.includes(rank))) {
      return high;
    }
  }
  return null;
};

const evaluatePokerHand = (cards: PokerCard[]): PokerEvaluation => {
  const rankCounts = new Map<number, number>();
  const suitBuckets = new Map<string, PokerCard[]>();

  cards.forEach((card) => {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) ?? 0) + 1);
    const existingSuitCards = suitBuckets.get(card.suit) ?? [];
    suitBuckets.set(card.suit, [...existingSuitCards, card]);
  });

  const ranksDesc = [...new Set(cards.map((card) => card.rank))].sort((a, b) => b - a);
  const entries = [...rankCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  const flushSuitEntry = [...suitBuckets.entries()].find(([, suitCards]) => suitCards.length >= 5);
  const flushRanks = flushSuitEntry ? [...new Set(flushSuitEntry[1].map((card) => card.rank))].sort((a, b) => b - a) : [];
  const straightHigh = detectStraightHigh(ranksDesc);
  const straightFlushHigh = flushRanks.length > 0 ? detectStraightHigh(flushRanks) : null;

  if (straightFlushHigh) return { rank: 8, label: 'Straight Flush', kickers: [straightFlushHigh] };

  const quad = entries.find(([, count]) => count === 4);
  if (quad) {
    const kicker = ranksDesc.find((rank) => rank !== quad[0]) ?? 0;
    return { rank: 7, label: 'Four of a Kind', kickers: [quad[0], kicker] };
  }

  const triples = entries.filter(([, count]) => count === 3).map(([rank]) => rank).sort((a, b) => b - a);
  const pairs = entries.filter(([, count]) => count >= 2).map(([rank]) => rank).sort((a, b) => b - a);
  if (triples.length > 0 && pairs.length > 1) {
    const topTrip = triples[0];
    const topPair = pairs.find((rank) => rank !== topTrip) ?? 0;
    return { rank: 6, label: 'Full House', kickers: [topTrip, topPair] };
  }

  if (flushRanks.length >= 5) return { rank: 5, label: 'Flush', kickers: flushRanks.slice(0, 5) };
  if (straightHigh) return { rank: 4, label: 'Straight', kickers: [straightHigh] };

  if (triples.length > 0) {
    const topTrip = triples[0];
    const kickers = ranksDesc.filter((rank) => rank !== topTrip).slice(0, 2);
    return { rank: 3, label: 'Three of a Kind', kickers: [topTrip, ...kickers] };
  }

  const exactPairs = entries.filter(([, count]) => count === 2).map(([rank]) => rank).sort((a, b) => b - a);
  if (exactPairs.length >= 2) {
    const [highPair, lowPair] = exactPairs;
    const kicker = ranksDesc.find((rank) => rank !== highPair && rank !== lowPair) ?? 0;
    return { rank: 2, label: 'Two Pair', kickers: [highPair, lowPair, kicker] };
  }

  if (exactPairs.length === 1) {
    const pair = exactPairs[0];
    const kickers = ranksDesc.filter((rank) => rank !== pair).slice(0, 3);
    return { rank: 1, label: 'One Pair', kickers: [pair, ...kickers] };
  }

  return { rank: 0, label: 'High Card', kickers: ranksDesc.slice(0, 5) };
};

const comparePokerHands = (player: PokerEvaluation, opponent: PokerEvaluation): number => {
  if (player.rank !== opponent.rank) return player.rank > opponent.rank ? 1 : -1;
  const length = Math.max(player.kickers.length, opponent.kickers.length);
  for (let i = 0; i < length; i += 1) {
    const playerValue = player.kickers[i] ?? 0;
    const opponentValue = opponent.kickers[i] ?? 0;
    if (playerValue !== opponentValue) return playerValue > opponentValue ? 1 : -1;
  }
  return 0;
};

const getOutcomeColor = (outcome: ResultOutcome) => {
  if (outcome === 'win') return THEME.colors.emerald;
  if (outcome === 'push') return THEME.colors.warning;
  return THEME.colors.ruby;
};

const DistrictActivityScreen = ({ districtId, districtName, cityColor, onBack, onOpenBlackMarket }: DistrictActivityScreenProps) => {
  const [cash, setCash] = useState(0);
  const [jewels, setJewels] = useState<Record<string, number>>({});
  const [crewStates, setCrewStates] = useState<CrewStateRow[]>([]);
  const [acting, setActing] = useState(false);
  const [betByActivity, setBetByActivity] = useState<Record<string, string>>({});
  const [resultsByActivity, setResultsByActivity] = useState<Record<string, ActivityResult>>({});
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [dockDiceRoll, setDockDiceRoll] = useState<{ player: number[]; opponent: number[] } | null>(null);
  const [monteCards, setMonteCards] = useState<string[]>([]);
  const [monteDealtCount, setMonteDealtCount] = useState(0);
  const [monteRevealed, setMonteRevealed] = useState(false);
  const [monteSelectedIndex, setMonteSelectedIndex] = useState<number | null>(null);
  const [pokerRound, setPokerRound] = useState<PokerRoundState | null>(null);
  const [fightMatchup, setFightMatchup] = useState<Fighter[]>([]);
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [fightWinnerId, setFightWinnerId] = useState<string | null>(null);
  const [selectedTrainCrewId, setSelectedTrainCrewId] = useState<string | null>(null);

  const activities = DISTRICT_ACTIVITIES[districtId] || [];
  const gamblingConfig = GAMBLING_CONFIG[districtId];
  const fenceRates = FENCE_RATES[districtId];

  const unlockedCrewIds = useMemo(
    () => new Set(crewStates.filter((state) => state.unlocked).map((state) => state.crew_id)),
    [crewStates],
  );

  const pressFeedback = (id: string) => {
    setPressedButton(id);
    SFX.buttonTap();
    try { navigator.vibrate?.(12); } catch {}
    window.setTimeout(() => setPressedButton((prev) => (prev === id ? null : prev)), 90);
  };

  const pressedStyle = (id: string) => ({
    transform: pressedButton === id ? 'scale(0.96)' : 'scale(1)',
    filter: pressedButton === id ? 'brightness(0.9)' : 'none',
    transition: 'transform 90ms ease, filter 90ms ease',
  });

  const updateBet = (activityId: string, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBetByActivity((prev) => ({ ...prev, [activityId]: sanitized }));
  };

  const parseBet = (activityId: string) => {
    const raw = betByActivity[activityId] ?? '';
    const bet = Number.parseInt(raw, 10);
    if (!Number.isFinite(bet) || bet <= 0) {
      toast({ title: 'Enter a valid bet amount.' });
      return null;
    }
    if (!gamblingConfig) {
      toast({ title: 'No gambling config for this district yet.' });
      return null;
    }
    if (bet < gamblingConfig.minBet || bet > gamblingConfig.maxBet) {
      toast({ title: `Bet must be between $${gamblingConfig.minBet} and $${gamblingConfig.maxBet}.` });
      return null;
    }
    if (bet > cash) {
      toast({ title: 'Insufficient funds' });
      return null;
    }
    return bet;
  };

  const updateCash = async (nextCash: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('profiles').update({ cash: nextCash }).eq('id', user.id);
    if (error) {
      toast({ title: 'Action failed', description: error.message });
      return false;
    }
    setCash(nextCash);
    return true;
  };

  const setActivityResult = (activityId: string, result: ActivityResult) => {
    setResultsByActivity((prev) => ({ ...prev, [activityId]: result }));
  };

  const rollFightMatchup = () => {
    const picks = shuffleArray(FIGHTER_POOL).slice(0, 2);
    setFightMatchup(picks);
    setSelectedFighterId(null);
    setFightWinnerId(null);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [profileRes, crewRes] = await Promise.all([
        supabase.from('profiles').select('cash, jewels').eq('id', user.id).single(),
        supabase.from('crew_state').select('crew_id, unlocked, level, loyalty').eq('user_id', user.id),
      ]);

      if (profileRes.data) {
        setCash(profileRes.data.cash);
        setJewels(profileRes.data.jewels as Record<string, number>);
      }
      if (crewRes.data) setCrewStates(crewRes.data);
      setLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (activities.some((activity) => activity.id === 'fight_club') && fightMatchup.length === 0) {
      rollFightMatchup();
    }
  }, [activities, fightMatchup.length]);

  const handleGenericGamble = async (activityId: string) => {
    const bet = parseBet(activityId);
    if (!bet || !gamblingConfig || acting) return;

    setActing(true);
    const won = Math.random() < gamblingConfig.winChance;
    const payout = won ? Math.round(bet * gamblingConfig.multiplier) : 0;
    const netChange = won ? payout - bet : -bet;
    const ok = await updateCash(cash + netChange);
    setActing(false);
    if (!ok) return;

    setActivityResult(activityId, { outcome: won ? 'win' : 'loss', amount: won ? payout : bet });
    setBetByActivity((prev) => ({ ...prev, [activityId]: '' }));
    won ? Haptics.success() : Haptics.fail();
    toast({ title: won ? '🎉 You won!' : '💸 You lost.', description: won ? `+$${payout.toLocaleString()}` : `-$${bet.toLocaleString()}` });
  };

  const handleDockDice = async (activityId: string) => {
    const bet = parseBet(activityId);
    if (!bet || acting) return;

    setActing(true);
    const playerDice = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    const opponentDice = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    const playerTotal = playerDice[0] + playerDice[1];
    const opponentTotal = opponentDice[0] + opponentDice[1];
    setDockDiceRoll({ player: playerDice, opponent: opponentDice });

    let outcome: ResultOutcome = 'push';
    let amount = 0;
    let netChange = 0;
    if (playerTotal > opponentTotal) {
      outcome = 'win';
      amount = Math.round(bet * 2.1);
      netChange = amount - bet;
    } else if (playerTotal < opponentTotal) {
      outcome = 'loss';
      amount = bet;
      netChange = -bet;
    }

    const ok = netChange === 0 ? true : await updateCash(cash + netChange);
    setActing(false);
    if (!ok) return;

    setActivityResult(activityId, { outcome, amount, detail: `You ${playerTotal} vs Opponent ${opponentTotal}` });
    if (outcome === 'win') Haptics.success();
    if (outcome === 'loss') Haptics.fail();
  };

  const handleCardSharkDeal = (activityId: string) => {
    const bet = parseBet(activityId);
    if (!bet || acting) return;

    setMonteCards(shuffleArray(['Q', 'J', 'J']));
    setMonteDealtCount(0);
    setMonteRevealed(false);
    setMonteSelectedIndex(null);
    setActivityResult(activityId, { outcome: 'push', amount: 0, detail: 'Follow the queen carefully.' });
    [1, 2, 3].forEach((step) => window.setTimeout(() => setMonteDealtCount(step), step * 180));
  };

  const handleCardSharkPick = async (activityId: string, index: number) => {
    if (monteDealtCount < 3 || monteRevealed || acting) return;
    const bet = parseBet(activityId);
    if (!bet) return;

    setActing(true);
    setMonteSelectedIndex(index);
    setMonteRevealed(true);

    const won = monteCards[index] === 'Q';
    const payout = won ? Math.round(bet * 2.8) : 0;
    const netChange = won ? payout - bet : -bet;
    const ok = await updateCash(cash + netChange);
    setActing(false);
    if (!ok) return;

    setActivityResult(activityId, {
      outcome: won ? 'win' : 'loss',
      amount: won ? payout : bet,
      detail: won ? 'Clean read. You tracked the queen.' : 'The dealer burned you.',
    });
    won ? Haptics.success() : Haptics.fail();
  };

  const handlePokerDeal = (activityId: string) => {
    const bet = parseBet(activityId);
    if (!bet || acting) return;
    const deck = createPokerDeck();
    setPokerRound({
      phase: 'decision',
      playerHole: deck.slice(0, 2),
      opponentHole: deck.slice(2, 4),
      community: [],
      deck: deck.slice(4),
    });
  };

  const handlePokerDecision = async (activityId: string, action: 'fold' | 'call') => {
    if (!pokerRound || acting) return;
    const bet = parseBet(activityId);
    if (!bet) return;

    setActing(true);
    const community = pokerRound.deck.slice(0, 5);
    const playerEval = evaluatePokerHand([...pokerRound.playerHole, ...community]);
    const opponentEval = evaluatePokerHand([...pokerRound.opponentHole, ...community]);

    let outcome: ResultOutcome = 'loss';
    let amount = bet;
    let netChange = -Math.round(bet * 0.5);
    let summary = `You folded and gave up $${Math.round(bet * 0.5)}.`;

    if (action === 'call') {
      const winner = comparePokerHands(playerEval, opponentEval);
      if (winner > 0) {
        amount = Math.round(bet * 2.4);
        outcome = 'win';
        netChange = amount - bet;
        summary = `You win the pot: ${playerEval.label} beats ${opponentEval.label}.`;
      } else if (winner === 0) {
        amount = bet;
        outcome = 'push';
        netChange = 0;
        summary = `Split pot: both hands are ${playerEval.label}.`;
      } else {
        amount = bet;
        outcome = 'loss';
        netChange = -bet;
        summary = `Opponent wins with ${opponentEval.label}.`;
      }
    }

    const ok = netChange === 0 ? true : await updateCash(cash + netChange);
    setActing(false);
    if (!ok) return;

    setPokerRound({
      phase: 'showdown',
      playerHole: pokerRound.playerHole,
      opponentHole: pokerRound.opponentHole,
      community,
      deck: pokerRound.deck.slice(5),
      summary,
      playerHand: playerEval.label,
      opponentHand: opponentEval.label,
    });

    setActivityResult(activityId, { outcome, amount, detail: summary });
    if (outcome === 'win') Haptics.success();
    if (outcome === 'loss') Haptics.fail();
  };

  const handleFightBet = async (activityId: string) => {
    const bet = parseBet(activityId);
    if (!bet || acting) return;
    if (fightMatchup.length !== 2 || !selectedFighterId) {
      toast({ title: 'Pick a fighter first.' });
      return;
    }

    setActing(true);
    const [a, b] = fightMatchup;
    const winner = Math.random() * (a.power + b.power) <= a.power ? a : b;
    const won = winner.id === selectedFighterId;
    const payout = won ? Math.round(bet * 2.6) : 0;
    const netChange = won ? payout - bet : -bet;
    const ok = await updateCash(cash + netChange);
    setActing(false);
    if (!ok) return;

    setFightWinnerId(winner.id);
    setActivityResult(activityId, { outcome: won ? 'win' : 'loss', amount: won ? payout : bet, detail: `${winner.name} took the fight.` });
    won ? Haptics.success() : Haptics.fail();
  };

  const handleSellJewel = async (jewelType: string) => {
    if (acting || !fenceRates || !fenceRates[jewelType]) return;
    const count = jewels[jewelType] || 0;
    if (count <= 0) return;

    setActing(true);
    const salePrice = fenceRates[jewelType];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const newJewels = { ...jewels, [jewelType]: count - 1 };
    await supabase.from('profiles').update({ cash: cash + salePrice, jewels: newJewels as any }).eq('id', user.id);
    setCash(cash + salePrice);
    setJewels(newJewels);
    setActing(false);
    Haptics.jewelDrop();
    toast({ title: `${jewelEmojis[jewelType]} Sold!`, description: `+$${salePrice.toLocaleString()}` });
  };

  const handleTraining = async (type: 'level_up' | 'loyalty_boost') => {
    if (acting) return;
    if (!selectedTrainCrewId) { toast({ title: 'Select a crew member first' }); return; }
    const cost = type === 'level_up' ? TRAINING_COST.level_up : TRAINING_COST.loyalty_boost;
    if (cash < cost) { toast({ title: 'Insufficient funds' }); return; }

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash - cost }).eq('id', user.id);

    const crewState = crewStates.find(cs => cs.crew_id === selectedTrainCrewId);
    if (crewState) {
      if (type === 'level_up') {
        await supabase.from('crew_state').update({ level: (crewState.level || 1) + 1 }).eq('user_id', user.id).eq('crew_id', selectedTrainCrewId);
      } else {
        await supabase.from('crew_state').update({ loyalty: Math.min(100, (crewState.loyalty || 60) + 5) }).eq('user_id', user.id).eq('crew_id', selectedTrainCrewId);
      }
    }

    // Refresh crew states
    const { data: freshCrew } = await supabase.from('crew_state').select('crew_id, unlocked, level, loyalty').eq('user_id', user.id);
    if (freshCrew) setCrewStates(freshCrew);

    const member = CREW_MEMBERS.find(m => m.id === selectedTrainCrewId);
    const memberName = member ? member.name : selectedTrainCrewId;
    setCash(cash - cost);
    setActing(false);
    Haptics.success();
    toast({ title: type === 'level_up' ? `⬆ ${memberName} Leveled Up!` : `❤️ ${memberName}'s Loyalty Boosted!`, description: `Cost: $${cost}` });
  };

  const handleIntel = async (type: string) => {
    if (acting) return;
    const cost = type === 'vault_info' ? INTEL_COST.vault_info : type === 'chaos_preview' ? INTEL_COST.chaos_preview : INTEL_COST.district_heat_reset;
    if (cash < cost) { toast({ title: 'Insufficient funds' }); return; }

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    await supabase.from('profiles').update({ cash: cash - cost }).eq('id', user.id);
    setCash(cash - cost);
    setActing(false);
    Haptics.success();

    const messages: Record<string, string> = {
      vault_info: '📋 Intel acquired. Security details will be shown on your next job.',
      chaos_preview: '🔮 Chaos forecast available for your next heist.',
      district_heat_reset: '❄️ District heat has been cooled down.',
    };
    toast({ title: 'Intel Acquired', description: messages[type] || 'Information received.' });
  };

  const handleRecruit = async (crewId: string) => {
    if (acting) return;
    const member = CREW_MEMBERS.find((crew) => crew.id === crewId);
    if (!member) return;
    if (unlockedCrewIds.has(crewId)) {
      toast({ title: `${member.name} is already in your network.` });
      return;
    }
    if (cash < member.baseCost) {
      toast({ title: 'Insufficient funds' });
      return;
    }

    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActing(false); return; }

    const nextCash = cash - member.baseCost;
    await supabase.from('profiles').update({ cash: nextCash }).eq('id', user.id);
    const existing = crewStates.find((state) => state.crew_id === crewId);
    if (existing) {
      await supabase.from('crew_state').update({ unlocked: true }).eq('user_id', user.id).eq('crew_id', crewId);
      setCrewStates((prev) => prev.map((row) => (row.crew_id === crewId ? { ...row, unlocked: true } : row)));
    } else {
      await supabase.from('crew_state').insert({ user_id: user.id, crew_id: crewId, unlocked: true, level: 1, loyalty: 60 });
      setCrewStates((prev) => [...prev, { crew_id: crewId, unlocked: true }]);
    }

    setCash(nextCash);
    setActing(false);
    Haptics.success();
    toast({ title: `${member.emoji} ${member.name} recruited`, description: `${member.role} unlocked for heists.` });
  };

  if (!loaded) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={{ ...S.page, paddingBottom: 116, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: `${THEME.space.md}px ${THEME.space.md}px` }}>
        <button
          onClick={onBack}
          onPointerDown={() => pressFeedback('back')}
          style={{
            ...pressedStyle('back'),
            background: 'none', border: 'none', color: THEME.colors.textMuted,
            fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 2,
            cursor: 'pointer', marginBottom: THEME.space.md, padding: `${THEME.space.sm}px 0`, minHeight: 44,
          }}
        >
          ← BACK TO MAP
        </button>

        <div style={{ ...S.eyebrow, color: cityColor }}>{districtName.toUpperCase()}</div>
        <h1 style={{ ...S.h1, fontSize: 18, marginBottom: THEME.space.xs, color: cityColor }}>DISTRICT ACTIVITIES</h1>
        <div style={{ fontSize: 12, fontFamily: THEME.fonts.mono, color: THEME.colors.gold, marginBottom: THEME.space.md }}>
          ${cash.toLocaleString()} on hand
        </div>

        {activities.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', padding: THEME.space.xl }}>
            <div style={{ fontSize: 36, marginBottom: THEME.space.md }}>🌙</div>
            <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
              Nothing happening here... yet.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.sm }}>
          {activities.map((activity) => {
            const result = resultsByActivity[activity.id];
            const recruitOptions = (RECRUITER_POOLS[activity.id] || [])
              .map((id) => CREW_MEMBERS.find((member) => member.id === id))
              .filter(Boolean) as Array<(typeof CREW_MEMBERS)[number]>;

            return (
              <div key={activity.id} style={{ ...S.card, position: 'relative', overflow: 'hidden', padding: `${THEME.space.md}px ${THEME.space.md}px ${THEME.space.md}px ${THEME.space.md + 6}px` }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cityColor }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm, marginBottom: THEME.space.xs }}>
                  <span style={{ fontSize: 22 }}>{activity.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: THEME.fonts.display, fontSize: 12, color: THEME.colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' }}>
                      {activity.name}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: THEME.fonts.body, color: THEME.colors.textSecondary, lineHeight: 1.4 }}>
                      {activity.description}
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily: THEME.fonts.body, fontSize: 9, fontStyle: 'italic', color: THEME.colors.textMuted, marginBottom: THEME.space.sm, marginTop: 0 }}>
                  "{activity.lore}"
                </p>

                {activity.type === 'gambling' && gamblingConfig && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs }}>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                      BET: ${gamblingConfig.minBet}–${gamblingConfig.maxBet} | BASE WIN: {Math.round(gamblingConfig.winChance * 100)}%
                    </div>

                    {activity.id === 'dock_dice' && (
                      <>
                        <div style={{ display: 'flex', gap: THEME.space.xs }}>
                          <input type="number" inputMode="numeric" value={betByActivity[activity.id] ?? ''} onChange={(event) => updateBet(activity.id, event.target.value)} placeholder={`$${gamblingConfig.minBet}+`}
                            style={{ flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, borderRadius: THEME.radius.sm, padding: '10px 12px', fontFamily: THEME.fonts.mono, fontSize: 14, color: THEME.colors.textPrimary, outline: 'none', minWidth: 0 }} />
                          <button onClick={() => handleDockDice(activity.id)} onPointerDown={() => pressFeedback(`dock-roll-${activity.id}`)} disabled={acting || !(betByActivity[activity.id] ?? '')}
                            style={{ ...S.btnPrimary, ...pressedStyle(`dock-roll-${activity.id}`), width: 'auto', padding: '10px 16px', fontSize: 10, minHeight: 44 }}>
                            ROLL DICE
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: THEME.space.sm }}>
                          <div style={{ ...S.card, flex: 1, padding: THEME.space.sm, background: THEME.colors.dusk }}>
                            <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: 4 }}>YOU</div>
                            <div style={{ fontSize: 24 }}>{dockDiceRoll ? dockDiceRoll.player.map((die, idx) => <span key={idx}>{DICE_FACES[die - 1]} </span>) : '⚀ ⚀'}</div>
                          </div>
                          <div style={{ ...S.card, flex: 1, padding: THEME.space.sm, background: THEME.colors.dusk }}>
                            <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: 4 }}>OPPONENT</div>
                            <div style={{ fontSize: 24 }}>{dockDiceRoll ? dockDiceRoll.opponent.map((die, idx) => <span key={idx}>{DICE_FACES[die - 1]} </span>) : '⚀ ⚀'}</div>
                          </div>
                        </div>
                      </>
                    )}

                    {activity.id === 'card_shark' && (
                      <>
                        <div style={{ display: 'flex', gap: THEME.space.xs }}>
                          <input type="number" inputMode="numeric" value={betByActivity[activity.id] ?? ''} onChange={(event) => updateBet(activity.id, event.target.value)} placeholder={`$${gamblingConfig.minBet}+`}
                            style={{ flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, borderRadius: THEME.radius.sm, padding: '10px 12px', fontFamily: THEME.fonts.mono, fontSize: 14, color: THEME.colors.textPrimary, outline: 'none', minWidth: 0 }} />
                          <button onClick={() => handleCardSharkDeal(activity.id)} onPointerDown={() => pressFeedback(`monte-deal-${activity.id}`)} disabled={acting || !(betByActivity[activity.id] ?? '')}
                            style={{ ...S.btnPrimary, ...pressedStyle(`monte-deal-${activity.id}`), width: 'auto', padding: '10px 16px', fontSize: 10, minHeight: 44 }}>
                            DEAL
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: THEME.space.xs }}>
                          {[0, 1, 2].map((index) => {
                            const dealt = index < monteDealtCount;
                            const selected = monteSelectedIndex === index;
                            const cardValue = monteCards[index];
                            const isFaceUp = monteRevealed && dealt;
                            return (
                              <button key={index} onClick={() => handleCardSharkPick(activity.id, index)} onPointerDown={() => pressFeedback(`monte-card-${index}`)} disabled={!dealt || monteRevealed || acting}
                                style={{ flex: 1, minHeight: 92, borderRadius: THEME.radius.sm, border: `1px solid ${selected ? THEME.colors.gold : THEME.colors.borderFaint}`, background: isFaceUp ? `${THEME.colors.gold}12` : THEME.colors.dusk, color: THEME.colors.textPrimary, fontFamily: THEME.fonts.display, fontSize: 20, cursor: dealt && !monteRevealed ? 'pointer' : 'default', ...pressedStyle(`monte-card-${index}`) }}>
                                {!dealt ? '—' : isFaceUp ? (cardValue === 'Q' ? 'Q♠' : 'J♣') : '🂠'}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>Watch the deal, then tap the card hiding the queen.</div>
                      </>
                    )}

                    {activity.id === 'high_stakes' && (
                      <>
                        <div style={{ display: 'flex', gap: THEME.space.xs }}>
                          <input type="number" inputMode="numeric" value={betByActivity[activity.id] ?? ''} onChange={(event) => updateBet(activity.id, event.target.value)} placeholder={`$${gamblingConfig.minBet}+`}
                            style={{ flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, borderRadius: THEME.radius.sm, padding: '10px 12px', fontFamily: THEME.fonts.mono, fontSize: 14, color: THEME.colors.textPrimary, outline: 'none', minWidth: 0 }} />
                          <button onClick={() => handlePokerDeal(activity.id)} onPointerDown={() => pressFeedback(`poker-deal-${activity.id}`)} disabled={acting || !(betByActivity[activity.id] ?? '') || pokerRound?.phase === 'decision'}
                            style={{ ...S.btnPrimary, ...pressedStyle(`poker-deal-${activity.id}`), width: 'auto', padding: '10px 16px', fontSize: 10, minHeight: 44 }}>
                            DEAL HAND
                          </button>
                        </div>

                        {pokerRound && (
                          <div style={{ ...S.card, background: THEME.colors.dusk, padding: THEME.space.sm }}>
                            <div style={{ fontSize: 9, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: 6 }}>TEXAS HOLD'EM TABLE</div>

                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              {pokerRound.playerHole.map((card, idx) => (
                                <div key={`player-${idx}`} style={{ width: 42, minHeight: 58, borderRadius: THEME.radius.sm, border: `1px solid ${THEME.colors.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: THEME.fonts.display, color: card.suit === '♥' || card.suit === '♦' ? THEME.colors.ruby : THEME.colors.textPrimary }}>
                                  {card.label}{card.suit}
                                </div>
                              ))}
                              <div style={{ fontSize: 10, color: THEME.colors.textMuted, alignSelf: 'center', marginLeft: 6 }}>YOUR HOLE</div>
                            </div>

                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              {(pokerRound.phase === 'showdown' ? pokerRound.community : new Array(5).fill(null)).map((card, idx) => (
                                <div key={`community-${idx}`} style={{ width: 38, minHeight: 52, borderRadius: THEME.radius.sm, border: `1px solid ${THEME.colors.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: THEME.fonts.display, fontSize: 14, color: card && (card.suit === '♥' || card.suit === '♦') ? THEME.colors.ruby : THEME.colors.textPrimary }}>
                                  {card ? `${card.label}${card.suit}` : '🂠'}
                                </div>
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              {pokerRound.opponentHole.map((card, idx) => (
                                <div key={`opponent-${idx}`} style={{ width: 42, minHeight: 58, borderRadius: THEME.radius.sm, border: `1px solid ${THEME.colors.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: THEME.fonts.display, color: card.suit === '♥' || card.suit === '♦' ? THEME.colors.ruby : THEME.colors.textPrimary }}>
                                  {pokerRound.phase === 'showdown' ? `${card.label}${card.suit}` : '🂠'}
                                </div>
                              ))}
                              <div style={{ fontSize: 10, color: THEME.colors.textMuted, alignSelf: 'center', marginLeft: 6 }}>OPPONENT</div>
                            </div>

                            {pokerRound.phase === 'decision' && (
                              <div style={{ display: 'flex', gap: THEME.space.xs }}>
                                <button onClick={() => handlePokerDecision(activity.id, 'fold')} onPointerDown={() => pressFeedback(`poker-fold-${activity.id}`)} disabled={acting} style={{ ...S.btnGhost, ...pressedStyle(`poker-fold-${activity.id}`), minHeight: 44, fontSize: 10 }}>FOLD</button>
                                <button onClick={() => handlePokerDecision(activity.id, 'call')} onPointerDown={() => pressFeedback(`poker-call-${activity.id}`)} disabled={acting} style={{ ...S.btnPrimary, ...pressedStyle(`poker-call-${activity.id}`), minHeight: 44, fontSize: 10 }}>CALL</button>
                              </div>
                            )}

                            {pokerRound.phase === 'showdown' && (
                              <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textSecondary, lineHeight: 1.5 }}>
                                <div>{pokerRound.summary}</div>
                                <div>YOU: {pokerRound.playerHand} • OPPONENT: {pokerRound.opponentHand}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {activity.id === 'fight_club' && (
                      <>
                        <div style={{ display: 'flex', gap: THEME.space.xs }}>
                          <input type="number" inputMode="numeric" value={betByActivity[activity.id] ?? ''} onChange={(event) => updateBet(activity.id, event.target.value)} placeholder={`$${gamblingConfig.minBet}+`}
                            style={{ flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, borderRadius: THEME.radius.sm, padding: '10px 12px', fontFamily: THEME.fonts.mono, fontSize: 14, color: THEME.colors.textPrimary, outline: 'none', minWidth: 0 }} />
                          <button onClick={rollFightMatchup} onPointerDown={() => pressFeedback(`fight-roll-${activity.id}`)} style={{ ...S.btnGhost, ...pressedStyle(`fight-roll-${activity.id}`), width: 'auto', padding: '10px 12px', fontSize: 10, minHeight: 44 }}>NEW FIGHTERS</button>
                        </div>

                        <div style={{ display: 'flex', gap: THEME.space.xs }}>
                          {fightMatchup.map((fighter) => {
                            const selected = selectedFighterId === fighter.id;
                            const winner = fightWinnerId === fighter.id;
                            return (
                              <button key={fighter.id} onClick={() => setSelectedFighterId(fighter.id)} onPointerDown={() => pressFeedback(`fighter-${fighter.id}`)}
                                style={{ ...pressedStyle(`fighter-${fighter.id}`), flex: 1, minHeight: 88, borderRadius: THEME.radius.sm, border: `1px solid ${winner ? THEME.colors.emerald : selected ? THEME.colors.gold : THEME.colors.borderFaint}`, background: THEME.colors.dusk, color: THEME.colors.textPrimary, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                                <span style={{ fontSize: 24 }}>{fighter.emoji}</span>
                                <span style={{ fontSize: 10, fontFamily: THEME.fonts.display, letterSpacing: 1 }}>{fighter.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button onClick={() => handleFightBet(activity.id)} onPointerDown={() => pressFeedback(`fight-bet-${activity.id}`)} disabled={!selectedFighterId || acting || !(betByActivity[activity.id] ?? '')}
                          style={{ ...S.btnPrimary, ...pressedStyle(`fight-bet-${activity.id}`), minHeight: 44, fontSize: 10 }}>
                          BET ON SELECTED FIGHTER
                        </button>
                      </>
                    )}

                    {!['dock_dice', 'card_shark', 'high_stakes', 'fight_club'].includes(activity.id) && (
                      <div style={{ display: 'flex', gap: THEME.space.xs }}>
                        <input type="number" inputMode="numeric" value={betByActivity[activity.id] ?? ''} onChange={(event) => updateBet(activity.id, event.target.value)} placeholder={`$${gamblingConfig.minBet}+`}
                          style={{ flex: 1, background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, borderRadius: THEME.radius.sm, padding: '10px 12px', fontFamily: THEME.fonts.mono, fontSize: 14, color: THEME.colors.textPrimary, outline: 'none', minWidth: 0 }} />
                        <button onClick={() => handleGenericGamble(activity.id)} onPointerDown={() => pressFeedback(`bet-${activity.id}`)} disabled={acting || !(betByActivity[activity.id] ?? '')}
                          style={{ ...S.btnPrimary, ...pressedStyle(`bet-${activity.id}`), width: 'auto', padding: '10px 20px', fontSize: 11, minHeight: 44 }}>BET</button>
                      </div>
                    )}
                  </div>
                )}

                {activity.type === 'fence' && fenceRates && (
                  <div>
                    <div style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted, marginBottom: THEME.space.xs }}>SELL JEWELS FOR CASH</div>
                    <div style={{ display: 'flex', gap: THEME.space.xs, flexWrap: 'wrap' }}>
                      {Object.entries(fenceRates).map(([type, price]) => {
                        const count = jewels[type] || 0;
                        return (
                          <button key={type} onClick={() => handleSellJewel(type)} onPointerDown={() => pressFeedback(`fence-${type}`)} disabled={count <= 0 || acting}
                            style={{ ...pressedStyle(`fence-${type}`), padding: '8px 12px', borderRadius: THEME.radius.sm, cursor: count > 0 ? 'pointer' : 'default', background: THEME.colors.dusk, border: `1px solid ${THEME.colors.borderFaint}`, opacity: count > 0 ? 1 : 0.3, fontSize: 11, fontFamily: THEME.fonts.mono, color: THEME.colors.textPrimary, display: 'flex', alignItems: 'center', gap: 4, minHeight: 44 }}>
                            {jewelEmojis[type]}{count} → ${price}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activity.type === 'training' && (
                  <div style={{ display: 'flex', gap: THEME.space.xs }}>
                    <button onClick={() => handleTraining('level_up')} onPointerDown={() => pressFeedback(`train-level-${activity.id}`)} disabled={acting || cash < TRAINING_COST.level_up}
                      style={{ ...S.btnPrimary, ...pressedStyle(`train-level-${activity.id}`), flex: 1, fontSize: 10, padding: '10px 8px', minHeight: 44, opacity: cash < TRAINING_COST.level_up ? 0.4 : 1 }}>⬆ LEVEL UP (${TRAINING_COST.level_up})</button>
                    <button onClick={() => handleTraining('loyalty_boost')} onPointerDown={() => pressFeedback(`train-loyalty-${activity.id}`)} disabled={acting || cash < TRAINING_COST.loyalty_boost}
                      style={{ ...S.btnGhost, ...pressedStyle(`train-loyalty-${activity.id}`), flex: 1, fontSize: 10, padding: '10px 8px', minHeight: 44, opacity: cash < TRAINING_COST.loyalty_boost ? 0.4 : 1 }}>❤️ LOYALTY (${TRAINING_COST.loyalty_boost})</button>
                  </div>
                )}

                {activity.type === 'intel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs }}>
                    {[
                      { type: 'vault_info', label: 'VAULT INTEL', cost: INTEL_COST.vault_info, emoji: '📋' },
                      { type: 'chaos_preview', label: 'CHAOS FORECAST', cost: INTEL_COST.chaos_preview, emoji: '🔮' },
                      { type: 'heat_reset', label: 'COOL HEAT', cost: INTEL_COST.district_heat_reset, emoji: '❄️' },
                    ].map((item) => (
                      <button key={item.type} onClick={() => handleIntel(item.type)} onPointerDown={() => pressFeedback(`intel-${item.type}-${activity.id}`)} disabled={acting || cash < item.cost}
                        style={{ ...S.btnGhost, ...pressedStyle(`intel-${item.type}-${activity.id}`), fontSize: 10, padding: '10px 12px', minHeight: 44, display: 'flex', justifyContent: 'space-between', opacity: cash < item.cost ? 0.4 : 1 }}>
                        <span>{item.emoji} {item.label}</span>
                        <span style={{ color: THEME.colors.gold }}>${item.cost}</span>
                      </button>
                    ))}
                  </div>
                )}

                {activity.type === 'shop' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs }}>
                    {activity.id === 'market_shop' ? (
                      <button onClick={onOpenBlackMarket} onPointerDown={() => pressFeedback(`shop-black-market-${activity.id}`)} style={{ ...S.btnPrimary, ...pressedStyle(`shop-black-market-${activity.id}`), minHeight: 44, fontSize: 10 }}>
                        ENTER BLACK MARKET
                      </button>
                    ) : (
                      <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                        Visit the Black Market or Empire screen for purchases.
                      </div>
                    )}
                  </div>
                )}

                {activity.type === 'recruitment' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.xs }}>
                    {recruitOptions.length > 0 ? (
                      <>
                        <div style={{ fontSize: 10, fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>UNIQUE CONTRACTS AVAILABLE</div>
                        {recruitOptions.map((member) => {
                          const recruited = unlockedCrewIds.has(member.id);
                          return (
                            <div key={member.id} style={{ ...S.card, background: THEME.colors.dusk, padding: THEME.space.sm }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: THEME.space.sm }}>
                                <div style={{ fontSize: 24 }}>{member.emoji}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textPrimary, letterSpacing: 1 }}>{member.name}</div>
                                  <div style={{ fontFamily: THEME.fonts.mono, fontSize: 9, color: THEME.colors.textMuted }}>{member.role}</div>
                                </div>
                                <button onClick={() => handleRecruit(member.id)} onPointerDown={() => pressFeedback(`recruit-${member.id}`)} disabled={recruited || acting || cash < member.baseCost}
                                  style={{ ...S.btnPrimary, ...pressedStyle(`recruit-${member.id}`), width: 'auto', minHeight: 40, padding: '8px 10px', fontSize: 9, opacity: recruited || cash < member.baseCost ? 0.4 : 1 }}>
                                  {recruited ? 'RECRUITED' : `HIRE $${member.baseCost.toLocaleString()}`}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div style={{ fontSize: 11, fontFamily: THEME.fonts.body, fontStyle: 'italic', color: THEME.colors.textMuted }}>
                        Visit the Crew screen to recruit new members.
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <div style={{ marginTop: THEME.space.sm, padding: THEME.space.sm, borderRadius: THEME.radius.sm, background: `${getOutcomeColor(result.outcome)}15`, border: `1px solid ${getOutcomeColor(result.outcome)}40`, color: getOutcomeColor(result.outcome), fontSize: 11, fontFamily: THEME.fonts.display, textAlign: 'center', letterSpacing: 1 }}>
                    {result.outcome === 'win' && `WON $${result.amount.toLocaleString()}`}
                    {result.outcome === 'loss' && `LOST $${result.amount.toLocaleString()}`}
                    {result.outcome === 'push' && 'PUSH'}
                    {result.detail && <div style={{ marginTop: 4, fontSize: 9, color: THEME.colors.textSecondary }}>{result.detail}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistrictActivityScreen;