"use client";
import { useEffect, useState } from "react";

type Team = { id: string; name: string; deleted_at: string };
type Player = { id: string; full_name: string; deleted_at: string };
type Game = { id: string; home_team_id: string; away_team_id: string; starts_at: string; venue: string | null; deleted_at: string };

export default function RecyclePage() {
  const [tab, setTab] = useState<"teams"|"players"|"games">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teamMap, setTeamMap] = useState<Map<string, string>>(new Map());
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setMsg(null);
    const [tres, pres, gres, allTeams] = await Promise.all([
      fetch("/api/teams/deleted").then(r=>r.json()),
      fetch("/api/players/deleted").then(r=>r.json()),
      fetch("/api/games/deleted").then(r=>r.json()),
      fetch("/api/teams/list").then(r=>r.json())
    ]);
    setTeams(tres.teams ?? []);
    setPlayers(pres.players ?? []);
    setGames(gres.games ?? []);
    setTeamMap(new Map((allTeams.teams ?? []).map((t: Team) => [t.id, t.name])));
  };

  useEffect(()=>{ load(); }, []);

  const restoreTeam = async (id: string) => {
    const r = await fetch("/api/teams/restore", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo restaurar equipo");
    else load();
  };
  const purgeTeam = async (id: string) => {
    if (!confirm("Eliminar DEFINITIVO el equipo?")) return;
    const r = await fetch("/api/teams/purge", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo eliminar definitivo");
    else load();
  };

  const restorePlayer = async (id: string) => {
    const r = await fetch("/api/players/restore", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo restaurar jugador");
    else load();
  };
  const purgePlayer = async (id: string) => {
    if (!confirm("Eliminar DEFINITIVO el jugador?")) return;
    const r = await fetch("/api/players/purge", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo eliminar definitivo");
    else load();
  };

  const restoreGame = async (id: string) => {
    const r = await fetch("/api/games/restore", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo restaurar partido");
    else load();
  };
  const purgeGame = async (id: string) => {
    if (!confirm("Eliminar DEFINITIVO el partido?")) return;
    const r = await fetch("/api/games/purge", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) setMsg((await r.json()).error || "No se pudo eliminar definitivo");
    else load();
  };

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Papelera</h1>

      <div className="flex gap-2">
        <button className={`border px-3 py-1 rounded ${tab==='teams' ? 'bg-gray-200':''}`} onClick={()=>setTab('teams')}>Equipos</button>
        <button className={`border px-3 py-1 rounded ${tab==='players' ? 'bg-gray-200':''}`} onClick={()=>setTab('players')}>Jugadores</button>
        <button className={`border px-3 py-1 rounded ${tab==='games' ? 'bg-gray-200':''}`} onClick={()=>setTab('games')}>Partidos</button>
      </div>

      {msg && <p className="text-red-600 text-sm">{msg}</p>}

      {tab === "teams" ? (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-2 text-left">Equipo</th><th className="p-2 text-left">Eliminado</th><th className="p-2 text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{new Date(t.deleted_at).toLocaleString()}</td>
                  <td className="p-2 text-right space-x-2">
                    <button className="border px-2 py-1 rounded hover:bg-gray-100" onClick={()=>restoreTeam(t.id)}>Restaurar</button>
                    <button className="border px-2 py-1 rounded hover:bg-red-100" onClick={()=>purgeTeam(t.id)}>Eliminar definitivo</button>
                  </td>
                </tr>
              ))}
              {teams.length===0 && <tr><td className="p-2" colSpan={3}>No hay equipos eliminados.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : tab === "players" ? (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-2 text-left">Jugador</th><th className="p-2 text-left">Eliminado</th><th className="p-2 text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.full_name}</td>
                  <td className="p-2">{new Date(p.deleted_at).toLocaleString()}</td>
                  <td className="p-2 text-right space-x-2">
                    <button className="border px-2 py-1 rounded hover:bg-gray-100" onClick={()=>restorePlayer(p.id)}>Restaurar</button>
                    <button className="border px-2 py-1 rounded hover:bg-red-100" onClick={()=>purgePlayer(p.id)}>Eliminar definitivo</button>
                  </td>
                </tr>
              ))}
              {players.length===0 && <tr><td className="p-2" colSpan={3}>No hay jugadores eliminados.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-2 text-left">Partido</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Eliminado</th><th className="p-2 text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{teamMap.get(g.home_team_id) || "—"}</div>
                    <div className="text-xs text-gray-500">vs {teamMap.get(g.away_team_id) || "—"}</div>
                    {g.venue && <div className="text-xs text-gray-400">{g.venue}</div>}
                  </td>
                  <td className="p-2">{new Date(g.starts_at).toLocaleString()}</td>
                  <td className="p-2">{new Date(g.deleted_at).toLocaleString()}</td>
                  <td className="p-2 text-right space-x-2">
                    <button className="border px-2 py-1 rounded hover:bg-gray-100" onClick={()=>restoreGame(g.id)}>Restaurar</button>
                    <button className="border px-2 py-1 rounded hover:bg-red-100" onClick={()=>purgeGame(g.id)}>Eliminar definitivo</button>
                  </td>
                </tr>
              ))}
              {games.length===0 && <tr><td className="p-2" colSpan={4}>No hay partidos eliminados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
