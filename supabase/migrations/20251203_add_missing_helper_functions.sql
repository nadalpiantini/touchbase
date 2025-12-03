-- ============================================================
-- TouchBase Academy: Add Missing Helper Functions
-- ============================================================
-- This migration adds helper functions that are referenced in RLS policies
-- but were missing from previous migrations
-- Date: 2025-12-03
-- ============================================================

-- ============================================================
-- 1. ADD MISSING touchbase_is_admin FUNCTION
-- ============================================================
-- Function to check if user is admin or owner in org
CREATE OR REPLACE FUNCTION public.touchbase_is_admin(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org 
      AND m.user_id = auth.uid()
      AND m.role IN ('admin', 'owner')
  );
$$;

-- ============================================================
-- 2. GRANT EXECUTE PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.touchbase_is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_is_admin(UUID) TO anon;

