// ============================================================
// TouchBase Academy - Middleware Helper Functions
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUserDefaultRole, isTeacher, isStudent, UserRole } from "./roles";
import { DEV_USER_ID, DEV_TEACHER_ID, DEV_STUDENT_ID, DEV_ORG_ID, isDevMode } from "@/lib/dev-helpers";

/**
 * Require authentication - redirects to login if not authenticated
 * In development mode, returns a mock user instead
 */
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();

  // In development, return mock user if no real user
  if (!user && isDevMode()) {
    return {
      id: DEV_USER_ID,
      email: 'dev@touchbase.local',
      user_metadata: {},
      app_metadata: {}
    } as any;
  }

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return user;
}

/**
 * Get current org_id for API routes
 * Returns dev org in development mode if no auth
 */
export async function getCurrentOrgId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: cur } = await supabase.rpc("touchbase_current_org");
    return cur?.[0]?.org_id || null;
  }

  if (isDevMode()) {
    return DEV_ORG_ID;
  }

  return null;
}

/**
 * Require specific role - redirects if user doesn't have the role
 */
export async function requireRole(
  supabase: SupabaseClient,
  allowedRoles: UserRole[],
  redirectTo?: string
) {
  const user = await requireAuth(supabase);

  const { role } = await getUserDefaultRole(supabase, user.id);

  if (!role || !allowedRoles.includes(role)) {
    const locale = await getLocale();
    redirect(redirectTo || `/${locale}/dashboard`);
  }

  return { user, role };
}

/**
 * Require teacher role (or admin/owner who have teacher access)
 * In development mode, returns a mock teacher user for testing
 */
export async function requireTeacher(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();

  // In development, return mock teacher if no real user
  if (!user && isDevMode()) {
    return {
      id: DEV_TEACHER_ID,
      email: 'teacher@touchbase.local',
      user_metadata: {},
      app_metadata: {}
    } as any;
  }

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  // Check role directly - owners and admins always have teacher access
  const { role } = await getUserDefaultRole(supabase, user.id);
  const hasTeacherAccess = role !== null && ['teacher', 'admin', 'owner', 'coach'].includes(role);

  if (!hasTeacherAccess) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return user;
}

/**
 * Require student role (or admin/owner who can access all areas)
 * In development mode, returns a mock student user for testing
 */
export async function requireStudent(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();

  // In development, return mock student if no real user
  if (!user && isDevMode()) {
    return {
      id: DEV_STUDENT_ID,
      email: 'student@touchbase.local',
      user_metadata: {},
      app_metadata: {}
    } as any;
  }

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  // Check role directly - owners and admins can access all areas including student view
  const { role } = await getUserDefaultRole(supabase, user.id);
  const hasStudentAccess = role !== null && ['student', 'player', 'admin', 'owner'].includes(role);

  if (!hasStudentAccess) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(supabase: SupabaseClient) {
  const user = await requireAuth(supabase);

  const { role } = await getUserDefaultRole(supabase, user.id);

  if (!role || !['admin', 'owner'].includes(role)) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return user;
}

/**
 * Get user with role info (for pages that need role but don't require specific role)
 */
export async function getUserWithRole(supabase: SupabaseClient) {
  const user = await requireAuth(supabase);
  const { role, orgId } = await getUserDefaultRole(supabase, user.id);
  
  return {
    user,
    role,
    orgId,
    isTeacher: role !== null && ['teacher', 'admin', 'owner'].includes(role),
    isStudent: role !== null && ['student', 'player'].includes(role),
    isAdmin: role !== null && ['owner', 'admin'].includes(role),
  };
}

