import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getAIHint } from "@/lib/services/ai";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const { moduleTitle, stepContent, question } = await req.json();

    if (!moduleTitle || !stepContent) {
      return NextResponse.json(
        { error: "Module title and step content are required" },
        { status: 400 }
      );
    }

    const hint = await getAIHint(s, moduleTitle, stepContent, question);

    return NextResponse.json({ hint });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get AI hint" },
      { status: 400 }
    );
  }
}

