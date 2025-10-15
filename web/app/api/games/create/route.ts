import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { home_team_id, away_team_id, starts_at, venue } = await req.json().catch(()=>({}));
  if (!home_team_id || !away_team_id || !starts_at)
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  if (home_team_id === away_team_id)
    return NextResponse.json({ error: "Los equipos deben ser distintos" }, { status: 400 });

  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  if (!current?.org_id) return NextResponse.json({ error: "No default org" }, { status: 400 });

  const { data, error } = await s
    .from("touchbase_games")
    .insert({
      org_id: current.org_id,
      home_team_id, 
      away_team_id,
      starts_at, 
      venue: venue ?? null
    })
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data?.id });
}
