import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClasses } from "@/lib/services/classes";
import { getUserWithRole } from "@/lib/auth/middleware-helpers";

export async function GET() {
  try {
    const s = await supabaseServer();
    const { user, role, orgId, isTeacher, isStudent } = await getUserWithRole(s);

    if (isTeacher && orgId) {
      // Get teacher's classes
      const classes = await getClasses(s, user.id, orgId);
      return NextResponse.json({ classes });
    }

    if (isStudent && orgId) {
      // Get student's enrolled classes
      const { data, error } = await s
        .from("touchbase_class_enrollments")
        .select(`
          *,
          touchbase_classes (*)
        `)
        .eq("student_id", user.id);

      if (error) throw error;

      const classes = (data || []).map((item: any) => item.touchbase_classes).filter(Boolean);
      return NextResponse.json({ classes });
    }

    return NextResponse.json({ classes: [] });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list classes" },
      { status: 400 }
    );
  }
}

