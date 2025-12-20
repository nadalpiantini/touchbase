"use client";

import { useEffect, useState, useCallback } from "react";
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

type ClassStatus = "active" | "inactive" | "completed" | "cancelled";

type Class = {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  description: string | null;
  max_students: number;
  current_enrollment: number;
  start_date: string | null;
  end_date: string | null;
  schedule_description: string | null;
  status: ClassStatus;
  location: string | null;
  room: string | null;
  created_at: string;
};

interface ClassesListProps {
  onEdit?: (classItem: Class) => void;
  onView?: (classItem: Class) => void;
}

export default function ClassesList({ onEdit, onView }: ClassesListProps) {
  const t = useTranslations("classes");
  const { addToast } = useToast();
  const { can, loading: permissionsLoading } = usePermissions();

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Unique levels for filter dropdown
  const [levels, setLevels] = useState<string[]>([]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (levelFilter !== "all") {
        params.append("level", levelFilter);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/classes?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || t("errors.loadFailed"));
      }

      setClasses(json.data ?? []);

      // Extract unique levels
      const uniqueLevels = Array.from(
        new Set(
          (json.data ?? [])
            .map((c: Class) => c.level)
            .filter((l: string | null): l is string => l !== null)
        )
      ).sort() as string[];
      setLevels(uniqueLevels);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, levelFilter, searchQuery, t]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSearch = () => {
    loadClasses();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("confirmDelete", { name }))) return;

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || t("errors.deleteFailed"));
      }

      addToast(t("success.deleted"), "success");
      loadClasses();
    } catch (e: unknown) {
      addToast(
        e instanceof Error ? e.message : t("errors.deleteFailed"),
        "error"
      );
    }
  };

  const getStatusBadge = (status: ClassStatus) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {t(`status.${status}`)}
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const getCapacityDisplay = (current: number, max: number) => {
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
    const isFull = current >= max;
    const isAlmostFull = percentage >= 80 && !isFull;

    return (
      <div className="flex items-center gap-2">
        <span className="font-sans text-tb-shadow">
          {current}/{max}
        </span>
        <span
          className={`text-xs ${
            isFull
              ? "text-tb-red"
              : isAlmostFull
              ? "text-yellow-600"
              : "text-tb-shadow"
          }`}
        >
          ({percentage}%)
        </span>
      </div>
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
              <option value="completed">{t("status.completed")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </Select>
          </div>

          {/* Level Filter */}
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-tb-navy mb-1"
            >
              {t("filters.level")}
            </label>
            <Select
              id="level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">{t("filters.allLevels")}</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-tb-shadow">
        {t("resultsCount", { count: classes.length })}
      </div>

      {/* Table */}
      {classes.length === 0 ? (
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
                {t("table.code")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.level")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.capacity")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.schedule")}
              </TableHead>
              <TableHead className="font-display font-semibold text-tb-navy">
                {t("table.location")}
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
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell>
                  <div className="font-medium text-tb-ink">
                    {classItem.name}
                  </div>
                  {classItem.description && (
                    <div className="text-xs text-tb-shadow mt-0.5 line-clamp-1">
                      {classItem.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-tb-shadow">
                  {classItem.code || "-"}
                </TableCell>
                <TableCell className="font-sans text-tb-shadow">
                  {classItem.level || "-"}
                </TableCell>
                <TableCell>
                  {getCapacityDisplay(
                    classItem.current_enrollment,
                    classItem.max_students
                  )}
                </TableCell>
                <TableCell className="font-sans text-sm text-tb-shadow">
                  {classItem.start_date || classItem.end_date ? (
                    <div className="flex flex-col gap-0.5">
                      <div>
                        {formatDate(classItem.start_date)} -{" "}
                        {formatDate(classItem.end_date)}
                      </div>
                      {classItem.schedule_description && (
                        <div className="text-xs text-tb-shadow">
                          {classItem.schedule_description}
                        </div>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="font-sans text-sm text-tb-shadow">
                  {classItem.location || classItem.room ? (
                    <div>
                      <div>{classItem.location || "-"}</div>
                      {classItem.room && (
                        <div className="text-xs text-tb-shadow">
                          Room: {classItem.room}
                        </div>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {onView && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                      onClick={() => onView(classItem)}
                      aria-label={t("actions.view", {
                        name: classItem.name,
                      })}
                    >
                      {t("actions.view")}
                    </button>
                  )}
                  {canManage && onEdit && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-navy hover:text-tb-stitch transition"
                      onClick={() => onEdit(classItem)}
                      aria-label={t("actions.edit", {
                        name: classItem.name,
                      })}
                    >
                      {t("actions.edit")}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="text-sm font-sans text-tb-stitch hover:text-tb-red transition"
                      onClick={() => handleDelete(classItem.id, classItem.name)}
                      aria-label={t("actions.delete", {
                        name: classItem.name,
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
