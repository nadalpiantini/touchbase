import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { full_name, team_id } = await req.json().catch(() => ({}));
  
  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre de jugador inválido" }, { status: 400 });
  }

  // Obtener org actual
  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  
  if (!current?.org_id) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Preparar payload (team_id es opcional)
  const payload: any = { 
    org_id: current.org_id, 
    full_name: full_name.trim() 
  };
  
  if (team_id) {
    payload.team_id = team_id;
  }

  const { data, error } = await s
    .from("touchbase_players")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
