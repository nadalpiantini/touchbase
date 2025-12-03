import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];
    
    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const url = new URL(req.url);
    const includeResults = url.searchParams.get("includeResults") === "true";

    const testsRes = await s
      .from("touchbase_placement_tests")
      .select("*")
      .eq("org_id", current.org_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    let results = null;
    if (includeResults) {
      const resultsRes = await s
        .from("touchbase_placement_test_results")
        .select("*")
        .eq("org_id", current.org_id)
        .order("taken_at", { ascending: false })
        .limit(50);
      results = resultsRes.data;
    }

    return NextResponse.json({
      tests: testsRes.data || [],
      results: results || []
    });
  } catch (error: unknown) {
    console.error("Get placement tests error:", error);
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
    console.error("Create placement test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create placement test" },
      { status: 400 }
    );
  }
}

