// ============================================================
// TouchBase Academy - Classes Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Class, ClassEnrollment } from "@/lib/types/education";

/**
 * Create a new class
 */
export async function createClass(
  supabase: SupabaseClient,
  orgId: string,
  teacherId: string,
  data: {
    name: string;
    code: string;
    gradeLevel?: string;
    description?: string;
    schedule?: any;
  }
): Promise<Class> {
  const { data: newClass, error } = await supabase
    .from("touchbase_classes")
    .insert({
      org_id: orgId,
      teacher_id: teacherId,
      name: data.name,
      code: data.code,
      grade_level: data.gradeLevel,
      description: data.description,
      schedule: data.schedule,
    })
    .select()
    .single();

  if (error) throw error;
  return newClass as Class;
}

/**
 * Get all classes for a teacher
 */
export async function getTeacherClasses(
  supabase: SupabaseClient,
  teacherId: string,
  orgId?: string
): Promise<Class[]> {
  let query = supabase
    .from("touchbase_classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (orgId) {
    query = query.eq("org_id", orgId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Class[];
}

/**
 * Get class by ID
 */
export async function getClassById(
  supabase: SupabaseClient,
  classId: string
): Promise<Class | null> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .eq("id", classId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Class;
}

/**
 * Get class by code (for students to join)
 */
export async function getClassByCode(
  supabase: SupabaseClient,
  code: string
): Promise<Class | null> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Class;
}

/**
 * Update class
 */
export async function updateClass(
  supabase: SupabaseClient,
  classId: string,
  updates: Partial<Pick<Class, "name" | "grade_level" | "description" | "schedule">>
): Promise<Class> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", classId)
    .select()
    .single();

  if (error) throw error;
  return data as Class;
}

/**
 * Enroll student in class
 */
export async function enrollStudentInClass(
  supabase: SupabaseClient,
  classId: string,
  studentId: string
): Promise<ClassEnrollment> {
  const { data, error } = await supabase
    .from("touchbase_class_enrollments")
    .insert({
      class_id: classId,
      student_id: studentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClassEnrollment;
}

/**
 * Get students enrolled in a class
 */
export async function getClassStudents(
  supabase: SupabaseClient,
  classId: string
): Promise<Array<{ enrollment: ClassEnrollment; student: { id: string; email: string; full_name: string } }>> {
  const { data, error } = await supabase
    .from("touchbase_class_enrollments")
    .select(`
      *,
      touchbase_profiles!touchbase_class_enrollments_student_id_fkey (
        id,
        email,
        full_name
      )
    `)
    .eq("class_id", classId)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    enrollment: {
      id: item.id,
      class_id: item.class_id,
      student_id: item.student_id,
      enrolled_at: item.enrolled_at,
    } as ClassEnrollment,
    student: item.touchbase_profiles,
  }));
}

/**
 * Generate unique class code
 */
export function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

