import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/auth/middleware-helpers';
import { getStudentClasses } from '@/lib/services/classes';
import { getUserProgress } from '@/lib/services/progress';
import { getUserXPSummary } from '@/lib/services/xp';
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge, Button } from '@/components/ui';
import Link from 'next/link';

export default async function StudentDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('student.dashboard');
  const { locale } = await params;
  
  const s = supabaseServer();
  const user = await requireStudent(s);

  // Fetch student's classes
  const { data: profile } = await s
    .from("touchbase_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .single();

  const classes = profile?.default_org_id
    ? await getStudentClasses(s, user.id, profile.default_org_id)
    : [];

  // Fetch progress
  const progress = await getUserProgress(s, user.id);
  const inProgress = progress.filter((p) => p.status === "in_progress");
  const completed = progress.filter((p) => p.status === "completed");

  // Fetch XP summary
  const xpSummary = await getUserXPSummary(s, user.id);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.level')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-red] mb-2">
              {xpSummary.level}
            </div>
            <div className="text-sm text-[--color-tb-shadow]">
              {xpSummary.totalXp} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-navy] mb-2">
              {inProgress.length}
            </div>
            <div className="text-sm text-[--color-tb-shadow]">
              {t('stats.modules')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.completed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-red] mb-2">
              {completed.length}
            </div>
            <div className="text-sm text-[--color-tb-shadow]">
              {t('stats.modules')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      {classes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('myClasses')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm text-[--color-tb-shadow]">{classItem.grade_level}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <Link href={`/${locale}/student/classes/${classItem.id}`}>
                    <Button variant="outline" className="w-full">
                      {t('viewClass')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Modules */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('continueLearning')}
          </h2>
          <div className="space-y-4">
            {inProgress.slice(0, 5).map((prog) => (
              <Card key={prog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      Module {prog.module_id.slice(0, 8)}...
                    </h3>
                    <Badge variant="info">
                      {prog.completion_percentage}%
                    </Badge>
                  </div>
                  <ProgressBar
                    value={prog.completion_percentage}
                    showLabel
                    color="primary"
                  />
                  <Link href={`/${locale}/student/modules/${prog.module_id}`}>
                    <Button variant="outline" className="mt-4 w-full">
                      {t('continue')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/${locale}/student/modules`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-[--color-tb-navy] mb-2">
                  {t('browseModules')}
                </h3>
                <p className="text-sm text-[--color-tb-shadow]">
                  {t('browseModulesDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/student/skills`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-[--color-tb-navy] mb-2">
                  {t('viewSkills')}
                </h3>
                <p className="text-sm text-[--color-tb-shadow]">
                  {t('viewSkillsDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
