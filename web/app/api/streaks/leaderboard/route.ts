import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getStreakLeaderboard } from "@/lib/services/streaks";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const leaderboard = await getStreakLeaderboard(s, orgId, limit);

    return NextResponse.json({ leaderboard });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get leaderboard" },
      { status: 400 }
    );
  }
}

