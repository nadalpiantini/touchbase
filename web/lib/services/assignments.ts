// ============================================================
// TouchBase Academy - Assignments Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type Assignment = {
  id: string;
  class_id: string;
  module_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  due_date: string;
  assigned_at: string;
  created_at: string;
};

/**
 * Create a new assignment
 */
export async function createAssignment(
  supabase: SupabaseClient,
  data: {
    class_id: string;
    module_id: string;
    teacher_id: string;
    title: string;
    description?: string;
    due_date: string;
  }
): Promise<Assignment> {
  const { data: assignment, error } = await supabase
    .from("touchbase_assignments")
    .insert({
      class_id: data.class_id,
      module_id: data.module_id,
      teacher_id: data.teacher_id,
      title: data.title,
      description: data.description,
      due_date: data.due_date,
    })
    .select()
    .single();

  if (error) throw error;
  return assignment as Assignment;
}

/**
 * Get assignments for a class
 */
export async function getClassAssignments(
  supabase: SupabaseClient,
  classId: string,
  teacherId?: string
): Promise<Assignment[]> {
  let query = supabase
    .from("touchbase_assignments")
    .select("*")
    .eq("class_id", classId)
    .order("due_date", { ascending: true });

  if (teacherId) {
    query = query.eq("teacher_id", teacherId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Assignment[];
}

/**
 * Get assignments for a student (across all their classes)
 */
export async function getStudentAssignments(
  supabase: SupabaseClient,
  studentId: string
): Promise<Assignment[]> {
  // Get all classes where student is enrolled
  const { data: enrollments } = await supabase
    .from("touchbase_class_enrollments")
    .select("class_id")
    .eq("student_id", studentId);

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  const classIds = enrollments.map((e) => e.class_id);

  const { data, error } = await supabase
    .from("touchbase_assignments")
    .select("*")
    .in("class_id", classIds)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data || []) as Assignment[];
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw error;
}

