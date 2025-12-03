import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserBadges } from "@/lib/services/badges";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireAuth(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const badges = await getUserBadges(s, user.id, orgId);

    return NextResponse.json({ badges });
  } catch (error: unknown) {
    console.error("Get user badges error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get user badges" },
      { status: 400 }
    );
  }
}

