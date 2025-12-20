"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

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
  canceled: "bg-tb-stitch/10 text-tb-stitch"
};

export default function GamesTable() {
  const t = useTranslations('games');
  const { addToast } = useToast();
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
    if (!r.ok) addToast((await r.json()).error||t('errors.generic'), 'error');
    else load();
  };

  const changeStatus = async (id:string, st:string) => {
    const r = await fetch("/api/games/status", {
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, status: st })
    });
    if (!r.ok) addToast((await r.json()).error||t('errors.generic'), 'error');
    else load();
  };

  const deleteGame = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const r = await fetch("/api/games/soft-delete", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ id })
    });
    if (!r.ok) addToast((await r.json()).error||t('errors.generic'), 'error');
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

      <Table className="font-sans">
        <TableHeader>
          <TableRow>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.date')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.match')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.venue')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.status')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.score')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map(g => (
            <TableRow key={g.id}>
              <TableCell className="font-sans text-tb-ink">
                {new Date(g.starts_at).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </TableCell>
              <TableCell>
                <div className="font-sans font-medium text-tb-ink">
                  {mapTeam.get(g.home_team_id) || t('noVenue')}
                </div>
                <div className="text-tb-shadow text-xs">{t('vs')}</div>
                <div className="font-sans font-medium text-tb-ink">
                  {mapTeam.get(g.away_team_id) || t('noVenue')}
                </div>
              </TableCell>
              <TableCell className="font-sans text-tb-shadow">{g.venue ?? t('noVenue')}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <ScoreEditor
                  home={g.home_score}
                  away={g.away_score}
                  onSave={(hs,as)=>saveScore(g.id, hs, as)}
                />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => deleteGame(g.id)}
                  className="text-tb-stitch hover:text-tb-red text-xs font-sans font-medium transition"
                >
                  {t('actions.delete')}
                </button>
              </TableCell>
            </TableRow>
          ))}
          {games.length===0 && (
            <TableRow>
              <TableCell className="p-8 text-center font-sans text-tb-shadow" colSpan={6}>
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
