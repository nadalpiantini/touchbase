import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, full_name, team_id } = await req.json().catch(() => ({}));
  
  if (!id || !full_name || String(full_name).trim().length < 2) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const payload: any = { 
    full_name: String(full_name).trim(),
    updated_at: new Date().toISOString()
  };
  
  if (team_id !== undefined) {
    payload.team_id = team_id || null;
  }

  const { data, error } = await s
    .from("touchbase_players")
    .update(payload)
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
