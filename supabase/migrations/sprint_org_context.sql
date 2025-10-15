-- ============================================================
-- SPRINT: Org Context & Switching + Teams & Players CRUD
-- Fixes: players schema (profile_id → full_name)
-- Adds: RPCs para org switching, teams/players CRUD
-- ============================================================

-- ============================================================
-- 1. CORREGIR SCHEMA DE PLAYERS
-- ============================================================

-- Drop tabla existente si tiene estructura antigua
DROP TABLE IF EXISTS public.touchbase_players CASCADE;

-- Recrear con full_name directo (sin profile_id)
CREATE TABLE public.touchbase_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.touchbase_teams(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  birthdate DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que teams tenga constraint unique por org
ALTER TABLE public.touchbase_teams 
  DROP CONSTRAINT IF EXISTS touchbase_teams_org_name_unique;
ALTER TABLE public.touchbase_teams 
  ADD CONSTRAINT touchbase_teams_org_name_unique UNIQUE (org_id, name);

-- Habilitar RLS
ALTER TABLE public.touchbase_players ENABLE ROW LEVEL SECURITY;

-- Política: solo miembros de la org pueden ver/modificar jugadores
DROP POLICY IF EXISTS "touchbase_players_rw_members" ON public.touchbase_players;
CREATE POLICY "touchbase_players_rw_members" ON public.touchbase_players
  FOR ALL 
  USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- Política similar para teams
DROP POLICY IF EXISTS "touchbase_teams_org_members" ON public.touchbase_teams;
DROP POLICY IF EXISTS "touchbase_teams_rw_members" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_rw_members" ON public.touchbase_teams
  FOR ALL 
  USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- ============================================================
-- 2. RPCs PARA ORG CONTEXT
-- ============================================================

-- RPC: Obtener organización actual del usuario
CREATE OR REPLACE FUNCTION public.touchbase_current_org()
RETURNS TABLE(org_id UUID, org_name TEXT, role TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    o.id AS org_id,
    o.name AS org_name,
    m.role
  FROM public.touchbase_profiles p
  JOIN public.touchbase_organizations o ON o.id = p.default_org_id
  LEFT JOIN public.touchbase_memberships m
    ON m.org_id = o.id AND m.user_id = auth.uid()
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.touchbase_current_org() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_current_org() TO authenticated;

-- RPC: Cambiar organización activa
CREATE OR REPLACE FUNCTION public.touchbase_switch_org(p_target_org UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario es miembro de la org destino
  IF NOT EXISTS (
    SELECT 1 FROM public.touchbase_memberships
    WHERE org_id = p_target_org AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of target organization';
  END IF;

  -- Actualizar default_org_id en el perfil
  UPDATE public.touchbase_profiles
  SET default_org_id = p_target_org,
      updated_at = NOW()
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_switch_org(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_switch_org(UUID) TO authenticated;

-- RPC: Listar todas las organizaciones del usuario
CREATE OR REPLACE FUNCTION public.touchbase_list_orgs()
RETURNS TABLE(org_id UUID, org_name TEXT, role TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT o.id, o.name, m.role
  FROM public.touchbase_memberships m
  JOIN public.touchbase_organizations o ON o.id = m.org_id
  WHERE m.user_id = auth.uid()
  ORDER BY o.name;
$$;

REVOKE ALL ON FUNCTION public.touchbase_list_orgs() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_list_orgs() TO authenticated;

-- ============================================================
-- 3. RPCs PARA TEAMS
-- ============================================================

-- RPC: Listar equipos de la org actual
CREATE OR REPLACE FUNCTION public.touchbase_list_teams_current_org()
RETURNS TABLE(id UUID, name TEXT, category TEXT, created_at TIMESTAMPTZ)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT t.id, t.name, t.category, t.created_at
  FROM public.touchbase_profiles p
  JOIN public.touchbase_teams t ON t.org_id = p.default_org_id
  WHERE p.id = auth.uid()
  ORDER BY t.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.touchbase_list_teams_current_org() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_list_teams_current_org() TO authenticated;

-- ============================================================
-- 4. RPCs PARA PLAYERS
-- ============================================================

-- RPC: Listar jugadores de la org actual (opcional: filtrar por team)
CREATE OR REPLACE FUNCTION public.touchbase_list_players_current_org(p_team_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, full_name TEXT, team_id UUID, jersey_number INTEGER, position TEXT, created_at TIMESTAMPTZ)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT pl.id, pl.full_name, pl.team_id, pl.jersey_number, pl.position, pl.created_at
  FROM public.touchbase_profiles p
  JOIN public.touchbase_players pl ON pl.org_id = p.default_org_id
  WHERE p.id = auth.uid()
    AND (p_team_id IS NULL OR pl.team_id = p_team_id)
  ORDER BY pl.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.touchbase_list_players_current_org(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_list_players_current_org(UUID) TO authenticated;

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
