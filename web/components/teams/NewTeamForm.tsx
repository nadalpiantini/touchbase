"use client";
import { useState } from "react";

export default function NewTeamForm() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const json = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      setMsg(`⚠ ${json?.error || "No se pudo crear"}`);
    } else {
      setMsg("✅ Equipo creado");
      setName("");
      setTimeout(() => location.reload(), 500);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <input
        className="border border-[--color-tb-line] p-2 rounded-lg w-64 font-sans text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/50 focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition"
        placeholder="Nombre del equipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button 
        disabled={loading} 
        className="bg-[--color-tb-red] text-white px-4 py-2 rounded-xl font-display hover:bg-[--color-tb-stitch] shadow-dugout disabled:opacity-50 transition-all active:translate-y-[1px]"
      >
        {loading ? "Creando..." : "Crear equipo"}
      </button>
      {msg && <span className="text-sm font-sans">{msg}</span>}
    </form>
  );
}
