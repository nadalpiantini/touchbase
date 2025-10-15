"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from 'next-intl';

type Game = {
  id: string;
  starts_at: string;
  status: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  venue: string|null;
};
type Team = { id: string; name: string };

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  final: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800"
};

export default function GamesTable() {
  const t = useTranslations('games');
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [status, setStatus] = useState("");
  const mapTeam = useMemo(()=>new Map(teams.map(team=>[team.id,team.name])),[teams]);

  const load = async () => {
    const qs = status ? `?status=${status}` : "";
    const [g, t] = await Promise.all([
      fetch(`/api/games/list${qs}`).then(r=>r.json()),
      fetch("/api/teams/list").then(r=>r.json())
    ]);
    setGames(g.games||[]); 
    setTeams(t.teams||[]);
  };

  useEffect(()=>{ load(); }, []);
  useEffect(()=>{ load(); }, [status]);

  const saveScore = async (id:string, hs:number, as:number) => {
    const r = await fetch("/api/games/update-score", {
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, home_score: hs, away_score: as })
    });
    if (!r.ok) alert((await r.json()).error||t('errors.generic'));
    else load();
  };

  const changeStatus = async (id:string, st:string) => {
    const r = await fetch("/api/games/status", {
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, status: st })
    });
    if (!r.ok) alert((await r.json()).error||t('errors.generic'));
    else load();
  };

  const deleteGame = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const r = await fetch("/api/games/soft-delete", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ id })
    });
    if (!r.ok) alert((await r.json()).error||t('errors.generic'));
    else load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{t('filter.label')}</label>
        <select
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={e=>setStatus(e.target.value)}
        >
          <option value="">{t('filter.all')}</option>
          <option value="scheduled">{t('filter.scheduled')}</option>
          <option value="live">{t('filter.live')}</option>
          <option value="final">{t('filter.final')}</option>
          <option value="canceled">{t('filter.canceled')}</option>
        </select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.date')}</th>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.match')}</th>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.venue')}</th>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.status')}</th>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.score')}</th>
              <th className="p-3 text-left font-medium text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {games.map(g => (
              <tr key={g.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-900">
                  {new Date(g.starts_at).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </td>
                <td className="p-3">
                  <div className="font-medium text-gray-900">
                    {mapTeam.get(g.home_team_id) || t('noVenue')}
                  </div>
                  <div className="text-gray-500 text-xs">{t('vs')}</div>
                  <div className="font-medium text-gray-900">
                    {mapTeam.get(g.away_team_id) || t('noVenue')}
                  </div>
                </td>
                <td className="p-3 text-gray-600">{g.venue ?? t('noVenue')}</td>
                <td className="p-3">
                  <select
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${STATUS_COLORS[g.status] || 'bg-gray-100 text-gray-800'}`}
                    value={g.status}
                    onChange={e=>changeStatus(g.id, e.target.value)}
                  >
                    <option value="scheduled">{t('status.scheduled')}</option>
                    <option value="live">{t('status.live')}</option>
                    <option value="final">{t('status.final')}</option>
                    <option value="canceled">{t('status.canceled')}</option>
                  </select>
                </td>
                <td className="p-3">
                  <ScoreEditor
                    home={g.home_score}
                    away={g.away_score}
                    onSave={(hs,as)=>saveScore(g.id, hs, as)}
                  />
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteGame(g.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    {t('actions.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {games.length===0 && (
              <tr>
                <td className="p-8 text-center text-gray-500" colSpan={6}>
                  {t('empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreEditor({home, away, onSave}:{home:number; away:number; onSave:(hs:number,as:number)=>void}) {
  const [hs,setHs] = useState<number>(home);
  const [as,setAs] = useState<number>(away);
  const [editing, setEditing] = useState(false);
  
  useEffect(()=>{ setHs(home); setAs(away); }, [home,away]);
  
  const handleSave = () => {
    onSave(hs,as);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
        onClick={() => setEditing(true)}
      >
        <span className="font-bold text-lg">{hs}</span>
        <span className="text-gray-400">-</span>
        <span className="font-bold text-lg">{as}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input 
        type="number" 
        className="border border-gray-300 p-1 w-14 rounded text-center focus:ring-2 focus:ring-blue-500" 
        value={hs} 
        onChange={e=>setHs(Number(e.target.value))}
        min="0"
      />
      <span className="px-1 text-gray-400">-</span>
      <input 
        type="number" 
        className="border border-gray-300 p-1 w-14 rounded text-center focus:ring-2 focus:ring-blue-500" 
        value={as} 
        onChange={e=>setAs(Number(e.target.value))}
        min="0"
      />
      <button 
        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700" 
        onClick={handleSave}
      >
        ✓
      </button>
      <button 
        className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400" 
        onClick={() => { setHs(home); setAs(away); setEditing(false); }}
      >
        ✕
      </button>
    </div>
  );
}
