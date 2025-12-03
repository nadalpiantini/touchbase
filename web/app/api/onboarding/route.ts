import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { orgName, role } = await req.json().catch(() => ({ orgName: null, role: null }));
    const s = await supabaseServer();

    // Confirma sesión
    const { data: { user }, error: uerr } = await s.auth.getUser();
    if (uerr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate role if provided
    const validRoles = ['teacher', 'student', 'owner', 'admin', 'coach', 'player'];
    const selectedRole = role && validRoles.includes(role) ? role : 'owner';

    // Create organization
    const { data: org, error: orgError } = await s
      .from("touchbase_organizations")
      .insert({
        name: orgName || 'Mi Organización',
        slug: `${orgName?.toLowerCase().replace(/\s+/g, '-') || 'mi-organizacion'}-${Math.random().toString(36).substr(2, 8)}`,
      })
      .select()
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: orgError?.message || "Failed to create organization" }, { status: 400 });
    }

    // Create membership with selected role
    const { error: membershipError } = await s
      .from("touchbase_memberships")
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: selectedRole,
      });

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 });
    }

    // Set as default org
    const { error: profileError } = await s
      .from("touchbase_profiles")
      .update({ default_org_id: org.id })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, org_id: org.id, role: selectedRole });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 });
  }
}