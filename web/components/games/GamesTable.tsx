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
  scheduled: "bg-tb-navy/10 text-tb-navy",
  live: "bg-tb-stitch/10 text-tb-stitch",
  final: "bg-tb-beige text-tb-shadow",
  canceled: "bg-red-50 text-red-700"
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
        <label className="text-sm font-sans font-medium text-tb-navy">{t('filter.label')}</label>
        <select
          className="border border-tb-line rounded-lg p-2 font-sans text-tb-navy bg-white focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition"
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

      <div className="bg-white border border-tb-line rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm font-sans">
          <thead className="bg-tb-beige border-b border-tb-line">
            <tr>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.date')}</th>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.match')}</th>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.venue')}</th>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.status')}</th>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.score')}</th>
              <th className="p-3 text-left font-display font-semibold text-tb-navy">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {games.map(g => (
              <tr key={g.id} className="border-b border-tb-line hover:bg-tb-bone transition">
                <td className="p-3 font-sans text-tb-ink">
                  {new Date(g.starts_at).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </td>
                <td className="p-3">
                  <div className="font-sans font-medium text-tb-ink">
                    {mapTeam.get(g.home_team_id) || t('noVenue')}
                  </div>
                  <div className="text-tb-shadow text-xs">{t('vs')}</div>
                  <div className="font-sans font-medium text-tb-ink">
                    {mapTeam.get(g.away_team_id) || t('noVenue')}
                  </div>
                </td>
                <td className="p-3 font-sans text-tb-shadow">{g.venue ?? t('noVenue')}</td>
                <td className="p-3">
                  <select
                    className={`text-xs px-2 py-1 rounded-full border-0 font-sans font-medium ${STATUS_COLORS[g.status] || 'bg-tb-beige text-tb-shadow'}`}
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
                    className="text-tb-stitch hover:text-tb-red text-xs font-sans font-medium transition"
                  >
                    {t('actions.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {games.length===0 && (
              <tr>
                <td className="p-8 text-center font-sans text-tb-shadow" colSpan={6}>
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
        className="flex items-center gap-2 cursor-pointer hover:bg-tb-beige p-1 rounded-lg transition"
        onClick={() => setEditing(true)}
      >
        <span className="font-display font-bold text-lg text-tb-navy">{hs}</span>
        <span className="text-tb-shadow/50">-</span>
        <span className="font-display font-bold text-lg text-tb-navy">{as}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input 
        type="number" 
        className="border border-tb-line p-1 w-14 rounded-lg text-center font-sans text-tb-navy focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition" 
        value={hs} 
        onChange={e=>setHs(Number(e.target.value))}
        min="0"
      />
      <span className="px-1 text-tb-shadow/50">-</span>
      <input 
        type="number" 
        className="border border-tb-line p-1 w-14 rounded-lg text-center font-sans text-tb-navy focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition" 
        value={as} 
        onChange={e=>setAs(Number(e.target.value))}
        min="0"
      />
      <button 
        className="bg-tb-red text-white px-2 py-1 rounded-lg text-xs font-sans hover:bg-tb-stitch transition" 
        onClick={handleSave}
      >
        ✓
      </button>
      <button 
        className="bg-tb-line text-tb-shadow px-2 py-1 rounded-lg text-xs font-sans hover:bg-tb-shadow/20 transition" 
        onClick={() => { setHs(home); setAs(away); setEditing(false); }}
      >
        ✕
      </button>
    </div>
  );
}
