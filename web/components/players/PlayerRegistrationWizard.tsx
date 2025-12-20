"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Image from "next/image";

type PlayerData = {
  // Step 1: Photo & Basic Info
  photo_url?: string;
  full_name: string;
  birthdate: string;
  email: string;
  phone: string;
  country: string;
  
  // Step 2: Baseball Info
  team_id?: string;
  jersey_number?: number;
  position: string;
  affiliate: string;
  signing_year?: number;
  
  // Step 3: Family Info
  family_info: {
    parent_name?: string;
    parent_phone?: string;
    parent_email?: string;
    emergency_contact?: string;
    emergency_phone?: string;
  };
  
  // Step 4: Academic Levels
  academic_level: string;
  english_level: string;
  spanish_level: string;
  math_level: string;
  science_level: string;
  
  // Step 5: Notes
  notes?: string;
};

const ACADEMIC_LEVELS = ["Beginner", "Elementary", "Intermediate", "Advanced", "Proficient"];
const POSITIONS = ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Hitter"];

export default function PlayerRegistrationWizard({ onComplete, onCancel }: { onComplete?: () => void; onCancel?: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<PlayerData>({
    full_name: "",
    birthdate: "",
    email: "",
    phone: "",
    country: "",
    position: "",
    affiliate: "",
    family_info: {},
    academic_level: "",
    english_level: "",
    spanish_level: "",
    math_level: "",
    science_level: "",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFormData = (field: keyof PlayerData, value: any) => {
    setFormData(prev => {
      if (field === 'family_info') {
        return { ...prev, family_info: { ...prev.family_info, ...value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let photoUrl = formData.photo_url;

      // Upload photo if provided
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('folder', 'avatars');

        const uploadRes = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const { error } = await uploadRes.json();
          throw new Error(error || 'Failed to upload image');
        }

        const { url } = await uploadRes.json();
        photoUrl = url;
      }

      const res = await fetch("/api/players/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photo_url: photoUrl }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || "Error al crear jugador");
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
        return formData.position && formData.affiliate;
      case 3:
        return true; // Family info is optional
      case 4:
        return formData.academic_level && formData.english_level && formData.spanish_level && formData.math_level && formData.science_level;
      case 5:
        return true; // Notes are optional
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Registro de Jugador</CardTitle>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s === step
                    ? "bg-tb-red text-white"
                    : s < step
                    ? "bg-tb-navy text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-1 ${
                    s < step ? "bg-tb-navy" : "bg-gray-200"
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

        {/* Step 1: Photo & Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-tb-navy">Información Personal</h3>
            
            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateFormData("full_name", e.target.value)}
                className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => updateFormData("birthdate", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Baseball Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-tb-navy">Información de Béisbol</h3>
            
            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                Posición *
              </label>
              <select
                value={formData.position}
                onChange={(e) => updateFormData("position", e.target.value)}
                className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                required
              >
                <option value="">Seleccionar posición</option>
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Afiliación *
                </label>
                <input
                  type="text"
                  value={formData.affiliate}
                  onChange={(e) => updateFormData("affiliate", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Año de Firma
                </label>
                <input
                  type="number"
                  value={formData.signing_year || ""}
                  onChange={(e) => updateFormData("signing_year", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Número de Camiseta
                </label>
                <input
                  type="number"
                  value={formData.jersey_number || ""}
                  onChange={(e) => updateFormData("jersey_number", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  min="1"
                  max="99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Equipo
                </label>
                <select
                  value={formData.team_id || ""}
                  onChange={(e) => updateFormData("team_id", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                >
                  <option value="">Sin equipo</option>
                  {/* TODO: Load teams */}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Family Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-tb-navy">Información Familiar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Nombre del Padre/Madre
                </label>
                <input
                  type="text"
                  value={formData.family_info.parent_name || ""}
                  onChange={(e) => updateFormData("family_info", { parent_name: e.target.value })}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Teléfono del Padre/Madre
                </label>
                <input
                  type="tel"
                  value={formData.family_info.parent_phone || ""}
                  onChange={(e) => updateFormData("family_info", { parent_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                Email del Padre/Madre
              </label>
              <input
                type="email"
                value={formData.family_info.parent_email || ""}
                onChange={(e) => updateFormData("family_info", { parent_email: e.target.value })}
                className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Contacto de Emergencia
                </label>
                <input
                  type="text"
                  value={formData.family_info.emergency_contact || ""}
                  onChange={(e) => updateFormData("family_info", { emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Teléfono de Emergencia
                </label>
                <input
                  type="tel"
                  value={formData.family_info.emergency_phone || ""}
                  onChange={(e) => updateFormData("family_info", { emergency_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Academic Levels */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-tb-navy">Niveles Académicos</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Nivel Académico General *
                </label>
                <select
                  value={formData.academic_level}
                  onChange={(e) => updateFormData("academic_level", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {ACADEMIC_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Nivel de Inglés *
                </label>
                <select
                  value={formData.english_level}
                  onChange={(e) => updateFormData("english_level", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {ACADEMIC_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Nivel de Español *
                </label>
                <select
                  value={formData.spanish_level}
                  onChange={(e) => updateFormData("spanish_level", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {ACADEMIC_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Nivel de Matemáticas *
                </label>
                <select
                  value={formData.math_level}
                  onChange={(e) => updateFormData("math_level", e.target.value)}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {ACADEMIC_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                Nivel de Ciencias *
              </label>
              <select
                value={formData.science_level}
                onChange={(e) => updateFormData("science_level", e.target.value)}
                className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                required
              >
                <option value="">Seleccionar nivel</option>
                {ACADEMIC_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Notes */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-tb-navy">Notas Adicionales</h3>
            
            <div>
              <label className="block text-sm font-medium text-tb-navy mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => updateFormData("notes", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                placeholder="Información adicional sobre el jugador..."
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
                {loading ? "Creando..." : "Crear Jugador"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

