-- ============================================================
-- TouchBase Academy - Life Skills Platform Schema
-- Prefix: touchbase_
-- Date: 2025-12-03
-- ============================================================
-- This migration adds educational features to TouchBase:
-- - Classes (teacher-created classes)
-- - Modules (educational content)
-- - Progress tracking
-- - Assignments
-- - Extends roles to include 'teacher' and 'student'
-- ============================================================

-- ============================================================
-- 1. EXTEND ROLES IN MEMBERSHIPS
-- ============================================================
-- Add 'teacher' and 'student' to existing roles

-- Drop existing constraint
ALTER TABLE public.touchbase_memberships 
DROP CONSTRAINT IF EXISTS touchbase_memberships_role_check;

-- Add new constraint with extended roles
ALTER TABLE public.touchbase_memberships
ADD CONSTRAINT touchbase_memberships_role_check 
CHECK (role IN ('owner','admin','coach','player','parent','viewer','teacher','student'));

-- ============================================================
-- 2. CLASSES TABLE
-- ============================================================
-- Classes created by teachers for students

CREATE TABLE IF NOT EXISTS public.touchbase_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- Join code for students
  grade_level TEXT, -- e.g., "Grade 5", "Middle School"
  description TEXT,
  schedule JSONB, -- {timezone: string, entries: [{dayOfWeek: number, startTime: string, endTime: string}]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_org_id ON public.touchbase_classes(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_teacher_id ON public.touchbase_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_code ON public.touchbase_classes(code);

-- ============================================================
-- 3. CLASS ENROLLMENTS TABLE
-- ============================================================
-- Students enrolled in classes

CREATE TABLE IF NOT EXISTS public.touchbase_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_class_enrollments_class_id ON public.touchbase_class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_enrollments_student_id ON public.touchbase_class_enrollments(student_id);

-- ============================================================
-- 4. MODULES TABLE
-- ============================================================
-- Educational modules/content

CREATE TABLE IF NOT EXISTS public.touchbase_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[], -- Array of skills taught
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_modules_created_by ON public.touchbase_modules(created_by);
CREATE INDEX IF NOT EXISTS idx_touchbase_modules_is_active ON public.touchbase_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_touchbase_modules_difficulty ON public.touchbase_modules(difficulty);

-- ============================================================
-- 5. MODULE STEPS TABLE
-- ============================================================
-- Steps within modules (content, quiz, scenario)

CREATE TABLE IF NOT EXISTS public.touchbase_module_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('content', 'quiz', 'scenario')),
  content_data JSONB NOT NULL, -- Flexible JSON for different step types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_module_steps_module_id ON public.touchbase_module_steps(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_module_steps_order ON public.touchbase_module_steps(module_id, order_index);

-- ============================================================
-- 6. PROGRESS TABLE
-- ============================================================
-- Student progress through modules

CREATE TABLE IF NOT EXISTS public.touchbase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_time_seconds INTEGER DEFAULT 0,
  score INTEGER, -- Overall score if applicable
  step_progress JSONB DEFAULT '[]'::JSONB, -- Array of step progress
  started_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_progress_user_id ON public.touchbase_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_progress_module_id ON public.touchbase_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_progress_status ON public.touchbase_progress(status);

-- ============================================================
-- 7. ASSIGNMENTS TABLE
-- ============================================================
-- Modules assigned to classes by teachers

CREATE TABLE IF NOT EXISTS public.touchbase_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_class_id ON public.touchbase_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_module_id ON public.touchbase_assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_teacher_id ON public.touchbase_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_assignments_due_date ON public.touchbase_assignments(due_date);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE public.touchbase_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- CLASSES: Members of org can view, teachers can create/edit their own
DROP POLICY IF EXISTS "touchbase_classes_select_org_members" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_select_org_members" ON public.touchbase_classes
FOR SELECT USING (public.touchbase_is_org_member(org_id));

DROP POLICY IF EXISTS "touchbase_classes_insert_teachers" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_insert_teachers" ON public.touchbase_classes
FOR INSERT WITH CHECK (
  auth.uid() = teacher_id AND 
  public.touchbase_is_org_member(org_id) AND
  EXISTS (
    SELECT 1 FROM public.touchbase_memberships m
    WHERE m.org_id = org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('teacher', 'admin', 'owner')
  )
);

DROP POLICY IF EXISTS "touchbase_classes_update_teachers" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_update_teachers" ON public.touchbase_classes
FOR UPDATE USING (
  auth.uid() = teacher_id AND 
  public.touchbase_is_org_member(org_id)
);

-- CLASS ENROLLMENTS: Students can view their enrollments, teachers can view all in their classes
DROP POLICY IF EXISTS "touchbase_class_enrollments_select" ON public.touchbase_class_enrollments;
CREATE POLICY "touchbase_class_enrollments_select" ON public.touchbase_class_enrollments
FOR SELECT USING (
  auth.uid() = student_id OR
  EXISTS (
    SELECT 1 FROM public.touchbase_classes c
    WHERE c.id = class_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "touchbase_class_enrollments_insert_students" ON public.touchbase_class_enrollments;
CREATE POLICY "touchbase_class_enrollments_insert_students" ON public.touchbase_class_enrollments
FOR INSERT WITH CHECK (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM public.touchbase_classes c
    WHERE c.id = class_id
      AND public.touchbase_is_org_member(c.org_id)
  )
);

-- MODULES: Anyone authenticated can view active modules, creators can edit
DROP POLICY IF EXISTS "touchbase_modules_select_active" ON public.touchbase_modules;
CREATE POLICY "touchbase_modules_select_active" ON public.touchbase_modules
FOR SELECT USING (is_active = TRUE OR created_by = auth.uid());

DROP POLICY IF EXISTS "touchbase_modules_insert_authenticated" ON public.touchbase_modules;
CREATE POLICY "touchbase_modules_insert_authenticated" ON public.touchbase_modules
FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "touchbase_modules_update_creator" ON public.touchbase_modules;
CREATE POLICY "touchbase_modules_update_creator" ON public.touchbase_modules
FOR UPDATE USING (auth.uid() = created_by);

-- MODULE STEPS: Same as modules (view if module active, edit if creator)
DROP POLICY IF EXISTS "touchbase_module_steps_select" ON public.touchbase_module_steps;
CREATE POLICY "touchbase_module_steps_select" ON public.touchbase_module_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.touchbase_modules m
    WHERE m.id = module_id
      AND (m.is_active = TRUE OR m.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "touchbase_module_steps_modify_creator" ON public.touchbase_module_steps;
CREATE POLICY "touchbase_module_steps_modify_creator" ON public.touchbase_module_steps
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.touchbase_modules m
    WHERE m.id = module_id
      AND m.created_by = auth.uid()
  )
);

-- PROGRESS: Students can view/edit their own progress
DROP POLICY IF EXISTS "touchbase_progress_select_own" ON public.touchbase_progress;
CREATE POLICY "touchbase_progress_select_own" ON public.touchbase_progress
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.touchbase_assignments a
    JOIN public.touchbase_classes c ON c.id = a.class_id
    WHERE a.module_id = touchbase_progress.module_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "touchbase_progress_modify_own" ON public.touchbase_progress;
CREATE POLICY "touchbase_progress_modify_own" ON public.touchbase_progress
FOR ALL USING (auth.uid() = user_id);

-- ASSIGNMENTS: Teachers can view/edit their own, students can view for their classes
DROP POLICY IF EXISTS "touchbase_assignments_select" ON public.touchbase_assignments;
CREATE POLICY "touchbase_assignments_select" ON public.touchbase_assignments
FOR SELECT USING (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.touchbase_class_enrollments e
    WHERE e.class_id = class_id
      AND e.student_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "touchbase_assignments_modify_teachers" ON public.touchbase_assignments;
CREATE POLICY "touchbase_assignments_modify_teachers" ON public.touchbase_assignments
FOR ALL USING (auth.uid() = teacher_id);

-- ============================================================
-- 10. HELPER FUNCTIONS
-- ============================================================

-- Function to check if user is teacher in org
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

-- Function to check if user is student in org
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
-- END OF MIGRATION
-- ============================================================

