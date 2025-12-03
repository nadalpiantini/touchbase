import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    // Get user's default org
    const { data: profile } = await s
      .from("touchbase_profiles")
      .select("default_org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.default_org_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // Get all classes in org (for teachers, get their classes; for others, get all)
    const { data: { user: authUser } } = await s.auth.getUser();
    const { data: membership } = await s
      .from("touchbase_memberships")
      .select("role")
      .eq("org_id", profile.default_org_id)
      .eq("user_id", authUser.id)
      .single();

    let classesQuery = s
      .from("touchbase_classes")
      .select("id, name, teacher_id");

    if (membership?.role === "teacher") {
      classesQuery = classesQuery.eq("teacher_id", authUser.id);
    } else {
      classesQuery = classesQuery.eq("org_id", profile.default_org_id);
    }

    const { data: classes } = await classesQuery;

    if (!classes || classes.length === 0) {
      return NextResponse.json({ schedules: [] });
    }

    const classIds = classes.map(c => c.id);

    // Get all schedules for these classes
    const { data: schedules, error } = await s
      .from("touchbase_class_schedules")
      .select(`
        *,
        touchbase_classes (
          id,
          name
        )
      `)
      .in("class_id", classIds)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ schedules: schedules || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get schedules";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

