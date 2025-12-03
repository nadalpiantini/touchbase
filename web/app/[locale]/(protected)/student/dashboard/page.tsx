import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function StudentDashboardPage() {
  const t = await getTranslations('student.dashboard');
  const s = supabaseServer();
  
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');

  // TODO: Verify user has student role
  // TODO: Fetch student's classes and assignments
  // TODO: Display dashboard with modules, progress, etc.

  return (
    <main className="min-h-screen bg-[--color-tb-bone]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-6">
          {t('title')}
        </h1>
        <p className="text-[--color-tb-shadow]">
          Student dashboard - Coming soon
        </p>
      </div>
    </main>
  );
}

