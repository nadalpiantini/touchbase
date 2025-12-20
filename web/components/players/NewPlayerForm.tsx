"use client";
import { useEffect, useState } from "react";
import { Alert, Input, Select, Button } from '@/components/ui';

type Team = { id: string; name: string };

export default function NewPlayerForm() {
  const [fullName, setFullName] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teams/list").then(async r => {
      const j = await r.json();
      if (r.ok) setTeams(j.teams ?? []);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/players/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, team_id: teamId || null })
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg(`${json?.error || "No se pudo crear"}`);
    } else {
      setMsg("Jugador creado exitosamente");
      setFullName("");
      setTeamId("");
      setTimeout(() => location.reload(), 500);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end" aria-label="Formulario de nuevo jugador">
      <div className="w-full sm:w-auto">
        <Input
          label="Nombre completo"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full sm:w-64"
          aria-required="true"
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select
          label="Equipo"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Sin equipo</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? "Creando jugador..." : "Crear jugador"}
      >
        {loading ? "Creando..." : "Crear jugador"}
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
