import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await supabaseServer();
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "es";

  const { error } = await supabase.auth.signOut();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=signout`, baseUrl));
  }

  return NextResponse.redirect(new URL(`/${locale}/login`, baseUrl));
}