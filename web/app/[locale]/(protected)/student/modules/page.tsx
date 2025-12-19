"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, ProgressBar, LoadingSpinner, Alert } from "@/components/ui";
import { Module } from "@/lib/types/education";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";

export default function StudentModulesPage() {
  const t = useTranslations("student.modules");
  const router = useRouter();
  const { currentOrg } = useCurrentOrg();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, { completion_percentage: number; status: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadModules();
    }
  }, [currentOrg]);

  const loadModules = async () => {
    if (!currentOrg?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Load modules
      const modulesRes = await fetch(`/api/modules/list?orgId=${currentOrg.id}`);
      const modulesJson = await modulesRes.json();

      if (modulesRes.ok) {
        setModules(modulesJson.modules || []);

        // Load progress for all modules
        const progressRes = await fetch("/api/progress");
        const progressJson = await progressRes.json();

        if (progressRes.ok) {
          const progressMap: Record<string, { completion_percentage: number; status: string }> = {};
          (progressJson.progress || []).forEach((p: { module_id: string; completion_percentage?: number; status: string }) => {
            progressMap[p.module_id] = {
              completion_percentage: p.completion_percentage || 0,
              status: p.status,
            };
          });
          setProgress(progressMap);
        }
      } else {
        setError(modulesJson.error || t('errors.loadFailed'));
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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow] mb-4">{t('noModules')}</p>
            <p className="text-sm text-[--color-tb-shadow]">{t('noModulesDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="thirds-card-grid">
          {modules.map((module) => {
            const moduleProgress = progress[module.id];
            const isCompleted = moduleProgress?.status === "completed";
            const isInProgress = moduleProgress?.status === "in_progress";

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex-1">{module.title}</CardTitle>
                    {module.difficulty && (
                      <Badge variant="info" className="ml-2">
                        {module.difficulty}
                      </Badge>
                    )}
                  </div>
                  {module.description && (
                    <p className="text-sm text-[--color-tb-shadow] mt-2">
                      {module.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {moduleProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-2">
                        <span>{t('progress')}</span>
                        <span>{moduleProgress.completion_percentage}%</span>
                      </div>
                      <ProgressBar
                        value={moduleProgress.completion_percentage}
                        showLabel={false}
                        color="primary"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-[--color-tb-shadow] mb-4">
                    {module.duration_minutes && (
                      <span>{module.duration_minutes} {t('minutes')}</span>
                    )}
                    {module.skills && module.skills.length > 0 && (
                      <span>{module.skills.length} {t('skills')}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => router.push(`/student/modules/${module.id}`)}
                    className="w-full"
                    variant={isCompleted ? "outline" : "primary"}
                  >
                    {isCompleted
                      ? t('review')
                      : isInProgress
                      ? t('continue')
                      : t('start')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

