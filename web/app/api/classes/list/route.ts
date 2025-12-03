import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Implement class listing
  // - For teachers: list their classes
  // - For students: list enrolled classes
  
  return NextResponse.json({ classes: [] });
}

