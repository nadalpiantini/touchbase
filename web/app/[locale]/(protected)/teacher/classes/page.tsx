import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getTeacherClasses } from '@/lib/services/classes';
import { getUserWithRole } from '@/lib/auth/middleware-helpers';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CSVExportButton } from '@/components/export/CSVExportButton';
import Link from 'next/link';

export default async function TeacherClassesPage() {
  const t = await getTranslations('teacher.classes');
  const s = await supabaseServer();
  const { user, orgId } = await getUserWithRole(s);

  const classes = orgId ? await getTeacherClasses(s, user.id, orgId) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy]">
          {t('title')}
        </h1>
        <div className="flex items-center gap-3">
          {classes.length > 0 && <CSVExportButton type="classes" />}
          <Link href="/teacher/classes/create">
            <Button>
              {t('createClass')}
            </Button>
          </Link>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[--color-tb-shadow] mb-4">{t('noClasses')}</p>
            <Link href="/teacher/classes/create">
              <Button>{t('createFirstClass')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-dugout transition-shadow">
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
                {classItem.grade_level && (
                  <p className="text-sm text-[--color-tb-shadow]">{classItem.grade_level}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-xs text-[--color-tb-shadow] mb-1">Class Code</p>
                  <p className="font-mono font-bold text-lg text-[--color-tb-navy]">
                    {classItem.code}
                  </p>
                </div>
                {classItem.description && (
                  <p className="text-sm text-[--color-tb-shadow] mb-4 line-clamp-2">
                    {classItem.description}
                  </p>
                )}
                <Link href={`/teacher/classes/${classItem.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('viewClass')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

