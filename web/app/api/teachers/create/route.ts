import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Create a new teacher (admin-only endpoint)
 * RBAC: Only owners and admins can create teachers
 */
export const POST = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const body = await request.json().catch(() => ({}));
    
    // Validate input with Zod schema
    const validation = createTeacherSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.issues 
      }, { status: 400 });
    }
    
    const data = validation.data;

    // Prepare payload (orgId comes from RBAC middleware, data validated by Zod)
    const payload = { 
      org_id: orgId,  // From RBAC middleware
      ...data  // Spread validated data (Zod ensures type safety)
    };

    const { data: result, error } = await s
      .from("touchbase_teachers")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: result?.id });
  },
  { allowedRoles: ['owner', 'admin'] }  // RBAC: Only admin roles
);

