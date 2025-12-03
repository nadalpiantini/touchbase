"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

type Player = { id: string; full_name: string; team_id: string | null; created_at: string };
type Team = { id: string; name: string };

export default function PlayersTable() {
  const t = useTranslations('players');
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
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t('errors.generic'));
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
      alert(json.error || t('errors.saveFailed'));
      return;
    }
    cancelEdit();
    load(teamFilter || undefined);
  };

  const softDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const res = await fetch("/api/players/soft-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || t('errors.deleteFailed'));
      return;
    }
    load(teamFilter || undefined);
  };

  if (loading) return <p className="text-gray-500">{t('loading')}</p>;
  if (err) return <p className="text-sm font-sans text-[--color-tb-stitch]">{t('error')} {err}</p>;
  if (!players.length) return <p className="text-gray-500">{t('empty')}</p>;

  const mapTeam = new Map(teams.map(t => [t.id, t.name]));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{t('filter.label')}</label>
        <select
          className="border border-[--color-tb-line] p-2 rounded bg-white font-sans"
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
        >
          <option value="">{t('filter.all')}</option>
          {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">{t('table.player')}</th>
              <th className="text-left p-3 font-medium text-gray-700">{t('table.team')}</th>
              <th className="text-left p-3 font-medium text-gray-700">{t('table.created')}</th>
              <th className="text-right p-3 font-medium text-gray-700">{t('table.actions')}</th>
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
                      <option value="">{t('noTeam')}</option>
                      {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
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
                        className="text-sm font-sans border border-[--color-tb-line] px-3 py-1 rounded-lg hover:bg-[--color-tb-beige] transition"
                        onClick={saveEdit}
                      >
                        {t('actions.save')}
                      </button>
                      <button
                        className="text-sm font-sans border border-[--color-tb-line] px-3 py-1 rounded-lg hover:bg-[--color-tb-beige] transition"
                        onClick={cancelEdit}
                      >
                        {t('actions.cancel')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-sm font-sans text-[--color-tb-navy] hover:text-[--color-tb-stitch] transition"
                        onClick={() => startEdit(p)}
                      >
                        {t('actions.edit')}
                      </button>
                      <button
                        className="text-sm font-sans text-[--color-tb-stitch] hover:text-[--color-tb-red] transition"
                        onClick={() => softDelete(p.id)}
                      >
                        {t('actions.delete')}
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
