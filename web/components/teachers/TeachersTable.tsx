"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui";

type Teacher = {
  id: string;
  full_name: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  department?: string;
  employment_type?: string;
  hire_date?: string;
  created_at: string;
};

export default function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await fetch("/api/teachers/list");
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || "Error al cargar profesores");
      }

      setTeachers(json.teachers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando profesores..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-[--color-tb-line] rounded-xl p-8 text-center shadow-sm">
        <p className="font-sans text-[--color-tb-shadow]">No hay profesores registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[--color-tb-line] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full font-sans">
          <thead className="bg-[--color-tb-beige] border-b border-[--color-tb-line]">
            <tr>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Foto</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Nombre</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Email</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Teléfono</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Departamento</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Tipo</th>
              <th className="text-left p-4 font-display font-semibold text-[--color-tb-navy]">Fecha Contratación</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-[--color-tb-line] hover:bg-[--color-tb-bone] transition">
                <td className="p-4">
                  {teacher.photo_url ? (
                    <Image
                      src={teacher.photo_url}
                      alt={teacher.full_name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[--color-tb-navy]/10 flex items-center justify-center">
                      <span className="text-[--color-tb-navy] font-display font-semibold text-sm">
                        {teacher.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 font-sans font-medium text-[--color-tb-ink]">{teacher.full_name}</td>
                <td className="p-4 font-sans text-[--color-tb-shadow]">{teacher.email || "—"}</td>
                <td className="p-4 font-sans text-[--color-tb-shadow]">{teacher.phone || "—"}</td>
                <td className="p-4">
                  {teacher.department ? (
                    <Badge variant="info">{teacher.department}</Badge>
                  ) : (
                    <span className="font-sans text-[--color-tb-shadow]">—</span>
                  )}
                </td>
                <td className="p-4 font-sans text-[--color-tb-shadow]">{teacher.employment_type || "—"}</td>
                <td className="p-4 font-sans text-[--color-tb-shadow]">
                  {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString("es-ES") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
