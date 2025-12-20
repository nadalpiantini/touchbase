import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { orgName, role } = await req.json().catch(() => ({ orgName: null, role: null }));
    const s = await supabaseServer();

    // Confirma sesión
    const { data: { user }, error: uerr } = await s.auth.getUser();
    if (uerr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client for privileged onboarding operations (bypasses RLS)
    const admin = supabaseAdmin();

    // Map user-facing roles to database roles
    // DB allows: 'owner','admin','coach','player','parent','viewer'
    const roleMapping: Record<string, string> = {
      'teacher': 'admin',  // Teachers get admin role
      'student': 'player', // Students get player role
      'owner': 'owner',
      'admin': 'admin',
      'coach': 'coach',
      'player': 'player',
    };
    const dbRole = roleMapping[role] || 'owner';

    // Create organization (using admin to bypass RLS)
    const { data: org, error: orgError } = await admin
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

    // Create membership with mapped database role
    const { error: membershipError } = await admin
      .from("touchbase_memberships")
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: dbRole,
      });

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 });
    }

    // Set as default org - use upsert to handle case where profile doesn't exist
    const { error: profileError } = await admin
      .from("touchbase_profiles")
      .upsert({
        id: user.id,
        user_id: user.id,
        default_org_id: org.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Return the user-facing role for redirect purposes
    return NextResponse.json({ ok: true, org_id: org.id, role: role || 'owner' });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 });
  }
}