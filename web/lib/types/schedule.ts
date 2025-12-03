// ============================================================
// TouchBase Academy - Schedule Types
// ============================================================

export type ClassSchedule = {
  id: string;
  class_id: string;
  org_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  timezone: string;
  is_recurring: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
};

export type ScheduleException = {
  id: string;
  class_id: string;
  exception_date: string;
  reason?: string;
  is_cancelled: boolean;
  created_at: string;
};

