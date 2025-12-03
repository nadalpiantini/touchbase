import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    await requireAuth(s);

    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];

    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // players, teachers, classes

    if (!type) {
      return NextResponse.json({ error: "Type parameter is required" }, { status: 400 });
    }

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "players": {
        const { data: players } = await s
          .from("touchbase_players")
          .select("*")
          .eq("org_id", current.org_id)
          .is("deleted_at", null)
          .order("full_name");

        data = (players || []).map((p: any) => ({
          name: p.full_name,
          email: p.email || "",
          phone: p.phone || "",
          position: p.position || "",
          jersey_number: p.jersey_number || "",
          birthdate: p.birthdate || "",
          country: p.country || "",
          team: p.team_id || "",
          created_at: p.created_at,
        }));

        filename = `players-${new Date().toISOString().split("T")[0]}.csv`;
        break;
      }

      case "teachers": {
        const { data: teachers } = await s
          .from("touchbase_teachers")
          .select("*")
          .eq("org_id", current.org_id)
          .is("deleted_at", null)
          .order("full_name");

        data = (teachers || []).map((t: any) => ({
          name: t.full_name,
          email: t.email || "",
          phone: t.phone || "",
          department: t.department || "",
          employment_type: t.employment_type || "",
          hire_date: t.hire_date || "",
          degree: t.degree || "",
          field_of_study: t.field_of_study || "",
          experience_years: t.experience_years || "",
          created_at: t.created_at,
        }));

        filename = `teachers-${new Date().toISOString().split("T")[0]}.csv`;
        break;
      }

      case "classes": {
        const { data: classes } = await s
          .from("touchbase_classes")
          .select(`
            *,
            touchbase_profiles!touchbase_classes_teacher_id_fkey (full_name, email)
          `)
          .eq("org_id", current.org_id)
          .order("name");

        data = (classes || []).map((c: any) => ({
          name: c.name,
          code: c.code,
          grade_level: c.grade_level || "",
          description: c.description || "",
          teacher: c.touchbase_profiles?.full_name || "",
          teacher_email: c.touchbase_profiles?.email || "",
          created_at: c.created_at,
        }));

        filename = `classes-${new Date().toISOString().split("T")[0]}.csv`;
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid type. Use: players, teachers, classes" }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 400 });
    }

    const csv = arrayToCSV(data);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export CSV" },
      { status: 500 }
    );
  }
}

