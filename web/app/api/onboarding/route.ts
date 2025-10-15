import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { orgName } = await req.json().catch(() => ({ orgName: null }));
    const s = supabaseServer();

    // Confirma sesión
    const { data: { user }, error: uerr } = await s.auth.getUser();
    if (uerr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Llama RPC (usa auth.uid() dentro)
    const { data: org_id, error } = await s.rpc("touchbase_onboard_user", {
      p_org_name: orgName ?? null,
    });

    if (error) {
      console.error("Onboarding error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, org_id });
  } catch (e: unknown) {
    console.error("Unexpected onboarding error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 });
  }
}