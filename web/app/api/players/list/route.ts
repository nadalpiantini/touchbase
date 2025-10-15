import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");

  // Obtener org actual
  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  
  if (!current?.org_id) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Query con filtro de deleted_at
  let query = s
    .from("touchbase_players")
    .select("id, full_name, team_id, jersey_number, position, created_at, updated_at")
    .eq("org_id", current.org_id)
    .is("deleted_at", null);
  
  if (team_id) {
    query = query.eq("team_id", team_id);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ players: data ?? [] });
}
