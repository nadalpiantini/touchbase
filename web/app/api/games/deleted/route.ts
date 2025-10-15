import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  if (!current?.org_id) return NextResponse.json({ error: "No default org" }, { status: 400 });

  const { data, error } = await s
    .from("touchbase_games")
    .select("id, home_team_id, away_team_id, starts_at, venue, deleted_at")
    .eq("org_id", current.org_id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ games: data ?? [] });
}
