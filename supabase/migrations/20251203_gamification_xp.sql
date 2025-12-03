-- ============================================================
-- TouchBase Academy - Gamification & XP System
-- Prefix: touchbase_
-- Date: 2025-12-03
-- ============================================================
-- This migration adds XP and skill tracking to profiles:
-- - XP and level fields
-- - Skill categories tracking
-- - Daily streak tracking
-- ============================================================

-- ============================================================
-- 1. EXTEND PROFILES TABLE WITH XP & SKILLS
-- ============================================================

-- Add XP and level fields
ALTER TABLE public.touchbase_profiles
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS skill_xp JSONB DEFAULT '{
  "Communication": 0,
  "Self-Management": 0,
  "Decision-Making": 0,
  "Collaboration": 0
}'::JSONB,
ADD COLUMN IF NOT EXISTS skill_levels JSONB DEFAULT '{
  "Communication": 1,
  "Self-Management": 1,
  "Decision-Making": 1,
  "Collaboration": 1
}'::JSONB,
ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_longest INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_last_active DATE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_touchbase_profiles_total_xp ON public.touchbase_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_touchbase_profiles_level ON public.touchbase_profiles(level DESC);

-- ============================================================
-- 2. XP AWARDS TABLE (Optional: for tracking XP history)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.touchbase_xp_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'module_complete', 'quiz_correct', 'daily_streak', 'assignment_ontime'
  xp_amount INTEGER NOT NULL,
  skill_category TEXT, -- 'Communication', 'Self-Management', etc.
  module_id UUID REFERENCES public.touchbase_modules(id) ON DELETE SET NULL,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_xp_awards_user_id ON public.touchbase_xp_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_xp_awards_created_at ON public.touchbase_xp_awards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchbase_xp_awards_action_type ON public.touchbase_xp_awards(action_type);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.touchbase_xp_awards ENABLE ROW LEVEL SECURITY;

-- Users can read their own XP awards
DROP POLICY IF EXISTS "touchbase_xp_awards_select_own" ON public.touchbase_xp_awards;
CREATE POLICY "touchbase_xp_awards_select_own" ON public.touchbase_xp_awards
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert XP awards (via service role or RPC)
DROP POLICY IF EXISTS "touchbase_xp_awards_insert_own" ON public.touchbase_xp_awards;
CREATE POLICY "touchbase_xp_awards_insert_own" ON public.touchbase_xp_awards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. HELPER FUNCTION: Calculate Level from XP
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_calculate_level(p_xp INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- This means:
  -- Level 1: 0-99 XP
  -- Level 2: 100-399 XP
  -- Level 3: 400-899 XP
  -- Level 4: 900-1599 XP
  -- etc.
  SELECT FLOOR(SQRT(GREATEST(0, p_xp)::NUMERIC / 100))::INTEGER + 1;
$$;

-- ============================================================
-- 5. HELPER FUNCTION: Award XP
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_award_xp(
  p_user_id UUID,
  p_action_type TEXT,
  p_xp_amount INTEGER,
  p_skill_category TEXT DEFAULT NULL,
  p_module_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
  v_skill_xp JSONB;
  v_skill_levels JSONB;
  v_new_skill_xp INTEGER;
  v_new_skill_level INTEGER;
BEGIN
  -- Insert XP award record
  INSERT INTO public.touchbase_xp_awards (
    user_id,
    action_type,
    xp_amount,
    skill_category,
    module_id,
    metadata
  ) VALUES (
    p_user_id,
    p_action_type,
    p_xp_amount,
    p_skill_category,
    p_module_id,
    p_metadata
  );

  -- Update profile with new XP
  UPDATE public.touchbase_profiles
  SET
    total_xp = total_xp + p_xp_amount,
    skill_xp = CASE
      WHEN p_skill_category IS NOT NULL THEN
        jsonb_set(
          COALESCE(skill_xp, '{}'::JSONB),
          ARRAY[p_skill_category],
          to_jsonb((COALESCE((skill_xp->>p_skill_category)::INTEGER, 0) + p_xp_amount)::TEXT)
        )
      ELSE skill_xp
    END,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING total_xp, skill_xp, skill_levels INTO v_new_total_xp, v_skill_xp, v_skill_levels;

  -- Calculate new level
  v_new_level := public.touchbase_calculate_level(v_new_total_xp);

  -- Update level if changed
  IF v_new_level > (SELECT level FROM public.touchbase_profiles WHERE id = p_user_id) THEN
    UPDATE public.touchbase_profiles
    SET level = v_new_level
    WHERE id = p_user_id;
  END IF;

  -- Calculate skill level if skill category provided
  IF p_skill_category IS NOT NULL THEN
    v_new_skill_xp := (v_skill_xp->>p_skill_category)::INTEGER;
    v_new_skill_level := public.touchbase_calculate_level(v_new_skill_xp);
    
    -- Update skill level if changed
    UPDATE public.touchbase_profiles
    SET skill_levels = jsonb_set(
      COALESCE(skill_levels, '{}'::JSONB),
      ARRAY[p_skill_category],
      to_jsonb(v_new_skill_level::TEXT)
    )
    WHERE id = p_user_id;
  END IF;

  -- Return updated values
  RETURN jsonb_build_object(
    'total_xp', v_new_total_xp,
    'level', v_new_level,
    'skill_xp', v_skill_xp,
    'leveled_up', v_new_level > (SELECT level FROM public.touchbase_profiles WHERE id = p_user_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_award_xp(UUID, TEXT, INTEGER, TEXT, UUID, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_award_xp(UUID, TEXT, INTEGER, TEXT, UUID, JSONB) TO authenticated;

-- ============================================================
-- 6. HELPER FUNCTION: Update Daily Streak
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_update_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_active DATE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
BEGIN
  SELECT
    COALESCE(streak_current, 0),
    COALESCE(streak_longest, 0),
    streak_last_active
  INTO v_current_streak, v_longest_streak, v_last_active
  FROM public.touchbase_profiles
  WHERE id = p_user_id;

  -- If last active was yesterday, increment streak
  IF v_last_active = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  -- If last active was today, keep current streak
  ELSIF v_last_active = v_today THEN
    v_new_streak := v_current_streak;
  -- Otherwise, reset to 1
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  -- Update profile
  UPDATE public.touchbase_profiles
  SET
    streak_current = v_new_streak,
    streak_longest = v_longest_streak,
    streak_last_active = v_today,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'is_new_streak', v_new_streak > v_current_streak
  );
END;
$$;

REVOKE ALL ON FUNCTION public.touchbase_update_streak(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_update_streak(UUID) TO authenticated;

