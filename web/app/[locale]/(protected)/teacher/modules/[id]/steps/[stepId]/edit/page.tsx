"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { StepType, ContentStepData, QuizStepData, ScenarioStepData, ModuleStep } from "@/lib/types/education";

export default function EditStepPage() {
  const t = useTranslations("teacher.modules.steps.edit");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const stepId = params.stepId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<ModuleStep | null>(null);

  // Form fields
  const [stepType, setStepType] = useState<StepType>("content");
  const [orderIndex, setOrderIndex] = useState(1);

  // Content step fields
  const [contentText, setContentText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");

  // Quiz step fields
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Scenario step fields
  const [prompt, setPrompt] = useState("");
  const [scenarioOptions, setScenarioOptions] = useState<Array<{ text: string; consequence: string }>>([
    { text: "", consequence: "" }
  ]);

  useEffect(() => {
    loadStep();
  }, [moduleId, stepId]);

  const loadStep = async () => {
    try {
      const res = await fetch(`/api/modules/${moduleId}`);
      const json = await res.json();
      if (res.ok && json.steps) {
        const foundStep = json.steps.find((s: ModuleStep) => s.id === stepId);
        if (!foundStep) {
          setError(t('errors.stepNotFound'));
          return;
        }
        setStep(foundStep);
        setStepType(foundStep.step_type);
        setOrderIndex(foundStep.order_index);

        // Populate fields based on step type
        if (foundStep.step_type === "content") {
          const data = foundStep.content_data as ContentStepData;
          setContentText(data.text || "");
          setMediaUrl(data.mediaUrl || "");
          setMediaType(data.mediaType || "image");
        } else if (foundStep.step_type === "quiz") {
          const data = foundStep.content_data as QuizStepData;
          setQuestion(data.question || "");
          setOptions(data.options || [""]);
          setCorrectIndex(data.correctIndex || 0);
        } else {
          // scenario
          const data = foundStep.content_data as ScenarioStepData;
          setPrompt(data.prompt || "");
          setScenarioOptions(data.options || [{ text: "", consequence: "" }]);
        }
      } else {
        setError(json.error || t('errors.loadFailed'));
      }
    } catch (e: any) {
      setError(e.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (stepType === "quiz") {
      setOptions([...options, ""]);
    } else if (stepType === "scenario") {
      setScenarioOptions([...scenarioOptions, { text: "", consequence: "" }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (stepType === "quiz") {
      setOptions(options.filter((_, i) => i !== index));
      if (correctIndex >= options.length - 1) {
        setCorrectIndex(Math.max(0, correctIndex - 1));
      }
    } else if (stepType === "scenario") {
      setScenarioOptions(scenarioOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (stepType === "quiz") {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    }
  };

  const handleScenarioOptionChange = (index: number, field: "text" | "consequence", value: string) => {
    const newOptions = [...scenarioOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setScenarioOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let content_data: ContentStepData | QuizStepData | ScenarioStepData;

      if (stepType === "content") {
        if (!contentText.trim()) {
          throw new Error(t('errors.contentTextRequired'));
        }
        content_data = {
          text: contentText,
          ...(mediaUrl && { mediaUrl, mediaType }),
        } as ContentStepData;
      } else if (stepType === "quiz") {
        if (!question.trim()) {
          throw new Error(t('errors.questionRequired'));
        }
        const validOptions = options.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          throw new Error(t('errors.minTwoOptions'));
        }
        if (correctIndex < 0 || correctIndex >= validOptions.length) {
          throw new Error(t('errors.invalidCorrectIndex'));
        }
        content_data = {
          question,
          options: validOptions,
          correctIndex,
        } as QuizStepData;
      } else {
        // scenario
        if (!prompt.trim()) {
          throw new Error(t('errors.promptRequired'));
        }
        const validOptions = scenarioOptions.filter((opt) => opt.text.trim() && opt.consequence.trim());
        if (validOptions.length < 2) {
          throw new Error(t('errors.minTwoScenarioOptions'));
        }
        content_data = {
          prompt,
          options: validOptions,
        } as ScenarioStepData;
      }

      const res = await fetch(`/api/modules/${moduleId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          order_index: orderIndex,
          content_data,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || t('errors.updateFailed'));
      }

      router.push(`/${locale}/teacher/modules/${moduleId}`);
    } catch (e: any) {
      setError(e.message || t('errors.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow]">{t('loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !step) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/teacher/modules/${moduleId}`)}
              className="mt-4"
            >
              {t('backToModule')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Type (read-only in edit mode) */}
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('stepTypeLabel')}
              </label>
              <div className="flex h-10 w-full rounded-md border border-[--color-tb-line] bg-[--color-tb-beige]/50 px-3 py-2 text-sm text-[--color-tb-navy] items-center">
                {stepType === "content" ? t('stepTypeContent') : stepType === "quiz" ? t('stepTypeQuiz') : t('stepTypeScenario')}
              </div>
              <p className="text-xs text-[--color-tb-shadow] mt-1">{t('stepTypeReadOnly')}</p>
            </div>

            {/* Order Index */}
            <Input
              label={t('orderIndexLabel')}
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
              disabled={saving}
              min={1}
            />

            {/* Content Step Fields */}
            {stepType === "content" && (
              <>
                <div>
                  <label htmlFor="contentText" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('contentTextLabel')}
                  </label>
                  <textarea
                    id="contentText"
                    rows={6}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('contentTextPlaceholder')}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mediaUrl" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('mediaUrlLabel')} ({t('optional')})
                  </label>
                  <Input
                    id="mediaUrl"
                    type="url"
                    placeholder={t('mediaUrlPlaceholder')}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    disabled={saving}
                  />
                </div>
                {mediaUrl && (
                  <div>
                    <label htmlFor="mediaType" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                      {t('mediaTypeLabel')}
                    </label>
                    <select
                      id="mediaType"
                      className="flex h-10 w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as "image" | "video" | "audio")}
                      disabled={saving}
                    >
                      <option value="image">{t('mediaTypeImage')}</option>
                      <option value="video">{t('mediaTypeVideo')}</option>
                      <option value="audio">{t('mediaTypeAudio')}</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Quiz Step Fields */}
            {stepType === "quiz" && (
              <>
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('questionLabel')}
                  </label>
                  <textarea
                    id="question"
                    rows={3}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('questionPlaceholder')}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                    {t('optionsLabel')}
                  </label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctIndex === index}
                          onChange={() => setCorrectIndex(index)}
                          disabled={saving}
                          className="w-4 h-4"
                        />
                        <Input
                          placeholder={t('optionPlaceholder', { num: index + 1 })}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          disabled={saving}
                          required
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={saving}
                        >
                          {t('remove')}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={saving}
                  >
                    {t('addOption')}
                  </Button>
                </div>
              </>
            )}

            {/* Scenario Step Fields */}
            {stepType === "scenario" && (
              <>
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('promptLabel')}
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('promptPlaceholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                    {t('scenarioOptionsLabel')}
                  </label>
                  {scenarioOptions.map((option, index) => (
                    <div key={index} className="border border-[--color-tb-line] rounded-lg p-4 mb-3">
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-[--color-tb-shadow] mb-1">
                          {t('optionTextLabel')}
                        </label>
                        <Input
                          placeholder={t('optionTextPlaceholder')}
                          value={option.text}
                          onChange={(e) => handleScenarioOptionChange(index, "text", e.target.value)}
                          disabled={saving}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[--color-tb-shadow] mb-1">
                          {t('consequenceLabel')}
                        </label>
                        <textarea
                          rows={2}
                          className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t('consequencePlaceholder')}
                          value={option.consequence}
                          onChange={(e) => handleScenarioOptionChange(index, "consequence", e.target.value)}
                          disabled={saving}
                          required
                        />
                      </div>
                      {scenarioOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={saving}
                          className="mt-2"
                        >
                          {t('remove')}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={saving}
                  >
                    {t('addOption')}
                  </Button>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" loading={saving} disabled={saving}>
                {saving ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/${locale}/teacher/modules/${moduleId}`)}
                disabled={saving}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

