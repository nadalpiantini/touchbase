-- ============================================================
-- TouchBase Multi-tenant Schema with RLS
-- Prefix: touchbase_
-- ============================================================

-- 1. TABLAS BASE
-- ============================================================

-- Organizaciones (equipos/academias)
CREATE TABLE IF NOT EXISTS public.touchbase_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships: vínculo usuario ↔ org con rol
CREATE TABLE IF NOT EXISTS public.touchbase_memberships (
  org_id UUID REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','coach','player','parent','viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Profiles vinculados a auth.users
CREATE TABLE IF NOT EXISTS public.touchbase_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  default_org_id UUID REFERENCES public.touchbase_organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_touchbase_memberships_user_id ON public.touchbase_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_memberships_org_id ON public.touchbase_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_profiles_default_org ON public.touchbase_profiles(default_org_id);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.touchbase_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. FUNCIONES HELPER
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
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================

-- PROFILES: cada quien ve/edita su fila
DROP POLICY IF EXISTS "touchbase_profiles_select_own" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_select_own" ON public.touchbase_profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "touchbase_profiles_update_own" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_update_own" ON public.touchbase_profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "touchbase_profiles_insert_self" ON public.touchbase_profiles;
CREATE POLICY "touchbase_profiles_insert_self" ON public.touchbase_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS: solo miembros pueden ver
DROP POLICY IF EXISTS "touchbase_orgs_select_members" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_select_members" ON public.touchbase_organizations
FOR SELECT USING (public.touchbase_is_org_member(id));

-- ORGANIZATIONS: solo owners/admins pueden editar
DROP POLICY IF EXISTS "touchbase_orgs_update_admins" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_update_admins" ON public.touchbase_organizations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.touchbase_memberships m
    WHERE m.org_id = id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  )
);

-- ORGANIZATIONS: cualquiera puede crear (luego debe insertar membership)
DROP POLICY IF EXISTS "touchbase_orgs_insert_any" ON public.touchbase_organizations;
CREATE POLICY "touchbase_orgs_insert_any" ON public.touchbase_organizations
FOR INSERT WITH CHECK (TRUE);

-- MEMBERSHIPS: solo miembros de esa org pueden ver
DROP POLICY IF EXISTS "touchbase_memberships_select_members" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_select_members" ON public.touchbase_memberships
FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- MEMBERSHIPS: solo owners/admins pueden modificar
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

-- ============================================================
-- 5. TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ============================================================

-- Función: crear perfil cuando se registra usuario
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

-- Trigger: ejecutar cuando se crea usuario
DROP TRIGGER IF EXISTS touchbase_on_auth_user_created ON auth.users;
CREATE TRIGGER touchbase_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.touchbase_handle_new_user();

-- ============================================================
-- 6. FUNCIÓN DE ONBOARDING (RPC)
-- ============================================================

-- Onboarding: crea org + membership owner + default_org
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
  -- Verificar autenticación
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1) Crear organización
  INSERT INTO public.touchbase_organizations (name, slug)
  VALUES (
    COALESCE(NULLIF(p_org_name, ''), 'Mi Organización'),
    -- Generar slug único basado en nombre
    LOWER(REGEXP_REPLACE(COALESCE(NULLIF(p_org_name, ''), 'Mi Organización'), '[^a-z0-9]+', '-', 'g')) || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8)
  )
  RETURNING id INTO v_org;

  -- 2) Membership como owner
  INSERT INTO public.touchbase_memberships (org_id, user_id, role)
  VALUES (v_org, v_uid, 'owner');

  -- 3) Establecer como org por defecto en profile
  UPDATE public.touchbase_profiles
  SET default_org_id = v_org,
      updated_at = NOW()
  WHERE id = v_uid;

  RETURN v_org;
END;
$$;

-- Permisos para que usuarios autenticados puedan llamar la función
REVOKE ALL ON FUNCTION public.touchbase_onboard_user(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_onboard_user(TEXT) TO authenticated;

-- ============================================================
-- 7. TABLAS ADICIONALES (PARA FUTURO)
-- ============================================================

-- Teams dentro de organizaciones
CREATE TABLE IF NOT EXISTS public.touchbase_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- U12, U14, U16, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players (extendiendo profiles)
CREATE TABLE IF NOT EXISTS public.touchbase_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.touchbase_teams(id) ON DELETE SET NULL,
  jersey_number INTEGER,
  position TEXT,
  birthdate DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, jersey_number, team_id)
);

-- Games/Matches
CREATE TABLE IF NOT EXISTS public.touchbase_games (
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

-- Habilitar RLS en tablas adicionales
ALTER TABLE public.touchbase_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_games ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para tablas adicionales (solo miembros de org)
CREATE POLICY "touchbase_teams_org_members" ON public.touchbase_teams
  FOR ALL USING (public.touchbase_is_org_member(org_id));

CREATE POLICY "touchbase_players_org_members" ON public.touchbase_players
  FOR ALL USING (public.touchbase_is_org_member(org_id));

CREATE POLICY "touchbase_games_org_members" ON public.touchbase_games
  FOR ALL USING (public.touchbase_is_org_member(org_id));

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================