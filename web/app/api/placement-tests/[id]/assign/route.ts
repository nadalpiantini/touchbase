import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

/**
 * Assign placement test to students
 * POST /api/placement-tests/[id]/assign
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { id: testId } = await params;
    const { student_ids } = await req.json();

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json(
        { error: "student_ids array is required" },
        { status: 400 }
      );
    }

    // Verify test exists and user has permission
    const { data: test } = await s
      .from("touchbase_placement_tests")
      .select("org_id")
      .eq("id", testId)
      .is("deleted_at", null)
      .single();

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Verify user is admin/teacher in org
    const { data: membership } = await s
      .from("touchbase_memberships")
      .select("role")
      .eq("org_id", test.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin", "teacher", "coach"].includes(membership.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // For now, we just return success
    // In future, we could create assignment records or send notifications
    return NextResponse.json({
      ok: true,
      message: `Test assigned to ${student_ids.length} student(s)`,
      assigned_count: student_ids.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign test" },
      { status: 400 }
    );
  }
}

