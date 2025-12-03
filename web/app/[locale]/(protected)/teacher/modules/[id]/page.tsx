"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Module, ModuleStep, StepType } from "@/lib/types/education";

export default function ModuleDetailPage() {
  const t = useTranslations("teacher.modules.detail");
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [steps, setSteps] = useState<ModuleStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const res = await fetch(`/api/modules/${moduleId}`);
      const json = await res.json();
      if (res.ok) {
        setModule(json.module);
        setSteps(json.steps || []);
      } else {
        setError(json.error || t('errors.fetchFailed'));
      }
    } catch (e: any) {
      setError(e.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    router.push(`/teacher/modules/${moduleId}/steps/create`);
  };

  const handleEditStep = (stepId: string) => {
    router.push(`/teacher/modules/${moduleId}/steps/${stepId}/edit`);
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error || !module) {
    return <div className="text-center py-12 text-red-600">{error || t('notFound')}</div>;
  }

  const stepTypeLabels: Record<StepType, string> = {
    content: t('stepTypeContent'),
    quiz: t('stepTypeQuiz'),
    scenario: t('stepTypeScenario'),
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-display font-bold text-[--color-tb-navy]">
            {module.title}
          </h1>
          <Badge variant="info">{module.difficulty}</Badge>
        </div>
        {module.description && (
          <p className="text-[--color-tb-shadow]">{module.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-[--color-tb-shadow]">
          <span>{module.duration_minutes} {t('minutes')}</span>
          {module.skills && module.skills.length > 0 && (
            <div className="flex gap-2">
              {module.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-[--color-tb-beige] text-[--color-tb-navy] rounded">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Steps Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('stepsTitle')} ({steps.length})</CardTitle>
            <Button onClick={handleAddStep}>{t('addStep')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[--color-tb-shadow] mb-4">{t('noSteps')}</p>
              <Button onClick={handleAddStep} variant="secondary">
                {t('addFirstStep')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-4 bg-[--color-tb-beige]/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[--color-tb-red] text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[--color-tb-navy]">
                        {stepTypeLabels[step.step_type]}
                      </div>
                      <div className="text-sm text-[--color-tb-shadow]">
                        {t('order')}: {step.order_index}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStep(step.id)}
                  >
                    {t('edit')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

