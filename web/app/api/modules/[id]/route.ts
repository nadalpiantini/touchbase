import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getModuleWithSteps } from "@/lib/services/modules";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const { id } = await params;
    const moduleData = await getModuleWithSteps(s, id);

    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(moduleData);
  } catch (error: unknown) {
    console.error("Get module error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get module";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}


