"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Class } from "@/lib/types/education";
import { supabaseClient } from "@/lib/supabase/client";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";

export default function StudentClassesPage() {
  const t = useTranslations("student.classes");
  const router = useRouter();
  const { currentOrg } = useCurrentOrg();
  const [classes, setClasses] = useState<Class[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadClasses();
    }
  }, [currentOrg]);

  const loadClasses = async () => {
    if (!currentOrg?.id) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      // Get classes where student is enrolled
      const { data: enrollments } = await supabase
        .from("touchbase_class_enrollments")
        .select("class_id, class:touchbase_classes(*)")
        .eq("student_id", user.id)
        .eq("org_id", currentOrg.id);

      const enrolledClasses = (enrollments || [])
        .map((e: any) => e.class)
        .filter((c: any) => c !== null) as Class[];

      setClasses(enrolledClasses);
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      setError(t('errors.invalidCode'));
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });

      const json = await res.json();

      if (res.ok) {
        setJoinCode("");
        await loadClasses();
      } else {
        setError(json.error || t('errors.joinFailed'));
      }
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.joinFailed'));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Join Class Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('joinClass')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t('enterCode')}
              className="flex-1"
              maxLength={6}
            />
            <Button onClick={handleJoinClass} disabled={joining || !joinCode.trim()}>
              {joining ? t('joining') : t('join')}
            </Button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* My Classes */}
      <div>
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('myClasses')}
        </h2>
        {classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[--color-tb-shadow] mb-4">{t('noClasses')}</p>
              <p className="text-sm text-[--color-tb-shadow]">{t('joinHint')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm text-[--color-tb-shadow]">{classItem.grade_level}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {classItem.description && (
                    <p className="text-sm text-[--color-tb-shadow] mb-4">
                      {classItem.description}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/student/classes/${classItem.id}`)}
                  >
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
