-- =====================================================
-- GAMES RPCs
-- =====================================================

-- Lista juegos de la org actual
create or replace function public.touchbase_list_games_current_org(
  p_status text default null, 
  p_limit int default 100
)
returns table (
  id uuid, 
  starts_at timestamptz, 
  status text, 
  home_team_id uuid, 
  away_team_id uuid, 
  home_score int, 
  away_score int, 
  venue text
)
language sql security definer set search_path=public stable as $$
  select g.id, g.starts_at, g.status, g.home_team_id, g.away_team_id, 
         g.home_score, g.away_score, g.venue
  from public.touchbase_games g
  join public.touchbase_profiles p on p.default_org_id = g.org_id
  where p.id = auth.uid()
    and g.deleted_at is null
    and (p_status is null or g.status = p_status)
  order by g.starts_at desc
  limit p_limit
$$;

revoke all on function public.touchbase_list_games_current_org(text,int) from anon, authenticated;
grant execute on function public.touchbase_list_games_current_org(text,int) to authenticated;


-- Actualizar score
create or replace function public.touchbase_update_score(
  p_game uuid, 
  p_home int, 
  p_away int
)
returns boolean language plpgsql security definer set search_path=public as $$
declare 
  v_org uuid;
begin
  select org_id into v_org from public.touchbase_games where id = p_game and deleted_at is null;
  if v_org is null then 
    raise exception 'Game not found'; 
  end if;
  if not public.touchbase_has_role(v_org, array['owner','admin','coach']) then
    raise exception 'Forbidden';
  end if;
  update public.touchbase_games
     set home_score = greatest(p_home,0), 
         away_score = greatest(p_away,0)
   where id = p_game;
  return true;
end $$;

revoke all on function public.touchbase_update_score(uuid,int,int) from anon, authenticated;
grant execute on function public.touchbase_update_score(uuid,int,int) to authenticated;


-- Setear estado
create or replace function public.touchbase_set_status(
  p_game uuid, 
  p_status text
)
returns boolean language plpgsql security definer set search_path=public as $$
declare 
  v_org uuid;
begin
  if p_status not in ('scheduled','live','final','canceled') then
    raise exception 'Invalid status';
  end if;
  select org_id into v_org from public.touchbase_games where id = p_game and deleted_at is null;
  if v_org is null then 
    raise exception 'Game not found'; 
  end if;
  if not public.touchbase_has_role(v_org, array['owner','admin','coach']) then
    raise exception 'Forbidden';
  end if;
  update public.touchbase_games set status = p_status where id = p_game;
  return true;
end $$;

revoke all on function public.touchbase_set_status(uuid,text) from anon, authenticated;
grant execute on function public.touchbase_set_status(uuid,text) to authenticated;


-- Soft delete game
create or replace function public.touchbase_soft_delete_game(p_game uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare 
  v_org uuid;
begin
  select org_id into v_org from public.touchbase_games where id = p_game and deleted_at is null;
  if v_org is null then 
    raise exception 'Game not found'; 
  end if;
  if not public.touchbase_has_role(v_org, array['owner','admin','coach']) then
    raise exception 'Forbidden';
  end if;
  update public.touchbase_games set deleted_at = now() where id = p_game;
  return true;
end $$;

revoke all on function public.touchbase_soft_delete_game(uuid) from anon, authenticated;
grant execute on function public.touchbase_soft_delete_game(uuid) to authenticated;


-- Restore game
create or replace function public.touchbase_restore_game(p_game uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare 
  v_org uuid;
begin
  select org_id into v_org from public.touchbase_games where id = p_game and deleted_at is not null;
  if v_org is null then 
    raise exception 'Game not found in recycle bin'; 
  end if;
  if not public.touchbase_has_role(v_org, array['owner','admin','coach']) then
    raise exception 'Forbidden';
  end if;
  update public.touchbase_games set deleted_at = null where id = p_game;
  return true;
end $$;

revoke all on function public.touchbase_restore_game(uuid) from anon, authenticated;
grant execute on function public.touchbase_restore_game(uuid) to authenticated;


-- Purge game (permanent delete)
create or replace function public.touchbase_purge_game(p_game uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare 
  v_org uuid;
begin
  select org_id into v_org from public.touchbase_games where id = p_game;
  if v_org is null then 
    raise exception 'Game not found'; 
  end if;
  if not public.touchbase_has_role(v_org, array['owner','admin']) then
    raise exception 'Forbidden: only owner/admin can purge';
  end if;
  delete from public.touchbase_games where id = p_game;
  return true;
end $$;

revoke all on function public.touchbase_purge_game(uuid) from anon, authenticated;
grant execute on function public.touchbase_purge_game(uuid) to authenticated;
