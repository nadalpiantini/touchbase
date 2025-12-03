"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LoadingSpinner, Alert } from "@/components/ui";
import { supabaseClient } from "@/lib/supabase/client";
import { getStudentAssignments } from "@/lib/services/assignments";
import type { Assignment } from "@/lib/services/assignments";

export default function StudentAssignmentsPage() {
  const t = useTranslations("student.assignments");
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAssignments = async () => {
    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      const assignmentsData = await getStudentAssignments(supabase, user.id);
      setAssignments(assignmentsData);
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="error" title={t('errors.loadFailed')}>
          {error}
        </Alert>
      </div>
    );
  }

  const now = new Date();
  const overdue = assignments.filter((a) => new Date(a.due_date) < now);
  const dueSoon = assignments.filter(
    (a) =>
      new Date(a.due_date) >= now &&
      new Date(a.due_date) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  );
  const upcoming = assignments.filter(
    (a) => new Date(a.due_date) > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.overdue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-stitch]">
              {overdue.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.dueSoon')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {dueSoon.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-navy]">
              {assignments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.overdue')}
          </h2>
          <div className="space-y-4">
            {overdue.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      {assignment.title}
                    </h3>
                    <Badge variant="error">{t('overdue')}</Badge>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-[--color-tb-shadow] mb-2">
                      {assignment.description}
                    </p>
                  )}
                  <div className="text-sm text-[--color-tb-shadow] mb-4">
                    <p>{t('dueDate')}: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/student/modules/${assignment.module_id}`)}
                  >
                    {t('startModule')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.dueSoon')}
          </h2>
          <div className="space-y-4">
            {dueSoon.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      {assignment.title}
                    </h3>
                    <Badge variant="warning">{t('dueSoon')}</Badge>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-[--color-tb-shadow] mb-2">
                      {assignment.description}
                    </p>
                  )}
                  <div className="text-sm text-[--color-tb-shadow] mb-4">
                    <p>{t('dueDate')}: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/student/modules/${assignment.module_id}`)}
                  >
                    {t('startModule')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.upcoming')}
          </h2>
          <div className="space-y-4">
            {upcoming.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      {assignment.title}
                    </h3>
                    <Badge variant="info">{t('upcoming')}</Badge>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-[--color-tb-shadow] mb-2">
                      {assignment.description}
                    </p>
                  )}
                  <div className="text-sm text-[--color-tb-shadow] mb-4">
                    <p>{t('dueDate')}: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/student/modules/${assignment.module_id}`)}
                  >
                    {t('startModule')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow]">{t('noAssignments')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

