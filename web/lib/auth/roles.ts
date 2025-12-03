// ============================================================
// TouchBase Academy - Role Management Utilities
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'coach' 
  | 'player' 
  | 'parent' 
  | 'viewer' 
  | 'teacher' 
  | 'student';

export type EducationRole = 'teacher' | 'student';
export type AdminRole = 'owner' | 'admin';
export type SportsRole = 'coach' | 'player';

/**
 * Get user's role in a specific organization
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("touchbase_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}

/**
 * Get user's role in their default organization
 */
export async function getUserDefaultRole(
  supabase: SupabaseClient,
  userId: string
): Promise<{ role: UserRole | null; orgId: string | null }> {
  // Get user's profile with default org
  const { data: profile } = await supabase
    .from("touchbase_profiles")
    .select("default_org_id")
    .eq("id", userId)
    .single();

  if (!profile?.default_org_id) {
    return { role: null, orgId: null };
  }

  const role = await getUserRole(supabase, userId, profile.default_org_id);
  return { role, orgId: profile.default_org_id };
}

/**
 * Check if user has a specific role in an organization
 */
export async function hasRole(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  roles: UserRole[]
): Promise<boolean> {
  const role = await getUserRole(supabase, userId, orgId);
  return role !== null && roles.includes(role);
}

/**
 * Check if user is a teacher (in any org or specific org)
 */
export async function isTeacher(
  supabase: SupabaseClient,
  userId: string,
  orgId?: string
): Promise<boolean> {
  if (orgId) {
    return hasRole(supabase, userId, orgId, ['teacher', 'admin', 'owner']);
  }

  // Check in default org
  const { role } = await getUserDefaultRole(supabase, userId);
  return role !== null && ['teacher', 'admin', 'owner'].includes(role);
}

/**
 * Check if user is a student (in any org or specific org)
 */
export async function isStudent(
  supabase: SupabaseClient,
  userId: string,
  orgId?: string
): Promise<boolean> {
  if (orgId) {
    return hasRole(supabase, userId, orgId, ['student', 'player']);
  }

  // Check in default org
  const { role } = await getUserDefaultRole(supabase, userId);
  return role !== null && ['student', 'player'].includes(role);
}

/**
 * Check if user is an admin (owner or admin role)
 */
export async function isAdmin(
  supabase: SupabaseClient,
  userId: string,
  orgId?: string
): Promise<boolean> {
  if (orgId) {
    return hasRole(supabase, userId, orgId, ['owner', 'admin']);
  }

  const { role } = await getUserDefaultRole(supabase, userId);
  return role !== null && ['owner', 'admin'].includes(role);
}

/**
 * Get all organizations where user has a specific role
 */
export async function getOrgsByRole(
  supabase: SupabaseClient,
  userId: string,
  roles: UserRole[]
): Promise<Array<{ orgId: string; role: UserRole; orgName: string }>> {
  const { data, error } = await supabase
    .from("touchbase_memberships")
    .select(`
      org_id,
      role,
      touchbase_organizations (
        id,
        name
      )
    `)
    .eq("user_id", userId)
    .in("role", roles);

  if (error || !data) return [];

  return data
    .filter((m: any) => m.touchbase_organizations)
    .map((m: any) => ({
      orgId: m.org_id,
      role: m.role as UserRole,
      orgName: m.touchbase_organizations.name,
    }));
}

