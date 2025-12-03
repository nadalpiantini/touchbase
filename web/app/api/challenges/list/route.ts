import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getChallenges } from "@/lib/services/challenges";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");
    const classId = url.searchParams.get("classId");
    const activeOnly = url.searchParams.get("activeOnly") === "true";

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const challenges = await getChallenges(s, orgId, {
      classId: classId || undefined,
      activeOnly,
    });

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error("Get challenges error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get challenges" },
      { status: 400 }
    );
  }
}

