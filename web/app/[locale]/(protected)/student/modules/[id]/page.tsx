"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Button, ProgressBar } from '@/components/ui';
import { Module, ModuleStep, ModuleProgress } from '@/lib/types/education';
import AICoach from '@/components/student/AICoach';

export default function ModulePlayerPage() {
  const t = useTranslations('student.modules');
  const params = useParams();
  const moduleId = params.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [steps, setSteps] = useState<ModuleStep[]>([]);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    loadModule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const loadModule = async () => {
    try {
      // Load module with steps
      const res = await fetch(`/api/modules/${moduleId}`);
      const json = await res.json();
      if (res.ok) {
        setModule(json.module);
        setSteps(json.steps || []);
      }

      // Load or start progress
      const progressRes = await fetch(`/api/progress?moduleId=${moduleId}`);
      const progressJson = await progressRes.json();
      if (progressRes.ok && progressJson.progress) {
        setProgress(progressJson.progress);
        // Find first incomplete step
        const firstIncomplete = progressJson.progress.step_progress?.findIndex(
          (s: { completed: boolean }) => !s.completed
        );
        if (firstIncomplete !== undefined && firstIncomplete >= 0) {
          setCurrentStepIndex(firstIncomplete);
        }
      } else {
        // Start progress
        const startRes = await fetch("/api/progress/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId }),
        });
        const startJson = await startRes.json();
        if (startRes.ok) {
          setProgress(startJson.progress);
        }
      }
    } catch (e) {
      console.error("Failed to load module:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async () => {
    if (!progress) return;

    const currentStep = steps[currentStepIndex];
    let stepData: any = { completed: true };

    // For quiz steps, include the answer and score
    if (currentStep.step_type === "quiz") {
      const quizData = currentStep.content_data as any;
      const selectedAnswer = quizAnswers[currentStepIndex];
      const isCorrect = selectedAnswer === quizData?.correctAnswer;
      const quizScore = isCorrect ? 100 : 0;

      stepData = {
        completed: true,
        quizScore,
        selectedAnswer,
        isCorrect,
      };
    }

    // For scenario steps, include the choice
    if (currentStep.step_type === "scenario") {
      const selectedChoice = quizAnswers[currentStepIndex];
      stepData = {
        completed: true,
        scenarioChoice: selectedChoice,
      };
    }

    await fetch("/api/progress/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId,
        stepIndex: currentStepIndex,
        stepData,
      }),
    });

    // Reset quiz result state
    setShowQuizResult(false);

    // Move to next step
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }

    // Reload progress
    await loadModule();
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (!module || steps.length === 0) {
    return <div className="text-center py-12">{t('notFound')}</div>;
  }

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-2">
          {module.title}
        </h1>
        {module.description && (
          <p className="text-[--color-tb-shadow]">{module.description}</p>
        )}
      </div>

      {/* Progress */}
      {progress && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <ProgressBar
              value={progress.completion_percentage}
              showLabel
              color="primary"
            />
            <p className="text-sm text-[--color-tb-shadow] mt-2 text-center">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('step')} {currentStepIndex + 1}: {currentStep.step_type}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep.step_type === "content" && (
            <div>
              <p className="text-[--color-tb-navy] mb-4">
                {(currentStep.content_data as any)?.text || "Content step"}
              </p>
              {(currentStep.content_data as any)?.mediaUrl && (
                <div className="mb-4">
                  <img
                    src={(currentStep.content_data as any).mediaUrl}
                    alt="Module content"
                    className="rounded-lg w-full"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep.step_type === "quiz" && (
            <div>
              <p className="font-semibold text-[--color-tb-navy] mb-4">
                {(currentStep.content_data as any)?.question}
              </p>
              {showQuizResult && (
                <div className="mb-4 p-4 bg-[--color-tb-beige] rounded-lg">
                  <p className="text-sm text-[--color-tb-navy]">
                    {quizAnswers[currentStepIndex] === (currentStep.content_data as any)?.correctAnswer
                      ? t('quiz.correct')
                      : t('quiz.incorrect')}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {((currentStep.content_data as any)?.options || []).map(
                  (option: string, idx: number) => {
                    const isSelected = quizAnswers[currentStepIndex] === idx;
                    const isCorrect = idx === (currentStep.content_data as any)?.correctAnswer;
                    const showResult = showQuizResult;

                    return (
                      <Button
                        key={idx}
                        variant={isSelected ? "primary" : "outline"}
                        className={`w-full text-left ${
                          showResult && isCorrect ? "bg-green-100 border-green-500" : ""
                        } ${
                          showResult && isSelected && !isCorrect ? "bg-red-100 border-red-500" : ""
                        }`}
                        onClick={() => {
                          if (!showResult) {
                            setQuizAnswers({ ...quizAnswers, [currentStepIndex]: idx });
                            setShowQuizResult(true);
                          }
                        }}
                        disabled={showResult}
                      >
                        {option}
                      </Button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {currentStep.step_type === "scenario" && (
            <div>
              <p className="font-semibold text-[--color-tb-navy] mb-4">
                {(currentStep.content_data as any)?.prompt}
              </p>
              <div className="space-y-2">
                {((currentStep.content_data as any)?.options || []).map(
                  (option: any, idx: number) => {
                    const isSelected = quizAnswers[currentStepIndex] === idx;
                    return (
                      <Button
                        key={idx}
                        variant={isSelected ? "primary" : "outline"}
                        className="w-full text-left"
                        onClick={() => {
                          setQuizAnswers({ ...quizAnswers, [currentStepIndex]: idx });
                        }}
                      >
                        <div>
                          <div className="font-medium">{option.text}</div>
                          {option.consequence && (
                            <div className="text-xs text-[--color-tb-shadow] mt-1">
                              {option.consequence}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                {t('previous')}
              </Button>
            )}
            <div className="flex-1" />
            {!isLastStep && (
              <Button
                onClick={handleStepComplete}
                disabled={
                  currentStep.step_type === "quiz" &&
                  !showQuizResult &&
                  quizAnswers[currentStepIndex] === undefined
                }
              >
                {t('next')}
              </Button>
            )}
            {isLastStep && (
              <Button
                onClick={handleStepComplete}
                disabled={
                  currentStep.step_type === "quiz" &&
                  !showQuizResult &&
                  quizAnswers[currentStepIndex] === undefined
                }
              >
                {t('complete')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Coach */}
      {module && steps[currentStepIndex] && (
        <AICoach
          moduleTitle={module.title}
          stepContent={JSON.stringify(steps[currentStepIndex].content_data)}
          question={
            steps[currentStepIndex].step_type === "quiz"
              ? (steps[currentStepIndex].content_data as any)?.question
              : undefined
          }
        />
      )}
    </div>
  );
}

