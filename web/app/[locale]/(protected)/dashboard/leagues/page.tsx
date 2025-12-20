import LeagueStandings from "@/components/leagues/LeagueStandings";

export default async function LeaguesPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ligas y Clasificaciones</h1>
        <p className="text-gray-600 mt-1">
          Consulta las clasificaciones de los torneos activos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-tb-navy mb-4 font-display">
          Spring Championship 2025
        </h2>
        <LeagueStandings />
      </div>
    </main>
  );
}
