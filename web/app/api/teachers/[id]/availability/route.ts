/**
 * Teacher Availability API Routes
 * Handles teacher weekly availability schedule
 * @module app/api/teachers/[id]/availability
 */

import { NextRequest, NextResponse } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import {
  getTeacherAvailability,
  setTeacherAvailability,
} from "@/lib/services/teachers";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * GET /api/teachers/[id]/availability
 * Get teacher's weekly availability schedule
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
      const availability = await getTeacherAvailability(
        supabase,
        context.params.id
      );

      return NextResponse.json({
        success: true,
        data: availability,
        count: availability.length,
      });
    } catch (error: unknown) {
      console.error("Error fetching teacher availability:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch teacher availability",
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
 * POST /api/teachers/[id]/availability
 * Set teacher's weekly availability schedule
 * Body: {
 *   day_of_week: number (0-6),
 *   start_time: string ("HH:MM"),
 *   end_time: string ("HH:MM"),
 *   is_available?: boolean
 * }
 * @permission coach+ (coaches and above can manage)
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

      // Validate required fields
      if (
        body.day_of_week === undefined ||
        !body.start_time ||
        !body.end_time
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing required fields: day_of_week, start_time, end_time are required",
          },
          { status: 400 }
        );
      }

      // Validate day_of_week range (0=Sunday, 6=Saturday)
      if (body.day_of_week < 0 || body.day_of_week > 6) {
        return NextResponse.json(
          {
            success: false,
            error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)",
          },
          { status: 400 }
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(body.start_time) || !timeRegex.test(body.end_time)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid time format. Use HH:MM (24-hour format)",
          },
          { status: 400 }
        );
      }

      // Validate start_time < end_time
      const [startHour, startMin] = body.start_time.split(":").map(Number);
      const [endHour, endMin] = body.end_time.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        return NextResponse.json(
          {
            success: false,
            error: "start_time must be before end_time",
          },
          { status: 400 }
        );
      }

      const supabase = supabaseBrowser();
      
      // Call setTeacherAvailability with array format
      await setTeacherAvailability(supabase, context.params.id, [
        {
          day_of_week: body.day_of_week,
          start_time: body.start_time,
          end_time: body.end_time,
          is_available: body.is_available !== undefined ? body.is_available : true,
        },
      ]);

      return NextResponse.json(
        {
          success: true,
          message: "Teacher availability set successfully",
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Error setting teacher availability:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to set teacher availability",
        },
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ["coach", "admin", "owner"],
  }
);
