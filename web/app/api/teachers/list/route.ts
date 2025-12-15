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

  const { data, error } = await client
    .from("touchbase_teachers")
    .select("*")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ teachers: data || [] });
}
