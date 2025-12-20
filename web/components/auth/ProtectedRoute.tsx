/**
 * ProtectedRoute Component
 * Route-level permission protection with automatic redirects
 * @module components/auth/ProtectedRoute
 */

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Role, PERMISSIONS } from "@/lib/rbac/types";

export interface ProtectedRouteProps {
  /** Permission preset required to access route */
  permission?: keyof typeof PERMISSIONS;
  /** Specific role required */
  role?: Role;
  /** Array of allowed roles */
  roles?: Role[];
  /** Content to render if authorized */
  children: ReactNode;
  /** Redirect path if unauthorized (default: /dashboard) */
  redirectTo?: string;
  /** Show loading spinner while checking */
  loadingComponent?: ReactNode;
  /** Show error message component */
  errorComponent?: ReactNode;
}

/**
 * Protect routes with RBAC permissions
 * Automatically redirects unauthorized users
 * 
 * @example
 * // Protect admin routes
 * <ProtectedRoute role="admin" redirectTo="/dashboard">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Protect with permission preset
 * <ProtectedRoute permission="MANAGE_THEME" redirectTo="/settings">
 *   <ThemeCustomizer />
 * </ProtectedRoute>
 * 
 * @example
 * // Allow multiple roles
 * <ProtectedRoute roles={['owner', 'admin']} redirectTo="/unauthorized">
 *   <SensitiveSettings />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  permission,
  role,
  roles,
  children,
  redirectTo = "/dashboard",
  loadingComponent,
  errorComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { loading, error, can, hasPermission, hasAnyRole, orgId } = usePermissions();

  useEffect(() => {
    // Wait for permissions to load
    if (loading) return;

    // Handle error state - redirect to dashboard
    if (error) {
      console.error("Permission error:", error);
      router.push(redirectTo);
      return;
    }

    // No organization - redirect
    if (!orgId) {
      console.warn("No organization found, redirecting...");
      router.push(redirectTo);
      return;
    }

    // Check permission preset
    if (permission && !can(permission)) {
      console.warn(`Missing permission: ${permission}, redirecting...`);
      router.push(redirectTo);
      return;
    }

    // Check specific role
    if (role && !hasPermission(role)) {
      console.warn(`Missing role: ${role}, redirecting...`);
      router.push(redirectTo);
      return;
    }

    // Check multiple roles
    if (roles && roles.length > 0 && !hasAnyRole(roles)) {
      console.warn(`Missing required roles: ${roles.join(", ")}, redirecting...`);
      router.push(redirectTo);
      return;
    }
  }, [loading, error, orgId, permission, role, roles, can, hasPermission, hasAnyRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading permissions. Redirecting...
        </div>
      </div>
    );
  }

  // No organization
  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">
          No organization found. Redirecting...
        </div>
      </div>
    );
  }

  // Check permissions
  let hasAccess = true;

  if (permission && !can(permission)) {
    hasAccess = false;
  }

  if (role && !hasPermission(role)) {
    hasAccess = false;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    hasAccess = false;
  }

  // Unauthorized - show message while redirecting
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">
          Unauthorized. Redirecting...
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
