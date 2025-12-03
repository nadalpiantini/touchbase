"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, ProgressBar } from "@/components/ui";
import { Class, Module } from "@/lib/types/education";
import { supabaseClient } from "@/lib/supabase/client";

export default function StudentClassDetailPage() {
  const t = useTranslations("student.classes");
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classItem, setClassItem] = useState<Class | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, { completion_percentage: number; status: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClass();
  }, [classId]);

  const loadClass = async () => {
    try {
      // Load class
      const classRes = await fetch(`/api/classes/${classId}`);
      const classJson = await classRes.json();

      if (classRes.ok) {
        setClassItem(classJson.class);
      } else {
        setError(classJson.error || t('errors.loadFailed'));
        return;
      }

      // Load modules assigned to this class
      const modulesRes = await fetch(`/api/modules/list?classId=${classId}`);
      const modulesJson = await modulesRes.json();

      if (modulesRes.ok) {
        setModules(modulesJson.modules || []);
      } else {
        console.error("Failed to load modules:", modulesJson.error);
      }

      // Load progress
      const progressRes = await fetch("/api/progress");
      const progressJson = await progressRes.json();

      if (progressRes.ok) {
        const progressMap: Record<string, { completion_percentage: number; status: string }> = {};
        (progressJson.progress || []).forEach((p: any) => {
          progressMap[p.module_id] = {
            completion_percentage: p.completion_percentage || 0,
            status: p.status,
          };
        });
        setProgress(progressMap);
      }
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error || !classItem) {
    return (
      <div className="text-center py-12">
        <p className="text-[--color-tb-stitch] mb-4">{error || t('errors.notFound')}</p>;
        <Button onClick={() => router.push("/student/classes")}>
          {t('backToClasses')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/student/classes")} className="mb-4">
          {t('backToClasses')}
        </Button>
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-2">
          {classItem.name}
        </h1>
        {classItem.description && (
          <p className="text-[--color-tb-shadow]">{classItem.description}</p>
        )}
        {classItem.grade_level && (
          <Badge variant="info" className="mt-2">{classItem.grade_level}</Badge>
        )}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('assignedModules')}
        </h2>
        {modules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[--color-tb-shadow]">{t('noModules')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => {
              const moduleProgress = progress[module.id];
              const isCompleted = moduleProgress?.status === "completed";
              const isInProgress = moduleProgress?.status === "in_progress";

              return (
                <Card key={module.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[--color-tb-navy]">{module.title}</h3>
                      {module.difficulty && (
                        <Badge variant="info">{module.difficulty}</Badge>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-[--color-tb-shadow] mb-4">
                        {module.description}
                      </p>
                    )}
                    {moduleProgress && (
                      <div className="mb-4">
                        <ProgressBar
                          value={moduleProgress.completion_percentage}
                          showLabel
                          color="primary"
                        />
                      </div>
                    )}
                    <Button
                      onClick={() => router.push(`/student/modules/${module.id}`)}
                      variant={isCompleted ? "outline" : "primary"}
                      className="w-full"
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
    </div>
  );
}

