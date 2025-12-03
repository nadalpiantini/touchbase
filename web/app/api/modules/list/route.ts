import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getActiveModules } from "@/lib/services/modules";
import { requireAuth } from "@/lib/auth/middleware-helpers";
import { getCacheHeaders, CACHE_CONFIG } from "@/lib/performance/cache";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
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

        const response = NextResponse.json({ modules });
        // Add cache headers for public module data
        const cacheHeaders = getCacheHeaders(CACHE_CONFIG.api.medium, CACHE_CONFIG.api.short);
        Object.entries(cacheHeaders).forEach(
          ([key, value]) => {
            response.headers.set(key, String(value));
          }
        );
        return response;
  } catch (error: unknown) {
    console.error("List modules error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to list modules";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

