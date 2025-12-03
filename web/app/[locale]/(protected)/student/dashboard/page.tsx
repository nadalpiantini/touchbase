import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/auth/middleware-helpers';
import { Class } from '@/lib/types/education';
import { getUserProgress } from '@/lib/services/progress';
import { getUserXPSummary } from '@/lib/services/xp';
import { getStudentAssignments, type Assignment } from '@/lib/services/assignments';
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge, Button } from '@/components/ui';
import Link from 'next/link';

export default async function StudentDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('student.dashboard');
  const { locale } = await params;
  
  const s = await supabaseServer();
  const user = await requireStudent(s);

  // Fetch student's classes
  const { data: profile } = await s
    .from("touchbase_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .single();

  // Get classes where student is enrolled
  let classes: Class[] = [];
  if (profile?.default_org_id) {
    const { data: enrollments } = await s
      .from("touchbase_class_enrollments")
      .select("class_id, class:touchbase_classes(*)")
      .eq("student_id", user.id)
      .eq("org_id", profile.default_org_id);
    
    classes = (enrollments || [])
      .map((e: { class_id: string; class: Class | Class[] | null }) => {
        const classData = Array.isArray(e.class) ? e.class[0] : e.class;
        return classData;
      })
      .filter((c: Class | null | undefined): c is Class => c !== null && c !== undefined);
  }

  // Fetch progress
  const progress = await getUserProgress(s, user.id);
  const inProgress = progress.filter((p) => p.status === "in_progress");
  const completed = progress.filter((p) => p.status === "completed");

  // Fetch XP summary
  const xpSummary = await getUserXPSummary(s, user.id);

  // Fetch assignments
  const assignments = await getStudentAssignments(s, user.id);
  const now = new Date();
  const overdueAssignments = assignments.filter((a: Assignment) => new Date(a.due_date) < now);
  const dueSoonAssignments = assignments.filter(
    (a: Assignment) =>
      new Date(a.due_date) >= now &&
      new Date(a.due_date) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
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
            <CardTitle className="text-lg">{t('stats.level')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-red] mb-2">
              {xpSummary.level}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {xpSummary.totalXp} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-navy] mb-2">
              {inProgress.length}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {t('stats.modules')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.completed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-[--color-tb-red] mb-2">
              {completed.length}
            </div>
            <div className="text-sm font-sans text-[--color-tb-shadow]">
              {t('stats.modules')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      {classes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-display font-semibold text-[--color-tb-navy] mb-4">
            {t('myClasses')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem: Class) => (
              <Card key={classItem.id} className="hover:shadow-dugout transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm font-sans text-[--color-tb-shadow]">{classItem.grade_level}</p>
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
          <h2 className="text-2xl font-display font-semibold text-[--color-tb-navy] mb-4">
            {t('continueLearning')}
          </h2>
          <div className="space-y-4">
            {inProgress.slice(0, 5).map((prog) => (
              <Card key={prog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-[--color-tb-navy]">
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

      {/* Assignments Alert */}
      {(overdueAssignments.length > 0 || dueSoonAssignments.length > 0) && (
        <div className="mb-8">
          <Card className={overdueAssignments.length > 0 ? "border-[--color-tb-stitch]" : "border-[--color-tb-stitch]/50"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                    {overdueAssignments.length > 0
                      ? t('assignmentsAlert.overdue')
                      : t('assignmentsAlert.dueSoon')}
                  </h3>
                  <p className="text-sm font-sans text-[--color-tb-shadow]">
                    {overdueAssignments.length > 0
                      ? t('assignmentsAlert.overdueCount', { count: overdueAssignments.length })
                      : t('assignmentsAlert.dueSoonCount', { count: dueSoonAssignments.length })}
                  </p>
                </div>
                <Link href={`/${locale}/student/assignments`}>
                  <Button variant={overdueAssignments.length > 0 ? "primary" : "outline"}>
                    {t('viewAssignments')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-[--color-tb-navy] mb-4">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/${locale}/student/assignments`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('viewAssignments')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('viewAssignmentsDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/student/modules`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('browseModules')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('browseModulesDesc')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/student/skills`}>
            <Card className="hover:shadow-dugout transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <h3 className="font-display font-semibold text-[--color-tb-navy] mb-2">
                  {t('viewSkills')}
                </h3>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
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
