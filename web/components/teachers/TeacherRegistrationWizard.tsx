"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Image from "next/image";

type TeacherData = {
  // Step 1: Photo & Personal Info
  photo_url?: string;
  full_name: string;
  birthdate: string;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  
  // Step 2: Employment Info
  employment_type: string;
  hire_date: string;
  salary?: number;
  department: string;
  
  // Step 3: Education
  degree: string;
  field_of_study: string;
  institution: string;
  graduation_year?: number;
  
  // Step 4: Teaching & Experience
  teaching_subjects: string[];
  experience_years?: number;
  certifications: Array<{ name: string; issuer: string; date: string }>;
  licenses: Array<{ name: string; number: string; expiry: string }>;
  
  // Step 5: Notes
  notes?: string;
};

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary"];
const DEPARTMENTS = ["Academic", "Athletic", "Administration", "Support"];

export default function TeacherRegistrationWizard({ onComplete, onCancel }: { onComplete?: () => void; onCancel?: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentCert, setCurrentCert] = useState({ name: "", issuer: "", date: "" });
  const [currentLicense, setCurrentLicense] = useState({ name: "", number: "", expiry: "" });
  
  const [formData, setFormData] = useState<TeacherData>({
    full_name: "",
    birthdate: "",
    email: "",
    phone: "",
    nationality: "",
    address: "",
    employment_type: "",
    hire_date: "",
    department: "",
    degree: "",
    field_of_study: "",
    institution: "",
    teaching_subjects: [],
    certifications: [],
    licenses: [],
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFormData = <K extends keyof TeacherData>(field: K, value: TeacherData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSubject = () => {
    if (currentSubject.trim() && !formData.teaching_subjects.includes(currentSubject.trim())) {
      updateFormData("teaching_subjects", [...formData.teaching_subjects, currentSubject.trim()]);
      setCurrentSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    updateFormData("teaching_subjects", formData.teaching_subjects.filter(s => s !== subject));
  };

  const addCertification = () => {
    if (currentCert.name.trim()) {
      updateFormData("certifications", [...formData.certifications, { ...currentCert }]);
      setCurrentCert({ name: "", issuer: "", date: "" });
    }
  };

  const addLicense = () => {
    if (currentLicense.name.trim()) {
      updateFormData("licenses", [...formData.licenses, { ...currentLicense }]);
      setCurrentLicense({ name: "", number: "", expiry: "" });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/teachers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || "Error al crear profesor");
      }

      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name.trim().length > 0 && formData.birthdate && formData.email;
      case 2:
        return formData.employment_type && formData.hire_date && formData.department;
      case 3:
        return formData.degree && formData.institution;
      case 4:
        return true; // Optional
      case 5:
        return true; // Optional
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Registro de Profesor</CardTitle>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s === step
                    ? "bg-[--color-tb-red] text-white"
                    : s < step
                    ? "bg-[--color-tb-navy] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-1 ${
                    s < step ? "bg-[--color-tb-navy]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Photo & Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--color-tb-navy]">Información Personal</h3>
            
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Preview" width={100} height={100} className="rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Foto</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateFormData("full_name", e.target.value)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => updateFormData("birthdate", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => updateFormData("nationality", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Dirección
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
              />
            </div>
          </div>
        )}

        {/* Step 2: Employment Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--color-tb-navy]">Información de Empleo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Tipo de Empleo *
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => updateFormData("employment_type", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                >
                  <option value="">Seleccionar</option>
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Departamento *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => updateFormData("department", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                >
                  <option value="">Seleccionar</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Fecha de Contratación *
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => updateFormData("hire_date", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Salario
                </label>
                <input
                  type="number"
                  value={formData.salary || ""}
                  onChange={(e) => updateFormData("salary", e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--color-tb-navy]">Antecedentes Educativos</h3>
            
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Grado Académico *
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => updateFormData("degree", e.target.value)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                placeholder="Ej: Bachelor's, Master's, PhD"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Campo de Estudio *
                </label>
                <input
                  type="text"
                  value={formData.field_of_study}
                  onChange={(e) => updateFormData("field_of_study", e.target.value)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  Año de Graduación
                </label>
                <input
                  type="number"
                  value={formData.graduation_year || ""}
                  onChange={(e) => updateFormData("graduation_year", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  min="1950"
                  max="2100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Institución *
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => updateFormData("institution", e.target.value)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                required
              />
            </div>
          </div>
        )}

        {/* Step 4: Teaching & Experience */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--color-tb-navy]">Materias y Experiencia</h3>
            
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Materias que Enseña
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                  className="flex-1 px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  placeholder="Agregar materia"
                />
                <Button type="button" onClick={addSubject}>Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.teaching_subjects.map(subject => (
                  <span key={subject} className="inline-flex items-center gap-1 px-3 py-1 bg-[--color-tb-navy]/10 text-[--color-tb-navy] rounded-full text-sm">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="text-[--color-tb-navy] hover:text-[--color-tb-red]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Años de Experiencia
              </label>
              <input
                type="number"
                value={formData.experience_years || ""}
                onChange={(e) => updateFormData("experience_years", e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Certificaciones
              </label>
              <div className="space-y-2 mb-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={currentCert.name}
                    onChange={(e) => setCurrentCert({ ...currentCert, name: e.target.value })}
                    placeholder="Nombre"
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                  <input
                    type="text"
                    value={currentCert.issuer}
                    onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                    placeholder="Emisor"
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                  <input
                    type="date"
                    value={currentCert.date}
                    onChange={(e) => setCurrentCert({ ...currentCert, date: e.target.value })}
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                </div>
                <Button type="button" onClick={addCertification} variant="outline" size="sm">
                  Agregar Certificación
                </Button>
              </div>
              <div className="space-y-1">
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="text-sm text-[--color-tb-shadow]">
                    {cert.name} - {cert.issuer} ({cert.date})
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Licencias
              </label>
              <div className="space-y-2 mb-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={currentLicense.name}
                    onChange={(e) => setCurrentLicense({ ...currentLicense, name: e.target.value })}
                    placeholder="Nombre"
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                  <input
                    type="text"
                    value={currentLicense.number}
                    onChange={(e) => setCurrentLicense({ ...currentLicense, number: e.target.value })}
                    placeholder="Número"
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                  <input
                    type="date"
                    value={currentLicense.expiry}
                    onChange={(e) => setCurrentLicense({ ...currentLicense, expiry: e.target.value })}
                    placeholder="Expiración"
                    className="px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                  />
                </div>
                <Button type="button" onClick={addLicense} variant="outline" size="sm">
                  Agregar Licencia
                </Button>
              </div>
              <div className="space-y-1">
                {formData.licenses.map((license, idx) => (
                  <div key={idx} className="text-sm text-[--color-tb-shadow]">
                    {license.name} - {license.number} (Exp: {license.expiry})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Notes */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--color-tb-navy]">Notas Adicionales</h3>
            
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => updateFormData("notes", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
                placeholder="Información adicional sobre el profesor..."
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Anterior
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="ml-2"
              >
                Cancelar
              </Button>
            )}
          </div>
          <div>
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || loading}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
              >
                {loading ? "Creando..." : "Crear Profesor"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

