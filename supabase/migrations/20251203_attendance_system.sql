-- ============================================================
-- TouchBase Academy: Attendance Tracking System
-- ============================================================

-- Attendance records
CREATE TABLE IF NOT EXISTS public.touchbase_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  marked_by UUID REFERENCES public.touchbase_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, attendance_date)
);

-- Attendance notifications (for absence tracking)
CREATE TABLE IF NOT EXISTS public.touchbase_attendance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES public.touchbase_attendance(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('absence', 'pattern_alert', 'reminder')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  recipient_id UUID REFERENCES public.touchbase_profiles(id) ON DELETE SET NULL,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_class_id ON public.touchbase_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_student_id ON public.touchbase_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_date ON public.touchbase_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_org_id ON public.touchbase_attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_notifications_attendance_id ON public.touchbase_attendance_notifications(attendance_id);

-- RLS Policies
ALTER TABLE public.touchbase_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_attendance_notifications ENABLE ROW LEVEL SECURITY;

-- Attendance: teachers can view and modify, students can view their own
CREATE POLICY "touchbase_attendance_select_teachers_and_students" ON public.touchbase_attendance
  FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    ) OR
    public.touchbase_is_admin(org_id)
  );

CREATE POLICY "touchbase_attendance_modify_teachers" ON public.touchbase_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    ) OR
    public.touchbase_is_admin(org_id)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.touchbase_classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    ) OR
    public.touchbase_is_admin(org_id)
  );

-- Attendance notifications: teachers and students can view
CREATE POLICY "touchbase_attendance_notifications_select" ON public.touchbase_attendance_notifications
  FOR SELECT USING (
    recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.touchbase_attendance a
      JOIN public.touchbase_classes c ON c.id = a.class_id
      WHERE a.id = attendance_id AND c.teacher_id = auth.uid()
    )
  );

-- RPC: Mark attendance for multiple students
CREATE OR REPLACE FUNCTION public.touchbase_mark_attendance_bulk(
  p_class_id UUID,
  p_attendance_date DATE,
  p_attendance_records JSONB -- [{student_id, status, notes?}]
)
RETURNS TABLE(id UUID, student_id UUID, status TEXT)
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_class RECORD;
  v_record JSONB;
  v_attendance_id UUID;
BEGIN
  -- Get class info
  SELECT * INTO v_class
  FROM public.touchbase_classes
  WHERE id = p_class_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found';
  END IF;

  -- Verify teacher owns class
  IF v_class.teacher_id != v_uid AND NOT public.touchbase_is_admin(v_class.org_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Process each attendance record
  FOR v_record IN SELECT * FROM jsonb_array_elements(p_attendance_records)
  LOOP
    INSERT INTO public.touchbase_attendance (
      class_id,
      org_id,
      student_id,
      attendance_date,
      status,
      notes,
      marked_by
    )
    VALUES (
      p_class_id,
      v_class.org_id,
      (v_record->>'student_id')::UUID,
      p_attendance_date,
      v_record->>'status',
      v_record->>'notes',
      v_uid
    )
    ON CONFLICT (class_id, student_id, attendance_date)
    DO UPDATE SET
      status = EXCLUDED.status,
      notes = EXCLUDED.notes,
      marked_by = v_uid,
      updated_at = NOW()
    RETURNING id, student_id, status INTO v_attendance_id, v_record->>'student_id', v_record->>'status';

    -- Create notification for absences
    IF v_record->>'status' = 'absent' THEN
      INSERT INTO public.touchbase_attendance_notifications (
        attendance_id,
        notification_type,
        recipient_id,
        metadata
      )
      VALUES (
        v_attendance_id,
        'absence',
        (v_record->>'student_id')::UUID,
        jsonb_build_object('date', p_attendance_date, 'class_name', v_class.name)
      );
    END IF;

    RETURN QUERY SELECT v_attendance_id, (v_record->>'student_id')::UUID, v_record->>'status';
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_mark_attendance_bulk(UUID, DATE, JSONB) TO authenticated;

