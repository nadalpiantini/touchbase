"use client";

import { useState } from "react";
import NewPlayerForm from "@/components/players/NewPlayerForm";
import PlayerRegistrationWizard from "@/components/players/PlayerRegistrationWizard";
import PlayersTable from "@/components/players/PlayersTable";
import { Button } from "@/components/ui";

export default function PlayersPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tb-navy">Jugadores</h1>
        <p className="text-tb-shadow mt-1">Gestiona los jugadores de tu organización</p>
      </div>
      
      {showWizard ? (
        <PlayerRegistrationWizard
          onComplete={() => {
            setShowWizard(false);
            window.location.reload();
          }}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <>
          <div className="bg-white border border-tb-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-tb-navy">Registrar nuevo jugador</h2>
              <Button onClick={() => setShowWizard(true)}>
                Registro Completo (Wizard)
              </Button>
            </div>
            <NewPlayerForm />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-tb-navy">Lista de jugadores</h2>
            <PlayersTable />
          </div>
        </>
      )}
    </main>
  );
}
