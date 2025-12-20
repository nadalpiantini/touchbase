/**
 * Classes Service
 * CRUD operations and business logic for class/course management
 * @module lib/services/classes
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type ClassStatus = "active" | "inactive" | "completed" | "cancelled";
export type EnrollmentStatus = "enrolled" | "active" | "completed" | "dropped" | "withdrawn";

export interface Class {
  id: string;
  org_id: string;

  // Class Information
  name: string;
  code: string | null;
  level: string | null;
  description: string | null;

  // Capacity
  max_students: number;
  current_enrollment: number;

  // Schedule & Duration
  start_date: string | null;
  end_date: string | null;
  schedule_description: string | null;

  // Status
  status: ClassStatus;

  // Location
  location: string | null;
  room: string | null;

  // System Fields
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateClassInput {
  name: string;
  code?: string;
  level?: string;
  description?: string;
  max_students?: number;
  start_date?: string;
  end_date?: string;
  schedule_description?: string;
  status?: ClassStatus;
  location?: string;
  room?: string;
}

export interface UpdateClassInput {
  name?: string;
  code?: string;
  level?: string;
  description?: string;
  max_students?: number;
  start_date?: string;
  end_date?: string;
  schedule_description?: string;
  status?: ClassStatus;
  location?: string;
  room?: string;
}

export interface Enrollment {
  id: number;
  class_id: string;
  student_id: string;

  // Enrollment Status
  status: EnrollmentStatus;
  enrolled_date: string;
  completion_date: string | null;

  // Academic
  grade: string | null;
  final_score: number | null;
  attendance_rate: number | null;

  // Notes
  notes: string | null;

  // Metadata
  enrolled_by: string | null;
  withdrawn_date: string | null;
  withdrawn_reason: string | null;

  // System Fields
  created_at: string;
  updated_at: string;
}

export interface CreateEnrollmentInput {
  class_id: string;
  student_id: string;
  status?: EnrollmentStatus;
  notes?: string;
}

export interface UpdateEnrollmentInput {
  status?: EnrollmentStatus;
  completion_date?: string;
  grade?: string;
  final_score?: number;
  attendance_rate?: number;
  notes?: string;
  withdrawn_date?: string;
  withdrawn_reason?: string;
}

export interface ClassFilters {
  status?: ClassStatus | ClassStatus[];
  level?: string;
  search?: string;
}

// =====================================================
// Class CRUD Operations
// =====================================================

/**
 * Get all classes for organization with filters
 */
export async function getClasses(
  supabase: SupabaseClient,
  filters?: ClassFilters
): Promise<Class[]> {
  let query = supabase
    .from("touchbase_classes")
    .select("*")
    .order("name", { ascending: true });

  // Apply status filter
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in("status", filters.status);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  // Apply level filter
  if (filters?.level) {
    query = query.eq("level", filters.level);
  }

  // Apply search filter
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching classes:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get active classes (using RPC function)
 */
export async function getActiveClasses(
  supabase: SupabaseClient,
  orgId: string
): Promise<Class[]> {
  const { data, error } = await supabase.rpc("touchbase_get_active_classes", {
    p_org_id: orgId,
  });

  if (error) {
    console.error("Error fetching active classes:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get single class by ID
 */
export async function getClass(
  supabase: SupabaseClient,
  id: string
): Promise<Class | null> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching class:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create new class
 */
export async function createClass(
  supabase: SupabaseClient,
  input: CreateClassInput
): Promise<Class> {
  // Get current user's org_id
  const { data: userOrg } = await supabase
    .from("touchbase_user_organizations")
    .select("org_id")
    .single();

  if (!userOrg) {
    throw new Error("User organization not found");
  }

  const { data: user } = await supabase.auth.getUser();

  const classData = {
    ...input,
    org_id: userOrg.org_id,
    created_by: user.user?.id,
  };

  const { data, error } = await supabase
    .from("touchbase_classes")
    .insert(classData)
    .select()
    .single();

  if (error) {
    console.error("Error creating class:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update class
 */
export async function updateClass(
  supabase: SupabaseClient,
  id: string,
  input: UpdateClassInput
): Promise<Class> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating class:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete class (soft delete by setting status to cancelled)
 */
export async function deleteClass(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_classes")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    console.error("Error deleting class:", error);
    throw new Error(error.message);
  }
}

/**
 * Hard delete class (permanent)
 */
export async function hardDeleteClass(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_classes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error hard deleting class:", error);
    throw new Error(error.message);
  }
}

/**
 * Get classes by level
 */
export async function getClassesByLevel(
  supabase: SupabaseClient,
  level: string
): Promise<Class[]> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .eq("level", level)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching classes by level:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Search classes
 */
export async function searchClasses(
  supabase: SupabaseClient,
  query: string
): Promise<Class[]> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .or(`name.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error searching classes:", error);
    throw new Error(error.message);
  }

  return data || [];
}

// =====================================================
// Enrollment Operations
// =====================================================

/**
 * Get class enrollments
 */
export async function getClassEnrollments(
  supabase: SupabaseClient,
  classId: string
): Promise<Enrollment[]> {
  const { data, error } = await supabase.rpc("touchbase_get_class_enrollments", {
    p_class_id: classId,
  });

  if (error) {
    console.error("Error fetching class enrollments:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get student's enrolled classes
 */
export async function getStudentClasses(
  supabase: SupabaseClient,
  studentId: string
): Promise<Class[]> {
  const { data, error } = await supabase.rpc("touchbase_get_student_classes", {
    p_student_id: studentId,
  });

  if (error) {
    console.error("Error fetching student classes:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Enroll student in class
 */
export async function enrollStudent(
  supabase: SupabaseClient,
  input: CreateEnrollmentInput
): Promise<Enrollment> {
  // Check if class is at capacity
  const classData = await getClass(supabase, input.class_id);

  if (!classData) {
    throw new Error("Class not found");
  }

  if (
    classData.max_students > 0 &&
    classData.current_enrollment >= classData.max_students
  ) {
    throw new Error("Class is at full capacity");
  }

  // Get current user for enrolled_by
  const { data: user } = await supabase.auth.getUser();

  const enrollmentData = {
    ...input,
    enrolled_by: user.user?.id,
  };

  const { data, error } = await supabase
    .from("touchbase_enrollments")
    .insert(enrollmentData)
    .select()
    .single();

  if (error) {
    console.error("Error enrolling student:", error);

    // Handle unique constraint violation
    if (error.code === "23505") {
      throw new Error("Student is already enrolled in this class");
    }

    throw new Error(error.message);
  }

  return data;
}

/**
 * Update enrollment
 */
export async function updateEnrollment(
  supabase: SupabaseClient,
  id: number,
  input: UpdateEnrollmentInput
): Promise<Enrollment> {
  const { data, error } = await supabase
    .from("touchbase_enrollments")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating enrollment:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Withdraw student from class
 */
export async function withdrawStudent(
  supabase: SupabaseClient,
  enrollmentId: number,
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_enrollments")
    .update({
      status: "withdrawn",
      withdrawn_date: new Date().toISOString(),
      withdrawn_reason: reason,
    })
    .eq("id", enrollmentId);

  if (error) {
    console.error("Error withdrawing student:", error);
    throw new Error(error.message);
  }
}

/**
 * Delete enrollment (permanent)
 */
export async function deleteEnrollment(
  supabase: SupabaseClient,
  id: number
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_enrollments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting enrollment:", error);
    throw new Error(error.message);
  }
}

/**
 * Generate a unique 6-character alphanumeric class code
 */
export function generateClassCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Get a class by its unique code
 */
export async function getClassByCode(
  supabase: SupabaseClient,
  code: string
): Promise<Class | null> {
  const { data, error } = await supabase
    .from("touchbase_classes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Error fetching class by code:", error);
    throw new Error(error.message);
  }

  return data;
}
