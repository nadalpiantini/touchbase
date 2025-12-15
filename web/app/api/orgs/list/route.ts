import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isDevMode, DEV_ORG_ID, DEV_ORG } from "@/lib/dev-helpers";

export async function GET() {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  // DEV MODE: Return mock org list
  if (!user && isDevMode()) {
    return NextResponse.json({
      orgs: [{
        org_id: DEV_ORG_ID,
        org_name: DEV_ORG.name,
        org_slug: DEV_ORG.slug,
        role: "owner"
      }]
    });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await s.rpc("touchbase_list_orgs");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ orgs: data ?? [] });
}
