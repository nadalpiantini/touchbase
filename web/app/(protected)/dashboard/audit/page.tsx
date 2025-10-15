"use client";
import { useEffect, useState } from "react";

type Log = {
  id: string;
  entity: "team" | "player";
  entity_id: string;
  action: "create"|"update"|"soft_delete"|"restore"|"purge";
  actor: string | null;
  meta: any;
  created_at: string;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [entity, setEntity] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const qs = new URLSearchParams();
      if (entity) qs.set("entity", entity);
      if (action) qs.set("action", action);
      qs.set("limit", "200");

      const res = await fetch(`/api/audit/list?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo cargar");
      setLogs(json.logs ?? []);
    } catch (e:any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);          // primera carga
  useEffect(()=>{ setLoading(true); load(); }, [entity, action]); // filtros

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      <div className="flex gap-2 items-center">
        <select className="border p-2 rounded" value={entity} onChange={e=>setEntity(e.target.value)}>
          <option value="">Todas las entidades</option>
          <option value="team">Equipos</option>
          <option value="player">Jugadores</option>
        </select>
        <select className="border p-2 rounded" value={action} onChange={e=>setAction(e.target.value)}>
          <option value="">Todas las acciones</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="soft_delete">Soft Delete</option>
          <option value="restore">Restore</option>
          <option value="purge">Purge</option>
        </select>
      </div>

      {loading ? <p>Cargando…</p> : err ? <p className="text-red-600">⚠ {err}</p> : (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Entidad</th>
                <th className="text-left p-2">Acción</th>
                <th className="text-left p-2">Actor</th>
                <th className="text-left p-2">Meta</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-2">{l.entity} ({l.entity_id.slice(0,6)}…)</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2">{l.actor ?? "—"}</td>
                  <td className="p-2"><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(l.meta || {}, null, 2)}</pre></td>
                </tr>
              ))}
              {logs.length===0 && <tr><td className="p-2" colSpan={5}>Sin eventos.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
