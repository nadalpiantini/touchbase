import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getActiveModules } from "@/lib/services/modules";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const difficulty = url.searchParams.get("difficulty");
    const classId = url.searchParams.get("classId");

    let modules;

    if (classId) {
      // Get modules assigned to this class via assignments
      const { data: assignments } = await s
        .from("touchbase_assignments")
        .select("module_id")
        .eq("class_id", classId);

      if (assignments && assignments.length > 0) {
        const moduleIds = assignments.map((a: any) => a.module_id);
        const { data: modulesData } = await s
          .from("touchbase_modules")
          .select("*")
          .in("id", moduleIds)
          .eq("is_active", true);
        modules = modulesData || [];
      } else {
        modules = [];
      }
    } else {
      modules = await getActiveModules(s, {
        difficulty: difficulty as any || undefined,
      });
    }

    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error("List modules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list modules" },
      { status: 400 }
    );
  }
}

