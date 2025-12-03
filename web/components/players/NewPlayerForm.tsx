"use client";
import { useEffect, useState } from "react";
import { Alert } from '@/components/ui';

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
        className="border border-[--color-tb-line] p-2 rounded-lg w-64 font-sans text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/50 focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition"
        placeholder="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <select
        className="border border-[--color-tb-line] p-2 rounded-lg bg-white font-sans text-[--color-tb-navy] focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
      >
        <option value="">Sin equipo</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <button 
        disabled={loading} 
        className="bg-[--color-tb-red] text-white px-4 py-2 rounded-xl font-display hover:bg-[--color-tb-stitch] shadow-dugout disabled:opacity-50 transition-all active:translate-y-[1px]"
      >
        {loading ? "Creando..." : "Crear jugador"}
      </button>
      {msg && (
        <Alert 
          variant={msg.startsWith("✅") ? "success" : "error"} 
          className="text-sm py-2 px-3"
        >
          {msg}
        </Alert>
      )}
    </form>
  );
}
