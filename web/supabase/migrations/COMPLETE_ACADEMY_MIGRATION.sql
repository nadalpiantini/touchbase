-- ============================================================
-- TouchBase Academy - COMPLETE MIGRATION
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql
-- ============================================================

-- ============================================================
-- 1. EXTEND ROLES IN MEMBERSHIPS
-- ============================================================
ALTER TABLE public.touchbase_memberships
DROP CONSTRAINT IF EXISTS touchbase_memberships_role_check;

ALTER TABLE public.touchbase_memberships
ADD CONSTRAINT touchbase_memberships_role_check
CHECK (role IN ('owner','admin','coach','player','parent','viewer','teacher','student'));

-- ============================================================
-- 2. CLASSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  grade_level TEXT,
  description TEXT,
  schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_classes_org_id ON public.touchbase_classes(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_teacher_id ON public.touchbase_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_code ON public.touchbase_classes(code);

-- ============================================================
-- 3. CLASS ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_class_enrollments_class_id ON public.touchbase_class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_enrollments_student_id ON public.touchbase_class_enrollments(student_id);

-- ============================================================
-- 4. MODULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_touchbase_modules_created_by ON public.touchbase_modules(created_by);
CREATE INDEX IF NOT EXISTS idx_touchbase_modules_is_active ON public.touchbase_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_touchbase_modules_difficulty ON public.touchbase_modules(difficulty);

-- ============================================================
-- 5. MODULE STEPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_module_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL CHECK (step_type IN ('content', 'quiz', 'scenario')),
  content_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_module_steps_module_id ON public.touchbase_module_steps(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_module_steps_order ON public.touchbase_module_steps(module_id, order_index);

-- ============================================================
-- 6. PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_time_seconds INTEGER DEFAULT 0,
  score INTEGER,
  step_progress JSONB DEFAULT '[]'::JSONB,
  started_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_progress_user_id ON public.touchbase_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_progress_module_id ON public.touchbase_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_progress_status ON public.touchbase_progress(status);

-- ============================================================
-- 7. ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_class_id ON public.touchbase_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_module_id ON public.touchbase_assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_teacher_id ON public.touchbase_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_due_date ON public.touchbase_assignments(due_date);

-- ============================================================
-- 8. ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.touchbase_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RLS POLICIES - PERMISSIVE FOR DEV
-- ============================================================

-- Classes policies
DROP POLICY IF EXISTS "Allow all classes" ON public.touchbase_classes;
CREATE POLICY "Allow all classes" ON public.touchbase_classes FOR ALL USING (true) WITH CHECK (true);

-- Class enrollments policies
DROP POLICY IF EXISTS "Allow all class_enrollments" ON public.touchbase_class_enrollments;
CREATE POLICY "Allow all class_enrollments" ON public.touchbase_class_enrollments FOR ALL USING (true) WITH CHECK (true);

-- Modules policies
DROP POLICY IF EXISTS "Allow all modules" ON public.touchbase_modules;
CREATE POLICY "Allow all modules" ON public.touchbase_modules FOR ALL USING (true) WITH CHECK (true);

-- Module steps policies
DROP POLICY IF EXISTS "Allow all module_steps" ON public.touchbase_module_steps;
CREATE POLICY "Allow all module_steps" ON public.touchbase_module_steps FOR ALL USING (true) WITH CHECK (true);

-- Progress policies
DROP POLICY IF EXISTS "Allow all progress" ON public.touchbase_progress;
CREATE POLICY "Allow all progress" ON public.touchbase_progress FOR ALL USING (true) WITH CHECK (true);

-- Assignments policies
DROP POLICY IF EXISTS "Allow all assignments" ON public.touchbase_assignments;
CREATE POLICY "Allow all assignments" ON public.touchbase_assignments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 10. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_is_teacher(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org
      AND m.user_id = auth.uid()
      AND m.role IN ('teacher', 'admin', 'owner')
  );
$$;

CREATE OR REPLACE FUNCTION public.touchbase_is_student(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org
      AND m.user_id = auth.uid()
      AND m.role IN ('student', 'player')
  );
$$;

-- ============================================================
-- DONE!
-- ============================================================
SELECT 'TouchBase Academy migration completed successfully!' as status;
