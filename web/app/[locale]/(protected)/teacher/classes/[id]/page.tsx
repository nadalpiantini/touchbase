import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getClass, getClassEnrollments } from '@/lib/services/classes';
import { getClassAssignments } from '@/lib/services/assignments';
import { requireTeacher } from '@/lib/auth/middleware-helpers';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { CopyCodeButton } from '@/components/teacher/CopyCodeButton';
import { AttendanceMarking } from '@/components/attendance/AttendanceMarking';
import Link from 'next/link';

export default async function ClassDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('teacher.classes.detail');
  const s = await supabaseServer();
  const user = await requireTeacher(s);
  
  const { id } = await params;

  // Graceful fallback for missing tables
  let classItem: Awaited<ReturnType<typeof getClass>> | null = null;
  let students: Awaited<ReturnType<typeof getClassEnrollments>> = [];
  let assignments: Awaited<ReturnType<typeof getClassAssignments>> = [];
  let avgProgress = 0;

  try {
    classItem = await getClass(s, id);
  } catch {
    // Table may not exist yet
  }

  if (!classItem) {
    notFound();
  }

  try {
    students = await getClassEnrollments(s, id);
  } catch {
    students = [];
  }

  try {
    assignments = await getClassAssignments(s, id, user.id);
  } catch {
    assignments = [];
  }

  // Calculate average progress for students in this class
  if (students.length > 0) {
    try {
      const { data: progressData } = await s
        .from("touchbase_progress")
        .select("completion_percentage")
        .in(
          "user_id",
          students.map((st) => st.student_id)
        );

      if (progressData && progressData.length > 0) {
        const totalProgress = progressData.reduce(
          (sum, p) => sum + (p.completion_percentage || 0),
          0
        );
        avgProgress = Math.round(totalProgress / progressData.length);
      }
    } catch {
      // Progress table may not exist
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-tb-navy mb-2">
          {classItem.name}
        </h1>
        {classItem.level && (
          <p className="text-tb-shadow">{classItem.level}</p>
        )}
      </div>

      {/* Class Code */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('classCode')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="font-mono font-bold text-2xl text-tb-navy">
              {classItem.code}
            </p>
            {classItem.code && <CopyCodeButton code={classItem.code} />}
          </div>
          <p className="text-sm text-tb-shadow mt-2">
            {t('codeDescription')}
          </p>
        </CardContent>
      </Card>

      {/* Description */}
      {classItem.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-tb-shadow">{classItem.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-6 flex gap-4">
        <Link href={`/teacher/classes/${classItem.id}/assignments`}>
          <Button>{t('manageAssignments')}</Button>
        </Link>
        <Link href={`/teacher/classes/${classItem.id}/modules`}>
          <Button variant="outline">{t('manageModules')}</Button>
        </Link>
        <Link href={`/teacher/classes/${classItem.id}/attendance`}>
          <Button variant="outline">Attendance Analytics</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-tb-shadow mb-1">{t('totalStudents')}</p>
            <p className="text-3xl font-display font-bold text-tb-navy">
              {students.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-tb-shadow mb-1">{t('assignments')}</p>
            <p className="text-3xl font-display font-bold text-tb-navy">{assignments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-tb-shadow mb-1">{t('avgProgress')}</p>
            <p className="text-3xl font-display font-bold text-tb-navy">
              {avgProgress}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Marking */}
      {students.length > 0 && (
        <div className="mb-6">
          <AttendanceMarking
            classId={id}
            students={students
              .filter(s => s.student)
              .map(({ student }) => ({
                id: student!.id,
                full_name: student!.full_name || student!.email || '',
                email: student!.email || '',
              }))}
          />
        </div>
      )}

      {/* Students */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('students')} ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-tb-shadow mb-4">{t('noStudents')}</p>
              <p className="text-sm text-tb-shadow">
                {t('shareCode')} <span className="font-mono font-bold text-tb-red">{classItem.code}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {students
                .filter(s => s.student && s.enrollment)
                .map(({ enrollment, student }) => (
                  <div
                    key={enrollment!.id}
                    className="flex items-center justify-between p-3 border border-tb-line rounded-lg hover:bg-tb-bone transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tb-red/10 flex items-center justify-center">
                        <span className="text-tb-red font-semibold">
                          {(student!.full_name || student!.email || '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-tb-navy">
                          {student!.full_name || student!.email}
                        </p>
                        <p className="text-sm text-tb-shadow">
                          {student!.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="info">
                      {new Date(enrollment!.enrolled_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

