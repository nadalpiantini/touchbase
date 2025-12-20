"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import {
  LoadingSpinner,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Input,
  Button,
} from '@/components/ui';
import { CSVExportButton } from '@/components/export/CSVExportButton';

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

  if (loading) return <p className="text-tb-shadow">{t('loading')}</p>;
  if (err) return <Alert variant="error">{t('error')} {err}</Alert>;
  if (!players.length) return <p className="text-tb-shadow">{t('empty')}</p>;

  const mapTeam = new Map(teams.map(t => [t.id, t.name]));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-tb-navy">{t('filter.label')}</label>
          <Select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="w-auto"
          >
            <option value="">{t('filter.all')}</option>
            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </Select>
        </div>
        <CSVExportButton type="players" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.player')}</TableHead>
            <TableHead>{t('table.team')}</TableHead>
            <TableHead>{t('table.created')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map(p => (
            <TableRow key={p.id}>
              <TableCell>
                {editId === p.id ? (
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="py-1"
                  />
                ) : (
                  p.full_name
                )}
              </TableCell>
              <TableCell>
                {editId === p.id ? (
                  <Select
                    value={editTeam}
                    onChange={e => setEditTeam(e.target.value)}
                    className="py-1"
                  >
                    <option value="">{t('noTeam')}</option>
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </Select>
                ) : (
                  <span className="text-tb-shadow">
                    {p.team_id ? (mapTeam.get(p.team_id) ?? "—") : "—"}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-tb-shadow">
                {new Date(p.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {editId === p.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveEdit}
                      aria-label={`Guardar cambios para ${p.full_name}`}
                    >
                      {t('actions.save')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      aria-label={`Cancelar edición de ${p.full_name}`}
                    >
                      {t('actions.cancel')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(p)}
                      aria-label={`Editar ${p.full_name}`}
                    >
                      {t('actions.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-tb-stitch hover:text-tb-red"
                      onClick={() => softDelete(p.id)}
                    >
                      {t('actions.delete')}
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
