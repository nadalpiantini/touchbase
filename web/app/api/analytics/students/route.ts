import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassStudentProgress } from "@/lib/services/analytics";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = supabaseServer();
    await requireTeacher(s);

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const progress = await getClassStudentProgress(s, classId);

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("Get student progress error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get student progress" },
      { status: 400 }
    );
  }
}


