import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestData = await req.json().catch(() => ({}));
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
  
  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre de jugador inválido" }, { status: 400 });
  }

  // Obtener org actual
  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];
  
  if (!current?.org_id) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Preparar payload completo
  const payload: any = { 
    org_id: current.org_id, 
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
}
