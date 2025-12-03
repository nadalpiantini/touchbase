import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createClass, generateClassCode } from "@/lib/services/classes";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireTeacher(s);

    const { name, gradeLevel, description, schedule } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    // Get user's default org
    const { data: profile } = await s
      .from("touchbase_profiles")
      .select("default_org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.default_org_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // Generate unique code
    let code = generateClassCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await s
        .from("touchbase_classes")
        .select("id")
        .eq("code", code)
        .single();

      if (!existing.data) break; // Code is unique
      code = generateClassCode();
      attempts++;
    }

    const newClass = await createClass(s, profile.default_org_id, user.id, {
      name,
      code,
      gradeLevel,
      description,
      schedule,
    });

    return NextResponse.json({ class: newClass });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create class";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

