import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener org actual
    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];
    
    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    // Query con filtro de deleted_at
    const { data, error } = await s
      .from("touchbase_teachers")
      .select("id, full_name, email, phone, department, employment_type, teaching_subjects, created_at, updated_at")
      .eq("org_id", current.org_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ teachers: data ?? [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to list teachers";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

