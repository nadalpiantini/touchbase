import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, home_score, away_score } = await req.json().catch(()=>({}));
  if (!id || home_score == null || away_score == null)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { error } = await s.rpc("touchbase_update_score", {
    p_game: id, 
    p_home: Number(home_score), 
    p_away: Number(away_score)
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
