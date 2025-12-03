import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  getPlatformMetrics,
  getEngagementMetrics,
  getAdoptionMetrics,
} from "@/lib/services/admin-analytics";
import { requireAdmin } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAdmin(s);

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all";

    let metrics;

  if (type === "platform") {
      metrics = await getPlatformMetrics(s);
    } else if (type === "engagement") {
      metrics = await getEngagementMetrics(s);
    } else if (type === "adoption") {
      metrics = await getAdoptionMetrics(s);
    } else {
      // Return all metrics
      const [platform, engagement, adoption] = await Promise.all([
        getPlatformMetrics(s),
        getEngagementMetrics(s),
        getAdoptionMetrics(s),
      ]);
      metrics = { platform, engagement, adoption };
    }

    return NextResponse.json({ metrics });
  } catch (error: unknown) {
    console.error("Get admin analytics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get analytics" },
      { status: 400 }
    );
  }
}

