-- ============================================================
-- TouchBase: Setup Completo (Safe para ejecutar múltiples veces)
-- ============================================================

-- ============================================================
-- 1. LIMPIAR TABLAS EXISTENTES (si existen)
-- ============================================================

DROP TABLE IF EXISTS public.touchbase_games CASCADE;
DROP TABLE IF EXISTS public.touchbase_players CASCADE;
DROP TABLE IF EXISTS public.touchbase_teams CASCADE;
DROP TABLE IF EXISTS public.touchbase_memberships CASCADE;
DROP TABLE IF EXISTS public.touchbase_profiles CASCADE;
DROP TABLE IF EXISTS public.touchbase_organizations CASCADE;

-- ============================================================
-- 2. CREAR TABLAS BASE
-- ============================================================

-- Organizaciones (equipos/academias)
CREATE TABLE public.touchbase_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships: vínculo usuario ↔ org con rol
CREATE TABLE public.touchbase_memberships (
  org_id UUID REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','coach','player','parent','viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Profiles vinculados a auth.users
CREATE TABLE public.touchbase_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  default_org_id UUID REFERENCES public.touchbase_organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams dentro de organizaciones
CREATE TABLE public.touchbase_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, name)
);

-- Players (con full_name directo, no profile_id)
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

-- Games/Matches
CREATE TABLE public.touchbase_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.touchbase_teams(id),
  away_team_id UUID REFERENCES public.touchbase_teams(id),
  game_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX idx_touchbase_memberships_user_id ON public.touchbase_memberships(user_id);
CREATE INDEX idx_touchbase_memberships_org_id ON public.touchbase_memberships(org_id);
CREATE INDEX idx_touchbase_profiles_default_org ON public.touchbase_profiles(default_org_id);
CREATE INDEX idx_touchbase_teams_org_id ON public.touchbase_teams(org_id);
CREATE INDEX idx_touchbase_players_org_id ON public.touchbase_players(org_id);
CREATE INDEX idx_touchbase_players_team_id ON public.touchbase_players(team_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.touchbase_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_games ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. FUNCIONES HELPER
-- ============================================================

-- Helper: ¿usuario pertenece a org?
CREATE OR REPLACE FUNCTION public.touchbase_is_org_member(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org AND m.user_id = auth.uid()
  );
$$;

-- Helper: obtener rol del usuario en org
CREATE OR REPLACE FUNCTION public.touchbase_get_user_role(p_org UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT role
  FROM public.touchbase_memberships
  WHERE org_id = p_org AND user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- 6. POLÍTICAS RLS
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "touchbase_profiles_select_own" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_select_own" ON public.touchbase_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "touchbase_profiles_update_own" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_update_own" ON public.touchbase_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "touchbase_profiles_insert_self" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_insert_self" ON public.touchbase_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "touchbase_orgs_select_members" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_select_members" ON public.touchbase_organizations
  FOR SELECT USING (public.touchbase_is_org_member(id));

DROP POLICY IF EXISTS "touchbase_orgs_update_admins" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_update_admins" ON public.touchbase_organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "touchbase_orgs_insert_any" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_insert_any" ON public.touchbase_organizations
  FOR INSERT WITH CHECK (TRUE);

-- MEMBERSHIPS
DROP POLICY IF EXISTS "touchbase_memberships_select_members" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_select_members" ON public.touchbase_memberships
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

DROP POLICY IF EXISTS "touchbase_memberships_modify_admins" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_modify_admins" ON public.touchbase_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = touchbase_memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = touchbase_memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- TEAMS
DROP POLICY IF EXISTS "touchbase_teams_rw_members" ON public.touchbase_teams;
CREATE POLICY "touchbase_teams_rw_members" ON public.touchbase_teams
  FOR ALL 
  USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- PLAYERS
DROP POLICY IF EXISTS "touchbase_players_rw_members" ON public.touchbase_players;
CREATE POLICY "touchbase_players_rw_members" ON public.touchbase_players
  FOR ALL 
  USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- GAMES
DROP POLICY IF EXISTS "touchbase_games_rw_members" ON public.touchbase_games;
CREATE POLICY "touchbase_games_rw_members" ON public.touchbase_games
  FOR ALL 
  USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- ============================================================
-- 7. TRIGGER PARA AUTO-CREAR PERFIL
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.touchbase_profiles(id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touchbase_on_auth_user_created ON auth.users;
CREATE TRIGGER touchbase_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.touchbase_handle_new_user();

-- ============================================================
-- 8. RPC: ONBOARDING
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_onboard_user(p_org_name TEXT DEFAULT 'Mi Organización')
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_org UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Crear organización
  INSERT INTO public.touchbase_organizations (name, slug)
  VALUES (
    COALESCE(NULLIF(p_org_name, ''), 'Mi Organización'),
    LOWER(REGEXP_REPLACE(COALESCE(NULLIF(p_org_name, ''), 'Mi Organización'), '[^a-z0-9]+', '-', 'g')) || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8)
  )
  RETURNING id INTO v_org;

  -- Membership como owner
  INSERT INTO public.touchbase_memberships (org_id, user_id, role)
  VALUES (v_org, v_uid, 'owner');

  -- Default org
  UPDATE public.touchbase_profiles
  SET default_org_id = v_org, updated_at = NOW()
  WHERE id = v_uid;

  RETURN v_org;
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_onboard_user(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_onboard_user(TEXT) TO authenticated;

-- ============================================================
-- 9. RPCs: ORG CONTEXT
-- ============================================================

-- Obtener org actual
CREATE OR REPLACE FUNCTION public.touchbase_current_org()
RETURNS TABLE(org_id UUID, org_name TEXT, role TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT o.id, o.name, m.role
  FROM public.touchbase_profiles p
  JOIN public.touchbase_organizations o ON o.id = p.default_org_id
  LEFT JOIN public.touchbase_memberships m ON m.org_id = o.id AND m.user_id = auth.uid()
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.touchbase_current_org() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_current_org() TO authenticated;

-- Cambiar org activa
CREATE OR REPLACE FUNCTION public.touchbase_switch_org(p_target_org UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.touchbase_memberships
    WHERE org_id = p_target_org AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of target organization';
  END IF;

  UPDATE public.touchbase_profiles
  SET default_org_id = p_target_org, updated_at = NOW()
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_switch_org(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_switch_org(UUID) TO authenticated;

-- Listar orgs del usuario
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
-- 10. RPCs: TEAMS
-- ============================================================

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
-- 11. RPCs: PLAYERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_list_players_current_org(p_team_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, full_name TEXT, team_id UUID, jersey_number INTEGER, "position" TEXT, created_at TIMESTAMPTZ)
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
-- FIN DEL SETUP
-- ============================================================
