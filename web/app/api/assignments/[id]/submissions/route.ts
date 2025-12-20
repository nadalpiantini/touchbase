import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const s = await supabaseServer();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the assignment with related data
    const { data: assignment, error: assignmentError } = await s
      .from("touchbase_assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        max_points,
        class_id,
        touchbase_modules!inner(title),
        touchbase_classes!inner(name)
      `)
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Fetch all submissions for this assignment with student info
    const { data: submissions, error: submissionsError } = await s
      .from("touchbase_assignment_submissions")
      .select(`
        id,
        student_id,
        content,
        file_url,
        submitted_at,
        status,
        grade,
        feedback,
        graded_at,
        touchbase_profiles!touchbase_assignment_submissions_student_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
    }

    // Format the response
    const modules = assignment.touchbase_modules as unknown as { title: string }[] | { title: string } | null;
    const classes = assignment.touchbase_classes as unknown as { name: string }[] | { name: string } | null;

    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      max_points: assignment.max_points,
      class_id: assignment.class_id,
      module_title: Array.isArray(modules) ? modules[0]?.title : modules?.title,
      class_name: Array.isArray(classes) ? classes[0]?.name : classes?.name,
    };

    const formattedSubmissions = (submissions || []).map((sub) => {
      const profile = sub.touchbase_profiles as unknown as { id: string; full_name: string; email: string } | null;
      return {
        id: sub.id,
        student_id: sub.student_id,
        student_name: profile?.full_name || "Unknown Student",
        student_email: profile?.email || "",
        content: sub.content,
        file_url: sub.file_url,
        submitted_at: sub.submitted_at,
        status: sub.status,
        grade: sub.grade,
        feedback: sub.feedback,
        graded_at: sub.graded_at,
      };
    });

    return NextResponse.json({
      assignment: formattedAssignment,
      submissions: formattedSubmissions,
    });
  } catch (error: unknown) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}
