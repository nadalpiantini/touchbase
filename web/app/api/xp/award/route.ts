import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { awardXP } from "@/lib/services/xp";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { action, skillCategory, metadata } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const result = await awardXP(s, {
      userId: user.id,
      action,
      amount: 0, // Will use XP_VALUES
      skillCategory,
      metadata,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("Award XP error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to award XP" },
      { status: 400 }
    );
  }
}

