import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { isDevMode, DEV_ORG_ID } from "@/lib/dev-helpers";

export async function GET(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  // DEV MODE: Allow access without auth
  if (!user && !isDevMode()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");

  let orgId: string | null = null;

  if (user) {
    // Production: get org from RPC
    const { data: cur } = await s.rpc("touchbase_current_org");
    orgId = cur?.[0]?.org_id;
  } else if (isDevMode()) {
    // Dev mode: use mock org ID
    orgId = DEV_ORG_ID;
  }

  if (!orgId) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Use admin client in dev mode to bypass RLS
  const client = isDevMode() && !user ? supabaseAdmin() : s;

  // Try query with deleted_at filter, fallback to without if column doesn't exist
  let query = client
    .from("touchbase_players")
    .select("id, full_name, team_id, jersey_number, position, created_at, updated_at")
    .eq("org_id", orgId);

  if (team_id) {
    query = query.eq("team_id", team_id);
  }

  // First try with deleted_at filter
  let { data, error } = await query.is("deleted_at", null).order("created_at", { ascending: false });

  // If column doesn't exist, retry without the filter
  if (error?.message?.includes("deleted_at")) {
    const retryQuery = client
      .from("touchbase_players")
      .select("id, full_name, team_id, jersey_number, position, created_at, updated_at")
      .eq("org_id", orgId);

    if (team_id) {
      retryQuery.eq("team_id", team_id);
    }

    const retry = await retryQuery.order("created_at", { ascending: false });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ players: data ?? [] });
}
