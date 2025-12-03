"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

type WellnessProgramFormProps = {
  onSubmit: (data: {
    name: string;
    description?: string;
    program_type: string;
    start_date: string;
    end_date?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function WellnessProgramForm({ onSubmit, onCancel }: WellnessProgramFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    program_type: "nutrition",
    start_date: "",
    end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        description: "",
        program_type: "nutrition",
        start_date: "",
        end_date: "",
      });
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del Programa *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <div>
        <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
          Tipo de Programa *
        </label>
        <select
          value={formData.program_type}
          onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
          className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
          required
        >
          <option value="nutrition">Nutrición</option>
          <option value="mental_health">Salud Mental</option>
          <option value="physical_fitness">Fitness Físico</option>
          <option value="wellness">Bienestar General</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de Inicio *"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          required
        />
        <Input
          label="Fecha de Fin"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creando..." : "Crear Programa"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

