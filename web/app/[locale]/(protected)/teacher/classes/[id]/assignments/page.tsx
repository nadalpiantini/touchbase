"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Module } from "@/lib/types/education";
import { supabaseClient } from "@/lib/supabase/client";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";
import type { Assignment } from "@/lib/services/assignments";

type AssignmentWithModule = Assignment & {
  module?: Module | null;
};

export default function TeacherClassAssignmentsPage() {
  const t = useTranslations("teacher.classes.assignments");
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const { currentOrg } = useCurrentOrg();

  const [assignments, setAssignments] = useState<AssignmentWithModule[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadAssignments();
      loadAvailableModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg, classId]);

  const loadAssignments = async () => {
    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("touchbase_assignments")
        .select(`
          *,
          module:touchbase_modules(*)
        `)
        .eq("class_id", classId)
        .eq("teacher_id", user.id)
        .order("due_date", { ascending: true });

      if (fetchError) throw fetchError;

      setAssignments((data || []) as Assignment[]);
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModules = async () => {
    if (!currentOrg?.id) return;

    try {
      const res = await fetch(`/api/modules/list?orgId=${currentOrg.id}`);
      const json = await res.json();

      if (res.ok) {
        setAvailableModules(json.modules || []);
      }
    } catch (e: unknown) {
      // Failed to load modules - handled by UI state
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedModuleId || !title || !dueDate) {
      setError(t('errors.missingFields'));
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      const { error: insertError } = await supabase
        .from("touchbase_assignments")
        .insert({
          class_id: classId,
          module_id: selectedModuleId,
          teacher_id: user.id,
          title,
          description: description || null,
          due_date: dueDate,
        });

      if (insertError) throw insertError;

      // Reset form
      setSelectedModuleId("");
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowCreateForm(false);

      // Reload assignments
      await loadAssignments();
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || t('errors.createFailed'));
    } finally {
      setCreating(false);
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

      {/* Create Assignment Form */}
      {!showCreateForm ? (
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)}>
            {t('createAssignment')}
          </Button>
        </div>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('createAssignment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  {t('selectModule')}
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-shadow] rounded-lg"
                >
                  <option value="">{t('selectModulePlaceholder')}</option>
                  {availableModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  {t('title')}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-[--color-tb-shadow] rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  {t('dueDate')}
                </label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="flex gap-3">
                <Button onClick={handleCreateAssignment} disabled={creating}>
                  {creating ? t('creating') : t('create')}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div>
        <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
          {t('assignmentsList')}
        </h2>
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[--color-tb-shadow]">{t('noAssignments')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const dueDateObj = new Date(assignment.due_date);
              const isOverdue = dueDateObj < new Date();
              const isDueSoon = dueDateObj <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

              return (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[--color-tb-navy] mb-1">
                          {assignment.title}
                        </h3>
                        {assignment.module && (
                          <p className="text-sm text-[--color-tb-shadow] mb-2">
                            {t('module')}: {assignment.module.title}
                          </p>
                        )}
                        {assignment.description && (
                          <p className="text-sm text-[--color-tb-shadow] mb-2">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {isOverdue ? (
                          <Badge variant="error">{t('overdue')}</Badge>
                        ) : isDueSoon ? (
                          <Badge variant="warning">{t('dueSoon')}</Badge>
                        ) : (
                          <Badge variant="info">{t('upcoming')}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-[--color-tb-shadow]">
                      <p>{t('dueDate')}: {dueDateObj.toLocaleDateString()}</p>
                      <p>{t('assignedAt')}: {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {assignment.module && (
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/teacher/modules/${assignment.module_id}`)}
                        >
                          {t('viewModule')}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (confirm(t('deleteConfirm'))) {
                            try {
                              const res = await fetch(`/api/assignments/${assignment.id}`, {
                                method: 'DELETE',
                              });
                              if (res.ok) {
                                await loadAssignments();
                              } else {
                                setError(t('errors.deleteFailed'));
                              }
                            } catch (e: unknown) {
                              setError((e instanceof Error ? e.message : String(e)) || t('errors.deleteFailed'));
                            }
                          }
                        }}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

