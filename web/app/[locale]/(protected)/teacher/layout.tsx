import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { requireTeacher } from "@/lib/auth/middleware-helpers";
import Link from "next/link";

export default async function TeacherLayout({
  children
}: {
  children: ReactNode
}) {
  const s = await supabaseServer();
  await requireTeacher(s);
  const locale = await getLocale();

  const teacherNavItems = [
    { href: `/${locale}/teacher/dashboard`, label: "Dashboard" },
    { href: `/${locale}/teacher/classes`, label: "Classes" },
    { href: `/${locale}/teacher/modules`, label: "Modules" },
    { href: `/${locale}/teacher/analytics`, label: "Analytics" },
  ];

  return (
    <div>
      {/* Secondary navigation for teacher section */}
      <nav className="bg-tb-bone border-b border-tb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            {teacherNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-tb-navy hover:text-tb-stitch text-sm font-medium transition-colors"
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
