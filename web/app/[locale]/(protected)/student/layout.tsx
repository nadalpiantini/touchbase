import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { requireStudent } from "@/lib/auth/middleware-helpers";
import Link from "next/link";

export default async function StudentLayout({
  children
}: {
  children: ReactNode
}) {
  const s = await supabaseServer();
  await requireStudent(s);
  const locale = await getLocale();

  const studentNavItems = [
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
    <div>
      {/* Secondary navigation for student section */}
      <nav className="bg-tb-bone border-b border-tb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 h-12 items-center overflow-x-auto">
            {studentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-tb-navy hover:text-tb-stitch text-sm font-medium transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
