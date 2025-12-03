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
  } catch (error: any) {
    console.error("Get module error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get module" },
      { status: 400 }
    );
  }
}

