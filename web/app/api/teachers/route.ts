/**
 * Teachers API Routes
 * Handles CRUD operations for teacher management
 * @module app/api/teachers
 */

import { NextRequest, NextResponse } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import {
  getTeachers,
  getActiveTeachers,
  createTeacher,
  type CreateTeacherInput,
} from "@/lib/services/teachers";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * GET /api/teachers
 * List teachers with optional filters
 * Query params: status, department, search, active_only
 * @permission viewer+ (all authenticated users can view)
 */
export const GET = withRBAC(
  async (
    request: NextRequest,
    context: { orgId: string; role: string }
  ): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const department = searchParams.get("department");
      const search = searchParams.get("search");
      const activeOnly = searchParams.get("active_only") === "true";

      const supabase = supabaseBrowser();

      // If active_only requested, use RPC function
      if (activeOnly) {
        const teachers = await getActiveTeachers(supabase, context.orgId);
        return NextResponse.json({
          success: true,
          data: teachers,
          count: teachers.length,
        });
      }

      // Otherwise use filtered query
      const filters: {
        status?: "active" | "inactive" | "on_leave" | "terminated";
        department?: string;
        search?: string;
      } = {};

      if (status) {
        filters.status = status as
          | "active"
          | "inactive"
          | "on_leave"
          | "terminated";
      }
      if (department) {
        filters.department = department;
      }
      if (search) {
        filters.search = search;
      }

      const teachers = await getTeachers(supabase, context.orgId, filters);

      return NextResponse.json({
        success: true,
        data: teachers,
        count: teachers.length,
      });
    } catch (error: unknown) {
      console.error("Error fetching teachers:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch teachers",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["viewer", "coach", "admin", "owner"], // All authenticated org members can view
  }
);

/**
 * POST /api/teachers
 * Create new teacher
 * @permission coach+ (coaches and above can create teachers)
 */
export const POST = withRBAC(
  async (
    request: NextRequest,
    context: { orgId: string; role: string }
  ): Promise<NextResponse> => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.first_name || !body.last_name || !body.email) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing required fields: first_name, last_name, email are required",
          },
          { status: 400 }
        );
      }

      // Email format validation
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

      // Prepare input
      const input: CreateTeacherInput = {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        date_of_birth: body.date_of_birth || null,
        profile_photo_url: body.profile_photo_url || null,
        certifications: body.certifications || [],
        specializations: body.specializations || [],
        years_experience: body.years_experience || 0,
        bio: body.bio || null,
        department: body.department || null,
        position: body.position || null,
        hire_date: body.hire_date || null,
        status: body.status || "active",
        employment_type: body.employment_type || null,
        address: body.address || null,
        emergency_contact_name: body.emergency_contact_name || null,
        emergency_contact_phone: body.emergency_contact_phone || null,
        emergency_contact_relationship:
          body.emergency_contact_relationship || null,
      };

      const supabase = supabaseBrowser();
      const teacher = await createTeacher(supabase, context.orgId, input);

      return NextResponse.json(
        {
          success: true,
          data: teacher,
          message: "Teacher created successfully",
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Error creating teacher:", error);

      // Handle unique constraint violation (duplicate email)
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
            error instanceof Error ? error.message : "Failed to create teacher",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["coach", "admin", "owner"], // Coaches and above can create
  }
);
