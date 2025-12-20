"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  LoadingSpinner,
  useToast,
} from "@/components/ui";
import {
  classSchema,
  type ClassFormData,
  classFormDefaults,
} from "@/lib/schemas/class";

// Class type from ClassDetail (for edit mode)
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

interface ClassFormProps {
  classItem?: Class;
  onSuccess?: (classItem: Class) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export default function ClassForm({
  classItem,
  onSuccess,
  onCancel,
  mode = "create",
}: ClassFormProps) {
  const t = useTranslations("classes.form");
  const tCommon = useTranslations("common");
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  const [formData, setFormData] = useState<ClassFormData>(() => {
    if (!classItem) return classFormDefaults;

    return {
      name: classItem.name,
      code: classItem.code || "",
      level: classItem.level || "",
      description: classItem.description || "",
      max_students: classItem.max_students,
      start_date: classItem.start_date || "",
      end_date: classItem.end_date || "",
      schedule_description: classItem.schedule_description || "",
      status: classItem.status,
      location: classItem.location || "",
      room: classItem.room || "",
    };
  });

  const updateField = (field: keyof ClassFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      classSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodErrors = error as { errors: Array<{ path: string[]; message: string }> };
        const errorMap: Record<string, string> = {};
        zodErrors.errors.forEach((err) => {
          if (err.path.length > 0) {
            errorMap[err.path[0]] = err.message;
          }
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast(t("errors.validationFailed"), "error");
      return;
    }

    setLoading(true);

    try {
      const url = mode === "create" ? "/api/classes" : `/api/classes/${classItem?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || t("errors.submitFailed"));
      }

      addToast(
        mode === "create" ? t("success.created") : t("success.updated"),
        "success"
      );

      if (onSuccess) {
        onSuccess(json.data);
      }
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t("errors.submitFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t("submitting")} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.basic")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.name")} *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={errors.name}
              placeholder={t("placeholders.name")}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.code")}
              </label>
              <Input
                id="code"
                type="text"
                value={formData.code || ""}
                onChange={(e) => updateField("code", e.target.value)}
                error={errors.code}
                placeholder={t("placeholders.code")}
              />
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.level")}
              </label>
              <Input
                id="level"
                type="text"
                value={formData.level || ""}
                onChange={(e) => updateField("level", e.target.value)}
                error={errors.level}
                placeholder={t("placeholders.level")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.description")}
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-navy"
              placeholder={t("placeholders.description")}
              maxLength={1000}
            />
            {errors.description && (
              <p className="text-sm text-tb-stitch mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.status")}
            </label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="active">{t("status.active")}</option>
              <option value="inactive">{t("status.inactive")}</option>
              <option value="completed">{t("status.completed")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.schedule")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.startDate")}
              </label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => updateField("start_date", e.target.value)}
                error={errors.start_date}
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.endDate")}
              </label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => updateField("end_date", e.target.value)}
                error={errors.end_date}
              />
            </div>
          </div>

          <div>
            <label htmlFor="schedule_description" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.scheduleDescription")}
            </label>
            <textarea
              id="schedule_description"
              rows={3}
              value={formData.schedule_description || ""}
              onChange={(e) => updateField("schedule_description", e.target.value)}
              className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-navy"
              placeholder={t("placeholders.scheduleDescription")}
              maxLength={500}
            />
            {errors.schedule_description && (
              <p className="text-sm text-tb-stitch mt-1">{errors.schedule_description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Location */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.capacityLocation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="max_students" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.maxStudents")} *
            </label>
            <Input
              id="max_students"
              type="number"
              min="1"
              max="500"
              value={formData.max_students}
              onChange={(e) => updateField("max_students", parseInt(e.target.value) || 1)}
              error={errors.max_students}
              required
            />
            <p className="text-xs text-tb-shadow mt-1">
              {t("hints.maxStudents")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.location")}
              </label>
              <Input
                id="location"
                type="text"
                value={formData.location || ""}
                onChange={(e) => updateField("location", e.target.value)}
                error={errors.location}
                placeholder={t("placeholders.location")}
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.room")}
              </label>
              <Input
                id="room"
                type="text"
                value={formData.room || ""}
                onChange={(e) => updateField("room", e.target.value)}
                error={errors.room}
                placeholder={t("placeholders.room")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {tCommon("actions.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {mode === "create" ? t("actions.create") : t("actions.update")}
        </Button>
      </div>
    </form>
  );
}
