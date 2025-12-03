-- ============================================================
-- TouchBase Academy: Challenges System
-- ============================================================

-- Challenges created by teachers
CREATE TABLE IF NOT EXISTS public.touchbase_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('module_complete', 'xp_earn', 'streak_maintain', 'skill_master')),
  target_value INTEGER NOT NULL, -- e.g., complete 5 modules, earn 500 XP, maintain 7-day streak
  reward_xp INTEGER DEFAULT 0,
  reward_badge_id UUID REFERENCES public.touchbase_badges(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participants and progress
CREATE TABLE IF NOT EXISTS public.touchbase_challenge_participants (
  challenge_id UUID NOT NULL REFERENCES public.touchbase_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (challenge_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_challenges_org_id ON public.touchbase_challenges(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_challenges_class_id ON public.touchbase_challenges(class_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_challenges_teacher_id ON public.touchbase_challenges(teacher_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_challenge_participants_challenge_id ON public.touchbase_challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_challenge_participants_user_id ON public.touchbase_challenge_participants(user_id);

-- RLS Policies
ALTER TABLE public.touchbase_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_challenge_participants ENABLE ROW LEVEL SECURITY;

-- Challenges: visible to org members
CREATE POLICY "touchbase_challenges_select_members" ON public.touchbase_challenges
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- Challenges: teachers can create/modify
CREATE POLICY "touchbase_challenges_modify_teachers" ON public.touchbase_challenges
  FOR ALL USING (public.touchbase_is_teacher(org_id) AND teacher_id = auth.uid())
  WITH CHECK (public.touchbase_is_teacher(org_id) AND teacher_id = auth.uid());

-- Challenge participants: users can see their own, teachers can see all
CREATE POLICY "touchbase_challenge_participants_select_own_or_teacher" ON public.touchbase_challenge_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.touchbase_challenges c
      WHERE c.id = challenge_id AND c.teacher_id = auth.uid()
    )
  );

-- Challenge participants: students can join, system can update progress
CREATE POLICY "touchbase_challenge_participants_insert_students" ON public.touchbase_challenge_participants
  FOR INSERT WITH CHECK (public.touchbase_is_student(org_id) AND user_id = auth.uid());

CREATE POLICY "touchbase_challenge_participants_update_system" ON public.touchbase_challenge_participants
  FOR UPDATE USING (false); -- Only via RPC

-- RPC: Join challenge
CREATE OR REPLACE FUNCTION public.touchbase_join_challenge(
  p_challenge_id UUID
)
RETURNS public.touchbase_challenge_participants
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_challenge RECORD;
  v_org_id UUID;
  v_participant public.touchbase_challenge_participants;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get challenge info
  SELECT * INTO v_challenge
  FROM public.touchbase_challenges
  WHERE id = p_challenge_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found or inactive';
  END IF;

  v_org_id := v_challenge.org_id;

  -- Verify user is a student in the org
  IF NOT public.touchbase_is_student(v_org_id) THEN
    RAISE EXCEPTION 'Only students can join challenges';
  END IF;

  -- Check if already joined
  SELECT * INTO v_participant
  FROM public.touchbase_challenge_participants
  WHERE challenge_id = p_challenge_id AND user_id = v_uid;

  IF FOUND THEN
    RETURN v_participant; -- Already joined
  END IF;

  -- Join challenge
  INSERT INTO public.touchbase_challenge_participants (challenge_id, user_id, org_id)
  VALUES (p_challenge_id, v_uid, v_org_id)
  RETURNING * INTO v_participant;

  RETURN v_participant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_join_challenge(UUID) TO authenticated;

-- RPC: Update challenge progress
CREATE OR REPLACE FUNCTION public.touchbase_update_challenge_progress(
  p_challenge_id UUID,
  p_user_id UUID,
  p_progress_delta INTEGER
)
RETURNS public.touchbase_challenge_participants
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant RECORD;
  v_challenge RECORD;
  v_new_progress INTEGER;
  v_completed BOOLEAN := FALSE;
BEGIN
  -- Get participant
  SELECT * INTO v_participant
  FROM public.touchbase_challenge_participants
  WHERE challenge_id = p_challenge_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User is not a participant in this challenge';
  END IF;

  -- Get challenge
  SELECT * INTO v_challenge
  FROM public.touchbase_challenges
  WHERE id = p_challenge_id;

  -- Update progress
  v_new_progress := LEAST(
    v_participant.current_progress + p_progress_delta,
    v_challenge.target_value
  );

  -- Check if completed
  IF v_new_progress >= v_challenge.target_value AND NOT v_participant.completed THEN
    v_completed := TRUE;
  END IF;

  -- Update participant
  UPDATE public.touchbase_challenge_participants
  SET 
    current_progress = v_new_progress,
    completed = v_completed,
    completed_at = CASE WHEN v_completed THEN NOW() ELSE v_participant.completed_at END
  WHERE challenge_id = p_challenge_id AND user_id = p_user_id
  RETURNING * INTO v_participant;

  -- Award rewards if completed
  IF v_completed THEN
    -- Award XP
    IF v_challenge.reward_xp > 0 THEN
      UPDATE public.touchbase_profiles
      SET xp = COALESCE(xp, 0) + v_challenge.reward_xp,
          updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    -- Award badge
    IF v_challenge.reward_badge_id IS NOT NULL THEN
      PERFORM public.touchbase_award_badge(
        p_user_id,
        v_challenge.reward_badge_id,
        v_challenge.org_id,
        jsonb_build_object('challenge_id', p_challenge_id, 'challenge_title', v_challenge.title)
      );
    END IF;
  END IF;

  RETURN v_participant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_update_challenge_progress(UUID, UUID, INTEGER) TO authenticated;

