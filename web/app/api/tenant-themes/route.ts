import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  getOrgTheme,
  createOrgTheme,
  updateOrgTheme,
  deleteOrgTheme,
  tenantThemeToTheme,
} from "@/lib/services/themes";

/**
 * GET /api/tenant-themes
 * Get theme for current user's organization
 */
export async function GET() {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current organization
    const { data: orgData } = await s.rpc("touchbase_current_org");

    if (!orgData || orgData.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const orgId = orgData[0].org_id;

    // Get theme for organization
    const theme = await getOrgTheme(s, orgId);

    if (!theme) {
      return NextResponse.json({
        error: "No theme found",
        message: "Organization has no custom theme. Using defaults."
      }, { status: 404 });
    }

    // Convert to Theme format for ThemeProvider
    const themeData = tenantThemeToTheme(theme);

    return NextResponse.json({
      theme: themeData,
      tenantTheme: theme
    });
  } catch (error) {
    console.error("GET /api/tenant-themes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenant-themes
 * Create theme for current user's organization
 * Requires admin or owner role
 */
export async function POST(request: NextRequest) {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current organization and role
    const { data: orgData } = await s.rpc("touchbase_current_org");

    if (!orgData || orgData.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const orgId = orgData[0].org_id;
    const role = orgData[0].role;

    // Check permissions (admin or owner only)
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Only admins and owners can create themes" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Create theme
    const theme = await createOrgTheme(s, orgId, user.id, body);

    return NextResponse.json({
      theme: tenantThemeToTheme(theme),
      tenantTheme: theme
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/tenant-themes error:", error);

    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json(
        { error: "Theme already exists for this organization" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenant-themes
 * Update theme for current user's organization
 * Requires admin or owner role
 */
export async function PUT(request: NextRequest) {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current organization and role
    const { data: orgData } = await s.rpc("touchbase_current_org");

    if (!orgData || orgData.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const orgId = orgData[0].org_id;
    const role = orgData[0].role;

    // Check permissions (admin or owner only)
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Only admins and owners can update themes" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update theme
    const theme = await updateOrgTheme(s, orgId, user.id, body);

    return NextResponse.json({
      theme: tenantThemeToTheme(theme),
      tenantTheme: theme
    });
  } catch (error) {
    console.error("PUT /api/tenant-themes error:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenant-themes
 * Delete theme for current user's organization (revert to defaults)
 * Requires owner role only
 */
export async function DELETE() {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current organization and role
    const { data: orgData } = await s.rpc("touchbase_current_org");

    if (!orgData || orgData.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const orgId = orgData[0].org_id;
    const role = orgData[0].role;

    // Check permissions (owner only for deletion)
    if (role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Only owners can delete themes" },
        { status: 403 }
      );
    }

    // Delete theme
    await deleteOrgTheme(s, orgId);

    return NextResponse.json({
      message: "Theme deleted successfully. Reverted to defaults."
    });
  } catch (error) {
    console.error("DELETE /api/tenant-themes error:", error);
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 }
    );
  }
}
