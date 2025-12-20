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
import type { Teacher } from "@/lib/services/teachers";
import TeacherForm from "./TeacherForm";

interface TeacherDetailProps {
  teacher: Teacher;
  onUpdate?: (teacher: Teacher) => void;
  onDelete?: (id: string) => void;
}

export default function TeacherDetail({
  teacher,
  onUpdate,
  onDelete,
}: TeacherDetailProps) {
  const t = useTranslations("teachers.detail");
  const tForm = useTranslations("teachers.form");
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

  const handleUpdateSuccess = (updatedTeacher: Teacher) => {
    setIsEditing(false);
    addToast(t("success.updated"), "success");
    if (onUpdate) {
      onUpdate(updatedTeacher);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("confirm.delete"))) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.deleteFailed"));
      }

      addToast(t("success.deleted"), "success");
      if (onDelete) {
        onDelete(teacher.id);
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
        <TeacherForm
          teacher={teacher}
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
    on_leave: "bg-yellow-100 text-yellow-800",
    terminated: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card elevated>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl text-tb-navy font-bold">
                    {teacher.first_name} {teacher.last_name}
                  </h1>
                  {(teacher.position || teacher.department) && (
                    <p className="text-lg text-tb-shadow mt-1">
                      {[teacher.position, teacher.department]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[teacher.status]
                      }`}
                    >
                      {tForm(`status.${teacher.status}`)}
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

              {teacher.bio && (
                <p className="mt-4 text-tb-shadow leading-relaxed">
                  {teacher.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.personal")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {tForm("fields.email")}
              </dt>
              <dd className="mt-1 text-tb-navy">
                <a
                  href={`mailto:${teacher.email}`}
                  className="hover:text-tb-stitch transition-colors"
                >
                  {teacher.email}
                </a>
              </dd>
            </div>

            {teacher.phone && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.phone")}
                </dt>
                <dd className="mt-1 text-tb-navy">
                  <a
                    href={`tel:${teacher.phone}`}
                    className="hover:text-tb-stitch transition-colors"
                  >
                    {teacher.phone}
                  </a>
                </dd>
              </div>
            )}

            {teacher.date_of_birth && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.dateOfBirth")}
                </dt>
                <dd className="mt-1 text-tb-navy">
                  {new Date(teacher.date_of_birth).toLocaleDateString()}
                </dd>
              </div>
            )}

            {teacher.address && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.address")}
                </dt>
                <dd className="mt-1 text-tb-navy">{teacher.address}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.professional")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {tForm("fields.yearsExperience")}
              </dt>
              <dd className="mt-1 text-tb-navy">
                {teacher.years_experience}{" "}
                {teacher.years_experience === 1
                  ? t("labels.year")
                  : t("labels.years")}
              </dd>
            </div>

            {teacher.certifications.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.certifications")}
                </dt>
                <dd className="mt-1">
                  <div className="flex flex-wrap gap-2">
                    {teacher.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-tb-navy/10 text-tb-navy rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}

            {teacher.specializations.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.specializations")}
                </dt>
                <dd className="mt-1">
                  <div className="flex flex-wrap gap-2">
                    {teacher.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-tb-stitch/10 text-tb-stitch rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-tb-navy">
              {t("sections.employment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teacher.hire_date && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.hireDate")}
                </dt>
                <dd className="mt-1 text-tb-navy">
                  {new Date(teacher.hire_date).toLocaleDateString()}
                </dd>
              </div>
            )}

            {teacher.employment_type && (
              <div>
                <dt className="text-sm font-medium text-tb-shadow">
                  {tForm("fields.employmentType")}
                </dt>
                <dd className="mt-1 text-tb-navy">{teacher.employment_type}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-tb-shadow">
                {tForm("fields.status")}
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[teacher.status]
                  }`}
                >
                  {tForm(`status.${teacher.status}`)}
                </span>
              </dd>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        {(teacher.emergency_contact_name ||
          teacher.emergency_contact_phone ||
          teacher.emergency_contact_relationship) && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-tb-navy">
                {t("sections.emergency")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teacher.emergency_contact_name && (
                <div>
                  <dt className="text-sm font-medium text-tb-shadow">
                    {tForm("fields.emergencyName")}
                  </dt>
                  <dd className="mt-1 text-tb-navy">
                    {teacher.emergency_contact_name}
                  </dd>
                </div>
              )}

              {teacher.emergency_contact_phone && (
                <div>
                  <dt className="text-sm font-medium text-tb-shadow">
                    {tForm("fields.emergencyPhone")}
                  </dt>
                  <dd className="mt-1 text-tb-navy">
                    <a
                      href={`tel:${teacher.emergency_contact_phone}`}
                      className="hover:text-tb-stitch transition-colors"
                    >
                      {teacher.emergency_contact_phone}
                    </a>
                  </dd>
                </div>
              )}

              {teacher.emergency_contact_relationship && (
                <div>
                  <dt className="text-sm font-medium text-tb-shadow">
                    {tForm("fields.emergencyRelationship")}
                  </dt>
                  <dd className="mt-1 text-tb-navy">
                    {teacher.emergency_contact_relationship}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
