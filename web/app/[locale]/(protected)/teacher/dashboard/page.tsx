import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireTeacher } from '@/lib/auth/middleware-helpers';

export default async function TeacherDashboardPage() {
  const t = await getTranslations('teacher.dashboard');
  const s = supabaseServer();
  
  // Verify user has teacher role (redirects if not)
  const user = await requireTeacher(s);

  // TODO: Fetch teacher's classes
  // TODO: Display dashboard with classes, assignments, etc.

  return (
    <main className="min-h-screen bg-[--color-tb-bone]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-6">
          {t('title')}
        </h1>
        <p className="text-[--color-tb-shadow]">
          Teacher dashboard - Coming soon
        </p>
      </div>
    </main>
  );
}

