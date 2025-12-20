import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Create a new player (coach-level endpoint)
 * RBAC: Owners, admins, and coaches can create players
 */
export const POST = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const requestData = await request.json().catch(() => ({}));
    const {
      full_name,
      team_id,
      photo_url,
      phone,
      email,
      country,
      birthdate,
      jersey_number,
      position,
      affiliate,
      signing_year,
      family_info,
      academic_level,
      english_level,
      spanish_level,
      math_level,
      science_level,
      notes,
    } = requestData;
    
    // Validate required fields
    if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
      return NextResponse.json({ error: "Nombre de jugador inválido" }, { status: 400 });
    }

    // Prepare payload (orgId comes from RBAC middleware)
    const payload: any = { 
      org_id: orgId,  // From RBAC middleware, guaranteed to be valid
      full_name: full_name.trim(),
    };
    
    if (team_id) payload.team_id = team_id;
    if (photo_url) payload.photo_url = photo_url;
    if (phone) payload.phone = phone;
    if (email) payload.email = email;
    if (country) payload.country = country;
    if (birthdate) payload.birthdate = birthdate;
    if (jersey_number) payload.jersey_number = jersey_number;
    if (position) payload.position = position;
    if (affiliate) payload.affiliate = affiliate;
    if (signing_year) payload.signing_year = signing_year;
    if (family_info) payload.family_info = family_info;
    if (academic_level) payload.academic_level = academic_level;
    if (english_level) payload.english_level = english_level;
    if (spanish_level) payload.spanish_level = spanish_level;
    if (math_level) payload.math_level = math_level;
    if (science_level) payload.science_level = science_level;
    if (notes) payload.notes = notes;

    const { data, error } = await s
      .from("touchbase_players")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  },
  { allowedRoles: ['owner', 'admin', 'coach'] }  // RBAC: Coach-level access
);
