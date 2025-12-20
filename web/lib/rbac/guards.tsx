/**
 * RBAC Guard Utilities
 * Higher-order components and utilities for permission-based access control
 * @module lib/rbac/guards
 */

"use client";

import { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Role, PERMISSIONS } from "./types";

export interface GuardConfig {
  /** Permission preset required */
  permission?: keyof typeof PERMISSIONS;
  /** Specific role required */
  role?: Role;
  /** Array of allowed roles */
  roles?: Role[];
  /** Redirect path if unauthorized */
  redirectTo?: string;
}

/**
 * Higher-order component to protect components with permissions
 * 
 * @example
 * const ProtectedAdminPanel = withPermissionGuard(AdminPanel, {
 *   role: 'admin',
 *   redirectTo: '/dashboard'
 * });
 */
export function withPermissionGuard<P extends object>(
  Component: ComponentType<P>,
  config: GuardConfig
) {
  return function PermissionGuardedComponent(props: P) {
    const router = useRouter();
    const { loading, error, can, hasPermission, hasAnyRole, orgId } = usePermissions();

    useEffect(() => {
      if (loading) return;

      // Handle error or no org
      if (error || !orgId) {
        router.push(config.redirectTo || "/dashboard");
        return;
      }

      // Check permissions
      let hasAccess = true;

      if (config.permission && !can(config.permission)) {
        hasAccess = false;
      }

      if (config.role && !hasPermission(config.role)) {
        hasAccess = false;
      }

      if (config.roles && !hasAnyRole(config.roles)) {
        hasAccess = false;
      }

      if (!hasAccess) {
        router.push(config.redirectTo || "/dashboard");
      }
    }, [loading, error, orgId, can, hasPermission, hasAnyRole, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error || !orgId) {
      return null;
    }

    // Check permissions
    let hasAccess = true;

    if (config.permission && !can(config.permission)) {
      hasAccess = false;
    }

    if (config.role && !hasPermission(config.role)) {
      hasAccess = false;
    }

    if (config.roles && !hasAnyRole(config.roles)) {
      hasAccess = false;
    }

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Higher-order component for role-based component protection
 * Simplified version focused only on roles
 * 
 * @example
 * const OwnerOnlySettings = withRoleGuard(Settings, 'owner');
 * const AdminSettings = withRoleGuard(Settings, ['owner', 'admin']);
 */
export function withRoleGuard<P extends object>(
  Component: ComponentType<P>,
  requiredRole: Role | Role[],
  redirectTo = "/dashboard"
) {
  return withPermissionGuard(Component, {
    ...(Array.isArray(requiredRole) 
      ? { roles: requiredRole } 
      : { role: requiredRole }
    ),
    redirectTo,
  });
}

/**
 * Check if user can perform action based on permission preset
 * Client-side only utility
 * 
 * @example
 * if (canPerformAction('MANAGE_THEME')) {
 *   // Show theme settings
 * }
 */
export function useCanPerformAction(permission: keyof typeof PERMISSIONS): boolean {
  const { can, loading } = usePermissions();
  
  if (loading) return false;
  
  return can(permission);
}

/**
 * Check if user has required role
 * Client-side only utility
 * 
 * @example
 * if (useHasRole('admin')) {
 *   // Show admin features
 * }
 */
export function useHasRole(requiredRole: Role): boolean {
  const { hasPermission, loading } = usePermissions();
  
  if (loading) return false;
  
  return hasPermission(requiredRole);
}

/**
 * Check if user has any of the specified roles
 * Client-side only utility
 * 
 * @example
 * if (useHasAnyRole(['owner', 'admin'])) {
 *   // Show management features
 * }
 */
export function useHasAnyRole(roles: Role[]): boolean {
  const { hasAnyRole, loading } = usePermissions();
  
  if (loading) return false;
  
  return hasAnyRole(roles);
}

/**
 * Get user's current role
 * 
 * @example
 * const role = useUserRole();
 * if (role === 'owner') {
 *   // Owner-specific logic
 * }
 */
export function useUserRole(): Role | null {
  const { role, loading } = usePermissions();
  
  if (loading) return null;
  
  return role;
}

/**
 * Check if user is owner
 * 
 * @example
 * const isOwner = useIsOwner();
 */
export function useIsOwner(): boolean {
  const { isOwner, loading } = usePermissions();
  
  if (loading) return false;
  
  return isOwner;
}

/**
 * Check if user is admin or owner
 * 
 * @example
 * const isAdminOrOwner = useIsAdminOrOwner();
 */
export function useIsAdminOrOwner(): boolean {
  const { isAdminOrOwner, loading } = usePermissions();
  
  if (loading) return false;
  
  return isAdminOrOwner;
}

/**
 * Check if user can manage content (coach+)
 * 
 * @example
 * const canManage = useCanManageContent();
 */
export function useCanManageContent(): boolean {
  const { canManageContent, loading } = usePermissions();
  
  if (loading) return false;
  
  return canManageContent;
}
