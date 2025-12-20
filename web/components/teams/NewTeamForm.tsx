"use client";
import { useState } from "react";
import { Input, Button, Alert } from '@/components/ui';

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
      setMsg(json?.error || "No se pudo crear");
    } else {
      setMsg("Equipo creado exitosamente");
      setName("");
      setTimeout(() => location.reload(), 500);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="w-full sm:w-auto">
        <Input
          label="Nombre del equipo"
          placeholder="Nombre del equipo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full sm:w-64"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear equipo"}
      </Button>
      {msg && (
        <div className="w-full">
          <Alert
            variant={msg.includes("exitosamente") ? "success" : "error"}
            className="text-sm"
          >
            {msg}
          </Alert>
        </div>
      )}
    </form>
  );
}
