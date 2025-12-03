// ============================================================
// TouchBase Academy - Class Modules Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Assign a module to a class
 */
export async function assignModuleToClass(
  supabase: SupabaseClient,
  classId: string,
  moduleId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_class_modules")
    .insert({
      class_id: classId,
      module_id: moduleId,
    });

  if (error) throw error;
}

/**
 * Unassign a module from a class
 */
export async function unassignModuleFromClass(
  supabase: SupabaseClient,
  classId: string,
  moduleId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_class_modules")
    .delete()
    .eq("class_id", classId)
    .eq("module_id", moduleId);

  if (error) throw error;
}

/**
 * Get modules assigned to a class
 */
export async function getClassModules(
  supabase: SupabaseClient,
  classId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("touchbase_class_modules")
    .select("module_id")
    .eq("class_id", classId);

  if (error) throw error;
  return (data || []).map((row) => row.module_id);
}

