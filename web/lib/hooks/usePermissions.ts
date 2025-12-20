/**
 * usePermissions Hook
 * React hook for RBAC permission checks
 * @module lib/hooks/usePermissions
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Role, PERMISSIONS } from "@/lib/rbac/types";
import {
  getCurrentOrg,
  getUserRole,
  hasPermission as checkHasPermission,
  hasAnyRole,
} from "@/lib/rbac/permissions";

export interface PermissionsState {
  orgId: string | null;
  role: Role | null;
  loading: boolean;
  error: Error | null;
}

export interface PermissionsAPI {
  /** Current user's organization ID */
  orgId: string | null;
  /** Current user's role in organization */
  role: Role | null;
  /** Whether permissions are loading */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Check if user has specific role or higher */
  hasPermission: (requiredRole: Role) => boolean;
  /** Check if user has any of the allowed roles */
  hasAnyRole: (allowedRoles: Role[]) => boolean;
  /** Check if user is owner */
  isOwner: boolean;
  /** Check if user is admin or owner */
  isAdminOrOwner: boolean;
  /** Check if user can manage content (coach+) */
  canManageContent: boolean;
  /** Refresh permissions from server */
  refresh: () => Promise<void>;
  /** Check specific permission preset */
  can: (permission: keyof typeof PERMISSIONS) => boolean;
}

/**
 * Hook to manage user permissions in current organization
 */
export function usePermissions(): PermissionsAPI {
  const [state, setState] = useState<PermissionsState>({
    orgId: null,
    role: null,
    loading: true,
    error: null,
  });

  const loadPermissions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const supabase = supabaseBrowser();
      const currentOrg = await getCurrentOrg(supabase);

      if (!currentOrg) {
        setState({
          orgId: null,
          role: null,
          loading: false,
          error: new Error("No organization found"),
        });
        return;
      }

      setState({
        orgId: currentOrg.org_id,
        role: currentOrg.role,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        orgId: null,
        role: null,
        loading: false,
        error: error as Error,
      });
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermissionCheck = useCallback(
    (requiredRole: Role): boolean => {
      if (!state.role) return false;
      return checkHasPermission(state.role, requiredRole);
    },
    [state.role]
  );

  const hasAnyRoleCheck = useCallback(
    (allowedRoles: Role[]): boolean => {
      if (!state.role) return false;
      return hasAnyRole(state.role, allowedRoles);
    },
    [state.role]
  );

  const can = useCallback(
    (permission: keyof typeof PERMISSIONS): boolean => {
      if (!state.role) return false;
      const allowedRoles = PERMISSIONS[permission];
      return hasAnyRole(state.role, allowedRoles);
    },
    [state.role]
  );

  return {
    orgId: state.orgId,
    role: state.role,
    loading: state.loading,
    error: state.error,
    hasPermission: hasPermissionCheck,
    hasAnyRole: hasAnyRoleCheck,
    isOwner: state.role === 'owner',
    isAdminOrOwner: state.role === 'owner' || state.role === 'admin',
    canManageContent: state.role === 'owner' || state.role === 'admin' || state.role === 'coach',
    refresh: loadPermissions,
    can,
  };
}

/**
 * Hook to check permissions in specific organization
 */
export function useOrgPermissions(orgId: string | null): PermissionsAPI {
  const [state, setState] = useState<PermissionsState>({
    orgId: null,
    role: null,
    loading: true,
    error: null,
  });

  const loadPermissions = useCallback(async () => {
    if (!orgId) {
      setState({
        orgId: null,
        role: null,
        loading: false,
        error: new Error("No organization ID provided"),
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const supabase = supabaseBrowser();
      const role = await getUserRole(supabase, orgId);

      if (!role) {
        setState({
          orgId,
          role: null,
          loading: false,
          error: new Error("User is not a member of this organization"),
        });
        return;
      }

      setState({
        orgId,
        role,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        orgId,
        role: null,
        loading: false,
        error: error as Error,
      });
    }
  }, [orgId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermissionCheck = useCallback(
    (requiredRole: Role): boolean => {
      if (!state.role) return false;
      return checkHasPermission(state.role, requiredRole);
    },
    [state.role]
  );

  const hasAnyRoleCheck = useCallback(
    (allowedRoles: Role[]): boolean => {
      if (!state.role) return false;
      return hasAnyRole(state.role, allowedRoles);
    },
    [state.role]
  );

  const can = useCallback(
    (permission: keyof typeof PERMISSIONS): boolean => {
      if (!state.role) return false;
      const allowedRoles = PERMISSIONS[permission];
      return hasAnyRole(state.role, allowedRoles);
    },
    [state.role]
  );

  return {
    orgId: state.orgId,
    role: state.role,
    loading: state.loading,
    error: state.error,
    hasPermission: hasPermissionCheck,
    hasAnyRole: hasAnyRoleCheck,
    isOwner: state.role === 'owner',
    isAdminOrOwner: state.role === 'owner' || state.role === 'admin',
    canManageContent: state.role === 'owner' || state.role === 'admin' || state.role === 'coach',
    refresh: loadPermissions,
    can,
  };
}
