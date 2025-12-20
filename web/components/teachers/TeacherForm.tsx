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
  teacherSchema,
  type TeacherFormData,
  teacherFormDefaults,
} from "@/lib/schemas/teacher";
import type { Teacher } from "@/lib/services/teachers";

interface TeacherFormProps {
  teacher?: Teacher;
  onSuccess?: (teacher: Teacher) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export default function TeacherForm({
  teacher,
  onSuccess,
  onCancel,
  mode = "create",
}: TeacherFormProps) {
  const t = useTranslations("teachers.form");
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  const [formData, setFormData] = useState<TeacherFormData>(() => {
    if (!teacher) return teacherFormDefaults;

    return {
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone || "",
      date_of_birth: teacher.date_of_birth || "",
      profile_photo_url: teacher.profile_photo_url || "",
      certifications: teacher.certifications || [],
      specializations: teacher.specializations || [],
      years_experience: teacher.years_experience || 0,
      bio: teacher.bio || "",
      department: teacher.department || "",
      position: teacher.position || "",
      hire_date: teacher.hire_date || "",
      status: teacher.status,
      employment_type: teacher.employment_type || "",
      address: teacher.address || "",
      emergency_contact_name: teacher.emergency_contact_name || "",
      emergency_contact_phone: teacher.emergency_contact_phone || "",
      emergency_contact_relationship: teacher.emergency_contact_relationship || "",
    };
  });

  // Array fields temporary inputs
  const [newCertification, setNewCertification] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");

  const updateField = (field: keyof TeacherFormData, value: unknown) => {
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

  const addCertification = () => {
    if (newCertification.trim()) {
      updateField("certifications", [...formData.certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    updateField(
      "certifications",
      formData.certifications.filter((_, i) => i !== index)
    );
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      updateField("specializations", [...formData.specializations, newSpecialization.trim()]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    updateField(
      "specializations",
      formData.specializations.filter((_, i) => i !== index)
    );
  };

  const validateForm = (): boolean => {
    try {
      teacherSchema.parse(formData);
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
      const url = mode === "create" ? "/api/teachers" : `/api/teachers/${teacher?.id}`;
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
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.personal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.firstName")} *
              </label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                error={errors.first_name}
                required
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.lastName")} *
              </label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                error={errors.last_name}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.email")} *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.phone")}
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                error={errors.phone}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.dateOfBirth")}
              </label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
                error={errors.date_of_birth}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.address")}
              </label>
              <Input
                id="address"
                type="text"
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                error={errors.address}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.professional")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.department")}
              </label>
              <Input
                id="department"
                type="text"
                value={formData.department || ""}
                onChange={(e) => updateField("department", e.target.value)}
                error={errors.department}
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.position")}
              </label>
              <Input
                id="position"
                type="text"
                value={formData.position || ""}
                onChange={(e) => updateField("position", e.target.value)}
                error={errors.position}
              />
            </div>
          </div>

          <div>
            <label htmlFor="years_experience" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.yearsExperience")}
            </label>
            <Input
              id="years_experience"
              type="number"
              min="0"
              max="99"
              value={formData.years_experience}
              onChange={(e) => updateField("years_experience", parseInt(e.target.value) || 0)}
              error={errors.years_experience}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.bio")}
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-navy"
              maxLength={1000}
            />
            {errors.bio && <p className="text-sm text-tb-stitch mt-1">{errors.bio}</p>}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.certifications")}
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder={t("placeholders.addCertification")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCertification();
                  }
                }}
              />
              <Button type="button" onClick={addCertification} variant="secondary">
                {t("actions.add")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-tb-navy/10 text-tb-navy rounded-full text-sm"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="hover:text-tb-stitch"
                    aria-label={t("actions.remove")}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.specializations")}
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder={t("placeholders.addSpecialization")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSpecialization();
                  }
                }}
              />
              <Button type="button" onClick={addSpecialization} variant="secondary">
                {t("actions.add")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-tb-stitch/10 text-tb-stitch rounded-full text-sm"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="hover:text-tb-red"
                    aria-label={t("actions.remove")}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.employment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hire_date" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.hireDate")}
              </label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date || ""}
                onChange={(e) => updateField("hire_date", e.target.value)}
                error={errors.hire_date}
              />
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
                <option value="on_leave">{t("status.on_leave")}</option>
                <option value="terminated">{t("status.terminated")}</option>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="employment_type" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.employmentType")}
            </label>
            <Input
              id="employment_type"
              type="text"
              value={formData.employment_type || ""}
              onChange={(e) => updateField("employment_type", e.target.value)}
              error={errors.employment_type}
              placeholder={t("placeholders.employmentType")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-tb-navy">
            {t("sections.emergency")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.emergencyName")}
              </label>
              <Input
                id="emergency_contact_name"
                type="text"
                value={formData.emergency_contact_name || ""}
                onChange={(e) => updateField("emergency_contact_name", e.target.value)}
                error={errors.emergency_contact_name}
              />
            </div>

            <div>
              <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-tb-navy mb-1">
                {t("fields.emergencyPhone")}
              </label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone || ""}
                onChange={(e) => updateField("emergency_contact_phone", e.target.value)}
                error={errors.emergency_contact_phone}
              />
            </div>
          </div>

          <div>
            <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-tb-navy mb-1">
              {t("fields.emergencyRelationship")}
            </label>
            <Input
              id="emergency_contact_relationship"
              type="text"
              value={formData.emergency_contact_relationship || ""}
              onChange={(e) => updateField("emergency_contact_relationship", e.target.value)}
              error={errors.emergency_contact_relationship}
              placeholder={t("placeholders.emergencyRelationship")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {mode === "create" ? t("actions.create") : t("actions.update")}
        </Button>
      </div>
    </form>
  );
}
