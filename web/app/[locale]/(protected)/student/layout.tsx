import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requireStudent } from "@/lib/auth/middleware-helpers";
import { ResponsiveNav } from "@/components/navigation/ResponsiveNav";
import SignOutButton from "@/components/navigation/SignOutButton";

export default async function StudentLayout({
  children
}: {
  children: ReactNode
}) {
  const s = await supabaseServer();
  const user = await requireStudent(s);
  const locale = await getLocale();

  const navItems = [
    { href: `/${locale}/student/dashboard`, label: "Dashboard" },
    { href: `/${locale}/student/classes`, label: "Classes" },
    { href: `/${locale}/student/modules`, label: "Modules" },
    { href: `/${locale}/student/assignments`, label: "Assignments" },
    { href: `/${locale}/student/progress`, label: "Progress" },
    { href: `/${locale}/student/skills`, label: "Skills" },
    { href: `/${locale}/student/badges`, label: "Badges" },
    { href: `/${locale}/student/leaderboard`, label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-tb-bone">
      <ResponsiveNav
        locale={locale}
        userRole="student"
        userEmail={user.email || ""}
        navItems={navItems}
        logoHref={`/${locale}/student/dashboard`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-end">
          <SignOutButton />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

