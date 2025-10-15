-- =====================================================
-- GAMES AUDIT LOG
-- =====================================================

create or replace function public.touchbase_audit_game()
returns trigger language plpgsql security definer set search_path=public as $$
declare 
  v_actor uuid := auth.uid();
begin
  if TG_OP='INSERT' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
    values (NEW.org_id,'game',NEW.id,'create',v_actor,
            jsonb_build_object('home',NEW.home_team_id,'away',NEW.away_team_id,'starts_at',NEW.starts_at));
    return NEW;
  elsif TG_OP='UPDATE' then
    if NEW.deleted_at is not null and OLD.deleted_at is null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id,'game',NEW.id,'soft_delete',v_actor);
    elsif NEW.deleted_at is null and OLD.deleted_at is not null then
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      values (NEW.org_id,'game',NEW.id,'restore',v_actor);
    else
      insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
      values (NEW.org_id,'game',NEW.id,'update',v_actor,
              jsonb_build_object('status_old',OLD.status,'status_new',NEW.status,
                                 'home_score',NEW.home_score,'away_score',NEW.away_score));
    end if;
    return NEW;
  elsif TG_OP='DELETE' then
    insert into public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
    values (OLD.org_id,'game',OLD.id,'purge',v_actor);
    return OLD;
  end if;
  return null;
end $$;

drop trigger if exists touchbase_audit_game_tr_ins on public.touchbase_games;
drop trigger if exists touchbase_audit_game_tr_upd on public.touchbase_games;
drop trigger if exists touchbase_audit_game_tr_del on public.touchbase_games;

create trigger touchbase_audit_game_tr_ins after insert on public.touchbase_games
for each row execute function public.touchbase_audit_game();

create trigger touchbase_audit_game_tr_upd after update on public.touchbase_games
for each row execute function public.touchbase_audit_game();

create trigger touchbase_audit_game_tr_del after delete on public.touchbase_games
for each row execute function public.touchbase_audit_game();
