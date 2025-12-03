import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassSchedules, createClassSchedule } from "@/lib/services/schedules";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const { classId } = await params;
    const schedules = await getClassSchedules(s, classId);

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error("Get schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get schedules" },
      { status: 400 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const s = supabaseServer();
    const user = await requireAuth(s);

    const { classId } = await params;
    const body = await req.json();

    // Get class to verify ownership and get org_id
    const { data: classData } = await s
      .from("touchbase_classes")
      .select("org_id, teacher_id")
      .eq("id", classId)
      .single();

    if (!classData || classData.teacher_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const schedule = await createClassSchedule(s, classId, classData.org_id, body);

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error("Create schedule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create schedule" },
      { status: 400 }
    );
  }
}

