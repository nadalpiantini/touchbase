import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getClassById, getClassStudents } from '@/lib/services/classes';
import { requireTeacher } from '@/lib/auth/middleware-helpers';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { CopyCodeButton } from '@/components/teacher/CopyCodeButton';

export default async function ClassDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('teacher.classes.detail');
  const s = supabaseServer();
  await requireTeacher(s);
  
  const { id } = await params;
  const classItem = await getClassById(s, id);

  if (!classItem) {
    notFound();
  }

  const students = await getClassStudents(s, id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-2">
          {classItem.name}
        </h1>
        {classItem.grade_level && (
          <p className="text-[--color-tb-shadow]">{classItem.grade_level}</p>
        )}
      </div>

      {/* Class Code */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('classCode')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="font-mono font-bold text-2xl text-[--color-tb-navy]">
              {classItem.code}
            </p>
            <CopyCodeButton code={classItem.code} />
          </div>
          <p className="text-sm text-[--color-tb-shadow] mt-2">
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
            <p className="text-[--color-tb-shadow]">{classItem.description}</p>
          </CardContent>
        </Card>
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
            <p className="text-[--color-tb-shadow] text-center py-8">
              {t('noStudents')}
            </p>
          ) : (
            <div className="space-y-2">
              {students.map(({ enrollment, student }) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border border-[--color-tb-line] rounded-lg"
                >
                  <div>
                    <p className="font-medium text-[--color-tb-navy]">
                      {student.full_name || student.email}
                    </p>
                    <p className="text-sm text-[--color-tb-shadow]">
                      {student.email}
                    </p>
                  </div>
                  <Badge variant="info">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
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

