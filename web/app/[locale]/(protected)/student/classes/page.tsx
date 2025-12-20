"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, LoadingSpinner, Alert } from "@/components/ui";
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
        .eq("student_id", user.id);

      // Supabase returns joined relations as arrays
      type EnrollmentWithClass = {
        class_id: string;
        class: Class[] | Class | null;
      };

      const enrolledClasses = (enrollments || [])
        .map((e: EnrollmentWithClass) => Array.isArray(e.class) ? e.class[0] : e.class)
        .filter((c): c is Class => c !== null);

      setClasses(enrolledClasses);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // Handle "relation does not exist" errors gracefully (table not created yet)
      if (errorMsg.includes('does not exist') || errorMsg.includes('PGRST')) {
        setClasses([]);
      } else {
        setError(errorMsg || t('errors.loadFailed'));
      }
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
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-tb-navy mb-8">
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
            <Alert variant="error" className="mt-3">{error}</Alert>
          )}
        </CardContent>
      </Card>

      {/* My Classes - Rule of Thirds grid */}
      <div>
        <h2 className="text-2xl font-semibold text-tb-navy mb-4">
          {t('myClasses')}
        </h2>
        {classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-tb-shadow mb-4">{t('noClasses')}</p>
              <p className="text-sm text-tb-shadow">{t('joinHint')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="thirds-card-grid">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  {classItem.grade_level && (
                    <p className="text-sm text-tb-shadow">{classItem.grade_level}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {classItem.description && (
                    <p className="text-sm text-tb-shadow mb-4">
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
