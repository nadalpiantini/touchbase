import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { joinChallenge } from "@/lib/services/challenges";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireStudent(s);

    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID is required" }, { status: 400 });
    }

    const participant = await joinChallenge(s, challengeId);

    return NextResponse.json({ success: true, participant });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join challenge" },
      { status: 400 }
    );
  }
}

