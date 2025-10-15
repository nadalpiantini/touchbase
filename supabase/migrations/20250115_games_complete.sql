-- =====================================================
-- SPRINT 4: GAMES/MATCHES + SCOREBOARD (CONSOLIDATED)
-- =====================================================
-- Este archivo consolida schema, audit y RPCs en un solo archivo idempotente
-- Ejecutable múltiples veces sin errores

-- ============================================================
-- 1. FUNCIÓN HELPER: touchbase_has_role (dependency)
-- ============================================================
CREATE OR REPLACE FUNCTION public.touchbase_has_role(p_org UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.touchbase_memberships m
    WHERE m.org_id = p_org 
      AND m.user_id = auth.uid()
      AND m.role = ANY (p_roles)
  );
$$;

-- ============================================================
-- 2. DROP EXISTING TABLES (CASCADE para forzar)
-- ============================================================
DROP TABLE IF EXISTS public.touchbase_game_players CASCADE;
DROP TABLE IF EXISTS public.touchbase_games CASCADE;

-- ============================================================
-- 3. CREATE TABLES
-- ============================================================

-- GAMES TABLE
CREATE TABLE public.touchbase_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  home_team_id uuid NOT NULL REFERENCES public.touchbase_teams(id) ON DELETE RESTRICT,
  away_team_id uuid NOT NULL REFERENCES public.touchbase_teams(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  venue text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','final','canceled')),
  home_score int NOT NULL DEFAULT 0,
  away_score int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- GAME ROSTER / STATS
CREATE TABLE public.touchbase_game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.touchbase_games(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.touchbase_teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.touchbase_players(id) ON DELETE CASCADE,
  started boolean DEFAULT false,
  positions text[] DEFAULT '{}',
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (game_id, player_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_touchbase_games_org ON public.touchbase_games(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_games_status ON public.touchbase_games(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_games_starts ON public.touchbase_games(starts_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_gp_game ON public.touchbase_game_players(game_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_gp_player ON public.touchbase_game_players(player_id) WHERE deleted_at IS NULL;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
ALTER TABLE public.touchbase_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_game_players ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros de la org
DROP POLICY IF EXISTS "touchbase_games_select_members" ON public.touchbase_games;
CREATE POLICY "touchbase_games_select_members" ON public.touchbase_games
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

DROP POLICY IF EXISTS "touchbase_gp_select_members" ON public.touchbase_game_players;
CREATE POLICY "touchbase_gp_select_members" ON public.touchbase_game_players
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- INSERT/UPDATE/DELETE: owner/admin/coach
DROP POLICY IF EXISTS "touchbase_games_write" ON public.touchbase_games;
CREATE POLICY "touchbase_games_write" ON public.touchbase_games
  FOR ALL USING (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']))
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

DROP POLICY IF EXISTS "touchbase_gp_write" ON public.touchbase_game_players;
CREATE POLICY "touchbase_gp_write" ON public.touchbase_game_players
  FOR ALL USING (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']))
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- ============================================================
-- 6. ACTUALIZAR AUDIT LOG PARA GAMES
-- ============================================================

-- Crear tabla de auditoría si no existe, o actualizar constraint si ya existe
DO $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'touchbase_audit_log'
  ) THEN
    -- Crear la tabla si no existe
    CREATE TABLE public.touchbase_audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
      entity text NOT NULL CHECK (entity IN ('team','player','game')),
      entity_id uuid NOT NULL,
      action text NOT NULL CHECK (action IN ('create','update','soft_delete','restore','purge')),
      actor uuid,
      meta jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );

    -- Habilitar RLS
    ALTER TABLE public.touchbase_audit_log ENABLE ROW LEVEL SECURITY;

    -- Crear política de lectura
    CREATE POLICY "touchbase_audit_select_members" ON public.touchbase_audit_log
    FOR SELECT USING (public.touchbase_is_org_member(org_id));
  ELSE
    -- Si la tabla ya existe, actualizar el constraint para incluir 'game'
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'touchbase_audit_log_entity_check'
      AND conrelid = 'public.touchbase_audit_log'::regclass
    ) THEN
      ALTER TABLE public.touchbase_audit_log
      DROP CONSTRAINT touchbase_audit_log_entity_check;
    END IF;

    ALTER TABLE public.touchbase_audit_log
    ADD CONSTRAINT touchbase_audit_log_entity_check
    CHECK (entity IN ('team','player','game'));
  END IF;
END $$;

-- ============================================================
-- 7. AUDIT TRIGGERS FOR GAMES
-- ============================================================
CREATE OR REPLACE FUNCTION public.touchbase_audit_game()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_actor uuid := auth.uid();
BEGIN
  IF TG_OP='INSERT' THEN
    INSERT INTO public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
    VALUES (NEW.org_id,'game',NEW.id,'create',v_actor,
            jsonb_build_object('home',NEW.home_team_id,'away',NEW.away_team_id,'starts_at',NEW.starts_at));
    RETURN NEW;
  ELSIF TG_OP='UPDATE' THEN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      INSERT INTO public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      VALUES (NEW.org_id,'game',NEW.id,'soft_delete',v_actor);
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
      INSERT INTO public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
      VALUES (NEW.org_id,'game',NEW.id,'restore',v_actor);
    ELSE
      INSERT INTO public.touchbase_audit_log(org_id, entity, entity_id, action, actor, meta)
      VALUES (NEW.org_id,'game',NEW.id,'update',v_actor,
              jsonb_build_object('status_old',OLD.status,'status_new',NEW.status,
                                 'home_score',NEW.home_score,'away_score',NEW.away_score));
    END IF;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    INSERT INTO public.touchbase_audit_log(org_id, entity, entity_id, action, actor)
    VALUES (OLD.org_id,'game',OLD.id,'purge',v_actor);
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS touchbase_audit_game_tr_ins ON public.touchbase_games;
DROP TRIGGER IF EXISTS touchbase_audit_game_tr_upd ON public.touchbase_games;
DROP TRIGGER IF EXISTS touchbase_audit_game_tr_del ON public.touchbase_games;

CREATE TRIGGER touchbase_audit_game_tr_ins AFTER INSERT ON public.touchbase_games
FOR EACH ROW EXECUTE FUNCTION public.touchbase_audit_game();

CREATE TRIGGER touchbase_audit_game_tr_upd AFTER UPDATE ON public.touchbase_games
FOR EACH ROW EXECUTE FUNCTION public.touchbase_audit_game();

CREATE TRIGGER touchbase_audit_game_tr_del AFTER DELETE ON public.touchbase_games
FOR EACH ROW EXECUTE FUNCTION public.touchbase_audit_game();

-- ============================================================
-- 8. GAMES RPCs
-- ============================================================

-- Lista juegos de la org actual
CREATE OR REPLACE FUNCTION public.touchbase_list_games_current_org(
  p_status text DEFAULT NULL, 
  p_limit int DEFAULT 100
)
RETURNS TABLE (
  id uuid, 
  starts_at timestamptz, 
  status text, 
  home_team_id uuid, 
  away_team_id uuid, 
  home_score int, 
  away_score int, 
  venue text
)
LANGUAGE sql 
SECURITY DEFINER 
SET search_path=public 
STABLE 
AS $$
  SELECT g.id, g.starts_at, g.status, g.home_team_id, g.away_team_id, 
         g.home_score, g.away_score, g.venue
  FROM public.touchbase_games g
  JOIN public.touchbase_profiles p ON p.default_org_id = g.org_id
  WHERE p.id = auth.uid()
    AND g.deleted_at IS NULL
    AND (p_status IS NULL OR g.status = p_status)
  ORDER BY g.starts_at DESC
  LIMIT p_limit
$$;

REVOKE ALL ON FUNCTION public.touchbase_list_games_current_org(text,int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_list_games_current_org(text,int) TO authenticated;


-- Actualizar score
CREATE OR REPLACE FUNCTION public.touchbase_update_score(
  p_game uuid, 
  p_home int, 
  p_away int
)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_org uuid;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_games WHERE id = p_game AND deleted_at IS NULL;
  IF v_org IS NULL THEN 
    RAISE EXCEPTION 'Game not found'; 
  END IF;
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.touchbase_games
     SET home_score = GREATEST(p_home,0), 
         away_score = GREATEST(p_away,0)
   WHERE id = p_game;
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.touchbase_update_score(uuid,int,int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_update_score(uuid,int,int) TO authenticated;


-- Setear estado
CREATE OR REPLACE FUNCTION public.touchbase_set_status(
  p_game uuid, 
  p_status text
)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_org uuid;
BEGIN
  IF p_status NOT IN ('scheduled','live','final','canceled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  SELECT org_id INTO v_org FROM public.touchbase_games WHERE id = p_game AND deleted_at IS NULL;
  IF v_org IS NULL THEN 
    RAISE EXCEPTION 'Game not found'; 
  END IF;
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.touchbase_games SET status = p_status WHERE id = p_game;
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.touchbase_set_status(uuid,text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_set_status(uuid,text) TO authenticated;


-- Soft delete game
CREATE OR REPLACE FUNCTION public.touchbase_soft_delete_game(p_game uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_org uuid;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_games WHERE id = p_game AND deleted_at IS NULL;
  IF v_org IS NULL THEN 
    RAISE EXCEPTION 'Game not found'; 
  END IF;
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.touchbase_games SET deleted_at = now() WHERE id = p_game;
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.touchbase_soft_delete_game(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_soft_delete_game(uuid) TO authenticated;


-- Restore game
CREATE OR REPLACE FUNCTION public.touchbase_restore_game(p_game uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_org uuid;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_games WHERE id = p_game AND deleted_at IS NOT NULL;
  IF v_org IS NULL THEN 
    RAISE EXCEPTION 'Game not found in recycle bin'; 
  END IF;
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.touchbase_games SET deleted_at = NULL WHERE id = p_game;
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.touchbase_restore_game(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_restore_game(uuid) TO authenticated;


-- Purge game (permanent delete)
CREATE OR REPLACE FUNCTION public.touchbase_purge_game(p_game uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path=public 
AS $$
DECLARE 
  v_org uuid;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_games WHERE id = p_game;
  IF v_org IS NULL THEN 
    RAISE EXCEPTION 'Game not found'; 
  END IF;
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin']) THEN
    RAISE EXCEPTION 'Forbidden: only owner/admin can purge';
  END IF;
  DELETE FROM public.touchbase_games WHERE id = p_game;
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.touchbase_purge_game(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_purge_game(uuid) TO authenticated;

-- ============================================================
-- FIN - Sprint 4 Games Complete
-- ============================================================
