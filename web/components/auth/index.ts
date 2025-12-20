/**
 * Auth Components
 * Permission-based conditional rendering and route protection
 * @module components/auth
 */

export { RequirePermission } from "./RequirePermission";
export type { RequirePermissionProps } from "./RequirePermission";

export { RequireRole } from "./RequireRole";
export type { RequireRoleProps } from "./RequireRole";

export { ProtectedRoute } from "./ProtectedRoute";
export type { ProtectedRouteProps } from "./ProtectedRoute";
