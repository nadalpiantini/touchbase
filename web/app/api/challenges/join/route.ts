import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { joinChallenge } from "@/lib/services/challenges";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireStudent(s);

    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID is required" }, { status: 400 });
    }

    const participant = await joinChallenge(s, challengeId);

    return NextResponse.json({ success: true, participant });
  } catch (error: any) {
    console.error("Join challenge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to join challenge" },
      { status: 400 }
    );
  }
}

