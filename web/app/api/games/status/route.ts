import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json().catch(()=>({}));
  if (!id || !status) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { error } = await s.rpc("touchbase_set_status", { 
    p_game: id, 
    p_status: status 
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
