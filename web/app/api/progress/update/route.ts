import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { updateStepProgress } from "@/lib/services/progress";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    const user = await requireStudent(s);

    const { moduleId, stepIndex, stepData } = await req.json();

    if (moduleId === undefined || stepIndex === undefined) {
      return NextResponse.json(
        { error: "Module ID and step index are required" },
        { status: 400 }
      );
    }

    await updateStepProgress(s, user.id, moduleId, stepIndex, stepData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update progress" },
      { status: 400 }
    );
  }
}


