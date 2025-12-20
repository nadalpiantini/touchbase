import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const body = await req.json();
    const { content, file_url } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Submission content is required" },
        { status: 400 }
      );
    }

    const s = await supabaseServer();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the student's profile
    const { data: profile, error: profileError } = await s
      .from("touchbase_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if assignment exists
    const { data: assignment, error: assignmentError } = await s
      .from("touchbase_assignments")
      .select("id, class_id")
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check for existing submission (upsert)
    const { data: existingSubmission } = await s
      .from("touchbase_assignment_submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id", profile.id)
      .single();

    let submission;

    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await s
        .from("touchbase_assignment_submissions")
        .update({
          content,
          file_url,
          submitted_at: new Date().toISOString(),
          status: "submitted",
          grade: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
        })
        .eq("id", existingSubmission.id)
        .select()
        .single();

      if (error) throw error;
      submission = data;
    } else {
      // Create new submission
      const { data, error } = await s
        .from("touchbase_assignment_submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: profile.id,
          content,
          file_url,
          status: "submitted",
        })
        .select()
        .single();

      if (error) throw error;
      submission = data;
    }

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error: unknown) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit assignment",
      },
      { status: 500 }
    );
  }
}
