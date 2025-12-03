import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getTeacherClassAnalytics } from "@/lib/services/analytics";
import { requireTeacher } from "@/lib/auth/middleware-helpers";
import { getCacheHeaders, CACHE_CONFIG } from "@/lib/performance/cache";

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

    const response = NextResponse.json({ analytics });
    // Add cache headers for analytics data (medium cache)
    const cacheHeaders = getCacheHeaders(CACHE_CONFIG.api.medium, CACHE_CONFIG.api.short);
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, String(value));
    });
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get analytics" },
      { status: 400 }
    );
  }
}


