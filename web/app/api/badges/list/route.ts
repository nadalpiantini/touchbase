import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getBadges } from "@/lib/services/badges";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId") || undefined;

    const badges = await getBadges(s, orgId);

    return NextResponse.json({ badges });
  } catch (error: unknown) {
    console.error("Get badges error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get badges" },
      { status: 400 }
    );
  }
}

