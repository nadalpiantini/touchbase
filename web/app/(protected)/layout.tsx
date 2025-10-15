import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-[--color-tb-bone]">
      <header className="bg-[--color-tb-navy] text-white border-b border-[--color-tb-navy]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src="/touchbase-logo.png"
                  alt="TouchBase"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-display font-bold tracking-wide">TOUCHBASE</span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm hover:text-[--color-tb-beige] transition">
                  Dashboard
                </Link>
                <Link href="/dashboard/teams" className="text-sm hover:text-[--color-tb-beige] transition">
                  Equipos
                </Link>
                <Link href="/dashboard/players" className="text-sm hover:text-[--color-tb-beige] transition">
                  Jugadores
                </Link>
                <Link href="/dashboard/games" className="text-sm hover:text-[--color-tb-beige] transition">
                  Partidos
                </Link>
                <Link href="/dashboard/recycle" className="text-sm hover:text-[--color-tb-beige] transition">
                  Papelera
                </Link>
                <Link href="/dashboard/audit" className="text-sm hover:text-[--color-tb-beige] transition">
                  Auditoría
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <OrgDropdown />
              <span className="text-sm text-[--color-tb-bone]">{user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm hover:bg-white/20 border border-white/20 px-3 py-2 rounded-lg transition"
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