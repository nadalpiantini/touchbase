import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrgDropdown from "@/components/org/OrgDropdown";

export default async function ProtectedLayout({
  children
}: {
  children: ReactNode
}) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                TouchBase
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/dashboard/teams" className="text-sm text-gray-700 hover:text-gray-900">
                  Equipos
                </Link>
                <Link href="/dashboard/players" className="text-sm text-gray-700 hover:text-gray-900">
                  Jugadores
                </Link>
                <Link href="/dashboard/games" className="text-sm text-gray-700 hover:text-gray-900">
                  Partidos
                </Link>
                <Link href="/dashboard/recycle" className="text-sm text-gray-700 hover:text-gray-900">
                  Papelera
                </Link>
                <Link href="/dashboard/audit" className="text-sm text-gray-700 hover:text-gray-900">
                  Auditoría
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <OrgDropdown />
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}