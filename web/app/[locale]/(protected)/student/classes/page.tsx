"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { Class } from '@/lib/types/education';

export default function StudentClassesPage() {
  const t = useTranslations('student.classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes/list");
      const json = await res.json();
      if (res.ok) {
        setClasses(json.classes || []);
      }
    } catch (e) {
      console.error("Failed to load classes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJoining(true);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to join class");

      setJoinCode("");
      await loadClasses(); // Reload classes
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error joining class");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-6">
        {t('title')}
      </h1>

      {/* Join Class Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('joinClass')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinClass} className="flex gap-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t('enterCode')}
              className="flex-1"
              maxLength={6}
            />
            <Button type="submit" loading={joining} disabled={!joinCode.trim()}>
              {t('join')}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* My Classes */}
      <div>
        <h2 className="text-xl font-display font-semibold text-[--color-tb-navy] mb-4">
          {t('myClasses')}
        </h2>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[--color-tb-shadow]">{t('noClasses')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <Card key={classItem.id}>
                <CardHeader>
                  <CardTitle>{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm text-[--color-tb-shadow]">{classItem.grade_level}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {classItem.description && (
                    <p className="text-sm text-[--color-tb-shadow] mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    {t('viewClass')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

