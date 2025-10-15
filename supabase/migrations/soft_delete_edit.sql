-- ============================================================
-- Sprint: Edit & Soft-Delete con RLS por Roles
-- ============================================================

-- ============================================================
-- 1. SOFT DELETE (columna deleted_at)
-- ============================================================

ALTER TABLE public.touchbase_teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.touchbase_players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================
-- 2. FUNCIÓN HELPER: Check de Rol
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
-- 3. POLÍTICAS RLS GRANULARES POR ROL
-- ============================================================

-- TEAMS: Select para todos los miembros
DROP POLICY IF EXISTS "touchbase_teams_rw_members" ON public.touchbase_teams;
DROP POLICY IF EXISTS "touchbase_teams_select_members" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_select_members" ON public.touchbase_teams
  FOR SELECT 
  USING (public.touchbase_is_org_member(org_id));

-- TEAMS: Insert solo owner/admin/coach
DROP POLICY IF EXISTS "touchbase_teams_insert_admins" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_insert_admins" ON public.touchbase_teams
  FOR INSERT 
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- TEAMS: Update solo owner/admin/coach
DROP POLICY IF EXISTS "touchbase_teams_update_admins" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_update_admins" ON public.touchbase_teams
  FOR UPDATE 
  USING (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']))
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- TEAMS: Delete solo owner/admin
DROP POLICY IF EXISTS "touchbase_teams_delete_admins" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_delete_admins" ON public.touchbase_teams
  FOR DELETE 
  USING (public.touchbase_has_role(org_id, ARRAY['owner','admin']));

-- PLAYERS: Select para todos los miembros
DROP POLICY IF EXISTS "touchbase_players_rw_members" ON public.touchbase_players;
DROP POLICY IF EXISTS "touchbase_players_select_members" ON public.touchbase_players;
CREATE POLICY "touchbase_players_select_members" ON public.touchbase_players
  FOR SELECT 
  USING (public.touchbase_is_org_member(org_id));

-- PLAYERS: Insert solo owner/admin/coach
DROP POLICY IF EXISTS "touchbase_players_insert_admins" ON public.touchbase_players;
CREATE POLICY "touchbase_players_insert_admins" ON public.touchbase_players
  FOR INSERT 
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- PLAYERS: Update solo owner/admin/coach
DROP POLICY IF EXISTS "touchbase_players_update_admins" ON public.touchbase_players;
CREATE POLICY "touchbase_players_update_admins" ON public.touchbase_players
  FOR UPDATE 
  USING (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']))
  WITH CHECK (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- PLAYERS: Delete solo owner/admin/coach
DROP POLICY IF EXISTS "touchbase_players_delete_admins" ON public.touchbase_players;
CREATE POLICY "touchbase_players_delete_admins" ON public.touchbase_players
  FOR DELETE 
  USING (public.touchbase_has_role(org_id, ARRAY['owner','admin','coach']));

-- ============================================================
-- 4. RPCs DE RESTAURACIÓN
-- ============================================================

-- Restaurar equipo (soft-delete undo)
CREATE OR REPLACE FUNCTION public.touchbase_restore_team(p_team UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_teams WHERE id = p_team;
  
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Team not found';
  END IF;
  
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  
  UPDATE public.touchbase_teams 
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = p_team;
  
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_restore_team(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_restore_team(UUID) TO authenticated;

-- Restaurar jugador (soft-delete undo)
CREATE OR REPLACE FUNCTION public.touchbase_restore_player(p_player UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID;
BEGIN
  SELECT org_id INTO v_org FROM public.touchbase_players WHERE id = p_player;
  
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Player not found';
  END IF;
  
  IF NOT public.touchbase_has_role(v_org, ARRAY['owner','admin','coach']) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  
  UPDATE public.touchbase_players 
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = p_player;
  
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_restore_player(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_restore_player(UUID) TO authenticated;

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
