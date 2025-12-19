"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge, LoadingSpinner, Alert } from "@/components/ui";
import { ModuleProgress } from "@/lib/types/education";
import { supabaseClient } from "@/lib/supabase/client";

export default function StudentProgressPage() {
  const t = useTranslations("student.progress");
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProgress = async () => {
    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      const res = await fetch("/api/progress");
      const json = await res.json();

      if (res.ok) {
        setProgress(json.progress || []);
      } else {
        setError(json.error || t('errors.loadFailed'));
      }
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

  const inProgress = progress.filter((p) => p.status === "in_progress");
  const completed = progress.filter((p) => p.status === "completed");
  const notStarted = progress.filter((p) => p.status === "not_started");

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Stats - Rule of Thirds grid */}
      <div className="thirds-stats-grid mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-navy]">
              {inProgress.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.completed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-red]">
              {completed.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[--color-tb-navy]">
              {progress.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.inProgress')}
          </h2>
          <div className="space-y-4">
            {inProgress.map((prog) => (
              <Card key={prog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      Module {prog.module_id.slice(0, 8)}...
                    </h3>
                    <Badge variant="info">{prog.completion_percentage}%</Badge>
                  </div>
                  <ProgressBar
                    value={prog.completion_percentage}
                    showLabel
                    color="primary"
                  />
                  {prog.score !== null && (
                    <div className="text-sm text-[--color-tb-shadow] mt-2">
                      {t('score')}: {prog.score}%
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.completed')}
          </h2>
          <div className="space-y-4">
            {completed.map((prog) => (
              <Card key={prog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      Module {prog.module_id.slice(0, 8)}...
                    </h3>
                    <Badge variant="success">100%</Badge>
                  </div>
                  <ProgressBar value={100} showLabel color="primary" />
                  {prog.score !== null && (
                    <div className="text-sm text-[--color-tb-shadow] mt-2">
                      {t('score')}: {prog.score}%
                    </div>
                  )}
                  {prog.completed_at && (
                    <div className="text-xs text-[--color-tb-shadow] mt-2">
                      {t('completedOn')}: {new Date(prog.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Not Started */}
      {notStarted.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
            {t('sections.notStarted')}
          </h2>
          <div className="space-y-4">
            {notStarted.map((prog) => (
              <Card key={prog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[--color-tb-navy]">
                      Module {prog.module_id.slice(0, 8)}...
                    </h3>
                    <Badge variant="info">{t('notStarted')}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {progress.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow]">{t('noProgress')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

