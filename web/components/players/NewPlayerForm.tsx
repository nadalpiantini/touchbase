"use client";
import { useEffect, useState } from "react";

type Team = { id: string; name: string };

export default function NewPlayerForm() {
  const [fullName, setFullName] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teams/list").then(async r => {
      const j = await r.json();
      if (r.ok) setTeams(j.teams ?? []);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    
    const res = await fetch("/api/players/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, team_id: teamId || null })
    });
    const json = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      setMsg(`⚠ ${json?.error || "No se pudo crear"}`);
    } else {
      setMsg("✅ Jugador creado");
      setFullName("");
      setTeamId("");
      setTimeout(() => location.reload(), 500);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-center">
      <input
        className="border border-gray-300 p-2 rounded w-64"
        placeholder="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <select
        className="border border-gray-300 p-2 rounded bg-white"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
      >
        <option value="">Sin equipo</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <button 
        disabled={loading} 
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear jugador"}
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </form>
  );
}
