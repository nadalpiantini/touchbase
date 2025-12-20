"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  useToast,
} from "@/components/ui";
import { usePermissions } from "@/lib/hooks/usePermissions";
import ClassForm from "./ClassForm";

type ClassStatus = "active" | "inactive" | "completed" | "cancelled";

type Class = {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  description: string | null;
  max_students: number;
  current_enrollment: number;
  start_date: string | null;
  end_date: string | null;
  schedule_description: string | null;
  status: ClassStatus;
  location: string | null;
  room: string | null;
  created_at: string;
};

interface ClassDetailProps {
  classItem: Class;
  onUpdate?: (classItem: Class) => void;
  onDelete?: (id: string) => void;
}

export default function ClassDetail({
  classItem,
  onUpdate,
  onDelete,
}: ClassDetailProps) {
  const t = useTranslations("classes.detail");
  const tCommon = useTranslations("common");
  const { addToast } = useToast();
  const { can } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = can("UPDATE_CONTENT");
  const canDelete = can("DELETE_CONTENT");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdateSuccess = (updatedClass: Class) => {
    setIsEditing(false);
    addToast(t("success.updated"), "success");
    if (onUpdate) {
      onUpdate(updatedClass);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("confirm.delete", { name: classItem.name }))) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/classes/${classItem.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.deleteFailed"));
      }

      addToast(t("success.deleted"), "success");
      if (onDelete) {
        onDelete(classItem.id);
      }
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t("errors.deleteFailed"),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-2xl text-tb-navy">
            {t("title.edit")}
          </h2>
        </div>
        <ClassForm
          classItem={classItem}
          mode="edit"
          onSuccess={handleUpdateSuccess}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t("deleting")} />
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const capacityPercentage =
    classItem.max_students > 0
      ? Math.round((classItem.current_enrollment / classItem.max_students) * 100)
      : 0;
  const isFull = classItem.current_enrollment >= classItem.max_students;
  const isAlmostFull = capacityPercentage >= 80 && !isFull;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card elevated>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl text-tb-navy font-bold">
                    {classItem.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {classItem.code && (
                      <p className="font-mono text-lg text-tb-shadow">
                        {classItem.code}
                      </p>
                    )}
                    {classItem.level && (
                      <span className="inline-flex items-center px-3 py-1 bg-tb-navy/10 text-tb-navy rounded-full text-sm font-medium">
                        {classItem.level}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[classItem.status]
                      }`}
                    >
                      {t(`status.${classItem.status}`)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {canManage && (
                    <Button onClick={handleEdit} variant="secondary">
                      {tCommon("actions.edit")}
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      className="text-tb-stitch hover:bg-tb-stitch/10"
                    >
                      {tCommon("actions.delete")}
                    </Button>
                  )}
                </div>
              </div>

              {classItem.description && (
                <p className="mt-4 text-tb-shadow leading-relaxed">
                  {classItem.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.name")}
              </dt>
              <dd className="mt-1 text-tb-navy">{classItem.name}</dd>
            </div>

            {classItem.code && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {t("fields.code")}
                </dt>
                <dd className="mt-1 font-mono text-tb-navy">{classItem.code}</dd>
              </div>
            )}

            {classItem.level && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {t("fields.level")}
                </dt>
                <dd className="mt-1 text-tb-navy">{classItem.level}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.status")}
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[classItem.status]
                  }`}
                >
                  {t(`status.${classItem.status}`)}
                </span>
              </dd>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.schedule")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.startDate")}
              </dt>
              <dd className="mt-1 text-tb-navy">
                {formatDate(classItem.start_date)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.endDate")}
              </dt>
              <dd className="mt-1 text-tb-navy">
                {formatDate(classItem.end_date)}
              </dd>
            </div>

            {classItem.schedule_description && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {t("fields.scheduleDescription")}
                </dt>
                <dd className="mt-1 text-tb-navy">
                  {classItem.schedule_description}
                </dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.capacity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.currentEnrollment")}
              </dt>
              <dd className="mt-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-tb-navy">
                    {classItem.current_enrollment}
                  </span>
                  <span className="text-sm text-tb-shadow">
                    / {classItem.max_students}
                  </span>
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.capacityPercentage")}
              </dt>
              <dd className="mt-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isFull
                          ? "bg-tb-red"
                          : isAlmostFull
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isFull
                        ? "text-tb-red"
                        : isAlmostFull
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {capacityPercentage}%
                  </span>
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {t("fields.availableSpots")}
              </dt>
              <dd className="mt-1">
                <span
                  className={`text-lg font-semibold ${
                    isFull
                      ? "text-tb-red"
                      : isAlmostFull
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {Math.max(0, classItem.max_students - classItem.current_enrollment)}
                </span>
                <span className="text-sm text-tb-shadow ml-2">
                  {isFull ? t("labels.full") : t("labels.spotsAvailable")}
                </span>
              </dd>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        {(classItem.location || classItem.room) && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-tb-navy">
                {t("sections.location")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {classItem.location && (
                <div>
                  <dt className="text-sm font-medium text-tb-shadow">
                    {t("fields.location")}
                  </dt>
                  <dd className="mt-1 text-tb-navy">{classItem.location}</dd>
                </div>
              )}

              {classItem.room && (
                <div>
                  <dt className="text-sm font-medium text-tb-shadow">
                    {t("fields.room")}
                  </dt>
                  <dd className="mt-1 text-tb-navy">{classItem.room}</dd>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enrollment Section - Placeholder for Sprint 3.4.4 */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.enrollment")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {t("labels.enrollmentPlaceholder")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
