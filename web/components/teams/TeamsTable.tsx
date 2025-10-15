"use client";
import { useEffect, useState } from "react";

type Team = { id: string; name: string; created_at: string };

export default function TeamsTable() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const startEdit = (t: Team) => { 
    setEditId(t.id); 
    setEditName(t.name); 
  };
  
  const cancelEdit = () => { 
    setEditId(null); 
    setEditName(""); 
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    const res = await fetch("/api/teams/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, name: editName })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "No se pudo guardar");
      return;
    }
    setEditId(null); 
    setEditName("");
    load();
  };

  const softDelete = async (id: string) => {
    if (!confirm("¿Borrar equipo? (soft delete)")) return;
    const res = await fetch("/api/teams/soft-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "No se pudo borrar");
      return;
    }
    load();
  };

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
            <th className="text-right p-3 font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(t => (
            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                {editId === t.id ? (
                  <input 
                    className="border border-gray-300 p-1 rounded w-full" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  t.name
                )}
              </td>
              <td className="p-3 text-gray-600">
                {new Date(t.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right space-x-2">
                {editId === t.id ? (
                  <>
                    <button 
                      className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      onClick={saveEdit}
                    >
                      Guardar
                    </button>
                    <button 
                      className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => startEdit(t)}
                    >
                      Editar
                    </button>
                    <button 
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => softDelete(t.id)}
                    >
                      Borrar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
