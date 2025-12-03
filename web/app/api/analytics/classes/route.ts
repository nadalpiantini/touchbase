import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getTeacherClassAnalytics } from "@/lib/services/analytics";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireTeacher(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const analytics = await getTeacherClassAnalytics(s, user.id, orgId);

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    console.error("Get class analytics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get analytics" },
      { status: 400 }
    );
  }
}


