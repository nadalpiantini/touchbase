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
        className="border border-gray-300 p-2 rounded w-64"
        placeholder="Nombre del equipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button 
        disabled={loading} 
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear equipo"}
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </form>
  );
}
