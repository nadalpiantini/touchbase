/**
 * Teacher Classes API Routes
 * Handles teacher-class assignment operations
 * @module app/api/teachers/[id]/classes
 */

import { NextRequest, NextResponse } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import {
  getTeacherClasses,
  assignTeacherToClass,
  removeTeacherFromClass,
} from "@/lib/services/teachers";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * GET /api/teachers/[id]/classes
 * Get all classes assigned to a teacher
 * @permission viewer+ (all authenticated users can view)
 */
export const GET = withRBAC(
  async (
    _request: NextRequest,
    context: { orgId: string; role: string; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher ID is required",
          },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      const classes = await getTeacherClasses(supabase, context.params.id);

      return NextResponse.json({
        success: true,
        data: classes,
        count: classes.length,
      });
    } catch (error: unknown) {
      console.error("Error fetching teacher classes:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch teacher classes",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["viewer", "coach", "admin", "owner"],
  }
);

/**
 * POST /api/teachers/[id]/classes
 * Assign teacher to a class
 * Body: { class_id: string, role?: "primary" | "assistant" | "substitute" }
 * @permission coach+ (coaches and above can assign)
 */
export const POST = withRBAC(
  async (
    request: NextRequest,
    context: { orgId: string; role: string; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher ID is required",
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      if (!body.class_id) {
        return NextResponse.json(
          {
            success: false,
            error: "class_id is required",
          },
          { status: 400 }
        );
      }

      // Validate role if provided
      const validRoles = ["primary", "assistant", "substitute"];
      if (body.role && !validRoles.includes(body.role)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      const assignment = await assignTeacherToClass(
        supabase,
        context.params.id,
        body.class_id,
        body.role || "primary"
      );

      return NextResponse.json(
        {
          success: true,
          data: assignment,
          message: "Teacher assigned to class successfully",
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Error assigning teacher to class:", error);

      // Handle duplicate assignment
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "This teacher is already assigned to this class",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to assign teacher to class",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["coach", "admin", "owner"],
  }
);

/**
 * DELETE /api/teachers/[id]/classes
 * Remove teacher from a class
 * Body: { class_id: string }
 * @permission coach+ (coaches and above can remove)
 */
export const DELETE = withRBAC(
  async (
    request: NextRequest,
    context: { orgId: string; role: string; params?: { id: string } }
  ): Promise<NextResponse> => {
    try {
      if (!context.params?.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher ID is required",
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      if (!body.class_id) {
        return NextResponse.json(
          {
            success: false,
            error: "class_id is required",
          },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      await removeTeacherFromClass(
        supabase,
        context.params.id,
        body.class_id
      );

      return NextResponse.json({
        success: true,
        message: "Teacher removed from class successfully",
      });
    } catch (error: unknown) {
      console.error("Error removing teacher from class:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove teacher from class",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["coach", "admin", "owner"],
  }
);
