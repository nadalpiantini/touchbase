import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CompanySignature } from "@/components/CompanySignature";
import { ResponsiveNav } from "@/components/navigation/ResponsiveNav";
import SignOutButton from "@/components/navigation/SignOutButton";

export default async function ProtectedLayout({
  children
}: {
  children: ReactNode
}) {
  const s = await supabaseServer();
  const { data: { user }, error: userError } = await s.auth.getUser();
  const locale = await getLocale();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user role from membership
  const { data: profile } = await s
    .from("touchbase_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .single();

  let userRole: string | undefined;
  if (profile?.default_org_id) {
    const { data: membership } = await s
      .from("touchbase_memberships")
      .select("role")
      .eq("org_id", profile.default_org_id)
      .eq("user_id", user.id)
      .single();
    userRole = membership?.role;
  }

  // Define navigation items with role-based visibility
  const navItems = [
    { href: `/${locale}/dashboard`, label: "Dashboard", roles: undefined }, // All roles
    { href: `/${locale}/dashboard/players`, label: "Jugadores", roles: ["owner", "admin", "coach"] },
    { href: `/${locale}/dashboard/teachers`, label: "Profesores", roles: ["owner", "admin"] },
    { href: `/${locale}/dashboard/schedules`, label: "Horarios", roles: ["owner", "admin", "coach", "teacher"] },
    { href: `/${locale}/dashboard/placement-tests`, label: "Pruebas", roles: ["owner", "admin", "teacher"] },
    { href: `/${locale}/dashboard/budgeting`, label: "Presupuesto", roles: ["owner", "admin"] },
    { href: `/${locale}/dashboard/reports`, label: "Reportes", roles: ["owner", "admin", "teacher"] },
    { href: `/${locale}/dashboard/student-life`, label: "Vida Estudiantil", roles: ["owner", "admin", "teacher", "student"] },
    { href: `/${locale}/dashboard/teams`, label: "Equipos", roles: ["owner", "admin", "coach"] },
    { href: `/${locale}/dashboard/games`, label: "Partidos", roles: ["owner", "admin", "coach"] },
    { href: `/${locale}/dashboard/recycle`, label: "Papelera", roles: ["owner", "admin"] },
    { href: `/${locale}/dashboard/audit`, label: "Auditoría", roles: ["owner", "admin"] },
  ];

  return (
    <div className="min-h-screen bg-[--color-tb-bone]">
      <ResponsiveNav
        locale={locale}
        userRole={userRole}
        userEmail={user.email || ""}
        navItems={navItems}
        logoHref={`/${locale}/dashboard`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-end">
          <SignOutButton />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <CompanySignature />
    </div>
  );
}