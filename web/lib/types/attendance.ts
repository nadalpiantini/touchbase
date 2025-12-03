// ============================================================
// TouchBase Academy - Attendance Types
// ============================================================

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type Attendance = {
  id: string;
  class_id: string;
  org_id: string;
  student_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  notes?: string;
  marked_by?: string;
  created_at: string;
  updated_at: string;
};

export type AttendanceNotification = {
  id: string;
  attendance_id: string;
  notification_type: "absence" | "pattern_alert" | "reminder";
  sent_at: string;
  recipient_id?: string;
  metadata?: Record<string, unknown>;
};

