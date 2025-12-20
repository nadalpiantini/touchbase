"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Button, ProgressBar, Badge } from '@/components/ui';
import { Module, ModuleStep, ModuleProgress, StepProgress, ContentStepData, QuizStepData, ScenarioStepData } from '@/lib/types/education';

// Lazy load AICoach component for code splitting
const AICoach = lazy(() => import('@/components/student/AICoach'));

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
    } catch (err: unknown) {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async () => {
    if (!progress) return;

    const currentStep = steps[currentStepIndex];
    let stepData: Partial<StepProgress> = { completed: true };

    // For quiz steps, include the answer and score
    if (currentStep.step_type === "quiz") {
      const quizData = currentStep.content_data as QuizStepData;
      const selectedAnswer = quizAnswers[currentStepIndex];
      const isCorrect = selectedAnswer === quizData?.correctIndex;
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
        <h1 className="text-3xl font-display font-bold text-tb-navy mb-2">
          {module.title}
        </h1>
        {module.description && (
          <p className="text-tb-shadow">{module.description}</p>
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
            <p className="text-sm text-tb-shadow mt-2 text-center">
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
              <p className="text-tb-navy mb-4">
                {(currentStep.content_data as ContentStepData)?.text || "Content step"}
              </p>
              {(currentStep.content_data as ContentStepData)?.mediaUrl && (
                <div className="mb-4">
                  <img
                    src={(currentStep.content_data as ContentStepData).mediaUrl!}
                    alt="Module content"
                    className="rounded-lg w-full"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep.step_type === "quiz" && (
            <div>
              <div className="mb-4">
                <p className="font-semibold text-tb-navy mb-2 text-lg">
                  {(currentStep.content_data as QuizStepData)?.question}
                </p>
                {(currentStep.content_data as QuizStepData)?.quizType && (
                  <Badge variant="info" className="text-xs">
                    {(currentStep.content_data as QuizStepData)?.quizType === "true_false" ? "True/False" : "Multiple Choice"}
                  </Badge>
                )}
              </div>
              {showQuizResult && (
                <div className={`mb-4 p-4 rounded-lg ${
                  quizAnswers[currentStepIndex] === (currentStep.content_data as QuizStepData)?.correctIndex
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {quizAnswers[currentStepIndex] === (currentStep.content_data as QuizStepData)?.correctIndex ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">{t('quiz.correct')}</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-red-800">{t('quiz.incorrect')}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {((currentStep.content_data as QuizStepData)?.options || []).map(
                  (option: string, idx: number) => {
                    const isSelected = quizAnswers[currentStepIndex] === idx;
                    const isCorrect = idx === (currentStep.content_data as QuizStepData)?.correctIndex;
                    const showResult = showQuizResult;
                    const quizData = currentStep.content_data as QuizStepData;

                    return (
                      <Button
                        key={idx}
                        variant={isSelected ? "primary" : "outline"}
                        className={`w-full text-left transition-all ${
                          showResult && isCorrect ? "bg-green-100 border-green-500 text-green-800" : ""
                        } ${
                          showResult && isSelected && !isCorrect ? "bg-red-100 border-red-500 text-red-800" : ""
                        } ${
                          showResult && !isSelected && !isCorrect ? "opacity-60" : ""
                        }`}
                        onClick={() => {
                          if (!showResult) {
                            setQuizAnswers({ ...quizAnswers, [currentStepIndex]: idx });
                            setShowQuizResult(true);
                          }
                        }}
                        disabled={showResult}
                      >
                        <div className="flex items-center gap-2">
                          {quizData.quizType === "true_false" && (
                            <span className="font-mono text-xs">
                              {idx === 0 ? "✓" : "✗"}
                            </span>
                          )}
                          <span>{option}</span>
                        </div>
                      </Button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {currentStep.step_type === "scenario" && (
            <div>
              <p className="font-semibold text-tb-navy mb-4">
                {(currentStep.content_data as ScenarioStepData)?.prompt}
              </p>
              <div className="space-y-2">
                {((currentStep.content_data as ScenarioStepData)?.options || []).map(
                  (option: { text: string; consequence: string }, idx: number) => {
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
                            <div className="text-xs text-tb-shadow mt-1">
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
        <Suspense fallback={<div className="text-center py-4 text-gray-500">Loading AI Coach...</div>}>
          <AICoach
            moduleTitle={module.title}
            stepContent={JSON.stringify(steps[currentStepIndex].content_data)}
            question={
              steps[currentStepIndex].step_type === "quiz"
                ? (steps[currentStepIndex].content_data as QuizStepData)?.question
                : undefined
            }
          />
        </Suspense>
      )}
    </div>
  );
}

