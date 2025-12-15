-- ============================================================
-- TouchBase Schema Fix: Add missing columns, tables, relationships
-- Run this via Supabase SQL Editor or CLI
-- ============================================================

-- 1. SOFT DELETE COLUMNS
ALTER TABLE public.touchbase_teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.touchbase_players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.touchbase_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  entity TEXT NOT NULL CHECK (entity IN ('team','player')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','update','soft_delete','restore','purge')),
  actor UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for audit log
ALTER TABLE public.touchbase_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_audit_select_members" ON public.touchbase_audit_log;
CREATE POLICY "touchbase_audit_select_members" ON public.touchbase_audit_log
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- 3. TOUCHBASE_CLASSES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS public.touchbase_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  capacity INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  schedule JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for classes
ALTER TABLE public.touchbase_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_classes_select_members" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_select_members" ON public.touchbase_classes
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

DROP POLICY IF EXISTS "touchbase_classes_modify_teachers" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_modify_teachers" ON public.touchbase_classes
  FOR ALL USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- 4. CLASS SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.touchbase_class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_recurring BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for class schedules
ALTER TABLE public.touchbase_class_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules;
CREATE POLICY "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

DROP POLICY IF EXISTS "touchbase_class_schedules_modify_members" ON public.touchbase_class_schedules;
CREATE POLICY "touchbase_class_schedules_modify_members" ON public.touchbase_class_schedules
  FOR ALL USING (public.touchbase_is_org_member(org_id))
  WITH CHECK (public.touchbase_is_org_member(org_id));

-- 5. HELPER FUNCTION (if not exists)
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

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_org_id ON public.touchbase_audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_entity ON public.touchbase_audit_log(entity);
CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_created_at ON public.touchbase_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_org_id ON public.touchbase_class_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_class_id ON public.touchbase_class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_org_id ON public.touchbase_classes(org_id);

-- Done!
SELECT 'Schema fix completed successfully' as status;
