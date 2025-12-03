import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json().catch(() => ({}));
  const {
    full_name,
    photo_url,
    phone,
    email,
    birthdate,
    nationality,
    address,
    employment_type,
    hire_date,
    salary,
    department,
    degree,
    field_of_study,
    institution,
    graduation_year,
    teaching_subjects,
    experience_years,
    certifications,
    licenses,
    notes,
  } = data;
  
  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre de profesor inválido" }, { status: 400 });
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
  
  if (photo_url) payload.photo_url = photo_url;
  if (phone) payload.phone = phone;
  if (email) payload.email = email;
  if (birthdate) payload.birthdate = birthdate;
  if (nationality) payload.nationality = nationality;
  if (address) payload.address = address;
  if (employment_type) payload.employment_type = employment_type;
  if (hire_date) payload.hire_date = hire_date;
  if (salary) payload.salary = salary;
  if (department) payload.department = department;
  if (degree) payload.degree = degree;
  if (field_of_study) payload.field_of_study = field_of_study;
  if (institution) payload.institution = institution;
  if (graduation_year) payload.graduation_year = graduation_year;
  if (teaching_subjects && Array.isArray(teaching_subjects)) payload.teaching_subjects = teaching_subjects;
  if (experience_years) payload.experience_years = experience_years;
  if (certifications && Array.isArray(certifications)) payload.certifications = certifications;
  if (licenses && Array.isArray(licenses)) payload.licenses = licenses;
  if (notes) payload.notes = notes;

  const { data: result, error } = await s
    .from("touchbase_teachers")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: result?.id });
}

