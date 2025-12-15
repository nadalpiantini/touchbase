import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { requireAuth, getCurrentOrgId } from "@/lib/auth/middleware-helpers";
import { isDevMode, DEV_ORG_ID } from "@/lib/dev-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    // DEV MODE: Allow access without auth
    if (!user && !isDevMode()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orgId: string | null = null;

    if (user) {
      const { data: cur } = await s.rpc("touchbase_current_org");
      orgId = cur?.[0]?.org_id;
    } else if (isDevMode()) {
      orgId = DEV_ORG_ID;
    }

    if (!orgId) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const url = new URL(req.url);
    const includeResults = url.searchParams.get("includeResults") === "true";

    // Use admin client in dev mode to bypass RLS
    const client = isDevMode() && !user ? supabaseAdmin() : s;

    const testsRes = await client
      .from("touchbase_placement_tests")
      .select("*")
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    let results = null;
    if (includeResults) {
      const resultsRes = await client
        .from("touchbase_placement_test_results")
        .select("*")
        .eq("org_id", orgId)
        .order("taken_at", { ascending: false })
        .limit(50);
      results = resultsRes.data;
    }

    return NextResponse.json({
      tests: testsRes.data || [],
      results: results || []
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get placement tests" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];
    
    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, subject, questions, passing_score } = body;

    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
    }

    const { data: test, error } = await s
      .from("touchbase_placement_tests")
      .insert({
        org_id: current.org_id,
        name,
        description,
        subject,
        questions: questions || [],
        passing_score: passing_score || 70,
        created_by: user.id
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: test.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create placement test" },
      { status: 400 }
    );
  }
}

