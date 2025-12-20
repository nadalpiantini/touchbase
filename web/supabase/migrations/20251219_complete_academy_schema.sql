-- ============================================================
-- TouchBase Academy - Complete Schema Migration
-- Adds missing tables: badges, user_badges, streaks, attendance,
-- class_modules, schedules, and extends profiles with XP/levels
-- ============================================================

-- ============================================================
-- 1. EXTEND PROFILES TABLE
-- ============================================================
ALTER TABLE public.touchbase_profiles
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::JSONB;

-- ============================================================
-- 2. BADGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('achievement', 'milestone', 'skill', 'social', 'special')),
  icon_url TEXT,
  xp_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_badges_category ON public.touchbase_badges(category);
CREATE INDEX IF NOT EXISTS idx_touchbase_badges_is_active ON public.touchbase_badges(is_active);

-- ============================================================
-- 3. USER BADGES (earned badges)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.touchbase_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_user_badges_user_id ON public.touchbase_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_user_badges_badge_id ON public.touchbase_user_badges(badge_id);

-- ============================================================
-- 4. STREAKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_streaks_user_id ON public.touchbase_streaks(user_id);

-- ============================================================
-- 5. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  marked_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_class_id ON public.touchbase_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_student_id ON public.touchbase_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_attendance_date ON public.touchbase_attendance(date);

-- ============================================================
-- 6. CLASS MODULES (module assignments to classes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_class_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID,
  UNIQUE(class_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_class_modules_class_id ON public.touchbase_class_modules(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_modules_module_id ON public.touchbase_class_modules(module_id);

-- ============================================================
-- 7. SCHEDULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  is_recurring BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchbase_schedules_class_id ON public.touchbase_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_schedules_day_of_week ON public.touchbase_schedules(day_of_week);

-- ============================================================
-- 8. ASSIGNMENT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.touchbase_assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.touchbase_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('submitted', 'graded', 'returned')) DEFAULT 'submitted',
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_touchbase_submissions_assignment_id ON public.touchbase_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_submissions_student_id ON public.touchbase_assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_submissions_status ON public.touchbase_assignment_submissions(status);

-- ============================================================
-- 9. FIX MODULES TABLE (make created_by nullable for seeding)
-- ============================================================
ALTER TABLE public.touchbase_modules
ALTER COLUMN created_by DROP NOT NULL;

-- ============================================================
-- 10. ADD TITLE TO MODULE STEPS (for display)
-- ============================================================
ALTER TABLE public.touchbase_module_steps
ADD COLUMN IF NOT EXISTS title TEXT;

-- ============================================================
-- 11. ADD XP_EARNED TO PROGRESS TABLE
-- ============================================================
ALTER TABLE public.touchbase_progress
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- ============================================================
-- 12. ENABLE RLS ON ALL NEW TABLES
-- ============================================================
ALTER TABLE public.touchbase_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_class_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. RLS POLICIES (permissive for development)
-- ============================================================
-- Badges (read-only for all, admin can manage)
DROP POLICY IF EXISTS "Allow read badges" ON public.touchbase_badges;
CREATE POLICY "Allow read badges" ON public.touchbase_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage badges" ON public.touchbase_badges;
CREATE POLICY "Allow manage badges" ON public.touchbase_badges FOR ALL USING (true);

-- User badges
DROP POLICY IF EXISTS "Allow all user_badges" ON public.touchbase_user_badges;
CREATE POLICY "Allow all user_badges" ON public.touchbase_user_badges FOR ALL USING (true);

-- Streaks
DROP POLICY IF EXISTS "Allow all streaks" ON public.touchbase_streaks;
CREATE POLICY "Allow all streaks" ON public.touchbase_streaks FOR ALL USING (true);

-- Attendance
DROP POLICY IF EXISTS "Allow all attendance" ON public.touchbase_attendance;
CREATE POLICY "Allow all attendance" ON public.touchbase_attendance FOR ALL USING (true);

-- Class modules
DROP POLICY IF EXISTS "Allow all class_modules" ON public.touchbase_class_modules;
CREATE POLICY "Allow all class_modules" ON public.touchbase_class_modules FOR ALL USING (true);

-- Schedules
DROP POLICY IF EXISTS "Allow all schedules" ON public.touchbase_schedules;
CREATE POLICY "Allow all schedules" ON public.touchbase_schedules FOR ALL USING (true);

-- Assignment submissions
DROP POLICY IF EXISTS "Allow all submissions" ON public.touchbase_assignment_submissions;
CREATE POLICY "Allow all submissions" ON public.touchbase_assignment_submissions FOR ALL USING (true);

-- ============================================================
-- DONE!
-- ============================================================
SELECT 'TouchBase Academy complete schema migration applied!' as status;
