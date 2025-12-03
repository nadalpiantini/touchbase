import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassAssignments, createAssignment } from "@/lib/services/assignments";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const s = supabaseServer();
    const user = await requireTeacher(s);

    const assignments = await getClassAssignments(s, classId, user.id);

    return NextResponse.json({ assignments });
  } catch (error: unknown) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get assignments" },
      { status: 400 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const s = supabaseServer();
    const user = await requireTeacher(s);

    const body = await req.json();
    const { module_id, title, description, due_date } = body;

    if (!module_id || !title || !due_date) {
      return NextResponse.json(
        { error: "module_id, title, and due_date are required" },
        { status: 400 }
      );
    }

    const assignment = await createAssignment(s, {
      class_id: classId,
      module_id,
      teacher_id: user.id,
      title,
      description,
      due_date,
    });

    return NextResponse.json({ assignment });
  } catch (error: unknown) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create assignment" },
      { status: 400 }
    );
  }
}

