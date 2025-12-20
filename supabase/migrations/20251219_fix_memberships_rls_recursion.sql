-- ============================================================
-- Fix: Infinite recursion in touchbase_memberships RLS policies
--
-- Problem: touchbase_is_org_member() queries touchbase_memberships,
--          but the RLS policy on that table calls touchbase_is_org_member(),
--          creating infinite recursion.
--
-- Solution: Mark helper functions as SECURITY DEFINER to bypass RLS
--           when checking membership. This is the standard pattern.
-- ============================================================

-- Drop and recreate touchbase_is_org_member with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.touchbase_is_org_member(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org AND m.user_id = auth.uid()
  );
$$;

-- Drop and recreate touchbase_get_user_role with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.touchbase_get_user_role(p_org UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.touchbase_memberships
  WHERE org_id = p_org AND user_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.touchbase_is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touchbase_get_user_role(UUID) TO authenticated;

-- ============================================================
-- Optional: Add a helper to check admin/owner role (also SECURITY DEFINER)
-- This prevents recursion in touchbase_memberships_modify_admins policy
-- ============================================================

CREATE OR REPLACE FUNCTION public.touchbase_is_org_admin(p_org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.touchbase_memberships m
    WHERE m.org_id = p_org
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.touchbase_is_org_admin(UUID) TO authenticated;

-- ============================================================
-- Update policies to use the new helper function
-- ============================================================

-- MEMBERSHIPS: only members of that org can view
DROP POLICY IF EXISTS "touchbase_memberships_select_members" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_select_members" ON public.touchbase_memberships
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- MEMBERSHIPS: only owners/admins can modify (using new helper)
DROP POLICY IF EXISTS "touchbase_memberships_modify_admins" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_modify_admins" ON public.touchbase_memberships
  FOR ALL USING (public.touchbase_is_org_admin(org_id))
  WITH CHECK (public.touchbase_is_org_admin(org_id));

-- MEMBERSHIPS: allow users to insert their own first membership (for onboarding)
-- This is needed so users can create their first org and become owner
DROP POLICY IF EXISTS "touchbase_memberships_insert_self" ON public.touchbase_memberships;
CREATE POLICY "touchbase_memberships_insert_self" ON public.touchbase_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- End of migration
-- ============================================================
