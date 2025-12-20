import { NextRequest, NextResponse } from "next/server";
import { supabaseBrowser } from "@/lib/supabase/client";
import { withRBAC } from "@/lib/rbac/middleware";
import { Role } from "@/lib/rbac/types";
import { getClasses, createClass } from "@/lib/services/classes";
import type { ClassStatus, ClassFilters } from "@/lib/services/classes";

/**
 * GET /api/classes - List classes with optional filters
 * Query params: status, level, search
 * RBAC: viewer+ can view classes
 */
export const GET = withRBAC(
  async (
    request: NextRequest,
    _context: { orgId: string; role: Role }
  ): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Build filters from query params
      const filters: ClassFilters = {};
      
      const statusParam = searchParams.get("status");
      if (statusParam) {
        // Support both single status and comma-separated statuses
        const statuses = statusParam.split(",").map(s => s.trim()) as ClassStatus[];
        filters.status = statuses.length === 1 ? statuses[0] : statuses;
      }
      
      const level = searchParams.get("level");
      if (level) {
        filters.level = level;
      }
      
      const search = searchParams.get("search");
      if (search) {
        filters.search = search;
      }

      const supabase = supabaseBrowser();
      const classes = await getClasses(supabase, filters);

      return NextResponse.json({
        success: true,
        data: classes,
        count: classes.length,
      });
    } catch (error: unknown) {
      console.error("Error fetching classes:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch classes",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["viewer", "coach", "admin", "owner"] }
);

/**
 * POST /api/classes - Create new class
 * RBAC: coach+ can create classes
 */
export const POST = withRBAC(
  async (
    request: NextRequest,
    _context: { orgId: string; role: Role }
  ): Promise<NextResponse> => {
    try {
      const body = await request.json();
      
      // Validate required fields
      if (!body.name) {
        return NextResponse.json(
          { success: false, error: "Class name is required" },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      const newClass = await createClass(supabase, body);

      return NextResponse.json(
        {
          success: true,
          data: newClass,
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Error creating class:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create class",
        },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ["coach", "admin", "owner"] }
);
