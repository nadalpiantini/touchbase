// ============================================================
// TouchBase Academy - Progress Tracking Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { ModuleProgress, ProgressStatus, StepProgress } from "@/lib/types/education";

/**
 * Get user's progress for a module
 */
export async function getModuleProgress(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string
): Promise<ModuleProgress | null> {
  const { data, error } = await supabase
    .from("touchbase_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  if (!data) return null;
  return data as ModuleProgress;
}

/**
 * Get all progress for a user
 */
export async function getUserProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ModuleProgress[]> {
  const { data, error } = await supabase
    .from("touchbase_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ModuleProgress[];
}

/**
 * Start module progress
 */
export async function startModuleProgress(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  totalSteps: number
): Promise<ModuleProgress> {
  const stepProgress: StepProgress[] = Array(totalSteps)
    .fill(null)
    .map((_, i) => ({
      stepId: `step-${i}`,
      type: "content" as const,
      completed: false,
      timeSpentSeconds: 0,
    }));

  const { data, error } = await supabase
    .from("touchbase_progress")
    .insert({
      user_id: userId,
      module_id: moduleId,
      status: "in_progress",
      completion_percentage: 0,
      total_time_seconds: 0,
      step_progress: stepProgress,
      started_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as ModuleProgress;
}

/**
 * Update step progress
 */
export async function updateStepProgress(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  stepIndex: number,
  stepData: Partial<StepProgress>
): Promise<void> {
  // Get current progress
  const progress = await getModuleProgress(supabase, userId, moduleId);
  if (!progress) {
    throw new Error("Progress not found");
  }

  // Update step
  const updatedSteps = [...(progress.step_progress || [])];
  if (updatedSteps[stepIndex]) {
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      ...stepData,
    };
  }

  // Calculate completion percentage
  const completedSteps = updatedSteps.filter((s) => s.completed).length;
  const completionPercentage = Math.round(
    (completedSteps / updatedSteps.length) * 100
  );

  // Update status
  let status: ProgressStatus = progress.status;
  if (completionPercentage === 100) {
    status = "completed";
  } else if (completionPercentage > 0) {
    status = "in_progress";
  }

  // Update progress
  const { error } = await supabase
    .from("touchbase_progress")
    .update({
      step_progress: updatedSteps,
      completion_percentage: completionPercentage,
      status,
      last_accessed_at: new Date().toISOString(),
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("user_id", userId)
    .eq("module_id", moduleId);

  if (error) throw error;
}

/**
 * Update time spent
 */
export async function updateTimeSpent(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  additionalSeconds: number
): Promise<void> {
  const progress = await getModuleProgress(supabase, userId, moduleId);
  if (!progress) return;

  const { error } = await supabase
    .from("touchbase_progress")
    .update({
      total_time_seconds: (progress.total_time_seconds || 0) + additionalSeconds,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("module_id", moduleId);

  if (error) throw error;
}

