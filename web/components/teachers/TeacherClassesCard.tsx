"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  useToast,
  Select,
} from "@/components/ui";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { Class } from "@/lib/types/education";

interface TeacherClass {
  id: number;
  teacher_id: string;
  class_id: string;
  role: string;
  assigned_at: string;
  class_name?: string;
  class_code?: string;
  grade_level?: string;
}

interface TeacherClassesCardProps {
  teacherId: string;
  onUpdate?: () => void;
}

export default function TeacherClassesCard({
  teacherId,
  onUpdate,
}: TeacherClassesCardProps) {
  const t = useTranslations("teachers.classes");
  const tCommon = useTranslations("common");
  const { addToast } = useToast();
  const { can } = usePermissions();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding class
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedRole, setSelectedRole] = useState("primary");

  const canManage = can("UPDATE_CONTENT");

  const fetchTeacherClasses = useCallback(async () => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}/classes`);
      if (!res.ok) throw new Error("Failed to fetch classes");

      const data = await res.json();
      setClasses(data.data || []);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      addToast(t("errors.fetchFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [teacherId, addToast, t]);

  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  const fetchAvailableClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch available classes");

      const data = await res.json();
      setAvailableClasses(data.data || []);
    } catch (error) {
      console.error("Error fetching available classes:", error);
      addToast(t("errors.fetchClassesFailed"), "error");
    }
  };

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    await fetchAvailableClasses();
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedClassId("");
    setSelectedRole("primary");
  };

  const handleAssignClass = async () => {
    if (!selectedClassId) {
      addToast(t("errors.selectClass"), "error");
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetch(`/api/teachers/${teacherId}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClassId,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.assignFailed"));
      }

      addToast(t("success.assigned"), "success");
      await fetchTeacherClasses();
      handleCloseAddModal();
      if (onUpdate) onUpdate();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t("errors.assignFailed"),
        "error"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveClass = async (classId: string) => {
    if (!window.confirm(t("confirm.remove"))) return;

    try {
      const res = await fetch(
        `/api/teachers/${teacherId}/classes/${classId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.removeFailed"));
      }

      addToast(t("success.removed"), "success");
      await fetchTeacherClasses();
      if (onUpdate) onUpdate();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t("errors.removeFailed"),
        "error"
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "primary":
        return "bg-tb-navy/10 text-tb-navy";
      case "assistant":
        return "bg-tb-stitch/10 text-tb-stitch";
      case "substitute":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner size="md" text={t("loading")} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-tb-navy">
              {t("title")}
            </CardTitle>
            {canManage && (
              <Button onClick={handleOpenAddModal} variant="secondary" size="sm">
                {t("actions.add")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-tb-shadow text-center py-8">{t("empty")}</p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 border border-tb-line rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-tb-navy">
                        {cls.class_name || cls.class_id}
                      </h4>
                      {cls.class_code && (
                        <span className="text-sm text-tb-shadow">
                          ({cls.class_code})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          cls.role
                        )}`}
                      >
                        {t(`roles.${cls.role}`)}
                      </span>
                      {cls.grade_level && (
                        <span className="text-sm text-tb-shadow">
                          {t("labels.grade")}: {cls.grade_level}
                        </span>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <Button
                      onClick={() => handleRemoveClass(cls.class_id)}
                      variant="outline"
                      size="sm"
                      className="text-tb-stitch hover:bg-tb-stitch/10"
                    >
                      {tCommon("actions.remove")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-dugout">
            <h3 className="font-display text-xl text-tb-navy font-semibold mb-4">
              {t("modal.title")}
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-tb-navy mb-1"
                >
                  {t("modal.selectClass")}
                </label>
                <Select
                  id="class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">{t("modal.chooseClass")}</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                      {cls.grade_level && ` - ${cls.grade_level}`}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-tb-navy mb-1"
                >
                  {t("modal.selectRole")}
                </label>
                <Select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="primary">{t("roles.primary")}</option>
                  <option value="assistant">{t("roles.assistant")}</option>
                  <option value="substitute">{t("roles.substitute")}</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCloseAddModal}
                variant="outline"
                className="flex-1"
                disabled={isAdding}
              >
                {tCommon("actions.cancel")}
              </Button>
              <Button
                onClick={handleAssignClass}
                className="flex-1"
                disabled={isAdding || !selectedClassId}
              >
                {isAdding ? t("modal.assigning") : t("modal.assign")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
