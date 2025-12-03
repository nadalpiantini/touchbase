import { getTranslations } from 'next-intl/server';

export default async function StudentDashboardPage() {
  const t = await getTranslations('student.dashboard');

  // TODO: Fetch student's classes and assignments
  // TODO: Display dashboard with modules, progress, etc.

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-6">
        {t('title')}
      </h1>
      <p className="text-[--color-tb-shadow]">
        Student dashboard - Coming soon
      </p>
    </div>
  );
}

