import NewPlayerForm from "@/components/players/NewPlayerForm";
import PlayersTable from "@/components/players/PlayersTable";

export default async function PlayersPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jugadores</h1>
        <p className="text-gray-600 mt-1">Gestiona los jugadores de tu organización</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Registrar nuevo jugador</h2>
        <NewPlayerForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Lista de jugadores</h2>
        <PlayersTable />
      </div>
    </main>
  );
}
