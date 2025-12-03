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
    const type = url.searchParams.get("type") || "all"; // all, wellness, activities, logs

    const results: any = {};

    if (type === "all" || type === "wellness") {
      const wellnessRes = await s
        .from("touchbase_wellness_programs")
        .select("*")
        .eq("org_id", current.org_id)
        .is("deleted_at", null)
        .order("start_date", { ascending: false });
      results.wellnessPrograms = wellnessRes.data || [];
    }

    if (type === "all" || type === "activities") {
      const activitiesRes = await s
        .from("touchbase_extracurricular_activities")
        .select(`
          *,
          touchbase_activity_participants (student_id)
        `)
        .eq("org_id", current.org_id)
        .is("deleted_at", null)
        .order("activity_date", { ascending: false });
      
      const activities = (activitiesRes.data || []).map((activity: any) => ({
        ...activity,
        participant_count: activity.touchbase_activity_participants?.length || 0
      }));
      results.activities = activities;
    }

    if (type === "all" || type === "logs") {
      const logsRes = await s
        .from("touchbase_personal_development_logs")
        .select("*")
        .eq("org_id", current.org_id)
        .order("logged_at", { ascending: false })
        .limit(50);
      results.logs = logsRes.data || [];
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get student life data" },
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
    const { type, ...data } = body;

    if (type === "wellness") {
      const { data: program, error } = await s
        .from("touchbase_wellness_programs")
        .insert({
          org_id: current.org_id,
          name: data.name,
          description: data.description,
          program_type: data.program_type,
          start_date: data.start_date,
          end_date: data.end_date,
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, id: program.id });
    } else if (type === "activity") {
      const { data: activity, error } = await s
        .from("touchbase_extracurricular_activities")
        .insert({
          org_id: current.org_id,
          name: data.name,
          description: data.description,
          activity_date: data.activity_date,
          location: data.location,
          max_participants: data.max_participants,
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, id: activity.id });
    } else if (type === "log") {
      const { data: log, error } = await s
        .from("touchbase_personal_development_logs")
        .insert({
          org_id: current.org_id,
          student_id: user.id,
          log_type: data.log_type,
          title: data.title,
          content: data.content,
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, id: log.id });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create" },
      { status: 400 }
    );
  }
}

