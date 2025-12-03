import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getXPLeaderboard, getStreakLeaderboard, LeaderboardType } from "@/lib/services/leaderboards";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");
    const type = (url.searchParams.get("type") || "xp") as LeaderboardType;
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    let leaderboard;
    if (type === "streak") {
      leaderboard = await getStreakLeaderboard(s, orgId, limit);
    } else {
      leaderboard = await getXPLeaderboard(s, orgId, limit);
    }

    return NextResponse.json({ leaderboard });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get leaderboard" },
      { status: 400 }
    );
  }
}

