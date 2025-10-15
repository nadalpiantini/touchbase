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

  if (loading) return <p className="text-gray-500">{t('loading')}</p>;
  if (err) return <p className="text-red-600">{t('error')} {err}</p>;
  if (!teams.length) return <p className="text-gray-500">{t('empty')}</p>;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-3 font-medium text-gray-700">{t('table.name')}</th>
            <th className="text-left p-3 font-medium text-gray-700">{t('table.created')}</th>
            <th className="text-right p-3 font-medium text-gray-700">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                {editId === team.id ? (
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
                  team.name
                )}
              </td>
              <td className="p-3 text-gray-600">
                {new Date(team.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right space-x-2">
                {editId === team.id ? (
                  <>
                    <button
                      className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      onClick={saveEdit}
                    >
                      {t('actions.save')}
                    </button>
                    <button
                      className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      onClick={cancelEdit}
                    >
                      {t('actions.cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => startEdit(team)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button
                      className="text-sm text-red-600 hover:text-red-800"
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
