import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Get audit log entries (admin-only endpoint)
 * RBAC: Only owners and admins can view audit logs
 */
export const GET = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const url = new URL(request.url);
    
    // Query parameters
    const entity = url.searchParams.get("entity"); // 'team' | 'player' | null
    const action = url.searchParams.get("action"); // create|update|soft_delete|restore|purge | null
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);

    // Build query (orgId filtering handled by RLS + RBAC middleware)
    let query = s.from("touchbase_audit_log")
      .select("id, org_id, entity, entity_id, action, actor, meta, created_at")
      .eq("org_id", orgId)  // Explicit org filtering
      .order("created_at", { ascending: false })
      .limit(limit);

    // Optional filters
    if (entity) query = query.eq("entity", entity);
    if (action) query = query.eq("action", action);

    const { data, error } = await query;

    // If table doesn't exist, return empty array
    if (error?.message?.includes("does not exist")) {
      return NextResponse.json({ logs: [] });
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ logs: data ?? [] });
  },
  { allowedRoles: ['owner', 'admin'] }  // RBAC: Only admin roles can view audit logs
);
