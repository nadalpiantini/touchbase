/**
 * RequireRole Component
 * Simplified role-based conditional rendering
 * @module components/auth/RequireRole
 */

"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Role } from "@/lib/rbac/types";

export interface RequireRoleProps {
  /** Single role or array of roles */
  role: Role | Role[];
  /** Content to render if role matches */
  children: ReactNode;
  /** Optional fallback content */
  fallback?: ReactNode;
}

/**
 * Render content only if user has specified role(s)
 * Simplified version of RequirePermission focused only on roles
 * 
 * @example
 * <RequireRole role="owner">
 *   <DeleteOrganizationButton />
 * </RequireRole>
 * 
 * @example
 * <RequireRole role={['owner', 'admin']}>
 *   <ManageUsersButton />
 * </RequireRole>
 */
export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const { loading, hasPermission, hasAnyRole } = usePermissions();

  if (loading) {
    return null;
  }

  // Handle array of roles
  if (Array.isArray(role)) {
    if (!hasAnyRole(role)) {
      return <>{fallback}</>;
    }
  } else {
    // Handle single role
    if (!hasPermission(role)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
