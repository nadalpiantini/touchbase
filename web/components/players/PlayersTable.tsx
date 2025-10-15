"use client";
import { useEffect, useState } from "react";

type Player = { id: string; full_name: string; team_id: string | null; created_at: string };
type Team = { id: string; name: string };

export default function PlayersTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTeam, setEditTeam] = useState<string>("");

  const load = async (team_id?: string) => {
    try {
      const qs = team_id ? `?team_id=${team_id}` : "";
      const [plist, tlist] = await Promise.all([
        fetch(`/api/players/list${qs}`).then(r => r.json()),
        fetch("/api/teams/list").then(r => r.json())
      ]);
      if (plist.error) throw new Error(plist.error);
      setPlayers(plist.players ?? []);
      setTeams(tlist.teams ?? []);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { 
    setLoading(true); 
    load(teamFilter || undefined); 
  }, [teamFilter]);

  const startEdit = (p: Player) => {
    setEditId(p.id);
    setEditName(p.full_name);
    setEditTeam(p.team_id ?? "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditTeam("");
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    const res = await fetch("/api/players/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, full_name: editName, team_id: editTeam || null })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "No se pudo guardar");
      return;
    }
    cancelEdit();
    load(teamFilter || undefined);
  };

  const softDelete = async (id: string) => {
    if (!confirm("¿Borrar jugador? (soft delete)")) return;
    const res = await fetch("/api/players/soft-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "No se pudo borrar");
      return;
    }
    load(teamFilter || undefined);
  };

  if (loading) return <p className="text-gray-500">Cargando…</p>;
  if (err) return <p className="text-red-600">⚠ {err}</p>;
  if (!players.length) return <p className="text-gray-500">Sin jugadores.</p>;

  const mapTeam = new Map(teams.map(t => [t.id, t.name]));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Filtrar por equipo:</label>
        <select 
          className="border border-gray-300 p-2 rounded bg-white" 
          value={teamFilter} 
          onChange={e => setTeamFilter(e.target.value)}
        >
          <option value="">Todos los equipos</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Jugador</th>
              <th className="text-left p-3 font-medium text-gray-700">Equipo</th>
              <th className="text-left p-3 font-medium text-gray-700">Creado</th>
              <th className="text-right p-3 font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  {editId === p.id ? (
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
                    p.full_name
                  )}
                </td>
                <td className="p-3">
                  {editId === p.id ? (
                    <select 
                      className="border border-gray-300 p-1 rounded bg-white"
                      value={editTeam}
                      onChange={e => setEditTeam(e.target.value)}
                    >
                      <option value="">Sin equipo</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  ) : (
                    <span className="text-gray-600">
                      {p.team_id ? (mapTeam.get(p.team_id) ?? "—") : "—"}
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-600">
                  {new Date(p.created_at).toLocaleString()}
                </td>
                <td className="p-3 text-right space-x-2">
                  {editId === p.id ? (
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
                        onClick={() => startEdit(p)}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => softDelete(p.id)}
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
    </div>
  );
}
