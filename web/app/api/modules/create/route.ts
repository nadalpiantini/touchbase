import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createModule } from "@/lib/services/modules";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireAuth(s);

    const { title, description, skills, difficulty, duration_minutes } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Module title is required" }, { status: 400 });
    }

    const newModule = await createModule(s, user.id, {
      title,
      description,
      skills: skills || [],
      difficulty: difficulty || "beginner",
      duration_minutes: duration_minutes || 0,
    });

    return NextResponse.json({ module: newModule });
  } catch (error: unknown) {
    console.error("Create module error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create module" },
      { status: 400 }
    );
  }
}

