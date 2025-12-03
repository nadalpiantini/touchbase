import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { startModuleProgress } from "@/lib/services/progress";
import { getModuleWithSteps } from "@/lib/services/modules";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireStudent(s);

    const { moduleId } = await req.json();

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    // Get module to know total steps
    const moduleData = await getModuleWithSteps(s, moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Start progress
    const progress = await startModuleProgress(
      s,
      user.id,
      moduleId,
      moduleData.steps.length
    );

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("Start progress error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start module" },
      { status: 400 }
    );
  }
}

