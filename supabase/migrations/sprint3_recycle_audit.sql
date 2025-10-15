-- Sprint 3: Recycle Bin + Audit Log + Purge RPCs
-- Creates audit log table, triggers for teams/players, and purge functions

-- ================================================================
-- 1. AUDIT LOG TABLE
-- ================================================================
create table if not exists public.touchbase_audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.touchbase_organizations(id) on delete cascade,
  entity text not null check (entity in ('team','player')),
  entity_id uuid not null,
  action text not null check (action in ('create','update','soft_delete','restore','purge')),
  actor uuid, -- auth.uid() cuando aplique
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS: solo miembros de la org pueden leer
alter table public.touchbase_audit_log enable row level security;

drop policy if exists "touchbase_audit_select_members" on public.touchbase_audit_log;
create policy "touchbase_audit_select_members" on public.touchbase_audit_log
for select using (public.touchbase_is_org_member(org_id));

-- ================================================================
-- 2. AUDIT TRIGGERS FOR TEAMS
-- ================================================================
create or replace function public.touchbase_audit_team()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare v_actor uuid := auth.uid();
begin
  if TG_OP = 'INSERT' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
    values (NEW.org_id, 'team', NEW.id, 'create', v_actor, jsonb_build_object('name', NEW.name));
    return NEW;
  elsif TG_OP = 'UPDATE' then
    if NEW.deleted_at is not null and OLD.deleted_at is null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id, 'team', NEW.id, 'soft_delete', v_actor);
    elsif NEW.deleted_at is null and OLD.deleted_at is not null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id, 'team', NEW.id, 'restore', v_actor);
    else
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
      values (NEW.org_id, 'team', NEW.id, 'update', v_actor,
              jsonb_build_object('name_old', OLD.name, 'name_new', NEW.name));
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
    values (OLD.org_id, 'team', OLD.id, 'purge', v_actor);
    return OLD;
  end if;
  return null;
end; $$;

drop trigger if exists touchbase_audit_team_tr_ins on public.touchbase_teams;
drop trigger if exists touchbase_audit_team_tr_upd on public.touchbase_teams;
drop trigger if exists touchbase_audit_team_tr_del on public.touchbase_teams;

create trigger touchbase_audit_team_tr_ins after insert on public.touchbase_teams
for each row execute function public.touchbase_audit_team();

create trigger touchbase_audit_team_tr_upd after update on public.touchbase_teams
for each row execute function public.touchbase_audit_team();

create trigger touchbase_audit_team_tr_del after delete on public.touchbase_teams
for each row execute function public.touchbase_audit_team();

-- ================================================================
-- 3. AUDIT TRIGGERS FOR PLAYERS
-- ================================================================
create or replace function public.touchbase_audit_player()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare v_actor uuid := auth.uid();
begin
  if TG_OP = 'INSERT' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
    values (NEW.org_id, 'player', NEW.id, 'create', v_actor,
            jsonb_build_object('full_name', NEW.full_name, 'team_id', NEW.team_id));
    return NEW;
  elsif TG_OP = 'UPDATE' then
    if NEW.deleted_at is not null and OLD.deleted_at is null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id, 'player', NEW.id, 'soft_delete', v_actor);
    elsif NEW.deleted_at is null and OLD.deleted_at is not null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id, 'player', NEW.id, 'restore', v_actor);
    else
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
      values (NEW.org_id, 'player', NEW.id, 'update', v_actor,
              jsonb_build_object('name_old', OLD.full_name, 'name_new', NEW.full_name,
                                 'team_old', OLD.team_id, 'team_new', NEW.team_id));
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
    values (OLD.org_id, 'player', OLD.id, 'purge', v_actor);
    return OLD;
  end if;
  return null;
end; $$;

drop trigger if exists touchbase_audit_player_tr_ins on public.touchbase_players;
drop trigger if exists touchbase_audit_player_tr_upd on public.touchbase_players;
drop trigger if exists touchbase_audit_player_tr_del on public.touchbase_players;

create trigger touchbase_audit_player_tr_ins after insert on public.touchbase_players
for each row execute function public.touchbase_audit_player();

create trigger touchbase_audit_player_tr_upd after update on public.touchbase_players
for each row execute function public.touchbase_audit_player();

create trigger touchbase_audit_player_tr_del after delete on public.touchbase_players
for each row execute function public.touchbase_audit_player();

-- ================================================================
-- 4. PURGE RPCs (Hard Delete with Role Check)
-- ================================================================

-- TEAM PURGE
create or replace function public.touchbase_purge_team(p_team uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare v_org uuid;
begin
  select org_id into v_org from public.touchbase_teams where id = p_team;
  if v_org is null then raise exception 'Team not found'; end if;
  if not public.touchbase_has_role(v_org, array['owner','admin']) then
    raise exception 'Forbidden';
  end if;
  delete from public.touchbase_teams where id = p_team;
  return true;
end; $$;

revoke all on function public.touchbase_purge_team(uuid) from anon, authenticated;
grant execute on function public.touchbase_purge_team(uuid) to authenticated;

-- PLAYER PURGE
create or replace function public.touchbase_purge_player(p_player uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare v_org uuid;
begin
  select org_id into v_org from public.touchbase_players where id = p_player;
  if v_org is null then raise exception 'Player not found'; end if;
  if not public.touchbase_has_role(v_org, array['owner','admin']) then
    raise exception 'Forbidden';
  end if;
  delete from public.touchbase_players where id = p_player;
  return true;
end; $$;

revoke all on function public.touchbase_purge_player(uuid) from anon, authenticated;
grant execute on function public.touchbase_purge_player(uuid) to authenticated;
