import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassStudentProgress } from "@/lib/services/analytics";
import { requireTeacher } from "@/lib/auth/middleware-helpers";
import { getCacheHeaders, CACHE_CONFIG } from "@/lib/performance/cache";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireTeacher(s);

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const progress = await getClassStudentProgress(s, classId);

    const response = NextResponse.json({ progress });
    const cacheHeaders = getCacheHeaders(CACHE_CONFIG.api.medium, CACHE_CONFIG.api.short);
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, String(value));
    });
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get student progress" },
      { status: 400 }
    );
  }
}


