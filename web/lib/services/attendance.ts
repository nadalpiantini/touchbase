// ============================================================
// TouchBase Academy - Attendance Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Attendance, AttendanceStatus } from "@/lib/types/attendance";

/**
 * Get attendance for a class on a specific date
 */
export async function getClassAttendance(
  supabase: SupabaseClient,
  classId: string,
  date: string
): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("touchbase_attendance")
    .select("*")
    .eq("class_id", classId)
    .eq("attendance_date", date)
    .order("student_id", { ascending: true });

  if (error) throw error;
  return (data || []) as Attendance[];
}

/**
 * Get attendance for a student
 */
export async function getStudentAttendance(
  supabase: SupabaseClient,
  studentId: string,
  classId?: string,
  startDate?: string,
  endDate?: string
): Promise<Attendance[]> {
  let query = supabase
    .from("touchbase_attendance")
    .select("*")
    .eq("student_id", studentId);

  if (classId) {
    query = query.eq("class_id", classId);
  }
  if (startDate) {
    query = query.gte("attendance_date", startDate);
  }
  if (endDate) {
    query = query.lte("attendance_date", endDate);
  }

  const { data, error } = await query.order("attendance_date", { ascending: false });

  if (error) throw error;
  return (data || []) as Attendance[];
}

/**
 * Mark attendance for multiple students
 */
export async function markAttendanceBulk(
  supabase: SupabaseClient,
  classId: string,
  date: string,
  records: Array<{
    student_id: string;
    status: AttendanceStatus;
    notes?: string;
  }>
): Promise<Attendance[]> {
  const { data, error } = await supabase.rpc("touchbase_mark_attendance_bulk", {
    p_class_id: classId,
    p_attendance_date: date,
    p_attendance_records: records,
  });

  if (error) throw error;
  return (data || []) as Attendance[];
}

/**
 * Get attendance statistics for a class
 */
export async function getAttendanceStats(
  supabase: SupabaseClient,
  classId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  total_days: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
}> {
  let query = supabase
    .from("touchbase_attendance")
    .select("status")
    .eq("class_id", classId);

  if (startDate) {
    query = query.gte("attendance_date", startDate);
  }
  if (endDate) {
    query = query.lte("attendance_date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = {
    total_days: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    excused_count: 0,
    attendance_rate: 0,
  };

  if (data) {
    data.forEach((record) => {
      stats.total_days++;
      if (record.status === "present") stats.present_count++;
      else if (record.status === "absent") stats.absent_count++;
      else if (record.status === "late") stats.late_count++;
      else if (record.status === "excused") stats.excused_count++;
    });

    stats.attendance_rate =
      stats.total_days > 0
        ? ((stats.present_count + stats.late_count + stats.excused_count) / stats.total_days) * 100
        : 0;
  }

  return stats;
}

