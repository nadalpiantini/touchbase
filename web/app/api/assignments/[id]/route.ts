import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteAssignment } from "@/lib/services/assignments";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const s = await supabaseServer();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await s
      .from("touchbase_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Fetch the assignment with related data
    const { data: assignment, error: assignmentError } = await s
      .from("touchbase_assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        max_points,
        module_id,
        class_id,
        teacher_id,
        touchbase_modules!inner(title),
        touchbase_classes!inner(name),
        touchbase_profiles!touchbase_assignments_teacher_id_fkey(full_name)
      `)
      .eq("id", id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Fetch submission if the user is a student
    let submission = null;
    if (profile) {
      const { data: submissionData } = await s
        .from("touchbase_assignment_submissions")
        .select("*")
        .eq("assignment_id", id)
        .eq("student_id", profile.id)
        .single();

      submission = submissionData;
    }

    // Format the response
    const modules = assignment.touchbase_modules as unknown as { title: string }[] | { title: string } | null;
    const classes = assignment.touchbase_classes as unknown as { name: string }[] | { name: string } | null;
    const profiles = assignment.touchbase_profiles as unknown as { full_name: string }[] | { full_name: string } | null;

    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      max_points: assignment.max_points,
      module_id: assignment.module_id,
      module_title: Array.isArray(modules) ? modules[0]?.title : modules?.title,
      class_id: assignment.class_id,
      class_name: Array.isArray(classes) ? classes[0]?.name : classes?.name,
      teacher_name: Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name,
    };

    return NextResponse.json({
      assignment: formattedAssignment,
      submission,
    });
  } catch (error: unknown) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch assignment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const s = await supabaseServer();
    await requireTeacher(s);

    await deleteAssignment(s, id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete assignment" },
      { status: 400 }
    );
  }
}

