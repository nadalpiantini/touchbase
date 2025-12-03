-- ============================================================
-- TouchBase Academy: Schedule System
-- ============================================================

-- Class schedules table (extends existing schedule JSONB in classes)
CREATE TABLE IF NOT EXISTS public.touchbase_class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_recurring BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, start_time)
);

-- Schedule exceptions (holidays, cancellations)
CREATE TABLE IF NOT EXISTS public.touchbase_schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, exception_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_class_id ON public.touchbase_class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_org_id ON public.touchbase_class_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_schedule_exceptions_class_id ON public.touchbase_schedule_exceptions(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_schedule_exceptions_date ON public.touchbase_schedule_exceptions(exception_date);

-- RLS Policies
ALTER TABLE public.touchbase_class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- Schedules: visible to org members
CREATE POLICY "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- Schedules: teachers can modify
CREATE POLICY "touchbase_class_schedules_modify_teachers" ON public.touchbase_class_schedules
  FOR ALL USING (
    public.touchbase_is_teacher(org_id) AND
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.touchbase_is_teacher(org_id) AND
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );

-- Schedule exceptions: same rules as schedules
CREATE POLICY "touchbase_schedule_exceptions_select_members" ON public.touchbase_schedule_exceptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      JOIN public.touchbase_organizations o ON o.id = c.org_id
      WHERE c.id = class_id AND public.touchbase_is_org_member(o.id)
    )
  );

CREATE POLICY "touchbase_schedule_exceptions_modify_teachers" ON public.touchbase_schedule_exceptions
  FOR ALL USING (
    public.touchbase_is_teacher(org_id) AND
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.touchbase_is_teacher(org_id) AND
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );

