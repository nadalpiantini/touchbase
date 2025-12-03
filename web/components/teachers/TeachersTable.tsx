"use client";
import { useEffect, useState } from "react";

type Teacher = { 
  id: string; 
  full_name: string; 
  email: string | null; 
  phone: string | null;
  department: string | null;
  employment_type: string | null;
  teaching_subjects: string[] | null;
  created_at: string;
};

export default function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teachers/list");
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTeachers(data.teachers ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar profesores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-[--color-tb-line] rounded-lg p-6">
        <p className="text-[--color-tb-shadow]">Cargando profesores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[--color-tb-line] rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadTeachers}
          className="mt-2 px-4 py-2 bg-[--color-tb-red] text-white rounded-lg hover:bg-[--color-tb-stitch] transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-[--color-tb-line] rounded-lg p-6">
        <p className="text-[--color-tb-shadow]">No hay profesores registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[--color-tb-line] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[--color-tb-line]">
          <thead className="bg-[--color-tb-bone]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Tipo de Empleo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--color-tb-navy] uppercase tracking-wider">
                Materias
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[--color-tb-line]">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-[--color-tb-bone]/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[--color-tb-navy]">
                    {teacher.full_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[--color-tb-shadow]">
                    {teacher.email || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[--color-tb-shadow]">
                    {teacher.phone || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[--color-tb-shadow]">
                    {teacher.department || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[--color-tb-shadow]">
                    {teacher.employment_type || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[--color-tb-shadow]">
                    {teacher.teaching_subjects && teacher.teaching_subjects.length > 0
                      ? teacher.teaching_subjects.join(", ")
                      : "-"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

