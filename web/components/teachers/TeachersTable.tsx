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
    return <div className="text-center py-8 text-[--color-tb-shadow]">Cargando profesores...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-[--color-tb-line] rounded-lg p-8 text-center">
        <p className="text-[--color-tb-shadow]">No hay profesores registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[--color-tb-line] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[--color-tb-bone] border-b border-[--color-tb-line]">
            <tr>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Foto</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Nombre</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Email</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Teléfono</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Departamento</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Tipo</th>
              <th className="text-left p-4 font-semibold text-[--color-tb-navy]">Fecha Contratación</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-[--color-tb-line] hover:bg-[--color-tb-bone]/50 transition">
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
                      <span className="text-[--color-tb-navy] font-semibold text-sm">
                        {teacher.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-[--color-tb-navy]">{teacher.full_name}</td>
                <td className="p-4 text-[--color-tb-shadow]">{teacher.email || "—"}</td>
                <td className="p-4 text-[--color-tb-shadow]">{teacher.phone || "—"}</td>
                <td className="p-4">
                  {teacher.department ? (
                    <Badge variant="info">{teacher.department}</Badge>
                  ) : (
                    <span className="text-[--color-tb-shadow]">—</span>
                  )}
                </td>
                <td className="p-4 text-[--color-tb-shadow]">{teacher.employment_type || "—"}</td>
                <td className="p-4 text-[--color-tb-shadow]">
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
