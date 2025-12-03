import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireTeacher } from '@/lib/auth/middleware-helpers';
import { getTeacherClasses } from '@/lib/services/classes';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import AIAssistantWrapper from '@/components/teacher/AIAssistantWrapper';

export default async function TeacherDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('teacher.dashboard');
  const { locale } = await params;
  
  const s = await supabaseServer();
  const user = await requireTeacher(s);

  // Fetch teacher's classes
  const { data: profile } = await s
    .from("touchbase_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .single();

  const classes = profile?.default_org_id
    ? await getTeacherClasses(s, user.id, profile.default_org_id)
    : [];

  // Get class stats
  const classStats = await Promise.all(
    classes.map(async (classItem) => {
      const { count: studentCount } = await s
        .from("touchbase_class_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("class_id", classItem.id);

      const { count: moduleCount } = await s
        .from("touchbase_modules")
        .select("*", { count: "exact", head: true })
        .eq("org_id", profile?.default_org_id);

      return {
        ...classItem,
        studentCount: studentCount || 0,
        moduleCount: moduleCount || 0,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.classes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-red] mb-2">
              {classes.length}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {t('stats.activeClasses')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.students')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-navy] mb-2">
              {classStats.reduce((sum, c) => sum + c.studentCount, 0)}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {t('stats.totalStudents')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.modules')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-red] mb-2">
              {classStats[0]?.moduleCount || 0}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {t('stats.availableModules')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold text-[--color-tb-navy]">
            {t('myClasses')}
          </h2>
          <Link href={`/${locale}/teacher/classes/create`}>
            <Button>{t('createClass')}</Button>
          </Link>
        </div>
        {classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-sm font-sans text-[--color-tb-shadow] mb-4">{t('noClasses')}</p>
              <Link href={`/${locale}/teacher/classes/create`}>
                <Button>{t('createFirstClass')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStats.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-dugout transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm font-sans text-[--color-tb-shadow]">{classItem.grade_level}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="info">
                      {classItem.studentCount} {t('students')}
                    </Badge>
                  </div>
                  <Link href={`/${locale}/teacher/classes/${classItem.id}`}>
                    <Button variant="outline" className="w-full">
                      {t('viewClass')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-[--color-tb-navy] mb-4">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={`/${locale}/teacher/modules`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('manageModules')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('manageModulesDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/teacher/analytics`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('viewAnalytics')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('viewAnalyticsDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/teacher/modules/create`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('createModule')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('createModuleDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* AI Assistant */}
        <AIAssistantWrapper />
    </div>
  );
}
