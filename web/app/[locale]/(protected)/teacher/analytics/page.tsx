"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, LoadingSpinner, Alert } from "@/components/ui";
import { ClassAnalytics, ModuleAnalytics } from "@/lib/services/analytics";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";

export default function TeacherAnalyticsPage() {
  const t = useTranslations("teacher.analytics");
  const { currentOrg } = useCurrentOrg();
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics[]>([]);
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"classes" | "modules">("classes");

  useEffect(() => {
    if (currentOrg?.id) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  const loadAnalytics = async () => {
    if (!currentOrg?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [classesRes, modulesRes] = await Promise.all([
        fetch(`/api/analytics/classes?orgId=${currentOrg.id}`),
        fetch(`/api/analytics/modules?orgId=${currentOrg.id}`),
      ]);

      const classesJson = await classesRes.json();
      const modulesJson = await modulesRes.json();

      if (classesRes.ok) {
        setClassAnalytics(classesJson.analytics || []);
      }
      if (modulesRes.ok) {
        setModuleAnalytics(modulesJson.analytics || []);
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // Handle "relation does not exist" errors gracefully (table not created yet)
      if (errorMsg.includes('does not exist') || errorMsg.includes('PGRST')) {
        setClassAnalytics([]);
        setModuleAnalytics([]);
      } else {
        setError(errorMsg || t('errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="error" title={t('errors.loadFailed')}>
          {error}
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[--color-tb-line]">
        <button
          className={`pb-2 px-4 font-medium transition ${
            activeTab === "classes"
              ? "text-[--color-tb-red] border-b-2 border-[--color-tb-red]"
              : "text-[--color-tb-shadow] hover:text-[--color-tb-navy]"
          }`}
          onClick={() => setActiveTab("classes")}
        >
          {t('tabs.classes')}
        </button>
        <button
          className={`pb-2 px-4 font-medium transition ${
            activeTab === "modules"
              ? "text-[--color-tb-red] border-b-2 border-[--color-tb-red]"
              : "text-[--color-tb-shadow] hover:text-[--color-tb-navy]"
          }`}
          onClick={() => setActiveTab("modules")}
        >
          {t('tabs.modules')}
        </button>
      </div>

      {/* Class Analytics */}
      {activeTab === "classes" && (
        <div>
          {classAnalytics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-[--color-tb-shadow]">{t('noClasses')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classAnalytics.map((analytics) => (
                <Card key={analytics.classId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{analytics.className}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-1">
                          <span>{t('students')}</span>
                          <span className="font-semibold text-[--color-tb-navy]">
                            {analytics.enrolledStudents}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-1">
                          <span>{t('completionRate')}</span>
                          <span className="font-semibold text-[--color-tb-navy]">
                            {analytics.completionRate}%
                          </span>
                        </div>
                        <ProgressBar value={analytics.completionRate} color="primary" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-1">
                          <span>{t('averageScore')}</span>
                          <span className="font-semibold text-[--color-tb-navy]">
                            {analytics.averageScore}%
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[--color-tb-line]">
                        <div className="flex justify-between text-xs text-[--color-tb-shadow]">
                          <span>{t('modulesAssigned')}</span>
                          <span>{analytics.modulesAssigned}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[--color-tb-shadow]">
                          <span>{t('modulesCompleted')}</span>
                          <span>{analytics.modulesCompleted}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Module Analytics */}
      {activeTab === "modules" && (
        <div>
          {moduleAnalytics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-[--color-tb-shadow]">{t('noModules')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {moduleAnalytics.map((analytics) => (
                <Card key={analytics.moduleId}>
                  <CardHeader>
                    <CardTitle>{analytics.moduleTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-[--color-tb-shadow] mb-1">
                          {t('completionRate')}
                        </div>
                        <div className="text-2xl font-bold text-[--color-tb-navy]">
                          {analytics.completionRate}%
                        </div>
                        <ProgressBar value={analytics.completionRate} color="primary" className="mt-2" />
                      </div>

                      <div>
                        <div className="text-sm text-[--color-tb-shadow] mb-1">
                          {t('averageScore')}
                        </div>
                        <div className="text-2xl font-bold text-[--color-tb-navy]">
                          {analytics.averageScore}%
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-[--color-tb-shadow] mb-1">
                          {t('totalAssignments')}
                        </div>
                        <div className="text-2xl font-bold text-[--color-tb-navy]">
                          {analytics.totalAssignments}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-[--color-tb-shadow] mb-1">
                          {t('averageTime')}
                        </div>
                        <div className="text-2xl font-bold text-[--color-tb-navy]">
                          {analytics.averageTimeMinutes} {t('minutes')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

