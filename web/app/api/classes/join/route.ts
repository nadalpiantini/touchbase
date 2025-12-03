import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassByCode, enrollStudentInClass } from "@/lib/services/classes";
import { requireStudent } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireStudent(s);

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Class code is required" }, { status: 400 });
    }

    // Find class by code
    const classItem = await getClassByCode(s, code);

    if (!classItem) {
      return NextResponse.json({ error: "Invalid class code" }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existing } = await s
      .from("touchbase_class_enrollments")
      .select("id")
      .eq("class_id", classItem.id)
      .eq("student_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already enrolled in this class" }, { status: 400 });
    }

    // Enroll student
    const enrollment = await enrollStudentInClass(s, classItem.id, user.id);

    return NextResponse.json({ 
      success: true, 
      class: classItem,
      enrollment 
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join class" },
      { status: 400 }
    );
  }
}

