/**
 * Individual Teacher API Routes
 * Handles single teacher operations (get, update, delete)
 * @module app/api/teachers/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import {
  getTeacher,
  updateTeacher,
  deleteTeacher,
  type UpdateTeacherInput,
} from "@/lib/services/teachers";
import { supabaseBrowser } from "@/lib/supabase/client";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/teachers/[id]
 * Get single teacher by ID
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
      const teacher = await getTeacher(supabase, context.params.id);

      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: teacher,
      });
    } catch (error: unknown) {
      console.error("Error fetching teacher:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch teacher",
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
 * PUT /api/teachers/[id]
 * Update teacher information
 * @permission coach+ (coaches and above can update)
 */
export const PUT = withRBAC(
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

      // Email format validation if provided
      if (body.email) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        if (!emailRegex.test(body.email)) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid email format",
            },
            { status: 400 }
          );
        }
      }

      // Years experience validation
      if (body.years_experience !== undefined && body.years_experience < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Years of experience cannot be negative",
          },
          { status: 400 }
        );
      }

      // Prepare update input
      const input: UpdateTeacherInput = {};

      // Only include fields that are present in body
      if (body.first_name !== undefined) input.first_name = body.first_name;
      if (body.last_name !== undefined) input.last_name = body.last_name;
      if (body.email !== undefined) input.email = body.email;
      if (body.phone !== undefined) input.phone = body.phone;
      if (body.date_of_birth !== undefined)
        input.date_of_birth = body.date_of_birth;
      if (body.profile_photo_url !== undefined)
        input.profile_photo_url = body.profile_photo_url;
      if (body.certifications !== undefined)
        input.certifications = body.certifications;
      if (body.specializations !== undefined)
        input.specializations = body.specializations;
      if (body.years_experience !== undefined)
        input.years_experience = body.years_experience;
      if (body.bio !== undefined) input.bio = body.bio;
      if (body.department !== undefined) input.department = body.department;
      if (body.position !== undefined) input.position = body.position;
      if (body.hire_date !== undefined) input.hire_date = body.hire_date;
      if (body.status !== undefined) input.status = body.status;
      if (body.employment_type !== undefined)
        input.employment_type = body.employment_type;
      if (body.address !== undefined) input.address = body.address;
      if (body.emergency_contact_name !== undefined)
        input.emergency_contact_name = body.emergency_contact_name;
      if (body.emergency_contact_phone !== undefined)
        input.emergency_contact_phone = body.emergency_contact_phone;
      if (body.emergency_contact_relationship !== undefined)
        input.emergency_contact_relationship =
          body.emergency_contact_relationship;

      const supabase = supabaseBrowser();
      const teacher = await updateTeacher(supabase, context.params.id, input);

      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: teacher,
        message: "Teacher updated successfully",
      });
    } catch (error: unknown) {
      console.error("Error updating teacher:", error);

      // Handle unique constraint violation
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "A teacher with this email already exists in your organization",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update teacher",
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
 * DELETE /api/teachers/[id]
 * Delete teacher
 * @permission admin+ (only admins and owners can delete)
 */
export const DELETE = withRBAC(
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
      await deleteTeacher(supabase, context.params.id);

      return NextResponse.json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error: unknown) {
      console.error("Error deleting teacher:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete teacher",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["admin", "owner"], // Only admins and owners can delete
  }
);
