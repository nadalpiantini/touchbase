"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Module } from "@/lib/types/education";
import { supabaseClient } from "@/lib/supabase/client";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";

export default function TeacherClassModulesPage() {
  const t = useTranslations("teacher.classes.modules");
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const { currentOrg } = useCurrentOrg();

  const [assignedModules, setAssignedModules] = useState<Module[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg, classId]);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      // Load assigned modules
      const assignedRes = await fetch(`/api/modules/list?classId=${classId}`);
      const assignedJson = await assignedRes.json();
      if (assignedRes.ok) {
        setAssignedModules(assignedJson.modules || []);
      }

      // Load all available modules
      const availableRes = await fetch(`/api/modules/list`);
      const availableJson = await availableRes.json();
      if (availableRes.ok) {
        const allModules = availableJson.modules || [];
        // Filter out already assigned modules
        const assignedIds = new Set((assignedJson.modules || []).map((m: Module) => m.id));
        setAvailableModules(allModules.filter((m: Module) => !assignedIds.has(m.id)));
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // Handle "relation does not exist" errors gracefully (table not created yet)
      if (errorMsg.includes('does not exist') || errorMsg.includes('PGRST')) {
        setAssignedModules([]);
        setAvailableModules([]);
      } else {
        setError(errorMsg || t('errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignModule = async (moduleId: string) => {
    setAssigning(moduleId);
    try {
      const res = await fetch(`/api/classes/${classId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId }),
      });

      if (res.ok) {
        await loadModules();
      } else {
        const json = await res.json();
        setError(json.error || t('errors.assignFailed'));
      }
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.assignFailed'));
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassignModule = async (moduleId: string) => {
    if (!confirm(t('unassignConfirm'))) return;

    setAssigning(moduleId);
    try {
      const res = await fetch(`/api/classes/${classId}/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadModules();
      } else {
        const json = await res.json();
        setError(json.error || t('errors.unassignFailed'));
      }
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.unassignFailed'));
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push(`/teacher/classes/${classId}`)} className="mb-4">
          {t('backToClass')}
        </Button>
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-2">
          {t('title')}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Assigned Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('assignedModules')} ({assignedModules.length})
        </h2>
        {assignedModules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[--color-tb-shadow]">{t('noAssignedModules')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignedModules.map((module) => (
              <Card key={module.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[--color-tb-navy]">{module.title}</h3>
                        {module.difficulty && (
                          <Badge variant="info">{module.difficulty}</Badge>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-sm text-[--color-tb-shadow] mb-2">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[--color-tb-shadow]">
                        {module.duration_minutes && (
                          <span>{module.duration_minutes} {t('minutes')}</span>
                        )}
                        {module.skills && module.skills.length > 0 && (
                          <span>{module.skills.length} {t('skills')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/teacher/modules/${module.id}`)}
                      >
                        {t('viewModule')}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleUnassignModule(module.id)}
                        disabled={assigning === module.id}
                      >
                        {assigning === module.id ? t('unassigning') : t('unassign')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Modules */}
      <div>
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('availableModules')} ({availableModules.length})
        </h2>
        {availableModules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[--color-tb-shadow]">{t('noAvailableModules')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {availableModules.map((module) => (
              <Card key={module.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[--color-tb-navy]">{module.title}</h3>
                        {module.difficulty && (
                          <Badge variant="info">{module.difficulty}</Badge>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-sm text-[--color-tb-shadow] mb-2">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[--color-tb-shadow]">
                        {module.duration_minutes && (
                          <span>{module.duration_minutes} {t('minutes')}</span>
                        )}
                        {module.skills && module.skills.length > 0 && (
                          <span>{module.skills.length} {t('skills')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/teacher/modules/${module.id}`)}
                      >
                        {t('viewModule')}
                      </Button>
                      <Button
                        onClick={() => handleAssignModule(module.id)}
                        disabled={assigning === module.id}
                      >
                        {assigning === module.id ? t('assigning') : t('assign')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

