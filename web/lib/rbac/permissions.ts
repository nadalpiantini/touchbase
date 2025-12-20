/**
 * RBAC Permission Utilities
 * @module lib/rbac/permissions
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Role, ROLE_HIERARCHY, CurrentOrg, UserOrganization } from "./types";

/**
 * Check if a role has sufficient permissions (hierarchical check)
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  // Lower hierarchy number = higher privilege
  return userLevel <= requiredLevel;
}

/**
 * Check if user has one of the allowed roles
 */
export function hasAnyRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.some(role => hasPermission(userRole, role));
}

/**
 * Get user's current organization and role
 */
export async function getCurrentOrg(
  supabase: SupabaseClient
): Promise<CurrentOrg | null> {
  const { data, error } = await supabase.rpc("touchbase_current_org");

  if (error) {
    console.error("Error fetching current org:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as CurrentOrg;
}

/**
 * Get user's role in specific organization
 */
export async function getUserRole(
  supabase: SupabaseClient,
  orgId: string
): Promise<Role | null> {
  const { data, error } = await supabase.rpc("touchbase_get_user_role", {
    p_org_id: orgId
  });

  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }

  return data as Role | null;
}

/**
 * Check if user has permission in organization (uses RPC function)
 */
export async function checkPermission(
  supabase: SupabaseClient,
  orgId: string,
  requiredRole: Role
): Promise<boolean> {
  const { data, error } = await supabase.rpc("touchbase_has_permission", {
    p_org_id: orgId,
    p_required_role: requiredRole
  });

  if (error) {
    console.error("Error checking permission:", error);
    return false;
  }

  return data === true;
}

/**
 * Get all user's organizations
 */
export async function getUserOrganizations(
  supabase: SupabaseClient,
  userId: string
): Promise<UserOrganization[]> {
  const { data, error } = await supabase
    .from("touchbase_user_organizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }

  return (data || []) as UserOrganization[];
}

/**
 * Check if user is owner of organization
 */
export async function isOwner(
  supabase: SupabaseClient,
  orgId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, orgId);
  return role === 'owner';
}

/**
 * Check if user is admin or owner
 */
export async function isAdminOrOwner(
  supabase: SupabaseClient,
  orgId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, orgId);
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage content (coach, admin, or owner)
 */
export async function canManageContent(
  supabase: SupabaseClient,
  orgId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, orgId);
  return role === 'owner' || role === 'admin' || role === 'coach';
}

/**
 * Require specific permission or throw error
 */
export async function requirePermission(
  supabase: SupabaseClient,
  orgId: string,
  requiredRole: Role,
  errorMessage = "Insufficient permissions"
): Promise<void> {
  const hasAccess = await checkPermission(supabase, orgId, requiredRole);

  if (!hasAccess) {
    throw new Error(errorMessage);
  }
}

/**
 * Require one of the allowed roles or throw error
 */
export async function requireAnyRole(
  supabase: SupabaseClient,
  orgId: string,
  allowedRoles: Role[],
  errorMessage = "Insufficient permissions"
): Promise<void> {
  const userRole = await getUserRole(supabase, orgId);

  if (!userRole || !hasAnyRole(userRole, allowedRoles)) {
    throw new Error(errorMessage);
  }
}

/**
 * Get highest role across all organizations
 */
export function getHighestRole(roles: Role[]): Role | null {
  if (roles.length === 0) return null;

  return roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest;
  });
}
