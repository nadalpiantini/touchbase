// ============================================================
// TouchBase Academy - Middleware Helper Functions
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getUserDefaultRole, isTeacher, isStudent, UserRole } from "./roles";

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific role - redirects if user doesn't have the role
 */
export async function requireRole(
  supabase: SupabaseClient,
  allowedRoles: UserRole[],
  redirectTo: string = "/dashboard"
) {
  const user = await requireAuth(supabase);
  
  const { role } = await getUserDefaultRole(supabase, user.id);
  
  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo);
  }

  return { user, role };
}

/**
 * Require teacher role
 */
export async function requireTeacher(supabase: SupabaseClient) {
  const user = await requireAuth(supabase);
  
  const isTeacherUser = await isTeacher(supabase, user.id);
  if (!isTeacherUser) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Require student role
 */
export async function requireStudent(supabase: SupabaseClient) {
  const user = await requireAuth(supabase);
  
  const isStudentUser = await isStudent(supabase, user.id);
  if (!isStudentUser) {
    redirect("/dashboard");
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
    redirect("/dashboard");
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

