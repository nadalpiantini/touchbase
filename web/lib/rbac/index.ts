/**
 * RBAC (Role-Based Access Control) System
 * Barrel export for all RBAC functionality
 * @module lib/rbac
 */

// Types
export type { Role, UserOrganization, Organization, CurrentOrg } from "./types";
export { ROLE_HIERARCHY, PERMISSIONS } from "./types";

// Permission utilities
export {
  hasPermission,
  hasAnyRole,
  getCurrentOrg,
  getUserRole,
  checkPermission,
  getUserOrganizations,
  isOwner,
  isAdminOrOwner,
  canManageContent,
  requirePermission,
  requireAnyRole,
  getHighestRole,
} from "./permissions";

// Middleware
export type { RBACConfig, RBACResult } from "./middleware";
export {
  checkRBAC,
  requireRBAC,
  withRBAC,
  getOrgIdFromRequest,
} from "./middleware";

// Guards (Client-side only)
export type { GuardConfig } from "./guards";
export {
  withPermissionGuard,
  withRoleGuard,
  useCanPerformAction,
  useHasRole,
  useHasAnyRole,
  useUserRole,
  useIsOwner,
  useIsAdminOrOwner,
  useCanManageContent,
} from "./guards";
