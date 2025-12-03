import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getModuleProgress } from "@/lib/services/progress";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireStudent(s);

    const url = new URL(req.url);
    const moduleId = url.searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    const progress = await getModuleProgress(s, user.id, moduleId);

    return NextResponse.json({ progress });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get progress" },
      { status: 400 }
    );
  }
}


