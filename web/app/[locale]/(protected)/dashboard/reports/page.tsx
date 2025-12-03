"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";

type ReportType = "attendance" | "performance" | "budget";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: format,
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/reports/export?${params.toString()}`);
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al exportar");
      }

      if (format === "csv") {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al exportar reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-tb-navy]">Reportes</h1>
        <p className="text-[--color-tb-shadow] mt-1">Genera y exporta reportes de tu organización</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
            >
              <option value="attendance">Asistencia</option>
              <option value="performance">Rendimiento Académico</option>
              <option value="budget">Presupuesto y Gastos</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
              Formato
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={format === "csv"}
                  onChange={(e) => setFormat(e.target.value as "csv" | "pdf")}
                />
                <span>CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={(e) => setFormat(e.target.value as "csv" | "pdf")}
                />
                <span>PDF</span>
              </label>
            </div>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full">
            {loading ? "Generando..." : `Exportar ${format.toUpperCase()}`}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

