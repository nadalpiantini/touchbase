import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Implement module listing
  // - List active modules
  // - Filter by difficulty, skills, etc.
  
  return NextResponse.json({ modules: [] });
}

