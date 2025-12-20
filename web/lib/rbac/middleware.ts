/**
 * RBAC Middleware for API Route Protection
 * @module lib/rbac/middleware
 */

import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Role } from "./types";
import { getCurrentOrg, hasAnyRole, getUserRole } from "./permissions";

export interface RBACConfig {
  /** Required roles (user must have one of these) */
  allowedRoles: Role[];
  /** Custom error message */
  errorMessage?: string;
  /** Organization ID (if not provided, uses current org) */
  orgId?: string;
}

/**
 * Middleware result
 */
export interface RBACResult {
  authorized: boolean;
  orgId?: string;
  role?: Role;
  error?: string;
}

/**
 * Check RBAC permissions for API route
 * Returns authorization result with org and role info
 */
export async function checkRBAC(
  supabase: SupabaseClient,
  config: RBACConfig
): Promise<RBACResult> {
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        authorized: false,
        error: "Unauthorized: No authenticated user"
      };
    }

    // Get organization ID
    let orgId = config.orgId;
    let userRole: Role | null = null;

    if (!orgId) {
      // Use current org if not specified
      const currentOrg = await getCurrentOrg(supabase);

      if (!currentOrg) {
        return {
          authorized: false,
          error: "No organization found for user"
        };
      }

      orgId = currentOrg.org_id;
      userRole = currentOrg.role;
    } else {
      // Get user's role in specified org
      userRole = await getUserRole(supabase, orgId);
    }

    if (!userRole) {
      return {
        authorized: false,
        error: "User is not a member of this organization"
      };
    }

    // Check if user has one of the allowed roles
    const hasAccess = hasAnyRole(userRole, config.allowedRoles);

    if (!hasAccess) {
      return {
        authorized: false,
        error: config.errorMessage || `Insufficient permissions. Required: ${config.allowedRoles.join(', ')}`
      };
    }

    return {
      authorized: true,
      orgId,
      role: userRole
    };
  } catch (error) {
    console.error("RBAC check error:", error);
    return {
      authorized: false,
      error: "Internal server error during permission check"
    };
  }
}

/**
 * Require RBAC permissions or return error response
 * Use this in API route handlers
 */
export async function requireRBAC(
  supabase: SupabaseClient,
  config: RBACConfig
): Promise<{ authorized: true; orgId: string; role: Role } | NextResponse> {
  const result = await checkRBAC(supabase, config);

  if (!result.authorized) {
    const statusCode = result.error?.includes("Unauthorized") ? 401 : 403;
    return NextResponse.json(
      { error: result.error || "Access denied" },
      { status: statusCode }
    );
  }

  return {
    authorized: true as const,
    orgId: result.orgId!,
    role: result.role!
  };
}

/**
 * Create RBAC middleware wrapper for API routes
 * Example usage:
 *
 * export const POST = withRBAC(
 *   async (request, { orgId, role }) => {
 *     // Handler code with guaranteed auth + permissions
 *   },
 *   { allowedRoles: ['owner', 'admin'] }
 * );
 */
export function withRBAC<T = unknown>(
  handler: (
    request: NextRequest,
    context: { orgId: string; role: Role; params?: T }
  ) => Promise<NextResponse>,
  config: RBACConfig
) {
  return async (request: NextRequest, context?: { params?: Promise<T> | T }): Promise<NextResponse> => {
    // Import supabaseServer dynamically to avoid circular dependencies
    const { supabaseServer } = await import("@/lib/supabase/server");
    const supabase = await supabaseServer();

    const authResult = await requireRBAC(supabase, config);

    if (authResult instanceof NextResponse) {
      // Authorization failed, return error response
      return authResult;
    }

    // Resolve params if it's a Promise (Next.js 15+ async params)
    const resolvedParams = context?.params instanceof Promise 
      ? await context.params 
      : context?.params;

    // Authorization succeeded, call handler with org and role info
    return handler(request, {
      orgId: authResult.orgId,
      role: authResult.role,
      params: resolvedParams
    });
  };
}

/**
 * Helper to extract org ID from request query or body
 */
export async function getOrgIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try URL params first
  const url = new URL(request.url);
  const orgIdParam = url.searchParams.get("orgId") || url.searchParams.get("org_id");

  if (orgIdParam) {
    return orgIdParam;
  }

  // Try request body
  try {
    const body = await request.json();
    return body.orgId || body.org_id || null;
  } catch {
    return null;
  }
}
