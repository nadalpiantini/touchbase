import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassAttendance, markAttendanceBulk } from "@/lib/services/attendance";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const { classId } = await params;
    const url = new URL(req.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    const attendance = await getClassAttendance(s, classId, date);

    return NextResponse.json({ attendance });
  } catch (error: unknown) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get attendance" },
      { status: 400 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { classId } = await params;
    const { date, records } = await req.json();

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Date and records array are required" },
        { status: 400 }
      );
    }

    // Verify teacher owns class
    const { data: classData } = await s
      .from("touchbase_classes")
      .select("teacher_id")
      .eq("id", classId)
      .single();

    if (!classData || classData.teacher_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attendance = await markAttendanceBulk(s, classId, date, records);

    return NextResponse.json({ success: true, attendance });
  } catch (error: unknown) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark attendance" },
      { status: 400 }
    );
  }
}

