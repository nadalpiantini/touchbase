/**
 * Teachers Service
 * CRUD operations and business logic for teacher management
 * @module lib/services/teachers
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type TeacherStatus = "active" | "inactive" | "on_leave" | "terminated";

export interface Teacher {
  id: string;
  org_id: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  profile_photo_url: string | null;
  
  // Professional Information
  certifications: string[];
  specializations: string[];
  years_experience: number;
  bio: string | null;
  department: string | null;
  position: string | null;
  
  // Employment Details
  hire_date: string | null;
  status: TeacherStatus;
  employment_type: string | null;
  
  // Contact & Emergency
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  
  // System Fields
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateTeacherInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  certifications?: string[];
  specializations?: string[];
  years_experience?: number;
  bio?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status?: TeacherStatus;
  employment_type?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface UpdateTeacherInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  certifications?: string[];
  specializations?: string[];
  years_experience?: number;
  bio?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status?: TeacherStatus;
  employment_type?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface TeacherClass {
  id: number;
  teacher_id: string;
  class_id: string;
  role: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface TeacherAvailability {
  id: number;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

/**
 * Get all teachers for an organization
 */
export async function getTeachers(
  supabase: SupabaseClient,
  orgId: string,
  filters?: {
    status?: TeacherStatus;
    department?: string;
    search?: string;
  }
): Promise<Teacher[]> {
  let query = supabase
    .from("touchbase_teachers")
    .select("*")
    .eq("org_id", orgId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.department) {
    query = query.eq("department", filters.department);
  }

  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }

  return (data || []) as Teacher[];
}

/**
 * Get active teachers using RPC function
 */
export async function getActiveTeachers(
  supabase: SupabaseClient,
  orgId: string
): Promise<Partial<Teacher>[]> {
  const { data, error } = await supabase.rpc("touchbase_get_active_teachers", {
    p_org_id: orgId,
  });

  if (error) {
    console.error("Error fetching active teachers:", error);
    throw error;
  }

  return (data || []) as Partial<Teacher>[];
}

/**
 * Get single teacher by ID
 */
export async function getTeacher(
  supabase: SupabaseClient,
  teacherId: string
): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from("touchbase_teachers")
    .select("*")
    .eq("id", teacherId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching teacher:", error);
    throw error;
  }

  return data as Teacher;
}

/**
 * Create new teacher
 */
export async function createTeacher(
  supabase: SupabaseClient,
  orgId: string,
  input: CreateTeacherInput
): Promise<Teacher> {
  const { data: { user } } = await supabase.auth.getUser();

  const teacherData = {
    org_id: orgId,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone || null,
    date_of_birth: input.date_of_birth || null,
    profile_photo_url: input.profile_photo_url || null,
    certifications: input.certifications || [],
    specializations: input.specializations || [],
    years_experience: input.years_experience || 0,
    bio: input.bio || null,
    department: input.department || null,
    position: input.position || null,
    hire_date: input.hire_date || null,
    status: input.status || "active",
    employment_type: input.employment_type || null,
    address: input.address || null,
    emergency_contact_name: input.emergency_contact_name || null,
    emergency_contact_phone: input.emergency_contact_phone || null,
    emergency_contact_relationship: input.emergency_contact_relationship || null,
    created_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from("touchbase_teachers")
    .insert(teacherData)
    .select()
    .single();

  if (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }

  return data as Teacher;
}

/**
 * Update teacher
 */
export async function updateTeacher(
  supabase: SupabaseClient,
  teacherId: string,
  input: UpdateTeacherInput
): Promise<Teacher> {
  const { data, error } = await supabase
    .from("touchbase_teachers")
    .update(input)
    .eq("id", teacherId)
    .select()
    .single();

  if (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }

  return data as Teacher;
}

/**
 * Delete teacher
 */
export async function deleteTeacher(
  supabase: SupabaseClient,
  teacherId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_teachers")
    .delete()
    .eq("id", teacherId);

  if (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
}

/**
 * Get teacher's classes
 */
export async function getTeacherClasses(
  supabase: SupabaseClient,
  teacherId: string
): Promise<TeacherClass[]> {
  const { data, error } = await supabase.rpc("touchbase_get_teacher_classes", {
    p_teacher_id: teacherId,
  });

  if (error) {
    console.error("Error fetching teacher classes:", error);
    throw error;
  }

  return (data || []) as TeacherClass[];
}

/**
 * Assign teacher to class
 */
export async function assignTeacherToClass(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string,
  role: string = "primary"
): Promise<TeacherClass> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("touchbase_teacher_classes")
    .insert({
      teacher_id: teacherId,
      class_id: classId,
      role,
      assigned_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error assigning teacher to class:", error);
    throw error;
  }

  return data as TeacherClass;
}

/**
 * Remove teacher from class
 */
export async function removeTeacherFromClass(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_teacher_classes")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("class_id", classId);

  if (error) {
    console.error("Error removing teacher from class:", error);
    throw error;
  }
}

/**
 * Get teacher availability
 */
export async function getTeacherAvailability(
  supabase: SupabaseClient,
  teacherId: string
): Promise<TeacherAvailability[]> {
  const { data, error } = await supabase.rpc("touchbase_get_teacher_availability", {
    p_teacher_id: teacherId,
  });

  if (error) {
    console.error("Error fetching teacher availability:", error);
    throw error;
  }

  return (data || []) as TeacherAvailability[];
}

/**
 * Set teacher availability
 */
export async function setTeacherAvailability(
  supabase: SupabaseClient,
  teacherId: string,
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>
): Promise<void> {
  // Delete existing availability
  await supabase
    .from("touchbase_teacher_availability")
    .delete()
    .eq("teacher_id", teacherId);

  // Insert new availability
  if (availability.length > 0) {
    const records = availability.map((slot) => ({
      teacher_id: teacherId,
      ...slot,
    }));

    const { error } = await supabase
      .from("touchbase_teacher_availability")
      .insert(records);

    if (error) {
      console.error("Error setting teacher availability:", error);
      throw error;
    }
  }
}

/**
 * Get teachers by department
 */
export async function getTeachersByDepartment(
  supabase: SupabaseClient,
  orgId: string,
  department: string
): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("touchbase_teachers")
    .select("*")
    .eq("org_id", orgId)
    .eq("department", department)
    .eq("status", "active")
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching teachers by department:", error);
    throw error;
  }

  return (data || []) as Teacher[];
}

/**
 * Search teachers
 */
export async function searchTeachers(
  supabase: SupabaseClient,
  orgId: string,
  searchTerm: string
): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("touchbase_teachers")
    .select("*")
    .eq("org_id", orgId)
    .or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`
    )
    .order("last_name", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Error searching teachers:", error);
    throw error;
  }

  return (data || []) as Teacher[];
}
