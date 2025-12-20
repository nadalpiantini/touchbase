"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { LoadingSpinner, Alert } from '@/components/ui';

type Team = { id: string; name: string; created_at: string };

export default function TeamsTable() {
  const t = useTranslations('teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/teams/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('errors.loadFailed'));
      setTeams(json.teams ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t('errors.generic'));
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (t: Team) => { 
    setEditId(t.id); 
    setEditName(t.name); 
  };
  
  const cancelEdit = () => { 
    setEditId(null); 
    setEditName(""); 
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    const res = await fetch("/api/teams/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, name: editName })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || t('errors.saveFailed'));
      return;
    }
    setEditId(null);
    setEditName("");
    load();
  };

  const softDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const res = await fetch("/api/teams/soft-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || t('errors.deleteFailed'));
      return;
    }
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  if (err) {
    return (
      <Alert variant="error" title={t('error')}>
        {err}
      </Alert>
    );
  }

  if (!teams.length) {
    return (
      <div className="bg-white border border-tb-line rounded-xl p-8 text-center shadow-sm">
        <p className="font-sans text-tb-shadow">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="border border-tb-line rounded-xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm font-sans">
        <thead className="bg-tb-beige border-b border-tb-line">
          <tr>
            <th className="text-left p-3 font-display font-semibold text-tb-navy">{t('table.name')}</th>
            <th className="text-left p-3 font-display font-semibold text-tb-navy">{t('table.created')}</th>
            <th className="text-right p-3 font-display font-semibold text-tb-navy">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id} className="border-b border-tb-line hover:bg-tb-bone transition">
              <td className="p-3">
                {editId === team.id ? (
                  <input
                    type="text"
                    className="border border-tb-line p-1 rounded-lg w-full font-sans text-tb-navy focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    aria-label={`Editar nombre del equipo ${team.name}`}
                  />
                ) : (
                  <span className="font-sans text-tb-ink">{team.name}</span>
                )}
              </td>
              <td className="p-3 font-sans text-tb-shadow">
                {new Date(team.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right space-x-2">
                {editId === team.id ? (
                  <>
                    <button
                      type="button"
                      className="text-sm font-sans border border-tb-line px-3 py-1 rounded-lg hover:bg-tb-beige transition"
                      onClick={saveEdit}
                      aria-label={`Guardar cambios para ${team.name}`}
                    >
                      {t('actions.save')}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-sans border border-tb-line px-3 py-1 rounded-lg hover:bg-tb-beige transition"
                      onClick={cancelEdit}
                      aria-label={`Cancelar edición de ${team.name}`}
                    >
                      {t('actions.cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                      onClick={() => startEdit(team)}
                      aria-label={`Editar ${team.name}`}
                    >
                      {t('actions.edit')}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-stitch hover:text-tb-red transition"
                      onClick={() => softDelete(team.id)}
                      aria-label={`Eliminar ${team.name}`}
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
  );
}
