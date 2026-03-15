
-- Player profile
create table profiles (
  id uuid references auth.users primary key,
  display_name text not null default 'The Newcomer',
  cash integer not null default 500,
  rep_level integer not null default 1,
  rep_xp integer not null default 0,
  notoriety_title text not null default 'Street Rat',
  current_city text not null default 'new_cavendish',
  unlocked_cities text[] not null default array['new_cavendish'],
  jewels jsonb not null default '{"diamond":0,"ruby":0,"emerald":0,"sapphire":0,"pearl":0}',
  crew_insurance boolean not null default false,
  created_at timestamptz default now()
);

-- Crew member state per player
create table crew_state (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  crew_id text not null,
  loyalty integer not null default 60,
  level integer not null default 1,
  unlocked boolean not null default false
);

-- City progress per player
create table city_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  city_id text not null,
  unlocked_districts text[] not null default array[]::text[],
  district_heat jsonb not null default '{}',
  boss_vault_cleared boolean not null default false
);

-- Safehouse rooms
create table safehouse (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  rooms jsonb not null default '{"war_room":1,"vault":0,"garage":0,"study":0,"infirmary":0,"signal_room":0,"parlor":0,"penthouse":0}'
);

-- Held loot from fence
create table held_loot (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  amount integer not null,
  held_at timestamptz not null default now(),
  expires_at timestamptz not null,
  raid_chance numeric not null default 0.15
);

-- Heist history / ledger
create table heist_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  city_id text,
  vault_tier integer,
  vault_name text,
  crew_ids text[],
  chaos_card_id text,
  mini_game_results boolean[],
  jewel_drops jsonb default '{}',
  cash_spent integer,
  payout integer,
  success boolean,
  created_at timestamptz default now()
);

-- Weekly leaderboard
create table leaderboard_weekly (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  week_start date not null,
  net_cash_earned integer not null default 0,
  unique(user_id, week_start)
);

-- RLS policies
alter table profiles enable row level security;
alter table crew_state enable row level security;
alter table city_progress enable row level security;
alter table safehouse enable row level security;
alter table held_loot enable row level security;
alter table heist_history enable row level security;
alter table leaderboard_weekly enable row level security;

create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own crew" on crew_state for all using (auth.uid() = user_id);
create policy "Users manage own city progress" on city_progress for all using (auth.uid() = user_id);
create policy "Users manage own safehouse" on safehouse for all using (auth.uid() = user_id);
create policy "Users manage own held loot" on held_loot for all using (auth.uid() = user_id);
create policy "Users manage own history" on heist_history for all using (auth.uid() = user_id);
create policy "Public leaderboard read" on leaderboard_weekly for select using (true);
create policy "Users manage own leaderboard" on leaderboard_weekly for insert with check (auth.uid() = user_id);
create policy "Users update own leaderboard" on leaderboard_weekly for update using (auth.uid() = user_id);
