import { NextRequest, NextResponse } from "next/server";
import { supabaseBrowser } from "@/lib/supabase/client";
import { withRBAC } from "@/lib/rbac/middleware";
import { Role } from "@/lib/rbac/types";
import { getClass, updateClass, deleteClass } from "@/lib/services/classes";

/**
 * GET /api/classes/[id] - Get single class by ID
 * RBAC: viewer+ can view classes
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
      
      const classData = await getClass(supabase, id);

      if (!classData) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: classData,
      });
    } catch (error: unknown) {
      console.error("Error fetching class:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch class",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["viewer", "coach", "admin", "owner"] }
);

/**
 * PUT /api/classes/[id] - Update class
 * RBAC: coach+ can update classes
 */
export const PUT = withRBAC<{ id: string }>(
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
      const body = await request.json();
      
      const supabase = supabaseBrowser();
      
      // Verify class exists first
      const existingClass = await getClass(supabase, id);
      if (!existingClass) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      const updatedClass = await updateClass(supabase, id, body);

      return NextResponse.json({
        success: true,
        data: updatedClass,
      });
    } catch (error: unknown) {
      console.error("Error updating class:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update class",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["coach", "admin", "owner"] }
);

/**
 * DELETE /api/classes/[id] - Soft delete class (set status to cancelled)
 * RBAC: admin+ can delete classes
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
      const { id } = context.params;
      const supabase = supabaseBrowser();
      
      // Verify class exists first
      const existingClass = await getClass(supabase, id);
      if (!existingClass) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      await deleteClass(supabase, id);

      return NextResponse.json({
        success: true,
        message: "Class deleted successfully",
      });
    } catch (error: unknown) {
      console.error("Error deleting class:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete class",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["admin", "owner"] }
);
