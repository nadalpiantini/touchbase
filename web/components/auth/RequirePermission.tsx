/**
 * RequirePermission Component
 * Conditional rendering based on RBAC permissions
 * @module components/auth/RequirePermission
 */

"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Role, PERMISSIONS } from "@/lib/rbac/types";

export interface RequirePermissionProps {
  /** Permission preset to check (e.g., 'MANAGE_THEME') */
  permission?: keyof typeof PERMISSIONS;
  /** Specific role required */
  role?: Role;
  /** Array of allowed roles (user must have one) */
  roles?: Role[];
  /** Content to render if permission is granted */
  children: ReactNode;
  /** Optional fallback content if permission denied */
  fallback?: ReactNode;
  /** Show loading state while checking permissions */
  showLoading?: boolean;
}

/**
 * Conditionally render content based on user permissions
 * 
 * @example
 * // Check permission preset
 * <RequirePermission permission="MANAGE_THEME">
 *   <ThemeSettings />
 * </RequirePermission>
 * 
 * @example
 * // Check specific role
 * <RequirePermission role="admin">
 *   <AdminPanel />
 * </RequirePermission>
 * 
 * @example
 * // Check multiple roles
 * <RequirePermission roles={['owner', 'admin']}>
 *   <SettingsButton />
 * </RequirePermission>
 * 
 * @example
 * // With fallback content
 * <RequirePermission permission="VIEW_ANALYTICS" fallback={<UpgradePrompt />}>
 *   <AnalyticsDashboard />
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  role,
  roles,
  children,
  fallback = null,
  showLoading = false,
}: RequirePermissionProps) {
  const { loading, error, can, hasPermission, hasAnyRole } = usePermissions();

  // Show loading state
  if (loading && showLoading) {
    return <div className="animate-pulse">Loading permissions...</div>;
  }

  // Handle error state
  if (error) {
    console.error("Permission check error:", error);
    return <>{fallback}</>;
  }

  // Check permission preset
  if (permission) {
    if (!can(permission)) {
      return <>{fallback}</>;
    }
  }

  // Check specific role
  if (role) {
    if (!hasPermission(role)) {
      return <>{fallback}</>;
    }
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return <>{fallback}</>;
    }
  }

  // Permission granted, render children
  return <>{children}</>;
}
