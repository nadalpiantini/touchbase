-- =====================================================
-- SPRINT 4: GAMES/MATCHES + SCOREBOARD
-- =====================================================

-- DROP existing tables to ensure clean schema
drop table if exists public.touchbase_game_players cascade;
drop table if exists public.touchbase_games cascade;

-- GAMES TABLE
create table public.touchbase_games (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.touchbase_organizations(id) on delete cascade,
  home_team_id uuid not null references public.touchbase_teams(id) on delete restrict,
  away_team_id uuid not null references public.touchbase_teams(id) on delete restrict,
  starts_at timestamptz not null,
  venue text,
  status text not null default 'scheduled' check (status in ('scheduled','live','final','canceled')),
  home_score int not null default 0,
  away_score int not null default 0,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- GAME ROSTER / STATS
create table public.touchbase_game_players (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.touchbase_organizations(id) on delete cascade,
  game_id uuid not null references public.touchbase_games(id) on delete cascade,
  team_id uuid not null references public.touchbase_teams(id) on delete cascade,
  player_id uuid not null references public.touchbase_players(id) on delete cascade,
  started boolean default false,
  positions text[] default '{}',
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  deleted_at timestamptz,
  unique (game_id, player_id)
);

-- INDEXES
create index if not exists idx_touchbase_games_org on public.touchbase_games(org_id) where deleted_at is null;
create index if not exists idx_touchbase_games_status on public.touchbase_games(status) where deleted_at is null;
create index if not exists idx_touchbase_games_starts on public.touchbase_games(starts_at) where deleted_at is null;
create index if not exists idx_touchbase_gp_game on public.touchbase_game_players(game_id) where deleted_at is null;
create index if not exists idx_touchbase_gp_player on public.touchbase_game_players(player_id) where deleted_at is null;

-- RLS
alter table public.touchbase_games enable row level security;
alter table public.touchbase_game_players enable row level security;

-- SELECT: miembros de la org
drop policy if exists "touchbase_games_select_members" on public.touchbase_games;
create policy "touchbase_games_select_members" on public.touchbase_games
  for select using (public.touchbase_is_org_member(org_id));

drop policy if exists "touchbase_gp_select_members" on public.touchbase_game_players;
create policy "touchbase_gp_select_members" on public.touchbase_game_players
  for select using (public.touchbase_is_org_member(org_id));

-- INSERT/UPDATE/DELETE: owner/admin/coach
drop policy if exists "touchbase_games_write" on public.touchbase_games;
create policy "touchbase_games_write" on public.touchbase_games
  for all using (public.touchbase_has_role(org_id, array['owner','admin','coach']))
  with check (public.touchbase_has_role(org_id, array['owner','admin','coach']));

drop policy if exists "touchbase_gp_write" on public.touchbase_game_players;
create policy "touchbase_gp_write" on public.touchbase_game_players
  for all using (public.touchbase_has_role(org_id, array['owner','admin','coach']))
  with check (public.touchbase_has_role(org_id, array['owner','admin','coach']));
