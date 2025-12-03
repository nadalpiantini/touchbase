"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Module, ModuleDifficulty } from "@/lib/types/education";

export default function TeacherModulesPage() {
  const t = useTranslations("teacher.modules");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const res = await fetch("/api/modules/list");
      const json = await res.json();
      if (res.ok) {
        setModules(json.modules || []);
      } else {
        setError(json.error || t('errors.fetchFailed'));
      }
    } catch (e: any) {
      setError(e.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  const difficultyColors: Record<ModuleDifficulty, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy]">
          {t('title')}
        </h1>
        <Link href="/teacher/modules/create">
          <Button>{t('createModule')}</Button>
        </Link>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow] mb-4">{t('noModules')}</p>
            <Link href="/teacher/modules/create">
              <Button variant="secondary">{t('createFirstModule')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.id} href={`/teacher/modules/${module.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <Badge className={difficultyColors[module.difficulty]}>
                      {module.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {module.description && (
                    <p className="text-[--color-tb-shadow] text-sm mb-4 line-clamp-2">
                      {module.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[--color-tb-shadow]">
                    <span>{module.duration_minutes} {t('minutes')}</span>
                    {module.skills && module.skills.length > 0 && (
                      <div className="flex gap-1">
                        {module.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[--color-tb-beige] text-[--color-tb-navy] rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {module.skills.length > 2 && (
                          <span className="px-2 py-1 text-[--color-tb-shadow]">
                            +{module.skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


