// ============================================================
// TouchBase Academy - Schedule Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { ClassSchedule, ScheduleException } from "@/lib/types/schedule";

/**
 * Get schedules for a class
 */
export async function getClassSchedules(
  supabase: SupabaseClient,
  classId: string
): Promise<ClassSchedule[]> {
  const { data, error } = await supabase
    .from("touchbase_class_schedules")
    .select("*")
    .eq("class_id", classId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data || []) as ClassSchedule[];
}

/**
 * Create a schedule for a class
 */
export async function createClassSchedule(
  supabase: SupabaseClient,
  classId: string,
  orgId: string,
  data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone?: string;
    is_recurring?: boolean;
    start_date?: string;
    end_date?: string;
  }
): Promise<ClassSchedule> {
  const { data: schedule, error } = await supabase
    .from("touchbase_class_schedules")
    .insert({
      class_id: classId,
      org_id: orgId,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      timezone: data.timezone || "UTC",
      is_recurring: data.is_recurring ?? true,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    .select()
    .single();

  if (error) throw error;
  return schedule as ClassSchedule;
}

/**
 * Update a schedule
 */
export async function updateClassSchedule(
  supabase: SupabaseClient,
  scheduleId: string,
  updates: Partial<ClassSchedule>
): Promise<ClassSchedule> {
  const { data, error } = await supabase
    .from("touchbase_class_schedules")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data as ClassSchedule;
}

/**
 * Delete a schedule
 */
export async function deleteClassSchedule(
  supabase: SupabaseClient,
  scheduleId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_class_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) throw error;
}

/**
 * Get schedule exceptions for a class
 */
export async function getScheduleExceptions(
  supabase: SupabaseClient,
  classId: string,
  startDate?: string,
  endDate?: string
): Promise<ScheduleException[]> {
  let query = supabase
    .from("touchbase_schedule_exceptions")
    .select("*")
    .eq("class_id", classId);

  if (startDate) {
    query = query.gte("exception_date", startDate);
  }
  if (endDate) {
    query = query.lte("exception_date", endDate);
  }

  const { data, error } = await query.order("exception_date", { ascending: true });

  if (error) throw error;
  return (data || []) as ScheduleException[];
}

/**
 * Create a schedule exception
 */
export async function createScheduleException(
  supabase: SupabaseClient,
  classId: string,
  data: {
    exception_date: string;
    reason?: string;
    is_cancelled?: boolean;
  }
): Promise<ScheduleException> {
  const { data: exception, error } = await supabase
    .from("touchbase_schedule_exceptions")
    .insert({
      class_id: classId,
      exception_date: data.exception_date,
      reason: data.reason,
      is_cancelled: data.is_cancelled ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return exception as ScheduleException;
}

