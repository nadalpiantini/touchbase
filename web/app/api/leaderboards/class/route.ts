import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassLeaderboard, LeaderboardType } from "@/lib/services/leaderboards";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const type = (url.searchParams.get("type") || "xp") as LeaderboardType;
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const leaderboard = await getClassLeaderboard(s, classId, type, limit);

    return NextResponse.json({ leaderboard });
  } catch (error: unknown) {
    console.error("Get class leaderboard error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get leaderboard" },
      { status: 400 }
    );
  }
}

