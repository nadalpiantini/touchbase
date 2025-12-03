import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createChallenge } from "@/lib/services/challenges";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireTeacher(s);

    const {
      org_id,
      class_id,
      title,
      description,
      challenge_type,
      target_value,
      reward_xp,
      reward_badge_id,
      end_date,
    } = await req.json();

    if (!title || !org_id || !challenge_type || !target_value) {
      return NextResponse.json(
        { error: "Title, organization ID, challenge type, and target value are required" },
        { status: 400 }
      );
    }

    const challenge = await createChallenge(s, user.id, {
      org_id,
      class_id,
      title,
      description,
      challenge_type,
      target_value,
      reward_xp,
      reward_badge_id,
      end_date,
    });

    return NextResponse.json({ challenge });
  } catch (error: unknown) {
    console.error("Create challenge error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create challenge" },
      { status: 400 }
    );
  }
}

