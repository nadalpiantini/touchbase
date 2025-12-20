"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Badge, LoadingSpinner, Alert } from "@/components/ui";
import { CSVExportButton } from '@/components/export/CSVExportButton';

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
  const t = useTranslations('teachers');
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
        throw new Error(json?.error || t('error'));
      }

      setTeachers(json.teachers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t('error')}>
        {error}
      </Alert>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-tb-line rounded-xl p-8 text-center shadow-sm">
        <p className="font-sans text-tb-shadow">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CSVExportButton type="teachers" />
      </div>
      <div className="bg-white border border-tb-line rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full font-sans">
          <thead className="bg-tb-beige border-b border-tb-line">
            <tr>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.photo')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.name')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.email')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.phone')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.department')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.type')}</th>
              <th className="text-left p-4 font-display font-semibold text-tb-navy">{t('table.hireDate')}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-tb-line hover:bg-tb-bone transition">
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
                    <div className="w-10 h-10 rounded-full bg-tb-navy/10 flex items-center justify-center">
                      <span className="text-tb-navy font-display font-semibold text-sm">
                        {teacher.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 font-sans font-medium text-tb-ink">{teacher.full_name}</td>
                <td className="p-4 font-sans text-tb-shadow">{teacher.email || "—"}</td>
                <td className="p-4 font-sans text-tb-shadow">{teacher.phone || "—"}</td>
                <td className="p-4">
                  {teacher.department ? (
                    <Badge variant="info">{teacher.department}</Badge>
                  ) : (
                    <span className="font-sans text-tb-shadow">—</span>
                  )}
                </td>
                <td className="p-4 font-sans text-tb-shadow">{teacher.employment_type || "—"}</td>
                <td className="p-4 font-sans text-tb-shadow">
                  {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString("es-ES") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
