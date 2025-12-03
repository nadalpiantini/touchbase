-- ============================================================
-- TouchBase Academy: Streak System
-- ============================================================

-- User streaks table
CREATE TABLE IF NOT EXISTS public.touchbase_streaks (
  user_id UUID PRIMARY KEY REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_streaks_org_id ON public.touchbase_streaks(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_streaks_user_id ON public.touchbase_streaks(user_id);

-- RLS Policies
ALTER TABLE public.touchbase_streaks ENABLE ROW LEVEL SECURITY;

-- Users can see their own streaks, teachers can see all in org
CREATE POLICY "touchbase_streaks_select_own_or_teacher" ON public.touchbase_streaks
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (public.touchbase_is_teacher(org_id) OR public.touchbase_is_admin(org_id))
  );

-- Only system can update streaks (via RPC)
CREATE POLICY "touchbase_streaks_update_system" ON public.touchbase_streaks
  FOR UPDATE USING (false); -- Only via RPC

CREATE POLICY "touchbase_streaks_insert_system" ON public.touchbase_streaks
  FOR INSERT WITH CHECK (false); -- Only via RPC

-- RPC: Update user streak
CREATE OR REPLACE FUNCTION public.touchbase_update_streak(
  p_user_id UUID,
  p_org_id UUID
)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  is_new_streak BOOLEAN,
  streak_broken BOOLEAN
)
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_existing RECORD;
  v_new_streak INTEGER;
  v_is_new_streak BOOLEAN := FALSE;
  v_streak_broken BOOLEAN := FALSE;
BEGIN
  -- Get existing streak
  SELECT * INTO v_existing
  FROM public.touchbase_streaks
  WHERE user_id = p_user_id AND org_id = p_org_id;

  -- If no streak exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.touchbase_streaks (user_id, org_id, current_streak, longest_streak, last_activity_date, streak_start_date)
    VALUES (p_user_id, p_org_id, 1, 1, v_today, v_today)
    RETURNING current_streak, longest_streak INTO v_new_streak, v_new_streak;
    
    v_is_new_streak := TRUE;
    
    RETURN QUERY SELECT v_new_streak, v_new_streak, v_is_new_streak, v_streak_broken;
    RETURN;
  END IF;

  -- Check if streak should continue or reset
  IF v_existing.last_activity_date = v_today THEN
    -- Already updated today, return current values
    RETURN QUERY SELECT 
      v_existing.current_streak,
      v_existing.longest_streak,
      FALSE,
      FALSE;
    RETURN;
  ELSIF v_existing.last_activity_date = v_yesterday THEN
    -- Continue streak
    v_new_streak := v_existing.current_streak + 1;
    v_is_new_streak := (v_existing.current_streak = 0);
  ELSIF v_existing.last_activity_date < v_yesterday THEN
    -- Streak broken, reset to 1
    v_new_streak := 1;
    v_streak_broken := (v_existing.current_streak > 0);
  ELSE
    -- Future date (shouldn't happen), but handle gracefully
    v_new_streak := v_existing.current_streak;
  END IF;

  -- Update longest streak if needed
  IF v_new_streak > v_existing.longest_streak THEN
    UPDATE public.touchbase_streaks
    SET 
      current_streak = v_new_streak,
      longest_streak = v_new_streak,
      last_activity_date = v_today,
      streak_start_date = CASE WHEN v_streak_broken THEN v_today ELSE v_existing.streak_start_date END,
      updated_at = NOW()
    WHERE user_id = p_user_id AND org_id = p_org_id;
  ELSE
    UPDATE public.touchbase_streaks
    SET 
      current_streak = v_new_streak,
      last_activity_date = v_today,
      streak_start_date = CASE WHEN v_streak_broken THEN v_today ELSE v_existing.streak_start_date END,
      updated_at = NOW()
    WHERE user_id = p_user_id AND org_id = p_org_id;
  END IF;

  RETURN QUERY SELECT 
    v_new_streak,
    GREATEST(v_existing.longest_streak, v_new_streak),
    v_is_new_streak,
    v_streak_broken;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_update_streak(UUID, UUID) TO authenticated;

