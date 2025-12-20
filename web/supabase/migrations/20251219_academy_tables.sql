-- TouchBase Academy Tables Migration
-- Creates tables for educational modules, progress tracking, and assignments

-- Create touchbase_module_steps table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_module_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL CHECK (step_type IN ('content', 'quiz', 'scenario')),
  content_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create touchbase_progress table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  step_progress JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create touchbase_assignments table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_steps_module_id ON public.touchbase_module_steps(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.touchbase_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON public.touchbase_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.touchbase_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module_id ON public.touchbase_assignments(module_id);

-- Enable RLS on new tables
ALTER TABLE public.touchbase_module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_assignments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for authenticated users)
DO $$
BEGIN
  -- Module steps policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_module_steps' AND policyname = 'Allow read module_steps') THEN
    CREATE POLICY "Allow read module_steps" ON public.touchbase_module_steps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_module_steps' AND policyname = 'Allow insert module_steps') THEN
    CREATE POLICY "Allow insert module_steps" ON public.touchbase_module_steps FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_module_steps' AND policyname = 'Allow update module_steps') THEN
    CREATE POLICY "Allow update module_steps" ON public.touchbase_module_steps FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_module_steps' AND policyname = 'Allow delete module_steps') THEN
    CREATE POLICY "Allow delete module_steps" ON public.touchbase_module_steps FOR DELETE USING (true);
  END IF;

  -- Progress policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_progress' AND policyname = 'Allow read progress') THEN
    CREATE POLICY "Allow read progress" ON public.touchbase_progress FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_progress' AND policyname = 'Allow insert progress') THEN
    CREATE POLICY "Allow insert progress" ON public.touchbase_progress FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_progress' AND policyname = 'Allow update progress') THEN
    CREATE POLICY "Allow update progress" ON public.touchbase_progress FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_progress' AND policyname = 'Allow delete progress') THEN
    CREATE POLICY "Allow delete progress" ON public.touchbase_progress FOR DELETE USING (true);
  END IF;

  -- Assignments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_assignments' AND policyname = 'Allow read assignments') THEN
    CREATE POLICY "Allow read assignments" ON public.touchbase_assignments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_assignments' AND policyname = 'Allow insert assignments') THEN
    CREATE POLICY "Allow insert assignments" ON public.touchbase_assignments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_assignments' AND policyname = 'Allow update assignments') THEN
    CREATE POLICY "Allow update assignments" ON public.touchbase_assignments FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'touchbase_assignments' AND policyname = 'Allow delete assignments') THEN
    CREATE POLICY "Allow delete assignments" ON public.touchbase_assignments FOR DELETE USING (true);
  END IF;
END $$;
