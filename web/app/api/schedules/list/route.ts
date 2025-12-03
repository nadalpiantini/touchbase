import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Obtener org actual
  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  
  if (!current?.org_id) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Load schedules with class information
  const { data, error } = await s
    .from("touchbase_class_schedules")
    .select(`
      *,
      touchbase_classes!inner (
        id,
        name,
        description
      )
    `)
    .eq("org_id", current.org_id)
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ schedules: data || [] });
}
