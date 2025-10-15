import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = supabaseServer();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.redirect(new URL("/login?error=signout", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}