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

    const modules = await getActiveModules(s, {
      difficulty: difficulty as any || undefined,
    });

    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error("List modules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list modules" },
      { status: 400 }
    );
  }
}

