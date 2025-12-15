import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isDevMode, DEV_ORG_ID, DEV_ORG } from "@/lib/dev-helpers";

export async function GET() {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  // DEV MODE: Return mock org
  if (!user && isDevMode()) {
    return NextResponse.json({
      org: [{
        org_id: DEV_ORG_ID,
        org_name: DEV_ORG.name,
        role: "owner"
      }]
    });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Production: use RPC
  const { data, error } = await s.rpc("touchbase_current_org");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ org: data || [] });
}
