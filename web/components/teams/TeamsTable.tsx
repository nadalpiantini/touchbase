"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

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

  if (loading) return <p className="font-sans text-[--color-tb-shadow]">{t('loading')}</p>;
  if (err) return <p className="font-sans text-[--color-tb-stitch]">{t('error')} {err}</p>;
  if (!teams.length) return <p className="font-sans text-[--color-tb-shadow]">{t('empty')}</p>;

  return (
    <div className="border border-[--color-tb-line] rounded-xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm font-sans">
        <thead className="bg-[--color-tb-beige] border-b border-[--color-tb-line]">
          <tr>
            <th className="text-left p-3 font-display font-semibold text-[--color-tb-navy]">{t('table.name')}</th>
            <th className="text-left p-3 font-display font-semibold text-[--color-tb-navy]">{t('table.created')}</th>
            <th className="text-right p-3 font-display font-semibold text-[--color-tb-navy]">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id} className="border-b border-[--color-tb-line] hover:bg-[--color-tb-bone] transition">
              <td className="p-3">
                {editId === team.id ? (
                  <input
                    className="border border-[--color-tb-line] p-1 rounded-lg w-full font-sans text-[--color-tb-navy] focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  <span className="font-sans text-[--color-tb-ink]">{team.name}</span>
                )}
              </td>
              <td className="p-3 font-sans text-[--color-tb-shadow]">
                {new Date(team.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right space-x-2">
                {editId === team.id ? (
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
                      onClick={() => startEdit(team)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button
                      className="text-sm font-sans text-[--color-tb-stitch] hover:text-[--color-tb-red] transition"
                      onClick={() => softDelete(team.id)}
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
