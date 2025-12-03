import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { updateStreak } from "@/lib/services/streaks";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const result = await updateStreak(s, user.id, orgId);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update streak" },
      { status: 400 }
    );
  }
}

