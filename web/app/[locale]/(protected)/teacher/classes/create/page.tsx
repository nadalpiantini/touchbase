"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@/components/ui';

export default function CreateClassPage() {
  const t = useTranslations('teacher.classes.create');
  const router = useRouter();
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gradeLevel, description }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create class");

      router.push(`/teacher/classes/${json.class.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t('namePlaceholder')}
            />

            <Input
              label={t('gradeLevel')}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder={t('gradeLevelPlaceholder')}
            />

            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                {t('description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-tb-line focus:border-tb-red focus:outline-none"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                {t('create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

