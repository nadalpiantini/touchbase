"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { StepType } from "@/lib/types/education";

export default function CreateStepPage() {
  const t = useTranslations("teacher.modules.steps.create");
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const [stepType, setStepType] = useState<StepType>("content");
  const [orderIndex, setOrderIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Content step fields
  const [contentText, setContentText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");

  // Quiz step fields
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Scenario step fields
  const [prompt, setPrompt] = useState("");
  const [scenarioOptions, setScenarioOptions] = useState<Array<{ text: string; consequence: string }>>([
    { text: "", consequence: "" },
  ]);

  useEffect(() => {
    // Fetch current step count to set default order_index
    fetch(`/api/modules/${moduleId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.steps) {
          setOrderIndex((json.steps.length || 0) + 1);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, [moduleId]);

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
    } else if (stepType === "scenario") {
      setScenarioOptions(scenarioOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (stepType === "quiz") {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    }
  };

  const handleUpdateScenarioOption = (index: number, field: "text" | "consequence", value: string) => {
    const newOptions = [...scenarioOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setScenarioOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let contentData: Record<string, unknown> = {};

    if (stepType === "content") {
      contentData = {
        text: contentText,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType,
      };
    } else if (stepType === "quiz") {
      if (!question || options.filter((o) => o.trim()).length < 2) {
        setError(t('errors.invalidQuiz'));
        setLoading(false);
        return;
      }
      contentData = {
        question,
        options: options.filter((o) => o.trim()),
        correctIndex,
      };
    } else if (stepType === "scenario") {
      if (!prompt || scenarioOptions.filter((o) => o.text.trim()).length < 2) {
        setError(t('errors.invalidScenario'));
        setLoading(false);
        return;
      }
      contentData = {
        prompt,
        options: scenarioOptions.filter((o) => o.text.trim()),
      };
    }

    try {
      const res = await fetch(`/api/modules/${moduleId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_index: orderIndex,
          step_type: stepType,
          content_data: contentData,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || t('errors.createFailed'));
      }

      router.push(`/teacher/modules/${moduleId}`);
    } catch (e: any) {
      setError(e.message || t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('form.stepTypeLabel')}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] focus:outline-none focus:ring-2 focus:ring-[--color-tb-red]"
                value={stepType}
                onChange={(e) => setStepType(e.target.value as StepType)}
                disabled={loading}
              >
                <option value="content">{t('form.stepTypeContent')}</option>
                <option value="quiz">{t('form.stepTypeQuiz')}</option>
                <option value="scenario">{t('form.stepTypeScenario')}</option>
              </select>
            </div>

            {/* Order Index */}
            <Input
              label={t('form.orderLabel')}
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
              disabled={loading}
              min={1}
            />

            {/* Content Step Fields */}
            {stepType === "content" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('form.contentTextLabel')}
                  </label>
                  <textarea
                    rows={6}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red]"
                    placeholder={t('form.contentTextPlaceholder')}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('form.mediaTypeLabel')}
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] mb-2"
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as "image" | "video" | "audio")}
                    disabled={loading}
                  >
                    <option value="image">{t('form.mediaTypeImage')}</option>
                    <option value="video">{t('form.mediaTypeVideo')}</option>
                    <option value="audio">{t('form.mediaTypeAudio')}</option>
                  </select>
                </div>
                <Input
                  label={t('form.mediaUrlLabel')}
                  placeholder={t('form.mediaUrlPlaceholder')}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  disabled={loading}
                />
              </>
            )}

            {/* Quiz Step Fields */}
            {stepType === "quiz" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('form.questionLabel')}
                  </label>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red]"
                    placeholder={t('form.questionPlaceholder')}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                    {t('form.optionsLabel')}
                  </label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder={t('form.optionPlaceholder', { num: index + 1 })}
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                        disabled={loading}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctIndex === index}
                          onChange={() => setCorrectIndex(index)}
                          disabled={loading}
                        />
                        <span className="text-xs text-[--color-tb-shadow]">{t('form.correct')}</span>
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={loading}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddOption} disabled={loading}>
                    {t('form.addOption')}
                  </Button>
                </div>
              </>
            )}

            {/* Scenario Step Fields */}
            {stepType === "scenario" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                    {t('form.promptLabel')}
                  </label>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red]"
                    placeholder={t('form.promptPlaceholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                    {t('form.choicesLabel')}
                  </label>
                  {scenarioOptions.map((option, index) => (
                    <div key={index} className="mb-4 p-4 border border-[--color-tb-line] rounded-lg">
                      <Input
                        label={t('form.choiceTextLabel', { num: index + 1 })}
                        placeholder={t('form.choiceTextPlaceholder')}
                        value={option.text}
                        onChange={(e) => handleUpdateScenarioOption(index, "text", e.target.value)}
                        disabled={loading}
                        className="mb-2"
                      />
                      <Input
                        label={t('form.consequenceLabel', { num: index + 1 })}
                        placeholder={t('form.consequencePlaceholder')}
                        value={option.consequence}
                        onChange={(e) => handleUpdateScenarioOption(index, "consequence", e.target.value)}
                        disabled={loading}
                      />
                      {scenarioOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={loading}
                          className="mt-2"
                        >
                          {t('form.removeChoice')}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddOption} disabled={loading}>
                    {t('form.addChoice')}
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
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? t('form.creating') : t('form.create')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
                {t('form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

