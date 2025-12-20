import { NextRequest, NextResponse } from "next/server";
import { supabaseBrowser } from "@/lib/supabase/client";
import { withRBAC } from "@/lib/rbac/middleware";
import { Role } from "@/lib/rbac/types";
import {
  getClassEnrollments,
  enrollStudent,
  withdrawStudent,
  getClass,
} from "@/lib/services/classes";

/**
 * GET /api/classes/[id]/enrollments - Get all enrollments for a class
 * RBAC: viewer+ can view enrollments
 */
export const GET = withRBAC<{ id: string }>(
  async (
    request: NextRequest,
    context: { orgId: string; role: Role; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          { success: false, error: "Class ID is required" },
          { status: 400 }
        );
      }
      const { id } = context.params;
      const supabase = supabaseBrowser();
      
      // Verify class exists
      const classData = await getClass(supabase, id);
      if (!classData) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      const enrollments = await getClassEnrollments(supabase, id);

      return NextResponse.json({
        success: true,
        data: enrollments,
        count: enrollments.length,
      });
    } catch (error: unknown) {
      console.error("Error fetching enrollments:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch enrollments",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["viewer", "coach", "admin", "owner"] }
);

/**
 * POST /api/classes/[id]/enrollments - Enroll a student in class
 * Body: { student_id: string, notes?: string }
 * RBAC: coach+ can enroll students
 */
export const POST = withRBAC<{ id: string }>(
  async (
    request: NextRequest,
    context: { orgId: string; role: Role; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          { success: false, error: "Class ID is required" },
          { status: 400 }
        );
      }
      const { id: classId } = context.params;
      const body = await request.json();
      
      // Validate required fields
      if (!body.student_id) {
        return NextResponse.json(
          { success: false, error: "Student ID is required" },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      
      // Verify class exists
      const classData = await getClass(supabase, classId);
      if (!classData) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      const enrollment = await enrollStudent(supabase, {
        class_id: classId,
        student_id: body.student_id,
        status: body.status,
        notes: body.notes,
      });

      return NextResponse.json(
        {
          success: true,
          data: enrollment,
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Error enrolling student:", error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("already enrolled")) {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 409 }
          );
        }
        if (error.message.includes("full capacity")) {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 409 }
          );
        }
      }
      
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to enroll student",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["coach", "admin", "owner"] }
);

/**
 * DELETE /api/classes/[id]/enrollments - Withdraw student from class
 * Query params: enrollment_id (required), reason (optional)
 * RBAC: coach+ can withdraw students
 */
export const DELETE = withRBAC<{ id: string }>(
  async (
    request: NextRequest,
    context: { orgId: string; role: Role; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          { success: false, error: "Class ID is required" },
          { status: 400 }
        );
      }
      const { id: classId } = context.params;
      const { searchParams } = new URL(request.url);
      
      const enrollmentIdParam = searchParams.get("enrollment_id");
      if (!enrollmentIdParam) {
        return NextResponse.json(
          { success: false, error: "Enrollment ID is required" },
          { status: 400 }
        );
      }
      
      const enrollmentId = parseInt(enrollmentIdParam, 10);
      if (isNaN(enrollmentId)) {
        return NextResponse.json(
          { success: false, error: "Invalid enrollment ID" },
          { status: 400 }
        );
      }
      
      const reason = searchParams.get("reason") || undefined;
      const supabase = supabaseBrowser();
      
      // Verify class exists
      const classData = await getClass(supabase, classId);
      if (!classData) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      await withdrawStudent(supabase, enrollmentId, reason);

      return NextResponse.json({
        success: true,
        message: "Student withdrawn successfully",
      });
    } catch (error: unknown) {
      console.error("Error withdrawing student:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to withdraw student",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["coach", "admin", "owner"] }
);
