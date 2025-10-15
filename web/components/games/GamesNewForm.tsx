"use client";
import { useEffect, useState } from "react";

type Team = { id: string; name: string };

export default function GamesNewForm() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [venue, setVenue] = useState("");
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/teams/list").then(r=>r.json()).then(j=>setTeams(j.teams||[]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/games/create", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ home_team_id: home, away_team_id: away, starts_at: startsAt, venue })
    });
    const j = await r.json();
    if (!r.ok) setMsg(`⚠ ${j?.error || "Error"}`);
    else { 
      setMsg("✅ Partido creado"); 
      setHome(""); 
      setAway(""); 
      setStartsAt(""); 
      setVenue(""); 
      setTimeout(() => location.reload(), 500);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-lg font-semibold">Nuevo Partido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipo Local
          </label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" 
            value={home} 
            onChange={e=>setHome(e.target.value)}
            required
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipo Visitante
          </label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" 
            value={away} 
            onChange={e=>setAway(e.target.value)}
            required
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora
          </label>
          <input 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" 
            type="datetime-local" 
            value={startsAt} 
            onChange={e=>setStartsAt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lugar (opcional)
          </label>
          <input 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" 
            placeholder="Estadio, campo, etc." 
            value={venue} 
            onChange={e=>setVenue(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Crear Partido
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
