// ============================================================
// TouchBase Academy - Modules Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Module, ModuleStep, ModuleDifficulty, StepType } from "@/lib/types/education";

/**
 * Create a new module
 */
export async function createModule(
  supabase: SupabaseClient,
  userId: string,
  data: {
    title: string;
    description?: string;
    skills: string[];
    difficulty: ModuleDifficulty;
    duration_minutes: number;
  }
): Promise<Module> {
  const { data: newModule, error } = await supabase
    .from("touchbase_modules")
    .insert({
      created_by: userId,
      title: data.title,
      description: data.description,
      skills: data.skills,
      difficulty: data.difficulty,
      duration_minutes: data.duration_minutes,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return newModule as Module;
}

/**
 * Get all active modules
 */
export async function getActiveModules(
  supabase: SupabaseClient,
  filters?: {
    difficulty?: ModuleDifficulty;
    skills?: string[];
  }
): Promise<Module[]> {
  let query = supabase
    .from("touchbase_modules")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Module[];
}

/**
 * Get module by ID with steps
 */
export async function getModuleWithSteps(
  supabase: SupabaseClient,
  moduleId: string
): Promise<{ module: Module; steps: ModuleStep[] } | null> {
  const { data: module, error: moduleError } = await supabase
    .from("touchbase_modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (moduleError || !module) {
    if (moduleError?.code === "PGRST116") return null;
    throw moduleError;
  }

  const { data: steps, error: stepsError } = await supabase
    .from("touchbase_module_steps")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

  if (stepsError) throw stepsError;

  return {
    module: module as Module,
    steps: (steps || []) as ModuleStep[],
  };
}

/**
 * Add step to module
 */
export async function addModuleStep(
  supabase: SupabaseClient,
  moduleId: string,
  data: {
    order_index: number;
    step_type: StepType;
    content_data: Record<string, unknown>;
  }
): Promise<ModuleStep> {
  const { data: step, error } = await supabase
    .from("touchbase_module_steps")
    .insert({
      module_id: moduleId,
      order_index: data.order_index,
      step_type: data.step_type,
      content_data: data.content_data,
    })
    .select()
    .single();

  if (error) throw error;
  return step as ModuleStep;
}

/**
 * Update module step
 */
export async function updateModuleStep(
  supabase: SupabaseClient,
  stepId: string,
  updates: {
    content_data?: Record<string, unknown>;
    order_index?: number;
  }
): Promise<ModuleStep> {
  const { data, error } = await supabase
    .from("touchbase_module_steps")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stepId)
    .select()
    .single();

  if (error) throw error;
  return data as ModuleStep;
}

/**
 * Delete module step
 */
export async function deleteModuleStep(
  supabase: SupabaseClient,
  stepId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_module_steps")
    .delete()
    .eq("id", stepId);

  if (error) throw error;
}

/**
 * Update module
 */
export async function updateModule(
  supabase: SupabaseClient,
  moduleId: string,
  updates: Partial<Pick<Module, "title" | "description" | "skills" | "difficulty" | "duration_minutes" | "is_active">>
): Promise<Module> {
  const { data, error } = await supabase
    .from("touchbase_modules")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId)
    .select()
    .single();

  if (error) throw error;
  return data as Module;
}

