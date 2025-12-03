-- ============================================================
-- TouchBase Academy: Badge System
-- ============================================================

-- Badge definitions
CREATE TABLE IF NOT EXISTS public.touchbase_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('achievement', 'milestone', 'skill', 'streak', 'special')),
  criteria JSONB, -- {type: "module_complete", count: 5, module_id?: "...", skill?: "..."}
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- User badges (awards)
CREATE TABLE IF NOT EXISTS public.touchbase_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.touchbase_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.touchbase_badges(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB, -- Additional context about the award
  UNIQUE(user_id, badge_id, org_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_badges_org_id ON public.touchbase_badges(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_badges_category ON public.touchbase_badges(category);
CREATE INDEX IF NOT EXISTS idx_touchbase_user_badges_user_id ON public.touchbase_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_user_badges_badge_id ON public.touchbase_user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_user_badges_org_id ON public.touchbase_user_badges(org_id);

-- RLS Policies
ALTER TABLE public.touchbase_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_user_badges ENABLE ROW LEVEL SECURITY;

-- Badges: visible to all org members
CREATE POLICY "touchbase_badges_select_members" ON public.touchbase_badges
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- User badges: users can see their own, teachers/admins can see all in org
CREATE POLICY "touchbase_user_badges_select_own" ON public.touchbase_user_badges
  FOR SELECT USING (user_id = auth.uid() OR public.touchbase_is_teacher(org_id) OR public.touchbase_is_admin(org_id));

-- Only system can insert user badges (via RPC)
CREATE POLICY "touchbase_user_badges_insert_system" ON public.touchbase_user_badges
  FOR INSERT WITH CHECK (false); -- Only via RPC

-- RPC: Award badge to user
CREATE OR REPLACE FUNCTION public.touchbase_award_badge(
  p_user_id UUID,
  p_badge_id UUID,
  p_org_id UUID,
  p_metadata JSONB DEFAULT NULL
)
RETURNS public.touchbase_user_badges
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge public.touchbase_badges;
  v_award public.touchbase_user_badges;
BEGIN
  -- Get badge info
  SELECT * INTO v_badge
  FROM public.touchbase_badges
  WHERE id = p_badge_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Badge not found or inactive';
  END IF;

  -- Check if user already has this badge
  SELECT * INTO v_award
  FROM public.touchbase_user_badges
  WHERE user_id = p_user_id AND badge_id = p_badge_id AND org_id = p_org_id;

  IF FOUND THEN
    RETURN v_award; -- Already awarded
  END IF;

  -- Award badge
  INSERT INTO public.touchbase_user_badges (user_id, badge_id, org_id, metadata)
  VALUES (p_user_id, p_badge_id, p_org_id, p_metadata)
  RETURNING * INTO v_award;

  -- Award XP if badge has XP reward
  IF v_badge.xp_reward > 0 THEN
    UPDATE public.touchbase_profiles
    SET xp = COALESCE(xp, 0) + v_badge.xp_reward,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  RETURN v_award;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_award_badge(UUID, UUID, UUID, JSONB) TO authenticated;

-- Insert default badges
INSERT INTO public.touchbase_badges (org_id, name, description, category, criteria, xp_reward) VALUES
  (NULL, 'First Steps', 'Complete your first module', 'milestone', '{"type": "module_complete", "count": 1}'::jsonb, 50),
  (NULL, 'Module Master', 'Complete 5 modules', 'achievement', '{"type": "module_complete", "count": 5}'::jsonb, 200),
  (NULL, 'Perfect Score', 'Get 100% on a quiz', 'achievement', '{"type": "quiz_perfect", "count": 1}'::jsonb, 100),
  (NULL, 'Week Warrior', 'Complete 7 days of learning', 'streak', '{"type": "daily_streak", "count": 7}'::jsonb, 150),
  (NULL, 'Level Up', 'Reach level 5', 'milestone', '{"type": "level_reach", "level": 5}'::jsonb, 300)
ON CONFLICT DO NOTHING;

