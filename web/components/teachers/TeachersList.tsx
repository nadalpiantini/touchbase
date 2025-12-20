"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LoadingSpinner,
  Alert,
  useToast,
  Input,
  Select,
} from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { usePermissions } from "@/lib/hooks/usePermissions";

type Teacher = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  position: string | null;
  status: "active" | "inactive" | "on_leave" | "terminated";
  years_experience: number;
  created_at: string;
};

interface TeachersListProps {
  onEdit?: (teacher: Teacher) => void;
  onView?: (teacher: Teacher) => void;
}

export default function TeachersList({ onEdit, onView }: TeachersListProps) {
  const t = useTranslations("teachers");
  const { addToast } = useToast();
  const { can, loading: permissionsLoading } = usePermissions();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Unique departments for filter dropdown
  const [departments, setDepartments] = useState<string[]>([]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (departmentFilter !== "all") {
        params.append("department", departmentFilter);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/teachers?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || t("errors.loadFailed"));
      }

      setTeachers(json.data ?? []);

      // Extract unique departments
      const uniqueDepts = Array.from(
        new Set(
          (json.data ?? [])
            .map((t: Teacher) => t.department)
            .filter((d: string | null): d is string => d !== null)
        )
      ).sort() as string[];
      setDepartments(uniqueDepts);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, departmentFilter]);

  const handleSearch = () => {
    loadTeachers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("confirmDelete", { name }))) return;

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || t("errors.deleteFailed"));
      }

      addToast(t("success.deleted"), "success");
      loadTeachers();
    } catch (e: unknown) {
      addToast(
        e instanceof Error ? e.message : t("errors.deleteFailed"),
        "error"
      );
    }
  };

  const getStatusBadge = (status: Teacher["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      on_leave: "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {t(`status.${status}`)}
      </span>
    );
  };

  if (permissionsLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text={t("loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t("error")}>
        {error}
      </Alert>
    );
  }

  const canManage = can("UPDATE_CONTENT");
  const canDelete = can("DELETE_CONTENT");

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-tb-line rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-tb-navy mb-1"
            >
              {t("filters.search")}
            </label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder={t("filters.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-tb-navy text-white rounded-lg hover:bg-tb-stitch transition"
              >
                {t("filters.searchButton")}
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-tb-navy mb-1"
            >
              {t("filters.status")}
            </label>
            <Select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("filters.allStatuses")}</option>
              <option value="active">{t("status.active")}</option>
              <option value="inactive">{t("status.inactive")}</option>
              <option value="on_leave">{t("status.on_leave")}</option>
              <option value="terminated">{t("status.terminated")}</option>
            </Select>
          </div>

          {/* Department Filter */}
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-tb-navy mb-1"
            >
              {t("filters.department")}
            </label>
            <Select
              id="department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">{t("filters.allDepartments")}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-tb-shadow">
        {t("resultsCount", { count: teachers.length })}
      </div>

      {/* Table */}
      {teachers.length === 0 ? (
        <div className="bg-white border border-tb-line rounded-xl p-8 text-center shadow-sm">
          <p className="font-sans text-tb-shadow">{t("empty")}</p>
        </div>
      ) : (
        <Table className="font-sans">
          <TableHeader>
            <TableRow>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.name")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.email")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.department")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.position")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.experience")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.status")}
              </TableHead>
              <TableHead className="text-right font-display font-semibold text-tb-navy">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <div className="font-medium text-tb-ink">
                    {teacher.first_name} {teacher.last_name}
                  </div>
                </TableCell>
                <TableCell className="font-sans text-tb-shadow">
                  {teacher.email}
                </TableCell>
                <TableCell className="font-sans text-tb-shadow">
                  {teacher.department || "-"}
                </TableCell>
                <TableCell className="font-sans text-tb-shadow">
                  {teacher.position || "-"}
                </TableCell>
                <TableCell className="font-sans text-tb-shadow">
                  {teacher.years_experience}{" "}
                  {t("table.years", { count: teacher.years_experience })}
                </TableCell>
                <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {onView && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                      onClick={() => onView(teacher)}
                      aria-label={t("actions.view", {
                        name: `${teacher.first_name} ${teacher.last_name}`,
                      })}
                    >
                      {t("actions.view")}
                    </button>
                  )}
                  {canManage && onEdit && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                      onClick={() => onEdit(teacher)}
                      aria-label={t("actions.edit", {
                        name: `${teacher.first_name} ${teacher.last_name}`,
                      })}
                    >
                      {t("actions.edit")}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-stitch hover:text-tb-red transition"
                      onClick={() =>
                        handleDelete(
                          teacher.id,
                          `${teacher.first_name} ${teacher.last_name}`
                        )
                      }
                      aria-label={t("actions.delete", {
                        name: `${teacher.first_name} ${teacher.last_name}`,
                      })}
                    >
                      {t("actions.delete")}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
