import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const body = await req.json();
    const { submission_id, grade, feedback, status } = body;

    if (!submission_id) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const s = await supabaseServer();

    // Get the current user (teacher)
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the teacher's profile
    const { data: profile } = await s
      .from("touchbase_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Verify submission exists and belongs to this assignment
    const { data: submission, error: submissionError } = await s
      .from("touchbase_assignment_submissions")
      .select("id, assignment_id")
      .eq("id", submission_id)
      .eq("assignment_id", assignmentId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Determine the update data based on whether grading or returning
    const updateData: {
      status: string;
      feedback?: string;
      grade?: number | null;
      graded_by?: string;
      graded_at?: string;
    } = {
      status: status || "graded",
      feedback: feedback || null,
    };

    if (status === "returned") {
      // Return for revision - no grade
      updateData.grade = null;
      updateData.graded_at = undefined;
      updateData.graded_by = undefined;
    } else if (grade !== undefined) {
      // Grade the submission
      updateData.grade = grade;
      updateData.graded_by = profile?.id;
      updateData.graded_at = new Date().toISOString();
    }

    // Update the submission
    const { data: updatedSubmission, error: updateError } = await s
      .from("touchbase_assignment_submissions")
      .update(updateData)
      .eq("id", submission_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error: unknown) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to grade submission",
      },
      { status: 500 }
    );
  }
}
