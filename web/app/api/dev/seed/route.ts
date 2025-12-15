import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Dev seed data with consistent UUIDs
const DEV_ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEV_USER_ID = "00000000-0000-0000-0000-000000000002";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed endpoint only available in development" },
      { status: 403 }
    );
  }

  try {
    const admin = supabaseAdmin();

    // 1. Create dev organization (upsert to avoid duplicates)
    const { data: org, error: orgError } = await admin
      .from("touchbase_organizations")
      .upsert(
        {
          id: DEV_ORG_ID,
          name: "Dev Organization",
          slug: "dev-org",
          logo_url: null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (orgError) {
      console.error("Error creating org:", orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // 2. Create dev profile (upsert)
    const { data: profile, error: profileError } = await admin
      .from("touchbase_profiles")
      .upsert(
        {
          id: DEV_USER_ID,
          email: "dev@touchbase.local",
          full_name: "Dev User (Owner)",
          default_org_id: DEV_ORG_ID,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 3. Create dev membership (upsert)
    const { data: membership, error: membershipError } = await admin
      .from("touchbase_memberships")
      .upsert(
        {
          org_id: DEV_ORG_ID,
          user_id: DEV_USER_ID,
          role: "owner",
        },
        { onConflict: "org_id,user_id" }
      )
      .select()
      .single();

    if (membershipError) {
      console.error("Error creating membership:", membershipError);
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Dev seed data created successfully",
      data: {
        org,
        profile,
        membership,
        ids: {
          DEV_ORG_ID,
          DEV_USER_ID,
        },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET: Check if seed data exists
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed endpoint only available in development" },
      { status: 403 }
    );
  }

  try {
    const admin = supabaseAdmin();

    const { data: org } = await admin
      .from("touchbase_organizations")
      .select("*")
      .eq("id", DEV_ORG_ID)
      .single();

    const { data: profile } = await admin
      .from("touchbase_profiles")
      .select("*")
      .eq("id", DEV_USER_ID)
      .single();

    const { data: membership } = await admin
      .from("touchbase_memberships")
      .select("*")
      .eq("org_id", DEV_ORG_ID)
      .eq("user_id", DEV_USER_ID)
      .single();

    return NextResponse.json({
      exists: !!(org && profile && membership),
      data: {
        org: org || null,
        profile: profile || null,
        membership: membership || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
