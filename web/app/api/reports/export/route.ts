import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

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
    const type = url.searchParams.get("type") || "attendance"; // attendance, performance, budget
    const format = url.searchParams.get("format") || "csv"; // csv, pdf
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let data: any[] = [];

    switch (type) {
      case "attendance": {
        // Load attendance data
        let query = s
          .from("touchbase_attendance")
          .select(`
            *,
            touchbase_classes (name),
            touchbase_profiles!touchbase_attendance_student_id_fkey (full_name, email)
          `)
          .eq("org_id", current.org_id);

        if (startDate) query = query.gte("attendance_date", startDate);
        if (endDate) query = query.lte("attendance_date", endDate);

        const { data: attendanceData } = await query;
        data = (attendanceData || []).map((item: any) => ({
          date: item.attendance_date,
          student: item.touchbase_profiles?.full_name || "N/A",
          email: item.touchbase_profiles?.email || "N/A",
          class: item.touchbase_classes?.name || "N/A",
          status: item.status,
          notes: item.notes || "",
        }));
        break;
      }
      case "performance": {
        // Load performance data (module progress)
        let query = s
          .from("touchbase_progress")
          .select(`
            *,
            touchbase_modules (title, difficulty),
            touchbase_profiles!touchbase_progress_user_id_fkey (full_name, email)
          `);

        if (startDate) query = query.gte("completed_at", startDate);
        if (endDate) query = query.lte("completed_at", endDate);

        const { data: progressData } = await query;
        data = (progressData || []).map((item: any) => ({
          student: item.touchbase_profiles?.full_name || "N/A",
          email: item.touchbase_profiles?.email || "N/A",
          module: item.touchbase_modules?.title || "N/A",
          difficulty: item.touchbase_modules?.difficulty || "N/A",
          status: item.status,
          completion: item.completion_percentage,
          score: item.score || "N/A",
          time_minutes: Math.round((item.total_time_seconds || 0) / 60),
          completed_at: item.completed_at || "N/A",
        }));
        break;
      }
      case "budget": {
        const budgetRes = await s
          .from("touchbase_expenses")
          .select("*")
          .eq("org_id", current.org_id)
          .is("deleted_at", null);
        data = budgetRes.data || [];
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    if (format === "csv") {
      // Generate CSV
      if (data.length === 0) {
        return NextResponse.json({ error: "No data to export" }, { status: 400 });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(","))
      ];

      const csv = csvRows.join("\n");
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="report-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else if (format === "pdf") {
      // Generate PDF as HTML (can be printed to PDF by browser)
      if (data.length === 0) {
        return NextResponse.json({ error: "No data to export" }, { status: 400 });
      }

      const headers = Object.keys(data[0]);
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Report - ${type}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #1a3a5c; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #1a3a5c; color: white; }
    tr:nth-child(even) { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Reporte: ${type}</h1>
  <p>Generado: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(header => `<td>${row[header] || ""}</td>`).join("")}
        </tr>
      `).join("")}
    </tbody>
  </table>
</body>
</html>
      `;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="report-${type}-${new Date().toISOString().split("T")[0]}.html"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export report" },
      { status: 400 }
    );
  }
}

