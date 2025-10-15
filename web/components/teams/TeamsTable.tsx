"use client";
import { useEffect, useState } from "react";

type Team = { id: string; name: string; created_at: string };

export default function TeamsTable() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/teams/list");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo cargar");
        setTeams(json.teams ?? []);
      } catch (e: any) {
        setErr(e?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <p className="text-gray-500">Cargando…</p>;
  if (err) return <p className="text-red-600">⚠ {err}</p>;
  if (!teams.length) return <p className="text-gray-500">Sin equipos aún.</p>;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-3 font-medium text-gray-700">Nombre</th>
            <th className="text-left p-3 font-medium text-gray-700">Creado</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(t => (
            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">{t.name}</td>
              <td className="p-3 text-gray-600">
                {new Date(t.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
