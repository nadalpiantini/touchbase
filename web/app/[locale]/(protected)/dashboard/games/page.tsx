import GamesNewForm from "@/components/games/GamesNewForm";
import GamesTable from "@/components/games/GamesTable";

export default async function GamesPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partidos</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los partidos de tu organización
        </p>
      </div>
      <GamesNewForm />
      <GamesTable />
    </main>
  );
}
