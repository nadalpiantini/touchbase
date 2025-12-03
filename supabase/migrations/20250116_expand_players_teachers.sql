-- ============================================================
-- EXPAND PLAYERS & TEACHERS TABLES
-- Agregar campos completos para registro detallado
-- ============================================================

-- ============================================================
-- 1. EXPANDIR TABLA DE PLAYERS
-- ============================================================

-- Agregar columnas para información personal completa
ALTER TABLE public.touchbase_players
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS affiliate TEXT,
  ADD COLUMN IF NOT EXISTS signing_year INTEGER,
  ADD COLUMN IF NOT EXISTS family_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS academic_level TEXT,
  ADD COLUMN IF NOT EXISTS english_level TEXT,
  ADD COLUMN IF NOT EXISTS spanish_level TEXT,
  ADD COLUMN IF NOT EXISTS math_level TEXT,
  ADD COLUMN IF NOT EXISTS science_level TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================================
-- 2. CREAR TABLA DE TEACHERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.touchbase_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  photo_url TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birthdate DATE,
  nationality TEXT,
  address TEXT,
  employment_type TEXT, -- full-time, part-time, contract
  hire_date DATE,
  salary DECIMAL(10, 2),
  department TEXT,
  degree TEXT,
  field_of_study TEXT,
  institution TEXT,
  graduation_year INTEGER,
  teaching_subjects TEXT[],
  experience_years INTEGER,
  certifications JSONB DEFAULT '[]'::jsonb,
  licenses JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para teachers
CREATE INDEX IF NOT EXISTS idx_touchbase_teachers_org_id ON public.touchbase_teachers(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_teachers_email ON public.touchbase_teachers(email) WHERE deleted_at IS NULL;

-- Habilitar RLS
ALTER TABLE public.touchbase_teachers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para teachers
DROP POLICY IF EXISTS "touchbase_teachers_select_members" ON public.touchbase_teachers;
CREATE POLICY "touchbase_teachers_select_members" ON public.touchbase_teachers
  FOR SELECT USING (
    public.touchbase_is_org_member(org_id) AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "touchbase_teachers_insert_admins" ON public.touchbase_teachers;
CREATE POLICY "touchbase_teachers_insert_admins" ON public.touchbase_teachers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "touchbase_teachers_update_admins" ON public.touchbase_teachers;
CREATE POLICY "touchbase_teachers_update_admins" ON public.touchbase_teachers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin', 'coach')
    ) AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "touchbase_teachers_delete_admins" ON public.touchbase_teachers;
CREATE POLICY "touchbase_teachers_delete_admins" ON public.touchbase_teachers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 3. CREAR TABLA DE PRESUPUESTO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.touchbase_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(10, 2) NOT NULL,
  spent_amount DECIMAL(10, 2) DEFAULT 0,
  fiscal_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.touchbase_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.touchbase_budgets(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para budget
CREATE INDEX IF NOT EXISTS idx_touchbase_budgets_org_id ON public.touchbase_budgets(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_expenses_org_id ON public.touchbase_expenses(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_expenses_budget_id ON public.touchbase_expenses(budget_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_expenses_status ON public.touchbase_expenses(status) WHERE deleted_at IS NULL;

-- RLS para budgets
ALTER TABLE public.touchbase_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_budgets_select_members" ON public.touchbase_budgets;
CREATE POLICY "touchbase_budgets_select_members" ON public.touchbase_budgets
  FOR SELECT USING (public.touchbase_is_org_member(org_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "touchbase_budgets_modify_admins" ON public.touchbase_budgets;
CREATE POLICY "touchbase_budgets_modify_admins" ON public.touchbase_budgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    ) AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "touchbase_expenses_select_members" ON public.touchbase_expenses;
CREATE POLICY "touchbase_expenses_select_members" ON public.touchbase_expenses
  FOR SELECT USING (public.touchbase_is_org_member(org_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "touchbase_expenses_insert_members" ON public.touchbase_expenses;
CREATE POLICY "touchbase_expenses_insert_members" ON public.touchbase_expenses
  FOR INSERT WITH CHECK (
    public.touchbase_is_org_member(org_id) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "touchbase_expenses_update_admins" ON public.touchbase_expenses;
CREATE POLICY "touchbase_expenses_update_admins" ON public.touchbase_expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    ) AND deleted_at IS NULL
  );

-- ============================================================
-- 4. CREAR TABLA DE PRUEBAS DE COLOCACIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.touchbase_placement_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL, -- academic, english, spanish, math, science
  questions JSONB DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 70,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.touchbase_placement_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.touchbase_placement_tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  player_id UUID REFERENCES public.touchbase_players(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  recommended_level TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para placement tests
CREATE INDEX IF NOT EXISTS idx_touchbase_placement_tests_org_id ON public.touchbase_placement_tests(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_placement_results_test_id ON public.touchbase_placement_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_placement_results_student_id ON public.touchbase_placement_test_results(student_id);

-- RLS para placement tests
ALTER TABLE public.touchbase_placement_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_placement_test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_placement_tests_select_members" ON public.touchbase_placement_tests;
CREATE POLICY "touchbase_placement_tests_select_members" ON public.touchbase_placement_tests
  FOR SELECT USING (public.touchbase_is_org_member(org_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "touchbase_placement_tests_modify_admins" ON public.touchbase_placement_tests;
CREATE POLICY "touchbase_placement_tests_modify_admins" ON public.touchbase_placement_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin', 'coach', 'teacher')
    ) AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "touchbase_placement_results_select_own" ON public.touchbase_placement_test_results;
CREATE POLICY "touchbase_placement_results_select_own" ON public.touchbase_placement_test_results
  FOR SELECT USING (
    student_id = auth.uid() OR public.touchbase_is_org_member(org_id)
  );

DROP POLICY IF EXISTS "touchbase_placement_results_insert_students" ON public.touchbase_placement_test_results;
CREATE POLICY "touchbase_placement_results_insert_students" ON public.touchbase_placement_test_results
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 5. CREAR TABLA DE VIDA ESTUDIANTIL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.touchbase_wellness_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT, -- nutrition, mental_health, physical_fitness, etc
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.touchbase_extracurricular_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  activity_date DATE,
  location TEXT,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.touchbase_activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.touchbase_extracurricular_activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  player_id UUID REFERENCES public.touchbase_players(id) ON DELETE SET NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (activity_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.touchbase_personal_development_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  player_id UUID REFERENCES public.touchbase_players(id) ON DELETE SET NULL,
  log_type TEXT, -- reflection, goal, achievement, etc
  title TEXT,
  content TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para student life
CREATE INDEX IF NOT EXISTS idx_touchbase_wellness_org_id ON public.touchbase_wellness_programs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_activities_org_id ON public.touchbase_extracurricular_activities(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_touchbase_personal_dev_student_id ON public.touchbase_personal_development_logs(student_id);

-- RLS para student life
ALTER TABLE public.touchbase_wellness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_extracurricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_personal_development_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (similar a otras tablas)
DROP POLICY IF EXISTS "touchbase_wellness_select_members" ON public.touchbase_wellness_programs;
CREATE POLICY "touchbase_wellness_select_members" ON public.touchbase_wellness_programs
  FOR SELECT USING (public.touchbase_is_org_member(org_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "touchbase_activities_select_members" ON public.touchbase_extracurricular_activities;
CREATE POLICY "touchbase_activities_select_members" ON public.touchbase_extracurricular_activities
  FOR SELECT USING (public.touchbase_is_org_member(org_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "touchbase_participants_select_members" ON public.touchbase_activity_participants;
CREATE POLICY "touchbase_participants_select_members" ON public.touchbase_activity_participants
  FOR SELECT USING (
    student_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.touchbase_extracurricular_activities a
      JOIN public.touchbase_memberships m ON m.org_id = a.org_id
      WHERE a.id = activity_id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "touchbase_personal_dev_select_own" ON public.touchbase_personal_development_logs;
CREATE POLICY "touchbase_personal_dev_select_own" ON public.touchbase_personal_development_logs
  FOR SELECT USING (
    student_id = auth.uid() OR public.touchbase_is_org_member(org_id)
  );

