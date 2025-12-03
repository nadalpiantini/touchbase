"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { ModuleDifficulty } from "@/lib/types/education";

export default function CreateModulePage() {
  const t = useTranslations("teacher.modules.create");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<ModuleDifficulty>("beginner");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/modules/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          duration_minutes: durationMinutes,
          skills,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || t('errors.createFailed'));
      }

      router.push(`/teacher/modules/${json.module.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('form.titleLabel')}
              placeholder={t('form.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                {t('form.descriptionLabel')}
              </label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] placeholder:text-[--color-tb-shadow]/60 focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('form.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                {t('form.difficultyLabel')}
              </label>
              <select
                id="difficulty"
                className="flex h-10 w-full rounded-md border border-[--color-tb-line] bg-white px-3 py-2 text-sm text-[--color-tb-navy] focus:outline-none focus:ring-2 focus:ring-[--color-tb-red] disabled:cursor-not-allowed disabled:opacity-50"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ModuleDifficulty)}
                disabled={loading}
              >
                <option value="beginner">{t('form.difficultyBeginner')}</option>
                <option value="intermediate">{t('form.difficultyIntermediate')}</option>
                <option value="advanced">{t('form.difficultyAdvanced')}</option>
              </select>
            </div>

            <Input
              label={t('form.durationLabel')}
              type="number"
              placeholder="30"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              disabled={loading}
              min={0}
            />

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">
                {t('form.skillsLabel')}
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder={t('form.skillPlaceholder')}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  disabled={loading}
                />
                <Button type="button" onClick={handleAddSkill} disabled={loading}>
                  {t('form.addSkill')}
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[--color-tb-beige] text-[--color-tb-navy] rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-[--color-tb-red]"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

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


