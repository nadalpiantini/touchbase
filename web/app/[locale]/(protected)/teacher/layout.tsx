import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requireTeacher } from "@/lib/auth/middleware-helpers";
import { ResponsiveNav } from "@/components/navigation/ResponsiveNav";
import SignOutButton from "@/components/navigation/SignOutButton";

export default async function TeacherLayout({
  children
}: {
  children: ReactNode
}) {
  const s = await supabaseServer();
  const user = await requireTeacher(s);
  const locale = await getLocale();

  const navItems = [
    { href: `/${locale}/teacher/dashboard`, label: "Dashboard" },
    { href: `/${locale}/teacher/classes`, label: "Classes" },
    { href: `/${locale}/teacher/modules`, label: "Modules" },
    { href: `/${locale}/teacher/analytics`, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-[--color-tb-bone]">
      <ResponsiveNav
        locale={locale}
        userRole="teacher"
        userEmail={user.email || ""}
        navItems={navItems}
        logoHref={`/${locale}/teacher/dashboard`}
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

