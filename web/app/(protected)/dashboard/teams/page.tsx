import NewTeamForm from "@/components/teams/NewTeamForm";
import TeamsTable from "@/components/teams/TeamsTable";

export default async function TeamsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
        <p className="text-gray-600 mt-1">Gestiona los equipos de tu organización</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Crear nuevo equipo</h2>
        <NewTeamForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Lista de equipos</h2>
        <TeamsTable />
      </div>
    </main>
  );
}
