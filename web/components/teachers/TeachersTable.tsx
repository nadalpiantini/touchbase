"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Badge, LoadingSpinner, Alert, useToast } from "@/components/ui";
import { CSVExportButton } from '@/components/export/CSVExportButton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

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
  const { addToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const deleteTeacher = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const res = await fetch("/api/teachers/soft-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const json = await res.json();
      addToast(json.error || t('deleteFailed'), 'error');
      return;
    }
    loadTeachers();
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
      <Table className="font-sans">
        <TableHeader>
          <TableRow>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.photo')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.name')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.email')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.phone')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.department')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.type')}</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">{t('table.hireDate')}</TableHead>
            <TableHead className="text-right font-display font-semibold text-tb-navy">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>
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
              </TableCell>
              <TableCell className="font-sans font-medium text-tb-ink">{teacher.full_name}</TableCell>
              <TableCell className="font-sans text-tb-shadow">{teacher.email || "—"}</TableCell>
              <TableCell className="font-sans text-tb-shadow">{teacher.phone || "—"}</TableCell>
              <TableCell>
                {teacher.department ? (
                  <Badge variant="info">{teacher.department}</Badge>
                ) : (
                  <span className="font-sans text-tb-shadow">—</span>
                )}
              </TableCell>
              <TableCell className="font-sans text-tb-shadow">{teacher.employment_type || "—"}</TableCell>
              <TableCell className="font-sans text-tb-shadow">
                {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString("es-ES") : "—"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <button
                  type="button"
                  className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                  onClick={() => addToast(t('editNotImplemented'), 'info')}
                  aria-label={`Editar ${teacher.full_name}`}
                >
                  {t('actions.edit')}
                </button>
                <button
                  type="button"
                  className="text-sm font-sans text-tb-stitch hover:text-tb-red transition"
                  onClick={() => deleteTeacher(teacher.id)}
                  aria-label={`Eliminar ${teacher.full_name}`}
                >
                  {t('actions.delete')}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
