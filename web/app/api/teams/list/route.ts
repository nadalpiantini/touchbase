import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { isDevMode } from "@/lib/dev-helpers";

export async function GET() {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  // DEV MODE: Allow access without auth
  if (!user && !isDevMode()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client in dev mode to bypass RLS
  const client = isDevMode() && !user ? supabaseAdmin() : s;

  // First try with deleted_at filter
  let { data, error } = await client
    .from("touchbase_teams")
    .select("id, name, category, created_at, updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // If column doesn't exist, retry without the filter
  if (error?.message?.includes("deleted_at")) {
    const retry = await client
      .from("touchbase_teams")
      .select("id, name, category, created_at, updated_at")
      .order("created_at", { ascending: false });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ teams: data ?? [] });
}
