import { getTranslations } from 'next-intl/server';
import AIAssistant from '@/components/teacher/AIAssistant';

export default async function TeacherDashboardPage() {
  const t = await getTranslations('teacher.dashboard');

  // TODO: Fetch teacher's classes
  // TODO: Display dashboard with classes, assignments, etc.

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-6">
        {t('title')}
      </h1>
      <p className="text-[--color-tb-shadow]">
        Teacher dashboard - Coming soon
      </p>
    </div>
  );
}

