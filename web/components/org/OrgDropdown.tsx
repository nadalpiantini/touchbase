"use client";
import { useEffect, useState } from "react";
import { LoadingSpinner, Alert } from '@/components/ui';

type Org = { org_id: string; org_name: string; role: string | null };

export default function OrgDropdown() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [current, setCurrent] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const [curRes, listRes] = await Promise.all([
          fetch("/api/orgs/current"),
          fetch("/api/orgs/list"),
        ]);
        const curJson = await curRes.json();
        const listJson = await listRes.json();
        
        if (!curRes.ok) throw new Error(curJson?.error || "Failed to load current org");
        if (!listRes.ok) throw new Error(listJson?.error || "Failed to load orgs");
        
        const cur = curJson.org?.[0] ?? null;
        setCurrent(cur);
        setOrgs(listJson.orgs ?? []);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const onSwitch = async (org_id: string) => {
    if (!org_id) return;
    setMsg(null);
    const res = await fetch("/api/orgs/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id }),
    });
    const json = await res.json();
    if (!res.ok) setMsg(`⚠ ${json?.error || "No se pudo cambiar"}`);
    else location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm font-sans text-tb-shadow">Cargando…</span>
      </div>
    );
  }

  if (msg) {
    return (
      <div className="flex items-center gap-2">
        <Alert variant="warning" className="py-1 px-2 text-xs">
          {msg}
        </Alert>
      </div>
    );
  }

  if (!orgs.length) {
    return <span className="text-sm font-sans text-tb-shadow">Sin organizaciones</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-select" className="sr-only">
        Seleccionar organización
      </label>
      <select
        id="org-select"
        className="border border-tb-line rounded-lg px-2 py-1 text-sm font-sans bg-white text-tb-navy focus:outline-none focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition"
        value={current?.org_id ?? ""}
        onChange={(e) => onSwitch(e.target.value)}
        aria-label="Seleccionar organización"
      >
        {orgs.map(o => (
          <option key={o.org_id} value={o.org_id}>
            {o.org_name} {o.role ? `· ${o.role}` : ""}
          </option>
        ))}
      </select>
      {msg && <span className="text-xs font-sans text-tb-stitch">{msg}</span>}
    </div>
  );
}
